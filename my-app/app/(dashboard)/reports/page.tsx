"use client";

import { useState, useMemo, useRef } from "react";
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell,
} from "recharts";
import {
  TrendingUp, TrendingDown, IndianRupee, Receipt, Users,
  UserCheck, BadgeDollarSign, Package, ChevronDown, Download,
  Printer, Calendar, Search, X, FileText, BarChart3,
  ArrowUpRight, ArrowDownRight, Percent,
} from "lucide-react";

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

// ═══════════════════════════════════════════════════════════════
// MOCK DATA
// ═══════════════════════════════════════════════════════════════

// Daily Sales – April 2026
const DAILY_SALES = Array.from({ length: 17 }, (_, i) => ({
  date:    `Apr ${String(i + 1).padStart(2, "0")}`,
  sales:   Math.round(4000 + Math.random() * 8000),
  orders:  Math.round(4 + Math.random() * 20),
  returns: Math.round(Math.random() * 500),
}));

// Monthly Sales – Jan–Apr 2026
const MONTHLY_SALES = [
  { month: "Jan 2026", sales: 182000, orders: 148, returns: 8200, customers: 89  },
  { month: "Feb 2026", sales: 216000, orders: 173, returns: 9100, customers: 104 },
  { month: "Mar 2026", sales: 254000, orders: 201, returns: 7800, customers: 121 },
  { month: "Apr 2026", sales: 98000,  orders: 82,  returns: 3400, customers: 54  },
];

// Profit Data
const PROFIT_DATA = [
  { month: "Jan 2026", revenue: 182000, cost: 118000, profit: 64000,  margin: 35.2 },
  { month: "Feb 2026", revenue: 216000, cost: 138000, profit: 78000,  margin: 36.1 },
  { month: "Mar 2026", revenue: 254000, cost: 159000, profit: 95000,  margin: 37.4 },
  { month: "Apr 2026", revenue: 98000,  cost: 62000,  profit: 36000,  margin: 36.7 },
];

// GST Data
const GST_DATA = [
  { month: "Jan 2026", taxable: 154237, gst5: 4100, gst12: 11200, gst18: 23600, gst28: 8900, total: 47800 },
  { month: "Feb 2026", taxable: 183051, gst5: 4900, gst12: 13300, gst18: 28100, gst28: 10600, total: 56900 },
  { month: "Mar 2026", taxable: 215254, gst5: 5800, gst12: 15600, gst18: 33000, gst28: 12400, total: 66800 },
  { month: "Apr 2026", taxable: 83051,  gst5: 2200, gst12: 6000,  gst18: 12700, gst28: 4800,  total: 25700 },
];

// Customer Purchase Report
const CUSTOMER_PURCHASE = [
  { id: "CUS-001", name: "Arjun Das",      phone: "9876543210", orders: 12, totalSpent: 48200, lastPurchase: "2026-04-15", topCategory: "Electronics" },
  { id: "CUS-002", name: "Priya Sharma",   phone: "8765432109", orders: 8,  totalSpent: 31600, lastPurchase: "2026-04-14", topCategory: "Accessories" },
  { id: "CUS-003", name: "Ravi Kumar",     phone: "7654321098", orders: 15, totalSpent: 62400, lastPurchase: "2026-04-16", topCategory: "Electronics" },
  { id: "CUS-004", name: "Meena Nair",     phone: "6543210987", orders: 5,  totalSpent: 18900, lastPurchase: "2026-04-10", topCategory: "Furniture"   },
  { id: "CUS-005", name: "Suresh Pillai",  phone: "5432109876", orders: 20, totalSpent: 89000, lastPurchase: "2026-04-17", topCategory: "Electronics" },
  { id: "CUS-006", name: "Anita Bose",     phone: "4321098765", orders: 3,  totalSpent: 9400,  lastPurchase: "2026-04-08", topCategory: "Accessories" },
  { id: "CUS-007", name: "Vijay Menon",    phone: "3210987654", orders: 9,  totalSpent: 37500, lastPurchase: "2026-04-12", topCategory: "Electronics" },
  { id: "CUS-008", name: "Deepa Iyer",     phone: "9123456789", orders: 6,  totalSpent: 24100, lastPurchase: "2026-04-13", topCategory: "Furniture"   },
];

// Staff Attendance Report
const STAFF_ATTENDANCE = [
  { id: "STF-001", name: "Aditi Verma",  presentDays: 15, absentDays: 2, totalHours: 136.5, avgHours: 9.1, attendancePct: 88 },
  { id: "STF-002", name: "Rohit Joshi",  presentDays: 14, absentDays: 3, totalHours: 126.0, avgHours: 9.0, attendancePct: 82 },
  { id: "STF-003", name: "Meena Pillai", presentDays: 10, absentDays: 7, totalHours: 88.0,  avgHours: 8.8, attendancePct: 59 },
  { id: "STF-004", name: "Dev Malhotra", presentDays: 13, absentDays: 4, totalHours: 117.0, avgHours: 9.0, attendancePct: 76 },
  { id: "STF-005", name: "Sunita Rao",   presentDays: 16, absentDays: 1, totalHours: 140.8, avgHours: 8.8, attendancePct: 94 },
];

// Salary Paid Report
const SALARY_PAID = [
  { id: "STF-001", name: "Aditi Verma",  mar: 18000, feb: 18000, jan: 18000, paidMonths: 3, pendingMonths: 1 },
  { id: "STF-002", name: "Rohit Joshi",  mar: 15000, feb: 15000, jan: 15000, paidMonths: 3, pendingMonths: 1 },
  { id: "STF-003", name: "Meena Pillai", mar: 20000, feb: 20000, jan: 0,     paidMonths: 2, pendingMonths: 2 },
  { id: "STF-004", name: "Dev Malhotra", mar: 12000, feb: 12000, jan: 12000, paidMonths: 3, pendingMonths: 1 },
  { id: "STF-005", name: "Sunita Rao",   mar: 14000, feb: 14000, jan: 14000, paidMonths: 3, pendingMonths: 1 },
];

const SALARY_MONTHLY = [
  { month: "Jan 2026", paid: 75000,  pending: 20000 },
  { month: "Feb 2026", paid: 79000,  pending: 0     },
  { month: "Mar 2026", paid: 79000,  pending: 0     },
  { month: "Apr 2026", paid: 0,      pending: 79000 },
];

// Stock History
const STOCK_HISTORY = [
  { id: "SH-001", product: "Wireless Keyboard",   category: "Electronics", type: "IN",  qty: 20, price: 850,  supplier: "TechZone",       reason: "",        date: "2026-04-10" },
  { id: "SH-002", product: "Mechanical Mouse",     category: "Electronics", type: "IN",  qty: 15, price: 550,  supplier: "Global Traders", reason: "",        date: "2026-04-09" },
  { id: "SH-003", product: "Mechanical Mouse",     category: "Electronics", type: "OUT", qty: 15, price: 0,    supplier: "",               reason: "Sold",    date: "2026-04-12" },
  { id: "SH-004", product: "HDMI Cable 2m",        category: "Accessories", type: "OUT", qty: 5,  price: 0,    supplier: "",               reason: "Damaged", date: "2026-04-11" },
  { id: "SH-005", product: "USB-C Hub 7-in-1",     category: "Electronics", type: "OUT", qty: 4,  price: 0,    supplier: "",               reason: "Sold",    date: "2026-04-14" },
  { id: "SH-006", product: "Laptop Sleeve 15\"",   category: "Accessories", type: "IN",  qty: 30, price: 380,  supplier: "Fashion Acc",    reason: "",        date: "2026-04-13" },
  { id: "SH-007", product: "Webcam 1080p",         category: "Electronics", type: "IN",  qty: 10, price: 2100, supplier: "TechZone",       reason: "",        date: "2026-04-15" },
  { id: "SH-008", product: "Mechanical Keyboard",  category: "Electronics", type: "OUT", qty: 3,  price: 0,    supplier: "",               reason: "Return",  date: "2026-04-16" },
  { id: "SH-009", product: "Mouse Pad XL",         category: "Accessories", type: "OUT", qty: 7,  price: 0,    supplier: "",               reason: "Sold",    date: "2026-04-15" },
  { id: "SH-010", product: "Monitor Stand",        category: "Furniture",   type: "IN",  qty: 10, price: 1600, supplier: "Furniture Hub",  reason: "",        date: "2026-04-08" },
];

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
  blue:   "#3b82f6",
  green:  "#22c55e",
  red:    "#ef4444",
  amber:  "#f59e0b",
  purple: "#8b5cf6",
  teal:   "#14b8a6",
  indigo: "#6366f1",
  slate:  "#94a3b8",
};

const inputCls =
  "h-9 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 transition-colors";

// ═══════════════════════════════════════════════════════════════
// REPORT MENU CONFIG
// ═══════════════════════════════════════════════════════════════

const REPORTS: { key: ReportType; label: string; icon: React.ElementType; color: string; bg: string }[] = [
  { key: "daily-sales",       label: "Day-wise Sales",        icon: TrendingUp,       color: "text-blue-600",   bg: "bg-blue-50"   },
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
function DailySalesReport({ month }: { month: string }) {
  const totalSales   = DAILY_SALES.reduce((t, d) => t + d.sales, 0);
  const totalOrders  = DAILY_SALES.reduce((t, d) => t + d.orders, 0);
  const totalReturns = DAILY_SALES.reduce((t, d) => t + d.returns, 0);
  const avgOrder     = Math.round(totalSales / totalOrders);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <KpiCard label="Total Sales"    value={fmtK(totalSales)}   sub="This month"       delta={12.4}  icon={TrendingUp}  bg="bg-blue-50"   ic="text-blue-600"  />
        <KpiCard label="Total Orders"   value={String(totalOrders)} sub="Transactions"    delta={8.2}   icon={Receipt}     bg="bg-green-50"  ic="text-green-600" />
        <KpiCard label="Avg Order Value" value={fmt(avgOrder)}      sub="Per transaction" delta={3.8}   icon={IndianRupee} bg="bg-purple-50" ic="text-purple-600"/>
        <KpiCard label="Returns"        value={fmtK(totalReturns)} sub="Refunded amount"  delta={-2.1}  icon={TrendingDown} bg="bg-red-50"   ic="text-red-500"   />
      </div>

      <ChartCard title="Daily Sales Trend" sub={`Sales & Orders — ${month}`}>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={DAILY_SALES} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#94a3b8" }} tickLine={false} axisLine={false} />
            <YAxis tickFormatter={fmtK} tick={{ fontSize: 11, fill: "#94a3b8" }} tickLine={false} axisLine={false} />
            <Tooltip
              formatter={(v: any) => typeof v === "number" ? fmt(v) : v}
              contentStyle={customTooltipStyle}
              cursor={{ fill: "#f8fafc" }}
              labelFormatter={(label) => label}
            />
            <Legend formatter={(v: string) => v === "sales" ? "Sales" : "Returns"} />
            <Bar dataKey="sales"   fill={CHART_COLORS.blue}  radius={[4, 4, 0, 0]} />
            <Bar dataKey="returns" fill={CHART_COLORS.red}   radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* Table */}
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
              {DAILY_SALES.map((d) => (
                <tr key={d.date} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-3 font-medium text-slate-700 whitespace-nowrap">{d.date}, 2026</td>
                  <td className="px-5 py-3 text-slate-600 tabular-nums">{d.orders}</td>
                  <td className="px-5 py-3 font-semibold text-slate-900 tabular-nums">{fmt(d.sales)}</td>
                  <td className="px-5 py-3 text-red-500 tabular-nums">{fmt(d.returns)}</td>
                  <td className="px-5 py-3 font-bold text-green-700 tabular-nums">{fmt(d.sales - d.returns)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-slate-50 border-t border-slate-200 font-bold">
                <td className="px-5 py-3 text-slate-800">Total</td>
                <td className="px-5 py-3 text-slate-800 tabular-nums">{totalOrders}</td>
                <td className="px-5 py-3 text-slate-800 tabular-nums">{fmt(totalSales)}</td>
                <td className="px-5 py-3 text-red-600 tabular-nums">{fmt(totalReturns)}</td>
                <td className="px-5 py-3 text-green-700 tabular-nums">{fmt(totalSales - totalReturns)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}

// ── 2. Monthly Sales ────────────────────────────────────────────
function MonthlySalesReport() {
  const totalSales = MONTHLY_SALES.reduce((t, m) => t + m.sales, 0);
  const totalOrders = MONTHLY_SALES.reduce((t, m) => t + m.orders, 0);
  const totalCustomers = MONTHLY_SALES.reduce((t, m) => t + m.customers, 0);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <KpiCard label="YTD Revenue"   value={fmtK(totalSales)}    sub="Jan–Apr 2026"   delta={18.3}  icon={TrendingUp}  bg="bg-blue-50"   ic="text-blue-600"  />
        <KpiCard label="Total Orders"  value={String(totalOrders)} sub="4 months"       delta={15.2}  icon={Receipt}     bg="bg-green-50"  ic="text-green-600" />
        <KpiCard label="Customers"     value={String(totalCustomers)} sub="Unique"      delta={22.1}  icon={Users}       bg="bg-purple-50" ic="text-purple-600"/>
        <KpiCard label="Best Month"    value="Mar 2026"             sub={fmtK(254000)}              icon={BarChart3}   bg="bg-amber-50"  ic="text-amber-600" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        <ChartCard title="Monthly Revenue" sub="Jan–Apr 2026">
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={MONTHLY_SALES} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#94a3b8" }} tickLine={false} axisLine={false} />
              <YAxis tickFormatter={fmtK} tick={{ fontSize: 11, fill: "#94a3b8" }} tickLine={false} axisLine={false} />
              <Tooltip formatter={(v: any) => typeof v === "number" ? [fmt(v), "Revenue"] : v} contentStyle={customTooltipStyle} cursor={{ fill: "#f8fafc" }} />
              <Bar dataKey="sales" fill={CHART_COLORS.blue} radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Orders vs Customers" sub="Monthly comparison">
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={MONTHLY_SALES} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#94a3b8" }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={customTooltipStyle} />
              <Legend />
              <Line type="monotone" dataKey="orders"    stroke={CHART_COLORS.blue}   strokeWidth={2.5} dot={{ r: 4 }} name="Orders"    />
              <Line type="monotone" dataKey="customers" stroke={CHART_COLORS.purple} strokeWidth={2.5} dot={{ r: 4 }} name="Customers" />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-100 bg-slate-50">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Monthly Breakdown</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100">
                {["Month", "Orders", "New Customers", "Gross Sales", "Returns", "Net Sales", "Avg/Order"].map((h) => (
                  <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {MONTHLY_SALES.map((m) => (
                <tr key={m.month} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-3.5 font-semibold text-slate-800">{m.month}</td>
                  <td className="px-5 py-3.5 text-slate-600 tabular-nums">{m.orders}</td>
                  <td className="px-5 py-3.5 text-slate-600 tabular-nums">{m.customers}</td>
                  <td className="px-5 py-3.5 font-semibold text-slate-900 tabular-nums">{fmt(m.sales)}</td>
                  <td className="px-5 py-3.5 text-red-500 tabular-nums">{fmt(m.returns)}</td>
                  <td className="px-5 py-3.5 font-bold text-green-700 tabular-nums">{fmt(m.sales - m.returns)}</td>
                  <td className="px-5 py-3.5 text-slate-600 tabular-nums">{fmt(Math.round(m.sales / m.orders))}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-slate-50 border-t border-slate-200 font-bold">
                <td className="px-5 py-3 text-slate-800">Total</td>
                <td className="px-5 py-3 text-slate-800 tabular-nums">{totalOrders}</td>
                <td className="px-5 py-3 text-slate-800 tabular-nums">{totalCustomers}</td>
                <td className="px-5 py-3 text-slate-800 tabular-nums">{fmt(totalSales)}</td>
                <td className="px-5 py-3 text-red-600 tabular-nums">{fmt(MONTHLY_SALES.reduce((t, m) => t + m.returns, 0))}</td>
                <td className="px-5 py-3 text-green-700 tabular-nums">{fmt(totalSales - MONTHLY_SALES.reduce((t, m) => t + m.returns, 0))}</td>
                <td className="px-5 py-3 text-slate-800 tabular-nums">{fmt(Math.round(totalSales / totalOrders))}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}

// ── 3. Profit Report ────────────────────────────────────────────
function ProfitReport() {
  const totalRevenue = PROFIT_DATA.reduce((t, d) => t + d.revenue, 0);
  const totalCost    = PROFIT_DATA.reduce((t, d) => t + d.cost, 0);
  const totalProfit  = PROFIT_DATA.reduce((t, d) => t + d.profit, 0);
  const avgMargin    = (totalProfit / totalRevenue * 100).toFixed(1);

  const pieData = [
    { name: "Cost of Goods", value: totalCost   },
    { name: "Net Profit",    value: totalProfit },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <KpiCard label="Total Revenue" value={fmtK(totalRevenue)} sub="YTD"         delta={18.3} icon={TrendingUp}   bg="bg-blue-50"   ic="text-blue-600"  />
        <KpiCard label="Total Cost"    value={fmtK(totalCost)}    sub="COGS"        delta={14.2} icon={TrendingDown} bg="bg-red-50"    ic="text-red-500"   />
        <KpiCard label="Net Profit"    value={fmtK(totalProfit)}  sub="YTD"         delta={24.8} icon={IndianRupee}  bg="bg-green-50"  ic="text-green-600" />
        <KpiCard label="Avg Margin"    value={`${avgMargin}%`}    sub="Gross margin"             icon={BarChart3}    bg="bg-purple-50" ic="text-purple-600"/>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        <ChartCard title="Revenue vs Cost vs Profit" sub="Monthly comparison">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={PROFIT_DATA} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#94a3b8" }} tickLine={false} axisLine={false} />
              <YAxis tickFormatter={fmtK} tick={{ fontSize: 11, fill: "#94a3b8" }} tickLine={false} axisLine={false} />
              <Tooltip formatter={(v) => typeof v === "number" ? fmt(v) : v} contentStyle={customTooltipStyle} cursor={{ fill: "#f8fafc" }} />
              <Legend />
              <Bar dataKey="revenue" name="Revenue" fill={CHART_COLORS.blue}  radius={[4, 4, 0, 0]} />
              <Bar dataKey="cost"    name="Cost"    fill={CHART_COLORS.red}   radius={[4, 4, 0, 0]} />
              <Bar dataKey="profit"  name="Profit"  fill={CHART_COLORS.green} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Revenue Split" sub="Cost vs Profit (YTD)">
          <div className="flex items-center gap-6">
            <ResponsiveContainer width="60%" height={220}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={90}
                  dataKey="value" paddingAngle={4}>
                  <Cell fill={CHART_COLORS.red}   />
                  <Cell fill={CHART_COLORS.green} />
                </Pie>
                <Tooltip formatter={(v) => typeof v === "number" ? fmt(v) : v} contentStyle={customTooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-3">
              {pieData.map((d, i) => (
                <div key={d.name} className="flex items-center gap-2.5">
                  <div className={`w-3 h-3 rounded-full shrink-0`}
                    style={{ backgroundColor: i === 0 ? CHART_COLORS.red : CHART_COLORS.green }} />
                  <div>
                    <p className="text-xs text-slate-500">{d.name}</p>
                    <p className="text-sm font-bold text-slate-900">{fmtK(d.value)}</p>
                    <p className="text-xs text-slate-400">{(d.value / totalRevenue * 100).toFixed(1)}%</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </ChartCard>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-100 bg-slate-50">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Monthly Profit Breakdown</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100">
                {["Month", "Revenue", "Cost of Goods", "Gross Profit", "Margin %"].map((h) => (
                  <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {PROFIT_DATA.map((d) => (
                <tr key={d.month} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-3.5 font-semibold text-slate-800">{d.month}</td>
                  <td className="px-5 py-3.5 text-slate-700 tabular-nums">{fmt(d.revenue)}</td>
                  <td className="px-5 py-3.5 text-red-500 tabular-nums">{fmt(d.cost)}</td>
                  <td className="px-5 py-3.5 font-bold text-green-700 tabular-nums">{fmt(d.profit)}</td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2">
                      <div className="w-20 bg-slate-100 rounded-full h-1.5">
                        <div className="bg-green-500 h-1.5 rounded-full" style={{ width: `${d.margin}%` }} />
                      </div>
                      <span className="text-xs font-bold text-green-700">{d.margin}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-slate-50 border-t border-slate-200 font-bold">
                <td className="px-5 py-3 text-slate-800">Total</td>
                <td className="px-5 py-3 text-slate-800 tabular-nums">{fmt(totalRevenue)}</td>
                <td className="px-5 py-3 text-red-600 tabular-nums">{fmt(totalCost)}</td>
                <td className="px-5 py-3 text-green-700 tabular-nums">{fmt(totalProfit)}</td>
                <td className="px-5 py-3 text-green-700">{avgMargin}%</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}

// ── 4. GST Report ───────────────────────────────────────────────
function GstReport() {
  const totalGST = GST_DATA.reduce((t, d) => t + d.total, 0);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <KpiCard label="Total GST Collected" value={fmtK(totalGST)}                          sub="YTD"   icon={Receipt}     bg="bg-amber-50"  ic="text-amber-600"  />
        <KpiCard label="5% Slab"             value={fmt(GST_DATA.reduce((t,d)=>t+d.gst5,0))} sub="Total" icon={Percent as React.ElementType}     bg="bg-blue-50"   ic="text-blue-600"   />
        <KpiCard label="18% Slab"            value={fmt(GST_DATA.reduce((t,d)=>t+d.gst18,0))} sub="Total" icon={Percent as React.ElementType}    bg="bg-purple-50" ic="text-purple-600" />
        <KpiCard label="28% Slab"            value={fmt(GST_DATA.reduce((t,d)=>t+d.gst28,0))} sub="Total" icon={Percent as React.ElementType}    bg="bg-red-50"    ic="text-red-500"    />
      </div>

      <ChartCard title="GST Collection by Slab" sub="Monthly breakdown">
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={GST_DATA} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#94a3b8" }} tickLine={false} axisLine={false} />
            <YAxis tickFormatter={fmtK} tick={{ fontSize: 11, fill: "#94a3b8" }} tickLine={false} axisLine={false} />
            <Tooltip formatter={(v: any) => typeof v === "number" ? fmt(v) : v} contentStyle={customTooltipStyle} cursor={{ fill: "#f8fafc" }} />
            <Legend />
            <Bar dataKey="gst5"  name="5%"  fill={CHART_COLORS.blue}   radius={[3, 3, 0, 0]} stackId="a" />
            <Bar dataKey="gst12" name="12%" fill={CHART_COLORS.teal}   radius={[0, 0, 0, 0]} stackId="a" />
            <Bar dataKey="gst18" name="18%" fill={CHART_COLORS.amber}  radius={[0, 0, 0, 0]} stackId="a" />
            <Bar dataKey="gst28" name="28%" fill={CHART_COLORS.red}    radius={[3, 3, 0, 0]} stackId="a" />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-100 bg-slate-50">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">GST Monthly Summary</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100">
                {["Month", "Taxable Amount", "GST @5%", "GST @12%", "GST @18%", "GST @28%", "Total GST"].map((h) => (
                  <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {GST_DATA.map((d) => (
                <tr key={d.month} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-3.5 font-semibold text-slate-800">{d.month}</td>
                  <td className="px-5 py-3.5 text-slate-700 tabular-nums">{fmt(d.taxable)}</td>
                  <td className="px-5 py-3.5 text-blue-600 tabular-nums">{fmt(d.gst5)}</td>
                  <td className="px-5 py-3.5 text-teal-600 tabular-nums">{fmt(d.gst12)}</td>
                  <td className="px-5 py-3.5 text-amber-600 tabular-nums">{fmt(d.gst18)}</td>
                  <td className="px-5 py-3.5 text-red-500 tabular-nums">{fmt(d.gst28)}</td>
                  <td className="px-5 py-3.5 font-bold text-slate-900 tabular-nums">{fmt(d.total)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-slate-50 border-t border-slate-200 font-bold">
                <td className="px-5 py-3 text-slate-800">Total</td>
                <td className="px-5 py-3 text-slate-800 tabular-nums">{fmt(GST_DATA.reduce((t,d)=>t+d.taxable,0))}</td>
                <td className="px-5 py-3 text-blue-700 tabular-nums">{fmt(GST_DATA.reduce((t,d)=>t+d.gst5,0))}</td>
                <td className="px-5 py-3 text-teal-700 tabular-nums">{fmt(GST_DATA.reduce((t,d)=>t+d.gst12,0))}</td>
                <td className="px-5 py-3 text-amber-700 tabular-nums">{fmt(GST_DATA.reduce((t,d)=>t+d.gst18,0))}</td>
                <td className="px-5 py-3 text-red-600 tabular-nums">{fmt(GST_DATA.reduce((t,d)=>t+d.gst28,0))}</td>
                <td className="px-5 py-3 text-slate-800 tabular-nums">{fmt(totalGST)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}

// ── 5. Customer Purchase ────────────────────────────────────────
function CustomerPurchaseReport() {
  const [search, setSearch] = useState("");
  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return CUSTOMER_PURCHASE.filter(
      (c) => c.name.toLowerCase().includes(q) || c.id.toLowerCase().includes(q) || c.phone.includes(q)
    ).sort((a, b) => b.totalSpent - a.totalSpent);
  }, [search]);

  const totalRevenue   = CUSTOMER_PURCHASE.reduce((t, c) => t + c.totalSpent, 0);
  const totalOrders    = CUSTOMER_PURCHASE.reduce((t, c) => t + c.orders, 0);
  const topCustomer    = [...CUSTOMER_PURCHASE].sort((a, b) => b.totalSpent - a.totalSpent)[0];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <KpiCard label="Total Customers"  value={String(CUSTOMER_PURCHASE.length)} sub="Active"         icon={Users}      bg="bg-purple-50" ic="text-purple-600" />
        <KpiCard label="Total Revenue"    value={fmtK(totalRevenue)}               sub="From customers" icon={IndianRupee} bg="bg-blue-50"  ic="text-blue-600"  />
        <KpiCard label="Total Orders"     value={String(totalOrders)}              sub="All customers"  icon={Receipt}    bg="bg-green-50"  ic="text-green-600" />
        <KpiCard label="Top Customer"     value={topCustomer.name.split(" ")[0]}  sub={fmtK(topCustomer.totalSpent)} icon={TrendingUp} bg="bg-amber-50" ic="text-amber-600" />
      </div>

      <ChartCard title="Top Customers by Spend" sub="All time">
        <ResponsiveContainer width="100%" height={240}>
          <BarChart
            data={[...CUSTOMER_PURCHASE].sort((a, b) => b.totalSpent - a.totalSpent).slice(0, 6)}
            layout="vertical"
            margin={{ top: 4, right: 40, left: 60, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
            <XAxis type="number" tickFormatter={fmtK} tick={{ fontSize: 11, fill: "#94a3b8" }} tickLine={false} axisLine={false} />
            <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: "#64748b" }} tickLine={false} axisLine={false} width={80} />
            <Tooltip formatter={(v: any) => typeof v === "number" ? [fmt(v), "Spent"] : v} contentStyle={customTooltipStyle} cursor={{ fill: "#f8fafc" }} />
            <Bar dataKey="totalSpent" fill={CHART_COLORS.purple} radius={[0, 6, 6, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

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
                {["#","Customer ID","Name","Phone","Orders","Total Spent","Avg/Order","Last Purchase","Top Category"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((c, i) => (
                <tr key={c.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3.5 text-xs text-slate-400 tabular-nums">{i + 1}</td>
                  <td className="px-4 py-3.5 font-mono text-xs text-slate-500">{c.id}</td>
                  <td className="px-4 py-3.5 font-semibold text-slate-800 whitespace-nowrap">{c.name}</td>
                  <td className="px-4 py-3.5 text-slate-500 whitespace-nowrap">{c.phone}</td>
                  <td className="px-4 py-3.5 text-slate-700 tabular-nums">{c.orders}</td>
                  <td className="px-4 py-3.5 font-bold text-slate-900 tabular-nums">{fmt(c.totalSpent)}</td>
                  <td className="px-4 py-3.5 text-slate-600 tabular-nums">{fmt(Math.round(c.totalSpent / c.orders))}</td>
                  <td className="px-4 py-3.5 text-slate-500 whitespace-nowrap">{c.lastPurchase}</td>
                  <td className="px-4 py-3.5">
                    <span className="px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 text-xs font-semibold">{c.topCategory}</span>
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

// ── 6. Staff Attendance ─────────────────────────────────────────
function StaffAttendanceReport({ month }: { month: string }) {
  const totalDays     = Math.max(...STAFF_ATTENDANCE.map((s) => s.presentDays + s.absentDays));
  const avgAttendance = Math.round(STAFF_ATTENDANCE.reduce((t, s) => t + s.attendancePct, 0) / STAFF_ATTENDANCE.length);
  const totalHours    = STAFF_ATTENDANCE.reduce((t, s) => t + s.totalHours, 0);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <KpiCard label="Total Staff"      value={String(STAFF_ATTENDANCE.length)} sub="Active"          icon={Users}     bg="bg-teal-50"   ic="text-teal-600"   />
        <KpiCard label="Avg Attendance"   value={`${avgAttendance}%`}             sub="Team average"    icon={UserCheck} bg="bg-green-50"  ic="text-green-600"  />
        <KpiCard label="Working Days"     value={String(totalDays)}               sub={month}           icon={Calendar}  bg="bg-blue-50"   ic="text-blue-600"   />
        <KpiCard label="Total Hours"      value={`${totalHours.toFixed(0)}h`}     sub="All staff"       icon={BarChart3} bg="bg-purple-50" ic="text-purple-600" />
      </div>

      <ChartCard title="Attendance % by Staff" sub={`Month: ${month}`}>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={STAFF_ATTENDANCE} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#94a3b8" }} tickLine={false} axisLine={false}
              tickFormatter={(v: string) => v.split(" ")[0]} />
            <YAxis domain={[0, 100]} tickFormatter={(v) => `${v}%`} tick={{ fontSize: 11, fill: "#94a3b8" }} tickLine={false} axisLine={false} />
            <Tooltip formatter={(v: any) => typeof v === "number" ? [`${v}%`, "Attendance"] : v} contentStyle={customTooltipStyle} cursor={{ fill: "#f8fafc" }} />
            <Bar dataKey="attendancePct" name="Attendance %" radius={[6, 6, 0, 0]}>
              {STAFF_ATTENDANCE.map((s, i) => (
                <Cell key={i} fill={s.attendancePct >= 80 ? CHART_COLORS.green : s.attendancePct >= 60 ? CHART_COLORS.amber : CHART_COLORS.red} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-100 bg-slate-50">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Staff Attendance Summary — {month}</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100">
                {["Staff ID","Name","Present","Absent","Total Hours","Avg Hrs/Day","Attendance %"].map((h) => (
                  <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {STAFF_ATTENDANCE.map((s) => (
                <tr key={s.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-3.5 font-mono text-xs text-slate-500">{s.id}</td>
                  <td className="px-5 py-3.5 font-semibold text-slate-800 whitespace-nowrap">{s.name}</td>
                  <td className="px-5 py-3.5">
                    <span className="px-2.5 py-0.5 rounded-full bg-green-50 text-green-700 text-xs font-semibold">{s.presentDays} days</span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${s.absentDays > 0 ? "bg-red-50 text-red-600" : "bg-slate-100 text-slate-400"}`}>
                      {s.absentDays} days
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-slate-700 tabular-nums font-semibold">{s.totalHours}h</td>
                  <td className="px-5 py-3.5 text-slate-600 tabular-nums">{s.avgHours}h</td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2">
                      <div className="w-20 bg-slate-100 rounded-full h-1.5">
                        <div
                          className={`h-1.5 rounded-full ${s.attendancePct >= 80 ? "bg-green-500" : s.attendancePct >= 60 ? "bg-amber-500" : "bg-red-500"}`}
                          style={{ width: `${s.attendancePct}%` }}
                        />
                      </div>
                      <span className={`text-xs font-bold ${s.attendancePct >= 80 ? "text-green-600" : s.attendancePct >= 60 ? "text-amber-600" : "text-red-600"}`}>
                        {s.attendancePct}%
                      </span>
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
function SalaryPaidReport() {
  const totalPaid    = SALARY_MONTHLY.reduce((t, m) => t + m.paid, 0);
  const totalPending = SALARY_MONTHLY.reduce((t, m) => t + m.pending, 0);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <KpiCard label="Total Paid YTD"   value={fmtK(totalPaid)}    sub="Jan–Apr 2026"         icon={IndianRupee}    bg="bg-green-50"  ic="text-green-600"  />
        <KpiCard label="Total Pending"    value={fmtK(totalPending)} sub="Apr 2026 pending"     icon={TrendingDown}   bg="bg-amber-50"  ic="text-amber-600"  />
        <KpiCard label="Staff Headcount"  value={String(SALARY_PAID.length)} sub="On payroll"   icon={Users}          bg="bg-blue-50"   ic="text-blue-600"   />
        <KpiCard label="Monthly Payroll"  value={fmtK(79000)}        sub="Apr 2026"             icon={BadgeDollarSign} bg="bg-purple-50" ic="text-purple-600"/>
      </div>

      <ChartCard title="Salary Paid vs Pending" sub="Monthly view">
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={SALARY_MONTHLY} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#94a3b8" }} tickLine={false} axisLine={false} />
            <YAxis tickFormatter={fmtK} tick={{ fontSize: 11, fill: "#94a3b8" }} tickLine={false} axisLine={false} />
            <Tooltip formatter={(v: any) => typeof v === "number" ? fmt(v) : v} contentStyle={customTooltipStyle} cursor={{ fill: "#f8fafc" }} />
            <Legend />
            <Bar dataKey="paid"    name="Paid"    fill={CHART_COLORS.green} radius={[4, 4, 0, 0]} />
            <Bar dataKey="pending" name="Pending" fill={CHART_COLORS.amber} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-100 bg-slate-50">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Staff-wise Salary Summary</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100">
                {["Staff ID","Name","Jan 2026","Feb 2026","Mar 2026","Paid Months","Pending Months","Total Paid"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {SALARY_PAID.map((s) => (
                <tr key={s.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3.5 font-mono text-xs text-slate-500">{s.id}</td>
                  <td className="px-4 py-3.5 font-semibold text-slate-800 whitespace-nowrap">{s.name}</td>
                  {[s.jan, s.feb, s.mar].map((v, i) => (
                    <td key={i} className="px-4 py-3.5 tabular-nums">
                      {v > 0
                        ? <span className="text-green-700 font-semibold">{fmt(v)}</span>
                        : <span className="text-red-400 text-xs font-semibold">Not Paid</span>
                      }
                    </td>
                  ))}
                  <td className="px-4 py-3.5">
                    <span className="px-2.5 py-0.5 rounded-full bg-green-50 text-green-700 text-xs font-semibold">{s.paidMonths} months</span>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${s.pendingMonths > 0 ? "bg-amber-50 text-amber-700" : "bg-slate-100 text-slate-400"}`}>
                      {s.pendingMonths} months
                    </span>
                  </td>
                  <td className="px-4 py-3.5 font-bold text-slate-900 tabular-nums">{fmt(s.jan + s.feb + s.mar)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-slate-50 border-t border-slate-200 font-bold">
                <td colSpan={2} className="px-4 py-3 text-slate-800">Total</td>
                {[
                  SALARY_PAID.reduce((t,s)=>t+s.jan,0),
                  SALARY_PAID.reduce((t,s)=>t+s.feb,0),
                  SALARY_PAID.reduce((t,s)=>t+s.mar,0),
                ].map((v, i) => (
                  <td key={i} className="px-4 py-3 text-slate-800 tabular-nums">{fmt(v)}</td>
                ))}
                <td colSpan={2} className="px-4 py-3"></td>
                <td className="px-4 py-3 text-green-700 tabular-nums">
                  {fmt(SALARY_PAID.reduce((t,s)=>t+s.jan+s.feb+s.mar,0))}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}

// ── 8. Stock History ────────────────────────────────────────────
function StockHistoryReport() {
  const [typeFilter, setTypeFilter]   = useState("All");
  const [catFilter, setCatFilter]     = useState("All");
  const [reasonFilter, setReasonFilter] = useState("All");

  const filtered = useMemo(() => {
    return STOCK_HISTORY.filter((h) => {
      const matchType   = typeFilter === "All"   || h.type === typeFilter;
      const matchCat    = catFilter === "All"    || h.category === catFilter;
      const matchReason = reasonFilter === "All" || h.reason === reasonFilter;
      return matchType && matchCat && matchReason;
    }).sort((a, b) => b.date.localeCompare(a.date));
  }, [typeFilter, catFilter, reasonFilter]);

  const totalIn  = STOCK_HISTORY.filter((h) => h.type === "IN").reduce((t, h) => t + h.qty, 0);
  const totalOut = STOCK_HISTORY.filter((h) => h.type === "OUT").reduce((t, h) => t + h.qty, 0);
  const totalCost= STOCK_HISTORY.filter((h) => h.type === "IN").reduce((t, h) => t + h.qty * h.price, 0);

  const stockInData = STOCK_HISTORY.filter((h) => h.type === "IN");
  const stockOutData= STOCK_HISTORY.filter((h) => h.type === "OUT");

  const stockFlow = Array.from(new Set(STOCK_HISTORY.map((h) => h.date))).sort().map((date) => ({
    date,
    in:  STOCK_HISTORY.filter((h) => h.date === date && h.type === "IN").reduce((t, h) => t + h.qty, 0),
    out: STOCK_HISTORY.filter((h) => h.date === date && h.type === "OUT").reduce((t, h) => t + h.qty, 0),
  }));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <KpiCard label="Total Records"  value={String(STOCK_HISTORY.length)} sub="All time"           icon={Package}      bg="bg-slate-100" ic="text-slate-600"  />
        <KpiCard label="Units Stocked"  value={String(totalIn)}              sub="Stock IN total"     icon={TrendingUp}   bg="bg-blue-50"   ic="text-blue-600"   />
        <KpiCard label="Units Removed"  value={String(totalOut)}             sub="Stock OUT total"    icon={TrendingDown} bg="bg-red-50"    ic="text-red-500"    />
        <KpiCard label="Purchase Cost"  value={fmtK(totalCost)}              sub="Total stock-in cost" icon={IndianRupee} bg="bg-green-50"  ic="text-green-600"  />
      </div>

      <ChartCard title="Stock Flow by Date" sub="IN vs OUT units">
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={stockFlow} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#94a3b8" }} tickLine={false} axisLine={false}
              tickFormatter={(v: string) => v.slice(5)} />
            <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} tickLine={false} axisLine={false} />
            <Tooltip contentStyle={customTooltipStyle} cursor={{ fill: "#f8fafc" }} />
            <Legend />
            <Bar dataKey="in"  name="Stock IN"  fill={CHART_COLORS.blue} radius={[4, 4, 0, 0]} />
            <Bar dataKey="out" name="Stock OUT" fill={CHART_COLORS.red}  radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        {[
          { label: "Type",     val: typeFilter,   set: setTypeFilter,   opts: ["All","IN","OUT"]                  },
          { label: "Category", val: catFilter,    set: setCatFilter,    opts: ["All","Electronics","Accessories","Furniture"] },
          { label: "Reason",   val: reasonFilter, set: setReasonFilter, opts: ["All","Sold","Damaged","Return",""]  },
        ].map(({ label, val, set, opts }) => (
          <div key={label} className="relative">
            <select value={val} onChange={(e) => set(e.target.value)}
              className={inputCls + " w-40 appearance-none pr-8 cursor-pointer"}>
              {opts.map((o) => <option key={o} value={o}>{o === "" ? "No Reason (IN)" : o}</option>)}
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          </div>
        ))}
        {(typeFilter !== "All" || catFilter !== "All" || reasonFilter !== "All") && (
          <button onClick={() => { setTypeFilter("All"); setCatFilter("All"); setReasonFilter("All"); }}
            className="flex items-center gap-1.5 h-9 px-3 rounded-lg border border-slate-200 bg-white text-sm text-red-500 hover:bg-red-50 transition-colors">
            <X size={14} /> Clear
          </button>
        )}
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 bg-slate-50">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Stock Movement Records</p>
          <span className="text-xs text-slate-400">{filtered.length} records</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100">
                {["ID","Product","Category","Type","Qty","Purchase Price","Total Value","Supplier","Reason","Date"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((h) => (
                <tr key={h.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3.5 font-mono text-xs text-slate-400">{h.id}</td>
                  <td className="px-4 py-3.5 font-semibold text-slate-800 whitespace-nowrap">{h.product}</td>
                  <td className="px-4 py-3.5 text-slate-500 whitespace-nowrap">{h.category}</td>
                  <td className="px-4 py-3.5">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${h.type === "IN" ? "bg-blue-50 text-blue-700" : "bg-red-50 text-red-600"}`}>
                      {h.type === "IN" ? "+" : "−"} {h.type}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 font-bold tabular-nums">
                    <span className={h.type === "IN" ? "text-blue-700" : "text-red-600"}>{h.qty}</span>
                  </td>
                  <td className="px-4 py-3.5 text-slate-600 tabular-nums">{h.price > 0 ? fmt(h.price) : "—"}</td>
                  <td className="px-4 py-3.5 font-semibold text-slate-800 tabular-nums">
                    {h.price > 0 ? fmt(h.qty * h.price) : "—"}
                  </td>
                  <td className="px-4 py-3.5 text-slate-500 text-xs whitespace-nowrap">{h.supplier || "—"}</td>
                  <td className="px-4 py-3.5">
                    {h.reason
                      ? <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                          h.reason === "Sold" ? "bg-blue-50 text-blue-700"
                          : h.reason === "Damaged" ? "bg-red-50 text-red-600"
                          : "bg-purple-50 text-purple-700"}`}>{h.reason}</span>
                      : <span className="text-slate-300">—</span>}
                  </td>
                  <td className="px-4 py-3.5 text-slate-400 text-xs whitespace-nowrap">{h.date}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-slate-50 border-t border-slate-200 font-bold">
                <td colSpan={4} className="px-4 py-3 text-slate-700">Total ({filtered.length})</td>
                <td className="px-4 py-3 text-slate-800 tabular-nums">{filtered.reduce((t, h) => t + h.qty, 0)}</td>
                <td className="px-4 py-3"></td>
                <td className="px-4 py-3 text-green-700 tabular-nums">{fmt(filtered.filter((h)=>h.price>0).reduce((t,h)=>t+h.qty*h.price,0))}</td>
                <td colSpan={3}></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// MAIN PAGE
// ═══════════════════════════════════════════════════════════════

export default function ReportsPage() {
  const [active, setActive]     = useState<ReportType>("daily-sales");
  const [month, setMonth]       = useState("2026-04");
  const printRef                = useRef<HTMLDivElement>(null);

  const activeReport = REPORTS.find((r) => r.key === active)!;

  function handlePrint() {
    const content = printRef.current;
    if (!content) return;
    const printWin = window.open("", "_blank", "width=1100,height=800");
    if (!printWin) return;
    printWin.document.write(`
      <html>
        <head>
          <title>${activeReport.label} — Apr 2026</title>
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
    const table = tables[tables.length - 1]; // last table = detailed data table
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

  return (
    <div className="space-y-6">

      {/* ── Page Header ── */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Reports</h1>
          <p className="text-sm text-slate-500 mt-0.5">Super Admin — All reports & analytics</p>
        </div>
        <div className="flex items-center gap-2">
          {/* Month Picker */}
          <div className="flex items-center gap-2 h-9 px-3 rounded-lg border border-slate-200 bg-white">
            <Calendar size={14} className="text-slate-400" />
            <input type="month" value={month} onChange={(e) => setMonth(e.target.value)}
              className="text-sm text-slate-700 outline-none bg-transparent" />
          </div>
          {/* Export CSV */}
          <button onClick={handleExportCSV}
            className="flex items-center gap-2 h-9 px-4 rounded-lg border border-slate-200 bg-white text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-green-600 transition-colors">
            <Download size={15} /> Export CSV
          </button>
          {/* Print */}
          <button onClick={handlePrint}
            className="flex items-center gap-2 h-9 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 text-sm font-semibold text-white transition-colors shadow-sm shadow-blue-200">
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
                        ? "bg-blue-50 text-blue-700"
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                    }`}
                  >
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                      active === r.key ? r.bg : "bg-slate-100"
                    }`}>
                      <Icon className={`w-3.5 h-3.5 ${active === r.key ? r.color : "text-slate-400"}`} />
                    </div>
                    <span className={`text-xs font-semibold leading-tight ${active === r.key ? "text-blue-700" : "text-slate-600"}`}>
                      {r.label}
                    </span>
                    {active === r.key && (
                      <div className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-600" />
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
                {fmtMonth(month)} &nbsp;·&nbsp; Super Admin View
              </p>
            </div>
          </div>

          {/* Printable Content */}
          <div ref={printRef}>
            {active === "daily-sales"       && <DailySalesReport month={fmtMonth(month)} />}
            {active === "monthly-sales"     && <MonthlySalesReport />}
            {active === "profit"            && <ProfitReport />}
            {active === "gst"               && <GstReport />}
            {active === "customer-purchase" && <CustomerPurchaseReport />}
            {active === "staff-attendance"  && <StaffAttendanceReport month={fmtMonth(month)} />}
            {active === "salary-paid"       && <SalaryPaidReport />}
            {active === "stock-history"     && <StockHistoryReport />}
          </div>
        </div>
      </div>
    </div>
  );
}