import Image from "next/image"
import type { Event } from "@/types/event"

interface EventHeroProps {
  event: Event
  venue: Venue
  isPastEvent?: boolean
}

export function EventHero({ event, venue, isPastEvent = false }: EventHeroProps) {
  return (
    <div className="relative w-full h-[50vh] md:h-[60vh] lg:h-[70vh]">
      <Image
        src={venue.imageUrl || "/placeholder.svg"}
        alt={`${event.title} event`}
        fill
        className="object-cover"
        priority
      />
      <div className="absolute inset-0 bg-black bg-opacity-40 flex items-end">
        <div className="container mx-auto px-6 sm:px-8 md:px-12 pb-12 md:pb-16 lg:pb-20">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-playfair leading-tight text-white mb-2">
            {event.title.replace(/\s*residency\s*$/i, "").toUpperCase()}
          </h1>
          {event.isResidency && (
            <h2 className="text-2xl md:text-3xl font-playfair italic text-white mb-0">RESIDENCY</h2>
          )}
        </div>
      </div>
    </div>
  )
}

