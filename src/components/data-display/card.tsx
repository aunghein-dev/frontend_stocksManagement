"use client";

import { Card } from "flowbite-react";
import { useState, useEffect, useMemo } from "react";
import type { Stock } from "@/data/table.data"; // Assuming this is correct
import { useCartStore } from "@/lib/stores/useCartStore";
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import Image from "next/image";
import formatMoney from "@/components/utils/formatMoney";
import dayjs from "dayjs";
import { useTranslation } from "@/hooks/useTranslation";

export default function Product(props: Stock) {
 const cart = useCartStore(state => state.cart);
const addItem = useCartStore(state => state.addItem);

  const [loaded, setLoaded] = useState(false);
  const colorSet = useMemo(() => Array.from(new Set(props.items.map(item => item.itemColorHex))), [props.items]);
  const [selectedColor, setSelectedColor] = useState("");
  const isColorSelected = selectedColor !== "";
  const { t } = useTranslation();

  const [alert, setAlert] = useState<{ type: "success" | "warning"; show: boolean }>({ type: "success", show: false });

  const selectedItem = useMemo(() => props.items.find(item => item.itemColorHex === selectedColor) || null, [selectedColor, props.items]);

  // availableQty now represents remaining *display* quantity, not the check for adding one more
  const availableQtyDisplay = useMemo(() => {
    const totalQty = props.items.filter(i => i.itemColorHex === selectedColor).reduce((sum, i) => sum + i.itemQuantity, 0);
    const alreadyBought = cart.find(group => group.groupId === props.groupId)?.item.find(i => i.colorHex === selectedColor)?.boughtQty || 0;
    return totalQty - alreadyBought;
  }, [cart, props.items, props.groupId, selectedColor]);

  const totalStockQty = useMemo(() => props.items.reduce((sum, i) => sum + i.itemQuantity, 0), [props.items]);
  // colorQty now represents the total stock for the selected color, regardless of cart
 // const colorQtyTotalInStock = useMemo(() => props.items.filter(i => i.itemColorHex === selectedColor).reduce((sum, i) => sum + i.itemQuantity, 0), [selectedColor, props.items]);

  const selectedImage = useMemo(() => {
    if (selectedItem?.itemImage && selectedItem.itemImage.trim().toUpperCase() !== "NULL") {
      return selectedItem.itemImage;
    } else if (props.groupImage && props.groupImage.trim().toUpperCase() !== "NULL") {
      return props.groupImage;
    } else {
      return "/Box.png";
    }
  }, [selectedItem, props.groupImage]);

  const displayBarcode = useMemo(() => {
    if (selectedItem?.barcodeNo) {
      return selectedItem.barcodeNo;
    }
    if (props.items.length > 0 && props.items[0].barcodeNo) {
      return props.items[0].barcodeNo;
    }
    return '';
  }, [selectedItem, props.items]);

  useEffect(() => {
    if (alert.show) {
      const timer = setTimeout(() => {
        setAlert(prev => ({ ...prev, show: false }));
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [alert.show]);

  const handleAddToCart = () => {
    if (!selectedItem) {
      // This should be prevented by button disablement, but good for safety.
      setAlert({ type: "warning", show: true }); // No color selected
      return;
    }

    // --- Core stock checking logic for adding one more ---
    const currentStockItem = props.items.find(
        (item) => item.itemId === selectedItem.itemId && item.itemColorHex === selectedColor
    );

    if (!currentStockItem) {
        setAlert({ type: "warning", show: true }); // Should not happen if selectedItem is found
        return;
    }

    const totalStockForColor = currentStockItem.itemQuantity;
    const currentItemInCart = cart.find(
        (group) => group.groupId === props.groupId
    )?.item.find((item) => item.itemId === selectedItem.itemId && item.colorHex === selectedColor); // Ensure matching item ID and color

    const alreadyBought = currentItemInCart ? currentItemInCart.boughtQty : 0;

    // Check if adding one more would exceed the total stock for this color
    if (alreadyBought + 1 > totalStockForColor) {
      setAlert({ type: "warning", show: true }); // Trigger out of stock alert
      return;
    }
    // --- End core stock checking logic ---

    const cartItem = {
      itemId: selectedItem.itemId,
      itemImage: selectedItem.itemImage,
      colorHex: selectedItem.itemColorHex,
      unitPrice: props.groupUnitPrice,
      boughtQty: 1, // Always adding 1
      barcodeNo: selectedItem.barcodeNo
    };

    addItem(props.groupId, props.groupName, cartItem);
    setAlert({ type: "success", show: true }); // Trigger success alert
  };

  // Determine button text and disabled state
  const isAddToCartDisabled = useMemo(() => {
    if (!isColorSelected) return true; // Disable if no color is selected

    const currentStockItem = props.items.find(
        (item) => item.itemColorHex === selectedColor
    ); // Find the stock item for the selected color

    if (!currentStockItem) return true; // Disable if no stock item found for the selected color

    const totalStockForColor = currentStockItem.itemQuantity;
    const currentItemInCart = cart.find(
        (group) => group.groupId === props.groupId
    )?.item.find((item) => item.colorHex === selectedColor);

    const alreadyBought = currentItemInCart ? currentItemInCart.boughtQty : 0;

    // Disable if adding one more would exceed the total stock for this color
    return (alreadyBought + 1) > totalStockForColor;
  }, [isColorSelected, selectedColor, props.items, props.groupId, cart]);

  const buttonText = useMemo(() => {
    if (!isColorSelected) {
      return t("selectColor");
    }

    const currentStockItem = props.items.find(
        (item) => item.itemColorHex === selectedColor
    );

    if (!currentStockItem) {
        return t("outOfStock"); // No stock item for this color at all
    }

    const totalStockForColor = currentStockItem.itemQuantity;
    const currentItemInCart = cart.find(
        (group) => group.groupId === props.groupId
    )?.item.find((item) => item.colorHex === selectedColor);

    const alreadyBought = currentItemInCart ? currentItemInCart.boughtQty : 0;

    // If adding one more would exceed stock, show out of stock text
    if ((alreadyBought + 1) > totalStockForColor) {
      return t("outOfStock");
    }
    return t("addToCart");
  }, [isColorSelected, selectedColor, props.items, props.groupId, cart, t]);

  return (
    <Card
      className="max-w-[330px] text-gray-900 relative sm:max-w-sm
                 cursor-pointer transition duration-200 ease-in-out
                 shadow-xs hover:shadow-md"
      renderImage={() => {
        return (
          <div className="w-full max-h-[240px] min-h-[240px] relative">
            {!loaded && (
              <div className="w-full h-full bg-gray-200 rounded-t-[14px] animate-pulse" />
            )}
            <Image
              fill
              sizes="100%"
              src={selectedImage}
              alt={props.groupName}
              onLoad={() => setLoaded(true)}
              className={`w-full max-h-[240px]
                          min-h-[240px] object-cover 
                          rounded-t-[14px] absolute top-0 
                          left-0 transition-opacity duration-300 ${
                loaded ? 'opacity-100' : 'opacity-0'
              }`}
            />
            {props.items.length === 0 && (
            <div
              className="absolute inset-0 bg-black/50 bg-opacity-50
                        flex items-center justify-center
                        rounded-t-[14px] z-10" 
            >
              <span className="text-white text-xl font-bold uppercase tracking-wider select-none">
                {t("outOfStock")}
              </span>
            </div>
          )}
          </div>
        );
      }}
      style={{
        backgroundColor: "white",
        border: "0.5px solid oklch(90.9% 0.005 56.366)",
        borderRadius: '14px',
        maxHeight: "390px"
      }}
    >
      {dayjs().diff(dayjs(props.releasedDate), 'day') <= 7 && 
       props.items.length > 1 &&
      (
        <div className="absolute top-2 left-2 bg-green-600 text-white px-3 py-1 text-sm rounded-sm">
          {t("newProduct")}
        </div>
      )}

      {/* Barcode Display */}
      {selectedColor && ( // Only render if a color is selected
        <div className="absolute top-2 right-2 bg-white text-gray-800 px-3 py-1 text-sm rounded-sm">
           {displayBarcode}
        </div>
      )}

      <div className="flex flex-col justify-between gap-2.5 h-full -mt-6">
        <div className="w-full max-w-xs">
          <p className="text-sm font-bold text-gray-600 truncate">{props.groupName}</p>
        </div>

        <div className="flex items-center justify-between relative">
          <span className="text-sm text-gray-600">{formatMoney(props.groupUnitPrice)} </span>
          <span className={`${props.items.length === 0 ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}  font-semibold px-2.5 py-1 rounded-sm text-xs`}>
            {t("inStock")}: {isColorSelected ? availableQtyDisplay : totalStockQty}
          </span>

          {alert.show && (
            <Alert severity={alert.type} className="absolute -top-2 right-0 " style={{
              fontSize: "0.75rem",
              border: "1px solid #e5e7eb",
            }}>
              <AlertTitle style={{ fontSize: "0.75rem" }}>
                {alert.type === "success" ? t("success") : t("warning")}
              </AlertTitle>
              <strong>
                {alert.type === "success" ? t("addedToCart") : t("outOfStock")}
              </strong>
            </Alert>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-1.5 min-h-4">
          <div className="flex gap-1">
            {colorSet.map((color) => (
              <button
                key={color}
                className={`w-5 h-5 rounded-full ring-2 transition duration-200 border-[0.5px] border-gray-300 ${
                  selectedColor === color ? "ring-offset-1 ring-blue-500" : "ring-transparent"
                }`}
                style={{ backgroundColor: color }}
                onClick={() => setSelectedColor(color)}
              />
            ))}
          </div>
        </div>

        <button
          onClick={handleAddToCart}
          className={`w-full py-2.5 rounded-xs text-xs transition-all duration-200
                      cursor-pointer font-semibold
            ${isAddToCartDisabled
              ? props.items.length > 0 ? 'bg-gray-300 text-gray-600 cursor-not-allowed' 
                                       : 'bg-gray-200 text-gray-600 border-[0.5px] border-gray-300 opacity-50 cursor-not-allowed'
              : 'bg-blue-500 hover:bg-blue-600 text-white shadow-md'
            }`}
          disabled={isAddToCartDisabled}
        >
           {props.items.length > 0 ? buttonText : t("outOfStock")}
        </button>
      </div>
    </Card>
  );
}