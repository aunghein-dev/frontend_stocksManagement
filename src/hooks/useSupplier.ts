import useSWR from 'swr';
import { getter } from '@/lib/getter';
import useBusiness from '@/lib/stores/useBusiness';

export const useSupplier = () => {
  const { bizId } = useBusiness();
  const API = process.env.NEXT_PUBLIC_API_URL;

  // Only fetch when businessId is available
  const shouldFetch = bizId ? `${API}/supplier/biz/${bizId}` : null;

  const { data, error, isLoading, mutate } = useSWR(shouldFetch, getter);

  const refresh = () => mutate(); // manually trigger refresh

  return {
    suppliers: data,
    error,
    isLoading,
    refresh,
  };
};
