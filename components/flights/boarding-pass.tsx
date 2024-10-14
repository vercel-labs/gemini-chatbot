import { format } from "date-fns";
import { FlashlightIcon, PlaneTakeoffIcon } from "lucide-react";

const SAMPLE = {
  reservationId: "RES123456",
  flightNumber: "DL1",
  seat: "1C",
  departure: {
    cityName: "London",
    airportCode: "LHR",
    airportName: "Heathrow Airport",
    timestamp: "2023-11-01T09:00:00Z",
    terminal: "5",
    gate: "A10",
  },
  arrival: {
    cityName: "New York City",
    airportCode: "JFK",
    airportName: "John F. Kennedy International Airport",
    timestamp: "2023-11-01T12:00:00Z",
    terminal: "4",
    gate: "B22",
  },
  passengerName: "John Doe",
};

export function DisplayBoardingPass({ boardingPass = SAMPLE }) {
  return (
    <div className="bg-yellow-200 p-4 rounded-lg flex flex-col gap-2">
      <div className="flex flex-row justify-between items-center relative">
        <div className="flex flex-col gap-0.5">
          <div className="text-yellow-800 text-sm sm:text-base">
            {boardingPass.departure.cityName}
          </div>
          <div className="text-yellow-800 text-2xl sm:text-3xl font-semibold">
            {boardingPass.departure.airportCode}
          </div>
        </div>

        <div className="absolute w-full flex flex-row justify-center">
          <div className="text-amber-800">
            <PlaneTakeoffIcon />
          </div>
        </div>

        <div className="flex flex-col gap-0.5">
          <div className="text-yellow-800 text-sm sm:text-base">
            {boardingPass.arrival.cityName}
          </div>
          <div className="text-yellow-800 text-2xl sm:text-3xl font-semibold text-right">
            {boardingPass.arrival.airportCode}
          </div>
        </div>
      </div>

      <div className="h-px grow bg-yellow-600/20" />

      <div className="flex flex-row justify-between">
        <div className="flex flex-col gap-0.5">
          <div className="text-yellow-900 text-sm font-medium sm:text-base">
            Passenger
          </div>
          <div className="text-lg text-yellow-700">
            {boardingPass.passengerName}
          </div>
        </div>

        <div className="flex flex-col gap-0.5">
          <div className="text-yellow-900 text-sm font-medium sm:text-base">
            Gate
          </div>
          <div className="text-lg text-yellow-700">
            {boardingPass.departure.gate}
          </div>
        </div>

        <div className="flex flex-col gap-0.5">
          <div className="text-yellow-900 text-sm font-medium sm:text-base">
            Boards
          </div>
          <div className="text-lg text-yellow-700">
            {format(new Date(boardingPass.departure.timestamp), "h:mma")}
          </div>
        </div>
      </div>
    </div>
  );
}
