'use client';
import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

// ─── Base URL ─────────────────────────────────────────────
const BASE_URL = 'https://cobuild-simulator-backend.onrender.com/api/v1';

// ─── Country codes ────────────────────────────────────────
const countryCodes = [
  { code: '+91', country: 'IN', flag: '🇮🇳', name: 'India',     maxLength: 10 },
  { code: '+1',  country: 'US', flag: '🇺🇸', name: 'USA',       maxLength: 10 },
  { code: '+44', country: 'UK', flag: '🇬🇧', name: 'UK',        maxLength: 10 },
  { code: '+971',country: 'AE', flag: '🇦🇪', name: 'UAE',       maxLength: 9  },
  { code: '+61', country: 'AU', flag: '🇦🇺', name: 'Australia', maxLength: 9  },
  { code: '+86', country: 'CN', flag: '🇨🇳', name: 'China',     maxLength: 11 },
  { code: '+81', country: 'JP', flag: '🇯🇵', name: 'Japan',     maxLength: 10 },
  { code: '+49', country: 'DE', flag: '🇩🇪', name: 'Germany',   maxLength: 11 },
  { code: '+33', country: 'FR', flag: '🇫🇷', name: 'France',    maxLength: 9  },
  { code: '+65', country: 'SG', flag: '🇸🇬', name: 'Singapore', maxLength: 8  },
];

// ─── Token helpers ────────────────────────────────────────
const getAccessToken  = () => localStorage.getItem('accessToken');
const getRefreshToken = () => localStorage.getItem('refreshToken');
const setTokens = (access: string, refresh: string) => {
  localStorage.setItem('accessToken',  access);
  localStorage.setItem('refreshToken', refresh);
};
const clearTokens = () => {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
};

// ─── Refresh access token ─────────────────────────────────
async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return null;

  try {
    const res = await fetch(`${BASE_URL}/user/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });

    if (!res.ok) return null;

    const data = await res.json();
    const newAccess  = data?.data?.accessToken  ?? data?.accessToken;
    const newRefresh = data?.data?.refreshToken ?? data?.refreshToken ?? refreshToken;

    if (newAccess) {
      setTokens(newAccess, newRefresh);
      return newAccess;
    }
    return null;
  } catch {
    return null;
  }
}

// ─── Fetch with auto token refresh ───────────────────────
async function fetchWithRefresh(
  url: string,
  options: RequestInit,
  router: ReturnType<typeof useRouter>
): Promise<Response> {
  const token = getAccessToken();
  const headers = {
    ...(options.headers as Record<string, string>),
    Authorization: `Bearer ${token}`,
  };

  let response = await fetch(url, { ...options, headers });

  if (response.status === 401) {
    const newToken = await refreshAccessToken();
    if (!newToken) {
      clearTokens();
      router.push('/login');
      throw new Error('Session expired. Please login again.');
    }

    response = await fetch(url, {
      ...options,
      headers: { ...(options.headers as Record<string, string>), Authorization: `Bearer ${newToken}` },
    });

    if (response.status === 401) {
      clearTokens();
      router.push('/login');
      throw new Error('Session expired. Please login again.');
    }
  }

  return response;
}

// ─── Skeleton ─────────────────────────────────────────────
const SkeletonBlock = ({ className }: { className?: string }) => (
  <div className={`animate-pulse bg-gray-200 rounded-lg ${className}`} />
);

export default function EditProfilePage() {
  const router = useRouter();
  const avatarInputRef   = useRef<HTMLInputElement>(null);
  const passportInputRef = useRef<HTMLInputElement>(null);

  // ─── Form state ───────────────────────────────────────
  const [countryCode, setCountryCode] = useState('+91');
  const [formData, setFormData] = useState({
    firstName:                 '',
    lastName:                  '',
    email:                     '',
    phone:                     '',
    nationality:               '',
    residency:                 '',
    dob:                       '',
    walletNumber:              '',
    tinNumber:                 '',
    nationalSecurityNumber:    '',
    sourceOfFund:              '',
    isPoliticallyExposedPerson: false,
  });

  // ─── File state ───────────────────────────────────────
  const [avatarFile,       setAvatarFile]       = useState<File | null>(null);
  const [passportFile,     setPassportFile]      = useState<File | null>(null);
  const [avatarPreview,    setAvatarPreview]     = useState<string>('');
  const [passportPreview,  setPassportPreview]   = useState<string>('');

  // ─── UI state ─────────────────────────────────────────
  const [pageLoading, setPageLoading] = useState(true);
  const [loading,     setLoading]     = useState(false);
  const [errors,      setErrors]      = useState<Record<string, string>>({});
  const [successMsg,  setSuccessMsg]  = useState('');
  const [apiError,    setApiError]    = useState('');

  // ─── Load existing profile ────────────────────────────
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const res = await fetchWithRefresh(
          `${BASE_URL}/user/profile`,
          { method: 'GET', headers: { 'Content-Type': 'application/json' } },
          router
        );
        if (!res.ok) throw new Error('Failed to load profile');

        const data   = await res.json();
        const root    = data.data;
        const profile = root.profile;

        // Extract phone number without country code
        const matchedCode = countryCodes.find(c => profile.phone?.startsWith(c.code));
        const phoneOnly   = matchedCode
          ? profile.phone.replace(matchedCode.code, '')
          : profile.phone ?? '';
        if (matchedCode) setCountryCode(matchedCode.code);

        setFormData({
          firstName:                 profile.firstName               ?? '',
          lastName:                  profile.lastName                ?? '',
          email:                     root.email                      ?? '',
          phone:                     phoneOnly.replace(/\D/g, ''),
          nationality:               profile.nationality             ?? '',
          residency:                 profile.residency               ?? '',
          dob:                       profile.dob                     ?? '',
          walletNumber:              profile.walletNumber            ?? '',
          tinNumber:                 profile.tinNumber               ?? '',
          nationalSecurityNumber:    profile.nationalSecurityNumber  ?? '',
          sourceOfFund:              profile.sourceOfFund            ?? '',
          isPoliticallyExposedPerson: profile.isPoliticallyExposedPerson ?? false,
        });

        // Load existing images
        if (profile.avatarUrl)   setAvatarPreview(profile.avatarUrl);
        if (profile.passportImageUrl) setPassportPreview(profile.passportImageUrl);

      } catch (err: unknown) {
        setApiError(err instanceof Error ? err.message : 'Failed to load profile');
      } finally {
        setPageLoading(false);
      }
    };

    loadProfile();
  }, [router]);

  // ─── Helpers ──────────────────────────────────────────
  const getMinDate = () => {
    const d = new Date();
    d.setFullYear(d.getFullYear() - 18);
    return d.toISOString().split('T')[0];
  };

  const calculateAge = (dob: string) => {
    const birth = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    if (
      today.getMonth() < birth.getMonth() ||
      (today.getMonth() === birth.getMonth() && today.getDate() < birth.getDate())
    ) age--;
    return age;
  };

  // ─── Image handlers ───────────────────────────────────
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handlePassportChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPassportFile(file);
    setPassportPreview(URL.createObjectURL(file));
  };

  // ─── Input change ─────────────────────────────────────
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  // ─── Validation ───────────────────────────────────────
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim())  newErrors.lastName  = 'Last name is required';
    if (!formData.email.match(/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/))
      newErrors.email = 'Valid email is required';

    const selectedCountry = countryCodes.find(c => c.code === countryCode);
    const expectedLength  = selectedCountry?.maxLength || 10;
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (formData.phone.length !== expectedLength) {
      newErrors.phone = `Please enter a valid ${expectedLength}-digit phone number`;
    }

    if (!formData.dob) {
      newErrors.dob = 'Date of birth is required';
    } else if (calculateAge(formData.dob) < 18) {
      newErrors.dob = 'You must be at least 18 years old';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ─── Submit ───────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setApiError('');
    setSuccessMsg('');

    try {
      // Build FormData — API expects multipart/form-data
      const body = new FormData();

      body.append('firstName',              formData.firstName);
      body.append('lastName',               formData.lastName);
      body.append('phone',                  `${countryCode}${formData.phone}`);
      body.append('nationality',            formData.nationality);
      body.append('residency',              formData.residency);
      body.append('dob',                    formData.dob);
      body.append('walletNumber',           formData.walletNumber);
      body.append('tinNumber',              formData.tinNumber);
      body.append('nationalSecurityNumber', formData.nationalSecurityNumber);
      body.append('sourceOfFund',           formData.sourceOfFund);
      body.append('isPoliticallyExposedPerson',
        formData.isPoliticallyExposedPerson ? 'true' : 'false');

      // Append files only if new ones are selected
      if (avatarFile)   body.append('avatar',   avatarFile);
      if (passportFile) body.append('passport', passportFile);

      const res = await fetchWithRefresh(
        `${BASE_URL}/user/profile`,
        {
          method: 'PUT',
          // ⚠️ Do NOT set Content-Type — browser sets it automatically with boundary for FormData
          body,
        },
        router
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.message ?? `Update failed (${res.status})`);
      }

      setSuccessMsg('Profile updated successfully!');
      setTimeout(() => router.push('/profile'), 1500);

    } catch (err: unknown) {
      setApiError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  // ─── Page loading skeleton ────────────────────────────
  if (pageLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-4xl w-full mx-auto px-4 sm:px-6 py-12 grid grid-cols-1 lg:grid-cols-2 gap-8">
          {[0, 1].map(i => (
            <div key={i} className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 space-y-6">
              <SkeletonBlock className="h-7 w-48 mb-8" />
              {[...Array(5)].map((_, j) => (
                <div key={j}>
                  <SkeletonBlock className="h-4 w-28 mb-2" />
                  <SkeletonBlock className="h-12 w-full" />
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ─── Render ───────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">

        {/* Header */}
        <header className="px-4 sm:px-6 py-4 sm:py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <button onClick={() => router.back()} className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <Image src="/Co-build-logo-02-1.png" alt="CoBuild Logo" width={120} height={32} className="h-8 w-auto" />
            </div>
            <span className="text-[#ef6b23] font-semibold text-sm hover:underline cursor-pointer">Get Help</span>
          </div>
        </header>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 lg:py-16">
          <div className="text-center mb-12">
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Edit Profile</h1>
            <p className="text-xl text-gray-600 max-w-md mx-auto">Update your personal and account information</p>
          </div>

          {/* ── API-level feedback ── */}
          {apiError && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
              <svg className="w-5 h-5 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-red-700 text-sm font-medium">{apiError}</p>
            </div>
          )}
          {successMsg && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3">
              <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <p className="text-green-700 text-sm font-medium">{successMsg}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-8">

            {/* ── Personal Info Card ── */}
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
              <h3 className="text-2xl font-bold text-gray-900 mb-8 flex items-center">
                <svg className="w-7 h-7 text-[#ef6b23] mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Personal Information
              </h3>

              {/* Avatar Upload */}
              <div className="text-center mb-8">
                <div
                  className="mx-auto w-32 h-32 sm:w-40 sm:h-40 rounded-full bg-gradient-to-br from-[#ef6b23] to-[#d85a1a] p-1 cursor-pointer hover:shadow-xl transition-all overflow-hidden relative group"
                  onClick={() => avatarInputRef.current?.click()}
                >
                  {avatarPreview ? (
                    <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover rounded-full group-hover:scale-105 transition-transform duration-200" />
                  ) : (
                    <div className="w-full h-full rounded-full bg-gradient-to-br from-[#ef6b23] to-[#d85a1a] flex items-center justify-center">
                      <span className="text-white text-4xl font-bold">
                        {formData.firstName?.charAt(0).toUpperCase() ?? '?'}
                      </span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 rounded-full transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                </div>
                <input ref={avatarInputRef} type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
                <p className="text-sm text-gray-500 mt-3">Click to change profile picture</p>
              </div>

              <div className="space-y-6">
                {/* First Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                  <input type="text" name="firstName" value={formData.firstName} onChange={handleInputChange}
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-[#ef6b23] focus:border-transparent transition-all ${errors.firstName ? 'border-red-300 ring-1 ring-red-200' : 'border-gray-300'}`} />
                  {errors.firstName && <p className="mt-1 text-sm text-red-600">{errors.firstName}</p>}
                </div>

                {/* Last Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                  <input type="text" name="lastName" value={formData.lastName} onChange={handleInputChange}
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-[#ef6b23] focus:border-transparent transition-all ${errors.lastName ? 'border-red-300 ring-1 ring-red-200' : 'border-gray-300'}`} />
                  {errors.lastName && <p className="mt-1 text-sm text-red-600">{errors.lastName}</p>}
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                  <input type="email" name="email" value={formData.email} onChange={handleInputChange}
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-[#ef6b23] focus:border-transparent transition-all ${errors.email ? 'border-red-300 ring-1 ring-red-200' : 'border-gray-300'}`} />
                  {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                  <div className="flex gap-2">
                    <select value={countryCode}
                      onChange={(e) => { setCountryCode(e.target.value); setFormData(p => ({ ...p, phone: '' })); setErrors(p => ({ ...p, phone: '' })); }}
                      className="w-28 px-3 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#ef6b23] focus:border-transparent transition-all text-sm">
                      {countryCodes.map(item => (
                        <option key={item.code} value={item.code}>{item.flag} {item.code}</option>
                      ))}
                    </select>
                    <input type="tel" name="phone" value={formData.phone} placeholder="1234567890"
                      onChange={(e) => {
                        const max = countryCodes.find(c => c.code === countryCode)?.maxLength || 10;
                        setFormData(p => ({ ...p, phone: e.target.value.replace(/\D/g, '').slice(0, max) }));
                        if (errors.phone) setErrors(p => ({ ...p, phone: '' }));
                      }}
                      maxLength={countryCodes.find(c => c.code === countryCode)?.maxLength || 10}
                      className={`flex-1 px-4 py-3 border rounded-xl focus:ring-2 focus:ring-[#ef6b23] focus:border-transparent transition-all ${errors.phone ? 'border-red-300 ring-1 ring-red-200' : 'border-gray-300'}`} />
                  </div>
                  {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone}</p>}
                </div>

                {/* Date of Birth */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date of Birth <span className="text-xs text-gray-500 ml-1">(Must be 18+)</span>
                  </label>
                  <input type="date" name="dob" value={formData.dob} onChange={handleInputChange} max={getMinDate()}
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-[#ef6b23] focus:border-transparent transition-all ${errors.dob ? 'border-red-300 ring-1 ring-red-200' : 'border-gray-300'}`} />
                  {errors.dob && <p className="mt-1 text-sm text-red-600">{errors.dob}</p>}
                </div>

                {/* Passport Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Passport Image</label>
                  <div
                    className="relative w-full h-36 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-[#ef6b23] transition-colors overflow-hidden group"
                    onClick={() => passportInputRef.current?.click()}
                  >
                    {passportPreview ? (
                      <>
                        <img src={passportPreview} alt="Passport" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
                          <span className="text-white text-sm font-semibold">Change Passport</span>
                        </div>
                      </>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full text-gray-400 gap-2">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span className="text-sm">Click to upload passport</span>
                      </div>
                    )}
                  </div>
                  <input ref={passportInputRef} type="file" accept="image/*" onChange={handlePassportChange} className="hidden" />
                </div>
              </div>
            </div>

            {/* ── Account Details Card ── */}
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
              <h3 className="text-2xl font-bold text-gray-900 mb-8 flex items-center">
                <svg className="w-7 h-7 text-[#ef6b23] mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                Account Details
              </h3>

              <div className="space-y-6">
                {/* Nationality */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nationality</label>
                  <select name="nationality" value={formData.nationality} onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#ef6b23] focus:border-transparent transition-all">
                    <option value="">Select nationality</option>
                    <option value="IN">India</option>
                    <option value="US">United States</option>
                    <option value="UK">United Kingdom</option>
                    <option value="CA">Canada</option>
                    <option value="AU">Australia</option>
                    <option value="AE">UAE</option>
                    <option value="SG">Singapore</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>

                {/* Residency */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Residency</label>
                  <input type="text" name="residency" value={formData.residency} onChange={handleInputChange}
                    placeholder="e.g. delhi, mumbai"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#ef6b23] focus:border-transparent transition-all" />
                </div>

                {/* Wallet Number */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Wallet Number</label>
                  <input type="text" name="walletNumber" value={formData.walletNumber} onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#ef6b23] focus:border-transparent transition-all font-mono" />
                </div>

                {/* TIN Number */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">TIN Number</label>
                  <input type="text" name="tinNumber" value={formData.tinNumber} onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#ef6b23] focus:border-transparent transition-all" />
                </div>

                {/* National Security Number */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">National Security Number</label>
                  <input type="text" name="nationalSecurityNumber" value={formData.nationalSecurityNumber} onChange={handleInputChange}
                    placeholder="e.g. SSN123456789"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#ef6b23] focus:border-transparent transition-all" />
                </div>

                {/* Source of Funds */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Source of Funds</label>
                  <select name="sourceOfFund" value={formData.sourceOfFund} onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#ef6b23] focus:border-transparent transition-all">
                    <option value="">Select source</option>
                    <option value="salary">Salary</option>
                    <option value="Employment">Employment</option>
                    <option value="Business">Business</option>
                    <option value="Investment">Investment</option>
                    <option value="Inheritance">Inheritance</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                {/* Politically Exposed */}
                <div className="flex items-center">
                  <input type="checkbox" name="isPoliticallyExposedPerson"
                    checked={formData.isPoliticallyExposedPerson}
                    onChange={(e) => setFormData(prev => ({ ...prev, isPoliticallyExposedPerson: e.target.checked }))}
                    className="w-4 h-4 text-[#ef6b23] bg-gray-100 border-gray-300 rounded focus:ring-[#ef6b23]" />
                  <label className="ml-3 text-sm font-medium text-gray-700">Politically Exposed Person (PEP)</label>
                </div>
              </div>
            </div>

            {/* ── Action Buttons ── */}
            <div className="lg:col-span-2 flex flex-col sm:flex-row gap-4 pt-8 border-t border-gray-100">
              <button type="button" onClick={() => router.back()}
                className="flex-1 px-8 py-3 bg-gray-100 text-gray-800 border-2 border-gray-200 rounded-xl font-semibold text-lg hover:bg-gray-200 transition-all">
                Cancel
              </button>
              <button type="submit" disabled={loading}
                className="flex-1 px-8 py-3 bg-[#ef6b23] text-white rounded-xl font-semibold text-lg hover:bg-[#d85a1a] transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none">
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Saving...
                  </span>
                ) : 'Save Changes'}
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}
