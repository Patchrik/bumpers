import path from 'node:path';
import { InstallerPhase } from './index.js';
import type { DataFetchingOption, Installer, RouterOption, StateOption } from './index.js';
import {
  readPackageJson,
  writePackageJson,
  addDependencies,
  addDevDependencies,
  addScripts,
} from '../utils/pkg.js';
import { writeTemplateFile } from '../utils/templates.js';
import { REACT_DIRS, REACT_FILES, REACT_SCRIPT_CMDS, SCRIPT_KEYS, REACT_TEST_IDS } from '../shared/constants.js';
import { VERSIONS } from '../shared/versions.js';

function getReactBuildScript(router: RouterOption): string {
  return router === 'tanstack' ? REACT_SCRIPT_CMDS.BUILD : 'tsc --noEmit && vite build';
}

function getReactTemplateFiles(
  router: RouterOption,
  stateManagement: StateOption,
  dataFetching: DataFetchingOption,
  httpClient: string,
): Array<[outputPath: string, templatePath: string]> {
  const sharedFiles: Array<[outputPath: string, templatePath: string]> = [
    [REACT_FILES.HTML, 'react/index.html'],
    [REACT_FILES.INDEX_CSS, 'react/src/index.css'],
    [REACT_FILES.ENV_DTS, 'react/src/env.d.ts'],
  ];

  if (httpClient === 'axios') {
    sharedFiles.push([REACT_FILES.API_CLIENT, 'react/src/lib/api.ts']);
  }

  if (dataFetching === 'tanstack-query') {
    sharedFiles.push([REACT_FILES.QUERY_CLIENT, 'react/src/lib/query-client.ts']);
  }

  if (stateManagement === 'zustand') {
    sharedFiles.push(
      [REACT_FILES.COUNTER_STORE, 'react/src/store/counter.ts'],
      [REACT_FILES.COUNTER_COMPONENT, 'react/src/Components/Counter/Counter.tsx'],
    );
  } else if (stateManagement === 'jotai') {
    sharedFiles.push(
      [REACT_FILES.ATOMS, 'react/state-jotai/src/store/atoms.ts'],
      [REACT_FILES.COUNTER_COMPONENT, 'react/state-jotai/src/Components/Counter/Counter.tsx'],
    );
  } else if (stateManagement === 'redux-toolkit') {
    sharedFiles.push(
      [REACT_FILES.REDUX_STORE, 'react/state-redux-toolkit/src/store/store.ts'],
      [REACT_FILES.REDUX_HOOKS, 'react/state-redux-toolkit/src/store/hooks.ts'],
      [REACT_FILES.COUNTER_SLICE, 'react/state-redux-toolkit/src/store/slices/counterSlice.ts'],
      [REACT_FILES.RTK_QUERY_API, 'react/state-redux-toolkit/src/store/services/api.ts'],
      [REACT_FILES.COUNTER_COMPONENT, 'react/state-redux-toolkit/src/Components/Counter/Counter.tsx'],
    );
  } else {
    sharedFiles.push([REACT_FILES.COUNTER_COMPONENT, 'react/state-none/src/Components/Counter/Counter.tsx']);
  }

  if (router === 'tanstack') {
    const routerEntryPrefix =
      stateManagement === 'redux-toolkit'
        ? 'react/router-tanstack/redux'
        : dataFetching === 'tanstack-query'
          ? 'react'
          : 'react/router-tanstack/no-query';
    return [
      ...sharedFiles,
      [REACT_FILES.TSR_CONFIG, 'react/tsr.config.json'],
      [REACT_FILES.VITE_CONFIG, 'react/vite.config.ts'],
      [REACT_FILES.MAIN, `${routerEntryPrefix}/src/main.tsx`],
      [REACT_FILES.ROOT, 'react/src/Root.tsx'],
      [REACT_FILES.APP, 'react/src/App.tsx'],
      [REACT_FILES.ROOT_ROUTE, 'react/src/routes/__root.tsx'],
      [REACT_FILES.INDEX_ROUTE, 'react/src/routes/index.tsx'],
      [REACT_FILES.ABOUT_ROUTE, 'react/src/routes/about.tsx'],
      [REACT_FILES.TEST_UTILS, `${routerEntryPrefix}/src/test-utils.tsx`],
      [path.join(REACT_DIRS.SRC, 'routeTree.gen.d.ts'), 'react/src/routeTree.gen.d.ts'],
    ];
  }

  if (router === 'react-router') {
    const routerEntryPrefix =
      stateManagement === 'redux-toolkit'
        ? 'react/router-react-router/redux'
        : dataFetching === 'tanstack-query'
          ? 'react/router-react-router'
          : 'react/router-react-router/no-query';
    return [
      ...sharedFiles,
      [REACT_FILES.VITE_CONFIG, 'react/router-react-router/vite.config.ts'],
      [REACT_FILES.MAIN, `${routerEntryPrefix}/src/main.tsx`],
      [REACT_FILES.ROOT, 'react/router-react-router/src/Root.tsx'],
      [REACT_FILES.APP, 'react/router-react-router/src/App.tsx'],
      [REACT_FILES.HOME_PAGE, 'react/router-react-router/src/pages/Home.tsx'],
      [REACT_FILES.ABOUT_PAGE, 'react/router-react-router/src/pages/About.tsx'],
      [REACT_FILES.TEST_UTILS, `${routerEntryPrefix}/src/test-utils.tsx`],
    ];
  }

  if (router === 'wouter') {
    const routerEntryPrefix =
      stateManagement === 'redux-toolkit'
        ? 'react/router-wouter/redux'
        : dataFetching === 'tanstack-query'
          ? 'react/router-wouter'
          : 'react/router-wouter/no-query';
    return [
      ...sharedFiles,
      [REACT_FILES.VITE_CONFIG, 'react/router-wouter/vite.config.ts'],
      [REACT_FILES.MAIN, `${routerEntryPrefix}/src/main.tsx`],
      [REACT_FILES.ROOT, 'react/router-wouter/src/Root.tsx'],
      [REACT_FILES.APP, 'react/router-wouter/src/App.tsx'],
      [REACT_FILES.HOME_PAGE, 'react/router-wouter/src/pages/Home.tsx'],
      [REACT_FILES.ABOUT_PAGE, 'react/router-wouter/src/pages/About.tsx'],
      [REACT_FILES.TEST_UTILS, `${routerEntryPrefix}/src/test-utils.tsx`],
    ];
  }

  const routerEntryPrefix =
    stateManagement === 'redux-toolkit'
      ? 'react/router-none/redux'
      : dataFetching === 'tanstack-query'
        ? 'react/router-none'
        : 'react/router-none/no-query';
  return [
    ...sharedFiles,
    [REACT_FILES.VITE_CONFIG, 'react/router-none/vite.config.ts'],
    [REACT_FILES.MAIN, `${routerEntryPrefix}/src/main.tsx`],
    [REACT_FILES.ROOT, 'react/router-none/src/Root.tsx'],
    [REACT_FILES.APP, 'react/router-none/src/App.tsx'],
    [REACT_FILES.TEST_UTILS, `${routerEntryPrefix}/src/test-utils.tsx`],
  ];
}

export const installReact: Installer = {
  name: 'Setting up React + Vite app...',
  phase: InstallerPhase.SCAFFOLD,
  run: async (opts) => {
    const { projectDir, projectName } = opts;
    const router = opts.reactOptions?.router ?? 'tanstack';
    const stateManagement = opts.reactOptions?.stateManagement ?? 'zustand';
    const dataFetching = opts.reactOptions?.dataFetching ?? 'tanstack-query';
    const httpClient = opts.reactOptions?.httpClient ?? 'axios';

    const pkg = await readPackageJson(projectDir);

    addDependencies(pkg, {
      react: VERSIONS.react,
      'react-dom': VERSIONS.reactDom,
    });

    if (stateManagement === 'zustand') {
      addDependencies(pkg, { zustand: VERSIONS.zustand });
    } else if (stateManagement === 'jotai') {
      addDependencies(pkg, { jotai: VERSIONS.jotai });
    } else if (stateManagement === 'redux-toolkit') {
      addDependencies(pkg, {
        '@reduxjs/toolkit': VERSIONS.reduxToolkit,
        'react-redux': VERSIONS.reactRedux,
      });
    }

    if (httpClient === 'axios') {
      addDependencies(pkg, { axios: VERSIONS.axios });
    }

    if (dataFetching === 'tanstack-query') {
      addDependencies(pkg, { '@tanstack/react-query': VERSIONS.tanstackQuery });
    }

    if (router === 'tanstack') {
      addDependencies(pkg, {
        '@tanstack/react-router': VERSIONS.tanstackRouter,
      });
    } else if (router === 'react-router') {
      addDependencies(pkg, {
        'react-router': VERSIONS.reactRouter,
      });
    } else if (router === 'wouter') {
      addDependencies(pkg, {
        wouter: VERSIONS.wouter,
      });
    }

    addDevDependencies(pkg, {
      typescript: VERSIONS.typescript,
      '@types/react': VERSIONS.typesReact,
      '@types/react-dom': VERSIONS.typesReactDom,
      '@vitejs/plugin-react': VERSIONS.vitejsPluginReact,
      vite: VERSIONS.vite,
      tailwindcss: VERSIONS.tailwindcss,
      '@tailwindcss/vite': VERSIONS.tailwindcssVite,
    });

    if (dataFetching === 'tanstack-query') {
      addDevDependencies(pkg, {
        '@tanstack/react-query-devtools': VERSIONS.tanstackQueryDevtools,
      });
    }

    if (router === 'tanstack') {
      addDevDependencies(pkg, {
        '@tanstack/router-plugin': VERSIONS.tanstackRouterPlugin,
        '@tanstack/router-cli': VERSIONS.tanstackRouterCli,
        '@tanstack/react-router-devtools': VERSIONS.tanstackRouterDevtools,
      });
    }

    addScripts(pkg, {
      [SCRIPT_KEYS.DEV]: REACT_SCRIPT_CMDS.DEV,
      [SCRIPT_KEYS.BUILD]: getReactBuildScript(router),
      [SCRIPT_KEYS.PREVIEW]: REACT_SCRIPT_CMDS.PREVIEW,
      ...(router === 'tanstack'
        ? {
            [SCRIPT_KEYS.GENERATE_ROUTES]: REACT_SCRIPT_CMDS.GENERATE_ROUTES,
            [SCRIPT_KEYS.POSTINSTALL]: REACT_SCRIPT_CMDS.GENERATE_ROUTES,
          }
        : {}),
    });

    await writePackageJson(projectDir, pkg);

    const vars = {
      projectName,
      reactCounterIncrementTestId: REACT_TEST_IDS.COUNTER_INCREMENT,
      reactCounterTestId: REACT_TEST_IDS.COUNTER,
      reactHeadingTestId: REACT_TEST_IDS.HEADING,
      reactNavAboutTestId: REACT_TEST_IDS.NAV_ABOUT,
      reactNavHomeTestId: REACT_TEST_IDS.NAV_HOME,
    };

    for (const [outputPath, templatePath] of getReactTemplateFiles(
      router,
      stateManagement,
      dataFetching,
      httpClient,
    )) {
      await writeTemplateFile(projectDir, outputPath, templatePath, vars);
    }
  },
};
