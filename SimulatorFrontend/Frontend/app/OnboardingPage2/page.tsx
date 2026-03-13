'use client';
import React, { useState, useEffect } from 'react';
import { Upload, Eye, EyeOff } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import axios from 'axios';

// ─── Toast / Inline Error Alert ──────────────────────────
function InlineAlert({
  type, message, onClose,
}: { type: 'error' | 'warning'; message: string; onClose: () => void }) {
  useEffect(() => {
    const t = setTimeout(onClose, 5000);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <div className={`fixed top-4 left-1/2 -translate-x-1/2 z-[200] flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl border backdrop-blur-sm transition-all animate-slideDown max-w-sm w-full ${
      type === 'error' ? 'bg-white border-red-200 shadow-red-100' : 'bg-white border-orange-200 shadow-orange-100'
    }`}>
      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${type === 'error' ? 'bg-red-100' : 'bg-[#ef6b23]/10'}`}>
        <svg className={`w-4 h-4 ${type === 'error' ? 'text-red-500' : 'text-[#ef6b23]'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
        </svg>
      </div>
      <p className={`text-sm font-medium flex-1 ${type === 'error' ? 'text-red-700' : 'text-gray-800'}`}>{message}</p>
      <button onClick={onClose} className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
      <style jsx>{`
        @keyframes slideDown {
          from { opacity: 0; transform: translateX(-50%) translateY(-12px); }
          to   { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
        .animate-slideDown { animation: slideDown 0.3s ease-out; }
      `}</style>
    </div>
  );
}

// ─── Success Modal ────────────────────────────────────────
function SuccessModal({ isOpen, onClose, email }: { isOpen: boolean; onClose: () => void; email: string }) {
  useEffect(() => {
    if (!isOpen) return;
    const timer = setTimeout(onClose, 6000);
    return () => clearTimeout(timer);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(10px)' }}
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md rounded-3xl overflow-hidden shadow-2xl"
        style={{ animation: 'scaleIn 0.35s cubic-bezier(0.34,1.56,0.64,1)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-white rounded-3xl overflow-hidden">
          {/* Orange top banner */}
          <div className="bg-gradient-to-r from-[#ef6b23] to-[#f59e0b] px-6 pt-8 pb-10 flex flex-col items-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent pointer-events-none" />
            <div className="absolute -bottom-6 -right-6 w-32 h-32 rounded-full bg-white/10 pointer-events-none" />
            <div className="absolute -top-4 -left-4 w-24 h-24 rounded-full bg-white/10 pointer-events-none" />
            <button onClick={onClose} className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 transition-colors z-10">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <div className="relative mb-4 z-10">
              <span className="absolute inset-0 w-20 h-20 rounded-full bg-white/20 animate-ping" />
              <div className="w-20 h-20 rounded-full bg-white/20 border-2 border-white/40 flex items-center justify-center relative z-10">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
            <h2 className="text-white text-2xl font-extrabold text-center z-10 relative leading-tight">Response Saved Successfully!</h2>
            <p className="text-white/80 text-sm text-center mt-1.5 z-10 relative">Complete ID verification to finish registration</p>
          </div>

          {/* White body */}
          <div className="px-6 py-5 bg-white">
            <div className="flex items-center justify-center mb-4">
              <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-full px-4 py-1.5">
                <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                <span className="text-amber-700 text-xs font-semibold">Registration Pending — ID Verification Required</span>
              </div>
            </div>
            <p className="text-gray-500 text-xs font-semibold uppercase tracking-widest mb-3 text-center">What happens next</p>
            <div className="space-y-3 mb-5">
              {[
                { icon: <svg className="w-4 h-4 text-[#ef6b23]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>, title: 'Verify your email', desc: `OTP sent to ${email}`, status: 'next' },
                { icon: <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0" /></svg>, title: 'ID verification review', desc: 'Our team will verify your submitted documents', status: 'pending' },
                { icon: <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>, title: 'Registration complete', desc: "You'll gain full access to your investor dashboard", status: 'pending' },
              ].map((item, i) => (
                <div key={i} className={`flex items-start gap-3 p-3 rounded-xl border ${item.status === 'next' ? 'bg-[#ef6b23]/5 border-[#ef6b23]/20' : 'bg-gray-50 border-gray-100'}`}>
                  <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${item.status === 'next' ? 'bg-[#ef6b23]/10' : 'bg-gray-100'}`}>{item.icon}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className={`text-sm font-semibold ${item.status === 'next' ? 'text-gray-900' : 'text-gray-400'}`}>{item.title}</p>
                      {item.status === 'next' && <span className="text-[10px] bg-[#ef6b23] text-white px-2 py-0.5 rounded-full font-bold">UP NEXT</span>}
                    </div>
                    <p className={`text-xs mt-0.5 truncate ${item.status === 'next' ? 'text-[#ef6b23]/80' : 'text-gray-400'}`}>{item.desc}</p>
                  </div>
                  <span className={`flex-shrink-0 text-xs font-bold ${item.status === 'next' ? 'text-[#ef6b23]' : 'text-gray-300'}`}>{i + 1}</span>
                </div>
              ))}
            </div>
            <div className="w-full bg-gray-100 rounded-full h-1.5 mb-5 overflow-hidden">
              <div className="h-full rounded-full bg-gradient-to-r from-[#ef6b23] to-[#f59e0b]" style={{ animation: 'shrink 6s linear forwards' }} />
            </div>
            <button onClick={onClose} className="w-full py-3.5 rounded-2xl font-bold text-white text-sm transition-all hover:shadow-lg hover:shadow-[#ef6b23]/25 hover:-translate-y-0.5 transform flex items-center justify-center gap-2" style={{ background: 'linear-gradient(135deg, #ef6b23, #c5600d)' }}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Verify Email Now
            </button>
            <p className="text-xs text-gray-400 text-center mt-3">Redirecting to OTP verification in 6 seconds...</p>
          </div>
        </div>
      </div>
      <style jsx>{`
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.88) translateY(16px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes shrink {
          from { width: 100%; }
          to   { width: 0%; }
        }
      `}</style>
    </div>
  );
}

// ─── Reusable label ───────────────────────────────────────
function Label({ children, required, hint }: { children: React.ReactNode; required?: boolean; hint?: string }) {
  return (
    <label className="block text-sm font-medium text-gray-900 mb-2">
      {children}
      {required && <span className="text-red-500">*</span>}
      {hint && <span className="ml-2 text-xs text-gray-400 font-normal">{hint}</span>}
    </label>
  );
}

// ─── Chevron SVG for selects ──────────────────────────────
const chevronBg = {
  backgroundImage: `url("data:image/svg+xml,%3Csvg width='12' height='8' viewBox='0 0 12 8' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1.5L6 6.5L11 1.5' stroke='%23666' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
  backgroundRepeat: 'no-repeat' as const,
  backgroundPosition: 'right 1rem center',
  backgroundSize: '12px',
};

// ─── Main Page ────────────────────────────────────────────
export default function RetailInvestorPage() {
  const router = useRouter();
  const [page1Data, setPage1Data] = useState<any>(null);
  const [showTIN, setShowTIN] = useState(false);
  const [isPEP, setIsPEP] = useState(false);

  const [formData, setFormData] = useState({
    walletNumber:    '',
    tinNumber:       '',
    sourceOfFund:    '',
    nationalIdNumber:'',
    passportNumber:  '',          // ← NEW
    passport:        null as File | null,
    selfie:          null as File | null,
  });

  const [errors,             setErrors]             = useState<Record<string, string>>({});
  const [loading,            setLoading]            = useState(false);
  const [showSuccessModal,   setShowSuccessModal]   = useState(false);
  const [registeredEmail,    setRegisteredEmail]    = useState('');
  const [inlineAlert, setInlineAlert] = useState<{ show: boolean; type: 'error' | 'warning'; message: string }>
    ({ show: false, type: 'error', message: '' });

  const showAlert = (message: string, type: 'error' | 'warning' = 'error') =>
    setInlineAlert({ show: true, type, message });

  const set = (field: string, value: string) =>
    setFormData(prev => ({ ...prev, [field]: value }));

  const clearError = (field: string) =>
    setErrors(prev => ({ ...prev, [field]: '' }));

  useEffect(() => {
    const data = sessionStorage.getItem('onboardingPage1');
    if (!data) { router.push('/OnboardingPage1'); return; }
    setPage1Data(JSON.parse(data));
  }, [router]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: 'passport' | 'selfie') => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      showAlert('Image size cannot exceed 2 MB. Please choose a smaller file.');
      return;
    }
    setFormData(prev => ({ ...prev, [field]: file }));
    clearError(field);
  };

  const validateForm = () => {
    const e: Record<string, string> = {};
    if (!formData.walletNumber.trim())     e.walletNumber     = 'Wallet number is required';
    if (!formData.tinNumber.trim())        e.tinNumber        = 'TIN number is required';
    if (!formData.sourceOfFund)            e.sourceOfFund     = 'Source of fund is required';
    if (!formData.nationalIdNumber.trim()) e.nationalIdNumber = 'National ID Number is required';
    if (!formData.passportNumber.trim())   e.passportNumber   = 'Passport number is required';
    if (!formData.passport)                e.passport         = 'Passport upload is required';
    if (!formData.selfie)                  e.selfie           = 'Selfie upload is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleNext = async () => {
    if (!validateForm() || !page1Data) return;
    setLoading(true);
    try {
      const fd = new FormData();

      // ── Page 1 fields ──────────────────────────────────
      fd.append('firstName',   page1Data.firstName);
      fd.append('lastName',    page1Data.lastName);
      fd.append('email',       page1Data.email);
      fd.append('phone',       page1Data.phone);
      fd.append('countryCode', page1Data.countryCode ?? '');   // ← from page 1
      fd.append('residency',   page1Data.residency);
      fd.append('nationality', page1Data.nationality);
      fd.append('dob',         page1Data.dob);
      fd.append('password',    page1Data.password);

      // ── Page 2 fields ──────────────────────────────────
      fd.append('walletNumber',               formData.walletNumber);
      fd.append('tinNumber',                  formData.tinNumber);
      fd.append('sourceOfFund',               formData.sourceOfFund);
      fd.append('nationalIdNumber',           formData.nationalIdNumber);
      fd.append('passportNumber',             formData.passportNumber);   // ← NEW
      fd.append('isPoliticallyExposedPerson', isPEP.toString());

      if (formData.passport) fd.append('passport', formData.passport);
      if (formData.selfie)   fd.append('avatar',   formData.selfie);

      const response = await axios.post(
        'https://cobuild-simulator-backend.onrender.com/api/v1/user/auth/register',
        fd,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );

      if (response.data.success) {
        sessionStorage.removeItem('onboardingPage1');
        setRegisteredEmail(page1Data.email);
        setShowSuccessModal(true);
      }
    } catch (error: any) {
      showAlert(error.response?.data?.message || 'Submission failed. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleModalClose = () => {
    setShowSuccessModal(false);
    router.push(`/VerifyOtp?email=${encodeURIComponent(registeredEmail)}`);
  };

  if (!page1Data) return null;

  const inputBase = (hasError: boolean) =>
    `w-full px-3 sm:px-4 py-2.5 sm:py-3 border ${hasError ? 'border-red-400' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ef6b23] focus:border-transparent text-gray-900 placeholder:text-gray-400 bg-white text-sm sm:text-base`;

  return (
    <div className="min-h-screen bg-white">

      {/* Themed inline toast */}
      {inlineAlert.show && (
        <InlineAlert
          type={inlineAlert.type}
          message={inlineAlert.message}
          onClose={() => setInlineAlert(prev => ({ ...prev, show: false }))}
        />
      )}

      <SuccessModal isOpen={showSuccessModal} onClose={handleModalClose} email={registeredEmail} />

      {/* Header */}
      <header className="px-4 sm:px-6 py-4 flex items-center justify-between">
        <Image src="/Co-build-logo-02-1.png" alt="CoBuild Logo" width={150} height={40} className="h-8 sm:h-10 w-auto" priority />
        <div className="text-xs sm:text-sm text-gray-600">
          Having trouble?{' '}
          <span className="text-[#ef6b23] cursor-pointer hover:underline">Get Help</span>
        </div>
      </header>

      {/* Progress */}
      <div className="px-4 sm:px-6 py-4 sm:py-6 flex items-center justify-center gap-2 sm:gap-3">
        {[1, 2].map(step => (
          <div key={step} className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[#ef6b23] flex items-center justify-center shadow-sm">
            <svg width="16" height="16" className="sm:w-5 sm:h-5" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
        ))}
      </div>

      {/* Form */}
      <div className="px-4 sm:px-6 py-6 sm:py-8 flex items-start justify-center">
        <div className="w-full max-w-[340px] sm:max-w-2xl md:max-w-3xl">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-6 sm:mb-8">
            Retail Investor
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6 md:gap-x-8 md:gap-y-6">

            {/* ── Left Column ── */}
            <div className="space-y-4 sm:space-y-5 md:space-y-6">

              {/* Wallet Number */}
              <div>
                <Label required>Wallet Number</Label>
                <input type="text" placeholder="Enter Wallet Here" value={formData.walletNumber}
                  onChange={e => { set('walletNumber', e.target.value); clearError('walletNumber'); }}
                  className={inputBase(!!errors.walletNumber)} />
                {errors.walletNumber && <p className="text-red-500 text-xs mt-1">{errors.walletNumber}</p>}
              </div>

              {/* TIN Number */}
              <div>
                <Label required>TIN Number</Label>
                <div className="relative">
                  <input
                    type={showTIN ? 'text' : 'password'}
                    placeholder="Enter TIN Number Here"
                    value={formData.tinNumber}
                    onChange={e => { set('tinNumber', e.target.value); clearError('tinNumber'); }}
                    className={`${inputBase(!!errors.tinNumber)} pr-10 sm:pr-12`}
                  />
                  <button type="button" onClick={() => setShowTIN(!showTIN)}
                    className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700">
                    {showTIN ? <EyeOff size={18} className="sm:w-5 sm:h-5" /> : <Eye size={18} className="sm:w-5 sm:h-5" />}
                  </button>
                </div>
                {errors.tinNumber && <p className="text-red-500 text-xs mt-1">{errors.tinNumber}</p>}
              </div>

              {/* Source of Fund */}
              <div>
                <Label required>Source of Fund</Label>
                <select value={formData.sourceOfFund}
                  onChange={e => { set('sourceOfFund', e.target.value); clearError('sourceOfFund'); }}
                  className={`${inputBase(!!errors.sourceOfFund)} appearance-none cursor-pointer`}
                  style={chevronBg}>
                  <option value="">Select</option>
                  <option value="salary">Salary</option>
                  <option value="business">Business Income</option>
                  <option value="savings">Savings</option>
                  <option value="investment">Investment Returns</option>
                </select>
                {errors.sourceOfFund && <p className="text-red-500 text-xs mt-1">{errors.sourceOfFund}</p>}
              </div>

              {/* National ID Number */}
              <div>
                <Label required>National ID Number</Label>
                <input type="text" placeholder="Enter National ID Number" value={formData.nationalIdNumber}
                  onChange={e => { set('nationalIdNumber', e.target.value); clearError('nationalIdNumber'); }}
                  className={inputBase(!!errors.nationalIdNumber)} />
                {errors.nationalIdNumber && <p className="text-red-500 text-xs mt-1">{errors.nationalIdNumber}</p>}
              </div>

              {/* ── Passport Number (NEW) ── */}
              <div>
                <Label required>Passport Number</Label>
                <input
                  type="text"
                  placeholder="e.g., ABCD1234"
                  value={formData.passportNumber}
                  onChange={e => {
                    set('passportNumber', e.target.value.toUpperCase());
                    clearError('passportNumber');
                  }}
                  className={inputBase(!!errors.passportNumber)}
                />
                {errors.passportNumber && <p className="text-red-500 text-xs mt-1">{errors.passportNumber}</p>}
              </div>

              {/* ── Country Code (read-only, passed from page 1) ── */}
              <div>
                <Label>Country Code</Label>
                <div className={`${inputBase(false)} flex items-center gap-2 bg-gray-50 cursor-not-allowed`}>
                  <span className="text-gray-400 text-sm">Carried over from Step 1:</span>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#ef6b23]/10 text-[#ef6b23] text-xs font-bold border border-[#ef6b23]/20">
                    {page1Data?.countryCode ?? '+91'}
                  </span>
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  To change the country code, go back to Step 1.
                </p>
              </div>

              {/* Wallet Setup Link */}
              <div>
                <a href="#" className="text-[#3b82f6] text-sm font-medium hover:underline inline-block">
                  Add a Wallet Setup
                </a>
              </div>

              {/* PEP Checkbox */}
              <div className="flex items-start gap-2 sm:gap-3 pt-2">
                <input type="checkbox" id="pep" checked={isPEP} onChange={e => setIsPEP(e.target.checked)}
                  className="mt-0.5 sm:mt-1 w-4 h-4 rounded border-gray-300 text-[#ef6b23] focus:ring-[#ef6b23] cursor-pointer flex-shrink-0" />
                <label htmlFor="pep" className="text-xs sm:text-sm text-gray-700 leading-relaxed cursor-pointer">
                  Are you a Politically Exposed Person (PEP), or are you closely related to or associated with a PEP?
                </label>
              </div>
            </div>

            {/* ── Right Column ── */}
            <div className="space-y-4 sm:space-y-5 md:space-y-6">

              {/* Upload Passport */}
              <div>
                <Label required hint="(You can upload a dummy image for simulation)">Upload Passport</Label>
                <label htmlFor="passport-upload"
                  className={`flex flex-col items-center justify-center w-full min-h-[160px] border-2 border-dashed ${errors.passport ? 'border-red-400' : 'border-gray-300'} rounded-xl cursor-pointer hover:border-[#ef6b23] transition-colors bg-white`}>
                  <div className="flex flex-col items-center justify-center gap-2 p-4 w-full">
                    {formData.passport ? (
                      <>
                        <img src={URL.createObjectURL(formData.passport)} alt="Passport preview"
                          className="w-full max-h-28 object-contain rounded-lg" />
                        <span className="text-xs text-green-600 font-medium text-center mt-1">
                          ✓ {formData.passport.name.length > 20 ? formData.passport.name.slice(0, 20) + '...' : formData.passport.name}
                        </span>
                      </>
                    ) : (
                      <>
                        <div className="w-10 h-10 rounded-full bg-[#ef6b23] flex items-center justify-center">
                          <Upload size={18} className="text-white" />
                        </div>
                        <span className="text-xs text-gray-500 text-center">Click to upload<br />your passport</span>
                      </>
                    )}
                  </div>
                  <input id="passport-upload" type="file" accept="image/*"
                    onChange={e => handleFileChange(e, 'passport')} className="hidden" />
                </label>
                <p className="text-xs text-gray-500 mt-2">Image cannot be greater than 2 MB</p>
                {errors.passport && <p className="text-red-500 text-xs mt-1">{errors.passport}</p>}
              </div>

              {/* Upload Selfie */}
              <div>
                <Label required>Upload Your Selfie</Label>
                <label htmlFor="selfie-upload"
                  className={`flex flex-col items-center justify-center w-full h-32 sm:h-36 md:h-40 border-2 border-dashed ${errors.selfie ? 'border-red-400' : 'border-gray-300'} rounded-lg cursor-pointer hover:border-[#ef6b23] transition-colors bg-white`}>
                  <div className="flex flex-col items-center justify-center gap-1.5 sm:gap-2">
                    {formData.selfie ? (
                      <>
                        <img src={URL.createObjectURL(formData.selfie)} alt="Selfie preview"
                          className="w-20 h-20 object-cover rounded-full border-2 border-[#ef6b23]" />
                        <span className="text-xs text-green-600 font-medium mt-1">
                          ✓ {formData.selfie.name.length > 20 ? formData.selfie.name.slice(0, 20) + '...' : formData.selfie.name}
                        </span>
                      </>
                    ) : (
                      <>
                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[#ef6b23] flex items-center justify-center">
                          <Upload size={20} className="sm:w-6 sm:h-6 text-white" />
                        </div>
                        <span className="text-xs sm:text-sm text-gray-600 font-medium px-2 text-center">Upload</span>
                      </>
                    )}
                  </div>
                  <input id="selfie-upload" type="file" accept="image/*"
                    onChange={e => handleFileChange(e, 'selfie')} className="hidden" />
                </label>
                <p className="text-xs text-gray-500 mt-2">Image cannot be greater than 2 MB</p>
                {errors.selfie && <p className="text-red-500 text-xs mt-1">{errors.selfie}</p>}
              </div>

              {/* ── Registration summary card ── */}
              <div className="rounded-xl border border-gray-100 bg-gray-50 p-4 space-y-2">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">Carried from Step 1</p>
                {[
                  { label: 'Name',         value: `${page1Data?.firstName ?? ''} ${page1Data?.lastName ?? ''}` },
                  { label: 'Email',        value: page1Data?.email ?? '' },
                  { label: 'Phone',        value: `${page1Data?.countryCode ?? ''} ${page1Data?.phone ?? ''}` },
                  { label: 'Nationality',  value: page1Data?.nationality ?? '' },
                  { label: 'Residency',    value: page1Data?.residency ?? '' },
                ].map(row => (
                  <div key={row.label} className="flex items-center justify-between text-xs">
                    <span className="text-gray-400">{row.label}</span>
                    <span className="text-gray-700 font-medium truncate max-w-[160px] text-right">{row.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4 mt-6 sm:mt-8 md:mt-10">
            <button onClick={() => router.back()} disabled={loading}
              className="px-4 sm:px-6 py-2.5 sm:py-3 border-2 border-[#ef6b23] text-[#ef6b23] rounded-lg font-semibold hover:bg-[#ef6b23] hover:text-white transition-colors text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed">
              Back
            </button>
            <button type="button" onClick={handleNext} disabled={loading}
              className="px-4 sm:px-6 py-2.5 sm:py-3 bg-[#ef6b23] text-white rounded-lg font-semibold hover:bg-[#d85a1a] transition-colors shadow-sm text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed">
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Submitting...
                </span>
              ) : 'Submit'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
