import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Dynamically import the server-only module
    const { getUpcomingEvents, getEventPhotos } = await import("@/lib/events-data")

    // Use the real data from blob storage
    const events = await getUpcomingEvents()

    // Add photo counts to each event
    const eventsWithPhotoCounts = await Promise.all(
      events.map(async (event) => {
        const photos = await getEventPhotos(event.id)
        return {
          ...event,
          photoCount: photos.length,
        }
      }),
    )

    return NextResponse.json(eventsWithPhotoCounts)
  } catch (error) {
    console.error("Error fetching events:", error)
    return NextResponse.json({ error: "Failed to fetch events" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    // Check for auth token
    const authToken = request.headers.get("X-Admin-Auth-Token")
    if (!authToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Dynamically import the server-only module
    const { createEvent } = await import("@/lib/events-data")

    const eventData = await request.json()
    console.log("Received event data:", eventData)

    // Generate a unique ID if not provided
    if (!eventData.id) {
      eventData.id = `event-${Date.now()}`
    }

    // Generate a slug if not provided
    if (!eventData.slug) {
      eventData.slug = eventData.title
        .toLowerCase()
        .replace(/[^\w\s]/gi, "")
        .replace(/\s+/g, "-")
    }

    // Validate required fields
    const requiredFields = ["title", "date", "endDate", "venueId"]
    for (const field of requiredFields) {
      if (!eventData[field]) {
        return NextResponse.json({ error: `Missing required field: ${field}` }, { status: 400 })
      }
    }

    // Ensure schedule is an array
    if (!eventData.schedule) {
      eventData.schedule = []
    }

    // Ensure musicList is an object
    if (!eventData.musicList) {
      eventData.musicList = {}
    }

    // Create the event using the real data function
    const newEvent = await createEvent(eventData)

    return NextResponse.json(newEvent, { status: 201 })
  } catch (error) {
    console.error("Error creating event:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create event" },
      { status: 500 },
    )
  }
}
