import { getDb } from "../db";
import { accountLinks, accountLinkTokens, users, phoneUsers } from "../../drizzle/schema";
import { eq, and } from "drizzle-orm";
import crypto from "crypto";

/**
 * Account Linking Service
 * Manages linking and unlinking of OAuth and phone/email accounts
 */

export interface LinkAccountInput {
  userId?: number; // OAuth user ID
  phoneUserId?: number; // Phone user ID
  linkMethod: "oauth_to_phone" | "oauth_to_email";
}

export interface LinkAccountResult {
  success: boolean;
  accountLinkId?: number;
  verificationToken?: string;
  message: string;
}

/**
 * Create a new account link request
 * Generates a verification token for email/SMS confirmation
 */
export async function createAccountLink(input: LinkAccountInput): Promise<LinkAccountResult> {
  const db = await getDb();
  if (!db) throw new Error("Database connection failed");

  try {
    // Validate that both accounts exist
    if (input.userId) {
      const user = await db.select().from(users).where(eq(users.id, input.userId)).limit(1);
      if (!user || user.length === 0) {
        return { success: false, message: "OAuth account not found" };
      }
    }

    if (input.phoneUserId) {
      const phoneUser = await db.select().from(phoneUsers).where(eq(phoneUsers.id, input.phoneUserId)).limit(1);
      if (!phoneUser || phoneUser.length === 0) {
        return { success: false, message: "Phone/email account not found" };
      }
    }

    // Check if link already exists
    const existingLink = await db
      .select()
      .from(accountLinks)
      .where(
        and(
          eq(accountLinks.userId, input.userId || 0),
          eq(accountLinks.phoneUserId, input.phoneUserId || 0),
          eq(accountLinks.status, "active")
        )
      )
      .limit(1);

    if (existingLink && existingLink.length > 0) {
      return { success: false, message: "Accounts are already linked" };
    }

    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString("hex");
    const tokenExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Create account link record
    const result = await db.insert(accountLinks).values({
      userId: input.userId,
      phoneUserId: input.phoneUserId,
      linkMethod: input.linkMethod,
      verificationToken,
      verificationTokenExpiresAt: tokenExpiresAt,
      isVerified: "false",
      status: "pending",
    });

    const accountLinkId = (result as any).insertId || 0;

    return {
      success: true,
      accountLinkId,
      verificationToken,
      message: "Account link request created. Please verify via email or SMS.",
    };
  } catch (error: any) {
    console.error("[Account Linking] Create link error:", error);
    throw error;
  }
}

/**
 * Verify account link with token
 */
export async function verifyAccountLink(token: string, verificationCode?: string): Promise<LinkAccountResult> {
  const db = await getDb();
  if (!db) throw new Error("Database connection failed");

  try {
    // Find account link by token
    const link = await db
      .select()
      .from(accountLinks)
      .where(eq(accountLinks.verificationToken, token))
      .limit(1);

    if (!link || link.length === 0) {
      return { success: false, message: "Invalid verification token" };
    }

    const accountLink = link[0];

    // Check if token is expired
    if (accountLink.verificationTokenExpiresAt && new Date() > accountLink.verificationTokenExpiresAt) {
      return { success: false, message: "Verification token has expired" };
    }

    // If SMS verification code is required, verify it
    if (verificationCode) {
      const linkToken = await db
        .select()
        .from(accountLinkTokens)
        .where(eq(accountLinkTokens.accountLinkId, accountLink.id))
        .limit(1);

      if (linkToken && linkToken.length > 0) {
        const token = linkToken[0];
        if (token.verificationCode !== verificationCode) {
          // Increment attempts
          await db
            .update(accountLinkTokens)
            .set({ attempts: (token.attempts || 0) + 1 })
            .where(eq(accountLinkTokens.id, token.id));

          if ((token.attempts || 0) + 1 >= (token.maxAttempts || 3)) {
            return { success: false, message: "Too many failed verification attempts" };
          }
          return { success: false, message: "Invalid verification code" };
        }
      }
    }

    // Mark as verified
    await db
      .update(accountLinks)
      .set({
        isVerified: "true",
        verifiedAt: new Date(),
        status: "active",
        verificationToken: null,
        verificationTokenExpiresAt: null,
      })
      .where(eq(accountLinks.id, accountLink.id));

    return {
      success: true,
      accountLinkId: accountLink.id,
      message: "Account link verified successfully",
    };
  } catch (error: any) {
    console.error("[Account Linking] Verify link error:", error);
    throw error;
  }
}

/**
 * Get all linked accounts for a user
 */
export async function getLinkedAccounts(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database connection failed");

  try {
    const links = await db
      .select()
      .from(accountLinks)
      .where(and(eq(accountLinks.userId, userId), eq(accountLinks.status, "active")));

    return links;
  } catch (error: any) {
    console.error("[Account Linking] Get linked accounts error:", error);
    throw error;
  }
}

/**
 * Revoke account link
 */
export async function revokeAccountLink(accountLinkId: number, reason?: string): Promise<LinkAccountResult> {
  const db = await getDb();
  if (!db) throw new Error("Database connection failed");

  try {
    await db
      .update(accountLinks)
      .set({
        status: "revoked",
        revokedAt: new Date(),
        revokedReason: reason,
      })
      .where(eq(accountLinks.id, accountLinkId));

    return {
      success: true,
      message: "Account link revoked successfully",
    };
  } catch (error: any) {
    console.error("[Account Linking] Revoke link error:", error);
    throw error;
  }
}

/**
 * Find user by linked phone/email
 * Used during login to find OAuth user from phone/email credentials
 */
export async function findUserByLinkedPhone(phone: string) {
  const db = await getDb();
  if (!db) throw new Error("Database connection failed");

  try {
    // Find phoneUser by phone
    const phoneUser = await db
      .select()
      .from(phoneUsers)
      .where(eq(phoneUsers.phone, phone))
      .limit(1);

    if (!phoneUser || phoneUser.length === 0) {
      return null;
    }

    // Find linked OAuth account
    const link = await db
      .select()
      .from(accountLinks)
      .where(
        and(
          eq(accountLinks.phoneUserId, phoneUser[0].id),
          eq(accountLinks.status, "active"),
          eq(accountLinks.isVerified, "true")
        )
      )
      .limit(1);

    if (!link || link.length === 0) {
      return null;
    }

    // Get OAuth user
    const oauthUser = await db
      .select()
      .from(users)
      .where(eq(users.id, link[0].userId || 0))
      .limit(1);

    return oauthUser && oauthUser.length > 0 ? oauthUser[0] : null;
  } catch (error: any) {
    console.error("[Account Linking] Find user by phone error:", error);
    throw error;
  }
}

/**
 * Find user by linked email
 */
export async function findUserByLinkedEmail(email: string) {
  const db = await getDb();
  if (!db) throw new Error("Database connection failed");

  try {
    // Find phoneUser by email
    const phoneUser = await db
      .select()
      .from(phoneUsers)
      .where(eq(phoneUsers.email, email))
      .limit(1);

    if (!phoneUser || phoneUser.length === 0) {
      return null;
    }

    // Find linked OAuth account
    const link = await db
      .select()
      .from(accountLinks)
      .where(
        and(
          eq(accountLinks.phoneUserId, phoneUser[0].id),
          eq(accountLinks.status, "active"),
          eq(accountLinks.isVerified, "true")
        )
      )
      .limit(1);

    if (!link || link.length === 0) {
      return null;
    }

    // Get OAuth user
    const oauthUser = await db
      .select()
      .from(users)
      .where(eq(users.id, link[0].userId || 0))
      .limit(1);

    return oauthUser && oauthUser.length > 0 ? oauthUser[0] : null;
  } catch (error: any) {
    console.error("[Account Linking] Find user by email error:", error);
    throw error;
  }
}
