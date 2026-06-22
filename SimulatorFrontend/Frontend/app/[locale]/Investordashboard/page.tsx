"use client";

import {
  ArrowLeft,
  ArrowRight,
  Filter,
  TrendingUp,
  ChevronDown,
  ArrowUpRight,
  ArrowDownLeft,
  Zap,
  Calendar,
  Lock,
} from "lucide-react";
import { CSSProperties, useState } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from "recharts";

import { HeaderSection } from "@/app/[locale]/Investordashboard/sections/HeaderSection";
import { FooterSection } from "@/app/[locale]/Investordashboard/sections/FooterSection";

// ─── DATA ─────────────────────────────────────────────────────────────────────

const months = [
  { label: "Jan", labelAr: "يناير" },
  { label: "Feb", labelAr: "فبراير" },
  { label: "Mar", labelAr: "مارس" },
  { label: "Apr", labelAr: "أبريل" },
  { label: "May", labelAr: "مايو" },
  { label: "Jun", labelAr: "يونيو", active: true },
  { label: "Jul", labelAr: "يوليو" },
  { label: "Aug", labelAr: "أغسطس" },
  { label: "Sep", labelAr: "سبتمبر" },
  { label: "Oct", labelAr: "أكتوبر" },
];

const nftItems = [
  { label: "Lorem Ipsum", labelAr: "نموذج نص", value: "$32,567", change: "+8%" },
  { label: "Lorem Ipsum", labelAr: "نموذج نص", value: "$10,567", change: "+3%" },
  { label: "Other", labelAr: "أخرى", value: "$2,567", change: "+24%" },
];

const tokenBalanceItems = [
  { hex: "#EB6C27", name: "Bored Ape Yacht Club", nameAr: "بورد أيب يخت كلوب", pct: "40%", val: "$6.100" },
  { hex: "#FF8A3D", name: "CryptoPunks", nameAr: "كريبتو بانكس", pct: "25%", val: "$3.100" },
  { hex: "#FFB020", name: "Decentraland (Land)", nameAr: "ديسنترالاند (أرض)", pct: "15%", val: "$2.287" },
  { hex: "#FF9257", name: "Axie infinity (Axies)", nameAr: "أكسي إنفينيتي", pct: "10%", val: "$1.525" },
  { hex: "#D8D8D8", name: "Other", nameAr: "أخرى", pct: "10%", val: "$1.525" },
];

const metricCards = [
  { title: "Portfolio Value", titleAr: "قيمة المحفظة", value: "$150,000 USD", change: "8.5% Vs Last Month", changeAr: "8.5% مقارنة بالشهر الماضي", w: "w-[210px]" },
  { title: "Total ROI", titleAr: "إجمالي العائد", value: "+25.0%", change: "2.1% Today", changeAr: "2.1% اليوم", w: "w-[210px]" },
  { title: "UNREALIZED P/L", titleAr: "الربح/الخسارة غير المحققة", value: "+$30,000 USD", change: "$2,500 Today", changeAr: "$2,500 اليوم", w: "w-[210px]" },
];

const portfolioLegend = [
  { hex: "#EB6C27", label: "NFT", labelAr: "رمز NFT", value: "60% $90k" },
  { hex: "#FF8A3D", label: "Fungible Tokens", labelAr: "رموز قابلة للاستبدال", value: "40% $60k" },
];

const perfTokenItems = [
  { hex: "#EB6C27", name: "Bored Ape Yacht Club :", nameAr: "بورد أيب يخت كلوب :", pct: "40%", val: "$6.100" },
  { hex: "#FF8A3D", name: "CryptoPunks :", nameAr: "كريبتو بانكس :", pct: "25%", val: "$3.100" },
  { hex: "#FFB020", name: "Decentraland (Land) :", nameAr: "ديسنترالاند (أرض) :", pct: "15%", val: "$2.287" },
  { hex: "#FF9257", name: "Axie infinity (Axies) :", nameAr: "أكسي إنفينيتي :", pct: "10%", val: "$1.525" },
  { hex: "#D8D8D8", name: "Other :", nameAr: "أخرى :", pct: "10%", val: "$1.525" },
];

const portfolioTableRows = [
  { asset: "Crypto Punks", assetAr: "كريبتو بانكس", purchase: "$10,000", current: "$22,000", roi: "+120%", change: "+5%" },
  { asset: "Decentraland (Land)", assetAr: "ديسنترالاند (أرض)", purchase: "$5,000", current: "$6,000", roi: "+20%", change: "+2%" },
  { asset: "Axie Infinity (Axies)", assetAr: "أكسي إنفينيتي", purchase: "$1,000", current: "$700", roi: "-30%", change: "+1%" },
];

const transactionGroups = [
  {
    label: "Today", labelAr: "اليوم",
    txs: [{ icon: Zap, name: "Investment From Jan Doe", nameAr: "استثمار من جان دو", time: "11:23", amount: "$3,512.21" }],
  },
  {
    label: "Yesterday", labelAr: "أمس",
    txs: [
      { icon: ArrowDownLeft, name: "Pay Out Jan Doe", nameAr: "دفع لجان دو", time: "11:23", amount: "-$1,512.21" },
      { icon: ArrowUpRight, name: "Staking Reward Jan Doe", nameAr: "مكافأة التخزين جان دو", time: "11:23", amount: "$1,512.21" },
      { icon: ArrowDownLeft, name: "Pay Out Jan Doe", nameAr: "دفع لجان دو", time: "11:23", amount: "-$1,512.21" },
      { icon: ArrowUpRight, name: "Staking Reward Jan Doe", nameAr: "مكافأة التخزين جان دو", time: "11:23", amount: "$1,512.21" },
    ],
  },
];

const nftMainChartData = [
  { name: "Jan", val1: 2200, val2: 1200 },
  { name: "Feb", val1: 3100, val2: 1800 },
  { name: "Mar", val1: 2400, val2: 2100 },
  { name: "Apr", val1: 2800, val2: 3000 },
  { name: "May", val1: 2500, val2: 2200 },
  { name: "Jun", val1: 4892, val2: 3500 },
  { name: "Jul", val1: 2800, val2: 2400 },
  { name: "Aug", val1: 2300, val2: 1800 },
  { name: "Sep", val1: 2600, val2: 2000 },
  { name: "Oct", val1: 3200, val2: 2200 },
];

const metricChartData = [
  { data: [{ v: 10 }, { v: 18 }, { v: 14 }, { v: 25 }, { v: 22 }, { v: 35 }, { v: 28 }, { v: 45 }, { v: 38 }, { v: 60 }], color: "#EB6C27" },
  { data: [{ v: 40 }, { v: 35 }, { v: 42 }, { v: 30 }, { v: 50 }, { v: 38 }, { v: 55 }, { v: 45 }, { v: 60 }, { v: 48 }], color: "#FFB020" },
  { data: [{ v: 20 }, { v: 35 }, { v: 28 }, { v: 50 }, { v: 42 }, { v: 65 }, { v: 55 }, { v: 78 }, { v: 68 }, { v: 90 }], color: "#5BE37D" },
];

const nftItemChartsData = [
  { data: [{ v: 40 }, { v: 48 }, { v: 42 }, { v: 55 }, { v: 50 }, { v: 62 }, { v: 58 }, { v: 72 }, { v: 65 }, { v: 85 }, { v: 78 }, { v: 90 }], color: "#5BE37D" },
  { data: [{ v: 25 }, { v: 32 }, { v: 28 }, { v: 38 }, { v: 34 }, { v: 42 }, { v: 38 }, { v: 48 }, { v: 44 }, { v: 55 }, { v: 50 }, { v: 60 }], color: "#EB6C27" },
  { data: [{ v: 45 }, { v: 30 }, { v: 55 }, { v: 25 }, { v: 48 }, { v: 35 }, { v: 60 }, { v: 40 }, { v: 50 }, { v: 30 }, { v: 55 }, { v: 60 }], color: "#FFB020" },
];

const menuItems = [
  { label: "My Investments", labelAr: "استثماراتي", icon: "/figmaAssets/frame-1000003212-1.svg", route: "/my-Investments" },
  { label: "Smart Contract (Log)", labelAr: "سجل العقود الذكية", icon: "/figmaAssets/frame-1000003212.svg", route: null },
];

// ─── THEME VARIABLES ──────────────────────────────────────────────────────────
const rootThemeVars: CSSProperties = {
  ["--background" as string]: "#000000",
  ["--foreground" as string]: "#ffffff",
  ["--color-navbar" as string]: "#333333",
  ["--color-card" as string]: "#3c3c3c",
  ["--color-card-secondary" as string]: "#414a45",
  ["--color-card-border" as string]: "#7e7c7c",
  ["--color-transaction-bg" as string]: "#2f2f2f",
  ["--color-table-header" as string]: "#303030",
  ["--color-table-row" as string]: "#989898",
  ["--color-divider" as string]: "#3f3f3f",
  ["--color-primary-orange" as string]: "#eb6c27",
  ["--color-orange-highlight" as string]: "#ff9257",
  ["--color-orange-dark" as string]: "#bf561c",
  ["--color-yellow-accent" as string]: "#ffb020",
  ["--color-positive" as string]: "#5be37d",
  ["--color-text-white" as string]: "#ffffff",
  ["--color-text-secondary" as string]: "#d8d8d8",
  ["--color-text-muted" as string]: "#9ca3af",
  background: "#000000",
  color: "#ffffff",
  fontFamily: "Arial, Helvetica, sans-serif",
};

// ─── PIE DATA ─────────────────────────────────────────────────────────────────
const tokenBalanceData = [
  { name: "Bored Ape Yacht Club", value: 40, color: "#EB6C27" },
  { name: "CryptoPunks", value: 25, color: "#FF8A3D" },
  { name: "Decentraland (Land)", value: 15, color: "#FFB020" },
  { name: "Axie infinity (Axies)", value: 10, color: "#FF9257" },
  { name: "Other", value: 10, color: "#D8D8D8" },
];

const portfolioAppData = [
  { name: "NFT", value: 60, color: "#EB6C27" },
  { name: "Fungible Tokens", value: 40, color: "#FF8A3D" },
];

// ─── GLASS STYLES ─────────────────────────────────────────────────────────────
const glass =
  "relative rounded-[20px] overflow-hidden bg-gradient-to-br from-white/[0.15] to-white/[0.02] border border-[var(--color-card-border)] shadow-[0_12px_30px_rgba(0,0,0,0.45)]";

const glassPill =
  "relative inline-flex items-center justify-center gap-[3px] px-[15px] py-[5px] " +
  "bg-[var(--color-navbar)] border border-[var(--color-card-border)] rounded-[82px]";

// ─── HOVER OVERLAY ────────────────────────────────────────────────────────────
const LiveModeOverlay = ({ isAr }: { isAr: boolean }) => (
  <div className="absolute inset-0 bg-black/60 backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col items-center justify-center text-center p-6 z-30 rounded-[inherit] pointer-events-auto">
    <div className="bg-[#1c1c1e]/95 border border-white/10 px-6 py-4 rounded-xl shadow-2xl max-w-[90%] flex flex-col items-center gap-2.5 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">
      <Lock className="w-6 h-6 text-[var(--color-primary-orange)]" />
      <span className="[font-family:'Dubai-Medium',Helvetica] text-white text-base md:text-lg font-medium leading-normal block">
        {isAr
          ? "ميزة لوحة التحكم هذه ستكون متاحة في الوضع المباشر"
          : "This dashboard feature will be available in live mode"}
      </span>
    </div>
  </div>
);

// ─── COMPONENT ────────────────────────────────────────────────────────────────
export default function ElementDashboard() {
  const [activeNav, setActiveNav] = useState("Investor Dashboard");
  const [hoveredMenuIndex, setHoveredMenuIndex] = useState<number | null>(null);
  const router = useRouter();
  const locale = useLocale();
  const isAr = locale === "ar";
  const dir = isAr ? "rtl" : "ltr";

  return (
    <div
      dir={dir}
      style={rootThemeVars}
      className="bg-[var(--background)] w-full min-h-screen flex flex-col dashboard-wrapper"
    >
      <style>{`
        @media (max-width: 1200px) and (min-width: 1024px) {
          .dashboard-wrapper { zoom: 0.85; }
        }
      `}</style>

      {/* ── HeaderSection ─────────────────────────────────────────────────── */}
      <div className="w-full max-w-[1836px] mx-auto px-4 md:px-5">
        <HeaderSection />
      </div>

      {/* ── Action buttons row ────────────────────────────────────────────── */}
      {/*
        MOBILE CHANGES (vs original):
        1. Outer row: removed flex-col + gap-4 on mobile → now always flex row, justify-end on mobile
        2. Back button wrapper: hidden on mobile (sm:inline-flex)
        3. Buttons wrapper: grid-cols-2 on mobile → flex on sm+
      */}
      <div className="flex items-center justify-end sm:justify-between w-full px-4 md:px-[22px] py-3 bg-black">

        {/* ── Back button: hidden on mobile, visible sm+ ── */}
        <div className="hidden sm:inline-flex items-center gap-[15px]">
          <div
            onClick={() => router.back()}
            className={
              "relative flex items-center justify-center w-10 h-10 rounded-full cursor-pointer " +
              "bg-[linear-gradient(135deg,var(--color-orange-highlight),var(--color-primary-orange))] shadow-[0_3px_0_0_var(--color-orange-dark)]"
            }
          >
            {isAr
              ? <ArrowRight className="w-5 h-5 text-white" />
              : <ArrowLeft className="w-5 h-5 text-white" />
            }
          </div>
        </div>

        {/* ── Action buttons: 2-col grid on mobile, flex row on sm+ ── */}
        <div className="grid grid-cols-2 gap-[10px] sm:flex sm:items-center sm:gap-[15px] sm:justify-end">
          {menuItems.map((item, i) => (
            <div
              key={i}
              className="relative flex"
              onMouseEnter={() => setHoveredMenuIndex(i)}
              onMouseLeave={() => setHoveredMenuIndex(null)}
            >
              <div
                onClick={() => item.route && router.push(item.route)}
                className={
                  "relative flex items-center gap-[10px] px-7 py-0 sm:py-4 rounded-[14px] flex-shrink-0 w-full sm:w-auto " +
                  "bg-[linear-gradient(135deg,var(--color-orange-highlight),var(--color-primary-orange))] shadow-[0_3px_0_0_var(--color-orange-dark)] " +
                  (item.route ? "cursor-pointer" : "cursor-default opacity-80")
                }
              >
                <img
                  src={item.icon}
                  className="flex-shrink-0 w-7 h-7"
                  alt=""
                  onError={(e) => (e.currentTarget.style.display = "none")}
                />
                <span className="[font-family:'Dubai-Medium',Helvetica] text-white text-base md:text-[17px] leading-normal whitespace-nowrap">
                  {isAr ? item.labelAr : item.label}
                </span>
              </div>
              {item.label === "Smart Contact (Log)" && hoveredMenuIndex === i && (
                <div className="absolute top-[110%] left-1/2 -translate-x-1/2 px-3 py-2 bg-[#2a2a2a] text-white text-xs sm:text-sm rounded-md whitespace-nowrap z-[9999] border border-white/10 shadow-xl pointer-events-none">
                  This feature will be available in live mode.
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ── Two-column main area ──────────────────────────────────────────── */}
      <div className="flex flex-col lg:flex-row w-full items-stretch gap-5 px-4 md:px-5 pb-5">

        {/* ── LEFT COLUMN ───────────────────────────────────────────────────── */}
        <div className="flex flex-col w-full lg:w-1/2 min-w-0 self-stretch gap-5">

          {/* ── Investment Summary ──────────────────────────────────────────── */}
          <section className={`flex flex-col w-full items-start gap-5 pb-[30px] ${glass} group`}>

            {/* Header */}
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between pl-[18px] md:pl-[25px] pr-4 md:pr-5 py-4 md:py-5 self-stretch border-b border-[var(--color-divider)]">
              <h2 className="[font-family:'Dubai-Bold',Helvetica] font-bold text-[22px] text-white leading-normal">
                {isAr ? "إجمالي الاستثمار" : "Total Invested"}
              </h2>
              <div className="inline-flex flex-wrap items-center gap-2 rounded-[20px]">
                <div className="inline-flex items-center gap-[5px] pl-[12px] pr-2 py-[4px] bg-[var(--color-navbar)] rounded-[20px]">
                  <span className="[font-family:'Dubai-Medium',Helvetica] text-white text-[14px] md:text-[16px] leading-[24px] whitespace-nowrap">
                    {isAr ? "المحفظة النقدية" : "Fiat Wallet"}
                  </span>
                  <span className="[font-family:'Dubai-Regular',Helvetica] text-white text-[18px]">:</span>
                  <span className="[font-family:'Satoshi-Medium',Helvetica] text-white text-[14px] md:text-[18px]">$9,385.34</span>
                </div>
                <div className="inline-flex items-center gap-[5px] pl-2 pr-[12px] py-[4px] bg-[var(--color-navbar)] rounded-[20px]">
                  <span className="[font-family:'Dubai-Medium',Helvetica] text-white text-[14px] md:text-[16px] leading-[24px] whitespace-nowrap">
                    {isAr ? "قيمة الرمز" : "Token Value"}
                  </span>
                  <span className="[font-family:'Dubai-Regular',Helvetica] text-white text-[18px]">:</span>
                  <span className="[font-family:'Dubai-Medium',Helvetica] text-white text-[14px] md:text-[18px]">$2,578.32</span>
                </div>
              </div>
            </div>

            {/* NFT Chart */}
            <div className="flex flex-col gap-2.5 px-4 md:px-5 self-stretch">
              <div className={`flex flex-col gap-[25px] px-6 pt-[15px] ${glass}`}>
                <div className="flex items-center justify-between self-stretch">
                  <span className="[font-family:'Dubai-Medium',Helvetica] text-white text-[17px] leading-normal">NFT</span>
                  <div className={glassPill}>
                    <span className="[font-family:'Satoshi-Medium',Helvetica] text-white text-sm">
                      {isAr ? "محقق" : "Realized"}
                    </span>
                    <ChevronDown className="w-4 h-4 text-white" />
                  </div>
                </div>
                <div className="relative w-full h-[180px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={nftMainChartData} margin={{ top: 25, right: 5, left: 5, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorVal1" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#EB6C27" stopOpacity={0.7} />
                          <stop offset="100%" stopColor="#EB6C27" stopOpacity={0.05} />
                        </linearGradient>
                        <linearGradient id="colorVal2" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#D8D8D8" stopOpacity={0.4} />
                          <stop offset="100%" stopColor="#D8D8D8" stopOpacity={0.02} />
                        </linearGradient>
                      </defs>
                      <Tooltip
                        contentStyle={{ backgroundColor: "#1f1f1f", border: "none", borderRadius: "8px", color: "#fff" }}
                        itemStyle={{ color: "#fff" }}
                        cursor={false}
                      />
                      <Area type="monotone" dataKey="val2" stroke="#D8D8D8" strokeWidth={2} fillOpacity={1} fill="url(#colorVal2)" />
                      <Area
                        type="monotone"
                        dataKey="val1"
                        stroke="#EB6C27"
                        strokeWidth={3}
                        fillOpacity={0}
                        fill="url(#colorVal1)"
                        dot={(props: any) => {
                          const { cx, cy, index } = props;
                          if (index === 5 && cx !== undefined && cy !== undefined) {
                            return (
                              <svg key={`dot-${index}`} x={cx - 5} y={cy - 5} width={10} height={10} viewBox="0 0 10 10">
                                <circle cx="5" cy="5" r="5" fill="white" />
                              </svg>
                            );
                          }
                          return <span key={`dot-${index}`} />;
                        }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                  <div className="flex w-full gap-1 md:gap-3 absolute top-[156px] left-0 items-center justify-between pointer-events-none">
                    {months.map((m, i) => (
                      <div key={i} className="relative flex h-6 items-center justify-center gap-1 md:gap-2 px-1 md:px-2 flex-1 min-w-0">
                        {m.active
                          ? <div className="absolute inset-0 bg-[var(--color-primary-orange)] rounded-[25px]" />
                          : <div className={`absolute inset-0 rounded-[25px] ${glass}`} />}
                        <span className="relative text-white text-[10px] md:text-xs [font-family:'Satoshi-Regular',Helvetica] truncate">
                          {isAr ? m.labelAr : m.label}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="absolute top-[16px] bottom-[24px] left-[55.2%] w-px border-l-2 border-dashed border-white/30 pointer-events-none" />
                  <div className="flex w-[80px] h-[34px] items-center justify-center pt-[5px] pb-2.5 px-[11px] absolute top-[-9px] left-[calc(55.2%-40px)] bg-white rounded-full shadow-lg pointer-events-none z-10">
                    <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-white" />
                    <span className="relative [font-family:'Satoshi-Regular',Helvetica] text-[#121212] font-semibold text-[14px]">$4,892</span>
                  </div>
                </div>
                <div className="inline-flex flex-wrap items-center gap-[9px]">
                  <span className="[font-family:'Satoshi-Medium',Helvetica] text-white text-[19px]">$34,742.00</span>
                  <span className="[font-family:'Satoshi-Regular',Helvetica] text-[var(--color-text-secondary)] text-[13px]">
                    {isAr ? "هذا أقل بـ $54.00 من الشهر الماضي" : "This is $54.00 less than last month"}
                  </span>
                </div>
              </div>
            </div>

            {/* NFT Performance + Token Balance row */}
            <div className="flex flex-col lg:flex-row items-stretch gap-5 px-4 md:px-5 self-stretch">

              {/* NFT Performance card */}
              <div className={`flex flex-col flex-1 w-full gap-3 p-4 rounded-3xl ${glass}`}>
                <div className="flex items-center justify-between self-stretch">
                  <span className="[font-family:'Dubai-Medium',Helvetica] text-white text-[17px]">NFT</span>
                  <div className={glassPill}>
                    <span className="[font-family:'Satoshi-Medium',Helvetica] text-white text-[13px]">
                      {isAr ? "شهري" : "Monthly"}
                    </span>
                    <ChevronDown className="w-4 h-4 text-white" />
                  </div>
                </div>
                <div className="flex flex-col gap-[8px] self-stretch">
                  {nftItems.map((item, i) => (
                    <div key={i} className="flex flex-col gap-1 self-stretch">
                      <div className="flex items-center justify-between self-stretch">
                        <div className="flex gap-[5px] items-center">
                          <span className="[font-family:'Satoshi-Regular',Helvetica] text-white text-[13px]">
                            {isAr ? item.labelAr : item.label}
                          </span>
                          <span className="[font-family:'Satoshi-Medium',Helvetica] text-white text-[17px]">{item.value}</span>
                        </div>
                        <span className="[font-family:'Inter',Helvetica] font-semibold text-[var(--color-positive)] text-[15px]">{item.change}</span>
                      </div>
                      <div className="self-stretch w-full h-[42px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={nftItemChartsData[i].data} margin={{ top: 2, right: 0, left: 0, bottom: 0 }}>
                            <defs>
                              <linearGradient id={`nftItemGrad-${i}`} x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#ffffff" stopOpacity={0.3} />
                                <stop offset="100%" stopColor="#ffffff" stopOpacity={0.0} />
                              </linearGradient>
                            </defs>
                            <Area type="monotone" dataKey="v" stroke={nftItemChartsData[i].color} strokeWidth={2} fillOpacity={1} fill={`url(#nftItemGrad-${i})`} dot={false} />
                            <Tooltip content={() => null} />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Token Balance card */}
              <div className={`flex flex-col flex-1 w-full px-4 py-3 rounded-3xl ${glass}`}>
                <span className="[font-family:'Dubai-Medium',Helvetica] text-white text-[17px] leading-none">
                  {isAr ? "رصيد الرموز" : "Token Balance"}
                </span>
                <div className="flex flex-col flex-1 justify-between w-full mt-1">
                  <div className="relative w-full h-[110px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={tokenBalanceData} cx="50%" cy="100%" startAngle={180} endAngle={0} innerRadius="65%" outerRadius="95%" paddingAngle={0} dataKey="value">
                          {tokenBalanceData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                          ))}
                        </Pie>
                        <Tooltip content={() => null} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute bottom-[2px] left-1/2 -translate-x-1/2 flex flex-col items-center">
                      <span className="text-white text-[11px] font-medium font-['Satoshi-Medium'] opacity-80">
                        {isAr ? "الإجمالي" : "Total"}
                      </span>
                      <span className="text-white text-[15px] font-medium font-['Satoshi-Medium']">$15.250</span>
                    </div>
                  </div>
                  <div className="w-full h-px bg-[var(--color-divider)]" />
                  <div className="flex flex-col gap-[6px] self-stretch">
                    {tokenBalanceItems.map((item, i) => (
                      <div key={i} className="inline-flex items-center gap-2 px-[5px]">
                        <div className="inline-flex gap-[5px] items-center">
                          <div className="w-[12px] h-[12px] rounded-[3px]" style={{ backgroundColor: item.hex }} />
                          <span className="[font-family:'Satoshi-Regular',Helvetica] text-white text-[13px] leading-5">
                            {isAr ? item.nameAr : item.name} :
                          </span>
                          <span className="[font-family:'Satoshi-Medium',Helvetica] text-white text-[13px] leading-5">{item.pct}</span>
                        </div>
                        <span className="[font-family:'Satoshi-Bold',Helvetica] font-bold text-white text-[15px] leading-5">{item.val}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

            </div>
            <LiveModeOverlay isAr={isAr} />
          </section>

          {/* ── Transaction History ─────────────────────────────────────────── */}
          <div className={`relative w-full flex-1 ${glass} group`}>
            <div className="flex flex-col gap-[25px] p-5">
              <div className="flex items-center justify-between w-full">
                <span className="[font-family:'Dubai-Medium',Helvetica] text-white text-[17px] leading-normal">
                  {isAr ? "سجل المعاملات" : "Transaction History"}
                </span>
                <div className="inline-flex items-center gap-2.5">
                  <Filter className="w-5 h-5 text-white cursor-pointer" />
                  <div className={glassPill}>
                    <Calendar className="w-4 h-4 text-white" />
                    <span className="[font-family:'Satoshi-Medium',Helvetica] text-white text-sm">
                      {isAr ? "١١ نوف - ١١ ديس، ٢٠٢٦" : "11 Nov - 11 Dec, 2026"}
                    </span>
                    <ChevronDown className="w-4 h-4 text-white" />
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-[15px] w-full">
                {transactionGroups.map((grp, gi) => (
                  <div key={gi} className="flex flex-col gap-2.5 w-full">
                    <span className="[font-family:'Satoshi-Regular',Helvetica] text-white text-[15px] leading-normal">
                      {isAr ? grp.labelAr : grp.label}
                    </span>
                    {grp.txs.map((tx, ti) => (
                      <div key={ti} className="flex items-center gap-5 w-full">
                        <tx.icon className="w-6 h-6 text-[var(--color-primary-orange)] flex-shrink-0" />
                        <div className="flex items-center justify-between pb-2.5 flex-1 border-b border-[var(--color-divider)]">
                          <div className="flex flex-col gap-[3px] w-[169px]">
                            <span className="[font-family:'Satoshi-Regular',Helvetica] text-white text-[15px] leading-normal">
                              {isAr ? tx.nameAr : tx.name}
                            </span>
                            <span className="[font-family:'Satoshi-Regular',Helvetica] text-[var(--color-text-secondary)] text-sm leading-normal">{tx.time}</span>
                          </div>
                          <span className="[font-family:'Satoshi-Regular',Helvetica] text-white text-[15px] p-2.5">{tx.amount}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
            <LiveModeOverlay isAr={isAr} />
          </div>
        </div>

        {/* ── RIGHT COLUMN ──────────────────────────────────────────────────────── */}
        <div className="flex flex-col w-full lg:w-1/2 min-w-0 self-stretch gap-5 mt-5 lg:mt-0">
          <div className={`flex flex-col w-full items-start gap-5 pb-[30px] flex-1 ${glass} group`}>

            {/* Section header */}
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between pl-[18px] md:pl-[25px] pr-4 md:pr-5 pt-5 pb-2.5 self-stretch">
              <h2 className="[font-family:'Dubai-Medium',Helvetica] font-medium text-[20px] md:text-[25px] text-white leading-normal">
                {isAr
                  ? "أداء الأصول الرقمية / أداء الاستثمار"
                  : "Digital Asset Performance / Investment Performance"}
              </h2>
            </div>

            {/* Three metric cards */}
            <div className="flex flex-col md:flex-row items-stretch gap-[15px] px-4 md:px-5 self-stretch">
              {metricCards.map((card, i) => (
                <div key={i} className={`flex flex-col gap-[15px] px-[16px] md:px-[21px] py-[15px] rounded-[15px] items-center flex-1 ${glass}`}>
                  <div className="inline-flex flex-col items-start gap-[13px] w-full">
                    <span className="[font-family:'Dubai-Regular',Helvetica] text-white text-[19px] text-center leading-normal self-stretch">
                      {isAr ? card.titleAr : card.title}
                    </span>
                    <div className="inline-flex flex-col items-center gap-2">
                      <span className="[font-family:'Satoshi-Medium',Helvetica] text-white text-[19px] leading-4 whitespace-nowrap">{card.value}</span>
                      <div className="inline-flex items-center gap-[3px]">
                        <TrendingUp className="w-5 h-5 text-[var(--color-positive)]" />
                        <span className="[font-family:'Inter',Helvetica] text-[#D8D8D8] text-[16px]">
                          {isAr ? card.changeAr : card.change}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className={`${card.w} h-[46px]`}>
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={metricChartData[i].data} margin={{ top: 2, right: 0, left: 0, bottom: 0 }}>
                        <defs>
                          <linearGradient id={`metricGrad-${i}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#ffffff" stopOpacity={0.3} />
                            <stop offset="100%" stopColor="#ffffff" stopOpacity={0.0} />
                          </linearGradient>
                        </defs>
                        <Area type="monotone" dataKey="v" stroke={metricChartData[i].color} strokeWidth={2} fillOpacity={1} fill={`url(#metricGrad-${i})`} dot={false} />
                        <Tooltip content={() => null} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              ))}
            </div>

            {/* Portfolio Application + Token Balance */}
            <div className="flex flex-col lg:flex-row items-stretch gap-5 px-4 md:px-5 self-stretch">

              {/* Portfolio Application card */}
              <div className={`flex flex-col items-center gap-[10px] px-4 py-3 flex-1 w-full rounded-3xl ${glass}`}>
                <div className="flex items-center justify-between self-stretch">
                  <span className="[font-family:'Dubai-Medium',Helvetica] text-white text-[17px] leading-normal">
                    {isAr ? "تطبيق المحفظة" : "Portfolio Application"}
                  </span>
                  <div className={glassPill}>
                    <span className="[font-family:'Satoshi-Medium',Helvetica] text-white text-[13px]">
                      {isAr ? "محقق" : "Realized"}
                    </span>
                    <ChevronDown className="w-4 h-4 text-white" />
                  </div>
                </div>
                <span className="[font-family:'Satoshi-Medium',Helvetica] text-white text-[20px] leading-none self-start">
                  {isAr ? "الإجمالي $150,000" : "Total $150,000"}
                </span>
                <div className="w-[150px] h-[150px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={portfolioAppData} cx="50%" cy="50%" innerRadius="65%" outerRadius="95%" paddingAngle={0} dataKey="value">
                        {portfolioAppData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                        ))}
                      </Pie>
                      <Tooltip content={() => null} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex items-center justify-center gap-[20px] self-stretch">
                  {portfolioLegend.map((item, i) => (
                    <div key={i} className="inline-flex flex-col items-center gap-[3px]">
                      <div className="inline-flex items-center gap-[5px]">
                        <div className="w-[12px] h-[12px] rounded-[3px]" style={{ backgroundColor: item.hex }} />
                        <span className="[font-family:'Poppins',Helvetica] font-medium text-white text-[13px] leading-none">
                          {isAr ? item.labelAr : item.label}
                        </span>
                      </div>
                      <span className="[font-family:'Poppins',Helvetica] font-medium text-white text-[13px] leading-none">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Token Balance card */}
              <div className={`flex flex-col flex-1 w-full px-4 py-3 rounded-3xl ${glass}`}>
                <span className="[font-family:'Dubai-Medium',Helvetica] text-white text-[17px] leading-none">
                  {isAr ? "رصيد الرموز" : "Token Balance"}
                </span>
                <div className="flex flex-col flex-1 justify-between gap-[6px] w-full mt-1">
                  <div className="relative w-full h-[110px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={tokenBalanceData} cx="50%" cy="100%" startAngle={180} endAngle={0} innerRadius="65%" outerRadius="95%" paddingAngle={0} dataKey="value">
                          {tokenBalanceData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                          ))}
                        </Pie>
                        <Tooltip content={() => null} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute bottom-[2px] left-1/2 -translate-x-1/2 flex flex-col items-center">
                      <span className="text-white text-[11px] font-medium font-['Satoshi-Medium'] opacity-80">
                        {isAr ? "الإجمالي" : "Total"}
                      </span>
                      <span className="text-white text-[15px] font-medium font-['Satoshi-Medium']">$15.250</span>
                    </div>
                  </div>
                  <div className="w-full h-px bg-[var(--color-divider)]" />
                  <div className="flex flex-col gap-[6px] self-stretch">
                    {perfTokenItems.map((item, i) => (
                      <div key={i} className="inline-flex items-center gap-2 px-[5px]">
                        <div className="inline-flex gap-[5px] items-center">
                          <div className="w-[12px] h-[12px] rounded-[3px]" style={{ backgroundColor: item.hex }} />
                          <span className="[font-family:'Satoshi-Regular',Helvetica] text-white text-[13px] leading-5">
                            {isAr ? item.nameAr : item.name}
                          </span>
                          <span className="[font-family:'Satoshi-Medium',Helvetica] text-white text-[13px] leading-5">{item.pct}</span>
                        </div>
                        <span className="[font-family:'Satoshi-Bold',Helvetica] font-bold text-white text-[15px] leading-5">{item.val}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

            </div>

            {/* Portfolio Table */}
            <div className={`flex flex-col self-stretch gap-[23px] pt-5 pb-[30px] px-4 md:px-5 mx-4 md:mx-5 ${glass}`}>
              <div className="flex items-center justify-between self-stretch">
                <span className="[font-family:'Dubai-Medium',Helvetica] text-white text-[17px] leading-normal">
                  {isAr ? "تطبيق المحفظة" : "Portfolio Application"}
                </span>
              </div>
              <div className="flex flex-col gap-[5px] self-stretch">
                <div className="flex h-[58px] px-1.5 md:px-2.5 py-1.5 self-stretch bg-[var(--color-table-header)] rounded-[10px] items-center">
                  {(isAr
                    ? ["الأصل", "سعر الشراء", "السعر الحالي", "العائد (%)", "التغير خلال 24 ساعة"]
                    : ["Asset", "Purchase Price", "Current Price", "ROI (%)", "24 Hour Change"]
                  ).map((h, i) => (
                    <div key={i} className="flex items-center justify-center p-[9.55px] flex-1">
                      <span className="[font-family:'Inter',Helvetica] font-medium text-white text-[13px] md:text-[15px] text-center leading-[18px] flex-1">{h}</span>
                    </div>
                  ))}
                </div>
                {portfolioTableRows.map((row, i) => (
                  <div key={i} className="flex items-center self-stretch bg-[var(--color-table-row)] rounded-[10px] px-[9px]">
                    {[isAr ? row.assetAr : row.asset, row.purchase, row.current, row.roi, row.change].map((cell, ci) => (
                      <div key={ci} className="flex items-center justify-center px-[9.55px] py-2.5 flex-1">
                        <span className="[font-family:'Inter',Helvetica] font-medium text-black text-[13px] md:text-[15px] text-center leading-[18px] whitespace-nowrap">{cell}</span>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>

            {/* Estimated Future Plan */}
            <div className="flex flex-col gap-2.5 px-5 self-stretch">
              <div className={`flex flex-col gap-5 p-5 self-stretch rounded-[15px] ${glass}`}>
                <div className="flex items-center justify-between self-stretch">
                  <span className="[font-family:'Dubai-Medium',Helvetica] text-white text-[17px] leading-normal">
                    {isAr ? "الخطة المستقبلية المتوقعة" : "Estimated Future Plant"}
                  </span>
                  <div className="inline-flex items-center gap-2.5">
                    <Filter className="w-5 h-5 text-white cursor-pointer" />
                    <div className={glassPill}>
                      <Calendar className="w-4 h-4 text-white" />
                      <span className="[font-family:'Satoshi-Medium',Helvetica] text-white text-sm">
                        {isAr ? "١١ نوف - ١١ ديس، ٢٠٢٦" : "11 Nov - 11 Dec, 2026"}
                      </span>
                      <ChevronDown className="w-4 h-4 text-white" />
                    </div>
                  </div>
                </div>
                <div className="flex flex-col gap-[15px] self-stretch">
                  <div className="flex flex-col gap-2.5 self-stretch">
                    <span className="[font-family:'Satoshi-Regular',Helvetica] text-white text-[15px] leading-normal">
                      {isAr ? "اليوم" : "Today"}
                    </span>
                    <div className="flex items-center gap-5 self-stretch">
                      <div className="flex items-center justify-between pb-2.5 flex-1 border-b border-[var(--color-divider)]">
                        <div className="flex flex-col gap-[3px] flex-1">
                          <span className="[font-family:'Satoshi-Medium',Helvetica] text-white text-[15px] leading-normal">
                            {isAr ? "أراضي ذا ساندبوكس" : "The Sandbox LAND"}
                          </span>
                          <span className="[font-family:'Satoshi-Regular',Helvetica] text-[var(--color-text-secondary)] text-[15px] leading-normal">
                            {isAr
                              ? "زيادة محتملة بنسبة 15% في القيمة من Alpha Season 4 (الربع الرابع 2025)."
                              : "Potential 15% value increase from Alpha Season 4 (Q4 2025)."}
                          </span>
                        </div>
                        <span className="[font-family:'Satoshi-Regular',Helvetica] text-[var(--color-text-muted)] text-sm p-2.5">11 : 23</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2.5 self-stretch">
                    <span className="[font-family:'Satoshi-Regular',Helvetica] text-white text-[15px] leading-normal">
                      {isAr ? "أمس" : "Yesterday"}
                    </span>
                    <div className="flex flex-col gap-2.5 self-stretch">
                      <div className="flex items-center justify-between pb-2.5 flex-1 border-b border-[var(--color-divider)]">
                        <div className="flex flex-col gap-[3px] flex-1">
                          <span className="[font-family:'Satoshi-Medium',Helvetica] text-white text-[15px] leading-normal">
                            {isAr ? "أكسي إنفينيتي" : "Axie Infinity"}
                          </span>
                          <span className="[font-family:'Satoshi-Regular',Helvetica] text-[var(--color-text-secondary)] text-[15px] leading-normal">
                            {isAr
                              ? "إسقاط جوي متوقع بـ 50 AXS لكل Axie للمالكين (الربع الثالث 2025)."
                              : "Estimated airdrop of 50 AXS per Axie for holders (Q3 2025)."}
                          </span>
                        </div>
                        <span className="[font-family:'Satoshi-Regular',Helvetica] text-[var(--color-text-muted)] text-sm p-2.5">11 : 23</span>
                      </div>
                      <div className="flex items-center justify-between pb-2.5 flex-1 border-b border-[var(--color-divider)]">
                        <div className="flex flex-col gap-[3px] flex-1">
                          <span className="[font-family:'Satoshi-Medium',Helvetica] text-white text-[15px] leading-normal">
                            {isAr ? "كريبتو بانكس" : "CryptoPunks"}
                          </span>
                          <span className="[font-family:'Satoshi-Regular',Helvetica] text-[var(--color-text-secondary)] text-[15px] leading-normal">
                            {isAr
                              ? "دمج الميتافيرس وزيادة محتملة بنسبة 20% في القيمة (الربع الأول 2026)."
                              : "Metaverse integration and potential 20% value increase (Q1 2026)."}
                          </span>
                        </div>
                        <span className="[font-family:'Satoshi-Regular',Helvetica] text-[var(--color-text-muted)] text-sm p-2.5">11 : 23</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <LiveModeOverlay isAr={isAr} />

          </div>
        </div>
      </div>

      <FooterSection />
    </div>
  );
}
