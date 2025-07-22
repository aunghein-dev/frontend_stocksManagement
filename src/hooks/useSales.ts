import useSWR from 'swr';
import { getter } from '@/lib/getter';
import { Sales } from '@/data/table.data';
import { useInfo } from '@/hooks/useInfo';

export const useSales = () => {
  const { business } = useInfo();
  const API = process.env.NEXT_PUBLIC_API_URL;

  // Only run SWR when businessId is defined
  const shouldFetch = business?.businessId ? `${API}/checkout/${business.businessId}` : null;

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
