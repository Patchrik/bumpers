import path from 'node:path';
import fs from 'fs-extra';
import { InstallerPhase } from './index.js';
import type { Installer } from './index.js';
import { readTemplate } from '../utils/templates.js';
import {
  buildReactAgentsMd,
  buildReactClaudeMd,
  buildReactCopilotMd,
  buildReactCursorrules,
} from './react-ai-config.js';

export const installAiConfig: Installer = {
  name: 'Writing AI config files (AGENTS.md, CLAUDE.md, .cursorrules)...',
  phase: InstallerPhase.ENFORCEMENT,
  run: async (opts) => {
    const { projectDir, projectName, template } = opts;
    if (template === 'react') {
      const reactOptions = opts.reactOptions;
      if (!reactOptions) {
        throw new Error('React template requires reactOptions in InstallerOptions.');
      }

      await fs.writeFile(
        path.join(projectDir, 'AGENTS.md'),
        await buildReactAgentsMd(projectName, reactOptions),
      );

      await fs.writeFile(
        path.join(projectDir, 'CLAUDE.md'),
        await buildReactClaudeMd(projectName, reactOptions),
      );

      await fs.writeFile(
        path.join(projectDir, '.cursorrules'),
        await buildReactCursorrules(projectName, reactOptions),
      );

      await fs.mkdirp(path.join(projectDir, '.github'));
      await fs.writeFile(
        path.join(projectDir, '.github/copilot-instructions.md'),
        await buildReactCopilotMd(projectName, reactOptions),
      );
      return;
    }

    const vars = { projectName };

    // Use template-specific AI configs when available, fall back to default
    const suffix = template === 'teams-tab' ? '-teams-tab' : '';

    await fs.writeFile(
      path.join(projectDir, 'AGENTS.md'),
      await readTemplate(`ai-config/AGENTS${suffix}.md`, vars),
    );

    await fs.writeFile(
      path.join(projectDir, 'CLAUDE.md'),
      await readTemplate(`ai-config/CLAUDE${suffix}.md`, vars),
    );

    await fs.writeFile(
      path.join(projectDir, '.cursorrules'),
      await readTemplate(`ai-config/cursorrules${suffix}.txt`, vars),
    );

    await fs.mkdirp(path.join(projectDir, '.github'));
    await fs.writeFile(
      path.join(projectDir, '.github/copilot-instructions.md'),
      await readTemplate(`ai-config/copilot-instructions${suffix}.md`, vars),
    );
  },
};
