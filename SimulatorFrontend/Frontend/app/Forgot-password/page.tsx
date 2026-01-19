'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://your-api-base-url.com';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    if (error) setError('');
    if (successMessage) setSuccessMessage('');
  };

  const validateEmail = (): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      setError('Email is required');
      return false;
    } else if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateEmail()) {
      return;
    }

    setIsLoading(true);

    try {
      // Forgot Password API call
      const response = await fetch(`${API_BASE_URL}/user/auth/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSuccessMessage(
          data.message || 'Password reset instructions have been sent to your email.'
        );
        setError('');

        // Optionally redirect to reset password page after a delay
        setTimeout(() => {
          router.push(`/reset-password?email=${encodeURIComponent(email)}`);
        }, 2000);
      } else {
        setError(data.message || 'Failed to send reset instructions. Please try again.');
        setSuccessMessage('');
      }
    } catch (error) {
      console.error('Forgot password error:', error);
      setError('An error occurred. Please check your connection and try again.');
      setSuccessMessage('');
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
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-3 sm:mb-4 text-center">
            Forgot Password?
          </h2>
          <p className="text-xs sm:text-sm text-gray-600 mb-6 sm:mb-8 text-center">
            Enter your email address and we'll send you instructions to reset your password.
          </p>

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
                  placeholder="Enter Your Email"
                  value={email}
                  onChange={handleInputChange}
                  className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 border ${
                    error ? 'border-red-500' : successMessage ? 'border-green-500' : 'border-gray-300'
                  } rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ef6b23] focus:border-transparent text-gray-900 placeholder:text-gray-400 bg-white text-sm sm:text-base`}
                />
                {error && (
                  <p className="text-red-500 text-xs sm:text-sm mt-1">{error}</p>
                )}
                {successMessage && (
                  <p className="text-green-600 text-xs sm:text-sm mt-1">{successMessage}</p>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-8 sm:mt-10 px-4 sm:px-6 py-2.5 sm:py-3 bg-[#ef6b23] text-white rounded-lg font-semibold hover:bg-[#d85a1a] transition-colors shadow-sm text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Sending...' : 'Send Reset Instructions'}
            </button>

            {/* Back to Login */}
            <div className="text-center mt-6 sm:mt-8">
              <button
                type="button"
                onClick={() => router.push('/login')}
                className="text-xs sm:text-sm text-[#ef6b23] font-semibold hover:underline"
              >
                ← Back to Login
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}