import { db } from "./server/db.js";
import { users, forms, policies, documents } from "./drizzle/schema.js";
import { inArray, or, like } from "drizzle-orm";

try {
  // Find all test users
  const testUsers = await db
    .select({ id: users.id, email: users.email, name: users.name })
    .from(users)
    .where(
      or(
        like(users.email, "%test%"),
        like(users.email, "%verify%"),
        like(users.email, "%otp%"),
        like(users.email, "%demo%"),
        like(users.email, "%example%")
      )
    );

  console.log(`Found ${testUsers.length} test users:`);
  testUsers.forEach(user => {
    console.log(`  - ${user.email} (ID: ${user.id}, Name: ${user.name})`);
  });

  if (testUsers.length > 0) {
    const userIds = testUsers.map(u => u.id);
    
    console.log("\nDeleting related records...");
    
    // Delete forms
    const formsDeleted = await db
      .delete(forms)
      .where(inArray(forms.userId, userIds));
    console.log(`  ✓ Deleted forms`);
    
    // Delete policies
    const policiesDeleted = await db
      .delete(policies)
      .where(inArray(policies.userId, userIds));
    console.log(`  ✓ Deleted policies`);
    
    // Delete documents
    const documentsDeleted = await db
      .delete(documents)
      .where(inArray(documents.userId, userIds));
    console.log(`  ✓ Deleted documents`);
    
    // Delete users
    const usersDeleted = await db
      .delete(users)
      .where(inArray(users.id, userIds));
    console.log(`  ✓ Deleted users`);
    
    console.log(`\n✅ Successfully deleted ${testUsers.length} test users and all their related records`);
  } else {
    console.log("No test users found to delete");
  }
  
  process.exit(0);
} catch (error) {
  console.error("Error:", error.message);
  process.exit(1);
}
