import React, { useState, useMemo, useEffect } from "react";
import {
  Briefcase,
  Users,
  CalendarDays,
  Clock3,
  XCircle,
  Plus,
  RefreshCw,
  Search,
  SlidersHorizontal,
  X,
  CheckCircle,
  AlertCircle,
  MapPin,
  FileText,
  Check,
  Info,
  ArrowRight,
  Layers,
  HelpCircle,
  TrendingUp,
  Inbox,
  Sparkles,
  Filter
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import {
  loadFromLocalStorage,
  saveToLocalStorage,
  STORAGE_KEYS,
  broadcastDataChange
} from "../data/recruitmentStore";

interface HiringNeedsIntakeProps {
  userEmail?: string;
  onSwitchModule?: (module: string) => void;
}

interface PersonnelRequisition {
  id: string; // e.g., PR-2026-001
  requestType: "Requisition" | "Downsize";
  department: string;
  account: string;
  jobTitle: string;
  jdCode: string;
  headcount: number;
  reason: string;
  location: string;
  dateNeeded: string;
  status: "For Approval" | "Approved" | "Not Approved";
  filedBy: { name: string; role: string };
  remarks?: string;
  history: { date: string; action: string; actor: string; remarks?: string }[];
}

// Initial Default PR Data
export const INITIAL_REQUISITIONS: PersonnelRequisition[] = [
  {
    id: "PR-2026-001",
    requestType: "Requisition",
    department: "Telecom & Tech Support",
    account: "Comcast Technical",
    jobTitle: "Technical Support Rep (CSR)",
    jdCode: "JD-CSR-TEL-04",
    headcount: 25,
    reason: "Ramp-up",
    location: "Davao",
    dateNeeded: "2026-08-01",
    status: "Approved",
    filedBy: { name: "Shiela Delos Reyes", role: "Operations Manager" },
    remarks: "Approved as per client request for Q3 forecast expansion.",
    history: [
      { date: "2026-07-10", action: "Filed Requisition", actor: "Shiela Delos Reyes" },
      { date: "2026-07-12", action: "Approved PR Request", actor: "Alena Batacan", remarks: "Forecast validated and approved." }
    ]
  },
  {
    id: "PR-2026-002",
    requestType: "Requisition",
    department: "Healthcare & Insurance",
    account: "UnitedHealth VIP",
    jobTitle: "Tier 2 Technical Specialist",
    jdCode: "JD-TECH-HC-09",
    headcount: 10,
    reason: "Forecasted Growth",
    location: "Tagum",
    dateNeeded: "2026-08-15",
    status: "For Approval",
    filedBy: { name: "Renz Torres", role: "Team Leader" },
    history: [
      { date: "2026-07-15", action: "Filed Requisition", actor: "Renz Torres" }
    ]
  },
  {
    id: "PR-2026-003",
    requestType: "Requisition",
    department: "Financial Services Group",
    account: "Chase Credit",
    jobTitle: "Fraud & Disputes Specialist",
    jdCode: "JD-FIN-FRD-01",
    headcount: 5,
    reason: "Backfill",
    location: "Mabini",
    dateNeeded: "2026-07-28",
    status: "Approved",
    filedBy: { name: "Mark Sarmiento", role: "Team Leader" },
    remarks: "Immediate backfill to cover two sudden resignations last week.",
    history: [
      { date: "2026-07-11", action: "Filed Requisition", actor: "Mark Sarmiento" },
      { date: "2026-07-13", action: "Approved PR Request", actor: "Alena Batacan" }
    ]
  },
  {
    id: "PR-2026-004",
    requestType: "Downsize",
    department: "Retail & E-Commerce",
    account: "Amazon Care",
    jobTitle: "Seasonal Support Rep",
    jdCode: "JD-RET-SEA-11",
    headcount: 15,
    reason: "Forecasted Growth",
    location: "Davao",
    dateNeeded: "2026-09-01",
    status: "Not Approved",
    filedBy: { name: "Mark Sarmiento", role: "Team Leader" },
    remarks: "Declined. Seasonal ramping must terminate under standard contract terms without formal downsize logging.",
    history: [
      { date: "2026-07-12", action: "Filed Downsize Notification", actor: "Mark Sarmiento" },
      { date: "2026-07-14", action: "Declined Downsize", actor: "Alena Batacan", remarks: "Standard contract terms apply." }
    ]
  },
  {
    id: "PR-2026-005",
    requestType: "Requisition",
    department: "Telecom & Tech Support",
    account: "Verizon Tech",
    jobTitle: "Team Leader / Supervisor",
    jdCode: "JD-MGR-TL-02",
    headcount: 2,
    reason: "New Position",
    location: "Mabini",
    dateNeeded: "2026-08-10",
    status: "For Approval",
    filedBy: { name: "Shiela Delos Reyes", role: "Operations Manager" },
    history: [
      { date: "2026-07-18", action: "Filed Requisition", actor: "Shiela Delos Reyes" }
    ]
  },
  {
    id: "PR-2026-006",
    requestType: "Requisition",
    department: "Healthcare & Insurance",
    account: "UnitedHealth VIP",
    jobTitle: "Claim Processor Agent",
    jdCode: "JD-HC-CLM-03",
    headcount: 8,
    reason: "Ramp-up",
    location: "Davao",
    dateNeeded: "2026-08-12",
    status: "For Approval",
    filedBy: { name: "Renz Torres", role: "Team Leader" },
    history: [
      { date: "2026-07-19", action: "Filed Requisition", actor: "Renz Torres" }
    ]
  }
];

export default function HiringNeedsIntake({ userEmail, onSwitchModule }: HiringNeedsIntakeProps) {
  // --- STATE ---
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [locationFilter, setLocationFilter] = useState("All");
  const [reasonFilter, setReasonFilter] = useState("All");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedPR, setSelectedPR] = useState<PersonnelRequisition | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Simulation role selection to let user experience TL, OM, HR views
  const [userRoleContext, setUserRoleContext] = useState<"HR Admin" | "Operations Manager" | "Team Leader">("HR Admin");

  // Requisitions backed by LocalStorage
  const [requisitions, setRequisitions] = useState<PersonnelRequisition[]>(() =>
    loadFromLocalStorage(STORAGE_KEYS.HIRING_NEEDS, INITIAL_REQUISITIONS)
  );

  // Sync to localStorage
  useEffect(() => {
    saveToLocalStorage(STORAGE_KEYS.HIRING_NEEDS, requisitions);
    broadcastDataChange("hiring_needs");
  }, [requisitions]);

  // Listen for storage updates
  useEffect(() => {
    const handleStoreUpdate = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail?.channel === "hiring_needs" || customEvent.detail?.channel === "all") {
        setRequisitions(prev => {
          const fresh = loadFromLocalStorage(STORAGE_KEYS.HIRING_NEEDS, INITIAL_REQUISITIONS);
          return JSON.stringify(prev) === JSON.stringify(fresh) ? prev : fresh;
        });
      }
    };
    window.addEventListener("sibs_store_update", handleStoreUpdate);
    return () => window.removeEventListener("sibs_store_update", handleStoreUpdate);
  }, []);

  // --- FORM STATE ---
  const [newRequestType, setNewRequestType] = useState<"Requisition" | "Downsize">("Requisition");
  const [newDepartment, setNewDepartment] = useState("Telecom & Tech Support");
  const [newAccount, setNewAccount] = useState("Verizon Tech");
  const [newJobTitle, setNewJobTitle] = useState("");
  const [newJdCode, setNewJdCode] = useState("JD-CSR-TEL-04");
  const [newHeadcount, setNewHeadcount] = useState<number>(1);
  const [newReason, setNewReason] = useState("Ramp-up");
  const [newLocation, setNewLocation] = useState("Davao");
  const [newDateNeeded, setNewDateNeeded] = useState("2026-08-15");
  const [remarksInput, setRemarksInput] = useState("");

  // Toast Trigger
  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // --- DERIVED METRICS ---
  const stats = useMemo(() => {
    let total = 0;
    let pending = 0;
    let approved = 0;
    let rejected = 0;
    let totalHeadcount = 0;

    let reqHiringReason: Record<string, number> = { "Ramp-up": 0, "Backfill": 0, "New Position": 0, "Forecasted Growth": 0 };
    let reqByDept: Record<string, number> = {
      "Telecom & Tech Support": 0,
      "Healthcare & Insurance": 0,
      "Financial Services Group": 0,
      "Retail & E-Commerce": 0
    };

    requisitions.forEach(r => {
      total++;
      if (r.status === "For Approval") pending++;
      else if (r.status === "Approved") approved++;
      else if (r.status === "Not Approved") rejected++;

      // Sum requested headcounts
      const count = r.headcount;
      if (r.requestType === "Requisition") {
        totalHeadcount += count;
        if (reqHiringReason[r.reason] !== undefined) {
          reqHiringReason[r.reason] += count;
        } else {
          reqHiringReason[r.reason] = count;
        }

        if (reqByDept[r.department] !== undefined) {
          reqByDept[r.department] += count;
        } else {
          reqByDept[r.department] = count;
        }
      }
    });

    return { total, totalHeadcount, pending, approved, rejected, reqHiringReason, reqByDept };
  }, [requisitions]);

  // Filtering Logic
  const filteredRequisitions = useMemo(() => {
    return requisitions.filter(pr => {
      const q = searchTerm.toLowerCase();
      const matchesSearch =
        pr.id.toLowerCase().includes(q) ||
        pr.department.toLowerCase().includes(q) ||
        pr.account.toLowerCase().includes(q) ||
        pr.jobTitle.toLowerCase().includes(q) ||
        pr.reason.toLowerCase().includes(q);

      const matchesStatus = statusFilter === "All" || pr.status === statusFilter;
      const matchesLocation = locationFilter === "All" || pr.location === locationFilter;
      const matchesReason = reasonFilter === "All" || pr.reason === reasonFilter;

      // Role isolation: Team leader can only view their own requests, Ops Manager Telecom, HR Admin all
      if (userRoleContext === "Team Leader") {
        return matchesSearch && matchesStatus && matchesLocation && matchesReason && pr.filedBy.name === "Renz Torres";
      }
      if (userRoleContext === "Operations Manager") {
        return matchesSearch && matchesStatus && matchesLocation && matchesReason && pr.department === "Telecom & Tech Support";
      }

      return matchesSearch && matchesStatus && matchesLocation && matchesReason;
    });
  }, [requisitions, searchTerm, statusFilter, locationFilter, reasonFilter, userRoleContext]);

  // Form submit handler
  const handleCreatePR = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newJobTitle) {
      triggerToast("Please input a Job Title.");
      return;
    }

    const nextId = `PR-2026-0${requisitions.length + 1}`;
    const actorName = userRoleContext === "HR Admin" ? "Alena Batacan" : userRoleContext === "Operations Manager" ? "Shiela Delos Reyes" : "Renz Torres";
    
    const newPR: PersonnelRequisition = {
      id: nextId,
      requestType: newRequestType,
      department: newDepartment,
      account: newAccount,
      jobTitle: newJobTitle,
      jdCode: newJdCode,
      headcount: Number(newHeadcount),
      reason: newReason,
      location: newLocation,
      dateNeeded: newDateNeeded,
      status: "For Approval",
      filedBy: { name: actorName, role: userRoleContext },
      history: [
        { date: "2026-07-20", action: `Filed ${newRequestType}`, actor: actorName }
      ]
    };

    setRequisitions([newPR, ...requisitions]);
    setIsAddModalOpen(false);
    triggerToast(`Personnel Requisition ${nextId} created for ${newJobTitle} (${newHeadcount} pax).`);

    // Reset Form
    setNewJobTitle("");
    setNewHeadcount(1);
    setNewDetails("");
  };

  // Helper Details/Narrative State for Form
  const [newDetails, setNewDetails] = useState("");

  // Approval actions
  const handleApprovePR = () => {
    if (!selectedPR) return;

    const updated = requisitions.map(pr => {
      if (pr.id === selectedPR.id) {
        return {
          ...pr,
          status: "Approved" as const,
          remarks: remarksInput || "PR request approved by HR Admin.",
          history: [
            ...pr.history,
            {
              date: "2026-07-20",
              action: "Approved PR Request",
              actor: "Alena Batacan",
              remarks: remarksInput || "SLA parameters verified."
            }
          ]
        };
      }
      return pr;
    });

    setRequisitions(updated);
    const targetItem = updated.find(p => p.id === selectedPR.id);
    if (targetItem) {
      setSelectedPR(targetItem);
    }
    setRemarksInput("");
    triggerToast(`Approved PR ${selectedPR.id} successfully!`);
  };

  const handleRejectPR = () => {
    if (!selectedPR) return;
    if (!remarksInput) {
      triggerToast("Remarks/Reasons for decline are required prior to rejecting.");
      return;
    }

    const updated = requisitions.map(pr => {
      if (pr.id === selectedPR.id) {
        return {
          ...pr,
          status: "Not Approved" as const,
          remarks: remarksInput,
          history: [
            ...pr.history,
            {
              date: "2026-07-20",
              action: "Declined PR Request",
              actor: "Alena Batacan",
              remarks: remarksInput
            }
          ]
        };
      }
      return pr;
    });

    setRequisitions(updated);
    const targetItem = updated.find(p => p.id === selectedPR.id);
    if (targetItem) {
      setSelectedPR(targetItem);
    }
    setRemarksInput("");
    triggerToast(`PR ${selectedPR.id} has been marked as Not Approved.`);
  };

  return (
    <div className="flex-1 flex flex-col space-y-6 select-none relative" id="hiring-needs-root">
      
      {/* Toast alert system */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-20 right-6 bg-[#042C51] border-l-4 border-[#FF5C28] text-white px-5 py-3 rounded-r-xl shadow-2xl z-50 flex items-center gap-3 text-xs font-semibold"
          >
            <CheckCircle className="w-4.5 h-4.5 text-[#FF5C28]" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ==================== 1. HEADER & ACTIONS ==================== */}
      <section className="overflow-hidden rounded-2xl border border-[#E6ECF2] bg-white shadow-sm">
        <div className="h-[3px] w-full bg-gradient-to-r from-[#042C51] via-[#B94A35] to-[#FF5C28]" />

        <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <div className="mb-1.5 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-100 bg-[#E9F0FC] px-2.5 py-1 text-[9px] font-black uppercase tracking-wide text-[#042C51]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#FF5C28]" />
                Recruitment View
              </span>
            </div>

            <h1 className="text-xl font-black tracking-tight text-[#042C51] sm:text-2xl">
              Hiring Needs Intake
            </h1>
            <p className="mt-0.5 text-xs font-medium text-[#667085]">
              Create, review, approve, and manage Personnel Requisition Forms across SIBS operational hubs.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
            <button
              type="button"
              onClick={() => triggerToast("Hiring needs records synced.")}
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[#E6ECF2] bg-white text-[#667085] shadow-sm transition hover:border-[#FF5C28]/30 hover:bg-[#FFF9F6] hover:text-[#FF5C28]"
              title="Refresh Requisitions"
              aria-label="Refresh Requisitions"
            >
              <RefreshCw className="h-4 w-4" />
            </button>

            <button
              type="button"
              onClick={() => setIsAddModalOpen(true)}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-[#FF5C28] px-4 text-xs font-black text-white shadow-sm transition hover:bg-[#E95324]"
            >
              <Plus className="h-4 w-4" />
              New Personnel Requisition
            </button>
          </div>
        </div>
      </section>

      {/* ==================== 2. METRIC CARDS ==================== */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {[
          {
            key: "total",
            title: "Total PRF",
            value: stats.total,
            description: "Total requests",
            icon: FileText,
            labelClass: "text-[#042C51]",
            iconClass: "border-blue-100 bg-blue-50/80 text-[#042C51]",
          },
          {
            key: "headcount",
            title: "Headcount",
            value: stats.totalHeadcount,
            description: "Total personnel",
            icon: CalendarDays,
            labelClass: "text-indigo-600",
            iconClass: "border-indigo-100 bg-indigo-50 text-indigo-600",
          },
          {
            key: "pending",
            title: "For Approval",
            value: stats.pending,
            description: "Pending review",
            icon: Clock3,
            labelClass: "text-amber-600",
            iconClass: "border-amber-100 bg-amber-50 text-amber-600",
          },
          {
            key: "approved",
            title: "Approved",
            value: stats.approved,
            description: "Ready for hiring",
            icon: CheckCircle,
            labelClass: "text-emerald-600",
            iconClass: "border-emerald-100 bg-emerald-50 text-emerald-600",
          },
          {
            key: "rejected",
            title: "Not Approved",
            value: stats.rejected,
            description: "Rejected / closed",
            icon: XCircle,
            labelClass: "text-rose-500",
            iconClass: "border-rose-100 bg-rose-50 text-rose-500",
          },
        ].map((metric) => {
          const MetricIcon = metric.icon;

          return (
            <article
              key={metric.key}
              className="flex min-h-[104px] items-start justify-between rounded-xl border border-[#E6ECF2] bg-white p-5 shadow-sm transition hover:shadow-md"
            >
              <div className="flex h-full min-w-0 flex-1 flex-col justify-between">
                <div>
                  <p className={`text-[10px] font-black uppercase tracking-wider ${metric.labelClass}`}>
                    {metric.title}
                  </p>
                  <p className={`mt-1 text-3xl font-black tracking-tight tabular-nums ${metric.labelClass}`}>
                    {metric.value.toLocaleString("en-PH")}
                  </p>
                </div>

                <p className="mt-2 truncate text-[11px] font-medium text-slate-400">
                  {metric.description}
                </p>
              </div>

              <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border ${metric.iconClass}`}>
                <MetricIcon className="h-5 w-5" />
              </span>
            </article>
          );
        })}
      </section>

      {/* ==================== 3. SUMMARY CARDS ==================== */}
      <section className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <article className="rounded-xl border border-[#E6ECF2] bg-white p-5 shadow-sm">
          <div className="border-b border-[#EEF2F6] pb-3">
            <h3 className="text-xs font-black uppercase tracking-wide text-[#042C51]">
              Headcount Requested by Reason
            </h3>
            <p className="mt-0.5 text-[10px] font-medium text-[#667085]">
              Accumulated target slots needed
            </p>
          </div>

          <div className="mt-4 space-y-3">
            {Object.entries(stats.reqHiringReason).map(([reason, count]) => {
              const values = Object.values(stats.reqHiringReason) as number[];
              const maxCount = Math.max(...values, 1);
              const percentage = Math.min(((count as number) / maxCount) * 100, 100);

              return (
                <div key={reason} className="space-y-1.5">
                  <div className="flex items-center justify-between gap-3 text-[10px] font-black">
                    <span className="truncate text-[#475467]">{reason}</span>
                    <span className="shrink-0 text-[#042C51]">{count} slots</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-[#EEF2F6]">
                    <div
                      className="h-full rounded-full bg-[#FF5C28] transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </article>

        <article className="rounded-xl border border-[#E6ECF2] bg-white p-5 shadow-sm">
          <div className="border-b border-[#EEF2F6] pb-3">
            <h3 className="text-xs font-black uppercase tracking-wide text-[#042C51]">
              Requisition by Department
            </h3>
            <p className="mt-0.5 text-[10px] font-medium text-[#667085]">
              Active approved / pending request quota
            </p>
          </div>

          <div className="mt-4 space-y-3">
            {Object.entries(stats.reqByDept).map(([dept, count]) => {
              const values = Object.values(stats.reqByDept) as number[];
              const maxCount = Math.max(...values, 1);
              const percentage = Math.min(((count as number) / maxCount) * 100, 100);

              return (
                <div key={dept} className="space-y-1.5">
                  <div className="flex items-center justify-between gap-3 text-[10px] font-black">
                    <span className="max-w-[75%] truncate text-[#475467]" title={dept}>
                      {dept}
                    </span>
                    <span className="shrink-0 text-indigo-600">{count} slots</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-[#EEF2F6]">
                    <div
                      className="h-full rounded-full bg-[#042C51] transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </article>
      </section>

      {/* ==================== 4. PERSONNEL REQUISITION RECORDS ==================== */}
      <section className="overflow-visible rounded-2xl border border-[#E6ECF2] bg-white shadow-sm">
        <div className="border-b border-[#E6ECF2] p-4 sm:p-5">
          <h2 className="text-sm font-black text-[#042C51]">
            Personnel Requisition Records
          </h2>
          <p className="mt-0.5 text-xs font-medium text-[#667085]">
            Search and filter Hiring Needs records by request, department, account, site, reason, and approval status.
          </p>

          <div className="mt-4 grid grid-cols-1 gap-3 xl:grid-cols-[minmax(0,2fr)_minmax(180px,0.65fr)_minmax(180px,0.65fr)_minmax(180px,0.65fr)_auto] xl:items-end">
            <div className="min-w-0">
              <label className="mb-1.5 block text-[10px] font-extrabold text-[#101828]">
                Search
              </label>
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#98A2B3]" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by ID, department, account, job title, reason, or week..."
                  className="h-10 w-full rounded-lg border border-[#DDE5EE] bg-[#F8FAFC] pl-9 pr-3 text-xs font-semibold text-[#042C51] outline-none transition placeholder:text-[#8DA2BD] hover:border-[#C9D6E4] focus:border-[#FF5C28] focus:bg-white focus:ring-2 focus:ring-[#FF5C28]/10"
                />
              </div>
            </div>

            <div className="min-w-0">
              <label className="mb-1.5 block text-[10px] font-extrabold text-[#101828]">
                Approval Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="h-10 w-full rounded-lg border border-[#DDE5EE] bg-[#F8FAFC] px-3 text-xs font-extrabold text-[#042C51] outline-none transition hover:border-[#C9D6E4] focus:border-[#FF5C28] focus:bg-white focus:ring-2 focus:ring-[#FF5C28]/10"
              >
                <option value="All">All Statuses</option>
                <option value="For Approval">For Approval</option>
                <option value="Approved">Approved</option>
                <option value="Not Approved">Not Approved</option>
              </select>
            </div>

            <div className="min-w-0">
              <label className="mb-1.5 block text-[10px] font-extrabold text-[#101828]">
                Location / Site
              </label>
              <select
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
                className="h-10 w-full rounded-lg border border-[#DDE5EE] bg-[#F8FAFC] px-3 text-xs font-extrabold text-[#042C51] outline-none transition hover:border-[#C9D6E4] focus:border-[#FF5C28] focus:bg-white focus:ring-2 focus:ring-[#FF5C28]/10"
              >
                <option value="All">All Sites</option>
                <option value="Davao">Davao</option>
                <option value="Tagum">Tagum</option>
                <option value="Mabini">Mabini</option>
              </select>
            </div>

            <div className="min-w-0">
              <label className="mb-1.5 block text-[10px] font-extrabold text-[#101828]">
                Reason
              </label>
              <select
                value={reasonFilter}
                onChange={(e) => setReasonFilter(e.target.value)}
                className="h-10 w-full rounded-lg border border-[#DDE5EE] bg-[#F8FAFC] px-3 text-xs font-extrabold text-[#042C51] outline-none transition hover:border-[#C9D6E4] focus:border-[#FF5C28] focus:bg-white focus:ring-2 focus:ring-[#FF5C28]/10"
              >
                <option value="All">All Reasons</option>
                <option value="Ramp-up">Ramp-up</option>
                <option value="Backfill">Backfill</option>
                <option value="New Position">New Position</option>
                <option value="Forecasted Growth">Forecasted Growth</option>
              </select>
            </div>

            <button
              type="button"
              onClick={() => {
                setSearchTerm("");
                setStatusFilter("All");
                setLocationFilter("All");
                setReasonFilter("All");
              }}
              disabled={
                !searchTerm.trim() &&
                statusFilter === "All" &&
                locationFilter === "All" &&
                reasonFilter === "All"
              }
              className="inline-flex h-10 w-full items-center justify-center gap-1.5 rounded-lg border border-[#DDE5EE] bg-white px-4 text-xs font-extrabold text-[#667085] transition hover:border-[#FF5C28]/40 hover:bg-[#FFF9F6] hover:text-[#FF5C28] disabled:cursor-not-allowed disabled:opacity-50 xl:w-auto"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Clear
            </button>
          </div>
        </div>

        <div className="p-4 sm:p-5">
          <div className="overflow-hidden rounded-xl border border-[#E6ECF2] bg-white">
            <div className="flex overflow-x-auto border-b border-[#E6ECF2] bg-[#F8FAFC] px-4 pt-3">
              {[
                { value: "All", label: "All PRFs", count: stats.total },
                { value: "For Approval", label: "For Approval", count: stats.pending },
                { value: "Approved", label: "Approved", count: stats.approved },
                { value: "Not Approved", label: "Not Approved", count: stats.rejected },
              ].map((tab) => (
                <button
                  key={tab.value}
                  type="button"
                  onClick={() => setStatusFilter(tab.value)}
                  className={`relative whitespace-nowrap px-4 py-3 text-[10px] font-extrabold uppercase tracking-normal transition-colors ${
                    statusFilter === tab.value
                      ? "bg-white text-[#042C51]"
                      : "text-[#667085] hover:text-[#042C51]"
                  }`}
                >
                  <span className="inline-flex items-center gap-2">
                    {tab.label}
                    <span
                      className={`rounded-full px-2 py-0.5 text-[9px] font-extrabold ${
                        statusFilter === tab.value
                          ? "bg-[#042C51] text-white"
                          : "bg-[#E9EEF4] text-[#667085]"
                      }`}
                    >
                      {tab.count}
                    </span>
                  </span>
                  {statusFilter === tab.value && (
                    <span className="absolute inset-x-0 bottom-0 h-0.5 bg-[#FF5C28]" />
                  )}
                </button>
              ))}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[1180px] table-fixed border-collapse bg-white text-left text-xs">
                <thead className="sticky top-0 z-10 bg-[#F8FAFC]">
                  <tr className="border-b border-[#E6ECF2]">
                    <th className="w-[13%] px-4 py-3.5 text-[10px] font-extrabold uppercase text-[#667085]">
                      ID / Request Type
                    </th>
                    <th className="w-[18%] px-4 py-3.5 text-[10px] font-extrabold uppercase text-[#667085]">
                      Department / Account
                    </th>
                    <th className="w-[20%] px-4 py-3.5 text-[10px] font-extrabold uppercase text-[#667085]">
                      Job Description / Request
                    </th>
                    <th className="w-[8%] px-4 py-3.5 text-center text-[10px] font-extrabold uppercase text-[#667085]">
                      Headcount
                    </th>
                    <th className="w-[11%] px-4 py-3.5 text-[10px] font-extrabold uppercase text-[#667085]">
                      Reason
                    </th>
                    <th className="w-[9%] px-4 py-3.5 text-[10px] font-extrabold uppercase text-[#667085]">
                      Location / Site
                    </th>
                    <th className="w-[10%] px-4 py-3.5 text-[10px] font-extrabold uppercase text-[#667085]">
                      Date Needed
                    </th>
                    <th className="w-[11%] px-4 py-3.5 text-center text-[10px] font-extrabold uppercase text-[#667085]">
                      Approval Status
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-[#E6ECF2]">
                  {filteredRequisitions.length > 0 ? (
                    filteredRequisitions.map((pr) => {
                      const selected = selectedPR?.id === pr.id;

                      return (
                        <tr
                          key={pr.id}
                          role="button"
                          tabIndex={0}
                          onClick={() => setSelectedPR(pr)}
                          onKeyDown={(event) => {
                            if (event.key === "Enter" || event.key === " ") {
                              event.preventDefault();
                              setSelectedPR(pr);
                            }
                          }}
                          className={`cursor-pointer outline-none transition ${
                            selected
                              ? "bg-[#FFF4EF]"
                              : "hover:bg-[#F8FAFC] focus-visible:bg-[#F8FAFC]"
                          }`}
                        >
                          <td className="px-4 py-2.5 align-middle">
                            <p className="font-mono text-xs font-extrabold text-[#042C51]">{pr.id}</p>
                            <span
                              className={`mt-1 inline-flex rounded-full border px-2 py-0.5 text-[9px] font-extrabold ${
                                pr.requestType === "Downsize"
                                  ? "border-rose-200 bg-rose-50 text-rose-700"
                                  : "border-blue-200 bg-blue-50 text-blue-700"
                              }`}
                            >
                              {pr.requestType}
                            </span>
                          </td>

                          <td className="px-4 py-2.5 align-middle">
                            <p className="truncate text-xs font-extrabold text-[#042C51]">{pr.department}</p>
                            <p className="mt-0.5 truncate text-[10px] font-semibold text-[#667085]">{pr.account}</p>
                          </td>

                          <td className="px-4 py-2.5 align-middle">
                            <p className="truncate text-xs font-extrabold text-[#042C51]">{pr.jobTitle}</p>
                            <p className="mt-0.5 truncate font-mono text-[10px] font-semibold text-[#98A2B3]">{pr.jdCode}</p>
                          </td>

                          <td className="px-4 py-2.5 text-center align-middle">
                            <span className="inline-flex min-w-8 items-center justify-center rounded-lg bg-[#F2F6FA] px-2.5 py-1 text-xs font-extrabold tabular-nums text-[#042C51]">
                              {pr.headcount}
                            </span>
                          </td>

                          <td className="px-4 py-2.5 align-middle">
                            <span className="text-xs font-semibold text-[#475467]">{pr.reason}</span>
                          </td>

                          <td className="px-4 py-2.5 align-middle">
                            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#475467]">
                              <MapPin className="h-3.5 w-3.5 text-[#98A2B3]" />
                              {pr.location}
                            </span>
                          </td>

                          <td className="px-4 py-2.5 align-middle text-xs font-semibold tabular-nums text-[#475467]">
                            {pr.dateNeeded}
                          </td>

                          <td className="px-4 py-2.5 text-center align-middle">
                            <span
                              className={`inline-flex rounded-full border px-2.5 py-1 text-[9px] font-extrabold ${
                                pr.status === "Approved"
                                  ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                                  : pr.status === "For Approval"
                                    ? "border-amber-200 bg-amber-50 text-amber-700"
                                    : "border-red-200 bg-red-50 text-red-700"
                              }`}
                            >
                              {pr.status}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={8} className="px-5 py-14 text-center">
                        <FileText className="mx-auto h-9 w-9 text-[#CBD5E1]" />
                        <p className="mt-3 text-sm font-extrabold text-[#042C51]">
                          No Personnel Requisitions Found
                        </p>
                        <p className="mt-1 text-xs font-semibold text-[#98A2B3]">
                          No records matched the active search and filters.
                        </p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between border-t border-[#E6ECF2] bg-[#F8FAFC] px-5 py-3 text-xs font-medium text-[#667085]">
              <span>
                Showing {filteredRequisitions.length} of {requisitions.length} personnel requisitions
              </span>
              <span className="rounded-full bg-[#EEF2F6] px-2.5 py-1 text-[10px] font-extrabold text-[#475467]">
                Static prototype data
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== 5. PROCESS NOTE (EDUCATIONAL CONTEXT) ==================== */}
      <section className="bg-slate-50 p-4 rounded-xl border border-slate-200/60 flex items-start gap-3">
        <Info className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <h4 className="text-xs font-black text-[#042C51]">Operational Routing & Personnel Requisition Protocol</h4>
          <p className="text-[10.5px] text-slate-600 leading-relaxed">
            This module tracks and executes Personnel Requisitions (PRs). Filed PRs must adhere strictly to agreed site capacity parameters and corporate budget models. 
            Once submitted, the system schedules automatic SLA timelines targeting fulfillment cycles. Direct modifications to active requirements undergo verification audits by regional HR directors.
          </p>
        </div>
      </section>

      {/* ==================== 6. MODALS & WORKFLOWS ==================== */}

      {/* ADD REQUISITION MODAL */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 bg-[#042C51]/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden text-slate-900"
            >
              <div className="bg-[#042C51] text-white p-4 sm:p-5 flex items-center justify-between border-b border-[#063866]">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-white/10 border border-white/20 text-[#FF5C28] flex items-center justify-center shrink-0">
                    <Inbox className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <h2 className="text-sm sm:text-base font-black text-white tracking-tight">New Personnel Requisition</h2>
                    <p className="text-[11px] text-slate-300 font-medium">Log headcount additions or updates</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-all cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleCreatePR} className="p-6 space-y-4">
                
                <div className="grid grid-cols-2 gap-4">
                  {/* Request Type */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Request Type</label>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setNewRequestType("Requisition")}
                        className={`flex-1 py-1.5 rounded-lg text-xs font-extrabold border transition-all ${
                          newRequestType === "Requisition"
                            ? "bg-[#042C51] text-white border-[#042C51]"
                            : "bg-slate-50 text-slate-600 border-slate-200"
                        }`}
                      >
                        Requisition (+ Headcount)
                      </button>
                      <button
                        type="button"
                        onClick={() => setNewRequestType("Downsize")}
                        className={`flex-1 py-1.5 rounded-lg text-xs font-extrabold border transition-all ${
                          newRequestType === "Downsize"
                            ? "bg-rose-50 text-rose-700 border-rose-300"
                            : "bg-slate-50 text-slate-600 border-slate-200"
                        }`}
                      >
                        Downsize (- Quota)
                      </button>
                    </div>
                  </div>

                  {/* Department */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Department</label>
                    <select
                      value={newDepartment}
                      onChange={(e) => setNewDepartment(e.target.value)}
                      className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none focus:bg-white"
                    >
                      <option value="Telecom & Tech Support">Telecom & Tech Support</option>
                      <option value="Healthcare & Insurance">Healthcare & Insurance</option>
                      <option value="Financial Services Group">Financial Services Group</option>
                      <option value="Retail & E-Commerce">Retail & E-Commerce</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Account */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Account client</label>
                    <select
                      value={newAccount}
                      onChange={(e) => setNewAccount(e.target.value)}
                      className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none focus:bg-white"
                    >
                      <option value="Verizon Tech">Verizon Tech</option>
                      <option value="Comcast Technical">Comcast Technical</option>
                      <option value="T-Mobile Care">T-Mobile Care</option>
                      <option value="UnitedHealth VIP">UnitedHealth VIP</option>
                      <option value="Chase Credit">Chase Credit</option>
                      <option value="Amazon Care">Amazon Care</option>
                    </select>
                  </div>

                  {/* Job Title */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Job Title</label>
                    <input
                      type="text"
                      placeholder="e.g. Customer Service Representative"
                      required
                      value={newJobTitle}
                      onChange={(e) => setNewJobTitle(e.target.value)}
                      className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none focus:bg-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* JD Code */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Job Description (JD) Code</label>
                    <select
                      value={newJdCode}
                      onChange={(e) => setNewJdCode(e.target.value)}
                      className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none focus:bg-white"
                    >
                      <option value="JD-CSR-TEL-04">JD-CSR-TEL-04 (Tech Specialist)</option>
                      <option value="JD-TECH-HC-09">JD-TECH-HC-09 (Tier 2)</option>
                      <option value="JD-FIN-FRD-01">JD-FIN-FRD-01 (Fraud)</option>
                      <option value="JD-MGR-TL-02">JD-MGR-TL-02 (Team Leader)</option>
                      <option value="JD-HC-CLM-03">JD-HC-CLM-03 (Claims)</option>
                    </select>
                  </div>

                  {/* Headcount */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Required Headcount (slots)</label>
                    <input
                      type="number"
                      min={1}
                      max={150}
                      required
                      value={newHeadcount}
                      onChange={(e) => setNewHeadcount(Number(e.target.value))}
                      className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none focus:bg-white font-mono font-bold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  {/* Reason */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Reason for Hiring</label>
                    <select
                      value={newReason}
                      onChange={(e) => setNewReason(e.target.value)}
                      className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none focus:bg-white"
                    >
                      <option value="Ramp-up">Ramp-up</option>
                      <option value="Backfill">Backfill</option>
                      <option value="New Position">New Position</option>
                      <option value="Forecasted Growth">Forecasted Growth</option>
                    </select>
                  </div>

                  {/* Location */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Location / Site</label>
                    <select
                      value={newLocation}
                      onChange={(e) => setNewLocation(e.target.value)}
                      className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none focus:bg-white"
                    >
                      <option value="Davao">Davao Hub</option>
                      <option value="Tagum">Tagum Office</option>
                      <option value="Mabini">Mabini Site</option>
                    </select>
                  </div>

                  {/* Date Needed */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Date Needed By</label>
                    <input
                      type="date"
                      value={newDateNeeded}
                      onChange={(e) => setNewDateNeeded(e.target.value)}
                      className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none focus:bg-white"
                    />
                  </div>
                </div>

                {/* Narrative Details */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Request Details / Context Remarks</label>
                  <textarea
                    rows={2}
                    placeholder="Briefly describe the specific request context, client goals, and target timeline expectations..."
                    value={newDetails}
                    onChange={(e) => setNewDetails(e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none focus:bg-white resize-none"
                  />
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-[#042C51] hover:bg-[#FF5C28] text-white rounded-xl text-xs font-black transition-all shadow-xs cursor-pointer"
                  >
                    Submit Requisition
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* VIEW REQUISITION DETAILS MODAL */}
      <AnimatePresence>
        {selectedPR && (
          <div className="fixed inset-0 bg-[#042C51]/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden text-slate-900"
            >
              <div className="bg-[#042C51] text-white p-4 sm:p-5 flex items-center justify-between border-b border-[#063866]">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-white/10 border border-white/20 text-[#FF5C28] flex items-center justify-center shrink-0">
                    <FileText className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <h2 className="text-sm sm:text-base font-black text-white tracking-tight">Personnel Requisition Form Details</h2>
                    <p className="text-[11px] text-slate-300 font-mono font-bold">{selectedPR.id}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedPR(null)}
                  className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-all cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-6 space-y-5 overflow-y-auto max-h-[80vh]">
                <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200/60">
                  
                  <div>
                    <span className="text-[9px] font-bold text-slate-400 uppercase block">Department</span>
                    <span className="text-xs font-extrabold text-[#042C51] block">{selectedPR.department}</span>
                  </div>
                  <div>
                    <span className="text-[9px] font-bold text-slate-400 uppercase block">Account Client</span>
                    <span className="text-xs font-extrabold text-[#042C51] block">{selectedPR.account}</span>
                  </div>

                  <div>
                    <span className="text-[9px] font-bold text-slate-400 uppercase block">Job Title</span>
                    <span className="text-xs font-extrabold text-[#042C51] block">{selectedPR.jobTitle}</span>
                  </div>
                  <div>
                    <span className="text-[9px] font-bold text-slate-400 uppercase block">JD Code / Specification</span>
                    <span className="text-xs font-bold text-[#FF5C28] font-mono block">{selectedPR.jdCode}</span>
                  </div>

                  <div>
                    <span className="text-[9px] font-bold text-slate-400 uppercase block">Headcount (Required Slots)</span>
                    <span className="text-sm font-black text-slate-800 font-mono block">{selectedPR.headcount} slots</span>
                  </div>
                  <div>
                    <span className="text-[9px] font-bold text-slate-400 uppercase block">Primary Reason</span>
                    <span className="text-xs font-bold text-indigo-600 block">{selectedPR.reason}</span>
                  </div>

                  <div>
                    <span className="text-[9px] font-bold text-slate-400 uppercase block">Location / Site Target</span>
                    <span className="text-xs font-semibold text-slate-700 block">{selectedPR.location} Site</span>
                  </div>
                  <div>
                    <span className="text-[9px] font-bold text-slate-400 uppercase block">Date Needed By</span>
                    <span className="text-xs font-bold text-indigo-600 block">{selectedPR.dateNeeded}</span>
                  </div>

                  <div>
                    <span className="text-[9px] font-bold text-slate-400 uppercase block">Filed By Operator</span>
                    <span className="text-xs font-bold text-slate-700 block">
                      {selectedPR.filedBy.name} ({selectedPR.filedBy.role})
                    </span>
                  </div>
                  <div>
                    <span className="text-[9px] font-bold text-slate-400 uppercase block">Approval Status</span>
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-[9px] font-black uppercase mt-1 ${
                        selectedPR.status === "Approved"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : selectedPR.status === "For Approval"
                          ? "bg-amber-50 text-amber-700 border border-amber-200"
                          : "bg-rose-50 text-rose-700 border border-rose-200"
                      }`}
                    >
                      {selectedPR.status}
                    </span>
                  </div>

                </div>

                {selectedPR.remarks && (
                  <div className="p-3 bg-indigo-50/50 border border-indigo-100 rounded-lg">
                    <span className="text-[9px] font-black text-indigo-600 uppercase tracking-wide block mb-0.5">HR/OM Remarks Context</span>
                    <p className="text-xs text-slate-700 leading-normal font-semibold">{selectedPR.remarks}</p>
                  </div>
                )}

                {/* History Timeline */}
                <div className="space-y-3">
                  <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Form Action Audit Trail</h3>
                  <div className="space-y-3 pl-2">
                    {selectedPR.history.map((hist, idx) => (
                      <div key={idx} className="flex gap-3 relative">
                        {idx !== selectedPR.history.length - 1 && (
                          <div className="absolute top-5 left-2 bottom-0 w-[1px] bg-slate-200"></div>
                        )}
                        <div className="w-4 h-4 rounded-full bg-[#E9F0FC] border border-[#042C51] text-[#042C51] flex items-center justify-center shrink-0 mt-0.5">
                          <Check className="w-2.5 h-2.5" />
                        </div>
                        <div className="text-xs">
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold text-[#042C51]">{hist.action}</span>
                            <span className="text-[9px] font-mono text-slate-400">{hist.date}</span>
                          </div>
                          <span className="text-[10px] text-slate-500 block">Actor: {hist.actor}</span>
                          {hist.remarks && <p className="text-[10px] text-slate-600 italic mt-0.5">"{hist.remarks}"</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* HR ADMIN SIGN-OFF ACTION CONTROLS */}
                {selectedPR.status === "For Approval" && userRoleContext === "HR Admin" && (
                  <div className="pt-4 border-t border-slate-100 space-y-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">
                        Decline/Approve Remarks or Conditions
                      </label>
                      <input
                        type="text"
                        placeholder="Provide comments, constraints, or reasons for rejection..."
                        value={remarksInput}
                        onChange={(e) => setRemarksInput(e.target.value)}
                        className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none focus:bg-white"
                      />
                    </div>

                    <div className="flex items-center gap-2 justify-end">
                      <button
                        type="button"
                        onClick={handleRejectPR}
                        className="px-4 py-1.5 bg-rose-50 hover:bg-rose-100 border border-rose-300 text-rose-700 text-xs font-black rounded-lg transition-colors cursor-pointer"
                      >
                        Decline PR Request
                      </button>

                      <button
                        type="button"
                        onClick={handleApprovePR}
                        className="px-4 py-1.5 bg-[#042C51] hover:bg-[#FF5C28] text-white text-xs font-black rounded-lg transition-all cursor-pointer shadow-sm"
                      >
                        Approve Requisition
                      </button>
                    </div>
                  </div>
                )}

                <div className="pt-3 border-t border-slate-100 flex justify-end">
                  <button
                    type="button"
                    onClick={() => setSelectedPR(null)}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition-colors"
                  >
                    Close Panel
                  </button>
                </div>

              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
