import { RadarrClient } from '../src/clients/radarr.js';

const radarr = new RadarrClient({
  baseUrl: process.env.RADARR_BASE_URL || 'http://localhost:7878',
  apiKey: process.env.RADARR_API_KEY || '',
});

async function demonstrateLookupById() {
  console.log('🎬 Movie Lookup by ID Examples\n');

  // Example 1: Lookup by TMDB ID using dedicated method
  console.log('1️⃣  Looking up "Spirited Away" by TMDB ID (4247)...');
  const movieByTmdb = await radarr.lookupMovieByTmdbId(4247);
  console.log(`   Found: ${movieByTmdb.data?.title} (${movieByTmdb.data?.year})`);
  console.log(`   Rating: ${movieByTmdb.data?.ratings?.tmdb?.value}/10\n`);

  // Example 2: Lookup by IMDB ID using dedicated method
  console.log('2️⃣  Looking up "Rushmore" by IMDB ID (tt0128445)...');
  const movieByImdb = await radarr.lookupMovieByImdbId('tt0128445');
  console.log(`   Found: ${movieByImdb.data?.title} (${movieByImdb.data?.year})`);
  console.log(`   Rating: ${movieByImdb.data?.ratings?.imdb?.value}/10\n`);

  // Example 3: Lookup using unified method with TMDB
  console.log('3️⃣  Looking up "The Royal Tenenbaums" using unified method (tmdb:9428)...');
  const movieUnifiedTmdb = await radarr.lookupMovieById('tmdb:9428');
  console.log(`   Found: ${movieUnifiedTmdb.data?.title} (${movieUnifiedTmdb.data?.year})`);
  console.log(`   Runtime: ${movieUnifiedTmdb.data?.runtime} minutes\n`);

  // Example 4: Lookup using unified method with IMDB
  console.log('4️⃣  Looking up "Moonrise Kingdom" using unified method (imdb:tt1748122)...');
  const movieUnifiedImdb = await radarr.lookupMovieById('imdb:tt1748122');
  console.log(`   Found: ${movieUnifiedImdb.data?.title} (${movieUnifiedImdb.data?.year})`);
  console.log(`   Runtime: ${movieUnifiedImdb.data?.runtime} minutes\n`);

  // Example 5: Error handling - Invalid provider
  console.log('5️⃣  Testing error handling...\n');

  console.log('   Testing invalid provider:');
  try {
    await radarr.lookupMovieById('invalid:123');
  } catch (error) {
    console.log(`   ✅ ${error instanceof Error ? error.message : String(error)}\n`);
  }

  console.log('   Testing invalid TMDB ID (non-numeric):');
  try {
    await radarr.lookupMovieById('tmdb:abc');
  } catch (error) {
    console.log(`   ✅ ${error instanceof Error ? error.message : String(error)}\n`);
  }

  console.log('   Testing invalid TMDB ID (zero):');
  try {
    await radarr.lookupMovieById('tmdb:0');
  } catch (error) {
    console.log(`   ✅ ${error instanceof Error ? error.message : String(error)}\n`);
  }

  console.log('   Testing invalid IMDB ID (missing tt prefix):');
  try {
    await radarr.lookupMovieById('imdb:0175142');
  } catch (error) {
    console.log(`   ✅ ${error instanceof Error ? error.message : String(error)}\n`);
  }

  console.log('   Testing missing colon:');
  try {
    await radarr.lookupMovieById('tmdb123');
  } catch (error) {
    console.log(`   ✅ ${error instanceof Error ? error.message : String(error)}\n`);
  }

  console.log('   Testing case-insensitive provider (TMDB):');
  const movieUppercase = await radarr.lookupMovieById('TMDB:4247');
  console.log(`   ✅ Successfully handled: ${movieUppercase.data?.title}\n`);

  console.log('✨ All lookups and validations completed successfully!');
}

demonstrateLookupById().catch(console.error);
