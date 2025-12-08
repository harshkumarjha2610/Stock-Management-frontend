'use client';
import React, { JSX } from "react";
import { Slot } from "@radix-ui/react-slot";
import { type VariantProps, cva } from "class-variance-authority";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";


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


// ============ NAVIGATION DATA ============
const navigationItems = [
  { label: "Investor Dashboard", href: "#" },
  { label: "Wallet", href: "#" },
  { label: "Community", href: "#" },
];


// ============ MAIN COMPONENT ============
export default function SimulatorDashboardF3(): JSX.Element {
  const [progress, setProgress] = React.useState(0);

  React.useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) return 0; // loop back to 0 after reaching 100
        return prev + 1;
      });
    }, 50); // adjust speed here (lower = faster)
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="bg-black w-full min-h-screen flex flex-col px-4 md:px-8 lg:px-12">
      {/* Header */}
      <header className="w-full max-w-[1836px] h-auto md:h-[97px] self-center mt-4 md:mt-[25px] bg-[#3D3D3D] rounded-[20px] md:rounded-[30px] border border-white/10 relative px-4 py-4 md:py-0">
        {/* Logo */}
        <div className="flex items-center justify-center md:absolute md:top-5 md:left-[25px] mb-4 md:mb-0">
          <img
            className="w-32 md:w-[180px] lg:w-[237px] h-auto object-contain"
            alt="Co build logo"
            src="/figmaAssets/co-build-logo-01-1.png"
          />
        </div>


        {/* Navigation */}
        <nav className="flex flex-col md:flex-row items-center gap-2 md:gap-2.5 md:absolute md:top-[22px] md:left-1/2 md:transform md:-translate-x-1/2">
          {navigationItems.map((item, index) => (
            <Button
              key={index}
              variant="ghost"
              className="w-full md:w-auto h-[40px] md:h-[50px] items-center justify-center gap-2.5 px-4 py-3 rounded-[20px] md:rounded-[25px] hover:bg-white/10"
            >
              <span className="[font-family:'Dubai-Regular',Helvetica] font-normal text-white text-base md:text-xl tracking-[0] leading-[normal]">
                {item.label}
              </span>
            </Button>
          ))}
        </nav>


        {/* Right side image */}
        <div className="hidden md:flex md:absolute md:top-[22px] md:right-[15px] lg:right-[25px] items-center justify-center">
          <img
            className="w-[100px] md:w-[120px] lg:w-[166px] h-auto object-contain"
            alt="Right side"
            src="/figmaAssets/right-side.svg"
          />
        </div>
      </header>


      {/* Project title */}
      <div className="flex flex-row items-center gap-3 md:gap-5 mt-4 md:mt-[23px]">
        <img
          className="w-[30px] h-[30px] sm:w-[35px] sm:h-[35px] md:w-[45px] md:h-[45px] lg:w-[50px] lg:h-[50px] object-contain flex-shrink-0"
          alt="Icon sun"
          src="/figmaAssets/icon-sun.svg"
        />
        <h1 className="[font-family:'Dubai-Bold',Helvetica] font-bold text-white text-lg sm:text-xl md:text-2xl lg:text-3xl tracking-[0] leading-tight">
          XYZ Project
        </h1>
      </div>


      {/* Main card - Larger buildings */}
      <Card className="w-full max-w-[1829px] min-h-[500px] sm:min-h-[600px] md:min-h-[700px] lg:h-[800px] xl:h-[846px] mt-6 md:mt-9 mb-6 rounded-[15px] bg-[#3D3D3D] border border-white/10 relative overflow-hidden">
        <CardContent className="p-0 h-full w-full relative">


          {/* Buildings container with progress bar under first house */}
          <div className="absolute bottom-[3%] sm:bottom-[4%] md:bottom-[5%] lg:bottom-[6%] xl:bottom-[8%] left-0 right-0 flex items-end justify-center gap-3 sm:gap-6 md:gap-8 lg:gap-12 xl:gap-20 px-2 sm:px-4 md:px-6 lg:px-8 z-[1]">
            
            {/* LEFT: Phase 3 text + House + Progress bar */}
            <div className="flex flex-col items-center gap-2 sm:gap-3 md:gap-4 mb-[-20px] sm:mb-[-25px] md:mb-[-30px] lg:mb-[-40px] xl:mb-[-50px]">
              
              {/* Phase 3 Complete text - positioned above house */}
              <div className="flex flex-col items-center gap-1 md:gap-2 mb-2 md:mb-3">
                <div className="[font-family:'Satoshi-Bold',Helvetica] font-bold text-white text-sm md:text-lg lg:text-xl xl:text-[27px] text-center drop-shadow-lg">
                  Phase 3
                </div>
                <div className="[font-family:'Satoshi-Medium',Helvetica] font-medium text-white text-base md:text-xl lg:text-2xl xl:text-[32.3px] drop-shadow-lg">
                  Complete
                </div>
              </div>

              {/* Vector 11 - House building */}
              <img
                className="w-[120px] sm:w-[150px] md:w-[200px] lg:w-[280px] xl:w-[380px] 2xl:w-[450px] h-auto object-contain object-bottom"
                alt="House building"
                src="/figmaAssets/vector-11.png"
              />

              {/* Progress bar - dynamic */}
              <div className="w-[110px] sm:w-[140px] md:w-[180px] lg:w-[250px] xl:w-[320px] 2xl:w-[380px] h-[20px] sm:h-[24px] md:h-[28px] lg:h-[36px] xl:h-[42px] rounded-full bg-[#3D3D3D] border border-white/20 overflow-hidden shadow-lg">
                <div
                  className="h-full bg-[#ef6b23] rounded-full flex items-center justify-end pr-1 sm:pr-2 md:pr-3 transition-all duration-300 ease-out"
                  style={{ width: `${progress}%` }}
                >
                  <span className="[font-family:'Satoshi-Bold',Helvetica] font-bold text-white text-[10px] sm:text-xs md:text-sm lg:text-base xl:text-lg whitespace-nowrap">
                    {progress}%
                  </span>
                </div>
              </div>
            </div>


            {/* CENTER: Medium building */}
            <img
              className="w-[180px] sm:w-[220px] md:w-[300px] lg:w-[400px] xl:w-[520px] 2xl:w-[620px] h-auto object-contain object-bottom"
              alt="Medium building"
              src="/figmaAssets/vector-10.png"
            />


            {/* RIGHT: Tall building - Slightly reduced for larger screens */}
            <img
              className="hidden sm:block w-[150px] sm:w-[200px] md:w-[260px] lg:w-[360px] xl:w-[460px] 2xl:w-[540px] 3xl:w-[620px] 4xl:w-[700px] h-auto max-h-[550px] xl:max-h-[680px] 2xl:max-h-[750px] 3xl:max-h-[800px] object-contain object-bottom"
              alt="Tall building"
              src="/figmaAssets/vector-8.png"
            />
          </div>


        </CardContent>
      </Card>
    </div>
  );
}
