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
  Eraser,
} from 'lucide-react';
import { X as CloseIcon } from "lucide-react";
import ImageUploadComponent from '@/components/common/ImageUploadComponent';
import { useInfo } from '@/hooks/useInfo';
import dayjs from 'dayjs';
import axios from 'axios';
import { useTranslation } from '@/hooks/useTranslation';


// --- 1. Define Form State Interface ---
interface NewCustomerFormData {
  imgUrl: string | null;
  name: string;
  typeOfCustomer: string;
  address1: string;
  phoneNo1: string;
  phoneNo2: string;
  township: string;
  city: string;
}

// --- 2. Define Initial Form State ---
const initialFormData: NewCustomerFormData = {
  imgUrl: null,
  name: '',
  typeOfCustomer: '',
  address1: '',
  phoneNo1: '',
  phoneNo2: '',
  township: '',
  city: '',
};

// --- 3. Define Validation Errors State Interface ---
interface FormErrors {
  name?: string;
  typeOfCustomer?: string;
  phoneNo1?: string;
}

// --- 4. Customer Types for Select Dropdown ---
const customerTypes = [
  'Retailer',
  'Wholesaler',
  'Distributor',
  'Individual',
  'Other'
];

export default function NewCustomer( props: {
    closePopup: () => void;
    refresh: () => void;
}) {
  const [formData, setFormData] = React.useState<NewCustomerFormData>(initialFormData);
  const [errors, setErrors] = React.useState<FormErrors>({});
  const [loading, setLoading] = React.useState(false);
  const [snackbarOpen, setSnackbarOpen] = React.useState(false);
  const [snackbarMessage, setSnackbarMessage] = React.useState('');
  const [snackbarSeverity, setSnackbarSeverity] = React.useState<AlertColor>('success');
  const [uploadImageError, setUploadImageError] = React.useState<string | null>(null);
  const [selectedImageFile, setSelectedImageFile] = React.useState<File | null>(null);
  const { business } = useInfo();
  const bizId = business?.businessId;
  const {t} = useTranslation();

  // --- 5. Handle Input Changes ---
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error for the field as user types
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors.typeOfCustomer) {
      setErrors((prev) => ({ ...prev, typeOfCustomer: undefined }));
    }
  };

  // --- 6. Form Validation Logic ---
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    if (!formData.name.trim()) {
      newErrors.name = 'Customer Name is required.';
    }
    if (!formData.typeOfCustomer) {
      newErrors.typeOfCustomer = 'Customer Type is required.';
    }
    // Basic phone number validation: just check if not empty for phoneNo1
    if (!formData.phoneNo1.trim()) {
      newErrors.phoneNo1 = 'Primary Phone Number is required.';
    } else if (!/^\d{7,15}$/.test(formData.phoneNo1.trim())) { // Example: 7 to 15 digits
        newErrors.phoneNo1 = 'Invalid phone number format.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // --- 7. Handle Form Submission ---
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (validateForm()) {
      setLoading(true);
      try {
        const setSubmittingForm = new FormData(); 
       
        const sentJoson = {
          customerLastDueDate: null,
          address1: formData.address1,
          bizId: bizId,
          boughtAmt: 0,
          boughtCnt: 0,
          cid: `${bizId}-${dayjs().format('YYMMDDHHmmss')}`,
          city: formData.city,
          customerDueAmt: 0,
          lastShopDate: null,
          name: formData.name,
          phoneNo1: formData.phoneNo1,
          phoneNo2: formData.phoneNo2,
          township: formData.township,
          typeOfCustomer: formData.typeOfCustomer,
          imgUrl: formData.imgUrl,
        };
        
       setSubmittingForm.append("customer", new Blob([JSON.stringify(sentJoson)], { type: "application/json" }));
        if (selectedImageFile) {
          setSubmittingForm.append("image", selectedImageFile);
        }

        
       const response =
        await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/customer/new/biz/${bizId}`, setSubmittingForm, {
            headers: { "Content-Type": "multipart/form-data" },
             withCredentials: true,
        });

        await new Promise((resolve) => setTimeout(resolve, 1500)); // Simulate network delay
        if(response.status === 200 || response.status === 201) {
          
          setSnackbarMessage(t("msg_CusAdded"));
          props.refresh();
          setSnackbarSeverity('success');
          setSnackbarOpen(true);
          setFormData(initialFormData); // Clear form on success
          setErrors({}); // Clear any lingering errors
          setSelectedImageFile(null); // Clear selected file
          setUploadImageError(null); // Clear image error
        }

       
      } catch (err: unknown) {
        console.error("Submission error:", err);
        setSnackbarMessage(`Failed to add customer: ${(err as { message: string }).message || "An unknown error occurred."}`);
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
      } finally {
        setLoading(false);
      }
    } else {
      setSnackbarMessage(t("msg_correctFormErrors"));
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };

  // --- 8. Handle Clear Form ---
  const handleClear = () => {
    setFormData(initialFormData);
    setErrors({});
    setSnackbarOpen(false); // Close any open snackbar
    setSelectedImageFile(null); // Clear selected file
    setUploadImageError(null); // Clear image error
  };

  // --- 9. Handle Snackbar Close ---
  const handleCloseSnackbar = (event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbarOpen(false);
  };

    const handleUploadImageSelected = React.useCallback((file: File | null) => {
      setUploadImageError(null); // Clear previous error
      if (file) {
        if (file.size > 10 * 1024 * 1024) { // 10MB limit
          setUploadImageError("Group image must be less than 10MB.");
          setSelectedImageFile(null); // Ensure file state is cleared
          setFormData(prev => ({ ...prev, imgUrl: null })); // Set imgUrl to null
          return;
        }
        setSelectedImageFile(file); // Set the actual file object
        const reader = new FileReader();
        reader.onloadend = () => {
          // reader.result will be a base64 string (data URL)
          setFormData(prev => ({ ...prev, imgUrl: reader.result as string }));
        };
        reader.readAsDataURL(file); // Read the file as a data URL
      } else {
        // If file is null (e.g., user cleared selection)
        setSelectedImageFile(null); // Clear selected file
        setFormData(prev => ({ ...prev, imgUrl: null })); // Clear imgUrl in form data
      }
    }, []);

  return (
    <section
      className='flex flex-col h-[95dvh] sm:h-[80dvh] w-full sm:w-[800px] rounded-xs shadow-xl border border-gray-200 bg-white animate-slide-up relative overflow-hidden'
    >
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
          <UserRound size={20} /> {t("newCusEntry")}
        </Typography>
        <button
          onClick={props.closePopup}
          className="text-gray-500 hover:text-gray-700"
          aria-label="Close"
        >
          <CloseIcon className="w-6 h-6" />
        </button>
      </div>

      {/* Scrollable Body */}
      <div className='flex-grow overflow-y-auto custom-scrollbar p-4 py-6'>
        <Box component="form" onSubmit={handleSubmit} noValidate className='flex flex-col sm:flex-row'
             id="new-customer-form" >
          {/* Image Upload Component */}
          <ImageUploadComponent
            id="customerUpload"
            label={t("cusImage")}
            currentImageUrl={formData.imgUrl || ''}
            onImageSelected={handleUploadImageSelected}
            isLoading={false}
            error={uploadImageError}
            className="rounded-xs mb-4 sm:mr-6 min-w-[220px]" // Adjusted margin-bottom for better spacing
          />
          {/* Main Flex container for all form fields */}
          <Box
            sx={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: { xs: 2, sm: 3 },
              flexGrow: 1, // Allows form fields to take up available space
            }}
          >
            {/* Customer Name */}
            <TextField
              label={t("custName")}
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
              label={t("custType")}
              name="typeOfCustomer"
              value={formData.typeOfCustomer}
              onChange={handleSelectChange}
              error={!!errors.typeOfCustomer}
              helperText={errors.typeOfCustomer}
              required
              InputProps={{
                startAdornment: <Tag size={20} style={{ marginRight: 8 }} />,
              }}
              sx={{
                width: {
                  xs: 'calc(50% - 8px)',
                  sm: `calc(50% - ${24 / 2}px)`
                },
                '& .MuiOutlinedInput-root': { borderRadius: '8px' },
              }}
            >
              <MenuItem value="">
                <em>Select Type</em>
              </MenuItem>
              {customerTypes.map((type) => (
                <MenuItem key={type} value={type}>
                  {type}
                </MenuItem>
              ))}
            </TextField>

            {/* Primary Phone Number */}
            <TextField
              label={t("custPhone1")}
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
              label={t("custPhone2")}
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
              label={t("custAddress")}
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
              label={t("custTownship")}
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
              label={t("custCity")}
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
          startIcon={<Eraser size={20} />}
          sx={{
            borderRadius: '4px',
            textTransform: 'none',
          }}
        >
          {t("btnTxt_clear")}
        </Button>
        <Button
          variant="contained"
          type="submit" 
          form="new-customer-form" 
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
          {loading ? t("btnTxt_saving") : t("btnTxt_saveCus")}
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
    </section>
  );
}