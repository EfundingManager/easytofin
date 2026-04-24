import { getDb } from './server/db.ts';
import { phoneUsers } from './drizzle/schema.ts';
import { eq } from 'drizzle-orm';

const db = await getDb();

if (!db) {
  console.error('Failed to connect to database');
  process.exit(1);
}

// Query for existing admin users
const admins = await db.select().from(phoneUsers).where(eq(phoneUsers.role, 'admin'));

if (admins.length > 0) {
  console.log('Found admin users:');
  admins.forEach(u => {
    console.log(`  - ${u.name} (${u.email || u.phone}) - Role: ${u.role}`);
  });
} else {
  console.log('No admin users found. Creating test admin user...');
  
  // Create a test admin user
  const testAdmin = await db.insert(phoneUsers).values({
    name: 'Test Admin',
    email: 'admin@test.easytofin.com',
    phone: '+353871234567',
    role: 'admin',
    clientStatus: 'customer',
    createdAt: new Date(),
  }).returning();
  
  console.log('Created test admin user:');
  console.log(`  Email: ${testAdmin[0].email}`);
  console.log(`  Phone: ${testAdmin[0].phone}`);
  console.log(`  Role: ${testAdmin[0].role}`);
}
