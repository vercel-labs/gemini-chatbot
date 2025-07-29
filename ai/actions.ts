import { generateObject } from "ai";
import { z } from "zod";

import { geminiFlashModel } from ".";

export async function generateSampleTrainStatus({
  trainNumber,
  date,
}: {
  trainNumber: string;
  date: string;
}) {
  const { object: trainStatus } = await generateObject({
    model: geminiFlashModel,
    prompt: `Train status for train number ${trainNumber} on ${date}`,
    schema: z.object({
      trainNumber: z.string().describe("Train number, e.g., TR123, ICE31"),
      departure: z.object({
        cityName: z.string().describe("Name of the departure city"),
        stationCode: z.string().describe("Code of the departure station"),
        stationName: z.string().describe("Full name of the departure station"),
        timestamp: z.string().describe("ISO 8601 departure date and time"),
        platform: z.string().describe("Departure platform"),
        gate: z.string().describe("Departure gate"),
      }),
      arrival: z.object({
        cityName: z.string().describe("Name of the arrival city"),
        stationCode: z.string().describe("Code of the arrival station"),
        stationName: z.string().describe("Full name of the arrival station"),
        timestamp: z.string().describe("ISO 8601 arrival date and time"),
        platform: z.string().describe("Arrival platform"),
        gate: z.string().describe("Arrival gate"),
      }),
      totalDistanceInMiles: z
        .number()
        .describe("Total train distance in miles"),
    }),
  });

  return trainStatus;
}

export async function generateSampleTrainSearchResults({
  origin,
  destination,
}: {
  origin: string;
  destination: string;
}) {
  const { object: trainSearchResults } = await generateObject({
    model: geminiFlashModel,
    prompt: `Generate search results for trains from ${origin} to ${destination}, limit to 4 results`,
    output: "array",
    schema: z.object({
      id: z
        .string()
        .describe("Unique identifier for the train, like TR123, ICE31, etc."),
      departure: z.object({
        cityName: z.string().describe("Name of the departure city"),
        stationCode: z.string().describe("Code of the departure station"),
        timestamp: z.string().describe("ISO 8601 departure date and time"),
      }),
      arrival: z.object({
        cityName: z.string().describe("Name of the arrival city"),
        stationCode: z.string().describe("Code of the arrival station"),
        timestamp: z.string().describe("ISO 8601 arrival date and time"),
      }),
      operators: z.array(
        z.string().describe("Train operator names, e.g., Amtrak, Eurostar"),
      ),
      priceInUSD: z.number().describe("Train price in US dollars"),
      numberOfStops: z.number().describe("Number of stops during the train journey"),
    }),
  });

  return { trains: trainSearchResults };
}

export async function generateSampleSeatSelection({
  trainNumber,
}: {
  trainNumber: string;
}) {
  const { object: rows } = await generateObject({
    model: geminiFlashModel,
    prompt: `Simulate available seats for train number ${trainNumber}, 6 seats on each row and 5 rows in total, adjust pricing based on location of seat`,
    output: "array",
    schema: z.array(
      z.object({
        seatNumber: z.string().describe("Seat identifier, e.g., 12A, 15C"),
        priceInUSD: z
          .number()
          .describe("Seat price in US dollars, less than $99"),
        isAvailable: z
          .boolean()
          .describe("Whether the seat is available for booking"),
      }),
    ),
  });

  return { seats: rows };
}

export async function generateReservationPrice(props: {
  seats: string[];
  trainNumber: string;
  departure: {
    cityName: string;
    stationCode: string;
    timestamp: string;
    gate: string;
    platform: string;
  };
  arrival: {
    cityName: string;
    stationCode: string;
    timestamp: string;
    gate: string;
    platform: string;
  };
  passengerName: string;
}) {
  const { object: reservation } = await generateObject({
    model: geminiFlashModel,
    prompt: `Generate price for the following train reservation \n\n ${JSON.stringify(props, null, 2)}`,
    schema: z.object({
      totalPriceInUSD: z
        .number()
        .describe("Total reservation price in US dollars"),
    }),
  });

  return reservation;
}
