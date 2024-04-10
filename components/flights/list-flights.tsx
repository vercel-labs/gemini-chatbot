'use client'

/* eslint-disable jsx-a11y/alt-text */
/* eslint-disable @next/next/no-img-element */

import { useActions, useUIState } from 'ai/rsc'

interface Flight {
  id: number
  airlines: string
  departureTime: string
  arrivalTime: string
  price: number
}

interface ListFlightsProps {
  summary: {
    arrivalCity: string
    departingCity: string
    arrivalAirport: string
    departingAirport: string
    date: string
  }
}

export const ListFlights = ({
  summary = {
    arrivalCity: 'San Francisco',
    departingCity: 'New York City',
    arrivalAirport: 'SFO',
    departingAirport: 'JFK',
    date: '2021-12-25'
  }
}: ListFlightsProps) => {
  const { arrivalCity, departingCity, arrivalAirport, departingAirport, date } =
    summary
  const { submitUserMessage } = useActions()
  const [_, setMessages] = useUIState()

  const flights = [
    {
      id: 1,
      airlines: 'United Airlines',
      departureTime: '8:30 PM',
      arrivalTime: '4:20 PM+1',
      price: 531
    },
    {
      id: 2,
      airlines: 'United Airlines',
      departureTime: '2:40 PM',
      arrivalTime: '10:25 AM+1',
      price: 564
    },
    {
      id: 3,
      airlines: 'United Airlines',
      departureTime: '3:00 PM',
      arrivalTime: '10:50 AM+1',
      price: 611
    }
  ]

  return (
    <div className="grid gap-2 rounded-2xl border border-zinc-200 bg-white p-2 sm:p-4">
      <div className="grid gap-2 sm:flex sm:flex-row justify-between border-b p-2">
        <div className="sm:basis-1/4">
          <div className="text-xs text-zinc-600">Departure</div>
          <div className="font-medium">{departingCity}</div>
        </div>
        <div className="sm:basis-1/4">
          <div className="text-xs text-zinc-600">Arrival</div>
          <div className="font-medium">{arrivalCity}</div>
        </div>
        <div className="sm:basis-1/2">
          <div className="sm:text-right text-xs text-zinc-600">Date</div>
          <div className="sm:text-right font-medium">{date}</div>
        </div>
      </div>
      <div className="grid gap-3">
        {flights &&
          flights.map(flight => (
            <div
              key={flight.id}
              className="flex cursor-pointer flex-row items-start sm:items-center gap-4 rounded-xl p-2 hover:bg-zinc-50"
              onClick={async () => {
                const response = await submitUserMessage(
                  `The user has selected flight ${flight.airlines}, departing at ${flight.departureTime} and arriving at ${flight.arrivalTime} for $${flight.price}. Now proceeding to select seats.`
                )
                setMessages((currentMessages: any[]) => [
                  ...currentMessages,
                  response
                ])
              }}
            >
              <div className="w-10 sm:w-12 shrink-0 aspect-square rounded-lg bg-zinc-50 overflow-hidden">
                <img
                  src="https://www.gstatic.com/flights/airline_logos/70px/UA.png"
                  className="object-cover aspect-square"
                  alt="airline logo"
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-4 items-start sm:gap-6 flex-1">
                <div className="col-span-2">
                  <div className="font-medium">
                    {flight.departureTime} - {flight.arrivalTime}
                  </div>
                  <div className="text-sm text-zinc-600">{flight.airlines}</div>
                </div>
                <div>
                  <div className="font-medium">
                    {flight.id === 2 ? '10hr 50min' : '10hr 45min'}
                  </div>
                  <div className="text-sm text-zinc-600">
                    {departingAirport} - {arrivalAirport}
                  </div>
                </div>
                <div>
                  <div className="sm:text-right font-medium font-mono">
                    ${flight.price}
                  </div>
                  <div className="sm:text-right text-xs text-zinc-600">
                    One Way
                  </div>
                </div>
              </div>
            </div>
          ))}
      </div>
    </div>
  )
}
