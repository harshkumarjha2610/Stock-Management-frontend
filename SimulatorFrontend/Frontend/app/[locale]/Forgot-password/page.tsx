'use client';
import React, { useState } from 'react';
import { useRouter } from '@/navigation'; // ✅ locale-aware router
import { useLocale } from 'next-intl';
import Image from 'next/image';

const API_BASE_URL = 'https://cobuild-simulator-backend.onrender.com/api/v1';

// ─── Translations ──────────────────────────────────────────
const t = {
  en: {
    havingTrouble:      'Having trouble?',
    getHelp:            'Get Help',
    pageTitle:          'Forgot Password?',
    pageDesc:           "Enter your email address and we'll send you instructions to reset your password.",
    emailLabel:         'Email',
    emailPlaceholder:   'Enter Your Email',
    sendButton:         'Send Reset Instructions',
    sending:            'Sending...',
    backToLogin:        '← Back to Login',
    // Validation
    emailRequired:      'Email is required',
    emailInvalid:       'Please enter a valid email address',
    // API
    successFallback:    'Password reset instructions have been sent to your email.',
    errorFallback:      'Failed to send reset instructions. Please try again.',
    networkError:       'An error occurred. Please check your connection and try again.',
  },
  ar: {
    havingTrouble:      'هل تواجه مشكلة؟',
    getHelp:            'الحصول على المساعدة',
    pageTitle:          'نسيت كلمة المرور؟',
    pageDesc:           'أدخل بريدك الإلكتروني وسنرسل لك تعليمات لإعادة تعيين كلمة المرور.',
    emailLabel:         'البريد الإلكتروني',
    emailPlaceholder:   'أدخل بريدك الإلكتروني',
    sendButton:         'إرسال تعليمات إعادة التعيين',
    sending:            'جارٍ الإرسال...',
    backToLogin:        'العودة إلى تسجيل الدخول ←',
    // Validation
    emailRequired:      'البريد الإلكتروني مطلوب',
    emailInvalid:       'يرجى إدخال بريد إلكتروني صحيح',
    // API
    successFallback:    'تم إرسال تعليمات إعادة تعيين كلمة المرور إلى بريدك الإلكتروني.',
    errorFallback:      'فشل إرسال التعليمات. يرجى المحاولة مجدداً.',
    networkError:       'حدث خطأ. يرجى التحقق من اتصالك والمحاولة مجدداً.',
  },
};

// ─── Spinner ───────────────────────────────────────────────
const Spinner = ({ className }: { className?: string }) => (
  <svg className={`animate-spin ${className}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-75" fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
  </svg>
);

export default function ForgotPasswordPage() {
  const router   = useRouter();
  const locale   = useLocale();
  const isAr     = locale === 'ar';
  const dir      = isAr ? 'rtl' : 'ltr';
  const tx       = isAr ? t.ar : t.en;

  const [email,          setEmail]          = useState('');
  const [error,          setError]          = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading,      setIsLoading]      = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    if (error)          setError('');
    if (successMessage) setSuccessMessage('');
  };

  const validateEmail = (): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      setError(tx.emailRequired);
      return false;
    } else if (!emailRegex.test(email)) {
      setError(tx.emailInvalid);
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validateEmail()) return;

    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/user/auth/forgot-password`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSuccessMessage(data.message || tx.successFallback);
        setError('');
        setTimeout(() => {
          router.push(`/ResetPassword?email=${encodeURIComponent(email)}`); // ✅ locale-aware
        }, 2000);
      } else {
        setError(data.message || tx.errorFallback);
        setSuccessMessage('');
      }
    } catch (err) {
      console.error('Forgot password error:', err);
      setError(tx.networkError);
      setSuccessMessage('');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div dir={dir} className="min-h-screen bg-white">

      {/* ── Header ────────────────────────────────────────── */}
      <header className="px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
        <Image
          src="/Co-build-logo-02-1.png"
          alt="CoBuild Logo"
          width={150}
          height={40}
          className="h-8 sm:h-10 w-auto"
          priority
        />
        <div className="text-xs sm:text-sm text-gray-600">
          {tx.havingTrouble}{' '}
          <span className="text-[#ef6b23] cursor-pointer hover:underline">{tx.getHelp}</span>
        </div>
      </header>

      {/* ── Main Content ──────────────────────────────────── */}
      <div className="px-4 sm:px-6 py-6 sm:py-8 flex items-center justify-center">
        <div className="w-full max-w-[340px] sm:max-w-md">

          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-3 sm:mb-4 text-center">
            {tx.pageTitle}
          </h2>
          <p className={`text-xs sm:text-sm text-gray-600 mb-6 sm:mb-8 text-center ${isAr ? 'leading-relaxed' : ''}`}>
            {tx.pageDesc}
          </p>

          <form onSubmit={handleSubmit}>
            <div className="space-y-4 sm:space-y-5">

              {/* ── Email ─────────────────────────────────── */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  {tx.emailLabel}<span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  placeholder={tx.emailPlaceholder}
                  value={email}
                  onChange={handleInputChange}
                  dir="ltr" // ✅ emails always LTR
                  className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 border ${
                    error          ? 'border-red-500'   :
                    successMessage ? 'border-green-500' :
                    'border-gray-300'
                  } rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ef6b23] focus:border-transparent text-gray-900 placeholder:text-gray-400 bg-white text-sm sm:text-base ${
                    isAr ? 'text-right placeholder:text-right' : ''
                  }`}
                />
                {error && (
                  <p className={`text-red-500 text-xs sm:text-sm mt-1 ${isAr ? 'text-right' : ''}`}>
                    {error}
                  </p>
                )}
                {successMessage && (
                  <p className={`text-green-600 text-xs sm:text-sm mt-1 ${isAr ? 'text-right' : ''}`}>
                    {successMessage}
                  </p>
                )}
              </div>

            </div>

            {/* ── Submit Button ─────────────────────────── */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-8 sm:mt-10 px-4 sm:px-6 py-2.5 sm:py-3 bg-[#ef6b23] text-white rounded-lg font-semibold hover:bg-[#d85a1a] transition-colors shadow-sm text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Spinner className="h-5 w-5 text-white" />
                  {tx.sending}
                </>
              ) : tx.sendButton}
            </button>

            {/* ── Back to Login ─────────────────────────── */}
            <div className="text-center mt-6 sm:mt-8">
              <button
                type="button"
                onClick={() => router.push('/LoginPage')} // ✅ locale-aware
                className="text-xs sm:text-sm text-[#ef6b23] font-semibold hover:underline"
              >
                {tx.backToLogin}
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}
