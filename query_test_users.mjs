import { db } from "./server/db.js";
import { users } from "./drizzle/schema.js";
import { like } from "drizzle-orm";

// Find all test users (emails containing 'test', 'verify', 'otp', etc.)
const testUsers = await db
  .select()
  .from(users)
  .where(
    like(users.email, "%test%") ||
    like(users.email, "%verify%") ||
    like(users.email, "%otp%") ||
    like(users.email, "%demo%") ||
    like(users.email, "%example%")
  );

console.log(`Found ${testUsers.length} test users:`);
testUsers.forEach(user => {
  console.log(`- ${user.email} (ID: ${user.id}, Name: ${user.name})`);
});
