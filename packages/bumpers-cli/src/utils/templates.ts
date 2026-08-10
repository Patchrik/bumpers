import path from 'node:path';
import { fileURLToPath } from 'node:url';
import fs from 'fs-extra';

const __filename = fileURLToPath(import.meta.url);
const __utilsDir = path.dirname(__filename);

// Resolve templates directory — works both in src/ (dev) and dist/ (built)
function resolveTemplatesDir(): string {
  // Try src layout first: src/utils/ → ../../templates/
  const srcPath = path.resolve(__utilsDir, '../../templates');
  if (fs.existsSync(srcPath)) return srcPath;

  // Try dist layout: dist/ → dist/templates/
  const distPath = path.resolve(__utilsDir, './templates');
  if (fs.existsSync(distPath)) return distPath;

  // Fallback for a built package in the repository tree.
  const sourcePath = path.resolve(__utilsDir, '../templates');
  if (fs.existsSync(sourcePath)) return sourcePath;

  throw new Error(
    'Could not find templates directory. Ensure templates/ exists.',
  );
}

const TEMPLATES_DIR = resolveTemplatesDir();

/** Resolved path to the templates/ directory (works from src/ and dist/). */
export { TEMPLATES_DIR };

/**
 * Read a template file from the templates/ directory.
 * Use {{placeholder}} syntax for substitution.
 */
export async function readTemplate(
  relativePath: string,
  vars?: Record<string, string>,
): Promise<string> {
  const fullPath = path.join(TEMPLATES_DIR, relativePath);
  let content = await fs.readFile(fullPath, 'utf-8');
  if (vars) {
    for (const [key, value] of Object.entries(vars)) {
      content = content.replaceAll(`{{${key}}}`, value);
    }
  }
  return content;
}

export async function writeTemplateFile(
  projectDir: string,
  outputPath: string,
  templatePath: string,
  vars?: Record<string, string>,
): Promise<void> {
  const content = await readTemplate(templatePath, vars);
  const fullOutputPath = path.join(projectDir, outputPath);
  await fs.mkdirp(path.dirname(fullOutputPath));
  await fs.writeFile(fullOutputPath, content);
}
