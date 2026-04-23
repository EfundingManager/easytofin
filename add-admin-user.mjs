import mysql from 'mysql2/promise';

async function addAdminUser() {
  let connection;
  try {
    // Create connection to database
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'easytofin',
    });

    // Check if user already exists
    const [existingUser] = await connection.execute(
      'SELECT id FROM phone_users WHERE email = ?',
      ['info@easytofin.ie']
    );

    if (existingUser.length > 0) {
      console.log('User already exists, updating role to admin...');
      await connection.execute(
        'UPDATE phone_users SET role = ? WHERE email = ?',
        ['admin', 'info@easytofin.ie']
      );
      console.log('✓ User role updated to admin');
    } else {
      console.log('Creating new admin user...');
      await connection.execute(
        `INSERT INTO phone_users 
         (email, phone, name, role, email_verified, phone_verified, login_method, client_status) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          'info@easytofin.ie',
          '+353857134678',
          'Admin User',
          'admin',
          'true',
          'true',
          'email',
          'admin',
        ]
      );
      console.log('✓ Admin user created successfully');
    }

    console.log('\nAdmin user details:');
    console.log('Email: info@easytofin.ie');
    console.log('Phone: +353857134678');
    console.log('Role: admin');
    console.log('\nYou can now log in with this email/phone and complete SMS 2FA verification.');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

addAdminUser();
