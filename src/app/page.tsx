"use client";

import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import PaginationComponent from "@/components/data-display/atoms/pagination";
import Search from "@/components/form/search";
import Image from "next/image";
import { useModalStore } from "@/store/modalStore";
import { useFilteredStocks } from "@/hooks/useStocks";
import type { Stock } from "@/types/stock.types";
import { useTranslation } from "@/hooks/useTranslation";
import { useCartStore } from "@/lib/stores/useCartStore"; 
import BarcodeManualScanner from "@/components/ui/modals/BarcodeManualScanner"; 
import ProductCard from "@/components/card/ProductCard";
import ScanBarcodeButton from "@/components/ui/atoms/ScanBarcodeButton";
import BarcodeErrorAlert from "@/components/ui/modals/BarcodeErrorAlert";
import { LoadingSpinner } from "@/components/ui/molecules/LoadingSpinner";


const ITEMS_PER_PAGE = 24;
const BARCODE_SCAN_DEBOUNCE_MS = 50; 

export default function Home() {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const { items, isLoading } = useFilteredStocks();
  const { openModal, closeModal } = useModalStore();
  const { t } = useTranslation();

  const [openManualScanner, setOpenManualScanner] = useState(false);
  const [manualBarcodeInput, setManualBarcodeInput] = useState("");
  const addItemByBarcodeAction = useCartStore(state => state.addItemByBarcode);

  const [loadingBarcode, setLoadingBarcode] = useState(false);
  const [barcodeScanError, setBarcodeScanError] = useState<string | null>(null);
  const barcodeBuffer = useRef<string>("");
  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);
  const manualInputRef = useRef<HTMLInputElement>(null);


  const handleOpenScanner = () => {
    setOpenManualScanner(true);
    setTimeout(() => {
      manualInputRef.current?.focus();
    }, 0);
  };

  const handleManualBarcodeSubmit = (e: React.FormEvent) => {
    e.preventDefault(); // Prevent page reload
    if (manualBarcodeInput.trim()) {
      handleBarcodeDetected(manualBarcodeInput.trim());
      setManualBarcodeInput(""); 
      setOpenManualScanner(false); 
    }
  };

  useEffect(() => {
    if (isLoading || loadingBarcode) {
      openModal("loading");
    } else {
      closeModal();
    }
  }, [isLoading, loadingBarcode, openModal, closeModal]);


  const handleBarcodeDetected = useCallback(async (barcode: string) => {
    console.log("Barcode detected:", barcode);
    setLoadingBarcode(true);
    setBarcodeScanError(null); 

    if (!items || items.length === 0) {
      setBarcodeScanError("Product data not loaded yet. Cannot process barcode.");
      setLoadingBarcode(false);
      return;
    }

    try {
      const addedSuccessfully = addItemByBarcodeAction(barcode, items);
      if (addedSuccessfully) {
        console.log(`Added item for barcode ${barcode} to cart.`);
      } else {
        setBarcodeScanError(`Barcode "${barcode}" not found or item out of stock.`);
      }
    } catch (error: unknown) {
      console.error("Error processing barcode:", error);

        const message = error && typeof error === "object" 
                        && "message" in error 
                        && typeof (error as Record<string, unknown>).message === "string"
          ? (error as { message: string }).message
          : "Unknown error";

      setBarcodeScanError(`An unexpected error occurred: ${message}. Barcode: ${barcode}`);
    } finally {
      setLoadingBarcode(false);
    }
  }, [items, addItemByBarcodeAction]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (openManualScanner) {
        return;
      }

      if (event.key.length === 1 && !event.ctrlKey && !event.altKey && !event.metaKey) {
        barcodeBuffer.current += event.key;
      } else if (event.key === 'Enter') {
        event.preventDefault(); 
        if (barcodeBuffer.current.length > 0) {
          handleBarcodeDetected(barcodeBuffer.current);
          barcodeBuffer.current = ""; 
        }
      }

      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current);
      }
      debounceTimeout.current = setTimeout(() => {
        barcodeBuffer.current = ""; 
        console.log("Barcode buffer cleared due to debounce.");
      }, BARCODE_SCAN_DEBOUNCE_MS);
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current);
      }
    };
  }, [handleBarcodeDetected, openManualScanner]); 


  const filteredStocks = useMemo(() => {
    if (!items) return [];
    if (!searchQuery) return items;

    const lowerCaseSearchQuery = searchQuery.toLowerCase();
    return items.filter((stock: Stock) =>
      stock.groupName.toLowerCase().includes(lowerCaseSearchQuery) ||
      stock.groupId.toString().includes(lowerCaseSearchQuery) ||
      stock.items.some(item =>
        item.itemColorHex.toLowerCase().includes(lowerCaseSearchQuery) ||
        (item.barcodeNo && item.barcodeNo.toLowerCase().includes(lowerCaseSearchQuery))
      )
    );
  }, [items, searchQuery]);

  const totalPages = Math.ceil(filteredStocks.length / ITEMS_PER_PAGE);
  const currentItems = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredStocks.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredStocks, currentPage]);

  const handleSearch = (value: string) => {
    setCurrentPage(1);
    setSearchQuery(value);
  };

  return (
    <section className="h-full -mt-1">

      {/* Top bar */}
      <div className="flex items-center mb-3 min-w-0 gap-2 justify-between py-1.5 px-[0.1rem]">
        <Search
          placeholder={t("searchPlaceholderProd")}
          onChange={handleSearch}
          value={searchQuery}
        />
        <PaginationComponent
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </div>

      {/* Loading Spinner */}
      {(isLoading || loadingBarcode) && (
        <LoadingSpinner />
      )}

      {/* Error message from barcode scan */}
      {barcodeScanError && (
        <BarcodeErrorAlert 
          barcodeScanError={barcodeScanError}
          setBarcodeScanError={setBarcodeScanError}
          t={t}
        />
      )}
        


      {/* No Results */}
      {!isLoading && !loadingBarcode && currentItems.length === 0 && (
        <div
          className="w-full flex flex-col items-center justify-center py-2"
          style={{ height: "calc(100dvh - 188px)" }}
        >
          <div className="relative w-[300px] h-[300px] flex flex-col justify-end items-center">
            <Image
              src="/noitemsfound.svg"
              alt="No Items Found"
              fill
              priority
              className="object-contain"
            />
            <p className="text-gray-500 text-md font-bold absolute bottom-7 animate-pulse">
              {t("noItemsFound")}
            </p>
          </div>
        </div>
      )}

      {/* Product Grid */}
      {!isLoading && !loadingBarcode && currentItems.length > 0 && (
        <div className="rounded-xs bg-white py-2">
          <div
            className="flex-1 overflow-y-auto custom-scrollbar"
            style={{ height: "calc(100dvh - 188px)" }}
          >
            <div className="grid 
                            grid-cols-2
                            min-[580px]:grid-cols-3
                            min-[640px]:grid-cols-2
                            min-[720px]:grid-cols-2
                            min-[770px]:grid-cols-3
                            min-[960px]:grid-cols-4
                            min-[1180px]:grid-cols-5
                            min-[1370px]:grid-cols-6
                            min-[1900px]:grid-cols-7
                            gap-x-2 gap-y-2 px-2">
              {currentItems.map((stock: Stock) => (
                <ProductCard key={stock.groupId} {...stock} />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Manual Barcode Scanner Modal */}
      {openManualScanner && (
        <BarcodeManualScanner
          setOpenManualScanner={setOpenManualScanner}
          setManualBarcodeInput={setManualBarcodeInput}
          setBarcodeScanError={setBarcodeScanError}
          manualBarcodeInput={manualBarcodeInput}
          manualInputRef={manualInputRef}
          handleManualBarcodeSubmit={handleManualBarcodeSubmit}
          t={t}
        />
      )}


       {/* Fixed Scan Barcode Button */}
       <div className="fixed right-0 top-1/2 -translate-y-1/2 transform flex flex-col gap-2 p-2 bg-white shadow-xl border border-gray-200 rounded-l-full z-40">
            <ScanBarcodeButton handleOpenScanner={handleOpenScanner} t={t} />
        </div>

    </section>
  );
}