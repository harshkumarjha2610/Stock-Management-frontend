"use client";

import { useState, useMemo } from "react";
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import {
  TrendingUp, Package, Users, BadgeIndianRupee,
  CalendarDays, ShoppingBag, ChevronDown,
} from "lucide-react";

// ─── Palette ────────────────────────────────────────────────────────────────────
const C = {
  blue:       "#2563eb",
  blueLight:  "#93c5fd",
  green:      "#16a34a",
  greenLight: "#86efac",
  purple:     "#7c3aed",
  amber:      "#d97706",
  red:        "#dc2626",
  teal:       "#0891b2",
  slate:      "#94a3b8",
  grid:       "#f1f5f9",
};

// ─── Mock Data ──────────────────────────────────────────────────────────────────

// Daily Sales (last 14 days)
const dailySalesData = [
  { day: "Apr 02", sales: 4200,  profit: 1050 },
  { day: "Apr 03", sales: 6800,  profit: 1700 },
  { day: "Apr 04", sales: 3100,  profit: 775  },
  { day: "Apr 05", sales: 0,     profit: 0    },
  { day: "Apr 06", sales: 0,     profit: 0    },
  { day: "Apr 07", sales: 7200,  profit: 1800 },
  { day: "Apr 08", sales: 5400,  profit: 1350 },
  { day: "Apr 09", sales: 9100,  profit: 2275 },
  { day: "Apr 10", sales: 6300,  profit: 1575 },
  { day: "Apr 11", sales: 8700,  profit: 2175 },
  { day: "Apr 12", sales: 10761, profit: 2690 },
  { day: "Apr 13", sales: 10963, profit: 2740 },
  { day: "Apr 14", sales: 7142,  profit: 1785 },
  { day: "Apr 15", sales: 7529,  profit: 1882 },
];

// Monthly Sales (last 6 months)
const monthlySalesData = [
  { month: "Nov 25", sales: 82400,  profit: 20600 },
  { month: "Dec 25", sales: 118900, profit: 29725 },
  { month: "Jan 26", sales: 74200,  profit: 18550 },
  { month: "Feb 26", sales: 91300,  profit: 22825 },
  { month: "Mar 26", sales: 136200, profit: 34050 },
  { month: "Apr 26", sales: 46395,  profit: 11598 },
];

// Stock Overview — top 8 products
const stockData = [
  { name: "Wireless Keyboard",  stock: 45, reorderAt: 10 },
  { name: "USB-C Hub",          stock: 8,  reorderAt: 10 },
  { name: "Monitor Stand",      stock: 22, reorderAt: 8  },
  { name: "Mechanical Mouse",   stock: 0,  reorderAt: 10 },
  { name: "Laptop Sleeve",      stock: 60, reorderAt: 15 },
  { name: "HDMI Cable 2m",      stock: 5,  reorderAt: 10 },
  { name: "Webcam 1080p",       stock: 18, reorderAt: 5  },
  { name: "Desk Organizer",     stock: 30, reorderAt: 8  },
];

// Staff Attendance (this week)
const attendanceData = [
  { day: "Mon",  present: 4, absent: 1 },
  { day: "Tue",  present: 5, absent: 0 },
  { day: "Wed",  present: 3, absent: 2 },
  { day: "Thu",  present: 5, absent: 0 },
  { day: "Fri",  present: 4, absent: 1 },
  { day: "Sat",  present: 2, absent: 3 },
  { day: "Sun",  present: 0, absent: 5 },
];

// Monthly GST (last 6 months)
const gstData = [
  { month: "Nov 25", collected: 9888,  paid: 8200  },
  { month: "Dec 25", collected: 14268, paid: 11000 },
  { month: "Jan 26", collected: 8904,  paid: 7100  },
  { month: "Feb 26", collected: 10956, paid: 9200  },
  { month: "Mar 26", collected: 16344, paid: 13500 },
  { month: "Apr 26", collected: 5567,  paid: 0     },
];

// Summary Stats
const stats = [
  { label: "Today's Revenue",  value: "₹7,529",  sub: "+8.2% vs yesterday", icon: BadgeIndianRupee, color: "text-blue-600",   bg: "bg-blue-50"   },
  { label: "Today's Profit",   value: "₹1,882",  sub: "Margin 25%",         icon: TrendingUp,       color: "text-green-600",  bg: "bg-green-50"  },
  { label: "Stock Items",      value: "188",     sub: "3 items low / OOS",  icon: Package,          color: "text-purple-600", bg: "bg-purple-50" },
  { label: "Staff Present",    value: "4/5",     sub: "1 absent today",     icon: Users,            color: "text-amber-600",  bg: "bg-amber-50"  },
];

// ─── Custom Tooltip ─────────────────────────────────────────────────────────────
function ChartTooltip({
  active, payload, label, prefix = "₹",
}: {
  active?: boolean;
  payload?: { name: string; value: number; color: string }[];
  label?: string;
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

function StockTooltip({ active, payload, label }: { active?: boolean; payload?: { name: string; value: number; color: string }[]; label?: string }) {
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
  const [salesView, setSalesView] = useState<"daily" | "monthly">("daily");

  const salesChartData = useMemo(() => {
    if (salesView === "daily") {
      return dailySalesData;
    }
    return monthlySalesData.map((item) => ({
      day: item.month,
      sales: item.sales,
      profit: item.profit,
    }));
  }, [salesView]);
  
  const salesXKey = "day";

  // Stock bar colors — red if 0, amber if <= reorderAt, green otherwise
  const stockBarColors = stockData.map((item) =>
    item.stock === 0
      ? C.red
      : item.stock <= item.reorderAt
      ? C.amber
      : C.green
  );

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
              className="h-8 pl-3 pr-8 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-600 outline-none focus:border-blue-400 appearance-none cursor-pointer"
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
                <stop offset="5%"  stopColor={C.blue}  stopOpacity={0.15} />
                <stop offset="95%" stopColor={C.blue}  stopOpacity={0}    />
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
              stroke={C.blue}
              strokeWidth={2.5}
              fill="url(#gradSales)"
              dot={false}
              activeDot={{ r: 5, fill: C.blue }}
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
                fill={C.blueLight}
                radius={[5, 5, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>

          {/* Profit Metrics */}
          <div className="grid grid-cols-3 gap-3 pt-1 border-t border-slate-100">
            {[
              { label: "This Month",  value: "₹11,598" },
              { label: "Last Month",  value: "₹34,050" },
              { label: "Avg Margin",  value: "25%"     },
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
                content={({ active, payload, label }: { active?: boolean; payload?: { name: string; value: number; color: string }[]; label?: string }) => {
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
              { label: "Avg Present",  value: `${(attendanceData.reduce((s, d) => s + d.present, 0) / attendanceData.length).toFixed(1)}`, color: "text-teal-600" },
              { label: "Best Day",     value: "Tue / Thu", color: "text-green-600" },
              { label: "Total Absent", value: attendanceData.reduce((s, d) => s + d.absent, 0), color: "text-red-500" },
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
            <LineChart data={gstData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
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
              { label: "Apr Collected", value: "₹5,567",  color: "text-purple-600" },
              { label: "Apr Paid",      value: "Pending",  color: "text-amber-500"  },
              { label: "YTD Collected", value: "₹65,927", color: "text-slate-700"  },
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