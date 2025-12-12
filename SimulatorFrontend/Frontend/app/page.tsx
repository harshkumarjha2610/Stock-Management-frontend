"use client";

import { Slot } from "@radix-ui/react-slot";
import { type VariantProps, cva } from "class-variance-authority";
import * as React from "react";

// Utility function for className merging
function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}

// ==================== BUTTON COMPONENT ====================
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow hover:bg-primary/90",
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
  },
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
  },
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
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";

// ==================== MAIN DESIGN COMPONENT ====================
export const Design = (): React.JSX.Element => {
  const [showModal, setShowModal] = React.useState(false);
  const [isWhiteTheme, setIsWhiteTheme] = React.useState(false);
  const [formData, setFormData] = React.useState({
    fullName: '',
    email: '',
    phone: '',
    investorType: '',
    interestedInCircle: '',
    message: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    alert('Expression of Interest submitted successfully!');
    setShowModal(false);
    setFormData({
      fullName: '',
      email: '',
      phone: '',
      investorType: '',
      interestedInCircle: '',
      message: ''
    });
  };

  return (
    <div className={`overflow-x-hidden w-full min-h-screen transition-colors duration-500 ${
      isWhiteTheme ? 'bg-white' : 'bg-black'
    }`}>
      
      {/* Header - Compact with Icon-Only Theme Toggle */}
      <header className="flex w-full max-w-[1363px] mx-auto items-center justify-between px-4 sm:px-6 md:px-10 py-4 md:py-6 relative z-10">
        <div className="flex flex-col w-[120px] sm:w-[160px] md:w-[220px] items-start">
          <img
            className="relative w-full h-auto object-contain transition-all duration-500"
            alt="Co build logo"
            src="/co-build-logo-01-1.png"
            style={{
              filter: isWhiteTheme ? 'invert(1) brightness(0)' : 'invert(0)',
            }}
          />
        </div>

        {/* Right side buttons */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Minimal Icon-Only Theme Toggle Button */}
          <button
            onClick={() => setIsWhiteTheme(!isWhiteTheme)}
            className={`w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 ${
              isWhiteTheme 
                ? 'bg-gray-800 hover:bg-gray-700' 
                : 'bg-white/10 hover:bg-white/20 border border-white/30'
            }`}
            aria-label="Toggle theme"
          >
            {isWhiteTheme ? (
              // Moon icon for dark theme
              <svg 
                className="w-5 h-5 md:w-6 md:h-6 text-yellow-300" 
                fill="currentColor" 
                viewBox="0 0 20 20"
              >
                <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
              </svg>
            ) : (
              // Sun icon for light theme
              <svg 
                className="w-5 h-5 md:w-6 md:h-6 text-yellow-400" 
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
            onClick={() => window.location.href = '/SimulatorDashboardF3'}
            className="w-auto sm:w-[110px] md:w-[120px] h-[36px] sm:h-[44px] md:h-[48px] gap-2 px-3 sm:px-6 md:px-7 py-1.5 bg-[#ef6b23] rounded-[10px] md:rounded-[12px] overflow-hidden hover:bg-[#ef6b23]/90"
          >
            <div className="relative w-fit text-white text-xs sm:text-base md:text-lg font-semibold [font-family:'Manrope',Helvetica] text-center whitespace-nowrap">
              Login
            </div>
          </Button>
        </div>
      </header>

      {/* Building Image - Compact */}
      <div className="w-full flex justify-center px-4 mt-2 md:mt-4">
        <img
          className="w-full max-w-[280px] sm:max-w-[400px] md:max-w-[550px] lg:max-w-[650px] h-auto object-contain"
          alt="Glass boss"
          src="/glass-boss-111-2.png"
        />
      </div>

      {/* Tokenization Section - Compact */}
      <div className="w-full flex flex-col md:flex-row items-center justify-center gap-4 md:gap-0 px-4 mt-6 md:mt-10">
        <img
          className="w-full max-w-[280px] sm:max-w-[380px] md:max-w-[500px] lg:max-w-[650px] h-auto object-contain"
          alt="Many building"
          src="/many-building-landscape-png-1.png"
        />

        <div className="w-full max-w-[500px] lg:max-w-[600px] md:ml-[-30px] text-center md:text-left">
          <h2 className={`[font-family:'Satoshi-Bold',Helvetica] font-bold text-lg sm:text-2xl md:text-3xl lg:text-[40px] leading-tight transition-colors duration-500 ${
            isWhiteTheme ? 'text-black' : 'text-white'
          }`}>
            Real Estate Investments through Tokenization{" "}
            <span className="text-[#ef6b23]">Real Estate Democratized</span>
          </h2>
        </div>
      </div>

      {/* Expression of Interest Section */}
      <div className="w-full flex flex-col items-center justify-center gap-5 md:gap-6 px-4 mt-12 md:mt-16 pb-12 md:pb-16">
        <h3 className={`[font-family:'Satoshi-Bold',Helvetica] font-bold text-xl sm:text-2xl md:text-3xl lg:text-[32px] text-center leading-tight transition-colors duration-500 ${
          isWhiteTheme ? 'text-black' : 'text-white'
        }`}>
          Submit an Expression of Interest
        </h3>

        <Button 
          onClick={() => setShowModal(true)}
          className="w-auto px-6 sm:px-8 md:px-10 py-3 md:py-3.5 h-auto bg-[#ef6b23] rounded-[12px] md:rounded-[15px] overflow-hidden hover:bg-[#ef6b23]/90 shadow-lg transition-all hover:scale-105"
        >
          <div className="relative w-fit [font-family:'Satoshi-Bold',Helvetica] font-bold text-white text-base md:text-lg text-center whitespace-nowrap">
            Submit Expression of Interest
          </div>
        </Button>
      </div>

      {/* Modal Popup */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-[600px] max-h-[90vh] overflow-y-auto relative">
            {/* Close Button */}
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-2xl font-bold w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100"
            >
              ×
            </button>

            {/* Form */}
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
                  value={formData.fullName}
                  onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                  className="w-full h-[48px] px-4 py-3 rounded-lg border border-gray-300 [font-family:'Satoshi-Regular',Helvetica] text-black focus:outline-none focus:ring-2 focus:ring-[#ef6b23] focus:border-transparent"
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
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full h-[48px] px-4 py-3 rounded-lg border border-gray-300 [font-family:'Satoshi-Regular',Helvetica] text-black focus:outline-none focus:ring-2 focus:ring-[#ef6b23] focus:border-transparent"
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
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className="w-full h-[48px] px-4 py-3 rounded-lg border border-gray-300 [font-family:'Satoshi-Regular',Helvetica] text-black focus:outline-none focus:ring-2 focus:ring-[#ef6b23] focus:border-transparent"
                  placeholder="Enter your phone number"
                />
              </div>

              {/* Investor Type - Checkboxes */}
              <div className="mb-6">
                <label className="block [font-family:'Satoshi-Medium',Helvetica] font-medium text-black text-sm mb-3">
                  Investor Type <span className="text-red-500">*</span>
                </label>
                <div className="space-y-3">
                  {['Organization', 'Investment Entity', 'Solo Investor'].map((type) => (
                    <label key={type} className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.investorType === type}
                        onChange={(e) => setFormData({
                          ...formData, 
                          investorType: e.target.checked ? type : ''
                        })}
                        className="w-5 h-5 rounded border-gray-300 text-[#ef6b23] focus:ring-[#ef6b23] cursor-pointer"
                      />
                      <span className="ml-3 [font-family:'Satoshi-Regular',Helvetica] text-black text-base">
                        {type}
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
                      checked={formData.interestedInCircle === 'yes'}
                      onChange={(e) => setFormData({
                        ...formData, 
                        interestedInCircle: e.target.value
                      })}
                      className="w-5 h-5 text-[#ef6b23] focus:ring-[#ef6b23] cursor-pointer"
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
                      checked={formData.interestedInCircle === 'no'}
                      onChange={(e) => setFormData({
                        ...formData, 
                        interestedInCircle: e.target.value,
                        message: ''
                      })}
                      className="w-5 h-5 text-[#ef6b23] focus:ring-[#ef6b23] cursor-pointer"
                      required
                    />
                    <span className="ml-3 [font-family:'Satoshi-Regular',Helvetica] text-black text-base">
                      No, thank you
                    </span>
                  </label>
                </div>
              </div>

              {/* Message Box - Shown only if "Yes" is selected */}
              {formData.interestedInCircle === 'yes' && (
                <div className="mb-6">
                  <label className="block [font-family:'Satoshi-Medium',Helvetica] font-medium text-black text-sm mb-2">
                    Please tell us why you're interested
                  </label>
                  <textarea
                    value={formData.message}
                    onChange={(e) => setFormData({...formData, message: e.target.value})}
                    className="w-full h-[120px] px-4 py-3 rounded-lg border border-gray-300 [font-family:'Satoshi-Regular',Helvetica] text-black focus:outline-none focus:ring-2 focus:ring-[#ef6b23] focus:border-transparent resize-none"
                    placeholder="Share your interest and relevant experience..."
                  />
                </div>
              )}

              {/* Submit Button */}
              <div className="flex gap-3 mt-6">
                <Button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 h-[50px] bg-gray-200 text-black hover:bg-gray-300 rounded-lg [font-family:'Satoshi-Bold',Helvetica] font-bold"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1 h-[50px] bg-[#ef6b23] text-white hover:bg-[#ef6b23]/90 rounded-lg [font-family:'Satoshi-Bold',Helvetica] font-bold"
                >
                  Submit
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Design;
