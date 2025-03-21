import Image from "next/image"

interface EventsHeroProps {
  title: string
  subtitle?: string
}

export function EventsHero({ title, subtitle }: EventsHeroProps) {
  return (
    <div className="relative h-[40vh] min-h-[300px] w-full overflow-hidden">
      <Image
        src="/placeholder.svg?height=800&width=1200"
        alt="Cathedral background"
        fill
        className="object-cover"
        priority
      />
      <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center px-4">
        <h1 className="text-4xl md:text-5xl lg:text-6xl text-white font-playfair text-center mb-2">{title}</h1>
        {subtitle && subtitle.trim() !== "" && (
          <p className="text-xl md:text-2xl text-white/90 font-light text-center max-w-3xl">{subtitle}</p>
        )}
      </div>
    </div>
  )
}

