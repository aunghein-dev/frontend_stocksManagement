
"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { motion } from "framer-motion";
import Image from "next/image"; // Only needed for the empty cart SVG here
import { mutate as globalMutate } from 'swr'; 
import { useCartStore } from "@/lib/stores/useCartStore";
import { useStocks } from "@/hooks/useStocks";
import { useTranslation } from "@/hooks/useTranslation";

import PopupVouncher from "../voucherPopup"; // Assuming this is in the same directory or adjust path
import CustomerSelector from "./CustomerSelector"; // Assuming this is in './modals' or adjust path
import PaymentSelector from "./PaymentSelector"; // Assuming this is in './modals' or adjust path

import { ModalHeader } from "../molecules/ModalHeader";
import CartCusSelected from '@/components/ui/molecules/CartCusSelected'; // Adjust path if different
import DiscountBox from "../molecules/DiscountBox";
import CheckoutBox from "../molecules/CheckoutBox";
import CartItemDisplay from "../molecules/CartItemDisplay"; // New component for individual cart items
import { Stock } from "@/types/stock.types";
import { useInfo } from "@/hooks/useInfo";
import axios from "axios";
import useCheckoutCustomer from "@/lib/stores/useCheckoutCustomer";

import { useDiscountStore } from "@/lib/stores/useDiscountStore";
import { usePaymentStore } from "@/lib/stores/usePaymentStore";
import { useCheckoutPayment } from "@/lib/stores/useCheckoutPayment";
import useOrderNo from "@/lib/stores/useOrderNo";
import { CartGroup, CartItem } from "@/lib/classes/Cart";
import { useUser } from "@/hooks/useUser";


// --- Type Definitions ---
// Define these types globally or in a shared types file if used elsewhere
type VoucherData = {
  groupId: number;
  name: string;
  price: number;
  quantity: number;
  subTotal: number;
};

type CartPopupProps = {
  handleToggle: () => void;
};

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

// --- Main CartPopup Component ---
export default function Cart({ handleToggle }: CartPopupProps) {
  const { cart, addItem, removeItem, deleteItem, clearCart, total, totalQty } = useCartStore();

  const grandTotalQty = totalQty;
  const [outOfStockItemId, setOutOfStockItemId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false); // Consider if this loading is still needed here
  const { items: stocks } = useStocks(); 
  const { business } = useInfo();
  const { data } = useUser();
  const { t } = useTranslation();
  const {discountAmt } = useDiscountStore();
  const [showVouncher, setShowVouncher] = useState(false);
  const [voucherData, setVoucherData] = useState<VoucherData[]>([]);
  const voucherGrand = useMemo(() => voucherData.reduce((acc, item) => acc + item.subTotal, 0), [voucherData]);

  const [showCustomerSelector, setCustomerSelector] = useState(false);
  const [openPayment, setOpenPayment] = useState(false);

  const { orderNo, setOrderNo } = useOrderNo();

  const grandTotal = total;
  const API = process.env.NEXT_PUBLIC_API_URL;
  const { checkoutCustomer } = useCheckoutCustomer();

  function generateUUID() {
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        const r = (Math.random() * 16) | 0;
        const v = c === 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
      });
  }

  // --- Handlers ---
  const handleCustomerSwitch = useCallback(() => {
    setCustomerSelector(true);
  }, []);

  const handleCloseCustomerSelector = useCallback(() => {
    setCustomerSelector(false);
  }, []);

 const handleCheckout = useCallback(() => {
  const uuid = generateUUID();
  setOrderNo({ orderNo: uuid});
  setOpenPayment(true);
}, [setOrderNo]);


  const isOutOfStock = useCallback((groupId: number, itemId: number): boolean => {
    const existingCountInCart =
      cart
        .find((g) => g.groupId === groupId)
        ?.item.find((i) => i.itemId === itemId)?.boughtQty || 0;

    const availableQty =
      stocks
        .find((s: Stock) => s.groupId === groupId)
        ?.items.find((i: Stock["items"][0] ) => i.itemId === itemId)?.itemQuantity || 0;

    return availableQty - existingCountInCart <= 0;
  }, [cart, stocks]);

  const handleClickAdd = useCallback((group: CartGroup, item: CartItem) => { // Use specific types if available
    if (isOutOfStock(group.groupId, item.itemId)) {
      setOutOfStockItemId(`${group.groupId}-${item.itemId}`);
      return;
    }
    addItem(group.groupId, group.groupName, {
      ...item,
      boughtQty: 1,
    });
  }, [addItem, isOutOfStock]);

  const handlePayNow = useCallback(async () => {
   
     const discountAmt = useDiscountStore.getState().discountAmt;
     const selected = usePaymentStore.getState().selectedPayment;
     const change = useCheckoutPayment.getState().change;
     const orderNo = useOrderNo.getState().orderNo;

     try {
      setLoading(true);

      const formData = new FormData();
    
      const tempJson: SalesProps[] = [];

      cart.forEach((group) => {
        group.item.forEach((item) => {
          tempJson.push({
            tranDate: new Date().toISOString(),
            batchId: orderNo.orderNo,
            stkGroupId: group.groupId,
            stkGroupName: group.groupName,
            stkItemId: item.itemId,
            checkoutQty: item.boughtQty,
            itemUnitPrice: item.unitPrice,
            subCheckout: item.unitPrice * item.boughtQty,
            tranUserEmail: data?.username || "",
            bizId: business.id || 0,
          });
        });
      });

      const paymentRelate = {
        relateBizId: business.businessId,
        relateBatchId: orderNo.orderNo,
        relateCid: checkoutCustomer.cid,
        relateDiscountAmt: discountAmt,
        relatePaymentType: selected,
        relateChange: change + discountAmt,
        relateFinalIncome: grandTotal-discountAmt
      }

      formData.append("tempJson", new Blob([JSON.stringify(tempJson)], { type: "application/json" }));
      formData.append("paymentRelate", new Blob([JSON.stringify(paymentRelate)], { type: "application/json" }));
     
      const response = await axios.post(`${API}/checkout/${business.businessId}`, formData, {
        withCredentials: true,
      });

      if (response.status === 200) {
        const voucher = tempJson.map((group) => ({
          groupId: group.stkGroupId,
          name: group.stkGroupName,
          price: group.itemUnitPrice,
          quantity: group.checkoutQty,
          subTotal: group.subCheckout,
        }));

        setVoucherData(voucher);
        clearCart(); 
        setShowVouncher(true);

        const stocksFilteredKey = `${API}/stkG/biz/nonZero/${business.businessId}`;
        globalMutate(stocksFilteredKey, undefined, true); 
      }
      

    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }

  }, [business.id ,API, business.businessId, cart, clearCart, checkoutCustomer.cid, grandTotal, data?.username]);

  // --- Effects ---
  useEffect(() => {
    if (outOfStockItemId !== null) {
      const timer = setTimeout(() => {
        setOutOfStockItemId(null);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [outOfStockItemId]);

  // --- Conditional Renders (Early Returns) ---
  if (showVouncher) {
    return (
      <PopupVouncher
       
        data={voucherData}
        grandTotal={voucherGrand}
        handleToggle={handleToggle}
      />
    );
  }

  if (showCustomerSelector) {
    return (
      <CustomerSelector handleCloseSelector={handleCloseCustomerSelector} />
    );
  }

  // --- Render Cart Popup ---
  return (
    <div
      className="fixed inset-0 backdrop-blur-[1px] flex items-center justify-center px-2 z-60 overflow-hidden"
      style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
    >
      {openPayment ? (
        <PaymentSelector handleCloseSelector={() => setOpenPayment(false)} 
                         t={t}
                         loading={loading}
                         grandTotal={grandTotal}
                         grandTotalQty={grandTotalQty}
                         discountAmt={discountAmt}
                         handlePayNow={handlePayNow}
                         orderNo={orderNo.orderNo}
                  />
      ) : (
        <div className="relative h-[95dvh] w-full sm:w-[700px] rounded-lg shadow-xl flex flex-col border border-gray-200 animate-slide-up bg-white">
          <ModalHeader title={t("hd_shoppingCart")} onClick={handleToggle} haveExitButton={true} />
          <CartCusSelected handleCustomerSwitch={handleCustomerSwitch} />

          <div className="flex flex-row h-[calc(100%-137px)] sm:h-[calc(100%-144px)] min-w-full">
            <div className="flex flex-col h-full w-full">
              {loading && (
                <div className="absolute top-4 right-12">
                  <div className="w-7 h-7 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                </div>
              )}

              {/* Cart Items List */}
              <div className="flex-1 overflow-auto p-1 space-y-4 custom-scrollbar mt-3">
                <div>
                  {cart.length > 0 ? (
                    cart.map((group, index) => (
                      <motion.section
                        key={group.groupId}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                        className="relative p-1 border border-gray-200 rounded-sm shadow-xs"
                      >
                        <h3 className="text-md font-semibold text-gray-700 mb-3 mx-3 mt-1">
                          <span>#{index + 1}. {" "}{group.groupName}</span>
                        </h3>
                        <ul className="space-y-1.5">
                          {group.item.map((item) => (
                            <CartItemDisplay
                              key={item.itemId}
                              group={group}
                              item={item}
                              outOfStockItemId={outOfStockItemId}
                              handleClickAdd={handleClickAdd}
                              removeItem={removeItem}
                              deleteItem={deleteItem}
                              t={t}
                            />
                          ))}
                        </ul>
                      </motion.section>
                    ))
                  ) : (
                    <motion.div
                      key="empty-cart"
                      initial={{ opacity: 0, scale: 0.9, y: 100 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9, y: 100 }}
                      transition={{ duration: 0.7, ease: "easeOut" }}
                      className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
                    >
                      <Image
                        src="/noitemsincart.svg"
                        alt="Empty Cart"
                        aria-label="Empty Cart"
                        width={250}
                        height={250}
                        unoptimized
                        className="mx-auto"
                      />
                      <motion.span
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, ease: "easeOut", delay: 0.2 }}
                        className="block text-center text-gray-500 font-bold text-md mt-1.5"
                      >
                        {t("lbl_cartEmpty")}
                      </motion.span>
                    </motion.div>
                  )}
                </div>
              </div>

              {/* Checkout Footer */}
              <div className="h-[180px] border-t border-gray-200
                              sm:grid sm:grid-cols-[40%_59.5%] py-2.5 px-2 sm:gap-1
                              flex flex-col gap-2.5 custom-scrollbar shrink-0 w-full
                              sm:overflow-hidden overflow-auto">
                <DiscountBox />
                <CheckoutBox
                  t={t}
                  grandTotalQty={grandTotalQty}
                  grandTotal={grandTotal}
                  loading={loading}
                  handleCheckout={handleCheckout}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
