import { getEventBySlug } from '@/actions/event-actions';
import { getAllVenues } from '@/actions/venues-actions';
import { NotFoundContent } from '@/components/common/not-found-content';
import EventDetailPage from '@/components/events/event-detail-page';

interface EventPageProps {
  params: { slug: string };
}

export default async function EventPage({ params }: EventPageProps) {
  const event = await getEventBySlug(params.slug);
  const venues = await getAllVenues();
  if (!event) {
    return (
      <main className='flex-1 flex items-center justify-center'>
        <NotFoundContent
          title='Event Not Found'
          message="We're sorry, but the event you're looking for doesn't exist or has been removed."
          buttonText='View All Events'
          buttonHref='/events'
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
  return <EventDetailPage event={event} venue={venue} />;
}
