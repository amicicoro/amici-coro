import { Calendar, MapPin, Clock, Music } from 'lucide-react'
import type { Event, Venue, MusicItem as MusicItemType } from "@/types/event"
import { formatScheduleDateTime } from "@/lib/date-utils"
import { MusicItem } from "./MusicItem"

interface EventDetailsProps {
  event: Event & { venue: Venue }
  isPastEvent: boolean
}

export function EventDetails({ event, isPastEvent }: EventDetailsProps) {
  const timezone = event.venue?.timezone || "Europe/London" // Default to London if no timezone is specified

  const formatEventDate = (startDate: string, endDate: string) => {
    const start = new Date(startDate)
    const end = new Date(endDate)
    const options: Intl.DateTimeFormatOptions = {
      timeZone: timezone,
      day: "numeric",
      month: "long",
      year: "numeric",
    }

    if (start.toDateString() === end.toDateString()) {
      // Single day event
      return start.toLocaleDateString("en-GB", options).toUpperCase()
    } else {
      // Multi-day event
      const startStr = start.toLocaleDateString("en-GB", options)
      const endStr = end.toLocaleDateString("en-GB", options)

      if (start.getFullYear() === end.getFullYear()) {
        if (start.getMonth() === end.getMonth()) {
          // Same month and year
          return `${start.getDate()} - ${endStr}`.toUpperCase()
        } else {
          // Different months, same year
          return `${start.toLocaleDateString("en-GB", { day: "numeric", month: "long" })} - ${endStr}`.toUpperCase()
        }
      } else {
        // Different years
        return `${startStr} - ${endStr}`.toUpperCase()
      }
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center text-xl text-gray-700">
        <Calendar className="w-6 h-6 mr-2" />
        <span>{formatEventDate(event.date, event.endDate)}</span>
      </div>

      {event.description && <p className="text-gray-700 leading-relaxed text-lg">{event.description}</p>}

      {event.schedule && event.schedule.length > 0 && !isPastEvent && (
        <div className="space-y-4">
          <h3 className="font-semibold text-xl flex items-center">
            <Clock className="w-5 h-5 mr-2" />
            Schedule
          </h3>
          <ul className="space-y-2">
            {event.schedule.map((item, index) => (
              <li key={index} className="text-gray-700 flex items-start">
                <span className="text-primary font-semibold mr-2">•</span>
                <div>
                  <span className="font-normal">{formatScheduleDateTime(item.date, timezone)}</span> {item.description}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {event.venue && (
        <div className="space-y-4">
          <h3 className="font-semibold text-xl flex items-center">
            <MapPin className="w-5 h-5 mr-2" />
            Venue
          </h3>
          <div className="text-gray-700">
            <p className="font-semibold">{event.venue.name}</p>
            <p>{event.venue.address}</p>
            {event.venue.website && (
              <a
                href={event.venue.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline mt-2 inline-block"
              >
                Visit venue website
              </a>
            )}
          </div>
        </div>
      )}

      {event.musicList && Object.keys(event.musicList).length > 0 && (
        <div className="space-y-4">
          <h3 className="font-semibold text-xl flex items-center">
            <Music className="w-5 h-5 mr-2" />
            Music List
          </h3>
          {Object.entries(event.musicList).map(([service, pieces]) => (
            <div key={service} className="space-y-2">
              <h4 className="font-medium text-lg">{service}</h4>
              <ul className="space-y-1 pl-4">
                {pieces.map((piece, index) => (
                  <li key={index} className="list-item">
                    <MusicItem item={piece} />
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}