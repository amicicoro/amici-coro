import { Facebook } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

import { ImageAssets } from '@/lib/image-assets';

export function Footer() {
  return (
    <footer className='bg-white py-12'>
      <div className='container mx-auto px-6 sm:px-8 md:px-12'>
        <div className='flex flex-col items-center text-center space-y-8'>
          <div className='w-96 relative h-32'>
            <Image
              src={ImageAssets.logo || '/placeholder.svg'}
              alt='Amici Coro Logo'
              fill
              className='object-contain dark:invert'
              priority
            />
          </div>

          <div className='flex items-center gap-3'>
            <span className='text-sm uppercase tracking-wider'>
              Find us on Facebook
            </span>
            <Link
              href='http://www.facebook.com/amicicoro'
              target='_blank'
              rel='noopener noreferrer'
              className='text-[#4267B2] hover:opacity-80 transition-opacity'
            >
              <Facebook size={24} />
              <span className='sr-only'>Amici Coro on Facebook</span>
            </Link>
          </div>

          <div className='space-y-2 text-sm text-gray-600 max-w-2xl'>
            <p>All content and rights belong to Amici Coro.</p>
            <p>
              The information provided on this website and its social media
              channels is correct at the time of publication.
            </p>
          </div>

          <div className='text-sm'>
            <Link href='/cookies' className='text-gray-600 hover:underline'>
              For our cookie policy please click here
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
