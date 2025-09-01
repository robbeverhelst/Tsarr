# GitHub Secrets Setup

To enable automated releases, you need to configure these secrets in your GitHub repository.

## Required Secrets

### 1. NPM_TOKEN

**Purpose**: Publish package to npm registry

**Steps**:
1. Go to [npmjs.com](https://www.npmjs.com)
2. Login or create account
3. Go to Access Tokens → Generate New Token
4. Select "Automation" token type
5. Copy the token
6. In GitHub repo: Settings → Secrets and variables → Actions
7. Add new secret: `NPM_TOKEN` with your token value

### 2. GITHUB_TOKEN

**Purpose**: Create GitHub releases and update repository

**Steps**: 
- ✅ **Already configured!** GitHub automatically provides this token
- No manual setup required

## Verification

After adding the NPM_TOKEN secret:

1. **Check secrets are configured**:
   - Go to your repo → Settings → Secrets and variables → Actions
   - Verify `NPM_TOKEN` is listed

2. **Test the pipeline**:
   - Make a commit with conventional format: `feat: add new feature`
   - Push to main branch
   - Watch GitHub Actions run the release workflow

## Repository Settings

Ensure these permissions are enabled:

1. **Actions permissions**:
   - Settings → Actions → General
   - Enable "Allow GitHub Actions to create and approve pull requests"

2. **Workflow permissions**:
   - Settings → Actions → General → Workflow permissions
   - Select "Read and write permissions"
   - Enable "Allow GitHub Actions to create and approve pull requests"

## Package Scope

The package will be published as:
- **Package name**: `tsarr`
- **Registry**: npmjs.org
- **Access**: Public (anyone can install)

## First Release

After setting up secrets, create your first release:

```bash
# Make a commit with conventional format
git add .
git commit -m "feat: initial TsArr SDK release

- Complete TypeScript SDK for Servarr ecosystem
- Support for Radarr, Sonarr, Lidarr, Readarr, Prowlarr
- Real-world tested with movie import functionality
- Comprehensive documentation and examples"

# Push to trigger release
git push origin main
```

This will:
- ✅ Run all tests and linting
- ✅ Build the project  
- ✅ Create GitHub release with changelog
- ✅ Publish to npm as `tsarr`
- ✅ Tag the release in git