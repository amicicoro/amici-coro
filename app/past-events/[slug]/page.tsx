import { getEventBySlug } from '@/actions/event-actions';
import { getAllVenues } from '@/actions/venues-actions';
import { NotFoundContent } from '@/components/common/not-found-content';
import EventDetailPage from '@/components/events/event-detail-page';
import { getEventPhotos } from '@/lib/events-data';

interface PastEventPageProps {
  params: { slug: string };
}

export default async function PastEventPage({ params }: PastEventPageProps) {
  const event = await getEventBySlug(params.slug);
  const venues = await getAllVenues();
  if (!event) {
    return (
      <main className='flex-1 flex items-center justify-center'>
        <NotFoundContent
          title='Past Event Not Found'
          message="We're sorry, but the past event you're looking for doesn't exist or has been removed."
          buttonText='View All Past Events'
          buttonHref='/past-events'
        />
      </main>
    );
  }
  const venue = venues.find(v => v.id === event.venueId) || {
    id: '',
    name: '',
    address: '',
    timezone: '',
    imageUrl: '',
  };
  const photos = await getEventPhotos(params.slug);
  return (
    <EventDetailPage event={event} venue={venue} isPastEvent photos={photos} />
  );
}
