export interface MusicItem {
  type?: string // Optional - e.g., "Responses", "Psalms", "Canticles", "Anthem"
  title: string // Changed from 'name' to 'title' - e.g., "Ayleward", "18", "Evening Service in D", or free text
  composer?: string // Optional - e.g., "Brewer", "Gjeilo"
}

// Event type with the musicList structure as a map (reverted)
export interface Event {
  id: string
  slug: string
  title: string
  description: string
  date: string
  endDate: string
  time: string
  venueId: string
  imageUrl?: string
  status: "draft" | "published"
  photoCount?: number
}

export interface Venue {
  id: string
  name: string
  address: string
  website?: string
  timezone: string
  imageUrl: string
}

