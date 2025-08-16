"use client";

import React, { useRef } from "react";
import dayjs from "dayjs";
import { useReactToPrint } from "react-to-print";
import Image from "next/image";
import { useInfo } from "@/hooks/useInfo";
import { toJpeg } from 'html-to-image';
import CloseIcon from '@mui/icons-material/Close';
// Assuming formatMoney utility exists at this path
// If not, you'll need to define it or import from where it actually is
import formatMoney from "@/components/utils/formatMoney";
import useOrderNo from "@/lib/stores/useOrderNo";
import { useDiscountStore } from "@/lib/stores/useDiscountStore";
import useCheckoutCustomer from "@/lib/stores/useCheckoutCustomer";
import { useTranslation } from "@/hooks/useTranslation";

// Define the interface for the original item structure
type CartItemInput = {
  groupId: number;
  name: string; // This 'name' is the item name in  flat data
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
  data: CartItemInput[]; // Data prop now expects the original flat Cart[] type
  grandTotal: number;
  handleToggle: () => void;
};

export default function PopupVoucher({
  data,
  grandTotal,
  handleToggle,
}: PopupVoucherProps) {

  // Process the data to group items by groupId
  const groupedData = groupVoucherItems(data);
  const { orderNo  } = useOrderNo();
  const { discountAmt} = useDiscountStore();
  const { checkoutCustomer } = useCheckoutCustomer();
  const componentRef = useRef<HTMLDivElement>(null);
  const handlePrint = useReactToPrint({
    contentRef: componentRef,
  });
  const { business } = useInfo();
  const {t} = useTranslation();


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
    link.download = `voucher-${orderNo.orderNo}.jpg`;
    link.href = dataUrl;
    link.click();
  } catch (error) {
    console.error("Failed to generate image:", error);
  } finally {
    // ✅ Show hidden buttons again
    buttons.forEach(btn => (btn as HTMLElement).style.display = "");
  }
};


  return (
    <div
      className="fixed inset-0 backdrop-blur-[1px] flex items-center justify-center px-2 z-[55] overflow-hidden"
      style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
    >

      <div
        ref={componentRef}
        className="relative h-[95dvh] w-full sm:w-[600px] shadow-2xl flex flex-col animate-slide-up p-0.5 overflow-hidden bg-white rounded-sm
        print:h-auto print:overflow-visible print:shadow-none print:bg-transparent print:animate-none print:rounded-none"
      >

        {/* Close Button */}
        <div className="min-h-[40px] w-[40px] absolute top-2 right-1 print:hidden exclude-from-image">
          <button
            className="text-gray-500 hover:text-gray-900
                     text-2xl cursor-pointer hover:bg-gray-50 rounded-full w-8 h-8 flex items-center justify-center ease-in-out duration-300"
            onClick={handleToggle}
            aria-label="Close Popup"
            title="Close" // Added title for hover tooltip
          >
             <CloseIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Logo & Header */}
        <div className="exclude-from-image">
          
          {/* Ensure this image path is correct relative to  public folder */
          /*<Image
            className="absolute top-4 left-4 w-[75px] "
            src="/Box.png" // This should be /Box.png if it's in public folder
            alt="QR Code" // Change alt text if it's not a QR Code
            width={75}
            height={75}
            draggable={false}
          />*/}
        </div>


        <div
          className="overflow-auto custom-scrollbar px-2">
          <div className="flex flex-col items-center mt-4">
            <Image
              className="w-20 h-20 rounded-sm object-cover flex-shrink-0" // New size: 80px x 80px
              width={80} // Match intrinsic width to the Tailwind size
              height={80} // Match intrinsic height to the Tailwind size
              src={business?.businessLogo? business.businessLogo : "/onlylogo.png"}
              alt={business?.businessName ? `${business.businessName} Logo` : "Business Logo"}
              draggable={false}
              unoptimized
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
                  Slip: #{orderNo.orderNo.substring(0, 8).toUpperCase()}
                </span>
                <span className="p-2">{dayjs().format("DD-MMM-YYYY")}</span>
              </div>
              <div className="flex justify-between px-1.5 text-xs border-dashed font-bold -mt-3">
                <span className="p-2">{checkoutCustomer.name}</span>
                <span className="p-2">{dayjs().format("hh:mm A")}</span>
              </div>
               <div className="flex justify-between px-1.5 border-b border-gray-400 text-xs border-dashed font-bold -mt-3">
                <span className="p-2">{checkoutCustomer.phoneNo1}</span>
                <span className="p-2">Ordered</span>
              </div>
            </div>

            {/* Table Header */}
            <li className="grid grid-cols-[12%_38%_20%_10%_20%] p-1 border-b border-gray-400 font-bold text-center text-xs border-dashed text-gray-700 bg-gray-50">
              <span className="p-2 pl-3 text-left">No</span>
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
                <span className="text-left pl-3">{index + 1}</span>
                <span className="text-left break-words">{group.groupName}</span> {/* Display group name */}
                {/* Display price of the first item in the group, assuming it's consistent */}
                <span>{group.originalItems[0]?.price.toLocaleString()}</span>
                <span>{group.totalQuantity.toLocaleString()}</span> {/* Display total quantity for the group */}
                <span className="text-right">
                  {formatMoney(group.totalSubTotal)} {/* Display total subTotal for the group */}
                </span>
              </li>
            ))}


            {
              discountAmt > 0 && (
                <li className="grid grid-cols-[75%_0%_0%_0%_25%] px-2 pt-2 font-bold text-center text-[0.8rem] border-dotted text-gray-700 bg-gray-50">
                <span className="p-1 text-right">Discount</span>
                <span className="p-1"></span>
                <span className="p-1"></span>
                <span className="p-1"></span>
                <span className="p-1 text-right flex flex-row items-center
                              justify-end">
                  {formatMoney(discountAmt)} 
                   <span className="sm:block sm:ml-1 hidden text-gray-400">{business?.defaultCurrency}</span>
                </span>
              </li>
              )
            }
            

            {/* Grand Total */}
            <li className={`grid grid-cols-[75%_0%_0%_0%_25%] p-x-2  pb-1 border-b border-gray-400 font-bold text-center text-sm border-dashed text-gray-700 ${discountAmt > 0 ? "pt-0" : "pt-2"} bg-gray-50`}>
              <span className="p-2 text-right">Grand Total</span>
              <span className="p-2"></span>
              <span className="p-2"></span>
              <span className="p-2"></span>
              <span className="p-1 text-right mr-2 flex flex-row items-center
                              justify-end">{grandTotal.toLocaleString()} 
              <span className="sm:block sm:ml-1 hidden text-gray-400">{business?.defaultCurrency}</span>
              </span>
            </li>
          </ul>

          <p className="text-sm mt-8 flex justify-center mb-10 text-gray-600">
            {business?.invoiceFooterMessage || ''}
          </p>
        </div>

        {/* Print Button */}
        <div className="absolute bottom-2 right-4 print:hidden grid grid-cols-2 gap-2">
          <button
            onClick={handleSavePhoto}
            className="bg-blue-100 hover:bg-blue-200 text-blue-600 font-medium rounded-sm text-sm py-2 px-4 cursor-pointer transition-all duration-200 ease-in-out exclude-from-image"
          >
            {t("bntTxt_savePhoto")}
          </button>
          <button
            onClick={handlePrint}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-sm text-sm py-2 px-4 cursor-pointer transition-all duration-200 ease-in-out exclude-from-image"
          >
            {t("btnTxt_print")}
          </button>
        </div>
      </div>
    </div>
  );
}

