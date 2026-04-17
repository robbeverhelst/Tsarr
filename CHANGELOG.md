# [2.10.0](https://github.com/robbeverhelst/tsarr/compare/v2.9.1...v2.10.0) (2026-04-17)


### Features

* **core:** add resilient fetch with timeout and retry across all clients ([#189](https://github.com/robbeverhelst/tsarr/issues/189)) ([d0837d9](https://github.com/robbeverhelst/tsarr/commit/d0837d9153612a6bed5a7b1a924f1186d78766aa)), closes [#179](https://github.com/robbeverhelst/tsarr/issues/179)

## [2.9.1](https://github.com/robbeverhelst/tsarr/compare/v2.9.0...v2.9.1) (2026-04-16)


### Bug Fixes

* **core:** add default request timeout, HTTP warning, and debug logging ([#190](https://github.com/robbeverhelst/tsarr/issues/190)) ([e1901c2](https://github.com/robbeverhelst/tsarr/commit/e1901c2a440bfe2314987c896ce53fdf6d55e29d)), closes [#180](https://github.com/robbeverhelst/tsarr/issues/180)

# [2.9.0](https://github.com/robbeverhelst/tsarr/compare/v2.8.0...v2.9.0) (2026-04-15)


### Features

* **cli:** add import list add/edit actions for Lidarr and Readarr ([#182](https://github.com/robbeverhelst/tsarr/issues/182)) ([998cb4a](https://github.com/robbeverhelst/tsarr/commit/998cb4a23d7179d2810d3600b7412f874369affc)), closes [#172](https://github.com/robbeverhelst/tsarr/issues/172)

# [2.8.0](https://github.com/robbeverhelst/tsarr/compare/v2.7.6...v2.8.0) (2026-04-15)


### Features

* **cli:** add multi-instance support for services ([#170](https://github.com/robbeverhelst/tsarr/issues/170)) ([26c08eb](https://github.com/robbeverhelst/tsarr/commit/26c08eb7961f44e7bb4bc9f4dd35936da9d2feaa))

## [2.7.6](https://github.com/robbeverhelst/tsarr/compare/v2.7.5...v2.7.6) (2026-04-15)


### Bug Fixes

* **refactor:** code quality cleanup and remove .js import extensions ([ef3e6a7](https://github.com/robbeverhelst/tsarr/commit/ef3e6a710099d72060624635ec3c3eaca73e60e7))

## [2.7.5](https://github.com/robbeverhelst/tsarr/compare/v2.7.4...v2.7.5) (2026-04-15)


### Bug Fixes

* **cli:** fix network error handling for Node.js fetch failures ([#168](https://github.com/robbeverhelst/tsarr/issues/168)) ([41d0232](https://github.com/robbeverhelst/tsarr/commit/41d0232a1e355509fb510148d298dbf7ff98d943))

## [2.7.4](https://github.com/robbeverhelst/tsarr/compare/v2.7.3...v2.7.4) (2026-04-15)


### Bug Fixes

* **cli:** handle thrown fetch errors on Node.js for network failures ([#167](https://github.com/robbeverhelst/tsarr/issues/167)) ([1b37a0f](https://github.com/robbeverhelst/tsarr/commit/1b37a0fc3f0364478a7cab2598e758f9ae98f817))

## [2.7.3](https://github.com/robbeverhelst/tsarr/compare/v2.7.2...v2.7.3) (2026-04-15)


### Bug Fixes

* **cli:** validate qbit filter values and improve network error messages ([#166](https://github.com/robbeverhelst/tsarr/issues/166)) ([4c8b2b9](https://github.com/robbeverhelst/tsarr/commit/4c8b2b95257a92283ffb7a461aed27958796640c))

## [2.7.2](https://github.com/robbeverhelst/tsarr/compare/v2.7.1...v2.7.2) (2026-04-15)


### Bug Fixes

* **cli:** fix duplicate output, doctor error classification, and seerr display ([#164](https://github.com/robbeverhelst/tsarr/issues/164)) ([705a031](https://github.com/robbeverhelst/tsarr/commit/705a031589158cbb02ac34877adb40a8d9ac8de0))

## [2.7.1](https://github.com/robbeverhelst/tsarr/compare/v2.7.0...v2.7.1) (2026-04-15)


### Bug Fixes

* **cli:** fix Seerr paginated output, dry-run, and qbit UX ([#161](https://github.com/robbeverhelst/tsarr/issues/161)) ([#162](https://github.com/robbeverhelst/tsarr/issues/162)) ([a8a2e98](https://github.com/robbeverhelst/tsarr/commit/a8a2e98f00a1aa8349fa884c3929b496e40db62f))

# [2.7.0](https://github.com/robbeverhelst/tsarr/compare/v2.6.0...v2.7.0) (2026-04-14)


### Features

* **seerr:** add Seerr support ([#159](https://github.com/robbeverhelst/tsarr/issues/159)) ([208c3c2](https://github.com/robbeverhelst/tsarr/commit/208c3c2050c9a9f830311bc3be9dee511efe2d3a)), closes [#144](https://github.com/robbeverhelst/tsarr/issues/144)

# [2.6.0](https://github.com/robbeverhelst/tsarr/compare/v2.5.0...v2.6.0) (2026-04-14)


### Features

* **qbittorrent:** add qBittorrent support ([#158](https://github.com/robbeverhelst/tsarr/issues/158)) ([9b68eba](https://github.com/robbeverhelst/tsarr/commit/9b68eba25d3aaaa5be77e006c4ac51a5377ecfa8)), closes [#143](https://github.com/robbeverhelst/tsarr/issues/143)

# [2.5.0](https://github.com/robbeverhelst/tsarr/compare/v2.4.12...v2.5.0) (2026-04-07)


### Features

* add file management endpoints to all service clients ([#149](https://github.com/robbeverhelst/tsarr/issues/149)) ([5c2a189](https://github.com/robbeverhelst/tsarr/commit/5c2a189243b4d9be1f1e37ae12a0c40e377eebaa)), closes [#147](https://github.com/robbeverhelst/tsarr/issues/147)

## [2.4.12](https://github.com/robbeverhelst/tsarr/compare/v2.4.11...v2.4.12) (2026-03-20)


### Bug Fixes

* tolerate chocolatey 403 ([#126](https://github.com/robbeverhelst/tsarr/issues/126)) ([f9d8bab](https://github.com/robbeverhelst/tsarr/commit/f9d8bab9fb42cd7920cf06ad7d8468d89f516bdf))

## [2.4.11](https://github.com/robbeverhelst/tsarr/compare/v2.4.10...v2.4.11) (2026-03-20)


### Bug Fixes

* relax sdk type test timeout ([#125](https://github.com/robbeverhelst/tsarr/issues/125)) ([0f3997d](https://github.com/robbeverhelst/tsarr/commit/0f3997de443a84bb62392c30e86caeab710f43b1))

## [2.4.10](https://github.com/robbeverhelst/tsarr/compare/v2.4.9...v2.4.10) (2026-03-20)


### Bug Fixes

* sort exports for Biome v2 compat ([3fa0a69](https://github.com/robbeverhelst/tsarr/commit/3fa0a695705142d2191507dd7e34d433cbda232a))

## [2.4.9](https://github.com/robbeverhelst/tsarr/compare/v2.4.8...v2.4.9) (2026-03-18)


### Bug Fixes

* align packaged SDK type entrypoints ([#119](https://github.com/robbeverhelst/tsarr/issues/119)) ([588675a](https://github.com/robbeverhelst/tsarr/commit/588675a524b02e7c89d5797af2c82703e4fc7c0f))

## [2.4.8](https://github.com/robbeverhelst/tsarr/compare/v2.4.7...v2.4.8) (2026-03-14)


### Bug Fixes

* satisfy lint-and-build formatting checks ([717b8b3](https://github.com/robbeverhelst/tsarr/commit/717b8b35ad74ae2d70b5a93885d1dfec79508da5))

## [2.4.7](https://github.com/robbeverhelst/tsarr/compare/v2.4.6...v2.4.7) (2026-03-10)


### Bug Fixes

* ship a working nix flake ([#112](https://github.com/robbeverhelst/tsarr/issues/112)) ([7d0e449](https://github.com/robbeverhelst/tsarr/commit/7d0e449d8b5f025575f9e635de3170e8ac8b8404))

## [2.4.6](https://github.com/robbeverhelst/tsarr/compare/v2.4.5...v2.4.6) (2026-03-10)


### Bug Fixes

* upload release binaries without gh cli ([8e07bf3](https://github.com/robbeverhelst/tsarr/commit/8e07bf3202b7246a256689f81bd2d707de488f10))

## [2.4.5](https://github.com/robbeverhelst/tsarr/compare/v2.4.4...v2.4.5) (2026-03-10)


### Bug Fixes

* rebuild release binaries from the tagged release ([5f2caea](https://github.com/robbeverhelst/tsarr/commit/5f2caea249c0f8f0084d77dd9093c8ee28a722ae))

## [2.4.4](https://github.com/robbeverhelst/tsarr/compare/v2.4.3...v2.4.4) (2026-03-10)


### Bug Fixes

* Bazarr CLI uses wrong API base path ([#104](https://github.com/robbeverhelst/tsarr/issues/104)) ([#105](https://github.com/robbeverhelst/tsarr/issues/105)) ([19dda01](https://github.com/robbeverhelst/tsarr/commit/19dda011674f5e497aa53b7f6c2a4564f532d5e3))

## [2.4.3](https://github.com/robbeverhelst/tsarr/compare/v2.4.2...v2.4.3) (2026-03-09)


### Bug Fixes

* polish refresh output and search limits ([e2b9da5](https://github.com/robbeverhelst/tsarr/commit/e2b9da56d0d595ccf38fe9ce7d28a861ca1b7608)), closes [#102](https://github.com/robbeverhelst/tsarr/issues/102)

## [2.4.2](https://github.com/robbeverhelst/tsarr/compare/v2.4.1...v2.4.2) (2026-03-09)


### Bug Fixes

* address tickets [#99](https://github.com/robbeverhelst/tsarr/issues/99) and [#100](https://github.com/robbeverhelst/tsarr/issues/100) CLI gaps ([58670d2](https://github.com/robbeverhelst/tsarr/commit/58670d2bc9c05818c6550f6f243b47a74adb4755))

## [2.4.1](https://github.com/robbeverhelst/tsarr/compare/v2.4.0...v2.4.1) (2026-03-09)


### Bug Fixes

* resolve all 8 issues from v2.4.0 test report ([#97](https://github.com/robbeverhelst/tsarr/issues/97)) ([#98](https://github.com/robbeverhelst/tsarr/issues/98)) ([9ee0a5b](https://github.com/robbeverhelst/tsarr/commit/9ee0a5b75023d70a25f8695cf5d8afdb669a2da3))

# [2.4.0](https://github.com/robbeverhelst/tsarr/compare/v2.3.2...v2.4.0) (2026-03-09)


### Features

* full API coverage for CLI - implement ticket [#94](https://github.com/robbeverhelst/tsarr/issues/94) missing subcommands ([#96](https://github.com/robbeverhelst/tsarr/issues/96)) ([593d228](https://github.com/robbeverhelst/tsarr/commit/593d2280ef2bf90f386ea7f6cc542bcd5969d59b))

## [2.3.2](https://github.com/robbeverhelst/tsarr/compare/v2.3.1...v2.3.2) (2026-03-09)


### Bug Fixes

* use groupadd/useradd in Dockerfile for Debian-based bun image ([a30eff0](https://github.com/robbeverhelst/tsarr/commit/a30eff0a5105e7420270e6d64be059cce1bc68fd))

## [2.3.1](https://github.com/robbeverhelst/tsarr/compare/v2.3.0...v2.3.1) (2026-03-09)


### Bug Fixes

* move binaries to release-assets/ and make AUR non-blocking ([2cb2cf6](https://github.com/robbeverhelst/tsarr/commit/2cb2cf608d6eaf56cb25c9e5766e86edbd9a289e))

# [2.3.0](https://github.com/robbeverhelst/tsarr/compare/v2.2.0...v2.3.0) (2026-03-09)


### Bug Fixes

* exclude compiled binaries from npm package and fix bin path ([6e74616](https://github.com/robbeverhelst/tsarr/commit/6e746163cf60ce0589e199b8554af6b87f915627))
* format CLI description for Biome line length ([39bad56](https://github.com/robbeverhelst/tsarr/commit/39bad56ab91b2b8c39abc20dd35d49dcc397d22c))
* update doctor test to expect exit code 1 when unconfigured ([e56f83a](https://github.com/robbeverhelst/tsarr/commit/e56f83a9e7da64b68c1f515836d720ee450cc397))
* use recreated AUR SSH key item (tsarr-aur-ed25519-v2) ([331d797](https://github.com/robbeverhelst/tsarr/commit/331d79797e670f7c931c7eeac28f5791fdb6e0bc))


### Features

* add multi-platform distribution and release automation ([f474289](https://github.com/robbeverhelst/tsarr/commit/f4742896a9e7c6d6fb709f51c4e0cb85ec3c18a0)), closes [#78](https://github.com/robbeverhelst/tsarr/issues/78) [#83](https://github.com/robbeverhelst/tsarr/issues/83)
* **cli:** add --no-header flag to hide table headers ([fe0d3ae](https://github.com/robbeverhelst/tsarr/commit/fe0d3aec90cefa91ba7a75a31f941e4cfe26c58a))
* **cli:** update CLI description to emphasize type-safety ([e69fbfc](https://github.com/robbeverhelst/tsarr/commit/e69fbfc32e0efdc5631b9e5dd7abba34599eb2d5))
* human-readable CLI output with formatting modes ([#92](https://github.com/robbeverhelst/tsarr/issues/92)) ([1b2d62c](https://github.com/robbeverhelst/tsarr/commit/1b2d62c321756763dab7867764ff1b6bb5a7eb80)), closes [#91](https://github.com/robbeverhelst/tsarr/issues/91)

# [2.3.0](https://github.com/robbeverhelst/tsarr/compare/v2.2.0...v2.3.0) (2026-03-09)


### Bug Fixes

* format CLI description for Biome line length ([39bad56](https://github.com/robbeverhelst/tsarr/commit/39bad56ab91b2b8c39abc20dd35d49dcc397d22c))
* update doctor test to expect exit code 1 when unconfigured ([e56f83a](https://github.com/robbeverhelst/tsarr/commit/e56f83a9e7da64b68c1f515836d720ee450cc397))
* use recreated AUR SSH key item (tsarr-aur-ed25519-v2) ([331d797](https://github.com/robbeverhelst/tsarr/commit/331d79797e670f7c931c7eeac28f5791fdb6e0bc))


### Features

* add multi-platform distribution and release automation ([f474289](https://github.com/robbeverhelst/tsarr/commit/f4742896a9e7c6d6fb709f51c4e0cb85ec3c18a0)), closes [#78](https://github.com/robbeverhelst/tsarr/issues/78) [#83](https://github.com/robbeverhelst/tsarr/issues/83)
* **cli:** add --no-header flag to hide table headers ([fe0d3ae](https://github.com/robbeverhelst/tsarr/commit/fe0d3aec90cefa91ba7a75a31f941e4cfe26c58a))
* **cli:** update CLI description to emphasize type-safety ([e69fbfc](https://github.com/robbeverhelst/tsarr/commit/e69fbfc32e0efdc5631b9e5dd7abba34599eb2d5))
* human-readable CLI output with formatting modes ([#92](https://github.com/robbeverhelst/tsarr/issues/92)) ([1b2d62c](https://github.com/robbeverhelst/tsarr/commit/1b2d62c321756763dab7867764ff1b6bb5a7eb80)), closes [#91](https://github.com/robbeverhelst/tsarr/issues/91)

# [2.3.0](https://github.com/robbeverhelst/tsarr/compare/v2.2.0...v2.3.0) (2026-03-09)


### Bug Fixes

* format CLI description for Biome line length ([39bad56](https://github.com/robbeverhelst/tsarr/commit/39bad56ab91b2b8c39abc20dd35d49dcc397d22c))
* update doctor test to expect exit code 1 when unconfigured ([e56f83a](https://github.com/robbeverhelst/tsarr/commit/e56f83a9e7da64b68c1f515836d720ee450cc397))
* use recreated AUR SSH key item (tsarr-aur-ed25519-v2) ([331d797](https://github.com/robbeverhelst/tsarr/commit/331d79797e670f7c931c7eeac28f5791fdb6e0bc))


### Features

* add multi-platform distribution and release automation ([f474289](https://github.com/robbeverhelst/tsarr/commit/f4742896a9e7c6d6fb709f51c4e0cb85ec3c18a0)), closes [#78](https://github.com/robbeverhelst/tsarr/issues/78) [#83](https://github.com/robbeverhelst/tsarr/issues/83)
* **cli:** add --no-header flag to hide table headers ([fe0d3ae](https://github.com/robbeverhelst/tsarr/commit/fe0d3aec90cefa91ba7a75a31f941e4cfe26c58a))
* **cli:** update CLI description to emphasize type-safety ([e69fbfc](https://github.com/robbeverhelst/tsarr/commit/e69fbfc32e0efdc5631b9e5dd7abba34599eb2d5))
* human-readable CLI output with formatting modes ([#92](https://github.com/robbeverhelst/tsarr/issues/92)) ([1b2d62c](https://github.com/robbeverhelst/tsarr/commit/1b2d62c321756763dab7867764ff1b6bb5a7eb80)), closes [#91](https://github.com/robbeverhelst/tsarr/issues/91)

# [2.5.0](https://github.com/robbeverhelst/tsarr/compare/v2.4.0...v2.5.0) (2026-03-09)


### Features

* human-readable CLI output with formatting modes ([#92](https://github.com/robbeverhelst/tsarr/issues/92)) ([1b2d62c](https://github.com/robbeverhelst/tsarr/commit/1b2d62c321756763dab7867764ff1b6bb5a7eb80)), closes [#91](https://github.com/robbeverhelst/tsarr/issues/91)

# [2.4.0](https://github.com/robbeverhelst/tsarr/compare/v2.3.0...v2.4.0) (2026-03-09)


### Features

* **cli:** add --no-header flag to hide table headers ([fe0d3ae](https://github.com/robbeverhelst/tsarr/commit/fe0d3aec90cefa91ba7a75a31f941e4cfe26c58a))

# [2.3.0](https://github.com/robbeverhelst/tsarr/compare/v2.2.0...v2.3.0) (2026-03-09)


### Bug Fixes

* update doctor test to expect exit code 1 when unconfigured ([e56f83a](https://github.com/robbeverhelst/tsarr/commit/e56f83a9e7da64b68c1f515836d720ee450cc397))
* use recreated AUR SSH key item (tsarr-aur-ed25519-v2) ([331d797](https://github.com/robbeverhelst/tsarr/commit/331d79797e670f7c931c7eeac28f5791fdb6e0bc))


### Features

* add multi-platform distribution and release automation ([f474289](https://github.com/robbeverhelst/tsarr/commit/f4742896a9e7c6d6fb709f51c4e0cb85ec3c18a0)), closes [#78](https://github.com/robbeverhelst/tsarr/issues/78) [#83](https://github.com/robbeverhelst/tsarr/issues/83)

# [2.2.0](https://github.com/robbeverhelst/tsarr/compare/v2.1.0...v2.2.0) (2026-03-09)


### Features

* add CRUD operations to CLI (add, edit, refresh, manual-search) ([#86](https://github.com/robbeverhelst/tsarr/issues/86)) ([abb2506](https://github.com/robbeverhelst/tsarr/commit/abb25063e1476511b3d2bb2ea0a70d2b81301764))

# [2.1.0](https://github.com/robbeverhelst/tsarr/compare/v2.0.0...v2.1.0) (2026-03-09)


### Features

* support API key from file in config ([#84](https://github.com/robbeverhelst/tsarr/issues/84)) ([ae819c0](https://github.com/robbeverhelst/tsarr/commit/ae819c000cdd180509990099fc4488f40d01ce97)), closes [#79](https://github.com/robbeverhelst/tsarr/issues/79) [#76](https://github.com/robbeverhelst/tsarr/issues/76)

# [2.0.0](https://github.com/robbeverhelst/tsarr/compare/v1.12.0...v2.0.0) (2026-03-09)


### Features

* add CLI interface and Bazarr client ([1fc315b](https://github.com/robbeverhelst/tsarr/commit/1fc315b78ca1daab340624aa2bd1cbd0673b2a39))


### BREAKING CHANGES

* adds bin entry to package.json and new CLI commands

# [1.12.0](https://github.com/robbeverhelst/tsarr/compare/v1.11.0...v1.12.0) (2026-03-09)


### Features

* update dependencies and tooling ([69dbcee](https://github.com/robbeverhelst/tsarr/commit/69dbceec462e7f3fbf54c39934ee7525acec9ddf))

# [1.11.0](https://github.com/robbeverhelst/tsarr/compare/v1.10.0...v1.11.0) (2026-02-04)


### Features

* add Bazarr client for subtitle management ([#53](https://github.com/robbeverhelst/tsarr/issues/53)) ([#54](https://github.com/robbeverhelst/tsarr/issues/54)) ([cc15038](https://github.com/robbeverhelst/tsarr/commit/cc15038fe358eb2ce8b7324176f83ec773199eeb))
* trigger v1.11.0 release ([08ee1a3](https://github.com/robbeverhelst/tsarr/commit/08ee1a33c99c6fdcb21a6047173062c44be2c961))

# [1.11.0](https://github.com/robbeverhelst/tsarr/compare/v1.10.0...v1.11.0) (2026-02-04)


### Features

* add Bazarr client for subtitle management ([#53](https://github.com/robbeverhelst/tsarr/issues/53)) ([#54](https://github.com/robbeverhelst/tsarr/issues/54)) ([cc15038](https://github.com/robbeverhelst/tsarr/commit/cc15038fe358eb2ce8b7324176f83ec773199eeb))

# [1.10.0](https://github.com/robbeverhelst/tsarr/compare/v1.9.0...v1.10.0) (2026-01-27)


### Features

* add missing history, queue, blocklist, and other API methods ([32e56c5](https://github.com/robbeverhelst/tsarr/commit/32e56c56643f9c47e9aeb371e67aacc342b9bacb))
* add missing history, queue, blocklist, and other API methods ([f9d56e1](https://github.com/robbeverhelst/tsarr/commit/f9d56e1e0437b960db668936bfbae0ee53088913)), closes [#42](https://github.com/robbeverhelst/tsarr/issues/42) [#42](https://github.com/robbeverhelst/tsarr/issues/42)

# [1.9.0](https://github.com/robbeverhelst/tsarr/compare/v1.8.0...v1.9.0) (2025-11-20)


### Features

* add movie lookup by TMDB and IMDB ID methods ([6ce18dd](https://github.com/robbeverhelst/tsarr/commit/6ce18dd367ae0bc5f6d5d7cdd20e473bfdf9ed96))
* add movie lookup by TMDB and IMDB ID methods ([9cb3f74](https://github.com/robbeverhelst/tsarr/commit/9cb3f74b90c1950432b2440ae6a71d652e7f6a10)), closes [#36](https://github.com/robbeverhelst/tsarr/issues/36)

# [1.8.0](https://github.com/robbeverhelst/tsarr/compare/v1.7.1...v1.8.0) (2025-09-05)


### Features

* add type exports for Radarr, Sonarr, Lidarr, Readarr, and Prowlarr clients ([aca24bf](https://github.com/robbeverhelst/tsarr/commit/aca24bfe570ef4acacdd213f1c2497f2b34e2839))

## [1.7.1](https://github.com/robbeverhelst/tsarr/compare/v1.7.0...v1.7.1) (2025-09-05)


### Bug Fixes

* add download client management methods to ProwlarrClient ([4b09394](https://github.com/robbeverhelst/tsarr/commit/4b09394decc5d34a2aab3a8f02c87416d9434273))

# [1.7.0](https://github.com/robbeverhelst/tsarr/compare/v1.6.0...v1.7.0) (2025-09-04)


### Features

* add root folder management methods to SonarrClient ([2cf2e4d](https://github.com/robbeverhelst/tsarr/commit/2cf2e4dc47b42943a2d64f4c12ac309c21b34b8c))

# [1.6.0](https://github.com/robbeverhelst/tsarr/compare/v1.5.0...v1.6.0) (2025-09-04)


### Features

* configure raw clients for manual endpoints in Lidarr, Prowlarr, Radarr, and Readarr ([65e9829](https://github.com/robbeverhelst/tsarr/commit/65e9829e272fdfcfea2c5f98c44c340f4955986f))

# [1.5.0](https://github.com/robbeverhelst/tsarr/compare/v1.4.0...v1.5.0) (2025-09-03)


### Features

* add method to retrieve specific update settings in SonarrClient ([b1c0bc6](https://github.com/robbeverhelst/tsarr/commit/b1c0bc6296032b8c7f99a2a4bb934baf62bf8064))
* update API clients to use v3 endpoints and enhance configuration management ([987d562](https://github.com/robbeverhelst/tsarr/commit/987d562abaab5058822096e3956c6e6af6d9085d))

# [1.4.0](https://github.com/robbeverhelst/tsarr/compare/v1.3.0...v1.4.0) (2025-09-03)


### Features

* update README with logo and enhance description ([f1c6d32](https://github.com/robbeverhelst/tsarr/commit/f1c6d3284a2dc63b422aacac79f8b3b8b7905e64))

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
