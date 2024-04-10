'use client'

/* eslint-disable jsx-a11y/alt-text */
/* eslint-disable @next/next/no-img-element */
import { useActions, useUIState } from 'ai/rsc'
import {
  ArrowDownRight,
  ArrowUpRight,
  CheckIcon,
  IconCheck,
  IconStop,
  SparklesIcon
} from '@/components/ui/icons'

export interface StatusProps {
  summary: {
    departingCity: string
    departingAirport: string
    departingAirportCode: string
    departingTime: string
    arrivalCity: string
    arrivalAirport: string
    arrivalAirportCode: string
    arrivalTime: string
    flightCode: string
    date: string
  }
}

export const suggestions = [
  'Change my seat',
  'Change my flight',
  'Show boarding pass'
]

export const FlightStatus = ({
  summary = {
    departingCity: 'Miami',
    departingAirport: 'Miami Intl',
    departingAirportCode: 'MIA',
    departingTime: '11:45 PM',
    arrivalCity: 'San Francisco',
    arrivalAirport: 'San Francisco Intl',
    arrivalAirportCode: 'SFO',
    arrivalTime: '4:20 PM',
    flightCode: 'XY 2421',
    date: 'Mon, 16 Sep'
  }
}: StatusProps) => {
  const {
    departingCity,
    departingAirport,
    departingAirportCode,
    departingTime,
    arrivalCity,
    arrivalAirport,
    arrivalAirportCode,
    arrivalTime,
    flightCode,
    date
  } = summary

  const { submitUserMessage } = useActions()
  const [_, setMessages] = useUIState()

  return (
    <div className="grid gap-4">
      <div className="grid gap-4 p-4 sm:p-6 border border-zinc-200 rounded-2xl bg-white">
        <div className="flex items-center gap-4">
          <div className="w-10 sm:w-12 shrink-0 aspect-square rounded-lg bg-zinc-50 overflow-hidden">
            <img
              src="https://www.gstatic.com/flights/airline_logos/70px/UA.png"
              className="object-cover aspect-square"
              alt="airline logo"
            />
          </div>
          <div>
            <div className="font-medium">
              {date} · {flightCode}
            </div>
            <div className="text-sm text-zinc-600">
              {departingCity} to {arrivalCity}
            </div>
          </div>
        </div>
        <div className="grid items-center gap-8 relative">
          <div className="w-px h-full absolute top-1 left-[1.1rem] sm:left-[1.45rem] bg-zinc-200" />
          <div className="flex w-full relative gap-4 pl-2 sm:pl-3.5 items-start">
            <div className="rounded-full bg-zinc-200 p-1 text-zinc-500 [&>svg]:size-2.5 size-5 flex items-center justify-center shrink-0 translate-y-1">
              <ArrowUpRight />
            </div>
            <div>
              <div className="text-2xl font-medium">{departingAirportCode}</div>
              <div>{departingAirport}</div>
              <div className="text-sm text-zinc-600">Terminal N · GATE D43</div>
            </div>
            <div className="ml-auto font-mono">
              <div className="text-lg md:text-xl">{departingTime}</div>
              <div className="text-sm text-zinc-600">in 6h 50m</div>
              <div className="text-red-600 text-sm font-medium">
                2h 15m late
              </div>
            </div>
          </div>
          <div className="flex w-full relative gap-4 pl-2 sm:pl-3.5 min-h-10 items-center">
            <div className="rounded-full bg-zinc-200 p-1 text-zinc-500 [&>svg]:size-2.5 size-5 flex items-center justify-center shrink-0">
              <IconCheck />
            </div>
            <div className="text-sm sm:text-base text-zinc-600">
              Total 11h 30m · 5, 563mi · Overnight
            </div>
          </div>
          <div className="flex w-full relative gap-4 pl-2 sm:pl-3.5 items-start">
            <div className="rounded-full bg-zinc-200 p-1 text-zinc-500 [&>svg]:size-2.5 size-5 flex items-center justify-center shrink-0 translate-y-1">
              <ArrowDownRight />
            </div>
            <div>
              <div className="text-2xl font-medium">{arrivalAirportCode}</div>
              <div>{arrivalAirport}</div>
              <div className="text-sm text-zinc-600">Terminal 2 · GATE 59A</div>
            </div>
            <div className="ml-auto font-mono">
              <div className="text-lg md:text-xl">{arrivalTime}</div>
              <div className="text-red-600 text-sm font-medium">
                2h 15m late
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="flex flex-col sm:flex-row items-start gap-2">
        {suggestions.map(suggestion => (
          <div
            key={suggestion}
            className="flex items-center gap-2 px-3 py-2 text-sm transition-colors bg-zinc-50 hover:bg-zinc-100 rounded-xl cursor-pointer"
            onClick={async () => {
              const response = await submitUserMessage(suggestion)
              setMessages((currentMessages: any[]) => [
                ...currentMessages,
                response
              ])
            }}
          >
            <SparklesIcon />
            {suggestion}
          </div>
        ))}
      </div>
    </div>
  )
}
