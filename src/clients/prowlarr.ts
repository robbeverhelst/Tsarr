import { ServarrBaseClient, type ServarrOps } from '../clients/base';
import { client as prowlarrClient } from '../generated/prowlarr/client.gen';
import * as ProwlarrApi from '../generated/prowlarr/index';
import type {
  ApplicationResource,
  DevelopmentConfigResource,
} from '../generated/prowlarr/types.gen';

/**
 * Prowlarr API client for indexer management
 *
 * @example
 * ```typescript
 * const prowlarr = new ProwlarrClient({
 *   baseUrl: 'http://localhost:9696',
 *   apiKey: 'your-api-key'
 * });
 *
 * const indexers = await prowlarr.getIndexers();
 * ```
 */
export class ProwlarrClient extends ServarrBaseClient {
  protected readonly ops: ServarrOps = {
    // System
    getSystemStatus: ProwlarrApi.getApiV1SystemStatus,
    getHealth: ProwlarrApi.getApiV1Health,

    // Tags
    getTags: ProwlarrApi.getApiV1Tag,
    createTag: ProwlarrApi.postApiV1Tag,
    getTagById: ProwlarrApi.getApiV1TagById,
    updateTagById: ProwlarrApi.putApiV1TagById,
    deleteTagById: ProwlarrApi.deleteApiV1TagById,
    getTagDetails: ProwlarrApi.getApiV1TagDetail,
    getTagDetailById: ProwlarrApi.getApiV1TagDetailById,

    // Notifications
    getNotifications: ProwlarrApi.getApiV1Notification,
    createNotification: ProwlarrApi.postApiV1Notification,
    getNotificationById: ProwlarrApi.getApiV1NotificationById,
    updateNotificationById: ProwlarrApi.putApiV1NotificationById,
    deleteNotificationById: ProwlarrApi.deleteApiV1NotificationById,
    getNotificationSchema: ProwlarrApi.getApiV1NotificationSchema,
    testNotification: ProwlarrApi.postApiV1NotificationTest,
    testAllNotifications: ProwlarrApi.postApiV1NotificationTestall,

    // Download Clients
    getDownloadClients: ProwlarrApi.getApiV1Downloadclient,
    createDownloadClient: ProwlarrApi.postApiV1Downloadclient,
    getDownloadClientById: ProwlarrApi.getApiV1DownloadclientById,
    updateDownloadClientById: ProwlarrApi.putApiV1DownloadclientById,
    deleteDownloadClientById: ProwlarrApi.deleteApiV1DownloadclientById,
    getDownloadClientSchema: ProwlarrApi.getApiV1DownloadclientSchema,
    testDownloadClient: ProwlarrApi.postApiV1DownloadclientTest,
    testAllDownloadClients: ProwlarrApi.postApiV1DownloadclientTestall,

    // Indexers
    getIndexers: ProwlarrApi.getApiV1Indexer,
    createIndexer: ProwlarrApi.postApiV1Indexer,
    getIndexerById: ProwlarrApi.getApiV1IndexerById,
    updateIndexerById: ProwlarrApi.putApiV1IndexerById,
    deleteIndexerById: ProwlarrApi.deleteApiV1IndexerById,
    getIndexerSchema: ProwlarrApi.getApiV1IndexerSchema,
    testIndexer: ProwlarrApi.postApiV1IndexerTest,
    testAllIndexers: ProwlarrApi.postApiV1IndexerTestall,

    // System Admin
    restartSystem: ProwlarrApi.postApiV1SystemRestart,
    shutdownSystem: ProwlarrApi.postApiV1SystemShutdown,
    getBackups: ProwlarrApi.getApiV1SystemBackup,
    deleteBackup: ProwlarrApi.deleteApiV1SystemBackupById,
    restoreBackup: ProwlarrApi.postApiV1SystemBackupRestoreById,
    uploadBackup: ProwlarrApi.postApiV1SystemBackupRestoreUpload,
    getLogFiles: ProwlarrApi.getApiV1LogFile,
    getLogFileByName: ProwlarrApi.getApiV1LogFileByFilename,

    // Commands
    runCommand: ProwlarrApi.postApiV1Command,
    getCommands: ProwlarrApi.getApiV1Command,

    // Host Config
    getHostConfig: ProwlarrApi.getApiV1ConfigHost,
    getHostConfigById: ProwlarrApi.getApiV1ConfigHostById,
    updateHostConfig: ProwlarrApi.putApiV1ConfigHostById,

    // UI Config
    getUiConfig: ProwlarrApi.getApiV1ConfigUi,
    getUiConfigById: ProwlarrApi.getApiV1ConfigUiById,
    updateUiConfig: ProwlarrApi.putApiV1ConfigUiById,
  };

  protected configureRawClient(): void {
    prowlarrClient.setConfig(this.getClientConfig());
  }

  // Prowlarr-specific APIs

  // Indexer Stats APIs

  /**
   * Get indexer statistics
   */
  async getIndexerStats() {
    return ProwlarrApi.getApiV1Indexerstats();
  }

  // Search APIs

  /**
   * Search across all or specific indexers
   */
  async search(query: string, indexerIds?: number[]) {
    return ProwlarrApi.getApiV1Search({
      query: {
        query,
        ...(indexerIds && { indexerIds }),
      },
    });
  }

  // Application APIs

  /**
   * Get all applications
   */
  async getApplications() {
    return ProwlarrApi.getApiV1Applications();
  }

  /**
   * Get a specific application by ID
   */
  async getApplication(id: number) {
    return ProwlarrApi.getApiV1ApplicationsById({ path: { id } });
  }

  /**
   * Add a new application
   */
  async addApplication(application: ApplicationResource) {
    return ProwlarrApi.postApiV1Applications({ body: application });
  }

  /**
   * Update an existing application
   */
  async updateApplication(id: number, application: ApplicationResource) {
    return ProwlarrApi.putApiV1ApplicationsById({ path: { id: String(id) }, body: application });
  }

  /**
   * Delete an application
   */
  async deleteApplication(id: number) {
    return ProwlarrApi.deleteApiV1ApplicationsById({ path: { id } });
  }

  /**
   * Test an application configuration
   */
  async testApplication(application: ApplicationResource) {
    return ProwlarrApi.postApiV1ApplicationsTest({ body: application });
  }

  /**
   * Test all applications
   */
  async testAllApplications() {
    return ProwlarrApi.postApiV1ApplicationsTestall();
  }

  /**
   * Get application schema for available application types
   */
  async getApplicationSchema() {
    return ProwlarrApi.getApiV1ApplicationsSchema();
  }

  // Development Configuration APIs

  /**
   * Get development configuration settings
   */
  async getDevelopmentConfig() {
    return ProwlarrApi.getApiV1ConfigDevelopment();
  }

  /**
   * Get development configuration by ID
   */
  async getDevelopmentConfigById(id: number) {
    return ProwlarrApi.getApiV1ConfigDevelopmentById({ path: { id } });
  }

  /**
   * Update development configuration
   */
  async updateDevelopmentConfig(id: number, config: DevelopmentConfigResource) {
    return ProwlarrApi.putApiV1ConfigDevelopmentById({ path: { id: String(id) }, body: config });
  }

  // System Logs API

  /**
   * Get system logs
   */
  async getSystemLogs() {
    return ProwlarrApi.getApiV1Log();
  }
}

// Re-export types for external consumption
export * from './prowlarr-types.js';
