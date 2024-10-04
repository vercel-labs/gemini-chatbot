'use client'

import * as React from 'react'
import Textarea from 'react-textarea-autosize'

import { useActions, useUIState } from 'ai/rsc'

import { UserMessage } from './stocks/message'
import { type AI } from '@/lib/chat/actions'
import { Button } from '@/components/ui/button'
import { IconArrowElbow, IconPlus } from '@/components/ui/icons'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from '@/components/ui/tooltip'
import { useEnterSubmit } from '@/lib/hooks/use-enter-submit'
import { nanoid } from 'nanoid'
import { toast } from 'sonner'

export function PromptForm({
  input,
  setInput
}: {
  input: string
  setInput: (value: string) => void
}) {
  const { formRef, onKeyDown } = useEnterSubmit()
  const inputRef = React.useRef<HTMLTextAreaElement>(null)
  const { submitUserMessage, describeImage } = useActions()
  const [_, setMessages] = useUIState<typeof AI>()

  React.useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }, [])

  const fileRef = React.useRef<HTMLInputElement>(null)

  return (
    <form
      ref={formRef}
      onSubmit={async (e: any) => {
        e.preventDefault()

        // Blur focus on mobile
        if (window.innerWidth < 600) {
          e.target['message']?.blur()
        }

        const value = input.trim()
        setInput('')
        if (!value) return

        // Optimistically add user message UI
        setMessages(currentMessages => [
          ...currentMessages,
          {
            id: nanoid(),
            display: <UserMessage>{value}</UserMessage>
          }
        ])

        try {
          // Submit and get response message
          const responseMessage = await submitUserMessage(value)
          setMessages(currentMessages => [...currentMessages, responseMessage])
        } catch {
          toast(
            <div className="text-red-600">
              You have reached your message limit! Please try again later, or{' '}
              <a
                className="underline"
                target="_blank"
                rel="noopener noreferrer"
                href="https://vercel.com/templates/next.js/gemini-ai-chatbot"
              >
                deploy your own version
              </a>
              .
            </div>
          )
        }
      }}
    >
      <input
        type="file"
        className="hidden"
        id="file"
        ref={fileRef}
        onChange={async event => {
          if (!event.target.files) {
            toast.error('No file selected')
            return
          }

          const file = event.target.files[0]

          if (file.type.startsWith('video/')) {
            const responseMessage = await describeImage('')
            setMessages(currentMessages => [
              ...currentMessages,
              responseMessage
            ])
          } else {
            const reader = new FileReader()
            reader.readAsDataURL(file)

            reader.onloadend = async () => {
              const base64String = reader.result
              const responseMessage = await describeImage(base64String)
              setMessages(currentMessages => [
                ...currentMessages,
                responseMessage
              ])
            }
          }
        }}
      />
      <div className="relative flex max-h-60 w-full grow flex-col overflow-hidden bg-zinc-100 px-12 sm:rounded-[31px] sm:px-12">
        {/* <Tooltip>
          <TooltipTrigger asChild> */}
        <Button
          variant="outline"
          size="icon"
          className="absolute left-4 top-[14px] size-8 rounded-full bg-background p-0 sm:left-4"
          onClick={() => {
            fileRef.current?.click()
          }}
        >
          <IconPlus />
          <span className="sr-only">New Chat</span>
        </Button>
        {/* </TooltipTrigger>
          <TooltipContent>Add Attachments</TooltipContent>
        </Tooltip> */}
        <Textarea
          ref={inputRef}
          tabIndex={0}
          onKeyDown={onKeyDown}
          placeholder="Send a message."
          className="min-h-[60px] w-full bg-transparent placeholder:text-zinc-900 resize-none px-4 py-[1.3rem] focus-within:outline-none sm:text-sm"
          autoFocus
          spellCheck={false}
          autoComplete="off"
          autoCorrect="off"
          name="message"
          rows={1}
          value={input}
          onChange={e => setInput(e.target.value)}
        />
        <div className="absolute right-4 top-[13px] sm:right-4">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="submit"
                size="icon"
                disabled={input === ''}
                className="bg-transparent shadow-none text-zinc-950 rounded-full hover:bg-zinc-200"
              >
                <IconArrowElbow />
                <span className="sr-only">Send message</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Send message</TooltipContent>
          </Tooltip>
        </div>
      </div>
    </form>
  )
}
