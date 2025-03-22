import { screen } from "@testing-library/react"

export function debugVenueSelector() {
  console.log("=== DEBUG VENUE SELECTOR ===")

  // Log all elements with text containing "venue" (case insensitive)
  const venueElements = screen.queryAllByText(/venue/i)
  console.log(`Found ${venueElements.length} elements with text containing "venue":`)
  venueElements.forEach((el, i) => {
    console.log(`${i + 1}. ${el.tagName} - ${el.textContent} - ${el.outerHTML.slice(0, 100)}...`)
  })

  // Log all button elements
  const buttons = screen.queryAllByRole("button")
  console.log(`Found ${buttons.length} buttons:`)
  buttons.forEach((button, i) => {
    console.log(`${i + 1}. ${button.textContent} - ${button.outerHTML.slice(0, 100)}...`)
  })

  // Log all elements with data-testid containing "venue"
  const venueTestIds = document.querySelectorAll('[data-testid*="venue"]')
  console.log(`Found ${venueTestIds.length} elements with data-testid containing "venue":`)
  venueTestIds.forEach((el, i) => {
    console.log(`${i + 1}. ${el.tagName} - ${el.textContent} - ${el.outerHTML.slice(0, 100)}...`)
  })

  console.log("=== END DEBUG VENUE SELECTOR ===")
}

