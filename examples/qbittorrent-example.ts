#!/usr/bin/env bun

import { QBittorrentClient } from '../src/index.js';

async function testQBittorrentClient() {
  const baseUrl = process.env.QBITTORRENT_BASE_URL || 'http://localhost:8080';
  const username = process.env.QBITTORRENT_USERNAME || 'admin';
  const password = process.env.QBITTORRENT_PASSWORD;

  if (!password) {
    console.log('⚠️  Set QBITTORRENT_PASSWORD environment variable to test against live instance');
    console.log('📚 Example: QBITTORRENT_PASSWORD=adminadmin bun run examples/qbittorrent-example.ts');
    return;
  }

  console.log('🌐 Testing qBittorrent client...');
  console.log(`📡 Connecting to: ${baseUrl}`);

  try {
    // Initialize the client
    const qbit = new QBittorrentClient({
      baseUrl,
      username,
      password,
    });

    // Test app version
    console.log('\n📊 Fetching app version...');
    const version = await qbit.getAppVersion();
    console.log('✅ qBittorrent version:', version);

    // Test API version
    const apiVersion = await qbit.getApiVersion();
    console.log('   API version:', apiVersion);

    // Test transfer info
    console.log('\n📡 Fetching transfer info...');
    const transfer = await qbit.getTransferInfo();
    console.log('✅ Download speed:', Math.round((transfer.dl_info_speed || 0) / 1024), 'KB/s');
    console.log('   Upload speed:', Math.round((transfer.up_info_speed || 0) / 1024), 'KB/s');
    console.log('   DHT nodes:', transfer.dht_nodes);

    // Test fetching torrents
    console.log('\n📥 Fetching torrents...');
    const torrents = await qbit.getTorrents();
    console.log(`✅ Found ${torrents.length} torrents`);

    // Show first 3 torrents
    torrents.slice(0, 3).forEach((torrent) => {
      const progress = Math.round((torrent.progress || 0) * 100);
      console.log(`   - ${torrent.name} (${progress}% - ${torrent.state})`);
    });

    // Test filtering torrents
    console.log('\n🔍 Fetching downloading torrents...');
    const downloading = await qbit.getTorrents('downloading');
    console.log(`✅ Found ${downloading.length} downloading torrents`);

    console.log('\n✅ All qBittorrent client tests completed successfully!');
  } catch (error) {
    console.error('\n❌ qBittorrent client test failed:', error);
    if (error instanceof Error) {
      console.error('   Error details:', error.message);
    }
  }
}

if (import.meta.main) {
  testQBittorrentClient();
}
