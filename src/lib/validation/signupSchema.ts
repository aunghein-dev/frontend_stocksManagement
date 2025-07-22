// lib/validation/signupSchema.ts

import { z } from 'zod';


export const signupSchema = z.object({
  // User
  fullName: z.string().min(3, "Full name must be at least 3 characters"),
  username: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),

  // Business
  businessName: z.string().min(2, "Business name is required"),
  businessNameShortForm: z.string().optional(),
  phoneNum1: z.string().min(7, "A valid phone number is required"),
  phoneNum2: z.string().optional(),
  streets: z.string().min(5, "Street address is required"),
  township: z.string().min(3, "Township is required"),
  city: z.string().min(3, "City is required"),

  // Settings
  defaultCurrency: z.string().min(3).max(3),
  taxRate: z.coerce.number().min(0),
  invoiceFooterMessage: z.string().optional(),
  showLogoOnInvoice: z.boolean(),
  autoPrintAfterCheckout: z.boolean(),

  // Agreement
  agree: z.literal(true, {
    errorMap: () => ({ message: "You must agree to the Terms and Conditions." })
  }),
  secretCode: z.string().min(6, "Please enter a valid secret code")
});

export type SignupFormData = z.infer<typeof signupSchema>;