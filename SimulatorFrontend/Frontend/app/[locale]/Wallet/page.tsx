"use client";
import { useState, useEffect } from "react";
import {
  ArrowDown, ArrowUp, Send, CreditCard,
  Search, ChevronDown, ArrowLeftRight, Settings
} from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { useLocale } from "next-intl";
import { getTranslations } from "next-intl/server";

import { HeaderSection } from '@/app/[locale]/Investordashboard/sections/HeaderSection';
import { FooterSection } from "@/app/[locale]/Investordashboard/sections/FooterSection";

// --- Utils ---
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- Base URL ---
const BASE_URL = 'https://cobuild-simulator-backend.onrender.com/api/v1';

// --- Assets ---
const imgBitcoin  = "/assets/bitcoin.png";
const imgEthereum = "/assets/ethereum.png";
const imgDesign   = "/assets/card-design.png";
const imgSolana   = "/assets/solana.png";
const imgUsdc     = "/assets/usdc.png";
const imgVector1  = "/assets/vector1.png";
const imgVector2  = "/assets/vector2.png";
const imgVector3  = "/assets/vector3.png";

const walletsList = [
  { name: "Phantom",  date: "15 Mar 2025", icon: "/assets/phantom.png"  },
  { name: "MetaMask", date: "16 Mar 2025", icon: "/assets/metamask.png" },
  { name: "Stripe",   date: "16 Mar 2025", icon: "/assets/stripe.png"   },
  { name: "Paypal",   date: "16 Mar 2025", icon: "/assets/paypal.png"   },
];

const ASSET_COLORS: Record<string, string> = {
  USD:     '#ef6b23',
  BTC:     '#f7931a',
  ETH:     '#627eea',
  DEFAULT: '#ffffff',
};

// ─── Arabic Translations ───────────────────────────────────
// English is written directly in JSX below.
// Arabic is loaded from ar.json only when locale === 'ar'.
const AR = {
  totalInvested:   "إجمالي الاستثمار",
  spendingTitle:   "الإنفاق في نوفمبر",
  spendingAmount:  "$274.00",
  spendingSubtext: "هذا أقل بـ $54.00 من الشهر الماضي",
  actions: {
    recharge: "شحن",
    withdraw: "سحب",
    send:     "إرسال",
    cards:    "البطاقات",
    settings: "الإعدادات",
  },
  allocation: {
    title:            "توزيع الأموال",
    fundsLabel:       "الأموال",
    simulationWallet: "محفظة المحاكاة",
    dividedWallet:    "المحفظة المقسمة",
    defaultAmount:    "$35,450",
    phantom:          "فانتوم",
    connects:         "كونيكتس",
    coinbase:         "كوين بيس",
  },
  walletConnect: {
    title:   "ربط المحفظة",
    connect: "ربط",
  },
  swap: {
    title:      "تبادل العملات",
    slippage:   "الانزلاق",
    youPay:     "تدفع",
    youReceive: "تستلم",
    swapBtn:    "تبادل العملة",
  },
  card: {
    title:     "بطاقة المحفظة",
    addCard:   "إضافة بطاقة",
    validThru: "صالح\nحتى",
  },
  transactions: {
    title: "المعاملات الأخيرة",
    date:  "التاريخ",
    type:  "النوع",
    amount:"المبلغ",
    status:"الحالة",
    fee:   "الرسوم",
    txnId: "معرّف المعاملة",
    noTxn: "لا توجد معاملات بعد",
  },
};

// ─── Hook: returns Arabic strings or falls back to English default ─────────
function useT() {
  const locale = useLocale();
  const isArabic = locale === 'ar';
  return { AR, isArabic };
}

// ─── Token Helpers ─────────────────────────────────────────
function getToken() {
  return localStorage.getItem('accessToken') ?? '';
}

function getRefreshToken() {
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

// ─── Refresh Access Token ──────────────────────────────────
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
      data.data?.accessToken ?? data.data?.token ??
      data.accessToken       ?? data.token;

    const newRefreshToken =
      data.data?.refreshToken ?? data.refreshToken;

    if (!newAccessToken) return null;

    setTokens(newAccessToken, newRefreshToken);
    return newAccessToken;
  } catch {
    return null;
  }
}

// ─── Smart Fetch with Auto Refresh ────────────────────────
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
      window.location.href = '/LoginPage';
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

// ─── Transaction Types ─────────────────────────────────────
interface Transaction {
  id: string;
  date?: string;
  createdAt?: string;
  type?: string;
  transactionType?: string;
  amount?: number | string;
  status?: string;
  fee?: number | string;
  txnId?: string;
  transactionId?: string;
}

// ─── Components ────────────────────────────────────────────

function ActionButtons() {
  const { AR, isArabic } = useT();
  const actions = [
    { label: isArabic ? AR.actions.recharge : "Recharge", icon: ArrowDown  },
    { label: isArabic ? AR.actions.withdraw : "Withdraw", icon: ArrowUp    },
    { label: isArabic ? AR.actions.send     : "Send",     icon: Send       },
    { label: isArabic ? AR.actions.cards    : "Cards",    icon: CreditCard },
    { label: isArabic ? AR.actions.settings : "Settings", icon: Settings   },
  ];
  return (
    <div className="flex justify-between items-center w-full gap-1">
      {actions.map((action, i) => (
        <div key={i} className="flex flex-col items-center gap-1.5 group cursor-pointer min-w-[50px]">
          <div className="w-9 h-9 lg:w-10 lg:h-10 rounded-full bg-[#303030] flex items-center justify-center hover:scale-110 transition-all duration-300">
            <action.icon className="w-4 h-4 lg:w-5 lg:h-5 text-white" />
          </div>
          <span className="text-[10px] lg:text-xs font-medium text-white whitespace-nowrap">{action.label}</span>
        </div>
      ))}
    </div>
  );
}

function SpendingChart() {
  return (
    <div className="w-full h-5 relative">
      <div className="absolute inset-0 bg-white/10 rounded-full overflow-hidden">
        <div className="h-full bg-[#ef6b23] rounded-full transition-all duration-500" style={{ width: '65%' }} />
      </div>
      <div className="absolute left-[65%] top-1/2 -translate-x-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-white border-2 border-[#ef6b23] shadow-lg flex items-center justify-center">
        <div className="w-0.5 h-2 bg-[#ef6b23] rounded-full" />
      </div>
    </div>
  );
}

// ─── Transactions Table ────────────────────────────────────
function TransactionsTable() {
  const { AR, isArabic } = useT();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading]           = useState(true);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setLoading(true);
        if (!getToken()) return;
        const response = await fetchWithAuth(`${BASE_URL}/user/simulation/transactions`);
        if (!response.ok) return;
        const data = await response.json();
        setTransactions(Array.isArray(data.data) ? data.data : []);
      } catch (_) {
        // silently fail
      } finally {
        setLoading(false);
      }
    };
    fetchTransactions();
  }, []);

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric',
    });
  };

  const formatAmount = (amount?: number | string) => {
    if (amount === undefined || amount === null) return '-';
    return typeof amount === 'number' ? `$${amount.toLocaleString()}` : amount;
  };

  const headers = isArabic
    ? [AR.transactions.date, AR.transactions.type, AR.transactions.amount,
       AR.transactions.status, AR.transactions.fee, AR.transactions.txnId]
    : ["Date", "Type", "Amount", "Status", "Fee", "Transaction ID"];

  return (
    <div
      className="backdrop-blur-[20px] bg-white/10 border border-white/20 rounded-[15px] lg:rounded-[20px] h-full flex flex-col overflow-hidden"
      style={{ backgroundImage: "linear-gradient(156deg, rgba(255, 255, 255, 0.3) 29%, rgba(255, 255, 255, 0.05) 131%)" }}
    >
      <div className="px-4 lg:px-6 py-4 lg:py-5">
        <h3 className="text-sm lg:text-base font-medium text-white">
          {isArabic ? AR.transactions.title : "Recent Transactions"}
        </h3>
      </div>

      <div className="bg-white/10 h-10 lg:h-12 flex items-center px-4 lg:px-6 shadow-sm">
        <div className="grid grid-cols-6 w-full text-[10px] lg:text-xs font-bold text-white uppercase tracking-wider gap-1">
          <span>{headers[0]}</span>
          <span>{headers[1]}</span>
          <span className="text-center">{headers[2]}</span>
          <span className="text-center">{headers[3]}</span>
          <span className="text-center">{headers[4]}</span>
          <span className="text-right">{headers[5]}</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 lg:px-6 py-2">
        {loading && (
          <div className="space-y-3 py-2">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="grid grid-cols-6 gap-1 items-center py-3 border-b border-white/10">
                {[...Array(6)].map((_, j) => (
                  <div key={j} className="h-3 bg-white/20 animate-pulse rounded" />
                ))}
              </div>
            ))}
          </div>
        )}

        {!loading && transactions.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full py-8 gap-2">
            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
              <ArrowLeftRight className="w-5 h-5 text-white/40" />
            </div>
            <p className="text-white/40 text-xs">
              {isArabic ? AR.transactions.noTxn : "No transactions yet"}
            </p>
          </div>
        )}

        {!loading && transactions.map((txn, i) => (
          <div key={txn.id ?? i} className="grid grid-cols-6 w-full py-3 lg:py-4 border-b border-white/10 items-center last:border-0 gap-1 text-[11px] lg:text-xs">
            <span className="font-bold text-[#ececec]">{formatDate(txn.date ?? txn.createdAt)}</span>
            <span className="font-bold text-[#ececec] capitalize">{txn.type ?? txn.transactionType ?? '-'}</span>
            <span className="font-bold text-[#ececec] text-center">{formatAmount(txn.amount)}</span>
            <div className="flex justify-center">
              <div className={cn(
                "px-2 lg:px-3 py-1 rounded-full text-[10px] lg:text-xs font-medium min-w-[60px] lg:min-w-[80px] text-center",
                txn.status === 'Completed' || txn.status === 'completed'
                  ? "bg-[#1edf8d]/30 text-[#30e498]"
                  : txn.status === 'Pending' || txn.status === 'pending'
                  ? "bg-[#fcb45e]/30 text-[#fcb45e]"
                  : "bg-white/10 text-white/60"
              )}>
                {txn.status ?? '-'}
              </div>
            </div>
            <span className="font-bold text-[#ececec] text-center">{formatAmount(txn.fee)}</span>
            <span className="font-bold text-[#ececec] text-right truncate text-[10px]">
              {txn.txnId ?? txn.transactionId ?? txn.id ?? '-'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function WalletConnect() {
  const { AR, isArabic } = useT();
  return (
    <div
      className="backdrop-blur-[20px] bg-white/10 border border-white/20 rounded-[15px] lg:rounded-[20px] p-4 lg:p-5 h-full flex flex-col"
      style={{ backgroundImage: "linear-gradient(133deg, rgba(255, 255, 255, 0.3) 29%, rgba(255, 255, 255, 0.05) 131%)" }}
    >
      <h3 className="text-sm lg:text-base font-medium text-white mb-3 lg:mb-4">
        {isArabic ? AR.walletConnect.title : "Connect Wallet"}
      </h3>
      <div className="space-y-2 lg:space-y-3 flex-1 overflow-y-auto">
        {walletsList.map((wallet, i) => (
          <div key={wallet.name} className="flex flex-col gap-2 lg:gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 lg:w-9 lg:h-9 rounded-full bg-black overflow-hidden flex items-center justify-center border border-white/10">
                  <img src={wallet.icon} alt={wallet.name} className="w-5 h-5 lg:w-6 lg:h-6 object-contain" />
                </div>
                <div className="flex flex-col">
                  <span className="text-white text-xs lg:text-sm font-medium leading-tight">{wallet.name}</span>
                  <span className="text-[#fcfcfc] text-[10px] lg:text-xs font-light leading-tight">{wallet.date}</span>
                </div>
              </div>
              <button className="h-6 lg:h-7 px-2 lg:px-3 rounded-full border border-white/80 flex items-center gap-1 text-white text-[10px] lg:text-xs font-medium hover:bg-white/10 transition-all">
                <div className="w-1.5 h-1.5 rounded-full bg-white opacity-80" />
                {isArabic ? AR.walletConnect.connect : "Connect"}
              </button>
            </div>
            {i < walletsList.length - 1 && <div className="h-px bg-white/10 w-full" />}
          </div>
        ))}
      </div>
    </div>
  );
}

function SwapInterface() {
  const { AR, isArabic } = useT();
  return (
    <div
      className="backdrop-blur-[20px] bg-white/10 border border-white/20 rounded-[15px] lg:rounded-[20px] p-4 lg:p-5 h-full flex flex-col relative"
      style={{ backgroundImage: "linear-gradient(138deg, rgba(255, 255, 255, 0.3) 29%, rgba(255, 255, 255, 0.05) 131%)" }}
    >
      <div className="flex items-center justify-between mb-4 lg:mb-6">
        <h3 className="text-sm lg:text-base font-medium text-white">
          {isArabic ? AR.swap.title : "Swap Tokens"}
        </h3>
        <span className="text-[10px] lg:text-xs font-medium text-white cursor-pointer opacity-80 hover:opacity-100">
          {isArabic ? AR.swap.slippage : "Slippage"}
        </span>
      </div>

      <div className="space-y-2 lg:space-y-3 relative flex-1">
        <div className="border border-white/20 rounded-[12px] lg:rounded-[15px] p-3 lg:p-4 h-auto lg:h-[80px] relative overflow-hidden">
          <div className="flex justify-between items-start gap-2">
            <div className="flex-1">
              <p className="text-[#ececec] text-[10px] lg:text-xs font-medium mb-1">
                {isArabic ? AR.swap.youPay : "You Pay"}
              </p>
              <p className="text-white text-sm lg:text-base font-medium">3.000</p>
            </div>
            <div className="flex items-center gap-1.5">
              <img src={imgSolana} alt="SOL" className="w-7 h-7 lg:w-10 lg:h-10" />
              <div className="flex items-center gap-0.5 text-white text-xs lg:text-sm font-medium cursor-pointer whitespace-nowrap">
                SOL <ChevronDown className="w-3 h-3" />
              </div>
            </div>
          </div>
        </div>

        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
          <div className="w-7 h-7 lg:w-8 lg:h-8 rounded-full border border-white/20 bg-black/40 flex items-center justify-center cursor-pointer hover:bg-black/60 transition-all rotate-90 shadow-xl">
            <ArrowLeftRight className="w-3.5 h-3.5 lg:w-4 lg:h-4 text-white" />
          </div>
        </div>

        <div className="border border-white/20 rounded-[12px] lg:rounded-[15px] p-3 lg:p-4 h-auto lg:h-[80px] relative overflow-hidden mt-5 lg:mt-0">
          <div className="flex justify-between items-start gap-2">
            <div className="flex-1">
              <p className="text-[#ececec] text-[10px] lg:text-xs font-medium mb-1">
                {isArabic ? AR.swap.youReceive : "You Receive"}
              </p>
              <p className="text-white text-sm lg:text-base font-medium">3.000</p>
            </div>
            <div className="flex items-center gap-1.5 relative">
              <img src={imgUsdc} alt="USDC" className="w-16 h-16 lg:w-24 lg:h-24 absolute -right-3 -top-3 lg:-right-4 lg:-top-4 opacity-80" />
              <div className="flex items-center gap-0.5 text-white text-xs lg:text-sm font-medium cursor-pointer relative z-10 mr-1 whitespace-nowrap">
                USDC <ChevronDown className="w-3 h-3" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 lg:mt-6">
        <button className="w-full h-8 lg:h-9 bg-[#ef6b23] rounded-full text-white font-medium text-xs lg:text-sm hover:bg-[#ef6b23]/90 transition-all">
          {isArabic ? AR.swap.swapBtn : "Swap Coin"}
        </button>
      </div>
    </div>
  );
}

// ─── AllocationChart ───────────────────────────────────────
function AllocationChart() {
  const { AR, isArabic } = useT();
  const [balanceEntries, setBalanceEntries] = useState<
    { asset: string; fundSource: string; amount: number }[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [fetched, setFetched] = useState(false);

  useEffect(() => {
    const fetchWalletBalance = async () => {
      try {
        setLoading(true);
        const token = getToken();
        console.log('🔑 Token found:', token ? 'Yes' : 'No token in localStorage');
        if (!token) return;

        console.log('📡 Calling wallet balance API...');
        const response = await fetchWithAuth(`${BASE_URL}/user/simulation/wallet/balance`);
        console.log('📶 Response status:', response.status);

        if (!response.ok) {
          console.error('❌ API call failed with status:', response.status);
          return;
        }

        const data = await response.json();
        console.log('✅ Full API response:', JSON.stringify(data, null, 2));

        const balances = data.data?.balances ?? {};
        const entries = Object.values(balances) as {
          asset: string; fundSource: string; amount: number;
        }[];

        console.log('📊 Balance entries:', entries);
        setBalanceEntries(entries);
        setFetched(true);
      } catch (err) {
        console.error('💥 Error fetching wallet balance:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchWalletBalance();
  }, []);

  const totalAmount = balanceEntries.reduce((sum, b) => sum + b.amount, 0);

  const MIN_INNER  = 45;
  const BASE_INNER = 64;
  const BASE_OUTER = 70;
  const MAX_GROWTH = 22;
  const SCALE_CAP  = 500_000;

  const growthFactor = fetched && totalAmount > 0
    ? Math.min(totalAmount / SCALE_CAP, 1) : 0;

  const dynamicInner = Math.max(
    BASE_INNER + Math.round(growthFactor * MAX_GROWTH), MIN_INNER
  );
  const dynamicOuter = BASE_OUTER + Math.round(growthFactor * MAX_GROWTH);

  const chartData =
    fetched && balanceEntries.length > 0
      ? balanceEntries.map((b) => ({
          name:  b.asset,
          value: b.amount > 0 ? b.amount : 1,
          color: ASSET_COLORS[b.asset] ?? ASSET_COLORS.DEFAULT,
        }))
      : [
          { name: 'Divided',   value: 65, color: '#ef6b23' },
          { name: 'Remaining', value: 35, color: 'rgba(255, 255, 255, 0.1)' },
        ];

  const legendItems =
    fetched && balanceEntries.length > 0
      ? balanceEntries.map((b) => ({
          label:  b.asset,
          color:  ASSET_COLORS[b.asset] ?? ASSET_COLORS.DEFAULT,
          amount: `$${b.amount.toLocaleString()}`,
        }))
      : [
          { label: isArabic ? AR.allocation.phantom  : 'Phantom',  color: '#ffffff', amount: null as string | null },
          { label: isArabic ? AR.allocation.connects : 'Connects', color: '#ffffff', amount: null as string | null },
          { label: isArabic ? AR.allocation.coinbase : 'Coinbase', color: '#ffffff', amount: null as string | null },
        ];

  const formattedTotal = totalAmount.toLocaleString('en-US', {
    style: 'currency', currency: 'USD', maximumFractionDigits: 2,
  });

  return (
    <div
      className="backdrop-blur-[20px] bg-white/10 border border-white/20 rounded-[15px] lg:rounded-[20px] p-4 lg:p-5 h-full relative overflow-hidden"
      style={{ backgroundImage: 'linear-gradient(133deg, rgba(255, 255, 255, 0.3) 29%, rgba(255, 255, 255, 0.05) 131%)' }}
    >
      <h3 className="text-sm lg:text-base font-medium text-white mb-2">
        {isArabic ? AR.allocation.title : "Allocation Funds"}
      </h3>

      <div className="relative w-full h-[150px] lg:h-[180px] mt-2">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              innerRadius={dynamicInner}
              outerRadius={dynamicOuter}
              startAngle={90}
              endAngle={450}
              dataKey="value"
              stroke="none"
              cornerRadius={5}
              isAnimationActive={true}
              animationDuration={700}
              animationEasing="ease-out"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>

        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="bg-[#ef6b23] px-2 py-0.5 rounded-full text-[10px] font-bold text-white uppercase mb-1">
            {isArabic ? AR.allocation.fundsLabel : "Funds"}
          </div>
          {loading ? (
            <>
              <div className="h-6 w-20 bg-white/20 animate-pulse rounded mb-1" />
              <div className="h-3 w-16 bg-white/10 animate-pulse rounded" />
            </>
          ) : (
            <>
              <div className="text-xl lg:text-2xl font-bold text-white">
                {fetched && totalAmount > 0
                  ? formattedTotal
                  : (isArabic ? AR.allocation.defaultAmount : "$35,450")}
              </div>
              <div className="text-white/60 text-[10px] lg:text-xs">
                {fetched && totalAmount > 0
                  ? (isArabic ? AR.allocation.simulationWallet : "Simulation Wallet")
                  : (isArabic ? AR.allocation.dividedWallet    : "Divided Wallet")}
              </div>
            </>
          )}
        </div>
      </div>

      <div className="absolute bottom-4 lg:bottom-5 left-0 w-full px-4 lg:px-6">
        <div className="h-px bg-white/20 w-full mb-2 lg:mb-3" />
        {loading ? (
          <div className="flex justify-between px-1">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-3 w-14 bg-white/20 animate-pulse rounded" />
            ))}
          </div>
        ) : (
          <div className="flex justify-between items-center px-1 flex-wrap gap-y-1">
            {legendItems.map((item, i) => (
              <div key={i} className="flex items-center gap-1">
                <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                <span className="text-[10px] lg:text-xs text-white font-medium">{item.label}</span>
                {item.amount && (
                  <span className="text-[10px] text-white/60">{item.amount}</span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function WalletCard() {
  const { AR, isArabic } = useT();
  return (
    <div
      className="backdrop-blur-[20px] bg-white/10 border border-white/20 rounded-[15px] lg:rounded-[20px] p-4 lg:p-5 h-full flex flex-col"
      style={{ backgroundImage: "linear-gradient(134deg, rgba(255, 255, 255, 0.3) 29%, rgba(255, 255, 255, 0.05) 131%)" }}
    >
      <h3 className="text-sm lg:text-base font-medium text-white mb-3 lg:mb-4">
        {isArabic ? AR.card.title : "My Card Wallet"}
      </h3>
      <div className="relative w-full h-[130px] lg:h-[160px] rounded-[15px] lg:rounded-[20px] overflow-hidden bg-[#19224d]">
        <div className="absolute inset-0 opacity-50">
          <img src={imgVector1} className="absolute top-0 right-0 w-2/3 h-full object-cover" alt="" />
          <img src={imgVector2} className="absolute bottom-0 right-0 w-1/2 h-2/3 object-contain" alt="" />
          <img src={imgVector3} className="absolute top-0 left-0 w-1/2 h-full object-contain" alt="" />
        </div>
        <div className="relative z-10 p-4 lg:p-5 flex flex-col justify-between h-full">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-1.5">
              <div className="w-4 h-4 lg:w-5 lg:h-5 rounded-full border border-white/20 flex items-center justify-center">
                <div className="w-2 h-2 lg:w-2.5 lg:h-2.5 rounded-full bg-[#ef6b23]" />
              </div>
              <span className="font-semibold text-xs lg:text-sm text-white">Coinbuzz</span>
            </div>
            <span className="font-bold text-lg lg:text-xl text-white">$23,567.45</span>
          </div>
          <div className="mt-auto flex items-end justify-between">
            <div className="space-y-1">
              <p className="text-white text-xs tracking-widest">**** **** **** 9865</p>
              <div className="flex items-center gap-1.5">
                <div className="text-[4px] lg:text-[5px] text-white leading-none uppercase whitespace-pre-line">
                  {isArabic ? AR.card.validThru : "VALID\nTHRU"}
                </div>
                <span className="text-white text-[10px] lg:text-xs">08/25</span>
              </div>
            </div>
            <div className="text-white font-bold italic text-base lg:text-lg">VIZA</div>
          </div>
        </div>
      </div>
      <button className="mt-auto w-full h-8 rounded-full border border-white/60 bg-transparent text-white font-medium text-xs flex items-center justify-center gap-1.5 hover:bg-white/5 transition-all">
        <div className="w-3.5 h-3.5 lg:w-4 lg:h-4 rounded-full bg-white text-black flex items-center justify-center text-xs">+</div>
        {isArabic ? AR.card.addCard : "Add Card"}
      </button>
    </div>
  );
}

// ─── Main Wallet Page ──────────────────────────────────────
export default function Wallet() {
  const { AR, isArabic } = useT();

  return (
    <div
      className="min-h-screen bg-black text-foreground font-sans overflow-x-hidden"
      dir={isArabic ? 'rtl' : 'ltr'}
    >
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-[#ef6b23]/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#2c3a7c]/20 rounded-full blur-[120px]" />
      </div>

      <HeaderSection />

      <main className="relative z-10 pt-6 lg:pt-6 pb-4 lg:pb-8 px-3 lg:px-6 max-w-[1920px] mx-auto">
        <div className="flex flex-col lg:flex-row gap-4 lg:gap-5 w-full">

          {/* LEFT COLUMN */}
          <div className="w-full lg:w-[300px] xl:w-[340px] 2xl:w-[380px] shrink-0 backdrop-blur-[20px] bg-white/10 border border-white/20 rounded-[15px] lg:rounded-[20px] flex flex-col overflow-hidden">
            <div className="h-[70px] lg:h-[80px] border-b border-white/10 px-4 flex items-center justify-between">
              <div className="flex items-center gap-1">
                <span className="text-white/80 text-sm lg:text-base font-medium">
                  {isArabic ? AR.totalInvested : "Total Invested"}
                </span>
                <span className="text-white/80 text-sm lg:text-base">:</span>
                <span className="text-white text-xl lg:text-2xl font-bold ml-1">$9,385.34</span>
              </div>
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center cursor-pointer">
                <Search className="w-4 h-4 text-white" />
              </div>
            </div>

            <div className="flex-1 p-4 space-y-4 overflow-y-auto">
              <ActionButtons />
              <div className="backdrop-blur-[20px] bg-white/5 border border-white/10 rounded-[15px] p-4">
                <p className="text-white/80 text-xs mb-3">
                  {isArabic ? AR.spendingTitle : "Spending in November"}
                </p>
                <SpendingChart />
                <div className="flex flex-col gap-1 mt-3">
                  <span className="text-white text-lg font-bold">
                    {isArabic ? AR.spendingAmount : "$274.00"}
                  </span>
                  <span className="text-white/60 text-[10px]">
                    {isArabic ? AR.spendingSubtext : "This is $54.00 less than last month"}
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                {[
                  { ticker: "BTC", amount: "0.00040", usd: "$3,000", icon: imgBitcoin  },
                  { ticker: "ETH", amount: "0.00095", usd: "$3,000", icon: imgEthereum },
                ].map((asset, i) => (
                  <div key={i} className="bg-[#303030] rounded-[12px] h-[55px] flex items-center px-4 justify-between">
                    <div className="flex items-center gap-2">
                      <img src={asset.icon} className="w-7 h-7 rounded-full" alt={asset.ticker} />
                      <span className="text-white font-medium text-sm">{asset.ticker}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-white font-medium text-sm">{asset.amount}</div>
                      <div className="text-white/40 text-xs">({asset.usd})</div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="relative h-[140px] w-full rounded-[15px] overflow-hidden">
                <img src={imgDesign} alt="Design" className="absolute inset-0 w-full h-full object-cover" />
                <div className="absolute inset-0 p-4 flex flex-col justify-between">
                  <div className="text-right text-white text-lg font-medium">$9,385.34</div>
                  <div className="flex justify-between items-end">
                    <div className="space-y-1">
                      <div className="text-white text-xs tracking-widest">**** **** **** 9865</div>
                      <div className="flex items-center gap-1">
                        <div className="text-[4px] text-white/60 leading-none whitespace-pre-line">
                          {isArabic ? AR.card.validThru : "VALID\nTHRU"}
                        </div>
                        <div className="text-white text-[10px]">08/25</div>
                      </div>
                    </div>
                    <div className="text-white font-bold italic text-lg">VIZA</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-5 min-w-0 content-start">
            <div className="h-[260px] lg:h-[320px]"><AllocationChart /></div>
            <div className="h-[280px] lg:h-[320px]"><WalletConnect   /></div>
            <div className="h-[280px] lg:h-[320px]"><SwapInterface    /></div>
            <div className="h-[260px] lg:h-[320px]"><WalletCard       /></div>
            <div className="h-[300px] lg:h-[320px] lg:col-span-2"><TransactionsTable /></div>
          </div>

        </div>
      </main>

      <FooterSection />
    </div>
  );
}
