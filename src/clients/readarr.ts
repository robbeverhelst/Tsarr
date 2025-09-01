import { createServarrClient } from '../core/client.js';
import type { ServarrClientConfig } from '../core/types.js';
import * as ReadarrApi from '../generated/readarr/index.js';

export class ReadarrClient {
  private clientConfig: ReturnType<typeof createServarrClient>;

  constructor(config: ServarrClientConfig) {
    this.clientConfig = createServarrClient(config);
    
    ReadarrApi.client.setConfig({
      baseUrl: this.clientConfig.getBaseUrl(),
      headers: this.clientConfig.getHeaders(),
    });
  }

  // System APIs
  async getSystemStatus() {
    return ReadarrApi.getApiV1SystemStatus();
  }

  async getHealth() {
    return ReadarrApi.getApiV1Health();
  }

  // Author APIs
  async getAuthors() {
    return ReadarrApi.getApiV1Author();
  }

  async getAuthor(id: number) {
    return ReadarrApi.getApiV1AuthorById({ path: { id } });
  }

  async addAuthor(author: any) {
    return ReadarrApi.postApiV1Author({ body: author });
  }

  async updateAuthor(id: number, author: any) {
    return ReadarrApi.putApiV1AuthorById({ path: { id: String(id) }, body: author });
  }

  async deleteAuthor(id: number) {
    return ReadarrApi.deleteApiV1AuthorById({ path: { id } });
  }

  // Book APIs
  async getBooks() {
    return ReadarrApi.getApiV1Book();
  }

  async getBook(id: number) {
    return ReadarrApi.getApiV1BookById({ path: { id } });
  }

  // Search APIs
  async searchAuthors(term: string) {
    return ReadarrApi.getApiV1AuthorLookup({ query: { term } });
  }

  // Command APIs
  async runCommand(command: any) {
    return ReadarrApi.postApiV1Command({ body: command });
  }

  async getCommands() {
    return ReadarrApi.getApiV1Command();
  }

  // Root folder APIs
  async getRootFolders() {
    return ReadarrApi.getApiV1Rootfolder();
  }

  async addRootFolder(path: string) {
    return ReadarrApi.postApiV1Rootfolder({ 
      body: { path } 
    });
  }

  updateConfig(newConfig: Partial<ServarrClientConfig>) {
    const updatedConfig = { ...this.clientConfig.config, ...newConfig };
    this.clientConfig = createServarrClient(updatedConfig);
    
    ReadarrApi.client.setConfig({
      baseUrl: this.clientConfig.getBaseUrl(),
      headers: this.clientConfig.getHeaders(),
    });
    
    return this.clientConfig.config;
  }
}