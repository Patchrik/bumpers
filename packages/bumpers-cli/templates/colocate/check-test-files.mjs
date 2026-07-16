#!/usr/bin/env node
import { readdirSync, existsSync, readFileSync } from 'fs';
import { join, basename, dirname, sep } from 'path';

const EXCLUDED_NAMES = new Set(['main.tsx', 'env.d.ts', 'test-utils.tsx'{{reactRouteTreeGenExclude}}]);

const EXCLUDED_PATTERNS = [
  /\.test\.(ts|tsx)$/,
  /\.stories\.(ts|tsx)$/,
  /\.d\.ts$/,
  /^index\.ts$/,
  /^register\.ts$/,
  /^types\.ts$/,
];

const EXCLUDED_DIRS = new Set([
  'node_modules',
  'dist',
  'out',
  'coverage',
  '.storybook',
  'e2e',
  'types',
  '__mocks__',
]);

function walk(dir) {
  const files = [];
  let entries;
  try {
    entries = readdirSync(dir, { withFileTypes: true });
  } catch {
    return files;
  }
  for (const entry of entries) {
    if (EXCLUDED_DIRS.has(entry.name)) continue;
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...walk(full));
    } else if (/\.(ts|tsx)$/.test(entry.name)) {
      files.push(full);
    }
  }
  return files;
}

const srcFiles = walk('src');
const missing = [];
const structureErrors = [];
const hasStorybook = existsSync('.storybook');
const REACT_ROOTS = ['src/renderer/src', 'src'];

function toPosix(file) {
  return file.split(sep).join('/');
}

function reactRelativePath(file) {
  const posix = toPosix(file);
  const root = REACT_ROOTS.find(
    (candidate) => posix === candidate || posix.startsWith(`${candidate}/`),
  );
  return root ? posix.slice(root.length + 1) : posix;
}

function hasSibling(file, suffix) {
  const dir = dirname(file);
  const base = basename(file).replace(/\.(ts|tsx)$/, '');
  return (
    existsSync(join(dir, `${base}${suffix}.ts`)) || existsSync(join(dir, `${base}${suffix}.tsx`))
  );
}

function isComponentSource(file) {
  const name = basename(file);
  const posix = toPosix(file);
  return (
    /\.tsx$/.test(name) &&
    !EXCLUDED_NAMES.has(name) &&
    !EXCLUDED_PATTERNS.some((p) => p.test(name)) &&
    name !== 'main.tsx' &&
    !posix.startsWith('src/routes/') &&
    !posix.startsWith('src/pages/')
  );
}

function componentNameFromPath(file) {
  const parts = reactRelativePath(file).split('/');
  const componentsIndex = parts.indexOf('Components');
  if (componentsIndex === -1) return null;
  return {
    folder: parts[componentsIndex + 1],
    fileBase: basename(file).replace(/\.tsx$/, ''),
  };
}

for (const file of srcFiles) {
  const name = basename(file);
  if (EXCLUDED_NAMES.has(name)) continue;
  if (EXCLUDED_PATTERNS.some((p) => p.test(name))) continue;

  if (!hasSibling(file, '.test')) {
    missing.push(file);
  }
}

for (const file of srcFiles) {
  const posix = reactRelativePath(file);
  const name = basename(file);

  if (isComponentSource(file)) {
    const component = componentNameFromPath(file);

    if (!component && !['App.tsx', 'Root.tsx'].includes(posix)) {
      structureErrors.push(
        `${file} is a loose component file; move it under src/Components/<Name>/<Name>.tsx`,
      );
    }

    if (
      component &&
      (component.folder !== component.fileBase ||
        posix !== `Components/${component.fileBase}/${component.fileBase}.tsx`)
    ) {
      structureErrors.push(
        `${file} must live at src/Components/${component.fileBase}/${component.fileBase}.tsx`,
      );
    }

    if (component && !hasSibling(file, '.test')) {
      structureErrors.push(`${file} is missing ${component.fileBase}.test.tsx`);
    }

    if (component && hasStorybook && !hasSibling(file, '.stories')) {
      structureErrors.push(`${file} is missing ${component.fileBase}.stories.tsx`);
    }
  }

  if (posix.includes('Components/') && /^index\.(ts|tsx)$/.test(name)) {
    structureErrors.push(
      `${file} is a component barrel; import the component file directly instead`,
    );
  }

  const source = readFileSync(file, 'utf-8');
  const directoryComponentImport = /from\s+['"][^'"]*\/Components\/[A-Z][A-Za-z0-9]*['"]/;
  if (directoryComponentImport.test(source)) {
    structureErrors.push(
      `${file} imports a component directory; import Components/<Name>/<Name>.js directly`,
    );
  }
}

for (const dirName of ['lib', 'store', 'utils', 'hooks']) {
  const dir = join('src', dirName);
  if (!existsSync(dir)) continue;

  const categoryFiles = walk(dir).filter(
    (file) => !EXCLUDED_PATTERNS.some((p) => p.test(basename(file))),
  );
  const childDirs = readdirSync(dir, { withFileTypes: true }).filter((entry) =>
    entry.isDirectory(),
  );
  for (const childDir of childDirs) {
    const childPath = join(dir, childDir.name);
    const childFiles = walk(childPath).filter(
      (file) => !EXCLUDED_PATTERNS.some((p) => p.test(basename(file))),
    );
    if (categoryFiles.length < 3 && childFiles.length < 3) {
      structureErrors.push(
        `${childPath} violates the flat-first rule; keep ${dirName} files flat until there are 3+ related files`,
      );
    }
  }
}

if (missing.length > 0 || structureErrors.length > 0) {
  console.error('\nTest co-location check failed.\n');
  if (missing.length > 0) {
    console.error('Missing test files for:');
    for (const f of missing) {
      const base = basename(f).replace(/\.(ts|tsx)$/, '');
      console.error(`  ${f} -> expected ${dirname(f)}/${base}.test.ts(x)`);
    }
    console.error(`\n${missing.length} file(s) missing co-located tests.`);
  }
  if (structureErrors.length > 0) {
    console.error('\nReact structure violations:');
    for (const error of structureErrors) {
      console.error(`  ${error}`);
    }
    console.error(`\n${structureErrors.length} structure violation(s).`);
  }
  process.exit(1);
}

console.log('All source files have co-located tests.');
