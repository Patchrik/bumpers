import path from 'node:path';
import fs from 'fs-extra';
import { InstallerPhase } from './index.js';
import type { Installer } from './index.js';
import { readPackageJson, writePackageJson, addDependencies, addDevDependencies, addScripts } from '../utils/pkg.js';
import { DIRS, FILES, IPC, TEST_IDS, SCRIPT_KEYS, SCRIPT_CMDS, PACKAGES } from '../shared/constants.js';
import { VERSIONS } from '../shared/versions.js';

export const installElectron: Installer = {
  name: 'Setting up Electron + React + TypeScript...',
  phase: InstallerPhase.SCAFFOLD,
  run: async (opts) => {
    const { projectDir, projectName } = opts;

    // Update package.json
    const pkg = await readPackageJson(projectDir);
    pkg.main = './dist/main/index.js';

    addDependencies(pkg, {
      [PACKAGES.ELECTRON_TOOLKIT_UTILS]: VERSIONS.electronToolkitUtils,
      'react': VERSIONS.react,
      'react-dom': VERSIONS.reactDom,
    });

    addDevDependencies(pkg, {
      'electron': VERSIONS.electron,
      'electron-vite': VERSIONS.electronVite,
      'electron-builder': VERSIONS.electronBuilder,
      '@types/react': VERSIONS.typesReact,
      '@types/react-dom': VERSIONS.typesReactDom,
      'typescript': VERSIONS.typescript,
    });

    addScripts(pkg, {
      [SCRIPT_KEYS.DEV]: SCRIPT_CMDS.DEV,
      [SCRIPT_KEYS.BUILD]: SCRIPT_CMDS.BUILD,
      [SCRIPT_KEYS.PREVIEW]: SCRIPT_CMDS.PREVIEW,
      [SCRIPT_KEYS.START]: SCRIPT_CMDS.START,
      [SCRIPT_KEYS.POSTINSTALL]: SCRIPT_CMDS.POSTINSTALL,
    });

    await writePackageJson(projectDir, pkg);

    // --- Config files ---

    // electron.vite.config.ts
    await fs.writeFile(
      path.join(projectDir, 'electron.vite.config.ts'),
      `import { resolve } from 'path';
import { defineConfig, externalizeDepsPlugin } from 'electron-vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()],
    // externalizeDepsPlugin() automatically externalizes all node_modules
    // for the main process. This is critical for native modules like
    // better-sqlite3 — they must NOT be bundled by Vite.
    build: {
      outDir: 'dist/main',
      rollupOptions: {
        input: {
          index: resolve(__dirname, 'src/main/index.ts'),
        },
      },
    },
  },
  preload: {
    plugins: [externalizeDepsPlugin()],
    build: {
      outDir: 'dist/preload',
      rollupOptions: {
        input: {
          index: resolve(__dirname, 'src/preload/index.ts'),
        },
        output: {
          // Sandboxed preload scripts are executed as plain JS inside a function
          // wrapper — ESM import syntax is illegal there. Force CJS so Rollup
          // emits require() calls.  This also prevents electron-vite from
          // overwriting entryFileNames to '[name].mjs' (its ES-format default
          // when "type":"module" is set in package.json).
          format: 'cjs',
          entryFileNames: '[name].js',
        },
      },
    },
  },
  renderer: {
    plugins: [react()],
    root: './src/renderer',
    build: {
      outDir: '../../dist/renderer',
      rollupOptions: {
        input: {
          index: resolve(__dirname, 'src/renderer/index.html'),
        },
      },
    },
  },
});
`,
    );

    // electron-builder.yml
    await fs.writeFile(
      path.join(projectDir, 'electron-builder.yml'),
      `appId: com.electron.${projectName}
productName: ${projectName}
directories:
  buildResources: build
files:
  - dist/**/*
  - "!dist/renderer/**/*"
extraResources:
  - from: dist/renderer
    to: renderer
mac:
  target:
    - dmg
win:
  target:
    - nsis
linux:
  target:
    - AppImage
`,
    );

    // tsconfig.main.json
    await fs.writeJson(
      path.join(projectDir, 'tsconfig.main.json'),
      {
        extends: './tsconfig.json',
        compilerOptions: {
          outDir: './dist/main',
          module: 'ESNext',
          moduleResolution: 'bundler',
          lib: ['ES2022'],
        },
        include: ['src/main/**/*', 'src/preload/**/*', 'shared/**/*'],
      },
      { spaces: 2 },
    );

    // tsconfig.renderer.json
    await fs.writeJson(
      path.join(projectDir, 'tsconfig.renderer.json'),
      {
        extends: './tsconfig.json',
        compilerOptions: {
          outDir: './dist/renderer',
          module: 'ESNext',
          moduleResolution: 'bundler',
          lib: ['ES2022', 'DOM', 'DOM.Iterable'],
          jsx: 'react-jsx',
        },
        include: ['src/renderer/src/**/*', 'shared/**/*'],
      },
      { spaces: 2 },
    );

    // Update root tsconfig references
    const rootTsconfig = await fs.readJson(path.join(projectDir, 'tsconfig.json'));
    rootTsconfig.references = [
      { path: './tsconfig.main.json' },
      { path: './tsconfig.renderer.json' },
    ];
    await fs.writeJson(path.join(projectDir, 'tsconfig.json'), rootTsconfig, { spaces: 2 });

    // --- Shared types ---
    await fs.mkdirp(path.join(projectDir, 'shared'));

    await fs.writeFile(
      path.join(projectDir, 'shared/ipc-channels.ts'),
      `export const IPC_CHANNELS = {
  EXAMPLE_LIST: 'example:list',
  EXAMPLE_GET: 'example:get',
} as const;
`,
    );

    await fs.writeFile(
      path.join(projectDir, 'shared/ipc-types.ts'),
      `export interface ExampleItem {
  id: number;
  title: string;
  status: 'active' | 'inactive';
  created_at: string;
}

export interface IElectronAPI {
  getExampleItems(): Promise<ExampleItem[]>;
  getExampleItem(id: number): Promise<ExampleItem | undefined>;
}
`,
    );

    // --- Main process ---
    await fs.mkdirp(path.join(projectDir, 'src/main/ipc'));

    await fs.writeFile(
      path.join(projectDir, 'src/main/index.ts'),
      `import { app, BrowserWindow } from 'electron';
import { registerAllHandlers } from './ipc/register.js';
import { createMainWindow } from './window.js';

const gotLock = app.requestSingleInstanceLock();

if (!gotLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    const win = BrowserWindow.getAllWindows()[0];
    if (win) {
      if (win.isMinimized()) win.restore();
      win.focus();
    }
  });

  app.whenReady().then(() => {
    registerAllHandlers();
    createMainWindow();

    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        createMainWindow();
      }
    });
  });

  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
      app.quit();
    }
  });
}
`,
    );

    await fs.writeFile(
      path.join(projectDir, 'src/main/window.ts'),
      `import { join } from 'path';
import { BrowserWindow, shell } from 'electron';
import { is } from '@electron-toolkit/utils';

export function createMainWindow(): BrowserWindow {
  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 1024,
    minHeight: 768,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
    },
  });

  // Open external links in default browser
  win.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  // Load renderer
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    win.loadURL(process.env['ELECTRON_RENDERER_URL']);
  } else {
    win.loadFile(join(__dirname, '../renderer/index.html'));
  }

  // Open devtools in dev mode
  if (is.dev) {
    win.webContents.openDevTools();
  }

  return win;
}
`,
    );

    await fs.writeFile(
      path.join(projectDir, 'src/main/ipc/register.ts'),
      `import { registerExampleHandlers } from './example.ipc.js';

export function registerAllHandlers(): void {
  registerExampleHandlers();
}
`,
    );

    await fs.writeFile(
      path.join(projectDir, 'src/main/ipc/example.ipc.ts'),
      `import { ipcMain } from 'electron';
import { IPC_CHANNELS } from '../../../shared/ipc-channels.js';
import type { ExampleItem } from '../../../shared/ipc-types.js';

const EXAMPLE_DATA: ExampleItem[] = [
  { id: 1, title: 'First Item', status: 'active', created_at: '2024-01-01' },
  { id: 2, title: 'Second Item', status: 'inactive', created_at: '2024-01-02' },
  { id: 3, title: 'Third Item', status: 'active', created_at: '2024-01-03' },
];

export function getExampleItems(): ExampleItem[] {
  return EXAMPLE_DATA;
}

export function getExampleItem(id: number): ExampleItem | undefined {
  return EXAMPLE_DATA.find((item) => item.id === id);
}

export function registerExampleHandlers(): void {
  ipcMain.handle(IPC_CHANNELS.EXAMPLE_LIST, () => getExampleItems());
  ipcMain.handle(IPC_CHANNELS.EXAMPLE_GET, (_event, id: number) => getExampleItem(id));
}
`,
    );

    // --- Preload ---
    await fs.mkdirp(path.join(projectDir, 'src/preload'));

    await fs.writeFile(
      path.join(projectDir, 'src/preload/index.ts'),
      `import { contextBridge, ipcRenderer } from 'electron';
import { IPC_CHANNELS } from '../../shared/ipc-channels.js';
import type { IElectronAPI } from '../../shared/ipc-types.js';

const api: IElectronAPI = {
  getExampleItems: () => ipcRenderer.invoke(IPC_CHANNELS.EXAMPLE_LIST),
  getExampleItem: (id: number) => ipcRenderer.invoke(IPC_CHANNELS.EXAMPLE_GET, id),
};

contextBridge.exposeInMainWorld('${IPC.BRIDGE_NAME}', api);
`,
    );

    // --- Renderer ---
    await fs.mkdirp(path.join(projectDir, 'src/renderer/src'));

    await fs.writeFile(
      path.join(projectDir, 'src/renderer/index.html'),
      `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; connect-src 'self' ws://localhost:*; img-src 'self' data:;" />
    <title>${projectName}</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="./src/main.tsx"></script>
  </body>
</html>
`,
    );

    await fs.writeFile(
      path.join(projectDir, 'src/renderer/src/main.tsx'),
      `import { createRoot } from 'react-dom/client';
import Root from './Root.js';
import './App.css';

const root = document.getElementById('root');
if (root) {
  createRoot(root).render(<Root />);
}
`,
    );

    await fs.writeFile(
      path.join(projectDir, 'src/renderer/src/Root.tsx'),
      `import App from './App.js';

export default function Root() {
  return <App />;
}
`,
    );

    await fs.mkdirp(path.join(projectDir, 'src/renderer/src/Components/ExampleItems'));

    await fs.writeFile(
      path.join(projectDir, 'src/renderer/src/Components/ExampleItems/ExampleItems.tsx'),
      `import { useEffect, useState } from 'react';
import type { ExampleItem } from '../../../../../shared/ipc-types.js';

export default function ExampleItems() {
  const [items, setItems] = useState<ExampleItem[]>([]);

  useEffect(() => {
    window.${IPC.BRIDGE_NAME}.getExampleItems().then(setItems);
  }, []);

  return (
    <>
      <h2>Example Items</h2>
      <ul>
        {items.map((item) => (
          <li key={item.id} data-testid="${TEST_IDS.EXAMPLE_ITEM}">
            <strong>{item.title}</strong> — <span className={\`status-\${item.status}\`}>{item.status}</span>
          </li>
        ))}
      </ul>
    </>
  );
}
`,
    );

    await fs.writeFile(
      path.join(projectDir, 'src/renderer/src/App.tsx'),
      `import ExampleItems from './Components/ExampleItems/ExampleItems.js';

function App() {
  return (
    <div className="container">
      <h1>${projectName}</h1>
      <p>Built with Electron + React + TypeScript</p>
      <ExampleItems />
    </div>
  );
}

export default App;
`,
    );

    await fs.writeFile(
      path.join(projectDir, 'src/renderer/src/App.css'),
      `:root {
  font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  line-height: 1.5;
  font-weight: 400;
  color: #213547;
  background-color: #ffffff;
}

@media (prefers-color-scheme: dark) {
  :root {
    color: #ffffffde;
    background-color: #242424;
  }
}

.container {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
}

h1 {
  font-size: 2rem;
  margin-bottom: 0.5rem;
}

h2 {
  font-size: 1.4rem;
  margin-top: 2rem;
}

ul {
  list-style: none;
  padding: 0;
}

li {
  padding: 0.75rem 1rem;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  margin-bottom: 0.5rem;
}

@media (prefers-color-scheme: dark) {
  li {
    border-color: #444;
  }
}

.status-active {
  color: #22c55e;
}

.status-inactive {
  color: #94a3b8;
}
`,
    );

    await fs.writeFile(
      path.join(projectDir, 'src/renderer/src/env.d.ts'),
      `import type { IElectronAPI } from '../../../../shared/ipc-types.js';

declare global {
  interface Window {
    ${IPC.BRIDGE_NAME}: IElectronAPI;
  }
}
`,
    );

    // Add @vitejs/plugin-react as a devDependency (needed by electron.vite.config.ts)
    const updatedPkg = await readPackageJson(projectDir);
    addDevDependencies(updatedPkg, {
      '@vitejs/plugin-react': VERSIONS.vitejsPluginReact,
    });
    await writePackageJson(projectDir, updatedPkg);
  },
};
