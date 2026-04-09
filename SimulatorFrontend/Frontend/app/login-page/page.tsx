'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

const API_BASE_URL = 'https://cobuild-simulator-backend.onrender.com/api/v1';

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState({
    email: '',
    password: '',
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = (): boolean => {
    let isValid = true;
    const newErrors = { email: '', password: '' };

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
      isValid = false;
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
      isValid = false;
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
      isValid = false;
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/user/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();
      console.log('📥 Login response:', data);

      if (response.ok && data.success) {
        const accessToken = data.data.accessToken;
        const refreshToken = data.data.refreshToken;

        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);

        if (data.data.user) {
          localStorage.setItem('userEmail', data.data.user.email);
          localStorage.setItem('user', JSON.stringify(data.data.user));
        }

        const user = data.data.user;

        const isEmailVerified = user?.emailVerified === true;
        if (!isEmailVerified) {
          setErrors((prev) => ({
            ...prev,
            email: 'Please verify your email first. Redirecting...',
          }));
          setTimeout(() => {
            router.push(`/VerifyOtp?email=${encodeURIComponent(formData.email)}`);
          }, 1500);
          return;
        }

        const isActivated = user?.isActive === true;
        if (!isActivated) {
          setErrors((prev) => ({
            ...prev,
            email: 'Please verify your invitation code. Redirecting...',
          }));
          setTimeout(() => {
            router.push('/VerifyInvitation');
          }, 1500);
          return;
        }

        router.push('/Investordashboard');
      } else {
        if (response.status === 403) {
          const message = data.message?.toLowerCase() || '';
          if (message.includes('email') || message.includes('verify')) {
            setErrors((prev) => ({
              ...prev,
              email: 'Please verify your email first. Redirecting...',
            }));
            setTimeout(() => {
              router.push(`/VerifyOtp?email=${encodeURIComponent(formData.email)}`);
            }, 2000);
          } else if (message.includes('invitation') || message.includes('code') || message.includes('active')) {
            setErrors((prev) => ({
              ...prev,
              email: 'Please verify your invitation code. Redirecting...',
            }));
            setTimeout(() => {
              router.push('/VerifyInvitation');
            }, 2000);
          } else {
            setErrors((prev) => ({
              ...prev,
              email: data.message || 'Access denied. Please complete verification.',
            }));
          }
        } else if (response.status === 401) {
          setErrors((prev) => ({
            ...prev,
            email: 'Invalid email or password. Please try again.',
          }));
        } else if (response.status === 404) {
          setErrors((prev) => ({
            ...prev,
            email: 'No account found with this email. Please sign up first.',
          }));
        } else {
          setErrors((prev) => ({
            ...prev,
            email: data.message || 'Login failed. Please try again.',
          }));
        }
      }
    } catch (error: any) {
      console.error('❌ Login error:', error);
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        setErrors((prev) => ({
          ...prev,
          email: 'Network error. Please check your internet connection.',
        }));
      } else {
        setErrors((prev) => ({
          ...prev,
          email: 'An unexpected error occurred. Please try again.',
        }));
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
        <div className="flex items-center">
          <Image
            src="/Co-build-logo-02-1.png"
            alt="CoBuild Logo"
            width={150}
            height={40}
            className="h-8 sm:h-10 w-auto"
            priority
          />
        </div>
        <div className="text-xs sm:text-sm text-gray-600">
          Having trouble?{' '}
          <span className="text-[#ef6b23] cursor-pointer hover:underline">Get Help</span>
        </div>
      </header>

      {/* Main Content */}
      <div className="px-4 sm:px-6 py-6 sm:py-8 flex items-center justify-center">
        <div className="w-full max-w-[340px] sm:max-w-md">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-6 sm:mb-8 text-center">
            Login
          </h2>

          <form onSubmit={handleSubmit}>
            <div className="space-y-4 sm:space-y-5">
              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Email<span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  placeholder="Enter Email Here"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 border ${
                    errors.email ? 'border-red-500' : 'border-gray-300'
                  } rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ef6b23] focus:border-transparent text-gray-900 placeholder:text-gray-400 bg-white text-sm sm:text-base`}
                />
                {errors.email && (
                  <p className="text-red-500 text-xs sm:text-sm mt-1">{errors.email}</p>
                )}
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Password<span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  placeholder="Enter Password Here"
                  value={formData.password}
                  onChange={handleInputChange}
                  className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 border ${
                    errors.password ? 'border-red-500' : 'border-gray-300'
                  } rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ef6b23] focus:border-transparent text-gray-900 placeholder:text-gray-400 bg-white text-sm sm:text-base`}
                />
                {errors.password && (
                  <p className="text-red-500 text-xs sm:text-sm mt-1">{errors.password}</p>
                )}
              </div>

              {/* Forgot Password */}
              <div className="text-right -mt-2">
                <button
                  type="button"
                  onClick={() => router.push('/forgot-password')}
                  className="text-xs sm:text-sm text-[#ef6b23] hover:underline"
                >
                  Forgot Password?
                </button>
              </div>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-8 sm:mt-10 px-4 sm:px-6 py-2.5 sm:py-3 bg-[#ef6b23] text-white rounded-lg font-semibold hover:bg-[#d85a1a] transition-colors shadow-sm text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Logging in...
                </>
              ) : (
                'Login'
              )}
            </button>

            {/* Sign Up Link */}
            <div className="text-center text-xs sm:text-sm text-gray-600 mt-6">
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => router.push('/user-registration-page1')}
                className="text-[#ef6b23] font-semibold hover:underline"
              >
                Sign Up
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}