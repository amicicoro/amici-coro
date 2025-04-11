import { type NextRequest, NextResponse } from "next/server"
import type { Event } from "@/types/event"

export async function GET(request: Request, { params }: { params: { slug: string } }) {
  const { slug } = params
  try {
    console.log(`API: Looking for event with slug: ${slug}`)

    // Dynamically import the server-only module
    const { getAllEvents, getEventWithVenue } = await import("@/lib/events-data")

    // First get all events and find the one with matching slug
    const events = await getAllEvents()
    const event = events.find((event) => event.slug === slug)

    if (!event) {
      console.log(`API: Event not found for slug: ${slug}`)
      return NextResponse.json({ error: "Event not found" }, { status: 404 })
    }

    // Now get the full event with venue data
    const eventWithVenue = getEventWithVenue(event)

    console.log(`API: Found event with slug ${slug}, ID: ${event.id}`)
    return NextResponse.json(eventWithVenue)
  } catch (error) {
    console.error(`API: Error fetching event with slug ${slug}:`, error)
    return NextResponse.json({ error: "Error fetching event" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { slug: string } }) {
  try {
    // Check for auth token
    const authToken = request.headers.get("X-Admin-Auth-Token")
    if (!authToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const slug = params.slug
    if (!slug) {
      return NextResponse.json({ error: "Event slug is required" }, { status: 400 })
    }

    console.log(`API: Updating event with slug: ${slug}`)

    // Find the event by slug first
    const { getAllEvents, updateEvent } = await import("@/lib/events-data")
    const events = await getAllEvents()
    const existingEvent = events.find((event) => event.slug === slug)

    if (!existingEvent) {
      console.log(`API: Event not found with slug: ${slug}`)
      return NextResponse.json({ error: "Event not found" }, { status: 404 })
    }

    // IMPORTANT: Read the request body only once and store it
    let eventData: any
    try {
      // Clone the request to avoid "body stream already read" errors
      const clonedRequest = request.clone()
      eventData = await clonedRequest.json()
      console.log("API: Received complete event update data:", JSON.stringify(eventData, null, 2))
    } catch (parseError) {
      console.error("API: Error parsing request body:", parseError)
      return NextResponse.json({ error: "Invalid JSON in request body" }, { status: 400 })
    }

    // Validate required fields
    const requiredFields = ["title", "date", "endDate", "venueId"]
    for (const field of requiredFields) {
      if (!eventData[field]) {
        console.log(`API: Missing required field: ${field}`)
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

    // Make sure we're using the correct ID from the existing event
    eventData.id = existingEvent.id

    // Update the event
    try {
      const updatedEvent = await updateEvent(eventData as Event)
      console.log(`API: Successfully updated event: ${slug}`)
      return NextResponse.json(updatedEvent)
    } catch (updateError) {
      console.error(`API: Error in updateEvent function:`, updateError)
      return NextResponse.json(
        { error: updateError instanceof Error ? updateError.message : "Failed to update event in storage" },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("API: Error updating event:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update event" },
      { status: 500 },
    )
  }
}
