'use client'

import { useActions, useUIState } from 'ai/rsc'

export const Destinations = ({ destinations }: { destinations: string[] }) => {
  const { submitUserMessage } = useActions()
  const [_, setMessages] = useUIState()

  return (
    <div className="grid gap-4">
      <p>
        Here is a list of holiday destinations based on the books you have read.
        Choose one to proceed to booking a flight.
      </p>
      <div className="flex flex-col sm:flex-row items-start gap-2">
        {destinations.map(destination => (
          <button
            className="flex items-center gap-2 px-3 py-2 text-sm transition-colors bg-zinc-50 hover:bg-zinc-100 rounded-xl cursor-pointer"
            key={destination}
            onClick={async () => {
              const response = await submitUserMessage(
                `I would like to fly to ${destination}, proceed to choose flights.`
              )
              setMessages((currentMessages: any[]) => [
                ...currentMessages,
                response
              ])
            }}
          >
            {destination}
          </button>
        ))}
      </div>
    </div>
  )
}
