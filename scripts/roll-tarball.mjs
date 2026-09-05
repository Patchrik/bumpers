import { execFileSync } from 'node:child_process';
import { mkdir, readFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

const rootDir = process.cwd();
const packageDir = path.join(rootDir, 'packages', 'bumpers-cli');
const prefix = path.join(os.homedir(), '.bumpers-handson');
const { name, version } = JSON.parse(await readFile(path.join(packageDir, 'package.json'), 'utf8'));
const archive = `${name}-${version}.tgz`;
const archivePath = path.join(prefix, archive);
const npmCli = process.env.npm_execpath;

if (!npmCli) {
  throw new Error('Run this script with npm run roll:tarball.');
}

await mkdir(prefix, { recursive: true });
const runNpm = (args, cwd) => execFileSync(process.execPath, [npmCli, ...args], { cwd, stdio: 'inherit' });

runNpm(['pack', '--pack-destination', prefix], packageDir);
runNpm(['install', '--global', '--force', '--prefix', prefix, archivePath], rootDir);

const binDir = process.platform === 'win32' ? prefix : path.join(prefix, 'bin');

console.log(`\nRolled ${archive}`);
console.log(`Installed: ${binDir}`);
