// src/app/stocks/page.tsx
"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import { useInfo } from "@/hooks/useInfo";
import dayjs from "dayjs";
import ImageUploadComponent from "@/components/common/ImageUploadComponent";
import { XMarkIcon } from '@heroicons/react/24/outline';
import { useRouter } from "next/navigation";
import { useModalStore } from "@/store/modalStore";
import ColorThief from 'colorthief';
import { useTranslation } from "@/hooks/useTranslation";
import PageLost404 from "@/components/error/pageLost404";
import Checkbox from "@mui/material/Checkbox";

// --- Type Definitions ---
type NewStockItem = {
  tempId: number; // Use a temporary client-side ID for list keys
  itemImage: string | null; // Data URL for preview, or null if no image/removed
  itemColorHex: string;
  itemQuantity: number;
  barcodeNo: string; // <--- NEW: Barcode number for each variant
  _tempFile?: File | null;
  _imageError?: string | null;
  _detectedPalette?: string[] | null;
};

type NewStockGroup = {
  groupImage: string | null;
  groupName: string;
  groupUnitPrice: number;
  releasedDate: string; // YYYY-MM-DD format
  isColorless: boolean;
  originalPrice: number;
  items: NewStockItem[];
};

// --- Helper for Initial Form State ---
const getInitialFormState = (): NewStockGroup => ({
  groupImage: null,
  groupName: "",
  groupUnitPrice: 0,
  releasedDate: dayjs(new Date()).format('YYYY-MM-DD'),
  isColorless: false,
  originalPrice: 0,
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
  const [groupImageError, setGroupImageError] = useState<string | null>(null);
  const [selectedGroupFile, setSelectedGroupFile] = useState<File | null>(null);

  const { business, isLoading: isBusinessInfoLoading, error: businessInfoError } = useInfo();
  const router = useRouter();
  const { t } = useTranslation();
  const { openModal, closeModal } = useModalStore();
  const multipleUploadInputRef = useRef<HTMLInputElement | null>(null);

  // This useEffect controls the modal's open/close state for business info loading
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    if (isBusinessInfoLoading || !business) {
      openModal("loading");
    } else {
      timer = setTimeout(() => {
        closeModal();
      }, 100);
    }
    return () => {
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [isBusinessInfoLoading, openModal, closeModal, business]); // Added business to dependencies

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

  // Helper function to convert RGB to Hex
  const rgbToHex = (r: number, g: number, b: number): string => {
    const toHex = (c: number) => {
      const hex = Math.round(c).toString(16);
      return hex.length === 1 ? "0" + hex : hex;
    };
    return "#" + toHex(r) + toHex(g) + toHex(b).toUpperCase();
  };

  const formRef = useRef<HTMLFormElement | null>(null);

  useEffect(() => {
    if (formRef.current) {
      formRef.current.scrollTo({
        top: formRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [form.items.length]);



  // Handles adding a new item variant to the form
  const addItem = useCallback(() => {

    setForm((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        {
          tempId: Date.now(),
          itemImage: null,
          itemColorHex: "#000000",
          itemQuantity: 1,
          barcodeNo: "", 
          _tempFile: null,
          _imageError: null,
          _detectedPalette: null,
        },
      ],
    }));
  }, []);

  const handleMultipleVariantsUpload = useCallback((files: FileList | null) => {
    if (!files || files.length === 0) return;

    const fileArray = Array.from(files);
    const promises = fileArray.map((file, i) => {
      return new Promise<NewStockItem>((resolve) => {
        if (file.size > 1 * 1024 * 1024) { // 1MB limit for individual variant images
          resolve({
            tempId: Date.now() + i,
            itemImage: null,
            itemColorHex: "#000000",
            itemQuantity: 1,
            barcodeNo: "", // <--- Initialize barcodeNo for multiple upload
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
          img.src = imageDataUrl; // No crossOrigin for local files

          img.onload = () => {
            try {
              const colorThief = new ColorThief();
              const dominantColor = colorThief.getColor(img);
              const palette = colorThief.getPalette(img, 5);

              const hexColor = rgbToHex(dominantColor[0], dominantColor[1], dominantColor[2]);
              const hexPalette = palette.map((rgb: number[]) => rgbToHex(rgb[0], rgb[1], rgb[2]));

              resolve({
                tempId: Date.now() + i,
                itemImage: imageDataUrl,
                itemColorHex: hexColor,
                itemQuantity: 1,
                barcodeNo: "", // <--- Initialize barcodeNo for multiple upload
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
                barcodeNo: "", // <--- Initialize barcodeNo
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
              barcodeNo: "", // <--- Initialize barcodeNo
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
      // Log for debugging
      // console.log("✅ New item variants added:", validNewItems.length);
      // console.log("📦 Total item count:", form.items.length + validNewItems.length); // This might be stale due to closure
    });
  }, []); // form.items is removed from deps to prevent re-creating handleMultipleVariantsUpload unnecessarily

  // Handles updating a specific field of an item variant
  // Added 'barcodeNo' as a possible key
  const updateItem = useCallback(
    <K extends keyof NewStockItem>(index: number, key: K, value: NewStockItem[K]) => {
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
    setGroupImageError(null);
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setGroupImageError("Group image must be less than 5MB.");
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
      itemToUpdate._imageError = null;

      if (file) {
        if (file.size > 1 * 1024 * 1024) { // 1MB limit for item images
          itemToUpdate._imageError = `Image too large (max 1MB).`; // Corrected limit in message
          itemToUpdate._tempFile = null;
          itemToUpdate.itemImage = null;
          itemToUpdate.itemColorHex = "#000000";
          itemToUpdate._detectedPalette = null;
        } else {
          itemToUpdate._tempFile = file;
          const reader = new FileReader();
          reader.onloadend = () => {
            const imageDataUrl = reader.result as string;
            itemToUpdate.itemImage = imageDataUrl;

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
                    itemColorHex: "#000000",
                    _detectedPalette: null,
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
                  itemColorHex: "#000000",
                  _detectedPalette: null,
                };
                return { ...current, items: nextItems };
              });
            };
          };
          reader.readAsDataURL(file);
        }
      } else {
        itemToUpdate._tempFile = null;
        itemToUpdate.itemImage = null;
        itemToUpdate.itemColorHex = "#000000";
        itemToUpdate._detectedPalette = null;
        itemToUpdate.barcodeNo = ""; // Clear barcode if image removed
      }
      updatedItems[index] = itemToUpdate;
      return { ...prev, items: updatedItems };
    });
  }, []);

  // Resets the entire form to its initial state
  const resetForm = useCallback(() => {
    setForm(getInitialFormState());
    setSelectedGroupFile(null);
    setGroupImageError(null);
    setSubmissionError(null);
  }, []);

  // --- Form Submission Handler ---
  const handleSubmit = useCallback(async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmissionError(null);

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
    const invalidItem = form.items.find(item => {
      if (form.isColorless) {
        return item.itemQuantity <= 0 || !item.barcodeNo.trim();
      }
      return !item._tempFile || item.itemQuantity <= 0 || item._imageError || !item.barcodeNo.trim();
    });

    if (invalidItem) {
      setSubmitting(false);
      if (invalidItem._imageError) {
        setSubmissionError(invalidItem._imageError);
      } else if (!invalidItem._tempFile && !form.isColorless) {
        setSubmissionError(t("lbl_limitImg"));
      } else if (invalidItem.itemQuantity <= 0) {
        setSubmissionError(t("lbl_qtyGtZero"));
      } else if (!invalidItem.barcodeNo.trim()) {
        setSubmissionError(t("lbl_barcodeRequired"));
      }
      return;
    }

    try {
      const bizId = business.businessId;
      const formData = new FormData();

      formData.append("groupImage", selectedGroupFile);

      const itemFiles: File[] = [];
      const itemDataForJson = form.items.map((item) => {
        if (item._tempFile) {
          itemFiles.push(item._tempFile);
        }
        return {
          itemColorHex: item.itemColorHex,
          itemQuantity: item.itemQuantity,
          barcodeNo: item.barcodeNo.trim(), 
        };
      });

      if(!form.isColorless){
          itemFiles.forEach(file => {
          formData.append("itemImages", file);
        });
      }
      
      const groupJson = {
        groupName: form.groupName,
        groupUnitPrice: form.groupUnitPrice,
        releasedDate: form.releasedDate,
        isColorless: form.isColorless,
        groupOriginalPrice: form.originalPrice,
        items: itemDataForJson,
      };
      formData.append("json", new Blob([JSON.stringify(groupJson)], { type: "application/json" }));
      
      const response = await axios.post(`${API_BASE_URL}/stkG/biz/${bizId}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true,
      });

      if (response.status === 200 || response.status === 201) {
        setShowSuccessAlert(true);
        resetForm();
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
      
  }, [API_BASE_URL, business?.businessId, businessInfoError, isBusinessInfoLoading, form, resetForm, selectedGroupFile, groupImageError, t]);


  if (businessInfoError) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100dvh-108px)] text-red-600">
          <PageLost404 
          header={t("msg_wrong")}
          message={businessInfoError.message}
          reload={() => window.location.reload()}
          />
      </div>
    );
  }

  // --- Main Form Render ---
  return (
    <div className="bg-white p-1 overflow-hidden rounded-lg relative">
      <form
        ref={formRef}
        onSubmit={handleSubmit}
        className="w-full mx-auto p-2.5 overflow-auto space-y-3 relative custom-scrollbar"
        style={{ height: "calc(100dvh - 119px)" }}
      >
  
        {/* Success Alert */}
        {showSuccessAlert && (
          <div className="fixed top-26 right-6.5 z-60">
            <Alert
              severity="success"
              sx={{ fontSize: "0.75rem", border: "1px solid #e5e7eb", borderRadius: '0.5rem' }}
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
              sx={{ fontSize: "0.75rem", border: "1px solid #e5e7eb", borderRadius: '0.5rem' }}
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
              className="flex items-center text-sm border-[1px]
                        rounded-sm px-2 py-1.5 space-x-2 text-blue-600 bg-blue-100
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
              {t("btnTxt_back")}
            </button>
          
          <h2 className="text-xl font-semibold text-gray-600 mr-3">{t("hd_stockentry")}</h2>
        </div>

        {/* Group Image Upload with ImageUploadComponent */}
        <ImageUploadComponent
          id="groupImageUpload"
          label={t("lbl_gpImg")}
          currentImageUrl={form.groupImage}
          onImageSelected={handleGroupImageSelected}
          isLoading={false}
          error={groupImageError}
          className="pt-3"
        />

        {/* Group Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="flex items-center space-x-2">
            <label htmlFor="groupName" className="block font-medium 
                          text-gray-700 mb-1 min-w-[120px]">{t("lbl_groupNn")}</label>
            <input
              id="groupName"
              type="text"
              value={form.groupName}
              onChange={(e) => setForm({ ...form, groupName: e.target.value })}
              required
              className="w-full rounded-sm border-gray-300 focus:ring-blue-600 focus:border-blue-600 py-2 px-3 border-[0.5px]"
              placeholder={t("lbl_groupNnInput")}
            />
          </div>
          <div className="flex items-center space-x-2">
            <label htmlFor="unitPrice" className="block font-medium
                   text-gray-700 mb-1  min-w-[120px]">{t("lbl_unitPrice")}</label>
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
              className="w-full rounded-sm border-gray-300 focus:ring-blue-600 focus:border-blue-600 py-2 px-3 border-[0.5px]"
            />
          </div>
          <div className="flex items-center space-x-2">
            <label htmlFor="originalPrice" className="block font-medium text-gray-700 mb-1  min-w-[120px]">{t("lbl_originalPrice")}</label>
            <input
              id="originalPrice"
              type="text"
              inputMode="decimal"
              pattern="^\d*\.?\d*$"
              value={form.originalPrice === 0 && !String(form.originalPrice).includes('.') ? "" : form.originalPrice}
              onChange={(e) => {
                const raw = e.target.value.replace(/[^\d.]/g, '');
                const parts = raw.split('.');
                if (parts.length > 2) return;

                setForm({
                  ...form,
                  originalPrice: raw === '' ? 0 : parseFloat(raw),
                });
              }}
              required
              placeholder={t("lbl_originalPriceInput")}
              className="w-full rounded-sm border-gray-300 focus:ring-blue-600 focus:border-blue-600 py-2 px-3 border-[0.5px]"
            />
          </div>
          <div className="flex items-center space-x-2">
            <label htmlFor="releasedDate" className="block font-medium text-gray-700 mb-1  min-w-[120px]">{t("lbl_releasedDate")}</label>
            <input
              id="releasedDate"
              type="date"
              value={form.releasedDate}
              onChange={(e) => setForm({ ...form, releasedDate: e.target.value })}
              required
              className="w-full rounded-sm focus:ring-blue-600 focus:border-blue-600 py-2 px-3 border-[0.5px] border-gray-300"
            />
          </div>
          <div className="flex items-center space-x-2 -ml-3">
            <label className="flex items-center space-x-1 text-gray-700">
              <Checkbox
                id="isColorless"
                name="isColorless" 
                checked={form.isColorless}
                onChange={(e) => setForm({ ...form, isColorless: e.target.checked })}
                disabled={form.items.length >= 2 || form.items.length === 0 
                          || form.items.some((item) => item.itemImage )}
                color="primary"
                size="small"
              /> 
              <span className="select-none text-sm">{t("lbl_isColorless")}</span>
            </label>
          </div>
        </div>

        {/* Color Variants */}
        <div>
          <div className="flex justify-between items-center mb-1.5 mt-4 select-none">
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
                  e.target.value = "";
                }}
              />
              
            </div>
          </div>

          <div className="space-y-2 p-2 rounded-sm border-[0.5px] border-gray-300 select-none">
            {form.items.length > 0 ? (
              form.items.map((item, index) => (
                <div
                  key={item.tempId}
                  className="flex flex-col md:flex-row justify-between border-[0.5px] border-gray-300 p-2 rounded-sm shadow-xs text-sm items-center gap-2"
                >
                  <div className="flex flex-row sm:flex-row items-center gap-4 w-full">
                    {/* Item Image Upload with ImageUploadComponent */}
                    <div className="flex-grow">
                        <ImageUploadComponent
                            id={`itemImage-${item.tempId}`}
                            label={`Variant #${index + 1}`}
                            currentImageUrl={item.itemImage}
                            onImageSelected={(file) => handleItemImageSelected(index, file)}
                            error={item._imageError}
                            className="p-1"
                            disabled={form.isColorless}
                        />
                    </div>

                    {/* Color, Quantity, and Barcode */}
                    <div className="flex flex-col gap-2 mt-2 sm:mt-0 flex-grow">
                      
                        <label htmlFor={`itemColor-${item.tempId}`} 
                               aria-disabled={form.isColorless}
                               onClick={(e) => form.isColorless && e.preventDefault()}
                               className="block font-medium text-gray-700 mb-1">
                                Color (Detected)
                        </label>
                        <input
                          id={`itemColor-${item.tempId}`}
                          type="color"
                          value={item.itemColorHex}
                          onChange={(e) => updateItem(index, "itemColorHex", e.target.value)}
                          disabled={form.isColorless}
                          className="w-[80px] h-10 border-[0.5px] border-gray-200 
                                     rounded-sm cursor-pointer
                                     disabled:opacity-50 disabled:cursor-not-allowed"
                          title={form.isColorless ? "You've already chosen colorless option." : "Click to manually choose color"}
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
                                  disabled={form.isColorless}
                                  className="w-6 h-6 border-[0.5px] border-gray-300 
                                            rounded-full cursor-pointer
                                            disabled:opacity-50 disabled:cursor-not-allowed"
                                  style={{ backgroundColor: color }}
                                  onClick={() => updateItem(index, "itemColorHex", color)}
                                  title={`Select ${color}`}
                                />
                              ))}
                            </div>
                          </div>
                        )}

                      <div>
                        <label htmlFor={`itemQuantity-${item.tempId}`} 
                               className="block font-medium text-gray-700 mb-1">Quantity</label>
                        <input
                          id={`itemQuantity-${item.tempId}`}
                          required
                          type="text"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          value={item.itemQuantity}
                          onChange={(e) => {
                            const onlyDigits = e.target.value.replace(/\D/g, "");
                            updateItem(index, "itemQuantity", onlyDigits === "" ? 0 : parseInt(onlyDigits));
                          }}
                          className="max-w-[80px] rounded-sm border-gray-300
                                   focus:ring-blue-600 focus:border-blue-600 
                                   py-2 px-3 border-[0.5px]"
                        />
                      </div>
                      {/* --- NEW: Barcode Input Field --- */}
                      <div className="max-w-[300px] mt-3">
                        <label htmlFor={`barcodeNo-${item.tempId}`} className="block font-medium text-gray-700 mb-1">Barcode Number</label>
                        <input
                          id={`barcodeNo-${item.tempId}`}
                          type="text"
                          value={item.barcodeNo}
                          onChange={(e) => updateItem(index, "barcodeNo", e.target.value)}
                          required
                          className="w-full rounded-sm border-gray-300 focus:ring-blue-600 focus:border-blue-600 py-2.5 px-3 border-[0.5px]"
                          placeholder="Enter barcode"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Remove Button */}
                  <div className="w-full flex justify-end 
                                  md:w-auto md:ml-auto mt-2
                                  md:mt-0">
                    <button
                      type="button"
                      disabled={form.isColorless}
                      onClick={() =>
                        setForm((prev) => ({
                          ...prev,
                          items: prev.items.filter((_, i) => i !== index),
                        }))
                      }
                      className="text-red-500 hover:bg-red-200 
                                  rounded-full h-8 w-8 flex items-center 
                                  justify-center text-semibold flex-shrink-0
                                  transition-colors duration-200 cursor-pointer
                                  disabled:opacity-40 disabled:cursor-not-allowed"
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

        {/* Submit Button and Loading Spinner */}
        <div className="flex items-center justify-between gap-x-3 pt-4">
          <div className="flex items-center gap-x-2">
            <button
              type="button"
              disabled={form.isColorless}
              onClick={() => multipleUploadInputRef.current?.click()}
              className="flex items-center text-sm border-[1px] rounded-sm space-x-2 
                       text-blue-600 bg-blue-100 hover:bg-blue-200 cursor-pointer 
                         transition duration-150 px-2 py-2
                         disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {t("btnTxt_addMultipleVariants")}
            </button>

            <button
              type="button"
              disabled={form.isColorless}
              onClick={addItem}
              className="text-sm px-2 py-2 bg-blue-600 text-white rounded hover:bg-blue-700
                         disabled:opacity-40 disabled:cursor-not-allowed transition duration-150"
            >
              {t("btnTxt_addvarient")}
            </button>
          </div>
          

          <div className="flex items-center gap-4">
            {submitting && (
              <div className="w-7 h-7 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
            )}
            <button
              type="submit"
              disabled={submitting || isBusinessInfoLoading || !!businessInfoError}
              className={`py-2 px-3 rounded-sm text-sm text-white ${
                (submitting || isBusinessInfoLoading || !!businessInfoError)
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {submitting ? t("btnTxt_saving") : t("btnTxt_saveEntry")}
            </button>
          </div>
          
        </div>
      </form>
    </div>
  );
}