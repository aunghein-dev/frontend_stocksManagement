
"use client";

import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { Invoice } from "@/components/ui/cells/BillingInvoiceList";
import { useInfo } from "@/hooks/useInfo";
import PageLost404 from "@/components/error/pageLost404";
import { FaRegCheckCircle, FaDownload } from "react-icons/fa";
import {  formatReadableDate, formatCurrencyMMK } from "@/components/utils/invoiceUtils"; 
import React from "react";
import { toJpeg } from "html-to-image";
import { useRouter } from "next/navigation";



interface InvoicePageProps {
  params: Promise<{
    slug: string;
  }>;
}


export default function InvoiceDownloaderPage({ params }: InvoicePageProps) {
  const { slug } = React.use(params);
  const API_URL = process.env.NEXT_PUBLIC_API_URL;
  const { business, isLoading: infoLoading } = useInfo();

  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);
  const componentRef = useRef<HTMLDivElement>(null);
  const  router  = useRouter();

  const shortId = invoice?.tranHistId?.slice(-4) ?? "0000";
  const unitAmount = invoice && invoice.issueMonthCnt ? invoice.tranAmt / invoice.issueMonthCnt : 0;
  const issuedDate = formatReadableDate(invoice?.billedDate);
  const expiryDate = formatReadableDate(invoice?.expireDate);
  const paidDate = formatReadableDate(invoice?.billedDate); 

  useEffect(() => {
    const fetchInvoice = async () => {
      try {
        const { data } = await axios.get(`${API_URL}/admin/specific/invoice/${slug}`, {
          withCredentials: true,
        });
        setInvoice(data);
      } catch (err) {
        console.error("Failed to fetch invoice:", err);
      } finally {
        setLoading(false);
      }
    };

    if (slug) fetchInvoice();
  }, [slug, API_URL]);

  const handleSavePhoto = async () => {
  const node = componentRef.current;
  if (!node) return;

  // Store original styles
  const originalStyles = {
    height: node.style.height,
    overflow: node.style.overflow,
  };

  // Temporarily expand the container to show all content
  node.style.height = 'auto';
  node.style.overflow = 'visible';

  // Hide elements you don't want in the image
  const buttons = node.querySelectorAll(".exclude-from-image");
  buttons.forEach(btn => (btn as HTMLElement).style.display = "none");

  try {
    // Wait for images to load
    const images = node.querySelectorAll("img");
    await Promise.all(
      Array.from(images).map((img) => {
        if (img.complete) return Promise.resolve();
        return new Promise<void>((resolve) => {
          img.onload = () => resolve();
          img.onerror = () => resolve();
        });
      })
    );

    // Capture the full content
    const dataUrl = await toJpeg(node, {
      quality: 0.95,
      backgroundColor: "#ffffff",
      pixelRatio: 2,
    });

    // Trigger download
    const link = document.createElement("a");
    link.download = `voucher-${shortId}.jpg`;
    link.href = dataUrl;
    link.click();
  } catch (error) {
    console.error("Failed to generate image:", error);
  } finally {
    // Restore original styles
    node.style.height = originalStyles.height;
    node.style.overflow = originalStyles.overflow;
    buttons.forEach(btn => (btn as HTMLElement).style.display = "");
  }
};

  if (loading || infoLoading) {
    return (
      <div className="h-[90dvh] flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-blue-500"></div>
        <span className="ml-2 mt-2 text-sm text-gray-500">
          Loading invoice data...
        </span>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100dvh-108px)] text-red-600">
        <PageLost404
          header={"Invoice not found"}
          message={"Check your internet connection and contact your software provider."}
          reload={() => window.location.reload()}
        />
      </div>
    );
  }

  return (
    <div className="relative flex flex-col overflow-hidden rounded-lg bg-white shadow-xs h-[calc(100dvh-110px)] w-[calc(100dvw-25px)] sm:w-[calc(100dvw-225px)]">
      {/* Top Bar with Download Button */}
      <div className="flex flex-row items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
        <button
          className="cursor-pointer bg-blue-100 px-3 py-1 rounded-sm text-sm hover:bg-blue-200 text-blue-600 border-[0.5px] border-blue-600"
          onClick={() => router.back()}
          aria-label="Close Invoice"
        >
           Back
        </button>
        <button
          onClick={handleSavePhoto}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-sm text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-[1.5px] focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200"
        >
          <FaDownload className="w-4 h-4" /> Save Photo
        </button>
      </div>

      {/* Invoice Content Area - This will be captured for PDF */}
      <div
        className="flex-grow overflow-y-auto custom-scrollbar p-0 text-gray-800"
        ref={componentRef}
      >
         {/* Header Section */}
        <div className="border-b-[1px] border-blue-400 filter border-brightness-125">
          <div className="flex items-center justify-between py-4 px-5">
            <span className="text-[1.15rem] font-semibold">INV#{shortId}</span>
            <span className="text-[0.7rem] text-blue-500 
                          flex flex-row items-center gap-1
                          bg-blue-100/50 px-2 py-1 rounded-full">
              <FaRegCheckCircle className="w-3 h-3 inline"/> Paid
            </span>
          </div>

          <div className="py-4 bg-blue-100/50 px-5 border-t-[0.5px] border-gray-200">
            <span className="flex flex-row items-center gap-2 text-xs">
              <FaRegCheckCircle className="w-4 h-4 font-light text-blue-500"/>
              Invoice Paid on {paidDate}
            </span>
          </div>
        </div>

        {/* Parties and Dates Section */}
        <div className="grid grid-cols-2 gap-8 mb-8 text-[0.82rem] px-6 mt-8">
          <div>
            <h3 className="text-xs text-gray-500 mb-1">Issued On</h3>
            <p className="text-gray-800">{issuedDate}</p>
          </div>
          <div>
            <h3 className="text-xs text-gray-500 mb-1">Due On</h3>
            <p className="text-gray-800">{expiryDate}</p>
          </div>
          <div>
            <h3 className="text-xs text-gray-500 mb-1">From</h3>
            <p className="font-medium text-gray-900">{invoice.bizName}</p>
            <p className="text-gray-700">{business?.address}</p>
            <p className="text-gray-700">{business?.township}, {business?.city}</p>
            <p className="text-gray-700">{business?.state}</p>
          </div>
          <div>
            <h3 className="text-xs text-gray-500 mb-1">To</h3>
            <p className="font-medium text-gray-900">OPENWARE.</p>
            <p className="text-gray-700">{invoice.tranProvider}</p>
            <p className="text-gray-700">{invoice.tranHistId}</p>
          </div>
        </div>

        {/* Plan Details */}
        <div className="border-b border-gray-200 pb-6 mb-6 px-6 text-[0.82rem]">
          <h3 className="text-xs text-gray-500 mb-1">Plan</h3>
          <p className="text-gray-900">{invoice.planName} - {formatCurrencyMMK(invoice.tranAmt/invoice.issueMonthCnt)}</p>
        </div>

        {/* Items Table */}
        <h3 className="text-lg font-semibold text-gray-800 mb-4 px-6">Items</h3>
        <div className="overflow-x-auto mb-6 mx-6 text-[0.82rem] custom-scrollbar">
          <table className="min-w-full bg-white border border-gray-200 rounded-sm">
            <thead className="bg-gray-50 rounded-sm">
              <tr>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wider border-b border-gray-200">Description</th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wider border-b border-gray-200">Unit Amount</th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wider border-b border-gray-200">Months</th>
                <th className="py-3 px-4 text-right text-xs font-medium text-gray-600 uppercase tracking-wider border-b border-gray-200">Total Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-200 last:border-b-0">
                <td className="py-3 px-4 text-sm text-gray-800">{invoice.planName}</td>
                <td className="py-3 px-4 text-sm text-gray-800">{formatCurrencyMMK(unitAmount)}</td>
                <td className="py-3 px-4 text-sm text-gray-800">{invoice.issueMonthCnt}</td>
                <td className="py-3 px-4 text-right text-sm text-gray-800">{formatCurrencyMMK(invoice.tranAmt)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Totals Section */}
        <div className="flex justify-end py-3 border-t border-gray-200 
                        rounded-b-sm px-7 mb-6">
          <div className="w-full max-w-[250px] space-y-2">
            <div className="flex justify-between text-sm font-medium text-gray-700">
              <span>Subtotal:</span>
              <span>{formatCurrencyMMK(invoice.tranAmt)}</span>
            </div>
            <div className="flex justify-between text-sm font-medium text-gray-700">
              <span>Tax:</span>
              <span>{formatCurrencyMMK(0)}</span> {/* Assuming 0 tax based on previous code */}
            </div>
            <div className="flex justify-between text-lg font-bold text-gray-900 pt-2 border-t border-gray-200">
              <span>Total:</span>
              <span>{formatCurrencyMMK(invoice.tranAmt)}</span>
            </div>
          </div>
        </div>

        <div className="flex justify-center">
          <p className="text-[0.80rem] text-gray-500 mb-4 px-2">Please make all checks payable to OPENWARE. Thank you for your business!</p>
        </div>
      </div>
    </div>
  );
}