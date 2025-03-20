import { list } from "@vercel/blob"
import type { Event, Venue } from "@/types/event"
import venuesData from "@/data/venues.json"

export const venues: Venue[] = venuesData

export async function getEventById(id: string): Promise<Event | null> {
  try {
    const { blobs } = await list({
      prefix: `data/events/${id}/event.json`,
    })

    const eventBlob = blobs.find((blob) => blob.pathname.endsWith(`${id}/event.json`))

    if (!eventBlob) {
      return null
    }

    const response = await fetch(eventBlob.url)
    if (!response.ok) {
      throw new Error(`Failed to fetch event data from ${eventBlob.url}`)
    }

    const eventData = await response.json()
    return {
      ...eventData,
      id,
    }
  } catch (error) {
    console.error(`Error fetching event ${id} from blob storage:`, error)
    return null
  }
}

export async function getAllEvents(): Promise<Event[]> {
  try {
    // List all blobs with events prefix
    const { blobs } = await list({
      prefix: "data/events/", // Adjust this prefix based on your blob storage structure
    })

    // Process each blob to get event data
    const events = await Promise.all(
      blobs
        .filter((blob) => blob.pathname.endsWith("/event.json"))
        .map(async (blob) => {
          const response = await fetch(blob.url)
          if (!response.ok) {
            throw new Error(`Failed to fetch event data from ${blob.url}`)
          }
          const eventData = await response.json()

          // Extract the event ID from the path (now it's the directory name)
          const pathParts = blob.pathname.split("/")
          const eventId = pathParts[pathParts.length - 2] // Get the directory name

          return {
            ...eventData,
            id: eventId,
          }
        }),
    )

    // Sort events by date (most recent first)
    return events.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  } catch (error) {
    console.error("Error fetching events from blob storage:", error)
    return []
  }
}

export function getEventWithVenue(event: Event): Event & { venue: Venue } {
  const venue = venues.find((v) => v.id === event.venueId)
  if (!venue) {
    throw new Error(`Venue not found for event: ${event.id}`)
  }
  return { ...event, venue }
}

export async function getUpcomingEvents(): Promise<(Event & { venue: Venue })[]> {
  const events = await getAllEvents()
  const now = new Date()

  const upcomingEvents = events
    .filter((event) => new Date(event.endDate) >= now)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  return upcomingEvents.map(getEventWithVenue)
}

export async function getPastEvents(): Promise<(Event & { venue: Venue })[]> {
  const events = await getAllEvents()
  const now = new Date()

  const pastEvents = events
    .filter((event) => new Date(event.endDate) < now)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()) // Note: reverse chronological order

  return pastEvents.map(getEventWithVenue)
}

