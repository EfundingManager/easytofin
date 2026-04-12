import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin", "manager", "staff"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Phone-based user registration with 2FA
 */
export const phoneUsers = mysqlTable("phoneUsers", {
  id: int("id").autoincrement().primaryKey(),
  phone: varchar("phone", { length: 20 }).unique(),
  email: varchar("email", { length: 320 }),
  name: text("name"),
  address: text("address"),
  passwordHash: text("passwordHash"),
  twoFactorEnabled: mysqlEnum("twoFactorEnabled", ["true", "false"]).default("false").notNull(),
  twoFactorSecret: text("twoFactorSecret"),
  verified: mysqlEnum("verified", ["true", "false"]).default("false").notNull(),
  emailVerified: mysqlEnum("emailVerified", ["true", "false"]).default("false").notNull(),
  role: mysqlEnum("role", ["user", "admin", "manager", "staff"]).default("user").notNull(),
  googleId: varchar("googleId", { length: 255 }),
  picture: text("picture"),
  loginMethod: varchar("loginMethod", { length: 64 }),
  clientStatus: mysqlEnum("clientStatus", ["queue", "in_progress", "assigned", "customer"]).default("queue").notNull(),
  kycStatus: mysqlEnum("kycStatus", ["pending", "submitted", "verified", "rejected"]).default("pending").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn"),
});

export type PhoneUser = typeof phoneUsers.$inferSelect;
export type InsertPhoneUser = typeof phoneUsers.$inferInsert;

/**
 * OTP verification codes for 2FA
 */
export const otpCodes = mysqlTable("otpCodes", {
  id: int("id").autoincrement().primaryKey(),
  phoneUserId: int("phoneUserId").notNull(),
  code: varchar("code", { length: 6 }).notNull(),
  expiresAt: timestamp("expiresAt").notNull(),
  attempts: int("attempts").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type OtpCode = typeof otpCodes.$inferSelect;
export type InsertOtpCode = typeof otpCodes.$inferInsert;

/**
 * User product selection and preferences
 */
export const userProducts = mysqlTable("userProducts", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId"),
  phoneUserId: int("phoneUserId"),
  product: mysqlEnum("product", ["protection", "pensions", "healthInsurance", "generalInsurance", "investments"]).notNull(),
  selectedAt: timestamp("selectedAt").defaultNow().notNull(),
  status: mysqlEnum("status", ["selected", "in_progress", "completed", "abandoned"]).default("selected").notNull(),
});

export type UserProduct = typeof userProducts.$inferSelect;
export type InsertUserProduct = typeof userProducts.$inferInsert;

/**
 * Fact-finding form submissions
 */
export const factFindingForms = mysqlTable("factFindingForms", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId"),
  phoneUserId: int("phoneUserId"),
  policyNumber: varchar("policyNumber", { length: 100 }).unique(),
  product: mysqlEnum("product", ["protection", "pensions", "healthInsurance", "generalInsurance", "investments"]).notNull(),
  formData: text("formData"),
  status: mysqlEnum("status", ["draft", "submitted", "reviewed", "archived"]).default("draft").notNull(),
  submittedAt: timestamp("submittedAt"),
  policyAssignedAt: timestamp("policyAssignedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type FactFindingForm = typeof factFindingForms.$inferSelect;
export type InsertFactFindingForm = typeof factFindingForms.$inferInsert;

/**
 * Policy assignments linking clients to their policies
 */
export const policyAssignments = mysqlTable("policyAssignments", {
  id: int("id").autoincrement().primaryKey(),
  phoneUserId: int("phoneUserId").notNull(),
  policyNumber: varchar("policyNumber", { length: 100 }).notNull().unique(),
  product: mysqlEnum("product", ["protection", "pensions", "healthInsurance", "generalInsurance", "investments"]).notNull(),
  insurerName: varchar("insurerName", { length: 255 }),
  premiumAmount: varchar("premiumAmount", { length: 50 }),
  startDate: timestamp("startDate"),
  endDate: timestamp("endDate"),
  advisorName: varchar("advisorName", { length: 255 }),
  advisorPhone: varchar("advisorPhone", { length: 20 }),
  notes: text("notes"),
  assignedAt: timestamp("assignedAt").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type PolicyAssignment = typeof policyAssignments.$inferSelect;
export type InsertPolicyAssignment = typeof policyAssignments.$inferInsert;

/**
 * Email verification tokens for profile confirmation
 */
export const emailVerificationTokens = mysqlTable("emailVerificationTokens", {
  id: int("id").autoincrement().primaryKey(),
  phoneUserId: int("phoneUserId").notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  token: varchar("token", { length: 255 }).notNull().unique(),
  expiresAt: timestamp("expiresAt").notNull(),
  verifiedAt: timestamp("verifiedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type EmailVerificationToken = typeof emailVerificationTokens.$inferSelect;
export type InsertEmailVerificationToken = typeof emailVerificationTokens.$inferInsert;

/**
 * Client documents for KYC and supporting documentation
 */
export const clientDocuments = mysqlTable("clientDocuments", {
  id: int("id").autoincrement().primaryKey(),
  phoneUserId: int("phoneUserId").notNull().references(() => phoneUsers.id, { onDelete: "cascade" }),
  documentType: varchar("documentType", { length: 100 }).notNull(), // e.g., "ID", "ProofOfIncome", "BankStatement"
  fileName: varchar("fileName", { length: 255 }).notNull(),
  fileUrl: text("fileUrl").notNull(),
  fileKey: varchar("fileKey", { length: 500 }).notNull(), // S3 key for reference
  mimeType: varchar("mimeType", { length: 100 }),
  fileSize: int("fileSize"), // in bytes
  uploadedAt: timestamp("uploadedAt").defaultNow().notNull(),
  expiresAt: timestamp("expiresAt"), // optional expiration for temporary documents
  status: mysqlEnum("status", ["pending", "verified", "rejected"]).default("pending").notNull(),
  notes: text("notes"), // admin notes about the document
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ClientDocument = typeof clientDocuments.$inferSelect;
export type InsertClientDocument = typeof clientDocuments.$inferInsert;

/**
 * Rate limit violation logs for admin monitoring
 */
export const rateLimitLogs = mysqlTable("rateLimitLogs", {
  id: int("id").autoincrement().primaryKey(),
  identifier: varchar("identifier", { length: 320 }).notNull(), // phone number or email
  identifierType: mysqlEnum("identifierType", ["phone", "email"]).notNull(),
  violationType: mysqlEnum("violationType", ["send_otp", "verify_otp"]).notNull(),
  attemptCount: int("attemptCount").default(1).notNull(),
  ipAddress: varchar("ipAddress", { length: 45 }), // IPv4 or IPv6
  userAgent: text("userAgent"),
  isWhitelisted: mysqlEnum("isWhitelisted", ["true", "false"]).default("false").notNull(),
  resolvedAt: timestamp("resolvedAt"),
  resolvedBy: int("resolvedBy"), // admin user ID who resolved it
  notes: text("notes"), // admin notes
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type RateLimitLog = typeof rateLimitLogs.$inferSelect;
export type InsertRateLimitLog = typeof rateLimitLogs.$inferInsert;
