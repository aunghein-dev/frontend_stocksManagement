"use client";

import { BsCashStack, BsQrCodeScan } from "react-icons/bs";
import { IoWalletOutline } from "react-icons/io5";
import { usePaymentStore } from "@/lib/stores/usePaymentStore";
import { useTranslation } from "@/hooks/useTranslation";

export default function PaymentOptions() {
  const { selectedPayment, setSelectedPayment } = usePaymentStore();
  const {t} = useTranslation();

  return (
    <div className="h-full w-full text-gray-700 flex flex-col p-2 gap-2">
      <div className="flex flex-col items-left px-1">
        <span className="text-sm font-semibold">{t("lbl_selectPayment")}</span>
      </div>

      <div
        className={`payment-option-card ${selectedPayment === 'cash' ? 'selected' : ''}`}
        onClick={() => setSelectedPayment('cash')}
      >
        <BsCashStack className="payment-option-icon" />
        <div className="flex flex-col">
          <span className="payment-option-title">{t("lbl_cash")}</span>
          <span className="payment-option-description">
            {t("msg_cash")}
          </span>
        </div>
      </div>

      <div
        className={`payment-option-card ${selectedPayment === 'qr' ? 'selected' : ''}`}
        onClick={() => setSelectedPayment('qr')}
      >
        <BsQrCodeScan className="payment-option-icon" />
        <div className="flex flex-col">
          <span className="payment-option-title">{t("lbl_qr")}</span>
          <span className="payment-option-description">
            {t("msg_qr")}
          </span>
        </div>
      </div>

      <div
        className={`payment-option-card ${selectedPayment === 'wallet' ? 'selected' : ''}`}
        onClick={() => setSelectedPayment('wallet')}
      >
        <IoWalletOutline className="payment-option-icon" />
        <div className="flex flex-col">
          <span className="payment-option-title">{t("lbl_wallet")}</span>
          <span className="payment-option-description">
            {t("msg_wallet")}
          </span>
        </div>
      </div>
    </div>
  );
}
