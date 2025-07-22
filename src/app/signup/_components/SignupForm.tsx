// frontend/components/SignupForm.tsx
"use client";

import React, { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, Controller, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { signupSchema, SignupFormData } from '@/lib/validation/signupSchema';

import toast from 'react-hot-toast'; // Good choice for notifications!

import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import Typography from '@mui/material/Typography'; // For better text rendering
import Link from 'next/link'; // For client-side navigation to terms
import { UserDetailsForm } from './UserDetailsForm'; // Assuming this component exists
import { BusinessDetailsForm } from './BusinessDetailsForm'; // Assuming this component exists
import axios from 'axios';

// Environment variable for API URL - ensure it's properly configured
// Make sure NEXT_PUBLIC_API_URL is set in  .env.local file

const API = process.env.NEXT_PUBLIC_API_URL;

// Sensible default values for the form
const defaultFormValues: SignupFormData = {
  fullName: '',
  username: '',
  password: '',
  businessName: '',
  businessNameShortForm: '',
  phoneNum1: '',
  phoneNum2: '',
  streets: '',
  township: '',
  city: '',
  defaultCurrency: 'MMK', // Default currency set
  taxRate: 0,
  invoiceFooterMessage: 'ဝယ်ယူအားပေးမှုအတွက် ကျေးဇူးအထူးတင်ရှိပါသည်', // Default footer message
  showLogoOnInvoice: true,
  autoPrintAfterCheckout: true,
  agree: true, // Default to false, user must explicitly agree
  secretCode: '',
};

export function SignupForm() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    control,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: defaultFormValues,
    mode: 'onTouched', // Validate on blur for better UX
  });

  // Function to handle the registration API call
  const handleRegister = useCallback(async (data: SignupFormData) => {
    // Check if API URL is configured
    if (!API) {
      toast.error('Application configuration error: API URL is missing.');
      setError("root.serverError", { type: "manual", message: "API URL is not configured. Please check environment variables." });
      throw new Error('API URL is not configured. Please check environment variables.');
    }

    const formData = new FormData();

    // Separate user and business data for clarity
    const postingUser = {
      username: data.username,
      password: data.password,
      role: 'USER', // Assuming a default role
      fullName: data.fullName,
      userImgUrl: '', // To be handled if user profile picture is part of signup
      referredCode: data.secretCode,
    };

    const postingBusiness = {
      businessLogo: '', // To be handled if business logo is part of signup
      businessName: data.businessName,
      businessNameShortForm: data.businessNameShortForm,
      // registeredBy will likely be linked on the backend after user creation
      registeredAt: new Date().toISOString(), // Use ISO string for consistency
      defaultCurrency: data.defaultCurrency,
      taxRate: data.taxRate,
      showLogoOnInvoice: data.showLogoOnInvoice,
      autoPrintAfterCheckout: data.autoPrintAfterCheckout,
      invoiceFooterMessage: data.invoiceFooterMessage,
      streets: data.streets,
      township: data.township,
      city: data.city,
      phoneNum1: data.phoneNum1,
      phoneNum2: data.phoneNum2,
    };

    // Append JSON data as Blobs for multipart/form-data
    formData.append("postingUser", new Blob([JSON.stringify(postingUser)], { type: "application/json" }));
    formData.append("postingBusiness", new Blob([JSON.stringify(postingBusiness)], { type: "application/json" }));

    try {
      const response = await axios.post(`${API}/auth/register`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true, // Important for session cookies or similar
      });

      // If we reach here, it means the status was 2xx (successful)
      if (response.status === 201 || response.status === 200) {
        toast.success('Account created successfully! Redirecting to login...');
        setTimeout(() => router.push('/login'), 2000);
      }
      // No need for else-if here checking non-2xx statuses, as Axios throws an error for them
    } catch (error: unknown) { // Explicitly type error as unknown
     
      if (axios.isAxiosError(error)) {
      

        if (error.response) {
          const { status, data } = error.response;
         
          let errorMessage = 'An unexpected error occurred. Please try again.';

          
          const backendMessage = (typeof data === 'object' && data !== null && 'message' in data)
                                 ? (data as { message?: string }).message
                                 : undefined;

          if (status === 409) {
            errorMessage = backendMessage || 'Secret code has already been used. Please try again.';
          } else if (status === 404) {
            errorMessage = backendMessage || 'Secret code not found. Please try again.';
          } else if (status === 403) {
            errorMessage = backendMessage || 'Username already exists. Please choose a different username.';
          } else if (status === 400) {
            errorMessage = backendMessage || 'Invalid input. Please check  details.';
          } else {
            // Fallback for other non-2xx statuses
            errorMessage = backendMessage || `Server error: ${status}. Please try again later.`;
          }

          toast.error(errorMessage);
          setError("root.serverError", { type: "manual", message: errorMessage });
          // Re-throw if you want outer catch blocks to know, e.g., for logging
          throw new Error(errorMessage);
        } else {
          // Network error (no response received from server at all)
          
          toast.error("Network error or server unreachable. Please check  internet connection.");
          setError("root.serverError", { type: "manual", message: "Network error or server unreachable." });
          throw error;
        }
      } else if (error instanceof Error) {
       
        toast.error(`Client-side error: ${error.message}`);
        setError("root.serverError", { type: "manual", message: `Client-side error: ${error.message}` });
        throw error;
      } else {
       
        toast.error("An unknown error occurred during signup.");
        setError("root.serverError", { type: "manual", message: "An unknown error occurred during signup." });
        throw new Error("An unknown error occurred during signup.");
      }
    }
  }, [router, setError]); // setError must be a dependency

  // Submit handler for the form
  const onSubmit: SubmitHandler<SignupFormData> = async (data) => {
    try {
      await handleRegister(data);
    } catch {
      throw new Error("An error occurred during signup.");
    }
  };



  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 text-sm " noValidate>
      <UserDetailsForm register={register} errors={errors} />
      <BusinessDetailsForm register={register} errors={errors} control={control} />

      <div className="flex flex-col items-left justify-between">
       <FormControlLabel
          control={
            <Controller
              name="agree"
              control={control}
              render={({ field }) => (
                <Checkbox
                  {...field}
                  checked={!!field.value}
                  color="primary"
                />
              )}
            />
          }
          label={
            <Typography variant="body2" color="textSecondary">
              I agree to the{' '}
              <Link
                href="/terms-and-conditions"
                className="text-blue-600 hover:text-blue-800 underline font-medium"
                target="_blank"            
                rel="noopener noreferrer"  
              >
                Terms and Conditions
              </Link>
            </Typography>
          }
        />
          {errors.agree && (
          <Typography color="error" variant="caption" className="mt-0">
            {errors.agree.message}
          </Typography>
        )}
      </div>
     
      {/* Server-side error display */}
      {errors.root?.serverError? (
        <Typography color="error" variant="body2" className="text-center
         min-h-8">
          {errors.root.serverError.message}
        </Typography>
      ): (
        <Typography color="error" variant="body2" className="text-center
         min-h-8 opacity-0">
          hidden
        </Typography>
      )}

     <div className="text-center"> {/* Option B: Use text-align on the parent (if button is inline-block) */}
  <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-blue-500 text-white font-semibold rounded-4xl py-2.5 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
      >
        {isSubmitting ? 'Creating Account...' : 'Sign Up'}
      </button>
    </div>


      <Typography variant="body2" className="mt-6 text-center text-gray-500">
        Already have an account?{' '}
        <button
          type="button"
          onClick={() => router.push("/login")}
          className="text-blue-600 hover:text-blue-800 font-medium"
        >
          Sign in
        </button>
      </Typography>
    </form>
  );
}