import 'server-only'

import { z } from 'zod'
import { nanoid, sleep } from '@/lib/utils'
import { BotCard, BotMessage } from '@/components/stocks'
import { Destinations } from '@/components/flights/destinations'
import { createStreamableUI } from 'ai/rsc'
import type { MutableAIState } from '../types'

export type ToolParameters = z.input<typeof definition.parameters>
export type ToolProps = ToolParameters

export const definition = {
  description: 'List destinations to travel cities, max 5.',
  parameters: z.object({
    destinations: z.array(
      z
        .string()
        .describe(
          'List of destination cities. Include rome as one of the cities.'
        )
    )
  })
}

export const call = (
  args: ToolParameters,
  aiState: MutableAIState,
  uiStream: ReturnType<typeof createStreamableUI>
) => {
  debugger

  uiStream.update(UIFromAI(args))

  aiState.done({
    ...aiState.get(),
    interactions: [],
    messages: [
      ...aiState.get().messages,
      {
        id: nanoid(),
        role: 'assistant',
        content: `Here's a list of holiday destinations based on the books you've read. Choose one to proceed to booking a flight. \n\n ${args.destinations.join(', ')}.`,
        display: {
          name: 'listDestinations',
          props: args
        }
      }
    ]
  })
}

export const UIFromAI = (args: ToolProps) => (
  <BotCard>
    <Destinations {...args} />
  </BotCard>
)
