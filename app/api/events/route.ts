import { NextResponse } from "next/server"
import { getUpcomingEvents } from "@/lib/events-data"

export async function GET() {
  const upcomingEvents = await getUpcomingEvents()
  return NextResponse.json(upcomingEvents)
}

