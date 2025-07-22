import useSWR from 'swr';
import { getter } from '@/lib/getter';

export const useUser = () => {
  const API = process.env.NEXT_PUBLIC_API_URL;

  const { data, error, isLoading, mutate } = useSWR(
    `${API}/info/me/account`,
    getter
  );

  return {
    data,
    error,
    isLoading,
    refresh: mutate,
  };
};
