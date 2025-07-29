import { differenceInHours, format } from "date-fns";

import { ArrowUpRightSmallIcon } from "../custom/icons";

const SAMPLE = {
  trainNumber: "ITALO9512",
  departure: {
    cityName: "Rome",
    stationCode: "ROMA",
    stationName: "Roma Termini",
    timestamp: "2025-07-31T08:00:00Z",
    platform: "12",
    gate: "A1",
  },
  arrival: {
    cityName: "Florence",
    stationCode: "FI",
    stationName: "Firenze SMN",
    timestamp: "2025-07-31T09:30:00Z",
    platform: "3",
    gate: "B3",
  },
  totalDistanceInMiles: 144,
};

export function Row({ row = SAMPLE.arrival, type = "arrival" }) {
  return (
    <div className="flex flex-row justify-between">
      <div className="flex flex-row">
        <div className="flex flex-col gap-1">
          <div className="flex flex-row gap-2 items-center">
            <div className="bg-foreground text-background rounded-full size-fit">
              {type === "arrival" ? (
                <div className="rotate-90">
                  <ArrowUpRightSmallIcon size={16} />
                </div>
              ) : (
                <ArrowUpRightSmallIcon size={16} />
              )}
            </div>
            <div className="text-sm sm:text-base text-muted-foreground">
              {row.stationCode}
            </div>
            <div>·</div>
            <div className="text-sm sm:text-base truncate max-w-32 sm:max-w-64 text-muted-foreground">
              {row.stationName}
            </div>
          </div>

          <div className="text-2xl sm:text-3xl font-medium">
            {format(new Date(row.timestamp), "h:mm a")}
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-1 items-end justify-center mt-auto">
        <div className="text-sm sm:text-sm bg-amber-400 rounded-md w-fit px-2 text-amber-900">
          {row.gate}
        </div>
        <div className="text-sm text-muted-foreground">
          Platform {row.platform}
        </div>
      </div>
    </div>
  );
}

export function TrainStatus({ trainStatus = SAMPLE }) {
  return (
    <div className="flex flex-col gap-2 bg-muted rounded-lg p-4">
      <div className="flex flex-col gap-1 text-sm">
        <div className="text-muted-foreground">{trainStatus.trainNumber}</div>
        <div className="text-lg font-medium">
          {trainStatus.departure.cityName} to {trainStatus.arrival.cityName}
        </div>
      </div>

      <div className="h-px grow bg-muted-foreground/20" />

      <Row row={trainStatus.arrival} type="departure" />

      <div className="flex flex-row gap-2 items-center">
        <div className="text-xs text-muted-foreground ">
          {differenceInHours(
            new Date(trainStatus.arrival.timestamp),
            new Date(trainStatus.departure.timestamp),
          )}{" "}
          hours
        </div>
        <div>·</div>
        <div className="text-xs text-muted-foreground">
          {trainStatus.totalDistanceInMiles} mi
        </div>
        <div className="h-px grow bg-muted-foreground/20 ml-2" />
      </div>

      <Row row={trainStatus.departure} type="arrival" />
    </div>
  );
}
