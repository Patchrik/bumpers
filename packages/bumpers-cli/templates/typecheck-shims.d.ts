import type { AnyRoute } from '@tanstack/react-router';

declare module '@tanstack/router-core' {
  interface FileRoutesByPath {
    '/': {
      parentRoute: AnyRoute;
      id: '/';
      path: '/';
      fullPath: '/';
    };
    '/about': {
      parentRoute: AnyRoute;
      id: '/about';
      path: '/about';
      fullPath: '/about';
    };
  }
}
