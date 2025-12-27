'use client';
import React, { useState } from 'react';
import { Upload, Eye, EyeOff } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function RetailInvestorPage() {
  const router = useRouter();

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

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: 'passport' | 'selfie'
  ) => {
    const file = e.target.files?.[0];
    if (file && file.size <= 2 * 1024 * 1024) {
      setFormData({ ...formData, [field]: file });
    } else {
      alert('Image cannot be greater than 2 MB');
    }
  };

  const handleNext = () => {
    // TODO: you can add validation here before navigating
    router.push('/Investordashboard');
  };

  const handleBack = () => {
    router.back();
  };

  const goToStep = (step: number) => {
    if (step === 1) {
      router.push('/OnboardingPage1');
    }
    if (step === 2) {
      router.push('/OnboardingPage2');
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="px-4 sm:px-6 py-4 flex items-center justify-between">
        <div className="flex items-center">
          <Image
            src="/co-build-logo-02-1.png"
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

      {/* Progress Indicator - ONLY 2 STEPS */}
      <div className="px-4 sm:px-6 py-4 sm:py-6 flex items-center justify-center gap-2 sm:gap-3">
        {/* Step 1 – Completed */}
        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[#ef6b23] flex items-center justify-center shadow-sm">
          <svg
            width="16"
            height="16"
            className="sm:w-5 sm:h-5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="3"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>

        {/* Step 2 – Current (this page) - COMPLETED */}
        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[#ef6b23] flex items-center justify-center shadow-sm">
          <svg
            width="16"
            height="16"
            className="sm:w-5 sm:h-5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="3"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
      </div>

      {/* Main Content - REDUCED WIDTH FOR MOBILE */}
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
                  onChange={(e) =>
                    setFormData({ ...formData, walletNumber: e.target.value })
                  }
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ef6b23] focus:border-transparent text-gray-900 placeholder:text-gray-400 bg-white text-sm sm:text-base"
                />
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
                    onChange={(e) =>
                      setFormData({ ...formData, tinNumber: e.target.value })
                    }
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 pr-10 sm:pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ef6b23] focus:border-transparent text-gray-900 placeholder:text-gray-400 bg-white text-sm sm:text-base"
                  />
                  <button
                    type="button"
                    onClick={() => setShowTIN(!showTIN)}
                    className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showTIN ? (
                      <EyeOff size={18} className="sm:w-5 sm:h-5" />
                    ) : (
                      <Eye size={18} className="sm:w-5 sm:h-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Source of Fund */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Source of Fund<span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.sourceOfFund}
                  onChange={(e) =>
                    setFormData({ ...formData, sourceOfFund: e.target.value })
                  }
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
              </div>

              {/* National Security Number */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  National Security Number
                  <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Enter Number Here"
                  value={formData.nationalSecurityNumber}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      nationalSecurityNumber: e.target.value,
                    })
                  }
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ef6b23] focus:border-transparent text-gray-900 placeholder:text-gray-400 bg-white text-sm sm:text-base"
                />
              </div>

              {/* Add a Wallet Setup Link */}
              <div>
                <a
                  href="#"
                  className="text-[#3b82f6] text-sm font-medium hover:underline inline-block"
                >
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
                <label
                  htmlFor="pep"
                  className="text-xs sm:text-sm text-gray-700 leading-relaxed cursor-pointer"
                >
                  Are you a Politically Exposed Person (PEP), or are you closely
                  related to or associated with a PEP?
                </label>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-4 sm:space-y-5 md:space-y-6">
              {/* Upload Passport */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Upload Passport
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
                  <input
                    id="passport-upload"
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange(e, 'passport')}
                    className="hidden"
                  />
                </label>
                <p className="text-xs text-gray-500 mt-2">
                  Image cannot be greater than 2 MB
                </p>
              </div>

              {/* Upload Selfie */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Upload Your Selfie
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
                  <input
                    id="selfie-upload"
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange(e, 'selfie')}
                    className="hidden"
                  />
                </label>
                <p className="text-xs text-gray-500 mt-2">
                  Image cannot be greater than 2 MB
                </p>
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4 mt-6 sm:mt-8 md:mt-10">
            <button 
              onClick={handleBack}
              className="px-4 sm:px-6 py-2.5 sm:py-3 border-2 border-[#ef6b23] text-[#ef6b23] rounded-lg font-semibold hover:bg-[#ef6b23] hover:text-white transition-colors text-sm sm:text-base"
            >
              Back
            </button>
            <button
              type="button"
              onClick={handleNext}
              className="px-4 sm:px-6 py-2.5 sm:py-3 bg-[#ef6b23] text-white rounded-lg font-semibold hover:bg-[#d85a1a] transition-colors shadow-sm text-sm sm:text-base"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
