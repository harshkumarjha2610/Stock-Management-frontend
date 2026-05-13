"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import {
  Search, Plus, Eye, Pencil, Trash2, X, ChevronDown,
  UserCheck, Clock, BadgeIndianRupee, Phone, CalendarDays,
  CheckCircle, XCircle, LogIn, LogOut, FileText,
  TrendingUp, Users, AlertCircle, Download, Loader2, Camera, Upload
} from "lucide-react";
import { api } from "@/lib/api";

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
  aadharCard:  string;
  emailId:     string;
  photoUrl:    string;
  joiningDate: string;
  salary:      number;
  status:      StaffStatus;
  password?:   string;
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
  status:       "PRESENT" | "ABSENT" | "HALF_DAY";
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

const TODAY = new Date().toISOString().split('T')[0];

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
  const [loading, setLoading] = useState(true);
  const [mainTab, setMainTab] = useState<MainTab>("staff");

  // ── Staff State ──────────────────────────────────────────────
  const [staffList, setStaffList]       = useState<Staff[]>([]);
  const [staffSearch, setStaffSearch]   = useState("");
  const [staffStatus, setStaffStatus]   = useState("All");
  const [showStaffModal, setShowStaffModal] = useState(false);
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);
  const [deleteStaffId, setDeleteStaffId]   = useState<string | null>(null);
  const [viewStaff, setViewStaff]       = useState<Staff | null>(null);
  const [staffForm, setStaffForm] = useState<Staff>({
    id: "", name: "", phone: "", address: "", aadharCard: "",
    emailId: "", photoUrl: "", joiningDate: TODAY, salary: 0, status: "Active",
    password: ""
  });

  // ── Attendance State ─────────────────────────────────────────
  const [attendance, setAttendance]   = useState<Attendance[]>([]);
  const [attDate, setAttDate]         = useState(TODAY);
  const [attStaffFilter, setAttStaffFilter] = useState("All");
  const [attView, setAttView]         = useState<"daily" | "monthly">("daily");
  const [attMonth, setAttMonth]       = useState(TODAY.slice(0, 7));
  const [checkinModal, setCheckinModal]   = useState<Staff | null>(null);
  const [checkoutModal, setCheckoutModal] = useState<Attendance | null>(null);
  const [markModal, setMarkModal]         = useState<{ staffId: string; staffName: string; status: string } | null>(null);
  const [manualTime, setManualTime]   = useState("");

  // ── Salary State ─────────────────────────────────────────────
  const [salaryList, setSalaryList]     = useState<SalaryRecord[]>([]);
  const [salaryMonth, setSalaryMonth]   = useState(TODAY.slice(0, 7));
  const [salarySearch, setSalarySearch] = useState("");
  const [salaryStatusFilter, setSalaryStatusFilter] = useState("All");
  const [payModal, setPayModal]         = useState<SalaryRecord | null>(null);
  const [payForm, setPayForm]           = useState({ paidDate: TODAY, paymentMethod: "Bank Transfer" as PayMethod });
  const [successModal, setSuccessModal] = useState<{ email: string; password: string } | null>(null);
  const [userRole, setUserRole] = useState<string>("");

  useEffect(() => {
    const u = localStorage.getItem("user");
    if (u) {
      const parsed = JSON.parse(u);
      setUserRole(parsed.role);
      if (parsed.role === "STAFF") {
        window.location.href = "/attendance";
      }
    }
  }, []);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const [staffRes, attRes, salRes] = await Promise.all([
          api.get('/staff'),
          api.get('/attendance'),
          api.get('/salaries')
        ]);
        
        setStaffList(staffRes.data.map((s: any) => ({
          id: s.id,
          name: s.name,
          phone: s.phone,
          address: s.address,
          aadharCard: s.aadhar_card || "",
          emailId: s.email_id || "",
          photoUrl: s.photo_url || "",
          joiningDate: s.joining_date?.split('T')[0],
          salary: parseFloat(s.base_salary),
          status: s.status
        })));

        setAttendance(attRes.data.map((a: any) => ({
          id: a.id,
          staffId: a.staff_id,
          staffName: a.staff?.name || "Unknown",
          date: a.date?.split('T')[0],
          checkIn: a.check_in,
          checkOut: a.check_out,
          workingHours: parseFloat(a.working_hours || 0),
          present: a.status === 'PRESENT',
          status: a.status || 'ABSENT'
        })));

        setSalaryList(salRes.data.map((s: any) => ({
          id: s.id,
          staffId: s.staff_id,
          staffName: s.staff?.name || "Unknown",
          month: s.month,
          amount: parseFloat(s.amount),
          paidDate: s.paid_date?.split('T')[0],
          paymentMethod: s.payment_method,
          status: s.status
        })));

      } catch (error) {
        console.error("Failed to fetch staff data", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const dailyRecords = useMemo(() => {
    return attendance.filter((a) => a.date === attDate && (attStaffFilter === "All" || a.staffId === attStaffFilter));
  }, [attendance, attDate, attStaffFilter]);

  const monthlyAttSummary = useMemo(() => {
    const month = attMonth;
    const filtered = attendance.filter((a) => a.date.startsWith(month));
    
    const summaryMap: Record<string, any> = {};
    staffList.forEach(s => {
      if (attStaffFilter !== "All" && s.id !== attStaffFilter) return;
      summaryMap[s.id] = { staffId: s.id, name: s.name, present: 0, absent: 0, halfDay: 0, hours: 0 };
    });

    filtered.forEach(a => {
      if (summaryMap[a.staffId]) {
        if (a.status === "PRESENT") summaryMap[a.staffId].present++;
        else if (a.status === "ABSENT") summaryMap[a.staffId].absent++;
        else if (a.status === "HALF_DAY") summaryMap[a.staffId].halfDay++;
        summaryMap[a.staffId].hours += a.workingHours;
      }
    });

    return Object.values(summaryMap);
  }, [attendance, attMonth, attStaffFilter, staffList]);

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
    setStaffForm({ id: "", name: "", phone: "", address: "", aadharCard: "", emailId: "", photoUrl: "", joiningDate: TODAY, salary: 0, status: "Active", password: "" });
    setShowStaffModal(true);
  }

  function openEditStaff(s: Staff) {
    setEditingStaff(s);
    setStaffForm({ 
      id: s.id, 
      name: s.name, 
      phone: s.phone, 
      address: s.address, 
      aadharCard: s.aadharCard || "", 
      emailId: s.emailId || "", 
      photoUrl: s.photoUrl || "", 
      joiningDate: s.joiningDate, 
      salary: s.salary, 
      status: s.status,
      password: "" // Don't show existing password hash
    });
    setShowStaffModal(true);
  }

  async function saveStaff() {
    if (!staffForm.name.trim() || !staffForm.phone.trim()) return;
    setLoading(true);
    try {
      const payload = {
        name: staffForm.name,
        phone: staffForm.phone,
        address: staffForm.address,
        aadhar_card: staffForm.aadharCard,
        email_id: staffForm.emailId,
        photo_url: staffForm.photoUrl,
        joining_date: staffForm.joiningDate,
        base_salary: staffForm.salary,
        status: staffForm.status,
        password: staffForm.password
      };

      if (editingStaff) {
        await api.put(`/staff/${editingStaff.id}`, payload);
        setStaffList((p) => p.map((s) => s.id === editingStaff.id ? { ...s, ...staffForm } : s));
      } else {
        const res = await api.post('/staff', payload);
        const newStaff: Staff = { 
          ...staffForm, 
          id: res.data.id, 
          joiningDate: res.data.joining_date?.split('T')[0] 
        };
        setStaffList((p) => [newStaff, ...p]);
        
        if (staffForm.emailId) {
          setSuccessModal({ 
            email: staffForm.emailId, 
            password: staffForm.password || staffForm.phone || "Staff@123" 
          });
        }

        // Auto-create unpaid salary record for current month
        const salRes = await api.get('/salaries');
        setSalaryList(salRes.data.map((s: any) => ({
          id: s.id,
          staffId: s.staff_id,
          staffName: s.staff?.name || "Unknown",
          month: s.month,
          amount: parseFloat(s.amount),
          paidDate: s.paid_date?.split('T')[0],
          paymentMethod: s.payment_method,
          status: s.status
        })));
      }
      setShowStaffModal(false);
    } catch (error: any) {
      alert(error.message || "Failed to save staff");
    } finally {
      setLoading(false);
    }
  }

  async function updateStatus(staffId: string, status: string) {
    setLoading(true);
    try {
      const res = await api.post('/staff/attendance', {
        staff_id: staffId,
        date: attDate,
        status: status
      });

      const newAtt: Attendance = {
        id: res.data.id,
        staffId: res.data.staff_id,
        staffName: staffList.find(s => s.id === staffId)?.name || "Unknown",
        date: res.data.date?.split('T')[0],
        checkIn: res.data.check_in || "",
        checkOut: res.data.check_out || "",
        workingHours: parseFloat(res.data.working_hours || 0),
        present: res.data.status === 'PRESENT',
        status: res.data.status
      };

      setAttendance((p) => {
        const idx = p.findIndex(a => a.staffId === staffId && a.date === attDate);
        if (idx >= 0) {
          const next = [...p];
          next[idx] = newAtt;
          return next;
        }
        return [...p, newAtt];
      });
    } catch (error: any) {
      alert(error.message || "Failed to update status");
    } finally {
      setLoading(false);
      setMarkModal(null);
    }
  }

  async function deleteStaff(id: string) {
    if (!confirm("Are you sure you want to delete this staff member?")) return;
    setLoading(true);
    try {
      await api.delete(`/staff/${id}`);
      setStaffList((p) => p.filter((s) => s.id !== id));
      setDeleteStaffId(null);
    } catch (error: any) {
      alert(error.message || "Failed to delete staff");
    } finally {
      setLoading(false);
    }
  }

  async function doCheckOut(rec: Attendance, time: string) {
    setLoading(true);
    try {
      const res = await api.put(`/attendance/${rec.id}`, {
        check_out: time
      });
      
      setAttendance((p) =>
        p.map((a) => a.id === rec.id ? { 
          ...a, 
          checkOut: res.data.check_out, 
          workingHours: parseFloat(res.data.working_hours || 0) 
        } : a)
      );
    } catch (error: any) {
      alert(error.message || "Failed to check out");
    } finally {
      setLoading(false);
      setCheckoutModal(null);
    }
  }

  async function doCheckIn(staff: Staff, time: string) {
    setLoading(true);
    try {
      const res = await api.post('/staff/attendance', {
        staff_id: staff.id,
        date: attDate,
        check_in: time,
        status: 'PRESENT'
      });
      
      const newAtt: Attendance = {
        id: res.data.id,
        staffId: res.data.staff_id,
        staffName: staff.name,
        date: res.data.date?.split('T')[0],
        checkIn: res.data.check_in,
        checkOut: res.data.check_out || "",
        workingHours: parseFloat(res.data.working_hours || 0),
        present: true,
        status: 'PRESENT'
      };

      setAttendance((p) => {
        const idx = p.findIndex(a => a.staffId === staff.id && a.date === attDate);
        if (idx >= 0) {
          const next = [...p];
          next[idx] = newAtt;
          return next;
        }
        return [...p, newAtt];
      });
    } catch (error: any) {
      alert(error.message || "Failed to check in");
    } finally {
      setLoading(false);
      setCheckinModal(null);
    }
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

  async function markPaid(rec: SalaryRecord) {
    setLoading(true);
    try {
      await api.put(`/salaries/${rec.id}`, {
        status: 'Paid',
        paid_date: payForm.paidDate,
        payment_method: payForm.paymentMethod
      });

      setSalaryList((p) =>
        p.map((s) =>
          s.id === rec.id
            ? { ...s, status: "Paid", paidDate: payForm.paidDate, paymentMethod: payForm.paymentMethod }
            : s
        )
      );
    } catch (error: any) {
      alert(error.message || "Failed to mark salary as paid");
    } finally {
      setLoading(false);
      setPayModal(null);
    }
  }


  // ═══════════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════════

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-red-600" />
          <p className="text-sm font-medium text-slate-500">Loading staff data...</p>
        </div>
      </div>
    );
  }

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
                ? "bg-white text-red-600 shadow-sm"
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
            <StatCard label="Total Staff"    value={staffList.length}                                          sub="All records"             icon={Users}            bg="bg-red-50"   ic="text-red-600"   />
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
              className="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700 transition-colors shadow-sm shadow-red-200 whitespace-nowrap">
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
                          <div className="w-8 h-8 rounded-full bg-red-100 text-red-700 flex items-center justify-center text-xs font-bold shrink-0">
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
                          <button onClick={() => setViewStaff(s)} className="flex items-center gap-1 text-xs font-medium text-red-600 hover:text-red-800 transition-colors">
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
                { label: "Checked In",      value: checkedIn,  icon: LogIn,        bg: "bg-red-50",   ic: "text-red-600"   },
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
                    attView === v ? "bg-white text-red-600 shadow-sm" : "text-slate-500"
                  }`}>{v === "daily" ? "Daily Report" : "Monthly Summary"}</button>
              ))}
            </div>

            {/* Date / Month picker */}
            {attView === "daily" ? (
              <input type="date" value={attDate} onChange={(e) => setAttDate(e.target.value)}
                className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-red-400 focus:ring-2 focus:ring-red-500/20 transition-colors" />
            ) : (
              <input type="month" value={attMonth} onChange={(e) => setAttMonth(e.target.value)}
                className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-red-400 focus:ring-2 focus:ring-red-500/20 transition-colors" />
            )}

            {/* Staff filter */}
            <div className="relative">
              <select value={attStaffFilter} onChange={(e) => setAttStaffFilter(e.target.value)}
                className="h-9 pl-3 pr-8 rounded-lg border border-slate-200 bg-white text-sm text-slate-700 outline-none focus:border-red-400 appearance-none cursor-pointer">
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
                            <div className="w-7 h-7 rounded-full bg-red-100 text-red-700 flex items-center justify-center text-xs font-bold shrink-0">
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
                            ? <span className="flex items-center gap-1 text-red-600 font-semibold whitespace-nowrap"><LogOut size={13} />{a.checkOut}</span>
                            : <span className="text-slate-300">—</span>}
                        </td>
                        <td className="px-4 py-3.5 font-semibold text-slate-700">
                          {a.workingHours > 0 ? `${a.workingHours}h` : "—"}
                        </td>
                        <td className="px-4 py-3.5">
                          {a.status === "PRESENT" ? (
                            <span className="flex items-center gap-1 text-xs font-semibold text-green-600"><CheckCircle size={13} /> Present</span>
                          ) : a.status === "HALF_DAY" ? (
                            <span className="flex items-center gap-1 text-xs font-semibold text-amber-600"><Clock size={13} /> Half Day</span>
                          ) : (
                            <span className="flex items-center gap-1 text-xs font-semibold text-red-500"><XCircle size={13} /> Absent</span>
                          )}
                        </td>
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setMarkModal({ staffId: a.staffId, staffName: a.staffName, status: a.status })}
                              className="flex items-center gap-1 text-xs font-semibold text-red-600 hover:text-red-800 bg-red-50 hover:bg-red-100 px-2.5 py-1 rounded-lg transition-colors whitespace-nowrap"
                            >
                              <Pencil size={12} /> Mark Status
                            </button>
                            {!a.checkIn && a.status === "PRESENT" && (
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
                                className="flex items-center gap-1 text-xs font-semibold text-red-600 hover:text-red-800 bg-red-50 hover:bg-red-100 px-2.5 py-1 rounded-lg transition-colors whitespace-nowrap"
                              >
                                <LogOut size={12} /> Check Out
                              </button>
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
                              <div className="w-7 h-7 rounded-full bg-red-100 text-red-700 flex items-center justify-center text-xs font-bold shrink-0">
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
            <StatCard label="Total Payable"  value={fmt(totalPayable)}  sub={`${filteredSalary.length} records`}   icon={BadgeIndianRupee} bg="bg-red-50"   ic="text-red-600"   />
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
              className="h-10 rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm text-slate-700 outline-none focus:border-red-400 focus:ring-2 focus:ring-red-500/20 transition-colors" />
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
                          <div className="w-7 h-7 rounded-full bg-red-100 text-red-700 flex items-center justify-center text-xs font-bold shrink-0">
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
          maxW="max-w-4xl"
          onClose={() => setShowStaffModal(false)}>
          <div className="px-6 py-5 space-y-4">
            <div className="flex flex-col sm:flex-row gap-6">
              <div className="w-full sm:w-32 shrink-0">
                <Field label="Photo">
                  <ImageUploader value={staffForm.photoUrl} onChange={(url) => setStaffForm((p) => ({ ...p, photoUrl: url }))} />
                </Field>
              </div>
              <div className="flex-1 space-y-4">
                <Field label="Full Name *">
                  <input type="text" placeholder="e.g. Aditi Verma" value={staffForm.name}
                    onChange={(e) => setStaffForm((p) => ({ ...p, name: e.target.value }))} className={inputCls} />
                </Field>
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Phone Number *">
                    <input type="tel" placeholder="e.g. 9876543210" value={staffForm.phone}
                      onChange={(e) => setStaffForm((p) => ({ ...p, phone: e.target.value }))} className={inputCls} />
                  </Field>
                  <Field label="Email ID *">
                    <input type="email" placeholder="e.g. aditi@example.com" value={staffForm.emailId}
                      onChange={(e) => setStaffForm((p) => ({ ...p, emailId: e.target.value }))} className={inputCls} />
                  </Field>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Aadhar Card">
                    <input type="text" placeholder="e.g. 1234 5678 9012" value={staffForm.aadharCard}
                      onChange={(e) => setStaffForm((p) => ({ ...p, aadharCard: e.target.value }))} className={inputCls} />
                  </Field>
                  <Field label="Joining Date">
                    <input type="date" value={staffForm.joiningDate}
                      onChange={(e) => setStaffForm((p) => ({ ...p, joiningDate: e.target.value }))} className={inputCls} />
                  </Field>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Monthly Salary (₹)">
                    <input type="number" min={0} placeholder="0" value={staffForm.salary || ""}
                      onChange={(e) => setStaffForm((p) => ({ ...p, salary: Number(e.target.value) }))} className={inputCls} />
                  </Field>
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
                </div>
                {!editingStaff && (
                  <Field label="Password *">
                    <input type="password" placeholder="Set login password for staff" value={staffForm.password || ""}
                      onChange={(e) => setStaffForm((p) => ({ ...p, password: e.target.value }))} className={inputCls} />
                  </Field>
                )}
                <Field label="Address">
                  <textarea placeholder="e.g. 22, Rajouri Garden, Delhi" value={staffForm.address}
                    onChange={(e) => setStaffForm((p) => ({ ...p, address: e.target.value }))}
                    rows={2} className={inputCls + " resize-none"} />
                </Field>
              </div>
            </div>
          </div>
          <ModalFooter
            onCancel={() => setShowStaffModal(false)}
            onConfirm={saveStaff}
            confirmLabel={editingStaff ? "Save Changes" : "Add Staff"}
            disabled={!staffForm.name.trim() || !staffForm.phone.trim() || !staffForm.emailId?.trim() || (!editingStaff && !staffForm.password?.trim())}
          />
        </Modal>
      )}

      {/* ── View Staff Modal ── */}
      {viewStaff && (
        <Modal title={viewStaff.name} sub={`${viewStaff.id} · ${viewStaff.phone}`} onClose={() => setViewStaff(null)} maxW="max-w-lg">
          <div className="px-6 py-5 space-y-4">
            <div className="flex flex-col sm:flex-row gap-6">
              {viewStaff.photoUrl && (
                <div className="w-24 h-24 shrink-0 rounded-xl overflow-hidden border border-slate-200 bg-slate-50">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={viewStaff.photoUrl} alt={viewStaff.name} className="w-full h-full object-cover" />
                </div>
              )}
              <div className="grid grid-cols-2 gap-4 flex-1">
                {[
                  { label: "Staff ID",    value: viewStaff.id           },
                  { label: "Phone",       value: viewStaff.phone        },
                  { label: "Email ID",    value: viewStaff.emailId || "—" },
                  { label: "Aadhar Card", value: viewStaff.aadharCard || "—" },
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
                      { label: "Total Hrs",  value: `${hours.toFixed(1)}h`, color: "text-red-600" },
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
                Working hours: <span className="font-bold text-red-600">{calcHours(checkoutModal.checkIn, manualTime)}h</span>
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
            <div className="bg-red-50 rounded-xl px-4 py-3 border border-red-100 flex items-center justify-between">
              <span className="text-sm text-red-700 font-medium">Salary Amount</span>
              <span className="text-lg font-bold text-red-800">{fmt(payModal.amount)}</span>
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

      {/* ── Mark Status Modal ── */}
      {markModal && (
        <Modal title="Mark Attendance Status" sub={markModal.staffName} onClose={() => setMarkModal(null)}>
          <div className="px-6 py-5 space-y-4">
            <div className="grid grid-cols-1 gap-2">
              {[
                { label: "Present", value: "PRESENT", icon: CheckCircle, color: "text-green-600", bg: "bg-green-50" },
                { label: "Half Day", value: "HALF_DAY", icon: Clock, color: "text-amber-600", bg: "bg-amber-50" },
                { label: "Absent", value: "ABSENT", icon: XCircle, color: "text-red-500", bg: "bg-red-50" },
              ].map((s) => (
                <button
                  key={s.value}
                  onClick={() => updateStatus(markModal.staffId, s.value)}
                  className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all ${
                    markModal.status === s.value
                      ? "border-red-500 bg-red-50 shadow-sm"
                      : "border-slate-100 hover:border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg ${s.bg} flex items-center justify-center ${s.color}`}>
                      <s.icon size={18} />
                    </div>
                    <span className="font-bold text-slate-800">{s.label}</span>
                  </div>
                  {markModal.status === s.value && (
                    <div className="w-5 h-5 rounded-full bg-red-500 flex items-center justify-center text-white">
                      <CheckCircle size={12} />
                    </div>
                  )}
                </button>
              ))}
            </div>
            <p className="text-xs text-slate-400 text-center">Date: <span className="font-semibold text-slate-600">{attDate}</span></p>
          </div>
          <div className="px-6 py-4 border-t border-slate-100">
            <button onClick={() => setMarkModal(null)} className="w-full h-10 rounded-lg border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">
              Cancel
            </button>
          </div>
        </Modal>
      )}

      {/* ── Success Modal (Credentials) ── */}
      {successModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md px-4">
          <div className="w-full max-w-sm bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="bg-green-600 p-8 flex flex-col items-center text-white">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-4">
                <CheckCircle size={32} />
              </div>
              <h2 className="text-xl font-bold">Staff Added Successfully!</h2>
              <p className="text-green-100 text-sm mt-1">Login credentials generated</p>
            </div>
            <div className="p-6 space-y-4">
              <div className="space-y-3">
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Email / Username</p>
                  <p className="text-sm font-bold text-slate-800">{successModal.email}</p>
                </div>
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Temporary Password</p>
                  <p className="text-sm font-bold text-slate-800 font-mono tracking-wider">{successModal.password}</p>
                </div>
              </div>
              <p className="text-[11px] text-slate-400 text-center leading-relaxed">
                The staff can now login using these credentials to view their attendance.
              </p>
              <button 
                onClick={() => setSuccessModal(null)}
                className="w-full h-12 bg-slate-900 text-white rounded-2xl font-bold text-sm hover:bg-slate-800 transition-all shadow-lg shadow-slate-200"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
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
        <div className="relative w-full aspect-square rounded-xl overflow-hidden border border-slate-200 bg-slate-50">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={value}
            alt="Uploaded"
            className="w-full h-full object-cover"
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
          className={`flex flex-col items-center justify-center gap-3 w-full aspect-square rounded-xl border-2 border-dashed cursor-pointer transition-all ${
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
              Upload Photo
            </p>
            <p className="text-xs text-slate-400 mt-0.5">PNG, JPG</p>
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
  onCancel, onConfirm, confirmLabel, confirmColor = "bg-red-600 hover:bg-red-700 shadow-red-200", disabled = false,
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