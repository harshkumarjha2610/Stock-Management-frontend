'use client';
import React, { JSX } from "react";
import { Slot } from "@radix-ui/react-slot";
import { type VariantProps, cva } from "class-variance-authority";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { HeaderSection } from "@/app/[locale]/Investordashboard/sections/HeaderSection";

// ============ UTILITIES ============
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ============ BUTTON COMPONENT ============
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

interface ButtonProps
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

// ============ CARD COMPONENTS ============
const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-xl border bg-card text-card-foreground shadow",
      className,
    )}
    {...props}
  />
));
Card.displayName = "Card";

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
));
CardContent.displayName = "CardContent";

// ============ MAIN COMPONENT ============
export default function SimulatorDashboardF3(): JSX.Element {
  const [progress, setProgress] = React.useState(0);

  React.useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) return 0;
        return prev + 1;
      });
    }, 50);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="bg-black w-full min-h-screen flex flex-col px-4 md:px-8 lg:px-12">
      
      {/* IMPORTED HEADER FROM INVESTOR DASHBOARD */}
      <div className="w-full max-w-[1836px] mx-auto mt-3 md:mt-4 lg:mt-[25px]">
        <HeaderSection
          {...({ showNavButtons: true, onMobileMenuToggle: (isOpen: boolean) => console.log('Menu toggled:', isOpen) } as any)}
        />
      </div>

      {/* Project title */}
      <div className="flex flex-row items-center gap-3 md:gap-5 mt-4 md:mt-[23px] max-w-[1836px] mx-auto w-full">
        <img
          className="w-[30px] h-[30px] sm:w-[35px] sm:h-[35px] md:w-[45px] md:h-[45px] lg:w-[50px] lg:h-[50px] object-contain flex-shrink-0"
          alt="Icon sun"
          src="/figmaAssets/icon-sun.svg"
        />
        <h1 className="[font-family:'Dubai-Bold',Helvetica] font-bold text-white text-lg sm:text-xl md:text-2xl lg:text-3xl tracking-[0] leading-tight">
          XYZ Project
        </h1>
      </div>

      {/* Main card - Single centered building */}
      <Card className="w-full max-w-[1829px] mx-auto min-h-[500px] sm:min-h-[600px] md:min-h-[700px] lg:h-[800px] xl:h-[846px] mt-6 md:mt-9 mb-6 rounded-[15px] bg-[#3D3D3D] border border-white/10 relative overflow-hidden">
        <CardContent className="p-0 h-full w-full relative">

          {/* Single centered building with progress bar */}
          <div className="absolute bottom-[3%] sm:bottom-[4%] md:bottom-[5%] lg:bottom-[6%] xl:bottom-[8%] left-0 right-0 flex flex-col items-center justify-end gap-3 sm:gap-4 md:gap-6 px-2 sm:px-4 md:px-6 lg:px-8 z-[1]">
            
            {/* Phase text - positioned above building */}
            <div className="flex flex-col items-center gap-1 md:gap-2">
              <div className="[font-family:'Satoshi-Bold',Helvetica] font-bold text-white text-lg md:text-2xl lg:text-3xl xl:text-[35px] text-center drop-shadow-lg">
                Phase 3
              </div>
              <div className="[font-family:'Satoshi-Medium',Helvetica] font-medium text-white text-xl md:text-3xl lg:text-4xl xl:text-[42px] drop-shadow-lg">
                Complete
              </div>
            </div>

            {/* CENTER: Medium building - Now larger and centered */}
            <img
              className="w-[250px] sm:w-[320px] md:w-[450px] lg:w-[600px] xl:w-[750px] 2xl:w-[850px] h-auto object-contain object-bottom"
              alt="Medium building"
              src="/figmaAssets/vector-10.png"
            />

            {/* Progress bar - centered under building */}
            <div className="w-[220px] sm:w-[280px] md:w-[380px] lg:w-[500px] xl:w-[620px] 2xl:w-[700px] h-[24px] sm:h-[28px] md:h-[36px] lg:h-[44px] xl:h-[50px] rounded-full bg-[#3D3D3D] border border-white/20 overflow-hidden shadow-lg">
              <div
                className="h-full bg-[#ef6b23] rounded-full flex items-center justify-end pr-2 sm:pr-3 md:pr-4 transition-all duration-300 ease-out"
                style={{ width: `${progress}%` }}
              >
                <span className="[font-family:'Satoshi-Bold',Helvetica] font-bold text-white text-xs sm:text-sm md:text-base lg:text-xl xl:text-2xl whitespace-nowrap">
                  {progress}%
                </span>
              </div>
            </div>
          </div>

        </CardContent>
      </Card>
    </div>
  );
}
