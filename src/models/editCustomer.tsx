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
    DollarSign,
    CalendarDays,
} from 'lucide-react';
import ImageUploadComponent from '@/components/common/ImageUploadComponent';
import { useModalStore } from "@/store/modalStore";
import axios from "axios";
import { useTranslation } from "@/hooks/useTranslation";
import { useCustomer } from "@/hooks/useCustomer";
import { isCustomer } from '@/components/utils/typeGuard';
import dayjs from 'dayjs'; // Import dayjs


// --- 1. Define Form State Interface ---
interface EditCustomerFormData {
    rowId: number | null;
    customerLastDueDate: string | null;
    address1: string;
    bizId: number | undefined; // bizId can be undefined initially
    boughtAmt: number;
    boughtCnt: number;
    cid: string;
    city: string;
    customerDueAmt: number; // Corrected to match form logic
    lastShopDate: string | null;
    name: string;
    phoneNo1: string;
    phoneNo2: string;
    township: string;
    typeOfCustomer: string;
    imgUrl: string | null; // imgUrl can be null if no image
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
  

    // Helper function to format date to YYYY-MM-DD
    const formatDateToInput = (dateString: string | null | undefined): string => {
        if (dateString) {
            const date = dayjs(dateString);
            return date.isValid() ? date.format('YYYY-MM-DD') : '';
        }
        return '';
    };

    // Initialize form data with a controlled component approach
    const [formData, setFormData] = React.useState<EditCustomerFormData>(() => {
        if (customer) {
            return {
                rowId: customer.rowId,
                customerLastDueDate: formatDateToInput(customer.customerLastDueDate),
                address1: customer.address1 || '',
                bizId: customer.bizId,
                boughtAmt: customer.boughtAmt || 0,
                boughtCnt: customer.boughtCnt || 0,
                cid: customer.cid,
                city: customer.city || '',
                customerDueAmt: customer.customerDueAmt || 0, // Corrected from dueAmount
                lastShopDate: formatDateToInput(customer.lastShopDate),
                name: customer.name || '',
                phoneNo1: customer.phoneNo1 || '',
                phoneNo2: customer.phoneNo2 || '',
                township: customer.township || '',
                typeOfCustomer: customer.typeOfCustomer || '',
                imgUrl: customer.imgUrl || null,
            };
        }
        return {
            rowId: null,
            customerLastDueDate: null,
            address1: '',
            bizId: undefined, 
            boughtAmt: 0,
            boughtCnt: 0,
            cid: '',
            city: '',
            customerDueAmt: 0,
            lastShopDate: null,
            name: '',
            phoneNo1: '',
            phoneNo2: '',
            township: '',
            typeOfCustomer: '',
            imgUrl: null,
        };
    });

    const [errors, setErrors] = React.useState<FormErrors>({});
    const [loading, setLoading] = React.useState(false);
    const [snackbarOpen, setSnackbarOpen] = React.useState(false);
    const [snackbarMessage, setSnackbarMessage] = React.useState('');
    const [snackbarSeverity, setSnackbarSeverity] = React.useState<AlertColor>('success');
    const [uploadImageError, setUploadImageError] = React.useState<string | null>(null);
    const [selectedImageFile, setSelectedImageFile] = React.useState<File | null>(null);

    // Local state for the due amount input's display value (as a string)
    const [displayDueAmount, setDisplayDueAmount] = React.useState<string>(
        formData.customerDueAmt.toString() // Corrected to customerDueAmt
    );

    // Effect to synchronize displayDueAmount with formData.customerDueAmt
    React.useEffect(() => {
        if (Number(displayDueAmount) !== formData.customerDueAmt) { // Corrected to customerDueAmt
            setDisplayDueAmount(formData.customerDueAmt.toString()); // Corrected to customerDueAmt
        }
    }, [formData.customerDueAmt, displayDueAmount]); // Dependency on customerDueAmt

    // Update formData.bizId if business info loads later
    React.useEffect(() => {
        if (formData.bizId !== undefined) {
            setFormData(prev => ({ ...prev, bizId: formData.bizId }));
        }
    }, [formData.bizId]);


    // --- Handle Input Changes ---
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;

        if (name === 'customerDueAmt') { // Corrected name to customerDueAmt
            // Allow only numeric input and one decimal point for customerDueAmt
            if (!/^\d*\.?\d*$/.test(value)) return;

            setDisplayDueAmount(value); // Update the local display state directly
            setFormData((prev) => ({
                ...prev,
                customerDueAmt: value === '' ? 0 : Number(value), // Corrected to customerDueAmt
            }));
        } else {
            // For other fields, including date, just update the value
            setFormData((prev) => ({ ...prev, [name]: value }));
        }

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

    // --- Form Validation Logic ---
    const validateForm = (): boolean => {
        const newErrors: FormErrors = {};
        if (!formData.name.trim()) {
            newErrors.name = t('err_custNameRequired');
        }
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
            setSnackbarMessage(t('msg_cusMg1'));
            setSnackbarSeverity('error');
            setSnackbarOpen(true);
            return;
        }

        if (validateForm()) {
            setLoading(true);
            try {
                const formDataToSubmit = new FormData();

                 const sentJoson = {
                    rowId: customer.rowId,
                    customerLastDueDate: formData.customerLastDueDate,
                    address1: formData.address1,
                    bizId: formData.bizId,
                    boughtAmt: formData.boughtAmt,
                    boughtCnt: formData.boughtCnt,
                    cid: customer.cid,
                    city: formData.city,
                    customerDueAmt: formData.customerDueAmt,
                    lastShopDate: formData.lastShopDate,
                    name: formData.name,
                    phoneNo1: formData.phoneNo1,
                    phoneNo2: formData.phoneNo2,
                    township: formData.township,
                    typeOfCustomer: formData.typeOfCustomer,
                    imgUrl: formData.imgUrl,
                  };


                formDataToSubmit.append("customer", new Blob([JSON.stringify(sentJoson)], { type: "application/json" }));
              
                if (selectedImageFile) {
                    formDataToSubmit.append('image', selectedImageFile);
                } 
                const response = await axios.put(
                    `${API}/customer/update/biz/${formData.bizId}`,
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
                    setSnackbarMessage(t('msg_cusMg1'));
                    setSnackbarSeverity('warning');
                }
                setSnackbarOpen(true);
            } catch (err) {
                console.error("Update error:", err);
                setSnackbarMessage(`${t('msg_cusMg1')}: ${err}`);
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
            const resetDueAmount = customer.customerDueAmt || 0;
            setFormData({
                rowId: customer.rowId,
                customerLastDueDate: formatDateToInput(customer.customerLastDueDate), // Format date on reset
                address1: customer.address1 || '',
                bizId: customer.bizId,
                boughtAmt: customer.boughtAmt || 0,
                boughtCnt: customer.boughtCnt || 0,
                cid: customer.cid,
                city: customer.city || '',
                customerDueAmt: customer.customerDueAmt || 0, // Corrected from dueAmount
                lastShopDate: formatDateToInput(customer.lastShopDate), // Format date on reset
                name: customer.name || '',
                phoneNo1: customer.phoneNo1 || '',
                phoneNo2: customer.phoneNo2 || '',
                township: customer.township || '',
                typeOfCustomer: customer.typeOfCustomer || '',
                imgUrl: customer.imgUrl || null,
            });
            setDisplayDueAmount(resetDueAmount.toString());
        } else {
            setFormData({
                rowId: 0,
                customerLastDueDate: null,
                address1: '',
                bizId: undefined,
                boughtAmt: 0,
                boughtCnt: 0,
                cid: '',
                city: '',
                customerDueAmt: 0,
                lastShopDate: null,
                name: '',
                phoneNo1: '',
                phoneNo2: '',
                township: '',
                typeOfCustomer: '',
                imgUrl: null,
            });
            setDisplayDueAmount('0');
        }
        setErrors({});
        setSnackbarOpen(false);
        setSelectedImageFile(null);
        setUploadImageError(null);
    }, [customer]); // Added bizId and t to dependencies

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

    // Handle focus for dueAmount input
    const handleDueAmountFocus = () => {
        if (displayDueAmount === '0') {
            setDisplayDueAmount('');
        }
    };

    // Handle blur for dueAmount input
    const handleDueAmountBlur = () => {
        if (displayDueAmount === '') {
            setDisplayDueAmount('0');
        }
    };

    // If customer data is not valid, display an error message instead of the form
    if (!customer) {
        return (
            <section className='fixed inset-0 bg-black/20 flex items-center justify-center animate-fade-in z-[9999]'>
                <div className='bg-white rounded-xs shadow-2xl w-[90%] max-w-md p-6 space-y-5 animate-fade-in'>
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
            <div className='flex flex-col h-[95dvh] sm:h-[80dvh] w-full sm:w-[800px] rounded-xs shadow-xl border border-gray-200 bg-white animate-slide-up relative overflow-hidden'>
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
                            label={t("cusImage")}
                            currentImageUrl={formData.imgUrl || ''}
                            onImageSelected={handleUploadImageSelected}
                            isLoading={false}
                            error={uploadImageError}
                            className="rounded-xs mb-4 sm:mr-6 min-w-[220px]"
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
                                disabled
                                InputProps={{
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

                            {/* Due Amount Input */}
                            <TextField
                                label={t("lbl_dueAmount")}
                                name="customerDueAmt" // Corrected name to match formData property
                                value={displayDueAmount} // Use the local display state for the input value
                                onChange={handleChange}
                                onFocus={handleDueAmountFocus} // Clear '0' on focus
                                onBlur={handleDueAmountBlur} // Restore '0' if empty on blur
                                type="text" // Keep as text to control input more precisely
                                inputMode="decimal" // For numeric keypad on mobile
                                InputProps={{
                                    startAdornment: <DollarSign size={20} style={{ marginRight: 8 }} />,
                                }}
                                sx={{
                                    width: {
                                        xs: 'calc(50% - 8px)',
                                        sm: `calc(50% - ${24 / 2}px)`
                                    },
                                    '& .MuiOutlinedInput-root': { borderRadius: '8px' }
                                }}
                            />

                            {/* Last Due Date Input */}
                            <TextField
                                label={t("lbl_lastDueDate")}
                                name="customerLastDueDate" // Corrected name to match formData property
                                value={formData.customerLastDueDate} // This will now be in YYYY-MM-DD format
                                onChange={handleChange}
                                type="date"
                                InputLabelProps={{
                                    shrink: true,
                                }}
                                InputProps={{
                                    startAdornment: <CalendarDays size={20} style={{ marginRight: 8 }} />,
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
                        {loading ? t('btnTxt_saving') : t('btnTxt_saveCus')}
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