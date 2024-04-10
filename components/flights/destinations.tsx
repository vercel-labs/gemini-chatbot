'use client'

import { useActions, useUIState } from 'ai/rsc'

export const Destinations = ({ destinations }: { destinations: string[] }) => {
  const { submitUserMessage } = useActions()
  const [_, setMessages] = useUIState()

  return (
    <div className="flex flex-col gap-3 text-zinc-950 dark:text-zinc-200">
      <div className="dark:text-zinc-200">
        Here is a list of holiday destinations based on the books you have read.
        Choose one to proceed to booking a flight.
      </div>
      <div className="flex flex-col gap-1">
        {destinations.map(destination => (
          <div
            className="bg-white rounded-xl p-2 tezt-`inc-800 dark:text-zinc-200 cursor-pointer hover:bg-zinc-200 dark:bg-zinc-950 border"
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
          </div>
        ))}
      </div>
    </div>
  )
}
