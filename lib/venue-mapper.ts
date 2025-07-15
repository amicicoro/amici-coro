import type { Database } from '@/lib/supabase/types';
import type { Venue } from '@/types/venue';

type DbVenue = Database['public']['Tables']['venues']['Row'];

/**
 * Maps a database venue to the application Venue type
 */
export function mapDbVenueToVenue(dbVenue: DbVenue): Venue {
  return {
    id: dbVenue.id,
    name: dbVenue.name,
    address: dbVenue.address,
    website: dbVenue.website || undefined,
    timezone: dbVenue.timezone,
    imageUrl: dbVenue.image_url || '',
  };
}

/**
 * Maps an array of database venues to application Venue types
 */
export function mapDbVenuesToVenues(dbVenues: DbVenue[]): Venue[] {
  return dbVenues.map(mapDbVenueToVenue);
}

/**
 * Maps an application Venue to database insert format
 */
export function mapVenueToDbInsert(
  venue: Omit<Venue, 'id'>,
): Omit<DbVenue, 'id' | 'created_at' | 'updated_at'> {
  return {
    name: venue.name,
    address: venue.address,
    website: venue.website || null,
    timezone: venue.timezone,
    image_url: venue.imageUrl || null,
  };
}

/**
 * Maps an application Venue to database update format
 */
export function mapVenueToDbUpdate(
  venue: Partial<Venue>,
): Partial<Omit<DbVenue, 'id' | 'created_at' | 'updated_at'>> {
  const update: Partial<Omit<DbVenue, 'id' | 'created_at' | 'updated_at'>> = {};

  if (venue.name !== undefined) update.name = venue.name;
  if (venue.address !== undefined) update.address = venue.address;
  if (venue.website !== undefined) update.website = venue.website || null;
  if (venue.timezone !== undefined) update.timezone = venue.timezone;
  if (venue.imageUrl !== undefined) update.image_url = venue.imageUrl || null;

  return update;
}
