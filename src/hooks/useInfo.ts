// In hooks/useInfo.ts
import useSWR from 'swr';
import { getter } from '@/lib/getter';
import { useMemo } from 'react'; 

export const useInfo = () => {
  const API = process.env.NEXT_PUBLIC_API_URL;

  // useSWR provides reference-stable `mutate` itself
  const { data, error, isLoading, mutate } = useSWR(
    `${API}/info/me`,
    getter
  );

  // Memoize the returned object to ensure reference stability
  // The dependencies are correctly specified: `data`, `error`, `isLoading`, `mutate`.
  // `mutate` is typically stable from `useSWR`, but including it is harmless
  // and good practice if there's any doubt, or for linters.
  const result = useMemo(() => ({
    business: data,     // This `data` is the business info from /info/me
    error,
    isLoading,
    refresh: mutate,
  }), [data, error, isLoading, mutate]);

  return result;
};