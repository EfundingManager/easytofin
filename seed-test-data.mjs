import { createConnection } from 'mysql2/promise';

const connection = await createConnection({
  host: process.env.DATABASE_URL?.split('@')[1]?.split(':')[0] || 'localhost',
  user: process.env.DATABASE_URL?.split('//')[1]?.split(':')[0] || 'root',
  password: process.env.DATABASE_URL?.split(':')[2]?.split('@')[0] || '',
  database: process.env.DATABASE_URL?.split('/')[3]?.split('?')[0] || 'test',
});

console.log('🌱 Creating test data...');

// Create test clients in queue
const testClients = [
  { name: 'John Smith', email: 'john.smith@example.com', phone: '+353 1 234 5678', loginMethod: 'phone', verified: 'true', clientStatus: 'queue' },
  { name: 'Sarah Johnson', email: 'sarah.johnson@example.com', phone: '+353 1 987 6543', loginMethod: 'gmail', verified: 'true', clientStatus: 'queue' },
  { name: 'Michael Brown', email: 'michael.brown@example.com', phone: '+353 1 555 1234', loginMethod: 'phone', verified: 'true', clientStatus: 'queue' },
];

const insertedIds = [];

for (const client of testClients) {
  const [result] = await connection.execute(
    'INSERT INTO phoneUsers (name, email, phone, loginMethod, verified, clientStatus, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())',
    [client.name, client.email, client.phone, client.loginMethod, client.verified, client.clientStatus]
  );
  insertedIds.push(result.insertId);
  console.log(`✅ Created test client: ${client.name} (ID: ${result.insertId})`);
}

console.log('\n📊 Test data created successfully!');
console.log(`Total test clients created: ${insertedIds.length}`);
console.log(`Client IDs: ${insertedIds.join(', ')}`);

await connection.end();
