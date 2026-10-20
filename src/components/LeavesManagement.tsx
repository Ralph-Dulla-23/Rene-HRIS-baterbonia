import React, { useState, useMemo } from "react";
import {
  Calendar,
  Search,
  RotateCcw,
  Clock,
  CheckCircle,
  XCircle,
  FileText,
  User,
  Plus,
  Trash2,
  Edit2,
  Paperclip,
  Check,
  X,
  ChevronDown,
  UserCheck,
  Shield,
  AlertCircle
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export interface LeaveRecord {
  id: string;
  sibsId: string;
  employeeName: string;
  account: string;
  department: string;
  leaveType: string;
  filedDate: string;
  dateFrom: string;
  dateTo: string;
  days: number;
  credits: number;
  plotted: number;
  remaining: number;
  status: "Pending" | "Approved" | "Rejected";
  initials: string;
  avatarBg: string;
  paidLeave: boolean;
  reason: string;
  remarks: string;
  availableFrom: string;
  availableTo: string;
  justification: string;
  approverName: string;
  dateApproved: string;
  attachmentName?: string;
}

// 1:1 Initial 15 Leave Records matching user screenshot
const INITIAL_LEAVE_RECORDS: LeaveRecord[] = [
  {
    id: "LV-6185",
    sibsId: "6185",
    employeeName: "KAYZER PAUL CAÑOS",
    account: "US VISA",
    department: "Call Center Operations",
    leaveType: "Emergency",
    filedDate: "September 7, 2026",
    dateFrom: "September 6, 2026",
    dateTo: "September 6, 2026",
    days: 1,
    credits: 0,
    plotted: 0,
    remaining: 0,
    status: "Pending",
    initials: "KC",
    avatarBg: "bg-teal-100 text-teal-800",
    paidLeave: true,
    reason: "Family medical urgency requiring immediate assistance at hospital.",
    remarks: "Pending review by operations supervisor.",
    availableFrom: "January 1, 2026",
    availableTo: "December 31, 2026",
    justification: "Annual emergency leave entitlement credit.",
    approverName: "BATACAN, ALENA MENDOZA",
    dateApproved: "—",
    attachmentName: "medical_cert_admission.pdf"
  },
  {
    id: "LV-3635",
    sibsId: "3635",
    employeeName: "CHRIS JOHN SALVACION",
    account: "US VISA",
    department: "Call Center Operations",
    leaveType: "Emergency",
    filedDate: "September 7, 2026",
    dateFrom: "September 6, 2026",
    dateTo: "September 6, 2026",
    days: 1,
    credits: 0,
    plotted: 0,
    remaining: 0,
    status: "Pending",
    initials: "CS",
    avatarBg: "bg-pink-100 text-pink-800",
    paidLeave: true,
    reason: "Power disruption and localized storm outage in residential zone.",
    remarks: "Notified team lead via emergency hotline.",
    availableFrom: "January 1, 2026",
    availableTo: "December 31, 2026",
    justification: "Annual emergency leave entitlement credit.",
    approverName: "BATACAN, ALENA MENDOZA",
    dateApproved: "—"
  },
  {
    id: "LV-6200",
    sibsId: "6200",
    employeeName: "LYKA ANTH USMAN",
    account: "US VISA",
    department: "Call Center Operations",
    leaveType: "Emergency",
    filedDate: "September 7, 2026",
    dateFrom: "September 6, 2026",
    dateTo: "September 6, 2026",
    days: 1,
    credits: 0,
    plotted: 0,
    remaining: 0,
    status: "Pending",
    initials: "LU",
    avatarBg: "bg-orange-100 text-orange-800",
    paidLeave: true,
    reason: "Severe acute migraine during graveyard shift rotation.",
    remarks: "Advised to rest and consult HMO accredited clinic.",
    availableFrom: "January 1, 2026",
    availableTo: "December 31, 2026",
    justification: "Annual emergency leave entitlement credit.",
    approverName: "BATACAN, ALENA MENDOZA",
    dateApproved: "—"
  },
  {
    id: "LV-3667-1",
    sibsId: "3667",
    employeeName: "GERY QUINSAY",
    account: "ADMIN",
    department: "Management Team",
    leaveType: "Vacation / Personal",
    filedDate: "September 7, 2026",
    dateFrom: "September 26, 2026",
    dateTo: "September 26, 2026",
    days: 1,
    credits: 0,
    plotted: 0,
    remaining: 0,
    status: "Pending",
    initials: "GQ",
    avatarBg: "bg-amber-100 text-amber-800",
    paidLeave: true,
    reason: "Scheduled personal appointment and family celebration.",
    remarks: "Coverage scheduled with shift handover colleague.",
    availableFrom: "January 1, 2026",
    availableTo: "December 31, 2026",
    justification: "Annual tenure adjustment credits.",
    approverName: "BATACAN, ALENA MENDOZA",
    dateApproved: "—"
  },
  {
    id: "LV-3667-2",
    sibsId: "3667",
    employeeName: "GERY QUINSAY",
    account: "ADMIN",
    department: "Management Team",
    leaveType: "Emergency",
    filedDate: "September 7, 2026",
    dateFrom: "September 6, 2026",
    dateTo: "September 6, 2026",
    days: 1,
    credits: 0,
    plotted: 0,
    remaining: 0,
    status: "Pending",
    initials: "GQ",
    avatarBg: "bg-amber-100 text-amber-800",
    paidLeave: true,
    reason: "Urgent residential property repair and maintenance emergency.",
    remarks: "Pending endorsement from site operations manager.",
    availableFrom: "January 1, 2026",
    availableTo: "December 31, 2026",
    justification: "Annual emergency leave entitlement credit.",
    approverName: "BATACAN, ALENA MENDOZA",
    dateApproved: "—"
  },
  {
    id: "LV-6365",
    sibsId: "6365",
    employeeName: "CHESTER VONNE DELA CRUZ CAIREL",
    account: "HELPDESK",
    department: "IT (Information and Communications Technology)",
    leaveType: "Emergency",
    filedDate: "September 7, 2026",
    dateFrom: "September 6, 2026",
    dateTo: "September 6, 2026",
    days: 1,
    credits: 0,
    plotted: 0,
    remaining: 0,
    status: "Pending",
    initials: "CC",
    avatarBg: "bg-blue-100 text-blue-800",
    paidLeave: true,
    reason: "High fever and flu onset during overnight technical standby.",
    remarks: "IT escalation tickets routed to alternate on-duty technician.",
    availableFrom: "January 1, 2026",
    availableTo: "December 31, 2026",
    justification: "Annual emergency leave entitlement credit.",
    approverName: "BATACAN, ALENA MENDOZA",
    dateApproved: "—"
  },
  {
    id: "LV-6797",
    sibsId: "6797",
    employeeName: "MEL ROSE INSIPIDO",
    account: "YOMDEL",
    department: "Call Center Operations",
    leaveType: "Emergency",
    filedDate: "September 7, 2026",
    dateFrom: "September 6, 2026",
    dateTo: "September 6, 2026",
    days: 1,
    credits: 0,
    plotted: 0,
    remaining: 0,
    status: "Pending",
    initials: "MI",
    avatarBg: "bg-purple-100 text-purple-800",
    paidLeave: true,
    reason: "Family emergency requiring transit to home province.",
    remarks: "Submitted emergency slip through team portal.",
    availableFrom: "January 1, 2026",
    availableTo: "December 31, 2026",
    justification: "Annual emergency leave entitlement credit.",
    approverName: "BATACAN, ALENA MENDOZA",
    dateApproved: "—"
  },
  {
    id: "LV-4807",
    sibsId: "4807",
    employeeName: "CHRISTIAN JEFF VILLANUEVA",
    account: "YOMDEL",
    department: "Call Center Operations",
    leaveType: "Emergency",
    filedDate: "September 7, 2026",
    dateFrom: "September 6, 2026",
    dateTo: "September 6, 2026",
    days: 1,
    credits: 0,
    plotted: 0,
    remaining: 0,
    status: "Pending",
    initials: "CV",
    avatarBg: "bg-emerald-100 text-emerald-800",
    paidLeave: true,
    reason: "Acute dental pain and unscheduled root canal procedure.",
    remarks: "Dental excuse slip submitted to HR.",
    availableFrom: "January 1, 2026",
    availableTo: "December 31, 2026",
    justification: "Annual emergency leave entitlement credit.",
    approverName: "BATACAN, ALENA MENDOZA",
    dateApproved: "—",
    attachmentName: "dental_clinic_receipt.pdf"
  },
  {
    id: "LV-6496",
    sibsId: "6496",
    employeeName: "CRISTER ALBERCA CANITAN",
    account: "SOFTWARE DEV",
    department: "IT (Information and Communications Technology)",
    leaveType: "Vacation / Personal",
    filedDate: "September 7, 2026",
    dateFrom: "September 15, 2026",
    dateTo: "September 15, 2026",
    days: 1,
    credits: 0,
    plotted: 0,
    remaining: 0,
    status: "Pending",
    initials: "CC",
    avatarBg: "bg-orange-100 text-orange-800",
    paidLeave: true,
    reason: "Personal appointment for government documentary requirements.",
    remarks: "Sprint deliverables adjusted with tech lead.",
    availableFrom: "January 1, 2026",
    availableTo: "December 31, 2026",
    justification: "Annual tenure adjustment credits.",
    approverName: "BATACAN, ALENA MENDOZA",
    dateApproved: "—"
  },
  {
    id: "LV-6099",
    sibsId: "6099",
    employeeName: "ROLAND JAMES LABUS",
    account: "MANAGERS",
    department: "Management Team",
    leaveType: "Emergency",
    filedDate: "September 7, 2026",
    dateFrom: "September 6, 2026",
    dateTo: "September 6, 2026",
    days: 1,
    credits: 0,
    plotted: 0,
    remaining: 0,
    status: "Pending",
    initials: "RL",
    avatarBg: "bg-indigo-100 text-indigo-800",
    paidLeave: true,
    reason: "Sudden home electrical short circuit requiring emergency electrician inspection.",
    remarks: "Available on emergency mobile phone.",
    availableFrom: "January 1, 2026",
    availableTo: "December 31, 2026",
    justification: "Annual emergency leave entitlement credit.",
    approverName: "BATACAN, ALENA MENDOZA",
    dateApproved: "—"
  },
  {
    id: "LV-6495",
    sibsId: "6495",
    employeeName: "KRISTIAN ALLEN ANG",
    account: "SOFTWARE DEV",
    department: "IT (Information and Communications Technology)",
    leaveType: "Vacation / Personal",
    filedDate: "September 5, 2026",
    dateFrom: "September 10, 2026",
    dateTo: "September 10, 2026",
    days: 1,
    credits: 0,
    plotted: 0,
    remaining: 0,
    status: "Approved",
    initials: "KA",
    avatarBg: "bg-teal-100 text-teal-800",
    paidLeave: true,
    reason: "Attending professional software engineering symposium.",
    remarks: "Approved by Head of IT Operations.",
    availableFrom: "January 1, 2026",
    availableTo: "December 31, 2026",
    justification: "Annual tenure adjustment credits.",
    approverName: "BATACAN, ALENA MENDOZA",
    dateApproved: "September 5, 2026 02:40 PM",
    attachmentName: "conf_registration.pdf"
  },
  {
    id: "LV-4830",
    sibsId: "4830",
    employeeName: "DOROTHY FAITH ELIZA PAJAR",
    account: "YOMDEL",
    department: "Call Center Operations",
    leaveType: "Vacation / Personal",
    filedDate: "September 4, 2026",
    dateFrom: "September 8, 2026",
    dateTo: "September 8, 2026",
    days: 1,
    credits: 0,
    plotted: 0,
    remaining: 0,
    status: "Approved",
    initials: "DP",
    avatarBg: "bg-pink-100 text-pink-800",
    paidLeave: true,
    reason: "Renewal of national passport and biometric capture appointment.",
    remarks: "Advance filing compliant with 3-day notice rule.",
    availableFrom: "January 1, 2026",
    availableTo: "December 31, 2026",
    justification: "Annual tenure adjustment credits.",
    approverName: "BATACAN, ALENA MENDOZA",
    dateApproved: "September 4, 2026 04:15 PM"
  },
  {
    id: "LV-6100",
    sibsId: "6100",
    employeeName: "DEX CHAUNCEY YBAÑEZ",
    account: "MANAGERS",
    department: "Management Team",
    leaveType: "Sick Leave",
    filedDate: "September 3, 2026",
    dateFrom: "September 4, 2026",
    dateTo: "September 4, 2026",
    days: 1,
    credits: 0,
    plotted: 0,
    remaining: 0,
    status: "Approved",
    initials: "DY",
    avatarBg: "bg-amber-100 text-amber-800",
    paidLeave: true,
    reason: "Post-dental extraction recovery as advised by medical doctor.",
    remarks: "Medical certificate verified and cleared.",
    availableFrom: "January 1, 2026",
    availableTo: "December 31, 2026",
    justification: "Annual sick leave credit allotment.",
    approverName: "BATACAN, ALENA MENDOZA",
    dateApproved: "September 3, 2026 05:10 PM",
    attachmentName: "medical_clearance_fit_to_work.pdf"
  },
  {
    id: "LV-5122",
    sibsId: "5122",
    employeeName: "BEATRIZ CLAIRE MENDOZA",
    account: "AETNA",
    department: "Healthcare Operations",
    leaveType: "Emergency",
    filedDate: "September 2, 2026",
    dateFrom: "September 3, 2026",
    dateTo: "September 3, 2026",
    days: 1,
    credits: 0,
    plotted: 0,
    remaining: 0,
    status: "Approved",
    initials: "BM",
    avatarBg: "bg-purple-100 text-purple-800",
    paidLeave: true,
    reason: "Sudden home plumbing pipe burst requiring emergency shutdown.",
    remarks: "Endorsed by Healthcare Ops Manager.",
    availableFrom: "January 1, 2026",
    availableTo: "December 31, 2026",
    justification: "Annual emergency leave entitlement credit.",
    approverName: "BATACAN, ALENA MENDOZA",
    dateApproved: "September 2, 2026 01:20 PM"
  },
  {
    id: "LV-25-0026",
    sibsId: "25-0026",
    employeeName: "LUIS FERNANDO HURTADO",
    account: "PHYSICIANS FOOTCARE",
    department: "Healthcare Operations",
    leaveType: "Bereavement",
    filedDate: "September 1, 2026",
    dateFrom: "September 2, 2026",
    dateTo: "September 2, 2026",
    days: 1,
    credits: 0,
    plotted: 0,
    remaining: 0,
    status: "Approved",
    initials: "LH",
    avatarBg: "bg-blue-100 text-blue-800",
    paidLeave: true,
    reason: "Bereavement service for immediate family relative.",
    remarks: "Statutory bereavement leave granted with compassionate allowance.",
    availableFrom: "January 1, 2026",
    availableTo: "December 31, 2026",
    justification: "Statutory bereavement credit policy.",
    approverName: "BATACAN, ALENA MENDOZA",
    dateApproved: "September 1, 2026 11:30 AM",
    attachmentName: "death_certificate_memorial.pdf"
  }
];

export default function LeavesManagement() {
  const [records, setRecords] = useState<LeaveRecord[]>(INITIAL_LEAVE_RECORDS);

  // Filters State
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [selectedDepartment, setSelectedDepartment] = useState("All Departments");
  const [selectedAccount, setSelectedAccount] = useState("All Accounts");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  // Modals & Drawers
  const [activeModalRecord, setActiveModalRecord] = useState<LeaveRecord | null>(null);
  const [isAdminViewOpen, setIsAdminViewOpen] = useState(false);
  const [isAddLeaveModalOpen, setIsAddLeaveModalOpen] = useState(false);
  const [selectedRowIds, setSelectedRowIds] = useState<string[]>([]);

  // Add Form State
  const [formSibsId, setFormSibsId] = useState("");
  const [formEmployeeName, setFormEmployeeName] = useState("");
  const [formAccount, setFormAccount] = useState("US VISA");
  const [formDepartment, setFormDepartment] = useState("Call Center Operations");
  const [formLeaveType, setFormLeaveType] = useState("Emergency");
  const [formDateFrom, setFormDateFrom] = useState("September 8, 2026");
  const [formDateTo, setFormDateTo] = useState("September 8, 2026");
  const [formReason, setFormReason] = useState("");

  // Dropdown options
  const statusOptions = ["All", "Approved", "Pending", "Rejected"];
  const departmentOptions = [
    "All Departments",
    "Call Center Operations",
    "IT (Information and Communications Technology)",
    "Management Team",
    "Healthcare Operations"
  ];
  const accountOptions = [
    "All Accounts",
    "US VISA",
    "ADMIN",
    "HELPDESK",
    "YOMDEL",
    "SOFTWARE DEV",
    "MANAGERS",
    "AETNA",
    "PHYSICIANS FOOTCARE"
  ];

  // Reset Filters to exact 1:1 state
  const handleResetFilters = () => {
    setSearchTerm("");
    setSelectedStatus("All");
    setSelectedDepartment("All Departments");
    setSelectedAccount("All Accounts");
    setFromDate("");
    setToDate("");
    setRecords(INITIAL_LEAVE_RECORDS);
  };

  // Filtered dataset
  const filteredRecords = useMemo(() => {
    return records.filter(rec => {
      // Search term
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const matchesQuery =
          rec.employeeName.toLowerCase().includes(query) ||
          rec.sibsId.toLowerCase().includes(query) ||
          rec.leaveType.toLowerCase().includes(query) ||
          rec.status.toLowerCase().includes(query) ||
          rec.account.toLowerCase().includes(query);
        if (!matchesQuery) return false;
      }

      // Status
      if (selectedStatus !== "All" && rec.status !== selectedStatus) {
        return false;
      }

      // Department
      if (selectedDepartment !== "All Departments" && rec.department !== selectedDepartment) {
        return false;
      }

      // Account
      if (selectedAccount !== "All Accounts" && rec.account !== selectedAccount) {
        return false;
      }

      // Date window filter if set
      if (fromDate && rec.dateFrom < fromDate) return false;
      if (toDate && rec.dateTo > toDate) return false;

      return true;
    });
  }, [records, searchTerm, selectedStatus, selectedDepartment, selectedAccount, fromDate, toDate]);

  // Metric calculations
  const stats = useMemo(() => {
    const loaded = filteredRecords.length;
    const approved = filteredRecords.filter(r => r.status === "Approved").length;
    const pending = filteredRecords.filter(r => r.status === "Pending").length;
    const rejected = filteredRecords.filter(r => r.status === "Rejected").length;
    const pageLeaveDays = filteredRecords.reduce((sum, r) => sum + r.days, 0);
    const pageRemaining = filteredRecords.reduce((sum, r) => sum + r.remaining, 0);

    return {
      loaded,
      approved,
      pending,
      rejected,
      pageLeaveDays,
      pageRemaining
    };
  }, [filteredRecords]);

  // Quick Approve/Reject
  const handleQuickStatus = (id: string, newStatus: "Approved" | "Pending" | "Rejected") => {
    const nowStr = "September 7, 2026 05:00 PM";
    setRecords(prev =>
      prev.map(r => {
        if (r.id === id) {
          return {
            ...r,
            status: newStatus,
            dateApproved: newStatus !== "Pending" ? nowStr : "—",
            approverName: "BATACAN, ALENA MENDOZA"
          };
        }
        return r;
      })
    );
  };

  // Bulk status update
  const handleBulkStatus = (newStatus: "Approved" | "Pending" | "Rejected") => {
    const nowStr = "September 7, 2026 05:00 PM";
    setRecords(prev =>
      prev.map(r => {
        if (selectedRowIds.includes(r.id)) {
          return {
            ...r,
            status: newStatus,
            dateApproved: newStatus !== "Pending" ? nowStr : "—",
            approverName: "BATACAN, ALENA MENDOZA"
          };
        }
        return r;
      })
    );
    setSelectedRowIds([]);
  };

  // Add new leave record
  const handleSaveAddLeave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formSibsId.trim() || !formEmployeeName.trim()) return;

    const parts = formEmployeeName.trim().split(" ");
    const initials =
      parts.length >= 2
        ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
        : formEmployeeName.slice(0, 2).toUpperCase();

    const newRecord: LeaveRecord = {
      id: `LV-${formSibsId}-${Date.now()}`,
      sibsId: formSibsId.trim(),
      employeeName: formEmployeeName.trim().toUpperCase(),
      account: formAccount,
      department: formDepartment,
      leaveType: formLeaveType,
      filedDate: "September 7, 2026",
      dateFrom: formDateFrom,
      dateTo: formDateTo,
      days: 1,
      credits: 0,
      plotted: 0,
      remaining: 0,
      status: "Pending",
      initials,
      avatarBg: "bg-teal-100 text-teal-800",
      paidLeave: true,
      reason: formReason || "Standard leave request submitted via administrative view.",
      remarks: "Logged in core HR system.",
      availableFrom: "January 1, 2026",
      availableTo: "December 31, 2026",
      justification: "Annual leave entitlement credit.",
      approverName: "BATACAN, ALENA MENDOZA",
      dateApproved: "—"
    };

    setRecords(prev => [newRecord, ...prev]);
    setIsAddLeaveModalOpen(false);
    setFormSibsId("");
    setFormEmployeeName("");
    setFormReason("");
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen pb-12 select-none space-y-5" id="leaves-module-container">
      {/* ==================== 1. PAGE HEADER ==================== */}
      <div className="bg-white rounded-xl border border-[#E6ECF2] shadow-xs overflow-hidden flex flex-col" id="leaves-header-card">
        {/* Top Accent Gradient Bar: Deep Navy to Vivid Orange */}
        <div className="h-[3.5px] w-full bg-gradient-to-r from-[#042C51] via-[#c24b30] to-[#FF5C28]" />

        <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-blue-50/80 border border-blue-100 text-[#042C51] text-[10px] font-extrabold uppercase tracking-wider mb-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#FF5C28]"></span>
              CORE HR VIEW
            </div>
            <h1 className="text-2xl font-black text-[#042C51] tracking-tight">Leaves</h1>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Review employee leave requests, credits, plotted leaves, and remaining balances.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            {/* Reset Button */}
            <button
              onClick={handleResetFilters}
              title="Reset filters and reload exact 1:1 view"
              className="p-2.5 rounded-xl bg-white border border-[#E6ECF2] hover:bg-slate-50 text-slate-600 hover:text-[#042C51] transition-all shadow-xs cursor-pointer"
              id="leaves-reset-btn"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            {/* Administrative View Button */}
            <button
              onClick={() => setIsAdminViewOpen(true)}
              className="bg-[#FF5C28] hover:bg-[#e04b1a] text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-xs flex items-center gap-2 transition-all cursor-pointer"
              id="leaves-admin-view-btn"
            >
              <UserCheck className="w-4 h-4" />
              <span>Administrative View</span>
            </button>
          </div>
        </div>
      </div>

      {/* ==================== 2. METRIC CARDS (6 IN A ROW) ==================== */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4" id="leaves-metrics-grid">
        {/* Card 1: LOADED LEAVES */}
        <div className="bg-white p-5 rounded-xl border border-[#E6ECF2] shadow-xs flex items-center justify-between transition-all hover:shadow-sm">
          <div>
            <div className="text-[10px] font-black uppercase text-slate-600 tracking-wider">LOADED LEAVES</div>
            <div className="text-3xl font-black text-[#042C51] tracking-tight mt-1">{stats.loaded}</div>
            <div className="text-[11px] text-slate-400 font-medium mt-1">Records loaded on this page</div>
          </div>
          <div className="w-10 h-10 rounded-full bg-blue-50/80 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0">
            <FileText className="w-5 h-5" />
          </div>
        </div>

        {/* Card 2: APPROVED */}
        <div className="bg-white p-5 rounded-xl border border-[#E6ECF2] shadow-xs flex items-center justify-between transition-all hover:shadow-sm">
          <div>
            <div className="text-[10px] font-black uppercase text-emerald-600 tracking-wider">APPROVED</div>
            <div className="text-3xl font-black text-emerald-600 tracking-tight mt-1">{stats.approved}</div>
            <div className="text-[11px] text-slate-400 font-medium mt-1">Approved leave requests</div>
          </div>
          <div className="w-10 h-10 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
            <CheckCircle className="w-5 h-5" />
          </div>
        </div>

        {/* Card 3: PENDING */}
        <div className="bg-white p-5 rounded-xl border border-[#E6ECF2] shadow-xs flex items-center justify-between transition-all hover:shadow-sm">
          <div>
            <div className="text-[10px] font-black uppercase text-[#FF5C28] tracking-wider">PENDING</div>
            <div className="text-3xl font-black text-[#FF5C28] tracking-tight mt-1">{stats.pending}</div>
            <div className="text-[11px] text-slate-400 font-medium mt-1">Awaiting review</div>
          </div>
          <div className="w-10 h-10 rounded-full bg-orange-50 border border-orange-100 flex items-center justify-center text-[#FF5C28] shrink-0">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        {/* Card 4: REJECTED */}
        <div className="bg-white p-5 rounded-xl border border-[#E6ECF2] shadow-xs flex items-center justify-between transition-all hover:shadow-sm">
          <div>
            <div className="text-[10px] font-black uppercase text-rose-500 tracking-wider">REJECTED</div>
            <div className="text-3xl font-black text-rose-500 tracking-tight mt-1">{stats.rejected}</div>
            <div className="text-[11px] text-slate-400 font-medium mt-1">Rejected leave requests</div>
          </div>
          <div className="w-10 h-10 rounded-full bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-500 shrink-0">
            <XCircle className="w-5 h-5" />
          </div>
        </div>

        {/* Card 5: PAGE LEAVE DAYS */}
        <div className="bg-white p-5 rounded-xl border border-[#E6ECF2] shadow-xs flex items-center justify-between transition-all hover:shadow-sm">
          <div>
            <div className="text-[10px] font-black uppercase text-[#FF5C28] tracking-wider">PAGE LEAVE DAYS</div>
            <div className="text-3xl font-black text-[#FF5C28] tracking-tight mt-1">{stats.pageLeaveDays}</div>
            <div className="text-[11px] text-slate-400 font-medium mt-1">Leave days on this page</div>
          </div>
          <div className="w-10 h-10 rounded-full bg-orange-50 border border-orange-100 flex items-center justify-center text-[#FF5C28] shrink-0">
            <Calendar className="w-5 h-5" />
          </div>
        </div>

        {/* Card 6: PAGE REMAINING */}
        <div className="bg-white p-5 rounded-xl border border-[#E6ECF2] shadow-xs flex items-center justify-between transition-all hover:shadow-sm">
          <div>
            <div className="text-[10px] font-black uppercase text-emerald-600 tracking-wider">PAGE REMAINING</div>
            <div className="text-3xl font-black text-emerald-600 tracking-tight mt-1">{stats.pageRemaining}</div>
            <div className="text-[11px] text-slate-400 font-medium mt-1">Remaining leave balance</div>
          </div>
          <div className="w-10 h-10 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
            <User className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* ==================== 3. MAIN LEAVE RECORDS CARD ==================== */}
      <div className="bg-white p-5 rounded-xl border border-[#E6ECF2] shadow-xs space-y-4" id="leaves-records-card">
        {/* Card Title & Subtitle */}
        <div>
          <h2 className="text-base font-bold text-[#042C51] tracking-tight">Leave Records</h2>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Review employee leave requests, approval statuses, justifications, and attachment records.
          </p>
        </div>

        {/* Filters Bar matching 1:1 design */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end pt-1">
          {/* Search */}
          <div className="md:col-span-4 flex flex-col">
            <label className="text-xs font-semibold text-slate-700 block mb-1.5">Search</label>
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="Search by employee, SiBS ID, leave type, or status..."
                className="w-full pl-9 pr-3 py-2 bg-white border border-[#E6ECF2] rounded-xl text-xs text-[#042C51] placeholder:text-slate-400 focus:outline-none focus:border-[#FF5C28] transition-all shadow-2xs"
              />
            </div>
          </div>

          {/* Status */}
          <div className="md:col-span-2 flex flex-col">
            <label className="text-xs font-semibold text-slate-700 block mb-1.5">Status</label>
            <div className="relative">
              <select
                value={selectedStatus}
                onChange={e => setSelectedStatus(e.target.value)}
                className="w-full pl-3 pr-8 py-2 bg-white border border-[#E6ECF2] rounded-xl text-xs text-[#042C51] appearance-none focus:outline-none focus:border-[#FF5C28] transition-all cursor-pointer shadow-2xs"
              >
                {statusOptions.map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Department */}
          <div className="md:col-span-2 flex flex-col">
            <label className="text-xs font-semibold text-slate-700 block mb-1.5">Department</label>
            <div className="relative">
              <select
                value={selectedDepartment}
                onChange={e => setSelectedDepartment(e.target.value)}
                className="w-full pl-3 pr-8 py-2 bg-white border border-[#E6ECF2] rounded-xl text-xs text-[#042C51] appearance-none focus:outline-none focus:border-[#FF5C28] transition-all cursor-pointer shadow-2xs truncate"
              >
                {departmentOptions.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Account */}
          <div className="md:col-span-2 flex flex-col">
            <label className="text-xs font-semibold text-slate-700 block mb-1.5">Account</label>
            <div className="relative">
              <select
                value={selectedAccount}
                onChange={e => setSelectedAccount(e.target.value)}
                className="w-full pl-3 pr-8 py-2 bg-white border border-[#E6ECF2] rounded-xl text-xs text-[#042C51] appearance-none focus:outline-none focus:border-[#FF5C28] transition-all cursor-pointer shadow-2xs truncate"
              >
                {accountOptions.map(acc => (
                  <option key={acc} value={acc}>{acc}</option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Date Pickers (From / To) */}
          <div className="md:col-span-2 flex items-center gap-2">
            {/* From */}
            <div className="flex-1 relative">
              <label className="text-[10px] font-semibold text-slate-500 block mb-1">From</label>
              <div className="flex items-center gap-1.5 px-2.5 py-1.5 border border-[#E6ECF2] rounded-xl bg-white hover:bg-slate-50 text-xs cursor-pointer shadow-2xs">
                <Calendar className="w-3.5 h-3.5 text-[#FF5C28] shrink-0" />
                <input
                  type="date"
                  value={fromDate}
                  onChange={e => setFromDate(e.target.value)}
                  className="w-full bg-transparent text-[11px] text-slate-600 focus:outline-none cursor-pointer"
                />
              </div>
            </div>

            {/* To */}
            <div className="flex-1 relative">
              <label className="text-[10px] font-semibold text-slate-500 block mb-1">To</label>
              <div className="flex items-center gap-1.5 px-2.5 py-1.5 border border-[#E6ECF2] rounded-xl bg-white hover:bg-slate-50 text-xs cursor-pointer shadow-2xs">
                <Calendar className="w-3.5 h-3.5 text-[#FF5C28] shrink-0" />
                <input
                  type="date"
                  value={toDate}
                  onChange={e => setToDate(e.target.value)}
                  className="w-full bg-transparent text-[11px] text-slate-600 focus:outline-none cursor-pointer"
                />
              </div>
            </div>
          </div>
        </div>

        {/* ==================== 4. LEAVES TABLE ==================== */}
        <div className="border border-[#E6ECF2] rounded-xl overflow-hidden mt-3" id="leaves-table-wrapper">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#E6ECF2] bg-white text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-3 text-left w-20">SIBS ID</th>
                  <th className="py-3 px-3 min-w-[200px]">EMPLOYEE NAME</th>
                  <th className="py-3 px-3 min-w-[110px]">ACCOUNT</th>
                  <th className="py-3 px-3 min-w-[140px]">LEAVE TYPE</th>
                  <th className="py-3 px-3 min-w-[125px]">FILED</th>
                  <th className="py-3 px-3 min-w-[125px]">DATE FROM</th>
                  <th className="py-3 px-3 min-w-[125px]">DATE TO</th>
                  <th className="py-3 px-3 text-center w-14">DAYS</th>
                  <th className="py-3 px-3 text-center w-16">CREDITS</th>
                  <th className="py-3 px-3 text-center w-16">PLOTTED</th>
                  <th className="py-3 px-3 text-center w-20">REMAINING</th>
                  <th className="py-3 px-4 text-center w-28">STATUS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F1F5F9] bg-white text-xs">
                {filteredRecords.length === 0 ? (
                  <tr>
                    <td colSpan={12} className="py-12 text-center text-slate-400">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <Calendar className="w-8 h-8 text-slate-300 stroke-[1.5]" />
                        <p className="font-bold text-sm text-slate-600">No leave records found</p>
                        <p className="text-xs text-slate-400">Try adjusting your search criteria or resetting filters.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredRecords.map(rec => (
                    <tr
                      key={rec.id}
                      onClick={() => setActiveModalRecord(rec)}
                      className="hover:bg-slate-50/70 transition-colors cursor-pointer"
                    >
                      {/* SIBS ID: Orange Bold Text */}
                      <td className="py-3 px-3 font-bold text-[#FF5C28]">
                        {rec.sibsId}
                      </td>

                      {/* EMPLOYEE NAME: Avatar circle + Name */}
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2.5">
                          <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-[10px] shrink-0 ${rec.avatarBg}`}>
                            {rec.initials}
                          </div>
                          <span className="font-bold text-[#042C51] uppercase text-xs">
                            {rec.employeeName}
                          </span>
                        </div>
                      </td>

                      {/* ACCOUNT: Soft Blue Pill */}
                      <td className="py-3 px-3">
                        <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-[#EFF6FF] text-[#2563EB] border border-[#DBEAFE]">
                          {rec.account}
                        </span>
                      </td>

                      {/* LEAVE TYPE */}
                      <td className="py-3 px-3 text-slate-700 font-medium">
                        {rec.leaveType}
                      </td>

                      {/* FILED */}
                      <td className="py-3 px-3 text-slate-600">
                        {rec.filedDate}
                      </td>

                      {/* DATE FROM */}
                      <td className="py-3 px-3 text-slate-600">
                        {rec.dateFrom}
                      </td>

                      {/* DATE TO */}
                      <td className="py-3 px-3 text-slate-600">
                        {rec.dateTo}
                      </td>

                      {/* DAYS: Bold Navy */}
                      <td className="py-3 px-3 text-center font-bold text-[#042C51]">
                        {rec.days}
                      </td>

                      {/* CREDITS: Slate */}
                      <td className="py-3 px-3 text-center text-slate-600">
                        {rec.credits}
                      </td>

                      {/* PLOTTED: Orange Bold */}
                      <td className="py-3 px-3 text-center font-bold text-[#FF5C28]">
                        {rec.plotted}
                      </td>

                      {/* REMAINING: Emerald Bold */}
                      <td className="py-3 px-3 text-center font-bold text-emerald-600">
                        {rec.remaining}
                      </td>

                      {/* STATUS: Rounded Pill Badge */}
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-semibold border ${
                            rec.status === "Approved"
                              ? "bg-emerald-50/70 border-emerald-300 text-emerald-700"
                              : rec.status === "Rejected"
                              ? "bg-rose-50/70 border-rose-300 text-rose-700"
                              : "bg-amber-50/70 border-amber-300 text-amber-700"
                          }`}
                        >
                          {rec.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Table Footer */}
          <div className="bg-[#F8FAFC] border-t border-[#E6ECF2] px-5 py-3 flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Showing 1 to {filteredRecords.length} of {records.length} records</span>
            <div className="flex items-center gap-1">
              <button className="px-2.5 py-1 border border-[#E6ECF2] bg-white rounded-lg text-slate-400 cursor-not-allowed">
                Prev
              </button>
              <span className="px-3 py-1 bg-[#FF5C28] text-white rounded-lg font-bold text-xs">1</span>
              <button className="px-2.5 py-1 border border-[#E6ECF2] bg-white rounded-lg text-slate-400 cursor-not-allowed">
                Next
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ==================== 5. LEAVE DETAIL MODAL ==================== */}
      <AnimatePresence>
        {activeModalRecord && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs overflow-y-auto">
            <motion.div
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.96, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden my-8 border border-slate-100"
              onClick={e => e.stopPropagation()}
            >
              {/* Header */}
              <div className="bg-[#042C51] text-white p-5 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Calendar className="w-5 h-5 text-[#FF5C28]" />
                  <div>
                    <h3 className="font-black text-sm uppercase tracking-wider">Leave Request & Audit Slip</h3>
                    <p className="text-[11px] text-slate-300">SiBS Human Resources Information System</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveModalRecord(null)}
                  className="text-slate-300 hover:text-white transition-colors cursor-pointer p-1"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Body */}
              <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
                {/* Employee Card */}
                <div className="bg-[#F8FAFC] p-4 rounded-xl border border-[#E6ECF2] flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-11 h-11 rounded-full flex items-center justify-center font-bold text-sm ${activeModalRecord.avatarBg}`}>
                      {activeModalRecord.initials}
                    </div>
                    <div>
                      <h4 className="font-bold text-[#042C51] text-sm">{activeModalRecord.employeeName}</h4>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[11px] text-slate-400 font-bold uppercase">SiBS ID:</span>
                        <span className="text-xs font-bold text-[#FF5C28]">{activeModalRecord.sibsId}</span>
                        <span className="text-slate-300">•</span>
                        <span className="text-xs text-slate-600 font-medium">{activeModalRecord.account}</span>
                      </div>
                    </div>
                  </div>

                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold border ${
                      activeModalRecord.status === "Approved"
                        ? "bg-emerald-50 border-emerald-300 text-emerald-700"
                        : activeModalRecord.status === "Rejected"
                        ? "bg-rose-50 border-rose-300 text-rose-700"
                        : "bg-amber-50 border-amber-300 text-amber-700"
                    }`}
                  >
                    {activeModalRecord.status}
                  </span>
                </div>

                {/* Information Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
                  <div>
                    <span className="text-slate-400 font-semibold block text-[10px] uppercase">Leave Type</span>
                    <span className="font-bold text-slate-800">{activeModalRecord.leaveType}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-semibold block text-[10px] uppercase">Filed Date</span>
                    <span className="font-bold text-slate-800">{activeModalRecord.filedDate}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-semibold block text-[10px] uppercase">Duration</span>
                    <span className="font-bold text-[#042C51]">{activeModalRecord.days} {activeModalRecord.days === 1 ? "Day" : "Days"}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-semibold block text-[10px] uppercase">Date From</span>
                    <span className="font-bold text-slate-800">{activeModalRecord.dateFrom}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-semibold block text-[10px] uppercase">Date To</span>
                    <span className="font-bold text-slate-800">{activeModalRecord.dateTo}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-semibold block text-[10px] uppercase">Pay Status</span>
                    <span className="font-bold text-emerald-600">Paid Leave</span>
                  </div>
                </div>

                {/* Reason & Remarks */}
                <div className="space-y-3">
                  <div>
                    <span className="text-slate-400 font-semibold block text-[10px] uppercase mb-1">Reason for Absence</span>
                    <p className="text-xs text-slate-700 bg-slate-50 p-3 rounded-xl border border-[#E6ECF2]">
                      {activeModalRecord.reason}
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-400 font-semibold block text-[10px] uppercase mb-1">Supervisor Remarks</span>
                    <p className="text-xs text-slate-700 bg-slate-50 p-3 rounded-xl border border-[#E6ECF2]">
                      {activeModalRecord.remarks}
                    </p>
                  </div>
                </div>

                {/* Ledger Summary */}
                <div className="bg-[#F8FAFC] p-3.5 rounded-xl border border-[#E6ECF2]">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                    Leave Balance Ledger
                  </span>
                  <div className="grid grid-cols-4 gap-2 text-center">
                    <div className="bg-white p-2 rounded-lg border border-slate-100">
                      <span className="text-[10px] text-slate-400 block font-medium">Credits</span>
                      <span className="text-sm font-bold text-[#042C51]">{activeModalRecord.credits}</span>
                    </div>
                    <div className="bg-white p-2 rounded-lg border border-slate-100">
                      <span className="text-[10px] text-slate-400 block font-medium">Plotted</span>
                      <span className="text-sm font-bold text-[#FF5C28]">{activeModalRecord.plotted}</span>
                    </div>
                    <div className="bg-white p-2 rounded-lg border border-slate-100">
                      <span className="text-[10px] text-slate-400 block font-medium">Remaining</span>
                      <span className="text-sm font-bold text-emerald-600">{activeModalRecord.remaining}</span>
                    </div>
                    <div className="bg-white p-2 rounded-lg border border-slate-100">
                      <span className="text-[10px] text-slate-400 block font-medium">Validity</span>
                      <span className="text-[11px] font-bold text-slate-600">2026</span>
                    </div>
                  </div>
                </div>

                {/* Attachments */}
                {activeModalRecord.attachmentName && (
                  <div>
                    <span className="text-slate-400 font-semibold block text-[10px] uppercase mb-1">Attached Supporting Document</span>
                    <div className="flex items-center gap-2 bg-blue-50/60 border border-blue-100 px-3 py-2 rounded-xl text-xs font-bold text-blue-700">
                      <Paperclip className="w-3.5 h-3.5" />
                      <span className="flex-1 truncate">{activeModalRecord.attachmentName}</span>
                      <span className="text-[10px] bg-white px-2 py-0.5 rounded text-blue-600 border border-blue-200">Verified</span>
                    </div>
                  </div>
                )}

                {/* Approver Context */}
                <div className="text-xs text-slate-500 border-t border-[#E6ECF2] pt-3 flex items-center justify-between">
                  <span>Sign-off Authority: <strong className="text-[#042C51]">{activeModalRecord.approverName}</strong></span>
                  <span>Processed: <strong className="text-[#042C51]">{activeModalRecord.dateApproved}</strong></span>
                </div>
              </div>

              {/* Action Footer */}
              <div className="bg-[#F8FAFC] p-4 flex items-center justify-between border-t border-[#E6ECF2]">
                <div className="flex items-center gap-2">
                  {activeModalRecord.status === "Pending" ? (
                    <>
                      <button
                        onClick={() => {
                          handleQuickStatus(activeModalRecord.id, "Approved");
                          setActiveModalRecord(null);
                        }}
                        className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
                      >
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                        <span>Approve Leave</span>
                      </button>
                      <button
                        onClick={() => {
                          handleQuickStatus(activeModalRecord.id, "Rejected");
                          setActiveModalRecord(null);
                        }}
                        className="px-3.5 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
                      >
                        <X className="w-3.5 h-3.5 stroke-[3]" />
                        <span>Reject Leave</span>
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => {
                        handleQuickStatus(activeModalRecord.id, "Pending");
                        setActiveModalRecord(null);
                      }}
                      className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg text-xs font-semibold cursor-pointer"
                    >
                      Revert to Pending
                    </button>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => setActiveModalRecord(null)}
                  className="px-4 py-2 bg-[#042C51] hover:bg-[#031d36] text-white rounded-xl text-xs font-bold cursor-pointer"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ==================== 6. ADMINISTRATIVE VIEW MODAL ==================== */}
      <AnimatePresence>
        {isAdminViewOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.96, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl max-w-xl w-full overflow-hidden border border-slate-100"
            >
              <div className="bg-[#042C51] text-white p-5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-[#FF5C28]" />
                  <div>
                    <h3 className="font-black text-sm uppercase tracking-wider">Administrative Leave Management</h3>
                    <p className="text-[11px] text-slate-300">Quick batch tools, ledger policy & request submission</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAdminViewOpen(false)}
                  className="text-slate-300 hover:text-white cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div className="p-4 rounded-xl bg-orange-50/70 border border-orange-200 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-[#FF5C28] shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-[#042C51]">Administrative Authority Enabled</h4>
                    <p className="text-[11px] text-slate-600 mt-0.5">
                      You are signed in as Alena Mendoza Batacan (Core HR Administrator). You have clearance to approve all 10 pending leave requests or submit new leaves.
                    </p>
                  </div>
                </div>

                {/* Batch Actions */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-700">Batch Leave Processing</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => {
                        handleBulkStatus("Approved");
                        setIsAdminViewOpen(false);
                      }}
                      className="p-3 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl text-left transition-all cursor-pointer"
                    >
                      <div className="flex items-center gap-2 text-emerald-700 font-bold text-xs">
                        <CheckCircle className="w-4 h-4" />
                        <span>Approve All Pending</span>
                      </div>
                      <p className="text-[10px] text-emerald-600 mt-1">
                        Sign off all 10 currently pending requests in batch.
                      </p>
                    </button>

                    <button
                      onClick={() => {
                        handleBulkStatus("Rejected");
                        setIsAdminViewOpen(false);
                      }}
                      className="p-3 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl text-left transition-all cursor-pointer"
                    >
                      <div className="flex items-center gap-2 text-rose-700 font-bold text-xs">
                        <XCircle className="w-4 h-4" />
                        <span>Reject All Pending</span>
                      </div>
                      <p className="text-[10px] text-rose-600 mt-1">
                        Decline pending requests requiring resubmission.
                      </p>
                    </button>
                  </div>
                </div>

                {/* Submit on behalf */}
                <div className="border-t border-slate-100 pt-3">
                  <h4 className="text-xs font-bold text-slate-700 mb-2">Direct HR Entry</h4>
                  <button
                    onClick={() => {
                      setIsAdminViewOpen(false);
                      setIsAddLeaveModalOpen(true);
                    }}
                    className="w-full py-2.5 px-4 bg-[#FF5C28] hover:bg-[#e04b1a] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                  >
                    <Plus className="w-4 h-4 stroke-[3]" />
                    <span>File Leave on Behalf of Employee</span>
                  </button>
                </div>
              </div>

              <div className="bg-[#F8FAFC] p-4 flex items-center justify-end border-t border-[#E6ECF2]">
                <button
                  type="button"
                  onClick={() => setIsAdminViewOpen(false)}
                  className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-xs font-semibold cursor-pointer"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ==================== 7. SUBMIT LEAVE MODAL ==================== */}
      <AnimatePresence>
        {isAddLeaveModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.96, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-100"
            >
              <div className="bg-[#042C51] text-white p-5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-[#FF5C28]" />
                  <h3 className="font-bold text-sm">Submit New Leave Request</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAddLeaveModalOpen(false)}
                  className="text-slate-300 hover:text-white cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveAddLeave} className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">SiBS ID</label>
                    <input
                      type="text"
                      placeholder="e.g. 6185"
                      value={formSibsId}
                      onChange={e => setFormSibsId(e.target.value)}
                      className="w-full px-3 py-2 border border-[#E6ECF2] rounded-xl text-xs font-bold text-[#042C51] focus:outline-none focus:border-[#FF5C28]"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">Employee Name</label>
                    <input
                      type="text"
                      placeholder="e.g. KAYZER PAUL CAÑOS"
                      value={formEmployeeName}
                      onChange={e => setFormEmployeeName(e.target.value)}
                      className="w-full px-3 py-2 border border-[#E6ECF2] rounded-xl text-xs font-bold text-[#042C51] focus:outline-none focus:border-[#FF5C28]"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">Account</label>
                    <select
                      value={formAccount}
                      onChange={e => setFormAccount(e.target.value)}
                      className="w-full px-3 py-2 border border-[#E6ECF2] rounded-xl text-xs text-[#042C51] focus:outline-none focus:border-[#FF5C28]"
                    >
                      {accountOptions.slice(1).map(acc => (
                        <option key={acc} value={acc}>{acc}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">Leave Type</label>
                    <select
                      value={formLeaveType}
                      onChange={e => setFormLeaveType(e.target.value)}
                      className="w-full px-3 py-2 border border-[#E6ECF2] rounded-xl text-xs text-[#042C51] focus:outline-none focus:border-[#FF5C28]"
                    >
                      <option value="Emergency">Emergency</option>
                      <option value="Vacation / Personal">Vacation / Personal</option>
                      <option value="Sick Leave">Sick Leave</option>
                      <option value="Bereavement">Bereavement</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">Date From</label>
                    <input
                      type="text"
                      value={formDateFrom}
                      onChange={e => setFormDateFrom(e.target.value)}
                      placeholder="e.g. September 8, 2026"
                      className="w-full px-3 py-2 border border-[#E6ECF2] rounded-xl text-xs text-[#042C51]"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">Date To</label>
                    <input
                      type="text"
                      value={formDateTo}
                      onChange={e => setFormDateTo(e.target.value)}
                      placeholder="e.g. September 8, 2026"
                      className="w-full px-3 py-2 border border-[#E6ECF2] rounded-xl text-xs text-[#042C51]"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">Reason for Absence</label>
                  <textarea
                    value={formReason}
                    onChange={e => setFormReason(e.target.value)}
                    placeholder="Provide justification or reason for leave..."
                    className="w-full px-3 py-2 border border-[#E6ECF2] rounded-xl text-xs text-[#042C51] h-18 focus:outline-none focus:border-[#FF5C28]"
                    required
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsAddLeaveModalOpen(false)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-semibold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#FF5C28] hover:bg-[#e04b1a] text-white rounded-xl text-xs font-bold cursor-pointer shadow-xs"
                  >
                    Save Leave Request
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
