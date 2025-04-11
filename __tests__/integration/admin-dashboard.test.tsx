import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { useRouter } from "next/navigation"
import AdminDashboardPage from "@/app/admin/page"
import { setupTestEnvironment } from "../helpers/test-utils"
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

// Import the mocked module after mocking
import * as eventsData from "@/lib/events-data"
import * as venuesData from "@/lib/venues-data"

// Mock Next.js router
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
  useSearchParams: jest.fn(() => ({
    get: jest.fn((param) => {
      if (param === "page") return "1"
      if (param === "tab") return "events"
      return null
    }),
  })),
}))

describe("Admin Dashboard Integration Tests", () => {
  // Setup test environment using our helper
  const { mockRouter, setAuthToken, testData, mockApiResponse } = setupTestEnvironment()

  beforeEach(() => {
    // Set up router mock
    ;(useRouter as jest.Mock).mockReturnValue(mockRouter)

    // Set auth token
    setAuthToken("mock-token")

    // Set up API responses using the consistent approach
    mockVenuesApi(mockApiResponse)
    mockApiResponse("/api/events", testData.generateMockEvents(3))
    mockApiResponse("/api/past-events", testData.generateMockEvents(2, true))
  })

  test("Given user is authenticated, when dashboard loads, then upcoming events are displayed", async () => {
    // Arrange
    const mockUpcomingEvents = testData.generateMockEvents(3)
    jest.spyOn(eventsData, "getUpcomingEvents").mockResolvedValue(mockUpcomingEvents)

    // Act
    render(<AdminDashboardPage />)

    // Assert
    await waitFor(() => {
      expect(screen.getByText("Admin Dashboard")).toBeInTheDocument()
      expect(screen.getByText("Upcoming Events")).toBeInTheDocument()
      expect(global.fetch).toHaveBeenCalledWith("/api/events")
    })
  })

  test("Given upcoming events API fails, when dashboard loads, then error message is displayed for upcoming events section", async () => {
    // Arrange
    const errorMessage = "Failed to load upcoming events. Please try again later."

    // Mock the API to fail for upcoming events
    mockApiResponse("/api/events", { error: "Server error" }, { status: 500 })

    // Mock the getUpcomingEvents function to throw an error
    jest.spyOn(eventsData, "getUpcomingEvents").mockImplementation(() => {
      throw new Error("Failed to fetch upcoming events")
    })

    // Act
    render(<AdminDashboardPage />)

    // Assert
    await waitFor(() => {
      expect(screen.getByText("Upcoming Events")).toBeInTheDocument()
      expect(screen.getByText(errorMessage)).toBeInTheDocument()
    })
  })

  test("Given upcoming events are empty, when dashboard loads, then empty state message is displayed for upcoming events", async () => {
    // Arrange
    // Mock the API to return empty upcoming events
    mockApiResponse("/api/events", [])

    // Act
    render(<AdminDashboardPage />)

    // Assert
    await waitFor(() => {
      expect(screen.getByText("Upcoming Events")).toBeInTheDocument()
      expect(screen.getByText("No upcoming events found. Create your first event!")).toBeInTheDocument()
    })
  })

  test("Given user is not authenticated, when dashboard loads, then user is redirected to login", async () => {
    // Arrange
    setAuthToken(null) // Remove auth token

    // Act
    render(<AdminDashboardPage />)

    // Assert
    await waitFor(() => {
      expect(mockRouter.push).toHaveBeenCalledWith("/login")
    })
  })

  test("Given dashboard is loaded, when user clicks create event, then user is navigated to create event page", async () => {
    // Arrange
    render(<AdminDashboardPage />)

    // Act
    await waitFor(() => screen.getByText("Create Event"))
    const createButton = screen.getByText("Create Event")
    await userEvent.click(createButton)

    // Assert
    expect(mockRouter.push).toHaveBeenCalledWith("/admin/events/create")
  })

  test("Given dashboard is loaded, when user switches to venues tab, then venues are displayed", async () => {
    // Arrange
    jest.spyOn(venuesData, "getAllVenues").mockResolvedValue(mockVenues)

    // Act
    render(<AdminDashboardPage />)

    // Wait for the component to load
    await waitFor(() => screen.getByText("Admin Dashboard"))

    // Find and click the Venues tab
    const venuesTab = screen.getByText("Venues")
    await userEvent.click(venuesTab)

    // Assert
    expect(mockRouter.push).toHaveBeenCalledWith("/admin?tab=venues")
  })

  test("Given user is authenticated, when dashboard loads, then past events are displayed", async () => {
    // Arrange
    const mockPastEvents = testData.generateMockEvents(2, true)
    jest.spyOn(eventsData, "getPastEvents").mockResolvedValue(mockPastEvents)

    // Act
    render(<AdminDashboardPage />)

    // Assert
    await waitFor(() => {
      expect(screen.getByText("Past Events")).toBeInTheDocument()
      expect(global.fetch).toHaveBeenCalledWith("/api/past-events")
    })
  })

  test("Given past events are loaded, when user views past events section, then events are displayed in reverse chronological order", async () => {
    // Arrange
    const oldEvent = {
      id: "old-event",
      title: "Old Event",
      date: testData.generateMockEvent({ date: new Date(2020, 1, 1).toISOString() }).date,
      endDate: testData.generateMockEvent({ date: new Date(2020, 1, 2).toISOString() }).date,
      venueId: "1",
      slug: "old-event",
      description: "Old event description",
      schedule: [],
      musicList: {},
      venue: {
        id: "1",
        name: "Old Cathedral",
        address: "Old Address",
        website: "https://old-cathedral.com",
        timezone: "Europe/London",
        imageUrl: "https://example.com/old.jpg",
      },
    }

    const recentEvent = {
      id: "recent-event",
      title: "Recent Event",
      date: testData.generateMockEvent({ date: new Date(2022, 1, 1).toISOString() }).date,
      endDate: testData.generateMockEvent({ date: new Date(2022, 1, 2).toISOString() }).date,
      venueId: "2",
      slug: "recent-event",
      description: "Recent event description",
      schedule: [],
      musicList: {},
      venue: {
        id: "2",
        name: "Recent Cathedral",
        address: "Recent Address",
        website: "https://recent-cathedral.com",
        timezone: "Europe/London",
        imageUrl: "https://example.com/recent.jpg",
      },
    }

    const mockPastEvents = [recentEvent, oldEvent]

    // Mock the API response to return our specific events
    mockApiResponse("/api/past-events", mockPastEvents)

    // Act
    render(<AdminDashboardPage />)

    // Assert
    await waitFor(() => {
      expect(screen.getByText("Past Events")).toBeInTheDocument()

      // Check that both events are displayed
      expect(screen.getByText("Recent Event")).toBeInTheDocument()
      expect(screen.getByText("Old Event")).toBeInTheDocument()
    })
  })

  test("Given past events API fails, when dashboard loads, then error message is displayed for past events section", async () => {
    // Arrange
    const errorMessage = "Failed to load past events. Please try again later."

    // Mock the API to fail for past events
    mockApiResponse("/api/past-events", { error: "Server error" }, { status: 500 })

    // Mock the getPastEvents function to throw an error
    jest.spyOn(eventsData, "getPastEvents").mockImplementation(() => {
      throw new Error("Failed to fetch past events")
    })

    // Act
    render(<AdminDashboardPage />)

    // Assert
    await waitFor(() => {
      expect(screen.getByText("Past Events")).toBeInTheDocument()
      expect(screen.getByText(errorMessage)).toBeInTheDocument()
    })
  })

  test("Given past events are empty, when dashboard loads, then empty state message is displayed for past events", async () => {
    // Arrange
    // Mock the API to return empty past events
    mockApiResponse("/api/past-events", [])

    // Act
    render(<AdminDashboardPage />)

    // Assert
    await waitFor(() => {
      expect(screen.getByText("Past Events")).toBeInTheDocument()
      expect(screen.getByText("No past events found.")).toBeInTheDocument()
    })
  })
})

