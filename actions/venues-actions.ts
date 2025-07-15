'use server';

import { createClient } from '@/lib/supabase/server';
import type { Database } from '@/lib/supabase/types';
import {
  mapDbVenueToVenue,
  mapDbVenuesToVenues,
  mapVenueToDbInsert,
  mapVenueToDbUpdate,
} from '@/lib/venue-mapper';
import type { Venue } from '@/types/venue';
import { revalidatePath } from 'next/cache';

type DbVenue = Database['public']['Tables']['venues']['Row'];

export async function getAllVenues(): Promise<Venue[]> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('venues')
      .select('*')
      .order('name');

    if (error) {
      console.error('Error fetching venues:', error);
      throw new Error('Failed to fetch venues');
    }

    return mapDbVenuesToVenues(data || []);
  } catch (error) {
    console.error('Error in getAllVenues:', error);
    throw new Error('Failed to fetch venues');
  }
}

export async function getVenueById(id: string): Promise<Venue | null> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('venues')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No rows returned
        return null;
      }
      console.error('Error fetching venue:', error);
      throw new Error('Failed to fetch venue');
    }

    return mapDbVenueToVenue(data);
  } catch (error) {
    console.error('Error in getVenueById:', error);
    throw new Error('Failed to fetch venue');
  }
}

export async function createVenue(
  venueData: Omit<Venue, 'id'>,
): Promise<Venue> {
  try {
    const supabase = await createClient();

    // Check if user is admin
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('Unauthorized');
    }

    const { data: roleData } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .single();

    if (!roleData) {
      throw new Error('Insufficient permissions');
    }

    const dbVenueData = mapVenueToDbInsert(venueData);

    const { data, error } = await supabase
      .from('venues')
      .insert(dbVenueData)
      .select()
      .single();

    if (error) {
      console.error('Error creating venue:', error);
      throw new Error('Failed to create venue');
    }

    revalidatePath('/admin/venues');
    return mapDbVenueToVenue(data);
  } catch (error) {
    console.error('Error in createVenue:', error);
    throw error;
  }
}

export async function updateVenue(
  id: string,
  venueData: Partial<Venue>,
): Promise<Venue> {
  try {
    const supabase = await createClient();

    // Check if user is admin
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('Unauthorized');
    }

    const { data: roleData } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .single();

    if (!roleData) {
      throw new Error('Insufficient permissions');
    }

    const dbVenueData = mapVenueToDbUpdate(venueData);

    const { data, error } = await supabase
      .from('venues')
      .update(dbVenueData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating venue:', error);
      throw new Error('Failed to update venue');
    }

    revalidatePath('/admin/venues');
    revalidatePath(`/admin/venues/${id}`);
    return mapDbVenueToVenue(data);
  } catch (error) {
    console.error('Error in updateVenue:', error);
    throw error;
  }
}

export async function deleteVenue(id: string): Promise<void> {
  try {
    const supabase = await createClient();

    // Check if user is admin
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('Unauthorized');
    }

    const { data: roleData } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .single();

    if (!roleData) {
      throw new Error('Insufficient permissions');
    }

    const { error } = await supabase.from('venues').delete().eq('id', id);

    if (error) {
      console.error('Error deleting venue:', error);
      throw new Error('Failed to delete venue');
    }

    revalidatePath('/admin/venues');
  } catch (error) {
    console.error('Error in deleteVenue:', error);
    throw error;
  }
}

export async function searchVenues(query: string): Promise<Venue[]> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('venues')
      .select('*')
      .or(`name.ilike.%${query}%,address.ilike.%${query}%`)
      .order('name');

    if (error) {
      console.error('Error searching venues:', error);
      throw new Error('Failed to search venues');
    }

    return mapDbVenuesToVenues(data || []);
  } catch (error) {
    console.error('Error in searchVenues:', error);
    throw new Error('Failed to search venues');
  }
}
