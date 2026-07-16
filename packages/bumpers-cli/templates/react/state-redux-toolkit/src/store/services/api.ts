import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const api = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({ baseUrl: '/api' }),
  endpoints: (builder) => ({
    healthcheck: builder.query<{ status: string }, void>({
      query: () => '/health',
    }),
  }),
});

export const { useHealthcheckQuery } = api;
