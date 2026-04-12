import { z } from "zod";
import { protectedProcedure, publicProcedure, router } from "../_core/trpc";
import { TRPCError } from "@trpc/server";
import * as db from "../db";
import { storagePut, storageGet } from "../storage";
import { eq } from "drizzle-orm";
import { clientDocuments, phoneUsers } from "../../drizzle/schema";

// Validation schemas
const ALLOWED_DOCUMENT_TYPES = ["passport", "drivers_license", "national_id", "proof_of_address"];
const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "application/pdf"];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

const uploadDocumentSchema = z.object({
  documentType: z.enum(["passport", "drivers_license", "national_id", "proof_of_address"]),
  fileName: z.string().min(1).max(255),
  fileData: z.string(), // base64 encoded file data
  mimeType: z.enum(["image/jpeg", "image/png", "application/pdf"]),
  fileSize: z.number().int().positive().max(MAX_FILE_SIZE),
});

const getDocumentsSchema = z.object({
  phoneUserId: z.number().int().positive().optional(),
});

const getDocumentSchema = z.object({
  documentId: z.number().int().positive(),
});

const deleteDocumentSchema = z.object({
  documentId: z.number().int().positive(),
});

const approveDocumentSchema = z.object({
  documentId: z.number().int().positive(),
  notes: z.string().optional(),
});

const rejectDocumentSchema = z.object({
  documentId: z.number().int().positive(),
  reason: z.string().min(1, "Rejection reason is required"),
});

export const kycDocumentsRouter = router({
  /**
   * Upload a KYC document
   * User can upload their identity documents for verification
   */
  uploadDocument: protectedProcedure
    .input(uploadDocumentSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        // Get the user's phone user record
        const phoneUser = await db.getPhoneUserById(ctx.user.id);
        if (!phoneUser) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "User profile not found",
          });
        }

        // Validate file size
        if (input.fileSize > MAX_FILE_SIZE) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: `File size exceeds maximum allowed size of ${MAX_FILE_SIZE / 1024 / 1024}MB`,
          });
        }

        // Validate MIME type
        if (!ALLOWED_MIME_TYPES.includes(input.mimeType)) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "File type not allowed. Please upload JPEG, PNG, or PDF files.",
          });
        }

        // Decode base64 file data
        let fileBuffer: Buffer;
        try {
          fileBuffer = Buffer.from(input.fileData, "base64");
        } catch (error) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Invalid file data format",
          });
        }

        // Generate unique file key for S3
        const timestamp = Date.now();
        const randomSuffix = Math.random().toString(36).substring(2, 8);
        const fileKey = `kyc-documents/${phoneUser.id}/${input.documentType}-${timestamp}-${randomSuffix}.${getFileExtension(input.mimeType)}`;

        // Upload to S3
        const uploadResult = await storagePut(fileKey, fileBuffer, input.mimeType);

        // Store document metadata in database
        const dbResult = await db.createClientDocument({
          phoneUserId: phoneUser.id,
          documentType: input.documentType,
          fileName: input.fileName,
          fileUrl: uploadResult.url,
          fileKey: fileKey,
          mimeType: input.mimeType,
          fileSize: input.fileSize,
          status: "pending",
        });

        return {
          success: true,
          documentId: dbResult.id,
          message: "Document uploaded successfully",
        };
      } catch (error) {
        console.error("[KYC Documents] Upload failed:", error);
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to upload document",
        });
      }
    }),

  /**
   * Get user's KYC documents
   */
  getDocuments: protectedProcedure
    .input(getDocumentsSchema)
    .query(async ({ input, ctx }) => {
      try {
        // Get the user's phone user record
        const phoneUser = await db.getPhoneUserById(ctx.user.id);
        if (!phoneUser) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "User profile not found",
          });
        }

        // Get documents for this user
        const documents = await db.getClientDocuments(phoneUser.id);

        return {
          success: true,
          documents: documents,
          count: documents.length,
        };
      } catch (error) {
        console.error("[KYC Documents] Get documents failed:", error);
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to retrieve documents",
        });
      }
    }),

  /**
   * Get a specific document (with presigned URL for download)
   */
  getDocument: protectedProcedure
    .input(getDocumentSchema)
    .query(async ({ input, ctx }) => {
      try {
        const document = await db.getClientDocumentById(input.documentId);
        if (!document) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Document not found",
          });
        }

        // Verify user owns this document
        const phoneUser = await db.getPhoneUserById(ctx.user.id);
        if (!phoneUser || document.phoneUserId !== phoneUser.id) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "You do not have access to this document",
          });
        }

        // Get presigned URL for download
        const presignedUrl = await storageGet(document.fileKey);

        return {
          success: true,
          document: {
            ...document,
            downloadUrl: presignedUrl.url,
          },
        };
      } catch (error) {
        console.error("[KYC Documents] Get document failed:", error);
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to retrieve document",
        });
      }
    }),

  /**
   * Delete a document (only if pending)
   */
  deleteDocument: protectedProcedure
    .input(deleteDocumentSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        const document = await db.getClientDocumentById(input.documentId);
        if (!document) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Document not found",
          });
        }

        // Verify user owns this document
        const phoneUser = await db.getPhoneUserById(ctx.user.id);
        if (!phoneUser || document.phoneUserId !== phoneUser.id) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "You do not have access to this document",
          });
        }

        // Only allow deletion of pending documents
        if (document.status !== "pending") {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Only pending documents can be deleted",
          });
        }

        // Delete from database
        await db.deleteClientDocument(input.documentId);

        return {
          success: true,
          message: "Document deleted successfully",
        };
      } catch (error) {
        console.error("[KYC Documents] Delete failed:", error);
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to delete document",
        });
      }
    }),

  /**
   * Admin: Approve a document
   */
  approveDocument: protectedProcedure
    .input(approveDocumentSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        // Check if user is admin
        if (ctx.user.role !== "admin") {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Only admins can approve documents",
          });
        }

        const document = await db.getClientDocumentById(input.documentId);
        if (!document) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Document not found",
          });
        }

        // Update document status
        await db.updateClientDocument(input.documentId, {
          status: "verified",
          notes: input.notes || null,
        });

        return {
          success: true,
          message: "Document approved successfully",
        };
      } catch (error) {
        console.error("[KYC Documents] Approve failed:", error);
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to approve document",
        });
      }
    }),

  /**
   * Admin: Reject a document
   */
  rejectDocument: protectedProcedure
    .input(rejectDocumentSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        // Check if user is admin
        if (ctx.user.role !== "admin") {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Only admins can reject documents",
          });
        }

        const document = await db.getClientDocumentById(input.documentId);
        if (!document) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Document not found",
          });
        }

        // Update document status
        await db.updateClientDocument(input.documentId, {
          status: "rejected",
          notes: input.reason,
        });

        return {
          success: true,
          message: "Document rejected successfully",
        };
      } catch (error) {
        console.error("[KYC Documents] Reject failed:", error);
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to reject document",
        });
      }
    }),
});

// Helper function to get file extension from MIME type
function getFileExtension(mimeType: string): string {
  const extensions: Record<string, string> = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "application/pdf": "pdf",
  };
  return extensions[mimeType] || "bin";
}
