"use client";

import { Slot } from "@radix-ui/react-slot";
import { type VariantProps, cva } from "class-variance-authority";
import * as React from "react";

// Utility function for className merging
function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(" ");
}

// ==================== CUSTOM ALERT/TOAST COMPONENT ====================
interface CustomAlertProps {
  type: 'success' | 'error';
  message: string;
  description?: string;
  onClose: () => void;
}

const CustomAlert: React.FC<CustomAlertProps> = ({ type, message, description, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-fadeIn">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl animate-slideUp">
        <div className={`p-6 rounded-t-2xl ${type === 'success' ? 'bg-green-50' : 'bg-red-50'}`}>
          <div className="flex items-center gap-4">
            {type === 'success' ? (
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-green-500 flex items-center justify-center">
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
              <h3 className={`text-lg font-bold ${type === 'success' ? 'text-green-900' : 'text-red-900'}`}>
                {type === 'success' ? 'Success!' : 'Error'}
              </h3>
              <p className={`text-sm mt-1 ${type === 'success' ? 'text-green-700' : 'text-red-700'}`}>
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
                ? 'bg-green-500 hover:bg-green-600 text-white'
                : 'bg-red-500 hover:bg-red-600 text-white'
            }`}
          >
            Close
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
        destructive:
          "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
        outline:
          "border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",
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

// ==================== MAIN DESIGN COMPONENT ====================
export const Design = (): React.JSX.Element => {
  const [showModal, setShowModal] = React.useState(false);
  const [isWhiteTheme, setIsWhiteTheme] = React.useState(false);
  const [language, setLanguage] = React.useState<'en' | 'ar'>('en');
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [alert, setAlert] = React.useState<{show: boolean; type: 'success' | 'error'; message: string; description?: string}>({
    show: false,
    type: 'success',
    message: ''
  });
  const [formData, setFormData] = React.useState({
    fullName: "",
    email: "",
    phone: "",
    investorType: "",
    interestedInCircle: "",
    message: "",
    consentGiven: false,
  });

  // Get API URL from environment variable
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

  const handleLanguageSwitch = (lang: 'en' | 'ar') => {
    setLanguage(lang);
    
    if (lang === 'ar') {
      window.location.href = "/LandingArabic";
    }
    
    console.log('Switching to:', lang === 'en' ? 'English' : 'Arabic');
  };

  // ✅ UPDATED SUBMIT HANDLER WITH BETTER ALERTS
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log("=== FORM SUBMISSION STARTED ===");
    console.log("Current Form Data:", formData);
    
    // ENHANCED FORM VALIDATION
    if (!formData.fullName || !formData.fullName.trim()) {
      console.error("❌ Validation Failed: Full Name is empty");
      setAlert({
        show: true,
        type: 'error',
        message: 'Full Name Required',
        description: 'Please enter your full name to continue.'
      });
      return;
    }

    if (!formData.email || !formData.email.trim()) {
      console.error("❌ Validation Failed: Email is empty");
      setAlert({
        show: true,
        type: 'error',
        message: 'Email Required',
        description: 'Please enter your email address to continue.'
      });
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      console.error("❌ Validation Failed: Invalid email format");
      setAlert({
        show: true,
        type: 'error',
        message: 'Invalid Email',
        description: 'Please enter a valid email address.'
      });
      return;
    }

    if (!formData.phone || !formData.phone.trim()) {
      console.error("❌ Validation Failed: Phone is empty");
      setAlert({
        show: true,
        type: 'error',
        message: 'Phone Number Required',
        description: 'Please enter your phone number to continue.'
      });
      return;
    }

    if (!formData.investorType) {
      console.error("❌ Validation Failed: Investor Type not selected");
      setAlert({
        show: true,
        type: 'error',
        message: 'Investor Type Required',
        description: 'Please select an investor type to continue.'
      });
      return;
    }

    if (!formData.interestedInCircle) {
      console.error("❌ Validation Failed: Founding Circle option not selected");
      setAlert({
        show: true,
        type: 'error',
        message: 'Response Required',
        description: "Please answer if you're interested in the Founding Circle."
      });
      return;
    }

    // Validate message when user selects 'yes'
    if (formData.interestedInCircle === 'yes' && !formData.message.trim()) {
      console.error("❌ Validation Failed: Message required for 'yes' selection");
      setAlert({
        show: true,
        type: 'error',
        message: 'Message Required',
        description: "Please tell us why you're interested in the Founding Circle."
      });
      return;
    }

    // Validate consent checkbox
    if (!formData.consentGiven) {
      console.error("❌ Validation Failed: Consent not given");
      setAlert({
        show: true,
        type: 'error',
        message: 'Consent Required',
        description: 'Please provide your consent to proceed with the submission.'
      });
      return;
    }

    console.log("✅ All validations passed");

    setIsSubmitting(true);
    
    try {
      // Prepare data for API
      const eoiData: any = {
        fullName: formData.fullName.trim(),
        email: formData.email.trim(),
        phoneNumber: formData.phone.trim(),
        investorType: formData.investorType,
        foundingCircleOptIn: formData.interestedInCircle === 'yes',
        consentGiven: true,
        consentVersion: "1.0"
      };

      // Only add interestReason if user selected "yes" and provided a message
      if (formData.interestedInCircle === 'yes' && formData.message.trim()) {
        eoiData.interestReason = formData.message.trim();
      }

      console.log("📤 Full EOI Data Object:", JSON.stringify(eoiData, null, 2));

      // Validate API_BASE_URL exists
      if (!API_BASE_URL) {
        console.error("❌ API_BASE_URL is not defined in environment variables");
        setAlert({
          show: true,
          type: 'error',
          message: 'Configuration Error',
          description: 'API URL not found. Please contact support.'
        });
        setIsSubmitting(false);
        return;
      }

      // Call API
      console.log("🚀 Making API call...");
      const response = await fetch(`${API_BASE_URL}/user/eoi/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(eoiData)
      });

      const result = await response.json();
      console.log("📥 Response Data:", JSON.stringify(result, null, 2));
      
      if (response.ok && result.success) {
        console.log("✅ SUCCESS: Form submitted successfully");
        setAlert({
          show: true,
          type: 'success',
          message: 'Submitted Successfully!',
          description: "We've received your Expression of Interest. Our team will be in touch soon."
        });
        setShowModal(false);
        // Reset form
        setFormData({
          fullName: "",
          email: "",
          phone: "",
          investorType: "",
          interestedInCircle: "",
          message: "",
          consentGiven: false,
        });
        console.log("✅ Form reset completed");
      } else {
        // Handle API error
        console.error("❌ API ERROR:", result);
        const errorMessage = result.message || 'Something went wrong. Please try again.';
        setAlert({
          show: true,
          type: 'error',
          message: 'Submission Failed',
          description: errorMessage
        });
      }
    } catch (error: any) {
      console.error("❌ SUBMISSION ERROR:", error);
      setAlert({
        show: true,
        type: 'error',
        message: 'Network Error',
        description: 'Failed to submit. Please check your connection and try again.'
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
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }
      `}</style>

      {/* Custom Alert */}
      {alert.show && (
        <CustomAlert
          type={alert.type}
          message={alert.message}
          description={alert.description}
          onClose={() => setAlert({ ...alert, show: false })}
        />
      )}

      <div
        className={`overflow-x-hidden w-full min-h-screen transition-colors duration-500 ${
          isWhiteTheme ? "bg-white" : "bg-black"
        }`}
      >
        {/* Header - Reduced padding */}
        <header className="flex w-full max-w-[1363px] mx-auto items-center justify-between px-4 sm:px-4 md:px-6 lg:px-6 xl:px-2 2xl:px-1 py-2 md:py-3 lg:py-4 relative z-10">
          <div className="flex flex-col w-[120px] sm:w-[140px] md:w-[180px] lg:w-[200px] items-start">
            <img
              className="relative w-full h-auto object-contain transition-all duration-500"
              alt="Co build logo"
              src={isWhiteTheme ? "/Co-build-logo-02-1.png" : "/co-build-logo-01-1.png"}
            />
          </div>

          {/* Right side buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Language Toggle Switch */}
            <div className={`relative flex items-center gap-1 px-1 py-1 rounded-full transition-all duration-300 ${
              isWhiteTheme 
                ? "bg-gray-800" 
                : "bg-white/10 border border-white/30"
            }`}>
              <button
                onClick={() => handleLanguageSwitch('en')}
                className={`relative z-10 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-semibold transition-all duration-300 ${
                  language === 'en'
                    ? 'text-white'
                    : isWhiteTheme
                    ? 'text-gray-400 hover:text-gray-200'
                    : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                EN
              </button>
              <button
                onClick={() => handleLanguageSwitch('ar')}
                className={`relative z-10 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-semibold transition-all duration-300 ${
                  language === 'ar'
                    ? 'text-white'
                    : isWhiteTheme
                    ? 'text-gray-400 hover:text-gray-200'
                    : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                AR
              </button>
              {/* Active indicator */}
              <div
                className={`absolute top-1 bottom-1 bg-gradient-to-r from-[#EF6B23] to-[#E4782C] rounded-full transition-all duration-300 ${
                  language === 'en' 
                    ? 'left-1 w-[calc(50%-4px)]' 
                    : 'right-1 w-[calc(50%-4px)]'
                }`}
              />
            </div>

            {/* Theme Toggle Button */}
            <button
              onClick={() => setIsWhiteTheme(!isWhiteTheme)}
              className={`w-9 h-9 sm:w-10 sm:h-10 md:w-11 md:h-11 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 ${
                isWhiteTheme
                  ? "bg-gray-800 hover:bg-gray-700"
                  : "bg-white/10 hover:bg-white/20 border border-white/30"
              }`}
              aria-label="Toggle theme"
            >
              {isWhiteTheme ? (
                <svg
                  className="w-5 h-5 md:w-5 md:h-5 text-yellow-300"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                </svg>
              ) : (
                <svg
                  className="w-5 h-5 md:w-5 md:h-5 text-yellow-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </button>

            {/* Login Button */}
            <Button
              onClick={() => (window.location.href = "/OnboardingPage1")}
              className="w-auto sm:w-[100px] md:w-[110px] h-[32px] sm:h-[40px] md:h-[44px] gap-2 px-3 sm:px-5 md:px-6 py-1.5 bg-[#ef6b23] rounded-[10px] md:rounded-[12px] overflow-hidden hover:bg-[#ef6b23]/90"
            >
              <div className="relative w-fit text-white text-xs sm:text-sm md:text-base font-semibold [font-family:'Manrope',Helvetica] text-center whitespace-nowrap">
                Login
              </div>
            </Button>
          </div>
        </header>

        {/* Building Image - More Compact for desktop */}
        <div className="w-full flex justify-center px-4 mt-1 md:mt-2">
          <img
            className="w-full max-w-[280px] sm:max-w-[350px] md:max-w-[420px] lg:max-w-[480px] xl:max-w-[500px] h-auto object-contain"
            alt="Glass boss"
            src="/glass-boss-111-2.png"
          />
        </div>

        {/* Tokenization Section - Reduced gap */}
        <div className="w-full flex flex-col md:flex-row items-center justify-center gap-3 md:gap-0 px-4 mt-3 md:mt-4 lg:mt-6">
          <img
            className="w-full max-w-[280px] sm:max-w-[350px] md:max-w-[420px] lg:max-w-[500px] xl:max-w-[550px] h-auto object-contain"
            alt="Many building"
            src="/many-building-landscape-png-1.png"
          />

          <div className="w-full max-w-[500px] lg:max-w-[550px] md:ml-[-30px] lg:ml-[-20px] text-center md:text-left">
            <h2 className={`[font-family:'Satoshi-Bold',Helvetica] font-bold leading-tight transition-colors duration-500 ${
              isWhiteTheme ? "text-black" : "text-white"
            }`}>
              <span className="block text-base sm:text-lg md:text-xl lg:text-2xl xl:text-3xl uppercase">
                LET'S{" "}
                <span className="text-[#ef6b23]">CO</span>
                <span className={isWhiteTheme ? "text-black" : "text-white"}>BUILD</span>
              </span>
              <span className="block text-2xl sm:text-3xl md:text-3xl lg:text-4xl xl:text-5xl">
                THE WORLD
              </span>
            </h2>
          </div>
        </div>

        {/* Expression of Interest Section - Reduced spacing */}
        <div className="w-full flex flex-col items-center justify-center gap-4 md:gap-5 px-4 mt-8 md:mt-10 lg:mt-12 pb-8 md:pb-10 lg:pb-12">
          <h3 className={`[font-family:'Satoshi-Bold',Helvetica] font-bold text-sm sm:text-base md:text-lg lg:text-xl text-center leading-tight transition-colors duration-500 max-w-[90%] md:max-w-[80%] lg:max-w-[70%] ${
            isWhiteTheme ? 'text-black' : 'text-white'
          }`}>
            Submit an Expression of Interest to be considered for early access
          </h3>

          <Button 
            onClick={() => setShowModal(true)}
            className="w-auto px-5 sm:px-7 md:px-8 py-2.5 md:py-3 h-auto bg-[#ef6b23] rounded-[12px] md:rounded-[14px] overflow-hidden hover:bg-[#ef6b23]/90 shadow-lg transition-all hover:scale-105 cursor-pointer"
          >
            <div className="relative w-fit [font-family:'Satoshi-Bold',Helvetica] font-bold text-white text-sm md:text-base lg:text-lg text-center whitespace-nowrap">
              Submit Expression of Interest
            </div>
          </Button>
        </div>

        {/* Modal Popup */}
        {showModal && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-white rounded-2xl w-full max-w-[600px] max-h-[90vh] overflow-y-auto relative">
              <button
                onClick={() => setShowModal(false)}
                disabled={isSubmitting}
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-2xl font-bold w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                ×
              </button>

              <form onSubmit={handleSubmit} className="p-6 md:p-8">
                <h2 className="[font-family:'Satoshi-Bold',Helvetica] font-bold text-black text-2xl md:text-3xl mb-6 text-center">
                  Expression of Interest
                </h2>

                {/* Full Name */}
                <div className="mb-4">
                  <label className="block [font-family:'Satoshi-Medium',Helvetica] font-medium text-black text-sm mb-2">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    disabled={isSubmitting}
                    value={formData.fullName}
                    onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                    className="w-full h-[48px] px-4 py-3 rounded-lg border border-gray-300 [font-family:'Satoshi-Regular',Helvetica] text-black focus:outline-none focus:ring-2 focus:ring-[#ef6b23] focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                    placeholder="Enter your full name"
                  />
                </div>

                {/* Email Address */}
                <div className="mb-4">
                  <label className="block [font-family:'Satoshi-Medium',Helvetica] font-medium text-black text-sm mb-2">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    disabled={isSubmitting}
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full h-[48px] px-4 py-3 rounded-lg border border-gray-300 [font-family:'Satoshi-Regular',Helvetica] text-black focus:outline-none focus:ring-2 focus:ring-[#ef6b23] focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                    placeholder="Enter your email"
                  />
                </div>

                {/* Phone Number */}
                <div className="mb-4">
                  <label className="block [font-family:'Satoshi-Medium',Helvetica] font-medium text-black text-sm mb-2">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    disabled={isSubmitting}
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="w-full h-[48px] px-4 py-3 rounded-lg border border-gray-300 [font-family:'Satoshi-Regular',Helvetica] text-black focus:outline-none focus:ring-2 focus:ring-[#ef6b23] focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                    placeholder="Enter your phone number"
                  />
                </div>

                {/* Investor Type with 3 options */}
                <div className="mb-6">
                  <label className="block [font-family:'Satoshi-Medium',Helvetica] font-medium text-black text-sm mb-3">
                    Investor Type <span className="text-red-500">*</span>
                  </label>
                  <div className="space-y-3">
                    {[
                      { label: 'Solo Investor', value: 'SOLO_INVESTOR' },
                      { label: 'Investment Entity', value: 'INVESTMENT_ENTITY' },
                      { label: 'Organization', value: 'ORGANIZATION' }
                    ].map((type) => (
                      <label key={type.value} className="flex items-center cursor-pointer">
                        <input
                          type="radio"
                          name="investorType"
                          value={type.value}
                          disabled={isSubmitting}
                          checked={formData.investorType === type.value}
                          onChange={(e) => setFormData({
                            ...formData, 
                            investorType: e.target.value
                          })}
                          className="w-5 h-5 text-[#ef6b23] focus:ring-[#ef6b23] cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
                          required
                        />
                        <span className="ml-3 [font-family:'Satoshi-Regular',Helvetica] text-black text-base">
                          {type.label}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Founding Circle Question */}
                <div className="mb-6">
                  <label className="block [font-family:'Satoshi-Medium',Helvetica] font-medium text-black text-sm mb-3">
                    Are you interested in being considered for CoBuild's Founding Circle of Investors? <span className="text-red-500">*</span>
                  </label>
                  <div className="space-y-3">
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        name="foundingCircle"
                        value="yes"
                        disabled={isSubmitting}
                        checked={formData.interestedInCircle === 'yes'}
                        onChange={(e) => setFormData({
                          ...formData, 
                          interestedInCircle: e.target.value
                        })}
                        className="w-5 h-5 text-[#ef6b23] focus:ring-[#ef6b23] cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
                        required
                      />
                      <span className="ml-3 [font-family:'Satoshi-Regular',Helvetica] text-black text-base">
                        Yes, I would like to be considered
                      </span>
                    </label>
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        name="foundingCircle"
                        value="no"
                        disabled={isSubmitting}
                        checked={formData.interestedInCircle === 'no'}
                        onChange={(e) => setFormData({
                          ...formData, 
                          interestedInCircle: e.target.value,
                          message: ''
                        })}
                        className="w-5 h-5 text-[#ef6b23] focus:ring-[#ef6b23] cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
                        required
                      />
                      <span className="ml-3 [font-family:'Satoshi-Regular',Helvetica] text-black text-base">
                        No, thank you
                      </span>
                    </label>
                  </div>
                </div>

                {/* Message Box - Only shows when "Yes" is selected */}
                {formData.interestedInCircle === 'yes' && (
                  <div className="mb-6">
                    <label className="block [font-family:'Satoshi-Medium',Helvetica] font-medium text-black text-sm mb-2">
                      Please tell us why you're interested <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      required
                      value={formData.message}
                      disabled={isSubmitting}
                      onChange={(e) => setFormData({...formData, message: e.target.value})}
                      className="w-full h-[120px] px-4 py-3 rounded-lg border border-gray-300 [font-family:'Satoshi-Regular',Helvetica] text-black focus:outline-none focus:ring-2 focus:ring-[#ef6b23] focus:border-transparent resize-none disabled:bg-gray-100 disabled:cursor-not-allowed"
                      placeholder="Share your interest and relevant experience..."
                    />
                  </div>
                )}

                {/* ✅ Consent Checkbox */}
                <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <label className="flex items-start cursor-pointer">
                    <input
                      type="checkbox"
                      required
                      disabled={isSubmitting}
                      checked={formData.consentGiven}
                      onChange={(e) => setFormData({...formData, consentGiven: e.target.checked})}
                      className="w-5 h-5 mt-0.5 rounded border-gray-300 text-[#ef6b23] focus:ring-[#ef6b23] cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
                    />
                    <span className="ml-3 [font-family:'Satoshi-Regular',Helvetica] text-black text-sm leading-relaxed">
                      I consent to the collection and processing of my personal data for the purpose of evaluating my interest as an investor. <span className="text-red-500">*</span>
                    </span>
                  </label>
                </div>

                {/* ✅ Submit Buttons with cursor-pointer and disabled state */}
                <div className="flex gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    disabled={isSubmitting}
                    className="flex-1 h-[50px] bg-gray-200 text-black hover:bg-gray-300 rounded-lg [font-family:'Satoshi-Bold',Helvetica] font-bold disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting || !formData.consentGiven}
                    className="flex-1 h-[50px] bg-[#ef6b23] text-white hover:bg-[#ef6b23]/90 rounded-lg [font-family:'Satoshi-Bold',Helvetica] font-bold disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {isSubmitting ? (
                      <>
                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Submitting...
                      </>
                    ) : (
                      'Submit'
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
