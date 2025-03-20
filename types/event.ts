// MusicItem represents a piece of music with optional type, title, and optional composer
export interface MusicItem {
  type?: string;   // Optional - e.g., "Responses", "Psalms", "Canticles", "Anthem"
  title: string;   // Changed from 'name' to 'title' - e.g., "Ayleward", "18", "Evening Service in D", or free text
  composer?: string; // Optional - e.g., "Brewer", "Gjeilo"
}

// Event type with the musicList structure as a map (reverted)
export interface Event {
  id: string;
  title: string;
  isResidency: boolean;
  date: string;
  endDate: string;
  venueId: string;
  slug: string;
  description: string;
  schedule: {
    date: string;
    description: string;
  }[];
  musicList: {
    [key: string]: MusicItem[];
  };
}