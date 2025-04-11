import { NextResponse } from "next/server"

export async function GET(request: Request, { params }: { params: { slug: string } }) {
  try {
    const { slug } = await params

    // Dynamically import the server-only module
    const { getEventById, getEventWithVenue, isEventInPast } = await import("@/lib/events-data")

    const event = await getEventById(slug)
    if (!event) {
      return NextResponse.json({ error: "Past event not found" }, { status: 404 })
    }

    // Check if this is actually a past event using our new helper function
    if (!isEventInPast(event)) {
      return NextResponse.json({ error: "This is not a past event" }, { status: 400 })
    }

    const eventWithVenue = getEventWithVenue(event)
    return NextResponse.json(eventWithVenue)
  } catch (secondError) {
    console.error(`Error reading past event file: ${secondError}`)
    return NextResponse.json({ error: "Past event not found" }, { status: 404 })
  }
}

