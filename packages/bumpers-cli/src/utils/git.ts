import { execSync } from 'node:child_process';

function run(command: string, cwd: string): void {
  try {
    execSync(command, { cwd, stdio: 'pipe' });
  } catch (error) {
    // Re-throw with the actual stderr/stdout from the command
    const stderr = (error as any)?.stderr?.toString().trim() ?? '';
    const stdout = (error as any)?.stdout?.toString().trim() ?? '';
    const detail = stderr || stdout || 'unknown error';
    throw new Error(`Command failed: ${command}\n${detail}`);
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
