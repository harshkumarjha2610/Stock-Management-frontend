'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import Image from 'next/image';

// ─── Country codes ────────────────────────────────────────
const countryCodes = [
  { code: '+91',  country: 'IN', flag: '🇮🇳', name: 'India',     nameAr: 'الهند',           maxLength: 10 },
  { code: '+1',   country: 'US', flag: '🇺🇸', name: 'USA',       nameAr: 'الولايات المتحدة', maxLength: 10 },
  { code: '+44',  country: 'UK', flag: '🇬🇧', name: 'UK',        nameAr: 'المملكة المتحدة',  maxLength: 10 },
  { code: '+971', country: 'AE', flag: '🇦🇪', name: 'UAE',       nameAr: 'الإمارات',         maxLength: 9  },
  { code: '+61',  country: 'AU', flag: '🇦🇺', name: 'Australia', nameAr: 'أستراليا',         maxLength: 9  },
  { code: '+86',  country: 'CN', flag: '🇨🇳', name: 'China',     nameAr: 'الصين',            maxLength: 11 },
  { code: '+81',  country: 'JP', flag: '🇯🇵', name: 'Japan',     nameAr: 'اليابان',          maxLength: 10 },
  { code: '+49',  country: 'DE', flag: '🇩🇪', name: 'Germany',   nameAr: 'ألمانيا',          maxLength: 11 },
  { code: '+33',  country: 'FR', flag: '🇫🇷', name: 'France',    nameAr: 'فرنسا',            maxLength: 9  },
  { code: '+65',  country: 'SG', flag: '🇸🇬', name: 'Singapore', nameAr: 'سنغافورة',         maxLength: 8  },
];

// ─── Translations ─────────────────────────────────────────
const t = {
  en: {
    havingTrouble:        'Having trouble?',
    getHelp:              'Get Help',
    pageTitle:            'Retail Investor - Step 1',
    firstName:            'First Name',
    firstNamePlaceholder: 'Enter First Name',
    lastName:             'Last Name',
    lastNamePlaceholder:  'Enter Last Name',
    email:                'Email',
    emailPlaceholder:     'Enter Email Here',
    countryCode:          'Country Code',
    selected:             'Selected:',
    phoneNumber:          'Phone Number',
    digitNumber:          (n: number, country: string) => `${n}-digit number for ${country}`,
    residency:            'Residency',
    residencyPlaceholder: 'e.g., New York',
    nationality:          'Nationality',
    selectNationality:    'Select Nationality',
    dob:                  'Date of Birth',
    dobHint:              '(Must be 18+)',
    password:             'Password',
    passwordPlaceholder:  'Min 8 characters',
    confirmPassword:      'Confirm Password',
    confirmPlaceholder:   'Re-enter password',
    back:                 'Back',
    next:                 'Next',
    // Nationalities
    india:          '🇮🇳  India',
    usa:            '🇺🇸  USA',
    uae:            '🇦🇪  UAE',
    uk:             '🇬🇧  United Kingdom',
    australia:      '🇦🇺  Australia',
    singapore:      '🇸🇬  Singapore',
    // Validation
    firstNameRequired:  'First name is required',
    lastNameRequired:   'Last name is required',
    emailRequired:      'Email is required',
    emailInvalid:       'Please enter a valid email',
    countryCodeRequired:'Country code is required',
    phoneRequired:      'Phone number is required',
    phoneInvalid:       (n: number) => `Please enter a valid ${n}-digit phone number`,
    residencyRequired:  'Residency is required',
    nationalityRequired:'Nationality is required',
    dobRequired:        'Date of birth is required',
    dobAge:             'You must be at least 18 years old to register',
    passwordRequired:   'Password is required',
    passwordMin:        'Password must be at least 8 characters',
    passwordMismatch:   'Passwords do not match',
  },
  ar: {
    havingTrouble:        'هل تواجه مشكلة؟',
    getHelp:              'الحصول على المساعدة',
    pageTitle:            'مستثمر التجزئة - الخطوة 1',
    firstName:            'الاسم الأول',
    firstNamePlaceholder: 'أدخل الاسم الأول',
    lastName:             'اسم العائلة',
    lastNamePlaceholder:  'أدخل اسم العائلة',
    email:                'البريد الإلكتروني',
    emailPlaceholder:     'أدخل البريد الإلكتروني',
    countryCode:          'رمز الدولة',
    selected:             'المحدد:',
    phoneNumber:          'رقم الهاتف',
    digitNumber:          (n: number, country: string) => `رقم مكوّن من ${n} أرقام لـ ${country}`,
    residency:            'الإقامة',
    residencyPlaceholder: 'مثال: نيويورك',
    nationality:          'الجنسية',
    selectNationality:    'اختر الجنسية',
    dob:                  'تاريخ الميلاد',
    dobHint:              '(يجب أن يكون العمر 18+)',
    password:             'كلمة المرور',
    passwordPlaceholder:  '8 أحرف على الأقل',
    confirmPassword:      'تأكيد كلمة المرور',
    confirmPlaceholder:   'أعد إدخال كلمة المرور',
    back:                 'رجوع',
    next:                 'التالي',
    // Nationalities
    india:          '🇮🇳  الهند',
    usa:            '🇺🇸  الولايات المتحدة',
    uae:            '🇦🇪  الإمارات',
    uk:             '🇬🇧  المملكة المتحدة',
    australia:      '🇦🇺  أستراليا',
    singapore:      '🇸🇬  سنغافورة',
    // Validation
    firstNameRequired:  'الاسم الأول مطلوب',
    lastNameRequired:   'اسم العائلة مطلوب',
    emailRequired:      'البريد الإلكتروني مطلوب',
    emailInvalid:       'يرجى إدخال بريد إلكتروني صحيح',
    countryCodeRequired:'رمز الدولة مطلوب',
    phoneRequired:      'رقم الهاتف مطلوب',
    phoneInvalid:       (n: number) => `يرجى إدخال رقم هاتف صحيح من ${n} أرقام`,
    residencyRequired:  'الإقامة مطلوبة',
    nationalityRequired:'الجنسية مطلوبة',
    dobRequired:        'تاريخ الميلاد مطلوب',
    dobAge:             'يجب أن يكون عمرك 18 عاماً على الأقل للتسجيل',
    passwordRequired:   'كلمة المرور مطلوبة',
    passwordMin:        'يجب أن تكون كلمة المرور 8 أحرف على الأقل',
    passwordMismatch:   'كلمتا المرور غير متطابقتين',
  },
};

// ─── Reusable Label ───────────────────────────────────────
function Label({ htmlFor, children, required, hint, isAr }: {
  htmlFor?: string;
  children: React.ReactNode;
  required?: boolean;
  hint?: string;
  isAr?: boolean;
}) {
  return (
    <label htmlFor={htmlFor} className="block text-sm font-medium text-gray-900 mb-2">
      {children}
      {required && <span className="text-red-500">*</span>}
      {hint && (
        <span className={`text-xs text-gray-500 ${isAr ? 'mr-1' : 'ml-1'}`}>{hint}</span>
      )}
    </label>
  );
}

// ─── Main Component ───────────────────────────────────────
export default function RetailInvestorStep1() {
  const router = useRouter();
  const locale = useLocale();
  const isAr   = locale === 'ar';
  const dir    = isAr ? 'rtl' : 'ltr';
  const tx     = isAr ? t.ar : t.en;

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

  // ─── Helpers ──────────────────────────────────────────────
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

  const set        = (field: string, value: string) => setFormData(prev => ({ ...prev, [field]: value }));
  const clearError = (field: string) => setErrors(prev => ({ ...prev, [field]: '' }));

  // ─── Validation ───────────────────────────────────────────
  const validatePage1 = () => {
    const e: Record<string, string> = {};

    if (!formData.firstName.trim()) e.firstName = tx.firstNameRequired;
    if (!formData.lastName.trim())  e.lastName  = tx.lastNameRequired;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim())            e.email = tx.emailRequired;
    else if (!emailRegex.test(formData.email)) e.email = tx.emailInvalid;

    if (!countryCode) e.countryCode = tx.countryCodeRequired;

    const selectedCountry = countryCodes.find(c => c.code === countryCode);
    const expectedLen = selectedCountry?.maxLength || 10;
    if (!formData.phone.trim())
      e.phone = tx.phoneRequired;
    else if (formData.phone.length !== expectedLen)
      e.phone = tx.phoneInvalid(expectedLen);

    if (!formData.residency)   e.residency   = tx.residencyRequired;
    if (!formData.nationality) e.nationality = tx.nationalityRequired;

    if (!formData.dob) {
      e.dob = tx.dobRequired;
    } else if (calculateAge(formData.dob) < 18) {
      e.dob = tx.dobAge;
    }

    if (!formData.password)
      e.password = tx.passwordRequired;
    else if (formData.password.length < 8)
      e.password = tx.passwordMin;

    if (formData.password !== formData.confirmPassword)
      e.confirmPassword = tx.passwordMismatch;

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // ─── Submit ───────────────────────────────────────────────
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

  // ─── Style helpers ────────────────────────────────────────
  const chevronSvg = `url("data:image/svg+xml,%3Csvg width='12' height='8' viewBox='0 0 12 8' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1.5L6 6.5L11 1.5' stroke='%23666' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`;

  const inputClass =
    `w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ef6b23] focus:border-transparent text-gray-900 placeholder:text-gray-400 bg-white text-sm sm:text-base ${isAr ? 'text-right' : ''}`;

  const selectClass =
    `w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ef6b23] focus:border-transparent text-gray-900 bg-white appearance-none cursor-pointer text-sm sm:text-base ${isAr ? 'text-right' : ''}`;

  // ✅ Chevron position flips for RTL
  const selectStyle = {
    backgroundImage:    chevronSvg,
    backgroundRepeat:   'no-repeat' as const,
    backgroundPosition: isAr ? 'left 0.75rem center' : 'right 0.75rem center',
    backgroundSize:     '12px',
    paddingLeft:        isAr ? '2rem'  : undefined,
    paddingRight:       isAr ? undefined : '2rem',
  };

  // ✅ Current selected country
  const selectedCountry = countryCodes.find(c => c.code === countryCode);
  const countryName     = isAr ? (selectedCountry?.nameAr ?? selectedCountry?.name ?? '') : (selectedCountry?.name ?? '');

  return (
    <div dir={dir} className="min-h-screen bg-white">

      {/* ── Header ────────────────────────────────────────── */}
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

      {/* ── Progress Steps ────────────────────────────────── */}
      <div className="px-4 sm:px-6 py-4 sm:py-6 flex items-center justify-center gap-2 sm:gap-3">
        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[#ef6b23] flex items-center justify-center shadow-sm text-white font-semibold">
          1
        </div>
        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-semibold">
          2
        </div>
      </div>

      {/* ── Form ──────────────────────────────────────────── */}
      <div className="px-4 sm:px-6 py-6 sm:py-8 flex items-start justify-center">
        <div className="w-full max-w-[340px] sm:max-w-md">

          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-6 sm:mb-8">
            {tx.pageTitle}
          </h2>

          <div className="space-y-4 sm:space-y-5">

            {/* ── First Name ──────────────────────────────── */}
            <div>
              <Label required isAr={isAr}>{tx.firstName}</Label>
              <input
                type="text"
                placeholder={tx.firstNamePlaceholder}
                value={formData.firstName}
                onChange={e => { set('firstName', e.target.value); clearError('firstName'); }}
                className={inputClass}
              />
              {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>}
            </div>

            {/* ── Last Name ───────────────────────────────── */}
            <div>
              <Label required isAr={isAr}>{tx.lastName}</Label>
              <input
                type="text"
                placeholder={tx.lastNamePlaceholder}
                value={formData.lastName}
                onChange={e => { set('lastName', e.target.value); clearError('lastName'); }}
                className={inputClass}
              />
              {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>}
            </div>

            {/* ── Email ───────────────────────────────────── */}
            <div>
              <Label required isAr={isAr}>{tx.email}</Label>
              {/* ✅ Email input always LTR — emails are universally left-to-right */}
              <input
                type="email"
                dir="ltr"
                placeholder={tx.emailPlaceholder}
                value={formData.email}
                onChange={e => { set('email', e.target.value); clearError('email'); }}
                className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ef6b23] focus:border-transparent text-gray-900 placeholder:text-gray-400 bg-white text-sm sm:text-base ${isAr ? 'text-right' : ''}`}
              />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
            </div>

            {/* ── Country Code ────────────────────────────── */}
            <div>
              <Label required isAr={isAr}>{tx.countryCode}</Label>
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
                  style={selectStyle}
                >
                  {countryCodes.map(item => (
                    <option key={item.code} value={item.code}>
                      {item.flag}  {item.code}  —  {isAr ? item.nameAr : item.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Selected pill */}
              <div className="mt-1.5 flex items-center gap-1.5">
                <span className="text-xs text-gray-400">{tx.selected}</span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#ef6b23]/10 text-[#ef6b23] text-xs font-semibold border border-[#ef6b23]/20">
                  {selectedCountry?.flag} {countryCode}
                </span>
              </div>
              {errors.countryCode && <p className="text-red-500 text-xs mt-1">{errors.countryCode}</p>}
            </div>

            {/* ── Phone Number ────────────────────────────── */}
            <div>
              <Label required isAr={isAr}>{tx.phoneNumber}</Label>
              <div className="relative">
                {/* ✅ Country code prefix — position flips for RTL */}
                <span
                  className={`absolute ${isAr ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 text-gray-500 text-sm font-medium pointer-events-none select-none`}
                >
                  {countryCode}
                </span>
                <input
                  type="tel"
                  // ✅ Phone digits always LTR
                  dir="ltr"
                  placeholder={'0'.repeat(selectedCountry?.maxLength ?? 10)}
                  value={formData.phone}
                  onChange={e => {
                    const max = selectedCountry?.maxLength ?? 10;
                    set('phone', e.target.value.replace(/\D/g, '').slice(0, max));
                    clearError('phone');
                  }}
                  maxLength={selectedCountry?.maxLength ?? 10}
                  style={{
                    // ✅ Padding shifts to correct side based on direction
                    paddingRight: isAr ? `${countryCode.length * 9 + 20}px` : '1rem',
                    paddingLeft:  isAr ? '1rem' : `${countryCode.length * 9 + 20}px`,
                  }}
                  className="w-full py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ef6b23] focus:border-transparent text-gray-900 placeholder:text-gray-400 bg-white text-sm sm:text-base"
                />
              </div>
              <p className={`text-xs text-gray-400 mt-1 ${isAr ? 'text-right' : ''}`}>
                {tx.digitNumber(selectedCountry?.maxLength ?? 10, countryName)}
              </p>
              {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
            </div>

            {/* ── Residency ───────────────────────────────── */}
            <div>
              <Label required isAr={isAr}>{tx.residency}</Label>
              <input
                type="text"
                placeholder={tx.residencyPlaceholder}
                value={formData.residency}
                onChange={e => { set('residency', e.target.value); clearError('residency'); }}
                className={inputClass}
              />
              {errors.residency && <p className="text-red-500 text-xs mt-1">{errors.residency}</p>}
            </div>

            {/* ── Nationality ─────────────────────────────── */}
            <div>
              <Label required isAr={isAr}>{tx.nationality}</Label>
              <select
                value={formData.nationality}
                onChange={e => { set('nationality', e.target.value); clearError('nationality'); }}
                className={selectClass}
                style={selectStyle}
              >
                <option value="">{tx.selectNationality}</option>
                <option value="IN">{tx.india}</option>
                <option value="US">{tx.usa}</option>
                <option value="AE">{tx.uae}</option>
                <option value="UK">{tx.uk}</option>
                <option value="AU">{tx.australia}</option>
                <option value="SG">{tx.singapore}</option>
              </select>
              {errors.nationality && <p className="text-red-500 text-xs mt-1">{errors.nationality}</p>}
            </div>

            {/* ── Date of Birth ───────────────────────────── */}
            <div>
              <Label required hint={tx.dobHint} isAr={isAr}>{tx.dob}</Label>
              <input
                type="date"
                value={formData.dob}
                onChange={e => { set('dob', e.target.value); clearError('dob'); }}
                max={getMinDate()}
                className={inputClass}
              />
              {errors.dob && <p className="text-red-500 text-xs mt-1">{errors.dob}</p>}
            </div>

            {/* ── Password ────────────────────────────────── */}
            <div>
              <Label required isAr={isAr}>{tx.password}</Label>
              <input
                type="password"
                placeholder={tx.passwordPlaceholder}
                value={formData.password}
                onChange={e => { set('password', e.target.value); clearError('password'); }}
                className={inputClass}
              />
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
            </div>

            {/* ── Confirm Password ─────────────────────────── */}
            <div>
              <Label required isAr={isAr}>{tx.confirmPassword}</Label>
              <input
                type="password"
                placeholder={tx.confirmPlaceholder}
                value={formData.confirmPassword}
                onChange={e => { set('confirmPassword', e.target.value); clearError('confirmPassword'); }}
                className={inputClass}
              />
              {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}
            </div>

          </div>

          {/* ── Action Buttons ───────────────────────────── */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4 mt-8 sm:mt-10">
            <button
              onClick={() => router.back()}
              className="px-4 sm:px-6 py-2.5 sm:py-3 border-2 border-[#ef6b23] text-[#ef6b23] rounded-lg font-semibold hover:bg-[#ef6b23] hover:text-white transition-colors text-sm sm:text-base"
            >
              {tx.back}
            </button>
            <button
              onClick={handleNext}
              className="px-4 sm:px-6 py-2.5 sm:py-3 bg-[#ef6b23] text-white rounded-lg font-semibold hover:bg-[#d85a1a] transition-colors shadow-sm text-sm sm:text-base"
            >
              {tx.next}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
