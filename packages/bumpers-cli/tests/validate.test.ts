import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'fs-extra';
import path from 'node:path';
import os from 'node:os';
import { validateProjectName } from '../src/utils/validate.js';

describe('validateProjectName', () => {
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'bumpers-validate-'));
  });

  afterEach(() => {
    fs.removeSync(tmpDir);
  });

  // --- Valid names ---

  it('accepts valid names like my-app', () => {
    const result = validateProjectName('my-app');
    expect(result.valid).toBe(true);
    expect(result.message).toBeUndefined();
  });

  it('accepts names with underscores', () => {
    const result = validateProjectName('my_app');
    expect(result.valid).toBe(true);
    expect(result.message).toBeUndefined();
  });

  it('accepts numeric names', () => {
    const result = validateProjectName('app123');
    expect(result.valid).toBe(true);
  });

  // --- Empty / whitespace ---

  it('rejects empty names', () => {
    const result = validateProjectName('');
    expect(result.valid).toBe(false);
    expect(result.message).toContain('empty');
  });

  it('rejects whitespace-only names', () => {
    const result = validateProjectName('   ');
    expect(result.valid).toBe(false);
    expect(result.message).toBeDefined();
  });

  // --- Invalid characters ---

  it('rejects names with spaces', () => {
    const result = validateProjectName('my app');
    expect(result.valid).toBe(false);
    expect(result.message).toContain('spaces');
  });

  it('rejects names with uppercase letters', () => {
    const result = validateProjectName('MyApp');
    expect(result.valid).toBe(false);
    expect(result.message).toContain('lowercase');
  });

  it('rejects names with special characters', () => {
    const result = validateProjectName('my@app');
    expect(result.valid).toBe(false);
    expect(result.message).toContain('lowercase');
  });

  it('rejects names with dots in the middle', () => {
    const result = validateProjectName('my.app');
    expect(result.valid).toBe(false);
    expect(result.message).toContain('lowercase');
  });

  // --- Leading characters ---

  it('rejects names starting with a dot', () => {
    const result = validateProjectName('.hidden');
    expect(result.valid).toBe(false);
    expect(result.message).toContain('dot');
  });

  it('rejects names starting with a dash', () => {
    const result = validateProjectName('-bad');
    expect(result.valid).toBe(false);
    expect(result.message).toContain('dash');
  });

  // --- Existing directory ---

  it('rejects names with existing directories', () => {
    // Create the directory INSIDE tmpDir, then chdir there for the test
    const dirName = 'existing-dir';
    const targetDir = path.join(tmpDir, dirName);
    fs.mkdirpSync(targetDir);

    // validateProjectName uses path.resolve(process.cwd(), name)
    // so we need to temporarily change cwd to tmpDir
    const originalCwd = process.cwd();
    try {
      process.chdir(tmpDir);
      const result = validateProjectName(dirName);
      expect(result.valid).toBe(false);
      expect(result.message).toContain('already exists');
    } finally {
      process.chdir(originalCwd);
    }
  });
});
