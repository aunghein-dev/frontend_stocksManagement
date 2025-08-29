import useSWR from 'swr';
import { getter } from '@/lib/getter';
import useBusiness from '@/lib/stores/useBusiness';
import { Stock, StockItem } from '@/types/stock.types';

export const useStocks = () => {
  const { bizId } = useBusiness();
  const API = process.env.NEXT_PUBLIC_API_URL;

  const shouldFetch = bizId ? `${API}/stkG/biz/${bizId}` : null;

  const { data, error, isLoading, mutate } = useSWR(shouldFetch, getter);

  // ✅ Optimistic refresh
  const refresh = () => mutate();

  // ✅ Optimistic delete (update cache instantly)
  const removeStockItem = (groupId: number, itemId: number) => {
    mutate(
      (current: Stock[]) =>
        current
          ? current.map((stock: Stock) =>
              stock.groupId === groupId
                ? {
                    ...stock,
                    items: stock.items.filter((item: StockItem) => item.itemId !== itemId),
                  }
                : stock
            )
          : current,
      false // don’t revalidate immediately
    );
  };

  return {
    items: data,
    error,
    isLoading,
    refresh,
    removeStockItem,
  };
};

export const useFilteredStocks = () => {
  const { bizId } = useBusiness();
  const API = process.env.NEXT_PUBLIC_API_URL;

  // Only run SWR when businessId is available
  const shouldFetch = bizId ? `${API}/stkG/biz/nonZero/${bizId}` : null;

  const { data, error, isLoading, mutate } = useSWR(shouldFetch, getter);

  const refresh = () => mutate(true); // manually trigger refresh

  return {
    items: data,
    error,
    isLoading,
    refresh,
  };
};
