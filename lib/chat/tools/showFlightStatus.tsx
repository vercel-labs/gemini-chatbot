import 'server-only'

import { z } from 'zod'
import { nanoid } from '@/lib/utils'
import { BotCard, BotMessage } from '@/components/stocks'
import { FlightStatus } from '@/components/flights/flight-status'
import { createStreamableUI } from 'ai/rsc'
import type { MutableAIState } from '../types'

export type ToolParameters = z.input<typeof definition.parameters>
export type ToolProps = {
  summary: ToolParameters
}

export const definition = {
  description:
    'Get the current status of imaginary flight by flight number and date.',
  parameters: z.object({
    flightCode: z.string(),
    date: z.string(),
    departingCity: z.string(),
    departingAirport: z.string(),
    departingAirportCode: z.string(),
    departingTime: z.string(),
    arrivalCity: z.string(),
    arrivalAirport: z.string(),
    arrivalAirportCode: z.string(),
    arrivalTime: z.string()
  })
}

export const call = (
  args: ToolParameters,
  aiState: MutableAIState,
  uiStream: ReturnType<typeof createStreamableUI>
) => {
  const props: ToolProps = {
    summary: args
  }

  aiState.update({
    ...aiState.get(),
    interactions: [],
    messages: [
      ...aiState.get().messages,
      {
        id: nanoid(),
        role: 'assistant',
        content: `The flight status of ${args.flightCode} is as follows:
      Departing: ${args.departingCity} at ${args.departingTime} from ${args.departingAirport} (${args.departingAirportCode})
      `
      }
    ],
    display: {
      name: 'showFlights',
      props
    }
  })

  uiStream.update(UIFromAI(props))
}

export const UIFromAI = (props: ToolProps) => (
  <BotCard>
    <FlightStatus {...props} />
  </BotCard>
)
