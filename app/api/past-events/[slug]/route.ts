import { NextResponse } from "next/server"
import { promises as fs } from "fs"
import path from "path"
import { getEventWithVenue } from "@/lib/events-data"

export async function GET(request: Request, { params }: { params: { slug: string } }) {
  const { slug } = params

  // Check in both directories during transition
  const eventsDirectory = path.join(process.cwd(), "data/events")

    try {
      const filePath = path.join(eventsDirectory, `${slug}.json`)
      const fileContents = await fs.readFile(filePath, "utf8")
      const event = JSON.parse(fileContents)

      // Check if this is actually a past event
      const now = new Date()
      if (new Date(event.endDate) >= now) {
        return NextResponse.json({ error: "This is not a past event" }, { status: 400 })
      }

      const eventWithVenue = getEventWithVenue(event)
      return NextResponse.json(eventWithVenue)
    } catch (secondError) {
      console.error(`Error reading past event file: ${secondError}`)
      return NextResponse.json({ error: "Past event not found" }, { status: 404 })
    }

}

