"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import type { Venue } from "@/types/venue"
import { Button } from "@/components/ui/button"
import { format } from "date-fns"
import { ArrowLeft } from "lucide-react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"

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
    slug: "",
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

  const generateSlug = (title: string, subtitle: string, date: string): string => {
    // Extract year from date if available
    const year = date ? new Date(date).getFullYear().toString() : ""

    // Combine title, subtitle and year
    let slugBase = title
    if (subtitle) slugBase += ` ${subtitle}`
    if (year) slugBase += ` ${year}`

    // Convert to slug format: lowercase, remove special chars, replace special chars, replace spaces with hyphens
    return slugBase
      .toLowerCase()
      .replace(/[^\w\s-]/g, "") // Remove special characters
      .replace(/\s+/g, "-") // Replace spaces with hyphens
      .replace(/-+/g, "-") // Replace multiple hyphens with single hyphen
  }

  useEffect(() => {
    // Only auto-generate slug if user hasn't manually edited it yet
    // or if all fields are empty (initial state)
    if (!formData.slug || (!formData.title && !formData.subtitle && !formData.date)) {
      const newSlug = generateSlug(formData.title, formData.subtitle, formData.date)
      setFormData((prev) => ({ ...prev, slug: newSlug }))
    }
  }, [formData.title, formData.subtitle, formData.date])

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

      <form onSubmit={handleSubmit} className="px-4 space-y-8">
        {/* Combined Basic Information Section */}
        <div className="p-6 border rounded-md bg-muted/20">
          <h3 className="text-lg font-medium mb-6">Event Details</h3>

          {/* Basic Event Information */}
          <div className="grid gap-6 md:grid-cols-2 mb-6">
            <div className="space-y-2">
              <Label htmlFor="title">Event Title *</Label>
              <Input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="e.g., Evensong at York Minster"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="subtitle">Subtitle (Optional)</Label>
              <Input
                id="subtitle"
                name="subtitle"
                value={formData.subtitle}
                onChange={handleInputChange}
                placeholder="e.g., Summer Concert Series"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="slug">URL Slug *</Label>
            <Input
              id="slug"
              name="slug"
              value={formData.slug}
              onChange={handleInputChange}
              placeholder="e.g., evensong-york-minster-2023"
              required
            />
            <p className="text-xs text-muted-foreground">
              This will be used in the URL. Auto-generated from title, subtitle, and year.
            </p>
          </div>

          {/* Dates */}
          <div className="grid gap-6 md:grid-cols-2 mb-6">
            <div className="space-y-2">
              <Label htmlFor="date">Start Date *</Label>
              <Input id="date" name="date" type="date" value={formData.date} onChange={handleInputChange} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">End Date *</Label>
              <Input
                id="endDate"
                name="endDate"
                type="date"
                value={formData.endDate}
                onChange={handleInputChange}
                required
              />
              <p className="text-xs text-muted-foreground">
                For single-day events, use the same date as the start date.
              </p>
            </div>
          </div>

          {/* Venue Selection */}
          <div className="space-y-2 mb-6">
            <Label htmlFor="venueId">Venue *</Label>
            <select
              id="venueId"
              name="venueId"
              value={formData.venueId}
              onChange={handleInputChange}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              required
            >
              <option value="">Select a venue</option>
              {venues.map((venue) => (
                <option key={venue.id} value={venue.id}>
                  {venue.name}
                </option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={4}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              placeholder="Provide a description of the event..."
            />
          </div>
        </div>

        {/* Schedule Section */}
        <div className="p-6 border rounded-md bg-muted/20">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium">Event Schedule</h3>
            <Button type="button" variant="outline" size="sm" onClick={addScheduleItem}>
              Add Schedule Item
            </Button>
          </div>
          <div className="space-y-4">
            {scheduleItems.map((item, index) => (
              <div key={index} className="grid gap-4 p-4 border rounded-md bg-background">
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor={`schedule-date-${index}`}>Date</Label>
                    <Input
                      id={`schedule-date-${index}`}
                      type="date"
                      value={item.date}
                      onChange={(e) => handleScheduleChange(index, "date", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`schedule-time-${index}`}>Time (Optional)</Label>
                    <Input
                      id={`schedule-time-${index}`}
                      type="time"
                      value={item.time}
                      onChange={(e) => handleScheduleChange(index, "time", e.target.value)}
                    />
                  </div>
                  <div className="flex items-end">
                    {scheduleItems.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        onClick={() => removeScheduleItem(index)}
                      >
                        Remove
                      </Button>
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`schedule-description-${index}`}>Description</Label>
                  <Input
                    id={`schedule-description-${index}`}
                    value={item.description}
                    onChange={(e) => handleScheduleChange(index, "description", e.target.value)}
                    placeholder="e.g., Rehearsal, Performance, etc."
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Music List Section */}
        <div className="p-6 border rounded-md bg-muted/20">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium">Music List</h3>
            <Button type="button" variant="outline" size="sm" onClick={addMusicCategory}>
              Add Service
            </Button>
          </div>
          <div className="space-y-6">
            {musicListItems.map((category, categoryIndex) => (
              <div key={categoryIndex} className="p-4 border rounded-md bg-background">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-full max-w-md">
                    <Label htmlFor={`category-${categoryIndex}`} className="mb-2 block">
                      Service
                    </Label>
                    <Input
                      id={`category-${categoryIndex}`}
                      value={category.category}
                      onChange={(e) => handleMusicCategoryChange(categoryIndex, e.target.value)}
                      placeholder="e.g., Evensong, Mass, Matins"
                    />
                  </div>
                  {musicListItems.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="text-red-500 hover:text-red-700 hover:bg-red-50 mt-6"
                      onClick={() => removeMusicCategory(categoryIndex)}
                    >
                      Remove Service
                    </Button>
                  )}
                </div>

                <div className="space-y-4">
                  {category.items.map((item, itemIndex) => (
                    <div key={itemIndex} className="grid gap-4 p-3 border rounded-md bg-muted/10">
                      <div className="grid gap-4 md:grid-cols-3">
                        <div className="space-y-2">
                          <Label htmlFor={`type-${categoryIndex}-${itemIndex}`}>Type (Optional)</Label>
                          <div className="relative">
                            <Input
                              id={`type-${categoryIndex}-${itemIndex}`}
                              value={item.type}
                              onChange={(e) => handleMusicItemChange(categoryIndex, itemIndex, "type", e.target.value)}
                              placeholder="Start typing or select..."
                              onFocus={() => toggleMusicTypePopover(categoryIndex, itemIndex, true)}
                              onBlur={() =>
                                setTimeout(() => toggleMusicTypePopover(categoryIndex, itemIndex, false), 200)
                              }
                            />
                            {musicTypeOpen[`${categoryIndex}-${itemIndex}`] && (
                              <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-auto">
                                {MUSIC_TYPES.filter((type) => type.toLowerCase().includes(item.type.toLowerCase())).map(
                                  (type) => (
                                    <div
                                      key={type}
                                      className="px-3 py-2 cursor-pointer hover:bg-muted"
                                      onMouseDown={() => {
                                        handleMusicItemChange(categoryIndex, itemIndex, "type", type)
                                        toggleMusicTypePopover(categoryIndex, itemIndex, false)
                                      }}
                                    >
                                      {type}
                                    </div>
                                  ),
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor={`title-${categoryIndex}-${itemIndex}`}>Title</Label>
                          <Input
                            id={`title-${categoryIndex}-${itemIndex}`}
                            value={item.title}
                            onChange={(e) => handleMusicItemChange(categoryIndex, itemIndex, "title", e.target.value)}
                            placeholder="e.g., Magnificat"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor={`composer-${categoryIndex}-${itemIndex}`}>Composer (Optional)</Label>
                          <Input
                            id={`composer-${categoryIndex}-${itemIndex}`}
                            value={item.composer}
                            onChange={(e) =>
                              handleMusicItemChange(categoryIndex, itemIndex, "composer", e.target.value)
                            }
                            placeholder="e.g., Stanford"
                          />
                        </div>
                      </div>
                      <div className="flex justify-end">
                        {category.items.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                            onClick={() => removeMusicItem(categoryIndex, itemIndex)}
                          >
                            Remove Item
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => addMusicItem(categoryIndex)}
                    className="mt-2"
                  >
                    Add Music Item
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end gap-4 pt-4">
          <Link href="/admin">
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </Link>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Creating..." : "Create Event"}
          </Button>
        </div>
      </form>
    </div>
  )
}

