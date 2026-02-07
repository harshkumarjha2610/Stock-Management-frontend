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
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
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

  // Function to check user verification status
  const checkUserVerificationStatus = async (accessToken: string) => {
    try {
      // Try to verify invitation code with an empty/test code to check if already verified
      // This will fail if not verified, succeed if already verified
      const response = await fetch(`${API_BASE_URL}/user/auth/verify-invitation-code`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          invitationCode: 'CHECK_STATUS' // Dummy code to check status
        }),
      });

      const data = await response.json();
      
      // If 400 and message contains "already verified" or similar
      if (response.status === 400 && data.message?.toLowerCase().includes('already')) {
        return true; // Already verified
      }
      
      // If 401 or 403, token might be the issue
      if (response.status === 401 || response.status === 403) {
        return false; // Need to verify
      }
      
      // Otherwise, assume not verified
      return false;
    } catch (error) {
      console.error('Error checking verification status:', error);
      return false; // Assume not verified on error
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      // User Login API call
      const response = await fetch(`${API_BASE_URL}/user/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();
      console.log('Login response:', data);

      if (response.ok && data.success) {
        // Store tokens in localStorage
        const accessToken = data.data.accessToken;
        const refreshToken = data.data.refreshToken;
        
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);

        // Store user info
        if (data.data.user) {
          localStorage.setItem('userEmail', data.data.user.email);
          localStorage.setItem('user', JSON.stringify(data.data.user));
        }

        const user = data.data.user;

        // Check email verification first
        if (user && user.isEmailVerified === false) {
          console.log('Email not verified, redirecting to verify-otp');
          router.push(`/verify-otp?email=${encodeURIComponent(formData.email)}`);
          return;
        }

        // Email is verified, now check invitation code status
        console.log('Email verified, checking invitation code status...');
        
        // Check if user object has isInvitationCodeVerified field
        if (user && typeof user.isInvitationCodeVerified === 'boolean') {
          // If API provides the field
          if (!user.isInvitationCodeVerified) {
            console.log('Invitation code not verified (from API), redirecting...');
            router.push('/VerifyInvitation');
          } else {
            console.log('User fully verified, redirecting to dashboard');
            router.push('/investordashboard');
          }
        } else {
          // If API doesn't provide the field, check manually
          console.log('isInvitationCodeVerified field not found, checking manually...');
          const isInvitationVerified = await checkUserVerificationStatus(accessToken);
          
          if (!isInvitationVerified) {
            console.log('Invitation code not verified (manual check), redirecting...');
            router.push('/VerifyInvitation');
          } else {
            console.log('User fully verified, redirecting to dashboard');
            router.push('/investordashboard');
          }
        }

      } else {
        // Handle API error response
        if (response.status === 403) {
          setErrors((prev) => ({
            ...prev,
            email: 'Please verify your email first. Redirecting to verification...',
          }));
          
          setTimeout(() => {
            router.push(`/verify-otp?email=${encodeURIComponent(formData.email)}`);
          }, 2000);
        } else if (response.status === 401) {
          setErrors((prev) => ({
            ...prev,
            email: 'Invalid email or password. Please try again.',
          }));
        } else {
          setErrors((prev) => ({
            ...prev,
            email: data.message || 'Login failed. Please try again.',
          }));
        }
      }
    } catch (error) {
      console.error('Login error:', error);
      setErrors((prev) => ({
        ...prev,
        email: 'An error occurred. Please check your connection and try again.',
      }));
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
                  onClick={() => router.push('/Forgot-password')}
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
              className="w-full mt-8 sm:mt-10 px-4 sm:px-6 py-2.5 sm:py-3 bg-[#ef6b23] text-white rounded-lg font-semibold hover:bg-[#d85a1a] transition-colors shadow-sm text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Logging in...' : 'Login'}
            </button>

            {/* Divider */}
            <div className="flex items-center my-6 sm:my-8">
              <div className="flex-1 h-px bg-gray-300"></div>
              <span className="px-3 sm:px-4 text-xs sm:text-sm text-gray-500">OR</span>
              <div className="flex-1 h-px bg-gray-300"></div>
            </div>

            {/* Sign Up Link */}
            <div className="text-center text-xs sm:text-sm text-gray-600">
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => router.push('/OnboardingPage1')}
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
