import { copy, emptyDir } from 'fs-extra';

await emptyDir('dist/templates');
await copy('templates', 'dist/templates');
