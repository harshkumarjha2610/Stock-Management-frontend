'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import axios from 'axios';

// Define API URL at the top
const API_URL = "https://cobuild-simulator-backend.onrender.com/api/v1";

export default function VerifyInvitationPage() {
  const router = useRouter();
  
  const [invitationCode, setInvitationCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleVerifyInvitation = async () => {
    if (!invitationCode.trim()) {
      setError('Please enter an invitation code');
      return;
    }

    console.log('🔍 Verifying invitation code:', invitationCode);
    setLoading(true);
    setError('');

    try {
      const response = await axios.post(
        `${API_URL}/user/auth/verify-invitation`,
        { invitationCode: invitationCode.trim() }
      );

      console.log('✅ Invitation verification response:', response.data);

      if (response.data.success) {
        // Store invitation verification in localStorage
        localStorage.setItem('invitationVerified', 'true');
        
        alert('Invitation code verified! Welcome to CoBuild.');
        
        // Redirect to dashboard or home page
        router.push('/dashboard');
      }
    } catch (error) {
      const axiosError = error as any;
      console.error('❌ Invitation verification failed:', axiosError.response?.data);
      setError(axiosError.response?.data?.message || 'Invalid invitation code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    // Optional: Allow users to skip and explore limited features
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="px-4 sm:px-6 py-4 flex items-center justify-between">
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
          <span className="text-[#ef6b23] cursor-pointer hover:underline">
            Get Help
          </span>
        </div>
      </header>

      {/* Main Content */}
      <div className="px-4 sm:px-6 py-8 sm:py-12 flex items-center justify-center min-h-[calc(100vh-100px)]">
        <div className="w-full max-w-[340px] sm:max-w-md">
          {/* Icon */}
          <div className="flex justify-center mb-6 sm:mb-8">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[#ef6b23]/10 flex items-center justify-center">
              <svg
                className="w-8 h-8 sm:w-10 sm:h-10 text-[#ef6b23]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
                />
              </svg>
            </div>
          </div>

          {/* Title */}
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 text-center mb-3 sm:mb-4">
            Enter Invitation Code
          </h2>

          {/* Description */}
          <p className="text-sm sm:text-base text-gray-600 text-center mb-8 sm:mb-10 px-2">
            Please enter your invitation code to access the platform
          </p>

          {/* Invitation Code Input */}
          <div className="mb-6 sm:mb-8">
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Invitation Code<span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="Enter your invitation code"
              value={invitationCode}
              onChange={(e) => {
                setInvitationCode(e.target.value);
                setError('');
              }}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleVerifyInvitation();
                }
              }}
              className="w-full px-4 py-3 sm:py-3.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ef6b23] focus:border-transparent text-gray-900 placeholder:text-gray-400 bg-white text-sm sm:text-base"
              autoFocus
            />
            {error && (
              <p className="text-red-500 text-sm mt-2">{error}</p>
            )}
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 sm:mb-8">
            <div className="flex items-start gap-3">
              <svg
                className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <div>
                <p className="text-sm text-blue-800 font-medium mb-1">
                  Don't have an invitation code?
                </p>
                <p className="text-xs text-blue-700">
                  Contact your administrator or request access through our support team.
                </p>
              </div>
            </div>
          </div>

          {/* Verify Button */}
          <button
            onClick={handleVerifyInvitation}
            disabled={loading || !invitationCode.trim()}
            className="w-full px-4 sm:px-6 py-3 sm:py-3.5 bg-[#ef6b23] text-white rounded-lg font-semibold hover:bg-[#d85a1a] transition-colors shadow-sm text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed mb-4"
          >
            {loading ? 'Verifying...' : 'Verify & Continue'}
          </button>

          {/* Skip Button (Optional) */}
          <button
            onClick={handleSkip}
            disabled={loading}
            className="w-full px-4 sm:px-6 py-3 sm:py-3.5 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Back to Login
          </button>
        </div>
      </div>
    </div>
  );
}
