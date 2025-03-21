"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useParams } from "next/navigation"
import EditEventForm from "./edit-event-form"
import type { Event } from "@/types/event"
// Add import for date utils
import { formatDateForInput, extractTimeForInput } from "@/lib/date-utils"

export default function EditEventPage() {
  const router = useRouter()
  const params = useParams()
  const slug = params.slug as string

  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [event, setEvent] = useState<Event | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Check authentication and fetch event data
  useEffect(() => {
    const token = localStorage.getItem("adminAuthToken")
    if (!token) {
      router.push("/login")
      return
    }

    setIsAuthenticated(true)

    // Fetch the event data
    const fetchEvent = async () => {
      try {
        // Use the direct slug endpoint as before
        const apiUrl = `/api/events/${encodeURIComponent(slug)}`
        console.log("Fetching event from:", apiUrl)

        const response = await fetch(apiUrl, {
          headers: {
            // Add accept header to ensure we get JSON back
            Accept: "application/json",
            "X-Admin-Auth-Token": token,
          },
        })

        // Check if the response is OK before trying to parse JSON
        if (!response.ok) {
          // Try to get error details, but handle non-JSON responses
          let errorMessage = `Failed to fetch event: ${response.status} ${response.statusText}`

          const contentType = response.headers.get("content-type")
          const responseText = await response.text()

          console.error("Error response:", {
            status: response.status,
            contentType,
            responseText: responseText.substring(0, 500), // Log first 500 chars
          })

          if (contentType && contentType.includes("application/json")) {
            try {
              const errorData = JSON.parse(responseText)
              errorMessage = errorData.error || errorMessage
            } catch (parseError) {
              console.error("Error parsing JSON error response:", parseError)
            }
          }

          throw new Error(errorMessage)
        }

        // Try to parse the JSON with error handling
        let eventData
        try {
          const responseText = await response.text()
          console.log("Response text (first 100 chars):", responseText.substring(0, 100))
          eventData = JSON.parse(responseText)
        } catch (parseError) {
          console.error("JSON parse error:", parseError)
          throw new Error("Invalid response format from server")
        }

        // Update the logging in the fetchEvent function
        console.log("Loaded event data:", eventData)
        if (eventData.venue && eventData.schedule && eventData.schedule.length > 0) {
          console.log(
            "Schedule item date/time values:",
            eventData.schedule.map((item) => ({
              originalDate: item.date,
              formattedDate: formatDateForInput(item.date, eventData.venue.timezone),
              extractedTime: extractTimeForInput(item.date, eventData.venue.timezone),
            })),
          )
        } else {
          console.log("Date values (no venue timezone):", {
            originalDate: eventData.date,
            originalEndDate: eventData.endDate,
            formattedDate: formatDateForInput(eventData.date),
            formattedEndDate: formatDateForInput(eventData.endDate),
          })
        }

        setEvent(eventData)
      } catch (err) {
        console.error("Error fetching event:", err)
        setError(err instanceof Error ? err.message : "Failed to fetch event")
      } finally {
        setIsLoading(false)
      }
    }

    fetchEvent()
  }, [router, slug])

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Loading event data...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg">
          <p>Error: {error}</p>
          <div className="mt-4 flex gap-2">
            <button
              onClick={() => router.back()}
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
            >
              Go Back
            </button>
            <button
              onClick={() => router.push("/admin")}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Return to Dashboard
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (!event) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="bg-amber-50 border border-amber-200 text-amber-700 px-6 py-4 rounded-lg">
          <p>Event not found</p>
          <div className="mt-4 flex gap-2">
            <button
              onClick={() => router.back()}
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
            >
              Go Back
            </button>
            <button
              onClick={() => router.push("/admin")}
              className="px-4 py-2 bg-amber-600 text-white rounded hover:bg-amber-700"
            >
              Return to Dashboard
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null // This should never render as we redirect in useEffect
  }

  return <EditEventForm event={event} />
}

