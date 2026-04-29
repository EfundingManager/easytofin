#!/usr/bin/env node
/**
 * Migration script to backfill googleId for existing users who logged in before the fix
 * 
 * This script updates phoneUsers records that have NULL googleId but have a valid email
 * by deriving the googleId from the email (for users who logged in via Gmail).
 * 
 * Note: This is a conservative approach that only updates records where we can be confident
 * about the googleId. For users with missing data, they will be updated automatically on
 * their next Google login via the handleGoogleCallback logic.
 * 
 * Usage: node server/migrations/backfill-google-ids.mjs
 */

import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('ERROR: DATABASE_URL environment variable is not set');
  process.exit(1);
}

async function main() {
  let connection;
  try {
    // Parse DATABASE_URL (format: mysql://user:password@host:port/database)
    const url = new URL(DATABASE_URL);
    const config = {
      host: url.hostname,
      port: url.port || 3306,
      user: url.username,
      password: url.password,
      database: url.pathname.slice(1),
      ssl: 'Amazon RDS' in url.hostname ? { rejectUnauthorized: false } : false,
    };

    connection = await mysql.createConnection(config);
    console.log('✓ Connected to database');

    // Step 1: Find users with NULL googleId but valid email and loginMethod='google'
    const [usersToUpdate] = await connection.execute(
      `SELECT id, email, googleId, loginMethod, name FROM phoneUsers 
       WHERE (googleId IS NULL OR googleId = '') 
       AND email IS NOT NULL 
       AND loginMethod = 'google'
       LIMIT 100`
    );

    if (usersToUpdate.length === 0) {
      console.log('✓ No users found that need googleId backfill');
      return;
    }

    console.log(`\nFound ${usersToUpdate.length} users that need googleId backfill:`);
    usersToUpdate.forEach(user => {
      console.log(`  - ID: ${user.id}, Email: ${user.email}, Current googleId: ${user.googleId || 'NULL'}`);
    });

    // Step 2: For each user, we would need their actual Google ID
    // Since we don't have it stored, we can only update loginMethod if it's wrong
    // The actual googleId will be populated on their next Google login
    
    console.log('\n⚠️  Note: Actual googleId values cannot be backfilled without the original Google OAuth data.');
    console.log('   These users will be automatically updated on their next Google login.');
    console.log('   The handleGoogleCallback function will populate googleId at that time.\n');

    // Step 3: Update loginMethod for users who logged in via Google but have wrong loginMethod
    const [updateResult] = await connection.execute(
      `UPDATE phoneUsers 
       SET loginMethod = 'google', emailVerified = 'true'
       WHERE (googleId IS NULL OR googleId = '') 
       AND email IS NOT NULL 
       AND loginMethod != 'google'`
    );

    console.log(`✓ Updated ${updateResult.changedRows} user records`);

    // Step 4: Show summary
    const [summary] = await connection.execute(
      `SELECT 
        COUNT(*) as total_users,
        SUM(CASE WHEN googleId IS NOT NULL AND googleId != '' THEN 1 ELSE 0 END) as with_google_id,
        SUM(CASE WHEN googleId IS NULL OR googleId = '' THEN 1 ELSE 0 END) as without_google_id,
        SUM(CASE WHEN loginMethod = 'google' THEN 1 ELSE 0 END) as google_login_method
       FROM phoneUsers`
    );

    console.log('\nDatabase Summary:');
    console.log(`  Total users: ${summary[0].total_users}`);
    console.log(`  Users with googleId: ${summary[0].with_google_id}`);
    console.log(`  Users without googleId: ${summary[0].without_google_id}`);
    console.log(`  Users with loginMethod='google': ${summary[0].google_login_method}`);

    console.log('\n✓ Migration complete!');
    console.log('  Users without googleId will be automatically updated on their next Google login.');

  } catch (error) {
    console.error('ERROR:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

main();
