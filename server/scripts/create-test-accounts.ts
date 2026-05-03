/**
 * Script to create test accounts for all roles
 * Run with: npx tsx server/scripts/create-test-accounts.ts
 */

import { getDb } from "../db";
import { phoneUsers } from "../../drizzle/schema";
import { eq } from "drizzle-orm";

interface TestAccount {
  email: string;
  name: string;
  role: "super_admin" | "admin" | "manager" | "staff" | "support" | "user" | "customer";
  googleId: string;
}

const testAccounts: TestAccount[] = [
  {
    email: "superadmin-test@easytofin.com",
    name: "Super Admin Test",
    role: "super_admin",
    googleId: "superadmin-test-id-123",
  },
  {
    email: "admin-test@easytofin.com",
    name: "Admin Test",
    role: "admin",
    googleId: "admin-test-id-123",
  },
  {
    email: "manager-test@easytofin.com",
    name: "Manager Test",
    role: "manager",
    googleId: "manager-test-id-123",
  },
  {
    email: "staff-test@easytofin.com",
    name: "Staff Test",
    role: "staff",
    googleId: "staff-test-id-123",
  },
  {
    email: "support-test@easytofin.com",
    name: "Support Test",
    role: "support",
    googleId: "support-test-id-123",
  },
  {
    email: "user-test@easytofin.com",
    name: "User Test",
    role: "user",
    googleId: "user-test-id-123",
  },
  {
    email: "customer-test@easytofin.com",
    name: "Customer Test",
    role: "customer",
    googleId: "customer-test-id-123",
  },
];

async function main() {
  console.log("Starting test account creation...\n");

  const db = await getDb();
  if (!db) {
    console.error("❌ Database connection failed");
    process.exit(1);
  }

  let created = 0;
  let skipped = 0;
  let failed = 0;

  for (const account of testAccounts) {
    try {
      // Check if account already exists
      const existing = await db
        .select({ id: phoneUsers.id })
        .from(phoneUsers)
        .where(eq(phoneUsers.email, account.email))
        .limit(1);

      if (existing.length > 0) {
        console.log(`⏭️  SKIP: ${account.role.padEnd(12)} | ${account.email}`);
        skipped++;
        continue;
      }

      // Create new account
      const result = await db.insert(phoneUsers).values({
        email: account.email,
        name: account.name,
        role: account.role,
        googleId: account.googleId,
        emailVerified: "true",
        verified: "true",
        loginMethod: "google",
        clientStatus: account.role === "customer" ? "customer" : "queue",
        kycStatus: "pending",
      });

      console.log(`✅ CREATE: ${account.role.padEnd(12)} | ${account.email}`);
      created++;
    } catch (error: any) {
      console.error(`❌ ERROR:  ${account.role.padEnd(12)} | ${account.email}`);
      console.error(`   ${error.message}`);
      failed++;
    }
  }

  console.log("\n" + "=".repeat(70));
  console.log(`Results: ${created} created, ${skipped} skipped, ${failed} failed`);
  console.log("=".repeat(70));

  if (failed === 0) {
    console.log("✅ Test account setup completed successfully!");
  } else {
    console.log("⚠️  Some accounts failed to create. Check errors above.");
  }

  process.exit(failed > 0 ? 1 : 0);
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
