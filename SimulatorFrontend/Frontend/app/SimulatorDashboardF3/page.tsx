'use client';

import React, { JSX, useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, MapPin, Clock, TrendingUp } from 'lucide-react';
import { Slot } from '@radix-ui/react-slot';
import { type VariantProps, cva } from 'class-variance-authority';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import Image from 'next/image';
import { HeaderSection } from '@/app/Investordashboard/sections/HeaderSection';
const HeaderSectionAny: any = HeaderSection;

// ============ UTILITIES ============
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

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
async function refreshAccessToken(): Promise<string | null> {
  try {
    const refreshToken = getRefreshToken();
    if (!refreshToken) return null;
    const res = await fetch(`${BASE_URL}/user/auth/refresh-token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });
    if (!res.ok) { clearTokens(); return null; }
    const data = await res.json();
    const newAccessToken = data.data?.accessToken ?? data.data?.token ?? data.accessToken ?? data.token;
    const newRefreshToken = data.data?.refreshToken ?? data.refreshToken;
    if (!newAccessToken) return null;
    setTokens(newAccessToken, newRefreshToken);
    return newAccessToken;
  } catch { return null; }
}
async function fetchWithAuth(url: string, options: RequestInit = {}): Promise<Response> {
  const token = getToken();
  const res = await fetch(url, {
    ...options,
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}`, ...options.headers },
  });
  if (res.status === 401) {
    const newToken = await refreshAccessToken();
    if (!newToken) { clearTokens(); window.location.href = '/login'; return res; }
    return fetch(url, {
      ...options,
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${newToken}`, ...options.headers },
    });
  }
  return res;
}

// ─── Image resolver ────────────────────────────────────────
function resolveImageUrl(imageUrl: string): string {
  if (!imageUrl) return '/building.png';
  if (imageUrl.startsWith('https://res.cloudinary.com')) return imageUrl;
  if (imageUrl.startsWith('/public'))
    return `https://cobuild-simulator-backend.onrender.com${imageUrl}`;
  if (imageUrl.startsWith('http')) return imageUrl;
  return '/building.png';
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

// ============ BUTTON ============
const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground shadow hover:bg-primary/90',
        ghost:   'hover:bg-accent hover:text-accent-foreground',
      },
      size: {
        default: 'h-9 px-4 py-2',
        sm:      'h-8 rounded-md px-3 text-xs',
        icon:    'h-9 w-9',
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

// ============ CARD ============
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

// ─── Skeleton ──────────────────────────────────────────────
function SimulatorSkeleton() {
  return (
    <div className="animate-pulse w-full h-full flex flex-col items-center justify-center gap-6 p-8">
      <div className="w-40 h-6 rounded bg-white/10" />
      <div className="w-36 h-5 rounded bg-white/10" />
      <div className="w-[280px] h-[280px] rounded-2xl bg-white/10" />
      <div className="w-[320px] h-10 rounded-full bg-white/10" />
      <div className="w-32 h-7 rounded-full bg-white/10" />
    </div>
  );
}

// ─── Page-level fallback ───────────────────────────────────
function PageFallback() {
  return (
    <div className="bg-black w-full min-h-screen flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-[#ef6b23]/30 border-t-[#ef6b23] rounded-full animate-spin" />
    </div>
  );
}

// ============ INNER CONTENT (uses useSearchParams) ============
function SimulatorDashboardF3Content(): JSX.Element {
  const router      = useRouter();
  const searchParams = useSearchParams();
  const projectId   = searchParams.get('id');

  const [project,        setProject]        = useState<ProjectData | null>(null);
  const [loadingProject, setLoadingProject] = useState(true);
  const [projectError,   setProjectError]   = useState<string | null>(null);
  const [imgSrc,         setImgSrc]         = useState('/building.png');
  const [animProgress,   setAnimProgress]   = useState(0);

  // ─── Fetch project ──────────────────────────────────────
  useEffect(() => {
    if (!projectId) {
      setProjectError('No project ID provided.');
      setLoadingProject(false);
      return;
    }
    const fetchProject = async () => {
      setLoadingProject(true);
      setProjectError(null);
      try {
        const res = await fetchWithAuth(`${BASE_URL}/user/simulation/projects/${projectId}`);
        if (!res.ok) { setProjectError(`Failed to load project (${res.status})`); return; }
        const json = await res.json();
        console.log('✅ [SIMULATOR] Project:', json.data);
        setProject(json.data);
        setImgSrc(resolveImageUrl(json.data.imageUrl));
      } catch {
        setProjectError('Something went wrong loading the project.');
      } finally {
        setLoadingProject(false);
      }
    };
    fetchProject();
  }, [projectId]);

  // ─── Animate progress bar ───────────────────────────────
  useEffect(() => {
    if (!project) return;
    const target = project.latestProgress ?? 0;
    setAnimProgress(0);
    const step  = Math.max(target / 80, 0.5);
    const timer = setInterval(() => {
      setAnimProgress(prev => {
        const next = prev + step;
        if (next >= target) { clearInterval(timer); return target; }
        return next;
      });
    }, 16);
    return () => clearInterval(timer);
  }, [project]);

  const daysLeft = project
    ? project.timelineDays > 365
      ? `${Math.round(project.timelineDays / 365)}y left`
      : `${project.timelineDays}d left`
    : '—';

  const progressPercent = Math.round(animProgress);
  const isComplete      = progressPercent >= 100;

  return (
    <div className="bg-black w-full min-h-screen flex flex-col px-2 md:px-4 lg:px-6 xl:px-8">

      {/* Header */}
      <div className="w-full max-w-[1836px] mx-auto mt-3 md:mt-4">
        <HeaderSectionAny
          showNavButtons={true}
          onMobileMenuToggle={(isOpen: boolean) => console.log('Menu toggled:', isOpen)}
        />
      </div>

      {/* Back + Title */}
      <div className="flex flex-row items-center justify-between gap-3 mt-4 md:mt-6 max-w-[1836px] mx-auto w-full">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <button
            onClick={() => router.back()}
            className="flex items-center justify-center w-[40px] h-[40px] sm:w-[50px] sm:h-[50px] rounded-full bg-[#3D3D3D] hover:bg-[#4D4D4D] transition-all flex-shrink-0 border border-white/10"
            aria-label="Go back"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <div className="flex flex-col min-w-0">
            <h1
              className="font-bold text-white text-lg sm:text-xl md:text-2xl lg:text-3xl truncate"
              style={{ fontFamily: 'Dubai, sans-serif' }}
            >
              {loadingProject ? 'Loading...' : project?.name ?? 'Simulation'}
            </h1>
            {project && (
              <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                <span
                  className="flex items-center gap-1 text-white/50 text-xs"
                  style={{ fontFamily: 'Satoshi, sans-serif' }}
                >
                  <MapPin size={11} />{project.location}
                </span>
                <span
                  className="flex items-center gap-1 text-white/50 text-xs"
                  style={{ fontFamily: 'Satoshi, sans-serif' }}
                >
                  <Clock size={11} />{daysLeft}
                </span>
                <span
                  className="flex items-center gap-1 text-[#13AE85] text-xs font-semibold"
                  style={{ fontFamily: 'Satoshi, sans-serif' }}
                >
                  <TrendingUp size={11} />+{project.returnPercent}% return
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Investment pill */}
        {project && (
          <div
            className="hidden sm:flex flex-col items-end gap-1 flex-shrink-0 px-4 py-2.5 rounded-2xl border border-white/10"
            style={{ background: 'rgba(255,255,255,0.05)' }}
          >
            <span className="text-white/40 text-[10px]" style={{ fontFamily: 'Satoshi, sans-serif' }}>
              Total Value
            </span>
            <span className="text-white font-bold text-sm md:text-base" style={{ fontFamily: 'Dubai, sans-serif' }}>
              ${Number(project.totalValue).toLocaleString()}
            </span>
            {project.pool?.userInvestment != null && (
              <>
                <span className="text-white/40 text-[10px] mt-1" style={{ fontFamily: 'Satoshi, sans-serif' }}>
                  Your Investment
                </span>
                <span className="text-[#13AE85] font-semibold text-sm" style={{ fontFamily: 'Dubai, sans-serif' }}>
                  ${Number(project.pool.userInvestment).toLocaleString()}
                </span>
              </>
            )}
          </div>
        )}
      </div>

      {/* ─── Main Simulator Card ─────────────────────────────── */}
      <Card
        className="w-full max-w-[1829px] mx-auto mt-6 md:mt-8 mb-6 rounded-[20px] border border-white/10 overflow-hidden"
        style={{ background: '#3D3D3D', minHeight: '600px' }}
      >
        <CardContent className="p-0 h-full w-full">

          {/* Loading */}
          {loadingProject && <SimulatorSkeleton />}

          {/* Error */}
          {!loadingProject && projectError && (
            <div className="flex flex-col items-center justify-center gap-4 py-20">
              <p className="text-red-400 text-sm" style={{ fontFamily: 'Satoshi, sans-serif' }}>
                {projectError}
              </p>
              <button
                onClick={() => router.back()}
                className="px-5 py-2 rounded-full text-xs text-white"
                style={{ background: '#ef6b23' }}
              >
                Go Back
              </button>
            </div>
          )}

          {/* ─── Loaded ─── */}
          {!loadingProject && !projectError && project && (
            <div className="flex flex-col items-center justify-center w-full h-full py-8 px-4 sm:px-6 md:px-10 gap-6 md:gap-8">

              {/* Phase label */}
              <div className="flex flex-col items-center gap-1.5">
                <span
                  className="font-bold text-white text-2xl sm:text-3xl md:text-4xl lg:text-[42px]"
                  style={{ fontFamily: 'Satoshi, sans-serif' }}
                >
                  Phase 1
                </span>
                <span
                  className="font-medium text-xl sm:text-2xl md:text-3xl lg:text-[36px]"
                  style={{
                    fontFamily: 'Satoshi, sans-serif',
                    color: isComplete ? '#13AE85' : '#ef6b23',
                  }}
                >
                  {isComplete ? 'Complete' : 'In Progress'}
                </span>
              </div>

              {/* Project image */}
              <div
                className="relative rounded-2xl overflow-hidden flex-shrink-0"
                style={{
                  width:  'clamp(220px, 55vw, 500px)',
                  height: 'clamp(220px, 40vw, 420px)',
                }}
              >
                <Image
                  src={imgSrc}
                  alt={project.name}
                  fill
                  className="object-cover object-center"
                  sizes="(max-width: 640px) 80vw, 500px"
                  priority
                  onError={() => setImgSrc('/building.png')}
                />
              </div>

              {/* Progress bar */}
              <div className="w-full max-w-[clamp(200px,45vw,510px)] flex flex-col gap-2">
                <div className="flex items-center justify-between px-1">
                  <span
                    className="text-white/50 text-xs sm:text-sm"
                    style={{ fontFamily: 'Satoshi, sans-serif' }}
                  >
                    Founding Progress
                  </span>
                  <span
                    className="font-bold text-sm sm:text-base"
                    style={{
                      fontFamily: 'Satoshi, sans-serif',
                      color: isComplete ? '#13AE85' : '#ef6b23',
                    }}
                  >
                    {progressPercent}%
                  </span>
                </div>

                <div
                  className="w-full rounded-full overflow-hidden"
                  style={{ height: 'clamp(32px, 4vw, 48px)', background: 'rgba(0,0,0,0.4)' }}
                >
                  <div
                    className="h-full rounded-full transition-all duration-300 ease-out relative overflow-hidden"
                    style={{
                      width: `${Math.min(progressPercent, 100)}%`,
                      background: isComplete
                        ? 'linear-gradient(90deg, #0d8a69, #13AE85)'
                        : 'linear-gradient(90deg, #c94e10, #ef6b23)',
                      minWidth: progressPercent > 0 ? '40px' : '0px',
                    }}
                  >
                    {/* Shimmer */}
                    <div
                      className="absolute inset-0"
                      style={{
                        background:
                          'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.25) 50%, transparent 100%)',
                        backgroundSize: '200% 100%',
                        animation: 'shimmer 1.8s linear infinite',
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Bottom info row */}
              <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
                {project.projectOverview && (
                  <span
                    className="text-white/40 text-xs sm:text-sm text-center max-w-[260px] truncate"
                    style={{ fontFamily: 'Satoshi, sans-serif' }}
                  >
                    {project.projectOverview}
                  </span>
                )}

                <span
                  className="px-4 py-1.5 rounded-full text-xs sm:text-sm font-medium text-white border border-white/20"
                  style={{ background: 'rgba(255,255,255,0.1)', fontFamily: 'Satoshi, sans-serif' }}
                >
                  {project.usage}
                </span>

                {project.pool?.userInvestment != null && (
                  <span
                    className="px-4 py-1.5 rounded-full text-xs sm:text-sm font-semibold"
                    style={{
                      background: 'rgba(19,174,133,0.15)',
                      color: '#13AE85',
                      border: '1px solid rgba(19,174,133,0.35)',
                      fontFamily: 'Satoshi, sans-serif',
                    }}
                  >
                    ✓ ${Number(project.pool.userInvestment).toLocaleString()} invested
                  </span>
                )}
              </div>

              {/* Stats grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 w-full max-w-[clamp(280px,80vw,800px)]">
                {[
                  { label: 'Total Value', value: `$${Number(project.totalValue).toLocaleString()}` },
                  { label: 'Return',      value: `+${project.returnPercent}%`, green: true },
                  { label: 'Timeline',    value: daysLeft },
                  { label: 'Asset',       value: project.pool?.asset ?? 'USD' },
                ].map(stat => (
                  <div
                    key={stat.label}
                    className="flex flex-col items-center gap-0.5 px-3 py-3 rounded-2xl"
                    style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.08)' }}
                  >
                    <span
                      className="text-white/40 text-[9px] sm:text-[10px] uppercase tracking-wider"
                      style={{ fontFamily: 'Satoshi, sans-serif' }}
                    >
                      {stat.label}
                    </span>
                    <span
                      className="font-bold text-sm sm:text-base"
                      style={{ fontFamily: 'Dubai, sans-serif', color: stat.green ? '#13AE85' : 'white' }}
                    >
                      {stat.value}
                    </span>
                  </div>
                ))}
              </div>

            </div>
          )}
        </CardContent>
      </Card>

      <style jsx global>{`
        @keyframes shimmer {
          0%   { background-position: -200% 0; }
          100% { background-position:  200% 0; }
        }
      `}</style>
    </div>
  );
}

// ============ DEFAULT EXPORT — Suspense wrapper ============
export default function SimulatorDashboardF3(): JSX.Element {
  return (
    <Suspense fallback={<PageFallback />}>
      <SimulatorDashboardF3Content />
    </Suspense>
  );
}
