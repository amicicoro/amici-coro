export interface MusicItem {
  type?: string; // Optional - e.g., "Responses", "Psalms", "Canticles", "Anthem"
  title: string; // Changed from 'name' to 'title' - e.g., "Ayleward", "18", "Evening Service in D", or free text
  composer?: string; // Optional - e.g., "Brewer", "Gjeilo"
}

export interface ScheduleItem {
  date: string;
  startTime?: string;
  description: string;
}

// Event type with the musicList structure as a map (reverted)
export interface Event {
  id: string;
  slug: string;
  title: string;
  subtitle?: string;
  description: string;
  startDate: string;
  endDate: string;
  venueId: string;
  imageUrl?: string;
  schedule?: ScheduleItem[];
  musicList?: { [key: string]: MusicItem[] };
}
