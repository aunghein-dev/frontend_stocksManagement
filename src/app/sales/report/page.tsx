"use client";


import dynamic from 'next/dynamic';
import { useReports } from '@/hooks/useReports';
import { useModalStore } from "@/store/modalStore"; 
import { useEffect } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import PageLost404 from '@/components/error/pageLost404';
// Dynamic import for BatchReportTable
// Use the 'loading' option to display a spinner while the component's JS bundle loads.
const BatchReportTable = dynamic(() =>
  import('@/components/data-display/batchReportTable'),
  {
    ssr: false, // Ensure this component is only rendered on the client side
  }
);

export default function Report() {
  // Destructure states and functions from the useReports hook
  const { items, isLoading, error, refresh } = useReports();
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
     
      <BatchReportTable
        items={items ?? []} // Ensure items is always an array to prevent errors
        isLoading={isLoading} // Pass the data loading state to the table component
        error={error}       // Pass any data fetching errors
        refresh={refresh}   // Pass the refresh function
        
      />
    </section>
  );
}