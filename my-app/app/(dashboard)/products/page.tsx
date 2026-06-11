"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import {
  Search, Plus, Eye, Pencil, Trash2, X, ChevronDown,
  Package, Tag, AlertTriangle, Camera, Upload,
  IndianRupee, Percent, BarChart3, ImageOff, CheckCircle,
  ArrowUpDown, Grid3X3, List, XCircle, Shirt, Loader2, Printer,
} from "lucide-react";
import { api } from "@/lib/api";
import Barcode from "@/components/Barcode";

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════

type Product = {
  id: string;
  name: string;
  category: string;
  
  // Garment specific
  gender?: string;
  fabric?: string;
  color?: string;
  sizes?: SizeStock[];

  // Grocery specific
  unit?: string;
  expiryDate?: string;
  mfgDate?: string;
  hsnCode?: string;
  stockQuantity?: number; // Used for grocery if sizes not present

  brand?: string;
  purchasePrice: number;
  sellingPrice: number;
  gstPercent: number;
  minStockAlert: number;
  description?: string;
  sku?: string;
  barcode?: string;
  barcodeImageUrl?: string;
  image?: string;
  createdDate: string;
};

type SizeStock = {
  size: string;
  qty: number;
  barcode?: string;
  barcodeImageUrl?: string;
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

const GROCERY_CATEGORIES = [
  "Fruits & Vegetables", "Dairy & Bakery", "Staples",
  "Snacks & Branded Foods", "Beverages", "Personal Care",
  "Home Care", "Baby Care", "Meat & Fish", "Others",
];

const UNITS = ["kg", "g", "liter", "ml", "pcs", "packet", "bottle", "box"];

const GST_OPTIONS = [0, 5, 12, 18];

// ═══════════════════════════════════════════════════════════════
// SEED DATA
// ═══════════════════════════════════════════════════════════════

// Products will be fetched from API

// ═══════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════

function uid() { return Math.random().toString(36).slice(2, 10); }

function fmt(n: number) {
  return "₹" + n.toLocaleString("en-IN");
}

function totalStock(p: Product) {
  if (p.sizes && p.sizes.length > 0) {
    return p.sizes.reduce((s, x) => s + (x.qty || 0), 0);
  }
  return p.stockQuantity || 0;
}

function getStockBadge(p: Product) {
  const total = totalStock(p);
  if (total === 0)              return { label: "Out of Stock", cls: "bg-red-50 text-red-600 border-red-200" };
  if (total <= p.minStockAlert) return { label: "Low Stock",    cls: "bg-amber-50 text-amber-700 border-amber-200" };
  return                               { label: "In Stock",     cls: "bg-green-50 text-green-700 border-green-200" };
}

function marginPct(p: Product) {
  if (!p.purchasePrice) return 0;
  return Math.round(((p.sellingPrice - p.purchasePrice) / p.purchasePrice) * 100);
}

function sellingWithGST(p: Product) {
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
  "h-10 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm text-gray-500 placeholder:text-slate-400 outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-colors";

const textareaCls =
  "w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-gray-500 placeholder:text-slate-400 outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-colors resize-none";

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
      <p className="text-2xl font-bold text-gray-500">{value}</p>
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
  src?: string;
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
                  ? "bg-red-600 text-white border-red-600 shadow-sm"
                  : "bg-slate-50 text-slate-500 border-slate-200 hover:border-red-300 hover:text-red-600"
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
  value?: string;
  onChange: (dataUrl: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);
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
          <div className="absolute bottom-2 right-2 flex items-center gap-2">
            <button
              onClick={() => inputRef.current?.click()}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white/90 hover:bg-white rounded-lg text-xs font-semibold text-slate-700 shadow-sm border border-slate-200"
            >
              <Upload size={12} /> Replace
            </button>
            <button
              onClick={() => cameraRef.current?.click()}
              className="flex items-center gap-1 px-3 py-1.5 bg-white/90 hover:bg-white rounded-lg text-xs font-semibold text-slate-700 shadow-sm border border-slate-200"
            >
              <Camera size={12} /> Camera
            </button>
          </div>
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
              ? "border-red-400 bg-red-50"
              : "border-slate-200 bg-slate-50 hover:border-red-300 hover:bg-red-50/50"
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
            <div className="mt-3 flex items-center justify-center gap-2">
              <button
                onClick={(e) => { e.stopPropagation(); inputRef.current?.click(); }}
                className="flex items-center gap-1 px-3 py-1.5 bg-white rounded-lg text-xs font-semibold text-slate-700 shadow-sm border border-slate-200"
              >
                <Upload size={12} /> Upload
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); cameraRef.current?.click(); }}
                className="flex items-center gap-1 px-3 py-1.5 bg-white rounded-lg text-xs font-semibold text-slate-700 shadow-sm border border-slate-200"
              >
                <Camera size={12} /> Camera
              </button>
            </div>
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
      <input
        ref={cameraRef}
        type="file"
        accept="image/*"
        capture="environment"
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

const EMPTY_FORM: Omit<Product, "id" | "createdDate"> = {
  name: "",
  category: "",
  brand: "",
  purchasePrice: 0,
  sellingPrice: 0,
  gstPercent: 5,
  minStockAlert: 5,
  description: "",
  sku: "",
  barcode: "",
  barcodeImageUrl: "",
  image: "",
  
  // Garment defaults
  gender: "Men",
  fabric: "Cotton",
  color: "",
  sizes: [],

  // Grocery defaults
  unit: "pcs",
  expiryDate: "",
  mfgDate: "",
  hsnCode: "",
  stockQuantity: 0,
};

// ═══════════════════════════════════════════════════════════════
// PRODUCT MODAL — ADD / EDIT / VIEW
// ═══════════════════════════════════════════════════════════════

function ProductModal({
  mode,
  product,
  onSave,
  onClose,
  storeCategory,
  store,
}: {
  mode: "add" | "edit" | "view";
  product: Product | null;
  onSave: (p: Product) => void;
  onClose: () => void;
  storeCategory: "GARMENTS" | "GROCERY";
  store?: any;
}) {
  const isView = mode === "view";
  const isGrocery = storeCategory === "GROCERY";

  const [form, setForm] = useState<Omit<Product, "id" | "createdDate">>(
    () => {
      if (product) {
        const { id, createdDate, ...rest } = product;
        return rest;
      }
      return { 
        ...EMPTY_FORM, 
        category: isGrocery ? GROCERY_CATEGORIES[0] : CLOTHING_CATEGORIES[0],
        sizes: [] 
      };
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
    if (!isGrocery) {
      if (!form.color?.trim())     e.color = "Required";
      if (!form.sizes || form.sizes.length === 0)  e.sizes = "Select at least one size";
    } else {
      if (!form.unit?.trim())      e.unit = "Required";
    }
    if (!form.purchasePrice)      e.purchasePrice = "Required";
    if (!form.sellingPrice)       e.sellingPrice = "Required";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  const [loading, setLoading] = useState(false);

  async function handleSave() {
    if (!validate()) return;
    setLoading(true);
    try {
      const payload: any = {
        name: form.name,
        category: form.category,
        brand: form.brand,
        purchase_price: form.purchasePrice,
        selling_price: form.sellingPrice,
        gst_percent: form.gstPercent,
        min_stock_level: form.minStockAlert,
        description: form.description,
        image_url: form.image,
      };

      if (isGrocery) {
        payload.unit = form.unit;
        payload.hsn_code = form.hsnCode;
        payload.expiry_date = form.expiryDate;
        payload.mfg_date = form.mfgDate;
        payload.stock_quantity = form.stockQuantity;
      } else {
        payload.gender = form.gender;
        payload.fabric = form.fabric;
        payload.color = form.color;
        payload.sizes = form.sizes?.map(s => ({ size: s.size, quantity: s.qty }));
      }

      let res;
      if (mode === "add") {
        res = await api.post('/products', payload);
      } else {
        res = await api.put(`/products/${product?.id}`, payload);
      }
      
      const saved: Product = {
        ...product,
        ...form,
        id: res.data.id,
        barcode: res.data.barcode,
        barcodeImageUrl: res.data.barcode_image_url,
        createdDate: res.data.created_at?.split('T')[0] || new Date().toISOString().split('T')[0]
      } as Product;

      onSave(saved);
      onClose();
    } catch (error: any) {
      alert(error.message || "Failed to save product");
    } finally {
      setLoading(false);
    }
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
  const totalQty = form.sizes?.reduce((s, x) => s + (x.qty || 0), 0) || 0;

  function printBarcodeLabel(p: Product) {
    const barcodeValue = p.barcode;
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api";
    const backendBase = apiBaseUrl.replace(/\/api\/?$/, "");
    const fullImageUrl = p.barcodeImageUrl ? `${backendBase}${p.barcodeImageUrl}` : "";

    const html = `
      <html><head><title>Print Barcode - ${barcodeValue}</title>
      <style>
        * { box-sizing: border-box; margin: 0; padding: 0; font-family: system-ui, sans-serif; }
        body { display: flex; flex-direction: column; items: center; justify-content: center; height: 100vh; padding: 20px; text-align: center; }
        .label-box { border: 2px dashed #ccc; padding: 15px; border-radius: 8px; width: 300px; display: flex; flex-direction: column; items: center; background: white; }
        .store-name { font-size: 11px; font-weight: 700; text-transform: uppercase; color: #666; margin-bottom: 4px; }
        .product-name { font-size: 14px; font-weight: 700; color: #111; margin-bottom: 8px; max-width: 100%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .barcode-container { margin-bottom: 8px; }
        .price { font-size: 16px; font-weight: 800; color: #dc2626; }
        @media print {
          body { padding: 0; }
          .label-box { border: none; }
        }
      </style>
      </head><body>
      <div class="label-box">
        <div class="store-name">🏪 ${store?.name || 'Stock Management'}</div>
        <div class="product-name">${p.name}</div>
        <div class="barcode-container">
          ${fullImageUrl ? 
            `<img src="${fullImageUrl}" style="max-width:100%; height:auto;" />` : 
            `<svg id="barcode-print"></svg>`
          }
        </div>
        <div class="price">₹${p.sellingPrice.toLocaleString("en-IN")}</div>
      </div>
      ${!fullImageUrl ? `
      <script src="https://cdn.jsdelivr.net/npm/jsbarcode@3.11.5/dist/JsBarcode.all.min.js"></script>
      <script>
        try {
          JsBarcode("#barcode-print", "${barcodeValue}", {
            format: "CODE128",
            width: 2,
            height: 60,
            displayValue: true,
            fontSize: 12
          });
        } catch(e) {
          document.body.innerHTML += "<p style='color:red;'>Failed to draw barcode</p>";
        }
      </script>
      ` : ''}
      <script>
        window.onload = function() {
          setTimeout(function() {
            window.print();
            window.close();
          }, 500);
        }
      </script>
      </body></html>
    `;

    const w = window.open("", "_blank", "width=450,height=400");
    if (!w) return;
    w.document.write(html);
    w.document.close();
    w.focus();
  }

  // ── VIEW MODE ─────────────────────────────────────────────────
  if (isView && product) {
    const badge = getStockBadge(product);
    const total = totalStock(product);

    // Safe number coercion — API may return strings or null for price fields
    const sellingPrice  = parseFloat(product.sellingPrice  as any) || 0;
    const purchasePrice = parseFloat(product.purchasePrice as any) || 0;
    const gstPercent    = parseFloat(product.gstPercent    as any) || 0;
    const margin        = sellingPrice - purchasePrice;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
        <div className="w-[80%] bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden max-h-[92vh] flex flex-col">

          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0">
            <div className="flex items-center gap-3">
              <ProductImage src={product.image} name={product.name} size="md" />
              <div>
                <h2 className="text-base font-bold text-gray-500">{product.name}</h2>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs font-mono text-slate-400">#{product.id}</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${badge.cls}`}>
                    {badge.label}
                  </span>
                  {!isGrocery && (
                    <span className="px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200 text-xs font-semibold">
                      {product.gender}
                    </span>
                  )}
                  {isGrocery && (
                    <span className="px-2 py-0.5 rounded-full bg-red-50 text-red-700 border border-red-200 text-xs font-semibold">
                      {product.unit}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-xl hover:bg-red-50 text-slate-400 hover:text-red-600 flex items-center justify-center transition-all bg-slate-50"
              title="Close"
            >
              <X size={20} />
            </button>
          </div>

          <div className="overflow-y-auto flex-1 px-6 py-5 space-y-6">

            {/* Product Image */}
            {product.image && (
              <div className="w-full h-52 rounded-xl overflow-hidden border border-slate-200 bg-slate-50">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={product.image} alt={product.name} className="w-full h-full object-contain" />
              </div>
            )}

            {/* ── Pricing ── */}
            <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-xl border border-red-100 p-4">
              <p className="text-xs font-bold text-red-400 uppercase tracking-widest mb-3">Pricing</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                  <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">Selling Price</p>
                  <p className="text-xl font-bold text-red-600 mt-0.5">₹{sellingPrice.toLocaleString("en-IN")}</p>
                </div>
                <div>
                  <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">Purchase Price</p>
                  <p className="text-xl font-bold text-slate-700 mt-0.5">₹{purchasePrice.toLocaleString("en-IN")}</p>
                </div>
                <div>
                  <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">GST</p>
                  <p className="text-xl font-bold text-amber-600 mt-0.5">{gstPercent}%</p>
                </div>
                <div>
                  <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">Margin</p>
                  <p className={`text-xl font-bold mt-0.5 ${margin >= 0 ? "text-green-600" : "text-red-600"}`}>
                    ₹{margin.toLocaleString("en-IN")}
                  </p>
                </div>
              </div>
            </div>

            {/* ── General Info ── */}
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">General Information</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-4">
                {[
                  { label: "Brand",    value: product.brand || "—" },
                  { label: "Category", value: product.category },
                  { label: "SKU",      value: product.sku || "—" },
                  { label: "Min Stock Alert", value: `${product.minStockAlert} pcs` },
                  { label: "Total Stock", value: `${total} pcs` },
                  { label: "Added On", value: product.createdDate ? new Date(product.createdDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—" },
                ].map((d) => (
                  <div key={d.label}>
                    <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">{d.label}</p>
                    <p className="text-sm text-slate-800 font-semibold mt-0.5">{d.value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* ── Garment Details ── */}
            {!isGrocery && (
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Garment Details</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-4">
                  {[
                    { label: "Gender",  value: product.gender  || "—" },
                    { label: "Fabric",  value: product.fabric  || "—" },
                    { label: "Color",   value: product.color   || "—" },
                  ].map((d) => (
                    <div key={d.label}>
                      <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">{d.label}</p>
                      <p className="text-sm text-slate-800 font-semibold mt-0.5">{d.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── Grocery Details ── */}
            {isGrocery && (
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Grocery Details</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-4">
                  {[
                    { label: "Unit",         value: product.unit      || "—" },
                    { label: "HSN Code",     value: product.hsnCode   || "—" },
                    { label: "Stock Qty",    value: product.stockQuantity != null ? `${product.stockQuantity} units` : "—" },
                    { label: "Mfg. Date",    value: product.mfgDate    ? new Date(product.mfgDate).toLocaleDateString("en-IN",    { day: "2-digit", month: "short", year: "numeric" }) : "—" },
                    { label: "Expiry Date",  value: product.expiryDate ? new Date(product.expiryDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—" },
                  ].map((d) => (
                    <div key={d.label}>
                      <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">{d.label}</p>
                      <p className="text-sm text-slate-800 font-semibold mt-0.5">{d.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── Size-wise Stock & Barcodes (Garments only) ── */}
            {!isGrocery && product.sizes && product.sizes.length > 0 && (
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Size-wise Stock &amp; Barcodes</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {product.sizes.map((s) => (
                    <div
                      key={s.size}
                      className={`flex flex-col p-3 rounded-xl border text-xs ${
                        s.qty === 0 ? "bg-red-50/60 border-red-200" : "bg-slate-50 border-slate-200"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-bold text-slate-800">{s.size}</span>
                        <span className={`font-bold text-xs px-1.5 py-0.5 rounded-full ${s.qty === 0 ? "bg-red-100 text-red-600" : "bg-green-100 text-green-700"}`}>
                          {s.qty} pcs
                        </span>
                      </div>
                      {s.barcode && (
                        <div className="mt-1.5 flex flex-col items-center bg-white rounded-lg border border-slate-100 p-2 text-center gap-1">
                          <Barcode value={s.barcode} imageUrl={s.barcodeImageUrl} useBackendImage={true} className="h-9" />
                          <p className="text-[9px] font-mono text-slate-400 break-all">{s.barcode}</p>
                          <button
                            onClick={() => printBarcodeLabel({
                              ...product,
                              name: `${product.name} (${s.size})`,
                              barcode: s.barcode,
                              barcodeImageUrl: s.barcodeImageUrl,
                            })}
                            className="flex items-center justify-center gap-1 w-full py-1 bg-slate-50 hover:bg-red-50 text-[10px] font-bold text-slate-600 hover:text-red-700 rounded border border-slate-200 transition-colors"
                          >
                            <Printer size={9} /> Print
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── Product Barcode (Grocery only) ── */}
            {isGrocery && product.barcodeImageUrl && (
              <div className="bg-slate-50 rounded-xl border border-slate-200 p-4">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Product Barcode</p>
                <div className="bg-white rounded-lg border border-slate-100 p-4 flex flex-col items-center text-center max-w-xs mx-auto gap-2">
                  <Barcode value={product.barcode || ""} imageUrl={product.barcodeImageUrl} useBackendImage={true} className="h-14" />
                  <p className="text-xs font-mono text-slate-500 font-semibold">{product.barcode}</p>
                  <button
                    onClick={() => printBarcodeLabel(product)}
                    className="flex items-center gap-1.5 px-4 py-2 bg-slate-50 hover:bg-red-50 text-xs font-bold text-slate-600 hover:text-red-700 rounded-lg border border-slate-200 transition-colors"
                  >
                    <Printer size={13} /> Print Label
                  </button>
                </div>
              </div>
            )}

            {/* ── Description ── */}
            {product.description && (
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">Description</p>
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
      <div className="w-[80%] bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden max-h-[94vh] flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0">
          <div>
            <h2 className="text-base font-bold text-gray-500">
              {mode === "add" ? "Add New Product" : `Edit — ${product?.name}`}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {mode === "add" 
                ? `Fill in ${isGrocery ? "grocery" : "clothing"} details below` 
                : "Update product information"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-xl hover:bg-red-50 text-slate-400 hover:text-red-600 flex items-center justify-center transition-all bg-slate-50"
            title="Close"
          >
            <X size={20} />
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
                      if (!isGrocery) set("sizes", []);
                    }}
                    options={isGrocery ? GROCERY_CATEGORIES : CLOTHING_CATEGORIES}
                  />

                  {!isGrocery ? (
                    <>
                      <SelectField
                        label="Gender *"
                        value={form.gender || "Men"}
                        onChange={(v) => {
                          set("gender", v);
                          set("sizes", []); 
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
                        value={form.fabric || "Cotton"}
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
                    </>
                  ) : (
                    <>
                      <SelectField
                        label="Unit *"
                        value={form.unit || "pcs"}
                        onChange={(v) => set("unit", v)}
                        options={UNITS}
                      />
                      <Field label="HSN Code">
                        <input
                          type="text"
                          placeholder="e.g. 1905"
                          value={form.hsnCode}
                          onChange={(e) => set("hsnCode", e.target.value)}
                          className={inputCls}
                        />
                      </Field>
                      <Field label="MFG Date">
                        <input
                          type="date"
                          value={form.mfgDate}
                          onChange={(e) => set("mfgDate", e.target.value)}
                          className={inputCls}
                        />
                      </Field>
                      <Field label="Expiry Date">
                        <input
                          type="date"
                          value={form.expiryDate}
                          onChange={(e) => set("expiryDate", e.target.value)}
                          className={inputCls}
                        />
                      </Field>
                      <Field label="Brand">
                        <input
                          type="text"
                          placeholder="e.g. Nestle, Amul"
                          value={form.brand}
                          onChange={(e) => set("brand", e.target.value)}
                          className={inputCls}
                        />
                      </Field>
                    </>
                  )}

                </div>
              </div>

              {/* Size & Stock (Garments) or Simple Stock (Grocery) */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                    {isGrocery ? "Stock Quantity *" : "Sizes & Stock *"}
                  </p>
                  {totalQty > 0 && (
                    <span className="text-xs font-semibold text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full">
                      Total: {totalQty} {isGrocery ? (form.unit || "pcs") : "pcs"}
                    </span>
                  )}
                </div>
                
                {isGrocery ? (
                  <Field label="Quantity">
                    <div className="relative">
                      <input
                        type="number"
                        min={0}
                        placeholder="0"
                        value={form.stockQuantity || ""}
                        onChange={(e) => set("stockQuantity", Number(e.target.value))}
                        className={inputCls}
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                        {form.unit || "pcs"}
                      </span>
                    </div>
                  </Field>
                ) : (
                  <>
                    <SizeStockEditor
                      sizes={form.sizes || []}
                      category={form.category}
                      gender={form.gender || "Men"}
                      onChange={(s) => { set("sizes", s); setErrors((e) => { const n = {...e}; delete n.sizes; return n; }); }}
                    />
                    {errors.sizes && (
                      <p className="text-[11px] text-red-500 mt-1">{errors.sizes}</p>
                    )}
                  </>
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
            className="flex-1 h-10 rounded-lg bg-red-600 hover:bg-red-700 text-sm font-semibold text-white transition-colors shadow-sm shadow-red-200 flex items-center justify-center gap-2"
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
  const [products, setProducts] = useState<Product[]>([]);
  const [store, setStore]       = useState<any>(null);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const storeId = localStorage.getItem('activeStoreId');
        if (storeId) {
          const storeRes = await api.get(`/stores/${storeId}`);
          setStore(storeRes.data);
        }

        const res = await api.get('/products');
        const mapped = res.data.map((p: any) => ({
          id: p.id,
          name: p.name,
          category: p.category,
          gender: p.gender,
          brand: p.brand,
          fabric: p.fabric,
          color: p.color,
          unit: p.unit,
          expiryDate: p.expiry_date,
          mfgDate: p.mfg_date,
          hsnCode: p.hsn_code,
          stockQuantity: p.stock_quantity,
          purchasePrice: parseFloat(p.purchase_price),
          sellingPrice: parseFloat(p.selling_price),
          gstPercent: parseFloat(p.gst_percent),
          minStockAlert: p.min_stock_level,
          description: p.description,
          sku: p.sku,
          barcode: p.barcode,
          barcodeImageUrl: p.barcode_image_url,
          image: p.image_url,
          createdDate: p.created_at?.split('T')[0],
           sizes: p.sizes?.map((s: any) => ({
             size: s.size,
             qty: s.quantity,
             barcode: s.barcode,
             barcodeImageUrl: s.barcode_image_url,
           })) || []
        }));
        setProducts(mapped);
      } catch (error) {
        console.error("Failed to fetch data", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);
  const [search, setSearch]     = useState("");
  const [catFilter, setCatFilter]   = useState("All");
  const [genderFilter, setGenderFilter] = useState("All");
  const [stockFilter, setStockFilter]   = useState("All");
  const [sortKey, setSortKey]   = useState<SortKey>("createdDate");
  const [sortDir, setSortDir]   = useState<"asc" | "desc">("desc");
  const [viewMode, setViewMode] = useState<ViewMode>("table");
  const [modal, setModal]       = useState<ModalMode>(null);
  const [selected, setSelected] = useState<Product | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const isGrocery = store?.category === "GROCERY";

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
          p.brand?.toLowerCase().includes(q) ||
          p.sku?.toLowerCase().includes(q) ||
          p.color?.toLowerCase().includes(q) ||
          p.barcode?.toLowerCase().includes(q) ||
          p.sizes?.some((s: any) => s.barcode?.toLowerCase().includes(q));
        const matchCat    = catFilter === "All" || p.category === catFilter;
        const matchGender = isGrocery || genderFilter === "All" || p.gender === genderFilter;
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

  function handleSave(p: Product) {
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

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this product?")) return;
    try {
      await api.delete(`/products/${id}`);
      setProducts((prev) => prev.filter((p) => p.id !== id));
      setDeleteId(null);
    } catch (error: any) {
      alert(error.message || "Failed to delete product");
    }
  }

  // ── RENDER ────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-red-600" />
          <p className="text-sm font-medium text-slate-500">Loading products...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">

        {/* Page Header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-xl font-bold text-gray-500">{isGrocery ? "Grocery Inventory" : "Clothing Products"}</h1>
            <p className="text-sm text-slate-500 mt-0.5">
              {products.length} items · {fmt(totalValue)} inventory value
            </p>
          </div>
          <button
            onClick={() => { setSelected(null); setModal("add"); }}
            className="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700 transition-colors shadow-sm shadow-red-200"
          >
            <Plus size={16} /> Add Product
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
          <StatCard label="Total Products"  value={products.length} sub="All categories"    icon={Package}       bg="bg-red-50"   ic="text-red-600"   />
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

          {!isGrocery && (
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
          )}

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
              className={`w-9 h-8 rounded-md flex items-center justify-center transition-all ${viewMode === "table" ? "bg-white text-red-600 shadow-sm" : "text-slate-400 hover:text-slate-600"}`}
            >
              <List size={15} />
            </button>
            <button
              onClick={() => setViewMode("grid")}
              className={`w-9 h-8 rounded-md flex items-center justify-center transition-all ${viewMode === "grid" ? "bg-white text-red-600 shadow-sm" : "text-slate-400 hover:text-slate-600"}`}
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
                        Product <ArrowUpDown size={12} className={sortKey === "name" ? "text-red-500" : ""} />
                      </button>
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wide">{isGrocery ? "Category / Unit" : "Category / Gender"}</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wide">{isGrocery ? "Brand / HSN" : "Fabric / Color"}</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wide">
                      <button onClick={() => toggleSort("sellingPrice")} className="flex items-center gap-1 hover:text-slate-700">
                        Pricing <ArrowUpDown size={12} className={sortKey === "sellingPrice" ? "text-red-500" : ""} />
                      </button>
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wide">{isGrocery ? "Dates" : "Sizes"}</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wide">
                      <button onClick={() => toggleSort("totalStock")} className="flex items-center gap-1 hover:text-slate-700">
                        Stock <ArrowUpDown size={12} className={sortKey === "totalStock" ? "text-red-500" : ""} />
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
                            className="text-xs text-red-600 hover:underline"
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
                            {p.sku && (
                              <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
                                <Tag size={9} />
                                <span className="font-mono">{p.sku}</span>
                              </p>
                            )}
                            {isGrocery && p.barcodeImageUrl && (
                              <div className="mt-1.5" title={`System Barcode: ${p.barcode}`}>
                                <Barcode value={p.barcode || ""} imageUrl={p.barcodeImageUrl} useBackendImage={true} className="h-6" />
                              </div>
                            )}
                            {!isGrocery && p.sizes?.some((s: any) => s.barcode) && (
                              <span className="text-[10px] text-slate-500 font-semibold bg-slate-100 px-1.5 py-0.5 rounded mt-1.5 inline-block">
                                🏷️ Barcodes per size
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <p className="text-sm text-slate-700">{p.category}</p>
                            <span className={`text-[11px] px-1.5 py-0.5 rounded-full font-medium ${isGrocery ? "bg-red-50 text-red-700 border border-red-100" : "bg-purple-50 text-purple-700 border border-purple-100"}`}>
                              {isGrocery ? p.unit : p.gender}
                            </span>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <p className="text-sm text-slate-700">{isGrocery ? p.brand : p.fabric}</p>
                            <p className="text-xs text-slate-400">{isGrocery ? `HSN: ${p.hsnCode || 'N/A'}` : p.color}</p>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <p className="font-bold text-gray-500">{fmt(p.sellingPrice)}</p>
                            <p className="text-xs text-slate-400">Cost: {fmt(p.purchasePrice)}</p>
                            <p className={`text-xs font-semibold ${m >= 0 ? "text-green-600" : "text-red-500"}`}>
                              {m >= 0 ? "+" : ""}{m}% margin
                            </p>
                          </td>
                          <td className="px-4 py-3">
                            {isGrocery ? (
                              <div className="space-y-0.5">
                                {p.mfgDate && <p className="text-[10px] text-slate-400">MFG: {p.mfgDate}</p>}
                                {p.expiryDate && (
                                  <p className={`text-[10px] font-bold ${new Date(p.expiryDate) < new Date() ? 'text-red-500' : 'text-amber-600'}`}>
                                    EXP: {p.expiryDate}
                                  </p>
                                )}
                              </div>
                            ) : (
                              <div className="flex flex-wrap gap-1">
                                {p.sizes?.slice(0, 4).map((s) => (
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
                                {p.sizes && p.sizes.length > 4 && (
                                  <span className="text-[10px] text-slate-400 px-1">
                                    +{p.sizes.length - 4}
                                  </span>
                                )}
                              </div>
                            )}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <p className={`font-bold ${badge.label === "Out of Stock" ? "text-red-500" : badge.label === "Low Stock" ? "text-amber-600" : "text-gray-500"}`}>
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
                                className="flex items-center gap-1 text-xs font-medium text-red-600 hover:text-red-800"
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
                  className="text-xs text-red-600 hover:underline"
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
                      className="bg-white rounded-xl border border-slate-200 overflow-hidden hover:border-red-200 hover:shadow-md transition-all group"
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
                        {!isGrocery && (
                          <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200">
                            {p.gender}
                          </span>
                        )}
                      </div>
                      <div className="p-4 space-y-3">
                        <div>
                          <p className="font-bold text-gray-500 leading-tight line-clamp-2">{p.name}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-slate-400">{p.category}</span>
                            {!isGrocery && (
                              <>
                                <span className="text-slate-200">·</span>
                                <span className="text-xs text-slate-500">{p.fabric}</span>
                              </>
                            )}
                          </div>
                          {!isGrocery && <p className="text-xs text-slate-400 mt-0.5">{p.color}</p>}
                          {isGrocery && p.expiryDate && (
                            <p className={`text-[10px] font-bold mt-1 ${new Date(p.expiryDate) < new Date() ? 'text-red-500' : 'text-amber-600'}`}>
                              EXP: {p.expiryDate}
                            </p>
                          )}
                        </div>

                        {/* Size chips (Garments) */}
                        {!isGrocery && p.sizes && (
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
                        )}

                        <div className="grid grid-cols-2 gap-2">
                          <div className="bg-slate-50 rounded-lg p-2 text-center">
                            <p className="text-xs text-slate-400">Selling</p>
                            <p className="text-sm font-bold text-gray-500">{fmt(p.sellingPrice)}</p>
                          </div>
                          <div className="bg-slate-50 rounded-lg p-2 text-center">
                            <p className="text-xs text-slate-400">Stock</p>
                            <p className={`text-sm font-bold ${badge.label === "Out of Stock" ? "text-red-500" : badge.label === "Low Stock" ? "text-amber-600" : "text-gray-500"}`}>
                              {tot} {isGrocery ? p.unit : "pcs"}
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

                        {isGrocery && p.barcodeImageUrl && (
                          <div className="py-1.5 flex justify-center bg-slate-50/50 rounded-lg border border-slate-100">
                            <Barcode value={p.barcode || ""} imageUrl={p.barcodeImageUrl} useBackendImage={true} className="h-8" />
                          </div>
                        )}
                        {!isGrocery && p.sizes?.some((s: any) => s.barcode) && (
                          <div className="py-1.5 flex justify-center bg-slate-50/50 rounded-lg border border-slate-100">
                            <span className="text-[10px] text-slate-500 font-semibold">
                              🏷️ Barcodes per size
                            </span>
                          </div>
                        )}

                        <div className="flex gap-2 pt-1 border-t border-slate-100">
                          <button
                            onClick={() => { setSelected(p); setModal("view"); }}
                            className="flex-1 flex items-center justify-center gap-1.5 h-8 rounded-lg bg-slate-50 hover:bg-red-50 text-xs font-semibold text-slate-600 hover:text-red-700 transition-colors"
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
          storeCategory={store?.category || "GARMENTS"}
          store={store}
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
                    <h3 className="text-base font-bold text-gray-500">Delete Product?</h3>
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