import useSWR from 'swr';
import { getter } from '@/lib/getter';
import { Sales } from '@/data/table.data';
import useBusiness from '@/lib/stores/useBusiness';

export const useSales = () => {
  const { bizId } = useBusiness();
  const API = process.env.NEXT_PUBLIC_API_URL;

  // Only run SWR when businessId is defined
  const shouldFetch = bizId ? `${API}/checkout/${bizId}` : null;

  const { data, error, isLoading, mutate } = useSWR<Sales[]>(shouldFetch, getter);

  const refresh = () => mutate();

  return {
    items: data,
    error,
    isLoading,
    refresh,
  };
};

export default useSales;
