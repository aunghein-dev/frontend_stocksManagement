"use client";

import { useState, useEffect, useMemo } from "react";
import type { Stock } from "@/types/stock.types";
import { useCartStore } from "@/lib/stores/useCartStore";
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import Image from "next/image";
import formatMoney from "@/components/utils/formatMoney";
import dayjs from "dayjs";
import { useTranslation } from "@/hooks/useTranslation";
import ProductCardFooter from "./molecules/ProductCardFooter";



export default function ProductCard(props: Stock) {
  const cart = useCartStore(state => state.cart);
  const addItem = useCartStore(state => state.addItem);

  const [loaded, setLoaded] = useState(false);
  const colorSet = useMemo(() => 
    Array.from(new Set(props.items.map(item => 
      item.itemColorHex))), 
  [props.items]);

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
      setAlert({ type: "warning", show: true }); // No color selected
      return;
    }

    const currentStockItem = props.items.find(
      (item) => item.itemId === selectedItem.itemId && item.itemColorHex === selectedColor
    );

    if (!currentStockItem) {
      setAlert({ type: "warning", show: true });
      return;
    }

    const totalStockForColor = currentStockItem.itemQuantity;
    const currentItemInCart = cart.find(
      (group) => group.groupId === props.groupId
    )?.item.find((item) => item.itemId === selectedItem.itemId && item.colorHex === selectedColor);

    const alreadyBought = currentItemInCart ? currentItemInCart.boughtQty : 0;

    if (alreadyBought + 1 > totalStockForColor) {
      setAlert({ type: "warning", show: true });
      return;
    }

    const cartItem = {
      itemId: selectedItem.itemId,
      itemImage: selectedItem.itemImage,
      colorHex: selectedItem.itemColorHex,
      unitPrice: props.groupUnitPrice,
      boughtQty: 1,
      barcodeNo: selectedItem.barcodeNo
    };

    addItem(props.groupId, props.groupName, cartItem);
    setAlert({ type: "success", show: true });
  };

  const isAddToCartDisabled = useMemo(() => {
    if (!isColorSelected) return true;

    const currentStockItem = props.items.find(
      (item) => item.itemColorHex === selectedColor
    );

    if (!currentStockItem) return true;

    const totalStockForColor = currentStockItem.itemQuantity;
    const currentItemInCart = cart.find(
      (group) => group.groupId === props.groupId
    )?.item.find((item) => item.colorHex === selectedColor);

    const alreadyBought = currentItemInCart ? currentItemInCart.boughtQty : 0;

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
      return t("outOfStock");
    }

    const totalStockForColor = currentStockItem.itemQuantity;
    const currentItemInCart = cart.find(
      (group) => group.groupId === props.groupId
    )?.item.find((item) => item.colorHex === selectedColor);

    const alreadyBought = currentItemInCart ? currentItemInCart.boughtQty : 0;

    if ((alreadyBought + 1) > totalStockForColor) {
      return t("outOfStock");
    }
    return t("addToCart");
  }, [isColorSelected, selectedColor, props.items, props.groupId, cart, t]);

  const clearColor = () => {
    setSelectedColor("");
  }

  return (
    <div
      className="max-w-[250px] text-gray-900 relativ sm:max-w-md
                 cursor-pointer transition duration-200 ease-in-out
                 shadow-xs hover:shadow-xl rounded-lg border-[0.5px] border-gray-200 relative">
          <div className="w-full h-[140px] relative">
            {!loaded && (
              <div className="w-full h-full bg-gray-200 rounded-t-lg animate-pulse" />
            )}
            <Image
              fill
              sizes="100%"
              src={selectedImage}
              alt={props.groupName}
              onLoad={() => setLoaded(true)}
              unoptimized
              className={`w-full max-h-[140px]
                          min-h-[140px] object-cover
                          rounded-t-lg absolute top-0
                          left-0 transition-opacity duration-300 ${
                            loaded ? 'opacity-100' : 'opacity-0'
                          }`}
            />
            {props.items.length === 0 && (
              <div
                className="absolute inset-0 bg-black/50 bg-opacity-50
                           flex items-center justify-center
                           rounded-t-lg z-10"
              >
                <span className="text-white text-xl font-bold uppercase tracking-wider select-none">
                  {t("outOfStock")}
                </span>
              </div>
            )}
          </div>
      {dayjs().diff(dayjs(props.releasedDate), 'day') <= 7 &&
       props.items.length > 1 &&
      (
        <div className="absolute top-2 left-2 bg-green-600/60 text-white px-2 py-0.5 text-xs rounded-sm"> {/* Reduced padding and font size */}
          {t("newProduct")}
        </div>
      )}

      {/* Barcode Display */}
      {selectedColor && (
        <div className="absolute top-2 right-2 bg-white/60 text-gray-800 px-2 py-0.5 text-xs rounded-sm"> {/* Reduced padding and font size */}
          {displayBarcode}
        </div>
      )}

      {/* Adjusted -mt and reduced gap */}
      <div className="flex flex-col justify-between gap-1 p-2"> 
        <div className="w-full max-w-xs">
          <p className="text-sm font-bold text-gray-600 truncate">{props.groupName}</p>
        </div>

        <div className="flex items-center justify-between relative">
          <span className="text-sm text-gray-600">{formatMoney(props.groupUnitPrice)} </span>
          <span className={`${props.items.length === 0 ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'} font-semibold px-2 py-0.5 rounded-sm text-xs`}> {/* Reduced padding */}
            {t("inStock")}: {isColorSelected ? availableQtyDisplay : totalStockQty}
          </span>

         {alert.show && (
            <Alert severity={alert.type} className="absolute -top-10 right-0 z-20" style={{ // Slightly adjusted position and z-index for alert
              fontSize: "0.8rem", // Further reduced font size for alert content
              border: "1px solid #e5e7eb",
              padding: "4px 6px", // Reduced alert padding
              minWidth: "auto" // Allow alert to shrink more
            }}>
              <AlertTitle style={{ fontSize: "0.8rem", margin: 0 }}> {/* Reduced AlertTitle font size and removed margin */}
                {alert.type === "success" ? t("success") : t("warning")}
              </AlertTitle>
              <strong style={{ fontSize: "0.75rem" }}> {/* Smallest font for alert message */}
                {alert.type === "success" ? t("addedToCart") : t("outOfStock")}
              </strong>
            </Alert>
          )}
        </div>

        {/* Reduced button padding */}
        <ProductCardFooter  
          items={props.items}
          isAddToCartDisabled={isAddToCartDisabled}
          isColorSelected={isColorSelected}
          clearColor={clearColor}
          handleAddToCart={handleAddToCart}
          buttonText={buttonText}
          t={t}
          colorSet={colorSet}
          selectedColor={selectedColor}
          setSelectedColor={setSelectedColor}
        />
      </div>
    </div>
  );
}