import path from 'node:path';
import fs from 'fs-extra';

const INVALID_CHARS = /[^a-z0-9\-_]/;

export function validateProjectName(name: string): { valid: boolean; message?: string } {
  if (!name || name.trim().length === 0) {
    return { valid: false, message: 'Project name cannot be empty.' };
  }

  if (name.includes(' ')) {
    return { valid: false, message: 'Project name cannot contain spaces.' };
  }

  if (name.startsWith('.') || name.startsWith('-')) {
    return { valid: false, message: 'Project name cannot start with a dot or dash.' };
  }

  if (INVALID_CHARS.test(name)) {
    return {
      valid: false,
      message: 'Project name can only contain lowercase letters, numbers, dashes, and underscores.',
    };
  }

  const targetDir = path.resolve(process.cwd(), name);
  if (fs.existsSync(targetDir)) {
    return { valid: false, message: `Directory "${name}" already exists.` };
  }

  return { valid: true };
}
