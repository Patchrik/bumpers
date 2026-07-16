import { describe, expect, it } from 'vitest';
import fs from 'fs-extra';
import os from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { isCliEntrypoint } from '../src/index.js';

describe('CLI entrypoint detection', () => {
  it('treats npm bin symlinks as the CLI entrypoint', () => {
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'bumpers-entrypoint-'));
    const entrypoint = path.join(tempDir, 'index.js');
    const symlink = path.join(tempDir, 'bumpers');

    try {
      fs.writeFileSync(entrypoint, '#!/usr/bin/env node\n');
      fs.symlinkSync(entrypoint, symlink);

      expect(isCliEntrypoint(symlink, pathToFileURL(entrypoint).href)).toBe(true);
    } finally {
      fs.removeSync(tempDir);
    }
  });
});
