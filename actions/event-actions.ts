'use server';

import {
  mapDbEventToEvent,
  mapDbEventsToEvents,
  mapEventToDbInsert,
  mapEventToDbUpdate,
} from '@/lib/event-mapper';
import { createClient } from '@/lib/supabase/server';
import type { Database } from '@/lib/supabase/types';
import type { Event } from '@/types/event';
import { revalidatePath } from 'next/cache';

type DbEvent = Database['public']['Tables']['events']['Row'];

type EventFilters = {
  endDateGte?: string;
  endDateLt?: string;
};

export async function getEvents(filters: EventFilters = {}): Promise<Event[]> {
  const supabase = await createClient();
  let query = supabase.from('events').select('*');
  if (filters.endDateGte) {
    query = query.gte('end_date', filters.endDateGte);
  }
  if (filters.endDateLt) {
    query = query.lt('end_date', filters.endDateLt);
  }
  // Always order by start_date descending (most recent first)
  query = query.order('start_date', { ascending: false });
  const { data, error } = await query;
  if (error) {
    console.error('Error fetching events:', error);
    throw new Error('Failed to fetch events');
  }
  return mapDbEventsToEvents(data || []);
}

export async function getAllEvents(): Promise<Event[]> {
  return getEvents();
}

export async function getEventById(id: string): Promise<Event | null> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('id', id)
      .single();
    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      console.error('Error fetching event:', error);
      throw new Error('Failed to fetch event');
    }
    return mapDbEventToEvent(data);
  } catch (error) {
    console.error('Error in getEventById:', error);
    throw new Error('Failed to fetch event');
  }
}

export async function getEventBySlug(slug: string): Promise<Event | null> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('slug', slug)
      .single();
    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      console.error('Error fetching event by slug:', error);
      throw new Error('Failed to fetch event by slug');
    }
    return mapDbEventToEvent(data);
  } catch (error) {
    console.error('Error in getEventBySlug:', error);
    throw new Error('Failed to fetch event by slug');
  }
}

export async function createEvent(
  eventData: Omit<Event, 'id'>,
): Promise<Event> {
  try {
    const supabase = await createClient();
    const dbEventData = mapEventToDbInsert(eventData);
    const { data, error } = await supabase
      .from('events')
      .insert(dbEventData)
      .select()
      .single();
    if (error) {
      console.error('Error creating event:', error);
      throw new Error('Failed to create event');
    }
    revalidatePath('/admin/events');
    return mapDbEventToEvent(data);
  } catch (error) {
    console.error('Error in createEvent:', error);
    throw error;
  }
}

export async function updateEvent(
  id: string,
  eventData: Partial<Event>,
): Promise<Event> {
  try {
    const supabase = await createClient();
    const dbEventData = mapEventToDbUpdate(eventData);
    const { data, error } = await supabase
      .from('events')
      .update(dbEventData)
      .eq('id', id)
      .select()
      .single();
    if (error) {
      console.error('Error updating event:', error);
      throw new Error('Failed to update event');
    }
    revalidatePath('/admin/events');
    revalidatePath(`/admin/events/${id}`);
    return mapDbEventToEvent(data);
  } catch (error) {
    console.error('Error in updateEvent:', error);
    throw error;
  }
}

export async function deleteEvent(id: string): Promise<void> {
  try {
    const supabase = await createClient();
    const { error } = await supabase.from('events').delete().eq('id', id);
    if (error) {
      console.error('Error deleting event:', error);
      throw new Error('Failed to delete event');
    }
    revalidatePath('/admin/events');
  } catch (error) {
    console.error('Error in deleteEvent:', error);
    throw error;
  }
}

export async function searchEvents(query: string): Promise<Event[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .or(`title.ilike.%${query}%,description.ilike.%${query}%`)
      .order('date', { ascending: false });
    if (error) {
      console.error('Error searching events:', error);
      throw new Error('Failed to search events');
    }
    return mapDbEventsToEvents(data || []);
  } catch (error) {
    console.error('Error in searchEvents:', error);
    throw new Error('Failed to search events');
  }
}
