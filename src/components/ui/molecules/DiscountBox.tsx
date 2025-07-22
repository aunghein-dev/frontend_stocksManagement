"use client";

import { useEffect, useState } from "react";
import { FiGift } from "react-icons/fi";
import { useDiscountStore } from "@/lib/stores/useDiscountStore";
import { useTranslation } from "@/hooks/useTranslation";

export default function DiscountBox() {
  const { discountAmt, setDiscountAmt, resetDiscount } = useDiscountStore();

  const [localDiscountInput, setLocalDiscountInput] = useState<string>(
    discountAmt === 0 ? '' : discountAmt.toString()
  );

  const [isApplied, setIsApplied] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
  setLocalDiscountInput(discountAmt === 0 ? '' : discountAmt.toString());
  setIsApplied(false);
}, [discountAmt]); 


 const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const value = e.target.value;
  if (/^\d*\.?\d*$/.test(value)) {
    setLocalDiscountInput(value);
    setIsApplied(false);
  }
};


  const handleApplyClick = () => {
    const amountToApply = Number(localDiscountInput);
    if (!isNaN(amountToApply) && amountToApply >= 0) {
      setDiscountAmt(amountToApply);
      setIsApplied(true);
      console.log("✅ Discount applied:", amountToApply);
    } else {
      setLocalDiscountInput('');
      resetDiscount();
      setIsApplied(false);
    }
  };

  return (
    <div className="w-full border-[1px] border-gray-200 rounded-xl flex flex-col p-2 text-gray-700 justify-between">
      <div className="flex flex-row items-center gap-0.5 text-center">
        <FiGift className="w-7 h-7 text-blue-400 ring-1 ring-blue-100 rounded-full p-1" />
        <span className="text-md font-semibold ml-1">{t("hd_discount")}</span>
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-xs px-0.5 text-gray-40">
         {t("msg_discount")}
        </span>
        <div className="flex flex-row items-center gap-2 justify-center text-center mt-1">
          <input
            type="text"
            inputMode="decimal"
            value={localDiscountInput}
            onChange={handleInputChange}
            className="w-full border-[1px] border-gray-200 rounded-lg px-3 py-2 text-sm"
            placeholder={t("lbl_enterAmount")}
          />

          <button
            onClick={handleApplyClick}
            disabled={localDiscountInput === ''}
            className="bg-blue-500 hover:bg-blue-600 text-white border-[0.5px] border-blue-600 text-sm py-2 px-2 rounded-lg transition-all duration-200 cursor-pointer font-semibold h-full whitespace-nowrap"
          >
            {isApplied ? t("btnTxt_applied") : t("btnTxt_apply")}
          </button>
        </div>
      </div>
    </div>
  );
}
