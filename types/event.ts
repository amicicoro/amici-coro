export interface Event {
  id: string
  title: string
  date: string
  endDate: string
  venueId: string
  slug: string
  description?: string
  isResidency: boolean
  schedule?: {
    date: string
    description: string
  }[]
  musicList?: {
    [key: string]: string[]
  }
  photos?: string[]
}

export interface Venue {
  id: string
  name: string
  address: string
  website?: string
  timezone: string
  imageUrl: string
}

