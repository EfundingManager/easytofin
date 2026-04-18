import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import SignUp from "./SignUp";

// Mock dependencies
vi.mock("wouter", () => ({
  useLocation: () => ["/signup", vi.fn()],
  Link: ({ href, children }: any) => <a href={href}>{children}</a>,
}));

vi.mock("@/lib/trpc", () => ({
  trpc: {
    signup: {
      registerUser: {
        useMutation: () => ({
          mutateAsync: vi.fn(),
          isLoading: false,
        }),
      },
    },
  },
}));

vi.mock("sonner", () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}));

vi.mock("@/components/Navbar", () => ({
  default: () => <div data-testid="navbar">Navbar</div>,
}));

vi.mock("@/components/Footer", () => ({
  default: () => <div data-testid="footer">Footer</div>,
}));

describe("SignUp Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Step 1: Form Submission", () => {
    it("should render form fields on initial load", () => {
      render(<SignUp />);

      expect(screen.getByPlaceholderText("John Doe")).toBeInTheDocument();
      expect(screen.getByPlaceholderText("your@email.com")).toBeInTheDocument();
      expect(screen.getByPlaceholderText("+353 87 123 4567")).toBeInTheDocument();
    });

    it("should validate email format", async () => {
      const user = userEvent.setup();
      render(<SignUp />);

      const emailInput = screen.getByPlaceholderText("your@email.com");
      const fullNameInput = screen.getByPlaceholderText("John Doe");
      const phoneInput = screen.getByPlaceholderText("+353 87 123 4567");
      const submitButton = screen.getByText("Continue to Password Setup");

      await user.type(emailInput, "invalid-email");
      await user.type(fullNameInput, "John Doe");
      await user.type(phoneInput, "+353871234567");
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText("Please enter a valid email address")).toBeInTheDocument();
      });
    });

    it("should validate full name format", async () => {
      const user = userEvent.setup();
      render(<SignUp />);

      const emailInput = screen.getByPlaceholderText("your@email.com");
      const fullNameInput = screen.getByPlaceholderText("John Doe");
      const phoneInput = screen.getByPlaceholderText("+353 87 123 4567");
      const submitButton = screen.getByText("Continue to Password Setup");

      await user.type(emailInput, "test@example.com");
      await user.type(fullNameInput, "John"); // Only first name
      await user.type(phoneInput, "+353871234567");
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText("Please enter your first and last name")).toBeInTheDocument();
      });
    });

    it("should proceed to password step when form is valid", async () => {
      const user = userEvent.setup();
      render(<SignUp />);

      const emailInput = screen.getByPlaceholderText("your@email.com");
      const fullNameInput = screen.getByPlaceholderText("John Doe");
      const phoneInput = screen.getByPlaceholderText("+353 87 123 4567");
      const submitButton = screen.getByText("Continue to Password Setup");

      await user.type(emailInput, "test@example.com");
      await user.type(fullNameInput, "John Doe");
      await user.type(phoneInput, "+353871234567");
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText("Step 2: Create Your Password")).toBeInTheDocument();
      });
    });
  });

  describe("Step 2: Password Setup", () => {
    it("should show password fields after form submission", async () => {
      const user = userEvent.setup();
      render(<SignUp />);

      // Fill and submit form
      const emailInput = screen.getByPlaceholderText("your@email.com");
      const fullNameInput = screen.getByPlaceholderText("John Doe");
      const phoneInput = screen.getByPlaceholderText("+353 87 123 4567");
      const submitButton = screen.getByText("Continue to Password Setup");

      await user.type(emailInput, "test@example.com");
      await user.type(fullNameInput, "John Doe");
      await user.type(phoneInput, "+353871234567");
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByPlaceholderText("Enter a strong password")).toBeInTheDocument();
        expect(screen.getByPlaceholderText("Confirm your password")).toBeInTheDocument();
      });
    });

    it("should validate password strength", async () => {
      const user = userEvent.setup();
      render(<SignUp />);

      // Fill and submit form
      const emailInput = screen.getByPlaceholderText("your@email.com");
      const fullNameInput = screen.getByPlaceholderText("John Doe");
      const phoneInput = screen.getByPlaceholderText("+353 87 123 4567");
      const submitButton = screen.getByText("Continue to Password Setup");

      await user.type(emailInput, "test@example.com");
      await user.type(fullNameInput, "John Doe");
      await user.type(phoneInput, "+353871234567");
      await user.click(submitButton);

      const passwordInput = await screen.findByPlaceholderText("Enter a strong password");
      await user.type(passwordInput, "weak");

      await waitFor(() => {
        expect(screen.getByText("Weak password")).toBeInTheDocument();
      });
    });

    it("should show password match error when passwords don't match", async () => {
      const user = userEvent.setup();
      render(<SignUp />);

      // Fill and submit form
      const emailInput = screen.getByPlaceholderText("your@email.com");
      const fullNameInput = screen.getByPlaceholderText("John Doe");
      const phoneInput = screen.getByPlaceholderText("+353 87 123 4567");
      const submitButton = screen.getByText("Continue to Password Setup");

      await user.type(emailInput, "test@example.com");
      await user.type(fullNameInput, "John Doe");
      await user.type(phoneInput, "+353871234567");
      await user.click(submitButton);

      const passwordInput = await screen.findByPlaceholderText("Enter a strong password");
      const confirmPasswordInput = screen.getByPlaceholderText("Confirm your password");

      await user.type(passwordInput, "StrongPassword123!");
      await user.type(confirmPasswordInput, "DifferentPassword123!");

      const createAccountButton = screen.getByText("Create Account");
      await user.click(createAccountButton);

      await waitFor(() => {
        expect(screen.getByText("Passwords do not match")).toBeInTheDocument();
      });
    });

    it("should allow going back to form step", async () => {
      const user = userEvent.setup();
      render(<SignUp />);

      // Fill and submit form
      const emailInput = screen.getByPlaceholderText("your@email.com");
      const fullNameInput = screen.getByPlaceholderText("John Doe");
      const phoneInput = screen.getByPlaceholderText("+353 87 123 4567");
      const submitButton = screen.getByText("Continue to Password Setup");

      await user.type(emailInput, "test@example.com");
      await user.type(fullNameInput, "John Doe");
      await user.type(phoneInput, "+353871234567");
      await user.click(submitButton);

      // Click back button
      const backButton = await screen.findByText("Back");
      await user.click(backButton);

      await waitFor(() => {
        expect(screen.getByText("Step 1: Your Information")).toBeInTheDocument();
      });
    });

    it("should show strong password indicator for valid password", async () => {
      const user = userEvent.setup();
      render(<SignUp />);

      // Fill and submit form
      const emailInput = screen.getByPlaceholderText("your@email.com");
      const fullNameInput = screen.getByPlaceholderText("John Doe");
      const phoneInput = screen.getByPlaceholderText("+353 87 123 4567");
      const submitButton = screen.getByText("Continue to Password Setup");

      await user.type(emailInput, "test@example.com");
      await user.type(fullNameInput, "John Doe");
      await user.type(phoneInput, "+353871234567");
      await user.click(submitButton);

      const passwordInput = await screen.findByPlaceholderText("Enter a strong password");
      await user.type(passwordInput, "StrongPassword123!");

      await waitFor(() => {
        expect(screen.getByText("Strong password")).toBeInTheDocument();
        expect(screen.getByText("Password meets all requirements")).toBeInTheDocument();
      });
    });
  });

  describe("Password Visibility Toggle", () => {
    it("should toggle password visibility", async () => {
      const user = userEvent.setup();
      render(<SignUp />);

      // Fill and submit form
      const emailInput = screen.getByPlaceholderText("your@email.com");
      const fullNameInput = screen.getByPlaceholderText("John Doe");
      const phoneInput = screen.getByPlaceholderText("+353 87 123 4567");
      const submitButton = screen.getByText("Continue to Password Setup");

      await user.type(emailInput, "test@example.com");
      await user.type(fullNameInput, "John Doe");
      await user.type(phoneInput, "+353871234567");
      await user.click(submitButton);

      const passwordInput = (await screen.findByPlaceholderText("Enter a strong password")) as HTMLInputElement;
      expect(passwordInput.type).toBe("password");

      // Find and click the eye icon (visibility toggle)
      const eyeButtons = screen.getAllByRole("button").filter((btn) => btn.querySelector("svg"));
      if (eyeButtons.length > 0) {
        await user.click(eyeButtons[0]);
        expect(passwordInput.type).toBe("text");
      }
    });
  });
});
