'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import axios from 'axios';

const API_URL = "https://cobuild-simulator-backend.onrender.com/api/v1";

// ─── Success Modal ────────────────────────────────────────
function SuccessModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  useEffect(() => {
    if (!isOpen) return;
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)' }}
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md rounded-3xl overflow-hidden shadow-2xl"
        style={{ animation: 'scaleIn 0.35s cubic-bezier(0.34,1.56,0.64,1)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Dark gradient card */}
        <div className="bg-gradient-to-b from-[#1f1f1f] via-[#1a1a1a] to-[#141414] border border-white/10 rounded-3xl p-8 flex flex-col items-center text-center relative overflow-hidden">

          {/* Ambient glows */}
          <div className="absolute top-0 left-0 w-full h-40 bg-gradient-to-b from-[#ef6b23]/15 to-transparent pointer-events-none" />
          <div className="absolute bottom-0 right-0 w-48 h-48 bg-[#ef6b23]/5 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white/[0.03] via-transparent to-transparent pointer-events-none" />

          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors z-10"
          >
            <svg className="w-4 h-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Check Icon with orange ring */}
          <div className="relative mb-6 z-10">
            <span className="absolute inset-0 w-24 h-24 rounded-full bg-[#ef6b23]/20 animate-ping" />
            <div className="absolute -inset-2 w-28 h-28 rounded-full border border-[#ef6b23]/20" />
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#ef6b23] to-[#c5600d] flex items-center justify-center shadow-xl shadow-[#ef6b23]/30 relative z-10">
              <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>

          {/* Title */}
          <h2 className="text-2xl sm:text-3xl font-extrabold mb-2 text-white z-10 relative">
            Code{' '}
            <span
              style={{
                background: 'linear-gradient(135deg, #ef6b23, #f59e0b)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Verified!
            </span>
          </h2>

          <p className="text-gray-400 text-sm mb-6 leading-relaxed z-10 relative max-w-xs">
            Your invitation code has been verified successfully. Welcome to CoBuild!
          </p>

          {/* Info card */}
          <div className="flex items-center gap-3 bg-[#ef6b23]/10 border border-[#ef6b23]/20 rounded-2xl px-5 py-3 mb-6 w-full z-10 relative">
            <div className="w-9 h-9 rounded-full bg-[#ef6b23]/20 flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-[#ef6b23]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-[#ef6b23] text-sm font-medium text-left">
              Redirecting you to your Investor Dashboard
            </p>
          </div>

          {/* Bouncing dots */}
          <div className="flex gap-2 mb-6 z-10 relative">
            {['#ef6b23', '#f59e0b', '#ffffff', '#f59e0b', '#ef6b23'].map((color, i) => (
              <span
                key={i}
                className="w-2 h-2 rounded-full"
                style={{
                  backgroundColor: color,
                  opacity: color === '#ffffff' ? 0.3 : 1,
                  animation: `bounceDot 0.7s ease-in-out ${i * 0.12}s infinite alternate`,
                }}
              />
            ))}
          </div>

          {/* Progress bar */}
          <div className="w-full bg-white/5 border border-white/10 rounded-full h-1.5 mb-6 overflow-hidden z-10 relative">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#ef6b23] to-[#f59e0b]"
              style={{ animation: 'shrink 5s linear forwards' }}
            />
          </div>

          {/* CTA Button */}
          <button
            onClick={onClose}
            className="w-full py-3.5 rounded-2xl font-bold text-white text-base transition-all hover:shadow-xl hover:shadow-[#ef6b23]/20 hover:-translate-y-0.5 transform z-10 relative"
            style={{ background: 'linear-gradient(135deg, #ef6b23, #c5600d)' }}
          >
            Go to Dashboard 🚀
          </button>

          <p className="text-xs text-gray-600 mt-4 z-10 relative">
            Redirecting automatically in 5 seconds
          </p>
        </div>
      </div>

      <style jsx>{`
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.85) translateY(20px); }
          to   { opacity: 1; transform: scale(1)    translateY(0);    }
        }
        @keyframes shrink {
          from { width: 100%; }
          to   { width: 0%;   }
        }
        @keyframes bounceDot {
          from { transform: translateY(0px);  }
          to   { transform: translateY(-6px); }
        }
      `}</style>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────
export default function VerifyInvitationCodePage() {
  const router = useRouter();
  const [invitationCode,  setInvitationCode]  = useState('');
  const [loading,         setLoading]         = useState(false);
  const [error,           setError]           = useState('');
  const [tokenStatus,     setTokenStatus]     = useState<'checking' | 'valid' | 'invalid'>('checking');
  const [showSuccessModal, setShowSuccessModal] = useState(false);   // ← new

  useEffect(() => {
    const accessToken  = localStorage.getItem('accessToken');
    const refreshToken = localStorage.getItem('refreshToken');
    const userEmail    = localStorage.getItem('userEmail');

    console.log('Access Token:',  accessToken  ? `Found (${accessToken.substring(0, 30)}...)` : 'Not found');
    console.log('Refresh Token:', refreshToken ? 'Found' : 'Not found');
    console.log('User Email:',    userEmail    || 'Not found');

    if (!accessToken) {
      console.error('❌ No access token — redirecting to login');
      setTokenStatus('invalid');
      alert('Please complete email verification first');
      router.push('/LoginPage');
    } else {
      console.log('✅ Access token found');
      setTokenStatus('valid');
    }
  }, [router]);

  // ── Called when modal closes (or auto-closes after 5s) ────────────────────
  const handleModalClose = () => {
    setShowSuccessModal(false);
    router.push('/Investordashboard');
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!invitationCode.trim()) {
      setError('Please enter your invitation code');
      return;
    }
    if (invitationCode.length !== 8) {
      setError('Invitation code must be exactly 8 characters');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const accessToken = localStorage.getItem('accessToken');

      if (!accessToken) {
        setError('Authentication token not found. Please login again.');
        setTimeout(() => router.push('/LoginPage'), 2000);
        return;
      }

      const codeToVerify = invitationCode.trim().toUpperCase();

      const response = await axios.post(
        `${API_URL}/user/auth/verify-invitation-code`,
        { invitationCode: codeToVerify },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      console.log('📥 Response:', response.data);

      if (response.data.success) {
        console.log('✅ Invitation code verified!');
        setShowSuccessModal(true);   // ← show modal instead of alert
      } else {
        setError(response.data.message || 'Verification failed');
      }
    } catch (error: any) {
      console.error('Verification error:', error);

      if (error.response) {
        const errorMessage = error.response?.data?.message || '';
        const status       = error.response.status;

        if (status === 401) {
          setError('Session expired. Please login again.');
          setTimeout(() => {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            router.push('/LoginPage');
          }, 2000);
        } else if (status === 400) {
          if (errorMessage.toLowerCase().includes('format')) {
            setError('Invalid code format. Code must be 8 characters (letters and numbers only).');
          } else if (errorMessage.toLowerCase().includes('used')) {
            setError('This invitation code has already been used.');
          } else if (errorMessage.toLowerCase().includes('expired')) {
            setError('This invitation code has expired. Please contact support.');
          } else if (errorMessage.toLowerCase().includes('not found') || errorMessage.toLowerCase().includes('invalid')) {
            setError('This invitation code does not exist. Please check and try again.');
          } else if (errorMessage.toLowerCase().includes('already verified')) {
            // Already verified — just show success modal and redirect
            setShowSuccessModal(true);
          } else {
            setError(errorMessage || 'Invalid invitation code. Please check and try again.');
          }
        } else if (status === 404) {
          setError('Invitation code not found. Please verify the code with your admin.');
        } else if (status === 403) {
          setError('Access denied. Please contact support.');
        } else {
          setError(errorMessage || 'Failed to verify invitation code. Please try again.');
        }
      } else if (error.request) {
        setError('No response from server. Please check your internet connection.');
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    const confirmSkip = confirm('You can verify your invitation code later from your profile settings. Continue to dashboard?');
    if (confirmSkip) router.push('/Investordashboard');
  };

  if (tokenStatus === 'checking') {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#ef6b23] mx-auto mb-4" />
          <p className="text-gray-600">Checking authentication...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">

      {/* ── Success Modal ───────────────────────────────────── */}
      <SuccessModal isOpen={showSuccessModal} onClose={handleModalClose} />

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
          <span className="text-[#ef6b23] cursor-pointer hover:underline">Get Help</span>
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
            {/* Input */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Invitation Code<span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g., 9VAQRHZH"
                value={invitationCode}
                onChange={(e) => {
                  const value = e.target.value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
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

              {/* Character counter */}
              <div className="flex justify-center mt-2 gap-1.5">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div
                    key={i}
                    className={`w-7 h-1.5 rounded-full transition-all duration-200 ${
                      i < invitationCode.length
                        ? 'bg-[#ef6b23]'
                        : 'bg-gray-200'
                    }`}
                  />
                ))}
              </div>

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
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Verifying...
                </span>
              ) : 'Verify & Continue'}
            </button>
          </form>

          {/* Help Section */}
          <div className="mt-4 space-y-3">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-xs sm:text-sm text-blue-800">
                <strong>Don't have an invitation code?</strong>
                <br />
                Skip for now and verify later from your dashboard settings.
              </p>
            </div>
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
