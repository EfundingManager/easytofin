import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import { phoneUsers } from "./drizzle/schema";
import { eq } from "drizzle-orm";

const connection = await mysql.createConnection(process.env.DATABASE_URL!);
const db = drizzle(connection);

console.log("Checking existing users...");
const existingUsers = await db
  .select()
  .from(phoneUsers)
  .where(
    eq(phoneUsers.email, "manager@easytofin.com")
  );

console.log("Existing manager user:", existingUsers);

// Create or update manager@easytofin.com as super_admin
try {
  if (existingUsers.length === 0) {
    console.log("Creating manager@easytofin.com as super_admin...");
    await db.insert(phoneUsers).values({
      email: "manager@easytofin.com",
      name: "Manager",
      role: "super_admin",
      emailVerified: "true",
      clientStatus: "active",
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  } else {
    console.log("Updating manager@easytofin.com to super_admin...");
    await db
      .update(phoneUsers)
      .set({ role: "super_admin" })
      .where(eq(phoneUsers.email, "manager@easytofin.com"));
  }
} catch (e) {
  console.log("Manager user might already exist, updating role...");
  await db
    .update(phoneUsers)
    .set({ role: "super_admin" })
    .where(eq(phoneUsers.email, "manager@easytofin.com"));
}

// Create or update info@easytofin.com as admin
try {
  const infoUsers = await db
    .select()
    .from(phoneUsers)
    .where(eq(phoneUsers.email, "info@easytofin.com"));

  if (infoUsers.length === 0) {
    console.log("Creating info@easytofin.com as admin...");
    await db.insert(phoneUsers).values({
      email: "info@easytofin.com",
      name: "Info EFunding",
      role: "admin",
      emailVerified: "true",
      clientStatus: "active",
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  } else {
    console.log("Updating info@easytofin.com to admin...");
    await db
      .update(phoneUsers)
      .set({ role: "admin" })
      .where(eq(phoneUsers.email, "info@easytofin.com"));
  }
} catch (e) {
  console.log("Info user might already exist, updating role...");
  await db
    .update(phoneUsers)
    .set({ role: "admin" })
    .where(eq(phoneUsers.email, "info@easytofin.com"));
}

// Show final result
console.log("\nFinal user roles:");
const finalUsers = await db
  .select()
  .from(phoneUsers)
  .where(
    eq(phoneUsers.email, "manager@easytofin.com")
  );

const finalInfo = await db
  .select()
  .from(phoneUsers)
  .where(eq(phoneUsers.email, "info@easytofin.com"));

console.log("Manager:", finalUsers);
console.log("Info:", finalInfo);

await connection.end();
