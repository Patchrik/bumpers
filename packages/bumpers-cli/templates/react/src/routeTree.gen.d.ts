import type { AnyRoute } from '@tanstack/react-router';

declare module './routeTree.gen' {
  export const routeTree: AnyRoute;
}
