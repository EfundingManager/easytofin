const API_URL = 'https://3000-ii6j5sk3xkxat8yhufh8h-f0eb7b0e.us1.manus.computer/api/trpc';

async function callAPI(procedure, input) {
  try {
    const response = await fetch(`${API_URL}/${procedure}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(input),
    });
    
    if (!response.ok) {
      console.error(`❌ API Error: ${response.status} ${response.statusText}`);
      return null;
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`❌ Request failed: ${error.message}`);
    return null;
  }
}

console.log('🧪 Starting End-to-End Test Scenario\n');

// Test 1: Get workflow stats
console.log('📊 Test 1: Getting workflow statistics...');
const stats = await callAPI('workflow.getWorkflowStats', {});
console.log('Result:', JSON.stringify(stats, null, 2));

// Test 2: Get clients queue
console.log('\n📋 Test 2: Getting clients queue...');
const queue = await callAPI('workflow.getClientsQueue', { page: 1, limit: 10 });
console.log('Result:', JSON.stringify(queue, null, 2));

console.log('\n✅ Test scenario completed!');
