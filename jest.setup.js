import "@testing-library/jest-dom"
import { jest } from "@jest/globals"
import { beforeEach } from "@jest/globals"

// Mock IntersectionObserver
class MockIntersectionObserver {
  constructor(callback) {
    this.callback = callback
  }
  observe() {
    return null
  }
  unobserve() {
    return null
  }
  disconnect() {
    return null
  }
}

global.IntersectionObserver = MockIntersectionObserver

// Mock ResizeObserver
class MockResizeObserver {
  observe() {
    return null
  }
  unobserve() {
    return null
  }
  disconnect() {
    return null
  }
}

global.ResizeObserver = MockResizeObserver

// Mock window.matchMedia
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
})

// Mock @vercel/blob
jest.mock("@vercel/blob", () => ({
  put: jest.fn().mockResolvedValue({
    url: "https://example.com/blob",
    pathname: "data/events/test-event/event.json",
  }),
  list: jest.fn().mockResolvedValue({
    blobs: [
      {
        url: "https://example.com/blob",
        pathname: "data/events/test-event/event.json",
      },
    ],
  }),
}))

// Add this at the end of the file to ensure mocks are properly reset between tests
beforeEach(() => {
  jest.resetModules()
  jest.clearAllMocks()
})

