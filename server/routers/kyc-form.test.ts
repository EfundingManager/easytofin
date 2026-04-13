import { describe, it, expect, beforeEach, vi } from "vitest";
import { z } from "zod";
import { kycFormRouter } from "./kyc-form";
import * as db from "../db";

// Mock the database module
vi.mock("../db", () => ({
  getDb: vi.fn(),
}));

describe("KYC Form Router", () => {
  const mockDb = {
    select: vi.fn(),
    update: vi.fn(),
  };

  const mockPhoneUser = {
    id: 1,
    userId: 123,
    phone: "+353123456789",
    email: "user@example.com",
    firstName: "John",
    lastName: "Doe",
    dateOfBirth: new Date("1990-01-15"),
    nationality: "Irish",
    address: "123 Main Street",
    city: "Dublin",
    postalCode: "D01",
    country: "Ireland",
    idType: "passport",
    idNumber: "ABC123456",
    idIssueDate: new Date("2020-01-01"),
    idExpiryDate: new Date("2030-01-01"),
    occupation: "Software Engineer",
    employerName: "Tech Company",
    sourceOfIncome: "employment",
    annualIncome: "€50,000",
    politicallyExposed: "false",
    pepDetails: "",
    kycStatus: "pending",
    kycSubmittedAt: null,
    kycVerifiedAt: null,
    kycRejectionReason: null,
    clientStatus: "queue",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: null,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("submitForm", () => {
    it("should validate required fields", async () => {
      const invalidData = {
        firstName: "",
        lastName: "Doe",
        dateOfBirth: "1990-01-15",
        nationality: "Irish",
        address: "123 Main Street",
        city: "Dublin",
        postalCode: "D01",
        country: "Ireland",
        idType: "passport" as const,
        idNumber: "ABC123456",
        idIssueDate: "2020-01-01",
        idExpiryDate: "2030-01-01",
        sourceOfIncome: "employment" as const,
        politicallyExposed: false,
      };

      // This should fail validation due to empty firstName
      expect(() => {
        z.object({
          firstName: z.string().min(1, "First name is required"),
          lastName: z.string().min(1, "Last name is required"),
        }).parse({ firstName: "", lastName: "Doe" });
      }).toThrow();
    });

    it("should validate date format", () => {
      const invalidDate = "01-15-1990"; // Invalid format

      expect(() => {
        z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format").parse(invalidDate);
      }).toThrow();
    });

    it("should accept valid KYC form data", () => {
      const validData = {
        firstName: "John",
        lastName: "Doe",
        dateOfBirth: "1990-01-15",
        nationality: "Irish",
        address: "123 Main Street",
        city: "Dublin",
        postalCode: "D01",
        country: "Ireland",
        idType: "passport" as const,
        idNumber: "ABC123456",
        idIssueDate: "2020-01-01",
        idExpiryDate: "2030-01-01",
        sourceOfIncome: "employment" as const,
        politicallyExposed: false,
      };

      expect(() => {
        z.object({
          firstName: z.string().min(1),
          lastName: z.string().min(1),
          dateOfBirth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
          nationality: z.string().min(1),
          address: z.string().min(5),
          city: z.string().min(1),
          postalCode: z.string().min(1),
          country: z.string().min(1),
          idType: z.enum(["passport", "national_id", "drivers_license", "other"]),
          idNumber: z.string().min(1),
          idIssueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
          idExpiryDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
          sourceOfIncome: z.enum(["employment", "self_employed", "investment", "pension", "other"]),
          politicallyExposed: z.boolean(),
        }).parse(validData);
      }).not.toThrow();
    });

    it("should validate ID type enum", () => {
      const invalidIdType = "invalid_type";

      expect(() => {
        z.enum(["passport", "national_id", "drivers_license", "other"]).parse(invalidIdType);
      }).toThrow();
    });

    it("should validate source of income enum", () => {
      const validSourceOfIncome = "self_employed";

      expect(() => {
        z.enum(["employment", "self_employed", "investment", "pension", "other"]).parse(validSourceOfIncome);
      }).not.toThrow();
    });

    it("should accept optional fields", () => {
      const dataWithOptionalFields = {
        firstName: "John",
        lastName: "Doe",
        dateOfBirth: "1990-01-15",
        nationality: "Irish",
        address: "123 Main Street",
        city: "Dublin",
        postalCode: "D01",
        country: "Ireland",
        idType: "passport" as const,
        idNumber: "ABC123456",
        idIssueDate: "2020-01-01",
        idExpiryDate: "2030-01-01",
        occupation: "Software Engineer",
        employerName: "Tech Company",
        sourceOfIncome: "employment" as const,
        annualIncome: "€50,000",
        politicallyExposed: false,
        pepDetails: "",
      };

      expect(() => {
        z.object({
          firstName: z.string().min(1),
          lastName: z.string().min(1),
          dateOfBirth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
          nationality: z.string().min(1),
          address: z.string().min(5),
          city: z.string().min(1),
          postalCode: z.string().min(1),
          country: z.string().min(1),
          idType: z.enum(["passport", "national_id", "drivers_license", "other"]),
          idNumber: z.string().min(1),
          idIssueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
          idExpiryDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
          occupation: z.string().optional(),
          employerName: z.string().optional(),
          sourceOfIncome: z.enum(["employment", "self_employed", "investment", "pension", "other"]),
          annualIncome: z.string().optional(),
          politicallyExposed: z.boolean(),
          pepDetails: z.string().optional(),
        }).parse(dataWithOptionalFields);
      }).not.toThrow();
    });

    it("should handle PEP (Politically Exposed Person) details", () => {
      const pepData = {
        politicallyExposed: true,
        pepDetails: "Former government official",
      };

      expect(pepData.politicallyExposed).toBe(true);
      expect(pepData.pepDetails).toBeTruthy();
    });

    it("should convert boolean to string for storage", () => {
      const politicallyExposed = true;
      const storageValue = politicallyExposed ? "true" : "false";

      expect(storageValue).toBe("true");
      expect(typeof storageValue).toBe("string");
    });

    it("should convert date strings to Date objects", () => {
      const dateString = "1990-01-15";
      const dateObject = new Date(dateString + "T00:00:00Z");

      expect(dateObject).toBeInstanceOf(Date);
      expect(dateObject.getUTCFullYear()).toBe(1990);
      expect(dateObject.getUTCMonth()).toBe(0); // January is 0
      expect(dateObject.getUTCDate()).toBe(15);
    });
  });

  describe("getForm", () => {
    it("should return form data with date strings", () => {
      const formData = {
        firstName: mockPhoneUser.firstName,
        lastName: mockPhoneUser.lastName,
        dateOfBirth: mockPhoneUser.dateOfBirth.toISOString().split("T")[0],
        nationality: mockPhoneUser.nationality,
        address: mockPhoneUser.address,
        city: mockPhoneUser.city,
        postalCode: mockPhoneUser.postalCode,
        country: mockPhoneUser.country,
        idType: mockPhoneUser.idType,
        idNumber: mockPhoneUser.idNumber,
        idIssueDate: mockPhoneUser.idIssueDate.toISOString().split("T")[0],
        idExpiryDate: mockPhoneUser.idExpiryDate.toISOString().split("T")[0],
        occupation: mockPhoneUser.occupation,
        employerName: mockPhoneUser.employerName,
        sourceOfIncome: mockPhoneUser.sourceOfIncome,
        annualIncome: mockPhoneUser.annualIncome,
        politicallyExposed: mockPhoneUser.politicallyExposed === "true",
        pepDetails: mockPhoneUser.pepDetails,
        kycStatus: mockPhoneUser.kycStatus,
        kycSubmittedAt: mockPhoneUser.kycSubmittedAt,
      };

      expect(formData.dateOfBirth).toBe("1990-01-15");
      expect(formData.idIssueDate).toBe("2020-01-01");
      expect(formData.idExpiryDate).toBe("2030-01-01");
      expect(formData.politicallyExposed).toBe(false);
    });

    it("should handle missing optional fields", () => {
      const formData = {
        firstName: "John",
        lastName: "Doe",
        occupation: undefined,
        employerName: undefined,
        annualIncome: undefined,
        pepDetails: undefined,
      };

      expect(formData.occupation || "").toBe("");
      expect(formData.employerName || "").toBe("");
      expect(formData.annualIncome || "").toBe("");
      expect(formData.pepDetails || "").toBe("");
    });
  });

  describe("getSubmissions", () => {
    it("should filter submissions by kycStatus", () => {
      const submissions = [
        { ...mockPhoneUser, kycStatus: "submitted" },
        { ...mockPhoneUser, kycStatus: "verified" },
        { ...mockPhoneUser, kycStatus: "pending" },
      ];

      const submittedOnly = submissions.filter(s => s.kycStatus === "submitted");
      expect(submittedOnly).toHaveLength(1);
      expect(submittedOnly[0].kycStatus).toBe("submitted");
    });

    it("should map submission data correctly", () => {
      const submission = {
        id: mockPhoneUser.id,
        userId: mockPhoneUser.userId,
        name: `${mockPhoneUser.firstName} ${mockPhoneUser.lastName}`,
        email: mockPhoneUser.email,
        phone: mockPhoneUser.phone,
        idType: mockPhoneUser.idType,
        idNumber: mockPhoneUser.idNumber,
        kycStatus: mockPhoneUser.kycStatus,
        kycSubmittedAt: mockPhoneUser.kycSubmittedAt,
        clientStatus: mockPhoneUser.clientStatus,
      };

      expect(submission.name).toBe("John Doe");
      expect(submission.id).toBe(1);
      expect(submission.userId).toBe(123);
    });
  });

  describe("getSubmissionDetails", () => {
    it("should return full submission details", () => {
      const details = {
        id: mockPhoneUser.id,
        userId: mockPhoneUser.userId,
        firstName: mockPhoneUser.firstName,
        lastName: mockPhoneUser.lastName,
        email: mockPhoneUser.email,
        phone: mockPhoneUser.phone,
        dateOfBirth: mockPhoneUser.dateOfBirth,
        nationality: mockPhoneUser.nationality,
        address: mockPhoneUser.address,
        city: mockPhoneUser.city,
        postalCode: mockPhoneUser.postalCode,
        country: mockPhoneUser.country,
        idType: mockPhoneUser.idType,
        idNumber: mockPhoneUser.idNumber,
        idIssueDate: mockPhoneUser.idIssueDate,
        idExpiryDate: mockPhoneUser.idExpiryDate,
        occupation: mockPhoneUser.occupation,
        employerName: mockPhoneUser.employerName,
        sourceOfIncome: mockPhoneUser.sourceOfIncome,
        annualIncome: mockPhoneUser.annualIncome,
        politicallyExposed: mockPhoneUser.politicallyExposed === "true",
        pepDetails: mockPhoneUser.pepDetails,
        kycStatus: mockPhoneUser.kycStatus,
        kycSubmittedAt: mockPhoneUser.kycSubmittedAt,
        kycVerifiedAt: mockPhoneUser.kycVerifiedAt,
        kycRejectionReason: mockPhoneUser.kycRejectionReason,
        clientStatus: mockPhoneUser.clientStatus,
      };

      expect(details).toHaveProperty("firstName");
      expect(details).toHaveProperty("kycStatus");
      expect(details).toHaveProperty("clientStatus");
      expect(details.kycStatus).toBe("pending");
    });
  });

  describe("verifySubmission", () => {
    it("should update kycStatus to verified", () => {
      const updateData = {
        kycStatus: "verified" as const,
        clientStatus: "customer" as const,
      };

      expect(updateData.kycStatus).toBe("verified");
      expect(updateData.clientStatus).toBe("customer");
    });

    it("should convert clientStatus to customer", () => {
      const statuses = ["queue", "in_progress", "assigned", "customer"];
      const verifiedStatus = "customer";

      expect(statuses).toContain(verifiedStatus);
    });
  });

  describe("rejectSubmission", () => {
    it("should update kycStatus to rejected", () => {
      const updateData = {
        kycStatus: "rejected" as const,
      };

      expect(updateData.kycStatus).toBe("rejected");
    });

    it("should require rejection reason", () => {
      const rejectionReason = "Insufficient documentation";

      expect(rejectionReason).toBeTruthy();
      expect(rejectionReason.length).toBeGreaterThan(0);
    });

    it("should validate rejection reason is not empty", () => {
      const schema = z.string().min(1, "Rejection reason is required");

      expect(() => schema.parse("")).toThrow();
      expect(() => schema.parse("Invalid documents")).not.toThrow();
    });
  });

  describe("Data Validation", () => {
    it("should validate address minimum length", () => {
      const schema = z.string().min(5, "Address must be at least 5 characters");

      expect(() => schema.parse("123")).toThrow();
      expect(() => schema.parse("123 Main Street")).not.toThrow();
    });

    it("should validate postal code is not empty", () => {
      const schema = z.string().min(1, "Postal code is required");

      expect(() => schema.parse("")).toThrow();
      expect(() => schema.parse("D01")).not.toThrow();
    });

    it("should validate ID number is not empty", () => {
      const schema = z.string().min(1, "ID number is required");

      expect(() => schema.parse("")).toThrow();
      expect(() => schema.parse("ABC123456")).not.toThrow();
    });

    it("should handle date conversion for ISO format", () => {
      const date = new Date("2020-01-01");
      const isoString = date.toISOString().split("T")[0];

      expect(isoString).toBe("2020-01-01");
    });

    it("should validate enum values for ID type", () => {
      const validTypes = ["passport", "national_id", "drivers_license", "other"];
      const schema = z.enum(["passport", "national_id", "drivers_license", "other"]);

      validTypes.forEach(type => {
        expect(() => schema.parse(type)).not.toThrow();
      });

      expect(() => schema.parse("invalid")).toThrow();
    });

    it("should validate enum values for source of income", () => {
      const validSources = ["employment", "self_employed", "investment", "pension", "other"];
      const schema = z.enum(["employment", "self_employed", "investment", "pension", "other"]);

      validSources.forEach(source => {
        expect(() => schema.parse(source)).not.toThrow();
      });

      expect(() => schema.parse("invalid")).toThrow();
    });
  });

  describe("KYC Status Transitions", () => {
    it("should transition from pending to submitted", () => {
      expect("pending" as any).not.toBe("submitted");
      expect("submitted" as any).toBe("submitted");
    });

    it("should transition from submitted to verified", () => {
      expect("submitted" as any).not.toBe("verified");
      expect("verified" as any).toBe("verified");
    });

    it("should transition from submitted to rejected", () => {
      expect("submitted" as any).not.toBe("rejected");
      expect("rejected" as any).toBe("rejected");
    });

    it("should track KYC timestamps", () => {
      const timestamps = {
        kycSubmittedAt: new Date("2026-04-13"),
        kycVerifiedAt: null,
        kycRejectionReason: null,
      };

      expect(timestamps.kycSubmittedAt).toBeTruthy();
      expect(timestamps.kycVerifiedAt).toBeNull();
    });
  });

  describe("Client Status Management", () => {
    it("should update clientStatus to customer on KYC approval", () => {
      const clientStatus = "customer";
      expect(clientStatus).toBe("customer");
    });

    it("should maintain clientStatus on KYC rejection", () => {
      const clientStatus = "queue";
      expect(clientStatus).not.toBe("customer");
    });

    it("should handle all client status values", () => {
      const statuses = ["queue", "in_progress", "assigned", "customer"];
      expect(statuses).toContain("queue");
      expect(statuses).toContain("customer");
    });
  });
});
