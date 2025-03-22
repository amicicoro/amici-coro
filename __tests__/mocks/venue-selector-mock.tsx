"use client"
import { jest } from "@jest/globals"

// Mock the VenueSelector component
jest.mock("@/components/venue-selector", () => {
  return {
    VenueSelector: ({ value, onChange }) => {
      return (
        <div>
          <button
            role="combobox"
            aria-label="venue"
            onClick={() => {
              // Show dropdown content when clicked
              document.dispatchEvent(new Event("show-venue-dropdown"))
            }}
          >
            {value ? `Selected venue: ${value}` : "Select a venue..."}
          </button>
          <div data-testid="venue-dropdown">
            <div>Select a venue</div>
            <div data-testid="venue-option-1" onClick={() => onChange("1")}>
              Venue 1
            </div>
            <div data-testid="venue-option-2" onClick={() => onChange("2")}>
              Venue 2
            </div>
          </div>
        </div>
      )
    },
  }
})

