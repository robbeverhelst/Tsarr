import { ServarrBaseClient, type ServarrOps } from '../clients/base';
import { bindApiClient } from '../core/bind-api';
import type { ServarrClientConfig } from '../core/types';
import { createClient, createConfig } from '../generated/prowlarr/client';
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
  /** Own client instance — never the generated module singleton. See bindApiClient. */
  private readonly api = bindApiClient(ProwlarrApi, this.rawClient);

  protected readonly ops: ServarrOps = {
    // System
    getSystemStatus: this.api.getApiV1SystemStatus,
    getHealth: this.api.getApiV1Health,

    // Tags
    getTags: this.api.getApiV1Tag,
    createTag: this.api.postApiV1Tag,
    getTagById: this.api.getApiV1TagById,
    updateTagById: this.api.putApiV1TagById,
    deleteTagById: this.api.deleteApiV1TagById,
    getTagDetails: this.api.getApiV1TagDetail,
    getTagDetailById: this.api.getApiV1TagDetailById,

    // Notifications
    getNotifications: this.api.getApiV1Notification,
    createNotification: this.api.postApiV1Notification,
    getNotificationById: this.api.getApiV1NotificationById,
    updateNotificationById: this.api.putApiV1NotificationById,
    deleteNotificationById: this.api.deleteApiV1NotificationById,
    getNotificationSchema: this.api.getApiV1NotificationSchema,
    testNotification: this.api.postApiV1NotificationTest,
    testAllNotifications: this.api.postApiV1NotificationTestall,

    // Download Clients
    getDownloadClients: this.api.getApiV1Downloadclient,
    createDownloadClient: this.api.postApiV1Downloadclient,
    getDownloadClientById: this.api.getApiV1DownloadclientById,
    updateDownloadClientById: this.api.putApiV1DownloadclientById,
    deleteDownloadClientById: this.api.deleteApiV1DownloadclientById,
    getDownloadClientSchema: this.api.getApiV1DownloadclientSchema,
    testDownloadClient: this.api.postApiV1DownloadclientTest,
    testAllDownloadClients: this.api.postApiV1DownloadclientTestall,

    // Indexers
    getIndexers: this.api.getApiV1Indexer,
    createIndexer: this.api.postApiV1Indexer,
    getIndexerById: this.api.getApiV1IndexerById,
    updateIndexerById: this.api.putApiV1IndexerById,
    deleteIndexerById: this.api.deleteApiV1IndexerById,
    getIndexerSchema: this.api.getApiV1IndexerSchema,
    testIndexer: this.api.postApiV1IndexerTest,
    testAllIndexers: this.api.postApiV1IndexerTestall,

    // System Admin
    restartSystem: this.api.postApiV1SystemRestart,
    shutdownSystem: this.api.postApiV1SystemShutdown,
    getBackups: this.api.getApiV1SystemBackup,
    deleteBackup: this.api.deleteApiV1SystemBackupById,
    restoreBackup: this.api.postApiV1SystemBackupRestoreById,
    uploadBackup: this.api.postApiV1SystemBackupRestoreUpload,
    getLogFiles: this.api.getApiV1LogFile,
    getLogFileByName: this.api.getApiV1LogFileByFilename,

    // Commands
    runCommand: this.api.postApiV1Command,
    getCommands: this.api.getApiV1Command,

    // Host Config
    getHostConfig: this.api.getApiV1ConfigHost,
    getHostConfigById: this.api.getApiV1ConfigHostById,
    updateHostConfig: this.api.putApiV1ConfigHostById,

    // UI Config
    getUiConfig: this.api.getApiV1ConfigUi,
    getUiConfigById: this.api.getApiV1ConfigUiById,
    updateUiConfig: this.api.putApiV1ConfigUiById,
  };

  constructor(config: ServarrClientConfig) {
    super(config, createClient(createConfig({ baseUrl: 'http://localhost' })));
  }

  // Prowlarr-specific APIs

  // Indexer Stats APIs

  /**
   * Get indexer statistics
   */
  async getIndexerStats() {
    return this.api.getApiV1Indexerstats();
  }

  // Search APIs

  /**
   * Search across all or specific indexers
   */
  async search(query: string, indexerIds?: number[]) {
    return this.api.getApiV1Search({
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
    return this.api.getApiV1Applications();
  }

  /**
   * Get a specific application by ID
   */
  async getApplication(id: number) {
    return this.api.getApiV1ApplicationsById({ path: { id } });
  }

  /**
   * Add a new application
   */
  async addApplication(application: ApplicationResource) {
    return this.api.postApiV1Applications({ body: application });
  }

  /**
   * Update an existing application
   */
  async updateApplication(id: number, application: ApplicationResource) {
    return this.api.putApiV1ApplicationsById({ path: { id: String(id) }, body: application });
  }

  /**
   * Delete an application
   */
  async deleteApplication(id: number) {
    return this.api.deleteApiV1ApplicationsById({ path: { id } });
  }

  /**
   * Test an application configuration
   */
  async testApplication(application: ApplicationResource) {
    return this.api.postApiV1ApplicationsTest({ body: application });
  }

  /**
   * Test all applications
   */
  async testAllApplications() {
    return this.api.postApiV1ApplicationsTestall();
  }

  /**
   * Get application schema for available application types
   */
  async getApplicationSchema() {
    return this.api.getApiV1ApplicationsSchema();
  }

  // Development Configuration APIs

  /**
   * Get development configuration settings
   */
  async getDevelopmentConfig() {
    return this.api.getApiV1ConfigDevelopment();
  }

  /**
   * Get development configuration by ID
   */
  async getDevelopmentConfigById(id: number) {
    return this.api.getApiV1ConfigDevelopmentById({ path: { id } });
  }

  /**
   * Update development configuration
   */
  async updateDevelopmentConfig(id: number, config: DevelopmentConfigResource) {
    return this.api.putApiV1ConfigDevelopmentById({ path: { id: String(id) }, body: config });
  }

  // System Logs API

  /**
   * Get system logs
   */
  async getSystemLogs() {
    return this.api.getApiV1Log();
  }
}

// Re-export types for external consumption
export * from './prowlarr-types.js';
