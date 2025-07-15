import { getVenueById } from '@/actions/venues-actions';
import { VenueForm } from '@/components/admin/venue-form';
import { notFound } from 'next/navigation';

interface EditVenuePageProps {
  params: { id: string };
}

export default async function EditVenuePage({ params }: EditVenuePageProps) {
  const venue = await getVenueById(params.id);
  if (!venue) return notFound();
  return <VenueForm venue={venue} mode='edit' />;
}
