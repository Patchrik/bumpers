import { configureStore } from '@reduxjs/toolkit';
import { api } from './services/api.js';
import type { CounterState } from './slices/counterSlice.js';
import { counterReducer } from './slices/counterSlice.js';

export type RootState = {
  api: ReturnType<typeof api.reducer>;
  counter: CounterState;
};

export const setupStore = (preloadedState?: Partial<RootState>) =>
  configureStore({
    reducer: {
      [api.reducerPath]: api.reducer,
      counter: counterReducer,
    },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(api.middleware),
    preloadedState,
  });

export const store = setupStore();

export type AppStore = ReturnType<typeof setupStore>;
export type AppDispatch = AppStore['dispatch'];
