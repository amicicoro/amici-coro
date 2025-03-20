import type { Venue } from "@/types/venue"
import venuesData from "@/data/venues.json"

// Export the venues data directly
export const venues: Venue[] = venuesData

export async function getAllVenues(): Promise<Venue[]> {
  try {
    // Return the static data sorted alphabetically by name
    return [...venues].sort((a, b) => a.name.localeCompare(b.name))
  } catch (error) {
    console.error("Error fetching venues:", error)
    return []
  }
}

export function getVenueById(id: string): Venue | null {
  // Use synchronous function for now since we're using static data
  return venues.find((v) => v.id === id) || null
}

// Placeholder for future CRUD operations
export async function createVenue(venue: Venue): Promise<Venue> {
  try {
    // Check if the venue already exists
    const existingVenue = getVenueById(venue.id)
    if (existingVenue) {
      throw new Error(`Venue already exists: ${venue.id}`)
    }

    // TODO: Implement venue creation in blob storage
    // For now, just return the venue
    console.log(`Created new venue: ${venue.id}`)
    return venue
  } catch (error) {
    console.error(`Error creating venue ${venue.id}:`, error)
    throw error
  }
}

export async function updateVenue(venue: Venue): Promise<Venue> {
  try {
    // Check if the venue exists
    const existingVenue = getVenueById(venue.id)
    if (!existingVenue) {
      throw new Error(`Venue not found: ${venue.id}`)
    }

    // TODO: Implement venue update in blob storage
    // For now, just return the venue
    console.log(`Updated venue: ${venue.id}`)
    return venue
  } catch (error) {
    console.error(`Error updating venue ${venue.id}:`, error)
    throw error
  }
}

