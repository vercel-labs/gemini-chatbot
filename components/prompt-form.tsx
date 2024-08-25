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
  const { submitUserMessage, summarizeDocument } = useActions()
  const [messages, setMessages] = useUIState<typeof AI>()

  React.useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }, [])

  const fileRef = React.useRef<HTMLInputElement>(null)

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files) {
      toast.error('No file selected')
      return
    }

    const file = event.target.files[0]
    const reader = new FileReader()

    reader.onload = async (e) => {
      const content = e.target?.result as string
      try {
        const responseMessage = await summarizeDocument(content, file.name)
        setMessages(currentMessages => [...currentMessages, responseMessage])
      } catch (error) {
        toast.error('Error summarizing document. Please try again.')
      }
    }

    if (file.type === 'application/pdf') {
      // TO-DO
      toast.error('PDF parsing is not implemented yet')
    } else if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      // TO-DO
      toast.error('DOCX parsing is not implemented yet')
    } else {
      reader.readAsText(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (window.innerWidth < 640) {
      (e.target as HTMLFormElement).message?.blur()
    }

    const value = input.trim()
    setInput('')
    if (!value) return

    setMessages(currentMessages => [
      ...currentMessages,
      {
        id: nanoid(),
        display: <UserMessage>{value}</UserMessage>
      }
    ])

    try {
      const responseMessage = await submitUserMessage(value)
      setMessages(currentMessages => [...currentMessages, responseMessage])
    } catch {
      toast.error('Failed to send message. Please try again.')
    }
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit}>
      <input
        type="file"
        className="hidden"
        id="file"
        ref={fileRef}
        onChange={handleFileUpload}
        accept=".txt,.doc,.docx,.pdf"
      />
      <div className="relative flex max-h-60 w-full grow flex-col overflow-hidden bg-zinc-100 px-12 sm:rounded-[31px] sm:px-12">
        <Button
          variant="outline"
          size="icon"
          className="absolute left-4 top-[14px] size-8 rounded-full bg-background p-0 sm:left-4"
          onClick={() => {
            fileRef.current?.click()
          }}
        >
          <IconPlus />
          <span className="sr-only">Upload Document</span>
        </Button>
        <Textarea
          ref={inputRef}
          tabIndex={0}
          onKeyDown={onKeyDown}
          placeholder="Send a message or upload a document to summarize."
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