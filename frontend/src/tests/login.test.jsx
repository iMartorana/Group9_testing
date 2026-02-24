import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

// Create mocks BEFORE any module imports using vi.hoisted
const { mockLoginWithRedirect, mockUseAuth0 } = vi.hoisted(() => {
  const mockLoginWithRedirect = vi.fn();
  const mockUseAuth0 = vi.fn(() => ({ loginWithRedirect: mockLoginWithRedirect }));
  return { mockLoginWithRedirect, mockUseAuth0 };
});

vi.mock("@auth0/auth0-react", () => ({
  useAuth0: mockUseAuth0,
  Auth0Provider: ({ children }) => children,
}));

import Login from "../pages/login";

beforeEach(() => {
  vi.clearAllMocks();
  mockUseAuth0.mockReturnValue({ loginWithRedirect: mockLoginWithRedirect });
});

// Rendering
describe("Login – rendering", () => {
  it("renders the app title", () => {
    render(<Login />);
    expect(
      screen.getByRole("heading", { name: /uwm tradeskill app/i })
    ).toBeInTheDocument();
  });

  it("renders the subtitle / call-to-action text", () => {
    render(<Login />);
    expect(
      screen.getByText(/sign in or create an account to continue/i)
    ).toBeInTheDocument();
  });

  it("renders a Login button", () => {
    render(<Login />);
    expect(
      screen.getByRole("button", { name: /login/i })
    ).toBeInTheDocument();
  });

  it("renders a Sign Up button", () => {
    render(<Login />);
    expect(
      screen.getByRole("button", { name: /sign up/i })
    ).toBeInTheDocument();
  });
});

// Login button
describe("Login – Login button", () => {
  it("calls loginWithRedirect with no extra params when Login is clicked", () => {
    render(<Login />);
    fireEvent.click(screen.getByRole("button", { name: /login/i }));

    expect(mockLoginWithRedirect).toHaveBeenCalledTimes(1);
    expect(mockLoginWithRedirect).toHaveBeenCalledWith();
  });

  it("does not call loginWithRedirect before the button is clicked", () => {
    render(<Login />);
    expect(mockLoginWithRedirect).not.toHaveBeenCalled();
  });
});

// Sign Up button
describe("Login – Sign Up button", () => {
  it("calls loginWithRedirect with screen_hint: 'signup' when Sign Up is clicked", () => {
    render(<Login />);
    fireEvent.click(screen.getByRole("button", { name: /sign up/i }));

    expect(mockLoginWithRedirect).toHaveBeenCalledTimes(1);
    expect(mockLoginWithRedirect).toHaveBeenCalledWith({
      authorizationParams: { screen_hint: "signup" },
    });
  });
});

// Multiple interactions
describe("Login – multiple interactions", () => {
  it("calls loginWithRedirect twice when both buttons are clicked", () => {
    render(<Login />);
    fireEvent.click(screen.getByRole("button", { name: /login/i }));
    fireEvent.click(screen.getByRole("button", { name: /sign up/i }));

    expect(mockLoginWithRedirect).toHaveBeenCalledTimes(2);
  });

  it("uses the correct screen_hint only on the Sign Up click", () => {
    render(<Login />);
    fireEvent.click(screen.getByRole("button", { name: /login/i }));
    fireEvent.click(screen.getByRole("button", { name: /sign up/i }));

    const [firstCall, secondCall] = mockLoginWithRedirect.mock.calls;
    expect(firstCall).toHaveLength(0); // login: no args
    expect(secondCall[0]).toEqual({
      authorizationParams: { screen_hint: "signup" },
    });
  });
});

// CSS classes (visual correctness)
describe("Login – CSS classes", () => {
  it("Login button has btn-primary class", () => {
    render(<Login />);
    const loginBtn = screen.getByRole("button", { name: /login/i });
    expect(loginBtn).toHaveClass("btn-primary");
  });

  it("Sign Up button has btn-outline-primary class", () => {
    render(<Login />);
    const signUpBtn = screen.getByRole("button", { name: /sign up/i });
    expect(signUpBtn).toHaveClass("btn-outline-primary");
  });
});