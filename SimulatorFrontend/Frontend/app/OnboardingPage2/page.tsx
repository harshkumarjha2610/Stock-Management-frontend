'use client';
import React, { useState, useEffect } from 'react';
import { Upload, Eye, EyeOff } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import axios from 'axios';


// ─── Success Modal ────────────────────────────────────────
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
        {/* ── Dark gradient card ────────────────────────────── */}
        <div className="bg-gradient-to-b from-[#1f1f1f] via-[#1a1a1a] to-[#141414] border border-white/10 rounded-3xl p-8 flex flex-col items-center text-center relative overflow-hidden">

          {/* Background ambient glows */}
          <div className="absolute top-0 left-0 w-full h-40 bg-gradient-to-b from-[#ef6b23]/15 to-transparent pointer-events-none" />
          <div className="absolute bottom-0 right-0 w-48 h-48 bg-[#ef6b23]/5 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white/5 via-transparent to-transparent pointer-events-none" />

          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors z-10"
          >
            <svg className="w-4 h-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* ── Check icon with orange ring ───────────────────── */}
          <div className="relative mb-6 z-10">
            {/* Outer pulse ring */}
            <span className="absolute inset-0 w-24 h-24 rounded-full bg-[#ef6b23]/20 animate-ping" />
            {/* Second ring */}
            <div className="absolute -inset-2 w-28 h-28 rounded-full border border-[#ef6b23]/20" />
            {/* Main circle */}
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#ef6b23] to-[#c5600d] flex items-center justify-center shadow-xl shadow-[#ef6b23]/30 relative z-10">
              <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>

          {/* ── Title ─────────────────────────────────────────── */}
          <h2 className="text-2xl sm:text-3xl font-extrabold mb-2 text-white z-10 relative">
            Registration{' '}
            <span
              style={{
                background: 'linear-gradient(135deg, #ef6b23, #f59e0b)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Successful!
            </span>
          </h2>

          <p className="text-gray-400 text-sm mb-6 leading-relaxed z-10 relative max-w-xs">
            Your account has been created. Please verify your email to get started.
          </p>

          {/* ── Email hint card ───────────────────────────────── */}
          <div className="flex items-center gap-3 bg-[#ef6b23]/10 border border-[#ef6b23]/20 rounded-2xl px-5 py-3 mb-6 w-full z-10 relative">
            <div className="w-9 h-9 rounded-full bg-[#ef6b23]/20 flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-[#ef6b23]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <p className="text-[#ef6b23] text-sm font-medium text-left">
              A verification link has been sent to your inbox
            </p>
          </div>

          {/* ── Bouncing dots ─────────────────────────────────── */}
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

          {/* ── Progress bar ──────────────────────────────────── */}
          <div className="w-full bg-white/5 border border-white/10 rounded-full h-1.5 mb-6 overflow-hidden z-10 relative">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#ef6b23] to-[#f59e0b]"
              style={{ animation: 'shrink 5s linear forwards' }}
            />
          </div>

          {/* ── CTA Button ────────────────────────────────────── */}
          <button
            onClick={onClose}
            className="w-full py-3.5 rounded-2xl font-bold text-white text-base transition-all hover:shadow-xl hover:shadow-[#ef6b23]/20 hover:-translate-y-0.5 transform z-10 relative"
            style={{ background: 'linear-gradient(135deg, #ef6b23, #c5600d)' }}
          >
            Got it, thanks! 🎉
          </button>

          <p className="text-xs text-gray-600 mt-4 z-10 relative">
            Closes automatically in 5 seconds
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
export default function RetailInvestorPage() {
  const router = useRouter();
  const [page1Data, setPage1Data] = useState<any>(null);
  const [showTIN, setShowTIN] = useState(false);
  const [isPEP, setIsPEP] = useState(false);
  const [formData, setFormData] = useState({
    walletNumber: '',
    tinNumber: '',
    sourceOfFund: '',
    nationalSecurityNumber: '',
    passport: null as File | null,
    selfie: null as File | null,
  });
  const [errors, setErrors] = useState<any>({});
  const [loading, setLoading] = useState(false);

  // ✅ Success modal state
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState('');


  useEffect(() => {
    const data = sessionStorage.getItem('onboardingPage1');
    if (!data) {
      router.push('/OnboardingPage1');
      return;
    }
    setPage1Data(JSON.parse(data));
  }, [router]);


  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: 'passport' | 'selfie'
  ) => {
    const file = e.target.files?.[0];
    if (file && file.size <= 2 * 1024 * 1024) {
      setFormData({ ...formData, [field]: file });
      setErrors({ ...errors, [field]: '' });
    } else {
      alert('Image cannot be greater than 2 MB');
    }
  };


  const validateForm = () => {
    const newErrors: any = {};
    if (!formData.walletNumber.trim())          newErrors.walletNumber          = 'Wallet number is required';
    if (!formData.tinNumber.trim())              newErrors.tinNumber              = 'TIN number is required';
    if (!formData.sourceOfFund)                  newErrors.sourceOfFund           = 'Source of fund is required';
    if (!formData.nationalSecurityNumber.trim()) newErrors.nationalSecurityNumber = 'National Security Number is required';
    if (!formData.passport)                      newErrors.passport               = 'Passport upload is required';
    if (!formData.selfie)                        newErrors.selfie                 = 'Selfie upload is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };


  const handleNext = async () => {
    if (!validateForm() || !page1Data) return;

    setLoading(true);

    try {
      const formDataToSend = new FormData();

      // Page 1 fields
      formDataToSend.append('firstName',   page1Data.firstName);
      formDataToSend.append('lastName',    page1Data.lastName);
      formDataToSend.append('email',       page1Data.email);
      formDataToSend.append('phone',       page1Data.phone);
      formDataToSend.append('residency',   page1Data.residency);
      formDataToSend.append('nationality', page1Data.nationality);
      formDataToSend.append('dob',         page1Data.dob);
      formDataToSend.append('password',    page1Data.password);

      // Page 2 fields
      formDataToSend.append('walletNumber',               formData.walletNumber);
      formDataToSend.append('tinNumber',                  formData.tinNumber);
      formDataToSend.append('sourceOfFund',               formData.sourceOfFund);
      formDataToSend.append('isPoliticallyExposedPerson', isPEP.toString());

      if (formData.passport) formDataToSend.append('passport', formData.passport);
      if (formData.selfie)   formDataToSend.append('avatar',   formData.selfie);

      const response = await axios.post(
        'https://cobuild-simulator-backend.onrender.com/api/v1/user/auth/register',
        formDataToSend,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );

      if (response.data.success) {
        sessionStorage.removeItem('onboardingPage1');

        // ✅ Store email for redirect after modal closes, then show modal
        setRegisteredEmail(page1Data.email);
        setShowSuccessModal(true);
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || 'Registration failed. Please try again.';
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };


  // ✅ Called when user closes the modal (or it auto-closes after 5s)
  const handleModalClose = () => {
    setShowSuccessModal(false);
    router.push(`/VerifyOtp?email=${encodeURIComponent(registeredEmail)}`);
  };


  const handleBack = () => router.back();


  if (!page1Data) return null;


  return (
    <div className="min-h-screen bg-white">

      {/* ✅ Success Modal */}
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

      {/* Progress Indicator */}
      <div className="px-4 sm:px-6 py-4 sm:py-6 flex items-center justify-center gap-2 sm:gap-3">
        {[1, 2].map((step) => (
          <div
            key={step}
            className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[#ef6b23] flex items-center justify-center shadow-sm"
          >
            <svg width="16" height="16" className="sm:w-5 sm:h-5" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
        ))}
      </div>

      {/* Main Content */}
      <div className="px-4 sm:px-6 py-6 sm:py-8 flex items-start justify-center">
        <div className="w-full max-w-[340px] sm:max-w-2xl md:max-w-3xl">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-6 sm:mb-8">
            Retail Investor
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6 md:gap-x-8 md:gap-y-6">
            {/* Left Column */}
            <div className="space-y-4 sm:space-y-5 md:space-y-6">

              {/* Wallet Number */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Wallet Number<span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Enter Wallet Here"
                  value={formData.walletNumber}
                  onChange={(e) => setFormData({ ...formData, walletNumber: e.target.value })}
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ef6b23] focus:border-transparent text-gray-900 placeholder:text-gray-400 bg-white text-sm sm:text-base"
                />
                {errors.walletNumber && <p className="text-red-500 text-xs mt-1">{errors.walletNumber}</p>}
              </div>

              {/* TIN Number */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  TIN Number<span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showTIN ? 'text' : 'password'}
                    placeholder="Enter TIN Number Here"
                    value={formData.tinNumber}
                    onChange={(e) => setFormData({ ...formData, tinNumber: e.target.value })}
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 pr-10 sm:pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ef6b23] focus:border-transparent text-gray-900 placeholder:text-gray-400 bg-white text-sm sm:text-base"
                  />
                  <button
                    type="button"
                    onClick={() => setShowTIN(!showTIN)}
                    className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showTIN ? <EyeOff size={18} className="sm:w-5 sm:h-5" /> : <Eye size={18} className="sm:w-5 sm:h-5" />}
                  </button>
                </div>
                {errors.tinNumber && <p className="text-red-500 text-xs mt-1">{errors.tinNumber}</p>}
              </div>

              {/* Source of Fund */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Source of Fund<span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.sourceOfFund}
                  onChange={(e) => setFormData({ ...formData, sourceOfFund: e.target.value })}
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ef6b23] focus:border-transparent text-gray-900 bg-white appearance-none cursor-pointer text-sm sm:text-base"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='12' height='8' viewBox='0 0 12 8' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1.5L6 6.5L11 1.5' stroke='%23666' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'right 1rem center',
                    backgroundSize: '12px',
                  }}
                >
                  <option value="">Select</option>
                  <option value="salary">Salary</option>
                  <option value="business">Business Income</option>
                  <option value="savings">Savings</option>
                  <option value="investment">Investment Returns</option>
                </select>
                {errors.sourceOfFund && <p className="text-red-500 text-xs mt-1">{errors.sourceOfFund}</p>}
              </div>

              {/* National Security Number */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  National Security Number<span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Enter Number Here"
                  value={formData.nationalSecurityNumber}
                  onChange={(e) => setFormData({ ...formData, nationalSecurityNumber: e.target.value })}
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ef6b23] focus:border-transparent text-gray-900 placeholder:text-gray-400 bg-white text-sm sm:text-base"
                />
                {errors.nationalSecurityNumber && <p className="text-red-500 text-xs mt-1">{errors.nationalSecurityNumber}</p>}
              </div>

              {/* Wallet Setup Link */}
              <div>
                <a href="#" className="text-[#3b82f6] text-sm font-medium hover:underline inline-block">
                  Add a Wallet Setup
                </a>
              </div>

              {/* PEP Checkbox */}
              <div className="flex items-start gap-2 sm:gap-3 pt-2">
                <input
                  type="checkbox"
                  id="pep"
                  checked={isPEP}
                  onChange={(e) => setIsPEP(e.target.checked)}
                  className="mt-0.5 sm:mt-1 w-4 h-4 rounded border-gray-300 text-[#ef6b23] focus:ring-[#ef6b23] cursor-pointer flex-shrink-0"
                />
                <label htmlFor="pep" className="text-xs sm:text-sm text-gray-700 leading-relaxed cursor-pointer">
                  Are you a Politically Exposed Person (PEP), or are you closely related to or associated with a PEP?
                </label>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-4 sm:space-y-5 md:space-y-6">

              {/* Upload Passport */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Upload Passport<span className="text-red-500">*</span>
                </label>
                <label
                  htmlFor="passport-upload"
                  className="flex flex-col items-center justify-center w-full h-32 sm:h-36 md:h-40 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-[#ef6b23] transition-colors bg-white"
                >
                  <div className="flex flex-col items-center justify-center gap-1.5 sm:gap-2">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[#ef6b23] flex items-center justify-center">
                      <Upload size={20} className="sm:w-6 sm:h-6 text-white" />
                    </div>
                    <span className="text-xs sm:text-sm text-gray-600 font-medium px-2 text-center">
                      {formData.passport ? formData.passport.name : 'Upload'}
                    </span>
                  </div>
                  <input id="passport-upload" type="file" accept="image/*" onChange={(e) => handleFileChange(e, 'passport')} className="hidden" />
                </label>
                <p className="text-xs text-gray-500 mt-2">Image cannot be greater than 2 MB</p>
                {errors.passport && <p className="text-red-500 text-xs mt-1">{errors.passport}</p>}
              </div>

              {/* Upload Selfie */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Upload Your Selfie<span className="text-red-500">*</span>
                </label>
                <label
                  htmlFor="selfie-upload"
                  className="flex flex-col items-center justify-center w-full h-32 sm:h-36 md:h-40 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-[#ef6b23] transition-colors bg-white"
                >
                  <div className="flex flex-col items-center justify-center gap-1.5 sm:gap-2">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[#ef6b23] flex items-center justify-center">
                      <Upload size={20} className="sm:w-6 sm:h-6 text-white" />
                    </div>
                    <span className="text-xs sm:text-sm text-gray-600 font-medium px-2 text-center">
                      {formData.selfie ? formData.selfie.name : 'Upload'}
                    </span>
                  </div>
                  <input id="selfie-upload" type="file" accept="image/*" onChange={(e) => handleFileChange(e, 'selfie')} className="hidden" />
                </label>
                <p className="text-xs text-gray-500 mt-2">Image cannot be greater than 2 MB</p>
                {errors.selfie && <p className="text-red-500 text-xs mt-1">{errors.selfie}</p>}
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4 mt-6 sm:mt-8 md:mt-10">
            <button
              onClick={handleBack}
              disabled={loading}
              className="px-4 sm:px-6 py-2.5 sm:py-3 border-2 border-[#ef6b23] text-[#ef6b23] rounded-lg font-semibold hover:bg-[#ef6b23] hover:text-white transition-colors text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Back
            </button>
            <button
              type="button"
              onClick={handleNext}
              disabled={loading}
              className="px-4 sm:px-6 py-2.5 sm:py-3 bg-[#ef6b23] text-white rounded-lg font-semibold hover:bg-[#d85a1a] transition-colors shadow-sm text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Submitting...
                </span>
              ) : 'Next'}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
