"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Header } from "@/components/layout/Header"
import { Footer } from "@/components/layout/Footer"
import { Button } from "@/components/ui/Button"
import type { Venue } from "@/types/event"
import { MapPin } from "lucide-react"

export default function VenuesPage() {
  const [venues, setVenues] = useState<Venue[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch("/api/venues")
      .then((res) => {
        if (!res.ok) {
          throw new Error("Failed to fetch venues")
        }
        return res.json()
      })
      .then((data) => {
        setVenues(data)
        setIsLoading(false)
      })
      .catch((err) => {
        setError(err.message)
        setIsLoading(false)
      })
  }, [])

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 container mx-auto px-6 sm:px-8 md:px-12 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-playfair mb-4">Awe-Inspiring Venues We Call Home</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Experience the magnificent acoustics and breathtaking architecture of these historic spaces where Amici Coro
            brings choral music to life. From grand cathedrals to intimate chapels, each venue offers a unique and
            unforgettable setting for our performances.
          </p>
        </div>

        {isLoading ? (
          <p className="text-center text-gray-600">Loading venues...</p>
        ) : error ? (
          <p className="text-center text-red-600">{error}</p>
        ) : (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {venues.map((venue) => (
              <div key={venue.id} className="bg-white rounded-lg shadow-lg overflow-hidden">
                <div className="relative aspect-[3/2] w-full">
                  <Image
                    src={venue.imageUrl || "/placeholder.svg"}
                    alt={venue.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                </div>
                <div className="p-5">
                  <h2 className="text-xl font-playfair mb-2 flex items-center">
                    <MapPin className="w-5 h-5 mr-2 text-primary" />
                    {venue.name}
                  </h2>
                  <p className="text-sm text-gray-600 mb-4">{venue.address}</p>
                  <Link href={venue.website || "#"} target="_blank" rel="noopener noreferrer">
                    <Button className="w-full">Visit Website</Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}

