import { ExternalLink } from '@/components/external-link'

export function EmptyScreen() {
  return (
    <div className="mx-auto max-w-2xl px-4">
      <div className="flex flex-col gap-2 rounded-2xl bg-zinc-50 sm:p-8 p-4 text-sm sm:text-base">
        <h1 className="text-2xl sm:text-3xl tracking-tight font-semibold max-w-fit inline-block">
          Document Summarizer
        </h1>
        <p className="leading-normal text-zinc-900">
          Welcome to Document Summarizer! This tool transforms lengthy documents into concise summaries, capturing the key points in seconds. Perfect for quick insights on reports, articles, and more. Start by uploading a document, and let our AI do the rest. Save time and enhance your productivity effortlessly. Ready to get started?
        </p>
      </div>
    </div>
  )
}
