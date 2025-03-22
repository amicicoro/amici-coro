import { type NextRequest, NextResponse } from "next/server"
import { getEventPhotos } from "@/lib/events-data"

export async function GET(request: NextRequest, { params }: { params: { slug: string } }) {
  try {
    const { slug } = params
    console.log(`API: Fetching photos for event with slug: ${slug}`)

    // Get photos for the event
    const photos = await getEventPhotos(slug)
    console.log(`API: Found ${photos.length} photos for event: ${slug}`)

    // Return the photos array in the expected format
    return NextResponse.json({ photos })
  } catch (error) {
    console.error("Error fetching photos:", error)
    return NextResponse.json({ error: "Failed to fetch photos" }, { status: 500 })
  }
}

