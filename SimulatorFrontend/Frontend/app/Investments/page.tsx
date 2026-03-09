'use client';

import React, { JSX, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, TrendingUp, Wallet, CheckCircle2, AlertCircle } from 'lucide-react';
import { HeaderSection } from '@/app/Investordashboard/sections/HeaderSection';
const HeaderSectionAny: any = HeaderSection;

// ─── Base URL ─────────────────────────────────────────────
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
async function refreshAccessToken(): Promise<string | null> {
  try {
    const rt = getRefreshToken();
    if (!rt) return null;
    const res = await fetch(`${BASE_URL}/user/auth/refresh-token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken: rt }),
    });
    if (!res.ok) { clearTokens(); return null; }
    const data = await res.json();
    const newAt = data.data?.accessToken ?? data.data?.token ?? data.accessToken ?? data.token;
    const newRt = data.data?.refreshToken ?? data.refreshToken;
    if (!newAt) return null;
    setTokens(newAt, newRt);
    return newAt;
  } catch { return null; }
}
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
    if (!newToken) { clearTokens(); window.location.href = '/login'; return res; }
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

// ─── Types ────────────────────────────────────────────────
interface Investment {
  id: string;
  userId: string;
  projectPoolId: string;
  amount: string;
  expectedReturn: string;
  ownershipPct: null | string;
  isSimulated: boolean;
  status: 'ACTIVE' | 'COMPLETED' | 'CANCELLED' | string;
  createdAt?: string;
  updatedAt?: string;
}

interface Project {
  id: string;
  name: string;
  location: string;
  imageUrl: string;
  returnPercent: string;
  timelineDays: number;
  totalValue: string;
  pool: {
    id: string;
    asset: string;
    mode: string;
  };
  latestProgress: null | number;
}

// ── Enriched = Investment + matched Project ──
interface EnrichedInvestment extends Investment {
  projectName: string;
  projectId: string;
  projectLocation: string;
  projectAsset: string;
}

// ─── Skeleton Row ─────────────────────────────────────────
function SkeletonRow() {
  return (
    <div
      className="animate-pulse flex items-center gap-4 p-4 rounded-2xl border border-white/10"
      style={{ background: 'rgba(255,255,255,0.04)' }}
    >
      <div className="w-12 h-12 rounded-xl bg-white/10 flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-4 w-40 rounded bg-white/10" />
        <div className="h-3 w-24 rounded bg-white/10" />
      </div>
      <div className="flex flex-col items-end gap-2">
        <div className="h-4 w-20 rounded bg-white/10" />
        <div className="h-3 w-14 rounded bg-white/10" />
      </div>
      <div className="h-8 w-28 rounded-full bg-white/10" />
    </div>
  );
}

// ─── Status Badge ─────────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { bg: string; color: string; border: string }> = {
    ACTIVE:    { bg: 'rgba(19,174,133,0.15)',  color: '#13AE85', border: 'rgba(19,174,133,0.3)'  },
    COMPLETED: { bg: 'rgba(99,102,241,0.15)',  color: '#818cf8', border: 'rgba(99,102,241,0.3)'  },
    CANCELLED: { bg: 'rgba(239,68,68,0.15)',   color: '#f87171', border: 'rgba(239,68,68,0.3)'   },
  };
  const c = map[status] ?? { bg: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.5)', border: 'rgba(255,255,255,0.15)' };
  return (
    <span
      className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold whitespace-nowrap"
      style={{ background: c.bg, color: c.color, border: `1px solid ${c.border}`, fontFamily: 'Satoshi, sans-serif' }}
    >
      <CheckCircle2 size={9} />
      {status.charAt(0) + status.slice(1).toLowerCase()}
    </span>
  );
}

// ─── Investment Card ──────────────────────────────────────
function InvestmentCard({
  inv,
  index,
  onView,
}: {
  inv: EnrichedInvestment;
  index: number;
  onView: (inv: EnrichedInvestment) => void;
}) {
  const amount = Number(inv.amount);
  const expectedReturn = Number(inv.expectedReturn);
  const profit = expectedReturn - amount;

  const createdDate = inv.createdAt
    ? new Date(inv.createdAt).toLocaleDateString('en-IN', {
        day: '2-digit', month: 'short', year: 'numeric',
      })
    : null;

  return (
    <div
      className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 p-4 sm:p-5 rounded-2xl border border-white/10 hover:border-white/25 transition-all duration-200"
      style={{
        background: 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)',
      }}
    >
      {/* ── Index badge + Info ── */}
      <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
        {/* Number */}
        <div
          className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center flex-shrink-0 font-bold text-sm"
          style={{
            background: 'rgba(239,107,35,0.15)',
            color: '#EF6B23',
            border: '1px solid rgba(239,107,35,0.25)',
            fontFamily: 'Dubai, sans-serif',
          }}
        >
          {String(index + 1).padStart(2, '0')}
        </div>

        {/* Text info */}
        <div className="flex flex-col gap-1 min-w-0">
          {/* ✅ Project Name (not ID) */}
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className="text-white font-semibold text-sm sm:text-base"
              style={{ fontFamily: 'Dubai, sans-serif' }}
            >
              {inv.projectName}
            </span>
            <StatusBadge status={inv.status} />
            {inv.isSimulated && (
              <span
                className="px-2 py-0.5 rounded-full text-[9px] font-medium"
                style={{
                  background: 'rgba(139,92,246,0.15)',
                  color: '#a78bfa',
                  border: '1px solid rgba(139,92,246,0.25)',
                  fontFamily: 'Satoshi, sans-serif',
                }}
              >
                Simulated
              </span>
            )}
          </div>

          {/* Sub info: location + asset + date */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {inv.projectLocation && (
              <span
                className="text-white/40 text-[10px] sm:text-xs"
                style={{ fontFamily: 'Satoshi, sans-serif' }}
              >
                📍 {inv.projectLocation}
              </span>
            )}
            {inv.projectAsset && (
              <span className="text-white/30 text-[10px]">· {inv.projectAsset}</span>
            )}
            {createdDate && (
              <span className="text-white/30 text-[10px]">· {createdDate}</span>
            )}
          </div>
        </div>
      </div>

      {/* ── Financials + Button ── */}
      <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-6 flex-shrink-0">

        {/* Amounts */}
        <div className="flex flex-col items-start sm:items-end gap-1">
          <div className="flex items-center gap-1.5">
            <Wallet size={11} className="text-white/40" />
            <span
              className="text-white font-bold text-sm sm:text-base"
              style={{ fontFamily: 'Dubai, sans-serif' }}
            >
              ${amount.toLocaleString()}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <TrendingUp size={11} className="text-[#13AE85]" />
            <span
              className="text-[#13AE85] font-semibold text-xs"
              style={{ fontFamily: 'Satoshi, sans-serif' }}
            >
              ${expectedReturn.toLocaleString()} expected
            </span>
          </div>
          {profit > 0 && (
            <span
              className="text-[#13AE85]/60 text-[10px]"
              style={{ fontFamily: 'Satoshi, sans-serif' }}
            >
              +${profit.toLocaleString()} profit
            </span>
          )}
        </div>

        {/* ✅ View Simulation → goes to SimulatorDashboardF3?id=PROJECT_ID */}
        <button
          onClick={() => onView(inv)}
          className="px-3 sm:px-4 py-2 sm:py-2.5 rounded-full text-[10px] sm:text-xs font-semibold text-white transition-all hover:opacity-90 whitespace-nowrap flex-shrink-0"
          style={{ background: '#EF6B23', fontFamily: 'Satoshi, sans-serif' }}
        >
          View Simulation
        </button>
      </div>
    </div>
  );
}

// ─── Summary Bar ──────────────────────────────────────────
function SummaryBar({ investments }: { investments: EnrichedInvestment[] }) {
  const total = investments.reduce((s, i) => s + Number(i.amount), 0);
  const totalExpected = investments.reduce((s, i) => s + Number(i.expectedReturn), 0);
  const profit = totalExpected - total;
  const active = investments.filter(i => i.status === 'ACTIVE').length;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
      {[
        { label: 'Total Invested',    value: `$${total.toLocaleString()}`,          color: 'white'    },
        { label: 'Expected Return',   value: `$${totalExpected.toLocaleString()}`,  color: '#13AE85'  },
        { label: 'Estimated Profit',  value: profit > 0 ? `+$${profit.toLocaleString()}` : '—', color: '#13AE85' },
        { label: 'Active',            value: String(active),                        color: '#EF6B23'  },
      ].map(s => (
        <div
          key={s.label}
          className="flex flex-col gap-1 px-4 py-3 rounded-2xl border border-white/10"
          style={{ background: 'rgba(255,255,255,0.05)' }}
        >
          <span
            className="text-white/40 text-[10px] uppercase tracking-wide"
            style={{ fontFamily: 'Satoshi, sans-serif' }}
          >
            {s.label}
          </span>
          <span
            className="font-bold text-lg sm:text-xl"
            style={{ color: s.color, fontFamily: 'Dubai, sans-serif' }}
          >
            {s.value}
          </span>
        </div>
      ))}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────
export default function InvestmentsPage(): JSX.Element {
  const router = useRouter();

  const [enriched, setEnriched] = useState<EnrichedInvestment[]>([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = getToken();
        if (!token) { setError('Not authenticated. Please log in.'); return; }

        // ── Fetch both in parallel ──────────────────────────
        const [invRes, projRes] = await Promise.all([
          fetchWithAuth(`${BASE_URL}/user/simulation/investments`),
          fetchWithAuth(`${BASE_URL}/user/simulation/projects`),
        ]);

        if (!invRes.ok)  { setError(`Failed to fetch investments (${invRes.status})`);  return; }
        if (!projRes.ok) { setError(`Failed to fetch projects (${projRes.status})`);    return; }

        const invJson  = await invRes.json();
        const projJson = await projRes.json();

        console.log('✅ [INVESTMENTS]', invJson.data);
        console.log('✅ [PROJECTS]',    projJson.data);

        const investments: Investment[] = Array.isArray(invJson.data)  ? invJson.data  : [];
        const projects:    Project[]    = Array.isArray(projJson.data) ? projJson.data : [];

        // ── Build pool.id → Project map ─────────────────────
        // Each project has a `pool.id` — match against investment.projectPoolId
        const poolToProject = new Map<string, Project>();
        projects.forEach(p => {
          if (p.pool?.id) poolToProject.set(p.pool.id, p);
        });

        console.log('🗺️ [MATCH] Pool→Project map size:', poolToProject.size);

        // ── Enrich investments with project data ─────────────
        const result: EnrichedInvestment[] = investments.map(inv => {
          const matched = poolToProject.get(inv.projectPoolId);
          console.log(
            `🔗 [MATCH] inv.projectPoolId=${inv.projectPoolId} →`,
            matched ? `✅ ${matched.name}` : '❌ No match'
          );
          return {
            ...inv,
            projectName:     matched?.name     ?? `Investment ${inv.id.slice(0, 6).toUpperCase()}`,
            projectId:       matched?.id       ?? '',
            projectLocation: matched?.location ?? '',
            projectAsset:    matched?.pool?.asset ?? 'USD',
          };
        });

        setEnriched(result);
      } catch (err) {
        console.error('💥 [INVESTMENTS]', err);
        setError('Something went wrong. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // ✅ Navigate to simulator using the REAL project.id
  const handleView = (inv: EnrichedInvestment) => {
    if (!inv.projectId) {
      console.warn('⚠️ No projectId found for investment — using projectPoolId as fallback');
      router.push(`/SimulatorDashboardF3?id=${inv.projectPoolId}`);
      return;
    }
    console.log('🚀 [NAV] Opening simulator for project:', inv.projectId, '—', inv.projectName);
    router.push(`/SimulatorDashboardF3?id=${inv.projectId}`);
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-[1836px] mx-auto px-3 sm:px-4 md:px-6 lg:px-8 pt-1 pb-8">

        {/* Header */}
        <div className="-mt-4 sm:-mt-5 md:-mt-6">
          <HeaderSectionAny
            showNavButtons={true}
            onMobileMenuToggle={(isOpen: boolean) => console.log('Menu toggled:', isOpen)}
          />
        </div>

        {/* Back + Title */}
        <div className="flex items-center gap-3 sm:gap-4 mt-4 sm:mt-6 mb-6 sm:mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center justify-center w-[40px] h-[40px] sm:w-[46px] sm:h-[46px] rounded-full transition-all hover:opacity-90 flex-shrink-0"
            style={{ background: '#ef6b23' }}
            aria-label="Go back"
          >
            <ArrowLeft size={18} className="text-white" />
          </button>
          <div>
            <h1
              className="text-white text-xl sm:text-2xl md:text-3xl font-bold"
              style={{ fontFamily: 'Dubai, sans-serif' }}
            >
              My Investments
            </h1>
            {!loading && !error && (
              <p
                className="text-white/40 text-xs sm:text-sm mt-0.5"
                style={{ fontFamily: 'Satoshi, sans-serif' }}
              >
                {enriched.length} investment{enriched.length !== 1 ? 's' : ''} found
              </p>
            )}
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6 animate-pulse">
              {[1,2,3,4].map(i => (
                <div key={i} className="h-20 rounded-2xl bg-white/5 border border-white/10" />
              ))}
            </div>
            {[1,2,3,4,5].map(i => <SkeletonRow key={i} />)}
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <AlertCircle size={40} className="text-red-400" />
            <p className="text-red-400 text-sm" style={{ fontFamily: 'Satoshi, sans-serif' }}>{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-5 py-2 rounded-full text-xs text-white"
              style={{ background: '#ef6b23' }}
            >
              Retry
            </button>
          </div>
        )}

        {/* Empty */}
        {!loading && !error && enriched.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center"
              style={{ background: 'rgba(255,255,255,0.05)' }}
            >
              <Wallet size={28} className="text-white/30" />
            </div>
            <p className="text-white/40 text-sm" style={{ fontFamily: 'Satoshi, sans-serif' }}>
              No investments yet
            </p>
            <button
              onClick={() => router.push('/ProjectDiscovery')}
              className="px-6 py-2.5 rounded-full text-sm text-white font-medium"
              style={{ background: '#ef6b23', fontFamily: 'Satoshi, sans-serif' }}
            >
              Explore Projects
            </button>
          </div>
        )}

        {/* Loaded */}
        {!loading && !error && enriched.length > 0 && (
          <>
            <SummaryBar investments={enriched} />

            <div
              className="rounded-2xl border border-white/10 overflow-hidden"
              style={{
                background: 'linear-gradient(0deg, rgba(0,0,0,0.2), rgba(0,0,0,0.2)), linear-gradient(134.61deg, rgba(255,255,255,0.15) -29.34%, rgba(255,255,255,0.03) 131.55%)'
              }}
            >
              {/* Table header */}
              <div
                className="hidden sm:flex items-center justify-between px-5 py-3 border-b border-white/10"
                style={{ background: 'rgba(0,0,0,0.3)' }}
              >
                <span
                  className="text-white/40 text-xs uppercase tracking-widest"
                  style={{ fontFamily: 'Satoshi, sans-serif' }}
                >
                  Project
                </span>
                <span
                  className="text-white/40 text-xs uppercase tracking-widest"
                  style={{ fontFamily: 'Satoshi, sans-serif' }}
                >
                  Amount / Return / Action
                </span>
              </div>

              {/* List */}
              <div className="p-3 sm:p-4 space-y-3">
                {enriched.map((inv, i) => (
                  <InvestmentCard
                    key={inv.id}
                    inv={inv}
                    index={i}
                    onView={handleView}
                  />
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
