import { ExternalLink } from '@/components/external-link'

export function EmptyScreen() {
  return (
    <div className="mx-auto max-w-2xl px-4">
      <div className="flex flex-col gap-2 rounded-lg border bg-background p-8">
        <h1 className="text-lg font-semibold">Next.js Gemini Chatbot</h1>
        <p className="leading-normal text-muted-foreground">
          This is an open source AI chatbot app template built with{' '}
          <ExternalLink href="https://nextjs.org">Next.js</ExternalLink>, the{' '}
          <ExternalLink href="https://sdk.vercel.ai">
            Vercel AI SDK
          </ExternalLink>
          , and{' '}
          <ExternalLink href="https://ai.google.dev">
            Google Gemini
          </ExternalLink>
          .
        </p>
        <p className="leading-normal text-muted-foreground">
          It uses{' '}
          <ExternalLink href="https://vercel.com/blog/ai-sdk-3-generative-ui">
            React Server Components
          </ExternalLink>{' '}
          with function calling to mix both text with generative UI responses
          from Gemini. The UI state is synced through the AI SDK so the model is
          always aware of your stateful interactions as they happen in the
          browser.
        </p>
      </div>
    </div>
  )
}
