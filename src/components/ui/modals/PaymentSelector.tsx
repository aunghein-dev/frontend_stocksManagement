"use client";

import { ModalHeader } from "../molecules/ModalHeader";
import CustomerInfoSelected from "../molecules/CustomerInfoSelected";
import CheckoutInfo from "../molecules/CheckoutInfo";
import PaymentOptions from "../molecules/PaymentOptions";
import CheckoutCalculator from "../molecules/CheckoutCalculator";
import { useState, useEffect } from "react";
import { useCheckoutCustomer } from "@/lib/stores/useCheckoutCustomer";
import { useCheckoutPayment } from "@/lib/stores/useCheckoutPayment";
import { useTranslation } from "@/hooks/useTranslation";

interface PaymentSelectorProps {
  handleCloseSelector: () => void;
  t(key: string): string;
  grandTotal: number;
  grandTotalQty: number;
  discountAmt: number;
  handlePayNow: () => void;
  orderNo: string;
  loading: boolean;
}

export default function PaymentSelector(props : PaymentSelectorProps) {

   const [calculatorInputValue, setCalculatorInputValue] = useState<string>('');
    const { checkoutCustomer } = useCheckoutCustomer();
    const { setPaid, setChange } = useCheckoutPayment();

    const paidAmount = Number(calculatorInputValue);
    const changeAmount = paidAmount - props.grandTotal;
    const {t} = useTranslation();

  useEffect(() => {
  setPaid(paidAmount);
  setChange(changeAmount);
}, [paidAmount, changeAmount, setPaid, setChange]);

  return (
       
        <div className="relative h-[95dvh] w-full sm:w-[700px] rounded-sm shadow-xl flex flex-col border border-gray-200 animate-slide-up bg-white ">
            <ModalHeader title={t("hd_Payment")} onClick={props.handleCloseSelector} haveExitButton={true}/>
            <div className="h-full w-full sm:grid sm:grid-cols-[53%_47%] flex flex-wrap overflow-y-auto
                            custom-scrollbar">
                <div className="w-full h-full  flex flex-col"> 
                   <div className="h-[90px] flex flex-col items-left px-2 pt-1">
               
                      <CustomerInfoSelected
                        imgUrl={checkoutCustomer.imgUrl}
                        name={checkoutCustomer.name}
                        orderNo={props.orderNo}
                      />
                    </div>
                    <div className="h-auto p-2">
                      <CheckoutInfo
                        t={props.t}
                        grandTotal={props.grandTotal}
                        grandTotalQty={props.grandTotalQty}
                      />
                    </div>
                    <div className="grow">
                      <PaymentOptions/>
                    </div>
                 </div>
                 <div className="w-full h-full">
                   <CheckoutCalculator 
                    inputValue={calculatorInputValue}
                    setInputValue={setCalculatorInputValue}
                    disabled={(Number(calculatorInputValue) - props.grandTotal) > 0}
                    handlePayNow={props.handlePayNow}
                    loading={props.loading}
                   />
                 </div>
            </div>
        </div>

  );
}