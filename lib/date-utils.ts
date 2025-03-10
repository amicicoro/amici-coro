export function formatDateRange(
  startDate: string,
  endDate: string,
  format: "long" | "short" = "long",
  timezone: string,
): string {
  const start = new Date(startDate)
  const end = new Date(endDate)

  const formatter = new Intl.DateTimeFormat("en-GB", {
    timeZone: timezone,
    day: "numeric",
    month: format === "long" ? "long" : "short",
    year: "numeric",
  })

  const startFormatted = formatter.format(start)
  const endFormatted = formatter.format(end)

  if (format === "short") {
    return `${startFormatted} - ${endFormatted}`
  } else {
    return `${startFormatted.toUpperCase()} - ${endFormatted.toUpperCase()}`
  }
}

export function formatScheduleDateTime(dateString: string, timezone: string): string {
  if (!dateString) return "Date not available"

  const date = new Date(dateString)
  if (isNaN(date.getTime())) return "Invalid date"

  const formatter = new Intl.DateTimeFormat("en-GB", {
    timeZone: timezone,
    weekday: "long",
    day: "numeric",
    month: "long",
    hour: "numeric",
    minute: "numeric",
    hour12: true,
  })

  const formatted = formatter.formatToParts(date)
  const parts = Object.fromEntries(formatted.map((part) => [part.type, part.value]))

  // Combine hour, minute, and dayPeriod without spaces
  const time = `${parts.hour}:${parts.minute}${parts.dayPeriod.toLowerCase()}`

  return `${parts.weekday} ${parts.day} ${parts.month} - ${time}`
}

function addOrdinalSuffix(day: number): string {
  if (isNaN(day)) return "Invalid day"
  if (day > 3 && day < 21) return day + "th"
  switch (day % 10) {
    case 1:
      return day + "st"
    case 2:
      return day + "nd"
    case 3:
      return day + "rd"
    default:
      return day + "th"
  }
}

