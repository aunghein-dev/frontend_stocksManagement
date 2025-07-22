"use client";

import axios from 'axios';
import { SignupFormData } from '@/lib/validation/signupSchema';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const signupUser = async (data: SignupFormData) => {
  const formData = new FormData();


  // 1. Create proper Blob objects with JSON content type
  const userBlob = new Blob([JSON.stringify({
    username: data.username,
    password: data.password,
    role: 'USER',
    fullName: data.fullName,
    userImgUrl: '',
    business: '',
  })], { type: 'application/json' });

  const businessBlob = new Blob([JSON.stringify({
    businessLogo: '',
    businessName: data.businessName,
    businessNameShortForm: data.businessNameShortForm,
    registeredBy: data.username,
    registeredAt: new Date().toISOString(),
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
  })], { type: 'application/json' });

  // 2. Append as Files with filenames
  formData.append('postingUser', userBlob, 'user.json');
  formData.append('postingBusiness', businessBlob, 'business.json');
  formData.append('secretCode', data.secretCode);


  try {
    const response = await axios.post(`${API_URL}/auth/register`, formData, {
      withCredentials: true,
      // ABSOLUTELY NO 'Content-Type' HEADER HERE. AXIOS HANDLES IT.
      // Do not add a `headers` object if `Content-Type` is the only thing you're worried about.
      // If you have other headers, ensure 'Content-Type' is NOT present.
      // For example, if you need an Authorization header:
      // headers: {
      //   'Authorization': `Bearer ${someToken}`,
      // }
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      if (error.response.status === 409) {
        throw new Error('Secret code has already been used.');
      } else if (error.response.status === 403) {
        throw new Error('Username is already exist.');
      }
      throw new Error(error.response.data.message || 'An unexpected error occurred.');
    }
    throw new Error('An unexpected error occurred during signup.');
  }
};