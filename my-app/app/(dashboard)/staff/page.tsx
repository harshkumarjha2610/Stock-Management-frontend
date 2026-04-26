"use client";

import { useState, useMemo } from "react";
import {
  Search, Plus, Eye, Pencil, Trash2, X, ChevronDown,
  UserCheck, Clock, BadgeIndianRupee, Phone, CalendarDays,
  CheckCircle, XCircle, LogIn, LogOut, FileText,
  TrendingUp, Users, AlertCircle, Download,
} from "lucide-react";

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════

type StaffStatus   = "Active" | "Inactive";
type SalaryStatus  = "Paid"   | "Unpaid";
type MainTab       = "staff"  | "attendance" | "salary";
type PayMethod     = "Bank Transfer" | "Cash" | "UPI";

type Staff = {
  id:          string;
  name:        string;
  phone:       string;
  address:     string;
  joiningDate: string;
  salary:      number;
  status:      StaffStatus;
};

type Attendance = {
  id:           string;
  staffId:      string;
  staffName:    string;
  date:         string;
  checkIn:      string;
  checkOut:     string;
  workingHours: number;
  present:      boolean;
};

type SalaryRecord = {
  id:            string;
  staffId:       string;
  staffName:     string;
  month:         string; // "YYYY-MM"
  amount:        number;
  paidDate:      string;
  paymentMethod: PayMethod | "";
  status:        SalaryStatus;
};

// ═══════════════════════════════════════════════════════════════
// MOCK DATA
// ═══════════════════════════════════════════════════════════════

const INITIAL_STAFF: Staff[] = [
  { id: "STF-001", name: "Aditi Verma",  phone: "9123456780", address: "22, Rajouri Garden, Delhi",    joiningDate: "2025-06-01", salary: 18000, status: "Active"   },
  { id: "STF-002", name: "Rohit Joshi",  phone: "8234567891", address: "45, Koramangala, Bangalore",   joiningDate: "2025-08-15", salary: 15000, status: "Active"   },
  { id: "STF-003", name: "Meena Pillai", phone: "7345678902", address: "78, T Nagar, Chennai",         joiningDate: "2024-11-01", salary: 20000, status: "Inactive" },
  { id: "STF-004", name: "Dev Malhotra", phone: "6456789013", address: "12, Kalyani Nagar, Pune",      joiningDate: "2026-01-10", salary: 12000, status: "Active"   },
  { id: "STF-005", name: "Sunita Rao",   phone: "5567890124", address: "34, Banjara Hills, Hyderabad", joiningDate: "2026-02-01", salary: 14000, status: "Active"   },
];

const TODAY = "2026-04-17";

const INITIAL_ATTENDANCE: Attendance[] = [
  { id:"ATT-001", staffId:"STF-001", staffName:"Aditi Verma",  date:"2026-04-17", checkIn:"09:02", checkOut:"",      workingHours:0,   present:true  },
  { id:"ATT-002", staffId:"STF-002", staffName:"Rohit Joshi",  date:"2026-04-17", checkIn:"09:45", checkOut:"",      workingHours:0,   present:true  },
  { id:"ATT-003", staffId:"STF-004", staffName:"Dev Malhotra", date:"2026-04-17", checkIn:"10:10", checkOut:"",      workingHours:0,   present:true  },
  { id:"ATT-004", staffId:"STF-005", staffName:"Sunita Rao",   date:"2026-04-17", checkIn:"",      checkOut:"",      workingHours:0,   present:false },
  { id:"ATT-005", staffId:"STF-001", staffName:"Aditi Verma",  date:"2026-04-16", checkIn:"09:00", checkOut:"18:00", workingHours:9.0, present:true  },
  { id:"ATT-006", staffId:"STF-002", staffName:"Rohit Joshi",  date:"2026-04-16", checkIn:"09:30", checkOut:"18:30", workingHours:9.0, present:true  },
  { id:"ATT-007", staffId:"STF-004", staffName:"Dev Malhotra", date:"2026-04-16", checkIn:"10:00", checkOut:"19:00", workingHours:9.0, present:true  },
  { id:"ATT-008", staffId:"STF-005", staffName:"Sunita Rao",   date:"2026-04-16", checkIn:"09:15", checkOut:"17:45", workingHours:8.5, present:true  },
  { id:"ATT-009", staffId:"STF-001", staffName:"Aditi Verma",  date:"2026-04-15", checkIn:"09:02", checkOut:"18:05", workingHours:9.1, present:true  },
  { id:"ATT-010", staffId:"STF-002", staffName:"Rohit Joshi",  date:"2026-04-15", checkIn:"10:00", checkOut:"19:00", workingHours:9.0, present:true  },
  { id:"ATT-011", staffId:"STF-004", staffName:"Dev Malhotra", date:"2026-04-15", checkIn:"",      checkOut:"",      workingHours:0,   present:false },
  { id:"ATT-012", staffId:"STF-005", staffName:"Sunita Rao",   date:"2026-04-15", checkIn:"09:20", checkOut:"18:10", workingHours:8.8, present:true  },
  { id:"ATT-013", staffId:"STF-001", staffName:"Aditi Verma",  date:"2026-04-14", checkIn:"09:10", checkOut:"18:00", workingHours:8.8, present:true  },
  { id:"ATT-014", staffId:"STF-002", staffName:"Rohit Joshi",  date:"2026-04-14", checkIn:"09:45", checkOut:"18:30", workingHours:8.8, present:true  },
  { id:"ATT-015", staffId:"STF-004", staffName:"Dev Malhotra", date:"2026-04-14", checkIn:"10:00", checkOut:"19:00", workingHours:9.0, present:true  },
  { id:"ATT-016", staffId:"STF-005", staffName:"Sunita Rao",   date:"2026-04-14", checkIn:"",      checkOut:"",      workingHours:0,   present:false },
];

const INITIAL_SALARY: SalaryRecord[] = [
  { id:"SAL-001", staffId:"STF-001", staffName:"Aditi Verma",  month:"2026-04", amount:18000, paidDate:"",           paymentMethod:"",             status:"Unpaid" },
  { id:"SAL-002", staffId:"STF-002", staffName:"Rohit Joshi",  month:"2026-04", amount:15000, paidDate:"",           paymentMethod:"",             status:"Unpaid" },
  { id:"SAL-003", staffId:"STF-003", staffName:"Meena Pillai", month:"2026-04", amount:20000, paidDate:"",           paymentMethod:"",             status:"Unpaid" },
  { id:"SAL-004", staffId:"STF-004", staffName:"Dev Malhotra", month:"2026-04", amount:12000, paidDate:"",           paymentMethod:"",             status:"Unpaid" },
  { id:"SAL-005", staffId:"STF-005", staffName:"Sunita Rao",   month:"2026-04", amount:14000, paidDate:"",           paymentMethod:"",             status:"Unpaid" },
  { id:"SAL-006", staffId:"STF-001", staffName:"Aditi Verma",  month:"2026-03", amount:18000, paidDate:"2026-03-31", paymentMethod:"Bank Transfer", status:"Paid"   },
  { id:"SAL-007", staffId:"STF-002", staffName:"Rohit Joshi",  month:"2026-03", amount:15000, paidDate:"2026-03-31", paymentMethod:"Cash",          status:"Paid"   },
  { id:"SAL-008", staffId:"STF-003", staffName:"Meena Pillai", month:"2026-03", amount:20000, paidDate:"2026-03-31", paymentMethod:"Bank Transfer", status:"Paid"   },
  { id:"SAL-009", staffId:"STF-004", staffName:"Dev Malhotra", month:"2026-03", amount:12000, paidDate:"2026-03-31", paymentMethod:"UPI",           status:"Paid"   },
  { id:"SAL-010", staffId:"STF-005", staffName:"Sunita Rao",   month:"2026-03", amount:14000, paidDate:"2026-03-31", paymentMethod:"UPI",           status:"Paid"   },
  { id:"SAL-011", staffId:"STF-001", staffName:"Aditi Verma",  month:"2026-02", amount:18000, paidDate:"2026-02-28", paymentMethod:"Bank Transfer", status:"Paid"   },
  { id:"SAL-012", staffId:"STF-002", staffName:"Rohit Joshi",  month:"2026-02", amount:15000, paidDate:"2026-02-28", paymentMethod:"Cash",          status:"Paid"   },
];

// ═══════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════

function fmt(n: number) {
  return "₹" + n.toLocaleString("en-IN");
}

function calcHours(checkIn: string, checkOut: string): number {
  if (!checkIn || !checkOut) return 0;
  const [ih, im] = checkIn.split(":").map(Number);
  const [oh, om] = checkOut.split(":").map(Number);
  return Math.round(((oh * 60 + om) - (ih * 60 + im)) / 60 * 10) / 10;
}

function genStaffId(list: Staff[]) {
  const max = list.length ? Math.max(...list.map((s) => parseInt(s.id.split("-")[1]))) : 0;
  return `STF-${String(max + 1).padStart(3, "0")}`;
}

function fmtMonth(m: string) {
  return new Date(m + "-01").toLocaleString("en-IN", { month: "long", year: "numeric" });
}

function nowTime() {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

const inputCls =
  "h-10 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-colors";

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

function StatCard({
  label, value, sub, icon: Icon, bg, ic,
}: {
  label: string; value: string | number; sub?: string;
  icon: React.ElementType; bg: string; ic: string;
}) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5">
      <div className={`inline-flex items-center justify-center w-9 h-9 rounded-lg ${bg} mb-3`}>
        <Icon className={`w-4 h-4 ${ic}`} />
      </div>
      <p className="text-2xl font-bold text-slate-900">{value}</p>
      <p className="text-xs font-semibold text-slate-700 mt-0.5">{label}</p>
      {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// MAIN PAGE
// ═══════════════════════════════════════════════════════════════

export default function StaffManagementPage() {
  const [mainTab, setMainTab] = useState<MainTab>("staff");

  // ── Staff State ──────────────────────────────────────────────
  const [staffList, setStaffList]       = useState<Staff[]>(INITIAL_STAFF);
  const [staffSearch, setStaffSearch]   = useState("");
  const [staffStatus, setStaffStatus]   = useState("All");
  const [showStaffModal, setShowStaffModal] = useState(false);
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);
  const [deleteStaffId, setDeleteStaffId]   = useState<string | null>(null);
  const [viewStaff, setViewStaff]       = useState<Staff | null>(null);
  const [staffForm, setStaffForm]       = useState({
    name: "", phone: "", address: "", joiningDate: "", salary: 0, status: "Active" as StaffStatus,
  });

  // ── Attendance State ─────────────────────────────────────────
  const [attendance, setAttendance]   = useState<Attendance[]>(INITIAL_ATTENDANCE);
  const [attDate, setAttDate]         = useState(TODAY);
  const [attStaffFilter, setAttStaffFilter] = useState("All");
  const [attView, setAttView]         = useState<"daily" | "monthly">("daily");
  const [attMonth, setAttMonth]       = useState("2026-04");
  const [checkinModal, setCheckinModal]   = useState<Staff | null>(null);
  const [checkoutModal, setCheckoutModal] = useState<Attendance | null>(null);
  const [manualTime, setManualTime]   = useState("");

  // ── Salary State ─────────────────────────────────────────────
  const [salaryList, setSalaryList]     = useState<SalaryRecord[]>(INITIAL_SALARY);
  const [salaryMonth, setSalaryMonth]   = useState("2026-04");
  const [salarySearch, setSalarySearch] = useState("");
  const [salaryStatusFilter, setSalaryStatusFilter] = useState("All");
  const [payModal, setPayModal]         = useState<SalaryRecord | null>(null);
  const [payForm, setPayForm]           = useState({ paidDate: TODAY, paymentMethod: "Bank Transfer" as PayMethod });

  // ═══════════════════════════════════════════════════════════════
  // ── STAFF LOGIC ──────────────────────────────────────────────
  // ═══════════════════════════════════════════════════════════════

  const filteredStaff = useMemo(() => {
    const q = staffSearch.toLowerCase();
    return staffList.filter((s) => {
      const match = s.name.toLowerCase().includes(q) || s.phone.includes(q) || s.id.toLowerCase().includes(q);
      const st    = staffStatus === "All" || s.status === staffStatus;
      return match && st;
    });
  }, [staffList, staffSearch, staffStatus]);

  function openAddStaff() {
    setEditingStaff(null);
    setStaffForm({ name: "", phone: "", address: "", joiningDate: "", salary: 0, status: "Active" });
    setShowStaffModal(true);
  }

  function openEditStaff(s: Staff) {
    setEditingStaff(s);
    setStaffForm({ name: s.name, phone: s.phone, address: s.address, joiningDate: s.joiningDate, salary: s.salary, status: s.status });
    setShowStaffModal(true);
  }

  function saveStaff() {
    if (!staffForm.name.trim() || !staffForm.phone.trim()) return;
    if (editingStaff) {
      setStaffList((p) => p.map((s) => s.id === editingStaff.id ? { ...s, ...staffForm } : s));
    } else {
      const newStaff: Staff = { ...staffForm, id: genStaffId(staffList) };
      setStaffList((p) => [newStaff, ...p]);
      // Auto-create unpaid salary record for current month
      const newSalary: SalaryRecord = {
        id: `SAL-${Date.now()}`, staffId: newStaff.id, staffName: newStaff.name,
        month: "2026-04", amount: newStaff.salary, paidDate: "",
        paymentMethod: "", status: "Unpaid",
      };
      setSalaryList((p) => [newSalary, ...p]);
    }
    setShowStaffModal(false);
  }

  function deleteStaff(id: string) {
    setStaffList((p) => p.filter((s) => s.id !== id));
    setDeleteStaffId(null);
  }

  // ═══════════════════════════════════════════════════════════════
  // ── ATTENDANCE LOGIC ─────────────────────────────────────────
  // ═══════════════════════════════════════════════════════════════

  // Daily records for selected date
  const dailyRecords = useMemo(() => {
    const base = attendance.filter((a) => a.date === attDate);
    // Ensure every active staff has a record slot
    const activeStaff = staffList.filter((s) => s.status === "Active");
    const existing    = base.map((a) => a.staffId);
    const missing     = activeStaff
      .filter((s) => !existing.includes(s.id))
      .map((s): Attendance => ({
        id: `ATT-TEMP-${s.id}`, staffId: s.id, staffName: s.name,
        date: attDate, checkIn: "", checkOut: "", workingHours: 0, present: false,
      }));
    return [...base, ...missing].filter((a) =>
      attStaffFilter === "All" || a.staffId === attStaffFilter
    );
  }, [attendance, attDate, staffList, attStaffFilter]);

  // Monthly summary per staff
  const monthlyAttSummary = useMemo(() => {
    const recs = attendance.filter((a) => a.date.startsWith(attMonth));
    const map: Record<string, { staffId: string; name: string; present: number; absent: number; totalHours: number }> = {};
    staffList.forEach((s) => {
      map[s.id] = { staffId: s.id, name: s.name, present: 0, absent: 0, totalHours: 0 };
    });
    recs.forEach((a) => {
      if (!map[a.staffId]) return;
      if (a.present) { map[a.staffId].present++; map[a.staffId].totalHours += a.workingHours; }
      else map[a.staffId].absent++;
    });
    return Object.values(map).filter((r) =>
      attStaffFilter === "All" || r.staffId === attStaffFilter
    );
  }, [attendance, attMonth, staffList, attStaffFilter]);

  function doCheckIn(staff: Staff, time: string) {
    const existing = attendance.find((a) => a.date === attDate && a.staffId === staff.id);
    if (existing) {
      setAttendance((p) =>
        p.map((a) => a.id === existing.id ? { ...a, checkIn: time, present: true } : a)
      );
    } else {
      setAttendance((p) => [
        ...p,
        {
          id: `ATT-${Date.now()}`, staffId: staff.id, staffName: staff.name,
          date: attDate, checkIn: time, checkOut: "", workingHours: 0, present: true,
        },
      ]);
    }
    setCheckinModal(null);
  }

  function doCheckOut(rec: Attendance, time: string) {
    const wh = calcHours(rec.checkIn, time);
    setAttendance((p) =>
      p.map((a) => a.id === rec.id ? { ...a, checkOut: time, workingHours: wh } : a)
    );
    setCheckoutModal(null);
  }

  // ═══════════════════════════════════════════════════════════════
  // ── SALARY LOGIC ─────────────────────────────────────────────
  // ═══════════════════════════════════════════════════════════════

  const filteredSalary = useMemo(() => {
    const q = salarySearch.toLowerCase();
    return salaryList.filter((s) => {
      const matchMonth  = !salaryMonth || s.month === salaryMonth;
      const matchSearch = s.staffName.toLowerCase().includes(q) || s.staffId.toLowerCase().includes(q);
      const matchStatus = salaryStatusFilter === "All" || s.status === salaryStatusFilter;
      return matchMonth && matchSearch && matchStatus;
    });
  }, [salaryList, salaryMonth, salarySearch, salaryStatusFilter]);

  const totalPayable  = filteredSalary.reduce((t, s) => t + s.amount, 0);
  const totalPaid     = filteredSalary.filter((s) => s.status === "Paid").reduce((t, s) => t + s.amount, 0);
  const totalPending  = filteredSalary.filter((s) => s.status === "Unpaid").reduce((t, s) => t + s.amount, 0);
  const unpaidCount   = filteredSalary.filter((s) => s.status === "Unpaid").length;

  function markPaid(rec: SalaryRecord) {
    setSalaryList((p) =>
      p.map((s) =>
        s.id === rec.id
          ? { ...s, status: "Paid", paidDate: payForm.paidDate, paymentMethod: payForm.paymentMethod }
          : s
      )
    );
    setPayModal(null);
  }

  // ═══════════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════════

  return (
    <div className="space-y-6">

      {/* ── Page Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Staff Management</h1>
          <p className="text-sm text-slate-500 mt-0.5">Manage staff, attendance and salary in one place</p>
        </div>
      </div>

      {/* ── Main Tabs ── */}
      <div className="flex gap-1 bg-slate-100 rounded-xl p-1 w-fit">
        {(["staff", "attendance", "salary"] as MainTab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setMainTab(tab)}
            className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-all capitalize ${
              mainTab === tab
                ? "bg-white text-blue-600 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            {tab === "staff" ? "👤 Staff" : tab === "attendance" ? "🕐 Attendance" : "💰 Salary"}
          </button>
        ))}
      </div>

      {/* ══════════════════════════════════════════════════════════
          TAB 1: STAFF MANAGEMENT
      ══════════════════════════════════════════════════════════ */}
      {mainTab === "staff" && (
        <div className="space-y-5">

          {/* Stats */}
          <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
            <StatCard label="Total Staff"    value={staffList.length}                                          sub="All records"             icon={Users}            bg="bg-blue-50"   ic="text-blue-600"   />
            <StatCard label="Active Staff"   value={staffList.filter((s) => s.status === "Active").length}    sub="Currently working"       icon={UserCheck}        bg="bg-green-50"  ic="text-green-600"  />
            <StatCard label="Inactive Staff" value={staffList.filter((s) => s.status === "Inactive").length}  sub="On leave / resigned"     icon={AlertCircle}      bg="bg-amber-50"  ic="text-amber-600"  />
            <StatCard label="Monthly Payroll" value={fmt(staffList.filter((s) => s.status === "Active").reduce((t, s) => t + s.salary, 0))} sub="Active staff total" icon={BadgeIndianRupee} bg="bg-purple-50" ic="text-purple-600" />
          </div>

          {/* Filters + Add */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input type="text" placeholder="Search by name, phone, ID…" value={staffSearch}
                onChange={(e) => setStaffSearch(e.target.value)} className={inputCls + " pl-9"} />
            </div>
            <div className="relative">
              <select value={staffStatus} onChange={(e) => setStaffStatus(e.target.value)}
                className={inputCls + " w-40 appearance-none pr-8 cursor-pointer"}>
                {["All", "Active", "Inactive"].map((s) => <option key={s}>{s}</option>)}
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>
            <button onClick={openAddStaff}
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition-colors shadow-sm shadow-blue-200 whitespace-nowrap">
              <Plus size={16} /> Add Staff
            </button>
          </div>

          {/* Staff Table */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50">
                    {["Staff ID","Name","Phone","Address","Joining Date","Salary","Status","Actions"].map((h) => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wide whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredStaff.length === 0 ? (
                    <tr><td colSpan={8} className="py-16 text-center text-sm text-slate-400">No staff found</td></tr>
                  ) : filteredStaff.map((s) => (
                    <tr key={s.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3.5 font-mono text-xs text-slate-500">{s.id}</td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold shrink-0">
                            {s.name.slice(0, 2).toUpperCase()}
                          </div>
                          <span className="font-semibold text-slate-800 whitespace-nowrap">{s.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-1.5 text-slate-500 whitespace-nowrap">
                          <Phone size={12} className="text-slate-400" />{s.phone}
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-slate-500 max-w-[160px] truncate">{s.address || "—"}</td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-1.5 text-slate-500 whitespace-nowrap">
                          <CalendarDays size={12} className="text-slate-400" />{s.joiningDate}
                        </div>
                      </td>
                      <td className="px-4 py-3.5 font-bold text-slate-900 whitespace-nowrap">{fmt(s.salary)}</td>
                      <td className="px-4 py-3.5">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${s.status === "Active" ? "bg-green-50 text-green-700" : "bg-slate-100 text-slate-500"}`}>
                          {s.status}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <button onClick={() => setViewStaff(s)} className="flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-800 transition-colors">
                            <Eye size={13} /> View
                          </button>
                          <button onClick={() => openEditStaff(s)} className="flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-slate-800 transition-colors">
                            <Pencil size={13} /> Edit
                          </button>
                          <button onClick={() => setDeleteStaffId(s.id)} className="flex items-center gap-1 text-xs font-medium text-red-400 hover:text-red-600 transition-colors">
                            <Trash2 size={13} /> Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {filteredStaff.length > 0 && (
              <div className="px-4 py-3 border-t border-slate-100 bg-slate-50">
                <p className="text-xs text-slate-400">
                  Showing <span className="font-semibold text-slate-600">{filteredStaff.length}</span> of{" "}
                  <span className="font-semibold text-slate-600">{staffList.length}</span> staff
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════
          TAB 2: ATTENDANCE
      ══════════════════════════════════════════════════════════ */}
      {mainTab === "attendance" && (
        <div className="space-y-5">

          {/* Today Stats */}
          <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
            {(() => {
              const todayRecs = attendance.filter((a) => a.date === TODAY);
              const present   = todayRecs.filter((a) => a.present).length;
              const checkedIn = todayRecs.filter((a) => a.checkIn && !a.checkOut).length;
              const checkedOut= todayRecs.filter((a) => a.checkOut).length;
              const absent    = staffList.filter((s) => s.status === "Active").length - present;
              return [
                { label: "Present Today",   value: present,    icon: CheckCircle,  bg: "bg-green-50",  ic: "text-green-600"  },
                { label: "Checked In",      value: checkedIn,  icon: LogIn,        bg: "bg-blue-50",   ic: "text-blue-600"   },
                { label: "Checked Out",     value: checkedOut, icon: LogOut,       bg: "bg-teal-50",   ic: "text-teal-600"   },
                { label: "Absent Today",    value: absent < 0 ? 0 : absent, icon: XCircle, bg: "bg-red-50", ic: "text-red-500" },
              ];
            })().map((s) => (
              <StatCard key={s.label} {...s} />
            ))}
          </div>

          {/* Controls */}
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
            {/* Daily / Monthly toggle */}
            <div className="flex gap-1 bg-slate-100 rounded-lg p-1">
              {(["daily", "monthly"] as const).map((v) => (
                <button key={v} onClick={() => setAttView(v)}
                  className={`px-4 py-1.5 rounded-md text-xs font-semibold capitalize transition-all ${
                    attView === v ? "bg-white text-blue-600 shadow-sm" : "text-slate-500"
                  }`}>{v === "daily" ? "Daily Report" : "Monthly Summary"}</button>
              ))}
            </div>

            {/* Date / Month picker */}
            {attView === "daily" ? (
              <input type="date" value={attDate} onChange={(e) => setAttDate(e.target.value)}
                className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 transition-colors" />
            ) : (
              <input type="month" value={attMonth} onChange={(e) => setAttMonth(e.target.value)}
                className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 transition-colors" />
            )}

            {/* Staff filter */}
            <div className="relative">
              <select value={attStaffFilter} onChange={(e) => setAttStaffFilter(e.target.value)}
                className="h-9 pl-3 pr-8 rounded-lg border border-slate-200 bg-white text-sm text-slate-700 outline-none focus:border-blue-400 appearance-none cursor-pointer">
                <option value="All">All Staff</option>
                {staffList.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>
          </div>

          {/* ── Daily Report ── */}
          {attView === "daily" && (
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
                <div>
                  <h2 className="text-sm font-bold text-slate-900">Daily Attendance Report</h2>
                  <p className="text-xs text-slate-400 mt-0.5">{attDate}</p>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50">
                      {["Staff ID","Name","Date","Check-in","Check-out","Working Hours","Status","Actions"].map((h) => (
                        <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wide whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {dailyRecords.length === 0 ? (
                      <tr><td colSpan={8} className="py-12 text-center text-sm text-slate-400">No records for this date</td></tr>
                    ) : dailyRecords.map((a) => (
                      <tr key={a.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                        <td className="px-4 py-3.5 font-mono text-xs text-slate-500">{a.staffId}</td>
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold shrink-0">
                              {a.staffName.slice(0, 2).toUpperCase()}
                            </div>
                            <span className="font-semibold text-slate-800 whitespace-nowrap">{a.staffName}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3.5 text-slate-500 whitespace-nowrap">{a.date}</td>
                        <td className="px-4 py-3.5">
                          {a.checkIn
                            ? <span className="flex items-center gap-1 text-green-600 font-semibold whitespace-nowrap"><LogIn size={13} />{a.checkIn}</span>
                            : <span className="text-slate-300">—</span>}
                        </td>
                        <td className="px-4 py-3.5">
                          {a.checkOut
                            ? <span className="flex items-center gap-1 text-blue-600 font-semibold whitespace-nowrap"><LogOut size={13} />{a.checkOut}</span>
                            : <span className="text-slate-300">—</span>}
                        </td>
                        <td className="px-4 py-3.5 font-semibold text-slate-700">
                          {a.workingHours > 0 ? `${a.workingHours}h` : "—"}
                        </td>
                        <td className="px-4 py-3.5">
                          {a.present
                            ? <span className="flex items-center gap-1 text-xs font-semibold text-green-600"><CheckCircle size={13} /> Present</span>
                            : <span className="flex items-center gap-1 text-xs font-semibold text-red-500"><XCircle size={13} /> Absent</span>}
                        </td>
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            {!a.checkIn && (
                              <button
                                onClick={() => {
                                  const s = staffList.find((st) => st.id === a.staffId);
                                  if (s) { setCheckinModal(s); setManualTime(nowTime()); }
                                }}
                                className="flex items-center gap-1 text-xs font-semibold text-green-600 hover:text-green-800 bg-green-50 hover:bg-green-100 px-2.5 py-1 rounded-lg transition-colors whitespace-nowrap"
                              >
                                <LogIn size={12} /> Check In
                              </button>
                            )}
                            {a.checkIn && !a.checkOut && (
                              <button
                                onClick={() => { setCheckoutModal(a); setManualTime(nowTime()); }}
                                className="flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-2.5 py-1 rounded-lg transition-colors whitespace-nowrap"
                              >
                                <LogOut size={12} /> Check Out
                              </button>
                            )}
                            {a.checkIn && a.checkOut && (
                              <span className="text-xs text-slate-400">Done</span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── Monthly Summary ── */}
          {attView === "monthly" && (
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
                <div>
                  <h2 className="text-sm font-bold text-slate-900">Monthly Attendance Summary</h2>
                  <p className="text-xs text-slate-400 mt-0.5">{fmtMonth(attMonth)}</p>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50">
                      {["Staff ID","Name","Present Days","Absent Days","Total Hours","Attendance %"].map((h) => (
                        <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wide whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {monthlyAttSummary.length === 0 ? (
                      <tr><td colSpan={6} className="py-12 text-center text-sm text-slate-400">No data for this month</td></tr>
                    ) : monthlyAttSummary.map((r) => {
                      const total = r.present + r.absent;
                      const pct   = total > 0 ? Math.round((r.present / total) * 100) : 0;
                      return (
                        <tr key={r.staffId} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                          <td className="px-5 py-3.5 font-mono text-xs text-slate-500">{r.staffId}</td>
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold shrink-0">
                                {r.name.slice(0, 2).toUpperCase()}
                              </div>
                              <span className="font-semibold text-slate-800">{r.name}</span>
                            </div>
                          </td>
                          <td className="px-5 py-3.5">
                            <span className="px-2.5 py-0.5 rounded-full bg-green-50 text-green-700 text-xs font-semibold">{r.present} days</span>
                          </td>
                          <td className="px-5 py-3.5">
                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${r.absent > 0 ? "bg-red-50 text-red-600" : "bg-slate-100 text-slate-400"}`}>
                              {r.absent} days
                            </span>
                          </td>
                          <td className="px-5 py-3.5 font-semibold text-slate-700">{r.totalHours.toFixed(1)}h</td>
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-2">
                              <div className="flex-1 max-w-[80px] bg-slate-100 rounded-full h-1.5">
                                <div
                                  className={`h-1.5 rounded-full ${pct >= 80 ? "bg-green-500" : pct >= 60 ? "bg-amber-500" : "bg-red-500"}`}
                                  style={{ width: `${pct}%` }}
                                />
                              </div>
                              <span className={`text-xs font-bold ${pct >= 80 ? "text-green-600" : pct >= 60 ? "text-amber-600" : "text-red-600"}`}>
                                {pct}%
                              </span>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════
          TAB 3: SALARY
      ══════════════════════════════════════════════════════════ */}
      {mainTab === "salary" && (
        <div className="space-y-5">

          {/* Stats */}
          <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
            <StatCard label="Total Payable"  value={fmt(totalPayable)}  sub={`${filteredSalary.length} records`}   icon={BadgeIndianRupee} bg="bg-blue-50"   ic="text-blue-600"   />
            <StatCard label="Total Paid"     value={fmt(totalPaid)}     sub="This period"                           icon={CheckCircle}      bg="bg-green-50"  ic="text-green-600"  />
            <StatCard label="Total Pending"  value={fmt(totalPending)}  sub={`${unpaidCount} unpaid`}               icon={Clock}            bg="bg-amber-50"  ic="text-amber-600"  />
            <StatCard label="Staff Count"    value={filteredSalary.length} sub="In selected month"                  icon={Users}            bg="bg-purple-50" ic="text-purple-600" />
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input type="text" placeholder="Search by name or staff ID…" value={salarySearch}
                onChange={(e) => setSalarySearch(e.target.value)} className={inputCls + " pl-9"} />
            </div>
            <input type="month" value={salaryMonth} onChange={(e) => setSalaryMonth(e.target.value)}
              className="h-10 rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm text-slate-700 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 transition-colors" />
            <div className="relative">
              <select value={salaryStatusFilter} onChange={(e) => setSalaryStatusFilter(e.target.value)}
                className={inputCls + " w-40 appearance-none pr-8 cursor-pointer"}>
                {["All", "Paid", "Unpaid"].map((s) => <option key={s}>{s}</option>)}
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>
          </div>

          {/* Salary Table */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <div>
                <h2 className="text-sm font-bold text-slate-900">Salary Records</h2>
                <p className="text-xs text-slate-400 mt-0.5">{salaryMonth ? fmtMonth(salaryMonth) : "All Months"}</p>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span className="px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 font-semibold">{unpaidCount} Unpaid</span>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50">
                    {["Staff ID","Name","Month","Salary Amount","Paid Date","Payment Method","Status","Action"].map((h) => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wide whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredSalary.length === 0 ? (
                    <tr><td colSpan={8} className="py-14 text-center text-sm text-slate-400">No salary records found</td></tr>
                  ) : filteredSalary.map((r) => (
                    <tr key={r.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3.5 font-mono text-xs text-slate-500">{r.staffId}</td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold shrink-0">
                            {r.staffName.slice(0, 2).toUpperCase()}
                          </div>
                          <span className="font-semibold text-slate-800 whitespace-nowrap">{r.staffName}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-slate-600 whitespace-nowrap">{fmtMonth(r.month)}</td>
                      <td className="px-4 py-3.5 font-bold text-slate-900 whitespace-nowrap">{fmt(r.amount)}</td>
                      <td className="px-4 py-3.5 text-slate-500 whitespace-nowrap">{r.paidDate || "—"}</td>
                      <td className="px-4 py-3.5 text-slate-500 whitespace-nowrap">{r.paymentMethod || "—"}</td>
                      <td className="px-4 py-3.5">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          r.status === "Paid" ? "bg-green-50 text-green-700" : "bg-amber-50 text-amber-700"
                        }`}>
                          {r.status}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        {r.status === "Unpaid" ? (
                          <button
                            onClick={() => { setPayModal(r); setPayForm({ paidDate: TODAY, paymentMethod: "Bank Transfer" }); }}
                            className="flex items-center gap-1 text-xs font-semibold text-white bg-green-600 hover:bg-green-700 px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap"
                          >
                            <BadgeIndianRupee size={12} /> Mark Paid
                          </button>
                        ) : (
                          <span className="flex items-center gap-1 text-xs text-green-600 font-semibold">
                            <CheckCircle size={13} /> Paid
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {filteredSalary.length > 0 && (
              <div className="px-5 py-3 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
                <p className="text-xs text-slate-400">
                  <span className="font-semibold text-slate-600">{filteredSalary.length}</span> records
                </p>
                <div className="flex items-center gap-4 text-xs">
                  <span className="text-green-600 font-semibold">Paid: {fmt(totalPaid)}</span>
                  <span className="text-amber-600 font-semibold">Pending: {fmt(totalPending)}</span>
                </div>
              </div>
            )}
          </div>

          {/* Monthly Report Summary Cards */}
          {salaryMonth && (
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <h3 className="text-sm font-bold text-slate-900 mb-4">
                Monthly Salary Report — {fmtMonth(salaryMonth)}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                {filteredSalary.map((r) => (
                  <div key={r.id}
                    className={`flex items-center justify-between px-4 py-3 rounded-xl border ${
                      r.status === "Paid" ? "border-green-100 bg-green-50" : "border-amber-100 bg-amber-50"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                        r.status === "Paid" ? "bg-green-200 text-green-800" : "bg-amber-200 text-amber-800"
                      }`}>
                        {r.staffName.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-800">{r.staffName}</p>
                        <p className="text-xs text-slate-500">{r.paymentMethod || "Not paid yet"}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-slate-900">{fmt(r.amount)}</p>
                      <span className={`text-xs font-semibold ${r.status === "Paid" ? "text-green-600" : "text-amber-600"}`}>
                        {r.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════
          MODALS
      ══════════════════════════════════════════════════════════ */}

      {/* ── Add / Edit Staff Modal ── */}
      {showStaffModal && (
        <Modal title={editingStaff ? "Edit Staff" : "Add New Staff"}
          sub={editingStaff ? `Editing ${editingStaff.id}` : "Fill in the staff details"}
          onClose={() => setShowStaffModal(false)}>
          <div className="px-6 py-5 space-y-4">
            <Field label="Full Name *">
              <input type="text" placeholder="e.g. Aditi Verma" value={staffForm.name}
                onChange={(e) => setStaffForm((p) => ({ ...p, name: e.target.value }))} className={inputCls} />
            </Field>
            <Field label="Phone Number *">
              <input type="tel" placeholder="e.g. 9876543210" value={staffForm.phone}
                onChange={(e) => setStaffForm((p) => ({ ...p, phone: e.target.value }))} className={inputCls} />
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Joining Date">
                <input type="date" value={staffForm.joiningDate}
                  onChange={(e) => setStaffForm((p) => ({ ...p, joiningDate: e.target.value }))} className={inputCls} />
              </Field>
              <Field label="Monthly Salary (₹)">
                <input type="number" min={0} placeholder="0" value={staffForm.salary || ""}
                  onChange={(e) => setStaffForm((p) => ({ ...p, salary: Number(e.target.value) }))} className={inputCls} />
              </Field>
            </div>
            <Field label="Status">
              <div className="relative">
                <select value={staffForm.status}
                  onChange={(e) => setStaffForm((p) => ({ ...p, status: e.target.value as StaffStatus }))}
                  className={inputCls + " appearance-none pr-8 cursor-pointer"}>
                  <option>Active</option>
                  <option>Inactive</option>
                </select>
                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              </div>
            </Field>
            <Field label="Address">
              <textarea placeholder="e.g. 22, Rajouri Garden, Delhi" value={staffForm.address}
                onChange={(e) => setStaffForm((p) => ({ ...p, address: e.target.value }))}
                rows={2} className={inputCls + " resize-none"} />
            </Field>
          </div>
          <ModalFooter
            onCancel={() => setShowStaffModal(false)}
            onConfirm={saveStaff}
            confirmLabel={editingStaff ? "Save Changes" : "Add Staff"}
            disabled={!staffForm.name.trim() || !staffForm.phone.trim()}
          />
        </Modal>
      )}

      {/* ── View Staff Modal ── */}
      {viewStaff && (
        <Modal title={viewStaff.name} sub={`${viewStaff.id} · ${viewStaff.phone}`} onClose={() => setViewStaff(null)} maxW="max-w-lg">
          <div className="px-6 py-5 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: "Staff ID",    value: viewStaff.id           },
                { label: "Phone",       value: viewStaff.phone        },
                { label: "Joining Date",value: viewStaff.joiningDate  },
                { label: "Salary",      value: fmt(viewStaff.salary)  },
                { label: "Status",      value: viewStaff.status       },
                { label: "Address",     value: viewStaff.address || "—" },
              ].map((r) => (
                <div key={r.label} className="flex flex-col gap-0.5">
                  <span className="text-xs text-slate-400 font-medium">{r.label}</span>
                  <span className="text-sm font-semibold text-slate-800">{r.value}</span>
                </div>
              ))}
            </div>

            {/* Attendance summary for this staff */}
            <div className="border-t border-slate-100 pt-4">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">This Month's Attendance</p>
              {(() => {
                const recs    = attendance.filter((a) => a.staffId === viewStaff.id && a.date.startsWith("2026-04"));
                const present = recs.filter((a) => a.present).length;
                const absent  = recs.filter((a) => !a.present).length;
                const hours   = recs.reduce((t, a) => t + a.workingHours, 0);
                return (
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { label: "Present",    value: `${present} days`, color: "text-green-600" },
                      { label: "Absent",     value: `${absent} days`,  color: "text-red-500"   },
                      { label: "Total Hrs",  value: `${hours.toFixed(1)}h`, color: "text-blue-600" },
                    ].map((m) => (
                      <div key={m.label} className="bg-slate-50 rounded-lg p-3 text-center border border-slate-100">
                        <p className={`text-base font-bold ${m.color}`}>{m.value}</p>
                        <p className="text-xs text-slate-400 mt-0.5">{m.label}</p>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>

            {/* Salary summary */}
            <div className="border-t border-slate-100 pt-4">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Salary (Last 3 Months)</p>
              <div className="space-y-2">
                {salaryList.filter((s) => s.staffId === viewStaff.id).slice(0, 3).map((r) => (
                  <div key={r.id} className="flex items-center justify-between px-3 py-2 rounded-lg bg-slate-50 border border-slate-100">
                    <span className="text-xs font-medium text-slate-600">{fmtMonth(r.month)}</span>
                    <span className="text-xs font-bold text-slate-800">{fmt(r.amount)}</span>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${r.status === "Paid" ? "bg-green-50 text-green-700" : "bg-amber-50 text-amber-700"}`}>
                      {r.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="px-6 py-4 border-t border-slate-100">
            <button onClick={() => setViewStaff(null)} className="w-full h-10 rounded-lg border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">
              Close
            </button>
          </div>
        </Modal>
      )}

      {/* ── Check In Modal ── */}
      {checkinModal && (
        <Modal title="Record Check-In" sub={checkinModal.name} onClose={() => setCheckinModal(null)}>
          <div className="px-6 py-5 space-y-4">
            <Field label="Check-In Time">
              <input type="time" value={manualTime} onChange={(e) => setManualTime(e.target.value)} className={inputCls} />
            </Field>
            <p className="text-xs text-slate-400">Date: <span className="font-semibold text-slate-600">{attDate}</span></p>
          </div>
          <ModalFooter
            onCancel={() => setCheckinModal(null)}
            onConfirm={() => doCheckIn(checkinModal, manualTime)}
            confirmLabel="Confirm Check-In"
            confirmColor="bg-green-600 hover:bg-green-700 shadow-green-200"
            disabled={!manualTime}
          />
        </Modal>
      )}

      {/* ── Check Out Modal ── */}
      {checkoutModal && (
        <Modal title="Record Check-Out" sub={checkoutModal.staffName} onClose={() => setCheckoutModal(null)}>
          <div className="px-6 py-5 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-50 rounded-lg px-4 py-3 border border-slate-100">
                <p className="text-xs text-slate-400">Checked In At</p>
                <p className="text-base font-bold text-slate-800 mt-0.5">{checkoutModal.checkIn}</p>
              </div>
              <Field label="Check-Out Time">
                <input type="time" value={manualTime} onChange={(e) => setManualTime(e.target.value)} className={inputCls} />
              </Field>
            </div>
            {manualTime && checkoutModal.checkIn && (
              <p className="text-xs text-slate-500">
                Working hours: <span className="font-bold text-blue-600">{calcHours(checkoutModal.checkIn, manualTime)}h</span>
              </p>
            )}
          </div>
          <ModalFooter
            onCancel={() => setCheckoutModal(null)}
            onConfirm={() => doCheckOut(checkoutModal, manualTime)}
            confirmLabel="Confirm Check-Out"
            disabled={!manualTime}
          />
        </Modal>
      )}

      {/* ── Mark Salary Paid Modal ── */}
      {payModal && (
        <Modal title="Mark Salary as Paid" sub={`${payModal.staffName} · ${fmtMonth(payModal.month)}`} onClose={() => setPayModal(null)}>
          <div className="px-6 py-5 space-y-4">
            <div className="bg-blue-50 rounded-xl px-4 py-3 border border-blue-100 flex items-center justify-between">
              <span className="text-sm text-blue-700 font-medium">Salary Amount</span>
              <span className="text-lg font-bold text-blue-800">{fmt(payModal.amount)}</span>
            </div>
            <Field label="Payment Date">
              <input type="date" value={payForm.paidDate}
                onChange={(e) => setPayForm((p) => ({ ...p, paidDate: e.target.value }))} className={inputCls} />
            </Field>
            <Field label="Payment Method">
              <div className="relative">
                <select value={payForm.paymentMethod}
                  onChange={(e) => setPayForm((p) => ({ ...p, paymentMethod: e.target.value as PayMethod }))}
                  className={inputCls + " appearance-none pr-8 cursor-pointer"}>
                  <option>Bank Transfer</option>
                  <option>Cash</option>
                  <option>UPI</option>
                </select>
                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              </div>
            </Field>
          </div>
          <ModalFooter
            onCancel={() => setPayModal(null)}
            onConfirm={() => markPaid(payModal)}
            confirmLabel="Confirm Payment"
            confirmColor="bg-green-600 hover:bg-green-700 shadow-green-200"
            disabled={!payForm.paidDate}
          />
        </Modal>
      )}

      {/* ── Delete Staff Confirm ── */}
      {deleteStaffId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
          <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl border border-slate-200 p-6">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-50 mx-auto mb-4">
              <Trash2 className="w-5 h-5 text-red-500" />
            </div>
            <h2 className="text-base font-bold text-slate-900 text-center">Remove Staff Member?</h2>
            <p className="text-sm text-slate-500 text-center mt-1 mb-6">
              This will permanently remove the staff member and all their records.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteStaffId(null)} className="flex-1 h-10 rounded-lg border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">
                Cancel
              </button>
              <button onClick={() => deleteStaff(deleteStaffId)} className="flex-1 h-10 rounded-lg bg-red-500 text-sm font-semibold text-white hover:bg-red-600 transition-colors">
                Yes, Remove
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// REUSABLE MODAL SHELL
// ═══════════════════════════════════════════════════════════════

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
  onCancel, onConfirm, confirmLabel, confirmColor = "bg-blue-600 hover:bg-blue-700 shadow-blue-200", disabled = false,
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