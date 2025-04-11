import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Dynamically import the server-only module
    const { getPastEvents } = await import("@/lib/events-data")

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
