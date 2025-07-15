import { Calendar, MapPin } from 'lucide-react';
import Link from 'next/link';

import { LogoutButton } from '@/components/admin/logout-button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import { EventsPanel } from '../admin/events-panel';
import { VenuesPanel } from '../admin/venues-panel';

export const AdminPage = ({ activeTab }: { activeTab: string }) => {
  return (
    <div className='container max-w-6xl py-12'>
      <div className='flex justify-between items-center mb-8 px-4'>
        <h1 className='text-4xl font-bold'>Admin Dashboard</h1>
        <LogoutButton />
      </div>

      <Tabs defaultValue={activeTab} className='px-4'>
        <TabsList className='mb-6'>
          <TabsTrigger
            value='events'
            className='flex items-center gap-2'
            asChild
          >
            <Link href='/admin?tab=events'>
              <Calendar className='h-4 w-4' />
              Events
            </Link>
          </TabsTrigger>
          <TabsTrigger
            value='venues'
            className='flex items-center gap-2'
            asChild
          >
            <Link href='/admin?tab=venues'>
              <MapPin className='h-4 w-4' />
              Venues
            </Link>
          </TabsTrigger>
        </TabsList>

        {/* Events Tab */}
        <TabsContent value='events'>
          <EventsPanel />
        </TabsContent>

        {/* Venues Tab */}
        <TabsContent value='venues'>
          <VenuesPanel />
        </TabsContent>
      </Tabs>
    </div>
  );
};
