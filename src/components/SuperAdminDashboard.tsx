import React, { useState, useMemo } from "react";
import CentralizedFilters from "./CentralizedFilters";
import {
  ShieldCheck,
  Users,
  Activity,
  Layers,
  Clock,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  Plus,
  UserPlus,
  CheckSquare,
  PieChart,
  Settings,
  Briefcase,
  FileText,
  Search,
  Filter,
  ArrowRight,
  ExternalLink,
  ChevronRight,
  Sparkles,
  Building2,
  DollarSign,
  UserCheck,
  UserX,
  FileCheck,
  SlidersHorizontal,
  Lock,
  Eye,
  Download,
  X,
  AlertCircle
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface SuperAdminDashboardProps {
  userEmail?: string;
  onSwitchModule?: (module: string) => void;
}

// 7 Grounded Access Levels
export type AdminAccessLevel =
  | "1 - TA"
  | "2 - HR"
  | "3 - HR Admin"
  | "4 - Finance"
  | "5 - Manager"
  | "6 - Executive"
  | "7 - Super Admin";

interface AdminAccount {
  id: string;
  name: string;
  email: string;
  accessLevel: AdminAccessLevel;
  department: string;
  accountGroup: string;
  lastActive: string;
  status: "Active" | "Pending Mapping" | "Locked";
  hasAccessMismatch?: boolean;
}

interface RiskException {
  id: string;
  category:
    | "Unmapped User"
    | "Pending Resignation"
    | "Pending Leave"
    | "Attendance Flag"
    | "Recruitment Action"
    | "Stuck Approval";
  title: string;
  description: string;
  severity: "High" | "Medium" | "Low";
  moduleTarget: string;
  assignedTo: string;
  daysPending: number;
}

interface ActivityLog {
  id: string;
  timestamp: string;
  actor: string;
  accessLevel: string;
  module: string;
  action: string;
  details: string;
  status: "Success" | "Flagged" | "Info";
}

export default function SuperAdminDashboard({
  userEmail = "dulla13ralph@gmail.com",
  onSwitchModule
}: SuperAdminDashboardProps) {
  // Navigation Tabs
  const [activeTab, setActiveTab] = useState<
    "overview" | "exceptions" | "access_roles" | "ops_snapshot" | "activity_logs"
  >("overview");

  // Filter States
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedAccessLevel, setSelectedAccessLevel] = useState("All Access Levels");
  const [selectedModule, setSelectedModule] = useState("All Modules");
  const [selectedStatus, setSelectedStatus] = useState("All Statuses");
  const [selectedAccount, setSelectedAccount] = useState("All Accounts");

  // Toast Notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Add Admin Modal State
  const [isAddAdminOpen, setIsAddAdminOpen] = useState(false);
  const [newAdminName, setNewAdminName] = useState("");
  const [newAdminEmail, setNewAdminEmail] = useState("");
  const [newAdminLevel, setNewAdminLevel] = useState<AdminAccessLevel>("3 - HR Admin");
  const [newAdminDepartment, setNewAdminDepartment] = useState("Human Resources");
  const [newAdminAccount, setNewAdminAccount] = useState("Internal HR Ops");

  // Admin User Database (Grounded 7 Access Levels)
  const [adminUsers, setAdminUsers] = useState<AdminAccount[]>([
    {
      id: "ADM-001",
      name: "Ralph Dulla",
      email: "dulla13ralph@gmail.com",
      accessLevel: "7 - Super Admin",
      department: "Executive Tech",
      accountGroup: "Internal HR Ops",
      lastActive: "Today at 01:05",
      status: "Active"
    },
    {
      id: "ADM-002",
      name: "Alena Batacan",
      email: "alena.batacan@thesiblingssolutions.com",
      accessLevel: "3 - HR Admin",
      department: "People Operations",
      accountGroup: "Verizon Tech",
      lastActive: "Today at 00:45",
      status: "Active"
    },
    {
      id: "ADM-003",
      name: "Marcus Vance",
      email: "marcus.vance@thesiblingssolutions.com",
      accessLevel: "1 - TA",
      department: "Talent Acquisition",
      accountGroup: "Comcast Support",
      lastActive: "Yesterday at 18:20",
      status: "Active"
    },
    {
      id: "ADM-004",
      name: "Samantha Reed",
      email: "s.reed@thesiblingssolutions.com",
      accessLevel: "4 - Finance",
      department: "Finance & Payroll",
      accountGroup: "Aetna Health",
      lastActive: "Yesterday at 16:10",
      status: "Active"
    },
    {
      id: "ADM-005",
      name: "David Chen",
      email: "david.c@thesiblingssolutions.com",
      accessLevel: "6 - Executive",
      department: "Executive Leadership",
      accountGroup: "Internal HR Ops",
      lastActive: "3 days ago",
      status: "Active"
    },
    {
      id: "ADM-006",
      name: "Patricia Miller",
      email: "p.miller@thesiblingssolutions.com",
      accessLevel: "5 - Manager",
      department: "Technical Support",
      accountGroup: "Verizon Tech",
      lastActive: "Today at 00:12",
      status: "Active"
    },
    {
      id: "ADM-007",
      name: "Robert Taylor",
      email: "r.taylor@thesiblingssolutions.com",
      accessLevel: "2 - HR",
      department: "Employee Relations",
      accountGroup: "Global WFM",
      lastActive: "4 days ago",
      status: "Pending Mapping",
      hasAccessMismatch: true
    }
  ]);

  // Risk & Exception Items
  const [exceptions, setExceptions] = useState<RiskException[]>([
    {
      id: "EXC-101",
      category: "Unmapped User",
      title: "3 New Hires Missing Department / Account Mapping",
      description: "Employee records created in Comcast account missing cost center and manager assignment.",
      severity: "High",
      moduleTarget: "Employee Directory",
      assignedTo: "Alena Batacan",
      daysPending: 3
    },
    {
      id: "EXC-102",
      category: "Pending Resignation",
      title: "Resignation Clearance Nearing Last Working Date",
      description: "Senior Agent John Doe (SIBS-8012) resignation effective in 3 days. Exit clearance pending manager signoff.",
      severity: "High",
      moduleTarget: "Resignation Management",
      assignedTo: "HR Operations",
      daysPending: 9
    },
    {
      id: "EXC-103",
      category: "Pending Leave",
      title: "Maternity Leave Request Pending Approval > 5 Days",
      description: "Maria Santos (SIBS-3341) leave request awaiting Executive signoff for 6 days.",
      severity: "Medium",
      moduleTarget: "Leaves Management",
      assignedTo: "David Chen",
      daysPending: 6
    },
    {
      id: "EXC-104",
      category: "Attendance Flag",
      title: "14 Timecard Biometric Variances Pending Review",
      description: "Night Shift timecards flagged for missing checkout punches requiring WFM validation.",
      severity: "Medium",
      moduleTarget: "Time & Attendance",
      assignedTo: "WFM Lead",
      daysPending: 2
    },
    {
      id: "EXC-105",
      category: "Stuck Approval",
      title: "Job Requisition #REQ-409 Awaiting Budget Signoff",
      description: "DevOps Engineer requisition pending Finance budget clearance for 8 days.",
      severity: "High",
      moduleTarget: "Action Items",
      assignedTo: "Samantha Reed",
      daysPending: 8
    },
    {
      id: "EXC-106",
      category: "Recruitment Action",
      title: "2 Candidate Offers Pending Acceptance > 7 Days",
      description: "Offer letters issued 7+ days ago with no candidate response recorded.",
      severity: "Low",
      moduleTarget: "Offers & Onboarding",
      assignedTo: "Marcus Vance",
      daysPending: 7
    }
  ]);

  // System & Module Activity Logs
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([
    {
      id: "LOG-501",
      timestamp: "2026-07-22 00:52",
      actor: "dulla13ralph@gmail.com",
      accessLevel: "7 - Super Admin",
      module: "Access Governance",
      action: "UPDATED_ADMIN_LEVEL",
      details: "Updated Alena Batacan access level to 3 - HR Admin.",
      status: "Success"
    },
    {
      id: "LOG-502",
      timestamp: "2026-07-21 23:14",
      actor: "alena.batacan@thesiblingssolutions.com",
      accessLevel: "3 - HR Admin",
      module: "Employee Directory",
      action: "UPDATED_EMPLOYEE_RECORD",
      details: "Assigned department code 'TECH-SUPP' to 12 new hires.",
      status: "Success"
    },
    {
      id: "LOG-503",
      timestamp: "2026-07-21 21:40",
      actor: "marcus.vance@thesiblingssolutions.com",
      accessLevel: "1 - TA",
      module: "Candidate Pipeline",
      action: "ISSUED_OFFER_LETTER",
      details: "Generated job offer letter for candidate 'Jerome Miller'.",
      status: "Success"
    },
    {
      id: "LOG-504",
      timestamp: "2026-07-21 19:05",
      actor: "s.reed@thesiblingssolutions.com",
      accessLevel: "4 - Finance",
      module: "Payroll",
      action: "APPROVED_PAYROLL_RUN",
      details: "Approved bi-monthly payroll summary for Verizon Tech account.",
      status: "Success"
    },
    {
      id: "LOG-505",
      timestamp: "2026-07-21 17:30",
      actor: "SYSTEM_VALIDATOR",
      accessLevel: "System",
      module: "Time & Attendance",
      action: "FLAGGED_ATTENDANCE_MISMATCH",
      details: "Identified 14 unverified biometric checkout records.",
      status: "Flagged"
    }
  ]);

  // Filtered Exception Items
  const filteredExceptions = useMemo(() => {
    return exceptions.filter((exc) => {
      const matchesSearch =
        exc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        exc.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        exc.assignedTo.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesModule =
        selectedModule === "All Modules" || exc.moduleTarget.includes(selectedModule);
      return matchesSearch && matchesModule;
    });
  }, [exceptions, searchTerm, selectedModule]);

  // Filtered Admin Accounts
  const filteredAdmins = useMemo(() => {
    return adminUsers.filter((adm) => {
      const matchesSearch =
        adm.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        adm.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        adm.department.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesLevel =
        selectedAccessLevel === "All Access Levels" || adm.accessLevel === selectedAccessLevel;
      const matchesAccount =
        selectedAccount === "All Accounts" || adm.accountGroup === selectedAccount;
      const matchesStatus =
        selectedStatus === "All Statuses" || adm.status === selectedStatus;
      return matchesSearch && matchesLevel && matchesAccount && matchesStatus;
    });
  }, [adminUsers, searchTerm, selectedAccessLevel, selectedAccount, selectedStatus]);

  // Filtered Activity Logs
  const filteredLogs = useMemo(() => {
    return activityLogs.filter((log) => {
      const matchesSearch =
        log.actor.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.details.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesModule =
        selectedModule === "All Modules" || log.module.includes(selectedModule);
      return matchesSearch && matchesModule;
    });
  }, [activityLogs, searchTerm, selectedModule]);

  // Add Admin Handler
  const handleAddAdmin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAdminName || !newAdminEmail) return;

    const newAdmin: AdminAccount = {
      id: `ADM-${Math.floor(100 + Math.random() * 900)}`,
      name: newAdminName,
      email: newAdminEmail,
      accessLevel: newAdminLevel,
      department: newAdminDepartment,
      accountGroup: newAdminAccount,
      lastActive: "Just created",
      status: "Active"
    };

    setAdminUsers((prev) => [newAdmin, ...prev]);

    // Log Activity
    const newLog: ActivityLog = {
      id: `LOG-${Math.floor(500 + Math.random() * 500)}`,
      timestamp: new Date().toISOString().replace("T", " ").substring(0, 16),
      actor: userEmail,
      accessLevel: "7 - Super Admin",
      module: "Access Governance",
      action: "CREATED_ADMIN_USER",
      details: `Provisioned ${newAdminLevel} permissions for ${newAdminEmail}.`,
      status: "Success"
    };
    setActivityLogs((prev) => [newLog, ...prev]);

    setNewAdminName("");
    setNewAdminEmail("");
    setIsAddAdminOpen(false);
    triggerToast(`Added administrator account for ${newAdminEmail}`);
  };

  // Resolve Exception Handler
  const handleResolveException = (id: string, title: string) => {
    setExceptions((prev) => prev.filter((e) => e.id !== id));
    triggerToast(`Resolved exception: "${title}"`);
  };

  return (
    <div className="w-full text-[#101828] select-none space-y-6 pb-12">
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 right-8 z-50 bg-[#042C51] text-white px-5 py-3 rounded-xl shadow-2xl border border-blue-400 flex items-center gap-3 text-xs font-bold"
          >
            <Sparkles className="w-4 h-4 text-[#FF5C28]" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ==================== 1. PAGE HEADER ==================== */}
      <div className="bg-white rounded-2xl border border-[#E6ECF2] shadow-sm overflow-hidden flex flex-col">
        {/* Top Accent Gradient Bar: Deep Navy to Vivid Orange */}
        <div className="h-[3.5px] w-full bg-gradient-to-r from-[#042C51] via-[#c24b30] to-[#FF5C28]" />
        
        <div className="p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#EBF2FA] border border-[#D5E3F5] text-[#042C51] text-[10.5px] font-bold tracking-wide uppercase">
              <span className="w-2 h-2 rounded-full bg-[#FF5C28]" />
              SUPER ADMIN OPERATIONS VIEW
            </div>
              <h1 className="text-2xl sm:text-3xl font-black text-[#042C51] tracking-tight">
                Whole-System HRIS Operations & Governance
              </h1>
              <p className="text-xs text-[#667085] leading-relaxed max-w-4xl">
                Welcome back, <span className="font-bold text-[#042C51] uppercase">RALPHVINCENT.DULLA@THESIBLINGSSOLUTIONS.COM</span>. You have whole-system administrative permissions across all HRIS modules.
              </p>
            </div>

          {/* Top Quick Action Buttons */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => triggerToast("Dashboard telemetry refreshed.")}
              className="p-2.5 bg-white hover:bg-slate-50 text-slate-600 border border-slate-200 rounded-xl transition-all shadow-2xs cursor-pointer"
              title="Refresh Dashboard"
            >
              <RefreshCw className="w-4 h-4" />
            </button>

            <button
              onClick={() => setIsAddAdminOpen(true)}
              className="px-4 py-2.5 bg-white hover:bg-slate-50 text-[#042C51] border border-slate-200 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-2xs"
            >
              <UserPlus className="w-4 h-4 text-[#FF5C28]" />
              <span>Add Admin / User</span>
            </button>

            <button
              onClick={() => onSwitchModule?.("Employee Directory")}
              className="px-4 py-2.5 bg-[#FF5C28] hover:bg-[#e04b1c] text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-xs"
            >
              <Users className="w-4 h-4" />
              <span>Launch Employee Directory</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* ==================== 2. TOP METRICS SUMMARY ==================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3.5">
        {/* Metric 1: EMPLOYEES */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              EMPLOYEES
            </span>
            <div className="w-8 h-8 rounded-full bg-orange-50 flex items-center justify-center text-[#FF5C28]">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-black text-[#042C51]">520</span>
            <span className="text-[10px] font-bold bg-orange-50 text-orange-600 px-1.5 py-0.5 rounded">
              +12% MoM
            </span>
          </div>
          <div className="mt-2 flex items-center justify-between">
            <span className="text-[11px] text-slate-400">Across 11 active depts</span>
            <ChevronRight className="w-4 h-4 text-[#FF5C28]" />
          </div>
        </div>

        {/* Metric 2: ADMIN USERS */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              ADMIN USERS
            </span>
            <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-black text-[#042C51]">31</span>
            <span className="text-[10px] font-bold bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded">
              7 Access Tiers
            </span>
          </div>
          <span className="text-[11px] text-slate-400 block mt-2">TA, HR, Finance & Execs</span>
        </div>

        {/* Metric 3: ATTENDANCE FLAGS */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">
              ATTENDANCE FLAGS
            </span>
            <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-black text-[#042C51]">21</span>
            <span className="text-[10px] font-bold bg-emerald-50 text-emerald-600 px-1.5 py-0.5 rounded">
              Needs Review
            </span>
          </div>
          <span className="text-[11px] text-slate-400 block mt-2">Biometric timecard check</span>
        </div>

        {/* Metric 4: PENDING APPROVALS */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider">
              PENDING APPROVALS
            </span>
            <div className="w-8 h-8 rounded-full bg-amber-50 flex items-center justify-center text-amber-600">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-black text-[#042C51]">1</span>
            <span className="text-[10px] font-bold bg-amber-50 text-amber-700 px-1.5 py-0.5 rounded">
              Cross-Module
            </span>
          </div>
          <span className="text-[11px] text-slate-400 block mt-2">Leaves, offers & reqs</span>
        </div>

        {/* Metric 5: LEAVES & RESIGNATIONS */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-red-500 uppercase tracking-wider">
              LEAVES & RESIGNATIONS
            </span>
            <div className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center text-red-500">
              <UserX className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-black text-[#042C51]">0</span>
            <span className="text-[10px] font-bold bg-red-50 text-red-600 px-1.5 py-0.5 rounded">
              14 Leave • 4 Resig
            </span>
          </div>
          <span className="text-[11px] text-slate-400 block mt-2">Active clearance pipelines</span>
        </div>

        {/* Metric 6: RECRUITMENT FUNNEL */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">
              RECRUITMENT FUNNEL
            </span>
            <div className="w-8 h-8 rounded-full bg-purple-50 flex items-center justify-center text-purple-600">
              <Briefcase className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-black text-[#042C51]">0</span>
            <span className="text-[10px] font-bold bg-purple-50 text-purple-600 px-1.5 py-0.5 rounded">
              8 Offers Pending
            </span>
          </div>
          <span className="text-[11px] text-slate-400 block mt-2">18 open requisitions</span>
        </div>
      </div>

      {/* ==================== 3. QUICK ACTIONS BAR ==================== */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <div>
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-[#FF5C28]" />
              <h2 className="text-sm font-bold text-[#042C51]">Quick Actions</h2>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Instant shortcuts for common governance and admin tasks
            </p>
          </div>
          <span className="text-xs text-slate-400 font-medium">
            Direct Governance Links
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <button
            onClick={() => onSwitchModule?.("Employee Directory")}
            className="p-3.5 rounded-xl bg-white hover:bg-slate-50/80 border border-slate-200/80 hover:border-orange-200 text-left transition-all cursor-pointer group shadow-2xs"
          >
            <div className="w-8 h-8 rounded-lg bg-orange-50 text-[#FF5C28] flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <UserPlus className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold text-[#042C51] block">Add Employee</span>
            <span className="text-[10.5px] text-slate-400 block mt-0.5">New hire profile entry</span>
          </button>

          <button
            onClick={() => setIsAddAdminOpen(true)}
            className="p-3.5 rounded-xl bg-white hover:bg-slate-50/80 border border-slate-200/80 hover:border-orange-200 text-left transition-all cursor-pointer group shadow-2xs"
          >
            <div className="w-8 h-8 rounded-lg bg-orange-50 text-[#FF5C28] flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold text-[#042C51] block">Add Admin / User</span>
            <span className="text-[10.5px] text-slate-400 block mt-0.5">Set 7 access tiers</span>
          </button>

          <button
            onClick={() => setActiveTab("access_roles")}
            className="p-3.5 rounded-xl bg-white hover:bg-slate-50/80 border border-slate-200/80 hover:border-orange-200 text-left transition-all cursor-pointer group shadow-2xs"
          >
            <div className="w-8 h-8 rounded-lg bg-orange-50 text-[#FF5C28] flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <Lock className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold text-[#042C51] block">Manage Access</span>
            <span className="text-[10.5px] text-slate-400 block mt-0.5">Review role permissions</span>
          </button>

          <button
            onClick={() => onSwitchModule?.("Action Items")}
            className="p-3.5 rounded-xl bg-white hover:bg-slate-50/80 border border-slate-200/80 hover:border-orange-200 text-left transition-all cursor-pointer group shadow-2xs"
          >
            <div className="w-8 h-8 rounded-lg bg-orange-50 text-[#FF5C28] flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <CheckSquare className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold text-[#042C51] block">Open Approvals</span>
            <span className="text-[10.5px] text-slate-400 block mt-0.5">18 pending requests</span>
          </button>

          <button
            onClick={() => onSwitchModule?.("Available Positions")}
            className="p-3.5 rounded-xl bg-white hover:bg-slate-50/80 border border-slate-200/80 hover:border-orange-200 text-left transition-all cursor-pointer group shadow-2xs"
          >
            <div className="w-8 h-8 rounded-lg bg-orange-50 text-[#FF5C28] flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <Settings className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold text-[#042C51] block">Recruitment Setup</span>
            <span className="text-[10.5px] text-slate-400 block mt-0.5">Job reqs & available roles</span>
          </button>

          <button
            onClick={() => triggerToast("Generating whole-system cross-module analytics...")}
            className="p-3.5 rounded-xl bg-white hover:bg-slate-50/80 border border-slate-200/80 hover:border-orange-200 text-left transition-all cursor-pointer group shadow-2xs"
          >
            <div className="w-8 h-8 rounded-lg bg-orange-50 text-[#FF5C28] flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <Clock className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold text-[#042C51] block">View Reports</span>
            <span className="text-[10.5px] text-slate-400 block mt-0.5">Cross-module analytics</span>
          </button>
        </div>
      </div>

      {/* ==================== 4. NAVIGATION TABS ==================== */}
      <div className="border-b border-slate-200/80 flex items-center gap-1 sm:gap-4 overflow-x-auto pt-2">
        <button
          onClick={() => setActiveTab("overview")}
          className={`pb-3 text-xs font-bold uppercase tracking-wider flex items-center gap-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === "overview"
              ? "border-[#FF5C28] text-[#042C51]"
              : "border-transparent text-slate-500 hover:text-[#042C51]"
          }`}
        >
          <Activity className="w-4 h-4 text-[#FF5C28]" />
          OVERVIEW & TELEMETRY
        </button>

        <button
          onClick={() => setActiveTab("exceptions")}
          className={`pb-3 text-xs font-bold uppercase tracking-wider flex items-center gap-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === "exceptions"
              ? "border-[#FF5C28] text-[#042C51]"
              : "border-transparent text-slate-500 hover:text-[#042C51]"
          }`}
        >
          <AlertTriangle className="w-4 h-4" />
          RISK & EXCEPTIONS DESK
          <span className="ml-1 px-1.5 py-0.2 rounded-full bg-red-500 text-white text-[9.5px] font-bold">
            2
          </span>
        </button>

        <button
          onClick={() => setActiveTab("access_roles")}
          className={`pb-3 text-xs font-bold uppercase tracking-wider flex items-center gap-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === "access_roles"
              ? "border-[#FF5C28] text-[#042C51]"
              : "border-transparent text-slate-500 hover:text-[#042C51]"
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          ACCESS & ROLES GOVERNANCE
        </button>

        <button
          onClick={() => setActiveTab("ops_snapshot")}
          className={`pb-3 text-xs font-bold uppercase tracking-wider flex items-center gap-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === "ops_snapshot"
              ? "border-[#FF5C28] text-[#042C51]"
              : "border-transparent text-slate-500 hover:text-[#042C51]"
          }`}
        >
          <Layers className="w-4 h-4" />
          CROSS-MODULE SNAPSHOT
        </button>

        <button
          onClick={() => setActiveTab("activity_logs")}
          className={`pb-3 text-xs font-bold uppercase tracking-wider flex items-center gap-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === "activity_logs"
              ? "border-[#FF5C28] text-[#042C51]"
              : "border-transparent text-slate-500 hover:text-[#042C51]"
          }`}
        >
          <FileText className="w-4 h-4" />
          SYSTEM & MODULE ACTIVITY
        </button>
      </div>

      {/* ==================== TAB 1: OVERVIEW & TELEMETRY ==================== */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* Quick Summary Cards (4 Columns) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {/* Card 1: CORE HR SCOPE */}
            <div className="p-5 rounded-2xl border border-slate-200/80 bg-white shadow-2xs space-y-2 flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider block">
                  CORE HR SCOPE
                </span>
                <div className="text-xl font-black text-[#042C51] mt-1">520 Active Staff</div>
                <p className="text-xs text-slate-500 mt-1">
                  11 Departments • 0 Pending Leaves • 1 Approvals
                </p>
              </div>
              <button
                onClick={() => onSwitchModule?.("Employee Directory")}
                className="text-xs font-bold text-[#FF5C28] hover:underline flex items-center gap-1 pt-2 cursor-pointer"
              >
                Open HR Directory &gt;
              </button>
            </div>

            {/* Card 2: TALENT ACQUISITION (TA) */}
            <div className="p-5 rounded-2xl border border-slate-200/80 bg-white shadow-2xs space-y-2 flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider block">
                  TALENT ACQUISITION (TA)
                </span>
                <div className="text-xl font-black text-[#042C51] mt-1">0 Active Pipeline</div>
                <p className="text-xs text-slate-500 mt-1">
                  Live Requisitions & Candidate Pipeline
                </p>
              </div>
              <button
                onClick={() => onSwitchModule?.("Applicant Leads")}
                className="text-xs font-bold text-[#FF5C28] hover:underline flex items-center gap-1 pt-2 cursor-pointer"
              >
                Open TA Pipeline &gt;
              </button>
            </div>

            {/* Card 3: OPERATIONS MANAGEMENT (OM) */}
            <div className="p-5 rounded-2xl border border-slate-200/80 bg-white shadow-2xs space-y-2 flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider block">
                  OPERATIONS MANAGEMENT (OM)
                </span>
                <div className="text-xl font-black text-[#042C51] mt-1">Live Client Accounts</div>
                <p className="text-xs text-slate-500 mt-1">
                  Department Staffing & Shift Capacity
                </p>
              </div>
              <button
                onClick={() => onSwitchModule?.("OM Dashboard")}
                className="text-xs font-bold text-[#FF5C28] hover:underline flex items-center gap-1 pt-2 cursor-pointer"
              >
                Open OM Dashboard &gt;
              </button>
            </div>

            {/* Card 4: FINANCE & GOVERNANCE */}
            <div className="p-5 rounded-2xl border border-slate-200/80 bg-white shadow-2xs space-y-2 flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider block">
                  FINANCE & GOVERNANCE
                </span>
                <div className="text-xl font-black text-[#042C51] mt-1">System Governance</div>
                <p className="text-xs text-slate-500 mt-1">
                  1 Cross-Module Approval Requests
                </p>
              </div>
              <button
                onClick={() => onSwitchModule?.("Action Items")}
                className="text-xs font-bold text-[#FF5C28] hover:underline flex items-center gap-1 pt-2 cursor-pointer"
              >
                Open Approvals &gt;
              </button>
            </div>
          </div>

          {/* Priority Attention Banner */}
          <div className="p-5 rounded-2xl bg-[#042C51] text-white shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-[#FF5C28]" />
                <h3 className="text-sm font-bold text-white">
                  Super Admin Operational Focus Items
                </h3>
                <span className="text-[10.5px] bg-[#073866] text-slate-200 border border-blue-400/20 px-2.5 py-0.5 rounded-full font-bold ml-1">
                  2 Active Desk Exceptions
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                There are currently 2 items flagged in the Risk & Exceptions Desk requiring Super Admin or HR Director review.
              </p>
            </div>

            <div className="flex items-center gap-2.5 shrink-0">
              <button
                onClick={() => setActiveTab("exceptions")}
                className="px-4 py-2 bg-[#FF5C28] hover:bg-[#e04b1c] text-white rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-sm"
              >
                View Risk Desk <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => onSwitchModule?.("Action Items")}
                className="px-4 py-2 bg-[#073866] hover:bg-[#09457d] text-white rounded-xl text-xs font-bold transition-all border border-blue-400/20 cursor-pointer"
              >
                Review Approval Queue
              </button>
            </div>
          </div>
        </div>
      )}

          {/* ==================== TAB 2: RISK & EXCEPTIONS DESK ==================== */}
          {activeTab === "exceptions" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-[#042C51] uppercase tracking-wide">
                    Risk & Exception Escalation Desk ({filteredExceptions.length})
                  </h3>
                  <p className="text-xs text-[#667085]">
                    System-wide exceptions: unmapped accounts, pending resignations near last working date, delayed leave approvals, and stuck requisitions.
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {filteredExceptions.map((exc) => (
                  <div
                    key={exc.id}
                    className="p-4 rounded-xl border border-[#E6ECF2] bg-white hover:border-[#FF5C28]/40 transition-all shadow-2xs space-y-2"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                            exc.severity === "High"
                              ? "bg-red-100 text-red-800"
                              : exc.severity === "Medium"
                              ? "bg-amber-100 text-amber-800"
                              : "bg-blue-100 text-blue-800"
                          }`}
                        >
                          {exc.severity} Severity
                        </span>
                        <span className="text-xs font-black text-[#042C51]">{exc.title}</span>
                      </div>

                      <div className="flex items-center gap-2 text-[11px] text-slate-500 font-medium">
                        <span>Target: <strong>{exc.moduleTarget}</strong></span>
                        <span>•</span>
                        <span>Pending: <strong className="text-amber-700">{exc.daysPending} days</strong></span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-600">{exc.description}</p>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                      <span className="text-[11px] text-slate-500 font-semibold">
                        Assigned: <strong className="text-[#042C51]">{exc.assignedTo}</strong>
                      </span>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => onSwitchModule?.(exc.moduleTarget)}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-[#042C51] rounded-lg text-[10px] font-bold cursor-pointer"
                        >
                          Open Module
                        </button>
                        <button
                          onClick={() => handleResolveException(exc.id, exc.title)}
                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10px] font-bold cursor-pointer"
                        >
                          Mark Resolved
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

                {filteredExceptions.length === 0 && (
                  <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
                    <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                    <p className="text-xs font-bold text-[#042C51]">No Risk Exceptions Found</p>
                    <p className="text-[11px] text-slate-400">All cross-module requests are within normal threshold times.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ==================== TAB 3: ACCESS & ROLES GOVERNANCE ==================== */}
          {activeTab === "access_roles" && (
            <div className="space-y-6">
              {/* Access Levels Legend */}
              <div className="bg-slate-50 p-4 rounded-xl border border-[#E6ECF2] space-y-3">
                <h3 className="text-xs font-black text-[#042C51] uppercase tracking-wider flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-[#FF5C28]" />
                  Grounded 7 Admin Access Levels Hierarchy
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 text-[10px] font-bold">
                  <div className="p-2 bg-white rounded-lg border border-slate-200 text-center">
                    <span className="block text-[#FF5C28]">1 - TA</span>
                    <span className="text-slate-500 font-medium">Recruitment & Sourcing</span>
                  </div>
                  <div className="p-2 bg-white rounded-lg border border-slate-200 text-center">
                    <span className="block text-[#042C51]">2 - HR</span>
                    <span className="text-slate-500 font-medium">HR Support & Tickets</span>
                  </div>
                  <div className="p-2 bg-white rounded-lg border border-slate-200 text-center">
                    <span className="block text-[#042C51]">3 - HR Admin</span>
                    <span className="text-slate-500 font-medium">Full HR Ops Control</span>
                  </div>
                  <div className="p-2 bg-white rounded-lg border border-slate-200 text-center">
                    <span className="block text-[#042C51]">4 - Finance</span>
                    <span className="text-slate-500 font-medium">Payroll & Costing</span>
                  </div>
                  <div className="p-2 bg-white rounded-lg border border-slate-200 text-center">
                    <span className="block text-[#042C51]">5 - Manager</span>
                    <span className="text-slate-500 font-medium">Team & Approval Head</span>
                  </div>
                  <div className="p-2 bg-white rounded-lg border border-slate-200 text-center">
                    <span className="block text-[#042C51]">6 - Executive</span>
                    <span className="text-slate-500 font-medium">Executive Reporting</span>
                  </div>
                  <div className="p-2 bg-[#042C51] text-white rounded-lg text-center">
                    <span className="block text-[#FF5C28]">7 - Super Admin</span>
                    <span className="text-slate-200 font-medium">Full System Oversight</span>
                  </div>
                </div>
              </div>

              {/* Admin Users Table */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-[#042C51] uppercase tracking-wide">
                    Admin Users & Access Levels ({filteredAdmins.length})
                  </h3>
                  <button
                    onClick={() => setIsAddAdminOpen(true)}
                    className="px-3 py-1.5 bg-[#042C51] text-white rounded-lg text-xs font-bold hover:bg-[#063866] flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    New Admin Account
                  </button>
                </div>

                <div className="overflow-x-auto border border-[#E6ECF2] rounded-xl">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#F8FAFC] border-b border-[#E6ECF2] text-[10px] font-black text-[#667085] uppercase tracking-wider">
                      <tr>
                        <th className="py-3 px-4">User Name & Email</th>
                        <th className="py-3 px-4">Grounded Access Level</th>
                        <th className="py-3 px-4">Department</th>
                        <th className="py-3 px-4">Account Group</th>
                        <th className="py-3 px-4">Last Active</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E6ECF2] font-medium text-[#042C51]">
                      {filteredAdmins.map((adm) => (
                        <tr key={adm.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3 px-4">
                            <div className="font-bold text-xs">{adm.name}</div>
                            <div className="text-[10px] text-slate-400 font-mono">{adm.email}</div>
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                                adm.accessLevel.includes("7")
                                  ? "bg-[#042C51] text-white"
                                  : adm.accessLevel.includes("3")
                                  ? "bg-blue-100 text-blue-800"
                                  : "bg-slate-100 text-slate-800"
                              }`}
                            >
                              {adm.accessLevel}
                            </span>
                          </td>
                          <td className="py-3 px-4 font-semibold">{adm.department}</td>
                          <td className="py-3 px-4 text-slate-600">{adm.accountGroup}</td>
                          <td className="py-3 px-4 text-slate-400 text-[11px]">{adm.lastActive}</td>
                          <td className="py-3 px-4">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                adm.status === "Active"
                                  ? "bg-emerald-100 text-emerald-800"
                                  : "bg-amber-100 text-amber-800"
                              }`}
                            >
                              {adm.status}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <button
                              onClick={() => triggerToast(`Opening access editor for ${adm.email}`)}
                              className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-[#042C51] rounded text-[10px] font-bold cursor-pointer"
                            >
                              Edit Access
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ==================== TAB 4: CROSS-MODULE SNAPSHOT ==================== */}
          {activeTab === "ops_snapshot" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Module 1: HR Operations */}
                <div className="p-5 rounded-xl border border-[#E6ECF2] bg-white space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <span className="text-xs font-black text-[#042C51] uppercase tracking-wider flex items-center gap-1.5">
                      <Users className="w-4 h-4 text-[#FF5C28]" />
                      Core HR & Employee Operations
                    </span>
                    <button
                      onClick={() => onSwitchModule?.("Employee Master Database")}
                      className="text-[10px] font-bold text-[#FF5C28] hover:underline cursor-pointer"
                    >
                      Open Module →
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="p-3 bg-slate-50 rounded-lg">
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">Master Headcount</span>
                      <strong className="text-base text-[#042C51]">2,840 Staff</strong>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-lg">
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">Active Departments</span>
                      <strong className="text-base text-[#042C51]">18 Depts</strong>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-lg">
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">Pending Leaves</span>
                      <strong className="text-base text-amber-600">14 Active</strong>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-lg">
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">Resignation Queue</span>
                      <strong className="text-base text-red-600">4 Staff</strong>
                    </div>
                  </div>
                </div>

                {/* Module 2: Talent Acquisition */}
                <div className="p-5 rounded-xl border border-[#E6ECF2] bg-white space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <span className="text-xs font-black text-[#042C51] uppercase tracking-wider flex items-center gap-1.5">
                      <Briefcase className="w-4 h-4 text-[#FF5C28]" />
                      Talent Acquisition & Sourcing
                    </span>
                    <button
                      onClick={() => onSwitchModule?.("Candidate Pipeline")}
                      className="text-[10px] font-bold text-[#FF5C28] hover:underline cursor-pointer"
                    >
                      Open Module →
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="p-3 bg-slate-50 rounded-lg">
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">Candidate Pipeline</span>
                      <strong className="text-base text-[#042C51]">142 Candidates</strong>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-lg">
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">Open Requisitions</span>
                      <strong className="text-base text-[#042C51]">18 Positions</strong>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-lg">
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">Offers Outstanding</span>
                      <strong className="text-base text-indigo-600">8 Issued</strong>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-lg">
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">Active Onboarding</span>
                      <strong className="text-base text-emerald-600">15 In Progress</strong>
                    </div>
                  </div>
                </div>

                {/* Module 3: Operations Management */}
                <div className="p-5 rounded-xl border border-[#E6ECF2] bg-white space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <span className="text-xs font-black text-[#042C51] uppercase tracking-wider flex items-center gap-1.5">
                      <Building2 className="w-4 h-4 text-[#FF5C28]" />
                      Operations Management (OM)
                    </span>
                    <button
                      onClick={() => onSwitchModule?.("OM Overview")}
                      className="text-[10px] font-bold text-[#FF5C28] hover:underline cursor-pointer"
                    >
                      Open Module →
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="p-3 bg-slate-50 rounded-lg">
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">Account Groups</span>
                      <strong className="text-base text-[#042C51]">5 Client Accounts</strong>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-lg">
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">Hiring Needs</span>
                      <strong className="text-base text-[#042C51]">12 Requests</strong>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-lg">
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">Recruiter Load</span>
                      <strong className="text-base text-slate-700">4 Active TA Leads</strong>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-lg">
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">Operation Capacity</span>
                      <strong className="text-base text-emerald-600">84% Staffed</strong>
                    </div>
                  </div>
                </div>

                {/* Module 4: Finance & Payroll */}
                <div className="p-5 rounded-xl border border-[#E6ECF2] bg-white space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <span className="text-xs font-black text-[#042C51] uppercase tracking-wider flex items-center gap-1.5">
                      <DollarSign className="w-4 h-4 text-[#FF5C28]" />
                      Finance & Payroll Summary
                    </span>
                    <button
                      onClick={() => onSwitchModule?.("Payroll")}
                      className="text-[10px] font-bold text-[#FF5C28] hover:underline cursor-pointer"
                    >
                      Open Module →
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="p-3 bg-slate-50 rounded-lg">
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">Current Payroll Cycle</span>
                      <strong className="text-base text-[#042C51]">July 16 - 31, 2026</strong>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-lg">
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">Payroll Status</span>
                      <strong className="text-base text-emerald-600">Approved</strong>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-lg">
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">Budget Requests</span>
                      <strong className="text-base text-amber-600">3 Pending Clearance</strong>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-lg">
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">Reports & Audits</span>
                      <strong className="text-base text-[#042C51]">Monthly Summary Ready</strong>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ==================== TAB 5: SYSTEM & MODULE ACTIVITY ==================== */}
          {activeTab === "activity_logs" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-[#042C51] uppercase tracking-wide">
                    System & Module Activity Audit Log ({filteredLogs.length})
                  </h3>
                  <p className="text-xs text-[#667085]">
                    Recorded user actions, approval request updates, and access level modifications.
                  </p>
                </div>
                <button
                  onClick={() => triggerToast("Activity log exported to CSV format.")}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-[#042C51] rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  Export Activity Log
                </button>
              </div>

              <div className="overflow-x-auto border border-[#E6ECF2] rounded-xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#F8FAFC] border-b border-[#E6ECF2] text-[10px] font-black text-[#667085] uppercase tracking-wider">
                    <tr>
                      <th className="py-3 px-4">Timestamp</th>
                      <th className="py-3 px-4">User Actor</th>
                      <th className="py-3 px-4">Access Level</th>
                      <th className="py-3 px-4">Module</th>
                      <th className="py-3 px-4">Action Taken</th>
                      <th className="py-3 px-4">Log Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E6ECF2] font-medium text-[#042C51]">
                    {filteredLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-4 font-mono text-[11px] text-slate-400">{log.timestamp}</td>
                        <td className="py-3 px-4 font-bold">{log.actor}</td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 bg-slate-100 rounded text-[10px] font-bold text-slate-700">
                            {log.accessLevel}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-semibold text-[#042C51]">{log.module}</td>
                        <td className="py-3 px-4">
                          <span className="font-mono text-[11px] text-[#FF5C28] font-bold">{log.action}</span>
                        </td>
                        <td className="py-3 px-4 text-slate-600 text-[11px]">{log.details}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

      {/* Floating SiBS Assistant Button */}
      <button
        onClick={() => triggerToast("SiBS AI Assistant is ready to help with whole-system HRIS inquiries.")}
        className="fixed bottom-6 right-6 z-40 bg-[#042C51] hover:bg-[#063560] text-white pl-2 pr-4 py-2 rounded-full shadow-2xl flex items-center gap-2.5 border border-blue-400/30 text-xs font-bold transition-all hover:scale-105 active:scale-95 cursor-pointer"
      >
        <div className="w-6 h-6 rounded-full bg-[#FF5C28] flex items-center justify-center text-white">
          <Sparkles className="w-3.5 h-3.5" />
        </div>
        <span>SiBS Assistant</span>
      </button>

      {/* ==================== ADD ADMIN MODAL ==================== */}
      <AnimatePresence>
        {isAddAdminOpen && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <UserPlus className="w-5 h-5 text-[#FF5C28]" />
                  <h3 className="text-base font-bold text-[#042C51]">Add Admin User</h3>
                </div>
                <button
                  onClick={() => setIsAddAdminOpen(false)}
                  className="text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleAddAdmin} className="space-y-3 text-xs">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Maria Santos"
                    value={newAdminName}
                    onChange={(e) => setNewAdminName(e.target.value)}
                    className="w-full bg-[#F8FAFC] border border-[#E6ECF2] rounded-xl px-3 py-2 text-xs font-medium text-[#042C51] focus:outline-none focus:ring-2 focus:ring-[#FF5C28]/20"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                    Work Email
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. maria.s@thesiblingssolutions.com"
                    value={newAdminEmail}
                    onChange={(e) => setNewAdminEmail(e.target.value)}
                    className="w-full bg-[#F8FAFC] border border-[#E6ECF2] rounded-xl px-3 py-2 text-xs font-medium text-[#042C51] focus:outline-none focus:ring-2 focus:ring-[#FF5C28]/20"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                    Grounded Access Level (1-7)
                  </label>
                  <select
                    value={newAdminLevel}
                    onChange={(e) => setNewAdminLevel(e.target.value as AdminAccessLevel)}
                    className="w-full bg-[#F8FAFC] border border-[#E6ECF2] rounded-xl px-3 py-2 text-xs font-bold text-[#042C51] focus:outline-none focus:ring-2 focus:ring-[#FF5C28]/20"
                  >
                    <option value="1 - TA">1 - TA (Talent Acquisition)</option>
                    <option value="2 - HR">2 - HR (HR Support)</option>
                    <option value="3 - HR Admin">3 - HR Admin (HR Ops Admin)</option>
                    <option value="4 - Finance">4 - Finance (Payroll & Finance)</option>
                    <option value="5 - Manager">5 - Manager (People Manager)</option>
                    <option value="6 - Executive">6 - Executive (Executive View)</option>
                    <option value="7 - Super Admin">7 - Super Admin (Whole-System Oversight)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                    Department
                  </label>
                  <input
                    type="text"
                    value={newAdminDepartment}
                    onChange={(e) => setNewAdminDepartment(e.target.value)}
                    className="w-full bg-[#F8FAFC] border border-[#E6ECF2] rounded-xl px-3 py-2 text-xs font-medium text-[#042C51] focus:outline-none focus:ring-2 focus:ring-[#FF5C28]/20"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                    Account Group
                  </label>
                  <select
                    value={newAdminAccount}
                    onChange={(e) => setNewAdminAccount(e.target.value)}
                    className="w-full bg-[#F8FAFC] border border-[#E6ECF2] rounded-xl px-3 py-2 text-xs font-bold text-[#042C51] focus:outline-none focus:ring-2 focus:ring-[#FF5C28]/20"
                  >
                    <option value="Verizon Tech">Verizon Tech</option>
                    <option value="Comcast Support">Comcast Support</option>
                    <option value="Aetna Health">Aetna Health</option>
                    <option value="Internal HR Ops">Internal HR Ops</option>
                    <option value="Global WFM">Global WFM</option>
                  </select>
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsAddAdminOpen(false)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-[#042C51] rounded-xl text-xs font-bold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#042C51] hover:bg-[#063866] text-white rounded-xl text-xs font-bold cursor-pointer"
                  >
                    Save Admin Account
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
