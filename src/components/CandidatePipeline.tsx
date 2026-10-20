import React, { useState, useMemo, useEffect } from "react";
import {
  loadFromLocalStorage,
  saveToLocalStorage,
  STORAGE_KEYS,
  broadcastDataChange
} from "../data/recruitmentStore";
import {
  Users,
  Search,
  Filter,
  RefreshCw,
  Plus,
  ChevronDown,
  ChevronUp,
  X,
  User,
  Mail,
  Phone,
  Briefcase,
  MapPin,
  Clock,
  ArrowRight,
  Database,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  Award,
  FileText,
  Building,
  Calendar as CalendarIcon,
  Sparkles,
  Check,
  Send,
  Calendar,
  Layers,
  LayoutGrid,
  List,
  UserCheck,
  ClipboardCheck,
  ShieldCheck,
  BriefcaseBusiness,
  UserX,
  FileCheck,
  Link as LinkIcon,
  Video,
  CheckCircle2,
  XCircle,
  HelpCircle,
  ExternalLink,
  MessageSquare,
  Upload,
  CheckSquare,
  DollarSign,
  GraduationCap,
  Paperclip,
  TrendingUp,
  Eye,
  Edit3,
  Trash2,
  Download,
  Percent,
  AlertCircle,
  Lock,
  PlayCircle,
  Save,
  CalendarDays,
  GripVertical,
  MoveRight,
  Info,
  History
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import {
  CandidatePipelineModalShell,
  CandidateModalSummary,
  CandidateModalSection,
  CandidateModalPrimaryButton,
  CandidateModalSecondaryButton,
  MovementHistorySidebar,
} from "./CandidatePipelineModalPrimitives";

// ==================== TYPES & INTERFACES ====================

export type PipelineStageName =
  | "Initial Screening"
  | "Online Assessment"
  | "Assessment Fit"
  | "Interview Scheduled"
  | "Interviewed"
  | "Offered"
  | "Accepted"
  | "For NHO"
  | "For Onboarding - Incomplete Requirements"
  | "Onboarding"
  | "Hired / Active"
  | "Drop-off";

export interface TimelineEntry {
  id: string;
  stage: string;
  date: string;
  updatedBy: string;
  reason: string;
  remarks?: string;
}

export interface OfferDetails {
  basicPay: number;
  deminimisDailyRate: number;
  startDate: string;
  roleTitle: string;
  account: string;
  hiringRequirementId: string;
  approvalStatus: "For Review" | "Approved" | "Rejected";
  decision?: "Pending" | "Accepted" | "Negotiate" | "Rejected";
  revisionRemarks?: string;
}

export interface NhoFile {
  id: string;
  name: string;
  category: "TOR / Diploma" | "NBI Clearance" | "Medical Check" | "BIR 2316" | "SSS / PhilHealth / Pag-IBIG" | "Birth Certificate" | "Valid ID";
  status: "Submitted" | "Pending" | "Verified";
  uploadDate?: string;
  isMajorRequirement?: boolean;
}

export interface PipelineCandidate {
  id: string; // PR-2026-xxx
  candidateId: string; // CAN-880x
  candidateApplicationId: string;
  name: string;
  email: string;
  contactNumber: string;
  source: "Walk-in" | "Pipeline" | "JobStreet" | "Employee Referral" | "LinkedIn" | "Career Fair" | "Talent Pool";
  department: string;
  account: string;
  roleTitle: string;
  currentStage: PipelineStageName;
  prfStatus: "Review" | "Matched" | "Not Matched";
  assessmentStatus: "Not Taken" | "Taken";
  assessmentResult?: "Assessment Fit" | "Assessment Not Fit" | "For Reassessment";
  assessmentScore?: number;
  assessmentRemarks?: string;
  interviewDate?: string; // YYYY-MM-DD HH:mm
  interviewType?: "Online" | "Face-to-face";
  interviewStatus?: "For Scheduling" | "Interview Scheduled" | "In Progress" | "Completed" | "Cancelled" | "For Assessment";
  onlineInterviewLink?: string;
  interviewerNotes?: string;
  dropOffReason?: string;
  dropOffCategory?: string;
  dropOffRemarks?: string;
  dropOffEmailStatus?: "Sent" | "Failed" | "Not Sent";
  dropOffRecipient?: string;
  dropOffDate?: string;
  offerDetails?: OfferDetails;
  nhoFiles?: NhoFile[];
  nhoScheduleDate?: string;
  timeline: TimelineEntry[];
  createdAt: string;
  education?: string;
  experienceYears?: string;
  expectedSalary?: number;
  currentLocation?: string;
}

interface CandidatePipelineProps {
  userEmail?: string;
  onSwitchModule?: (moduleKey: string) => void;
}

// ==================== INITIAL MOCK DATA ====================

const INITIAL_CANDIDATES: PipelineCandidate[] = [
  {
    id: "TP-20260810074722-MUFRII",
    candidateId: "TP-20260810074722-MUFRII",
    candidateApplicationId: "APP-4010",
    name: "RASDASD VINCENTASDASD DULLAASDASD",
    email: "ralphvincent.dulla@thesiblingssolution.com",
    contactNumber: "+63 917 112 3344",
    source: "Talent Pool",
    department: "Telecom & Tech Support",
    account: "Not assigned yet",
    roleTitle: "USV",
    currentStage: "Initial Screening",
    prfStatus: "Matched",
    assessmentStatus: "Not Taken",
    interviewStatus: "For Assessment",
    timeline: [
      {
        id: "t0",
        stage: "Initial Screening",
        date: "2026-08-10 07:47",
        updatedBy: "TA Recruiter",
        reason: "Candidate moved from Talent Pool."
      }
    ],
    createdAt: "2026-08-10"
  },
  {
    id: "PR-2026-101",
    candidateId: "CAN-9021",
    candidateApplicationId: "APP-4011",
    name: "Samantha Nicole Vance",
    email: "samantha.vance@gmail.com",
    contactNumber: "+63 917 882 1049",
    source: "Pipeline",
    department: "Telecom & Tech Support",
    account: "Verizon Tech",
    roleTitle: "Customer Service Representative",
    currentStage: "Initial Screening",
    prfStatus: "Matched",
    assessmentStatus: "Not Taken",
    education: "BS Information Technology - UST",
    experienceYears: "3 Years Call Center Experience",
    expectedSalary: 25000,
    currentLocation: "Quezon City, Metro Manila",
    timeline: [
      {
        id: "t1",
        stage: "Initial Screening",
        date: "2026-08-01 09:30",
        updatedBy: "TA Recruiter",
        reason: "Promoted from Talent Pool. PRF matched with Verizon Tech headcount."
      }
    ],
    createdAt: "2026-08-01"
  },
  {
    id: "PR-2026-102",
    candidateId: "CAN-9022",
    candidateApplicationId: "APP-4012",
    name: "Marco Antonio Reyes",
    email: "marco.reyes@yahoo.com",
    contactNumber: "+63 928 331 4092",
    source: "Walk-in",
    department: "Telecom & Tech Support",
    account: "Comcast Technical",
    roleTitle: "Technical Support Specialist",
    currentStage: "Online Assessment",
    prfStatus: "Matched",
    assessmentStatus: "Not Taken",
    education: "BS Computer Science - FEU",
    experienceYears: "2.5 Years Technical Helpdesk",
    expectedSalary: 28000,
    currentLocation: "Pasig City, Metro Manila",
    timeline: [
      {
        id: "t2",
        stage: "Online Assessment",
        date: "2026-08-02 11:15",
        updatedBy: "System Auto",
        reason: "Assessment link dispatched via automated email pipeline."
      }
    ],
    createdAt: "2026-08-02"
  },
  {
    id: "PR-2026-103",
    candidateId: "CAN-9023",
    candidateApplicationId: "APP-4013",
    name: "Aria Danielle Santos",
    email: "aria.santos@outlook.com",
    contactNumber: "+63 919 443 1290",
    source: "Employee Referral",
    department: "Healthcare & Insurance",
    account: "UnitedHealth VIP",
    roleTitle: "Medical Claims Representative",
    currentStage: "Assessment Fit",
    prfStatus: "Matched",
    assessmentStatus: "Taken",
    assessmentResult: "Assessment Fit",
    assessmentScore: 92,
    assessmentRemarks: "Strong medical comprehension and coding accuracy score.",
    education: "BS Nursing - DLSHSI",
    experienceYears: "4 Years Healthcare BPO",
    expectedSalary: 32000,
    currentLocation: "Mandaluyong City",
    timeline: [
      {
        id: "t3",
        stage: "Assessment Fit",
        date: "2026-08-03 14:20",
        updatedBy: "Assessment Engine",
        reason: "Score 92/100. Candidate passed medical comprehension assessment."
      }
    ],
    createdAt: "2026-08-03"
  },
  {
    id: "PR-2026-104",
    candidateId: "CAN-9024",
    candidateApplicationId: "APP-4014",
    name: "Julian Gabriel Cruz",
    email: "julian.cruz@gmail.com",
    contactNumber: "+63 908 122 8901",
    source: "JobStreet",
    department: "Financial Services Group",
    account: "Chase Credit",
    roleTitle: "Fraud Escalation Associate",
    currentStage: "Interview Scheduled",
    prfStatus: "Matched",
    assessmentStatus: "Taken",
    assessmentResult: "Assessment Fit",
    assessmentScore: 88,
    interviewDate: "2026-08-11 10:00",
    interviewType: "Online",
    interviewStatus: "Interview Scheduled",
    onlineInterviewLink: "https://meet.google.com/sibs-tech-int",
    interviewerNotes: "Focus on risk assessment scenarios and call handling empathy.",
    education: "BS Business Administration - DLSU",
    experienceYears: "3.5 Years Banking & Financial BPO",
    expectedSalary: 30000,
    currentLocation: "Makati City",
    timeline: [
      {
        id: "t4",
        stage: "Interview Scheduled",
        date: "2026-08-04 16:45",
        updatedBy: "TA Specialist",
        reason: "Final interview booked with Financial Services Operations Lead."
      }
    ],
    createdAt: "2026-08-04"
  },
  {
    id: "PR-2026-105",
    candidateId: "CAN-9025",
    candidateApplicationId: "APP-4015",
    name: "Clarissa Mae Mendoza",
    email: "clarissa.mendoza@gmail.com",
    contactNumber: "+63 917 554 9012",
    source: "LinkedIn",
    department: "Telecom & Tech Support",
    account: "T-Mobile Care",
    roleTitle: "Senior Tech Support Agent",
    currentStage: "Interviewed",
    prfStatus: "Matched",
    assessmentStatus: "Taken",
    assessmentResult: "Assessment Fit",
    assessmentScore: 95,
    interviewDate: "2026-08-06 14:00",
    interviewType: "Face-to-face",
    interviewStatus: "Completed",
    interviewerNotes: "Excellent communication, deep technical knowledge. Highly recommended for immediate offer.",
    education: "BS Electronics Engineering - Mapua",
    experienceYears: "5 Years Tech Support Lead",
    expectedSalary: 38000,
    currentLocation: "Taguig City (BGC)",
    timeline: [
      {
        id: "t5",
        stage: "Interviewed",
        date: "2026-08-06 15:30",
        updatedBy: "OM Interviewer",
        reason: "Interview complete. Recommended for immediate job offer."
      }
    ],
    createdAt: "2026-08-05"
  },
  {
    id: "PR-2026-106",
    candidateId: "CAN-9026",
    candidateApplicationId: "APP-4016",
    name: "Ethan Joshua Garcia",
    email: "ethan.garcia@icloud.com",
    contactNumber: "+63 927 667 1123",
    source: "Career Fair",
    department: "Retail & E-Commerce",
    account: "Amazon Care",
    roleTitle: "Customer Care Specialist",
    currentStage: "Offered",
    prfStatus: "Matched",
    assessmentStatus: "Taken",
    assessmentResult: "Assessment Fit",
    offerDetails: {
      basicPay: 24500,
      deminimisDailyRate: 150,
      startDate: "2026-08-25",
      roleTitle: "Customer Care Specialist",
      account: "Amazon Care",
      hiringRequirementId: "REQ-2026-088",
      approvalStatus: "Approved",
      decision: "Pending"
    },
    timeline: [
      {
        id: "t6",
        stage: "Offered",
        date: "2026-08-07 10:00",
        updatedBy: "HR Manager",
        reason: "Employment offer generated and emailed to candidate."
      }
    ],
    createdAt: "2026-08-06"
  },
  {
    id: "PR-2026-107",
    candidateId: "CAN-9027",
    candidateApplicationId: "APP-4017",
    name: "Beatriz Elena Villanueva",
    email: "beatriz.villanueva@gmail.com",
    contactNumber: "+63 918 991 2234",
    source: "Pipeline",
    department: "Telecom & Tech Support",
    account: "Verizon Tech",
    roleTitle: "Customer Service Representative",
    currentStage: "Accepted",
    prfStatus: "Matched",
    assessmentStatus: "Taken",
    assessmentResult: "Assessment Fit",
    offerDetails: {
      basicPay: 22000,
      deminimisDailyRate: 120,
      startDate: "2026-08-18",
      roleTitle: "Customer Service Representative",
      account: "Verizon Tech",
      hiringRequirementId: "REQ-2026-082",
      approvalStatus: "Approved",
      decision: "Accepted"
    },
    timeline: [
      {
        id: "t7",
        stage: "Accepted",
        date: "2026-08-08 11:30",
        updatedBy: "Candidate Action",
        reason: "Candidate electronically signed employment offer letter."
      }
    ],
    createdAt: "2026-08-07"
  },
  {
    id: "PR-2026-108",
    candidateId: "CAN-9028",
    candidateApplicationId: "APP-4018",
    name: "Kenneth Patrick Aquino",
    email: "kenneth.aquino@gmail.com",
    contactNumber: "+63 920 441 5567",
    source: "Walk-in",
    department: "Healthcare & Insurance",
    account: "UnitedHealth VIP",
    roleTitle: "Medical Claims Representative",
    currentStage: "For NHO",
    prfStatus: "Matched",
    assessmentStatus: "Taken",
    assessmentResult: "Assessment Fit",
    nhoScheduleDate: "2026-08-18",
    nhoFiles: [
      { id: "f1", name: "TOR / Diploma", category: "TOR / Diploma", status: "Submitted", uploadDate: "2026-08-08", isMajorRequirement: true },
      { id: "f2", name: "NBI Clearance", category: "NBI Clearance", status: "Submitted", uploadDate: "2026-08-08", isMajorRequirement: true },
      { id: "f3", name: "Medical Check", category: "Medical Check", status: "Pending", isMajorRequirement: true },
      { id: "f4", name: "Birth Certificate", category: "Birth Certificate", status: "Submitted", uploadDate: "2026-08-08", isMajorRequirement: true },
      { id: "f5", name: "Valid Government ID", category: "Valid ID", status: "Submitted", uploadDate: "2026-08-08", isMajorRequirement: true },
      { id: "f6", name: "BIR 2316", category: "BIR 2316", status: "Submitted", uploadDate: "2026-08-08", isMajorRequirement: false },
      { id: "f7", name: "SSS / PhilHealth / Pag-IBIG", category: "SSS / PhilHealth / Pag-IBIG", status: "Submitted", uploadDate: "2026-08-08", isMajorRequirement: false }
    ],
    timeline: [
      {
        id: "t8",
        stage: "For NHO",
        date: "2026-08-08 14:00",
        updatedBy: "Onboarding Coordinator",
        reason: "Scheduled for New Hire Orientation batch on Aug 18."
      }
    ],
    createdAt: "2026-08-08"
  },
  {
    id: "PR-2026-109",
    candidateId: "CAN-9029",
    candidateApplicationId: "APP-4019",
    name: "Ramon Vincent Soriano",
    email: "ramon.soriano@gmail.com",
    contactNumber: "+63 915 771 3345",
    source: "JobStreet",
    department: "Financial Services Group",
    account: "Chase Credit",
    roleTitle: "Fraud Escalation Associate",
    currentStage: "Drop-off",
    prfStatus: "Matched",
    assessmentStatus: "Taken",
    dropOffReason: "Accepted Other Job Offer",
    dropOffCategory: "Competitor Offer",
    dropOffRemarks: "Candidate accepted a higher compensation offer at a neighboring financial hub.",
    dropOffEmailStatus: "Sent",
    dropOffRecipient: "ramon.soriano@gmail.com",
    dropOffDate: "2026-08-07 16:30",
    timeline: [
      {
        id: "t9",
        stage: "Drop-off",
        date: "2026-08-07 16:30",
        updatedBy: "TA Recruiter",
        reason: "Marked as Drop-off. Candidate withdrew application."
      }
    ],
    createdAt: "2026-08-06"
  }
];

// Pipeline Stages for Kanban Board
const BOARD_STAGES: PipelineStageName[] = [
  "Initial Screening",
  "Online Assessment",
  "Assessment Fit",
  "Interview Scheduled",
  "Interviewed",
  "Offered",
  "Accepted",
  "For NHO"
];

// Kanban Stage Color Branding & Accents
const STAGE_THEMES: Record<string, { dot: string; headerBg: string; text: string; badgeBg: string; border: string; topBar: string }> = {
  "Initial Screening": { dot: "bg-amber-500", headerBg: "bg-amber-50/90 border-amber-200/90", text: "text-amber-900", badgeBg: "bg-amber-500", border: "border-amber-300", topBar: "bg-amber-500" },
  "Online Assessment": { dot: "bg-indigo-500", headerBg: "bg-indigo-50/90 border-indigo-200/90", text: "text-indigo-900", badgeBg: "bg-indigo-500", border: "border-indigo-300", topBar: "bg-indigo-500" },
  "Assessment Fit": { dot: "bg-sky-500", headerBg: "bg-sky-50/90 border-sky-200/90", text: "text-sky-900", badgeBg: "bg-sky-500", border: "border-sky-300", topBar: "bg-sky-500" },
  "Interview Scheduled": { dot: "bg-blue-500", headerBg: "bg-blue-50/90 border-blue-200/90", text: "text-blue-900", badgeBg: "bg-blue-500", border: "border-blue-300", topBar: "bg-blue-500" },
  "Interviewed": { dot: "bg-teal-500", headerBg: "bg-teal-50/90 border-teal-200/90", text: "text-teal-900", badgeBg: "bg-teal-500", border: "border-teal-300", topBar: "bg-teal-500" },
  "Offered": { dot: "bg-orange-500", headerBg: "bg-orange-50/90 border-orange-200/90", text: "text-orange-900", badgeBg: "bg-orange-500", border: "border-orange-300", topBar: "bg-orange-500" },
  "Accepted": { dot: "bg-emerald-500", headerBg: "bg-emerald-50/90 border-emerald-200/90", text: "text-emerald-900", badgeBg: "bg-emerald-500", border: "border-emerald-300", topBar: "bg-emerald-500" },
  "For NHO": { dot: "bg-cyan-500", headerBg: "bg-cyan-50/90 border-cyan-200/90", text: "text-cyan-900", badgeBg: "bg-cyan-500", border: "border-cyan-300", topBar: "bg-cyan-500" }
};

export default function CandidatePipeline({ userEmail = "dulla13ralph@gmail.com", onSwitchModule }: CandidatePipelineProps) {
  // State with LocalStorage backing
  const [candidates, setCandidates] = useState<PipelineCandidate[]>(() =>
    loadFromLocalStorage(STORAGE_KEYS.PIPELINE_CANDIDATES, INITIAL_CANDIDATES)
  );
  const [pageView, setPageView] = useState<"pipeline" | "calendar">("pipeline");
  const [boardSubView, setBoardSubView] = useState<"board" | "list">("board");

  // Sync to LocalStorage whenever candidates change
  useEffect(() => {
    saveToLocalStorage(STORAGE_KEYS.PIPELINE_CANDIDATES, candidates);
    broadcastDataChange("pipeline");
  }, [candidates]);

  // Listen for external storage updates (e.g. from Public Portal or Talent Pool promotions)
  useEffect(() => {
    const handleStoreUpdate = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail?.channel === "pipeline" || customEvent.detail?.channel === "all") {
        setCandidates(prev => {
          const fresh = loadFromLocalStorage(STORAGE_KEYS.PIPELINE_CANDIDATES, INITIAL_CANDIDATES);
          return JSON.stringify(prev) === JSON.stringify(fresh) ? prev : fresh;
        });
      }
    };
    window.addEventListener("sibs_store_update", handleStoreUpdate);
    return () => window.removeEventListener("sibs_store_update", handleStoreUpdate);
  }, []);

  // Drag and Drop state
  const [draggingCandidateId, setDraggingCandidateId] = useState<string | null>(null);
  const [dragOverStage, setDragOverStage] = useState<string | null>(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("All Departments");
  const [selectedAccount, setSelectedAccount] = useState("All Accounts");
  const [selectedPrfStatus, setSelectedPrfStatus] = useState("All PRF Status");
  const [selectedSource, setSelectedSource] = useState("All Sources");

  // Modals state
  const [selectedCandidate, setSelectedCandidate] = useState<PipelineCandidate | null>(null);
  const [tempPrfStatus, setTempPrfStatus] = useState<"Review" | "Matched" | "Not Matched">("Review");
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isHistorySidebarOpen, setIsHistorySidebarOpen] = useState(false);
  const [activeDetailTab, setActiveDetailTab] = useState<"overview" | "talent_pool" | "assessment" | "interview" | "offer" | "nho" | "timeline">("overview");
  const [showTalentDetails, setShowTalentDetails] = useState(false);

  // Action Modals
  const [moveModalCandidate, setMoveModalCandidate] = useState<PipelineCandidate | null>(null);
  const [confirmActionModal, setConfirmActionModal] = useState<{ candidate: PipelineCandidate; targetStage: PipelineStageName } | null>(null);
  const [assessmentModalCandidate, setAssessmentModalCandidate] = useState<PipelineCandidate | null>(null);
  const [cancelInterviewModalCandidate, setCancelInterviewModalCandidate] = useState<PipelineCandidate | null>(null);

  const handleOpenConfirmModal = (candidate: PipelineCandidate) => {
    const currentIndex = BOARD_STAGES.indexOf(candidate.currentStage);
    let targetStage: PipelineStageName = candidate.currentStage;
    if (currentIndex >= 0 && currentIndex < BOARD_STAGES.length - 1) {
      targetStage = BOARD_STAGES[currentIndex + 1];
    }
    setConfirmActionModal({ candidate, targetStage });
  };
  const [scheduleModalCandidate, setScheduleModalCandidate] = useState<PipelineCandidate | null>(null);
  const [offerModalCandidate, setOfferModalCandidate] = useState<PipelineCandidate | null>(null);
  const [revisedOfferCandidate, setRevisedOfferCandidate] = useState<PipelineCandidate | null>(null);
  const [dropOffModalCandidate, setDropOffModalCandidate] = useState<PipelineCandidate | null>(null);
  const [nhoModalCandidate, setNhoModalCandidate] = useState<PipelineCandidate | null>(null);

  // Toast / Banner
  const [bannerMessage, setBannerMessage] = useState<string | null>(null);

  const showBanner = (msg: string) => {
    setBannerMessage(msg);
    setTimeout(() => setBannerMessage(null), 4000);
  };

  // Filtered Candidates
  const filteredCandidates = useMemo(() => {
    return candidates.filter((c) => {
      const matchesSearch =
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.candidateId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.id.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesDepartment =
        selectedDepartment === "All Departments" || c.department === selectedDepartment;
      const matchesAccount =
        selectedAccount === "All Accounts" || c.account === selectedAccount;
      const matchesPrf =
        selectedPrfStatus === "All PRF Status" || c.prfStatus === selectedPrfStatus;
      const matchesSource =
        selectedSource === "All Sources" || c.source === selectedSource;

      return matchesSearch && matchesDepartment && matchesAccount && matchesPrf && matchesSource;
    });
  }, [candidates, searchTerm, selectedDepartment, selectedAccount, selectedPrfStatus, selectedSource]);

  // Stage Visible Candidates (for Board & Metrics)
  const stageVisibleCandidates = useMemo(() => {
    return filteredCandidates.filter((c) => {
      if (c.currentStage === "Online Assessment") {
        return c.prfStatus === "Matched";
      }
      if (c.currentStage === "Interview Scheduled") {
        return (
          c.assessmentStatus === "Taken" &&
          c.assessmentResult === "Assessment Fit" &&
          !!c.interviewDate &&
          c.interviewStatus !== "Completed"
        );
      }
      return true;
    });
  }, [filteredCandidates]);

  // Derived 6 Summary Metrics Cards
  const metrics = useMemo(() => {
    const getCount = (stage: PipelineStageName, customFilter?: (c: PipelineCandidate) => boolean) => {
      return stageVisibleCandidates.filter((c) => {
        if (c.currentStage !== stage) return false;
        return customFilter ? customFilter(c) : true;
      }).length;
    };

    return {
      initialScreening: getCount("Initial Screening"),
      onlineAssessment: getCount("Online Assessment", (c) => c.prfStatus === "Matched"),
      interviewScheduled: getCount("Interview Scheduled", (c) => c.assessmentStatus === "Taken" && c.assessmentResult === "Assessment Fit" && !!c.interviewDate && c.interviewStatus !== "Completed"),
      interviewed: getCount("Interviewed"),
      offered: getCount("Offered"),
      accepted: getCount("Accepted")
    };
  }, [stageVisibleCandidates]);

  // Handlers for Stage Progression
  const handleUpdatePrfStatus = (candidateId: string, status: "Review" | "Matched" | "Not Matched") => {
    setCandidates((prev) =>
      prev.map((c) => {
        if (c.id === candidateId) {
          const newTimeline: TimelineEntry = {
            id: `t-${Date.now()}`,
            stage: c.currentStage,
            date: new Date().toISOString().replace("T", " ").substring(0, 16),
            updatedBy: userEmail,
            reason: `PRF Status updated to ${status}.`
          };
          return { ...c, prfStatus: status, timeline: [newTimeline, ...c.timeline] };
        }
        return c;
      })
    );
    showBanner("PRF Status updated successfully.");
  };

  const handleMoveStage = (candidateId: string, targetStage: PipelineStageName, reasonText: string) => {
    setCandidates((prev) =>
      prev.map((c) => {
        if (c.id === candidateId) {
          const newTimeline: TimelineEntry = {
            id: `t-${Date.now()}`,
            stage: targetStage,
            date: new Date().toISOString().replace("T", " ").substring(0, 16),
            updatedBy: userEmail,
            reason: reasonText || `Moved stage from ${c.currentStage} to ${targetStage}.`
          };
          return { ...c, currentStage: targetStage, timeline: [newTimeline, ...c.timeline] };
        }
        return c;
      })
    );
    setMoveModalCandidate(null);
    showBanner(`Candidate successfully moved to ${targetStage}.`);
  };

  const handleSaveAssessment = (
    candidateId: string,
    result: "Assessment Fit" | "Assessment Not Fit" | "For Reassessment",
    score?: number,
    remarks?: string,
    statusVal?: string
  ) => {
    setCandidates((prev) =>
      prev.map((c) => {
        if (c.id === candidateId) {
          const nextStage: PipelineStageName =
            result === "Assessment Fit"
              ? "Assessment Fit"
              : result === "Assessment Not Fit"
              ? "Drop-off"
              : c.currentStage;
          const newTimeline: TimelineEntry = {
            id: `t-${Date.now()}`,
            stage: nextStage,
            date: new Date().toISOString().replace("T", " ").substring(0, 16),
            updatedBy: userEmail,
            reason: `Assessment updated. Status: ${statusVal || "Taken"}. Score: ${score || 0}/100. Result: ${result}.`
          };
          return {
            ...c,
            assessmentStatus: (statusVal as any) || "Taken",
            assessmentResult: result,
            assessmentScore: score,
            assessmentRemarks: remarks,
            currentStage: nextStage,
            timeline: [newTimeline, ...c.timeline]
          };
        }
        return c;
      })
    );
    setAssessmentModalCandidate(null);
    showBanner(`Assessment result saved successfully.`);
  };

  const handleScheduleInterview = (
    candidateId: string,
    interviewDate: string,
    type: "Online" | "Face-to-face",
    link: string,
    notes?: string
  ) => {
    setCandidates((prev) =>
      prev.map((c) => {
        if (c.id === candidateId) {
          const newTimeline: TimelineEntry = {
            id: `t-${Date.now()}`,
            stage: "Interview Scheduled",
            date: new Date().toISOString().replace("T", " ").substring(0, 16),
            updatedBy: userEmail,
            reason: `Interview scheduled for ${interviewDate} (${type}).`
          };
          return {
            ...c,
            currentStage: "Interview Scheduled",
            interviewDate,
            interviewType: type,
            onlineInterviewLink: link,
            interviewerNotes: notes,
            interviewStatus: "Interview Scheduled",
            timeline: [newTimeline, ...c.timeline]
          };
        }
        return c;
      })
    );
    setScheduleModalCandidate(null);
    showBanner("Interview schedule saved and candidate notified.");
  };

  const handleCancelInterview = (candidateId: string) => {
    setCandidates((prev) =>
      prev.map((c) => {
        if (c.id === candidateId) {
          const newTimeline: TimelineEntry = {
            id: `t-${Date.now()}`,
            stage: c.currentStage,
            date: new Date().toISOString().replace("T", " ").substring(0, 16),
            updatedBy: userEmail,
            reason: `Scheduled interview cancelled for candidate.`
          };
          return {
            ...c,
            interviewStatus: "Cancelled",
            interviewDate: undefined,
            timeline: [newTimeline, ...c.timeline]
          };
        }
        return c;
      })
    );
    setCancelInterviewModalCandidate(null);
    showBanner("Interview cancelled successfully.");
  };

  const handleSaveOffer = (candidateId: string, offer: OfferDetails) => {
    setCandidates((prev) =>
      prev.map((c) => {
        if (c.id === candidateId) {
          const newTimeline: TimelineEntry = {
            id: `t-${Date.now()}`,
            stage: "Offered",
            date: new Date().toISOString().replace("T", " ").substring(0, 16),
            updatedBy: userEmail,
            reason: `Employment Offer prepared for ₱${offer.basicPay.toLocaleString()}/mo (${offer.roleTitle}).`
          };
          return {
            ...c,
            currentStage: "Offered",
            offerDetails: offer,
            roleTitle: offer.roleTitle,
            account: offer.account,
            timeline: [newTimeline, ...c.timeline]
          };
        }
        return c;
      })
    );
    setOfferModalCandidate(null);
    showBanner("Employment Offer issued and logged.");
  };

  const handleSaveRevisedOffer = (candidateId: string, basicPay: number, deminimis: number, remarks: string) => {
    setCandidates((prev) =>
      prev.map((c) => {
        if (c.id === candidateId && c.offerDetails) {
          const updatedOffer: OfferDetails = {
            ...c.offerDetails,
            basicPay,
            deminimisDailyRate: deminimis,
            approvalStatus: "For Review",
            decision: "Pending",
            revisionRemarks: remarks
          };
          const newTimeline: TimelineEntry = {
            id: `t-${Date.now()}`,
            stage: "Offered",
            date: new Date().toISOString().replace("T", " ").substring(0, 16),
            updatedBy: userEmail,
            reason: `Offer package revised to ₱${basicPay.toLocaleString()}/mo. Sent for re-approval.`
          };
          return {
            ...c,
            offerDetails: updatedOffer,
            timeline: [newTimeline, ...c.timeline]
          };
        }
        return c;
      })
    );
    setRevisedOfferCandidate(null);
    showBanner("Revised offer package submitted for approval.");
  };

  const handleSaveDropOff = (candidateId: string, reason: string, category: string, remarks: string) => {
    setCandidates((prev) =>
      prev.map((c) => {
        if (c.id === candidateId) {
          const newTimeline: TimelineEntry = {
            id: `t-${Date.now()}`,
            stage: "Drop-off",
            date: new Date().toISOString().replace("T", " ").substring(0, 16),
            updatedBy: userEmail,
            reason: `Marked as Drop-off. Reason: ${reason} (${category}).`
          };
          return {
            ...c,
            currentStage: "Drop-off",
            dropOffReason: reason,
            dropOffCategory: category,
            dropOffRemarks: remarks,
            dropOffEmailStatus: "Sent",
            dropOffRecipient: c.email,
            dropOffDate: new Date().toISOString().replace("T", " ").substring(0, 16),
            timeline: [newTimeline, ...c.timeline]
          };
        }
        return c;
      })
    );
    setDropOffModalCandidate(null);
    showBanner("Candidate marked as drop-off. Notification email dispatched.");
  };

  const handleSaveNhoDetails = (candidateId: string, date: string, files: NhoFile[]) => {
    setCandidates((prev) =>
      prev.map((c) => {
        if (c.id === candidateId) {
          const submittedMajors = files.filter((f) => f.isMajorRequirement && f.status === "Submitted").length;
          const allMajorsSubmitted = submittedMajors >= 5;
          const targetStage: PipelineStageName = allMajorsSubmitted ? "Onboarding" : "For Onboarding - Incomplete Requirements";

          const newTimeline: TimelineEntry = {
            id: `t-${Date.now()}`,
            stage: targetStage,
            date: new Date().toISOString().replace("T", " ").substring(0, 16),
            updatedBy: userEmail,
            reason: `NHO pre-employment documents updated (${submittedMajors}/5 major requirements). Stage set to ${targetStage}.`
          };

          return {
            ...c,
            nhoScheduleDate: date,
            nhoFiles: files,
            currentStage: targetStage,
            timeline: [newTimeline, ...c.timeline]
          };
        }
        return c;
      })
    );
    setNhoModalCandidate(null);
    showBanner("NHO pre-employment details saved.");
  };

  const handleResendDropOffEmail = (candidateId: string) => {
    showBanner("Drop-off notification email resent successfully.");
  };

  return (
    <div className="space-y-4 sm:space-y-5 2xl:space-y-6 select-none font-jakarta text-[#101828] pb-8">
      {/* Dynamic Toast / Banner Notification */}
      <AnimatePresence>
        {bannerMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-3.5 bg-[#042C51] text-white rounded-2xl shadow-xl border border-blue-400/30 flex items-center justify-between gap-3 text-xs"
          >
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#FF5C28] shrink-0 animate-pulse" />
              <span className="font-semibold">{bannerMessage}</span>
            </div>
            <button
              onClick={() => setBannerMessage(null)}
              className="p-1 hover:bg-white/10 rounded-lg text-slate-300 hover:text-white transition-all cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
      {/* ==================== PAGE HEADER ==================== */}
      <section className="relative overflow-hidden rounded-2xl border border-[#DCE5EF] bg-white px-5 py-5 shadow-[0_8px_22px_rgba(4,44,81,0.05)] sm:px-6 2xl:px-7 2xl:py-6">
        <div className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-[#042C51] via-[#1A5A8A] to-[#FF5C28]" />

        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="min-w-0">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#042C51] px-2.5 py-1 text-[9px] font-extrabold uppercase tracking-wide text-white">
                <Sparkles className="h-3 w-3 text-[#FF5C28]" />
                Recruitment Lifecycle
              </span>
              <span className="inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 text-[9px] font-extrabold text-blue-700">
                Pipeline Operations
              </span>
            </div>

            <h1 className="text-xl font-black tracking-tight text-[#042C51] sm:text-2xl 2xl:text-[28px]">
              Candidate Pipeline
            </h1>
            <p className="mt-1 max-w-4xl text-xs font-medium leading-5 text-[#667085] 2xl:text-[13px]">
              Stage-by-stage applicant progress engine. Review PRFs, issue online assessments, schedule interviews, process offers, and track onboarding conversions.
            </p>
          </div>

          <div className="flex w-full flex-wrap items-center gap-2 xl:w-auto xl:justify-end">
            <button
              type="button"
              onClick={() => showBanner("Pipeline refreshed from operations database.")}
              className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[#D7E0EA] bg-white text-[#475467] transition hover:border-[#FF5C28]/40 hover:bg-[#FFF8F5] hover:text-[#FF5C28]"
              title="Refresh pipeline data"
              aria-label="Refresh pipeline data"
            >
              <RefreshCw className="h-4 w-4" />
            </button>

            {onSwitchModule && (
              <button
                type="button"
                onClick={() => onSwitchModule("Talent Pool")}
                className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg bg-[#FF5C28] px-4 text-xs font-extrabold text-white shadow-sm transition hover:bg-[#E95324]"
              >
                <Users className="h-4 w-4" />
                Sourced Talent Pool
              </button>
            )}
          </div>
        </div>
      </section>
      {/* ==================== METRICS SUMMARY (6 METRIC CARDS GRID) ==================== */}
      <section className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        {[
          {
            title: "Initial Screening",
            value: metrics.initialScreening,
            description: "PRF match review",
            Icon: UserCheck,
            labelClass: "text-[#042C51]",
            iconClass: "bg-[#EAF0F7] text-[#042C51]",
          },
          {
            title: "Online Assessment",
            value: metrics.onlineAssessment,
            description: "Matched candidates",
            Icon: ClipboardCheck,
            labelClass: "text-indigo-700",
            iconClass: "bg-indigo-50 text-indigo-700",
          },
          {
            title: "Interview Scheduled",
            value: metrics.interviewScheduled,
            description: "Booked sessions",
            Icon: CalendarIcon,
            labelClass: "text-blue-700",
            iconClass: "bg-blue-50 text-blue-700",
          },
          {
            title: "Interviewed",
            value: metrics.interviewed,
            description: "Evaluations complete",
            Icon: ShieldCheck,
            labelClass: "text-emerald-700",
            iconClass: "bg-emerald-50 text-emerald-700",
          },
          {
            title: "Offered",
            value: metrics.offered,
            description: "Offers processing",
            Icon: BriefcaseBusiness,
            labelClass: "text-amber-700",
            iconClass: "bg-amber-50 text-amber-700",
          },
          {
            title: "Accepted",
            value: metrics.accepted,
            description: "Ready for NHO",
            Icon: CheckSquare,
            labelClass: "text-[#FF5C28]",
            iconClass: "bg-[#FFF0EB] text-[#FF5C28]",
          },
        ].map(({ title, value, description, Icon, labelClass, iconClass }) => (
          <article
            key={title}
            className="flex h-[104px] min-h-[96px] flex-col justify-between overflow-hidden rounded-xl border border-[#DCE5EF] bg-white p-3 shadow-[0_6px_18px_rgba(4,44,81,0.04)] transition hover:-translate-y-0.5 hover:shadow-md 2xl:h-[116px] 2xl:min-h-[112px] 2xl:p-3.5"
          >
            <div className="flex h-full items-start justify-between gap-2.5">
              <div className="flex h-full min-w-0 flex-1 flex-col justify-between">
                <div>
                  <p className={`m-0 truncate text-[9.5px] font-extrabold uppercase tracking-wide ${labelClass}`}>
                    {title}
                  </p>
                  <p className={`mt-1.5 text-2xl font-bold leading-none tabular-nums tracking-tight 2xl:mt-2 2xl:text-3xl ${labelClass}`}>
                    {value}
                  </p>
                </div>
                <p className="mt-1 truncate text-[9.5px] font-semibold leading-tight text-[#667085]">
                  {description}
                </p>
              </div>

              <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full 2xl:h-9 2xl:w-9 ${iconClass}`}>
                <Icon className="h-4 w-4" strokeWidth={2} />
              </span>
            </div>
          </article>
        ))}
      </section>
      {/* ==================== CONTROL & FILTER BAR ==================== */}
      <section className="relative z-[40] overflow-visible rounded-2xl border border-[#DCE5EF] bg-white p-3 shadow-[0_8px_22px_rgba(4,44,81,0.04)] sm:p-4 2xl:p-5">
        <div className="flex flex-col justify-between gap-3 lg:flex-row lg:items-center">
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1 rounded-xl border border-[#D7DEE8] bg-[#F8FAFC] p-1">
              <button
                type="button"
                onClick={() => setPageView("pipeline")}
                className={`inline-flex h-8 items-center justify-center gap-1.5 rounded-lg px-3 text-[11px] font-extrabold transition ${
                  pageView === "pipeline"
                    ? "bg-[#FF5C28] text-white shadow-sm"
                    : "text-[#667085] hover:text-[#042C51]"
                }`}
              >
                <LayoutGrid className="h-3.5 w-3.5" />
                Pipeline View
              </button>

              <button
                type="button"
                onClick={() => setPageView("calendar")}
                className={`inline-flex h-8 items-center justify-center gap-1.5 rounded-lg px-3 text-[11px] font-extrabold transition ${
                  pageView === "calendar"
                    ? "bg-[#FF5C28] text-white shadow-sm"
                    : "text-[#667085] hover:text-[#042C51]"
                }`}
              >
                <Calendar className="h-3.5 w-3.5" />
                Calendar View
              </button>
            </div>

            {(searchTerm ||
              selectedDepartment !== "All Departments" ||
              selectedAccount !== "All Accounts" ||
              selectedPrfStatus !== "All PRF Status" ||
              selectedSource !== "All Sources") && (
              <button
                type="button"
                onClick={() => {
                  setSearchTerm("");
                  setSelectedDepartment("All Departments");
                  setSelectedAccount("All Accounts");
                  setSelectedPrfStatus("All PRF Status");
                  setSelectedSource("All Sources");
                }}
                className="inline-flex h-8 items-center justify-center gap-1.5 rounded-lg border border-[#FF5C28]/30 bg-[#FFF9F6] px-2.5 text-[11px] font-extrabold text-[#FF5C28] transition hover:bg-[#FF5C28] hover:text-white"
              >
                <RefreshCw className="h-3 w-3" />
                Reset Filters
              </button>
            )}
          </div>

          {pageView === "pipeline" && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[9.5px] font-extrabold uppercase tracking-wide text-[#042C51]">
                Sub-View:
              </span>
              <div className="flex items-center gap-1 rounded-xl border border-[#D7DEE8] bg-[#F8FAFC] p-1">
                <button
                  type="button"
                  onClick={() => setBoardSubView("board")}
                  className={`inline-flex h-8 items-center justify-center gap-1.5 rounded-lg px-3 text-[11px] font-extrabold transition ${
                    boardSubView === "board"
                      ? "bg-[#FF5C28] text-white shadow-sm"
                      : "text-[#667085] hover:text-[#042C51]"
                  }`}
                >
                  <LayoutGrid className="h-3.5 w-3.5" />
                  Kanban Board
                </button>
                <button
                  type="button"
                  onClick={() => setBoardSubView("list")}
                  className={`inline-flex h-8 items-center justify-center gap-1.5 rounded-lg px-3 text-[11px] font-extrabold transition ${
                    boardSubView === "list"
                      ? "bg-[#FF5C28] text-white shadow-sm"
                      : "text-[#667085] hover:text-[#042C51]"
                  }`}
                >
                  <List className="h-3.5 w-3.5" />
                  List View
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="mt-3 grid grid-cols-1 gap-2.5 border-t border-[#E6ECF2] pt-3 sm:grid-cols-2 lg:grid-cols-5">
          <div className="relative min-w-0">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#98A2B3]" />
            <input
              type="text"
              placeholder="Search candidate name, ID, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-10 w-full rounded-xl border border-[#D7DEE8] bg-[#F8FAFC] pl-9 pr-8 text-xs font-semibold text-[#042C51] outline-none transition placeholder:text-[#98A2B3] hover:border-[#042C51]/45 hover:bg-white focus:border-[#042C51] focus:bg-white focus:ring-4 focus:ring-[#042C51]/10"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-[#98A2B3] transition hover:bg-white hover:text-[#042C51]"
                aria-label="Clear search"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {[
            {
              value: selectedDepartment,
              setter: setSelectedDepartment,
              options: [
                "All Departments",
                "Telecom & Tech Support",
                "Healthcare & Insurance",
                "Financial Services Group",
                "Retail & E-Commerce",
              ],
            },
            {
              value: selectedAccount,
              setter: setSelectedAccount,
              options: [
                "All Accounts",
                "Verizon Tech",
                "Comcast Technical",
                "T-Mobile Care",
                "UnitedHealth VIP",
                "Chase Credit",
                "Amazon Care",
              ],
            },
            {
              value: selectedPrfStatus,
              setter: setSelectedPrfStatus,
              options: ["All PRF Status", "Review", "Matched", "Not Matched"],
            },
            {
              value: selectedSource,
              setter: setSelectedSource,
              options: [
                "All Sources",
                "Walk-in",
                "Pipeline",
                "JobStreet",
                "Employee Referral",
                "LinkedIn",
              ],
            },
          ].map((filter, index) => (
            <select
              key={index}
              value={filter.value}
              onChange={(e) => filter.setter(e.target.value)}
              className="h-10 w-full rounded-xl border border-[#D7DEE8] bg-[#F8FAFC] px-3 text-xs font-semibold text-[#042C51] outline-none transition hover:border-[#FF5C28]/40 hover:bg-white focus:border-[#FF5C28] focus:bg-white focus:ring-4 focus:ring-[#FF5C28]/10"
            >
              {filter.options.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          ))}
        </div>
      </section>


      {/* ==================== MAIN CONTENT (PIPELINE vs CALENDAR) ==================== */}
      {pageView === "calendar" ? (
        /* CALENDAR VIEW */
        <section className="overflow-hidden rounded-2xl border border-[#DCE5EF] bg-white shadow-[0_8px_22px_rgba(4,44,81,0.04)]">
          <div className="flex flex-col gap-4 border-b border-[#E6ECF2] bg-white px-4 py-4 sm:px-5 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[#FFEADF] bg-[#FFF2EB] text-[#FF5C28]">
                <Calendar className="h-4 w-4 text-[#FF5C28]" />
              </div>
              <div>
                <h2 className="text-sm font-extrabold text-[#042C51] 2xl:text-base">Scheduled Interview Calendar</h2>
                <p className="mt-0.5 text-xs font-semibold text-[#667085]">August 2026 Scheduled Assessments & Final Interviews</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 bg-sky-50 text-sky-700 text-[10px] font-bold rounded-full border border-sky-200">
                Online Interviews
              </span>
              <span className="px-2.5 py-1 bg-amber-50 text-amber-700 text-[10px] font-bold rounded-full border border-amber-200">
                Face-to-Face
              </span>
            </div>
          </div>

          <div className="p-4 sm:p-5 2xl:p-6">
          <div className="grid grid-cols-7 gap-2 border-b border-[#E6ECF2] pb-2 text-center text-[10px] font-extrabold uppercase text-[#98A2B3]">
            <div>MON</div>
            <div>TUE</div>
            <div>WED</div>
            <div>THU</div>
            <div>FRI</div>
            <div>SAT</div>
            <div>SUN</div>
          </div>

          <div className="grid grid-cols-7 gap-2">
            {Array.from({ length: 31 }, (_, i) => {
              const day = i + 1;
              const dateStr = `2026-08-${day < 10 ? "0" + day : day}`;
              const dayCandidates = filteredCandidates.filter((c) => c.interviewDate?.startsWith(dateStr));

              return (
                <div
                  key={day}
                  className={`min-h-[110px] p-2.5 rounded-xl border flex flex-col justify-between transition-all ${
                    dayCandidates.length > 0
                      ? "bg-slate-50/80 border-sky-200 shadow-xs"
                      : "bg-white border-slate-100"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-black ${dayCandidates.length > 0 ? "text-[#042C51]" : "text-slate-400"}`}>
                      {day}
                    </span>
                    {dayCandidates.length > 0 && (
                      <span className="text-[9px] font-black px-1.5 py-0.2 bg-[#FF5C28] text-white rounded-full">
                        {dayCandidates.length}
                      </span>
                    )}
                  </div>

                  <div className="space-y-1.5 mt-2 flex-1">
                    {dayCandidates.map((c) => (
                      <div
                        key={c.id}
                        onClick={() => {
                          setSelectedCandidate(c);
                          setIsDetailsModalOpen(true);
                        }}
                        className={`p-1.5 rounded-lg text-[10px] font-bold cursor-pointer transition-all border ${
                          c.interviewType === "Online"
                            ? "bg-sky-50 text-sky-800 border-sky-200 hover:bg-sky-100"
                            : "bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100"
                        }`}
                      >
                        <div className="truncate">{c.name}</div>
                        <div className="text-[8px] text-slate-500 flex items-center justify-between mt-0.5 font-mono">
                          <span>{c.interviewDate?.split(" ")[1] || "10:00"}</span>
                          <span>{c.interviewType}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
          </div>
        </section>
      ) : boardSubView === "list" ? (
        /* TABULAR LIST VIEW */
        <section className="overflow-hidden rounded-2xl border border-[#DCE5EF] bg-white shadow-[0_8px_22px_rgba(4,44,81,0.04)]">
          <div className="flex items-center justify-between border-b border-[#E6ECF2] bg-white px-4 py-4 sm:px-5">
            <h3 className="text-xs font-black uppercase tracking-wider text-[#042C51]">
              Candidate Pipeline Directory ({filteredCandidates.length})
            </h3>
            <span className="text-[11px] text-slate-500 font-medium">Sorted by stage flow</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F8FAFC] text-[10px] font-extrabold uppercase tracking-normal text-[#667085]">
                <tr>
                  <th className="px-4 py-3.5 text-left">Candidate</th>
                  <th className="px-4 py-3.5 text-left">Position / Account</th>
                  <th className="px-4 py-3.5 text-left">PRF Match</th>
                  <th className="px-4 py-3.5 text-left">Stage</th>
                  <th className="px-4 py-3.5 text-left">Interview Schedule</th>
                  <th className="px-4 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E6ECF2] bg-white font-medium">
                {filteredCandidates.map((c) => (
                  <tr key={c.id} className="transition-colors hover:bg-[#F8FAFC]">
                    <td className="p-3.5 pl-5">
                      <div className="font-bold text-[#042C51]">{c.name}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{c.email} | {c.candidateId}</div>
                    </td>
                    <td className="p-3.5">
                      <div className="font-bold text-slate-800">{c.roleTitle}</div>
                      <div className="text-[10px] text-slate-500">{c.account}</div>
                    </td>
                    <td className="p-3.5">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                          c.prfStatus === "Matched"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : "bg-slate-100 text-slate-600 border border-slate-200"
                        }`}
                      >
                        {c.prfStatus}
                      </span>
                    </td>
                    <td className="p-3.5">
                      <span className="font-black text-[#042C51] text-[11px] bg-blue-50 px-2 py-1 rounded-lg border border-blue-100">
                        {c.currentStage}
                      </span>
                    </td>
                    <td className="p-3.5">
                      {c.interviewDate ? (
                        <div className="text-[11px] font-bold text-sky-700 flex items-center gap-1 font-mono">
                          <CalendarIcon className="w-3 h-3 text-[#FF5C28]" />
                          <span>{c.interviewDate}</span>
                        </div>
                      ) : (
                        <span className="text-[10px] text-slate-400 font-italic">Not scheduled</span>
                      )}
                    </td>
                    <td className="p-3.5 pr-5 text-right">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedCandidate(c);
                          setIsDetailsModalOpen(true);
                        }}
                        className="px-3 py-1 bg-slate-100 hover:bg-[#042C51] hover:text-white text-slate-700 font-bold text-[11px] rounded-lg transition-all cursor-pointer border border-slate-200"
                      >
                        View Record
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : (
        <>
          /* KANBAN BOARD VIEW (8 COLUMNS) */
        <section className="space-y-4 sm:space-y-5">
          {/* Top Stage Flow Quick-Summary Strip */}
          <div className="rounded-2xl border border-[#DCE5EF] bg-white p-3.5 shadow-[0_8px_22px_rgba(4,44,81,0.04)]">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#FF5C28]" />
                <span className="text-xs font-black uppercase text-[#042C51] tracking-wider">
                  Pipeline Stage Overview & Quick Drag Control
                </span>
              </div>
              <div className="flex items-center gap-3 text-[10px] text-slate-500 font-medium">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" /> Active Flow
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" /> Requires Review
                </span>
                <span className="hidden sm:inline-block text-slate-400 border-l pl-3 border-slate-200">
                  Drag cards to shift candidates between stages
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-slate-200 text-xs">
              {BOARD_STAGES.map((st) => {
                const count = stageVisibleCandidates.filter((c) => c.currentStage === st).length;
                const theme = STAGE_THEMES[st] || { dot: "bg-slate-400", badgeBg: "bg-slate-700", text: "text-slate-700" };
                return (
                  <div
                    key={st}
                    title={`Stage: ${st} (${count} candidates)`}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 border border-slate-200/80 rounded-xl shrink-0 font-bold hover:bg-slate-100 transition-colors cursor-default"
                  >
                    <span className={`w-2 h-2 rounded-full ${theme.dot}`} />
                    <span className="text-slate-700 text-[11px]">{st}</span>
                    <span className={`px-1.5 py-0.2 text-[10px] font-mono text-white rounded-md ${theme.badgeBg}`}>
                      {count}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Kanban Stage Columns Grid Container */}
          <div className="flex min-h-[540px] gap-3 overflow-x-auto rounded-2xl bg-[#F8FAFC] p-2 pb-4 select-none sm:p-3 2xl:gap-4 sibs-scrollbar">
            {BOARD_STAGES.map((stageName) => {
              const columnCandidates = stageVisibleCandidates.filter((c) => c.currentStage === stageName);
              const theme = STAGE_THEMES[stageName] || {
                dot: "bg-slate-400",
                headerBg: "bg-slate-50 border-slate-200",
                text: "text-slate-800",
                badgeBg: "bg-[#042C51]",
                border: "border-slate-200",
                topBar: "bg-[#042C51]"
              };
              const isOver = dragOverStage === stageName;

              return (
                <div
                  key={stageName}
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.dataTransfer.dropEffect = "move";
                    if (dragOverStage !== stageName) setDragOverStage(stageName);
                  }}
                  onDragLeave={(e) => {
                    if (e.currentTarget.contains(e.relatedTarget as Node)) return;
                    setDragOverStage(null);
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    const cId = e.dataTransfer.getData("text/plain") || draggingCandidateId;
                    if (cId) {
                      handleMoveStage(cId, stageName, `Moved via Kanban drag-and-drop to ${stageName}.`);
                    }
                    setDraggingCandidateId(null);
                    setDragOverStage(null);
                  }}
                  className={`w-[275px] 2xl:w-[292px] shrink-0 p-1.5 rounded-2xl border flex flex-col justify-between h-[520px] 2xl:h-[720px] overflow-hidden transition-all relative ${
                    isOver
                      ? "bg-orange-50/70 border-2 border-dashed border-[#FF5C28] shadow-md scale-[1.01]"
                      : "bg-slate-100/80 border-slate-200/90 shadow-2xs"
                  }`}
                >
                  {/* Top Stage Header with Semantic Status Signal */}
                  <div
                    title={`Column Stage: ${stageName}. Indicator dot signals column activity.`}
                    className={`mx-0 mt-0 flex min-h-[38px] items-center justify-between gap-2 rounded-xl border px-2.5 shadow-[0_1px_2px_rgba(4,44,81,0.025)] ${theme.headerBg}`}
                  >
                    <div className="flex items-center gap-2">
                      <div className={`w-2.5 h-2.5 rounded-full ${theme.dot} ring-2 ring-white shadow-2xs`} />
                      <h3 className={`text-xs font-black tracking-tight uppercase ${theme.text}`}>
                        {stageName}
                      </h3>
                    </div>
                    <span className={`text-xs font-black text-white px-2.5 py-0.5 rounded-full font-mono ${theme.badgeBg} shadow-2xs`}>
                      {columnCandidates.length}
                    </span>
                  </div>

                  {/* Column Cards Drop Area */}
                  <div className="min-h-0 flex-1 space-y-2.5 overflow-y-auto p-1 pt-2.5 sibs-scrollbar">
                    {columnCandidates.length === 0 ? (
                      <div
                        className={`p-8 text-center text-[11px] font-semibold border-2 border-dashed rounded-xl my-2 transition-colors ${
                          isOver ? "border-[#FF5C28] bg-orange-100/50 text-[#FF5C28]" : "border-slate-200/80 text-slate-400 bg-white/60"
                        }`}
                      >
                        {isOver ? (
                          <div className="flex flex-col items-center gap-1 font-bold text-xs">
                            <MoveRight className="w-5 h-5 text-[#FF5C28] animate-bounce" />
                            <span>Drop candidate here</span>
                          </div>
                        ) : (
                          <span>No candidates in {stageName}</span>
                        )}
                      </div>
                    ) : (
                      columnCandidates.map((candidate) => {
                        const isBeingDragged = draggingCandidateId === candidate.id;
                        const isSelected = selectedCandidate?.id === candidate.id;

                        // Unified Status Color Progression Scale
                        // Gray = Not started/Pending | Blue = In progress/Scheduled | Emerald = Passed/Completed | Rose = Rejected/Failed
                        const getAssessmentStyle = (status?: string) => {
                          if (status === "Taken") return "bg-emerald-50 text-emerald-800 border-emerald-200/80";
                          if (status === "Assessment Fit" || status === "In Progress") return "bg-blue-50 text-blue-800 border-blue-200/80";
                          return "bg-slate-50 text-slate-600 border-slate-200/80";
                        };

                        const getInterviewStyle = (status?: string) => {
                          if (status === "Completed") return "bg-emerald-50 text-emerald-800 border-emerald-200/80";
                          if (status === "Scheduled" || status === "Interview Scheduled" || status === "Interview in Progress") return "bg-blue-50 text-blue-800 border-blue-200/80";
                          return "bg-slate-50 text-slate-600 border-slate-200/80";
                        };

                        const currentStageIdx = BOARD_STAGES.indexOf(candidate.currentStage);
                        const nextStage = currentStageIdx >= 0 && currentStageIdx < BOARD_STAGES.length - 1 ? BOARD_STAGES[currentStageIdx + 1] : null;

                        return (
                          <div
                            key={candidate.id}
                            draggable={true}
                            onDragStart={(e) => {
                              e.dataTransfer.setData("text/plain", candidate.id);
                              setDraggingCandidateId(candidate.id);
                            }}
                            onDragEnd={() => {
                              setDraggingCandidateId(null);
                              setDragOverStage(null);
                            }}
                            className={`group relative cursor-grab select-none space-y-2.5 rounded-xl border bg-white p-3 shadow-[0_3px_9px_rgba(4,44,81,0.04)] transition-all duration-200 active:cursor-grabbing hover:-translate-y-0.5 hover:shadow-[0_8px_18px_rgba(4,44,81,0.08)] ${
                              isSelected
                                ? "ring-2 ring-[#FF5C28] border-[#FF5C28] bg-orange-50/20 shadow-md"
                                : "border-slate-200/90 shadow-2xs hover:shadow-md hover:border-[#042C51]/40"
                            } ${isBeingDragged ? "opacity-40 scale-95 ring-2 ring-[#042C51]" : ""}`}
                            onClick={() => {
                              setSelectedCandidate(candidate);
                              setIsDetailsModalOpen(true);
                            }}
                          >
                            {/* Selected Active Indicator Pill */}
                            {isSelected && (
                              <div className="absolute -top-2 right-3 px-2 py-0.5 bg-[#FF5C28] text-white text-[8px] font-black uppercase rounded-full shadow-2xs">
                                Active Selection
                              </div>
                            )}

                            {/* Tier 1: Primary Header - Candidate Name, Avatar, and Tertiary Email */}
                            <div className="flex items-start justify-between gap-2">
                              <div className="space-y-0.5 min-w-0">
                                <div className="flex items-center gap-1">
                                  <GripVertical className="w-3.5 h-3.5 text-slate-300 group-hover:text-slate-500 transition-colors shrink-0" />
                                  <h4
                                    title={candidate.name}
                                    className="text-xs font-black text-[#042C51] leading-snug uppercase group-hover:text-[#FF5C28] transition-colors truncate max-w-[170px]"
                                  >
                                    {candidate.name}
                                  </h4>
                                </div>
                                <p
                                  title={candidate.email}
                                  className="text-[10px] text-slate-400 font-medium truncate pl-4 max-w-[175px]"
                                >
                                  {candidate.email}
                                </p>
                              </div>
                              <div className="w-7 h-7 rounded-full bg-[#042C51] text-white flex items-center justify-center font-black text-[11px] shrink-0 shadow-2xs">
                                {candidate.name
                                  .split(" ")
                                  .map((n) => n[0])
                                  .filter(Boolean)
                                  .slice(0, 2)
                                  .join("")
                                  .toUpperCase() || "RV"}
                              </div>
                            </div>

                            {/* Tier 2: Split Badge Systems - Source (Outlined Neutral) vs Outcome/PRF (Solid Semantic) */}
                            <div className="flex items-center justify-between gap-1.5 pt-0.5">
                              {/* Source Metadata Badge (Outlined Low-Saturation Style) */}
                              <span
                                title={`Acquisition Source: ${candidate.source}`}
                                className="px-2 py-0.5 bg-slate-50 text-slate-600 border border-slate-200 text-[9px] font-bold rounded-md uppercase tracking-tight truncate max-w-[110px]"
                              >
                                {candidate.source}
                              </span>

                              {/* PRF Outcome Signal Badge (Solid Saturated Fill) */}
                              <span
                                title={`PRF Alignment Outcome: ${candidate.prfStatus || "Review"}`}
                                className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-tight shadow-2xs ${
                                  candidate.prfStatus === "Matched"
                                    ? "bg-emerald-600 text-white"
                                    : candidate.prfStatus === "Not Matched"
                                    ? "bg-rose-600 text-white"
                                    : "bg-amber-500 text-white"
                                }`}
                              >
                                {candidate.prfStatus || "REVIEW"}
                              </span>
                            </div>

                            {/* Compressed 2-Column Metric Box (Position & Initial Account with Truncation Recovery) */}
                            <div className="grid grid-cols-2 gap-2 text-[10px] bg-slate-50/90 p-2 rounded-lg border border-slate-100">
                              <div className="min-w-0">
                                <span className="text-slate-400 text-[8px] uppercase font-bold block tracking-wider">POSITION</span>
                                <span
                                  title={candidate.roleTitle || "USV"}
                                  className="font-extrabold text-[#042C51] truncate block text-[10px] mt-0.5"
                                >
                                  {candidate.roleTitle || "USV"}
                                </span>
                              </div>
                              <div className="min-w-0">
                                <span className="text-slate-400 text-[8px] uppercase font-bold block tracking-wider">ACCOUNT</span>
                                <span
                                  title={candidate.account || "Not assigned yet"}
                                  className="font-extrabold text-[#042C51] truncate block text-[10px] mt-0.5"
                                >
                                  {candidate.account || "Unassigned"}
                                </span>
                              </div>
                            </div>

                            {/* Tier 2: Compressed Inline Stage Status Progression Indicator */}
                            <div className="flex items-center gap-1.5 text-[9px] pt-0.5">
                              <div
                                title={`Assessment Status: ${candidate.assessmentStatus || "Not Taken"}`}
                                className={`flex-1 flex items-center justify-between px-2 py-1 rounded-md border font-extrabold ${getAssessmentStyle(candidate.assessmentStatus)}`}
                              >
                                <span className="text-slate-400 font-bold uppercase text-[8px]">Assess</span>
                                <span className="truncate max-w-[60px] pl-1">{candidate.assessmentStatus || "Pending"}</span>
                              </div>

                              <div
                                title={`Interview Status: ${candidate.interviewStatus || "Pending"}`}
                                className={`flex-1 flex items-center justify-between px-2 py-1 rounded-md border font-extrabold ${getInterviewStyle(candidate.interviewStatus)}`}
                              >
                                <span className="text-slate-400 font-bold uppercase text-[8px]">Interview</span>
                                <span className="truncate max-w-[60px] pl-1">{candidate.interviewStatus || "Pending"}</span>
                              </div>
                            </div>

                            {/* Normalized Card Core Note (Fixed Height Truncated Line with Hover Tooltip) */}
                            <div
                              title={`Latest Update Note: ${candidate.timeline[0]?.reason || "Candidate moved from Talent Pool."}`}
                              className="px-2 py-1 bg-slate-50 border border-slate-100 rounded-md text-[10px] text-slate-500 font-medium truncate"
                            >
                              <span className="text-slate-400 font-bold mr-1">•</span>
                              {candidate.timeline[0]?.reason || "Candidate moved from Talent Pool."}
                            </div>

                            {/* Tier 3: Card Footer - Demoted System ID & Accessible Action Buttons */}
                            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px]">
                              {/* Demoted Reference System ID */}
                              <span
                                title={`Candidate System ID: ${candidate.candidateId}`}
                                className="font-mono text-slate-400 text-[9px] font-medium tracking-tight truncate max-w-[100px]"
                              >
                                {candidate.candidateId}
                              </span>

                              {/* Accessible Action Buttons */}
                              <div className="flex items-center gap-1">
                                {/* View Profile */}
                                <button
                                  type="button"
                                  aria-label="View Candidate Profile"
                                  title="View Candidate Profile"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedCandidate(candidate);
                                    setIsDetailsModalOpen(true);
                                  }}
                                  className="inline-flex h-6 w-6 items-center justify-center rounded-md border border-slate-200 bg-white text-[#042C51] transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[#042C51] cursor-pointer"
                                >
                                  <Eye size={13} />
                                </button>

                                {/* Assessment Update */}
                                {candidate.currentStage === "Online Assessment" && (
                                  <button
                                    type="button"
                                    aria-label="Update Assessment Result"
                                    title="Update Assessment Result"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setAssessmentModalCandidate(candidate);
                                    }}
                                    className="inline-flex h-6 w-6 items-center justify-center rounded-md border border-cyan-200 bg-cyan-50 text-cyan-700 transition hover:bg-cyan-100 focus:outline-none focus:ring-2 focus:ring-cyan-500 cursor-pointer"
                                  >
                                    <ClipboardCheck size={13} />
                                  </button>
                                )}

                                {/* Schedule Interview */}
                                {(candidate.currentStage === "Assessment Fit" || candidate.currentStage === "Interview Scheduled") && (
                                  <button
                                    type="button"
                                    aria-label="Schedule / Update Interview"
                                    title="Schedule / Update Interview"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setScheduleModalCandidate(candidate);
                                    }}
                                    className="inline-flex h-6 w-6 items-center justify-center rounded-md border border-blue-200 bg-blue-50 text-blue-700 transition hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                                  >
                                    <CalendarDays size={13} />
                                  </button>
                                )}

                                {/* Cancel Interview (Destructive Action) */}
                                {candidate.currentStage === "Interview Scheduled" && (
                                  <button
                                    type="button"
                                    aria-label="Cancel Scheduled Interview"
                                    title="Cancel Scheduled Interview (Requires Confirmation)"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setCancelInterviewModalCandidate(candidate);
                                    }}
                                    className="inline-flex h-6 w-6 items-center justify-center rounded-md border border-red-200 bg-red-50 text-red-600 transition hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-500 cursor-pointer"
                                  >
                                    <X size={13} />
                                  </button>
                                )}

                                {/* Quick Advance Stage */}
                                {nextStage && (
                                  <button
                                    type="button"
                                    aria-label={`Advance to ${nextStage}`}
                                    title={`Quick Advance to ${nextStage}`}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleMoveStage(candidate.id, nextStage, `Quick advanced to ${nextStage} from Kanban board card.`);
                                    }}
                                    className="inline-flex h-6 px-1.5 items-center gap-0.5 rounded-md bg-[#FF5C28] text-white font-bold text-[9px] transition hover:bg-[#e04b1a] focus:outline-none focus:ring-2 focus:ring-[#FF5C28] cursor-pointer shadow-2xs"
                                  >
                                    <span>Advance</span>
                                    <ArrowRight size={11} />
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

          {/* ==================== DROP-OFF LIST SECTION ==================== */}
          <section className="overflow-hidden rounded-2xl border border-[#DCE5EF] bg-white shadow-[0_8px_22px_rgba(4,44,81,0.04)]">
            <div className="flex items-center justify-between gap-4 border-b border-[#E6ECF2] px-4 py-4 sm:px-5">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-red-100 bg-red-50 text-red-700">
                  <UserX className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-[#042C51]">Drop-off Candidate Ledger</h3>
                  <p className="text-xs text-slate-500">Track candidates who dropped off or withdrew during recruitment</p>
                </div>
              </div>
              <span className="text-xs font-black bg-rose-100 text-rose-800 px-3 py-1 rounded-full font-mono">
                {candidates.filter((c) => c.currentStage === "Drop-off").length} Record(s)
              </span>
            </div>

            <div className="space-y-3 p-4 sm:p-5">
              {candidates
                .filter((c) => c.currentStage === "Drop-off")
                .map((candidate) => (
                  <div
                    key={candidate.id}
                    className="flex flex-col justify-between gap-4 rounded-xl border border-[#E6ECF2] bg-[#F8FAFC] p-4 transition hover:bg-white md:flex-row md:items-center"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-[#042C51] text-xs">{candidate.name}</span>
                        <span className="text-[10px] text-slate-400 font-mono">({candidate.candidateId})</span>
                        <span className="px-2 py-0.2 bg-rose-100 text-rose-700 text-[9px] font-black rounded-full uppercase">
                          {candidate.dropOffCategory || "Drop-off"}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 leading-snug">
                        <strong>Reason:</strong> {candidate.dropOffReason || "Application withdrawn."}
                      </p>
                      {candidate.dropOffRemarks && (
                        <p className="text-[11px] text-slate-500 italic">"{candidate.dropOffRemarks}"</p>
                      )}
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <div className="text-right text-[10px] text-slate-400 font-mono">
                        <div>Email: <strong className="text-slate-700">{candidate.dropOffEmailStatus || "Sent"}</strong></div>
                        <div>Recipient: {candidate.email}</div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleResendDropOffEmail(candidate.id)}
                        className="px-3 py-1.5 bg-white hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-lg transition-all cursor-pointer border border-slate-300 flex items-center gap-1.5"
                      >
                        <Send className="w-3 h-3 text-[#FF5C28]" />
                        <span>Resend Email</span>
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          </section>
        </>
      )}

      {/* ==================== ALL 8 FULLY FEATURED MODALS ==================== */}

      {/* 1. MASTER CANDIDATE PIPELINE DETAIL MODAL */}
      <CandidatePipelineModalShell
        isOpen={isDetailsModalOpen && !!selectedCandidate}
        onClose={() => setIsDetailsModalOpen(false)}
        title={selectedCandidate?.name || "Candidate Record"}
        kicker="Candidate Pipeline Record"
        maxWidth="max-w-6xl"
        headerAction={
          selectedCandidate ? (
            <button
              type="button"
              onClick={() => setIsHistorySidebarOpen(!isHistorySidebarOpen)}
              className={`px-3 py-1.5 font-black text-xs rounded-xl shadow-2xs transition-all cursor-pointer flex items-center gap-1.5 border ${
                isHistorySidebarOpen
                  ? "bg-[#FF5C28] text-white border-[#FF5C28]"
                  : "bg-white/10 hover:bg-white/20 text-white border-white/20"
              }`}
              title="Toggle Shopee-style Movement History Sidebar"
            >
              <History className="w-3.5 h-3.5 text-[#FF5C28]" />
              <span className="hidden sm:inline">Movement History ({selectedCandidate.timeline.length})</span>
              <span className="sm:hidden">History ({selectedCandidate.timeline.length})</span>
            </button>
          ) : null
        }
        candidateInfo={
          selectedCandidate
            ? {
                name: selectedCandidate.name,
                email: selectedCandidate.email,
                contactNumber: selectedCandidate.contactNumber,
                candidateId: selectedCandidate.candidateId,
                currentStage: selectedCandidate.currentStage,
                prfStatus: selectedCandidate.prfStatus,
                roleTitle: selectedCandidate.roleTitle,
                account: selectedCandidate.account,
              }
            : undefined
        }
      >
        {selectedCandidate && (() => {
          const stageIdx = BOARD_STAGES.indexOf(selectedCandidate.currentStage);
          const isDropOff = selectedCandidate.currentStage === "Drop-off";

          // Derive furthest reached stage from timeline
          const reachedStages = new Set(selectedCandidate.timeline.map((t) => t.stage));

          const hasReachedAssessment =
            (!isDropOff && stageIdx >= 1) ||
            reachedStages.has("Online Assessment") ||
            reachedStages.has("Assessment Fit") ||
            reachedStages.has("Interview Scheduled") ||
            reachedStages.has("Interviewed") ||
            reachedStages.has("Offered") ||
            reachedStages.has("Accepted") ||
            reachedStages.has("For NHO") ||
            selectedCandidate.assessmentScore !== undefined ||
            !!selectedCandidate.assessmentResult;

          const hasReachedInterview =
            (!isDropOff && stageIdx >= 2) ||
            reachedStages.has("Assessment Fit") ||
            reachedStages.has("Interview Scheduled") ||
            reachedStages.has("Interviewed") ||
            reachedStages.has("Offered") ||
            reachedStages.has("Accepted") ||
            reachedStages.has("For NHO") ||
            !!selectedCandidate.interviewDate ||
            !!selectedCandidate.onlineInterviewLink;

          const hasReachedOffer =
            (!isDropOff && stageIdx >= 5) ||
            reachedStages.has("Offered") ||
            reachedStages.has("Accepted") ||
            reachedStages.has("For NHO") ||
            !!selectedCandidate.offerDetails;

          const hasReachedNho =
            (!isDropOff && stageIdx >= 6) ||
            reachedStages.has("Accepted") ||
            reachedStages.has("For NHO") ||
            reachedStages.has("For Onboarding - Incomplete Requirements") ||
            reachedStages.has("Onboarding") ||
            reachedStages.has("Hired / Active") ||
            !!selectedCandidate.nhoScheduleDate ||
            (selectedCandidate.nhoFiles && selectedCandidate.nhoFiles.length > 0);

          return (
            <div className="grid grid-cols-12 gap-6 items-start">
              {/* Left Column: 70% Card Space when sidebar is open, 100% when closed */}
              <div className={`space-y-6 transition-all duration-300 ${
                isHistorySidebarOpen ? "col-span-12 lg:col-span-8" : "col-span-12"
              }`}>
              {/* STAGE PROGRESSION ACTIONS */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
                    STAGE PROGRESSION ACTIONS ({selectedCandidate.currentStage.toUpperCase()})
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setIsDetailsModalOpen(false);
                      setMoveModalCandidate(selectedCandidate);
                    }}
                    className="text-[11px] font-bold text-[#FF5C28] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span>Manual Stage Override</span>
                    <ChevronRight className="w-3 h-3" />
                  </button>
                </div>

                <div className="flex flex-wrap items-center gap-2 pt-0.5">
                  {/* STAGE 1: Initial Screening */}
                  {selectedCandidate.currentStage === "Initial Screening" && (
                    <>
                      {selectedCandidate.prfStatus === "Matched" ? (
                        <CandidateModalPrimaryButton
                          onClick={() => {
                            setIsDetailsModalOpen(false);
                            handleOpenConfirmModal(selectedCandidate);
                          }}
                          icon={<Sparkles className="w-4 h-4 text-white" />}
                        >
                          Advance to Online Assessment
                        </CandidateModalPrimaryButton>
                      ) : (
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-xs font-bold text-slate-600">PRF Status Decision:</span>
                          <div className="relative inline-block">
                            <select
                              id="topPrfSelect"
                              defaultValue={selectedCandidate.prfStatus || "Review"}
                              onChange={(e) => setTempPrfStatus(e.target.value as "Review" | "Matched" | "Not Matched")}
                              className="appearance-none bg-amber-500 hover:bg-amber-600 text-white font-black rounded-xl text-xs px-3.5 py-2.5 pr-8 shadow-2xs transition-all cursor-pointer focus:outline-none"
                            >
                              <option value="Review" className="bg-white text-slate-800 font-bold">Review</option>
                              <option value="Matched" className="bg-white text-emerald-700 font-bold">Matched</option>
                              <option value="Not Matched" className="bg-white text-rose-700 font-bold">Not Matched</option>
                            </select>
                            <ChevronDown className="w-4 h-4 text-white absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                          </div>
                          <CandidateModalPrimaryButton
                            onClick={() => {
                              const selVal = (document.getElementById("topPrfSelect") as HTMLSelectElement)?.value as "Review" | "Matched" | "Not Matched" || tempPrfStatus;
                              handleUpdatePrfStatus(selectedCandidate.id, selVal);
                              showBanner(`Applied PRF status decision: ${selVal} for ${selectedCandidate.name}.`);
                            }}
                          >
                            Proceed
                          </CandidateModalPrimaryButton>
                        </div>
                      )}
                    </>
                  )}

                  {/* STAGE 2: Online Assessment */}
                  {selectedCandidate.currentStage === "Online Assessment" && (
                    <>
                      <CandidateModalSecondaryButton
                        onClick={() => {
                          setIsDetailsModalOpen(false);
                          setAssessmentModalCandidate(selectedCandidate);
                        }}
                      >
                        Log / Update Assessment
                      </CandidateModalSecondaryButton>
                      {selectedCandidate.assessmentStatus === "Taken" && selectedCandidate.assessmentResult === "Assessment Fit" && (
                        <CandidateModalPrimaryButton
                          onClick={() => {
                            setIsDetailsModalOpen(false);
                            handleOpenConfirmModal(selectedCandidate);
                          }}
                        >
                          Advance to Assessment Fit
                        </CandidateModalPrimaryButton>
                      )}
                    </>
                  )}

                  {/* STAGE 3: Assessment Fit */}
                  {selectedCandidate.currentStage === "Assessment Fit" && (
                    <CandidateModalPrimaryButton
                      onClick={() => {
                        setIsDetailsModalOpen(false);
                        setScheduleModalCandidate(selectedCandidate);
                      }}
                      icon={<CalendarIcon className="w-4 h-4 text-white" />}
                    >
                      Schedule Interview
                    </CandidateModalPrimaryButton>
                  )}

                  {/* STAGE 4: Interview Scheduled */}
                  {selectedCandidate.currentStage === "Interview Scheduled" && (
                    <div className="w-full flex flex-wrap sm:flex-nowrap items-center gap-2">
                      <CandidateModalSecondaryButton
                        onClick={() => {
                          setIsDetailsModalOpen(false);
                          setScheduleModalCandidate(selectedCandidate);
                        }}
                      >
                        Update Interview Schedule
                      </CandidateModalSecondaryButton>
                      <CandidateModalPrimaryButton
                        onClick={() => {
                          showBanner(`Started interview session for ${selectedCandidate.name}.`);
                        }}
                        variant="navy"
                        icon={<PlayCircle className="w-4 h-4 text-white" />}
                      >
                        Start Interview
                      </CandidateModalPrimaryButton>
                      <CandidateModalPrimaryButton
                        onClick={() => {
                          handleMoveStage(selectedCandidate.id, "Interviewed", "Interview completed.");
                          showBanner(`Interview completed for ${selectedCandidate.name}. Moved to Interviewed.`);
                          setIsDetailsModalOpen(false);
                        }}
                        variant="emerald"
                        icon={<CheckCircle2 className="w-4 h-4 text-white" />}
                      >
                        Mark Interview Completed
                      </CandidateModalPrimaryButton>
                      <CandidateModalPrimaryButton
                        onClick={() => {
                          setIsDetailsModalOpen(false);
                          setCancelInterviewModalCandidate(selectedCandidate);
                        }}
                        variant="red"
                        icon={<X className="w-4 h-4 text-white" />}
                      >
                        Cancel Interview
                      </CandidateModalPrimaryButton>
                    </div>
                  )}

                  {/* STAGE 5: Interviewed */}
                  {selectedCandidate.currentStage === "Interviewed" && (
                    <div className="w-full flex items-center justify-between gap-3">
                      <CandidateModalPrimaryButton
                        onClick={() => {
                          setIsDetailsModalOpen(false);
                          setOfferModalCandidate(selectedCandidate);
                        }}
                        icon={<BriefcaseBusiness className="w-4 h-4" />}
                      >
                        Prepare & Issue Offer Details
                      </CandidateModalPrimaryButton>
                      <CandidateModalPrimaryButton
                        onClick={() => {
                          setIsDetailsModalOpen(false);
                          setDropOffModalCandidate(selectedCandidate);
                        }}
                        variant="red"
                        icon={<UserX className="w-4 h-4" />}
                      >
                        Mark Drop-off
                      </CandidateModalPrimaryButton>
                    </div>
                  )}

                  {/* STAGE 6: Offered */}
                  {selectedCandidate.currentStage === "Offered" && (
                    <div className="w-full flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <CandidateModalPrimaryButton
                          onClick={() => {
                            handleMoveStage(selectedCandidate.id, "Accepted", "Candidate accepted the offer.");
                            showBanner(`${selectedCandidate.name} accepted the offer! Moved to Accepted.`);
                            setIsDetailsModalOpen(false);
                          }}
                          variant="emerald"
                          icon={<Check className="w-4 h-4" />}
                        >
                          Record Offer Acceptance
                        </CandidateModalPrimaryButton>
                        <CandidateModalSecondaryButton
                          onClick={() => {
                            setIsDetailsModalOpen(false);
                            setRevisedOfferCandidate(selectedCandidate);
                          }}
                        >
                          Negotiate / Revised Offer
                        </CandidateModalSecondaryButton>
                      </div>
                      <CandidateModalPrimaryButton
                        onClick={() => {
                          setIsDetailsModalOpen(false);
                          setDropOffModalCandidate(selectedCandidate);
                        }}
                        variant="red"
                        icon={<UserX className="w-4 h-4" />}
                      >
                        Mark Drop-off
                      </CandidateModalPrimaryButton>
                    </div>
                  )}

                  {/* STAGE 7: Accepted */}
                  {selectedCandidate.currentStage === "Accepted" && (
                    <div className="w-full flex items-center justify-between gap-3">
                      <CandidateModalPrimaryButton
                        onClick={() => {
                          setIsDetailsModalOpen(false);
                          setNhoModalCandidate(selectedCandidate);
                        }}
                        icon={<CalendarIcon className="w-4 h-4 text-white" />}
                      >
                        Schedule NHO
                      </CandidateModalPrimaryButton>
                      <CandidateModalPrimaryButton
                        onClick={() => {
                          setIsDetailsModalOpen(false);
                          setDropOffModalCandidate(selectedCandidate);
                        }}
                        variant="red"
                        icon={<UserX className="w-4 h-4" />}
                      >
                        Mark Drop-off
                      </CandidateModalPrimaryButton>
                    </div>
                  )}

                  {/* STAGE 8: For NHO */}
                  {selectedCandidate.currentStage === "For NHO" && (
                    <div className="w-full flex items-center justify-between gap-3">
                      <CandidateModalPrimaryButton
                        onClick={() => {
                          setIsDetailsModalOpen(false);
                          setNhoModalCandidate(selectedCandidate);
                        }}
                        icon={<FileText className="w-4 h-4" />}
                      >
                        Manage Pre-Employment Requirements
                      </CandidateModalPrimaryButton>
                      <CandidateModalPrimaryButton
                        onClick={() => {
                          setIsDetailsModalOpen(false);
                          setDropOffModalCandidate(selectedCandidate);
                        }}
                        variant="red"
                        icon={<UserX className="w-4 h-4" />}
                      >
                        Mark Drop-off
                      </CandidateModalPrimaryButton>
                    </div>
                  )}

                  {/* Drop-off Candidate Reactivation */}
                  {selectedCandidate.currentStage === "Drop-off" && (
                    <CandidateModalPrimaryButton
                      onClick={() => {
                        handleMoveStage(selectedCandidate.id, "Initial Screening", "Candidate reactivated from Drop-off.");
                        showBanner(`Reactivated ${selectedCandidate.name} back to Initial Screening.`);
                        setIsDetailsModalOpen(false);
                      }}
                      variant="emerald"
                      icon={<RefreshCw className="w-4 h-4" />}
                    >
                      Reactivate Candidate
                    </CandidateModalPrimaryButton>
                  )}
                </div>
              </div>

              {/* 1. CANDIDATE MASTER REQUISITION DETAILS */}
              <CandidateModalSection
                title="Candidate Master Requisition Details"
                subtitle="Requisition tracking metadata and source placement"
                icon={<LayoutGrid className="w-4 h-4 text-[#FF5C28]" />}
              >
                <div className="bg-[#F8FAFC] p-4 rounded-xl border border-slate-200/80">
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
                    <div>
                      <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block mb-0.5">Candidate ID</span>
                      <span className="text-xs font-black font-mono text-[#042C51]">{selectedCandidate.candidateId}</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block mb-0.5">Source</span>
                      <span className="text-xs font-bold text-blue-700">{selectedCandidate.source}</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block mb-0.5">Department</span>
                      <span className="text-xs font-bold text-slate-800">{selectedCandidate.department}</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block mb-0.5">Target Position</span>
                      <span className="text-xs font-black text-slate-800">{selectedCandidate.roleTitle}</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block mb-0.5">Client Account</span>
                      <span className="text-xs font-black text-[#042C51]">{selectedCandidate.account}</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block mb-0.5">PRF Status</span>
                      <span className="text-xs font-extrabold text-amber-700">{selectedCandidate.prfStatus || "Review"}</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block mb-0.5">Recorded Date</span>
                      <span className="text-xs font-bold font-mono text-slate-600">{selectedCandidate.createdAt}</span>
                    </div>
                  </div>
                </div>
              </CandidateModalSection>

              {/* 2. LEAD PRF REVIEW & ALIGNMENT */}
              <CandidateModalSection
                title="Lead PRF Review & Alignment"
                subtitle="Headcount requisition alignment for candidate placement"
                icon={<ShieldCheck className="w-4 h-4 text-[#FF5C28]" />}
              >
                <div className="bg-[#F8FAFC] p-4 rounded-xl border border-slate-200/80 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <span className="text-[10px] font-black text-[#042C51] uppercase tracking-wider block">Headcount Requisition Review</span>
                      <p className="text-xs text-slate-500 mt-0.5">Validate talent pool alignment against active PRF requisitions.</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-bold text-slate-600">Alignment Decision:</span>
                      <div className="relative inline-block">
                        <select
                          id="sectionPrfSelect"
                          defaultValue={selectedCandidate.prfStatus || "Review"}
                          className={`appearance-none font-extrabold text-xs px-3.5 py-2 pr-8 rounded-xl cursor-pointer border shadow-2xs transition-all focus:outline-none ${
                            selectedCandidate.prfStatus === "Matched"
                              ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                              : selectedCandidate.prfStatus === "Not Matched"
                              ? "bg-rose-50 text-rose-800 border-rose-300"
                              : "bg-slate-100 text-[#042C51] border-slate-300"
                          }`}
                        >
                          <option value="Review" className="bg-white text-slate-800 font-bold">Review</option>
                          <option value="Matched" className="bg-white text-emerald-700 font-bold">Matched</option>
                          <option value="Not Matched" className="bg-white text-rose-700 font-bold">Not Matched</option>
                        </select>
                        <ChevronDown className="w-4 h-4 text-slate-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      </div>
                      <CandidateModalPrimaryButton
                        onClick={() => {
                          const selVal = (document.getElementById("sectionPrfSelect") as HTMLSelectElement)?.value as "Review" | "Matched" | "Not Matched";
                          if (selVal) {
                            handleUpdatePrfStatus(selectedCandidate.id, selVal);
                            showBanner(`Applied PRF alignment decision: ${selVal} for ${selectedCandidate.name}.`);
                          }
                        }}
                      >
                        Proceed
                      </CandidateModalPrimaryButton>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between gap-2">
                    <span className="text-xs text-slate-600 font-medium">
                      Current Alignment: <strong className="text-[#042C51] font-black">{selectedCandidate.prfStatus || "Review"}</strong>
                    </span>
                    {selectedCandidate.prfStatus === "Matched" ? (
                      <CandidateModalPrimaryButton
                        onClick={() => {
                          handleMoveStage(selectedCandidate.id, "Online Assessment", "PRF Matched - Advanced to Online Assessment");
                          showBanner(`${selectedCandidate.name} PRF Matched! Advanced to Online Assessment stage.`);
                          setIsDetailsModalOpen(false);
                        }}
                        variant="navy"
                        icon={<Sparkles className="w-3.5 h-3.5 text-[#FF5C28]" />}
                      >
                        Advance to Online Assessment
                      </CandidateModalPrimaryButton>
                    ) : selectedCandidate.prfStatus === "Not Matched" ? (
                      <CandidateModalPrimaryButton
                        onClick={() => {
                          setIsDetailsModalOpen(false);
                          setDropOffModalCandidate(selectedCandidate);
                        }}
                        variant="red"
                        icon={<UserX className="w-3.5 h-3.5" />}
                      >
                        Move to Drop-off
                      </CandidateModalPrimaryButton>
                    ) : (
                      <CandidateModalPrimaryButton
                        onClick={() => {
                          handleUpdatePrfStatus(selectedCandidate.id, "Matched");
                          showBanner(`Updated PRF status for ${selectedCandidate.name} to Matched.`);
                        }}
                        variant="orange"
                        icon={<Check className="w-3.5 h-3.5" />}
                      >
                        Set PRF as Matched
                      </CandidateModalPrimaryButton>
                    )}
                  </div>
                </div>
              </CandidateModalSection>

              {/* 3. CANDIDATE PROFILE DETAILS */}
              <CandidateModalSection
                title="Candidate Profile Details"
                subtitle="Qualifications, education, experience, and salary expectations"
                icon={<User className="w-4 h-4 text-[#FF5C28]" />}
              >
                <div className="bg-[#F8FAFC] p-4 rounded-xl border border-slate-200/80">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block mb-0.5">Highest Education</span>
                      <span className="text-xs font-bold text-slate-800">{selectedCandidate.education || "Bachelor's Degree"}</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block mb-0.5">Relevant Experience</span>
                      <span className="text-xs font-bold text-slate-800">{selectedCandidate.experienceYears || "3+ Years BPO"}</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block mb-0.5">Expected Monthly Salary</span>
                      <span className="text-xs font-black text-emerald-700 font-mono">₱{(selectedCandidate.expectedSalary || 28000).toLocaleString()}/month</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block mb-0.5">Current Location</span>
                      <span className="text-xs font-bold text-slate-800">{selectedCandidate.currentLocation || "Metro Manila"}</span>
                    </div>
                  </div>
                </div>
              </CandidateModalSection>

              {/* 4. TALENT POOL SUBMITTED DETAILS */}
              <CandidateModalSection
                title="Talent Pool Submitted Details"
                subtitle="Application details submitted via Talent Pool"
                icon={<Database className="w-4 h-4 text-[#FF5C28]" />}
              >
                <div className="bg-[#F8FAFC] p-4 rounded-xl border border-slate-200/80 space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block mb-0.5">Application ID</span>
                      <span className="text-xs font-mono font-bold text-[#042C51]">{selectedCandidate.candidateApplicationId || selectedCandidate.id}</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block mb-0.5">Contact Email</span>
                      <span className="text-xs font-bold font-mono text-blue-700">{selectedCandidate.email}</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block mb-0.5">Phone Number</span>
                      <span className="text-xs font-bold font-mono text-slate-800">{selectedCandidate.contactNumber}</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block mb-0.5">Submission Source</span>
                      <span className="text-xs font-bold text-slate-800">{selectedCandidate.source}</span>
                    </div>
                  </div>
                </div>
              </CandidateModalSection>

              {/* 5. ONLINE ASSESSMENT RECORD (Conditional) */}
              {hasReachedAssessment && (
                <CandidateModalSection
                  title="Online Assessment Record"
                  subtitle="Comprehension, technical score, and assessment evaluation"
                  icon={<ClipboardCheck className="w-4 h-4 text-[#FF5C28]" />}
                  headerAction={
                    <CandidateModalSecondaryButton
                      onClick={() => {
                        setIsDetailsModalOpen(false);
                        setAssessmentModalCandidate(selectedCandidate);
                      }}
                    >
                      Log / Update Assessment
                    </CandidateModalSecondaryButton>
                  }
                >
                  <div className="bg-[#F8FAFC] p-4 rounded-xl border border-slate-200/80 space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      <div>
                        <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block mb-0.5">Assessment Status</span>
                        <span className="text-xs font-bold text-slate-800">{selectedCandidate.assessmentStatus}</span>
                      </div>
                      <div>
                        <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block mb-0.5">Assessment Result</span>
                        <span className="text-xs font-black text-indigo-800">{selectedCandidate.assessmentResult || "Pending"}</span>
                      </div>
                      <div>
                        <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block mb-0.5">Score</span>
                        <span className="text-xs font-black text-indigo-700 font-mono">
                          {selectedCandidate.assessmentScore !== undefined ? `${selectedCandidate.assessmentScore} / 100` : "N/A"}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block mb-0.5">Remarks</span>
                        <span className="text-xs font-medium text-slate-700 italic">{selectedCandidate.assessmentRemarks || "None"}</span>
                      </div>
                    </div>
                  </div>
                </CandidateModalSection>
              )}

              {/* 6. INTERVIEW RECORD & SCHEDULE (Conditional) */}
              {hasReachedInterview && (
                <CandidateModalSection
                  title="Interview Record & Schedule"
                  subtitle="Scheduled interview session, format, and operational notes"
                  icon={<CalendarIcon className="w-4 h-4 text-[#FF5C28]" />}
                  headerAction={
                    <CandidateModalSecondaryButton
                      onClick={() => {
                        setIsDetailsModalOpen(false);
                        setScheduleModalCandidate(selectedCandidate);
                      }}
                    >
                      Update Schedule
                    </CandidateModalSecondaryButton>
                  }
                >
                  <div className="bg-[#F8FAFC] p-4 rounded-xl border border-slate-200/80 space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      <div>
                        <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block mb-0.5">Interview Date & Time</span>
                        <span className="text-xs font-black font-mono text-[#042C51]">{selectedCandidate.interviewDate || "Not booked"}</span>
                      </div>
                      <div>
                        <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block mb-0.5">Format / Venue</span>
                        <span className="text-xs font-bold text-slate-800">{selectedCandidate.interviewType || "Online Video Call"}</span>
                      </div>
                      <div>
                        <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block mb-0.5">Interview Status</span>
                        <span className="text-xs font-bold text-sky-800">{selectedCandidate.interviewStatus || "Scheduled"}</span>
                      </div>
                      <div>
                        <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block mb-0.5">Meeting Link</span>
                        {selectedCandidate.onlineInterviewLink ? (
                          <a href={selectedCandidate.onlineInterviewLink} target="_blank" rel="noreferrer" className="text-xs font-bold text-blue-600 hover:underline truncate block">
                            {selectedCandidate.onlineInterviewLink}
                          </a>
                        ) : (
                          <span className="text-xs text-slate-400">N/A</span>
                        )}
                      </div>
                    </div>
                    {selectedCandidate.interviewerNotes && (
                      <div className="pt-2 border-t border-slate-200/80">
                        <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block mb-0.5">Interviewer Notes</span>
                        <p className="text-xs text-slate-700 font-medium leading-relaxed">{selectedCandidate.interviewerNotes}</p>
                      </div>
                    )}
                  </div>
                </CandidateModalSection>
              )}

              {/* 7. EMPLOYMENT OFFER DETAILS (Conditional) */}
              {hasReachedOffer && (
                <CandidateModalSection
                  title="Employment Offer Details"
                  subtitle="Compensation parameters, approval status, and target start date"
                  icon={<BriefcaseBusiness className="w-4 h-4 text-[#FF5C28]" />}
                  headerAction={
                    <CandidateModalSecondaryButton
                      onClick={() => {
                        setIsDetailsModalOpen(false);
                        setOfferModalCandidate(selectedCandidate);
                      }}
                    >
                      Update Offer Details
                    </CandidateModalSecondaryButton>
                  }
                >
                  <div className="bg-[#F8FAFC] p-4 rounded-xl border border-slate-200/80">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      <div>
                        <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block mb-0.5">Basic Monthly Pay</span>
                        <span className="text-xs font-black text-emerald-700 font-mono">
                          {selectedCandidate.offerDetails?.basicPay ? `₱${selectedCandidate.offerDetails.basicPay.toLocaleString()}` : "Not issued"}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block mb-0.5">Daily De Minimis Rate</span>
                        <span className="text-xs font-bold font-mono text-slate-800">
                          {selectedCandidate.offerDetails?.deminimisDailyRate ? `₱${selectedCandidate.offerDetails.deminimisDailyRate}` : "Not issued"}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block mb-0.5">Approval Status</span>
                        <span className="text-xs font-bold text-amber-700">{selectedCandidate.offerDetails?.approvalStatus || "For Review"}</span>
                      </div>
                      <div>
                        <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block mb-0.5">Candidate Decision</span>
                        <span className="text-xs font-bold text-[#042C51]">{selectedCandidate.offerDetails?.decision || "Pending"}</span>
                      </div>
                      <div>
                        <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block mb-0.5">Target Start Date</span>
                        <span className="text-xs font-bold font-mono text-slate-800">{selectedCandidate.offerDetails?.startDate || "TBD"}</span>
                      </div>
                    </div>
                  </div>
                </CandidateModalSection>
              )}

              {/* 8. NHO PRE-EMPLOYMENT REQUIREMENTS (Conditional) */}
              {hasReachedNho && (
                <CandidateModalSection
                  title="NHO Pre-Employment Requirements"
                  subtitle="Orientation date and 5 major requirement completion tracking"
                  icon={<FileCheck className="w-4 h-4 text-[#FF5C28]" />}
                  headerAction={
                    <CandidateModalSecondaryButton
                      onClick={() => {
                        setIsDetailsModalOpen(false);
                        setNhoModalCandidate(selectedCandidate);
                      }}
                    >
                      Manage NHO Documents
                    </CandidateModalSecondaryButton>
                  }
                >
                  <div className="bg-[#F8FAFC] p-4 rounded-xl border border-slate-200/80 space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      <div>
                        <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block mb-0.5">Scheduled Orientation Date</span>
                        <span className="text-xs font-bold font-mono text-[#042C51]">{selectedCandidate.nhoScheduleDate || "Not scheduled yet"}</span>
                      </div>
                      <div>
                        <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block mb-0.5">Requirement Progress</span>
                        <span className="text-xs font-bold text-emerald-700">4 / 5 Major Requirements Verified</span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-200/80 space-y-1.5">
                      <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">Major Requirements Checklist</span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {[
                          { name: "Transcript of Records / Diploma", status: "Verified" },
                          { name: "NBI Clearance", status: "Verified" },
                          { name: "Medical Check", status: "Pending" },
                          { name: "Birth Certificate", status: "Verified" },
                          { name: "Valid Government ID", status: "Verified" },
                        ].map((req, idx) => (
                          <div key={idx} className="p-2.5 bg-white border border-slate-200 rounded-xl flex items-center justify-between text-xs">
                            <span className="font-bold text-slate-800">{req.name}</span>
                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${
                              req.status === "Verified" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                            }`}>
                              {req.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CandidateModalSection>
              )}

              {/* 9. COMPLETE MOVEMENT HISTORY LOG (Always Visible, Always Last) */}
              <CandidateModalSection
                title="Complete Movement History Log"
                subtitle="Historical audit trail of candidate progression and stage movements"
                icon={<Clock className="w-4 h-4 text-[#FF5C28]" />}
                headerAction={
                  <button
                    type="button"
                    onClick={() => setIsHistorySidebarOpen(!isHistorySidebarOpen)}
                    className="px-3 py-1.5 bg-[#042C51] hover:bg-[#063a6b] text-white font-black text-xs rounded-xl shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <History className="w-3.5 h-3.5 text-[#FF5C28]" />
                    <span>{isHistorySidebarOpen ? "Hide Sidebar" : "Open 70/30 History Sidebar"}</span>
                  </button>
                }
              >
                <div className="space-y-2">
                  {selectedCandidate.timeline.map((t) => (
                    <div key={t.id} className="p-3 bg-[#F8FAFC] rounded-xl border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-black text-[#042C51]">{t.stage}</span>
                          <span className="text-[10px] text-slate-400">Updated By: {t.updatedBy}</span>
                        </div>
                        <p className="text-slate-600 font-medium">{t.reason}</p>
                      </div>
                      <span className="text-[10px] font-mono text-slate-400 shrink-0 sm:text-right">{t.date}</span>
                    </div>
                  ))}
                </div>
              </CandidateModalSection>
            </div>

            {/* Right Column: 30% Shopee-style Movement History Sidebar */}
            <AnimatePresence>
              {isHistorySidebarOpen && (
                <div className="col-span-12 lg:col-span-4 h-full sticky top-0">
                  <MovementHistorySidebar
                    candidateName={selectedCandidate.name}
                    currentStage={selectedCandidate.currentStage}
                    timeline={selectedCandidate.timeline}
                    onClose={() => setIsHistorySidebarOpen(false)}
                  />
                </div>
              )}
            </AnimatePresence>
          </div>
        );
        })()}
      </CandidatePipelineModalShell>

      {/* 2. MOVE STAGE MODAL */}
      <CandidatePipelineModalShell
        isOpen={!!moveModalCandidate}
        onClose={() => setMoveModalCandidate(null)}
        title="Move Candidate Stage"
        kicker="Manual Stage Override"
        maxWidth="max-w-md"
        candidateInfo={
          moveModalCandidate
            ? {
                name: moveModalCandidate.name,
                email: moveModalCandidate.email,
                contactNumber: moveModalCandidate.contactNumber,
                candidateId: moveModalCandidate.candidateId,
                currentStage: moveModalCandidate.currentStage,
                prfStatus: moveModalCandidate.prfStatus,
                roleTitle: moveModalCandidate.roleTitle,
                account: moveModalCandidate.account,
              }
            : undefined
        }
        footer={
          <div className="flex items-center justify-end gap-2 w-full">
            <CandidateModalSecondaryButton onClick={() => setMoveModalCandidate(null)}>
              Cancel
            </CandidateModalSecondaryButton>
            <CandidateModalPrimaryButton
              onClick={() => {
                if (!moveModalCandidate) return;
                const sel = (document.getElementById("targetStageSelect") as HTMLSelectElement)?.value as PipelineStageName;
                const txt = (document.getElementById("moveReasonText") as HTMLTextAreaElement)?.value;
                if (sel) handleMoveStage(moveModalCandidate.id, sel, txt);
              }}
              icon={<ArrowRight className="w-4 h-4" />}
            >
              Proceed with Movement
            </CandidateModalPrimaryButton>
          </div>
        }
      >
        {moveModalCandidate && (
          <div className="space-y-4">
            <div className="space-y-3">
              <div>
                <label className="font-extrabold text-[#042C51] uppercase text-[10px] block mb-1">Target Stage (*)</label>
                <select
                  id="targetStageSelect"
                  defaultValue={moveModalCandidate.currentStage}
                  className="h-10 w-full rounded-xl border border-[#D7DEE8] bg-[#F8FAFC] px-3 text-xs font-semibold text-[#042C51] outline-none transition hover:border-[#FF5C28]/40 hover:bg-white focus:border-[#FF5C28] focus:bg-white focus:ring-4 focus:ring-[#FF5C28]/10"
                >
                  {BOARD_STAGES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-extrabold text-[#042C51] uppercase text-[10px] block mb-1">Movement Reason / Remarks (*)</label>
                <textarea
                  id="moveReasonText"
                  rows={3}
                  placeholder="Enter reason or remark for stage progression..."
                  className="w-full resize-none rounded-xl border border-[#D7DEE8] bg-[#F8FAFC] px-3 py-2 text-xs font-semibold leading-5 text-[#042C51] outline-none transition hover:border-[#FF5C28]/40 hover:bg-white focus:border-[#FF5C28] focus:bg-white focus:ring-4 focus:ring-[#FF5C28]/10"
                />
              </div>
            </div>
          </div>
        )}
      </CandidatePipelineModalShell>

      {/* 3. ASSESSMENT MODAL */}
      <CandidatePipelineModalShell
        isOpen={!!assessmentModalCandidate}
        onClose={() => setAssessmentModalCandidate(null)}
        title="Update Online Assessment"
        kicker="Online Assessment Record & Score Evaluation"
        maxWidth="max-w-lg"
        candidateInfo={
          assessmentModalCandidate
            ? {
                name: assessmentModalCandidate.name,
                email: assessmentModalCandidate.email,
                contactNumber: assessmentModalCandidate.contactNumber,
                candidateId: assessmentModalCandidate.candidateId,
                currentStage: assessmentModalCandidate.currentStage,
                prfStatus: assessmentModalCandidate.prfStatus,
                roleTitle: assessmentModalCandidate.roleTitle,
                account: assessmentModalCandidate.account,
              }
            : undefined
        }
      >
        {assessmentModalCandidate && (
          <form
            id="assessmentForm"
            onSubmit={(e) => {
              e.preventDefault();
              const form = e.target as HTMLFormElement;
              const statusVal = (form.elements.namedItem("assStatus") as HTMLSelectElement).value;
              const scoreVal = Number((form.elements.namedItem("assScore") as HTMLInputElement).value);
              const outcomeVal = (form.elements.namedItem("assOutcome") as HTMLSelectElement).value as "Assessment Fit" | "Assessment Not Fit" | "For Reassessment";
              const remarksVal = (form.elements.namedItem("assRemarks") as HTMLTextAreaElement).value;

              handleSaveAssessment(assessmentModalCandidate.id, outcomeVal, scoreVal, remarksVal, statusVal);
            }}
            className="space-y-4 text-xs"
          >
            {/* Assessment Status */}
            <div>
              <label className="font-extrabold text-[#042C51] uppercase text-[10px] block mb-1">
                ASSESSMENT STATUS <span className="text-rose-500">*</span>
              </label>
              <select
                name="assStatus"
                defaultValue={assessmentModalCandidate.assessmentStatus || "Taken"}
                className="h-10 w-full rounded-xl border border-[#D7DEE8] bg-[#F8FAFC] px-3 text-xs font-semibold text-[#042C51] outline-none transition hover:border-[#FF5C28]/40 hover:bg-white focus:border-[#FF5C28] focus:bg-white focus:ring-4 focus:ring-[#FF5C28]/10"
              >
                <option value="Taken">Taken</option>
                <option value="Not Taken">Not Taken</option>
                <option value="Pending / Sent">Pending / Sent</option>
                <option value="Waived">Waived</option>
              </select>
            </div>

            {/* Assessment Score */}
            <div>
              <label className="font-extrabold text-[#042C51] uppercase text-[10px] block mb-1">
                ASSESSMENT SCORE
              </label>
              <input
                type="number"
                name="assScore"
                id="assScoreInput"
                min={0}
                max={100}
                defaultValue={assessmentModalCandidate.assessmentScore || 85}
                placeholder="Enter score from 0 to 100"
                onChange={(e) => {
                  const val = Number(e.target.value);
                  const outcomeSelect = document.getElementById("assOutcomeSelect") as HTMLSelectElement;
                  if (outcomeSelect && !isNaN(val) && e.target.value !== "") {
                    if (val >= 80) {
                      outcomeSelect.value = "Assessment Fit";
                    } else if (val > 0) {
                      outcomeSelect.value = "Assessment Not Fit";
                    }
                  }
                }}
                className="h-10 w-full rounded-xl border border-[#D7DEE8] bg-[#F8FAFC] px-3 text-xs font-semibold tabular-nums text-[#042C51] outline-none transition hover:border-[#FF5C28]/40 hover:bg-white focus:border-[#FF5C28] focus:bg-white focus:ring-4 focus:ring-[#FF5C28]/10"
              />
              <p className="text-[10px] text-slate-500 font-medium mt-1">
                Enter the score first. The suggested result is selected automatically.
              </p>
            </div>

            {/* Assessment Result */}
            <div>
              <label className="font-extrabold text-[#042C51] uppercase text-[10px] block mb-1">
                ASSESSMENT RESULT <span className="text-rose-500">*</span>
              </label>
              <select
                name="assOutcome"
                id="assOutcomeSelect"
                defaultValue={assessmentModalCandidate.assessmentResult || "Assessment Fit"}
                className="h-10 w-full rounded-xl border border-[#D7DEE8] bg-[#F8FAFC] px-3 text-xs font-semibold text-[#042C51] outline-none transition hover:border-[#FF5C28]/40 hover:bg-white focus:border-[#FF5C28] focus:bg-white focus:ring-4 focus:ring-[#FF5C28]/10"
              >
                <option value="">Select assessment result</option>
                <option value="Assessment Fit">Assessment Fit</option>
                <option value="Assessment Not Fit">Assessment Not Fit</option>
                <option value="For Reassessment">For Reassessment</option>
              </select>
            </div>

            {/* Remarks */}
            <div>
              <label className="font-extrabold text-[#042C51] uppercase text-[10px] block mb-1">
                REMARKS
              </label>
              <textarea
                name="assRemarks"
                rows={3}
                defaultValue={assessmentModalCandidate.assessmentRemarks || ""}
                placeholder="Add assessment remarks..."
                className="w-full p-3 bg-[#F8FAFC] border border-slate-200 rounded-xl text-xs font-medium text-[#042C51] focus:outline-none focus:ring-2 focus:ring-[#042C51]"
              />
            </div>

            {/* Assessment Attachment */}
            <div>
              <label className="font-extrabold text-[#042C51] uppercase text-[10px] block mb-1">
                ASSESSMENT ATTACHMENT
              </label>
              <div className="p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 overflow-hidden">
                  <Paperclip className="w-4 h-4 text-slate-400 shrink-0" />
                  <span className="text-xs text-slate-600 font-medium truncate" id="fileNameDisplay">
                    No file chosen
                  </span>
                </div>
                <label className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-lg cursor-pointer transition-all shrink-0">
                  Choose File
                  <input
                    type="file"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      const display = document.getElementById("fileNameDisplay");
                      if (display && file) {
                        display.innerText = file.name;
                      }
                    }}
                  />
                </label>
              </div>
            </div>

            {/* Pipeline Stage Movement Notice */}
            <div className="p-3 bg-blue-50/80 border border-blue-200 rounded-xl flex items-start gap-2 text-blue-900">
              <ShieldCheck className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
              <div className="text-[11px] leading-snug">
                <strong className="font-bold">Pipeline Stage Gating:</strong> Saving results will systematically progress candidate from <span className="font-mono bg-blue-100 px-1 rounded">{assessmentModalCandidate.currentStage}</span> to the corresponding stage (<span className="font-semibold">Assessment Fit</span> or <span className="font-semibold">Drop-off</span>).
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
              <CandidateModalSecondaryButton onClick={() => setAssessmentModalCandidate(null)}>
                Cancel
              </CandidateModalSecondaryButton>
              <CandidateModalPrimaryButton
                type="submit"
                icon={<Check className="w-4 h-4 text-white" />}
              >
                Save Assessment
              </CandidateModalPrimaryButton>
            </div>
          </form>
        )}
      </CandidatePipelineModalShell>

      {/* 4. SCHEDULE INTERVIEW MODAL */}
      <CandidatePipelineModalShell
        isOpen={!!scheduleModalCandidate}
        onClose={() => setScheduleModalCandidate(null)}
        title="Schedule Candidate Interview"
        kicker="Interview Booking & Dispatch"
        maxWidth="max-w-md"
        candidateInfo={
          scheduleModalCandidate
            ? {
                name: scheduleModalCandidate.name,
                email: scheduleModalCandidate.email,
                contactNumber: scheduleModalCandidate.contactNumber,
                candidateId: scheduleModalCandidate.candidateId,
                currentStage: scheduleModalCandidate.currentStage,
                prfStatus: scheduleModalCandidate.prfStatus,
                roleTitle: scheduleModalCandidate.roleTitle,
                account: scheduleModalCandidate.account,
              }
            : undefined
        }
      >
        {scheduleModalCandidate && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const form = e.target as HTMLFormElement;
              const date = (form.elements.namedItem("intDate") as HTMLInputElement).value;
              const type = (form.elements.namedItem("intType") as HTMLSelectElement).value as "Online" | "Face-to-face";
              const link = (form.elements.namedItem("intLink") as HTMLInputElement).value;
              const notes = (form.elements.namedItem("intNotes") as HTMLTextAreaElement).value;

              handleScheduleInterview(scheduleModalCandidate.id, date, type, link, notes);
            }}
            className="space-y-3 text-xs"
          >
            <div>
              <label className="font-extrabold text-[#042C51] uppercase text-[10px] block mb-1">Interview Date & Time (*)</label>
              <input
                type="text"
                name="intDate"
                defaultValue={scheduleModalCandidate.interviewDate || "2026-08-14 11:00"}
                required
                className="h-10 w-full rounded-xl border border-[#D7DEE8] bg-[#F8FAFC] px-3 text-xs font-semibold tabular-nums text-[#042C51] outline-none transition hover:border-[#FF5C28]/40 hover:bg-white focus:border-[#FF5C28] focus:bg-white focus:ring-4 focus:ring-[#FF5C28]/10"
              />
            </div>

            <div>
              <label className="font-extrabold text-[#042C51] uppercase text-[10px] block mb-1">Interview Format (*)</label>
              <select name="intType" defaultValue={scheduleModalCandidate.interviewType || "Online"} className="h-10 w-full rounded-xl border border-[#D7DEE8] bg-[#F8FAFC] px-3 text-xs font-semibold text-[#042C51] outline-none transition hover:border-[#FF5C28]/40 hover:bg-white focus:border-[#FF5C28] focus:bg-white focus:ring-4 focus:ring-[#FF5C28]/10">
                <option value="Online">Online Video Call</option>
                <option value="Face-to-face">Face-to-face On-Site</option>
              </select>
            </div>

            <div>
              <label className="font-extrabold text-[#042C51] uppercase text-[10px] block mb-1">Meeting Link / On-Site Venue</label>
              <input
                type="text"
                name="intLink"
                defaultValue={scheduleModalCandidate.onlineInterviewLink || "https://meet.google.com/sibs-tech-int"}
                className="w-full px-3.5 py-2.5 bg-[#F8FAFC] border border-slate-200 rounded-xl text-xs font-mono focus:outline-none focus:ring-2 focus:ring-[#042C51]"
              />
            </div>

            <div>
              <label className="font-extrabold text-[#042C51] uppercase text-[10px] block mb-1">Interviewer Notes & Agenda</label>
              <textarea
                name="intNotes"
                rows={2}
                placeholder="Enter interview guidelines or focus topics..."
                className="w-full resize-none rounded-xl border border-[#D7DEE8] bg-[#F8FAFC] px-3 py-2 text-xs font-semibold leading-5 text-[#042C51] outline-none transition hover:border-[#FF5C28]/40 hover:bg-white focus:border-[#FF5C28] focus:bg-white focus:ring-4 focus:ring-[#FF5C28]/10"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
              <CandidateModalSecondaryButton onClick={() => setScheduleModalCandidate(null)}>
                Cancel
              </CandidateModalSecondaryButton>
              <CandidateModalPrimaryButton type="submit" icon={<Check className="w-4 h-4 text-white" />}>
                Save & Dispatch Invitation
              </CandidateModalPrimaryButton>
            </div>
          </form>
        )}
      </CandidatePipelineModalShell>

      {/* 5. OFFER DETAILS MODAL */}
      <CandidatePipelineModalShell
        isOpen={!!offerModalCandidate}
        onClose={() => setOfferModalCandidate(null)}
        title="Generate Job Offer"
        kicker="Employment Offer & Compensation Package"
        maxWidth="max-w-lg"
        candidateInfo={
          offerModalCandidate
            ? {
                name: offerModalCandidate.name,
                email: offerModalCandidate.email,
                contactNumber: offerModalCandidate.contactNumber,
                candidateId: offerModalCandidate.candidateId,
                currentStage: offerModalCandidate.currentStage,
                prfStatus: offerModalCandidate.prfStatus,
                roleTitle: offerModalCandidate.roleTitle,
                account: offerModalCandidate.account,
              }
            : undefined
        }
      >
        {offerModalCandidate && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const form = e.target as HTMLFormElement;
              const basic = Number((form.elements.namedItem("offBasic") as HTMLInputElement).value);
              const rate = Number((form.elements.namedItem("offRate") as HTMLInputElement).value);
              const date = (form.elements.namedItem("offDate") as HTMLInputElement).value;
              const role = (form.elements.namedItem("offRole") as HTMLInputElement).value;
              const acc = (form.elements.namedItem("offAcc") as HTMLInputElement).value;

              handleSaveOffer(offerModalCandidate.id, {
                basicPay: basic,
                deminimisDailyRate: rate,
                startDate: date,
                roleTitle: role,
                account: acc,
                hiringRequirementId: "REQ-2026-090",
                approvalStatus: "Approved",
                decision: "Pending"
              });
            }}
            className="space-y-3 text-xs"
          >
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-extrabold text-[#042C51] uppercase text-[10px] block mb-1">Monthly Basic Pay (₱)</label>
                <input
                  type="number"
                  name="offBasic"
                  defaultValue={offerModalCandidate.offerDetails?.basicPay || 24000}
                  required
                  className="h-10 w-full rounded-xl border border-[#D7DEE8] bg-[#F8FAFC] px-3 text-xs font-semibold tabular-nums text-[#042C51] outline-none transition hover:border-[#FF5C28]/40 hover:bg-white focus:border-[#FF5C28] focus:bg-white focus:ring-4 focus:ring-[#FF5C28]/10"
                />
              </div>
              <div>
                <label className="font-extrabold text-[#042C51] uppercase text-[10px] block mb-1">Daily De Minimis Rate (₱)</label>
                <input
                  type="number"
                  name="offRate"
                  defaultValue={offerModalCandidate.offerDetails?.deminimisDailyRate || 150}
                  required
                  className="h-10 w-full rounded-xl border border-[#D7DEE8] bg-[#F8FAFC] px-3 text-xs font-semibold tabular-nums text-[#042C51] outline-none transition hover:border-[#FF5C28]/40 hover:bg-white focus:border-[#FF5C28] focus:bg-white focus:ring-4 focus:ring-[#FF5C28]/10"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-extrabold text-[#042C51] uppercase text-[10px] block mb-1">Target Start Date</label>
                <input
                  type="date"
                  name="offDate"
                  defaultValue={offerModalCandidate.offerDetails?.startDate || "2026-08-25"}
                  required
                  className="h-10 w-full rounded-xl border border-[#D7DEE8] bg-[#F8FAFC] px-3 text-xs font-semibold text-[#042C51] outline-none transition hover:border-[#FF5C28]/40 hover:bg-white focus:border-[#FF5C28] focus:bg-white focus:ring-4 focus:ring-[#FF5C28]/10"
                />
              </div>
              <div>
                <label className="font-extrabold text-[#042C51] uppercase text-[10px] block mb-1">Account Client</label>
                <input
                  type="text"
                  name="offAcc"
                  defaultValue={offerModalCandidate.account}
                  required
                  className="h-10 w-full rounded-xl border border-[#D7DEE8] bg-[#F8FAFC] px-3 text-xs font-semibold text-[#042C51] outline-none transition hover:border-[#FF5C28]/40 hover:bg-white focus:border-[#FF5C28] focus:bg-white focus:ring-4 focus:ring-[#FF5C28]/10"
                />
              </div>
            </div>

            <div>
              <label className="font-extrabold text-[#042C51] uppercase text-[10px] block mb-1">Job Designation Title</label>
              <input
                type="text"
                name="offRole"
                defaultValue={offerModalCandidate.roleTitle}
                required
                className="h-10 w-full rounded-xl border border-[#D7DEE8] bg-[#F8FAFC] px-3 text-xs font-semibold text-[#042C51] outline-none transition hover:border-[#FF5C28]/40 hover:bg-white focus:border-[#FF5C28] focus:bg-white focus:ring-4 focus:ring-[#FF5C28]/10"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
              <CandidateModalSecondaryButton onClick={() => setOfferModalCandidate(null)}>
                Cancel
              </CandidateModalSecondaryButton>
              <CandidateModalPrimaryButton type="submit" icon={<Check className="w-4 h-4 text-white" />}>
                Issue Job Offer Letter
              </CandidateModalPrimaryButton>
            </div>
          </form>
        )}
      </CandidatePipelineModalShell>

      {/* 6. REVISED OFFER MODAL */}
      <CandidatePipelineModalShell
        isOpen={!!(revisedOfferCandidate && revisedOfferCandidate.offerDetails)}
        onClose={() => setRevisedOfferCandidate(null)}
        title="Revise Compensation Package"
        kicker="Salary Negotiation & Revised Offer"
        maxWidth="max-w-md"
        candidateInfo={
          revisedOfferCandidate
            ? {
                name: revisedOfferCandidate.name,
                email: revisedOfferCandidate.email,
                contactNumber: revisedOfferCandidate.contactNumber,
                candidateId: revisedOfferCandidate.candidateId,
                currentStage: revisedOfferCandidate.currentStage,
                prfStatus: revisedOfferCandidate.prfStatus,
                roleTitle: revisedOfferCandidate.roleTitle,
                account: revisedOfferCandidate.account,
              }
            : undefined
        }
      >
        {revisedOfferCandidate && revisedOfferCandidate.offerDetails && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const form = e.target as HTMLFormElement;
              const newBasic = Number((form.elements.namedItem("revBasic") as HTMLInputElement).value);
              const newRate = Number((form.elements.namedItem("revRate") as HTMLInputElement).value);
              const remarks = (form.elements.namedItem("revRemarks") as HTMLTextAreaElement).value;

              handleSaveRevisedOffer(revisedOfferCandidate.id, newBasic, newRate, remarks);
            }}
            className="space-y-3 text-xs"
          >
            <div>
              <label className="font-extrabold text-[#042C51] uppercase text-[10px] block mb-1">New Monthly Basic Pay (₱)</label>
              <input
                type="number"
                name="revBasic"
                defaultValue={revisedOfferCandidate.offerDetails.basicPay + 1500}
                required
                className="h-10 w-full rounded-xl border border-[#D7DEE8] bg-[#F8FAFC] px-3 text-xs font-semibold tabular-nums text-[#042C51] outline-none transition hover:border-[#FF5C28]/40 hover:bg-white focus:border-[#FF5C28] focus:bg-white focus:ring-4 focus:ring-[#FF5C28]/10"
              />
            </div>

            <div>
              <label className="font-extrabold text-[#042C51] uppercase text-[10px] block mb-1">New Daily De Minimis Rate (₱)</label>
              <input
                type="number"
                name="revRate"
                defaultValue={revisedOfferCandidate.offerDetails.deminimisDailyRate}
                required
                className="h-10 w-full rounded-xl border border-[#D7DEE8] bg-[#F8FAFC] px-3 text-xs font-semibold tabular-nums text-[#042C51] outline-none transition hover:border-[#FF5C28]/40 hover:bg-white focus:border-[#FF5C28] focus:bg-white focus:ring-4 focus:ring-[#FF5C28]/10"
              />
            </div>

            <div>
              <label className="font-extrabold text-[#042C51] uppercase text-[10px] block mb-1">Revision Reason / Remarks (*)</label>
              <textarea
                name="revRemarks"
                rows={2}
                required
                placeholder="Enter salary negotiation justification..."
                className="w-full resize-none rounded-xl border border-[#D7DEE8] bg-[#F8FAFC] px-3 py-2 text-xs font-semibold leading-5 text-[#042C51] outline-none transition hover:border-[#FF5C28]/40 hover:bg-white focus:border-[#FF5C28] focus:bg-white focus:ring-4 focus:ring-[#FF5C28]/10"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
              <CandidateModalSecondaryButton onClick={() => setRevisedOfferCandidate(null)}>
                Cancel
              </CandidateModalSecondaryButton>
              <CandidateModalPrimaryButton type="submit" icon={<Check className="w-4 h-4 text-white" />}>
                Submit Revised Offer
              </CandidateModalPrimaryButton>
            </div>
          </form>
        )}
      </CandidatePipelineModalShell>

      {/* 7. NHO PRE-EMPLOYMENT UPLOAD & SCHEDULE MODAL */}
      <CandidatePipelineModalShell
        isOpen={!!nhoModalCandidate}
        onClose={() => setNhoModalCandidate(null)}
        title="NHO Pre-Employment Tracker"
        kicker="Onboarding Requirements & Orientation Schedule"
        maxWidth="max-w-xl"
        candidateInfo={
          nhoModalCandidate
            ? {
                name: nhoModalCandidate.name,
                email: nhoModalCandidate.email,
                contactNumber: nhoModalCandidate.contactNumber,
                candidateId: nhoModalCandidate.candidateId,
                currentStage: nhoModalCandidate.currentStage,
                prfStatus: nhoModalCandidate.prfStatus,
                roleTitle: nhoModalCandidate.roleTitle,
                account: nhoModalCandidate.account,
              }
            : undefined
        }
      >
        {nhoModalCandidate && (
          <div className="space-y-4 text-xs">
            <div className="space-y-3">
              <div>
                <label className="font-extrabold text-[#042C51] uppercase text-[10px] block mb-1">Scheduled NHO Orientation Date</label>
                <input
                  id="nhoDateInput"
                  type="date"
                  defaultValue={nhoModalCandidate.nhoScheduleDate || "2026-08-18"}
                  className="h-10 w-full rounded-xl border border-[#D7DEE8] bg-[#F8FAFC] px-3 text-xs font-semibold text-[#042C51] outline-none transition hover:border-[#FF5C28]/40 hover:bg-white focus:border-[#FF5C28] focus:bg-white focus:ring-4 focus:ring-[#FF5C28]/10"
                />
              </div>

              <div className="space-y-2">
                <span className="font-extrabold text-[#042C51] uppercase text-[10px] block">5 Major Requirements Checklist</span>
                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                  {(nhoModalCandidate.nhoFiles || [
                    { id: "f1", name: "TOR / Diploma", category: "TOR / Diploma", status: "Submitted", isMajorRequirement: true },
                    { id: "f2", name: "NBI Clearance", category: "NBI Clearance", status: "Submitted", isMajorRequirement: true },
                    { id: "f3", name: "Medical Check", category: "Medical Check", status: "Pending", isMajorRequirement: true },
                    { id: "f4", name: "Birth Certificate", category: "Birth Certificate", status: "Submitted", isMajorRequirement: true },
                    { id: "f5", name: "Valid Government ID", category: "Valid ID", status: "Submitted", isMajorRequirement: true }
                  ]).map((file) => (
                    <div key={file.id} className="p-2.5 bg-[#F8FAFC] rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-slate-400" />
                        <span className="font-bold text-slate-800">{file.name}</span>
                        {file.isMajorRequirement && (
                          <span className="text-[9px] bg-rose-100 text-rose-700 font-black px-1.5 py-0.2 rounded uppercase">Major</span>
                        )}
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                        file.status === "Submitted" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                      }`}>
                        {file.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
              <CandidateModalSecondaryButton onClick={() => setNhoModalCandidate(null)}>
                Cancel
              </CandidateModalSecondaryButton>
              <CandidateModalPrimaryButton
                onClick={() => {
                  const date = (document.getElementById("nhoDateInput") as HTMLInputElement)?.value;
                  handleSaveNhoDetails(nhoModalCandidate.id, date, nhoModalCandidate.nhoFiles || []);
                }}
                icon={<Check className="w-4 h-4 text-white" />}
              >
                Save NHO Details
              </CandidateModalPrimaryButton>
            </div>
          </div>
        )}
      </CandidatePipelineModalShell>

      {/* 8. DROP-OFF MODAL */}
      <CandidatePipelineModalShell
        isOpen={!!dropOffModalCandidate}
        onClose={() => setDropOffModalCandidate(null)}
        title="Mark Drop-off Candidate"
        kicker="Disqualification / Candidate Withdrawal"
        maxWidth="max-w-md"
        candidateInfo={
          dropOffModalCandidate
            ? {
                name: dropOffModalCandidate.name,
                email: dropOffModalCandidate.email,
                contactNumber: dropOffModalCandidate.contactNumber,
                candidateId: dropOffModalCandidate.candidateId,
                currentStage: dropOffModalCandidate.currentStage,
                prfStatus: dropOffModalCandidate.prfStatus,
                roleTitle: dropOffModalCandidate.roleTitle,
                account: dropOffModalCandidate.account,
              }
            : undefined
        }
      >
        {dropOffModalCandidate && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const form = e.target as HTMLFormElement;
              const reason = (form.elements.namedItem("doReason") as HTMLInputElement).value;
              const cat = (form.elements.namedItem("doCat") as HTMLSelectElement).value;
              const remarks = (form.elements.namedItem("doRemarks") as HTMLTextAreaElement).value;
              handleSaveDropOff(dropOffModalCandidate.id, reason, cat, remarks);
            }}
            className="space-y-3 text-xs"
          >
            <div>
              <label className="font-extrabold text-[#042C51] uppercase text-[10px] block mb-1">Drop-off Category (*)</label>
              <select name="doCat" className="h-10 w-full rounded-xl border border-[#D7DEE8] bg-[#F8FAFC] px-3 text-xs font-semibold text-[#042C51] outline-none transition hover:border-[#FF5C28]/40 hover:bg-white focus:border-[#FF5C28] focus:bg-white focus:ring-4 focus:ring-[#FF5C28]/10">
                <option value="Competitor Offer">Competitor Offer</option>
                <option value="Failed Assessment">Failed Assessment</option>
                <option value="Failed Interview">Failed Interview</option>
                <option value="Unreachable / No Show">Unreachable / No Show</option>
                <option value="Salary Mismatch">Salary Mismatch</option>
              </select>
            </div>

            <div>
              <label className="font-extrabold text-[#042C51] uppercase text-[10px] block mb-1">Specific Reason (*)</label>
              <input
                type="text"
                name="doReason"
                required
                placeholder="e.g. Accepted alternative job offer"
                className="h-10 w-full rounded-xl border border-[#D7DEE8] bg-[#F8FAFC] px-3 text-xs font-semibold text-[#042C51] outline-none transition hover:border-[#FF5C28]/40 hover:bg-white focus:border-[#FF5C28] focus:bg-white focus:ring-4 focus:ring-[#FF5C28]/10"
              />
            </div>

            <div>
              <label className="font-extrabold text-[#042C51] uppercase text-[10px] block mb-1">Context Remarks</label>
              <textarea
                name="doRemarks"
                rows={2}
                placeholder="Enter additional recruiter remarks..."
                className="w-full resize-none rounded-xl border border-[#D7DEE8] bg-[#F8FAFC] px-3 py-2 text-xs font-semibold leading-5 text-[#042C51] outline-none transition hover:border-[#FF5C28]/40 hover:bg-white focus:border-[#FF5C28] focus:bg-white focus:ring-4 focus:ring-[#FF5C28]/10"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
              <CandidateModalSecondaryButton onClick={() => setDropOffModalCandidate(null)}>
                Cancel
              </CandidateModalSecondaryButton>
              <CandidateModalPrimaryButton type="submit" variant="red" icon={<UserX className="w-4 h-4" />}>
                Mark as Drop-off
              </CandidateModalPrimaryButton>
            </div>
          </form>
        )}
      </CandidatePipelineModalShell>

      {/* CONFIRM ACTION MODAL */}
      <CandidatePipelineModalShell
        isOpen={!!confirmActionModal}
        onClose={() => setConfirmActionModal(null)}
        title="Confirm Stage Advancement"
        kicker="Candidate Pipeline Advancement"
        maxWidth="max-w-md"
        candidateInfo={
          confirmActionModal
            ? {
                name: confirmActionModal.candidate.name,
                email: confirmActionModal.candidate.email,
                contactNumber: confirmActionModal.candidate.contactNumber,
                candidateId: confirmActionModal.candidate.candidateId,
                currentStage: confirmActionModal.candidate.currentStage,
                prfStatus: confirmActionModal.candidate.prfStatus,
                roleTitle: confirmActionModal.candidate.roleTitle,
                account: confirmActionModal.candidate.account,
              }
            : undefined
        }
        footer={
          <div className="flex items-center justify-end gap-2.5 w-full">
            <CandidateModalSecondaryButton onClick={() => setConfirmActionModal(null)}>
              Cancel
            </CandidateModalSecondaryButton>
            <CandidateModalPrimaryButton
              onClick={() => {
                if (!confirmActionModal) return;
                handleMoveStage(
                  confirmActionModal.candidate.id,
                  confirmActionModal.targetStage,
                  `Candidate moved from ${confirmActionModal.candidate.currentStage}.`
                );
                showBanner(`Moved ${confirmActionModal.candidate.name} to ${confirmActionModal.targetStage}.`);
                setConfirmActionModal(null);
              }}
              icon={<ArrowRight className="w-3.5 h-3.5 text-white" />}
            >
              Proceed
            </CandidateModalPrimaryButton>
          </div>
        }
      >
        {confirmActionModal && (
          <p className="text-xs text-slate-600 font-medium leading-relaxed">
            Advance <strong className="text-[#042C51]">{confirmActionModal.candidate.name}</strong> from{" "}
            <strong className="text-[#042C51]">{confirmActionModal.candidate.currentStage}</strong> to{" "}
            <strong className="text-[#FF5C28]">{confirmActionModal.targetStage}</strong>?
          </p>
        )}
      </CandidatePipelineModalShell>

      {/* CANCEL INTERVIEW MODAL */}
      <CandidatePipelineModalShell
        isOpen={!!cancelInterviewModalCandidate}
        onClose={() => setCancelInterviewModalCandidate(null)}
        title="Cancel Interview Session"
        kicker="Interview Cancellation"
        maxWidth="max-w-md"
        candidateInfo={
          cancelInterviewModalCandidate
            ? {
                name: cancelInterviewModalCandidate.name,
                email: cancelInterviewModalCandidate.email,
                contactNumber: cancelInterviewModalCandidate.contactNumber,
                candidateId: cancelInterviewModalCandidate.candidateId,
                currentStage: cancelInterviewModalCandidate.currentStage,
                prfStatus: cancelInterviewModalCandidate.prfStatus,
                roleTitle: cancelInterviewModalCandidate.roleTitle,
                account: cancelInterviewModalCandidate.account,
              }
            : undefined
        }
        footer={
          <div className="flex items-center justify-end gap-2 w-full">
            <CandidateModalSecondaryButton onClick={() => setCancelInterviewModalCandidate(null)}>
              Keep Interview
            </CandidateModalSecondaryButton>
            <CandidateModalPrimaryButton
              onClick={() => {
                if (!cancelInterviewModalCandidate) return;
                handleCancelInterview(cancelInterviewModalCandidate.id);
              }}
              variant="red"
              icon={<X className="w-4 h-4" />}
            >
              Confirm Cancellation
            </CandidateModalPrimaryButton>
          </div>
        }
      >
        {cancelInterviewModalCandidate && (
          <p className="text-xs text-slate-600 font-medium leading-relaxed">
            This action will mark the interview session scheduled for{" "}
            <strong className="text-[#042C51]">{cancelInterviewModalCandidate.interviewDate || "Scheduled Session"}</strong> as cancelled.
            The candidate will remain in the pipeline unless marked as Drop-off separately.
          </p>
        )}
      </CandidatePipelineModalShell>
    </div>
  );
}
