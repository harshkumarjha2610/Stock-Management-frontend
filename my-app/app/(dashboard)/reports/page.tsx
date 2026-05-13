"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell,
} from "recharts";
import {
  TrendingUp, TrendingDown, IndianRupee, Receipt, Users,
  UserCheck, BadgeDollarSign, Package, ChevronDown, Download,
  Printer, Calendar, Search, X, FileText, BarChart3,
  ArrowUpRight, ArrowDownRight, Percent, Loader2,
} from "lucide-react";
import { api } from "@/lib/api";

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════

type ReportType =
  | "daily-sales"
  | "monthly-sales"
  | "profit"
  | "gst"
  | "customer-purchase"
  | "staff-attendance"
  | "salary-paid"
  | "stock-history";

// Reports use live data from backend API endpoints

// ═══════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════

function fmt(n: number) {
  return "₹" + n.toLocaleString("en-IN");
}

function fmtK(n: number) {
  if (n >= 100000) return "₹" + (n / 100000).toFixed(1) + "L";
  if (n >= 1000)   return "₹" + (n / 1000).toFixed(1) + "K";
  return "₹" + n;
}

const CHART_COLORS = {
  red:    "#ef4444",
  green:  "#22c55e",
  blue:   "#3b82f6",
  amber:  "#f59e0b",
  purple: "#8b5cf6",
  teal:   "#14b8a6",
  indigo: "#6366f1",
  slate:  "#94a3b8",
};

const inputCls =
  "h-9 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-red-400 focus:ring-2 focus:ring-red-500/20 transition-colors";

// ═══════════════════════════════════════════════════════════════
// REPORT MENU CONFIG
// ═══════════════════════════════════════════════════════════════

const REPORTS: { key: ReportType; label: string; icon: React.ElementType; color: string; bg: string }[] = [
  { key: "daily-sales",       label: "Day-wise Sales",        icon: TrendingUp,       color: "text-red-600",   bg: "bg-red-50"   },
  { key: "monthly-sales",     label: "Monthly Sales",         icon: BarChart3,        color: "text-indigo-600", bg: "bg-indigo-50" },
  { key: "profit",            label: "Profit Report",         icon: IndianRupee,      color: "text-green-600",  bg: "bg-green-50"  },
  { key: "gst",               label: "GST Monthly",           icon: Receipt,          color: "text-amber-600",  bg: "bg-amber-50"  },
  { key: "customer-purchase", label: "Customer Purchase",     icon: Users,            color: "text-purple-600", bg: "bg-purple-50" },
  { key: "staff-attendance",  label: "Staff Attendance",      icon: UserCheck,        color: "text-teal-600",   bg: "bg-teal-50"   },
  { key: "salary-paid",       label: "Salary Paid",           icon: BadgeDollarSign,  color: "text-rose-600",   bg: "bg-rose-50"   },
  { key: "stock-history",     label: "Stock History",         icon: Package,          color: "text-orange-600", bg: "bg-orange-50" },
];

// ═══════════════════════════════════════════════════════════════
// SHARED COMPONENTS
// ═══════════════════════════════════════════════════════════════

function KpiCard({ label, value, sub, delta, icon: Icon, bg, ic }: {
  label: string; value: string; sub?: string; delta?: number;
  icon: React.ElementType; bg: string; ic: string;
}) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5">
      <div className={`inline-flex items-center justify-center w-9 h-9 rounded-lg ${bg} mb-3`}>
        <Icon className={`w-4 h-4 ${ic}`} />
      </div>
      <p className="text-2xl font-bold text-slate-900 tabular-nums">{value}</p>
      <p className="text-xs font-semibold text-slate-700 mt-0.5">{label}</p>
      {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
      {delta !== undefined && (
        <div className={`flex items-center gap-1 mt-1.5 text-xs font-semibold ${delta >= 0 ? "text-green-600" : "text-red-500"}`}>
          {delta >= 0 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
          {Math.abs(delta)}% vs last period
        </div>
      )}
    </div>
  );
}

function SectionHeader({ title, sub }: { title: string; sub?: string }) {
  return (
    <div className="flex items-center gap-3 mb-5">
      <div className="flex-1">
        <h3 className="text-sm font-bold text-slate-900">{title}</h3>
        {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

function ChartCard({ title, children, sub }: { title: string; children: React.ReactNode; sub?: string }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5">
      <p className="text-sm font-bold text-slate-800 mb-1">{title}</p>
      {sub && <p className="text-xs text-slate-400 mb-4">{sub}</p>}
      {children}
    </div>
  );
}

const customTooltipStyle = {
  backgroundColor: "#fff",
  border: "1px solid #e2e8f0",
  borderRadius: 10,
  fontSize: 12,
  boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
};

// ═══════════════════════════════════════════════════════════════
// INDIVIDUAL REPORT COMPONENTS
// ═══════════════════════════════════════════════════════════════

// ── 1. Daily Sales ──────────────────────────────────────────────
function DailySalesReport({ data }: { data: any[] }) {
  const totalSales   = data.reduce((t: number, d: any) => t + d.sales, 0);
  const totalOrders  = data.reduce((t: number, d: any) => t + d.orders, 0);
  const totalReturns = data.reduce((t: number, d: any) => t + d.returns, 0);
  const avgOrder     = totalOrders > 0 ? Math.round(totalSales / totalOrders) : 0;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <KpiCard label="Total Sales"    value={fmtK(totalSales)}   sub="Selected period"  icon={TrendingUp}  bg="bg-red-50"   ic="text-red-600"  />
        <KpiCard label="Total Orders"   value={String(totalOrders)} sub="Transactions"    icon={Receipt}     bg="bg-green-50"  ic="text-green-600" />
        <KpiCard label="Avg Order Value" value={fmt(avgOrder)}      sub="Per transaction" icon={IndianRupee} bg="bg-purple-50" ic="text-purple-600"/>
        <KpiCard label="Returns"        value={fmtK(totalReturns)} sub="Refunded amount" icon={TrendingDown} bg="bg-red-50"   ic="text-red-500"   />
      </div>

      <ChartCard title="Daily Sales Trend">
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#94a3b8" }} tickLine={false} axisLine={false} />
            <YAxis tickFormatter={fmtK} tick={{ fontSize: 11, fill: "#94a3b8" }} tickLine={false} axisLine={false} />
            <Tooltip
              formatter={(v: any) => typeof v === "number" ? fmt(v) : v}
              contentStyle={customTooltipStyle}
              cursor={{ fill: "#f8fafc" }}
              labelFormatter={(label) => label}
            />
            <Legend />
            <Bar dataKey="sales"   name="Sales"   fill={CHART_COLORS.red}  radius={[4, 4, 0, 0]} />
            <Bar dataKey="returns" name="Returns" fill={CHART_COLORS.amber}   radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-100 bg-slate-50">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Day-wise Breakdown</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100">
                {["Date", "Orders", "Gross Sales", "Returns", "Net Sales"].map((h) => (
                  <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((d, i) => (
                <tr key={i} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-3 font-medium text-slate-700 whitespace-nowrap">{d.date}</td>
                  <td className="px-5 py-3 text-slate-600 tabular-nums">{d.orders}</td>
                  <td className="px-5 py-3 font-semibold text-slate-900 tabular-nums">{fmt(d.sales)}</td>
                  <td className="px-5 py-3 text-red-500 tabular-nums">{fmt(d.returns)}</td>
                  <td className="px-5 py-3 font-bold text-green-700 tabular-nums">{fmt(d.sales - d.returns)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ── 2. Monthly Sales ────────────────────────────────────────────
function MonthlySalesReport({ data }: { data: any[] }) {
  const totalSales = data.reduce((t: number, m: any) => t + m.sales, 0);
  const totalOrders = data.reduce((t: number, m: any) => t + m.orders, 0);
  const totalCustomers = data.reduce((t: number, m: any) => t + m.customers, 0);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <KpiCard label="Total Revenue" value={fmtK(totalSales)}    sub="Selected Period" icon={TrendingUp}  bg="bg-red-50"   ic="text-red-600"  />
        <KpiCard label="Total Orders"  value={String(totalOrders)} sub="Transactions"    icon={Receipt}     bg="bg-green-50"  ic="text-green-600" />
        <KpiCard label="Customers"     value={String(totalCustomers)} sub="Unique"      icon={Users}       bg="bg-purple-50" ic="text-purple-600"/>
        <KpiCard label="Growth"        value="+12%"                sub="vs last month"   icon={BarChart3}   bg="bg-amber-50"  ic="text-amber-600" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        <ChartCard title="Monthly Revenue">
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#94a3b8" }} tickLine={false} axisLine={false} />
              <YAxis tickFormatter={fmtK} tick={{ fontSize: 11, fill: "#94a3b8" }} tickLine={false} axisLine={false} />
              <Tooltip formatter={(v: any) => typeof v === "number" ? [fmt(v), "Revenue"] : v} contentStyle={customTooltipStyle} cursor={{ fill: "#f8fafc" }} />
              <Bar dataKey="sales" fill={CHART_COLORS.red} radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Orders vs Customers">
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#94a3b8" }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={customTooltipStyle} />
              <Legend />
              <Line type="monotone" dataKey="orders"    stroke={CHART_COLORS.red}   strokeWidth={2.5} dot={{ r: 4 }} name="Orders"    />
              <Line type="monotone" dataKey="customers" stroke={CHART_COLORS.purple} strokeWidth={2.5} dot={{ r: 4 }} name="Customers" />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  );
}

// ── 3. Profit Report ────────────────────────────────────────────
function ProfitReport({ data }: { data: any[] }) {
  const totalRevenue = data.reduce((t: number, d: any) => t + d.revenue, 0);
  const totalCost    = data.reduce((t: number, d: any) => t + d.cost, 0);
  const totalProfit  = data.reduce((t: number, d: any) => t + d.profit, 0);
  const avgMargin    = totalRevenue > 0 ? (totalProfit / totalRevenue * 100).toFixed(1) : 0;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <KpiCard label="Total Revenue" value={fmtK(totalRevenue)} icon={TrendingUp}   bg="bg-red-50"   ic="text-red-600"  />
        <KpiCard label="Total Cost"    value={fmtK(totalCost)}    icon={TrendingDown} bg="bg-red-50"    ic="text-red-500"   />
        <KpiCard label="Net Profit"    value={fmtK(totalProfit)}  icon={IndianRupee}  bg="bg-green-50"  ic="text-green-600" />
        <KpiCard label="Avg Margin"    value={`${avgMargin}%`}    icon={BarChart3}    bg="bg-purple-50" ic="text-purple-600"/>
      </div>

      <ChartCard title="Revenue vs Cost vs Profit">
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#94a3b8" }} tickLine={false} axisLine={false} />
            <YAxis tickFormatter={fmtK} tick={{ fontSize: 11, fill: "#94a3b8" }} tickLine={false} axisLine={false} />
            <Tooltip formatter={(v) => typeof v === "number" ? fmt(v) : v} contentStyle={customTooltipStyle} cursor={{ fill: "#f8fafc" }} />
            <Legend />
            <Bar dataKey="revenue" name="Revenue" fill={CHART_COLORS.red}  radius={[4, 4, 0, 0]} />
            <Bar dataKey="cost"    name="Cost"    fill={CHART_COLORS.red}   radius={[4, 4, 0, 0]} />
            <Bar dataKey="profit"  name="Profit"  fill={CHART_COLORS.green} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  );
}

// ── 4. GST Report ───────────────────────────────────────────────
function GstReport({ data }: { data: any[] }) {
  const totalGST = data.reduce((t: number, d: any) => t + d.total, 0);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <KpiCard label="Total GST"   value={fmtK(totalGST)} icon={Receipt}     bg="bg-amber-50"  ic="text-amber-600"  />
        <KpiCard label="Taxable"     value={fmtK(data.reduce((t: number, d: any) => t + d.taxable, 0))} icon={IndianRupee} bg="bg-red-50" ic="text-red-600" />
      </div>

      <ChartCard title="GST Collection by Slab">
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#94a3b8" }} tickLine={false} axisLine={false} />
            <YAxis tickFormatter={fmtK} tick={{ fontSize: 11, fill: "#94a3b8" }} tickLine={false} axisLine={false} />
            <Tooltip formatter={(v: any) => typeof v === "number" ? fmt(v) : v} contentStyle={customTooltipStyle} cursor={{ fill: "#f8fafc" }} />
            <Legend />
            <Bar dataKey="gst5"  name="5%"  fill={CHART_COLORS.red}   radius={[3, 3, 0, 0]} stackId="a" />
            <Bar dataKey="gst12" name="12%" fill={CHART_COLORS.teal}   radius={[0, 0, 0, 0]} stackId="a" />
            <Bar dataKey="gst18" name="18%" fill={CHART_COLORS.amber}  radius={[0, 0, 0, 0]} stackId="a" />
            <Bar dataKey="gst28" name="28%" fill={CHART_COLORS.red}    radius={[3, 3, 0, 0]} stackId="a" />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  );
}

// ── 5. Customer Purchase ────────────────────────────────────────
function CustomerPurchaseReport({ data }: { data: any[] }) {
  const [search, setSearch] = useState("");
  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return data.filter(
      (c) => c.name.toLowerCase().includes(q) || c.id.toString().toLowerCase().includes(q) || (c.phone && c.phone.includes(q))
    ).sort((a, b) => b.totalSpent - a.totalSpent);
  }, [search, data]);

  const totalRevenue = data.reduce((t: number, c: any) => t + c.totalSpent, 0);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <KpiCard label="Total Customers" value={String(data.length)} icon={Users} bg="bg-purple-50" ic="text-purple-600" />
        <KpiCard label="Total Revenue"   value={fmtK(totalRevenue)}   icon={IndianRupee} bg="bg-red-50" ic="text-red-600" />
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 bg-slate-50">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Customer Purchase Details</p>
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input type="text" placeholder="Search customer…" value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={inputCls + " pl-8 w-52 text-xs"} />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100">
                {["Name","Orders","Total Spent","Last Purchase"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((c, i) => (
                <tr key={i} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3.5 font-semibold text-slate-800 whitespace-nowrap">{c.name}</td>
                  <td className="px-4 py-3.5 text-slate-700 tabular-nums">{c.orders}</td>
                  <td className="px-4 py-3.5 font-bold text-slate-900 tabular-nums">{fmt(c.totalSpent)}</td>
                  <td className="px-4 py-3.5 text-slate-500 whitespace-nowrap">{c.lastPurchase}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ── 6. Staff Attendance ─────────────────────────────────────────
function StaffAttendanceReport({ data }: { data: any[] }) {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-100 bg-slate-50">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Staff Attendance Summary</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100">
                {["Name","Present","Absent","Attendance %"].map((h) => (
                  <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((s, i) => (
                <tr key={i} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-3.5 font-semibold text-slate-800 whitespace-nowrap">{s.name}</td>
                  <td className="px-5 py-3.5">
                    <span className="px-2.5 py-0.5 rounded-full bg-green-50 text-green-700 text-xs font-semibold">{s.presentDays} days</span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="px-2.5 py-0.5 rounded-full bg-red-50 text-red-600 text-xs font-semibold">{s.absentDays} days</span>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2">
                      <div className="w-20 bg-slate-100 rounded-full h-1.5">
                        <div className="h-1.5 rounded-full bg-red-500" style={{ width: `${s.attendancePct}%` }} />
                      </div>
                      <span className="text-xs font-bold text-red-600">{s.attendancePct}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ── 7. Salary Paid ──────────────────────────────────────────────
function SalaryPaidReport({ data }: { data: any[] }) {
  const totalPaid = data.reduce((t: number, s: any) => t + s.totalPaid, 0);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <KpiCard label="Total Salary Paid" value={fmtK(totalPaid)} icon={IndianRupee} bg="bg-green-50" ic="text-green-600" />
        <KpiCard label="Staff Count"      value={String(data.length)} icon={Users}       bg="bg-red-50"  ic="text-red-600"  />
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50">
              {["Name","Total Paid","Last Payment"].map((h) => (
                <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((s, i) => (
              <tr key={i} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                <td className="px-5 py-3.5 font-semibold text-slate-800">{s.name}</td>
                <td className="px-5 py-3.5 font-bold text-slate-900">{fmt(s.totalPaid)}</td>
                <td className="px-5 py-3.5 text-slate-500">{s.lastPayment || "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── 8. Stock History ────────────────────────────────────────────
function StockHistoryReport({ data }: { data: any[] }) {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                {["Date","Product","Type","Qty","Supplier/Reason"].map((h) => (
                  <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((h, i) => (
                <tr key={i} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-3.5 text-slate-500 text-xs font-mono">{h.date}</td>
                  <td className="px-5 py-3.5 font-semibold text-slate-800">{h.product}</td>
                  <td className="px-5 py-3.5">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${h.type === "IN" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                      {h.type}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 font-bold tabular-nums">{h.qty}</td>
                  <td className="px-5 py-3.5 text-slate-500 italic">{h.supplier || h.reason || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// MAIN PAGE COMPONENT
// ═══════════════════════════════════════════════════════════════

export default function ReportsPage() {
  const [active,    setActive]    = useState<ReportType>("daily-sales");
  const [month,     setMonth]     = useState(new Date().toISOString().slice(0, 7));
  const [loading,   setLoading]   = useState(true);
  const printRef                  = useRef<HTMLDivElement>(null);

  // Live Data States
  const [dailySales,    setDailySales]    = useState<any[]>([]);
  const [monthlySales,  setMonthlySales]  = useState<any[]>([]);
  const [profitData,    setProfitData]    = useState<any[]>([]);
  const [gstData,       setGstData]       = useState<any[]>([]);
  const [customers,     setCustomers]     = useState<any[]>([]);
  const [staffAtt,      setStaffAtt]      = useState<any[]>([]);
  const [salaries,      setSalaries]      = useState<any[]>([]);
  const [stockHistory,  setStockHistory]  = useState<any[]>([]);

  useEffect(() => {
    async function fetchAllData() {
      try {
        setLoading(true);
        const [
          billsRes,
          staffRes,
          attendRes,
          salaryRes,
          stockRes,
          dailyRes,
          profitRes,
          gstRes
        ] = await Promise.all([
          api.get('/bills'),
          api.get('/staff'),
          api.get('/attendance'),
          api.get('/salaries'),
          api.get('/stock-history'),
          api.get('/reports/daily-sales'),
          api.get('/reports/profit'),
          api.get('/reports/gst-summary')
        ]);

        const bills = billsRes.data || [];
        const staff = staffRes.data || [];
        const attendance = attendRes.data || [];
        const salaryList = salaryRes.data || [];
        const stockHist = stockRes.data || [];

        // Set Daily Sales (directly from API)
        setDailySales(dailyRes.data.map((d: any) => ({
          date: d.day,
          sales: d.sales,
          orders: bills.filter((b: any) => b.createdAt?.split('T')[0] === d.date).length, // Approximated
          returns: 0
        })));

        // Set Monthly Sales & Profit (from API)
        const pData = profitRes.data.by_month.map((v: any) => ({
          ...v,
          sales: v.revenue,
          orders: bills.filter((b: any) => b.createdAt?.slice(0, 7) === v.month).length,
          customers: new Set(bills.filter((b: any) => b.createdAt?.slice(0, 7) === v.month).map((b: any) => b.customer_id)).size,
          margin: v.revenue > 0 ? Math.round((v.profit / v.revenue) * 100) : 0
        }));

        setMonthlySales(pData);
        setProfitData(pData);

        // GST Data (from history API)
        setGstData(gstRes.data.history.map((g: any) => ({
          month: g.month,
          total: g.collected,
          taxable: Math.round(g.collected / 0.18), // Estimated taxable base
          gst5: g.collected * 0.1,
          gst12: g.collected * 0.2,
          gst18: g.collected * 0.6,
          gst28: g.collected * 0.1
        })));

        // Process Customers
        const custMap: any = {};
        bills.forEach((b: any) => {
          if (!b.customer) return;
          const cid = b.customer.id;
          if (!custMap[cid]) custMap[cid] = { id: cid, name: b.customer.name, phone: b.customer.phone, orders: 0, totalSpent: 0, lastPurchase: "" };
          custMap[cid].orders += 1;
          custMap[cid].totalSpent += parseFloat(b.total_amount || 0);
          custMap[cid].lastPurchase = b.createdAt?.split('T')[0];
        });
        setCustomers(Object.values(custMap));

        // Process Staff Attendance
        setStaffAtt(staff.map((s: any) => {
          const att = attendance.filter((a: any) => a.staff_id === s.id);
          const present = att.filter((a: any) => a.status === 'present').length;
          const total = att.length || 1;
          return {
            id: s.id,
            name: s.name,
            presentDays: present,
            absentDays: att.filter((a: any) => a.status === 'absent').length,
            attendancePct: Math.round((present / total) * 100)
          };
        }));

        // Process Salary
        setSalaries(staff.map((s: any) => {
          const p = salaryList.filter((x: any) => x.staff_id === s.id && x.status === 'paid');
          return {
            name: s.name,
            totalPaid: p.reduce((t: number, x: any) => t + parseFloat(x.amount || 0), 0),
            lastPayment: p.length > 0 ? p[p.length-1].payment_date?.split('T')[0] : ""
          };
        }));

        // Stock History
        setStockHistory(stockHist.map((sh: any) => ({
          date: sh.createdAt?.split('T')[0],
          product: sh.product?.name || "Unknown",
          type: sh.type,
          qty: sh.quantity,
          reason: sh.reason,
          supplier: sh.supplier
        })));

      } catch (error) {
        console.error("Failed to fetch reports data", error);
      } finally {
        setLoading(false);
      }
    }
    fetchAllData();
  }, []);

  const activeReport = REPORTS.find((r) => r.key === active)!;

  function handlePrint() {
    const content = printRef.current;
    if (!content) return;
    const printWin = window.open("", "_blank", "width=1100,height=800");
    if (!printWin) return;
    printWin.document.write(`
      <html>
        <head>
          <title>${activeReport.label} — ${month}</title>
          <style>
            * { box-sizing: border-box; margin: 0; padding: 0; font-family: system-ui, sans-serif; }
            body { padding: 32px; color: #1e293b; font-size: 13px; }
            h1 { font-size: 18px; font-weight: 700; margin-bottom: 4px; }
            p  { color: #64748b; font-size: 12px; margin-bottom: 24px; }
            table { width: 100%; border-collapse: collapse; margin-top: 16px; }
            th { background: #f8fafc; text-align: left; padding: 8px 12px; font-size: 11px; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 1px solid #e2e8f0; }
            td { padding: 8px 12px; border-bottom: 1px solid #f1f5f9; }
            tfoot td { background: #f8fafc; font-weight: 700; border-top: 2px solid #e2e8f0; }
            @media print { body { padding: 16px; } }
          </style>
        </head>
        <body>
          <h1>${activeReport.label}</h1>
          <p>Generated: ${new Date().toLocaleString("en-IN")} &nbsp;|&nbsp; Period: ${month}</p>
          ${content.innerHTML}
        </body>
      </html>
    `);
    printWin.document.close();
    printWin.focus();
    setTimeout(() => { printWin.print(); printWin.close(); }, 500);
  }

  function handleExportCSV() {
    const rows: string[][] = [];
    const tables = printRef.current?.querySelectorAll("table");
    if (!tables?.length) return;
    const table = tables[tables.length - 1]; 
    table.querySelectorAll("tr").forEach((tr) => {
      const row: string[] = [];
      tr.querySelectorAll("th, td").forEach((td) => row.push(`"${td.textContent?.trim() ?? ""}"`));
      rows.push(row);
    });
    const csv     = rows.map((r) => r.join(",")).join("\n");
    const blob    = new Blob([csv], { type: "text/csv" });
    const url     = URL.createObjectURL(blob);
    const a       = document.createElement("a");
    a.href        = url;
    a.download    = `${activeReport.label.replace(/\s+/g, "_")}_${month}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const fmtMonth = (m: string) =>
    new Date(m + "-01").toLocaleString("en-IN", { month: "long", year: "numeric" });

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-red-600" />
          <p className="text-sm font-medium text-slate-500">Generating live reports...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* ── Page Header ── */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Reports</h1>
          <p className="text-sm text-slate-500 mt-0.5">Business Intelligence Dashboard</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 h-9 px-3 rounded-lg border border-slate-200 bg-white">
            <Calendar size={14} className="text-slate-400" />
            <input type="month" value={month} onChange={(e) => setMonth(e.target.value)}
              className="text-sm text-slate-700 outline-none bg-transparent" />
          </div>
          <button onClick={handleExportCSV}
            className="flex items-center gap-2 h-9 px-4 rounded-lg border border-slate-200 bg-white text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-green-600 transition-colors">
            <Download size={15} /> Export CSV
          </button>
          <button onClick={handlePrint}
            className="flex items-center gap-2 h-9 px-4 rounded-lg bg-red-600 hover:bg-red-700 text-sm font-semibold text-white transition-colors shadow-sm shadow-red-200">
            <Printer size={15} /> Print
          </button>
        </div>
      </div>

      <div className="flex gap-6">

        {/* ── Sidebar Report Menu ── */}
        <div className="w-56 shrink-0">
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden sticky top-6">
            <div className="px-4 py-3 border-b border-slate-100">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Report Types</p>
            </div>
            <nav className="py-2">
              {REPORTS.map((r) => {
                const Icon = r.icon;
                return (
                  <button
                    key={r.key}
                    onClick={() => setActive(r.key)}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-all ${
                      active === r.key
                        ? "bg-red-50 text-red-700"
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                    }`}
                  >
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                      active === r.key ? r.bg : "bg-slate-100"
                    }`}>
                      <Icon className={`w-3.5 h-3.5 ${active === r.key ? r.color : "text-slate-400"}`} />
                    </div>
                    <span className={`text-xs font-semibold leading-tight ${active === r.key ? "text-red-700" : "text-slate-600"}`}>
                      {r.label}
                    </span>
                    {active === r.key && (
                        <div className="ml-auto w-1.5 h-1.5 rounded-full bg-red-600" />
                    )}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* ── Report Content ── */}
        <div className="flex-1 min-w-0">

          {/* Report Header */}
          <div className="flex items-center gap-3 mb-6">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${activeReport.bg}`}>
              <activeReport.icon className={`w-5 h-5 ${activeReport.color}`} />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">{activeReport.label}</h2>
              <p className="text-xs text-slate-400">
                {fmtMonth(month)} &nbsp;·&nbsp; Live Data
              </p>
            </div>
          </div>

          {/* Printable Content */}
          <div ref={printRef}>
            {active === "daily-sales"       && <DailySalesReport data={dailySales} />}
            {active === "monthly-sales"     && <MonthlySalesReport data={monthlySales} />}
            {active === "profit"            && <ProfitReport data={profitData} />}
            {active === "gst"               && <GstReport data={gstData} />}
            {active === "customer-purchase" && <CustomerPurchaseReport data={customers} />}
            {active === "staff-attendance"  && <StaffAttendanceReport data={staffAtt} />}
            {active === "salary-paid"       && <SalaryPaidReport data={salaries} />}
            {active === "stock-history"     && <StockHistoryReport data={stockHistory} />}
          </div>
        </div>
      </div>
    </div>
  );
}