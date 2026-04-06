import { test, expect, vi, afterEach, beforeEach } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SignInForm } from "../SignInForm";

const mockSignIn = vi.fn();
let mockIsLoading = false;

vi.mock("@/hooks/use-auth", () => ({
  useAuth: () => ({
    signIn: mockSignIn,
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
  mockSignIn.mockResolvedValue({ success: true });
});

test("renders email and password fields", () => {
  render(<SignInForm />);

  expect(screen.getByLabelText("Email")).toBeDefined();
  expect(screen.getByLabelText("Password")).toBeDefined();
});

test("shows Sign In button when not loading", () => {
  render(<SignInForm />);

  expect(screen.getByRole("button", { name: "Sign In" })).toBeDefined();
});

test("shows Signing in... and disables inputs when isLoading is true", () => {
  mockIsLoading = true;
  render(<SignInForm />);

  expect(screen.getByRole("button", { name: "Signing in..." })).toBeDefined();
  expect(screen.getByLabelText("Email")).toHaveProperty("disabled", true);
  expect(screen.getByLabelText("Password")).toHaveProperty("disabled", true);
});

test("calls signIn with email and password on form submission", async () => {
  render(<SignInForm />);

  await userEvent.type(screen.getByLabelText("Email"), "user@example.com");
  await userEvent.type(screen.getByLabelText("Password"), "mypassword");
  fireEvent.submit(screen.getByRole("button", { name: "Sign In" }).closest("form")!);

  expect(mockSignIn).toHaveBeenCalledWith("user@example.com", "mypassword");
});

test("displays error message when signIn fails", async () => {
  mockSignIn.mockResolvedValue({ success: false, error: "Invalid credentials" });

  render(<SignInForm />);

  await userEvent.type(screen.getByLabelText("Email"), "user@example.com");
  await userEvent.type(screen.getByLabelText("Password"), "wrongpass");
  fireEvent.submit(screen.getByRole("button", { name: "Sign In" }).closest("form")!);

  const error = await screen.findByText("Invalid credentials");
  expect(error).toBeDefined();
});

test("displays fallback error message when signIn fails without error string", async () => {
  mockSignIn.mockResolvedValue({ success: false });

  render(<SignInForm />);

  fireEvent.submit(screen.getByRole("button", { name: "Sign In" }).closest("form")!);

  const error = await screen.findByText("Failed to sign in");
  expect(error).toBeDefined();
});

test("calls onSuccess callback when signIn succeeds", async () => {
  const onSuccess = vi.fn();
  render(<SignInForm onSuccess={onSuccess} />);

  await userEvent.type(screen.getByLabelText("Email"), "user@example.com");
  await userEvent.type(screen.getByLabelText("Password"), "password");
  fireEvent.submit(screen.getByRole("button", { name: "Sign In" }).closest("form")!);

  await vi.waitFor(() => expect(onSuccess).toHaveBeenCalledOnce());
});

test("does not throw when onSuccess is not provided", async () => {
  render(<SignInForm />);

  fireEvent.submit(screen.getByRole("button", { name: "Sign In" }).closest("form")!);

  await vi.waitFor(() => expect(mockSignIn).toHaveBeenCalledOnce());
});
