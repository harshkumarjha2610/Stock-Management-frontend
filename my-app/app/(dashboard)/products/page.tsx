"use client";

import { useState, useMemo, useRef, useEffect, useCallback } from "react";
import {
  Search, Plus, Eye, Pencil, Trash2, X, ChevronDown,
  Package, Tag, AlertTriangle, Camera, Upload, ScanLine,
  IndianRupee, Percent, BarChart3, ImageOff, CheckCircle,
  ArrowUpDown, Grid3X3, List, XCircle,
} from "lucide-react";

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════

type Product = {
  id:            string;
  name:          string;
  category:      string;
  brand:         string;
  purchasePrice: number;
  sellingPrice:  number;
  gstPercent:    number;
  stock:         number;
  minStockAlert: number;
  description:   string;
  barcode:       string;
  image:         string; // base64 data URL
  createdDate:   string;
  updatedDate:   string;
};

type ModalMode = "add" | "edit" | "view" | null;
type ViewMode  = "table" | "grid";
type SortKey   = "name" | "stock" | "sellingPrice" | "createdDate";

// ═══════════════════════════════════════════════════════════════
// MOCK DATA
// ═══════════════════════════════════════════════════════════════

const SAMPLE_IMG = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120' viewBox='0 0 120 120'%3E%3Crect width='120' height='120' fill='%23f1f5f9'/%3E%3Crect x='35' y='30' width='50' height='60' rx='6' fill='%23cbd5e1'/%3E%3Ccircle cx='60' cy='52' r='12' fill='%2394a3b8'/%3E%3Crect x='42' y='70' width='36' height='6' rx='3' fill='%2394a3b8'/%3E%3C/svg%3E";

const INITIAL_PRODUCTS: Product[] = [
  {
    id: "PRD-001", name: "Wireless Keyboard Pro", category: "Electronics", brand: "Logitech",
    purchasePrice: 850, sellingPrice: 1299, gstPercent: 18, stock: 45, minStockAlert: 10,
    description: "Full-size wireless keyboard with ergonomic design, 2.4GHz connectivity, and 24-month battery life.",
    barcode: "8901030814918", image: SAMPLE_IMG, createdDate: "2026-01-15", updatedDate: "2026-04-10",
  },
  {
    id: "PRD-002", name: "USB-C Hub 7-in-1", category: "Electronics", brand: "Anker",
    purchasePrice: 650, sellingPrice: 999, gstPercent: 18, stock: 8, minStockAlert: 10,
    description: "7-in-1 USB-C hub with HDMI 4K, USB 3.0×3, SD card reader, and 100W PD charging.",
    barcode: "0194252657188", image: SAMPLE_IMG, createdDate: "2026-01-20", updatedDate: "2026-04-12",
  },
  {
    id: "PRD-003", name: "Monitor Stand Adjustable", category: "Furniture", brand: "AmazonBasics",
    purchasePrice: 1600, sellingPrice: 2499, gstPercent: 12, stock: 22, minStockAlert: 8,
    description: "Height-adjustable monitor stand with 360° rotation, holds up to 27\" displays, cable management.",
    barcode: "8906096490200", image: SAMPLE_IMG, createdDate: "2026-02-01", updatedDate: "2026-03-25",
  },
  {
    id: "PRD-004", name: "Mechanical Mouse", category: "Electronics", brand: "Razer",
    purchasePrice: 550, sellingPrice: 849, gstPercent: 18, stock: 0, minStockAlert: 10,
    description: "High-precision gaming mouse with 16000 DPI optical sensor, 7 programmable buttons.",
    barcode: "0811069013124", image: SAMPLE_IMG, createdDate: "2026-02-10", updatedDate: "2026-04-14",
  },
  {
    id: "PRD-005", name: "Laptop Sleeve 15\"", category: "Accessories", brand: "Herschel",
    purchasePrice: 380, sellingPrice: 599, gstPercent: 12, stock: 60, minStockAlert: 15,
    description: "Water-resistant laptop sleeve with fleece lining, fits up to 15.6\" laptops.",
    barcode: "0840386100179", image: SAMPLE_IMG, createdDate: "2026-02-18", updatedDate: "2026-04-13",
  },
  {
    id: "PRD-006", name: "HDMI Cable 2m", category: "Accessories", brand: "iBall",
    purchasePrice: 180, sellingPrice: 299, gstPercent: 18, stock: 5, minStockAlert: 10,
    description: "High-speed HDMI 2.0 cable supporting 4K@60Hz, HDR, and 18Gbps bandwidth.",
    barcode: "8906037560155", image: SAMPLE_IMG, createdDate: "2026-03-01", updatedDate: "2026-04-11",
  },
  {
    id: "PRD-007", name: "Webcam 1080p Auto", category: "Electronics", brand: "Logitech",
    purchasePrice: 2100, sellingPrice: 3299, gstPercent: 18, stock: 18, minStockAlert: 5,
    description: "Full HD 1080p webcam with auto-focus, built-in stereo mic, and plug-and-play USB.",
    barcode: "5099206062573", image: SAMPLE_IMG, createdDate: "2026-03-10", updatedDate: "2026-04-15",
  },
  {
    id: "PRD-008", name: "Desk Organizer Set", category: "Furniture", brand: "",
    purchasePrice: 480, sellingPrice: 749, gstPercent: 12, stock: 30, minStockAlert: 8,
    description: "5-piece bamboo desk organizer set including pen holder, file tray, and paper rack.",
    barcode: "7350062381345", image: SAMPLE_IMG, createdDate: "2026-03-15", updatedDate: "2026-04-08",
  },
];

const CATEGORIES = ["Electronics", "Furniture", "Accessories", "Stationery", "Software", "Other"];
const GST_OPTIONS = [0, 5, 12, 18, 28];
const TODAY       = "2026-04-17";

// ═══════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════

function genId(list: Product[]) {
  const max = list.length
    ? Math.max(...list.map((p) => parseInt(p.id.split("-")[1] || "0")))
    : 0;
  return `PRD-${String(max + 1).padStart(3, "0")}`;
}

function fmt(n: number) {
  return "₹" + n.toLocaleString("en-IN");
}

function getStockBadge(p: Product) {
  if (p.stock === 0)              return { label: "Out of Stock", cls: "bg-red-50 text-red-600" };
  if (p.stock <= p.minStockAlert) return { label: "Low Stock",    cls: "bg-amber-50 text-amber-700" };
  return                                 { label: "In Stock",     cls: "bg-green-50 text-green-700" };
}

function sellingWithGST(p: Product) {
  return Math.round(p.sellingPrice * (1 + p.gstPercent / 100));
}

function margin(p: Product) {
  if (p.purchasePrice === 0) return 0;
  return Math.round(((p.sellingPrice - p.purchasePrice) / p.purchasePrice) * 100);
}

const EMPTY_FORM: Omit<Product, "id" | "createdDate" | "updatedDate"> = {
  name: "", category: "Electronics", brand: "", purchasePrice: 0, sellingPrice: 0,
  gstPercent: 18, stock: 0, minStockAlert: 5, description: "", barcode: "", image: "",
};

const inputCls =
  "h-10 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-colors";

const textareaCls =
  "w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-colors resize-none";

// ═══════════════════════════════════════════════════════════════
// SUB-COMPONENTS
// ═══════════════════════════════════════════════════════════════

function Field({ label, children, span = 1 }: { label: string; children: React.ReactNode; span?: number }) {
  return (
    <div className={`flex flex-col gap-1.5 ${span === 2 ? "col-span-2" : ""}`}>
      <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{label}</label>
      {children}
    </div>
  );
}

function StatCard({ label, value, sub, icon: Icon, bg, ic, highlight }: {
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

function ProductImage({ src, name, size = "md" }: { src: string; name: string; size?: "sm" | "md" | "lg" }) {
  const [error, setError] = useState(false);
  const dim = size === "sm" ? "w-10 h-10" : size === "lg" ? "w-24 h-24" : "w-14 h-14";
  const iconSize = size === "sm" ? 14 : size === "lg" ? 28 : 20;
  if (!src || error) {
    return (
      <div className={`${dim} rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0`}>
        <ImageOff size={iconSize} className="text-slate-300" />
      </div>
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src} alt={name} onError={() => setError(true)}
      className={`${dim} rounded-xl object-cover border border-slate-200 shrink-0`}
    />
  );
}

// ═══════════════════════════════════════════════════════════════
// BARCODE SCANNER COMPONENT
// ═══════════════════════════════════════════════════════════════

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Html5Qrcode: any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Html5QrcodeScanner: any;
  }
}

function BarcodeScanner({
  onScan, onClose,
}: {
  onScan: (code: string) => void;
  onClose: () => void;
}) {
  const scannerRef  = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const instanceRef = useRef<any>(null);
  const [status, setStatus]   = useState<"loading" | "active" | "error">("loading");
  const [manualCode, setManualCode] = useState("");
  const [errorMsg, setErrorMsg]     = useState("");

  useEffect(() => {
    // Load html5-qrcode script dynamically
    function startScanner() {
      if (!window.Html5Qrcode) {
        setStatus("error");
        setErrorMsg("Scanner library failed to load. Enter barcode manually.");
        return;
      }
      try {
        const html5Qrcode = new window.Html5Qrcode("barcode-reader-region");
        instanceRef.current = html5Qrcode;

        html5Qrcode.start(
          { facingMode: "environment" },
          { fps: 10, qrbox: { width: 250, height: 120 } },
          (decodedText: string) => {
            onScan(decodedText);
          },
          // ignore frame errors silently
          () => {}
        ).then(() => {
          setStatus("active");
        }).catch((err: Error) => {
          setStatus("error");
          setErrorMsg(`Camera access denied or unavailable. Enter barcode manually. (${err?.message || ""})`);
        });
      } catch (e) {
        setStatus("error");
        setErrorMsg("Scanner failed to initialize. Enter barcode manually.");
      }
    }

    if (window.Html5Qrcode) {
      startScanner();
    } else {
      const script = document.createElement("script");
      script.src = "https://unpkg.com/html5-qrcode@2.3.8/html5-qrcode.min.js";
      script.onload = startScanner;
      script.onerror = () => {
        setStatus("error");
        setErrorMsg("Scanner library failed to load. Enter barcode manually.");
      };
      document.head.appendChild(script);
    }

    return () => {
      if (instanceRef.current) {
        instanceRef.current.stop().catch(() => {});
        instanceRef.current = null;
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleManualSubmit() {
    if (manualCode.trim()) {
      onScan(manualCode.trim());
    }
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
              <ScanLine size={16} className="text-blue-600" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">Barcode Scanner</h2>
              <p className="text-xs text-slate-400">Point camera at barcode / QR</p>
            </div>
          </div>
          <button onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 flex items-center justify-center transition-colors">
            <X size={16} />
          </button>
        </div>

        {/* Scanner region */}
        <div className="p-5 space-y-4">
          {status === "loading" && (
            <div className="flex flex-col items-center justify-center h-48 gap-3">
              <div className="w-8 h-8 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
              <p className="text-sm text-slate-500">Starting camera…</p>
            </div>
          )}

          {status === "error" && (
            <div className="flex flex-col items-center justify-center h-32 gap-2 bg-red-50 rounded-xl border border-red-100">
              <XCircle size={24} className="text-red-400" />
              <p className="text-xs text-red-600 text-center px-4">{errorMsg}</p>
            </div>
          )}

          {/* Camera view */}
          <div
            id="barcode-reader-region"
            ref={scannerRef}
            className={`rounded-xl overflow-hidden border border-slate-200 ${status !== "active" ? "hidden" : ""}`}
            style={{ minHeight: 220 }}
          />

          {/* Scan line animation overlay when active */}
          {status === "active" && (
            <div className="flex items-center gap-2 text-xs text-green-600 font-semibold">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              Scanner active — align barcode in frame
            </div>
          )}

          {/* Manual entry */}
          <div className="border-t border-slate-100 pt-4">
            <p className="text-xs text-slate-500 font-medium mb-2">Or enter barcode manually:</p>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="e.g. 8901030814918"
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleManualSubmit()}
                className={inputCls}
              />
              <button
                onClick={handleManualSubmit}
                disabled={!manualCode.trim()}
                className="h-10 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// IMAGE UPLOAD COMPONENT
// ═══════════════════════════════════════════════════════════════

function ImageUploader({
  value, onChange,
}: {
  value: string;
  onChange: (dataUrl: string) => void;
}) {
  const inputRef  = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  function handleFile(file: File) {
    if (!file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) onChange(e.target.result as string);
    };
    reader.readAsDataURL(file);
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }

  return (
    <div className="space-y-3">
      {/* Preview */}
      {value ? (
        <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden border border-slate-200 bg-slate-50">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={value} alt="Product" className="w-full h-full object-contain" />
          <button
            onClick={() => onChange("")}
            className="absolute top-2 right-2 w-7 h-7 rounded-lg bg-white/90 hover:bg-red-50 text-slate-500 hover:text-red-600 flex items-center justify-center shadow-sm transition-colors border border-slate-200"
          >
            <X size={13} />
          </button>
          <button
            onClick={() => inputRef.current?.click()}
            className="absolute bottom-2 right-2 flex items-center gap-1.5 px-3 py-1.5 bg-white/90 hover:bg-white rounded-lg text-xs font-semibold text-slate-700 shadow-sm transition-colors border border-slate-200"
          >
            <Upload size={12} /> Replace
          </button>
        </div>
      ) : (
        /* Drop zone */
        <div
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          className={`flex flex-col items-center justify-center gap-3 w-full aspect-[4/3] rounded-xl border-2 border-dashed cursor-pointer transition-all ${
            dragging
              ? "border-blue-400 bg-blue-50"
              : "border-slate-200 bg-slate-50 hover:border-blue-300 hover:bg-blue-50/50"
          }`}
        >
          <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center shadow-sm">
            <Camera size={20} className="text-slate-400" />
          </div>
          <div className="text-center">
            <p className="text-sm font-semibold text-slate-600">Click or drag image here</p>
            <p className="text-xs text-slate-400 mt-0.5">PNG, JPG, WEBP up to 5MB</p>
          </div>
        </div>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
          e.target.value = "";
        }}
      />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// PRODUCT FORM MODAL
// ═══════════════════════════════════════════════════════════════

function ProductModal({
  mode, product, onSave, onClose, allProducts,
}: {
  mode: "add" | "edit" | "view";
  product:     Product | null;
  onSave:      (p: Product) => void;
  onClose:     () => void;
  allProducts: Product[];
}) {
  const isView = mode === "view";
  const [form, setForm] = useState<Omit<Product, "id" | "createdDate" | "updatedDate">>(() => {
    if (product) {
      const { id, createdDate, updatedDate, ...rest } = product;
      return rest;
    }
    return { ...EMPTY_FORM };
  });
  const [showScanner, setShowScanner] = useState(false);
  const [saved, setSaved]             = useState(false);

  function set<K extends keyof typeof form>(k: K, v: typeof form[K]) {
    setForm((p) => ({ ...p, [k]: v }));
  }

  function handleSave() {
    if (!form.name.trim()) return;
    const now = TODAY;
    const saved: Product = product && mode === "edit"
      ? { ...product, ...form, updatedDate: now }
      : { ...form, id: genId(allProducts), createdDate: now, updatedDate: now };
    onSave(saved);
    setSaved(true);
    setTimeout(() => onClose(), 400);
  }

  const marginVal = form.purchasePrice > 0
    ? Math.round(((form.sellingPrice - form.purchasePrice) / form.purchasePrice) * 100)
    : 0;

  const sellingWithTax = Math.round(form.sellingPrice * (1 + form.gstPercent / 100));

  if (isView && product) {
    const badge = getStockBadge(product);
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
        <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden max-h-[92vh] flex flex-col">

          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0">
            <div className="flex items-center gap-3">
              <ProductImage src={product.image} name={product.name} size="md" />
              <div>
                <h2 className="text-base font-bold text-slate-900">{product.name}</h2>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-slate-400 font-mono">{product.id}</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${badge.cls}`}>
                    {badge.label}
                  </span>
                </div>
              </div>
            </div>
            <button onClick={onClose}
              className="w-8 h-8 rounded-lg hover:bg-slate-100 text-slate-400 flex items-center justify-center transition-colors">
              <X size={16} />
            </button>
          </div>

          <div className="overflow-y-auto flex-1 px-6 py-5 space-y-6">

            {/* Image large */}
            {product.image && (
              <div className="w-full h-48 rounded-xl overflow-hidden border border-slate-200 bg-slate-50">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={product.image} alt={product.name} className="w-full h-full object-contain" />
              </div>
            )}

            {/* Key Metrics */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: "Purchase Price", value: fmt(product.purchasePrice), color: "text-slate-800" },
                { label: "Selling Price",  value: fmt(product.sellingPrice),  color: "text-blue-700"  },
                { label: "With GST",       value: fmt(sellingWithGST(product)), color: "text-indigo-700" },
                { label: "Margin",         value: `${margin(product)}%`,      color: margin(product) >= 0 ? "text-green-700" : "text-red-600" },
                { label: "Stock Qty",      value: `${product.stock} pcs`,     color: product.stock === 0 ? "text-red-600" : product.stock <= product.minStockAlert ? "text-amber-600" : "text-green-700" },
                { label: "GST Rate",       value: `${product.gstPercent}%`,   color: "text-slate-800" },
              ].map((m) => (
                <div key={m.label} className="bg-slate-50 rounded-xl border border-slate-100 px-3 py-3 text-center">
                  <p className={`text-sm font-bold ${m.color}`}>{m.value}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{m.label}</p>
                </div>
              ))}
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: "Category",   value: product.category    },
                { label: "Brand",      value: product.brand || "—"},
                { label: "Barcode",    value: product.barcode || "—" },
                { label: "Min Alert",  value: `${product.minStockAlert} pcs` },
                { label: "Created",    value: product.createdDate  },
                { label: "Updated",    value: product.updatedDate  },
              ].map((d) => (
                <div key={d.label}>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">{d.label}</p>
                  <p className="text-sm text-slate-800 font-medium mt-0.5">{d.value}</p>
                </div>
              ))}
            </div>

            {/* Description */}
            {product.description && (
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1.5">Description</p>
                <p className="text-sm text-slate-600 leading-relaxed">{product.description}</p>
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

  // ── Add / Edit Form ──
  return (
    <>
      {showScanner && (
        <BarcodeScanner
          onScan={(code) => { set("barcode", code); setShowScanner(false); }}
          onClose={() => setShowScanner(false)}
        />
      )}

      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
        <div className="w-full max-w-3xl bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden max-h-[94vh] flex flex-col">

          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                {mode === "add" ? "Add New Product" : `Edit Product — ${product?.id}`}
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                {mode === "add" ? "Fill in product details below" : "Update the product information"}
              </p>
            </div>
            <button onClick={onClose}
              className="w-8 h-8 rounded-lg hover:bg-slate-100 text-slate-400 flex items-center justify-center transition-colors">
              <X size={16} />
            </button>
          </div>

          <div className="overflow-y-auto flex-1">
            <div className="grid grid-cols-[1fr_280px] divide-x divide-slate-100">

              {/* ── Left: Form Fields ── */}
              <div className="px-6 py-5 space-y-5">

                {/* Basic Info */}
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Basic Information</p>
                  <div className="grid grid-cols-2 gap-4">
                    <Field label="Product Name *" span={2}>
                      <input type="text" placeholder="e.g. Wireless Keyboard Pro"
                        value={form.name} onChange={(e) => set("name", e.target.value)}
                        className={inputCls} />
                    </Field>
                    <Field label="Category *">
                      <div className="relative">
                        <select value={form.category} onChange={(e) => set("category", e.target.value)}
                          className={inputCls + " appearance-none pr-8 cursor-pointer"}>
                          {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                        </select>
                        <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                      </div>
                    </Field>
                    <Field label="Brand (Optional)">
                      <input type="text" placeholder="e.g. Logitech"
                        value={form.brand} onChange={(e) => set("brand", e.target.value)}
                        className={inputCls} />
                    </Field>
                  </div>
                </div>

                {/* Barcode */}
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Barcode / SKU</p>
                  <Field label="Barcode / EAN / UPC">
                    <div className="flex gap-2">
                      <input type="text" placeholder="e.g. 8901030814918"
                        value={form.barcode} onChange={(e) => set("barcode", e.target.value)}
                        className={inputCls} />
                      <button
                        type="button"
                        onClick={() => setShowScanner(true)}
                        className="h-10 flex items-center gap-2 px-4 rounded-lg border border-blue-200 bg-blue-50 hover:bg-blue-100 text-sm font-semibold text-blue-700 transition-colors whitespace-nowrap shrink-0"
                      >
                        <ScanLine size={16} /> Scan
                      </button>
                    </div>
                  </Field>
                </div>

                {/* Pricing */}
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Pricing</p>
                  <div className="grid grid-cols-3 gap-4">
                    <Field label="Purchase Price (₹) *">
                      <div className="relative">
                        <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                        <input type="number" min={0} placeholder="0"
                          value={form.purchasePrice || ""}
                          onChange={(e) => set("purchasePrice", Number(e.target.value))}
                          className={inputCls + " pl-8"} />
                      </div>
                    </Field>
                    <Field label="Selling Price (₹) *">
                      <div className="relative">
                        <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                        <input type="number" min={0} placeholder="0"
                          value={form.sellingPrice || ""}
                          onChange={(e) => set("sellingPrice", Number(e.target.value))}
                          className={inputCls + " pl-8"} />
                      </div>
                    </Field>
                    <Field label="GST %">
                      <div className="relative">
                        <Percent className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                        <select value={form.gstPercent}
                          onChange={(e) => set("gstPercent", Number(e.target.value))}
                          className={inputCls + " pl-8 appearance-none pr-8 cursor-pointer"}>
                          {GST_OPTIONS.map((g) => <option key={g} value={g}>{g}%</option>)}
                        </select>
                        <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                      </div>
                    </Field>
                  </div>

                  {/* Live Pricing Preview */}
                  {(form.purchasePrice > 0 || form.sellingPrice > 0) && (
                    <div className="mt-3 grid grid-cols-3 gap-2">
                      <div className="bg-slate-50 rounded-lg border border-slate-100 px-3 py-2 text-center">
                        <p className="text-xs text-slate-400">Margin</p>
                        <p className={`text-sm font-bold ${marginVal >= 0 ? "text-green-700" : "text-red-600"}`}>
                          {marginVal}%
                        </p>
                      </div>
                      <div className="bg-slate-50 rounded-lg border border-slate-100 px-3 py-2 text-center">
                        <p className="text-xs text-slate-400">Profit/Unit</p>
                        <p className={`text-sm font-bold ${form.sellingPrice - form.purchasePrice >= 0 ? "text-green-700" : "text-red-600"}`}>
                          {fmt(form.sellingPrice - form.purchasePrice)}
                        </p>
                      </div>
                      <div className="bg-indigo-50 rounded-lg border border-indigo-100 px-3 py-2 text-center">
                        <p className="text-xs text-indigo-500">With GST</p>
                        <p className="text-sm font-bold text-indigo-700">{fmt(sellingWithTax)}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Stock */}
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Stock</p>
                  <div className="grid grid-cols-2 gap-4">
                    <Field label="Stock Quantity *">
                      <input type="number" min={0} placeholder="0"
                        value={form.stock || ""}
                        onChange={(e) => set("stock", Number(e.target.value))}
                        className={inputCls} />
                    </Field>
                    <Field label="Min Stock Alert Level">
                      <input type="number" min={0} placeholder="5"
                        value={form.minStockAlert || ""}
                        onChange={(e) => set("minStockAlert", Number(e.target.value))}
                        className={inputCls} />
                    </Field>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Description</p>
                  <textarea
                    placeholder="Optional product description, specs, notes…"
                    value={form.description}
                    onChange={(e) => set("description", e.target.value)}
                    rows={3}
                    className={textareaCls}
                  />
                </div>
              </div>

              {/* ── Right: Image ── */}
              <div className="px-5 py-5">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Product Image</p>
                <ImageUploader value={form.image} onChange={(url) => set("image", url)} />

                <div className="mt-5 space-y-2">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Tips</p>
                  {[
                    "Use a white/light background",
                    "Minimum 300×300 pixels",
                    "PNG or JPG recommended",
                    "Max 5MB file size",
                  ].map((t) => (
                    <div key={t} className="flex items-start gap-2">
                      <CheckCircle size={12} className="text-green-500 mt-0.5 shrink-0" />
                      <p className="text-xs text-slate-500">{t}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex gap-3 px-6 py-4 border-t border-slate-100 shrink-0">
            <button onClick={onClose}
              className="flex-1 h-10 rounded-lg border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={!form.name.trim() || saved}
              className="flex-1 h-10 rounded-lg bg-blue-600 hover:bg-blue-700 text-sm font-semibold text-white transition-colors shadow-sm shadow-blue-200 disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {saved ? (
                <><CheckCircle size={16} /> Saved!</>
              ) : (
                mode === "add" ? "Add Product" : "Save Changes"
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

// ═══════════════════════════════════════════════════════════════
// MAIN PAGE
// ═══════════════════════════════════════════════════════════════

export default function ProductsPage() {
  const [products, setProducts]     = useState<Product[]>(INITIAL_PRODUCTS);
  const [search, setSearch]         = useState("");
  const [catFilter, setCatFilter]   = useState("All");
  const [stockFilter, setStockFilter] = useState("All");
  const [sortKey, setSortKey]       = useState<SortKey>("createdDate");
  const [sortDir, setSortDir]       = useState<"asc" | "desc">("desc");
  const [viewMode, setViewMode]     = useState<ViewMode>("table");
  const [modal, setModal]           = useState<ModalMode>(null);
  const [selected, setSelected]     = useState<Product | null>(null);
  const [deleteId, setDeleteId]     = useState<string | null>(null);

  // ── Derived ──────────────────────────────────────────────────
  const categories = useMemo(
    () => ["All", ...Array.from(new Set(products.map((p) => p.category)))],
    [products]
  );

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return products
      .filter((p) => {
        const matchQ  = p.name.toLowerCase().includes(q) || p.id.toLowerCase().includes(q)
                     || p.brand.toLowerCase().includes(q) || p.barcode.includes(q)
                     || p.category.toLowerCase().includes(q);
        const matchC  = catFilter === "All"    || p.category === catFilter;
        const badge   = getStockBadge(p).label;
        const matchS  = stockFilter === "All"  || badge === stockFilter;
        return matchQ && matchC && matchS;
      })
      .sort((a, b) => {
        let va: number | string = 0;
        let vb: number | string = 0;
        if (sortKey === "name")         { va = a.name;         vb = b.name;         }
        if (sortKey === "stock")        { va = a.stock;        vb = b.stock;        }
        if (sortKey === "sellingPrice") { va = a.sellingPrice; vb = b.sellingPrice; }
        if (sortKey === "createdDate")  { va = a.createdDate;  vb = b.createdDate;  }
        if (va < vb) return sortDir === "asc" ? -1 : 1;
        if (va > vb) return sortDir === "asc" ?  1 : -1;
        return 0;
      });
  }, [products, search, catFilter, stockFilter, sortKey, sortDir]);

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(key); setSortDir("asc"); }
  }

  function openAdd() {
    setSelected(null);
    setModal("add");
  }

  function openEdit(p: Product) {
    setSelected(p);
    setModal("edit");
  }

  function openView(p: Product) {
    setSelected(p);
    setModal("view");
  }

  function handleSave(p: Product) {
    setProducts((prev) => {
      const exists = prev.find((x) => x.id === p.id);
      return exists ? prev.map((x) => (x.id === p.id ? p : x)) : [p, ...prev];
    });
  }

  function handleDelete(id: string) {
    setProducts((prev) => prev.filter((p) => p.id !== id));
    setDeleteId(null);
  }

  // Stats
  const inStockCount  = products.filter((p) => getStockBadge(p).label === "In Stock").length;
  const lowCount      = products.filter((p) => getStockBadge(p).label === "Low Stock").length;
  const outCount      = products.filter((p) => getStockBadge(p).label === "Out of Stock").length;
  const totalValue    = products.reduce((t, p) => t + p.stock * p.purchasePrice, 0);

  // ── Render ───────────────────────────────────────────────────
  return (
    <>
      <div className="space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-xl font-bold text-slate-900">Product Management</h1>
            <p className="text-sm text-slate-500 mt-0.5">
              {products.length} products · {fmt(totalValue)} inventory value
            </p>
          </div>
          <button
            onClick={openAdd}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition-colors shadow-sm shadow-blue-200"
          >
            <Plus size={16} /> Add Product
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
          <StatCard label="Total Products" value={products.length}  sub="All categories"     icon={Package}       bg="bg-blue-50"   ic="text-blue-600"   />
          <StatCard label="In Stock"        value={inStockCount}    sub="Available"          icon={CheckCircle}   bg="bg-green-50"  ic="text-green-600"  />
          <StatCard label="Low / Out"       value={`${lowCount} / ${outCount}`} sub="Need attention" icon={AlertTriangle} bg="bg-amber-50"  ic="text-amber-600"  highlight={lowCount + outCount > 0} />
          <StatCard label="Inventory Value" value={fmt(totalValue)} sub="At purchase price"  icon={BarChart3}     bg="bg-purple-50" ic="text-purple-600" />
        </div>

        {/* Alert Banner */}
        {(lowCount > 0 || outCount > 0) && (
          <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl px-5 py-4">
            <AlertTriangle className="w-5 h-5 text-amber-500 mt-0.5 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-amber-800">Stock Alert</p>
              <div className="flex flex-wrap gap-1.5 mt-2">
                {products
                  .filter((p) => getStockBadge(p).label !== "In Stock")
                  .map((p) => {
                    const b = getStockBadge(p);
                    return (
                      <button
                        key={p.id}
                        onClick={() => openView(p)}
                        className={`px-2.5 py-0.5 rounded-full text-xs font-semibold transition-opacity hover:opacity-70 ${b.cls}`}
                      >
                        {p.name} — {p.stock === 0 ? "OUT" : `${p.stock} left`}
                      </button>
                    );
                  })}
              </div>
            </div>
          </div>
        )}

        {/* Filters Toolbar */}
        <div className="flex flex-col sm:flex-row gap-3 flex-wrap">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input type="text" placeholder="Search by name, ID, brand, barcode…"
              value={search} onChange={(e) => setSearch(e.target.value)}
              className={inputCls + " pl-9"} />
            {search && (
              <button onClick={() => setSearch("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                <X size={14} />
              </button>
            )}
          </div>

          {/* Category */}
          <div className="relative">
            <select value={catFilter} onChange={(e) => setCatFilter(e.target.value)}
              className={inputCls + " w-44 appearance-none pr-8 cursor-pointer"}>
              {categories.map((c) => <option key={c}>{c}</option>)}
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          </div>

          {/* Stock Status */}
          <div className="relative">
            <select value={stockFilter} onChange={(e) => setStockFilter(e.target.value)}
              className={inputCls + " w-44 appearance-none pr-8 cursor-pointer"}>
              {["All", "In Stock", "Low Stock", "Out of Stock"].map((s) => <option key={s}>{s}</option>)}
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          </div>

          {/* View Toggle */}
          <div className="flex gap-1 bg-slate-100 rounded-lg p-1">
            <button onClick={() => setViewMode("table")}
              className={`w-9 h-8 rounded-md flex items-center justify-center transition-all ${viewMode === "table" ? "bg-white text-blue-600 shadow-sm" : "text-slate-400 hover:text-slate-600"}`}>
              <List size={15} />
            </button>
            <button onClick={() => setViewMode("grid")}
              className={`w-9 h-8 rounded-md flex items-center justify-center transition-all ${viewMode === "grid" ? "bg-white text-blue-600 shadow-sm" : "text-slate-400 hover:text-slate-600"}`}>
              <Grid3X3 size={15} />
            </button>
          </div>
        </div>

        {/* ── TABLE VIEW ── */}
        {viewMode === "table" && (
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50">
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wide whitespace-nowrap">Image</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wide whitespace-nowrap">
                      <button onClick={() => toggleSort("name")} className="flex items-center gap-1 hover:text-slate-700 transition-colors">
                        Product <ArrowUpDown size={12} className={sortKey === "name" ? "text-blue-500" : ""} />
                      </button>
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wide whitespace-nowrap">Category / Brand</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wide whitespace-nowrap">
                      <button onClick={() => toggleSort("sellingPrice")} className="flex items-center gap-1 hover:text-slate-700 transition-colors">
                        Pricing <ArrowUpDown size={12} className={sortKey === "sellingPrice" ? "text-blue-500" : ""} />
                      </button>
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wide whitespace-nowrap">GST</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wide whitespace-nowrap">
                      <button onClick={() => toggleSort("stock")} className="flex items-center gap-1 hover:text-slate-700 transition-colors">
                        Stock <ArrowUpDown size={12} className={sortKey === "stock" ? "text-blue-500" : ""} />
                      </button>
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wide whitespace-nowrap">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wide whitespace-nowrap">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-16 text-center">
                        <div className="flex flex-col items-center gap-3 text-slate-400">
                          <Package size={36} className="text-slate-200" />
                          <p className="text-sm font-medium">No products found</p>
                          {(search || catFilter !== "All" || stockFilter !== "All") && (
                            <button
                              onClick={() => { setSearch(""); setCatFilter("All"); setStockFilter("All"); }}
                              className="text-xs text-blue-600 hover:underline"
                            >
                              Clear filters
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ) : filtered.map((p) => {
                    const badge = getStockBadge(p);
                    const m     = margin(p);
                    return (
                      <tr key={p.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors group">
                        <td className="px-4 py-3">
                          <ProductImage src={p.image} name={p.name} size="sm" />
                        </td>
                        <td className="px-4 py-3">
                          <p className="font-semibold text-slate-800 whitespace-nowrap">{p.name}</p>
                          <p className="text-xs font-mono text-slate-400 mt-0.5">{p.id}</p>
                          {p.barcode && (
                            <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                              <ScanLine size={10} className="text-slate-300" /> {p.barcode}
                            </p>
                          )}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <p className="text-sm text-slate-700">{p.category}</p>
                          <p className="text-xs text-slate-400">{p.brand || "—"}</p>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <p className="font-bold text-slate-900">{fmt(p.sellingPrice)}</p>
                          <p className="text-xs text-slate-400">Cost: {fmt(p.purchasePrice)}</p>
                          <p className={`text-xs font-semibold ${m >= 0 ? "text-green-600" : "text-red-500"}`}>
                            {m >= 0 ? "+" : ""}{m}% margin
                          </p>
                        </td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-xs font-semibold">{p.gstPercent}%</span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <p className={`font-bold ${badge.label === "Out of Stock" ? "text-red-500" : badge.label === "Low Stock" ? "text-amber-600" : "text-slate-900"}`}>
                            {p.stock} pcs
                          </p>
                          <p className="text-xs text-slate-400">Alert at {p.minStockAlert}</p>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap ${badge.cls}`}>
                            {badge.label}
                          </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="flex items-center gap-2 opacity-80 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => openView(p)}
                              className="flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-800 transition-colors">
                              <Eye size={13} /> View
                            </button>
                            <button onClick={() => openEdit(p)}
                              className="flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-slate-800 transition-colors">
                              <Pencil size={13} /> Edit
                            </button>
                            <button onClick={() => setDeleteId(p.id)}
                              className="flex items-center gap-1 text-xs font-medium text-red-400 hover:text-red-600 transition-colors">
                              <Trash2 size={13} /> Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {filtered.length > 0 && (
              <div className="px-4 py-3 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
                <p className="text-xs text-slate-400">
                  Showing <span className="font-semibold text-slate-600">{filtered.length}</span> of{" "}
                  <span className="font-semibold text-slate-600">{products.length}</span> products
                </p>
                <p className="text-xs text-slate-500 font-semibold">
                  Value: <span className="text-blue-600">{fmt(filtered.reduce((t, p) => t + p.stock * p.purchasePrice, 0))}</span>
                </p>
              </div>
            )}
          </div>
        )}

        {/* ── GRID VIEW ── */}
        {viewMode === "grid" && (
          <>
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center gap-3 py-20 text-slate-400">
                <Package size={40} className="text-slate-200" />
                <p className="text-sm font-medium">No products found</p>
                <button onClick={() => { setSearch(""); setCatFilter("All"); setStockFilter("All"); }}
                  className="text-xs text-blue-600 hover:underline">Clear filters</button>
              </div>
            ) : (
              <div className="grid grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
                {filtered.map((p) => {
                  const badge = getStockBadge(p);
                  const m     = margin(p);
                  return (
                    <div key={p.id}
                      className="bg-white rounded-xl border border-slate-200 overflow-hidden hover:border-blue-200 hover:shadow-md transition-all group">
                      {/* Image */}
                      <div className="relative w-full aspect-[4/3] bg-slate-50 border-b border-slate-100">
                        {p.image ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={p.image} alt={p.name} className="w-full h-full object-contain" />
                        ) : (
                          <div className="flex items-center justify-center h-full">
                            <ImageOff size={28} className="text-slate-200" />
                          </div>
                        )}
                        <span className={`absolute top-2 right-2 px-2 py-0.5 rounded-full text-xs font-semibold ${badge.cls}`}>
                          {badge.label}
                        </span>
                      </div>

                      {/* Content */}
                      <div className="p-4 space-y-3">
                        <div>
                          <p className="font-bold text-slate-900 leading-tight line-clamp-2">{p.name}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-slate-400 font-mono">{p.id}</span>
                            <span className="text-xs text-slate-300">·</span>
                            <span className="text-xs text-slate-500">{p.category}</span>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div className="bg-slate-50 rounded-lg p-2 text-center">
                            <p className="text-xs text-slate-400">Selling</p>
                            <p className="text-sm font-bold text-slate-900">{fmt(p.sellingPrice)}</p>
                          </div>
                          <div className="bg-slate-50 rounded-lg p-2 text-center">
                            <p className="text-xs text-slate-400">Stock</p>
                            <p className={`text-sm font-bold ${badge.label === "Out of Stock" ? "text-red-500" : badge.label === "Low Stock" ? "text-amber-600" : "text-slate-900"}`}>
                              {p.stock} pcs
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className={`text-xs font-bold ${m >= 0 ? "text-green-600" : "text-red-500"}`}>
                            {m >= 0 ? "+" : ""}{m}% margin
                          </span>
                          <span className="px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 text-xs font-semibold">{p.gstPercent}% GST</span>
                        </div>

                        <div className="flex gap-2 pt-1 border-t border-slate-100">
                          <button onClick={() => openView(p)}
                            className="flex-1 flex items-center justify-center gap-1.5 h-8 rounded-lg bg-slate-50 hover:bg-blue-50 text-xs font-semibold text-slate-600 hover:text-blue-700 transition-colors">
                            <Eye size={13} /> View
                          </button>
                          <button onClick={() => openEdit(p)}
                            className="flex-1 flex items-center justify-center gap-1.5 h-8 rounded-lg bg-slate-50 hover:bg-slate-100 text-xs font-semibold text-slate-600 transition-colors">
                            <Pencil size={13} /> Edit
                          </button>
                          <button onClick={() => setDeleteId(p.id)}
                            className="w-8 h-8 rounded-lg bg-slate-50 hover:bg-red-50 text-slate-400 hover:text-red-500 flex items-center justify-center transition-colors">
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>

      {/* ── Product Add/Edit/View Modal ── */}
      {modal && (
        <ProductModal
          mode={modal}
          product={selected}
          onSave={handleSave}
          onClose={() => { setModal(null); setSelected(null); }}
          allProducts={products}
        />
      )}

      {/* ── Delete Confirm ── */}
      {deleteId && (() => {
        const p = products.find((x) => x.id === deleteId);
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
            <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
              <div className="px-6 py-5 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto">
                  <Trash2 size={20} className="text-red-600" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Delete Product?</h3>
                  <p className="text-sm text-slate-500 mt-1">
                    <span className="font-semibold text-slate-700">{p?.name}</span> will be permanently removed.
                    This cannot be undone.
                  </p>
                </div>
              </div>
              <div className="flex gap-3 px-6 pb-5">
                <button onClick={() => setDeleteId(null)}
                  className="flex-1 h-10 rounded-lg border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">
                  Cancel
                </button>
                <button onClick={() => handleDelete(deleteId)}
                  className="flex-1 h-10 rounded-lg bg-red-500 hover:bg-red-600 text-sm font-semibold text-white transition-colors">
                  Delete
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </>
  );
}