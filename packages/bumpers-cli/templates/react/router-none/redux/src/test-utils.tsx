import { render, type RenderOptions } from '@testing-library/react';
import type { ReactElement, ReactNode } from 'react';
import { Provider } from 'react-redux';
import { setupStore, type AppStore, type RootState } from './store/store.js';

export function renderWithProviders(
  ui: ReactElement,
  options?: RenderOptions & { preloadedState?: Partial<RootState>; store?: AppStore },
) {
  const { preloadedState, store = setupStore(preloadedState), ...renderOptions } = options ?? {};

  function Wrapper({ children }: { children: ReactNode }) {
    return <Provider store={store}>{children}</Provider>;
  }

  return {
    store,
    ...render(ui, { wrapper: Wrapper, ...renderOptions }),
  };
}
