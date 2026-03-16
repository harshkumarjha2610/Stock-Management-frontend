'use client';

import * as TabsPrimitive from '@radix-ui/react-tabs';
import { Slot } from '@radix-ui/react-slot';
import { type VariantProps, cva } from 'class-variance-authority';
import { clsx, type ClassValue } from 'clsx';
import { ArrowLeft, Share2 } from 'lucide-react';
import * as React from 'react';
import { useState, useEffect, Suspense } from 'react';
import { twMerge } from 'tailwind-merge';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { HeaderSection } from '@/app/[locale]/Investordashboard/sections/HeaderSection';
import { FooterSection } from '@/app/[locale]/Investordashboard/sections/FooterSection';

// ─── Utility ──────────────────────────────────────────────
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ─── Base URL ──────────────────────────────────────────────
const BASE_URL = 'https://cobuild-simulator-backend.onrender.com/api/v1';

// ─── Token Helpers ─────────────────────────────────────────
function getToken(): string {
  return localStorage.getItem('accessToken') ?? '';
}
function getRefreshToken(): string {
  return localStorage.getItem('refreshToken') ?? '';
}
function setTokens(accessToken: string, refreshToken?: string) {
  localStorage.setItem('accessToken', accessToken);
  if (refreshToken) localStorage.setItem('refreshToken', refreshToken);
}
function clearTokens() {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
}

// ─── Refresh Token ─────────────────────────────────────────
async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return null;
  try {
    const res = await fetch(`${BASE_URL}/user/auth/refresh-token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });
    if (!res.ok) {
      clearTokens();
      return null;
    }
    const data = await res.json();
    const newAccessToken =
      data.data?.accessToken ?? data.data?.token ?? data.accessToken ?? data.token;
    const newRefreshToken = data.data?.refreshToken ?? data.refreshToken;
    if (!newAccessToken) return null;
    setTokens(newAccessToken, newRefreshToken);
    return newAccessToken;
  } catch {
    return null;
  }
}

// ─── Smart Fetch ───────────────────────────────────────────
async function fetchWithAuth(url: string, options: RequestInit = {}): Promise<Response> {
  const token = getToken();
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  });
  if (res.status === 401) {
    const newToken = await refreshAccessToken();
    if (!newToken) {
      clearTokens();
      window.location.href = '/login';
      return res;
    }
    return fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${newToken}`,
        ...options.headers,
      },
    });
  }
  return res;
}

// ─── Types ─────────────────────────────────────────────────
interface Pool {
  id: string;
  mode: string;
  asset: string;
  userInvestment: null | number;
}

interface ProjectData {
  id: string;
  name: string;
  imageUrl: string;
  timelineDays: number;
  totalValue: string;
  returnPercent: string;
  location: string;
  projectOverview: string | null;
  projectDetails: string | null;
  smartContractUrl: string | null;
  usage: string;
  pool: Pool;
  latestProgress: null | number;
}

// ─── Image Resolver ────────────────────────────────────────
function resolveImageUrl(imageUrl: string): string {
  if (!imageUrl) return '/building.png';
  if (imageUrl.startsWith('https://res.cloudinary.com')) return imageUrl;
  if (imageUrl.startsWith('/public')) {
    return `https://cobuild-simulator-backend.onrender.com${imageUrl}`;
  }
  if (imageUrl.startsWith('http')) return imageUrl;
  return '/building.png';
}

// ─── Badge ─────────────────────────────────────────────────
const badgeVariants = cva(
  'inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-primary text-primary-foreground shadow hover:bg-primary/80',
        secondary: 'border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80',
        destructive: 'border-transparent bg-destructive text-destructive-foreground shadow hover:bg-destructive/90',
        outline: 'text-foreground',
      },
    },
    defaultVariants: { variant: 'default' },
  }
);
interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}
function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

// ─── Button ────────────────────────────────────────────────
const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground shadow hover:bg-primary/90',
        outline: 'border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        link: 'text-primary underline-offset-4 hover:underline',
        secondary: 'bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80',
        destructive: 'bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90',
      },
      size: {
        default: 'h-9 px-4 py-2',
        sm: 'h-8 rounded-md px-3 text-xs',
        lg: 'h-10 rounded-md px-8',
        icon: 'h-9 w-9',
      },
    },
    defaultVariants: { variant: 'default', size: 'default' },
  }
);
interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  }
);
Button.displayName = 'Button';

// ─── Card ──────────────────────────────────────────────────
const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('rounded-xl border bg-card text-card-foreground shadow', className)} {...props} />
  )
);
Card.displayName = 'Card';
const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('p-6 pt-0', className)} {...props} />
  )
);
CardContent.displayName = 'CardContent';

// ─── Tabs ──────────────────────────────────────────────────
const Tabs = TabsPrimitive.Root;
const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn('inline-flex h-9 items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground', className)}
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
      'inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow',
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
    className={cn('mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2', className)}
    {...props}
  />
));
TabsContent.displayName = TabsPrimitive.Content.displayName;

// ─── Static Arrays ─────────────────────────────────────────
const milestones = ['Launch', 'Construction Start', '50% Complete', 'Handover'];
const trackRecordItems = [
  '2017 - 2018 Project Housing (Raising $2m)',
  '2017 - 2018 Project Housing (Raising $2m)',
  '2017 - 2018 Project Housing (Raising $2m)',
  '2017 - 2018 Project Housing (Raising $2m)',
];
const projectSoldData = [
  { name: 'Project Alpha', percentage: 60 },
  { name: 'Project Beta',  percentage: 30 },
  { name: 'Project Gama',  percentage: 80 },
];
const reviews = [
  {
    rating: 5,
    date: 'Oct 20, 2035',
    text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
    author: 'Alice Johnson',
    starsImage: '/figmaAssetsProjectDetails/stars.svg',
  },
  {
    rating: 5,
    date: 'Oct 20, 2035',
    text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
    author: 'Alice Johnson',
    starsImage: '/figmaAssetsProjectDetails/stars-2.svg',
  },
];
const communityTabs = [
  { value: 'reviews',    label: 'Review & Ratings' },
  { value: 'faqs',       label: 'FAQs' },
  { value: 'discussion', label: 'Discussion' },
];

// ─── Skeleton Loader ───────────────────────────────────────
function ProjectDetailSkeleton() {
  return (
    <div className="animate-pulse space-y-4 p-6">
      <div className="h-[300px] rounded-2xl bg-white/10" />
      <div className="h-8 w-1/3 rounded bg-white/10" />
      <div className="h-4 w-1/2 rounded bg-white/10" />
      <div className="grid grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-40 rounded-xl bg-white/10" />
        ))}
      </div>
    </div>
  );
}

// ─── Page Fallback ─────────────────────────────────────────
function PageSkeleton() {
  return (
    <div className="bg-[#0a0a0a] w-full min-h-screen flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-[#ef6b23]/30 border-t-[#ef6b23] rounded-full animate-spin" />
    </div>
  );
}

// ─── Inner Content (uses useSearchParams) ──────────────────
function ProjectDetailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const projectId = searchParams.get('id');

  const [project,      setProject]      = useState<ProjectData | null>(null);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState<string | null>(null);
  const [imgSrc,       setImgSrc]       = useState('/building.png');
  const [confirmOpen,  setConfirmOpen]  = useState(false);
  const [submitting,   setSubmitting]   = useState(false);
  const [apiError,     setApiError]     = useState<string | null>(null);

  useEffect(() => {
    if (!projectId) {
      setError('No project ID provided.');
      setLoading(false);
      return;
    }

    const fetchProject = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetchWithAuth(`${BASE_URL}/user/simulation/projects/${projectId}`);
        if (!res.ok) {
          setError(`Failed to load project (${res.status})`);
          return;
        }
        const json = await res.json();
        const data: ProjectData = json.data;
        setProject(data);
        setImgSrc(resolveImageUrl(data.imageUrl));
      } catch {
        setError('Something went wrong. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [projectId]);

  const daysLeft = project
    ? project.timelineDays > 365
      ? `${Math.round(project.timelineDays / 365)}y left`
      : `${project.timelineDays}d left`
    : '—';

  const progressPercent = project?.latestProgress ?? 0;

  return (
    <div className="bg-[#0a0a0a] w-full min-h-screen flex flex-col">
      {/* Header */}
      <div className="w-full px-1.5 sm:px-3 md:px-5 lg:px-7 -mt-2 md:-mt-3">
        <div className="w-full max-w-[2400px] mx-auto">
          <div style={{ maxWidth: '2000px', margin: '0 auto' }}>
            <HeaderSection />
          </div>
        </div>

        {/* Title row */}
        <div
          className="flex items-center justify-between px-4 md:px-6 lg:px-8 py-3 md:py-4 mt-3 md:mt-4"
          style={{ width: '100%', maxWidth: 1834, marginInline: 'auto' }}
        >
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="hidden md:flex items-center justify-center w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 transition-all"
            >
              <ArrowLeft size={20} className="text-white" />
            </button>
            <h1 className="[font-family:'Dubai-Bold',Helvetica] font-bold text-white text-xl md:text-2xl lg:text-3xl tracking-[0] leading-[normal]">
              {loading ? 'Loading...' : project?.name ?? 'Project Detail'}
            </h1>
          </div>
          <button className="flex items-center justify-center gap-2 px-4 md:px-6 py-2 md:py-3 rounded-[25px] bg-white/10 hover:bg-white/20 border border-white/20 transition-all">
            <Share2 size={18} className="text-white" />
            <span
              className="text-white text-sm md:text-base font-medium"
              style={{ fontFamily: 'Dubai, sans-serif' }}
            >
              Share
            </span>
          </button>
        </div>
      </div>

      {/* Main content wrapper */}
      <div className="m-2 md:m-4 lg:m-6 rounded-lg md:rounded-xl lg:rounded-2xl bg-white/20 backdrop-blur-md border border-white/20">
        <div className="w-full px-3 md:px-6 py-3 md:py-6">

          {/* Error */}
          {error && (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <p className="text-red-400 text-sm">{error}</p>
              <button
                onClick={() => router.back()}
                className="px-4 py-2 rounded-full text-xs text-white"
                style={{ background: '#ef6b23' }}
              >
                Go Back
              </button>
            </div>
          )}

          {/* Loading */}
          {loading && !error && <ProjectDetailSkeleton />}

          {/* Loaded */}
          {!loading && !error && project && (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-[1fr_1.5fr_1fr] gap-3 md:gap-[15px]">

              {/* LEFT COLUMN */}
              <div className="flex flex-col gap-3 md:gap-[15px]">

                {/* Image + name card */}
                <div className="flex flex-col gap-px">
                  <div className="relative w-full h-[250px] md:h-[300px] lg:h-[356px] rounded-[15px_15px_0px_0px] overflow-hidden bg-white/5">
                    <Image
                      src={imgSrc}
                      alt={project.name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 1024px) 100vw, 33vw"
                      priority
                      onError={() => setImgSrc('/building.png')}
                    />
                  </div>

                  <Card className="bg-[#0000004c] rounded-[0px_0px_10px_10px] backdrop-blur-[10px] border-none">
                    <CardContent className="flex flex-col items-start justify-center gap-3 md:gap-[16.23px] p-3 md:p-[15px]">
                      <div className="flex flex-col items-center justify-center gap-2 w-full">
                        <div className="flex flex-col items-start gap-[5px] w-full">
                          <div className="flex items-center justify-between w-full">
                            <div className="inline-flex items-center gap-1.5 md:gap-2.5">
                              <h2 className="[font-family:'Dubai-Bold',Helvetica] font-bold text-white text-lg md:text-[25px] tracking-[0] leading-[normal]">
                                {project.name}
                              </h2>
                              <img
                                className="w-5 h-5 md:w-6 md:h-6"
                                alt="Status"
                                src="/figmaAssetsProjectDetails/frame-3.svg"
                              />
                            </div>
                            <Badge className="inline-flex items-center justify-center gap-1 px-2 md:px-[9.55px] py-1 bg-[#fef9bfcc] rounded-[7.64px] h-auto border-none hover:bg-[#fef9bfcc]">
                              <img
                                className="w-4 h-4 md:w-[19.09px] md:h-[19.09px]"
                                alt="Clock"
                                src="/figmaAssetsProjectDetails/frame-2.svg"
                              />
                              <span className="[font-family:'Satoshi-Medium',Helvetica] font-medium text-[#231f1f] text-xs md:text-[16.2px] tracking-[0] leading-[18.1px] whitespace-nowrap">
                                {daysLeft}
                              </span>
                            </Badge>
                          </div>

                          <div className="inline-flex items-center gap-[3px]">
                            <img
                              className="w-4 h-4 md:w-5 md:h-5"
                              alt="Location"
                              src="/figmaAssetsProjectDetails/frame-1.svg"
                            />
                            <p className="[font-family:'Satoshi-Medium',Helvetica] font-medium text-white text-sm md:text-xl tracking-[0] leading-[normal]">
                              {project.location}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-start gap-2 md:gap-[5px] px-0 py-[5px] w-full">
                        <div className="flex items-center gap-2 md:gap-[9.55px] flex-1">
                          <Button className="flex-1 bg-[#ffffff1a] border border-solid border-white items-center justify-center px-2 py-1.5 rounded-[40px] h-auto hover:bg-[#ffffff2a]">
                            <span className="[font-family:'Satoshi-Medium',Helvetica] font-medium text-white text-xs md:text-lg tracking-[0] leading-[22.9px] whitespace-nowrap">
                              Download PDF
                            </span>
                          </Button>
                        </div>
                        <div className="flex items-center gap-2 md:gap-[9.55px] flex-1">
                          <Button
                            onClick={() => {
                              setApiError(null);
                              setConfirmOpen(true);
                            }}
                            className="flex-1 bg-[#ef6b23] items-center justify-center px-2 py-1.5 rounded-[40px] h-auto hover:bg-[#ef6b23]/90 border-none"
                          >
                            <span className="[font-family:'Satoshi-Medium',Helvetica] font-medium text-white text-xs md:text-lg tracking-[0] leading-[22.9px] whitespace-nowrap">
                              Invest Now
                            </span>
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Project Overview */}
                <Card className="border border-solid border-transparent bg-[linear-gradient(0deg,rgba(0,0,0,0.2)_0%,rgba(0,0,0,0.2)_100%),linear-gradient(119deg,rgba(255,255,255,0.3)_0%,rgba(255,255,255,0.05)_100%)] rounded-[10px]">
                  <CardContent className="flex flex-col items-center justify-between px-3 md:px-[15px] py-4 md:py-5">
                    <div className="flex flex-col items-start gap-2.5 w-full">
                      <div className="flex flex-col items-start gap-[5px] w-full">
                        <h3 className="[font-family:'Dubai-Bold',Helvetica] font-bold text-white text-base md:text-xl tracking-[0] leading-[normal]">
                          Project Overview
                        </h3>
                        <p className="[font-family:'Satoshi-Medium',Helvetica] font-medium text-white text-sm md:text-lg tracking-[0] leading-[normal]">
                          {project.usage} — {daysLeft} — {project.location}
                        </p>
                      </div>
                      <p className="[font-family:'Satoshi-Medium',Helvetica] font-medium text-white text-xs md:text-base tracking-[0] leading-[normal]">
                        {project.projectOverview ?? 'No overview available.'}
                      </p>
                    </div>

                    <div className="flex flex-col items-start gap-2.5 w-full mt-2.5">
                      <div className="flex items-center justify-center gap-[9.55px] w-full">
                        <h4 className="text-sm md:text-[17.2px] flex items-center justify-center flex-1 [font-family:'Satoshi-Bold',Helvetica] font-bold text-white tracking-[0] leading-[normal]">
                          Milestones and Timeline
                        </h4>
                      </div>
                      <div className="flex items-center justify-center gap-[4.77px] w-full">
                        <div className="flex items-start gap-[5px] flex-1">
                          <img
                            className="flex-1 w-full"
                            alt="Slider"
                            src="/figmaAssetsProjectDetails/slider-1.svg"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 md:flex md:items-center md:justify-between gap-2 w-full">
                        {milestones.map((label, i) => (
                          <div
                            key={i}
                            className="flex items-center justify-center [font-family:'Satoshi-Medium',Helvetica] font-medium text-white text-xs md:text-[17.2px] tracking-[0] leading-[normal]"
                          >
                            {label}
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* MIDDLE + RIGHT COLUMNS — add your JSX here */}

            </div>
          )}
        </div>
      </div>

      {/* CONFIRM INVESTMENT POPUP */}
      {confirmOpen && project && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/70">
          <div className="w-full max-w-sm rounded-2xl bg-[#111]/95 border border-white/20 p-5 space-y-4">
            <h3
              className="text-white text-lg font-semibold"
              style={{ fontFamily: 'Dubai, sans-serif' }}
            >
              Confirm Investment
            </h3>

            <p
              className="text-white/80 text-sm"
              style={{ fontFamily: 'Satoshi, sans-serif' }}
            >
              On confirming,{' '}
              <span className="font-semibold">
                ${Number(project.totalValue).toLocaleString()}
              </span>{' '}
              will be deducted from your funds and invested into{' '}
              <span className="font-semibold">{project.name}</span>.
            </p>

            {apiError && <p className="text-xs text-red-400">{apiError}</p>}

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                disabled={submitting}
                onClick={() => {
                  if (!submitting) {
                    setApiError(null);
                    setConfirmOpen(false);
                  }
                }}
                className="px-4 py-2 rounded-full text-xs font-medium text-white bg-white/10 hover:bg-white/20 disabled:opacity-60"
              >
                Cancel
              </button>

              <button
                disabled={submitting}
                onClick={async () => {
                  if (!project) return;
                  try {
                    setSubmitting(true);
                    setApiError(null);

                    const body = {
                      projectPoolId: project.pool.id,
                      amount: Number(project.totalValue),
                      expectedReturn: project.returnPercent,
                    };

                    const res = await fetchWithAuth(
                      `${BASE_URL}/user/simulation/investments`,
                      { method: 'POST', body: JSON.stringify(body) }
                    );

                    if (!res.ok) {
                      const text = await res.text();
                      setApiError(
                        `Failed to create investment (${res.status}). ${text || ''}`
                      );
                      setSubmitting(false);
                      return;
                    }

                    await res.json();
                    setSubmitting(false);
                    setConfirmOpen(false);
                    router.push(`/SimulatorDashboardF3?id=${project.id}`);
                  } catch {
                    setApiError('Something went wrong. Please try again.');
                    setSubmitting(false);
                  }
                }}
                className="px-4 py-2 rounded-full text-xs font-medium text-white bg-[#ef6b23] hover:bg-[#ef6b23]/90 disabled:opacity-60"
              >
                {submitting ? 'Processing...' : 'Confirm & Invest'}
              </button>
            </div>
          </div>
        </div>
      )}

      <FooterSection />
    </div>
  );
}

// ─── Default Export — wraps content in Suspense ────────────
export default function DashboardProject() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <ProjectDetailContent />
    </Suspense>
  );
}
