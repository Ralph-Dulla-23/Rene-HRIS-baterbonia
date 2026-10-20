import React, { useMemo, useState, useEffect } from "react";
import {
  AlertTriangle,
  BriefcaseBusiness,
  CheckCircle,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Database,
  Loader2,
  Plus,
  RefreshCw,
  RotateCcw,
  Search,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import PositionDetailsModal, {
  AvailablePositionRecord,
  SAMPLE_APPROVED_JDS
} from "./PositionDetailsModal";
import {
  loadFromLocalStorage,
  saveToLocalStorage,
  STORAGE_KEYS,
  broadcastDataChange
} from "../data/recruitmentStore";

interface AvailablePositionsProps {
  userEmail?: string;
  onSwitchModule?: (module: string) => void;
}

// Initial Seed Data aligned directly with screenshot specifications
export const INITIAL_AVAILABLE_POSITIONS: AvailablePositionRecord[] = [
  {
    id: "POS-002",
    title: "FST TRAINER",
    department: "Training Management",
    account: "Foundation Skills Training",
    accountGhlName: "FST-Training-Davao",
    jdId: "JD-012",
    jdCode: "JD-012",
    jdRoleTitle: "FOUNDATIONAL SKILLS TRAINER",
    documentTitle: "JD_Foundational_Skills_Trainer_v2.0.pdf",
    isLinkedToJd: true,
    location: "Davao Site",
    status: "Active",
    approvalStatus: "Approved",
    skills: ["Training Delivery", "Curriculum Design", "Foundational Communication", "LMS Navigation"],
    description: "Conduct foundational skills training for new hire onboarding batches, measuring baseline communication and typing standards.",
    lastUpdated: "August 19, 2026",
    updatedBy: "6496"
  },
  {
    id: "POS-005",
    title: "SOFTWARE MANAGEMENT – FULL STACK DEVELOPER",
    department: "IT (Information and Communications Technology)",
    account: "Software Management",
    accountGhlName: "SIBS-DevOps-Davao",
    isLinkedToJd: false,
    location: "Davao Site",
    status: "Active",
    approvalStatus: "For Approval",
    skills: ["React", "TypeScript", "Node.js", "Cloud Run", "PostgreSQL"],
    description: "Full-stack software engineering position supporting internal HR and operational tool ecosystems.",
    lastUpdated: "August 19, 2026",
    updatedBy: "6496"
  },
  {
    id: "POS-001",
    title: "FULL STACK DEVELOPER",
    department: "IT (Information and Communications Technology)",
    account: "Software Management",
    accountGhlName: "SIBS-Core-IT",
    isLinkedToJd: false,
    location: "Davao Site",
    status: "Active",
    approvalStatus: "Approved",
    skills: ["React", "Tailwind CSS", "API Architecture", "Docker"],
    description: "Responsible for core frontend architecture, user experience design, and backend REST APIs.",
    lastUpdated: "August 19, 2026",
    updatedBy: "6496"
  },
  {
    id: "POS-003",
    title: "FRAUD & DISPUTES SPECIALIST",
    department: "Financial Services Group",
    account: "Chase Credit",
    accountGhlName: "Chase-Financial-Tagum",
    jdId: "JD-FIN-01",
    jdCode: "JD-FIN-FRD-01",
    jdRoleTitle: "FRAUD INVESTIGATOR & DISPUTES ANALYST",
    documentTitle: "Chase_Consumer_Protection_Standard_v1.0.pdf",
    isLinkedToJd: true,
    location: "Tagum Site",
    status: "Active",
    approvalStatus: "Approved",
    skills: ["Chargeback Resolution", "Risk Analytics", "KYC / AML Compliance"],
    description: "Investigate contested credit card charges and execute standard operating chargeback procedures.",
    lastUpdated: "August 18, 2026",
    updatedBy: "6496"
  },
  {
    id: "POS-004",
    title: "HEALTHCARE VERIFICATION AGENT",
    department: "Healthcare & Insurance",
    account: "UnitedHealth VIP",
    accountGhlName: "UHP-VIP-Care",
    jdId: "JD-2026-004",
    jdCode: "JD-HC-CLM-03",
    jdRoleTitle: "HEALTHCARE BILLING REPRESENTATIVE",
    documentTitle: "JD_Healthcare_Billing_Agent_v1.4.pdf",
    isLinkedToJd: true,
    location: "Tagum Site",
    status: "Active",
    approvalStatus: "Approved",
    skills: ["HIPAA Standards", "Medical Verification", "Prior Authorization"],
    description: "Verify patient insurance benefits and reconcile billing claims with insurance providers.",
    lastUpdated: "August 17, 2026",
    updatedBy: "6496"
  },
  {
    id: "POS-006",
    title: "TECHNICAL SUPPORT REPRESENTATIVE (CSR)",
    department: "Telecom & Tech Support",
    account: "Comcast Technical",
    accountGhlName: "Comcast-Voice-Davao",
    jdId: "JD-2026-001",
    jdCode: "JD-CSR-TEL-04",
    jdRoleTitle: "CUSTOMER SUPPORT SPECIALIST",
    documentTitle: "Comcast_Tier1_CSR_Guideline_v2.1.pdf",
    isLinkedToJd: true,
    location: "Davao Site",
    status: "Active",
    approvalStatus: "Approved",
    skills: ["Troubleshooting", "Active Listening", "Zendesk CRM", "FCR Optimization"],
    description: "Provide tier-1 voice and chat technical assistance for broadband internet, modem, and TV cable inquiries.",
    lastUpdated: "August 16, 2026",
    updatedBy: "6496"
  }
];

type NavTabType =
  | "ALL POSITIONS"
  | "FOR APPROVAL"
  | "ACTIVE"
  | "INACTIVE"
  | "APPROVED"
  | "REJECTED"
  | "ARCHIVED"
  | "UNLINKED FROM JOB DESCRIPTIONS";


function ConfirmationModal({
  open,
  title = "Confirm Action",
  message,
  confirmLabel = "Continue",
  cancelLabel = "Cancel",
  isSaving = false,
  onCancel,
  onConfirm,
}: {
  open: boolean;
  title?: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isSaving?: boolean;
  onCancel?: () => void;
  onConfirm?: () => void;
}) {
  if (!open) return null;

  return (
    <div
      className="sibs-modal-backdrop-in sibs-modal-blur fixed inset-0 z-[12000] flex h-dvh items-center justify-center bg-[#042C51]/60 p-3 font-jakarta sm:p-4"
      onClick={() => {
        if (!isSaving) onCancel?.();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="available-position-confirm-title"
        className="sibs-modal-pop-in w-full max-w-md overflow-hidden rounded-2xl border border-white/70 bg-white shadow-2xl font-jakarta"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="bg-[#042C51] px-4 py-3 text-white sm:px-5">
          <div className="flex items-start justify-between gap-3">
            <div className="flex min-w-0 items-start gap-2.5 2xl:gap-3">
              <span className="flex h-8 w-8 2xl:h-9 2xl:w-9 shrink-0 items-center justify-center rounded-lg border border-white/15 bg-white/10 text-[#FF5C28]">
                <AlertTriangle className="h-4 w-4 text-[#FF5C28]" />
              </span>

              <div className="min-w-0">
                <p className="sibs-modal-subtitle truncate text-white/75 sm:text-clip">
                  Position Dictionary
                </p>

                <h3
                  id="available-position-confirm-title"
                  className="sibs-modal-title mt-0.5 truncate text-white"
                >
                  {title}
                </h3>
              </div>
            </div>

            <button
              type="button"
              onClick={onCancel}
              disabled={isSaving}
              aria-label="Close confirmation"
              className="sibs-modal-close-btn"
              title="Close"
            >
              <X size={17} />
            </button>
          </div>
        </header>

        <div className="p-4 sm:p-5">
          <p className="text-xs font-semibold leading-relaxed text-[#667085]">
            {message || "Confirm this Available Position action."}
          </p>

          <div className="mt-3.5 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5 text-[10px] font-semibold leading-relaxed text-amber-800">
            Status changes affect applicant-facing availability. Review the requested
            action before continuing.
          </div>
        </div>

        <footer className="flex flex-col-reverse gap-2 border-t border-[#E6ECF2] bg-[#F8FAFC] px-4 py-3 sm:flex-row sm:justify-end sm:gap-2.5 sm:px-5">
          <button
            type="button"
            onClick={onCancel}
            disabled={isSaving}
            className="sibs-modal-btn-secondary"
          >
            {cancelLabel}
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={isSaving}
            className="sibs-modal-btn-primary gap-2"
          >
            {isSaving ? <Loader2 size={13} className="animate-spin" /> : null}
            {isSaving ? "Processing..." : confirmLabel}
          </button>
        </footer>
      </div>
    </div>
  );
}

export default function AvailablePositions({ userEmail, onSwitchModule }: AvailablePositionsProps) {
  // State backed by LocalStorage
  const [positions, setPositions] = useState<AvailablePositionRecord[]>(() =>
    loadFromLocalStorage(STORAGE_KEYS.AVAILABLE_POSITIONS, INITIAL_AVAILABLE_POSITIONS)
  );

  // Sync to localStorage
  useEffect(() => {
    saveToLocalStorage(STORAGE_KEYS.AVAILABLE_POSITIONS, positions);
    broadcastDataChange("positions");
  }, [positions]);

  // Listen for storage updates
  useEffect(() => {
    const handleStoreUpdate = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail?.channel === "positions" || customEvent.detail?.channel === "all") {
        setPositions(prev => {
          const fresh = loadFromLocalStorage(STORAGE_KEYS.AVAILABLE_POSITIONS, INITIAL_AVAILABLE_POSITIONS);
          return JSON.stringify(prev) === JSON.stringify(fresh) ? prev : fresh;
        });
      }
    };
    window.addEventListener("sibs_store_update", handleStoreUpdate);
    return () => window.removeEventListener("sibs_store_update", handleStoreUpdate);
  }, []);
  const [activeTab, setActiveTab] = useState<NavTabType>("ALL POSITIONS");

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Statuses");
  const [departmentFilter, setDepartmentFilter] = useState("All Departments");
  const [accountFilter, setAccountFilter] = useState("All Accounts");
  const [locationFilter, setLocationFilter] = useState("All Locations");

  // Modal State
  const [selectedPosition, setSelectedPosition] = useState<AvailablePositionRecord | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [confirmState, setConfirmState] = useState<{
    title: string;
    message: string;
    confirmLabel: string;
    onConfirm: () => void;
  } | null>(null);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Compute Badge Counts for Tabs
  const forApprovalCount = useMemo(
    () => positions.filter((p) => p.approvalStatus === "For Approval").length,
    [positions]
  );

  const unlinkedCount = useMemo(
    () => positions.filter((p) => !p.isLinkedToJd).length,
    [positions]
  );

  // Synchronize Tab selection with Status Filter dropdown
  const handleTabChange = (tab: NavTabType) => {
    setActiveTab(tab);
    if (tab === "ALL POSITIONS") {
      setStatusFilter("All Statuses");
    } else if (tab === "FOR APPROVAL") {
      setStatusFilter("For Approval");
    } else if (tab === "ACTIVE") {
      setStatusFilter("Active");
    } else if (tab === "INACTIVE") {
      setStatusFilter("Inactive");
    } else if (tab === "APPROVED") {
      setStatusFilter("Approved");
    } else if (tab === "REJECTED") {
      setStatusFilter("Rejected");
    } else if (tab === "ARCHIVED") {
      setStatusFilter("Archived");
    } else if (tab === "UNLINKED FROM JOB DESCRIPTIONS") {
      setStatusFilter("Unlinked from JD");
    }
  };

  // Synchronize Dropdown change with Tab
  const handleStatusFilterChange = (val: string) => {
    setStatusFilter(val);
    if (val === "All Statuses") setActiveTab("ALL POSITIONS");
    else if (val === "For Approval") setActiveTab("FOR APPROVAL");
    else if (val === "Active") setActiveTab("ACTIVE");
    else if (val === "Inactive") setActiveTab("INACTIVE");
    else if (val === "Approved") setActiveTab("APPROVED");
    else if (val === "Rejected") setActiveTab("REJECTED");
    else if (val === "Archived") setActiveTab("ARCHIVED");
    else if (val === "Unlinked from JD") setActiveTab("UNLINKED FROM JOB DESCRIPTIONS");
  };

  const handleClearFilters = () => {
    setSearchTerm("");
    setStatusFilter("All Statuses");
    setDepartmentFilter("All Departments");
    setAccountFilter("All Accounts");
    setLocationFilter("All Locations");
    setActiveTab("ALL POSITIONS");
    triggerToast("All directory filters have been reset.");
  };

  // Extract unique departments and accounts for dropdowns
  const uniqueDepartments = useMemo(() => {
    const set = new Set(positions.map((p) => p.department));
    return Array.from(set);
  }, [positions]);

  const uniqueAccounts = useMemo(() => {
    const set = new Set(positions.map((p) => p.account));
    return Array.from(set);
  }, [positions]);

  const uniqueLocations = useMemo(() => {
    const set = new Set(positions.map((p) => p.location));
    return Array.from(set);
  }, [positions]);

  // Filter logic
  const filteredPositions = useMemo(() => {
    return positions.filter((pos) => {
      // Search matching
      const q = searchTerm.toLowerCase().trim();
      const matchesSearch =
        !q ||
        pos.id.toLowerCase().includes(q) ||
        pos.title.toLowerCase().includes(q) ||
        pos.department.toLowerCase().includes(q) ||
        pos.account.toLowerCase().includes(q) ||
        (pos.jdCode && pos.jdCode.toLowerCase().includes(q)) ||
        (pos.jdRoleTitle && pos.jdRoleTitle.toLowerCase().includes(q)) ||
        pos.skills.some((s) => s.toLowerCase().includes(q));

      // Tab / Status filter matching
      let matchesStatus = true;
      if (activeTab === "FOR APPROVAL" || statusFilter === "For Approval") {
        matchesStatus = pos.approvalStatus === "For Approval";
      } else if (activeTab === "ACTIVE" || statusFilter === "Active") {
        matchesStatus = pos.status === "Active";
      } else if (activeTab === "INACTIVE" || statusFilter === "Inactive") {
        matchesStatus = pos.status === "Inactive";
      } else if (activeTab === "APPROVED" || statusFilter === "Approved") {
        matchesStatus = pos.approvalStatus === "Approved";
      } else if (activeTab === "REJECTED" || statusFilter === "Rejected") {
        matchesStatus = pos.approvalStatus === "Rejected";
      } else if (activeTab === "ARCHIVED" || statusFilter === "Archived") {
        matchesStatus = pos.approvalStatus === "Archived";
      } else if (activeTab === "UNLINKED FROM JOB DESCRIPTIONS" || statusFilter === "Unlinked from JD") {
        matchesStatus = !pos.isLinkedToJd;
      }

      // Department filter
      const matchesDept = departmentFilter === "All Departments" || pos.department === departmentFilter;

      // Account filter
      const matchesAccount = accountFilter === "All Accounts" || pos.account === accountFilter;

      // Location filter
      const matchesLocation = locationFilter === "All Locations" || pos.location === locationFilter;

      return matchesSearch && matchesStatus && matchesDept && matchesAccount && matchesLocation;
    });
  }, [positions, searchTerm, activeTab, statusFilter, departmentFilter, accountFilter, locationFilter]);

  // Modal Handlers
  const handleRowClick = (pos: AvailablePositionRecord) => {
    setSelectedPosition(pos);
    setIsModalOpen(true);
  };

  const applyApprovePosition = (pos: AvailablePositionRecord) => {
    const updated = positions.map((p) =>
      p.id === pos.id
        ? {
            ...p,
            approvalStatus: "Approved" as const,
            lastUpdated: "August 19, 2026",
            updatedBy: "6496",
          }
        : p
    );

    setPositions(updated);

    if (selectedPosition?.id === pos.id) {
      setSelectedPosition({
        ...selectedPosition,
        approvalStatus: "Approved",
        lastUpdated: "August 19, 2026",
        updatedBy: "6496",
      });
    }

    triggerToast(`Position "${pos.title}" (${pos.id}) has been Approved.`);
  };

  const handleApprovePosition = (pos: AvailablePositionRecord) => {
    setConfirmState({
      title: "Approve Available Position",
      message: `${pos.title} will be approved and reflected in the Available Positions directory.`,
      confirmLabel: "Approve",
      onConfirm: () => applyApprovePosition(pos),
    });
  };

  const applyRejectPosition = (pos: AvailablePositionRecord) => {
    const updated = positions.map((p) =>
      p.id === pos.id
        ? {
            ...p,
            approvalStatus: "Rejected" as const,
            lastUpdated: "August 19, 2026",
            updatedBy: "6496",
          }
        : p
    );

    setPositions(updated);

    if (selectedPosition?.id === pos.id) {
      setSelectedPosition({
        ...selectedPosition,
        approvalStatus: "Rejected",
        lastUpdated: "August 19, 2026",
        updatedBy: "6496",
      });
    }

    triggerToast(`Position "${pos.title}" (${pos.id}) has been Rejected.`);
  };

  const handleRejectPosition = (pos: AvailablePositionRecord) => {
    setConfirmState({
      title: "Reject Available Position",
      message: `${pos.title} will be rejected and remain unavailable for applicant-facing use.`,
      confirmLabel: "Reject",
      onConfirm: () => applyRejectPosition(pos),
    });
  };

  const handleSavePosition = (updatedPos: AvailablePositionRecord) => {
    const updated = positions.map((p) => (p.id === updatedPos.id ? updatedPos : p));
    setPositions(updated);
    setSelectedPosition(updatedPos);
    triggerToast(`Position "${updatedPos.title}" (${updatedPos.id}) saved successfully.`);
  };

  const statusCounts = useMemo(
    () => ({
      "ALL POSITIONS": positions.length,
      "FOR APPROVAL": positions.filter((p) => p.approvalStatus === "For Approval").length,
      ACTIVE: positions.filter((p) => p.status === "Active").length,
      INACTIVE: positions.filter((p) => p.status === "Inactive").length,
      APPROVED: positions.filter((p) => p.approvalStatus === "Approved").length,
      REJECTED: positions.filter((p) => p.approvalStatus === "Rejected").length,
      ARCHIVED: positions.filter((p) => p.approvalStatus === "Archived").length,
      "UNLINKED FROM JOB DESCRIPTIONS": positions.filter((p) => !p.isLinkedToJd).length,
    }),
    [positions]
  );

  const statusTabs: NavTabType[] = [
    "ALL POSITIONS",
    "FOR APPROVAL",
    "ACTIVE",
    "INACTIVE",
    "APPROVED",
    "REJECTED",
    "ARCHIVED",
    "UNLINKED FROM JOB DESCRIPTIONS",
  ];

  const hasActiveFilters =
    searchTerm.trim() ||
    statusFilter !== "All Statuses" ||
    departmentFilter !== "All Departments" ||
    accountFilter !== "All Accounts" ||
    locationFilter !== "All Locations";

  return (
    <div
      className="flex-1 select-none space-y-5 pb-12 font-jakarta sm:space-y-6"
      id="available-positions-view"
    >
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed right-6 top-20 z-[11000] flex items-center gap-3 rounded-r-xl border-l-4 border-[#FF5C28] bg-[#042C51] px-5 py-3 text-xs font-semibold text-white shadow-2xl"
          >
            <CheckCircle2 className="h-4 w-4 text-[#FF5C28]" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ==================== HEADER / ACTIONS ==================== */}
      <section className="relative overflow-hidden rounded-2xl border border-[#DCE6F1] bg-white p-5 shadow-sm sm:p-6">
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#042C51] via-[#0A4B7A] to-[#FF5C28]" />

        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-100 bg-[#E9F0FC] px-2.5 py-1 text-[9px] font-black uppercase tracking-wide text-[#042C51]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#FF5C28]" />
                Recruitment View
              </span>
            </div>

            <h1 className="mt-2 text-xl font-black tracking-tight text-[#042C51] sm:text-2xl">
              Available Positions
            </h1>

            <p className="mt-1 max-w-3xl text-xs font-medium leading-5 text-[#667085]">
              Manage canonical roles, organizational mapping, linked Job Descriptions,
              and applicant visibility.
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={() => triggerToast("Available positions refreshed.")}
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[#DCE6F1] bg-white text-[#475467] transition hover:border-[#FF5C28]/40 hover:bg-[#FFF8F5] hover:text-[#FF5C28]"
              title="Refresh available positions"
              aria-label="Refresh available positions"
            >
              <RefreshCw className="h-4 w-4" />
            </button>

            <button
              type="button"
              onClick={() =>
                triggerToast("Add New Position is represented as static UI in this prototype.")
              }
              className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg bg-[#FF5C28] px-4 text-xs font-extrabold text-white shadow-sm transition hover:bg-[#E95324]"
            >
              <Plus className="h-4 w-4" />
              Add New Position
            </button>
          </div>
        </div>
      </section>

      {/* ==================== RECORDS / FILTERS / TABLE ==================== */}
      <section className="overflow-visible rounded-2xl border border-[#DCE6F1] bg-white shadow-sm">
        <div className="rounded-t-2xl border-b border-[#E6ECF2] bg-white p-4 sm:p-5 2xl:p-6">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-sm font-extrabold text-[#042C51] sm:text-base">
                Available Position Records
              </h2>
              <p className="mt-1 text-xs font-semibold text-[#667085]">
                Search and filter positions by title, department, account, status, and site.
              </p>
            </div>

            <span className="inline-flex w-fit items-center rounded-full border border-blue-100 bg-blue-50 px-2.5 py-0.5 text-[10px] font-extrabold text-[#042C51]">
              {filteredPositions.length} Records
            </span>
          </div>

          <div className="mt-3.5 grid grid-cols-1 gap-3 xl:grid-cols-[minmax(280px,1.55fr)_minmax(150px,.8fr)_minmax(170px,.9fr)_minmax(170px,.9fr)_minmax(150px,.8fr)_auto] xl:items-end 2xl:mt-4">
            <div className="min-w-0">
              <label className="mb-1.5 block text-[10px] font-extrabold text-[#101828]">
                Search
              </label>
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#98A2B3]" />
                <input
                  type="text"
                  placeholder="Search position, JD, department, account, or skills..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="h-10 w-full rounded-lg border border-[#D7DEE8] bg-[#F8FAFC] pl-9 pr-3 text-xs font-semibold text-[#042C51] outline-none transition placeholder:text-[#98A2B3] hover:border-[#FF5C28]/40 hover:bg-white focus:border-[#FF5C28] focus:bg-white focus:ring-2 focus:ring-[#FF5C28]/10"
                />
              </div>
            </div>

            <div className="min-w-0">
              <label className="mb-1.5 block text-[10px] font-extrabold text-[#101828]">
                Status
              </label>
              <div className="relative">
                <select
                  value={statusFilter}
                  onChange={(e) => handleStatusFilterChange(e.target.value)}
                  className="h-10 w-full appearance-none rounded-lg border border-[#D7DEE8] bg-[#F8FAFC] px-3 pr-8 text-xs font-semibold text-[#042C51] outline-none transition hover:border-[#FF5C28]/40 hover:bg-white focus:border-[#FF5C28] focus:bg-white focus:ring-2 focus:ring-[#FF5C28]/10"
                >
                  <option value="All Statuses">All Statuses</option>
                  <option value="For Approval">For Approval</option>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                  <option value="Approved">Approved</option>
                  <option value="Rejected">Rejected</option>
                  <option value="Archived">Archived</option>
                  <option value="Unlinked from JD">Unlinked from JD</option>
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#042C51]" />
              </div>
            </div>

            <div className="min-w-0">
              <label className="mb-1.5 block text-[10px] font-extrabold text-[#101828]">
                Department
              </label>
              <div className="relative">
                <select
                  value={departmentFilter}
                  onChange={(e) => {
                    setDepartmentFilter(e.target.value);
                    setAccountFilter("All Accounts");
                  }}
                  className="h-10 w-full appearance-none rounded-lg border border-[#D7DEE8] bg-[#F8FAFC] px-3 pr-8 text-xs font-semibold text-[#042C51] outline-none transition hover:border-[#FF5C28]/40 hover:bg-white focus:border-[#FF5C28] focus:bg-white focus:ring-2 focus:ring-[#FF5C28]/10"
                >
                  <option value="All Departments">All Departments</option>
                  {uniqueDepartments.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#042C51]" />
              </div>
            </div>

            <div className="min-w-0">
              <label className="mb-1.5 block text-[10px] font-extrabold text-[#101828]">
                Account
              </label>
              <div className="relative">
                <select
                  value={accountFilter}
                  onChange={(e) => setAccountFilter(e.target.value)}
                  className="h-10 w-full appearance-none rounded-lg border border-[#D7DEE8] bg-[#F8FAFC] px-3 pr-8 text-xs font-semibold text-[#042C51] outline-none transition hover:border-[#FF5C28]/40 hover:bg-white focus:border-[#FF5C28] focus:bg-white focus:ring-2 focus:ring-[#FF5C28]/10"
                >
                  <option value="All Accounts">All Accounts</option>
                  {uniqueAccounts.map((account) => (
                    <option key={account} value={account}>
                      {account}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#042C51]" />
              </div>
            </div>

            <div className="min-w-0">
              <label className="mb-1.5 block text-[10px] font-extrabold text-[#101828]">
                Location
              </label>
              <div className="relative">
                <select
                  value={locationFilter}
                  onChange={(e) => setLocationFilter(e.target.value)}
                  className="h-10 w-full appearance-none rounded-lg border border-[#D7DEE8] bg-[#F8FAFC] px-3 pr-8 text-xs font-semibold text-[#042C51] outline-none transition hover:border-[#FF5C28]/40 hover:bg-white focus:border-[#FF5C28] focus:bg-white focus:ring-2 focus:ring-[#FF5C28]/10"
                >
                  <option value="All Locations">All Locations</option>
                  {uniqueLocations.map((location, idx) => (
                    <option key={`loc-${location}-${idx}`} value={location}>
                      {location}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#042C51]" />
              </div>
            </div>

            <button
              type="button"
              onClick={handleClearFilters}
              disabled={!hasActiveFilters}
              className="inline-flex h-10 w-full items-center justify-center gap-1.5 rounded-lg border border-[#DCE6F1] bg-white px-4 text-xs font-extrabold text-[#667085] transition hover:border-[#FF5C28]/40 hover:bg-[#FFF8F5] hover:text-[#FF5C28] disabled:cursor-not-allowed disabled:opacity-50 xl:w-auto"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Clear
            </button>
          </div>
        </div>

        <div className="p-4 sm:p-5 2xl:p-6">
          <div className="overflow-hidden rounded-xl border border-[#E6ECF2] bg-white">
            {/* Status tabs */}
            <div className="flex overflow-x-auto border-b border-[#E6ECF2] bg-[#F8FAFC] px-4 pt-3">
              {statusTabs.map((tab) => {
                const active = activeTab === tab;

                return (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => handleTabChange(tab)}
                    className={`relative whitespace-nowrap px-4 py-3 text-[10px] font-extrabold uppercase tracking-normal transition-colors ${
                      active
                        ? "bg-white text-[#042C51]"
                        : "text-[#667085] hover:text-[#042C51]"
                    }`}
                  >
                    <span className="inline-flex items-center gap-2">
                      {tab}
                      <span
                        className={`rounded-full px-2 py-0.5 text-[9px] font-extrabold ${
                          active
                            ? "bg-[#042C51] text-white"
                            : "bg-[#E9EEF4] text-[#667085]"
                        }`}
                      >
                        {statusCounts[tab]}
                      </span>
                    </span>

                    {active ? (
                      <span className="absolute inset-x-0 bottom-0 h-0.5 bg-[#FF5C28]" />
                    ) : null}
                  </button>
                );
              })}
            </div>

            {/* Desktop table */}
            <div className="hidden max-h-[640px] overflow-auto lg:block">
              <table className="w-full min-w-[1180px] border-collapse bg-white text-left text-xs">
                <thead className="sticky top-0 z-10 bg-[#F8FAFC]">
                  <tr className="border-b border-[#E6ECF2]">
                    <th className="px-4 py-3 text-[10px] font-extrabold uppercase text-[#667085]">
                      Position ID
                    </th>
                    <th className="px-4 py-3 text-[10px] font-extrabold uppercase text-[#667085]">
                      Position & Mapping
                    </th>
                    <th className="px-4 py-3 text-[10px] font-extrabold uppercase text-[#667085]">
                      Linked JD Manual
                    </th>
                    <th className="px-4 py-3 text-[10px] font-extrabold uppercase text-[#667085]">
                      Location
                    </th>
                    <th className="px-4 py-3 text-center text-[10px] font-extrabold uppercase text-[#667085]">
                      Status
                    </th>
                    <th className="px-4 py-3 text-center text-[10px] font-extrabold uppercase text-[#667085]">
                      Approval Status
                    </th>
                    <th className="px-4 py-3 text-center text-[10px] font-extrabold uppercase text-[#667085]">
                      JD Link Status
                    </th>
                    <th className="px-4 py-3 text-[10px] font-extrabold uppercase text-[#667085]">
                      Last Updated
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-[#E6ECF2]">
                  {filteredPositions.length > 0 ? (
                    filteredPositions.map((pos, index) => {
                      const unlinked = !pos.isLinkedToJd;

                      return (
                        <tr
                          key={pos.id}
                          onClick={() => handleRowClick(pos)}
                          className={`cursor-pointer transition-colors ${
                            unlinked
                              ? "bg-[#FFF4EF] hover:bg-[#FFE9E0]"
                              : "bg-white hover:bg-[#F8FAFC]"
                          }`}
                          style={{
                            animationDelay: `${index * 30}ms`,
                            animationFillMode: "both",
                          }}
                        >
                          <td className="px-4 py-2.5 align-middle">
                            <span
                              className={`inline-flex whitespace-nowrap rounded-lg px-2.5 py-1 font-mono text-[10px] font-extrabold tabular-nums ${
                                unlinked
                                  ? "border border-[#FFD1C4] bg-[#FFF0EA] text-[#A5492B]"
                                  : "bg-[#F2F6FA] text-[#042C51]"
                              }`}
                            >
                              {pos.id}
                            </span>
                          </td>

                          <td className="px-4 py-2.5 align-middle">
                            <p
                              className="max-w-[240px] truncate text-xs font-extrabold text-[#042C51]"
                              title={pos.title}
                            >
                              {pos.title}
                            </p>
                            <p className="mt-0.5 max-w-[240px] truncate text-[10px] font-semibold text-[#667085]">
                              {pos.department}
                            </p>
                            <p className="mt-0.5 max-w-[240px] truncate text-[10px] font-semibold text-[#98A2B3]">
                              {pos.account}
                            </p>
                          </td>

                          <td className="px-4 py-2.5 align-middle">
                            <p className="max-w-[210px] truncate text-xs font-extrabold text-[#042C51]">
                              {pos.isLinkedToJd ? pos.jdRoleTitle || pos.title : "—"}
                            </p>
                            <p className="mt-0.5 max-w-[210px] truncate text-[10px] font-semibold text-[#98A2B3]">
                              {pos.isLinkedToJd ? pos.jdCode || pos.jdId || "—" : "—"}
                            </p>
                          </td>

                          <td className="px-4 py-2.5 align-middle text-xs font-semibold text-[#475467]">
                            {pos.location}
                          </td>

                          <td className="px-4 py-2.5 text-center align-middle">
                            <span
                              className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[9px] font-extrabold ${
                                pos.status === "Active"
                                  ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                                  : "border-slate-200 bg-slate-50 text-slate-600"
                              }`}
                            >
                              {pos.status}
                            </span>
                          </td>

                          <td className="px-4 py-2.5 text-center align-middle">
                            <span
                              className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[9px] font-extrabold ${
                                pos.approvalStatus === "Approved"
                                  ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                                  : pos.approvalStatus === "For Approval"
                                    ? "border-amber-200 bg-amber-50 text-amber-700"
                                    : pos.approvalStatus === "Rejected"
                                      ? "border-red-200 bg-red-50 text-red-700"
                                      : "border-slate-200 bg-slate-50 text-slate-600"
                              }`}
                            >
                              {pos.approvalStatus}
                            </span>
                          </td>

                          <td className="px-4 py-2.5 text-center align-middle">
                            {pos.isLinkedToJd ? (
                              <span className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[9px] font-extrabold text-emerald-700">
                                <CheckCircle className="h-3 w-3" />
                                Linked
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border border-[#FFB39F] bg-[#FFE1D8] px-2.5 py-1 text-[9px] font-extrabold text-[#D92D20]">
                                <AlertTriangle className="h-3 w-3" />
                                Unlinked from JD
                              </span>
                            )}
                          </td>

                          <td className="px-4 py-2.5 align-middle">
                            <p className="text-xs font-extrabold tabular-nums text-[#344054]">
                              {pos.lastUpdated}
                            </p>
                            <p className="mt-0.5 text-[10px] font-bold text-[#667085]">
                              By: {pos.updatedBy}
                            </p>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={8} className="px-5 py-14 text-center">
                        <BriefcaseBusiness className="mx-auto h-9 w-9 text-[#CBD5E1]" />
                        <p className="mt-3 text-sm font-extrabold text-[#042C51]">
                          No Available Positions Found
                        </p>
                        <p className="mt-1 text-xs font-semibold text-[#98A2B3]">
                          Adjust the active filters or register a new position.
                        </p>
                        <button
                          type="button"
                          onClick={handleClearFilters}
                          className="mt-3 inline-flex h-8 items-center justify-center gap-1.5 rounded-lg bg-[#042C51] px-3 text-[10px] font-extrabold text-white transition hover:bg-[#FF5C28]"
                        >
                          <RotateCcw className="h-3 w-3" />
                          Reset Filters
                        </button>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="space-y-3 p-3.5 lg:hidden">
              {filteredPositions.length > 0 ? (
                filteredPositions.map((pos) => (
                  <button
                    key={pos.id}
                    type="button"
                    onClick={() => handleRowClick(pos)}
                    className={`w-full rounded-xl border p-4 text-left transition ${
                      !pos.isLinkedToJd
                        ? "border-[#FFD1C4] bg-[#FFF4EF]"
                        : "border-[#E6ECF2] bg-white hover:border-[#FF5C28]/40"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-mono text-[10px] font-extrabold text-[#667085]">
                          {pos.id}
                        </p>
                        <p className="mt-1 truncate text-xs font-extrabold text-[#042C51]">
                          {pos.title}
                        </p>
                        <p className="mt-0.5 truncate text-[10px] font-semibold text-[#667085]">
                          {pos.department} • {pos.account}
                        </p>
                      </div>

                      <span
                        className={`shrink-0 rounded-full border px-2.5 py-1 text-[9px] font-extrabold ${
                          pos.status === "Active"
                            ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                            : "border-slate-200 bg-slate-50 text-slate-600"
                        }`}
                      >
                        {pos.status}
                      </span>
                    </div>

                    <div className="mt-3 grid grid-cols-2 gap-3 rounded-lg border border-[#EEF2F6] bg-[#F8FAFC] p-3">
                      <div>
                        <span className="block text-[9px] font-bold uppercase text-[#98A2B3]">
                          Location
                        </span>
                        <span className="mt-1 block text-[11px] font-extrabold text-[#042C51]">
                          {pos.location}
                        </span>
                      </div>
                      <div>
                        <span className="block text-[9px] font-bold uppercase text-[#98A2B3]">
                          Approval
                        </span>
                        <span className="mt-1 block text-[11px] font-extrabold text-[#042C51]">
                          {pos.approvalStatus}
                        </span>
                      </div>
                    </div>
                  </button>
                ))
              ) : (
                <div className="py-10 text-center">
                  <BriefcaseBusiness className="mx-auto h-8 w-8 text-[#CBD5E1]" />
                  <p className="mt-2 text-sm font-extrabold text-[#042C51]">
                    No Available Positions Found
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Pagination footer */}
          <div className="flex flex-col items-center justify-between gap-3 pt-3 text-xs text-[#667085] sm:flex-row">
            <div>
              Showing{" "}
              <strong className="text-[#042C51]">{filteredPositions.length}</strong>{" "}
              loaded position{filteredPositions.length === 1 ? "" : "s"} out of{" "}
              <strong className="text-[#042C51]">{filteredPositions.length}</strong>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                disabled
                className="inline-flex h-8 items-center gap-1 rounded-lg border border-[#DCE6F1] bg-white px-3 text-[10px] font-extrabold text-[#98A2B3] disabled:cursor-not-allowed"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
                Previous
              </button>

              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#FF5C28] text-[10px] font-extrabold text-white">
                1
              </span>

              <button
                type="button"
                disabled
                className="inline-flex h-8 items-center gap-1 rounded-lg border border-[#DCE6F1] bg-white px-3 text-[10px] font-extrabold text-[#98A2B3] disabled:cursor-not-allowed"
              >
                Next
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== PROCESS NOTE ==================== */}
      <section className="rounded-xl border border-[#DCE6F1] bg-[#F8FAFC] p-4">
        <div className="flex items-start gap-2.5 sm:gap-3">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[#DCE6F1] bg-white text-[#042C51]">
            <Database className="h-4 w-4" />
          </span>

          <div className="min-w-0">
            <h3 className="text-xs font-extrabold text-[#042C51]">
              Database Mapping Rule
            </h3>
            <p className="mt-1 text-xs font-semibold leading-5 text-[#042C51]/75">
              Departments and accounts are represented by the current static prototype
              records. Active positions are applicant-facing, while inactive and archived
              positions remain unavailable.
            </p>
          </div>
        </div>
      </section>

      <PositionDetailsModal
        isOpen={isModalOpen}
        position={selectedPosition}
        onClose={() => setIsModalOpen(false)}
        onApprove={handleApprovePosition}
        onReject={handleRejectPosition}
        onSave={handleSavePosition}
      />

      <ConfirmationModal
        open={Boolean(confirmState)}
        title={confirmState?.title}
        message={confirmState?.message}
        confirmLabel={confirmState?.confirmLabel}
        onCancel={() => setConfirmState(null)}
        onConfirm={() => {
          const action = confirmState?.onConfirm;
          setConfirmState(null);
          action?.();
        }}
      />
    </div>
  );

}
