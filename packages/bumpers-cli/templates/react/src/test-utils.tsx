import { render, type RenderOptions } from '@testing-library/react';
import type { ReactElement, ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createMemoryHistory, createRouter, RouterProvider } from '@tanstack/react-router';
import { routeTree } from './routeTree.gen';

export function renderWithProviders(
  ui: ReactElement | null,
  options?: RenderOptions & { initialRoute?: string },
) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
  const { initialRoute = '/', ...renderOptions } = options ?? {};
  const history = createMemoryHistory({ initialEntries: [initialRoute] });
  const router = createRouter({ routeTree, history });

  function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  }

  if (ui == null) {
    return render(<RouterProvider router={router} />, {
      wrapper: Wrapper,
      ...renderOptions,
    });
  }

  return render(ui, { wrapper: Wrapper, ...renderOptions });
}
