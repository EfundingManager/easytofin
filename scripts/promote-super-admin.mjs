import mysql from 'mysql2/promise';

const main = async () => {
  try {
    // Create connection
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: 'root',
      database: 'dmr4obss8sq94m9jete8y7',
    });

    console.log('✓ Connected to database');
    
    // Update user to super_admin
    const email = 'Manager@easytofin.com';
    const phone = '+353879158817';

    console.log(`Promoting user with email: ${email} or phone: ${phone} to super_admin...`);

    const [result] = await connection.execute(
      'UPDATE phoneUsers SET role = ? WHERE email = ? OR phone = ?',
      ['super_admin', email, phone]
    );

    console.log(`✓ Update successful! Rows affected: ${result.affectedRows}`);

    // Verify the update
    const [users] = await connection.execute(
      'SELECT id, email, phone, role FROM phoneUsers WHERE email = ? OR phone = ?',
      [email, phone]
    );

    console.log('\nUser after update:');
    console.table(users);

    await connection.end();
    console.log('\n✓ User promoted to super_admin successfully!');
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
};

main();
