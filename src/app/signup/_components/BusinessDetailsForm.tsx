"use client";

import TextField from '@mui/material/TextField';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import { UseFormRegister, FieldErrors, Control, Controller } from 'react-hook-form';
import { SignupFormData } from '@/lib/validation/signupSchema';


type Props = {
  register: UseFormRegister<SignupFormData>;
  errors: FieldErrors<SignupFormData>;
  control: Control<SignupFormData>;
};

export function BusinessDetailsForm({ register, errors, control }: Props) {
  return (
    <div className="p-4 border-[0.5px] border-gray-300 shadow-sm
                   rounded-md space-y-2 flex flex-col gap-5">
      <h2 className="text-lg font-bold text-gray-800">Business Details</h2>
      <TextField
        label="Business Name"
        {...register("businessName")}
        error={!!errors.businessName}
        helperText={errors.businessName?.message}
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
     
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
       <Controller
  name="phoneNum1" // The name of  field in the form data
  control={control} // Pass the control object from useForm
  render={({ field }) => (
    <TextField
      {...field} // This spreads value, onChange, onBlur etc.
      label="Primary Phone Number"
      error={!!errors.phoneNum1}
      helperText={errors.phoneNum1?.message}
      type="tel"
      inputMode="numeric"
      required
      onChange={(event) => {
        // Only allow digits to be set as the value
        const numericValue = event.target.value.replace(/[^0-9]/g, ''); // Remove any non-numeric characters
        field.onChange(numericValue); // Update react-hook-form's state with cleaned value
      }}
      onKeyPress={(event) => {
        // Prevent non-numeric characters from being typed in real-time
        if (!/[0-9]/.test(event.key)) {
          event.preventDefault();
        }
      }}
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
  )}
/>
      <Controller
        name="phoneNum2" // The name of  field in the form data
        control={control} // Pass the control object from useForm
        render={({ field }) => (
          <TextField
            {...field} // This spreads value, onChange, onBlur etc.
            label="Secondary Phone (Optional)"
            error={!!errors.phoneNum2}
            helperText={errors.phoneNum2?.message}
            type="tel" // Semantic for phone numbers, brings up numeric keyboard on mobile
            inputMode="numeric" // Hints to browsers to show a numeric keyboard
            // --- Key Changes Here for PhoneNum2 ---
            onChange={(event) => {
              // Only allow digits to be set as the value
              const numericValue = event.target.value.replace(/[^0-9]/g, ''); // Remove any non-numeric characters
              field.onChange(numericValue); // Update react-hook-form's state with cleaned value
            }}
            onKeyPress={(event) => {
              // Prevent non-numeric characters from being typed in real-time
              if (!/[0-9]/.test(event.key)) {
                event.preventDefault();
              }
            }}
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
        )}
      />
      </div>
       <TextField
        label="Street Address"
        {...register("streets")}
        error={!!errors.streets}
        helperText={errors.streets?.message}
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
       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <TextField
            label="Township"
            {...register("township")}
            error={!!errors.township}
            helperText={errors.township?.message}
            required
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
            label="City"
            {...register("city")}
            error={!!errors.city}
            helperText={errors.city?.message}
            required
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
       <TextField
        label="Invoice Footer Message (Optional)"
        {...register("invoiceFooterMessage")}
        error={!!errors.invoiceFooterMessage}
        helperText={errors.invoiceFooterMessage?.message}
        multiline
        rows={2}
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
      <div className='flex flex-row flex-wrap'>
         <FormControlLabel
        control={
          <Controller
            name="showLogoOnInvoice"
            control={control}
            render={({ field }) => <Checkbox {...field} checked={field.value} />}
          />
        }
        label="Show Logo on Invoice"
        // Apply font size directly to the label's Typography component
        sx={{
          '& .MuiFormControlLabel-label': { // Target the label's specific class
            fontSize: '0.875rem', // text-sm equivalent
          },
        }}
      />
      <br/> {/* For spacing in example */}
      <FormControlLabel
        control={
          <Controller
            name="autoPrintAfterCheckout"
            control={control}
            render={({ field }) => <Checkbox {...field} checked={field.value} />}
          />
        }
        label="Auto-print after Checkout"
        sx={{
          '& .MuiFormControlLabel-label': { // Target the label's specific class
            fontSize: '0.875rem', // text-sm equivalent
          },
        }}
      />
      </div>
      <TextField
        label="License Secret Code"
        {...register("secretCode")}
        error={!!errors.secretCode}
        helperText={errors.secretCode?.message}
        required
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