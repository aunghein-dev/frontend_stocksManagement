// hooks/useStocksPage.ts
import useSWR from 'swr';
import { getter } from '@/lib/getter';
import { useInfo } from '@/hooks/useInfo'; // Assuming this hook provides business info

// Interface for the StkItem within StkGroup
interface StkItem {
  itemId: number;
  itemImage: string | null;
  itemColorHex: string;
  itemQuantity: number;
}

// Interface for the StkGroup as received from the backend
interface StkGroup {
  groupId: number;
  groupImage: string;
  groupName: string;
  groupUnitPrice: number;
  releasedDate: string;
  items: StkItem[];
}

// Interface for the paginated response from the backend
interface PagedStkGroupResponse {
  content: StkGroup[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number; // current page number
  // ... other pagination properties
}

export const useStocksPage = (page: number, pageSize: number) => {
  const { business } = useInfo();
  const API = process.env.NEXT_PUBLIC_API_URL;
  const shouldFetch =
    business?.businessId ? `${API}/stkG/biz/${business.businessId}/page?page=${page}&size=${pageSize}` : null;

  const { data, error, isLoading, mutate } = useSWR<PagedStkGroupResponse>(shouldFetch, getter);

  const refresh = () => mutate();
  
  return {
    items: data?.content ?? [], // `content` will be an array of StkGroup
    total: data?.totalElements ?? 0,
    isLoading,
    error,
    refresh,
  };
};