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
  role: mysqlEnum("role", ["user", "admin", "manager", "staff", "support", "super_admin", "customer"]).default("user").notNull(),
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
  userId: int("userId"),
  phone: varchar("phone", { length: 20 }).unique(),
  email: varchar("email", { length: 320 }),
  name: text("name"),
  address: text("address"),

  twoFactorEnabled: mysqlEnum("twoFactorEnabled", ["true", "false"]).default("false").notNull(),
  twoFactorSecret: text("twoFactorSecret"),
  verified: mysqlEnum("verified", ["true", "false"]).default("false").notNull(),
  emailVerified: mysqlEnum("emailVerified", ["true", "false"]).default("false").notNull(),
  role: mysqlEnum("role", ["user", "admin", "manager", "staff", "support", "super_admin", "customer"]).default("user").notNull(),
  googleId: varchar("googleId", { length: 255 }),
  picture: text("picture"),
  loginMethod: varchar("loginMethod", { length: 64 }),
  clientStatus: mysqlEnum("clientStatus", ["queue", "in_progress", "assigned", "customer"]).default("queue").notNull(),
  kycStatus: mysqlEnum("kycStatus", ["pending", "submitted", "verified", "rejected"]).default("pending").notNull(),
  firstName: text("firstName"),
  lastName: text("lastName"),
  dateOfBirth: timestamp("dateOfBirth"),
  nationality: varchar("nationality", { length: 100 }),
  city: varchar("city", { length: 100 }),
  postalCode: varchar("postalCode", { length: 20 }),
  country: varchar("country", { length: 100 }),
  idType: varchar("idType", { length: 50 }),
  idNumber: varchar("idNumber", { length: 100 }),
  idIssueDate: timestamp("idIssueDate"),
  idExpiryDate: timestamp("idExpiryDate"),
  occupation: varchar("occupation", { length: 100 }),
  employerName: varchar("employerName", { length: 100 }),
  sourceOfIncome: varchar("sourceOfIncome", { length: 50 }),
  annualIncome: varchar("annualIncome", { length: 50 }),
  politicallyExposed: mysqlEnum("politicallyExposed", ["true", "false"]).default("false").notNull(),
  pepDetails: text("pepDetails"),
  kycSubmittedAt: timestamp("kycSubmittedAt"),
  kycVerifiedAt: timestamp("kycVerifiedAt"),
  kycRejectionReason: text("kycRejectionReason"),
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

/**
 * Feature flags for controlling feature visibility and behavior
 */
export const featureFlags = mysqlTable("featureFlags", {
  id: int("id").autoincrement().primaryKey(),
  flagName: varchar("flagName", { length: 100 }).notNull().unique(),
  description: text("description"),
  enabled: mysqlEnum("enabled", ["true", "false"]).default("false").notNull(),
  targetAudience: varchar("targetAudience", { length: 100 }).default("all"),
  rolloutPercentage: int("rolloutPercentage").default(100),
  metadata: text("metadata"),
  changedBy: int("changedBy"),
  changeReason: text("changeReason"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type FeatureFlag = typeof featureFlags.$inferSelect;
export type InsertFeatureFlag = typeof featureFlags.$inferInsert;


/**
 * Email templates for email blaster campaigns
 */
export const emailTemplates = mysqlTable("emailTemplates", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  subject: varchar("subject", { length: 255 }).notNull(),
  htmlContent: text("htmlContent").notNull(),
  plainTextContent: text("plainTextContent"),
  description: text("description"),
  category: mysqlEnum("category", ["kyc", "policy", "renewal", "welcome", "notification", "marketing", "other"]).default("other").notNull(),
  isPredefined: mysqlEnum("isPredefined", ["true", "false"]).default("true").notNull(),
  isActive: mysqlEnum("isActive", ["true", "false"]).default("true").notNull(),
  variables: text("variables"), // JSON array of variable names used in template
  createdBy: int("createdBy"),
  updatedBy: int("updatedBy"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type EmailTemplate = typeof emailTemplates.$inferSelect;
export type InsertEmailTemplate = typeof emailTemplates.$inferInsert;

/**
 * Application logs for monitoring and debugging
 */
export const applicationLogs = mysqlTable("applicationLogs", {
  id: int("id").autoincrement().primaryKey(),
  level: mysqlEnum("level", ["debug", "info", "warn", "error", "fatal"]).notNull(),
  message: text("message").notNull(),
  context: varchar("context", { length: 255 }), // e.g., "auth", "payment", "profile"
  userId: int("userId"), // optional: which user this log is related to
  phoneUserId: int("phoneUserId"), // optional: which phone user this log is related to
  requestId: varchar("requestId", { length: 255 }), // for tracing requests
  ipAddress: varchar("ipAddress", { length: 45 }), // IPv4 or IPv6
  userAgent: text("userAgent"),
  url: text("url"), // the URL that triggered this log
  method: varchar("method", { length: 10 }), // GET, POST, etc
  statusCode: int("statusCode"), // HTTP status code if applicable
  errorStack: text("errorStack"), // full error stack trace
  metadata: text("metadata"), // JSON object with additional context
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ApplicationLog = typeof applicationLogs.$inferSelect;
export type InsertApplicationLog = typeof applicationLogs.$inferInsert;

/**
 * Email blast campaigns
 */
export const emailBlasts = mysqlTable("emailBlasts", {
  id: int("id").autoincrement().primaryKey(),
  templateId: int("templateId").notNull(),
  campaignName: varchar("campaignName", { length: 255 }).notNull(),
  subject: varchar("subject", { length: 255 }).notNull(),
  recipientFilter: text("recipientFilter"), // JSON object for filtering recipients
  totalRecipients: int("totalRecipients").default(0),
  sentCount: int("sentCount").default(0),
  failedCount: int("failedCount").default(0),
  status: mysqlEnum("status", ["draft", "scheduled", "sending", "sent", "failed", "paused"]).default("draft").notNull(),
  scheduledAt: timestamp("scheduledAt"),
  sentAt: timestamp("sentAt"),
  createdBy: int("createdBy"),
  updatedBy: int("updatedBy"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type EmailBlast = typeof emailBlasts.$inferSelect;
export type InsertEmailBlast = typeof emailBlasts.$inferInsert;

/**
 * Email blast delivery tracking
 */
export const emailBlastDeliveries = mysqlTable("emailBlastDeliveries", {
  id: int("id").autoincrement().primaryKey(),
  blastId: int("blastId").notNull(),
  recipientId: int("recipientId").notNull(),
  recipientEmail: varchar("recipientEmail", { length: 320 }).notNull(),
  status: mysqlEnum("status", ["pending", "sent", "failed", "bounced", "opened", "clicked"]).default("pending").notNull(),
  sentAt: timestamp("sentAt"),
  failureReason: text("failureReason"),
  openedAt: timestamp("openedAt"),
  clickedAt: timestamp("clickedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type EmailBlastDelivery = typeof emailBlastDeliveries.$inferSelect;
export type InsertEmailBlastDelivery = typeof emailBlastDeliveries.$inferInsert;


/**
 * Recipient lists for email campaigns
 */
export const recipientLists = mysqlTable("recipientLists", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  recipientCount: int("recipientCount").default(0),
  createdBy: int("createdBy").notNull(),
  updatedBy: int("updatedBy").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type RecipientList = typeof recipientLists.$inferSelect;
export type InsertRecipientList = typeof recipientLists.$inferInsert;

/**
 * Individual recipients in recipient lists
 */
export const recipients = mysqlTable("recipients", {
  id: int("id").autoincrement().primaryKey(),
  listId: int("listId").notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  name: varchar("name", { length: 255 }),
  firstName: varchar("firstName", { length: 255 }),
  lastName: varchar("lastName", { length: 255 }),
  phone: varchar("phone", { length: 20 }),
  company: varchar("company", { length: 255 }),
  status: mysqlEnum("status", ["active", "inactive", "bounced", "unsubscribed"]).default("active").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Recipient = typeof recipients.$inferSelect;
export type InsertRecipient = typeof recipients.$inferInsert;


/**
 * Trusted devices for streamlined login
 * Stores device fingerprints and allows users to skip OTP on trusted devices
 */
export const trustedDevices = mysqlTable("trustedDevices", {
  id: int("id").autoincrement().primaryKey(),
  phoneUserId: int("phoneUserId").notNull(),
  deviceFingerprint: varchar("deviceFingerprint", { length: 255 }).notNull(),
  deviceName: varchar("deviceName", { length: 255 }).notNull(), // e.g., "Chrome on MacOS", "Safari on iPhone"
  deviceToken: varchar("deviceToken", { length: 255 }).notNull().unique(), // Unique token for device verification
  userAgent: text("userAgent"),
  ipAddress: varchar("ipAddress", { length: 45 }), // IPv4 or IPv6
  lastUsedAt: timestamp("lastUsedAt").defaultNow().notNull(),
  isActive: mysqlEnum("isActive", ["true", "false"]).default("true").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type TrustedDevice = typeof trustedDevices.$inferSelect;
export type InsertTrustedDevice = typeof trustedDevices.$inferInsert;

/**
 * Device verification tokens for secure device registration
 * Used to verify new devices before adding them to trusted devices
 */
export const deviceVerificationTokens = mysqlTable("deviceVerificationTokens", {
  id: int("id").autoincrement().primaryKey(),
  phoneUserId: int("phoneUserId").notNull(),
  token: varchar("token", { length: 255 }).notNull().unique(),
  deviceFingerprint: varchar("deviceFingerprint", { length: 255 }).notNull(),
  deviceName: varchar("deviceName", { length: 255 }).notNull(),
  userAgent: text("userAgent"),
  ipAddress: varchar("ipAddress", { length: 45 }),
  expiresAt: timestamp("expiresAt").notNull(),
  verified: mysqlEnum("verified", ["true", "false"]).default("false").notNull(),
  verifiedAt: timestamp("verifiedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type DeviceVerificationToken = typeof deviceVerificationTokens.$inferSelect;
export type InsertDeviceVerificationToken = typeof deviceVerificationTokens.$inferInsert;




/**
 * Login attempts tracking for account lockout mechanism
 * Tracks failed login attempts per phone/email to implement progressive lockout
 */
export const loginAttempts = mysqlTable("loginAttempts", {
  id: int("id").autoincrement().primaryKey(),
  phoneUserId: int("phoneUserId"),
  email: varchar("email", { length: 320 }),
  phone: varchar("phone", { length: 20 }),
  attemptType: mysqlEnum("attemptType", ["otp", "password", "google"]).notNull(),
  success: mysqlEnum("success", ["true", "false"]).notNull(),
  ipAddress: varchar("ipAddress", { length: 45 }),
  userAgent: text("userAgent"),
  failureReason: varchar("failureReason", { length: 255 }), // e.g., "invalid_otp", "account_locked"
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type LoginAttempt = typeof loginAttempts.$inferSelect;
export type InsertLoginAttempt = typeof loginAttempts.$inferInsert;

/**
 * Account lockout tracking
 * Stores lockout status and expiration for accounts with too many failed attempts
 */
export const accountLockouts = mysqlTable("accountLockouts", {
  id: int("id").autoincrement().primaryKey(),
  phoneUserId: int("phoneUserId"),
  email: varchar("email", { length: 320 }),
  phone: varchar("phone", { length: 20 }),
  failedAttempts: int("failedAttempts").default(0).notNull(),
  lockedUntil: timestamp("lockedUntil").notNull(), // When the lockout expires
  lockReason: varchar("lockReason", { length: 255 }).notNull(), // e.g., "max_failed_attempts"
  unlockedBy: varchar("unlockedBy", { length: 64 }), // Who unlocked it (admin user ID or "auto")
  unlockedAt: timestamp("unlockedAt"), // When it was unlocked
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type AccountLockout = typeof accountLockouts.$inferSelect;
export type InsertAccountLockout = typeof accountLockouts.$inferInsert;

/**
 * Security audit log for tracking all security-related events
 * Includes login attempts, lockouts, password changes, 2FA toggles, etc.
 */
export const securityAuditLog = mysqlTable("securityAuditLog", {
  id: int("id").autoincrement().primaryKey(),
  phoneUserId: int("phoneUserId"),
  email: varchar("email", { length: 320 }),
  phone: varchar("phone", { length: 20 }),
  eventType: mysqlEnum("eventType", [
    "login_success",
    "login_failed",
    "account_locked",
    "account_unlocked",
    "password_changed",
    "password_reset",
    "2fa_enabled",
    "2fa_disabled",
    "device_added",
    "device_removed",
    "session_terminated",
    "suspicious_activity"
  ]).notNull(),
  description: text("description"),
  ipAddress: varchar("ipAddress", { length: 45 }),
  userAgent: text("userAgent"),
  severity: mysqlEnum("severity", ["low", "medium", "high", "critical"]).default("low").notNull(),
  metadata: text("metadata"), // JSON object for additional context
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type SecurityAuditLog = typeof securityAuditLog.$inferSelect;
export type InsertSecurityAuditLog = typeof securityAuditLog.$inferInsert;

/**
 * Session activity tracking for detecting suspicious login/logout patterns
 * Used to detect account hijacking and session manipulation attacks
 */
export const sessionActivityLog = mysqlTable("sessionActivityLog", {
  id: int("id").autoincrement().primaryKey(),
  phoneUserId: int("phoneUserId"),
  userId: int("userId"),
  email: varchar("email", { length: 320 }),
  phone: varchar("phone", { length: 20 }),
  activityType: mysqlEnum("activityType", ["login", "logout", "session_created", "session_terminated"]).notNull(),
  ipAddress: varchar("ipAddress", { length: 45 }),
  userAgent: text("userAgent"),
  sessionId: varchar("sessionId", { length: 255 }),
  deviceFingerprint: varchar("deviceFingerprint", { length: 255 }),
  location: text("location"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type SessionActivityLog = typeof sessionActivityLog.$inferSelect;
export type InsertSessionActivityLog = typeof sessionActivityLog.$inferInsert;

/**
 * Suspicious activity lockouts for login/logout pattern abuse
 * Separate from failed OTP attempts - tracks session manipulation
 */
export const suspiciousActivityLockout = mysqlTable("suspiciousActivityLockout", {
  id: int("id").autoincrement().primaryKey(),
  phoneUserId: int("phoneUserId"),
  userId: int("userId"),
  email: varchar("email", { length: 320 }),
  phone: varchar("phone", { length: 20 }),
  lockoutReason: mysqlEnum("lockoutReason", [
    "excessive_login_logout",
    "rapid_location_change",
    "unusual_access_pattern",
    "concurrent_sessions",
  ]).notNull(),
  activityCount: int("activityCount").default(0).notNull(),
  timeWindowSeconds: int("timeWindowSeconds").default(120).notNull(),
  lockedAt: timestamp("lockedAt").defaultNow().notNull(),
  unlocksAt: timestamp("unlocksAt").notNull(),
  unlockReason: varchar("unlockReason", { length: 255 }),
  unlockedAt: timestamp("unlockedAt"),
  unlockedBy: varchar("unlockedBy", { length: 255 }),
  ipAddress: varchar("ipAddress", { length: 45 }),
  userAgent: text("userAgent"),
  metadata: text("metadata"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type SuspiciousActivityLockout = typeof suspiciousActivityLockout.$inferSelect;
export type InsertSuspiciousActivityLockout = typeof suspiciousActivityLockout.$inferInsert;

/**
 * IP-based rate limiting for brute force prevention
 * Tracks requests per IP address across all endpoints
 */
export const ipRateLimitLog = mysqlTable("ipRateLimitLog", {
  id: int("id").autoincrement().primaryKey(),
  ipAddress: varchar("ipAddress", { length: 45 }).notNull(), // IPv4 or IPv6
  endpoint: varchar("endpoint", { length: 255 }).notNull(), // e.g., /api/trpc/auth.verifyOtp
  requestCount: int("requestCount").default(1).notNull(),
  violationType: mysqlEnum("violationType", [
    "otp_verification",
    "otp_request",
    "login_attempt",
    "password_reset",
    "account_unlock_request",
  ]).notNull(),
  isBlocked: mysqlEnum("isBlocked", ["true", "false"]).default("false").notNull(),
  blockedUntil: timestamp("blockedUntil"),
  userAgent: text("userAgent"),
  firstRequestAt: timestamp("firstRequestAt").defaultNow().notNull(),
  lastRequestAt: timestamp("lastRequestAt").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type IpRateLimitLog = typeof ipRateLimitLog.$inferSelect;
export type InsertIpRateLimitLog = typeof ipRateLimitLog.$inferInsert;

/**
 * IP whitelist for trusted sources (corporate networks, partners, etc.)
 */
export const ipWhitelist = mysqlTable("ipWhitelist", {
  id: int("id").autoincrement().primaryKey(),
  ipAddress: varchar("ipAddress", { length: 45 }).notNull().unique(),
  ipRange: varchar("ipRange", { length: 100 }), // CIDR notation for IP ranges
  description: varchar("description", { length: 255 }),
  reason: mysqlEnum("reason", [
    "corporate_network",
    "partner_integration",
    "internal_testing",
    "api_partner",
    "other",
  ]).notNull(),
  addedBy: int("addedBy"),
  expiresAt: timestamp("expiresAt"),
  isActive: mysqlEnum("isActive", ["true", "false"]).default("true").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type IpWhitelist = typeof ipWhitelist.$inferSelect;
export type InsertIpWhitelist = typeof ipWhitelist.$inferInsert;

/**
 * IP blacklist for known attackers
 */
export const ipBlacklist = mysqlTable("ipBlacklist", {
  id: int("id").autoincrement().primaryKey(),
  ipAddress: varchar("ipAddress", { length: 45 }).notNull().unique(),
  ipRange: varchar("ipRange", { length: 100 }), // CIDR notation for IP ranges
  reason: mysqlEnum("reason", [
    "brute_force_attack",
    "credential_stuffing",
    "account_takeover_attempt",
    "ddos_attack",
    "malware_distribution",
    "spam",
    "manual_block",
    "other",
  ]).notNull(),
  severity: mysqlEnum("severity", ["low", "medium", "high", "critical"]).default("medium").notNull(),
  blockType: mysqlEnum("blockType", ["temporary", "permanent"]).default("temporary").notNull(),
  blockedUntil: timestamp("blockedUntil"),
  addedBy: int("addedBy"),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type IpBlacklist = typeof ipBlacklist.$inferSelect;
export type InsertIpBlacklist = typeof ipBlacklist.$inferInsert;

/**
 * IP reputation tracking for monitoring suspicious patterns
 */
export const ipReputation = mysqlTable("ipReputation", {
  id: int("id").autoincrement().primaryKey(),
  ipAddress: varchar("ipAddress", { length: 45 }).notNull().unique(),
  reputationScore: int("reputationScore").default(0).notNull(), // 0-100, lower is worse
  failedLoginAttempts: int("failedLoginAttempts").default(0).notNull(),
  successfulLogins: int("successfulLogins").default(0).notNull(),
  suspiciousActivityCount: int("suspiciousActivityCount").default(0).notNull(),
  lastSuspiciousActivity: timestamp("lastSuspiciousActivity"),
  countries: text("countries"), // JSON array of countries this IP accessed from
  devices: text("devices"), // JSON array of device fingerprints
  isHighRisk: mysqlEnum("isHighRisk", ["true", "false"]).default("false").notNull(),
  lastCheckedAt: timestamp("lastCheckedAt").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type IpReputation = typeof ipReputation.$inferSelect;
export type InsertIpReputation = typeof ipReputation.$inferInsert;


/**
 * TOTP (Time-based One-Time Password) secrets for MFA
 * Stores authenticator app secrets for users requiring MFA
 */
export const totpSecrets = mysqlTable("totpSecrets", {
  id: int("id").autoincrement().primaryKey(),
  phoneUserId: int("phoneUserId").notNull(),
  secret: varchar("secret", { length: 255 }).notNull(), // Base32 encoded TOTP secret
  backupCodes: text("backupCodes").notNull(), // JSON array of backup codes
  isEnabled: mysqlEnum("isEnabled", ["true", "false"]).default("false").notNull(),
  enabledAt: timestamp("enabledAt"),
  disabledAt: timestamp("disabledAt"),
  lastUsedAt: timestamp("lastUsedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type TotpSecret = typeof totpSecrets.$inferSelect;
export type InsertTotpSecret = typeof totpSecrets.$inferInsert;

/**
 * TOTP verification attempts tracking
 * Prevents brute force attacks on TOTP codes
 */
export const totpAttempts = mysqlTable("totpAttempts", {
  id: int("id").autoincrement().primaryKey(),
  phoneUserId: int("phoneUserId").notNull(),
  code: varchar("code", { length: 6 }).notNull(),
  isValid: mysqlEnum("isValid", ["true", "false"]).notNull(),
  ipAddress: varchar("ipAddress", { length: 45 }),
  userAgent: text("userAgent"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type TotpAttempt = typeof totpAttempts.$inferSelect;
export type InsertTotpAttempt = typeof totpAttempts.$inferInsert;

/**
 * IP-based login switch tracking
 * Tracks successful login switches (different user accounts) per IP
 * Used to limit account switching per IP to prevent account takeover
 */
export const ipLoginSwitches = mysqlTable("ipLoginSwitches", {
  id: int("id").autoincrement().primaryKey(),
  ipAddress: varchar("ipAddress", { length: 45 }).notNull(),
  phoneUserId: int("phoneUserId").notNull(),
  previousPhoneUserId: int("previousPhoneUserId"),
  switchCount: int("switchCount").default(1).notNull(),
  isBlocked: mysqlEnum("isBlocked", ["true", "false"]).default("false").notNull(),
  blockedUntil: timestamp("blockedUntil"),
  blockReason: varchar("blockReason", { length: 255 }),
  windowStartAt: timestamp("windowStartAt").defaultNow().notNull(),
  windowEndAt: timestamp("windowEndAt").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type IpLoginSwitch = typeof ipLoginSwitches.$inferSelect;
export type InsertIpLoginSwitch = typeof ipLoginSwitches.$inferInsert;

/**
 * Session tokens for tracking active sessions
 * Prevents session fixation and token reuse attacks
 */
export const sessionTokens = mysqlTable("sessionTokens", {
  id: int("id").autoincrement().primaryKey(),
  phoneUserId: int("phoneUserId").notNull(),
  token: varchar("token", { length: 255 }).notNull().unique(),
  tokenHash: varchar("tokenHash", { length: 255 }).notNull().unique(), // SHA256 hash of token
  ipAddress: varchar("ipAddress", { length: 45 }).notNull(),
  userAgent: text("userAgent"),
  deviceFingerprint: varchar("deviceFingerprint", { length: 255 }),
  isActive: mysqlEnum("isActive", ["true", "false"]).default("true").notNull(),
  isRevoked: mysqlEnum("isRevoked", ["true", "false"]).default("false").notNull(),
  revokedAt: timestamp("revokedAt"),
  revokedReason: varchar("revokedReason", { length: 255 }),
  expiresAt: timestamp("expiresAt").notNull(),
  lastActivityAt: timestamp("lastActivityAt").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type SessionToken = typeof sessionTokens.$inferSelect;
export type InsertSessionToken = typeof sessionTokens.$inferInsert;


/**
 * User roles junction table for multiple role assignments
 * Allows users to have multiple roles simultaneously
 */
export const userRoles = mysqlTable("userRoles", {
  id: int("id").autoincrement().primaryKey(),
  phoneUserId: int("phoneUserId").notNull().references(() => phoneUsers.id, { onDelete: "cascade" }),
  role: mysqlEnum("role", ["super_admin", "admin", "manager", "staff", "support", "user", "customer"]).notNull(),
  assignedBy: int("assignedBy"), // Admin user ID who assigned this role
  assignedAt: timestamp("assignedAt").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type UserRole = typeof userRoles.$inferSelect;
export type InsertUserRole = typeof userRoles.$inferInsert;

/**
 * TOTP 2FA audit log for tracking authentication events
 * Logs failed TOTP attempts, successful verifications, and role changes
 */
export const totp2faAuditLog = mysqlTable("totp2faAuditLog", {
  id: int("id").autoincrement().primaryKey(),
  phoneUserId: int("phoneUserId").notNull(),
  eventType: mysqlEnum("eventType", [
    "setup_initiated",
    "setup_completed",
    "verification_success",
    "verification_failed",
    "backup_code_used",
    "backup_code_failed",
    "reset_initiated",
    "reset_completed",
    "disabled",
  ]).notNull(),
  code: varchar("code", { length: 6 }), // TOTP code if applicable
  isValid: mysqlEnum("isValid", ["true", "false"]), // Whether the code was valid
  ipAddress: varchar("ipAddress", { length: 45 }),
  userAgent: text("userAgent"),
  description: text("description"), // Additional context
  metadata: text("metadata"), // JSON object with additional details
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Totp2faAuditLog = typeof totp2faAuditLog.$inferSelect;
export type InsertTotp2faAuditLog = typeof totp2faAuditLog.$inferInsert;

/**
 * First login tracking for TOTP 2FA setup enforcement
 * Tracks whether users have completed TOTP 2FA setup on first login
 */
export const firstLoginTracking = mysqlTable("firstLoginTracking", {
  id: int("id").autoincrement().primaryKey(),
  phoneUserId: int("phoneUserId").notNull().unique().references(() => phoneUsers.id, { onDelete: "cascade" }),
  hasCompletedFirstLogin: mysqlEnum("hasCompletedFirstLogin", ["true", "false"]).default("false").notNull(),
  requiresTOTP2FA: mysqlEnum("requiresTOTP2FA", ["true", "false"]).default("false").notNull(),
  totpSetupCompletedAt: timestamp("totpSetupCompletedAt"),
  firstLoginAt: timestamp("firstLoginAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type FirstLoginTracking = typeof firstLoginTracking.$inferSelect;
export type InsertFirstLoginTracking = typeof firstLoginTracking.$inferInsert;
