# Distribution Guide

This project ships through several channels, but they do not all work the same way.

## What is already automated

When a release is cut from `main`, the GitHub Actions release workflow will:

- publish the npm package
- attach cross-platform binaries to the GitHub release
- push the Docker image to `ghcr.io/robbeverhelst/tsarr`
- render the packaging files in the release job workspace
- update the Homebrew tap if `DIST_REPO_TOKEN` is configured
- update the Scoop bucket if `DIST_REPO_TOKEN` is configured
- update the AUR package if `AUR_SSH_PRIVATE_KEY` is configured
- publish the Chocolatey package if `CHOCOLATEY_API_KEY` is configured

That means Homebrew, Scoop, AUR, and Chocolatey can all run from CI once their one-time credentials are in place. `nixpkgs` submission is still manual.

## 1Password-backed CI secrets

This repo is set up to read release channel secrets from 1Password when `OP_SERVICE_ACCOUNT_TOKEN` is available to GitHub Actions.

Current 1Password items:

- `op://Tsarr/tsarr-release-ci/dist-repo-token`
- `op://Tsarr/tsarr-release-ci/ci/chocolatey-api-key`
- `op://Tsarr/tsarr-aur-ed25519-v2/private key`
- `op://Tsarr/tsarr-aur-ed25519-v2/public key`

Current secret references:

- `op://Tsarr/tsarr-release-ci/dist-repo-token`
- `op://Tsarr/tsarr-release-ci/ci/chocolatey-api-key`
- `op://Tsarr/tsarr-aur-ed25519-v2/private key`
- `op://Tsarr/tsarr-aur-ed25519-v2/public key`

The Linux release job uses the official 1Password GitHub Action. The Windows Chocolatey job uses `op read` directly because the official action does not support Windows runners.

## Generate the channel manifests

The files under [`packaging/`](../packaging) are generated from the release binaries. Before you submit anything to AUR, Scoop, Chocolatey, or Nix, generate the versioned manifests with the current release number and binary checksums.

Use the same sequence as the release workflow on the release commit:

```bash
bun install --frozen-lockfile
bun run generate
bun run generate:types
bun run build:js
bun run build:cli
bun run build:types

mkdir -p release-assets/binaries
bun build src/cli/index.ts --compile --target=bun-linux-x64 --outfile release-assets/binaries/tsarr-linux-x64
bun build src/cli/index.ts --compile --target=bun-linux-arm64 --outfile release-assets/binaries/tsarr-linux-arm64
bun build src/cli/index.ts --compile --target=bun-darwin-x64 --outfile release-assets/binaries/tsarr-darwin-x64
bun build src/cli/index.ts --compile --target=bun-darwin-arm64 --outfile release-assets/binaries/tsarr-darwin-arm64
bun build src/cli/index.ts --compile --target=bun-windows-x64 --outfile release-assets/binaries/tsarr-windows-x64.exe

bun run update-packaging <released-version>
```

After that, the files in [`packaging/`](../packaging) will contain the actual version and SHA256 values you should submit. The release workflow also commits the generated Nix flake back to `main` so the repo-hosted flake stays installable.

## Channel checklist

| Channel | End-user install | External account/repo needed | Fully automated from this repo |
|---|---|---|---|
| npm | `npm install -g tsarr` | npm account + `NPM_TOKEN` secret | Yes |
| GitHub Releases | Download binary asset | GitHub repo | Yes |
| Docker | `docker run --rm ghcr.io/robbeverhelst/tsarr doctor` | GitHub repo / GHCR | Yes |
| Homebrew | `brew install robbeverhelst/tsarr/tsarr` | GitHub tap repo | Yes |
| Scoop | `scoop bucket add tsarr https://github.com/robbeverhelst/scoop-tsarr` then `scoop install tsarr` | GitHub bucket repo or upstream Scoop PR | Yes, if you use the repo-owned bucket |
| Chocolatey | `choco install tsarr` | Chocolatey account + API key | Yes, after the `Tsarr/tsarr-release-ci` `chocolatey-api-key` field is populated and `OP_SERVICE_ACCOUNT_TOKEN` is available |
| AUR | `yay -S tsarr-bin` | AUR account + SSH key | Yes, using `Tsarr/tsarr-aur-ed25519-v2`, once `OP_SERVICE_ACCOUNT_TOKEN` is available |
| Nix | `nix profile install github:robbeverhelst/tsarr?dir=packaging/nix` | None for the repo flake, GitHub + nixpkgs PR for nixpkgs inclusion | Repo flake: yes. `nixpkgs`: no |

## What to do next

With the GitHub repos and 1Password items in place, the remaining practical order is:

1. Make sure the `Tsarr/tsarr-aur-ed25519-v2` public key is the one registered in your AUR account profile.
2. Add your Chocolatey API key to `op://Tsarr/tsarr-release-ci/ci/chocolatey-api-key`.
3. Make sure `OP_SERVICE_ACCOUNT_TOKEN` is available to this repo in GitHub Actions.
4. Let the next release publish Homebrew, Scoop, AUR, and Chocolatey automatically.
5. Open a `nixpkgs` PR if you want `tsarr` available from the shared Nix package collection.

## Manual inputs still required

These are the only pieces CI cannot create by itself:

- AUR account settings: make sure the `Tsarr/tsarr-aur-ed25519-v2` public key is registered in your AUR profile.
- Chocolatey API key: add it to the `tsarr-release-ci` item in 1Password.
- GitHub Actions service-account access: `OP_SERVICE_ACCOUNT_TOKEN` must be available to this repo.
- `nixpkgs` merge: upstream review is manual even if you script PR creation.

## Homebrew

Homebrew uses a tap repo, not this main repo directly.

The required repo is `robbeverhelst/homebrew-tsarr`.

After the 1Password item and `OP_SERVICE_ACCOUNT_TOKEN` are available, the release workflow copies the updated formula into the tap and pushes it automatically on every release.

## AUR

The AUR package name for this repo is `tsarr-bin`, because it installs the prebuilt binary from GitHub Releases.

One-time setup:

1. Confirm `tsarr-bin` is available as a package name on AUR.
2. Make sure the AUR profile uses `op://Tsarr/tsarr-aur-ed25519-v2/public key`.
3. Clone the package repo if you want to seed it manually the first time:

```bash
git clone ssh://aur@aur.archlinux.org/tsarr-bin.git
cd tsarr-bin
```

4. Copy the generated [`packaging/aur/PKGBUILD`](../packaging/aur/PKGBUILD) and generated `packaging/aur/.SRCINFO` into that repo.
5. Add the maintainer comment expected by AUR before the first push.
6. Commit and push:

```bash
git add PKGBUILD .SRCINFO
git commit -m "Initial import"
git push
```

After the CI key is installed, later releases update the AUR Git repo automatically.

## Chocolatey

Chocolatey uses a `.nupkg` built from [`packaging/chocolatey/`](../packaging/chocolatey).

One-time setup:

1. Sign in to Chocolatey and create an API key.
2. Add that key to `op://Tsarr/tsarr-release-ci/ci/chocolatey-api-key`.

After that, the release workflow builds the generated package on `windows-latest`, loads the API key with `op read`, and pushes it automatically. The first submission will still go through Chocolatey moderation.

## Scoop

Scoop needs a bucket repo or a PR to an existing bucket.

You have two reasonable options:

- Use the repo-owned bucket at `robbeverhelst/scoop-tsarr`, which CI now updates automatically.
- Submit the generated manifest to an existing Scoop bucket if you want wider discovery, but that upstream path is still manual.

If you use your own bucket, users install with:

```powershell
scoop bucket add tsarr https://github.com/robbeverhelst/scoop-tsarr
scoop install tsarr
```

For the repo-owned bucket, CI keeps the manifest current automatically.

## Nix

There are two different Nix paths here:

- [`packaging/nix/flake.nix`](../packaging/nix/flake.nix) is the repo-hosted flake users can install directly.
- `nixpkgs` inclusion is a separate upstream contribution and is not automated by this repo.

The release workflow regenerates the repo flake from the published release binaries and commits it back to `main`, so the checked-in flake stays aligned with the latest release.

If you want shared `nixpkgs` availability, use the package definition here as a starting point and open a PR to `NixOS/nixpkgs`. Expect that to be the slowest review path of the distribution channels.

## Repo files involved

- [`packaging/homebrew/tsarr.rb`](../packaging/homebrew/tsarr.rb)
- [`packaging/aur/PKGBUILD`](../packaging/aur/PKGBUILD)
- `packaging/aur/.SRCINFO`
- [`packaging/chocolatey/tsarr.nuspec`](../packaging/chocolatey/tsarr.nuspec)
- [`packaging/chocolatey/tools/chocolateyInstall.ps1`](../packaging/chocolatey/tools/chocolateyInstall.ps1)
- [`packaging/scoop/tsarr.json`](../packaging/scoop/tsarr.json)
- [`packaging/nix/flake.nix`](../packaging/nix/flake.nix)
- [`packaging/nix/flake.lock`](../packaging/nix/flake.lock)
- [`scripts/update-packaging.ts`](../scripts/update-packaging.ts)
- [`.github/workflows/release.yml`](../.github/workflows/release.yml)
