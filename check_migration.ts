import mysql from "mysql2/promise";

const connection = await mysql.createConnection(process.env.DATABASE_URL!);

// Get column info for role in phoneUsers
const [rows] = await connection.query(
  "SELECT COLUMN_TYPE FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'phoneUsers' AND COLUMN_NAME = 'role' AND TABLE_SCHEMA = DATABASE()"
);

console.log("phoneUsers.role column type:");
console.log((rows as any)[0]?.COLUMN_TYPE || "Not found");

// Try to update with super_admin using raw SQL
try {
  const [result] = await connection.query(
    "UPDATE phoneUsers SET role = 'super_admin' WHERE email = 'manager@easytofin.com'"
  );
  console.log("\n✅ Direct SQL update successful!");
  console.log("Rows affected:", (result as any).affectedRows);
} catch (e) {
  console.log("\n❌ Direct SQL update failed:", (e as any).message);
}

// Check final role
const [finalRows] = await connection.query(
  "SELECT email, role FROM phoneUsers WHERE email = 'manager@easytofin.com'"
);
console.log("\nFinal role:", (finalRows as any)[0]?.role || "Not found");

await connection.end();
