import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import { phoneUsers } from "./drizzle/schema";
import { eq } from "drizzle-orm";

const connection = await mysql.createConnection(process.env.DATABASE_URL!);
const db = drizzle(connection);

console.log("Promoting users to their final roles...\n");

// Update manager@easytofin.com to super_admin
try {
  await db
    .update(phoneUsers)
    .set({ role: "super_admin" })
    .where(eq(phoneUsers.email, "manager@easytofin.com"));
  console.log("✅ Promoted manager@easytofin.com to super_admin");
} catch (e) {
  console.log("❌ Failed:", (e as any).message);
}

// Keep info@easytofin.com as admin
console.log("✅ info@easytofin.com remains as admin");

// Show final result
console.log("\n📋 Final User Roles:");
const manager = await db
  .select()
  .from(phoneUsers)
  .where(eq(phoneUsers.email, "manager@easytofin.com"));

const info = await db
  .select()
  .from(phoneUsers)
  .where(eq(phoneUsers.email, "info@easytofin.com"));

console.log("\nManager account:");
if (manager.length > 0) {
  console.log(`  Email: ${manager[0].email}`);
  console.log(`  Name: ${manager[0].name}`);
  console.log(`  Role: ${manager[0].role}`);
  console.log(`  2FA Enabled: ${manager[0].twoFactorEnabled}`);
}

console.log("\nInfo account:");
if (info.length > 0) {
  console.log(`  Email: ${info[0].email}`);
  console.log(`  Name: ${info[0].name}`);
  console.log(`  Role: ${info[0].role}`);
  console.log(`  2FA Enabled: ${info[0].twoFactorEnabled}`);
}

await connection.end();
