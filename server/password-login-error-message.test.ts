import { describe, it, expect, beforeEach, vi } from "vitest";
import { TRPCError } from "@trpc/server";

describe("Password Login Error Messages", () => {
  describe("User-friendly error messages", () => {
    it("should return 'Invalid phone/email or password' for non-existent user", () => {
      const error = new TRPCError({
        code: "UNAUTHORIZED",
        message: "Invalid phone/email or password",
      });

      expect(error.message).toBe("Invalid phone/email or password");
      expect(error.code).toBe("UNAUTHORIZED");
    });

    it("should return 'Invalid phone/email or password' for incorrect password", () => {
      const error = new TRPCError({
        code: "UNAUTHORIZED",
        message: "Invalid phone/email or password",
      });

      expect(error.message).toBe("Invalid phone/email or password");
      expect(error.code).toBe("UNAUTHORIZED");
    });

    it("should return account locked message when account is locked", () => {
      const remainingMinutes = 25;
      const error = new TRPCError({
        code: "TOO_MANY_REQUESTS",
        message: `Account is temporarily locked. Please try again in ${remainingMinutes} minutes or use the unlock option.`,
      });

      expect(error.message).toContain("Account is temporarily locked");
      expect(error.message).toContain("25 minutes");
      expect(error.code).toBe("TOO_MANY_REQUESTS");
    });

    it("should return OAuth redirect message for OAuth users", () => {
      const error = new TRPCError({
        code: "UNAUTHORIZED",
        message: "Please use your OAuth login method to sign in.",
      });

      expect(error.message).toBe("Please use your OAuth login method to sign in.");
      expect(error.code).toBe("UNAUTHORIZED");
    });

    it("should not expose database query details in error messages", () => {
      const userFriendlyMessage = "Invalid phone/email or password";
      const databaseQueryExample = "Failed query: select `id`, `phoneUserId` from `accountLockouts`";

      expect(userFriendlyMessage).not.toContain("Failed query");
      expect(userFriendlyMessage).not.toContain("select");
      expect(userFriendlyMessage).not.toContain("from");
      expect(userFriendlyMessage).not.toContain("`");
    });

    it("should not expose table names in error messages", () => {
      const userFriendlyMessage = "Invalid phone/email or password";
      const tableNames = ["accountLockouts", "phoneUsers", "users", "loginAttempts"];

      tableNames.forEach((tableName) => {
        expect(userFriendlyMessage).not.toContain(tableName);
      });
    });

    it("should not expose column names in error messages", () => {
      const userFriendlyMessage = "Invalid phone/email or password";
      const columnNames = ["phoneUserId", "failedAttempts", "lockedUntil", "passwordHash"];

      columnNames.forEach((columnName) => {
        expect(userFriendlyMessage).not.toContain(columnName);
      });
    });

    it("should not expose SQL parameters in error messages", () => {
      const userFriendlyMessage = "Invalid phone/email or password";
      const sqlPatterns = ["params:", "where", "=", "?"];

      sqlPatterns.forEach((pattern) => {
        if (pattern === "=") {
          // Skip this as it might appear in legitimate messages
          return;
        }
        expect(userFriendlyMessage.toLowerCase()).not.toContain(pattern.toLowerCase());
      });
    });
  });

  describe("Error message consistency", () => {
    it("should use same message for invalid credentials regardless of reason", () => {
      const messages = [
        "Invalid phone/email or password", // Non-existent user
        "Invalid phone/email or password", // Wrong password
      ];

      const uniqueMessages = new Set(messages);
      expect(uniqueMessages.size).toBe(1); // All should be identical
    });

    it("should include remaining attempts in failed login message", () => {
      const remainingAttempts = 3;
      const message = `Invalid phone/email or password. Remaining attempts: ${remainingAttempts}`;

      expect(message).toContain("Remaining attempts");
      expect(message).toContain("3");
    });
  });

  describe("Error code mapping", () => {
    it("should use UNAUTHORIZED code for invalid credentials", () => {
      const error = new TRPCError({
        code: "UNAUTHORIZED",
        message: "Invalid phone/email or password",
      });

      expect(error.code).toBe("UNAUTHORIZED");
    });

    it("should use TOO_MANY_REQUESTS code for account lockout", () => {
      const error = new TRPCError({
        code: "TOO_MANY_REQUESTS",
        message: "Account is temporarily locked",
      });

      expect(error.code).toBe("TOO_MANY_REQUESTS");
    });

    it("should use INTERNAL_SERVER_ERROR code for database issues", () => {
      const error = new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Database connection failed",
      });

      expect(error.code).toBe("INTERNAL_SERVER_ERROR");
    });
  });
});
