import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const connection = await mysql.createConnection({
  host: process.env.DATABASE_URL?.split('@')[1]?.split('/')[0] || 'localhost',
  user: process.env.DATABASE_URL?.split('://')[1]?.split(':')[0] || 'root',
  password: process.env.DATABASE_URL?.split(':')[2]?.split('@')[0] || '',
  database: process.env.DATABASE_URL?.split('/')[3] || 'test',
});

// Find test users
const [testUsers] = await connection.query(`
  SELECT id, email, name FROM user 
  WHERE email LIKE '%test%' 
  OR email LIKE '%verify%' 
  OR email LIKE '%otp%' 
  OR email LIKE '%demo%' 
  OR email LIKE '%example%'
`);

console.log(`Found ${testUsers.length} test users:`);
testUsers.forEach(user => {
  console.log(`- ${user.email} (ID: ${user.id}, Name: ${user.name})`);
});

if (testUsers.length > 0) {
  console.log('\nDeleting test users...');
  const userIds = testUsers.map(u => u.id);
  
  // Delete related records first (foreign key constraints)
  await connection.query('DELETE FROM form WHERE userId IN (?)', [userIds]);
  await connection.query('DELETE FROM policy WHERE userId IN (?)', [userIds]);
  await connection.query('DELETE FROM document WHERE userId IN (?)', [userIds]);
  
  // Delete users
  await connection.query('DELETE FROM user WHERE id IN (?)', [userIds]);
  
  console.log(`✓ Deleted ${testUsers.length} test users and their related records`);
}

await connection.end();
