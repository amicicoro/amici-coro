import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Header } from "@/components/layout/Header"
import { Footer } from "@/components/layout/Footer"
import { ImageAssets } from "@/lib/image-assets"

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        <div className="relative w-full h-[calc(100vh-112px)]">
          <Image
            src={ImageAssets.choirPerformance || "/placeholder.svg"}
            alt="Choir performing by candlelight in a magnificent Gothic cathedral, with members arranged in wooden stalls and the conductor centered beneath ornate architecture"
            fill
            priority
            className="object-cover"
          />
          <div className="absolute inset-0 bg-black/30">
            <div className="container mx-auto px-6 sm:px-8 md:px-12 h-full flex items-center">
              <div className="max-w-2xl text-white">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-playfair mb-6">
                  Experience the Magic of Choral Music
                </h1>
                <p className="text-lg md:text-xl mb-8">
                  Join us in celebrating the timeless tradition of choral singing in stunning venues
                </p>
                <div className="flex gap-4">
                  <Link href="/events">
                    <Button size="lg" className="bg-white text-black hover:bg-white/90">
                      Upcoming Events
                    </Button>
                  </Link>
                  <Link href="/join-the-choir">
                    <Button size="lg" variant="outline" className="bg-transparent hover:text-accent-foreground border-2 border-white text-white hover:bg-white/10">
                      Join the Choir
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        <section className="bg-black text-white py-20">
          <div className="container mx-auto px-6 sm:px-8 md:px-12">
            <div className="max-w-4xl mx-auto text-center space-y-12">
              <h2 className="text-3xl md:text-4xl font-playfair mb-12">AMICI CORO</h2>

              <p className="text-lg leading-relaxed">
                Amici Coro is an amateur, award winning, mixed voice, adult chamber choir. We originated as a church
                choir in Warlingham, Surrey, but in 2001 became a choir in our own right, not affiliated to any church
                in particular, bringing together singers from all over the country.
              </p>

              <p className="text-lg leading-relaxed">
                We perform mainly Anglican Choral music for performance in Cathedrals largely in the United Kingdom,
                singing Evensong or Mass at a Cathedral venue every few months.
              </p>

              <p className="text-lg leading-relaxed">
                As members of Amici Coro, we share a love for singing a wide and varied sacred choral repertoire, and,
                although amateur singers, we strive for the highest possible standards in all the music we perform. We
                aim to work hard and enjoy ourselves.
              </p>

              <p className="text-lg leading-relaxed">
                We are always interested in like-minded singers, and if you are interested in joining Amici Coro, please
                contact the Director of Music.
              </p>

              <div className="pt-8">
                <Link href="mailto:amicicoro@yahoo.com">
                  <Button
                    variant="outline"
                    size="lg"
                    className="border-2 border-white text-white hover:bg-white hover:text-black transition-colors"
                  >
                    Email us
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}

