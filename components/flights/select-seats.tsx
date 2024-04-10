/* eslint-disable jsx-a11y/alt-text */
/* eslint-disable @next/next/no-img-element */
'use client'

import { useAIState, useActions, useUIState } from 'ai/rsc'
import { useState } from 'react'
import { SparklesIcon } from '../ui/icons'

interface SelectSeatsProps {
  summary: {
    departingCity: string
    arrivalCity: string
    flightCode: string
    date: string
  }
}

export const suggestions = [
  'Proceed to checkout',
  'List hotels and make a reservation'
]

export const SelectSeats = ({
  summary = {
    departingCity: 'New York City',
    arrivalCity: 'San Francisco',
    flightCode: 'CA123',
    date: '23 March 2024'
  }
}: SelectSeatsProps) => {
  const availableSeats = ['3B', '2D']
  const [aiState, setAIState] = useAIState()
  const [selectedSeat, setSelectedSeat] = useState('')
  const { departingCity, arrivalCity, flightCode, date } = summary
  const [_, setMessages] = useUIState()
  const { submitUserMessage } = useActions()

  return (
    <div className="grid gap-4">
      <p>
        Great! Here are the available seats for your flight. Please select a
        seat to continue.
      </p>
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
        <div className="relative flex w-ful p-4 sm:p-6 justify-center rounded-xl sm:rounded-lg bg-zinc-50">
          <div className="flex flex-col gap-4 p-4 border border-zinc-200 rounded-lg bg-zinc-50">
            {[4, 3, 2, 1].map((row, rowIndex) => (
              <div key={`row-${rowIndex}`} className="flex flex-row gap-3">
                {['A', 'B', 0, 'C', 'D'].map((seat, seatIndex) => (
                  <div
                    key={`seat-${seatIndex}`}
                    className={`align-center relative flex size-6 flex-row items-center justify-center rounded ${
                      seatIndex === 2
                        ? 'transparent'
                        : selectedSeat === `${row}${seat}`
                          ? 'cursor-pointer border-x border-b border-emerald-500 bg-emerald-300'
                          : availableSeats.includes(`${row}${seat}`)
                            ? 'cursor-pointer border-x border-b border-sky-500 bg-sky-200'
                            : 'cursor-not-allowed border-x border-b border-zinc-300 bg-zinc-200'
                    }`}
                    onClick={() => {
                      setSelectedSeat(`${row}${seat}`)

                      setAIState({
                        ...aiState,
                        interactions: [
                          `great, I have selected seat ${row}${seat}`
                        ]
                      })
                    }}
                  >
                    {seatIndex === 2 ? (
                      <div className="w-6 text-sm text-center tabular-nums text-zinc-500">
                        {row}
                      </div>
                    ) : (
                      <div
                        className={`absolute top-0 h-2 w-7 rounded border ${
                          selectedSeat === `${row}${seat}`
                            ? 'border-emerald-500 bg-emerald-300'
                            : availableSeats.includes(`${row}${seat}`)
                              ? 'border-sky-500 bg-sky-300'
                              : 'border-zinc-300 bg-zinc-200'
                        }`}
                      />
                    )}
                  </div>
                ))}
              </div>
            ))}
            <div className="flex gap-3">
              {['A', 'B', '', 'C', 'D'].map((seat, index) => (
                <div
                  key={index}
                  className="w-6 text-sm text-center shrink-0 text-zinc-500"
                >
                  {seat}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      {selectedSeat !== '' && (
        <div className="flex flex-col sm:flex-row items-start gap-2">
          {suggestions.map(suggestion => (
            <button
              key={suggestion}
              className="flex items-center gap-2 px-3 py-2 text-sm transition-colors bg-zinc-50 hover:bg-zinc-100 rounded-xl cursor-pointer"
              onClick={async () => {
                const response = await submitUserMessage(suggestion, [])
                setMessages((currentMessages: any[]) => [
                  ...currentMessages,
                  response
                ])
              }}
            >
              <SparklesIcon />
              {suggestion}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
