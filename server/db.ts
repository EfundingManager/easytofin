import { eq, and } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, phoneUsers, InsertPhoneUser, PhoneUser, otpCodes, InsertOtpCode, OtpCode, InsertClientDocument, ClientDocument, clientDocuments } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// Phone User Authentication Helpers
export async function createPhoneUser(data: InsertPhoneUser): Promise<PhoneUser> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  try {
    // Use upsert pattern: insert or update if phone already exists
    await db.insert(phoneUsers).values(data).onDuplicateKeyUpdate({
      set: {
        email: data.email,
        name: data.name,
        address: data.address,
        picture: data.picture,
        loginMethod: data.loginMethod,
      }
    });
    
    // Retrieve the user by phone number or email
    if (data.phone) {
      const user = await getPhoneUserByPhone(data.phone);
      if (user) {
        return user;
      }
    }
    
    if (data.email) {
      const user = await getPhoneUserByEmail(data.email);
      if (user) {
        return user;
      }
    }
    
    throw new Error("Failed to create or retrieve phone user");
  } catch (error: any) {
    console.error("[Phone Auth] Error creating phone user:", error);
    throw error;
  }
}

export async function getPhoneUserByPhone(phone: string): Promise<PhoneUser | undefined> {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(phoneUsers).where(eq(phoneUsers.phone, phone)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getPhoneUserByEmail(email: string): Promise<PhoneUser | undefined> {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(phoneUsers).where(eq(phoneUsers.email, email)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getPhoneUserById(id: number): Promise<PhoneUser | undefined> {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(phoneUsers).where(eq(phoneUsers.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getPhoneUserByGoogleId(googleId: string): Promise<PhoneUser | undefined> {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(phoneUsers).where(eq(phoneUsers.googleId, googleId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updatePhoneUser(id: number, data: Partial<InsertPhoneUser>): Promise<PhoneUser | undefined> {
  const db = await getDb();
  if (!db) return undefined;

  await db.update(phoneUsers).set(data).where(eq(phoneUsers.id, id));
  return getPhoneUserById(id);
}

// OTP Code Helpers
export async function createOtpCode(data: InsertOtpCode): Promise<OtpCode> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  try {
    console.log("[OTP] Creating OTP code with data:", { ...data, code: '***' });
    
    const result = await db.insert(otpCodes).values(data);
    console.log("[OTP] Insert result:", result);
    
    const insertedId = (result as any).insertId || (result as any)[0]?.insertId;
    
    if (!insertedId) {
      console.error("[OTP] No insertId in result:", result);
      // Try to find the most recent OTP for this phoneUserId
      const recentOtps = await db.select().from(otpCodes)
        .where(eq(otpCodes.phoneUserId, data.phoneUserId))
        .orderBy((t) => t.id)
        .limit(1);
      
      if (recentOtps.length > 0) {
        console.log("[OTP] Found recent OTP, returning it");
        return recentOtps[0];
      }
      
      throw new Error("Failed to get inserted OTP ID");
    }
    
    const otp = await db.select().from(otpCodes).where(eq(otpCodes.id, insertedId)).limit(1);
    if (!otp.length) {
      console.error(`[OTP] Failed to retrieve OTP with ID ${insertedId} after insertion`);
      throw new Error("Failed to retrieve created OTP code");
    }
    
    return otp[0];
  } catch (error) {
    console.error("[OTP] Error in createOtpCode:", error);
    throw error;
  }
}

export async function getValidOtpCode(phoneUserId: number, code: string): Promise<OtpCode | undefined> {
  const db = await getDb();
  if (!db) return undefined;

  const now = new Date();
  const result = await db.select()
    .from(otpCodes)
    .where(and(
      eq(otpCodes.phoneUserId, phoneUserId),
      eq(otpCodes.code, code)
    ))
    .limit(1);

  if (result.length === 0) return undefined;
  
  const otp = result[0];
  if (otp.expiresAt < now) return undefined;
  
  return otp;
}

export async function incrementOtpAttempts(id: number): Promise<void> {
  const db = await getDb();
  if (!db) return;

  const otp = await db.select().from(otpCodes).where(eq(otpCodes.id, id)).limit(1);
  if (otp.length > 0) {
    await db.update(otpCodes).set({ attempts: (otp[0].attempts || 0) + 1 }).where(eq(otpCodes.id, id));
  }
}

export async function deleteOtpCode(id: number): Promise<void> {
  const db = await getDb();
  if (!db) return;

  await db.delete(otpCodes).where(eq(otpCodes.id, id));
}


// Client Documents (KYC) Helpers
export async function createClientDocument(data: InsertClientDocument): Promise<ClientDocument> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const result = await db.insert(clientDocuments).values(data);
  const insertedId = (result as any).insertId;
  
  const inserted = await db.select().from(clientDocuments).where(eq(clientDocuments.id, insertedId)).limit(1);
  if (inserted.length === 0) {
    throw new Error("Failed to retrieve inserted document");
  }
  
  return inserted[0];
}

export async function getClientDocuments(phoneUserId: number): Promise<ClientDocument[]> {
  const db = await getDb();
  if (!db) {
    return [];
  }

  return await db.select().from(clientDocuments).where(eq(clientDocuments.phoneUserId, phoneUserId));
}

export async function getClientDocumentById(documentId: number): Promise<ClientDocument | undefined> {
  const db = await getDb();
  if (!db) {
    return undefined;
  }

  const result = await db.select().from(clientDocuments).where(eq(clientDocuments.id, documentId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateClientDocument(documentId: number, updates: Partial<ClientDocument>): Promise<void> {
  const db = await getDb();
  if (!db) return;

  await db.update(clientDocuments).set(updates).where(eq(clientDocuments.id, documentId));
}

export async function deleteClientDocument(documentId: number): Promise<void> {
  const db = await getDb();
  if (!db) return;

  await db.delete(clientDocuments).where(eq(clientDocuments.id, documentId));
}

export async function getClientDocumentsByStatus(phoneUserId: number, status: "pending" | "verified" | "rejected"): Promise<ClientDocument[]> {
  const db = await getDb();
  if (!db) {
    return [];
  }

  return await db.select().from(clientDocuments).where(
    and(
      eq(clientDocuments.phoneUserId, phoneUserId),
      eq(clientDocuments.status, status)
    )
  );
}

