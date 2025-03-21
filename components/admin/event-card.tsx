import Link from "next/link"
import { format } from "date-fns"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { Event } from "@/types/event"

interface EventCardProps {
  event: Event
  type: "upcoming" | "past"
}

export function EventCard({ event, type }: EventCardProps) {
  const isUpcoming = type === "upcoming"
  // Fix the view paths to match your actual routes
  const viewPath = isUpcoming ? `/events/${event.slug}` : `/past-events/${event.slug}`

  return (
    <Card
      className={`overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-200 ${!isUpcoming ? "border-gray-200" : ""}`}
    >
      <CardHeader className="pb-3 pt-6 px-6">
        <div className="flex justify-between items-start gap-4">
          <div className="space-y-1">
            <CardTitle className="text-2xl">{event.title}</CardTitle>
            {event.subtitle && <p className="text-base font-medium text-primary mt-1">{event.subtitle}</p>}
            <CardDescription className="text-base mt-2">
              {format(new Date(event.date), "PPP")}
              {event.date !== event.endDate && ` - ${format(new Date(event.endDate), "PPP")}`}
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link href={viewPath} target="_blank" rel="noopener noreferrer">
                <span className="flex items-center">View</span>
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href={`/admin/events/edit/${event.slug}`}>
                <span className="flex items-center">Edit</span>
              </Link>
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="px-6 pb-6">
        <p className="text-muted-foreground line-clamp-2 mb-4">{event.description || "No description provided"}</p>
        <div className={`flex items-center text-sm ${isUpcoming ? "text-green-600" : "text-gray-500"}`}>
          <span className={`mr-2 h-3 w-3 rounded-full ${isUpcoming ? "bg-green-500" : "bg-gray-400"}`} />
          {isUpcoming ? "Upcoming" : "Past"}
        </div>
      </CardContent>
    </Card>
  )
}

