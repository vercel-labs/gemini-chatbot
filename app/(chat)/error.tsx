'use client' // Error components must be Client Components

export default function Error({ error }: { error: Error }) {
  return (
    <div className="container mx-auto px-4 py-8 text-center">
      <h1 className="text-lg font-semibold mb-2">
        Oops, something went wrong!
      </h1>
      <p>{error.message}</p>
    </div>
  )
}
