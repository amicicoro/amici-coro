import { render, screen, waitFor, fireEvent, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { useRouter } from "next/navigation"
import CreateEventForm from "@/app/admin/events/create/create-event-form"
import { setupTestEnvironment } from "../helpers/test-utils"
import { debugVenueSelector } from "../helpers/debug-utils"
import { mockVenuesApi, mockVenues } from "../mocks/venues-data-mock"

// Mock the entire module instead of individual functions
jest.mock("@/lib/events-data", () => ({
  getUpcomingEvents: jest.fn(),
  getPastEvents: jest.fn(),
  getAllEvents: jest.fn(),
  getEventById: jest.fn(),
  createEvent: jest.fn(),
  updateEvent: jest.fn(),
  getEventWithVenue: jest.fn(),
}))

// Mock Next.js router
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}))

// Mock Vercel Blob
jest.mock("@vercel/blob", () => ({
  put: jest.fn(),
  list: jest.fn(),
}))

describe("Event Creation Integration Tests", () => {
  // Setup test environment using our helper
  const { mockRouter, testData, mockApiResponse, mockApiWithBlobStorage, putMock } = setupTestEnvironment()

  beforeEach(() => {
    // Set up router mock
    ;(useRouter as jest.Mock).mockReturnValue(mockRouter)

    // Set up API responses with our consistent mock venues
    mockVenuesApi(mockApiResponse)
  })

  test("Given form is submitted, when blob storage is called, then correct data and headers are used", async () => {
    // Arrange
    mockApiWithBlobStorage("/api/events", {
      method: "POST",
      blobPath: "data/events/test-event/event.json",
    })

    // Act
    render(<CreateEventForm />)

    // Wait for the form to load
    await waitFor(() => screen.getByText("Event Details"))

    // Fill out minimal required fields
    await userEvent.type(screen.getByLabelText(/^Title \*/i), "Test Event")

    // Set dates
    const startDateInput = screen.getByLabelText(/Start Date/i)
    const endDateInput = screen.getByLabelText(/End Date/i)
    fireEvent.change(startDateInput, { target: { value: "2023-12-01" } })
    fireEvent.change(endDateInput, { target: { value: "2023-12-03" } })

    // Debug the venue selector to understand what's available
    debugVenueSelector()

    // Try to find the venue selector by data-testid
    let venueTrigger
    try {
      venueTrigger = screen.getByTestId("venue-selector-trigger")
    } catch (e) {
      // If not found by data-testid, fall back to finding by text content
      const venueButtons = screen.getAllByRole("button")
      venueTrigger = venueButtons.find(
        (button) => button.textContent?.includes("Select a venue") || button.textContent?.includes("venue"),
      )
    }

    if (!venueTrigger) {
      throw new Error("Venue selector trigger not found")
    }

    // Click the venue trigger to open the dropdown
    await userEvent.click(venueTrigger)

    // Debug again after clicking to see what's in the dropdown
    debugVenueSelector()

    // Try to find venue options by data-testid
    let venueOption
    try {
      // Try to find the options container
      const optionsContainer = screen.getByTestId("venue-options-container")
      // Find the first venue option within the container
      venueOption = within(optionsContainer).getByTestId(`venue-option-1`)
    } catch (e) {
      // Fall back to finding by text content
      const venueElements = screen.getAllByText(new RegExp(mockVenues[0].name, "i"))
      if (venueElements.length > 0) {
        venueOption = venueElements[0]
      }
    }

    if (!venueOption) {
      throw new Error(`Venue option not found`)
    }

    // Click the venue option
    await userEvent.click(venueOption)

    // Set slug
    await userEvent.type(screen.getByLabelText(/Slug/i), "test-event")

    // Submit the form
    const submitButton = screen.getByRole("button", { name: /Create Event/i })
    await userEvent.click(submitButton)

    // Assert with a longer timeout
    await waitFor(
      () => {
        // Check that blob.put was called with the correct parameters
        expect(putMock).toHaveBeenCalledWith(
          "data/events/test-event/event.json",
          expect.any(String),
          expect.objectContaining({
            contentType: "application/json",
            access: "public", // Verify the public access header
          }),
        )
      },
      { timeout: 5000 },
    )

    // Verify the content of the blob if the call was made
    if (putMock.mock.calls.length > 0) {
      const blobContent = putMock.mock.calls[0][1]
      const parsedContent = JSON.parse(blobContent)
      expect(parsedContent).toMatchObject({
        title: "Test Event",
        slug: "test-event",
        date: "2023-12-01",
        endDate: "2023-12-03",
        venueId: "1", // This should now be set correctly
      })
    }
  })
})

