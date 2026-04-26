"use client";

import { useState, useMemo, useRef } from "react";
import {
  Search, Plus, Minus, Trash2, Printer, CheckCircle,
  X, ShoppingCart, User, Phone, IndianRupee, Receipt,
  Tag, Package, ChevronDown, ScanLine, RotateCcw,
} from "lucide-react";

// ═══════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════

type Product = {
  id:           string;
  name:         string;
  category:     string;
  brand:        string;
  sellingPrice: number;
  gstPercent:   number;
  stock:        number;
  barcode:      string;
};

type CartItem = Product & {
  qty:      number;
  discount: number; // per-item flat discount in ₹
};

type PaymentMethod = "cash" | "upi" | "card";

// ═══════════════════════════════════════════════════════════
// MOCK PRODUCTS
// ═══════════════════════════════════════════════════════════

const PRODUCTS: Product[] = [
  { id:"PRD-001", name:"Wireless Keyboard Pro",  category:"Electronics", brand:"Logitech",     sellingPrice:1299, gstPercent:18, stock:45, barcode:"8901030814918" },
  { id:"PRD-002", name:"USB-C Hub 7-in-1",       category:"Electronics", brand:"Anker",        sellingPrice:999,  gstPercent:18, stock:8,  barcode:"0194252657188" },
  { id:"PRD-003", name:"Monitor Stand Adj.",      category:"Furniture",   brand:"AmazonBasics", sellingPrice:2499, gstPercent:12, stock:22, barcode:"8906096490200" },
  { id:"PRD-004", name:"Mechanical Mouse",        category:"Electronics", brand:"Razer",        sellingPrice:849,  gstPercent:18, stock:15, barcode:"0811069013124" },
  { id:"PRD-005", name:"Laptop Sleeve 15\"",      category:"Accessories", brand:"Herschel",     sellingPrice:599,  gstPercent:12, stock:60, barcode:"0840386100179" },
  { id:"PRD-006", name:"HDMI Cable 2m",           category:"Accessories", brand:"iBall",        sellingPrice:299,  gstPercent:18, stock:5,  barcode:"8906037560155" },
  { id:"PRD-007", name:"Webcam 1080p",            category:"Electronics", brand:"Logitech",     sellingPrice:3299, gstPercent:18, stock:18, barcode:"5099206062573" },
  { id:"PRD-008", name:"Desk Organizer Set",      category:"Furniture",   brand:"",             sellingPrice:749,  gstPercent:12, stock:30, barcode:"7350062381345" },
  { id:"PRD-009", name:"Mouse Pad XL",            category:"Accessories", brand:"Logitech",     sellingPrice:399,  gstPercent:18, stock:3,  barcode:"7350062381346" },
  { id:"PRD-010", name:"Laptop Stand Portable",   category:"Furniture",   brand:"Nexstand",     sellingPrice:1799, gstPercent:12, stock:12, barcode:"7350062381347" },
];

const PAYMENT_METHODS: { key: PaymentMethod; label: string; icon: string }[] = [
  { key: "cash", label: "Cash",     icon: "💵" },
  { key: "upi",  label: "UPI",      icon: "📱" },
  { key: "card", label: "Card",     icon: "💳" },
];

let invoiceCounter = 1001;

const inputCls =
  "h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 transition-colors";

function fmt(n: number) {
  return "₹" + n.toLocaleString("en-IN");
}

// ═══════════════════════════════════════════════════════════
// PRINT INVOICE HELPER
// ═══════════════════════════════════════════════════════════

function printInvoice(
  cart: CartItem[],
  customer: { name: string; phone: string },
  payment: PaymentMethod,
  invoiceNo: string,
  totals: {
    subtotal: number; totalDiscount: number;
    taxableAmount: number; totalGST: number;
    grandTotal: number; cashReceived: number;
  }
) {
  const rows = cart.map((item) => {
    const base     = item.sellingPrice * item.qty;
    const disc     = item.discount * item.qty;
    const taxable  = base - disc;
    const gst      = Math.round(taxable * item.gstPercent / 100);
    const total    = taxable + gst;
    return `
      <tr>
        <td>${item.name}</td>
        <td style="text-align:center">${item.qty}</td>
        <td style="text-align:right">₹${item.sellingPrice.toLocaleString("en-IN")}</td>
        <td style="text-align:center">${item.gstPercent}%</td>
        <td style="text-align:right">${item.discount > 0 ? "₹" + (item.discount * item.qty).toLocaleString("en-IN") : "—"}</td>
        <td style="text-align:right">₹${total.toLocaleString("en-IN")}</td>
      </tr>`;
  }).join("");

  const html = `
    <html><head><title>Invoice ${invoiceNo}</title>
    <style>
      * { box-sizing: border-box; margin: 0; padding: 0; font-family: system-ui, sans-serif; }
      body { padding: 32px; font-size: 13px; color: #1e293b; }
      .header { display: flex; justify-content: space-between; margin-bottom: 24px; }
      .shop { font-size: 20px; font-weight: 700; color: #1e40af; }
      .inv  { text-align: right; }
      .inv p { font-size: 12px; color: #64748b; }
      .inv strong { font-size: 15px; color: #1e293b; }
      .divider { border: none; border-top: 1px solid #e2e8f0; margin: 12px 0; }
      .customer { display: flex; gap: 32px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px 16px; margin-bottom: 16px; }
      .customer p { font-size: 12px; color: #64748b; }
      .customer strong { font-size: 13px; color: #1e293b; }
      table { width: 100%; border-collapse: collapse; margin-bottom: 16px; }
      th { background: #f1f5f9; padding: 8px 12px; text-align: left; font-size: 11px; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; }
      td { padding: 8px 12px; border-bottom: 1px solid #f1f5f9; font-size: 12px; }
      .totals { margin-left: auto; width: 280px; }
      .totals tr td { padding: 4px 0; font-size: 13px; }
      .totals tr td:last-child { text-align: right; font-weight: 600; }
      .grand td { font-size: 15px; font-weight: 700; color: #1e40af; border-top: 2px solid #e2e8f0; padding-top: 8px; }
      .footer { text-align: center; margin-top: 24px; font-size: 11px; color: #94a3b8; }
      @media print { body { padding: 16px; } }
    </style>
    </head><body>
    <div class="header">
      <div>
        <div class="shop">🏪 ShopAdmin</div>
        <p style="font-size:12px;color:#64748b;margin-top:4px">GST No: 27AABCS1429B1Z1</p>
        <p style="font-size:12px;color:#64748b">Phone: +91 98765 43210</p>
      </div>
      <div class="inv">
        <strong>Invoice #${invoiceNo}</strong>
        <p>Date: ${new Date().toLocaleDateString("en-IN")}</p>
        <p>Time: ${new Date().toLocaleTimeString("en-IN")}</p>
        <p>Payment: ${payment.toUpperCase()}</p>
      </div>
    </div>
    <hr class="divider"/>
    <div class="customer">
      <div><p>Customer Name</p><strong>${customer.name || "Walk-in Customer"}</strong></div>
      <div><p>Phone</p><strong>${customer.phone || "—"}</strong></div>
    </div>
    <table>
      <thead><tr><th>Product</th><th style="text-align:center">Qty</th><th style="text-align:right">Rate</th><th style="text-align:center">GST</th><th style="text-align:right">Discount</th><th style="text-align:right">Amount</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>
    <table class="totals">
      <tr><td>Subtotal</td><td>₹${totals.subtotal.toLocaleString("en-IN")}</td></tr>
      ${totals.totalDiscount > 0 ? `<tr><td style="color:#16a34a">Discount</td><td style="color:#16a34a">−₹${totals.totalDiscount.toLocaleString("en-IN")}</td></tr>` : ""}
      <tr><td>Taxable Amount</td><td>₹${totals.taxableAmount.toLocaleString("en-IN")}</td></tr>
      <tr><td>GST</td><td>₹${totals.totalGST.toLocaleString("en-IN")}</td></tr>
      ${payment === "cash" ? `<tr><td>Cash Received</td><td>₹${totals.cashReceived.toLocaleString("en-IN")}</td></tr><tr><td>Change</td><td>₹${(totals.cashReceived - totals.grandTotal).toLocaleString("en-IN")}</td></tr>` : ""}
      <tr class="grand"><td>Grand Total</td><td>₹${totals.grandTotal.toLocaleString("en-IN")}</td></tr>
    </table>
    <div class="footer"><p>Thank you for your purchase! 🙏</p><p style="margin-top:4px">Powered by ShopAdmin</p></div>
    </body></html>`;

  const w = window.open("", "_blank", "width=700,height=900");
  if (!w) return;
  w.document.write(html);
  w.document.close();
  w.focus();
  setTimeout(() => { w.print(); w.close(); }, 500);
}

// ═══════════════════════════════════════════════════════════
// MAIN PAGE
// ═══════════════════════════════════════════════════════════

export default function BillingPage() {
  // Product search
  const [search,     setSearch]     = useState("");
  const [showSearch, setShowSearch] = useState(false);

  // Cart
  const [cart, setCart] = useState<CartItem[]>([]);

  // Customer
  const [custName,  setCustName]  = useState("");
  const [custPhone, setCustPhone] = useState("");

  // Payment
  const [payMethod,    setPayMethod]    = useState<PaymentMethod>("cash");
  const [cashReceived, setCashReceived] = useState(0);
  const [billDiscount, setBillDiscount] = useState(0); // overall bill discount %

  // State
  const [success, setSuccess] = useState(false);
  const [lastInvoice, setLastInvoice] = useState("");

  // ── Search results ──
  const searchResults = useMemo(() => {
    if (!search.trim()) return [];
    const q = search.toLowerCase();
    return PRODUCTS.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.barcode.includes(q) ||
        p.id.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q)
    ).slice(0, 6);
  }, [search]);

  // ── Cart actions ──
  function addToCart(product: Product) {
    setCart((prev) => {
      const exists = prev.find((c) => c.id === product.id);
      if (exists) {
        return prev.map((c) =>
          c.id === product.id && c.qty < c.stock
            ? { ...c, qty: c.qty + 1 }
            : c
        );
      }
      return [...prev, { ...product, qty: 1, discount: 0 }];
    });
    setSearch("");
    setShowSearch(false);
  }

  function updateQty(id: string, delta: number) {
    setCart((prev) =>
      prev
        .map((c) => c.id === id ? { ...c, qty: Math.max(0, Math.min(c.stock, c.qty + delta)) } : c)
        .filter((c) => c.qty > 0)
    );
  }

  function setDiscount(id: string, val: number) {
    setCart((prev) =>
      prev.map((c) => c.id === id ? { ...c, discount: Math.max(0, val) } : c)
    );
  }

  function removeFromCart(id: string) {
    setCart((prev) => prev.filter((c) => c.id !== id));
  }

  function clearCart() {
    setCart([]);
    setCustName("");
    setCustPhone("");
    setCashReceived(0);
    setBillDiscount(0);
    setPayMethod("cash");
    setSuccess(false);
  }

  // ── Totals ──
  const totals = useMemo(() => {
    const subtotal = cart.reduce((t, c) => t + c.sellingPrice * c.qty, 0);
    const itemDiscount = cart.reduce((t, c) => t + c.discount * c.qty, 0);
    const afterItemDisc = subtotal - itemDiscount;
    const billDisc = Math.round(afterItemDisc * billDiscount / 100);
    const totalDiscount = itemDiscount + billDisc;
    const taxableAmount = subtotal - totalDiscount;
    const totalGST = cart.reduce((t, c) => {
      const base = (c.sellingPrice - c.discount) * c.qty;
      return t + Math.round(base * c.gstPercent / 100);
    }, 0);
    const grandTotal = taxableAmount + totalGST;
    const change = payMethod === "cash" ? Math.max(0, cashReceived - grandTotal) : 0;
    return { subtotal, itemDiscount, billDisc, totalDiscount, taxableAmount, totalGST, grandTotal, change };
  }, [cart, billDiscount, cashReceived, payMethod]);

  // ── Checkout ──
  function handleCheckout() {
    if (cart.length === 0) return;
    const invNo = `INV-${invoiceCounter++}`;
    setLastInvoice(invNo);
    printInvoice(cart, { name: custName, phone: custPhone }, payMethod, invNo, {
      ...totals,
      cashReceived,
    });
    setSuccess(true);
  }

  // ── Success screen ──
  if (success) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
        <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
          <CheckCircle className="w-10 h-10 text-green-600" />
        </div>
        <div className="text-center">
          <h2 className="text-xl font-bold text-slate-900">Bill Generated!</h2>
          <p className="text-slate-500 mt-1 text-sm">Invoice <span className="font-mono font-semibold text-blue-600">{lastInvoice}</span> printed successfully.</p>
          <p className="text-2xl font-bold text-slate-900 mt-3">{fmt(totals.grandTotal)}</p>
          {payMethod === "cash" && totals.change > 0 && (
            <p className="text-sm text-green-600 font-semibold mt-1">Change to return: {fmt(totals.change)}</p>
          )}
        </div>
        <div className="flex gap-3">
          <button onClick={clearCart}
            className="flex items-center gap-2 h-10 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-colors shadow-sm">
            <RotateCcw size={16} /> New Bill
          </button>
          <button
            onClick={() => printInvoice(cart, { name: custName, phone: custPhone }, payMethod, lastInvoice, { ...totals, cashReceived })}
            className="flex items-center gap-2 h-10 px-6 rounded-xl border border-slate-200 bg-white text-slate-700 text-sm font-semibold hover:bg-slate-50 transition-colors">
            <Printer size={16} /> Reprint
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-5 h-[calc(100vh-8rem)]">

      {/* ════════ LEFT — Product Search + Cart ════════ */}
      <div className="flex-1 flex flex-col gap-4 min-w-0 overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-900">Billing</h1>
            <p className="text-sm text-slate-500 mt-0.5">Create new invoice / POS bill</p>
          </div>
          {cart.length > 0 && (
            <button onClick={clearCart}
              className="flex items-center gap-1.5 h-8 px-3 rounded-lg border border-red-200 bg-red-50 text-red-600 text-xs font-semibold hover:bg-red-100 transition-colors">
              <RotateCcw size={13} /> Clear Bill
            </button>
          )}
        </div>

        {/* Product Search */}
        <div className="relative">
          <div className="flex items-center gap-2 h-11 bg-white border border-slate-200 rounded-xl px-4 focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-500/20 transition-all">
            <Search className="w-4 h-4 text-slate-400 shrink-0" />
            <input
              type="text"
              placeholder="Search product by name, barcode, brand or ID…"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setShowSearch(true); }}
              onFocus={() => setShowSearch(true)}
              className="flex-1 text-sm text-slate-700 outline-none placeholder:text-slate-400 bg-transparent"
            />
            {search && (
              <button onClick={() => { setSearch(""); setShowSearch(false); }}>
                <X size={14} className="text-slate-400 hover:text-slate-600" />
              </button>
            )}
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 text-xs font-semibold hover:bg-blue-100 transition-colors">
              <ScanLine size={14} /> Scan
            </button>
          </div>

          {/* Dropdown */}
          {showSearch && searchResults.length > 0 && (
            <div className="absolute top-full left-0 right-0 z-30 mt-1.5 bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden">
              {searchResults.map((p) => (
                <button key={p.id}
                  onClick={() => addToCart(p)}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-blue-50 transition-colors text-left border-b border-slate-50 last:border-0">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                    <Package size={14} className="text-slate-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-800 truncate">{p.name}</p>
                    <p className="text-xs text-slate-400">{p.brand} · {p.category} · Stock: {p.stock}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-bold text-blue-700">{fmt(p.sellingPrice)}</p>
                    <p className="text-xs text-slate-400">+{p.gstPercent}% GST</p>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Click outside to close */}
          {showSearch && (
            <div className="fixed inset-0 z-20" onClick={() => setShowSearch(false)} />
          )}
        </div>

        {/* Cart */}
        <div className="flex-1 bg-white rounded-xl border border-slate-200 overflow-hidden flex flex-col">

          {/* Cart Header */}
          <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100 bg-slate-50 shrink-0">
            <div className="flex items-center gap-2">
              <ShoppingCart size={15} className="text-slate-500" />
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                Cart — {cart.length} item{cart.length !== 1 ? "s" : ""}
              </p>
            </div>
            {cart.length > 0 && (
              <p className="text-xs text-slate-400">{cart.reduce((t, c) => t + c.qty, 0)} units total</p>
            )}
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto">
            {cart.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full gap-3 text-center py-16">
                <ShoppingCart size={36} className="text-slate-200" />
                <p className="text-sm font-semibold text-slate-400">Cart is empty</p>
                <p className="text-xs text-slate-300">Search and add products above</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-50">
                {/* Column Headers */}
                <div className="grid grid-cols-[1fr_100px_80px_120px_100px] gap-2 px-5 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wide bg-slate-50/50">
                  <span>Product</span>
                  <span className="text-center">Qty</span>
                  <span className="text-right">Rate</span>
                  <span className="text-center">Discount/unit</span>
                  <span className="text-right">Amount</span>
                </div>

                {cart.map((item) => {
                  const lineBase    = item.sellingPrice * item.qty;
                  const lineDisc    = item.discount * item.qty;
                  const lineTaxable = lineBase - lineDisc;
                  const lineGST     = Math.round(lineTaxable * item.gstPercent / 100);
                  const lineTotal   = lineTaxable + lineGST;

                  return (
                    <div key={item.id}
                      className="grid grid-cols-[1fr_100px_80px_120px_100px] gap-2 items-center px-5 py-3.5 hover:bg-slate-50 transition-colors">

                      {/* Product Info */}
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-800 truncate">{item.name}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs text-slate-400">{item.id}</span>
                          <span className="px-1.5 py-px rounded text-xs bg-slate-100 text-slate-500">{item.gstPercent}% GST</span>
                          {item.stock <= 5 && (
                            <span className="px-1.5 py-px rounded text-xs bg-amber-50 text-amber-600 font-semibold">Low stock</span>
                          )}
                        </div>
                      </div>

                      {/* Qty */}
                      <div className="flex items-center justify-center gap-1">
                        <button onClick={() => updateQty(item.id, -1)}
                          className="w-6 h-6 rounded-md border border-slate-200 flex items-center justify-center hover:bg-slate-100 transition-colors text-slate-500">
                          <Minus size={12} />
                        </button>
                        <span className="w-7 text-center text-sm font-bold text-slate-900 tabular-nums">{item.qty}</span>
                        <button onClick={() => updateQty(item.id, 1)}
                          disabled={item.qty >= item.stock}
                          className="w-6 h-6 rounded-md border border-slate-200 flex items-center justify-center hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-slate-500">
                          <Plus size={12} />
                        </button>
                      </div>

                      {/* Rate */}
                      <p className="text-sm text-right text-slate-700 font-medium tabular-nums">{fmt(item.sellingPrice)}</p>

                      {/* Discount per unit */}
                      <div className="flex items-center justify-center">
                        <div className="relative">
                          <IndianRupee className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400" />
                          <input
                            type="number" min={0} max={item.sellingPrice}
                            value={item.discount || ""}
                            placeholder="0"
                            onChange={(e) => setDiscount(item.id, Number(e.target.value))}
                            className="h-7 w-20 rounded-lg border border-slate-200 pl-5 pr-2 text-xs text-green-700 font-semibold outline-none focus:border-green-400 focus:ring-2 focus:ring-green-500/20 transition-colors bg-green-50 text-center tabular-nums"
                          />
                        </div>
                      </div>

                      {/* Line Total */}
                      <div className="text-right">
                        <p className="text-sm font-bold text-slate-900 tabular-nums">{fmt(lineTotal)}</p>
                        {lineGST > 0 && (
                          <p className="text-xs text-slate-400 tabular-nums">incl. {fmt(lineGST)} GST</p>
                        )}
                        <button onClick={() => removeFromCart(item.id)}
                          className="mt-1 text-red-400 hover:text-red-600 transition-colors">
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ════════ RIGHT — Summary + Checkout ════════ */}
      <div className="w-80 shrink-0 flex flex-col gap-4 overflow-y-auto">

        {/* Customer Info */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Customer</p>
          <div className="relative">
            <User className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input type="text" placeholder="Customer name (optional)"
              value={custName} onChange={(e) => setCustName(e.target.value)}
              className={inputCls + " pl-8"} />
          </div>
          <div className="relative">
            <Phone className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input type="text" placeholder="Phone number (optional)"
              value={custPhone} onChange={(e) => setCustPhone(e.target.value)}
              className={inputCls + " pl-8"} />
          </div>
        </div>

        {/* Payment Method */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Payment Method</p>
          <div className="grid grid-cols-3 gap-2">
            {PAYMENT_METHODS.map((m) => (
              <button key={m.key}
                onClick={() => setPayMethod(m.key)}
                className={`flex flex-col items-center gap-1 py-2.5 rounded-xl border text-xs font-semibold transition-all ${
                  payMethod === m.key
                    ? "bg-blue-600 border-blue-600 text-white shadow-sm shadow-blue-200"
                    : "border-slate-200 text-slate-600 hover:border-blue-200 hover:bg-blue-50"
                }`}>
                <span className="text-lg">{m.icon}</span>
                {m.label}
              </button>
            ))}
          </div>

          {/* Cash received */}
          {payMethod === "cash" && (
            <div className="space-y-2">
              <div className="relative">
                <IndianRupee className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                <input type="number" min={0} placeholder="Cash received"
                  value={cashReceived || ""}
                  onChange={(e) => setCashReceived(Number(e.target.value))}
                  className={inputCls + " pl-8"} />
              </div>
              {cashReceived > 0 && cashReceived >= totals.grandTotal && (
                <div className="flex items-center justify-between bg-green-50 border border-green-100 rounded-lg px-3 py-2">
                  <p className="text-xs text-green-700 font-semibold">Change to return</p>
                  <p className="text-sm font-bold text-green-700">{fmt(totals.change)}</p>
                </div>
              )}
              {cashReceived > 0 && cashReceived < totals.grandTotal && (
                <div className="flex items-center justify-between bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                  <p className="text-xs text-red-600 font-semibold">Short by</p>
                  <p className="text-sm font-bold text-red-600">{fmt(totals.grandTotal - cashReceived)}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Discount on Bill */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Bill Discount</p>
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Tag className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <input type="number" min={0} max={100} placeholder="0"
                value={billDiscount || ""}
                onChange={(e) => setBillDiscount(Math.min(100, Number(e.target.value)))}
                className={inputCls + " pl-8"} />
            </div>
            <span className="text-sm font-bold text-slate-500">%</span>
          </div>
          {totals.billDisc > 0 && (
            <p className="text-xs text-green-600 font-semibold">Saving: {fmt(totals.billDisc)}</p>
          )}
        </div>

        {/* Bill Summary */}
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Bill Summary</p>
          <div className="space-y-2.5">
            {[
              { label:"Subtotal",          value: fmt(totals.subtotal),      cls:"text-slate-700"  },
              ...(totals.itemDiscount > 0 ? [{ label:"Item Discounts", value:`−${fmt(totals.itemDiscount)}`, cls:"text-green-600" }] : []),
              ...(totals.billDisc > 0     ? [{ label:`Bill Discount (${billDiscount}%)`, value:`−${fmt(totals.billDisc)}`, cls:"text-green-600" }] : []),
              { label:"Taxable Amount",    value: fmt(totals.taxableAmount), cls:"text-slate-700"  },
              { label:"Total GST",         value: fmt(totals.totalGST),      cls:"text-amber-600"  },
            ].map((row) => (
              <div key={row.label} className="flex items-center justify-between">
                <p className="text-xs text-slate-500">{row.label}</p>
                <p className={`text-xs font-semibold tabular-nums ${row.cls}`}>{row.value}</p>
              </div>
            ))}

            <div className="border-t border-slate-200 pt-2.5 mt-1 flex items-center justify-between">
              <p className="text-sm font-bold text-slate-900">Grand Total</p>
              <p className="text-xl font-bold text-blue-700 tabular-nums">{fmt(totals.grandTotal)}</p>
            </div>
          </div>
        </div>

        {/* Checkout Button */}
        <button
          onClick={handleCheckout}
          disabled={cart.length === 0 || (payMethod === "cash" && cashReceived > 0 && cashReceived < totals.grandTotal)}
          className="w-full h-12 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-sm flex items-center justify-center gap-2 transition-colors shadow-sm shadow-blue-200"
        >
          <Receipt size={18} />
          Generate Bill &amp; Print
        </button>

        <p className="text-xs text-center text-slate-400 -mt-1">Bill will open in a print dialog</p>
      </div>
    </div>
  );
}