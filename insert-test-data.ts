import { db } from './server/db';
import { phoneUsers } from './drizzle/schema';

async function insertTestData() {
  console.log('🌱 Inserting test data...');
  
  const testClients = [
    { name: 'John Smith', email: 'john.smith@example.com', phone: '+353 1 234 5678', loginMethod: 'phone', verified: 'true', clientStatus: 'queue' },
    { name: 'Sarah Johnson', email: 'sarah.johnson@example.com', phone: '+353 1 987 6543', loginMethod: 'gmail', verified: 'true', clientStatus: 'queue' },
    { name: 'Michael Brown', email: 'michael.brown@example.com', phone: '+353 1 555 1234', loginMethod: 'phone', verified: 'true', clientStatus: 'queue' },
  ];
  
  for (const client of testClients) {
    await db.insert(phoneUsers).values(client);
    console.log(`✅ Created: ${client.name}`);
  }
  
  console.log('✅ Test data inserted successfully!');
}

insertTestData().catch(console.error);
