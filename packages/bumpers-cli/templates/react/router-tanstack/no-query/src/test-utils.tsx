import { render, type RenderOptions } from '@testing-library/react';
import type { ReactElement, ReactNode } from 'react';
import { createMemoryHistory, createRouter, RouterProvider } from '@tanstack/react-router';
import { routeTree } from './routeTree.gen';

export function renderWithProviders(
  ui: ReactElement | null,
  options?: RenderOptions & { initialRoute?: string },
) {
  const { initialRoute = '/', ...renderOptions } = options ?? {};
  const history = createMemoryHistory({ initialEntries: [initialRoute] });
  const router = createRouter({ routeTree, history });

  function Wrapper({ children }: { children: ReactNode }) {
    return <>{children}</>;
  }

  if (ui == null) {
    return render(<RouterProvider router={router} />, {
      wrapper: Wrapper,
      ...renderOptions,
    });
  }

  return render(ui, { wrapper: Wrapper, ...renderOptions });
}
