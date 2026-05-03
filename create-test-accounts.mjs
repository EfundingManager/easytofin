import { drizzle } from "drizzle-orm/mysql2";
import { phoneUsers } from "./drizzle/schema.js";
import mysql from "mysql2/promise";

const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) {
  console.error("DATABASE_URL not set");
  process.exit(1);
}

const connection = await mysql.createConnection(dbUrl);
const db = drizzle(connection);

const testAccounts = [
  { email: "superadmin-test@easytofin.com", name: "Super Admin Test", role: "super_admin", googleId: "superadmin-test-id" },
  { email: "admin-test@easytofin.com", name: "Admin Test", role: "admin", googleId: "admin-test-id" },
  { email: "manager-test@easytofin.com", name: "Manager Test", role: "manager", googleId: "manager-test-id" },
  { email: "staff-test@easytofin.com", name: "Staff Test", role: "staff", googleId: "staff-test-id" },
  { email: "support-test@easytofin.com", name: "Support Test", role: "support", googleId: "support-test-id" },
  { email: "user-test@easytofin.com", name: "User Test", role: "user", googleId: "user-test-id" },
  { email: "customer-test@easytofin.com", name: "Customer Test", role: "customer", googleId: "customer-test-id" },
];

console.log("Creating test accounts...");

for (const account of testAccounts) {
  try {
    const existing = await db.select().from(phoneUsers).where((u) => u.email === account.email).limit(1);
    
    if (existing.length > 0) {
      console.log(`✓ ${account.role}: ${account.email} already exists (ID: ${existing[0].id})`);
    } else {
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
      console.log(`✓ Created ${account.role}: ${account.email}`);
    }
  } catch (error) {
    console.error(`✗ Error creating ${account.role}:`, error.message);
  }
}

console.log("\nTest accounts setup complete!");
await connection.end();
