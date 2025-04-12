import "server-only"

// Import types only
import type { Event, Venue } from "@/types/event"

// Import Vercel Blob
import { list, put, head } from "@vercel/blob"

// Import venues data
import { getVenueById } from "./venues-data"

// Cache keys
const CACHE_KEYS = {
  ALL_EVENTS: "events:all",
  EVENT: (id: string) => `events:${id}`,
  EVENT_BY_SLUG: (slug: string) => `events:slug:${slug}`,
  UPCOMING_EVENTS: "events:upcoming",
  PAST_EVENTS: "events:past",
  EVENT_PHOTOS: (slug: string) => `events:${slug}:photos`,
}

// Cache TTLs in seconds
const CACHE_TTL = {
  EVENTS: 60 * 60 * 24 * 7, // 7 days
  PHOTOS: 60 * 60 * 24 * 14, // 14 days
  VENUES: 60 * 60 * 24 * 30, // 30 days (venues rarely change)
}

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

// Helper function to invalidate event caches when an event is created or updated
async function invalidateEventCaches(eventId: string, slug: string) {
  console.log(`Invalidating caches for event ${eventId} (${slug})`)

  try {
    // Dynamically import the cache-decorator module
    const { invalidateCache } = await import("./cache-decorator")

    // Delete specific event caches
    await invalidateCache(CACHE_KEYS.EVENT(eventId))
    await invalidateCache(CACHE_KEYS.EVENT_BY_SLUG(slug))

    // Delete collection caches
    await invalidateCache(CACHE_KEYS.ALL_EVENTS)
    await invalidateCache(CACHE_KEYS.UPCOMING_EVENTS)
    await invalidateCache(CACHE_KEYS.PAST_EVENTS)
  } catch (error) {
    console.error(`Error invalidating caches for event ${eventId}:`, error)
  }
}

// Base implementation without caching
async function _getEventById(id: string): Promise<Event | null> {
  try {
    console.log(`Looking for event with ID: ${id}`)

    const { blobs } = await list({
      prefix: `data/events/${id}/`,
    })

    console.log(`Found ${blobs.length} blobs for event ID: ${id}`)

    // Filter for event files (both versioned and unversioned)
    const eventBlobs = blobs.filter((blob) => {
      const filename = blob.pathname.split("/").pop() || ""
      return filename === "event.json" || filename.match(/event-v\d+\.json/)
    })

    console.log(`Found ${eventBlobs.length} event files for event ID: ${id}`)

    const mostRecentEventBlob = getMostRecentEventFile(eventBlobs)

    if (!mostRecentEventBlob) {
      console.log(`No valid event file found for event ID: ${id}`)
      return null
    }

    console.log(`Using event file: ${mostRecentEventBlob.pathname}`)

    const response = await fetch(mostRecentEventBlob.url)
    if (!response.ok) {
      console.error(`Failed to fetch event data: ${response.status} ${response.statusText}`)
      return null
    }

    try {
      const eventData = await response.json()
      console.log(`Successfully parsed event data for ID: ${id}`)

      // Create the full event object with ID
      const event = {
        ...eventData,
        id,
      }

      return event
    } catch (parseError) {
      console.error(`Error parsing JSON for event ${id}:`, parseError)
      return null
    }
  } catch (error) {
    console.error(`Error fetching event ${id} from blob storage:`, error)
    throw error // Propagate the error instead of returning null
  }
}

// Apply caching decorator to the base implementation
export async function getEventById(id: string): Promise<Event | null> {
  try {
    // Dynamically import the cache-decorator module
    const { createCachedFunction } = await import("./cache-decorator")

    // Create a cached version of the function
    const cachedFn = createCachedFunction(_getEventById, "event", CACHE_TTL.EVENTS, (id: string) => id)

    // Call the cached function
    return await cachedFn(id)
  } catch (error) {
    console.error(`Error in getEventById for ${id}:`, error)
    throw error // Propagate the error
  }
}

// Base implementation without caching
async function _getAllEvents(): Promise<Event[]> {
  try {
    console.log(`Fetching all events from blob storage`)

    // List all blobs with events prefix
    const { blobs } = await list({
      prefix: "data/events/",
    })

    // If no blobs are found, return an empty array (this is a valid state)
    if (!blobs || blobs.length === 0) {
      console.log("No event blobs found in storage")
      return []
    }

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

    // If no valid event blobs were found, return an empty array (this is a valid state)
    if (eventBlobsMap.size === 0) {
      console.log("No valid event files found in storage")
      return []
    }

    // Process each event, using the most recent version
    const events = await Promise.all(
      Array.from(eventBlobsMap.entries()).map(async ([eventId, eventBlobs]) => {
        try {
          const mostRecentBlob = getMostRecentEventFile(eventBlobs)
          if (!mostRecentBlob) {
            console.warn(`No valid event file found for event: ${eventId}`)
            return null
          }

          const response = await fetch(mostRecentBlob.url)
          if (!response.ok) {
            console.error(`Failed to fetch event data: ${response.status} ${response.statusText}`)
            throw new Error(`Failed to fetch event data: ${response.status} ${response.statusText}`)
          }

          try {
            const eventData = await response.json()
            return {
              ...eventData,
              id: eventId,
            }
          } catch (parseError) {
            console.error(`Error parsing JSON for event ${eventId}:`, parseError)
            throw parseError
          }
        } catch (error) {
          console.error(`Error processing event ${eventId}:`, error)
          throw error
        }
      }),
    )

    // Filter out null values (failed events) and sort by date
    const validEvents = events.filter((event): event is Event => event !== null)

    // Sort events by date (most recent first)
    const sortedEvents = validEvents.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

    return sortedEvents
  } catch (error) {
    console.error("Error fetching events from blob storage:", error)
    throw error // Propagate the error instead of returning an empty array
  }
}

// Apply caching decorator to the base implementation
export async function getAllEvents(): Promise<Event[]> {
  try {
    // Dynamically import the cache-decorator module
    const { createCachedFunction } = await import("./cache-decorator")

    // Create a cached version of the function
    const cachedFn = createCachedFunction(_getAllEvents, "events", CACHE_TTL.EVENTS, () => "all")

    // Call the cached function
    return await cachedFn()
  } catch (error) {
    console.error("Error in getAllEvents:", error)
    throw error // Propagate the error
  }
}

export async function createEvent(event: Event): Promise<Event> {
  try {
    // Check if the event already exists
    const existingEvent = await getEventById(event.id)
    if (existingEvent) {
      throw new Error(`Event already exists: ${event.id}`)
    }

    // Ensure the ID is valid for blob storage (no spaces, special characters)
    const safeId = event.id
      .toLowerCase()
      .replace(/[^\w-]/g, "-") // Replace any non-word chars (except hyphens) with hyphens
      .replace(/-+/g, "-") // Replace multiple hyphens with a single hyphen
      .replace(/^-|-$/g, "") // Remove leading and trailing hyphens

    if (safeId !== event.id) {
      console.log(`Sanitized event ID from "${event.id}" to "${safeId}" for blob storage compatibility`)
      event.id = safeId
      event.slug = safeId // Update slug to match the sanitized ID
    }

    // Prepare the event data (remove id as it's in the path)
    const { id, ...eventData } = event

    // Convert to JSON
    const eventJson = JSON.stringify(eventData, null, 2)

    // Write the new event to blob storage (using unversioned filename for new events)
    const result = await put(`data/events/${event.id}/event.json`, eventJson, {
      contentType: "application/json",
      access: "public", // Add this line to make the blob publicly accessible
    })

    console.log(`Created new event: ${event.id}`)

    // Invalidate caches
    await invalidateEventCaches(event.id, event.slug)

    // Return the created event
    return event
  } catch (error) {
    console.error(`Error creating event ${event.id}:`, error)
    throw error
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

    console.log(`Found ${blobs.length} blobs for event ID: ${event.id}`)

    // Filter for event files (both versioned and unversioned)
    const eventBlobs = blobs.filter((blob) => {
      const filename = blob.pathname.split("/").pop() || ""
      return filename === "event.json" || filename.match(/event-v\d+\.json/)
    })

    console.log(`Found ${eventBlobs.length} event files for event ID: ${event.id}`)

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
    console.log(`Creating new version ${newVersion} for event ID: ${event.id}`)

    // Create the new filename
    const newFilename = `event-v${newVersion}.json`

    // Prepare the event data (remove id as it's in the path)
    const { id, ...eventData } = event

    // Convert to JSON
    const eventJson = JSON.stringify(eventData, null, 2)

    // Write the new version to blob storage
    try {
      const result = await put(`data/events/${event.id}/${newFilename}`, eventJson, {
        contentType: "application/json",
        access: "public", // Add this line to make the blob publicly accessible
      })

      console.log(`Successfully updated event ${event.id} to version ${newVersion}`)
      console.log(`Blob URL: ${result.url}`)

      // Invalidate caches
      await invalidateEventCaches(event.id, event.slug)
    } catch (putError) {
      console.error(`Error writing to blob storage for event ${event.id}:`, putError)
      throw putError
    }

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

// Base implementation without caching
async function _getUpcomingEvents(): Promise<(Event & { venue: Venue })[]> {
  try {
    console.log(`Fetching upcoming events from blob storage`)

    const events = await getAllEvents()
    const now = new Date()

    // Helper function to normalize date strings for comparison
    const normalizeDate = (dateStr: string): Date => {
      // If the date is just a date without time (YYYY-MM-DD), append time
      if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
        return new Date(`${dateStr}T23:59:59Z`)
      }
      return new Date(dateStr)
    }

    const upcomingEvents = events
      .filter((event) => normalizeDate(event.endDate) >= now)
      .sort((a, b) => normalizeDate(a.date).getTime() - normalizeDate(b.date).getTime())

    // Use synchronous mapping since getEventWithVenue is now synchronous
    const upcomingEventsWithVenue = upcomingEvents.map(getEventWithVenue)

    return upcomingEventsWithVenue
  } catch (error) {
    console.error("Error fetching upcoming events:", error)
    throw error // Propagate the error instead of returning an empty array
  }
}

// Apply caching decorator to the base implementation
export async function getUpcomingEvents(): Promise<(Event & { venue: Venue })[]> {
  try {
    // Dynamically import the cache-decorator module
    const { createCachedFunction } = await import("./cache-decorator")

    // Create a cached version of the function
    const cachedFn = createCachedFunction(_getUpcomingEvents, "events", CACHE_TTL.EVENTS, () => "upcoming")

    // Call the cached function
    return await cachedFn()
  } catch (error) {
    console.error("Error in getUpcomingEvents:", error)
    throw error // Propagate the error
  }
}

// Base implementation without caching
async function _getPastEvents(): Promise<(Event & { venue: Venue })[]> {
  try {
    console.log(`Fetching past events from blob storage`)

    const events = await getAllEvents()
    const now = new Date()

    // Helper function to normalize date strings for comparison
    const normalizeDate = (dateStr: string): Date => {
      // If the date is just a date without time (YYYY-MM-DD), append time
      if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
        return new Date(`${dateStr}T23:59:59Z`)
      }
      return new Date(dateStr)
    }

    const pastEvents = events
      .filter((event) => normalizeDate(event.endDate) < now)
      .sort((a, b) => normalizeDate(b.date).getTime() - normalizeDate(a.date).getTime()) // Note: reverse chronological order

    // Use synchronous mapping since getEventWithVenue is now synchronous
    const pastEventsWithVenue = pastEvents.map(getEventWithVenue)

    return pastEventsWithVenue
  } catch (error) {
    console.error("Error fetching past events:", error)
    throw error // Propagate the error instead of returning an empty array
  }
}

// Apply caching decorator to the base implementation
export async function getPastEvents(): Promise<(Event & { venue: Venue })[]> {
  try {
    // Dynamically import the cache-decorator module
    const { createCachedFunction } = await import("./cache-decorator")

    // Create a cached version of the function
    const cachedFn = createCachedFunction(_getPastEvents, "events", CACHE_TTL.EVENTS, () => "past")

    // Call the cached function
    return await cachedFn()
  } catch (error) {
    console.error("Error in getPastEvents:", error)
    throw error // Propagate the error
  }
}

// Base implementation without caching
async function _getEventPhotos(slug: string): Promise<{ url: string; pathname: string; contentType: string }[]> {
  try {
    console.log(`Fetching photos for event: ${slug}`)

    // List all blobs in the photos directory for this event
    const { blobs } = await list({
      prefix: `data/events/${slug}/photos/`,
    })

    console.log(`Found ${blobs.length} photos for event ID: ${slug}`)

    // Process each blob to get its content type using head()
    const photoBlobs = await Promise.all(
      blobs.map(async (blob) => {
        try {
          // Get the metadata for this blob using head()
          const metadata = await head(blob.url)

          // Only include image files
          if (metadata.contentType && metadata.contentType.startsWith("image/")) {
            return {
              url: blob.url,
              pathname: blob.pathname,
              contentType: metadata.contentType,
            }
          }
          return null
        } catch (error) {
          console.error(`Error getting metadata for blob ${blob.url}:`, error)
          throw error // Propagate the error
        }
      }),
    )

    // Filter out null values (non-image files or errors)
    const photos = photoBlobs.filter(
      (blob): blob is { url: string; pathname: string; contentType: string } => blob !== null,
    )

    return photos
  } catch (error) {
    console.error(`Error fetching photos for event ${slug}:`, error)
    throw error // Propagate the error instead of returning an empty array
  }
}

// Apply caching decorator to the base implementation
export async function getEventPhotos(slug: string): Promise<{ url: string; pathname: string; contentType: string }[]> {
  try {
    // Dynamically import the cache-decorator module
    const { createCachedFunction } = await import("./cache-decorator")

    // Create a cached version of the function
    const cachedFn = createCachedFunction(_getEventPhotos, "photos", CACHE_TTL.PHOTOS, (slug: string) => slug)

    // Call the cached function
    return await cachedFn(slug)
  } catch (error) {
    console.error("Error in getEventPhotos:", error)
    throw error // Propagate the error
  }
}

// Base implementation without caching
async function _getEventBySlug(slug: string): Promise<Event | null> {
  try {
    console.log(`Looking for event with slug: ${slug}`)

    // Get all events
    const events = await getAllEvents()

    // Find the event with the matching slug
    const event = events.find((event) => event.slug === slug)

    if (!event) {
      console.log(`No event found with slug: ${slug}`)
      return null
    }

    console.log(`Found event with slug: ${slug}, ID: ${event.id}`)

    return event
  } catch (error) {
    console.error(`Error fetching event with slug ${slug}:`, error)
    throw error // Propagate the error instead of returning null
  }
}

// Apply caching decorator to the base implementation
export async function getEventBySlug(slug: string): Promise<Event | null> {
  try {
    // Dynamically import the cache-decorator module
    const { createCachedFunction } = await import("./cache-decorator")

    // Create a cached version of the function
    const cachedFn = createCachedFunction(_getEventBySlug, "event_slug", CACHE_TTL.EVENTS, (slug: string) => slug)

    // Call the cached function
    return await cachedFn(slug)
  } catch (error) {
    console.error("Error in getEventBySlug:", error)
    throw error // Propagate the error
  }
}

export async function uploadEventPhoto(
  slug: string,
  file: File,
): Promise<{ url: string; pathname: string; contentType: string }> {
  try {
    console.log(`Uploading photo for event with slug: ${slug}`)

    // Verify the event exists
    const event = await getEventBySlug(slug)
    if (!event) {
      throw new Error(`Event not found with slug: ${slug}`)
    }

    // Generate a unique filename using timestamp
    const timestamp = Date.now()
    const sanitizedFilename = file.name.replace(/[^a-zA-Z0-9.-]/g, "-")
    const uniqueFileName = `${timestamp}-${sanitizedFilename}`

    // Upload the file to blob storage using the event slug
    const blob = await put(`data/events/${slug}/photos/${uniqueFileName}`, file, {
      access: "public",
      contentType: file.type || "application/octet-stream",
      cacheControl: "public, max-age=31536000", // Cache for 1 year
    })

    console.log(`Successfully uploaded photo for event ${slug}: ${blob.url}`)

    // Dynamically import the cache-decorator module
    const { invalidateCache } = await import("./cache-decorator")

    // Invalidate the photos cache for this event
    await invalidateCache(CACHE_KEYS.EVENT_PHOTOS(slug))

    // Return the blob URL and metadata
    return {
      url: blob.url,
      pathname: blob.pathname,
      contentType: blob.contentType || file.type || "application/octet-stream",
    }
  } catch (error) {
    console.error(`Error uploading photo for event ${slug}:`, error)
    throw error
  }
}

// Add this helper function to check if an event is in the past
export function isEventInPast(event: Event): boolean {
  const now = new Date()

  // Helper function to normalize date strings for comparison
  const normalizeDate = (dateStr: string): Date => {
    // If the date is just a date without time (YYYY-MM-DD), append time
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
      return new Date(`${dateStr}T23:59:59Z`)
    }
    return new Date(dateStr)
  }

  return normalizeDate(event.endDate) < now
}
