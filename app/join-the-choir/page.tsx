import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Header } from "@/components/layout/Header"
import { Footer } from "@/components/layout/Footer"

export default function JoinTheChoir() {
 const rules = [
   "All singers of the choir are subject to the acceptance of the Director of Music",
   "All singers attending an event must learn the music for the weekend/service/residency prior to arriving",
   "All singers are required to attend rehearsals at the event site at the time set by the Director of Music",
 ]

 const qualities = [
    "Dedication, commitment and a love of singing",
    "An ability to blend with other singers",
    "An ability to sight-read to a reasonable standard",
 ]

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
              <h2 className="text-2xl md:text-3xl font-playfair">Membership Information</h2>
              <p className="text-lg leading-relaxed">
                Amici Coro is an amateur choir and the two most important attributes of its singers are a love for
                singing and striving for the highest possible standards in all the music that we perform. We aim to
                work hard and enjoy ourselves, and whilst rules and regulations may seem rather formal, the following
                guidelines outline the principles by which we aim to make music together.
              </p>

              <p className="text-lg leading-relaxed">
                {rules.map((rule, index) => (
                  <li key={index} className="text-lg leading-relaxed">{rule}</li>
                ))}
              </p>
              <p className="text-lg leading-relaxed">
                Amici Coro is a chamber choir and the size, distribution and quality of the voices will be carefully
                monitored by the Director of Music to ensure a good musical balance and perform to a high standard.
                The musical requirements of its singers reflect this, and whilst singers are not expected to be of a
                professional standard, we are looking for the following qualities:
              </p>
              <p>
                {qualities.map((quality, index) => (
                  <li key={index} className="text-lg leading-relaxed">{quality}</li>
                ))}
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl md:text-3xl font-playfair">Membership Fees</h2>
              <p className="text-lg leading-relaxed">
                Singers are charged a fee per event to cover the cost of hiring music, fees for organists and the
                Director of Music, the Organist and any reasonable costs incurred by the Director of Music or members
                of the committee. The fees are split into cost per service and are only recoverable for the amount of
                services which a singer attends.
              </p>
              <p className="text-lg leading-relaxed">
                All singers are expected to make their own transport provisions for rehearsals and events.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl md:text-3xl font-playfair">Music & Distribution</h2>
              <p className="text-lg leading-relaxed">
                The music for each event is chosen by the Director of Music and digital copies will be provided in
                advance of each event. Hard copies will be available for every member at the venue. Singers are free to
                use their own copies, including digital versions, so long as the editions match up. The use of a tablet
                and digital scores is encouraged.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl md:text-3xl font-playfair">Venues & Dates</h2>
              <p className="text-lg leading-relaxed">
                We aim to sing Evensong on a Saturday or a weekend residency in an English Cathedral every 2-3 months.
              </p>
              <p className="text-lg leading-relaxed">
                A full week's residency at a Cathedral is usually planned for August.
              </p>
              <p className="text-lg leading-relaxed">
                Additional concerts or other services are planned as appropriate.
              </p>
              <p className="text-lg leading-relaxed">
                The committee aim to publish the dates of each event well in advance to enable as full an attendance
                from singers as possible.
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

