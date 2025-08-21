import useSWR from 'swr';
import { getter } from '@/lib/getter';
import useBusiness from '@/lib/stores/useBusiness';

export const useBilling = () => {
  const { bizId } = useBusiness();
  const API = process.env.NEXT_PUBLIC_API_URL;

  const shouldFetch = (API && bizId)
    ? `${API}/billing/biz/${bizId}`
    : null;

  const { data, error, isLoading, mutate } = useSWR(shouldFetch, getter);

  const refresh = () => mutate(true);

  return {
    billing: data,
    error,
    isLoading,
    refresh,
  };
};

