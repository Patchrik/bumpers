import { render, type RenderOptions } from '@testing-library/react';
import type { ReactElement, ReactNode } from 'react';
import { MemoryRouter } from 'react-router';

export function renderWithProviders(
  ui: ReactElement,
  options?: RenderOptions & { initialRoute?: string },
) {
  const { initialRoute = '/', ...renderOptions } = options ?? {};

  function Wrapper({ children }: { children: ReactNode }) {
    return <MemoryRouter initialEntries={[initialRoute]}>{children}</MemoryRouter>;
  }

  return render(ui, { wrapper: Wrapper, ...renderOptions });
}
