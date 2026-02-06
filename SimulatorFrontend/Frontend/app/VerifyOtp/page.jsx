'use client';
import React, { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import axios from 'axios';

// Define API URL at the top
const API_URL = "https://cobuild-simulator-backend.onrender.com/api/v1";

export default function VerifyOtpPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email');
  
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resendLoading, setResendLoading] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  
  const inputRefs = useRef([]);

  useEffect(() => {
    if (!email) {
      router.push('/OnboardingPage1');
      return;
    }
  }, [email, router]);

  // Timer for resend OTP
  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    } else {
      setCanResend(true);
    }
  }, [timer]);

  const handleChange = (index, value) => {
    // Only allow numbers
    if (value && !/^\d$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setError('');

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace') {
      if (!otp[index] && index > 0) {
        // Move to previous input if current is empty
        inputRefs.current[index - 1]?.focus();
      } else {
        // Clear current input
        const newOtp = [...otp];
        newOtp[index] = '';
        setOtp(newOtp);
      }
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').trim();
    
    // Only allow 6-digit numbers
    if (!/^\d{6}$/.test(pastedData)) return;

    const newOtp = pastedData.split('');
    setOtp(newOtp);
    setError('');
    
    // Focus last input
    inputRefs.current[5]?.focus();
  };

  const handleVerify = async () => {
    const otpValue = otp.join('');
    
    if (otpValue.length !== 6) {
      setError('Please enter all 6 digits');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await axios.post(
        `${API_URL}/user/auth/verify-otp`,
        {
          email,
          otp: otpValue,
        }
      );

      if (response.data.success) {
        alert('Email verified successfully! You can now login.');
        router.push('/login');
      }
    } catch (error) {
      console.error('OTP verification error:', error);
      const errorMessage = error.response?.data?.message || 'Invalid OTP. Please try again.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (!canResend) return;

    setResendLoading(true);
    setError('');
    setResendSuccess(false);

    try {
      const response = await axios.post(
        `${API_URL}/user/auth/resend-otp`,
        { email }
      );

      if (response.data.success) {
        setResendSuccess(true);
        setCanResend(false);
        setTimer(60);
        setOtp(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
        
        setTimeout(() => setResendSuccess(false), 3000);
      }
    } catch (error) {
      console.error('Resend OTP error:', error);
      const errorMessage = error.response?.data?.message || 'Failed to resend OTP. Please try again.';
      setError(errorMessage);
    } finally {
      setResendLoading(false);
    }
  };

  if (!email) return null;

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
      <div className="px-4 sm:px-6 py-8 sm:py-12 flex items-start justify-center">
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
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </div>
          </div>

          {/* Title */}
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 text-center mb-3 sm:mb-4">
            Verify Your Email
          </h2>

          {/* Description */}
          <p className="text-sm sm:text-base text-gray-600 text-center mb-8 sm:mb-10 px-2">
            We've sent a 6-digit verification code to{' '}
            <span className="font-semibold text-gray-900">{email}</span>
          </p>

          {/* OTP Input */}
          <div className="mb-6 sm:mb-8">
            <label className="block text-sm font-medium text-gray-900 mb-3 sm:mb-4 text-center">
              Enter Verification Code
            </label>
            <div className="flex justify-center gap-2 sm:gap-3" onPaste={handlePaste}>
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => (inputRefs.current[index] = el)}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className="w-12 h-12 sm:w-14 sm:h-14 text-center text-lg sm:text-xl font-semibold border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ef6b23] focus:border-transparent text-gray-900 bg-white transition-all"
                  autoFocus={index === 0}
                />
              ))}
            </div>
            {error && (
              <p className="text-red-500 text-sm mt-3 text-center">{error}</p>
            )}
            {resendSuccess && (
              <p className="text-green-600 text-sm mt-3 text-center">
                OTP has been resent successfully!
              </p>
            )}
          </div>

          {/* Verify Button */}
          <button
            onClick={handleVerify}
            disabled={loading || otp.join('').length !== 6}
            className="w-full px-4 sm:px-6 py-3 sm:py-3.5 bg-[#ef6b23] text-white rounded-lg font-semibold hover:bg-[#d85a1a] transition-colors shadow-sm text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed mb-6"
          >
            {loading ? 'Verifying...' : 'Verify Email'}
          </button>

          {/* Resend OTP */}
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-2">
              Didn't receive the code?
            </p>
            {canResend ? (
              <button
                onClick={handleResendOtp}
                disabled={resendLoading}
                className="text-[#ef6b23] font-semibold hover:underline text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {resendLoading ? 'Resending...' : 'Resend Code'}
              </button>
            ) : (
              <p className="text-sm text-gray-500">
                Resend code in{' '}
                <span className="font-semibold text-gray-700">{timer}s</span>
              </p>
            )}
          </div>

          {/* Back to Login */}
          <div className="mt-8 text-center">
            <button
              onClick={() => router.push('/login')}
              className="text-sm text-gray-600 hover:text-[#ef6b23] transition-colors"
            >
              ← Back to Login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
