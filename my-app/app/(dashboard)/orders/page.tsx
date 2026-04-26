"use client";

import { useState, useMemo } from "react";
import {
  Search, Eye, Trash2, X, ChevronDown, Filter,
  ShoppingCart, Clock, CheckCircle, XCircle, Truck,
  IndianRupee, CalendarDays, User, Phone, Package,
  ArrowUpDown, RefreshCw, Receipt,
} from "lucide-react";

// ═══════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════

type OrderStatus = "pending" | "confirmed" | "delivered" | "cancelled";
type PaymentStatus = "paid" | "unpaid" | "partial";
type PaymentMethod = "cash" | "upi" | "card";

type OrderItem = {
  productId:   string;
  name:        string;
  qty:         number;
  rate:        number;
  gstPercent:  number;
  discount:    number;
};

type Order = {
  id:            string;
  invoiceNo:     string;
  customer:      string;
  phone:         string;
  items:         OrderItem[];
  subtotal:      number;
  totalDiscount: number;
  totalGST:      number;
  grandTotal:    number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  status:        OrderStatus;
  createdAt:     string;
  updatedAt:     string;
  note:          string;
};

// ═══════════════════════════════════════════════════════════
// MOCK DATA
// ═══════════════════════════════════════════════════════════

const MOCK_ORDERS: Order[] = [
  {
    id:"ORD-001", invoiceNo:"INV-1001", customer:"Arjun Das",     phone:"9876543210",
    items:[
      { productId:"PRD-001", name:"Wireless Keyboard Pro", qty:1, rate:1299, gstPercent:18, discount:0   },
      { productId:"PRD-002", name:"USB-C Hub 7-in-1",      qty:1, rate:999,  gstPercent:18, discount:50  },
    ],
    subtotal:2298, totalDiscount:50, totalGST:400, grandTotal:2648,
    paymentMethod:"upi",  paymentStatus:"paid",   status:"delivered",
    createdAt:"2026-04-17 10:30", updatedAt:"2026-04-17 11:00", note:"",
  },
  {
    id:"ORD-002", invoiceNo:"INV-1002", customer:"Priya Sharma",  phone:"8765432109",
    items:[
      { productId:"PRD-007", name:"Webcam 1080p",           qty:1, rate:3299, gstPercent:18, discount:0   },
    ],
    subtotal:3299, totalDiscount:0, totalGST:594, grandTotal:3893,
    paymentMethod:"card", paymentStatus:"paid",   status:"delivered",
    createdAt:"2026-04-16 14:15", updatedAt:"2026-04-16 15:00", note:"",
  },
  {
    id:"ORD-003", invoiceNo:"INV-1003", customer:"Ravi Kumar",    phone:"7654321098",
    items:[
      { productId:"PRD-003", name:"Monitor Stand Adj.",     qty:2, rate:2499, gstPercent:12, discount:100 },
      { productId:"PRD-008", name:"Desk Organizer Set",     qty:1, rate:749,  gstPercent:12, discount:0   },
    ],
    subtotal:5747, totalDiscount:200, totalGST:666, grandTotal:6213,
    paymentMethod:"cash", paymentStatus:"partial", status:"confirmed",
    createdAt:"2026-04-17 09:00", updatedAt:"2026-04-17 09:30", note:"Partial payment of ₹3000 received.",
  },
  {
    id:"ORD-004", invoiceNo:"INV-1004", customer:"Meena Nair",    phone:"6543210987",
    items:[
      { productId:"PRD-005", name:"Laptop Sleeve 15\"",     qty:2, rate:599,  gstPercent:12, discount:0   },
    ],
    subtotal:1198, totalDiscount:0, totalGST:144, grandTotal:1342,
    paymentMethod:"upi",  paymentStatus:"unpaid",  status:"pending",
    createdAt:"2026-04-18 08:45", updatedAt:"2026-04-18 08:45", note:"",
  },
  {
    id:"ORD-005", invoiceNo:"INV-1005", customer:"Suresh Pillai", phone:"5432109876",
    items:[
      { productId:"PRD-004", name:"Mechanical Mouse",       qty:3, rate:849,  gstPercent:18, discount:0   },
      { productId:"PRD-006", name:"HDMI Cable 2m",          qty:2, rate:299,  gstPercent:18, discount:0   },
    ],
    subtotal:3145, totalDiscount:0, totalGST:566, grandTotal:3711,
    paymentMethod:"cash", paymentStatus:"paid",    status:"delivered",
    createdAt:"2026-04-15 16:20", updatedAt:"2026-04-15 17:00", note:"",
  },
  {
    id:"ORD-006", invoiceNo:"INV-1006", customer:"Anita Bose",    phone:"4321098765",
    items:[
      { productId:"PRD-009", name:"Mouse Pad XL",           qty:1, rate:399,  gstPercent:18, discount:0   },
    ],
    subtotal:399, totalDiscount:0, totalGST:72, grandTotal:471,
    paymentMethod:"cash", paymentStatus:"paid",    status:"cancelled",
    createdAt:"2026-04-14 12:00", updatedAt:"2026-04-14 12:30", note:"Customer cancelled order.",
  },
  {
    id:"ORD-007", invoiceNo:"INV-1007", customer:"Vijay Menon",   phone:"3210987654",
    items:[
      { productId:"PRD-010", name:"Laptop Stand Portable",  qty:1, rate:1799, gstPercent:12, discount:0   },
      { productId:"PRD-001", name:"Wireless Keyboard Pro",  qty:1, rate:1299, gstPercent:18, discount:100 },
    ],
    subtotal:3098, totalDiscount:100, totalGST:512, grandTotal:3510,
    paymentMethod:"card", paymentStatus:"paid",    status:"confirmed",
    createdAt:"2026-04-18 11:10", updatedAt:"2026-04-18 11:10", note:"",
  },
  {
    id:"ORD-008", invoiceNo:"INV-1008", customer:"Deepa Iyer",    phone:"9123456789",
    items:[
      { productId:"PRD-002", name:"USB-C Hub 7-in-1",       qty:2, rate:999,  gstPercent:18, discount:0   },
    ],
    subtotal:1998, totalDiscount:0, totalGST:360, grandTotal:2358,
    paymentMethod:"upi",  paymentStatus:"paid",    status:"pending",
    createdAt:"2026-04-19 07:55", updatedAt:"2026-04-19 07:55", note:"",
  },
  {
    id:"ORD-009", invoiceNo:"INV-1009", customer:"Kiran Reddy",   phone:"8012345678",
    items:[
      { productId:"PRD-007", name:"Webcam 1080p",           qty:1, rate:3299, gstPercent:18, discount:200 },
      { productId:"PRD-003", name:"Monitor Stand Adj.",     qty:1, rate:2499, gstPercent:12, discount:0   },
    ],
    subtotal:5798, totalDiscount:200, totalGST:908, grandTotal:6506,
    paymentMethod:"card", paymentStatus:"paid",    status:"delivered",
    createdAt:"2026-04-13 15:30", updatedAt:"2026-04-14 10:00", note:"",
  },
  {
    id:"ORD-010", invoiceNo:"INV-1010", customer:"Sonal Mehta",   phone:"7901234567",
    items:[
      { productId:"PRD-005", name:"Laptop Sleeve 15\"",     qty:1, rate:599,  gstPercent:12, discount:0   },
      { productId:"PRD-008", name:"Desk Organizer Set",     qty:2, rate:749,  gstPercent:12, discount:50  },
    ],
    subtotal:2097, totalDiscount:100, totalGST:238, grandTotal:2235,
    paymentMethod:"cash", paymentStatus:"unpaid",  status:"pending",
    createdAt:"2026-04-19 09:20", updatedAt:"2026-04-19 09:20", note:"",
  },
];

// ═══════════════════════════════════════════════════════════
// CONFIG
// ═══════════════════════════════════════════════════════════

const ORDER_STATUSES: { key: OrderStatus; label: string; color: string; bg: string; icon: React.ElementType }[] = [
  { key:"pending",   label:"Pending",   color:"text-amber-700",  bg:"bg-amber-50",  icon:Clock        },
  { key:"confirmed", label:"Confirmed", color:"text-blue-700",   bg:"bg-blue-50",   icon:RefreshCw    },
  { key:"delivered", label:"Delivered", color:"text-green-700",  bg:"bg-green-50",  icon:CheckCircle  },
  { key:"cancelled", label:"Cancelled", color:"text-red-600",    bg:"bg-red-50",    icon:XCircle      },
];

const PAYMENT_STATUSES: { key: PaymentStatus; label: string; color: string; bg: string }[] = [
  { key:"paid",    label:"Paid",    color:"text-green-700", bg:"bg-green-50" },
  { key:"unpaid",  label:"Unpaid",  color:"text-red-600",   bg:"bg-red-50"   },
  { key:"partial", label:"Partial", color:"text-amber-700", bg:"bg-amber-50" },
];

const inputCls =
  "h-9 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 transition-colors";

function fmt(n: number) {
  return "₹" + n.toLocaleString("en-IN");
}

function getOrderStatus(key: OrderStatus) {
  return ORDER_STATUSES.find((s) => s.key === key)!;
}

function getPayStatus(key: PaymentStatus) {
  return PAYMENT_STATUSES.find((s) => s.key === key)!;
}

// ═══════════════════════════════════════════════════════════
// ORDER DETAIL MODAL
// ═══════════════════════════════════════════════════════════

function OrderDetailModal({
  order,
  onClose,
  onStatusChange,
}: {
  order:          Order;
  onClose:        () => void;
  onStatusChange: (id: string, status: OrderStatus) => void;
}) {
  const orderSt = getOrderStatus(order.status);
  const paySt   = getPayStatus(order.paymentStatus);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden max-h-[92vh] flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0">
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-base font-bold text-slate-900">{order.invoiceNo}</h2>
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${orderSt.bg} ${orderSt.color}`}>
                <orderSt.icon size={11} />
                {orderSt.label}
              </span>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${paySt.bg} ${paySt.color}`}>
                {paySt.label}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5 font-mono">{order.id} · {order.createdAt}</p>
          </div>
          <button onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-slate-100 text-slate-400 flex items-center justify-center transition-colors">
            <X size={16} />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 px-6 py-5 space-y-5">

          {/* Customer */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-50 rounded-xl border border-slate-100 px-4 py-3">
              <p className="text-xs text-slate-400 font-semibold uppercase tracking-wide mb-2">Customer</p>
              <div className="flex items-center gap-2">
                <User size={14} className="text-slate-400" />
                <p className="text-sm font-semibold text-slate-800">{order.customer || "Walk-in"}</p>
              </div>
              <div className="flex items-center gap-2 mt-1.5">
                <Phone size={14} className="text-slate-400" />
                <p className="text-sm text-slate-600">{order.phone || "—"}</p>
              </div>
            </div>
            <div className="bg-slate-50 rounded-xl border border-slate-100 px-4 py-3">
              <p className="text-xs text-slate-400 font-semibold uppercase tracking-wide mb-2">Payment</p>
              <p className="text-sm font-semibold text-slate-800 capitalize">{order.paymentMethod}</p>
              <p className="text-xs text-slate-400 mt-1">Created: {order.createdAt}</p>
              <p className="text-xs text-slate-400">Updated: {order.updatedAt}</p>
            </div>
          </div>

          {/* Items */}
          <div>
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wide mb-2">Order Items</p>
            <div className="rounded-xl border border-slate-200 overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    {["Product","Qty","Rate","GST","Discount","Amount"].map((h) => (
                      <th key={h} className="px-4 py-2.5 text-left text-xs font-semibold text-slate-400 uppercase tracking-wide whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {order.items.map((item, i) => {
                    const base    = item.rate * item.qty;
                    const disc    = item.discount * item.qty;
                    const taxable = base - disc;
                    const gst     = Math.round(taxable * item.gstPercent / 100);
                    const total   = taxable + gst;
                    return (
                      <tr key={i} className="border-b border-slate-50 last:border-0">
                        <td className="px-4 py-3">
                          <p className="font-semibold text-slate-800">{item.name}</p>
                          <p className="text-xs text-slate-400 font-mono">{item.productId}</p>
                        </td>
                        <td className="px-4 py-3 text-slate-600 tabular-nums">{item.qty}</td>
                        <td className="px-4 py-3 text-slate-700 tabular-nums">{fmt(item.rate)}</td>
                        <td className="px-4 py-3 text-amber-600 tabular-nums text-xs">{item.gstPercent}%</td>
                        <td className="px-4 py-3 text-green-600 tabular-nums">{disc > 0 ? fmt(disc) : "—"}</td>
                        <td className="px-4 py-3 font-bold text-slate-900 tabular-nums">{fmt(total)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Totals */}
          <div className="ml-auto w-64 space-y-2">
            {[
              { label:"Subtotal",        value: fmt(order.subtotal),       cls:"text-slate-700" },
              ...(order.totalDiscount > 0 ? [{ label:"Discount", value:`−${fmt(order.totalDiscount)}`, cls:"text-green-600" }] : []),
              { label:"GST",             value: fmt(order.totalGST),       cls:"text-amber-600" },
            ].map((r) => (
              <div key={r.label} className="flex items-center justify-between">
                <p className="text-xs text-slate-500">{r.label}</p>
                <p className={`text-xs font-semibold tabular-nums ${r.cls}`}>{r.value}</p>
              </div>
            ))}
            <div className="border-t border-slate-200 pt-2 flex items-center justify-between">
              <p className="text-sm font-bold text-slate-900">Grand Total</p>
              <p className="text-lg font-bold text-blue-700 tabular-nums">{fmt(order.grandTotal)}</p>
            </div>
          </div>

          {/* Note */}
          {order.note && (
            <div className="bg-amber-50 border border-amber-100 rounded-xl px-4 py-3">
              <p className="text-xs font-semibold text-amber-700 mb-1">Note</p>
              <p className="text-sm text-amber-800">{order.note}</p>
            </div>
          )}

          {/* Status Update */}
          {order.status !== "cancelled" && order.status !== "delivered" && (
            <div>
              <p className="text-xs text-slate-400 font-semibold uppercase tracking-wide mb-2">Update Status</p>
              <div className="flex flex-wrap gap-2">
                {ORDER_STATUSES.filter((s) => s.key !== order.status && s.key !== "pending").map((s) => (
                  <button key={s.key}
                    onClick={() => { onStatusChange(order.id, s.key); onClose(); }}
                    className={`flex items-center gap-2 h-9 px-4 rounded-lg border text-sm font-semibold transition-all ${s.bg} ${s.color} border-current/20 hover:opacity-80`}>
                    <s.icon size={14} />
                    Mark as {s.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-slate-100 shrink-0">
          <button onClick={onClose}
            className="w-full h-10 rounded-lg border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// MAIN PAGE
// ═══════════════════════════════════════════════════════════

export default function OrdersPage() {
  const [orders,     setOrders]     = useState<Order[]>(MOCK_ORDERS);
  const [search,     setSearch]     = useState("");
  const [statusF,    setStatusF]    = useState("All");
  const [payF,       setPayF]       = useState("All");
  const [methodF,    setMethodF]    = useState("All");
  const [dateFrom,   setDateFrom]   = useState("");
  const [dateTo,     setDateTo]     = useState("");
  const [sortKey,    setSortKey]    = useState<"createdAt" | "grandTotal">("createdAt");
  const [sortDir,    setSortDir]    = useState<"asc" | "desc">("desc");
  const [viewing,    setViewing]    = useState<Order | null>(null);
  const [deleteId,   setDeleteId]   = useState<string | null>(null);

  // ── Stats ──
  const stats = useMemo(() => ({
    total:     orders.length,
    pending:   orders.filter((o) => o.status === "pending").length,
    delivered: orders.filter((o) => o.status === "delivered").length,
    revenue:   orders.filter((o) => o.status !== "cancelled").reduce((t, o) => t + o.grandTotal, 0),
  }), [orders]);

  // ── Filter + Sort ──
  const filtered = useMemo(() => {
    return orders
      .filter((o) => {
        const q = search.toLowerCase();
        const matchSearch = !q ||
          o.customer.toLowerCase().includes(q) ||
          o.id.toLowerCase().includes(q) ||
          o.invoiceNo.toLowerCase().includes(q) ||
          o.phone.includes(q);
        const matchStatus = statusF === "All" || o.status === statusF;
        const matchPay    = payF    === "All" || o.paymentStatus === payF;
        const matchMethod = methodF === "All" || o.paymentMethod === methodF;
        const matchFrom   = !dateFrom || o.createdAt.slice(0, 10) >= dateFrom;
        const matchTo     = !dateTo   || o.createdAt.slice(0, 10) <= dateTo;
        return matchSearch && matchStatus && matchPay && matchMethod && matchFrom && matchTo;
      })
      .sort((a, b) => {
        const cmp = sortKey === "grandTotal"
          ? a.grandTotal - b.grandTotal
          : a.createdAt.localeCompare(b.createdAt);
        return sortDir === "asc" ? cmp : -cmp;
      });
  }, [orders, search, statusF, payF, methodF, dateFrom, dateTo, sortKey, sortDir]);

  function toggleSort(key: typeof sortKey) {
    if (sortKey === key) setSortDir((d) => d === "asc" ? "desc" : "asc");
    else { setSortKey(key); setSortDir("desc"); }
  }

  function handleStatusChange(id: string, status: OrderStatus) {
    setOrders((prev) => prev.map((o) =>
      o.id === id ? { ...o, status, updatedAt: "2026-04-22 " + new Date().toTimeString().slice(0, 5) } : o
    ));
  }

  function handleDelete(id: string) {
    setOrders((prev) => prev.filter((o) => o.id !== id));
    setDeleteId(null);
  }

  function clearFilters() {
    setSearch(""); setStatusF("All"); setPayF("All");
    setMethodF("All"); setDateFrom(""); setDateTo("");
  }

  const hasFilters = search || statusF !== "All" || payF !== "All" || methodF !== "All" || dateFrom || dateTo;

  return (
    <>
      {/* ── View Modal ── */}
      {viewing && (
        <OrderDetailModal
          order={viewing}
          onClose={() => setViewing(null)}
          onStatusChange={handleStatusChange}
        />
      )}

      {/* ── Delete Confirm ── */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
          <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl border border-slate-200 p-6 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mx-auto">
              <Trash2 className="w-5 h-5 text-red-500" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Delete Order?</h3>
              <p className="text-sm text-slate-500 mt-1">This will permanently remove <span className="font-semibold font-mono text-slate-700">{deleteId}</span>. This cannot be undone.</p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)}
                className="flex-1 h-10 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">
                Cancel
              </button>
              <button onClick={() => handleDelete(deleteId)}
                className="flex-1 h-10 rounded-xl bg-red-500 hover:bg-red-600 text-sm font-semibold text-white transition-colors">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-6">

        {/* ── Page Header ── */}
        <div>
          <h1 className="text-xl font-bold text-slate-900">Orders</h1>
          <p className="text-sm text-slate-500 mt-0.5">Manage all customer orders & invoices</p>
        </div>

        {/* ── KPI Cards ── */}
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
          {[
            { label:"Total Orders",  value: stats.total,        sub:"All time",    icon:ShoppingCart, bg:"bg-slate-100", ic:"text-slate-600" },
            { label:"Pending",       value: stats.pending,      sub:"Need action", icon:Clock,        bg:"bg-amber-50",  ic:"text-amber-600", highlight: stats.pending > 0 },
            { label:"Delivered",     value: stats.delivered,    sub:"Completed",   icon:CheckCircle,  bg:"bg-green-50",  ic:"text-green-600" },
            { label:"Total Revenue", value:`₹${(stats.revenue/1000).toFixed(1)}K`, sub:"Excl. cancelled", icon:IndianRupee, bg:"bg-blue-50", ic:"text-blue-600" },
          ].map((k) => (
            <div key={k.label} className={`rounded-xl border p-5 ${k.highlight ? "bg-amber-50 border-amber-200" : "bg-white border-slate-200"}`}>
              <div className={`inline-flex items-center justify-center w-9 h-9 rounded-lg ${k.bg} mb-3`}>
                <k.icon className={`w-4 h-4 ${k.ic}`} />
              </div>
              <p className="text-2xl font-bold text-slate-900 tabular-nums">{k.value}</p>
              <p className="text-xs font-semibold text-slate-700 mt-0.5">{k.label}</p>
              <p className="text-xs text-slate-400 mt-0.5">{k.sub}</p>
            </div>
          ))}
        </div>

        {/* ── Filters ── */}
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex flex-wrap gap-3">

            {/* Search */}
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <input type="text" placeholder="Search order ID, invoice, customer, phone…"
                value={search} onChange={(e) => setSearch(e.target.value)}
                className={inputCls + " pl-8 w-full"} />
            </div>

            {/* Order Status */}
            <div className="relative">
              <Filter className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <select value={statusF} onChange={(e) => setStatusF(e.target.value)}
                className={inputCls + " pl-8 w-36 appearance-none pr-8 cursor-pointer"}>
                <option>All</option>
                {ORDER_STATUSES.map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>

            {/* Payment Status */}
            <div className="relative">
              <select value={payF} onChange={(e) => setPayF(e.target.value)}
                className={inputCls + " w-36 appearance-none pr-8 cursor-pointer"}>
                <option>All</option>
                {PAYMENT_STATUSES.map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>

            {/* Payment Method */}
            <div className="relative">
              <select value={methodF} onChange={(e) => setMethodF(e.target.value)}
                className={inputCls + " w-28 appearance-none pr-8 cursor-pointer"}>
                {["All","cash","upi","card"].map((m) => <option key={m} value={m} className="capitalize">{m === "All" ? "All" : m.toUpperCase()}</option>)}
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>

            {/* Date Range */}
            <div className="flex items-center gap-2">
              <CalendarDays size={14} className="text-slate-400 shrink-0" />
              <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)}
                className={inputCls + " w-36"} />
              <span className="text-xs text-slate-400">to</span>
              <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)}
                className={inputCls + " w-36"} />
            </div>

            {hasFilters && (
              <button onClick={clearFilters}
                className="flex items-center gap-1.5 h-9 px-3 rounded-lg border border-red-200 bg-red-50 text-xs font-semibold text-red-600 hover:bg-red-100 transition-colors">
                <X size={13} /> Clear
              </button>
            )}
          </div>

          {/* Status pills quick-filter */}
          <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-slate-100">
            {["All", ...ORDER_STATUSES.map((s) => s.key)].map((s) => {
              const cfg = ORDER_STATUSES.find((o) => o.key === s);
              const count = s === "All" ? orders.length : orders.filter((o) => o.status === s).length;
              return (
                <button key={s}
                  onClick={() => setStatusF(s)}
                  className={`flex items-center gap-1.5 h-7 px-3 rounded-full text-xs font-semibold border transition-all ${
                    statusF === s
                      ? cfg ? `${cfg.bg} ${cfg.color} border-current/20` : "bg-blue-600 text-white border-blue-600"
                      : "border-slate-200 text-slate-500 hover:border-slate-300"
                  }`}>
                  {cfg && <cfg.icon size={11} />}
                  {s === "All" ? "All" : cfg!.label} ({count})
                </button>
              );
            })}
            <span className="ml-auto text-xs text-slate-400 self-center">{filtered.length} orders</span>
          </div>
        </div>

        {/* ── Orders Table ── */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  {[
                    { label:"Order / Invoice", k:null            },
                    { label:"Customer",        k:null            },
                    { label:"Items",           k:null            },
                    { label:"Amount",          k:"grandTotal"    },
                    { label:"Payment",         k:null            },
                    { label:"Status",          k:null            },
                    { label:"Date",            k:"createdAt"     },
                    { label:"Actions",         k:null            },
                  ].map(({ label, k }) => (
                    <th key={label}
                      onClick={() => k && toggleSort(k as typeof sortKey)}
                      className={`px-5 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wide whitespace-nowrap ${k ? "cursor-pointer hover:text-slate-600 select-none" : ""}`}>
                      {label}
                      {k && <ArrowUpDown size={11} className={`inline ml-1 ${sortKey === k ? "text-blue-500" : "text-slate-300"}`} />}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((order) => {
                  const orderSt = getOrderStatus(order.status);
                  const paySt   = getPayStatus(order.paymentStatus);
                  return (
                    <tr key={order.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">

                      {/* Order ID */}
                      <td className="px-5 py-4">
                        <p className="font-semibold text-slate-800 text-xs font-mono">{order.invoiceNo}</p>
                        <p className="text-xs text-slate-400 mt-0.5">{order.id}</p>
                      </td>

                      {/* Customer */}
                      <td className="px-5 py-4">
                        <p className="font-semibold text-slate-800 whitespace-nowrap">{order.customer || "Walk-in"}</p>
                        <p className="text-xs text-slate-400 mt-0.5">{order.phone}</p>
                      </td>

                      {/* Items */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1.5">
                          <Package size={13} className="text-slate-400 shrink-0" />
                          <span className="text-slate-700 text-xs font-semibold">{order.items.length} item{order.items.length > 1 ? "s" : ""}</span>
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5 truncate max-w-[140px]">
                          {order.items.map((i) => i.name).join(", ")}
                        </p>
                      </td>

                      {/* Amount */}
                      <td className="px-5 py-4">
                        <p className="font-bold text-slate-900 tabular-nums">{fmt(order.grandTotal)}</p>
                        {order.totalDiscount > 0 && (
                          <p className="text-xs text-green-600 mt-0.5">−{fmt(order.totalDiscount)} off</p>
                        )}
                      </td>

                      {/* Payment */}
                      <td className="px-5 py-4">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${paySt.bg} ${paySt.color}`}>
                          {paySt.label}
                        </span>
                        <p className="text-xs text-slate-400 mt-1 uppercase">{order.paymentMethod}</p>
                      </td>

                      {/* Order Status */}
                      <td className="px-5 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${orderSt.bg} ${orderSt.color}`}>
                          <orderSt.icon size={11} />
                          {orderSt.label}
                        </span>
                      </td>

                      {/* Date */}
                      <td className="px-5 py-4 text-xs text-slate-400 whitespace-nowrap">
                        {order.createdAt}
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => setViewing(order)}
                            className="w-8 h-8 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 flex items-center justify-center transition-colors"
                            title="View details"
                          >
                            <Eye size={14} />
                          </button>
                          <button
                            onClick={() => setDeleteId(order.id)}
                            className="w-8 h-8 rounded-lg bg-red-50 hover:bg-red-100 text-red-500 flex items-center justify-center transition-colors"
                            title="Delete order"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>

              {/* Footer totals */}
              {filtered.length > 0 && (
                <tfoot>
                  <tr className="bg-slate-50 border-t-2 border-slate-200">
                    <td colSpan={3} className="px-5 py-3 text-xs font-bold text-slate-600">
                      {filtered.length} orders shown
                    </td>
                    <td className="px-5 py-3 font-bold text-blue-700 tabular-nums">
                      {fmt(filtered.reduce((t, o) => t + o.grandTotal, 0))}
                    </td>
                    <td colSpan={4} />
                  </tr>
                </tfoot>
              )}
            </table>

            {filtered.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 gap-3">
                <ShoppingCart size={36} className="text-slate-200" />
                <p className="text-sm font-semibold text-slate-500">No orders found</p>
                <p className="text-xs text-slate-400">Try adjusting your filters</p>
                {hasFilters && (
                  <button onClick={clearFilters}
                    className="mt-1 text-xs text-blue-600 font-semibold hover:underline">
                    Clear all filters
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}