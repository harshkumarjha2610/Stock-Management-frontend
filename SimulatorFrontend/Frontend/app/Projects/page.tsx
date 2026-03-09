'use client';

import React, { useState, useEffect, useId, Suspense } from 'react';
import {
  ArrowLeft, ChevronDown, MapPin, Search, Home, Filter, CheckCircle2
} from 'lucide-react';
import Image from 'next/image';
import { HeaderSection } from '@/app/Investordashboard/sections/HeaderSection';
import { FooterSection } from '@/app/Investordashboard/sections/FooterSection';
import { useRouter, useSearchParams } from 'next/navigation';

// --- Base URL ---
const BASE_URL = 'https://cobuild-simulator-backend.onrender.com/api/v1';

// ─── Token Helpers ────────────────────────────────────────
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
function logTokenStatus() {
  const access = localStorage.getItem('accessToken');
  const refresh = localStorage.getItem('refreshToken');
  console.group('📋 [TOKEN STATUS]');
  console.log('accessToken :', access ? `✅ Present (${access.slice(0, 30)}...)` : '❌ Missing');
  console.log('refreshToken:', refresh ? `✅ Present (${refresh.slice(0, 30)}...)` : '❌ Missing');
  console.groupEnd();
}

// ─── Refresh Access Token ─────────────────────────────────
async function refreshAccessToken(): Promise<string | null> {
  try {
    const refreshToken = getRefreshToken();
    if (!refreshToken) return null;
    const response = await fetch(`${BASE_URL}/user/auth/refresh-token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });
    if (!response.ok) { clearTokens(); return null; }
    const data = await response.json();
    const newAccessToken =
      data.data?.accessToken ?? data.data?.token ?? data.accessToken ?? data.token;
    const newRefreshToken = data.data?.refreshToken ?? data.refreshToken;
    if (!newAccessToken) return null;
    setTokens(newAccessToken, newRefreshToken);
    return newAccessToken;
  } catch { return null; }
}

// ─── Smart Fetch ──────────────────────────────────────────
async function fetchWithAuth(url: string, options: RequestInit = {}): Promise<Response> {
  const token = getToken();
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  });
  if (response.status === 401) {
    const newToken = await refreshAccessToken();
    if (!newToken) {
      clearTokens();
      window.location.href = '/login';
      return response;
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
  return response;
}

// --- TypeScript Interfaces ---
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

interface ProjectCardProps {
  data: ProjectData;
  isFeatured?: boolean;
}

// ─── Image URL helper ─────────────────────────────────────
function resolveImageUrl(imageUrl: string): string {
  if (!imageUrl) return '/building.png';
  if (imageUrl.startsWith('https://res.cloudinary.com')) return imageUrl;
  if (imageUrl.startsWith('/public'))
    return `https://cobuild-simulator-backend.onrender.com${imageUrl}`;
  if (imageUrl.startsWith('http')) return imageUrl;
  return '/building.png';
}

// ─── Safe Image ───────────────────────────────────────────
function ProjectImage({
  src, alt, isFeatured, projectName,
}: { src: string; alt: string; isFeatured: boolean; projectName: string }) {
  const [imgSrc, setImgSrc] = useState(src);
  const [hasError, setHasError] = useState(false);
  useEffect(() => { setImgSrc(src); setHasError(false); }, [src]);
  return (
    <div className="w-full h-40 sm:h-48 md:h-56 lg:h-64 xl:h-72 relative rounded-xl overflow-hidden bg-white/5">
      <Image
        src={imgSrc} alt={alt} fill className="object-cover"
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        priority={isFeatured}
        onError={() => { if (!hasError) { setHasError(true); setImgSrc('/building.png'); } }}
      />
      {hasError && (
        <div className="absolute inset-0 flex items-end justify-start p-2 pointer-events-none">
          <span className="text-[9px] text-white/30 bg-black/40 px-1.5 py-0.5 rounded-full">
            Preview unavailable
          </span>
        </div>
      )}
    </div>
  );
}

// ─── Graph ────────────────────────────────────────────────
function ProjectGraph({ id }: { id: string }) {
  const gradientId = `graphGradient-${id}`;
  return (
    <div className="h-12 sm:h-14 md:h-16 w-full relative mt-2 sm:mt-2.5">
      <svg viewBox="0 0 300 80" className="w-full h-full" preserveAspectRatio="none">
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#13AE85" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#13AE85" stopOpacity="0.15" />
          </linearGradient>
        </defs>
        <path
          d="M0 55 Q20 40, 40 45 T80 38 T120 42 T160 32 T200 38 T240 28 T280 35 L300 35 L300 80 L0 80 Z"
          fill={`url(#${gradientId})`}
        />
        <path
          d="M0 55 Q20 40, 40 45 T80 38 T120 42 T160 32 T200 38 T240 28 T280 35 L300 35"
          fill="none" stroke="#13AE85" strokeWidth="3"
        />
      </svg>
    </div>
  );
}

// ─── Already Invested Modal ───────────────────────────────
interface AlreadyInvestedModalProps {
  project: ProjectData;
  onClose: () => void;
  onContinue: (projectId: string) => void;
}

function AlreadyInvestedModal({ project, onClose, onContinue }: AlreadyInvestedModalProps) {
  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/70 px-4">
      <div
        className="w-full max-w-sm rounded-2xl border border-white/20 p-5 space-y-4"
        style={{ background: '#111' }}
      >
        <div className="flex flex-col items-center gap-3 pt-2">
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center"
            style={{ background: 'rgba(19,174,133,0.15)' }}
          >
            <CheckCircle2 size={32} className="text-[#13AE85]" />
          </div>
          <h3
            className="text-white text-lg font-semibold text-center"
            style={{ fontFamily: 'Dubai, sans-serif' }}
          >
            Already Invested
          </h3>
        </div>

        <p
          className="text-white/70 text-sm leading-relaxed text-center"
          style={{ fontFamily: 'Satoshi, sans-serif' }}
        >
          You have already invested in{' '}
          <span className="font-semibold text-white">{project.name}</span>.
          You can continue to track your investment in the simulator.
        </p>

        <div
          className="rounded-xl p-3 space-y-1.5 text-xs"
          style={{ background: 'rgba(255,255,255,0.06)', fontFamily: 'Satoshi, sans-serif' }}
        >
          <div className="flex justify-between text-white/70">
            <span>Your Investment</span>
            <span className="text-[#13AE85] font-semibold">
              ${Number(project.pool.userInvestment).toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between text-white/70">
            <span>Expected Return</span>
            <span className="text-[#13AE85] font-semibold">+{project.returnPercent}%</span>
          </div>
          <div className="flex justify-between text-white/70">
            <span>Asset</span>
            <span className="text-white font-medium">{project.pool?.asset ?? 'USD'}</span>
          </div>
          <div className="flex justify-between text-white/70">
            <span>Timeline</span>
            <span className="text-white font-medium">
              {project.timelineDays > 365
                ? `${Math.round(project.timelineDays / 365)}y left`
                : `${project.timelineDays}d left`}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-1">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-full text-xs font-medium text-white transition-all hover:bg-white/20"
            style={{ background: 'rgba(255,255,255,0.1)', fontFamily: 'Satoshi, sans-serif' }}
          >
            Close
          </button>
          <button
            onClick={() => onContinue(project.id)}
            className="px-5 py-2 rounded-full text-xs font-medium text-white transition-all hover:opacity-90"
            style={{ background: '#13AE85', fontFamily: 'Satoshi, sans-serif' }}
          >
            Continue →
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Confirm Investment Modal ─────────────────────────────
interface ConfirmModalProps {
  project: ProjectData;
  onClose: () => void;
  onSuccess: (projectId: string) => void;
}

function ConfirmInvestModal({ project, onClose, onSuccess }: ConfirmModalProps) {
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const handleConfirm = async () => {
    try {
      setSubmitting(true);
      setApiError(null);

      const body = {
        projectPoolId: project.pool?.id,
        amount: Number(project.totalValue),
        expectedReturn: String(project.returnPercent),
      };
      console.log('💸 [INVEST] POST body:', JSON.stringify(body, null, 2));

      if (!body.projectPoolId) {
        setApiError('Missing pool ID — cannot invest.');
        setSubmitting(false);
        return;
      }
      if (isNaN(body.amount)) {
        setApiError('Invalid investment amount.');
        setSubmitting(false);
        return;
      }

      const res = await fetchWithAuth(`${BASE_URL}/user/simulation/investments`, {
        method: 'POST',
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const text = await res.text();
        console.error('❌ [INVEST] Failed:', res.status, text);
        setApiError(`Failed (${res.status}). ${text}`);
        setSubmitting(false);
        return;
      }

      const json = await res.json();
      console.log('✅ [INVEST] Success:', json);
      setSubmitting(false);
      onSuccess(project.id);
    } catch (err) {
      console.error('💥 [INVEST] Exception:', err);
      setApiError('Something went wrong. Please try again.');
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/70 px-4">
      <div
        className="w-full max-w-sm rounded-2xl border border-white/20 p-5 space-y-4"
        style={{ background: '#111' }}
      >
        <h3
          className="text-white text-lg font-semibold"
          style={{ fontFamily: 'Dubai, sans-serif' }}
        >
          Confirm Investment
        </h3>

        <p
          className="text-white/80 text-sm leading-relaxed"
          style={{ fontFamily: 'Satoshi, sans-serif' }}
        >
          On confirming,{' '}
          <span className="font-semibold text-white">
            ${Number(project.totalValue).toLocaleString()}
          </span>{' '}
          will be deducted from your funds and invested into{' '}
          <span className="font-semibold text-white">{project.name}</span>.
        </p>

        <div
          className="rounded-xl p-3 space-y-1 text-xs"
          style={{ background: 'rgba(255,255,255,0.06)', fontFamily: 'Satoshi, sans-serif' }}
        >
          <div className="flex justify-between text-white/70">
            <span>Pool ID</span>
            <span className="text-white font-medium truncate max-w-[160px]">
              {project.pool?.id ?? '—'}
            </span>
          </div>
          <div className="flex justify-between text-white/70">
            <span>Expected Return</span>
            <span className="text-[#13AE85] font-semibold">+{project.returnPercent}%</span>
          </div>
          <div className="flex justify-between text-white/70">
            <span>Asset</span>
            <span className="text-white font-medium">{project.pool?.asset ?? 'USD'}</span>
          </div>
        </div>

        {apiError && (
          <p
            className="text-xs text-red-400 break-words"
            style={{ fontFamily: 'Satoshi, sans-serif' }}
          >
            {apiError}
          </p>
        )}

        <div className="flex items-center justify-end gap-3 pt-1">
          <button
            disabled={submitting}
            onClick={() => { if (!submitting) { setApiError(null); onClose(); } }}
            className="px-5 py-2 rounded-full text-xs font-medium text-white transition-all hover:bg-white/20 disabled:opacity-60"
            style={{ background: 'rgba(255,255,255,0.1)', fontFamily: 'Satoshi, sans-serif' }}
          >
            Cancel
          </button>
          <button
            disabled={submitting}
            onClick={handleConfirm}
            className="px-5 py-2 rounded-full text-xs font-medium text-white transition-all hover:opacity-90 disabled:opacity-60"
            style={{ background: '#EF6B23', fontFamily: 'Satoshi, sans-serif' }}
          >
            {submitting ? 'Processing...' : 'Confirm & Invest'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Project Card ─────────────────────────────────────────
const ProjectCard = ({ data, isFeatured = false }: ProjectCardProps) => {
  const router = useRouter();
  const uid = useId();

  const [modalType, setModalType] = useState<null | 'confirm' | 'already'>(null);

  const daysLeft = data.timelineDays > 365
    ? `${Math.round(data.timelineDays / 365)}y left`
    : `${data.timelineDays}d left`;

  const progressPercent = data.latestProgress ?? 0;
  const resolvedImage = resolveImageUrl(data.imageUrl);
  const isAlreadyInvested =
    data.pool?.userInvestment !== null && data.pool?.userInvestment !== undefined;

  const handleInvestClick = () => {
    setModalType(isAlreadyInvested ? 'already' : 'confirm');
  };

  const handleSuccess = (projectId: string) => {
    setModalType(null);
    router.push(`/SimulatorDashboardF3?id=${projectId}`);
  };

  const handleContinue = (projectId: string) => {
    setModalType(null);
    router.push(`/SimulatorDashboardF3?id=${projectId}`);
  };

  return (
    <>
      <div
        className="rounded-2xl overflow-hidden backdrop-blur-[10px] hover:scale-[1.02] transition-transform duration-300"
        style={{
          background: 'linear-gradient(0deg, rgba(0,0,0,0.2), rgba(0,0,0,0.2)), linear-gradient(134.61deg, rgba(255,255,255,0.3) -29.34%, rgba(255,255,255,0.05) 131.55%)'
        }}
      >
        {/* Card Header */}
        <div
          className="p-2.5 sm:p-3 md:p-3.5 pb-2 sm:pb-2.5 rounded-t-2xl backdrop-blur-[10px]"
          style={{ background: 'rgba(0,0,0,0.6)' }}
        >
          <div className="flex justify-between items-start">
            <div className="flex-1 min-w-0 pr-2">
              <h3
                className="text-white font-bold text-sm sm:text-base md:text-lg flex items-center gap-1.5 truncate"
                style={{ fontFamily: 'Dubai, sans-serif' }}
              >
                {data.name}
                <Home size={14} className="text-white sm:w-4 sm:h-4 flex-shrink-0" />
              </h3>
              <p
                className="text-white text-[10px] sm:text-xs md:text-sm flex items-center gap-1 mt-0.5"
                style={{ fontFamily: 'Satoshi, sans-serif', fontWeight: 500 }}
              >
                <MapPin size={11} className="sm:w-3 sm:h-3 flex-shrink-0" />
                <span className="truncate">{data.location}</span>
              </p>
            </div>
            <div className="flex flex-col items-end gap-1">
              <span
                className="px-1.5 sm:px-2 md:px-2.5 py-0.5 rounded-md sm:rounded-lg flex items-center gap-0.5 sm:gap-1 text-[9px] sm:text-[10px] md:text-xs font-medium whitespace-nowrap"
                style={{
                  background: 'rgba(254,249,191,0.8)',
                  color: '#231F1F',
                  fontFamily: 'Satoshi, sans-serif'
                }}
              >
                🕒 {daysLeft}
              </span>
              {isAlreadyInvested && (
                <span
                  className="px-1.5 sm:px-2 py-0.5 rounded-md sm:rounded-lg flex items-center gap-0.5 sm:gap-1 text-[8px] sm:text-[9px] font-semibold whitespace-nowrap"
                  style={{
                    background: 'rgba(19,174,133,0.2)',
                    color: '#13AE85',
                    border: '1px solid rgba(19,174,133,0.4)',
                    fontFamily: 'Satoshi, sans-serif'
                  }}
                >
                  ✓ Invested
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Tags + Image */}
        <div className="px-2 sm:px-2.5 md:px-3 py-2 sm:py-2.5">
          <div className="flex gap-1 sm:gap-1.5 mb-2 text-[9px] sm:text-[10px]">
            {['Eco', 'High-Yield', 'Tokenized'].map(tag => (
              <span
                key={tag}
                className="px-1.5 sm:px-2 md:px-2.5 py-0.5 sm:py-1 rounded-full text-white backdrop-blur-[5px]"
                style={{
                  background: 'linear-gradient(0deg, rgba(0,0,0,0.2), rgba(0,0,0,0.2)), linear-gradient(134.61deg, rgba(255,255,255,0.3) -29.34%, rgba(255,255,255,0.05) 131.55%)',
                  fontFamily: 'Satoshi, sans-serif'
                }}
              >
                {tag}
              </span>
            ))}
          </div>
          <ProjectImage
            src={resolvedImage}
            alt={data.name}
            isFeatured={isFeatured}
            projectName={data.name}
          />
        </div>

        {/* Metrics */}
        <div className="p-2.5 sm:p-3 md:p-3.5 space-y-2 sm:space-y-2.5 md:space-y-3">
          <div>
            <div
              className="flex justify-between text-[9px] sm:text-[10px] md:text-xs text-white mb-1.5 sm:mb-2"
              style={{ fontFamily: 'Satoshi, sans-serif' }}
            >
              <span>Founding Progress</span>
              <span className="font-medium">${Number(data.totalValue).toLocaleString()}</span>
            </div>
            <div
              className="w-full h-1 sm:h-1.5 rounded-full overflow-hidden relative"
              style={{ background: 'rgba(242,242,242,0.8)' }}
            >
              <div
                className="absolute left-0 top-0 h-full rounded-full transition-all duration-300"
                style={{ width: `${Math.min(progressPercent, 100)}%`, background: '#EF6B23' }}
              />
            </div>
          </div>

          <div
            className="space-y-1.5 sm:space-y-2 text-[9px] sm:text-[10px] md:text-xs"
            style={{ fontFamily: 'Satoshi, sans-serif' }}
          >
            <div className="flex justify-between">
              <span className="text-white/80">Asset</span>
              <span className="text-white font-medium">{data.pool?.asset ?? 'USD'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/80">Timeline</span>
              <span className="text-white font-medium">{daysLeft}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white/80">Total Value</span>
              <span className="text-white font-medium flex items-center gap-1">
                ${Number(data.totalValue).toLocaleString()}
                <span className="text-[#13AE85] text-[8px] sm:text-[9px] font-semibold">
                  +{data.returnPercent}%
                </span>
              </span>
            </div>
            {isAlreadyInvested && (
              <div className="flex justify-between">
                <span className="text-white/80">Your Investment</span>
                <span className="text-[#13AE85] font-semibold">
                  ${Number(data.pool.userInvestment).toLocaleString()}
                </span>
              </div>
            )}
          </div>

          <ProjectGraph id={uid} />
        </div>

        {/* Buttons */}
        <div className="grid grid-cols-2 gap-2 sm:gap-2.5 p-2.5 sm:p-3 md:p-3.5 pt-0">
          <button
            onClick={() => router.push(`/ProjectDetail?id=${data.id}`)}
            className="py-2 sm:py-2.5 md:py-3 rounded-full text-[9px] sm:text-[10px] md:text-xs font-medium text-white transition-all hover:bg-white/20"
            style={{
              background: 'rgba(255,255,255,0.1)',
              border: '1px solid #FFFFFF',
              fontFamily: 'Satoshi, sans-serif'
            }}
          >
            View Details
          </button>
          <button
            onClick={handleInvestClick}
            className="py-2 sm:py-2.5 md:py-3 rounded-full text-[9px] sm:text-[10px] md:text-xs font-medium text-white transition-all hover:opacity-90 shadow-lg"
            style={{
              background: isAlreadyInvested ? '#13AE85' : '#EF6B23',
              fontFamily: 'Satoshi, sans-serif'
            }}
          >
            {isAlreadyInvested ? 'View Simulation' : 'Invest Now'}
          </button>
        </div>
      </div>

      {/* Modals */}
      {modalType === 'already' && (
        <AlreadyInvestedModal
          project={data}
          onClose={() => setModalType(null)}
          onContinue={handleContinue}
        />
      )}
      {modalType === 'confirm' && (
        <ConfirmInvestModal
          project={data}
          onClose={() => setModalType(null)}
          onSuccess={handleSuccess}
        />
      )}
    </>
  );
};

// ─── Skeleton Card ────────────────────────────────────────
function SkeletonCard() {
  return (
    <div
      className="rounded-2xl overflow-hidden animate-pulse"
      style={{
        background: 'linear-gradient(0deg, rgba(0,0,0,0.2), rgba(0,0,0,0.2)), linear-gradient(134.61deg, rgba(255,255,255,0.3) -29.34%, rgba(255,255,255,0.05) 131.55%)'
      }}
    >
      <div className="h-16 bg-black/60" />
      <div className="p-3 space-y-2">
        <div className="flex gap-2">
          {[1, 2, 3].map(i => <div key={i} className="h-5 w-14 rounded-full bg-white/10" />)}
        </div>
        <div className="h-48 rounded-xl bg-white/10" />
      </div>
      <div className="p-3 space-y-3">
        <div className="h-2 rounded-full bg-white/10" />
        {[1, 2, 3].map(i => (
          <div key={i} className="flex justify-between">
            <div className="h-3 w-20 rounded bg-white/10" />
            <div className="h-3 w-16 rounded bg-white/10" />
          </div>
        ))}
        <div className="h-12 rounded bg-white/10" />
      </div>
      <div className="grid grid-cols-2 gap-2 p-3">
        <div className="h-8 rounded-full bg-white/10" />
        <div className="h-8 rounded-full bg-white/20" />
      </div>
    </div>
  );
}

// ─── Main Content Component ───────────────────────────────
function ProjectDetailContent() {
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [projects, setProjects] = useState<ProjectData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const projectId = searchParams.get('id');

  useEffect(() => {
    const fetchProjects = async () => {
      logTokenStatus();
      try {
        setLoading(true);
        setError(null);
        const token = getToken();
        if (!token) { setError('Not authenticated. Please log in.'); return; }
        const response = await fetchWithAuth(`${BASE_URL}/user/simulation/projects`);
        if (!response.ok) { setError(`Failed to fetch projects (${response.status})`); return; }
        const data = await response.json();
        if (!Array.isArray(data.data)) { setProjects([]); return; }
        setProjects(data.data);
      } catch {
        setError('Something went wrong. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, []);

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">

      {/* ── Page body ── */}
      <div className="flex-1 max-w-[1920px] w-full mx-auto px-3 sm:px-4 md:px-6 pt-1 pb-4 sm:pt-2 sm:pb-6">
        <div className="-mt-4 sm:-mt-5 md:-mt-6">
          <HeaderSection />
        </div>

        {/* Controls Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-4 mt-4 sm:mt-6 md:mt-8">
          <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
            <button
              onClick={() => router.back()}
              className="flex items-center justify-center w-[40px] h-[40px] sm:w-[46px] sm:h-[46px] rounded-full transition-all hover:opacity-90 flex-shrink-0"
              style={{ background: '#ef6b23' }}
            >
              <ArrowLeft size={18} className="text-white sm:w-5 sm:h-5" />
            </button>
            <h1
              className="text-white text-[20px] sm:text-[24px] font-medium flex-1"
              style={{ fontFamily: 'Dubai, sans-serif' }}
            >
              Project Discovery
            </h1>
            <button
              onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
              className="lg:hidden flex items-center gap-2 px-4 py-2 rounded-full text-white text-sm"
              style={{ background: '#ef6b23' }}
            >
              <Filter size={16} />
              Filters
            </button>
          </div>

          {/* Desktop Filters */}
          <div className="hidden lg:flex items-center gap-2.5 flex-1 overflow-x-auto scrollbar-hide">
            <div className="relative flex-shrink-0">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/60" size={14} />
              <input
                type="text"
                placeholder="Search"
                className="w-[160px] pl-9 pr-3 py-2 rounded-full text-white text-[13px] placeholder:text-white/60 focus:outline-none focus:ring-1 focus:ring-white/20 transition"
                style={{
                  background: 'linear-gradient(0deg, rgba(0,0,0,0.2), rgba(0,0,0,0.2)), linear-gradient(134.61deg, rgba(255,255,255,0.3) -29.34%, rgba(255,255,255,0.05) 131.55%)',
                  fontFamily: 'Dubai, sans-serif'
                }}
              />
            </div>
            {['Map', 'Sort', 'Location', 'Project Status', 'Investment Type', 'Duration', 'Founding Progress'].map((label) => (
              <button
                key={label}
                className="flex items-center gap-1.5 px-4 py-2 rounded-full text-white text-[13px] whitespace-nowrap hover:bg-white/10 transition flex-shrink-0"
                style={{
                  background: 'linear-gradient(0deg, rgba(0,0,0,0.2), rgba(0,0,0,0.2)), linear-gradient(134.61deg, rgba(255,255,255,0.3) -29.34%, rgba(255,255,255,0.05) 131.55%)',
                  fontFamily: 'Dubai, sans-serif'
                }}
              >
                {label}
                <ChevronDown size={12} />
              </button>
            ))}
          </div>
        </div>

        {/* Mobile Filters */}
        {mobileFiltersOpen && (
          <div
            className="lg:hidden mb-4 p-4 rounded-2xl animate-slideDown"
            style={{
              background: 'linear-gradient(0deg, rgba(0,0,0,0.2), rgba(0,0,0,0.2)), linear-gradient(134.61deg, rgba(255,255,255,0.3) -29.34%, rgba(255,255,255,0.05) 131.55%)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,255,255,0.2)'
            }}
          >
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/60" size={16} />
              <input
                type="text"
                placeholder="Search projects..."
                className="w-full pl-10 pr-4 py-3 rounded-full text-white text-sm placeholder:text-white/60 focus:outline-none focus:ring-1 focus:ring-white/20"
                style={{ background: 'rgba(255,255,255,0.1)', fontFamily: 'Dubai, sans-serif' }}
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              {['Map', 'Sort', 'Location', 'Project Status', 'Investment Type', 'Duration', 'Founding Progress'].map((label) => (
                <button
                  key={label}
                  className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-white text-sm hover:bg-white/10 transition"
                  style={{ background: 'rgba(255,255,255,0.1)', fontFamily: 'Dubai, sans-serif' }}
                >
                  {label}
                  <ChevronDown size={14} />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Main Grid */}
        <div
          className="p-3 sm:p-4 md:p-6 rounded-2xl backdrop-blur-md border border-white/20"
          style={{
            maxWidth: 1834,
            marginInline: 'auto',
            background: 'linear-gradient(0deg, rgba(0,0,0,0.2), rgba(0,0,0,0.2)), linear-gradient(134.61deg, rgba(255,255,255,0.3) -29.34%, rgba(255,255,255,0.05) 131.55%)'
          }}
        >
          {error && (
            <div className="flex items-center justify-center py-16">
              <div className="text-center space-y-2">
                <p className="text-red-400 text-sm">{error}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="px-4 py-2 rounded-full text-xs text-white"
                  style={{ background: '#ef6b23' }}
                >
                  Retry
                </button>
              </div>
            </div>
          )}

          {!error && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5 md:gap-6">

              {/* Left Sidebar */}
              <div className="hidden lg:block lg:col-span-4 space-y-5 md:space-y-6">
                <div className="flex flex-wrap gap-2">
                  {['Affordable Housing', 'Luxury', 'Green Energy', 'Community-Backed'].map(tag => (
                    <span
                      key={tag}
                      className="px-3 py-1.5 rounded-full text-xs text-white cursor-pointer hover:bg-white/20 transition backdrop-blur-[5px]"
                      style={{
                        background: 'linear-gradient(0deg, rgba(0,0,0,0.2), rgba(0,0,0,0.2)), linear-gradient(134.61deg, rgba(255,255,255,0.3) -29.34%, rgba(255,255,255,0.05) 131.55%)',
                        fontFamily: 'Satoshi, sans-serif'
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <div
                  className="p-4 md:p-5 rounded-2xl backdrop-blur-[20px]"
                  style={{ background: 'rgba(255,255,255,0.15)' }}
                >
                  <h2
                    className="text-base font-semibold mb-4 text-white"
                    style={{ fontFamily: 'Dubai, sans-serif' }}
                  >
                    Featured Project
                  </h2>
                  {loading ? (
                    <SkeletonCard />
                  ) : projects.length > 0 ? (
                    <ProjectCard data={projects[0]} isFeatured={true} />
                  ) : (
                    <p className="text-white/40 text-sm text-center py-8">No projects available</p>
                  )}
                </div>
              </div>

              {/* Right Grid */}
              <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                {loading ? (
                  [...Array(4)].map((_, i) => <SkeletonCard key={i} />)
                ) : projects.length === 0 ? (
                  <div className="col-span-full flex flex-col items-center justify-center py-16 gap-3">
                    <div className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center">
                      <Home className="w-7 h-7 text-white/40" />
                    </div>
                    <p className="text-white/40 text-sm">No projects found</p>
                  </div>
                ) : (
                  <>
                    {/* Desktop: skip projects[0] — shown in Featured sidebar */}
                    <div className="hidden lg:contents">
                      {projects.slice(1).map((project) => (
                        <ProjectCard key={project.id} data={project} />
                      ))}
                    </div>
                    {/* Mobile/tablet: show ALL */}
                    <div className="contents lg:hidden">
                      {projects.map((project) => (
                        <ProjectCard key={project.id} data={project} />
                      ))}
                    </div>
                  </>
                )}
              </div>

            </div>
          )}
        </div>
      </div>

      {/* ✅ Footer */}
      <FooterSection />

      <style jsx global>{`
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-10px); }
          to   { opacity: 1; transform: translateY(0);     }
        }
        .animate-slideDown { animation: slideDown 0.3s ease-out; }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}

// ─── Main Export with Suspense ────────────────────────────
export default function ProjectDetailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#EF6B23]/30 border-t-[#EF6B23] rounded-full animate-spin" />
      </div>
    }>
      <ProjectDetailContent />
    </Suspense>
  );
}
