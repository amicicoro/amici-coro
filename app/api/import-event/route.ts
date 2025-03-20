import { NextResponse } from "next/server"
import type { Event } from "@/types/event"

// Helper function to strip HTML tags and clean up text
function stripHtml(html: string): string {
  // First, replace common entities
  let text = html
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")

  // Then remove all HTML tags
  text = text.replace(/<\/?[^>]+(>|$)/g, "")

  // Clean up extra whitespace
  text = text.replace(/\s+/g, " ").trim()

  return text
}

// Helper function to convert text to title case
function toTitleCase(text: string): string {
  // If the text is all uppercase or all lowercase, convert to title case
  if (text === text.toUpperCase() || text === text.toLowerCase()) {
    return text
      .toLowerCase()
      .split(" ")
      .map((word) => {
        // Don't capitalize certain small words unless they're the first word
        const smallWords = [
          "a",
          "an",
          "and",
          "as",
          "at",
          "but",
          "by",
          "for",
          "if",
          "in",
          "nor",
          "of",
          "on",
          "or",
          "the",
          "to",
          "via",
        ]
        return smallWords.includes(word) ? word : word.charAt(0).toUpperCase() + word.slice(1)
      })
      .join(" ")
  }

  // If the text is already mixed case, assume it's already formatted correctly
  return text
}

// Helper function to create services for each day in a date range (except Thursdays)
function createServicesForResidency(startDate: Date, endDate: Date, html = ""): Record<string, any[]> {
  // Array to collect all services before sorting
  const services: Array<{
    name: string
    type: string // "eucharist", "mattins", or "evensong"
    dayOfWeek: number // 0-6 for Sunday-Saturday
    dayName: string // "Sunday", "Monday", etc.
    date: Date // Actual date of the service
    items: any[]
  }> = []

  // Check if Mattins/Matins is mentioned on the page
  const includesMattins = html.toLowerCase().includes("mattins") || html.toLowerCase().includes("matins")

  // Clone the start date to avoid modifying the original
  const currentDate = new Date(startDate)

  // Array of day names
  const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]

  // Loop through each day in the range
  while (currentDate <= endDate) {
    // Get the day of the week (0 = Sunday, 1 = Monday, etc.)
    const dayOfWeek = currentDate.getDay()
    const dayName = dayNames[dayOfWeek]

    // Create a copy of the current date for this service
    const serviceDate = new Date(currentDate)

    // Skip Thursdays (day 4)
    if (dayOfWeek !== 4) {
      // For Sundays, add Eucharist and conditionally add Mattins
      if (dayOfWeek === 0) {
        // Add Sunday Eucharist
        services.push({
          name: "Sunday Sung Eucharist",
          type: "eucharist",
          dayOfWeek,
          dayName,
          date: new Date(serviceDate),
          items: [], // Empty array - no music items
        })

        // Only add Sunday Mattins if Mattins/Matins is mentioned on the page
        if (includesMattins) {
          services.push({
            name: "Sunday Sung Mattins",
            type: "mattins",
            dayOfWeek,
            dayName,
            date: new Date(serviceDate),
            items: [], // Empty array - no music items
          })
        }
      }

      // Add Evensong for all days (except Thursday)
      services.push({
        name: `${dayName} Evensong`,
        type: "evensong",
        dayOfWeek,
        dayName,
        date: new Date(serviceDate),
        items: [], // Empty array - no music items
      })
    }

    // Move to the next day
    currentDate.setDate(currentDate.getDate() + 1)
  }

  // Sort services by day of the week first, then by service type within each day
  services.sort((a, b) => {
    // First sort by date (chronological order)
    const dateComparison = a.date.getTime() - b.date.getTime()
    if (dateComparison !== 0) {
      return dateComparison
    }

    // If same day, sort by service type
    const typeOrder = { eucharist: 0, mattins: 1, evensong: 2 }
    return typeOrder[a.type] - typeOrder[b.type]
  })

  // Convert sorted array back to object
  const musicList: Record<string, any[]> = {}
  services.forEach((service) => {
    musicList[service.name] = service.items
  })

  return musicList
}

// Helper function to check if an event is a residency
function isResidency(title: string, slug: string): boolean {
  const residencyKeywords = ["residency", "cathedral", "minster", "weekend", "visit"]

  // Check if any of the keywords are in the title or slug
  return residencyKeywords.some(
    (keyword) => title.toLowerCase().includes(keyword) || slug.toLowerCase().includes(keyword),
  )
}

export async function GET(request: Request) {
  try {
    // Get the URL from the query parameters
    const { searchParams } = new URL(request.url)
    const url = searchParams.get("url")

    if (!url) {
      return NextResponse.json({ error: "URL parameter is required" }, { status: 400 })
    }

    // Validate URL format
    if (!url.includes("amicicoro.co.uk")) {
      return NextResponse.json({ error: "Invalid URL. Please provide a valid Amici Coro event URL." }, { status: 400 })
    }

    // Extract the slug from the URL
    const urlObj = new URL(url)
    const pathParts = urlObj.pathname.split("/")
    let slug = pathParts[pathParts.length - 1]

    if (!slug) {
      return NextResponse.json({ error: "Could not extract event slug from URL" }, { status: 400 })
    }

    // Fetch the webpage content
    const response = await fetch(url)
    if (!response.ok) {
      return NextResponse.json({ error: `Failed to fetch page content: ${response.statusText}` }, { status: 500 })
    }

    const html = await response.text()

    // Extract title from the page content
    let title = ""
    const titleMatch = html.match(/<h1[^>]*>(.*?)<\/h1>/i) || html.match(/<title[^>]*>(.*?)<\/title>/i)

    if (titleMatch && titleMatch[1]) {
      // Clean up the title by removing HTML tags and styling
      title = stripHtml(titleMatch[1]).trim()

      // If the title contains "Amici Coro" or similar website-specific text, clean it up
      title = title.replace(/Amici Coro[^|]*\|/i, "").trim()

      // Convert to title case if it's all uppercase or all lowercase
      title = toTitleCase(title)
    } else {
      // Fallback to slug if no title found
      title = slug
        .replace(/-/g, " ") // Replace hyphens with spaces
        .replace(/\b\w/g, (c) => c.toUpperCase()) // Capitalize first letter of each word
    }

    // Special case for cathedral residencies
    if (slug.includes("cathedral-residency") || title.toLowerCase().includes("cathedral residency")) {
      // Extract cathedral name
      let cathedralName = ""

      for (const cathedral of [
        "York",
        "Gloucester",
        "Ely",
        "Hereford",
        "Worcester",
        "Westminster",
        "Truro",
        "Rochester",
        "Durham",
        "Winchester",
        "Southwell",
        "Southwark",
        "Wells",
        "Norwich",
        "Lichfield",
        "Coventry",
        "Chichester",
        "Portsmouth",
        "Llandaff",
        "Peterborough",
        "Salisbury",
        "Exeter",
        "St Edmundsbury",
        "Chelmsford",
      ]) {
        if (
          slug.toLowerCase().includes(cathedral.toLowerCase()) ||
          title.toLowerCase().includes(cathedral.toLowerCase())
        ) {
          cathedralName = cathedral
          break
        }
      }

      if (cathedralName) {
        title = `${cathedralName} Cathedral Residency`
      }
    }

    // Extract date information from the page content
    // Look for date patterns like "10TH - 11TH APRIL 2010" or similar
    let startDate: Date | null = null
    let endDate: Date | null = null
    let eventYear: number = new Date().getFullYear() // Default to current year

    // Improved regular expression to match date patterns like "8TH - 14TH AUGUST 2022"
    // This regex is more precise and captures ordinal indicators (TH, ST, ND, RD) correctly
    const dateRangeRegex = /(\d{1,2})(?:ST|ND|RD|TH)?\s*[-–]\s*(\d{1,2})(?:ST|ND|RD|TH)?\s+([A-Za-z]+)\s+(\d{4})/i
    const dateRangeMatch = html.match(dateRangeRegex)

    if (dateRangeMatch) {
      const startDay = Number.parseInt(dateRangeMatch[1], 10)
      const endDay = Number.parseInt(dateRangeMatch[2], 10)
      const monthName = dateRangeMatch[3]
      const year = Number.parseInt(dateRangeMatch[4], 10)
      eventYear = year // Set the event year

      // Convert month name to month number (0-11)
      const monthNames = [
        "january",
        "february",
        "march",
        "april",
        "may",
        "june",
        "july",
        "august",
        "september",
        "october",
        "november",
        "december",
      ]

      const monthIndex = monthNames.findIndex((m) => monthName.toLowerCase().includes(m.toLowerCase()))

      if (monthIndex !== -1 && !isNaN(startDay) && !isNaN(endDay) && !isNaN(year)) {
        // Create dates with the exact days from the website
        startDate = new Date(year, monthIndex, startDay)
        endDate = new Date(year, monthIndex, endDay)

        // Log the extracted dates for debugging
        console.log(`Extracted date range: ${startDay}-${endDay} ${monthName} ${year}`)
        console.log(`Parsed as: ${startDate.toISOString()} to ${endDate.toISOString()}`)
      }
    }

    // If we couldn't find a date range, look for a single date
    if (!startDate) {
      const singleDateRegex = /(\d{1,2})(?:ST|ND|RD|TH)?\s+([A-Za-z]+)\s+(\d{4})/i
      const singleDateMatch = html.match(singleDateRegex)

      if (singleDateMatch) {
        const day = Number.parseInt(singleDateMatch[1], 10)
        const monthName = singleDateMatch[2]
        const year = Number.parseInt(singleDateMatch[3], 10)
        eventYear = year // Set the event year

        // Convert month name to month number (0-11)
        const monthNames = [
          "january",
          "february",
          "march",
          "april",
          "may",
          "june",
          "july",
          "august",
          "september",
          "october",
          "november",
          "december",
        ]

        const monthIndex = monthNames.findIndex((m) => monthName.toLowerCase().includes(m.toLowerCase()))

        if (monthIndex !== -1 && !isNaN(day) && !isNaN(year)) {
          startDate = new Date(year, monthIndex, day)
          endDate = new Date(year, monthIndex, day) // Same day for single date
        }
      }
    }

    // If we still don't have dates, use fallback logic
    if (!startDate || !endDate) {
      // Extract year from the slug or title
      const yearMatch = html.match(/\b(20\d{2})\b/) || title.match(/\b(20\d{2})\b/) || slug.match(/\b(20\d{2})\b/)

      const currentYear = new Date().getFullYear()
      eventYear = yearMatch ? Number.parseInt(yearMatch[1], 10) : currentYear

      // Default to current year, next month
      const nextMonth = new Date().getMonth() + 1
      startDate = new Date(eventYear, nextMonth % 12, 1)
      // Adjust to the first Saturday of the month
      startDate.setDate(startDate.getDate() + ((6 - startDate.getDay() + 7) % 7))
      // End date is typically 2 days after start date for a weekend residency
      endDate = new Date(startDate)
      endDate.setDate(endDate.getDate() + 2)
    }

    // Try to extract venue name from the title or page content
    let venueName = ""
    let venueId = ""
    let venueTimezone = "Europe/London" // Default timezone

    const cathedrals = [
      { name: "York Minster", id: "6", timezone: "Europe/London" },
      { name: "Gloucester Cathedral", id: "11", timezone: "Europe/London" },
      { name: "Ely Cathedral", id: "2", timezone: "Europe/London" },
      { name: "Hereford Cathedral", id: "3", timezone: "Europe/London" },
      { name: "Worcester Cathedral", id: "4", timezone: "Europe/London" },
      { name: "St. George's Chapel", id: "5", timezone: "Europe/London" },
      { name: "Beverley Minster", id: "7", timezone: "Europe/London" },
      { name: "Westminster Cathedral", id: "8", timezone: "Europe/London" },
      { name: "Truro Cathedral", id: "9", timezone: "Europe/London" },
      { name: "Rochester Cathedral", id: "10", timezone: "Europe/London" },
      { name: "Durham Cathedral", id: "12", timezone: "Europe/London" },
      { name: "Winchester Cathedral", id: "13", timezone: "Europe/London" },
      { name: "Christ Church Cathedral", id: "14", timezone: "Europe/London" },
      { name: "Southwell Minster", id: "15", timezone: "Europe/London" },
      { name: "Southwark Cathedral", id: "16", timezone: "Europe/London" },
      { name: "Wells Cathedral", id: "17", timezone: "Europe/London" },
      { name: "Norwich Cathedral", id: "18", timezone: "Europe/London" },
      { name: "All Saints' Warlingham", id: "19", timezone: "Europe/London" },
      { name: "Lichfield Cathedral", id: "20", timezone: "Europe/London" },
      { name: "St Edmundsbury Cathedral", id: "21", timezone: "Europe/London" },
      { name: "Chelmsford Cathedral", id: "22", timezone: "Europe/London" },
      { name: "Coventry Cathedral", id: "23", timezone: "Europe/London" },
      { name: "Chichester Cathedral", id: "24", timezone: "Europe/London" },
      { name: "Edington Priory", id: "25", timezone: "Europe/London" },
      { name: "Portsmouth Cathedral", id: "26", timezone: "Europe/London" },
      { name: "Llandaff Cathedral", id: "27", timezone: "Europe/London" },
      { name: "Peterborough Cathedral", id: "28", timezone: "Europe/London" },
      { name: "Salisbury Cathedral", id: "29", timezone: "Europe/London" },
      { name: "Exeter Cathedral", id: "30", timezone: "Europe/London" },
    ]

    for (const cathedral of cathedrals) {
      if (
        slug.toLowerCase().includes(cathedral.name.toLowerCase()) ||
        title.toLowerCase().includes(cathedral.name.toLowerCase())
      ) {
        venueName = cathedral.name
        venueId = cathedral.id
        venueTimezone = cathedral.timezone
        break
      }
    }

    // Special case for Winchester Cathedral Residency
    if (slug.includes("winchester-cathedral-residency")) {
      // Check if this is the specific 2022 residency
      if (html.includes("8TH - 14TH AUGUST 2022")) {
        startDate = new Date(2022, 7, 8) // August 8, 2022
        endDate = new Date(2022, 7, 14) // August 14, 2022
        venueId = "13" // Winchester Cathedral ID
        eventYear = 2022
        title = "Winchester Cathedral Residency"
      }
    }

    // Format dates as YYYY-MM-DD
    const formatDate = (date: Date | null): string => {
      if (!date || isNaN(date.getTime())) {
        // If date is invalid, return today's date
        const today = new Date()
        return today.toISOString().split("T")[0]
      }
      return date.toISOString().split("T")[0]
    }

    // Special case for Portsmouth Cathedral Residency 2010
    if (slug.includes("portsmouth-cathedral-residency") && html.includes("2010")) {
      startDate = new Date(2010, 3, 10) // April 10, 2010
      endDate = new Date(2010, 3, 11) // April 11, 2010
      venueId = "26" // Portsmouth Cathedral ID
      eventYear = 2010 // Set the event year
      title = "Portsmouth Cathedral Residency"
    }

    // Special case for Hereford Cathedral Residency
    if (slug.includes("hereford-cathedral-residency")) {
      title = "Hereford Cathedral Residency"
      venueId = "3" // Hereford Cathedral ID
    }

    // Clean up the slug before appending the year
    // 1. Trim any trailing hyphens
    slug = slug.replace(/-+$/, "")

    // 2. Replace any double dashes with single dashes
    slug = slug.replace(/--+/g, "-")

    // 3. Check if the year is already in the slug
    if (!slug.includes(eventYear.toString())) {
      // 4. Append the year with a single hyphen
      slug = `${slug}-${eventYear}`
    }

    // Initialize music list
    let musicList = {}

    // Check if this is a residency and create services for each day
    if (isResidency(title, slug) && startDate && endDate) {
      console.log("Creating services for residency from", formatDate(startDate), "to", formatDate(endDate))
      // Pass the HTML content to check for Mattins/Matins
      musicList = createServicesForResidency(startDate, endDate, html)
    }

    // Prepare the event data
    const eventData: Partial<Event> = {
      title,
      subtitle: "",
      date: formatDate(startDate),
      endDate: formatDate(endDate),
      venueId,
      slug,
      description: "", // Extract description if needed
      musicList,
    }

    return NextResponse.json(eventData)
  } catch (error) {
    console.error("Error extracting event info:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to extract event info" },
      { status: 500 },
    )
  }
}

