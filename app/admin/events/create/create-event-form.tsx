"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import type { Venue } from "@/types/venue"
import { Button } from "@/components/ui/button"
import { format } from "date-fns"
import { ArrowLeft } from "lucide-react"

// Common church music types
const MUSIC_TYPES = [
  "Responses",
  "Psalm",
  "Canticles",
  "Magnificat",
  "Nunc Dimittis",
  "Anthem",
  "Introit",
  "Hymn",
  "Motet",
  "Communion",
  "Kyrie",
  "Gloria",
  "Sanctus",
  "Benedictus",
  "Agnus Dei",
  "Te Deum",
  "Jubilate",
  "Venite",
  "Other",
]

export default function CreateEventForm() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [venues, setVenues] = useState<Venue[]>([])
  const [venueOpen, setVenueOpen] = useState(false)
  const [musicTypeOpen, setMusicTypeOpen] = useState<Record<string, boolean>>({})
  const [scheduleItems, setScheduleItems] = useState([{ date: "", time: "", description: "" }])
  const [musicListItems, setMusicListItems] = useState<
    { category: string; items: { title: string; composer: string; type: string }[] }[]
  >([{ category: "", items: [{ title: "", composer: "", type: "" }] }])

  const [formData, setFormData] = useState({
    title: "",
    subtitle: "",
    date: "",
    endDate: "",
    venueId: "",
    description: "",
  })

  // Fetch venues when component mounts
  useEffect(() => {
    async function fetchVenues() {
      try {
        const response = await fetch("/api/venues")
        if (!response.ok) throw new Error("Failed to fetch venues")
        const data = await response.json()

        // Sort venues alphabetically by name
        const sortedVenues = [...data].sort((a, b) => a.name.localeCompare(b.name))

        setVenues(sortedVenues)
      } catch (error) {
        console.error("Error fetching venues:", error)
        setError("Failed to load venues. Please try again.")
      }
    }

    fetchVenues()
  }, []) // Empty dependency array means this runs once on mount

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleDateChange = (name: string, date: Date | undefined) => {
    if (date) {
      setFormData((prev) => ({ ...prev, [name]: format(date, "yyyy-MM-dd") }))
    }
  }

  const handleScheduleChange = (index: number, field: string, value: string) => {
    const newSchedule = [...scheduleItems]
    newSchedule[index] = { ...newSchedule[index], [field]: value }
    setScheduleItems(newSchedule)
  }

  const addScheduleItem = () => {
    setScheduleItems([...scheduleItems, { date: "", time: "", description: "" }])
  }

  const removeScheduleItem = (index: number) => {
    if (scheduleItems.length > 1) {
      setScheduleItems(scheduleItems.filter((_, i) => i !== index))
    }
  }

  const handleMusicCategoryChange = (index: number, value: string) => {
    const newMusicList = [...musicListItems]
    newMusicList[index].category = value
    setMusicListItems(newMusicList)
  }

  const handleMusicItemChange = (categoryIndex: number, itemIndex: number, field: string, value: string) => {
    const newMusicList = [...musicListItems]
    newMusicList[categoryIndex].items[itemIndex] = {
      ...newMusicList[categoryIndex].items[itemIndex],
      [field]: value,
    }
    setMusicListItems(newMusicList)
  }

  const addMusicCategory = () => {
    setMusicListItems([...musicListItems, { category: "", items: [{ title: "", composer: "", type: "" }] }])
  }

  const addMusicItem = (categoryIndex: number) => {
    const newMusicList = [...musicListItems]
    newMusicList[categoryIndex].items.push({ title: "", composer: "", type: "" })
    setMusicListItems(newMusicList)
  }

  const removeMusicItem = (categoryIndex: number, itemIndex: number) => {
    if (musicListItems[categoryIndex].items.length > 1) {
      const newMusicList = [...musicListItems]
      newMusicList[categoryIndex].items = newMusicList[categoryIndex].items.filter((_, i) => i !== itemIndex)
      setMusicListItems(newMusicList)
    }
  }

  const removeMusicCategory = (index: number) => {
    if (musicListItems.length > 1) {
      setMusicListItems(musicListItems.filter((_, i) => i !== index))
    }
  }

  const toggleMusicTypePopover = (categoryIndex: number, itemIndex: number, open: boolean) => {
    setMusicTypeOpen((prev) => ({
      ...prev,
      [`${categoryIndex}-${itemIndex}`]: open,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      // Get auth token
      const authToken = localStorage.getItem("adminAuthToken")
      if (!authToken) {
        throw new Error("Not authenticated")
      }

      // Prepare music list in the correct format
      const musicList: Record<string, any[]> = {}
      musicListItems.forEach((category) => {
        if (category.category && category.items.some((item) => item.title)) {
          musicList[category.category] = category.items
            .filter((item) => item.title)
            .map((item) => ({
              title: item.title,
              ...(item.composer ? { composer: item.composer } : {}),
              ...(item.type ? { type: item.type } : {}),
            }))
        }
      })

      // Prepare schedule items
      const schedule = scheduleItems
        .filter((item) => item.date && item.description)
        .map((item) => {
          // Combine date and time if time is provided
          let dateString = item.date
          if (item.time) {
            dateString = `${item.date}T${item.time}`
          }

          return {
            date: dateString,
            description: item.description,
          }
        })

      // Prepare the complete event data
      const eventData = {
        ...formData,
        schedule,
        musicList,
      }

      // Send the data to the real API with auth token
      const response = await fetch("/api/events", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Admin-Auth-Token": authToken,
        },
        body: JSON.stringify(eventData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to create event")
      }

      const newEvent = await response.json()

      // Redirect to the event list or detail page
      router.push("/admin")
      router.refresh()
    } catch (error) {
      console.error("Error creating event:", error)
      setError(error instanceof Error ? error.message : "An unexpected error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container max-w-5xl py-12">
      <div className="px-4 mb-8">
        <div className="flex items-center mb-6">
          <Link href="/admin">
            <Button variant="ghost" size="sm" className="gap-1 mr-4">
              <ArrowLeft className="h-4 w-4" /> Back to Dashboard
            </Button>
          </Link>
          <h1 className="text-4xl font-bold">Create New Event</h1>
        </div>

        {error && <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg mb-6">{error}</div>}
      </div>

      <form onSubmit={handleSubmit} className="px-4">
        {/* Rest of the form remains the same */}
        {/* ... */}
      </form>
    </div>
  )
}

