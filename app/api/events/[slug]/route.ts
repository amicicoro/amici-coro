import { NextResponse } from "next/server"
import { promises as fs } from "fs"
import path from "path"
import { getEventWithVenue } from "@/lib/events-data"

export async function GET(request: Request, { params }: { params: { slug: string } }) {
  const { slug } = params
  const eventsDirectory = path.join(process.cwd(), "data/events")
  const eventFiles = await fs.readdir(eventsDirectory)

  // Find the file that matches the slug
  const eventFile = eventFiles.find((filename) => filename === `${slug}.json`)

  if (!eventFile) {
    return NextResponse.json({ error: "Event not found" }, { status: 404 })
  }

  try {
    const filePath = path.join(eventsDirectory, eventFile)
    const fileContents = await fs.readFile(filePath, "utf8")
    const event = JSON.parse(fileContents)
    const eventWithVenue = getEventWithVenue(event)
    return NextResponse.json(eventWithVenue)
  } catch (error) {
    console.error(`Error reading event file: ${error}`)
    return NextResponse.json({ error: "Event not found" }, { status: 404 })
  }
}

