import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { createCallerFactory } from "@trpc/server";
import { appRouter } from "../routers";
import { db } from "../db";
import { phoneUsers } from "../../drizzle/schema";
import { eq } from "drizzle-orm";

describe("Email Campaign Router", () => {
  let adminUserId: number;
  let regularUserId: number;
  let caller: ReturnType<typeof createCallerFactory()(appRouter)>;

  beforeAll(async () => {
    // Create test admin user
    const adminUsers = await db
      .insert(phoneUsers)
      .values({
        email: `admin-campaign-${Date.now()}@test.com`,
        name: "Campaign Admin",
        role: "admin",
        openId: `admin-${Date.now()}`,
        loginMethod: "email",
        verified: true,
      })
      .returning();
    adminUserId = adminUsers[0].id;

    // Create test regular user
    const regularUsers = await db
      .insert(phoneUsers)
      .values({
        email: `user-campaign-${Date.now()}@test.com`,
        name: "Campaign User",
        role: "user",
        openId: `user-${Date.now()}`,
        loginMethod: "email",
        verified: true,
      })
      .returning();
    regularUserId = regularUsers[0].id;

    // Create caller with admin context
    caller = createCallerFactory()(appRouter)({
      user: { id: adminUserId, role: "admin" },
      req: {} as any,
      res: {} as any,
    });
  });

  afterAll(async () => {
    // Cleanup test users
    await db.delete(phoneUsers).where(eq(phoneUsers.id, adminUserId));
    await db.delete(phoneUsers).where(eq(phoneUsers.id, regularUserId));
  });

  describe("Campaign CRUD Operations", () => {
    it("should create a new email campaign", async () => {
      const result = await caller.emailCampaign.createCampaign({
        name: "Test Campaign",
        templateId: 1,
        recipientEmails: ["test@example.com"],
        subject: "Test Subject",
        scheduledFor: new Date(Date.now() + 24 * 60 * 60 * 1000),
      });

      expect(result).toHaveProperty("id");
      expect(result.name).toBe("Test Campaign");
      expect(result.status).toBe("draft");
    });

    it("should list campaigns for admin", async () => {
      const result = await caller.emailCampaign.listCampaigns({
        page: 1,
        limit: 10,
      });

      expect(Array.isArray(result.campaigns)).toBe(true);
      expect(result).toHaveProperty("total");
    });

    it("should get campaign details", async () => {
      // Create a campaign first
      const campaign = await caller.emailCampaign.createCampaign({
        name: "Get Details Test",
        templateId: 1,
        recipientEmails: ["test@example.com"],
        subject: "Test",
        scheduledFor: new Date(Date.now() + 24 * 60 * 60 * 1000),
      });

      const result = await caller.emailCampaign.getCampaignDetails({
        campaignId: campaign.id,
      });

      expect(result.id).toBe(campaign.id);
      expect(result.name).toBe("Get Details Test");
    });

    it("should update campaign", async () => {
      const campaign = await caller.emailCampaign.createCampaign({
        name: "Update Test",
        templateId: 1,
        recipientEmails: ["test@example.com"],
        subject: "Test",
        scheduledFor: new Date(Date.now() + 24 * 60 * 60 * 1000),
      });

      const result = await caller.emailCampaign.updateCampaign({
        campaignId: campaign.id,
        name: "Updated Name",
        subject: "Updated Subject",
      });

      expect(result.name).toBe("Updated Name");
      expect(result.subject).toBe("Updated Subject");
    });

    it("should delete campaign", async () => {
      const campaign = await caller.emailCampaign.createCampaign({
        name: "Delete Test",
        templateId: 1,
        recipientEmails: ["test@example.com"],
        subject: "Test",
        scheduledFor: new Date(Date.now() + 24 * 60 * 60 * 1000),
      });

      const result = await caller.emailCampaign.deleteCampaign({
        campaignId: campaign.id,
      });

      expect(result.success).toBe(true);
    });
  });

  describe("Campaign Scheduling", () => {
    it("should schedule campaign for future date", async () => {
      const futureDate = new Date(Date.now() + 24 * 60 * 60 * 1000);
      const campaign = await caller.emailCampaign.createCampaign({
        name: "Scheduled Campaign",
        templateId: 1,
        recipientEmails: ["test@example.com"],
        subject: "Test",
        scheduledFor: futureDate,
      });

      expect(campaign.scheduledFor).toBeDefined();
      expect(new Date(campaign.scheduledFor).getTime()).toBeGreaterThan(Date.now());
    });

    it("should not allow scheduling in the past", async () => {
      const pastDate = new Date(Date.now() - 60 * 60 * 1000);

      try {
        await caller.emailCampaign.createCampaign({
          name: "Past Campaign",
          templateId: 1,
          recipientEmails: ["test@example.com"],
          subject: "Test",
          scheduledFor: pastDate,
        });
        expect.fail("Should have thrown error");
      } catch (error: any) {
        expect(error.message).toContain("past");
      }
    });
  });

  describe("Campaign Recipients", () => {
    it("should accept multiple recipient emails", async () => {
      const recipients = [
        "user1@example.com",
        "user2@example.com",
        "user3@example.com",
      ];

      const campaign = await caller.emailCampaign.createCampaign({
        name: "Multi-recipient Campaign",
        templateId: 1,
        recipientEmails: recipients,
        subject: "Test",
        scheduledFor: new Date(Date.now() + 24 * 60 * 60 * 1000),
      });

      expect(campaign.recipientCount).toBe(3);
    });

    it("should validate email format", async () => {
      try {
        await caller.emailCampaign.createCampaign({
          name: "Invalid Email Campaign",
          templateId: 1,
          recipientEmails: ["invalid-email"],
          subject: "Test",
          scheduledFor: new Date(Date.now() + 24 * 60 * 60 * 1000),
        });
        expect.fail("Should have thrown error");
      } catch (error: any) {
        expect(error.message).toContain("email");
      }
    });
  });

  describe("Access Control", () => {
    it("should deny campaign creation for non-admin users", async () => {
      const userCaller = createCallerFactory()(appRouter)({
        user: { id: regularUserId, role: "user" },
        req: {} as any,
        res: {} as any,
      });

      try {
        await userCaller.emailCampaign.createCampaign({
          name: "Unauthorized Campaign",
          templateId: 1,
          recipientEmails: ["test@example.com"],
          subject: "Test",
          scheduledFor: new Date(Date.now() + 24 * 60 * 60 * 1000),
        });
        expect.fail("Should have thrown error");
      } catch (error: any) {
        expect(error.message).toContain("admin");
      }
    });

    it("should deny campaign deletion for non-admin users", async () => {
      const campaign = await caller.emailCampaign.createCampaign({
        name: "Admin Campaign",
        templateId: 1,
        recipientEmails: ["test@example.com"],
        subject: "Test",
        scheduledFor: new Date(Date.now() + 24 * 60 * 60 * 1000),
      });

      const userCaller = createCallerFactory()(appRouter)({
        user: { id: regularUserId, role: "user" },
        req: {} as any,
        res: {} as any,
      });

      try {
        await userCaller.emailCampaign.deleteCampaign({
          campaignId: campaign.id,
        });
        expect.fail("Should have thrown error");
      } catch (error: any) {
        expect(error.message).toContain("admin");
      }
    });
  });

  describe("Campaign Status", () => {
    it("should have draft status when created", async () => {
      const campaign = await caller.emailCampaign.createCampaign({
        name: "Draft Campaign",
        templateId: 1,
        recipientEmails: ["test@example.com"],
        subject: "Test",
        scheduledFor: new Date(Date.now() + 24 * 60 * 60 * 1000),
      });

      expect(campaign.status).toBe("draft");
    });

    it("should allow status transitions", async () => {
      const campaign = await caller.emailCampaign.createCampaign({
        name: "Status Test",
        templateId: 1,
        recipientEmails: ["test@example.com"],
        subject: "Test",
        scheduledFor: new Date(Date.now() + 24 * 60 * 60 * 1000),
      });

      const updated = await caller.emailCampaign.updateCampaign({
        campaignId: campaign.id,
        status: "scheduled",
      });

      expect(updated.status).toBe("scheduled");
    });
  });

  describe("Campaign Templates", () => {
    it("should require valid template ID", async () => {
      try {
        await caller.emailCampaign.createCampaign({
          name: "Invalid Template",
          templateId: 99999,
          recipientEmails: ["test@example.com"],
          subject: "Test",
          scheduledFor: new Date(Date.now() + 24 * 60 * 60 * 1000),
        });
        expect.fail("Should have thrown error");
      } catch (error: any) {
        expect(error.message).toContain("template");
      }
    });
  });

  describe("Campaign Validation", () => {
    it("should require campaign name", async () => {
      try {
        await caller.emailCampaign.createCampaign({
          name: "",
          templateId: 1,
          recipientEmails: ["test@example.com"],
          subject: "Test",
          scheduledFor: new Date(Date.now() + 24 * 60 * 60 * 1000),
        });
        expect.fail("Should have thrown error");
      } catch (error: any) {
        expect(error.message).toContain("name");
      }
    });

    it("should require at least one recipient", async () => {
      try {
        await caller.emailCampaign.createCampaign({
          name: "No Recipients",
          templateId: 1,
          recipientEmails: [],
          subject: "Test",
          scheduledFor: new Date(Date.now() + 24 * 60 * 60 * 1000),
        });
        expect.fail("Should have thrown error");
      } catch (error: any) {
        expect(error.message).toContain("recipient");
      }
    });

    it("should require subject line", async () => {
      try {
        await caller.emailCampaign.createCampaign({
          name: "No Subject",
          templateId: 1,
          recipientEmails: ["test@example.com"],
          subject: "",
          scheduledFor: new Date(Date.now() + 24 * 60 * 60 * 1000),
        });
        expect.fail("Should have thrown error");
      } catch (error: any) {
        expect(error.message).toContain("subject");
      }
    });
  });
});
