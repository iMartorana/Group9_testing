import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import ReviewList from "../components/Reviews/ReviewList";

const mockReviews = [
  {
    id: 1,
    client_email: "client@example.com",
    rating: 5,
    review_text: "Excellent work, highly recommend!",
    created_at: "2026-01-15T10:00:00Z",
  },
  {
    id: 2,
    client_email: "another@example.com",
    rating: 3,
    review_text: "Decent, but could be better.",
    created_at: "2026-02-01T12:00:00Z",
  },
];

describe("ReviewList – empty state", () => {
  it("shows 'No reviews yet' when reviews is empty", () => {
    render(<ReviewList reviews={[]} />);
    expect(screen.getByText(/no reviews yet/i)).toBeInTheDocument();
  });

  it("shows 'No reviews yet' when reviews prop is omitted", () => {
    render(<ReviewList />);
    expect(screen.getByText(/no reviews yet/i)).toBeInTheDocument();
  });
});

describe("ReviewList – with reviews", () => {
  it("renders the correct number of review cards", () => {
    render(<ReviewList reviews={mockReviews} />);
    // Each review shows the client email
    expect(screen.getByText("client@example.com")).toBeInTheDocument();
    expect(screen.getByText("another@example.com")).toBeInTheDocument();
  });

  it("displays the review text for each review", () => {
    render(<ReviewList reviews={mockReviews} />);
    expect(screen.getByText("Excellent work, highly recommend!")).toBeInTheDocument();
    expect(screen.getByText("Decent, but could be better.")).toBeInTheDocument();
  });

  it("renders a RatingStars component for each review", () => {
    render(<ReviewList reviews={mockReviews} />);
    const ratingLabels = screen.getAllByLabelText(/rating \d+ out of 5/i);
    expect(ratingLabels).toHaveLength(mockReviews.length);
  });

  it("shows the correct rating value for each review", () => {
    render(<ReviewList reviews={mockReviews} />);
    expect(screen.getByLabelText("Rating 5 out of 5")).toBeInTheDocument();
    expect(screen.getByLabelText("Rating 3 out of 5")).toBeInTheDocument();
  });

  it("does not show the empty state when reviews exist", () => {
    render(<ReviewList reviews={mockReviews} />);
    expect(screen.queryByText(/no reviews yet/i)).not.toBeInTheDocument();
  });
});

describe("ReviewList – single review", () => {
  it("renders exactly one review card", () => {
    const singleReview = [mockReviews[0]];
    render(<ReviewList reviews={singleReview} />);
    expect(screen.getByText("client@example.com")).toBeInTheDocument();
    expect(screen.queryByText("another@example.com")).not.toBeInTheDocument();
  });

  it("renders review with no text without crashing", () => {
    const noText = [{ id: 3, client_email: "x@y.com", rating: 4, review_text: null, created_at: "2026-01-01T00:00:00Z" }];
    render(<ReviewList reviews={noText} />);
    expect(screen.getByText("x@y.com")).toBeInTheDocument();
  });
});