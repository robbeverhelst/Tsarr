#!/usr/bin/env bun

import { JellyfinClient } from '../src/index.js';

async function testJellyfinClient() {
  const baseUrl = process.env.JELLYFIN_BASE_URL || 'http://localhost:8096';
  const apiKey = process.env.JELLYFIN_API_KEY;

  if (!apiKey) {
    console.log('⚠️  Set JELLYFIN_API_KEY environment variable to test against live instance');
    console.log('📚 Example: JELLYFIN_API_KEY=your-key bun run examples/jellyfin-example.ts');
    console.log('🔑 Get a key from Dashboard → Advanced → API Keys');
    return;
  }

  console.log('🎬 Testing Jellyfin client...');
  console.log(`📡 Connecting to: ${baseUrl}`);

  try {
    const jellyfin = new JellyfinClient({
      baseUrl,
      apiKey,
    });

    // Jellyfin serves PascalCase JSON, unlike the Servarr services
    console.log('\n📊 Fetching server status...');
    const status = await jellyfin.getSystemStatus();
    const info = (status as any).data ?? status;
    console.log('✅ Jellyfin version:', info.Version);
    console.log('   Server name:', info.ServerName);
    console.log('   Operating system:', info.OperatingSystem || '(not reported)');

    console.log('\n📚 Fetching libraries...');
    const folders = await jellyfin.getVirtualFolders();
    const libraries = (folders as any).data ?? [];
    console.log(`✅ ${libraries.length} librar${libraries.length === 1 ? 'y' : 'ies'}`);
    for (const library of libraries) {
      console.log(
        `   • ${library.Name} (${library.CollectionType ?? 'mixed'}) — ${(library.Locations ?? []).join(', ')}`
      );
    }

    console.log('\n🔢 Fetching item counts...');
    const counts = await jellyfin.getItemCounts();
    const c = (counts as any).data ?? {};
    console.log(`✅ ${c.MovieCount ?? 0} movies, ${c.SeriesCount ?? 0} series, ${c.EpisodeCount ?? 0} episodes`);

    console.log('\n👤 Fetching users...');
    const users = await jellyfin.getUsers();
    const userList = (users as any).data ?? [];
    console.log(`✅ ${userList.length} user(s)`);
    for (const user of userList) {
      console.log(`   • ${user.Name} (${user.Id})`);
    }

    console.log('\n▶️  Checking active sessions...');
    const sessions = await jellyfin.getSessions();
    const active = ((sessions as any).data ?? []).filter((s: any) => s.NowPlayingItem);
    console.log(`✅ ${active.length} active stream(s)`);
    for (const session of active) {
      console.log(`   • ${session.UserName} watching ${session.NowPlayingItem?.Name} on ${session.Client}`);
    }

    console.log('\n🎥 Fetching movies...');
    const movies = await jellyfin.getItems({
      includeItemTypes: ['Movie'],
      recursive: true,
      limit: 5,
    });
    const items = (movies as any).data?.Items ?? [];
    console.log(`✅ Showing ${items.length} movie(s)`);
    for (const item of items) {
      console.log(`   • ${item.Name} (${item.ProductionYear ?? '?'}) — ${item.Id}`);
    }

    console.log('\n⏱️  Fetching scheduled tasks...');
    const tasks = await jellyfin.getTasks();
    const taskList = (tasks as any).data ?? [];
    const running = taskList.filter((t: any) => t.State === 'Running');
    console.log(`✅ ${taskList.length} task(s), ${running.length} running`);

    console.log('\n🎉 Jellyfin client test complete!');
    console.log('\n💡 Tip: `await jellyfin.refreshLibrary()` triggers a scan after an import.');
  } catch (error) {
    console.error('❌ Jellyfin client test failed:', error);
    process.exitCode = 1;
  }
}

testJellyfinClient();
