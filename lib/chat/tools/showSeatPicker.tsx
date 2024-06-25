import 'server-only'

import { z } from 'zod'
import { nanoid } from '@/lib/utils'
import { BotCard, BotMessage } from '@/components/stocks'
import { SelectSeats } from '@/components/flights/select-seats'
import { createStreamableUI } from 'ai/rsc'
import type { MutableAIState } from '../types'

export type ToolParameters = z.input<typeof definition.parameters>
export type ToolProps = {
  summary: ToolParameters
}

export const definition = {
  description: 'Show the UI to choose or change seat for the selected flight.',
  parameters: z.object({
    departingCity: z.string(),
    arrivalCity: z.string(),
    flightCode: z.string(),
    date: z.string()
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
          "Here's a list of available seats for you to choose from. Select one to proceed to payment.",
        display: {
          name: 'showSeatPicker',
          props
        }
      }
    ]
  })

  uiStream.update(UIFromAI(props))
}

export const UIFromAI = (props: ToolProps) => (
  <BotCard>
    <SelectSeats {...props} />
  </BotCard>
)
