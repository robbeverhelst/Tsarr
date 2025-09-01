#!/usr/bin/env bun

import { RadarrClient } from '../src/index.js';

async function importMoviesFromDirectory() {
  const baseUrl = process.env.RADARR_BASE_URL;
  const apiKey = process.env.RADARR_API_KEY;
  const movieDirectory = process.env.MOVIE_DIRECTORY || '/media/movies';

  if (!baseUrl || !apiKey) {
    console.error('⚠️  Missing required environment variables');
    console.log('📚 Set RADARR_BASE_URL and RADARR_API_KEY environment variables');
    console.log('📚 Example: RADARR_BASE_URL=http://localhost:7878 RADARR_API_KEY=your-api-key bun run examples/import-movies.ts');
    process.exit(1);
  }

  console.log('🎬 Radarr Movie Import Script');
  console.log(`📡 Connecting to: ${baseUrl}`);
  console.log(`📁 Target directory: ${movieDirectory}`);

  try {
    // Initialize the client
    const radarr = new RadarrClient({
      baseUrl,
      apiKey,
    });

    // Step 1: Check current root folders
    console.log('\n📂 Fetching current root folders...');
    const rootFoldersResponse = await radarr.getRootFolders();
    const rootFolders = rootFoldersResponse.data || [];

    console.log(`✅ Found ${rootFolders.length} root folders:`);
    rootFolders.forEach((folder: any, index: number) => {
      console.log(
        `   ${index + 1}. ${folder.path} (${folder.freeSpace ? `${Math.round(folder.freeSpace / 1024 / 1024 / 1024)}GB free` : 'unknown space'})`
      );
    });

    // Step 2: Check if our target directory exists as a root folder
    const existingFolder = rootFolders.find((folder: any) => folder.path === movieDirectory);

    if (!existingFolder) {
      console.log(`\n📁 Adding ${movieDirectory} as root folder...`);
      try {
        const addFolderResponse = await radarr.addRootFolder(movieDirectory);
        if (addFolderResponse.data) {
          console.log('✅ Root folder added successfully');
        }
      } catch (error) {
        console.log(`⚠️  Could not add root folder (may already exist): ${error}`);
      }
    } else {
      console.log(`\n✅ Root folder ${movieDirectory} already exists (ID: ${existingFolder.id})`);
    }

    // Step 3: Scan filesystem for media files
    console.log(`\n🔍 Scanning ${movieDirectory} for media files...`);
    const mediaFilesResponse = await radarr.getMediaFiles(movieDirectory);
    const mediaFiles = mediaFilesResponse.data || [];

    console.log(`✅ Found ${mediaFiles.length} media files`);
    if (mediaFiles.length > 0) {
      console.log('   Sample files:');
      mediaFiles.slice(0, 5).forEach((file: any, index: number) => {
        console.log(`   ${index + 1}. ${file.name || file.path}`);
      });

      if (mediaFiles.length > 5) {
        console.log(`   ... and ${mediaFiles.length - 5} more files`);
      }
    }

    // Step 4: Wait a moment and check if movies appear after rescan
    console.log('\n⏳ Waiting 5 seconds for folder processing...');
    await new Promise(resolve => setTimeout(resolve, 5000));

    const updatedMovies = await radarr.getMovies();
    console.log(`📊 Movies in library after wait: ${updatedMovies.data?.length || 0}`);

    // Step 5: Proper movie import process (metadata first, then files)
    console.log('\n🎯 Starting proper movie import process...');

    // Process ALL movies for bulk import
    const moviesToProcess = mediaFiles;
    console.log(`📥 Processing ${moviesToProcess.length} movies...`);

    const successfulImports = [];

    for (let i = 0; i < moviesToProcess.length; i++) {
      const file = moviesToProcess[i];
      const movieName = file.name.split('.')[0]; // Get name before first dot

      console.log(`\n${i + 1}/${moviesToProcess.length} Processing: ${file.name}`);

      try {
        // Search for movie metadata
        console.log(`   🔍 Searching metadata for: ${movieName}`);
        const searchResults = await radarr.searchMovies(movieName);

        if (searchResults.data && searchResults.data.length > 0) {
          const movieMetadata = searchResults.data[0];
          console.log(`   ✅ Found: ${movieMetadata.title} (${movieMetadata.year})`);

          // Add movie to library
          console.log(`   ➕ Adding to library...`);
          const addMovieResponse = await radarr.addMovie({
            title: movieMetadata.title,
            year: movieMetadata.year,
            tmdbId: movieMetadata.tmdbId,
            titleSlug: movieMetadata.titleSlug,
            qualityProfileId: 1,
            monitored: true,
            searchForMovie: false,
            rootFolderPath: '/media/movies',
            images: movieMetadata.images,
            addOptions: {
              ignoreEpisodesWithFiles: false,
              ignoreEpisodesWithoutFiles: false,
            },
          });

          if (addMovieResponse.data) {
            console.log(`   ✅ Added (ID: ${addMovieResponse.data.id})`);

            // Import the physical file
            console.log(`   📁 Importing file...`);
            await radarr.importMovies([
              {
                path: file.path,
                movieId: addMovieResponse.data.id,
                quality: { quality: { id: 1, name: 'Unknown' } },
                languages: [{ id: 1, name: 'English' }],
              },
            ]);

            console.log(`   ✅ File imported successfully!`);
            successfulImports.push(movieMetadata.title);
          }
        } else {
          console.log(`   ❌ No metadata found for: ${movieName}`);
        }

        // Small delay between movies
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        console.log(`   ❌ Failed to process: ${error}`);
      }
    }

    console.log(`\n🎉 Import complete! Successfully imported ${successfulImports.length} movies:`);
    successfulImports.forEach((title, index) => {
      console.log(`   ${index + 1}. ${title}`);
    });

    // Step 6: Final summary
    console.log('\n📊 Final library check...');
    const finalCheck = await radarr.getMovies();
    console.log(`🎬 Total movies in library: ${finalCheck.data?.length || 0}`);

    if (finalCheck.data && finalCheck.data.length > 0) {
      console.log('🎬 Movies in library:');
      finalCheck.data.forEach((movie: any, index: number) => {
        console.log(`   ${index + 1}. ${movie.title} (${movie.year}) - ${movie.status}`);
      });
    }

    console.log('\n🎉 Movie import script completed!');
    console.log('💡 Check Radarr UI for import results and any new movies added.');
  } catch (error) {
    console.error('\n❌ Import script failed:', error);
    if (error instanceof Error) {
      console.error('   Error details:', error.message);
    }
  }
}

if (import.meta.main) {
  importMoviesFromDirectory();
}
