import { format } from "date-fns";

const SAMPLE = {
  seats: ["4C"],
  trainNumber: "TR413",
  departure: {
    cityName: "Sydney",
    stationCode: "SYD",
    timestamp: "2023-11-01T06:00:00",
    platform: "1",
    gate: "A12",
  },
  arrival: {
    cityName: "Chennai",
    stationCode: "MAA",
    timestamp: "2023-11-01T18:45:00",
    platform: "3",
    gate: "B5",
  },
  passengerName: "John Doe",
  totalPriceInUSD: 1200,
};

export function CreateReservation({ reservation = SAMPLE }) {
  return (
    <div className="rounded-lg bg-muted p-4">
      <div>
        <div className="flex flex-col justify-between gap-4">
          <div className="text font-medium">
            <span className="no-skeleton text-foreground/50">
              Continue purchasing this reservation from{" "}
            </span>
            {reservation.departure.cityName} to {reservation.arrival.cityName}
            <span className="no-skeleton text-foreground/50"> at </span>{" "}
            <span className="no-skeleton text-emerald-600 font-medium">
              ${reservation.totalPriceInUSD} USD
              <span className="no-skeleton text-foreground/50 ">?</span>
            </span>
          </div>

          <div className="flex flex-row gap-6">
            <div className="flex flex-col gap-1">
              <div className="text font-medium sm:text-base text-sm">Seats</div>
              <div className="text-muted-foreground sm:text-base text-sm">
                {reservation.seats.join(", ")}
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <div className="text sm:text-base text-sm font-medium">
                Train Number
              </div>
              <div className="text sm:text-base text-sm text-muted-foreground">
                {reservation.trainNumber}
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <div className="text font-medium sm:text-base text-sm">Date</div>
              <div className="text text-muted-foreground sm:text-base text-sm">
                {format(new Date(reservation.arrival.timestamp), "dd LLL yyyy")}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
