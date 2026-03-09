#!/usr/bin/env bun
/**
 * Updates all packaging manifests with the current version and SHA256 hashes.
 * Run after binaries are built: bun run scripts/update-packaging.ts <version>
 */
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { execSync } from 'child_process';
import { join } from 'path';

const version = process.argv[2];
if (!version) {
	console.error('Usage: bun run scripts/update-packaging.ts <version>');
	process.exit(1);
}

const root = join(import.meta.dirname, '..');
const binDir = join(root, 'dist', 'binaries');

function sha256(filePath: string): string {
	if (!existsSync(filePath)) return '';
	return execSync(`shasum -a 256 "${filePath}"`)
		.toString()
		.split(' ')[0]
		.trim();
}

const hashes = {
	'linux-x64': sha256(join(binDir, 'tsarr-linux-x64')),
	'linux-arm64': sha256(join(binDir, 'tsarr-linux-arm64')),
	'darwin-x64': sha256(join(binDir, 'tsarr-darwin-x64')),
	'darwin-arm64': sha256(join(binDir, 'tsarr-darwin-arm64')),
	'windows-x64': sha256(join(binDir, 'tsarr-windows-x64.exe')),
};

// Update Homebrew formula
const brewPath = join(root, 'packaging', 'homebrew', 'tsarr.rb');
let brew = readFileSync(brewPath, 'utf-8');
brew = brew.replace(/"\#\{VERSION\}"/g, `"${version}"`);
brew = brew.replace(/"\#\{SHA256_DARWIN_ARM64\}"/g, `"${hashes['darwin-arm64']}"`);
brew = brew.replace(/"\#\{SHA256_DARWIN_X64\}"/g, `"${hashes['darwin-x64']}"`);
brew = brew.replace(/"\#\{SHA256_LINUX_ARM64\}"/g, `"${hashes['linux-arm64']}"`);
brew = brew.replace(/"\#\{SHA256_LINUX_X64\}"/g, `"${hashes['linux-x64']}"`);
writeFileSync(brewPath, brew);
console.log('Updated Homebrew formula');

// Update Nix flake
const nixPath = join(root, 'packaging', 'nix', 'flake.nix');
let nix = readFileSync(nixPath, 'utf-8');
nix = nix.replace(/version = "VERSION_PLACEHOLDER"/, `version = "${version}"`);
// Update sha256 values for each platform
const nixSha256Replacements = [
	{ url: 'tsarr-linux-x64', hash: hashes['linux-x64'] },
	{ url: 'tsarr-linux-arm64', hash: hashes['linux-arm64'] },
	{ url: 'tsarr-darwin-x64', hash: hashes['darwin-x64'] },
	{ url: 'tsarr-darwin-arm64', hash: hashes['darwin-arm64'] },
];
for (const { url, hash } of nixSha256Replacements) {
	const regex = new RegExp(`(${url}";\\s*sha256 = )"";`, 'g');
	nix = nix.replace(regex, `$1"sha256-${hash}";`);
}
writeFileSync(nixPath, nix);
console.log('Updated Nix flake');

// Update AUR PKGBUILD
const aurPath = join(root, 'packaging', 'aur', 'PKGBUILD');
let aur = readFileSync(aurPath, 'utf-8');
aur = aur.replace(/pkgver=VERSION_PLACEHOLDER/, `pkgver=${version}`);
aur = aur.replace(/sha256sums_x86_64=\('SKIP'\)/, `sha256sums_x86_64=('${hashes['linux-x64']}')`);
aur = aur.replace(/sha256sums_aarch64=\('SKIP'\)/, `sha256sums_aarch64=('${hashes['linux-arm64']}')`);
writeFileSync(aurPath, aur);
console.log('Updated AUR PKGBUILD');

// Update Scoop manifest
const scoopPath = join(root, 'packaging', 'scoop', 'tsarr.json');
let scoop = readFileSync(scoopPath, 'utf-8');
scoop = scoop.replace(/VERSION_PLACEHOLDER/g, version);
const scoopObj = JSON.parse(scoop);
scoopObj.architecture['64bit'].hash = hashes['windows-x64'];
writeFileSync(scoopPath, JSON.stringify(scoopObj, null, 2) + '\n');
console.log('Updated Scoop manifest');

// Update Chocolatey nuspec
const nuspecPath = join(root, 'packaging', 'chocolatey', 'tsarr.nuspec');
let nuspec = readFileSync(nuspecPath, 'utf-8');
nuspec = nuspec.replace(/VERSION_PLACEHOLDER/g, version);
writeFileSync(nuspecPath, nuspec);

const chocoInstallPath = join(root, 'packaging', 'chocolatey', 'tools', 'chocolateyInstall.ps1');
let chocoInstall = readFileSync(chocoInstallPath, 'utf-8');
chocoInstall = chocoInstall.replace(/checksum64\s*=\s*''/, `checksum64    = '${hashes['windows-x64']}'`);
writeFileSync(chocoInstallPath, chocoInstall);
console.log('Updated Chocolatey package');

console.log(`\nAll packaging manifests updated to v${version}`);
