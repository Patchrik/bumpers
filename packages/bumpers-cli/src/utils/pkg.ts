import path from 'node:path';
import fs from 'fs-extra';

export interface PackageJson {
  name: string;
  version: string;
  type?: string;
  private?: boolean;
  main?: string;
  scripts?: Record<string, string>;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  [key: string]: unknown;
}

export async function readPackageJson(projectDir: string): Promise<PackageJson> {
  const pkgPath = path.join(projectDir, 'package.json');
  if (await fs.pathExists(pkgPath)) {
    return (await fs.readJson(pkgPath)) as PackageJson;
  }
  throw new Error(
    `package.json not found at ${pkgPath}. ` +
    `Ensure installBase runs before any installer that reads package.json.`
  );
}

export async function writePackageJson(projectDir: string, pkg: PackageJson): Promise<void> {
  const pkgPath = path.join(projectDir, 'package.json');
  await fs.writeJson(pkgPath, pkg, { spaces: 2 });
}

export function addDependencies(pkg: PackageJson, deps: Record<string, string>): void {
  pkg.dependencies = { ...pkg.dependencies, ...deps };
}

export function addDevDependencies(pkg: PackageJson, deps: Record<string, string>): void {
  pkg.devDependencies = { ...pkg.devDependencies, ...deps };
}

export function addScripts(pkg: PackageJson, scripts: Record<string, string>): void {
  pkg.scripts = { ...pkg.scripts, ...scripts };
}
