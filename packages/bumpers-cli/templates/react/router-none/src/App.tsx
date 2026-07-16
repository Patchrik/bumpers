import Counter from './Components/Counter/Counter.js';

export default function App() {
  return (
    <main className="p-4">
      <h1 data-testid="{{reactHeadingTestId}}" className="mb-4 text-2xl font-bold">
        {'{{projectName}}'}
      </h1>
      <p className="mb-4">Built with React + Vite + TypeScript</p>
      <Counter />
    </main>
  );
}
