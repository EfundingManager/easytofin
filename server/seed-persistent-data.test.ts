import { describe, it, expect } from 'vitest';
import { getDb } from './db';
import { phoneUsers, policyAssignments } from '../drizzle/schema';

describe('Seed Persistent Test Data', () => {
  it('should create persistent test data that stays in database', async () => {
    const db = await getDb();
    if (!db) {
      console.log('⚠️ Database not available');
      return;
    }

    console.log('🌱 Creating persistent test data...\n');

    // Create test clients
    const timestamp = Date.now();
    const testClients = [
      { name: 'John Smith', email: `john.smith.${timestamp}@example.com`, phone: `+353 1 234 ${timestamp % 10000}`, loginMethod: 'phone', verified: 'true', clientStatus: 'queue' },
      { name: 'Sarah Johnson', email: `sarah.johnson.${timestamp}@example.com`, phone: `+353 1 987 ${(timestamp + 1) % 10000}`, loginMethod: 'gmail', verified: 'true', clientStatus: 'queue' },
      { name: 'Michael Brown', email: `michael.brown.${timestamp}@example.com`, phone: `+353 1 555 ${(timestamp + 2) % 10000}`, loginMethod: 'phone', verified: 'true', clientStatus: 'queue' },
    ];

    const clientIds: number[] = [];

    for (const client of testClients) {
      const [result] = await db.insert(phoneUsers).values(client);
      if (result?.insertId) {
        clientIds.push(result.insertId);
        console.log(`✅ Created client: ${client.name} (ID: ${result.insertId})`);
      }
    }

    // Assign policy to first client
    if (clientIds.length > 0) {
      await db.insert(policyAssignments).values({
        phoneUserId: clientIds[0],
        policyNumber: 'POL-2026-001234',
        product: 'protection',
        insurerName: 'Test Insurance Co',
        premiumAmount: '250.00',
        startDate: new Date(),
        endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        notes: 'Test policy assignment',
      });

      // Update first client to customer
      await db.update(phoneUsers).set({ clientStatus: 'customer' }).where({ id: clientIds[0] });
      console.log(`✅ Assigned policy to: John Smith (Policy: POL-2026-001234)`);
    }

    console.log('\n📊 Test data created and persisted in database!');
    console.log(`Total clients created: ${clientIds.length}`);
    console.log(`Clients in queue: 2 (Sarah Johnson, Michael Brown)`);
    console.log(`Customers: 1 (John Smith)`);

    expect(clientIds.length).toBe(3);
  });
});
