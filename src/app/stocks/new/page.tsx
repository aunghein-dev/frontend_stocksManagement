// src/app/stocks/page.tsx
"use client";

import React, { useState, ChangeEvent, useEffect, useRef, useCallback } from "react";
import axios from "axios";
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import { useInfo } from "@/hooks/useInfo";
import dayjs from "dayjs";
// imgDataURLtoFile is not directly used in this version of handleItemImageSelected, keeping for completeness if other parts of project use it
import imgDataURLtoFile from "@/components/utils/imgDataURLtoFile";
import ImageUploadComponent from "@/components/common/ImageUploadComponent"; // Import the reusable component
import { XMarkIcon } from '@heroicons/react/24/outline'; // For remove item button
import { useRouter } from "next/navigation";
import { useModalStore } from "@/store/modalStore";
import ColorThief from 'colorthief';
import { useTranslation } from "@/hooks/useTranslation";

// --- Type Definitions ---
type NewStockItem = {
  tempId: number; // Use a temporary client-side ID for list keys
  itemImage: string | null; // Data URL for preview, or null if no image/removed
  itemColorHex: string;
  itemQuantity: number;
  _tempFile?: File | null; // Holds the actual File object if selected
  _imageError?: string | null; // Client-side image specific error
  _detectedPalette?: string[] | null; // New: To store HEX colors of the detected palette
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
  const { t } = useTranslation();
  // --- Effects ---
  const { openModal, closeModal } = useModalStore();
const multipleUploadInputRef = useRef<HTMLInputElement | null>(null);

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
          itemColorHex: "#000000", // Default to black
          itemQuantity: 1,
          _tempFile: null,
          _imageError: null,
          _detectedPalette: null, // Initialize palette as null
        },
      ],
    }));
  }, []);


  const handleMultipleVariantsUpload = useCallback((files: FileList | null) => {
      if (!files || files.length === 0) return;

      const fileArray = Array.from(files);
      const promises = fileArray.map((file, i) => {
        return new Promise<NewStockItem>((resolve) => {
          if (file.size > 1 * 1024 * 1024) {
            resolve({
              tempId: Date.now() + i,
              itemImage: null,
              itemColorHex: "#000000",
              itemQuantity: 1,
              _tempFile: null,
              _imageError: "Image too large (max 1MB).",
              _detectedPalette: null,
            });
            return;
          }

          const reader = new FileReader();
          reader.onloadend = () => {
            const imageDataUrl = reader.result as string;
            const img = new Image();
            // Remove crossOrigin for local files
            img.src = imageDataUrl;

            img.onload = () => {
              try {
                const colorThief = new ColorThief();
                const dominantColor = colorThief.getColor(img);
                const palette = colorThief.getPalette(img, 5);

                const hexColor = rgbToHex(dominantColor[0], dominantColor[1], dominantColor[2]);
                const hexPalette = palette.map((rgb: any) => rgbToHex(rgb[0], rgb[1], rgb[2]));

                resolve({
                  tempId: Date.now() + i,
                  itemImage: imageDataUrl,
                  itemColorHex: hexColor,
                  itemQuantity: 1,
                  _tempFile: file,
                  _imageError: null,
                  _detectedPalette: hexPalette,
                });
              } catch (error) {
                console.error("Color detection failed:", error);
                resolve({
                  tempId: Date.now() + i,
                  itemImage: imageDataUrl,
                  itemColorHex: "#000000",
                  itemQuantity: 1,
                  _tempFile: file,
                  _imageError: null,
                  _detectedPalette: null,
                });
              }
            };

            img.onerror = () => {
              resolve({
                tempId: Date.now() + i,
                itemImage: null,
                itemColorHex: "#000000",
                itemQuantity: 1,
                _tempFile: null,
                _imageError: "Failed to load image.",
                _detectedPalette: null,
              });
            };
          };
          reader.readAsDataURL(file);
        });
      });

      Promise.all(promises).then((newItems) => {
        const validNewItems = newItems.filter((item) => item.itemImage !== null);
        if (validNewItems.length > 0) {
          setForm((prev) => ({
            ...prev,
            items: [...prev.items, ...validNewItems],
          }));
        }
        console.log("✅ New item variants added:", validNewItems.length);
        console.log("📦 Total item count:", form.items.length + validNewItems.length);
      });
    }, []);


  // Helper function to convert RGB to Hex
  const rgbToHex = (r: number, g: number, b: number): string => {
    // Ensure numbers are within 0-255 range and are integers
    const toHex = (c: number) => {
      const hex = Math.round(c).toString(16);
      return hex.length === 1 ? "0" + hex : hex;
    };
    return "#" + toHex(r) + toHex(g) + toHex(b).toUpperCase();
  };


  // Handles updating a specific field of an item variant
  const updateItem = useCallback((index: number, key: keyof NewStockItem, value: string | number | string[] | null) => {
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
      if (file.size > 10 * 1024 * 1024) { //: 10MB limit
        setGroupImageError("Group image must be less than 10MB.");
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
        if (file.size > 10 * 1024 * 1024) { //: 1MB limit for item images
          itemToUpdate._imageError = `Image too large (max 10MB).`;
          itemToUpdate._tempFile = null;
          itemToUpdate.itemImage = null;
          itemToUpdate.itemColorHex = "#000000"; // Reset color if error
          itemToUpdate._detectedPalette = null; // Clear palette if error
        } else {
          itemToUpdate._tempFile = file;
          const reader = new FileReader();
          reader.onloadend = () => {
            const imageDataUrl = reader.result as string;
            itemToUpdate.itemImage = imageDataUrl; // Set image preview

            // --- ColorThief Integration ---
            const img = new Image();
            img.crossOrigin = 'Anonymous'; // Needed for cross-origin images, though local files usually don't need it
            img.src = imageDataUrl;
            img.onload = () => {
              try {
                const colorThief = new ColorThief();
                const dominantColor = colorThief.getColor(img);
                const hexColor = rgbToHex(dominantColor[0], dominantColor[1], dominantColor[2]);

                // Get a palette of dominant colors (e.g., top 5)
                const palette = colorThief.getPalette(img, 5); // Get 5 colors
                const hexPalette = palette.map((rgb: number[]) => rgbToHex(rgb[0], rgb[1], rgb[2]));

                setForm(current => {
                  const nextItems = [...current.items];
                  // Update image, detected dominant color, and the palette
                  nextItems[index] = {
                    ...nextItems[index],
                    itemImage: imageDataUrl,
                    itemColorHex: hexColor,
                    _detectedPalette: hexPalette,
                  };
                  return { ...current, items: nextItems };
                });
              } catch (error) {
                console.error("Error detecting color or palette:", error);
                setForm(current => {
                  const nextItems = [...current.items];
                  nextItems[index] = {
                    ...nextItems[index],
                    itemImage: imageDataUrl,
                    itemColorHex: "#000000", // Default to black on error
                    _detectedPalette: null, // Clear palette on error
                  };
                  return { ...current, items: nextItems };
                });
              }
            };
            img.onerror = (err) => {
              console.error("Image loading error for color detection:", err);
              setForm(current => {
                const nextItems = [...current.items];
                nextItems[index] = {
                  ...nextItems[index],
                  itemImage: imageDataUrl,
                  itemColorHex: "#000000", // Default to black on error
                  _detectedPalette: null, // Clear palette on error
                };
                return { ...current, items: nextItems };
              });
            };
          };
          reader.readAsDataURL(file);
        }
      } else {
        itemToUpdate._tempFile = null;
        itemToUpdate.itemImage = null; // Clear preview
        itemToUpdate.itemColorHex = "#000000"; // Reset color
        itemToUpdate._detectedPalette = null; // Clear palette
      }
      updatedItems[index] = itemToUpdate;

      // Note: The main setForm call here will be overridden by the one inside reader.onloadend
      // to ensure the color is updated AFTER the image is loaded.
      // So, this initial setForm is mainly for the _tempFile and _imageError updates.
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
      setSubmissionError(t("msg_noBizInfo"));
      return;
    }

    if (businessInfoError || !business?.businessId) {
      setSubmitting(false);
      setSubmissionError(t("msg_noFoundBiz"));
      return;
    }

    if (!selectedGroupFile || groupImageError) {
      setSubmitting(false);
      setSubmissionError(groupImageError || t("lbl_slctGpImg"));
      return;
    }

    if (!form.groupName.trim()) {
        setSubmitting(false);
        setSubmissionError(t("lbl_reqrGpNn"));
        return;
    }
    if (form.groupUnitPrice <= 0) {
        setSubmitting(false);
        setSubmissionError(t("lbl_limitPrice"));
        return;
    }
    if (!form.releasedDate) {
        setSubmitting(false);
        setSubmissionError(t("lbl_rldDatRequired"));
        return;
    }

    if (form.items.length === 0) {
      setSubmitting(false);
      setSubmissionError(t("lbl_atLeastVarient"));
      return;
    }

    // Validate individual items
    const invalidItem = form.items.find(item =>
        !item._tempFile || item.itemQuantity < 0 || item._imageError
    );
    if (invalidItem) {
      setSubmitting(false);
      setSubmissionError(
        invalidItem._imageError ||
        (item => !item._tempFile ? t("lbl_limitImg") :
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
          setSubmissionError(`${t("msg_submtErr")}: ${response.status}`);
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      if (axios.isAxiosError(error) && error.response) {
        setSubmissionError(`Failed to save: ${error.response.data?.message || error.message || "Server error"}`);
      } else {
        setSubmissionError(t("msg_submtErrUnkown"));
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
    <div className="bg-white p-1 overflow-hidden rounded-sm relative">
      <form
        onSubmit={handleSubmit}
        className="w-full mx-auto p-2.5 overflow-auto space-y-3 relative custom-scrollbar"
        style={{ height: "calc(100dvh - 119px)" }}
      >
  

        {/* Success Alert */}
        {showSuccessAlert && (
          <div className="fixed top-26 right-6.5 z-60">
            <Alert
              severity="success"
              sx={{ fontSize: "0.75rem", border: "1px solid #e5e7eb", borderRadius: '4px' }}
            >
              <AlertTitle sx={{ fontSize: "0.75rem" }}>{t("msg_addSucess")}</AlertTitle>
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
              type="button"
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
              {t("btTxt_back")}
            </button>

        
          <h2 className="text-xl font-semibold text-gray-600 mr-3">{t("hd_stockentry")}</h2>
        </div>

        {/* Group Image Upload with ImageUploadComponent */}
        <ImageUploadComponent
          id="groupImageUpload"
          label={t("lbl_gpImg")}
          currentImageUrl={form.groupImage}
          onImageSelected={handleGroupImageSelected}
          isLoading={false} // No specific loading for this component, main form handles it
          error={groupImageError}
          className="p-2 rounded-sm border-[0.5px] border-gray-300"
        />

        {/* Group Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <label htmlFor="groupName" className="block font-medium text-gray-700 mb-1">{t("lbl_groupNn")}</label>
            <input
              id="groupName"
              type="text"
              value={form.groupName}
              onChange={(e) => setForm({ ...form, groupName: e.target.value })}
              required
              className="w-full rounded-sm border-gray-300 focus:ring-blue-500 focus:border-blue-500 py-2 px-3 border-[0.5px]"
              placeholder={t("lbl_groupNnInput")}
            />
          </div>
          <div>
            <label htmlFor="unitPrice" className="block font-medium text-gray-700 mb-1">{t("lbl_unitPrice")}</label>
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
              placeholder={t("lbl_unitPriceInput")}
              className="w-full rounded-sm border-gray-300 focus:ring-blue-500 focus:border-blue-500 py-2 px-3 border-[0.5px]"
            />
          </div>
          <div>
            <label htmlFor="releasedDate" className="block font-medium text-gray-700 mb-1">{t("lbl_releasedDate")}</label>
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
            <h3 className="text-sm font-semibold text-gray-800">{t("lbl_colorvarients")}</h3>
            <div className="flex gap-3">
              <input
                type="file"
                accept="image/*"
                multiple
                hidden
                ref={multipleUploadInputRef}
                onChange={(e) => {
                  handleMultipleVariantsUpload(e.target.files);
                  // Reset input to allow re-uploading the same files
                  e.target.value = "";
                }}
              />
              <button
                type="button"
                onClick={() => multipleUploadInputRef.current?.click()}
                className="flex items-center text-sm border-[0.5px] rounded-sm space-x-2 text-blue-600 bg-blue-100 hover:bg-blue-200 cursor-pointer transition duration-150 px-4 py-2"
              >
                {t("btnTxt_addMultipleVariants")}
              </button>


              <button
                type="button"
                onClick={addItem}
                className="text-sm px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                {t("btnTxt_addvarient")}
              </button>
            </div>
          
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
                            label={`Variant #${index + 1}`}
                            currentImageUrl={item.itemImage}
                            onImageSelected={(file) => handleItemImageSelected(index, file)}
                            error={item._imageError}
                            className="p-1"
                        />
                    </div>

                    {/* Color and Quantity */}
                    <div className="flex flex-col gap-2 mt-2 sm:mt-0">
                      <div>
                        <label htmlFor={`itemColor-${item.tempId}`} className="block font-medium text-gray-700 mb-1">Color (Detected)</label>
                        <input
                          id={`itemColor-${item.tempId}`}
                          type="color"
                          value={item.itemColorHex}
                          onChange={(e) => updateItem(index, "itemColorHex", e.target.value)}
                          className="w-full h-10 border-[0.5px] border-gray-200 rounded-sm cursor-pointer"
                          title="Click to manually choose color"
                        />
                        {/* Display Detected Palette */}
                        {item._detectedPalette && item._detectedPalette.length > 0 && (
                          <div className="mt-2 text-xs">
                            <p className="font-medium text-gray-700 mb-1">Palette:</p>
                            <div className="flex gap-1.5">
                              {item._detectedPalette.map((color, pIdx) => (
                                <button
                                  key={pIdx}
                                  type="button"
                                  className="w-6 h-6 border-[0.5px] border-gray-300 rounded-full cursor-pointer"
                                  style={{ backgroundColor: color }}
                                  onClick={() => updateItem(index, "itemColorHex", color)}
                                  title={`Select ${color}`}
                                />
                              ))}
                            </div>
                          </div>
                        )}
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
              <p className="text-sm text-gray-500 min-h-30 p-4 text-center">{t("msg_noVarient")}</p>
            )}
          </div>
        </div>

        {/* Submit Button */}
        {/* Submit Button and Loading Spinner */}
        <div className="flex items-center justify-end gap-x-3 pt-4"> {/* This div now controls both */}
          {submitting && ( // Show spinner ONLY when submitting
            <div className="w-7 h-7 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          )}
          <button
            type="submit"
            disabled={submitting || isBusinessInfoLoading || !!businessInfoError} // Simplified disabled logic
            className={`py-2 px-4 rounded-sm text-sm text-white ${
              (submitting || isBusinessInfoLoading || !!businessInfoError)
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {submitting ? t("btTxt_saving") : t("btnTxt_saveEntry")}
          </button>
        </div>
        
      </form>
    </div>
  );
}
