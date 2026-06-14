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
import { useTheme } from "@/components/ThemeProvider";

// ─── Palette (SaaS Exact) ──────────────────────────────────────────────────
const C = {
  primary: "#A05AFF",
  primaryMuted: "rgba(160, 90, 255, 0.2)",
  mint: "#1BCFB4",
  blue: "#4BCBEB",
  coral: "#FE9496",
  warning: "#FFD166",
  grid: "#ECE8F3",
  textPrimary: "#2C2C34",
  textMuted: "#8C8A95",
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
    <div className="bg-surface rounded-xl shadow-lg px-4 py-3 text-sm border border-border">
      <p className="font-semibold text-text-primary mb-2">{label}</p>
      {payload.map((p) => (
        <div key={p.name} className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full" style={{ background: p.color }} />
          <span className="text-text-muted capitalize">{p.name}:</span>
          <span className="font-bold text-text-primary">
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
    <div className="bg-surface rounded-xl shadow-lg px-4 py-3 text-sm border border-border">
      <p className="font-semibold text-text-primary mb-2">{label}</p>
      {payload.map((p) => (
        <div key={p.name} className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full" style={{ background: p.color }} />
          <span className="text-text-muted capitalize">{p.name}:</span>
          <span className="font-bold text-text-primary">{p.value} units</span>
        </div>
      ))}
    </div>
  );
}

// ─── Shared axis tick style ──────────────────────────────────────────────────────
const tickStyle = { fontSize: 11, fill: C.textMuted };

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
    <div className="glass-card p-5 flex flex-col gap-4 relative overflow-hidden transition-all duration-300">
      <div className="flex items-start justify-between gap-3 relative z-10">
        <div>
          <h2 className="text-sm font-bold text-text-primary">{title}</h2>
          {subtitle && <p className="text-xs text-text-muted mt-0.5">{subtitle}</p>}
        </div>
        {action}
      </div>
      <div className="relative z-10">{children}</div>
    </div>
  );
}

// ─── Page ───────────────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const { theme } = useTheme();
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
        console.warn("Failed to fetch dashboard data, using mock data for UI visualization.");
        // Fallback to mock data for UI viewing
        setSummary({
          today_sales: 45200,
          today_profit: 12500,
          total_products: 342,
          low_stock_count: 12,
          staff_present: 4,
          staff_total: 5,
          this_month_sales: 1250000,
          last_month_sales: 1100000,
          avg_margin: 28
        });

        setDailySalesData(Array.from({ length: 14 }).map((_, i) => ({
          day: `Day ${i + 1}`,
          sales: Math.floor(Math.random() * 50000) + 10000,
          profit: Math.floor(Math.random() * 15000) + 3000
        })));

        setMonthlySalesData(["Jan", "Feb", "Mar", "Apr", "May", "Jun"].map(month => ({
          month,
          sales: Math.floor(Math.random() * 800000) + 400000,
          profit: Math.floor(Math.random() * 200000) + 100000
        })));

        setStockData([
          { name: "Premium T-Shirt", stock: 120, reorderAt: 20 },
          { name: "Denim Jeans", stock: 15, reorderAt: 20 },
          { name: "Cotton Kurta", stock: 0, reorderAt: 10 },
          { name: "Summer Shorts", stock: 45, reorderAt: 15 },
          { name: "Winter Jacket", stock: 5, reorderAt: 10 }
        ]);

        setAttendanceData([]);
        setGstSummary({ history: [], ytd_collected: 0 });
      } finally {
        setLoading(false);
      }
    }
    fetchDashboardData();
  }, []);

  const isEnterprise = theme === "enterprise";

  const stats = isEnterprise ? [
    { label: "Today's Revenue", value: `₹${summary.today_sales.toLocaleString()}`, sub: "Increased by 60%", icon: BadgeIndianRupee, iconColor: "text-primary", iconBg: "bg-primary-light", cardStyle: { background: "var(--surface)" }, cardBorder: "border-border shadow-sm border" },
    { label: "Today's Profit", value: `₹${summary.today_profit.toLocaleString()}`, sub: "Decreased by 10%", icon: TrendingUp, iconColor: "text-primary", iconBg: "bg-primary-light", cardStyle: { background: "var(--surface)" }, cardBorder: "border-border shadow-sm border" },
    { label: "Visitors Online", value: "95,574", sub: "Increased by 5%", icon: Users, iconColor: "text-primary", iconBg: "bg-primary-light", cardStyle: { background: "var(--surface)" }, cardBorder: "border-border shadow-sm border" },
    { label: "Total Stock", value: summary.total_products.toString(), sub: "Active stock items", icon: Package, iconColor: "text-primary", iconBg: "bg-primary-light", cardStyle: { background: "var(--surface)" }, cardBorder: "border-border shadow-sm border" },
  ] : [
    { label: "Today's Revenue", value: `₹${summary.today_sales.toLocaleString()}`, sub: "Increased by 60%", icon: BadgeIndianRupee, iconColor: "text-white", iconBg: "bg-white/20", cardStyle: { background: "linear-gradient(135deg, rgba(254, 148, 150, 0.9), rgba(255, 179, 180, 0.7))" }, cardBorder: "border-white/40 shadow-lg shadow-[#FE9496]/20" },
    { label: "Today's Profit", value: `₹${summary.today_profit.toLocaleString()}`, sub: "Decreased by 10%", icon: TrendingUp, iconColor: "text-white", iconBg: "bg-white/20", cardStyle: { background: "linear-gradient(135deg, rgba(75, 203, 235, 0.9), rgba(133, 224, 245, 0.7))" }, cardBorder: "border-white/40 shadow-lg shadow-[#4BCBEB]/20" },
    { label: "Visitors Online", value: "95,574", sub: "Increased by 5%", icon: Users, iconColor: "text-white", iconBg: "bg-white/20", cardStyle: { background: "linear-gradient(135deg, rgba(27, 207, 180, 0.9), rgba(91, 224, 199, 0.7))" }, cardBorder: "border-white/40 shadow-lg shadow-[#1BCFB4]/20" },
    { label: "Total Stock", value: summary.total_products.toString(), sub: "Active stock items", icon: Package, iconColor: "text-white", iconBg: "bg-white/20", cardStyle: { background: "linear-gradient(135deg, rgba(160, 90, 255, 0.9), rgba(182, 109, 255, 0.7))" }, cardBorder: "border-white/40 shadow-lg shadow-[#A05AFF]/20" },
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

  // Stock bar colors: Use Coral for OOS/Low, Mint for OK
  const stockBarColors = stockData.map((item) =>
    item.stock === 0
      ? C.coral
      : item.stock <= item.reorderAt
        ? C.warning
        : C.mint
  );

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm font-medium text-text-muted">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* ── Page Header ── */}
      <div>
        <h1 className="text-2xl font-bold text-text-primary tracking-tight">Dashboard Overview</h1>
        <p className="text-sm text-text-muted mt-1">Analytics and key metrics at a glance</p>
      </div>

      {/* ── Summary Stats ── */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className={`glass-card p-5 ${s.cardBorder} relative overflow-hidden group`} style={s.cardStyle}>
            {/* Exact overlapping circle patterns from screenshot */}
            <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full bg-white/10 blur-[1px] group-hover:scale-110 transition-transform" />
            <div className="absolute -right-8 top-12 w-32 h-32 rounded-full bg-white/10 blur-[1px] group-hover:scale-110 transition-transform" />
            
            <div className={`inline-flex items-center justify-center w-10 h-10 rounded-xl ${s.iconBg} mb-4 relative z-10`}>
              <s.icon className={`w-5 h-5 ${s.iconColor}`} />
            </div>
            <p className="text-3xl font-bold text-white relative z-10">{s.value}</p>
            <p className="text-sm font-semibold text-white/90 mt-1 relative z-10">{s.label}</p>
            <p className="text-xs text-white/80 mt-0.5 relative z-10">{s.sub}</p>
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
          <div className="relative group">
            <select
              value={salesView}
              onChange={(e) => setSalesView(e.target.value as "daily" | "monthly")}
              className="h-8 pl-3 pr-8 rounded-md border border-border bg-surface text-xs font-semibold text-text-primary outline-none focus:border-primary appearance-none cursor-pointer hover:bg-gray-50 transition-colors"
            >
              <option value="daily">Daily</option>
              <option value="monthly">Monthly</option>
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted pointer-events-none group-hover:text-primary transition-colors" />
          </div>
        }
      >
        <ResponsiveContainer width="100%" height={260}>
          <AreaChart data={salesChartData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="gradSales" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={C.primary} stopOpacity={0.2} />
                <stop offset="95%" stopColor={C.primary} stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gradProfit" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={C.blue} stopOpacity={0.2} />
                <stop offset="95%" stopColor={C.blue} stopOpacity={0} />
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
            <Tooltip content={<ChartTooltip />} cursor={{ stroke: '#ECE8F3', strokeWidth: 1, strokeDasharray: '4 4' }} />
            <Legend
              wrapperStyle={{ fontSize: "12px", paddingTop: "12px" }}
              formatter={(v: string) => <span className="text-text-muted capitalize">{v}</span>}
            />
            <Area
              type="monotone"
              dataKey="sales"
              name="Sales"
              stroke={C.primary}
              strokeWidth={3}
              fill="url(#gradSales)"
              dot={{ r: 0 }}
              activeDot={{ r: 5, fill: C.primary, stroke: '#fff', strokeWidth: 2 }}
            />
            <Area
              type="monotone"
              dataKey="sales"
              name="Sales"
              stroke={C.primary}
              strokeWidth={3}
              fill="url(#gradSales)"
              dot={{ r: 0 }}
              activeDot={{ r: 5, fill: C.primary, stroke: '#fff', strokeWidth: 2 }}
            />
            <Area
              type="monotone"
              dataKey="profit"
              name="Profit"
              stroke={C.coral}
              strokeWidth={3}
              fill="url(#gradProfit)"
              dot={{ r: 0 }}
              activeDot={{ r: 5, fill: C.coral, stroke: '#fff', strokeWidth: 2 }}
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
              <Tooltip content={<ChartTooltip />} cursor={{ fill: "rgba(0,0,0,0.02)" }} />
              <Bar
                dataKey="profit"
                name="Profit"
                fill={C.blue}
                radius={[4, 4, 0, 0]}
              />
              <Bar
                dataKey="sales"
                name="Sales"
                fill={C.primary}
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>

          {/* Profit Metrics */}
          <div className="grid grid-cols-3 gap-3 pt-4 border-t border-border mt-2">
            {[
              { label: "This Month", value: `₹${(summary.this_month_sales || 0).toLocaleString("en-IN")}` },
              { label: "Last Month", value: `₹${(summary.last_month_sales || 0).toLocaleString("en-IN")}` },
              { label: "Avg Margin", value: `${summary.avg_margin || 0}%` },
            ].map((m) => (
              <div key={m.label} className="text-center">
                <p className="text-xs text-text-muted">{m.label}</p>
                <p className="text-sm font-bold text-text-primary mt-0.5">{m.value}</p>
              </div>
            ))}
          </div>
        </ChartCard>

        {/* Stock Overview */}
        <ChartCard
          title="Stock Overview"
          subtitle="Current units per product"
          action={
            <div className="flex items-center gap-3 text-xs text-text-muted">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-mint inline-block" /> OK</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-warning inline-block" /> Low</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-coral inline-block" /> OOS</span>
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
              <Tooltip content={<StockTooltip />} cursor={{ fill: "rgba(0,0,0,0.02)" }} />
              <Bar dataKey="stock" name="Stock" radius={[0, 4, 4, 0]}>
                {stockData.map((_, i) => (
                  <Cell key={i} fill={stockBarColors[i]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>

          {/* Stock Alerts */}
          <div className="grid grid-cols-3 gap-3 pt-4 border-t border-border mt-2">
            {[
              { label: "In Stock", value: stockData.filter((s) => s.stock > s.reorderAt).length, color: "text-mint" },
              { label: "Low Stock", value: stockData.filter((s) => s.stock > 0 && s.stock <= s.reorderAt).length, color: "text-warning" },
              { label: "Out of Stock", value: stockData.filter((s) => s.stock === 0).length, color: "text-coral" },
            ].map((m) => (
              <div key={m.label} className="text-center">
                <p className={`text-lg font-bold ${m.color}`}>{m.value}</p>
                <p className="text-xs text-text-muted mt-0.5">{m.label}</p>
              </div>
            ))}
          </div>
        </ChartCard>
      </div>

      {/* Enterprise Data Dense Tables */}
      {isEnterprise && (
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartCard title="Recent Orders" subtitle="Latest transactions across all stores">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-text-secondary border-collapse">
                <thead className="bg-surface sticky top-0 border-b border-border text-xs uppercase tracking-wider text-text-primary">
                  <tr>
                    <th className="py-3 px-4 font-bold">Order ID</th>
                    <th className="py-3 px-4 font-bold">Customer</th>
                    <th className="py-3 px-4 font-bold text-right">Amount</th>
                    <th className="py-3 px-4 font-bold text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {[
                    { id: "#ORD-901", customer: "Rahul S.", amount: "₹4,200", status: "Completed", color: "bg-mint-light text-mint" },
                    { id: "#ORD-902", customer: "Vikram P.", amount: "₹1,550", status: "Processing", color: "bg-warning/10 text-warning" },
                    { id: "#ORD-903", customer: "Aisha K.", amount: "₹8,900", status: "Completed", color: "bg-mint-light text-mint" },
                    { id: "#ORD-904", customer: "Neha M.", amount: "₹3,400", status: "Pending", color: "bg-coral-light text-coral" },
                  ].map((order) => (
                    <tr key={order.id} className="hover:bg-primary-light transition-colors">
                      <td className="py-3 px-4 font-mono font-medium text-text-primary">{order.id}</td>
                      <td className="py-3 px-4 text-text-primary">{order.customer}</td>
                      <td className="py-3 px-4 text-right font-bold text-text-primary">{order.amount}</td>
                      <td className="py-3 px-4 text-center">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${order.color}`}>
                          {order.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </ChartCard>

          <ChartCard title="Stock Alerts" subtitle="Items requiring immediate attention">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-text-secondary border-collapse">
                <thead className="bg-surface sticky top-0 border-b border-border text-xs uppercase tracking-wider text-text-primary">
                  <tr>
                    <th className="py-3 px-4 font-bold">Product Name</th>
                    <th className="py-3 px-4 font-bold text-right">Stock</th>
                    <th className="py-3 px-4 font-bold text-right">Reorder At</th>
                    <th className="py-3 px-4 font-bold text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {stockData.filter(s => s.stock <= s.reorderAt).map((item, i) => {
                    const isOos = item.stock === 0;
                    return (
                      <tr key={i} className="hover:bg-primary-light transition-colors">
                        <td className="py-3 px-4 text-text-primary font-medium">{item.name}</td>
                        <td className={`py-3 px-4 text-right font-bold ${isOos ? 'text-coral' : 'text-warning'}`}>{item.stock}</td>
                        <td className="py-3 px-4 text-right text-text-muted">{item.reorderAt}</td>
                        <td className="py-3 px-4 text-center">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${isOos ? 'bg-coral-light text-coral' : 'bg-warning/10 text-warning'}`}>
                            {isOos ? 'Out of Stock' : 'Low Stock'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </ChartCard>
        </div>
      )}
    </div>
  );
}