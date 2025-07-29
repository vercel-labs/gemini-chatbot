import { convertToCoreMessages, Message, streamText } from "ai";
import { z } from "zod";

import { geminiProModel } from "@/ai";
import {
  generateReservationPrice,
  generateSampleTrainSearchResults,
  generateSampleTrainStatus,
  generateSampleSeatSelection,
} from "@/ai/actions";
import { auth } from "@/app/(auth)/auth";
import {
  createReservation,
  deleteChatById,
  getChatById,
  getReservationById,
  saveChat,
} from "@/db/queries";
import { generateUUID } from "@/lib/utils";

export async function POST(request: Request) {
  const { id, messages }: { id: string; messages: Array<Message> } =
    await request.json();

  const session = await auth();

  if (!session) {
    return new Response("Unauthorized", { status: 401 });
  }

  const coreMessages = convertToCoreMessages(messages).filter(
    (message) => message.content.length > 0,
  );

  const result = await streamText({
    model: geminiProModel,
    system: `
        - you help users book trains!
        - keep your responses limited to a sentence.
        - DO NOT output lists.
        - after every tool call, pretend you're showing the result to the user and keep your response limited to a phrase.
        - today's date is ${new Date().toLocaleDateString()}.
        - ask follow up questions to nudge user into the optimal flow
        - ask for any details you don't know, like name of passenger, etc.'
        - C and D are aisle seats, A and F are window seats, B and E are middle seats
        - assume the most popular stations for the origin and destination
        - here's the optimal flow
          - search for trains
          - choose train
          - select seats
          - create reservation (ask user whether to proceed with payment or change reservation; if details are complete, prompt user to confirm and proceed to payment)
          - authorize payment (requires user consent, wait for user to finish payment and let you know when done)
          - display boarding pass (DO NOT display boarding pass without verifying payment)
        '
      `,
    messages: coreMessages,
    tools: {
      getWeather: {
        description: "Get the current weather at a location",
        parameters: z.object({
          latitude: z.number().describe("Latitude coordinate"),
          longitude: z.number().describe("Longitude coordinate"),
        }),
        execute: async ({ latitude, longitude }) => {
          const response = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m&hourly=temperature_2m&daily=sunrise,sunset&timezone=auto`,
          );

          const weatherData = await response.json();
          return weatherData;
        },
      },
      displayTrainStatus: {
        description: "Display the status of a train",
        parameters: z.object({
          trainNumber: z.string().describe("Train number"),
          date: z.string().describe("Date of the train"),
        }),
        execute: async ({ trainNumber, date }) => {
          console.log('[displayTrainStatus] start', { trainNumber, date });
          const trainStatus = await generateSampleTrainStatus({
            trainNumber,
            date,
          });
          console.log('[displayTrainStatus] end', trainStatus);
          return trainStatus;
        },
      },
      searchTrains: {
        description: "Search for trains based on the given parameters",
        parameters: z.object({
          origin: z.string().describe("Origin station or city"),
          destination: z.string().describe("Destination station or city"),
        }),
        execute: async ({ origin, destination }) => {
          console.log('[searchTrains] start', { origin, destination });
          const results = await generateSampleTrainSearchResults({
            origin,
            destination,
          });
          console.log('[searchTrains] end', results);
          return results;
        },
      },
      selectSeats: {
        description: "Select seats for a train",
        parameters: z.object({
          trainNumber: z.string().describe("Train number"),
        }),
        execute: async ({ trainNumber }) => {
          console.log('[selectSeats] start', { trainNumber });
          const seats = await generateSampleSeatSelection({ trainNumber });
          console.log('[selectSeats] end', seats);
          return seats;
        },
      },
      createReservation: {
        description: "Display pending train reservation details",
        parameters: z.object({
          seats: z.string().array().describe("Array of selected seat numbers"),
          trainNumber: z.string().describe("Train number"),
          departure: z.object({
            cityName: z.string().describe("Name of the departure city"),
            stationCode: z.string().describe("Code of the departure station"),
            timestamp: z.string().describe("ISO 8601 date of departure"),
            gate: z.string().describe("Departure gate"),
            platform: z.string().describe("Departure platform"),
          }),
          arrival: z.object({
            cityName: z.string().describe("Name of the arrival city"),
            stationCode: z.string().describe("Code of the arrival station"),
            timestamp: z.string().describe("ISO 8601 date of arrival"),
            gate: z.string().describe("Arrival gate"),
            platform: z.string().describe("Arrival platform"),
          }),
          passengerName: z.string().describe("Name of the passenger"),
        }),
        execute: async (props) => {
          console.log('[createReservation] start', props);
          const { totalPriceInUSD } = await generateReservationPrice(props);
          const session = await auth();

          const id = generateUUID();

          if (session && session.user && session.user.id) {
            await createReservation({
              id,
              userId: session.user.id,
              details: { ...props, totalPriceInUSD },
            });
            console.log('[createReservation] end', { id, ...props, totalPriceInUSD });
            // Immediately prompt for payment after reservation creation
            return {
              id,
              ...props,
              totalPriceInUSD,
              nextTool: {
                name: "authorizePayment",
                parameters: { reservationId: id },
              },
            };
          } else {
            console.log('[createReservation] error: not signed in');
            return {
              error: "User is not signed in to perform this action!",
            };
          }
        },
      },
      authorizePayment: {
        description:
          "User will enter credentials to authorize payment, wait for user to repond when they are done",
        parameters: z.object({
          reservationId: z
            .string()
            .describe("Unique identifier for the reservation"),
        }),
        execute: async ({ reservationId }) => {
          console.log('[authorizePayment] start', { reservationId });
          return { reservationId };
        },
      },
      verifyPayment: {
        description: "Verify payment status",
        parameters: z.object({
          reservationId: z
            .string()
            .describe("Unique identifier for the reservation"),
        }),
        execute: async ({ reservationId }) => {
          console.log('[verifyPayment] start', { reservationId });
          const reservation = await getReservationById({ id: reservationId });
          console.log('[verifyPayment] reservation', reservation);
          if (reservation.hasCompletedPayment) {
            return { hasCompletedPayment: true };
          } else {
            return { hasCompletedPayment: false };
          }
        },
      },
      displayBoardingPass: {
        description: "Display a train boarding pass",
        parameters: z.object({
          reservationId: z
            .string()
            .describe("Unique identifier for the reservation"),
          passengerName: z
            .string()
            .describe("Name of the passenger, in title case"),
          trainNumber: z.string().describe("Train number"),
          seat: z.string().describe("Seat number"),
          departure: z.object({
            cityName: z.string().describe("Name of the departure city"),
            stationCode: z.string().describe("Code of the departure station"),
            stationName: z.string().describe("Name of the departure station"),
            timestamp: z.string().describe("ISO 8601 date of departure"),
            platform: z.string().describe("Departure platform"),
            gate: z.string().describe("Departure gate"),
          }),
          arrival: z.object({
            cityName: z.string().describe("Name of the arrival city"),
            stationCode: z.string().describe("Code of the arrival station"),
            stationName: z.string().describe("Name of the arrival station"),
            timestamp: z.string().describe("ISO 8601 date of arrival"),
            platform: z.string().describe("Arrival platform"),
            gate: z.string().describe("Arrival gate"),
          }),
        }),
        execute: async (boardingPass) => {
          console.log('[displayBoardingPass] start', boardingPass);
          return boardingPass;
        },
      },
    },
    onFinish: async ({ responseMessages }) => {
      if (session.user && session.user.id) {
        try {
          await saveChat({
            id,
            messages: [...coreMessages, ...responseMessages],
            userId: session.user.id,
          });
        } catch (error) {
          console.error("Failed to save chat");
        }
      }
    },
    experimental_telemetry: {
      isEnabled: true,
      functionId: "stream-text",
    },
  });

  return result.toDataStreamResponse({});
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return new Response("Not Found", { status: 404 });
  }

  const session = await auth();

  if (!session || !session.user) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    const chat = await getChatById({ id });

    if (chat.userId !== session.user.id) {
      return new Response("Unauthorized", { status: 401 });
    }

    await deleteChatById({ id });

    return new Response("Chat deleted", { status: 200 });
  } catch (error) {
    return new Response("An error occurred while processing your request", {
      status: 500,
    });
  }
}
