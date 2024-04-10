import { SpinnerIcon } from '../ui/icons'

export const Video = ({ isLoading }: { isLoading: boolean }) => {
  return (
    <div className="flex flex-col gap-2">
      <video
        className="rounded-xl w-1/2 md:h-[568px]"
        src="/videos/books.mp4"
        controls
      />
      <div
        className={`flex flex-row gap-2 items-center ${isLoading ? 'opacity-100' : 'opacity-0'}`}
      >
        <SpinnerIcon />
        <div className="text-zinc-500 text-sm">Analyzing video...</div>
      </div>
    </div>
  )
}
