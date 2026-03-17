'use client';

import * as TabsPrimitive from '@radix-ui/react-tabs';
import { Slot } from '@radix-ui/react-slot';
import { type VariantProps, cva } from 'class-variance-authority';
import { clsx, type ClassValue } from 'clsx';
import { ArrowLeft, ArrowRight, Share2 } from 'lucide-react';
import * as React from 'react';
import { useState, useEffect, Suspense } from 'react';
import { twMerge } from 'tailwind-merge';
import { useRouter, useSearchParams } from 'next/navigation';
import { useLocale } from 'next-intl';
import Image from 'next/image';
import { HeaderSection } from '@/app/[locale]/Investordashboard/sections/HeaderSection';
import { FooterSection } from '@/app/[locale]/Investordashboard/sections/FooterSection';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const BASE_URL = 'https://cobuild-simulator-backend.onrender.com/api/v1';

// ─── Translations ──────────────────────────────────────────
const t = {
  en: {
    loading:            'Loading...',
    projectDetail:      'Project Detail',
    share:              'Share',
    goBack:             'Go Back',
    noProjectId:        'No project ID provided.',
    fetchError:         (s: number) => `Failed to load project (${s})`,
    somethingWrong:     'Something went wrong. Please try again.',
    downloadPdf:        'Download PDF',
    investNow:          'Invest Now',
    projectOverview:    'Project Overview',
    noOverview:         'No overview available.',
    milestonesTimeline: 'Milestones and Timeline',
    milestones:         ['Launch', 'Construction Start', '50% Complete', 'Handover'],
    trackRecord:        'Track Record',
    projectsSold:       'Projects Sold',
    reviews:            'Review & Ratings',
    faqs:               'FAQs',
    discussion:         'Discussion',
    noFaqs:             'No FAQs available.',
    noDiscussion:       'No discussion yet.',
    confirmInvestment:  'Confirm Investment',
    confirmDesc:        'On confirming,',
    confirmDescMid:     'will be deducted from your funds and invested into',
    cancel:             'Cancel',
    confirmInvest:      'Confirm & Invest',
    processing:         'Processing...',
    investFailed:       (s: number, msg: string) => `Failed to create investment (${s}). ${msg}`,
    investError:        'Something went wrong. Please try again.',
    daysLeft:           (n: number) => `${n}d left`,
    yearsLeft:          (n: number) => `${n}y left`,
    totalValue:         'Total Value',
    expectedReturn:     'Expected Return',
    timeline:           'Timeline',
    asset:              'Asset',
    mode:               'Mode',
    fundingProgress:    'Funding Progress',
    smartContract:      'View Smart Contract ↗',
  },
  ar: {
    loading:            'جارٍ التحميل...',
    projectDetail:      'تفاصيل المشروع',
    share:              'مشاركة',
    goBack:             'العودة',
    noProjectId:        'لم يتم توفير معرّف المشروع.',
    fetchError:         (s: number) => `فشل تحميل المشروع (${s})`,
    somethingWrong:     'حدث خطأ ما. يرجى المحاولة مجدداً.',
    downloadPdf:        'تحميل PDF',
    investNow:          'استثمر الآن',
    projectOverview:    'نظرة عامة على المشروع',
    noOverview:         'لا توجد نظرة عامة متاحة.',
    milestonesTimeline: 'المعالم والجدول الزمني',
    milestones:         ['الإطلاق', 'بدء البناء', 'اكتمال 50%', 'التسليم'],
    trackRecord:        'سجل الأعمال',
    projectsSold:       'المشاريع المُباعة',
    reviews:            'التقييمات والمراجعات',
    faqs:               'الأسئلة الشائعة',
    discussion:         'النقاش',
    noFaqs:             'لا توجد أسئلة شائعة متاحة.',
    noDiscussion:       'لا توجد تعليقات بعد.',
    confirmInvestment:  'تأكيد الاستثمار',
    confirmDesc:        'عند التأكيد، سيتم خصم',
    confirmDescMid:     'من رصيدك واستثمارها في',
    cancel:             'إلغاء',
    confirmInvest:      'تأكيد والاستثمار',
    processing:         'جارٍ المعالجة...',
    investFailed:       (s: number, msg: string) => `فشل إنشاء الاستثمار (${s}). ${msg}`,
    investError:        'حدث خطأ ما. يرجى المحاولة مجدداً.',
    daysLeft:           (n: number) => `${n} يوم متبقٍ`,
    yearsLeft:          (n: number) => `${n} سنة متبقية`,
    totalValue:         'القيمة الإجمالية',
    expectedReturn:     'العائد المتوقع',
    timeline:           'الجدول الزمني',
    asset:              'الأصل',
    mode:               'النمط',
    fundingProgress:    'تقدم التمويل',
    smartContract:      'عرض العقد الذكي ↗',
  },
};

// ─── Token Helpers ─────────────────────────────────────────
function getToken():        string { return localStorage.getItem('accessToken')  ?? ''; }
function getRefreshToken(): string { return localStorage.getItem('refreshToken') ?? ''; }
function setTokens(at: string, rt?: string) {
  localStorage.setItem('accessToken', at);
  if (rt) localStorage.setItem('refreshToken', rt);
}
function clearTokens() {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
}

// ─── Refresh Token ─────────────────────────────────────────
// NOTE: refresh-token call intentionally uses 'en' — it's an auth call, not content
async function refreshAccessToken(): Promise<string | null> {
  const rt = getRefreshToken();
  if (!rt) return null;
  try {
    const res = await fetch(`${BASE_URL}/user/auth/refresh-token`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ refreshToken: rt }),
    });
    if (!res.ok) { clearTokens(); return null; }
    const data  = await res.json();
    const newAt = data.data?.accessToken ?? data.data?.token ?? data.accessToken ?? data.token;
    const newRt = data.data?.refreshToken ?? data.refreshToken;
    if (!newAt) return null;
    setTokens(newAt, newRt);
    return newAt;
  } catch { return null; }
}

// ─── fetchWithAuth — now accepts locale ───────────────────
// Sends Accept-Language header on every request so the backend
// can return Arabic or English content accordingly.
async function fetchWithAuth(
  url:     string,
  options: RequestInit = {},
  locale:  string = 'en',            // ✅ NEW — defaults to 'en'
): Promise<Response> {
  const token = getToken();

  const makeHeaders = (t: string) => ({
    'Content-Type':    'application/json',
    Authorization:     `Bearer ${t}`,
    'Accept-Language': locale,         // ✅ tells backend which language to return
    ...options.headers,
  });

  const res = await fetch(url, { ...options, headers: makeHeaders(token) });

  if (res.status === 401) {
    const newToken = await refreshAccessToken();
    if (!newToken) {
      clearTokens();
      window.location.href = '/login';
      return res;
    }
    return fetch(url, { ...options, headers: makeHeaders(newToken) });
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
  if (imageUrl.startsWith('/public'))
    return `https://cobuild-simulator-backend.onrender.com${imageUrl}`;
  if (imageUrl.startsWith('http')) return imageUrl;
  return '/building.png';
}

// ─── Badge ─────────────────────────────────────────────────
const badgeVariants = cva(
  'inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors',
  {
    variants: {
      variant: {
        default:     'border-transparent bg-primary text-primary-foreground shadow hover:bg-primary/80',
        secondary:   'border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80',
        destructive: 'border-transparent bg-destructive text-destructive-foreground shadow hover:bg-destructive/90',
        outline:     'text-foreground',
      },
    },
    defaultVariants: { variant: 'default' },
  }
);
interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}
function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

// ─── Button ────────────────────────────────────────────────
const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default:     'bg-primary text-primary-foreground shadow hover:bg-primary/90',
        outline:     'border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground',
        ghost:       'hover:bg-accent hover:text-accent-foreground',
        link:        'text-primary underline-offset-4 hover:underline',
        secondary:   'bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80',
        destructive: 'bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90',
      },
      size: {
        default: 'h-9 px-4 py-2',
        sm:      'h-8 rounded-md px-3 text-xs',
        lg:      'h-10 rounded-md px-8',
        icon:    'h-9 w-9',
      },
    },
    defaultVariants: { variant: 'default', size: 'default' },
  }
);
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
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

// ─── Static Data ───────────────────────────────────────────
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
    rating: 5, date: 'Oct 20, 2035',
    text:   'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
    author: 'Alice Johnson',
    starsImage: '/figmaAssetsProjectDetails/stars.svg',
  },
  {
    rating: 5, date: 'Oct 20, 2035',
    text:   'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
    author: 'Alice Johnson',
    starsImage: '/figmaAssetsProjectDetails/stars-2.svg',
  },
];

// ─── Skeletons ─────────────────────────────────────────────
function ProjectDetailSkeleton() {
  return (
    <div className="animate-pulse space-y-4 p-6">
      <div className="h-[300px] rounded-2xl bg-white/10" />
      <div className="h-8 w-1/3 rounded bg-white/10" />
      <div className="h-4 w-1/2 rounded bg-white/10" />
      <div className="grid grid-cols-3 gap-4">
        {[1, 2, 3].map(i => <div key={i} className="h-40 rounded-xl bg-white/10" />)}
      </div>
    </div>
  );
}
function PageSkeleton() {
  return (
    <div className="bg-[#0a0a0a] w-full min-h-screen flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-[#ef6b23]/30 border-t-[#ef6b23] rounded-full animate-spin" />
    </div>
  );
}

// ─── Stat Card ─────────────────────────────────────────────
function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div
      className="flex flex-col gap-1 px-4 py-3 rounded-xl border border-white/10"
      style={{ background: 'rgba(255,255,255,0.05)' }}
    >
      <span className="text-white/40 text-[10px] uppercase tracking-wide" style={{ fontFamily: 'Satoshi, sans-serif' }}>
        {label}
      </span>
      <span className="text-white font-bold text-base md:text-lg" style={{ fontFamily: 'Dubai, sans-serif' }}>
        {value}
      </span>
    </div>
  );
}

// ─── Inner Content ─────────────────────────────────────────
function ProjectDetailContent() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const projectId    = searchParams.get('id');
  const locale       = useLocale();               // ✅ 'en' or 'ar'
  const isAr         = locale === 'ar';
  const tx           = isAr ? t.ar : t.en;
  const BackIcon     = isAr ? ArrowRight : ArrowLeft;

  const [project,     setProject]     = useState<ProjectData | null>(null);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState<string | null>(null);
  const [imgSrc,      setImgSrc]      = useState('/building.png');
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [submitting,  setSubmitting]  = useState(false);
  const [apiError,    setApiError]    = useState<string | null>(null);

  useEffect(() => {
    if (!projectId) {
      setError(tx.noProjectId);
      setLoading(false);
      return;
    }

    const fetchProject = async () => {
      setLoading(true);
      setError(null);
      try {
        // ✅ Pass locale → sets Accept-Language: ar (or en) on the request
        const res = await fetchWithAuth(
          `${BASE_URL}/user/simulation/projects/${projectId}`,
          {},
          locale,
        );
        if (!res.ok) { setError(tx.fetchError(res.status)); return; }
        const json         = await res.json();
        const data: ProjectData = json.data;
        setProject(data);
        setImgSrc(resolveImageUrl(data.imageUrl));
      } catch {
        setError(tx.somethingWrong);
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId, locale]);   // ✅ re-fetch when locale changes (user switches language)

  // ── Derived ─────────────────────────────────────────────
  const daysLeft = project
    ? project.timelineDays > 365
      ? tx.yearsLeft(Math.round(project.timelineDays / 365))
      : tx.daysLeft(project.timelineDays)
    : '—';

  const progressPercent = project?.latestProgress ?? 0;

  const communityTabs = [
    { value: 'reviews',    label: tx.reviews    },
    { value: 'faqs',       label: tx.faqs       },
    { value: 'discussion', label: tx.discussion },
  ];

  return (
    <div dir={isAr ? 'rtl' : 'ltr'} className="bg-[#0a0a0a] w-full min-h-screen flex flex-col">

      {/* ── Header ──────────────────────────────────────── */}
      <div className="w-full px-1.5 sm:px-3 md:px-5 lg:px-7 -mt-2 md:-mt-3">
        <div className="w-full max-w-[2400px] mx-auto">
          <div style={{ maxWidth: '2000px', margin: '0 auto' }}>
            <HeaderSection />
          </div>
        </div>

        {/* Title Row */}
        <div
          className="flex items-center justify-between px-4 md:px-6 lg:px-8 py-3 md:py-4 mt-3 md:mt-4"
          style={{ width: '100%', maxWidth: 1834, marginInline: 'auto' }}
        >
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="hidden md:flex items-center justify-center w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 transition-all"
            >
              <BackIcon size={20} className="text-white" />
            </button>
            <h1 className="[font-family:'Dubai-Bold',Helvetica] font-bold text-white text-xl md:text-2xl lg:text-3xl">
              {loading ? tx.loading : project?.name ?? tx.projectDetail}
            </h1>
          </div>
          <button className="flex items-center justify-center gap-2 px-4 md:px-6 py-2 md:py-3 rounded-[25px] bg-white/10 hover:bg-white/20 border border-white/20 transition-all">
            <Share2 size={18} className="text-white" />
            <span className="text-white text-sm md:text-base font-medium" style={{ fontFamily: 'Dubai, sans-serif' }}>
              {tx.share}
            </span>
          </button>
        </div>
      </div>

      {/* ── Main Content ────────────────────────────────── */}
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
                {tx.goBack}
              </button>
            </div>
          )}

          {/* Loading */}
          {loading && !error && <ProjectDetailSkeleton />}

          {/* Loaded */}
          {!loading && !error && project && (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-[1fr_1.5fr_1fr] gap-3 md:gap-[15px]">

              {/* ── LEFT COLUMN ─────────────────────────── */}
              <div className="flex flex-col gap-3 md:gap-[15px]">

                {/* Image + Name */}
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
                              <h2 className="[font-family:'Dubai-Bold',Helvetica] font-bold text-white text-lg md:text-[25px]">
                                {project.name}
                              </h2>
                              <img className="w-5 h-5 md:w-6 md:h-6" alt="Status" src="/figmaAssetsProjectDetails/frame-3.svg" />
                            </div>
                            <Badge className="inline-flex items-center justify-center gap-1 px-2 md:px-[9.55px] py-1 bg-[#fef9bfcc] rounded-[7.64px] h-auto border-none hover:bg-[#fef9bfcc]">
                              <img className="w-4 h-4 md:w-[19.09px] md:h-[19.09px]" alt="Clock" src="/figmaAssetsProjectDetails/frame-2.svg" />
                              <span className="[font-family:'Satoshi-Medium',Helvetica] font-medium text-[#231f1f] text-xs md:text-[16.2px] whitespace-nowrap">
                                {daysLeft}
                              </span>
                            </Badge>
                          </div>
                          <div className="inline-flex items-center gap-[3px]">
                            <img className="w-4 h-4 md:w-5 md:h-5" alt="Location" src="/figmaAssetsProjectDetails/frame-1.svg" />
                            <p className="[font-family:'Satoshi-Medium',Helvetica] font-medium text-white text-sm md:text-xl">
                              {project.location}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-start gap-2 md:gap-[5px] px-0 py-[5px] w-full">
                        <div className="flex items-center gap-2 flex-1">
                          <Button className="flex-1 bg-[#ffffff1a] border border-solid border-white px-2 py-1.5 rounded-[40px] h-auto hover:bg-[#ffffff2a]">
                            <span className="[font-family:'Satoshi-Medium',Helvetica] font-medium text-white text-xs md:text-lg whitespace-nowrap">
                              {tx.downloadPdf}
                            </span>
                          </Button>
                        </div>
                        <div className="flex items-center gap-2 flex-1">
                          <Button
                            onClick={() => { setApiError(null); setConfirmOpen(true); }}
                            className="flex-1 bg-[#ef6b23] px-2 py-1.5 rounded-[40px] h-auto hover:bg-[#ef6b23]/90 border-none"
                          >
                            <span className="[font-family:'Satoshi-Medium',Helvetica] font-medium text-white text-xs md:text-lg whitespace-nowrap">
                              {tx.investNow}
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
                        <h3 className="[font-family:'Dubai-Bold',Helvetica] font-bold text-white text-base md:text-xl">
                          {tx.projectOverview}
                        </h3>
                        <p className="[font-family:'Satoshi-Medium',Helvetica] font-medium text-white text-sm md:text-lg">
                          {project.usage} — {daysLeft} — {project.location}
                        </p>
                      </div>
                      <p className="[font-family:'Satoshi-Medium',Helvetica] font-medium text-white text-xs md:text-base leading-relaxed">
                        {project.projectOverview ?? tx.noOverview}
                      </p>
                    </div>

                    {/* Milestones */}
                    <div className="flex flex-col items-start gap-2.5 w-full mt-2.5">
                      <div className="flex items-center justify-center gap-[9.55px] w-full">
                        <h4 className="text-sm md:text-[17.2px] flex items-center justify-center flex-1 [font-family:'Satoshi-Bold',Helvetica] font-bold text-white">
                          {tx.milestonesTimeline}
                        </h4>
                      </div>
                      <div className="flex items-center justify-center gap-[4.77px] w-full">
                        <div className="flex items-start gap-[5px] flex-1">
                          <img className="flex-1 w-full" alt="Slider" src="/figmaAssetsProjectDetails/slider-1.svg" />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 md:flex md:items-center md:justify-between gap-2 w-full">
                        {tx.milestones.map((label, i) => (
                          <div key={i} className="flex items-center justify-center [font-family:'Satoshi-Medium',Helvetica] font-medium text-white text-xs md:text-[17.2px]">
                            {label}
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* ── MIDDLE COLUMN ────────────────────────── */}
              <div className="flex flex-col gap-3 md:gap-[15px]">

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-3">
                  <StatCard label={tx.totalValue}    value={`$${Number(project.totalValue).toLocaleString()}`} />
                  <StatCard label={tx.expectedReturn} value={`${project.returnPercent}%`} />
                  <StatCard label={tx.timeline}       value={daysLeft} />
                  <StatCard label={tx.asset}          value={project.pool.asset} />
                </div>

                {/* Funding Progress */}
                <Card className="border border-transparent bg-[linear-gradient(0deg,rgba(0,0,0,0.2)_0%,rgba(0,0,0,0.2)_100%),linear-gradient(119deg,rgba(255,255,255,0.3)_0%,rgba(255,255,255,0.05)_100%)] rounded-[10px]">
                  <CardContent className="px-3 md:px-[15px] py-4 md:py-5">
                    <h3 className="[font-family:'Dubai-Bold',Helvetica] font-bold text-white text-base md:text-xl mb-3">
                      {tx.fundingProgress}
                    </h3>
                    <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#ef6b23] rounded-full transition-all duration-700"
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                    <div className="flex justify-between mt-2">
                      <span className="text-white/40 text-xs" style={{ fontFamily: 'Satoshi, sans-serif' }}>0%</span>
                      <span className="text-[#ef6b23] text-xs font-semibold" style={{ fontFamily: 'Satoshi, sans-serif' }}>{progressPercent}%</span>
                      <span className="text-white/40 text-xs" style={{ fontFamily: 'Satoshi, sans-serif' }}>100%</span>
                    </div>
                  </CardContent>
                </Card>

                {/* Project Details */}
                {project.projectDetails && (
                  <Card className="border border-transparent bg-[linear-gradient(0deg,rgba(0,0,0,0.2)_0%,rgba(0,0,0,0.2)_100%),linear-gradient(119deg,rgba(255,255,255,0.3)_0%,rgba(255,255,255,0.05)_100%)] rounded-[10px]">
                    <CardContent className="px-3 md:px-[15px] py-4 md:py-5">
                      <p className="[font-family:'Satoshi-Medium',Helvetica] font-medium text-white text-xs md:text-base leading-relaxed">
                        {project.projectDetails}
                      </p>
                    </CardContent>
                  </Card>
                )}

                {/* Community Tabs */}
                <Card className="border border-transparent bg-[linear-gradient(0deg,rgba(0,0,0,0.2)_0%,rgba(0,0,0,0.2)_100%),linear-gradient(119deg,rgba(255,255,255,0.3)_0%,rgba(255,255,255,0.05)_100%)] rounded-[10px]">
                  <CardContent className="px-3 md:px-[15px] py-4 md:py-5">
                    <Tabs defaultValue="reviews">
                      <TabsList className="w-full bg-white/10 mb-4">
                        {communityTabs.map(tab => (
                          <TabsTrigger
                            key={tab.value}
                            value={tab.value}
                            className="flex-1 text-white/60 data-[state=active]:text-white data-[state=active]:bg-[#ef6b23] text-xs md:text-sm"
                          >
                            {tab.label}
                          </TabsTrigger>
                        ))}
                      </TabsList>
                      <TabsContent value="reviews">
                        <div className="space-y-4">
                          {reviews.map((r, i) => (
                            <div key={i} className="flex flex-col gap-2 border-b border-white/10 pb-4 last:border-0">
                              <div className="flex items-center justify-between">
                                <img src={r.starsImage} alt="stars" className="h-4" />
                                <span className="text-white/40 text-[10px]">{r.date}</span>
                              </div>
                              <p className="text-white/70 text-xs" style={{ fontFamily: 'Satoshi, sans-serif' }}>{r.text}</p>
                              <span className="text-white/50 text-[10px] font-semibold">{r.author}</span>
                            </div>
                          ))}
                        </div>
                      </TabsContent>
                      <TabsContent value="faqs">
                        <p className="text-white/40 text-sm text-center py-6">{tx.noFaqs}</p>
                      </TabsContent>
                      <TabsContent value="discussion">
                        <p className="text-white/40 text-sm text-center py-6">{tx.noDiscussion}</p>
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                </Card>
              </div>

              {/* ── RIGHT COLUMN ─────────────────────────── */}
              <div className="flex flex-col gap-3 md:gap-[15px]">

                {/* Track Record */}
                <Card className="border border-transparent bg-[linear-gradient(0deg,rgba(0,0,0,0.2)_0%,rgba(0,0,0,0.2)_100%),linear-gradient(119deg,rgba(255,255,255,0.3)_0%,rgba(255,255,255,0.05)_100%)] rounded-[10px]">
                  <CardContent className="px-3 md:px-[15px] py-4 md:py-5">
                    <h3 className="[font-family:'Dubai-Bold',Helvetica] font-bold text-white text-base md:text-xl mb-3">
                      {tx.trackRecord}
                    </h3>
                    <ul className="space-y-2">
                      {trackRecordItems.map((item, i) => (
                        <li key={i} className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-[#ef6b23] flex-shrink-0" />
                          <span className="text-white/70 text-xs" style={{ fontFamily: 'Satoshi, sans-serif' }}>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                {/* Projects Sold */}
                <Card className="border border-transparent bg-[linear-gradient(0deg,rgba(0,0,0,0.2)_0%,rgba(0,0,0,0.2)_100%),linear-gradient(119deg,rgba(255,255,255,0.3)_0%,rgba(255,255,255,0.05)_100%)] rounded-[10px]">
                  <CardContent className="px-3 md:px-[15px] py-4 md:py-5">
                    <h3 className="[font-family:'Dubai-Bold',Helvetica] font-bold text-white text-base md:text-xl mb-4">
                      {tx.projectsSold}
                    </h3>
                    <div className="space-y-3">
                      {projectSoldData.map((p, i) => (
                        <div key={i} className="flex flex-col gap-1">
                          <div className="flex justify-between items-center">
                            <span className="text-white/70 text-xs">{p.name}</span>
                            <span className="text-[#ef6b23] text-xs font-semibold">{p.percentage}%</span>
                          </div>
                          <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-[#ef6b23] rounded-full transition-all duration-700"
                              style={{ width: `${p.percentage}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Smart Contract */}
                {project.smartContractUrl && (
                  <Card className="border border-transparent bg-[linear-gradient(0deg,rgba(0,0,0,0.2)_0%,rgba(0,0,0,0.2)_100%),linear-gradient(119deg,rgba(255,255,255,0.3)_0%,rgba(255,255,255,0.05)_100%)] rounded-[10px]">
                    <CardContent className="px-3 md:px-[15px] py-4 md:py-5">
                      <a
                        href={project.smartContractUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#ef6b23] text-xs underline underline-offset-2 hover:opacity-80"
                        style={{ fontFamily: 'Satoshi, sans-serif' }}
                      >
                        {tx.smartContract}
                      </a>
                    </CardContent>
                  </Card>
                )}
              </div>

            </div>
          )}
        </div>
      </div>

      {/* ── Confirm Investment Modal ─────────────────────── */}
      {confirmOpen && project && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/70">
          <div
            dir={isAr ? 'rtl' : 'ltr'}
            className="w-full max-w-sm rounded-2xl bg-[#111]/95 border border-white/20 p-5 space-y-4"
          >
            <h3 className="text-white text-lg font-semibold" style={{ fontFamily: 'Dubai, sans-serif' }}>
              {tx.confirmInvestment}
            </h3>

            <p className="text-white/80 text-sm" style={{ fontFamily: 'Satoshi, sans-serif' }}>
              {tx.confirmDesc}{' '}
              <span className="font-semibold">${Number(project.totalValue).toLocaleString()}</span>
              {' '}{tx.confirmDescMid}{' '}
              <span className="font-semibold">{project.name}</span>.
            </p>

            {apiError && <p className="text-xs text-red-400">{apiError}</p>}

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                disabled={submitting}
                onClick={() => { if (!submitting) { setApiError(null); setConfirmOpen(false); } }}
                className="px-4 py-2 rounded-full text-xs font-medium text-white bg-white/10 hover:bg-white/20 disabled:opacity-60"
              >
                {tx.cancel}
              </button>
              <button
                disabled={submitting}
                onClick={async () => {
                  if (!project) return;
                  try {
                    setSubmitting(true);
                    setApiError(null);
                    const body = {
                      projectPoolId:  project.pool.id,
                      amount:         Number(project.totalValue),
                      expectedReturn: project.returnPercent,
                    };
                    // ✅ Pass locale so the investment response also comes in the right language
                    const res = await fetchWithAuth(
                      `${BASE_URL}/user/simulation/investments`,
                      { method: 'POST', body: JSON.stringify(body) },
                      locale,
                    );
                    if (!res.ok) {
                      const text = await res.text();
                      setApiError(tx.investFailed(res.status, text || ''));
                      setSubmitting(false);
                      return;
                    }
                    await res.json();
                    setSubmitting(false);
                    setConfirmOpen(false);
                    router.push(`/SimulatorDashboardF3?id=${project.id}`);
                  } catch {
                    setApiError(tx.investError);
                    setSubmitting(false);
                  }
                }}
                className="px-4 py-2 rounded-full text-xs font-medium text-white bg-[#ef6b23] hover:bg-[#ef6b23]/90 disabled:opacity-60"
              >
                {submitting ? tx.processing : tx.confirmInvest}
              </button>
            </div>
          </div>
        </div>
      )}

      <FooterSection />
    </div>
  );
}

// ─── Default Export ────────────────────────────────────────
export default function DashboardProject() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <ProjectDetailContent />
    </Suspense>
  );
}
