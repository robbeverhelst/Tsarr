# Changelog

All notable changes to TsArr will be documented in this file.

## [1.0.0] - 2025-09-01

### 🎉 Initial Release

**Complete TypeScript SDK for the Servarr ecosystem**

### Added
- **Full API Support**: Complete TypeScript clients for all 5 Servarr applications
  - RadarrClient - Movie management
  - SonarrClient - TV show management  
  - LidarrClient - Music management
  - ReadarrClient - Book management
  - ProwlarrClient - Indexer management

- **Production Features**:
  - Type-safe API clients generated from official OpenAPI specs
  - Tree-shakable exports for minimal bundle size
  - Comprehensive error handling and validation
  - JSDoc documentation for all public APIs
  - Environment variable configuration support

- **Real-world Tested**:
  - Successfully tested with live Radarr instance
  - Bulk movie import functionality (2,281+ files)
  - Metadata matching and library management
  - File import and processing workflows

- **Developer Experience**:
  - Bun runtime optimization
  - Biome linting and formatting
  - Automated CI pipeline with daily OpenAPI updates
  - Comprehensive test suite
  - Performance benchmarks

- **Documentation**:
  - Complete usage guide with examples
  - IaC integration guides (Docker, Kubernetes, Terraform, Helm, Ansible)
  - Real-world automation examples
  - API reference documentation

- **Infrastructure**:
  - Automated client regeneration from upstream APIs
  - Docker and Kubernetes deployment examples
  - CI/CD pipeline with automated dependency updates
  - Production-ready package configuration

### Performance
- ⚡ Client initialization: <0.1ms
- 💾 Memory footprint: ~2MB heap usage
- 📦 Bundle size: 305KB (minified)
- 🌳 Tree-shakable: Import only what you need

### Supported Versions
- **Bun**: >=1.0.0
- **TypeScript**: >=5.0.0
- **Node.js**: >=18.0.0 (via Bun compatibility)

### API Versions
- Radarr v3 API
- Sonarr v5 API  
- Lidarr v1 API
- Readarr v1 API
- Prowlarr v1 API