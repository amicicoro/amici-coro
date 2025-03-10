import { promises as fs } from "fs"
import path from "path"
import type { Event, Venue } from "@/types/event"
import venuesData from "@/data/venues.json"

export const venues: Venue[] = venuesData

export async function getAllEvents(): Promise<Event[]> {
  // Get events from the main events directory
  const eventsDirectory = path.join(process.cwd(), "data/events")
  const pastEventsDirectory = path.join(process.cwd(), "data/past-events")

  let eventFiles: string[] = []
  let pastEventFiles: string[] = []

  try {
    eventFiles = await fs.readdir(eventsDirectory)
  } catch (error) {
    console.error("Error reading events directory:", error)
  }

  try {
    pastEventFiles = await fs.readdir(pastEventsDirectory)
  } catch (error) {
    console.error("Error reading past events directory:", error)
  }

  // Load events from both directories
  const events = await Promise.all([
    ...eventFiles.map(async (filename) => {
      const filePath = path.join(eventsDirectory, filename)
      const fileContents = await fs.readFile(filePath, "utf8")
      return JSON.parse(fileContents) as Event
    }),
    ...pastEventFiles.map(async (filename) => {
      const filePath = path.join(pastEventsDirectory, filename)
      const fileContents = await fs.readFile(filePath, "utf8")
      return JSON.parse(fileContents) as Event
    }),
  ])

  return events
}

export function getEventWithVenue(event: Event): Event & { venue: Venue } {
  const venue = venues.find((v) => v.id === event.venueId)
  if (!venue) {
    throw new Error(`Venue not found for event: ${event.id}`)
  }
  return { ...event, venue }
}

export async function getUpcomingEvents(): Promise<(Event & { venue: Venue })[]> {
  const events = await getAllEvents()
  const now = new Date()

  const upcomingEvents = events
    .filter((event) => new Date(event.endDate) >= now)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  return upcomingEvents.map(getEventWithVenue)
}

export async function getPastEvents(): Promise<(Event & { venue: Venue })[]> {
  const events = await getAllEvents()
  const now = new Date()

  const pastEvents = events
    .filter((event) => new Date(event.endDate) < now)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()) // Note: reverse chronological order

  return pastEvents.map(getEventWithVenue)
}

