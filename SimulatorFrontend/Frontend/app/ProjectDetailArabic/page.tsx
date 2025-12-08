"use client";

import * as TabsPrimitive from "@radix-ui/react-tabs";
import { Slot } from "@radix-ui/react-slot";
import { type VariantProps, cva } from "class-variance-authority";
import { clsx, type ClassValue } from "clsx";
import { Bell, Settings, HelpCircle, Share2, ArrowLeft } from "lucide-react";
import * as React from "react";
import { twMerge } from "tailwind-merge";

// Utility function
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Badge Component
const badgeVariants = cva(
  "inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground shadow hover:bg-primary/80",
        secondary: "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive: "border-transparent bg-destructive text-destructive-foreground shadow hover:bg-destructive/80",
        outline: "text-foreground",
      },
    },
    defaultVariants: { variant: "default" },
  }
);

interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

// Button Component
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
    defaultVariants: { variant: "default", size: "default" },
  }
);

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  }
);
Button.displayName = "Button";

// Card Components
const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("rounded-xl border bg-card text-card-foreground shadow", className)} {...props} />
  )
);
Card.displayName = "Card";

const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
);
CardContent.displayName = "CardContent";

// Tabs Components
const Tabs = TabsPrimitive.Root;

const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn("inline-flex h-9 items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground", className)}
    {...props}
  />
));
TabsList.displayName = TabsPrimitive.List.displayName;

const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(
      "inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow",
      className
    )}
    {...props}
  />
));
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName;

const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn("mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2", className)}
    {...props}
  />
));
TabsContent.displayName = TabsPrimitive.Content.displayName;

// Data Constants (Arabic text, no translate:)
const milestones = [
  { label: "الإطلاق" },
  { label: "بداية البناء" },
  { label: "50% مكتمل" },
  { label: "التسليم" },
];

const trackRecordItems = [
  "2017 - 2018 مشروع الإسكان (جمع 2 مليون دولار)",
  "2017 - 2018 مشروع الإسكان (جمع 2 مليون دولار)",
  "2017 - 2018 مشروع الإسكان (جمع 2 مليون دولار)",
  "2017 - 2018 مشروع الإسكان (جمع 2 مليون دولار)",
];

const projectSoldData = [
  { name: "المشروع ألفا", percentage: 60 },
  { name: "المشروع بيتا", percentage: 30 },
  { name: "المشروع جاما", percentage: 80 },
];

const reviews = [
  {
    rating: 5,
    date: "20 أكتوبر 2035",
    text: "لوريم إيبسوم هو ببساطة نص شكلي يستخدم في صناعة الطباعة والتنضيد. كان لوريم إيبسوم هو النص الوهمي القياسي في الصناعة منذ القرن الخامس عشر.",
    author: "أليس جونسون",
    starsImage: "/figmaAssetsProjectDetails/stars.svg",
  },
  {
    rating: 5,
    date: "20 أكتوبر 2035",
    text: "لوريم إيبسوم هو ببساطة نص شكلي يستخدم في صناعة الطباعة والتنضيد. كان لوريم إيبسوم هو النص الوهمي القياسي في الصناعة منذ القرن الخامس عشر.",
    author: "أليس جونسون",
    starsImage: "/figmaAssetsProjectDetails/stars-2.svg",
  },
];

const communityTabs = [
  { value: "reviews", label: "التقييمات والمراجعات", active: true },
  { value: "faqs", label: "الأسئلة الشائعة", active: false },
  { value: "discussion", label: "المناقشة", active: false },
];

// Main Dashboard Component
export default function DashboardProject() {
  return (
    <div className="bg-[#0a0a0a] w-full min-h-screen flex flex-col">
      {/* Header Section */}
      <div className="w-full px-3 md:px-6 lg:px-8 pt-3 md:pt-6">
        <header
          className="flex items-center justify-between px-4 md:px-6 lg:px-8"
          style={{
            width: "100%",
            maxWidth: 1834,
            height: "auto",
            minHeight: 70,
            marginInline: "auto",
            padding: "15px 20px",
            borderRadius: 30,
            backgroundColor: "rgba(255, 255, 255, 0.2)",
            border: "1px solid rgba(255,255,255,0.2)",
          }}
        >
          {/* Left: Logo */}
          <div className="flex items-center">
            <div className="flex flex-col justify-start items-start pb-[5px]">
              <img
                src="/co-build-logo-01-1.png"
                alt="CoBuild Logo"
                className="h-[30px] w-[120px] md:h-[50px] md:w-[237px] object-cover"
              />
            </div>
          </div>

          {/* Center: Menu */}
          <nav className="hidden md:flex items-center gap-2 lg:gap-3 bg-white rounded-[25px] p-1">
            <button
              className="flex items-center justify-center px-3 lg:px-4 py-2 lg:py-3 rounded-[25px] transition-all hover:opacity-90"
              style={{ backgroundColor: "#ef6b23" }}
            >
              <span
                className="text-white text-sm lg:text-[20px] whitespace-nowrap"
                style={{ fontFamily: "Dubai, sans-serif" }}
              >
                لوحة المستثمر
              </span>
            </button>

            <button
              className="flex items-center justify-center px-3 lg:px-4 py-2 lg:py-3 rounded-[25px] transition-all hover:opacity-90"
              style={{ backgroundColor: "#ef6b23" }}
            >
              <span
                className="text-white text-sm lg:text-[20px] whitespace-nowrap"
                style={{ fontFamily: "Dubai, sans-serif" }}
              >
                المحفظة
              </span>
            </button>

            <button
              className="flex items-center justify-center px-3 lg:px-4 py-2 lg:py-3 rounded-[25px] transition-all hover:opacity-90"
              style={{ backgroundColor: "#000000" }}
            >
              <span
                className="text-white text-sm lg:text-[20px] whitespace-nowrap"
                style={{ fontFamily: "Dubai, sans-serif" }}
              >
                المجتمع
              </span>
            </button>
          </nav>

          {/* Mobile Menu Button */}
          <button className="md:hidden flex items-center justify-center w-10 h-10 rounded-full hover:bg-white/10 transition-all">
            <Bell size={20} className="text-white" />
          </button>

          {/* Right: Icon buttons */}
          <div className="hidden md:flex items-center gap-2">
            <button
              className="flex items-center justify-center rounded-[25px] hover:bg-white/20 transition-all"
              style={{ padding: 15, backgroundColor: "rgba(255,255,255,0.1)", border: "0px solid transparent" }}
            >
              <Bell size={18} className="text-white" />
            </button>

            <button
              className="flex items-center justify-center rounded-[25px] hover:bg-white/20 transition-all"
              style={{ padding: 15, backgroundColor: "rgba(255,255,255,0.1)", border: "0px solid transparent" }}
            >
              <HelpCircle size={18} className="text-white" />
            </button>

            <button
              className="flex items-center justify-center rounded-[25px] hover:bg-white/20 transition-all"
              style={{ padding: 15, backgroundColor: "rgba(255,255,255,0.1)", border: "0px solid transparent" }}
            >
              <Settings size={18} className="text-white" />
            </button>
          </div>
        </header>

        {/* Project Housing Title Bar with Share Button */}
        <div
          className="flex items-center justify-between px-4 md:px-6 lg:px-8 py-3 md:py-4 mt-3 md:mt-4"
          style={{
            width: "100%",
            maxWidth: 1834,
            marginInline: "auto",
          }}
        >
          <div className="flex items-center gap-3 flex-1">
            <button className="hidden md:flex items-center justify-center w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 transition-all">
              <ArrowLeft size={20} className="text-white" />
            </button>
            <h1 className="[font-family:'Dubai-Bold',Helvetica] font-bold text-white text-xl md:text-2xl lg:text-3xl tracking-[0] leading-[normal]">
              مشروع الإسكان
            </h1>
          </div>

          <button
            className="flex items-center justify-center gap-2 px-4 md:px-5 py-2 md:py-2.5 rounded-full bg-[#1a1a1a] hover:bg-[#2a2a2a] transition-all shadow-sm"
            style={{ marginLeft: "auto" }}
          >
            <Share2 size={16} className="text-white" strokeWidth={2} />
            <span
              className="text-white text-sm md:text-base font-normal whitespace-nowrap"
              style={{ fontFamily: "Dubai, sans-serif" }}
            >
              مشاركة
            </span>
          </button>
        </div>
      </div>

      {/* Main Content Container */}
      <div className="w-full px-3 md:px-6 lg:px-8 py-2 md:py-4 lg:py-6">
        <div className="w-full max-w-[1834px] mx-auto rounded-xl md:rounded-2xl lg:rounded-2xl bg-white/20 backdrop-blur-md border border-white/20">
          <div className="w-full px-3 md:px-6 py-3 md:py-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-[1fr_1.5fr_1fr] gap-3 md:gap-[15px]">
              {/* Left Column */}
              <div className="flex flex-col gap-3 md:gap-[15px]">
                <div className="flex flex-col gap-px">
                  <img
                    className="w-full h-[250px] md:h-[300px] lg:h-[356px] rounded-[15px_15px_0px_0px] object-cover"
                    alt="Picture project"
                    src="/figmaAssetsProjectDetails/picture-project.png"
                  />

                  <Card className="bg-[#0000004c] rounded-[0px_0px_10px_10px] backdrop-blur-[10px] backdrop-brightness-[100%] [-webkit-backdrop-filter:blur(10px)_brightness(100%)] border-none">
                    <CardContent className="flex flex-col items-start justify-center gap-3 md:gap-[16.23px] p-3 md:p-[15px]">
                      <div className="flex flex-col items-center justify-center gap-2 md:gap-[9.55px] w-full">
                        <div className="flex flex-col items-start gap-[5px] w-full">
                          <div className="flex items-center justify-between w-full">
                            <div className="inline-flex items-center gap-1.5 md:gap-2.5">
                              <h2 className="[font-family:'Dubai-Bold',Helvetica] font-bold text-white text-lg md:text-[25px] tracking-[0] leading-[normal]">
                                مشروع الإسكان
                              </h2>
                              <img
                                className="w-5 h-5 md:w-6 md:h-6"
                                alt="Frame"
                                src="/figmaAssetsProjectDetails/frame-3.svg"
                              />
                            </div>

                            <Badge className="inline-flex items-center justify-center gap-1 md:gap-[4.77px] px-2 md:px-[9.55px] py-1 md:py-[4.77px] bg-[#fef9bfcc] rounded-[7.64px] h-auto border-none hover:bg-[#fef9bfcc]">
                              <img
                                className="w-4 h-4 md:w-[19.09px] md:h-[19.09px]"
                                alt="Frame"
                                src="/figmaAssetsProjectDetails/frame-2.svg"
                              />
                              <span className="[font-family:'Satoshi-Medium',Helvetica] font-medium text-[#231f1f] text-xs md:text-[16.2px] tracking-[0] leading-[18.1px] whitespace-nowrap">
                                التخطيط
                              </span>
                            </Badge>
                          </div>

                          <div className="inline-flex items-center gap-[3px]">
                            <img
                              className="w-4 h-4 md:w-5 md:h-5"
                              alt="Frame"
                              src="/figmaAssetsProjectDetails/frame-1.svg"
                            />
                            <p className="[font-family:'Satoshi-Medium',Helvetica] font-medium text-white text-sm md:text-xl tracking-[0] leading-[normal]">
                              دبي - شاوت بنك (سكني)
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-start gap-2 md:gap-[5px] px-0 py-[5px] w-full">
                        <div className="flex items-center gap-2 md:gap-[9.55px] flex-1">
                          <Button className="flex-1 bg-[#ffffff1a] border border-solid border-white items-center justify-center gap-[4.77px] px-2 py-1.5 rounded-[40px] h-auto hover:bg-[#ffffff2a]">
                            <span className="[font-family:'Satoshi-Medium',Helvetica] font-medium text-white text-xs md:text-lg tracking-[0] leading-[22.9px] whitespace-nowrap">
                              تحميل PDF
                            </span>
                          </Button>
                        </div>
                        <div className="flex items-center gap-2 md:gap-[9.55px] flex-1">
                          <Button className="flex-1 bg-[#ef6b23] items-center justify-center gap-[4.77px] px-2 py-1.5 rounded-[40px] h-auto hover:bg-[#ef6b23]/90 border-none">
                            <span className="[font-family:'Satoshi-Medium',Helvetica] font-medium text-white text-xs md:text-lg tracking-[0] leading-[22.9px] whitespace-nowrap">
                              استثمر الآن
                            </span>
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Project Overview Card */}
                <Card className="border border-solid border-transparent bg-[linear-gradient(0deg,rgba(0,0,0,0.2)_0%,rgba(0,0,0,0.2)_100%),linear-gradient(119deg,rgba(255,255,255,0.3)_0%,rgba(255,255,255,0.05)_100%)] rounded-[10px]">
                  <CardContent className="flex flex-col items-center justify-between px-3 md:px-[15px] py-4 md:py-5">
                    <div className="flex flex-col items-start gap-2.5 w-full">
                      <div className="flex flex-col items-start gap-[5px] w-full">
                        <h3 className="[font-family:'Dubai-Bold',Helvetica] font-bold text-white text-base md:text-xl tracking-[0] leading-[normal]">
                          نظرة عامة على المشروع
                        </h3>
                        <p className="[font-family:'Satoshi-Medium',Helvetica] font-medium text-white text-sm md:text-lg tracking-[0] leading-[normal]">
                          120 وحدة - تسجيل 24 أغسطس 2025 - الإنجاز 2026 - دبي
                        </p>
                      </div>

                      <p className="[font-family:'Satoshi-Medium',Helvetica] font-medium text-white text-xs md:text-base tracking-[0] leading-[normal]">
                        لوريم إيبسوم هو ببساطة نص شكلي يستخدم في صناعة الطباعة والتنضيد. كان لوريم إيبسوم هو النص الوهمي القياسي في الصناعة منذ القرن الخامس عشر.
                      </p>
                    </div>

                    <div className="flex flex-col items-start gap-2.5 w-full mt-2.5">
                      <div className="flex items-center justify-center gap-[9.55px] w-full">
                        <h4 className="text-sm md:text-[17.2px] flex items-center justify-center flex-1 [font-family:'Satoshi-Bold',Helvetica] font-bold text-white tracking-[0] leading-[normal]">
                          المعالم والجدول الزمني
                        </h4>
                      </div>

                      <div className="flex items-center justify-center gap-[4.77px] w-full">
                        <div className="flex items-start gap-[5px] flex-1">
                          <img className="flex-1 w-full" alt="Slider" src="/figmaAssetsProjectDetails/slider-1.svg" />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:flex md:items-center md:justify-between gap-2 w-full">
                        {milestones.map((milestone, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-center [font-family:'Satoshi-Medium',Helvetica] font-medium text-white text-xs md:text-[17.2px] tracking-[0] leading-[normal]"
                          >
                            {milestone.label}
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Middle Column */}
              <div className="flex flex-col gap-3 md:gap-[15px]">
                <Card className="bg-[#ececec33] rounded-[14.51px] overflow-hidden border-[none] backdrop-blur-[18.14px] backdrop-brightness-[100%] [-webkit-backdrop-filter:blur(18.14px)_brightness(100%)] before:content-[''] before:absolute before:inset-0 before:p-[0.45px] before:rounded-[14.51px] before:[background:linear-gradient(133deg,rgba(255,255,255,0.5)_0%,rgba(255,255,255,0)_43%,rgba(255,255,255,0.5)_100%)] before:[-webkit-mask:linear-gradient(#fff_0_0)_content-box,linear-gradient(#fff_0_0)] before:[-webkit-mask-composite:xor] before:[mask-composite:exclude] before:z-[1] before:pointer-events-none h-[300px] md:h-[385px] relative">
                  <CardContent className="p-0 relative h-full">
                    <img
                      className="absolute top-12 left-0 w-full h-[250px] md:h-[337px] object-cover"
                      alt="Frame"
                      src="/figmaAssetsProjectDetails/frame-5.svg"
                    />
                    <img
                      className="absolute top-[150px] md:top-[204px] left-1/2 md:left-[372px] w-[13px] h-[49px]"
                      alt="Union"
                      src="/figmaAssetsProjectDetails/union.svg"
                    />

                    <div className="flex items-center gap-[4.53px] px-3 md:px-[14.51px] py-3 md:py-[15px] absolute top-0 left-0">
                      <div className="inline-flex flex-col items-start gap-[7.25px]">
                        <h3 className="[font-family:'Dubai-Bold',Helvetica] font-bold text-white text-base md:text-[19px] tracking-[-0.38px] leading-[19px] whitespace-nowrap">
                          شركة صن رايز
                        </h3>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-[linear-gradient(0deg,rgba(0,0,0,0.2)_0%,rgba(0,0,0,0.2)_100%),linear-gradient(119deg,rgba(255,255,255,0.3)_0%,rgba(255,255,255,0.05)_100%)] rounded-[10px] border-none">
                  <CardContent className="flex flex-col items-start px-3 md:px-[15px] py-4 md:py-5 gap-2.5">
                    <div className="flex flex-col items-start gap-2.5 w-full">
                      <h3 className="[font-family:'Dubai-Bold',Helvetica] font-bold text-white text-base md:text-xl tracking-[0] leading-[normal]">
                        معلومات المطور
                      </h3>

                      <div className="flex flex-col md:flex-row items-start gap-2.5 w-full">
                        <Card className="flex-1 w-full border border-solid border-transparent bg-[linear-gradient(0deg,rgba(0,0,0,0.2)_0%,rgba(0,0,0,0.2)_100%),linear-gradient(119deg,rgba(255,255,255,0.3)_0%,rgba(255,255,255,0.05)_100%)] rounded-[10px]">
                          <CardContent className="flex flex-col items-start gap-2.5 px-3 md:px-[15px] py-2.5">
                            <div className="flex items-center gap-2.5 w-full">
                              <div className="w-12 h-12 md:w-[58px] md:h-[58px] bg-[#d9d9d9] rounded-full" />

                              <div className="inline-flex flex-col items-start justify-center">
                                <div className="inline-flex flex-col items-start gap-2.5">
                                  <div className="flex flex-col items-start gap-[5px]">
                                    <h4 className="[font-family:'Dubai-Bold',Helvetica] font-bold text-white text-base md:text-xl tracking-[0] leading-[normal]">
                                      شركة صن رايز
                                    </h4>
                                  </div>
                                </div>

                                <div className="inline-flex flex-col items-start gap-2.5">
                                  <div className="flex flex-col items-start gap-[5px]">
                                    <p className="[font-family:'Satoshi-Medium',Helvetica] font-medium text-white text-xs md:text-base tracking-[0] leading-[normal]">
                                      تأسست في 2017
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </div>

                            <p className="[font-family:'Satoshi-Medium',Helvetica] font-medium text-white text-xs md:text-sm tracking-[0] leading-[normal]">
                              لوريم إيبسوم هو ببساطة نص شكلي يستخدم في صناعة الطباعة والتنضيد.
                            </p>
                          </CardContent>
                        </Card>

                        <Card className="flex-1 w-full border border-solid border-transparent bg-[linear-gradient(0deg,rgba(0,0,0,0.2)_0%,rgba(0,0,0,0.2)_100%),linear-gradient(119deg,rgba(255,255,255,0.3)_0%,rgba(255,255,255,0.05)_100%)] rounded-[10px]">
                          <CardContent className="flex flex-col items-start gap-2.5 p-2.5">
                            <div className="flex flex-col items-start gap-2.5 w-full">
                              <div className="flex flex-col items-start gap-[5px] w-full">
                                <h4 className="[font-family:'Dubai-Bold',Helvetica] font-bold text-white text-sm md:text-lg tracking-[0] leading-[normal]">
                                  السجل الحافل
                                </h4>
                              </div>
                            </div>

                            <div className="flex flex-col items-start gap-[5px] w-full">
                              {trackRecordItems.map((item, index) => (
                                <p
                                  key={index}
                                  className="[font-family:'Satoshi-Medium',Helvetica] font-medium text-white text-xs md:text-sm tracking-[0] leading-[normal]"
                                >
                                  {item}
                                </p>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </div>

                    {/* Investment Information */}
                    <div className="flex flex-col items-start gap-3 md:gap-[15px] w-full rounded-[10px]">
                      <div className="flex flex-col items-start gap-2.5 w-full">
                        <div className="flex flex-col items-start gap-2.5 w-full">
                          <h3 className="[font-family:'Dubai-Bold',Helvetica] font-bold text-white text-base md:text-xl tracking-[0] leading-[normal]">
                            معلومات الاستثمار
                          </h3>

                          <div className="flex flex-col md:flex-row items-start gap-2.5 w-full">
                            <Card className="h-auto md:h-[166px] flex-1 w-full border border-solid border-transparent bg-[linear-gradient(0deg,rgba(0,0,0,0.2)_0%,rgba(0,0,0,0.2)_100%),linear-gradient(119deg,rgba(255,255,255,0.3)_0%,rgba(255,255,255,0.05)_100%)] rounded-[10px]">
                              <CardContent className="flex flex-col items-start gap-2.5 px-3 md:px-[15px] py-2.5">
                                <div className="flex flex-col items-start gap-2.5 w-full">
                                  <div className="flex flex-col items-start gap-[5px] w-full">
                                    <h4 className="[font-family:'Dubai-Bold',Helvetica] font-bold text-white text-base md:text-xl tracking-[0] leading-[normal]">
                                      المالية
                                    </h4>
                                  </div>
                                </div>

                                <div className="flex flex-col items-start gap-[5px] w-full">
                                  <div className="flex items-center justify-center gap-[9.55px] w-full">
                                    <div className="text-2xl md:text-[35.1px] flex items-center justify-center flex-1 [font-family:'Satoshi-Bold',Helvetica] font-bold text-white tracking-[0] leading-[normal]">
                                      $ 1.5M
                                    </div>
                                  </div>

                                  <div className="flex items-center justify-center gap-[4.77px] w-full">
                                    <div className="flex items-start gap-[5px] flex-1">
                                      <img
                                        className="flex-1 w-full"
                                        alt="Slider"
                                        src="/figmaAssetsProjectDetails/slider.svg"
                                      />
                                    </div>
                                  </div>
                                </div>

                                <div className="inline-flex items-start gap-2.5">
                                  <span className="[font-family:'Satoshi-Bold',Helvetica] font-bold text-white text-sm md:text-lg tracking-[0] leading-[normal]">
                                    8%
                                  </span>
                                  <span className="[font-family:'Satoshi-Medium',Helvetica] font-medium text-white text-sm md:text-lg tracking-[0] leading-[normal]">
                                    24 شهر
                                  </span>
                                </div>
                              </CardContent>
                            </Card>

                            <Card className="flex flex-col h-auto md:h-[166px] flex-1 w-full justify-between rounded-[10px] border border-solid border-transparent bg-[linear-gradient(0deg,rgba(0,0,0,0.2)_0%,rgba(0,0,0,0.2)_100%),linear-gradient(119deg,rgba(255,255,255,0.3)_0%,rgba(255,255,255,0.05)_100%)]">
                              <CardContent className="flex flex-col items-start justify-between p-2.5 h-full">
                                <div className="flex flex-col items-start gap-2.5 w-full">
                                  <div className="flex flex-col items-start gap-[5px] w-full">
                                    <h4 className="[font-family:'Dubai-Bold',Helvetica] font-bold text-white text-sm md:text-lg tracking-[0] leading-[normal]">
                                      الهيكل القانوني
                                    </h4>
                                  </div>
                                </div>

                                <p className="[font-family:'Satoshi-Medium',Helvetica] font-medium text-white text-xs md:text-sm tracking-[0] leading-[normal]">
                                  نماذج الملكية وحقوق المستثمرين
                                </p>

                                <div className="flex items-center gap-[5px] w-full">
                                  <Button className="bg-[#ffffff1a] border border-solid border-white items-center justify-center gap-[4.77px] px-2 py-1.5 rounded-[40px] h-auto hover:bg-[#ffffff2a]">
                                    <span className="[font-family:'Satoshi-Medium',Helvetica] font-medium text-white text-xs md:text-sm tracking-[0] leading-[22.9px] whitespace-nowrap">
                                      تحميل PDF
                                    </span>
                                  </Button>
                                </div>
                              </CardContent>
                            </Card>

                            <Card className="flex flex-col h-auto md:h-[166px] flex-1 w-full justify-between rounded-[10px] border border-solid border-transparent bg-[linear-gradient(0deg,rgba(0,0,0,0.2)_0%,rgba(0,0,0,0.2)_100%),linear-gradient(119deg,rgba(255,255,255,0.3)_0%,rgba(255,255,255,0.05)_100%)]">
                              <CardContent className="flex flex-col items-start justify-between p-2.5 h-full">
                                <div className="flex flex-col items-start gap-2.5 w-full">
                                  <div className="flex flex-col items-start gap-[5px] w-full">
                                    <h4 className="[font-family:'Dubai-Bold',Helvetica] font-bold text-white text-sm md:text-lg tracking-[0] leading-[normal]">
                                      رابط العقد الذكي
                                    </h4>
                                  </div>
                                </div>

                                <p className="[font-family:'Satoshi-Medium',Helvetica] font-medium text-white text-xs md:text-sm tracking-[0] leading-[normal]">
                                  لوريم إيبسوم دولور سيت أميت
                                </p>

                                <div className="flex items-center gap-[5px] w-full">
                                  <Button className="bg-[#ffffff1a] border border-solid border-white items-center justify-center gap-[4.77px] px-2 py-1.5 rounded-[40px] h-auto hover:bg-[#ffffff2a]">
                                    <span className="[font-family:'Satoshi-Medium',Helvetica] font-medium text-white text-xs md:text-sm tracking-[0] leading-[22.9px] whitespace-nowrap">
                                      تحميل PDF
                                    </span>
                                  </Button>
                                </div>
                              </CardContent>
                            </Card>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Right Column */}
              <div className="flex flex-col gap-3 md:gap-[15px]">
                <Card className="border border-solid border-transparent bg-[linear-gradient(0deg,rgba(0,0,0,0.2)_0%,rgba(0,0,0,0.2)_100%),linear-gradient(119deg,rgba(255,255,255,0.3)_0%,rgba(255,255,255,0.05)_100%)] rounded-[10px]">
                  <CardContent className="flex flex-col items-center gap-2.5 px-3 md:px-[15px] py-2.5">
                    <div className="flex flex-col items-start gap-2.5 w-full">
                      <div className="flex flex-col items-start gap-2.5 w-full">
                        <h3 className="[font-family:'Dubai-Bold',Helvetica] font-bold text-white text-base md:text-xl tracking-[0] leading-[normal]">
                          المجتمع
                        </h3>

                        <Tabs defaultValue="reviews" className="w-full">
                          <TabsList className="flex flex-wrap items-start gap-2 bg-transparent p-0 h-auto w-full">
                            {communityTabs.map((tab) => (
                              <TabsTrigger
                                key={tab.value}
                                value={tab.value}
                                className={`flex items-center justify-between px-3 md:px-4 py-1.5 md:py-2 rounded-[15px] overflow-hidden border-[none] backdrop-blur-[5px] backdrop-brightness-[100%] [-webkit-backdrop-filter:blur(5px)_brightness(100%)] before:content-[''] before:absolute before:inset-0 before:p-px before:rounded-[15px] before:[background:linear-gradient(133deg,rgba(255,255,255,0.5)_0%,rgba(255,255,255,0)_43%,rgba(255,255,255,0.5)_100%)] before:[-webkit-mask:linear-gradient(#fff_0_0)_content-box,linear-gradient(#fff_0_0)] before:[-webkit-mask-composite:xor] before:[mask-composite:exclude] before:z-[1] before:pointer-events-none ${
                                  tab.active
                                    ? "bg-[linear-gradient(0deg,rgba(255,255,255,0.2)_0%,rgba(255,255,255,0.2)_100%),linear-gradient(0deg,rgba(0,0,0,0.2)_0%,rgba(0,0,0,0.2)_100%),linear-gradient(119deg,rgba(255,255,255,0.3)_0%,rgba(255,255,255,0.05)_100%)]"
                                    : "bg-[linear-gradient(0deg,rgba(0,0,0,0.2)_0%,rgba(0,0,0,0.2)_100%),linear-gradient(119deg,rgba(255,255,255,0.3)_0%,rgba(255,255,255,0.05)_100%)]"
                                } data-[state=active]:bg-[linear-gradient(0deg,rgba(255,255,255,0.2)_0%,rgba(255,255,255,0.2)_100%),linear-gradient(0deg,rgba(0,0,0,0.2)_0%,rgba(0,0,0,0.2)_100%),linear-gradient(119deg,rgba(255,255,255,0.3)_0%,rgba(255,255,255,0.05)_100%)]`}
                              >
                                <span
                                  className={`[font-family:'Satoshi-${tab.active ? "Medium" : "Regular"}',Helvetica] ${
                                    tab.active ? "font-medium" : "font-normal"
                                  } text-white text-xs md:text-base tracking-[0] leading-[normal]`}
                                >
                                  {tab.label}
                                </span>
                              </TabsTrigger>
                            ))}
                          </TabsList>

                          <TabsContent value="reviews" className="mt-2.5">
                            <div className="flex flex-col items-start justify-center gap-3 px-0 py-[5px] w-full">
                              {reviews.map((review, index) => (
                                <div key={index} className="flex items-center gap-4 md:gap-12 w-full">
                                  <div className="flex flex-col items-start gap-[5px] flex-1 rounded-xl">
                                    <div className="inline-flex flex-wrap items-center gap-2">
                                      <div className="inline-flex items-center gap-1">
                                        <img
                                          className="flex-[0_0_auto] w-16 md:w-auto"
                                          alt="Stars"
                                          src={review.starsImage}
                                        />

                                        <div className="inline-flex items-baseline">
                                          <span className="[font-family:'Satoshi-Regular',Helvetica] font-normal text-white text-xs md:text-[13px] tracking-[0] leading-[16.1px] whitespace-nowrap">
                                            {review.rating}/5
                                          </span>
                                        </div>
                                      </div>

                                      <div className="w-1 h-1 bg-grey-line rounded-sm" />

                                      <span className="[font-family:'Satoshi-Regular',Helvetica] font-normal text-white text-xs md:text-[13px] tracking-[0] leading-[16.9px] whitespace-nowrap">
                                        {review.date}
                                      </span>
                                    </div>

                                    <p className="[font-family:'Satoshi-Medium',Helvetica] font-medium text-white text-xs md:text-[15px] tracking-[0] leading-[normal] line-clamp-3 md:line-clamp-none">
                                      {review.text}
                                    </p>

                                    <span className="[font-family:'Satoshi-Medium',Helvetica] font-medium text-white text-xs md:text-[13px] tracking-[0] leading-[16.9px] whitespace-nowrap">
                                      {review.author}
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </TabsContent>

                          <TabsContent value="faqs">
                            <div className="p-4 text-white text-sm">محتوى الأسئلة الشائعة</div>
                          </TabsContent>

                          <TabsContent value="discussion">
                            <div className="p-4 text-white text-sm">محتوى المناقشة</div>
                          </TabsContent>
                        </Tabs>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border border-solid border-transparent bg-[linear-gradient(0deg,rgba(0,0,0,0.2)_0%,rgba(0,0,0,0.2)_100%),linear-gradient(119deg,rgba(255,255,255,0.3)_0%,rgba(255,255,255,0.05)_100%)] rounded-[10px]">
                  <CardContent className="flex flex-col items-center justify-between px-3 md:px-[15px] py-4 md:py-5">
                    <div className="flex flex-col items-start gap-2.5 w-full">
                      <div className="flex flex-col items-start gap-[5px] w-full">
                        <h3 className="[font-family:'Dubai-Bold',Helvetica] font-bold text-white text-base md:text-xl tracking-[0] leading-[normal]">
                          المبنى المباع
                        </h3>

                        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-2 w-full">
                          <span className="[font-family:'Satoshi-Medium',Helvetica] font-medium text-white text-sm md:text-[17px] tracking-[0] leading-[normal]">
                            إجمالي الوحدات : 120
                          </span>
                          <span className="[font-family:'Satoshi-Medium',Helvetica] font-medium text-white text-sm md:text-[17px] tracking-[0] leading-[normal]">
                            مباع : 95
                          </span>
                          <span className="[font-family:'Satoshi-Medium',Helvetica] font-medium text-white text-sm md:text-[17px] tracking-[0] leading-[normal]">
                            متاح : 25
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col items-start gap-[5px] w-full mt-2.5">
                      <h3 className="[font-family:'Dubai-Bold',Helvetica] font-bold text-white text-base md:text-xl tracking-[0] leading-[normal]">
                        تقييمات المشروع
                      </h3>

                      <div className="inline-flex flex-wrap items-start gap-4 md:gap-[25px]">
                        <div className="inline-flex items-center justify-center gap-2.5">
                          <img
                            className="flex-[0_0_auto] w-20 md:w-auto"
                            alt="Stars"
                            src="/figmaAssetsProjectDetails/stars-1.svg"
                          />
                          <span className="[font-family:'Satoshi-Medium',Helvetica] font-medium text-white text-sm md:text-[17px] tracking-[0] leading-[normal]">
                            4,6
                          </span>
                        </div>

                        <span className="[font-family:'Satoshi-Medium',Helvetica] font-medium text-white text-sm md:text-[17px] tracking-[0] leading-[normal]">
                          مراجعة المستخدم 320
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col items-start gap-2.5 w-full mt-2.5">
                      <div className="flex flex-col items-start gap-[5px] w-full">
                        <h3 className="[font-family:'Dubai-Bold',Helvetica] font-bold text-white text-base md:text-xl tracking-[0] leading-[normal]">
                          المشروع المباع
                        </h3>

                        {projectSoldData.map((project, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-center gap-2 md:gap-[5px] w-full"
                          >
                            <span className="w-[80px] md:w-[119px] [font-family:'Satoshi-Medium',Helvetica] font-medium text-white text-sm md:text-[17px] tracking-[0] leading-[normal]">
                              {project.name}
                            </span>

                            <div className="flex items-center justify-center gap-[4.77px] flex-1">
                              <div className="flex items-center justify-center gap-[5px] flex-1">
                                <div className="flex items-center justify-center px-2 py-1 flex-1">
                                  <div className="flex-1 h-2 bg-[#f2f2f2cc] rounded overflow-hidden relative">
                                    <div
                                      className="absolute top-0 left-0 h-2 bg-[#ef6b23] rounded-[100px]"
                                      style={{ width: `${project.percentage}%` }}
                                    />
                                  </div>
                                </div>
                              </div>
                            </div>

                            <span className="[font-family:'Satoshi-Medium',Helvetica] font-medium text-white text-sm md:text-[17px] tracking-[0] leading-[normal]">
                              {project.percentage}%
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
