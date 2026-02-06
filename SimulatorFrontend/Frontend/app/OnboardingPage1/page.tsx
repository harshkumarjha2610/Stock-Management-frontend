'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function RetailInvestorStep1() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    residency: '',
    nationality: '',
    dob: '',
    password: '',
    confirmPassword: ''
  });

  const [errors, setErrors] = useState<any>({});

  const validatePage1 = () => {
    const newErrors: any = {};

    // Split full name into first and last
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    // Phone validation (10 digits)
    const phoneRegex = /^\d{10}$/;
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!phoneRegex.test(formData.phone.replace(/\D/g, ''))) {
      newErrors.phone = 'Please enter a valid 10-digit phone number';
    }

    if (!formData.residency) newErrors.residency = 'Residency is required';
    if (!formData.nationality) newErrors.nationality = 'Nationality is required';
    if (!formData.dob) newErrors.dob = 'Date of birth is required';
    
    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validatePage1()) {
      // Store Page 1 data in sessionStorage
      sessionStorage.setItem('onboardingPage1', JSON.stringify(formData));
      router.push('/OnboardingPage2');
    }
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
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
        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[#ef6b23] flex items-center justify-center shadow-sm text-white font-semibold">
          1
        </div>
        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-semibold">
          2
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 sm:px-6 py-6 sm:py-8 flex items-start justify-center">
        <div className="w-full max-w-[340px] sm:max-w-md">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-6 sm:mb-8">
            Retail Investor - Step 1
          </h2>

          <div className="space-y-4 sm:space-y-5">
            {/* First Name */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                First Name<span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="Enter First Name"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ef6b23] focus:border-transparent text-gray-900 placeholder:text-gray-400 bg-white text-sm sm:text-base"
              />
              {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>}
            </div>

            {/* Last Name */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Last Name<span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="Enter Last Name"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ef6b23] focus:border-transparent text-gray-900 placeholder:text-gray-400 bg-white text-sm sm:text-base"
              />
              {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Email<span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                placeholder="Enter Email Here"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ef6b23] focus:border-transparent text-gray-900 placeholder:text-gray-400 bg-white text-sm sm:text-base"
              />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
            </div>

            {/* Phone Number */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Phone Number<span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                placeholder="1234567890"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value.replace(/\D/g, '') })}
                maxLength={10}
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ef6b23] focus:border-transparent text-gray-900 placeholder:text-gray-400 bg-white text-sm sm:text-base"
              />
              {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
            </div>

            {/* Residency */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Residency<span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g., New York"
                value={formData.residency}
                onChange={(e) => setFormData({ ...formData, residency: e.target.value })}
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ef6b23] focus:border-transparent text-gray-900 placeholder:text-gray-400 bg-white text-sm sm:text-base"
              />
              {errors.residency && <p className="text-red-500 text-xs mt-1">{errors.residency}</p>}
            </div>

            {/* Nationality */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Nationality<span className="text-red-500">*</span>
              </label>
              <select
                value={formData.nationality}
                onChange={(e) => setFormData({ ...formData, nationality: e.target.value })}
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ef6b23] focus:border-transparent text-gray-900 bg-white appearance-none cursor-pointer text-sm sm:text-base"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg width='12' height='8' viewBox='0 0 12 8' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1.5L6 6.5L11 1.5' stroke='%23666' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 0.75rem center',
                  backgroundSize: '12px',
                }}
              >
                <option value="">Select Nationality</option>
                <option value="IN">India</option>
                <option value="US">USA</option>
                <option value="AE">UAE</option>
                <option value="UK">United Kingdom</option>
              </select>
              {errors.nationality && <p className="text-red-500 text-xs mt-1">{errors.nationality}</p>}
            </div>

            {/* Date of Birth */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Date of Birth<span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={formData.dob}
                onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                max={new Date().toISOString().split('T')[0]}
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ef6b23] focus:border-transparent text-gray-900 bg-white text-sm sm:text-base"
              />
              {errors.dob && <p className="text-red-500 text-xs mt-1">{errors.dob}</p>}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Password<span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                placeholder="Min 8 characters"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ef6b23] focus:border-transparent text-gray-900 placeholder:text-gray-400 bg-white text-sm sm:text-base"
              />
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Confirm Password<span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                placeholder="Re-enter password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ef6b23] focus:border-transparent text-gray-900 placeholder:text-gray-400 bg-white text-sm sm:text-base"
              />
              {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}
            </div>
          </div>

          {/* Buttons */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4 mt-8 sm:mt-10">
            <button
              onClick={handleBack}
              className="px-4 sm:px-6 py-2.5 sm:py-3 border-2 border-[#ef6b23] text-[#ef6b23] rounded-lg font-semibold hover:bg-[#ef6b23] hover:text-white transition-colors text-sm sm:text-base"
            >
              Back
            </button>
            <button
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
