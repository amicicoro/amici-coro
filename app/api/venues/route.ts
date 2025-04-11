import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Dynamically import the server-only module
    const { getAllVenues } = await import("@/lib/venues-data")

    // Fetch all venues using the existing function
    const venues = await getAllVenues()

    // Return the venues as JSON
    return NextResponse.json(venues)
  } catch (error) {
    console.error("Error fetching venues:", error)
    return NextResponse.json({ error: "Failed to fetch venues" }, { status: 500 })
  }
}
