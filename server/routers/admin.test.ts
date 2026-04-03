import { describe, it, expect, vi, beforeEach } from "vitest";
import { adminRouter } from "./admin";
import * as db from "../db";

// Mock the database module
vi.mock("../db", () => ({
  getDb: vi.fn(),
}));

describe("Admin Router", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getStats", () => {
    it("should return stats when database is available", async () => {
      vi.mocked(db.getDb).mockResolvedValue({} as any);

      const caller = adminRouter.createCaller({
        user: { id: 1, role: "admin", email: "admin@test.com" },
        req: {} as any,
        res: {} as any,
      } as any);

      const result = await caller.getStats();

      expect(result).toBeDefined();
      expect(typeof result.totalClients).toBe("number");
      expect(typeof result.totalSubmissions).toBe("number");
      expect(typeof result.pendingReview).toBe("number");
      expect(typeof result.completionRate).toBe("number");
    });

    it("should return zero stats when database is not available", async () => {
      vi.mocked(db.getDb).mockResolvedValue(null);

      const caller = adminRouter.createCaller({
        user: { id: 1, role: "admin", email: "admin@test.com" },
        req: {} as any,
        res: {} as any,
      } as any);

      const result = await caller.getStats();

      expect(result).toEqual({
        totalClients: 0,
        totalSubmissions: 0,
        pendingReview: 0,
        completionRate: 0,
      });
    });
  });

  describe("getProductStats", () => {
    it("should return product statistics", async () => {
      vi.mocked(db.getDb).mockResolvedValue(null);

      const caller = adminRouter.createCaller({
        user: { id: 1, role: "admin", email: "admin@test.com" },
        req: {} as any,
        res: {} as any,
      } as any);

      const result = await caller.getProductStats();

      expect(result).toBeDefined();
      expect(result).toHaveProperty("protection");
      expect(result).toHaveProperty("pensions");
      expect(result).toHaveProperty("healthInsurance");
      expect(result).toHaveProperty("generalInsurance");
      expect(result).toHaveProperty("investments");
    });
  });

  describe("getClientSubmissions", () => {
    it("should return client submissions with pagination", async () => {
      vi.mocked(db.getDb).mockResolvedValue(null);

      const caller = adminRouter.createCaller({
        user: { id: 1, role: "admin", email: "admin@test.com" },
        req: {} as any,
        res: {} as any,
      } as any);

      const result = await caller.getClientSubmissions({
        page: 1,
        limit: 10,
      });

      expect(result).toBeDefined();
      expect(result).toHaveProperty("submissions");
      expect(result).toHaveProperty("total");
      expect(result).toHaveProperty("page");
      expect(result).toHaveProperty("limit");
      expect(Array.isArray(result.submissions)).toBe(true);
    });

    it("should handle search query", async () => {
      vi.mocked(db.getDb).mockResolvedValue(null);

      const caller = adminRouter.createCaller({
        user: { id: 1, role: "admin", email: "admin@test.com" },
        req: {} as any,
        res: {} as any,
      } as any);

      const result = await caller.getClientSubmissions({
        page: 1,
        limit: 10,
        search: "test@example.com",
      });

      expect(result).toBeDefined();
      expect(Array.isArray(result.submissions)).toBe(true);
    });
  });

  describe("getFormResponsesByProduct", () => {
    it("should return form responses for a specific product", async () => {
      vi.mocked(db.getDb).mockResolvedValue(null);

      const caller = adminRouter.createCaller({
        user: { id: 1, role: "admin", email: "admin@test.com" },
        req: {} as any,
        res: {} as any,
      } as any);

      const result = await caller.getFormResponsesByProduct({
        product: "protection",
      });

      expect(result).toBeDefined();
      expect(result.product).toBe("protection");
      expect(Array.isArray(result.responses)).toBe(true);
      expect(result).toHaveProperty("total");
    });
  });

  describe("getAllFormResponses", () => {
    it("should return all form responses with pagination", async () => {
      vi.mocked(db.getDb).mockResolvedValue(null);

      const caller = adminRouter.createCaller({
        user: { id: 1, role: "admin", email: "admin@test.com" },
        req: {} as any,
        res: {} as any,
      } as any);

      const result = await caller.getAllFormResponses({
        page: 1,
        limit: 10,
      });

      expect(result).toBeDefined();
      expect(Array.isArray(result.responses)).toBe(true);
      expect(result).toHaveProperty("total");
      expect(result).toHaveProperty("page");
      expect(result).toHaveProperty("limit");
    });

    it("should filter by status", async () => {
      vi.mocked(db.getDb).mockResolvedValue(null);

      const caller = adminRouter.createCaller({
        user: { id: 1, role: "admin", email: "admin@test.com" },
        req: {} as any,
        res: {} as any,
      } as any);

      const result = await caller.getAllFormResponses({
        page: 1,
        limit: 10,
        status: "submitted",
      });

      expect(result).toBeDefined();
      expect(Array.isArray(result.responses)).toBe(true);
    });
  });

  describe("getRecentActivity", () => {
    it("should return recent activity", async () => {
      vi.mocked(db.getDb).mockResolvedValue(null);

      const caller = adminRouter.createCaller({
        user: { id: 1, role: "admin", email: "admin@test.com" },
        req: {} as any,
        res: {} as any,
      } as any);

      const result = await caller.getRecentActivity({
        limit: 10,
      });

      expect(Array.isArray(result)).toBe(true);
    });
  });
});
