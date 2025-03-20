import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Header } from "@/components/layout/Header"
import { Footer } from "@/components/layout/Footer"

export default function JoinTheChoir() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        <div className="relative w-full h-[30vh] md:h-[40vh]">
          <Image
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/2022-10-29%2012.28.25.jpg-CFvjeT8MQZ8mBjzmpydMqw1R3KbAMg.jpeg"
            alt="Choir rehearsal in a cathedral setting with the conductor leading members through music while standing by a piano"
            fill
            priority
            className="object-cover"
          />
        </div>

        <div className="container mx-auto px-6 sm:px-8 md:px-12 py-12">
          <div className="max-w-4xl mx-auto space-y-8">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-playfair text-center">Join Amici Coro</h1>

            <section className="space-y-4">
              <h2 className="text-2xl md:text-3xl font-playfair">Why Join Us?</h2>
              <p className="text-lg leading-relaxed">
                Joining a choir is good for you! Amici Coro is always enthusiastic about welcoming new singers. If you
                are looking for a new challenge and are a confident singer, we'd love to hear from you.
              </p>
              <p className="text-lg leading-relaxed">
                We are a friendly bunch who enjoy making music to a high standard. We perform mainly Anglican Choral
                music in Cathedrals largely in the United Kingdom, singing Evensong or Mass at a Cathedral venue every
                few months.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl md:text-3xl font-playfair">Membership Information</h2>
              <p className="text-lg leading-relaxed">
                Amici Coro is an amateur, award-winning, mixed voice, adult chamber choir. We originated as a church
                choir in Warlingham, Surrey, but in 2001 became a choir in our own right, not affiliated to any church
                in particular, bringing together singers from all over the country.
              </p>
              <p className="text-lg leading-relaxed">
                As members of Amici Coro, we share a love for singing a wide and varied sacred choral repertoire, and,
                although amateur singers, we strive for the highest possible standards in all the music we perform. We
                aim to work hard and enjoy ourselves.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl md:text-3xl font-playfair">Rehearsals and Performances</h2>
              <p className="text-lg leading-relaxed">
                We rehearse on Saturday mornings from 10:00 am to 1:00 pm, typically once a month. Our rehearsals are
                held at St. Michael and All Angels Church, Croydon. We usually perform 4-5 times a year in various
                cathedrals across the UK.
              </p>
              <p className="text-lg leading-relaxed">
                Members are expected to attend all rehearsals and performances. If you cannot make a rehearsal, please
                let the Director of Music know in advance.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl md:text-3xl font-playfair">Music Distribution</h2>
              <p className="text-lg leading-relaxed">
                Prior to each event, members receive digital copies of the music via email. This allows for individual
                practice before group rehearsals. For performances, physical copies of the music are provided at the
                venue. Members are responsible for returning these copies after each performance.
              </p>
              <p className="text-lg leading-relaxed">
                We encourage all members to familiarize themselves with the music before rehearsals to ensure productive
                practice sessions and high-quality performances.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl md:text-3xl font-playfair">Membership Fees</h2>
              <p className="text-lg leading-relaxed">
                There is an annual membership fee of £100, which covers the cost of music hire, rehearsal venues, and
                other administrative expenses. This fee can be paid in installments if needed.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl md:text-3xl font-playfair">How to Join</h2>
              <p className="text-lg leading-relaxed">
                If you're interested in joining Amici Coro, we encourage you to attend one of our rehearsals to get a
                feel for the choir. After that, you'll be invited to an informal audition with our Director of Music.
              </p>
              <p className="text-lg leading-relaxed">
                To express your interest or for more information, please contact our Director of Music, Andrew Scott.
              </p>
              <div className="pt-4">
                <Link href="mailto:scottnandrew@aol.com">
                  <Button
                    variant="outline"
                    size="lg"
                    className="border-2 border-black text-black hover:bg-black hover:text-white transition-colors"
                  >
                    Email the Director of Music
                  </Button>
                </Link>
              </div>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

