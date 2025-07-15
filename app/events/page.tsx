import { getEvents } from '@/actions/event-actions';
import { getAllVenues } from '@/actions/venues-actions';
import { EventCard } from '@/components/events/event-card';
import { EventFilters } from '@/components/events/event-filters';
import { EventsHero } from '@/components/events/events-hero';

export default async () => {
  const [events, venues] = await Promise.all([
    getEvents({ endDateGte: new Date().toISOString() }),
    getAllVenues(),
  ]);
  // Join venue info to each event
  const eventsWithVenue = events.map(event => ({
    ...event,
    venue: venues.find(v => v.id === event.venueId) || {
      id: '',
      name: '',
      address: '',
      timezone: '',
      imageUrl: '',
    },
  }));

  // Filtering and sorting will be handled client-side for now
  // (If you want to move it server-side, you can add search/sort params to getEvents)

  return (
    <>
      <EventsHero title='Upcoming Events' />

      <main className='flex-1 container mx-auto px-6 sm:px-8 md:px-12 py-12'>
        <div className='max-w-6xl mx-auto'>
          <EventFilters events={eventsWithVenue} />
          {eventsWithVenue.length === 0 ? (
            <p className='text-center text-gray-600'>
              No events found. Please try a different search.
            </p>
          ) : (
            <div className='grid gap-8 md:grid-cols-2 lg:grid-cols-3'>
              {eventsWithVenue.map(event => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  );
};
