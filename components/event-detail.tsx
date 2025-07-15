import { format } from 'date-fns';
import { Camera } from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import type { Event } from '@/types/event';

interface EventDetailProps {
  event: Event;
}

export function EventDetail({ event }: EventDetailProps) {
  return (
    <div className='space-y-6'>
      <div className='flex flex-col md:flex-row md:justify-between md:items-center gap-4'>
        <h1 className='text-3xl font-bold'>{event.title}</h1>
        <Button variant='outline' asChild className='gap-2'>
          <Link href={`/events/${event.slug}/photos`}>
            <Camera className='h-4 w-4' />
            View Photos
          </Link>
        </Button>
      </div>

      {event.subtitle && (
        <p className='text-xl text-muted-foreground'>{event.subtitle}</p>
      )}

      <div className='flex flex-col md:flex-row gap-2 md:gap-6 text-muted-foreground'>
        <div className='flex items-center gap-2'>
          <span className='font-medium'>Date:</span>
          <span>
            {format(new Date(event.date), 'PPP')}
            {event.date !== event.endDate &&
              ` - ${format(new Date(event.endDate), 'PPP')}`}
          </span>
        </div>
        <div className='flex items-center gap-2'>
          <span className='font-medium'>Venue:</span>
          <span>{event.venue?.name}</span>
        </div>
      </div>

      {event.description && (
        <div className='prose max-w-none'>
          <p>{event.description}</p>
        </div>
      )}

      {/* Schedule section */}
      {event.schedule && event.schedule.length > 0 && (
        <div className='mt-8'>
          <h2 className='text-2xl font-bold mb-4'>Schedule</h2>
          <div className='grid gap-4'>
            {event.schedule.map((item, index) => (
              <Card key={index}>
                <CardContent className='p-4'>
                  <div className='flex flex-col md:flex-row md:justify-between md:items-center gap-2'>
                    <div className='font-medium'>{item.description}</div>
                    <div className='text-muted-foreground'>
                      {format(new Date(item.date), 'PPP p')}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Music list section */}
      {event.musicList && Object.keys(event.musicList).length > 0 && (
        <div className='mt-8'>
          <h2 className='text-2xl font-bold mb-4'>Music</h2>
          <div className='space-y-6'>
            {Object.entries(event.musicList).map(([service, items]) => (
              <div key={service}>
                <h3 className='text-xl font-semibold mb-3'>{service}</h3>
                <div className='grid gap-2'>
                  {items.map((item, index) => (
                    <div
                      key={index}
                      className='flex flex-col md:flex-row md:items-baseline gap-1 md:gap-2'
                    >
                      {item.type && (
                        <span className='font-medium min-w-24'>
                          {item.type}:
                        </span>
                      )}
                      <span>{item.title}</span>
                      {item.composer && (
                        <span className='text-muted-foreground'>
                          by {item.composer}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
