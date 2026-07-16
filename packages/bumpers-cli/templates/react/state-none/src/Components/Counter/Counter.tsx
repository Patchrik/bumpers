import { useState } from 'react';

export default function Counter() {
  const [count, setCount] = useState(0);

  return (
    <div className="flex items-center gap-4">
      <button onClick={() => setCount((value) => value - 1)} className="rounded border px-3 py-1">
        -
      </button>
      <span data-testid="{{reactCounterTestId}}" className="text-xl font-mono">
        {count}
      </span>
      <button
        onClick={() => setCount((value) => value + 1)}
        data-testid="{{reactCounterIncrementTestId}}"
        className="rounded border px-3 py-1"
      >
        +
      </button>
      <button onClick={() => setCount(0)} className="rounded border px-3 py-1 text-sm">
        Reset
      </button>
    </div>
  );
}
