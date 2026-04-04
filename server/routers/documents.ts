import { protectedProcedure, publicProcedure, router } from '../_core/trpc';
import { z } from 'zod';
import { getDb } from '../db';
import { clientDocuments, phoneUsers } from '../../drizzle/schema';
import { eq, and } from 'drizzle-orm';
import { storagePut, storageGet } from '../storage';
import { TRPCError } from '@trpc/server';
import type { ClientDocument } from '../../drizzle/schema';

export const documentsRouter = router({
  /**
   * Upload a document for the current user
   */
  uploadDocument: protectedProcedure
    .input(
      z.object({
        documentType: z.string().min(1, 'Document type is required'),
        fileName: z.string().min(1, 'File name is required'),
        fileData: z.string(), // base64 encoded file data
        mimeType: z.string().optional(),
        fileSize: z.number().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const db = await getDb();
        if (!db) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Database connection failed',
          });
        }
        // Get phone user ID from context
        const phoneUser = await db
          .select()
          .from(phoneUsers)
          .where(eq(phoneUsers.email, ctx.user?.email || ''))
          .limit(1);

        if (!phoneUser || phoneUser.length === 0) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'User profile not found',
          });
        }

        const userId = phoneUser[0].id;

        // Convert base64 to buffer
        const buffer = Buffer.from(input.fileData, 'base64');

        // Generate unique file key
        const timestamp = Date.now();
        const randomSuffix = Math.random().toString(36).substring(2, 8);
        const fileKey = `documents/${userId}/${input.documentType}/${timestamp}-${randomSuffix}-${input.fileName}`;

        // Upload to S3
        const { url } = await storagePut(fileKey, buffer, input.mimeType || 'application/octet-stream');

        // Save to database
        await db.insert(clientDocuments).values({
          phoneUserId: userId,
          documentType: input.documentType,
          fileName: input.fileName,
          fileUrl: url,
          fileKey: fileKey,
          mimeType: input.mimeType,
          fileSize: input.fileSize || buffer.length,
          status: 'pending',
        });

        return {
          success: true,
          data: {
            id: Math.floor(Math.random() * 1000000),
            fileName: input.fileName,
            documentType: input.documentType,
            fileUrl: url,
            uploadedAt: new Date(),
            status: 'pending',
          },
        };
      } catch (error) {
        console.error('Document upload error:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to upload document',
        });
      }
    }),

  /**
   * Get all documents for the current user
   */
  getDocuments: protectedProcedure.query(async ({ ctx }) => {
    try {
      const db = await getDb();
      if (!db) {
        return {
          success: true,
          data: [],
        };
      }
      const phoneUser = await db.select()
        .from(phoneUsers)
        .where(eq(phoneUsers.email, ctx.user?.email || ''))
        .limit(1);

      if (!phoneUser || phoneUser.length === 0) {
        return {
          success: true,
          data: [],
        };
      }

      const documents = await db
        .select()
        .from(clientDocuments)
        .where(eq(clientDocuments.phoneUserId, phoneUser[0].id))
        .orderBy((t: any) => t.uploadedAt);

      return {
        success: true,
        data: documents.map((doc: any) => ({
          id: doc.id,
          documentType: doc.documentType,
          fileName: doc.fileName,
          fileUrl: doc.fileUrl,
          mimeType: doc.mimeType,
          fileSize: doc.fileSize,
          uploadedAt: doc.uploadedAt,
          status: doc.status,
          notes: doc.notes,
        })),
      };
    } catch (error) {
      console.error('Get documents error:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch documents',
      });
    }
  }),

  /**
   * Delete a document
   */
  deleteDocument: protectedProcedure
    .input(z.object({ documentId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      try {
        const db = await getDb();
        if (!db) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Database connection failed',
          });
        }
        const phoneUser = await db
          .select()
          .from(phoneUsers)
          .where(eq(phoneUsers.email, ctx.user?.email || ''))
          .limit(1);

        if (!phoneUser || phoneUser.length === 0) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'User profile not found',
          });
        }

        // Verify document belongs to user
        const document = await db
          .select()
          .from(clientDocuments)
          .where(
            and(
              eq(clientDocuments.id, input.documentId),
              eq(clientDocuments.phoneUserId, phoneUser[0].id)
            )
          )
          .limit(1);

        if (!document || document.length === 0) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Document not found',
          });
        }

        // Delete from database
        await db.delete(clientDocuments).where(eq(clientDocuments.id, input.documentId));

        return {
          success: true,
          message: 'Document deleted successfully',
        };
      } catch (error) {
        console.error('Delete document error:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to delete document',
        });
      }
    }),

  /**
   * Get a presigned URL for downloading a document
   */
  getDownloadUrl: protectedProcedure
    .input(z.object({ documentId: z.number() }))
    .query(async ({ input, ctx }) => {
      try {
        const db = await getDb();
        if (!db) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Database connection failed',
          });
        }
        const phoneUser = await db
          .select()
          .from(phoneUsers)
          .where(eq(phoneUsers.email, ctx.user?.email || ''))
          .limit(1);

        if (!phoneUser || phoneUser.length === 0) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'User profile not found',
          });
        }

        const document = await db
          .select()
          .from(clientDocuments)
          .where(
            and(
              eq(clientDocuments.id, input.documentId),
              eq(clientDocuments.phoneUserId, phoneUser[0].id)
            )
          )
          .limit(1);

        if (!document || document.length === 0) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Document not found',
          });
        }

        // Get presigned URL (valid for 1 hour)
        const { url } = await storageGet(document[0].fileKey);

        return {
          success: true,
          data: {
            url,
            fileName: document[0].fileName,
          },
        };
      } catch (error) {
        console.error('Get download URL error:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to generate download URL',
        });
      }
    }),
});
