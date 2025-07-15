import type { Database } from '@/lib/supabase/types';
import type { Event, MusicItem, ScheduleItem } from '@/types/event';

export type DbEvent = Database['public']['Tables']['events']['Row'];

function mapDbScheduleToSchedule(dbSchedule: any): ScheduleItem[] | undefined {
  if (!dbSchedule) return undefined;
  return (Array.isArray(dbSchedule) ? dbSchedule : []).map((item: any) => ({
    date: item.date,
    startTime: item.start_time,
    description: item.description,
  }));
}

function mapScheduleToDbSchedule(schedule: ScheduleItem[] | undefined): any {
  if (!schedule) return null;
  return schedule.map(item => ({
    date: item.date,
    start_time: item.startTime,
    description: item.description,
  }));
}

function mapDbMusicListToMusicList(
  dbMusicList: any,
): { [key: string]: MusicItem[] } | undefined {
  if (!dbMusicList) return undefined;
  return typeof dbMusicList === 'object' && !Array.isArray(dbMusicList)
    ? dbMusicList
    : undefined;
}

function mapMusicListToDbMusicList(
  musicList: { [key: string]: MusicItem[] } | undefined,
): any {
  if (!musicList) return null;
  return musicList;
}

export function mapDbEventToEvent(dbEvent: DbEvent): Event {
  return {
    id: dbEvent.id,
    slug: dbEvent.slug,
    title: dbEvent.title,
    subtitle: dbEvent.subtitle,
    description: dbEvent.description,
    startDate: dbEvent.start_date,
    endDate: dbEvent.end_date,
    venueId: dbEvent.venue_id,
    imageUrl: dbEvent.image_url || undefined,
    schedule: mapDbScheduleToSchedule(dbEvent.schedule),
    musicList: mapDbMusicListToMusicList(dbEvent.music_list),
  };
}

export function mapDbEventsToEvents(dbEvents: DbEvent[]): Event[] {
  return dbEvents.map(mapDbEventToEvent);
}

export function mapEventToDbInsert(
  event: Omit<Event, 'id'>,
): Omit<DbEvent, 'id' | 'created_at' | 'updated_at'> {
  return {
    slug: event.slug,
    title: event.title,
    subtitle: event.subtitle,
    description: event.description,
    start_date: event.startDate,
    end_date: event.endDate,
    venue_id: event.venueId,
    image_url: event.imageUrl || null,
    schedule: mapScheduleToDbSchedule(event.schedule),
    music_list: mapMusicListToDbMusicList(event.musicList),
  };
}

export function mapEventToDbUpdate(
  event: Partial<Event>,
): Partial<Omit<DbEvent, 'id' | 'created_at' | 'updated_at'>> {
  const update: Partial<Omit<DbEvent, 'id' | 'created_at' | 'updated_at'>> = {};

  if (event.slug !== undefined) update.slug = event.slug;
  if (event.title !== undefined) update.title = event.title;
  if (event.subtitle !== undefined) update.subtitle = event.subtitle;
  if (event.description !== undefined) update.description = event.description;
  if (event.startDate !== undefined) update.start_date = event.startDate;
  if (event.endDate !== undefined) update.end_date = event.endDate;
  if (event.venueId !== undefined) update.venue_id = event.venueId;
  if (event.imageUrl !== undefined) update.image_url = event.imageUrl || null;
  if (event.schedule !== undefined)
    update.schedule = mapScheduleToDbSchedule(event.schedule);
  if (event.musicList !== undefined)
    update.music_list = mapMusicListToDbMusicList(event.musicList);

  return update;
}
