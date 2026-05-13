"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Phone, Mail, ShoppingBag, Salad, Upload, Calendar,
  LayoutDashboard, Package, Receipt, ShoppingCart, Users, UserCheck,
  BarChart3, Settings, AlertCircle, UserPlus, X, Pencil, Wallet,
  Check, Store, ArrowLeftRight, Plus, LogOut
} from "lucide-react";
import { type LucideIcon } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { api } from "@/lib/api";

// ─── Types ─────────────────────────────────────────────────────────────────────

type NavItem = { label: string; href: string; icon: LucideIcon; badge?: number };

type StoreCategory = "GROCERY" | "GARMENTS";

type StoreAdmin = {
  id: string;
  name: string;
  email: string;
  phone: string;
  password?: string;
};

type Shop = {
  id: string;
  name: string;
  ownerName: string;
  address: string;
  phone: string;
  email: string;
  upiId: string;
  logoUrl: string | null;
  category: StoreCategory;
  admins: StoreAdmin[];
};

type StoredUser = {
  id: number;
  name: string;
  email: string;
  role: "SUPER_ADMIN" | "ADMIN" | "STAFF";
  store_id?: number;
};

type BackendAdmin = {
  id: number | string;
  name: string;
  email: string;
  phone?: string | null;
};

type BackendStore = {
  id: number | string;
  name: string;
  owner_name?: string | null;
  address?: string | null;
  phone?: string | null;
  email?: string | null;
  upi_id?: string | null;
  logo_url?: string | null;
  category?: StoreCategory | null;
  users?: BackendAdmin[];
};

// ─── Helpers ───────────────────────────────────────────────────────────────────

function uid() { return Math.random().toString(36).slice(2, 10); }

function getErrorMessage(err: unknown, fallback: string) {
  return err instanceof Error ? err.message : fallback;
}

// ─── Nav config ────────────────────────────────────────────────────────────────

const navItems: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Products",  href: "/products",  icon: Package,      badge: 3  },
  { label: "Billing",   href: "/billing",   icon: Receipt                 },
  { label: "Orders",    href: "/orders",    icon: ShoppingCart, badge: 12 },
  { label: "Customers", href: "/customers", icon: Users                   },
  { label: "Staff",     href: "/staff",     icon: UserCheck               },
  { label: "Reports",   href: "/reports",   icon: BarChart3               },
  { label: "Attendance", href: "/attendance", icon: Calendar              },
  { label: "Settings",  href: "/settings",  icon: Settings                },
];

const CATEGORY_META: Record<StoreCategory, { label: string; icon: LucideIcon; color: string }> = {
  GROCERY:  { label: "Grocery",  icon: Salad,       color: "text-green-600 bg-green-50 border-green-200"   },
  GARMENTS: { label: "Garments", icon: ShoppingBag, color: "text-purple-600 bg-purple-50 border-purple-200" },
};

// ─── Shared UI helpers ─────────────────────────────────────────────────────────

const inputCls = (err?: string) =>
  `w-full px-3 py-2 text-sm text-slate-900 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 ${
    err ? "border-red-400 bg-red-50" : "border-slate-200"
  }`;

function Field({ label, required, error, children }: {
  label: string; required?: boolean; error?: string; children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-slate-600 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
      {error && <p className="text-[11px] text-red-500 mt-0.5">{error}</p>}
    </div>
  );
}

function ErrorBanner({ msg }: { msg: string }) {
  return (
    <div className="flex items-start gap-2 mb-4 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
      <AlertCircle size={15} className="text-red-500 mt-0.5 shrink-0" />
      <p className="text-xs text-red-600">{msg}</p>
    </div>
  );
}

// ─── Logo Uploader ─────────────────────────────────────────────────────────────

function LogoUploader({ value, onChange }: {
  value: string | null;
  onChange: (v: string | null) => void;
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
        className="w-16 h-16 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 flex items-center justify-center cursor-pointer hover:border-red-400 hover:bg-red-50 transition-colors overflow-hidden shrink-0"
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
            className="text-[11px] font-semibold text-red-600 bg-red-50 hover:bg-red-100 px-2.5 py-1 rounded-lg transition-colors"
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
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
    </div>
  );
}

// ─── Category Selector ─────────────────────────────────────────────────────────

function CategorySelector({ value, onChange, disabled }: {
  value: StoreCategory;
  onChange: (v: StoreCategory) => void;
  disabled?: boolean;
}) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {(Object.keys(CATEGORY_META) as StoreCategory[]).map((cat) => {
        const { label, icon: Icon, color } = CATEGORY_META[cat];
        const active = value === cat;
        return (
          <button
            key={cat}
            type="button"
            disabled={disabled}
            onClick={() => onChange(cat)}
            className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border-2 text-sm font-semibold transition-all ${
              active
                ? `${color} border-current shadow-sm`
                : "border-slate-200 text-slate-500 hover:border-slate-300 hover:bg-slate-50"
            } disabled:opacity-50`}
          >
            <Icon size={15} /> {label}
          </button>
        );
      })}
    </div>
  );
}

// ─── Add Admin Modal ───────────────────────────────────────────────────────────

function AddAdminModal({ shopId, shopName, onClose, onAdded }: {
  shopId: string;
  shopName: string;
  onClose: () => void;
  onAdded: (admin: StoreAdmin) => void;
}) {
  const [form, setForm]     = useState({ name: "", email: "", phone: "", password: "" });
  const [errors, setErrors] = useState<Partial<typeof form>>({});
  const [apiError, setApiError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  function validate() {
    const e: Partial<typeof form> = {};
    if (!form.name.trim())     e.name     = "Required";
    if (!form.email.trim())    e.email    = "Required";
    if (!form.password.trim()) e.password = "Required";
    if (form.password && form.password.length < 6) e.password = "Min 6 characters";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    setApiError("");
    setIsSubmitting(true);
    try {
      const response = await api.post("/users", {
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        password: form.password,
        role: "ADMIN",
        store_id: Number(shopId),
      });

      const created = response.data;
      onAdded({
        id: String(created.id),
        name: created.name,
        email: created.email,
        phone: created.phone || form.phone.trim(),
      });
      onClose();
    } catch (err: unknown) {
      setApiError(getErrorMessage(err, "Failed to add admin"));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center">
              <UserPlus size={15} className="text-red-600" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">Add Admin</h2>
              <p className="text-[11px] text-slate-400 truncate max-w-[160px]">{shopName}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="px-5 py-4 space-y-3">
          {apiError && <ErrorBanner msg={apiError} />}

          <Field label="Full Name" required error={errors.name}>
            <input
              type="text"
              placeholder="e.g. Rahul Sharma"
              value={form.name}
              onChange={(e) => { setForm({ ...form, name: e.target.value }); setErrors({ ...errors, name: "" }); }}
              className={inputCls(errors.name)}
            />
          </Field>

          <Field label="Email" required error={errors.email}>
            <div className="relative">
              <Mail size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="email"
                placeholder="admin@store.com"
                value={form.email}
                onChange={(e) => { setForm({ ...form, email: e.target.value }); setErrors({ ...errors, email: "" }); }}
                className={`w-full pl-8 pr-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 ${
                  errors.email ? "border-red-400 bg-red-50" : "border-slate-200"
                }`}
              />
            </div>
          </Field>

          <Field label="Phone Number">
            <div className="relative">
              <Phone size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="tel"
                placeholder="9876543210"
                maxLength={10}
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value.replace(/\D/g, "") })}
                className="w-full pl-8 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
          </Field>

          <Field label="Password" required error={errors.password}>
            <input
              type="password"
              placeholder="Min 6 characters"
              value={form.password}
              onChange={(e) => { setForm({ ...form, password: e.target.value }); setErrors({ ...errors, password: "" }); }}
              className={inputCls(errors.password)}
            />
          </Field>

          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 text-sm font-medium text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm font-bold text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <UserPlus size={14} /> {isSubmitting ? "Adding..." : "Add Admin"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Edit Store Modal ──────────────────────────────────────────────────────────

function EditStoreModal({ shop, onClose, onUpdate, onAdminAdded }: {
  shop: Shop;
  onClose: () => void;
  onUpdate: (updated: Shop) => void;
  onAdminAdded: (shopId: string, admin: StoreAdmin) => void;
}) {
  const [form, setForm] = useState({
    name:      shop.name,
    ownerName: shop.ownerName,
    address:   shop.address,
    phone:     shop.phone,
    upiId:     shop.upiId,
    category:  shop.category,
    logoUrl:   shop.logoUrl,
  });
  const [admins, setAdmins]             = useState<StoreAdmin[]>(shop.admins);
  const [errors, setErrors]             = useState<Partial<typeof form>>({});
  const [activeTab, setActiveTab]       = useState<"details" | "admins">("details");
  const [showAddAdmin, setShowAddAdmin] = useState(false);

  function validate() {
    const e: Partial<typeof form> = {};
    if (!form.name.trim()) e.name = "Required";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    onUpdate({
      ...shop,
      name:      form.name.trim(),
      ownerName: form.ownerName.trim(),
      address:   form.address.trim(),
      phone:     form.phone.trim(),
      upiId:     form.upiId.trim(),
      category:  form.category,
      logoUrl:   form.logoUrl,
      admins,
    });
  }

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-auto flex flex-col max-h-[90vh]">

          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
                <Pencil size={15} className="text-amber-600" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900">Edit Store</h2>
                <p className="text-[11px] text-slate-400 truncate max-w-[200px]">{shop.name}</p>
              </div>
            </div>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
              <X size={18} />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex px-6 pt-3 gap-1 shrink-0 border-b border-slate-100">
            {(["details", "admins"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 text-xs font-semibold rounded-t-lg transition-colors border-b-2 ${
                  activeTab === tab
                    ? "text-red-600 border-red-600 bg-red-50"
                    : "text-slate-500 border-transparent hover:text-slate-700"
                }`}
              >
                {tab === "admins" ? `Admins (${admins.length})` : "Store Details"}
              </button>
            ))}
          </div>

          {/* Body */}
          <div className="overflow-y-auto flex-1 px-6 py-4">

            {/* ── Details Tab ── */}
            {activeTab === "details" && (
              <form id="edit-store-form" onSubmit={handleSave} className="space-y-4">

                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-2">Store Logo</p>
                  <LogoUploader
                    value={form.logoUrl}
                    onChange={(v) => setForm({ ...form, logoUrl: v })}
                  />
                </div>

                <div className="border-t border-slate-100 pt-3 space-y-3">

                  <Field label="Store Name" required error={errors.name}>
                    <input
                      type="text"
                      value={form.name}
                      onChange={(e) => { setForm({ ...form, name: e.target.value }); setErrors({ ...errors, name: "" }); }}
                      className={inputCls(errors.name)}
                    />
                  </Field>

                  <Field label="Owner Name">
                    <input
                      type="text"
                      placeholder="e.g. Rahul Sharma"
                      value={form.ownerName}
                      onChange={(e) => setForm({ ...form, ownerName: e.target.value })}
                      className={inputCls()}
                    />
                  </Field>

                  {/* Email — read only */}
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">
                      Email <span className="text-slate-400 font-normal">(not editable)</span>
                    </label>
                    <input
                      type="email"
                      value={shop.email}
                      disabled
                      className="w-full px-3 py-2 text-sm border border-slate-100 rounded-lg bg-slate-50 text-slate-400 cursor-not-allowed"
                    />
                  </div>

                  <Field label="Address">
                    <input
                      type="text"
                      placeholder="123 Main St, Delhi"
                      value={form.address}
                      onChange={(e) => setForm({ ...form, address: e.target.value })}
                      className={inputCls()}
                    />
                  </Field>

                  <Field label="Phone Number">
                    <div className="relative">
                      <Phone size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="tel"
                        placeholder="9876543210"
                        maxLength={10}
                        value={form.phone}
                        onChange={(e) => setForm({ ...form, phone: e.target.value.replace(/\D/g, "") })}
                        className="w-full pl-8 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                      />
                    </div>
                  </Field>

                  <Field label="UPI ID">
                    <div className="relative">
                      <Wallet size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        placeholder="yourname@upi"
                        value={form.upiId}
                        onChange={(e) => setForm({ ...form, upiId: e.target.value })}
                        className="w-full pl-8 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                      />
                    </div>
                  </Field>

                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-2">Category</label>
                    <CategorySelector
                      value={form.category}
                      onChange={(v) => setForm({ ...form, category: v })}
                    />
                  </div>

                </div>
              </form>
            )}

            {/* ── Admins Tab ── */}
            {activeTab === "admins" && (
              <div className="space-y-3">
                <button
                  onClick={() => setShowAddAdmin(true)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-bold text-white bg-red-600 rounded-xl hover:bg-red-700 transition-colors"
                >
                  <UserPlus size={15} /> Add Admin
                </button>

                {admins.length === 0 ? (
                  <div className="text-center py-8 text-slate-400">
                    <UserCheck size={32} className="mx-auto mb-2 text-slate-300" />
                    <p className="text-sm">No admins yet.</p>
                    <p className="text-[11px]">Add an admin to manage this store.</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {admins.map((admin) => (
                      <div
                        key={admin.id}
                        className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 bg-slate-50"
                      >
                        <div className="w-9 h-9 rounded-full bg-red-100 flex items-center justify-center text-red-700 text-xs font-bold shrink-0">
                          {admin.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-slate-800 truncate">{admin.name}</p>
                          <div className="flex items-center gap-1 text-[11px] text-slate-500 truncate">
                            <Mail size={9} /> {admin.email}
                          </div>
                          {admin.phone && (
                            <div className="flex items-center gap-1 text-[10px] text-slate-400">
                              <Phone size={9} /> +91 {admin.phone}
                            </div>
                          )}
                        </div>
                        <span className="text-[10px] font-bold text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full">
                          ADMIN
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-slate-100 flex gap-2 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-sm font-medium text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            {activeTab === "details" && (
              <button
                type="submit"
                form="edit-store-form"
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm font-bold text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
              >
                <Check size={14} /> Save Changes
              </button>
            )}
          </div>

        </div>
      </div>

      {showAddAdmin && (
        <AddAdminModal
          shopId={shop.id}
          shopName={shop.name}
          onClose={() => setShowAddAdmin(false)}
          onAdded={(admin) => {
            setAdmins((prev) => [...prev, admin]);
            onAdminAdded(shop.id, admin);
          }}
        />
      )}
    </>
  );
}

// ─── Create Store Modal ────────────────────────────────────────────────────────

function CreateStoreModal({ onClose, onSave }: {
  onClose: () => void;
  onSave: (shop: Shop) => void;
}) {
  const [form, setForm] = useState({
    name:      "",
    ownerName: "",
    address:   "",
    phone:     "",
    email:     "",
    upiId:     "",
    category:  "GROCERY" as StoreCategory,
  });
  const [logoUrl, setLogoUrl]   = useState<string | null>(null);
  const [errors, setErrors]     = useState<Partial<typeof form>>({});

  function validate() {
    const e: Partial<typeof form> = {};
    if (!form.name.trim())  e.name  = "Required";
    if (!form.email.trim()) e.email = "Required";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    onSave({
      id:        uid(),
      name:      form.name.trim(),
      ownerName: form.ownerName.trim(),
      address:   form.address.trim(),
      phone:     form.phone.trim(),
      email:     form.email.trim(),
      upiId:     form.upiId.trim(),
      logoUrl,
      category:  form.category,
      admins:    [],
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-auto flex flex-col max-h-[90vh]">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center">
              <Store size={16} className="text-red-600" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">Create New Store</h2>
              <p className="text-[11px] text-slate-400">Fill in store details to get started</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 px-6 py-4">
          <form id="create-store-form" onSubmit={handleSubmit} className="space-y-4">

            {/* Logo */}
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-2">Store Logo</p>
              <LogoUploader value={logoUrl} onChange={setLogoUrl} />
            </div>

            <div className="border-t border-slate-100 pt-3 space-y-3">

              <Field label="Store Name" required error={errors.name}>
                <input
                  type="text"
                  placeholder="e.g. Downtown Branch"
                  value={form.name}
                  onChange={(e) => { setForm({ ...form, name: e.target.value }); setErrors({ ...errors, name: "" }); }}
                  className={inputCls(errors.name)}
                />
              </Field>

              <Field label="Owner Name">
                <input
                  type="text"
                  placeholder="e.g. Rahul Sharma"
                  value={form.ownerName}
                  onChange={(e) => setForm({ ...form, ownerName: e.target.value })}
                  className={inputCls()}
                />
              </Field>

              <Field label="Store Email" required error={errors.email}>
                <div className="relative">
                  <Mail size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    placeholder="store@example.com"
                    value={form.email}
                    onChange={(e) => { setForm({ ...form, email: e.target.value }); setErrors({ ...errors, email: "" }); }}
                    className={`w-full pl-8 pr-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 ${
                      errors.email ? "border-red-400 bg-red-50" : "border-slate-200"
                    }`}
                  />
                </div>
              </Field>

              <Field label="Phone Number">
                <div className="relative">
                  <Phone size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="tel"
                    placeholder="9876543210"
                    maxLength={10}
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value.replace(/\D/g, "") })}
                    className="w-full pl-8 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
              </Field>

              <Field label="UPI ID">
                <div className="relative">
                  <Wallet size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="yourname@upi"
                    value={form.upiId}
                    onChange={(e) => setForm({ ...form, upiId: e.target.value })}
                    className="w-full pl-8 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
              </Field>

              <Field label="Address">
                <input
                  type="text"
                  placeholder="e.g. 123 Main St, Delhi"
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  className={inputCls()}
                />
              </Field>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-2">
                  Store Category <span className="text-red-500">*</span>
                </label>
                <CategorySelector
                  value={form.category}
                  onChange={(v) => setForm({ ...form, category: v })}
                />
              </div>

            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 flex gap-2 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-2 text-sm font-medium text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
            <button
              type="submit"
              form="create-store-form"
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm font-bold text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
            >
              <Store size={14} /> Create Store
            </button>
        </div>

      </div>
    </div>
  );
}

// ─── Store Switcher Modal ──────────────────────────────────────────────────────

function StoreSwitcherModal({ shops, activeShopId, onSwitch, onClose }: {
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
            <ArrowLeftRight size={16} className="text-red-600" />
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
              const catMeta  = CATEGORY_META[shop.category];
              const CatIcon  = catMeta.icon;
              return (
                <button
                  key={shop.id}
                  onClick={() => { onSwitch(shop.id); onClose(); }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-left ${
                    isActive
                      ? "bg-red-600 text-white shadow-md shadow-red-100"
                      : "hover:bg-slate-50 text-slate-700"
                  }`}
                >
                  <div className={`w-10 h-10 rounded-lg shrink-0 overflow-hidden flex items-center justify-center ${
                    isActive ? "bg-white/20" : catMeta.color
                  }`}>
                    {shop.logoUrl
                      ? <img src={shop.logoUrl} alt={shop.name} className="w-full h-full object-cover" />
                      : <CatIcon size={18} className={isActive ? "text-white" : ""} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-semibold truncate ${isActive ? "text-white" : "text-slate-800"}`}>
                      {shop.name}
                    </p>
                    <p className={`text-[11px] truncate ${isActive ? "text-white/70" : "text-slate-400"}`}>
                      {shop.ownerName ? `${shop.ownerName} · ` : ""}{catMeta.label}
                    </p>
                    {shop.phone && (
                      <p className={`text-[10px] ${isActive ? "text-white/60" : "text-slate-400"}`}>
                        +91 {shop.phone}
                      </p>
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

// ─── Active Store Banner ───────────────────────────────────────────────────────

function ActiveStoreBanner({ shop, onSwitch, onEdit, isSuperAdmin }: {
  shop: Shop;
  onSwitch: () => void;
  onEdit: () => void;
  isSuperAdmin?: boolean;
}) {
  const catMeta = CATEGORY_META[shop.category];
  const CatIcon = catMeta.icon;

  return (
    <div className="mx-3 mb-3 rounded-xl border border-red-100 bg-red-50 p-3">
      <p className="text-[10px] font-semibold uppercase tracking-widest text-red-400 mb-2">Active Store</p>
      <div className="flex items-center gap-2.5">
        <div className="w-10 h-10 rounded-lg bg-white border border-red-100 flex items-center justify-center overflow-hidden shrink-0">
          {shop.logoUrl
            ? <img src={shop.logoUrl} alt={shop.name} className="w-full h-full object-cover" />
            : <CatIcon size={17} className="text-red-500" />}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-slate-800 truncate">{shop.name}</p>
          {shop.ownerName && (
            <p className="text-[11px] text-slate-500 truncate">{shop.ownerName}</p>
          )}
          <span className={`inline-flex items-center gap-1 text-[10px] font-semibold border px-1.5 py-0.5 rounded-full ${catMeta.color}`}>
            <CatIcon size={8} /> {catMeta.label}
          </span>
          {shop.phone && (
            <p className="text-[10px] text-slate-400 truncate mt-0.5">📞 +91 {shop.phone}</p>
          )}
          {shop.upiId && (
            <p className="text-[10px] text-slate-400 truncate">💳 {shop.upiId}</p>
          )}
        </div>
        {isSuperAdmin && (
        <div className="flex flex-col gap-1 shrink-0">
          <button
            onClick={onEdit}
            className="flex items-center gap-1 text-[11px] font-semibold text-amber-600 hover:text-amber-800 bg-white hover:bg-amber-50 border border-amber-200 px-2 py-1 rounded-lg transition-colors"
          >
            <Pencil size={10} /> Edit
          </button>
          <button
            onClick={onSwitch}
            className="flex items-center gap-1 text-[11px] font-semibold text-red-600 hover:text-red-800 bg-white hover:bg-red-50 border border-red-200 px-2 py-1 rounded-lg transition-colors"
          >
            <ArrowLeftRight size={10} /> Switch
          </button>
        </div>
        )}
      </div>
    </div>
  );
}

// ─── Main Sidebar ──────────────────────────────────────────────────────────────

export default function Sidebar() {
  const pathname = usePathname();
  const router   = useRouter();

  const [shops, setShops]                     = useState<Shop[]>([]);
  const [activeShopId, setActiveShopId]       = useState<string | null>(null);
  const [showCreateStore, setShowCreateStore] = useState(false);
  const [showSwitcher, setShowSwitcher]       = useState(false);
  const [editShop, setEditShop]               = useState<Shop | null>(null);
  const [user, setUser]                       = useState<StoredUser | null>(null);

  useEffect(() => {
    // Load user only on client side to avoid hydration mismatch
    try {
      const u = localStorage.getItem("user");
      if (u) {
        const parsed = JSON.parse(u);
        setUser(parsed);
        
        // Staff redirection logic
        if (parsed.role === "STAFF" && window.location.pathname !== "/attendance") {
          window.location.href = "/attendance";
        }
      }
    } catch (err) {
      console.error("Failed to parse user from localStorage", err);
    }
  }, []);

  // Map backend store to frontend Shop type
  const mapStore = (s: BackendStore): Shop => ({
    id: s.id.toString(),
    name: s.name,
    ownerName: s.owner_name || "",
    address: s.address || "",
    phone: s.phone || "",
    email: s.email || "",
    upiId: s.upi_id || "",
    logoUrl: s.logo_url || null,
    category: s.category || "GROCERY",
    admins: s.users?.map((u) => ({
      id: u.id.toString(),
      name: u.name,
      email: u.email,
      phone: u.phone || ""
    })) || [],
  });

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        // Fetch profile first to get last_active_store_id
        const profileRes = await api.get('/users/profile');
        const dbLastActiveId = profileRes.data.last_active_store_id?.toString();

        const response = await api.get('/stores');
        const mappedStores = (response.data as BackendStore[]).map(mapStore);
        setShops(mappedStores);
        
        const savedId = localStorage.getItem('activeStoreId') || dbLastActiveId;
        
        if (savedId && mappedStores.some((s: Shop) => s.id === savedId)) {
          setActiveShopId(savedId);
          localStorage.setItem('activeStoreId', savedId);
        } else if (mappedStores.length > 0) {
          const firstId = mappedStores[0].id;
          setActiveShopId(firstId);
          localStorage.setItem('activeStoreId', firstId);
          // Sync default store to DB if not already there
          await api.patch('/users/active-store', { storeId: Number(firstId) });
        }
      } catch (err) {
        console.error('Failed to fetch stores or profile:', err);
      }
    };
    fetchInitialData();
  }, []);

  const activeShop = shops.find((s) => s.id === activeShopId) ?? null;

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("activeStoreId");
    router.push("/");
  }

  async function switchStore(id: string) {
    try {
      setActiveShopId(id);
      localStorage.setItem('activeStoreId', id);
      // Persist to database
      await api.patch('/users/active-store', { storeId: Number(id) });
      // Optional: Refresh page or trigger a global state update to reload data for new store
      window.location.reload(); 
    } catch (err) {
      console.error('Failed to sync active store to DB:', err);
      // Still reload to update UI state from localStorage
      window.location.reload();
    }
  }

  async function handleCreateStore(shopData: Shop) {
    try {
      const response = await api.post('/stores', {
        name: shopData.name,
        owner_name: shopData.ownerName,
        email: shopData.email,
        phone: shopData.phone,
        address: shopData.address,
        category: shopData.category,
        logo_url: shopData.logoUrl,
        upi_id: shopData.upiId,
        admins: shopData.admins,
      });
      
      const newStore = mapStore(response.data);
      setShops((prev) => [...prev, newStore]);
      if (shops.length === 0) {
        switchStore(newStore.id);
      }
      setShowCreateStore(false);
    } catch (err: unknown) {
      alert(getErrorMessage(err, "Failed to create store"));
    }
  }

  async function handleUpdateStore(updated: Shop) {
    try {
      const response = await api.put(`/stores/${updated.id}`, {
        name: updated.name,
        owner_name: updated.ownerName,
        email: updated.email,
        phone: updated.phone,
        address: updated.address,
        category: updated.category,
        logo_url: updated.logoUrl,
        upi_id: updated.upiId,
        admins: updated.admins,
      });
      
      const updatedStore = mapStore(response.data);
      setShops((prev) => prev.map((s) => s.id === updatedStore.id ? updatedStore : s));
      setEditShop(null);
    } catch (err: unknown) {
      alert(getErrorMessage(err, "Failed to update store"));
    }
  }

  const isSuperAdmin = !user || user.role === "SUPER_ADMIN";
  const isAdmin = user?.role === "ADMIN";
  const isStaff = user?.role === "STAFF";

  // Filter navigation items based on role
  const visibleNavItems = navItems.filter((item) => {
    if (isStaff) {
      return ["Attendance"].includes(item.label);
    }
    if (isAdmin) {
      // Admin restricted items
      if (["Dashboard", "Reports", "Settings", "Attendance"].includes(item.label)) return false;
      return true;
    }
    // Superadmin (only hide Attendance as they manage it in Staff)
    if (item.label === "Attendance") return false;
    return true;
  });

  return (
    <>
      <aside className="flex h-screen w-64 flex-col border-r border-slate-200 bg-white overflow-y-auto">

        {/* Brand */}
        <div className="flex items-center gap-3 px-5 py-5 border-b border-slate-100 shrink-0">
          <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-red-600 shrink-0">
            <Package className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-900 leading-tight">Stock</p>
            <p className="text-xs text-red-600 font-semibold leading-tight">Management</p>
          </div>
        </div>

        {/* Active Store Banner */}
        {activeShop && !isStaff && (
          <div className="pt-3">
            <ActiveStoreBanner
              shop={activeShop}
              onSwitch={() => setShowSwitcher(true)}
              onEdit={() => setEditShop(activeShop)}
              isSuperAdmin={isSuperAdmin}
            />
          </div>
        )}

        {/* Navigation */}
        <nav className="px-3 py-4 space-y-0.5 shrink-0">
          <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-widest text-slate-400">Main Menu</p>
          {visibleNavItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all group ${
                  isActive
                    ? "bg-red-600 text-white shadow-sm shadow-red-200"
                    : "text-slate-600 hover:bg-red-50 hover:text-red-700"
                }`}
              >
                <Icon
                  size={18}
                  className={`shrink-0 transition-colors ${
                    isActive ? "text-white" : "text-slate-400 group-hover:text-red-600"
                  }`}
                />
                <span className="flex-1">{item.label}</span>
                {item.badge != null && (
                  <span className={`text-xs font-semibold px-1.5 py-0.5 rounded-full ${
                    isActive ? "bg-white/20 text-white" : "bg-red-100 text-red-600"
                  }`}>
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Stores Section (Super Admin Only) */}
        {isSuperAdmin && (
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
                    className="flex items-center gap-1 text-[11px] font-semibold text-slate-500 hover:text-red-600 bg-slate-50 hover:bg-red-50 px-2 py-0.5 rounded-full transition-colors"
                  >
                    <ArrowLeftRight size={10} /> Switch
                  </button>
                )}
                {isSuperAdmin && (
                  <button
                    onClick={() => setShowCreateStore(true)}
                    className="flex items-center gap-1 text-[11px] font-semibold text-red-600 hover:text-red-800 bg-red-50 hover:bg-red-100 px-2 py-0.5 rounded-full transition-colors"
                  >
                    <Plus size={11} /> New
                  </button>
                )}
              </div>
            </div>

            {shops.length === 0 ? (
              <p className="text-[11px] text-slate-400 px-2 py-1">
                No stores yet.{" "}
                {isSuperAdmin && (
                  <button
                    onClick={() => setShowCreateStore(true)}
                    className="text-red-500 hover:underline font-semibold"
                  >
                    Create one
                  </button>
                )}
              </p>
            ) : (
              <div className="space-y-1">
                {shops.map((shop) => {
                  const isActive = shop.id === activeShopId;
                  const catMeta  = CATEGORY_META[shop.category];
                  const CatIcon  = catMeta.icon;
                  return (
                    <div key={shop.id} className="flex items-center gap-1">
                      <button
                        onClick={() => switchStore(shop.id)}
                        className={`flex-1 flex items-center gap-2.5 px-3 py-2 rounded-lg text-left transition-all ${
                          isActive
                            ? "bg-red-600 text-white shadow-sm"
                            : "hover:bg-slate-50 text-slate-700"
                        }`}
                      >
                        <div className={`w-7 h-7 rounded-md shrink-0 overflow-hidden flex items-center justify-center ${
                          isActive ? "bg-white/20" : catMeta.color
                        }`}>
                          {shop.logoUrl
                            ? <img src={shop.logoUrl} alt={shop.name} className="w-full h-full object-cover" />
                            : <CatIcon size={13} className={isActive ? "text-white" : ""} />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-xs font-semibold truncate ${isActive ? "text-white" : "text-slate-800"}`}>
                            {shop.name}
                          </p>
                          <p className={`text-[10px] truncate ${isActive ? "text-white/70" : "text-slate-400"}`}>
                            {shop.ownerName || catMeta.label}{shop.phone ? ` · ${shop.phone}` : ""}
                          </p>
                        </div>
                        {isActive && <Check size={13} className="text-white shrink-0" />}
                      </button>
                      {/* Edit button per row */}
                      <button
                        onClick={() => setEditShop(shop)}
                        className={`p-1.5 rounded-lg transition-colors ${
                          isActive
                            ? "text-white/70 hover:text-white hover:bg-white/10"
                            : "text-slate-400 hover:text-amber-600 hover:bg-amber-50"
                        }`}
                        title="Edit store"
                      >
                        <Pencil size={12} />
                      </button>
                      
                      {isSuperAdmin && (
                        <button
                          onClick={async () => {
                            if (window.confirm(`Are you sure you want to delete "${shop.name}"? This will delete ALL data (products, staff, bills) for this store and CANNOT be undone.`)) {
                              try {
                                await api.delete(`/stores/${shop.id}`);
                                window.location.reload();
                              } catch (err) {
                                alert("Failed to delete store: " + getErrorMessage(err, "Unknown error"));
                              }
                            }
                          }}
                          className={`p-1.5 rounded-lg transition-colors ${
                            isActive
                              ? "text-white/70 hover:text-white hover:bg-white/10"
                              : "text-slate-400 hover:text-red-600 hover:bg-red-50"
                          }`}
                          title="Delete store"
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                          </svg>
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

          </div>
        </div>
        )}

        {/* User Footer */}
        <div className="border-t border-slate-100 p-4 shrink-0">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center text-red-700 text-xs font-bold shrink-0">
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
          onSwitch={switchStore}
          onClose={() => setShowSwitcher(false)}
        />
      )}
      {editShop && (
        <EditStoreModal
          shop={editShop}
          onClose={() => setEditShop(null)}
          onUpdate={handleUpdateStore}
          onAdminAdded={(shopId, admin) => {
            setShops((prev) => prev.map((shop) => (
              shop.id === shopId
                ? { ...shop, admins: [...shop.admins, admin] }
                : shop
            )));
          }}
        />
      )}
    </>
  );
}
