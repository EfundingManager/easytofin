import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import { phoneUsers } from "./drizzle/schema";
import { eq } from "drizzle-orm";

const connection = await mysql.createConnection(process.env.DATABASE_URL!);
const db = drizzle(connection);

const admins = await db.select().from(phoneUsers).where(eq(phoneUsers.role, "admin"));

console.log("Admin Users:");
console.log("============");
admins.forEach(admin => {
  console.log(`ID: ${admin.id}`);
  console.log(`Name: ${admin.name}`);
  console.log(`Email: ${admin.email}`);
  console.log(`Role: ${admin.role}`);
  console.log(`Login Method: ${admin.loginMethod}`);
  console.log(`---`);
});

await connection.end();
