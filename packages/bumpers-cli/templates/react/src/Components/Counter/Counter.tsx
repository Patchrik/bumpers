import { useCounterStore } from '../../store/counter.js';

export default function Counter() {
  const { count, increment, decrement, reset } = useCounterStore();

  return (
    <div className="flex items-center gap-4">
      <button onClick={decrement} className="rounded border px-3 py-1">
        -
      </button>
      <span data-testid="{{reactCounterTestId}}" className="text-xl font-mono">
        {count}
      </span>
      <button
        onClick={increment}
        data-testid="{{reactCounterIncrementTestId}}"
        className="rounded border px-3 py-1"
      >
        +
      </button>
      <button onClick={reset} className="rounded border px-3 py-1 text-sm">
        Reset
      </button>
    </div>
  );
}
