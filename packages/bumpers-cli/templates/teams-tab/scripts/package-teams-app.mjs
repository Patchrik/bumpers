#!/usr/bin/env node
// Resolves ${{VAR}} placeholders in appPackage/manifest.json using env files,
// then zips the resolved manifest and icons into build/appPackage.zip.

import { readFileSync, writeFileSync, mkdirSync, copyFileSync, existsSync, rmSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { resolve, join, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');
const buildDir = join(root, 'build');

function loadEnv(filePath) {
  if (!existsSync(filePath)) return {};
  const lines = readFileSync(filePath, 'utf-8').split('\n');
  const env = {};
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    env[trimmed.slice(0, eq).trim()] = trimmed.slice(eq + 1).trim();
  }
  return env;
}

export function packageTeamsApp({ quiet = false } = {}) {
  const envDev = loadEnv(join(root, 'env/.env.dev'));
  const envLocal = loadEnv(join(root, 'env/.env.local'));
  const env = { ...envDev, ...envLocal };

  let manifest = readFileSync(join(root, 'appPackage/manifest.json'), 'utf-8');
  for (const [key, value] of Object.entries(env)) {
    manifest = manifest.replaceAll(`\${{${key}}}`, value);
  }

  const unresolved = manifest.match(/\$\{\{[^}]+\}\}/g);
  if (unresolved) {
    console.error('\n  x Unresolved placeholders:', unresolved.join(', '));
    console.error('    Add them to env/.env.dev or env/.env.local\n');
    process.exit(1);
  }

  mkdirSync(buildDir, { recursive: true });

  const zipPath = join(buildDir, 'appPackage.zip');
  const manifestPath = join(buildDir, 'manifest.json');
  if (existsSync(zipPath)) rmSync(zipPath);

  writeFileSync(manifestPath, manifest);
  copyFileSync(join(root, 'appPackage/color.png'), join(buildDir, 'color.png'));
  copyFileSync(join(root, 'appPackage/outline.png'), join(buildDir, 'outline.png'));

  try {
    execSync('zip -j appPackage.zip manifest.json color.png outline.png', {
      cwd: buildDir,
      stdio: 'pipe',
    });
  } catch {
    try {
      execSync(
        `powershell -Command "Compress-Archive -Path '${join(buildDir, 'manifest.json')}','${join(buildDir, 'color.png')}','${join(buildDir, 'outline.png')}' -DestinationPath '${zipPath}' -Force"`,
        { stdio: 'pipe' },
      );
    } catch {
      console.error('\n  x Failed to create zip. Install zip or use PowerShell on Windows.');
      console.error('    Resolved files are in build/; you can zip them manually.\n');
      process.exit(1);
    }
  }

  if (!quiet) {
    console.log('\n  Teams app package created: build/appPackage.zip');
    console.log('');
    console.log('  Upload it in Teams:');
    console.log('    Apps -> Manage your apps -> Upload a custom app');
    console.log('');
  }

  return {
    packagePath: zipPath,
    manifestPath,
  };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  packageTeamsApp();
}
