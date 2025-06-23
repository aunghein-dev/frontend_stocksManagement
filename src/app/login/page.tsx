'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import TextField from '@mui/material/TextField';
import axios from 'axios';
import { useModalStore } from "@/store/modalStore";
import RememberLogin from '@/lib/classes/RememberLogin';

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
    } catch (error: any) {
      console.error('Login error:', error);

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
        setErrorMsg('Network error. Check your connection.');
      }
    } finally {
      closeModal();
    }
  };

  return (
    <div className="flex items-center justify-center bg-gray-100 p-4 w-full h-screen">
      <div className="bg-white shadow-lg rounded-sm max-w-md w-full p-8">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-5 text-center">
          Sign in to Your Account
        </h1>

        {errorMsg
          ? <p className="text-center text-red-600 font-semibold mb-4">{errorMsg}</p>
          : <p className="text-center opacity-0 mb-4">InvisibleHolder</p>
        }

        <form className="space-y-6 text-sm" onSubmit={handleLogin}>
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
          />

          <div className="relative">
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
            />
          </div>

          <div className="flex items-center justify-between">
            <label className="flex items-center space-x-2 text-gray-700">
              <input
                type="checkbox"
                name="rememberMe" // Add name attribute
                checked={loginForm.rememberMe}
                onChange={handleInputChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="select-none">Remember me</span>
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
            className="w-full bg-blue-500 text-white font-semibold rounded-sm py-3 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
          >
            Sign In
          </button>
        </form>

        <p className="mt-6 text-center text-gray-500 text-sm">
          Don't have an account?{' '}
          <button onClick={() => router.push('/signup')} className="text-blue-600 hover:text-blue-800 font-medium">
            Sign up
          </button>
        </p>
      </div>
    </div>
  );
}