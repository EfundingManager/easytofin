import mysql from "mysql2/promise";

const connection = await mysql.createConnection(process.env.DATABASE_URL!);

console.log("Applying super_admin role migration...\n");

try {
  // First migration: phoneUsers table
  await connection.query(
    "ALTER TABLE `phoneUsers` MODIFY COLUMN `role` enum('user','admin','manager','staff','super_admin') NOT NULL DEFAULT 'user'"
  );
  console.log("✅ Updated phoneUsers.role enum");

  // Second migration: users table
  await connection.query(
    "ALTER TABLE `users` MODIFY COLUMN `role` enum('user','admin','manager','staff','super_admin') NOT NULL DEFAULT 'user'"
  );
  console.log("✅ Updated users.role enum");

  // Verify the changes
  const [rows] = await connection.query(
    "SELECT COLUMN_TYPE FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'phoneUsers' AND COLUMN_NAME = 'role' AND TABLE_SCHEMA = DATABASE()"
  );
  console.log("\n✅ Migration successful!");
  console.log("phoneUsers.role column type:", (rows as any)[0]?.COLUMN_TYPE);

} catch (e) {
  console.log("❌ Migration failed:", (e as any).message);
}

await connection.end();
