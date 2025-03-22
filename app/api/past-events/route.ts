import { NextResponse } from "next/server"
import { getPastEvents } from "@/lib/events-data"

export async function GET() {
  try {
    // Use the real data from blob storage
    const pastEvents = await getPastEvents()

    // Return the events with cache control headers
    return NextResponse.json(pastEvents, {
      headers: {
        // Cache for a short time (30 seconds) to balance freshness and performance
        "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60",
      },
    })
  } catch (error) {
    console.error("Error fetching past events:", error)
    return NextResponse.json({ error: "Failed to fetch past events" }, { status: 500 })
  }
}

