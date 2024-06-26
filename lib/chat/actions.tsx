// @ts-nocheck

/* eslint-disable jsx-a11y/alt-text */
/* eslint-disable @next/next/no-img-element */
import 'server-only'

import {
  createAI,
  createStreamableUI,
  getMutableAIState,
  getAIState,
  createStreamableValue
} from 'ai/rsc'

import { BotCard, BotMessage } from '@/components/stocks'

import { nanoid, sleep } from '@/lib/utils'
import { saveChat } from '@/app/actions'
import { SpinnerMessage, UserMessage } from '@/components/stocks/message'
import { Chat } from '../types'
import { auth } from '@/auth'
import { FlightStatus } from '@/components/flights/flight-status'
import { SelectSeats } from '@/components/flights/select-seats'
import { ListFlights } from '@/components/flights/list-flights'
import { BoardingPass } from '@/components/flights/boarding-pass'
import { PurchaseTickets } from '@/components/flights/purchase-ticket'
import { CheckIcon, SpinnerIcon } from '@/components/ui/icons'
import { format } from 'date-fns'
import { streamText } from 'ai'
import { google } from '@ai-sdk/google'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { z } from 'zod'
import { ListHotels } from '@/components/hotels/list-hotels'
import { Destinations } from '@/components/flights/destinations'
import { Video } from '@/components/media/video'
import { rateLimit } from './ratelimit'

const genAI = new GoogleGenerativeAI(
  process.env.GOOGLE_GENERATIVE_AI_API_KEY || ''
)

async function describeImage(imageBase64: string) {
  'use server'

  await rateLimit()

  const aiState = getMutableAIState()
  const spinnerStream = createStreamableUI(null)
  const messageStream = createStreamableUI(null)
  const uiStream = createStreamableUI()

  uiStream.update(
    <BotCard>
      <Video isLoading />
    </BotCard>
  )
  ;(async () => {
    try {
      let text = ''

      // attachment as video for demo purposes,
      // add your implementation here to support
      // video as input for prompts.
      if (imageBase64 === '') {
        await new Promise(resolve => setTimeout(resolve, 5000))

        text = `
      The books in this image are:

      1. The Little Prince by Antoine de Saint-Exupéry
      2. The Prophet by Kahlil Gibran
      3. Man's Search for Meaning by Viktor Frankl
      4. The Alchemist by Paulo Coelho
      5. The Kite Runner by Khaled Hosseini
      6. To Kill a Mockingbird by Harper Lee
      7. The Catcher in the Rye by J.D. Salinger
      8. The Great Gatsby by F. Scott Fitzgerald
      9. 1984 by George Orwell
      10. Animal Farm by George Orwell
      `
      } else {
        const imageData = imageBase64.split(',')[1]

        const model = genAI.getGenerativeModel({ model: 'gemini-pro-vision' })
        const prompt = 'List the books in this image.'
        const image = {
          inlineData: {
            data: imageData,
            mimeType: 'image/png'
          }
        }

        const result = await model.generateContent([prompt, image])
        text = result.response.text()
        console.log(text)
      }

      spinnerStream.done(null)
      messageStream.done(null)

      uiStream.done(
        <BotCard>
          <Video />
        </BotCard>
      )

      aiState.done({
        ...aiState.get(),
        interactions: [text]
      })
    } catch (e) {
      console.error(e)

      const error = new Error(
        'The AI got rate limited, please try again later.'
      )
      uiStream.error(error)
      spinnerStream.error(error)
      messageStream.error(error)
      aiState.done()
    }
  })()

  return {
    id: nanoid(),
    attachments: uiStream.value,
    spinner: spinnerStream.value,
    display: messageStream.value
  }
}

async function submitUserMessage(content: string) {
  'use server'

  await rateLimit()

  const aiState = getMutableAIState()

  aiState.update({
    ...aiState.get(),
    messages: [
      ...aiState.get().messages,
      {
        id: nanoid(),
        role: 'user',
        content: `${aiState.get().interactions.join('\n\n')}\n\n${content}`
      }
    ]
  })

  const history = aiState.get().messages.map(message => ({
    role: message.role,
    content: message.content
  }))
  // console.log(history)

  const textStream = createStreamableValue('')
  const spinnerStream = createStreamableUI(<SpinnerMessage />)
  const messageStream = createStreamableUI(null)
  const uiStream = createStreamableUI()

  ;(async () => {
    try {
      const result = await streamText({
        model: google('models/gemini-1.5-flash'),
        temperature: 0,
        tools: {
          showFlights: {
            description:
              "List available flights in the UI. List 3 that match user's query.",
            parameters: z.object({
              departingCity: z.string(),
              arrivalCity: z.string(),
              departingAirport: z.string().describe('Departing airport code'),
              arrivalAirport: z.string().describe('Arrival airport code'),
              date: z
                .string()
                .describe(
                  "Date of the user's flight, example format: 6 April, 1998"
                )
            })
          },
          listDestinations: {
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
          },
          showSeatPicker: {
            description:
              'Show the UI to choose or change seat for the selected flight.',
            parameters: z.object({
              departingCity: z.string(),
              arrivalCity: z.string(),
              flightCode: z.string(),
              date: z.string()
            })
          },
          showHotels: {
            description: 'Show the UI to choose a hotel for the trip.',
            parameters: z.object({ city: z.string() })
          },
          checkoutBooking: {
            description:
              'Show the UI to purchase/checkout a flight and hotel booking.',
            parameters: z.object({ shouldConfirm: z.boolean() })
          },
          showBoardingPass: {
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
          },
          showFlightStatus: {
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
        },
        system: `\
      You are a friendly assistant that helps the user with booking flights to destinations that are based on a list of books. You can you give travel recommendations based on the books, and will continue to help the user book a flight to their destination.
  
      The date today is ${format(new Date(), 'd LLLL, yyyy')}. 
      The user's current location is San Francisco, CA, so the departure city will be San Francisco and airport will be San Francisco International Airport (SFO). The user would like to book the flight out on May 12, 2024.

      List United Airlines flights only.
      
      Here's the flow: 
        1. List holiday destinations based on a collection of books.
        2. List flights to destination.
        3. Choose a flight.
        4. Choose a seat.
        5. Choose hotel
        6. Purchase booking.
        7. Show boarding pass.
      `,
        messages: [...history]
      })

      let textContent = ''
      spinnerStream.done(null)

      for await (const delta of result.fullStream) {
        const { type } = delta

        if (type === 'text-delta') {
          const { textDelta } = delta

          textContent += textDelta
          messageStream.update(<BotMessage content={textContent} />)

          aiState.update({
            ...aiState.get(),
            messages: [
              ...aiState.get().messages,
              {
                id: nanoid(),
                role: 'assistant',
                content: textContent
              }
            ]
          })
        } else if (type === 'tool-call') {
          const { toolName, args } = delta

          if (toolName === 'listDestinations') {
            const { destinations } = args

            uiStream.update(
              <BotCard>
                <Destinations destinations={destinations} />
              </BotCard>
            )

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
                    props: {
                      destinations
                    }
                  }
                }
              ]
            })
          } else if (toolName === 'showFlights') {
            aiState.done({
              ...aiState.get(),
              interactions: [],
              messages: [
                ...aiState.get().messages,
                {
                  id: nanoid(),
                  role: 'assistant',
                  content:
                    "Here's a list of flights for you. Choose one and we can proceed to pick a seat.",
                  display: {
                    name: 'showFlights',
                    props: {
                      summary: args
                    }
                  }
                }
              ]
            })

            uiStream.update(
              <BotCard>
                <ListFlights summary={args} />
              </BotCard>
            )
          } else if (toolName === 'showSeatPicker') {
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
                    props: {
                      summary: args
                    }
                  }
                }
              ]
            })

            uiStream.update(
              <BotCard>
                <SelectSeats summary={args} />
              </BotCard>
            )
          } else if (toolName === 'showHotels') {
            aiState.done({
              ...aiState.get(),
              interactions: [],
              messages: [
                ...aiState.get().messages,
                {
                  id: nanoid(),
                  role: 'assistant',
                  content:
                    "Here's a list of hotels for you to choose from. Select one to proceed to payment.",
                  display: {
                    name: 'showHotels',
                    props: {}
                  }
                }
              ]
            })

            uiStream.update(
              <BotCard>
                <ListHotels />
              </BotCard>
            )
          } else if (toolName === 'checkoutBooking') {
            aiState.done({
              ...aiState.get(),
              interactions: []
            })

            uiStream.update(
              <BotCard>
                <PurchaseTickets />
              </BotCard>
            )
          } else if (toolName === 'showBoardingPass') {
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
                    props: {
                      summary: args
                    }
                  }
                }
              ]
            })

            uiStream.update(
              <BotCard>
                <BoardingPass summary={args} />
              </BotCard>
            )
          } else if (toolName === 'showFlightStatus') {
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
                props: {
                  summary: args
                }
              }
            })

            uiStream.update(
              <BotCard>
                <FlightStatus summary={args} />
              </BotCard>
            )
          }
        }
      }

      uiStream.done()
      textStream.done()
      messageStream.done()
    } catch (e) {
      console.error(e)

      const error = new Error(
        'The AI got rate limited, please try again later.'
      )
      uiStream.error(error)
      textStream.error(error)
      messageStream.error(error)
      aiState.done()
    }
  })()

  return {
    id: nanoid(),
    attachments: uiStream.value,
    spinner: spinnerStream.value,
    display: messageStream.value
  }
}

export async function requestCode() {
  'use server'

  const aiState = getMutableAIState()

  aiState.done({
    ...aiState.get(),
    messages: [
      ...aiState.get().messages,
      {
        role: 'assistant',
        content:
          "A code has been sent to user's phone. They should enter it in the user interface to continue."
      }
    ]
  })

  const ui = createStreamableUI(
    <div className="animate-spin">
      <SpinnerIcon />
    </div>
  )

  ;(async () => {
    await sleep(2000)
    ui.done()
  })()

  return {
    status: 'requires_code',
    display: ui.value
  }
}

export async function validateCode() {
  'use server'

  const aiState = getMutableAIState()

  const status = createStreamableValue('in_progress')
  const ui = createStreamableUI(
    <div className="flex flex-col items-center justify-center gap-3 p-6 text-zinc-500">
      <div className="animate-spin">
        <SpinnerIcon />
      </div>
      <div className="text-sm text-zinc-500">
        Please wait while we fulfill your order.
      </div>
    </div>
  )

  ;(async () => {
    await sleep(2000)

    ui.done(
      <div className="flex flex-col items-center text-center justify-center gap-3 p-4 text-emerald-700">
        <CheckIcon />
        <div>Payment Succeeded</div>
        <div className="text-sm text-zinc-600">
          Thanks for your purchase! You will receive an email confirmation
          shortly.
        </div>
      </div>
    )

    aiState.done({
      ...aiState.get(),
      messages: [
        ...aiState.get().messages.slice(0, -1),
        {
          role: 'assistant',
          content: 'The purchase has completed successfully.'
        }
      ]
    })

    status.done('completed')
  })()

  return {
    status: status.value,
    display: ui.value
  }
}

export type Message = {
  role: 'user' | 'assistant' | 'system' | 'function' | 'data' | 'tool'
  content: string
  id?: string
  name?: string
  display?: {
    name: string
    props: Record<string, any>
  }
}

export type AIState = {
  chatId: string
  interactions?: string[]
  messages: Message[]
}

export type UIState = {
  id: string
  display: React.ReactNode
  spinner?: React.ReactNode
  attachments?: React.ReactNode
}[]

export const AI = createAI<AIState, UIState>({
  actions: {
    submitUserMessage,
    requestCode,
    validateCode,
    describeImage
  },
  initialUIState: [],
  initialAIState: { chatId: nanoid(), interactions: [], messages: [] },
  unstable_onGetUIState: async () => {
    'use server'

    const session = await auth()

    if (session && session.user) {
      const aiState = getAIState()

      if (aiState) {
        const uiState = getUIStateFromAIState(aiState)
        return uiState
      }
    } else {
      return
    }
  },
  unstable_onSetAIState: async ({ state }) => {
    'use server'

    const session = await auth()

    if (session && session.user) {
      const { chatId, messages } = state

      const createdAt = new Date()
      const userId = session.user.id as string
      const path = `/chat/${chatId}`
      const title = messages[0].content.substring(0, 100)

      const chat: Chat = {
        id: chatId,
        title,
        userId,
        createdAt,
        messages,
        path
      }

      await saveChat(chat)
    } else {
      return
    }
  }
})

export const getUIStateFromAIState = (aiState: Chat) => {
  return aiState.messages
    .filter(message => message.role !== 'system')
    .map((message, index) => ({
      id: `${aiState.chatId}-${index}`,
      display:
        message.role === 'assistant' ? (
          message.display?.name === 'showFlights' ? (
            <BotCard>
              <ListFlights summary={message.display.props.summary} />
            </BotCard>
          ) : message.display?.name === 'showSeatPicker' ? (
            <BotCard>
              <SelectSeats summary={message.display.props.summary} />
            </BotCard>
          ) : message.display?.name === 'showHotels' ? (
            <BotCard>
              <ListHotels />
            </BotCard>
          ) : message.content === 'The purchase has completed successfully.' ? (
            <BotCard>
              <PurchaseTickets status="expired" />
            </BotCard>
          ) : message.display?.name === 'showBoardingPass' ? (
            <BotCard>
              <BoardingPass summary={message.display.props.summary} />
            </BotCard>
          ) : message.display?.name === 'listDestinations' ? (
            <BotCard>
              <Destinations destinations={message.display.props.destinations} />
            </BotCard>
          ) : (
            <BotMessage content={message.content} />
          )
        ) : message.role === 'user' ? (
          <UserMessage showAvatar>{message.content}</UserMessage>
        ) : (
          <BotMessage content={message.content} />
        )
    }))
}
