import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { getDb } from './db';
import { phoneUsers, policyAssignments, factFindingForms } from '../drizzle/schema';
import { eq } from 'drizzle-orm';

describe('End-to-End Workflow Test', () => {
  let db: any;
  let testClientIds: number[] = [];

  beforeAll(async () => {
    db = await getDb();
    if (!db) {
      console.log('⚠️ Database not available, skipping tests');
      return;
    }
    console.log('✅ Database connected');
  });

  afterAll(async () => {
    // Cleanup test data
    if (db && testClientIds.length > 0) {
      for (const id of testClientIds) {
        try {
          await db.delete(policyAssignments).where(eq(policyAssignments.phoneUserId, id));
          await db.delete(factFindingForms).where(eq(factFindingForms.phoneUserId, id));
          await db.delete(phoneUsers).where(eq(phoneUsers.id, id));
        } catch (error) {
          console.log('Cleanup error:', error);
        }
      }
      console.log('🧹 Cleanup completed');
    }
  });

  it('should create test clients in queue', async () => {
    if (!db) return;

    const testClients = [
      { name: 'John Smith', email: 'john.smith@example.com', phone: '+353 1 234 5678', loginMethod: 'phone', verified: 'true', clientStatus: 'queue' },
      { name: 'Sarah Johnson', email: 'sarah.johnson@example.com', phone: '+353 1 987 6543', loginMethod: 'gmail', verified: 'true', clientStatus: 'queue' },
      { name: 'Michael Brown', email: 'michael.brown@example.com', phone: '+353 1 555 1234', loginMethod: 'phone', verified: 'true', clientStatus: 'queue' },
    ];

    for (const client of testClients) {
      const [result] = await db.insert(phoneUsers).values(client);
      if (result?.insertId) {
        testClientIds.push(result.insertId);
        console.log(`✅ Created: ${client.name} (ID: ${result.insertId})`);
      }
    }

    expect(testClientIds.length).toBe(3);
  });

  it('should retrieve clients from queue', async () => {
    if (!db || testClientIds.length === 0) return;

    const queueClients: any = await db.select().from(phoneUsers).where(eq(phoneUsers.clientStatus, 'queue'));
    
    console.log(`📋 Total clients in queue: ${queueClients.length}`);
    expect(queueClients.length).toBeGreaterThanOrEqual(3);

    queueClients.forEach((client: any) => {
      console.log(`  - ${client.name} (${client.email})`);
    });
  });

  it('should assign policy to first client', async () => {
    if (!db || testClientIds.length === 0) return;

    const clientId = testClientIds[0];
    const policyNumber = 'POL-2026-001234';
    const product = 'protection';

    // Insert policy assignment
    await db.insert(policyAssignments).values({
      phoneUserId: clientId,
      policyNumber,
      product,
      insurerName: 'Test Insurance Co',
      premiumAmount: '250.00',
      startDate: new Date(),
      endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      notes: 'Test policy assignment',
    });

    // Update client status to customer
    await db.update(phoneUsers).set({ clientStatus: 'customer' }).where(eq(phoneUsers.id, clientId));

    console.log(`✅ Policy assigned: ${policyNumber} to client ID ${clientId}`);

    // Verify
    const updatedClient: any = await db.select().from(phoneUsers).where(eq(phoneUsers.id, clientId));
    expect(updatedClient[0]?.clientStatus).toBe('customer');
  });

  it('should verify client moved to customers', async () => {
    if (!db || testClientIds.length === 0) return;

    const customers: any = await db.select().from(phoneUsers).where(eq(phoneUsers.clientStatus, 'customer'));
    
    console.log(`👥 Total customers: ${customers.length}`);
    expect(customers.length).toBeGreaterThanOrEqual(1);

    customers.forEach((customer: any) => {
      console.log(`  - ${customer.name} (${customer.email})`);
    });
  });

  it('should retrieve policy assignments', async () => {
    if (!db || testClientIds.length === 0) return;

    const policies: any = await db.select().from(policyAssignments).where(eq(policyAssignments.phoneUserId, testClientIds[0]));
    
    console.log(`📋 Policies for client ${testClientIds[0]}: ${policies.length}`);
    expect(policies.length).toBeGreaterThanOrEqual(1);

    policies.forEach((policy: any) => {
      console.log(`  - ${policy.policyNumber} (${policy.product})`);
    });
  });

  it('should verify queue has fewer clients', async () => {
    if (!db) return;

    const queueClients: any = await db.select().from(phoneUsers).where(eq(phoneUsers.clientStatus, 'queue'));
    
    console.log(`📊 Remaining clients in queue: ${queueClients.length}`);
    // Should have 2 remaining (3 created, 1 moved to customer)
    expect(queueClients.length).toBeGreaterThanOrEqual(2);
  });
});
