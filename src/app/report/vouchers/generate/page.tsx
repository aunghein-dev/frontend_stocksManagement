// /src/app/vouchers/generate/page.tsx

"use client";

// Type Definitions (moved to top for clarity)
type VoucherItem = {
  name: string;
  id: number;
  date: string; // Changed from 'date' to 'tranDate' in the original problem. Let's use 'date' as per your JSON.
  batch: string;
  price: number;
  quantity: number;
  subTotal: number;
  // If your backend *actually* returns 'tranDate' in the future, you'd add:
  // tranDate: string; // Add this if your backend provides 'tranDate'
};

import React, { useEffect, useRef, useState, useCallback } from "react";
import dayjs from "dayjs";
import { useReactToPrint } from "react-to-print";
import Image from "next/image";
import { useSearchParams, useRouter } from 'next/navigation';
import axios from "axios";
import { useInfo } from "@/hooks/useInfo";

export default function GenerateVoucherPage() {

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL; 

  const searchParams = useSearchParams();
  const router = useRouter();
  const batchId = searchParams.get('batchId')?.toString();

  const componentRef = useRef<HTMLDivElement>(null);
   const handlePrint = useReactToPrint({
      contentRef: componentRef,
    });
  

  // Fetch business info using the custom hook
  const { business, isLoading: isBusinessInfoLoading, error: businessInfoError } = useInfo();

  // State for voucher data and its loading/error status
  const [voucherData, setVoucherData] = useState<VoucherItem[] | null>(null);
  const [isLoadingVoucher, setIsLoadingVoucher] = useState(true);
  const [voucherFetchError, setVoucherFetchError] = useState<string | null>(null);

  // Memoized function to fetch voucher data
  const fetchVoucher = useCallback(async (currentBatchId: string, currentBizId: number) => {
    setIsLoadingVoucher(true);
    setVoucherFetchError(null); // Clear previous errors
    try {
      if (!API_BASE_URL) {
        throw new Error("API_BASE_URL is not defined in environment variables. Please check your .env.local file.");
      }
      const response = await axios.get<VoucherItem[]>(
        `${API_BASE_URL}/checkout/generate/${currentBatchId}/${currentBizId}`,
        { withCredentials: true }
      );
      setVoucherData(response.data);
    } catch (error) {
      console.error("Error fetching voucher:", error);
      if (axios.isAxiosError(error) && error.response) {
        setVoucherFetchError(`Failed to load voucher: ${error.response.status} ${error.response.statusText}`);
      } else {
        setVoucherFetchError("An unknown error occurred while fetching voucher data.");
      }
      setVoucherData(null); // Ensure data is cleared on error
    } finally {
      setIsLoadingVoucher(false);
    }
  }, [API_BASE_URL]); // Dependency: API_BASE_URL

  // Effect to trigger voucher data fetch
  useEffect(() => {
    // Only proceed if business info has finished loading and there are no errors
    // and if we have a valid businessId and batchId
    if (!isBusinessInfoLoading && !businessInfoError && business?.businessId && batchId) {
      fetchVoucher(batchId, business.businessId);
    } else if (!isBusinessInfoLoading && (businessInfoError || !business?.businessId)) {
      // If business info failed or is missing, set a specific error for voucher generation
      setVoucherFetchError(
        businessInfoError?.message || "Business ID not available. Cannot generate voucher."
      );
      setIsLoadingVoucher(false); // Stop loading state as we know why it can't fetch
    } else if (!isBusinessInfoLoading && !batchId) {
      // If batchId is missing, also set an error
      setVoucherFetchError("Voucher Batch ID is missing from the URL. Cannot generate voucher.");
      setIsLoadingVoucher(false);
    }
    // No 'else if' for isLoadingVoucher, as we set it to true/false inside fetchVoucher
  }, [
    isBusinessInfoLoading,
    businessInfoError,
    business?.businessId, // Depend on business.businessId specifically
    batchId,
    fetchVoucher // Include memoized fetchVoucher as a dependency
  ]);

  // Calculate grandTotal based on voucherData
  const grandTotal = voucherData ? voucherData.reduce((sum, item) => sum + item.subTotal, 0) : 0;

  

  {/* Conditional Rendering for Loading and Error States */}
  {/* These blocks ensure the user sees feedback while data is being fetched or if something goes wrong. */}

  if (isBusinessInfoLoading || isLoadingVoucher) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <div className="w-7 h-7 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-gray-600">
          {isBusinessInfoLoading ? "Loading business info..." : "Loading voucher data..."}
        </p>
      </div>
    );
  }

  if (businessInfoError) {
    return (
      <div className="flex flex-col items-center justify-center h-screen text-red-600">
        <p className="text-lg font-semibold">Error Loading Business Information</p>
        <p className="text-sm text-center px-4">{businessInfoError.message}</p>
        <button
          onClick={() => window.location.reload()} // Simple reload to retry
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Retry
        </button>
      </div>
    );
  }

  if (voucherFetchError) {
    return (
      <div className="flex flex-col items-center justify-center h-screen text-red-600">
        <p className="text-lg font-semibold">Voucher Generation Error</p>
        <p className="text-sm text-center px-4">{voucherFetchError}</p>
        <button
          onClick={() => router.back()} // Go back to previous page
          className="mt-4 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
        >
          Go Back
        </button>
      </div>
    );
  }

  if (!voucherData || voucherData.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-screen text-gray-600">
        <p className="text-lg font-semibold">No Voucher Data Found</p>
        <p className="text-sm text-center px-4">
          The voucher with Batch ID &quot;{batchId}&quot; could not be found or contains no items.
        </p>
        <button
          onClick={() => router.back()}
          className="mt-4 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
        >
          Go Back
        </button>
      </div>
    );
  }

  
  {/* Main Voucher Content (only renders if data is successfully loaded and not empty) */}
  return (
    <div
      ref={componentRef}
      className="relative h-[90vh] w-full flex flex-col animate-slide-up p-0.5 overflow-hidden bg-white rounded-sm"
    >
      {/* Close Button */}
      <div className="min-h-[40px] w-[40px] absolute top-2 left-2 print:hidden">
        <button
          className="cursor-pointer bg-blue-100 px-3 py-1 rounded-sm text-sm hover:bg-blue-200 text-blue-500 border-[0.5px] border-blue-500"
          onClick={() => router.back()}
          aria-label="Close Voucher"
        >
          Back
        </button>
      </div>

     

      <div className="overflow-auto custom-scrollbar px-4">
        <div className="flex flex-col items-center mt-10">
           <Image
              className="h-20"
              width={75}
              height={75}
              src={business?.businessLogo}
              alt="Mo Mo Clothing Logo"
              draggable={false}
            />
          <h1 className="text-2xl font-bold mb-6 text-gray-700">{business?.businessName}</h1>
          <p className="text-xs -mt-5 mb-2 text-gray-700">{business?.streets}</p>
          <p className="text-xs mb-2 text-gray-700">
            {business?.township}၊​ {business?.city}</p>
          <p className="text-xs font-mono text-gray-700">
            {business?.phoneNum1}၊  {business?.phoneNum2}</p>
        </div>

        <ul className="mt-6">
          <div className="text-[rgba(56,57,60,0.75)]">
            <div className="flex justify-between px-1.5 text-sm font-bold">
              {/* Added optional chaining and a fallback for batchId */}
              <span className="p-2">Slip: #{batchId?.substring(0, 8).toUpperCase() || 'N/A'}</span>
              {/* Corrected to use item.date as per your JSON, with robust checks */}
              <span className="p-2">
                {voucherData[0]?.date ? dayjs(voucherData[0].date).format("DD-MMM-YYYY") : 'N/A'}
              </span>
            </div>
            <div className="flex justify-between px-1.5 border-b border-gray-400 text-sm border-dashed font-bold -mt-4">
              <span className="p-2">Ordered</span>
              <span className="p-2">Delivery</span>
            </div>
          </div>

          {/* Table Header */}
          <li className="grid grid-cols-[12%_38%_20%_10%_20%] p-1 border-b border-gray-400 font-bold text-center text-sm border-dashed text-gray-700">
            <span className="p-2">No</span>
            <span className="p-2 text-left">Item</span>
            <span className="p-2">Unit</span>
            <span className="p-2">Qty.</span>
            <span className="p-2 text-right">Amount</span>
          </li>

          {/* Table Rows */}
          {voucherData.map((item, index) => (
            <li
              key={item.id || index} // Use item.id as key if available, fallback to index
              className="grid grid-cols-[12%_38%_20%_10%_20%] p-2 border-b border-gray-400 border-dotted text-center items-center text-sm px-3 text-gray-700"
            >
              <span>{index + 1}</span>
              <span className="text-left break-words">{item.name}</span>
              <span>{item.price.toLocaleString()}</span>
              <span>{item.quantity.toLocaleString()}</span>
              <span className="text-right">{item.subTotal.toLocaleString()}</span>
            </li>
          ))}

          {/* Grand Total */}
          <li className="grid grid-cols-[30%_10%_20%_10%_30%] p-1 border-b border-gray-400 font-bold text-center text-sm border-dashed text-gray-700">
            <span className="p-2">Grand Total</span>
            <span className="p-2"></span>
            <span className="p-2"></span>
            <span className="p-2"></span>
            <span className="p-2 text-right">{grandTotal.toLocaleString()} {business?.defaultCurrency}</span>
          </li>
        </ul>

        <p className="text-sm mt-8 flex justify-center mb-10 text-gray-600">
          {business?.invoiceFooterMessage || ''}
        </p>
      </div>

      {/* Print Button */}
      <div className="absolute bottom-2 right-4 print:hidden">
        <button
          onClick={handlePrint}
          className="bg-blue-500 hover:bg-blue-700 text-white font-medium rounded-sm text-sm py-1.5 px-4"
        >
          Print
        </button>
      </div>
    </div>
  );
}