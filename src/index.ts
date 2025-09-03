export const VERSION = '1.0.0';

export { LidarrClient } from './clients/lidarr.js';
export { ProwlarrClient } from './clients/prowlarr.js';
// Export client classes
export { RadarrClient } from './clients/radarr.js';
export { ReadarrClient } from './clients/readarr.js';
export { SonarrClient } from './clients/sonarr.js';
// Export core utilities
export * from './core/index.js';
export * as Lidarr from './generated/lidarr/index.js';
export * as Prowlarr from './generated/prowlarr/index.js';
// Re-export generated clients with namespaces to avoid conflicts
export * as Radarr from './generated/radarr/index.js';
export * as Readarr from './generated/readarr/index.js';
export * as Sonarr from './generated/sonarr/index.js';
