'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import Image from 'next/image';

// ─── Base URL ─────────────────────────────────────────────
const BASE_URL = 'https://cobuild-simulator-backend.onrender.com/api/v1';

// ─── Types ────────────────────────────────────────────────
interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  phoneCode: string;
  nationality: string;
  residency: string;
  dob: string;
  avatar: string;
  walletNumber: string;
  tinNumber: string;
  sourceOfFund: string;
  isPoliticallyExposedPerson: boolean;
  lastLoginAt: string;
}

// ─── Translations ─────────────────────────────────────────
const t = {
  en: {
    getHelp:            'Get Help',
    editProfile:        'Edit Profile',
    logout:             'Logout',
    failedTitle:        'Failed to load profile',
    tryAgain:           'Try Again',
    goToLogin:          'Go to Login',
    personalInfo:       'Personal Info',
    accountDetails:     'Account Details',
    email:              'Email',
    phone:              'Phone',
    nationality:        'Nationality',
    residency:          'Residency',
    dob:                'Date of Birth',
    lastLogin:          'Last Login',
    wallet:             'Wallet',
    tin:                'TIN',
    sourceOfFunds:      'Source of Funds',
    politicallyExposed: 'Politically Exposed',
    yes:                'Yes',
    no:                 'No',
    tokenNotFound:      'Token not found. Please login again.',
  },
  ar: {
    getHelp:            'الحصول على المساعدة',
    editProfile:        'تعديل الملف الشخصي',
    logout:             'تسجيل الخروج',
    failedTitle:        'فشل تحميل الملف الشخصي',
    tryAgain:           'حاول مجدداً',
    goToLogin:          'الذهاب لتسجيل الدخول',
    personalInfo:       'المعلومات الشخصية',
    accountDetails:     'تفاصيل الحساب',
    email:              'البريد الإلكتروني',
    phone:              'رقم الهاتف',
    nationality:        'الجنسية',
    residency:          'الإقامة',
    dob:                'تاريخ الميلاد',
    lastLogin:          'آخر تسجيل دخول',
    wallet:             'المحفظة',
    tin:                'رقم التعريف الضريبي',
    sourceOfFunds:      'مصدر الأموال',
    politicallyExposed: 'شخص مكشوف سياسياً',
    yes:                'نعم',
    no:                 'لا',
    tokenNotFound:      'لم يتم العثور على رمز المصادقة. يرجى تسجيل الدخول مجدداً.',
  },
};

// ─── Skeleton Loader ──────────────────────────────────────
const SkeletonBlock = ({ className }: { className?: string }) => (
  <div className={`animate-pulse bg-gray-200 rounded-lg ${className}`} />
);

export default function UserProfilePage() {
  const router = useRouter();
  const locale  = useLocale();
  const isAr    = locale === 'ar';
  const dir     = isAr ? 'rtl' : 'ltr';
  const tx      = isAr ? t.ar : t.en;

  const [user,    setUser]    = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);

  // ─── Fetch User Profile ──────────────────────────────────
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setLoading(true);
        setError(null);

        const accessToken = localStorage.getItem('accessToken');

        if (!accessToken) {
          setError(tx.tokenNotFound);
          setLoading(false);
          return;
        }

        const response = await fetch(`${BASE_URL}/user/profile`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
        });

        if (response.status === 401) {
          localStorage.removeItem('accessToken');
          router.push('/login-page');
          return;
        }

        if (!response.ok) {
          throw new Error(`Failed to fetch profile (${response.status})`);
        }

        const data    = await response.json();
        const root    = data.data;
        const profile = root.profile;

        setUser({
          id:                       root.id,
          firstName:                profile.firstName,
          lastName:                 profile.lastName,
          email:                    root.email,
          phone:                    profile.phone       ?? '-',
          phoneCode:                profile.phoneCode   ?? profile.dialCode ?? profile.countryCode ?? '',
          nationality:              profile.nationality ?? '-',
          residency:                profile.residency   ?? '-',
          dob:                      profile.dob         ?? '',
          avatar:                   profile.avatarUrl   ?? '',
          walletNumber:             profile.walletNumber             ?? '-',
          tinNumber:                profile.tinNumber                ?? '-',
          sourceOfFund:             profile.sourceOfFund             ?? '-',
          isPoliticallyExposedPerson: profile.isPoliticallyExposedPerson ?? false,
          lastLoginAt:              root.lastLoginAt ?? '',
        });

      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Something went wrong');
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [router, tx.tokenNotFound]);

  // ─── Handlers ────────────────────────────────────────────
  const handleEdit   = () => router.push('/edit-profile');
  const handleBack   = () => router.back();

  const handleLogout = async () => {
    try {
      const accessToken = localStorage.getItem('accessToken');
      if (accessToken) {
        await fetch(`${BASE_URL}/user/auth/logout`, {
          method: 'POST',
          headers: {
            'Content-Type':  'application/json',
            Authorization:   `Bearer ${accessToken}`,
          },
        });
      }
    } catch (_) {
      // ignore logout errors
    } finally {
      localStorage.removeItem('accessToken');
      router.push('/LoginPage');
    }
  };

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString(isAr ? 'ar-SA' : 'en-US', {
      year:  'numeric',
      month: 'long',
      day:   'numeric',
    });

  // ─── Error State ─────────────────────────────────────────
  if (error) {
    return (
      <div dir={dir} className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 text-center max-w-md w-full">
          <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-7 h-7 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">{tx.failedTitle}</h2>
          <p className="text-gray-500 text-sm mb-6">{error}</p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2.5 bg-[#ef6b23] text-white rounded-xl font-semibold text-sm hover:bg-[#d85a1a] transition-all"
            >
              {tx.tryAgain}
            </button>
            <button
              onClick={() => router.push('/login')}
              className="px-6 py-2.5 bg-gray-100 text-gray-800 border border-gray-200 rounded-xl font-semibold text-sm hover:bg-gray-200 transition-all"
            >
              {tx.goToLogin}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ─── Render ───────────────────────────────────────────────
  return (
    <div dir={dir} className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">

        {/* ── Header ─────────────────────────────────────── */}
        <header className="px-4 sm:px-6 py-4 sm:py-6">
          <div className="flex items-center justify-between">

            {/* ✅ Back button — arrow flips automatically with dir=rtl */}
            <div className="flex items-center space-x-3 rtl:space-x-reverse">
              <button
                onClick={handleBack}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                aria-label="Go back"
              >
                {/* ✅ Arrow flips via CSS transform for RTL */}
                <svg
                  className={`w-6 h-6 text-gray-600 ${isAr ? 'scale-x-[-1]' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <Image
                src="/Co-build-logo-02-1.png"
                alt="CoBuild Logo"
                width={120}
                height={32}
                className="h-8 w-auto"
              />
            </div>

            <span className="text-[#ef6b23] font-semibold text-sm hover:underline cursor-pointer">
              {tx.getHelp}
            </span>
          </div>
        </header>

        {/* ── Profile Content ─────────────────────────────── */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 lg:py-16">
          <div className="flex flex-col lg:flex-row lg:items-start lg:gap-12">

            {/* ── Left Column ── */}
            <div className={`lg:w-1/3 lg:shrink-0 mb-12 lg:mb-0 text-center ${isAr ? 'lg:text-right' : 'lg:text-left'}`}>

              {/* Avatar */}
              <div className="mx-auto lg:mx-0 w-32 h-32 sm:w-40 sm:h-40 lg:w-48 lg:h-48 rounded-full bg-gradient-to-br from-[#ef6b23] to-[#d85a1a] p-1 mb-6 lg:mb-8 overflow-hidden">
                {loading ? (
                  <div className="w-full h-full rounded-full bg-gray-200 animate-pulse" />
                ) : user?.avatar ? (
                  <img
                    src={user.avatar}
                    alt="Profile Picture"
                    className="w-full h-full object-cover rounded-full"
                  />
                ) : (
                  <div className="w-full h-full rounded-full bg-gradient-to-br from-[#ef6b23] to-[#d85a1a] flex items-center justify-center">
                    <span className="text-white text-4xl font-bold select-none">
                      {user?.firstName?.charAt(0).toUpperCase() ?? '?'}
                    </span>
                  </div>
                )}
              </div>

              {/* Name / Email / Phone */}
              <div className="mb-10 lg:mb-12">
                {loading ? (
                  <>
                    <SkeletonBlock className="h-8 w-48 mx-auto lg:mx-0 mb-3" />
                    <SkeletonBlock className="h-5 w-56 mx-auto lg:mx-0 mb-2" />
                    <SkeletonBlock className="h-5 w-36 mx-auto lg:mx-0" />
                  </>
                ) : (
                  <>
                    <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 capitalize">
                      {user?.firstName} {user?.lastName}
                    </h1>
                    <p className="text-lg lg:text-xl text-gray-600 mb-2">{user?.email}</p>

                    {/* Phone with country code */}
                    <div className={`flex items-center justify-center gap-2 ${isAr ? 'lg:justify-end' : 'lg:justify-start'}`}>
                      {user?.phoneCode && (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-orange-50 border border-orange-200 text-[#ef6b23] font-semibold text-sm">
                          {user.phoneCode}
                        </span>
                      )}
                      <p className="text-base lg:text-lg text-gray-500">{user?.phone}</p>
                    </div>
                  </>
                )}
              </div>

              {/* Action Buttons */}
              {!loading && (
                <div className={`flex gap-3 justify-center ${isAr ? 'lg:justify-end' : 'lg:justify-start'}`}>
                  <button
                    onClick={handleEdit}
                    className="px-4 py-2.5 bg-[#ef6b23] text-white rounded-xl font-semibold text-base hover:bg-[#d85a1a] transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                  >
                    {tx.editProfile}
                  </button>
                  <button
                    onClick={handleLogout}
                    className="px-4 py-2.5 bg-gray-100 text-gray-800 border-2 border-gray-200 rounded-xl font-semibold text-base hover:bg-red-50 hover:text-red-700 hover:border-red-300 transition-all shadow-sm hover:shadow-md"
                  >
                    {tx.logout}
                  </button>
                </div>
              )}
            </div>

            {/* ── Right Column ── */}
            <div className="lg:w-2/3">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">

                {/* Personal Info Card */}
                <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
                  <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <svg
                      className="w-6 h-6 text-[#ef6b23] flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    {tx.personalInfo}
                  </h3>

                  {loading ? (
                    <div className="space-y-4">
                      {[...Array(5)].map((_, i) => (
                        <div key={i} className="flex justify-between items-center py-2">
                          <SkeletonBlock className="h-4 w-24" />
                          <SkeletonBlock className="h-4 w-32" />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-4">

                      {/* Email */}
                      <div className="flex justify-between items-center py-2 border-b border-gray-50">
                        <span className="text-gray-500 text-sm">{tx.email}</span>
                        <span className="font-medium text-gray-900 text-sm">{user?.email ?? '-'}</span>
                      </div>

                      {/* Phone */}
                      <div className="flex justify-between items-center py-2 border-b border-gray-50">
                        <span className="text-gray-500 text-sm">{tx.phone}</span>
                        <div className="flex items-center gap-2 rtl:flex-row-reverse">
                          {user?.phoneCode ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-orange-50 border border-orange-200 text-[#ef6b23] font-semibold text-xs">
                              {user.phoneCode}
                            </span>
                          ) : null}
                          <span className="font-medium text-gray-900 text-sm">{user?.phone ?? '-'}</span>
                        </div>
                      </div>

                      {/* Nationality */}
                      <div className="flex justify-between items-center py-2 border-b border-gray-50">
                        <span className="text-gray-500 text-sm">{tx.nationality}</span>
                        <span className="font-medium text-gray-900 text-sm">{user?.nationality ?? '-'}</span>
                      </div>

                      {/* Residency */}
                      <div className="flex justify-between items-center py-2 border-b border-gray-50">
                        <span className="text-gray-500 text-sm">{tx.residency}</span>
                        <span className="font-medium text-gray-900 text-sm capitalize">
                          {user?.residency
                            ? user.residency.charAt(0).toUpperCase() + user.residency.slice(1)
                            : '-'}
                        </span>
                      </div>

                      {/* Date of Birth */}
                      <div className="flex justify-between items-center py-2">
                        <span className="text-gray-500 text-sm">{tx.dob}</span>
                        <span className="font-medium text-gray-900 text-sm">
                          {user?.dob ? formatDate(user.dob) : '-'}
                        </span>
                      </div>

                    </div>
                  )}
                </div>

                {/* Account Details Card */}
                <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
                  <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <svg
                      className="w-6 h-6 text-[#ef6b23] flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    {tx.accountDetails}
                  </h3>

                  {loading ? (
                    <div className="space-y-4">
                      {[...Array(5)].map((_, i) => (
                        <div key={i} className="flex justify-between items-center py-2">
                          <SkeletonBlock className="h-4 w-24" />
                          <SkeletonBlock className="h-4 w-32" />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-4">

                      {/* Last Login */}
                      <div className="flex justify-between items-center py-2 border-b border-gray-50">
                        <span className="text-gray-500 text-sm">{tx.lastLogin}</span>
                        <span className="font-medium text-gray-900 text-sm">
                          {user?.lastLoginAt ?? '-'}
                        </span>
                      </div>

                      {/* Wallet */}
                      <div className="flex justify-between items-center py-2 border-b border-gray-50">
                        <span className="text-gray-500 text-sm">{tx.wallet}</span>
                        <span className="font-mono text-sm bg-gray-100 px-3 py-1 rounded-lg truncate max-w-[160px]">
                          {user?.walletNumber ?? '-'}
                        </span>
                      </div>

                      {/* TIN */}
                      <div className="flex justify-between items-center py-2 border-b border-gray-50">
                        <span className="text-gray-500 text-sm">{tx.tin}</span>
                        <span className="font-medium text-gray-900 text-sm">{user?.tinNumber ?? '-'}</span>
                      </div>

                      {/* Source of Funds */}
                      <div className="flex justify-between items-center py-2 border-b border-gray-50">
                        <span className="text-gray-500 text-sm">{tx.sourceOfFunds}</span>
                        <span className="font-medium text-gray-900 text-sm capitalize">
                          {user?.sourceOfFund ?? '-'}
                        </span>
                      </div>

                      {/* Politically Exposed */}
                      <div className="flex justify-between items-center py-2">
                        <span className="text-gray-500 text-sm">{tx.politicallyExposed}</span>
                        <span
                          className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                            user?.isPoliticallyExposedPerson
                              ? 'bg-red-100 text-red-700'
                              : 'bg-green-100 text-green-700'
                          }`}
                        >
                          {user?.isPoliticallyExposedPerson ? tx.yes : tx.no}
                        </span>
                      </div>

                    </div>
                  )}
                </div>

              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
