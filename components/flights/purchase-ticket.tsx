'use client'

import {
  CardIcon,
  GoogleIcon,
  LockIcon,
  SparklesIcon
} from '@/components/ui/icons'
import { readStreamableValue, useActions, useUIState } from 'ai/rsc'
import { useState } from 'react'

type Status =
  | 'requires_confirmation'
  | 'requires_code'
  | 'completed'
  | 'failed'
  | 'expired'
  | 'in_progress'

interface PurchaseProps {
  status: Status
  summary: {
    airline: string
    departureTime: string
    arrivalTime: string
    price: number
    seat: string
  }
}

export const suggestions = [
  'Show flight status',
  'Show boarding pass for flight'
]

export const PurchaseTickets = ({
  status = 'requires_confirmation',
  summary = {
    airline: 'American Airlines',
    departureTime: '10:00 AM',
    arrivalTime: '12:00 PM',
    price: 100,
    seat: '1A'
  }
}: PurchaseProps) => {
  const [currentStatus, setCurrentStatus] = useState(status)
  const { requestCode, validateCode, submitUserMessage } = useActions()
  const [display, setDisplay] = useState(null)
  const [_, setMessages] = useUIState()

  return (
    <div className="flex flex-col gap-4">
      <div
        className={`flex w-full flex-col gap-4 rounded-xl border bg-white p-4 font-medium dark:bg-zinc-950 dark:text-zinc-200`}
      >
        <div className="flex flex-row justify-between">
          <div className="flex flex-row items-center gap-2 text-zinc-950">
            <div className="p-1 bg-blue-100 rounded text-blue-500">
              <CardIcon />
            </div>
            <div className="text-sm text-zinc-500">Visa · · · · 0512</div>
          </div>

          <div className="text-sm flex flex-row items-center gap-1 border px-2 py-1 rounded-full">
            <GoogleIcon />
            Pay
          </div>
        </div>

        {currentStatus === 'requires_confirmation' ? (
          <div className="flex flex-col gap-4">
            <p className="">
              Thanks for choosing your flight and hotel reservations! Confirm
              your purchase to complete your booking.
            </p>
            <div
              className="p-2 text-center rounded-lg cursor-pointer bg-zinc-800 text-zinc-50 hover:bg-zinc-950 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
              onClick={async () => {
                const { status, display } = await requestCode()
                setCurrentStatus(status)
                setDisplay(display)
              }}
            >
              Pay $981
            </div>
          </div>
        ) : currentStatus === 'requires_code' ? (
          <>
            <div>
              Enter the code sent to your phone (***) *** 6137 to complete your
              purchase.
            </div>
            <div className="flex flex-row justify-center p-2 text-center border rounded-lg text-zinc-950">
              <input
                className="w-16 text-center bg-transparent outline-none tabular-nums dark:text-zinc-200"
                type="text"
                maxLength={6}
                placeholder="------"
                autoFocus
              />
            </div>
            <div
              className="p-2 text-center rounded-lg cursor-pointer bg-zinc-800 text-zinc-50 hover:bg-zinc-950 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
              onClick={async () => {
                const { status, display } = await validateCode()

                for await (const statusFromStream of readStreamableValue(
                  status
                )) {
                  setCurrentStatus(statusFromStream as Status)
                  setDisplay(display)
                }
              }}
            >
              Submit
            </div>
          </>
        ) : currentStatus === 'completed' || currentStatus === 'in_progress' ? (
          display
        ) : currentStatus === 'expired' ? (
          <div className="flex flex-row items-center justify-center gap-3">
            Your Session has expired!
          </div>
        ) : null}
      </div>

      <div
        className={`flex flex-row flex-wrap gap-2 ${
          currentStatus === 'completed' ? 'opacity-100' : 'opacity-0'
        }`}
      >
        {suggestions.map(suggestion => (
          <div
            key={suggestion}
            className="flex flex-row items-center gap-2 px-3 py-2 text-sm bg-white border rounded-xl cursor-pointer shrink-0 hover:bg-zinc-100 dark:bg-zinc-950 dark:hover:bg-zinc-900"
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
