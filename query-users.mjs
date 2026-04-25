import { createConnection } from 'mysql2/promise';

const connection = await createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'easytofin',
});

try {
  console.log('=== Users Table ===');
  const [users] = await connection.query('SELECT id, openId, name, email, role, loginMethod FROM users WHERE role = "admin" LIMIT 5');
  console.log(JSON.stringify(users, null, 2));

  console.log('\n=== PhoneUsers Table ===');
  const [phoneUsers] = await connection.query('SELECT id, googleId, email, name, role, loginMethod FROM phoneUsers WHERE role = "admin" LIMIT 5');
  console.log(JSON.stringify(phoneUsers, null, 2));

  console.log('\n=== Admin User (Info efunding) ===');
  const [adminUser] = await connection.query('SELECT * FROM phoneUsers WHERE email = "info@efunding.ie" LIMIT 1');
  console.log(JSON.stringify(adminUser, null, 2));
} finally {
  await connection.end();
}
