import { test, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import { AuthDialog } from "../AuthDialog";

// Stub SignInForm and SignUpForm to keep tests focused on AuthDialog logic
vi.mock("../SignInForm", () => ({
  SignInForm: ({ onSuccess }: { onSuccess?: () => void }) => (
    <div data-testid="sign-in-form">
      <button onClick={onSuccess}>trigger-success</button>
    </div>
  ),
}));

vi.mock("../SignUpForm", () => ({
  SignUpForm: ({ onSuccess }: { onSuccess?: () => void }) => (
    <div data-testid="sign-up-form">
      <button onClick={onSuccess}>trigger-success</button>
    </div>
  ),
}));

afterEach(() => {
  cleanup();
});

test("shows Welcome back title in signin mode", () => {
  render(
    <AuthDialog open={true} onOpenChange={vi.fn()} defaultMode="signin" />
  );

  expect(screen.getByText("Welcome back")).toBeDefined();
});

test("shows Create an account title in signup mode", () => {
  render(
    <AuthDialog open={true} onOpenChange={vi.fn()} defaultMode="signup" />
  );

  expect(screen.getByText("Create an account")).toBeDefined();
});

test("defaults to signin mode", () => {
  render(<AuthDialog open={true} onOpenChange={vi.fn()} />);

  expect(screen.getByText("Welcome back")).toBeDefined();
  expect(screen.getByTestId("sign-in-form")).toBeDefined();
});

test("switches to signup mode when Sign up link is clicked", () => {
  render(
    <AuthDialog open={true} onOpenChange={vi.fn()} defaultMode="signin" />
  );

  fireEvent.click(screen.getByRole("button", { name: "Sign up" }));

  expect(screen.getByText("Create an account")).toBeDefined();
  expect(screen.getByTestId("sign-up-form")).toBeDefined();
});

test("switches to signin mode when Sign in link is clicked", () => {
  render(
    <AuthDialog open={true} onOpenChange={vi.fn()} defaultMode="signup" />
  );

  fireEvent.click(screen.getByRole("button", { name: "Sign in" }));

  expect(screen.getByText("Welcome back")).toBeDefined();
  expect(screen.getByTestId("sign-in-form")).toBeDefined();
});

test("updates mode when defaultMode prop changes", () => {
  const { rerender } = render(
    <AuthDialog open={true} onOpenChange={vi.fn()} defaultMode="signin" />
  );

  expect(screen.getByTestId("sign-in-form")).toBeDefined();

  rerender(
    <AuthDialog open={true} onOpenChange={vi.fn()} defaultMode="signup" />
  );

  expect(screen.getByTestId("sign-up-form")).toBeDefined();
});

test("calls onOpenChange(false) when SignInForm onSuccess is triggered", () => {
  const onOpenChange = vi.fn();
  render(
    <AuthDialog open={true} onOpenChange={onOpenChange} defaultMode="signin" />
  );

  fireEvent.click(screen.getByRole("button", { name: "trigger-success" }));

  expect(onOpenChange).toHaveBeenCalledWith(false);
});

test("does not render dialog content when open is false", () => {
  render(
    <AuthDialog open={false} onOpenChange={vi.fn()} defaultMode="signin" />
  );

  expect(screen.queryByText("Welcome back")).toBeNull();
});
