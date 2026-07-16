import { render, type RenderOptions } from '@testing-library/react';
import type { ReactElement, ReactNode } from 'react';
import { Provider } from 'react-redux';
import {
  createMemoryHistory,
  createRouter,
  RouterProvider,
} from '@tanstack/react-router';
import { routeTree } from './routeTree.gen';
import { setupStore, type AppStore, type RootState } from './store/store.js';

export function renderWithProviders(
  ui: ReactElement | null,
  options?: RenderOptions & { initialRoute?: string; preloadedState?: Partial<RootState>; store?: AppStore },
) {
  const { initialRoute = '/', preloadedState, store = setupStore(preloadedState), ...renderOptions } = options ?? {};
  const history = createMemoryHistory({ initialEntries: [initialRoute] });
  const router = createRouter({ routeTree, history });

  function Wrapper({ children }: { children: ReactNode }) {
    return <Provider store={store}>{children}</Provider>;
  }

  if (ui == null) {
    return {
      store,
      ...render(<RouterProvider router={router} />, {
        wrapper: Wrapper,
        ...renderOptions,
      }),
    };
  }

  return {
    store,
    ...render(ui, { wrapper: Wrapper, ...renderOptions }),
  };
}
