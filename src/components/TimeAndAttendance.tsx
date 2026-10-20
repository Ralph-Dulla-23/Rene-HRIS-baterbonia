import React, { useState, useMemo } from "react";
import { 
  Clock, 
  Search, 
  Filter, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Plus, 
  Edit2, 
  Trash2, 
  Check, 
  X, 
  Calendar,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Download,
  Upload,
  RefreshCw,
  RotateCcw,
  SlidersHorizontal,
  Info
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface AttendanceRecord {
  id: string;
  sibsId: string;
  employeeName: string;
  department: string;
  account: string;
  site: string;
  trackerDate: string; // YYYY-MM-DD or formatted
  loginTime: string; // HH:MM AM/PM
  logoutTime: string; // HH:MM AM/PM or "—"
  startBreak: string; // HH:MM AM/PM or "—"
  endBreak: string; // HH:MM AM/PM or "—"
  isLate: boolean;
  isEarlyOut: boolean;
  status: "Approved" | "Pending" | "Rejected";
}

// Helper for avatar colors
function getAvatarColor(name: string): { bg: string; text: string } {
  const palette = [
    { bg: "bg-blue-100", text: "text-blue-700" },
    { bg: "bg-emerald-100", text: "text-emerald-700" },
    { bg: "bg-purple-100", text: "text-purple-700" },
    { bg: "bg-amber-100", text: "text-amber-700" },
    { bg: "bg-rose-100", text: "text-rose-700" },
    { bg: "bg-cyan-100", text: "text-cyan-700" },
    { bg: "bg-indigo-100", text: "text-indigo-700" },
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash += name.charCodeAt(i);
  return palette[hash % palette.length];
}

function getInitials(name: string): string {
  const parts = name.replace(/,/g, "").trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return parts[0]?.substring(0, 2).toUpperCase() || "EE";
}

// Helper to convert time string (HH:MM AM/PM) to minutes from midnight
function timeToMinutes(timeStr: string): number {
  if (!timeStr || timeStr === "—" || timeStr === "") return 0;
  const match = timeStr.match(/^(\d+):(\d+)\s*(AM|PM)$/i);
  if (!match) return 0;
  let hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  const ampm = match[3].toUpperCase();
  
  if (ampm === "PM" && hours < 12) hours += 12;
  if (ampm === "AM" && hours === 12) hours = 0;
  
  return hours * 60 + minutes;
}

// Helper to format minutes from midnight to HH:MM AM/PM
function minutesToTimeStr(minutes: number): string {
  if (minutes < 0) minutes = 0;
  let hours = Math.floor(minutes / 60) % 24;
  const mins = Math.floor(minutes % 60);
  const ampm = hours >= 12 ? "PM" : "AM";
  
  let dispHours = hours % 12;
  if (dispHours === 0) dispHours = 12;
  
  const minPad = mins.toString().padStart(2, "0");
  return `${dispHours}:${minPad} ${ampm}`;
}

// Initial 15 high-fidelity attendance records matching 1:1 design
const INITIAL_ATTENDANCE_RECORDS: AttendanceRecord[] = [
  {
    id: "att-1",
    sibsId: "6365",
    employeeName: "CAIREL, CHESTER VONNE DELA CRUZ",
    department: "IT (Information and Communications Technology)",
    account: "Helpdesk and Support",
    site: "TAGUM",
    trackerDate: "September 7, 2026",
    loginTime: "01:21 PM",
    startBreak: "—",
    endBreak: "—",
    logoutTime: "—",
    isLate: false,
    isEarlyOut: false,
    status: "Pending"
  },
  {
    id: "att-2",
    sibsId: "6100",
    employeeName: "YBAÑEZ, DEX CHAUNCEY DIVINA",
    department: "Management Team",
    account: "Managers",
    site: "DAVAO",
    trackerDate: "September 7, 2026",
    loginTime: "01:10 PM",
    startBreak: "—",
    endBreak: "—",
    logoutTime: "—",
    isLate: false,
    isEarlyOut: false,
    status: "Pending"
  },
  {
    id: "att-3",
    sibsId: "6185",
    employeeName: "CAÑOS, KAYZER PAUL ZAPANTA",
    department: "Call Center Operations",
    account: "US Visa",
    site: "TAGUM",
    trackerDate: "September 7, 2026",
    loginTime: "12:58 PM",
    startBreak: "—",
    endBreak: "—",
    logoutTime: "—",
    isLate: false,
    isEarlyOut: false,
    status: "Pending"
  },
  {
    id: "att-4",
    sibsId: "6797",
    employeeName: "INSIPIDO, MEL ROSE PLAIDA",
    department: "Call Center Operations",
    account: "Yomdel Property",
    site: "TAGUM",
    trackerDate: "September 7, 2026",
    loginTime: "12:57 PM",
    startBreak: "—",
    endBreak: "—",
    logoutTime: "—",
    isLate: false,
    isEarlyOut: false,
    status: "Pending"
  },
  {
    id: "att-5",
    sibsId: "4807",
    employeeName: "VILLANUEVA, CHRISTIAN JEFF",
    department: "Call Center Operations",
    account: "Yomdel Property",
    site: "TAGUM",
    trackerDate: "September 7, 2026",
    loginTime: "12:57 PM",
    startBreak: "—",
    endBreak: "—",
    logoutTime: "—",
    isLate: false,
    isEarlyOut: false,
    status: "Pending"
  },
  {
    id: "att-6",
    sibsId: "6496",
    employeeName: "CANITAN, CRISTER ALBERCA",
    department: "IT (Information and Communications Technology)",
    account: "Software Management",
    site: "DAVAO",
    trackerDate: "September 7, 2026",
    loginTime: "12:55 PM",
    startBreak: "—",
    endBreak: "—",
    logoutTime: "—",
    isLate: false,
    isEarlyOut: false,
    status: "Pending"
  },
  {
    id: "att-7",
    sibsId: "6099",
    employeeName: "LABUS, ROLAND JAMES DIAGBEL",
    department: "Management Team",
    account: "Managers",
    site: "DAVAO",
    trackerDate: "September 7, 2026",
    loginTime: "12:50 PM",
    startBreak: "—",
    endBreak: "—",
    logoutTime: "—",
    isLate: false,
    isEarlyOut: false,
    status: "Pending"
  },
  {
    id: "att-8",
    sibsId: "6495",
    employeeName: "ANG, KRISTIAN ALLEN BAQUERFO",
    department: "IT (Information and Communications Technology)",
    account: "Software Management",
    site: "DAVAO",
    trackerDate: "September 7, 2026",
    loginTime: "12:45 PM",
    startBreak: "—",
    endBreak: "—",
    logoutTime: "—",
    isLate: false,
    isEarlyOut: false,
    status: "Pending"
  },
  {
    id: "att-9",
    sibsId: "4830",
    employeeName: "PAJAR, DOROTHY FAITH ELIZA LUBO",
    department: "Call Center Operations",
    account: "Yomdel Property",
    site: "TAGUM",
    trackerDate: "September 7, 2026",
    loginTime: "12:40 PM",
    startBreak: "—",
    endBreak: "—",
    logoutTime: "—",
    isLate: false,
    isEarlyOut: false,
    status: "Pending"
  },
  {
    id: "att-10",
    sibsId: "3635",
    employeeName: "SALVACION, CHRIS JOHN",
    department: "Call Center Operations",
    account: "US Visa",
    site: "TAGUM",
    trackerDate: "September 7, 2026",
    loginTime: "12:35 PM",
    startBreak: "—",
    endBreak: "—",
    logoutTime: "—",
    isLate: false,
    isEarlyOut: false,
    status: "Pending"
  },
  {
    id: "att-11",
    sibsId: "6200",
    employeeName: "USMAN, LYKA ANTH",
    department: "Call Center Operations",
    account: "US Visa",
    site: "TAGUM",
    trackerDate: "September 7, 2026",
    loginTime: "12:30 PM",
    startBreak: "—",
    endBreak: "—",
    logoutTime: "—",
    isLate: false,
    isEarlyOut: false,
    status: "Pending"
  },
  {
    id: "att-12",
    sibsId: "3667",
    employeeName: "QUINSAY, GERY",
    department: "Management Team",
    account: "Admin",
    site: "DAVAO",
    trackerDate: "September 7, 2026",
    loginTime: "12:25 PM",
    startBreak: "—",
    endBreak: "—",
    logoutTime: "—",
    isLate: false,
    isEarlyOut: false,
    status: "Pending"
  },
  {
    id: "att-13",
    sibsId: "5122",
    employeeName: "MENDOZA, BEATRIZ CLAIRE",
    department: "Healthcare Operations",
    account: "Aetna Core",
    site: "DAVAO",
    trackerDate: "September 7, 2026",
    loginTime: "12:20 PM",
    startBreak: "—",
    endBreak: "—",
    logoutTime: "—",
    isLate: false,
    isEarlyOut: false,
    status: "Pending"
  },
  {
    id: "att-14",
    sibsId: "5890",
    employeeName: "TORRES, DANIEL SEBASTIAN",
    department: "Workforce Management (WFM)",
    account: "Global WFM",
    site: "TAGUM",
    trackerDate: "September 7, 2026",
    loginTime: "12:15 PM",
    startBreak: "—",
    endBreak: "—",
    logoutTime: "—",
    isLate: false,
    isEarlyOut: false,
    status: "Pending"
  },
  {
    id: "att-15",
    sibsId: "4108",
    employeeName: "RAMIREZ, JOHN ROVIC",
    department: "IT (Information and Communications Technology)",
    account: "Helpdesk and Support",
    site: "TAGUM",
    trackerDate: "September 7, 2026",
    loginTime: "12:10 PM",
    startBreak: "—",
    endBreak: "—",
    logoutTime: "—",
    isLate: false,
    isEarlyOut: false,
    status: "Pending"
  }
];

export default function TimeAndAttendance() {
  const [records, setRecords] = useState<AttendanceRecord[]>(INITIAL_ATTENDANCE_RECORDS);
  
  // Filters state
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("All Departments");
  const [selectedAccount, setSelectedAccount] = useState("All Accounts");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  // Selection state for batch approvals
  const [selectedRowIds, setSelectedRowIds] = useState<string[]>([]);

  // Modal states for adding/editing record
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<AttendanceRecord | null>(null);

  // Form states for add/edit modal
  const [formSibsId, setFormSibsId] = useState("");
  const [formEmployeeName, setFormEmployeeName] = useState("");
  const [formDepartment, setFormDepartment] = useState("IT (Information and Communications Technology)");
  const [formAccount, setFormAccount] = useState("Software Management");
  const [formSite, setFormSite] = useState("Davao");
  const [formTrackerDate, setFormTrackerDate] = useState("September 7, 2026");
  const [formLogin, setFormLogin] = useState("09:00 AM");
  const [formStartBreak, setFormStartBreak] = useState("12:00 PM");
  const [formEndBreak, setFormEndBreak] = useState("01:00 PM");
  const [formLogout, setFormLogout] = useState("06:00 PM");
  const [formStatus, setFormStatus] = useState<"Approved" | "Pending" | "Rejected">("Pending");

  // Options for dropdowns based on actual dataset and company settings
  const departmentsList = [
    "All Departments",
    "IT (Information and Communications Technology)",
    "Management Team",
    "Call Center Operations",
    "Healthcare Operations",
    "Workforce Management (WFM)"
  ];

  const accountsList = [
    "All Accounts",
    "Helpdesk and Support",
    "Managers",
    "US Visa",
    "Yomdel Property",
    "Software Management",
    "Aetna Core",
    "Global WFM",
    "Admin"
  ];

  const sitesList = ["Davao", "Tagum", "Hybrid"];

  // Reset filters
  const handleResetFilters = () => {
    setSearchTerm("");
    setSelectedDepartment("All Departments");
    setSelectedAccount("All Accounts");
    setFromDate("");
    setToDate("");
  };

  // Helper to compute individual row metrics
  const computeRowMetrics = (record: AttendanceRecord) => {
    const loginMin = timeToMinutes(record.loginTime);
    const logoutMin = timeToMinutes(record.logoutTime);
    const breakStartMin = timeToMinutes(record.startBreak);
    const breakEndMin = timeToMinutes(record.endBreak);

    // Break hours
    let bh = 0;
    if (breakEndMin > breakStartMin && breakStartMin > 0) {
      bh = (breakEndMin - breakStartMin) / 60;
    } else {
      bh = 1.0; // standard 1 hour break default
    }

    // Total hours between login and logout
    let rawTotalMin = 0;
    if (logoutMin > loginMin) {
      rawTotalMin = logoutMin - loginMin;
    } else if (logoutMin < loginMin && logoutMin > 0) {
      // Overnight shift
      rawTotalMin = (24 * 60 - loginMin) + logoutMin;
    }

    const rawTotalHours = rawTotalMin / 60;
    
    // Net hours (less break)
    const netHours = Math.max(0, rawTotalHours - bh);
    
    // Work Hours (WH) capped at 8.0
    const wh = Math.min(8.0, netHours);
    
    // Overtime Hours (OT)
    const ot = netHours > 8.0 ? parseFloat((netHours - 8.0).toFixed(2)) : 0;
    
    // Approved Total Hours (ATH) - only positive if Approved
    const ath = record.status === "Approved" ? parseFloat((wh + ot).toFixed(2)) : 0;

    return {
      wh: parseFloat(wh.toFixed(2)),
      bh: parseFloat(bh.toFixed(2)),
      ot,
      ath
    };
  };

  // Filtered attendance list
  const filteredRecords = useMemo(() => {
    return records.filter(rec => {
      // Search
      const matchesSearch = 
        rec.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rec.sibsId.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Department
      const matchesDept = 
        selectedDepartment === "All Departments" || 
        rec.department === selectedDepartment;
      
      // Account
      const matchesAccount = 
        selectedAccount === "All Accounts" || 
        rec.account === selectedAccount;

      // Dates
      const recDate = new Date(rec.trackerDate);
      const start = fromDate ? new Date(fromDate) : null;
      const end = toDate ? new Date(toDate) : null;

      let matchesDate = true;
      if (start) {
        recDate.setHours(0,0,0,0);
        start.setHours(0,0,0,0);
        if (recDate < start) matchesDate = false;
      }
      if (end) {
        recDate.setHours(0,0,0,0);
        end.setHours(0,0,0,0);
        if (recDate > end) matchesDate = false;
      }

      return matchesSearch && matchesDept && matchesAccount && matchesDate;
    });
  }, [records, searchTerm, selectedDepartment, selectedAccount, fromDate, toDate]);

  // Overall Statistics (Dynamic based on filtered dataset)
  const stats = useMemo(() => {
    const loadedCount = filteredRecords.length;
    const approvedCount = filteredRecords.filter(r => r.status === "Approved").length;
    const pendingCount = filteredRecords.filter(r => r.status === "Pending").length;
    
    // Sum of Work Hours for the filtered page
    let totalPageWh = 0;
    filteredRecords.forEach(r => {
      const metrics = computeRowMetrics(r);
      totalPageWh += metrics.wh;
    });

    return {
      loaded: loadedCount,
      approved: approvedCount,
      pending: pendingCount,
      pageWh: parseFloat(totalPageWh.toFixed(1))
    };
  }, [filteredRecords]);

  // Quick Action triggers
  const handleQuickStatusChange = (id: string, newStatus: "Approved" | "Pending" | "Rejected") => {
    setRecords(prev => prev.map(r => r.id === id ? { ...r, status: newStatus } : r));
  };

  // Bulk Actions
  const handleBulkStatusChange = (newStatus: "Approved" | "Pending" | "Rejected") => {
    if (selectedRowIds.length === 0) return;
    setRecords(prev => prev.map(r => selectedRowIds.includes(r.id) ? { ...r, status: newStatus } : r));
    setSelectedRowIds([]);
  };

  // Delete Action
  const handleDeleteRecord = (id: string) => {
    if (confirm("Are you sure you want to delete this attendance record?")) {
      setRecords(prev => prev.filter(r => r.id !== id));
      setSelectedRowIds(prev => prev.filter(rowId => rowId !== id));
    }
  };

  // Select / Unselect Rows
  const toggleRowSelection = (id: string) => {
    setSelectedRowIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedRowIds.length === filteredRecords.length) {
      setSelectedRowIds([]);
    } else {
      setSelectedRowIds(filteredRecords.map(r => r.id));
    }
  };

  // Open Form to Add
  const openAddModal = () => {
    setEditingRecord(null);
    setFormSibsId("");
    setFormEmployeeName("");
    setFormDepartment("IT (Information and Communications Technology)");
    setFormAccount("Software Management");
    setFormSite("Davao");
    setFormTrackerDate("2026-07-20");
    setFormLogin("09:00 AM");
    setFormStartBreak("12:00 PM");
    setFormEndBreak("01:00 PM");
    setFormLogout("06:00 PM");
    setFormStatus("Pending");
    setIsAddEditModalOpen(true);
  };

  // Open Form to Edit
  const openEditModal = (record: AttendanceRecord) => {
    setEditingRecord(record);
    setFormSibsId(record.sibsId);
    setFormEmployeeName(record.employeeName);
    setFormDepartment(record.department);
    setFormAccount(record.account);
    setFormSite(record.site);
    setFormTrackerDate(record.trackerDate);
    setFormLogin(record.loginTime);
    setFormStartBreak(record.startBreak);
    setFormEndBreak(record.endBreak);
    setFormLogout(record.logoutTime);
    setFormStatus(record.status);
    setIsAddEditModalOpen(true);
  };

  // Handle submit Add/Edit
  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formSibsId || !formEmployeeName) {
      alert("Please specify both SiBS ID and Employee Name");
      return;
    }

    // Determine if late (shift starts at 9:00 AM)
    const loginMin = timeToMinutes(formLogin);
    const startShiftMin = 9 * 60; // 9:00 AM
    const isLate = loginMin > startShiftMin;

    // Determine if early out (shift ends at 6:00 PM)
    const logoutMin = timeToMinutes(formLogout);
    const endShiftMin = 18 * 60; // 6:00 PM
    const isEarlyOut = logoutMin < endShiftMin;

    if (editingRecord) {
      // Edit existing
      setRecords(prev => prev.map(r => r.id === editingRecord.id ? {
        ...r,
        sibsId: formSibsId,
        employeeName: formEmployeeName.toUpperCase(),
        department: formDepartment,
        account: formAccount,
        site: formSite,
        trackerDate: formTrackerDate,
        loginTime: formLogin,
        startBreak: formStartBreak,
        endBreak: formEndBreak,
        logoutTime: formLogout,
        isLate,
        isEarlyOut,
        status: formStatus
      } : r));
    } else {
      // Add new
      const newRec: AttendanceRecord = {
        id: "att-" + Date.now(),
        sibsId: formSibsId,
        employeeName: formEmployeeName.toUpperCase(),
        department: formDepartment,
        account: formAccount,
        site: formSite,
        trackerDate: formTrackerDate,
        loginTime: formLogin,
        startBreak: formStartBreak,
        endBreak: formEndBreak,
        logoutTime: formLogout,
        isLate,
        isEarlyOut,
        status: formStatus
      };
      setRecords(prev => [newRec, ...prev]);
    }

    setIsAddEditModalOpen(false);
    setEditingRecord(null);
  };

  return (
    <div className="w-full text-[#101828] select-none space-y-5" id="attendance-module-container">
      {/* ==================== PAGE HEADER (MATCHING 1:1) ==================== */}
      <div className="bg-white rounded-xl border border-[#E6ECF2] shadow-xs overflow-hidden flex flex-col">
        {/* Top Accent Gradient Bar: Deep Navy to Vivid Orange */}
        <div className="h-[3.5px] w-full bg-gradient-to-r from-[#042C51] via-[#c24b30] to-[#FF5C28]" />
        
        <div className="p-4 sm:p-5 flex items-center justify-between">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-blue-50/80 border border-blue-100 text-[#042C51] text-[10px] font-extrabold uppercase tracking-wider mb-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#FF5C28]"></span>
              CORE HR VIEW
            </div>
            <h1 className="text-xl font-black text-[#042C51] tracking-tight">Time &amp; Attendance</h1>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Monitor employee clock-in and clock-out activity, breaks, work hours, and attendance approvals.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleResetFilters}
              title="Reset filters and refresh"
              className="p-2.5 rounded-xl bg-white border border-[#E6ECF2] hover:bg-slate-50 text-slate-600 hover:text-[#042C51] transition-all shadow-xs cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              onClick={openAddModal}
              className="bg-[#FF5C28] hover:bg-[#e04b1a] text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-xs flex items-center gap-2 transition-all cursor-pointer"
            >
              <Clock className="w-4 h-4" />
              <span>Attendance Records</span>
            </button>
          </div>
        </div>
      </div>

      {/* ==================== 4 METRICS CARDS (MATCHING 1:1) ==================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Loaded Attendance Card */}
        <div className="bg-white p-5 rounded-xl border border-[#E6ECF2] shadow-xs flex items-center justify-between transition-all hover:shadow-sm">
          <div>
            <div className="text-[11px] font-black uppercase text-slate-700 tracking-wider">LOADED ATTENDANCE</div>
            <div className="text-3xl font-black text-[#042C51] tracking-tight mt-1.5">{stats.loaded}</div>
            <div className="text-xs text-slate-500 font-medium mt-1">Records loaded on the current page</div>
          </div>
          <div className="w-12 h-12 rounded-full bg-blue-50/80 border border-blue-100 flex items-center justify-center text-blue-600">
            <Calendar className="w-6 h-6" />
          </div>
        </div>

        {/* Approved Card */}
        <div className="bg-white p-5 rounded-xl border border-[#E6ECF2] shadow-xs flex items-center justify-between transition-all hover:shadow-sm">
          <div>
            <div className="text-[11px] font-black uppercase text-emerald-600 tracking-wider">APPROVED</div>
            <div className="text-3xl font-black text-emerald-600 tracking-tight mt-1.5">{stats.approved}</div>
            <div className="text-xs text-slate-500 font-medium mt-1">Ready for payroll processing</div>
          </div>
          <div className="w-12 h-12 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
            <CheckCircle className="w-6 h-6" />
          </div>
        </div>

        {/* Pending Review Card */}
        <div className="bg-white p-5 rounded-xl border border-[#E6ECF2] shadow-xs flex items-center justify-between transition-all hover:shadow-sm">
          <div>
            <div className="text-[11px] font-black uppercase text-[#FF5C28] tracking-wider">PENDING REVIEW</div>
            <div className="text-3xl font-black text-[#FF5C28] tracking-tight mt-1.5">{stats.pending}</div>
            <div className="text-xs text-slate-500 font-medium mt-1">Awaiting attendance validation</div>
          </div>
          <div className="w-12 h-12 rounded-full bg-orange-50 border border-orange-100 flex items-center justify-center text-[#FF5C28]">
            <AlertCircle className="w-6 h-6" />
          </div>
        </div>

        {/* Computed Work Hours Card */}
        <div className="bg-white p-5 rounded-xl border border-[#E6ECF2] shadow-xs flex items-center justify-between transition-all hover:shadow-sm">
          <div>
            <div className="text-[11px] font-black uppercase text-[#FF5C28] tracking-wider">COMPUTED WORK HOURS</div>
            <div className="text-3xl font-black text-[#FF5C28] tracking-tight mt-1.5">{stats.pageWh} hrs</div>
            <div className="text-xs text-slate-500 font-medium mt-1">Capped work hours from this page</div>
          </div>
          <div className="w-12 h-12 rounded-full bg-orange-50 border border-orange-100 flex items-center justify-center text-[#FF5C28]">
            <Clock className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* ==================== ATTENDANCE RECORDS CONTAINER (MATCHING 1:1) ==================== */}
      <div className="bg-white p-5 rounded-xl border border-[#E6ECF2] shadow-xs space-y-4">
        {/* Card Header */}
        <div>
          <h2 className="text-base font-bold text-[#042C51] tracking-tight">Attendance Records</h2>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Review employee time entries, work hours, breaks, and approval status.
          </p>
        </div>

        {/* Filters Row */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
          {/* Search */}
          <div className="md:col-span-4 space-y-1">
            <label className="text-xs font-semibold text-slate-700">Search</label>
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by employee, SIBS ID, department, or account..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-white border border-[#E6ECF2] rounded-xl text-xs text-[#042C51] placeholder:text-slate-400 focus:outline-none focus:border-[#FF5C28] focus:ring-1 focus:ring-[#FF5C28] transition-all"
              />
            </div>
          </div>

          {/* Department */}
          <div className="md:col-span-2 space-y-1">
            <label className="text-xs font-semibold text-slate-700">Department</label>
            <div className="relative">
              <select
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-[#E6ECF2] rounded-xl text-xs text-[#042C51] focus:outline-none focus:border-[#FF5C28] focus:ring-1 focus:ring-[#FF5C28] appearance-none pr-8 transition-all font-medium"
              >
                {departmentsList.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Account */}
          <div className="md:col-span-2 space-y-1">
            <label className="text-xs font-semibold text-slate-700">Account</label>
            <div className="relative">
              <select
                value={selectedAccount}
                onChange={(e) => setSelectedAccount(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-[#E6ECF2] rounded-xl text-xs text-[#042C51] focus:outline-none focus:border-[#FF5C28] focus:ring-1 focus:ring-[#FF5C28] appearance-none pr-8 transition-all font-medium"
              >
                {accountsList.map(acc => (
                  <option key={acc} value={acc}>{acc}</option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* From */}
          <div className="md:col-span-2 space-y-1">
            <label className="text-xs font-semibold text-slate-700">From</label>
            <div className="relative">
              <input
                type="text"
                placeholder="Select date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="w-full pl-3 pr-8 py-2 bg-white border border-[#E6ECF2] rounded-xl text-xs text-[#042C51] placeholder:text-slate-400 focus:outline-none focus:border-[#FF5C28] focus:ring-1 focus:ring-[#FF5C28] transition-all"
              />
              <Calendar className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* To */}
          <div className="md:col-span-2 space-y-1">
            <label className="text-xs font-semibold text-slate-700">To</label>
            <div className="relative">
              <input
                type="text"
                placeholder="Select date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="w-full pl-3 pr-8 py-2 bg-white border border-[#E6ECF2] rounded-xl text-xs text-[#042C51] placeholder:text-slate-400 focus:outline-none focus:border-[#FF5C28] focus:ring-1 focus:ring-[#FF5C28] transition-all"
              />
              <Calendar className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Inner Card with Table */}
        <div className="border border-[#E6ECF2] rounded-xl overflow-hidden bg-white">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse whitespace-nowrap">
              <thead>
                <tr className="bg-slate-50/70 border-b border-[#E6ECF2] text-[11px] font-black text-slate-500 tracking-wider">
                  <th className="py-3 px-3 w-20">SIBS ID</th>
                  <th className="py-3 px-3 min-w-[200px]">EMPLOYEE NAME</th>
                  <th className="py-3 px-3 min-w-[150px]">DEPARTMENT</th>
                  <th className="py-3 px-3 min-w-[130px]">ACCOUNT</th>
                  <th className="py-3 px-3 w-20">SITE</th>
                  <th className="py-3 px-3 w-28">TRACKER DATE</th>
                  <th className="py-3 px-3 min-w-[130px]">LOGIN (IN)</th>
                  <th className="py-3 px-3 w-24">START BREAK</th>
                  <th className="py-3 px-3 w-24">END BREAK</th>
                  <th className="py-3 px-3 min-w-[120px]">LOGOUT (OUT)</th>
                  <th className="py-3 px-2 text-center w-12">WH</th>
                  <th className="py-3 px-2 text-center w-12">BH</th>
                  <th className="py-3 px-2 text-center w-12">OT</th>
                  <th className="py-3 px-2 text-center w-12">ATH</th>
                  <th className="py-3 px-3 text-center w-28">STATUS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F1F5F9] text-xs">
                {filteredRecords.length === 0 ? (
                  <tr>
                    <td colSpan={15} className="py-12 text-center text-slate-400">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <Clock className="w-8 h-8 text-slate-300 stroke-[1.5]" />
                        <p className="font-bold text-xs text-slate-600">No Attendance Records Found</p>
                        <p className="text-[11px] text-slate-400">Try adjusting your filters or search keywords.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredRecords.map((rec) => {
                    const avatar = getAvatarColor(rec.employeeName);
                    const isTagum = rec.site.toUpperCase() === "TAGUM";

                    return (
                      <tr key={rec.id} className="hover:bg-slate-50/70 transition-colors">
                        {/* SIBS ID */}
                        <td className="py-3 px-3">
                          <span className="font-bold text-[#FF5C28] text-xs">{rec.sibsId}</span>
                        </td>

                        {/* EMPLOYEE NAME */}
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-2.5">
                            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold ${avatar.bg} ${avatar.text} shrink-0`}>
                              {getInitials(rec.employeeName)}
                            </div>
                            <span className="font-bold text-[#042C51] text-xs whitespace-nowrap">
                              {rec.employeeName}
                            </span>
                          </div>
                        </td>

                        {/* DEPARTMENT */}
                        <td className="py-3 px-3">
                          <span className="text-xs text-slate-600 truncate block max-w-[170px]" title={rec.department}>
                            {rec.department}
                          </span>
                        </td>

                        {/* ACCOUNT */}
                        <td className="py-3 px-3">
                          <span className="text-xs text-slate-600 truncate block max-w-[140px]" title={rec.account}>
                            {rec.account}
                          </span>
                        </td>

                        {/* SITE */}
                        <td className="py-3 px-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold border tracking-wide uppercase ${
                            isTagum
                              ? "bg-blue-50/80 text-blue-600 border-blue-200"
                              : "bg-purple-50/80 text-purple-600 border-purple-200"
                          }`}>
                            {rec.site}
                          </span>
                        </td>

                        {/* TRACKER DATE */}
                        <td className="py-3 px-3 font-medium text-slate-700 whitespace-nowrap">
                          {rec.trackerDate}
                        </td>

                        {/* LOGIN (IN) */}
                        <td className="py-3 px-3">
                          <div className="font-bold text-[#042C51] text-xs">{rec.loginTime}</div>
                          <div className="text-[10px] font-semibold text-emerald-600 flex items-center gap-1 mt-0.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            On-Time
                          </div>
                        </td>

                        {/* START BREAK */}
                        <td className="py-3 px-3 text-slate-400 font-mono text-xs">
                          {rec.startBreak}
                        </td>

                        {/* END BREAK */}
                        <td className="py-3 px-3 text-slate-400 font-mono text-xs">
                          {rec.endBreak}
                        </td>

                        {/* LOGOUT (OUT) */}
                        <td className="py-3 px-3">
                          <div className="font-bold text-slate-400 text-xs">{rec.logoutTime}</div>
                          <div className="text-[10px] font-normal text-slate-400 flex items-center gap-1 mt-0.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                            No clock-out
                          </div>
                        </td>

                        {/* WH */}
                        <td className="py-3 px-2 text-center text-slate-400 font-mono text-xs">
                          —
                        </td>

                        {/* BH */}
                        <td className="py-3 px-2 text-center text-slate-600 font-mono text-xs">
                          0
                        </td>

                        {/* OT */}
                        <td className="py-3 px-2 text-center text-blue-500 font-mono font-bold text-xs">
                          —
                        </td>

                        {/* ATH */}
                        <td className="py-3 px-2 text-center text-[#FF5C28] font-mono font-bold text-xs">
                          —
                        </td>

                        {/* STATUS */}
                        <td className="py-3 px-3 text-center">
                          <span className="px-3 py-1 rounded-full text-[11px] font-bold border border-amber-300 bg-amber-50 text-amber-700 inline-flex items-center gap-1.5 whitespace-nowrap">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                            PENDING
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          <div className="p-4 border-t border-[#E6ECF2] flex items-center justify-between text-xs text-slate-500 font-medium bg-slate-50/40">
            <div>
              Showing <span className="font-bold text-[#042C51]">1</span> to <span className="font-bold text-[#042C51]">{filteredRecords.length}</span> of <span className="font-bold text-[#042C51]">{records.length}</span> records
            </div>
            <div className="flex items-center gap-1">
              <button
                disabled
                className="px-3 py-1.5 rounded-lg border border-[#E6ECF2] bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-50 text-xs font-semibold"
              >
                Previous
              </button>
              <button className="px-3 py-1.5 rounded-lg bg-[#FF5C28] text-white font-bold text-xs shadow-xs">
                1
              </button>
              <button
                disabled
                className="px-3 py-1.5 rounded-lg border border-[#E6ECF2] bg-white text-slate-600 hover:bg-slate-50 text-xs font-semibold"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ==================== ADD / EDIT ATTENDANCE RECORD MODAL ==================== */}
      <AnimatePresence>
        {isAddEditModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl border border-[#E6ECF2] shadow-2xl max-w-lg w-full overflow-hidden"
            >
              {/* Modal header */}
              <div className="bg-[#042C51] text-white p-5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-[#FF5C28]" />
                  <h3 className="font-black text-sm">
                    {editingRecord ? "Edit Attendance Entry" : "Create Attendance Record"}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setIsAddEditModalOpen(false);
                    setEditingRecord(null);
                  }}
                  className="text-slate-300 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal form body */}
              <form onSubmit={handleSaveForm} className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  {/* SiBS ID */}
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">SiBS ID</label>
                    <input
                      type="text"
                      placeholder="e.g. 6496"
                      value={formSibsId}
                      onChange={e => setFormSibsId(e.target.value)}
                      className="bg-[#F8FAFC] border border-[#E6ECF2] rounded-xl px-3 py-2 text-xs font-bold text-[#042C51] focus:outline-none focus:ring-2 focus:ring-[#FF5C28]/20"
                      required
                    />
                  </div>

                  {/* Employee Name */}
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Employee Name</label>
                    <input
                      type="text"
                      placeholder="e.g. CANITAN, CRISTER"
                      value={formEmployeeName}
                      onChange={e => setFormEmployeeName(e.target.value)}
                      className="bg-[#F8FAFC] border border-[#E6ECF2] rounded-xl px-3 py-2 text-xs font-bold text-[#042C51] focus:outline-none focus:ring-2 focus:ring-[#FF5C28]/20"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  {/* Department */}
                  <div className="col-span-2 flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Department</label>
                    <select
                      value={formDepartment}
                      onChange={e => setFormDepartment(e.target.value)}
                      className="bg-[#F8FAFC] border border-[#E6ECF2] rounded-xl px-3 py-2 text-xs font-bold text-[#042C51] focus:outline-none"
                    >
                      {departmentsList.slice(1).map((dept, idx) => (
                        <option key={idx} value={dept}>{dept}</option>
                      ))}
                    </select>
                  </div>

                  {/* Site */}
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Site</label>
                    <select
                      value={formSite}
                      onChange={e => setFormSite(e.target.value)}
                      className="bg-[#F8FAFC] border border-[#E6ECF2] rounded-xl px-3 py-2 text-xs font-bold text-[#042C51] focus:outline-none"
                    >
                      {sitesList.map((site, idx) => (
                        <option key={idx} value={site}>{site}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Account */}
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Account</label>
                    <select
                      value={formAccount}
                      onChange={e => setFormAccount(e.target.value)}
                      className="bg-[#F8FAFC] border border-[#E6ECF2] rounded-xl px-3 py-2 text-xs font-bold text-[#042C51] focus:outline-none"
                    >
                      {accountsList.slice(1).map((acc, idx) => (
                        <option key={idx} value={acc}>{acc}</option>
                      ))}
                    </select>
                  </div>

                  {/* Tracker Date */}
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Shift Date</label>
                    <input
                      type="date"
                      value={formTrackerDate}
                      onChange={e => setFormTrackerDate(e.target.value)}
                      className="bg-[#F8FAFC] border border-[#E6ECF2] rounded-xl px-3 py-2 text-xs font-bold text-[#042C51] focus:outline-none"
                      required
                    />
                  </div>
                </div>

                {/* Timestamps Grid */}
                <div className="bg-slate-50 p-4 rounded-2xl border border-[#E6ECF2] space-y-3">
                  <span className="text-[10px] font-extrabold text-[#042C51] uppercase tracking-wide block border-b pb-1.5">
                    Shift Timestamps (Format: HH:MM AM/PM)
                  </span>
                  
                  <div className="grid grid-cols-2 gap-4">
                    {/* Login */}
                    <div className="flex flex-col gap-1">
                      <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Login Time (In)</label>
                      <input
                        type="text"
                        value={formLogin}
                        onChange={e => setFormLogin(e.target.value)}
                        placeholder="e.g. 09:00 AM"
                        className="bg-white border border-[#E6ECF2] rounded-lg px-2.5 py-1.5 text-xs font-mono font-bold text-[#042C51]"
                        required
                      />
                    </div>

                    {/* Logout */}
                    <div className="flex flex-col gap-1">
                      <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Logout Time (Out)</label>
                      <input
                        type="text"
                        value={formLogout}
                        onChange={e => setFormLogout(e.target.value)}
                        placeholder="e.g. 06:00 PM"
                        className="bg-white border border-[#E6ECF2] rounded-lg px-2.5 py-1.5 text-xs font-mono font-bold text-[#042C51]"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {/* Break Start */}
                    <div className="flex flex-col gap-1">
                      <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Start Break</label>
                      <input
                        type="text"
                        value={formStartBreak}
                        onChange={e => setFormStartBreak(e.target.value)}
                        placeholder="e.g. 12:00 PM"
                        className="bg-white border border-[#E6ECF2] rounded-lg px-2.5 py-1.5 text-xs font-mono font-bold text-[#042C51]"
                      />
                    </div>

                    {/* Break End */}
                    <div className="flex flex-col gap-1">
                      <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">End Break</label>
                      <input
                        type="text"
                        value={formEndBreak}
                        onChange={e => setFormEndBreak(e.target.value)}
                        placeholder="e.g. 01:00 PM"
                        className="bg-white border border-[#E6ECF2] rounded-lg px-2.5 py-1.5 text-xs font-mono font-bold text-[#042C51]"
                      />
                    </div>
                  </div>
                </div>

                {/* Status selection */}
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Timesheet Approval Status</label>
                  <div className="flex gap-2">
                    {["Pending", "Approved", "Rejected"].map((st) => (
                      <button
                        key={st}
                        type="button"
                        onClick={() => setFormStatus(st as any)}
                        className={`flex-1 py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                          formStatus === st
                            ? st === "Approved"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-300"
                              : st === "Rejected"
                                ? "bg-rose-50 text-rose-700 border-rose-300"
                                : "bg-amber-50 text-amber-700 border-amber-300"
                            : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50"
                        }`}
                      >
                        {st}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Form Footer buttons */}
                <div className="flex items-center justify-end gap-2 pt-4 border-t border-[#F1F5F9] mt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setIsAddEditModalOpen(false);
                      setEditingRecord(null);
                    }}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-black px-4 py-2.5 rounded-xl cursor-pointer transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-[#FF5C28] hover:bg-[#e04b1a] text-white text-xs font-black px-5 py-2.5 rounded-xl shadow-md cursor-pointer transition-colors"
                  >
                    {editingRecord ? "Save Changes" : "Submit Entry"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
