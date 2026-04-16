import { adminProcedure } from "../_core/trpc";
import { z } from "zod";
import { getDb } from "../db";
import { recipientLists, recipients } from "../../drizzle/schema";
import { eq, and } from "drizzle-orm";
import Papa from "papaparse";

/**
 * Recipient Upload Router
 * Handles CSV file parsing, validation, and bulk recipient list management
 */

// Validation schemas
const RecipientSchema = z.object({
  email: z.string().email("Invalid email address"),
  name: z.string().optional(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  phone: z.string().optional(),
  company: z.string().optional(),
});

const CreateRecipientListSchema = z.object({
  name: z.string().min(1, "List name is required"),
  description: z.string().optional(),
  csvContent: z.string().min(1, "CSV content is required"),
});

const UpdateRecipientListSchema = z.object({
  id: z.number(),
  name: z.string().optional(),
  description: z.string().optional(),
});

const DeleteRecipientSchema = z.object({
  listId: z.number(),
  recipientId: z.number(),
});

/**
 * Parse and validate CSV content
 */
function parseCSV(csvContent: string): {
  headers: string[];
  rows: Record<string, string>[];
  errors: string[];
} {
  const errors: string[] = [];
  const rows: Record<string, string>[] = [];

  try {
    const result = Papa.parse(csvContent, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: false,
      transformHeader: (h: string) => h.toLowerCase().trim(),
    });

    if (result.errors.length > 0) {
      result.errors.forEach((err: any) => {
        errors.push(`CSV Parse Error (Row ${err.row}): ${err.message}`);
      });
    }

    const headers = result.meta.fields || [];

    // Validate headers - must have email column
    if (!headers.includes("email")) {
      errors.push("CSV must contain required column: email");
      return { headers, rows, errors };
    }

    // Validate and transform rows
    result.data.forEach((row: any, index: number) => {
      try {
        const validatedRow = RecipientSchema.parse(row);
        rows.push(validatedRow);
      } catch (err: any) {
        errors.push(
          `Row ${index + 2}: ${err.errors.map((e: any) => e.message).join(", ")}`
        );
      }
    });

    return { headers, rows, errors };
  } catch (err: any) {
    errors.push(`Failed to parse CSV: ${err.message}`);
    return { headers: [], rows, errors };
  }
}

/**
 * Create a new recipient list from CSV
 */
export const createRecipientList = adminProcedure
  .input(CreateRecipientListSchema)
  .mutation(async ({ ctx, input }: any) => {
    const { csvContent, name, description } = input;
    const db = await getDb();

    if (!db) {
      throw new Error("Database connection not available");
    }

    // Parse CSV
    const { rows, errors } = parseCSV(csvContent);

    if (errors.length > 0) {
      throw new Error(`CSV Validation Errors:\n${errors.join("\n")}`);
    }

    if (rows.length === 0) {
      throw new Error("CSV file contains no valid recipients");
    }

    try {
      // Create recipient list
      const listResult = await db
        .insert(recipientLists)
        .values({
          name,
          description: description || null,
          recipientCount: rows.length,
          createdBy: ctx.user.id,
          updatedBy: ctx.user.id,
        });

      const listId = (listResult as any).insertId as number;
      if (!listId || isNaN(listId)) {
        throw new Error("Failed to create recipient list: invalid list ID");
      }

      // Insert recipients
      const recipientValues = rows.map((row) => ({
        listId,
        email: row.email,
        name: row.name || `${row.firstName || ""} ${row.lastName || ""}`.trim() || null,
        firstName: row.firstName || null,
        lastName: row.lastName || null,
        phone: row.phone || null,
        company: row.company || null,
        status: "active" as const,
      }));

      await db.insert(recipients).values(recipientValues);

      return {
        listId,
        name,
        recipientCount: rows.length,
        message: `Successfully created recipient list with ${rows.length} recipients`,
      };
    } catch (err: any) {
      throw new Error(`Failed to create recipient list: ${err.message}`);
    }
  });

/**
 * Get all recipient lists
 */
export const listRecipientLists = adminProcedure.query(async ({ ctx }: any) => {
  const db = await getDb();

  if (!db) {
    throw new Error("Database connection not available");
  }

  try {
    const lists = await db
      .select()
      .from(recipientLists)
      .where(eq(recipientLists.createdBy, ctx.user.id));

    return lists;
  } catch (err: any) {
    throw new Error(`Failed to fetch recipient lists: ${err.message}`);
  }
});

/**
 * Get recipients in a list with pagination
 */
export const getRecipients = adminProcedure
  .input(
    z.object({
      listId: z.number(),
      page: z.number().default(1),
      limit: z.number().default(50),
    })
  )
  .query(async ({ ctx, input }: any) => {
    const { listId, page, limit } = input;
    const offset = (page - 1) * limit;
    const db = await getDb();

    if (!db) {
      throw new Error("Database connection not available");
    }

    try {
      // Verify list ownership
      const list = await db
        .select()
        .from(recipientLists)
        .where(
          and(
            eq(recipientLists.id, listId),
            eq(recipientLists.createdBy, ctx.user.id)
          )
        )
        .limit(1);

      if (list.length === 0) {
        throw new Error("Recipient list not found");
      }

      const recipientList = await db
        .select()
        .from(recipients)
        .where(eq(recipients.listId, listId))
        .limit(limit)
        .offset(offset);

      return {
        list: list[0],
        recipients: recipientList,
        page,
        limit,
        total: list[0].recipientCount,
      };
    } catch (err: any) {
      throw new Error(`Failed to fetch recipients: ${err.message}`);
    }
  });

/**
 * Update recipient list metadata
 */
export const updateRecipientList = adminProcedure
  .input(UpdateRecipientListSchema)
  .mutation(async ({ ctx, input }: any) => {
    const { id, name, description } = input;
    const db = await getDb();

    if (!db) {
      throw new Error("Database connection not available");
    }

    try {
      await db
        .update(recipientLists)
        .set({
          name: name || undefined,
          description: description || undefined,
          updatedBy: ctx.user.id,
        })
        .where(
          and(eq(recipientLists.id, id), eq(recipientLists.createdBy, ctx.user.id))
        );

      return { message: "Recipient list updated successfully" };
    } catch (err: any) {
      throw new Error(`Failed to update recipient list: ${err.message}`);
    }
  });

/**
 * Delete a recipient from a list
 */
export const deleteRecipient = adminProcedure
  .input(DeleteRecipientSchema)
  .mutation(async ({ ctx, input }: any) => {
    const { listId, recipientId } = input;
    const db = await getDb();

    if (!db) {
      throw new Error("Database connection not available");
    }

    try {
      // Verify list ownership
      const list = await db
        .select()
        .from(recipientLists)
        .where(
          and(
            eq(recipientLists.id, listId),
            eq(recipientLists.createdBy, ctx.user.id)
          )
        )
        .limit(1);

      if (list.length === 0) {
        throw new Error("Recipient list not found");
      }

      // Delete recipient
      await db
        .delete(recipients)
        .where(
          and(
            eq(recipients.id, recipientId),
            eq(recipients.listId, listId)
          )
        );

      // Update recipient count
      const count = await db
        .select()
        .from(recipients)
        .where(eq(recipients.listId, listId));

      await db
        .update(recipientLists)
        .set({
          recipientCount: count.length,
          updatedBy: ctx.user.id,
        })
        .where(eq(recipientLists.id, listId));

      return { message: "Recipient deleted successfully" };
    } catch (err: any) {
      throw new Error(`Failed to delete recipient: ${err.message}`);
    }
  });

/**
 * Delete entire recipient list
 */
export const deleteRecipientList = adminProcedure
  .input(z.object({ id: z.number() }))
  .mutation(async ({ ctx, input }: any) => {
    const { id } = input;
    const db = await getDb();

    if (!db) {
      throw new Error("Database connection not available");
    }

    try {
      // Verify list ownership
      const list = await db
        .select()
        .from(recipientLists)
        .where(
          and(eq(recipientLists.id, id), eq(recipientLists.createdBy, ctx.user.id))
        )
        .limit(1);

      if (list.length === 0) {
        throw new Error("Recipient list not found");
      }

      // Delete all recipients in list
      await db.delete(recipients).where(eq(recipients.listId, id));

      // Delete list
      await db.delete(recipientLists).where(eq(recipientLists.id, id));

      return { message: "Recipient list deleted successfully" };
    } catch (err: any) {
      throw new Error(`Failed to delete recipient list: ${err.message}`);
    }
  });

/**
 * Validate CSV format without creating list
 */
export const validateCSV = adminProcedure
  .input(z.object({ csvContent: z.string() }))
  .query(({ input }: any) => {
    const { csvContent } = input;
    const { headers, rows, errors } = parseCSV(csvContent);

    return {
      isValid: errors.length === 0,
      headers,
      rowCount: rows.length,
      errors,
      preview: rows.slice(0, 5), // First 5 rows for preview
    };
  });

export const recipientUploadRouter = {
  createRecipientList,
  listRecipientLists,
  getRecipients,
  updateRecipientList,
  deleteRecipient,
  deleteRecipientList,
  validateCSV,
};
