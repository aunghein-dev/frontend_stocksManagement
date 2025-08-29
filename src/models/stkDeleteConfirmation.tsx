// src/app/stocks/DeleteStockConfirmation.tsx
"use client";

import { useState } from "react";
import { useModalStore } from "@/store/modalStore";
import { XCircle, CheckCircle, AlertTriangle } from "lucide-react";
import axios from "axios";
import { useStocks } from "@/hooks/useStocks";
import { Checkbox } from "@mui/material";
import { useTranslation } from "@/hooks/useTranslation";
import { isStockDeleteModelData } from "@/components/utils/typeGuard"; 


export default function DeleteStockConfirmation() {
  const API = process.env.NEXT_PUBLIC_API_URL;
  const { modalData, closeModal } = useModalStore();
  // Changed 'reason' to a boolean to track checkbox state
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { refresh, removeStockItem } = useStocks();


  const handleSubmit = async () => {
  if (!agreed) {
    setError("You must confirm that you understand this action cannot be undone.");
    return;
  }

  setLoading(true);

  if (modalData && "groupId" in modalData) {
    try {
        const response = await axios.delete(
          `${API}/delete/stkItem/${modalData.groupId}/${(modalData.itemId as string).replace("I-", "")}`,
          { withCredentials: true }
        );

        if (response.status === 200 || response.status === 201) {
          setError(null);
          // ✅ Optimistically update cache
          removeStockItem(
            modalData.groupId,
            parseInt((modalData.itemId as string).replace("I-", ""))
          );

          // Optionally revalidate in background (silent refresh)
          refresh();
        } else {
          setError("Deletion request sent, but received an unexpected server response.");
        }
      } catch (err) {
        console.error("Deletion error:", err);
        setError("An unknown error occurred during deletion.");
      } finally {
        setLoading(false);
        closeModal();
      }
    }
  };

  const { t } = useTranslation();

  return (
    <div className="fixed inset-0 flex items-center justify-center animate-fade-in z-50"> {/* Added z-50 to ensure it's on top */}
      <div className="bg-white rounded-lg shadow-2xl w-[90%] max-w-md p-6 space-y-5 animate-fade-in">
        <div className="flex items-center justify-between"> {/* Adjusted for better alignment */}
            <div className="flex gap-2 items-center"> {/* Use gap for spacing */}
              <AlertTriangle className="text-yellow-500 w-6 h-6" />
              <h2 className="text-xl font-semibold text-gray-800">
                {t("hd_stkDelete")}
              </h2>
            </div>
             {loading && (
              <div className="w-7 h-7 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />)}
        </div>

        <div className="text-gray-700 text-sm space-y-1">
          <p>
            {t("msg_stkDltConfirm")}
          </p>
          {isStockDeleteModelData(modalData) && (
          <ul className="text-sm list-inside pl-2 text-gray-600 mt-4 space-y-1 list-none">
            <li><strong>{t("lbl_groupLbl")}:</strong> {modalData?.groupName}</li>
            <li><strong>{t("lbl_relateSubItemId")}:</strong> {(modalData?.itemId as string)?.replace('I-', '')}</li>
          </ul>
          )}
        </div>

        <div>
          <label htmlFor="agreeCheckbox" className="text-sm font-medium text-gray-700 mb-1 flex flex-row items-center cursor-pointer">
            <Checkbox
              id="agreeCheckbox" // Use a proper ID for the checkbox
              checked={agreed} // Control the checkbox state
              onChange={(e) => setAgreed(e.target.checked)} // Update state with true/false
              color="primary" // Optional: set a color from MUI palette
            /> 
            <span>{t("msg_agreedDlt")}</span>
          </label>
          {error && <p className="text-red-600 text-xs mt-2 ml-3">{error}</p>}
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button
            onClick={closeModal}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 rounded-sm bg-gray-100 hover:bg-gray-200 border border-gray-300 text-gray-700 text-sm transition"
          >
            <XCircle className="w-4 h-4" />
            {t("btnTxt_goBack")}
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || !agreed} // Disable if loading or not agreed
            className={`flex items-center gap-2 px-4 py-2 rounded-sm text-white text-sm transition shadow ${
              loading || !agreed ? "bg-red-300 cursor-not-allowed" : "bg-red-500 hover:bg-red-600"
            }`}
          >
            <CheckCircle className="w-4 h-4" />
            {loading ? t("btnTxt_dlting") : t("btnTxt_yesDlt")}
          </button>
        </div>
      </div>
    </div>
  );
}