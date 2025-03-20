import { type NextRequest, NextResponse } from "next/server"
import { createEvent, getUpcomingEvents } from "@/lib/events-data"
import type { Event } from "@/types/event"

export async function GET() {
  try {
    // Use the real data from blob storage
    const upcomingEvents = await getUpcomingEvents()
    return NextResponse.json(upcomingEvents)
  } catch (error) {
    console.error("Error fetching events:", error)
    return NextResponse.json({ error: "Failed to fetch events" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check for auth token
    const authToken = request.headers.get("X-Admin-Auth-Token")
    if (!authToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const eventData = await request.json()

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

    // Create the event using the real data function
    const newEvent = await createEvent(eventData as Event)

    return NextResponse.json(newEvent, { status: 201 })
  } catch (error) {
    console.error("Error creating event:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create event" },
      { status: 500 },
    )
  }
}

