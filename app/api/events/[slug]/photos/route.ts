import { type NextRequest, NextResponse } from "next/server"
import { getEventBySlug, getEventPhotos } from "@/lib/events-data"

export async function GET(request: NextRequest, { params }: { params: { slug: string } }) {
  try {
    const { slug } = params

    // Get photos for the event
    const photos = await getEventPhotos(slug)

    return NextResponse.json({ photos })
  } catch (error) {
    console.error("Error fetching photos:", error)
    return NextResponse.json({ error: "Failed to fetch photos" }, { status: 500 })
  }
}

