import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { getDb } from "./db";
import { phoneUsers } from "../drizzle/schema";
import { eq } from "drizzle-orm";

describe("User Management Procedures", () => {
  let db: any;
  let testUserId: number;

  beforeAll(async () => {
    db = await getDb();
  });

  afterAll(async () => {
    // Cleanup test data
    if (testUserId) {
      await db.delete(phoneUsers).where(eq(phoneUsers.id, testUserId));
    }
  });

  it("should create a user with support role", async () => {
    const testEmail = `test-support-${Date.now()}@example.com`;
    
    const result = await db.insert(phoneUsers).values({
      email: testEmail,
      role: "support",
      name: "Test Support User",
      verified: "false",
      emailVerified: "false",
      clientStatus: "assigned",
      kycStatus: "pending",
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const inserted = await db
      .select()
      .from(phoneUsers)
      .where(eq(phoneUsers.email, testEmail))
      .then((res: any) => res[0]);

    expect(inserted).toBeDefined();
    expect(inserted.email).toBe(testEmail);
    expect(inserted.role).toBe("support");
    
    testUserId = inserted.id;
  });

  it("should fetch users with role filter", async () => {
    const supportUsers = await db
      .select()
      .from(phoneUsers)
      .then((res: any) => res.filter((u: any) => u.role === "support"));

    expect(Array.isArray(supportUsers)).toBe(true);
  });

  it("should update user role", async () => {
    if (!testUserId) {
      // Create a test user first
      const testEmail = `test-update-${Date.now()}@example.com`;
      await db.insert(phoneUsers).values({
        email: testEmail,
        role: "support",
        name: "Test Update User",
        verified: "false",
        emailVerified: "false",
        clientStatus: "assigned",
        kycStatus: "pending",
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const inserted = await db
        .select()
        .from(phoneUsers)
        .where(eq(phoneUsers.email, testEmail))
        .then((res: any) => res[0]);

      testUserId = inserted.id;
    }

    await db
      .update(phoneUsers)
      .set({ role: "staff", updatedAt: new Date() })
      .where(eq(phoneUsers.id, testUserId));

    const updated = await db
      .select()
      .from(phoneUsers)
      .where(eq(phoneUsers.id, testUserId))
      .then((res: any) => res[0]);

    expect(updated.role).toBe("staff");
  });

  it("should validate role enum values", async () => {
    const validRoles = ["user", "admin", "manager", "staff", "support", "super_admin"];
    
    for (const role of validRoles) {
      const testEmail = `test-role-${role}-${Date.now()}@example.com`;
      
      const result = await db.insert(phoneUsers).values({
        email: testEmail,
        role: role as any,
        name: `Test ${role} User`,
        verified: "false",
        emailVerified: "false",
        clientStatus: "assigned",
        kycStatus: "pending",
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const inserted = await db
        .select()
        .from(phoneUsers)
        .where(eq(phoneUsers.email, testEmail))
        .then((res: any) => res[0]);

      expect(inserted.role).toBe(role);
      
      // Cleanup
      await db.delete(phoneUsers).where(eq(phoneUsers.id, inserted.id));
    }
  });
});
