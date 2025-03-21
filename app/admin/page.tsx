"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Plus, Calendar, MapPin } from "lucide-react"
import { LogoutButton } from "@/components/logout-button"
import { EventsList } from "@/components/admin/events-list"
import { VenueCard } from "@/components/admin/venue-card"
import { ErrorMessage } from "@/components/admin/error-message"
import type { Event } from "@/types/event"
import type { Venue } from "@/types/venue"

export default function AdminDashboardPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  // Get the current page and tab from the URL query parameters
  const currentPage = Number(searchParams.get("page")) || 1
  const activeTab = searchParams.get("tab") || "events"

  const [isLoading, setIsLoading] = useState(true)
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([])
  const [pastEvents, setPastEvents] = useState<Event[]>([])
  const [venues, setVenues] = useState<Venue[]>([])
  const [eventsError, setEventsError] = useState<string | null>(null)
  const [pastEventsError, setPastEventsError] = useState<string | null>(null)
  const [venuesError, setVenuesError] = useState<string | null>(null)

  // Check authentication
  useEffect(() => {
    const token = localStorage.getItem("adminAuthToken")
    if (!token) {
      router.push("/login")
    } else {
      // Fetch data once authenticated
      fetchData()
    }
  }, [router])

  // Fetch events and venues data
  const fetchData = async () => {
    setIsLoading(true)

    try {
      // Fetch upcoming events from the API
      const eventsResponse = await fetch("/api/events")
      if (!eventsResponse.ok) {
        throw new Error("Failed to fetch upcoming events")
      }
      const eventsData = await eventsResponse.json()
      setUpcomingEvents(eventsData)
    } catch (err) {
      console.error("Error loading upcoming events:", err)
      setEventsError("Failed to load upcoming events. Please try again later.")
    }

    try {
      // Fetch past events from the API
      const pastEventsResponse = await fetch("/api/past-events")
      if (!pastEventsResponse.ok) {
        throw new Error("Failed to fetch past events")
      }
      const pastEventsData = await pastEventsResponse.json()
      setPastEvents(pastEventsData)
    } catch (err) {
      console.error("Error loading past events:", err)
      setPastEventsError("Failed to load past events. Please try again later.")
    }

    try {
      // Fetch venues from the API
      const venuesResponse = await fetch("/api/venues")
      if (!venuesResponse.ok) {
        throw new Error("Failed to fetch venues")
      }
      const venuesData = await venuesResponse.json()
      setVenues(venuesData)
    } catch (err) {
      console.error("Error loading venues:", err)
      setVenuesError("Failed to load venues. Please try again later.")
    }

    setIsLoading(false)
  }

  // For venues, we'll show 12 per page (4 rows of 3 columns)
  const venuesPerPage = 12
  const totalVenuePages = Math.ceil(venues.length / venuesPerPage)

  // Calculate the start and end indices for the current page
  const startIndex = (currentPage - 1) * venuesPerPage
  const endIndex = startIndex + venuesPerPage

  // Get the venues for the current page
  const currentPageVenues = venues.slice(startIndex, endIndex)

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Loading dashboard...</p>
      </div>
    )
  }

  return (
    <div className="container max-w-6xl py-12">
      <div className="flex justify-between items-center mb-8 px-4">
        <h1 className="text-4xl font-bold">Admin Dashboard</h1>
        <LogoutButton />
      </div>

      <Tabs defaultValue={activeTab} className="px-4">
        <TabsList className="mb-6">
          <TabsTrigger value="events" className="flex items-center gap-2" asChild>
            <Link href="/admin?tab=events">
              <Calendar className="h-4 w-4" />
              Events
            </Link>
          </TabsTrigger>
          <TabsTrigger value="venues" className="flex items-center gap-2" asChild>
            <Link href="/admin?tab=venues">
              <MapPin className="h-4 w-4" />
              Venues
            </Link>
          </TabsTrigger>
        </TabsList>

        {/* Events Tab */}
        <TabsContent value="events">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold">Events Management</h2>
            <Link href="/admin/events/create">
              <Button size="default" className="gap-2">
                <Plus className="h-4 w-4" /> Create Event
              </Button>
            </Link>
          </div>

          {/* Upcoming Events Section */}
          <EventsList
            title="Upcoming Events"
            icon="calendar"
            events={upcomingEvents}
            type="upcoming"
            error={eventsError}
          />

          {/* Past Events Section */}
          <EventsList title="Past Events" icon="clock" events={pastEvents} type="past" error={pastEventsError} />
        </TabsContent>

        {/* Venues Tab */}
        <TabsContent value="venues">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold">Venues Management</h2>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div>
                    <Button size="default" className="gap-2" disabled>
                      <Plus className="h-4 w-4" /> Create Venue
                    </Button>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Venue creation coming soon</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          <ErrorMessage message={venuesError} />

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {!venuesError && venues.length === 0 ? (
              <Card className="shadow-md md:col-span-2 lg:col-span-3">
                <CardContent className="pt-10 pb-10">
                  <p className="text-center text-muted-foreground text-lg">No venues found.</p>
                </CardContent>
              </Card>
            ) : (
              currentPageVenues.map((venue) => <VenueCard key={venue.id} venue={venue} />)
            )}
          </div>

          {venues.length > venuesPerPage && (
            <div className="mt-8">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      href={currentPage > 1 ? `/admin?tab=venues&page=${currentPage - 1}` : "#"}
                      className={currentPage <= 1 ? "cursor-not-allowed opacity-50" : ""}
                    />
                  </PaginationItem>

                  {/* Generate page links */}
                  {Array.from({ length: Math.min(5, totalVenuePages) }).map((_, index) => {
                    const pageNumber = index + 1
                    // For more than 5 pages, show ellipsis
                    if (totalVenuePages > 5 && index === 4) {
                      return (
                        <PaginationItem key={pageNumber}>
                          <span className="px-2">...</span>
                        </PaginationItem>
                      )
                    }
                    return (
                      <PaginationItem key={pageNumber}>
                        <PaginationLink
                          href={`/admin?tab=venues&page=${pageNumber}`}
                          isActive={pageNumber === currentPage}
                        >
                          {pageNumber}
                        </PaginationLink>
                      </PaginationItem>
                    )
                  })}

                  {/* Show last page if there are more than 5 pages and we're not on the last page */}
                  {totalVenuePages > 5 && (
                    <PaginationItem>
                      <PaginationLink
                        href={`/admin?tab=venues&page=${totalVenuePages}`}
                        isActive={totalVenuePages === currentPage}
                      >
                        {totalVenuePages}
                      </PaginationLink>
                    </PaginationItem>
                  )}

                  <PaginationItem>
                    <PaginationNext
                      href={currentPage < totalVenuePages ? `/admin?tab=venues&page=${currentPage + 1}` : "#"}
                      className={currentPage >= totalVenuePages ? "cursor-not-allowed opacity-50" : ""}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
              <p className="text-center text-sm text-muted-foreground mt-2">
                Showing {startIndex + 1}-{Math.min(endIndex, venues.length)} of {venues.length} venues
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

