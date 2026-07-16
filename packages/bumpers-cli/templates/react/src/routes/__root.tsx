import { createRootRoute, Link, Outlet } from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools';

function RootLayout() {
  return (
    <>
      <nav className="flex gap-4 border-b p-4">
        <Link to="/" data-testid="{{reactNavHomeTestId}}" className="[&.active]:font-bold">
          Home
        </Link>
        <Link to="/about" data-testid="{{reactNavAboutTestId}}" className="[&.active]:font-bold">
          About
        </Link>
      </nav>
      <main className="p-4">
        <Outlet />
      </main>
      <TanStackRouterDevtools />
    </>
  );
}

export const Route = createRootRoute({
  component: RootLayout,
});
