// src/app/stocks/edit/[groupId]/page.tsx
"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import axios from "axios";
import Alert from "@mui/material/Alert";
import AlertTitle from "@mui/material/AlertTitle";
import { useParams, useRouter } from "next/navigation";
import { useInfo } from "@/hooks/useInfo";
import ImageUploadComponent from "@/components/common/ImageUploadComponent"; // Import the reusable component
import { XMarkIcon } from '@heroicons/react/24/outline'; // For remove item button
import { useModalStore } from "@/store/modalStore";
// --- Type Definitions ---
type StockItem = {
  itemId: number | null; //  for newly added items without server ID
  itemImage: string | null; // Data URL or external URL for preview
  itemColorHex: string;
  itemQuantity: number;
  _tempFile?: File | null; // Holds the actual File object for new uploads
  _imageError?: string | null; // Client-side image specific error
  _isExistingImage: boolean; // True if itemImage is a URL from the server
};

type Stock = {
  groupId: number;
  groupImage: string | null; // Data URL or external URL for preview
  groupName: string;
  groupUnitPrice: number;
  releasedDate: string;
  items: StockItem[];
};

// Form state type, without groupId as it's from params
type FormState = Omit<Stock, "groupId"> & {
  _groupTempFile: File | null; // File object for the main group image
  _groupImageError: string | null; // Error for group image
};

const getInitialFormState = (): FormState => ({
  groupImage: null,
  groupName: "",
  groupUnitPrice: 0,
  releasedDate: "",
  items: [],
  _groupTempFile: null,
  _groupImageError: null,
});

// --- Main Component ---
export default function StockEditForm() {
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;
  const router = useRouter();
  const params = useParams();

  // Ensure groupId is always a string for API calls
  const groupId = Array.isArray(params.groupId) ? params.groupId[0] : (params.groupId as string);

  // --- State Management ---
  const [form, setForm] = useState<FormState>(getInitialFormState);
  const [submittingForm, setSubmittingForm] = useState(false);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false); // Renamed from popperShow for clarity
  const [fetchError, setFetchError] = useState<string | null>(null); // For initial data fetch errors
  const [submissionError, setSubmissionError] = useState<string | null>(null); // For form submission errors

  // Use the useInfo hook to get business details
  const { business, isLoading: isBusinessInfoLoading, error: businessInfoError } = useInfo();
  const bizId = business?.businessId;

  const { openModal, closeModal } = useModalStore();

  // --- Initial Data Fetch Effect ---
  useEffect(() => {
    // Only fetch if bizId and groupId are available and not already loading/loaded
    if (!bizId || !groupId || (form.groupName && !fetchError)) {
      if (!bizId) {
        setFetchError("Business ID not available. Please ensure you are logged in.");
      } else if (!groupId) {
        setFetchError("No Group ID provided for editing.");
      }
      return;
    }

    const fetchGroupData = async () => {
      setSubmittingForm(false); // Ensure submission state is off during initial fetch
      setFetchError(null);
      setForm(getInitialFormState()); // Reset form state before fetching new data

      try {
        const response = await axios.get<Stock>(`${API_BASE_URL}/biz/${bizId}/stkG/${groupId}`, {
          withCredentials: true,
        });
        const selectedGroupData = response.data;

        if (selectedGroupData && selectedGroupData.groupName) {
          setForm((prevForm) => ({
            ...prevForm,
            groupImage: selectedGroupData.groupImage || null,
            groupName: selectedGroupData.groupName || "",
            groupUnitPrice: selectedGroupData.groupUnitPrice || 0,
            releasedDate: selectedGroupData.releasedDate?.slice(0, 10) || "",
            items: selectedGroupData.items.map(item => ({
              ...item,
              itemImage: item.itemImage || null,
              _tempFile: null, // No temp file for existing images
              _imageError: null,
              _isExistingImage: true, // Mark as existing
            })),
          }));
        } else {
          setFetchError("Stock group data is empty or invalid.");
          router.push("/stocks"); // Redirect if data is truly not found or invalid
        }
      } catch (error) {
        console.error("Error fetching stock group data:", error);
        if (axios.isAxiosError(error) && error.response?.status === 404) {
          setFetchError("Stock group not found.");
        } else {
          setFetchError("Failed to load stock data. Please try again.");
        }
        router.push("/stocks"); // Redirect on fetch error
      }
    };

    fetchGroupData();
  }, [groupId, API_BASE_URL, bizId, router, form.groupName, fetchError]); // Rerun if these critical pieces change

  // --- Alert Visibility Effect ---
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
          itemId: null, // Mark as new for distinct handling
          itemImage: null,
          itemColorHex: "#000000",
          itemQuantity: 0,
          _tempFile: null,
          _imageError: null,
          _isExistingImage: false,
        },
      ],
    }));
  }, []);

  // Handles updating a specific field of an item variant
  const updateItem = useCallback((index: number, key: keyof StockItem, value: string | number) => {
    setForm((prev) => {
      const updatedItems = [...prev.items];
      // Type assertion because keyof StockItem doesn't include _tempFile, etc.
      (updatedItems[index] as any)[key] = value;
      return { ...prev, items: updatedItems };
    });
  }, []);
// Handles image selection for the main group image
const handleGroupImageSelected = useCallback((file: File | null) => {
  setForm((prev) => {
    // Explicitly assert that newForm is of type FormState
    const newForm: FormState = { ...prev, _groupImageError: null, _groupTempFile: null, groupImage: null };
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // Example: 2MB limit
        // This assignment is now valid because TypeScript knows _groupImageError can be a string
        newForm._groupImageError = "Group image must be less than 2MB.";
      } else {
        newForm._groupTempFile = file;
        const reader = new FileReader();
        reader.onloadend = () => {
          setForm(current => ({ ...current, groupImage: reader.result as string }));
        };
        reader.readAsDataURL(file);
      }
    }
    return newForm;
  });
}, []);

// Handles image selection for individual item variants
const handleItemImageSelected = useCallback((index: number, file: File | null) => {
  setForm((prev) => {
    const updatedItems = [...prev.items];
    // Explicitly assert that itemToUpdate is of type StockItem
    const itemToUpdate: StockItem = { ...updatedItems[index], _imageError: null, _tempFile: null }; // Clear previous
    itemToUpdate._isExistingImage = false; // A new selection means it's not the existing image anymore

    if (file) {
      if (file.size > 1 * 1024 * 1024) { // Example: 1MB limit for item images
        // This assignment is now valid
        itemToUpdate._imageError = `Image too large (max 1MB).`;
      } else {
        itemToUpdate._tempFile = file;
        const reader = new FileReader();
        reader.onloadend = () => {
          setForm(current => {
            const nextItems = [...current.items];
            // Ensure nextItems[index] is also treated as StockItem
            nextItems[index] = { ...nextItems[index], itemImage: reader.result as string } as StockItem;
            return { ...current, items: nextItems };
          });
        };
        reader.readAsDataURL(file);
      }
    } else {
      // If file is null, it means image was cleared.
      itemToUpdate._tempFile = null;
      itemToUpdate.itemImage = null;
      itemToUpdate._isExistingImage = false; // No longer existing or new
    }
    updatedItems[index] = itemToUpdate;
    return { ...prev, items: updatedItems };
  });
}, []);

 useEffect(() => {
    if(submittingForm) {
      openModal("loading");
    } else {
      closeModal();
    }
  }, [submittingForm, openModal, closeModal]);

  // --- Form Submission Handler ---
  const handleSubmit = useCallback(async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmittingForm(true);
    setSubmissionError(null);

    // --- Pre-submission Validation ---
    if (!bizId) {
      setSubmittingForm(false);
      setSubmissionError("Business ID not available. Cannot submit.");
      return;
    }
    if (!groupId) {
      setSubmittingForm(false);
      setSubmissionError("Group ID missing. Cannot submit update.");
      return;
    }
    if (!form.groupName.trim()) {
      setSubmittingForm(false);
      setSubmissionError("Group Name is required.");
      return;
    }
    if (form.groupUnitPrice <= 0) {
      setSubmittingForm(false);
      setSubmissionError("Unit Price must be greater than 0.");
      return;
    }
    if (!form.releasedDate) {
      setSubmittingForm(false);
      setSubmissionError("Released Date is required.");
      return;
    }

    if (!form.groupImage && !form._groupTempFile) { // Check if either current URL or new file exists
        setSubmittingForm(false);
        setSubmissionError("Group image is required.");
        return;
    }
    if (form._groupImageError) { // Check for client-side image errors
        setSubmittingForm(false);
        setSubmissionError(form._groupImageError);
        return;
    }


    const invalidItem = form.items.find(item =>
        item.itemQuantity <= 0 || item._imageError || (!item.itemImage && !item._tempFile)
    );
    if (invalidItem) {
      setSubmittingForm(false);
      setSubmissionError(
        invalidItem._imageError ||
        (!invalidItem.itemImage && !invalidItem._tempFile ? "All variants must have an image." : "All variants must have a quantity greater than zero.")
      );
      return;
    }
    if (form.items.length === 0) {
        setSubmittingForm(false);
        setSubmissionError("Please add at least one color variant.");
        return;
    }

    try {
      const formData = new FormData();

      // Handle group image:
      // If a new file was selected, append it.
      if (form._groupTempFile) {
        formData.append("groupImage", form._groupTempFile);
      }
      // If groupImage was cleared, explicitly tell backend to remove it if your API supports it.
      // E.g., formData.append("clearGroupImage", "true");
      // If it's an existing image and not re-uploaded, you typically don't send it again.
      // The backend should retain the existing image unless a new one is provided.


      // Prepare item data for JSON and item image files for FormData
      const itemsPayload = await Promise.all(
        form.items.map(async (item, index) => {
          let itemImageNameForBackend = ''; // This will be used to link file to JSON item

          if (item._tempFile) {
            // New or replaced image
            itemImageNameForBackend = `itemImage_${item.itemId || 'new_' + index}.jpg`;
            formData.append("itemImages", item._tempFile, itemImageNameForBackend);
          } else if (item._isExistingImage && item.itemImage) {
            // Existing image, but backend expects URL in JSON for update (or you don't send file)
            // If backend expects the URL in JSON and no new file, set it here.
            itemImageNameForBackend = item.itemImage; // Send the URL back if backend needs it to know to retain
          }
          // If itemImage is null/cleared and not a new file, it will be excluded. Backend should handle deletion.

          

          return {
            itemId: item.itemId, // Include itemId for existing items
            itemColorHex: item.itemColorHex,
            itemQuantity: item.itemQuantity,
            // Only include image info if it's an existing URL that the backend needs to retain,
            // OR if you're sending a filename for the backend to match with the uploaded file.
            // For multipart, it's common for files to be separate from JSON for new uploads.
            // If itemImageNameForBackend is a URL, send it. If it's a temp filename, perhaps backend will link it.
            // This logic depends heavily on your backend's API design for updates.
            // For now, assuming backend matches files sent in 'itemImages' array with the order of JSON items.
            // Or that the backend identifies items by itemId and new files by their position/order.
            // Let's assume if _tempFile exists, backend processes that. If not, if _isExistingImage, backend retains.
            // If neither, backend deletes.
            itemImage: item._isExistingImage && item.itemImage ? item.itemImage : undefined, // Only send URL if existing and not replaced
          };
        })
      );

      // Append structured JSON for group and items
      const groupJson = {
        groupName: form.groupName,
        groupUnitPrice: form.groupUnitPrice,
        releasedDate: form.releasedDate,
        items: itemsPayload,
        // _groupId: groupId, // Can include groupId in JSON for clarity if desired by backend
      };

      formData.append(
        "json",
        new Blob([JSON.stringify(groupJson)], { type: "application/json" })
      );

      // --- API Call ---
      const response = await axios.put(
        `${API_BASE_URL}/edit/stkG/${groupId}`, // Use PUT for updates
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
          withCredentials: true,
        }
      );

      if (response.status === 200  || response.status === 201) {
        setShowSuccessAlert(true);
        // Optionally refetch data to reflect server changes or navigate
        // router.push("/stocks");
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      if (axios.isAxiosError(error) && error.response) {
        setSubmissionError(`Failed to update: ${error.response.data?.message || error.message || "Server error"}`);
      } else {
        setSubmissionError("An unknown error occurred during submission. Please try again.");
      }
    } finally {
      setSubmittingForm(false);
    }
  }, [API_BASE_URL, bizId, groupId, form, router]);

 
  useEffect(() => {
    if(isBusinessInfoLoading || !form.groupName && !fetchError){
      openModal("loading");
    } else {
      closeModal();
    }
  }, [isBusinessInfoLoading, form.groupName, fetchError]);

  

  
  // --- Main Form Render ---
  return (
    <div className="bg-white p-1 overflow-hidden rounded-sm shadow-sm">
      <form
        onSubmit={handleSubmit}
        className="w-full mx-auto p-2.5 overflow-auto space-y-3 relative custom-scrollbar"
        style={{ height: "calc(100dvh - 118px)" }}
      >
        

        {/* Success Alert */}
        {showSuccessAlert && (
          <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-60">
            <Alert
              severity="success"
              sx={{ fontSize: "0.75rem", border: "1px solid #e5e7eb", borderRadius: '4px' }}
            >
              <AlertTitle sx={{ fontSize: "0.75rem" }}>Stock entry updated successfully!</AlertTitle>
            </Alert>
          </div>
        )}

        {/* Submission Error Alert */}
        {submissionError && (
          <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-60">
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
              type="button" // 
              className="flex items-center text-sm border-[0.5px] rounded-sm px-2 py-1 space-x-2 text-blue-600 bg-blue-100 hover:bg-blue-200"
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
          <h2 className="text-xl font-semibold text-gray-600 mr-3">Edit Stock Entry</h2>
        </div>

        {/* Group Image Upload with ImageUploadComponent */}
        <ImageUploadComponent
          id="groupImageUpload"
          label="Group Image"
          currentImageUrl={form.groupImage}
          onImageSelected={handleGroupImageSelected}
          isLoading={false}
          error={form._groupImageError}
          className="p-2 rounded-sm border-[0.5px] border-gray-300"
          priority={true}
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
                const raw = e.target.value.replace(/[^\d.]/g, '');
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

          <div className="space-y-2 p-2 rounded-sm border-[0.5px] border-gray-300 min-h-[78px]">
            {form.items.length > 0 ? (
              form.items.map((item, index) => (
                <div
                  key={item.itemId === null ? `new-${index}` : item.itemId} // Use robust key for new items
                  className="flex flex-col md:flex-row justify-between border-[0.5px]
                           border-gray-300 p-2 rounded-sm shadow-xs text-sm items-center gap-2"
                >
                  <div className="flex flex-col sm:flex-row items-center gap-4 w-full">
                    {/* Item Image Upload with ImageUploadComponent */}
                    <div className="flex-grow">
                        <ImageUploadComponent
                            id={`itemImage-${item.itemId === null ? `new-${index}` : item.itemId}`}
                            label={`Varient #${index + 1}`}
                            currentImageUrl={item.itemImage}
                            onImageSelected={(file) => handleItemImageSelected(index, file)}
                            error={item._imageError}
                            className="p-1"
                            priority={true}
                        />
                    </div>

                    {/* Color and Quantity */}
                    <div className="flex gap-4 mt-2 sm:mt-0">
                      <div>
                        <label htmlFor={`itemColor-${item.itemId === null ? `new-${index}` : item.itemId}`} className="block font-medium text-gray-700 mb-1">Color</label>
                        <input
                          id={`itemColor-${item.itemId === null ? `new-${index}` : item.itemId}`}
                          type="color"
                          value={item.itemColorHex}
                          onChange={(e) => updateItem(index, "itemColorHex", e.target.value)}
                          className="w-10 h-10 border-[0.5px] border-gray-200 rounded-sm"
                        />
                      </div>
                      <div>
                        <label htmlFor={`itemQuantity-${item.itemId === null ? `new-${index}` : item.itemId}`} className="block font-medium text-gray-700 mb-1">Quantity</label>
                        <input
                          id={`itemQuantity-${item.itemId === null ? `new-${index}` : item.itemId}`}
                          required
                          type="text"
                          inputMode="numeric"
                          pattern="[0-9]*"
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
        <div className="pt-4 flex justify-end">
          <button
            type="submit"
            disabled={submittingForm || isBusinessInfoLoading || !!fetchError || !!businessInfoError}
            className={`px-4 py-2 text-sm rounded-sm ${
              (submittingForm || isBusinessInfoLoading || !!fetchError || !!businessInfoError)
                ? "bg-gray-400 text-white cursor-not-allowed"
                : "bg-blue-600 text-white hover:bg-blue-700"
            }`}
          >
            {submittingForm ? "Updating..." : "Update Stock"}
          </button>
        </div>
      </form>
    </div>
  );
}