import { render, type RenderOptions } from '@testing-library/react';
import type { ReactElement, ReactNode } from 'react';
import { Provider } from 'react-redux';
import { Router } from 'wouter';
import { memoryLocation } from 'wouter/memory-location';
import { setupStore, type AppStore, type RootState } from './store/store.js';

export function renderWithProviders(
  ui: ReactElement,
  options?: RenderOptions & { initialRoute?: string; preloadedState?: Partial<RootState>; store?: AppStore },
) {
  const { initialRoute = '/', preloadedState, store = setupStore(preloadedState), ...renderOptions } = options ?? {};
  const memory = memoryLocation({ path: initialRoute });

  function Wrapper({ children }: { children: ReactNode }) {
    return (
      <Provider store={store}>
        <Router hook={memory.hook}>{children}</Router>
      </Provider>
    );
  }

  return {
    store,
    ...render(ui, { wrapper: Wrapper, ...renderOptions }),
  };
}
