import { decrement, increment, reset } from '../../store/slices/counterSlice.js';
import { useAppDispatch, useAppSelector } from '../../store/hooks.js';

export default function Counter() {
  const count = useAppSelector((state) => state.counter.count);
  const dispatch = useAppDispatch();

  return (
    <div className="flex items-center gap-4">
      <button onClick={() => dispatch(decrement())} className="rounded border px-3 py-1">
        -
      </button>
      <span data-testid="{{reactCounterTestId}}" className="text-xl font-mono">
        {count}
      </span>
      <button
        onClick={() => dispatch(increment())}
        data-testid="{{reactCounterIncrementTestId}}"
        className="rounded border px-3 py-1"
      >
        +
      </button>
      <button onClick={() => dispatch(reset())} className="rounded border px-3 py-1 text-sm">
        Reset
      </button>
    </div>
  );
}
