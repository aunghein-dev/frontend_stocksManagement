"use client";

import * as React from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  MenuItem,
  Snackbar,
  Alert,
  AlertColor,
  CircularProgress,
} from '@mui/material';
import {
  UserRound,
  Tag,
  MapPin,
  Phone,
  Save,
  X as CloseIcon,
  AlertTriangle,
} from 'lucide-react';
import ImageUploadComponent from '@/components/common/ImageUploadComponent';
import { useModalStore } from "@/store/modalStore";
import { type Customer } from "@/components/data-display/customerCard";
import axios from "axios";
import { useTranslation } from "@/hooks/useTranslation";
import { useCustomer } from "@/hooks/useCustomer";
import { isCustomer } from '@/components/utils/typeGuard';

// --- 1. Define Form State Interface ---
interface EditCustomerFormData {
  imgUrl: string | null;
  name: string;
  typeOfCustomer: string;
  address1: string;
  phoneNo1: string;
  phoneNo2: string;
  township: string;
  city: string;
}

// --- 2. Define Validation Errors State Interface ---
interface FormErrors {
  name?: string;
  typeOfCustomer?: string;
  phoneNo1?: string;
}

// --- 3. Customer Types for Select Dropdown ---
const customerTypes = [
  'Retailer',
  'Wholesaler',
  'Distributor',
  'Individual',
  'Other'
];

export default function EditCustomer() {
  const { modalData, closeModal } = useModalStore();
  const API = process.env.NEXT_PUBLIC_API_URL;
  const { refresh } = useCustomer();
  const { t } = useTranslation();

  const customer = isCustomer(modalData) ? modalData : null;

  // Initialize form data with a controlled component approach
  const [formData, setFormData] = React.useState<EditCustomerFormData>(() => {
    if (customer) {
      return {
        imgUrl: customer.imgUrl && customer.imgUrl.trim().toUpperCase() !== "NULL" ? customer.imgUrl : null,
        name: customer.name,
        // Crucial: Ensure the initial value for typeOfCustomer is an empty string
        // if the customer's type is undefined or null, so the placeholder shows.
        typeOfCustomer: customer.typeOfCustomer || '',
        address1: customer.address1,
        phoneNo1: customer.phoneNo1,
        phoneNo2: customer.phoneNo2,
        township: customer.township,
        city: customer.city,
      };
    }
    // Fallback if no valid customer data is provided (e.g., direct modal open without data)
    return {
      imgUrl: null,
      name: '',
      typeOfCustomer: '', // Default to empty string for the "Select Type" placeholder
      address1: '',
      phoneNo1: '',
      phoneNo2: '',
      township: '',
      city: '',
    };
  });

  const [errors, setErrors] = React.useState<FormErrors>({});
  const [loading, setLoading] = React.useState(false);
  const [snackbarOpen, setSnackbarOpen] = React.useState(false);
  const [snackbarMessage, setSnackbarMessage] = React.useState('');
  const [snackbarSeverity, setSnackbarSeverity] = React.useState<AlertColor>('success');
  const [uploadImageError, setUploadImageError] = React.useState<string | null>(null);
  const [selectedImageFile, setSelectedImageFile] = React.useState<File | null>(null);

  // --- Handle Input Changes ---
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear validation error if user selects an option (even the placeholder initially)
    if (errors.typeOfCustomer) {
      setErrors((prev) => ({ ...prev, typeOfCustomer: undefined }));
    }
  };

  // --- Form Validation Logic ---
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    if (!formData.name.trim()) {
      newErrors.name = t('err_custNameRequired');
    }
    // Validation check: if typeOfCustomer is empty string (meaning placeholder is selected)
    if (!formData.typeOfCustomer || formData.typeOfCustomer === '') {
      newErrors.typeOfCustomer = t('err_custTypeRequired');
    }
    if (!formData.phoneNo1.trim()) {
      newErrors.phoneNo1 = t('err_phoneRequired');
    } else if (!/^\d{7,15}$/.test(formData.phoneNo1.trim())) {
      newErrors.phoneNo1 = t('err_invalidPhoneFormat');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // --- Handle Form Submission ---
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!customer) {
        setSnackbarMessage("Customer data is missing. Cannot save changes.");
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
        return;
    }

    if (validateForm()) {
      setLoading(true);
      try {
        const formDataToSubmit = new FormData();

        // Append all text fields
        formDataToSubmit.append('name', formData.name);
        formDataToSubmit.append('typeOfCustomer', formData.typeOfCustomer);
        formDataToSubmit.append('address1', formData.address1);
        formDataToSubmit.append('phoneNo1', formData.phoneNo1);
        formDataToSubmit.append('phoneNo2', formData.phoneNo2);
        formDataToSubmit.append('township', formData.township);
        formDataToSubmit.append('city', formData.city);

        // Append image file if a new one is selected
        if (selectedImageFile) {
          formDataToSubmit.append('image', selectedImageFile);
        } else if (formData.imgUrl === null && selectedImageFile === null) {
          // If imgUrl is null and no new file, implies image was cleared or never existed.
          // Send a specific value to tell backend to clear the image if your API supports it.
          // Example: formDataToSubmit.append('clearImage', 'true');
        }

        const response = await axios.put(
          `${API}/update/customer/${customer.cid}`,
          formDataToSubmit,
          {
            withCredentials: true,
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          }
        );

        if (response.status === 200 || response.status === 201) {
          setSnackbarMessage(t('msg_customerUpdatedSuccess'));
          setSnackbarSeverity('success');
          refresh();
          closeModal();
        } else {
          setSnackbarMessage(t('msg_unexpectedError'));
          setSnackbarSeverity('warning');
        }
        setSnackbarOpen(true);
      } catch (err: any) {
        console.error("Update error:", err);
        setSnackbarMessage(`${t('msg_failedToUpdateCustomer')}: ${err.response?.data?.message || err.message || t('msg_unknownError')}`);
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
      } finally {
        setLoading(false);
      }
    } else {
      setSnackbarMessage(t('msg_correctFormErrors'));
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };

  // --- Handle Clear Form (resets to original customer data if available) ---
  const handleClear = React.useCallback(() => {
    if (customer) {
        setFormData({
            imgUrl: customer.imgUrl && customer.imgUrl.trim().toUpperCase() !== "NULL" ? customer.imgUrl : null,
            name: customer.name,
            typeOfCustomer: customer.typeOfCustomer || '', // Reset to original or empty
            address1: customer.address1,
            phoneNo1: customer.phoneNo1,
            phoneNo2: customer.phoneNo2,
            township: customer.township,
            city: customer.city,
        });
    } else {
        // If customer is null, clear to empty form
        setFormData({
            imgUrl: null,
            name: '',
            typeOfCustomer: '',
            address1: '',
            phoneNo1: '',
            phoneNo2: '',
            township: '',
            city: '',
        });
    }
    setErrors({});
    setSnackbarOpen(false);
    setSelectedImageFile(null);
    setUploadImageError(null);
  }, [customer]);


  // --- Handle Snackbar Close ---
  const handleCloseSnackbar = (event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbarOpen(false);
  };

  // --- Handle Image Upload Selection ---
  const handleUploadImageSelected = React.useCallback((file: File | null) => {
    setUploadImageError(null);
    if (file) {
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        setUploadImageError(t("err_imageSizeLimit"));
        setSelectedImageFile(null);
        setFormData(prev => ({ ...prev, imgUrl: null }));
        return;
      }
      setSelectedImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, imgUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    } else {
      setSelectedImageFile(null);
      setFormData(prev => ({ ...prev, imgUrl: null }));
    }
  }, [t]);

  // If customer data is not valid, display an error message instead of the form
  if (!customer) {
    return (
      <section className='fixed inset-0 bg-black/20 flex items-center justify-center animate-fade-in z-[9999]'>
        <div className='bg-white rounded-sm shadow-2xl w-[90%] max-w-md p-6 space-y-5 animate-fade-in'>
          <div className="flex items-center justify-between">
            <div className="flex gap-2 items-center text-red-600">
              <AlertTriangle className="w-6 h-6" />
              <h2 className="text-xl font-semibold">Error</h2>
            </div>
            <button
              onClick={closeModal}
              className="text-gray-500 hover:text-gray-700"
              aria-label="Close"
            >
              <CloseIcon className="w-6 h-6" />
            </button>
          </div>
          <p className="text-gray-700">
            {t("msg_noCustomerDataForEdit")}
          </p>
          <div className="flex justify-end pt-2">
            <Button
              variant="outlined"
              color="secondary"
              onClick={closeModal}
              sx={{ borderRadius: '4px', textTransform: 'none' }}
            >
              {t("btnTxt_close")}
            </Button>
          </div>
        </div>
      </section>
    );
  }

  // Render the form only if customer data is valid
  return (
    <section
      className='fixed inset-0 bg-black/20 flex items-center justify-center animate-fade-in z-[9999]
                 px-2'
    >
      <div className='flex flex-col h-[600px] w-full sm:w-[800px] rounded-lg shadow-xl border border-gray-200 bg-white animate-slide-up relative overflow-hidden'>
        {/* Header */}
        <div className='flex items-center justify-between p-4 border-b border-gray-200 flex-shrink-0'>
          <Typography
            variant="h6"
            component="h1"
            sx={{
              fontWeight: 600,
              color: '#333',
              display: 'flex',
              alignItems: 'center',
              gap: 1,
            }}
          >
            <UserRound size={20} /> {t("hd_editCustomer")}
          </Typography>
          <button
            onClick={closeModal}
            className="text-gray-500 hover:text-gray-700"
            aria-label="Close"
          >
            <CloseIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className='flex-grow overflow-y-auto custom-scrollbar p-4 py-6'>
          <Box component="form" onSubmit={handleSubmit} noValidate className='flex flex-col sm:flex-row'
               id="edit-customer-form" >
            {/* Image Upload Component */}
            <ImageUploadComponent
              id="customerUpload"
              label={t("lbl_customerImage")}
              currentImageUrl={formData.imgUrl || ''}
              onImageSelected={handleUploadImageSelected}
              isLoading={false}
              error={uploadImageError}
              className="rounded-sm mb-4 sm:mr-6 min-w-[220px]"
            />
            {/* Main Flex container for all form fields */}
            <Box
              sx={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: { xs: 2, sm: 3 },
                flexGrow: 1,
              }}
            >
              {/* Customer Name */}
              <TextField
                label={t("lbl_customerName")}
                name="name"
                value={formData.name}
                onChange={handleChange}
                error={!!errors.name}
                helperText={errors.name}
                required
                InputProps={{
                  startAdornment: <UserRound size={20} style={{ marginRight: 8 }} />,
                }}
                sx={{
                  width: {
                    xs: 'calc(50% - 8px)',
                    sm: `calc(50% - ${24 / 2}px)`
                  },
                  '& .MuiOutlinedInput-root': { borderRadius: '8px' },
                }}
              />

             {/* Type of Customer */}
              <TextField
                select
                label={t("lbl_customerType")}
                name="typeOfCustomer"
                value={formData.typeOfCustomer}
                onChange={handleSelectChange}
                error={!!errors.typeOfCustomer}
                helperText={errors.typeOfCustomer}
                required
                disabled // <--- Add this prop to disable the field
                InputProps={{
                  // readOnly: true, // This is no longer strictly necessary if 'disabled' is true, as disabled implies readOnly.
                  startAdornment: <Tag size={20} style={{ marginRight: 8 }} />,
                }}
                slotProps={{
                  select: {
                    native: false,
                    MenuProps: {
                      PaperProps: {
                        sx: {
                          maxHeight: 200,
                        },
                      },
                    },
                  },
                }}
                sx={{
                  width: {
                    xs: 'calc(50% - 8px)',
                    sm: `calc(50% - ${24 / 2}px)`
                  },
                  '& .MuiOutlinedInput-root': { borderRadius: '8px' },
                }}
              >
                {/* Placeholder MenuItem */}
                <MenuItem value="">
                  <em>{t("txt_selectType")}</em>
                </MenuItem>
                {customerTypes.map((type) => (
                  <MenuItem key={type} value={type}>
                    {type}
                  </MenuItem>
                ))}
              </TextField>

              {/* Primary Phone Number */}
              <TextField
                label={t("lbl_primaryPhone")}
                name="phoneNo1"
                value={formData.phoneNo1}
                onChange={handleChange}
                error={!!errors.phoneNo1}
                helperText={errors.phoneNo1}
                required
                type="tel"
                InputProps={{
                  startAdornment: <Phone size={20} style={{ marginRight: 8 }} />,
                }}
                sx={{
                  width: {
                    xs: 'calc(50% - 8px)',
                    sm: `calc(50% - ${24 / 2}px)`
                  },
                  '& .MuiOutlinedInput-root': { borderRadius: '8px' }
                }}
              />

              {/* Secondary Phone Number (Optional) */}
              <TextField
                label={t("lbl_secondaryPhone")}
                name="phoneNo2"
                value={formData.phoneNo2}
                onChange={handleChange}
                type="tel"
                InputProps={{
                  startAdornment: <Phone size={20} style={{ marginRight: 8 }} />,
                }}
                sx={{
                  width: {
                    xs: 'calc(50% - 8px)',
                    sm: `calc(50% - ${24 / 2}px)`
                  },
                  '& .MuiOutlinedInput-root': { borderRadius: '8px' }
                }}
              />

              {/* Full Address (takes full width) */}
              <TextField
                fullWidth
                label={t("lbl_fullAddress")}
                name="address1"
                value={formData.address1}
                onChange={handleChange}
                multiline
                rows={2}
                InputProps={{
                  startAdornment: (
                    <MapPin size={20} style={{ marginRight: 8, alignSelf: 'flex-start', marginTop: 8 }} />
                  ),
                }}
                sx={{
                  width: '100%',
                  '& .MuiOutlinedInput-root': { borderRadius: '8px' },
                }}
              />
              {/* Township */}
              <TextField
                label={t("lbl_township")}
                name="township"
                value={formData.township}
                onChange={handleChange}
                InputProps={{
                  startAdornment: <MapPin size={20} style={{ marginRight: 8 }} />,
                }}
                sx={{
                  width: {
                    xs: 'calc(50% - 8px)',
                    sm: `calc(50% - ${24 / 2}px)`
                  },
                  '& .MuiOutlinedInput-root': { borderRadius: '8px' }
                }}
              />

              {/* City */}
              <TextField
                label={t("lbl_city")}
                name="city"
                value={formData.city}
                onChange={handleChange}
                InputProps={{
                  startAdornment: <MapPin size={20} style={{ marginRight: 8 }} />,
                }}
                sx={{
                  width: {
                    xs: 'calc(50% - 8px)',
                    sm: `calc(50% - ${24 / 2}px)`
                  },
                  '& .MuiOutlinedInput-root': { borderRadius: '8px' }
                }}
              />
            </Box>
          </Box>
        </div>

        {/* Footer Buttons */}
        <div className='flex justify-end gap-3 py-3 px-4 border-t border-gray-200 flex-shrink-0'>
          <Button
            variant="outlined"
            color="secondary"
            onClick={handleClear}
            disabled={loading}
            startIcon={<CloseIcon size={20} />}
            sx={{
              borderRadius: '4px',
              textTransform: 'none',
            }}
          >
            {t("btnTxt_reset")}
          </Button>
          <Button
            variant="contained"
            type="submit"
            form="edit-customer-form"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <Save size={20} />}
            sx={{
              borderRadius: '4px',
              backgroundColor: '#3b82f6',
              '&:hover': {
                backgroundColor: '#2563eb',
              },
              color: '#fff',
              border: '0.5px solid #2563eb',
              textTransform: 'none',
              padding: '8px 16px',
            }}
          >
            {loading ? t('btnTxt_saving') : t('btnTxt_saveChanges')}
          </Button>
        </div>

        {/* Snackbar for user feedback */}
        <Snackbar
          open={snackbarOpen}
          autoHideDuration={6000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <Alert onClose={handleCloseSnackbar} severity={snackbarSeverity} sx={{ width: '280px' }}>
            {snackbarMessage}
          </Alert>
        </Snackbar>
      </div>
    </section>
  );
}