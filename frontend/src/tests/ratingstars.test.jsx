import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import RatingStars from "../components/Reviews/RatingStars";

describe("RatingStars – rendering", () => {
  it("renders without crashing", () => {
    render(<RatingStars value={3} />);
    expect(screen.getByRole("generic")).toBeInTheDocument();
  });

  it("has correct aria-label for a whole number rating", () => {
    render(<RatingStars value={4} />);
    expect(screen.getByLabelText("Rating 4 out of 5")).toBeInTheDocument();
  });

  it("has correct aria-label for a decimal rating", () => {
    render(<RatingStars value={3.7} />);
    expect(screen.getByLabelText("Rating 3.7 out of 5")).toBeInTheDocument();
  });

  it("displays the numeric rating value", () => {
    render(<RatingStars value={4} />);
    expect(screen.getByText(/\(4\)/)).toBeInTheDocument();
  });

  it("defaults to 0 when no value is provided", () => {
    render(<RatingStars />);
    expect(screen.getByLabelText("Rating 0 out of 5")).toBeInTheDocument();
  });

  it("defaults to 0 when value is null", () => {
    render(<RatingStars value={null} />);
    expect(screen.getByLabelText("Rating 0 out of 5")).toBeInTheDocument();
  });
});

describe("RatingStars – star counts", () => {
  it("shows 5 full stars for a rating of 5", () => {
    render(<RatingStars value={5} />);
    const label = screen.getByLabelText(/Rating 5 out of 5/);
    expect(label.textContent).toContain("★ ★ ★ ★ ★");
  });

  it("shows 0 full stars for a rating of 0", () => {
    render(<RatingStars value={0} />);
    const label = screen.getByLabelText(/Rating 0 out of 5/);
    expect(label.textContent).not.toContain("★");
  });

  it("shows 3 full stars and 2 empty for a rating of 3", () => {
    render(<RatingStars value={3} />);
    const label = screen.getByLabelText(/Rating 3 out of 5/);
    const text = label.textContent;
    const fullStars = (text.match(/★/g) || []).length;
    const emptyStars = (text.match(/☆/g) || []).length;
    expect(fullStars).toBe(3);
    expect(emptyStars).toBe(2);
  });

  it("shows a half star for a rating of 3.5", () => {
    render(<RatingStars value={3.5} />);
    const label = screen.getByLabelText(/Rating 3.5 out of 5/);
    expect(label.textContent).toContain("⯪");
  });

  it("does not show a half star for a whole number rating", () => {
    render(<RatingStars value={2} />);
    const label = screen.getByLabelText(/Rating 2 out of 5/);
    expect(label.textContent).not.toContain("⯪");
  });
});

describe("RatingStars – edge cases", () => {
  it("handles string value gracefully", () => {
    render(<RatingStars value="3" />);
    expect(screen.getByLabelText("Rating 3 out of 5")).toBeInTheDocument();
  });

  it("rounds display value to one decimal", () => {
    render(<RatingStars value={3.123} />);
    expect(screen.getByLabelText("Rating 3.1 out of 5")).toBeInTheDocument();
  });

  it("has correct title attribute", () => {
    render(<RatingStars value={4} />);
    expect(screen.getByTitle("4 / 5")).toBeInTheDocument();
  });
});