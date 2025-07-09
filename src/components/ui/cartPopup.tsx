"use client";

import Image from "next/image";
import { useCartStore } from "@/lib/stores/useCartStore";
import { CartGroup, CartItem } from "@/lib/classes/Cart";
import { useEffect, useState } from "react";
import Alert from "@mui/material/Alert";
import AlertTitle from "@mui/material/AlertTitle";
import axios from "axios";
import { useStocks } from "@/hooks/useStocks";
import { useInfo } from "@/hooks/useInfo";
import PopupVouncher from "./voucherPopup";
import formatMoney from "@/components/utils/formatMoney";
import { motion, AnimatePresence } from "framer-motion"; 
import { useTranslation } from "@/hooks/useTranslation";
import cartData from "@/cookie/cart.data";

type SalesProps = {
  tranDate: string;
  batchId: string;
  stkGroupId: number;
  stkGroupName: string;
  stkItemId: number;
  checkoutQty: number;
  itemUnitPrice: number;
  subCheckout: number;
  tranUserEmail: string;
  bizId: number;
};

export default function CartPopup(props: { handleToggle: () => void }) {
  const API = process.env.NEXT_PUBLIC_API_URL;
  const { cart, addItem, removeItem, deleteItem, clearCart, total, totalQty } = useCartStore();
  const grandTotal = total;
  const grandTotalQty = totalQty;
  const [error, setError] = useState<string | null>(null);
  const [outOfStockItemId, setOutOfStockItemId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { items: stocks, refresh } = useStocks();
  const { business } = useInfo();
  const [showVouncher, setShowVouncher] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    if (outOfStockItemId !== null) {
      const timer = setTimeout(() => {
        setOutOfStockItemId(null);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [outOfStockItemId]);

  function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }

  const [voucherData, setVoucherData] = useState<any[]>([]);
  const [voucherUUID, setVoucherUUID] = useState<string>("");
  const [imageLoaded, setImageLoaded] = useState(false); // This state is for the cart item images, not the empty cart SVG
  const vouncherGrand = voucherData.reduce((acc, item) => acc + item.subTotal, 0);

  const handleCheckout = async () => {
    try {
      setLoading(true);
      const newUUID = generateUUID();
      const tempJson: SalesProps[] = [];

      cart.forEach((group) => {
        group.item.forEach((item) => {
          tempJson.push({
            tranDate: new Date().toISOString(),
            batchId: newUUID,
            stkGroupId: group.groupId,
            stkGroupName: group.groupName,
            stkItemId: item.itemId,
            checkoutQty: item.boughtQty,
            itemUnitPrice: item.unitPrice,
            subCheckout: item.unitPrice * item.boughtQty,
            tranUserEmail: business.registeredBy,
            bizId: business.id || 0,
          });
        });
      });

      const response = await axios.post(`${API}/checkout/${business.businessId}`, tempJson, {
        withCredentials: true,
        headers: { 'Content-Type': 'application/json' },
      });

      if (response.status === 200) {
        const voucher = tempJson.map((group) => ({
          groupId: group.stkGroupId,
          name: group.stkGroupName,
          price: group.itemUnitPrice,
          quantity: group.checkoutQty,
          subTotal: group.subCheckout,
        }));

        setVoucherUUID(newUUID);
        setVoucherData(voucher);
        clearCart(); 
        refresh();
        console.log(cartData);
        
        setShowVouncher(true);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  function hexToRgba(hex: string, alpha: number): string {
    const [r, g, b] = hex
      .replace('#', '')
      .match(/.{1,2}/g)!
      .map((x) => parseInt(x, 16));
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  const isOutOfStock = (group: CartGroup, item: CartItem) => {
    const existingCountInCart =
      cart
        .find((g) => g.groupId === group.groupId)
        ?.item.find((i) => i.itemId === item.itemId)?.boughtQty || 0;

    const availableQty =
      stocks
        .find((s: any) => s.groupId === group.groupId)
        ?.items.find((i: any) => i.itemId === item.itemId)?.itemQuantity || 0;

    return availableQty - existingCountInCart <= 0;
  };

  const handleClickAdd = (group: CartGroup, item: CartItem) => {
    if (isOutOfStock(group, item)) {
      setOutOfStockItemId(`${group.groupId}-${item.itemId}`);
      return;
    }

    addItem(group.groupId, group.groupName, {
      ...item,
      boughtQty: 1,
    });
  };

  const itemElements = cart.map((group, index) => (
    <section
      key={group.groupId}
      className="relative p-1 border border-gray-200 rounded-2xl shadow-xs "
    >
      <h3 className="text-md font-semibold text-gray-700 mb-3 mx-3 mt-1">
        <span>#{index + 1}. {" "}{group.groupName}</span>
      </h3>
      <ul className="space-y-1.5">
        {group.item.map((item) => (
          <li
            key={item.itemId}
            className="relative flex items-center justify-between gap-2 px-1 py-5 
                       rounded-xl border-[0.5px] border-gray-200 transition-all duration-300
                      cursor-pointer"
            style={{
              background: `linear-gradient(to right, ${hexToRgba(item.colorHex, 0.2)}, rgba(0, 0, 0, 0.08))`,
            }}
          >
            {/* Alert per item */}
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

            {/* Color + ID */}
            <div className="flex items-center gap-1.5">
              <div
                className="w-6 h-6 rounded-full border-[1px] border-gray-400"
                style={{ backgroundColor: item.colorHex }}
              />
              <Image
                loader={({ src }) => src}
                src={item.itemImage === "" || item.itemImage === null ? "/Box.png" : item.itemImage}
                alt={item.itemId + " product image"}
                width={100}
                height={100}
                unoptimized
                className={`rounded-md border border-gray-200 shadow-sm
                            w-14 h-14 sm:w-20 sm:h-20
                            cursor-pointer hover:scale-104
                            object-cover transition-all duration-300 ease-in-out
                            ${imageLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
                onLoadingComplete={() => setImageLoaded(true)}
              /> 
              <span className="text-xs text-gray-600 font-medium sm:text-sm">
                #{item.itemId}
              </span>
            </div>

            {/* Quantity Controls */}
            <div className="flex items-center gap-1">
              <button
                className="w-6 h-6 rounded-full bg-gray-400 hover:bg-gray-500 text-white font-bold
                           flex items-center justify-center ease-in-out duration-300 cursor-pointer"
                onClick={() => removeItem(group.groupId, item.itemId)}
              >
                –
              </button>
              <span className="px-2 text-sm font-medium">{item.boughtQty}</span>
              <button
                className="w-6 h-6 rounded-full bg-gray-400 hover:bg-gray-500 text-white font-bold
                           flex items-center justify-center ease-in-out duration-300 cursor-pointer"
                onClick={() => handleClickAdd(group, item)}
              >
                +
              </button>
            </div>

            {/* Price Info */}
            <div className="flex flex-col text-left">
              <span className="text-xs sm:text-sm text-gray-500">
                {item.boughtQty} x {item.unitPrice}
              </span>
              <span className="text-sm sm:text-lg font-bold text-gray-800">
                {item.boughtQty * item.unitPrice} 
           
                <span className="text-xs text-gray-400">{" "}MMK</span>
              </span>
            </div>

            {/* Delete */}
            <button
              className="text-gray-500 hover:text-gray-900 text-2xl bg-gray-200 h-7 w-7 rounded-full cursor-pointer hover:bg-gray-300 ease-in-out duration-300 flex items-center justify-center"
              title="Remove Item"
              onClick={() => deleteItem(group.groupId, item.itemId)}
            >
              &times;
            </button>
          </li>
        ))}
      </ul>
    </section>
  ));

  if(showVouncher){
    return (
      <PopupVouncher
        uniqueId={voucherUUID}
        data={voucherData}
        grandTotal={vouncherGrand}
        handleToggle={props.handleToggle}
      />
    )
  }

  return (
    <div className="fixed inset-0 backdrop-blur-[1px] flex items-center justify-center px-2 z-60 overflow-hidden"
      style={{
        backgroundColor: "rgba(0, 0, 0, 0.5)",
      }}>

      <div className="relative h-[90dvh] w-full sm:w-[600px] rounded-sm shadow-2xl flex flex-col border border-gray-200 animate-slide-up bg-white">
        {/* Close Button */}
        <button
          onClick={props.handleToggle}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-900
                     text-2xl cursor-pointer hover:bg-gray-200 rounded-full w-8 h-8 flex items-center justify-center ease-in-out duration-300"
          aria-label="Close"
        >
          &times;
        </button>

        {loading && (
              <div className="absolute top-4 right-12">
                <div className="w-7 h-7 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
              </div>
         )}

        {/* Header */}
        <div className="p-5 border-b border-gray-200 
                      bg-gray-100 text-lg font-semibold 
                      text-gray-800 flex">
           {t("hd_shoppingCart")}
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-auto p-1 space-y-4 custom-scrollbar mt-3">
          {itemElements.length ? (
            itemElements
          ) : (
            // Use AnimatePresence to handle mounting/unmounting animations
           <AnimatePresence>
            {itemElements.length ? (
              itemElements
            ) : (
              <motion.div
                key="empty-cart"
                // Change 'y' in initial to a larger positive value to come from below
                initial={{ opacity: 0, scale: 0.9, y: 100 }} // Starts further down
                animate={{ opacity: 1, scale: 1, y: 0 }}   // Animates to its final centered position
                // Change 'y' in exit to move downwards as it disappears
                exit={{ opacity: 0, scale: 0.9, y: 100 }}   // Exits by moving back downwards
                transition={{ duration: 0.7, ease: "easeOut" }}
                className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
              >
                <Image
                  src="/noitemsincart.svg"
                  alt="Empty Cart"
                  aria-label="Empty Cart"
                  width={250}
                  height={250}
                  className="mx-auto"
                />

                <motion.span
                  // Keep text animation similar for a staggered effect, but also make it enter from below if desired
                  initial={{ opacity: 0, y: 50 }} // Start text slightly lower than default
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, ease: "easeOut", delay: 0.2 }}
                  className="block text-center text-gray-500 font-bold text-md mt-1.5"
                >
                  Cart is empty
                </motion.span>
              </motion.div>
            )}
          </AnimatePresence>
          )}
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-gray-200 bg-gray-100">
          <div className="flex justify-between mb-4 items-center">
            <span className="text-md text-gray-600 font-bold">{t("lbl_subTotal")}</span>
            <span className="text-lg font-bold text-gray-900">
               <span className="text-gray-400 text-sm mr-3">(Qty. {grandTotalQty})</span>
               {formatMoney(grandTotal)} MMK
            </span>
          </div>
          <button
            className="w-full py-3 bg-blue-500 hover:bg-blue-700 text-white text-sm font-semibold rounded-sm transition duration-200 cursor-pointer"
            disabled={grandTotal === 0 && loading}
            onClick={() => handleCheckout()}
          >
            {loading ? t("btnTxt_chking") : t("btnTxt_chkout")}
          </button>
        </div>
      </div>
    </div>
  );
}