import Counter from './Components/Counter/Counter.js';

export default function App() {
  return (
    <div>
      <h1 data-testid="{{reactHeadingTestId}}" className="mb-4 text-2xl font-bold">
        {'{{projectName}}'}
      </h1>
      <p className="mb-4">Built with React + Vite + TypeScript</p>
      <Counter />
    </div>
  );
}
