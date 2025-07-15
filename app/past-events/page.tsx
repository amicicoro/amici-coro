import { getEvents } from '@/actions/event-actions';
import { getAllVenues } from '@/actions/venues-actions';
import { EventsHero } from '@/components/events/events-hero';
import PastEventListWithFilters from '@/components/events/past-event-list-with-filters';

export default async () => {
  const [events, venues] = await Promise.all([
    getEvents({ endDateLt: new Date().toISOString() }),
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

  return (
    <>
      <EventsHero title='Past Events' />
      <main className='flex-1 container mx-auto px-6 sm:px-8 md:px-12 py-12'>
        <div className='max-w-6xl mx-auto'>
          <PastEventListWithFilters events={eventsWithVenue} />
        </div>
      </main>
    </>
  );
};
