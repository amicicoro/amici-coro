import { NextResponse } from "next/server"
import { promises as fs } from "fs"
import path from "path"
import { getEventById, getEventWithVenue } from "@/lib/events-data"

export async function GET(request: Request, { params }: { params: { slug: string } }) {
  const { slug } = await params
  try {
    const event = await getEventById(slug);
    if (!!!event) {
     return NextResponse.json({ error: "Event not found" }, { status: 404 })
    }
    const eventWithVenue = getEventWithVenue(event);
    return NextResponse.json(eventWithVenue)
  } catch (error) {
    console.error(`Error reading event file: ${error}`)
    return NextResponse.json({ error: "Event not found" }, { status: 404 })
  }
}

