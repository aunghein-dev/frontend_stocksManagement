import useSWR from 'swr';
import { getter } from '@/lib/getter';
import useBusiness from '@/lib/stores/useBusiness';

export const useReports = () => {
  const { bizId } = useBusiness();
  const API = process.env.NEXT_PUBLIC_API_URL;

  // Only fetch when businessId is available
  const shouldFetch = bizId ? `${API}/batch/${bizId}` : null;

  const { data, error, isLoading, mutate } = useSWR(shouldFetch, getter);

  const refresh = () => mutate(); // manually trigger refresh

  return {
    items: data,
    error,
    isLoading,
    refresh,
  };
};
