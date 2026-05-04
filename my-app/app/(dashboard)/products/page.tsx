"use client";

import { useState, useMemo, useRef } from "react";
import {
  Search, Plus, Eye, Pencil, Trash2, X, ChevronDown,
  Package, Tag, AlertTriangle, Camera, Upload,
  IndianRupee, Percent, BarChart3, ImageOff, CheckCircle,
  ArrowUpDown, Grid3X3, List, XCircle, Shirt,
} from "lucide-react";

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════

type ClothingProduct = {
  id: string;
  name: string;
  category: string;       // Shirt, Pant, Kurti, etc.
  gender: string;         // Men, Women, Kids, Unisex
  brand: string;
  fabric: string;         // Cotton, Polyester, etc.
  color: string;
  sizes: SizeStock[];     // per-size stock
  purchasePrice: number;
  sellingPrice: number;
  gstPercent: number;
  minStockAlert: number;
  description: string;
  sku: string;
  image: string;
  createdDate: string;
};

type SizeStock = {
  size: string;   // XS, S, M, L, XL, XXL, 28, 30, 32...
  qty: number;
};

type ModalMode = "add" | "edit" | "view" | null;
type ViewMode  = "table" | "grid";
type SortKey   = "name" | "totalStock" | "sellingPrice" | "createdDate";

// ═══════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════

const CLOTHING_CATEGORIES = [
  "T-Shirt", "Shirt", "Pant", "Jeans", "Kurta", "Kurti",
  "Saree", "Lehenga", "Dress", "Jacket", "Hoodie",
  "Shorts", "Skirt", "Suit", "Tracksuit", "Innerwear",
  "Winterwear", "Ethnic Wear", "Other",
];

const GENDERS = ["Men", "Women", "Kids", "Unisex"];

const FABRICS = [
  "Cotton", "Polyester", "Linen", "Silk", "Wool",
  "Rayon", "Denim", "Chiffon", "Georgette", "Velvet",
  "Nylon", "Spandex", "Blended", "Other",
];

const APPAREL_SIZES    = ["XS", "S", "M", "L", "XL", "XXL", "3XL"];
const BOTTOM_SIZES     = ["26", "28", "30", "32", "34", "36", "38", "40", "42"];
const KIDS_SIZES       = ["0-6M", "6-12M", "1Y", "2Y", "3Y", "4Y", "6Y", "8Y", "10Y", "12Y"];

const GST_OPTIONS = [0, 5, 12, 18];

// ═══════════════════════════════════════════════════════════════
// SEED DATA
// ═══════════════════════════════════════════════════════════════

const SEED: ClothingProduct[] = [
  {
    id: "1", name: "Classic White Shirt", category: "Shirt", gender: "Men",
    brand: "Raymond", fabric: "Cotton", color: "White",
    sizes: [{ size: "S", qty: 5 }, { size: "M", qty: 12 }, { size: "L", qty: 8 }, { size: "XL", qty: 3 }],
    purchasePrice: 450, sellingPrice: 899, gstPercent: 5,
    minStockAlert: 5, description: "Premium cotton formal shirt.", sku: "RYM-SHT-001",
    image: "", createdDate: "2026-04-10",
  },
  {
    id: "2", name: "Slim Fit Jeans", category: "Jeans", gender: "Men",
    brand: "Levis", fabric: "Denim", color: "Dark Blue",
    sizes: [{ size: "30", qty: 6 }, { size: "32", qty: 14 }, { size: "34", qty: 9 }, { size: "36", qty: 2 }],
    purchasePrice: 900, sellingPrice: 1799, gstPercent: 12,
    minStockAlert: 5, description: "Comfortable slim fit denim jeans.", sku: "LV-JNS-032",
    image: "", createdDate: "2026-04-12",
  },
  {
    id: "3", name: "Floral Kurti", category: "Kurti", gender: "Women",
    brand: "Biba", fabric: "Rayon", color: "Pink",
    sizes: [{ size: "S", qty: 7 }, { size: "M", qty: 10 }, { size: "L", qty: 4 }, { size: "XL", qty: 1 }],
    purchasePrice: 350, sellingPrice: 749, gstPercent: 5,
    minStockAlert: 5, description: "Vibrant floral print daily wear kurti.", sku: "BB-KRT-018",
    image: "", createdDate: "2026-04-15",
  },
  {
    id: "4", name: "Kids Cartoon Tee", category: "T-Shirt", gender: "Kids",
    brand: "H&M", fabric: "Cotton", color: "Yellow",
    sizes: [{ size: "2Y", qty: 0 }, { size: "4Y", qty: 2 }, { size: "6Y", qty: 5 }],
    purchasePrice: 180, sellingPrice: 399, gstPercent: 5,
    minStockAlert: 3, description: "Fun cartoon print t-shirt for kids.", sku: "HM-KID-007",
    image: "", createdDate: "2026-04-20",
  },
];

// ═══════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════

function uid() { return Math.random().toString(36).slice(2, 10); }

function fmt(n: number) {
  return "₹" + n.toLocaleString("en-IN");
}

function totalStock(p: ClothingProduct) {
  return p.sizes.reduce((s, x) => s + x.qty, 0);
}

function getStockBadge(p: ClothingProduct) {
  const total = totalStock(p);
  if (total === 0)              return { label: "Out of Stock", cls: "bg-red-50 text-red-600 border-red-200" };
  if (total <= p.minStockAlert) return { label: "Low Stock",    cls: "bg-amber-50 text-amber-700 border-amber-200" };
  return                               { label: "In Stock",     cls: "bg-green-50 text-green-700 border-green-200" };
}

function marginPct(p: ClothingProduct) {
  if (!p.purchasePrice) return 0;
  return Math.round(((p.sellingPrice - p.purchasePrice) / p.purchasePrice) * 100);
}

function sellingWithGST(p: ClothingProduct) {
  return Math.round(p.sellingPrice * (1 + p.gstPercent / 100));
}

function getSizesForCategory(category: string, gender: string): string[] {
  if (["Jeans", "Pant", "Shorts", "Skirt"].includes(category))
    return BOTTOM_SIZES;
  if (gender === "Kids")
    return KIDS_SIZES;
  return APPAREL_SIZES;
}

// ═══════════════════════════════════════════════════════════════
// STYLES
// ═══════════════════════════════════════════════════════════════

const inputCls =
  "h-10 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-colors";

const textareaCls =
  "w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-colors resize-none";

const selectCls = inputCls + " appearance-none pr-8 cursor-pointer";

// ═══════════════════════════════════════════════════════════════
// SHARED SUB-COMPONENTS
// ═══════════════════════════════════════════════════════════════

function Field({
  label,
  children,
  span = 1,
}: {
  label: string;
  children: React.ReactNode;
  span?: number;
}) {
  return (
    <div className={`flex flex-col gap-1.5 ${span === 2 ? "col-span-2" : ""}`}>
      <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
        {label}
      </label>
      {children}
    </div>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
  span,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
  span?: number;
}) {
  return (
    <Field label={label} span={span}>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={selectCls}
        >
          {options.map((o) => (
            <option key={o}>{o}</option>
          ))}
        </select>
        <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
      </div>
    </Field>
  );
}

function StatCard({
  label,
  value,
  sub,
  icon: Icon,
  bg,
  ic,
  highlight,
}: {
  label: string;
  value: string | number;
  sub?: string;
  icon: React.ElementType;
  bg: string;
  ic: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-xl border p-5 ${
        highlight ? "border-amber-200 bg-amber-50" : "bg-white border-slate-200"
      }`}
    >
      <div
        className={`inline-flex items-center justify-center w-9 h-9 rounded-lg ${bg} mb-3`}
      >
        <Icon className={`w-4 h-4 ${ic}`} />
      </div>
      <p className="text-2xl font-bold text-slate-900">{value}</p>
      <p className="text-xs font-semibold text-slate-700 mt-0.5">{label}</p>
      {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
    </div>
  );
}

function ProductImage({
  src,
  name,
  size = "md",
}: {
  src: string;
  name: string;
  size?: "sm" | "md" | "lg";
}) {
  const [error, setError] = useState(false);
  const dim =
    size === "sm" ? "w-10 h-10" : size === "lg" ? "w-24 h-24" : "w-14 h-14";
  const iconSize = size === "sm" ? 14 : size === "lg" ? 28 : 20;
  if (!src || error) {
    return (
      <div
        className={`${dim} rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0`}
      >
        <Shirt size={iconSize} className="text-slate-300" />
      </div>
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={name}
      onError={() => setError(true)}
      className={`${dim} rounded-xl object-cover border border-slate-200 shrink-0`}
    />
  );
}

// ═══════════════════════════════════════════════════════════════
// SIZE STOCK EDITOR
// ═══════════════════════════════════════════════════════════════

function SizeStockEditor({
  sizes,
  category,
  gender,
  onChange,
}: {
  sizes: SizeStock[];
  category: string;
  gender: string;
  onChange: (s: SizeStock[]) => void;
}) {
  const availableSizes = getSizesForCategory(category, gender);

  function toggleSize(size: string) {
    const exists = sizes.find((s) => s.size === size);
    if (exists) {
      onChange(sizes.filter((s) => s.size !== size));
    } else {
      onChange([...sizes, { size, qty: 0 }]);
    }
  }

  function updateQty(size: string, qty: number) {
    onChange(sizes.map((s) => (s.size === size ? { ...s, qty: Math.max(0, qty) } : s)));
  }

  const active = sizes.map((s) => s.size);

  return (
    <div className="space-y-3">
      {/* Size toggle buttons */}
      <div className="flex flex-wrap gap-1.5">
        {availableSizes.map((size) => {
          const isActive = active.includes(size);
          return (
            <button
              key={size}
              type="button"
              onClick={() => toggleSize(size)}
              className={`h-8 min-w-[2.5rem] px-2.5 rounded-lg text-xs font-bold border transition-all ${
                isActive
                  ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                  : "bg-slate-50 text-slate-500 border-slate-200 hover:border-blue-300 hover:text-blue-600"
              }`}
            >
              {size}
            </button>
          );
        })}
      </div>

      {/* Qty inputs for selected sizes */}
      {sizes.length > 0 && (
        <div className="grid grid-cols-3 gap-2 pt-1">
          {sizes.map((s) => (
            <div
              key={s.size}
              className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5"
            >
              <span className="text-xs font-bold text-slate-600 w-8 shrink-0">
                {s.size}
              </span>
              <input
                type="number"
                min={0}
                value={s.qty || ""}
                placeholder="0"
                onChange={(e) => updateQty(s.size, Number(e.target.value))}
                className="w-full bg-transparent text-sm font-semibold text-slate-800 outline-none text-right"
              />
              <span className="text-[10px] text-slate-400 shrink-0">pcs</span>
            </div>
          ))}
        </div>
      )}

      {sizes.length === 0 && (
        <p className="text-xs text-slate-400 bg-slate-50 rounded-lg border border-dashed border-slate-200 px-3 py-2 text-center">
          Select sizes above to enter stock quantities
        </p>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// IMAGE UPLOADER
// ═══════════════════════════════════════════════════════════════

function ImageUploader({
  value,
  onChange,
}: {
  value: string;
  onChange: (dataUrl: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  function handleFile(file: File) {
    if (!file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) onChange(e.target.result as string);
    };
    reader.readAsDataURL(file);
  }

  return (
    <div className="space-y-3">
      {value ? (
        <div className="relative w-full aspect-[3/4] rounded-xl overflow-hidden border border-slate-200 bg-slate-50">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={value}
            alt="Product"
            className="w-full h-full object-contain"
          />
          <button
            onClick={() => onChange("")}
            className="absolute top-2 right-2 w-7 h-7 rounded-lg bg-white/90 hover:bg-red-50 text-slate-500 hover:text-red-600 flex items-center justify-center shadow-sm border border-slate-200"
          >
            <X size={13} />
          </button>
          <button
            onClick={() => inputRef.current?.click()}
            className="absolute bottom-2 right-2 flex items-center gap-1.5 px-3 py-1.5 bg-white/90 hover:bg-white rounded-lg text-xs font-semibold text-slate-700 shadow-sm border border-slate-200"
          >
            <Upload size={12} /> Replace
          </button>
        </div>
      ) : (
        <div
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            const f = e.dataTransfer.files[0];
            if (f) handleFile(f);
          }}
          className={`flex flex-col items-center justify-center gap-3 w-full aspect-[3/4] rounded-xl border-2 border-dashed cursor-pointer transition-all ${
            dragging
              ? "border-blue-400 bg-blue-50"
              : "border-slate-200 bg-slate-50 hover:border-blue-300 hover:bg-blue-50/50"
          }`}
        >
          <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center shadow-sm">
            <Camera size={20} className="text-slate-400" />
          </div>
          <div className="text-center">
            <p className="text-sm font-semibold text-slate-600">
              Click or drag image here
            </p>
            <p className="text-xs text-slate-400 mt-0.5">PNG, JPG up to 5MB</p>
          </div>
        </div>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handleFile(f);
          e.target.value = "";
        }}
      />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// EMPTY FORM
// ═══════════════════════════════════════════════════════════════

const EMPTY_FORM: Omit<ClothingProduct, "id" | "createdDate"> = {
  name: "",
  category: "T-Shirt",
  gender: "Men",
  brand: "",
  fabric: "Cotton",
  color: "",
  sizes: [],
  purchasePrice: 0,
  sellingPrice: 0,
  gstPercent: 5,
  minStockAlert: 5,
  description: "",
  sku: "",
  image: "",
};

// ═══════════════════════════════════════════════════════════════
// PRODUCT MODAL — ADD / EDIT / VIEW
// ═══════════════════════════════════════════════════════════════

function ProductModal({
  mode,
  product,
  onSave,
  onClose,
}: {
  mode: "add" | "edit" | "view";
  product: ClothingProduct | null;
  onSave: (p: ClothingProduct) => void;
  onClose: () => void;
}) {
  const isView = mode === "view";

  const [form, setForm] = useState<Omit<ClothingProduct, "id" | "createdDate">>(
    () => {
      if (product) {
        const { id, createdDate, ...rest } = product;
        return rest;
      }
      return { ...EMPTY_FORM, sizes: [] };
    }
  );

  const [errors, setErrors] = useState<Record<string, string>>({});

  function set<K extends keyof typeof form>(k: K, v: (typeof form)[K]) {
    setForm((p) => ({ ...p, [k]: v }));
    setErrors((e) => { const n = { ...e }; delete n[k]; return n; });
  }

  function validate() {
    const e: Record<string, string> = {};
    if (!form.name.trim())        e.name = "Required";
    if (!form.color.trim())       e.color = "Required";
    if (form.sizes.length === 0)  e.sizes = "Select at least one size";
    if (!form.purchasePrice)      e.purchasePrice = "Required";
    if (!form.sellingPrice)       e.sellingPrice = "Required";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleSave() {
    if (!validate()) return;
    const saved: ClothingProduct = {
      ...(product ?? { id: uid(), createdDate: new Date().toISOString().split("T")[0] }),
      ...form,
    };
    onSave(saved);
    onClose();
  }

  const marginVal =
    form.purchasePrice > 0
      ? Math.round(
          ((form.sellingPrice - form.purchasePrice) / form.purchasePrice) * 100
        )
      : 0;
  const withTax = Math.round(
    form.sellingPrice * (1 + form.gstPercent / 100)
  );
  const totalQty = form.sizes.reduce((s, x) => s + x.qty, 0);

  // ── VIEW MODE ─────────────────────────────────────────────────
  if (isView && product) {
    const badge = getStockBadge(product);
    const total = totalStock(product);

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
                  <span className="text-xs font-mono text-slate-400">#{product.id}</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${badge.cls}`}>
                    {badge.label}
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200 text-xs font-semibold">
                    {product.gender}
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg hover:bg-slate-100 text-slate-400 flex items-center justify-center"
            >
              <X size={16} />
            </button>
          </div>

          <div className="overflow-y-auto flex-1 px-6 py-5 space-y-6">
            {product.image && (
              <div className="w-full h-52 rounded-xl overflow-hidden border border-slate-200 bg-slate-50">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-contain"
                />
              </div>
            )}

            {/* Pricing grid */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: "Purchase Price", value: fmt(product.purchasePrice), color: "text-slate-800" },
                { label: "Selling Price",  value: fmt(product.sellingPrice),  color: "text-blue-700"  },
                { label: "With GST",       value: fmt(sellingWithGST(product)), color: "text-indigo-700" },
                { label: "Margin",         value: `${marginPct(product)}%`,   color: marginPct(product) >= 0 ? "text-green-700" : "text-red-600" },
                { label: "Total Stock",    value: `${total} pcs`,              color: total === 0 ? "text-red-600" : total <= product.minStockAlert ? "text-amber-600" : "text-green-700" },
                { label: "GST Rate",       value: `${product.gstPercent}%`,   color: "text-slate-800" },
              ].map((m) => (
                <div key={m.label} className="bg-slate-50 rounded-xl border border-slate-100 px-3 py-3 text-center">
                  <p className={`text-sm font-bold ${m.color}`}>{m.value}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{m.label}</p>
                </div>
              ))}
            </div>

            {/* Details */}
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: "Category", value: product.category },
                { label: "Gender",   value: product.gender   },
                { label: "Brand",    value: product.brand || "—" },
                { label: "Fabric",   value: product.fabric   },
                { label: "Color",    value: product.color    },
                { label: "SKU",      value: product.sku || "—" },
                { label: "Min Alert",value: `${product.minStockAlert} pcs` },
                { label: "Created",  value: product.createdDate },
              ].map((d) => (
                <div key={d.label}>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">{d.label}</p>
                  <p className="text-sm text-slate-800 font-medium mt-0.5">{d.value}</p>
                </div>
              ))}
            </div>

            {/* Size breakdown */}
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Size-wise Stock</p>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((s) => (
                  <div
                    key={s.size}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold ${
                      s.qty === 0
                        ? "bg-red-50 text-red-500 border-red-200"
                        : "bg-slate-50 text-slate-700 border-slate-200"
                    }`}
                  >
                    <span>{s.size}</span>
                    <span className="text-slate-400">·</span>
                    <span>{s.qty} pcs</span>
                  </div>
                ))}
              </div>
            </div>

            {product.description && (
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1.5">Description</p>
                <p className="text-sm text-slate-600 leading-relaxed">{product.description}</p>
              </div>
            )}
          </div>

          <div className="px-6 py-4 border-t border-slate-100 shrink-0">
            <button
              onClick={onClose}
              className="w-full h-10 rounded-lg border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── ADD / EDIT FORM ───────────────────────────────────────────
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden max-h-[94vh] flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              {mode === "add" ? "Add New Product" : `Edit — ${product?.name}`}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {mode === "add" ? "Fill in clothing details below" : "Update product information"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-slate-100 text-slate-400 flex items-center justify-center"
          >
            <X size={16} />
          </button>
        </div>

        <div className="overflow-y-auto flex-1">
          <div className="grid grid-cols-[1fr_260px] divide-x divide-slate-100">

            {/* Left — Form */}
            <div className="px-6 py-5 space-y-6">

              {/* Basic Info */}
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Basic Information</p>
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Product Name *" span={2}>
                    <input
                      type="text"
                      placeholder="e.g. Classic White Formal Shirt"
                      value={form.name}
                      onChange={(e) => set("name", e.target.value)}
                      className={`${inputCls} ${errors.name ? "border-red-400 bg-red-50" : ""}`}
                    />
                    {errors.name && <p className="text-[11px] text-red-500">{errors.name}</p>}
                  </Field>

                  <SelectField
                    label="Category *"
                    value={form.category}
                    onChange={(v) => {
                      set("category", v);
                      set("sizes", []); // reset sizes when category changes
                    }}
                    options={CLOTHING_CATEGORIES}
                  />

                  <SelectField
                    label="Gender *"
                    value={form.gender}
                    onChange={(v) => {
                      set("gender", v);
                      set("sizes", []); // reset sizes when gender changes
                    }}
                    options={GENDERS}
                  />

                  <Field label="Brand">
                    <input
                      type="text"
                      placeholder="e.g. Levis, Zara, Biba"
                      value={form.brand}
                      onChange={(e) => set("brand", e.target.value)}
                      className={inputCls}
                    />
                  </Field>

                  <SelectField
                    label="Fabric *"
                    value={form.fabric}
                    onChange={(v) => set("fabric", v)}
                    options={FABRICS}
                  />

                  <Field label="Color *">
                    <input
                      type="text"
                      placeholder="e.g. Navy Blue, Floral Pink"
                      value={form.color}
                      onChange={(e) => set("color", e.target.value)}
                      className={`${inputCls} ${errors.color ? "border-red-400 bg-red-50" : ""}`}
                    />
                    {errors.color && <p className="text-[11px] text-red-500">{errors.color}</p>}
                  </Field>

                  <Field label="SKU / Article No.">
                    <input
                      type="text"
                      placeholder="e.g. LV-JNS-032"
                      value={form.sku}
                      onChange={(e) => set("sku", e.target.value)}
                      className={inputCls}
                    />
                  </Field>
                </div>
              </div>

              {/* Size & Stock */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                    Sizes & Stock *
                  </p>
                  {totalQty > 0 && (
                    <span className="text-xs font-semibold text-blue-600 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full">
                      Total: {totalQty} pcs
                    </span>
                  )}
                </div>
                <SizeStockEditor
                  sizes={form.sizes}
                  category={form.category}
                  gender={form.gender}
                  onChange={(s) => { set("sizes", s); setErrors((e) => { const n = {...e}; delete n.sizes; return n; }); }}
                />
                {errors.sizes && (
                  <p className="text-[11px] text-red-500 mt-1">{errors.sizes}</p>
                )}
              </div>

              {/* Pricing */}
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Pricing</p>
                <div className="grid grid-cols-3 gap-4">
                  <Field label="Purchase Price (₹) *">
                    <div className="relative">
                      <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                      <input
                        type="number"
                        min={0}
                        placeholder="0"
                        value={form.purchasePrice || ""}
                        onChange={(e) => set("purchasePrice", Number(e.target.value))}
                        className={`${inputCls} pl-8 ${errors.purchasePrice ? "border-red-400 bg-red-50" : ""}`}
                      />
                    </div>
                    {errors.purchasePrice && <p className="text-[11px] text-red-500">{errors.purchasePrice}</p>}
                  </Field>

                  <Field label="Selling Price (₹) *">
                    <div className="relative">
                      <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                      <input
                        type="number"
                        min={0}
                        placeholder="0"
                        value={form.sellingPrice || ""}
                        onChange={(e) => set("sellingPrice", Number(e.target.value))}
                        className={`${inputCls} pl-8 ${errors.sellingPrice ? "border-red-400 bg-red-50" : ""}`}
                      />
                    </div>
                    {errors.sellingPrice && <p className="text-[11px] text-red-500">{errors.sellingPrice}</p>}
                  </Field>

                  <Field label="GST %">
                    <div className="relative">
                      <Percent className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                      <select
                        value={form.gstPercent}
                        onChange={(e) => set("gstPercent", Number(e.target.value))}
                        className={`${inputCls} pl-8 appearance-none pr-8 cursor-pointer`}
                      >
                        {GST_OPTIONS.map((g) => (
                          <option key={g} value={g}>{g}%</option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                    </div>
                  </Field>
                </div>

                {/* Pricing preview */}
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
                      <p className="text-sm font-bold text-indigo-700">{fmt(withTax)}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Extra */}
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Extra</p>
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Min Stock Alert">
                    <input
                      type="number"
                      min={0}
                      placeholder="5"
                      value={form.minStockAlert || ""}
                      onChange={(e) => set("minStockAlert", Number(e.target.value))}
                      className={inputCls}
                    />
                  </Field>
                  <div /> {/* empty col */}
                  <Field label="Description" span={2}>
                    <textarea
                      placeholder="Fabric details, care instructions, style notes…"
                      value={form.description}
                      onChange={(e) => set("description", e.target.value)}
                      rows={3}
                      className={textareaCls}
                    />
                  </Field>
                </div>
              </div>
            </div>

            {/* Right — Image */}
            <div className="px-5 py-5">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Product Image</p>
              <ImageUploader value={form.image} onChange={(url) => set("image", url)} />
              <div className="mt-5 space-y-2">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Tips</p>
                {[
                  "Use a clean white background",
                  "Show full garment front view",
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
          <button
            onClick={onClose}
            className="flex-1 h-10 rounded-lg border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex-1 h-10 rounded-lg bg-blue-600 hover:bg-blue-700 text-sm font-semibold text-white transition-colors shadow-sm shadow-blue-200 flex items-center justify-center gap-2"
          >
            <CheckCircle size={15} />
            {mode === "add" ? "Add Product" : "Save Changes"}
          </button>
        </div>

      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// MAIN PAGE
// ═══════════════════════════════════════════════════════════════

export default function ProductsPage() {
  const [products, setProducts] = useState<ClothingProduct[]>(SEED);
  const [search, setSearch]     = useState("");
  const [catFilter, setCatFilter]   = useState("All");
  const [genderFilter, setGenderFilter] = useState("All");
  const [stockFilter, setStockFilter]   = useState("All");
  const [sortKey, setSortKey]   = useState<SortKey>("createdDate");
  const [sortDir, setSortDir]   = useState<"asc" | "desc">("desc");
  const [viewMode, setViewMode] = useState<ViewMode>("table");
  const [modal, setModal]       = useState<ModalMode>(null);
  const [selected, setSelected] = useState<ClothingProduct | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // ── Derived stats ─────────────────────────────────────────────
  const inStockCount = products.filter((p) => getStockBadge(p).label === "In Stock").length;
  const lowCount     = products.filter((p) => getStockBadge(p).label === "Low Stock").length;
  const outCount     = products.filter((p) => getStockBadge(p).label === "Out of Stock").length;
  const totalValue   = products.reduce((t, p) => t + totalStock(p) * p.purchasePrice, 0);

  const categories = useMemo(
    () => ["All", ...Array.from(new Set(products.map((p) => p.category)))],
    [products]
  );

  // ── Filtered + sorted list ────────────────────────────────────
  const filtered = useMemo(() => {
    return products
      .filter((p) => {
        const q = search.toLowerCase();
        const matchSearch =
          !q ||
          p.name.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q) ||
          p.color.toLowerCase().includes(q);
        const matchCat    = catFilter === "All" || p.category === catFilter;
        const matchGender = genderFilter === "All" || p.gender === genderFilter;
        const badge       = getStockBadge(p).label;
        const matchStock  = stockFilter === "All" || badge === stockFilter;
        return matchSearch && matchCat && matchGender && matchStock;
      })
      .sort((a, b) => {
        let va: number | string = 0,
          vb: number | string = 0;
        if (sortKey === "name")         { va = a.name;           vb = b.name;           }
        if (sortKey === "totalStock")   { va = totalStock(a);    vb = totalStock(b);    }
        if (sortKey === "sellingPrice") { va = a.sellingPrice;   vb = b.sellingPrice;   }
        if (sortKey === "createdDate")  { va = a.createdDate;    vb = b.createdDate;    }
        if (va < vb) return sortDir === "asc" ? -1 : 1;
        if (va > vb) return sortDir === "asc" ? 1 : -1;
        return 0;
      });
  }, [products, search, catFilter, genderFilter, stockFilter, sortKey, sortDir]);

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(key); setSortDir("asc"); }
  }

  function handleSave(p: ClothingProduct) {
    setProducts((prev) => {
      const idx = prev.findIndex((x) => x.id === p.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = p;
        return next;
      }
      return [p, ...prev];
    });
  }

  function handleDelete(id: string) {
    setProducts((prev) => prev.filter((p) => p.id !== id));
    setDeleteId(null);
  }

  // ── RENDER ────────────────────────────────────────────────────
  return (
    <>
      <div className="space-y-6">

        {/* Page Header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-xl font-bold text-slate-900">Clothing Products</h1>
            <p className="text-sm text-slate-500 mt-0.5">
              {products.length} products · {fmt(totalValue)} inventory value
            </p>
          </div>
          <button
            onClick={() => { setSelected(null); setModal("add"); }}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition-colors shadow-sm shadow-blue-200"
          >
            <Plus size={16} /> Add Product
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
          <StatCard label="Total Products"  value={products.length} sub="All categories"    icon={Package}       bg="bg-blue-50"   ic="text-blue-600"   />
          <StatCard label="In Stock"        value={inStockCount}    sub="Available"          icon={CheckCircle}   bg="bg-green-50"  ic="text-green-600"  />
          <StatCard label="Low / Out"       value={`${lowCount} / ${outCount}`} sub="Need attention" icon={AlertTriangle} bg="bg-amber-50"  ic="text-amber-600"  highlight={lowCount + outCount > 0} />
          <StatCard label="Inventory Value" value={fmt(totalValue)} sub="At purchase price" icon={BarChart3}      bg="bg-purple-50" ic="text-purple-600" />
        </div>

        {/* Low stock banner */}
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
                        onClick={() => { setSelected(p); setModal("view"); }}
                        className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border hover:opacity-70 ${b.cls}`}
                      >
                        {p.name} — {totalStock(p) === 0 ? "OUT" : `${totalStock(p)} left`}
                      </button>
                    );
                  })}
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search name, brand, color, SKU…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={inputCls + " pl-9"}
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X size={14} />
              </button>
            )}
          </div>

          <div className="relative">
            <select
              value={catFilter}
              onChange={(e) => setCatFilter(e.target.value)}
              className={inputCls + " w-40 appearance-none pr-8 cursor-pointer"}
            >
              {categories.map((c) => <option key={c}>{c}</option>)}
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          </div>

          <div className="relative">
            <select
              value={genderFilter}
              onChange={(e) => setGenderFilter(e.target.value)}
              className={inputCls + " w-32 appearance-none pr-8 cursor-pointer"}
            >
              {["All", ...GENDERS].map((g) => <option key={g}>{g}</option>)}
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          </div>

          <div className="relative">
            <select
              value={stockFilter}
              onChange={(e) => setStockFilter(e.target.value)}
              className={inputCls + " w-40 appearance-none pr-8 cursor-pointer"}
            >
              {["All", "In Stock", "Low Stock", "Out of Stock"].map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          </div>

          <div className="flex gap-1 bg-slate-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode("table")}
              className={`w-9 h-8 rounded-md flex items-center justify-center transition-all ${viewMode === "table" ? "bg-white text-blue-600 shadow-sm" : "text-slate-400 hover:text-slate-600"}`}
            >
              <List size={15} />
            </button>
            <button
              onClick={() => setViewMode("grid")}
              className={`w-9 h-8 rounded-md flex items-center justify-center transition-all ${viewMode === "grid" ? "bg-white text-blue-600 shadow-sm" : "text-slate-400 hover:text-slate-600"}`}
            >
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
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wide">Image</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wide">
                      <button onClick={() => toggleSort("name")} className="flex items-center gap-1 hover:text-slate-700">
                        Product <ArrowUpDown size={12} className={sortKey === "name" ? "text-blue-500" : ""} />
                      </button>
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wide">Category / Gender</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wide">Fabric / Color</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wide">
                      <button onClick={() => toggleSort("sellingPrice")} className="flex items-center gap-1 hover:text-slate-700">
                        Pricing <ArrowUpDown size={12} className={sortKey === "sellingPrice" ? "text-blue-500" : ""} />
                      </button>
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wide">Sizes</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wide">
                      <button onClick={() => toggleSort("totalStock")} className="flex items-center gap-1 hover:text-slate-700">
                        Stock <ArrowUpDown size={12} className={sortKey === "totalStock" ? "text-blue-500" : ""} />
                      </button>
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wide">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wide">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-16 text-center">
                        <div className="flex flex-col items-center gap-3 text-slate-400">
                          <Shirt size={36} className="text-slate-200" />
                          <p className="text-sm font-medium">No products found</p>
                          <button
                            onClick={() => { setSearch(""); setCatFilter("All"); setGenderFilter("All"); setStockFilter("All"); }}
                            className="text-xs text-blue-600 hover:underline"
                          >
                            Clear filters
                          </button>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filtered.map((p) => {
                      const badge = getStockBadge(p);
                      const m     = marginPct(p);
                      const tot   = totalStock(p);
                      return (
                        <tr key={p.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors group">
                          <td className="px-4 py-3">
                            <ProductImage src={p.image} name={p.name} size="sm" />
                          </td>
                          <td className="px-4 py-3">
                            <p className="font-semibold text-slate-800 whitespace-nowrap">{p.name}</p>
                            <p className="text-xs font-mono text-slate-400 mt-0.5">#{p.id}</p>
                            {p.sku && <p className="text-xs text-slate-400 mt-0.5"><Tag size={9} className="inline mr-1" />{p.sku}</p>}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <p className="text-sm text-slate-700">{p.category}</p>
                            <span className="text-[11px] px-1.5 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-100 font-medium">
                              {p.gender}
                            </span>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <p className="text-sm text-slate-700">{p.fabric}</p>
                            <p className="text-xs text-slate-400">{p.color}</p>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <p className="font-bold text-slate-900">{fmt(p.sellingPrice)}</p>
                            <p className="text-xs text-slate-400">Cost: {fmt(p.purchasePrice)}</p>
                            <p className={`text-xs font-semibold ${m >= 0 ? "text-green-600" : "text-red-500"}`}>
                              {m >= 0 ? "+" : ""}{m}% margin
                            </p>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex flex-wrap gap-1">
                              {p.sizes.slice(0, 4).map((s) => (
                                <span
                                  key={s.size}
                                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${
                                    s.qty === 0
                                      ? "bg-red-50 text-red-400 border-red-200"
                                      : "bg-slate-50 text-slate-600 border-slate-200"
                                  }`}
                                >
                                  {s.size}
                                </span>
                              ))}
                              {p.sizes.length > 4 && (
                                <span className="text-[10px] text-slate-400 px-1">
                                  +{p.sizes.length - 4}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <p className={`font-bold ${badge.label === "Out of Stock" ? "text-red-500" : badge.label === "Low Stock" ? "text-amber-600" : "text-slate-900"}`}>
                              {tot} pcs
                            </p>
                            <p className="text-xs text-slate-400">Alert at {p.minStockAlert}</p>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border whitespace-nowrap ${badge.cls}`}>
                              {badge.label}
                            </span>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="flex items-center gap-2 opacity-80 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={() => { setSelected(p); setModal("view"); }}
                                className="flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-800"
                              >
                                <Eye size={13} /> View
                              </button>
                              <button
                                onClick={() => { setSelected(p); setModal("edit"); }}
                                className="flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-slate-800"
                              >
                                <Pencil size={13} /> Edit
                              </button>
                              <button
                                onClick={() => setDeleteId(p.id)}
                                className="flex items-center gap-1 text-xs font-medium text-red-400 hover:text-red-600"
                              >
                                <Trash2 size={13} /> Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
            <div className="px-4 py-3 border-t border-slate-100 bg-slate-50">
              <p className="text-xs text-slate-400">
                Showing{" "}
                <span className="font-semibold text-slate-600">{filtered.length}</span>{" "}
                of{" "}
                <span className="font-semibold text-slate-600">{products.length}</span>{" "}
                products
              </p>
            </div>
          </div>
        )}

        {/* ── GRID VIEW ── */}
        {viewMode === "grid" && (
          <>
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center gap-3 py-20 text-slate-400">
                <Shirt size={40} className="text-slate-200" />
                <p className="text-sm font-medium">No products found</p>
                <button
                  onClick={() => { setSearch(""); setCatFilter("All"); setGenderFilter("All"); setStockFilter("All"); }}
                  className="text-xs text-blue-600 hover:underline"
                >
                  Clear filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
                {filtered.map((p) => {
                  const badge = getStockBadge(p);
                  const m     = marginPct(p);
                  const tot   = totalStock(p);
                  return (
                    <div
                      key={p.id}
                      className="bg-white rounded-xl border border-slate-200 overflow-hidden hover:border-blue-200 hover:shadow-md transition-all group"
                    >
                      <div className="relative w-full aspect-[3/4] bg-slate-50 border-b border-slate-100">
                        {p.image ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={p.image} alt={p.name} className="w-full h-full object-contain" />
                        ) : (
                          <div className="flex items-center justify-center h-full">
                            <Shirt size={36} className="text-slate-200" />
                          </div>
                        )}
                        <span className={`absolute top-2 right-2 px-2 py-0.5 rounded-full text-xs font-semibold border ${badge.cls}`}>
                          {badge.label}
                        </span>
                        <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200">
                          {p.gender}
                        </span>
                      </div>
                      <div className="p-4 space-y-3">
                        <div>
                          <p className="font-bold text-slate-900 leading-tight line-clamp-2">{p.name}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-slate-400">{p.category}</span>
                            <span className="text-slate-200">·</span>
                            <span className="text-xs text-slate-500">{p.fabric}</span>
                          </div>
                          <p className="text-xs text-slate-400 mt-0.5">{p.color}</p>
                        </div>

                        {/* Size chips */}
                        <div className="flex flex-wrap gap-1">
                          {p.sizes.map((s) => (
                            <span
                              key={s.size}
                              className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${
                                s.qty === 0
                                  ? "bg-red-50 text-red-400 border-red-200"
                                  : "bg-slate-50 text-slate-600 border-slate-200"
                              }`}
                            >
                              {s.size}
                            </span>
                          ))}
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div className="bg-slate-50 rounded-lg p-2 text-center">
                            <p className="text-xs text-slate-400">Selling</p>
                            <p className="text-sm font-bold text-slate-900">{fmt(p.sellingPrice)}</p>
                          </div>
                          <div className="bg-slate-50 rounded-lg p-2 text-center">
                            <p className="text-xs text-slate-400">Stock</p>
                            <p className={`text-sm font-bold ${badge.label === "Out of Stock" ? "text-red-500" : badge.label === "Low Stock" ? "text-amber-600" : "text-slate-900"}`}>
                              {tot} pcs
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className={`text-xs font-bold ${m >= 0 ? "text-green-600" : "text-red-500"}`}>
                            {m >= 0 ? "+" : ""}{m}% margin
                          </span>
                          <span className="px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 text-xs font-semibold">
                            {p.gstPercent}% GST
                          </span>
                        </div>

                        <div className="flex gap-2 pt-1 border-t border-slate-100">
                          <button
                            onClick={() => { setSelected(p); setModal("view"); }}
                            className="flex-1 flex items-center justify-center gap-1.5 h-8 rounded-lg bg-slate-50 hover:bg-blue-50 text-xs font-semibold text-slate-600 hover:text-blue-700 transition-colors"
                          >
                            <Eye size={13} /> View
                          </button>
                          <button
                            onClick={() => { setSelected(p); setModal("edit"); }}
                            className="flex-1 flex items-center justify-center gap-1.5 h-8 rounded-lg bg-slate-50 hover:bg-slate-100 text-xs font-semibold text-slate-600 transition-colors"
                          >
                            <Pencil size={13} /> Edit
                          </button>
                          <button
                            onClick={() => setDeleteId(p.id)}
                            className="w-8 h-8 rounded-lg bg-slate-50 hover:bg-red-50 text-slate-400 hover:text-red-500 flex items-center justify-center transition-colors"
                          >
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

      {/* Modals */}
      {modal && (
        <ProductModal
          mode={modal}
          product={selected}
          onSave={handleSave}
          onClose={() => { setModal(null); setSelected(null); }}
        />
      )}

      {/* Delete Confirm */}
      {deleteId &&
        (() => {
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
                    </p>
                  </div>
                </div>
                <div className="flex gap-3 px-6 pb-5">
                  <button
                    onClick={() => setDeleteId(null)}
                    className="flex-1 h-10 rounded-lg border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleDelete(deleteId)}
                    className="flex-1 h-10 rounded-lg bg-red-500 hover:bg-red-600 text-sm font-semibold text-white transition-colors"
                  >
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