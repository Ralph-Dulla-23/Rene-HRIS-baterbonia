import React, { useState, useMemo, useEffect } from "react";
import {
  Users,
  Sparkles,
  Star,
  Search,
  Filter,
  Plus,
  X,
  FileText,
  CheckCircle2,
  AlertCircle,
  TrendingDown,
  TrendingUp,
  MessageSquare,
  Building2,
  Briefcase,
  ChevronRight,
  ArrowUpRight,
  Clock,
  UserCheck,
  UserX,
  RefreshCw,
  Download,
  Info,
  Calendar,
  Tag,
  Mail,
  User,
  ExternalLink,
  ChevronDown,
  Send,
  Copy,
  MailCheck,
  MessageSquareText,
  BarChart3
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import SendSurveyModal from "./SendSurveyModal";

export interface CandidateExperienceRecord {
  id: string;
  candidateCode: string;
  candidateName: string;
  candidateEmail: string;
  role: string;
  account: string;
  eventType: 
    | "Pipeline Drop-off" 
    | "Offer Declined" 
    | "Pre-start Withdrawal" 
    | "No Show" 
    | "Candidate Feedback" 
    | "Process Completed"
    | "Accepted Other Offer";
  status: "Drop-off" | "Completed";
  exitStage: "Sourced" | "Screened" | "Interviewed" | "Offered" | "Accepted" | "Hired";
  reasonCategory: 
    | "Compensation"
    | "Schedule"
    | "Process Delay"
    | "No Response"
    | "Failed Assessment"
    | "Failed Interview"
    | "Accepted Other Offer"
    | "Location Issue"
    | "Personal Reason"
    | "Incomplete Requirements"
    | "Process Satisfactory";
  reasonDescription: string;
  qualitativeFeedback: string;
  rating: number; // 1 to 5
  feedbackTag: string;
  dateRecorded: string;
  taOwner: string;
  stagesPassed: { stage: string; status: "Completed" | "Dropped" | "Pending"; timestamp: string }[];
  surveyStatus?: "submitted" | "opened" | "sent" | "pending" | "expired" | "not_sent";
  responseSource?: "candidate_survey" | "ta_manual";
  surveyToken?: string;
  surveySentAt?: string;
  surveySubmittedAt?: string;
}

interface CandidateExperiencePageProps {
  userEmail?: string;
  onSwitchModule?: (module: string) => void;
}

const INITIAL_EXPERIENCE_RECORDS: CandidateExperienceRecord[] = [
  {
    id: "EXP-801",
    candidateCode: "CAND-9102",
    candidateName: "Juan Dela Cruz",
    candidateEmail: "juan.delacruz@email.com",
    role: "Customer Service Representative",
    account: "Chevron Support",
    eventType: "Offer Declined",
    status: "Drop-off",
    exitStage: "Offered",
    reasonCategory: "Compensation",
    reasonDescription: "Offered base salary was 15% below candidate's current asking price and external offer.",
    qualitativeFeedback: "The interview process was very smooth and professional, but the financial package did not align with my expected ₱35,000 monthly target.",
    rating: 3,
    feedbackTag: "Compensation Concern",
    dateRecorded: "2026-08-04",
    taOwner: "Alena Batacan",
    stagesPassed: [
      { stage: "Sourced", status: "Completed", timestamp: "Jul 20, 2026" },
      { stage: "Screened", status: "Completed", timestamp: "Jul 22, 2026" },
      { stage: "Interviewed", status: "Completed", timestamp: "Jul 28, 2026" },
      { stage: "Offered", status: "Dropped", timestamp: "Aug 04, 2026" }
    ]
  },
  {
    id: "EXP-802",
    candidateCode: "CAND-9108",
    candidateName: "Maria Santos",
    candidateEmail: "maria.santos@gmail.com",
    role: "Healthcare Support Specialist",
    account: "Elevance Health",
    eventType: "Pipeline Drop-off",
    status: "Drop-off",
    exitStage: "Interviewed",
    reasonCategory: "Process Delay",
    reasonDescription: "Candidate withdrew due to 12-day waiting period between initial screening and hiring manager interview.",
    qualitativeFeedback: "I accepted another offer because I didn't hear back for over a week after my technical assessment.",
    rating: 2,
    feedbackTag: "Process Delay",
    dateRecorded: "2026-08-03",
    taOwner: "Carlos Ramos",
    stagesPassed: [
      { stage: "Sourced", status: "Completed", timestamp: "Jul 15, 2026" },
      { stage: "Screened", status: "Completed", timestamp: "Jul 18, 2026" },
      { stage: "Interviewed", status: "Dropped", timestamp: "Aug 03, 2026" }
    ]
  },
  {
    id: "EXP-803",
    candidateCode: "CAND-9115",
    candidateName: "Ramon Rodriguez",
    candidateEmail: "r.rodriguez@techmail.com",
    role: "Technical Support Associate",
    account: "Comcast Technical",
    eventType: "Process Completed",
    status: "Completed",
    exitStage: "Hired",
    reasonCategory: "Process Satisfactory",
    reasonDescription: "Candidate successfully onboarded with zero bottlenecks.",
    qualitativeFeedback: "Excellent recruitment team! Fast turnaround time from assessment to job offer. Excited to start at Mandaluyong HQ.",
    rating: 5,
    feedbackTag: "High Satisfaction",
    dateRecorded: "2026-08-02",
    taOwner: "Alena Batacan",
    stagesPassed: [
      { stage: "Sourced", status: "Completed", timestamp: "Jul 10, 2026" },
      { stage: "Screened", status: "Completed", timestamp: "Jul 12, 2026" },
      { stage: "Interviewed", status: "Completed", timestamp: "Jul 18, 2026" },
      { stage: "Offered", status: "Completed", timestamp: "Jul 25, 2026" },
      { stage: "Accepted", status: "Completed", timestamp: "Jul 27, 2026" },
      { stage: "Hired", status: "Completed", timestamp: "Aug 02, 2026" }
    ]
  },
  {
    id: "EXP-804",
    candidateCode: "CAND-9122",
    candidateName: "Beatriz Tan",
    candidateEmail: "bea.tan@outlook.com",
    role: "Team Leader - BPO Operations",
    account: "Citi Global",
    eventType: "Accepted Other Offer",
    status: "Drop-off",
    exitStage: "Interviewed",
    reasonCategory: "Accepted Other Offer",
    reasonDescription: "Received a competing TL offer from a hybrid financial account.",
    qualitativeFeedback: "Recruiters were respectful and thorough. Chosen competitor offered 100% remote work setup.",
    rating: 4,
    feedbackTag: "Work Setup Preference",
    dateRecorded: "2026-08-01",
    taOwner: "Patricia Gomez",
    stagesPassed: [
      { stage: "Sourced", status: "Completed", timestamp: "Jul 14, 2026" },
      { stage: "Screened", status: "Completed", timestamp: "Jul 17, 2026" },
      { stage: "Interviewed", status: "Dropped", timestamp: "Aug 01, 2026" }
    ]
  },
  {
    id: "EXP-805",
    candidateCode: "CAND-9130",
    candidateName: "Joshua Reyes",
    candidateEmail: "jreyes.works@gmail.com",
    role: "Customer Service Representative",
    account: "Chevron Support",
    eventType: "Pre-start Withdrawal",
    status: "Drop-off",
    exitStage: "Accepted",
    reasonCategory: "Schedule",
    reasonDescription: "Assigned rotational night shift clashed with family commitments.",
    qualitativeFeedback: "I requested a day shift slot during intake but was assigned a 10 PM start time upon medical clearance.",
    rating: 2,
    feedbackTag: "Schedule Mismatch",
    dateRecorded: "2026-07-30",
    taOwner: "Carlos Ramos",
    stagesPassed: [
      { stage: "Sourced", status: "Completed", timestamp: "Jul 05, 2026" },
      { stage: "Screened", status: "Completed", timestamp: "Jul 08, 2026" },
      { stage: "Interviewed", status: "Completed", timestamp: "Jul 15, 2026" },
      { stage: "Offered", status: "Completed", timestamp: "Jul 22, 2026" },
      { stage: "Accepted", status: "Dropped", timestamp: "Jul 30, 2026" }
    ]
  },
  {
    id: "EXP-806",
    candidateCode: "CAND-9138",
    candidateName: "Angela Mercado",
    candidateEmail: "angela.m@yahoo.com",
    role: "Healthcare Support Specialist",
    account: "Elevance Health",
    eventType: "Process Completed",
    status: "Completed",
    exitStage: "Hired",
    reasonCategory: "Process Satisfactory",
    reasonDescription: "Seamless candidate experience and friendly onboarding specialists.",
    qualitativeFeedback: "Very polite interviewers and clear instructions for medical requirements. Top notch recruitment!",
    rating: 5,
    feedbackTag: "Seamless Experience",
    dateRecorded: "2026-07-28",
    taOwner: "Alena Batacan",
    stagesPassed: [
      { stage: "Sourced", status: "Completed", timestamp: "Jul 01, 2026" },
      { stage: "Screened", status: "Completed", timestamp: "Jul 04, 2026" },
      { stage: "Interviewed", status: "Completed", timestamp: "Jul 10, 2026" },
      { stage: "Offered", status: "Completed", timestamp: "Jul 18, 2026" },
      { stage: "Accepted", status: "Completed", timestamp: "Jul 20, 2026" },
      { stage: "Hired", status: "Completed", timestamp: "Jul 28, 2026" }
    ]
  },
  {
    id: "EXP-807",
    candidateCode: "CAND-9145",
    candidateName: "Gabriel Navarro",
    candidateEmail: "g.navarro@gmail.com",
    role: "Financial Services Associate",
    account: "Chase Credit",
    eventType: "Pipeline Drop-off",
    status: "Drop-off",
    exitStage: "Screened",
    reasonCategory: "Location Issue",
    reasonDescription: "Commute distance to Mandaluyong site exceeded candidate limits.",
    qualitativeFeedback: "Site location is too far from my residence in Laguna. Would prefer satellite branch or wfh.",
    rating: 3,
    feedbackTag: "Location Distance",
    dateRecorded: "2026-07-27",
    taOwner: "Patricia Gomez",
    stagesPassed: [
      { stage: "Sourced", status: "Completed", timestamp: "Jul 22, 2026" },
      { stage: "Screened", status: "Dropped", timestamp: "Jul 27, 2026" }
    ]
  },
  {
    id: "EXP-808",
    candidateCode: "CAND-9152",
    candidateName: "Samantha Cruz",
    candidateEmail: "sam.cruz@outlook.com",
    role: "Technical Support Associate",
    account: "Comcast Technical",
    eventType: "No Show",
    status: "Drop-off",
    exitStage: "Interviewed",
    reasonCategory: "No Response",
    reasonDescription: "Candidate did not show up for final client interview panel and failed to respond to follow-ups.",
    qualitativeFeedback: "No feedback provided by candidate (Unreachable via call & email).",
    rating: 1,
    feedbackTag: "No Show / Unreachable",
    dateRecorded: "2026-07-25",
    taOwner: "Carlos Ramos",
    stagesPassed: [
      { stage: "Sourced", status: "Completed", timestamp: "Jul 10, 2026" },
      { stage: "Screened", status: "Completed", timestamp: "Jul 14, 2026" },
      { stage: "Interviewed", status: "Dropped", timestamp: "Jul 25, 2026" }
    ]
  }
];


const SURVEY_STATUS_OPTIONS = [
  "All",
  "submitted",
  "opened",
  "sent",
  "pending",
  "expired",
  "not_sent",
] as const;

type SurveyStatusFilter = (typeof SURVEY_STATUS_OPTIONS)[number];
type ResponseSourceFilter = "All" | "candidate_survey" | "ta_manual";

function getSurveyStatus(record: CandidateExperienceRecord) {
  if (record.surveyStatus) return record.surveyStatus;
  return record.responseSource === "candidate_survey" ? "submitted" : "not_sent";
}

function getResponseSource(record: CandidateExperienceRecord) {
  return record.responseSource || "ta_manual";
}

function getSurveyStatusLabel(value: string) {
  return {
    submitted: "Submitted",
    opened: "Opened",
    sent: "Sent",
    pending: "Pending",
    expired: "Expired",
    not_sent: "Not Sent",
  }[value] || value || "Not Sent";
}

function getResponseSourceLabel(value: string) {
  return value === "candidate_survey"
    ? "Candidate Survey"
    : value === "ta_manual"
      ? "TA Manual"
      : "Unknown";
}

function getInitials(name = "") {
  return String(name)
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "CE";
}

function formatDisplayDate(value = "") {
  if (!value) return "—";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleDateString("en-PH", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function surveyStatusClass(status = "") {
  return {
    submitted: "border-emerald-200 bg-emerald-50 text-emerald-700",
    opened: "border-blue-200 bg-blue-50 text-blue-700",
    sent: "border-cyan-200 bg-cyan-50 text-cyan-700",
    pending: "border-amber-200 bg-amber-50 text-amber-700",
    expired: "border-slate-200 bg-slate-100 text-slate-600",
    not_sent: "border-slate-200 bg-slate-50 text-slate-500",
  }[status] || "border-slate-200 bg-slate-50 text-slate-500";
}

function outcomeClass(outcome = "") {
  return outcome === "Drop-off"
    ? "border-rose-200 bg-rose-50 text-rose-700"
    : "border-emerald-200 bg-emerald-50 text-emerald-700";
}

function responseSourceClass(source = "") {
  return source === "candidate_survey"
    ? "border-blue-200 bg-blue-50 text-[#042C51]"
    : "border-orange-200 bg-orange-50 text-[#C2410C]";
}

function normalizeIncomingExperienceRecord(
  raw: Partial<CandidateExperienceRecord> & Record<string, any>,
): CandidateExperienceRecord {
  const stages: { stage: string; status: "Completed" | "Dropped" | "Pending"; timestamp: string }[] = Array.isArray(raw.stagesPassed)
    ? raw.stagesPassed.map((item: any) => ({
        stage: String(item.stage || "Unknown Stage"),
        status: (item.status === "Dropped" || item.status === "Pending" ? item.status : "Completed") as "Completed" | "Dropped" | "Pending",
        timestamp: String(item.timestamp || item.date || "Recent"),
      }))
    : Array.isArray(raw.stageTimeline)
      ? raw.stageTimeline.map((item: any) => ({
          stage: String(item.stage || "Unknown Stage"),
          status: (String(item.status || "").toLowerCase().includes("drop")
              ? "Dropped"
              : String(item.status || "").toLowerCase().includes("pending")
                ? "Pending"
                : "Completed") as "Completed" | "Dropped" | "Pending",
          timestamp: String(item.timestamp || item.date || "Recent"),
        }))
      : [];

  const id =
    String(raw.id || raw.experienceId || raw.referenceId || "").trim() ||
    `EXP-${Date.now()}`;

  const candidateName =
    String(raw.candidateName || raw.candidate_name || raw.name || "").trim() ||
    "Candidate";

  const status =
    raw.status === "Completed" || raw.outcome === "Completed"
      ? "Completed"
      : "Drop-off";

  const exitStage = String(raw.exitStage || raw.finalStage || "Screened") as CandidateExperienceRecord["exitStage"];

  return {
    id,
    candidateCode: String(raw.candidateCode || raw.candidateId || raw.candidate_id || id),
    candidateName,
    candidateEmail: String(raw.candidateEmail || raw.candidate_email || raw.email || ""),
    role: String(raw.role || raw.roleTitle || raw.role_title || "Unassigned Role"),
    account: String(raw.account || raw.finalAccount || raw.final_account || "Unassigned Account"),
    eventType: String(raw.eventType || (status === "Completed" ? "Process Completed" : "Candidate Feedback")) as CandidateExperienceRecord["eventType"],
    status,
    exitStage,
    reasonCategory: String(
      raw.reasonCategory ||
        raw.feedbackCategory ||
        raw.dropOffCategory ||
        (status === "Completed" ? "Process Satisfactory" : "Personal Reason"),
    ) as CandidateExperienceRecord["reasonCategory"],
    reasonDescription: String(
      raw.reasonDescription ||
        raw.dropOffReason ||
        raw.internalNote ||
        "No detailed description provided.",
    ),
    qualitativeFeedback: String(
      raw.qualitativeFeedback ||
        raw.feedback ||
        "No qualitative feedback recorded.",
    ),
    rating: Number(raw.rating || raw.experienceRating || 0),
    feedbackTag: String(raw.feedbackTag || raw.feedback_tag || "General Feedback"),
    dateRecorded: String(
      raw.dateRecorded ||
        raw.surveySubmittedAt ||
        raw.updatedAt ||
        raw.createdAt ||
        new Date().toISOString().slice(0, 10),
    ),
    taOwner: String(raw.taOwner || raw.owner || raw.recordedBy || "Unassigned"),
    stagesPassed: stages,
    surveyStatus: (raw.surveyStatus as CandidateExperienceRecord["surveyStatus"]) || "submitted",
    responseSource:
      (raw.responseSource as CandidateExperienceRecord["responseSource"]) ||
      "candidate_survey",
    surveyToken: raw.surveyToken ? String(raw.surveyToken) : undefined,
    surveySentAt: raw.surveySentAt ? String(raw.surveySentAt) : undefined,
    surveySubmittedAt: raw.surveySubmittedAt ? String(raw.surveySubmittedAt) : undefined,
  };
}

function RatingStars({ rating = 0, size = 13 }: { rating?: number; size?: number }) {
  const numeric = Number(rating || 0);

  return (
    <span
      className="inline-flex items-center gap-0.5"
      aria-label={`${numeric} out of 5 stars`}
    >
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          className={star <= numeric ? "text-amber-400" : "text-slate-200"}
          style={{ fontSize: size }}
        >
          ★
        </span>
      ))}
    </span>
  );
}

function MetricCard({
  title,
  value,
  description,
  icon: Icon,
  tone = "navy",
  featured = false,
  delay = 0,
}: {
  title: string;
  value: React.ReactNode;
  description: string;
  icon: React.ElementType;
  tone?: "navy" | "green" | "red" | "indigo" | "amber";
  featured?: boolean;
  delay?: number;
}) {
  const toneMap = {
    navy: {
      label: "text-[#042C51]",
      icon: "bg-[#EAF0F7] text-[#042C51]",
    },
    green: {
      label: "text-emerald-700",
      icon: "bg-emerald-50 text-emerald-700",
    },
    red: {
      label: "text-rose-700",
      icon: "bg-rose-50 text-rose-700",
    },
    indigo: {
      label: "text-indigo-700",
      icon: "bg-indigo-50 text-indigo-700",
    },
    amber: {
      label: "text-amber-700",
      icon: "bg-amber-50 text-amber-700",
    },
  };

  const toneClasses = toneMap[tone] || toneMap.navy;

  return (
    <motion.article
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: delay / 1000 }}
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
                featured ? "text-white" : toneClasses.label
              }`}
            >
              {title}
            </p>

            <p
              className={`mt-1.5 text-2xl font-bold leading-none tabular-nums tracking-tight 2xl:mt-2 2xl:text-3xl ${
                featured ? "text-white" : toneClasses.label
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
            featured ? "bg-white/10 text-[#FF5C28]" : toneClasses.icon
          }`}
        >
          <Icon className="h-4 w-4" strokeWidth={2} />
        </span>
      </div>
    </motion.article>
  );
}

function AnalyticsPanel({
  icon: Icon,
  title,
  subtitle,
  children,
  delay = 0,
}: {
  icon: React.ElementType;
  title: string;
  subtitle: string;
  children: React.ReactNode;
  delay?: number;
}) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: delay / 1000 }}
      className="rounded-xl border border-[#DCE5EF] bg-white p-3.5 shadow-[0_6px_18px_rgba(4,44,81,0.04)] transition hover:shadow-md sm:p-4 2xl:rounded-2xl 2xl:p-5"
    >
      <div className="mb-3 flex items-start justify-between gap-3 border-b border-[#E6ECF2] pb-2.5">
        <div className="min-w-0">
          <h3 className="text-sm font-bold tracking-tight text-[#042C51]">
            {title}
          </h3>
          <p className="mt-0.5 text-[10px] font-semibold leading-4 text-[#667085]">
            {subtitle}
          </p>
        </div>

        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#E9F0FC] text-[#042C51]">
          <Icon size={15} strokeWidth={2} />
        </span>
      </div>

      {children}
    </motion.section>
  );
}

function BreakdownBars({
  rows,
  emptyText,
  accentClass = "bg-[#042C51]",
}: {
  rows: { label: string; value: number }[];
  emptyText: string;
  accentClass?: string;
}) {
  const max = Math.max(1, ...rows.map((row) => row.value));

  if (!rows.length) {
    return (
      <div className="rounded-xl border border-dashed border-[#D9E2EC] bg-[#F8FAFC] p-6 text-center text-xs font-bold text-[#98A2B3]">
        {emptyText}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {rows.slice(0, 6).map((row) => (
        <div key={row.label}>
          <div className="mb-1 flex items-center justify-between gap-3">
            <span className="truncate text-xs font-bold text-[#042C51]">
              {row.label}
            </span>
            <span className="font-mono text-xs font-extrabold text-[#042C51]">
              {row.value}
            </span>
          </div>

          <div className="h-2 overflow-hidden rounded-full bg-[#EEF2F6]">
            <motion.div
              initial={{ width: 0 }}
              animate={{
                width: `${Math.max(
                  row.value ? 8 : 0,
                  Math.round((row.value / max) * 100),
                )}%`,
              }}
              transition={{ duration: 0.35 }}
              className={`h-full rounded-full ${accentClass}`}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function CandidateExperiencePage({
  userEmail = "alena.batacan@thesiblingssolutions.com",
  onSwitchModule,
}: CandidateExperiencePageProps) {
  const [records, setRecords] = useState<CandidateExperienceRecord[]>(() => {
    if (typeof window === "undefined") return INITIAL_EXPERIENCE_RECORDS;

    try {
      const stored = window.localStorage.getItem(
        "sibs_candidate_experience_records",
      );

      if (stored) {
        const parsed = JSON.parse(stored);

        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((item) => normalizeIncomingExperienceRecord(item));
        }
      }
    } catch (error) {
      console.error("Error parsing stored experience records", error);
    }

    return INITIAL_EXPERIENCE_RECORDS.map((record) => ({
      ...record,
      responseSource: record.responseSource || "ta_manual",
      surveyStatus: record.surveyStatus || "not_sent",
    }));
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOutcome, setSelectedOutcome] = useState("All");
  const [selectedSurveyStatus, setSelectedSurveyStatus] =
    useState<SurveyStatusFilter>("All");
  const [selectedResponseSource, setSelectedResponseSource] =
    useState<ResponseSourceFilter>("All");
  const [selectedRating, setSelectedRating] = useState("All");
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedRecordForView, setSelectedRecordForView] =
    useState<CandidateExperienceRecord | null>(null);
  const [isSendSurveyModalOpen, setIsSendSurveyModalOpen] = useState(false);
  const [selectedRecordForSurvey, setSelectedRecordForSurvey] =
    useState<CandidateExperienceRecord | null>(null);

  const [page, setPage] = useState(1);
  const pageSize = 10;

  const [newForm, setNewForm] = useState({
    candidateName: "",
    candidateEmail: "",
    role: "Customer Service Representative",
    account: "Chevron Support",
    eventType: "Offer Declined" as CandidateExperienceRecord["eventType"],
    status: "Drop-off" as CandidateExperienceRecord["status"],
    exitStage: "Offered" as CandidateExperienceRecord["exitStage"],
    reasonCategory: "Compensation" as CandidateExperienceRecord["reasonCategory"],
    reasonDescription: "",
    qualitativeFeedback: "",
    rating: 3,
    feedbackTag: "Compensation Concern",
    taOwner: "Alena Batacan",
  });

  function triggerToast(message: string) {
    setToastMessage(message);
    window.setTimeout(() => setToastMessage(null), 3500);
  }

  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      window.localStorage.setItem(
        "sibs_candidate_experience_records",
        JSON.stringify(records),
      );
    } catch (error) {
      console.error("Failed to save experience records to localStorage", error);
    }
  }, [records]);

  useEffect(() => {
    if (typeof window === "undefined") return undefined;

    const handlePublicSurveySubmission = (event: Event) => {
      const customEvent = event as CustomEvent<Record<string, any>>;

      if (!customEvent.detail) return;

      const newRecord = normalizeIncomingExperienceRecord(customEvent.detail);

      setRecords((previous) => [
        newRecord,
        ...previous.filter((record) => record.id !== newRecord.id),
      ]);

      triggerToast(
        `New Candidate Survey response received from ${newRecord.candidateName}.`,
      );
    };

    window.addEventListener(
      "candidate_survey_submitted",
      handlePublicSurveySubmission,
    );

    return () => {
      window.removeEventListener(
        "candidate_survey_submitted",
        handlePublicSurveySubmission,
      );
    };
  }, []);

  useEffect(() => {
    setPage(1);
  }, [
    searchQuery,
    selectedOutcome,
    selectedSurveyStatus,
    selectedResponseSource,
    selectedRating,
  ]);

  const filteredRecords = useMemo(() => {
    const keyword = searchQuery.trim().toLowerCase();

    return records.filter((record) => {
      const searchable = [
        record.id,
        record.candidateCode,
        record.candidateName,
        record.candidateEmail,
        record.role,
        record.account,
        record.taOwner,
        record.feedbackTag,
        record.reasonCategory,
        record.eventType,
      ]
        .join(" ")
        .toLowerCase();

      const matchesSearch = !keyword || searchable.includes(keyword);
      const matchesOutcome =
        selectedOutcome === "All" || record.status === selectedOutcome;
      const matchesSurveyStatus =
        selectedSurveyStatus === "All" ||
        getSurveyStatus(record) === selectedSurveyStatus;
      const matchesResponseSource =
        selectedResponseSource === "All" ||
        getResponseSource(record) === selectedResponseSource;
      const matchesRating =
        selectedRating === "All" ||
        String(record.rating || 0) === selectedRating;

      return (
        matchesSearch &&
        matchesOutcome &&
        matchesSurveyStatus &&
        matchesResponseSource &&
        matchesRating
      );
    });
  }, [
    records,
    searchQuery,
    selectedOutcome,
    selectedSurveyStatus,
    selectedResponseSource,
    selectedRating,
  ]);

  const metrics = useMemo(() => {
    const totalCases = records.length;
    const completed = records.filter(
      (record) => record.status === "Completed",
    ).length;
    const dropOffs = records.filter(
      (record) => record.status === "Drop-off",
    ).length;

    const surveysSent = records.filter((record) =>
      ["sent", "opened", "submitted"].includes(getSurveyStatus(record)),
    ).length;

    const submittedSurveyResponses = records.filter(
      (record) => getSurveyStatus(record) === "submitted",
    ).length;

    const responsesReceived = records.filter(
      (record) =>
        getResponseSource(record) === "candidate_survey" ||
        Boolean(record.qualitativeFeedback?.trim()) ||
        Number(record.rating || 0) > 0,
    ).length;

    const ratings = records
      .map((record) => Number(record.rating || 0))
      .filter((rating) => rating > 0);

    const averageRating = ratings.length
      ? (
          ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length
        ).toFixed(1)
      : "0.0";

    const positiveRatings = records.filter(
      (record) => Number(record.rating || 0) >= 4,
    ).length;

    const lowRatings = records.filter(
      (record) =>
        Number(record.rating || 0) > 0 && Number(record.rating || 0) <= 2,
    ).length;

    const responseRate =
      surveysSent > 0
        ? Math.round((submittedSurveyResponses / surveysSent) * 100)
        : 0;

    return {
      totalCases,
      completed,
      dropOffs,
      surveysSent,
      responsesReceived,
      averageRating,
      positiveRatings,
      lowRatings,
      responseRate,
    };
  }, [records]);

  const stageBreakdown = useMemo(() => {
    const counts = new Map<string, number>();

    records
      .filter((record) => record.status === "Drop-off")
      .forEach((record) => {
        const label = record.exitStage || "Unknown";
        counts.set(label, (counts.get(label) || 0) + 1);
      });

    return Array.from(counts.entries())
      .map(([label, value]) => ({ label, value }))
      .sort((a, b) => b.value - a.value);
  }, [records]);

  const categoryBreakdown = useMemo(() => {
    const counts = new Map<string, number>();

    records.forEach((record) => {
      const label = record.reasonCategory || "Uncategorized";
      counts.set(label, (counts.get(label) || 0) + 1);
    });

    return Array.from(counts.entries())
      .map(([label, value]) => ({ label, value }))
      .sort((a, b) => b.value - a.value);
  }, [records]);

  const ratingBreakdown = useMemo(() => {
    return [5, 4, 3, 2, 1]
      .map((rating) => ({
        label: `${rating} Star${rating === 1 ? "" : "s"}`,
        value: records.filter(
          (record) => Number(record.rating || 0) === rating,
        ).length,
      }))
      .filter((row) => row.value > 0);
  }, [records]);

  const totalPages = Math.max(1, Math.ceil(filteredRecords.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const startIndex = (safePage - 1) * pageSize;
  const paginatedRecords = filteredRecords.slice(
    startIndex,
    startIndex + pageSize,
  );

  const topStage = stageBreakdown[0]?.label || "No drop-off data";
  const topCategory =
    categoryBreakdown[0]?.label || "No response category data";

  function clearFilters() {
    setSearchQuery("");
    setSelectedOutcome("All");
    setSelectedSurveyStatus("All");
    setSelectedResponseSource("All");
    setSelectedRating("All");
  }

  const hasActiveFilters =
    Boolean(searchQuery) ||
    selectedOutcome !== "All" ||
    selectedSurveyStatus !== "All" ||
    selectedResponseSource !== "All" ||
    selectedRating !== "All";

  function handleRefresh() {
    if (isRefreshing) return;

    setIsRefreshing(true);

    window.setTimeout(() => {
      try {
        const stored = window.localStorage.getItem(
          "sibs_candidate_experience_records",
        );

        if (stored) {
          const parsed = JSON.parse(stored);

          if (Array.isArray(parsed)) {
            setRecords(
              parsed.map((item) => normalizeIncomingExperienceRecord(item)),
            );
          }
        }
      } catch (error) {
        console.error("Unable to refresh candidate experience data", error);
      } finally {
        setIsRefreshing(false);
        triggerToast("Candidate Experience data refreshed.");
      }
    }, 450);
  }

  function exportCsv() {
    const headers = [
      "Candidate",
      "Email",
      "Role",
      "Account",
      "Outcome",
      "Final Stage",
      "Survey Status",
      "Response Source",
      "Rating",
      "Category",
      "Date",
    ];

    const rows = filteredRecords.map((record) => [
      record.candidateName,
      record.candidateEmail,
      record.role,
      record.account,
      record.status,
      record.exitStage,
      getSurveyStatusLabel(getSurveyStatus(record)),
      getResponseSourceLabel(getResponseSource(record)),
      record.rating || "",
      record.reasonCategory || "",
      record.surveySubmittedAt || record.dateRecorded || "",
    ]);

    const csv = [headers, ...rows]
      .map((row) =>
        row
          .map(
            (cell) =>
              `"${String(cell ?? "").replaceAll('"', '""')}"`,
          )
          .join(","),
      )
      .join("\n");

    const blob = new Blob([csv], {
      type: "text/csv;charset=utf-8",
    });

    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `candidate-experience-${new Date()
      .toISOString()
      .slice(0, 10)}.csv`;
    anchor.click();
    URL.revokeObjectURL(url);

    triggerToast(`Exported ${filteredRecords.length} Candidate Experience record(s).`);
  }

  function buildSurveyUrl(record: CandidateExperienceRecord) {
    const token = record.surveyToken || `TOK-CAND-${record.id}`;

    if (typeof window === "undefined") {
      return `?surveyToken=${encodeURIComponent(token)}`;
    }

    return `${window.location.origin}${window.location.pathname}?surveyToken=${encodeURIComponent(
      token,
    )}`;
  }

  async function copySurveyLink(record: CandidateExperienceRecord) {
    try {
      await navigator.clipboard.writeText(buildSurveyUrl(record));
      triggerToast(`Survey link copied for ${record.candidateName}.`);
    } catch {
      triggerToast("Clipboard access was blocked by the browser.");
    }
  }

  function openSurveyModal(record: CandidateExperienceRecord | null = null) {
    setSelectedRecordForSurvey(record);
    setIsSendSurveyModalOpen(true);
  }

  function handleSurveySent(
    recordId: string,
    surveyToken: string,
    triggerType: string,
  ) {
    setRecords((previous) =>
      previous.map((record) =>
        record.id === recordId
          ? {
              ...record,
              surveyToken,
              surveyStatus: "sent",
              surveySentAt: new Date().toISOString(),
            }
          : record,
      ),
    );

    triggerToast(
      `Survey email sent successfully. Token: ${surveyToken} (${triggerType}).`,
    );
  }

  function handleAddRecord(event: React.FormEvent) {
    event.preventDefault();

    if (!newForm.candidateName.trim() || !newForm.candidateEmail.trim()) {
      triggerToast("Please provide Candidate Name and Email.");
      return;
    }

    const newRecord: CandidateExperienceRecord = {
      id: `EXP-${Math.floor(800 + Math.random() * 200)}`,
      candidateCode: `CAND-${Math.floor(9000 + Math.random() * 999)}`,
      candidateName: newForm.candidateName.trim(),
      candidateEmail: newForm.candidateEmail.trim(),
      role: newForm.role,
      account: newForm.account,
      eventType: newForm.eventType,
      status: newForm.status,
      exitStage: newForm.exitStage,
      reasonCategory: newForm.reasonCategory,
      reasonDescription:
        newForm.reasonDescription.trim() ||
        "No detailed description provided.",
      qualitativeFeedback:
        newForm.qualitativeFeedback.trim() ||
        "No qualitative feedback recorded.",
      rating: newForm.rating,
      feedbackTag: newForm.feedbackTag.trim() || "General Entry",
      dateRecorded: new Date().toISOString().split("T")[0],
      taOwner: newForm.taOwner,
      stagesPassed: [
        {
          stage: "Sourced",
          status: "Completed",
          timestamp: formatDisplayDate(new Date().toISOString()),
        },
        {
          stage: newForm.exitStage,
          status: newForm.status === "Drop-off" ? "Dropped" : "Completed",
          timestamp: formatDisplayDate(new Date().toISOString()),
        },
      ],
      responseSource: "ta_manual",
      surveyStatus: "not_sent",
    };

    setRecords((previous) => [newRecord, ...previous]);
    setIsAddModalOpen(false);
    setSelectedRecordForView(newRecord);

    triggerToast(
      `Manual Candidate Experience entry saved for ${newRecord.candidateName}.`,
    );

    setNewForm({
      candidateName: "",
      candidateEmail: "",
      role: "Customer Service Representative",
      account: "Chevron Support",
      eventType: "Offer Declined",
      status: "Drop-off",
      exitStage: "Offered",
      reasonCategory: "Compensation",
      reasonDescription: "",
      qualitativeFeedback: "",
      rating: 3,
      feedbackTag: "Compensation Concern",
      taOwner: "Alena Batacan",
    });
  }

  return (
    <div
      className="relative flex flex-1 select-none flex-col space-y-3.5 bg-transparent font-jakarta sm:space-y-4 2xl:space-y-5"
      id="candidate-experience-root"
    >
      <AnimatePresence>
        {toastMessage ? (
          <motion.div
            initial={{ opacity: 0, y: -16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -16, scale: 0.97 }}
            className="fixed right-4 top-20 z-[13000] flex max-w-[440px] items-center gap-3 rounded-xl border border-[#163F63] border-l-4 border-l-[#FF5C28] bg-[#042C51] px-4 py-3 text-xs font-semibold text-white shadow-2xl sm:right-6"
          >
            <CheckCircle2 className="h-4 w-4 shrink-0 text-[#FF5C28]" />
            <span>{toastMessage}</span>
          </motion.div>
        ) : null}
      </AnimatePresence>

      {/* Production-aligned page header */}
      <section className="relative overflow-hidden rounded-2xl border border-[#DCE5EF] bg-white shadow-[0_8px_22px_rgba(4,44,81,0.05)]">
        <div className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-[#042C51] via-[#1A5A8A] to-[#FF5C28]" />

        <div className="flex flex-col gap-4 px-5 py-5 sm:px-6 xl:flex-row xl:items-center xl:justify-between 2xl:px-7 2xl:py-6">
          <div className="min-w-0 flex-1">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#042C51] px-2.5 py-1 text-[9px] font-extrabold uppercase tracking-wide text-white">
                <Sparkles className="h-3 w-3 text-[#FF5C28]" />
                Recruitment View
              </span>

              <span className="inline-flex items-center gap-1.5 rounded-full border border-[#FFD3C4] bg-[#FFF4EF] px-2.5 py-1 text-[9px] font-extrabold uppercase tracking-wide text-[#E65324]">
                Voice of Candidate
              </span>
            </div>

            <h1 className="text-xl font-black tracking-tight text-[#042C51] sm:text-2xl 2xl:text-[28px]">
              Candidate Experience
            </h1>

            <p className="mt-1 max-w-4xl text-xs font-medium leading-5 text-[#667085] 2xl:text-[13px]">
              Monitor completed and drop-off candidate journeys, survey delivery,
              response sources, ratings, and Voice of Candidate feedback.
            </p>
          </div>

          <div className="flex w-full flex-wrap items-center gap-2 xl:w-auto xl:justify-end">
            <button
              type="button"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[#D7E0EA] bg-white text-[#475467] transition hover:border-[#FF5C28]/40 hover:bg-[#FFF8F5] hover:text-[#FF5C28] disabled:opacity-60"
              title="Refresh Candidate Experience"
              aria-label="Refresh Candidate Experience"
            >
              <RefreshCw
                className={`h-4 w-4 ${
                  isRefreshing ? "animate-spin text-[#FF5C28]" : ""
                }`}
              />
            </button>

            <button
              type="button"
              onClick={exportCsv}
              className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border border-[#D7E0EA] bg-white px-3.5 text-xs font-extrabold text-[#042C51] transition hover:border-[#FF5C28]/40 hover:bg-[#FFF8F5] hover:text-[#FF5C28]"
            >
              <Download className="h-3.5 w-3.5 text-[#FF5C28]" />
              Export CSV
            </button>

            <button
              type="button"
              onClick={() => openSurveyModal(null)}
              className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border border-[#FFD3C4] bg-[#FFF4EF] px-3.5 text-xs font-extrabold text-[#E65324] transition hover:bg-[#FFE9DF]"
            >
              <Mail className="h-3.5 w-3.5" />
              Send Survey Email
            </button>

            <button
              type="button"
              onClick={() => setIsAddModalOpen(true)}
              className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg bg-[#FF5C28] px-4 text-xs font-extrabold text-white shadow-sm transition hover:bg-[#E95324] active:scale-[0.98]"
            >
              <Plus className="h-4 w-4" />
              Add Manual Entry
            </button>
          </div>
        </div>
      </section>

      {/* Candidate Experience summary */}
      <section
        aria-label="Candidate Experience summary"
        className="grid grid-cols-2 gap-2.5 sm:grid-cols-4 xl:grid-cols-7"
      >
        <MetricCard
          title="Total Cases"
          value={metrics.totalCases}
          icon={Users}
          description="Recorded journeys"
          tone="navy"
          delay={0}
        />
        <MetricCard
          title="Completed"
          value={metrics.completed}
          icon={CheckCircle2}
          description="Hired / Completed"
          tone="green"
          delay={45}
        />
        <MetricCard
          title="Drop-offs"
          value={metrics.dropOffs}
          icon={UserX}
          description="Exited candidates"
          tone="red"
          delay={90}
        />
        <MetricCard
          title="Surveys Sent"
          value={metrics.surveysSent}
          icon={MailCheck}
          description="Delivered forms"
          tone="indigo"
          delay={135}
        />
        <MetricCard
          title="Responses"
          value={metrics.responsesReceived}
          icon={MessageSquareText}
          description="Feedback received"
          tone="amber"
          delay={180}
        />
        <MetricCard
          title="Avg. Rating"
          value={`${metrics.averageRating}/5`}
          icon={Star}
          description={`Pos ${metrics.positiveRatings} · Low ${metrics.lowRatings}`}
          tone="amber"
          delay={225}
        />
        <MetricCard
          title="Voice of Candidate"
          value={`${metrics.responseRate}%`}
          icon={Sparkles}
          description="Survey response rate"
          featured
          delay={270}
        />
      </section>

      {/* Analytics */}
      <section className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 xl:grid-cols-4 2xl:gap-4">
        <AnalyticsPanel
          icon={BarChart3}
          title="Drop-offs by Stage"
          subtitle="Where candidates leave the recruitment journey."
          delay={120}
        >
          <BreakdownBars
            rows={stageBreakdown}
            emptyText="No drop-off stage data yet."
          />
        </AnalyticsPanel>

        <AnalyticsPanel
          icon={Tag}
          title="Experience Categories"
          subtitle="Most common reasons and feedback themes."
          delay={165}
        >
          <BreakdownBars
            rows={categoryBreakdown}
            emptyText="No experience categories yet."
            accentClass="bg-[#1A5A8A]"
          />
        </AnalyticsPanel>

        <AnalyticsPanel
          icon={Star}
          title="Rating Distribution"
          subtitle="Candidate and manually recorded feedback ratings."
          delay={210}
        >
          <BreakdownBars
            rows={ratingBreakdown}
            emptyText="No ratings submitted yet."
            accentClass="bg-amber-500"
          />
        </AnalyticsPanel>

        <motion.section
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.255 }}
          className="relative overflow-hidden rounded-xl bg-[#042C51] p-3.5 text-white shadow-sm sm:p-4 2xl:rounded-2xl 2xl:p-5"
        >
          <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-[#FF5C28]/15" />

          <div className="relative">
            <div className="flex items-center gap-2 text-[#FF5C28]">
              <Sparkles size={16} />
              <h3 className="text-xs font-black uppercase tracking-wider text-white">
                Experience Insight
              </h3>
            </div>

            <div className="mt-3 rounded-xl border border-white/10 bg-white/10 p-3.5">
              <p className="text-[9px] font-black uppercase tracking-wider text-blue-200">
                Primary Drop-off Stage
              </p>
              <p className="mt-0.5 text-base font-extrabold text-white 2xl:text-lg">
                {topStage}
              </p>

              <p className="mt-3 text-[9px] font-black uppercase tracking-wider text-blue-200">
                Top Experience Category
              </p>
              <p className="mt-0.5 text-xs font-extrabold text-[#FFB69E] 2xl:text-sm">
                {topCategory}
              </p>
            </div>

            <p className="mt-3 text-xs leading-relaxed text-blue-200">
              {metrics.responsesReceived
                ? `${metrics.responsesReceived} response${
                    metrics.responsesReceived === 1 ? "" : "s"
                  } recorded with an average rating of ${metrics.averageRating}/5.`
                : "Candidate experience insights will populate when survey or manual feedback is recorded."}
            </p>

            {onSwitchModule ? (
              <button
                type="button"
                onClick={() => onSwitchModule("Action Items")}
                className="mt-3 inline-flex h-9 w-full items-center justify-center gap-1.5 rounded-lg bg-white px-3 text-xs font-extrabold text-[#042C51] transition hover:bg-[#FFF4EF] hover:text-[#E65324]"
              >
                Open TA Action Items
                <ArrowUpRight className="h-3.5 w-3.5" />
              </button>
            ) : null}
          </div>
        </motion.section>
      </section>

      {/* Records + filters */}
      <section className="relative z-[20] overflow-visible rounded-2xl border border-[#DCE5EF] bg-white shadow-[0_8px_22px_rgba(4,44,81,0.04)]">
        <header className="border-b border-[#E6ECF2] px-4 py-4 sm:px-5 2xl:px-6">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div className="min-w-0">
              <h2 className="text-sm font-bold tracking-tight text-[#042C51] 2xl:text-base">
                Candidate Experience Records
              </h2>
              <p className="mt-0.5 text-xs font-semibold leading-relaxed text-[#667085]">
                Select a row or mobile card to open the complete recruitment journey
                and survey details.
              </p>
            </div>

            <span className="w-fit rounded-full border border-blue-100 bg-blue-50 px-2.5 py-1 text-[9px] font-extrabold uppercase tracking-wide text-[#042C51]">
              {filteredRecords.length} Records
            </span>
          </div>

          <div className="relative z-[90] mt-3.5 grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-[minmax(280px,1.4fr)_150px_170px_170px_135px_auto]">
            <div className="group relative min-w-0">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#98A2B3] transition-colors group-focus-within:text-[#FF5C28]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search candidate, email, role, account, owner..."
                className="h-10 w-full rounded-xl border border-[#D7DEE8] bg-white pl-9 pr-9 text-xs font-semibold text-[#042C51] outline-none transition placeholder:text-[#98A2B3] hover:border-[#FF5C28]/40 focus:border-[#FF5C28] focus:ring-4 focus:ring-[#FF5C28]/10"
              />

              {searchQuery ? (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 inline-flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-md text-[#98A2B3] transition hover:bg-[#FFF7F3] hover:text-[#FF5C28]"
                  aria-label="Clear Candidate Experience search"
                >
                  <X size={13} />
                </button>
              ) : null}
            </div>

            <select
              value={selectedOutcome}
              onChange={(event) => setSelectedOutcome(event.target.value)}
              className="h-10 w-full rounded-xl border border-[#D7DEE8] bg-[#F8FAFC] px-3 text-xs font-semibold text-[#042C51] outline-none transition hover:border-[#FF5C28]/40 hover:bg-white focus:border-[#FF5C28] focus:bg-white focus:ring-4 focus:ring-[#FF5C28]/10"
              aria-label="Outcome filter"
            >
              <option value="All">All Outcomes</option>
              <option value="Completed">Completed</option>
              <option value="Drop-off">Drop-off</option>
            </select>

            <select
              value={selectedSurveyStatus}
              onChange={(event) =>
                setSelectedSurveyStatus(
                  event.target.value as SurveyStatusFilter,
                )
              }
              className="h-10 w-full rounded-xl border border-[#D7DEE8] bg-[#F8FAFC] px-3 text-xs font-semibold text-[#042C51] outline-none transition hover:border-[#FF5C28]/40 hover:bg-white focus:border-[#FF5C28] focus:bg-white focus:ring-4 focus:ring-[#FF5C28]/10"
              aria-label="Survey status filter"
            >
              <option value="All">All Survey Statuses</option>
              <option value="submitted">Submitted</option>
              <option value="opened">Opened</option>
              <option value="sent">Sent</option>
              <option value="pending">Pending</option>
              <option value="expired">Expired</option>
              <option value="not_sent">Not Sent</option>
            </select>

            <select
              value={selectedResponseSource}
              onChange={(event) =>
                setSelectedResponseSource(
                  event.target.value as ResponseSourceFilter,
                )
              }
              className="h-10 w-full rounded-xl border border-[#D7DEE8] bg-[#F8FAFC] px-3 text-xs font-semibold text-[#042C51] outline-none transition hover:border-[#FF5C28]/40 hover:bg-white focus:border-[#FF5C28] focus:bg-white focus:ring-4 focus:ring-[#FF5C28]/10"
              aria-label="Response source filter"
            >
              <option value="All">All Response Sources</option>
              <option value="candidate_survey">Candidate Survey</option>
              <option value="ta_manual">TA Manual</option>
            </select>

            <select
              value={selectedRating}
              onChange={(event) => setSelectedRating(event.target.value)}
              className="h-10 w-full rounded-xl border border-[#D7DEE8] bg-[#F8FAFC] px-3 text-xs font-semibold text-[#042C51] outline-none transition hover:border-[#FF5C28]/40 hover:bg-white focus:border-[#FF5C28] focus:bg-white focus:ring-4 focus:ring-[#FF5C28]/10"
              aria-label="Rating filter"
            >
              <option value="All">All Ratings</option>
              <option value="5">5 Star</option>
              <option value="4">4 Star</option>
              <option value="3">3 Star</option>
              <option value="2">2 Star</option>
              <option value="1">1 Star</option>
            </select>

            <button
              type="button"
              onClick={clearFilters}
              disabled={!hasActiveFilters}
              className="inline-flex h-10 w-full items-center justify-center gap-1.5 rounded-xl border border-[#D7DEE8] bg-white px-3.5 text-xs font-extrabold text-[#667085] transition hover:border-[#FF5C28]/40 hover:bg-[#FFF8F5] hover:text-[#FF5C28] disabled:cursor-not-allowed disabled:opacity-45 xl:w-auto"
            >
              <Filter size={14} />
              Clear
            </button>
          </div>
        </header>

        <div className="p-3.5 sm:p-4 2xl:p-5">
          {/* Desktop table */}
          <div className="hidden overflow-hidden rounded-xl border border-[#E6ECF2] bg-white lg:block">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1380px] border-collapse text-left text-xs">
                <thead className="bg-[#F8FAFC]">
                  <tr className="border-b border-[#E6ECF2]">
                    {[
                      "Candidate",
                      "Role / Account",
                      "Outcome",
                      "Final Stage",
                      "Survey Status",
                      "Source",
                      "Rating",
                      "Category",
                      "Date",
                      "Actions",
                    ].map((label) => (
                      <th
                        key={label}
                        className={`px-3 py-2.5 text-[10px] font-extrabold uppercase tracking-wider text-[#667085] ${
                          label === "Actions" ? "text-right" : ""
                        }`}
                      >
                        {label}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody className="divide-y divide-[#E6ECF2]">
                  {paginatedRecords.length ? (
                    paginatedRecords.map((record, index) => {
                      const status = getSurveyStatus(record);
                      const source = getResponseSource(record);

                      return (
                        <motion.tr
                          key={record.id}
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.025 }}
                          role="button"
                          tabIndex={0}
                          onClick={() => setSelectedRecordForView(record)}
                          onKeyDown={(event) => {
                            if (event.key === "Enter" || event.key === " ") {
                              event.preventDefault();
                              setSelectedRecordForView(record);
                            }
                          }}
                          className="cursor-pointer bg-white outline-none transition hover:bg-[#F8FAFC] focus:bg-[#E9F0FC]/60"
                        >
                          <td className="px-3 py-2.5 align-middle">
                            <div className="flex items-center gap-2.5">
                              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#042C51] text-[10px] font-black text-white">
                                {getInitials(record.candidateName)}
                              </span>

                              <div className="min-w-0">
                                <p className="truncate text-xs font-extrabold text-[#042C51]">
                                  {record.candidateName || "Unnamed Candidate"}
                                </p>
                                <p className="mt-0.5 max-w-[220px] truncate font-mono text-[9.5px] font-semibold text-[#667085]">
                                  {record.candidateEmail ||
                                    record.candidateCode ||
                                    "—"}
                                </p>
                              </div>
                            </div>
                          </td>

                          <td className="px-3 py-2.5 align-middle">
                            <p className="max-w-[220px] truncate text-xs font-extrabold text-[#042C51]">
                              {record.role || "—"}
                            </p>
                            <p className="mt-0.5 max-w-[220px] truncate text-[10px] font-semibold uppercase text-[#667085]">
                              {record.account || "—"}
                            </p>
                          </td>

                          <td className="px-3 py-2.5 align-middle">
                            <span
                              className={`inline-flex rounded-full border px-2.5 py-1 text-[10px] font-extrabold ${outcomeClass(
                                record.status,
                              )}`}
                            >
                              {record.status}
                            </span>
                          </td>

                          <td className="px-3 py-2.5 align-middle text-xs font-semibold text-[#475467]">
                            {record.exitStage || "—"}
                          </td>

                          <td className="px-3 py-2.5 align-middle">
                            <span
                              className={`inline-flex rounded-full border px-2.5 py-1 text-[10px] font-extrabold ${surveyStatusClass(
                                status,
                              )}`}
                            >
                              {getSurveyStatusLabel(status)}
                            </span>
                          </td>

                          <td className="px-3 py-2.5 align-middle">
                            <span
                              className={`inline-flex rounded-full border px-2.5 py-1 text-[10px] font-extrabold ${responseSourceClass(
                                source,
                              )}`}
                            >
                              {getResponseSourceLabel(source)}
                            </span>
                          </td>

                          <td className="px-3 py-2.5 align-middle">
                            <RatingStars rating={record.rating} />
                          </td>

                          <td className="px-3 py-2.5 align-middle">
                            <span className="inline-flex max-w-[180px] truncate rounded-md border border-[#E6ECF2] bg-[#F8FAFC] px-2 py-0.5 text-[10px] font-extrabold text-[#042C51]">
                              {record.reasonCategory || "—"}
                            </span>
                          </td>

                          <td className="px-3 py-2.5 align-middle">
                            <span className="inline-flex items-center gap-1.5 whitespace-nowrap font-mono text-[10px] font-semibold text-[#667085]">
                              <Calendar size={12} />
                              {formatDisplayDate(
                                record.surveySubmittedAt ||
                                  record.dateRecorded,
                              )}
                            </span>
                          </td>

                          <td
                            className="px-3 py-2.5 text-right align-middle"
                            onClick={(event) => event.stopPropagation()}
                          >
                            <div className="flex justify-end gap-1.5">
                              <button
                                type="button"
                                onClick={() => openSurveyModal(record)}
                                className="inline-flex h-8 items-center gap-1 rounded-lg border border-[#FFD3C4] bg-[#FFF4EF] px-2.5 text-[10px] font-extrabold text-[#E65324] transition hover:bg-[#FFE9DF]"
                                title="Send Candidate Survey Email"
                              >
                                <Mail size={12} />
                                Send
                              </button>

                              <button
                                type="button"
                                onClick={() => copySurveyLink(record)}
                                className="inline-flex h-8 items-center gap-1 rounded-lg border border-[#D7DEE8] bg-white px-2.5 text-[10px] font-extrabold text-[#475467] transition hover:border-[#FF5C28]/40 hover:bg-[#FFF8F5] hover:text-[#FF5C28]"
                                title="Copy Public Survey Link"
                              >
                                <Copy size={12} />
                                Link
                              </button>

                              <button
                                type="button"
                                onClick={() => setSelectedRecordForView(record)}
                                className="inline-flex h-8 items-center gap-1 rounded-lg bg-[#042C51] px-2.5 text-[10px] font-extrabold text-white transition hover:bg-[#073966]"
                              >
                                View
                                <ChevronRight size={12} />
                              </button>
                            </div>
                          </td>
                        </motion.tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={10} className="px-5 py-12 text-center">
                        <p className="text-sm font-semibold text-[#98A2B3]">
                          No candidate experience records match the current
                          filters.
                        </p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile/tablet cards */}
          <div className="space-y-3 lg:hidden">
            {paginatedRecords.length ? (
              paginatedRecords.map((record, index) => {
                const status = getSurveyStatus(record);
                const source = getResponseSource(record);

                return (
                  <motion.article
                    key={record.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.03 }}
                    onClick={() => setSelectedRecordForView(record)}
                    className="cursor-pointer rounded-xl border border-[#E6ECF2] bg-white p-4 shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-2.5">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#042C51] text-[10px] font-black text-white">
                          {getInitials(record.candidateName)}
                        </span>

                        <div className="min-w-0">
                          <h3 className="truncate text-sm font-extrabold text-[#042C51]">
                            {record.candidateName}
                          </h3>
                          <p className="mt-0.5 truncate text-[10px] font-semibold text-[#667085]">
                            {record.candidateEmail}
                          </p>
                        </div>
                      </div>

                      <span
                        className={`shrink-0 rounded-full border px-2.5 py-1 text-[9px] font-extrabold ${outcomeClass(
                          record.status,
                        )}`}
                      >
                        {record.status}
                      </span>
                    </div>

                    <div className="mt-3 rounded-xl border border-[#EEF2F6] bg-[#F8FAFC] p-3">
                      <p className="text-xs font-extrabold text-[#042C51]">
                        {record.role}
                      </p>
                      <p className="mt-0.5 text-[10px] font-semibold uppercase text-[#667085]">
                        {record.account}
                      </p>

                      <div className="mt-3 grid grid-cols-2 gap-2 border-t border-[#E6ECF2] pt-3">
                        <div>
                          <p className="text-[8.5px] font-extrabold uppercase text-[#98A2B3]">
                            Final Stage
                          </p>
                          <p className="mt-0.5 text-xs font-extrabold text-[#042C51]">
                            {record.exitStage}
                          </p>
                        </div>

                        <div>
                          <p className="text-[8.5px] font-extrabold uppercase text-[#98A2B3]">
                            Rating
                          </p>
                          <div className="mt-0.5">
                            <RatingStars rating={record.rating} />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 flex flex-wrap items-center gap-1.5">
                      <span
                        className={`rounded-full border px-2 py-0.5 text-[9px] font-extrabold ${surveyStatusClass(
                          status,
                        )}`}
                      >
                        {getSurveyStatusLabel(status)}
                      </span>

                      <span
                        className={`rounded-full border px-2 py-0.5 text-[9px] font-extrabold ${responseSourceClass(
                          source,
                        )}`}
                      >
                        {getResponseSourceLabel(source)}
                      </span>

                      <span className="ml-auto text-[9px] font-semibold text-[#667085]">
                        {formatDisplayDate(record.dateRecorded)}
                      </span>
                    </div>

                    <div
                      className="mt-3 grid grid-cols-3 gap-2 border-t border-[#EEF2F6] pt-3"
                      onClick={(event) => event.stopPropagation()}
                    >
                      <button
                        type="button"
                        onClick={() => openSurveyModal(record)}
                        className="inline-flex h-8 items-center justify-center gap-1 rounded-lg border border-[#FFD3C4] bg-[#FFF4EF] text-[10px] font-extrabold text-[#E65324]"
                      >
                        <Mail size={12} />
                        Send
                      </button>

                      <button
                        type="button"
                        onClick={() => copySurveyLink(record)}
                        className="inline-flex h-8 items-center justify-center gap-1 rounded-lg border border-[#D7DEE8] bg-white text-[10px] font-extrabold text-[#475467]"
                      >
                        <Copy size={12} />
                        Link
                      </button>

                      <button
                        type="button"
                        onClick={() => setSelectedRecordForView(record)}
                        className="inline-flex h-8 items-center justify-center gap-1 rounded-lg bg-[#042C51] text-[10px] font-extrabold text-white"
                      >
                        View
                        <ChevronRight size={12} />
                      </button>
                    </div>
                  </motion.article>
                );
              })
            ) : (
              <div className="rounded-xl border border-dashed border-[#D9E2EC] p-8 text-center text-sm font-semibold text-[#98A2B3]">
                No candidate experience records match the current filters.
              </div>
            )}
          </div>

          {/* Pagination */}
          <footer className="mt-3 flex flex-col gap-2 border-t border-[#EEF2F6] pt-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-[10px] font-semibold text-[#667085]">
              Showing{" "}
              <strong className="text-[#042C51]">
                {filteredRecords.length ? startIndex + 1 : 0}–
                {Math.min(startIndex + pageSize, filteredRecords.length)}
              </strong>{" "}
              of{" "}
              <strong className="text-[#042C51]">
                {filteredRecords.length}
              </strong>{" "}
              candidate experience records
            </p>

            <div className="flex flex-wrap items-center gap-1.5">
              <button
                type="button"
                disabled={safePage <= 1}
                onClick={() => setPage((previous) => Math.max(1, previous - 1))}
                className="h-8 rounded-lg border border-[#D7DEE8] bg-white px-3 text-[10px] font-extrabold text-[#475467] transition hover:border-[#FF5C28]/40 hover:text-[#FF5C28] disabled:cursor-not-allowed disabled:opacity-40"
              >
                Previous
              </button>

              {Array.from({ length: totalPages }, (_, index) => index + 1).map(
                (pageNumber) => (
                  <button
                    key={pageNumber}
                    type="button"
                    onClick={() => setPage(pageNumber)}
                    className={`h-8 min-w-8 rounded-lg px-2.5 text-[10px] font-extrabold transition ${
                      pageNumber === safePage
                        ? "bg-[#042C51] text-white"
                        : "border border-[#D7DEE8] bg-white text-[#475467] hover:border-[#FF5C28]/40 hover:text-[#FF5C28]"
                    }`}
                  >
                    {pageNumber}
                  </button>
                ),
              )}

              <button
                type="button"
                disabled={safePage >= totalPages}
                onClick={() =>
                  setPage((previous) => Math.min(totalPages, previous + 1))
                }
                className="h-8 rounded-lg border border-[#D7DEE8] bg-white px-3 text-[10px] font-extrabold text-[#475467] transition hover:border-[#FF5C28]/40 hover:text-[#FF5C28] disabled:cursor-not-allowed disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </footer>
        </div>
      </section>

      {/* Candidate Experience rule / survey relationship */}
      <section className="rounded-xl border border-[#D6E2F0] bg-gradient-to-r from-blue-50/90 via-blue-50/40 to-white/70 p-3.5 shadow-sm sm:p-4 2xl:rounded-2xl 2xl:p-5">
        <div className="flex flex-col gap-3.5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[#D6E2F0] bg-white text-[#042C51] shadow-sm">
              <MessageSquareText size={18} className="text-[#FF5C28]" />
            </span>

            <div>
              <h3 className="text-xs font-black text-[#042C51] 2xl:text-sm">
                Candidate Experience Rule
              </h3>
              <p className="mt-1 max-w-5xl text-[11px] font-semibold leading-5 text-[#475467] 2xl:text-xs">
                Manual TA entries and candidate survey responses share one
                experience record view. Survey delivery status, response source,
                outcome, rating, feedback category, and candidate journey remain
                visible from the same record.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => openSurveyModal(null)}
            className="inline-flex h-9 shrink-0 items-center justify-center gap-1.5 rounded-lg bg-[#042C51] px-3.5 text-xs font-extrabold text-white transition hover:bg-[#073966]"
          >
            <Send size={14} className="text-[#FF5C28]" />
            Send Candidate Survey
          </button>
        </div>
      </section>

      {/* Add manual Candidate Experience entry */}
      <AnimatePresence>
        {isAddModalOpen ? (
          <div
            className="fixed inset-0 z-[12000] flex h-dvh items-center justify-center overflow-y-auto bg-[#042C51]/60 p-3 backdrop-blur-[2px] sm:p-4"
            onMouseDown={() => setIsAddModalOpen(false)}
          >
            <motion.form
              initial={{ opacity: 0, scale: 0.97, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97, y: 10 }}
              onSubmit={handleAddRecord}
              onMouseDown={(event) => event.stopPropagation()}
              className="flex max-h-[92dvh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-[#D9E2EC] bg-white shadow-[0_24px_80px_rgba(15,23,42,0.28)]"
            >
              <header className="flex shrink-0 items-start justify-between gap-4 bg-[#042C51] px-5 py-4 text-white sm:px-6">
                <div className="flex min-w-0 items-start gap-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#FF5C28] text-white">
                    <Plus size={16} />
                  </span>

                  <div className="min-w-0">
                    <h2 className="text-sm font-black text-white sm:text-base">
                      Add Manual Candidate Experience Entry
                    </h2>
                    <p className="mt-0.5 text-[10px] font-semibold leading-4 text-white/70 sm:text-xs">
                      Record TA-entered candidate feedback, outcome, final stage,
                      rating, and qualitative notes.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-white/70 transition hover:bg-white/10 hover:text-white"
                  aria-label="Close manual entry modal"
                >
                  <X size={18} />
                </button>
              </header>

              <main className="min-h-0 flex-1 overflow-y-auto bg-[#F7F9FC] p-4 sm:p-5">
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                  <section className="rounded-xl border border-[#DDE5EE] bg-white p-4 shadow-sm">
                    <div className="mb-3 border-b border-[#E6ECF2] pb-2.5">
                      <h3 className="text-xs font-black uppercase tracking-wide text-[#042C51]">
                        Candidate &amp; Recruitment Context
                      </h3>
                      <p className="mt-0.5 text-[10px] font-semibold text-[#667085]">
                        Identify the candidate and the recruitment outcome being
                        recorded.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <label className="block">
                        <span className="mb-1.5 block text-[9px] font-extrabold uppercase tracking-wide text-[#667085]">
                          Candidate Full Name *
                        </span>
                        <input
                          required
                          value={newForm.candidateName}
                          onChange={(event) =>
                            setNewForm({
                              ...newForm,
                              candidateName: event.target.value,
                            })
                          }
                          placeholder="e.g. Juan Dela Cruz"
                          className="h-10 w-full rounded-xl border border-[#D7DEE8] bg-[#F8FAFC] px-3 text-xs font-semibold text-[#042C51] outline-none transition focus:border-[#FF5C28] focus:bg-white focus:ring-4 focus:ring-[#FF5C28]/10"
                        />
                      </label>

                      <label className="block">
                        <span className="mb-1.5 block text-[9px] font-extrabold uppercase tracking-wide text-[#667085]">
                          Candidate Email *
                        </span>
                        <input
                          required
                          type="email"
                          value={newForm.candidateEmail}
                          onChange={(event) =>
                            setNewForm({
                              ...newForm,
                              candidateEmail: event.target.value,
                            })
                          }
                          placeholder="name@example.com"
                          className="h-10 w-full rounded-xl border border-[#D7DEE8] bg-[#F8FAFC] px-3 text-xs font-semibold text-[#042C51] outline-none transition focus:border-[#FF5C28] focus:bg-white focus:ring-4 focus:ring-[#FF5C28]/10"
                        />
                      </label>

                      <label className="block">
                        <span className="mb-1.5 block text-[9px] font-extrabold uppercase tracking-wide text-[#667085]">
                          Role / Position
                        </span>
                        <input
                          value={newForm.role}
                          onChange={(event) =>
                            setNewForm({
                              ...newForm,
                              role: event.target.value,
                            })
                          }
                          className="h-10 w-full rounded-xl border border-[#D7DEE8] bg-[#F8FAFC] px-3 text-xs font-semibold text-[#042C51] outline-none transition focus:border-[#FF5C28] focus:bg-white focus:ring-4 focus:ring-[#FF5C28]/10"
                        />
                      </label>

                      <label className="block">
                        <span className="mb-1.5 block text-[9px] font-extrabold uppercase tracking-wide text-[#667085]">
                          Account
                        </span>
                        <input
                          value={newForm.account}
                          onChange={(event) =>
                            setNewForm({
                              ...newForm,
                              account: event.target.value,
                            })
                          }
                          className="h-10 w-full rounded-xl border border-[#D7DEE8] bg-[#F8FAFC] px-3 text-xs font-semibold text-[#042C51] outline-none transition focus:border-[#FF5C28] focus:bg-white focus:ring-4 focus:ring-[#FF5C28]/10"
                        />
                      </label>

                      <label className="block">
                        <span className="mb-1.5 block text-[9px] font-extrabold uppercase tracking-wide text-[#667085]">
                          Outcome
                        </span>
                        <select
                          value={newForm.status}
                          onChange={(event) =>
                            setNewForm({
                              ...newForm,
                              status: event.target
                                .value as CandidateExperienceRecord["status"],
                            })
                          }
                          className="h-10 w-full rounded-xl border border-[#D7DEE8] bg-[#F8FAFC] px-3 text-xs font-semibold text-[#042C51] outline-none transition focus:border-[#FF5C28] focus:bg-white focus:ring-4 focus:ring-[#FF5C28]/10"
                        >
                          <option value="Drop-off">Drop-off</option>
                          <option value="Completed">Completed</option>
                        </select>
                      </label>

                      <label className="block">
                        <span className="mb-1.5 block text-[9px] font-extrabold uppercase tracking-wide text-[#667085]">
                          Final Stage
                        </span>
                        <select
                          value={newForm.exitStage}
                          onChange={(event) =>
                            setNewForm({
                              ...newForm,
                              exitStage: event.target
                                .value as CandidateExperienceRecord["exitStage"],
                            })
                          }
                          className="h-10 w-full rounded-xl border border-[#D7DEE8] bg-[#F8FAFC] px-3 text-xs font-semibold text-[#042C51] outline-none transition focus:border-[#FF5C28] focus:bg-white focus:ring-4 focus:ring-[#FF5C28]/10"
                        >
                          {[
                            "Sourced",
                            "Screened",
                            "Interviewed",
                            "Offered",
                            "Accepted",
                            "Hired",
                          ].map((stage) => (
                            <option key={stage} value={stage}>
                              {stage}
                            </option>
                          ))}
                        </select>
                      </label>

                      <label className="block sm:col-span-2">
                        <span className="mb-1.5 block text-[9px] font-extrabold uppercase tracking-wide text-[#667085]">
                          Event Classification
                        </span>
                        <select
                          value={newForm.eventType}
                          onChange={(event) =>
                            setNewForm({
                              ...newForm,
                              eventType: event.target
                                .value as CandidateExperienceRecord["eventType"],
                            })
                          }
                          className="h-10 w-full rounded-xl border border-[#D7DEE8] bg-[#F8FAFC] px-3 text-xs font-semibold text-[#042C51] outline-none transition focus:border-[#FF5C28] focus:bg-white focus:ring-4 focus:ring-[#FF5C28]/10"
                        >
                          {[
                            "Pipeline Drop-off",
                            "Offer Declined",
                            "Pre-start Withdrawal",
                            "No Show",
                            "Candidate Feedback",
                            "Process Completed",
                            "Accepted Other Offer",
                          ].map((eventType) => (
                            <option key={eventType} value={eventType}>
                              {eventType}
                            </option>
                          ))}
                        </select>
                      </label>
                    </div>
                  </section>

                  <section className="rounded-xl border border-[#DDE5EE] bg-white p-4 shadow-sm">
                    <div className="mb-3 border-b border-[#E6ECF2] pb-2.5">
                      <h3 className="text-xs font-black uppercase tracking-wide text-[#042C51]">
                        Voice of Candidate
                      </h3>
                      <p className="mt-0.5 text-[10px] font-semibold text-[#667085]">
                        Record the feedback category, rating, notes, and accountable
                        TA owner.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <label className="block">
                        <span className="mb-1.5 block text-[9px] font-extrabold uppercase tracking-wide text-[#667085]">
                          Feedback Category
                        </span>
                        <select
                          value={newForm.reasonCategory}
                          onChange={(event) =>
                            setNewForm({
                              ...newForm,
                              reasonCategory: event.target
                                .value as CandidateExperienceRecord["reasonCategory"],
                            })
                          }
                          className="h-10 w-full rounded-xl border border-[#D7DEE8] bg-[#F8FAFC] px-3 text-xs font-semibold text-[#042C51] outline-none transition focus:border-[#FF5C28] focus:bg-white focus:ring-4 focus:ring-[#FF5C28]/10"
                        >
                          {[
                            "Compensation",
                            "Schedule",
                            "Process Delay",
                            "No Response",
                            "Failed Assessment",
                            "Failed Interview",
                            "Accepted Other Offer",
                            "Location Issue",
                            "Personal Reason",
                            "Incomplete Requirements",
                            "Process Satisfactory",
                          ].map((category) => (
                            <option key={category} value={category}>
                              {category}
                            </option>
                          ))}
                        </select>
                      </label>

                      <label className="block">
                        <span className="mb-1.5 block text-[9px] font-extrabold uppercase tracking-wide text-[#667085]">
                          Feedback Tag
                        </span>
                        <input
                          value={newForm.feedbackTag}
                          onChange={(event) =>
                            setNewForm({
                              ...newForm,
                              feedbackTag: event.target.value,
                            })
                          }
                          className="h-10 w-full rounded-xl border border-[#D7DEE8] bg-[#F8FAFC] px-3 text-xs font-semibold text-[#042C51] outline-none transition focus:border-[#FF5C28] focus:bg-white focus:ring-4 focus:ring-[#FF5C28]/10"
                        />
                      </label>

                      <div className="sm:col-span-2">
                        <span className="mb-1.5 block text-[9px] font-extrabold uppercase tracking-wide text-[#667085]">
                          Candidate Rating
                        </span>

                        <div className="flex min-h-10 flex-wrap items-center gap-1.5 rounded-xl border border-[#D7DEE8] bg-[#F8FAFC] px-3 py-1.5">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              onClick={() =>
                                setNewForm({
                                  ...newForm,
                                  rating: star,
                                })
                              }
                              className="rounded-md p-0.5 transition hover:scale-110"
                              aria-label={`${star} star`}
                            >
                              <Star
                                className={`h-5 w-5 ${
                                  star <= newForm.rating
                                    ? "fill-amber-400 text-amber-400"
                                    : "text-slate-200"
                                }`}
                              />
                            </button>
                          ))}

                          <span className="ml-1 text-[10px] font-extrabold text-[#667085]">
                            {newForm.rating}/5
                          </span>
                        </div>
                      </div>

                      <label className="block sm:col-span-2">
                        <span className="mb-1.5 block text-[9px] font-extrabold uppercase tracking-wide text-[#667085]">
                          TA Owner
                        </span>
                        <input
                          value={newForm.taOwner}
                          onChange={(event) =>
                            setNewForm({
                              ...newForm,
                              taOwner: event.target.value,
                            })
                          }
                          className="h-10 w-full rounded-xl border border-[#D7DEE8] bg-[#F8FAFC] px-3 text-xs font-semibold text-[#042C51] outline-none transition focus:border-[#FF5C28] focus:bg-white focus:ring-4 focus:ring-[#FF5C28]/10"
                        />
                      </label>

                      <label className="block sm:col-span-2">
                        <span className="mb-1.5 block text-[9px] font-extrabold uppercase tracking-wide text-[#667085]">
                          Root Cause / Internal Note
                        </span>
                        <textarea
                          rows={3}
                          value={newForm.reasonDescription}
                          onChange={(event) =>
                            setNewForm({
                              ...newForm,
                              reasonDescription: event.target.value,
                            })
                          }
                          placeholder="Provide root-cause description..."
                          className="w-full resize-none rounded-xl border border-[#D7DEE8] bg-[#F8FAFC] px-3 py-2.5 text-xs font-semibold leading-5 text-[#042C51] outline-none transition focus:border-[#FF5C28] focus:bg-white focus:ring-4 focus:ring-[#FF5C28]/10"
                        />
                      </label>

                      <label className="block sm:col-span-2">
                        <span className="mb-1.5 block text-[9px] font-extrabold uppercase tracking-wide text-[#667085]">
                          Qualitative Candidate Feedback
                        </span>
                        <textarea
                          rows={4}
                          value={newForm.qualitativeFeedback}
                          onChange={(event) =>
                            setNewForm({
                              ...newForm,
                              qualitativeFeedback: event.target.value,
                            })
                          }
                          placeholder="Direct candidate comments or Voice of Candidate feedback..."
                          className="w-full resize-none rounded-xl border border-[#D7DEE8] bg-[#F8FAFC] px-3 py-2.5 text-xs font-semibold leading-5 text-[#042C51] outline-none transition focus:border-[#FF5C28] focus:bg-white focus:ring-4 focus:ring-[#FF5C28]/10"
                        />
                      </label>
                    </div>
                  </section>
                </div>
              </main>

              <footer className="flex shrink-0 flex-col-reverse gap-2 border-t border-[#E6ECF2] bg-white px-5 py-3 sm:flex-row sm:items-center sm:justify-end sm:px-6">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="inline-flex h-9 items-center justify-center rounded-lg border border-[#D7DEE8] bg-white px-4 text-xs font-extrabold text-[#475467] transition hover:border-[#FF5C28]/40 hover:bg-[#FFF8F5] hover:text-[#FF5C28]"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg bg-[#FF5C28] px-4 text-xs font-extrabold text-white transition hover:bg-[#E95324]"
                >
                  <Plus size={14} />
                  Save Manual Entry
                </button>
              </footer>
            </motion.form>
          </div>
        ) : null}
      </AnimatePresence>

      {/* Candidate Experience details */}
      <AnimatePresence>
        {selectedRecordForView ? (
          <div
            className="fixed inset-0 z-[12000] flex h-dvh items-center justify-center bg-[#042C51]/60 p-2 backdrop-blur-[2px] sm:p-4"
            onMouseDown={() => setSelectedRecordForView(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.97, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97, y: 8 }}
              role="dialog"
              aria-modal="true"
              aria-label="Candidate Experience Details"
              onMouseDown={(event) => event.stopPropagation()}
              className="flex max-h-[90dvh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-[#D9E2EC] bg-white shadow-[0_24px_80px_rgba(15,23,42,0.28)] 2xl:max-w-5xl"
            >
              <header className="shrink-0 bg-[#042C51] px-5 py-3.5 text-white sm:px-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded bg-white/10 px-2 py-0.5 font-mono text-[9px] font-bold text-slate-100 ring-1 ring-white/15">
                        Record ID: {selectedRecordForView.id}
                        {selectedRecordForView.candidateCode
                          ? ` (${selectedRecordForView.candidateCode})`
                          : ""}
                      </span>

                      <span
                        className={`rounded px-2 py-0.5 text-[9px] font-black uppercase ${
                          selectedRecordForView.status === "Drop-off"
                            ? "bg-[#FF5C28] text-white"
                            : "bg-emerald-500 text-white"
                        }`}
                      >
                        {selectedRecordForView.status}
                      </span>

                      <span className="rounded bg-white/10 px-2 py-0.5 font-mono text-[9px] font-bold text-blue-100">
                        Recorded:{" "}
                        {formatDisplayDate(
                          selectedRecordForView.surveySubmittedAt ||
                            selectedRecordForView.dateRecorded,
                        )}
                      </span>
                    </div>

                    <h2 className="mt-1.5 truncate text-base font-black text-white sm:text-lg">
                      {selectedRecordForView.candidateName}
                    </h2>

                    <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-semibold text-white/75">
                      <span className="inline-flex items-center gap-1.5">
                        <Mail size={12} />
                        {selectedRecordForView.candidateEmail || "—"}
                      </span>
                      <span className="hidden text-slate-400 sm:inline">•</span>
                      <span className="inline-flex items-center gap-1.5">
                        <Briefcase size={12} />
                        {selectedRecordForView.role || "—"}
                      </span>
                      <span className="hidden text-slate-400 sm:inline">•</span>
                      <span className="inline-flex items-center gap-1.5">
                        <Building2 size={12} />
                        {selectedRecordForView.account || "—"}
                      </span>
                    </div>

                    <div className="mt-1.5 flex flex-wrap items-center gap-2">
                      <span className="text-[9px] font-extrabold uppercase tracking-wide text-blue-100">
                        Overall Rating:
                      </span>
                      <RatingStars
                        rating={selectedRecordForView.rating}
                        size={13}
                      />
                      <span className="text-[10px] font-black text-amber-300">
                        ({Number(selectedRecordForView.rating || 0).toFixed(1)} / 5.0)
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setSelectedRecordForView(null)}
                    className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-white/70 transition hover:bg-white/10 hover:text-white"
                    aria-label="Close Candidate Experience details"
                  >
                    <X size={18} />
                  </button>
                </div>
              </header>

              <main className="min-h-0 flex-1 overflow-y-auto bg-[#F7F9FC] p-3.5 sm:p-4 2xl:p-5">
                <div className="space-y-3.5 2xl:space-y-4">
                  <section className="rounded-xl border border-[#E6ECF2] bg-white p-3.5 shadow-sm">
                    <h3 className="text-[10px] font-black uppercase tracking-wide text-[#042C51]">
                      Event &amp; Exit Overview
                    </h3>

                    <div className="mt-2.5 grid grid-cols-2 gap-2.5 rounded-lg border border-[#E6ECF2] bg-[#F8FAFC] p-3 sm:grid-cols-5">
                      {[
                        ["Event Type", selectedRecordForView.eventType],
                        ["Final Status", selectedRecordForView.status],
                        ["Exit Stage", selectedRecordForView.exitStage],
                        ["Reason Category", selectedRecordForView.reasonCategory],
                        ["Feedback Tag", selectedRecordForView.feedbackTag],
                      ].map(([label, value]) => (
                        <div key={label} className="min-w-0">
                          <p className="text-[9px] font-black uppercase tracking-wide text-[#91A4BE]">
                            {label}
                          </p>
                          <p className="mt-1 break-words text-[11px] font-black leading-4 text-[#042C51]">
                            {value || "—"}
                          </p>
                        </div>
                      ))}
                    </div>
                  </section>

                  <section className="rounded-xl border border-orange-200 bg-[#FFF7F3] p-3.5 shadow-sm">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h3 className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wide text-[#FF5C28]">
                        <MessageSquareText size={14} />
                        Candidate Qualitative Feedback (Voice of Candidate)
                      </h3>

                      <span className="text-[9px] font-mono font-black text-[#FF5C28]">
                        Direct Raw Quote
                      </span>
                    </div>

                    <blockquote className="mt-2.5 border-l-2 border-[#FF5C28] pl-3 text-[11px] font-semibold italic leading-5 text-[#173B5E]">
                      “
                      {selectedRecordForView.qualitativeFeedback ||
                        "No candidate qualitative feedback recorded."}
                      ”
                    </blockquote>

                    <div className="mt-2.5 rounded-lg border border-orange-200/80 bg-white/90 p-2.5 text-[10px] leading-4 text-[#274A6B]">
                      <strong className="font-black text-[#042C51]">
                        Root Cause Description:
                      </strong>{" "}
                      {selectedRecordForView.reasonDescription ||
                        "No root cause description recorded."}
                    </div>
                  </section>

                  <section>
                    <h3 className="text-[10px] font-black uppercase tracking-wide text-[#042C51]">
                      Stage Timeline Cascade (Candidate Journey)
                    </h3>

                    <div className="mt-2 rounded-xl border border-[#D7E0EB] bg-[#F8FAFC] px-4 py-3">
                      {selectedRecordForView.stagesPassed.length ? (
                        <div className="relative space-y-0">
                          {selectedRecordForView.stagesPassed.map(
                            (stage, index) => {
                              const isLast =
                                index ===
                                selectedRecordForView.stagesPassed.length - 1;

                              const isDropped =
                                stage.status === "Dropped";
                              const isPending =
                                stage.status === "Pending";

                              return (
                                <div
                                  key={`${stage.stage}-${index}`}
                                  className="relative flex min-h-8 items-center gap-3"
                                >
                                  <div className="relative flex w-4 shrink-0 self-stretch justify-center">
                                    {!isLast ? (
                                      <span className="absolute bottom-[-4px] left-1/2 top-5 w-px -translate-x-1/2 bg-[#D7E0EB]" />
                                    ) : null}

                                    <span
                                      className={`relative z-10 mt-1.5 h-3 w-3 rounded-full border-2 border-white shadow-sm ${
                                        isDropped
                                          ? "bg-[#FF5C28]"
                                          : isPending
                                            ? "bg-amber-400"
                                            : "bg-emerald-500"
                                      }`}
                                    />
                                  </div>

                                  <div className="flex min-w-0 flex-1 items-center justify-between gap-3 py-1.5">
                                    <div className="min-w-0">
                                      <span className="text-[11px] font-black text-[#042C51]">
                                        {stage.stage}
                                      </span>
                                      <span className="ml-2 text-[9px] font-bold text-[#A0AEC0]">
                                        ({stage.timestamp || "Recent"})
                                      </span>
                                    </div>

                                    <span
                                      className={`shrink-0 rounded px-2.5 py-1 text-[9px] font-black uppercase ${
                                        isDropped
                                          ? "bg-[#FFE5DC] text-[#D84616]"
                                          : isPending
                                            ? "bg-amber-100 text-amber-700"
                                            : "bg-emerald-100 text-emerald-700"
                                      }`}
                                    >
                                      {stage.status}
                                    </span>
                                  </div>
                                </div>
                              );
                            },
                          )}
                        </div>
                      ) : (
                        <div className="py-3 text-center text-[11px] font-semibold text-slate-400">
                          No candidate journey timeline recorded.
                        </div>
                      )}
                    </div>
                  </section>

                  <section className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    <div className="rounded-xl border border-[#E6ECF2] bg-white p-3">
                      <p className="text-[9px] font-black uppercase tracking-wide text-[#91A4BE]">
                        Survey Status
                      </p>
                      <span
                        className={`mt-1 inline-flex rounded-full border px-2.5 py-1 text-[10px] font-extrabold ${surveyStatusClass(
                          getSurveyStatus(selectedRecordForView),
                        )}`}
                      >
                        {getSurveyStatusLabel(
                          getSurveyStatus(selectedRecordForView),
                        )}
                      </span>
                    </div>

                    <div className="rounded-xl border border-[#E6ECF2] bg-white p-3">
                      <p className="text-[9px] font-black uppercase tracking-wide text-[#91A4BE]">
                        Response Source
                      </p>
                      <span
                        className={`mt-1 inline-flex rounded-full border px-2.5 py-1 text-[10px] font-extrabold ${responseSourceClass(
                          getResponseSource(selectedRecordForView),
                        )}`}
                      >
                        {getResponseSourceLabel(
                          getResponseSource(selectedRecordForView),
                        )}
                      </span>
                    </div>
                  </section>

                  <section className="flex flex-col gap-2 rounded-xl border border-[#E6ECF2] bg-[#F8FAFC] p-3 text-[10px] sm:flex-row sm:items-center sm:justify-between">
                    <div className="inline-flex min-w-0 items-center gap-2 text-[#64748B]">
                      <User size={13} className="shrink-0 text-[#042C51]" />
                      <span>
                        Assigned TA Recruiter:{" "}
                        <strong className="font-black text-[#042C51]">
                          {selectedRecordForView.taOwner || "Unassigned"}
                        </strong>
                      </span>
                    </div>

                    <div className="inline-flex min-w-0 items-center gap-2 font-mono text-[#64748B]">
                      <FileText
                        size={12}
                        className="shrink-0 text-[#91A4BE]"
                      />
                      <span>
                        System Record ID:{" "}
                        <strong className="font-black text-[#425B78]">
                          {selectedRecordForView.id}
                        </strong>
                      </span>
                    </div>
                  </section>
                </div>
              </main>

              <footer className="flex shrink-0 flex-col gap-2 border-t border-[#DDE5EE] bg-[#F1F5F9] px-5 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      openSurveyModal(selectedRecordForView);
                      setSelectedRecordForView(null);
                    }}
                    className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border border-[#FFD3C4] bg-[#FFF4EF] px-3.5 text-xs font-extrabold text-[#E65324] transition hover:bg-[#FFE9DF]"
                  >
                    <Mail size={13} />
                    Send Survey
                  </button>

                  <button
                    type="button"
                    onClick={() => copySurveyLink(selectedRecordForView)}
                    className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border border-[#D6DEE8] bg-white px-3.5 text-xs font-extrabold text-[#475467] transition hover:border-[#FF5C28]/40 hover:bg-[#FFF8F5] hover:text-[#FF5C28]"
                  >
                    <Copy size={13} />
                    Copy Survey Link
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedRecordForView(null)}
                  className="inline-flex h-9 items-center justify-center rounded-lg border border-[#D6DEE8] bg-white px-3.5 text-xs font-extrabold text-[#667085] transition hover:border-[#FF5C28]/40 hover:bg-[#FFF8F5] hover:text-[#FF5C28]"
                >
                  Close Experience Record
                </button>
              </footer>
            </motion.div>
          </div>
        ) : null}
      </AnimatePresence>

      <SendSurveyModal
        isOpen={isSendSurveyModalOpen}
        onClose={() => {
          setIsSendSurveyModalOpen(false);
          setSelectedRecordForSurvey(null);
        }}
        candidateRecord={selectedRecordForSurvey}
        onSurveySent={handleSurveySent}
      />
    </div>
  );
}
