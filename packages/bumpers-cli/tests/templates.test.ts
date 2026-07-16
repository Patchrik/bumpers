import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import fs from 'fs-extra';
import os from 'node:os';
import path from 'node:path';
import { writeTemplateFile } from '../src/utils/templates.js';

describe('writeTemplateFile', () => {
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'bumpers-templates-'));
  });

  afterEach(() => {
    fs.removeSync(tmpDir);
  });

  it('renders a template to a nested output path with substitutions', async () => {
    await writeTemplateFile(tmpDir, 'nested/AGENTS.md', 'ai-config/AGENTS.md', {
      projectName: 'demo-app',
    });

    const output = await fs.readFile(path.join(tmpDir, 'nested/AGENTS.md'), 'utf-8');
    expect(output).toContain('# demo-app');
    expect(output).not.toContain('{{projectName}}');
  });
});
