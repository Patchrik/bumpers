import { execSync } from 'node:child_process';

function run(command: string, cwd: string): void {
  // ETXTBSY ("text file busy") is a transient race: npx downloads a binary
  // (e.g. lefthook) and spawns it before the file write is flushed.
  const attempts = 3;
  for (let attempt = 1; ; attempt++) {
    try {
      execSync(command, { cwd, stdio: 'pipe' });
      return;
    } catch (error) {
      const detail = `${(error as any)?.stderr?.toString().trim() ?? ''}${(error as any)?.stdout?.toString().trim() ?? ''}`;
      const transient = detail.includes('ETXTBSY') && attempt < attempts;
      if (!transient) {
        throw new Error(`Command failed: ${command}\n${detail || 'unknown error'}`);
      }
      // Give the npx-installed binary a moment to finish flushing.
      Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 100 * attempt);
    }
  }
}

export function gitInit(dir: string): void {
  run('git init', dir);
}

export function gitAdd(dir: string): void {
  run('git add -A', dir);
}

export function gitCommit(dir: string, message: string): void {
  // Escape double quotes in the message to prevent shell injection
  const safeMessage = message.replace(/"/g, '\\"');
  run(`git commit -m "${safeMessage}"`, dir);
}

export function lefthookInstall(dir: string): void {
  run('npx lefthook install', dir);
}
