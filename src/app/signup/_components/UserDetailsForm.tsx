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
      <h2 className="text-lg font-bold text-gray-800">User Details</h2>
      <TextField
        label="Full Name"
        {...register("fullName")}
        error={!!errors.fullName}
        helperText={errors.fullName?.message}
        required
        fullWidth
        // --- Use InputProps and InputLabelProps with sx prop to control font size ---
      InputProps={{
        sx: {
          fontSize: '0.875rem', // For the actual input text (e.g., "text-sm")
        },
      }}
      InputLabelProps={{
        sx: {
          fontSize: '0.875rem', // For the label (e.g., "text-sm")
          // Important: When the label floats, its transform scale might be applied.
          // You might need to adjust based on the default scale if it's too small/big when floating.
          // For a more robust solution, especially if you have a custom theme,
          // you'd define typography variants.
          "&.MuiInputLabel-shrink": { // When the label is "shrunk" (floated)
            fontSize: '0.875rem', // Often labels are slightly smaller when floated. Adjust as needed.
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
        // --- Use InputProps and InputLabelProps with sx prop to control font size ---
      InputProps={{
        sx: {
          fontSize: '0.875rem', // For the actual input text (e.g., "text-sm")
        },
      }}
      InputLabelProps={{
        sx: {
          fontSize: '0.875rem', // For the label (e.g., "text-sm")
          // Important: When the label floats, its transform scale might be applied.
          // You might need to adjust based on the default scale if it's too small/big when floating.
          // For a more robust solution, especially if you have a custom theme,
          // you'd define typography variants.
          "&.MuiInputLabel-shrink": { // When the label is "shrunk" (floated)
            fontSize: '0.875rem', // Often labels are slightly smaller when floated. Adjust as needed.
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
        fullWidth
        // --- Use InputProps and InputLabelProps with sx prop to control font size ---
      InputProps={{
        sx: {
          fontSize: '0.875rem', // For the actual input text (e.g., "text-sm")
        },
      }}
      InputLabelProps={{
        sx: {
          fontSize: '0.875rem', // For the label (e.g., "text-sm")
          // Important: When the label floats, its transform scale might be applied.
          // You might need to adjust based on the default scale if it's too small/big when floating.
          // For a more robust solution, especially if you have a custom theme,
          // you'd define typography variants.
          "&.MuiInputLabel-shrink": { // When the label is "shrunk" (floated)
            fontSize: '0.875rem', // Often labels are slightly smaller when floated. Adjust as needed.
          },
        },
      }}
      />
      
    </div>
  );
}