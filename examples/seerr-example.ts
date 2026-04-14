#!/usr/bin/env bun

import { SeerrClient } from '../src/index.js';

async function testSeerrClient() {
  const baseUrl = process.env.SEERR_BASE_URL || 'http://localhost:5055';
  const apiKey = process.env.SEERR_API_KEY;

  if (!apiKey) {
    console.log('⚠️  Set SEERR_API_KEY environment variable to test against live instance');
    console.log('📚 Example: SEERR_API_KEY=your-key bun run examples/seerr-example.ts');
    return;
  }

  console.log('🌐 Testing Seerr client...');
  console.log(`📡 Connecting to: ${baseUrl}`);

  try {
    // Initialize the client
    const seerr = new SeerrClient({
      baseUrl,
      apiKey,
    });

    // Test server status
    console.log('\n📊 Fetching server status...');
    const status = await seerr.getSystemStatus();
    const data = (status as any).data ?? status;
    console.log('✅ Seerr version:', data.version);
    console.log('   Update available:', data.updateAvailable);

    // Test fetching requests
    console.log('\n📋 Fetching media requests...');
    const requests = await seerr.getRequests();
    const reqData = (requests as any).data ?? requests;
    const results = reqData.results ?? [];
    console.log(`✅ Found ${results.length} requests`);

    results.slice(0, 3).forEach((req: any) => {
      const statusMap: Record<number, string> = {
        1: 'PENDING',
        2: 'APPROVED',
        3: 'DECLINED',
      };
      console.log(`   - Request #${req.id} (${statusMap[req.status] ?? req.status})`);
    });

    // Test request count
    console.log('\n📊 Fetching request counts...');
    const count = await seerr.getRequestCount();
    const countData = (count as any).data ?? count;
    console.log('✅ Request counts:', JSON.stringify(countData));

    // Test fetching users
    console.log('\n👥 Fetching users...');
    const users = await seerr.getUsers();
    const userData = (users as any).data ?? users;
    const userResults = userData.results ?? [];
    console.log(`✅ Found ${userResults.length} users`);

    userResults.slice(0, 3).forEach((user: any) => {
      console.log(`   - ${user.displayName ?? user.email} (${user.requestCount ?? 0} requests)`);
    });

    // Test search
    console.log('\n🔍 Searching for "The Matrix"...');
    const searchResults = await seerr.search('The Matrix');
    const searchData = (searchResults as any).data ?? searchResults;
    const searchItems = searchData.results ?? [];
    console.log(`✅ Found ${searchItems.length} results`);

    searchItems.slice(0, 3).forEach((item: any) => {
      console.log(`   - ${item.title ?? item.name} (${item.mediaType})`);
    });

    console.log('\n✅ All Seerr client tests completed successfully!');
  } catch (error) {
    console.error('\n❌ Seerr client test failed:', error);
    if (error instanceof Error) {
      console.error('   Error details:', error.message);
    }
  }
}

if (import.meta.main) {
  testSeerrClient();
}
