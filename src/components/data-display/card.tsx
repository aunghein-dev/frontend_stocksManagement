"use client";

import { Card } from "flowbite-react";
import { useState, useEffect, useMemo } from "react";
import type { Stock } from "@/data/table.data";
import { useCartStore } from "@/lib/stores/useCartStore";
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import Image from "next/image";
import formatMoney from "@/components/utils/formatMoney";
import dayjs from "dayjs";
import { useTranslation } from "@/hooks/useTranslation"; // This hook is fine as is

export default function Product(props: Stock) {
  const { cart, addItem } = useCartStore();
  const [loaded, setLoaded] = useState(false);
  const colorSet = useMemo(() => Array.from(new Set(props.items.map(item => item.itemColorHex))), [props.items]);
  const [selectedColor, setSelectedColor] = useState("");
  const isColorSelected = selectedColor !== "";
  const { t } = useTranslation(); // Use the translation hook

  const [alert, setAlert] = useState<{ type: "success" | "warning"; show: boolean }>({ type: "success", show: false });

  const selectedItem = useMemo(() => props.items.find(item => item.itemColorHex === selectedColor) || null, [selectedColor, props.items]);
  const selectedImage = 
    selectedItem?.itemImage && selectedItem.itemImage.trim().toUpperCase() !== "NULL"
      ? selectedItem.itemImage
      : props.groupImage && props.groupImage.trim().toUpperCase() !== "NULL"
        ? props.groupImage
        : "/Box.png"; 

  const availableQty = useMemo(() => {
    const totalQty = props.items.filter(i => i.itemColorHex === selectedColor).reduce((sum, i) => sum + i.itemQuantity, 0);
    const alreadyBought = cart.find(group => group.groupId === props.groupId)?.item.find(i => i.colorHex === selectedColor)?.boughtQty || 0;
    return totalQty - alreadyBought;
  }, [cart, props.items, props.groupId, selectedColor]);

  const totalStockQty = useMemo(() => props.items.reduce((sum, i) => sum + i.itemQuantity, 0), [props.items]);
  const colorQty = useMemo(() => props.items.filter(i => i.itemColorHex === selectedColor).reduce((sum, i) => sum + i.itemQuantity, 0), [selectedColor, props.items]);

  useEffect(() => {
    if (alert.show) {
      const timer = setTimeout(() => {
        setAlert(prev => ({ ...prev, show: false }));
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [alert.show]);

  const handleAddToCart = () => {
    if (!selectedItem) return;

    if (availableQty <= 0) {
      setAlert({ type: "warning", show: true });
      return;
    }

    const cartItem = {
      itemId: selectedItem.itemId,
      itemImage: selectedItem.itemImage,
      colorHex: selectedItem.itemColorHex,
      unitPrice: props.groupUnitPrice,
      boughtQty: 1,
    };

    addItem(props.groupId, props.groupName, cartItem);
    setAlert({ type: "success", show: true });
  };

  // Determine button text and disabled state
  const buttonText = useMemo(() => {
    if (!isColorSelected) {
      return t("selectColor");
    }
    if (availableQty <= 0) {
      return t("outOfStock"); // Use translation
    }
    return t("addToCart"); // Use translation
  }, [isColorSelected, availableQty, t]); 

  const isAddToCartDisabled = useMemo(() => {
    return !isColorSelected || availableQty <= 0;
  }, [isColorSelected, availableQty]);

  return (
    <Card
      className="max-w-sm text-gray-900 relative sm:max-w-xs
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
          {t("newProduct")} {/* Use translation */}
        </div>
      )}

      <div className="flex flex-col justify-between gap-2.5 h-full -mt-6">
        <div className="w-full max-w-xs">
          <p className="text-sm font-bold text-gray-600 truncate">{props.groupName}</p>
        </div>

        <div className="flex items-center justify-between relative">
          <span className="text-sm text-gray-600">{formatMoney(props.groupUnitPrice)} </span>
          <span className={`${props.items.length === 0 ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}  font-semibold px-2.5 py-1 rounded-sm text-xs`}>
            {t("inStock")}: {isColorSelected ? colorQty : totalStockQty} {/* Use translation */}
          </span>

          {alert.show && (
            <Alert severity={alert.type} className="absolute -top-2 right-0 " style={{
              fontSize: "0.75rem",
              border: "1px solid #e5e7eb",
            }}>
              <AlertTitle style={{ fontSize: "0.75rem" }}>
                {alert.type === "success" ? t("success") : t("warning")} {/* Use translation */}
              </AlertTitle>
              <strong>
                {alert.type === "success" ? t("addedToCart") : t("notInStock")} {/* Use translation */}
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
           {props.items.length > 0 ? buttonText : t("outOfStock")} {/* Use translation */}
        </button>
      </div>
    </Card>
  );
}