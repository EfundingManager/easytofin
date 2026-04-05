import { adminProcedure } from "../_core/trpc";
import { z } from "zod";
import { getDb } from "../db";
import { clientDocuments } from "../../drizzle/schema";
import { eq } from "drizzle-orm";

export const documentReviewRouter = {
  updateDocumentStatus: adminProcedure
    .input(
      z.object({
        documentId: z.number(),
        status: z.enum(["pending", "verified", "rejected"]),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ input }: { input: any }) => {
      try {
        const db = await getDb();
        if (!db) throw new Error("Database not available");

        await db
          .update(clientDocuments)
          .set({
            status: input.status,
            notes: input.notes || null,
            updatedAt: new Date(),
          })
          .where(eq(clientDocuments.id, input.documentId));

        return {
          success: true,
          message: `Document status updated to ${input.status}`,
        };
      } catch (error) {
        console.error("Failed to update document status:", error);
        throw new Error("Failed to update document status");
      }
    }),

  addDocumentNote: adminProcedure
    .input(
      z.object({
        documentId: z.number(),
        note: z.string().min(1, "Note cannot be empty"),
      })
    )
    .mutation(async ({ input }: { input: any }) => {
      try {
        const db = await getDb();
        if (!db) throw new Error("Database not available");

        // Get existing document
        const docs = await db
          .select()
          .from(clientDocuments)
          .where(eq(clientDocuments.id, input.documentId));

        if (docs.length === 0) {
          throw new Error("Document not found");
        }

        const doc = docs[0];
        const existingNotes = doc.notes || "";
        const timestamp = new Date().toLocaleString();
        const newNotes = existingNotes
          ? `${existingNotes}\n\n[${timestamp}] ${input.note}`
          : `[${timestamp}] ${input.note}`;

        await db
          .update(clientDocuments)
          .set({
            notes: newNotes,
            updatedAt: new Date(),
          })
          .where(eq(clientDocuments.id, input.documentId));

        return {
          success: true,
          message: "Note added successfully",
        };
      } catch (error) {
        console.error("Failed to add document note:", error);
        throw new Error("Failed to add document note");
      }
    }),

  getDocumentDetails: adminProcedure
    .input(z.object({ documentId: z.number() }))
    .query(async ({ input }: { input: any }) => {
      try {
        const db = await getDb();
        if (!db) throw new Error("Database not available");

        const docs = await db
          .select()
          .from(clientDocuments)
          .where(eq(clientDocuments.id, input.documentId));

        if (docs.length === 0) {
          throw new Error("Document not found");
        }

        return docs[0];
      } catch (error) {
        console.error("Failed to get document details:", error);
        throw new Error("Failed to get document details");
      }
    }),
};
