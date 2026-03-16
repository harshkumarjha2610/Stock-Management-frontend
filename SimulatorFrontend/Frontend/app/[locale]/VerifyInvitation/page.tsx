'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import Image from 'next/image';
import axios from 'axios';

const API_URL = 'https://cobuild-simulator-backend.onrender.com/api/v1';

// ─── Translations ─────────────────────────────────────────
const t = {
  en: {
    havingTrouble:          'Having trouble?',
    getHelp:                'Get Help',
    checkingAuth:           'Checking authentication...',
    pageTitle:              'Verify Invitation Code',
    pageDesc:               'Enter your 8-character invitation code to unlock exclusive features',
    inputLabel:             'Invitation Code',
    inputPlaceholder:       'e.g., 9VAQRHZH',
    inputHint:              'Enter the 8-character code (letters and numbers only)',
    verifyButton:           'Verify & Continue',
    verifying:              'Verifying...',
    noCodeTitle:            "Don't have an invitation code?",
    noCodeDesc:             'Skip for now and verify later from your dashboard settings.',
    exampleFormat:          'Example format:',
    // Success modal
    codeVerified:           'Code',
    codeVerifiedHighlight:  'Verified!',
    successDesc:            'Your invitation code has been verified successfully. Welcome to CoBuild!',
    redirectingDash:        'Redirecting you to your Investor Dashboard',
    redirectingAuto:        'Redirecting automatically in 5 seconds',
    goToDashboard:          'Go to Dashboard 🚀',
    // Errors
    enterCode:              'Please enter your invitation code',
    codeLength:             'Invitation code must be exactly 8 characters',
    tokenNotFound:          'Authentication token not found. Please login again.',
    sessionExpired:         'Session expired. Please login again.',
    invalidFormat:          'Invalid code format. Code must be 8 characters (letters and numbers only).',
    codeUsed:               'This invitation code has already been used.',
    codeExpired:            'This invitation code has expired. Please contact support.',
    codeNotFound:           'This invitation code does not exist. Please check and try again.',
    accessDenied:           'Access denied. Please contact support.',
    noResponse:             'No response from server. Please check your internet connection.',
    unexpected:             'An unexpected error occurred. Please try again.',
    verifyFailed:           'Failed to verify invitation code. Please try again.',
    pleaseVerifyFirst:      'Please complete email verification first',
    // Skip
    skipConfirm:            'You can verify your invitation code later from your profile settings. Continue to dashboard?',
  },
  ar: {
    havingTrouble:          'هل تواجه مشكلة؟',
    getHelp:                'الحصول على المساعدة',
    checkingAuth:           'جارٍ التحقق من المصادقة...',
    pageTitle:              'التحقق من رمز الدعوة',
    pageDesc:               'أدخل رمز الدعوة المكوّن من 8 أحرف للوصول إلى الميزات الحصرية',
    inputLabel:             'رمز الدعوة',
    inputPlaceholder:       'مثال: 9VAQRHZH',
    inputHint:              'أدخل الرمز المكوّن من 8 أحرف (أحرف وأرقام فقط)',
    verifyButton:           'تحقق وتابع',
    verifying:              'جارٍ التحقق...',
    noCodeTitle:            'ليس لديك رمز دعوة؟',
    noCodeDesc:             'تخطَّ الآن وتحقق لاحقاً من إعدادات لوحة التحكم.',
    exampleFormat:          'مثال على الصيغة:',
    // Success modal
    codeVerified:           'تم التحقق',
    codeVerifiedHighlight:  'بنجاح!',
    successDesc:            'تم التحقق من رمز دعوتك بنجاح. مرحباً بك في CoBuild!',
    redirectingDash:        'جارٍ تحويلك إلى لوحة تحكم المستثمر',
    redirectingAuto:        'سيتم التحويل تلقائياً خلال 5 ثوانٍ',
    goToDashboard:          'الذهاب إلى لوحة التحكم 🚀',
    // Errors
    enterCode:              'يرجى إدخال رمز الدعوة',
    codeLength:             'يجب أن يتكوّن رمز الدعوة من 8 أحرف بالضبط',
    tokenNotFound:          'رمز المصادقة غير موجود. يرجى تسجيل الدخول مجدداً.',
    sessionExpired:         'انتهت الجلسة. يرجى تسجيل الدخول مجدداً.',
    invalidFormat:          'صيغة الرمز غير صحيحة. يجب أن يتكوّن من 8 أحرف وأرقام فقط.',
    codeUsed:               'تم استخدام رمز الدعوة هذا من قبل.',
    codeExpired:            'انتهت صلاحية رمز الدعوة. يرجى التواصل مع الدعم.',
    codeNotFound:           'رمز الدعوة غير موجود. يرجى المراجعة والمحاولة مجدداً.',
    accessDenied:           'تم رفض الوصول. يرجى التواصل مع الدعم.',
    noResponse:             'لا يوجد رد من الخادم. يرجى التحقق من اتصالك بالإنترنت.',
    unexpected:             'حدث خطأ غير متوقع. يرجى المحاولة مجدداً.',
    verifyFailed:           'فشل التحقق من رمز الدعوة. يرجى المحاولة مجدداً.',
    pleaseVerifyFirst:      'يرجى إكمال التحقق من البريد الإلكتروني أولاً',
    // Skip
    skipConfirm:            'يمكنك التحقق من رمز الدعوة لاحقاً من إعدادات ملفك الشخصي. المتابعة إلى لوحة التحكم؟',
  },
};

// ─── Success Modal ────────────────────────────────────────
function SuccessModal({
  isOpen,
  onClose,
  tx,
  isAr,
}: {
  isOpen: boolean;
  onClose: () => void;
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

          {/* Check icon */}
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
            {tx.codeVerified}{' '}
            <span
              style={{
                background: 'linear-gradient(135deg, #ef6b23, #f59e0b)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              {tx.codeVerifiedHighlight}
            </span>
          </h2>

          <p className="text-gray-400 text-sm mb-6 leading-relaxed z-10 relative max-w-xs">
            {tx.successDesc}
          </p>

          {/* Info card */}
          <div className="flex items-center gap-3 bg-[#ef6b23]/10 border border-[#ef6b23]/20 rounded-2xl px-5 py-3 mb-6 w-full z-10 relative">
            <div className="w-9 h-9 rounded-full bg-[#ef6b23]/20 flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-[#ef6b23]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            {/* ✅ Text aligns to start in both LTR/RTL */}
            <p className={`text-[#ef6b23] text-sm font-medium ${isAr ? 'text-right' : 'text-left'}`}>
              {tx.redirectingDash}
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
            {tx.goToDashboard}
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

// ─── Main Page ────────────────────────────────────────────
export default function VerifyInvitationCodePage() {
  const router = useRouter();
  const locale = useLocale();
  const isAr   = locale === 'ar';
  const dir    = isAr ? 'rtl' : 'ltr';
  const tx     = isAr ? t.ar : t.en;

  const [invitationCode,   setInvitationCode]   = useState('');
  const [loading,          setLoading]          = useState(false);
  const [error,            setError]            = useState('');
  const [tokenStatus,      setTokenStatus]      = useState<'checking' | 'valid' | 'invalid'>('checking');
  const [showSuccessModal, setShowSuccessModal] = useState(false);

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
      alert(tx.pleaseVerifyFirst);
      router.push('/LoginPage');
    } else {
      console.log('✅ Access token found');
      setTokenStatus('valid');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  const handleModalClose = () => {
    setShowSuccessModal(false);
    router.push('/Investordashboard');
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!invitationCode.trim()) { setError(tx.enterCode);  return; }
    if (invitationCode.length !== 8) { setError(tx.codeLength); return; }

    setLoading(true);
    setError('');

    try {
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) {
        setError(tx.tokenNotFound);
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

      if (response.data.success) {
        setShowSuccessModal(true);
      } else {
        setError(response.data.message || tx.verifyFailed);
      }
    } catch (err: any) {
      console.error('Verification error:', err);

      if (err.response) {
        const msg    = err.response?.data?.message?.toLowerCase() || '';
        const status = err.response.status;

        if (status === 401) {
          setError(tx.sessionExpired);
          setTimeout(() => {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            router.push('/LoginPage');
          }, 2000);
        } else if (status === 400) {
          if (msg.includes('format'))           setError(tx.invalidFormat);
          else if (msg.includes('used'))        setError(tx.codeUsed);
          else if (msg.includes('expired'))     setError(tx.codeExpired);
          else if (msg.includes('not found') || msg.includes('invalid')) setError(tx.codeNotFound);
          else if (msg.includes('already verified')) setShowSuccessModal(true);
          else setError(err.response.data?.message || tx.verifyFailed);
        } else if (status === 404) setError(tx.codeNotFound);
        else if (status === 403)   setError(tx.accessDenied);
        else setError(err.response.data?.message || tx.verifyFailed);
      } else if (err.request) {
        setError(tx.noResponse);
      } else {
        setError(tx.unexpected);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    const confirmSkip = confirm(tx.skipConfirm);
    if (confirmSkip) router.push('/Investordashboard');
  };

  // ── Loading state ─────────────────────────────────────────
  if (tokenStatus === 'checking') {
    return (
      <div dir={dir} className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#ef6b23] mx-auto mb-4" />
          <p className="text-gray-600">{tx.checkingAuth}</p>
        </div>
      </div>
    );
  }

  return (
    <div dir={dir} className="min-h-screen bg-white">

      {/* ── Success Modal ──────────────────────────────────── */}
      <SuccessModal
        isOpen={showSuccessModal}
        onClose={handleModalClose}
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
            {tx.pageTitle}
          </h2>

          {/* Description */}
          <p className="text-sm sm:text-base text-gray-600 text-center mb-8 sm:mb-10 px-2">
            {tx.pageDesc}
          </p>

          <form onSubmit={handleVerify}>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-900 mb-2">
                {tx.inputLabel}<span className="text-red-500">*</span>
              </label>

              {/* ✅ Invitation code input always LTR — alphanumeric codes are universal */}
              <input
                type="text"
                dir="ltr"
                placeholder={tx.inputPlaceholder}
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
                {tx.inputHint}
              </p>

              {/* Character progress bar */}
              <div className="flex justify-center mt-2 gap-1.5">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div
                    key={i}
                    className={`w-7 h-1.5 rounded-full transition-all duration-200 ${
                      i < invitationCode.length ? 'bg-[#ef6b23]' : 'bg-gray-200'
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
                  {tx.verifying}
                </span>
              ) : tx.verifyButton}
            </button>
          </form>

          {/* Help Section */}
          <div className="mt-4 space-y-3">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className={`text-xs sm:text-sm text-blue-800 ${isAr ? 'text-right' : ''}`}>
                <strong>{tx.noCodeTitle}</strong>
                <br />
                {tx.noCodeDesc}
              </p>
            </div>

            {/* Example format — always LTR for the code sample */}
            <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
              <p className="text-xs text-gray-600 text-center">
                <span className="font-semibold">{tx.exampleFormat}</span>
                <span
                  dir="ltr"
                  className={`${isAr ? 'mr-2' : 'ml-2'} font-mono bg-white px-2 py-1 rounded border border-gray-300 inline-block`}
                >
                  9VAQRHZH
                </span>
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
