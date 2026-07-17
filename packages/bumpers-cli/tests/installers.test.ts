import { describe, it, expect } from 'vitest';
import fs from 'fs-extra';
import os from 'node:os';
import path from 'node:path';
import { buildInstallerPipeline } from '../src/commands/up.js';
import { installBase } from '../src/installers/base.installer.js';
import { installElectron } from '../src/installers/electron.installer.js';
import { installReact } from '../src/installers/react.installer.js';
import { installTeamsTab } from '../src/installers/teams-tab.installer.js';
import { installVitest } from '../src/installers/vitest.installer.js';
import { installGit } from '../src/installers/git.installer.js';
import { installValidate } from '../src/installers/validate.installer.js';
import type { InstallerOptions } from '../src/installers/index.js';
import { InstallerPhase } from '../src/installers/index.js';
import { IPC, TEST_IDS, SCRIPT_KEYS, SCRIPT_CMDS, REACT_SCRIPT_CMDS, TEAMS_TAB_FILES } from '../src/shared/constants.js';

describe('installer pipeline', () => {
  describe('Electron pipeline', () => {
    const pipeline = buildInstallerPipeline({ template: 'electron' });

    it('includes installElectron when template is electron', () => {
      expect(pipeline).toContainEqual(
        expect.objectContaining({ name: installElectron.name }),
      );
    });

    it('starts with installBase', () => {
      expect(pipeline[0]).toBe(installBase);
    });

    it('ends with installGit', () => {
      expect(pipeline[pipeline.length - 1]).toBe(installGit);
    });

    it('has installValidate as second-to-last', () => {
      expect(pipeline[pipeline.length - 2]).toBe(installValidate);
    });

    it('has installers in ascending phase order', () => {
      for (let i = 1; i < pipeline.length; i++) {
        expect(pipeline[i].phase).toBeGreaterThanOrEqual(pipeline[i - 1].phase);
      }
    });

    it('every installer has a non-empty name', () => {
      for (const installer of pipeline) {
        expect(typeof installer.name).toBe('string');
        expect(installer.name.length).toBeGreaterThan(0);
      }
    });

    it('every installer has a run function', () => {
      for (const installer of pipeline) {
        expect(typeof installer.run).toBe('function');
      }
    });

    it('every installer has a valid phase', () => {
      for (const installer of pipeline) {
        expect(Object.values(InstallerPhase)).toContain(installer.phase);
      }
    });
  });

  describe('Teams Tab pipeline', () => {
    const pipeline = buildInstallerPipeline({ template: 'teams-tab' });

    it('includes installTeamsTab', () => {
      expect(pipeline).toContainEqual(
        expect.objectContaining({ name: installTeamsTab.name }),
      );
    });

    it('does NOT include installElectron', () => {
      expect(pipeline).not.toContainEqual(
        expect.objectContaining({ name: installElectron.name }),
      );
    });

    it('starts with installBase', () => {
      expect(pipeline[0]).toBe(installBase);
    });

    it('ends with installGit', () => {
      expect(pipeline[pipeline.length - 1]).toBe(installGit);
    });

    it('has installValidate as second-to-last', () => {
      expect(pipeline[pipeline.length - 2]).toBe(installValidate);
    });

    it('has installers in ascending phase order', () => {
      for (let i = 1; i < pipeline.length; i++) {
        expect(pipeline[i].phase).toBeGreaterThanOrEqual(pipeline[i - 1].phase);
      }
    });

    it('every installer has a non-empty name', () => {
      for (const installer of pipeline) {
        expect(typeof installer.name).toBe('string');
        expect(installer.name.length).toBeGreaterThan(0);
      }
    });

    it('every installer has a run function', () => {
      for (const installer of pipeline) {
        expect(typeof installer.run).toBe('function');
      }
    });

    it('every installer has a valid phase', () => {
      for (const installer of pipeline) {
        expect(Object.values(InstallerPhase)).toContain(installer.phase);
      }
    });

    it('has same number of installers as Electron pipeline', () => {
      const electronPipeline = buildInstallerPipeline({ template: 'electron' });
      expect(pipeline.length).toBe(electronPipeline.length);
    });

    it('uses displayName for Teams user-facing runtime surfaces without changing package name', async () => {
      const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'bumpers-teams-display-name-'));
      const projectName = 'timetiles';
      const displayName = 'TimeTiles';
      const projectDir = path.join(tempDir, projectName);

      try {
        await fs.mkdirp(projectDir);
        const opts: InstallerOptions = {
          projectName,
          projectDir,
          template: 'teams-tab',
          packageManager: 'npm',
          cliVersion: '0.1.0',
          displayName,
        };

        await installBase.run(opts);
        await installTeamsTab.run(opts);

        const pkg = await fs.readJson(path.join(projectDir, 'package.json'));
        expect(pkg.name).toBe(projectName);

        const manifest = await fs.readJson(path.join(projectDir, TEAMS_TAB_FILES.MANIFEST));
        expect(manifest.developer.name).toBe(displayName);
        expect(manifest.name.short).toBe(displayName);
        expect(manifest.name.full).toBe(`${displayName} - Teams Tab`);
        expect(manifest.staticTabs[0].name).toBe(displayName);

        const html = await fs.readFile(path.join(projectDir, TEAMS_TAB_FILES.HTML), 'utf-8');
        expect(html).toContain(`<title>${displayName}</title>`);

        const app = await fs.readFile(path.join(projectDir, TEAMS_TAB_FILES.APP), 'utf-8');
        expect(app).toContain(`<h1>${displayName}</h1>`);
        expect(app).not.toContain(`<h1>${projectName}</h1>`);
      } finally {
        fs.removeSync(tempDir);
      }
    });

  });

  describe('React pipeline', () => {
    const pipeline = buildInstallerPipeline({ template: 'react' });

    it('includes installReact', () => {
      expect(pipeline).toContainEqual(
        expect.objectContaining({ name: installReact.name }),
      );
    });

    it('does NOT include installElectron', () => {
      expect(pipeline).not.toContainEqual(
        expect.objectContaining({ name: installElectron.name }),
      );
    });

    it('does NOT include installTeamsTab', () => {
      expect(pipeline).not.toContainEqual(
        expect.objectContaining({ name: installTeamsTab.name }),
      );
    });

    it('starts with installBase', () => {
      expect(pipeline[0]).toBe(installBase);
    });

    it('ends with installGit', () => {
      expect(pipeline[pipeline.length - 1]).toBe(installGit);
    });

    it('has installValidate as second-to-last', () => {
      expect(pipeline[pipeline.length - 2]).toBe(installValidate);
    });

    it('has installers in ascending phase order', () => {
      for (let i = 1; i < pipeline.length; i++) {
        expect(pipeline[i].phase).toBeGreaterThanOrEqual(pipeline[i - 1].phase);
      }
    });

    it('has same number of installers as Electron pipeline', () => {
      const electronPipeline = buildInstallerPipeline({ template: 'electron' });
      expect(pipeline.length).toBe(electronPipeline.length);
    });
  });
});

describe('shared constants sanity', () => {
  it('IPC bridge name is electronAPI', () => {
    expect(IPC.BRIDGE_NAME).toBe('electronAPI');
  });

  it('TEST_IDS.EXAMPLE_ITEM is example-item', () => {
    expect(TEST_IDS.EXAMPLE_ITEM).toBe('example-item');
  });

  it('SCRIPT_KEYS and SCRIPT_CMDS have matching keys', () => {
    for (const key of Object.keys(SCRIPT_CMDS)) {
      expect(SCRIPT_KEYS).toHaveProperty(key);
    }
  });

  it('React E2E scripts generate TanStack routes before Playwright runs', () => {
    expect(REACT_SCRIPT_CMDS.TEST_E2E).toBe('tsr generate && playwright test');
    expect(REACT_SCRIPT_CMDS.TEST_E2E_HEADED).toBe('tsr generate && playwright test --headed');
    expect(REACT_SCRIPT_CMDS.TEST_E2E_UPDATE).toBe('tsr generate && playwright test --update-snapshots');
  });
});
