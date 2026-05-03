import { getDb } from "./server/db";
import { phoneUsers } from "./drizzle/schema";
import { eq } from "drizzle-orm";

const testAccounts = [
  { email: "superadmin-test@easytofin.com", name: "Super Admin Test", role: "super_admin", googleId: "superadmin-test-id" },
  { email: "admin-test@easytofin.com", name: "Admin Test", role: "admin", googleId: "admin-test-id" },
  { email: "manager-test@easytofin.com", name: "Manager Test", role: "manager", googleId: "manager-test-id" },
  { email: "staff-test@easytofin.com", name: "Staff Test", role: "staff", googleId: "staff-test-id" },
  { email: "support-test@easytofin.com", name: "Support Test", role: "support", googleId: "support-test-id" },
  { email: "user-test@easytofin.com", name: "User Test", role: "user", googleId: "user-test-id" },
  { email: "customer-test@easytofin.com", name: "Customer Test", role: "customer", googleId: "customer-test-id" },
] as const;

async function main() {
  const db = await getDb();
  if (!db) {
    console.error("Database not available");
    process.exit(1);
  }

  console.log("Creating test accounts...\n");

  for (const account of testAccounts) {
    try {
      const existing = await db
        .select()
        .from(phoneUsers)
        .where(eq(phoneUsers.email, account.email))
        .limit(1);
      
      if (existing.length > 0) {
        console.log(`✓ ${account.role}: ${account.email} already exists (ID: ${existing[0].id})`);
      } else {
        await db.insert(phoneUsers).values({
          email: account.email,
          name: account.name,
          role: account.role as any,
          googleId: account.googleId,
          emailVerified: "true",
          verified: "true",
          loginMethod: "google",
          clientStatus: account.role === "customer" ? "customer" : "queue",
          kycStatus: "pending",
        });
        console.log(`✓ Created ${account.role}: ${account.email}`);
      }
    } catch (error: any) {
      console.error(`✗ Error creating ${account.role}:`, error.message);
    }
  }

  console.log("\nTest accounts setup complete!");
  process.exit(0);
}

main();
