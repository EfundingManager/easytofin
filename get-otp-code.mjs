import { getDb } from './server/db.ts';
import { phoneUsers, emailVerificationTokens } from './drizzle/schema.ts';
import { eq } from 'drizzle-orm';

const db = await getDb();

if (!db) {
  console.error('Failed to connect to database');
  process.exit(1);
}

// Get the admin user
const admin = await db.select().from(phoneUsers).where(eq(phoneUsers.email, 'admin-1776821192744@easytofin.com'));

if (!admin || admin.length === 0) {
  console.error('Admin user not found');
  process.exit(1);
}

const adminUser = admin[0];
console.log('Found admin user:', adminUser.id, adminUser.email);

// Get the latest verification token for this user
const tokens = await db.select().from(emailVerificationTokens).where(eq(emailVerificationTokens.phoneUserId, adminUser.id));

if (tokens.length > 0) {
  const latestToken = tokens.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
  console.log('Latest OTP code:', latestToken.token);
  console.log('Expires at:', latestToken.expiresAt);
} else {
  console.log('No OTP tokens found for this user');
}
