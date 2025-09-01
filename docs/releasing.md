# Release Process

TsArr uses semantic-release for automated versioning and publishing.

## How Releases Work

### Automatic Releases
- **Trigger**: Push to `main` branch
- **Versioning**: Based on conventional commit messages
- **Publishing**: Automatic to NPM and GitHub releases
- **Documentation**: Auto-generated changelog

### Conventional Commits

Use these commit message formats to trigger releases:

```bash
# Patch release (1.0.0 → 1.0.1)
fix: resolve API connection timeout issue
docs: update installation instructions

# Minor release (1.0.0 → 1.1.0)  
feat: add new LidarrClient for music management
feat!: support for Sonarr v5 API

# Major release (1.0.0 → 2.0.0)
feat!: breaking change to client initialization
BREAKING CHANGE: client constructor now requires apiKey parameter
```

### Release Types

| Commit Type | Release Type | Example |
|-------------|--------------|---------|
| `fix:` | Patch | Bug fixes, documentation updates |
| `feat:` | Minor | New features, API additions |
| `feat!:` or `BREAKING CHANGE:` | Major | Breaking changes |

## Manual Release Process

If you need to create a release manually:

```bash
# 1. Ensure clean working directory
git status

# 2. Run full validation
bun run build
bun test
bun run lint

# 3. Trigger semantic release locally (for testing)
bunx semantic-release --dry-run

# 4. Push to main (triggers automatic release)
git push origin main
```

## GitHub Secrets Required

For the release pipeline to work, these secrets must be configured in GitHub:

### NPM_TOKEN
1. Go to [npmjs.com](https://www.npmjs.com) 
2. Create account or login
3. Generate access token with "Automation" type
4. Add as `NPM_TOKEN` secret in GitHub repo settings

### GITHUB_TOKEN
- Automatically provided by GitHub Actions
- No manual configuration needed

## Package Configuration

The package is configured to publish as:
- **NPM Package**: `@robbeverhelst/tsarr` (scoped)
- **Public Access**: Available to all users
- **Registry**: npmjs.org

## Release Assets

Each release includes:
- 📦 NPM package tarball
- 📋 Auto-generated changelog
- 🏷️ Git tag with version
- 📝 GitHub release with notes

## Troubleshooting

### Release Not Triggered
- Check commit message follows conventional format
- Ensure push is to `main` branch
- Verify `[skip ci]` is not in commit message

### NPM Publish Failed
- Verify `NPM_TOKEN` secret is configured
- Check package name availability on npmjs.com
- Ensure version number isn't already published

### GitHub Release Failed
- Verify `GITHUB_TOKEN` permissions
- Check repository settings allow Actions to create releases