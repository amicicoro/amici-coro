"use client"

import { useState, type KeyboardEvent } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AlertCircle, Import, Loader2 } from "lucide-react"
import type { Event } from "@/types/event"

interface ImportEventDialogProps {
  onImport: (eventData: Partial<Event>) => void
}

export function ImportEventDialog({ onImport }: ImportEventDialogProps) {
  const [url, setUrl] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleImport = async () => {
    setError(null)
    setIsLoading(true)

    try {
      // Call our server-side API to extract event info
      const response = await fetch(`/api/import-event?url=${encodeURIComponent(url)}`)

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to import event")
      }

      const eventData = await response.json()

      // Validate that we have dates
      if (!eventData.date || !eventData.endDate) {
        throw new Error("Could not extract dates from the URL. Please enter them manually.")
      }

      console.log("Imported event data:", eventData)

      // Import the data into the form
      onImport(eventData)

      // Close the dialog
      setOpen(false)
      setUrl("")
    } catch (err) {
      console.error("Import error:", err)
      setError(err instanceof Error ? err.message : "Failed to import event")
    } finally {
      setIsLoading(false)
    }
  }

  // Handle Enter key press
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault() // Prevent form submission
      if (url && !isLoading) {
        handleImport()
      }
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(newOpen) => {
        setOpen(newOpen)
        if (!newOpen) {
          setError(null)
          setIsLoading(false)
        }
      }}
    >
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Import className="h-4 w-4" />
          Import Event
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Import Event</DialogTitle>
          <DialogDescription>Enter the URL of an existing event to pre-populate the form.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="url">Event URL</Label>
            <Input
              id="url"
              placeholder="https://www.amicicoro.co.uk/past-events/portsmouth-cathedral-residency-"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={handleKeyDown}
              autoFocus
              disabled={isLoading}
            />
            <p className="text-xs text-muted-foreground">
              The URL should be from the Amici Coro website. Press Enter to import.
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md flex items-start">
              <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button type="button" variant="ghost" onClick={() => setOpen(false)} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="button" onClick={handleImport} disabled={isLoading || !url}>
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Importing...
              </>
            ) : (
              "Import"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

