// In your hooks/useInfo.ts
import useSWR from 'swr';
import { getter } from '@/lib/getter';
import { useMemo } from 'react'; // <--- Import useMemo

export const useInfo = () => {
  const API = process.env.NEXT_PUBLIC_API_URL;

  const { data, error, isLoading, mutate } = useSWR(
    `${API}/info/me`,
    getter
  );

  // Memoize the returned object to ensure reference stability
  const result = useMemo(() => ({
    business: data,
    error,
    isLoading,
    refresh: mutate, // mutate function reference is stable from useSWR
  }), [data, error, isLoading, mutate]); // Dependencies for the memoized object

  return result;
};