import useSWR from 'swr';
import { getter } from '@/lib/getter';
import useBusiness from '@/lib/stores/useBusiness';

export const useCustomer = () => {
  const { bizId } = useBusiness();
  const API = process.env.NEXT_PUBLIC_API_URL;

  // Only fetch when businessId is available
  const shouldFetch = bizId ? `${API}/customer/biz/${bizId}` : null;

  const { data, error, isLoading, mutate } = useSWR(shouldFetch, getter);

  const refresh = () => mutate(); // manually trigger refresh

  return {
    customers: data,
    error,
    isLoading,
    refresh,
  };
};
