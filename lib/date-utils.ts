export function formatDateForInput(dateString: string, timezone = "UTC"): string {
  try {
    // Parse the date string
    const date = new Date(dateString)
    if (isNaN(date.getTime())) {
      console.error(`Invalid date: ${dateString}`)
      return dateString // Return original if invalid
    }

    // Format the date in the specified timezone
    const formatter = new Intl.DateTimeFormat("en-CA", {
      timeZone: timezone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    })

    // The en-CA locale uses YYYY-MM-DD format
    return formatter.format(date)
  } catch (error) {
    console.error(`Error formatting date ${dateString}:`, error)
    return dateString // Return original on error
  }
}

/**
 * Parses a date from an HTML input element and formats it for storage
 * @param inputDate The date string from an HTML input (YYYY-MM-DD)
 * @param timezone The timezone to use for parsing (e.g., 'Europe/London')
 * @returns An ISO date string
 */
export function parseInputDate(inputDate: string, timezone = "UTC"): string {
  try {
    // For input date strings (YYYY-MM-DD), we need to append the timezone
    // to ensure it's interpreted in the correct timezone
    const date = new Date(`${inputDate}T12:00:00`)
    if (isNaN(date.getTime())) {
      console.error(`Invalid input date: ${inputDate}`)
      return inputDate
    }

    // Return the ISO string for storage
    return date.toISOString()
  } catch (error) {
    console.error(`Error parsing input date ${inputDate}:`, error)
    return inputDate
  }
}

// Add these new functions to extract and format time

/**
 * Extracts the time portion from a date string and formats it for HTML time inputs (HH:MM)
 * @param dateString The date string that may contain time information
 * @param timezone The timezone to use for formatting
 * @returns A time string in HH:MM format, or empty string if no time is present
 */
export function extractTimeForInput(dateString: string, timezone = "UTC"): string {
  try {
    // Parse the date string
    const date = new Date(dateString)
    if (isNaN(date.getTime())) {
      console.error(`Invalid date for time extraction: ${dateString}`)
      return ""
    }

    // Check if the date has a non-zero time component
    // If hours and minutes are both 0, assume no time was specified
    const formatter = new Intl.DateTimeFormat("en-GB", {
      timeZone: timezone,
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    })

    const formatted = formatter.format(date)

    // If the time is 00:00, it might be a date-only value
    if (formatted === "00:00") {
      // Check if the original string explicitly included time
      if (!dateString.includes("T") && !dateString.includes(" ") && !dateString.includes(":")) {
        return ""
      }
    }

    return formatted
  } catch (error) {
    console.error(`Error extracting time from ${dateString}:`, error)
    return ""
  }
}

/**
 * Combines a date string and time string into a full ISO date string
 * @param dateString The date string in YYYY-MM-DD format
 * @param timeString The time string in HH:MM format
 * @param timezone The timezone to use for parsing
 * @returns A full ISO date string
 */
export function combineDateAndTime(dateString: string, timeString: string, timezone = "UTC"): string {
  try {
    if (!dateString) {
      return ""
    }

    // If no time provided, just parse the date
    if (!timeString) {
      return parseInputDate(dateString, timezone)
    }

    // Combine date and time
    const combinedString = `${dateString}T${timeString}`
    const date = new Date(combinedString)

    if (isNaN(date.getTime())) {
      console.error(`Invalid date/time combination: ${combinedString}`)
      return parseInputDate(dateString, timezone)
    }

    return date.toISOString()
  } catch (error) {
    console.error(`Error combining date ${dateString} and time ${timeString}:`, error)
    return parseInputDate(dateString, timezone)
  }
}

/**
 * Formats a date and time for display in schedule items
 * @param dateString The date string to format
 * @param timezone The timezone to use for formatting (e.g., 'Europe/London')
 * @returns A formatted date and time string like "Saturday 26 April - 5:30pm"
 */
export function formatScheduleDateTime(dateString: string, timezone = "UTC"): string {
  try {
    // Parse the date string
    const date = new Date(dateString)
    if (isNaN(date.getTime())) {
      console.error(`Invalid date for schedule formatting: ${dateString}`)
      return dateString // Return original if invalid
    }

    // Format the day of week
    const dayOfWeek = new Intl.DateTimeFormat("en-GB", {
      timeZone: timezone,
      weekday: "long",
    }).format(date)

    // Format the day and month
    const dayMonth = new Intl.DateTimeFormat("en-GB", {
      timeZone: timezone,
      day: "numeric",
      month: "long",
    }).format(date)

    // Format the time with am/pm
    const time = new Intl.DateTimeFormat("en-GB", {
      timeZone: timezone,
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }).format(date)

    // Convert time to lowercase for am/pm
    const formattedTime = time.toLowerCase().replace(/\s/g, "")

    // Check if the time is midnight (00:00) - if so, don't include time
    if (date.getHours() === 0 && date.getMinutes() === 0) {
      return `${dayOfWeek} ${dayMonth}`
    }

    // Return the formatted string
    return `${dayOfWeek} ${dayMonth} - ${formattedTime}`
  } catch (error) {
    console.error(`Error formatting schedule date/time ${dateString}:`, error)
    return dateString // Return original on error
  }
}

