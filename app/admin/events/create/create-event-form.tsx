"use client"

import React from "react"

import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { VenueSelector } from "@/components/venue-selector"
import { ImportEventDialog } from "./import-event-dialog"
// Add these imports at the top with the other imports
import { MoveUp, MoveDown, Music, Plus, Edit, ChevronDown, ChevronRight, ChevronUp } from "lucide-react"
import type { Event, MusicItem } from "@/types/event"
import type { Venue } from "@/types/venue"

// Mock venues data - replace with API call later
const MUSIC_TYPES = ["Responses", "Psalm", "Magnificat", "Nunc Dimittis", "Anthem"]

export default function CreateEventForm() {
  const router = useRouter()
  const [title, setTitle] = useState("")
  const [subtitle, setSubtitle] = useState("")
  const [date, setDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [venueId, setVenueId] = useState("")
  const [slug, setSlug] = useState("")
  const [description, setDescription] = useState("")
  const [scheduleItems, setScheduleItems] = useState<{ date: string; time: string; description: string }[]>([])
  const [musicListItems, setMusicListItems] = useState<{ service: string; items: MusicItem[] }[]>([])
  const [venues, setVenues] = useState<Venue[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [musicTypeOpen, setMusicTypeOpen] = useState<{ [key: string]: boolean }>({})

  // New state for tracking expanded/collapsed music items
  const [expandedServices, setExpandedServices] = useState<{ [key: number]: boolean }>({})
  const [editingItem, setEditingItem] = useState<{ serviceIndex: number; itemIndex: number } | null>(null)

  // Add a new state for tracking expanded services
  const [expandedServiceDetails, setExpandedServiceDetails] = useState<{ [key: number]: boolean }>({})

  // Add a new state to track the focused service
  const [focusedServiceIndex, setFocusedServiceIndex] = useState<number | null>(null)

  // Fetch venues on mount
  React.useEffect(() => {
    const fetchVenues = async () => {
      try {
        const response = await fetch("/api/venues")
        if (!response.ok) {
          throw new Error("Failed to fetch venues")
        }
        const venuesData = await response.json()
        setVenues(venuesData)
      } catch (err) {
        console.error("Error loading venues:", err)
        setFormError("Failed to load venues. Please try again later.")
      }
    }

    fetchVenues()
  }, [])

  // Function to handle importing event data
  const handleImport = useCallback((eventData: Partial<Event>) => {
    setTitle(eventData.title || "")
    setSubtitle(eventData.subtitle || "")
    setDate(eventData.date || "")
    setEndDate(eventData.endDate || "")
    setVenueId(eventData.venueId || "")
    setSlug(eventData.slug || "")
    setDescription(eventData.description || "")

    // Reset schedule and music list
    setScheduleItems([])
    setMusicListItems([])
    setExpandedServices({})
    setEditingItem(null)

    // Process schedule items if they exist
    if (eventData.schedule && eventData.schedule.length > 0) {
      const formattedSchedule = eventData.schedule.map((item) => ({
        date: item.date,
        time: "", // Time is not in the Event type but is in the form
        description: item.description,
      }))
      setScheduleItems(formattedSchedule)
    }

    // Process music list items if they exist
    if (eventData.musicList && Object.keys(eventData.musicList).length > 0) {
      console.log("Processing imported music list:", eventData.musicList)

      // Convert the musicList object to the array format expected by the form
      const formattedMusicList = Object.entries(eventData.musicList).map(([service, items]) => ({
        service,
        items: items || [],
      }))

      console.log("Formatted music list for form:", formattedMusicList)
      setMusicListItems(formattedMusicList)

      // Expand the first service by default
      if (formattedMusicList.length > 0) {
        setExpandedServices({ 0: true })
        setExpandedServiceDetails({ 0: true }) // Expand the first service by default
      }
    }
  }, [])

  // Function to handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setFormError(null)

    // Generate a slug if not provided
    const eventSlug =
      slug ||
      title
        .toLowerCase()
        .replace(/[^\w\s]/gi, "")
        .replace(/\s+/g, "-")

    const eventData: Event = {
      id: eventSlug, // Use the slug as the ID
      title,
      subtitle,
      date,
      endDate,
      venueId,
      slug: eventSlug, // Ensure slug is set
      description,
      schedule: scheduleItems.map((item) => ({ date: item.date, description: item.description })),
      musicList: musicListItems.reduce((acc: { [key: string]: MusicItem[] }, service) => {
        acc[service.service] = service.items
        return acc
      }, {}),
    }

    try {
      // Call the API to create the event
      const response = await fetch("/api/events", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Admin-Auth-Token": localStorage.getItem("adminAuthToken") || "", // Get token from localStorage
        },
        body: JSON.stringify(eventData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to create event")
      }

      // Redirect to the admin dashboard
      router.push("/admin")
    } catch (err) {
      console.error("Error creating event:", err)
      setFormError(err instanceof Error ? err.message : "Failed to create event")
    } finally {
      setIsLoading(false)
    }
  }

  // Schedule Functions
  const addScheduleItem = () => {
    setScheduleItems([...scheduleItems, { date: "", time: "", description: "" }])
  }

  const removeScheduleItem = (index: number) => {
    const newScheduleItems = [...scheduleItems]
    newScheduleItems.splice(index, 1)
    setScheduleItems(newScheduleItems)
  }

  const handleScheduleChange = (index: number, field: string, value: string) => {
    const newScheduleItems = [...scheduleItems]
    newScheduleItems[index][field] = value
    setScheduleItems(newScheduleItems)
  }

  // Music Functions
  const addMusicService = () => {
    const newIndex = musicListItems.length
    setMusicListItems([...musicListItems, { service: "", items: [{ title: "", composer: "", type: "" }] }])
    // Expand the newly added service
    setExpandedServices((prev) => ({ ...prev, [newIndex]: true }))
    // Set the first item of the new service as being edited
    setEditingItem({ serviceIndex: newIndex, itemIndex: 0 })
  }

  const removeMusicService = (serviceIndex: number) => {
    const newMusicListItems = [...musicListItems]
    newMusicListItems.splice(serviceIndex, 1)
    setMusicListItems(newMusicListItems)

    // Update expanded services
    const newExpandedServices = { ...expandedServices }
    delete newExpandedServices[serviceIndex]

    // Shift keys for services after the removed one
    Object.keys(newExpandedServices).forEach((key) => {
      const numKey = Number.parseInt(key)
      if (numKey > serviceIndex) {
        newExpandedServices[numKey - 1] = newExpandedServices[numKey]
        delete newExpandedServices[numKey]
      }
    })

    setExpandedServices(newExpandedServices)

    // Clear editing state if the service being edited was removed
    if (editingItem && editingItem.serviceIndex === serviceIndex) {
      setEditingItem(null)
    } else if (editingItem && editingItem.serviceIndex > serviceIndex) {
      // Adjust the editing index if a service before it was removed
      setEditingItem({
        serviceIndex: editingItem.serviceIndex - 1,
        itemIndex: editingItem.itemIndex,
      })
    }
  }

  const handleMusicServiceChange = (serviceIndex: number, value: string) => {
    const newMusicListItems = [...musicListItems]
    newMusicListItems[serviceIndex].service = value
    setMusicListItems(newMusicListItems)
  }

  const addMusicItem = (serviceIndex: number) => {
    const newMusicListItems = [...musicListItems]
    const newItemIndex = newMusicListItems[serviceIndex].items.length
    newMusicListItems[serviceIndex].items.push({ title: "", composer: "", type: "" })
    setMusicListItems(newMusicListItems)

    // Expand the service and set the new item as being edited
    setExpandedServices((prev) => ({ ...prev, [serviceIndex]: true }))
    setEditingItem({ serviceIndex, itemIndex: newItemIndex })
  }

  const removeMusicItem = (serviceIndex: number, itemIndex: number) => {
    const newMusicListItems = [...musicListItems]
    newMusicListItems[serviceIndex].items.splice(itemIndex, 1)
    setMusicListItems(newMusicListItems)

    // Clear editing state if the item being edited was removed
    if (editingItem && editingItem.serviceIndex === serviceIndex && editingItem.itemIndex === itemIndex) {
      setEditingItem(null)
    } else if (editingItem && editingItem.serviceIndex === serviceIndex && editingItem.itemIndex > itemIndex) {
      // Adjust the editing index if an item before it was removed
      setEditingItem({
        serviceIndex: editingItem.serviceIndex,
        itemIndex: editingItem.itemIndex - 1,
      })
    }
  }

  const handleMusicItemChange = (serviceIndex: number, itemIndex: number, field: string, value: string) => {
    const newMusicListItems = [...musicListItems]
    newMusicListItems[serviceIndex].items[itemIndex][field] = value
    setMusicListItems(newMusicListItems)
  }

  const toggleMusicTypePopover = (serviceIndex: number, itemIndex: number, isOpen: boolean) => {
    setMusicTypeOpen((prev) => ({ ...prev, [`${serviceIndex}-${itemIndex}`]: isOpen }))
  }

  // Modify the toggleServiceExpanded function to also handle service expansion
  const toggleServiceExpanded = (serviceIndex: number) => {
    setExpandedServices((prev) => ({
      ...prev,
      [serviceIndex]: !prev[serviceIndex],
    }))
  }

  // Add a new function to toggle service expansion
  const toggleServiceDetailsExpanded = (serviceIndex: number) => {
    setExpandedServiceDetails((prev) => ({
      ...prev,
      [serviceIndex]: !prev[serviceIndex],
    }))
  }

  // Set an item as being edited
  const setItemEditing = (serviceIndex: number, itemIndex: number) => {
    setEditingItem({ serviceIndex, itemIndex })
    // Make sure the service is expanded
    setExpandedServices((prev) => ({
      ...prev,
      [serviceIndex]: true,
    }))
  }

  // Check if an item is currently being edited
  const isItemEditing = (serviceIndex: number, itemIndex: number) => {
    return editingItem?.serviceIndex === serviceIndex && editingItem?.itemIndex === itemIndex
  }

  // Render a collapsed view of a music item
  const renderCollapsedMusicItem = (item: MusicItem, serviceIndex: number, itemIndex: number) => {
    return (
      <div
        key={itemIndex}
        className="flex items-center justify-between p-3 border rounded-md bg-muted/10 cursor-pointer hover:bg-muted/20"
        onClick={() => setItemEditing(serviceIndex, itemIndex)}
      >
        <div className="flex items-center gap-2">
          <Music className="h-4 w-4 text-muted-foreground" />
          <div>
            <span className="font-medium">{item.title || "Untitled"}</span>
            {item.composer && <span className="text-muted-foreground ml-2">by {item.composer}</span>}
            {item.type && <span className="text-xs text-muted-foreground ml-2">({item.type})</span>}
          </div>
        </div>
        <Edit className="h-4 w-4 text-muted-foreground" />
      </div>
    )
  }

  // Add this function inside the CreateEventForm component, after the existing handler functions
  const moveServiceUp = (serviceIndex: number) => {
    if (serviceIndex === 0) return // Already at the top

    const newMusicListItems = [...musicListItems]
    // Swap with the item above
    ;[newMusicListItems[serviceIndex - 1], newMusicListItems[serviceIndex]] = [
      newMusicListItems[serviceIndex],
      newMusicListItems[serviceIndex - 1],
    ]

    setMusicListItems(newMusicListItems)

    // Set focus to the service that was moved (now at the new position)
    setFocusedServiceIndex(serviceIndex - 1)

    // Update expanded states to maintain the same expanded services
    if (expandedServiceDetails[serviceIndex] || expandedServiceDetails[serviceIndex - 1]) {
      setExpandedServiceDetails((prev) => {
        const newState = { ...prev }
        newState[serviceIndex - 1] = prev[serviceIndex]
        newState[serviceIndex] = prev[serviceIndex - 1]
        return newState
      })
    }

    // Update expanded services to maintain the same expanded services
    if (expandedServices[serviceIndex] || expandedServices[serviceIndex - 1]) {
      setExpandedServices((prev) => {
        const newState = { ...prev }
        newState[serviceIndex - 1] = prev[serviceIndex]
        newState[serviceIndex] = prev[serviceIndex - 1]
        return newState
      })
    }

    // Update editing state if needed
    if (editingItem && (editingItem.serviceIndex === serviceIndex || editingItem.serviceIndex === serviceIndex - 1)) {
      setEditingItem({
        serviceIndex: editingItem.serviceIndex === serviceIndex ? serviceIndex - 1 : serviceIndex,
        itemIndex: editingItem.itemIndex,
      })
    }
  }

  const moveServiceDown = (serviceIndex: number) => {
    if (serviceIndex === musicListItems.length - 1) return // Already at the bottom

    const newMusicListItems = [...musicListItems]
    // Swap with the item below
    ;[newMusicListItems[serviceIndex], newMusicListItems[serviceIndex + 1]] = [
      newMusicListItems[serviceIndex + 1],
      newMusicListItems[serviceIndex],
    ]

    setMusicListItems(newMusicListItems)

    // Set focus to the service that was moved (now at the new position)
    setFocusedServiceIndex(serviceIndex + 1)

    // Update expanded states to maintain the same expanded services
    if (expandedServiceDetails[serviceIndex] || expandedServiceDetails[serviceIndex + 1]) {
      setExpandedServiceDetails((prev) => {
        const newState = { ...prev }
        newState[serviceIndex + 1] = prev[serviceIndex]
        newState[serviceIndex] = prev[serviceIndex + 1]
        return newState
      })
    }

    // Update expanded services to maintain the same expanded services
    if (expandedServices[serviceIndex] || expandedServices[serviceIndex + 1]) {
      setExpandedServices((prev) => {
        const newState = { ...prev }
        newState[serviceIndex + 1] = prev[serviceIndex]
        newState[serviceIndex] = prev[serviceIndex + 1]
        return newState
      })
    }

    // Update editing state if needed
    if (editingItem && (editingItem.serviceIndex === serviceIndex || editingItem.serviceIndex === serviceIndex + 1)) {
      setEditingItem({
        serviceIndex: editingItem.serviceIndex === serviceIndex ? serviceIndex + 1 : serviceIndex,
        itemIndex: editingItem.itemIndex,
      })
    }
  }

  // Add a useEffect to auto-expand the focused service
  React.useEffect(() => {
    if (focusedServiceIndex !== null) {
      // Auto-expand the focused service
      setExpandedServiceDetails((prev) => ({
        ...prev,
        [focusedServiceIndex]: true,
      }))

      // Clear the focus after a short delay
      const timer = setTimeout(() => {
        setFocusedServiceIndex(null)
      }, 1500)

      return () => clearTimeout(timer)
    }
  }, [focusedServiceIndex])

  return (
    <div className="container max-w-3xl py-12">
      <div className="mb-8 px-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold">Create Event</h1>
            <p className="text-muted-foreground mt-2">Fill out the form below to create a new event.</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => router.back()}>
              Back to Events
            </Button>
            <ImportEventDialog onImport={handleImport} />
          </div>
        </div>
      </div>

      <Card className="shadow-md">
        <CardHeader className="pb-2">
          <CardTitle>Event Details</CardTitle>
          <CardDescription>Basic information about the event</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {formError && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">{formError}</div>
          )}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="title">
                Title <span className="text-red-500">*</span>
              </Label>
              <Input
                id="title"
                placeholder="Event Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="subtitle">Subtitle</Label>
              <Input
                id="subtitle"
                placeholder="Event Subtitle"
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="date">
                Start Date <span className="text-red-500">*</span>
              </Label>
              <Input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">
                End Date <span className="text-red-500">*</span>
              </Label>
              <Input id="endDate" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} required />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="venue">
              Venue <span className="text-red-500">*</span>
            </Label>
            <VenueSelector venues={venues} value={venueId} onChange={setVenueId} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="slug">Slug</Label>
            <Input id="slug" placeholder="event-slug" value={slug} onChange={(e) => setSlug(e.target.value)} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Event Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* Schedule Section - Apply the same fix */}
          <div className="p-6 border rounded-md bg-muted/20">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h3 className="text-lg font-medium">Event Schedule</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Optional: Add performance times. Leave empty if not applicable.
                </p>
              </div>
              <Button type="button" variant="outline" size="sm" onClick={addScheduleItem}>
                Add Schedule Item
              </Button>
            </div>

            {/* Empty state - when there are no items */}
            {scheduleItems.length === 0 && (
              <div className="bg-muted/30 rounded-md p-4 mt-4 text-center">
                <p className="text-muted-foreground">
                  No schedule items added. This section will be empty in the event.
                </p>
              </div>
            )}

            {/* Always show the form if scheduleAddClicked is true OR if there are non-empty items */}
            {scheduleItems.length > 0 && (
              <div className="space-y-4 mt-4">
                {scheduleItems.map((item, index) => (
                  <div key={index} className="grid gap-4 p-4 border rounded-md bg-background">
                    <div className="space-y-2">
                      <Label htmlFor={`schedule-description-${index}`}>
                        Description <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id={`schedule-description-${index}`}
                        value={item.description}
                        onChange={(e) => handleScheduleChange(index, "description", e.target.value)}
                        placeholder="e.g., Rehearsal, Performance, etc."
                      />
                    </div>
                    <div className="grid gap-4 md:grid-cols-3">
                      <div className="space-y-2">
                        <Label htmlFor={`schedule-date-${index}`}>
                          Date <span className="text-red-500">*</span>
                        </Label>
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
                    {(!item.date || !item.description) && (
                      <p className="text-amber-600 text-sm">
                        Both date and description are required for each schedule item to be saved.
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Music List Section */}
          <div className="p-6 border rounded-md bg-muted/20">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h3 className="text-lg font-medium">Music List</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Add music performed at this event, organized by service type (e.g., Evensong, Mass).
                </p>
              </div>
              <Button type="button" variant="outline" size="sm" onClick={addMusicService}>
                Add Service
              </Button>
            </div>

            {/* Empty state - when there are no items */}
            {musicListItems.length === 0 && (
              <div className="bg-muted/30 rounded-md p-4 mt-4 text-center">
                <p className="text-muted-foreground">
                  No services added yet. Add a service like "Evensong" or "Mass" to include music items.
                </p>
              </div>
            )}

            {/* Always show the form if musicAddClicked is true OR if there are non-empty items */}
            {musicListItems.length > 0 && (
              <div className="space-y-6 mt-4">
                {musicListItems.map((service, serviceIndex) => (
                  <div
                    key={serviceIndex}
                    className={`p-4 border rounded-md bg-background transition-colors duration-300 ${
                      focusedServiceIndex === serviceIndex ? "border-primary bg-primary/5" : ""
                    }`}
                  >
                    {/* Service header with expand/collapse control */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2 flex-grow">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleServiceDetailsExpanded(serviceIndex)}
                          className="p-1"
                        >
                          {expandedServiceDetails[serviceIndex] ? (
                            <ChevronDown className="h-4 w-4" />
                          ) : (
                            <ChevronRight className="h-4 w-4" />
                          )}
                        </Button>
                        <div className="w-full max-w-md">
                          {expandedServiceDetails[serviceIndex] ? (
                            <>
                              <Label htmlFor={`service-${serviceIndex}`} className="mb-2 block">
                                Service Name <span className="text-red-500">*</span>
                              </Label>
                              <Input
                                id={`service-${serviceIndex}`}
                                value={service.service}
                                onChange={(e) => handleMusicServiceChange(serviceIndex, e.target.value)}
                                placeholder="e.g., Evensong, Mass, Matins"
                              />
                              {!service.service && service.items.some((item) => item.title) && (
                                <p className="text-amber-600 text-sm mt-1">
                                  Service name is required for music items to be saved.
                                </p>
                              )}
                            </>
                          ) : (
                            <div
                              className="font-medium text-lg cursor-pointer"
                              onClick={() => toggleServiceDetailsExpanded(serviceIndex)}
                            >
                              {service.service || "Unnamed Service"}
                              <span className="text-muted-foreground text-sm ml-2">
                                ({service.items.length} music item{service.items.length !== 1 ? "s" : ""})
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {/* Reordering buttons */}
                        <div className="flex flex-col gap-1 mr-2">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => moveServiceUp(serviceIndex)}
                            disabled={serviceIndex === 0}
                            className="h-6 w-6 p-0"
                            title="Move service up"
                          >
                            <MoveUp className="h-4 w-4" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => moveServiceDown(serviceIndex)}
                            disabled={serviceIndex === musicListItems.length - 1}
                            className="h-6 w-6 p-0"
                            title="Move service down"
                          >
                            <MoveDown className="h-4 w-4" />
                          </Button>
                        </div>

                        {expandedServiceDetails[serviceIndex] && (
                          <>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleServiceExpanded(serviceIndex)}
                              className="mt-6"
                            >
                              {expandedServices[serviceIndex] ? (
                                <ChevronUp className="h-4 w-4" />
                              ) : (
                                <ChevronDown className="h-4 w-4" />
                              )}
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="text-red-500 hover:text-red-700 hover:bg-red-50 mt-6"
                              onClick={() => removeMusicService(serviceIndex)}
                            >
                              Remove Service
                            </Button>
                          </>
                        )}
                        {!expandedServiceDetails[serviceIndex] && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                            onClick={() => removeMusicService(serviceIndex)}
                          >
                            Remove
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* Collapsed service view */}
                    {!expandedServiceDetails[serviceIndex] && (
                      <div className="pl-8">
                        {service.items.length === 0 ? (
                          <p className="text-muted-foreground text-sm">No music items added yet.</p>
                        ) : (
                          <div className="space-y-1">
                            {service.items.slice(0, 3).map((item, idx) => (
                              <div key={idx} className="text-sm text-muted-foreground">
                                {item.type && <span className="font-medium">{item.type}:</span>}{" "}
                                {item.title || "Untitled"}
                                {item.composer && <span> by {item.composer}</span>}
                              </div>
                            ))}
                            {service.items.length > 3 && (
                              <div className="text-sm text-muted-foreground">
                                ...and {service.items.length - 3} more item{service.items.length - 3 !== 1 ? "s" : ""}
                              </div>
                            )}
                          </div>
                        )}
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            toggleServiceDetailsExpanded(serviceIndex)
                            setExpandedServices((prev) => ({ ...prev, [serviceIndex]: true }))
                          }}
                          className="mt-2"
                        >
                          Edit Service
                        </Button>
                      </div>
                    )}

                    {/* Expanded service view - only show if service is expanded */}
                    {expandedServiceDetails[serviceIndex] && (
                      <>
                        {expandedServices[serviceIndex] ? (
                          <div className="space-y-4">
                            {service.items.map((item, itemIndex) =>
                              isItemEditing(serviceIndex, itemIndex) ? (
                                // Expanded edit view for the item being edited
                                <div key={itemIndex} className="grid gap-4 p-3 border rounded-md bg-muted/10">
                                  <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                                    <div className="space-y-2">
                                      <Label htmlFor={`type-${serviceIndex}-${itemIndex}`}>Type (Optional)</Label>
                                      <div className="relative">
                                        <Input
                                          id={`type-${serviceIndex}-${itemIndex}`}
                                          value={item.type}
                                          onChange={(e) =>
                                            handleMusicItemChange(serviceIndex, itemIndex, "type", e.target.value)
                                          }
                                          placeholder="Start typing or select..."
                                          onFocus={() => toggleMusicTypePopover(serviceIndex, itemIndex, true)}
                                          onBlur={() =>
                                            setTimeout(
                                              () => toggleMusicTypePopover(serviceIndex, itemIndex, false),
                                              200,
                                            )
                                          }
                                        />
                                        {musicTypeOpen[`${serviceIndex}-${itemIndex}`] && (
                                          <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-auto">
                                            {MUSIC_TYPES.filter((type) =>
                                              type.toLowerCase().includes(item.type?.toLowerCase() || ""),
                                            ).map((type) => (
                                              <div
                                                key={type}
                                                className="px-3 py-2 cursor-pointer hover:bg-muted"
                                                onMouseDown={() => {
                                                  handleMusicItemChange(serviceIndex, itemIndex, "type", type)
                                                  toggleMusicTypePopover(serviceIndex, itemIndex, false)
                                                }}
                                              >
                                                {type}
                                              </div>
                                            ))}
                                          </div>
                                        )}
                                      </div>
                                    </div>

                                    {/* Title field - give it more space on medium screens */}
                                    <div className="space-y-2 md:col-span-2 lg:col-span-1">
                                      <Label htmlFor={`title-${serviceIndex}-${itemIndex}`}>
                                        Title <span className="text-red-500">*</span>
                                      </Label>
                                      <Input
                                        id={`title-${serviceIndex}-${itemIndex}`}
                                        value={item.title}
                                        onChange={(e) =>
                                          handleMusicItemChange(serviceIndex, itemIndex, "title", e.target.value)
                                        }
                                        placeholder="e.g., Magnificat"
                                      />
                                    </div>

                                    <div className="space-y-2">
                                      <Label htmlFor={`composer-${serviceIndex}-${itemIndex}`}>
                                        Composer (Optional)
                                      </Label>
                                      <Input
                                        id={`composer-${serviceIndex}-${itemIndex}`}
                                        value={item.composer}
                                        onChange={(e) =>
                                          handleMusicItemChange(serviceIndex, itemIndex, "composer", e.target.value)
                                        }
                                        placeholder="e.g., Stanford"
                                      />
                                    </div>
                                  </div>
                                  <div className="flex justify-between items-center">
                                    {!item.title && (
                                      <p className="text-amber-600 text-sm">
                                        Title is required for this item to be saved.
                                      </p>
                                    )}
                                    <div className="flex gap-2 ml-auto">
                                      <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setEditingItem(null)}
                                      >
                                        Done
                                      </Button>
                                      {service.items.length > 1 && (
                                        <Button
                                          type="button"
                                          variant="ghost"
                                          size="sm"
                                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                          onClick={() => removeMusicItem(serviceIndex, itemIndex)}
                                        >
                                          Remove Item
                                        </Button>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              ) : (
                                // Collapsed view for items not being edited
                                renderCollapsedMusicItem(item, serviceIndex, itemIndex)
                              ),
                            )}
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => addMusicItem(serviceIndex)}
                              className="mt-2"
                            >
                              Add Music Item
                            </Button>
                          </div>
                        ) : (
                          // Collapsed view for the service
                          <div className="space-y-2">
                            {service.items.length === 0 ? (
                              <p className="text-muted-foreground text-sm">No music items added yet.</p>
                            ) : (
                              <div className="space-y-2">
                                {service.items
                                  .slice(0, 2)
                                  .map((item, itemIndex) => renderCollapsedMusicItem(item, serviceIndex, itemIndex))}
                                {service.items.length > 2 && (
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="w-full text-muted-foreground"
                                    onClick={() => toggleServiceExpanded(serviceIndex)}
                                  >
                                    <span className="flex items-center gap-1">
                                      <ChevronDown className="h-4 w-4" />
                                      {service.items.length - 2} more items
                                    </span>
                                  </Button>
                                )}
                              </div>
                            )}
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                addMusicItem(serviceIndex)
                                toggleServiceExpanded(serviceIndex)
                              }}
                              className="mt-2 flex items-center gap-1"
                            >
                              <Plus className="h-4 w-4" /> Add Music Item
                            </Button>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}
            {/* Add a button to add another service at the bottom of the music list section */}
            {musicListItems.length > 0 && (
              <div className="mt-4 flex justify-center">
                <Button type="button" variant="outline" onClick={() => addMusicService()} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add Another Service
                </Button>
              </div>
            )}
          </div>
        </CardContent>
        <div className="flex justify-end space-x-2 p-6">
          <Button variant="ghost" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading} onClick={handleSubmit}>
            {isLoading ? (
              <>
                <svg className="animate-spin h-4 w-4 mr-2" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Creating...
              </>
            ) : (
              "Create Event"
            )}
          </Button>
        </div>
      </Card>
    </div>
  )
}

