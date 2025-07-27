import useSWR from 'swr';
import { getter } from '@/lib/getter';
import { useInfo } from '@/hooks/useInfo'; 

export const useBilling = () => {
  const { business } = useInfo(); // Get the business object from your hook
  const API = process.env.NEXT_PUBLIC_API_URL;

  // Construct the URL dynamically using business.businessId
  // Only fetch if API and business.businessId are available
  const shouldFetch = (API && business?.businessId)
    ? `${API}/billing/biz/13`
    : null;

  const { data, error, isLoading, mutate } = useSWR(shouldFetch, getter);

  const refresh = () => mutate(true); // manually trigger refresh

  return {
    billing: data,
    error,
    isLoading,
    refresh,
  };
};

