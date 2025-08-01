"use client";

import { useChat } from "ai/react";
import { differenceInHours, format } from "date-fns";

const SAMPLE = {
  trains: [
    {
      id: "italy_1",
      departure: {
        cityName: "Rome",
        stationCode: "ROMA",
        timestamp: "2025-07-31T08:00:00Z",
      },
      arrival: {
        cityName: "Florence",
        stationCode: "FI",
        timestamp: "2025-07-31T09:30:00Z",
      },
      operators: ["Trenitalia", "Italo"],
      priceInUSD: 49.99,
      numberOfStops: 0,
    },
    {
      id: "italy_2",
      departure: {
        cityName: "Milan",
        stationCode: "MILANO",
        timestamp: "2025-07-31T10:00:00Z",
      },
      arrival: {
        cityName: "Venice",
        stationCode: "VENEZIA",
        timestamp: "2025-07-31T12:30:00Z",
      },
      operators: ["Trenitalia"],
      priceInUSD: 59.99,
      numberOfStops: 1,
    },
    {
      id: "italy_3",
      departure: {
        cityName: "Florence",
        stationCode: "FI",
        timestamp: "2025-07-31T13:00:00Z",
      },
      arrival: {
        cityName: "Pisa",
        stationCode: "PISA",
        timestamp: "2025-07-31T14:00:00Z",
      },
      operators: ["Trenitalia"],
      priceInUSD: 19.99,
      numberOfStops: 0,
    },
    {
      id: "italy_4",
      departure: {
        cityName: "Rome",
        stationCode: "ROMA",
        timestamp: "2025-07-31T15:00:00Z",
      },
      arrival: {
        cityName: "Venice",
        stationCode: "VENEZIA",
        timestamp: "2025-07-31T18:30:00Z",
      },
      operators: ["Italo"],
      priceInUSD: 69.99,
      numberOfStops: 2,
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

  // Precompute formatted times and durations to avoid hydration mismatch
  const trainsWithComputed = safeResults.trains.map((train) => {
    const departureDate = new Date(train.departure.timestamp);
    const arrivalDate = new Date(train.arrival.timestamp);
    // Use UTC to avoid locale/timezone mismatch
    const formattedDeparture = departureDate.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: true, timeZone: 'UTC' });
    const formattedArrival = arrivalDate.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: true, timeZone: 'UTC' });
    const durationHr = Math.round((arrivalDate.getTime() - departureDate.getTime()) / (1000 * 60 * 60));
    return {
      ...train,
      formattedDeparture,
      formattedArrival,
      durationHr,
    };
  });

  return (
    <div className="rounded-lg bg-muted px-4 py-1.5 flex flex-col">
      {trainsWithComputed.map((train) => (
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
                {train.formattedDeparture}
              </div>
              <div className="no-skeleton">–</div>
              <div className="text">
                {train.formattedArrival}
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
                {train.durationHr} hr
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
