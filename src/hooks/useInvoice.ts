import useSWR from 'swr';
import { getter } from '@/lib/getter';
import { useInfo } from '@/hooks/useInfo'; 

export const useInvoice = () => {
  const { business } = useInfo(); 
  const API = process.env.NEXT_PUBLIC_API_URL;

  const shouldFetch = (API && business?.businessId)
    ? `${API}/admin/invoices/13`
    : null;

  const { data, error, isLoading, mutate } = useSWR(shouldFetch, getter);

  const refresh = () => mutate(true);

  return {
    invoices: data,
    error,
    isLoading,
    refresh,
  };
};

