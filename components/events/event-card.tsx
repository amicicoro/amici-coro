import { Calendar, MapPin } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import type { Event } from '@/types/event';
import type { Venue } from '@/types/venue';

interface EventCardProps {
  event: Event & { venue: Venue };
  isPastEvent?: boolean;
}

export function EventCard({ event, isPastEvent = false }: EventCardProps) {
  const timezone = event.venue?.timezone || 'Europe/London'; // Default to London if no timezone is specified
  const title = event.subtitle
    ? `${event.title} ${event.subtitle}`
    : event.title;

  const formatEventDate = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const options: Intl.DateTimeFormatOptions = {
      timeZone: timezone,
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    };

    if (start.toDateString() === end.toDateString()) {
      // Single day event
      return start.toLocaleDateString('en-GB', options);
    } else {
      // Multi-day event
      const startStr = start.toLocaleDateString('en-GB', options);
      const endStr = end.toLocaleDateString('en-GB', options);

      if (start.getFullYear() === end.getFullYear()) {
        if (start.getMonth() === end.getMonth()) {
          // Same month and year
          return `${start.getDate()} - ${endStr}`;
        } else {
          // Different months, same year
          return `${start.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })} - ${endStr}`;
        }
      } else {
        // Different years
        return `${startStr} - ${endStr}`;
      }
    }
  };

  return (
    <div className='bg-white rounded-lg shadow-lg overflow-hidden transition-transform duration-300 hover:scale-[1.02] flex flex-col h-full'>
      <div className='relative aspect-[3/2] w-full'>
        <Image
          src={event.venue.imageUrl || '/placeholder.svg'}
          alt={title}
          fill
          className='object-cover object-center'
          sizes='(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
        />
      </div>
      <div className='p-5 flex flex-col flex-grow'>
        <h3 className='text-xl font-playfair mb-2'>{title}</h3>
        <p className='text-sm text-gray-600 mb-2 flex items-center'>
          <Calendar className='w-4 h-4 mr-2' />
          {formatEventDate(event.startDate, event.endDate)}
        </p>
        <p className='text-sm text-gray-600 mb-4 flex items-center'>
          <MapPin className='w-4 h-4 mr-2' />
          {event.venue.name}
        </p>
        <p className='text-sm text-gray-700 mb-4 flex-grow'>
          {event.description}
        </p>
        <Link
          href={`/${isPastEvent ? 'past-events' : 'events'}/${event.slug}`}
          className='mt-auto'
        >
          <Button className='w-full'>
            {isPastEvent ? 'View Details' : 'Learn More'}
          </Button>
        </Link>
      </div>
    </div>
  );
}
