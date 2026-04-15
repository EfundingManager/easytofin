import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import { phoneUsers } from "./drizzle/schema";
import { eq } from "drizzle-orm";

const connection = await mysql.createConnection(process.env.DATABASE_URL!);
const db = drizzle(connection);

console.log("Updating user roles...\n");

// Update manager@easytofin.com to admin (will be promoted to super_admin later)
try {
  const result1 = await db
    .update(phoneUsers)
    .set({ role: "admin" })
    .where(eq(phoneUsers.email, "manager@easytofin.com"));
  console.log("✅ Updated manager@easytofin.com to admin");
} catch (e) {
  console.log("❌ Failed to update manager@easytofin.com:", (e as any).message);
}

// Update info@easytofin.com to admin
try {
  const result2 = await db
    .update(phoneUsers)
    .set({ role: "admin" })
    .where(eq(phoneUsers.email, "info@easytofin.com"));
  console.log("✅ Updated info@easytofin.com to admin");
} catch (e) {
  console.log("❌ Failed to update info@easytofin.com:", (e as any).message);
}

// Show final result
console.log("\nFinal user roles:");
const finalUsers = await db
  .select()
  .from(phoneUsers)
  .where(eq(phoneUsers.email, "manager@easytofin.com"));

const finalInfo = await db
  .select()
  .from(phoneUsers)
  .where(eq(phoneUsers.email, "info@easytofin.com"));

console.log("\nManager account:");
if (finalUsers.length > 0) {
  console.log(`  Email: ${finalUsers[0].email}`);
  console.log(`  Name: ${finalUsers[0].name}`);
  console.log(`  Role: ${finalUsers[0].role}`);
} else {
  console.log("  Not found");
}

console.log("\nInfo account:");
if (finalInfo.length > 0) {
  console.log(`  Email: ${finalInfo[0].email}`);
  console.log(`  Name: ${finalInfo[0].name}`);
  console.log(`  Role: ${finalInfo[0].role}`);
} else {
  console.log("  Not found");
}

await connection.end();
