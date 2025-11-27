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

// ==================== SOCIAL LINKS DATA ====================
const socialLinks = [
  {
    name: "Discord",
    icon: "/discord-symbol-blurple-1.png",
    iconClass: "w-[32.09px] h-[24.31px]",
  },
  {
    name: "Linkedin",
    icon: "/li-in-bug-1.png",
    iconClass: "w-[28.32px] h-[24.08px]",
  },
  {
    name: "Instagram",
    icon: "/instagram-icon-1.png",
    iconClass: "w-[26.18px] h-[26.18px]",
  },
  {
    name: "TikTok",
    icon: "/tiktok-icon-black-square-1.png",
    iconClass: "w-[37.4px] h-[37.4px]",
  },
];

// ==================== MAIN DESIGN COMPONENT ====================
export const Design = (): React.JSX.Element => {
  const [isWhiteTheme, setIsWhiteTheme] = React.useState(false);
  const [sliderPosition, setSliderPosition] = React.useState(0);
  const [isDragging, setIsDragging] = React.useState(false);
  const sliderRef = React.useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = React.useState(false);

  // Detect mobile device
  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Handle slider drag (Mobile)
  const handleSliderStart = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isMobile) return;
    setIsDragging(true);
  };

  const handleSliderMove = (e: MouseEvent | TouchEvent) => {
    if (!isDragging || !sliderRef.current) return;

    const slider = sliderRef.current;
    const sliderRect = slider.getBoundingClientRect();
    const buttonWidth = window.innerWidth < 640 ? 100 : 146;
    const maxPosition = sliderRect.width - buttonWidth - 10;

    let clientX = 0;
    if (e instanceof MouseEvent) {
      clientX = e.clientX;
    } else if (e instanceof TouchEvent) {
      clientX = e.touches[0].clientX;
    }

    let newPosition = clientX - sliderRect.left - buttonWidth / 2;
    newPosition = Math.max(0, Math.min(newPosition, maxPosition));
    setSliderPosition(newPosition);

    // Check if slider reached the end
    if (newPosition >= maxPosition - 10) {
      setIsDragging(false);
      setTimeout(() => {
        setIsWhiteTheme(true);
      }, 300);
    }
  };

  const handleSliderEnd = () => {
    setIsDragging(false);
    if (!isWhiteTheme) {
      setSliderPosition(0);
    }
  };

  React.useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleSliderMove);
      window.addEventListener('mouseup', handleSliderEnd);
      window.addEventListener('touchmove', handleSliderMove);
      window.addEventListener('touchend', handleSliderEnd);

      return () => {
        window.removeEventListener('mousemove', handleSliderMove);
        window.removeEventListener('mouseup', handleSliderEnd);
        window.removeEventListener('touchmove', handleSliderMove);
        window.removeEventListener('touchend', handleSliderEnd);
      };
    }
  }, [isDragging, isWhiteTheme]);

  // Handle click toggle (Desktop/Laptop)
  const handleSliderClick = () => {
    if (isMobile) return;
    setIsWhiteTheme(!isWhiteTheme);
  };

  // Reset slider position when toggling back
  React.useEffect(() => {
    if (!isWhiteTheme) {
      setSliderPosition(0);
    }
  }, [isWhiteTheme]);

  return (
    <div 
      className={`overflow-x-hidden w-full min-h-screen relative transition-colors duration-700 ease-in-out ${
        isWhiteTheme ? 'bg-white' : 'bg-black'
      }`}
    >
      {/* Header - Responsive */}
      <header className="flex w-full max-w-[1363px] mx-auto items-center justify-between px-4 sm:px-6 md:px-10 py-6 md:py-[54px] relative z-10">
        <div className="flex flex-col w-[150px] sm:w-[200px] md:w-[291px] items-start">
          <img
            className="relative w-full h-auto object-contain transition-all duration-700"
            alt="Co build logo"
            src="/co-build-logo-01-1.png"
            style={{
              filter: isWhiteTheme ? 'invert(1) brightness(0)' : 'invert(0)',
            }}
          />
        </div>

        <Button 
  onClick={() => window.location.href = '/about'}
  className="w-auto sm:w-[137px] h-[40px] sm:h-[52px] gap-2 px-4 sm:px-8 py-1.5 bg-[#ef6b23] rounded-[15px] overflow-hidden hover:bg-[#ef6b23]/90"
>
  <div className="relative w-fit text-white text-sm sm:text-lg font-semibold [font-family:'Manrope',Helvetica] text-center whitespace-nowrap">
    Know More
  </div>
</Button>
      </header>

      {/* Building Image - Responsive */}
      <div className="w-full flex justify-center px-4 mt-8 md:mt-0">
        <img
          className="w-full max-w-[350px] sm:max-w-[500px] md:max-w-[600px] lg:max-w-[792px] h-auto object-contain"
          alt="Glass boss"
          src="/glass-boss-111-2.png"
        />
      </div>

      {/* Slider - Responsive with drag/click functionality */}
      <div className="w-full flex justify-center px-4 mt-8 md:mt-12">
        <div 
          ref={sliderRef}
          className="relative w-full max-w-[350px] sm:max-w-[450px] md:max-w-[581px] h-[60px] md:h-[74px]"
        >
          <div className={`absolute inset-0 rounded-[50px] md:rounded-[63.79px] border border-solid transition-colors duration-700 ${
            isWhiteTheme ? 'border-gray-400 bg-[linear-gradient(180deg,rgba(200,200,200,0.3)_0%,rgba(180,180,180,0.3)_100%)]' : 'border-[#888888] bg-[linear-gradient(180deg,rgba(148,148,148,0.3)_0%,rgba(132,132,132,0.3)_100%)]'
          }`} />

          <div className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 [font-family:'Dubai-Bold',Helvetica] font-bold text-[#ef6b23] text-xl sm:text-2xl md:text-3xl whitespace-nowrap transition-opacity duration-300 ${
            sliderPosition > 50 ? 'opacity-0' : 'opacity-100'
          }`}>
            {isMobile ? 'Swipe Now' : 'Click to Toggle'}
          </div>

          <div 
            className="absolute top-1/2 transform -translate-y-1/2 w-[100px] sm:w-[120px] md:w-[146px] h-[50px] md:h-16 flex items-center justify-center rounded-[50px] md:rounded-[63.79px] shadow-[0px_0px_8.1px_#00000066] bg-[linear-gradient(180deg,rgba(239,107,35,1)_0%,rgba(220,98,32,1)_100%)] cursor-pointer select-none"
            style={{
              left: isMobile ? `${sliderPosition + 5}px` : '5px',
              transition: isDragging ? 'none' : 'left 0.3s ease'
            }}
            onMouseDown={handleSliderStart}
            onTouchStart={handleSliderStart}
            onClick={handleSliderClick}
          >
            <span className="text-white text-2xl">
              {isWhiteTheme ? '✓' : '→'}
            </span>
          </div>
        </div>
      </div>

      {/* Tokenization Section - Responsive */}
      <div className="w-full flex flex-col md:flex-row items-center justify-center gap-6 md:gap-0 px-4 mt-16 md:mt-24">
        <img
          className="w-full max-w-[350px] sm:max-w-[500px] md:max-w-[600px] lg:max-w-[810.47px] h-auto object-contain"
          alt="Many building"
          src="/many-building-landscape-png-1.png"
        />

        <div className="w-full max-w-[600px] lg:max-w-[708px] md:ml-[-42px] text-center md:text-left">
          <h2 className={`[font-family:'Satoshi-Bold',Helvetica] font-bold text-2xl sm:text-3xl md:text-4xl lg:text-[52.5px] leading-tight transition-colors duration-700 ${
            isWhiteTheme ? 'text-black' : 'text-white'
          }`}>
            Real Estate Investments through Tokenization{" "}
            <span className="text-[#ef6b23]">Real Estate Democratized</span>
          </h2>
        </div>
      </div>

      {/* Coming Soon Section - Responsive */}
      <div className="w-full text-center px-4 mt-16 md:mt-24 lg:mt-32">
        <h2 className="[font-family:'Satoshi-Bold',Helvetica] font-bold text-[#ef6b23] text-4xl sm:text-5xl md:text-6xl lg:text-[70px] tracking-tight">
          COMING SOON
        </h2>
      </div>

      {/* Community Section - Responsive */}
      <div className="w-full flex flex-col items-center justify-center gap-8 md:gap-12 px-4 mt-12 md:mt-16">
        <div className="flex flex-col items-center gap-6 w-full max-w-[752px]">
          <h3 className={`[font-family:'Satoshi-Bold',Helvetica] font-bold text-xl sm:text-2xl md:text-3xl lg:text-[35px] text-center leading-tight transition-colors duration-700 ${
            isWhiteTheme ? 'text-black' : 'text-white'
          }`}>
            Join Our Community for the latest updates
          </h3>

          {/* Social Buttons - Responsive Grid */}
          <div className="grid grid-cols-2 md:flex md:flex-wrap items-center justify-center gap-3 md:gap-4 w-full max-w-[598px]">
            {socialLinks.map((social) => (
              <Button
                key={social.name}
                variant="outline"
                className={`flex items-center justify-center gap-2 px-3 md:px-[14.02px] py-2 md:py-[5.61px] h-auto md:h-[50.62px] rounded-[14.02px] border bg-transparent [font-family:'Satoshi-Bold',Helvetica] font-bold text-sm md:text-[18.7px] transition-colors duration-700 ${
                  isWhiteTheme 
                    ? 'border-black text-black hover:bg-black/10' 
                    : 'border-white text-white hover:bg-white/10'
                }`}
              >
                <img
                  className={`relative ${social.iconClass} object-cover`}
                  alt={`${social.name} icon`}
                  src={social.icon}
                />
                <span className="whitespace-nowrap">{social.name}</span>
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Email Form Section - Responsive */}
      <div className="w-full flex flex-col items-center gap-4 md:gap-6 px-4 mt-12 md:mt-16 pb-12 md:pb-16">
        <h4 className={`[font-family:'Satoshi-Bold',Helvetica] font-bold text-xl sm:text-2xl md:text-3xl text-center max-w-[714px] leading-tight transition-colors duration-700 ${
          isWhiteTheme ? 'text-black' : 'text-white'
        }`}>
          Register your email to get updates about the launch
        </h4>

        <div className="flex flex-col sm:flex-row items-center gap-4 w-full max-w-[714px]">
          <div className="flex-1 w-full">
            <div className={`flex h-[51px] items-center gap-2.5 px-4 md:px-[17px] py-[15px] rounded-[10px] border border-solid w-full transition-colors duration-700 ${
              isWhiteTheme ? 'border-gray-400' : 'border-white'
            }`}>
              <Input
                type="email"
                placeholder="Enter Your email here"
                className={`w-full h-auto border-0 bg-transparent p-0 [font-family:'Satoshi-Regular',Helvetica] font-normal text-base md:text-lg focus-visible:ring-0 focus-visible:ring-offset-0 transition-colors duration-700 ${
                  isWhiteTheme 
                    ? 'text-black placeholder:text-gray-500' 
                    : 'text-[#dfdfdf] placeholder:text-[#dfdfdf]'
                }`}
              />
            </div>
          </div>

          <Button className="w-full sm:w-[137px] h-[52px] gap-2 px-8 py-1.5 bg-[#ef6b23] rounded-[15px] overflow-hidden hover:bg-[#ef6b23]/90">
            <div className="relative w-fit [font-family:'Satoshi-Bold',Helvetica] font-bold text-white text-lg text-center whitespace-nowrap">
              Notify Me
            </div>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Design;