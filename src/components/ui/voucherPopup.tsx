"use client";

import React, { useRef } from "react";
import dayjs from "dayjs";
import { useReactToPrint } from "react-to-print";
import Image from "next/image";
import { useInfo } from "@/hooks/useInfo";

// Assuming formatMoney utility exists at this path
// If not, you'll need to define it or import from where it actually is
import formatMoney from "@/components/utils/formatMoney";

// Define the interface for the original item structure
type CartItemInput = {
  groupId: number;
  name: string; // This 'name' is the item name in your flat data
  price: number;
  quantity: number;
  subTotal: number;
};

// Define the interface for the grouped item structure
interface GroupedVoucherItem {
  groupId: number;
  groupName: string; // This will hold the name representative of the group
  totalQuantity: number;
  totalSubTotal: number;
  // You might not need to store individual items here if only totals are displayed
  // For simplicity, we'll keep it for now if you need to reference original item data
  originalItems: CartItemInput[];
}


// --- Utility function to group the data ---
function groupVoucherItems(data: CartItemInput[]): GroupedVoucherItem[] {
  const grouped: { [key: number]: GroupedVoucherItem } = {};

  data.forEach(item => {
    if (!grouped[item.groupId]) {
      // Initialize the group if it doesn't exist
      grouped[item.groupId] = {
        groupId: item.groupId,
        groupName: item.name, // Using the first item's name as the group name
        totalQuantity: 0,
        totalSubTotal: 0,
        originalItems: [],
      };
    }
    // Aggregate quantities and subtotals for the group
    grouped[item.groupId].totalQuantity += item.quantity;
    grouped[item.groupId].totalSubTotal += item.subTotal;
    grouped[item.groupId].originalItems.push(item); // Store original item for potential future use or debugging
  });

  // Convert the object back to an array
  return Object.values(grouped);
}
// --- End of Utility function ---


type PopupVoucherProps = {
  uniqueId: string;
  data: CartItemInput[]; // Data prop now expects the original flat Cart[] type
  grandTotal: number;
  handleToggle: () => void;
};

export default function PopupVoucher({
  uniqueId,
  data,
  grandTotal,
  handleToggle,
}: PopupVoucherProps) {

  // Process the data to group items by groupId
  const groupedData = groupVoucherItems(data);


  const componentRef = useRef<HTMLDivElement>(null);
  const handlePrint = useReactToPrint({
    contentRef: componentRef,
  });
  const { business, isLoading } = useInfo();


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
            className="flex items-center justify-center w-9 h-9 rounded-full
                       bg-white text-gray-600 hover:text-red-600
                       shadow-md hover:shadow-lg
                       border border-gray-200 hover:border-red-300
                       transition-all duration-300 ease-in-out
                       focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-opacity-75 cursor-pointer"
            onClick={handleToggle}
            aria-label="Close Popup"
            title="Close" // Added title for hover tooltip
          >
            {/* SVG Close Icon (more professional than 'x') */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="2.5" // Slightly thicker stroke for better visibility
              stroke="currentColor"
              className="w-4 h-4" // Tailwind classes for size
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Logo & Header */}
        <div className="">
          {/* Ensure this image path is correct relative to your public folder */}
          <Image
            className="absolute top-4 left-4 w-[75px]"
            src="/Box.png" // This should be /Box.png if it's in public folder
            alt="QR Code" // Change alt text if it's not a QR Code
            width={75}
            height={75}
            draggable={false}
          />
        </div>


        <div
          className="overflow-auto custom-scrollbar px-2">
          <div className="flex flex-col items-center mt-4">
            <Image
              className="w-20 h-20 rounded-md object-cover flex-shrink-0" // New size: 80px x 80px
              width={80} // Match intrinsic width to the Tailwind size
              height={80} // Match intrinsic height to the Tailwind size
              src={business?.businessLogo}
              alt={business?.businessName ? `${business.businessName} Logo` : "Business Logo"}
              draggable={false}
            />
            <h1 className="text-2xl font-bold mb-6 text-gray-700">{business?.businessName}</h1>
            <p className="text-xs -mt-5 mb-2 text-gray-700">{business?.streets}</p>
            <p className="text-xs mb-2 text-gray-700">
              {business?.township}၊​ {business?.city}</p>
            <p className="text-xs font-mono text-gray-700">
              {business?.phoneNum1}၊ {business?.phoneNum2}</p>
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

            {/* Table Rows (NOW USING GROUPED DATA) */}
            {groupedData.map((group, index) => ( // Use groupedData here
              <li
                key={group.groupId} // Use groupId for unique key
                className="grid grid-cols-[12%_38%_20%_10%_20%] p-2 border-b border-gray-400 border-dotted text-center items-center text-xs px-3 text-gray-700"
              >
                <span>{index + 1}</span>
                <span className="text-left break-words">{group.groupName}</span> {/* Display group name */}
                {/* Display price of the first item in the group, assuming it's consistent */}
                <span>{group.originalItems[0]?.price.toLocaleString()}</span>
                <span>{group.totalQuantity.toLocaleString()}</span> {/* Display total quantity for the group */}
                <span className="text-right">
                  {formatMoney(group.totalSubTotal)} {/* Display total subTotal for the group */}
                </span>
              </li>
            ))}

            {/* Grand Total */}
            <li className="grid grid-cols-[30%_10%_20%_10%_30%] p-1 border-b border-gray-400 font-bold text-center text-sm border-dashed text-gray-700">
              <span className="p-2">Grand Total</span>
              <span className="p-2"></span>
              <span className="p-2"></span>
              <span className="p-2"></span>
              <span className="p-2 text-right">
                {formatMoney(grandTotal)} {business?.defaultCurrency} {/* Ensure grandTotal is formatted too */}
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