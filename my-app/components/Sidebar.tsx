"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard, Package, Receipt, ShoppingCart,
  Users, UserCheck, BarChart3, Settings, LogOut,
  Store, Plus, Tag, X, Upload, Check, ArrowLeftRight,
  Loader2, AlertCircle,
} from "lucide-react";
import { type LucideIcon } from "lucide-react";
import { useState, useRef, useEffect, useCallback } from "react";

// ─── API Config ────────────────────────────────────────────────────────────────

const API_BASE = "https://stock-management-backend-harsh2610.onrender.com/api";

function getToken() {
  return typeof window !== "undefined" ? localStorage.getItem("token") : null;
}

async function apiFetch(path: string, options: RequestInit = {}) {
  const token = getToken();
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || data.error || "API error");
  return data;
}

// ─── Types ────────────────────────────────────────────────────────────────────

type NavItem = { label: string; href: string; icon: LucideIcon; badge?: number };

type ShopCategory = { id: string; name: string; description: string };

type Shop = {
  id: string;
  name: string;
  address: string;
  phoneNumber: string;
  email: string;
  ownerName: string;
  logoUrl: string | null;
  categories: ShopCategory[];
};

type ApiStore = {
  id: number;
  name: string;
  owner_name: string;
  email: string;
  phone: string;
  address: string;
  created_at: string;
  updated_at: string;
};

type StoredUser = {
  id: number;
  name: string;
  email: string;
  role: "SUPER_ADMIN" | "ADMIN" | "STAFF";
  store_id?: number;
};

// ─── Safe API store mapper ────────────────────────────────────────────────────
// Handles both { data: {...} } and flat { id, name, ... } response shapes

function extractStore(res: unknown): ApiStore {
  if (res && typeof res === "object") {
    // Shape: { data: { id, name, ... } }
    if ("data" in res && res.data && typeof res.data === "object" && "id" in (res.data as object)) {
      return res.data as ApiStore;
    }
    // Shape: { store: { id, name, ... } }
    if ("store" in res && res.store && typeof res.store === "object" && "id" in (res.store as object)) {
      return res.store as ApiStore;
    }
    // Shape: flat { id, name, ... }
    if ("id" in res) {
      return res as ApiStore;
    }
  }
  throw new Error("Unexpected store response shape: " + JSON.stringify(res));
}

function mapApiStore(s: ApiStore): Shop {
  return {
    id: String(s.id),
    name: s.name,
    address: s.address || "",
    phoneNumber: s.phone || "",
    email: s.email || "",
    ownerName: s.owner_name || "",
    logoUrl: null,
    categories: [],
  };
}

// ─── Nav config ───────────────────────────────────────────────────────────────

const navItems: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Products",  href: "/products",  icon: Package,      badge: 3  },
  { label: "Billing",   href: "/billing",   icon: Receipt                 },
  { label: "Orders",    href: "/orders",    icon: ShoppingCart, badge: 12 },
  { label: "Customers", href: "/customers", icon: Users                   },
  { label: "Staff",     href: "/staff",     icon: UserCheck               },
  { label: "Reports",   href: "/reports",   icon: BarChart3               },
  { label: "Settings",  href: "/settings",  icon: Settings                },
];

function uid() { return Math.random().toString(36).slice(2, 10); }

// ─── Logo Uploader ────────────────────────────────────────────────────────────

function LogoUploader({
  value,
  onChange,
}: {
  value: string | null;
  onChange: (base64: string | null) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => onChange(reader.result as string);
    reader.readAsDataURL(file);
  }

  return (
    <div className="flex items-center gap-3">
      <div
        onClick={() => inputRef.current?.click()}
        className="w-16 h-16 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 flex items-center justify-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors overflow-hidden shrink-0"
      >
        {value ? (
          <img src={value} alt="logo" className="w-full h-full object-cover" />
        ) : (
          <div className="flex flex-col items-center gap-1">
            <Upload size={16} className="text-slate-400" />
            <span className="text-[9px] text-slate-400 font-medium">Logo</span>
          </div>
        )}
      </div>
      <div className="flex-1">
        <p className="text-xs font-medium text-slate-600 mb-1">Store Logo</p>
        <p className="text-[11px] text-slate-400 mb-2">PNG, JPG up to 2MB</p>
        <div className="flex gap-1.5">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="text-[11px] font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 px-2.5 py-1 rounded-lg transition-colors"
          >
            {value ? "Change" : "Upload"}
          </button>
          {value && (
            <button
              type="button"
              onClick={() => onChange(null)}
              className="text-[11px] font-semibold text-red-400 bg-red-50 hover:bg-red-100 px-2.5 py-1 rounded-lg transition-colors"
            >
              Remove
            </button>
          )}
        </div>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFile}
      />
    </div>
  );
}

// ─── Category Builder ─────────────────────────────────────────────────────────

function CategoryBuilder({
  categories,
  onChange,
}: {
  categories: ShopCategory[];
  onChange: (cats: ShopCategory[]) => void;
}) {
  const [input, setInput] = useState({ name: "", description: "" });
  const [error, setError] = useState("");

  function addCategory() {
    if (!input.name.trim()) { setError("Name is required"); return; }
    if (categories.some((c) => c.name.toLowerCase() === input.name.trim().toLowerCase())) {
      setError("Category already added");
      return;
    }
    onChange([...categories, { id: uid(), name: input.name.trim(), description: input.description.trim() }]);
    setInput({ name: "", description: "" });
    setError("");
  }

  return (
    <div className="space-y-2">
      {categories.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-1">
          {categories.map((cat) => (
            <span
              key={cat.id}
              className="flex items-center gap-1 text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-1 rounded-full"
            >
              <Tag size={9} />
              {cat.name}
              <button
                type="button"
                onClick={() => onChange(categories.filter((c) => c.id !== cat.id))}
                className="ml-0.5 text-emerald-400 hover:text-red-500 transition-colors"
              >
                <X size={10} />
              </button>
            </span>
          ))}
        </div>
      )}
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Category name"
          value={input.name}
          onChange={(e) => { setInput({ ...input, name: e.target.value }); setError(""); }}
          onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addCategory())}
          className="flex-1 px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
        <button
          type="button"
          onClick={addCategory}
          className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors shrink-0"
        >
          <Plus size={12} /> Add
        </button>
      </div>
      <input
        type="text"
        placeholder="Description (optional)"
        value={input.description}
        onChange={(e) => setInput({ ...input, description: e.target.value })}
        className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
      />
      {error && <p className="text-[11px] text-red-500">{error}</p>}
      <p className="text-[10px] text-slate-400">Press Enter or click Add. You can add more categories later.</p>
    </div>
  );
}

// ─── Create Store Modal ───────────────────────────────────────────────────────

function CreateStoreModal({
  onClose,
  onSave,
}: {
  onClose: () => void;
  onSave: (shop: Shop) => void;
}) {
  const [step, setStep]             = useState<1 | 2>(1);
  const [logoUrl, setLogoUrl]       = useState<string | null>(null);
  const [categories, setCategories] = useState<ShopCategory[]>([]);
  const [saving, setSaving]         = useState(false);
  const [apiError, setApiError]     = useState("");

  const [form, setForm] = useState({
    storeName: "",
    address: "",
    phoneNumber: "",
    email: "",
    ownerName: "",
    ownerEmail: "",
    ownerPassword: "",
  });
  const [errors, setErrors] = useState<Partial<typeof form>>({});

  function validateStep1() {
    const e: Partial<typeof form> = {};
    if (!form.storeName.trim())     e.storeName     = "Required";
    if (!form.ownerName.trim())     e.ownerName     = "Required";
    if (!form.ownerEmail.trim())    e.ownerEmail    = "Required";
    if (!form.ownerPassword.trim()) e.ownerPassword = "Required";
    if (form.ownerPassword && form.ownerPassword.length < 6)
      e.ownerPassword = "Min 6 characters";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setApiError("");

    try {
      // ── 1. Create Store ──────────────────────────────────────────────────────
      const storeRaw = await apiFetch("/stores", {
        method: "POST",
        body: JSON.stringify({
          name:       form.storeName.trim(),
          owner_name: form.ownerName.trim(),
          ...(form.email.trim()       && { email:   form.email.trim()       }),
          ...(form.phoneNumber.trim() && { phone:   form.phoneNumber.trim() }),
          ...(form.address.trim()     && { address: form.address.trim()     }),
        }),
      });

      // FIX 1 ─ handle any response shape: { data }, { store }, or flat object
      console.log("[CreateStore] raw response:", storeRaw);
      const createdStore = extractStore(storeRaw);

      // ── 2. Create ADMIN user linked to store ─────────────────────────────────
      await apiFetch("/users", {
        method: "POST",
        body: JSON.stringify({
          name:     form.ownerName.trim(),
          email:    form.ownerEmail.trim(),
          password: form.ownerPassword,
          role:     "ADMIN",
          store_id: createdStore.id,
        }),
      });

      const newShop: Shop = {
        id:          String(createdStore.id),
        name:        createdStore.name,
        address:     createdStore.address || "",
        phoneNumber: createdStore.phone   || "",
        email:       createdStore.email   || "",
        ownerName:   createdStore.owner_name,
        logoUrl,
        categories,
      };

      onSave(newShop);
    } catch (err: unknown) {
      console.error("[CreateStore] error:", err);
      setApiError(err instanceof Error ? err.message : "Failed to create store. Check console for details.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-auto flex flex-col max-h-[90vh]">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
              <Store size={16} className="text-blue-600" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">Create New Store</h2>
              <p className="text-[11px] text-slate-400">Step {step} of 2</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Step indicator */}
        <div className="flex px-6 pt-4 gap-2 shrink-0">
          {[{ n: 1, label: "Store & Owner" }, { n: 2, label: "Logo & Categories" }].map(({ n, label }) => (
            <div key={n} className="flex-1 flex flex-col items-center gap-1">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${step >= n ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-400"}`}>
                {step > n ? <Check size={13} /> : n}
              </div>
              <span className={`text-[10px] font-medium ${step >= n ? "text-blue-600" : "text-slate-400"}`}>{label}</span>
            </div>
          ))}
        </div>

        {/* Progress bar */}
        <div className="px-6 pt-1 pb-1 shrink-0">
          <div className="h-0.5 bg-slate-100 rounded-full mx-3.5">
            <div
              className="h-full bg-blue-600 rounded-full transition-all duration-300"
              style={{ width: step === 2 ? "100%" : "0%" }}
            />
          </div>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 px-6 py-4">

          {/* API Error Banner */}
          {apiError && (
            <div className="flex items-start gap-2 mb-4 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
              <AlertCircle size={15} className="text-red-500 mt-0.5 shrink-0" />
              <p className="text-xs text-red-600">{apiError}</p>
            </div>
          )}

          <form id="store-form" onSubmit={handleSubmit}>

            {/* ── STEP 1 ── */}
            {step === 1 && (
              <div className="space-y-4">

                {/* Store Details */}
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-3">Store Details</p>
                  <div className="space-y-3">

                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">Store Name *</label>
                      <input
                        type="text"
                        placeholder="e.g. Downtown Branch"
                        value={form.storeName}
                        onChange={(e) => setForm({ ...form, storeName: e.target.value })}
                        className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.storeName ? "border-red-400 bg-red-50" : "border-slate-200"}`}
                      />
                      {errors.storeName && <p className="text-[11px] text-red-500 mt-0.5">{errors.storeName}</p>}
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">Store Email</label>
                      <input
                        type="email"
                        placeholder="store@example.com"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">Address</label>
                      <input
                        type="text"
                        placeholder="e.g. 123 Main St, Delhi"
                        value={form.address}
                        onChange={(e) => setForm({ ...form, address: e.target.value })}
                        className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">Phone Number</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-medium select-none">+91</span>
                        <input
                          type="tel"
                          placeholder="9876543210"
                          maxLength={10}
                          value={form.phoneNumber}
                          onChange={(e) => setForm({ ...form, phoneNumber: e.target.value.replace(/\D/g, "") })}
                          className="w-full pl-10 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>

                  </div>
                </div>

                {/* Admin Credentials */}
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-3">Admin Login Credentials</p>
                  <div className="mb-3 bg-blue-50 border border-blue-100 rounded-lg px-3 py-2">
                    <p className="text-[11px] text-slate-600">
                      Creates an <strong>ADMIN</strong> user who can log in and manage this store.
                    </p>
                  </div>
                  <div className="space-y-3">

                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">Owner Name *</label>
                      <input
                        type="text"
                        placeholder="e.g. Rahul Sharma"
                        value={form.ownerName}
                        onChange={(e) => setForm({ ...form, ownerName: e.target.value })}
                        className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.ownerName ? "border-red-400 bg-red-50" : "border-slate-200"}`}
                      />
                      {errors.ownerName && <p className="text-[11px] text-red-500 mt-0.5">{errors.ownerName}</p>}
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">Admin Login Email *</label>
                      <input
                        type="email"
                        placeholder="admin@store.com"
                        value={form.ownerEmail}
                        onChange={(e) => setForm({ ...form, ownerEmail: e.target.value })}
                        className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.ownerEmail ? "border-red-400 bg-red-50" : "border-slate-200"}`}
                      />
                      {errors.ownerEmail && <p className="text-[11px] text-red-500 mt-0.5">{errors.ownerEmail}</p>}
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">
                        Password * <span className="font-normal text-slate-400">(min 6 chars)</span>
                      </label>
                      <input
                        type="password"
                        placeholder="Set login password"
                        value={form.ownerPassword}
                        onChange={(e) => setForm({ ...form, ownerPassword: e.target.value })}
                        className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.ownerPassword ? "border-red-400 bg-red-50" : "border-slate-200"}`}
                      />
                      {errors.ownerPassword && <p className="text-[11px] text-red-500 mt-0.5">{errors.ownerPassword}</p>}
                    </div>

                  </div>
                </div>
              </div>
            )}

            {/* ── STEP 2 ── */}
            {step === 2 && (
              <div className="space-y-5">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-3">Store Logo</p>
                  <LogoUploader value={logoUrl} onChange={setLogoUrl} />
                  <p className="text-[10px] text-slate-400 mt-2">Logo is stored in-browser only.</p>
                </div>
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-1">
                    Product Categories
                    <span className="ml-1 normal-case text-slate-300">(optional — add now or later)</span>
                  </p>
                  <CategoryBuilder categories={categories} onChange={setCategories} />
                </div>
              </div>
            )}

          </form>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 flex gap-2 shrink-0">
          {step === 1 ? (
            <>
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 text-sm font-medium text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => validateStep1() && setStep(2)}
                className="flex-1 px-4 py-2 text-sm font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Next →
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => setStep(1)}
                disabled={saving}
                className="flex-1 px-4 py-2 text-sm font-medium text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50"
              >
                ← Back
              </button>
              <button
                type="submit"
                form="store-form"
                disabled={saving}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-60"
              >
                {saving ? (
                  <><Loader2 size={14} className="animate-spin" /> Creating…</>
                ) : "Create Store"}
              </button>
            </>
          )}
        </div>

      </div>
    </div>
  );
}

// ─── Store Switcher Modal ─────────────────────────────────────────────────────

function StoreSwitcherModal({
  shops,
  activeShopId,
  onSwitch,
  onClose,
}: {
  shops: Shop[];
  activeShopId: string | null;
  onSwitch: (id: string) => void;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-auto">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <ArrowLeftRight size={16} className="text-blue-600" />
            <h2 className="text-sm font-bold text-slate-900">Switch Store</h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X size={18} />
          </button>
        </div>
        <div className="p-3 space-y-1.5 max-h-80 overflow-y-auto">
          {shops.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-6">No stores created yet.</p>
          ) : (
            shops.map((shop) => {
              const isActive = shop.id === activeShopId;
              return (
                <button
                  key={shop.id}
                  onClick={() => { onSwitch(shop.id); onClose(); }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-left ${isActive ? "bg-blue-600 text-white shadow-md shadow-blue-100" : "hover:bg-slate-50 text-slate-700"}`}
                >
                  <div className={`w-10 h-10 rounded-lg shrink-0 overflow-hidden flex items-center justify-center ${isActive ? "bg-white/20" : "bg-slate-100"}`}>
                    {shop.logoUrl
                      ? <img src={shop.logoUrl} alt={shop.name} className="w-full h-full object-cover" />
                      : <Store size={18} className={isActive ? "text-white" : "text-slate-400"} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-semibold truncate ${isActive ? "text-white" : "text-slate-800"}`}>{shop.name}</p>
                    <p className={`text-[11px] truncate ${isActive ? "text-white/70" : "text-slate-400"}`}>
                      {shop.ownerName} · {shop.categories.length} categories
                    </p>
                    {shop.phoneNumber && (
                      <p className={`text-[10px] truncate ${isActive ? "text-white/60" : "text-slate-400"}`}>+91 {shop.phoneNumber}</p>
                    )}
                    {shop.email && (
                      <p className={`text-[10px] truncate ${isActive ? "text-white/60" : "text-slate-400"}`}>{shop.email}</p>
                    )}
                  </div>
                  {isActive && <Check size={16} className="text-white shrink-0" />}
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Active Store Banner ──────────────────────────────────────────────────────

function ActiveStoreBanner({ shop, onSwitch }: { shop: Shop; onSwitch: () => void }) {
  return (
    <div className="mx-3 mb-3 rounded-xl border border-blue-100 bg-blue-50 p-3">
      <p className="text-[10px] font-semibold uppercase tracking-widest text-blue-400 mb-2">Active Store</p>
      <div className="flex items-center gap-2.5">
        <div className="w-10 h-10 rounded-lg bg-white border border-blue-100 flex items-center justify-center overflow-hidden shrink-0">
          {shop.logoUrl
            ? <img src={shop.logoUrl} alt={shop.name} className="w-full h-full object-cover" />
            : <Store size={17} className="text-blue-500" />}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-slate-800 truncate">{shop.name}</p>
          <p className="text-[11px] text-slate-500 truncate">{shop.ownerName}</p>
          {shop.phoneNumber && (
            <p className="text-[10px] text-slate-400 truncate">📞 +91 {shop.phoneNumber}</p>
          )}
          {shop.email && (
            <p className="text-[10px] text-slate-400 truncate">✉️ {shop.email}</p>
          )}
        </div>
        <button
          onClick={onSwitch}
          className="flex items-center gap-1 text-[11px] font-semibold text-blue-600 hover:text-blue-800 bg-white hover:bg-blue-50 border border-blue-200 px-2 py-1 rounded-lg transition-colors shrink-0"
        >
          <ArrowLeftRight size={10} /> Switch
        </button>
      </div>
      {shop.categories.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2.5">
          {shop.categories.slice(0, 4).map((cat) => (
            <span
              key={cat.id}
              className="flex items-center gap-1 text-[10px] font-medium bg-white text-emerald-700 border border-emerald-100 px-1.5 py-0.5 rounded-full"
            >
              <Tag size={8} /> {cat.name}
            </span>
          ))}
          {shop.categories.length > 4 && (
            <span className="text-[10px] text-slate-400 px-1 py-0.5">+{shop.categories.length - 4} more</span>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Main Sidebar ─────────────────────────────────────────────────────────────

export default function Sidebar() {
  const pathname = usePathname();
  const router   = useRouter();

  const [shops, setShops]                     = useState<Shop[]>([]);
  const [activeShopId, setActiveShopId]       = useState<string | null>(null);
  const [showCreateStore, setShowCreateStore] = useState(false);
  const [showSwitcher, setShowSwitcher]       = useState(false);
  const [loadingStores, setLoadingStores]     = useState(true);

  // FIX 2 ─ user read reactively via useEffect, not inline during render
  const [user, setUser] = useState<StoredUser | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("user");
      if (raw) setUser(JSON.parse(raw));
    } catch {
      setUser(null);
    }
  }, []);

  // FIX 3 ─ fetchStores no longer closes over activeShopId — uses functional setState
  const fetchStores = useCallback(async () => {
    setLoadingStores(true);
    try {
      const res = await apiFetch("/stores");

      // Handle { data: [] } or flat []
      const list: ApiStore[] = Array.isArray(res)
        ? res
        : Array.isArray(res.data)
        ? res.data
        : [];

      const fetched = list.map(mapApiStore);
      setShops(fetched);
      // Auto-select first store without closing over activeShopId
      setActiveShopId((prev) => (fetched.length > 0 && !prev ? fetched[0].id : prev));
    } catch (err) {
      console.error("[fetchStores] error:", err);
    } finally {
      setLoadingStores(false);
    }
  }, []); // no deps needed — uses functional updater

  useEffect(() => { fetchStores(); }, [fetchStores]);

  const activeShop = shops.find((s) => s.id === activeShopId) ?? null;

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/");
  }

  // FIX 4 ─ check shops.length inside the setShops updater to avoid stale closure
  function handleCreateStore(shop: Shop) {
    setShops((prev) => {
      if (prev.length === 0) setActiveShopId(shop.id);
      return [...prev, shop];
    });
    setShowCreateStore(false);
  }

  const isSuperAdmin = !user || user.role === "SUPER_ADMIN";

  return (
    <>
      <aside className="flex h-screen w-64 flex-col border-r border-slate-200 bg-white overflow-y-auto">

        {/* Brand */}
        <div className="flex items-center gap-3 px-5 py-5 border-b border-slate-100 shrink-0">
          <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-blue-600 shrink-0">
            <Package className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-900 leading-tight">Stock</p>
            <p className="text-xs text-blue-600 font-semibold leading-tight">Management</p>
          </div>
        </div>

        {/* Active Store Banner */}
        {activeShop && (
          <div className="pt-3">
            <ActiveStoreBanner shop={activeShop} onSwitch={() => setShowSwitcher(true)} />
          </div>
        )}

        {/* Navigation */}
        <nav className="px-3 py-4 space-y-0.5 shrink-0">
          <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-widest text-slate-400">Main Menu</p>
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all group ${
                  isActive
                    ? "bg-blue-600 text-white shadow-sm shadow-blue-200"
                    : "text-slate-600 hover:bg-blue-50 hover:text-blue-700"
                }`}
              >
                <Icon
                  size={18}
                  className={`shrink-0 transition-colors ${
                    isActive ? "text-white" : "text-slate-400 group-hover:text-blue-600"
                  }`}
                />
                <span className="flex-1">{item.label}</span>
                {item.badge != null && (
                  <span className={`text-xs font-semibold px-1.5 py-0.5 rounded-full ${
                    isActive ? "bg-white/20 text-white" : "bg-blue-100 text-blue-600"
                  }`}>
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Stores Section */}
        <div className="px-3 pb-4 flex-1">
          <div className="border-t border-slate-100 pt-4">

            <div className="flex items-center justify-between px-1 mb-3">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                Stores ({shops.length})
              </p>
              <div className="flex items-center gap-1">
                {shops.length > 1 && (
                  <button
                    onClick={() => setShowSwitcher(true)}
                    className="flex items-center gap-1 text-[11px] font-semibold text-slate-500 hover:text-blue-600 bg-slate-50 hover:bg-blue-50 px-2 py-0.5 rounded-full transition-colors"
                  >
                    <ArrowLeftRight size={10} /> Switch
                  </button>
                )}
                {isSuperAdmin && (
                  <button
                    onClick={() => setShowCreateStore(true)}
                    className="flex items-center gap-1 text-[11px] font-semibold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-2 py-0.5 rounded-full transition-colors"
                  >
                    <Plus size={11} /> New
                  </button>
                )}
              </div>
            </div>

            {loadingStores ? (
              <div className="flex items-center gap-2 px-2 py-3 text-slate-400">
                <Loader2 size={13} className="animate-spin text-blue-400" />
                <span className="text-[11px]">Loading stores…</span>
              </div>
            ) : shops.length === 0 ? (
              <p className="text-[11px] text-slate-400 px-2 py-1">
                No stores yet.{" "}
                {isSuperAdmin && (
                  <button
                    onClick={() => setShowCreateStore(true)}
                    className="text-blue-500 hover:underline font-semibold"
                  >
                    Create one
                  </button>
                )}
              </p>
            ) : (
              <div className="space-y-1">
                {shops.map((shop) => {
                  const isActive = shop.id === activeShopId;
                  return (
                    <button
                      key={shop.id}
                      onClick={() => setActiveShopId(shop.id)}
                      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left transition-all ${
                        isActive
                          ? "bg-blue-600 text-white shadow-sm"
                          : "hover:bg-slate-50 text-slate-700"
                      }`}
                    >
                      <div className={`w-7 h-7 rounded-md shrink-0 overflow-hidden flex items-center justify-center ${isActive ? "bg-white/20" : "bg-slate-100"}`}>
                        {shop.logoUrl
                          ? <img src={shop.logoUrl} alt={shop.name} className="w-full h-full object-cover" />
                          : <Store size={13} className={isActive ? "text-white" : "text-slate-400"} />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-xs font-semibold truncate ${isActive ? "text-white" : "text-slate-800"}`}>
                          {shop.name}
                        </p>
                        <p className={`text-[10px] truncate ${isActive ? "text-white/70" : "text-slate-400"}`}>
                          {shop.ownerName}{shop.phoneNumber ? ` · ${shop.phoneNumber}` : ""}
                        </p>
                      </div>
                      {isActive && <Check size={13} className="text-white shrink-0" />}
                    </button>
                  );
                })}
              </div>
            )}

          </div>
        </div>

        {/* User Footer */}
        <div className="border-t border-slate-100 p-4 shrink-0">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 text-xs font-bold shrink-0">
              {user?.name ? user.name.slice(0, 2).toUpperCase() : "SA"}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-slate-900 truncate">{user?.name || "Super Admin"}</p>
              <p className="text-xs text-slate-400 truncate">{user?.email || "admin@stockmgmt.com"}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-500 hover:bg-red-50 hover:text-red-600 transition-colors"
          >
            <LogOut size={16} /> Sign out
          </button>
        </div>

      </aside>
{/* harsh */}
      {showCreateStore && (
        <CreateStoreModal
          onClose={() => setShowCreateStore(false)}
          onSave={handleCreateStore}
        />
      )}
      {showSwitcher && (
        <StoreSwitcherModal
          shops={shops}
          activeShopId={activeShopId}
          onSwitch={setActiveShopId}
          onClose={() => setShowSwitcher(false)}
        />
      )}
    </>
  );
}