"use client";

import dynamic from 'next/dynamic';
import { useStocks } from '@/hooks/useStocks';
import { useModalStore } from "@/store/modalStore"; 
import { useEffect } from 'react';
import PageLost404 from '@/components/error/pageLost404';
import { useTranslation } from '@/hooks/useTranslation';
// No need for useEffect and useState for the local 'loading' state anymore

// Dynamic import for StockTable
// We leverage the 'loading' option to show a spinner *while the StockTable component's
// JavaScript bundle is being fetched and parsed*.
const StockTable = dynamic(() =>
  import('@/components/data-display/stockTable'),
  {
    ssr: false, // Ensure this component is only rendered on the client side
  });

export default function Stocks() {
  // Destructure the necessary values from the useStocks hook
  const { items, isLoading, error, refresh } = useStocks();
  const { openModal, closeModal } = useModalStore();
  const {t} = useTranslation(); 

  // This useEffect controls the modal's open/close state
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    if (isLoading) {
      // Open the loading modal immediately when loading starts
      openModal("loading");
    } else {
      // Close the modal after a short delay when loading finishes
      // This prevents flickering if the load is very fast
      timer = setTimeout(() => {
        closeModal();
      }, 100); // FETCH_MODAL_DELAY = 100ms
    }

    // Cleanup function to clear the timer if the component unmounts
    return () => {
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [isLoading, openModal, closeModal]); // Dependencies


 
  if (error) {
    return (
     <div className="flex flex-col items-center justify-center h-[calc(100dvh-108px)] text-red-600">
        <PageLost404 
        header={t("msg_wrong")}
        message={error.message}
        reload={() => window.location.reload()}
        />
      </div>
    );
  }

  return (
    <section className="h-full">
      
      <StockTable
        items={items ?? []} // Provide a default empty array if items is null/undefined
        isLoading={isLoading} // Pass the data loading state
        error={error}       // Pass any data fetching error
        refresh={refresh}   // Pass the refresh function
      />
      
    </section>
  );
}