"use client";

import React, { useRef } from "react";
import dayjs from "dayjs";
import { useReactToPrint } from "react-to-print";
import Image from "next/image";
import { useInfo } from "@/hooks/useInfo";

type Cart = {
  name: string;
  price: number;
  quantity: number;
  subTotal: number;
};

type PopupVoucherProps = {
  uniqueId: string;
  data: Cart[];
  grandTotal: number;
  handleToggle: () => void;
};

export default function PopupVoucher({
  uniqueId,
  data,
  grandTotal,
  handleToggle,
}: PopupVoucherProps) {
  

const componentRef = useRef<HTMLDivElement>(null);
 const handlePrint = useReactToPrint({
    contentRef: componentRef,
  });
const { business, isLoading } = useInfo();


console.log(business);

  return (
    <div
      className="fixed inset-0 backdrop-blur-[1px] flex items-center justify-center px-2 z-[55] overflow-hidden"
      style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
    >
      
     <div
          ref={componentRef}
          className="relative h-[90vh] w-full sm:w-[600px] shadow-2xl flex flex-col animate-slide-up p-0.5 overflow-hidden bg-white rounded-sm"
        >

        {/* Close Button */}
        <div className="min-h-[40px] w-[40px] absolute top-2 right-2 print:hidden">
          <button
            className="bg-gray-50 hover:bg-gray-100 text-red-500 rounded-full text-xl h-8 w-8 flex items-center justify-center shadow-sm hover:shadow-md transition-shadow duration-200 cursor-pointer"
            onClick={handleToggle}
            aria-label="Close Popup"
          >
            ×
          </button>
        </div>

        {/* Logo & Header */}
        <div className="">
          <Image
          className="absolute top-4 left-4 w-[75px]"
          src="/Box.png"
          alt="QR Code"
          width={75}
          height={75}
          draggable={false}
          />
        </div>
       

        <div
           className="overflow-auto custom-scrollbar px-4">
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
              <div className="flex justify-between px-1.5 text-xs font-bold">
                <span className="p-2">
                  Slip: #{uniqueId.substring(0, 8).toUpperCase()}
                </span>
                <span className="p-2">{dayjs().format("DD-MMM-YYYY")}</span>
              </div>
              <div className="flex justify-between px-1.5 border-b border-gray-400 text-xs border-dashed font-bold -mt-4">
                <span className="p-2">Ordered</span>
                <span className="p-2">Delivery</span>
              </div>
            </div>

            {/* Table Header */}
            <li className="grid grid-cols-[12%_38%_20%_10%_20%] p-1 border-b border-gray-400 font-bold text-center text-xs border-dashed text-gray-700">
              <span className="p-2">No</span>
              <span className="p-2 text-left">Item</span>
              <span className="p-2">Unit</span>
              <span className="p-2">Qty.</span>
              <span className="p-2 text-right">Amount</span>
            </li>

            {/* Table Rows */}
            {data.map((item, index) => (
              <li
                key={index}
                className="grid grid-cols-[12%_38%_20%_10%_20%] p-2 border-b border-gray-400 border-dotted text-center items-center text-xs px-3 text-gray-700"
              >
                <span>{index + 1}</span>
                <span className="text-left break-words">{item.name}</span>
                <span>{item.price.toLocaleString()}</span>
                <span>{item.quantity.toLocaleString()}</span>
                <span className="text-right">
                  {item.subTotal.toLocaleString()}</span>
              </li>
            ))}

            {/* Grand Total */}
            <li className="grid grid-cols-[30%_10%_20%_10%_30%] p-1 border-b border-gray-400 font-bold text-center text-sm border-dashed text-gray-700">
              <span className="p-2">Grand Total</span>
              <span className="p-2"></span>
              <span className="p-2"></span>
              <span className="p-2"></span>
              <span className="p-2 text-right">
                {grandTotal.toLocaleString()} {business?.defaultCurrency}
              </span>
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
            className="bg-blue-500 hover:bg-blue-700 text-white font-medium rounded-sm text-sm py-2 px-4"
          >
            Print
          </button>
        </div>
      </div>
    </div>
  );
}
