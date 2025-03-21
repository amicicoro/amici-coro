import { Calendar, Clock } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { EventCard } from "@/components/admin/event-card"
import { ErrorMessage } from "@/components/admin/error-message"
import type { Event } from "@/types/event"

interface EventsListProps {
  title: string
  icon: "calendar" | "clock"
  events: Event[]
  type: "upcoming" | "past"
  error: string | null
}

export function EventsList({ title, icon, events, type, error }: EventsListProps) {
  const Icon = icon === "calendar" ? Calendar : Clock
  const iconColor = type === "upcoming" ? "text-green-600" : "text-gray-500"

  return (
    <div className={type === "upcoming" ? "mb-10" : "mt-12"}>
      <div className="flex items-center gap-2 mb-4">
        <Icon className={`h-5 w-5 ${iconColor}`} />
        <h3 className="text-xl font-medium">{title}</h3>
      </div>

      <ErrorMessage message={error} />

      <div className="grid gap-6">
        {!error && events.length === 0 ? (
          <Card className="shadow-md">
            <CardContent className="pt-10 pb-10">
              <p className="text-center text-muted-foreground text-lg">
                {type === "upcoming" ? "No upcoming events found. Create your first event!" : "No past events found."}
              </p>
            </CardContent>
          </Card>
        ) : (
          events.map((event) => <EventCard key={event.id} event={event} type={type} />)
        )}
      </div>
    </div>
  )
}

