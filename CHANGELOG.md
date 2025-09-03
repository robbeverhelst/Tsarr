# [1.3.0](https://github.com/robbeverhelst/tsarr/compare/v1.2.0...v1.3.0) (2025-09-03)


### Features

* update API client generation with improved TypeScript compatibility ([f2ace59](https://github.com/robbeverhelst/tsarr/commit/f2ace590766a3bdfdb0c0482695d126ac57207f6))

# [1.2.0](https://github.com/robbeverhelst/tsarr/compare/v1.1.3...v1.2.0) (2025-09-02)


### Bug Fixes

* correct formatting of the "files" field in package.json for consistency ([1963e17](https://github.com/robbeverhelst/tsarr/commit/1963e17812ae3c474666cefdb253d77fea87d470))


### Features

* update Sonarr API client to use v3 endpoints and add system status and health check methods ([2fda362](https://github.com/robbeverhelst/tsarr/commit/2fda3627e67f2552e1932490eceebe83dd65d56b))

## [1.1.3](https://github.com/robbeverhelst/tsarr/compare/v1.1.2...v1.1.3) (2025-09-02)


### Bug Fixes

* correct formatting of the "files" field in package.json for consistency ([9c66bcd](https://github.com/robbeverhelst/tsarr/commit/9c66bcd8f0bd6a8dd7e41ee6f412ccc51754e1d6))
* standardize capitalization of "Tsarr" across documentation and codebase ([74f7046](https://github.com/robbeverhelst/tsarr/commit/74f70465cb8418326e95a480e1a03aadfffb9fce))

## [1.1.2](https://github.com/robbeverhelst/tsarr/compare/v1.1.1...v1.1.2) (2025-09-01)


### Bug Fixes

* correct formatting of the "files" field in package.json for consistency ([7a3ca2e](https://github.com/robbeverhelst/tsarr/commit/7a3ca2ea941a3ee85f7fc8e90f0f78c84c8bf8ae))
* update build types script to use tsconfig.build.json for improved type declaration management ([931a442](https://github.com/robbeverhelst/tsarr/commit/931a442d8a808e0e899cde5ff43c694ed8da541c))

## [1.1.1](https://github.com/robbeverhelst/tsarr/compare/v1.1.0...v1.1.1) (2025-09-01)


### Bug Fixes

* correct formatting of the "files" field in package.json for consistency ([e6c8c44](https://github.com/robbeverhelst/tsarr/commit/e6c8c444ebf99f262477f21a19bb95a32f9536d7))
* update build scripts for improved modularity and clarity ([7dbbb07](https://github.com/robbeverhelst/tsarr/commit/7dbbb0754a63e88db685d62282309f3623c1b418))

# [1.1.0](https://github.com/robbeverhelst/tsarr/compare/v1.0.0...v1.1.0) (2025-09-01)


### Features

* add example scripts for library backup, health monitoring, cleanup, missing episodes, and quality analysis ([e868f04](https://github.com/robbeverhelst/tsarr/commit/e868f043dffee690fea7683c77e8625fc24a1145))
* enhance type safety in API client methods by replacing 'any' with specific resource types ([2a468cc](https://github.com/robbeverhelst/tsarr/commit/2a468cc43c9a48fc5f3be2a3effbdc5f062cb6ac))

# 1.0.0 (2025-09-01)


### Bug Fixes

* update ProwlarrClient to conditionally include indexerIds in search query ([8212dd3](https://github.com/robbeverhelst/tsarr/commit/8212dd32df9c64195d0d3011cf8b35ea848caac4))


### Features

* add API client generation scripts and example usage for Radarr and Sonarr ([9b64546](https://github.com/robbeverhelst/tsarr/commit/9b64546cc7f14e6e05a205dfa524a213e60e312c))
* add Lidarr, Readarr, and Prowlarr client classes and generation scripts for enhanced media management ([e255ce6](https://github.com/robbeverhelst/tsarr/commit/e255ce6a15e1e9539ae27e238a63e331a4303778))
* implement Radarr and Sonarr client classes with example scripts for movie and series management ([e498293](https://github.com/robbeverhelst/tsarr/commit/e498293a4d86f0fe6e878bf5d48decb30a1725a4))
* initialize Tsarr project with TypeScript SDK for Servarr APIs ([7625451](https://github.com/robbeverhelst/tsarr/commit/7625451d2a5487624a7d35c8e4135e6d6951ec1a))
* release version 1.0.0 with comprehensive TypeScript SDK for Servarr APIs ([5b1e963](https://github.com/robbeverhelst/tsarr/commit/5b1e963602b056b54418a6b696b94ca0577b93a0))

# Changelog

All notable changes to Tsarr will be documented in this file.

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
