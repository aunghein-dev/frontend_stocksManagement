import useSWR from 'swr';
import { getter } from '@/lib/getter';
import { useInfo } from '@/hooks/useInfo';

export const useStocks = () => {
  const { business } = useInfo();
  const API = process.env.NEXT_PUBLIC_API_URL;

  // Only run SWR when businessId is available
  const shouldFetch = business?.businessId ? `${API}/stkG/biz/${business.businessId}` : null;

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
  const { business } = useInfo();
  const API = process.env.NEXT_PUBLIC_API_URL;

  // Only run SWR when businessId is available
  const shouldFetch = business?.businessId ? `${API}/stkG/biz/nonZero/${business.businessId}` : null;

  const { data, error, isLoading, mutate } = useSWR(shouldFetch, getter);

  const refresh = () => mutate(); // manually trigger refresh

  return {
    items: data,
    error,
    isLoading,
    refresh,
  };
};
