// src/app/settings/page.tsx
'use client';

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import axios from 'axios';
import { useInfo } from '@/hooks/useInfo';
import dayjs from 'dayjs';

import {
  CloudArrowUpIcon,
  PhotoIcon,
  XCircleIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';
import Image from 'next/image';
import { useModalStore } from "@/store/modalStore"; 
import { useTranslation } from '@/hooks/useTranslation';
import PageLost404 from '@/components/error/pageLost404';

interface BusinessSettings {
  businessId: number;
  businessLogo: string;
  businessName: string;
  businessNameShortForm: string;
  registeredBy: string;
  registeredAt: string;
  defaultCurrency: string;
  taxRate: number;
  showLogoOnInvoice: boolean;
  autoPrintAfterCheckout: boolean;
  invoiceFooterMessage: string;
}

export default function Settings() {
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;
  const { openModal, closeModal } = useModalStore();
  // Ensure refresh method is correctly destructured from useInfo if it's named 'refresh'
  const { business, isLoading: isLoadingBusinessInfo, error: businessInfoError, refresh: refetchBusinessInfo } = useInfo();


  const [settings, setSettings] = useState<BusinessSettings>({
    businessId: 0,
    businessLogo: '',
    businessName: '',
    businessNameShortForm: '',
    registeredBy: '',
    registeredAt: '',
    defaultCurrency: 'MMK',
    taxRate: 0,
    showLogoOnInvoice: false,
    autoPrintAfterCheckout: false,
    invoiceFooterMessage: '',
  });

  const [initialSettings, setInitialSettings] = useState<BusinessSettings | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  // States for Logo Upload
  const [selectedLogoFile, setSelectedLogoFile] = useState<File | null>(null);
  // `displayLogoUrl` will hold the URL currently shown (either selected file preview or saved logo)
  const [displayLogoUrl, setDisplayLogoUrl] = useState<string | null>(null);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [logoUploadError, setLogoUploadError] = useState<string | null>(null);
  const [logoUploadSuccess, setLogoUploadSuccess] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const { t } = useTranslation();
  // --- Data Initialization Effect (Primary effect for loading settings and initial logo) ---
  // This effect runs once when business data is loaded or changes.
  useEffect(() => {
    if (!isLoadingBusinessInfo && business) {
      const loadedSettings: BusinessSettings = {
        businessId: business.businessId || 0,
        businessLogo: business.businessLogo || '',
        businessName: business.businessName || '',
        businessNameShortForm: business.businessNameShortForm || '',
        registeredBy: business.registeredBy || '',
        registeredAt: business.registeredAt || '',
        defaultCurrency: business.defaultCurrency || 'MMK',
        taxRate: business.taxRate ?? 0,
        showLogoOnInvoice: business.showLogoOnInvoice ?? false,
        autoPrintAfterCheckout: business.autoPrintAfterCheckout ?? false,
        invoiceFooterMessage: business.invoiceFooterMessage || '',
      };
      setSettings(loadedSettings);
      setInitialSettings(loadedSettings);
      // Set the displayLogoUrl directly from the loaded business data initially
      setDisplayLogoUrl(loadedSettings.businessLogo || null);
    } else if (!isLoadingBusinessInfo && !businessInfoError && !business) {
      // Case where no business info is found
      setSaveError("No business information found. Please ensure  account is set up correctly.");
      setInitialSettings(null);
      setDisplayLogoUrl(null); // Clear logo preview if no business info
    }
  }, [isLoadingBusinessInfo, business, businessInfoError]);

  useEffect(() => {
    if(isLoadingBusinessInfo){
      openModal("loading");
    } else {
      closeModal();
    }
  },[isLoadingBusinessInfo, openModal, closeModal]);

  // --- Effect for dynamic logo preview from selected file ---
  // This effect runs only when `selectedLogoFile` changes.
  // It manages the temporary URL for the selected file preview.
  useEffect(() => {
    if (selectedLogoFile) {
      const url = URL.createObjectURL(selectedLogoFile);
      setDisplayLogoUrl(url); // Temporarily set display URL to the new file
      return () => URL.revokeObjectURL(url); // Clean up the object URL
    } else {
      // If no file is selected, revert displayLogoUrl to the actual saved logo
      // from `settings` state (which reflects the current saved logo, or the original if no changes)
      setDisplayLogoUrl(settings.businessLogo || null);
    }
  }, [selectedLogoFile, settings.businessLogo]); // Depend on selectedLogoFile and the *saved* logo URL


  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { id, value, type, checked } = e.target as HTMLInputElement;

    let newValue: string | boolean | number = value;
    if (id === 'taxRate' && type === 'number') {
      newValue = parseFloat(value);
      if (isNaN(newValue)) {
        newValue = 0;
      }
    } else if (type === 'checkbox') {
      newValue = checked;
    }

    setSettings(prevSettings => ({
      ...prevSettings,
      [id]: newValue,
    }));
    setSaveSuccess(false);
    setSaveError(null);
  }, []);

  const handleLogoFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedLogoFile(file);
      setLogoUploadError(null);
      setLogoUploadSuccess(false);
      setSaveSuccess(false);
      setSaveError(null);
    } else {
      setSelectedLogoFile(null);
      // When file input is cleared, the displayLogoUrl will revert via the useEffect above.
    }
  }, []); // No need for `business` in dependencies here, as display is managed by useEffect

  const handleLogoUpload = useCallback(async () => {
    if (!selectedLogoFile) {
      setLogoUploadError('Please select a file to upload.');
      return;
    }
    if (!API_BASE_URL) {
      setLogoUploadError("API_BASE_URL is not defined for logo upload.");
      return;
    }

    setIsUploadingLogo(true);
    setLogoUploadError(null);
    setLogoUploadSuccess(false);

    const formData = new FormData();
    formData.append('logo', selectedLogoFile);

    try {
      const response = await axios.put(`${API_BASE_URL}/info/upload/logo/${settings.businessId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        withCredentials: true,
      });

      const newLogoUrl = response.data.logoUrl;


      // Update settings with the new logo URL
      setSettings(prevSettings => ({
        ...prevSettings,
        businessLogo: newLogoUrl,
      }));
      // Update initialSettings as well so hasChanges works correctly after an upload
      setInitialSettings(prevSettings => ({
        ...(prevSettings || settings), // Use current settings if initial is null/stale
        businessLogo: newLogoUrl,
      }));

      setSelectedLogoFile(null); // Clear selected file after successful upload
      setLogoUploadSuccess(true);

      // Refresh the useInfo hook data to ensure global state consistency
      if (refetchBusinessInfo) {
        refetchBusinessInfo();
      }

    } catch (error) {
      console.error("Error uploading logo:", error);
      if (axios.isAxiosError(error) && error.response) {
        setLogoUploadError(`Logo upload failed: ${error.response.data?.message || error.response.statusText}`);
      } else {
        setLogoUploadError(`An unexpected error occurred during logo upload: ${error instanceof Error ? error.message : String(error)}`);
      }
    } finally {
      setIsUploadingLogo(false);
      // Reset file input value to allow selecting the same file again if needed
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  }, [selectedLogoFile, API_BASE_URL, refetchBusinessInfo, settings]);


  const handleReset = useCallback(() => {
    if (initialSettings) {
      setSettings(initialSettings);
      setSaveSuccess(false);
      setSaveError(null);
      setSelectedLogoFile(null); // Clear selected file on reset
      setLogoUploadError(null);
      setLogoUploadSuccess(false);
      // Reset display URL to the initial saved logo
      setDisplayLogoUrl(initialSettings.businessLogo || null);
    }
  }, [initialSettings]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('handleSubmit triggered (for general settings)!');
    console.log('API_BASE_URL:', API_BASE_URL);

    setIsSaving(true);
    setSaveError(null);
    setSaveSuccess(false);

    try {
      if (!API_BASE_URL) {
          throw new Error("API_BASE_URL is not defined.");
      }
      
      
      await axios.put(`${API_BASE_URL}/info/edit/${settings.businessId}`, settings, {
        withCredentials: true,
        headers: { 'Content-Type': 'application/json' }
      });
      
      
      setSaveSuccess(true);
      setInitialSettings(settings); // Update initial settings to current successful save
      // After a full save, if logo was part of the save, it will be reflected in initialSettings
      // and thus in settings, ensuring displayLogoUrl is correctly updated by its useEffect.
    } catch (error) {
      console.error("Failed to save settings:", error);
      if (axios.isAxiosError(error) && error.response) {
        setSaveError(`Failed to save settings: ${error.response.data?.message || error.response.statusText}`);
      } else {
        setSaveError(`An unexpected error occurred while saving settings: ${error instanceof Error ? error.message : String(error)}`);
      }
    } finally {
      setIsSaving(false);
    }
  }, [settings, API_BASE_URL]);

  const hasChanges = useMemo(() => {
    if (!initialSettings) return false;
    return JSON.stringify(settings) !== JSON.stringify(initialSettings);
  }, [settings, initialSettings]);


  

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

  if (!business && !isLoadingBusinessInfo) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[calc(100dvh - 169px)] text-gray-600 p-4">
        <p className="text-lg font-semibold text-center">No Business Information Found</p>
        <p className="text-sm text-center mt-2">
          Could not retrieve business details for the current user. Please ensure you are logged in and business data exists.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-600 transition-colors duration-200"
        >
          Reload Page
        </button>
      </div>
    );
  }

  return (
    <section className="w-full rounded-xs  overflow-hidden p-1 bg-white">
      <div className='overflow-auto custom-scrollbar h-[calc(100dvh-118px)] 
                       p-3'>
        <form onSubmit={handleSubmit}>
          {/* General Settings */}
          <div className="p-4 mb-6 border-[0.5px] border-gray-100 rounded-xs shadow-sm">
            <h3 className="text-xl font-bold text-gray-900 mb-5 border-b-[0.5px] border-gray-200 pb-3">{t("hd_bizInfo")}</h3>
            
            {/* --- Logo Upload Section --- */}
            <div className="flex flex-col items-center justify-center p-6 rounded-xs border border-dashed border-gray-200 mb-6">
              <label htmlFor="logo-upload-input" className="cursor-pointer">
                {displayLogoUrl ? (
                  <Image
                    src={displayLogoUrl}
                    alt="Business Logo Preview"
                    width={96}
                    height={96}
                    className="w-24 h-24 object-cover rounded-xs border border-gray-200 shadow-sm transition-all duration-200 ease-in-out hover:scale-105"
                    priority
                  />
                ) : (
                  <div className="w-24 h-24 flex items-center justify-center bg-gray-200 rounded-xs text-gray-500 border border-dashed border-gray-400">
                    <PhotoIcon className="w-10 h-10" />
                  </div>
                )}
                <input
                  id="logo-upload-input"
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  onChange={handleLogoFileChange}
                  className="hidden"
                />
              </label>
             <p className="mt-2 text-sm text-gray-600 font-medium">
                {selectedLogoFile
                  ? `${selectedLogoFile.name.slice(0, 10)}...${selectedLogoFile.name.slice(-6)}`
                  : t("io_logoClick")}
              </p>

              <p className="text-xs text-gray-500 mb-4 mt-2">PNG, JPG, JPEG, GIF up to 10MB</p>
              
              <button
                type="button"
                onClick={handleLogoUpload}
                disabled={!selectedLogoFile || isUploadingLogo}
                className={`flex items-center px-4 py-2 rounded-md text-sm font-semibold transition-all duration-200
                  ${!selectedLogoFile || isUploadingLogo
                    ? 'bg-blue-300 text-white cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 text-white shadow-md'
                  }`}
              >
                {isUploadingLogo ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <CloudArrowUpIcon className="w-5 h-5 mr-2" /> Upload Logo
                  </>
                )}
              </button>

              {logoUploadSuccess && (
                <p className="mt-3 flex items-center text-sm text-green-600 animate-fade-in">
                  <CheckCircleIcon className="w-5 h-5 mr-1" /> Logo uploaded successfully!
                </p>
              )}
              {logoUploadError && (
                <p className="mt-3 flex items-center text-sm text-red-600 animate-fade-in">
                  <XCircleIcon className="w-5 h-5 mr-1" /> {logoUploadError}
                </p>
              )}
            </div>
            {/* --- End Logo Upload Section --- */}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="businessName" className="block text-sm font-medium text-gray-700 mb-1">
                  {t("io_bizNn")}
                </label>
                <input
                  type="text"
                  id="businessName"
                  className="w-full px-4 py-3 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 transition-colors duration-200"
                  placeholder=" Store Name"
                  value={settings.businessName}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <label htmlFor="businessNameShortForm" className="block text-sm font-medium text-gray-700 mb-1">
                  {t("io_bizShortNn")}
                </label>
                <input
                  type="text"
                  id="businessNameShortForm"
                  className="w-full px-4 py-3 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 transition-colors duration-200"
                  placeholder="e.g., MoMo"
                  value={settings.businessNameShortForm}
                  onChange={handleChange}
                />
              </div>
              <div className="relative">
                <label htmlFor="defaultCurrency" className="block text-sm font-medium text-gray-700 mb-1">
                  {t("io_dfCurrency")}
                </label>
                <select
                  id="defaultCurrency"
                  className="w-full appearance-none px-4 py-3 pr-10 border border-gray-300 rounded-md text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 transition-colors duration-200"
                  value={settings.defaultCurrency}
                  onChange={handleChange}
                >
                  <option value="MMK">MMK - Kyat</option>
                  <option value="USD">USD - US Dollar</option>
                  <option value="THB">THB - Thai Baht</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 top-0 flex items-center px-2 text-gray-500 mt-7">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>

              <div>
                <label htmlFor="taxRate" className="block text-sm font-medium text-gray-700 mb-1">
                  {t("io_taxRate")} (%) <span className="text-xs text-gray-500">(e.g., 5 for 5%)</span>
                </label>
                <input
                  type="number"
                  id="taxRate"
                  className="w-full px-4 py-3 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 transition-colors duration-200"
                  placeholder="0"
                  value={settings.taxRate}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t("io_rgstBy")}</label>
                <p className="w-full px-4 py-3 text-sm bg-gray-50 text-gray-600 rounded-md border border-gray-200">
                  {settings.registeredBy || 'N/A'}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t("io_rgstAt")}</label>
                <p className="w-full px-4 py-3 text-sm bg-gray-50 text-gray-600 rounded-md border border-gray-200">
                  {settings.registeredAt ? dayjs(settings.registeredAt).format('DD-MMM-YYYY hh:mm A') : 'N/A'}
                </p>
              </div>
            </div>
          </div>

          {/* Invoice Settings */}
          <div className="p-4 mb-6 border-[0.5px] border-gray-100 rounded-xs shadow-sm">
            <h3 className="text-xl font-bold text-gray-900 mb-5 border-b-[0.5px] border-gray-200 pb-3">{t("hd_invRcptSettings")}</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label htmlFor="showLogoOnInvoice" className="text-sm font-medium text-gray-700 cursor-pointer">
                  {t("lbl_showInvOnVcher")}
                </label>
                <input
                  type="checkbox"
                  id="showLogoOnInvoice"
                  className="accent-blue-600 w-5 h-5 focus:ring-2 focus:ring-blue-600"
                  checked={settings.showLogoOnInvoice}
                  onChange={handleChange}
                />
              </div>
              <div className="flex items-center justify-between">
                <label htmlFor="autoPrintAfterCheckout" className="text-sm font-medium text-gray-700 cursor-pointer">
                  {t("lbl_autoPrintAftSale")}
                </label>
                <input
                  type="checkbox"
                  id="autoPrintAfterCheckout"
                  className="accent-blue-600 w-5 h-5 focus:ring-2 focus:ring-blue-600"
                  checked={settings.autoPrintAfterCheckout}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label htmlFor="invoiceFooterMessage" className="block text-sm font-medium text-gray-700 mb-2">
                  {t("lbl_invceFtMsg")}
                </label>
                <input
                  type="text"
                  id="invoiceFooterMessage"
                  className="w-full px-4 py-3 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 transition-colors duration-200"
                  placeholder="Thank you for shopping with us!"
                  value={settings.invoiceFooterMessage}
                  onChange={handleChange}
                  maxLength={255}
                />
                <p className="text-xs text-gray-500 mt-2.5">This message will appear at the bottom of  customer invoices.</p>
              </div>
            </div>
          </div>

          {/* User Preferences */}
          <div className="p-4 mb-6 border-[0.5px] border-gray-100 rounded-xs shadow-sm">
            <h3 className="text-xl font-bold text-gray-900 mb-5 border-b-[0.5px] border-gray-200 pb-3">
              {t("hd_uxPrefer")}
            </h3>


            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label htmlFor="enableDarkMode" className="text-sm font-medium text-gray-700 cursor-not-allowed">
                  Enable Dark Mode (Coming Soon)
                </label>
                <input
                  type="checkbox"
                  id="enableDarkMode"
                  className="accent-blue-600 w-5 h-5 cursor-not-allowed"
                  checked={false}
                  onChange={() => {}}
                  disabled
                />
              </div>
              <div className="flex items-center justify-between">
                <label htmlFor="enableSoundEffects" className="text-sm font-medium text-gray-700 cursor-not-allowed">
                  Enable Sound Effects (Coming Soon)
                </label>
                <input
                  type="checkbox"
                  id="enableSoundEffects"
                  className="accent-blue-600 w-5 h-5 cursor-not-allowed"
                  checked={false}
                  onChange={() => {}}
                  disabled
                />
              </div>
            </div>


          </div>

          {/* Action Buttons and Feedback */}
          <div className="flex flex-col sm:flex-row justify-end items-center gap-4 mt-6">
            {saveSuccess && (
              <p className="text-sm text-green-600 mr-4 animation-fade-in">Settings saved successfully!</p>
            )}
            {saveError && (
              <p className="text-sm text-red-600 mr-4 animation-fade-in">{saveError}</p>
            )}

            <button
              type="button"
              onClick={handleReset}
              className="w-full sm:w-auto bg-gray-100 hover:bg-gray-200 text-gray-800 px-6 py-2 rounded-xs text-sm border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 transition-colors duration-200"
              disabled={isSaving || !hasChanges}
            >
              {t("btnTxt_reset")}
            </button>
            <button
              type="submit"
              className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-xs text-sm flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-blue-600 transition-colors duration-200"
              disabled={isSaving || !hasChanges}
            >
              {isSaving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  {t("btnTxt_saving")}
                </>
              ) : (
                t("btnTxt_saveSettings")
              )}
            </button>
          </div>
        </form>

      </div>
    </section>
  );
}