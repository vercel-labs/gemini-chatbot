import { format } from "date-fns";
import { FlashlightIcon } from "lucide-react";

const SAMPLE = {
  reservationId: "RES123456",
  trainNumber: "TR1",
  seat: "1C",
  departure: {
    cityName: "London",
    stationCode: "LDN",
    stationName: "London Central Station",
    timestamp: "2023-11-01T09:00:00Z",
    platform: "5",
    gate: "A10",
  },
  arrival: {
    cityName: "Manchester",
    stationCode: "MAN",
    stationName: "Manchester Piccadilly",
    timestamp: "2023-11-01T12:00:00Z",
    platform: "4",
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
            {boardingPass.departure.stationCode}
          </div>
        </div>

        <div className="absolute w-full flex flex-row justify-center">
          <div className="text-amber-800">
            <FlashlightIcon />
          </div>
        </div>

        <div className="flex flex-col gap-0.5">
          <div className="text-yellow-800 text-sm sm:text-base">
            {boardingPass.arrival.cityName}
          </div>
          <div className="text-yellow-800 text-2xl sm:text-3xl font-semibold text-right">
            {boardingPass.arrival.stationCode}
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
            Platform
          </div>
          <div className="text-lg text-yellow-700">
            {boardingPass.departure.platform}
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
