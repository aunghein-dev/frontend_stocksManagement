// src/components/modals/DeleteCustomer.tsx
// (Reverting to its original name and purpose, but now explicitly a modal component)

"use client";

import { useState } from "react";
import { useModalStore } from "@/store/modalStore";
import { XCircle, CheckCircle, AlertTriangle } from "lucide-react";
import axios from "axios";
import { useCustomer } from "@/hooks/useCustomer";
import { Checkbox } from "@mui/material";
import { useTranslation } from "@/hooks/useTranslation";
import { type Customer } from "@/components/data-display/customerCard"; // Import Customer type

// Type guard for better safety, confirming modalData is a Customer type
function isCustomerDataForDelete(data: unknown): data is Customer {
  return (
    !!data &&
    typeof data === "object" &&
    "cid" in data &&
    typeof (data as Customer).cid === "string" &&
    "name" in data &&
    typeof (data as Customer).name === "string"
    // Add other checks if necessary, e.g., 'rowId' in data etc.
  );
}

export default function DeleteCustomer() {
  const API = process.env.NEXT_PUBLIC_API_URL; // Ensure this is correctly configured
  const { modalData, closeModal } = useModalStore(); // Get modalData directly
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { refresh } = useCustomer(); // For refreshing the customer list after deletion
  const { t } = useTranslation();

  // Extract customer data from modalData
  const customerToDelete = isCustomerDataForDelete(modalData) ? modalData : null;

  const handleSubmit = async () => {
    if (!agreed) {
      setError(t("msg_agreedDlt"));
      return;
    }

    if (!customerToDelete) {
      setError("Customer data is missing for deletion.");
      return;
    }

    setLoading(true);
    setError(null); // Clear previous errors
    console.log(customerToDelete.bizId);
    console.log(customerToDelete.cid);
    
    try {
      // Use customerToDelete.cid and customerToDelete.name directly
      const response = await axios.delete(
        `${API}/customer/delete/biz/${customerToDelete.bizId}/cid/${customerToDelete.cid}`, 
        {
          withCredentials: true,
          headers: { "Content-Type": "application/json" },
        }
      );

      if (response.status === 200 || response.status === 201) {
        refresh(); // Refresh customer list on success
        closeModal(); // Close the modal
      } else {
        setError("Deletion request sent, but received an unexpected server response.");
      }
    } catch (err) {
      console.error("Deletion error:", err);
      if (axios.isAxiosError(err) && err.response) {
        setError(err.response.data?.message || "Failed to delete item due to a server error.");
      } else {
        setError("An unknown error occurred during deletion.");
      }
    } finally {
      setLoading(false);
      // closeModal() is called on success. If you want it to close on any API finish,
      // move it here. For errors, often you want the user to see the error first.
    }
  };

  return (
    // Backdrop overlay and dialog container. This whole div is your modal content.
    <div className="fixed inset-0 bg-black/20 bg-opacity-50 flex items-center justify-center animate-fade-in z-[9999]">
      <div className="bg-white rounded-lg shadow-2xl w-[90%] max-w-md p-6 space-y-5 animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex gap-2 items-center">
            <AlertTriangle className="text-yellow-500 w-6 h-6" />
            <h2 className="text-xl font-semibold text-gray-800">
              {t("hd_deleteCus")} {/* Assuming this translates to "Delete Customer" or similar */}
            </h2>
          </div>
          {loading && (
            <div className="w-7 h-7 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          )}
        </div>

        {/* Dynamic Content based on customerToDelete */}
        {customerToDelete ? (
          <div className="text-gray-700 text-sm space-y-1">
            <p>{t("msg_stkDltConfirm")}</p>
            <ul className="text-sm list-inside pl-2 text-gray-600 mt-4 space-y-1 list-none">
              <li>
                <strong>{t("lbl_cid")}:</strong> {customerToDelete.cid}
              </li>
              <li>
                <strong>{t("custName")}:</strong>{" "}
                {customerToDelete.name.replace("I-", "")}
              </li>
            </ul>
          </div>
        ) : (
          <p className="text-red-600">Error: Customer data not found. Cannot proceed with deletion.</p>
        )}

        {/* Agreement Checkbox */}
        <div>
          <label
            htmlFor="agreeCheckbox"
            className="text-sm font-medium text-gray-700 mb-1 flex flex-row items-center cursor-pointer"
          >
            <Checkbox
              id="agreeCheckbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              color="primary"
            />
            <span>{t("msg_agreedDlt")}</span>
          </label>
          {error && <p className="text-red-600 text-xs mt-2 ml-3">{error}</p>}
        </div>

        {/* Action Buttons */}
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
            disabled={loading || !agreed || !customerToDelete} 
            className={`flex items-center gap-2 px-4 py-2 rounded-sm text-white text-sm transition shadow ${
              loading || !agreed || !customerToDelete ? "bg-red-300 cursor-not-allowed" : "bg-red-500 hover:bg-red-600"
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