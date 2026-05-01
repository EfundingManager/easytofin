import { drizzle } from 'drizzle-orm/mysql2/http';
import { users } from './drizzle/schema.ts';
import { eq, ne } from 'drizzle-orm';

const db = drizzle(process.env.DATABASE_URL);

async function deleteAllClientsExceptSuperAdmin() {
  try {
    console.log('Fetching Super Admin user...');
    const superAdmin = await db.query.users.findFirst({
      where: (users, { eq }) => eq(users.email, 'admin@easytofin.com')
    });

    if (!superAdmin) {
      console.log('Super Admin not found. Checking for other admin accounts...');
      const admins = await db.query.users.findMany({
        where: (users, { eq }) => eq(users.role, 'admin')
      });
      console.log('Admin accounts:', admins.map(a => ({ id: a.id, email: a.email, name: a.name })));
      return;
    }

    console.log('Super Admin found:', { id: superAdmin.id, email: superAdmin.email, name: superAdmin.name });

    console.log('Deleting all users except Super Admin...');
    const result = await db.delete(users).where(ne(users.id, superAdmin.id));
    
    console.log('Deletion complete!');
    console.log('Remaining users:');
    const remaining = await db.query.users.findMany();
    remaining.forEach(u => {
      console.log(`  - ${u.name} (${u.email}) - Role: ${u.role}`);
    });
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

deleteAllClientsExceptSuperAdmin();
