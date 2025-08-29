"use client";

import dynamic from "next/dynamic";
import { useEffect } from "react"; // Import useEffect
import { useSales } from "@/hooks/useSales";
import { useModalStore } from "@/store/modalStore"; // Import useModalStore
import PageLost404 from "@/components/error/pageLost404";
import { useTranslation } from "@/hooks/useTranslation";

// Constants for modal messages and delay
const FETCH_MODAL_DELAY = 1; // Small delay to prevent modal flickering on very fast fetches

// Dynamic import for SalesTable
const SalesTable = dynamic(() => import('@/components/data-display/salesTable'), {
  // We can remove the custom loading component here since the full-page modal
  // will handle the loading indication for the data fetching.
  // If you still want a subtle placeholder while the component's JS loads,
  // you can keep a simpler div. For a truly unified experience, the modal is enough.
  ssr: false, // Ensure this component is only rendered on the client side
});

export default function Sales() {
  const { items: sales, isLoading, error, refresh } = useSales();
  const { openModal, closeModal } = useModalStore(); // Get modal controls
  const {t} = useTranslation();

  // --- Unified Modal Control ---
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;

    if (isLoading) {
      // Open the loading modal when data fetching starts
      // You can pass a message if  LoadingModal supports it,
      // otherwise, it will just show its default loading state.
      openModal("loading");
    } else {
      // Close the modal after a slight delay when loading finishes,
      // to prevent flickering on very fast data fetches.
      timer = setTimeout(() => {
        closeModal();
      }, FETCH_MODAL_DELAY);
    }

    // Cleanup function: clear the timer if the component unmounts
    // or if isLoading changes before the timeout completes.
    return () => {
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [isLoading, openModal, closeModal]); // Dependencies for the effect

  // --- Render Logic ---
  // If there's an error, display it clearly. The modal should already be closed by the useEffect.
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

  
  // The SalesTable component itself will handle displaying data or internal loading skeletons
  // based on its `isLoading` prop, *after* the global modal has closed.
  return (
    <section className="h-full">
      <SalesTable
        sales={sales ?? []} // Ensure sales is always an array
        isLoading={isLoading} // Pass isLoading to SalesTable for its internal state
        error={error} // Pass error to SalesTable if it needs to handle errors internally
        refresh={refresh} // Pass refresh for internal retry mechanisms if any
      />
    </section>
  );
}