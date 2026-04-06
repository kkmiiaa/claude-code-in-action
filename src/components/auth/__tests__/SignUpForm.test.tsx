import { test, expect, vi, afterEach, beforeEach } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SignUpForm } from "../SignUpForm";

const mockSignUp = vi.fn();
let mockIsLoading = false;

vi.mock("@/hooks/use-auth", () => ({
  useAuth: () => ({
    signUp: mockSignUp,
    get isLoading() {
      return mockIsLoading;
    },
  }),
}));

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
  mockIsLoading = false;
});

beforeEach(() => {
  mockSignUp.mockResolvedValue({ success: true });
});

test("renders email, password, and confirm password fields", () => {
  render(<SignUpForm />);

  expect(screen.getByLabelText("Email")).toBeDefined();
  expect(screen.getByLabelText("Password")).toBeDefined();
  expect(screen.getByLabelText("Confirm Password")).toBeDefined();
});

test("shows password length hint text", () => {
  render(<SignUpForm />);

  expect(screen.getByText("Must be at least 8 characters long")).toBeDefined();
});

test("shows Passwords do not match error when passwords differ", async () => {
  render(<SignUpForm />);

  await userEvent.type(screen.getByLabelText("Password"), "password1");
  await userEvent.type(screen.getByLabelText("Confirm Password"), "password2");
  fireEvent.submit(screen.getByRole("button", { name: "Sign Up" }).closest("form")!);

  const error = await screen.findByText("Passwords do not match");
  expect(error).toBeDefined();
  expect(mockSignUp).not.toHaveBeenCalled();
});

test("shows Creating account... and disables inputs when isLoading is true", () => {
  mockIsLoading = true;
  render(<SignUpForm />);

  expect(screen.getByRole("button", { name: "Creating account..." })).toBeDefined();
  expect(screen.getByLabelText("Email")).toHaveProperty("disabled", true);
  expect(screen.getByLabelText("Password")).toHaveProperty("disabled", true);
  expect(screen.getByLabelText("Confirm Password")).toHaveProperty("disabled", true);
});

test("calls signUp with email and password when passwords match", async () => {
  render(<SignUpForm />);

  await userEvent.type(screen.getByLabelText("Email"), "user@example.com");
  await userEvent.type(screen.getByLabelText("Password"), "securepass");
  await userEvent.type(screen.getByLabelText("Confirm Password"), "securepass");
  fireEvent.submit(screen.getByRole("button", { name: "Sign Up" }).closest("form")!);

  expect(mockSignUp).toHaveBeenCalledWith("user@example.com", "securepass");
});

test("displays error message when signUp fails", async () => {
  mockSignUp.mockResolvedValue({ success: false, error: "Email already in use" });

  render(<SignUpForm />);

  await userEvent.type(screen.getByLabelText("Password"), "securepass");
  await userEvent.type(screen.getByLabelText("Confirm Password"), "securepass");
  fireEvent.submit(screen.getByRole("button", { name: "Sign Up" }).closest("form")!);

  const error = await screen.findByText("Email already in use");
  expect(error).toBeDefined();
});

test("displays fallback error message when signUp fails without error string", async () => {
  mockSignUp.mockResolvedValue({ success: false });

  render(<SignUpForm />);

  await userEvent.type(screen.getByLabelText("Password"), "securepass");
  await userEvent.type(screen.getByLabelText("Confirm Password"), "securepass");
  fireEvent.submit(screen.getByRole("button", { name: "Sign Up" }).closest("form")!);

  const error = await screen.findByText("Failed to sign up");
  expect(error).toBeDefined();
});

test("calls onSuccess callback when signUp succeeds", async () => {
  const onSuccess = vi.fn();
  render(<SignUpForm onSuccess={onSuccess} />);

  await userEvent.type(screen.getByLabelText("Password"), "securepass");
  await userEvent.type(screen.getByLabelText("Confirm Password"), "securepass");
  fireEvent.submit(screen.getByRole("button", { name: "Sign Up" }).closest("form")!);

  await vi.waitFor(() => expect(onSuccess).toHaveBeenCalledOnce());
});

test("does not throw when onSuccess is not provided", async () => {
  render(<SignUpForm />);

  await userEvent.type(screen.getByLabelText("Password"), "securepass");
  await userEvent.type(screen.getByLabelText("Confirm Password"), "securepass");
  fireEvent.submit(screen.getByRole("button", { name: "Sign Up" }).closest("form")!);

  await vi.waitFor(() => expect(mockSignUp).toHaveBeenCalledOnce());
});

test("clears error before each new submission attempt", async () => {
  mockSignUp.mockResolvedValueOnce({ success: false, error: "Server error" });
  mockSignUp.mockResolvedValueOnce({ success: true });

  render(<SignUpForm />);

  await userEvent.type(screen.getByLabelText("Password"), "securepass");
  await userEvent.type(screen.getByLabelText("Confirm Password"), "securepass");

  // First submission - fails
  fireEvent.submit(screen.getByRole("button", { name: "Sign Up" }).closest("form")!);
  await screen.findByText("Server error");

  // Second submission - succeeds; error should be gone
  fireEvent.submit(screen.getByRole("button", { name: "Sign Up" }).closest("form")!);
  await vi.waitFor(() => expect(screen.queryByText("Server error")).toBeNull());
});
