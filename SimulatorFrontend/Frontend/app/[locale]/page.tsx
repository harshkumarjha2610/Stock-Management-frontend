'use client';

import { Slot } from "@radix-ui/react-slot";
import { type VariantProps, cva } from "class-variance-authority";
import * as React from "react";
import { useLocale } from 'next-intl';
import { useRouter, usePathname } from '@/i18n/routing';

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(" ");
}

// ==================== TRANSLATIONS ====================
const AR = {
  alert: { successTitle: 'نجاح!', errorTitle: 'خطأ', gotIt: 'حسناً!', close: 'إغلاق' },
  header: { logoAlt: 'شعار كو بيلد', switchLabel: 'EN', toggleTheme: 'تبديل المظهر', login: 'تسجيل الدخول' },
  landing: {
    letsText: 'لنبني', coText: 'كو', buildText: 'بيلد', theWorld: 'العالم',
    eoiTagline: 'قدّم طلب إبداء الاهتمام للحصول على وصول مبكر',
    submitEoiButton: 'قدّم إبداء الاهتمام',
    videoBrowserNotSupported: 'متصفحك لا يدعم تشغيل الفيديو.',
    glassBossAlt: 'صورة المبنى',
  },
  validation: {
    fullNameRequired: 'الاسم الكامل مطلوب', fullNameRequiredDesc: 'يرجى إدخال اسمك الكامل للمتابعة.',
    emailRequired: 'البريد الإلكتروني مطلوب', emailRequiredDesc: 'يرجى إدخال بريدك الإلكتروني للمتابعة.',
    invalidEmail: 'بريد إلكتروني غير صالح', invalidEmailDesc: 'يرجى إدخال عنوان بريد إلكتروني صالح.',
    phoneRequired: 'رقم الهاتف مطلوب', phoneRequiredDesc: 'يرجى إدخال رقم هاتفك للمتابعة.',
    investorTypeRequired: 'نوع المستثمر مطلوب', investorTypeRequiredDesc: 'يرجى اختيار نوع المستثمر للمتابعة.',
    responseRequired: 'الإجابة مطلوبة', responseRequiredDesc: 'يرجى الإجابة إذا كنت مهتماً بدائرة المؤسسين.',
    messageRequired: 'الرسالة مطلوبة', messageRequiredDesc: 'يرجى إخبارنا بسبب اهتمامك بدائرة المؤسسين.',
    consentRequired: 'الموافقة مطلوبة', consentRequiredDesc: 'يرجى تقديم موافقتك للمتابعة.',
  },
  submit: {
    successMessage: 'تم الإرسال بنجاح!',
    successDescription: 'لقد استلمنا طلب إبداء اهتمامك. سيتواصل معك فريقنا قريباً.',
    failedMessage: 'فشل الإرسال', somethingWrong: 'حدث خطأ ما. يرجى المحاولة مرة أخرى.',
    networkError: 'خطأ في الشبكة', networkErrorDesc: 'فشل الإرسال. يرجى التحقق من اتصالك والمحاولة مجدداً.',
  },
  phone: { searchPlaceholder: 'ابحث عن دولة أو رمز...', noResults: 'لا توجد نتائج', phonePlaceholder: 'أدخل رقم الهاتف', fullNumberPreview: 'الرقم الكامل:' },
  eoi: {
    modalTitle: 'إبداء الاهتمام',
    fullNameLabel: 'الاسم الكامل', fullNamePlaceholder: 'أدخل اسمك الكامل',
    emailLabel: 'عنوان البريد الإلكتروني', emailPlaceholder: 'أدخل بريدك الإلكتروني',
    phoneLabel: 'رقم الهاتف', fullNumber: 'الرقم الكامل:',
    investorTypeLabel: 'نوع المستثمر',
    individualLabel: 'مستثمر فردي', individualDesc: 'شخص واحد يستثمر بشكل مستقل',
    businessLabel: 'مستثمر أعمال', businessDesc: 'شركة أو مؤسسة استثمارية',
    institutionalLabel: 'مستثمر مؤسسي', institutionalDesc: 'مؤسسة كبيرة أو منظمة',
    foundingCircleQuestion: 'هل أنت مهتم بأن تُؤخذ بعين الاعتبار لدائرة مؤسسي CoBuild من المستثمرين؟',
    yesOption: 'نعم، أود أن أُؤخذ بعين الاعتبار', noOption: 'لا، شكراً',
    whyInterestedLabel: 'يرجى إخبارنا بسبب اهتمامك',
    whyInterestedPlaceholder: 'شارك اهتمامك وخبرتك ذات الصلة...',
    linkedinLabel: 'ملف LinkedIn', linkedinOptional: '(اختياري)',
    linkedinPlaceholder: 'https://linkedin.com/in/yourprofile',
    consentText: 'أوافق على جمع ومعالجة بياناتي الشخصية لغرض تقييم اهتمامي كمستثمر.',
    privacyPolicyLink: 'عرض سياسة الخصوصية',
    cancelButton: 'إلغاء', submitButton: 'إرسال', submittingButton: 'جارٍ الإرسال...',
  },
};

const EN = {
  alert: { successTitle: 'Success!', errorTitle: 'Error', gotIt: 'Got it!', close: 'Close' },
  header: { logoAlt: 'Co build logo', switchLabel: 'AR', toggleTheme: 'Toggle theme', login: 'Login' },
  landing: {
    letsText: "Let's", coText: 'Co', buildText: 'Build', theWorld: 'THE WORLD',
    eoiTagline: 'Submit an Expression of Interest to be considered for early access',
    submitEoiButton: 'Submit Expression of Interest',
    videoBrowserNotSupported: 'Your browser does not support the video tag.',
    glassBossAlt: 'Glass boss',
  },
  validation: {
    fullNameRequired: 'Full Name Required', fullNameRequiredDesc: 'Please enter your full name to continue.',
    emailRequired: 'Email Required', emailRequiredDesc: 'Please enter your email address to continue.',
    invalidEmail: 'Invalid Email', invalidEmailDesc: 'Please enter a valid email address.',
    phoneRequired: 'Phone Number Required', phoneRequiredDesc: 'Please enter your phone number to continue.',
    investorTypeRequired: 'Investor Type Required', investorTypeRequiredDesc: 'Please select an investor type to continue.',
    responseRequired: 'Response Required', responseRequiredDesc: "Please answer if you're interested in the Founding Circle.",
    messageRequired: 'Message Required', messageRequiredDesc: "Please tell us why you're interested in the Founding Circle.",
    consentRequired: 'Consent Required', consentRequiredDesc: 'Please provide your consent to proceed with the submission.',
  },
  submit: {
    successMessage: 'Submitted Successfully!',
    successDescription: "We've received your Expression of Interest. Our team will be in touch soon.",
    failedMessage: 'Submission Failed', somethingWrong: 'Something went wrong. Please try again.',
    networkError: 'Network Error', networkErrorDesc: 'Failed to submit. Please check your connection and try again.',
  },
  phone: { searchPlaceholder: 'Search country or code...', noResults: 'No results', phonePlaceholder: 'Enter phone number', fullNumberPreview: 'Full number:' },
  eoi: {
    modalTitle: 'Expression of Interest',
    fullNameLabel: 'Full Name', fullNamePlaceholder: 'Enter your full name',
    emailLabel: 'Email Address', emailPlaceholder: 'Enter your email',
    phoneLabel: 'Phone Number', fullNumber: 'Full number:',
    investorTypeLabel: 'Investor Type',
    individualLabel: 'Individual Investor', individualDesc: 'A single person investing independently',
    businessLabel: 'Business Investor', businessDesc: 'A company or investment firm',
    institutionalLabel: 'Institutional Investor', institutionalDesc: 'A large institution or organization',
    foundingCircleQuestion: "Are you interested in being considered for CoBuild's Founding Circle of Investors?",
    yesOption: 'Yes, I would like to be considered', noOption: 'No, thank you',
    whyInterestedLabel: "Please tell us why you're interested",
    whyInterestedPlaceholder: 'Share your interest and relevant experience...',
    linkedinLabel: 'LinkedIn Profile', linkedinOptional: '(Optional)',
    linkedinPlaceholder: 'https://linkedin.com/in/yourprofile',
    consentText: 'I consent to the collection and processing of my personal data for the purpose of evaluating my interest as an investor.',
    privacyPolicyLink: 'View our Privacy Policy',
    cancelButton: 'Cancel', submitButton: 'Submit', submittingButton: 'Submitting...',
  },
};

// ==================== CUSTOM ALERT ====================
interface CustomAlertProps {
  type: 'success' | 'error';
  message: string;
  description?: string;
  onClose: () => void;
  t: typeof EN;
}

const CustomAlert: React.FC<CustomAlertProps> = ({ type, message, description, onClose, t }) => {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-fadeIn">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl animate-slideUp">
        <div className={`p-6 rounded-t-2xl ${type === 'success' ? 'bg-[#ef6b23]/10' : 'bg-red-50'}`}>
          <div className="flex items-center gap-4">
            {type === 'success' ? (
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-[#ef6b23] flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            ) : (
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-red-500 flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
            )}
            <div className="flex-1">
              <h3 className={`text-lg font-bold ${type === 'success' ? 'text-[#ef6b23]' : 'text-red-900'}`}>
                {type === 'success' ? t.alert.successTitle : t.alert.errorTitle}
              </h3>
              <p className={`text-sm mt-1 ${type === 'success' ? 'text-[#ef6b23]/80' : 'text-red-700'}`}>
                {message}
              </p>
            </div>
          </div>
        </div>

        {description && (
          <div className="px-6 py-4 border-t border-gray-100">
            <p className="text-sm text-gray-600">{description}</p>
          </div>
        )}

        <div className="p-4 bg-gray-50 rounded-b-2xl">
          <button
            onClick={onClose}
            className={`w-full py-3 rounded-lg font-semibold transition-colors cursor-pointer ${
              type === 'success'
                ? 'bg-[#ef6b23] hover:bg-[#d85a1a] text-white'
                : 'bg-red-500 hover:bg-red-600 text-white'
            }`}
          >
            {type === 'success' ? t.alert.gotIt : t.alert.close}
          </button>
        </div>
      </div>
    </div>
  );
};

// ==================== BUTTON COMPONENT ====================
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground shadow hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
        outline: "border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-8",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

// ==================== INPUT COMPONENT ====================
const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

// ==================== COUNTRY CODES ====================
const COUNTRY_CODES = [
  { code: '+971', flag: '🇦🇪', name: 'AE - UAE' },
  { code: '+966', flag: '🇸🇦', name: 'SA - Saudi Arabia' },
  { code: '+974', flag: '🇶🇦', name: 'QA - Qatar' },
  { code: '+965', flag: '🇰🇼', name: 'KW - Kuwait' },
  { code: '+973', flag: '🇧🇭', name: 'BH - Bahrain' },
  { code: '+968', flag: '🇴🇲', name: 'OM - Oman' },
  { code: '+91',  flag: '🇮🇳', name: 'IN - India' },
  { code: '+1',   flag: '🇺🇸', name: 'US - United States' },
  { code: '+1',   flag: '🇨🇦', name: 'CA - Canada' },
  { code: '+44',  flag: '🇬🇧', name: 'GB - United Kingdom' },
  { code: '+49',  flag: '🇩🇪', name: 'DE - Germany' },
  { code: '+33',  flag: '🇫🇷', name: 'FR - France' },
  { code: '+61',  flag: '🇦🇺', name: 'AU - Australia' },
  { code: '+65',  flag: '🇸🇬', name: 'SG - Singapore' },
  { code: '+81',  flag: '🇯🇵', name: 'JP - Japan' },
  { code: '+86',  flag: '🇨🇳', name: 'CN - China' },
  { code: '+55',  flag: '🇧🇷', name: 'BR - Brazil' },
  { code: '+27',  flag: '🇿🇦', name: 'ZA - South Africa' },
  { code: '+20',  flag: '🇪🇬', name: 'EG - Egypt' },
  { code: '+234', flag: '🇳🇬', name: 'NG - Nigeria' },
  { code: '+7',   flag: '🇷🇺', name: 'RU - Russia' },
  { code: '+82',  flag: '🇰🇷', name: 'KR - South Korea' },
  { code: '+39',  flag: '🇮🇹', name: 'IT - Italy' },
  { code: '+34',  flag: '🇪🇸', name: 'ES - Spain' },
  { code: '+31',  flag: '🇳🇱', name: 'NL - Netherlands' },
  { code: '+90',  flag: '🇹🇷', name: 'TR - Turkey' },
  { code: '+92',  flag: '🇵🇰', name: 'PK - Pakistan' },
  { code: '+880', flag: '🇧🇩', name: 'BD - Bangladesh' },
  { code: '+94',  flag: '🇱🇰', name: 'LK - Sri Lanka' },
  { code: '+60',  flag: '🇲🇾', name: 'MY - Malaysia' },
];

// ==================== PHONE INPUT ====================
interface PhoneInputProps {
  value: string;
  countryCode: string;
  onValueChange: (val: string) => void;
  onCountryChange: (code: string, flag: string, name: string) => void;
  disabled?: boolean;
  t: typeof EN;
}

const PhoneInput: React.FC<PhoneInputProps> = ({
  value,
  countryCode,
  onValueChange,
  onCountryChange,
  disabled,
  t,
}) => {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState('');
  const ref = React.useRef<HTMLDivElement>(null);

  const filtered = COUNTRY_CODES.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.code.includes(search)
  );

  const selected = COUNTRY_CODES.find((c) => c.code === countryCode) || COUNTRY_CODES[0];

  React.useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setSearch('');
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div
      className="flex w-full h-[48px] rounded-lg border border-gray-300 overflow-visible focus-within:ring-2 focus-within:ring-[#ef6b23] focus-within:border-transparent"
      ref={ref}
    >
      {/* Country Code Selector */}
      <div className="relative flex-shrink-0">
        <button
          type="button"
          disabled={disabled}
          onClick={() => setOpen((p) => !p)}
          className="h-full px-3 flex items-center gap-1.5 bg-gray-50 border-r border-gray-300 hover:bg-gray-100 transition-colors rounded-l-lg disabled:cursor-not-allowed disabled:opacity-50 min-w-[88px]"
        >
          <span className="text-base leading-none">{selected.flag}</span>
          <span className="text-sm font-medium text-gray-700">{countryCode}</span>
          <svg
            className={`w-3 h-3 text-gray-500 flex-shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {/* Dropdown */}
        {open && (
          <div className="absolute top-[calc(100%+4px)] left-0 z-[300] w-[240px] bg-white border border-gray-200 rounded-xl shadow-2xl overflow-hidden">
            <div className="p-2 border-b border-gray-100 sticky top-0 bg-white">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t.phone.searchPlaceholder}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ef6b23] focus:border-transparent"
                autoFocus
              />
            </div>
            <ul className="max-h-[200px] overflow-y-auto">
              {filtered.length === 0 ? (
                <li className="px-4 py-3 text-sm text-gray-400 text-center">{t.phone.noResults}</li>
              ) : (
                filtered.map((c, i) => (
                  <li key={`${c.code}-${c.name}-${i}`}>
                    <button
                      type="button"
                      onClick={() => {
                        onCountryChange(c.code, c.flag, c.name);
                        setOpen(false);
                        setSearch('');
                      }}
                      className={`w-full text-left px-3 py-2.5 flex items-center gap-3 hover:bg-[#ef6b23]/10 transition-colors text-sm ${
                        countryCode === c.code ? 'bg-[#ef6b23]/5 font-semibold' : ''
                      }`}
                    >
                      <span className="text-base leading-none">{c.flag}</span>
                      <span className="text-gray-700 flex-1 truncate">{c.name}</span>
                      <span className="text-gray-400 text-xs font-mono flex-shrink-0">{c.code}</span>
                    </button>
                  </li>
                ))
              )}
            </ul>
          </div>
        )}
      </div>

      {/* Phone Number Input */}
      <input
        type="tel"
        value={value}
        disabled={disabled}
        onChange={(e) => onValueChange(e.target.value.replace(/[^0-9\s\-]/g, ''))}
        placeholder={t.phone.phonePlaceholder}
        className="flex-1 h-full px-3 text-sm text-gray-900 bg-white rounded-r-lg focus:outline-none disabled:bg-gray-100 disabled:cursor-not-allowed placeholder:text-gray-400 min-w-0"
      />
    </div>
  );
};

// ==================== MAIN DESIGN COMPONENT ====================
export const Design = (): React.JSX.Element => {
  const locale   = useLocale();
  const router   = useRouter();
  const pathname = usePathname();

  // ✅ English uses hardcoded EN, Arabic uses AR — no JSON files needed
  const t = locale === 'ar' ? AR : EN;
  const isArabic = locale === 'ar';

  const [showModal, setShowModal] = React.useState(false);
  const [isWhiteTheme, setIsWhiteTheme] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isVideoPlaying, setIsVideoPlaying] = React.useState(false);
  const [ripples, setRipples] = React.useState<Array<{ x: number; y: number; id: number }>>([]);
  const [alert, setAlert] = React.useState<{
    show: boolean;
    type: 'success' | 'error';
    message: string;
    description?: string;
  }>({
    show: false,
    type: 'success',
    message: '',
  });

  const [formData, setFormData] = React.useState({
    fullName: "",
    email: "",
    phone: "",
    countryCode: "+971",
    countryFlag: "🇦🇪",
    investorType: "",
    interestedInCircle: "",
    message: "",
    linkedinProfile: "",
    consentGiven: false,
  });

  const videoRef = React.useRef<HTMLVideoElement>(null);
  const API_BASE_URL = "https://cobuild-simulator-backend.onrender.com/api/v1";

  // ✅ Language switcher via next-intl router
  const handleLanguageSwitch = () => {
    const nextLocale = isArabic ? 'en' : 'ar';
    router.replace(pathname, { locale: nextLocale });
  };

  // Handle image click with ripple effect
  const handleImageClick = (e: React.MouseEvent<HTMLDivElement>) => {
    console.log("🎬 Image clicked - Starting video...");

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const id = Date.now();

    setRipples((prev) => [...prev, { x, y, id }]);
    setTimeout(() => {
      setRipples((prev) => prev.filter((ripple) => ripple.id !== id));
    }, 600);

    setIsVideoPlaying(true);

    setTimeout(() => {
      if (videoRef.current) {
        videoRef.current
          .play()
          .then(() => console.log("✅ Video playing successfully"))
          .catch((err) => console.error('❌ Video play failed:', err));
      }
    }, 50);
  };

  // ✅ SUBMIT HANDLER
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    console.log("=== FORM SUBMISSION STARTED ===");
    console.log("Current Form Data:", formData);

    if (!formData.fullName || !formData.fullName.trim()) {
      setAlert({ show: true, type: 'error', message: t.validation.fullNameRequired, description: t.validation.fullNameRequiredDesc });
      return;
    }

    if (!formData.email || !formData.email.trim()) {
      setAlert({ show: true, type: 'error', message: t.validation.emailRequired, description: t.validation.emailRequiredDesc });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setAlert({ show: true, type: 'error', message: t.validation.invalidEmail, description: t.validation.invalidEmailDesc });
      return;
    }

    if (!formData.phone || !formData.phone.trim()) {
      setAlert({ show: true, type: 'error', message: t.validation.phoneRequired, description: t.validation.phoneRequiredDesc });
      return;
    }

    if (!formData.investorType) {
      setAlert({ show: true, type: 'error', message: t.validation.investorTypeRequired, description: t.validation.investorTypeRequiredDesc });
      return;
    }

    if (!formData.interestedInCircle) {
      setAlert({ show: true, type: 'error', message: t.validation.responseRequired, description: t.validation.responseRequiredDesc });
      return;
    }

    if (formData.interestedInCircle === 'yes' && !formData.message.trim()) {
      setAlert({ show: true, type: 'error', message: t.validation.messageRequired, description: t.validation.messageRequiredDesc });
      return;
    }

    if (!formData.consentGiven) {
      setAlert({ show: true, type: 'error', message: t.validation.consentRequired, description: t.validation.consentRequiredDesc });
      return;
    }

    console.log("✅ All validations passed");
    setIsSubmitting(true);

    try {
      const eoiData: any = {
        fullName: formData.fullName.trim(),
        email: formData.email.trim(),
        phoneNumber: `${formData.countryCode}${formData.phone.trim()}`,
        investorType: formData.investorType,
        foundingCircleOptIn: formData.interestedInCircle === 'yes',
        consentGiven: true,
        consentVersion: "1.0",
      };

      if (formData.interestedInCircle === 'yes' && formData.message.trim()) {
        eoiData.interestReason = formData.message.trim();
      }

      if (formData.linkedinProfile.trim()) {
        eoiData.linkedinProfile = formData.linkedinProfile.trim();
      }

      console.log("📤 Full EOI Data Object:", JSON.stringify(eoiData, null, 2));

      const response = await fetch(`${API_BASE_URL}/user/eoi/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(eoiData),
      });

      const result = await response.json();
      console.log("📥 Response Data:", JSON.stringify(result, null, 2));

      if (response.ok && result.success) {
        console.log("✅ SUCCESS: Form submitted successfully");
        setAlert({
          show: true,
          type: 'success',
          message: t.submit.successMessage,
          description: t.submit.successDescription,
        });
        setShowModal(false);
        setFormData({
          fullName: "", email: "", phone: "",
          countryCode: "+971", countryFlag: "🇦🇪",
          investorType: "", interestedInCircle: "",
          message: "", linkedinProfile: "", consentGiven: false,
        });
        console.log("✅ Form reset completed");
      } else {
        console.error("❌ API ERROR:", result);
        setAlert({
          show: true,
          type: 'error',
          message: t.submit.failedMessage,
          description: result.message || t.submit.somethingWrong,
        });
      }
    } catch (error: any) {
      console.error("❌ SUBMISSION ERROR:", error);
      setAlert({
        show: true,
        type: 'error',
        message: t.submit.networkError,
        description: t.submit.networkErrorDesc,
      });
    } finally {
      setIsSubmitting(false);
      console.log("=== FORM SUBMISSION ENDED ===");
    }
  };

  return (
    <>
      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes ripple {
          0% {
            transform: scale(0);
            opacity: 0.6;
          }
          100% {
            transform: scale(4);
            opacity: 0;
          }
        }
        @keyframes tapRippleExpand {
          0% {
            transform: translate(-50%, -50%) scale(0.4);
            opacity: 1;
          }
          70% {
            opacity: 0.3;
          }
          100% {
            transform: translate(-50%, -50%) scale(1.8);
            opacity: 0;
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }
        .tap-ripple {
          animation: tapRippleExpand 2s ease-out infinite;
        }
        .tap-ripple:nth-child(1) { animation-delay: 0s; }
        .tap-ripple:nth-child(2) { animation-delay: 0.6s; }
        .tap-ripple:nth-child(3) { animation-delay: 1.2s; }
        @media (max-width: 768px) {
          .mobile-snap-container {
            height: 100vh;
            height: 100dvh;
            overflow-y: scroll;
            scroll-snap-type: y mandatory;
            scroll-behavior: smooth;
            -webkit-overflow-scrolling: touch;
          }
          .mobile-snap-section {
            min-height: 100vh;
            min-height: 100dvh;
            scroll-snap-align: start;
            scroll-snap-stop: always;
          }
        }
      `}</style>

      {/* Custom Alert */}
      {alert.show && (
        <CustomAlert
          type={alert.type}
          message={alert.message}
          description={alert.description}
          onClose={() => setAlert({ ...alert, show: false })}
          t={t}
        />
      )}

      {/* MAIN CONTAINER */}
      <div
        className={`mobile-snap-container transition-colors duration-500 ${
          isWhiteTheme ? "bg-white" : "bg-black"
        } md:overflow-x-hidden md:w-full md:min-h-screen`}
        dir={isArabic ? 'rtl' : 'ltr'}
      >
        {/* ===== SECTION 1: Header + Building ===== */}
        <section className="mobile-snap-section md:min-h-0 md:h-auto flex flex-col">
          {/* Header */}
          <header className="flex w-full max-w-[1363px] mx-auto items-center justify-between px-4 sm:px-4 md:px-6 lg:px-6 xl:px-2 2xl:max-w-full 2xl:px-16 py-2 md:py-3 lg:py-4 relative z-10">
            <div className="flex flex-col w-[120px] sm:w-[140px] md:w-[180px] lg:w-[200px] items-start">
              <img
                className="relative w-full h-auto object-contain transition-all duration-500"
                alt={t.header.logoAlt}
                src={isWhiteTheme ? "/Co-build-logo-02-1.png" : "/co-build-logo-01-1.png"}
              />
            </div>

            {/* Right side buttons */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* ✅ Language Toggle */}
              <button
                onClick={handleLanguageSwitch}
                className={`relative w-9 h-9 sm:w-10 sm:h-10 md:w-11 md:h-11 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 cursor-pointer group ${
                  isWhiteTheme
                    ? "bg-gray-800 hover:bg-gray-700"
                    : "bg-white/10 hover:bg-white/20 border border-white/30"
                }`}
                aria-label="Switch language"
                title={isArabic ? 'Switch to English' : 'Switch to Arabic'}
              >
                <svg
                  className="w-5 h-5 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
                  />
                </svg>
                <span
                  className={`absolute -bottom-1 -right-1 text-[8px] sm:text-[9px] font-bold px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 ${
                    isWhiteTheme ? "bg-white text-gray-800" : "bg-white/90 text-gray-800"
                  }`}
                >
                  {t.header.switchLabel}
                </span>
              </button>

              {/* Theme Toggle */}
              {/* <button
                onClick={() => setIsWhiteTheme(!isWhiteTheme)}
                className={`w-9 h-9 sm:w-10 sm:h-10 md:w-11 md:h-11 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 cursor-pointer ${
                  isWhiteTheme
                    ? "bg-gray-800 hover:bg-gray-700"
                    : "bg-white/10 hover:bg-white/20 border border-white/30"
                }`}
                aria-label={t.header.toggleTheme}
              >
                {isWhiteTheme ? (
                  <svg className="w-5 h-5 text-yellow-300" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </button> */}

              {/* Login Button */}
              <Button
                onClick={() => router.push('/login-page')}
                className="w-auto sm:w-[100px] md:w-[110px] h-[32px] sm:h-[40px] md:h-[44px] gap-2 px-3 sm:px-5 md:px-6 py-1.5 bg-[#ef6b23] rounded-[10px] md:rounded-[12px] overflow-hidden hover:bg-[#ef6b23]/90 cursor-pointer"
              >
                <div className="relative w-fit text-white text-xs sm:text-sm md:text-base font-semibold [font-family:'Manrope',Helvetica] text-center whitespace-nowrap">
                  {t.header.login}
                </div>
              </Button>
            </div>
          </header>

          {/* Building Image / Video */}
          <div className="flex-1 flex items-center justify-center px-4 min-h-[60vh] sm:min-h-[65vh] md:min-h-0">
            <div className="relative w-full max-w-[440px] sm:max-w-[500px] md:max-w-[420px] lg:max-w-[480px] xl:max-w-[500px]">

              {/* Image Layer */}
              <div
                onClick={handleImageClick}
                className={`relative w-full cursor-pointer transition-opacity duration-700 ${
                  isVideoPlaying ? 'opacity-0' : 'opacity-100'
                }`}
                style={{ pointerEvents: isVideoPlaying ? 'none' : 'auto' }}
              >
                <img
                  className="w-full h-auto object-contain hover:scale-105 transition-transform duration-300"
                  alt={t.landing.glassBossAlt}
                  src="/glass-boss-111-2.png"
                />

                {/* Expanding Circular Ripples */}
                {!isVideoPlaying && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="absolute">
                      <div className="tap-ripple absolute w-16 h-16 rounded-full border-[3px] border-white -translate-x-1/2 -translate-y-1/2 left-1/2 top-1/2"></div>
                      <div className="tap-ripple absolute w-16 h-16 rounded-full border-[3px] border-white -translate-x-1/2 -translate-y-1/2 left-1/2 top-1/2"></div>
                      <div className="tap-ripple absolute w-16 h-16 rounded-full border-[3px] border-white -translate-x-1/2 -translate-y-1/2 left-1/2 top-1/2"></div>
                    </div>
                  </div>
                )}
              </div>

              {/* Video Layer */}
              <div
                className={`absolute inset-0 flex items-center justify-center transition-opacity duration-700 ${
                  isVideoPlaying ? 'opacity-100' : 'opacity-0'
                }`}
                style={{ pointerEvents: isVideoPlaying ? 'auto' : 'none' }}
              >
                <video
                  key={isWhiteTheme ? 'white' : 'black'}
                  ref={videoRef}
                  loop
                  muted
                  playsInline
                  preload="auto"
                  className="w-[60%] h-auto object-contain"
                  src={isWhiteTheme ? "/building1white.mp4" : "/building1.mp4"}
                >
                  {t.landing.videoBrowserNotSupported}
                </video>
              </div>
            </div>
          </div>
        </section>

        {/* ===== SECTION 2: Content ===== */}
        <section className="mobile-snap-section md:min-h-0 md:h-auto flex flex-col justify-end md:justify-start pb-safe">
          {/* Tokenization Section */}
          <div className="w-full max-w-[1400px] mx-auto flex flex-col md:flex-row items-center justify-center gap-3 md:gap-0 px-4 mt-3 md:mt-4 lg:mt-6">
            <video
              key={isWhiteTheme ? 'white' : 'black'}
              autoPlay
              loop
              muted
              playsInline
              className="w-full max-w-[350px] sm:max-w-[420px]"
              src={isWhiteTheme ? "/secondbuildingwhite.mp4" : "/secondbuilding.mp4"}
            >
              {t.landing.videoBrowserNotSupported}
            </video>

            {/* Text */}
            <div className="w-full max-w-[500px] lg:max-w-[550px] xl:max-w-[600px] 2xl:max-w-[650px] text-center md:text-left md:ml-4 lg:ml-6 xl:ml-8 2xl:ml-10">
              <h2
                className={`[font-family:'Satoshi-Bold',Helvetica] font-bold leading-tight transition-colors duration-500 ${
                  isWhiteTheme ? "text-black" : "text-white"
                }`}
              >
                <span className="block text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl 2xl:text-6xl">
                  {t.landing.letsText}{" "}
                  <span className="text-[#ef6b23]">{t.landing.coText}</span>
                  <span className={isWhiteTheme ? "text-black" : "text-white"}>{t.landing.buildText}</span>
                </span>
                <span className="block text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl 2xl:text-7xl uppercase">
                  {t.landing.theWorld}
                </span>
              </h2>
            </div>
          </div>

          {/* Expression of Interest Section */}
          <div className="w-full flex flex-col items-center justify-center gap-4 md:gap-5 px-4 mt-8 md:mt-10 lg:mt-12 pb-8 md:pb-10 lg:pb-12">
            <h3
              className={`[font-family:'Satoshi-Bold',Helvetica] font-bold text-sm sm:text-base md:text-lg lg:text-xl text-center leading-tight transition-colors duration-500 max-w-[90%] md:max-w-[80%] lg:max-w-[70%] ${
                isWhiteTheme ? 'text-black' : 'text-white'
              }`}
            >
              {t.landing.eoiTagline}
            </h3>

            <Button
              onClick={() => setShowModal(true)}
              className="w-auto px-5 sm:px-7 md:px-8 py-2.5 md:py-3 h-auto bg-[#ef6b23] rounded-[12px] md:rounded-[14px] overflow-hidden hover:bg-[#ef6b23]/90 shadow-lg transition-all hover:scale-105 cursor-pointer"
            >
              <div className="relative w-fit [font-family:'Satoshi-Bold',Helvetica] font-bold text-white text-sm md:text-base lg:text-lg text-center whitespace-nowrap">
                {t.landing.submitEoiButton}
              </div>
            </Button>
          </div>
        </section>

        {/* ===== MODAL FORM ===== */}
        {showModal && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-white rounded-2xl w-full max-w-[600px] max-h-[90vh] overflow-y-auto relative my-4">
              <button
                onClick={() => setShowModal(false)}
                disabled={isSubmitting}
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-2xl font-bold w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer z-10"
              >
                ×
              </button>

              <form onSubmit={handleSubmit} className="p-6 md:p-8">
                <h2 className="[font-family:'Satoshi-Bold',Helvetica] font-bold text-black text-2xl md:text-3xl mb-6 text-center">
                  {t.eoi.modalTitle}
                </h2>

                {/* Full Name */}
                <div className="mb-4">
                  <label className="block [font-family:'Satoshi-Medium',Helvetica] font-medium text-black text-sm mb-2">
                    {t.eoi.fullNameLabel} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    disabled={isSubmitting}
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="w-full h-[48px] px-4 py-3 rounded-lg border border-gray-300 [font-family:'Satoshi-Regular',Helvetica] text-black focus:outline-none focus:ring-2 focus:ring-[#ef6b23] focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed placeholder:text-gray-400"
                    placeholder={t.eoi.fullNamePlaceholder}
                  />
                </div>

                {/* Email Address */}
                <div className="mb-4">
                  <label className="block [font-family:'Satoshi-Medium',Helvetica] font-medium text-black text-sm mb-2">
                    {t.eoi.emailLabel} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    disabled={isSubmitting}
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full h-[48px] px-4 py-3 rounded-lg border border-gray-300 [font-family:'Satoshi-Regular',Helvetica] text-black focus:outline-none focus:ring-2 focus:ring-[#ef6b23] focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed placeholder:text-gray-400"
                    placeholder={t.eoi.emailPlaceholder}
                  />
                </div>

                {/* Phone Number */}
                <div className="mb-4">
                  <label className="block [font-family:'Satoshi-Medium',Helvetica] font-medium text-black text-sm mb-2">
                    {t.eoi.phoneLabel} <span className="text-red-500">*</span>
                  </label>
                  <PhoneInput
                    value={formData.phone}
                    countryCode={formData.countryCode}
                    onValueChange={(val) => setFormData({ ...formData, phone: val })}
                    onCountryChange={(code, flag, name) =>
                      setFormData({ ...formData, countryCode: code, countryFlag: flag })
                    }
                    disabled={isSubmitting}
                    t={t}
                  />
                  {/* Preview of full number */}
                  {formData.phone && (
                    <p className="text-xs text-gray-400 mt-1 ml-1">
                      {t.phone.fullNumberPreview}{' '}
                      <span className="font-mono text-gray-600">{formData.countryCode}{formData.phone}</span>
                    </p>
                  )}
                </div>

                {/* Investor Type */}
                <div className="mb-6">
                  <label className="block [font-family:'Satoshi-Medium',Helvetica] font-medium text-black text-sm mb-3">
                    {t.eoi.investorTypeLabel} <span className="text-red-500">*</span>
                  </label>
                  <div className="space-y-3">
                    {[
                      { label: t.eoi.individualLabel, value: 'INDIVIDUAL', desc: t.eoi.individualDesc },
                      { label: t.eoi.businessLabel,   value: 'BUSINESS',   desc: t.eoi.businessDesc },
                      { label: t.eoi.institutionalLabel, value: 'INSTITUTIONAL', desc: t.eoi.institutionalDesc },
                    ].map((type) => (
                      <label
                        key={type.value}
                        className={`flex items-start cursor-pointer p-3 rounded-lg border-2 transition-all duration-200 ${
                          formData.investorType === type.value
                            ? 'border-[#ef6b23] bg-[#ef6b23]/5'
                            : 'border-gray-200 hover:border-[#ef6b23]/50 hover:bg-gray-50'
                        } ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        <input
                          type="radio"
                          name="investorType"
                          value={type.value}
                          disabled={isSubmitting}
                          checked={formData.investorType === type.value}
                          onChange={(e) => setFormData({ ...formData, investorType: e.target.value })}
                          className="w-5 h-5 mt-0.5 text-[#ef6b23] focus:ring-[#ef6b23] cursor-pointer disabled:cursor-not-allowed flex-shrink-0"
                          required
                        />
                        <div className="ml-3">
                          <span className="[font-family:'Satoshi-Medium',Helvetica] font-medium text-black text-sm">
                            {type.label}
                          </span>
                          <p className="text-xs text-gray-400 mt-0.5">{type.desc}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Founding Circle Question */}
                <div className="mb-6">
                  <label className="block [font-family:'Satoshi-Medium',Helvetica] font-medium text-black text-sm mb-3">
                    {t.eoi.foundingCircleQuestion}{' '}
                    <span className="text-red-500">*</span>
                  </label>
                  <div className="space-y-3">
                    <label className="flex items-center cursor-pointer group">
                      <input
                        type="radio"
                        name="foundingCircle"
                        value="yes"
                        disabled={isSubmitting}
                        checked={formData.interestedInCircle === 'yes'}
                        onChange={(e) => setFormData({ ...formData, interestedInCircle: e.target.value })}
                        className="w-5 h-5 text-[#ef6b23] focus:ring-[#ef6b23] cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
                        required
                      />
                      <span className="ml-3 [font-family:'Satoshi-Regular',Helvetica] text-black text-base group-hover:text-[#ef6b23] transition-colors">
                        {t.eoi.yesOption}
                      </span>
                    </label>
                    <label className="flex items-center cursor-pointer group">
                      <input
                        type="radio"
                        name="foundingCircle"
                        value="no"
                        disabled={isSubmitting}
                        checked={formData.interestedInCircle === 'no'}
                        onChange={(e) =>
                          setFormData({ ...formData, interestedInCircle: e.target.value, message: '' })
                        }
                        className="w-5 h-5 text-[#ef6b23] focus:ring-[#ef6b23] cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
                        required
                      />
                      <span className="ml-3 [font-family:'Satoshi-Regular',Helvetica] text-black text-base group-hover:text-[#ef6b23] transition-colors">
                        {t.eoi.noOption}
                      </span>
                    </label>
                  </div>
                </div>

                {/* Message Box - Only shows when "Yes" is selected */}
                {formData.interestedInCircle === 'yes' && (
                  <div className="mb-6">
                    <label className="block [font-family:'Satoshi-Medium',Helvetica] font-medium text-black text-sm mb-2">
                      {t.eoi.whyInterestedLabel} <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      required
                      value={formData.message}
                      disabled={isSubmitting}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="w-full h-[120px] px-4 py-3 rounded-lg border border-gray-300 [font-family:'Satoshi-Regular',Helvetica] text-black focus:outline-none focus:ring-2 focus:ring-[#ef6b23] focus:border-transparent resize-none disabled:bg-gray-100 disabled:cursor-not-allowed placeholder:text-gray-400"
                      placeholder={t.eoi.whyInterestedPlaceholder}
                    />
                  </div>
                )}

                {/* LinkedIn Profile — Optional */}
                <div className="mb-6">
                  <label className="block [font-family:'Satoshi-Medium',Helvetica] font-medium text-black text-sm mb-2">
                    {t.eoi.linkedinLabel}{' '}
                    <span className="text-gray-400 font-normal text-xs ml-1">{t.eoi.linkedinOptional}</span>
                  </label>
                  <div className="relative">
                    {/* LinkedIn Icon */}
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="w-5 h-5 text-[#0077B5]" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                      </svg>
                    </div>
                    <input
                      type="url"
                      disabled={isSubmitting}
                      value={formData.linkedinProfile}
                      onChange={(e) => setFormData({ ...formData, linkedinProfile: e.target.value })}
                      className="w-full h-[48px] pl-11 pr-4 py-3 rounded-lg border border-gray-300 [font-family:'Satoshi-Regular',Helvetica] text-black focus:outline-none focus:ring-2 focus:ring-[#ef6b23] focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed placeholder:text-gray-400 text-sm"
                      placeholder={t.eoi.linkedinPlaceholder}
                    />
                  </div>
                </div>

                {/* Consent Checkbox with Privacy Policy Link */}
                <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <label className="flex items-start cursor-pointer">
                    <input
                      type="checkbox"
                      required
                      disabled={isSubmitting}
                      checked={formData.consentGiven}
                      onChange={(e) => setFormData({ ...formData, consentGiven: e.target.checked })}
                      className="w-5 h-5 mt-0.5 rounded border-gray-300 text-[#ef6b23] focus:ring-[#ef6b23] cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 flex-shrink-0"
                    />
                    <span className="ml-3 [font-family:'Satoshi-Regular',Helvetica] text-black text-sm leading-relaxed">
                      {t.eoi.consentText}{' '}
                      <span className="text-red-500">*</span>
                      <br />
                      {/* Privacy Policy Link */}
                      <a
                        href="/privacy-policy"
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex items-center gap-1 text-[#ef6b23] hover:text-[#d85a1a] hover:underline font-medium mt-1.5 transition-colors text-xs"
                      >
                        <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                          />
                        </svg>
                        {t.eoi.privacyPolicyLink}
                      </a>
                    </span>
                  </label>
                </div>

                {/* Submit Buttons */}
                <div className="flex gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    disabled={isSubmitting}
                    className="flex-1 h-[50px] bg-gray-200 text-black hover:bg-gray-300 rounded-lg [font-family:'Satoshi-Bold',Helvetica] font-bold disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer text-sm"
                  >
                    {t.eoi.cancelButton}
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting || !formData.consentGiven}
                    className="flex-1 h-[50px] bg-[#ef6b23] text-white hover:bg-[#d85a1a] rounded-lg [font-family:'Satoshi-Bold',Helvetica] font-bold disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 cursor-pointer text-sm"
                  >
                    {isSubmitting ? (
                      <>
                        <svg
                          className="animate-spin h-5 w-5 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        {t.eoi.submittingButton}
                      </>
                    ) : (
                      t.eoi.submitButton
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Design;
