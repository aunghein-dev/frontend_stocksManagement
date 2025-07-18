"use client";


import dynamic from 'next/dynamic';
import { useReports } from '@/hooks/useReports';
import { useModalStore } from "@/store/modalStore"; 
import { useEffect } from 'react';
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
      <div className='flex justify-center items-center min-h-[calc(100dvh-169px)] p-4'>
        <p className="text-red-600 text-lg font-medium text-center p-6 rounded-lg bg-red-50 shadow-md">
          Error loading sales data: {error.message || "An unknown error occurred."}
          <button onClick={refresh} className="mt-4 px-4 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors">
            Retry
          </button>
        </p>
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