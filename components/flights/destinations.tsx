export const Destinations = ({ destinations }: { destinations: string[] }) => {
  return (
    <div className="flex flex-col gap-3 text-zinc-950 dark:text-zinc-200">
      <div className="dark:text-zinc-200">
        Here is a list of holiday destinations based on the books you have read.
        Choose one to proceed to booking a flight.
      </div>
      <ul>
        {destinations.map(destination => (
          <li className="list-disc dark:text-zinc-200" key={destination}>
            {destination}
          </li>
        ))}
      </ul>
    </div>
  )
}
