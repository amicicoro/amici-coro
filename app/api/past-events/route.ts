import { NextResponse } from "next/server"
import { getPastEvents } from "@/lib/events-data"

export async function GET() {
  try {
    // Use the real data from blob storage
    const pastEvents = await getPastEvents()
    return NextResponse.json(pastEvents)
  } catch (error) {
    console.error("Error fetching past events:", error)
    return NextResponse.json({ error: "Failed to fetch past events" }, { status: 500 })
  }
}

