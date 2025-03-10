import { events } from "@/lib/events-data"

export async function getEventBySlug(slug: string) {
  const allEvents = [...events]
  return allEvents.find((event) => event.slug === slug)
}

