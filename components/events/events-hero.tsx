import Image from 'next/image';

interface EventsHeroProps {
  title: string;
}

export function EventsHero({ title }: EventsHeroProps) {
  return (
    <div className='relative h-[40vh] min-h-[300px] w-full overflow-hidden'>
      <Image
        src='https://hebbkx1anhila5yf.public.blob.vercel-storage.com/GLOUCESTER-X4U7VQ8Z34lVlL6NgaMPRUcfI5L5h1.png'
        alt='Gloucester Cathedral'
        fill
        className='object-cover'
        priority
      />
      <div className='absolute inset-0 bg-black/50 flex items-center justify-center'>
        <h1 className='text-4xl md:text-5xl lg:text-6xl text-white font-playfair text-center'>
          {title}
        </h1>
      </div>
    </div>
  );
}
