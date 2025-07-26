"use client";

import dynamic from 'next/dynamic';
import { useStocks } from '@/hooks/useStocks';
import { useModalStore } from "@/store/modalStore"; 
import { useEffect } from 'react';
import PageLost404 from '@/components/error/pageLost404';
import { useTranslation } from '@/hooks/useTranslation';

const StockTable = dynamic(() =>
  import('@/components/data-display/stockTable'),
  {
    ssr: false,  
  });

export default function Stocks() {

  const { items, isLoading, error, refresh } = useStocks();
  const { openModal, closeModal } = useModalStore();
  const {t} = useTranslation(); 


  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    if (isLoading) {
      openModal("loading");
    } else {
      timer = setTimeout(() => {
        closeModal();
      }, 100);
    }

    return () => {
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [isLoading, openModal, closeModal]); 


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
        items={items ?? []} 
        isLoading={isLoading}
        error={error}      
        refresh={refresh}  
      />
      
    </section>
  );
}