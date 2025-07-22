// components/molecules/CheckoutInfo.tsx
"use client";

import formatMoney from "@/components/utils/formatMoney";
import { useCheckoutPayment } from "@/lib/stores/useCheckoutPayment";
import { useDiscountStore } from "@/lib/stores/useDiscountStore";

interface CheckoutInfoProps {
  t: (key: string) => string;
  grandTotal: number;
  grandTotalQty: number;
}

export default function CheckoutInfo({
  grandTotal,
  grandTotalQty,
  t
}: CheckoutInfoProps) {
  const { paid, change } = useCheckoutPayment();
  const { discountAmt } = useDiscountStore();
  const customStyle = () => {
    return change+discountAmt > 0 ? "text-green-400" : "text-red-600";
  };

  return (
    <div className="relative w-full border-[1px] border-gray-200 rounded-xl flex flex-col px-3 py-4 text-gray-700">
      <div className="flex justify-between items-center mb-1">
        <span className="text-[0.9rem] font-semibold">{t("lbl_subTotal")}</span>
        <span className="text-[0.9rem] font-bold text-gray-900">
          <span className="text-gray-400 text-[0.8rem] mr-3">(Qty. {grandTotalQty})</span>
          {formatMoney(grandTotal-discountAmt)} MMK
        </span>
      </div>

     
      

      <div className="flex justify-between items-center mb-1 text-green-400">
        <span className="text-[0.7rem] font-semibold">{t("hd_discount")}</span>
        <span className="text-[0.7rem] font-bold">
          {formatMoney(discountAmt)} MMK
        </span>
      </div>

      <div className="flex justify-between items-center mb-1 text-gray-400">
        <span className="text-[0.9rem] font-semibold">{t("lbl_paid")}</span>
        <span className="text-[0.9rem] font-bold">
          {formatMoney(paid)} MMK
        </span>
      </div>

      <div className={`flex justify-between items-center ${customStyle()}`}>
        <span className="text-[0.95rem] font-semibold">{t("lbl_change")}</span>
        <span className={`text-[0.95rem] font-bold ${customStyle()}`}>
          {formatMoney(change+discountAmt)} MMK
        </span>
      </div>
    </div>
  );
}
