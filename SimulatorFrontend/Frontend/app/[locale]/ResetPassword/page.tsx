'use client';
import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useLocale } from 'next-intl';
import Image from 'next/image';

const API_BASE_URL = 'https://cobuild-simulator-backend.onrender.com/api/v1';

// ─── Translations ──────────────────────────────────────────
const t = {
  en: {
    havingTrouble:          'Having trouble?',
    getHelp:                'Get Help',
    pageTitle:              'Reset Password',
    pageDesc:               'Enter the OTP sent to your email and create a new password.',
    emailLabel:             'Email',
    emailPlaceholder:       'Enter Your Email',
    otpLabel:               'OTP',
    otpPlaceholder:         'Enter OTP',
    newPasswordLabel:       'New Password',
    newPasswordPlaceholder: 'Enter New Password',
    confirmPasswordLabel:   'Confirm Password',
    confirmPlaceholder:     'Confirm New Password',
    resetButton:            'Reset Password',
    resetting:              'Resetting...',
    backToLogin:            '← Back to Login',
    loadingPage:            'Loading...',
    // Validation
    emailRequired:          'Email is required',
    emailInvalid:           'Please enter a valid email address',
    otpRequired:            'OTP is required',
    otpInvalid:             'Please enter a valid OTP',
    newPasswordRequired:    'New password is required',
    passwordMinLength:      'Password must be at least 8 characters',
    confirmPasswordRequired:'Please confirm your password',
    passwordsMismatch:      'Passwords do not match',
    // API
    successFallback:        'Password reset successful!',
    errorFallback:          'Failed to reset password. Please check your OTP.',
    networkError:           'An error occurred. Please try again.',
  },
  ar: {
    havingTrouble:          'هل تواجه مشكلة؟',
    getHelp:                'الحصول على المساعدة',
    pageTitle:              'إعادة تعيين كلمة المرور',
    pageDesc:               'أدخل رمز التحقق المُرسَل إلى بريدك الإلكتروني وأنشئ كلمة مرور جديدة.',
    emailLabel:             'البريد الإلكتروني',
    emailPlaceholder:       'أدخل بريدك الإلكتروني',
    otpLabel:               'رمز التحقق',
    otpPlaceholder:         'أدخل رمز التحقق',
    newPasswordLabel:       'كلمة المرور الجديدة',
    newPasswordPlaceholder: 'أدخل كلمة المرور الجديدة',
    confirmPasswordLabel:   'تأكيد كلمة المرور',
    confirmPlaceholder:     'أكّد كلمة المرور الجديدة',
    resetButton:            'إعادة تعيين كلمة المرور',
    resetting:              'جارٍ إعادة التعيين...',
    backToLogin:            'العودة إلى تسجيل الدخول ←',
    loadingPage:            'جارٍ التحميل...',
    // Validation
    emailRequired:          'البريد الإلكتروني مطلوب',
    emailInvalid:           'يرجى إدخال بريد إلكتروني صحيح',
    otpRequired:            'رمز التحقق مطلوب',
    otpInvalid:             'يرجى إدخال رمز تحقق صحيح',
    newPasswordRequired:    'كلمة المرور الجديدة مطلوبة',
    passwordMinLength:      'يجب أن تكون كلمة المرور 8 أحرف على الأقل',
    confirmPasswordRequired:'يرجى تأكيد كلمة المرور',
    passwordsMismatch:      'كلمتا المرور غير متطابقتين',
    // API
    successFallback:        'تمت إعادة تعيين كلمة المرور بنجاح!',
    errorFallback:          'فشل إعادة تعيين كلمة المرور. يرجى التحقق من رمز التحقق.',
    networkError:           'حدث خطأ. يرجى المحاولة مجدداً.',
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

// ─── Form Component ────────────────────────────────────────
function ResetPasswordForm() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const locale       = useLocale();
  const isAr         = locale === 'ar';
  const tx           = isAr ? t.ar : t.en;

  const [formData, setFormData] = useState({
    email:           '',
    otp:             '',
    newPassword:     '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({
    email:           '',
    otp:             '',
    newPassword:     '',
    confirmPassword: '',
  });
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading,      setIsLoading]      = useState(false);

  useEffect(() => {
    const emailParam = searchParams.get('email');
    if (emailParam) setFormData((prev) => ({ ...prev, email: emailParam }));
  }, [searchParams]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = (): boolean => {
    let isValid = true;
    const newErrors = { email: '', otp: '', newPassword: '', confirmPassword: '' };

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = tx.emailRequired; isValid = false;
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = tx.emailInvalid;  isValid = false;
    }

    if (!formData.otp.trim()) {
      newErrors.otp = tx.otpRequired; isValid = false;
    } else if (formData.otp.length < 4) {
      newErrors.otp = tx.otpInvalid;  isValid = false;
    }

    if (!formData.newPassword) {
      newErrors.newPassword = tx.newPasswordRequired; isValid = false;
    } else if (formData.newPassword.length < 8) {
      newErrors.newPassword = tx.passwordMinLength;   isValid = false;
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = tx.confirmPasswordRequired; isValid = false;
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = tx.passwordsMismatch;       isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/user/auth/reset-password`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          email:       formData.email,
          otp:         formData.otp,
          newPassword: formData.newPassword,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSuccessMessage(data.message || tx.successFallback);
        setErrors({ email: '', otp: '', newPassword: '', confirmPassword: '' });
        setTimeout(() => {
          // ✅ Manual locale prefix since this component uses next/navigation's useSearchParams
          window.location.href = `/${locale}/LoginPage`;
        }, 2000);
      } else {
        setErrors((prev) => ({ ...prev, otp: data.message || tx.errorFallback }));
      }
    } catch (err) {
      console.error('Reset password error:', err);
      setErrors((prev) => ({ ...prev, otp: tx.networkError }));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-[340px] sm:max-w-md">

      <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-3 sm:mb-4 text-center">
        {tx.pageTitle}
      </h2>
      <p className="text-xs sm:text-sm text-gray-600 mb-6 sm:mb-8 text-center">
        {tx.pageDesc}
      </p>

      {/* ── Success Banner ─────────────────────────────── */}
      {successMessage && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <p className={`text-green-700 text-sm text-center ${isAr ? 'font-medium' : ''}`}>
            {successMessage}
          </p>
        </div>
      )}

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
              value={formData.email}
              onChange={handleInputChange}
              dir="ltr" // ✅ emails always LTR
              className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 border ${
                errors.email ? 'border-red-500' : 'border-gray-300'
              } rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ef6b23] focus:border-transparent text-gray-900 placeholder:text-gray-400 bg-white text-sm sm:text-base ${
                isAr ? 'text-right placeholder:text-right' : ''
              }`}
            />
            {errors.email && (
              <p className={`text-red-500 text-xs sm:text-sm mt-1 ${isAr ? 'text-right' : ''}`}>
                {errors.email}
              </p>
            )}
          </div>

          {/* ── OTP ───────────────────────────────────── */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              {tx.otpLabel}<span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="otp"
              name="otp"
              placeholder={tx.otpPlaceholder}
              value={formData.otp}
              onChange={handleInputChange}
              dir="ltr" // ✅ OTP codes always LTR
              className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 border ${
                errors.otp ? 'border-red-500' : 'border-gray-300'
              } rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ef6b23] focus:border-transparent text-gray-900 placeholder:text-gray-400 bg-white text-sm sm:text-base ${
                isAr ? 'text-right placeholder:text-right' : ''
              }`}
            />
            {errors.otp && (
              <p className={`text-red-500 text-xs sm:text-sm mt-1 ${isAr ? 'text-right' : ''}`}>
                {errors.otp}
              </p>
            )}
          </div>

          {/* ── New Password ───────────────────────────── */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              {tx.newPasswordLabel}<span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              id="newPassword"
              name="newPassword"
              placeholder={tx.newPasswordPlaceholder}
              value={formData.newPassword}
              onChange={handleInputChange}
              className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 border ${
                errors.newPassword ? 'border-red-500' : 'border-gray-300'
              } rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ef6b23] focus:border-transparent text-gray-900 placeholder:text-gray-400 bg-white text-sm sm:text-base ${
                isAr ? 'text-right placeholder:text-right' : ''
              }`}
            />
            {errors.newPassword && (
              <p className={`text-red-500 text-xs sm:text-sm mt-1 ${isAr ? 'text-right' : ''}`}>
                {errors.newPassword}
              </p>
            )}
          </div>

          {/* ── Confirm Password ───────────────────────── */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              {tx.confirmPasswordLabel}<span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              placeholder={tx.confirmPlaceholder}
              value={formData.confirmPassword}
              onChange={handleInputChange}
              className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 border ${
                errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
              } rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ef6b23] focus:border-transparent text-gray-900 placeholder:text-gray-400 bg-white text-sm sm:text-base ${
                isAr ? 'text-right placeholder:text-right' : ''
              }`}
            />
            {errors.confirmPassword && (
              <p className={`text-red-500 text-xs sm:text-sm mt-1 ${isAr ? 'text-right' : ''}`}>
                {errors.confirmPassword}
              </p>
            )}
          </div>

        </div>

        {/* ── Submit Button ──────────────────────────── */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full mt-8 sm:mt-10 px-4 sm:px-6 py-2.5 sm:py-3 bg-[#ef6b23] text-white rounded-lg font-semibold hover:bg-[#d85a1a] transition-colors shadow-sm text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <Spinner className="h-5 w-5 text-white" />
              {tx.resetting}
            </>
          ) : tx.resetButton}
        </button>

        {/* ── Back to Login ──────────────────────────── */}
        <div className="text-center mt-6 sm:mt-8">
          <button
            type="button"
            onClick={() => { window.location.href = `/${locale}/LoginPage`; }}
            className="text-xs sm:text-sm text-[#ef6b23] font-semibold hover:underline"
          >
            {tx.backToLogin}
          </button>
        </div>

      </form>
    </div>
  );
}

// ─── Main Page with Suspense ───────────────────────────────
export default function ResetPasswordPage() {
  const locale = useLocale();
  const isAr   = locale === 'ar';
  const tx     = isAr ? t.ar : t.en;

  return (
    <div dir={isAr ? 'rtl' : 'ltr'} className="min-h-screen bg-white">

      {/* ── Header ────────────────────────────────────── */}
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

      {/* ── Main Content ──────────────────────────────── */}
      <div className="px-4 sm:px-6 py-6 sm:py-8 flex items-center justify-center">
        <Suspense fallback={
          <div className="w-full max-w-[340px] sm:max-w-md animate-pulse">
            <div className="h-8 bg-gray-200 rounded mb-4" />
            <div className="h-4 bg-gray-200 rounded mb-8" />
            <div className="space-y-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-12 bg-gray-200 rounded" />
              ))}
            </div>
            <p className="text-center text-xs text-gray-400 mt-4">{tx.loadingPage}</p>
          </div>
        }>
          <ResetPasswordForm />
        </Suspense>
      </div>

    </div>
  );
}
