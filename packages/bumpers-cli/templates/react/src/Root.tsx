import type { AnyRouter } from '@tanstack/react-router';
import { RouterProvider } from '@tanstack/react-router';

type RootProps = {
  router: AnyRouter;
};

export default function Root({ router }: RootProps) {
  return <RouterProvider router={router} />;
}
