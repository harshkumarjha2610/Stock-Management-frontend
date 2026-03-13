'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

const countryCodes = [
  { code: '+91',  country: 'IN', flag: '🇮🇳', name: 'India',       maxLength: 10 },
  { code: '+1',   country: 'US', flag: '🇺🇸', name: 'USA',         maxLength: 10 },
  { code: '+44',  country: 'UK', flag: '🇬🇧', name: 'UK',          maxLength: 10 },
  { code: '+971', country: 'AE', flag: '🇦🇪', name: 'UAE',         maxLength: 9  },
  { code: '+61',  country: 'AU', flag: '🇦🇺', name: 'Australia',   maxLength: 9  },
  { code: '+86',  country: 'CN', flag: '🇨🇳', name: 'China',       maxLength: 11 },
  { code: '+81',  country: 'JP', flag: '🇯🇵', name: 'Japan',       maxLength: 10 },
  { code: '+49',  country: 'DE', flag: '🇩🇪', name: 'Germany',     maxLength: 11 },
  { code: '+33',  country: 'FR', flag: '🇫🇷', name: 'France',      maxLength: 9  },
  { code: '+65',  country: 'SG', flag: '🇸🇬', name: 'Singapore',   maxLength: 8  },
];

// Reusable label component
function Label({ htmlFor, children, required, hint }: {
  htmlFor?: string; children: React.ReactNode; required?: boolean; hint?: string;
}) {
  return (
    <label htmlFor={htmlFor} className="block text-sm font-medium text-gray-900 mb-2">
      {children}
      {required && <span className="text-red-500">*</span>}
      {hint && <span className="text-xs text-gray-500 ml-1">{hint}</span>}
    </label>
  );
}

const inputClass =
  'w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ef6b23] focus:border-transparent text-gray-900 placeholder:text-gray-400 bg-white text-sm sm:text-base';

export default function RetailInvestorStep1() {
  const router = useRouter();

  const [countryCode, setCountryCode] = useState('+91');
  const [formData, setFormData] = useState({
    firstName:       '',
    lastName:        '',
    email:           '',
    phone:           '',
    residency:       '',
    nationality:     '',
    dob:             '',
    password:        '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const getMinDate = () => {
    const d = new Date();
    return new Date(d.getFullYear() - 18, d.getMonth(), d.getDate())
      .toISOString().split('T')[0];
  };

  const calculateAge = (dob: string) => {
    const birth = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
    return age;
  };

  const set = (field: string, value: string) =>
    setFormData(prev => ({ ...prev, [field]: value }));

  const clearError = (field: string) =>
    setErrors(prev => ({ ...prev, [field]: '' }));

  const validatePage1 = () => {
    const e: Record<string, string> = {};

    if (!formData.firstName.trim()) e.firstName = 'First name is required';
    if (!formData.lastName.trim())  e.lastName  = 'Last name is required';

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim())           e.email = 'Email is required';
    else if (!emailRegex.test(formData.email)) e.email = 'Please enter a valid email';

    // countryCode validation
    if (!countryCode) e.countryCode = 'Country code is required';

    // phone validation
    const selectedCountry = countryCodes.find(c => c.code === countryCode);
    const expectedLen = selectedCountry?.maxLength || 10;
    if (!formData.phone.trim())
      e.phone = 'Phone number is required';
    else if (formData.phone.length !== expectedLen)
      e.phone = `Please enter a valid ${expectedLen}-digit phone number`;

    if (!formData.residency)  e.residency  = 'Residency is required';
    if (!formData.nationality) e.nationality = 'Nationality is required';

    if (!formData.dob) {
      e.dob = 'Date of birth is required';
    } else if (calculateAge(formData.dob) < 18) {
      e.dob = 'You must be at least 18 years old to register';
    }

    if (!formData.password)
      e.password = 'Password is required';
    else if (formData.password.length < 8)
      e.password = 'Password must be at least 8 characters';

    if (formData.password !== formData.confirmPassword)
      e.confirmPassword = 'Passwords do not match';

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleNext = () => {
    if (validatePage1()) {
      sessionStorage.setItem('onboardingPage1', JSON.stringify({
        ...formData,
        countryCode,
        fullPhoneNumber: `${countryCode}${formData.phone}`,
      }));
      router.push('/OnboardingPage2');
    }
  };

  const chevronSvg = `url("data:image/svg+xml,%3Csvg width='12' height='8' viewBox='0 0 12 8' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1.5L6 6.5L11 1.5' stroke='%23666' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`;

  const selectClass =
    'w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ef6b23] focus:border-transparent text-gray-900 bg-white appearance-none cursor-pointer text-sm sm:text-base';

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
        <Image src="/Co-build-logo-02-1.png" alt="CoBuild Logo" width={150} height={40}
          className="h-8 sm:h-10 w-auto" priority />
        <div className="text-xs sm:text-sm text-gray-600">
          Having trouble?{' '}
          <span className="text-[#ef6b23] cursor-pointer hover:underline">Get Help</span>
        </div>
      </header>

      {/* Progress */}
      <div className="px-4 sm:px-6 py-4 sm:py-6 flex items-center justify-center gap-2 sm:gap-3">
        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[#ef6b23] flex items-center justify-center shadow-sm text-white font-semibold">1</div>
        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-semibold">2</div>
      </div>

      {/* Form */}
      <div className="px-4 sm:px-6 py-6 sm:py-8 flex items-start justify-center">
        <div className="w-full max-w-[340px] sm:max-w-md">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-6 sm:mb-8">
            Retail Investor - Step 1
          </h2>

          <div className="space-y-4 sm:space-y-5">

            {/* First Name */}
            <div>
              <Label required>First Name</Label>
              <input type="text" placeholder="Enter First Name" value={formData.firstName}
                onChange={e => { set('firstName', e.target.value); clearError('firstName'); }}
                className={inputClass} />
              {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>}
            </div>

            {/* Last Name */}
            <div>
              <Label required>Last Name</Label>
              <input type="text" placeholder="Enter Last Name" value={formData.lastName}
                onChange={e => { set('lastName', e.target.value); clearError('lastName'); }}
                className={inputClass} />
              {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>}
            </div>

            {/* Email */}
            <div>
              <Label required>Email</Label>
              <input type="email" placeholder="Enter Email Here" value={formData.email}
                onChange={e => { set('email', e.target.value); clearError('email'); }}
                className={inputClass} />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
            </div>

            {/* ── Country Code (standalone field) ── */}
            <div>
              <Label required>Country Code</Label>
              <div className="relative">
                <select
                  value={countryCode}
                  onChange={e => {
                    setCountryCode(e.target.value);
                    set('phone', '');
                    clearError('countryCode');
                    clearError('phone');
                  }}
                  className={selectClass}
                  style={{
                    backgroundImage: chevronSvg,
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'right 0.75rem center',
                    backgroundSize: '12px',
                  }}
                >
                  {countryCodes.map(item => (
                    <option key={item.code} value={item.code}>
                      {item.flag}  {item.code}  —  {item.name}
                    </option>
                  ))}
                </select>
              </div>
              {/* Read-only display pill showing selected value */}
              <div className="mt-1.5 flex items-center gap-1.5">
                <span className="text-xs text-gray-400">Selected:</span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#ef6b23]/10 text-[#ef6b23] text-xs font-semibold border border-[#ef6b23]/20">
                  {countryCodes.find(c => c.code === countryCode)?.flag}{' '}
                  {countryCode}
                </span>
              </div>
              {errors.countryCode && <p className="text-red-500 text-xs mt-1">{errors.countryCode}</p>}
            </div>

            {/* ── Phone Number (just digits, no inline code dropdown) ── */}
            <div>
              <Label required>Phone Number</Label>
              <div className="relative">
                {/* Prefix showing the selected code inside the input */}
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm font-medium pointer-events-none select-none">
                  {countryCode}
                </span>
                <input
                  type="tel"
                  placeholder={`${'0'.repeat(countryCodes.find(c => c.code === countryCode)?.maxLength ?? 10)}`}
                  value={formData.phone}
                  onChange={e => {
                    const max = countryCodes.find(c => c.code === countryCode)?.maxLength ?? 10;
                    set('phone', e.target.value.replace(/\D/g, '').slice(0, max));
                    clearError('phone');
                  }}
                  maxLength={countryCodes.find(c => c.code === countryCode)?.maxLength ?? 10}
                  style={{ paddingLeft: `${countryCode.length * 9 + 20}px` }}
                  className="w-full py-2.5 sm:py-3 pr-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ef6b23] focus:border-transparent text-gray-900 placeholder:text-gray-400 bg-white text-sm sm:text-base"
                />
              </div>
              <p className="text-xs text-gray-400 mt-1">
                {countryCodes.find(c => c.code === countryCode)?.maxLength ?? 10}-digit number for{' '}
                {countryCodes.find(c => c.code === countryCode)?.name}
              </p>
              {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
            </div>

            {/* Residency */}
            <div>
              <Label required>Residency</Label>
              <input type="text" placeholder="e.g., New York" value={formData.residency}
                onChange={e => { set('residency', e.target.value); clearError('residency'); }}
                className={inputClass} />
              {errors.residency && <p className="text-red-500 text-xs mt-1">{errors.residency}</p>}
            </div>

            {/* Nationality */}
            <div>
              <Label required>Nationality</Label>
              <select
                value={formData.nationality}
                onChange={e => { set('nationality', e.target.value); clearError('nationality'); }}
                className={selectClass}
                style={{
                  backgroundImage: chevronSvg,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 0.75rem center',
                  backgroundSize: '12px',
                }}
              >
                <option value="">Select Nationality</option>
                <option value="IN">🇮🇳  India</option>
                <option value="US">🇺🇸  USA</option>
                <option value="AE">🇦🇪  UAE</option>
                <option value="UK">🇬🇧  United Kingdom</option>
                <option value="AU">🇦🇺  Australia</option>
                <option value="SG">🇸🇬  Singapore</option>
              </select>
              {errors.nationality && <p className="text-red-500 text-xs mt-1">{errors.nationality}</p>}
            </div>

            {/* Date of Birth */}
            <div>
              <Label required hint="(Must be 18+)">Date of Birth</Label>
              <input type="date" value={formData.dob}
                onChange={e => { set('dob', e.target.value); clearError('dob'); }}
                max={getMinDate()}
                className={inputClass} />
              {errors.dob && <p className="text-red-500 text-xs mt-1">{errors.dob}</p>}
            </div>

            {/* Password */}
            <div>
              <Label required>Password</Label>
              <input type="password" placeholder="Min 8 characters" value={formData.password}
                onChange={e => { set('password', e.target.value); clearError('password'); }}
                className={inputClass} />
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
            </div>

            {/* Confirm Password */}
            <div>
              <Label required>Confirm Password</Label>
              <input type="password" placeholder="Re-enter password" value={formData.confirmPassword}
                onChange={e => { set('confirmPassword', e.target.value); clearError('confirmPassword'); }}
                className={inputClass} />
              {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}
            </div>
          </div>

          {/* Buttons */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4 mt-8 sm:mt-10">
            <button onClick={() => router.back()}
              className="px-4 sm:px-6 py-2.5 sm:py-3 border-2 border-[#ef6b23] text-[#ef6b23] rounded-lg font-semibold hover:bg-[#ef6b23] hover:text-white transition-colors text-sm sm:text-base">
              Back
            </button>
            <button onClick={handleNext}
              className="px-4 sm:px-6 py-2.5 sm:py-3 bg-[#ef6b23] text-white rounded-lg font-semibold hover:bg-[#d85a1a] transition-colors shadow-sm text-sm sm:text-base">
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
