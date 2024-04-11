'use client'

export default function Error({
  error
}: {
  error: Error & { digest?: string }
}) {
  return (
    <div className="container mx-auto px-4 py-8 text-center">
      <h1 className="text-lg font-semibold mb-2">
        Oops, something went wrong!
      </h1>
      <p>
        {error.message || 'The AI got rate limited, please try again later.'}
      </p>
      <p>Digest: {error.digest}</p>
    </div>
  )
}
