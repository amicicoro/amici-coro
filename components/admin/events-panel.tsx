import { getEvents } from '@/actions/event-actions';
import { EventsList } from '@/components/admin/events-list';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import Link from 'next/link';

export const EventsPanel = async () => {
  const now = new Date().toISOString();
  const [upcomingEvents, pastEvents] = await Promise.all([
    getEvents({ endDateGte: now }),
    getEvents({ endDateLt: now }),
  ]);

  return (
    <>
      <div className='flex justify-between items-center mb-6'>
        <h2 className='text-2xl font-semibold'>Events Management</h2>
        <Link href='/admin/events/create'>
          <Button size='default' className='gap-2'>
            <Plus className='h-4 w-4' /> Create Event
          </Button>
        </Link>
      </div>

      {/* Upcoming Events Section */}
      <EventsList
        title='Upcoming Events'
        icon='calendar'
        events={upcomingEvents}
        type='upcoming'
        error={null}
      />

      {/* Past Events Section */}
      <EventsList
        title='Past Events'
        icon='clock'
        events={pastEvents}
        type='past'
        error={null}
      />
    </>
  );
};
