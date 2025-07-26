import formatMoney from "@/components/utils/formatMoney"
import { useDiscountStore } from "@/lib/stores/useDiscountStore";

interface CheckoutBoxProps { 
  t: (key: string) => string;
  grandTotal: number;
  grandTotalQty: number;
  loading: boolean;
  handleCheckout: () => void;
}

export default function CheckoutBox({ t, grandTotal, grandTotalQty, loading, handleCheckout }: CheckoutBoxProps) {
   const {discountAmt} = useDiscountStore();
  
  return (
    <div className="w-full border-[1px] border-gray-200 rounded-xs flex flex-col p-2 text-gray-700">
      <div className="flex justify-between items-center mb-1">
        <span className="text-sm font-semibold text-gray-500">{t("lbl_subTotal")}</span>
        <span className="text-sm font-bold text-gray-500">
          {formatMoney(grandTotal)} MMK
        </span>
      </div>

      <div className="mb-2">
        <ul className="text-xs text-gray-400 pb-2 border-b-[1px] border-gray-200 flex gap-1.5 flex-col">
          <li className="flex justify-between"> 
            <span>{t("lbl_tax")}</span>
            <span>0 MMK</span>
          </li>
          <li className="flex justify-between">
            <span>{t("hd_discount")}</span>
            <span>{formatMoney(discountAmt)} MMK</span>
          </li>
        </ul>
      </div>
     
     
      <div className="flex justify-between items-center mb-2">
        <span className="text-md font-semibold">{t("lbl_grandTotal")}</span>
        <span className="text-md font-bold text-gray-900">
          <span className="text-gray-400 text-xs mr-3">(Qty. {grandTotalQty})</span>
          {formatMoney(grandTotal-discountAmt)} MMK
        </span>
      </div>

      
       <div className="flex justify-end mt-auto"> {/* mt-auto pushes it to the bottom if there's extra space */}
        <button
          className="py-2.5 px-4 bg-blue-600 hover:bg-blue-700 
                     text-white text-sm font-semibold rounded-xs 
                     transition duration-200 cursor-pointer"
          disabled={grandTotal === 0 || loading}
          onClick={() => handleCheckout()}
        >
          {loading ? t("btnTxt_chking") : t("btnTxt_chkout")}
        </button>
      </div>
    </div>
  )
}