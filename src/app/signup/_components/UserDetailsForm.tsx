"use client";

import TextField from '@mui/material/TextField';
import { UseFormRegister, FieldErrors } from 'react-hook-form';
import { SignupFormData } from '@/lib/validation/signupSchema';


type Props = {
  register: UseFormRegister<SignupFormData>;
  errors: FieldErrors<SignupFormData>;
};

export function UserDetailsForm({ register, errors }: Props) {
  return (
    <div className="p-4 border-[0.5px] border-gray-300 shadow-sm
                   rounded-md space-y-2 flex flex-col gap-5">
      <h2 className="text-xl font-bold text-gray-800">User Details</h2>
      <TextField
        label="Full Name"
        {...register("fullName")}
        error={!!errors.fullName}
        helperText={errors.fullName?.message}
        required
        fullWidth
        // --- USE slotProps INSTEAD OF inputProps and InputLabelProps ---
              slotProps={{
                input: {
                  style: {
                    fontSize: '0.875rem', // For the actual input text (e.g., "text-sm")
                  },
                },
                inputLabel: {
                  style: {
                    fontSize: '0.875rem', // For the label (e.g., "text-sm")
                  },
                },
              }}
      />
      <TextField
        label="Email Address (Username)"
        type="email"
        {...register("username")}
        error={!!errors.username}
        helperText={errors.username?.message}
        required
        fullWidth
        // --- USE slotProps INSTEAD OF inputProps and InputLabelProps ---
              slotProps={{
                input: {
                  style: {
                    fontSize: '0.875rem', // For the actual input text (e.g., "text-sm")
                  },
                },
                inputLabel: {
                  style: {
                    fontSize: '0.875rem', // For the label (e.g., "text-sm")
                  },
                },
              }}
      />
      <TextField
        label="Password"
        type="password"
        {...register("password")}
        error={!!errors.password}
        helperText={errors.password?.message}
        required
        fullWidth// --- USE slotProps INSTEAD OF inputProps and InputLabelProps ---
              slotProps={{
                input: {
                  style: {
                    fontSize: '0.875rem', // For the actual input text (e.g., "text-sm")
                  },
                },
                inputLabel: {
                  style: {
                    fontSize: '0.875rem', // For the label (e.g., "text-sm")
                  },
                },
              }}
      />
      
    </div>
  );
}