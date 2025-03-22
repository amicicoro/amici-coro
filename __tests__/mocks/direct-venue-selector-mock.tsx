"use client"

import React from "react"
import { jest } from "@jest/globals"

// Create a direct mock for the VenueSelector component
jest.mock("@/components/venue-selector", () => {
  return {
    VenueSelector: ({ value, onChange }) => {
      // Immediately set a default venue ID when rendered
      React.useEffect(() => {
        if (!value) {
          onChange("1")
        }
      }, [value, onChange])

      return (
        <div data-testid="venue-selector-mock">
          <button type="button" onClick={() => onChange("1")}>
            {value ? `Selected venue: ${value}` : "Select a venue..."}
          </button>
        </div>
      )
    },
  }
})

