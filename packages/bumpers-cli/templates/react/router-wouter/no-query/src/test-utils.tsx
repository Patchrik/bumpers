import { render, type RenderOptions } from '@testing-library/react';
import type { ReactElement, ReactNode } from 'react';
import { Router } from 'wouter';
import { memoryLocation } from 'wouter/memory-location';

export function renderWithProviders(
  ui: ReactElement,
  options?: RenderOptions & { initialRoute?: string },
) {
  const { initialRoute = '/', ...renderOptions } = options ?? {};
  const memory = memoryLocation({ path: initialRoute });

  function Wrapper({ children }: { children: ReactNode }) {
    return <Router hook={memory.hook}>{children}</Router>;
  }

  return render(ui, { wrapper: Wrapper, ...renderOptions });
}
