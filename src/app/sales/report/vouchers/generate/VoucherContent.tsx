// src/app/report/vouchers/generate/VoucherContent.tsx
'use client'; // This component is explicitly a client component

import React, { useEffect, useRef, useState, useCallback } from "react";
import dayjs from "dayjs";
import { useReactToPrint } from "react-to-print";
import { useSearchParams, useRouter } from 'next/navigation'; // <-- These are here
import axios from "axios";
import { useInfo } from "@/hooks/useInfo";
import PageLost404 from "@/components/error/pageLost404";
import { toJpeg } from "html-to-image";
import { useTranslation } from "@/hooks/useTranslation";
import Image from "next/image";

// Type Definitions (can be kept here or in a global types file)
type VoucherItem = {
  name: string;
  id: number;
  date: string;
  batch: string;
  price: number;
  quantity: number;
  subTotal: number;

};

// This component will contain all the logic that uses client-side hooks
export default function VoucherContent() {
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL; 

  const searchParams = useSearchParams(); // THIS IS SAFE HERE
  const router = useRouter();
  const batchId = searchParams.get('batchId')?.toString();

  const componentRef = useRef<HTMLDivElement>(null);
  const handlePrint = useReactToPrint({
    contentRef: componentRef,
  });
  const {t} = useTranslation();

  

  // Fetch business info using the custom hook
  const { business, isLoading: isBusinessInfoLoading, error: businessInfoError } = useInfo();

  // State for voucher data and its loading/error status
  const [voucherData, setVoucherData] = useState<VoucherItem[] | null>(null);
  const [isLoadingVoucher, setIsLoadingVoucher] = useState(true);
  const [voucherFetchError, setVoucherFetchError] = useState<string | null>(null);

  // Memoized function to fetch voucher data
  const fetchVoucher = useCallback(async (currentBatchId: string, currentBizId: number) => {
    setIsLoadingVoucher(true);
    setVoucherFetchError(null);
    try {
      if (!API_BASE_URL) {
        throw new Error("API_BASE_URL is not defined in environment variables. Please check  .env.local file.");
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
      setVoucherData(null);
    } finally {
      setIsLoadingVoucher(false);
    }
  }, [API_BASE_URL]);

  // Effect to trigger voucher data fetch
  useEffect(() => {
    if (!isBusinessInfoLoading && !businessInfoError && business?.businessId && batchId) {
      fetchVoucher(batchId, business.businessId);
    } else if (!isBusinessInfoLoading && (businessInfoError || !business?.businessId)) {
      setVoucherFetchError(
        businessInfoError?.message || "Business ID not available. Cannot generate voucher."
      );
      setIsLoadingVoucher(false);
    } else if (!isBusinessInfoLoading && !batchId) {
      setVoucherFetchError("Voucher Batch ID is missing from the URL. Cannot generate voucher.");
      setIsLoadingVoucher(false);
    }
  }, [
    isBusinessInfoLoading,
    businessInfoError,
    business?.businessId,
    batchId,
    fetchVoucher
  ]);


  const handleSavePhoto = async () => {
  const node = componentRef.current;
  if (!node) return;

  // 🔴 Hide elements you don’t want in the image
  const buttons = node.querySelectorAll(".exclude-from-image");
  buttons.forEach(btn => (btn as HTMLElement).style.display = "none");

  // ✅ Ensure all images in the node are fully loaded
  const images = node.querySelectorAll("img");
  await Promise.all(
    Array.from(images).map((img) => {
      if (img.complete) return Promise.resolve();
      return new Promise<void>((resolve) => {
        img.onload = () => resolve();
        img.onerror = () => resolve(); // still resolve on error
      });
    })
  );

  try {
    const dataUrl = await toJpeg(node, {
      quality: 0.95,
      backgroundColor: "#ffffff",
      pixelRatio: 2,
    });

    // ✅ Trigger download
    const link = document.createElement("a");
    link.download = `voucher-${batchId}.jpg`;
    link.href = dataUrl;
    link.click();
  } catch (error) {
    console.error("Failed to generate image:", error);
  } finally {
    // ✅ Show hidden buttons again
    buttons.forEach(btn => (btn as HTMLElement).style.display = "");
  }
};

  

  // Calculate grandTotal based on voucherData
  const grandTotal = voucherData ? voucherData.reduce((sum, item) => sum + item.subTotal, 0) : 0;

  // Conditional Rendering for Loading and Error States
  if (isBusinessInfoLoading || isLoadingVoucher) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100dvh-108px)]">
        <div className="w-7 h-7 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-gray-600 text-sm">
          {isBusinessInfoLoading ? "Loading business info..." : "Loading voucher data..."}
        </p>
      </div>
    );
  }

  if (businessInfoError) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100dvh-108px)] text-red-600">
           <PageLost404 
          header="Something went wrong."
          message={businessInfoError || "An unknown error occurred."}
          reload={() => window.location.reload()}
          />
      </div>
    );
  }

  if (voucherFetchError) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100dvh-108px)] text-red-600">
        <PageLost404 
          header="Voucher Generation Error"
          message={voucherFetchError || "An unknown error occurred in fetching voucher data."}
          reload={() => window.location.reload()}
        />
      </div>
    );
  }

  if (!voucherData || voucherData.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100dvh-108px)] text-gray-600">
        <p className="text-lg font-semibold">No Voucher Data Found</p>
        <p className="text-sm text-center px-4">
          The voucher with Batch ID &quot;{batchId}&quot; could not be found or contains no items.
        </p>
        <button
          onClick={() => router.back()}
          className="mt-4 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
        >
          {t("btnTxt_back")}
        </button>
      </div>
    );
  }

  // Main Voucher Content (only renders if data is successfully loaded and not empty)
  return (
    <div
      className="relative w-full flex flex-col animate-slide-up 
                p-1 overflow-hidden rounded-sm bg-white h-[calc(100dvh-111px)]"
    >
      {/* ... ( existing JSX content for the voucher) ... */}
      <div className="min-h-[40px] w-[40px] absolute top-2 left-2 print:hidden">
        <button
          className="cursor-pointer bg-blue-100 px-3 py-1 rounded-sm text-sm hover:bg-blue-200 text-blue-500 border-[0.5px] border-blue-500"
          onClick={() => router.back()}
          aria-label="Close Voucher"
        >
           {t("btnTxt_back")}
        </button>
      </div>

      <div className="overflow-auto custom-scrollbar px-1 md:px-10 lg:px-30 xl:px-40"
           ref={componentRef}>
        <div className="flex flex-col items-center mt-4">
          {/*
          <Image
            className="w-20 h-20 rounded-md object-cover flex-shrink-0" // New size: 80px x 80px
            width={80} // Match intrinsic width to the Tailwind size
            height={80} // Match intrinsic height to the Tailwind size
            src={business?.businessLogo? business?.businessLogo : "/onlylogo.png"}
            alt={business?.businessName ? `${business.businessName} Logo` : "Business Logo"}
            draggable={false}
          />*/
          }

         <Image
          src={business?.businessLogo || "/onlylogo.png"}
          alt="Business Logo"
          className="w-20 h-20 rounded-md object-cover flex-shrink-0"
          width={80}
          height={80}
          priority
          unoptimized 
        />

          
          <h1 className="text-2xl font-semibold mb-6 text-gray-700">{business?.businessName}</h1>
          <p className="text-xs -mt-5 mb-2 text-gray-700">{business?.streets}</p>
          <p className="text-xs mb-2 text-gray-700">
            {business?.township}၊​ {business?.city}</p>
          <p className="text-xs font-mono text-gray-700">
            {business?.phoneNum1}၊  {business?.phoneNum2}</p>
        </div>
        
        <ul className="mt-6">
          <div className="text-[rgba(56,57,60,0.75)]">
            <div className="flex justify-between px-1.5 text-[0.75rem] font-semibold">
              <span className="p-2">Slip: #{batchId?.substring(0, 8).toUpperCase() || 'N/A'}</span>
              <span className="p-2">
                {voucherData[0]?.date ? dayjs(voucherData[0].date).format("DD-MMM-YYYY") : 'N/A'}
              </span>
            </div>
            {/*<div className="flex justify-between px-1.5 text-[0.75rem] font-semibold -mt-3">
              <span className="p-2">Test Customer</span>
              <span className="p-2">Retailer</span>
            </div>*/}
             <div className="flex justify-between px-1.5 text-[0.75rem] font-semibold -mt-3">
              <span className="p-2">Ordered</span>
              <span className="p-2">{voucherData[0]?.date ? dayjs(voucherData[0].date).format("hh:mm A") : 'N/A'}</span>
            </div>
          </div>
          <div className="border-1 border-dotted border-gray-400">
          {/* Table Header */}
          <li className="grid grid-cols-[12%_38%_20%_10%_20%] border-b border-gray-300 font-semibold text-center text-sm text-gray-700 bg-gray-200">
            <span className="p-2 border-r border-dotted border-gray-400 py-2">No</span>
            <span className="p-2 text-left border-r border-dotted border-gray-400 py-2">Item</span>
            <span className="p-2 border-r border-dotted border-gray-400 py-2">Unit</span>
            <span className="p-2 border-r border-dotted border-gray-400 py-2">Qty.</span>
            <span className="p-2 text-right">Amount</span>
          </li>

          {/* Table Rows */}
          {voucherData.map((item, index) => (
            <li
              key={item.id || index}
              className="grid grid-cols-[12%_38%_20%_10%_20%] border-b border-gray-400 border-dotted text-center items-center text-[0.75rem] text-gray-700 "
            >
              <span className="border-r border-dotted border-gray-400 py-2">{index + 1}</span>
              <span className="text-left break-words pl-2 border-r border-dotted border-gray-400 py-2">{item.name}</span>
              <span className="border-r border-dotted border-gray-400 py-2">{item.price.toLocaleString()}</span>
              <span className="border-r border-dotted border-gray-400 py-2">{item.quantity.toLocaleString()}</span>
              <span className="text-right pr-3">{item.subTotal.toLocaleString()}</span>
            </li>
          ))}
          

          <li className="grid grid-cols-[20%_20%_10%_30%_20%] py-[0.5px]  font-semibold text-center text-sm border-dotted text-gray-600">
            <span className="p-1"></span>
            <span className="p-1"></span>
            <span className="p-1"></span>
            <span className="p-1 border-r border-dotted border-gray-400 text-right pr-2 whitespace-nowrap">Grand Total</span>
            <span className="p-1 text-right mr-1">{grandTotal.toLocaleString()} 
            </span>
          </li>

          {/*<li className="grid grid-cols-[20%_20%_20%_20%_20%] py-[0.5px] border-b border-gray-400 font-semibold text-center text-sm border-dotted text-gray-600">
            <span className="p-1"></span>
            <span className="p-1"></span>
            <span className="p-1"></span>
            <span className="p-1 border-r border-dotted border-gray-400 text-right pr-2">Paid</span>
            <span className="p-1 text-right mr-1 ">{grandTotal.toLocaleString()} 
              
            </span>
          </li>*

          {/*<li className="grid grid-cols-[20%_20%_20%_20%_20%] py-[0.5px] border-b border-gray-400 font-semibold text-center text-sm border-dotted text-gray-600">
            <span className="p-1"></span>
            <span className="p-1"></span>
            <span className="p-1"></span>
            <span className="p-1 border-r border-dotted border-gray-400 text-right pr-2">Change</span>
            <span className="p-1 text-right mr-1">{grandTotal.toLocaleString()} 
            </span>
          </li>*/}

          {/* Grand Total 
          <li className="grid grid-cols-[20%_20%_20%_20%_20%] py-[0.5px] font-semibold text-center text-sm border-dotted text-gray-600">
            <span className="p-1"></span>
            <span className="p-1"></span>
            <span className="p-1"></span>
            <span className="p-1 border-r border-dotted border-gray-400 text-right pr-2">Balance</span>
            <span className="p-1 text-right mr-1">{grandTotal.toLocaleString()} 
              
            </span>
          </li>*/}
          </div>
        </ul>
       
        <p className="text-[0.75rem] mt-8 flex justify-center mb-10 text-gray-600">
          {business?.invoiceFooterMessage || ''}
        </p>
      </div>

     <div className="absolute bottom-2 right-4 print:hidden grid grid-cols-2 gap-2">
          <button
            onClick={handleSavePhoto}
            className="bg-blue-100 hover:bg-blue-200 text-blue-600 font-medium rounded-sm text-sm py-2 px-4 cursor-pointer transition-all duration-200 ease-in-out exclude-from-image"
          >
            {t("bntTxt_savePhoto")}
          </button>
          <button
            onClick={handlePrint}
            className="bg-blue-500 hover:bg-blue-700 text-white font-medium rounded-sm text-sm py-2 px-4 cursor-pointer transition-all duration-200 ease-in-out exclude-from-image"
          >
            {t("btnTxt_print")}
          </button>
        </div>
    </div>
  );
}