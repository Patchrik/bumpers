import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/about')({
  component: AboutPage,
});

function AboutPage() {
  return (
    <div>
      <h1 className="mb-4 text-2xl font-bold">About</h1>
      <p>Scaffolded with Bumpers — testing guardrails baked in.</p>
    </div>
  );
}
