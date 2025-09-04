import { createServarrClient } from '../core/client.js';
import type { ServarrClientConfig } from '../core/types.js';
import { client as prowlarrClient } from '../generated/prowlarr/client.gen.js';
import * as ProwlarrApi from '../generated/prowlarr/index.js';
import type {
  ApplicationResource,
  CommandResource,
  DevelopmentConfigResource,
  HostConfigResource,
  IndexerResource,
  NotificationResource,
  TagResource,
  UiConfigResource,
} from '../generated/prowlarr/types.gen.js';

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
export class ProwlarrClient {
  private clientConfig: ReturnType<typeof createServarrClient>;

  constructor(config: ServarrClientConfig) {
    this.clientConfig = createServarrClient(config);

    // Configure the raw client for manual endpoints
    prowlarrClient.setConfig({
      baseUrl: this.clientConfig.getBaseUrl(),
      headers: this.clientConfig.getHeaders(),
    });
  }

  // System APIs
  async getSystemStatus() {
    return ProwlarrApi.getApiV1SystemStatus();
  }

  async getHealth() {
    return ProwlarrApi.getApiV1Health();
  }

  // Indexer APIs

  /**
   * Get all configured indexers
   */
  async getIndexers() {
    return ProwlarrApi.getApiV1Indexer();
  }

  async getIndexer(id: number) {
    return ProwlarrApi.getApiV1IndexerById({ path: { id } });
  }

  async addIndexer(indexer: IndexerResource) {
    return ProwlarrApi.postApiV1Indexer({ body: indexer });
  }

  async updateIndexer(id: number, indexer: IndexerResource) {
    return ProwlarrApi.putApiV1IndexerById({ path: { id: String(id) }, body: indexer });
  }

  async deleteIndexer(id: number) {
    return ProwlarrApi.deleteApiV1IndexerById({ path: { id } });
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
  async getApplications() {
    return ProwlarrApi.getApiV1Applications();
  }

  // Command APIs
  async runCommand(command: CommandResource) {
    return ProwlarrApi.postApiV1Command({ body: command });
  }

  async getCommands() {
    return ProwlarrApi.getApiV1Command();
  }

  // Configuration Management APIs

  /**
   * Get host configuration settings
   */
  async getHostConfig() {
    return ProwlarrApi.getApiV1ConfigHost();
  }

  /**
   * Get host configuration by ID
   */
  async getHostConfigById(id: number) {
    return ProwlarrApi.getApiV1ConfigHostById({ path: { id } });
  }

  /**
   * Update host configuration
   */
  async updateHostConfig(id: number, config: HostConfigResource) {
    return ProwlarrApi.putApiV1ConfigHostById({ path: { id: String(id) }, body: config });
  }

  /**
   * Get UI configuration settings
   */
  async getUiConfig() {
    return ProwlarrApi.getApiV1ConfigUi();
  }

  /**
   * Get UI configuration by ID
   */
  async getUiConfigById(id: number) {
    return ProwlarrApi.getApiV1ConfigUiById({ path: { id } });
  }

  /**
   * Update UI configuration
   */
  async updateUiConfig(id: number, config: UiConfigResource) {
    return ProwlarrApi.putApiV1ConfigUiById({ path: { id: String(id) }, body: config });
  }

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

  // System Administration APIs

  /**
   * Restart the Prowlarr application
   */
  async restartSystem() {
    return ProwlarrApi.postApiV1SystemRestart();
  }

  /**
   * Shutdown the Prowlarr application
   */
  async shutdownSystem() {
    return ProwlarrApi.postApiV1SystemShutdown();
  }

  /**
   * Get system backup files
   */
  async getSystemBackups() {
    return ProwlarrApi.getApiV1SystemBackup();
  }

  /**
   * Delete a system backup by ID
   */
  async deleteSystemBackup(id: number) {
    return ProwlarrApi.deleteApiV1SystemBackupById({ path: { id } });
  }

  /**
   * Restore system backup by ID
   */
  async restoreSystemBackup(id: number) {
    return ProwlarrApi.postApiV1SystemBackupRestoreById({ path: { id } });
  }

  /**
   * Upload and restore system backup
   */
  async uploadSystemBackup() {
    return ProwlarrApi.postApiV1SystemBackupRestoreUpload();
  }

  /**
   * Get system logs
   */
  async getSystemLogs() {
    return ProwlarrApi.getApiV1Log();
  }

  /**
   * Get log files
   */
  async getLogFiles() {
    return ProwlarrApi.getApiV1LogFile();
  }

  /**
   * Get specific log file by filename
   */
  async getLogFileByName(filename: string) {
    return ProwlarrApi.getApiV1LogFileByFilename({ path: { filename } });
  }

  // Tag Management APIs

  /**
   * Get all tags
   */
  async getTags() {
    return ProwlarrApi.getApiV1Tag();
  }

  /**
   * Add a new tag
   */
  async addTag(tag: TagResource) {
    return ProwlarrApi.postApiV1Tag({ body: tag });
  }

  /**
   * Get a specific tag by ID
   */
  async getTag(id: number) {
    return ProwlarrApi.getApiV1TagById({ path: { id } });
  }

  /**
   * Update an existing tag
   */
  async updateTag(id: number, tag: TagResource) {
    return ProwlarrApi.putApiV1TagById({ path: { id: String(id) }, body: tag });
  }

  /**
   * Delete a tag
   */
  async deleteTag(id: number) {
    return ProwlarrApi.deleteApiV1TagById({ path: { id } });
  }

  /**
   * Get detailed tag information
   */
  async getTagDetails() {
    return ProwlarrApi.getApiV1TagDetail();
  }

  /**
   * Get detailed tag information by ID
   */
  async getTagDetailById(id: number) {
    return ProwlarrApi.getApiV1TagDetailById({ path: { id } });
  }

  // Application APIs (Enhanced)

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

  // Enhanced Indexer APIs

  /**
   * Get indexer schema for available indexer types
   */
  async getIndexerSchema() {
    return ProwlarrApi.getApiV1IndexerSchema();
  }

  /**
   * Test an indexer configuration
   */
  async testIndexer(indexer: IndexerResource) {
    return ProwlarrApi.postApiV1IndexerTest({ body: indexer });
  }

  /**
   * Test all indexers
   */
  async testAllIndexers() {
    return ProwlarrApi.postApiV1IndexerTestall();
  }

  // Notification APIs

  /**
   * Get all notification providers
   */
  async getNotifications() {
    return ProwlarrApi.getApiV1Notification();
  }

  /**
   * Get a specific notification provider by ID
   */
  async getNotification(id: number) {
    return ProwlarrApi.getApiV1NotificationById({ path: { id } });
  }

  /**
   * Add a new notification provider
   */
  async addNotification(notification: NotificationResource) {
    return ProwlarrApi.postApiV1Notification({ body: notification });
  }

  /**
   * Update an existing notification provider
   */
  async updateNotification(id: number, notification: NotificationResource) {
    return ProwlarrApi.putApiV1NotificationById({ path: { id: String(id) }, body: notification });
  }

  /**
   * Delete a notification provider
   */
  async deleteNotification(id: number) {
    return ProwlarrApi.deleteApiV1NotificationById({ path: { id } });
  }

  /**
   * Get notification schema for available notification types
   */
  async getNotificationSchema() {
    return ProwlarrApi.getApiV1NotificationSchema();
  }

  /**
   * Test a notification configuration
   */
  async testNotification(notification: NotificationResource) {
    return ProwlarrApi.postApiV1NotificationTest({ body: notification });
  }

  /**
   * Test all notifications
   */
  async testAllNotifications() {
    return ProwlarrApi.postApiV1NotificationTestall();
  }

  updateConfig(newConfig: Partial<ServarrClientConfig>) {
    const updatedConfig = { ...this.clientConfig.config, ...newConfig };
    this.clientConfig = createServarrClient(updatedConfig);

    return this.clientConfig.config;
  }
}
