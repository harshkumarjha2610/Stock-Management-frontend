"use client";

import { useState, useMemo, useEffect } from "react";
import {
  Search, Plus, TrendingUp, TrendingDown, Package,
  AlertTriangle, X, ChevronDown, History, Eye,
  ArrowUpCircle, ArrowDownCircle, Filter, Loader2,
} from "lucide-react";
import { api } from "@/lib/api";

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════

type StockStatus   = "Available" | "Low Stock" | "Sold Out";
type StockOutReason = "Sold" | "Damaged" | "Return";
type HistoryType   = "IN" | "OUT";
type MainTab       = "overview" | "history";
type ModalType     = "in" | "out" | null;

type Product = {
  id:            string;
  name:          string;
  category:      string;
  unit:          string;
  currentStock:  number;
  lowStockAt:    number;
  purchasePrice: number;
  sellingPrice:  number;
};

type StockHistory = {
  id:            string;
  productId:     string;
  productName:   string;
  type:          HistoryType;
  quantity:      number;
  purchasePrice: number;
  supplier:      string;
  reason:        StockOutReason | "";
  date:          string;
  note:          string;
};

const TODAY = new Date().toISOString().split('T')[0];

// ═══════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════

function getStatus(p: Product): StockStatus {
  if (p.currentStock === 0)             return "Sold Out";
  if (p.currentStock <= p.lowStockAt)   return "Low Stock";
  return "Available";
}

function fmt(n: number) {
  return "₹" + n.toLocaleString("en-IN");
}

function genHistoryId(list: StockHistory[]) {
  const max = list.length ? Math.max(...list.map((h) => parseInt(h.id.split("-")[1]))) : 0;
  return `SH-${String(max + 1).padStart(3, "0")}`;
}

const statusStyle: Record<StockStatus, string> = {
  "Available": "bg-green-50 text-green-700",
  "Low Stock":  "bg-amber-50 text-amber-700",
  "Sold Out":   "bg-red-50 text-red-600",
};

const reasonStyle: Record<StockOutReason | "", string> = {
  "Sold":    "bg-red-50 text-red-700",
  "Damaged": "bg-red-50 text-red-600",
  "Return":  "bg-purple-50 text-purple-700",
  "":        "bg-slate-100 text-slate-500",
};

const inputCls =
  "h-10 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-colors";

// ═══════════════════════════════════════════════════════════════
// SUB-COMPONENTS
// ═══════════════════════════════════════════════════════════════

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{label}</label>
      {children}
    </div>
  );
}

function StatCard({ label, value, sub, icon: Icon, bg, ic, highlight = false }: {
  label: string; value: string | number; sub?: string;
  icon: React.ElementType; bg: string; ic: string; highlight?: boolean;
}) {
  return (
    <div className={`rounded-xl border p-5 ${highlight ? "border-amber-200 bg-amber-50" : "bg-white border-slate-200"}`}>
      <div className={`inline-flex items-center justify-center w-9 h-9 rounded-lg ${bg} mb-3`}>
        <Icon className={`w-4 h-4 ${ic}`} />
      </div>
      <p className="text-2xl font-bold text-slate-900">{value}</p>
      <p className="text-xs font-semibold text-slate-700 mt-0.5">{label}</p>
      {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
    </div>
  );
}

function Modal({
  title, sub, onClose, children, maxW = "max-w-md",
}: {
  title: string; sub?: string; onClose: () => void;
  children: React.ReactNode; maxW?: string;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
      <div className={`w-full ${maxW} bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden max-h-[92vh] flex flex-col`}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0">
          <div>
            <h2 className="text-base font-bold text-slate-900">{title}</h2>
            {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
          </div>
          <button onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 flex items-center justify-center transition-colors">
            <X size={16} />
          </button>
        </div>
        <div className="overflow-y-auto flex-1">{children}</div>
      </div>
    </div>
  );
}

function ModalFooter({
  onCancel, onConfirm, confirmLabel,
  confirmColor = "bg-red-600 hover:bg-red-700 shadow-red-200",
  disabled = false,
}: {
  onCancel: () => void; onConfirm: () => void;
  confirmLabel: string; confirmColor?: string; disabled?: boolean;
}) {
  return (
    <div className="flex gap-3 px-6 py-4 border-t border-slate-100 shrink-0">
      <button onClick={onCancel}
        className="flex-1 h-10 rounded-lg border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">
        Cancel
      </button>
      <button onClick={onConfirm} disabled={disabled}
        className={`flex-1 h-10 rounded-lg ${confirmColor} text-sm font-semibold text-white transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed`}>
        {confirmLabel}
      </button>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// MAIN PAGE
// ═══════════════════════════════════════════════════════════════

export default function StockPage() {
  const [products, setProducts]   = useState<Product[]>([]);
  const [history, setHistory]     = useState<StockHistory[]>([]);
  const [loading, setLoading]     = useState(true);
  const [mainTab, setMainTab]     = useState<MainTab>("overview");

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const [prodRes, histRes] = await Promise.all([
          api.get('/products'),
          api.get('/stock-history')
        ]);

        setProducts(prodRes.data.map((p: any) => ({
          id: p.id,
          name: p.name,
          category: p.category,
          unit: "pcs", // Clothing usually pcs
          currentStock: p.sizes?.reduce((s: number, x: any) => s + x.quantity, 0) || 0,
          lowStockAt: parseInt(p.min_stock_level || 5),
          purchasePrice: parseFloat(p.purchase_price),
          sellingPrice: parseFloat(p.selling_price)
        })));

        setHistory(histRes.data.map((h: any) => ({
          id: h.id,
          productId: h.product_id,
          productName: h.product?.name || "Unknown",
          type: h.type,
          quantity: h.quantity,
          purchasePrice: parseFloat(h.purchase_price || 0),
          supplier: h.supplier,
          reason: h.reason,
          date: h.date?.split('T')[0],
          note: h.note
        })));
      } catch (error) {
        console.error("Failed to fetch stock data", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // ── Overview filters ──
  const [search, setSearch]             = useState("");
  const [catFilter, setCatFilter]       = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  // ── History filters ──
  const [histSearch, setHistSearch]     = useState("");
  const [histType, setHistType]         = useState("All");
  const [histDate, setHistDate]         = useState("");
  const [histProduct, setHistProduct]   = useState("All");

  // ── Modals ──
  const [modal, setModal]               = useState<ModalType>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [viewProduct, setViewProduct]   = useState<Product | null>(null);

  // ── Stock In Form ──
  const [inForm, setInForm] = useState({
    productId: "", quantity: 0, purchasePrice: 0, supplier: "", date: TODAY, note: "",
  });

  // ── Stock Out Form ──
  const [outForm, setOutForm] = useState({
    productId: "", quantity: 0, reason: "Sold" as StockOutReason, date: TODAY, note: "",
  });

  // ═══════════════════════════════════════════════════════════════
  // DERIVED
  // ═══════════════════════════════════════════════════════════════

  const categories = useMemo(() => ["All", ...Array.from(new Set(products.map((p) => p.category)))], [products]);

  const filteredProducts = useMemo(() => {
    const q = search.toLowerCase();
    return products.filter((p) => {
      const matchSearch = p.name.toLowerCase().includes(q) || p.id.toLowerCase().includes(q) || p.category.toLowerCase().includes(q);
      const matchCat    = catFilter === "All"    || p.category === catFilter;
      const matchStatus = statusFilter === "All" || getStatus(p) === statusFilter;
      return matchSearch && matchCat && matchStatus;
    });
  }, [products, search, catFilter, statusFilter]);

  const filteredHistory = useMemo(() => {
    const q = histSearch.toLowerCase();
    return history.filter((h) => {
      const matchSearch  = h.productName.toLowerCase().includes(q) || h.productId.toLowerCase().includes(q) || h.supplier.toLowerCase().includes(q);
      const matchType    = histType === "All"    || h.type === histType;
      const matchDate    = !histDate             || h.date === histDate;
      const matchProduct = histProduct === "All" || h.productId === histProduct;
      return matchSearch && matchType && matchDate && matchProduct;
    }).sort((a, b) => b.date.localeCompare(a.date));
  }, [history, histSearch, histType, histDate, histProduct]);

  // Stats
  const available  = products.filter((p) => getStatus(p) === "Available").length;
  const lowStock   = products.filter((p) => getStatus(p) === "Low Stock").length;
  const soldOut    = products.filter((p) => getStatus(p) === "Sold Out").length;
  const totalValue = products.reduce((t, p) => t + p.currentStock * p.purchasePrice, 0);

  const totalStockIn  = history.filter((h) => h.type === "IN").reduce((t, h) => t + h.quantity, 0);
  const totalStockOut = history.filter((h) => h.type === "OUT").reduce((t, h) => t + h.quantity, 0);

  // Product whose history to view inside viewProduct modal
  const productHistory = viewProduct
    ? history.filter((h) => h.productId === viewProduct.id).sort((a, b) => b.date.localeCompare(a.date))
    : [];

  // ═══════════════════════════════════════════════════════════════
  // HANDLERS
  // ═══════════════════════════════════════════════════════════════

  function openStockIn(product?: Product) {
    setInForm({
      productId:     product?.id ?? "",
      quantity:      0,
      purchasePrice: product?.purchasePrice ?? 0,
      supplier:      "",
      date:          TODAY,
      note:          "",
    });
    setModal("in");
  }

  function openStockOut(product?: Product) {
    setOutForm({
      productId: product?.id ?? "",
      quantity:  0,
      reason:    "Sold",
      date:      TODAY,
      note:      "",
    });
    setModal("out");
  }

  async function handleStockIn() {
    if (!inForm.productId || inForm.quantity <= 0) return;
    setLoading(true);
    try {
      const prod = products.find((p) => p.id === inForm.productId);
      if (!prod) return;

      const payload = {
        product_id: inForm.productId,
        type: "IN",
        quantity: inForm.quantity,
        purchase_price: inForm.purchasePrice,
        supplier: inForm.supplier,
        date: inForm.date,
        note: inForm.note
      };

      const res = await api.post('/stock-history', payload);
      
      const newRec: StockHistory = {
        id: res.data.id,
        productId: res.data.product_id,
        productName: prod.name,
        type: "IN",
        quantity: res.data.quantity,
        purchasePrice: parseFloat(res.data.purchase_price || 0),
        supplier: res.data.supplier,
        reason: "",
        date: res.data.date?.split('T')[0],
        note: res.data.note
      };

      setHistory((prev) => [newRec, ...prev]);
      
      // Update local product stock
      setProducts((prev) =>
        prev.map((p) =>
          p.id === inForm.productId
            ? { ...p, currentStock: p.currentStock + inForm.quantity }
            : p
        )
      );
      setModal(null);
    } catch (error: any) {
      alert(error.message || "Failed to add stock");
    } finally {
      setLoading(false);
    }
  }

  async function handleStockOut() {
    if (!outForm.productId || outForm.quantity <= 0) return;
    setLoading(true);
    try {
      const prod = products.find((p) => p.id === outForm.productId);
      if (!prod) return;
      if (outForm.quantity > prod.currentStock) {
        alert("Insufficient stock");
        return;
      }

      const payload = {
        product_id: outForm.productId,
        type: "OUT",
        quantity: outForm.quantity,
        reason: outForm.reason,
        date: outForm.date,
        note: outForm.note
      };

      const res = await api.post('/stock-history', payload);

      const newRec: StockHistory = {
        id: res.data.id,
        productId: res.data.product_id,
        productName: prod.name,
        type: "OUT",
        quantity: res.data.quantity,
        purchasePrice: 0,
        supplier: "",
        reason: res.data.reason as StockOutReason,
        date: res.data.date?.split('T')[0],
        note: res.data.note
      };

      setHistory((prev) => [newRec, ...prev]);

      setProducts((prev) =>
        prev.map((p) =>
          p.id === outForm.productId
            ? { ...p, currentStock: Math.max(0, p.currentStock - outForm.quantity) }
            : p
        )
      );
      setModal(null);
    } catch (error: any) {
      alert(error.message || "Failed to remove stock");
    } finally {
      setLoading(false);
    }
  }

  // When product selected in Stock In form, auto-fill purchase price
  function handleInProductChange(id: string) {
    const prod = products.find((p) => p.id === id);
    setInForm((prev) => ({ ...prev, productId: id, purchasePrice: prod?.purchasePrice ?? 0 }));
  }

  // Max quantity for stock out
  const outMaxQty = useMemo(() => {
    const prod = products.find((p) => p.id === outForm.productId);
    return prod?.currentStock ?? 0;
  }, [outForm.productId, products]);

  // ═══════════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════════
  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-red-600" />
          <p className="text-sm font-medium text-slate-500">Loading stock data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* ── Header ── */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Stock Management</h1>
          <p className="text-sm text-slate-500 mt-0.5">Monitor inventory, record stock-in/out and view history</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => openStockOut()}
            className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-100 transition-colors"
          >
            <ArrowDownCircle size={16} /> Stock Out
          </button>
          <button
            onClick={() => openStockIn()}
            className="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700 transition-colors shadow-sm shadow-red-200"
          >
            <ArrowUpCircle size={16} /> Stock In
          </button>
        </div>
      </div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard label="Available"     value={available}       sub="Products in stock"      icon={Package}       bg="bg-green-50"  ic="text-green-600"  />
        <StatCard label="Low Stock"     value={lowStock}        sub="Below reorder level"    icon={AlertTriangle} bg="bg-amber-50"  ic="text-amber-600"  highlight={lowStock > 0} />
        <StatCard label="Sold Out"      value={soldOut}         sub="Zero stock items"       icon={X}             bg="bg-red-50"    ic="text-red-500"    highlight={soldOut > 0}  />
        <StatCard label="Inventory Value" value={fmt(totalValue)} sub="At purchase price"    icon={TrendingUp}    bg="bg-red-50"   ic="text-red-600"   />
      </div>

      {/* ── Low Stock Alert Banner ── */}
      {(lowStock > 0 || soldOut > 0) && (
        <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl px-5 py-4">
          <AlertTriangle className="w-5 h-5 text-amber-500 mt-0.5 shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-bold text-amber-800">Stock Alert</p>
            <div className="flex flex-wrap gap-2 mt-2">
              {products.filter((p) => getStatus(p) !== "Available").map((p) => (
                <span key={p.id}
                  className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                    p.currentStock === 0
                      ? "bg-red-100 text-red-700"
                      : "bg-amber-100 text-amber-700"
                  }`}
                >
                  {p.name} — {p.currentStock === 0 ? "OUT OF STOCK" : `${p.currentStock} left`}
                </span>
              ))}
            </div>
          </div>
          <button
            onClick={() => setStatusFilter("Low Stock")}
            className="text-xs font-semibold text-amber-700 hover:text-amber-900 whitespace-nowrap transition-colors"
          >
            View All →
          </button>
        </div>
      )}

      {/* ── Main Tabs ── */}
      <div className="flex gap-1 bg-slate-100 rounded-xl p-1 w-fit">
        {[
          { key: "overview", label: "📦 Stock Overview" },
          { key: "history",  label: "📋 Stock History"  },
        ].map((t) => (
          <button key={t.key} onClick={() => setMainTab(t.key as MainTab)}
            className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${
              mainTab === t.key
                ? "bg-white text-red-600 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ══════════════════════════════════════════════════════════
          TAB 1 — STOCK OVERVIEW
      ══════════════════════════════════════════════════════════ */}
      {mainTab === "overview" && (
        <div className="space-y-4">

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input type="text" placeholder="Search by name, ID, category…" value={search}
                onChange={(e) => setSearch(e.target.value)} className={inputCls + " pl-9"} />
            </div>
            <div className="relative">
              <select value={catFilter} onChange={(e) => setCatFilter(e.target.value)}
                className={inputCls + " w-44 appearance-none pr-8 cursor-pointer"}>
                {categories.map((c) => <option key={c}>{c}</option>)}
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>
            <div className="relative">
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
                className={inputCls + " w-44 appearance-none pr-8 cursor-pointer"}>
                {["All", "Available", "Low Stock", "Sold Out"].map((s) => <option key={s}>{s}</option>)}
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>
          </div>

          {/* Stock Table */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50">
                    {["Product ID","Product Name","Category","Current Stock","Reorder At","Purchase Price","Selling Price","Status","Actions"].map((h) => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wide whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-16 text-center">
                        <div className="flex flex-col items-center gap-2 text-slate-400">
                          <Package size={32} className="text-slate-300" />
                          <p className="text-sm font-medium">No products found</p>
                        </div>
                      </td>
                    </tr>
                  ) : filteredProducts.map((p) => {
                    const status = getStatus(p);
                    return (
                      <tr key={p.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                        <td className="px-4 py-3.5 font-mono text-xs text-slate-500">{p.id}</td>
                        <td className="px-4 py-3.5">
                          <p className="font-semibold text-slate-800 whitespace-nowrap">{p.name}</p>
                          <p className="text-xs text-slate-400">{p.unit}</p>
                        </td>
                        <td className="px-4 py-3.5 text-slate-500 whitespace-nowrap">{p.category}</td>
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-2">
                            {/* Mini stock bar */}
                            <div className="w-16 bg-slate-100 rounded-full h-1.5 shrink-0">
                              <div
                                className={`h-1.5 rounded-full transition-all ${
                                  status === "Available" ? "bg-green-500"
                                  : status === "Low Stock" ? "bg-amber-500"
                                  : "bg-red-400"
                                }`}
                                style={{ width: `${Math.min(100, (p.currentStock / Math.max(p.currentStock, 50)) * 100)}%` }}
                              />
                            </div>
                            <span className={`font-bold whitespace-nowrap ${
                              status === "Sold Out" ? "text-red-500" : status === "Low Stock" ? "text-amber-600" : "text-slate-900"
                            }`}>
                              {p.currentStock} {p.unit}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3.5 text-slate-500 whitespace-nowrap">{p.lowStockAt} {p.unit}</td>
                        <td className="px-4 py-3.5 text-slate-600 whitespace-nowrap">{fmt(p.purchasePrice)}</td>
                        <td className="px-4 py-3.5 font-semibold text-slate-800 whitespace-nowrap">{fmt(p.sellingPrice)}</td>
                        <td className="px-4 py-3.5">
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap ${statusStyle[status]}`}>
                            {status}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setViewProduct(p)}
                              className="flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-slate-800 transition-colors"
                            >
                              <Eye size={13} /> History
                            </button>
                            <button
                              onClick={() => openStockIn(p)}
                              className="flex items-center gap-1 text-xs font-semibold text-red-600 hover:text-red-800 bg-red-50 hover:bg-red-100 px-2 py-1 rounded-lg transition-colors"
                            >
                              <ArrowUpCircle size={13} /> In
                            </button>
                            <button
                              onClick={() => openStockOut(p)}
                              disabled={p.currentStock === 0}
                              className="flex items-center gap-1 text-xs font-semibold text-red-600 hover:text-red-800 bg-red-50 hover:bg-red-100 px-2 py-1 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                              <ArrowDownCircle size={13} /> Out
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {filteredProducts.length > 0 && (
              <div className="px-4 py-3 border-t border-slate-100 bg-slate-50 flex justify-between items-center">
                <p className="text-xs text-slate-400">
                  Showing <span className="font-semibold text-slate-600">{filteredProducts.length}</span> of{" "}
                  <span className="font-semibold text-slate-600">{products.length}</span> products
                </p>
                <p className="text-xs font-semibold text-slate-500">
                  Total Value: <span className="text-red-600">{fmt(filteredProducts.reduce((t, p) => t + p.currentStock * p.purchasePrice, 0))}</span>
                </p>
              </div>
            )}
          </div>

          {/* Sold Out Section */}
          {soldOut > 0 && (
            <div className="bg-white rounded-xl border border-red-100 overflow-hidden">
              <div className="px-5 py-3.5 border-b border-red-100 bg-red-50 flex items-center gap-2">
                <AlertTriangle size={15} className="text-red-500" />
                <h2 className="text-sm font-bold text-red-700">Sold Out Products</h2>
                <span className="ml-auto px-2.5 py-0.5 rounded-full bg-red-100 text-red-700 text-xs font-bold">{soldOut}</span>
              </div>
              <div className="divide-y divide-red-50">
                {products.filter((p) => p.currentStock === 0).map((p) => (
                  <div key={p.id} className="flex items-center justify-between px-5 py-3.5 hover:bg-red-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center">
                        <Package size={15} className="text-red-500" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-800">{p.name}</p>
                        <p className="text-xs text-slate-400">{p.id} · {p.category}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => openStockIn(p)}
                      className="flex items-center gap-1.5 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 px-3 py-1.5 rounded-lg transition-colors"
                    >
                      <ArrowUpCircle size={13} /> Restock
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════
          TAB 2 — STOCK HISTORY
      ══════════════════════════════════════════════════════════ */}
      {mainTab === "history" && (
        <div className="space-y-4">

          {/* History Stats */}
          <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
            <StatCard label="Total Records"  value={history.length}  sub="All time"            icon={History}       bg="bg-slate-100" ic="text-slate-600" />
            <StatCard label="Stock In"       value={totalStockIn}    sub="Total units added"   icon={ArrowUpCircle} bg="bg-red-50"   ic="text-red-600" />
            <StatCard label="Stock Out"      value={totalStockOut}   sub="Total units removed" icon={ArrowDownCircle} bg="bg-red-50"  ic="text-red-500"  />
            <StatCard label="Filtered Records" value={filteredHistory.length} sub="Current filter" icon={Filter} bg="bg-purple-50" ic="text-purple-600" />
          </div>

          {/* History Filters */}
          <div className="flex flex-col sm:flex-row gap-3 flex-wrap">
            <div className="relative flex-1 min-w-[180px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input type="text" placeholder="Search product, supplier…" value={histSearch}
                onChange={(e) => setHistSearch(e.target.value)} className={inputCls + " pl-9"} />
            </div>
            <div className="relative">
              <select value={histType} onChange={(e) => setHistType(e.target.value)}
                className={inputCls + " w-36 appearance-none pr-8 cursor-pointer"}>
                {["All", "IN", "OUT"].map((t) => <option key={t}>{t}</option>)}
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>
            <div className="relative">
              <select value={histProduct} onChange={(e) => setHistProduct(e.target.value)}
                className={inputCls + " w-52 appearance-none pr-8 cursor-pointer"}>
                <option value="All">All Products</option>
                {products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>
            <input type="date" value={histDate} onChange={(e) => setHistDate(e.target.value)}
              className="h-10 rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm text-slate-700 outline-none focus:border-red-400 focus:ring-2 focus:ring-red-500/20 transition-colors" />
            {(histSearch || histType !== "All" || histDate || histProduct !== "All") && (
              <button
                onClick={() => { setHistSearch(""); setHistType("All"); setHistDate(""); setHistProduct("All"); }}
                className="flex items-center gap-1.5 h-10 px-4 rounded-lg border border-slate-200 text-sm font-medium text-slate-500 hover:bg-slate-50 hover:text-red-500 transition-colors whitespace-nowrap"
              >
                <X size={14} /> Clear
              </button>
            )}
          </div>

          {/* History Table */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50">
                    {["ID","Product ID","Product Name","Type","Qty","Purchase Price","Supplier","Reason","Date","Note"].map((h) => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wide whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredHistory.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="py-16 text-center">
                        <div className="flex flex-col items-center gap-2 text-slate-400">
                          <History size={32} className="text-slate-300" />
                          <p className="text-sm font-medium">No history records found</p>
                        </div>
                      </td>
                    </tr>
                  ) : filteredHistory.map((h) => (
                    <tr key={h.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3.5 font-mono text-xs text-slate-400">{h.id}</td>
                      <td className="px-4 py-3.5 font-mono text-xs text-slate-500">{h.productId}</td>
                      <td className="px-4 py-3.5 font-semibold text-slate-800 whitespace-nowrap">{h.productName}</td>
                      <td className="px-4 py-3.5">
                        <span className={`flex items-center gap-1.5 text-xs font-bold w-fit px-2.5 py-0.5 rounded-full ${
                          h.type === "IN"
                            ? "bg-red-50 text-red-700"
                            : "bg-red-50 text-red-600"
                        }`}>
                          {h.type === "IN"
                            ? <ArrowUpCircle size={12} />
                            : <ArrowDownCircle size={12} />}
                          {h.type}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className={`font-bold ${h.type === "IN" ? "text-red-700" : "text-red-600"}`}>
                          {h.type === "IN" ? "+" : "−"}{h.quantity}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-slate-600 whitespace-nowrap">
                        {h.purchasePrice > 0 ? fmt(h.purchasePrice) : "—"}
                      </td>
                      <td className="px-4 py-3.5 text-slate-500 whitespace-nowrap max-w-[140px] truncate">
                        {h.supplier || "—"}
                      </td>
                      <td className="px-4 py-3.5">
                        {h.reason
                          ? <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${reasonStyle[h.reason]}`}>{h.reason}</span>
                          : <span className="text-slate-300">—</span>
                        }
                      </td>
                      <td className="px-4 py-3.5 text-slate-400 text-xs whitespace-nowrap">{h.date}</td>
                      <td className="px-4 py-3.5 text-slate-500 text-xs max-w-[160px] truncate">
                        {h.note || "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {filteredHistory.length > 0 && (
              <div className="px-4 py-3 border-t border-slate-100 bg-slate-50 flex justify-between items-center">
                <p className="text-xs text-slate-400">
                  <span className="font-semibold text-slate-600">{filteredHistory.length}</span> records
                </p>
                <div className="flex items-center gap-4 text-xs">
                  <span className="text-red-600 font-semibold">
                    IN: {filteredHistory.filter((h) => h.type === "IN").reduce((t, h) => t + h.quantity, 0)} units
                  </span>
                  <span className="text-red-500 font-semibold">
                    OUT: {filteredHistory.filter((h) => h.type === "OUT").reduce((t, h) => t + h.quantity, 0)} units
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════
          STOCK IN MODAL
      ══════════════════════════════════════════════════════════ */}
      {modal === "in" && (
        <Modal
          title="Stock In"
          sub="Add new stock to inventory"
          onClose={() => setModal(null)}
        >
          <div className="px-6 py-5 space-y-4">
            <Field label="Product *">
              <div className="relative">
                <select
                  value={inForm.productId}
                  onChange={(e) => handleInProductChange(e.target.value)}
                  className={inputCls + " appearance-none pr-8 cursor-pointer"}
                >
                  <option value="">— Select Product —</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} (Current: {p.currentStock} {p.unit})
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              </div>
            </Field>

            <div className="grid grid-cols-2 gap-4">
              <Field label="Quantity Added *">
                <input type="number" min={1} placeholder="0"
                  value={inForm.quantity || ""}
                  onChange={(e) => setInForm((p) => ({ ...p, quantity: Number(e.target.value) }))}
                  className={inputCls} />
              </Field>
              <Field label="Purchase Price (₹)">
                <input type="number" min={0} placeholder="0"
                  value={inForm.purchasePrice || ""}
                  onChange={(e) => setInForm((p) => ({ ...p, purchasePrice: Number(e.target.value) }))}
                  className={inputCls} />
              </Field>
            </div>

            <Field label="Supplier Name (Optional)">
              <input type="text" placeholder="e.g. TechZone Pvt Ltd"
                value={inForm.supplier}
                onChange={(e) => setInForm((p) => ({ ...p, supplier: e.target.value }))}
                className={inputCls} />
            </Field>

            <Field label="Date">
              <input type="date" value={inForm.date}
                onChange={(e) => setInForm((p) => ({ ...p, date: e.target.value }))}
                className={inputCls} />
            </Field>

            <Field label="Note (Optional)">
              <textarea placeholder="e.g. Regular restock, New batch…"
                value={inForm.note}
                onChange={(e) => setInForm((p) => ({ ...p, note: e.target.value }))}
                rows={2} className={inputCls + " resize-none"} />
            </Field>

            {/* Preview */}
            {inForm.productId && inForm.quantity > 0 && (() => {
              const prod = products.find((p) => p.id === inForm.productId);
              return prod ? (
                <div className="bg-red-50 rounded-xl border border-red-100 px-4 py-3 flex items-center justify-between">
                  <div>
                    <p className="text-xs text-red-600 font-medium">After this stock-in</p>
                    <p className="text-sm font-bold text-red-800 mt-0.5">
                      {prod.currentStock} → {prod.currentStock + inForm.quantity} {prod.unit}
                    </p>
                  </div>
                  {inForm.purchasePrice > 0 && (
                    <div className="text-right">
                      <p className="text-xs text-red-600 font-medium">Total Cost</p>
                      <p className="text-sm font-bold text-red-800">{fmt(inForm.purchasePrice * inForm.quantity)}</p>
                    </div>
                  )}
                </div>
              ) : null;
            })()}
          </div>

          <ModalFooter
            onCancel={() => setModal(null)}
            onConfirm={handleStockIn}
            confirmLabel="Confirm Stock In"
            confirmColor="bg-red-600 hover:bg-red-700 shadow-red-200"
            disabled={!inForm.productId || inForm.quantity <= 0}
          />
        </Modal>
      )}

      {/* ══════════════════════════════════════════════════════════
          STOCK OUT MODAL
      ══════════════════════════════════════════════════════════ */}
      {modal === "out" && (
        <Modal
          title="Stock Out"
          sub="Remove stock from inventory"
          onClose={() => setModal(null)}
        >
          <div className="px-6 py-5 space-y-4">
            <Field label="Product *">
              <div className="relative">
                <select
                  value={outForm.productId}
                  onChange={(e) => setOutForm((p) => ({ ...p, productId: e.target.value }))}
                  className={inputCls + " appearance-none pr-8 cursor-pointer"}
                >
                  <option value="">— Select Product —</option>
                  {products.filter((p) => p.currentStock > 0).map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} (Available: {p.currentStock} {p.unit})
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              </div>
            </Field>

            <div className="grid grid-cols-2 gap-4">
              <Field label={`Quantity * ${outMaxQty > 0 ? `(max ${outMaxQty})` : ""}`}>
                <input type="number" min={1} max={outMaxQty} placeholder="0"
                  value={outForm.quantity || ""}
                  onChange={(e) => setOutForm((p) => ({ ...p, quantity: Math.min(Number(e.target.value), outMaxQty) }))}
                  className={inputCls} />
              </Field>
              <Field label="Reason *">
                <div className="relative">
                  <select value={outForm.reason}
                    onChange={(e) => setOutForm((p) => ({ ...p, reason: e.target.value as StockOutReason }))}
                    className={inputCls + " appearance-none pr-8 cursor-pointer"}>
                    <option>Sold</option>
                    <option>Damaged</option>
                    <option>Return</option>
                  </select>
                  <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                </div>
              </Field>
            </div>

            <Field label="Date">
              <input type="date" value={outForm.date}
                onChange={(e) => setOutForm((p) => ({ ...p, date: e.target.value }))}
                className={inputCls} />
            </Field>

            <Field label="Note (Optional)">
              <textarea placeholder="e.g. Bulk sale to customer, Found damaged…"
                value={outForm.note}
                onChange={(e) => setOutForm((p) => ({ ...p, note: e.target.value }))}
                rows={2} className={inputCls + " resize-none"} />
            </Field>

            {/* Preview */}
            {outForm.productId && outForm.quantity > 0 && (() => {
              const prod = products.find((p) => p.id === outForm.productId);
              const newQty = prod ? prod.currentStock - outForm.quantity : 0;
              return prod ? (
                <div className={`rounded-xl border px-4 py-3 flex items-center justify-between ${
                  newQty === 0 ? "bg-red-50 border-red-100" : newQty <= prod.lowStockAt ? "bg-amber-50 border-amber-100" : "bg-slate-50 border-slate-100"
                }`}>
                  <div>
                    <p className={`text-xs font-medium ${newQty === 0 ? "text-red-600" : newQty <= prod.lowStockAt ? "text-amber-600" : "text-slate-500"}`}>
                      {newQty === 0 ? "⚠ Will be OUT OF STOCK" : newQty <= prod.lowStockAt ? "⚠ Will be LOW STOCK" : "After this stock-out"}
                    </p>
                    <p className={`text-sm font-bold mt-0.5 ${newQty === 0 ? "text-red-800" : newQty <= prod.lowStockAt ? "text-amber-800" : "text-slate-800"}`}>
                      {prod.currentStock} → {newQty} {prod.unit}
                    </p>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${reasonStyle[outForm.reason]}`}>
                    {outForm.reason}
                  </span>
                </div>
              ) : null;
            })()}
          </div>

          <ModalFooter
            onCancel={() => setModal(null)}
            onConfirm={handleStockOut}
            confirmLabel="Confirm Stock Out"
            confirmColor="bg-red-500 hover:bg-red-600 shadow-red-200"
            disabled={!outForm.productId || outForm.quantity <= 0}
          />
        </Modal>
      )}

      {/* ══════════════════════════════════════════════════════════
          VIEW PRODUCT HISTORY MODAL
      ══════════════════════════════════════════════════════════ */}
      {viewProduct && (
        <Modal
          title={viewProduct.name}
          sub={`${viewProduct.id} · ${viewProduct.category} · ${getStatus(viewProduct)}`}
          onClose={() => setViewProduct(null)}
          maxW="max-w-2xl"
        >
          <div className="px-6 py-5 space-y-5">

            {/* Product Info */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: "Current Stock",  value: `${viewProduct.currentStock} ${viewProduct.unit}`, color: viewProduct.currentStock === 0 ? "text-red-600" : viewProduct.currentStock <= viewProduct.lowStockAt ? "text-amber-600" : "text-green-600" },
                { label: "Purchase Price", value: fmt(viewProduct.purchasePrice), color: "text-slate-800" },
                { label: "Selling Price",  value: fmt(viewProduct.sellingPrice),  color: "text-red-700"  },
              ].map((r) => (
                <div key={r.label} className="bg-slate-50 rounded-xl border border-slate-100 p-3 text-center">
                  <p className={`text-base font-bold ${r.color}`}>{r.value}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{r.label}</p>
                </div>
              ))}
            </div>

            {/* Quick Actions */}
            <div className="flex gap-3">
              <button onClick={() => { setViewProduct(null); openStockIn(viewProduct); }}
                className="flex-1 flex items-center justify-center gap-2 h-9 rounded-lg bg-red-50 border border-red-100 text-sm font-semibold text-red-700 hover:bg-red-100 transition-colors">
                <ArrowUpCircle size={15} /> Stock In
              </button>
              <button onClick={() => { setViewProduct(null); openStockOut(viewProduct); }}
                disabled={viewProduct.currentStock === 0}
                className="flex-1 flex items-center justify-center gap-2 h-9 rounded-lg bg-red-50 border border-red-100 text-sm font-semibold text-red-600 hover:bg-red-100 transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
                <ArrowDownCircle size={15} /> Stock Out
              </button>
            </div>

            {/* History Table */}
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">
                Stock History ({productHistory.length} records)
              </p>
              {productHistory.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 gap-2 text-slate-400 border border-dashed border-slate-200 rounded-xl">
                  <History size={24} className="text-slate-300" />
                  <p className="text-sm">No history records for this product</p>
                </div>
              ) : (
                <div className="border border-slate-100 rounded-xl overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-100">
                        {["Date","Type","Qty","Supplier / Reason","Note"].map((h) => (
                          <th key={h} className="px-4 py-2.5 text-left text-xs font-semibold text-slate-400 uppercase tracking-wide whitespace-nowrap">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {productHistory.map((h) => (
                        <tr key={h.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50 transition-colors">
                          <td className="px-4 py-3 text-xs text-slate-500 whitespace-nowrap">{h.date}</td>
                          <td className="px-4 py-3">
                            <span className={`flex items-center gap-1 text-xs font-bold w-fit px-2 py-0.5 rounded-full ${h.type === "IN" ? "bg-red-50 text-red-700" : "bg-red-50 text-red-600"}`}>
                              {h.type === "IN" ? <ArrowUpCircle size={11} /> : <ArrowDownCircle size={11} />}
                              {h.type}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`text-sm font-bold ${h.type === "IN" ? "text-red-700" : "text-red-600"}`}>
                              {h.type === "IN" ? "+" : "−"}{h.quantity}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-slate-500 text-xs whitespace-nowrap">
                            {h.type === "IN" ? (h.supplier || "—") : (
                              h.reason
                                ? <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${reasonStyle[h.reason]}`}>{h.reason}</span>
                                : "—"
                            )}
                          </td>
                          <td className="px-4 py-3 text-slate-400 text-xs max-w-[160px] truncate">{h.note || "—"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          <div className="px-6 py-4 border-t border-slate-100">
            <button onClick={() => setViewProduct(null)}
              className="w-full h-10 rounded-lg border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">
              Close
            </button>
          </div>
        </Modal>
      )}

    </div>
  );
}