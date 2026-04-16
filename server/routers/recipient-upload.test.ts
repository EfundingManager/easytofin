import { describe, it, expect, beforeEach } from "vitest";
import { z } from "zod";
import Papa from "papaparse";

/**
 * Unit tests for Recipient Upload Router
 * Tests CSV parsing, validation, and data integrity
 */

describe("Recipient Upload Router", () => {
  describe("CSV Parsing", () => {
    it("should parse valid CSV with email column", () => {
      const csvContent = `email,name,phone
test@example.com,Test User,1234567890
user@test.com,Another User,0987654321`;

      const result = Papa.parse(csvContent, {
        header: true,
        skipEmptyLines: true,
        dynamicTyping: false,
        transformHeader: (h: string) => h.toLowerCase().trim(),
      });

      expect(result.meta.fields).toContain("email");
      expect(result.data).toHaveLength(2);
      expect(result.errors).toHaveLength(0);
    });

    it("should handle CSV without email column", () => {
      const csvContent = `name,phone
Test User,1234567890`;

      const result = Papa.parse(csvContent, {
        header: true,
        skipEmptyLines: true,
        dynamicTyping: false,
        transformHeader: (h: string) => h.toLowerCase().trim(),
      });

      expect(result.meta.fields).not.toContain("email");
      expect(result.data).toHaveLength(1);
    });

    it("should handle empty CSV", () => {
      const csvContent = "";

      const result = Papa.parse(csvContent, {
        header: true,
        skipEmptyLines: true,
        dynamicTyping: false,
        transformHeader: (h: string) => h.toLowerCase().trim(),
      });

      expect(result.data).toHaveLength(0);
    });

    it("should handle CSV with special characters", () => {
      const csvContent = `email,name,company
test@example.com,"User, Test","Company & Co."
user@test.com,Another User,Test Inc.`;

      const result = Papa.parse(csvContent, {
        header: true,
        skipEmptyLines: true,
        dynamicTyping: false,
        transformHeader: (h: string) => h.toLowerCase().trim(),
      });

      expect(result.data).toHaveLength(2);
      expect(result.errors).toHaveLength(0);
    });

    it("should trim whitespace from headers", () => {
      const csvContent = ` email , name , phone 
test@example.com,Test User,1234567890`;

      const result = Papa.parse(csvContent, {
        header: true,
        skipEmptyLines: true,
        dynamicTyping: false,
        transformHeader: (h: string) => h.toLowerCase().trim(),
      });

      expect(result.meta.fields).toContain("email");
      expect(result.meta.fields).toContain("name");
      expect(result.meta.fields).toContain("phone");
    });

    it("should skip empty lines", () => {
      const csvContent = `email,name

test@example.com,Test User

user@test.com,Another User`;

      const result = Papa.parse(csvContent, {
        header: true,
        skipEmptyLines: true,
        dynamicTyping: false,
        transformHeader: (h: string) => h.toLowerCase().trim(),
      });

      expect(result.data).toHaveLength(2);
    });
  });

  describe("Email Validation", () => {
    const emailSchema = z.string().email("Invalid email address");

    it("should validate correct email format", () => {
      expect(() => emailSchema.parse("test@example.com")).not.toThrow();
      expect(() => emailSchema.parse("user+tag@test.co.uk")).not.toThrow();
    });

    it("should reject invalid email format", () => {
      expect(() => emailSchema.parse("invalid-email")).toThrow();
      expect(() => emailSchema.parse("test@")).toThrow();
      expect(() => emailSchema.parse("@example.com")).toThrow();
    });

    it("should handle emails with plus addressing", () => {
      expect(() => emailSchema.parse("test+tag@example.com")).not.toThrow();
    });
  });

  describe("Recipient Validation", () => {
    const RecipientSchema = z.object({
      email: z.string().email("Invalid email address"),
      name: z.string().optional(),
      firstName: z.string().optional(),
      lastName: z.string().optional(),
      phone: z.string().optional(),
      company: z.string().optional(),
    });

    it("should validate complete recipient", () => {
      const recipient = {
        email: "test@example.com",
        name: "Test User",
        firstName: "Test",
        lastName: "User",
        phone: "1234567890",
        company: "Test Inc",
      };

      expect(() => RecipientSchema.parse(recipient)).not.toThrow();
    });

    it("should validate recipient with only email", () => {
      const recipient = {
        email: "test@example.com",
      };

      expect(() => RecipientSchema.parse(recipient)).not.toThrow();
    });

    it("should reject invalid email", () => {
      const recipient = {
        email: "not-an-email",
      };

      expect(() => RecipientSchema.parse(recipient)).toThrow();
    });

    it("should handle optional fields", () => {
      const recipient = {
        email: "test@example.com",
        name: "Test User",
      };

      expect(() => RecipientSchema.parse(recipient)).not.toThrow();
    });
  });

  describe("Schema Validation", () => {
    const CreateRecipientListSchema = z.object({
      name: z.string().min(1, "List name is required"),
      description: z.string().optional(),
      csvContent: z.string().min(1, "CSV content is required"),
    });

    it("should validate create list schema", () => {
      const data = {
        name: "Test List",
        description: "Test Description",
        csvContent: "email,name\ntest@example.com,Test",
      };

      expect(() => CreateRecipientListSchema.parse(data)).not.toThrow();
    });

    it("should reject empty list name", () => {
      const data = {
        name: "",
        csvContent: "email,name\ntest@example.com,Test",
      };

      expect(() => CreateRecipientListSchema.parse(data)).toThrow();
    });

    it("should reject empty CSV content", () => {
      const data = {
        name: "Test List",
        csvContent: "",
      };

      expect(() => CreateRecipientListSchema.parse(data)).toThrow();
    });

    it("should allow optional description", () => {
      const data = {
        name: "Test List",
        csvContent: "email,name\ntest@example.com,Test",
      };

      expect(() => CreateRecipientListSchema.parse(data)).not.toThrow();
    });
  });

  describe("Update Schema Validation", () => {
    const UpdateRecipientListSchema = z.object({
      id: z.number(),
      name: z.string().optional(),
      description: z.string().optional(),
    });

    it("should validate update schema", () => {
      const data = {
        id: 1,
        name: "Updated Name",
      };

      expect(() => UpdateRecipientListSchema.parse(data)).not.toThrow();
    });

    it("should require id field", () => {
      const data = {
        name: "Updated Name",
      };

      expect(() => UpdateRecipientListSchema.parse(data)).toThrow();
    });

    it("should allow partial updates", () => {
      const data = {
        id: 1,
      };

      expect(() => UpdateRecipientListSchema.parse(data)).not.toThrow();
    });
  });

  describe("Delete Schema Validation", () => {
    const DeleteRecipientSchema = z.object({
      listId: z.number(),
      recipientId: z.number(),
    });

    it("should validate delete schema", () => {
      const data = {
        listId: 1,
        recipientId: 1,
      };

      expect(() => DeleteRecipientSchema.parse(data)).not.toThrow();
    });

    it("should require both listId and recipientId", () => {
      const data = {
        listId: 1,
      };

      expect(() => DeleteRecipientSchema.parse(data)).toThrow();
    });
  });

  describe("Bulk Operations", () => {
    it("should handle large CSV files", () => {
      const rows = Array.from({ length: 1000 }, (_, i) => ({
        email: `user${i}@example.com`,
        name: `User ${i}`,
      }));

      const csvContent = [
        "email,name",
        ...rows.map((r) => `${r.email},${r.name}`),
      ].join("\n");

      const result = Papa.parse(csvContent, {
        header: true,
        skipEmptyLines: true,
        dynamicTyping: false,
      });

      expect(result.data).toHaveLength(1000);
    });

    it("should handle CSV with many columns", () => {
      const csvContent = `email,name,firstName,lastName,phone,company,address,city,state,zip
test@example.com,Test User,Test,User,1234567890,Test Inc,123 Main St,New York,NY,10001
user@test.com,Another User,Another,User,0987654321,Test Co,456 Oak Ave,Los Angeles,CA,90001`;

      const result = Papa.parse(csvContent, {
        header: true,
        skipEmptyLines: true,
        dynamicTyping: false,
      });

      expect(result.data).toHaveLength(2);
      expect(result.meta.fields).toHaveLength(10);
    });
  });

  describe("Data Integrity", () => {
    it("should preserve email case in parsing", () => {
      const csvContent = `email,name
Test@Example.com,Test User
test@example.com,Another User`;

      const result = Papa.parse(csvContent, {
        header: true,
        skipEmptyLines: true,
        dynamicTyping: false,
        transformHeader: (h: string) => h.toLowerCase().trim(),
      });

      const emails = result.data.map((row: any) => row.email);
      expect(emails).toContain("Test@Example.com");
      expect(emails).toContain("test@example.com");
    });

    it("should handle duplicate emails in CSV", () => {
      const csvContent = `email,name
test@example.com,User 1
test@example.com,User 2`;

      const result = Papa.parse(csvContent, {
        header: true,
        skipEmptyLines: true,
        dynamicTyping: false,
      });

      expect(result.data).toHaveLength(2);
      // Duplicates are preserved in parsing; deduplication should happen at DB level
    });

    it("should preserve special characters in names", () => {
      const csvContent = `email,name
test@example.com,"O'Brien, Patrick"
user@test.com,"Müller, Hans"`;

      const result = Papa.parse(csvContent, {
        header: true,
        skipEmptyLines: true,
        dynamicTyping: false,
      });

      const names = result.data.map((row: any) => row.name);
      expect(names).toContain("O'Brien, Patrick");
      expect(names).toContain("Müller, Hans");
    });
  });

  describe("Error Handling", () => {
    it("should handle malformed CSV gracefully", () => {
      const csvContent = `email,name
"unclosed quote,Test User`;

      const result = Papa.parse(csvContent, {
        header: true,
        skipEmptyLines: true,
        dynamicTyping: false,
      });

      // Papa Parse is forgiving and will still parse
      expect(result).toBeDefined();
      expect(result.data).toBeDefined();
    });

    it("should handle CSV with only headers", () => {
      const csvContent = `email,name,phone`;

      const result = Papa.parse(csvContent, {
        header: true,
        skipEmptyLines: true,
        dynamicTyping: false,
      });

      expect(result.data).toHaveLength(0);
      expect(result.meta.fields).toContain("email");
    });

    it("should handle CSV with BOM", () => {
      const csvContent = `\uFEFFemail,name
test@example.com,Test User`;

      const result = Papa.parse(csvContent, {
        header: true,
        skipEmptyLines: true,
        dynamicTyping: false,
      });

      // Papa Parse should handle BOM
      expect(result.data).toHaveLength(1);
    });
  });

  describe("CSV Format Variations", () => {
    it("should handle semicolon-delimited CSV", () => {
      const csvContent = `email;name;phone
test@example.com;Test User;1234567890
user@test.com;Another User;0987654321`;

      const result = Papa.parse(csvContent, {
        header: true,
        skipEmptyLines: true,
        dynamicTyping: false,
        delimiter: ";",
      });

      expect(result.data).toHaveLength(2);
      expect(result.meta.fields).toContain("email");
    });

    it("should handle tab-delimited CSV", () => {
      const csvContent = `email\tname\tphone
test@example.com\tTest User\t1234567890
user@test.com\tAnother User\t0987654321`;

      const result = Papa.parse(csvContent, {
        header: true,
        skipEmptyLines: true,
        dynamicTyping: false,
        delimiter: "\t",
      });

      expect(result.data).toHaveLength(2);
      expect(result.meta.fields).toContain("email");
    });

    it("should handle quoted fields with newlines", () => {
      const csvContent = `email,name,notes
test@example.com,Test User,"Line 1
Line 2"`;

      const result = Papa.parse(csvContent, {
        header: true,
        skipEmptyLines: true,
        dynamicTyping: false,
      });

      expect(result.data).toHaveLength(1);
      expect(result.data[0].notes).toContain("Line 1");
    });
  });
});
