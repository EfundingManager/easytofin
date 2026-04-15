import { describe, it, expect, beforeAll, afterAll, vi } from "vitest";
import { appRouter } from "../routers";
import { getDb } from "../db";
import { emailTemplates } from "../../drizzle/schema";
import { eq } from "drizzle-orm";

describe("Email Blaster Router", () => {
  let db: Awaited<ReturnType<typeof getDb>>;

  beforeAll(async () => {
    db = await getDb();
    if (!db) {
      throw new Error("Database not available for tests");
    }
  });

  afterAll(async () => {
    // Cleanup test data
    if (db) {
      await db.delete(emailTemplates).where(eq(emailTemplates.category, "marketing"));
    }
  });

  describe("getAllTemplates", () => {
    it("should return empty array when no templates exist", async () => {
      const caller = appRouter.createCaller({
        user: { id: 1, role: "admin" },
        req: {} as any,
        res: {} as any,
      });

      const result = await caller.emailBlaster.getAllTemplates();
      expect(Array.isArray(result)).toBe(true);
    });

    it("should require admin role", async () => {
      const caller = appRouter.createCaller({
        user: { id: 1, role: "user" },
        req: {} as any,
        res: {} as any,
      });

      try {
        await caller.emailBlaster.getAllTemplates();
        expect.fail("Should have thrown error for non-admin user");
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });

  describe("getTemplate", () => {
    it("should retrieve a specific template by ID", async () => {
      if (!db) throw new Error("Database not available");

      // Create a test template
      const result = await db.insert(emailTemplates).values({
        name: "Test Template",
        slug: "test-template",
        subject: "Test Subject",
        htmlContent: "<h1>Test</h1>",
        category: "marketing",
        isPredefined: "false",
        isActive: "true",
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const templateId = (result as any).insertId;

      const caller = appRouter.createCaller({
        user: { id: 1, role: "admin" },
        req: {} as any,
        res: {} as any,
      });

      const template = await caller.emailBlaster.getTemplate({ id: templateId });
      expect(template).toBeDefined();
      expect(template.name).toBe("Test Template");
      expect(template.subject).toBe("Test Subject");
    });

    it("should throw error for non-existent template", async () => {
      const caller = appRouter.createCaller({
        user: { id: 1, role: "admin" },
        req: {} as any,
        res: {} as any,
      });

      try {
        await caller.emailBlaster.getTemplate({ id: 99999 });
        expect.fail("Should have thrown error");
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });

  describe("deleteTemplate", () => {
    it("should delete a template", async () => {
      if (!db) throw new Error("Database not available");

      // Create a test template
      const result = await db.insert(emailTemplates).values({
        name: "Delete Test Template",
        slug: "delete-test-template",
        subject: "Delete Test",
        htmlContent: "<h1>Delete</h1>",
        category: "marketing",
        isPredefined: "false",
        isActive: "true",
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const templateId = (result as any).insertId;

      const caller = appRouter.createCaller({
        user: { id: 1, role: "admin" },
        req: {} as any,
        res: {} as any,
      });

      const deleteResult = await caller.emailBlaster.deleteTemplate({ id: templateId });
      expect(deleteResult.success).toBe(true);

      // Verify it's deleted
      try {
        await caller.emailBlaster.getTemplate({ id: templateId });
        expect.fail("Template should have been deleted");
      } catch (error) {
        expect(error).toBeDefined();
      }
    });

    it("should require admin role for delete", async () => {
      const caller = appRouter.createCaller({
        user: { id: 1, role: "user" },
        req: {} as any,
        res: {} as any,
      });

      try {
        await caller.emailBlaster.deleteTemplate({ id: 1 });
        expect.fail("Should have thrown error for non-admin user");
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });

  describe("getSendGridTemplates", () => {
    it("should require admin role", async () => {
      const caller = appRouter.createCaller({
        user: { id: 1, role: "user" },
        req: {} as any,
        res: {} as any,
      });

      try {
        await caller.emailBlaster.getSendGridTemplates();
        expect.fail("Should have thrown error for non-admin user");
      } catch (error) {
        expect(error).toBeDefined();
      }
    });

    it("should handle SendGrid API errors gracefully", async () => {
      // Mock the fetch to return an error
      const originalFetch = global.fetch;
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        statusText: "Unauthorized",
      });

      const caller = appRouter.createCaller({
        user: { id: 1, role: "admin" },
        req: {} as any,
        res: {} as any,
      });

      try {
        await caller.emailBlaster.getSendGridTemplates();
        expect.fail("Should have thrown error");
      } catch (error) {
        expect(error).toBeDefined();
      } finally {
        global.fetch = originalFetch;
      }
    });
  });

  describe("importFromSendGrid", () => {
    it("should require admin role", async () => {
      const caller = appRouter.createCaller({
        user: { id: 1, role: "user" },
        req: {} as any,
        res: {} as any,
      });

      try {
        await caller.emailBlaster.importFromSendGrid();
        expect.fail("Should have thrown error for non-admin user");
      } catch (error) {
        expect(error).toBeDefined();
      }
    });

    it("should handle missing SendGrid API key", async () => {
      // Temporarily unset the API key
      const originalKey = process.env.SENDGRID_API_KEY;
      delete process.env.SENDGRID_API_KEY;

      const caller = appRouter.createCaller({
        user: { id: 1, role: "admin" },
        req: {} as any,
        res: {} as any,
      });

      try {
        await caller.emailBlaster.importFromSendGrid();
        expect.fail("Should have thrown error");
      } catch (error) {
        expect(error).toBeDefined();
      } finally {
        process.env.SENDGRID_API_KEY = originalKey;
      }
    });
  });
});
