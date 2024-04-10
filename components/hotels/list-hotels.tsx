/* eslint-disable jsx-a11y/alt-text */
/* eslint-disable @next/next/no-img-element */
'use client'

import { useActions, useUIState } from 'ai/rsc'

interface Hotel {
  id: number
  name: string
  description: string
  price: number
}

interface ListHotelsProps {
  hotels: Hotel[]
}

export const ListHotels = ({
  hotels = [
    {
      id: 1,
      name: 'The St. Regis Rome',
      description: 'Renowned luxury hotel with a lavish spa',
      price: 101
    },
    {
      id: 2,
      name: 'The Inn at the Roman Forum',
      description: 'Upscale hotel with Roman ruins and a bar',
      price: 145
    },
    {
      id: 3,
      name: 'Hotel Roma',
      description: 'Vibrant property with free breakfast',
      price: 112
    }
  ]
}: ListHotelsProps) => {
  const { submitUserMessage } = useActions()
  const [_, setMessages] = useUIState()

  return (
    <div className="flex flex-col gap-4">
      <div>
        We recommend a 3 night stay in Rome. Here are some hotels you can choose
        from.
      </div>

      <div className="flex flex-col gap-2 bg-white p-2 font-medium border rounded-xl dark:bg-zinc-950">
        {hotels.map(hotel => (
          <div
            key={hotel.id}
            className="p-2 flex flex-row justify-between hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-xl cursor-pointer gap-4"
            onClick={async () => {
              const response = await submitUserMessage(
                `I want to book the ${hotel.name}, proceed to checkout by calling checkoutBooking function.`
              )
              setMessages((currentMessages: any[]) => [
                ...currentMessages,
                response
              ])
            }}
          >
            <div className="flex flex-col  md:flex-row gap-4">
              <div className="h-12 w-20 bg-zinc-100 border rounded-lg">
                <img
                  className="object-cover h-full rounded-lg"
                  src={`/images/${hotel.id}.jpg`}
                />
              </div>
              <div>
                <div>{hotel.name}</div>
                <div className="text-zinc-500">{hotel.description}</div>
              </div>
            </div>

            <div>
              <div className="text-emerald-700 text-right">${hotel.price}</div>
              <div className="text-zinc-500 text-right text-sm">per night</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
