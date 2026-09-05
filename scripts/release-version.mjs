import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const root = process.cwd();
const packagePath = path.join(root, 'packages/bumpers-cli/package.json');
const lockPath = path.join(root, 'package-lock.json');
const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
const lockJson = JSON.parse(fs.readFileSync(lockPath, 'utf8'));
const lockPackage = lockJson.packages?.['packages/bumpers-cli'];

const args = new Map();
for (let index = 2; index < process.argv.length; index += 2) {
  args.set(process.argv[index], process.argv[index + 1] ?? '');
}

const releaseType = args.get('--type') ?? process.env.RELEASE_TYPE ?? '';
const override = args.get('--override') ?? process.env.VERSION_OVERRIDE ?? '';
const semverPattern = /^(\d+)\.(\d+)\.(\d+)$/;

function parseVersion(value, label) {
  const match = semverPattern.exec(value);
  if (!match) throw new Error(`${label} must be stable SemVer (x.y.z): ${value}`);
  return match.slice(1).map(Number);
}

function formatVersion([major, minor, patch]) {
  return `${major}.${minor}.${patch}`;
}

function compare(left, right) {
  for (let index = 0; index < left.length; index += 1) {
    if (left[index] !== right[index]) return left[index] > right[index] ? 1 : -1;
  }
  return 0;
}

function bump(version, type) {
  const [major, minor, patch] = version;
  if (type === 'patch') return [major, minor, patch + 1];
  if (type === 'minor') return [major, minor + 1, 0];
  if (type === 'major') return [major + 1, 0, 0];
  throw new Error(`release type must be initial, patch, minor, or major: ${type}`);
}

if (!['initial', 'patch', 'minor', 'major'].includes(releaseType)) {
  throw new Error('release type is required: initial, patch, minor, or major');
}

const packageVersion = parseVersion(packageJson.version, 'package version');
if (lockPackage?.version !== packageJson.version) {
  throw new Error(`package-lock.json version does not match package.json: ${lockPackage?.version} !== ${packageJson.version}`);
}

const tags = execFileSync('git', ['tag', '--list', 'v*'], { encoding: 'utf8' })
  .split('\n')
  .map((tag) => tag.trim())
  .filter(Boolean)
  .map((tag) => tag.slice(1))
  .filter((tag) => semverPattern.test(tag))
  .map((tag) => parseVersion(tag, 'release tag'))
  .sort(compare);
const previous = tags.at(-1);

if (!previous && releaseType !== 'initial') {
  throw new Error('the first release must use release type initial');
}
if (previous && releaseType === 'initial') {
  throw new Error('initial is only valid when no release tags exist');
}

const suggested = previous ? bump(previous, releaseType) : packageVersion;
const effective = override ? parseVersion(override, 'version override') : suggested;

if (compare(effective, packageVersion) !== 0) {
  throw new Error(`committed package version ${packageJson.version} does not match effective release version ${formatVersion(effective)}`);
}
if (previous && compare(effective, previous) <= 0) {
  throw new Error(`release version ${formatVersion(effective)} must be newer than ${formatVersion(previous)}`);
}

const output = {
  previous: previous ? formatVersion(previous) : '',
  suggested: formatVersion(suggested),
  version: formatVersion(effective),
  archive: `${packageJson.name}-${formatVersion(effective)}.tgz`,
};

for (const [key, value] of Object.entries(output)) console.log(`${key}=${value}`);
