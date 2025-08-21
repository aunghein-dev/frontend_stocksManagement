import useSWR from 'swr';
import { getter } from '@/lib/getter';
import useBusiness from '@/lib/stores/useBusiness';

export const useStocks = () => {
  const { bizId } = useBusiness();
  const API = process.env.NEXT_PUBLIC_API_URL;

  // Only run SWR when businessId is available
  const shouldFetch = bizId ? `${API}/stkG/biz/${bizId}` : null;

  const { data, error, isLoading, mutate } = useSWR(shouldFetch, getter);

  const refresh = () => mutate(true); // manually trigger refresh

  return {
    items: data,
    error,
    isLoading,
    refresh,
  };
};


export const useFilteredStocks = () => {
  const { bizId } = useBusiness();
  const API = process.env.NEXT_PUBLIC_API_URL;

  // Only run SWR when businessId is available
  const shouldFetch = bizId ? `${API}/stkG/biz/nonZero/${bizId}` : null;

  const { data, error, isLoading, mutate } = useSWR(shouldFetch, getter);

  const refresh = () => mutate(true); // manually trigger refresh

  return {
    items: data,
    error,
    isLoading,
    refresh,
  };
};
