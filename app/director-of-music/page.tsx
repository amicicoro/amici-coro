import Image from "next/image"
import { Header } from "@/components/layout/Header"
import { Footer } from "@/components/layout/Footer"
import { ImageAssets } from "@/lib/image-assets"

export default function DirectorOfMusic() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        <div className="container mx-auto px-6 sm:px-8 md:px-12 py-16">
          <div className="grid md:grid-cols-2 gap-12 max-w-6xl mx-auto">
            <div className="relative w-full aspect-[2/3]">
              <Image
                src={ImageAssets.director || "/placeholder.svg"}
                alt="Andrew Scott, Director of Music, in traditional choir dress with academic hood"
                fill
                priority
                className="object-cover"
              />
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <h1 className="text-2xl md:text-3xl font-playfair">DIRECTOR OF MUSIC</h1>
                <h2 className="text-xl md:text-2xl font-playfair italic">Andrew Scott</h2>
              </div>

              <div className="space-y-4 text-base leading-relaxed font-light">
                <p>
                  Andrew Scott began his musical education in 1989 as a Chorister at Christ Church, North Shields under
                  the tutelage of Russell Missin. In 1994 he was awarded the Organ Scholarship before being promoted to
                  Assistant Organist, and eventually, Director of Music.
                </p>

                <p>
                  In 1994, on leaving school Andrew was apprenticed to Harrison & Harrison, Organ Builders of Durham to
                  train as a professional Organ Builder. In 2000 at the age of 22 he was appointed as London Tuner,
                  taking on the responsibility for the tuning and maintenance of many parish church organs and for the
                  instruments in many of the main London venues, including Westminster Abbey, Westminster Cathedral, and
                  the Royal Festival Hall. In addition to his tuning, Andrew continued working as a voicer, playing a
                  significant role in projects such as Stockholm City Hall, St Mary, Redcliffe, St Edmundsbury Cathedral
                  and Westminster Central Hall.
                </p>

                <p>
                  Andrew was appointed Head Voicer in April 2012 and has been responsible for the musical success of
                  many projects, including the Royal Festival Hall, King's College, Cambridge, Canterbury Cathedral and
                  York Minster, together with new organs for Edington Priory, Hakadal Kirke, Norway, St Andrew's Church,
                  Bedford, Christ Church, Alexandria VA, and most recently, Christ Church, Greenwich CT. He became a
                  director of H&H in 2017 and was appointed Deputy Managing Director in 2021. Andrew was appointed
                  Managing Director in August 2022.
                </p>
                <p>
                  Amongst many organs in the UK, Andrew has worked in Australia, Denmark, Japan, Kenya, Malaysia, New
                  Zealand, Nigeria, Norway, South Africa, South Korea, Sweden and the USA. He is in demand as a writer
                  and speaker on the subjects of organology and voicing, has been a board member of The International
                  Society of Organbuilders since 2016, and in 2021 he was elected Chair of The Institute of British
                  Organ Building.
                </p>
                <p>
                  In addition to his work at H&H, upon moving to London, Andrew spent five years as Organist and
                  Assistant Choir Director at St Margaret's, Lee, followed by four years as Assistant Director of Music
                  and Director of the Girls' Choir at Croydon Parish Church - now Croydon Minster.
                </p>
                <p>
                  Andrew has been Director of Music at St Michael & All Angels, Croydon since January 2012, having
                  previously served as Acting Director of Music from April 2010.
                </p>
                <p>
                  In addition to his professional work and weekly church duties, Andrew has been Director of Amici Coro
                  since November 2009. Under Andrew's direction, Amici have sung services at most of the southern
                  Cathedrals.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

