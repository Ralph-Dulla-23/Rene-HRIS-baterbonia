import React, { useState, useMemo } from "react";
import {
  PieChart,
  RefreshCw,
  Zap,
  FileText,
  Clock,
  CheckCircle2,
  Archive,
  AlertTriangle,
  Send,
  Search,
  Filter,
  Eye,
  Download,
  Mail,
  ChevronRight,
  TrendingUp,
  Briefcase,
  Users,
  CheckSquare,
  UserCheck,
  Compass,
  Inbox,
  X,
  Sparkles,
  Layers,
  ArrowRight,
  Calendar,
  User,
  Building,
  Copy,
  Check,
  Info
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import CentralizedFilters from "./CentralizedFilters";

// ==================== TYPES & INTERFACES ====================

export interface RoleBreakdownItem {
  id: string;
  roleName: string;
  account: string;
  recruiter: string;
  required: number;
  filled: number;
  deliveryStatus: "On Track" | "At Risk" | "Delayed";
  notes?: string;
}

export interface WeeklyReportItem {
  id: string; // e.g. WR-2026-W30
  weekLabel: string; // e.g. "Week 30 (Jul 20 - Jul 26, 2026)"
  dateRange: string;
  status: "Generated" | "Sent" | "Archived";
  author: string;
  generatedTimestamp: string;
  emailSubject: string;

  // Headcount KPI
  totalRequirement: number;
  totalFilled: number;
  totalDropOffs: number;

  // Role status counts
  openRolesCount: number;
  atRiskRolesCount: number;
  delayedRolesCount: number;

  // Narrative
  executiveSummary: string;

  // Detailed Funnel Snapshot
  funnelSnapshot: {
    sourced: number;
    initialScreened: number;
    endorsedToHM: number;
    finalPassed: number;
    offersMade: number;
    offersAccepted: number;
    hired: number;
    dropOffs: number;
  };

  // Role / Account Breakdown
  rolesBreakdown: RoleBreakdownItem[];

  // Action Items & Escalations
  actionItems: string[];

  // Missing Data & Explanations
  missingDataExplanations: string[];
}

// ==================== INITIAL SEED DATA ====================

const INITIAL_REPORTS: WeeklyReportItem[] = [
  {
    id: "WR-2026-W30",
    weekLabel: "Week 30 (Jul 20 - Jul 26, 2026)",
    dateRange: "Jul 20 - Jul 26, 2026",
    status: "Generated",
    author: "Alena Batacan (TA Manager)",
    generatedTimestamp: "2026-07-26 18:30:00",
    emailSubject: "[Weekly Recruitment Digest] SiBS TA Performance Report - Week 30 (Jul 20 - Jul 26, 2026)",
    totalRequirement: 35,
    totalFilled: 28,
    totalDropOffs: 3,
    openRolesCount: 5,
    atRiskRolesCount: 2,
    delayedRolesCount: 1,
    executiveSummary:
      "Week 30 exhibited strong ramp momentum across Healthcare & Life Sciences accounts (UnitedHealth & Humana), hitting 80% overall filled capacity. Capital One Finance wave 1 onboarding achieved 100% attendance. Primary bottleneck remains Comcast Cable Tier-1 Tech Support due to SVAR language modulation failures.",
    funnelSnapshot: {
      sourced: 142,
      initialScreened: 88,
      endorsedToHM: 54,
      finalPassed: 36,
      offersMade: 32,
      offersAccepted: 30,
      hired: 28,
      dropOffs: 3
    },
    rolesBreakdown: [
      {
        id: "ROLE-101",
        roleName: "Healthcare Support Specialist",
        account: "UnitedHealth Group",
        recruiter: "Alena Batacan",
        required: 15,
        filled: 14,
        deliveryStatus: "On Track",
        notes: "Final candidate completing pre-employment BIR 2316 submission."
      },
      {
        id: "ROLE-102",
        roleName: "Financial Account Expert",
        account: "Capital One Finance",
        recruiter: "Mark Ramos",
        required: 10,
        filled: 10,
        deliveryStatus: "On Track",
        notes: "Class completely filled for August 1 onboarding."
      },
      {
        id: "ROLE-103",
        roleName: "Technical Support Associate",
        account: "Comcast Cable",
        recruiter: "Mark Ramos",
        required: 10,
        filled: 4,
        deliveryStatus: "Delayed",
        notes: "High failure rate on SVAR level 6 benchmark. Recyclable candidates invited for 5-day accent boot camp."
      }
    ],
    actionItems: [
      "Follow up with Comcast Operations Lead regarding SVAR score threshold leniency for Tier-1 Tech.",
      "Accelerate BIR 2316 compliance verification for remaining 2 UnitedHealth hires.",
      "Conduct Sourcing campaign on Facebook Ads specifically targeting RNs in Davao region."
    ],
    missingDataExplanations: [
      "Comcast Cable: 2 candidates pending medical check clearance from Davao Diagnostic Clinic.",
      "UnitedHealth Group: 1 candidate missing TOR/Diploma due to university Registrar schedule."
    ]
  },
  {
    id: "WR-2026-W29",
    weekLabel: "Week 29 (Jul 13 - Jul 19, 2026)",
    dateRange: "Jul 13 - Jul 19, 2026",
    status: "Sent",
    author: "Alena Batacan (TA Manager)",
    generatedTimestamp: "2026-07-19 17:45:00",
    emailSubject: "[Weekly Recruitment Digest] SiBS TA Performance Report - Week 29 (Jul 13 - Jul 19, 2026)",
    totalRequirement: 40,
    totalFilled: 36,
    totalDropOffs: 4,
    openRolesCount: 4,
    atRiskRolesCount: 1,
    delayedRolesCount: 0,
    executiveSummary:
      "Week 29 closed with 90% target fulfillment. Sourcing pipeline generated 165 total leads with high conversion rates from Referral programs. Apple iOS Account ramp completed onboarding documentation ahead of schedule.",
    funnelSnapshot: {
      sourced: 165,
      initialScreened: 95,
      endorsedToHM: 62,
      finalPassed: 44,
      offersMade: 40,
      offersAccepted: 38,
      hired: 36,
      dropOffs: 4
    },
    rolesBreakdown: [
      {
        id: "ROLE-201",
        roleName: "iOS Tech Support Specialist",
        account: "Apple iOS Account",
        recruiter: "Mark Ramos",
        required: 20,
        filled: 20,
        deliveryStatus: "On Track",
        notes: "Class 100% onboarded. High technical aptitude scores recorded."
      },
      {
        id: "ROLE-202",
        roleName: "Customer Service Representative",
        account: "T-Mobile USA",
        recruiter: "Clara G.",
        required: 20,
        filled: 16,
        deliveryStatus: "At Risk",
        notes: "4 candidates dropped off due to graveyard shift transportation constraints."
      }
    ],
    actionItems: [
      "Review graveyard shuttle service routes in Davao City to reduce shift drop-offs.",
      "Publish weekly employee referral incentives on internal portal."
    ],
    missingDataExplanations: [
      "T-Mobile USA: 1 candidate failed background check (undisclosed prior termination)."
    ]
  },
  {
    id: "WR-2026-W28",
    weekLabel: "Week 28 (Jul 06 - Jul 12, 2026)",
    dateRange: "Jul 06 - Jul 12, 2026",
    status: "Sent",
    author: "Clara G. (Lead Recruiter)",
    generatedTimestamp: "2026-07-12 18:00:00",
    emailSubject: "[Weekly Recruitment Digest] SiBS TA Performance Report - Week 28 (Jul 06 - Jul 12, 2026)",
    totalRequirement: 30,
    totalFilled: 27,
    totalDropOffs: 2,
    openRolesCount: 3,
    atRiskRolesCount: 0,
    delayedRolesCount: 0,
    executiveSummary:
      "Week 28 recruitment operations maintained high efficiency with 90% fulfillment rate. Onboarding compliance reached 96% completeness across all active accounts.",
    funnelSnapshot: {
      sourced: 130,
      initialScreened: 80,
      endorsedToHM: 48,
      finalPassed: 32,
      offersMade: 30,
      offersAccepted: 28,
      hired: 27,
      dropOffs: 2
    },
    rolesBreakdown: [
      {
        id: "ROLE-301",
        roleName: "Healthcare Support Specialist",
        account: "Humana Healthcare",
        recruiter: "Alena Batacan",
        required: 15,
        filled: 14,
        deliveryStatus: "On Track"
      },
      {
        id: "ROLE-302",
        roleName: "Customer Service Representative",
        account: "T-Mobile USA",
        recruiter: "Clara G.",
        required: 15,
        filled: 13,
        deliveryStatus: "On Track"
      }
    ],
    actionItems: [
      "Archived Week 28 candidate Silver Pool list into central talent repository."
    ],
    missingDataExplanations: []
  },
  {
    id: "WR-2026-W27",
    weekLabel: "Week 27 (Jun 29 - Jul 05, 2026)",
    dateRange: "Jun 29 - Jul 05, 2026",
    status: "Archived",
    author: "Alena Batacan (TA Manager)",
    generatedTimestamp: "2026-07-05 17:30:00",
    emailSubject: "[Weekly Recruitment Digest] SiBS TA Performance Report - Week 27 (Jun 29 - Jul 05, 2026)",
    totalRequirement: 25,
    totalFilled: 25,
    totalDropOffs: 1,
    openRolesCount: 0,
    atRiskRolesCount: 0,
    delayedRolesCount: 0,
    executiveSummary:
      "Mid-year ramp completed at 100% target headcount. Archived in historical records.",
    funnelSnapshot: {
      sourced: 110,
      initialScreened: 72,
      endorsedToHM: 42,
      finalPassed: 28,
      offersMade: 26,
      offersAccepted: 25,
      hired: 25,
      dropOffs: 1
    },
    rolesBreakdown: [
      {
        id: "ROLE-401",
        roleName: "Financial Account Expert",
        account: "Capital One Finance",
        recruiter: "Mark Ramos",
        required: 25,
        filled: 25,
        deliveryStatus: "On Track"
      }
    ],
    actionItems: [],
    missingDataExplanations: []
  }
];

export default function WeeklyReports({
  userEmail,
  onSwitchModule
}: {
  userEmail?: string;
  onSwitchModule?: (module: string) => void;
}) {
  // --- STATE ---
  const [reports, setReports] = useState<WeeklyReportItem[]>(INITIAL_REPORTS);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modals & Overlay Views
  const [selectedReport, setSelectedReport] = useState<WeeklyReportItem | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isEmailPreviewOpen, setIsEmailPreviewOpen] = useState(false);
  const [isCopiedEmail, setIsCopiedEmail] = useState(false);

  // Toast Helper
  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3800);
  };

  // --- DERIVED METRICS ---
  const stats = useMemo(() => {
    const total = reports.length;
    const generated = reports.filter((r) => r.status === "Generated").length;
    const sent = reports.filter((r) => r.status === "Sent").length;
    const archived = reports.filter((r) => r.status === "Archived").length;

    // Current active report
    const activeReport = reports[0];
    const actionItemsCount = activeReport ? activeReport.actionItems.length : 0;
    const missingDataCount = activeReport ? activeReport.missingDataExplanations.length : 0;

    return {
      total,
      generated,
      sent,
      archived,
      actionItemsCount,
      missingDataCount,
      activeReport
    };
  }, [reports]);

  // Connected Module Signals Data
  const connectedSignals = useMemo(() => {
    return {
      hiringNeeds: { openPRFs: 12, targetHeadcount: 45, status: "Active Ramp" },
      candidatePipeline: { inScreening: 38, inInterview: 24, inOfferStage: 14 },
      offersContracts: { totalOffers: 32, accepted: 28, pending: 3, declined: 1 },
      onboardingNHO: { onboardedThisWeek: 28, nhoCompleteness: "96%" },
      actionItems: { overdue: 2, open: 5, escalations: 1 },
      talentPool: { silverPool: 42, recyclable: 18, publicLeads: 25 }
    };
  }, []);

  // --- FILTERED REPORTS ---
  const filteredReports = useMemo(() => {
    return reports.filter((r) => {
      const q = searchTerm.toLowerCase();
      const matchesSearch =
        r.weekLabel.toLowerCase().includes(q) ||
        r.dateRange.toLowerCase().includes(q) ||
        r.id.toLowerCase().includes(q) ||
        r.author.toLowerCase().includes(q);

      const matchesStatus = statusFilter === "All" || r.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [reports, searchTerm, statusFilter]);

  // --- ACTIONS ---

  // 1. Refresh Data
  const handleRefreshData = () => {
    triggerToast("Re-ran background data checks and pulled latest metrics from all recruitment modules.");
  };

  // 2. Generate Current Week Report
  const handleGenerateCurrentWeek = () => {
    const nextWeekNum = 31;
    const newReportId = `WR-2026-W${nextWeekNum}`;

    // Check if already exists
    if (reports.some((r) => r.id === newReportId)) {
      triggerToast(`Report ${newReportId} for Week 31 is already generated!`);
      return;
    }

    const newReport: WeeklyReportItem = {
      id: newReportId,
      weekLabel: `Week ${nextWeekNum} (Jul 27 - Aug 02, 2026)`,
      dateRange: "Jul 27 - Aug 02, 2026",
      status: "Generated",
      author: userEmail || "Alena Batacan (TA Manager)",
      generatedTimestamp: new Date().toISOString().replace("T", " ").substring(0, 19),
      emailSubject: `[Weekly Recruitment Digest] SiBS TA Performance Report - Week ${nextWeekNum} (Jul 27 - Aug 02, 2026)`,
      totalRequirement: 40,
      totalFilled: 32,
      totalDropOffs: 2,
      openRolesCount: 4,
      atRiskRolesCount: 1,
      delayedRolesCount: 1,
      executiveSummary:
        "Draft report generated for Week 31. Live recruitment metrics synced from Hiring Needs, Candidate Pipeline, Offers, Onboarding, Action Items, and Talent Pool.",
      funnelSnapshot: {
        sourced: 155,
        initialScreened: 92,
        endorsedToHM: 58,
        finalPassed: 40,
        offersMade: 35,
        offersAccepted: 32,
        hired: 32,
        dropOffs: 2
      },
      rolesBreakdown: [
        {
          id: "ROLE-501",
          roleName: "Healthcare Support Specialist",
          account: "UnitedHealth Group",
          recruiter: "Alena Batacan",
          required: 15,
          filled: 14,
          deliveryStatus: "On Track"
        },
        {
          id: "ROLE-502",
          roleName: "Financial Account Expert",
          account: "Capital One Finance",
          recruiter: "Mark Ramos",
          required: 15,
          filled: 13,
          deliveryStatus: "On Track"
        },
        {
          id: "ROLE-503",
          roleName: "Technical Support Associate",
          account: "Comcast Cable",
          recruiter: "Mark Ramos",
          required: 10,
          filled: 5,
          deliveryStatus: "Delayed",
          notes: "Focusing on accent boot camp graduates."
        }
      ],
      actionItems: [
        "Review Week 31 candidate pipeline with Hiring Managers.",
        "Verify NHO pre-employment document completion for August wave."
      ],
      missingDataExplanations: [
        "Comcast Cable: 1 candidate medical result pending validation."
      ]
    };

    setReports((prev) => [newReport, ...prev]);
    setSelectedReport(newReport);
    setIsDetailsModalOpen(true);
    triggerToast(`Instantly aggregated current real-time recruitment metrics into fresh draft report (${newReportId})!`);
  };

  // 3. Mark Report as Sent
  const handleMarkAsSent = (reportId: string) => {
    setReports((prev) =>
      prev.map((r) => {
        if (r.id === reportId) {
          return { ...r, status: "Sent" as const };
        }
        return r;
      })
    );

    if (selectedReport && selectedReport.id === reportId) {
      setSelectedReport((prev) => (prev ? { ...prev, status: "Sent" } : null));
    }

    triggerToast(`Report ${reportId} status updated to SENT and distributed to management logs.`);
  };

  // 4. Export Report Text
  const handleExportReport = (report: WeeklyReportItem) => {
    const content = `====================================================
SIBLINGS SOLUTIONS - WEEKLY RECRUITMENT PERFORMANCE REPORT
====================================================
Report ID: ${report.id}
Week Label: ${report.weekLabel}
Date Range: ${report.dateRange}
Status: ${report.status}
Generated By: ${report.author}
Timestamp: ${report.generatedTimestamp}

----------------------------------------------------
EXECUTIVE SUMMARY
----------------------------------------------------
${report.executiveSummary}

----------------------------------------------------
HEADCOUNT & FUNNEL KPI SNAPSHOT
----------------------------------------------------
Total Requirement: ${report.totalRequirement}
Total Filled: ${report.totalFilled}
Total Drop-offs: ${report.totalDropOffs}

- Sourced Candidates: ${report.funnelSnapshot.sourced}
- Initial Screened: ${report.funnelSnapshot.initialScreened}
- Endorsed to Hiring Manager: ${report.funnelSnapshot.endorsedToHM}
- Final Interview Passed: ${report.funnelSnapshot.finalPassed}
- Job Offers Made: ${report.funnelSnapshot.offersMade}
- Offers Accepted: ${report.funnelSnapshot.offersAccepted}
- Hired Candidates: ${report.funnelSnapshot.hired}

----------------------------------------------------
ROLE & ACCOUNT BREAKDOWN
----------------------------------------------------
${report.rolesBreakdown
  .map(
    (rb) =>
      `• [${rb.deliveryStatus.toUpperCase()}] ${rb.roleName} (${rb.account})
  Required: ${rb.required} | Filled: ${rb.filled} | Owner: ${rb.recruiter}${
        rb.notes ? `\n  Notes: ${rb.notes}` : ""
      }`
  )
  .join("\n\n")}

----------------------------------------------------
ACTION ITEMS & ESCALATIONS
----------------------------------------------------
${report.actionItems.map((item, idx) => `${idx + 1}. ${item}`).join("\n")}

----------------------------------------------------
MISSING DATA & EXPLANATIONS
----------------------------------------------------
${report.missingDataExplanations.map((item, idx) => `${idx + 1}. ${item}`).join("\n")}
====================================================`;

    const blob = new Blob([content], { type: "text/plain;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `${report.id}_Weekly_Recruitment_Report.txt`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    triggerToast(`Exported ${report.id} report text file successfully.`);
  };

  // Copy Email Template
  const handleCopyEmailText = () => {
    setIsCopiedEmail(true);
    setTimeout(() => setIsCopiedEmail(false), 2500);
    triggerToast("Formatted HTML email template copied to clipboard!");
  };

  return (
    <div className="flex-1 flex flex-col space-y-6 select-none relative" id="weekly-reports-root">
      {/* Toast Alert Banner */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-20 right-6 bg-[#042C51] border-l-4 border-[#FF5C28] text-white px-5 py-3 rounded-r-xl shadow-2xl z-50 flex items-center gap-3 text-xs font-semibold"
          >
            <CheckCircle2 className="w-4.5 h-4.5 text-[#FF5C28]" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ==================== 1. PAGE HEADER & ACTIONS (WeeklyReportsHeader.jsx) ==================== */}
      <section className="bg-white p-5 rounded-2xl border border-[#E6ECF2] shadow-xs flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4">
        <div className="space-y-1">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-100 bg-[#E9F0FC] px-2.5 py-1 text-[9px] font-black uppercase tracking-wide text-[#042C51]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#FF5C28]" />
              Recruitment View
            </span>
          </div>
          <h1 className="text-xl font-black text-[#042C51] tracking-tight">
            Weekly Recruitment Reports
          </h1>
          <p className="text-xs text-[#667085] leading-normal max-w-4xl">
            Overview of weekly hiring reports compiled from Hiring Needs, Candidate Pipeline, Offers, Onboarding, Action Items, and Talent Pool.
          </p>
        </div>

        {/* Action Group */}
        <div className="flex flex-wrap items-center gap-2 w-full xl:w-auto">
          {/* Refresh Data Button */}
          <button
            onClick={handleRefreshData}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-50 hover:bg-slate-100 text-[#042C51] text-xs font-bold rounded-lg border border-slate-200 transition-all cursor-pointer"
            title="Re-run background data checks and pull latest metrics"
          >
            <RefreshCw className="w-3.5 h-3.5 text-slate-600" />
            <span>Refresh Data</span>
          </button>

          {/* Generate Current Week Button */}
          <button
            onClick={handleGenerateCurrentWeek}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#042C51] hover:bg-[#FF5C28] text-white text-xs font-black rounded-lg transition-all cursor-pointer shadow-xs"
            title="Instantly aggregate current real-time recruitment metrics into a fresh draft report"
          >
            <Zap className="w-4 h-4 text-[#FF5C28] fill-[#FF5C28]" />
            <span>Generate Current Week</span>
          </button>
        </div>
      </section>

      {/* ==================== 2. SUMMARY METRICS BAR (WeeklyReportsStats.jsx) ==================== */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        {/* Total Reports */}
        <div className="bg-white p-4 rounded-xl border border-[#E6ECF2] shadow-xs flex flex-col justify-between space-y-1">
          <div className="flex justify-between items-start">
            <span className="text-[10px] text-slate-500 font-bold uppercase">Total Reports</span>
            <div className="p-1 rounded bg-slate-50">
              <FileText className="w-3.5 h-3.5 text-[#042C51]" />
            </div>
          </div>
          <div>
            <h2 className="text-xl font-black text-[#042C51] tracking-tight">{stats.total}</h2>
            <p className="text-[9px] text-slate-400 font-bold">Weekly logs compiled</p>
          </div>
        </div>

        {/* Generated */}
        <div className="bg-white p-4 rounded-xl border border-[#E6ECF2] shadow-xs flex flex-col justify-between space-y-1">
          <div className="flex justify-between items-start">
            <span className="text-[10px] text-amber-600 font-bold uppercase">Generated</span>
            <div className="p-1 rounded bg-amber-50">
              <Clock className="w-3.5 h-3.5 text-amber-600" />
            </div>
          </div>
          <div>
            <h2 className="text-xl font-black text-amber-600 tracking-tight">{stats.generated}</h2>
            <p className="text-[9px] text-amber-500/80 font-bold">Awaiting distribution</p>
          </div>
        </div>

        {/* Sent */}
        <div className="bg-white p-4 rounded-xl border border-[#E6ECF2] shadow-xs flex flex-col justify-between space-y-1">
          <div className="flex justify-between items-start">
            <span className="text-[10px] text-emerald-600 font-bold uppercase">Sent</span>
            <div className="p-1 rounded bg-emerald-50">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            </div>
          </div>
          <div>
            <h2 className="text-xl font-black text-emerald-600 tracking-tight">{stats.sent}</h2>
            <p className="text-[9px] text-emerald-500/80 font-bold">Distributed to management</p>
          </div>
        </div>

        {/* Archived */}
        <div className="bg-white p-4 rounded-xl border border-[#E6ECF2] shadow-xs flex flex-col justify-between space-y-1">
          <div className="flex justify-between items-start">
            <span className="text-[10px] text-slate-500 font-bold uppercase">Archived</span>
            <div className="p-1 rounded bg-slate-50">
              <Archive className="w-3.5 h-3.5 text-slate-500" />
            </div>
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-700 tracking-tight">{stats.archived}</h2>
            <p className="text-[9px] text-slate-400 font-bold">Historical archives</p>
          </div>
        </div>

        {/* Action Items */}
        <div className="bg-white p-4 rounded-xl border border-[#E6ECF2] shadow-xs flex flex-col justify-between space-y-1">
          <div className="flex justify-between items-start">
            <span className="text-[10px] text-[#FF5C28] font-bold uppercase">Action Items</span>
            <div className="p-1 rounded bg-[#FFF0EB]">
              <CheckSquare className="w-3.5 h-3.5 text-[#FF5C28]" />
            </div>
          </div>
          <div>
            <h2 className="text-xl font-black text-[#FF5C28] tracking-tight">{stats.actionItemsCount}</h2>
            <p className="text-[9px] text-orange-500/80 font-bold">Logged for active week</p>
          </div>
        </div>

        {/* Missing Data */}
        <div className="bg-white p-4 rounded-xl border border-[#E6ECF2] shadow-xs flex flex-col justify-between space-y-1">
          <div className="flex justify-between items-start">
            <span className="text-[10px] text-rose-600 font-bold uppercase">Missing Data</span>
            <div className="p-1 rounded bg-rose-50">
              <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
            </div>
          </div>
          <div>
            <h2 className="text-xl font-black text-rose-600 tracking-tight">{stats.missingDataCount}</h2>
            <p className="text-[9px] text-rose-500/80 font-bold">Requires recruiter notes</p>
          </div>
        </div>
      </div>

      {/* ==================== 3. ACTIVE SNAPSHOT BANNER (WeeklyReportSnapshot.jsx) ==================== */}
      {stats.activeReport && (
        <div className="bg-[#042C51] text-white p-5 rounded-2xl border border-blue-900 shadow-md space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-blue-800/80">
            <div className="flex items-center gap-2">
              <span className="bg-[#FF5C28] text-white text-[10px] font-black px-2.5 py-0.5 rounded uppercase tracking-wider">
                Active Week Snapshot
              </span>
              <span className="text-xs font-black text-blue-200">{stats.activeReport.weekLabel}</span>
            </div>
            <span className="text-[11px] text-slate-300 font-mono">
              Report ID: <strong className="text-white">{stats.activeReport.id}</strong>
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Current KPI Cards */}
            <div className="grid grid-cols-3 gap-2 bg-blue-950/60 p-3 rounded-xl border border-blue-800/50">
              <div className="text-center">
                <span className="text-[9px] text-blue-300 font-bold uppercase block">Target Requirement</span>
                <span className="text-xl font-black text-white">{stats.activeReport.totalRequirement}</span>
              </div>
              <div className="text-center border-x border-blue-800/60">
                <span className="text-[9px] text-emerald-400 font-bold uppercase block">Total Filled</span>
                <span className="text-xl font-black text-emerald-400">{stats.activeReport.totalFilled}</span>
              </div>
              <div className="text-center">
                <span className="text-[9px] text-rose-300 font-bold uppercase block">Total Drop-offs</span>
                <span className="text-xl font-black text-rose-400">{stats.activeReport.totalDropOffs}</span>
              </div>
            </div>

            {/* Current Week Summary Box */}
            <div className="bg-blue-950/60 p-3.5 rounded-xl border border-blue-800/50 space-y-1">
              <span className="text-[10px] text-blue-300 font-bold uppercase flex items-center gap-1">
                <FileText className="w-3 h-3 text-[#FF5C28]" />
                Current Week Narrative Summary
              </span>
              <p className="text-xs text-slate-200 line-clamp-3 leading-relaxed">
                {stats.activeReport.executiveSummary}
              </p>
            </div>

            {/* Weekly Email Requirement Card */}
            <div className="bg-gradient-to-br from-blue-900/80 to-blue-950 p-3.5 rounded-xl border border-blue-700/50 flex flex-col justify-between space-y-2">
              <div>
                <span className="text-[10px] text-[#FF5C28] font-black uppercase flex items-center gap-1">
                  <Mail className="w-3 h-3" />
                  Automated Management Email Format
                </span>
                <p className="text-[11px] text-slate-300 mt-1 leading-snug">
                  Reports generate a pre-formatted HTML executive digest optimized for distribution to TA Directors and Account Operations Leads.
                </p>
              </div>
              <button
                onClick={() => {
                  setSelectedReport(stats.activeReport);
                  setIsEmailPreviewOpen(true);
                }}
                className="self-start text-[10px] font-black bg-[#FF5C28] hover:bg-orange-600 text-white px-3 py-1.5 rounded-lg transition-all flex items-center gap-1 cursor-pointer"
              >
                <span>View Email Digest Preview</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================== 4. LIVE RECRUITMENT SIGNALS GRID (WeeklyReportsModuleSignals.jsx) ==================== */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-black text-[#042C51] uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-[#FF5C28]" />
            Live Connected Recruitment Signals (6 Integrated Modules)
          </h3>
          <span className="text-[10px] text-slate-500 font-bold">Real-Time Data Feeds</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
          {/* 1. Hiring Needs */}
          <div
            onClick={() => onSwitchModule?.("Hiring Needs Intake")}
            className="bg-white p-3.5 rounded-xl border border-[#E6ECF2] hover:border-blue-300 transition-all cursor-pointer shadow-xs group"
          >
            <div className="flex justify-between items-center mb-2">
              <span className="text-[10px] font-extrabold text-[#042C51] uppercase flex items-center gap-1">
                <Inbox className="w-3.5 h-3.5 text-blue-600" />
                Hiring Needs
              </span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#FF5C28] transition-colors" />
            </div>
            <div className="space-y-1">
              <div className="text-lg font-black text-[#042C51]">
                {connectedSignals.hiringNeeds.openPRFs}{" "}
                <span className="text-xs text-slate-500 font-semibold">Open PRFs</span>
              </div>
              <p className="text-[10px] text-slate-500 font-medium">
                {connectedSignals.hiringNeeds.targetHeadcount} total target headcount
              </p>
            </div>
          </div>

          {/* 2. Candidate Pipeline */}
          <div
            onClick={() => onSwitchModule?.("Talent Pool")}
            className="bg-white p-3.5 rounded-xl border border-[#E6ECF2] hover:border-blue-300 transition-all cursor-pointer shadow-xs group"
          >
            <div className="flex justify-between items-center mb-2">
              <span className="text-[10px] font-extrabold text-indigo-700 uppercase flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-indigo-600" />
                Candidate Pipeline
              </span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#FF5C28] transition-colors" />
            </div>
            <div className="space-y-1">
              <div className="text-lg font-black text-indigo-900">
                {connectedSignals.candidatePipeline.inScreening +
                  connectedSignals.candidatePipeline.inInterview +
                  connectedSignals.candidatePipeline.inOfferStage}{" "}
                <span className="text-xs text-slate-500 font-semibold">Active</span>
              </div>
              <p className="text-[10px] text-slate-500 font-medium">
                {connectedSignals.candidatePipeline.inScreening} Screen | {connectedSignals.candidatePipeline.inInterview} Intv | {connectedSignals.candidatePipeline.inOfferStage} Offer
              </p>
            </div>
          </div>

          {/* 3. Offers & Contracts */}
          <div
            onClick={() => onSwitchModule?.("Offers")}
            className="bg-white p-3.5 rounded-xl border border-[#E6ECF2] hover:border-blue-300 transition-all cursor-pointer shadow-xs group"
          >
            <div className="flex justify-between items-center mb-2">
              <span className="text-[10px] font-extrabold text-emerald-700 uppercase flex items-center gap-1">
                <Briefcase className="w-3.5 h-3.5 text-emerald-600" />
                Offers & Contracts
              </span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#FF5C28] transition-colors" />
            </div>
            <div className="space-y-1">
              <div className="text-lg font-black text-emerald-800">
                {connectedSignals.offersContracts.accepted}/{connectedSignals.offersContracts.totalOffers}{" "}
                <span className="text-xs text-slate-500 font-semibold">Accepted</span>
              </div>
              <p className="text-[10px] text-slate-500 font-medium">
                {connectedSignals.offersContracts.pending} pending | {connectedSignals.offersContracts.declined} declined
              </p>
            </div>
          </div>

          {/* 4. Onboarding & NHO */}
          <div
            onClick={() => onSwitchModule?.("Onboarding")}
            className="bg-white p-3.5 rounded-xl border border-[#E6ECF2] hover:border-blue-300 transition-all cursor-pointer shadow-xs group"
          >
            <div className="flex justify-between items-center mb-2">
              <span className="text-[10px] font-extrabold text-cyan-700 uppercase flex items-center gap-1">
                <UserCheck className="w-3.5 h-3.5 text-cyan-600" />
                Onboarding & NHO
              </span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#FF5C28] transition-colors" />
            </div>
            <div className="space-y-1">
              <div className="text-lg font-black text-cyan-900">
                {connectedSignals.onboardingNHO.onboardedThisWeek}{" "}
                <span className="text-xs text-slate-500 font-semibold">Hired</span>
              </div>
              <p className="text-[10px] text-slate-500 font-medium">
                {connectedSignals.onboardingNHO.nhoCompleteness} NHO completeness
              </p>
            </div>
          </div>

          {/* 5. Action Items */}
          <div
            onClick={() => onSwitchModule?.("Action Items")}
            className="bg-white p-3.5 rounded-xl border border-[#E6ECF2] hover:border-blue-300 transition-all cursor-pointer shadow-xs group"
          >
            <div className="flex justify-between items-center mb-2">
              <span className="text-[10px] font-extrabold text-[#FF5C28] uppercase flex items-center gap-1">
                <CheckSquare className="w-3.5 h-3.5 text-[#FF5C28]" />
                Action Items
              </span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#FF5C28] transition-colors" />
            </div>
            <div className="space-y-1">
              <div className="text-lg font-black text-[#FF5C28]">
                {connectedSignals.actionItems.open}{" "}
                <span className="text-xs text-slate-500 font-semibold">Open Tasks</span>
              </div>
              <p className="text-[10px] text-slate-500 font-medium">
                {connectedSignals.actionItems.overdue} overdue | {connectedSignals.actionItems.escalations} escalation
              </p>
            </div>
          </div>

          {/* 6. Talent Pool */}
          <div
            onClick={() => onSwitchModule?.("Talent Pool")}
            className="bg-white p-3.5 rounded-xl border border-[#E6ECF2] hover:border-blue-300 transition-all cursor-pointer shadow-xs group"
          >
            <div className="flex justify-between items-center mb-2">
              <span className="text-[10px] font-extrabold text-purple-700 uppercase flex items-center gap-1">
                <Compass className="w-3.5 h-3.5 text-purple-600" />
                Talent Pool
              </span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#FF5C28] transition-colors" />
            </div>
            <div className="space-y-1">
              <div className="text-lg font-black text-purple-900">
                {connectedSignals.talentPool.silverPool}{" "}
                <span className="text-xs text-slate-500 font-semibold">Silver Pool</span>
              </div>
              <p className="text-[10px] text-slate-500 font-medium">
                {connectedSignals.talentPool.recyclable} recyclable | {connectedSignals.talentPool.publicLeads} leads
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== 5. REPORTS TABLE & FILTERS (WeeklyReportsList.jsx) ==================== */}
      <CentralizedFilters
        title="Search & Filter Weekly Reports Repository"
        resetLabel="Reset Report Filters"
        onReset={() => {
          setSearchTerm("");
          setStatusFilter("All");
          triggerToast("Weekly report filters reset.");
        }}
        search={{
          label: "Search Report Logs",
          placeholder: "Search by Week Label (e.g. Week 30), Date Range, or Report ID...",
          value: searchTerm,
          onChange: (val) => setSearchTerm(val)
        }}
        selects={[
          {
            label: "Report Status",
            value: statusFilter,
            onChange: (val) => setStatusFilter(val),
            options: [
              { label: "All Statuses", value: "All" },
              { label: "Generated", value: "Generated" },
              { label: "Sent", value: "Sent" },
              { label: "Archived", value: "Archived" }
            ]
          }
        ]}
      />

      {/* Table Section */}
      <div className="bg-white p-5 rounded-2xl border border-[#E6ECF2] shadow-xs space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-sm font-black text-[#042C51] flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#FF5C28]" />
            Weekly Performance Reports Log
          </h3>
          <span className="text-xs text-slate-500 font-bold">
            Showing {filteredReports.length} report log entries
          </span>
        </div>

        <div className="border border-slate-200 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-extrabold select-none uppercase text-[10px]">
                  <th className="p-3">Week & Date Range</th>
                  <th className="p-3">Report ID & Author</th>
                  <th className="p-3 text-center">Requirement vs. Filled</th>
                  <th className="p-3 text-center">Status</th>
                  <th className="p-3 text-center">Action Items & Alerts</th>
                  <th className="p-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredReports.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-10 text-center text-slate-400 font-bold">
                      No weekly performance report entries match the selected filters.
                    </td>
                  </tr>
                ) : (
                  filteredReports.map((report) => (
                    <tr
                      key={report.id}
                      onClick={() => {
                        setSelectedReport(report);
                        setIsDetailsModalOpen(true);
                      }}
                      className="hover:bg-slate-50 transition-colors cursor-pointer"
                    >
                      {/* Week & Date Range */}
                      <td className="p-3">
                        <span className="font-extrabold text-[#042C51] block text-xs hover:underline">
                          {report.weekLabel}
                        </span>
                        <span className="text-[10px] text-slate-400 block mt-0.5">
                          {report.dateRange}
                        </span>
                      </td>

                      {/* ID & Author */}
                      <td className="p-3">
                        <span className="font-mono text-[11px] font-bold text-slate-700 block">
                          {report.id}
                        </span>
                        <span className="text-[10px] text-slate-500 block">
                          {report.author}
                        </span>
                      </td>

                      {/* Requirement & Filled */}
                      <td className="p-3 text-center">
                        <div className="inline-flex items-center gap-1.5 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200 font-bold">
                          <span className="text-emerald-700 font-black">{report.totalFilled}</span>
                          <span className="text-slate-400">/</span>
                          <span className="text-[#042C51] font-black">{report.totalRequirement}</span>
                          <span className="text-[9px] text-slate-500 ml-1">
                            ({Math.round((report.totalFilled / report.totalRequirement) * 100)}%)
                          </span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="p-3 text-center">
                        {report.status === "Generated" && (
                          <span className="text-[10px] font-black bg-amber-50 text-amber-700 px-2.5 py-1 rounded-full border border-amber-200 uppercase">
                            Generated
                          </span>
                        )}
                        {report.status === "Sent" && (
                          <span className="text-[10px] font-black bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full border border-emerald-200 uppercase">
                            Sent
                          </span>
                        )}
                        {report.status === "Archived" && (
                          <span className="text-[10px] font-black bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full border border-slate-200 uppercase">
                            Archived
                          </span>
                        )}
                      </td>

                      {/* Action Items & Alerts */}
                      <td className="p-3 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <span className="text-[10px] font-bold text-orange-700 bg-orange-50 px-2 py-0.5 rounded border border-orange-200 flex items-center gap-1">
                            <CheckSquare className="w-3 h-3 text-[#FF5C28]" />
                            {report.actionItems.length} Tasks
                          </span>
                          {report.missingDataExplanations.length > 0 && (
                            <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200 flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3 text-rose-600" />
                              {report.missingDataExplanations.length} Alerts
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="p-3 text-center">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedReport(report);
                            setIsDetailsModalOpen(true);
                          }}
                          className="inline-flex items-center gap-1 text-[11px] font-extrabold text-[#042C51] bg-[#E9F0FC] hover:bg-blue-100 px-3 py-1 rounded-lg border border-blue-200 transition-all cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5 text-[#FF5C28]" />
                          <span>View Details</span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ==================== 6. WEEKLY REPORT DETAILS MODAL (WeeklyReportDetailsModal.jsx) ==================== */}
      <AnimatePresence>
        {isDetailsModalOpen && selectedReport && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden my-8"
            >
              {/* Modal Header */}
              <div className="bg-[#042C51] text-white p-5 flex items-center justify-between border-b border-blue-900">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black bg-[#FF5C28] text-white px-2.5 py-0.5 rounded uppercase">
                      Weekly Performance Report Details
                    </span>
                    <span className="text-[10px] font-black bg-blue-900 text-blue-200 px-2 py-0.5 rounded border border-blue-800">
                      Multi-Module Signal Aggregated
                    </span>
                  </div>
                  <h2 className="text-lg font-black tracking-tight">{selectedReport.weekLabel}</h2>
                  <p className="text-xs text-blue-200">
                    Report ID: <strong className="text-white font-mono">{selectedReport.id}</strong> | Date Range: {selectedReport.dateRange}
                  </p>
                </div>

                <button
                  onClick={() => setIsDetailsModalOpen(false)}
                  className="p-1.5 text-slate-300 hover:text-white bg-blue-900/50 hover:bg-blue-900 rounded-lg transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
                {/* Executive Summary Narrative & Headcount Box */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Executive Summary */}
                  <div className="md:col-span-2 bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                    <span className="text-[10px] font-black text-[#042C51] uppercase flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-[#FF5C28]" />
                      Executive Narrative Summary
                    </span>
                    <p className="text-xs text-slate-700 leading-relaxed font-medium">
                      {selectedReport.executiveSummary}
                    </p>
                  </div>

                  {/* Headcount Progress Box */}
                  <div className="bg-[#FFF0EB] p-4 rounded-xl border border-orange-200 flex flex-col justify-between space-y-2">
                    <div>
                      <span className="text-[10px] font-black text-[#FF5C28] uppercase block">
                        Headcount Target vs. Actual
                      </span>
                      <div className="flex items-baseline gap-1 mt-1">
                        <span className="text-3xl font-black text-[#042C51]">{selectedReport.totalFilled}</span>
                        <span className="text-slate-400 font-bold text-lg">/</span>
                        <span className="text-lg font-bold text-slate-600">{selectedReport.totalRequirement}</span>
                        <span className="text-xs font-black text-[#FF5C28] ml-2">
                          ({Math.round((selectedReport.totalFilled / selectedReport.totalRequirement) * 100)}% Filled)
                        </span>
                      </div>
                    </div>

                    {/* Role Status Tags */}
                    <div className="pt-2 border-t border-orange-200/80 flex items-center gap-1.5 text-[10px] font-bold">
                      <span className="bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded">
                        {selectedReport.openRolesCount} Open
                      </span>
                      <span className="bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded">
                        {selectedReport.atRiskRolesCount} At-Risk
                      </span>
                      <span className="bg-rose-100 text-rose-800 px-1.5 py-0.5 rounded">
                        {selectedReport.delayedRolesCount} Delayed
                      </span>
                    </div>
                  </div>
                </div>

                {/* Section 1: Weekly Funnel KPI Snapshot (Progress Bars) */}
                <div className="space-y-3">
                  <h4 className="text-xs font-black text-[#042C51] uppercase tracking-wider flex items-center gap-1.5">
                    <TrendingUp className="w-4 h-4 text-emerald-600" />
                    Weekly Funnel Conversion KPI Snapshot
                  </h4>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {/* Sourced */}
                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                      <span className="text-[10px] text-slate-500 font-bold uppercase">Sourced Leads</span>
                      <div className="text-lg font-black text-[#042C51] mt-0.5">{selectedReport.funnelSnapshot.sourced}</div>
                      <div className="w-full bg-slate-200 h-1.5 rounded-full mt-2 overflow-hidden">
                        <div className="bg-blue-600 h-full w-full"></div>
                      </div>
                    </div>

                    {/* Initial Screened */}
                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                      <span className="text-[10px] text-slate-500 font-bold uppercase">Initial Screened</span>
                      <div className="text-lg font-black text-[#042C51] mt-0.5">{selectedReport.funnelSnapshot.initialScreened}</div>
                      <div className="w-full bg-slate-200 h-1.5 rounded-full mt-2 overflow-hidden">
                        <div
                          className="bg-indigo-600 h-full"
                          style={{
                            width: `${Math.round(
                              (selectedReport.funnelSnapshot.initialScreened / selectedReport.funnelSnapshot.sourced) * 100
                            )}%`
                          }}
                        ></div>
                      </div>
                    </div>

                    {/* Endorsed to HM */}
                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                      <span className="text-[10px] text-slate-500 font-bold uppercase">Endorsed to HM</span>
                      <div className="text-lg font-black text-[#042C51] mt-0.5">{selectedReport.funnelSnapshot.endorsedToHM}</div>
                      <div className="w-full bg-slate-200 h-1.5 rounded-full mt-2 overflow-hidden">
                        <div
                          className="bg-purple-600 h-full"
                          style={{
                            width: `${Math.round(
                              (selectedReport.funnelSnapshot.endorsedToHM / selectedReport.funnelSnapshot.sourced) * 100
                            )}%`
                          }}
                        ></div>
                      </div>
                    </div>

                    {/* Final Interview Passed */}
                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                      <span className="text-[10px] text-slate-500 font-bold uppercase">Final Interview Passed</span>
                      <div className="text-lg font-black text-[#042C51] mt-0.5">{selectedReport.funnelSnapshot.finalPassed}</div>
                      <div className="w-full bg-slate-200 h-1.5 rounded-full mt-2 overflow-hidden">
                        <div
                          className="bg-teal-600 h-full"
                          style={{
                            width: `${Math.round(
                              (selectedReport.funnelSnapshot.finalPassed / selectedReport.funnelSnapshot.sourced) * 100
                            )}%`
                          }}
                        ></div>
                      </div>
                    </div>

                    {/* Offers Made */}
                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                      <span className="text-[10px] text-slate-500 font-bold uppercase">Offers Made</span>
                      <div className="text-lg font-black text-[#042C51] mt-0.5">{selectedReport.funnelSnapshot.offersMade}</div>
                      <div className="w-full bg-slate-200 h-1.5 rounded-full mt-2 overflow-hidden">
                        <div
                          className="bg-cyan-600 h-full"
                          style={{
                            width: `${Math.round(
                              (selectedReport.funnelSnapshot.offersMade / selectedReport.funnelSnapshot.sourced) * 100
                            )}%`
                          }}
                        ></div>
                      </div>
                    </div>

                    {/* Offers Accepted */}
                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                      <span className="text-[10px] text-slate-500 font-bold uppercase">Offers Accepted</span>
                      <div className="text-lg font-black text-[#042C51] mt-0.5">{selectedReport.funnelSnapshot.offersAccepted}</div>
                      <div className="w-full bg-slate-200 h-1.5 rounded-full mt-2 overflow-hidden">
                        <div
                          className="bg-emerald-600 h-full"
                          style={{
                            width: `${Math.round(
                              (selectedReport.funnelSnapshot.offersAccepted / selectedReport.funnelSnapshot.sourced) * 100
                            )}%`
                          }}
                        ></div>
                      </div>
                    </div>

                    {/* Hired Candidates */}
                    <div className="bg-emerald-50 p-3 rounded-lg border border-emerald-200">
                      <span className="text-[10px] text-emerald-800 font-bold uppercase">Hired Candidates</span>
                      <div className="text-lg font-black text-emerald-900 mt-0.5">{selectedReport.funnelSnapshot.hired}</div>
                      <div className="w-full bg-emerald-200 h-1.5 rounded-full mt-2 overflow-hidden">
                        <div className="bg-emerald-600 h-full w-full"></div>
                      </div>
                    </div>

                    {/* Drop-offs Count */}
                    <div className="bg-rose-50 p-3 rounded-lg border border-rose-200">
                      <span className="text-[10px] text-rose-800 font-bold uppercase">Drop-offs Count</span>
                      <div className="text-lg font-black text-rose-900 mt-0.5">{selectedReport.funnelSnapshot.dropOffs}</div>
                      <div className="w-full bg-rose-200 h-1.5 rounded-full mt-2 overflow-hidden">
                        <div className="bg-rose-600 h-full w-3/4"></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Section 2: Role / Account Breakdown */}
                <div className="space-y-3">
                  <h4 className="text-xs font-black text-[#042C51] uppercase tracking-wider flex items-center gap-1.5">
                    <Building className="w-4 h-4 text-[#FF5C28]" />
                    Role / Account Requirement Breakdown
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {selectedReport.rolesBreakdown.map((role) => (
                      <div key={role.id} className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2">
                        <div className="flex items-start justify-between">
                          <div>
                            <span className="font-extrabold text-[#042C51] text-xs block">{role.roleName}</span>
                            <span className="text-[10px] text-slate-500 font-medium block">{role.account}</span>
                          </div>
                          {role.deliveryStatus === "On Track" && (
                            <span className="text-[9px] font-extrabold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded uppercase">
                              On Track
                            </span>
                          )}
                          {role.deliveryStatus === "At Risk" && (
                            <span className="text-[9px] font-extrabold bg-amber-100 text-amber-800 px-2 py-0.5 rounded uppercase">
                              At Risk
                            </span>
                          )}
                          {role.deliveryStatus === "Delayed" && (
                            <span className="text-[9px] font-extrabold bg-rose-100 text-rose-800 px-2 py-0.5 rounded uppercase">
                              Delayed
                            </span>
                          )}
                        </div>

                        <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-200">
                          <span className="text-slate-500">
                            Recruiter Owner: <strong className="text-slate-800">{role.recruiter}</strong>
                          </span>
                          <span className="font-mono font-black text-[#042C51]">
                            {role.filled} / {role.required} Headcount
                          </span>
                        </div>

                        {role.notes && (
                          <p className="text-[10px] text-slate-600 bg-white p-2 rounded border border-slate-200 font-normal">
                            💡 <strong>Notes:</strong> {role.notes}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Section 3: Action Items & Escalations */}
                <div className="space-y-2">
                  <h4 className="text-xs font-black text-[#042C51] uppercase tracking-wider flex items-center gap-1.5">
                    <CheckSquare className="w-4 h-4 text-[#FF5C28]" />
                    Action Items & Active Escalations
                  </h4>

                  {selectedReport.actionItems.length === 0 ? (
                    <p className="text-xs text-slate-400 font-bold bg-slate-50 p-3 rounded-lg border border-slate-200">
                      No active action items logged for this report period.
                    </p>
                  ) : (
                    <ul className="space-y-1.5 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                      {selectedReport.actionItems.map((item, idx) => (
                        <li key={idx} className="text-xs text-slate-700 flex items-start gap-2">
                          <span className="text-[#FF5C28] font-bold mt-0.5">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* Section 4: Missing Data & Explanations */}
                <div className="space-y-2">
                  <h4 className="text-xs font-black text-rose-700 uppercase tracking-wider flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-rose-600" />
                    Missing Data & Delayed Role Explanations
                  </h4>

                  {selectedReport.missingDataExplanations.length === 0 ? (
                    <p className="text-xs text-emerald-700 font-bold bg-emerald-50 p-3 rounded-lg border border-emerald-200">
                      ✅ All metrics, requirements, and compliance credentials are 100% complete with no missing data alerts.
                    </p>
                  ) : (
                    <ul className="space-y-1.5 bg-rose-50/60 p-3.5 rounded-xl border border-rose-200">
                      {selectedReport.missingDataExplanations.map((item, idx) => (
                        <li key={idx} className="text-xs text-rose-900 flex items-start gap-2">
                          <span className="text-rose-600 font-bold mt-0.5">⚠️</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* Section 5: Metadata Panel */}
                <div className="bg-slate-100 p-3.5 rounded-xl border border-slate-200 text-[11px] text-slate-600 space-y-1">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span>
                      Generated By: <strong>{selectedReport.author}</strong>
                    </span>
                    <span>
                      Timestamp: <strong>{selectedReport.generatedTimestamp}</strong>
                    </span>
                  </div>
                  <div className="pt-1 border-t border-slate-200 text-slate-500">
                    Email Digest Subject: <strong className="text-slate-800">{selectedReport.emailSubject}</strong>
                  </div>
                </div>
              </div>

              {/* Modal Footer Actions */}
              <div className="bg-slate-50 p-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  {/* Export Report Button */}
                  <button
                    onClick={() => handleExportReport(selectedReport)}
                    className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-extrabold rounded-lg transition-all cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5 text-slate-700" />
                    <span>Export Report (.txt)</span>
                  </button>

                  {/* View Email Button */}
                  <button
                    onClick={() => {
                      setIsEmailPreviewOpen(true);
                    }}
                    className="flex items-center gap-1.5 px-3.5 py-2 bg-[#E9F0FC] hover:bg-blue-100 text-[#042C51] text-xs font-extrabold rounded-lg border border-blue-200 transition-all cursor-pointer"
                  >
                    <Mail className="w-3.5 h-3.5 text-[#FF5C28]" />
                    <span>View Formatted Email Digest</span>
                  </button>
                </div>

                {/* Mark as Sent Button */}
                {selectedReport.status === "Generated" ? (
                  <button
                    onClick={() => handleMarkAsSent(selectedReport.id)}
                    className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black rounded-lg transition-all cursor-pointer shadow-xs"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Mark as Sent</span>
                  </button>
                ) : (
                  <span className="text-xs font-extrabold text-emerald-700 bg-emerald-100 px-3 py-1.5 rounded-lg border border-emerald-200 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Report Status: SENT
                  </span>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ==================== 7. WEEKLY REPORT EMAIL PREVIEW OVERLAY (WeeklyReportEmailPreview.jsx) ==================== */}
      <AnimatePresence>
        {isEmailPreviewOpen && selectedReport && (
          <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden my-8"
            >
              {/* Email View Header */}
              <div className="bg-[#042C51] text-white p-4 flex items-center justify-between border-b border-blue-900">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-[#FF5C28]" />
                  <span className="text-xs font-black">Formatted Management Email Digest Template</span>
                </div>
                <button
                  onClick={() => setIsEmailPreviewOpen(false)}
                  className="p-1 text-slate-300 hover:text-white rounded-md transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Email Subject & Recipient Header Bar */}
              <div className="bg-slate-100 p-4 border-b border-slate-200 text-xs space-y-2">
                <div className="flex items-baseline gap-2">
                  <span className="font-bold text-slate-500 w-16">Subject:</span>
                  <span className="font-black text-[#042C51] font-mono text-[11.5px]">{selectedReport.emailSubject}</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="font-bold text-slate-500 w-16">To:</span>
                  <span className="text-slate-700 font-semibold">
                    ta-leadership@thesiblingssolutions.com, ops-managers@thesiblingssolutions.com
                  </span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="font-bold text-slate-500 w-16">From:</span>
                  <span className="text-slate-700 font-semibold">{selectedReport.author}</span>
                </div>
              </div>

              {/* HTML Email Canvas Body */}
              <div className="p-6 bg-slate-50 max-h-[60vh] overflow-y-auto space-y-5 font-sans">
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
                  {/* Email Logo Header */}
                  <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-[#042C51] text-white font-black flex items-center justify-center text-xs">
                        S
                      </div>
                      <span className="font-black text-sm text-[#042C51]">Siblings Solutions TA</span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono font-bold">{selectedReport.dateRange}</span>
                  </div>

                  {/* Greeting & Executive Summary */}
                  <div className="space-y-2 text-xs text-slate-700">
                    <p className="font-bold text-[#042C51]">Dear Operations & Talent Acquisition Management Team,</p>
                    <p className="leading-relaxed">
                      Please find the weekly recruitment performance summary for <strong className="text-[#042C51]">{selectedReport.weekLabel}</strong>.
                    </p>
                    <div className="bg-[#E9F0FC] p-3 rounded-lg border border-blue-200 text-slate-800 text-[11.5px] leading-relaxed">
                      <strong>Executive Summary:</strong> {selectedReport.executiveSummary}
                    </div>
                  </div>

                  {/* Key Metrics Table inside Email */}
                  <div className="border border-slate-200 rounded-lg overflow-hidden text-xs">
                    <table className="w-full text-left">
                      <thead className="bg-[#042C51] text-white font-bold text-[10px] uppercase">
                        <tr>
                          <th className="p-2.5">Headcount Target</th>
                          <th className="p-2.5">Total Filled</th>
                          <th className="p-2.5">Fulfillment Rate</th>
                          <th className="p-2.5">Total Drop-offs</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 bg-white">
                        <tr>
                          <td className="p-2.5 font-bold text-slate-800">{selectedReport.totalRequirement}</td>
                          <td className="p-2.5 font-bold text-emerald-700">{selectedReport.totalFilled}</td>
                          <td className="p-2.5 font-bold text-[#FF5C28]">
                            {Math.round((selectedReport.totalFilled / selectedReport.totalRequirement) * 100)}%
                          </td>
                          <td className="p-2.5 font-bold text-rose-700">{selectedReport.totalDropOffs}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* Account Breakdown inside Email */}
                  <div className="space-y-2">
                    <span className="text-xs font-black text-[#042C51] block uppercase">Role & Account Status:</span>
                    <div className="space-y-1.5">
                      {selectedReport.rolesBreakdown.map((r) => (
                        <div key={r.id} className="p-2 bg-slate-50 rounded border border-slate-200 text-[11px] flex justify-between items-center">
                          <span>
                            <strong>{r.roleName}</strong> ({r.account})
                          </span>
                          <span className="font-mono font-bold text-[#042C51]">
                            {r.filled}/{r.required} [{r.deliveryStatus}]
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Action Items inside Email */}
                  {selectedReport.actionItems.length > 0 && (
                    <div className="space-y-1">
                      <span className="text-xs font-black text-[#042C51] block uppercase">Action Items for Next Week:</span>
                      <ul className="list-disc list-inside text-[11px] text-slate-700 space-y-0.5">
                        {selectedReport.actionItems.map((item, idx) => (
                          <li key={idx}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Footer Signoff */}
                  <div className="pt-3 border-t border-slate-200 text-[11px] text-slate-500">
                    <p>Best regards,</p>
                    <p className="font-bold text-[#042C51]">{selectedReport.author}</p>
                    <p>Talent Acquisition Operations | Siblings Solutions</p>
                  </div>
                </div>
              </div>

              {/* Email Modal Footer */}
              <div className="bg-slate-100 p-4 border-t border-slate-200 flex items-center justify-between">
                <button
                  onClick={handleCopyEmailText}
                  className="flex items-center gap-1.5 px-4 py-2 bg-[#042C51] hover:bg-[#FF5C28] text-white text-xs font-black rounded-lg transition-all cursor-pointer"
                >
                  {isCopiedEmail ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  <span>{isCopiedEmail ? "Copied to Clipboard!" : "Copy Email Content"}</span>
                </button>

                <button
                  onClick={() => setIsEmailPreviewOpen(false)}
                  className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold rounded-lg transition-colors cursor-pointer"
                >
                  Close Preview
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
