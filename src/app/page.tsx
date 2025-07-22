"use client";

import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import Product from "@/components/data-display/card";
import PaginationComponent from "@/components/data-display/atoms/pagination";
import Search from "@/components/form/search";
import Image from "next/image";
import { useModalStore } from "@/store/modalStore";
import { useFilteredStocks } from "@/hooks/useStocks";
import type { Stock } from "@/lib/classes/Cart"; // Correctly import Stock type from  Cart file
import { useTranslation } from "@/hooks/useTranslation";
import { useCartStore } from "@/lib/stores/useCartStore"; //  Zustand store
import { ScanBarcode, X as CloseIcon } from "lucide-react"; // Import X as CloseIcon for the modal close button



const ITEMS_PER_PAGE = 24;
const BARCODE_SCAN_DEBOUNCE_MS = 50; // Max time between characters in a barcode scan

export default function Home() {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const { items, isLoading } = useFilteredStocks();
  const { openModal, closeModal } = useModalStore();
  const { t } = useTranslation();

  // State to control visibility of manual barcode scanner modal
  const [openManualScanner, setOpenManualScanner] = useState(false);
  // State to hold manual barcode input value
  const [manualBarcodeInput, setManualBarcodeInput] = useState("");


  // Access the addItemByBarcode action directly from the Zustand store
  const addItemByBarcodeAction = useCartStore(state => state.addItemByBarcode);

  const [loadingBarcode, setLoadingBarcode] = useState(false);
  const [barcodeScanError, setBarcodeScanError] = useState<string | null>(null);

  // State and ref for silent hardware scanning
  const barcodeBuffer = useRef<string>("");
  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);
  // Ref for the manual input field for auto-focus
  const manualInputRef = useRef<HTMLInputElement>(null);


  // Open manual scanner modal and focus the input
  const handleOpenScanner = () => {
    setOpenManualScanner(true);
    // Use a timeout to ensure modal is rendered before focusing
    setTimeout(() => {
      manualInputRef.current?.focus();
    }, 0);
  };

  // Handle manual barcode submission
  const handleManualBarcodeSubmit = (e: React.FormEvent) => {
    e.preventDefault(); // Prevent page reload
    if (manualBarcodeInput.trim()) {
      handleBarcodeDetected(manualBarcodeInput.trim());
      setManualBarcodeInput(""); // Clear input after submission
      setOpenManualScanner(false); // Close the manual scanner modal
    }
  };

  // Show modal loading when fetching initial data or processing barcode
  useEffect(() => {
    if (isLoading || loadingBarcode) {
      openModal("loading");
    } else {
      closeModal();
    }
  }, [isLoading, loadingBarcode, openModal, closeModal]);

  // Barcode detection and adding to cart logic
  const handleBarcodeDetected = useCallback(async (barcode: string) => {
    console.log("Barcode detected:", barcode);
    setLoadingBarcode(true);
    setBarcodeScanError(null); // Clear previous errors

    if (!items || items.length === 0) {
      setBarcodeScanError("Product data not loaded yet. Cannot process barcode.");
      setLoadingBarcode(false);
      return;
    }

    try {
      const addedSuccessfully = addItemByBarcodeAction(barcode, items);

      if (addedSuccessfully) {
        console.log(`Added item for barcode ${barcode} to cart.`);
        // Optionally show a temporary success toast/notification
      } else {
        setBarcodeScanError(`Barcode "${barcode}" not found or item out of stock.`);
      }
    } catch (error: unknown) {
      console.error("Error processing barcode:", error);

      const message =
        error && typeof error === "object" && "message" in error && typeof (error as Record<string, unknown>).message === "string"
          ? (error as { message: string }).message
          : "Unknown error";

      setBarcodeScanError(`An unexpected error occurred: ${message}. Barcode: ${barcode}`);

    } finally {
      setLoadingBarcode(false);
    }
  }, [items, addItemByBarcodeAction]);

  // Global keyboard listener for hardware scanner (only active when manual scanner is closed)
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // If manual scanner is open, let its input handle key presses
      if (openManualScanner) {
        return;
      }

      if (event.key.length === 1 && !event.ctrlKey && !event.altKey && !event.metaKey) {
        barcodeBuffer.current += event.key;
      } else if (event.key === 'Enter') {
        event.preventDefault(); // Prevent default behavior like form submission
        if (barcodeBuffer.current.length > 0) {
          handleBarcodeDetected(barcodeBuffer.current);
          barcodeBuffer.current = ""; // Clear buffer after processing
        }
      }

      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current);
      }
      debounceTimeout.current = setTimeout(() => {
        barcodeBuffer.current = ""; // Clear buffer if no key pressed for a while
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
  }, [handleBarcodeDetected, openManualScanner]); // openManualScanner is now a dependency

  // Filter stocks using search query (including barcode search)
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
    <section className="h-full">

      {/* Top bar */}
      <div className="flex items-center mb-3 min-w-0 gap-2 justify-between">
        
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
        <div
          className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-transparent bg-opacity-50 z-50"
        >
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* Error message from barcode scan */}
      {barcodeScanError && (
        <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-red-600 px-4 py-3 flex items-center justify-center bg-opacity-50 z-50 bg-red-100 border-[0.5px] border-red-400 rounded-md" role="alert">
          <strong className="font-bold">{t("error")}! </strong>
          <span className="block sm:inline mr-20">{barcodeScanError}</span>
          <span className="absolute -right-2 top-0 bottom-0 px-4 py-3">
            <svg onClick={() => setBarcodeScanError(null)} className="fill-current h-6 w-6 text-red-500" role="button" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><title>{t("close")}</title><path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.697l-2.651 2.652a1.2 1.2 0 1 1-1.697-1.697L8.303 10 5.651 7.348a1.2 1.2 0 1 1 1.697-1.697L10 8.303l2.651-2.652a1.2 1.2 0 1 1 1.697 1.697L11.697 10l2.651 2.651a1.2 1.2 0 0 1 0 1.698z"/></svg>
          </span>
        </div>
      )}

      {/* No Results */}
      {!isLoading && !loadingBarcode && currentItems.length === 0 && (
        <div
          className="w-full flex flex-col items-center justify-center py-2"
          style={{ height: "calc(100dvh - 150px)" }}
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
        <div className="rounded-sm bg-white py-2">
          <div
            className="flex-1 overflow-y-auto custom-scrollbar"
            style={{ height: "calc(100dvh - 180px)" }}
          >
            <div className="grid 
                            grid-cols-1 
                            min-[475px]:grid-cols-2
                            min-[600px]:grid-cols-2
                            min-[640px]:grid-cols-1
                            min-[720px]:grid-cols-2
                            min-[940px]:grid-cols-3
                            min-[1200px]:grid-cols-4
                            min-[1480px]:grid-cols-5
                            min-[1800px]:grid-cols-6
                            min-[1900px]:grid-cols-7
                            gap-x-2 gap-y-3 px-2">
              {currentItems.map((stock: Stock) => (
                <Product key={stock.groupId} {...stock} />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Manual Barcode Scanner Modal */}
      {openManualScanner && (
        <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center z-90">
          <div className="relative flex flex-col gap-4 p-6 bg-white shadow-xl border border-gray-200 rounded-lg max-w-sm w-full">
            <h3 className="text-lg font-semibold">{t("lbl_manualBarcodeEntry")}</h3>
            <button
              onClick={() => {
                setOpenManualScanner(false);
                setManualBarcodeInput(""); // Clear input on close
                setBarcodeScanError(null); // Clear any error
              }}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
            >
              <CloseIcon className="w-6 h-6" />
            </button>
            <form onSubmit={handleManualBarcodeSubmit} className="flex flex-col gap-3">
              <input
                ref={manualInputRef}
                type="text"
                value={manualBarcodeInput}
                onChange={(e) => setManualBarcodeInput(e.target.value)}
                placeholder={t("lbl_enterBarcode")}
                className="w-full py-3 px-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                autoFocus // Auto-focus when modal opens
              />
              <button
                type="submit"
                className="py-3 px-4 bg-blue-500 hover:bg-blue-700 text-white text-sm font-semibold rounded-sm transition duration-200 cursor-pointer"
              >
                {t("btnTxt_addManually")}
              </button>
            </form>
          </div>
        </div>
      )}


       {/* Fixed Scan Barcode Button */}
       <div className="fixed right-0 top-1/2 -translate-y-1/2 transform flex flex-col gap-2 p-2 bg-white shadow-xl border border-gray-200 rounded-l-full z-40">
            <button
              title={t("openManualScanner")} // Use translation for title
              onClick={handleOpenScanner}
              className="bg-gradient-to-br from-blue-500 to-red-400 hover:from-blue-700 hover:to-red-500
              text-white p-2 rounded-full shadow-lg transition-transform duration-300 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-400 cursor-pointer"
            >
              <ScanBarcode className="w-5 h-5" />
            </button>
        </div>

    </section>
  );
}