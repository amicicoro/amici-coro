'use client';

import { EventCard } from '@/components/events/event-card';
import { EventFilters } from '@/components/events/event-filters';
import type { Event } from '@/types/event';
import type { Venue } from '@/types/venue';
import { useState } from 'react';

interface PastEventListWithFiltersProps {
  events: (Event & { venue: Venue })[];
}

export default function PastEventListWithFilters({
  events,
}: PastEventListWithFiltersProps) {
  const [filteredEvents, setFilteredEvents] = useState(events);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortKey, setSortKey] = useState<'date' | 'title' | 'venue' | null>(
    null,
  );

  const handleSearch = (term: string) => {
    setSearchQuery(term);
    const filtered = events.filter(
      event =>
        event.title.toLowerCase().includes(term.toLowerCase()) ||
        event.description?.toLowerCase().includes(term.toLowerCase()) ||
        event.venue.name.toLowerCase().includes(term.toLowerCase()),
    );
    setFilteredEvents(filtered);
  };

  const handleSort = (key: 'date' | 'title' | 'venue') => {
    setSortKey(prevKey => {
      const newKey = prevKey === key ? null : key;
      if (newKey) {
        const sorted = [...filteredEvents].sort((a, b) => {
          if (newKey === 'date') {
            return (
              new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
            );
          } else if (newKey === 'title') {
            return a.title.localeCompare(b.title);
          } else if (newKey === 'venue') {
            return a.venue.name.localeCompare(b.venue.name);
          }
          return 0;
        });
        setFilteredEvents(sorted);
      }
      return newKey;
    });
  };

  return (
    <>
      <EventFilters onSearch={handleSearch} onSort={handleSort} />
      {filteredEvents.length === 0 ? (
        <p className='text-center text-gray-600'>
          No past events found. Please try a different search.
        </p>
      ) : (
        <div className='grid gap-8 md:grid-cols-2 lg:grid-cols-3'>
          {filteredEvents.map(event => (
            <EventCard key={event.id} event={event} isPastEvent={true} />
          ))}
        </div>
      )}
    </>
  );
}
