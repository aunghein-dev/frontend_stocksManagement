'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import TextField from '@mui/material/TextField';
import axios from 'axios';
import { useModalStore } from "@/store/modalStore";
import RememberLogin from '@/lib/classes/RememberLogin';
import Image from 'next/image';
import { Checkbox } from '@mui/material';

// Instantiate RememberLogin outside the component to avoid re-creation on every render
const rememberLoginInstance = new RememberLogin();

export default function LoginPage() {
  const API = process.env.NEXT_PUBLIC_API_URL;
  const router = useRouter();
  const { openModal, closeModal } = useModalStore();

  // Combine username, password, and rememberMe into a single state object
  const [loginForm, setLoginForm] = useState({
    username: '',
    password: '',
    rememberMe: false,
  });
  const [errorMsg, setErrorMsg] = useState('');

  // Handle changes for all form fields
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setLoginForm(prevForm => ({
      ...prevForm,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  // Load remembered credentials on component mount
  useEffect(() => {
    const savedLogin = rememberLoginInstance.getRememberLogin();
    if (savedLogin.remember === 'true') {
      setLoginForm({
        username: savedLogin.username || '',
        password: savedLogin.password || '',
        rememberMe: true,
      });
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    openModal("loading");

    try {
      const response = await axios.post(
        `${API}/auth/login`,
        { username: loginForm.username, password: loginForm.password },
        {
          withCredentials: true,
          headers: { 'Content-Type': 'application/json' },
        }
      );

      if (response.status === 200) {
        if (loginForm.rememberMe) {
          rememberLoginInstance.setRememberLogin({
            remember: 'true',
            username: loginForm.username,
            password: loginForm.password,
          });
        } else {
          rememberLoginInstance.clearRememberLogin();
        }
        router.push('/');
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('Login error:', error.message);
      } else {
        console.error('Login error:', error);
      }
      
      rememberLoginInstance.clearRememberLogin();
      setLoginForm(prevForm => ({ ...prevForm, rememberMe: false })); // Uncheck the box

      if (axios.isAxiosError(error) && error.response) {
        const status = error.response.status;
        const message = error.response.data?.message;

        if (status === 401 || status === 400) {
          setErrorMsg(message || 'Invalid username or password');
        } else if (status === 500) {
          setErrorMsg('Please try again later.');
        } else {
          setErrorMsg(message || 'Login failed. Please try again.');
        }
      } else {
        setErrorMsg('Network error. Check  connection.');
      }
    } finally {
      closeModal();
    }
  };

  return (
    <div className='absolute top-0 left-0 w-full h-full flex items-center justify-center flex-col'> 
    
          
    <div className="flex items-center justify-center p-4 w-full">
      
      <div className="bg-white shadow-lg rounded-xl max-w-md w-full p-8">
       <h1 className="text-2xl font-extrabold mb-5 text-center flex flex-row items-center justify-center"> {/* Changed justify-self-center to justify-center */}
          <div className='w-10 h-10 mr-1'> {/* Removed mx-auto */}
            <Image  
              src="/onlylogo.png" alt="Openware Logo" 
              width={40} height={40} />
          </div>
          <span className='text-blue-600 mr-1'>Welcome</span> 
          <span className='text-gray-800'>back!</span>
        </h1>

        {errorMsg
          ? <p className="text-center text-red-600 font-semibold mb-4">{errorMsg}</p>
          : <p className="text-center opacity-0 mb-4">InvisibleHolder</p>
        }

        <form className="space-y-6 text-sm sm:text-base" onSubmit={handleLogin}>
          <TextField

            id="outlined-email-input"
            label="Email address"
            type="email"
            name="username" // Add name attribute
            autoComplete="username"
            value={loginForm.username}
            onChange={handleInputChange}
            required
            sx={{ width: '100%', mb: 3 }}
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

          <div className="relative text-sm sm:text-base">
            <TextField

              id="outlined-password-input"
              label="Password"
              type="password"
              name="password" // Add name attribute
              autoComplete="current-password"
              value={loginForm.password}
              onChange={handleInputChange}
              required
              sx={{ width: '100%' }}
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

          <div className="flex items-center justify-between text-sm sm:text-base">
            <label className="flex items-center space-x-1 text-gray-700">
              <Checkbox
                id="rememberMe"
                name="rememberMe" 
                checked={loginForm.rememberMe}
                onChange={handleInputChange}
                color="primary"
                size="small"
              /> 
             
              <span className="select-none text-sm">Remember me</span>
            </label>

            <a
              href="#"
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              Forgot password?
            </a>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-500 text-white font-semibold rounded-4xl py-2 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors text-sm sm:text-base duration-300 cursor-pointer"
          >
            Sign In
          </button>
        </form>

        <p className="mt-6 text-center text-gray-500 text-sm">
          <span className='mr-2'>{"Don't have an account?"}</span>
          <button onClick={() => router.push('/signup')} 
                  className="text-blue-600 hover:text-blue-800 font-medium
                            cursor-pointer transition-colors duration-300">
              Sign up
          </button>
        </p>
      </div>
    </div>
    </div>
  );
}