"use client";

import { useChat } from "ai/react";
import { differenceInHours, format } from "date-fns";

const SAMPLE = {
  trains: [
    {
      id: "result_1",
      departure: {
        cityName: "San Francisco",
        stationCode: "SFC",
        timestamp: "2024-05-19T18:00:00Z",
      },
      arrival: {
        cityName: "Rome",
        stationCode: "ROM",
        timestamp: "2024-05-20T14:30:00Z",
      },
      operators: ["Amtrak", "Eurostar"],
      priceInUSD: 120.5,
      numberOfStops: 1,
    },
    {
      id: "result_2",
      departure: {
        cityName: "San Francisco",
        stationCode: "SFC",
        timestamp: "2024-05-19T17:30:00Z",
      },
      arrival: {
        cityName: "Rome",
        stationCode: "ROM",
        timestamp: "2024-05-20T15:00:00Z",
      },
      operators: ["Caltrain"],
      priceInUSD: 135,
      numberOfStops: 0,
    },
    {
      id: "result_3",
      departure: {
        cityName: "San Francisco",
        stationCode: "SFC",
        timestamp: "2024-05-19T19:15:00Z",
      },
      arrival: {
        cityName: "Rome",
        stationCode: "ROM",
        timestamp: "2024-05-20T16:45:00Z",
      },
      operators: ["BART", "Trenitalia"],
      priceInUSD: 115.75,
      numberOfStops: 1,
    },
    {
      id: "result_4",
      departure: {
        cityName: "San Francisco",
        stationCode: "SFC",
        timestamp: "2024-05-19T16:30:00Z",
      },
      arrival: {
        cityName: "Rome",
        stationCode: "ROM",
        timestamp: "2024-05-20T13:50:00Z",
      },
      operators: ["ACE", "Iberia"],
      totalDurationInMinutes: 740,
      priceInUSD: 125.25,
      numberOfStops: 1,
    },
  ],
};

export function ListTrains({
  trainId,
  results,
}: {
  trainId: string;
  results?: typeof SAMPLE;
}) {
  const { append } = useChat({
    id: trainId,
    body: { id: trainId },
    maxSteps: 5,
  });

  const safeResults = results && results.trains ? results : SAMPLE;

  return (
    <div className="rounded-lg bg-muted px-4 py-1.5 flex flex-col">
      {safeResults.trains.map((train) => (
        <div
          key={train.id}
          className="cursor-pointer flex flex-row border-b dark:border-zinc-700 py-2 last-of-type:border-none group"
          onClick={() => {
            append({
              role: "user",
              content: `I would like to book the ${train.operators} one!`,
            });
          }}
        >
          <div className="flex flex-col w-full gap-0.5 justify-between">
            <div className="flex flex-row gap-0.5 text-base sm:text-base font-medium group-hover:underline">
              <div className="text">
                {format(new Date(train.departure.timestamp), "h:mm a")}
              </div>
              <div className="no-skeleton">–</div>
              <div className="text">
                {format(new Date(train.arrival.timestamp), "h:mm a")}
              </div>
            </div>
            <div className="text w-fit hidden sm:flex text-sm text-muted-foreground flex-row gap-2">
              <div>{train.operators.join(", ")}</div>
            </div>
            <div className="text sm:hidden text-xs sm:text-sm text-muted-foreground flex flex-row gap-2">
              {train.operators.length} stops
            </div>
          </div>

          <div className="flex flex-col gap-0.5 justify-between">
            <div className="flex flex-row gap-2">
              <div className="text-base sm:text-base">
                {differenceInHours(
                  new Date(train.arrival.timestamp),
                  new Date(train.departure.timestamp),
                )}{" "}
                hr
              </div>
            </div>
            <div className="text-xs sm:text-sm text-muted-foreground flex flex-row">
              <div>{train.departure.stationCode}</div>
              <div>–</div>
              <div>{train.arrival.stationCode}</div>
            </div>
          </div>

          <div className="flex flex-col w-32 items-end gap-0.5">
            <div className="flex flex-row gap-2">
              <div className="text-base sm:text-base text-emerald-600 dark:text-emerald-500">
                ${train.priceInUSD}
              </div>
            </div>
            <div className="text-xs sm:text-sm text-muted-foreground flex flex-row">
              Round Trip
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
