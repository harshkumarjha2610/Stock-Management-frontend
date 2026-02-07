'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import axios from 'axios';

const API_URL = "https://cobuild-simulator-backend.onrender.com/api/v1";

export default function VerifyInvitationCodePage() {
  const router = useRouter();
  const [invitationCode, setInvitationCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [tokenStatus, setTokenStatus] = useState<'checking' | 'valid' | 'invalid'>('checking');

  useEffect(() => {
    console.log('=== VerifyInvitation Page Loaded ===');
    
    // Check if user is authenticated
    const accessToken = localStorage.getItem('accessToken');
    const refreshToken = localStorage.getItem('refreshToken');
    const userEmail = localStorage.getItem('userEmail');
    
    console.log('Access Token:', accessToken ? `Found (${accessToken.substring(0, 30)}...)` : 'Not found');
    console.log('Refresh Token:', refreshToken ? 'Found' : 'Not found');
    console.log('User Email:', userEmail || 'Not found');
    
    if (!accessToken) {
      console.error('❌ No access token found, redirecting to login');
      setTokenStatus('invalid');
      alert('Please complete email verification first');
      router.push('/LoginPage');
    } else {
      console.log('✅ Access token found, user can proceed');
      setTokenStatus('valid');
    }
  }, [router]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('=== Starting Invitation Code Verification ===');
    
    if (!invitationCode.trim()) {
      console.warn('⚠️ Empty invitation code');
      setError('Please enter your invitation code');
      return;
    }

    if (invitationCode.length !== 8) {
      console.warn('⚠️ Invalid code length:', invitationCode.length);
      setError('Invitation code must be exactly 8 characters');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const accessToken = localStorage.getItem('accessToken');
      
      if (!accessToken) {
        console.error('❌ Access token not found during verification');
        setError('Authentication token not found. Please login again.');
        setTimeout(() => router.push('/LoginPage'), 2000);
        return;
      }

      const codeToVerify = invitationCode.trim().toUpperCase();
      console.log('📤 Sending verification request');
      console.log('Code:', codeToVerify);
      console.log('Token (first 30 chars):', accessToken.substring(0, 30) + '...');
      console.log('API Endpoint:', `${API_URL}/user/auth/verify-invitation-code`);
      
      const requestPayload = { invitationCode: codeToVerify };
      console.log('Request Payload:', JSON.stringify(requestPayload));
      
      const response = await axios.post(
        `${API_URL}/user/auth/verify-invitation-code`,
        requestPayload,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('📥 Response Status:', response.status);
      console.log('📥 Response Data:', response.data);

      if (response.data.success) {
        console.log('✅ Invitation code verified successfully!');
        console.log('Response message:', response.data.message);
        
        // Keep tokens in localStorage - user is fully authenticated
        alert('Invitation code verified successfully! Welcome to CoBuild.');
        
        console.log('🔄 Redirecting to dashboard...');
        // Redirect to investor dashboard with tokens intact
        router.push('/Investordashboard');
      } else {
        console.warn('⚠️ Success flag is false:', response.data);
        setError(response.data.message || 'Verification failed');
      }
    } catch (error: any) {
      console.error('=== Invitation Code Verification Error ===');
      console.error('Error Type:', error.name);
      console.error('Error Message:', error.message);
      console.error('Full Error Object:', error);
      
      if (error.response) {
        console.error('📥 Error Response Status:', error.response.status);
        console.error('📥 Error Response Data:', error.response.data);
        console.error('📥 Error Response Headers:', error.response.headers);
        
        const errorMessage = error.response?.data?.message || '';
        console.log('Backend Error Message:', errorMessage);
        
        // Handle specific error cases
        if (error.response.status === 401) {
          console.error('❌ 401 Unauthorized - Token invalid or expired');
          setError('Session expired. Please login again.');
          setTimeout(() => {
            console.log('🔄 Clearing tokens and redirecting to login');
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            router.push('/LoginPage');
          }, 2000);
        } else if (error.response.status === 400) {
          console.error('❌ 400 Bad Request');
          
          // More specific 400 errors
          if (errorMessage.toLowerCase().includes('format')) {
            console.error('Error Type: Invalid Format');
            setError('Invalid code format. Code must be 8 characters (letters and numbers only).');
          } else if (errorMessage.toLowerCase().includes('used')) {
            console.error('Error Type: Code Already Used');
            setError('This invitation code has already been used.');
          } else if (errorMessage.toLowerCase().includes('expired')) {
            console.error('Error Type: Code Expired');
            setError('This invitation code has expired. Please contact support.');
          } else if (errorMessage.toLowerCase().includes('not found') || errorMessage.toLowerCase().includes('invalid')) {
            console.error('Error Type: Code Not Found');
            setError('This invitation code does not exist. Please check and try again.');
          } else if (errorMessage.toLowerCase().includes('already verified')) {
            console.log('✅ Code already verified!');
            setError('Your invitation code is already verified! Redirecting to dashboard...');
            setTimeout(() => router.push('/Investordashboard'), 2000);
          } else {
            console.error('Error Type: Unknown 400 Error');
            setError(errorMessage || 'Invalid invitation code. Please check and try again.');
          }
        } else if (error.response.status === 404) {
          console.error('❌ 404 Not Found - Invitation code does not exist');
          setError('Invitation code not found. Please verify the code with your admin.');
        } else if (error.response.status === 403) {
          console.error('❌ 403 Forbidden - Access denied');
          setError('Access denied. Please contact support.');
        } else {
          console.error('❌ Unexpected status code:', error.response.status);
          setError(errorMessage || 'Failed to verify invitation code. Please try again.');
        }
      } else if (error.request) {
        console.error('❌ No response received from server');
        console.error('Request:', error.request);
        setError('No response from server. Please check your internet connection.');
      } else {
        console.error('❌ Error setting up request:', error.message);
        setError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
      console.log('=== Verification Process Ended ===');
    }
  };

  const handleSkip = () => {
    console.log('🔄 User clicked Skip button');
    const confirmSkip = confirm('You can verify your invitation code later from your profile settings. Continue to dashboard?');
    
    if (confirmSkip) {
      console.log('✅ User confirmed skip');
      console.log('🔄 Redirecting to dashboard...');
      // Keep tokens - user can verify later
      router.push('/Investordashboard');
    } else {
      console.log('❌ User cancelled skip');
    }
  };

  // Show loading while checking token
  if (tokenStatus === 'checking') {
    console.log('⏳ Checking authentication status...');
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#ef6b23] mx-auto mb-4"></div>
          <p className="text-gray-600">Checking authentication...</p>
        </div>
      </div>
    );
  }

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
              <svg className="w-8 h-8 sm:w-10 sm:h-10 text-[#ef6b23]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>

          {/* Title */}
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 text-center mb-3 sm:mb-4">
            Verify Invitation Code
          </h2>

          {/* Description */}
          <p className="text-sm sm:text-base text-gray-600 text-center mb-8 sm:mb-10 px-2">
            Enter your 8-character invitation code to unlock exclusive features
          </p>

          <form onSubmit={handleVerify}>
            {/* Invitation Code Input */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Invitation Code<span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g., 9VAQRHZH"
                value={invitationCode}
                onChange={(e) => {
                  // Only allow alphanumeric characters
                  const value = e.target.value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
                  console.log('Input changed:', value);
                  setInvitationCode(value);
                  setError('');
                }}
                maxLength={8}
                className="w-full px-4 py-3 sm:py-3.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ef6b23] focus:border-transparent text-gray-900 placeholder:text-gray-400 bg-white text-sm sm:text-base uppercase font-mono font-semibold tracking-wider text-center"
                autoFocus
                disabled={loading}
              />
              <p className="text-xs text-gray-500 mt-2 text-center">
                Enter the 8-character code (letters and numbers only)
              </p>
              {error && (
                <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-600 text-sm text-center">{error}</p>
                </div>
              )}
            </div>

            {/* Verify Button */}
            <button
              type="submit"
              disabled={loading || invitationCode.length !== 8}
              className="w-full px-6 py-3.5 bg-[#ef6b23] text-white rounded-lg font-semibold hover:bg-[#d85a1a] transition-colors shadow-sm text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed mb-4"
              onClick={() => console.log('Verify button clicked')}
            >
              {loading ? 'Verifying...' : 'Verify & Continue'}
            </button>

            {/* Skip Button */}
            {/* <button
              type="button"
              onClick={handleSkip}
              disabled={loading}
              className="w-full px-6 py-3.5 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors text-sm sm:text-base disabled:opacity-50"
            >
              Skip & Go to Dashboard
            </button> */}
          </form>

          {/* Debug Info (for development - remove in production) */}
          <div className="mt-4 p-3 bg-gray-50 border border-gray-200 rounded text-xs">
            <p className="text-gray-600 mb-1">
              <strong>Auth Status:</strong> {tokenStatus === 'valid' ? '✅ Authenticated' : '❌ Not authenticated'}
            </p>
            <p className="text-gray-600">
              <strong>Code Length:</strong> {invitationCode.length}/8
            </p>
          </div>

          {/* Help Section */}
          <div className="mt-6 space-y-3">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-xs sm:text-sm text-blue-800">
                <strong>Don't have an invitation code?</strong>
                <br />
                Skip for now and verify later from your dashboard settings.
              </p>
            </div>

            {/* Example Code Format */}
            <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
              <p className="text-xs text-gray-600 text-center">
                <span className="font-semibold">Example format:</span> 
                <span className="ml-2 font-mono bg-white px-2 py-1 rounded border border-gray-300">9VAQRHZH</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
