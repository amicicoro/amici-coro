import { promises as fs } from "fs"
import path from "path"
import type { Event, Venue } from "@/types/event"
import { venues, getPastEvents } from "./events-data"

// This function is kept for backward compatibility
export async function getAllPastEvents(): Promise<Event[]> {

    const pastEvents = await Promise.all(
      pastEventFiles.map(async (filename) => {
        const filePath = path.join(pastEventsDirectory, filename)
        const fileContents = await fs.readFile(filePath, "utf8")
        return JSON.parse(fileContents) as Event
      }),
    )

    return pastEvents
  } catch (error) {
    console.error("Error in getAllPastEvents:", error)
    // Fallback to the new method
    const pastEventsWithVenues = await getPastEvents()
    return pastEventsWithVenues.map(({ venue, ...event }) => event)
  }
}

// This function is kept for backward compatibility
export function getPastEventWithVenue(event: Event): Event & { venue: Venue } {
  const venue = venues.find((v) => v.id === event.venueId)
  if (!venue) {
    throw new Error(`Venue not found for past event: ${event.id}`)
  }
  return { ...event, venue }
}

