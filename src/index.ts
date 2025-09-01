export const VERSION = '0.1.0';

// Re-export generated clients with namespaces to avoid conflicts
export * as Radarr from './radarr/index.js';
export * as Sonarr from './sonarr/index.js';

// Export client classes
export { RadarrClient } from './clients/radarr.js';
export { SonarrClient } from './clients/sonarr.js';

// Export core utilities
export * from './core/index.js';
