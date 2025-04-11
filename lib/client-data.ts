export async function fetchEvents(type: "all" | "upcoming" | "past" = "all") {
  const endpoint = type === "past" ? "/api/past-events" : "/api/events"
  const response = await fetch(endpoint)
  if (!response.ok) {
    throw new Error(`Failed to fetch events: ${response.status}`)
  }
  return response.json()
}

// Fetch a single event by slug
export async function fetchEventBySlug(slug: string) {
  const response = await fetch(`/api/events/${slug}`)
  if (!response.ok) {
    throw new Error(`Failed to fetch event: ${response.status}`)
  }
  return response.json()
}

// Fetch all venues
export async function fetchVenues() {
  const response = await fetch("/api/venues")
  if (!response.ok) {
    throw new Error(`Failed to fetch venues: ${response.status}`)
  }
  return response.json()
}

// Fetch event photos
export async function fetchEventPhotos(slug: string) {
  const response = await fetch(`/api/events/${slug}/photos`)
  if (!response.ok) {
    throw new Error(`Failed to fetch event photos: ${response.status}`)
  }
  return response.json()
}
