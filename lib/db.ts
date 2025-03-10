import { events } from "@/lib/events-data"
import { pastEvents } from "@/lib/past-events-data"

export async function getEventBySlug(slug: string) {
  const allEvents = [...pastEvents, ...events]
  return allEvents.find((event) => event.slug === slug)
}

