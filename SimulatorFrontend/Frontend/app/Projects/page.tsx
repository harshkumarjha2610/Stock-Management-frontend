'use client';

import React, { useState, useEffect, useId, Suspense } from 'react';
import {
  ArrowLeft, ChevronDown, MapPin, Search, Home, Filter, CheckCircle2
} from 'lucide-react';
import Image from 'next/image';
import { HeaderSection } from '@/app/Investordashboard/sections/HeaderSection';
import { FooterSection } from '@/app/Investordashboard/sections/FooterSection';
import { useRouter, useSearchParams } from 'next/navigation';

const BASE_URL = 'https://cobuild-simulator-backend.onrender.com/api/v1';

// ─── Token Helpers ────────────────────────────────────────
function getToken(): string { return localStorage.getItem('accessToken') ?? ''; }
function getRefreshToken(): string { return localStorage.getItem('refreshToken') ?? ''; }
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
    const newAccessToken = data.data?.accessToken ?? data.data?.token ?? data.accessToken ?? data.token;
    const newRefreshToken = data.data?.refreshToken ?? data.refreshToken;
    if (!newAccessToken) return null;
    setTokens(newAccessToken, newRefreshToken);
    return newAccessToken;
  } catch { return null; }
}

async function fetchWithAuth(url: string, options: RequestInit = {}): Promise<Response> {
  const token = getToken();
  const response = await fetch(url, {
    ...options,
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}`, ...options.headers },
  });
  if (response.status === 401) {
    const newToken = await refreshAccessToken();
    if (!newToken) { clearTokens(); window.location.href = '/login'; return response; }
    return fetch(url, {
      ...options,
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${newToken}`, ...options.headers },
    });
  }
  return response;
}

// ─── Types ────────────────────────────────────────────────
interface Pool { id: string; mode: string; asset: string; userInvestment: null | number; }
interface ProjectData {
  id: string; name: string; imageUrl: string; timelineDays: number;
  totalValue: string; returnPercent: string; location: string;
  projectOverview: string | null; projectDetails: string | null;
  smartContractUrl: string | null; usage: string; pool: Pool; latestProgress: null | number;
}

function resolveImageUrl(imageUrl: string): string {
  if (!imageUrl) return '/building.png';
  if (imageUrl.startsWith('https://res.cloudinary.com')) return imageUrl;
  if (imageUrl.startsWith('/public')) return `https://cobuild-simulator-backend.onrender.com${imageUrl}`;
  if (imageUrl.startsWith('http')) return imageUrl;
  return '/building.png';
}

// ─── Graph ────────────────────────────────────────────────
function ProjectGraph({ id, large }: { id: string; large?: boolean }) {
  const gradientId = `graphGradient-${id}`;
  return (
    <div className={`w-full relative mt-2 ${large ? 'h-20' : 'h-12 sm:h-14'}`}>
      <svg viewBox="0 0 300 80" className="w-full h-full" preserveAspectRatio="none">
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#13AE85" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#13AE85" stopOpacity="0.15" />
          </linearGradient>
        </defs>
        <path d="M0 55 Q20 40, 40 45 T80 38 T120 42 T160 32 T200 38 T240 28 T280 35 L300 35 L300 80 L0 80 Z" fill={`url(#${gradientId})`} />
        <path d="M0 55 Q20 40, 40 45 T80 38 T120 42 T160 32 T200 38 T240 28 T280 35 L300 35" fill="none" stroke="#13AE85" strokeWidth="3" />
      </svg>
    </div>
  );
}

// ─── Already Invested Modal ───────────────────────────────
function AlreadyInvestedModal({ project, onClose, onContinue }: {
  project: ProjectData; onClose: () => void; onContinue: (id: string) => void;
}) {
  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/70 px-4">
      <div className="w-full max-w-sm rounded-2xl border border-white/20 p-5 space-y-4" style={{ background: '#111' }}>
        <div className="flex flex-col items-center gap-3 pt-2">
          <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ background: 'rgba(19,174,133,0.15)' }}>
            <CheckCircle2 size={32} className="text-[#13AE85]" />
          </div>
          <h3 className="text-white text-lg font-semibold text-center" style={{ fontFamily: 'Dubai, sans-serif' }}>Already Invested</h3>
        </div>
        <p className="text-white/70 text-sm leading-relaxed text-center" style={{ fontFamily: 'Satoshi, sans-serif' }}>
          You have already invested in <span className="font-semibold text-white">{project.name}</span>. You can continue to track your investment in the simulator.
        </p>
        <div className="rounded-xl p-3 space-y-1.5 text-xs" style={{ background: 'rgba(255,255,255,0.06)', fontFamily: 'Satoshi, sans-serif' }}>
          <div className="flex justify-between text-white/70"><span>Your Investment</span><span className="text-[#13AE85] font-semibold">${Number(project.pool.userInvestment).toLocaleString()}</span></div>
          <div className="flex justify-between text-white/70"><span>Expected Return</span><span className="text-[#13AE85] font-semibold">+{project.returnPercent}%</span></div>
          <div className="flex justify-between text-white/70"><span>Asset</span><span className="text-white font-medium">{project.pool?.asset ?? 'USD'}</span></div>
          <div className="flex justify-between text-white/70"><span>Timeline</span><span className="text-white font-medium">{project.timelineDays > 365 ? `${Math.round(project.timelineDays / 365)}y left` : `${project.timelineDays}d left`}</span></div>
        </div>
        <div className="flex items-center justify-end gap-3 pt-1">
          <button onClick={onClose} className="px-5 py-2 rounded-full text-xs font-medium text-white transition-all hover:bg-white/20" style={{ background: 'rgba(255,255,255,0.1)', fontFamily: 'Satoshi, sans-serif' }}>Close</button>
          <button onClick={() => onContinue(project.id)} className="px-5 py-2 rounded-full text-xs font-medium text-white transition-all hover:opacity-90" style={{ background: '#13AE85', fontFamily: 'Satoshi, sans-serif' }}>Continue →</button>
        </div>
      </div>
    </div>
  );
}

// ─── Confirm Investment Modal ─────────────────────────────
function ConfirmInvestModal({ project, onClose, onSuccess }: {
  project: ProjectData; onClose: () => void; onSuccess: (id: string) => void;
}) {
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const handleConfirm = async () => {
    try {
      setSubmitting(true); setApiError(null);
      const body = { projectPoolId: project.pool?.id, amount: Number(project.totalValue), expectedReturn: String(project.returnPercent) };
      if (!body.projectPoolId) { setApiError('Missing pool ID — cannot invest.'); setSubmitting(false); return; }
      if (isNaN(body.amount)) { setApiError('Invalid investment amount.'); setSubmitting(false); return; }
      const res = await fetchWithAuth(`${BASE_URL}/user/simulation/investments`, { method: 'POST', body: JSON.stringify(body) });
      if (!res.ok) { const text = await res.text(); setApiError(`Failed (${res.status}). ${text}`); setSubmitting(false); return; }
      setSubmitting(false); onSuccess(project.id);
    } catch { setApiError('Something went wrong. Please try again.'); setSubmitting(false); }
  };

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/70 px-4">
      <div className="w-full max-w-sm rounded-2xl border border-white/20 p-5 space-y-4" style={{ background: '#111' }}>
        <h3 className="text-white text-lg font-semibold" style={{ fontFamily: 'Dubai, sans-serif' }}>Confirm Investment</h3>
        <p className="text-white/80 text-sm leading-relaxed" style={{ fontFamily: 'Satoshi, sans-serif' }}>
          On confirming, <span className="font-semibold text-white">${Number(project.totalValue).toLocaleString()}</span> will be deducted from your funds and invested into <span className="font-semibold text-white">{project.name}</span>.
        </p>
        <div className="rounded-xl p-3 space-y-1 text-xs" style={{ background: 'rgba(255,255,255,0.06)', fontFamily: 'Satoshi, sans-serif' }}>
          <div className="flex justify-between text-white/70"><span>Pool ID</span><span className="text-white font-medium truncate max-w-[160px]">{project.pool?.id ?? '—'}</span></div>
          <div className="flex justify-between text-white/70"><span>Expected Return</span><span className="text-[#13AE85] font-semibold">+{project.returnPercent}%</span></div>
          <div className="flex justify-between text-white/70"><span>Asset</span><span className="text-white font-medium">{project.pool?.asset ?? 'USD'}</span></div>
        </div>
        {apiError && <p className="text-xs text-red-400 break-words" style={{ fontFamily: 'Satoshi, sans-serif' }}>{apiError}</p>}
        <div className="flex items-center justify-end gap-3 pt-1">
          <button disabled={submitting} onClick={() => { if (!submitting) { setApiError(null); onClose(); } }} className="px-5 py-2 rounded-full text-xs font-medium text-white transition-all hover:bg-white/20 disabled:opacity-60" style={{ background: 'rgba(255,255,255,0.1)', fontFamily: 'Satoshi, sans-serif' }}>Cancel</button>
          <button disabled={submitting} onClick={handleConfirm} className="px-5 py-2 rounded-full text-xs font-medium text-white transition-all hover:opacity-90 disabled:opacity-60" style={{ background: '#EF6B23', fontFamily: 'Satoshi, sans-serif' }}>{submitting ? 'Processing...' : 'Confirm & Invest'}</button>
        </div>
      </div>
    </div>
  );
}

// ─── FEATURED Card ────────────────────────────────────────
function FeaturedProjectCard({ data }: { data: ProjectData }) {
  const router = useRouter();
  const uid = useId();
  const [modalType, setModalType] = useState<null | 'confirm' | 'already'>(null);
  const isAlreadyInvested = data.pool?.userInvestment !== null && data.pool?.userInvestment !== undefined;
  const daysLeft = data.timelineDays > 365 ? `${Math.round(data.timelineDays / 365)}y left` : `${data.timelineDays}d left`;
  const progressPercent = data.latestProgress ?? 0;
  const resolvedImage = resolveImageUrl(data.imageUrl);

  const handleSuccess  = (id: string) => { setModalType(null); router.push(`/SimulatorDashboardF3?id=${id}`); };
  const handleContinue = (id: string) => { setModalType(null); router.push(`/SimulatorDashboardF3?id=${id}`); };

  return (
    <>
      <div
        className="relative rounded-2xl overflow-hidden w-full h-full flex flex-col"
        style={{
          background: 'linear-gradient(145deg, #1a1a1a 0%, #0d0d0d 100%)',
          boxShadow: '0 0 0 1px rgba(239,107,35,0.25), 0 25px 60px rgba(239,107,35,0.12), 0 8px 24px rgba(0,0,0,0.6)',
        }}
      >
        {/* Orange top accent bar */}
        <div
          className="absolute top-0 left-0 right-0 h-[3px] z-20 flex-shrink-0"
          style={{ background: 'linear-gradient(90deg, transparent, #EF6B23, #f59e0b, #EF6B23, transparent)' }}
        />

        {/* Hero image — flex-1 fills all remaining vertical space */}
        <div className="relative w-full flex-1 min-h-[240px] overflow-hidden">
          <Image
            src={resolvedImage} alt={data.name} fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, (max-width:1024px) 60vw, 55vw"
            priority
            onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/building.png'; }}
          />

          {/* Cinematic overlays */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/25 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-transparent" />

          {/* Top badges */}
          <div className="absolute top-4 left-4 right-4 flex items-start justify-between z-10">
            <div className="flex flex-col gap-2">
              <span
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold text-white shadow-lg w-fit"
                style={{ background: 'linear-gradient(135deg, #EF6B23, #c5600d)', boxShadow: '0 4px 14px rgba(239,107,35,0.5)', fontFamily: 'Satoshi, sans-serif' }}
              >
                <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
                Featured Project
              </span>
              <div className="flex gap-1.5 flex-wrap">
                {['Eco', 'High-Yield', 'Tokenized'].map(tag => (
                  <span key={tag} className="px-2.5 py-0.5 rounded-full text-white text-[10px] font-medium backdrop-blur-md"
                    style={{ background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)', fontFamily: 'Satoshi, sans-serif' }}>
                    {tag}
                  </span>
                ))}
              </div>
            </div>
            <div className="flex flex-col items-end gap-2">
              <span className="px-3 py-1.5 rounded-full text-xs font-semibold text-black shadow-md"
                style={{ background: 'rgba(254,249,191,0.95)', fontFamily: 'Satoshi, sans-serif' }}>
                🕒 {daysLeft}
              </span>
              {isAlreadyInvested && (
                <span className="px-3 py-1.5 rounded-full text-xs font-bold"
                  style={{ background: 'rgba(19,174,133,0.3)', color: '#13AE85', border: '1px solid rgba(19,174,133,0.6)', backdropFilter: 'blur(8px)', fontFamily: 'Satoshi, sans-serif' }}>
                  ✓ Invested
                </span>
              )}
            </div>
          </div>

          {/* Project name + location at image bottom */}
          <div className="absolute bottom-0 left-0 right-0 px-5 pb-5 z-10">
            <h2
              className="text-white font-extrabold leading-tight mb-1.5 drop-shadow-2xl"
              style={{ fontFamily: 'Dubai, sans-serif', fontSize: 'clamp(1.4rem, 3vw, 2.2rem)', textShadow: '0 2px 20px rgba(0,0,0,0.8)' }}
            >
              {data.name}
            </h2>
            <p className="text-white/70 text-sm flex items-center gap-1.5" style={{ fontFamily: 'Satoshi, sans-serif' }}>
              <MapPin size={13} className="text-[#EF6B23] flex-shrink-0" />
              {data.location}
            </p>
          </div>
        </div>

        {/* Stats panel — fixed height, never grows */}
        <div className="flex-shrink-0 px-5 py-5 space-y-4" style={{ background: 'rgba(0,0,0,0.75)' }}>

          {/* 3 stat pills */}
          <div className="grid grid-cols-3 gap-2.5">
            {[
              { label: 'Total Value',     value: `$${Number(data.totalValue).toLocaleString()}`, accent: false },
              { label: 'Expected Return', value: `+${data.returnPercent}%`,                       accent: true  },
              { label: 'Timeline',        value: daysLeft,                                         accent: false },
            ].map(({ label, value, accent }) => (
              <div
                key={label}
                className="relative flex flex-col items-center justify-center text-center py-3 px-2 rounded-2xl overflow-hidden"
                style={{
                  background: accent ? 'linear-gradient(135deg, rgba(19,174,133,0.15), rgba(19,174,133,0.05))' : 'rgba(255,255,255,0.05)',
                  border: accent ? '1px solid rgba(19,174,133,0.3)' : '1px solid rgba(255,255,255,0.08)',
                }}
              >
                {accent && (
                  <div className="absolute top-0 left-0 right-0 h-[2px]"
                    style={{ background: 'linear-gradient(90deg, transparent, #13AE85, transparent)' }} />
                )}
                <span className="text-[9px] uppercase tracking-widest mb-1 font-semibold"
                  style={{ color: 'rgba(255,255,255,0.4)', fontFamily: 'Satoshi, sans-serif' }}>{label}</span>
                <span className={`text-sm font-extrabold ${accent ? 'text-[#13AE85]' : 'text-white'}`}
                  style={{ fontFamily: 'Dubai, sans-serif' }}>{value}</span>
              </div>
            ))}
          </div>

          {/* Funding progress */}
          <div>
            <div className="flex justify-between items-center mb-2" style={{ fontFamily: 'Satoshi, sans-serif' }}>
              <span className="text-[10px] text-white/50 font-medium uppercase tracking-wider">Funding Progress</span>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-white/40">${Number(data.totalValue).toLocaleString()}</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                  style={{ background: 'rgba(239,107,35,0.15)', color: '#EF6B23', border: '1px solid rgba(239,107,35,0.3)' }}>
                  {progressPercent}%
                </span>
              </div>
            </div>
            <div className="relative w-full h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
              <div
                className="h-full rounded-full relative overflow-hidden transition-all duration-700"
                style={{ width: `${Math.min(progressPercent, 100)}%`, background: 'linear-gradient(90deg, #EF6B23, #f59e0b)' }}
              >
                <div className="absolute inset-0 bg-white/20 animate-pulse rounded-full" />
              </div>
            </div>
          </div>

          {/* Asset + investment row */}
          <div
            className="flex items-center justify-between px-4 py-3 rounded-2xl"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
          >
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ background: 'rgba(239,107,35,0.15)' }}>
                <svg className="w-3.5 h-3.5 text-[#EF6B23]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-white/40 text-[9px] uppercase tracking-wider" style={{ fontFamily: 'Satoshi, sans-serif' }}>Asset</p>
                <p className="text-white text-sm font-bold" style={{ fontFamily: 'Dubai, sans-serif' }}>{data.pool?.asset ?? 'USD'}</p>
              </div>
            </div>
            {isAlreadyInvested ? (
              <div className="flex items-center gap-2">
                <div className="text-right">
                  <p className="text-white/40 text-[9px] uppercase tracking-wider" style={{ fontFamily: 'Satoshi, sans-serif' }}>Your Investment</p>
                  <p className="text-[#13AE85] text-sm font-extrabold" style={{ fontFamily: 'Dubai, sans-serif' }}>${Number(data.pool.userInvestment).toLocaleString()}</p>
                </div>
                <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(19,174,133,0.15)' }}>
                  <CheckCircle2 size={14} className="text-[#13AE85]" />
                </div>
              </div>
            ) : (
              <div className="text-right">
                <p className="text-white/40 text-[9px] uppercase tracking-wider" style={{ fontFamily: 'Satoshi, sans-serif' }}>Mode</p>
                <p className="text-white text-sm font-bold capitalize" style={{ fontFamily: 'Dubai, sans-serif' }}>{data.pool?.mode ?? 'Standard'}</p>
              </div>
            )}
          </div>

          {/* Graph */}
          <div className="rounded-2xl overflow-hidden px-3 pt-2 pb-1"
            style={{ background: 'rgba(19,174,133,0.06)', border: '1px solid rgba(19,174,133,0.12)' }}>
            <div className="flex items-center justify-between mb-1 px-1">
              <span className="text-[9px] text-white/30 uppercase tracking-widest" style={{ fontFamily: 'Satoshi, sans-serif' }}>Performance Trend</span>
              <span className="text-[9px] text-[#13AE85] font-semibold" style={{ fontFamily: 'Satoshi, sans-serif' }}>↑ +{data.returnPercent}%</span>
            </div>
            <ProjectGraph id={uid} large />
          </div>

          {/* CTA buttons */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <button
              onClick={() => router.push(`/ProjectDetail?id=${data.id}`)}
              className="py-3.5 rounded-2xl text-sm font-semibold text-white transition-all duration-200 hover:bg-white/15 active:scale-95"
              style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.2)', fontFamily: 'Satoshi, sans-serif' }}
            >
              View Details
            </button>
            <button
              onClick={() => setModalType(isAlreadyInvested ? 'already' : 'confirm')}
              className="py-3.5 rounded-2xl text-sm font-bold text-white transition-all duration-200 hover:opacity-90 active:scale-95"
              style={{
                background: isAlreadyInvested ? 'linear-gradient(135deg, #13AE85, #0e8a6a)' : 'linear-gradient(135deg, #EF6B23, #c5600d)',
                boxShadow: isAlreadyInvested ? '0 4px 20px rgba(19,174,133,0.35)' : '0 4px 20px rgba(239,107,35,0.35)',
                fontFamily: 'Satoshi, sans-serif',
              }}
            >
              {isAlreadyInvested ? 'View Simulation' : '🚀 Invest Now'}
            </button>
          </div>
        </div>
      </div>

      {modalType === 'already' && <AlreadyInvestedModal project={data} onClose={() => setModalType(null)} onContinue={handleContinue} />}
      {modalType === 'confirm' && <ConfirmInvestModal project={data} onClose={() => setModalType(null)} onSuccess={handleSuccess} />}
    </>
  );
}

// ─── REGULAR Card ─────────────────────────────────────────
function RegularProjectCard({ data }: { data: ProjectData }) {
  const router = useRouter();
  const uid = useId();
  const [modalType, setModalType] = useState<null | 'confirm' | 'already'>(null);
  const isAlreadyInvested = data.pool?.userInvestment !== null && data.pool?.userInvestment !== undefined;
  const daysLeft = data.timelineDays > 365 ? `${Math.round(data.timelineDays / 365)}y left` : `${data.timelineDays}d left`;
  const progressPercent = data.latestProgress ?? 0;
  const resolvedImage = resolveImageUrl(data.imageUrl);

  const handleSuccess  = (id: string) => { setModalType(null); router.push(`/SimulatorDashboardF3?id=${id}`); };
  const handleContinue = (id: string) => { setModalType(null); router.push(`/SimulatorDashboardF3?id=${id}`); };

  return (
    <>
      <div
        className="rounded-2xl overflow-hidden hover:scale-[1.02] transition-transform duration-300"
        style={{ background: 'linear-gradient(0deg, rgba(0,0,0,0.2), rgba(0,0,0,0.2)), linear-gradient(134.61deg, rgba(255,255,255,0.3) -29.34%, rgba(255,255,255,0.05) 131.55%)' }}
      >
        {/* Card header */}
        <div className="p-2.5 pb-2 rounded-t-2xl" style={{ background: 'rgba(0,0,0,0.6)' }}>
          <div className="flex justify-between items-start">
            <div className="flex-1 min-w-0 pr-2">
              <h3 className="text-white font-bold text-sm flex items-center gap-1.5 truncate" style={{ fontFamily: 'Dubai, sans-serif' }}>
                {data.name}
                <Home size={12} className="text-white flex-shrink-0" />
              </h3>
              <p className="text-white/70 text-[10px] flex items-center gap-1 mt-0.5" style={{ fontFamily: 'Satoshi, sans-serif' }}>
                <MapPin size={10} className="flex-shrink-0" />
                <span className="truncate">{data.location}</span>
              </p>
            </div>
            <div className="flex flex-col items-end gap-1">
              <span className="px-2 py-0.5 rounded-md text-[9px] font-medium whitespace-nowrap"
                style={{ background: 'rgba(254,249,191,0.8)', color: '#231F1F', fontFamily: 'Satoshi, sans-serif' }}>
                🕒 {daysLeft}
              </span>
              {isAlreadyInvested && (
                <span className="px-2 py-0.5 rounded-md text-[8px] font-semibold whitespace-nowrap"
                  style={{ background: 'rgba(19,174,133,0.2)', color: '#13AE85', border: '1px solid rgba(19,174,133,0.4)', fontFamily: 'Satoshi, sans-serif' }}>
                  ✓ Invested
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Image */}
        <div className="px-2 py-2">
          <div className="flex gap-1 mb-2">
            {['Eco', 'High-Yield', 'Tokenized'].map(tag => (
              <span key={tag} className="px-2 py-0.5 rounded-full text-white text-[8px]"
                style={{ background: 'rgba(255,255,255,0.12)', fontFamily: 'Satoshi, sans-serif' }}>{tag}</span>
            ))}
          </div>
          <div className="relative w-full h-32 sm:h-36 rounded-xl overflow-hidden bg-white/5">
            <Image
              src={resolvedImage} alt={data.name} fill className="object-cover"
              sizes="(max-width: 640px) 100vw, 25vw"
              onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/building.png'; }}
            />
          </div>
        </div>

        {/* Metrics */}
        <div className="px-2.5 pb-2 space-y-2">
          <div>
            <div className="flex justify-between text-[9px] text-white/70 mb-1" style={{ fontFamily: 'Satoshi, sans-serif' }}>
              <span>Funding Progress</span>
              <span className="font-medium">${Number(data.totalValue).toLocaleString()}</span>
            </div>
            <div className="w-full h-1 rounded-full overflow-hidden" style={{ background: 'rgba(242,242,242,0.2)' }}>
              <div className="h-full rounded-full" style={{ width: `${Math.min(progressPercent, 100)}%`, background: '#EF6B23' }} />
            </div>
          </div>
          <div className="space-y-1 text-[9px]" style={{ fontFamily: 'Satoshi, sans-serif' }}>
            <div className="flex justify-between">
              <span className="text-white/60">Asset</span>
              <span className="text-white font-medium">{data.pool?.asset ?? 'USD'}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white/60">Total Value</span>
              <span className="text-white font-medium flex items-center gap-1">
                ${Number(data.totalValue).toLocaleString()}
                <span className="text-[#13AE85] text-[8px] font-semibold">+{data.returnPercent}%</span>
              </span>
            </div>
            {isAlreadyInvested && (
              <div className="flex justify-between">
                <span className="text-white/60">Your Investment</span>
                <span className="text-[#13AE85] font-semibold">${Number(data.pool.userInvestment).toLocaleString()}</span>
              </div>
            )}
          </div>
          <ProjectGraph id={uid} />
        </div>

        {/* Buttons */}
        <div className="grid grid-cols-2 gap-1.5 p-2 pt-0">
          <button
            onClick={() => router.push(`/ProjectDetail?id=${data.id}`)}
            className="py-2 rounded-full text-[9px] font-medium text-white transition-all hover:bg-white/20"
            style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid #FFFFFF', fontFamily: 'Satoshi, sans-serif' }}
          >
            View Details
          </button>
          <button
            onClick={() => setModalType(isAlreadyInvested ? 'already' : 'confirm')}
            className="py-2 rounded-full text-[9px] font-medium text-white transition-all hover:opacity-90"
            style={{ background: isAlreadyInvested ? '#13AE85' : '#EF6B23', fontFamily: 'Satoshi, sans-serif' }}
          >
            {isAlreadyInvested ? 'View Simulation' : 'Invest Now'}
          </button>
        </div>
      </div>

      {modalType === 'already' && <AlreadyInvestedModal project={data} onClose={() => setModalType(null)} onContinue={handleContinue} />}
      {modalType === 'confirm' && <ConfirmInvestModal project={data} onClose={() => setModalType(null)} onSuccess={handleSuccess} />}
    </>
  );
}

// ─── Skeletons ────────────────────────────────────────────
function SkeletonFeatured() {
  return (
    <div className="rounded-2xl overflow-hidden animate-pulse h-full flex flex-col" style={{ background: 'rgba(255,255,255,0.05)' }}>
      <div className="flex-1 min-h-[280px] bg-white/10" />
      <div className="flex-shrink-0 p-5 space-y-4">
        <div className="grid grid-cols-3 gap-3">{[1,2,3].map(i => <div key={i} className="h-16 rounded-xl bg-white/10" />)}</div>
        <div className="h-2 rounded-full bg-white/10 w-full" />
        <div className="h-14 rounded-2xl bg-white/10" />
        <div className="h-16 rounded-2xl bg-white/10" />
        <div className="grid grid-cols-2 gap-3">{[1,2].map(i => <div key={i} className="h-12 rounded-2xl bg-white/10" />)}</div>
      </div>
    </div>
  );
}

function SkeletonSmall() {
  return (
    <div className="rounded-2xl overflow-hidden animate-pulse" style={{ background: 'rgba(255,255,255,0.05)' }}>
      <div className="h-12 bg-white/10" />
      <div className="p-2 space-y-2">
        <div className="h-32 rounded-xl bg-white/10" />
        <div className="h-2 rounded-full bg-white/10" />
        {[1,2].map(i => (
          <div key={i} className="flex justify-between">
            <div className="h-3 w-16 rounded bg-white/10" />
            <div className="h-3 w-14 rounded bg-white/10" />
          </div>
        ))}
        <div className="h-10 rounded bg-white/10" />
      </div>
      <div className="grid grid-cols-2 gap-1.5 p-2">
        <div className="h-7 rounded-full bg-white/10" />
        <div className="h-7 rounded-full bg-white/10" />
      </div>
    </div>
  );
}

// ─── Main Content ─────────────────────────────────────────
function ProjectDetailContent() {
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [projects, setProjects] = useState<ProjectData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchProjects = async () => {
      logTokenStatus();
      try {
        setLoading(true); setError(null);
        const token = getToken();
        if (!token) { setError('Not authenticated. Please log in.'); return; }
        const response = await fetchWithAuth(`${BASE_URL}/user/simulation/projects`);
        if (!response.ok) { setError(`Failed to fetch projects (${response.status})`); return; }
        const data = await response.json();
        if (!Array.isArray(data.data)) { setProjects([]); return; }
        setProjects(data.data);
      } catch {
        setError('Something went wrong. Please try again.');
      } finally { setLoading(false); }
    };
    fetchProjects();
  }, []);

  const featured = projects[0] ?? null;
  const rest = projects.slice(1);

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <div className="flex-1 max-w-[1920px] w-full mx-auto px-3 sm:px-4 md:px-6 pt-1 pb-4 sm:pt-2 sm:pb-6">
        <div className="-mt-4 sm:-mt-5 md:-mt-6">
          <HeaderSection />
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-4 mt-4 sm:mt-6 md:mt-8">
          <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
            <button
              onClick={() => router.back()}
              className="flex items-center justify-center w-[40px] h-[40px] sm:w-[46px] sm:h-[46px] rounded-full transition-all hover:opacity-90 flex-shrink-0"
              style={{ background: '#ef6b23' }}
            >
              <ArrowLeft size={18} className="text-white" />
            </button>
            <h1 className="text-white text-[20px] sm:text-[24px] font-medium flex-1" style={{ fontFamily: 'Dubai, sans-serif' }}>
              Project Discovery
            </h1>
            <button
              onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
              className="lg:hidden flex items-center gap-2 px-4 py-2 rounded-full text-white text-sm"
              style={{ background: '#ef6b23' }}
            >
              <Filter size={16} /> Filters
            </button>
          </div>

          {/* Desktop filter bar */}
          <div className="hidden lg:flex items-center gap-2.5 flex-1 overflow-x-auto scrollbar-hide">
            <div className="relative flex-shrink-0">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/60" size={14} />
              <input
                type="text" placeholder="Search"
                className="w-[160px] pl-9 pr-3 py-2 rounded-full text-white text-[13px] placeholder:text-white/60 focus:outline-none focus:ring-1 focus:ring-white/20 transition"
                style={{ background: 'linear-gradient(0deg, rgba(0,0,0,0.2), rgba(0,0,0,0.2)), linear-gradient(134.61deg, rgba(255,255,255,0.3) -29.34%, rgba(255,255,255,0.05) 131.55%)', fontFamily: 'Dubai, sans-serif' }}
              />
            </div>
            {['Map', 'Sort', 'Location', 'Project Status', 'Investment Type', 'Duration', 'Founding Progress'].map((label) => (
              <button key={label}
                className="flex items-center gap-1.5 px-4 py-2 rounded-full text-white text-[13px] whitespace-nowrap hover:bg-white/10 transition flex-shrink-0"
                style={{ background: 'linear-gradient(0deg, rgba(0,0,0,0.2), rgba(0,0,0,0.2)), linear-gradient(134.61deg, rgba(255,255,255,0.3) -29.34%, rgba(255,255,255,0.05) 131.55%)', fontFamily: 'Dubai, sans-serif' }}>
                {label} <ChevronDown size={12} />
              </button>
            ))}
          </div>
        </div>

        {/* Mobile Filters */}
        {mobileFiltersOpen && (
          <div className="lg:hidden mb-4 p-4 rounded-2xl animate-slideDown"
            style={{ background: 'linear-gradient(0deg, rgba(0,0,0,0.2), rgba(0,0,0,0.2)), linear-gradient(134.61deg, rgba(255,255,255,0.3) -29.34%, rgba(255,255,255,0.05) 131.55%)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.2)' }}>
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/60" size={16} />
              <input type="text" placeholder="Search projects..."
                className="w-full pl-10 pr-4 py-3 rounded-full text-white text-sm placeholder:text-white/60 focus:outline-none"
                style={{ background: 'rgba(255,255,255,0.1)', fontFamily: 'Dubai, sans-serif' }} />
            </div>
            <div className="grid grid-cols-2 gap-2">
              {['Map', 'Sort', 'Location', 'Project Status', 'Investment Type', 'Duration', 'Founding Progress'].map((label) => (
                <button key={label}
                  className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-white text-sm hover:bg-white/10 transition"
                  style={{ background: 'rgba(255,255,255,0.1)', fontFamily: 'Dubai, sans-serif' }}>
                  {label} <ChevronDown size={14} />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── Main container ── */}
        <div
          className="p-3 sm:p-4 md:p-6 rounded-2xl backdrop-blur-md border border-white/20"
          style={{ maxWidth: 1834, marginInline: 'auto', background: 'linear-gradient(0deg, rgba(0,0,0,0.2), rgba(0,0,0,0.2)), linear-gradient(134.61deg, rgba(255,255,255,0.3) -29.34%, rgba(255,255,255,0.05) 131.55%)' }}
        >
          {error && (
            <div className="flex items-center justify-center py-16">
              <div className="text-center space-y-2">
                <p className="text-red-400 text-sm">{error}</p>
                <button onClick={() => window.location.reload()} className="px-4 py-2 rounded-full text-xs text-white" style={{ background: '#ef6b23' }}>Retry</button>
              </div>
            </div>
          )}

          {!error && (
            <>
              {/* ── Top section: Featured (7/12) + 2 regular stacked (5/12) ── */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5 mb-4 sm:mb-5 lg:items-stretch">

                {/* Featured card — h-full so it fills the row */}
                <div className="lg:col-span-7 h-full">
                  {loading ? <SkeletonFeatured /> : featured ? (
                    <FeaturedProjectCard data={featured} />
                  ) : (
                    <div className="flex flex-col items-center justify-center h-64 gap-3 rounded-2xl border border-white/10">
                      <Home className="w-10 h-10 text-white/20" />
                      <p className="text-white/30 text-sm">No featured project</p>
                    </div>
                  )}
                </div>

                {/* 2 regular cards stacked — 5/12 columns */}
                <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
                  {loading
                    ? [1, 2].map(i => <SkeletonSmall key={i} />)
                    : rest.slice(0, 2).map(project => <RegularProjectCard key={project.id} data={project} />)
                  }
                </div>
              </div>

              {/* ── More projects grid ── */}
              {(loading || rest.length > 2) && (
                <>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="h-px flex-1 bg-white/10" />
                    <span className="text-white/40 text-xs font-medium uppercase tracking-widest px-2" style={{ fontFamily: 'Satoshi, sans-serif' }}>More Projects</span>
                    <div className="h-px flex-1 bg-white/10" />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {loading
                      ? [...Array(4)].map((_, i) => <SkeletonSmall key={i} />)
                      : rest.slice(2).map(project => <RegularProjectCard key={project.id} data={project} />)
                    }
                  </div>
                </>
              )}

              {/* Empty state */}
              {!loading && projects.length === 0 && (
                <div className="flex flex-col items-center justify-center py-24 gap-3">
                  <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center">
                    <Home className="w-8 h-8 text-white/30" />
                  </div>
                  <p className="text-white/30 text-sm">No projects found</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <FooterSection />

      <style jsx global>{`
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .animate-slideDown { animation: slideDown 0.3s ease-out; }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}

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
