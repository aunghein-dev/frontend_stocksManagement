// src/app/stocks/page.tsx
"use client";

import React, { useState, ChangeEvent, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import axios from "axios";
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import { useInfo } from "@/hooks/useInfo";
import dayjs from "dayjs";
import imgDataURLtoFile from "@/components/utils/imgDataURLtoFile";
import ImageUploadComponent from "@/components/common/ImageUploadComponent"; // Import the reusable component
import { XMarkIcon } from '@heroicons/react/24/outline'; // For remove item button
import { useRouter } from "next/navigation";
import { useModalStore } from "@/store/modalStore"; 

// --- Type Definitions ---
type NewStockItem = {
  tempId: number; // Use a temporary client-side ID for list keys
  itemImage: string | null; // Data URL for preview, or null if no image/removed
  itemColorHex: string;
  itemQuantity: number;
  _tempFile?: File | null; // Holds the actual File object if selected
  _imageError?: string | null; // Client-side image specific error
};

type NewStockGroup = {
  groupImage: string | null; // Data URL for preview, or null if no image/removed
  groupName: string;
  groupUnitPrice: number;
  releasedDate: string; // YYYY-MM-DD format
  items: NewStockItem[];
};

// --- Helper for Initial Form State ---
const getInitialFormState = (): NewStockGroup => ({
  groupImage: null, // Start with no image
  groupName: "",
  groupUnitPrice: 0,
  releasedDate: dayjs(new Date()).format('YYYY-MM-DD'),
  items: [],
});

// --- Main Component ---
export default function StockEntryForm() {
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

  // --- State Management ---
  const [form, setForm] = useState<NewStockGroup>(getInitialFormState);
  const [submitting, setSubmitting] = useState(false);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [groupImageError, setGroupImageError] = useState<string | null>(null); // Specific error for group image
  const [selectedGroupFile, setSelectedGroupFile] = useState<File | null>(null); // Actual File object for group image

  // Use the useInfo hook to get business details
  const { business, isLoading: isBusinessInfoLoading, error: businessInfoError } = useInfo();
  const router = useRouter();
  // --- Effects ---


   const { openModal, closeModal } = useModalStore(); 
  
    // This useEffect controls the modal's open/close state
    useEffect(() => {
      let timer: NodeJS.Timeout | null = null;
      if(isBusinessInfoLoading || !business) {
        // Open the loading modal immediately when loading starts
        openModal("loading");
      } else {
        // Close the modal after a short delay when loading finishes
        // This prevents flickering if the load is very fast
        timer = setTimeout(() => {
          closeModal();
        }, 100); // FETCH_MODAL_DELAY = 100ms
      }
  
      // Cleanup function to clear the timer if the component unmounts
      return () => {
        if (timer) {
          clearTimeout(timer);
        }
      };
    }, [isBusinessInfoLoading, openModal, closeModal]); // Dependencies

  // Effect to manage alert visibility
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (showSuccessAlert || submissionError) {
      timer = setTimeout(() => {
        setShowSuccessAlert(false);
        setSubmissionError(null);
      }, 3000);
    }
    return () => clearTimeout(timer);
  }, [showSuccessAlert, submissionError]);

  // --- Memoized Callbacks ---

  // Handles adding a new item variant to the form
  const addItem = useCallback(() => {
    setForm((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        {
          tempId: Date.now(), // Unique client-side key
          itemImage: null, // Start with no image
          itemColorHex: "#000000",
          itemQuantity: 1,
          _tempFile: null,
          _imageError: null,
        },
      ],
    }));
  }, []);

  // Handles updating a specific field of an item variant
  const updateItem = useCallback((index: number, key: keyof NewStockItem, value: string | number) => {
    setForm((prev) => {
      const updatedItems = [...prev.items];
      // Type assertion for dynamically setting properties that might include internal ones
      (updatedItems[index] as any)[key] = value;
      return { ...prev, items: updatedItems };
    });
  }, []);

  // Handles image selection for the main group image
  const handleGroupImageSelected = useCallback((file: File | null) => {
    setGroupImageError(null); // Clear previous errors
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // Example: 2MB limit
        setGroupImageError("Group image must be less than 2MB.");
        setSelectedGroupFile(null);
        setForm(prev => ({ ...prev, groupImage: null }));
        return;
      }
      setSelectedGroupFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setForm(prev => ({ ...prev, groupImage: reader.result as string }));
      };
      reader.readAsDataURL(file);
    } else {
      setSelectedGroupFile(null);
      setForm(prev => ({ ...prev, groupImage: null }));
    }
  }, []);

  // Handles image selection for individual item variants
  const handleItemImageSelected = useCallback((index: number, file: File | null) => {
    setForm((prev) => {
      const updatedItems = [...prev.items];
      const itemToUpdate = { ...updatedItems[index] };
      itemToUpdate._imageError = null; // Clear any previous item image error

      if (file) {
        if (file.size > 1 * 1024 * 1024) { // Example: 1MB limit for item images
          itemToUpdate._imageError = `Image too large (max 1MB).`;
          itemToUpdate._tempFile = null;
          itemToUpdate.itemImage = null;
        } else {
          itemToUpdate._tempFile = file;
          const reader = new FileReader();
          reader.onloadend = () => {
            setForm(current => {
              const nextItems = [...current.items];
              nextItems[index] = { ...nextItems[index], itemImage: reader.result as string };
              return { ...current, items: nextItems };
            });
          };
          reader.readAsDataURL(file);
        }
      } else {
        itemToUpdate._tempFile = null;
        itemToUpdate.itemImage = null; // Clear preview
      }
      updatedItems[index] = itemToUpdate;
      return { ...prev, items: updatedItems };
    });
  }, []);

  // Resets the entire form to its initial state
  const resetForm = useCallback(() => {
    setForm(getInitialFormState());
    setSelectedGroupFile(null); // Clear selected group file
    setGroupImageError(null); // Clear group image errors
    setSubmissionError(null); // Clear submission errors
  }, []);

  // --- Form Submission Handler ---
  const handleSubmit = useCallback(async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmissionError(null); // Clear previous errors

    // --- Pre-submission Validation ---
    if (isBusinessInfoLoading) {
      setSubmitting(false);
      setSubmissionError("Business information is still loading. Please wait.");
      return;
    }



    if (businessInfoError || !business?.businessId) {
      setSubmitting(false);
      setSubmissionError("Business information is missing or failed to load. Cannot submit.");
      return;
    }

    if (!selectedGroupFile || groupImageError) {
      setSubmitting(false);
      setSubmissionError(groupImageError || "Please select a group image.");
      return;
    }

    if (!form.groupName.trim()) {
        setSubmitting(false);
        setSubmissionError("Group Name is required.");
        return;
    }
    if (form.groupUnitPrice <= 0) {
        setSubmitting(false);
        setSubmissionError("Unit Price must be greater than 0.");
        return;
    }
    if (!form.releasedDate) {
        setSubmitting(false);
        setSubmissionError("Released Date is required.");
        return;
    }

    if (form.items.length === 0) {
      setSubmitting(false);
      setSubmissionError("Please add at least one color variant.");
      return;
    }

    // Validate individual items
    const invalidItem = form.items.find(item =>
        !item._tempFile || item.itemQuantity <= 0 || item._imageError
    );
    if (invalidItem) {
      setSubmitting(false);
      setSubmissionError(
        invalidItem._imageError ||
        (item => !item._tempFile ? "All color variants must have an image." :
        "All color variants must have a quantity greater than zero.")(invalidItem)
      );
      return;
    }

    try {
      const bizId = business.businessId;
      const formData = new FormData();

      // Append groupImage file
      formData.append("groupImage", selectedGroupFile);

      // Prepare item data for JSON and item image files for FormData
      const itemFiles: File[] = [];
      const itemDataForJson = form.items.map((item, index) => {
        if (item._tempFile) {
          itemFiles.push(item._tempFile);
        }
        return {
          itemColorHex: item.itemColorHex,
          itemQuantity: item.itemQuantity,
          // itemImage is NOT sent in JSON as it's a file
        };
      });

      // Append all collected item image files under a single key "itemImages"
      itemFiles.forEach(file => {
        formData.append("itemImages", file);
      });

      // Append the JSON data for the group and its items
      const groupJson = {
        groupName: form.groupName,
        groupUnitPrice: form.groupUnitPrice,
        releasedDate: form.releasedDate,
        items: itemDataForJson,
      };
      formData.append("json", new Blob([JSON.stringify(groupJson)], { type: "application/json" }));

      // --- API Call ---
      const response = await axios.post(`${API_BASE_URL}/stkG/biz/${bizId}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true,
      });

      if (response.status === 200 || response.status === 201) {
          setShowSuccessAlert(true);
          resetForm(); // Clear the form on successful submission
      } else {
          console.warn("Unexpected response status:", response.status, response.data);
          setSubmissionError(`Submission successful but with unexpected status: ${response.status}`);
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      if (axios.isAxiosError(error) && error.response) {
        setSubmissionError(`Failed to save: ${error.response.data?.message || error.message || "Server error"}`);
      } else {
        setSubmissionError("An unknown error occurred during submission. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  }, [API_BASE_URL, business?.businessId, businessInfoError, isBusinessInfoLoading, form, resetForm, selectedGroupFile, groupImageError]);

  

  if (businessInfoError) {
    return (
      <div className="flex-1 flex items-center justify-center h-full text-red-600">
        <Alert severity="error">
          <AlertTitle>Error Loading Business Info</AlertTitle>
          Failed to load essential business details: {businessInfoError.message || "An unknown error occurred."} Please refresh the page.
        </Alert>
      </div>
    );
  }

  

  // --- Main Form Render ---
  return (
    <div className="bg-white p-1 overflow-hidden rounded-sm">
      <form
        onSubmit={handleSubmit}
        className="w-full mx-auto p-2.5 overflow-auto space-y-3 relative custom-scrollbar"
        style={{ height: "calc(100vh - 119px)" }}
      >
        {/* Submission Loading Overlay */}
        {submitting && (
          <div className="absolute inset-0 bg-white/70 flex flex-col items-center justify-center z-20 rounded-sm">
            <div className="w-7 h-7 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4" />
          </div>
        )}

        {/* Success Alert */}
        {showSuccessAlert && (
          <div className="fixed top-2 left-1/2 transform -translate-x-1/2 z-30">
            <Alert
              severity="success"
              sx={{ fontSize: "0.75rem", border: "1px solid #e5e7eb", borderRadius: '4px' }}
            >
              <AlertTitle sx={{ fontSize: "0.75rem" }}>New stock entry created successfully!</AlertTitle>
            </Alert>
          </div>
        )}

        {/* Submission Error Alert */}
        {submissionError && (
          <div className="fixed top-2 left-1/2 transform -translate-x-1/2 z-30">
            <Alert
              severity="error"
              sx={{ fontSize: "0.75rem", border: "1px solid #e5e7eb", borderRadius: '4px' }}
            >
              <AlertTitle sx={{ fontSize: "0.75rem" }}>Submission Error</AlertTitle>
              {submissionError}
            </Alert>
          </div>
        )}

        {/* Back Link and Title */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="flex items-center text-sm border-[0.5px]
                       rounded-sm px-2 py-1 space-x-2 text-blue-600 bg-blue-100 
                      hover:bg-blue-200 cursor-pointer transition duration-150"
          >
            <svg
              className="w-4 h-4 text-blue-600"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              fill="none"
              viewBox="0 0 24 24"
            >
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M5 12h14M5 12l4-4m-4 4 4 4"
              />
            </svg>
            Back
          </button>
          <h2 className="text-xl font-semibold text-gray-600 mr-3">Create Stock Entry</h2>
        </div>

        {/* Group Image Upload with ImageUploadComponent */}
        <ImageUploadComponent
          id="groupImageUpload"
          label="Group Image"
          currentImageUrl={form.groupImage}
          onImageSelected={handleGroupImageSelected}
          isLoading={false} // No specific loading for this component, main form handles it
          error={groupImageError}
          className="p-2 rounded-sm border-[0.5px] border-gray-300"
        />

        {/* Group Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <label htmlFor="groupName" className="block font-medium text-gray-700 mb-1">Group Name</label>
            <input
              id="groupName"
              type="text"
              value={form.groupName}
              onChange={(e) => setForm({ ...form, groupName: e.target.value })}
              required
              className="w-full rounded-sm border-gray-300 focus:ring-blue-500 focus:border-blue-500 py-2 px-3 border-[0.5px]"
              placeholder="Enter group name"
            />
          </div>
          <div>
            <label htmlFor="unitPrice" className="block font-medium text-gray-700 mb-1">Unit Price (MMK)</label>
            <input
              id="unitPrice"
              type="text"
              inputMode="decimal"
              pattern="^\d*\.?\d*$"
              value={form.groupUnitPrice === 0 && !String(form.groupUnitPrice).includes('.') ? "" : form.groupUnitPrice}
              onChange={(e) => {
                const raw = e.target.value.replace(/[^\d.]/g, ''); // Allow only digits and one dot
                // Prevent multiple dots
                const parts = raw.split('.');
                if (parts.length > 2) return;

                setForm({
                  ...form,
                  groupUnitPrice: raw === '' ? 0 : parseFloat(raw),
                });
              }}
              required
              placeholder="Enter unit price"
              className="w-full rounded-sm border-gray-300 focus:ring-blue-500 focus:border-blue-500 py-2 px-3 border-[0.5px]"
            />
          </div>
          <div>
            <label htmlFor="releasedDate" className="block font-medium text-gray-700 mb-1">Released Date</label>
            <input
              id="releasedDate"
              type="date"
              value={form.releasedDate}
              onChange={(e) => setForm({ ...form, releasedDate: e.target.value })}
              required
              className="w-full rounded-sm focus:ring-blue-500 focus:border-blue-500 py-2 px-3 border-[0.5px] border-gray-300"
            />
          </div>
        </div>

        {/* Color Variants */}
        <div>
          <div className="flex justify-between items-center mb-1.5 mt-4">
            <h3 className="text-sm font-semibold text-gray-800">Color Variants</h3>
            <button
              type="button"
              onClick={addItem}
              className="text-sm px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              + Add Variant
            </button>
          </div>

          <div className="space-y-2 p-2 rounded-sm border-[0.5px] border-gray-300">
            {form.items.length > 0 ? (
              form.items.map((item, index) => (
                <div
                  key={item.tempId}
                  className="flex flex-col md:flex-row justify-between border-[0.5px] border-gray-300 p-2 rounded-sm shadow-xs text-sm items-center gap-2"
                >
                  <div className="flex flex-col sm:flex-row items-center gap-4 w-full">
                    {/* Item Image Upload with ImageUploadComponent */}
                    <div className="flex-grow">
                        <ImageUploadComponent
                            id={`itemImage-${item.tempId}`}
                            label="Variant Image"
                            currentImageUrl={item.itemImage}
                            onImageSelected={(file) => handleItemImageSelected(index, file)}
                            error={item._imageError}
                            className="p-1"
                        />
                    </div>

                    {/* Color and Quantity */}
                    <div className="flex gap-4 mt-2 sm:mt-0">
                      <div>
                        <label htmlFor={`itemColor-${item.tempId}`} className="block font-medium text-gray-700 mb-1">Color</label>
                        <input
                          id={`itemColor-${item.tempId}`}
                          type="color"
                          value={item.itemColorHex}
                          onChange={(e) => updateItem(index, "itemColorHex", e.target.value)}
                          className="w-10 h-10 border-[0.5px] border-gray-200 rounded-sm"
                        />
                      </div>
                      <div>
                        <label htmlFor={`itemQuantity-${item.tempId}`} className="block font-medium text-gray-700 mb-1">Quantity</label>
                        <input
                          id={`itemQuantity-${item.tempId}`}
                          required
                          type="text"
                          inputMode="numeric"         // 📱 shows number keyboard on mobile
                          pattern="[0-9]*"            // 🚫 blocks non-numeric input on mobile
                          value={item.itemQuantity}
                          onChange={(e) => {
                            const onlyDigits = e.target.value.replace(/\D/g, ""); // remove non-digits
                            updateItem(index, "itemQuantity", onlyDigits === "" ? 0 : parseInt(onlyDigits));
                          }}
                          className="w-20 rounded-sm border-gray-300 focus:ring-blue-500 focus:border-blue-500 py-2 px-3 border-[0.5px]"
                        />

                      </div>
                    </div>
                  </div>

                  {/* Remove Button */}
                  <div className="w-full flex justify-end md:w-auto md:ml-auto mt-2 md:mt-0">
                    <button
                      type="button"
                      onClick={() =>
                        setForm((prev) => ({
                          ...prev,
                          items: prev.items.filter((_, i) => i !== index),
                        }))
                      }
                      className="text-red-500 hover:bg-red-100 rounded-full h-8 w-8 flex items-center justify-center text-semibold flex-shrink-0"
                      title="Remove variant"
                    >
                      <XMarkIcon className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500 min-h-30 p-4 text-center">No color variants added yet. Click "+ Add Variant" to begin.</p>
            )}
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={submitting || isBusinessInfoLoading || !!businessInfoError} // Simplified disabled logic
              className={`py-2 px-4 rounded-sm text-sm text-white ${
                (submitting || isBusinessInfoLoading || !!businessInfoError)
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {submitting ? "Saving..." : "Save Stock Entry"}
            </button>
        </div>
      </form>
    </div>
  );
}