import { getEventBySlug } from '@/actions/event-actions';
import { getAllVenues } from '@/actions/venues-actions';
import { EventForm } from '@/components/admin/event-form';
import { notFound } from 'next/navigation';

interface EditEventPageProps {
  params: { slug: string };
}

export default async function EditEventPage({ params }: EditEventPageProps) {
  const event = await getEventBySlug(params.slug);
  if (!event) return notFound();
  const venues = await getAllVenues();
  return <EventForm event={event} venues={venues} mode='edit' />;
}
