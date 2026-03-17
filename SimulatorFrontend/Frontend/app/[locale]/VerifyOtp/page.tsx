'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useLocale } from 'next-intl';
import Image from 'next/image';
import axios from 'axios';

const API_URL = 'https://cobuild-simulator-backend.onrender.com/api/v1';

// ─── Translations ─────────────────────────────────────────
const t = {
  en: {
    havingTrouble:        'Having trouble?',
    getHelp:              'Get Help',
    loadingPage:          'Loading verification page...',
    pageTitle:            'Verify Your Email',
    pageDesc:             "We've sent a 6-digit verification code to",
    otpLabel:             'Enter Verification Code',
    verifyButton:         'Verify Email',
    verifying:            'Verifying...',
    didntReceive:         "Didn't receive the code?",
    resendCode:           'Resend Code',
    resending:            'Resending...',
    resendIn:             'Resend code in',
    backToLogin:          '← Back to Login',
    enterAllDigits:       'Please enter all 6 digits',
    invalidOtp:           'Invalid OTP. Please try again.',
    resendSuccess:        '✅ OTP has been resent successfully!',
    resendFailed:         'Failed to resend OTP. Please try again.',
    // Success modal
    emailVerified:        'Email',
    emailVerifiedHighlight: 'Verified!',
    successDesc:          'Your email has been verified successfully. Next, verify your invitation code to unlock full access.',
    verifiedEmailLabel:   'Verified email',
    nextStep:             'Next: Verify your invitation code',
    continueButton:       'Continue to Invitation Code 🎉',
    redirectingAuto:      'Redirecting automatically in 5 seconds',
  },
  ar: {
    havingTrouble:        'هل تواجه مشكلة؟',
    getHelp:              'الحصول على المساعدة',
    loadingPage:          'جارٍ تحميل صفحة التحقق...',
    pageTitle:            'تحقق من بريدك الإلكتروني',
    pageDesc:             'لقد أرسلنا رمز تحقق مكوّن من 6 أرقام إلى',
    otpLabel:             'أدخل رمز التحقق',
    verifyButton:         'تحقق من البريد الإلكتروني',
    verifying:            'جارٍ التحقق...',
    didntReceive:         'لم تستلم الرمز؟',
    resendCode:           'إعادة الإرسال',
    resending:            'جارٍ الإرسال...',
    resendIn:             'إعادة الإرسال خلال',
    backToLogin:          'العودة إلى تسجيل الدخول ←',
    enterAllDigits:       'يرجى إدخال جميع الأرقام الستة',
    invalidOtp:           'رمز التحقق غير صحيح. يرجى المحاولة مجدداً.',
    resendSuccess:        '✅ تم إعادة إرسال الرمز بنجاح!',
    resendFailed:         'فشل إعادة إرسال الرمز. يرجى المحاولة مجدداً.',
    // Success modal
    emailVerified:        'تم التحقق',
    emailVerifiedHighlight: 'بنجاح!',
    successDesc:          'تم التحقق من بريدك الإلكتروني بنجاح. الخطوة التالية: تحقق من رمز دعوتك للوصول الكامل.',
    verifiedEmailLabel:   'البريد الإلكتروني المُتحقق منه',
    nextStep:             'التالي: تحقق من رمز الدعوة',
    continueButton:       'المتابعة إلى رمز الدعوة 🎉',
    redirectingAuto:      'سيتم التحويل تلقائياً خلال 5 ثوانٍ',
  },
};

// ─── Success Modal ────────────────────────────────────────
function SuccessModal({
  isOpen,
  onClose,
  email,
  tx,
  isAr,
}: {
  isOpen: boolean;
  onClose: () => void;
  email: string;
  tx: typeof t.en;
  isAr: boolean;
}) {
  useEffect(() => {
    if (!isOpen) return;
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      dir={isAr ? 'rtl' : 'ltr'}
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)' }}
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md rounded-3xl overflow-hidden shadow-2xl"
        style={{ animation: 'scaleIn 0.35s cubic-bezier(0.34,1.56,0.64,1)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-gradient-to-b from-[#1f1f1f] via-[#1a1a1a] to-[#141414] border border-white/10 rounded-3xl p-8 flex flex-col items-center text-center relative overflow-hidden">

          {/* Ambient glows */}
          <div className="absolute top-0 left-0 w-full h-40 bg-gradient-to-b from-[#ef6b23]/15 to-transparent pointer-events-none" />
          <div className="absolute bottom-0 right-0 w-48 h-48 bg-[#ef6b23]/5 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white/[0.03] via-transparent to-transparent pointer-events-none" />

          {/* ✅ Close button flips to left in RTL */}
          <button
            onClick={onClose}
            className={`absolute top-4 ${isAr ? 'left-4' : 'right-4'} w-8 h-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors z-10`}
          >
            <svg className="w-4 h-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Check Icon */}
          <div className="relative mb-6 z-10">
            <span className="absolute inset-0 w-24 h-24 rounded-full bg-[#ef6b23]/20 animate-ping" />
            <div className="absolute -inset-2 w-28 h-28 rounded-full border border-[#ef6b23]/20" />
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#ef6b23] to-[#c5600d] flex items-center justify-center shadow-xl shadow-[#ef6b23]/30 relative z-10">
              <svg className="w-11 h-11 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>

          {/* Title */}
          <h2 className="text-2xl sm:text-3xl font-extrabold mb-2 text-white z-10 relative">
            {tx.emailVerified}{' '}
            <span
              style={{
                background: 'linear-gradient(135deg, #ef6b23, #f59e0b)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              {tx.emailVerifiedHighlight}
            </span>
          </h2>

          <p className="text-gray-400 text-sm mb-6 leading-relaxed z-10 relative max-w-xs">
            {tx.successDesc}
          </p>

          {/* Email display card */}
          <div className="flex items-center gap-3 bg-[#ef6b23]/10 border border-[#ef6b23]/20 rounded-2xl px-5 py-3 mb-6 w-full z-10 relative">
            <div className="w-9 h-9 rounded-full bg-[#ef6b23]/20 flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-[#ef6b23]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            {/* ✅ Text block aligns to start in both directions */}
            <div className={`${isAr ? 'text-right' : 'text-left'} min-w-0`}>
              <p className="text-[#ef6b23] text-xs font-medium">{tx.verifiedEmailLabel}</p>
              {/* ✅ Email itself is always LTR */}
              <p dir="ltr" className="text-white text-sm font-semibold truncate">{email}</p>
            </div>
          </div>

          {/* Next step hint */}
          <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl px-5 py-3 mb-6 w-full z-10 relative">
            <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className={`text-gray-400 text-sm font-medium ${isAr ? 'text-right' : 'text-left'}`}>
              {tx.nextStep}
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
            {tx.continueButton}
          </button>

          <p className="text-xs text-gray-600 mt-4 z-10 relative">
            {tx.redirectingAuto}
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

// ─── OTP Content ──────────────────────────────────────────
function VerifyOtpContent() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const email        = searchParams.get('email');
  const locale       = useLocale();
  const isAr         = locale === 'ar';
  const dir          = isAr ? 'rtl' : 'ltr';
  const tx           = isAr ? t.ar : t.en;

  const [otp,           setOtp]           = useState(['', '', '', '', '', '']);
  const [loading,       setLoading]       = useState(false);
  const [error,         setError]         = useState('');
  const [resendLoading, setResendLoading] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [timer,         setTimer]         = useState(60);
  const [canResend,     setCanResend]     = useState(false);
  const [showSuccess,   setShowSuccess]   = useState(false);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (!email) router.push('/user-registration-page1');
  }, [email, router]);

  // ── Countdown timer ───────────────────────────────────────
  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => setTimer((p) => p - 1), 1000);
      return () => clearInterval(interval);
    } else {
      setCanResend(true);
    }
  }, [timer]);

  const handleModalClose = () => {
    setShowSuccess(false);
    router.push('/VerifyInvitation');
  };

  // ── OTP input navigation ──────────────────────────────────
  // ✅ In RTL the boxes are visually reversed, but the OTP
  //    array index order stays 0→5 (left-to-right in memory).
  //    We keep focus navigation identical — it just feels natural
  //    because the browser mirrors the flex row in RTL.
  const handleChange = (index: number, value: string) => {
    if (value && !/^\d$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setError('');
    if (value && index < 5) inputRefs.current[index + 1]?.focus();
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (!otp[index] && index > 0) {
        inputRefs.current[index - 1]?.focus();
      } else {
        const newOtp = [...otp];
        newOtp[index] = '';
        setOtp(newOtp);
      }
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').trim();
    if (!/^\d{6}$/.test(pastedData)) return;
    setOtp(pastedData.split(''));
    setError('');
    inputRefs.current[5]?.focus();
  };

  const handleVerify = async () => {
    const otpValue = otp.join('');
    if (otpValue.length !== 6) { setError(tx.enterAllDigits); return; }

    setLoading(true);
    setError('');

    try {
      const response = await axios.post(`${API_URL}/user/auth/verify-otp`, {
        email,
        otp: otpValue,
      });

      if (response.data.success) {
        const { accessToken, refreshToken } = response.data.data;
        if (accessToken)  localStorage.setItem('accessToken',  accessToken);
        if (refreshToken) localStorage.setItem('refreshToken', refreshToken);
        if (response.data.data.user?.email) {
          localStorage.setItem('userEmail', response.data.data.user.email);
        }
        setShowSuccess(true);
      }
    } catch (err) {
      let msg = tx.invalidOtp;
      if (axios.isAxiosError(err))    msg = err.response?.data?.message || msg;
      else if (err instanceof Error)  msg = err.message || msg;
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (!canResend || !email) return;
    setResendLoading(true);
    setError('');
    setResendSuccess(false);

    try {
      const response = await axios.post(`${API_URL}/user/auth/resend-otp`, { email });
      if (response.data?.success) {
        setResendSuccess(true);
        setCanResend(false);
        setTimer(60);
        setOtp(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
      } else {
        setError(response.data?.message || tx.resendFailed);
      }
    } catch (err) {
      let msg = tx.resendFailed;
      if (axios.isAxiosError(err))    msg = err.response?.data?.message || msg;
      else if (err instanceof Error)  msg = err.message || msg;
      setError(msg);
    } finally {
      setResendLoading(false);
    }
  };

  if (!email) return null;

  return (
    <div dir={dir} className="min-h-screen bg-white">

      {/* ── Success Modal ──────────────────────────────────── */}
      <SuccessModal
        isOpen={showSuccess}
        onClose={handleModalClose}
        email={email}
        tx={tx}
        isAr={isAr}
      />

      {/* ── Header ────────────────────────────────────────── */}
      <header className="px-4 sm:px-6 py-4 flex items-center justify-between">
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
      <div className="px-4 sm:px-6 py-8 sm:py-12 flex items-start justify-center">
        <div className="w-full max-w-[340px] sm:max-w-md">

          {/* Icon */}
          <div className="flex justify-center mb-6 sm:mb-8">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[#ef6b23]/10 flex items-center justify-center">
              <svg className="w-8 h-8 sm:w-10 sm:h-10 text-[#ef6b23]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
          </div>

          {/* Title */}
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 text-center mb-3 sm:mb-4">
            {tx.pageTitle}
          </h2>

          {/* Description */}
          <p className="text-sm sm:text-base text-gray-600 text-center mb-8 sm:mb-10 px-2">
            {tx.pageDesc}{' '}
            {/* ✅ Email address always LTR inline */}
            <span dir="ltr" className="font-semibold text-gray-900 inline">{email}</span>
          </p>

          {/* ── OTP Inputs ──────────────────────────────────── */}
          <div className="mb-6 sm:mb-8">
            <label className="block text-sm font-medium text-gray-900 mb-3 sm:mb-4 text-center">
              {tx.otpLabel}
            </label>

            {/* ✅ OTP boxes: dir="ltr" so digit order is always left→right
                regardless of page direction. The flex container itself
                is forced LTR so box 0 is always on the left visually. */}
            <div
              dir="ltr"
              className="flex justify-center gap-2 sm:gap-3"
              onPaste={handlePaste}
            >
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => { inputRefs.current[index] = el; }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className={`w-12 h-12 sm:w-14 sm:h-14 text-center text-lg sm:text-xl font-semibold border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ef6b23] focus:border-transparent text-gray-900 bg-white transition-all ${
                    digit ? 'border-[#ef6b23] bg-[#ef6b23]/5' : 'border-gray-300'
                  }`}
                  autoFocus={index === 0}
                />
              ))}
            </div>

            {/* Fill progress dots — also LTR so they fill left→right */}
            <div dir="ltr" className="flex justify-center gap-1.5 mt-3">
              {otp.map((digit, i) => (
                <div
                  key={i}
                  className={`w-6 h-1 rounded-full transition-all duration-200 ${
                    digit ? 'bg-[#ef6b23]' : 'bg-gray-200'
                  }`}
                />
              ))}
            </div>

            {error && (
              <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600 text-sm text-center">{error}</p>
              </div>
            )}
            {resendSuccess && (
              <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-green-600 text-sm text-center">{tx.resendSuccess}</p>
              </div>
            )}
          </div>

          {/* Verify Button */}
          <button
            onClick={handleVerify}
            disabled={loading || otp.join('').length !== 6}
            className="w-full px-4 sm:px-6 py-3 sm:py-3.5 bg-[#ef6b23] text-white rounded-lg font-semibold hover:bg-[#d85a1a] transition-colors shadow-sm text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed mb-6"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                {tx.verifying}
              </span>
            ) : tx.verifyButton}
          </button>

          {/* Resend OTP */}
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-2">{tx.didntReceive}</p>
            {canResend ? (
              <button
                onClick={handleResendOtp}
                disabled={resendLoading}
                className="text-[#ef6b23] font-semibold hover:underline text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {resendLoading ? tx.resending : tx.resendCode}
              </button>
            ) : (
              <p className="text-sm text-gray-500">
                {tx.resendIn}{' '}
                {/* ✅ Timer number always LTR */}
                <span dir="ltr" className="font-semibold text-[#ef6b23] inline">{timer}s</span>
              </p>
            )}
          </div>

          {/* Back to Login */}
          <div className="mt-8 text-center">
            <button
              onClick={() => router.push('/login-page')}
              className="text-sm text-gray-600 hover:text-[#ef6b23] transition-colors"
            >
              {tx.backToLogin}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}

// ─── Page Wrapper ─────────────────────────────────────────
export default function VerifyOtpPage() {
  const locale = useLocale();
  const isAr   = locale === 'ar';
  const tx     = isAr ? t.ar : t.en;

  return (
    <Suspense
      fallback={
        <div dir={isAr ? 'rtl' : 'ltr'} className="min-h-screen bg-white flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-[#ef6b23] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-600 text-sm">{tx.loadingPage}</p>
          </div>
        </div>
      }
    >
      <VerifyOtpContent />
    </Suspense>
  );
}
