"use client";

import { useState, useEffect } from "react";
import { useModalStore } from "@/store/modalStore"; 
import { RefundModelData } from "@/store/modal.data";
import { Save, ArrowLeftCircle } from "lucide-react";
import axios from "axios";
import useSales from "@/hooks/useSales";
import { useInfo } from "@/hooks/useInfo";
import { useTranslation } from "@/hooks/useTranslation";

export default function RefundModal() {
  const API = process.env.NEXT_PUBLIC_API_URL;
  const { modalData, closeModal } = useModalStore();

  // Initialize form with a default RefundModelData structure.
  // Use a type assertion to ensure TypeScript knows the type of 'form'.
  const [form, setForm] = useState<RefundModelData>(() => {
    // Check if modalData is of type RefundModelData and has oldTranId to ensure it's not StockDeleteModelData
    if (modalData && 'oldTranId' in modalData) {
      return { ...modalData };
    }
    // Default initial state if modalData is null or not RefundModelData
    return {
      oldTranId: 0,
      groupName: "",
      oldQty: 0,
      itemId: 0,
    };
  });

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { refresh } = useSales();
  const { business } = useInfo();
  const { t } = useTranslation();

  // Use useEffect to update the form state when modalData changes
  // This is crucial because `useState`'s initial value is only set once.
  useEffect(() => {
    if (modalData && 'oldTranId' in modalData) {
      setForm(modalData);
      setError(null); // Clear any previous errors when new data comes in
    } else {
      // Reset form if modalData is not for refund (e.g., when modal closes)
      setForm({ oldTranId: 0, groupName: "", oldQty: 0, itemId: 0 });
    }
  }, [modalData]); // Dependency array: run this effect whenever modalData changes

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    // Ensure that the value is a number if the field is oldQty
    const newValue = name === "oldQty" ? Number(value) : value;
    setForm((prevForm) => ({ ...prevForm, [name]: newValue }));
    setError(null); // Clear error on change
  };

  const handleSubmit = async () => {
    // Type guard: Ensure modalData is RefundModelData before proceeding
    if (!modalData || !('oldTranId' in modalData)) {
      setError("Invalid modal data for refund operation.");
      return;
    }

    setLoading(true);

    // Validate form input
    if (form.oldQty <= 0 || form.oldQty > modalData.oldQty) {
      setError(`Please enter a valid refund quantity between 1 and ${modalData.oldQty}.`);
      setLoading(false);
      return;
    }
    if (form.oldQty === modalData.oldQty) {
        setError("Quantity to refund cannot be the same as the original quantity.");
        setLoading(false);
        return;
    }

    try {
      const response = await axios.put(
        `${API}/checkout/refund/${business?.businessId}/${modalData.oldTranId}/${form.oldQty}`,
        {}, // The request body should be an empty object if no data is sent with PUT, or pass relevant data. Headers go in the config.
        {
          withCredentials: true,
          headers: { // Headers moved inside the config object
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 200 || response.status === 201) {
        setError(null); // Successfully processed
        refresh();
      } else {
        setError("Something went wrong during refund processing.");
      }
    } catch (err) {
      console.error("Refund error:", err);
      setError("Failed to process refund. Please try again.");
    } finally {
      setLoading(false);
      closeModal(); // Close modal regardless of success or failure
    }
  };

  // Helper to check if modalData is RefundModelData
  const isRefundData = (data: typeof modalData): data is RefundModelData => {
    return data !== null && 'oldTranId' in data && typeof data.oldTranId === 'number';
  };

  const currentModalData = isRefundData(modalData) ? modalData : null;

  return (
    <div className="fixed inset-0 flex items-center justify-center animate-fade-in z-50"> {/* Added z-50 */}
      <div className="bg-white rounded-lg shadow-2xl w-[90%] max-w-md p-6 space-y-5 animate-fade-in "> {/* Increased rounded corners, added border */}
        <div className="flex items-center gap-3 justify-between">
          <div className="flex gap-2 items-center"> {/* Adjusted gap and removed redundant justify-between */}
              <Save className="text-green-600 w-7 h-7" /> {/* Increased icon size */}
              <h2 className="text-xl font-semibold text-gray-800">
                {t("hd_refundQty")}
              </h2>
          </div>
          {loading && (
              <div className="w-6 h-6 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />)} {/* Adjusted spinner size */}
        </div>

        {currentModalData ? (
            <div className="text-gray-700 text-sm space-y-1">
                <p>{t("msg_rfQtyFor")}</p>
              <ul className="text-sm list-none pl-4 text-gray-600 space-y-1 mt-4">
                <li><strong>{t("lbl_groupLbl")}:</strong> {currentModalData.groupName}</li>
                <li><strong>{t("lbl_relateSubItemId")}:</strong> {currentModalData.itemId}</li>
                <li><strong>{t("lbl_soldQty")}:</strong> {currentModalData.oldQty}</li>
              </ul>

            </div>
        ) : (
            <div className="text-gray-700 text-sm">Loading refund details...</div>
        )}

        <div>
          <label htmlFor="oldQty" className="block text-sm font-medium text-gray-700 mb-1">
            {t("lbl_qtyToRefund")} ({t("lbl_max")}: {currentModalData?.oldQty || 0})
          </label>
          <input
            type="number"
            name="oldQty"
            min={1}
            max={currentModalData?.oldQty || 0} // Ensure max is set correctly
            value={form.oldQty === 0 ? "" : form.oldQty} // Display empty string for 0 to allow typing
            onChange={handleChange}
            className="w-full p-2.5 text-sm border border-gray-300 rounded-sm focus:ring-[1.5px] focus:ring-green-400 focus:outline-none transition-all duration-200 ease-in-out"
            placeholder="Enter quantity"
          />
          {error && <p className="text-red-600 text-xs mt-1 font-medium">{error}</p>} {/* Added font-medium */}
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button
            onClick={closeModal}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 rounded-sm bg-gray-100 hover:bg-gray-200 border border-gray-300 text-gray-700 text-sm transition-all duration-200 ease-in-out shadow-sm hover:shadow-md" /* Added rounded-sm, shadow */
          >
            <ArrowLeftCircle className="w-4 h-4" />
            {t("btnTxt_cancel")}
          </button>
          <button
            onClick={handleSubmit}
            disabled={
                loading ||
                !currentModalData || // Disable if no valid modal data
                form.oldQty <= 0 ||
                form.oldQty > currentModalData.oldQty ||
                form.oldQty === currentModalData.oldQty // Disable if entered quantity is the same as original
            }
            className="flex items-center gap-2 px-4 py-2 rounded-sm bg-green-500 hover:bg-green-600 text-white text-sm transition-all duration-200 ease-in-out shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed" 
          >
            <Save className="w-4 h-4" />
            {loading ? t("btnTxt_saving") : t("btnTxt_conRefund")}
          </button>
        </div>
      </div>
    </div>
  );
}