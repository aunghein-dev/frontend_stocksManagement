'use client'; // This is a Client Component

import React, { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast'; // For notifications: npm install react-hot-toast
import { useTranslation } from '@/hooks/useTranslation';

// Heroicons for UI: npm install @heroicons/react
import {
  CloudArrowUpIcon,
  PhotoIcon,
  XCircleIcon,
  CheckCircleIcon,
  UserCircleIcon, // For default user icon
} from '@heroicons/react/24/outline';
import Image from 'next/image'; // For optimized image handling
import { useModalStore } from "@/store/modalStore";
import PageLost404 from '@/components/error/pageLost404';
import { useUser } from '@/hooks/useUser';


// --- DTO for Business (nested within UserProfile) ---
interface Business {
  businessId: number;
  businessLogo: string | null;
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

// --- DTO for User Profile (matches  provided JSON structure) ---
interface UserProfile {
  id: number;
  username: string;
  password?: string;
  role: string;
  fullName: string;
  userImgUrl: string | null;
  business: Business;
}


const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

const AccountProfileSettingsPage: React.FC = () => {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [initialUserProfile, setInitialUserProfile] = useState<UserProfile | null>(null);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [formFullName, setFormFullName] = useState<string>('');
  const { openModal, closeModal } = useModalStore();
  const [selectedProfileImageFile, setSelectedProfileImageFile] = useState<File | null>(null);
  const [displayProfileImageUrl, setDisplayProfileImageUrl] = useState<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [imageUploadError, setImageUploadError] = useState<string | null>(null);
  const [imageUploadSuccess, setImageUploadSuccess] = useState<boolean>(false);
  const { refresh } = useUser();
  const [instancePropic, setInstancePropic] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const { t } = useTranslation();

  // --- 1. Fetch User Profile Data on Component Mount ---
  useEffect(() => {
    const fetchUserProfile = async () => {
      openModal("loading");
      setError(null);
      try {
        if (!API_BASE_URL) {
          setError("API_BASE_URL is not configured. Please set NEXT_PUBLIC_API_URL in  .env.local file.");
          closeModal();
          return;
        }

        const response = await axios.get<UserProfile>(`${API_BASE_URL}/auth/info`, {
          withCredentials: true,
        });

        const fetchedProfile = response.data;

        // Add a check to ensure we actually got a user profile
        if (!fetchedProfile) {
            setError("No user profile data found in the response.");
            closeModal();
            return;
        }

        setUserProfile(fetchedProfile);
        setInitialUserProfile(fetchedProfile);
        setFormFullName(fetchedProfile.fullName || '');
        // Initialize displayProfileImageUrl from fetched data or default
        setDisplayProfileImageUrl(fetchedProfile.userImgUrl || '/man.png');
        
      } catch (err) {
        console.error('Failed to fetch user profile:', err);
        if (axios.isAxiosError(err) && err.response) {
          setError(`Failed to load profile: ${err.response.data?.message || err.response.statusText}`);
          if (err.response.status === 401) {
            toast.error("Session expired or unauthorized. Please log in again.", { duration: 5000 });
          }
        } else {
          setError(`An unexpected error occurred: ${err instanceof Error ? err.message : String(err)}`);
        }
      } finally {
        closeModal();
      }
    };

    fetchUserProfile();
  }, [openModal, closeModal]); // Empty dependency array means this runs once on mount


  const handleFullNameChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setFormFullName(e.target.value);
    setSaving(false);
    setError(null);
    setImageUploadSuccess(false);
    setImageUploadError(null);
  }, []);

  const handleProfileImageFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];

      const MAX_FILE_SIZE_MB = 3;
     
      
      if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
        setImageUploadError(`Image file is too large. Max allowed size is ${MAX_FILE_SIZE_MB}MB.`);
        setSelectedProfileImageFile(null);
        setDisplayProfileImageUrl(userProfile?.userImgUrl || '/man.png');
        return;
      }
  
      setSelectedProfileImageFile(file);
      setImageUploadError(null);
      setImageUploadSuccess(false);
      setError(null);
      setSaving(false);
      setDisplayProfileImageUrl(URL.createObjectURL(file)); 
      setInstancePropic(URL.createObjectURL(file));
    } else {
      setSelectedProfileImageFile(null);
      // Revert to the original image or default if the selection is cleared
      if (userProfile) {
        // Only revoke if the current display image is a blob URL
        if (displayProfileImageUrl && displayProfileImageUrl.startsWith('blob:')) {
            URL.revokeObjectURL(displayProfileImageUrl);
        }
        setDisplayProfileImageUrl(userProfile.userImgUrl || '/man.png');
      } else {
        if (displayProfileImageUrl && displayProfileImageUrl.startsWith('blob:')) {
            URL.revokeObjectURL(displayProfileImageUrl);
        }
        setDisplayProfileImageUrl('/man.png');
      }
    }
  }, [userProfile, displayProfileImageUrl]); // Added userProfile and displayProfileImageUrl to dependency array

  const handleProfileImageUpload = useCallback(async () => {
    if (!selectedProfileImageFile) {
      setImageUploadError('Please select an image file to upload.');
      return;
    }
    if (!userProfile?.id) {
        setImageUploadError("User ID not found. Cannot upload image.");
        return;
    }
    if (!API_BASE_URL) {
        setImageUploadError("API_BASE_URL is not configured for image upload.");
        return;
    }

    setIsUploadingImage(true);
    setImageUploadError(null);
    setImageUploadSuccess(false);

    const formData = new FormData();
    formData.append('profilePicture', selectedProfileImageFile);

    try {
      const response = await axios.put(`${API_BASE_URL}/auth/profilePics/edit/${userProfile.id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        withCredentials: true,
      });

      
      const newImgUrl = response.data.userImgUrl;

      // Revoke the old object URL if it was a preview
      if (displayProfileImageUrl && displayProfileImageUrl.startsWith('blob:')) {
        URL.revokeObjectURL(displayProfileImageUrl);
      }

      setUserProfile(prev => prev ? { ...prev, userImgUrl: newImgUrl } : null);
      setInitialUserProfile(prev => prev ? { ...prev, userImgUrl: newImgUrl } : null);
      setSelectedProfileImageFile(null);
      setImageUploadSuccess(true);
      toast.success("Profile image uploaded!");
      // Set displayProfileImageUrl to the newly uploaded URL
      refresh();
      setDisplayProfileImageUrl(`${instancePropic}` || '/man.png');
      setInitialUserProfile(prev => prev ? { ...prev, userImgUrl: newImgUrl } : null);

    } catch (err) {
      console.error("Error uploading profile image:", err);
      if (axios.isAxiosError(err) && err.response) {
        setImageUploadError(`Image upload failed: ${err.response.data?.message || err.response.statusText}`);
        toast.error(`Image upload failed: ${err.response.data?.message || err.response.statusText}`);
      } else {
        setImageUploadError(`An unexpected error occurred during image upload: ${err instanceof Error ? err.message : String(err)}`);
        toast.error('An unexpected error occurred during image upload.');
      }
      // If upload fails, revert display image to original or default
      if (displayProfileImageUrl && displayProfileImageUrl.startsWith('blob:')) {
        URL.revokeObjectURL(displayProfileImageUrl);
      }
      if (userProfile) {
        setDisplayProfileImageUrl(userProfile.userImgUrl || '/man.png');
      } else {
        setDisplayProfileImageUrl('/man.png');
      }
    } finally {
      setIsUploadingImage(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = ''; // Clear the file input
      }
    }
  }, [selectedProfileImageFile, userProfile, displayProfileImageUrl, instancePropic, refresh]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userProfile?.id) {
      toast.error("User profile ID not found. Cannot save.");
      return;
    }
    if (!API_BASE_URL) {
      setError("API_BASE_URL is not configured. Cannot save.");
      return;
    }

    if (formFullName === ''){
      setError("Full name is required.");
      return;
    }

    setSaving(true);
    setError(null);
    try {
      const dataToSave = {
        fullName: formFullName,
      };

      await axios.put(`${API_BASE_URL}/auth/edit/name/${userProfile.id}`, dataToSave, {
        withCredentials: true,
        headers: { 'Content-Type': 'application/json' }
      });

      setUserProfile(prev => prev ? { ...prev, ...dataToSave } as UserProfile : null);
      setInitialUserProfile(prev => prev ? { ...prev, ...dataToSave } as UserProfile : null);

      toast.success('Account profile updated successfully!');

    } catch (err) {
      console.error("Failed to save account profile:", err);
      if (axios.isAxiosError(err) && err.response) {
        setError(`Failed to save: ${err.response.data?.message || err.response.statusText}`);
        toast.error(`Failed to save: ${err.response.data?.message || err.response.statusText}`);
      } else {
        setError(`An unexpected error occurred: ${err instanceof Error ? err.message : String(err)}`);
        toast.error('An unexpected error occurred while saving.');
      }
    } finally {
      setSaving(false);
    }
  }, [formFullName, userProfile]);

  const hasFormChanges = initialUserProfile?.fullName !== formFullName;

  

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100dvh-108px)] text-red-600">
      <PageLost404 
        header={t("msg_wrong")}
        message={error}
        reload={() => window.location.reload()}
        />
      </div>
    );
  }

  if (!userProfile) {
    // We already open modal in useEffect, no need to call it again here
    // openModal("loading"); 
    return null; // Or a loading spinner, but null will prevent rendering of the rest of the component
  }

  return (

    <div className="p-1 w-full bg-white rounded-xs h-[calc(100dvh-110px)] overflow-auto custom-scrollbar">
      <div className='overflow-auto h-full custom-scrollbar px-4 py-4'>
      <h1 className="text-xl font-bold text-gray-800 text-center mb-8">{t("hd_profileSettings")}</h1>

      <div className="space-y-6">
        {/* Profile Image Section */}
        <div className="flex flex-col items-center justify-center p-6 bg-gray-50 rounded-xs border border-dashed border-gray-200">
          <label htmlFor="profile-image-upload-input" className="cursor-pointer mb-4 relative group">
            {displayProfileImageUrl ? (
              <Image
                src={displayProfileImageUrl}
                alt="Profile Preview"
                width={128}
                height={128}
                className="w-32 h-32 object-cover rounded-full border-4 border-white shadow-md transition-all duration-200 ease-in-out group-hover:scale-105"
                priority
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/man.png'; 
                  (e.target as HTMLImageElement).alt = "Default User Image";
                }}
              />
            ) : (
              <div className="w-32 h-32 flex items-center justify-center bg-gray-200 rounded-full text-gray-500 border-4 border-dashed border-gray-400 group-hover:scale-105 transition-all duration-200 ease-in-out">
                <UserCircleIcon className="w-20 h-20" />
              </div>
            )}
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <PhotoIcon className="w-8 h-8 text-white" />
            </div>
            <input
              id="profile-image-upload-input"
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={handleProfileImageFileChange}
              className="hidden"
            />
          </label>
          <p className="mt-3 text-sm text-gray-600 font-medium">
            {selectedProfileImageFile
              ? `${selectedProfileImageFile.name.slice(0, 14)}...${selectedProfileImageFile.name.slice(-6)}`
              : t("lbl_changeProfilePics")}
          </p>

          <p className="text-xs text-gray-500 mb-4 mt-2">PNG, JPG, JPEG, GIF up to 3MB</p>
          
          <button
            type="button"
            onClick={handleProfileImageUpload}
            disabled={!selectedProfileImageFile || isUploadingImage || !API_BASE_URL}
            className={`flex items-center px-4 py-2 rounded-md text-sm font-semibold transition-all duration-200 ${
              !selectedProfileImageFile || isUploadingImage || !API_BASE_URL
                ? 'bg-blue-300 text-white cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 text-white shadow-md'
            }`}
          >
            {isUploadingImage ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Uploading...
              </>
            ) : (
              <>
                <CloudArrowUpIcon className="w-5 h-5 mr-2" /> Upload Image
              </>
            )}
          </button>

          {imageUploadSuccess && (
            <p className="mt-3 flex items-center text-sm text-green-600 animate-fade-in">
              <CheckCircleIcon className="w-5 h-5 mr-1" /> Image uploaded!
            </p>
          )}
          {imageUploadError && (
            <p className="mt-3 flex items-center text-sm text-red-600 animate-fade-in">
              <XCircleIcon className="w-5 h-5 mr-1" /> {imageUploadError}
            </p>
          )}
        </div>

        {/* Account Details Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Username (Email) - Read-only */}
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">{t("lbl_username")}</label>
            <input
              type="email"
              id="username"
              name="username"
              value={userProfile.username}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 bg-gray-100 text-gray-500 cursor-not-allowed"
              readOnly
              aria-describedby="username-help"
            />
            <p id="username-help" className="mt-1 text-xs text-gray-500">
              {t("msg_cantChangeName")}
            </p>
          </div>

          {/* Full Name */}
          <div>
            <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">{t("lbl_fullName")}</label>
            <input
              type="text"
              id="fullName"
              name="fullName"
              value={formFullName}
              onChange={handleFullNameChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-blue-600 focus:border-blue-600"
              required
            />
          </div>

          {/* Role (Display only) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t("lbl_role")}</label>
            <p className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 bg-gray-100 text-gray-500 cursor-not-allowed">
              {userProfile.role}
            </p>
          </div>

          {/* Business Information Section (Display Only) */}
          {userProfile.business && (
            <div className="border-t border-gray-200 pt-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4"> {t("kw_associated") + " " + t("hd_bizInfo")}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">{t("io_bizNn")}</label>
                  <p className="text-sm text-gray-900 
                                border-[0.5px] border-gray-300 
                                rounded-xs py-2.5 pl-2 mt-3">
                   {userProfile.business.businessName}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">{t("io_bizShortNn")}</label>
                  <p className="text-sm text-gray-900 
                                border-[0.5px] border-gray-300 
                                rounded-xs py-2.5 pl-2 mt-3">
                    {userProfile.business.businessNameShortForm}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">{t("io_dfCurrency")}</label>
                  <p className="text-sm text-gray-900 
                                border-[0.5px] border-gray-300 
                                rounded-xs py-2.5 pl-2 mt-3">
                    {userProfile.business.defaultCurrency}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">{t("io_taxRate")}</label>
                  <p className="text-sm text-gray-900 
                                border-[0.5px] border-gray-300 
                                rounded-xs py-2.5 pl-2 mt-3">
                    {userProfile.business.taxRate * 100}%
                  </p>
                </div>
                {userProfile.business.businessLogo && (
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t("lbl_bizLogo")}</label>
                    <div className="relative w-[80px] h-[80px]"> {/* Parent container with defined dimensions */}
                    <Image
                      src={userProfile.business.businessLogo || '/man.png'}
                      alt={`${userProfile.business.businessName} Logo`}
                      fill
                      sizes="80px"
                      className="rounded-xs object-contain border border-gray-200 p-1"
                      // REMOVE priority prop: priority
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/man.png';
                        (e.target as HTMLImageElement).alt = "Default Business Image";
                      }}
                    />
                  </div>
                  </div>
                )}
              </div>
              <p className="mt-4 text-sm text-gray-600">
                {t("msg_cantChangeBiz")}
              </p>
            </div>
          )}

          {/* Password Reset Section */}
          <div className="border-t border-gray-200 pt-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Password Settings</h2>
            <p className="text-sm text-gray-600 mb-4">
              For security reasons, password changes are handled through a dedicated process.
            </p>
            <button
              type="button"
              className="px-3 py-2 bg-yellow-500 text-white rounded-md shadow-sm hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 transition-colors duration-200 text-sm"
    
            >
              Request to change Password
            </button>
          </div>

          {/* Save Changes Button for formFullName */}
          <div className="flex justify-end pt-6">
            <button
              type="submit"
              disabled={saving || !hasFormChanges || !API_BASE_URL}
              className={`w-full sm:w-auto flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white transition-colors duration-200 ${
                saving || !hasFormChanges || !API_BASE_URL
                  ? 'bg-blue-600 text-white cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-600'
              }`}
            >
              {saving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Saving...
                </>
              ) : (
                'Save Profile Changes'
              )}
            </button>
          </div>
          {/* General form feedback (for fullName saves) */}
          {error && (
            <p className="text-sm text-red-600 text-center mt-4">{error}</p>
          )}
        </form>
      </div>
      </div>
    </div>
  );
};

export default AccountProfileSettingsPage;