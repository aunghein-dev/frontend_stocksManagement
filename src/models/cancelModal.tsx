"use client";

import { useState } from "react";
import { useModalStore } from "@/store/modalStore";
import { XCircle, CheckCircle, AlertTriangle } from "lucide-react";
import axios from "axios";
import useSales from "@/hooks/useSales";
import { useInfo } from "@/hooks/useInfo";
import { Checkbox } from "@mui/material"; 

export default function CancelConfirmationModal() {
  const API = process.env.NEXT_PUBLIC_API_URL;
  const { modalData, closeModal } = useModalStore();
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const {refresh} = useSales();
  const { business } = useInfo();

  const handleSubmit = async () => {
   // Check if the user has agreed (checkbox is checked)
    if (!agreed) {
      setError("You must confirm that you understand this action cannot be undone.");
      return;
    }

  setLoading(true);
  if (modalData && 'oldTranId' in modalData) {
    try {
      const response = await axios.delete(
        `${API}/checkout/cancel/${business?.businessId}/${modalData?.oldTranId}`,
        {
          headers: {
            "Content-Type": "application/json",
          },
        withCredentials: true,
      }
    );

    if (response.status === 200 || response.status === 201) {
      setError(null);
      refresh();
    }
  } catch (err) {
    setError("Something went wrong.");
  } finally {

    setLoading(false);
    closeModal();
  }
}
};


  return (
    <div className="fixed inset-0 flex items-center justify-center animate-fade-in">
      <div className="bg-white rounded-sm shadow-2xl w-[90%] max-w-md p-6 space-y-5 animate-fade-in">
        <div className="flex items-center gap-3">
            <div className="flex gap-1 items-center justify-between">
              <AlertTriangle className="text-yellow-500 w-6 h-6" />
              <h2 className="text-xl font-semibold text-gray-800">
                Confirm Cancellation
              </h2>
            </div>
             {loading && (
              <div className="w-7 h-7 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />)}
        </div>

        <div className="text-gray-700 text-sm space-y-1">
          <p>
            Are you sure you want to cancel the transaction for:
          </p>
          <ul className="text-sm list-disc list-inside pl-2 text-gray-600">
            <li><strong>Group:</strong> {modalData?.groupName}</li>
            <li><strong>Item ID:</strong> {modalData?.itemId}</li>
          </ul>
        </div>

        <div>
          <label htmlFor="agreeCheckbox" className="text-sm font-medium text-gray-700 mb-1 flex flex-row items-center cursor-pointer">
          <Checkbox
            id="agreeCheckbox" // Use a proper ID for the checkbox
            checked={agreed} // Control the checkbox state
            onChange={(e) => setAgreed(e.target.checked)} // Update state with true/false
            color="primary" // Optional: set a color from MUI palette
          /> 
          <span>I understand that this action cannot be undone.</span>
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
            No, Go Back
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 rounded-sm bg-red-500 hover:bg-red-600 text-white text-sm transition shadow"
          >
            <CheckCircle className="w-4 h-4" />
            {loading ? "Cancelling..." : "Yes, Cancel"}
          </button>
        </div>
      </div>
    </div>
  );
}
