"use client";

import { useTeller } from '@/hooks/useTeller';
import { useModalStore } from '@/store/modalStore';
import dynamic from 'next/dynamic';
import { useEffect } from 'react';

const UserTable = dynamic(() =>
  import('@/components/data-display/userTable'),
  {
    ssr: false,  
});
const FETCH_MODAL_DELAY = 100;

export default function Users(){

  const { tellers, isLoading, error, refresh } = useTeller();
  const { openModal, closeModal } = useModalStore();
  
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

  return (
    <UserTable 
      users={tellers ?? []} 
      isLoading={isLoading}
      error={error}      
      refresh={refresh}  
    />
  )
}