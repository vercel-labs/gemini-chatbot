'use client'

import {
  CardIcon,
  GoogleIcon,
  LockIcon,
  SparklesIcon
} from '@/components/ui/icons'
import { cn } from '@/lib/utils'
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
    <div className="grid gap-4">
      <div className="grid gap-4 p-4 sm:p-6 border border-zinc-200 rounded-2xl bg-white">
        <div className="flex">
          <div className="flex items-center gap-2 text-zinc-950">
            <div className="size-6 flex items-center justify-center bg-zinc-100 rounded-full text-zinc-500 [&>svg]:size-3">
              <CardIcon />
            </div>
            <div className="text-sm text-zinc-600">Visa · · · · 0512</div>
          </div>
          <div className="text-sm flex ml-auto items-center gap-1 border border-zinc-200 px-3 py-0.5 rounded-full">
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
            <button
              className="p-2 text-center rounded-full cursor-pointer bg-zinc-900 text-zinc-50 hover:bg-zinc-600 transition-colors"
              onClick={async () => {
                const { status, display } = await requestCode()
                setCurrentStatus(status)
                setDisplay(display)
              }}
            >
              Pay $981
            </button>
          </div>
        ) : currentStatus === 'requires_code' ? (
          <>
            <div>
              Enter the code sent to your phone (***) *** 6137 to complete your
              purchase.
            </div>
            <div className="flex justify-center p-2 text-center border rounded-full text-zinc-950">
              <input
                className="w-16 text-center bg-transparent outline-none tabular-nums"
                type="text"
                maxLength={6}
                placeholder="------"
                autoFocus
              />
            </div>
            <button
              className="p-2 text-center rounded-full cursor-pointer bg-zinc-900 text-zinc-50 hover:bg-zinc-600 transition-colors"
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
            </button>
          </>
        ) : currentStatus === 'completed' || currentStatus === 'in_progress' ? (
          display
        ) : currentStatus === 'expired' ? (
          <div className="flex items-center justify-center gap-3">
            Your Session has expired!
          </div>
        ) : null}
      </div>

      <div
        className={cn(
          'flex flex-col sm:flex-row items-start gap-2',
          currentStatus === 'completed' ? 'opacity-100' : 'opacity-0'
        )}
      >
        {suggestions.map(suggestion => (
          <button
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
          </button>
        ))}
      </div>
    </div>
  )
}
