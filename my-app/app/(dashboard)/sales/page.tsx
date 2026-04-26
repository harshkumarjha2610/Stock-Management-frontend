"use client";

import { useState, useMemo } from "react";
import {
  Search, TrendingUp, ShoppingBag, BadgeIndianRupee,
  CalendarDays, ChevronDown, X, Printer, Eye,
} from "lucide-react";

// ─── Types ─────────────────────────────────────────────────────────────────────
type PaymentMethod = "Cash" | "UPI" | "Card";
type FilterTab     = "All" | "Day" | "Month" | "Customer" | "Product";

type SaleItem = {
  productId:   string;
  productName: string;
  quantity:    number;
  rate:        number;
  gstPercent:  number;
  gstAmount:   number;
  total:       number;
};

type Sale = {
  invoiceNumber:  string;
  customerName:   string;
  customerPhone:  string;
  items:          SaleItem[];
  subTotal:       number;
  gstAmount:      number;
  discount:       number;
  finalTotal:     number;
  paymentMethod:  PaymentMethod;
  createdAt:      string; // "YYYY-MM-DD"
};

// ─── Mock Sales Data ────────────────────────────────────────────────────────────
const allSales: Sale[] = [
  {
    invoiceNumber: "INV-2604-1001", customerName: "Ravi Shankar",  customerPhone: "9876543210",
    items: [
      { productId: "PRD-001", productName: "Wireless Keyboard",  quantity: 2, rate: 1299, gstPercent: 18, gstAmount: 467,  total: 3065 },
      { productId: "PRD-005", productName: "Laptop Sleeve 15\"", quantity: 1, rate: 599,  gstPercent: 12, gstAmount: 72,   total: 671  },
    ],
    subTotal: 3197, gstAmount: 539,  discount: 100, finalTotal: 3636, paymentMethod: "UPI",  createdAt: "2026-04-15",
  },
  {
    invoiceNumber: "INV-2604-1002", customerName: "Priya Mehta",   customerPhone: "8765432109",
    items: [
      { productId: "PRD-007", productName: "Webcam 1080p",         quantity: 1, rate: 3299, gstPercent: 18, gstAmount: 594,  total: 3893 },
    ],
    subTotal: 3299, gstAmount: 594,  discount: 0,   finalTotal: 3893, paymentMethod: "Card", createdAt: "2026-04-15",
  },
  {
    invoiceNumber: "INV-2604-1003", customerName: "Arjun Das",     customerPhone: "7654321098",
    items: [
      { productId: "PRD-003", productName: "Monitor Stand",        quantity: 1, rate: 2499, gstPercent: 12, gstAmount: 300,  total: 2799 },
      { productId: "PRD-006", productName: "HDMI Cable 2m",        quantity: 2, rate: 299,  gstPercent: 18, gstAmount: 108,  total: 706  },
    ],
    subTotal: 3097, gstAmount: 408,  discount: 200, finalTotal: 3305, paymentMethod: "Cash", createdAt: "2026-04-14",
  },
  {
    invoiceNumber: "INV-2604-1004", customerName: "Sneha Nair",    customerPhone: "6543210987",
    items: [
      { productId: "PRD-002", productName: "USB-C Hub 7-in-1",     quantity: 3, rate: 999,  gstPercent: 18, gstAmount: 540,  total: 3537 },
    ],
    subTotal: 2997, gstAmount: 540,  discount: 0,   finalTotal: 3537, paymentMethod: "UPI",  createdAt: "2026-04-14",
  },
  {
    invoiceNumber: "INV-2604-1005", customerName: "Vikram Singh",  customerPhone: "5432109876",
    items: [
      { productId: "PRD-008", productName: "Desk Organizer",       quantity: 2, rate: 749,  gstPercent: 12, gstAmount: 180,  total: 1678 },
      { productId: "PRD-001", productName: "Wireless Keyboard",    quantity: 1, rate: 1299, gstPercent: 18, gstAmount: 234,  total: 1533 },
    ],
    subTotal: 3797, gstAmount: 414,  discount: 150, finalTotal: 3477 , paymentMethod: "Cash", createdAt: "2026-04-13",
  },
  {
    invoiceNumber: "INV-2604-1006", customerName: "Meena Pillai",  customerPhone: "4321098765",
    items: [
      { productId: "PRD-007", productName: "Webcam 1080p",         quantity: 2, rate: 3299, gstPercent: 18, gstAmount: 1188, total: 7786 },
    ],
    subTotal: 6598, gstAmount: 1188, discount: 300, finalTotal: 7486, paymentMethod: "Card", createdAt: "2026-04-13",
  },
  {
    invoiceNumber: "INV-2603-1007", customerName: "Ravi Shankar",  customerPhone: "9876543210",
    items: [
      { productId: "PRD-005", productName: "Laptop Sleeve 15\"",   quantity: 2, rate: 599,  gstPercent: 12, gstAmount: 144,  total: 1342 },
    ],
    subTotal: 1198, gstAmount: 144,  discount: 0,   finalTotal: 1342, paymentMethod: "Cash", createdAt: "2026-03-28",
  },
  {
    invoiceNumber: "INV-2603-1008", customerName: "Priya Mehta",   customerPhone: "8765432109",
    items: [
      { productId: "PRD-003", productName: "Monitor Stand",        quantity: 2, rate: 2499, gstPercent: 12, gstAmount: 600,  total: 5598 },
    ],
    subTotal: 4998, gstAmount: 600,  discount: 200, finalTotal: 5398, paymentMethod: "UPI",  createdAt: "2026-03-22",
  },
  {
    invoiceNumber: "INV-2603-1009", customerName: "Arjun Das",     customerPhone: "7654321098",
    items: [
      { productId: "PRD-001", productName: "Wireless Keyboard",    quantity: 3, rate: 1299, gstPercent: 18, gstAmount: 701,  total: 4598 },
      { productId: "PRD-002", productName: "USB-C Hub 7-in-1",     quantity: 2, rate: 999,  gstPercent: 18, gstAmount: 360,  total: 2358 },
    ],
    subTotal: 6895, gstAmount: 1061, discount: 500, finalTotal: 7456, paymentMethod: "Card", createdAt: "2026-03-15",
  },
];

// ─── Helpers ────────────────────────────────────────────────────────────────────
function fmt(n: number) {
  return "₹" + n.toLocaleString("en-IN", { maximumFractionDigits: 2 });
}

const pmColor: Record<PaymentMethod, string> = {
  Cash: "bg-green-50 text-green-700",
  UPI:  "bg-blue-50 text-blue-700",
  Card: "bg-purple-50 text-purple-700",
};

const tabs: FilterTab[] = ["All", "Day", "Month", "Customer", "Product"];

// ─── Main Component ─────────────────────────────────────────────────────────────
export default function SalesPage() {
  const [search, setSearch]             = useState("");
  const [activeTab, setActiveTab]       = useState<FilterTab>("All");
  const [dateFrom, setDateFrom]         = useState("");
  const [dateTo, setDateTo]             = useState("");
  const [pmFilter, setPmFilter]         = useState("All");
  const [viewSale, setViewSale]         = useState<Sale | null>(null);

  // ── Filtered Sales ──
  const filtered = useMemo(() => {
    return allSales.filter((s) => {
      const q = search.toLowerCase();
      const matchSearch =
        s.invoiceNumber.toLowerCase().includes(q)  ||
        s.customerName.toLowerCase().includes(q)   ||
        s.customerPhone.includes(q)                ||
        s.items.some((i) => i.productName.toLowerCase().includes(q));

      const matchPm   = pmFilter === "All" || s.paymentMethod === pmFilter;
      const matchFrom = !dateFrom || s.createdAt >= dateFrom;
      const matchTo   = !dateTo   || s.createdAt <= dateTo;

      return matchSearch && matchPm && matchFrom && matchTo;
    });
  }, [search, pmFilter, dateFrom, dateTo]);

  // ── Summary Stats (on filtered) ──
  const totalRevenue  = filtered.reduce((s, b) => s + b.finalTotal, 0);
  const totalGST      = filtered.reduce((s, b) => s + b.gstAmount, 0);
  const totalDiscount = filtered.reduce((s, b) => s + b.discount, 0);
  const totalBills    = filtered.length;

  // ── Day-wise Breakdown ──
  const dayWise = useMemo(() => {
    const map: Record<string, { date: string; bills: number; revenue: number; gst: number }> = {};
    filtered.forEach((s) => {
      if (!map[s.createdAt]) map[s.createdAt] = { date: s.createdAt, bills: 0, revenue: 0, gst: 0 };
      map[s.createdAt].bills++;
      map[s.createdAt].revenue += s.finalTotal;
      map[s.createdAt].gst     += s.gstAmount;
    });
    return Object.values(map).sort((a, b) => b.date.localeCompare(a.date));
  }, [filtered]);

  // ── Month-wise Breakdown ──
  const monthWise = useMemo(() => {
    const map: Record<string, { month: string; bills: number; revenue: number; gst: number }> = {};
    filtered.forEach((s) => {
      const month = s.createdAt.slice(0, 7); // "YYYY-MM"
      if (!map[month]) map[month] = { month, bills: 0, revenue: 0, gst: 0 };
      map[month].bills++;
      map[month].revenue += s.finalTotal;
      map[month].gst     += s.gstAmount;
    });
    return Object.values(map).sort((a, b) => b.month.localeCompare(a.month));
  }, [filtered]);

  // ── Customer-wise Breakdown ──
  const customerWise = useMemo(() => {
    const map: Record<string, { name: string; phone: string; bills: number; spent: number }> = {};
    filtered.forEach((s) => {
      const key = s.customerPhone || s.customerName;
      if (!map[key]) map[key] = { name: s.customerName, phone: s.customerPhone, bills: 0, spent: 0 };
      map[key].bills++;
      map[key].spent += s.finalTotal;
    });
    return Object.values(map).sort((a, b) => b.spent - a.spent);
  }, [filtered]);

  // ── Product-wise Breakdown ──
  const productWise = useMemo(() => {
    const map: Record<string, { productId: string; name: string; qtySold: number; revenue: number; gst: number }> = {};
    filtered.forEach((s) =>
      s.items.forEach((item) => {
        if (!map[item.productId])
          map[item.productId] = { productId: item.productId, name: item.productName, qtySold: 0, revenue: 0, gst: 0 };
        map[item.productId].qtySold  += item.quantity;
        map[item.productId].revenue  += item.total;
        map[item.productId].gst      += item.gstAmount;
      })
    );
    return Object.values(map).sort((a, b) => b.revenue - a.revenue);
  }, [filtered]);

  function clearFilters() {
    setSearch(""); setDateFrom(""); setDateTo(""); setPmFilter("All");
  }

  const hasFilters = search || dateFrom || dateTo || pmFilter !== "All";

  return (
    <div className="space-y-6">

      {/* ── Page Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Sales Report</h1>
          <p className="text-sm text-slate-500 mt-0.5">Track revenue, GST, and customer purchases</p>
        </div>
      </div>

      {/* ── Summary Cards ── */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {[
          { label: "Total Revenue",   value: fmt(totalRevenue),  icon: BadgeIndianRupee, bg: "bg-blue-50",   iconColor: "text-blue-600"  },
          { label: "Total Invoices",  value: totalBills,          icon: ShoppingBag,      bg: "bg-green-50",  iconColor: "text-green-600" },
          { label: "Total GST",       value: fmt(totalGST),       icon: TrendingUp,       bg: "bg-purple-50", iconColor: "text-purple-600"},
          { label: "Total Discounts", value: fmt(totalDiscount),  icon: CalendarDays,     bg: "bg-amber-50",  iconColor: "text-amber-600" },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-xl border border-slate-200 p-5">
            <div className={`inline-flex items-center justify-center w-9 h-9 rounded-lg ${s.bg} mb-3`}>
              <s.icon className={`w-4 h-4 ${s.iconColor}`} />
            </div>
            <p className="text-2xl font-bold text-slate-900">{s.value}</p>
            <p className="text-xs text-slate-500 mt-0.5 font-medium">{s.label}</p>
          </div>
        ))}
      </div>

      {/* ── Filters ── */}
      <div className="bg-white rounded-xl border border-slate-200 p-4">
        <div className="flex flex-col sm:flex-row gap-3">

          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by invoice, customer, product…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={inputCls + " pl-9"}
            />
          </div>

          {/* Date From */}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide px-1">From</label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className={inputCls + " w-40"}
            />
          </div>

          {/* Date To */}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide px-1">To</label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className={inputCls + " w-40"}
            />
          </div>

          {/* Payment Method */}
          <div className="relative self-end">
            <select
              value={pmFilter}
              onChange={(e) => setPmFilter(e.target.value)}
              className={inputCls + " w-36 appearance-none pr-8 cursor-pointer"}
            >
              {["All", "Cash", "UPI", "Card"].map((m) => (
                <option key={m}>{m}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          </div>

          {/* Clear Filters */}
          {hasFilters && (
            <button
              onClick={clearFilters}
              className="self-end flex items-center gap-1.5 h-10 px-4 rounded-lg border border-slate-200 text-sm font-medium text-slate-500 hover:bg-slate-50 hover:text-red-500 transition-colors whitespace-nowrap"
            >
              <X size={14} />
              Clear
            </button>
          )}
        </div>
      </div>

      {/* ── View Tabs ── */}
      <div className="flex gap-1 bg-slate-100 rounded-xl p-1 w-fit">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              activeTab === tab
                ? "bg-white text-blue-600 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            {tab === "All"      && "All Invoices"}
            {tab === "Day"      && "Day-wise"}
            {tab === "Month"    && "Monthly"}
            {tab === "Customer" && "By Customer"}
            {tab === "Product"  && "By Product"}
          </button>
        ))}
      </div>

      {/* ════════════════════════════════════════════════════
          TAB: ALL INVOICES
      ════════════════════════════════════════════════════ */}
      {activeTab === "All" && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  {["Invoice No", "Customer", "Phone", "Items", "Subtotal", "GST", "Discount", "Total", "Payment", "Date", ""].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wide whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={11} className="px-4 py-14 text-center">
                      <div className="flex flex-col items-center gap-2 text-slate-400">
                        <TrendingUp size={32} className="text-slate-300" />
                        <p className="text-sm font-medium">No sales found</p>
                        <p className="text-xs">Try adjusting your filters</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filtered.map((sale) => (
                    <tr key={sale.invoiceNumber} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3.5 font-mono text-xs text-blue-600 font-semibold whitespace-nowrap">
                        {sale.invoiceNumber}
                      </td>
                      <td className="px-4 py-3.5 font-medium text-slate-800 whitespace-nowrap">{sale.customerName}</td>
                      <td className="px-4 py-3.5 text-slate-500 whitespace-nowrap">{sale.customerPhone || "—"}</td>
                      <td className="px-4 py-3.5 text-slate-600">{sale.items.length}</td>
                      <td className="px-4 py-3.5 text-slate-600 whitespace-nowrap">{fmt(sale.subTotal)}</td>
                      <td className="px-4 py-3.5 text-slate-600 whitespace-nowrap">{fmt(sale.gstAmount)}</td>
                      <td className="px-4 py-3.5 text-green-600 whitespace-nowrap">
                        {sale.discount > 0 ? `− ${fmt(sale.discount)}` : "—"}
                      </td>
                      <td className="px-4 py-3.5 font-bold text-slate-900 whitespace-nowrap">{fmt(sale.finalTotal)}</td>
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${pmColor[sale.paymentMethod]}`}>
                          {sale.paymentMethod}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-slate-400 text-xs whitespace-nowrap">{sale.createdAt}</td>
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <button
                          onClick={() => setViewSale(sale)}
                          className="flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-800 transition-colors"
                        >
                          <Eye size={13} /> View
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          {filtered.length > 0 && (
            <div className="px-4 py-3 border-t border-slate-100 bg-slate-50 flex justify-between items-center">
              <p className="text-xs text-slate-400">
                Showing <span className="font-semibold text-slate-600">{filtered.length}</span> of{" "}
                <span className="font-semibold text-slate-600">{allSales.length}</span> invoices
              </p>
              <p className="text-xs font-semibold text-slate-600">
                Total: <span className="text-blue-600">{fmt(totalRevenue)}</span>
              </p>
            </div>
          )}
        </div>
      )}

      {/* ════════════════════════════════════════════════════
          TAB: DAY-WISE
      ════════════════════════════════════════════════════ */}
      {activeTab === "Day" && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  {["Date", "Total Bills", "GST Collected", "Revenue"].map((h) => (
                    <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wide">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {dayWise.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-5 py-14 text-center text-sm text-slate-400">No data for selected filters</td>
                  </tr>
                ) : (
                  dayWise.map((d) => (
                    <tr key={d.date} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                      <td className="px-5 py-3.5 font-medium text-slate-800">{d.date}</td>
                      <td className="px-5 py-3.5 text-slate-600">
                        <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold">
                          {d.bills} bill{d.bills !== 1 && "s"}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-slate-600">{fmt(d.gst)}</td>
                      <td className="px-5 py-3.5 font-bold text-slate-900">{fmt(d.revenue)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          {dayWise.length > 0 && (
            <div className="px-5 py-3 border-t border-slate-100 bg-slate-50 flex justify-between">
              <p className="text-xs text-slate-400">{dayWise.length} days</p>
              <p className="text-xs font-semibold text-blue-600">{fmt(totalRevenue)}</p>
            </div>
          )}
        </div>
      )}

      {/* ════════════════════════════════════════════════════
          TAB: MONTHLY
      ════════════════════════════════════════════════════ */}
      {activeTab === "Month" && (
        <div className="space-y-4">
          {/* Bar Chart */}
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <h3 className="text-sm font-bold text-slate-900 mb-5">Monthly Revenue</h3>
            {monthWise.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-8">No data for selected filters</p>
            ) : (
              (() => {
                const maxRev = Math.max(...monthWise.map((m) => m.revenue));
                return (
                  <div className="flex items-end gap-4 h-36">
                    {[...monthWise].reverse().map((m) => (
                      <div key={m.month} className="flex flex-col items-center gap-1 flex-1 min-w-0">
                        <span className="text-[10px] font-semibold text-slate-500 truncate">
                          {fmt(m.revenue)}
                        </span>
                        <div
                          className="w-full rounded-t-md bg-blue-600 hover:bg-blue-700 transition-colors cursor-default"
                          style={{ height: `${Math.max(8, (m.revenue / maxRev) * 100)}%` }}
                          title={`${m.month}: ${fmt(m.revenue)}`}
                        />
                        <span className="text-xs text-slate-400 truncate">
                          {new Date(m.month + "-01").toLocaleString("en-IN", { month: "short", year: "2-digit" })}
                        </span>
                      </div>
                    ))}
                  </div>
                );
              })()
            )}
          </div>

          {/* Monthly Table */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50">
                    {["Month", "Total Bills", "GST Collected", "Revenue"].map((h) => (
                      <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wide">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {monthWise.map((m) => (
                    <tr key={m.month} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                      <td className="px-5 py-3.5 font-medium text-slate-800">
                        {new Date(m.month + "-01").toLocaleString("en-IN", { month: "long", year: "numeric" })}
                      </td>
                      <td className="px-5 py-3.5 text-slate-600">
                        <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold">
                          {m.bills} bill{m.bills !== 1 && "s"}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-slate-600">{fmt(m.gst)}</td>
                      <td className="px-5 py-3.5 font-bold text-slate-900">{fmt(m.revenue)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════
          TAB: BY CUSTOMER
      ════════════════════════════════════════════════════ */}
      {activeTab === "Customer" && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  {["#", "Customer Name", "Phone", "Total Bills", "Total Spent"].map((h) => (
                    <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wide">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {customerWise.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-5 py-14 text-center text-sm text-slate-400">No data for selected filters</td>
                  </tr>
                ) : (
                  customerWise.map((c, idx) => (
                    <tr key={c.phone || c.name} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                      <td className="px-5 py-3.5 text-slate-400 text-xs font-semibold">{idx + 1}</td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold shrink-0">
                            {c.name.slice(0, 2).toUpperCase()}
                          </div>
                          <span className="font-semibold text-slate-800">{c.name}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-slate-500">{c.phone || "—"}</td>
                      <td className="px-5 py-3.5">
                        <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold">
                          {c.bills} bill{c.bills !== 1 && "s"}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 font-bold text-slate-900">{fmt(c.spent)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          {customerWise.length > 0 && (
            <div className="px-5 py-3 border-t border-slate-100 bg-slate-50 flex justify-between">
              <p className="text-xs text-slate-400">{customerWise.length} customers</p>
              <p className="text-xs font-semibold text-blue-600">{fmt(totalRevenue)} total</p>
            </div>
          )}
        </div>
      )}

      {/* ════════════════════════════════════════════════════
          TAB: BY PRODUCT
      ════════════════════════════════════════════════════ */}
      {activeTab === "Product" && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  {["#", "Product ID", "Product Name", "Qty Sold", "GST Collected", "Revenue"].map((h) => (
                    <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wide whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {productWise.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-14 text-center text-sm text-slate-400">No data for selected filters</td>
                  </tr>
                ) : (
                  productWise.map((p, idx) => (
                    <tr key={p.productId} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                      <td className="px-5 py-3.5 text-slate-400 text-xs font-semibold">{idx + 1}</td>
                      <td className="px-5 py-3.5 font-mono text-xs text-slate-500">{p.productId}</td>
                      <td className="px-5 py-3.5 font-semibold text-slate-800">{p.name}</td>
                      <td className="px-5 py-3.5">
                        <span className="px-2.5 py-0.5 rounded-full bg-green-50 text-green-700 text-xs font-semibold">
                          {p.qtySold} units
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-slate-600">{fmt(p.gst)}</td>
                      <td className="px-5 py-3.5 font-bold text-slate-900">{fmt(p.revenue)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          {productWise.length > 0 && (
            <div className="px-5 py-3 border-t border-slate-100 bg-slate-50 flex justify-between">
              <p className="text-xs text-slate-400">{productWise.length} products sold</p>
              <p className="text-xs font-semibold text-blue-600">{fmt(totalRevenue)} total</p>
            </div>
          )}
        </div>
      )}

      {/* ════════════════════════════════════════════════════
          VIEW SALE MODAL
      ════════════════════════════════════════════════════ */}
      {viewSale && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden max-h-[90vh] flex flex-col">

            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <div>
                <h2 className="text-base font-bold text-slate-900">Invoice Details</h2>
                <p className="text-xs font-mono text-blue-600 mt-0.5">{viewSale.invoiceNumber}</p>
              </div>
              <button
                onClick={() => setViewSale(null)}
                className="w-8 h-8 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 flex items-center justify-center transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {/* Body */}
            <div className="overflow-y-auto px-6 py-5 space-y-4">
              {/* Customer Info */}
              <div className="grid grid-cols-2 gap-3 text-sm">
                <InfoRow label="Customer"   value={viewSale.customerName} />
                <InfoRow label="Phone"      value={viewSale.customerPhone || "—"} />
                <InfoRow label="Date"       value={viewSale.createdAt} />
                <InfoRow label="Payment"    value={
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${pmColor[viewSale.paymentMethod]}`}>
                    {viewSale.paymentMethod}
                  </span>
                } />
              </div>

              {/* Items */}
              <div className="border border-slate-100 rounded-lg overflow-hidden">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100">
                      <th className="px-3 py-2 text-left text-slate-400 font-semibold">Product</th>
                      <th className="px-3 py-2 text-right text-slate-400 font-semibold">Qty × Rate</th>
                      <th className="px-3 py-2 text-right text-slate-400 font-semibold">GST</th>
                      <th className="px-3 py-2 text-right text-slate-400 font-semibold">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {viewSale.items.map((item) => (
                      <tr key={item.productId} className="border-b border-slate-50 last:border-0">
                        <td className="px-3 py-2.5 text-slate-700 font-medium">{item.productName}</td>
                        <td className="px-3 py-2.5 text-right text-slate-500">{item.quantity} × {fmt(item.rate)}</td>
                        <td className="px-3 py-2.5 text-right text-slate-500">{fmt(item.gstAmount)}</td>
                        <td className="px-3 py-2.5 text-right font-semibold text-slate-800">{fmt(item.total)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Totals */}
              <div className="space-y-2 text-sm">
                <SummaryRow label="Subtotal"    value={fmt(viewSale.subTotal)}  />
                <SummaryRow label="GST Total"   value={fmt(viewSale.gstAmount)} />
                {viewSale.discount > 0 && (
                  <SummaryRow label="Discount"  value={`− ${fmt(viewSale.discount)}`} valueClass="text-green-600 font-semibold" />
                )}
                <div className="border-t border-slate-100 pt-2">
                  <SummaryRow
                    label="Total Paid"
                    value={fmt(viewSale.finalTotal)}
                    labelClass="font-bold text-slate-900"
                    valueClass="text-lg font-bold text-blue-600"
                  />
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex gap-3 px-6 py-4 border-t border-slate-100">
              <button
                onClick={() => setViewSale(null)}
                className="flex-1 h-10 rounded-lg border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
              >
                Close
              </button>
              <button
                onClick={() => window.print()}
                className="flex-1 flex items-center justify-center gap-2 h-10 rounded-lg bg-blue-600 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
              >
                <Printer size={14} />
                Print
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

// ─── Helper Components ──────────────────────────────────────────────────────────
function SummaryRow({
  label, value,
  labelClass = "text-slate-500",
  valueClass = "font-semibold text-slate-800",
}: {
  label: string;
  value: string;
  labelClass?: string;
  valueClass?: string;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className={`text-sm ${labelClass}`}>{label}</span>
      <span className={`text-sm ${valueClass}`}>{value}</span>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs text-slate-400 font-medium">{label}</span>
      <span className="text-sm font-semibold text-slate-800">{value}</span>
    </div>
  );
}

const inputCls =
  "h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-colors";