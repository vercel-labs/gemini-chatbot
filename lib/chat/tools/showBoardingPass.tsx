import 'server-only'

import { z } from 'zod'
import { nanoid } from '@/lib/utils'
import { BotCard, BotMessage } from '@/components/stocks'
import { BoardingPass } from '@/components/flights/boarding-pass'
import { createStreamableUI } from 'ai/rsc'
import type { MutableAIState } from '../types'

export type ToolParameters = z.input<typeof definition.parameters>
export type ToolProps = {
  summary: ToolParameters
}

export const definition = {
  description: "Show user's imaginary boarding pass.",
  parameters: z.object({
    airline: z.string(),
    arrival: z.string(),
    departure: z.string(),
    departureTime: z.string(),
    arrivalTime: z.string(),
    price: z.number(),
    seat: z.string(),
    date: z
      .string()
      .describe('Date of the flight, example format: 6 April, 1998'),
    gate: z.string()
  })
}

export const call = (
  args: ToolParameters,
  aiState: MutableAIState,
  uiStream: ReturnType<typeof createStreamableUI>
) => {
  debugger

  const props: ToolProps = {
    summary: args
  }

  aiState.done({
    ...aiState.get(),
    interactions: [],
    messages: [
      ...aiState.get().messages,
      {
        id: nanoid(),
        role: 'assistant',
        content:
          "Here's your boarding pass. Please have it ready for your flight.",
        display: {
          name: 'showBoardingPass',
          props
        }
      }
    ]
  })

  uiStream.update(UIFromAI(props))
}

export const UIFromAI = (props: ToolProps) => (
  <BotCard>
    <BoardingPass {...props} />
  </BotCard>
)
