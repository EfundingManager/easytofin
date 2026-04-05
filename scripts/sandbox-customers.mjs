import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import { phoneUsers, policyAssignments, factFindingForms } from "../drizzle/schema.js";
import { eq } from "drizzle-orm";
import dotenv from "dotenv";
dotenv.config();

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error("DATABASE_URL not set");
  process.exit(1);
}

async function sandboxCustomers() {
  let connection;
  try {
    // Create connection
    connection = await mysql.createConnection(DATABASE_URL);
    const db = drizzle({ client: connection });

    console.log("🔍 Fetching clients from queue...");
    const queueClients = await db.select().from(phoneUsers).where(eq(phoneUsers.clientStatus, "queue")).limit(5);

    if (queueClients.length === 0) {
      console.log("❌ No clients in queue to sandbox");
      return;
    }

    console.log(`✅ Found ${queueClients.length} clients in queue\n`);

    const products = ["protection", "pensions", "healthInsurance", "generalInsurance", "investments"];
    const insurers = {
      protection: "Irish Life",
      pensions: "Zurich",
      healthInsurance: "Laya Healthcare",
      generalInsurance: "AXA",
      investments: "Davy",
    };

    for (let i = 0; i < queueClients.length; i++) {
      const client = queueClients[i];
      const product = products[i % products.length];
      const policyNumber = `POL-${Date.now()}-${i}`;
      const premiumAmount = (Math.random() * 400 + 100).toFixed(2);
      const startDate = new Date();
      const endDate = new Date(startDate.getTime() + 365 * 24 * 60 * 60 * 1000);

      try {
        // Insert policy assignment
        await db.insert(policyAssignments).values({
          phoneUserId: client.id,
          policyNumber,
          product,
          insurerName: insurers[product],
          premiumAmount,
          startDate,
          endDate,
          advisorName: "Sarah O'Brien",
          advisorPhone: "+353 1 234 5678",
          notes: "Sandbox policy for testing",
        });

        // Update client status to customer
        await db.update(phoneUsers).set({ clientStatus: "customer", updatedAt: new Date() }).where(eq(phoneUsers.id, client.id));

        // Update fact-finding forms with policy number
        await db.update(factFindingForms).set({ policyNumber, policyAssignedAt: new Date(), updatedAt: new Date() }).where(eq(factFindingForms.phoneUserId, client.id));

        console.log(`✅ Client ${i + 1}: ${client.name}`);
        console.log(`   Policy: ${policyNumber}`);
        console.log(`   Product: ${product}`);
        console.log(`   Insurer: ${insurers[product]}`);
        console.log(`   Premium: €${premiumAmount}\n`);
      } catch (error) {
        console.error(`❌ Failed to process client ${client.name}:`, error.message);
      }
    }

    console.log("✨ Sandbox customers created successfully!");
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.destroy();
    }
  }
}

sandboxCustomers();
