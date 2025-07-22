// src/app/stocks/edit/[groupId]/page.tsx
"use client";

import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import Alert from "@mui/material/Alert";
import AlertTitle from "@mui/material/AlertTitle";
import { useParams, useRouter } from "next/navigation";
import { useInfo } from "@/hooks/useInfo";
import ImageUploadComponent from "@/components/common/ImageUploadComponent";
import { XMarkIcon } from '@heroicons/react/24/outline';
import { useModalStore } from "@/store/modalStore";
import ColorThief from 'colorthief';
import { useTranslation } from "@/hooks/useTranslation";

// --- Type Definitions ---
type StockItem = {
  itemId: number | null; // for newly added items without server ID
  itemImage: string | null; // Data URL or external URL for preview
  itemColorHex: string;
  itemQuantity: number;
  barcodeNo: string; // <--- NEW: Barcode number for each variant
  _tempFile?: File | null; // Holds the actual File object for new uploads
  _imageError?: string | null; // Client-side image specific error
  _isExistingImage: boolean; // True if itemImage is a URL from the server
  _detectedPalette?: string[] | null; // To store HEX colors of the detected palette
};

type Stock = {
  groupId: number;
  groupImage: string | null;
  groupName: string;
  groupUnitPrice: number;
  releasedDate: string;
  items: StockItem[];
};

// Form state type, with groupId added back to track fetched ID
type FormState = Omit<Stock, "groupId"> & {
  groupId: number | null; // To track the groupId of the currently loaded data
  _groupTempFile: File | null;
  _groupImageError: string | null;
};



const getInitialFormState = (): FormState => ({
  groupId: null,
  groupImage: null,
  groupName: "",
  groupUnitPrice: 0,
  releasedDate: "",
  items: [],
  _groupTempFile: null,
  _groupImageError: null,
});

// Helper function to convert RGB to Hex
const rgbToHex = (r: number, g: number, b: number): string => {
  const toHex = (c: number) => {
    const hex = Math.round(c).toString(16);
    return hex.length === 1 ? "0" + hex : hex;
  };
  return "#" + toHex(r) + toHex(g) + toHex(b).toUpperCase();
};

// --- Main Component ---
export default function StockEditForm() {
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;
  const router = useRouter();
  const params = useParams();

  const groupIdParam = Array.isArray(params.groupId) ? params.groupId[0] : (params.groupId as string);

  // --- State Management ---
  const [form, setForm] = useState<FormState>(getInitialFormState);
  const [submittingForm, setSubmittingForm] = useState(false);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [hasFetchedInitialData, setHasFetchedInitialData] = useState(false);

  const { business, isLoading: isBusinessInfoLoading, error: businessInfoError } = useInfo();
  const bizId = business?.businessId;

  const { openModal, closeModal } = useModalStore();
  const { t } = useTranslation();

  // --- Initial Data Fetch Effect ---
  useEffect(() => {
    if (!bizId || !groupIdParam) {
      if (!bizId) {
        setFetchError("Business ID not available. Please ensure you are logged in.");
      } else if (!groupIdParam) {
        setFetchError("No Group ID provided for editing.");
      }
      return;
    }

    const currentNumericGroupId = parseInt(groupIdParam);

    if (hasFetchedInitialData && !fetchError && form.groupId === currentNumericGroupId) {
      return;
    }

    const fetchGroupData = async () => {
      setSubmittingForm(false);
      setFetchError(null);
      if (form.groupId !== currentNumericGroupId || !hasFetchedInitialData) {
         setForm(getInitialFormState());
      }

      try {
        const response = await axios.get<Stock>(`${API_BASE_URL}/biz/${bizId}/stkG/${groupIdParam}`, {
          withCredentials: true,
        });
        const selectedGroupData = response.data;

        if (selectedGroupData && selectedGroupData.groupName) {
          setForm((prevForm) => ({
            ...prevForm,
            groupId: selectedGroupData.groupId,
            groupImage: selectedGroupData.groupImage || null,
            groupName: selectedGroupData.groupName || "",
            groupUnitPrice: selectedGroupData.groupUnitPrice || 0,
            releasedDate: selectedGroupData.releasedDate?.slice(0, 10) || "",
            items: selectedGroupData.items.map(item => ({
              ...item,
              itemImage: item.itemImage || null,
              barcodeNo: item.barcodeNo || "", // <--- Initialize barcodeNo from fetched data
              _tempFile: null,
              _imageError: null,
              _isExistingImage: true,
              _detectedPalette: null,
            })),
          }));
          setHasFetchedInitialData(true);
        } else {
          setFetchError("Stock group data is empty or invalid.");
          router.push("/stocks");
          setHasFetchedInitialData(true);
        }
      } catch (error) {
        console.error("Error fetching stock group data:", error);
        if (axios.isAxiosError(error) && error.response?.status === 404) {
          setFetchError("Stock group not found.");
        } else {
          setFetchError("Failed to load stock data. Please try again.");
        }
        router.push("/stocks");
        setHasFetchedInitialData(true);
      }
    };

    fetchGroupData();
  }, [groupIdParam, API_BASE_URL, bizId, router, fetchError, hasFetchedInitialData, form.groupId]);

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
          itemId: null,
          itemImage: null,
          itemColorHex: "#000000",
          itemQuantity: 0,
          barcodeNo: "", // <--- Initialize barcodeNo for new items
          _tempFile: null,
          _imageError: null,
          _isExistingImage: false,
          _detectedPalette: null,
        },
      ],
    }));
  }, []);


    const updateItem = useCallback(
      <K extends keyof StockItem>(index: number, key: K, value: StockItem[K]) => {
        setForm((prev) => {
          const updatedItems = [...prev.items];
          updatedItems[index] = {
            ...updatedItems[index],
            [key]: value,
          };
          return { ...prev, items: updatedItems };
        });
      },
      []
    );


  // Handles image selection for the main group image
  const handleGroupImageSelected = useCallback((file: File | null) => {
    setForm((prev) => {
      const newForm: FormState = { ...prev, _groupImageError: null, _groupTempFile: null, groupImage: null };
      if (file) {
        if (file.size > 10 * 1024 * 1024) {
          newForm._groupImageError = "Group image must be less than 10MB.";
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
      const itemToUpdate: StockItem = { ...updatedItems[index], _imageError: null, _tempFile: null, _detectedPalette: null };
      itemToUpdate._isExistingImage = false;

      if (file) {
        if (file.size > 1 * 1024 * 1024) { // 1MB limit for item images
          itemToUpdate._imageError = `Image too large (max 1MB).`;
          itemToUpdate._tempFile = null;
          itemToUpdate.itemImage = null;
          itemToUpdate.itemColorHex = "#000000";
          itemToUpdate._detectedPalette = null;
        } else {
          itemToUpdate._tempFile = file;
          const reader = new FileReader();
          reader.onloadend = () => {
            const imageDataUrl = reader.result as string;
            setForm(current => {
              const nextItems = [...current.items];
              nextItems[index] = { ...nextItems[index], itemImage: imageDataUrl } as StockItem;
              return { ...current, items: nextItems };
            });

            const img = new Image();
            img.crossOrigin = 'Anonymous';
            img.src = imageDataUrl;
            img.onload = () => {
              try {
                const colorThief = new ColorThief();
                const dominantColor = colorThief.getColor(img);
                const hexColor = rgbToHex(dominantColor[0], dominantColor[1], dominantColor[2]);

                const palette = colorThief.getPalette(img, 5);
                const hexPalette = palette.map((rgb: number[]) => rgbToHex(rgb[0], rgb[1], rgb[2]));

                setForm(current => {
                  const nextItems = [...current.items];
                  nextItems[index] = {
                    ...nextItems[index],
                    itemImage: imageDataUrl,
                    itemColorHex: hexColor,
                    _detectedPalette: hexPalette,
                  } as StockItem;
                  return { ...current, items: nextItems };
                });
              } catch (colorThiefError) {
                console.error("Error detecting colors:", colorThiefError);
                setForm(current => {
                  const nextItems = [...current.items];
                  nextItems[index] = {
                    ...nextItems[index],
                    _imageError: "Could not detect colors from image.",
                    _detectedPalette: null,
                  } as StockItem;
                  return { ...current, items: nextItems };
                });
              }
            };
            img.onerror = () => {
              setForm(current => {
                const nextItems = [...current.items];
                nextItems[index] = {
                  ...nextItems[index],
                  _imageError: "Failed to load image for color detection.",
                  _detectedPalette: null,
                } as StockItem;
                return { ...current, items: nextItems };
              });
            };
          };
          reader.readAsDataURL(file);
        }
      } else {
        itemToUpdate._tempFile = null;
        itemToUpdate.itemImage = null;
        itemToUpdate._isExistingImage = false;
        itemToUpdate.itemColorHex = "#000000"; // Reset color
        itemToUpdate.itemQuantity = 0; // Reset quantity
        itemToUpdate.barcodeNo = ""; // <--- Clear barcode if image removed
        itemToUpdate._detectedPalette = null;
      }
      updatedItems[index] = itemToUpdate;
      return { ...prev, items: updatedItems };
    });
  }, []);

  // --- Form Submission Handler ---
  const handleSubmit = useCallback(async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmittingForm(true);
    setSubmissionError(null);

    // --- Pre-submission Validation ---
    if (!bizId) {
      setSubmittingForm(false);
      setSubmissionError(t("msg_noFoundBiz"));
      return;
    }
    if (!groupIdParam) {
      setSubmittingForm(false);
      setSubmissionError(t("msg_gpIdNotFound"));
      return;
    }
    if (!form.groupName.trim()) {
      setSubmittingForm(false);
      setSubmissionError(t("lbl_reqrGpNn"));
      return;
    }
    if (form.groupUnitPrice <= 0) {
      setSubmittingForm(false);
      setSubmissionError(t("lbl_limitPrice"));
      return;
    }
    if (!form.releasedDate) {
      setSubmittingForm(false);
      setSubmissionError(t("lbl_rldDatRequired"));
      return;
    }

    if (!form.groupImage && !form._groupTempFile) {
        setSubmittingForm(false);
        setSubmissionError(t("lbl_reqrGpImg"));
        return;
    }
    if (form._groupImageError) {
        setSubmittingForm(false);
        setSubmissionError(form._groupImageError);
        return;
    }

    if (form.items.length === 0) {
        setSubmittingForm(false);
        setSubmissionError(t("lbl_atLeastVarient"));
        return;
    }

    // Validate individual items
    const invalidItem = form.items.find(item =>
        item.itemQuantity < 0 || item._imageError || (!item.itemImage && !item._tempFile) || !item.barcodeNo.trim()
    );
    if (invalidItem) {
      setSubmittingForm(false);
      if (invalidItem._imageError) {
          setSubmissionError(invalidItem._imageError);
      } else if (!invalidItem.itemImage && !invalidItem._tempFile) {
          setSubmissionError(t("lbl_limitImg")); // Image missing
      } else if (invalidItem.itemQuantity <= 0) {
          setSubmissionError(t("lbl_qtyGtZero")); // Quantity invalid
      } else if (!invalidItem.barcodeNo.trim()) {
          setSubmissionError(t("lbl_barcodeRequired")); // Barcode missing
      }
      return;
    }

    try {
      const formData = new FormData();

      if (form._groupTempFile) {
        formData.append("groupImage", form._groupTempFile);
      }

      const itemsPayload = await Promise.all(
        form.items.map(async (item, index) => {
          // Determine if image is new, existing, or removed
          let itemImageNameForBackend = '';
          if (item._tempFile) {
            // New image file being uploaded
            itemImageNameForBackend = `itemImage_${item.itemId || 'new_' + index}.jpg`; // Unique name for new files
            formData.append("itemImages", item._tempFile, itemImageNameForBackend);
          } else if (item._isExistingImage && item.itemImage) {
            // Existing image, keep its original URL/path
            itemImageNameForBackend = item.itemImage;
          }
          // If neither, it means image was removed or never existed, so itemImageNameForBackend remains empty

          return {
            itemId: item.itemId,
            itemColorHex: item.itemColorHex,
            itemQuantity: item.itemQuantity,
            barcodeNo: item.barcodeNo.trim(), // <--- Include barcodeNo here
            // Only send itemImage if it's an existing URL or a new file was provided
            itemImage: itemImageNameForBackend || null, // Send null if image was removed
          };
        })
      );

      const groupJson = {
        groupName: form.groupName,
        groupUnitPrice: form.groupUnitPrice,
        releasedDate: form.releasedDate,
        items: itemsPayload,
      };

      formData.append(
        "json",
        new Blob([JSON.stringify(groupJson)], { type: "application/json" })
      );

      const response = await axios.put(
        `${API_BASE_URL}/edit/stkG/${groupIdParam}`, // Corrected API endpoint for PUT
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
          withCredentials: true,
        }
      );

      if (response.status === 200 || response.status === 201) {
        setShowSuccessAlert(true);
        // Optionally, re-fetch data to reflect server changes or reset form state relevant to fetched data
        // For edit, usually you'd just show success and let the user continue editing or navigate away.
        // setHasFetchedInitialData(false); // If you want to force a re-fetch on success
      } else {
        console.warn("Unexpected response status:", response.status, response.data);
        setSubmissionError(`${t("msg_submtErr")}: ${response.status}`);
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      if (axios.isAxiosError(error) && error.response) {
        setSubmissionError(`Failed to update: ${error.response.data?.message || error.message || "Server error"}`);
      } else {
        setSubmissionError(t("msg_submtErrUnkown"));
      }
    } finally {
      setSubmittingForm(false);
    }
  }, [API_BASE_URL, bizId, groupIdParam, form, t]); // Added t to dependencies

  // --- Modal Visibility Effect ---
  useEffect(() => {
    if (isBusinessInfoLoading || (!hasFetchedInitialData && fetchError === null) || submittingForm) {
      openModal("loading");
    } else {
      closeModal();
    }
  }, [isBusinessInfoLoading, hasFetchedInitialData, fetchError, submittingForm, openModal, closeModal]);


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
          <div className="fixed top-26 right-6.5 z-60">
            <Alert
              severity="success"
              sx={{ fontSize: "0.75rem", border: "1px solid #e5e7eb", borderRadius: '4px' }}
            >
              <AlertTitle sx={{ fontSize: "0.75rem" }}>{t("msg_updtStkSucess")}</AlertTitle>
            </Alert>
          </div>
        )}

        {/* Submission Error Alert */}
        {submissionError && (
          <div className="fixed top-26 right-6.5 z-60">
            <Alert
              severity="error"
              sx={{ fontSize: "0.75rem", border: "1px solid #e5e7eb", borderRadius: '4px' }}
            >
              <AlertTitle sx={{ fontSize: "0.75rem" }}>{t("msg_sbmtErr")}</AlertTitle>
              {submissionError}
            </Alert>
          </div>
        )}

        {/* Back Link and Title */}
        <div className="flex items-center justify-between">
          <button
              onClick={() => router.back()}
              type="button"
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
              {t("btnTxt_back")}
            </button>
          <h2 className="text-xl font-semibold text-gray-600 mr-3">{t("hd_stkEdit")}</h2>
        </div>

        {/* Group Image Upload with ImageUploadComponent */}
        <ImageUploadComponent
          id="groupImageUpload"
          label={t("lbl_gpImg")}
          currentImageUrl={form.groupImage}
          onImageSelected={handleGroupImageSelected}
          isLoading={false}
          error={form._groupImageError}
          className="pt-3"
          priority={true}
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
                const raw = e.target.value.replace(/[^\d.]/g, '');
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
            <button
              type="button"
              onClick={addItem}
              className="text-sm px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              {t("btnTxt_addvarient")}
            </button>
          </div>

          <div className="space-y-2 p-2 rounded-sm border-[0.5px] border-gray-300 min-h-[78px]">
            {form.items.length > 0 ? (
              form.items.map((item, index) => (
                <div
                  key={item.itemId === null ? `new-${index}` : item.itemId}
                  className="flex flex-col md:flex-row justify-between border-[0.5px]
                           border-gray-300 p-2 rounded-sm shadow-xs text-sm items-center gap-2"
                >
                  <div className="flex flex-col sm:flex-row items-center gap-4 w-full">
                    {/* Item Image Upload with ImageUploadComponent */}
                    <div className="flex-grow">
                        <ImageUploadComponent
                            id={`itemImage-${item.itemId === null ? `new-${index}` : item.itemId}`}
                            label={`${t("lbl_varient")} #${index + 1}`}
                            currentImageUrl={item.itemImage}
                            onImageSelected={(file) => handleItemImageSelected(index, file)}
                            error={item._imageError}
                            className="p-1"
                            priority={true}
                        />
                    </div>

                    {/* Color, Quantity, and Barcode */}
                    <div className="flex flex-col gap-2 mt-2 sm:mt-0 flex-grow"> {/* Adjusted to flex-col */}
                      <div>
                        <label htmlFor={`itemColor-${item.itemId === null ? `new-${index}` : item.itemId}`} className="block font-medium text-gray-700 mb-1">{t("lbl_color")}</label>
                        <input
                          id={`itemColor-${item.itemId === null ? `new-${index}` : item.itemId}`}
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
                              {item._detectedPalette.map((color, colorIdx) => (
                                <button
                                  key={colorIdx}
                                  type="button"
                                  className="w-6 h-6 rounded-full border-[0.5px] border-gray-300 hover:border-blue-500"
                                  style={{ backgroundColor: color }}
                                  title={color}
                                  onClick={() => updateItem(index, "itemColorHex", color)}
                                />
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                      <div>
                        <label htmlFor={`itemQuantity-${item.itemId === null ? `new-${index}` : item.itemId}`} className="block font-medium text-gray-700 mb-1">{t("lbl_qty")}</label>
                        <input
                          id={`itemQuantity-${item.itemId === null ? `new-${index}` : item.itemId}`}
                          required
                          type="text"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          value={item.itemQuantity}
                          onChange={(e) => {
                            const onlyDigits = e.target.value.replace(/\D/g, "");
                            updateItem(index, "itemQuantity", onlyDigits === "" ? 0 : parseInt(onlyDigits));
                          }}
                          className="w-full rounded-sm border-gray-300 focus:ring-blue-500 focus:border-blue-500 py-2 px-3 border-[0.5px]"
                        />
                      </div>
                      {/* --- NEW: Barcode Input Field --- */}
                      <div>
                        <label htmlFor={`barcodeNo-${item.itemId === null ? `new-${index}` : item.itemId}`} className="block font-medium text-gray-700 mb-1">Barcode Number</label>
                        <input
                          id={`barcodeNo-${item.itemId === null ? `new-${index}` : item.itemId}`}
                          type="text"
                          value={item.barcodeNo}
                          onChange={(e) => updateItem(index, "barcodeNo", e.target.value)}
                          required
                          className="w-full rounded-sm border-gray-300 focus:ring-blue-500 focus:border-blue-500 py-2 px-3 border-[0.5px]"
                          placeholder="Enter barcode"
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
            {submittingForm ? t("btnTxt_updating") : t("btnTxt_svStk")}
          </button>
        </div>
      </form>
    </div>
  );
}