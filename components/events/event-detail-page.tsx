import { EventDetails } from '@/components/events/event-details';
import { EventHero } from '@/components/events/event-hero';
import { PhotoGallery } from '@/components/photo-gallery';
import type { Event } from '@/types/event';
import type { Venue } from '@/types/venue';
import { ArrowLeft, Camera } from 'lucide-react';
import Link from 'next/link';

interface EventDetailPageProps {
  event: Event;
  venue: Venue;
  isPastEvent?: boolean;
  photos?: Array<
    { url: string } | { url: string; pathname?: string; contentType?: string }
  >;
}

export default function EventDetailPage({
  event,
  venue,
  isPastEvent = false,
  photos,
}: EventDetailPageProps) {
  return (
    <main className='flex-1'>
      <EventHero event={event} venue={venue} isPastEvent={isPastEvent} />
      <div className='container mx-auto px-6 sm:px-8 md:px-12 py-12'>
        <div className='max-w-6xl mx-auto'>
          <Link
            href={isPastEvent ? '/past-events' : '/events'}
            className='inline-flex items-center text-gray-600 hover:text-gray-900 mb-8 group'
          >
            <ArrowLeft className='w-4 h-4 mr-2 transition-transform group-hover:-translate-x-1' />
            {isPastEvent ? 'Back to Past Events' : 'Back to Events'}
          </Link>
          <EventDetails event={{ ...event, venue }} isPastEvent={isPastEvent} />
          {photos && photos.length > 0 && (
            <div className='mt-16 pt-8 border-t border-gray-200'>
              <h2 className='text-2xl md:text-3xl font-semibold flex items-center gap-2 mb-8'>
                <Camera className='w-6 h-6' />
                <span>Event Gallery</span>
              </h2>
              <PhotoGallery photos={photos} alt={event.title} />
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
