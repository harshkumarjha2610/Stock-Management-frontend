"use client";

import { useState, useMemo, useEffect } from "react";
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import {
  TrendingUp, Package, Users, BadgeIndianRupee,
  CalendarDays, ShoppingBag, ChevronDown, Loader2,
} from "lucide-react";
import { api } from "@/lib/api";

// ─── Palette ────────────────────────────────────────────────────────────────────
const C = {
  red:        "#dc2626",
  redLight:   "#fecaca",
  green:      "#16a34a",
  greenLight: "#86efac",
  purple:     "#7c3aed",
  amber:      "#d97706",
  red1:        "#dc2626",
  teal:       "#0891b2",
  slate:      "#94a3b8",
  grid:       "#f1f5f9",
};

// ─── Custom Tooltip ─────────────────────────────────────────────────────────────
function ChartTooltip({
  active, payload, label, prefix = "₹",
}: {
  active?: boolean;
  payload?: readonly any[];
  label?: any;
  prefix?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-lg px-4 py-3 text-sm">
      <p className="font-semibold text-slate-700 mb-2">{label}</p>
      {payload.map((p) => (
        <div key={p.name} className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full" style={{ background: p.color }} />
          <span className="text-slate-500 capitalize">{p.name}:</span>
          <span className="font-bold text-slate-800">
            {prefix !== ""
              ? `₹${p.value.toLocaleString("en-IN")}`
              : p.value.toLocaleString("en-IN")}
          </span>
        </div>
      ))}
    </div>
  );
}

function StockTooltip({ active, payload, label }: { active?: boolean; payload?: readonly any[]; label?: any }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-lg px-4 py-3 text-sm">
      <p className="font-semibold text-slate-700 mb-2">{label}</p>
      {payload.map((p) => (
        <div key={p.name} className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full" style={{ background: p.color }} />
          <span className="text-slate-500 capitalize">{p.name}:</span>
          <span className="font-bold text-slate-800">{p.value} units</span>
        </div>
      ))}
    </div>
  );
}

// ─── Shared axis tick style ──────────────────────────────────────────────────────
const tickStyle = { fontSize: 11, fill: "#94a3b8" };

// ─── Card Wrapper ───────────────────────────────────────────────────────────────
function ChartCard({
  title, subtitle, children, action,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 flex flex-col gap-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-sm font-bold text-slate-900">{title}</h2>
          {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
        </div>
        {action}
      </div>
      {children}
    </div>
  );
}

// ─── Page ───────────────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [salesView, setSalesView] = useState<"daily" | "monthly">("daily");
  
  const [summary, setSummary] = useState<any>({
    today_sales: 0,
    today_profit: 0,
    total_products: 0,
    low_stock_count: 0,
    staff_present: 0,
    staff_total: 0,
    this_month_sales: 0,
    last_month_sales: 0,
    avg_margin: 0
  });

  const [dailySalesData, setDailySalesData] = useState<any[]>([]);
  const [monthlySalesData, setMonthlySalesData] = useState<any[]>([]);
  const [stockData, setStockData] = useState<any[]>([]);
  const [attendanceData, setAttendanceData] = useState<any[]>([]);
  const [gstSummary, setGstSummary] = useState<any>({ history: [], ytd_collected: 0 });

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        setLoading(true);
        const [
          statsRes, 
          dailyRes, 
          monthlyRes, 
          stockRes, 
          attendanceRes, 
          gstRes
        ] = await Promise.all([
          api.get('/reports/dashboard'),
          api.get('/reports/daily-sales'),
          api.get('/reports/monthly-sales'),
          api.get('/reports/stock-overview'),
          api.get('/reports/attendance-stats'),
          api.get('/reports/gst-summary')
        ]);

        setSummary(statsRes.data);
        setDailySalesData(dailyRes.data);
        setMonthlySalesData(monthlyRes.data);
        setStockData(stockRes.data);
        setAttendanceData(attendanceRes.data);
        setGstSummary(gstRes.data);
      } catch (error) {
        console.error("Failed to fetch dashboard data", error);
      } finally {
        setLoading(false);
      }
    }
    fetchDashboardData();
  }, []);

  const stats = [
    { label: "Today's Revenue",  value: `₹${summary.today_sales.toLocaleString()}`,  sub: "Updated live", icon: BadgeIndianRupee, color: "text-red-600",   bg: "bg-red-50"   },
    { label: "Today's Profit",   value: `₹${summary.today_profit.toLocaleString()}`,  sub: "Gross margin",         icon: TrendingUp,       color: "text-green-600",  bg: "bg-green-50"  },
    { label: "Stock Items",      value: summary.total_products.toString(),     sub: `${summary.low_stock_count} low / OOS`,  icon: Package,          color: "text-purple-600", bg: "bg-purple-50" },
    { label: "Staff Present",    value: `${summary.staff_present}/${summary.staff_total}`,     sub: "Active staff",     icon: Users,            color: "text-amber-600",  bg: "bg-amber-50"  },
  ];

  const salesChartData = useMemo(() => {
    if (salesView === "daily") {
      return dailySalesData;
    }
    return monthlySalesData.map((item) => ({
      day: item.month,
      sales: item.sales,
      profit: item.profit,
    }));
  }, [salesView, dailySalesData, monthlySalesData]);
  
  const salesXKey = "day";

  // Stock bar colors — red if 0, amber if <= reorderAt, green otherwise
  const stockBarColors = stockData.map((item) =>
    item.stock === 0
      ? C.red
      : item.stock <= item.reorderAt
      ? C.amber
      : C.green
  );

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-red-600" />
          <p className="text-sm font-medium text-slate-500">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* ── Page Header ── */}
      <div>
        <h1 className="text-xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-sm text-slate-500 mt-0.5">Overview of your business at a glance</p>
      </div>

      {/* ── Summary Stats ── */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="bg-white rounded-xl border border-slate-200 p-5">
            <div className={`inline-flex items-center justify-center w-9 h-9 rounded-lg ${s.bg} mb-3`}>
              <s.icon className={`w-4 h-4 ${s.color}`} />
            </div>
            <p className="text-2xl font-bold text-slate-900">{s.value}</p>
            <p className="text-xs font-semibold text-slate-700 mt-0.5">{s.label}</p>
            <p className="text-xs text-slate-400 mt-0.5">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* ══════════════════════════════════════════════
          ROW 1: Sales Graph (full width)
      ══════════════════════════════════════════════ */}
      <ChartCard
        title="Sales Overview"
        subtitle={salesView === "daily" ? "Last 14 days" : "Last 6 months"}
        action={
          <div className="relative">
            <select
              value={salesView}
              onChange={(e) => setSalesView(e.target.value as "daily" | "monthly")}
              className="h-8 pl-3 pr-8 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-600 outline-none focus:border-red-400 appearance-none cursor-pointer"
            >
              <option value="daily">Daily</option>
              <option value="monthly">Monthly</option>
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
          </div>
        }
      >
        <ResponsiveContainer width="100%" height={260}>
          <AreaChart data={salesChartData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="gradSales" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor={C.red}  stopOpacity={0.15} />
                <stop offset="95%" stopColor={C.red}  stopOpacity={0}    />
              </linearGradient>
              <linearGradient id="gradProfit" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor={C.green} stopOpacity={0.12} />
                <stop offset="95%" stopColor={C.green} stopOpacity={0}    />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={C.grid} vertical={false} />
            <XAxis dataKey="day" tick={tickStyle} axisLine={false} tickLine={false} />
            <YAxis
              tick={tickStyle}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => v >= 1000 ? `₹${(v / 1000).toFixed(0)}k` : `₹${v}`}
              width={48}
            />
            <Tooltip content={<ChartTooltip />} />
            <Legend
              wrapperStyle={{ fontSize: "12px", paddingTop: "12px" }}
              formatter={(v: string) => <span className="text-slate-600 capitalize">{v}</span>}
            />
            <Area
              type="monotone"
              dataKey="sales"
              name="Sales"
              stroke={C.red}
              strokeWidth={2.5}
              fill="url(#gradSales)"
              dot={false}
              activeDot={{ r: 5, fill: C.red }}
            />
            <Area
              type="monotone"
              dataKey="profit"
              name="Profit"
              stroke={C.green}
              strokeWidth={2.5}
              fill="url(#gradProfit)"
              dot={false}
              activeDot={{ r: 5, fill: C.green }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* ══════════════════════════════════════════════
          ROW 2: Profit Graph + Stock Overview
      ══════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

        {/* Profit Bar Chart */}
        <ChartCard title="Profit Breakdown" subtitle="Monthly profit — last 6 months">
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={monthlySalesData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }} barSize={28}>
              <CartesianGrid strokeDasharray="3 3" stroke={C.grid} vertical={false} />
              <XAxis dataKey="month" tick={tickStyle} axisLine={false} tickLine={false} />
              <YAxis
                tick={tickStyle}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`}
                width={44}
              />
              <Tooltip content={<ChartTooltip />} cursor={{ fill: "#f8fafc" }} />
              <Bar
                dataKey="profit"
                name="Profit"
                fill={C.green}
                radius={[5, 5, 0, 0]}
              />
              <Bar
                dataKey="sales"
                name="Sales"
                fill={C.redLight}
                radius={[5, 5, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>

          {/* Profit Metrics */}
          <div className="grid grid-cols-3 gap-3 pt-1 border-t border-slate-100">
            {[
              { label: "This Month",  value: `₹${(summary.this_month_sales || 0).toLocaleString("en-IN")}` },
              { label: "Last Month",  value: `₹${(summary.last_month_sales || 0).toLocaleString("en-IN")}` },
              { label: "Avg Margin",  value: `${summary.avg_margin || 0}%` },
            ].map((m) => (
              <div key={m.label} className="text-center">
                <p className="text-xs text-slate-400">{m.label}</p>
                <p className="text-sm font-bold text-slate-800 mt-0.5">{m.value}</p>
              </div>
            ))}
          </div>
        </ChartCard>

        {/* Stock Overview */}
        <ChartCard
          title="Stock Overview"
          subtitle="Current units per product"
          action={
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-green-500 inline-block" /> OK</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-amber-500 inline-block" /> Low</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-red-500 inline-block"   /> OOS</span>
            </div>
          }
        >
          <ResponsiveContainer width="100%" height={240}>
            <BarChart
              data={stockData}
              layout="vertical"
              margin={{ top: 0, right: 10, left: 0, bottom: 0 }}
              barSize={14}
            >
              <CartesianGrid strokeDasharray="3 3" stroke={C.grid} horizontal={false} />
              <XAxis type="number" tick={tickStyle} axisLine={false} tickLine={false} />
              <YAxis
                type="category"
                dataKey="name"
                tick={tickStyle}
                axisLine={false}
                tickLine={false}
                width={110}
                tickFormatter={(v: string) => v.length > 14 ? v.slice(0, 13) + "…" : v}
              />
              <Tooltip content={<StockTooltip />} cursor={{ fill: "#f8fafc" }} />
              <Bar dataKey="stock" name="Stock" radius={[0, 4, 4, 0]}>
                {stockData.map((_, i) => (
                  <Cell key={i} fill={stockBarColors[i]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>

          {/* Stock Alerts */}
          <div className="grid grid-cols-3 gap-3 pt-1 border-t border-slate-100">
            {[
              { label: "In Stock",  value: stockData.filter((s) => s.stock > s.reorderAt).length, color: "text-green-600" },
              { label: "Low Stock", value: stockData.filter((s) => s.stock > 0 && s.stock <= s.reorderAt).length, color: "text-amber-600" },
              { label: "Out of Stock", value: stockData.filter((s) => s.stock === 0).length, color: "text-red-600" },
            ].map((m) => (
              <div key={m.label} className="text-center">
                <p className={`text-lg font-bold ${m.color}`}>{m.value}</p>
                <p className="text-xs text-slate-400">{m.label}</p>
              </div>
            ))}
          </div>
        </ChartCard>
      </div>

      {/* ══════════════════════════════════════════════
          ROW 3: Staff Attendance + GST Summary
      ══════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

        {/* Staff Attendance */}
        <ChartCard
          title="Staff Attendance"
          subtitle="This week — present vs absent"
        >
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={attendanceData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }} barSize={20} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke={C.grid} vertical={false} />
              <XAxis dataKey="day" tick={tickStyle} axisLine={false} tickLine={false} />
              <YAxis
                tick={tickStyle}
                axisLine={false}
                tickLine={false}
                allowDecimals={false}
                width={24}
              />
              <Tooltip
                content={({ active, payload, label }: any) => {
                  if (!active || !payload?.length) return null;
                  return (
                    <div className="bg-white border border-slate-200 rounded-xl shadow-lg px-4 py-3 text-sm">
                      <p className="font-semibold text-slate-700 mb-2">{label}</p>
                      {payload.map((p: { name: string; value: number; color: string }) => (
                        <div key={p.name} className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full" style={{ background: p.color }} />
                          <span className="text-slate-500 capitalize">{p.name}:</span>
                          <span className="font-bold text-slate-800">{p.value} staff</span>
                        </div>
                      ))}
                    </div>
                  );
                }}
                cursor={{ fill: "#f8fafc" }}
              />
              <Legend
                wrapperStyle={{ fontSize: "12px", paddingTop: "12px" }}
                formatter={(v: string) => <span className="text-slate-600 capitalize">{v}</span>}
              />
              <Bar dataKey="present" name="Present" fill={C.teal}  radius={[4, 4, 0, 0]} />
              <Bar dataKey="absent"  name="Absent"  fill={C.red}   radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>

          {/* Attendance Metrics */}
          <div className="grid grid-cols-3 gap-3 pt-1 border-t border-slate-100">
            {[
              { label: "Avg Present",  value: `${(attendanceData.reduce((s, d) => s + d.present, 0) / (attendanceData.length || 1)).toFixed(1)}`, color: "text-teal-600" },
              { label: "Total Absent", value: attendanceData.reduce((s, d) => s + d.absent, 0), color: "text-red-500" },
              { label: "Weekly Capacity", value: `${Math.round((attendanceData.reduce((s, d) => s + d.present, 0) / (attendanceData.length * summary.staff_total || 1)) * 100)}%`, color: "text-green-600" },
            ].map((m) => (
              <div key={m.label} className="text-center">
                <p className={`text-sm font-bold ${m.color}`}>{m.value}</p>
                <p className="text-xs text-slate-400 mt-0.5">{m.label}</p>
              </div>
            ))}
          </div>
        </ChartCard>

        {/* Monthly GST Summary */}
        <ChartCard
          title="Monthly GST Summary"
          subtitle="GST collected vs paid — last 6 months"
        >
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={gstSummary.history} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="gradGSTCollected" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor={C.purple} stopOpacity={0.1} />
                  <stop offset="95%" stopColor={C.purple} stopOpacity={0}   />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={C.grid} vertical={false} />
              <XAxis dataKey="month" tick={tickStyle} axisLine={false} tickLine={false} />
              <YAxis
                tick={tickStyle}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`}
                width={44}
              />
              <Tooltip content={<ChartTooltip />} />
              <Legend
                wrapperStyle={{ fontSize: "12px", paddingTop: "12px" }}
                formatter={(v: string) => <span className="text-slate-600 capitalize">{v}</span>}
              />
              <Line
                type="monotone"
                dataKey="collected"
                name="Collected"
                stroke={C.purple}
                strokeWidth={2.5}
                dot={{ r: 4, fill: C.purple, strokeWidth: 0 }}
                activeDot={{ r: 6, fill: C.purple }}
              />
              <Line
                type="monotone"
                dataKey="paid"
                name="Paid"
                stroke={C.amber}
                strokeWidth={2.5}
                strokeDasharray="5 4"
                dot={{ r: 4, fill: C.amber, strokeWidth: 0 }}
                activeDot={{ r: 6, fill: C.amber }}
              />
            </LineChart>
          </ResponsiveContainer>

          {/* GST Metrics */}
          <div className="grid grid-cols-3 gap-3 pt-1 border-t border-slate-100">
            {[
              { label: "Latest Collected", value: gstSummary.history.length > 0 ? `₹${gstSummary.history[0].collected.toLocaleString("en-IN")}` : "₹0",  color: "text-purple-600" },
              { label: "Latest Paid (Est)", value: gstSummary.history.length > 0 ? `₹${gstSummary.history[0].paid.toLocaleString("en-IN")}` : "₹0",  color: "text-amber-500"  },
              { label: "YTD Collected", value: `₹${(gstSummary.ytd_collected || 0).toLocaleString("en-IN")}`, color: "text-slate-700"  },
            ].map((m) => (
              <div key={m.label} className="text-center">
                <p className={`text-sm font-bold ${m.color}`}>{m.value}</p>
                <p className="text-xs text-slate-400 mt-0.5">{m.label}</p>
              </div>
            ))}
          </div>
        </ChartCard>
      </div>

    </div>
  );
}