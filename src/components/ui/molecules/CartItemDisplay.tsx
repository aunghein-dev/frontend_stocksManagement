// components/cart/CartItemDisplay.tsx
import Image from "next/image";
import { useState } from "react";
import Alert from "@mui/material/Alert";
import AlertTitle from "@mui/material/AlertTitle";

import { CartGroup, CartItem } from "@/lib/classes/Cart"; // Assuming these types are defined here or globally

// --- Helper Function ---
function hexToRgba(hex: string, alpha: number): string {
  const [r, g, b] = hex
    .replace('#', '')
    .match(/.{1,2}/g)!
    .map((x) => parseInt(x, 16));
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

// --- Component Props ---
type CartItemDisplayProps = {
  group: CartGroup;
  item: CartItem;
  outOfStockItemId: string | null;
  // isOutOfStock is now implicitly handled by handleClickAdd logic
  handleClickAdd: (group: CartGroup, item: CartItem) => void;
  removeItem: (groupId: number, itemId: number) => void;
  deleteItem: (groupId: number, itemId: number) => void;
  t: (key: string) => string; // Pass the translation function
};

// --- CartItemDisplay Component ---
export default function CartItemDisplay({
  group,
  item,
  outOfStockItemId,
  handleClickAdd,
  removeItem,
  deleteItem,
  t,
}: CartItemDisplayProps) {
  const [imageLoaded, setImageLoaded] = useState(false);

  return (
    <li
      className="relative flex items-center justify-between gap-1 px-1 py-3
                 rounded-xl border-[0.5px] border-gray-200 transition-all duration-300
                 cursor-pointer"
      style={{
        background: `linear-gradient(to right, ${hexToRgba(item.colorHex, 0.2)}, rgba(0, 0, 0, 0.08))`,
      }}
    >
      {outOfStockItemId === `${group.groupId}-${item.itemId}` && (
        <Alert
          severity="warning"
          className="absolute top-1 right-1 z-10"
          style={{
            fontSize: "0.75rem",
            border: "1px solid #e5e7eb",
            padding: "2px 6px",
          }}
        >
          <AlertTitle style={{ fontSize: "0.75rem" }}></AlertTitle>
          <strong>{t("outOfStock")}</strong>
        </Alert>
      )}

      <div className="flex items-center gap-1.5">
        <div className="flex items-center flex-col gap-0.5 min-w-[50px] text-right">
          <span className="text-xs text-gray-600 font-medium sm:text-sm">
            {item.itemId}
          </span>
          <div
            className="w-6 h-6 rounded-full border-[1px] border-gray-400"
            style={{ backgroundColor: item.colorHex }}
          />
        </div>

        <Image
          loader={({ src }) => src}
          src={item.itemImage === "" || item.itemImage === null ? "/Box.png" : item.itemImage}
          alt={`${item.itemId} product image`}
          width={80}
          height={80}
          unoptimized
          className={`rounded-md border-[0.5px] border-gray-200 shadow-sm
                      w-11 h-11 sm:w-16 sm:h-16
                      cursor-pointer hover:scale-104
                      object-cover transition-all duration-300 ease-in-out
                      ${imageLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
          onLoadingComplete={() => setImageLoaded(true)}
        />
      </div>

      <div className="flex items-center gap-1">
        <button
          className="w-6 h-6 rounded-full bg-gray-400 hover:bg-gray-500 text-white font-bold
                     flex items-center justify-center ease-in-out duration-300 cursor-pointer"
          onClick={() => removeItem(group.groupId, item.itemId)}
        >
          –
        </button>
        <span className="text-sm font-medium min-w-[40px] text-center">{item.boughtQty}</span>
        <button
          className="w-6 h-6 rounded-full bg-gray-400 hover:bg-gray-500 text-white font-bold
                     flex items-center justify-center ease-in-out duration-300 cursor-pointer"
          onClick={() => handleClickAdd(group, item)}
        >
          +
        </button>
      </div>

      <div className="flex flex-col sm:min-w-[130px] min-w-[100px] text-right">
        <span className="text-xs sm:text-sm text-gray-500">
          {item.boughtQty} x {item.unitPrice}
        </span>
        <span className="text-sm sm:text-lg font-bold text-gray-800">
          {item.boughtQty * item.unitPrice}
          <span className="text-xs text-gray-400">{" "}MMK</span>
        </span>
      </div>

      <button
        className="text-gray-500 hover:text-gray-900 text-2xl bg-gray-200 h-7 w-7 rounded-full cursor-pointer hover:bg-gray-300 ease-in-out duration-300 flex items-center justify-center text-center min-w-7"
        title="Remove Item"
        onClick={() => deleteItem(group.groupId, item.itemId)}
      >
        &times;
      </button>
    </li>
  );
}