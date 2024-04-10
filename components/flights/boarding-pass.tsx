'use client'

/* eslint-disable @next/next/no-img-element */
import Barcode from 'react-jsbarcode'

interface BoardingPassProps {
  summary: {
    airline: string
    arrival: string
    departure: string
    departureTime: string
    arrivalTime: string
    price: number
    seat: string
    date: string
    gate: string
  }
}

export const BoardingPass = ({
  summary = {
    airline: 'American Airlines',
    arrival: 'SFO',
    departure: 'NYC',
    departureTime: '10:00 AM',
    arrivalTime: '12:00 PM',
    price: 100,
    seat: '1A',
    date: '2021-12-25',
    gate: '31'
  }
}: BoardingPassProps) => {
  return (
    <div className="grid gap-4 p-4 sm:p-6 border border-zinc-200 rounded-2xl bg-white">
      <div className="flex gap-4 items-start">
        <div className="w-10 sm:w-12 shrink-0 aspect-square rounded-lg bg-zinc-50 overflow-hidden">
          <img
            src="https://www.gstatic.com/flights/airline_logos/70px/UA.png"
            className="object-cover aspect-square"
            alt="airline logo"
          />
        </div>
        <div className="">
          <div className="font-medium text-lg">{summary.airline}</div>
          <div className="text-sm">
            {summary.departure} - {summary.arrival}
          </div>
        </div>
        <div className="ml-auto text-center">
          <div className="text-xs text-zinc-600 uppercase">Gate</div>
          <div className="text-2xl font-mono">{summary.gate}</div>
        </div>
      </div>
      <div className="grid gap-1 p-4 rounded-xl bg-zinc-50">
        <div className="font-medium text-lg">Rauch / Guillermo</div>
        <div className="flex text-sm justify-between">
          <div>{summary.departure}</div>
          <div className="">{summary.date}</div>
          <div className="">{summary.arrival}</div>
        </div>
      </div>
      <div className="flex flex-col gap-2 md:flex-row">
        <div className="px-4 py-3 rounded-xl bg-zinc-50 grid gap-1">
          <div className="text-xs text-zinc-600 uppercase">Seat</div>
          <div className="text-2xl font-mono leading-none">{summary.seat}</div>
        </div>
        <div className="px-4 py-3 rounded-xl bg-zinc-50 flex-1 grid gap-1">
          <div className="text-xs text-zinc-600 uppercase">Class</div>
          <div className="text-xl leading-none">BUSINESS</div>
        </div>
        <div className="px-4 py-3 rounded-xl bg-zinc-50 grid gap-1">
          <div className="text-xs text-zinc-600 uppercase">Departs</div>
          <div className="text-xl leading-none">{summary.departureTime}</div>
        </div>
        <div className="px-4 py-3 rounded-xl bg-zinc-50 grid gap-1">
          <div className="text-xs text-zinc-600 uppercase">Arrival</div>
          <div className="text-xl leading-none">{summary.arrivalTime}</div>
        </div>
      </div>
      <div className="hidden sm:flex">
        <Barcode
          value="12345RAUCHG"
          options={{ format: 'code128', height: 20, displayValue: false }}
        />
      </div>
    </div>
  )
}
