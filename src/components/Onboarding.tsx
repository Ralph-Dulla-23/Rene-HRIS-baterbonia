import React, { useState, useMemo, useEffect } from "react";
import {
  UserCheck,
  Search,
  Filter,
  RefreshCw,
  Plus,
  Eye,
  CheckCircle,
  CheckCircle2,
  XCircle,
  FileText,
  User,
  Calendar,
  AlertCircle,
  ChevronRight,
  TrendingUp,
  X,
  Info,
  Clock,
  Briefcase,
  Layers,
  ArrowRight,
  Sparkles,
  Award,
  BookOpen,
  Settings,
  MoreVertical,
  Check,
  Star,
  Building2,
  MapPin,
  ExternalLink,
  UserPlus,
  AlertTriangle,
  ArrowUpRight,
  ShieldCheck,
  Users
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useJourney } from "./journey/JourneyContext";
import OnboardingDetailsModal from "./onboarding/OnboardingDetailsModal";
import BenchmarkView from "./journey/views/BenchmarkView";
import Review306090Modal from "./journey/views/Review306090Modal";
import ESEPCoachingTabView from "./journey/views/ESEPCoachingTabView";

// ==========================================
// STORAGE KEYS FOR CROSS-MODULE SYNC
// ==========================================
export const ONBOARDING_STORAGE_KEY = "onboarding_records_data";
export const OFFERS_STORAGE_KEY = "offers_management_data";
export const PIPELINE_CANDIDATES_STORAGE_KEY = "pipeline_candidates_data";
export const EMPLOYEE_DIRECTORY_STORAGE_KEY = "employee_directory_records";
export const TALENT_POOL_STORAGE_KEY = "talent_pool_records";
export const PIPELINE_SYNC_EVENTS_KEY = "pipeline_sync_events";

export const ONBOARDING_STAGES = [
  "Offer Accepted / Pre-Boarding",
  "Document Clearance",
  "NHO Orientation",
  "IT & Workstation Provisioning",
  "Day 1 - Handed Off to Training",
  "Completed Onboarding",
  "No Show",
  "Pre-start Withdrawal",
] as const;

export type OnboardingStageType = typeof ONBOARDING_STAGES[number];

interface OnboardingProps {
  userEmail?: string;
  onSwitchModule?: (module: string) => void;
  initialTab?: "records" | "30-60-90" | "coaching";
}

export interface OnboardingRecord {
  id: string; // Onboarding ID (e.g. ONB-2026-001 or ONB-000142)
  name: string;
  email: string;
  phone: string;
  role: string;
  account: string;
  siteLocation: string; // e.g. Davao City, Manila (Ortigas), Manila (BGC), Cebu IT Park, Clark
  offerAcceptedDate: string;
  expectedStartDate: string;
  actualStartDate?: string;
  daysToStart?: number; // Pre-start calculation
  onboardingStage?: OnboardingStageType | string;
  showStatus?: "Pending" | "Show" | "No Show" | "Withdrawn";
  finalOutcome?: "Pending Start" | "True Hire" | "No Show" | "Pre-start Withdrawal";
  handoffStatus?: string;
  assessmentStatus?: string;
  coachingStatus?: string;
  owner: string; // Recruiter/Owner
  feedbackRating?: number; // 1 to 5 stars
  withdrawalReason?: string;
  withdrawalNotes?: string;
  convertedEmployeeId?: string; // SIB-2026-XXX or SIBS-XXXX ID when converted
  auditTrail: { date: string; action: string; user: string }[];
}

export function getRecordOnboardingStage(record: OnboardingRecord): string {
  if (record.onboardingStage) return record.onboardingStage;
  if (record.finalOutcome === "True Hire") return "Completed Onboarding";
  if (record.finalOutcome === "No Show" || record.showStatus === "No Show") return "No Show";
  if (record.finalOutcome === "Pre-start Withdrawal" || record.showStatus === "Withdrawn") return "Pre-start Withdrawal";
  if (record.showStatus === "Show" || record.actualStartDate) return "Day 1 - Handed Off to Training";
  if (record.daysToStart && record.daysToStart > 12) return "Offer Accepted / Pre-Boarding";
  if (record.daysToStart && record.daysToStart > 5) return "Document Clearance";
  return "NHO Orientation";
}

export function getOnboardingStageBadgeClass(stage: string) {
  switch (stage) {
    case "Offer Accepted / Pre-Boarding":
      return "border-blue-200 bg-blue-50 text-blue-800";
    case "Document Clearance":
      return "border-cyan-200 bg-cyan-50 text-cyan-800";
    case "NHO Orientation":
      return "border-purple-200 bg-purple-50 text-purple-800";
    case "IT & Workstation Provisioning":
      return "border-indigo-200 bg-indigo-50 text-indigo-800";
    case "Day 1 - Handed Off to Training":
      return "border-amber-200 bg-amber-50 text-amber-900";
    case "Completed Onboarding":
      return "border-emerald-200 bg-emerald-50 text-emerald-800";
    case "No Show":
      return "border-rose-200 bg-rose-50 text-rose-800";
    case "Pre-start Withdrawal":
      return "border-orange-200 bg-orange-50 text-orange-800";
    default:
      return "border-slate-200 bg-slate-50 text-slate-700";
  }
}

const INITIAL_ONBOARDING_RECORDS: OnboardingRecord[] = [
  {
    id: "ONB-2026-001",
    name: "Theresa Mae Santos",
    email: "theresa.mae@outlook.com",
    phone: "+63 917 554 1234",
    role: "Healthcare Support Specialist",
    account: "Elevance Health",
    siteLocation: "SiBS Davao",
    offerAcceptedDate: "2026-07-16",
    expectedStartDate: "2026-08-01",
    daysToStart: 16,
    onboardingStage: "Offer Accepted / Pre-Boarding",
    handoffStatus: "Pending Day 1 Handoff",
    assessmentStatus: "Pre-hire Requirements",
    coachingStatus: "None Required",
    showStatus: "Pending",
    finalOutcome: "Pending Start",
    owner: "Alena Batacan",
    feedbackRating: 5,
    auditTrail: [
      { date: "2026-07-16", action: "Imported from Candidate Pipeline (Offer Accepted)", user: "System" },
      { date: "2026-07-17", action: "Initial pre-employment welcome kit dispatched.", user: "Alena Batacan" }
    ]
  },
  {
    id: "ONB-2026-002",
    name: "Kenji Sato",
    email: "kenji.sato@gmail.com",
    phone: "+63 908 443 8910",
    role: "Customer Service Representative",
    account: "Chevron Support",
    siteLocation: "SiBS Tagum",
    offerAcceptedDate: "2026-07-15",
    expectedStartDate: "2026-07-27",
    daysToStart: 12,
    onboardingStage: "Document Clearance",
    handoffStatus: "Scheduled for Day 1 Handoff",
    assessmentStatus: "Orientation Pending",
    coachingStatus: "None Required",
    showStatus: "Pending",
    finalOutcome: "Pending Start",
    owner: "Juan dela Cruz",
    feedbackRating: 4,
    auditTrail: [
      { date: "2026-07-15", action: "Imported from Candidate Pipeline (Offer Accepted)", user: "System" },
      { date: "2026-07-18", action: "Pre-employment medical clearance completed.", user: "Juan dela Cruz" }
    ]
  },
  {
    id: "ONB-2026-007",
    name: "Alyssa Rivera",
    email: "alyssa.rivera@thesiblingssolutions.com",
    phone: "+63 917 111 2233",
    role: "Customer Support Advocate",
    account: "US Visa",
    siteLocation: "SiBS Davao",
    offerAcceptedDate: "2026-09-18",
    expectedStartDate: "2026-09-19",
    actualStartDate: "2026-09-19",
    daysToStart: 1,
    onboardingStage: "Day 1 - Handed Off to Training",
    handoffStatus: "Day 30 Handoff to TL Due",
    assessmentStatus: "FST 84% • PST 88% (Passed)",
    coachingStatus: "None Required",
    showStatus: "Show",
    finalOutcome: "True Hire",
    owner: "Jenna Villanueva",
    convertedEmployeeId: "SIBS-2901",
    feedbackRating: 5,
    auditTrail: [
      { date: "2026-09-18", action: "NHO clearance completed. Dispatched to L&D Nesting.", user: "Jenna Villanueva" },
      { date: "2026-09-19", action: "Reported Day 1. Handed off to Trainer Maria Cruz.", user: "Jenna Villanueva" },
      { date: "2026-10-14", action: "Day 30 Checkpoint reached. Notification generated for TL Handoff.", user: "System" }
    ]
  },
  {
    id: "ONB-2026-008",
    name: "Nica Flores",
    email: "nica.flores@thesiblingssolutions.com",
    phone: "+63 919 222 3344",
    role: "Customer Care Specialist",
    account: "Customer Care",
    siteLocation: "SiBS Mabini",
    offerAcceptedDate: "2026-07-28",
    expectedStartDate: "2026-08-01",
    actualStartDate: "2026-08-01",
    daysToStart: 4,
    onboardingStage: "Completed Onboarding",
    handoffStatus: "Handoff to TL Complete (Anton Reyes)",
    assessmentStatus: "FST 71% • PST 66%",
    coachingStatus: "Coaching: Active (Pacing & Empathy)",
    showStatus: "Show",
    finalOutcome: "True Hire",
    owner: "Alena Batacan",
    convertedEmployeeId: "SIBS-2903",
    feedbackRating: 4,
    auditTrail: [
      { date: "2026-08-01", action: "Completed Day 1 Induction. Handed off to Trainer Kim Ramos.", user: "Alena Batacan" },
      { date: "2026-08-30", action: "Day 30 handoff accepted by Anton Reyes.", user: "Anton Reyes" }
    ]
  },
  {
    id: "ONB-2026-009",
    name: "Kenneth Dizon",
    email: "kenneth.dizon@thesiblingssolutions.com",
    phone: "+63 928 333 4455",
    role: "Technical Support Associate",
    account: "Chevron Support",
    siteLocation: "SiBS Tagum",
    offerAcceptedDate: "2026-08-15",
    expectedStartDate: "2026-08-25",
    actualStartDate: "2026-08-25",
    daysToStart: 10,
    onboardingStage: "Completed Onboarding",
    handoffStatus: "Handoff to TL Complete",
    assessmentStatus: "FST 65% • PST 68% (PST Needs Support)",
    coachingStatus: "Coaching: Action Required (Escalated)",
    showStatus: "Show",
    finalOutcome: "True Hire",
    owner: "Juan dela Cruz",
    convertedEmployeeId: "SIBS-2906",
    feedbackRating: 3,
    auditTrail: [
      { date: "2026-08-25", action: "Day 1 completed. Transferred to Nesting.", user: "Juan dela Cruz" },
      { date: "2026-09-24", action: "Day 30 Checkpoint identified QA drop. Coaching action initiated.", user: "Kim Ramos" }
    ]
  },
  {
    id: "ONB-2026-010",
    name: "Joshua Lee",
    email: "joshua.lee@thesiblingssolutions.com",
    phone: "+63 939 444 5566",
    role: "Operations Specialist",
    account: "Fintech Support",
    siteLocation: "SiBS Davao",
    offerAcceptedDate: "2026-07-10",
    expectedStartDate: "2026-07-15",
    actualStartDate: "2026-07-15",
    daysToStart: 5,
    onboardingStage: "Completed Onboarding",
    handoffStatus: "Handoff to TL Complete",
    assessmentStatus: "FST 83% • PST 89% (Passed)",
    coachingStatus: "Coaching: Passed (Goal Met)",
    showStatus: "Show",
    finalOutcome: "True Hire",
    owner: "Alena Batacan",
    convertedEmployeeId: "SIBS-2904",
    feedbackRating: 5,
    auditTrail: [
      { date: "2026-07-15", action: "Day 1 Induction verified.", user: "Alena Batacan" },
      { date: "2026-08-14", action: "Day 30 Handoff endorsed to Anton Reyes.", user: "Kim Ramos" },
      { date: "2026-09-20", action: "Coaching session completed with Goal Met status.", user: "Kim Ramos" }
    ]
  },
  {
    id: "ONB-2026-003",
    name: "John Raymond Doe",
    email: "jr.doe@gmail.com",
    phone: "+63 915 221 4590",
    role: "Customer Service Representative",
    account: "Citi Global",
    siteLocation: "SiBS Mabini",
    offerAcceptedDate: "2026-07-10",
    expectedStartDate: "2026-07-18",
    actualStartDate: "2026-07-18",
    daysToStart: 8,
    onboardingStage: "Completed Onboarding",
    handoffStatus: "Handed Off to Training",
    assessmentStatus: "FST Passed (86%)",
    coachingStatus: "None Required",
    showStatus: "Show",
    finalOutcome: "True Hire",
    owner: "Alena Batacan",
    convertedEmployeeId: "SIB-2026-088",
    feedbackRating: 5,
    auditTrail: [
      { date: "2026-07-10", action: "Imported from Candidate Pipeline (Offer Accepted)", user: "System" },
      { date: "2026-07-15", action: "Completed company-wide Day 1 induction.", user: "Alena Batacan" },
      { date: "2026-07-18", action: "Logged actual start. Converted to active employee #SIB-2026-088 in Employee Directory.", user: "Alena Batacan" }
    ]
  },
  {
    id: "ONB-2026-004",
    name: "Mary Cruz Alcantara",
    email: "mary_cruz99@outlook.ph",
    phone: "+63 918 332 7711",
    role: "Customer Service Representative",
    account: "Capital One Help",
    siteLocation: "SiBS Tagum",
    offerAcceptedDate: "2026-07-08",
    expectedStartDate: "2026-07-15",
    daysToStart: 7,
    onboardingStage: "No Show",
    handoffStatus: "No Show (Archived)",
    assessmentStatus: "N/A",
    coachingStatus: "N/A",
    showStatus: "No Show",
    finalOutcome: "No Show",
    owner: "Maria Santos",
    feedbackRating: 2,
    withdrawalReason: "Compensation Gap / Counter Offer",
    withdrawalNotes: "Candidate accepted another offer providing work-from-home allowance.",
    auditTrail: [
      { date: "2026-07-08", action: "Imported from Candidate Pipeline (Offer Accepted)", user: "System" },
      { date: "2026-07-15", action: "Failed to attend Day 1 orientation. Archived to Talent Pool.", user: "Maria Santos" }
    ]
  },
  {
    id: "ONB-2026-005",
    name: "Daniel Padilla Flores",
    email: "daniel_flores@live.com",
    phone: "+63 920 448 9912",
    role: "Healthcare Support Specialist",
    account: "Elevance Health",
    siteLocation: "Davao City",
    offerAcceptedDate: "2026-07-05",
    expectedStartDate: "2026-07-15",
    actualStartDate: "2026-07-15",
    daysToStart: 10,
    onboardingStage: "Day 1 - Handed Off to Training",
    handoffStatus: "Handed Off to Training",
    assessmentStatus: "FST In Progress (78%)",
    coachingStatus: "None Required",
    showStatus: "Show",
    finalOutcome: "True Hire",
    owner: "Juan dela Cruz",
    convertedEmployeeId: "SIB-2026-092",
    feedbackRating: 5,
    auditTrail: [
      { date: "2026-07-05", action: "Imported from Candidate Pipeline (Offer Accepted)", user: "System" },
      { date: "2026-07-15", action: "Attended orientation. Converted to Employee Directory profile.", user: "Juan dela Cruz" }
    ]
  },
  {
    id: "ONB-2026-006",
    name: "Alex G. Rivera",
    email: "alex_rivera93@gmail.com",
    phone: "+63 936 881 1290",
    role: "Technical Support Associate",
    account: "RingCentral Team",
    siteLocation: "Clark, Pampanga",
    offerAcceptedDate: "2026-06-28",
    expectedStartDate: "2026-07-12",
    daysToStart: 14,
    onboardingStage: "Pre-start Withdrawal",
    handoffStatus: "Withdrawn Before Start",
    assessmentStatus: "N/A",
    coachingStatus: "N/A",
    showStatus: "Withdrawn",
    finalOutcome: "Pre-start Withdrawal",
    owner: "Alena Batacan",
    feedbackRating: 3,
    withdrawalReason: "Location / Commute Issues",
    withdrawalNotes: "Decided to accept a role closer to Manila residence due to transit limitations.",
    auditTrail: [
      { date: "2026-06-28", action: "Imported from Candidate Pipeline (Offer Accepted)", user: "System" },
      { date: "2026-07-05", action: "Candidate sent formal withdrawal email. Archived to Talent Pool.", user: "Alena Batacan" }
    ]
  }
];

function getInitials(name = "") {
  const parts = String(name || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (!parts.length) return "ON";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();

  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

function formatDisplayDate(value?: string) {
  if (!value) return "—";

  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleDateString("en-PH", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export interface UnifiedRosterItem {
  key: string;
  id: string;
  sibsId?: string;
  name: string;
  email?: string;
  phone?: string;
  role: string;
  account: string;
  siteLocation: string;
  onboardingRecord?: OnboardingRecord;
  offerAcceptedDate?: string;
  expectedStartDate?: string;
  actualStartDate?: string;
  onboardingStage: string;
  showStatus: string;
  finalOutcome: string;
  taOwner: string;
  matchingJourney?: any;
  assignedTrainer: string;
  assignedTL: string;
  handoffBadge: {
    label: string;
    tone: string;
    isAlert: boolean;
    key: string;
  };
  journeyPhase: string;
  daysElapsed: number;
  overallProgressPct: number;
  day30Score: number | null;
  day30Status: string;
  day60Score: number | null;
  day60Status: string;
  day90Score: number | null;
  day90Status: string;
  openActionsCount: number;
  reviewsDueCount: number;
}

export default function Onboarding({ 
  userEmail = "alena.batacan@thesiblingssolutions.com", 
  onSwitchModule,
  initialTab = "records"
}: OnboardingProps) {
  // Main Tab State: "records" (Onboarding Records) | "30-60-90" (30/60/90 Reviews) | "coaching" (ESEP GROW Coaching)
  const [activeMainTab, setActiveMainTab] = useState<"records" | "30-60-90" | "coaching">(initialTab);

  useEffect(() => {
    if (initialTab) {
      setActiveMainTab(initialTab);
    }
  }, [initialTab]);

  // Load initial onboarding records from localStorage or default
  const [records, setRecords] = useState<OnboardingRecord[]>(() => {
    try {
      const saved = localStorage.getItem(ONBOARDING_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn("Could not read onboarding records from localStorage", e);
    }
    return INITIAL_ONBOARDING_RECORDS;
  });

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const { 
    journeys, 
    selectedJourney, 
    setSelectedJourney, 
    pendingDay30HandoffsCount,
    phaseTrainingScores, 
    coachingActions 
  } = useJourney();

  // Search & Filtering State for Unified Roster
  const [searchTerm, setSearchTerm] = useState("");
  const [stageFilter, setStageFilter] = useState("All");
  const [journeyPhaseFilter, setJourneyPhaseFilter] = useState("All");
  const [accountFilter, setAccountFilter] = useState("All");
  const [locationFilter, setLocationFilter] = useState("All");
  const [ownerFilter, setOwnerFilter] = useState("All");
  const [trainerFilter, setTrainerFilter] = useState("All");
  const [actionFilter, setActionFilter] = useState("All");

  // Selected Record Details Modal State
  const [selectedRecord, setSelectedRecord] = useState<OnboardingRecord | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  // New Onboarding Form State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedAcceptedOfferId, setSelectedAcceptedOfferId] = useState<string>("");
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newRole, setNewRole] = useState("Customer Service Representative");
  const [newAccount, setNewAccount] = useState("Elevance Health");
  const [newSiteLocation, setNewSiteLocation] = useState("SiBS Tagum");
  const [newOfferAcceptedDate, setNewOfferAcceptedDate] = useState("2026-07-20");
  const [newExpectedStartDate, setNewExpectedStartDate] = useState("2026-08-01");
  const [newOwner, setNewOwner] = useState("Alena Batacan");

  // Pending Accepted Offers list (fetched from OFFERS_STORAGE_KEY or PIPELINE_CANDIDATES_STORAGE_KEY)
  const [pendingOffers, setPendingOffers] = useState<any[]>([]);

  // Outcome Workflow Modal State
  const [outcomeTargetRecord, setOutcomeTargetRecord] = useState<OnboardingRecord | null>(null);
  const [isOutcomeModalOpen, setIsOutcomeModalOpen] = useState(false);
  const [outcomeStage, setOutcomeStage] = useState<string>("Day 1 - Handed Off to Training");
  const [outcomeShowStatus, setOutcomeShowStatus] = useState<"Pending" | "Show" | "No Show" | "Withdrawn">("Show");
  const [outcomeActualDate, setOutcomeActualDate] = useState("2026-07-20");
  const [outcomeFeedbackRating, setOutcomeFeedbackRating] = useState<number>(5);
  const [outcomeWithdrawalReason, setOutcomeWithdrawalReason] = useState("Better compensation package elsewhere");
  const [outcomeWithdrawalNotes, setOutcomeWithdrawalNotes] = useState("");

  // Persist records to localStorage whenever updated
  useEffect(() => {
    try {
      localStorage.setItem(ONBOARDING_STORAGE_KEY, JSON.stringify(records));
    } catch (e) {
      console.warn("Error saving onboarding records to localStorage", e);
    }
  }, [records]);

  // Sync accepted offers from Offers / Pipeline
  useEffect(() => {
    const fetchAcceptedOffers = () => {
      try {
        const rawOffers = localStorage.getItem(OFFERS_STORAGE_KEY);
        if (rawOffers) {
          const parsedOffers = JSON.parse(rawOffers);
          if (Array.isArray(parsedOffers)) {
            const accepted = parsedOffers.filter(
              (o: any) => o.status === "Approved" || o.status === "Signed" || o.status === "Accepted"
            );
            setPendingOffers(prev => JSON.stringify(prev) === JSON.stringify(accepted) ? prev : accepted);
          }
        }
      } catch (err) {
        console.warn("Could not parse accepted offers:", err);
      }
    };

    fetchAcceptedOffers();
    window.addEventListener("storage", fetchAcceptedOffers);
    return () => window.removeEventListener("storage", fetchAcceptedOffers);
  }, []);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Helper values for unique recruiters/owners & locations
  const ownersList = useMemo(() => {
    const list = new Set<string>();
    records.forEach(r => list.add(r.owner));
    return ["All", ...Array.from(list)];
  }, [records]);

  const locationsList = useMemo(() => {
    const list = new Set<string>(["SiBS Tagum", "SiBS Davao", "SiBS Mabini"]);
    records.forEach(r => {
      if (r.siteLocation) list.add(r.siteLocation);
    });
    return ["All", ...Array.from(list)];
  }, [records]);

  // Calculations for Metrics Cards & Outcome Overview
  const metrics = useMemo(() => {
    const total = records.length;
    const trueHires = records.filter(r => r.finalOutcome === "True Hire").length;
    const pendingStart = records.filter(r => r.finalOutcome === "Pending Start").length;
    const noShow = records.filter(r => r.finalOutcome === "No Show").length;
    const withdrawal = records.filter(r => r.finalOutcome === "Pre-start Withdrawal").length;

    // Show Rate KPI % = (True Hires) / (True Hires + No Show + Pre-start Withdrawal)
    const totalResolved = trueHires + noShow + withdrawal;
    const showRate = totalResolved > 0 ? Math.round((trueHires / totalResolved) * 100) : 0;

    // Percentages for Outcome Analytics
    const trueHiresPct = total > 0 ? Math.round((trueHires / total) * 100) : 0;
    const pendingStartPct = total > 0 ? Math.round((pendingStart / total) * 100) : 0;
    const noShowPct = total > 0 ? Math.round((noShow / total) * 100) : 0;
    const withdrawalPct = total > 0 ? Math.round((withdrawal / total) * 100) : 0;

    // Average days to start calculation
    const recordsWithDays = records.filter(r => r.offerAcceptedDate && r.expectedStartDate);
    const avgDaysToStart = recordsWithDays.length > 0
      ? Math.round(
          recordsWithDays.reduce((acc, r) => {
            const start = new Date(r.expectedStartDate).getTime();
            const accept = new Date(r.offerAcceptedDate).getTime();
            const days = Math.max(0, Math.ceil((start - accept) / (1000 * 3600 * 24)));
            return acc + days;
          }, 0) / recordsWithDays.length
        )
      : 12;

    return {
      total,
      trueHires,
      pendingStart,
      noShow,
      withdrawal,
      showRate,
      trueHiresPct,
      pendingStartPct,
      noShowPct,
      withdrawalPct,
      avgDaysToStart
    };
  }, [records]);

  // Helper: Determine live operational and journey status for an onboarding candidate
  const getRecordOperationalStatus = (record: OnboardingRecord) => {
    const matchingJourney = journeys.find(
      j => (record.convertedEmployeeId && (j.sibsEmployeeId === record.convertedEmployeeId || j.id === record.convertedEmployeeId)) ||
           j.fullName.toLowerCase() === record.name.toLowerCase()
    );

    // 1. Handoff
    let handoffBadge = {
      label: "Pending Day 1 Handoff",
      tone: "bg-slate-100 text-slate-600 border-slate-200",
      isAlert: false,
      key: "pending"
    };

    if (matchingJourney) {
      const handoff = matchingJourney.day30Handoff || matchingJourney.day30?.handoff;
      if (matchingJourney.daysElapsed >= 27 && (!handoff || handoff.status === "Pending")) {
        handoffBadge = {
          label: "Day 30 Handoff to TL Due",
          tone: "bg-orange-100 text-[#FF5C28] border-orange-300 font-black",
          isAlert: true,
          key: "day30-due"
        };
      } else if (handoff?.status === "Submitted") {
        handoffBadge = {
          label: `Awaiting TL Acceptance (${handoff.targetTlName || "TL"})`,
          tone: "bg-amber-100 text-amber-800 border-amber-300 font-bold",
          isAlert: false,
          key: "submitted"
        };
      } else if (handoff?.status === "Accepted") {
        handoffBadge = {
          label: `Handoff to TL Accepted (${handoff.targetTlName || "TL"})`,
          tone: "bg-emerald-100 text-emerald-800 border-emerald-300 font-bold",
          isAlert: false,
          key: "accepted"
        };
      } else {
        handoffBadge = {
          label: `Handed Off to Training (${matchingJourney.trainerName || "L&D"})`,
          tone: "bg-blue-100 text-blue-800 border-blue-200 font-bold",
          isAlert: false,
          key: "training"
        };
      }
    } else if (record.handoffStatus) {
      const isDue = record.handoffStatus.toLowerCase().includes("due") || record.handoffStatus.toLowerCase().includes("pending action");
      handoffBadge = {
        label: record.handoffStatus,
        tone: isDue ? "bg-orange-100 text-[#FF5C28] border-orange-300 font-black" : "bg-slate-100 text-slate-700 border-slate-200 font-semibold",
        isAlert: isDue,
        key: isDue ? "day30-due" : "custom"
      };
    } else if (record.finalOutcome === "True Hire" || record.onboardingStage === "Completed Onboarding") {
      handoffBadge = {
        label: "Handed Off to Training",
        tone: "bg-blue-100 text-blue-800 border-blue-200 font-bold",
        isAlert: false,
        key: "training"
      };
    } else if (record.finalOutcome === "No Show" || record.onboardingStage === "No Show") {
      handoffBadge = {
        label: "No Show (Archived)",
        tone: "bg-rose-50 text-rose-700 border-rose-200 font-semibold",
        isAlert: false,
        key: "noshow"
      };
    } else if (record.finalOutcome === "Pre-start Withdrawal" || record.onboardingStage === "Pre-start Withdrawal") {
      handoffBadge = {
        label: "Withdrawn Before Start",
        tone: "bg-orange-50 text-orange-700 border-orange-200 font-semibold",
        isAlert: false,
        key: "withdrawn"
      };
    }

    // 2. Assessment
    let assessmentLabel = record.assessmentStatus || "";
    if (matchingJourney) {
      const empKey = matchingJourney.sibsEmployeeId || matchingJourney.id;
      const fst = phaseTrainingScores.find(s => (s.emp === empKey || s.emp === matchingJourney.id) && s.phase === "FST");
      const pst = phaseTrainingScores.find(s => (s.emp === empKey || s.emp === matchingJourney.id) && s.phase === "PST");
      if (fst || pst) {
        assessmentLabel = `FST: ${fst ? fst.score + "%" : "—"} • PST: ${pst ? pst.score + "%" : "—"}`;
      }
    }

    // 3. Coaching
    let coachingBadge: { label: string; tone: string; key: string } | null = null;
    if (matchingJourney) {
      const empKey = matchingJourney.sibsEmployeeId || matchingJourney.id;
      const coachActs = coachingActions.filter(c => c.emp === empKey || c.emp === matchingJourney.id);
      const hasDone = coachActs.some(c => c.status === "Done");
      const hasOpen = coachActs.some(c => c.status === "Open");

      if (hasDone && !hasOpen) {
        coachingBadge = {
          label: "Coaching: Passed (Goal Met)",
          tone: "bg-emerald-50 text-emerald-700 border-emerald-300 font-bold",
          key: "passed"
        };
      } else if (hasOpen) {
        coachingBadge = {
          label: "Coaching: Active",
          tone: "bg-amber-50 text-amber-800 border-amber-300 font-bold",
          key: "active"
        };
      }
    } else if (record.coachingStatus && record.coachingStatus !== "None Required" && record.coachingStatus !== "N/A") {
      const passed = record.coachingStatus.toLowerCase().includes("pass") || record.coachingStatus.toLowerCase().includes("met");
      const failed = record.coachingStatus.toLowerCase().includes("fail") || record.coachingStatus.toLowerCase().includes("action");
      coachingBadge = {
        label: record.coachingStatus,
        tone: passed ? "bg-emerald-50 text-emerald-700 border-emerald-300 font-bold" : failed ? "bg-rose-50 text-rose-700 border-rose-300 font-black" : "bg-amber-50 text-amber-800 border-amber-300 font-bold",
        key: passed ? "passed" : failed ? "action" : "active"
      };
    }

    return { handoffBadge, assessmentLabel, coachingBadge, matchingJourney };
  };

  const accountsList = useMemo(() => {
    const list = new Set<string>();
    records.forEach(r => { if (r.account) list.add(r.account); });
    journeys.forEach(j => { if (j.account) list.add(j.account); });
    return ["All", ...Array.from(list)];
  }, [records, journeys]);

  const trainersList = useMemo(() => {
    const list = new Set<string>();
    journeys.forEach(j => { if (j.trainerName) list.add(j.trainerName); });
    return ["All", ...Array.from(list)];
  }, [journeys]);

  // Unified Roster dataset combining Onboarding Candidates and 30/60/90 Journey Trainees
  const unifiedRoster = useMemo(() => {
    const matchedJourneyIds = new Set<string>();
    const rows: UnifiedRosterItem[] = [];

    // 1. Process all onboarding records
    records.forEach(r => {
      const matchingJourney = journeys.find(
        j => (r.convertedEmployeeId && (j.sibsEmployeeId === r.convertedEmployeeId || j.id === r.convertedEmployeeId)) ||
             j.fullName.toLowerCase() === r.name.toLowerCase()
      );

      if (matchingJourney) {
        matchedJourneyIds.add(matchingJourney.id);
      }

      const opStatus = getRecordOperationalStatus(r);
      const empKey = matchingJourney ? (matchingJourney.sibsEmployeeId || matchingJourney.id) : r.convertedEmployeeId;
      const fstScoreObj = matchingJourney ? phaseTrainingScores.find(s => (s.emp === empKey || s.emp === matchingJourney.id) && s.phase === "FST") : null;
      
      const day30Val = matchingJourney?.day30?.nestingQaScore ?? (fstScoreObj?.score ?? null);
      const day60Val = matchingJourney?.day60?.coreProductionScore ?? null;
      const day90Val = matchingJourney?.day90?.compositeScore ?? null;

      const daysElapsed = matchingJourney?.daysElapsed ?? (r.finalOutcome === "True Hire" ? 1 : 0);
      const openActions = matchingJourney ? coachingActions.filter(a => (a.emp === empKey || a.emp === matchingJourney.id) && a.status !== "Done").length : 0;
      const pendingRev = matchingJourney ? [30, 60, 90].filter(k => daysElapsed >= k && !matchingJourney.reviews?.[k]?.hr).length : 0;

      rows.push({
        key: `onb-${r.id}`,
        id: r.id,
        sibsId: r.convertedEmployeeId || matchingJourney?.sibsEmployeeId,
        name: r.name,
        email: r.email,
        phone: r.phone,
        role: r.role,
        account: r.account,
        siteLocation: r.siteLocation || "SiBS Davao",
        
        onboardingRecord: r,
        offerAcceptedDate: r.offerAcceptedDate,
        expectedStartDate: r.expectedStartDate,
        actualStartDate: r.actualStartDate,
        onboardingStage: getRecordOnboardingStage(r),
        showStatus: r.showStatus || "Pending",
        finalOutcome: r.finalOutcome || "Pending Start",
        taOwner: r.owner || "Alena Batacan",
        
        matchingJourney,
        assignedTrainer: matchingJourney?.trainerName || "L&D Unassigned",
        assignedTL: matchingJourney?.tl || r.owner || "Unassigned TL",
        handoffBadge: opStatus.handoffBadge,
        journeyPhase: matchingJourney ? (
          matchingJourney.daysElapsed <= 14 ? "FST (Days 1–14)" :
          matchingJourney.daysElapsed <= 28 ? "PST (Days 15–28)" :
          matchingJourney.daysElapsed <= 30 ? "Day 30 Nesting" :
          matchingJourney.daysElapsed <= 60 ? "Day 60 Operations" :
          "Day 90 Regularization"
        ) : (r.finalOutcome === "True Hire" ? "Pending Journey Start" : "Pre-Start Onboarding"),
        daysElapsed,
        overallProgressPct: matchingJourney?.overallProgressPct ?? (r.finalOutcome === "True Hire" ? 5 : 0),
        
        day30Score: day30Val,
        day30Status: matchingJourney?.day30?.status || "In Progress",
        day60Score: day60Val,
        day60Status: matchingJourney?.day60?.status || (matchingJourney && daysElapsed >= 60 ? "Pending" : "Upcoming"),
        day90Score: day90Val,
        day90Status: matchingJourney?.day90?.status || (matchingJourney && daysElapsed >= 90 ? "Pending" : "Upcoming"),
        
        openActionsCount: openActions,
        reviewsDueCount: pendingRev
      });
    });

    // 2. Process any standalone trainees in journeys not linked to an onboarding record
    journeys.forEach(j => {
      if (!matchedJourneyIds.has(j.id)) {
        const empKey = j.sibsEmployeeId || j.id;
        const fstScoreObj = phaseTrainingScores.find(s => (s.emp === empKey || s.emp === j.id) && s.phase === "FST");
        
        const day30Val = j.day30?.nestingQaScore ?? (fstScoreObj?.score ?? null);
        const day60Val = j.day60?.coreProductionScore ?? null;
        const day90Val = j.day90?.compositeScore ?? null;

        const handoff = j.day30Handoff || j.day30?.handoff;
        const isHandoffDue = j.daysElapsed >= 20 && (!handoff || handoff.status === "Accepted");
        const openActions = coachingActions.filter(a => (a.emp === empKey || a.emp === j.id) && a.status !== "Done").length;
        const pendingRev = [30, 60, 90].filter(k => j.daysElapsed >= k && !j.reviews?.[k]?.hr).length;

        rows.push({
          key: `jrn-${j.id}`,
          id: j.sibsEmployeeId || j.id,
          sibsId: j.sibsEmployeeId || j.id,
          name: j.fullName,
          email: j.email || `${j.fullName.toLowerCase().replace(/\s+/g, ".")}@thesiblingssolutions.com`,
          phone: (j as any).phone || "+63 917 123 4567",
          role: j.roleTitle || "Operations Specialist",
          account: j.account,
          siteLocation: j.siteLocation || "SiBS Davao",
          
          onboardingRecord: undefined,
          offerAcceptedDate: j.startDate,
          expectedStartDate: j.startDate,
          actualStartDate: j.startDate,
          onboardingStage: "Completed Onboarding",
          showStatus: "Show",
          finalOutcome: "True Hire",
          taOwner: "System Import",
          
          matchingJourney: j,
          assignedTrainer: j.trainerName || "L&D Unassigned",
          assignedTL: j.tl || "Unassigned TL",
          handoffBadge: {
            label: isHandoffDue ? "Day 30 Handoff to TL Due" : (handoff?.status === "Accepted" ? "Handoff to TL Accepted" : "Handed Off to Training"),
            tone: isHandoffDue ? "bg-orange-100 text-[#FF5C28] border-orange-300 font-black" : "bg-blue-100 text-blue-800 border-blue-200 font-bold",
            isAlert: isHandoffDue,
            key: isHandoffDue ? "day30-due" : "normal"
          },
          journeyPhase: (
            j.daysElapsed <= 14 ? "FST (Days 1–14)" :
            j.daysElapsed <= 28 ? "PST (Days 15–28)" :
            j.daysElapsed <= 30 ? "Day 30 Nesting" :
            j.daysElapsed <= 60 ? "Day 60 Operations" :
            "Day 90 Regularization"
          ),
          daysElapsed: j.daysElapsed || 1,
          overallProgressPct: j.overallProgressPct || Math.round(((j.daysElapsed || 1) / 90) * 100),
          
          day30Score: day30Val,
          day30Status: j.day30?.status || "In Progress",
          day60Score: day60Val,
          day60Status: j.day60?.status || (j.daysElapsed >= 60 ? "Pending" : "Upcoming"),
          day90Score: day90Val,
          day90Status: j.day90?.status || (j.daysElapsed >= 90 ? "Pending" : "Upcoming"),
          
          openActionsCount: openActions,
          reviewsDueCount: pendingRev
        });
      }
    });

    return rows;
  }, [records, journeys, phaseTrainingScores, coachingActions]);

  // Consolidated Search and Filtered Roster
  const filteredUnifiedRoster = useMemo(() => {
    return unifiedRoster.filter(row => {
      const query = searchTerm.toLowerCase().trim();
      const matchSearch = !query ||
        row.name.toLowerCase().includes(query) ||
        row.id.toLowerCase().includes(query) ||
        (row.sibsId && row.sibsId.toLowerCase().includes(query)) ||
        row.role.toLowerCase().includes(query) ||
        row.account.toLowerCase().includes(query) ||
        row.siteLocation.toLowerCase().includes(query) ||
        (row.email && row.email.toLowerCase().includes(query)) ||
        row.assignedTrainer.toLowerCase().includes(query) ||
        row.taOwner.toLowerCase().includes(query);

      const matchStage = stageFilter === "All" || row.onboardingStage === stageFilter;

      const matchPhase = journeyPhaseFilter === "All" ? true :
        journeyPhaseFilter === "FST (Days 1–14)" ? row.journeyPhase.includes("FST") :
        journeyPhaseFilter === "PST (Days 15–28)" ? row.journeyPhase.includes("PST") :
        journeyPhaseFilter === "Day 30 Nesting" ? row.journeyPhase.includes("Day 30") :
        journeyPhaseFilter === "Day 60 Operations" ? row.journeyPhase.includes("Day 60") :
        journeyPhaseFilter === "Day 90 Regularization" ? row.journeyPhase.includes("Day 90") :
        journeyPhaseFilter === "Day 30 Handoff Due" ? row.handoffBadge.isAlert :
        true;

      const matchAccount = accountFilter === "All" || row.account === accountFilter;
      const matchLocation = locationFilter === "All" || row.siteLocation === locationFilter;
      const matchTrainer = trainerFilter === "All" || row.assignedTrainer === trainerFilter;

      const matchAction = actionFilter === "All" ? true :
        actionFilter === "Handoff Due" ? row.handoffBadge.isAlert :
        actionFilter === "True Hire" ? row.finalOutcome === "True Hire" :
        actionFilter === "Drop-offs" ? (row.finalOutcome === "No Show" || row.finalOutcome === "Pre-start Withdrawal") :
        actionFilter === "Open Actions" ? row.openActionsCount > 0 :
        true;

      return matchSearch && matchStage && matchPhase && matchAccount && matchLocation && matchTrainer && matchAction;
    });
  }, [unifiedRoster, searchTerm, stageFilter, journeyPhaseFilter, accountFilter, locationFilter, trainerFilter, actionFilter]);

  // Handler: Selecting a pending offer from Create Modal
  const handleSelectPendingOffer = (offerId: string) => {
    setSelectedAcceptedOfferId(offerId);
    if (!offerId) return;

    const offer = pendingOffers.find(o => o.id === offerId);
    if (offer) {
      setNewName(offer.candidateName || "");
      setNewEmail(offer.email || `${offer.candidateName.toLowerCase().replace(/\s+/g, ".")}@gmail.com`);
      setNewPhone(offer.phone || "+63 917 123 4567");
      setNewRole(offer.appliedPosition || offer.role || "Customer Service Representative");
      setNewAccount(offer.account || "Elevance Health");
      if (offer.siteLocation) setNewSiteLocation(offer.siteLocation);
      if (offer.acceptedDate) setNewOfferAcceptedDate(offer.acceptedDate);
      if (offer.startDate) setNewExpectedStartDate(offer.startDate);
    }
  };

  // Create Manual or Imported Onboarding Record Handler
  const handleCreateOnboarding = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newEmail.trim() || !newPhone.trim()) {
      triggerToast("Candidate name, email, and phone contact must be provided!");
      return;
    }

    const newNum = records.length + 101;
    const newId = `ONB-2026-${newNum < 100 ? "0" + newNum : newNum}`;

    // Compute days to start
    const startMs = new Date(newExpectedStartDate).getTime();
    const acceptMs = new Date(newOfferAcceptedDate).getTime();
    const computedDays = Math.max(0, Math.ceil((startMs - acceptMs) / (1000 * 3600 * 24)));

    const newRecord: OnboardingRecord = {
      id: newId,
      name: newName.trim(),
      email: newEmail.trim(),
      phone: newPhone.trim(),
      role: newRole,
      account: newAccount,
      siteLocation: newSiteLocation,
      offerAcceptedDate: newOfferAcceptedDate,
      expectedStartDate: newExpectedStartDate,
      daysToStart: computedDays,
      showStatus: "Pending",
      finalOutcome: "Pending Start",
      owner: newOwner || "Alena Batacan",
      feedbackRating: 5,
      auditTrail: [
        {
          date: new Date().toISOString().split("T")[0],
          action: selectedAcceptedOfferId
            ? `Enrolled from Accepted Offer #${selectedAcceptedOfferId}.`
            : "Enrolled manual candidate onboarding record.",
          user: userEmail.split("@")[0] || "Alena Batacan"
        }
      ]
    };

    setRecords([newRecord, ...records]);
    setIsCreateModalOpen(false);

    // Reset fields
    setSelectedAcceptedOfferId("");
    setNewName("");
    setNewEmail("");
    setNewPhone("");
    setNewRole("Customer Service Representative");
    setNewAccount("Elevance Health");
    setNewSiteLocation("Davao City");
    setNewOfferAcceptedDate("2026-07-20");
    setNewExpectedStartDate("2026-08-01");

    triggerToast(`Onboarding file ${newId} initialized for ${newRecord.name}!`);
  };

  // Open Outcome Resolution Modal
  const handleOpenOutcomeModal = (record: OnboardingRecord) => {
    setOutcomeTargetRecord(record);
    const initialStage = getRecordOnboardingStage(record);
    setOutcomeStage(initialStage);
    setOutcomeShowStatus(
      initialStage === "Completed Onboarding" || initialStage === "Day 1 - Handed Off to Training"
        ? "Show"
        : initialStage === "No Show"
          ? "No Show"
          : initialStage === "Pre-start Withdrawal"
            ? "Withdrawn"
            : record.showStatus || "Pending"
    );
    setOutcomeActualDate(record.actualStartDate || record.expectedStartDate || new Date().toISOString().split("T")[0]);
    setOutcomeFeedbackRating(record.feedbackRating || 5);
    setOutcomeWithdrawalReason(record.withdrawalReason || "Compensation Gap / Counter Offer");
    setOutcomeWithdrawalNotes(record.withdrawalNotes || "");
    setIsOutcomeModalOpen(true);
  };

  // Save Outcome Resolution & Auto-Sync Downstream Systems (Employee Directory / Talent Pool)
  const handleSaveOutcome = () => {
    if (!outcomeTargetRecord) return;

    let finalOutcomeState: OnboardingRecord["finalOutcome"] = "Pending Start";
    if (outcomeStage === "Completed Onboarding" || outcomeStage === "Day 1 - Handed Off to Training" || outcomeShowStatus === "Show") {
      finalOutcomeState = "True Hire";
    } else if (outcomeStage === "No Show" || outcomeShowStatus === "No Show") {
      finalOutcomeState = "No Show";
    } else if (outcomeStage === "Pre-start Withdrawal" || outcomeShowStatus === "Withdrawn") {
      finalOutcomeState = "Pre-start Withdrawal";
    } else {
      finalOutcomeState = "Pending Start";
    }

    let generatedEmpId = outcomeTargetRecord.convertedEmployeeId;

    // DOWNSTREAM SYNC 1: If True Hire (Show), convert candidate to Employee Directory
    if (finalOutcomeState === "True Hire") {
      if (!generatedEmpId) {
        generatedEmpId = `SIB-2026-${Math.floor(100 + Math.random() * 900)}`;
      }

      try {
        const rawEmployees = localStorage.getItem(EMPLOYEE_DIRECTORY_STORAGE_KEY);
        let existingEmployees: any[] = rawEmployees ? JSON.parse(rawEmployees) : [];

        // Check if employee already exists
        const exists = existingEmployees.some((e: any) => e.email === outcomeTargetRecord.email || e.sibsId === generatedEmpId);
        if (!exists) {
          const nameParts = outcomeTargetRecord.name.trim().split(" ");
          const firstName = nameParts[0] || outcomeTargetRecord.name;
          const lastName = nameParts.length > 1 ? nameParts[nameParts.length - 1] : "";
          const middleName = nameParts.length > 2 ? nameParts.slice(1, -1).join(" ") : "";

          const newEmployeeRecord = {
            id: generatedEmpId,
            sibsId: generatedEmpId,
            firstName,
            middleName,
            lastName,
            nameExtension: "",
            preferredName: firstName,
            birthDate: "1997-05-15",
            placeOfBirth: outcomeTargetRecord.siteLocation || "Manila",
            gender: "Female",
            civilStatus: "Single",
            citizenship: "Filipino",
            bloodType: "O+",
            height: "165 cm",
            weight: "58 kg",
            email: outcomeTargetRecord.email,
            mobileNumber: outcomeTargetRecord.phone,
            telephone: "N/A",
            residentialAddress: `${outcomeTargetRecord.siteLocation || "Davao"}, Philippines`,
            permanentAddress: `${outcomeTargetRecord.siteLocation || "Davao"}, Philippines`,
            workSetup: "Onsite",
            gsis: "N/A",
            sss: "34-8901234-5",
            philhealth: "12-098765432-1",
            pagibig: "1211-4567-8901",
            tin: "456-789-012-000",
            department: "Operations",
            position: outcomeTargetRecord.role,
            account: outcomeTargetRecord.account,
            location: outcomeTargetRecord.siteLocation || "Davao City",
            status: "Active",
            hireDate: outcomeActualDate,
            spouse: {},
            parents: {},
            children: [],
            education: [],
            civilService: [],
            workExperience: [],
            voluntaryWork: [],
            trainings: [],
            otherSkills: [],
            references: []
          };

          existingEmployees.push(newEmployeeRecord);
          localStorage.setItem(EMPLOYEE_DIRECTORY_STORAGE_KEY, JSON.stringify(existingEmployees));
          
          // Dispatch sync event
          window.dispatchEvent(new Event("storage"));
        }
      } catch (err) {
        console.warn("Error syncing True Hire to Employee Directory:", err);
      }
    }

    // DOWNSTREAM SYNC 2: If No Show or Pre-start Withdrawal, archive candidate to Talent Pool
    if (finalOutcomeState === "No Show" || finalOutcomeState === "Pre-start Withdrawal") {
      try {
        const rawTalentPool = localStorage.getItem(TALENT_POOL_STORAGE_KEY);
        let existingCandidates: any[] = rawTalentPool ? JSON.parse(rawTalentPool) : [];

        const exists = existingCandidates.some((c: any) => c.email === outcomeTargetRecord.email);
        if (!exists) {
          const archivedCandidate = {
            id: `CAN-POOL-${Math.floor(1000 + Math.random() * 9000)}`,
            name: outcomeTargetRecord.name,
            email: outcomeTargetRecord.email,
            phone: outcomeTargetRecord.phone,
            appliedPosition: outcomeTargetRecord.role,
            skills: ["Customer Service", "BPO Operations", outcomeTargetRecord.account],
            preferredLocation: outcomeTargetRecord.siteLocation || "Davao City",
            finalAccount: outcomeTargetRecord.account,
            status: "Silver Pool",
            isPublicEntry: false,
            lastActivityDate: new Date().toISOString().split("T")[0],
            notes: `[Onboarding Drop-off] ${finalOutcomeState} - Reason: ${outcomeWithdrawalReason}. ${outcomeWithdrawalNotes}`,
            history: [
              {
                date: new Date().toISOString().split("T")[0],
                action: `Archived from Onboarding due to ${finalOutcomeState} (${outcomeWithdrawalReason})`,
                user: userEmail.split("@")[0] || "Alena Batacan"
              }
            ]
          };

          existingCandidates.push(archivedCandidate);
          localStorage.setItem(TALENT_POOL_STORAGE_KEY, JSON.stringify(existingCandidates));
          window.dispatchEvent(new Event("storage"));
        }
      } catch (err) {
        console.warn("Error syncing drop-off to Talent Pool:", err);
      }
    }

    // Update local state
    setRecords(prev =>
      prev.map(r => {
        if (r.id === outcomeTargetRecord.id) {
          const updatedAudit = [...r.auditTrail];
          let actionText = `Outcome resolved: Attendance [${outcomeShowStatus}], Outcome [${finalOutcomeState}]`;
          if (finalOutcomeState === "True Hire") {
            actionText += `. Converted to Employee Directory as #${generatedEmpId}.`;
          } else if (finalOutcomeState === "No Show" || finalOutcomeState === "Pre-start Withdrawal") {
            actionText += `. Reason: ${outcomeWithdrawalReason}. Archived to Talent Pool.`;
          }

          updatedAudit.push({
            date: new Date().toISOString().split("T")[0],
            action: actionText,
            user: userEmail.split("@")[0] || "Alena Batacan"
          });

          let resolvedHandoff = r.handoffStatus;
          if (outcomeStage === "Day 1 - Handed Off to Training" || outcomeStage === "Completed Onboarding") {
            resolvedHandoff = resolvedHandoff || "Handed Off to Training";
          } else if (outcomeStage === "No Show") {
            resolvedHandoff = "No Show (Archived)";
          } else if (outcomeStage === "Pre-start Withdrawal") {
            resolvedHandoff = "Withdrawn Before Start";
          }

          return {
            ...r,
            onboardingStage: outcomeStage,
            showStatus: outcomeShowStatus,
            finalOutcome: finalOutcomeState,
            handoffStatus: resolvedHandoff,
            actualStartDate: (outcomeShowStatus === "Show" || outcomeStage === "Day 1 - Handed Off to Training" || outcomeStage === "Completed Onboarding") ? outcomeActualDate : undefined,
            feedbackRating: outcomeFeedbackRating,
            withdrawalReason: (outcomeShowStatus === "No Show" || outcomeShowStatus === "Withdrawn" || outcomeStage === "No Show" || outcomeStage === "Pre-start Withdrawal") ? outcomeWithdrawalReason : undefined,
            withdrawalNotes: (outcomeShowStatus === "No Show" || outcomeShowStatus === "Withdrawn" || outcomeStage === "No Show" || outcomeStage === "Pre-start Withdrawal") ? outcomeWithdrawalNotes : undefined,
            convertedEmployeeId: finalOutcomeState === "True Hire" ? generatedEmpId : r.convertedEmployeeId,
            auditTrail: updatedAudit
          };
        }
        return r;
      })
    );

    setIsOutcomeModalOpen(false);

    if (finalOutcomeState === "True Hire") {
      triggerToast(`True Hire confirmed! ${outcomeTargetRecord.name} converted to Employee Directory as #${generatedEmpId}`);
    } else if (finalOutcomeState === "No Show" || finalOutcomeState === "Pre-start Withdrawal") {
      triggerToast(`${finalOutcomeState} logged for ${outcomeTargetRecord.name}. Candidate archived to Talent Pool.`);
    } else {
      triggerToast(`Onboarding outcome updated for ${outcomeTargetRecord.name}!`);
    }
  };

  const handleResetDatabase = () => {
    setRecords(INITIAL_ONBOARDING_RECORDS);
    localStorage.removeItem(ONBOARDING_STORAGE_KEY);
    triggerToast("Onboarding database restored to default baseline metrics.");
  };

  return (
    <div
      className="relative flex-1 select-none space-y-4 pb-8 font-jakarta sm:space-y-5 2xl:space-y-6"
      id="onboarding-module-root"
    >
      {/* Toast */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -14, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -14, scale: 0.97 }}
            className="fixed right-4 top-20 z-[12000] flex max-w-[420px] items-center gap-3 rounded-xl border border-[#163F63] border-l-4 border-l-[#FF5C28] bg-[#042C51] px-4 py-3 text-xs font-semibold text-white shadow-2xl sm:right-6"
          >
            <CheckCircle className="h-4 w-4 shrink-0 text-[#FF5C28]" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <section className="relative overflow-hidden rounded-2xl border border-[#DCE5EF] bg-white px-5 py-5 shadow-[0_8px_22px_rgba(4,44,81,0.05)] sm:px-6 2xl:px-7 2xl:py-6">
        <div className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-[#042C51] via-[#1A5A8A] to-[#FF5C28]" />

        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="min-w-0">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#042C51] px-2.5 py-1 text-[9px] font-extrabold uppercase tracking-wide text-white">
                <UserCheck className="h-3 w-3 text-[#FF5C28]" />
                UNIFIED HR LIFECYCLE GOVERNANCE
              </span>
              <span className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[9px] font-extrabold text-emerald-700">
                True Hire Conversion & 30 / 60 / 90 Probationary Roster
              </span>
            </div>

            <h1 className="text-xl font-black tracking-tight text-[#042C51] sm:text-2xl 2xl:text-[28px]">
              Onboarding & Employee Journey
            </h1>
            <p className="mt-1 max-w-4xl text-xs font-medium leading-5 text-[#667085] 2xl:text-[13px]">
              Manage employee onboarding, True Hire conversion, training progression, 30/60/90 performance reviews, and HR handoffs.
            </p>
          </div>

          <div className="flex w-full flex-wrap items-center gap-2 xl:w-auto xl:justify-end">
            <button
              type="button"
              onClick={handleResetDatabase}
              className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[#D7E0EA] bg-white text-[#475467] transition hover:border-[#FF5C28]/40 hover:bg-[#FFF8F5] hover:text-[#FF5C28]"
              title="Restore default onboarding baseline data"
              aria-label="Restore default onboarding baseline data"
            >
              <RefreshCw className="h-4 w-4" />
            </button>

            <button
              type="button"
              onClick={() => setIsCreateModalOpen(true)}
              className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg bg-[#FF5C28] px-4 text-xs font-extrabold text-white shadow-sm transition hover:bg-[#E95324]"
            >
              <Plus className="h-4 w-4" />
              Add Onboarding Record
            </button>
          </div>
        </div>

        {/* Section Jump Quick Navigation Bar */}
        <div className="mt-4 flex items-center gap-2 border-t border-[#E6ECF2] pt-3 overflow-x-auto">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#667085] pr-1 shrink-0">
            Jump to Section:
          </span>

          <button
            type="button"
            onClick={() => document.getElementById("section-overview")?.scrollIntoView({ behavior: "smooth" })}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#F8FAFC] text-[#042C51] hover:bg-[#042C51] hover:text-white border border-[#E6ECF2] text-xs font-bold transition-all cursor-pointer shrink-0"
          >
            <Users className="h-3.5 w-3.5 text-[#FF5C28]" />
            <span>Executive Overview</span>
          </button>

          <button
            type="button"
            onClick={() => document.getElementById("section-actions")?.scrollIntoView({ behavior: "smooth" })}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#F8FAFC] text-[#042C51] hover:bg-[#042C51] hover:text-white border border-[#E6ECF2] text-xs font-bold transition-all cursor-pointer shrink-0"
          >
            <Clock className="h-3.5 w-3.5 text-[#FF5C28]" />
            <span>HR Actions & Alerts</span>
          </button>

          <button
            type="button"
            onClick={() => document.getElementById("section-roster")?.scrollIntoView({ behavior: "smooth" })}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#F8FAFC] text-[#042C51] hover:bg-[#042C51] hover:text-white border border-[#E6ECF2] text-xs font-bold transition-all cursor-pointer shrink-0"
          >
            <UserCheck className="h-3.5 w-3.5 text-[#FF5C28]" />
            <span>Onboarding &amp; Journey Roster</span>
            <span className="px-1.5 py-0.2 rounded-full text-[9.5px] font-black bg-slate-200 text-slate-700">
              {records.length}
            </span>
          </button>
        </div>
      </section>

      {/* ======================================================== */}
      {/* SECTION A: EXECUTIVE OVERVIEW & METRICS */}
      {/* ======================================================== */}
      <section id="section-overview" className="space-y-4">
        {/* Candidate Onboarding & True Hire Conversion KPIs */}
        <div>
          <div className="mb-2 flex items-center justify-between">
            <span className="text-[10.5px] font-black uppercase tracking-wider text-[#042C51]">
              Candidate Onboarding &amp; True Hire Conversion
            </span>
            <span className="text-[10px] font-bold text-[#667085]">6 Metrics</span>
          </div>
          <div className="grid grid-cols-2 gap-2.5 md:grid-cols-3 xl:grid-cols-6 2xl:gap-3">
            {[
              {
                title: "Total Records",
                value: metrics.total,
                description: "All onboarding records",
                Icon: Users,
                labelClass: "text-[#042C51]",
                iconClass: "bg-[#EAF0F7] text-[#042C51]",
              },
              {
                title: "True Hires",
                value: metrics.trueHires,
                description: "Reported and placed",
                Icon: UserCheck,
                labelClass: "text-emerald-700",
                iconClass: "bg-emerald-50 text-emerald-700",
              },
              {
                title: "Pending Start",
                value: metrics.pendingStart,
                description: "Awaiting start date",
                Icon: Clock,
                labelClass: "text-amber-700",
                iconClass: "bg-amber-50 text-amber-700",
              },
              {
                title: "No Show",
                value: metrics.noShow,
                description: "Did not report",
                Icon: AlertTriangle,
                labelClass: "text-red-700",
                iconClass: "bg-red-50 text-red-700",
              },
              {
                title: "Withdrawal",
                value: metrics.withdrawal,
                description: "Pre-start drop-offs",
                Icon: XCircle,
                labelClass: "text-orange-700",
                iconClass: "bg-orange-50 text-orange-700",
              },
              {
                title: "Show Rate",
                value: `${metrics.showRate}%`,
                description: "True hires / resolved",
                Icon: TrendingUp,
                labelClass: "text-indigo-700",
                iconClass: "bg-indigo-50 text-indigo-700",
              },
            ].map(({ title, value, description, Icon, labelClass, iconClass }) => (
              <article
                key={title}
                className="flex h-[100px] min-h-[92px] flex-col justify-between overflow-hidden rounded-xl border border-[#DCE5EF] bg-white p-3 shadow-[0_6px_18px_rgba(4,44,81,0.04)] transition hover:-translate-y-0.5 hover:shadow-md 2xl:h-[108px]"
              >
                <div className="flex h-full items-start justify-between gap-2">
                  <div className="flex h-full min-w-0 flex-1 flex-col justify-between">
                    <div>
                      <p className={`m-0 truncate text-[9.5px] font-extrabold uppercase tracking-wide ${labelClass}`}>
                        {title}
                      </p>
                      <p className={`mt-1.5 text-2xl font-bold leading-none tabular-nums tracking-tight ${labelClass}`}>
                        {value}
                      </p>
                    </div>
                    <p className="mt-1 truncate text-[9.5px] font-semibold leading-tight text-[#667085]">
                      {description}
                    </p>
                  </div>

                  <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${iconClass}`}>
                    <Icon className="h-4 w-4" strokeWidth={2} />
                  </span>
                </div>
              </article>
            ))}
          </div>
        </div>

        {/* 30 / 60 / 90 Probationary Journey Benchmarks KPIs */}
        <div>
          <div className="mb-2 flex items-center justify-between">
            <span className="text-[10.5px] font-black uppercase tracking-wider text-[#FF5C28]">
              30 / 60 / 90 Probationary Journey Benchmarks
            </span>
            <span className="text-[10px] font-bold text-[#667085]">5 Metrics</span>
          </div>
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-5 2xl:gap-3">
            {/* 1. Trainees in View */}
            <article className="flex h-[100px] min-h-[92px] flex-col justify-between overflow-hidden rounded-xl border border-[#DCE5EF] bg-white p-3 shadow-[0_6px_18px_rgba(4,44,81,0.04)] transition hover:-translate-y-0.5 hover:shadow-md 2xl:h-[108px]">
              <div className="flex h-full items-start justify-between gap-2">
                <div className="flex h-full min-w-0 flex-1 flex-col justify-between">
                  <div>
                    <p className="m-0 truncate text-[9.5px] font-extrabold uppercase tracking-wide text-slate-700">
                      Trainees in View
                    </p>
                    <p className="mt-1.5 text-2xl font-bold leading-none tabular-nums tracking-tight text-[#042C51]">
                      {journeys.length}
                    </p>
                  </div>
                  <p className="mt-1 truncate text-[9.5px] font-semibold leading-tight text-[#667085]">
                    Active cohort trainees
                  </p>
                </div>
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                  <Users className="h-4 w-4" />
                </span>
              </div>
            </article>

            {/* 2. Completed Scorecards */}
            <article className="flex h-[100px] min-h-[92px] flex-col justify-between overflow-hidden rounded-xl border border-[#DCE5EF] bg-white p-3 shadow-[0_6px_18px_rgba(4,44,81,0.04)] transition hover:-translate-y-0.5 hover:shadow-md 2xl:h-[108px]">
              <div className="flex h-full items-start justify-between gap-2">
                <div className="flex h-full min-w-0 flex-1 flex-col justify-between">
                  <div>
                    <p className="m-0 truncate text-[9.5px] font-extrabold uppercase tracking-wide text-emerald-700">
                      Completed Scorecards
                    </p>
                    <p className="mt-1.5 text-2xl font-bold leading-none tabular-nums tracking-tight text-[#042C51]">
                      7 <span className="text-xs font-semibold text-slate-400">/ 7</span>
                    </p>
                  </div>
                  <p className="mt-1 truncate text-[9.5px] font-semibold leading-tight text-[#667085]">
                    Trainer + QA + TL combined
                  </p>
                </div>
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                  <CheckCircle2 className="h-4 w-4" />
                </span>
              </div>
            </article>

            {/* 3. Needs Support */}
            <article className="flex h-[100px] min-h-[92px] flex-col justify-between overflow-hidden rounded-xl border border-[#DCE5EF] bg-white p-3 shadow-[0_6px_18px_rgba(4,44,81,0.04)] transition hover:-translate-y-0.5 hover:shadow-md 2xl:h-[108px]">
              <div className="flex h-full items-start justify-between gap-2">
                <div className="flex h-full min-w-0 flex-1 flex-col justify-between">
                  <div>
                    <p className="m-0 truncate text-[9.5px] font-extrabold uppercase tracking-wide text-rose-700">
                      Needs Support
                    </p>
                    <p className="mt-1.5 text-2xl font-bold leading-none tabular-nums tracking-tight text-[#E74C3C]">
                      2
                    </p>
                  </div>
                  <p className="mt-1 truncate text-[9.5px] font-semibold leading-tight text-[#667085]">
                    Scorecards &lt;70% benchmark
                  </p>
                </div>
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-rose-50 text-rose-600">
                  <AlertTriangle className="h-4 w-4" />
                </span>
              </div>
            </article>

            {/* 4. Pending Scorecards */}
            <article className="flex h-[100px] min-h-[92px] flex-col justify-between overflow-hidden rounded-xl border border-[#DCE5EF] bg-white p-3 shadow-[0_6px_18px_rgba(4,44,81,0.04)] transition hover:-translate-y-0.5 hover:shadow-md 2xl:h-[108px]">
              <div className="flex h-full items-start justify-between gap-2">
                <div className="flex h-full min-w-0 flex-1 flex-col justify-between">
                  <div>
                    <p className="m-0 truncate text-[9.5px] font-extrabold uppercase tracking-wide text-amber-700">
                      Pending Scorecards
                    </p>
                    <p className="mt-1.5 text-2xl font-bold leading-none tabular-nums tracking-tight text-[#E67E22]">
                      0
                    </p>
                  </div>
                  <p className="mt-1 truncate text-[9.5px] font-semibold leading-tight text-[#667085]">
                    Due results lacking inputs
                  </p>
                </div>
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-50 text-amber-600">
                  <Clock className="h-4 w-4" />
                </span>
              </div>
            </article>

            {/* 5. Day 30 TL Handoffs */}
            <article className={`col-span-2 sm:col-span-1 flex h-[100px] min-h-[92px] flex-col justify-between overflow-hidden rounded-xl border p-3 shadow-[0_6px_18px_rgba(4,44,81,0.04)] transition hover:-translate-y-0.5 hover:shadow-md 2xl:h-[108px] ${
              pendingDay30HandoffsCount > 0 
                ? "border-[#FF5C28] bg-orange-50/50" 
                : "border-[#DCE5EF] bg-white"
            }`}>
              <div className="flex h-full items-start justify-between gap-2">
                <div className="flex h-full min-w-0 flex-1 flex-col justify-between">
                  <div>
                    <p className="m-0 truncate text-[9.5px] font-extrabold uppercase tracking-wide text-[#FF5C28]">
                      Day 30 TL Handoffs
                    </p>
                    <div className="mt-1.5 flex items-center gap-1.5">
                      <span className="text-2xl font-bold leading-none tabular-nums tracking-tight text-[#042C51]">
                        {pendingDay30HandoffsCount}
                      </span>
                      {pendingDay30HandoffsCount > 0 && (
                        <span className="rounded-full bg-[#FF5C28] px-1.5 py-0.5 text-[8px] font-black uppercase tracking-wider text-white">
                          Action Due
                        </span>
                      )}
                    </div>
                  </div>
                  <p className="mt-1 truncate text-[9.5px] font-semibold leading-tight text-[#667085]">
                    Trainer → TL transition needed
                  </p>
                </div>
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-orange-100 text-[#FF5C28]">
                  <Award className="h-4 w-4" />
                </span>
              </div>
            </article>
          </div>
        </div>
      </section>

      {/* Outcome Overview + Governance */}
      <section id="section-actions" className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        <article className="flex flex-col justify-between rounded-2xl border border-[#DCE5EF] bg-white p-5 shadow-[0_8px_22px_rgba(4,44,81,0.04)] lg:col-span-7">
          <div>
            <div className="mb-4 flex flex-col gap-2 border-b border-[#E6ECF2] pb-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <TrendingUp size={16} className="shrink-0 text-[#FF5C28]" />
                  <h2 className="text-sm font-bold tracking-tight text-[#042C51] 2xl:text-base">
                    Onboarding Outcome Distribution
                  </h2>
                </div>
                <p className="mt-0.5 text-xs font-semibold text-[#667085]">
                  Current accepted-offer outcomes across onboarding records.
                </p>
              </div>

              <span className="inline-flex w-fit shrink-0 rounded-full border border-[#E6ECF2] bg-[#F8FAFC] px-2.5 py-1 text-[10px] font-extrabold text-[#475467]">
                Total Records: {metrics.total}
              </span>
            </div>

            <div className="space-y-3.5">
              {[
                ["True Hires", metrics.trueHiresPct, metrics.trueHires, "bg-emerald-500"],
                ["Pending Start", metrics.pendingStartPct, metrics.pendingStart, "bg-amber-500"],
                ["No Show", metrics.noShowPct, metrics.noShow, "bg-rose-500"],
                ["Pre-start Withdrawal", metrics.withdrawalPct, metrics.withdrawal, "bg-orange-500"],
              ].map(([label, value, count, tone]) => (
                <div key={String(label)} className="space-y-1.5">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-2">
                      <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${tone}`} />
                      <span className="truncate text-xs font-extrabold text-[#344054]">
                        {label}
                      </span>
                    </div>
                    <span className="shrink-0 text-[10px] font-extrabold tabular-nums text-[#667085] 2xl:text-xs">
                      {Number(value)}% ({Number(count)})
                    </span>
                  </div>

                  <div className="h-2.5 overflow-hidden rounded-full border border-[#E6ECF2] bg-[#F2F4F7] p-0.5">
                    <div
                      className={`h-full rounded-full transition-[width] duration-700 ease-out ${tone}`}
                      style={{ width: `${Math.max(0, Math.min(100, Number(value) || 0))}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </article>

        <aside className="relative flex flex-col justify-between overflow-hidden rounded-2xl border border-[#083A69] bg-[#042C51] p-5 text-white shadow-sm lg:col-span-5">
          <div
            className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-[#FF5C28]/15 blur-2xl"
            aria-hidden="true"
          />

          <div className="relative z-10">
            <div className="flex items-center gap-2 text-[#FF5C28]">
              <ShieldCheck size={17} />
              <h3 className="text-[10px] font-extrabold uppercase tracking-wider">
                Onboarding Governance Rule
              </h3>
            </div>

            <div className="mt-4 rounded-xl border border-white/10 bg-white/10 p-4">
              <p className="text-[9px] font-extrabold uppercase tracking-wider text-[#94A9C1]">
                Target Rule Flow
              </p>
              <p className="mt-1 text-sm font-extrabold text-white 2xl:text-base">
                Accepted Offer → Onboarding → Final Start Outcome
              </p>

              <p className="mt-3.5 text-[9px] font-extrabold uppercase tracking-wider text-[#94A9C1]">
                Conversion Policy
              </p>
              <p className="mt-1 text-xs font-semibold leading-5 text-[#FFB9A2]">
                Accepted Offer creates onboarding. Only a candidate marked as
                <span className="font-extrabold text-emerald-300"> Show </span>
                becomes a True Hire.
              </p>
            </div>

            <p className="mt-4 text-xs font-semibold leading-5 text-[#BECBDA]">
              No Show and Pre-start Withdrawal do not count as filled placements or True Hires.
            </p>
          </div>
        </aside>
      </section>

      {/* ======================================================== */}
      {/* SECTION C: UNIFIED EMPLOYEE ONBOARDING & JOURNEY RECORDS */}
      {/* ======================================================== */}
      <section id="section-roster" className="relative z-[10] overflow-visible rounded-2xl border border-[#DCE5EF] bg-white shadow-[0_8px_22px_rgba(4,44,81,0.04)]">
        <header className="border-b border-[#E6ECF2] bg-white p-4 sm:p-5 2xl:p-6">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-extrabold tracking-tight text-[#042C51] 2xl:text-lg">
                  Employee Onboarding &amp; Journey Records
                </h2>
                <span className="rounded-full bg-[#042C51] px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-white">
                  Unified Roster
                </span>
              </div>
              <p className="mt-0.5 text-xs font-semibold leading-relaxed text-[#667085]">
                Master roster consolidating candidate onboarding, start outcomes, True Hire conversion, training progression, and 30/60/90 probationary performance.
              </p>
            </div>

            <div className="mt-2 sm:mt-0 flex items-center gap-2">
              <span className="rounded-xl border border-[#E6ECF2] bg-[#F8FAFC] px-3 py-1.5 text-xs font-bold text-[#042C51]">
                Showing <strong className="text-[#FF5C28]">{filteredUnifiedRoster.length}</strong> of <strong className="text-[#042C51]">{unifiedRoster.length}</strong> Records
              </span>
            </div>
          </div>

          {/* Consolidated Filter Controls */}
          <div className="relative z-[90] mt-3.5 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-8 2xl:mt-4">
            {/* 1. Search */}
            <div className="relative min-w-0 xl:col-span-2">
              <Search
                size={14}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#98A2B3]"
              />
              <input
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search candidate, SIBS ID, role, account, site, trainer, owner..."
                className="h-9 w-full rounded-xl border border-[#D7DEE8] bg-white pl-8 pr-8 text-xs font-semibold text-[#042C51] outline-none transition placeholder:text-[#98A2B3] hover:border-[#FF5C28]/40 focus:border-[#FF5C28] focus:ring-2 focus:ring-[#FF5C28]/10"
              />
              {searchTerm ? (
                <button
                  type="button"
                  onClick={() => setSearchTerm("")}
                  className="absolute right-2 top-1/2 inline-flex h-5 w-5 -translate-y-1/2 items-center justify-center rounded text-[#98A2B3] hover:text-[#FF5C28]"
                  aria-label="Clear search"
                >
                  <X size={12} />
                </button>
              ) : null}
            </div>

            {/* 2. Onboarding Stage */}
            <select
              value={stageFilter}
              onChange={(e) => setStageFilter(e.target.value)}
              className="h-9 w-full rounded-xl border border-[#D7DEE8] bg-[#F8FAFC] px-2.5 text-xs font-semibold text-[#042C51] outline-none transition hover:border-[#FF5C28]/40 hover:bg-white focus:border-[#FF5C28] cursor-pointer"
            >
              <option value="All">All Onboarding Stages</option>
              {ONBOARDING_STAGES.map((st) => (
                <option key={st} value={st}>{st}</option>
              ))}
            </select>

            {/* 3. Journey Phase */}
            <select
              value={journeyPhaseFilter}
              onChange={(e) => setJourneyPhaseFilter(e.target.value)}
              className="h-9 w-full rounded-xl border border-[#D7DEE8] bg-[#F8FAFC] px-2.5 text-xs font-semibold text-[#042C51] outline-none transition hover:border-[#FF5C28]/40 hover:bg-white focus:border-[#FF5C28] cursor-pointer"
            >
              <option value="All">All Journey Phases</option>
              <option value="FST (Days 1–14)">Phase 1 • FST (Days 1–14)</option>
              <option value="PST (Days 15–28)">Phase 2 • PST (Days 15–28)</option>
              <option value="Day 30 Nesting">Day 30 Nesting</option>
              <option value="Day 60 Operations">Day 60 Operations</option>
              <option value="Day 90 Regularization">Day 90 Regularization</option>
              <option value="Day 30 Handoff Due">⚠️ Day 30 Handoff Due</option>
            </select>

            {/* 4. Account */}
            <select
              value={accountFilter}
              onChange={(e) => setAccountFilter(e.target.value)}
              className="h-9 w-full rounded-xl border border-[#D7DEE8] bg-[#F8FAFC] px-2.5 text-xs font-semibold text-[#042C51] outline-none transition hover:border-[#FF5C28]/40 hover:bg-white focus:border-[#FF5C28] cursor-pointer"
            >
              <option value="All">All Accounts</option>
              {accountsList.filter(a => a !== "All").map(acc => (
                <option key={acc} value={acc}>{acc}</option>
              ))}
            </select>

            {/* 5. Site */}
            <select
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              className="h-9 w-full rounded-xl border border-[#D7DEE8] bg-[#F8FAFC] px-2.5 text-xs font-semibold text-[#042C51] outline-none transition hover:border-[#FF5C28]/40 hover:bg-white focus:border-[#FF5C28] cursor-pointer"
            >
              <option value="All">All Sites</option>
              {locationsList.filter(l => l !== "All").map(loc => (
                <option key={loc} value={loc}>{loc}</option>
              ))}
            </select>

            {/* 6. Trainer */}
            <select
              value={trainerFilter}
              onChange={(e) => setTrainerFilter(e.target.value)}
              className="h-9 w-full rounded-xl border border-[#D7DEE8] bg-[#F8FAFC] px-2.5 text-xs font-semibold text-[#042C51] outline-none transition hover:border-[#FF5C28]/40 hover:bg-white focus:border-[#FF5C28] cursor-pointer"
            >
              <option value="All">All Trainers</option>
              {trainersList.filter(t => t !== "All").map(trn => (
                <option key={trn} value={trn}>{trn}</option>
              ))}
            </select>

            {/* 7. Action / Alert */}
            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="h-9 w-full rounded-xl border border-[#D7DEE8] bg-[#F8FAFC] px-2.5 text-xs font-semibold text-[#042C51] outline-none transition hover:border-[#FF5C28]/40 hover:bg-white focus:border-[#FF5C28] cursor-pointer"
            >
              <option value="All">All HR Actions &amp; Alerts</option>
              <option value="Handoff Due">⚠️ Day 30 Handoff Due</option>
              <option value="True Hire">True Hire Placements</option>
              <option value="Drop-offs">Drop-offs (No Show / Withdrawn)</option>
              <option value="Open Actions">Open Coaching Actions</option>
            </select>
          </div>
        </header>

        <div className="relative z-[1] p-3 sm:p-4 2xl:p-5">
          {/* Desktop Table View */}
          <div className="hidden overflow-hidden rounded-xl border border-[#E6ECF2] bg-white md:block">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1280px] border-collapse bg-white text-left text-xs">
                <thead className="bg-[#F8FAFC] text-[10px] font-extrabold uppercase text-[#667085] border-b border-[#E6ECF2]">
                  <tr>
                    <th className="px-3.5 py-3">1. Employee / Candidate</th>
                    <th className="px-3.5 py-3">2. Onboarding Status</th>
                    <th className="px-3.5 py-3">3. Trainer &amp; TA Owner</th>
                    <th className="px-3.5 py-3 min-w-[130px]">4. Journey Progress</th>
                    <th className="px-3.5 py-3 min-w-[210px]">5. Milestone Performance</th>
                    <th className="px-3.5 py-3">6. HR Action</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-[#F1F5F9]">
                  {filteredUnifiedRoster.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-5 py-12 text-center text-xs font-bold text-[#667085]">
                        No onboarding candidates or trainees match the current search and filters.
                      </td>
                    </tr>
                  ) : (
                    filteredUnifiedRoster.map((row) => {
                      const handleRowClick = () => {
                        const targetRecord: OnboardingRecord = row.onboardingRecord || {
                          id: row.id,
                          name: row.name,
                          email: row.email || "",
                          phone: row.phone || "",
                          role: row.role,
                          account: row.account,
                          siteLocation: row.siteLocation,
                          offerAcceptedDate: row.offerAcceptedDate || "",
                          expectedStartDate: row.expectedStartDate || "",
                          actualStartDate: row.actualStartDate,
                          onboardingStage: row.onboardingStage,
                          showStatus: row.showStatus as any,
                          finalOutcome: row.finalOutcome as any,
                          owner: row.taOwner,
                          convertedEmployeeId: row.sibsId,
                          auditTrail: []
                        };
                        setSelectedRecord(targetRecord);
                        setIsDetailsModalOpen(true);
                      };

                      return (
                        <tr
                          key={row.key}
                          onClick={handleRowClick}
                          className="group transition-colors hover:bg-[#F8FAFC] cursor-pointer"
                        >
                          {/* 1. EMPLOYEE / CANDIDATE */}
                          <td className="px-3.5 py-3 align-middle">
                            <div className="flex items-center gap-2.5">
                              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#042C51] text-[10px] font-extrabold text-white shadow-sm">
                                {getInitials(row.name)}
                              </span>
                              <div className="min-w-0">
                                <span className="font-extrabold text-[#042C51] group-hover:text-[#FF5C28] text-left transition-colors text-xs block truncate max-w-[200px]">
                                  {row.name}
                                </span>

                                <div className="mt-0.5 flex items-center gap-1 flex-wrap">
                                  {row.sibsId ? (
                                    <span className="font-mono text-[9px] font-extrabold bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded border border-emerald-200">
                                      #{row.sibsId}
                                    </span>
                                  ) : (
                                    <span className="font-mono text-[9px] font-extrabold bg-slate-100 text-slate-700 px-1.5 py-0.2 rounded border border-slate-200">
                                      {row.id}
                                    </span>
                                  )}
                                </div>

                                <p className="mt-0.5 text-[10px] font-semibold text-[#667085] truncate max-w-[200px]">
                                  {row.role} • <strong className="text-[#042C51]">{row.account}</strong> ({row.siteLocation})
                                </p>
                              </div>
                            </div>
                          </td>

                          {/* 2. ONBOARDING STATUS */}
                          <td className="px-3.5 py-3 align-middle">
                            <div className="space-y-1 min-w-[150px]">
                              <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[9.5px] font-extrabold shadow-2xs ${getOnboardingStageBadgeClass(row.onboardingStage)}`}>
                                <span className="w-1.5 h-1.5 rounded-full bg-current" />
                                {row.onboardingStage}
                              </span>

                              <div className="flex items-center gap-1 text-[10px] text-slate-600 font-semibold">
                                <Calendar size={11} className="text-[#98A2B3] shrink-0" />
                                <span>Start: {formatDisplayDate(row.actualStartDate || row.expectedStartDate)}</span>
                              </div>

                              {row.finalOutcome === "True Hire" ? (
                                <span className="inline-flex items-center gap-1 text-[9px] font-extrabold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                                  <CheckCircle2 size={10} /> True Hire Confirmed
                                </span>
                              ) : row.finalOutcome === "No Show" || row.finalOutcome === "Pre-start Withdrawal" ? (
                                <span className="inline-flex items-center gap-1 text-[9px] font-extrabold text-rose-700 bg-rose-50 px-1.5 py-0.2 rounded border border-rose-200">
                                  <XCircle size={10} /> {row.finalOutcome}
                                </span>
                              ) : (
                                <span className="text-[9px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200">
                                  Pending Start
                                </span>
                              )}
                            </div>
                          </td>

                          {/* 3. ASSIGNED TRAINER & TA OWNER */}
                          <td className="px-3.5 py-3 align-middle text-xs font-semibold text-[#344054]">
                            <div className="space-y-1 min-w-[160px]">
                              <div>
                                <span className="text-[9.5px] text-slate-400 font-bold block uppercase">Trainer</span>
                                <strong className="text-xs text-[#042C51] block truncate">{row.assignedTrainer}</strong>
                              </div>
                              <div>
                                <span className="text-[9.5px] text-slate-400 font-bold block uppercase">TL / TA Owner</span>
                                <span className="text-[11px] text-slate-600 block truncate">{row.assignedTL}</span>
                              </div>

                              <span className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[9px] font-extrabold ${row.handoffBadge.tone} ${row.handoffBadge.isAlert ? "animate-pulse" : ""}`}>
                                {row.handoffBadge.isAlert && <AlertTriangle size={10} className="text-[#FF5C28]" />}
                                {row.handoffBadge.label}
                              </span>
                            </div>
                          </td>

                          {/* 4. JOURNEY PROGRESS */}
                          <td className="px-3.5 py-3 align-middle">
                            <div className="w-32 space-y-1">
                              <div className="flex justify-between items-baseline text-[10.5px]">
                                <strong className="font-extrabold text-[#042C51]">Day {row.daysElapsed}/90</strong>
                                <span className="text-slate-500 font-bold">{row.overallProgressPct}%</span>
                              </div>
                              <div className="w-full h-1.5 bg-[#E6EAF0] rounded-full overflow-hidden">
                                <div className="h-full bg-gradient-to-r from-[#042C51] to-[#FF5C28] rounded-full" style={{ width: `${row.overallProgressPct}%` }} />
                              </div>
                              <span className="text-[9.5px] font-bold text-slate-600 block truncate">
                                {row.journeyPhase}
                              </span>
                            </div>
                          </td>

                          {/* 5. MILESTONE PERFORMANCE */}
                          <td className="px-3.5 py-3 align-middle">
                            <div className="space-y-1.5 min-w-[200px]">
                              <div className="grid grid-cols-3 gap-1 text-[10px]">
                                <div className="p-1 rounded bg-[#F8FAFC] border border-[#E6ECF2] text-center">
                                  <span className="text-[8.5px] font-extrabold text-slate-400 block uppercase">Day 30</span>
                                  <strong className="font-black text-[#042C51] block">
                                    {row.day30Score !== null ? `${row.day30Score}%` : "—"}
                                  </strong>
                                </div>

                                <div className="p-1 rounded bg-[#F8FAFC] border border-[#E6ECF2] text-center">
                                  <span className="text-[8.5px] font-extrabold text-slate-400 block uppercase">Day 60</span>
                                  <strong className="font-black text-[#042C51] block">
                                    {row.day60Score !== null ? `${row.day60Score}%` : "—"}
                                  </strong>
                                </div>

                                <div className="p-1 rounded bg-[#F8FAFC] border border-[#E6ECF2] text-center">
                                  <span className="text-[8.5px] font-extrabold text-slate-400 block uppercase">Day 90</span>
                                  <strong className="font-black text-[#042C51] block">
                                    {row.day90Score !== null ? `${row.day90Score}%` : "—"}
                                  </strong>
                                </div>
                              </div>

                              <div className="flex items-center justify-between text-[9.5px] font-bold text-slate-500">
                                <span>30 Status: <strong className="text-[#042C51]">{row.day30Status}</strong></span>
                                <span>60: <strong className="text-[#042C51]">{row.day60Status}</strong></span>
                              </div>
                            </div>
                          </td>

                          {/* 6. HR ACTION */}
                          <td className="px-3.5 py-3 align-middle">
                            <div className="space-y-1 min-w-[130px]">
                              {row.handoffBadge.isAlert ? (
                                <span className="inline-flex items-center gap-1 rounded-full bg-orange-100 px-2 py-0.5 text-[9.5px] font-black text-[#FF5C28] border border-orange-200 animate-pulse">
                                  ⚠️ Handoff Due
                                </span>
                              ) : row.reviewsDueCount > 0 ? (
                                <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[9.5px] font-bold text-amber-900 border border-amber-200">
                                  <Clock size={10} /> {row.reviewsDueCount} Review Due
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[9.5px] font-bold text-emerald-800 border border-emerald-200">
                                  <CheckCircle2 size={10} /> Up to Date
                                </span>
                              )}

                              {row.openActionsCount > 0 && (
                                <span className="block text-[9.5px] font-bold text-rose-700 bg-rose-50 px-1.5 py-0.2 rounded border border-rose-200">
                                  {row.openActionsCount} Coaching Action Open
                                </span>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>



      {/* Process Note */}
      <section className="flex items-start gap-3 rounded-xl border border-blue-100 bg-[#F7FAFE] px-3.5 py-3">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#EAF0F7] text-[#042C51]">
          <Info size={15} />
        </span>

        <div className="min-w-0">
          <h3 className="text-[13px] font-extrabold text-[#042C51]">
            Onboarding Transition Rule
          </h3>
          <p className="mt-0.5 text-xs font-medium leading-5 text-[#667085]">
            Accepted Offer creates onboarding. Start Date, Show / No Show, and Pre-start Withdrawal
            must be captured. Only Show becomes True Hire and should move the candidate to Hired.
          </p>
        </div>
      </section>
      {/* 30/60/90 Employee Journey Detail Modal when selected */}
      {selectedJourney && (
        <Review306090Modal
          journey={selectedJourney}
          isOpen={!!selectedJourney}
          onClose={() => setSelectedJourney(null)}
        />
      )}

      {/* Create Onboarding Modal */}
      <AnimatePresence>
        {isCreateModalOpen && (
          <div
            className="fixed inset-0 z-[10000] flex h-dvh items-center justify-center bg-[#042C51]/60 px-2 py-2 font-jakarta backdrop-blur-sm sm:px-4 sm:py-4"
            onMouseDown={() => setIsCreateModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.97, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.97, opacity: 0 }}
              className="flex max-h-[92dvh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
              onMouseDown={(event) => event.stopPropagation()}
            >
              <header className="flex shrink-0 items-center justify-between gap-4 bg-[#042C51] px-5 py-4 text-white sm:px-6">
                <div className="flex min-w-0 items-center gap-3">
                  <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#FF5C28] text-white shadow-sm">
                    <UserPlus size={17} />
                  </span>

                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="truncate text-sm font-extrabold text-white sm:text-base">
                        Add Onboarding Record
                      </h2>
                      <span className="rounded-full border border-amber-300/25 bg-amber-300/10 px-2.5 py-1 text-[8px] font-extrabold uppercase tracking-wide text-amber-200 sm:text-[9px]">
                        Pending Start
                      </span>
                    </div>
                    <p className="mt-0.5 truncate text-[10px] font-semibold text-white/75">
                      Convert an accepted offer or manual candidate into active onboarding tracking.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-white/15 bg-white/10 text-white/80 transition hover:border-[#FF5C28]/60 hover:bg-[#FF5C28] hover:text-white"
                  aria-label="Close Add Onboarding Record"
                >
                  <X size={17} />
                </button>
              </header>

              <form
                onSubmit={handleCreateOnboarding}
                className="min-h-0 flex-1 overflow-y-auto bg-[#F7F9FC] p-4 sm:p-5"
              >
                <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_330px]">
                  <div className="min-w-0 space-y-4">
                    <section className="rounded-2xl border border-[#E6ECF2] bg-white p-4 shadow-sm sm:p-5">
                      <div className="mb-4 flex items-start justify-between gap-3 border-b border-[#EEF2F6] pb-3">
                        <div className="min-w-0">
                          <p className="text-[9px] font-extrabold uppercase tracking-wide text-[#98A2B3]">
                            Step 1
                          </p>
                          <h3 className="mt-0.5 text-xs font-extrabold text-[#042C51]">
                            Candidate & Accepted Offer
                          </h3>
                          <p className="mt-0.5 text-[10px] font-semibold text-[#667085]">
                            Import an accepted offer when available or complete the candidate fields manually.
                          </p>
                        </div>
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-blue-100 bg-blue-50 text-[#042C51]">
                          <Briefcase size={16} />
                        </span>
                      </div>

                      {pendingOffers.length > 0 ? (
                        <div className="mb-4">
                          <label className="mb-1.5 block text-[9px] font-extrabold uppercase tracking-wide text-[#98A2B3]">
                            Accepted Offer
                          </label>
                          <select
                            value={selectedAcceptedOfferId}
                            onChange={(event) => handleSelectPendingOffer(event.target.value)}
                            className="h-10 w-full rounded-xl border border-[#D7DEE8] bg-[#F8FAFC] px-3 text-xs font-semibold text-[#042C51] outline-none transition hover:border-[#FF5C28]/45 focus:border-[#FF5C28] focus:bg-white focus:ring-4 focus:ring-[#FF5C28]/10"
                          >
                            <option value="">Select accepted offer candidate</option>
                            {pendingOffers.map((offer) => (
                              <option key={offer.id} value={offer.id}>
                                {offer.id} — {offer.candidateName} ({offer.appliedPosition || offer.role} • {offer.account})
                              </option>
                            ))}
                          </select>
                        </div>
                      ) : null}

                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <label className="block sm:col-span-2">
                          <span className="mb-1.5 block text-[9px] font-extrabold uppercase tracking-wide text-[#98A2B3]">
                            Candidate Name <span className="text-[#FF5C28]">*</span>
                          </span>
                          <input
                            type="text"
                            required
                            value={newName}
                            onChange={(event) => setNewName(event.target.value)}
                            placeholder="Candidate full name"
                            className="h-10 w-full rounded-xl border border-[#D7DEE8] bg-[#F8FAFC] px-3 text-xs font-semibold text-[#042C51] outline-none transition placeholder:text-[#98A2B3] hover:border-[#FF5C28]/45 focus:border-[#FF5C28] focus:bg-white focus:ring-4 focus:ring-[#FF5C28]/10"
                          />
                        </label>

                        <label className="block">
                          <span className="mb-1.5 block text-[9px] font-extrabold uppercase tracking-wide text-[#98A2B3]">
                            Email Address <span className="text-[#FF5C28]">*</span>
                          </span>
                          <input
                            type="email"
                            required
                            value={newEmail}
                            onChange={(event) => setNewEmail(event.target.value)}
                            placeholder="candidate@email.com"
                            className="h-10 w-full rounded-xl border border-[#D7DEE8] bg-[#F8FAFC] px-3 text-xs font-semibold text-[#042C51] outline-none transition placeholder:text-[#98A2B3] hover:border-[#FF5C28]/45 focus:border-[#FF5C28] focus:bg-white focus:ring-4 focus:ring-[#FF5C28]/10"
                          />
                        </label>

                        <label className="block">
                          <span className="mb-1.5 block text-[9px] font-extrabold uppercase tracking-wide text-[#98A2B3]">
                            Contact Phone <span className="text-[#FF5C28]">*</span>
                          </span>
                          <input
                            type="text"
                            required
                            value={newPhone}
                            onChange={(event) => setNewPhone(event.target.value)}
                            placeholder="+63 917 123 4567"
                            className="h-10 w-full rounded-xl border border-[#D7DEE8] bg-[#F8FAFC] px-3 text-xs font-semibold text-[#042C51] outline-none transition placeholder:text-[#98A2B3] hover:border-[#FF5C28]/45 focus:border-[#FF5C28] focus:bg-white focus:ring-4 focus:ring-[#FF5C28]/10"
                          />
                        </label>
                      </div>
                    </section>

                    <section className="rounded-2xl border border-[#E6ECF2] bg-white p-4 shadow-sm sm:p-5">
                      <div className="mb-4 flex items-start justify-between gap-3 border-b border-[#EEF2F6] pb-3">
                        <div>
                          <p className="text-[9px] font-extrabold uppercase tracking-wide text-[#98A2B3]">
                            Step 2
                          </p>
                          <h3 className="mt-0.5 text-xs font-extrabold text-[#042C51]">
                            Assignment & Start Details
                          </h3>
                          <p className="mt-0.5 text-[10px] font-semibold text-[#667085]">
                            Set the role, account, site, owner, and expected start timeline.
                          </p>
                        </div>
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-orange-100 bg-orange-50 text-[#FF5C28]">
                          <Calendar size={16} />
                        </span>
                      </div>

                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <label className="block">
                          <span className="mb-1.5 block text-[9px] font-extrabold uppercase tracking-wide text-[#98A2B3]">
                            Job Designation Role
                          </span>
                          <select
                            value={newRole}
                            onChange={(event) => setNewRole(event.target.value)}
                            className="h-10 w-full rounded-xl border border-[#D7DEE8] bg-[#F8FAFC] px-3 text-xs font-semibold text-[#042C51] outline-none transition hover:border-[#FF5C28]/45 focus:border-[#FF5C28] focus:bg-white focus:ring-4 focus:ring-[#FF5C28]/10"
                          >
                            <option value="Customer Service Representative">Customer Service Representative</option>
                            <option value="Technical Support Associate">Technical Support Associate</option>
                            <option value="Healthcare Support Specialist">Healthcare Support Specialist</option>
                            <option value="Team Leader - BPO Operations">Team Leader - BPO Operations</option>
                          </select>
                        </label>

                        <label className="block">
                          <span className="mb-1.5 block text-[9px] font-extrabold uppercase tracking-wide text-[#98A2B3]">
                            Assigned Campaign Account
                          </span>
                          <select
                            value={newAccount}
                            onChange={(event) => setNewAccount(event.target.value)}
                            className="h-10 w-full rounded-xl border border-[#D7DEE8] bg-[#F8FAFC] px-3 text-xs font-semibold text-[#042C51] outline-none transition hover:border-[#FF5C28]/45 focus:border-[#FF5C28] focus:bg-white focus:ring-4 focus:ring-[#FF5C28]/10"
                          >
                            <option value="Elevance Health">Elevance Health</option>
                            <option value="Chevron Support">Chevron Support</option>
                            <option value="Comcast Technical">Comcast Technical</option>
                            <option value="Citi Global">Citi Global</option>
                            <option value="Capital One Help">Capital One Help</option>
                            <option value="RingCentral Team">RingCentral Team</option>
                          </select>
                        </label>

                        <label className="block">
                          <span className="mb-1.5 block text-[9px] font-extrabold uppercase tracking-wide text-[#98A2B3]">
                            Site Location
                          </span>
                          <select
                            value={newSiteLocation}
                            onChange={(event) => setNewSiteLocation(event.target.value)}
                            className="h-10 w-full rounded-xl border border-[#D7DEE8] bg-[#F8FAFC] px-3 text-xs font-semibold text-[#042C51] outline-none transition hover:border-[#FF5C28]/45 focus:border-[#FF5C28] focus:bg-white focus:ring-4 focus:ring-[#FF5C28]/10"
                          >
                            <option value="SiBS Tagum">SiBS Tagum</option>
                            <option value="SiBS Davao">SiBS Davao</option>
                            <option value="SiBS Mabini">SiBS Mabini</option>
                          </select>
                        </label>

                        <label className="block">
                          <span className="mb-1.5 block text-[9px] font-extrabold uppercase tracking-wide text-[#98A2B3]">
                            Onboarding Recruiter / Owner
                          </span>
                          <input
                            type="text"
                            value={newOwner}
                            onChange={(event) => setNewOwner(event.target.value)}
                            className="h-10 w-full rounded-xl border border-[#D7DEE8] bg-[#F8FAFC] px-3 text-xs font-semibold text-[#042C51] outline-none transition hover:border-[#FF5C28]/45 focus:border-[#FF5C28] focus:bg-white focus:ring-4 focus:ring-[#FF5C28]/10"
                          />
                        </label>

                        <label className="block">
                          <span className="mb-1.5 block text-[9px] font-extrabold uppercase tracking-wide text-[#98A2B3]">
                            Offer Accepted Date
                          </span>
                          <input
                            type="date"
                            required
                            value={newOfferAcceptedDate}
                            onChange={(event) => setNewOfferAcceptedDate(event.target.value)}
                            className="h-10 w-full rounded-xl border border-[#D7DEE8] bg-[#F8FAFC] px-3 text-xs font-semibold tabular-nums text-[#042C51] outline-none transition hover:border-[#FF5C28]/45 focus:border-[#FF5C28] focus:bg-white focus:ring-4 focus:ring-[#FF5C28]/10"
                          />
                        </label>

                        <label className="block">
                          <span className="mb-1.5 block text-[9px] font-extrabold uppercase tracking-wide text-[#98A2B3]">
                            Expected Start Date <span className="text-[#FF5C28]">*</span>
                          </span>
                          <input
                            type="date"
                            required
                            value={newExpectedStartDate}
                            onChange={(event) => setNewExpectedStartDate(event.target.value)}
                            className="h-10 w-full rounded-xl border border-[#D7DEE8] bg-[#F8FAFC] px-3 text-xs font-semibold tabular-nums text-[#042C51] outline-none transition hover:border-[#FF5C28]/45 focus:border-[#FF5C28] focus:bg-white focus:ring-4 focus:ring-[#FF5C28]/10"
                          />
                        </label>
                      </div>
                    </section>
                  </div>

                  <aside className="space-y-4 xl:sticky xl:top-0 xl:self-start">
                    <section className="rounded-2xl border border-[#083A69] bg-[#042C51] p-4 text-white shadow-sm">
                      <div className="flex items-start gap-3">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[#FF5C28]/30 bg-[#FF5C28]/15 text-[#FF5C28]">
                          <Info size={16} />
                        </span>
                        <div>
                          <p className="text-[9px] font-extrabold uppercase tracking-wide text-[#FFB9A2]">
                            System Relationship
                          </p>
                          <h3 className="mt-1 text-xs font-extrabold text-white">
                            Accepted Offer → Onboarding
                          </h3>
                          <p className="mt-2 text-[10px] font-semibold leading-5 text-slate-200">
                            Accepted offers are synchronized from the Offers module. Creating this record initializes pre-start tracking.
                          </p>
                        </div>
                      </div>
                    </section>

                    <section className="rounded-2xl border border-[#E6ECF2] bg-white p-4 shadow-sm">
                      <div className="flex items-center gap-2">
                        <CheckCircle size={15} className="text-emerald-600" />
                        <h3 className="text-xs font-extrabold text-[#042C51]">
                          Default Initial Status
                        </h3>
                      </div>
                      <div className="mt-3 space-y-2">
                        {[
                          ["Show Status", "Pending", "text-amber-700"],
                          ["Final Outcome", "Pending Start", "text-amber-700"],
                          ["Actual Start", "Not yet started", "text-[#475467]"],
                          ["Placement Count", "Not counted yet", "text-[#475467]"],
                        ].map(([label, value, tone]) => (
                          <div key={label} className="flex items-start justify-between gap-3 border-b border-[#EEF2F6] py-2 last:border-b-0">
                            <span className="text-[9px] font-extrabold uppercase tracking-wide text-[#98A2B3]">
                              {label}
                            </span>
                            <span className={`text-right text-[10px] font-extrabold ${tone}`}>
                              {value}
                            </span>
                          </div>
                        ))}
                      </div>
                    </section>

                    <section className="rounded-2xl border border-amber-100 bg-amber-50 p-4">
                      <p className="text-[9px] font-extrabold uppercase tracking-wide text-amber-700">
                        Automation Note
                      </p>
                      <p className="mt-1 text-[10px] font-semibold leading-5 text-amber-800">
                        Candidate Pipeline synchronization may create or refresh Pending Start records automatically.
                      </p>
                    </section>
                  </aside>
                </div>
              </form>

              <footer className="shrink-0 border-t border-[#E6ECF2] bg-white px-5 py-3.5 sm:px-6">
                <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedAcceptedOfferId("");
                      setNewName("");
                      setNewEmail("");
                      setNewPhone("");
                      setNewRole("Customer Service Representative");
                      setNewAccount("Elevance Health");
                      setNewSiteLocation("SiBS Tagum");
                      setNewOfferAcceptedDate("2026-07-20");
                      setNewExpectedStartDate("2026-08-01");
                      setNewOwner("Alena Batacan");
                    }}
                    className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-[#D6E0EA] bg-white px-4 text-xs font-extrabold text-[#667085] transition hover:border-[#FF5C28]/35 hover:bg-[#FFF8F5] hover:text-[#FF5C28]"
                  >
                    <RefreshCw size={14} />
                    Reset
                  </button>

                  <div className="flex flex-col-reverse gap-2 sm:flex-row">
                    <button
                      type="button"
                      onClick={() => setIsCreateModalOpen(false)}
                      className="inline-flex h-10 items-center justify-center rounded-lg border border-[#D6E0EA] bg-white px-4 text-xs font-extrabold text-[#667085] transition hover:border-[#FF5C28]/35 hover:bg-[#FFF8F5] hover:text-[#FF5C28]"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      onClick={handleCreateOnboarding}
                      className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-[#FF5C28] px-5 text-xs font-extrabold text-white shadow-sm transition hover:bg-[#E94F1F] active:scale-[0.98]"
                    >
                      <Plus size={14} />
                      Save Onboarding Record
                    </button>
                  </div>
                </div>
              </footer>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Comprehensive Onboarding & Employee Profile Modal */}
      <OnboardingDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        record={selectedRecord as any}
        onOpenOutcomeModal={() => {
          if (selectedRecord) {
            handleOpenOutcomeModal(selectedRecord);
          }
        }}
        onOpenStageModal={() => {
          if (selectedRecord) {
            handleOpenOutcomeModal(selectedRecord);
          }
        }}
      />


      {/* Outcome Modal */}
      <AnimatePresence>
        {isOutcomeModalOpen && outcomeTargetRecord && (
          <div
            className="fixed inset-0 z-[10020] flex h-dvh items-center justify-center bg-[#042C51]/60 px-2 py-2 font-jakarta backdrop-blur-sm sm:px-4 sm:py-4"
            onMouseDown={() => setIsOutcomeModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.97, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.97, opacity: 0 }}
              className="flex max-h-[92dvh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
              onMouseDown={(event) => event.stopPropagation()}
            >
              <header className="flex shrink-0 items-start justify-between gap-4 bg-[#042C51] px-5 py-4 text-white sm:px-6">
                <div className="min-w-0">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-2.5 py-1 text-[9px] font-extrabold uppercase tracking-wide text-white/90">
                    <Settings size={12} className="text-[#FF5C28]" />
                    Stage & Outcome Resolution
                  </span>
                  <h2 className="mt-2 text-sm font-extrabold text-white sm:text-base">
                    Update Onboarding Stage & Start Disposition
                  </h2>
                  <p className="mt-0.5 text-[10px] font-semibold text-white/75">
                    Update candidate stage, Day 1 transition, and operational disposition.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setIsOutcomeModalOpen(false)}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-white/15 bg-white/10 text-white/80 transition hover:border-[#FF5C28]/60 hover:bg-[#FF5C28] hover:text-white"
                  aria-label="Close outcome modal"
                >
                  <X size={17} />
                </button>
              </header>

              <div className="min-h-0 flex-1 overflow-y-auto bg-[#F7F9FC] p-4 sm:p-5">
                <div className="space-y-4">
                  <section className={`rounded-2xl border p-4 ${
                    outcomeShowStatus === "Show"
                      ? "border-emerald-100 bg-emerald-50"
                      : outcomeShowStatus === "No Show"
                        ? "border-red-100 bg-red-50"
                        : outcomeShowStatus === "Withdrawn"
                          ? "border-orange-100 bg-orange-50"
                          : "border-amber-100 bg-amber-50"
                  }`}>
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0">
                        <p className="text-[9px] font-extrabold uppercase tracking-wide text-[#667085]">
                          Candidate
                        </p>
                        <h3 className="mt-1 text-xs font-extrabold text-[#042C51]">
                          {outcomeTargetRecord.name}
                        </h3>
                        <p className="mt-0.5 text-[10px] font-semibold text-[#667085]">
                          {outcomeTargetRecord.role} • {outcomeTargetRecord.account}
                        </p>
                      </div>

                      <span className="rounded-full border border-white/80 bg-white/75 px-2.5 py-1 text-[9px] font-extrabold text-[#475467]">
                        Expected: {formatDisplayDate(outcomeTargetRecord.expectedStartDate)}
                      </span>
                    </div>
                  </section>

                  <section className="rounded-2xl border border-[#E6ECF2] bg-white p-4 shadow-sm">
                    <label className="block">
                      <span className="mb-1.5 block text-[9px] font-extrabold uppercase tracking-wide text-[#98A2B3]">
                        Onboarding Stage & Start Disposition
                      </span>
                      <select
                        value={outcomeStage}
                        onChange={(event) => {
                          const val = event.target.value;
                          setOutcomeStage(val);
                          if (val === "Day 1 - Handed Off to Training" || val === "Completed Onboarding") {
                            setOutcomeShowStatus("Show");
                          } else if (val === "No Show") {
                            setOutcomeShowStatus("No Show");
                          } else if (val === "Pre-start Withdrawal") {
                            setOutcomeShowStatus("Withdrawn");
                          } else {
                            setOutcomeShowStatus("Pending");
                          }
                        }}
                        className="h-10 w-full rounded-xl border border-[#D7DEE8] bg-[#F8FAFC] px-3 text-xs font-semibold text-[#042C51] outline-none transition hover:border-[#FF5C28]/45 focus:border-[#FF5C28] focus:bg-white focus:ring-4 focus:ring-[#FF5C28]/10 cursor-pointer"
                      >
                        {ONBOARDING_STAGES.map((st) => (
                          <option key={st} value={st}>
                            {st}
                          </option>
                        ))}
                      </select>
                    </label>

                    {(outcomeStage === "Day 1 - Handed Off to Training" || outcomeStage === "Completed Onboarding" || outcomeShowStatus === "Show") ? (
                      <label className="mt-4 block">
                        <span className="mb-1.5 block text-[9px] font-extrabold uppercase tracking-wide text-[#98A2B3]">
                          Actual Start Date <span className="text-[#FF5C28]">*</span>
                        </span>
                        <input
                          type="date"
                          value={outcomeActualDate}
                          onChange={(event) => setOutcomeActualDate(event.target.value)}
                          className="h-10 w-full rounded-xl border border-[#D7DEE8] bg-[#F8FAFC] px-3 text-xs font-semibold tabular-nums text-[#042C51] outline-none transition hover:border-[#FF5C28]/45 focus:border-[#FF5C28] focus:bg-white focus:ring-4 focus:ring-[#FF5C28]/10"
                        />
                      </label>
                    ) : null}

                    <div className="mt-4">
                      <span className="mb-1.5 block text-[9px] font-extrabold uppercase tracking-wide text-[#98A2B3]">
                        Candidate Experience Rating
                      </span>
                      <div className="flex items-center gap-2 rounded-xl border border-[#E6ECF2] bg-[#F8FAFC] p-2.5">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            type="button"
                            key={star}
                            onClick={() => setOutcomeFeedbackRating(star)}
                            className="rounded-lg p-1 transition hover:scale-110 hover:bg-white"
                          >
                            <Star
                              className={`h-5 w-5 ${
                                star <= outcomeFeedbackRating
                                  ? "fill-amber-400 text-amber-400"
                                  : "text-slate-300"
                              }`}
                            />
                          </button>
                        ))}
                        <span className="ml-1 text-xs font-extrabold text-[#475467]">
                          {outcomeFeedbackRating}/5
                        </span>
                      </div>
                    </div>
                  </section>

                  {(outcomeShowStatus === "No Show" || outcomeShowStatus === "Withdrawn") ? (
                    <section className="rounded-2xl border border-[#E6ECF2] bg-white p-4 shadow-sm">
                      <div className="grid grid-cols-1 gap-4">
                        <label className="block">
                          <span className="mb-1.5 block text-[9px] font-extrabold uppercase tracking-wide text-[#98A2B3]">
                            Reason Category <span className="text-[#FF5C28]">*</span>
                          </span>
                          <select
                            value={outcomeWithdrawalReason}
                            onChange={(event) => setOutcomeWithdrawalReason(event.target.value)}
                            className="h-10 w-full rounded-xl border border-[#D7DEE8] bg-[#F8FAFC] px-3 text-xs font-semibold text-[#042C51] outline-none transition hover:border-[#FF5C28]/45 focus:border-[#FF5C28] focus:bg-white focus:ring-4 focus:ring-[#FF5C28]/10"
                          >
                            <option value="Compensation Gap / Counter Offer">Compensation Gap / Counter Offer</option>
                            <option value="Location / Commute Issues">Location / Commute Issues</option>
                            <option value="No Response / Ghosted Day 1">No Response / Ghosted Day 1</option>
                            <option value="Personal / Family / Health Reasons">Personal / Family / Health Reasons</option>
                            <option value="Selected Competitor Role">Selected Competitor Role</option>
                            <option value="Failed Background Audit / Clearance">Failed Background Audit / Clearance</option>
                          </select>
                        </label>

                        <label className="block">
                          <span className="mb-1.5 block text-[9px] font-extrabold uppercase tracking-wide text-[#98A2B3]">
                            {outcomeShowStatus === "No Show" ? "No Show Reason / Notes" : "Withdrawal Reason / Notes"}{" "}
                            <span className="text-[#FF5C28]">*</span>
                          </span>
                          <textarea
                            rows={3}
                            value={outcomeWithdrawalNotes}
                            onChange={(event) => setOutcomeWithdrawalNotes(event.target.value)}
                            placeholder="Document the candidate’s reason and any follow-up details..."
                            className="w-full resize-none rounded-xl border border-[#D7DEE8] bg-[#F8FAFC] px-3 py-2 text-xs font-semibold leading-5 text-[#042C51] outline-none transition placeholder:text-[#98A2B3] hover:border-[#FF5C28]/45 focus:border-[#FF5C28] focus:bg-white focus:ring-4 focus:ring-[#FF5C28]/10"
                          />
                        </label>
                      </div>
                    </section>
                  ) : null}

                  <section className="rounded-2xl border border-blue-100 bg-blue-50 p-4">
                    <div className="flex items-start gap-3">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#042C51] text-[#FF5C28]">
                        <Info size={15} />
                      </span>
                      <div>
                        <p className="text-[9px] font-extrabold uppercase tracking-wide text-[#042C51]">
                          System Action
                        </p>
                        <p className="mt-1 text-[10px] font-semibold leading-5 text-[#475467]">
                          {outcomeShowStatus === "Show"
                            ? "Confirming Show marks the candidate as a True Hire and synchronizes the employee record."
                            : outcomeShowStatus === "Pending"
                              ? "Pending keeps the onboarding record unresolved and does not count as a True Hire."
                              : "Confirming this drop-off keeps the candidate out of the True Hire count and archives the candidate to Talent Pool."}
                        </p>
                      </div>
                    </div>
                  </section>
                </div>
              </div>

              <footer className="shrink-0 border-t border-[#E6ECF2] bg-white px-5 py-3.5 sm:px-6">
                <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    onClick={() => setIsOutcomeModalOpen(false)}
                    className="inline-flex h-10 items-center justify-center rounded-lg border border-[#D6E0EA] bg-white px-4 text-xs font-extrabold text-[#667085] transition hover:bg-[#F8FAFC]"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveOutcome}
                    className={`inline-flex h-10 items-center justify-center gap-2 rounded-lg px-4 text-xs font-extrabold text-white shadow-sm transition active:scale-[0.98] ${
                      outcomeShowStatus === "Show"
                        ? "bg-emerald-600 hover:bg-emerald-700"
                        : outcomeShowStatus === "No Show"
                          ? "bg-red-600 hover:bg-red-700"
                          : outcomeShowStatus === "Withdrawn"
                            ? "bg-orange-600 hover:bg-orange-700"
                            : "bg-[#042C51] hover:bg-[#063C69]"
                    }`}
                  >
                    {outcomeShowStatus === "Show" ? (
                      <CheckCircle size={14} />
                    ) : outcomeShowStatus === "Pending" ? (
                      <Clock size={14} />
                    ) : (
                      <AlertTriangle size={14} />
                    )}
                    Confirm Outcome
                  </button>
                </div>
              </footer>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
