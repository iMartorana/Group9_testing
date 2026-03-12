import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";

// Mock supabase before any imports
const { mockSupabase } = vi.hoisted(() => {
  const mockSelect = vi.fn();
  const mockEq = vi.fn();
  const mockFrom = vi.fn();
  const mockInsert = vi.fn();

  // Chain pattern: from().select().eq()
  mockEq.mockResolvedValue({ data: [], error: null });
  mockSelect.mockReturnValue({ eq: mockEq });
  mockInsert.mockResolvedValue({ data: null, error: null });
  mockFrom.mockReturnValue({ select: mockSelect, insert: mockInsert });

  const mockSupabase = { from: mockFrom };
  return { mockSupabase };
});

vi.mock("../supabaseconfig", () => ({
  supabase: mockSupabase,
}));

import JobListings from "../components/Jobs/JobListings";

const sampleListings = [
  {
    listing_id: 1,
    title: "Plumbing Help Needed",
    description: "Fix a leaky pipe under the sink.",
    location_text: "Milwaukee",
    pricing_type: "hourly",
    price_amount: 30,
    created_at: "2026-01-01T00:00:00Z",
    status: "active",
    users: { first_name: "Jane", last_name: "Doe" },
    listingsskills: [{ skills: { skill_id: 10, name: "Plumbing" } }],
  },
  {
    listing_id: 2,
    title: "Electrical Wiring",
    description: "Help with wiring in the garage.",
    location_text: "Wauwatosa",
    pricing_type: "fixed",
    price_amount: 150,
    created_at: "2026-02-01T00:00:00Z",
    status: "active",
    users: { first_name: "Bob", last_name: "Smith" },
    listingsskills: [{ skills: { skill_id: 11, name: "Electrical" } }],
  },
];

const sampleSkills = [
  { skill_id: 10, name: "Plumbing" },
  { skill_id: 11, name: "Electrical" },
];

beforeEach(() => {
  vi.clearAllMocks();

  // Reset default responses
  mockSupabase.from.mockImplementation((table) => {
    if (table === "listings") {
      return {
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ data: sampleListings, error: null }),
        }),
      };
    }
    if (table === "skills") {
      return {
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ data: sampleSkills, error: null }),
        }),
      };
    }
    if (table === "bookingrequests") {
      return {
        insert: vi.fn().mockResolvedValue({ data: null, error: null }),
      };
    }
    return { select: vi.fn().mockReturnValue({ eq: vi.fn().mockResolvedValue({ data: [], error: null }) }) };
  });
});

describe("JobListings – loading state", () => {
  it("shows a loading indicator while fetching", () => {
    // Don't resolve — leave it hanging
    mockSupabase.from.mockImplementation(() => ({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue(new Promise(() => {})),
      }),
    }));

    render(<JobListings />);
    expect(screen.getByText(/loading listings/i)).toBeInTheDocument();
  });
});

describe("JobListings – rendered listings", () => {
  it("renders all job listing titles", async () => {
    render(<JobListings />);
    await waitFor(() => {
      expect(screen.getByText("Plumbing Help Needed")).toBeInTheDocument();
      expect(screen.getByText("Electrical Wiring")).toBeInTheDocument();
    });
  });

  it("displays listing descriptions", async () => {
    render(<JobListings />);
    await waitFor(() => {
      expect(screen.getByText(/fix a leaky pipe/i)).toBeInTheDocument();
    });
  });

  it("displays poster's name for each listing", async () => {
    render(<JobListings />);
    await waitFor(() => {
      expect(screen.getByText(/jane doe/i)).toBeInTheDocument();
      expect(screen.getByText(/bob smith/i)).toBeInTheDocument();
    });
  });

  it("renders skill badges for each listing", async () => {
    render(<JobListings />);
    await waitFor(() => {
      expect(screen.getByText("Plumbing")).toBeInTheDocument();
      expect(screen.getByText("Electrical")).toBeInTheDocument();
    });
  });

  it("renders an Apply button for each listing", async () => {
    render(<JobListings />);
    await waitFor(() => {
      const applyButtons = screen.getAllByRole("button", { name: /apply/i });
      expect(applyButtons).toHaveLength(2);
    });
  });

  it("shows empty state when no listings are returned", async () => {
    mockSupabase.from.mockImplementation((table) => ({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ data: [], error: null }),
      }),
    }));

    render(<JobListings />);
    await waitFor(() => {
      expect(screen.getByText(/no jobs match your filters/i)).toBeInTheDocument();
    });
  });
});

describe("JobListings – filters", () => {
  it("renders the Filter Jobs card", async () => {
    render(<JobListings />);
    await waitFor(() => {
      expect(screen.getByText(/filter jobs/i)).toBeInTheDocument();
    });
  });

  it("renders the Apply Filters and Clear buttons", async () => {
    render(<JobListings />);
    await waitFor(() => {
      expect(screen.getByRole("button", { name: /apply filters/i })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /clear/i })).toBeInTheDocument();
    });
  });

  it("populates the skill dropdown from fetched skills", async () => {
    render(<JobListings />);
    await waitFor(() => {
      const options = screen.getAllByRole("option", { name: /plumbing/i });
      expect(options.length).toBeGreaterThanOrEqual(1);
    });
  });

  it("filters listings by location when Apply Filters is clicked", async () => {
    render(<JobListings />);

    await waitFor(() => screen.getByText("Plumbing Help Needed"));

    const locationInput = screen.getByPlaceholderText(/e\.g\. milwaukee/i);
    fireEvent.change(locationInput, { target: { value: "Wauwatosa" } });
    fireEvent.click(screen.getByRole("button", { name: /apply filters/i }));

    await waitFor(() => {
      expect(screen.queryByText("Plumbing Help Needed")).not.toBeInTheDocument();
      expect(screen.getByText("Electrical Wiring")).toBeInTheDocument();
    });
  });

  it("clears filters and shows all listings when Clear is clicked", async () => {
    render(<JobListings />);

    await waitFor(() => screen.getByText("Plumbing Help Needed"));

    // Apply a location filter first
    const locationInput = screen.getByPlaceholderText(/e\.g\. milwaukee/i);
    fireEvent.change(locationInput, { target: { value: "Wauwatosa" } });
    fireEvent.click(screen.getByRole("button", { name: /apply filters/i }));

    await waitFor(() => {
      expect(screen.queryByText("Plumbing Help Needed")).not.toBeInTheDocument();
    });

    // Now clear
    fireEvent.click(screen.getByRole("button", { name: /clear/i }));

    await waitFor(() => {
      expect(screen.getByText("Plumbing Help Needed")).toBeInTheDocument();
      expect(screen.getByText("Electrical Wiring")).toBeInTheDocument();
    });
  });

  it("filters by minimum pay", async () => {
    render(<JobListings />);
    await waitFor(() => screen.getByText("Plumbing Help Needed"));

    const minPayInput = screen.getByPlaceholderText(/e\.g\. 20/i);
    fireEvent.change(minPayInput, { target: { value: "100" } });
    fireEvent.click(screen.getByRole("button", { name: /apply filters/i }));

    await waitFor(() => {
      // Plumbing is $30 (below 100), Electrical is $150 (above 100)
      expect(screen.queryByText("Plumbing Help Needed")).not.toBeInTheDocument();
      expect(screen.getByText("Electrical Wiring")).toBeInTheDocument();
    });
  });

  it("filter does not apply until Apply Filters is clicked", async () => {
    render(<JobListings />);
    await waitFor(() => screen.getByText("Plumbing Help Needed"));

    // Type in filter but don't click Apply
    const locationInput = screen.getByPlaceholderText(/e\.g\. milwaukee/i);
    fireEvent.change(locationInput, { target: { value: "Wauwatosa" } });

    // Both listings should still be visible
    expect(screen.getByText("Plumbing Help Needed")).toBeInTheDocument();
    expect(screen.getByText("Electrical Wiring")).toBeInTheDocument();
  });
});