import { createServarrClient } from '../core/client';
import type { ServarrClientConfig } from '../core/types';

type ApiCall = (...args: any[]) => Promise<any>;

export interface ServarrOps {
  // System
  getSystemStatus: ApiCall;
  getHealth: ApiCall;

  // Tags
  getTags: ApiCall;
  createTag: ApiCall;
  getTagById: ApiCall;
  updateTagById: ApiCall;
  deleteTagById: ApiCall;
  getTagDetails: ApiCall;
  getTagDetailById: ApiCall;

  // Notifications
  getNotifications: ApiCall;
  createNotification: ApiCall;
  getNotificationById: ApiCall;
  updateNotificationById: ApiCall;
  deleteNotificationById: ApiCall;
  getNotificationSchema: ApiCall;
  testNotification: ApiCall;
  testAllNotifications: ApiCall;

  // Download Clients
  getDownloadClients: ApiCall;
  createDownloadClient: ApiCall;
  getDownloadClientById: ApiCall;
  updateDownloadClientById: ApiCall;
  deleteDownloadClientById: ApiCall;
  getDownloadClientSchema: ApiCall;
  testDownloadClient: ApiCall;
  testAllDownloadClients: ApiCall;

  // Indexers
  getIndexers: ApiCall;
  createIndexer: ApiCall;
  getIndexerById: ApiCall;
  updateIndexerById: ApiCall;
  deleteIndexerById: ApiCall;
  getIndexerSchema: ApiCall;
  testIndexer: ApiCall;
  testAllIndexers: ApiCall;

  // System Admin
  restartSystem: ApiCall;
  shutdownSystem: ApiCall;
  getBackups: ApiCall;
  deleteBackup: ApiCall;
  restoreBackup: ApiCall;
  uploadBackup: ApiCall;
  getLogFiles: ApiCall;
  getLogFileByName: ApiCall;

  // Commands
  runCommand: ApiCall;
  getCommands: ApiCall;

  // Host Config
  getHostConfig: ApiCall;
  getHostConfigById: ApiCall;
  updateHostConfig: ApiCall;

  // UI Config
  getUiConfig: ApiCall;
  getUiConfigById: ApiCall;
  updateUiConfig: ApiCall;
}

export abstract class ServarrBaseClient {
  protected clientConfig: ReturnType<typeof createServarrClient>;

  protected abstract readonly ops: ServarrOps;

  constructor(config: ServarrClientConfig) {
    this.clientConfig = createServarrClient(config);
    this.configureRawClient();
  }

  protected abstract configureRawClient(): void;

  protected getClientConfig() {
    return {
      baseUrl: this.clientConfig.getBaseUrl(),
      headers: this.clientConfig.getHeaders(),
      signal: AbortSignal.timeout(this.clientConfig.getTimeout()),
    };
  }

  // System APIs

  async getSystemStatus() {
    return this.ops.getSystemStatus();
  }

  async getHealth() {
    return this.ops.getHealth();
  }

  // Tag Management APIs

  async getTags() {
    return this.ops.getTags();
  }

  async addTag(tag: { id?: number; label?: string | null }) {
    return this.ops.createTag({ body: tag });
  }

  async getTag(id: number) {
    return this.ops.getTagById({ path: { id } });
  }

  async updateTag(id: number | string, tag: { id?: number; label?: string | null }) {
    return this.ops.updateTagById({ path: { id: String(id) }, body: tag });
  }

  async deleteTag(id: number) {
    return this.ops.deleteTagById({ path: { id } });
  }

  async getTagDetails() {
    return this.ops.getTagDetails();
  }

  async getTagDetailById(id: number) {
    return this.ops.getTagDetailById({ path: { id } });
  }

  // Notification APIs

  async getNotifications() {
    return this.ops.getNotifications();
  }

  async getNotification(id: number) {
    return this.ops.getNotificationById({ path: { id } });
  }

  async addNotification(notification: Record<string, unknown>) {
    return this.ops.createNotification({ body: notification });
  }

  async updateNotification(id: number | string, notification: Record<string, unknown>) {
    return this.ops.updateNotificationById({ path: { id: String(id) }, body: notification });
  }

  async deleteNotification(id: number) {
    return this.ops.deleteNotificationById({ path: { id } });
  }

  async getNotificationSchema() {
    return this.ops.getNotificationSchema();
  }

  async testNotification(notification: Record<string, unknown>) {
    return this.ops.testNotification({ body: notification });
  }

  async testAllNotifications() {
    return this.ops.testAllNotifications();
  }

  // Download Client APIs

  async getDownloadClients() {
    return this.ops.getDownloadClients();
  }

  async getDownloadClient(id: number) {
    return this.ops.getDownloadClientById({ path: { id } });
  }

  async addDownloadClient(client: Record<string, unknown>) {
    return this.ops.createDownloadClient({ body: client });
  }

  async updateDownloadClient(id: number | string, client: Record<string, unknown>) {
    return this.ops.updateDownloadClientById({ path: { id: String(id) }, body: client });
  }

  async deleteDownloadClient(id: number) {
    return this.ops.deleteDownloadClientById({ path: { id } });
  }

  async getDownloadClientSchema() {
    return this.ops.getDownloadClientSchema();
  }

  async testDownloadClient(client: Record<string, unknown>) {
    return this.ops.testDownloadClient({ body: client });
  }

  async testAllDownloadClients() {
    return this.ops.testAllDownloadClients();
  }

  // Indexer APIs

  async getIndexers() {
    return this.ops.getIndexers();
  }

  async getIndexer(id: number) {
    return this.ops.getIndexerById({ path: { id } });
  }

  async addIndexer(indexer: Record<string, unknown>) {
    return this.ops.createIndexer({ body: indexer });
  }

  async updateIndexer(id: number | string, indexer: Record<string, unknown>) {
    return this.ops.updateIndexerById({ path: { id: String(id) }, body: indexer });
  }

  async deleteIndexer(id: number) {
    return this.ops.deleteIndexerById({ path: { id } });
  }

  async getIndexerSchema() {
    return this.ops.getIndexerSchema();
  }

  async testIndexer(indexer: Record<string, unknown>) {
    return this.ops.testIndexer({ body: indexer });
  }

  async testAllIndexers() {
    return this.ops.testAllIndexers();
  }

  // System Administration APIs

  async restartSystem() {
    return this.ops.restartSystem();
  }

  async shutdownSystem() {
    return this.ops.shutdownSystem();
  }

  async getSystemBackups() {
    return this.ops.getBackups();
  }

  async deleteSystemBackup(id: number) {
    return this.ops.deleteBackup({ path: { id } });
  }

  async restoreSystemBackup(id: number) {
    return this.ops.restoreBackup({ path: { id } });
  }

  async uploadSystemBackup() {
    return this.ops.uploadBackup();
  }

  async getLogFiles() {
    return this.ops.getLogFiles();
  }

  async getLogFileByName(filename: string) {
    return this.ops.getLogFileByName({ path: { filename } });
  }

  // Command APIs

  async runCommand(command: Record<string, unknown>) {
    return this.ops.runCommand({ body: command });
  }

  async getCommands() {
    return this.ops.getCommands();
  }

  // Host Configuration APIs

  async getHostConfig() {
    return this.ops.getHostConfig();
  }

  async getHostConfigById(id: number) {
    return this.ops.getHostConfigById({ path: { id } });
  }

  async updateHostConfig(id: number | string, config: Record<string, unknown>) {
    return this.ops.updateHostConfig({ path: { id: String(id) }, body: config });
  }

  // UI Configuration APIs

  async getUiConfig() {
    return this.ops.getUiConfig();
  }

  async getUiConfigById(id: number) {
    return this.ops.getUiConfigById({ path: { id } });
  }

  async updateUiConfig(id: number | string, config: Record<string, unknown>) {
    return this.ops.updateUiConfig({ path: { id: String(id) }, body: config });
  }

  // Update configuration
  updateConfig(newConfig: Partial<ServarrClientConfig>) {
    const updatedConfig = { ...this.clientConfig.config, ...newConfig };
    this.clientConfig = createServarrClient(updatedConfig);
    this.configureRawClient();
    return this.clientConfig.config;
  }
}
