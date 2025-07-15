import { getAllVenues } from '@/actions/venues-actions';
import { EventForm } from '@/components/admin/event-form';

export default async function CreateEventPage() {
  const venues = await getAllVenues();
  return <EventForm venues={venues} mode='create' />;
}
