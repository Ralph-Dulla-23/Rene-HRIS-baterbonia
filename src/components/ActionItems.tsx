import React, { useState, useMemo } from "react";
import {
  CheckSquare,
  AlertTriangle,
  Clock,
  User,
  Plus,
  Search,
  Filter,
  ShieldAlert,
  Sparkles,
  Layers,
  Compass,
  Network,
  Briefcase,
  ArrowRight,
  Eye,
  RefreshCw,
  BookOpen,
  Info,
  Trash2,
  X,
  ChevronRight,
  TrendingUp,
  CheckCircle2,
  AlertCircle,
  Activity,
  UserCheck
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface ActionItemsProps {
  userEmail?: string;
  onSwitchModule?: (module: string) => void;
}

export interface ActionItem {
  id: string; // e.g. ACT-001
  sourceType: "Manual" | "System";
  description: string;
  module: "Sourcing" | "Pipeline" | "Offers" | "Onboarding" | "General";
  role: string;
  account: string;
  owner: string;
  deadline: string; // Date
  status: "Planned" | "Ongoing" | "Completed" | "Cancelled";
  risk: "Low" | "Medium" | "High";
  gap: "Low Sourcing Volume" | "Aging PRF" | "High Drop-off Rate" | "Delayed Medical Clearance" | "SLA At Risk" | "Contract Issue" | "None";
  longDescription?: string;
  notes?: string;
  history: { date: string; action: string; user: string }[];
}

export interface ModuleSignal {
  id: string;
  title: string;
  module: "Sourcing" | "Pipeline" | "Offers" | "Onboarding";
  severity: "Low" | "Medium" | "High";
  metric: string;
  description: string;
  suggestedAction: string;
}

const INITIAL_ACTION_ITEMS: ActionItem[] = [
  {
    id: "ACT-001",
    sourceType: "System",
    description: "Launch urgent social media boosting for Elevance Health candidates",
    module: "Sourcing",
    role: "Healthcare Support Specialist",
    account: "Elevance Health",
    owner: "Alena Batacan",
    deadline: "2026-07-23",
    status: "Ongoing",
    risk: "High",
    gap: "Low Sourcing Volume",
    longDescription: "System detected a 35% drop in Elevance Health applicants this week. BPO campaign SLA requires 25 profiles weekly.",
    notes: "Allocated budget of Php 5,000 for localized Facebook and TikTok target ads.",
    history: [
      { date: "2026-07-19", action: "System generated signal: Sourcing volume is below threshold.", user: "System" },
      { date: "2026-07-20", action: "Campaign approved and assigned to Alena.", user: "Alena Batacan" }
    ]
  },
  {
    id: "ACT-002",
    sourceType: "System",
    description: "Audit aging candidate files in Stage 2 (Technical Interview) for Chevron Support",
    module: "Pipeline",
    role: "Customer Service Representative",
    account: "Chevron Support",
    owner: "Juan dela Cruz",
    deadline: "2026-07-22",
    status: "Planned",
    risk: "Medium",
    gap: "Aging PRF",
    longDescription: "There are currently 12 candidates sitting in Technical Assessment phase for more than 4 business days. High SLA compliance risk.",
    notes: "Requires coordination with Chevron Operations team for calibration.",
    history: [
      { date: "2026-07-18", action: "System identified aging pipeline items (>3 days).", user: "System" }
    ]
  },
  {
    id: "ACT-003",
    sourceType: "Manual",
    description: "Re-negotiate premium medical allowance cap structure with Citi Global finance",
    module: "Offers",
    role: "Team Leader - BPO Operations",
    account: "Citi Global",
    owner: "Maria Santos",
    deadline: "2026-07-21",
    status: "Ongoing",
    risk: "High",
    gap: "Contract Issue",
    longDescription: "Candidates are dropping out due to medical allowance disparity. Standard cap is Php 2,500, competitors are offering Php 4,000.",
    notes: "Preparing comparative compensation deck to justify increase.",
    history: [
      { date: "2026-07-15", action: "Manual action item created due to candidate exit feedback.", user: "Maria Santos" },
      { date: "2026-07-17", action: "Drafted proposal deck for BPO leadership approval.", user: "Maria Santos" }
    ]
  },
  {
    id: "ACT-004",
    sourceType: "System",
    description: "Follow up with Elevance medical provider on delayed laboratory clearances",
    module: "Onboarding",
    role: "Healthcare Support Specialist",
    account: "Elevance Health",
    owner: "Alena Batacan",
    deadline: "2026-07-25",
    status: "Planned",
    risk: "Medium",
    gap: "Delayed Medical Clearance",
    longDescription: "Three candidates (including Theresa Mae Santos) are waiting for physical exam results. Expected start date is fast approaching.",
    notes: "Contacted clinical admin. Turnaround delayed due to system upgrade on their side.",
    history: [
      { date: "2026-07-20", action: "Auto-triggered based on upcoming expected start date.", user: "System" }
    ]
  },
  {
    id: "ACT-005",
    sourceType: "Manual",
    description: "Execute bulk SMS broadcast to passive tech profiles in Talent Pool",
    module: "Sourcing",
    role: "Technical Support Associate",
    account: "RingCentral Team",
    owner: "Juan dela Cruz",
    deadline: "2026-07-28",
    status: "Completed",
    risk: "Low",
    gap: "None",
    longDescription: "Blast custom message about weekend hiring events to 500 passive candidates from high-affinity technical backgrounds.",
    notes: "Broadcast successfully sent on July 19th. Generated 42 walk-in applications.",
    history: [
      { date: "2026-07-18", action: "Action item registered for campaign enhancement.", user: "Juan dela Cruz" },
      { date: "2026-07-19", action: "SMS blast completed via Gateway API.", user: "Juan dela Cruz" },
      { date: "2026-07-19", action: "Marked task as completed.", user: "Juan dela Cruz" }
    ]
  },
  {
    id: "ACT-006",
    sourceType: "System",
    description: "Review high pre-start withdrawal spike (15% drop-off) in Comcast Technical campaign",
    module: "Onboarding",
    role: "Technical Support Associate",
    account: "Comcast Technical",
    owner: "Alena Batacan",
    deadline: "2026-07-18",
    status: "Ongoing",
    risk: "High",
    gap: "High Drop-off Rate",
    longDescription: "Comcast campaign experiencing unusually high attrition between offer sign-off and actual Day 1 orientation. Target max is 5%. Task is overdue.",
    notes: "Investigating whether sign-on bonus is being paid too late compared to rivals.",
    history: [
      { date: "2026-07-14", action: "System alert: Attrition rate has breached 10% critical threshold.", user: "System" },
      { date: "2026-07-15", action: "Initiated survey to withdrawn candidates.", user: "Alena Batacan" }
    ]
  }
];

const INITIAL_MODULE_SIGNALS: ModuleSignal[] = [
  {
    id: "SIG-001",
    title: "Low Applicant Density Alert",
    module: "Sourcing",
    severity: "High",
    metric: "2.4 applicants / position",
    description: "The Elevance Healthcare Support campaign has only registered 12 applicants against a requirement of 25 profiles this cycle.",
    suggestedAction: "Trigger Facebook local targeted paid ads or run text-blast on passive medical database."
  },
  {
    id: "SIG-002",
    title: "Candidate Staleness Warning",
    module: "Pipeline",
    severity: "Medium",
    metric: "Avg. 5.2 days idle",
    description: "Chevron Customer Support technical assessment has 12 candidates waiting over 4 business days.",
    suggestedAction: "Follow up with operations hiring manager for assessment scoring submission."
  },
  {
    id: "SIG-003",
    title: "Onboarding Pipeline Leakage",
    module: "Onboarding",
    severity: "High",
    metric: "15.4% pre-start withdrawal",
    description: "Comcast Technical Associate campaign has experienced an escalation in pre-employment withdrawals.",
    suggestedAction: "Evaluate and consider implementing virtual orientation or advance uniform fitting kits."
  },
  {
    id: "SIG-004",
    title: "Offer SLA Warning",
    module: "Offers",
    severity: "Low",
    metric: "SLA compliance at 83%",
    description: "Citi Global operations are taking longer than standard 24-hour turnaround to issue written offers post-final pass.",
    suggestedAction: "Review approval workflow delays in the Offer generation pipeline."
  }
];

export default function ActionItems({ userEmail = "alena.batacan@thesiblingssolutions.com", onSwitchModule }: ActionItemsProps) {
  const [items, setItems] = useState<ActionItem[]>(INITIAL_ACTION_ITEMS);
  const [signals] = useState<ModuleSignal[]>(INITIAL_MODULE_SIGNALS);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Search & Filtering State
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [riskFilter, setRiskFilter] = useState("All");
  const [moduleFilter, setModuleFilter] = useState("All");
  const [gapFilter, setGapFilter] = useState("All");
  const [ownerFilter, setOwnerFilter] = useState("All");

  // Selected Action Item Details Modal State
  const [selectedItem, setSelectedItem] = useState<ActionItem | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  // New Action Item Form State (Create Modal)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newDescription, setNewDescription] = useState("");
  const [newModule, setNewModule] = useState<ActionItem["module"]>("General");
  const [newRole, setNewRole] = useState("Customer Service Representative");
  const [newAccount, setNewAccount] = useState("Elevance Health");
  const [newOwner, setNewOwner] = useState("Alena Batacan");
  const [newDeadline, setNewDeadline] = useState("2026-07-25");
  const [newRisk, setNewRisk] = useState<ActionItem["risk"]>("Medium");
  const [newGap, setNewGap] = useState<ActionItem["gap"]>("None");
  const [newLongDescription, setNewLongDescription] = useState("");
  const [newNotes, setNewNotes] = useState("");

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  const handleResetDatabase = () => {
    setItems(INITIAL_ACTION_ITEMS);
    triggerToast("Action Items registry successfully restored to baseline.");
  };

  // List of unique recruiter owners for filters
  const ownersList = useMemo(() => {
    const set = new Set<string>();
    items.forEach(it => set.add(it.owner));
    return ["All", ...Array.from(set)];
  }, [items]);

  // List of unique gaps for filters
  const gapsList = useMemo(() => {
    const set = new Set<string>();
    items.forEach(it => {
      if (it.gap && it.gap !== "None") set.add(it.gap);
    });
    return ["All", ...Array.from(set)];
  }, [items]);

  // Calculate current date to find overdue items
  // Current metadata says 2026-07-20
  const CURRENT_DATE_STR = "2026-07-20";
  const currentDate = new Date(CURRENT_DATE_STR);

  // Calculations for Metrics Cards
  const metrics = useMemo(() => {
    const total = items.length;
    const active = items.filter(it => it.status === "Ongoing").length;
    const planned = items.filter(it => it.status === "Planned").length;
    const completed = items.filter(it => it.status === "Completed").length;
    const highRisk = items.filter(it => it.risk === "High" && it.status !== "Completed" && it.status !== "Cancelled").length;
    
    // Calculate Overdue (Deadline in the past and not completed/cancelled)
    const overdue = items.filter(it => {
      if (it.status === "Completed" || it.status === "Cancelled") return false;
      return new Date(it.deadline) < currentDate;
    }).length;

    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
    const totalSignals = signals.length;

    // Percentages for Progress Bars (Action Health)
    const activePct = total > 0 ? Math.round((active / total) * 100) : 0;
    const plannedPct = total > 0 ? Math.round((planned / total) * 100) : 0;
    const completedPct = total > 0 ? Math.round((completed / total) * 100) : 0;
    const highRiskPct = total > 0 ? Math.round((highRisk / total) * 100) : 0;
    const overduePct = total > 0 ? Math.round((overdue / total) * 100) : 0;

    return {
      total,
      active,
      planned,
      completed,
      highRisk,
      overdue,
      completionRate,
      totalSignals,
      activePct,
      plannedPct,
      completedPct,
      highRiskPct,
      overduePct
    };
  }, [items, signals]);

  // Calculate Days Left helper
  const getDaysLeftText = (deadlineStr: string) => {
    const dDate = new Date(deadlineStr);
    const diffTime = dDate.getTime() - currentDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      return { text: `${Math.abs(diffDays)} days overdue`, colorClass: "text-rose-600 font-bold" };
    } else if (diffDays === 0) {
      return { text: "Due today", colorClass: "text-amber-600 font-bold" };
    } else {
      return { text: `${diffDays} days left`, colorClass: "text-emerald-600 font-semibold" };
    }
  };

  // Filtered Action Items
  const filteredItems = useMemo(() => {
    return items.filter(it => {
      const matchSearch =
        it.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        it.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        it.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
        it.account.toLowerCase().includes(searchTerm.toLowerCase()) ||
        it.owner.toLowerCase().includes(searchTerm.toLowerCase());

      const matchStatus = statusFilter === "All" ? true : it.status === statusFilter;
      const matchRisk = riskFilter === "All" ? true : it.risk === riskFilter;
      const matchModule = moduleFilter === "All" ? true : it.module === moduleFilter;
      const matchGap = gapFilter === "All" ? true : it.gap === gapFilter;
      const matchOwner = ownerFilter === "All" ? true : it.owner === ownerFilter;

      return matchSearch && matchStatus && matchRisk && matchModule && matchGap && matchOwner;
    });
  }, [items, searchTerm, statusFilter, riskFilter, moduleFilter, gapFilter, ownerFilter]);

  // Priority Watchlist - high risk open items sorted by nearest deadline
  const priorityWatchlist = useMemo(() => {
    return items
      .filter(it => it.status !== "Completed" && it.status !== "Cancelled" && (it.risk === "High" || it.risk === "Medium"))
      .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())
      .slice(0, 3);
  }, [items]);

  // Create Manual Action Item
  const handleCreateActionItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDescription.trim()) {
      triggerToast("Please provide an action item description!");
      return;
    }

    const newId = `ACT-0${items.length + 1}`;
    const newItem: ActionItem = {
      id: newId,
      sourceType: "Manual",
      description: newDescription.trim(),
      module: newModule,
      role: newRole,
      account: newAccount,
      owner: newOwner,
      deadline: newDeadline,
      status: "Planned",
      risk: newRisk,
      gap: newGap,
      longDescription: newLongDescription.trim() || "Manual operational item created by recruiter.",
      notes: newNotes.trim() || undefined,
      history: [
        { date: CURRENT_DATE_STR, action: "Manual action item created.", user: "Alena Batacan" }
      ]
    };

    setItems([newItem, ...items]);
    setIsCreateModalOpen(false);

    // Reset Form Fields
    setNewDescription("");
    setNewModule("General");
    setNewRole("Customer Service Representative");
    setNewAccount("Elevance Health");
    setNewDeadline("2026-07-25");
    setNewRisk("Medium");
    setNewGap("None");
    setNewLongDescription("");
    setNewNotes("");

    triggerToast(`Custom task ${newId} has been successfully assigned to ${newItem.owner}!`);
  };

  // Complete/Modify Action Item status
  const handleUpdateStatus = (itemId: string, newStatus: ActionItem["status"]) => {
    setItems(prev =>
      prev.map(it => {
        if (it.id === itemId) {
          const updatedHist = [...it.history];
          updatedHist.push({
            date: CURRENT_DATE_STR,
            action: `Status modified from [${it.status}] to [${newStatus}]`,
            user: "Alena Batacan"
          });
          return {
            ...it,
            status: newStatus,
            history: updatedHist
          };
        }
        return it;
      })
    );
    // If details modal is open, also sync state
    if (selectedItem && selectedItem.id === itemId) {
      setSelectedItem(prev => prev ? { ...prev, status: newStatus } : null);
    }
    triggerToast(`Task status updated to ${newStatus}!`);
  };

  // Add notes from within the Details Modal
  const [tempNotesInput, setTempNotesInput] = useState("");
  const handleAddModalNotes = () => {
    if (!selectedItem || !tempNotesInput.trim()) return;

    setItems(prev =>
      prev.map(it => {
        if (it.id === selectedItem.id) {
          const updatedHist = [...it.history];
          updatedHist.push({
            date: CURRENT_DATE_STR,
            action: `Added operational progress notes.`,
            user: "Alena Batacan"
          });
          return {
            ...it,
            notes: tempNotesInput.trim(),
            history: updatedHist
          };
        }
        return it;
      })
    );

    setSelectedItem(prev => prev ? { ...prev, notes: tempNotesInput.trim() } : null);
    setTempNotesInput("");
    triggerToast("Notes updated successfully.");
  };

  return (
    <div
      className="relative flex flex-1 select-none flex-col space-y-3.5 bg-transparent font-jakarta sm:space-y-4 2xl:space-y-5"
      id="action-items-module-root"
    >
      {/* Toast */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -16, scale: 0.97 }}
            className="fixed right-4 top-20 z-[13000] flex max-w-[430px] items-center gap-3 rounded-xl border border-[#163F63] border-l-4 border-l-[#FF5C28] bg-[#042C51] px-4 py-3 text-xs font-semibold text-white shadow-2xl sm:right-6"
          >
            <CheckCircle2 className="h-4 w-4 shrink-0 text-[#FF5C28]" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <section className="relative overflow-hidden rounded-2xl border border-[#DCE5EF] bg-white shadow-[0_8px_22px_rgba(4,44,81,0.05)]">
        <div className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-[#042C51] via-[#1A5A8A] to-[#FF5C28]" />

        <div className="flex flex-col gap-4 px-5 py-5 sm:px-6 xl:flex-row xl:items-center xl:justify-between 2xl:px-7 2xl:py-6">
          <div className="min-w-0 flex-1">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#042C51] px-2.5 py-1 text-[9px] font-extrabold uppercase tracking-wide text-white">
                <Briefcase className="h-3 w-3 text-[#FF5C28]" />
                Recruitment View
              </span>
            </div>

            <h1 className="text-xl font-black tracking-tight text-[#042C51] sm:text-2xl 2xl:text-[28px]">
              Action Items
            </h1>

            <p className="mt-1 max-w-4xl text-xs font-medium leading-5 text-[#667085] 2xl:text-[13px]">
              Weekly execution priorities, recruitment blockers, accountable actions, and
              system-suggested follow-ups in one focused workflow.
            </p>
          </div>

          <div className="flex w-full flex-wrap items-center gap-2 xl:w-auto xl:justify-end">
            <button
              type="button"
              onClick={handleResetDatabase}
              className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[#D7E0EA] bg-white text-[#475467] transition hover:border-[#FF5C28]/40 hover:bg-[#FFF8F5] hover:text-[#FF5C28]"
              title="Refresh action items"
              aria-label="Refresh action items"
            >
              <RefreshCw className="h-4 w-4" />
            </button>

            <button
              type="button"
              onClick={() => setIsCreateModalOpen(true)}
              className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg bg-[#FF5C28] px-4 text-xs font-extrabold text-white shadow-sm transition hover:bg-[#E95324] active:scale-[0.98]"
            >
              <Plus className="h-4 w-4" />
              Add Action Item
            </button>
          </div>
        </div>
      </section>

      {/* Summary Metrics */}
      <section
        aria-label="Action item summary metrics"
        className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-7"
      >
        {[
          {
            title: "Total Actions",
            value: metrics.total,
            description: "Manual + system",
            Icon: CheckSquare,
            labelClass: "text-[#042C51]",
            iconClass: "bg-[#EAF0F7] text-[#042C51]",
          },
          {
            title: "Ongoing",
            value: metrics.active,
            description: "In progress",
            Icon: Clock,
            labelClass: "text-amber-700",
            iconClass: "bg-amber-50 text-amber-700",
          },
          {
            title: "Planned",
            value: metrics.planned,
            description: "Queued actions",
            Icon: Layers,
            labelClass: "text-indigo-700",
            iconClass: "bg-indigo-50 text-indigo-700",
          },
          {
            title: "Overdue",
            value: metrics.overdue,
            description: "Past deadline",
            Icon: AlertTriangle,
            labelClass: "text-red-700",
            iconClass: "bg-red-50 text-red-700",
          },
          {
            title: "Completed",
            value: metrics.completed,
            description: `${metrics.completionRate}% completion`,
            Icon: CheckCircle2,
            labelClass: "text-emerald-700",
            iconClass: "bg-emerald-50 text-emerald-700",
          },
          {
            title: "High Risk",
            value: metrics.highRisk,
            description: "Critical attention",
            Icon: ShieldAlert,
            labelClass: "text-red-700",
            iconClass: "bg-red-50 text-red-700",
          },
          {
            title: "System Suggested",
            value: items.filter((item) => item.sourceType === "System").length,
            description: "Auto signals",
            Icon: Sparkles,
            featured: true,
          },
        ].map(
          (
            {
              title,
              value,
              description,
              Icon,
              labelClass = "",
              iconClass = "",
              featured = false,
            },
            index,
          ) => (
            <motion.article
              key={title}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.04 }}
              className={`flex h-[104px] min-h-[96px] flex-col justify-between overflow-hidden rounded-xl border p-3 shadow-[0_6px_18px_rgba(4,44,81,0.04)] transition hover:-translate-y-0.5 hover:shadow-md 2xl:h-[116px] 2xl:min-h-[112px] 2xl:p-3.5 ${
                featured
                  ? "border-[#0A467E] bg-gradient-to-br from-[#042C51] to-[#0A467E] text-white"
                  : "border-[#DCE5EF] bg-white"
              }`}
            >
              <div className="flex h-full items-start justify-between gap-2.5">
                <div className="flex h-full min-w-0 flex-1 flex-col justify-between">
                  <div>
                    <p
                      className={`m-0 truncate text-[9.5px] font-extrabold uppercase tracking-wide ${
                        featured ? "text-white" : labelClass
                      }`}
                    >
                      {title}
                    </p>
                    <p
                      className={`mt-1.5 text-2xl font-bold leading-none tabular-nums tracking-tight 2xl:mt-2 2xl:text-3xl ${
                        featured ? "text-white" : labelClass
                      }`}
                    >
                      {value}
                    </p>
                  </div>

                  <p
                    className={`truncate text-[9.5px] font-bold ${
                      featured ? "text-slate-200" : "text-[#667085]"
                    }`}
                  >
                    {description}
                  </p>
                </div>

                <span
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full 2xl:h-9 2xl:w-9 ${
                    featured ? "bg-white/10 text-[#FF5C28]" : iconClass
                  }`}
                >
                  <Icon className="h-4 w-4" strokeWidth={2} />
                </span>
              </div>
            </motion.article>
          ),
        )}
      </section>

      {/* Action Item Registry */}
      <section className="relative z-[20] overflow-visible rounded-2xl border border-[#DCE5EF] bg-white shadow-[0_8px_22px_rgba(4,44,81,0.04)]">
        <header className="border-b border-[#E6ECF2] px-4 py-4 sm:px-5 2xl:px-6">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div className="min-w-0">
              <h2 className="text-sm font-bold tracking-tight text-[#042C51] 2xl:text-base">
                Action Items – JIT Delivery Focus Registry
              </h2>
              <p className="mt-0.5 text-xs font-semibold leading-relaxed text-[#667085]">
                Accountable actions linked to the current recruitment execution scope. Open a
                record to review source details and progress.
              </p>
            </div>

            <span className="w-fit rounded-full border border-blue-100 bg-blue-50 px-2.5 py-1 text-[9px] font-extrabold uppercase tracking-wide text-[#042C51]">
              {filteredItems.length} Records
            </span>
          </div>

          <div className="relative z-[90] mt-3.5 grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-[minmax(280px,1.4fr)_140px_130px_145px_170px_170px_auto]">
            <div className="group relative min-w-0">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#98A2B3] transition-colors group-focus-within:text-[#FF5C28]" />
              <input
                type="text"
                placeholder="Search action, role, account, owner..."
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                className="h-10 w-full rounded-xl border border-[#D7DEE8] bg-white pl-9 pr-9 text-xs font-semibold text-[#042C51] outline-none transition placeholder:text-[#98A2B3] hover:border-[#FF5C28]/40 focus:border-[#FF5C28] focus:ring-4 focus:ring-[#FF5C28]/10"
              />

              {searchTerm ? (
                <button
                  type="button"
                  onClick={() => setSearchTerm("")}
                  className="absolute right-2.5 top-1/2 inline-flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-md text-[#98A2B3] transition hover:bg-[#FFF7F3] hover:text-[#FF5C28]"
                  aria-label="Clear action item search"
                >
                  <X size={13} />
                </button>
              ) : null}
            </div>

            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="h-10 w-full rounded-xl border border-[#D7DEE8] bg-[#F8FAFC] px-3 text-xs font-semibold text-[#042C51] outline-none transition hover:border-[#FF5C28]/40 hover:bg-white focus:border-[#FF5C28] focus:bg-white focus:ring-4 focus:ring-[#FF5C28]/10"
              aria-label="Status filter"
            >
              <option value="All">All Status</option>
              <option value="Planned">Planned</option>
              <option value="Ongoing">Ongoing</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>

            <select
              value={riskFilter}
              onChange={(event) => setRiskFilter(event.target.value)}
              className="h-10 w-full rounded-xl border border-[#D7DEE8] bg-[#F8FAFC] px-3 text-xs font-semibold text-[#042C51] outline-none transition hover:border-[#FF5C28]/40 hover:bg-white focus:border-[#FF5C28] focus:bg-white focus:ring-4 focus:ring-[#FF5C28]/10"
              aria-label="Risk filter"
            >
              <option value="All">All Risk</option>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>

            <select
              value={moduleFilter}
              onChange={(event) => setModuleFilter(event.target.value)}
              className="h-10 w-full rounded-xl border border-[#D7DEE8] bg-[#F8FAFC] px-3 text-xs font-semibold text-[#042C51] outline-none transition hover:border-[#FF5C28]/40 hover:bg-white focus:border-[#FF5C28] focus:bg-white focus:ring-4 focus:ring-[#FF5C28]/10"
              aria-label="Module filter"
            >
              <option value="All">All Modules</option>
              <option value="Sourcing">Sourcing</option>
              <option value="Pipeline">Pipeline</option>
              <option value="Offers">Offers</option>
              <option value="Onboarding">Onboarding</option>
              <option value="General">General</option>
            </select>

            <select
              value={gapFilter}
              onChange={(event) => setGapFilter(event.target.value)}
              className="h-10 w-full rounded-xl border border-[#D7DEE8] bg-[#F8FAFC] px-3 text-xs font-semibold text-[#042C51] outline-none transition hover:border-[#FF5C28]/40 hover:bg-white focus:border-[#FF5C28] focus:bg-white focus:ring-4 focus:ring-[#FF5C28]/10"
              aria-label="Gap filter"
            >
              {gapsList.map((gap) => (
                <option key={gap} value={gap}>
                  {gap === "All" ? "All Gaps" : gap}
                </option>
              ))}
            </select>

            <select
              value={ownerFilter}
              onChange={(event) => setOwnerFilter(event.target.value)}
              className="h-10 w-full rounded-xl border border-[#D7DEE8] bg-[#F8FAFC] px-3 text-xs font-semibold text-[#042C51] outline-none transition hover:border-[#FF5C28]/40 hover:bg-white focus:border-[#FF5C28] focus:bg-white focus:ring-4 focus:ring-[#FF5C28]/10"
              aria-label="Owner filter"
            >
              {ownersList.map((owner) => (
                <option key={owner} value={owner}>
                  {owner === "All" ? "All Owners" : owner}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={() => {
                setSearchTerm("");
                setStatusFilter("All");
                setRiskFilter("All");
                setModuleFilter("All");
                setGapFilter("All");
                setOwnerFilter("All");
              }}
              disabled={
                !searchTerm &&
                statusFilter === "All" &&
                riskFilter === "All" &&
                moduleFilter === "All" &&
                gapFilter === "All" &&
                ownerFilter === "All"
              }
              className="inline-flex h-10 w-full items-center justify-center gap-1.5 rounded-xl border border-[#D7DEE8] bg-white px-3 text-xs font-extrabold text-[#667085] transition hover:border-[#FF5C28]/40 hover:bg-[#FFF8F5] hover:text-[#FF5C28] disabled:cursor-not-allowed disabled:opacity-45 xl:w-auto"
            >
              <Filter className="h-3.5 w-3.5" />
              Clear
            </button>
          </div>
        </header>

        <div className="p-3.5 sm:p-4 2xl:p-5">
          {/* Desktop Table */}
          <div className="hidden overflow-hidden rounded-xl border border-[#E6ECF2] bg-white lg:block">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1240px] border-collapse text-left text-xs">
                <thead className="bg-[#F8FAFC]">
                  <tr className="border-b border-[#E6ECF2] text-[10px] font-extrabold uppercase tracking-wider text-[#667085]">
                    <th className="w-[27%] px-3 py-2.5 2xl:px-3.5">Action Item</th>
                    <th className="w-[18%] px-3 py-2.5 2xl:px-3.5">Role / Account</th>
                    <th className="w-[11%] px-3 py-2.5">Owner</th>
                    <th className="w-[12%] px-3 py-2.5">Deadline</th>
                    <th className="w-[9%] px-3 py-2.5">Status</th>
                    <th className="w-[8%] px-3 py-2.5">Risk</th>
                    <th className="w-[15%] px-3 py-2.5 text-right">Action</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-[#E6ECF2]">
                  {filteredItems.length ? (
                    filteredItems.map((item, index) => {
                      const daysInfo = getDaysLeftText(item.deadline);
                      const systemGenerated = item.sourceType === "System";

                      return (
                        <motion.tr
                          key={item.id}
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.025 }}
                          onClick={() => {
                            setSelectedItem(item);
                            setIsDetailsModalOpen(true);
                          }}
                          className="cursor-pointer transition hover:bg-[#F8FAFC]"
                        >
                          <td className="px-3 py-2.5 align-middle 2xl:px-3.5">
                            <div className="flex items-center gap-2">
                              <span className="rounded bg-[#F2F4F7] px-1.5 py-0.5 text-[9px] font-extrabold text-[#042C51]">
                                {item.id}
                              </span>
                              <span
                                className={`rounded border px-1.5 py-0.5 text-[8px] font-extrabold uppercase ${
                                  systemGenerated
                                    ? "border-purple-100 bg-purple-50 text-purple-700"
                                    : "border-blue-100 bg-blue-50 text-blue-700"
                                }`}
                              >
                                {systemGenerated ? "System" : "Manual"}
                              </span>
                            </div>

                            <p
                              className="mt-1 line-clamp-2 text-xs font-extrabold leading-5 text-[#042C51]"
                              title={item.description}
                            >
                              {item.description}
                            </p>

                            <div className="mt-1 flex min-w-0 items-center gap-1.5">
                              <span className="truncate text-[9.5px] font-semibold text-[#667085]">
                                {item.module}
                              </span>
                              <span className="text-[#D0D5DD]">•</span>
                              <span
                                className="truncate text-[9.5px] font-semibold text-[#FF5C28]"
                                title={item.gap}
                              >
                                {item.gap === "None" ? "General" : item.gap}
                              </span>
                            </div>
                          </td>

                          <td className="px-3 py-2.5 align-middle 2xl:px-3.5">
                            <p className="truncate text-xs font-extrabold text-[#042C51]">
                              {item.account || "—"}
                            </p>
                            <p className="mt-0.5 truncate text-[10px] font-semibold uppercase text-[#667085]">
                              {item.role || "—"}
                            </p>
                          </td>

                          <td className="px-3 py-2.5 align-middle text-xs font-bold text-[#042C51]">
                            <p className="truncate">{item.owner || "—"}</p>
                          </td>

                          <td className="px-3 py-2.5 align-middle">
                            <p className="text-xs font-extrabold tabular-nums text-[#042C51]">
                              {item.deadline}
                            </p>
                            <p className={`mt-0.5 text-[9px] font-extrabold ${daysInfo.colorClass}`}>
                              {item.status === "Completed" ? "Completed" : daysInfo.text}
                            </p>
                          </td>

                          <td className="px-3 py-2.5 align-middle">
                            <span
                              className={`inline-flex rounded-full border px-2.5 py-1 text-[10px] font-extrabold ${
                                item.status === "Completed"
                                  ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                                  : item.status === "Ongoing"
                                    ? "border-amber-200 bg-amber-50 text-amber-700"
                                    : item.status === "Cancelled"
                                      ? "border-slate-200 bg-slate-100 text-slate-600"
                                      : "border-blue-200 bg-blue-50 text-blue-700"
                              }`}
                            >
                              {item.status}
                            </span>
                          </td>

                          <td className="px-3 py-2.5 align-middle">
                            <span
                              className={`inline-flex rounded-full border px-2.5 py-1 text-[10px] font-extrabold ${
                                item.risk === "High"
                                  ? "border-red-200 bg-red-50 text-red-700"
                                  : item.risk === "Medium"
                                    ? "border-amber-200 bg-amber-50 text-amber-700"
                                    : "border-emerald-200 bg-emerald-50 text-emerald-700"
                              }`}
                            >
                              {item.risk}
                            </span>
                          </td>

                          <td
                            className="px-3 py-2.5 text-right align-middle"
                            onClick={(event) => event.stopPropagation()}
                          >
                            <div className="flex justify-end gap-1.5">
                              {!systemGenerated && item.status !== "Completed" ? (
                                <button
                                  type="button"
                                  onClick={() => handleUpdateStatus(item.id, "Completed")}
                                  className="inline-flex h-8 items-center gap-1 rounded-lg bg-emerald-600 px-2.5 text-[10px] font-extrabold text-white transition hover:bg-emerald-700 active:scale-[0.98]"
                                >
                                  <CheckCircle2 size={12} />
                                  Resolve
                                </button>
                              ) : null}

                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedItem(item);
                                  setIsDetailsModalOpen(true);
                                }}
                                className="inline-flex h-8 items-center gap-1 rounded-lg bg-[#042C51] px-2.5 text-[10px] font-extrabold text-white transition hover:bg-[#073966] active:scale-[0.98]"
                              >
                                <Eye size={12} />
                                Details
                              </button>
                            </div>
                          </td>
                        </motion.tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={7} className="px-5 py-12 text-center">
                        <p className="text-sm font-semibold text-[#98A2B3]">
                          No action items match the current registry filters.
                        </p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile / Tablet Cards */}
          <div className="space-y-3 lg:hidden">
            {filteredItems.length ? (
              filteredItems.map((item, index) => {
                const daysInfo = getDaysLeftText(item.deadline);
                const systemGenerated = item.sourceType === "System";

                return (
                  <motion.article
                    key={item.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.03 }}
                    className="rounded-xl border border-[#E6ECF2] bg-white p-4 shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="rounded bg-[#F2F4F7] px-1.5 py-0.5 text-[9px] font-extrabold text-[#042C51]">
                            {item.id}
                          </span>
                          <span
                            className={`rounded border px-1.5 py-0.5 text-[8px] font-extrabold uppercase ${
                              systemGenerated
                                ? "border-purple-100 bg-purple-50 text-purple-700"
                                : "border-blue-100 bg-blue-50 text-blue-700"
                            }`}
                          >
                            {systemGenerated ? "System" : "Manual"}
                          </span>
                        </div>

                        <h3 className="mt-2 line-clamp-2 text-sm font-extrabold leading-5 text-[#042C51]">
                          {item.description}
                        </h3>
                        <p className="mt-1 text-[10px] font-semibold text-[#667085]">
                          {item.account} · {item.role}
                        </p>
                      </div>

                      <span
                        className={`shrink-0 rounded-full border px-2 py-0.5 text-[9px] font-extrabold ${
                          item.risk === "High"
                            ? "border-red-200 bg-red-50 text-red-700"
                            : item.risk === "Medium"
                              ? "border-amber-200 bg-amber-50 text-amber-700"
                              : "border-emerald-200 bg-emerald-50 text-emerald-700"
                        }`}
                      >
                        {item.risk}
                      </span>
                    </div>

                    <div className="mt-3 grid grid-cols-2 gap-2 rounded-xl border border-[#EEF2F6] bg-[#F8FAFC] p-3">
                      <div>
                        <p className="text-[8.5px] font-extrabold uppercase text-[#98A2B3]">
                          Owner
                        </p>
                        <p className="mt-0.5 truncate text-xs font-extrabold text-[#042C51]">
                          {item.owner}
                        </p>
                      </div>

                      <div className="border-l border-[#E6ECF2] pl-3">
                        <p className="text-[8.5px] font-extrabold uppercase text-[#98A2B3]">
                          Deadline
                        </p>
                        <p className="mt-0.5 text-xs font-extrabold text-[#042C51]">
                          {item.deadline}
                        </p>
                        <p className={`mt-0.5 text-[9px] font-bold ${daysInfo.colorClass}`}>
                          {item.status === "Completed" ? "Completed" : daysInfo.text}
                        </p>
                      </div>
                    </div>

                    <div className="mt-3 flex items-center justify-between gap-2 border-t border-[#EEF2F6] pt-3">
                      <span
                        className={`rounded-full border px-2.5 py-1 text-[9px] font-extrabold ${
                          item.status === "Completed"
                            ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                            : item.status === "Ongoing"
                              ? "border-amber-200 bg-amber-50 text-amber-700"
                              : item.status === "Cancelled"
                                ? "border-slate-200 bg-slate-100 text-slate-600"
                                : "border-blue-200 bg-blue-50 text-blue-700"
                        }`}
                      >
                        {item.status}
                      </span>

                      <button
                        type="button"
                        onClick={() => {
                          setSelectedItem(item);
                          setIsDetailsModalOpen(true);
                        }}
                        className="inline-flex items-center gap-1 text-[11px] font-extrabold text-[#FF5C28]"
                      >
                        <Eye size={12} />
                        View Details
                        <ChevronRight size={12} />
                      </button>
                    </div>
                  </motion.article>
                );
              })
            ) : (
              <div className="rounded-xl border border-dashed border-[#D9E2EC] p-8 text-center text-sm font-semibold text-[#98A2B3]">
                No action items match the current filters.
              </div>
            )}
          </div>

          <div className="mt-3 flex items-center justify-between gap-3 border-t border-[#EEF2F6] pt-3 text-[10px] font-semibold text-[#667085]">
            <span>
              Showing <strong className="text-[#042C51]">{filteredItems.length}</strong> of{" "}
              <strong className="text-[#042C51]">{items.length}</strong> action items
            </span>
            <span className="hidden sm:inline">
              Manual and system-generated recruitment actions
            </span>
          </div>
        </div>
      </section>

      {/* Supporting Analytics */}
      <section className="rounded-2xl border border-[#DCE5EF] bg-white p-4 shadow-[0_8px_22px_rgba(4,44,81,0.04)] sm:p-5">
        <div className="mb-4">
          <h2 className="text-sm font-bold tracking-tight text-[#042C51] 2xl:text-base">
            Operational Insights &amp; Supporting Analytics
          </h2>
          <p className="mt-0.5 text-xs font-semibold text-[#667085]">
            Supporting action health, SLA watchlist, and module-level signals.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-12 lg:items-start">
          <div className="space-y-5 lg:col-span-8">
            {/* Action Health */}
            <section className="rounded-xl border border-[#E6ECF2] bg-[#F8FAFC] p-4">
              <div className="mb-4 flex items-center justify-between gap-4">
                <div>
                  <h3 className="text-sm font-bold tracking-tight text-[#042C51] 2xl:text-base">
                    Recruitment Action Health
                  </h3>
                  <p className="mt-0.5 text-xs font-semibold text-[#667085]">
                    Distribution across the active action item registry.
                  </p>
                </div>

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-[#042C51]">
                  <Activity size={20} />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
                {[
                  ["Planned", metrics.plannedPct, "Not started"],
                  ["Ongoing", metrics.activePct, "In progress"],
                  ["Completed", metrics.completedPct, "Resolved"],
                  ["High Risk", metrics.highRiskPct, "Immediate movement"],
                  ["Overdue", metrics.overduePct, "Past deadline"],
                ].map(([label, percentage, helper]) => (
                  <div key={label}>
                    <div className="mb-2 flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-[#344054]">{label}</p>
                        <p className="truncate text-[10px] font-semibold text-[#98A2B3]">
                          {helper}
                        </p>
                      </div>
                      <span className="text-xs font-black text-[#042C51]">
                        {percentage}%
                      </span>
                    </div>

                    <div className="h-2 overflow-hidden rounded-full bg-[#EEF2F6]">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        className="h-full rounded-full bg-[#042C51]"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Priority Watchlist */}
            <section className="rounded-xl border border-rose-100 bg-rose-50/70 p-4">
              <div className="mb-3 flex items-center justify-between gap-3">
                <div>
                  <h3 className="flex items-center gap-1.5 text-sm font-bold tracking-tight text-rose-700 2xl:text-base">
                    <AlertTriangle size={16} />
                    Priority Watchlist
                  </h3>
                  <p className="mt-0.5 text-xs font-semibold text-rose-700/80">
                    Most urgent open actions by risk and deadline.
                  </p>
                </div>

                <span className="rounded border border-rose-200 bg-white px-2 py-1 text-[9px] font-black uppercase text-rose-700">
                  Action Required
                </span>
              </div>

              <div className="divide-y divide-rose-100 overflow-hidden rounded-xl border border-rose-100 bg-white">
                {priorityWatchlist.length ? (
                  priorityWatchlist.map((item) => {
                    const daysInfo = getDaysLeftText(item.deadline);

                    return (
                      <button
                        type="button"
                        key={item.id}
                        onClick={() => {
                          setSelectedItem(item);
                          setIsDetailsModalOpen(true);
                        }}
                        className="flex w-full flex-col gap-2 px-3 py-3 text-left transition hover:bg-[#F8FAFC] sm:flex-row sm:items-center sm:justify-between"
                      >
                        <div className="min-w-0">
                          <p className="line-clamp-1 text-xs font-extrabold text-[#042C51]">
                            {item.description}
                          </p>
                          <p className="mt-1 text-[10px] font-semibold text-[#667085]">
                            {item.account} · {item.role} · Owner: {item.owner}
                          </p>
                        </div>

                        <div className="shrink-0 text-left sm:text-right">
                          <p className="text-[10px] font-extrabold text-rose-700">
                            {item.deadline}
                          </p>
                          <p className={`mt-0.5 text-[9px] font-bold ${daysInfo.colorClass}`}>
                            {daysInfo.text}
                          </p>
                        </div>
                      </button>
                    );
                  })
                ) : (
                  <div className="p-6 text-center">
                    <CheckCircle2 size={25} className="mx-auto text-emerald-600" />
                    <p className="mt-2 text-xs font-black text-emerald-700">
                      No open priority items.
                    </p>
                  </div>
                )}
              </div>
            </section>
          </div>

          {/* Module Signals */}
          <section className="flex h-full max-h-[465px] flex-col rounded-2xl border border-[#E6ECF2] bg-white p-4 shadow-sm sm:p-5 lg:col-span-4">
            <div className="shrink-0">
              <h2 className="text-sm font-bold tracking-tight text-[#042C51] 2xl:text-base">
                Data-Driven Module Signals
              </h2>
              <p className="mt-0.5 text-xs font-semibold text-[#667085]">
                Auto-detected recruitment indicators from current module records.
              </p>
            </div>

            <div className="mt-4 min-h-0 flex-1 space-y-3 overflow-y-auto pr-1">
              {signals.map((signal, index) => {
                const hasRisk = signal.severity === "High";

                return (
                  <motion.div
                    key={signal.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="rounded-xl border border-[#E6ECF2] bg-[#F8FAFC] p-3.5 transition-all duration-200 hover:-translate-y-0.5 hover:border-[#FF5C28]/30 hover:bg-white hover:shadow-sm"
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                          hasRisk
                            ? "bg-rose-50 text-rose-600"
                            : "bg-[#E9F0FC] text-[#042C51]"
                        }`}
                      >
                        <Sparkles size={17} />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-3">
                          <p className="truncate text-[10px] font-black uppercase tracking-wider text-[#667085]">
                            {signal.module}
                          </p>
                          <p
                            className={`shrink-0 text-sm font-black ${
                              hasRisk ? "text-rose-600" : "text-[#042C51]"
                            }`}
                          >
                            {signal.metric}
                          </p>
                        </div>

                        <p
                          className={`mt-1 text-[11px] font-semibold leading-5 ${
                            hasRisk ? "text-rose-700" : "text-[#475467]"
                          }`}
                        >
                          {signal.description}
                        </p>

                        {signal.suggestedAction ? (
                          <p className="mt-2 border-t border-[#E6ECF2] pt-2 text-[10px] font-medium leading-4 text-[#667085]">
                            {signal.suggestedAction}
                          </p>
                        ) : null}
                      </div>
                    </div>
                  </motion.div>
                );
              })}

              {signals.length === 0 ? (
                <div className="rounded-xl border border-dashed border-[#D9E2EC] p-6 text-center text-xs font-semibold text-[#98A2B3]">
                  No module signals available.
                </div>
              ) : null}
            </div>
          </section>
        </div>
      </section>

      {/* Rule */}
      <section className="rounded-xl border border-[#D6E2F0] bg-gradient-to-r from-blue-50/90 via-blue-50/40 to-white/70 p-3.5 shadow-sm sm:p-4 2xl:rounded-2xl 2xl:p-5">
        <div className="flex flex-col gap-3.5 sm:gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[#D6E2F0] bg-white text-[#042C51] shadow-sm 2xl:h-10 2xl:w-10">
              <ShieldAlert size={18} className="text-[#FF5C28]" />
            </div>

            <div>
              <h3 className="text-xs font-black text-[#042C51] 2xl:text-sm">
                Action Items Rule
              </h3>
              <p className="mt-1 max-w-5xl text-[11px] font-semibold leading-5 text-[#475467] 2xl:text-xs">
                Keep every recruitment blocker tied to an accountable owner, target deadline,
                status, risk level, and the correct operational gap so execution remains visible
                and easy to follow.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsCreateModalOpen(true)}
            className="inline-flex h-9 shrink-0 items-center justify-center gap-1.5 rounded-lg bg-[#FF5C28] px-3.5 text-xs font-extrabold text-white shadow-sm transition hover:bg-[#E04B1D] active:scale-[0.98] 2xl:h-10 2xl:px-4"
          >
            <Plus size={15} />
            Add Missing Action
          </button>
        </div>
      </section>

      {/* ==================== 9. MODALS & WORKFLOWS ==================== */}

      {/* MODAL: ADD MANUAL ACTION ITEM */}
      <AnimatePresence>
        {isCreateModalOpen && (
          <div className="fixed inset-0 z-[12000] flex h-dvh items-center justify-center bg-[#042C51]/60 p-3 backdrop-blur-[2px] sm:p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="flex max-h-[92dvh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-[#D9E2EC] bg-white shadow-[0_24px_80px_rgba(15,23,42,0.28)]"
            >
              {/* Header */}
              <div className="flex shrink-0 items-center justify-between border-b border-white/10 bg-[#042C51] px-5 py-4 text-white sm:px-6">
                <div className="space-y-0.5">
                  <h3 className="text-sm font-black tracking-tight flex items-center gap-2">
                    <CheckSquare className="w-4.5 h-4.5 text-[#FF5C28]" />
                    Create Tactical Action Item
                  </h3>
                  <p className="text-[10px] text-slate-300 font-medium">Log manual blockers, tasks, and SLA mitigation work.</p>
                </div>
                <button
                  onClick={() => setIsCreateModalOpen(false)}
                  className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleCreateActionItem} className="min-h-0 flex-1 space-y-4 overflow-y-auto bg-[#F8FAFC] p-5 sm:p-6">
                
                {/* Description */}
                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase text-slate-500 tracking-wider">Action Description</label>
                  <input
                    type="text"
                    placeholder="e.g. Schedule calibration with Elevance Operations Director"
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                    className="h-10 w-full rounded-xl border border-[#D7DEE8] bg-white px-3 text-xs font-semibold text-[#042C51] outline-none transition focus:border-[#FF5C28] focus:ring-4 focus:ring-[#FF5C28]/10"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {/* Module Source */}
                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase text-slate-500 tracking-wider">Module Category</label>
                    <select
                      value={newModule}
                      onChange={(e) => setNewModule(e.target.value as ActionItem["module"])}
                      className="h-10 w-full rounded-xl border border-[#D7DEE8] bg-white px-3 text-xs font-semibold text-[#042C51] outline-none transition focus:border-[#FF5C28] focus:ring-4 focus:ring-[#FF5C28]/10"
                    >
                      <option value="Sourcing">Sourcing</option>
                      <option value="Pipeline">Pipeline</option>
                      <option value="Offers">Offers</option>
                      <option value="Onboarding">Onboarding</option>
                      <option value="General">General</option>
                    </select>
                  </div>

                  {/* Risk Level */}
                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase text-slate-500 tracking-wider">Risk Severity</label>
                    <select
                      value={newRisk}
                      onChange={(e) => setNewRisk(e.target.value as ActionItem["risk"])}
                      className="h-10 w-full rounded-xl border border-[#D7DEE8] bg-white px-3 text-xs font-semibold text-[#042C51] outline-none transition focus:border-[#FF5C28] focus:ring-4 focus:ring-[#FF5C28]/10"
                    >
                      <option value="Low">Low Risk</option>
                      <option value="Medium">Medium Risk</option>
                      <option value="High">High Risk (SLA-At-Risk)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {/* Campaign Account */}
                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase text-slate-500 tracking-wider">BPO Account</label>
                    <select
                      value={newAccount}
                      onChange={(e) => setNewAccount(e.target.value)}
                      className="h-10 w-full rounded-xl border border-[#D7DEE8] bg-white px-3 text-xs font-semibold text-[#042C51] outline-none transition focus:border-[#FF5C28] focus:ring-4 focus:ring-[#FF5C28]/10"
                    >
                      <option value="Elevance Health">Elevance Health</option>
                      <option value="Chevron Support">Chevron Support</option>
                      <option value="Citi Global">Citi Global</option>
                      <option value="Capital One Help">Capital One Help</option>
                      <option value="RingCentral Team">RingCentral Team</option>
                    </select>
                  </div>

                  {/* Target Designation Role */}
                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase text-slate-500 tracking-wider">Campaign Target Role</label>
                    <select
                      value={newRole}
                      onChange={(e) => setNewRole(e.target.value)}
                      className="h-10 w-full rounded-xl border border-[#D7DEE8] bg-white px-3 text-xs font-semibold text-[#042C51] outline-none transition focus:border-[#FF5C28] focus:ring-4 focus:ring-[#FF5C28]/10"
                    >
                      <option value="Customer Service Representative">Customer Service Representative</option>
                      <option value="Technical Support Associate">Technical Support Associate</option>
                      <option value="Healthcare Support Specialist">Healthcare Support Specialist</option>
                      <option value="Team Leader - BPO Operations">Team Leader - BPO Operations</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {/* Deadline Date */}
                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase text-slate-500 tracking-wider">Deadline Target Date</label>
                    <input
                      type="date"
                      value={newDeadline}
                      onChange={(e) => setNewDeadline(e.target.value)}
                      className="h-10 w-full rounded-xl border border-[#D7DEE8] bg-white px-3 text-xs font-mono font-semibold text-[#042C51] outline-none transition focus:border-[#FF5C28] focus:ring-4 focus:ring-[#FF5C28]/10"
                      required
                    />
                  </div>

                  {/* Owner */}
                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase text-slate-500 tracking-wider">Assigned Recruiter Owner</label>
                    <input
                      type="text"
                      value={newOwner}
                      onChange={(e) => setNewOwner(e.target.value)}
                      className="h-10 w-full rounded-xl border border-[#D7DEE8] bg-white px-3 text-xs font-semibold text-[#042C51] outline-none transition focus:border-[#FF5C28] focus:ring-4 focus:ring-[#FF5C28]/10"
                      required
                    />
                  </div>
                </div>

                {/* Gap Dropdown */}
                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase text-slate-500 tracking-wider">Identified Leakage Gap</label>
                  <select
                    value={newGap}
                    onChange={(e) => setNewGap(e.target.value as ActionItem["gap"])}
                    className="h-10 w-full rounded-xl border border-[#D7DEE8] bg-white px-3 text-xs font-semibold text-[#042C51] outline-none transition focus:border-[#FF5C28] focus:ring-4 focus:ring-[#FF5C28]/10"
                  >
                    <option value="None">None / General Task</option>
                    <option value="Low Sourcing Volume">Low Sourcing Volume</option>
                    <option value="Aging PRF">Aging PRF (Pending Roster Request)</option>
                    <option value="High Drop-off Rate">High Drop-off Rate</option>
                    <option value="Delayed Medical Clearance">Delayed Medical Clearance</option>
                    <option value="SLA At Risk">SLA At Risk</option>
                    <option value="Contract Issue">Contract Issue</option>
                  </select>
                </div>

                {/* Long Description */}
                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase text-slate-500 tracking-wider">Detailed Context & Blocker Breakdown</label>
                  <textarea
                    rows={2}
                    placeholder="Describe specific roadblocks and why this action item is necessary to preserve the hiring campaign timeline."
                    value={newLongDescription}
                    onChange={(e) => setNewLongDescription(e.target.value)}
                    className="w-full resize-none rounded-xl border border-[#D7DEE8] bg-white px-3 py-2.5 text-xs font-semibold leading-5 text-[#042C51] outline-none transition focus:border-[#FF5C28] focus:ring-4 focus:ring-[#FF5C28]/10"
                  />
                </div>

                {/* Save & Cancel buttons */}
                <div className="pt-3 border-t border-slate-100 flex justify-end gap-2 text-xs font-bold">
                  <button
                    type="button"
                    onClick={() => setIsCreateModalOpen(false)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#FF5C28] hover:bg-[#E04B1D] text-white rounded-lg transition-colors cursor-pointer"
                  >
                    Save Action Item
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL: ACTION ITEM DETAILS & OPERATIONS DIALOG */}
      <AnimatePresence>
        {isDetailsModalOpen && selectedItem && (
          <div className="fixed inset-0 z-[12000] flex h-dvh items-center justify-center bg-[#042C51]/60 p-3 backdrop-blur-[2px] sm:p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="flex max-h-[92dvh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-[#D9E2EC] bg-white shadow-[0_24px_80px_rgba(15,23,42,0.28)]"
            >
              {/* Header */}
              <div className="flex shrink-0 items-center justify-between border-b border-white/10 bg-[#042C51] px-5 py-4 text-white sm:px-6">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] font-black bg-[#FF5C28] text-white px-1.5 py-0.5 rounded">
                      {selectedItem.id}
                    </span>
                    <span className="text-[10px] uppercase font-black tracking-wider text-slate-300">
                      {selectedItem.sourceType} Source Action Item
                    </span>
                  </div>
                  <h3 className="text-sm font-black tracking-tight mt-1">{selectedItem.description}</h3>
                </div>
                <button
                  onClick={() => {
                    setIsDetailsModalOpen(false);
                    setSelectedItem(null);
                  }}
                  className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="min-h-0 flex-1 space-y-5 overflow-y-auto bg-[#F8FAFC] p-5 sm:p-6">
                
                {/* Meta details grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <div className="space-y-1">
                    <p className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Module Source</p>
                    <p className="text-xs font-black text-[#042C51]">{selectedItem.module}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Risk Level</p>
                    <p className="text-xs font-black text-[#042C51]">{selectedItem.risk}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Assigned Owner</p>
                    <p className="text-xs font-extrabold text-[#042C51]">{selectedItem.owner}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Deadline Date</p>
                    <p className="text-xs font-mono font-bold text-slate-700">{selectedItem.deadline}</p>
                  </div>
                </div>

                {/* Campaign context block */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Assigned Campaign Account</p>
                    <p className="text-xs font-extrabold text-[#042C51]">{selectedItem.account}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Target Campaign Role</p>
                    <p className="text-xs font-extrabold text-[#042C51]">{selectedItem.role}</p>
                  </div>
                </div>

                {/* Detailed Context */}
                <div className="space-y-1.5">
                  <p className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Detailed Context & Roadblocks</p>
                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 text-xs text-slate-600 leading-relaxed font-semibold">
                    {selectedItem.longDescription}
                  </div>
                </div>

                {/* Identified Leakage Gap */}
                <div className="space-y-1 flex items-center justify-between border-t border-slate-100 pt-3">
                  <p className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Identified SLA Leakage Gap</p>
                  <span className="text-xs font-black text-[#FF5C28] bg-orange-50 px-3 py-1 rounded border border-orange-100">
                    {selectedItem.gap}
                  </span>
                </div>

                {/* Status management block */}
                <div className="space-y-2 border-t border-slate-100 pt-3">
                  <p className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Modify Current Status</p>
                  <div className="flex flex-wrap gap-1.5 text-xs font-bold">
                    <button
                      type="button"
                      onClick={() => handleUpdateStatus(selectedItem.id, "Planned")}
                      className={`px-3 py-1 rounded transition-colors cursor-pointer ${
                        selectedItem.status === "Planned" ? "bg-blue-600 text-white" : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                      }`}
                    >
                      Planned
                    </button>
                    <button
                      type="button"
                      onClick={() => handleUpdateStatus(selectedItem.id, "Ongoing")}
                      className={`px-3 py-1 rounded transition-colors cursor-pointer ${
                        selectedItem.status === "Ongoing" ? "bg-amber-500 text-white" : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                      }`}
                    >
                      Ongoing
                    </button>
                    <button
                      type="button"
                      onClick={() => handleUpdateStatus(selectedItem.id, "Completed")}
                      className={`px-3 py-1 rounded transition-colors cursor-pointer ${
                        selectedItem.status === "Completed" ? "bg-emerald-600 text-white" : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                      }`}
                    >
                      Completed
                    </button>
                    <button
                      type="button"
                      onClick={() => handleUpdateStatus(selectedItem.id, "Cancelled")}
                      className={`px-3 py-1 rounded transition-colors cursor-pointer ${
                        selectedItem.status === "Cancelled" ? "bg-slate-600 text-white" : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                      }`}
                    >
                      Cancelled
                    </button>
                  </div>
                </div>

                {/* Progress notes */}
                <div className="space-y-2 border-t border-slate-100 pt-3">
                  <label className="text-[9px] font-black uppercase text-slate-400 tracking-wider block">Add / Update Operational Progress Notes</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Type a new operational progress note or mitigation update..."
                      value={tempNotesInput}
                      onChange={(e) => setTempNotesInput(e.target.value)}
                      className="flex-1 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none focus:bg-white text-slate-800"
                    />
                    <button
                      type="button"
                      onClick={handleAddModalNotes}
                      className="px-4 py-1.5 bg-[#042C51] hover:bg-[#0a467e] text-white font-black text-xs rounded-lg transition-colors cursor-pointer shrink-0"
                    >
                      Update Note
                    </button>
                  </div>
                  {selectedItem.notes && (
                    <div className="bg-orange-50/50 p-2.5 rounded-lg border border-orange-100 text-[11px] text-slate-600 font-medium">
                      <strong className="text-[#FF5C28]">Current Notes:</strong> {selectedItem.notes}
                    </div>
                  )}
                </div>

                {/* History trail */}
                <div className="space-y-2 border-t border-slate-100 pt-3">
                  <p className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Audit & History Trail</p>
                  <div className="bg-slate-50 rounded-lg border border-slate-100 divide-y divide-slate-200">
                    {selectedItem.history.map((hist, hIdx) => (
                      <div key={hIdx} className="p-2.5 flex items-start justify-between text-[10px]">
                        <div className="space-y-0.5">
                          <p className="font-extrabold text-[#042C51]">{hist.action}</p>
                          <p className="text-slate-400">Triggered by: {hist.user}</p>
                        </div>
                        <span className="font-mono text-slate-400 font-semibold">{hist.date}</span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

              {/* Footer */}
              <div className="flex shrink-0 justify-end border-t border-[#E6ECF2] bg-white px-5 py-4 sm:px-6">
                <button
                  type="button"
                  onClick={() => {
                    setIsDetailsModalOpen(false);
                    setSelectedItem(null);
                  }}
                  className="px-5 py-1.5 bg-[#042C51] text-white font-black text-xs rounded-lg transition-colors cursor-pointer"
                >
                  Close Portal
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
