import useSWR from 'swr';
import { getter } from '@/lib/getter';
import { useInfo } from '@/hooks/useInfo';

export const useSupplier = () => {
  const { business } = useInfo();
  const API = process.env.NEXT_PUBLIC_API_URL;

  // Only fetch when businessId is available
  const shouldFetch = business?.businessId ? `${API}/supplier/biz/${business.businessId}` : null;

  const { data, error, isLoading, mutate } = useSWR(shouldFetch, getter);

  const refresh = () => mutate(); // manually trigger refresh

  return {
    suppliers: data,
    error,
    isLoading,
    refresh,
  };
};
