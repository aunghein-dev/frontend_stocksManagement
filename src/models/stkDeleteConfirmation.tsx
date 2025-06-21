"use client";

import { useState } from "react";
import { useModalStore } from "@/store/modalStore";
import { XCircle, CheckCircle, AlertTriangle } from "lucide-react";
import axios from "axios";
import { useStocks } from "@/hooks/useStocks";


export default function DeleteStockConfirmation() {
  const API = process.env.NEXT_PUBLIC_API_URL;
  const { modalData, closeModal } = useModalStore();
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const {refresh} = useStocks();


  const handleSubmit = async () => {
  if (reason.trim() !== modalData?.groupName.trim()) {
    setError("Your input and group name do not match.");
    return;
  }

  setLoading(true);
if (modalData && 'groupId' in modalData){
  try {
    const response = await axios.delete(
      `${API}/delete/stkItem/${modalData.groupId}/${(modalData.itemId as string).replace('I-', '')}`,
      {
        withCredentials: true,
        headers: { "Content-Type": "application/json" },
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
                Confirm Items Deletion
              </h2>
            </div>
             {loading && (
              <div className="w-7 h-7 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />)}
        </div>

        <div className="text-gray-700 text-sm space-y-1">
          <p>
            Are you sure you want to delete the stock for:
          </p>
          <ul className="text-sm list-disc list-inside pl-2 text-gray-600">
            <li><strong>Group:</strong> {modalData?.groupName}</li>
            <li><strong>Item ID:</strong> {(modalData?.itemId as string)?.replace('I-', '')}</li>
          </ul>
        </div>

        <div>
          <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-1">
            Retype the Group Name
          </label>
          <input
            type="text"
            name="reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full p-2.5 text-sm border border-gray-300 rounded-sm focus:ring-2 focus:ring-red-400 focus:outline-none"
            placeholder={`eg. ${modalData?.groupName}`}
          />
          {error && <p className="text-red-600 text-xs mt-1">{error}</p>}
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
            {loading ? "Deleting..." : "Yes, Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}
