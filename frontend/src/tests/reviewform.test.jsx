import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";

// Mock upsertReview before importing the component
const { mockUpsertReview } = vi.hoisted(() => {
  const mockUpsertReview = vi.fn();
  return { mockUpsertReview };
});

vi.mock("../api/supabaseapi.jsx", () => ({
  upsertReview: mockUpsertReview,
}));

import ReviewForm from "../components/Reviews/ReviewForm";

const defaultProps = {
  studentEmail: "student@uwm.edu",
  clientEmail: "client@example.com",
  onSubmitted: vi.fn(),
};

beforeEach(() => {
  vi.clearAllMocks();
  mockUpsertReview.mockResolvedValue({ data: { id: 1 }, error: null });
});

describe("ReviewForm – rendering", () => {
  it("renders the form heading", () => {
    render(<ReviewForm {...defaultProps} />);
    expect(screen.getByText(/submit a review/i)).toBeInTheDocument();
  });

  it("renders the Rating dropdown", () => {
    render(<ReviewForm {...defaultProps} />);
    expect(screen.getByLabelText(/rating/i)).toBeInTheDocument();
  });

  it("renders the review textarea", () => {
    render(<ReviewForm {...defaultProps} />);
    expect(screen.getByPlaceholderText(/write your review here/i)).toBeInTheDocument();
  });

  it("renders the Submit Review button", () => {
    render(<ReviewForm {...defaultProps} />);
    expect(screen.getByRole("button", { name: /submit review/i })).toBeInTheDocument();
  });

  it("defaults to a rating of 5", () => {
    render(<ReviewForm {...defaultProps} />);
    const select = screen.getByLabelText(/rating/i);
    expect(select.value).toBe("5");
  });
});

describe("ReviewForm – validation", () => {
  it("shows error when studentEmail is missing", async () => {
    render(<ReviewForm clientEmail="client@example.com" />);
    fireEvent.click(screen.getByRole("button", { name: /submit review/i }));
    await waitFor(() => {
      expect(screen.getByText(/missing student email/i)).toBeInTheDocument();
    });
  });

  it("shows error when clientEmail is missing", async () => {
    render(<ReviewForm studentEmail="student@uwm.edu" />);
    fireEvent.click(screen.getByRole("button", { name: /submit review/i }));
    await waitFor(() => {
      expect(screen.getByText(/missing client email/i)).toBeInTheDocument();
    });
  });

  it("does not call upsertReview when validation fails", async () => {
    render(<ReviewForm studentEmail="student@uwm.edu" />);
    fireEvent.click(screen.getByRole("button", { name: /submit review/i }));
    await waitFor(() => {
      expect(mockUpsertReview).not.toHaveBeenCalled();
    });
  });
});

describe("ReviewForm – successful submission", () => {
  it("calls upsertReview with correct arguments", async () => {
    render(<ReviewForm {...defaultProps} />);

    fireEvent.change(screen.getByLabelText(/rating/i), { target: { value: "4" } });
    fireEvent.change(screen.getByPlaceholderText(/write your review here/i), {
      target: { value: "Great student!" },
    });
    fireEvent.click(screen.getByRole("button", { name: /submit review/i }));

    await waitFor(() => {
      expect(mockUpsertReview).toHaveBeenCalledWith({
        studentEmail: "student@uwm.edu",
        clientEmail: "client@example.com",
        rating: 4,
        reviewText: "Great student!",
      });
    });
  });

  it("shows success message after submission", async () => {
    render(<ReviewForm {...defaultProps} />);
    fireEvent.click(screen.getByRole("button", { name: /submit review/i }));
    await waitFor(() => {
      expect(screen.getByText(/review saved/i)).toBeInTheDocument();
    });
  });

  it("clears the review text after successful submission", async () => {
    render(<ReviewForm {...defaultProps} />);
    const textarea = screen.getByPlaceholderText(/write your review here/i);
    fireEvent.change(textarea, { target: { value: "Nice work!" } });
    fireEvent.click(screen.getByRole("button", { name: /submit review/i }));
    await waitFor(() => {
      expect(textarea.value).toBe("");
    });
  });

  it("calls onSubmitted callback after successful submission", async () => {
    const onSubmitted = vi.fn();
    render(<ReviewForm {...defaultProps} onSubmitted={onSubmitted} />);
    fireEvent.click(screen.getByRole("button", { name: /submit review/i }));
    await waitFor(() => {
      expect(onSubmitted).toHaveBeenCalledTimes(1);
    });
  });
});

describe("ReviewForm – API error handling", () => {
  it("shows the API error message on failure", async () => {
    mockUpsertReview.mockResolvedValue({
      data: null,
      error: { message: "Database write failed" },
    });

    render(<ReviewForm {...defaultProps} />);
    fireEvent.click(screen.getByRole("button", { name: /submit review/i }));

    await waitFor(() => {
      expect(screen.getByText("Database write failed")).toBeInTheDocument();
    });
  });

  it("shows fallback error message when API error has no message", async () => {
    mockUpsertReview.mockResolvedValue({ data: null, error: {} });

    render(<ReviewForm {...defaultProps} />);
    fireEvent.click(screen.getByRole("button", { name: /submit review/i }));

    await waitFor(() => {
      expect(screen.getByText(/failed to submit review/i)).toBeInTheDocument();
    });
  });

  it("does not call onSubmitted on failure", async () => {
    const onSubmitted = vi.fn();
    mockUpsertReview.mockResolvedValue({ data: null, error: { message: "Error" } });

    render(<ReviewForm {...defaultProps} onSubmitted={onSubmitted} />);
    fireEvent.click(screen.getByRole("button", { name: /submit review/i }));

    await waitFor(() => {
      expect(onSubmitted).not.toHaveBeenCalled();
    });
  });
});

describe("ReviewForm – loading state", () => {
  it("disables the button while saving", async () => {
    // Delay resolution so we can check the loading state
    mockUpsertReview.mockImplementation(() => new Promise(() => {}));

    render(<ReviewForm {...defaultProps} />);
    fireEvent.click(screen.getByRole("button", { name: /submit review/i }));

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /saving/i })).toBeDisabled();
    });
  });
});