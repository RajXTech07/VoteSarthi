import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import HomePage from "../app/page";
import TimelinePage from "../app/timeline/page";
import { api } from "../lib/api";

// 1. Mock the API utility
jest.mock("../lib/api", () => ({
  api: {
    getTimeline: jest.fn(),
    getPersonalTimeline: jest.fn(),
    getContext: jest.fn(),
  },
}));

// 2. Mock Next.js Navigation
jest.mock("next/navigation", () => ({
  usePathname: () => "/",
  useRouter: () => ({ push: jest.fn() }),
}));

// 3. Mock data
const mockTimelineData = {
  election_name: "General Election 2024",
  total_phases: 7,
  result_date: "June 4, 2024",
  current_phase_index: 0,
  phases: [
    {
      phase: 1,
      date: "April 19",
      seats: 102,
      states: ["Tamil Nadu"],
      status: "active",
      user_action: "Vote now!",
    },
  ],
  next_action: "Check your polling booth",
  next_action_detail: "Details here",
  next_action_icon: "📍",
};

describe("VoteSarthi Frontend Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // --- Home Page Tests ---
  describe("HomePage", () => {
    it("renders the hero section correctly", () => {
      api.getContext.mockResolvedValue({ user_status: "unknown" });
      render(<HomePage />);
      expect(screen.getByText(/Understand Elections/i)).toBeInTheDocument();
      expect(screen.getByText(/Your Smart Election Guide/i)).toBeInTheDocument();
    });

    it("displays the correct stats", () => {
      render(<HomePage />);
      expect(screen.getByText("96.8 Cr")).toBeInTheDocument();
      expect(screen.getByText("543")).toBeInTheDocument();
    });
  });

  // --- Timeline Page Tests ---
  describe("TimelinePage", () => {
    it("renders loading state then data", async () => {
      api.getTimeline.mockResolvedValue(mockTimelineData);

      render(<TimelinePage />);

      // Check loading
      expect(screen.getByText(/Loading timeline.../i)).toBeInTheDocument();

      // Check success state
      await waitFor(() => {
        expect(screen.getByText("General Election 2024")).toBeInTheDocument();
      });
      expect(screen.getByText("Phase 1")).toBeInTheDocument();
    });

    it("handles personalization form submission", async () => {
      api.getTimeline.mockResolvedValue(mockTimelineData);
      api.getPersonalTimeline.mockResolvedValue({
        ...mockTimelineData,
        election_name: "Personalized View",
      });

      render(<TimelinePage />);

      await waitFor(() => {
        expect(screen.getByText("General Election 2024")).toBeInTheDocument();
      });

      // Fill form
      fireEvent.change(screen.getByPlaceholderText(/e.g., 25/i), { target: { value: "25" } });
      fireEvent.click(screen.getByText(/✅ Yes/i));
      
      const submitBtn = screen.getByText(/Get Personalized Timeline/i);
      fireEvent.click(submitBtn);

      // Check API call and updated view
      await waitFor(() => {
        expect(screen.getByText("Personalized View")).toBeInTheDocument();
      });
      expect(api.getPersonalTimeline).toHaveBeenCalledWith(expect.objectContaining({
        age: 25,
        has_voter_id: true
      }));
    });

    it("handles API errors gracefully", async () => {
      api.getTimeline.mockRejectedValue(new Error("Network Error"));

      render(<TimelinePage />);

      await waitFor(() => {
        expect(screen.getByText(/⚠️ Network Error/i)).toBeInTheDocument();
      });
    });
  });
});
