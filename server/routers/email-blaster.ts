import { protectedProcedure, adminProcedure } from "../_core/trpc";
import { z } from "zod";
import { getDb } from "../db";
import { emailTemplates } from "../../drizzle/schema";
import { eq } from "drizzle-orm";

const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
const SENDGRID_API_URL = "https://api.sendgrid.com/v3";

interface SendGridTemplate {
  id: string;
  name: string;
  generation: string;
  updated_at: string;
  versions?: Array<{
    id: string;
    template_id: string;
    active: boolean;
    name: string;
    html_content: string;
    plain_content?: string;
    subject: string;
    created_at: string;
    updated_at: string;
  }>;
}

async function fetchSendGridTemplates(): Promise<SendGridTemplate[]> {
  if (!SENDGRID_API_KEY) {
    throw new Error("SendGrid API key not configured");
  }

  try {
    const response = await fetch(`${SENDGRID_API_URL}/templates?generations=dynamic&limit=200`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${SENDGRID_API_KEY}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`SendGrid API error: ${response.statusText}`);
    }

    const data = await response.json() as { templates: SendGridTemplate[] };
    return data.templates || [];
  } catch (error) {
    console.error("[SendGrid] Failed to fetch templates:", error);
    throw error;
  }
}

async function fetchSendGridTemplateDetails(templateId: string): Promise<SendGridTemplate | null> {
  if (!SENDGRID_API_KEY) {
    throw new Error("SendGrid API key not configured");
  }

  try {
    const response = await fetch(`${SENDGRID_API_URL}/templates/${templateId}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${SENDGRID_API_KEY}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`SendGrid API error: ${response.statusText}`);
    }

    const data = await response.json() as SendGridTemplate;
    return data;
  } catch (error) {
    console.error("[SendGrid] Failed to fetch template details:", error);
    throw error;
  }
}

export const emailBlasterRouter = {
  // Get all email templates from database
  getAllTemplates: adminProcedure.query(async () => {
    try {
      const db = await getDb();
      if (!db) {
        throw new Error("Database not available");
      }

      const templates = await db.select().from(emailTemplates).limit(100);
      return templates;
    } catch (error) {
      console.error("[EmailBlaster] Failed to fetch templates:", error);
      throw new Error("Failed to fetch email templates");
    }
  }),

  // Import templates from SendGrid
  importFromSendGrid: adminProcedure.mutation(async () => {
    try {
      console.log("[SendGrid] Starting template import...");
      const sendGridTemplates = await fetchSendGridTemplates();
      console.log(`[SendGrid] Found ${sendGridTemplates.length} templates`);

      const db = await getDb();
      if (!db) {
        throw new Error("Database not available");
      }

      const importedTemplates = [];

      for (const template of sendGridTemplates) {
        try {
          // Fetch full template details including versions
          const fullTemplate = await fetchSendGridTemplateDetails(template.id);
          if (!fullTemplate || !fullTemplate.versions || fullTemplate.versions.length === 0) {
            console.warn(`[SendGrid] Template ${template.id} has no versions, skipping`);
            continue;
          }

          // Get the active version
          const activeVersion = fullTemplate.versions.find((v) => v.active) || fullTemplate.versions[0];

          // Create slug from template name
          const slug = template.name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-+|-+$/g, "");

          // Check if template already exists
          const existing = await db
            .select()
            .from(emailTemplates)
            .where(eq(emailTemplates.slug, `sendgrid_${slug}`))
            .limit(1);

          if (existing.length > 0) {
            console.log(`[SendGrid] Template ${template.id} already exists, updating...`);
            // Update existing template
            await db
              .update(emailTemplates)
              .set({
                name: template.name,
                subject: activeVersion.subject,
                htmlContent: activeVersion.html_content,
                plainTextContent: activeVersion.plain_content || null,
                category: "marketing",
                isPredefined: "true",
                isActive: "true",
                updatedAt: new Date(),
              })
              .where(eq(emailTemplates.slug, `sendgrid_${slug}`));
            importedTemplates.push(template.id);
          } else {
            console.log(`[SendGrid] Importing new template ${template.id}...`);
            // Insert new template
            await db.insert(emailTemplates).values({
              name: template.name,
              slug: `sendgrid_${slug}`,
              subject: activeVersion.subject,
              htmlContent: activeVersion.html_content,
              plainTextContent: activeVersion.plain_content || null,
              category: "marketing",
              isPredefined: "true",
              isActive: "true",
              createdAt: new Date(),
              updatedAt: new Date(),
            });
            importedTemplates.push(template.id);
          }
        } catch (error) {
          console.error(`[SendGrid] Failed to import template ${template.id}:`, error);
          // Continue with next template
        }
      }

      console.log(`[SendGrid] Successfully imported ${importedTemplates.length} templates`);
      return {
        success: true,
        imported: importedTemplates.length,
        total: sendGridTemplates.length,
      };
    } catch (error) {
      console.error("[SendGrid] Import failed:", error);
      throw new Error("Failed to import SendGrid templates");
    }
  }),

  // Get template by ID
  getTemplate: adminProcedure.input(z.object({ id: z.number() })).query(async ({ input }) => {
    try {
      const db = await getDb();
      if (!db) {
        throw new Error("Database not available");
      }

      const template = await db
        .select()
        .from(emailTemplates)
        .where(eq(emailTemplates.id, input.id))
        .limit(1);

      if (template.length === 0) {
        throw new Error("Template not found");
      }

      return template[0];
    } catch (error) {
      console.error("[EmailBlaster] Failed to fetch template:", error);
      throw new Error("Failed to fetch email template");
    }
  }),

  // Delete template
  deleteTemplate: adminProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
    try {
      const db = await getDb();
      if (!db) {
        throw new Error("Database not available");
      }

      await db.delete(emailTemplates).where(eq(emailTemplates.id, input.id));
      return { success: true };
    } catch (error) {
      console.error("[EmailBlaster] Failed to delete template:", error);
      throw new Error("Failed to delete email template");
    }
  }),

  // Get SendGrid template list (for preview)
  getSendGridTemplates: adminProcedure.query(async () => {
    try {
      const templates = await fetchSendGridTemplates();
      return templates.map((t) => ({
        id: t.id,
        name: t.name,
        generation: t.generation,
        updated_at: t.updated_at,
      }));
    } catch (error) {
      console.error("[SendGrid] Failed to fetch templates:", error);
      throw new Error("Failed to fetch SendGrid templates");
    }
  }),
};
