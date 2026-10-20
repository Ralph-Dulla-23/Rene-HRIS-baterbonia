import React, { useState, useMemo, useEffect } from "react";
import AddJobDescriptionModal from "./AddJobDescriptionModal";
import JobDescriptionPreviewModal from "./JobDescriptionPreviewModal";
import DeleteJobDescriptionModal from "./DeleteJobDescriptionModal";
import {
  loadFromLocalStorage,
  saveToLocalStorage,
  STORAGE_KEYS,
  broadcastDataChange
} from "../data/recruitmentStore";
import {
  FileText,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  ClipboardList,
  Eye,
  Edit3,
  RefreshCw,
  X,
  ChevronRight,
  Sparkles,
  Building2,
  UserCheck,
  Tag,
  Clock,
  Layers,
  Send,
  AlertCircle,
  FileCheck,
  HelpCircle,
  History,
  ShieldCheck,
  Award,
  Users,
  Archive,
  ArchiveRestore,
  RotateCcw,
  FolderArchive,
  Trash2
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

// Types
export type JDStatus =
  | "Existing"
  | "For Revision"
  | "New Job Description"
  | "For Approval"
  | "Approved"
  | "Rejected";

export interface RevisionLog {
  id: string;
  date: string;
  author: string;
  version: string;
  remarks: string;
}

export interface CompensableFactorRecord {
  id: number;
  factorName: string;
  category: "IQ" | "EQ" | "CONDITIONS";
  criteria: string;
  weightOrPoints: number;
  key?: string;
  assessment?: string;
  confidence?: string;
  summary?: string;
  evidence?: { sourceField: string; text: string }[];
  missingContext?: string[];
  requiresUserInput?: boolean;
  reviewed?: boolean;
}

export interface JobDescriptionRecord {
  id: string;
  documentTitle: string;
  roleTitle: string;
  department: string;
  account: string;
  linkedHiringNeed: string;
  supervisoryLevel: string;
  status: JDStatus;
  dateRequested: string;
  versionNo: string;
  competencies: string[];
  educationRequirements?: string[];
  experienceRequirements?: string[];
  certificationsAndAffiliations?: string[];
  location?: string;
  compensableFactors?: CompensableFactorRecord[];
  responsibilities: string[];
  targetPersonality: string;
  revisionHistory: RevisionLog[];
  isArchived?: boolean;
  archivedAt?: string;
  archivedBy?: string;
  archiveReason?: string;
}

interface JobDescriptionPageProps {
  onSwitchModule?: (module: string) => void;
}

// Mock Initial Data
const INITIAL_JOB_DESCRIPTIONS: JobDescriptionRecord[] = [
  {
    id: "JD-2026-001",
    documentTitle: "JD_Customer_Support_Specialist_v2.1.pdf",
    roleTitle: "Customer Support Specialist",
    department: "Technical Support",
    account: "Verizon Tech",
    linkedHiringNeed: "REQ-2026-089 (Ramp - 40 Agents)",
    supervisoryLevel: "Individual Contributor",
    status: "Existing",
    dateRequested: "2026-06-12",
    versionNo: "v2.1",
    competencies: ["B2+ English Fluency", "Inbound Call Handling", "Zendesk CRM", "Technical Troubleshooting"],
    responsibilities: [
      "Handle inbound customer inquiries via voice and chat channels.",
      "Troubleshoot tier-1 broadband and router connection issues.",
      "Maintain a minimum 92% First Contact Resolution (FCR) score.",
      "Log detailed customer interactions in Zendesk ticket queue."
    ],
    targetPersonality: "Empathetic, patient under pressure, detail-oriented communicator",
    revisionHistory: [
      {
        id: "REV-101",
        date: "2026-06-12",
        author: "Alena Batacan (HR Admin)",
        version: "v2.1",
        remarks: "Updated competency benchmark to B2+ CEFR English standards."
      }
    ]
  },
  {
    id: "JD-2026-002",
    documentTitle: "JD_Technical_Support_Lead_v1.0.pdf",
    roleTitle: "Technical Support Team Lead",
    department: "Operations",
    account: "Comcast Support",
    linkedHiringNeed: "REQ-2026-094 (Leadership Replacement)",
    supervisoryLevel: "Team Lead",
    status: "For Revision",
    dateRequested: "2026-07-02",
    versionNo: "v1.0",
    competencies: ["Team Coaching", "Queue Escalation Management", "SLA Monitoring", "Avaya / Cisco Telephony"],
    responsibilities: [
      "Manage real-time queue performance for a team of 15-20 agents.",
      "Conduct weekly 1-on-1 coaching sessions and KPI scorecards.",
      "Handle tier-2 escalated customer complaints and manager call-backs.",
      "Coordinate with WFM on floor adherence and staffing coverage."
    ],
    targetPersonality: "Assertive, highly organized leader with strong analytical acumen",
    revisionHistory: [
      {
        id: "REV-102",
        date: "2026-07-18",
        author: "Marcus Vance (TA Lead)",
        version: "v1.0",
        remarks: "Requested revision to add mandatory weekend shift supervisory experience."
      }
    ]
  },
  {
    id: "JD-2026-003",
    documentTitle: "JD_DevOps_Cloud_Architect_v0.9.pdf",
    roleTitle: "DevOps & Cloud Architect",
    department: "Executive Tech",
    account: "Internal HR Ops",
    linkedHiringNeed: "REQ-2026-102 (Core Engineering)",
    supervisoryLevel: "Manager",
    status: "New Job Description",
    dateRequested: "2026-07-15",
    versionNo: "v0.9 Draft",
    competencies: ["AWS Cloud Infra", "Docker & Kubernetes", "CI/CD Pipelines", "Terraform Infrastructure"],
    responsibilities: [
      "Architect and deploy secure containerized Cloud Run microservices.",
      "Maintain zero-downtime CI/CD release pipelines with GitHub Actions.",
      "Implement SOC2 compliant audit log infrastructure and database rules.",
      "Monitor system latency and resource optimization across environments."
    ],
    targetPersonality: "Proactive problem solver, systematic, security-focused engineering mindset",
    revisionHistory: []
  },
  {
    id: "JD-2026-004",
    documentTitle: "JD_Healthcare_Billing_Agent_v1.4.pdf",
    roleTitle: "Healthcare Billing Representative",
    department: "Healthcare Ops",
    account: "Aetna Health",
    linkedHiringNeed: "REQ-2026-071 (Quarterly Expansion)",
    supervisoryLevel: "Individual Contributor",
    status: "Existing",
    dateRequested: "2026-05-20",
    versionNo: "v1.4",
    competencies: ["HIPAA Compliance", "Medical Claims Processing", "ICD-10 Coding Knowledge", "Active Listening"],
    responsibilities: [
      "Verify patient insurance coverage and process prior authorizations.",
      "Adhere strictly to HIPAA data privacy and confidentiality rules.",
      "Reconcile insurance claim discrepancies and dispute rejections.",
      "Maintain 98%+ accuracy in data entry and claims documentation."
    ],
    targetPersonality: "Meticulous, ethical, quiet focus with high procedural compliance",
    revisionHistory: [
      {
        id: "REV-103",
        date: "2026-05-20",
        author: "Samantha Reed (Finance)",
        version: "v1.4",
        remarks: "Approved annual SLA alignment update for ICD-10 coding standards."
      }
    ]
  },
  {
    id: "JD-2026-005",
    documentTitle: "JD_Talent_Acquisition_Sourcer_v1.0.pdf",
    roleTitle: "Talent Acquisition Specialist",
    department: "Talent Acquisition",
    account: "Internal HR Ops",
    linkedHiringNeed: "REQ-2026-110 (TA Internal Backfill)",
    supervisoryLevel: "Individual Contributor",
    status: "For Approval",
    dateRequested: "2026-07-19",
    versionNo: "v1.0",
    competencies: ["Boolean Search Sourcing", "LinkedIn Recruiter", "Candidate Interviewing", "ATS Pipeline Tracking"],
    responsibilities: [
      "Source qualified candidates across LinkedIn, JobStreet, and internal talent pools.",
      "Conduct initial HR screening interviews and behavioral assessments.",
      "Manage end-to-end interview scheduling with operations managers.",
      "Maintain candidate pipeline records with 100% daily log hygiene."
    ],
    targetPersonality: "Outgoing, persistent networker, relationship-driven recruiter",
    revisionHistory: []
  },
  {
    id: "JD-2026-006",
    documentTitle: "JD_WFM_Realtime_Analyst_v2.0.pdf",
    roleTitle: "WFM Real-Time Analyst",
    department: "Workforce Management",
    account: "Global WFM",
    linkedHiringNeed: "REQ-2026-065 (24/7 Desk Coverage)",
    supervisoryLevel: "Individual Contributor",
    status: "Approved",
    dateRequested: "2026-06-01",
    versionNo: "v2.0",
    competencies: ["Verint / Aspect WFM", "Interval Adherence Tracking", "Call Volume Forecasting", "Excel Data Modeling"],
    responsibilities: [
      "Monitor intra-day service levels and floor adherence across 5 accounts.",
      "Adjust agent schedule states in real-time to mitigate queue spikes.",
      "Publish daily timecard variance reports to HR and Operations heads.",
      "Analyze historical call volume trends for weekly scheduling runs."
    ],
    targetPersonality: "Analytical, calm under pressure, data-obsessed communicator",
    revisionHistory: [
      {
        id: "REV-104",
        date: "2026-06-01",
        author: "Ralph Dulla (Super Admin)",
        version: "v2.0",
        remarks: "Approved final version for all global operations accounts."
      }
    ]
  },
  {
    id: "JD-2026-007",
    documentTitle: "JD_Legacy_Call_Center_Agent_v1.0.pdf",
    roleTitle: "Legacy Inbound Call Center Agent",
    department: "Operations",
    account: "Sprint Telecom",
    linkedHiringNeed: "REQ-2025-012 (Legacy Account)",
    supervisoryLevel: "Individual Contributor",
    status: "Existing",
    dateRequested: "2025-11-14",
    versionNo: "v1.0",
    competencies: ["Inbound Voice Handling", "CRM Call Tagging", "Active Listening"],
    responsibilities: [
      "Handle general customer inquiries for mobile plans and billing statements.",
      "Log call details in legacy CRM system."
    ],
    targetPersonality: "Patient, customer-centric",
    revisionHistory: [
      {
        id: "REV-ARCHIVE-01",
        date: "2026-05-10",
        author: "Alena Batacan (HR Admin)",
        version: "v1.0",
        remarks: "Archived: Role consolidated into Customer Support Specialist standard spec (JD-2026-001)."
      }
    ],
    isArchived: true,
    archivedAt: "2026-05-10",
    archivedBy: "Alena Batacan (HR Admin)",
    archiveReason: "Role consolidated into Customer Support Specialist standard spec (JD-2026-001)"
  }
];

export default function JobDescriptionPage({ onSwitchModule }: JobDescriptionPageProps) {
  // Job Descriptions backed by LocalStorage
  const [jobDescriptions, setJobDescriptions] = useState<JobDescriptionRecord[]>(() =>
    loadFromLocalStorage(STORAGE_KEYS.JOB_DESCRIPTIONS, INITIAL_JOB_DESCRIPTIONS)
  );

  // Sync to localStorage
  useEffect(() => {
    saveToLocalStorage(STORAGE_KEYS.JOB_DESCRIPTIONS, jobDescriptions);
    broadcastDataChange("job_descriptions");
  }, [jobDescriptions]);

  // Listen for storage updates
  useEffect(() => {
    const handleStoreUpdate = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail?.channel === "job_descriptions" || customEvent.detail?.channel === "all") {
        setJobDescriptions(prev => {
          const fresh = loadFromLocalStorage(STORAGE_KEYS.JOB_DESCRIPTIONS, INITIAL_JOB_DESCRIPTIONS);
          return JSON.stringify(prev) === JSON.stringify(fresh) ? prev : fresh;
        });
      }
    };
    window.addEventListener("sibs_store_update", handleStoreUpdate);
    return () => window.removeEventListener("sibs_store_update", handleStoreUpdate);
  }, []);
  const [selectedStatusTab, setSelectedStatusTab] = useState<string>("All");

  // Filter States
  const [searchTerm, setSearchTerm] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("All Departments");
  const [accountFilter, setAccountFilter] = useState("All Accounts");
  const [supervisoryFilter, setSupervisoryFilter] = useState("All Levels");

  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [viewingJD, setViewingJD] = useState<JobDescriptionRecord | null>(null);
  const [revisingJD, setRevisingJD] = useState<JobDescriptionRecord | null>(null);
  const [editingJD, setEditingJD] = useState<JobDescriptionRecord | null>(null);
  const [archiveTargetJD, setArchiveTargetJD] = useState<JobDescriptionRecord | null>(null);
  const [archiveReason, setArchiveReason] = useState<string>("Position deprecated / no longer in active hiring");
  const [customArchiveReason, setCustomArchiveReason] = useState<string>("");
  const [restoreTargetJD, setRestoreTargetJD] = useState<JobDescriptionRecord | null>(null);
  const [deleteTargetJD, setDeleteTargetJD] = useState<JobDescriptionRecord | null>(null);

  // Status Modal (Feedback Overlay) State
  const [statusModal, setStatusModal] = useState<{
    isOpen: boolean;
    type: "success" | "error" | "info";
    title: string;
    message: string;
  }>({
    isOpen: false,
    type: "success",
    title: "",
    message: ""
  });

  const triggerStatusModal = (type: "success" | "error" | "info", title: string, message: string) => {
    setStatusModal({ isOpen: true, type, title, message });
  };

  // Form State for Adding New Job Description
  const [newJdForm, setNewJdForm] = useState({
    documentTitle: "",
    roleTitle: "",
    department: "Technical Support",
    account: "Verizon Tech",
    linkedHiringNeed: "REQ-2026-NEW (General Intake)",
    supervisoryLevel: "Individual Contributor",
    competenciesText: "B2+ English Fluency, Customer Service, Problem Solving",
    responsibilitiesText: "Handle inbound inquiries.\nMaintain high CSAT scores.\nDocument logs in ticket queue.",
    targetPersonality: "Empathetic, structured, resilient under call volume"
  });

  // Form State for Revising
  const [revisionRemarks, setRevisionRemarks] = useState("");
  const [updatedCompetenciesText, setUpdatedCompetenciesText] = useState("");
  const [updatedResponsibilitiesText, setUpdatedResponsibilitiesText] = useState("");

  // Stat Counters (Active vs Archived)
  const stats = useMemo(() => {
    const activeJDs = jobDescriptions.filter((j) => !j.isArchived);
    const archivedJDs = jobDescriptions.filter((j) => j.isArchived);
    const total = activeJDs.length;
    const existing = activeJDs.filter((j) => j.status === "Existing" || j.status === "Approved").length;
    const revision = activeJDs.filter((j) => j.status === "For Revision").length;
    const newJd = activeJDs.filter((j) => j.status === "New Job Description" || j.status === "For Approval").length;
    const forApproval = activeJDs.filter((j) => j.status === "For Approval").length;
    const rejected = activeJDs.filter((j) => j.status === "Rejected").length;
    const archived = archivedJDs.length;
    return { total, existing, revision, newJd, forApproval, rejected, archived };
  }, [jobDescriptions]);

  // Filtered Job Descriptions List
  const filteredJDs = useMemo(() => {
    return jobDescriptions.filter((jd) => {
      // Tab Status & Archive filter
      if (selectedStatusTab === "Archived") {
        if (!jd.isArchived) return false;
      } else {
        if (jd.isArchived) return false;

        if (selectedStatusTab !== "All") {
          if (selectedStatusTab === "Existing") {
            if (jd.status !== "Existing" && jd.status !== "Approved") return false;
          } else if (selectedStatusTab === "New Job Description") {
            if (jd.status !== "New Job Description" && jd.status !== "For Approval") return false;
          } else if (jd.status !== selectedStatusTab) {
            return false;
          }
        }
      }

      // Search Query
      const matchesSearch =
        jd.roleTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
        jd.documentTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
        jd.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
        jd.account.toLowerCase().includes(searchTerm.toLowerCase()) ||
        jd.linkedHiringNeed.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (jd.archiveReason && jd.archiveReason.toLowerCase().includes(searchTerm.toLowerCase()));

      // Dropdown Selects
      const matchesDept = departmentFilter === "All Departments" || jd.department === departmentFilter;
      const matchesAcc = accountFilter === "All Accounts" || jd.account === accountFilter;
      const matchesSuper = supervisoryFilter === "All Levels" || jd.supervisoryLevel === supervisoryFilter;

      return matchesSearch && matchesDept && matchesAcc && matchesSuper;
    });
  }, [jobDescriptions, selectedStatusTab, searchTerm, departmentFilter, accountFilter, supervisoryFilter]);

  // Handle Add Job Description Submission
  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newJdForm.roleTitle || !newJdForm.documentTitle) {
      triggerStatusModal("error", "Creation Failed", "Please provide a valid Role Title and Document Title.");
      return;
    }

    const comps = newJdForm.competenciesText
      .split(",")
      .map((c) => c.trim())
      .filter(Boolean);

    const resps = newJdForm.responsibilitiesText
      .split("\n")
      .map((r) => r.trim())
      .filter(Boolean);

    const newRecord: JobDescriptionRecord = {
      id: `JD-2026-00${jobDescriptions.length + 1}`,
      documentTitle: newJdForm.documentTitle.endsWith(".pdf")
        ? newJdForm.documentTitle
        : `${newJdForm.documentTitle}.pdf`,
      roleTitle: newJdForm.roleTitle,
      department: newJdForm.department,
      account: newJdForm.account,
      linkedHiringNeed: newJdForm.linkedHiringNeed,
      supervisoryLevel: newJdForm.supervisoryLevel,
      status: "New Job Description",
      dateRequested: new Date().toISOString().split("T")[0],
      versionNo: "v1.0",
      competencies: comps.length ? comps : ["Communication", "Domain Knowledge"],
      responsibilities: resps.length ? resps : ["Execute assigned core responsibilities."],
      targetPersonality: newJdForm.targetPersonality || "Adaptable, professional team player",
      revisionHistory: []
    };

    setJobDescriptions((prev) => [newRecord, ...prev]);
    setIsAddModalOpen(false);

    // Reset Form
    setNewJdForm({
      documentTitle: "",
      roleTitle: "",
      department: "Technical Support",
      account: "Verizon Tech",
      linkedHiringNeed: "REQ-2026-NEW (General Intake)",
      supervisoryLevel: "Individual Contributor",
      competenciesText: "B2+ English Fluency, Customer Service, Problem Solving",
      responsibilitiesText: "Handle inbound inquiries.\nMaintain high CSAT scores.\nDocument logs in ticket queue.",
      targetPersonality: "Empathetic, structured, resilient under call volume"
    });

    triggerStatusModal(
      "success",
      "Job Description Created",
      `New JD for "${newRecord.roleTitle}" (${newRecord.versionNo}) was created and queued in New Job Description records.`
    );
  };

  // Handle Revision Submission
  const handleRevisionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!revisingJD) return;
    if (!revisionRemarks) {
      triggerStatusModal("error", "Revision Failed", "Please enter valid revision remarks before submitting.");
      return;
    }

    const nextVer = `v${(parseFloat(revisingJD.versionNo.replace(/[^0-9.]/g, "")) + 0.1).toFixed(1)}`;

    const newRevLog: RevisionLog = {
      id: `REV-${Math.floor(100 + Math.random() * 900)}`,
      date: new Date().toISOString().split("T")[0],
      author: "Super Admin / HR Reviewer",
      version: nextVer,
      remarks: revisionRemarks
    };

    const updatedComps = updatedCompetenciesText
      ? updatedCompetenciesText.split(",").map((c) => c.trim()).filter(Boolean)
      : revisingJD.competencies;

    const updatedResps = updatedResponsibilitiesText
      ? updatedResponsibilitiesText.split("\n").map((r) => r.trim()).filter(Boolean)
      : revisingJD.responsibilities;

    const updatedJD: JobDescriptionRecord = {
      ...revisingJD,
      status: "For Revision",
      versionNo: nextVer,
      competencies: updatedComps,
      responsibilities: updatedResps,
      revisionHistory: [newRevLog, ...revisingJD.revisionHistory]
    };

    setJobDescriptions((prev) => prev.map((j) => (j.id === revisingJD.id ? updatedJD : j)));

    if (viewingJD && viewingJD.id === revisingJD.id) {
      setViewingJD(updatedJD);
    }

    setRevisingJD(null);
    setRevisionRemarks("");
    setUpdatedCompetenciesText("");
    setUpdatedResponsibilitiesText("");

    triggerStatusModal(
      "success",
      "Revision Remarks Saved",
      `Job Description "${updatedJD.roleTitle}" has been flagged as "For Revision" (${updatedJD.versionNo}) with your notes saved.`
    );
  };

  // Handle Archive Confirmation
  const handleArchiveConfirm = () => {
    if (!archiveTargetJD) return;
    const finalReason =
      archiveReason === "Other / Custom Reason"
        ? customArchiveReason.trim() || "Archived by user"
        : archiveReason;
    const today = new Date().toISOString().split("T")[0];

    const archiveLog: RevisionLog = {
      id: `REV-ARCH-${Math.floor(100 + Math.random() * 900)}`,
      date: today,
      author: "HR Admin / Super Admin",
      version: archiveTargetJD.versionNo,
      remarks: `Archived: ${finalReason}`
    };

    const updatedJD: JobDescriptionRecord = {
      ...archiveTargetJD,
      isArchived: true,
      archivedAt: today,
      archivedBy: "HR Admin / Super Admin",
      archiveReason: finalReason,
      revisionHistory: [archiveLog, ...archiveTargetJD.revisionHistory]
    };

    setJobDescriptions((prev) => prev.map((j) => (j.id === archiveTargetJD.id ? updatedJD : j)));

    if (viewingJD && viewingJD.id === archiveTargetJD.id) {
      setViewingJD(updatedJD);
    }

    setArchiveTargetJD(null);
    setCustomArchiveReason("");

    triggerStatusModal(
      "success",
      "Job Description Archived",
      `"${updatedJD.roleTitle}" (${updatedJD.id}) was moved to the Archived repository.`
    );
  };

  // Handle Restore Confirmation
  const handleRestoreConfirm = (target?: JobDescriptionRecord) => {
    const jdToRestore = target || restoreTargetJD;
    if (!jdToRestore) return;
    const today = new Date().toISOString().split("T")[0];

    const restoreLog: RevisionLog = {
      id: `REV-REST-${Math.floor(100 + Math.random() * 900)}`,
      date: today,
      author: "HR Admin / Super Admin",
      version: jdToRestore.versionNo,
      remarks: "Restored from Archive repository to active status."
    };

    const updatedJD: JobDescriptionRecord = {
      ...jdToRestore,
      isArchived: false,
      archivedAt: undefined,
      archivedBy: undefined,
      archiveReason: undefined,
      revisionHistory: [restoreLog, ...jdToRestore.revisionHistory]
    };

    setJobDescriptions((prev) => prev.map((j) => (j.id === jdToRestore.id ? updatedJD : j)));

    if (viewingJD && viewingJD.id === jdToRestore.id) {
      setViewingJD(updatedJD);
    }

    setRestoreTargetJD(null);

    triggerStatusModal(
      "success",
      "Job Description Restored",
      `"${updatedJD.roleTitle}" (${updatedJD.id}) has been restored to active job descriptions.`
    );
  };

  // Handle Delete Confirmation
  const handleDeleteConfirm = (target?: JobDescriptionRecord) => {
    const jdToDelete = target || deleteTargetJD;
    if (!jdToDelete) return;

    setJobDescriptions((prev) => prev.filter((j) => j.id !== jdToDelete.id));

    if (viewingJD && viewingJD.id === jdToDelete.id) {
      setViewingJD(null);
    }

    setDeleteTargetJD(null);

    triggerStatusModal(
      "info",
      "Job Description Permanently Deleted",
      `"${jdToDelete.roleTitle}" (${jdToDelete.id}) was permanently deleted from the database and unlinked from associated requisitions.`
    );
  };

  // Status Badge Styling Helper
  const renderStatusBadge = (jd: JobDescriptionRecord) => {
    if (jd.isArchived) {
      return (
        <span className="bg-slate-100 text-slate-700 text-[10px] font-bold px-2.5 py-1 rounded-full inline-flex items-center gap-1 border border-slate-200">
          <Archive className="w-3 h-3 text-slate-500" />
          Archived
        </span>
      );
    }

    const status = jd.status;
    switch (status) {
      case "Approved":
      case "Existing":
        return (
          <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2.5 py-1 rounded-full inline-flex items-center gap-1 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            {status}
          </span>
        );
      case "For Revision":
        return (
          <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2.5 py-1 rounded-full inline-flex items-center gap-1 border border-amber-200">
            <AlertTriangle className="w-3 h-3 text-amber-600" />
            For Revision
          </span>
        );
      case "New Job Description":
      case "For Approval":
        return (
          <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-2.5 py-1 rounded-full inline-flex items-center gap-1 border border-blue-200">
            <Clock className="w-3 h-3 text-blue-600" />
            {status}
          </span>
        );
      case "Rejected":
        return (
          <span className="bg-red-100 text-red-800 text-[10px] font-bold px-2.5 py-1 rounded-full inline-flex items-center gap-1 border border-red-200">
            <AlertCircle className="w-3 h-3 text-red-600" />
            Rejected
          </span>
        );
      default:
        return (
          <span className="bg-slate-100 text-slate-700 text-[10px] font-bold px-2.5 py-1 rounded-full">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="w-full text-[#101828] select-none space-y-6 pb-12">
      {/* ==================== 1. HEADER & TOP ACTION BAR ==================== */}
      <div className="bg-white rounded-xl border border-[#E6ECF2] shadow-xs overflow-hidden flex flex-col">
        <div className="h-[3.5px] w-full bg-gradient-to-r from-[#042C51] via-[#c24b30] to-[#FF5C28]" />
        <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-100 bg-[#E9F0FC] px-2.5 py-1 text-[9px] font-black uppercase tracking-wide text-[#042C51]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#FF5C28]" />
                Recruitment View
              </span>
            </div>
            <h1 className="text-2xl font-black text-[#042C51] tracking-tight">Job Description</h1>
            <p className="text-xs text-slate-500 font-medium mt-0.5">Manage JD readiness for Existing, For Revision, and New Job Description requirements.</p>
          </div>
          <button onClick={() => setIsAddModalOpen(true)} className="bg-[#FF5C28] hover:bg-[#e04b1a] text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-xs flex items-center gap-2 transition-all cursor-pointer"><Plus className="w-4 h-4" /><span>Add Job Description</span></button>
        </div>
      </div>

      {/* ==================== 2. JOB DESCRIPTION SUMMARY (STAT CARDS) ==================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-[#E6ECF2] shadow-xs flex items-center justify-between transition-all hover:shadow-sm"><div><div className="text-[10px] font-black uppercase text-slate-600 tracking-wider">TOTAL JD</div><div className="text-3xl font-black text-[#042C51] tracking-tight mt-1">{stats.total}</div><div className="text-[11px] text-slate-400 font-medium mt-1">All active job descriptions</div></div><div className="w-10 h-10 rounded-full bg-blue-50/80 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0"><ClipboardList className="w-5 h-5" /></div></div>
        <div className="bg-white p-5 rounded-xl border border-[#E6ECF2] shadow-xs flex items-center justify-between transition-all hover:shadow-sm"><div><div className="text-[10px] font-black uppercase text-emerald-600 tracking-wider">EXISTING</div><div className="text-3xl font-black text-emerald-600 tracking-tight mt-1">{stats.existing}</div><div className="text-[11px] text-slate-400 font-medium mt-1">Ready or already available</div></div><div className="w-10 h-10 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0"><CheckCircle2 className="w-5 h-5" /></div></div>
        <div className="bg-white p-5 rounded-xl border border-[#E6ECF2] shadow-xs flex items-center justify-between transition-all hover:shadow-sm"><div><div className="text-[10px] font-black uppercase text-[#FF5C28] tracking-wider">FOR REVISION</div><div className="text-3xl font-black text-[#FF5C28] tracking-tight mt-1">{stats.revision}</div><div className="text-[11px] text-slate-400 font-medium mt-1">Needs specification update or remarks</div></div><div className="w-10 h-10 rounded-full bg-orange-50 border border-orange-100 flex items-center justify-center text-[#FF5C28] shrink-0"><AlertTriangle className="w-5 h-5" /></div></div>
        <div className="bg-white p-5 rounded-xl border border-[#E6ECF2] shadow-xs flex items-center justify-between transition-all hover:shadow-sm"><div><div className="text-[10px] font-black uppercase text-indigo-600 tracking-wider">NEW JOB DESCRIPTION</div><div className="text-3xl font-black text-indigo-600 tracking-tight mt-1">{stats.newJd}</div><div className="text-[11px] text-slate-400 font-medium mt-1">New or unlinked JD intake</div></div><div className="w-10 h-10 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0"><FileText className="w-5 h-5" /></div></div>
      </div>

      {/* ==================== 3. JOB DESCRIPTION RECORDS / FILTERS / TABLE ==================== */}
      <section className="sibs-profile-tab-panel sibs-page-card-in overflow-visible rounded-2xl border border-[#E6ECF2] bg-white font-jakarta shadow-sm">
        <div className="border-b border-[#E6ECF2] p-4 sm:p-5 2xl:p-6">
          <h2 className="text-sm 2xl:text-base font-extrabold text-[#042C51]">Job Description Records</h2>
          <p className="mt-1 text-xs font-semibold text-[#667085]">
            Search and filter JD records by role, department, account, and supervisory level.
          </p>

          <div className="mt-3.5 2xl:mt-4 grid grid-cols-1 gap-3 xl:grid-cols-[minmax(0,2fr)_minmax(180px,0.75fr)_minmax(180px,0.75fr)_minmax(180px,0.75fr)_auto] xl:items-end">
            <div className="min-w-0">
              <label className="mb-1.5 block text-[10px] font-extrabold text-[#101828]">Search</label>
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#98A2B3]" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search role title, document, department, account, or hiring need..."
                  className="h-10 w-full rounded-lg border border-[#DDE5EE] bg-[#F8FAFC] pl-9 pr-3 text-xs font-semibold text-[#042C51] outline-none transition placeholder:text-[#8DA2BD] hover:border-[#C9D6E4] focus:border-[#FF5C28] focus:bg-white focus:ring-2 focus:ring-[#FF5C28]/10"
                />
              </div>
            </div>

            <div className="min-w-0">
              <label className="mb-1.5 block text-[10px] font-extrabold text-[#101828]">Department</label>
              <select
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
                className="h-10 w-full rounded-lg border border-[#DDE5EE] bg-[#F8FAFC] px-3 text-xs font-extrabold text-[#042C51] outline-none transition hover:border-[#C9D6E4] focus:border-[#FF5C28] focus:bg-white focus:ring-2 focus:ring-[#FF5C28]/10"
              >
                {["All Departments","Technical Support","Operations","Executive Tech","Healthcare Ops","Talent Acquisition","Workforce Management"].map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>

            <div className="min-w-0">
              <label className="mb-1.5 block text-[10px] font-extrabold text-[#101828]">Account</label>
              <select
                value={accountFilter}
                onChange={(e) => setAccountFilter(e.target.value)}
                className="h-10 w-full rounded-lg border border-[#DDE5EE] bg-[#F8FAFC] px-3 text-xs font-extrabold text-[#042C51] outline-none transition hover:border-[#C9D6E4] focus:border-[#FF5C28] focus:bg-white focus:ring-2 focus:ring-[#FF5C28]/10"
              >
                {["All Accounts","Verizon Tech","Comcast Support","Internal HR Ops","Aetna Health","Global WFM","Sprint Telecom"].map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>

            <div className="min-w-0">
              <label className="mb-1.5 block text-[10px] font-extrabold text-[#101828]">Supervisory Level</label>
              <select
                value={supervisoryFilter}
                onChange={(e) => setSupervisoryFilter(e.target.value)}
                className="h-10 w-full rounded-lg border border-[#DDE5EE] bg-[#F8FAFC] px-3 text-xs font-extrabold text-[#042C51] outline-none transition hover:border-[#C9D6E4] focus:border-[#FF5C28] focus:bg-white focus:ring-2 focus:ring-[#FF5C28]/10"
              >
                {["All Levels","Individual Contributor","Team Lead","Manager"].map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>

            <button
              type="button"
              onClick={() => {
                setSearchTerm("");
                setDepartmentFilter("All Departments");
                setAccountFilter("All Accounts");
                setSupervisoryFilter("All Levels");
                setSelectedStatusTab("All");
              }}
              disabled={
                !searchTerm.trim() &&
                departmentFilter === "All Departments" &&
                accountFilter === "All Accounts" &&
                supervisoryFilter === "All Levels" &&
                selectedStatusTab === "All"
              }
              className="inline-flex h-10 w-full items-center justify-center gap-1.5 rounded-lg border border-[#DDE5EE] bg-white px-4 text-xs font-extrabold text-[#667085] transition hover:border-[#FF5C28]/40 hover:bg-[#FFF9F6] hover:text-[#FF5C28] disabled:cursor-not-allowed disabled:opacity-50 xl:w-auto"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Clear
            </button>
          </div>
        </div>

        <div className="min-h-0 flex-1 p-4 sm:p-5 2xl:p-6">
          <div className="overflow-hidden rounded-xl border border-[#E6ECF2] bg-white">
            <div className="flex overflow-x-auto border-b border-[#E6ECF2] bg-[#F8FAFC] px-4 pt-3">
              {[
                { key: "All", label: "All JDs", count: stats.total },
                { key: "Existing", label: "Existing / Ready", count: stats.existing },
                { key: "For Revision", label: "For Revision", count: stats.revision },
                { key: "New Job Description", label: "New Job Description", count: stats.newJd },
                { key: "Archived", label: "Archived", count: stats.archived },
                { key: "Rejected", label: "Rejected", count: stats.rejected }
              ].map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setSelectedStatusTab(tab.key)}
                  className={`relative whitespace-nowrap px-4 py-3 text-[10px] font-extrabold uppercase tracking-normal transition-colors ${
                    selectedStatusTab === tab.key ? "bg-white text-[#042C51]" : "text-[#667085] hover:text-[#042C51]"
                  }`}
                >
                  <span className="inline-flex items-center gap-2">
                    {tab.label}
                    <span className={`rounded-full px-2 py-0.5 text-[9px] font-extrabold ${
                      selectedStatusTab === tab.key ? "bg-[#042C51] text-white" : "bg-[#E9EEF4] text-[#667085]"
                    }`}>
                      {tab.count}
                    </span>
                  </span>
                  {selectedStatusTab === tab.key && <span className="absolute inset-x-0 bottom-0 h-0.5 bg-[#FF5C28]" />}
                </button>
              ))}
            </div>

            <div className="hidden overflow-x-auto lg:block">
              <table className="w-full min-w-[980px] table-fixed border-collapse text-left text-xs">
                <thead className="sticky top-0 z-10 bg-[#F8FAFC]">
                  <tr className="border-b border-[#E6ECF2]">
                    <th className="w-[32%] px-4 py-3.5 text-[10px] font-extrabold uppercase tracking-normal text-[#667085]">Role & Document Title</th>
                    <th className="w-[26%] px-4 py-3.5 text-[10px] font-extrabold uppercase tracking-normal text-[#667085]">Department / Account</th>
                    <th className="w-[18%] px-4 py-3.5 text-[10px] font-extrabold uppercase tracking-normal text-[#667085]">Supervisory Level</th>
                    <th className="w-[12%] px-4 py-3.5 text-[10px] font-extrabold uppercase tracking-normal text-[#667085]">Status</th>
                    <th className="w-[12%] px-4 py-3.5 text-[10px] font-extrabold uppercase tracking-normal text-[#667085]">Date & Version</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-[#E6ECF2]">
                  {filteredJDs.length > 0 ? (
                    filteredJDs.map((jd, index) => (
                      <tr
                        key={jd.id}
                        onClick={() => setViewingJD(jd)}
                        className={`cursor-pointer transition-colors hover:bg-[#FFFDFC] ${jd.isArchived ? "bg-slate-50/40" : ""}`}
                        style={{ animationDelay: `${index * 30}ms`, animationFillMode: "both" }}
                      >
                        <td className="px-4 py-2.5 align-middle">
                          <div className="flex items-start gap-2">
                            {jd.isArchived ? (
                              <FolderArchive className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                            ) : (
                              <FileText className="mt-0.5 h-4 w-4 shrink-0 text-[#FF5C28]" />
                            )}
                            <div className="min-w-0">
                              <p title={jd.documentTitle} className="max-w-[340px] truncate text-xs font-extrabold leading-5 text-[#042C51]">
                                {jd.documentTitle}
                              </p>
                              <p title={jd.roleTitle} className="mt-0.5 max-w-[340px] truncate text-[10px] font-semibold text-[#98A2B3]">
                                {jd.roleTitle}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-4 py-2.5 align-middle">
                          <p className="truncate text-xs font-extrabold text-[#042C51]">{jd.department}</p>
                          <p className="mt-0.5 truncate text-[10px] font-semibold text-[#667085]">{jd.account}</p>
                        </td>

                        <td className="px-4 py-2.5 align-middle text-xs font-semibold text-[#475467]">{jd.supervisoryLevel}</td>
                        <td className="px-4 py-2.5 align-middle">{renderStatusBadge(jd)}</td>

                        <td className="px-4 py-2.5 align-middle">
                          <p className="text-xs font-extrabold tabular-nums text-[#042C51]">{jd.versionNo}</p>
                          <p className="mt-0.5 text-[10px] font-semibold tabular-nums text-[#98A2B3]">{jd.dateRequested}</p>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-5 py-14 text-center">
                        <FileText className="mx-auto h-9 w-9 text-[#CBD5E1]" />
                        <p className="mt-3 text-sm font-extrabold text-[#042C51]">
                          {selectedStatusTab === "Archived" ? "No Archived Job Descriptions" : "No Job Descriptions Found"}
                        </p>
                        <p className="mt-1 text-xs font-semibold text-[#98A2B3]">No records matched the active search, filters, and status tab.</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="block space-y-3 p-3.5 sm:p-4 lg:hidden">
              {filteredJDs.length > 0 ? (
                filteredJDs.map((jd) => (
                  <button
                    key={jd.id}
                    type="button"
                    onClick={() => setViewingJD(jd)}
                    className={`w-full rounded-xl border p-4 text-left shadow-2xs transition-all ${
                      jd.isArchived ? "border-slate-200 bg-slate-50" : "border-[#E6ECF2] bg-white hover:border-[#FF5C28]/40"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex items-start gap-2">
                        {jd.isArchived ? (
                          <FolderArchive className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                        ) : (
                          <FileText className="mt-0.5 h-4 w-4 shrink-0 text-[#FF5C28]" />
                        )}
                        <div className="min-w-0">
                          <p className="truncate text-xs font-extrabold text-[#042C51]">{jd.documentTitle}</p>
                          <p className="mt-0.5 truncate text-[10px] font-semibold text-[#98A2B3]">{jd.roleTitle}</p>
                        </div>
                      </div>
                      {renderStatusBadge(jd)}
                    </div>

                    <div className="mt-3 grid grid-cols-2 gap-3 rounded-lg border border-[#EEF2F6] bg-[#F8FAFC] p-3">
                      <div>
                        <span className="block text-[9px] font-bold uppercase text-[#98A2B3]">Department / Account</span>
                        <span className="mt-1 block text-[11px] font-extrabold text-[#042C51]">{jd.department}</span>
                        <span className="block text-[10px] font-semibold text-[#667085]">{jd.account}</span>
                      </div>
                      <div>
                        <span className="block text-[9px] font-bold uppercase text-[#98A2B3]">Date / Version</span>
                        <span className="mt-1 block text-[11px] font-extrabold text-[#042C51]">{jd.versionNo}</span>
                        <span className="block text-[10px] font-semibold text-[#667085]">{jd.dateRequested}</span>
                      </div>
                    </div>
                  </button>
                ))
              ) : (
                <div className="py-10 text-center">
                  <FileText className="mx-auto h-8 w-8 text-[#CBD5E1]" />
                  <p className="mt-2 text-sm font-extrabold text-[#042C51]">No Job Descriptions Found</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ==================== 5. MODAL 1: ADD JOB DESCRIPTION MODAL ==================== */}
      <AddJobDescriptionModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={(newRecord) => {
          setJobDescriptions((prev) => [newRecord, ...prev]);
        }}
        existingTemplates={jobDescriptions}
        triggerStatusModal={triggerStatusModal}
      />

      {/* ==================== 6. MODAL 2: VIEW JOB DESCRIPTION DETAILS / OFFICIAL PREVIEW MODAL ==================== */}
      <JobDescriptionPreviewModal
        isOpen={!!viewingJD}
        jd={viewingJD}
        onClose={() => setViewingJD(null)}
        onFlagForRevision={(jdToRevise) => {
          setViewingJD(null);
          setRevisingJD(jdToRevise);
          setUpdatedCompetenciesText(jdToRevise.competencies.join(", "));
          setUpdatedResponsibilitiesText(jdToRevise.responsibilities.join("\n"));
        }}
        onArchive={(jdToArchive) => {
          setArchiveTargetJD(jdToArchive);
        }}
        onRestore={(jdToRestore) => {
          setRestoreTargetJD(jdToRestore);
        }}
        onDelete={(jdToDelete) => {
          setDeleteTargetJD(jdToDelete);
        }}
      />

      {/* ==================== 7. MODAL 3: REVISE JOB DESCRIPTION MODAL ==================== */}
      <AnimatePresence>
        {revisingJD && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#042C51]/80 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 10 }}
              className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-[#E6ECF2] my-8 overflow-hidden text-[#101828]"
            >
              <div className="bg-[#042C51] text-white p-4 sm:p-5 flex items-center justify-between border-b border-[#063866]">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-white/10 border border-white/20 text-[#FF5C28] flex items-center justify-center shrink-0">
                    <Edit3 className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-black text-white tracking-tight">Revise Job Description</h3>
                    <p className="text-[11px] text-slate-300 font-medium">
                      Submit requested revisions and updated specifications for {revisingJD.roleTitle}.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setRevisingJD(null)}
                  className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-all cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleRevisionSubmit} className="flex flex-col">
                <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                  <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 font-medium">
                    Currently revising version <strong>{revisingJD.versionNo}</strong> for{" "}
                    <strong>{revisingJD.department}</strong> ({revisingJD.account}).
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#042C51] mb-1 uppercase tracking-wider">
                      Revision Remarks / Requested Changes <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      rows={3}
                      required
                      placeholder="Describe what needs to be updated (e.g. Added mandatory weekend shift supervision and B2+ English benchmark)..."
                      value={revisionRemarks}
                      onChange={(e) => setRevisionRemarks(e.target.value)}
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:border-[#042C51] outline-hidden resize-none transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#042C51] mb-1 uppercase tracking-wider">
                      Updated Competencies (Comma Separated)
                    </label>
                    <input
                      type="text"
                      value={updatedCompetenciesText}
                      onChange={(e) => setUpdatedCompetenciesText(e.target.value)}
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:border-[#042C51] outline-hidden transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#042C51] mb-1 uppercase tracking-wider">
                      Updated Core Responsibilities (One Per Line)
                    </label>
                    <textarea
                      rows={4}
                      value={updatedResponsibilitiesText}
                      onChange={(e) => setUpdatedResponsibilitiesText(e.target.value)}
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:border-[#042C51] outline-hidden resize-none transition-all"
                    />
                  </div>
                </div>

                <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => setRevisingJD(null)}
                    className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-[#FF5C28] hover:bg-[#e04f20] text-white rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 shadow-xs"
                  >
                    <Send className="w-3.5 h-3.5" />
                    Submit Revision Request
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ==================== 8. MODAL 4: ARCHIVE CONFIRMATION MODAL ==================== */}
      <AnimatePresence>
        {archiveTargetJD && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#042C51]/80 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-[#E6ECF2] my-8 overflow-hidden text-[#101828]"
            >
              <div className="bg-slate-900 text-white p-4 sm:p-5 flex items-center justify-between border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/30 text-amber-400 flex items-center justify-center shrink-0">
                    <Archive className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-black text-white tracking-tight">
                      Archive Job Description
                    </h3>
                    <p className="text-[11px] text-slate-300 font-medium">
                      Move {archiveTargetJD.roleTitle} ({archiveTargetJD.id}) to repository
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setArchiveTargetJD(null)}
                  className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-all cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-[#042C51]">{archiveTargetJD.roleTitle}</span>
                    <span className="text-[10px] font-mono text-slate-400">{archiveTargetJD.versionNo}</span>
                  </div>
                  <div className="text-[11px] text-slate-500">
                    {archiveTargetJD.documentTitle} • {archiveTargetJD.department} ({archiveTargetJD.account})
                  </div>
                </div>

                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 leading-relaxed">
                  <strong>Notice:</strong> Archiving will remove this JD from the active list and intake filters. You can restore it at any time from the <strong>Archived</strong> tab.
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#042C51] mb-1.5 uppercase tracking-wider">
                    Archive Reason / Deprecation Category
                  </label>
                  <select
                    value={archiveReason}
                    onChange={(e) => setArchiveReason(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:border-[#042C51] outline-hidden transition-all"
                  >
                    <option value="Position deprecated / no longer in active hiring">
                      Position deprecated / no longer in active hiring
                    </option>
                    <option value="Replaced by updated JD specification">
                      Replaced by updated JD specification
                    </option>
                    <option value="Client account phased out or closed">
                      Client account phased out or closed
                    </option>
                    <option value="Duplicate or test intake entry">
                      Duplicate or test intake entry
                    </option>
                    <option value="Other / Custom Reason">Other / Custom Reason</option>
                  </select>
                </div>

                {archiveReason === "Other / Custom Reason" && (
                  <div>
                    <label className="block text-xs font-bold text-[#042C51] mb-1 uppercase tracking-wider">
                      Specify Custom Reason
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Consolidated into Operations Lead v3.0..."
                      value={customArchiveReason}
                      onChange={(e) => setCustomArchiveReason(e.target.value)}
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:border-[#042C51] outline-hidden transition-all"
                    />
                  </div>
                )}
              </div>

              <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2.5 shrink-0">
                <button
                  type="button"
                  onClick={() => setArchiveTargetJD(null)}
                  className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleArchiveConfirm}
                  className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 shadow-xs"
                >
                  <Archive className="w-3.5 h-3.5 text-amber-400" />
                  Confirm Archive
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ==================== 9. MODAL 5: RESTORE CONFIRMATION MODAL ==================== */}
      <AnimatePresence>
        {restoreTargetJD && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#042C51]/80 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-[#E6ECF2] my-8 overflow-hidden text-[#101828]"
            >
              <div className="bg-emerald-900 text-white p-4 sm:p-5 flex items-center justify-between border-b border-emerald-800">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 flex items-center justify-center shrink-0">
                    <RotateCcw className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-black text-white tracking-tight">
                      Restore Job Description
                    </h3>
                    <p className="text-[11px] text-emerald-200 font-medium">
                      Reactivate {restoreTargetJD.roleTitle} to active database
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setRestoreTargetJD(null)}
                  className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-emerald-200 hover:text-white transition-all cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-[#042C51]">{restoreTargetJD.roleTitle}</span>
                    <span className="text-[10px] font-mono text-slate-400">{restoreTargetJD.versionNo}</span>
                  </div>
                  <div className="text-[11px] text-slate-500">
                    {restoreTargetJD.documentTitle} • {restoreTargetJD.department} ({restoreTargetJD.account})
                  </div>
                  {restoreTargetJD.archiveReason && (
                    <div className="text-[10px] text-slate-600 pt-1 border-t border-slate-200">
                      <span className="font-bold text-slate-700">Archived reason:</span> {restoreTargetJD.archiveReason}
                    </div>
                  )}
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">
                  Are you sure you want to restore this Job Description? It will immediately reappear in the active JDs list and be available for intake workflows.
                </p>
              </div>

              <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2.5 shrink-0">
                <button
                  type="button"
                  onClick={() => setRestoreTargetJD(null)}
                  className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleRestoreConfirm()}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 shadow-xs"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Confirm Restore
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ==================== STRICT DELETE CONFIRMATION MODAL WITH LINKED POSITIONS ==================== */}
      <DeleteJobDescriptionModal
        isOpen={!!deleteTargetJD}
        jd={deleteTargetJD}
        onClose={() => setDeleteTargetJD(null)}
        onConfirmDelete={(jdToDelete) => handleDeleteConfirm(jdToDelete)}
        onArchiveInstead={(jdToArchive) => {
          setDeleteTargetJD(null);
          setArchiveTargetJD(jdToArchive);
        }}
      />

      {/* ==================== 10. MODAL 6: STATUS MODAL (GLOBAL FEEDBACK OVERLAY) ==================== */}
      <AnimatePresence>
        {statusModal.isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#042C51]/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-[#E6ECF2] text-center space-y-4"
            >
              <div
                className={`w-12 h-12 rounded-2xl mx-auto flex items-center justify-center ${
                  statusModal.type === "success"
                    ? "bg-emerald-100 text-emerald-700"
                    : statusModal.type === "error"
                    ? "bg-red-100 text-red-700"
                    : "bg-blue-100 text-blue-700"
                }`}
              >
                {statusModal.type === "success" && <CheckCircle2 className="w-6 h-6" />}
                {statusModal.type === "error" && <AlertCircle className="w-6 h-6" />}
                {statusModal.type === "info" && <Sparkles className="w-6 h-6" />}
              </div>

              <div>
                <h3 className="text-base font-black text-[#042C51]">{statusModal.title}</h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">{statusModal.message}</p>
              </div>

              <button
                type="button"
                onClick={() => setStatusModal({ ...statusModal, isOpen: false })}
                className="w-full py-2.5 bg-[#042C51] hover:bg-[#FF5C28] text-white rounded-xl text-xs font-black cursor-pointer transition-all shadow-xs"
              >
                Acknowledge & Close
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ==================== EDIT SPEC MODAL (AUXILIARY) ==================== */}
      <AnimatePresence>
        {editingJD && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#042C51]/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 10 }}
              className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-[#E6ECF2] overflow-hidden text-[#101828]"
            >
              <div className="bg-[#042C51] text-white p-4 sm:p-5 flex items-center justify-between border-b border-[#063866]">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-white/10 border border-white/20 text-[#FF5C28] flex items-center justify-center shrink-0">
                    <Edit3 className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-black text-white tracking-tight">Edit Job Description Details</h3>
                    <p className="text-[11px] text-slate-300 font-medium">Update status, supervisory level, and target personality</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setEditingJD(null)}
                  className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-all cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-[#042C51] mb-1 uppercase tracking-wider">Status</label>
                  <select
                    value={editingJD.status}
                    onChange={(e) => setEditingJD({ ...editingJD, status: e.target.value as JDStatus })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:border-[#042C51] outline-hidden transition-all"
                  >
                    <option value="Existing">Existing</option>
                    <option value="For Revision">For Revision</option>
                    <option value="New Job Description">New Job Description</option>
                    <option value="For Approval">For Approval</option>
                    <option value="Approved">Approved</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#042C51] mb-1 uppercase tracking-wider">Supervisory Level</label>
                  <select
                    value={editingJD.supervisoryLevel}
                    onChange={(e) => setEditingJD({ ...editingJD, supervisoryLevel: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:border-[#042C51] outline-hidden transition-all"
                  >
                    <option value="Individual Contributor">Individual Contributor</option>
                    <option value="Team Lead">Team Lead</option>
                    <option value="Manager">Manager</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#042C51] mb-1 uppercase tracking-wider">Target Personality</label>
                  <input
                    type="text"
                    value={editingJD.targetPersonality}
                    onChange={(e) => setEditingJD({ ...editingJD, targetPersonality: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:border-[#042C51] outline-hidden transition-all"
                  />
                </div>
              </div>

              <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2.5 shrink-0">
                <button
                  type="button"
                  onClick={() => setEditingJD(null)}
                  className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setJobDescriptions((prev) =>
                      prev.map((j) => (j.id === editingJD.id ? editingJD : j))
                    );
                    setEditingJD(null);
                    triggerStatusModal(
                      "success",
                      "Job Description Updated",
                      `Updated settings and status for "${editingJD.roleTitle}".`
                    );
                  }}
                  className="px-5 py-2 bg-[#042C51] hover:bg-[#FF5C28] text-white rounded-xl text-xs font-black transition-all cursor-pointer shadow-xs"
                >
                  Save Changes
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
