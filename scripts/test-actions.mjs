import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import process from 'node:process';

const packageVersion = JSON.parse(
  fs.readFileSync('packages/bumpers-cli/package.json', 'utf8'),
).version;
const releaseType = process.env.RELEASE_TYPE || 'initial';
const versionOverride = process.env.VERSION_OVERRIDE || packageVersion;
const commonArgs = [
  'workflow_dispatch',
  '-W',
  '.github/workflows/release.yml',
  '--input',
  `release_type=${releaseType}`,
  '--input',
  `version_override=${versionOverride}`,
  '--input',
  'publish=false',
];

function run(command, args) {
  const result = spawnSync(command, args, { stdio: 'inherit' });
  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status ?? 1);
}

run(process.execPath, [
  'scripts/release-version.mjs',
  '--type',
  releaseType,
  '--override',
  versionOverride,
]);
run('act', [...commonArgs, '-j', 'test', '--matrix', 'node:22']);
run('act', [...commonArgs, '-j', 'test-pack', '--matrix', 'os:ubuntu-24.04']);
