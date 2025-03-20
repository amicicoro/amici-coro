import { list, put } from "@vercel/blob"
import type { Event, Venue } from "@/types/event"
import { getVenueById } from "./venues-data"

// Helper function to extract version number from filename
function extractVersionNumber(filename: string): number {
  // Match patterns like "event-v1.json", "event-v2.json", etc.
  const versionMatch = filename.match(/event-v(\d+)\.json$/)

  // If it's the original unversioned file, return 0
  if (filename === "event.json") return 0

  // If we found a version number, return it as a number
  if (versionMatch && versionMatch[1]) {
    return Number.parseInt(versionMatch[1], 10)
  }

  // Default to -1 for files that don't match our pattern
  return -1
}

// Helper function to get the most recent event file from a list of blobs
function getMostRecentEventFile(blobs: any[]) {
  if (blobs.length === 0) return null

  // Sort blobs by version number (highest first)
  return blobs.sort((a, b) => {
    const filenameA = a.pathname.split("/").pop() || ""
    const filenameB = b.pathname.split("/").pop() || ""

    const versionA = extractVersionNumber(filenameA)
    const versionB = extractVersionNumber(filenameB)

    return versionB - versionA
  })[0]
}

export async function getEventById(id: string): Promise<Event | null> {
  try {
    const { blobs } = await list({
      prefix: `data/events/${id}/`,
    })

    // Filter for event files (both versioned and unversioned)
    const eventBlobs = blobs.filter((blob) => {
      const filename = blob.pathname.split("/").pop() || ""
      return filename === "event.json" || filename.match(/event-v\d+\.json/)
    })

    const mostRecentEventBlob = getMostRecentEventFile(eventBlobs)

    if (!mostRecentEventBlob) {
      return null
    }

    const response = await fetch(mostRecentEventBlob.url)
    if (!response.ok) {
      throw new Error(`Failed to fetch event data from ${mostRecentEventBlob.url}`)
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

export async function createEvent(event: Event): Promise<Event> {
  try {
    // Check if the event already exists
    const existingEvent = await getEventById(event.id)
    if (existingEvent) {
      throw new Error(`Event already exists: ${event.id}`)
    }

    // Prepare the event data (remove id as it's in the path)
    const { id, ...eventData } = event

    // Convert to JSON
    const eventJson = JSON.stringify(eventData, null, 2)

    // Write the new event to blob storage (using unversioned filename for new events)
    const result = await put(`data/events/${event.id}/event.json`, eventJson, {
      contentType: "application/json",
    })

    console.log(`Created new event: ${event.id}`)

    // Return the created event
    return event
  } catch (error) {
    console.error(`Error creating event ${event.id}:`, error)
    throw error
  }
}

export async function getAllEvents(): Promise<Event[]> {
  try {
    // List all blobs with events prefix
    const { blobs } = await list({
      prefix: "data/events/",
    })

    // Group blobs by event ID
    const eventBlobsMap = new Map<string, any[]>()

    blobs.forEach((blob) => {
      const pathParts = blob.pathname.split("/")
      if (pathParts.length < 3) return // Skip if path is too short

      const eventId = pathParts[pathParts.length - 2] // Get the directory name
      const filename = pathParts[pathParts.length - 1]

      // Only process event files (both versioned and unversioned)
      if (filename === "event.json" || filename.match(/event-v\d+\.json/)) {
        if (!eventBlobsMap.has(eventId)) {
          eventBlobsMap.set(eventId, [])
        }
        eventBlobsMap.get(eventId)?.push(blob)
      }
    })

    // Process each event, using the most recent version
    const events = await Promise.all(
      Array.from(eventBlobsMap.entries()).map(async ([eventId, eventBlobs]) => {
        const mostRecentBlob = getMostRecentEventFile(eventBlobs)
        if (!mostRecentBlob) {
          throw new Error(`No valid event file found for event: ${eventId}`)
        }

        const response = await fetch(mostRecentBlob.url)
        if (!response.ok) {
          throw new Error(`Failed to fetch event data from ${mostRecentBlob.url}`)
        }

        const eventData = await response.json()
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

export async function updateEvent(event: Event): Promise<Event> {
  try {
    // Check if the event exists
    const existingEvent = await getEventById(event.id)
    if (!existingEvent) {
      throw new Error(`Event not found: ${event.id}`)
    }

    // Get all versions of this event
    const { blobs } = await list({
      prefix: `data/events/${event.id}/`,
    })

    // Filter for event files (both versioned and unversioned)
    const eventBlobs = blobs.filter((blob) => {
      const filename = blob.pathname.split("/").pop() || ""
      return filename === "event.json" || filename.match(/event-v\d+\.json/)
    })

    // Determine the highest current version number
    let highestVersion = 0
    eventBlobs.forEach((blob) => {
      const filename = blob.pathname.split("/").pop() || ""
      const version = extractVersionNumber(filename)
      if (version > highestVersion) {
        highestVersion = version
      }
    })

    // Create a new version number
    const newVersion = highestVersion + 1

    // Create the new filename
    const newFilename = `event-v${newVersion}.json`

    // Prepare the event data (remove id as it's in the path)
    const { id, ...eventData } = event

    // Convert to JSON
    const eventJson = JSON.stringify(eventData, null, 2)

    // Write the new version to blob storage
    const result = await put(`data/events/${event.id}/${newFilename}`, eventJson, {
      contentType: "application/json",
    })

    console.log(`Updated event ${event.id} to version ${newVersion}`)

    // Return the updated event
    return event
  } catch (error) {
    console.error(`Error updating event ${event.id}:`, error)
    throw error
  }
}

export function getEventWithVenue(event: Event): Event & { venue: Venue } {
  // Use synchronous function since we're using static venue data
  const venue = getVenueById(event.venueId)
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

  // Use synchronous mapping since getEventWithVenue is now synchronous
  return upcomingEvents.map(getEventWithVenue)
}

export async function getPastEvents(): Promise<(Event & { venue: Venue })[]> {
  const events = await getAllEvents()
  const now = new Date()

  const pastEvents = events
    .filter((event) => new Date(event.endDate) < now)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()) // Note: reverse chronological order

  // Use synchronous mapping since getEventWithVenue is now synchronous
  return pastEvents.map(getEventWithVenue)
}

