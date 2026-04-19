import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('DATABASE_URL environment variable is not set');
  process.exit(1);
}

async function cleanupTestData() {
  let connection;
  try {
    // Parse DATABASE_URL to get connection details
    const url = new URL(DATABASE_URL);
    const config = {
      host: url.hostname,
      user: url.username,
      password: url.password,
      database: url.pathname.slice(1),
      port: url.port || 3306,
      ssl: url.hostname.includes('tidbcloud') || url.hostname.includes('rds') ? { rejectUnauthorized: false } : false,
    };

    connection = await mysql.createConnection(config);
    console.log('Connected to database');

    // Get all phone users (clients) to delete
    const [phoneUsers] = await connection.query('SELECT id FROM phoneUsers WHERE role = "user" OR role = "client"');
    console.log(`Found ${phoneUsers.length} phone users to delete`);

    if (phoneUsers.length > 0) {
      const userIds = phoneUsers.map(u => u.id);
      
      // Delete related data in order of dependencies
      console.log('Deleting related data...');
      
      // Delete fact finding forms
      await connection.query('DELETE FROM factFindingForms WHERE phoneUserId IN (?)', [userIds]);
      console.log('✓ Deleted fact finding forms');
      
      // Delete policy assignments
      await connection.query('DELETE FROM policyAssignments WHERE phoneUserId IN (?)', [userIds]);
      console.log('✓ Deleted policy assignments');
      
      // Delete client documents
      await connection.query('DELETE FROM clientDocuments WHERE phoneUserId IN (?)', [userIds]);
      console.log('✓ Deleted client documents');
      
      // Delete OTP codes
      await connection.query('DELETE FROM otpCodes WHERE phoneUserId IN (?)', [userIds]);
      console.log('✓ Deleted OTP codes');
      
      // Delete user products
      await connection.query('DELETE FROM userProducts WHERE phoneUserId IN (?)', [userIds]);
      console.log('✓ Deleted user products');
      
      // Delete account lockouts (skip if table doesn't exist)
      try {
        await connection.query('DELETE FROM accountLockouts WHERE phoneUserId IN (?)', [userIds]);
        console.log('✓ Deleted account lockouts');
      } catch (e) {
        if (e.code === 'ER_NO_SUCH_TABLE') {
          console.log('⊘ Skipped account lockouts (table doesn\'t exist)');
        } else {
          throw e;
        }
      }
      
      // Delete login attempts (skip if table doesn't exist)
      try {
        await connection.query('DELETE FROM loginAttempts WHERE phoneUserId IN (?)', [userIds]);
        console.log('✓ Deleted login attempts');
      } catch (e) {
        if (e.code === 'ER_NO_SUCH_TABLE') {
          console.log('⊘ Skipped login attempts (table doesn\'t exist)');
        } else {
          throw e;
        }
      }
      
      // Delete phone users
      await connection.query('DELETE FROM phoneUsers WHERE id IN (?)', [userIds]);
      console.log('✓ Deleted phone users');
    }

    // Get all regular users (OAuth users) to delete
    const [oauthUsers] = await connection.query('SELECT id FROM users WHERE role != "admin" AND role != "super_admin"');
    console.log(`Found ${oauthUsers.length} OAuth users to delete`);

    if (oauthUsers.length > 0) {
      const userIds = oauthUsers.map(u => u.id);
      
      // Delete related data
      await connection.query('DELETE FROM userProducts WHERE userId IN (?)', [userIds]);
      console.log('✓ Deleted user products for OAuth users');
      
      // Delete users
      await connection.query('DELETE FROM users WHERE id IN (?)', [userIds]);
      console.log('✓ Deleted OAuth users');
    }

    // Get counts of remaining data
    const [[{ phoneUserCount }]] = await connection.query('SELECT COUNT(*) as phoneUserCount FROM phoneUsers');
    const [[{ userCount }]] = await connection.query('SELECT COUNT(*) as userCount FROM users');
    const [[{ submissionCount }]] = await connection.query('SELECT COUNT(*) as submissionCount FROM factFindingForms');
    const [[{ policyCount }]] = await connection.query('SELECT COUNT(*) as policyCount FROM policyAssignments');

    console.log('\n=== Cleanup Complete ===');
    console.log(`Remaining phone users: ${phoneUserCount}`);
    console.log(`Remaining OAuth users: ${userCount}`);
    console.log(`Remaining form submissions: ${submissionCount}`);
    console.log(`Remaining policies: ${policyCount}`);

  } catch (error) {
    console.error('Error during cleanup:', error);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\nDatabase connection closed');
    }
  }
}

cleanupTestData();
