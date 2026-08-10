import { execFileSync } from 'node:child_process';
import os from 'node:os';
import path from 'node:path';
import fs from 'fs-extra';

const packageDir = process.cwd();
const consumerDir = await fs.mkdtemp(path.join(os.tmpdir(), 'bumpers-consumer-'));
const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';
let archivePath;

try {
  execFileSync(npm, ['run', 'build'], { cwd: packageDir, stdio: 'inherit' });

  const { name, version } = await fs.readJson(path.join(packageDir, 'package.json'));
  const archive = `${name}-${version}.tgz`;
  execFileSync(npm, ['pack', '--ignore-scripts'], {
    cwd: packageDir,
    stdio: 'inherit',
  });
  archivePath = path.join(packageDir, archive);

  execFileSync(npm, ['init', '-y'], { cwd: consumerDir, stdio: 'ignore' });
  execFileSync(npm, ['install', archivePath], {
    cwd: consumerDir,
    stdio: 'inherit',
  });
  execFileSync(npm, ['exec', '--no', '--', 'bumpers', '--version'], {
    cwd: consumerDir,
    stdio: 'inherit',
  });
  execFileSync(npm, ['exec', '--no', '--', 'bumpers', 'up', 'pack-smoke', '--react'], {
    cwd: consumerDir,
    stdio: 'inherit',
  });

  for (const file of ['vite.config.ts', 'AGENTS.md']) {
    if (!(await fs.pathExists(path.join(consumerDir, 'pack-smoke', file)))) {
      throw new Error(`Pack smoke test did not create ${file}`);
    }
  }
} finally {
  if (archivePath) await fs.remove(archivePath);
  await fs.remove(consumerDir);
}
