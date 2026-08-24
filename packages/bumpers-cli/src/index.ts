import { Command } from 'commander';
import { realpathSync } from 'node:fs';
import { createRequire } from 'node:module';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { registerUpCommand } from './commands/up.js';
import { TOP_LEVEL_HELP_NOTE } from './shared/help.js';

const require = createRequire(import.meta.url);
const { version } = require('../package.json');

export function createProgram(): Command {
  const program = new Command()
    .name('bumpers')
    .description('Scaffold apps with testing guardrails baked in')
    .version(version)
    .addHelpText('afterAll', `\n${TOP_LEVEL_HELP_NOTE}\n`);

  registerUpCommand(program);
  program.configureHelp({
    subcommandTerm: (command) => `${command.name()} ${command.usage()}`,
  });

  return program;
}

export function isCliEntrypoint(entrypoint: string | undefined, moduleUrl = import.meta.url): boolean {
  if (!entrypoint) {
    return false;
  }

  try {
    return realpathSync(entrypoint) === realpathSync(fileURLToPath(moduleUrl));
  } catch {
    return pathToFileURL(entrypoint).href === moduleUrl;
  }
}

const entrypoint = process.argv[1];
if (isCliEntrypoint(entrypoint)) {
  createProgram().parse();
}
