import React, { useState, useMemo, useEffect } from "react";
import ApplicationQuestionsFormSettings from "./ApplicationQuestionsFormSettings";
import {
  Settings,
  Cog,
  FileText,
  ClipboardCheck,
  CheckCircle2,
  Sliders,
  UserCheck,
  Building2,
  FileCheck2,
  ClipboardList,
  Mail,
  Calendar,
  ShieldCheck,
  Search,
  Plus,
  Trash2,
  Edit3,
  RefreshCw,
  Save,
  Check,
  AlertCircle,
  Clock,
  Filter,
  X,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Star,
  Eye,
  Info,
  Layers,
  Sparkles,
  UserPlus,
  HelpCircle,
  Lock,
  ArrowRight,
  ArrowLeft,
  Award,
  Zap,
  GripVertical
} from "lucide-react";

interface RecruitmentSettingsProps {
  userEmail?: string;
  onSwitchModule?: (moduleName: string) => void;
}

// ---------------------- TYPES ----------------------
interface HeadcountRecord {
  id: string;
  account: string;
  subCategory: string;
  cluster: string;
  requiredHC: number;
  actualHC: number;
  reqBuffer: number;
  absenteeism: number;
  attrition: number;
  opsPerformance: number;
  needsHC: number;
  leadsHC: number;
  hiringRate: number;
  status: "Kronos Sync" | "Manual Override" | "Approved Ramp";
  statusNote: string;
}

interface PositionFormItem {
  id: string;
  code: string;
  title: string;
  department: string;
  site: string;
  status: "Active" | "Inactive" | "Draft";
  skills: string;
  formName: string;
  passingScore: number;
  description: string;
  questionsCount: number;
}

interface QuestionItem {
  id: string;
  category: "Competency" | "Technical" | "Communication" | "Cultural Fit";
  question: string;
  weight: number;
  scoringScale: string;
  isRequired: boolean;
}

interface PipelineStage {
  id: string;
  order: number;
  name: string;
  slaDays: number;
  passingScorePct: number;
  isMandatory: boolean;
  autoReject: boolean;
  description: string;
}

interface EmailTemplateItem {
  id: string;
  code: string;
  title: string;
  category: string;
  subject: string;
  body: string;
  lastUpdated: string;
}

interface HolidayEntry {
  id: string;
  date: string;
  name: string;
  type: string;
  status: "Active" | "Inactive";
}

interface ApprovalUser {
  id: string;
  sibsId: string;
  name: string;
  role: string;
  permissionText: string;
}

// ---------------------- INITIAL MOCK DATA ----------------------
const INITIAL_HEADCOUNTS: HeadcountRecord[] = [
  {
    id: "HC-001",
    account: "Accountants 2.0",
    subCategory: "SME",
    cluster: "Corporate & Executive",
    requiredHC: 12,
    actualHC: 10,
    reqBuffer: 0,
    absenteeism: 1,
    attrition: 0,
    opsPerformance: 92,
    needsHC: 2,
    leadsHC: 4,
    hiringRate: 65.0,
    status: "Kronos Sync",
    statusNote: "Kronos actual headcount fallback"
  },
  {
    id: "HC-002",
    account: "Admin Operations",
    subCategory: "Corporate",
    cluster: "Corporate & Executive",
    requiredHC: 14,
    actualHC: 14,
    reqBuffer: 1,
    absenteeism: 0,
    attrition: 0,
    opsPerformance: 95,
    needsHC: 0,
    leadsHC: 0,
    hiringRate: 70.0,
    status: "Kronos Sync",
    statusNote: "Full staff adherence maintained"
  },
  {
    id: "HC-003",
    account: "AHG Auditor",
    subCategory: "SME",
    cluster: "Financial Services",
    requiredHC: 8,
    actualHC: 6,
    reqBuffer: 0,
    absenteeism: 0,
    attrition: 1,
    opsPerformance: 88,
    needsHC: 2,
    leadsHC: 3,
    hiringRate: 60.0,
    status: "Kronos Sync",
    statusNote: "Replacement request in pipeline"
  },
  {
    id: "HC-004",
    account: "Chevron Support",
    subCategory: "Energy & Tech",
    cluster: "Telecom & Tech",
    requiredHC: 45,
    actualHC: 40,
    reqBuffer: 3,
    absenteeism: 2,
    attrition: 1,
    opsPerformance: 91,
    needsHC: 5,
    leadsHC: 8,
    hiringRate: 68.0,
    status: "Approved Ramp",
    statusNote: "Q3 Ramp active for SiBS Davao"
  },
  {
    id: "HC-005",
    account: "Elevance Health",
    subCategory: "Healthcare Care",
    cluster: "Healthcare & Compliance",
    requiredHC: 120,
    actualHC: 115,
    reqBuffer: 5,
    absenteeism: 4,
    attrition: 2,
    opsPerformance: 94,
    needsHC: 5,
    leadsHC: 10,
    hiringRate: 72.0,
    status: "Kronos Sync",
    statusNote: "HIPAA claims support line"
  },
  {
    id: "HC-006",
    account: "Citi Global",
    subCategory: "Fintech",
    cluster: "Financial Services",
    requiredHC: 80,
    actualHC: 78,
    reqBuffer: 2,
    absenteeism: 3,
    attrition: 1,
    opsPerformance: 90,
    needsHC: 2,
    leadsHC: 4,
    hiringRate: 65.0,
    status: "Kronos Sync",
    statusNote: "PCI-DSS security tier"
  },
  {
    id: "HC-007",
    account: "Verizon Tech",
    subCategory: "Enterprise Voice",
    cluster: "Telecom & Tech",
    requiredHC: 210,
    actualHC: 195,
    reqBuffer: 10,
    absenteeism: 8,
    attrition: 4,
    opsPerformance: 89,
    needsHC: 15,
    leadsHC: 25,
    hiringRate: 62.0,
    status: "Approved Ramp",
    statusNote: "Class starting August 18 at SiBS Tagum"
  }
];

const INITIAL_POSITION_FORMS: PositionFormItem[] = [
  {
    id: "POS-001",
    code: "POS-001",
    title: "Customer Service Representative",
    department: "Call Center Operations",
    site: "SiBS Tagum",
    status: "Active",
    skills: "Voice Customer Care, Communication, CRM",
    formName: "Customer Service Representative - Final Interview Form",
    passingScore: 80,
    description: "Final interview assessment form for Customer Service Representative evaluating communication clarity, empathy, customer problem solving, and operational culture alignment.",
    questionsCount: 5
  },
  {
    id: "POS-002",
    code: "POS-002",
    title: "Non Voice Specialist",
    department: "Call Center Operations",
    site: "SiBS Davao",
    status: "Active",
    skills: "Chat Support, Written English, Multi-tasking",
    formName: "Non Voice Specialist - Final Assessment Form",
    passingScore: 82,
    description: "Evaluation form for digital non-voice and omnichannel chat specialists measuring typing accuracy, grammar precision, and ticketing turnaround speed.",
    questionsCount: 4
  },
  {
    id: "POS-006",
    code: "POS-006",
    title: "Healthcare Claims Specialist",
    department: "Human Resource",
    site: "SiBS Mabini",
    status: "Active",
    skills: "HIPAA Compliance, Medical Terminology",
    formName: "Healthcare Claims Specialist - Technical Interview",
    passingScore: 85,
    description: "Assessment form for HIPAA-compliant medical claims processing personnel, evaluating terminology grasp and accuracy.",
    questionsCount: 6
  },
  {
    id: "POS-017",
    code: "POS-017",
    title: "Call Center Agent",
    department: "Call Center Operations",
    site: "SiBS Davao",
    status: "Active",
    skills: "Inbound Escalations, De-escalation",
    formName: "Call Center Agent - Standard Scoring Matrix",
    passingScore: 78,
    description: "Core inbound call handling evaluation focusing on tone neutralization, active listening, and system navigational speed.",
    questionsCount: 4
  }
];

export interface FormQuestionItem {
  id: string;
  title: string;
  inputType: "Rating" | "Text" | "Single Choice" | "Multiple Choice" | "Pass/Fail";
  ratingScale: "1 to 5" | "1 to 10" | "1 to 4" | "Satisfactory/Unsatisfactory";
  weight: number;
  options?: string[];
}

export interface FormSectionItem {
  id: string;
  title: string;
  weight: number;
  isCollapsed?: boolean;
  questions: FormQuestionItem[];
}

const INITIAL_FORM_SECTIONS: FormSectionItem[] = [
  {
    id: "sec-1",
    title: "1. COMMUNICATION & ARTICULATION",
    weight: 25,
    isCollapsed: false,
    questions: [
      {
        id: "q-1-1",
        title: "Demonstrates clear vocal articulation, accent neutralization, and active listening skills during scenario simulation.",
        inputType: "Rating",
        ratingScale: "1 to 5",
        weight: 15
      },
      {
        id: "q-1-2",
        title: "Provide detailed feedback on candidate's tone, pacing, and confidence during mock call.",
        inputType: "Text",
        ratingScale: "1 to 5",
        weight: 10
      }
    ]
  },
  {
    id: "sec-2",
    title: "2. COMPETENCY & SCENARIO HANDLING",
    weight: 25,
    isCollapsed: false,
    questions: [
      {
        id: "q-2-1",
        title: "Customer de-escalation capability: How effectively did candidate manage demanding scenarios in mock call?",
        inputType: "Rating",
        ratingScale: "1 to 5",
        weight: 15
      },
      {
        id: "q-2-2",
        title: "Discuss an experience you had at work when expectations were unclear. How did candidate react and resolve it?",
        inputType: "Rating",
        ratingScale: "1 to 5",
        weight: 10
      }
    ]
  },
  {
    id: "sec-3",
    title: "3. TECHNICAL PROFICIENCY & MULTI-TASKING",
    weight: 25,
    isCollapsed: false,
    questions: [
      {
        id: "q-3-1",
        title: "Navigational speed & multi-tasking: Ability to record ticket notes while engaged in active dialogue.",
        inputType: "Rating",
        ratingScale: "1 to 5",
        weight: 15
      },
      {
        id: "q-3-2",
        title: "System navigation and tool proficiency verification.",
        inputType: "Pass/Fail",
        ratingScale: "Satisfactory/Unsatisfactory",
        weight: 10
      }
    ]
  },
  {
    id: "sec-4",
    title: "4. CULTURAL FIT & SIBS CORE VALUES",
    weight: 25,
    isCollapsed: false,
    questions: [
      {
        id: "q-4-1",
        title: "SIBS core values alignment: Commitment to team collaboration, schedule flexibility, and continuous learning.",
        inputType: "Rating",
        ratingScale: "1 to 5",
        weight: 25
      }
    ]
  }
];

const INITIAL_PIPELINE_STAGES: PipelineStage[] = [
  {
    id: "STG-1",
    order: 1,
    name: "1. Sourcing & AI Resume Screen",
    slaDays: 1,
    passingScorePct: 60,
    isMandatory: true,
    autoReject: true,
    description: "Initial automated resume parsing, keyword match against position profile, and contact validation."
  },
  {
    id: "STG-2",
    order: 2,
    name: "2. Online Skills & Typing Assessment",
    slaDays: 1,
    passingScorePct: 75,
    isMandatory: true,
    autoReject: true,
    description: "Versant audio assessment, typing speed (WPM) test, and grammar & comprehension examination."
  },
  {
    id: "STG-3",
    order: 3,
    name: "3. Initial Talent Acquisition Interview",
    slaDays: 2,
    passingScorePct: 70,
    isMandatory: true,
    autoReject: false,
    description: "HR recruiter screening assessing basic qualifications, salary expectation, shift availability, and site distance."
  },
  {
    id: "STG-4",
    order: 4,
    name: "4. Technical Simulation & Mock Call",
    slaDays: 2,
    passingScorePct: 80,
    isMandatory: true,
    autoReject: false,
    description: "Account-specific role simulation (call handling, chat response, or navigation assessment)."
  },
  {
    id: "STG-5",
    order: 5,
    name: "5. Operations / Client Final Interview",
    slaDays: 3,
    passingScorePct: 80,
    isMandatory: true,
    autoReject: false,
    description: "Final behavioral interview with Operations Manager or Client Partner lead."
  },
  {
    id: "STG-6",
    order: 6,
    name: "6. Job Offer & Pre-Employment Intake",
    slaDays: 2,
    passingScorePct: 100,
    isMandatory: true,
    autoReject: false,
    description: "Offer extension, compensation breakdown presentation, and medical/background submission."
  },
  {
    id: "STG-7",
    order: 7,
    name: "7. NHO & First Day Training (FST)",
    slaDays: 1,
    passingScorePct: 100,
    isMandatory: true,
    autoReject: false,
    description: "Day 1 New Hire Orientation attendance lock and system credential issuance."
  }
];

const INITIAL_EMAIL_TEMPLATES: EmailTemplateItem[] = [
  {
    id: "TMPL-001",
    code: "INVITE-INTV",
    title: "Candidate Interview Schedule Invitation",
    category: "Interview Scheduling",
    subject: "Interview Schedule Invitation - {role_title} ({site_location})",
    body: `Hi {candidate_name},\n\nWe are pleased to invite you to the next step of our hiring process.\n\nPosition: {role_title}\nDate and Time: {interview_date}\nInterview Type: {interview_type}\n\nRespond to your interview schedule\nOpen the secure public page and choose Accept, Reschedule, or Decline.\n\nReschedule dates are available Monday to Friday, excluding configured holidays, from 10:00 AM to 5:00 PM. Your response becomes final after submission.\nCurrent response deadline: {deadline_date}\n\n[Respond to Interview Schedule]`,
    lastUpdated: "2026-08-12"
  },
  {
    id: "TMPL-002",
    code: "APP-CLOSED",
    title: "Application Update & Closure Notice",
    category: "Candidate Communications",
    subject: "Application Update - {role_title}",
    body: `Hi {candidate_name},\n\nThank you for your interest in the {role_title} role at SiBS Contact Center and for the time you invested in the recruitment process.\n\nWe have closed your current application because we did not receive a response after our interview scheduling messages and follow-ups.\n\nWe appreciate your interest in joining SiBS Contact Center and encourage you to watch for future openings that match your experience and qualifications.\n\nIf you have questions, contact us at careers@thesiblingssolutions.com or 09178303126.\n\nBest regards,\nTalent Acquisition Team\nSiBS Contact Center`,
    lastUpdated: "2026-08-11"
  },
  {
    id: "TMPL-003",
    code: "OFFER-V2",
    title: "Official Employment Offer V2 (Candidate)",
    category: "Offers & Onboarding",
    subject: "SiBS Employment Offer V2 - {candidate_name} - {interview_date}",
    body: `Congratulations, {candidate_name}!\n\nYour approved Employment Offer is attached as a PDF.\n\nFinal Role: {role_title}\nFinal Account: {account_name}\nBasic Daily Rate: {basic_daily_rate}\nDaily De Minimis: {de_minimis_rate}\nTotal Daily Rate: {total_daily_rate}\n\nPlease choose your response:\n\n[Accept Offer]  [Negotiate Offer]\n\nThese links expire in 168 hours and may be used only once.`,
    lastUpdated: "2026-08-11"
  },
  {
    id: "TMPL-004",
    code: "NHO-SCHED",
    title: "New Hire Orientation (NHO) Schedule",
    category: "Offers & Onboarding",
    subject: "SiBS - New Hire Orientation (NHO) Schedule",
    body: `Congratulations, {candidate_name}!\n\nYou have accepted your employment offer.\n\nNEW HIRE ORIENTATION SCHEDULE\n{nho_date}\n\nPlease confirm your NHO schedule. If you need another date, you may reschedule to another available Friday only.\n\n[Respond to NHO Schedule]\n\nOnly Friday dates are available for NHO scheduling and rescheduling.\nFor questions, contact careers@thesiblingssolutions.com or 09178303126.`,
    lastUpdated: "2026-08-11"
  },
  {
    id: "TMPL-005",
    code: "INTV-RESP",
    title: "Candidate Interview Response Notice (Internal HR)",
    category: "Internal Notifications",
    subject: "Candidate Interview Response - {candidate_name} ({response_status})",
    body: `Hi SiBS,\n\n{candidate_name} accepted the proposed interview schedule.\n\nCandidate: {candidate_name}\nPosition: {role_title}\nAccount: {account_name}\nInterview Type: {interview_type}\nResponse: {response_status}\nProposed Schedule: {interview_date}\nFinal Schedule: {interview_date}\nSchedule Changed: No\n\nThe Candidate Pipeline record has been updated to Interview Scheduled.`,
    lastUpdated: "2026-08-12"
  },
  {
    id: "TMPL-006",
    code: "OFFER-APPR",
    title: "Internal Offer Approval Request",
    category: "Internal Notifications",
    subject: "Action Required: Offer Approval Request for {candidate_name}",
    body: `Hi {approver_name},\n\nA proposed employment offer is waiting for your review in the Offers page of SiBS HRIS. Please approve or decline the proposed offer.\n\nCandidate: {candidate_name}\nFinal Role: {role_title}\nFinal Account: {account_name}\nBasic Daily Rate: {basic_daily_rate}\nDaily De Minimis: {de_minimis_rate}\nProposed Daily Total: {total_daily_rate}\nStart Date: {start_date}\n\n[Review Proposed Offer]\n\nFor security, SiBS HRIS will ask you to log in first. After a successful login, you will be redirected to this candidate's exact offer record.\n\nBest regards,\nTalent Acquisition Team`,
    lastUpdated: "2026-08-11"
  },
  {
    id: "TMPL-007",
    code: "ASSESS-LINK",
    title: "Online Skills & Language Assessment Instructions",
    category: "Assessment Stage",
    subject: "Action Required: Complete Your SiBS Skills & Typing Test for {role_title}",
    body: `Hi {candidate_name},\n\nThank you for applying for the {role_title} role at SiBS Contact Center ({site_location}).\n\nTo proceed to the next stage, please complete the online typing and Versant language assessment using the link below within 48 hours:\n\nAssessment Link: {assessment_link}\n\nTips for success:\n1. Use a quiet room with a reliable internet connection.\n2. Ensure your headset microphone is functioning.\n\nGood luck!\nSiBS TA Sourcing Team`,
    lastUpdated: "2026-07-28"
  }
];

const INITIAL_HOLIDAYS: HolidayEntry[] = [
  { id: "HOL-1", date: "2026-08-21", name: "Ninoy Aquino Day", type: "Special Non-Working Holiday", status: "Active" },
  { id: "HOL-2", date: "2026-08-31", name: "National Heroes Day", type: "Regular Holiday", status: "Active" },
  { id: "HOL-3", date: "2026-11-01", name: "All Saints' Day", type: "Special Non-Working Holiday", status: "Active" },
  { id: "HOL-4", date: "2026-11-30", name: "Bonifacio Day", type: "Regular Holiday", status: "Active" },
  { id: "HOL-5", date: "2026-12-25", name: "Christmas Day", type: "Regular Holiday", status: "Active" },
  { id: "HOL-6", date: "2026-12-30", name: "Rizal Day", type: "Regular Holiday", status: "Active" }
];

const INITIAL_APPROVAL_RULES: Record<string, ApprovalUser[]> = {
  jd: [
    { id: "AP-1", sibsId: "6496", name: "CANITAN, CRISTER ALBERCA", role: "VP of Call Center Operations", permissionText: "Can approve, reject, or tag Job Descriptions for revision." },
    { id: "AP-2", sibsId: "0002", name: "NADELA, RAUL JR. AMORA", role: "Director of Operations", permissionText: "Can approve, reject, or tag Job Descriptions for revision." },
    { id: "AP-3", sibsId: "6099", name: "LABUS, ROLAND JAMES DIAGBEL", role: "WFM Lead", permissionText: "Can approve, reject, or tag Job Descriptions for revision." }
  ],
  needs: [
    { id: "AP-4", sibsId: "6496", name: "CANITAN, CRISTER ALBERCA", role: "VP of Call Center Operations", permissionText: "Can authorize account headcount ramp requests." },
    { id: "AP-5", sibsId: "0005", name: "BATACAN, ALENA MENDOZA", role: "Director of Talent Acquisition", permissionText: "Can authorize account headcount ramp requests." }
  ],
  positions: [
    { id: "AP-6", sibsId: "0005", name: "BATACAN, ALENA MENDOZA", role: "Director of Talent Acquisition", permissionText: "Can activate or publish new available positions." },
    { id: "AP-7", sibsId: "0008", name: "DELOS REYES, SHIELA MAE", role: "People Operations Director", permissionText: "Can activate or publish new available positions." }
  ],
  offers: [
    { id: "AP-8", sibsId: "0005", name: "BATACAN, ALENA MENDOZA", role: "Director of Talent Acquisition", permissionText: "Can review, extend, and sign candidate Job Offer letters." },
    { id: "AP-9", sibsId: "6496", name: "CANITAN, CRISTER ALBERCA", role: "VP of Call Center Operations", permissionText: "Can review, extend, and sign candidate Job Offer letters." },
    { id: "AP-10", sibsId: "0012", name: "SARMIENTO, MARK GREGORY", role: "Director of Finance", permissionText: "Can approve financial compensation packages on offer letters." }
  ]
};

export default function RecruitmentSettings({
  userEmail = "alena.batacan@thesiblingssolutions.com",
  onSwitchModule
}: RecruitmentSettingsProps) {
  // Active Tab
  const [activeTab, setActiveTab] = useState<
    "headcounts" | "interview_form" | "application_questions" | "pipeline" | "assessments" | "emails" | "holidays" | "approvals"
  >("headcounts");

  // Notifications / Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // ---------------- TAB 1: HEADCOUNTS STATE ----------------
  const [headcounts, setHeadcounts] = useState<HeadcountRecord[]>(INITIAL_HEADCOUNTS);
  const [hcSearch, setHcSearch] = useState("");
  const [hcClusterFilter, setHcClusterFilter] = useState("All Clusters");
  const [hcStatusFilter, setHcStatusFilter] = useState("All Status");

  const filteredHeadcounts = useMemo(() => {
    return headcounts.filter(item => {
      const matchSearch =
        item.account.toLowerCase().includes(hcSearch.toLowerCase()) ||
        item.cluster.toLowerCase().includes(hcSearch.toLowerCase()) ||
        item.status.toLowerCase().includes(hcSearch.toLowerCase());

      const matchCluster = hcClusterFilter === "All Clusters" || item.cluster === hcClusterFilter;
      const matchStatus = hcStatusFilter === "All Status" || item.status === hcStatusFilter;

      return matchSearch && matchCluster && matchStatus;
    });
  }, [headcounts, hcSearch, hcClusterFilter, hcStatusFilter]);

  const handleUpdateRequiredHC = (id: string, newReq: number) => {
    setHeadcounts(prev =>
      prev.map(item => {
        if (item.id === id) {
          const needs = Math.max(0, newReq - item.actualHC);
          return {
            ...item,
            requiredHC: newReq,
            needsHC: needs,
            leadsHC: Math.round(needs * 1.8),
            status: "Manual Override",
            statusNote: "Manual admin requirement adjustment"
          };
        }
        return item;
      })
    );
    showToast("Account required headcount updated successfully.");
  };

  // ---------------- TAB 2: FINAL INTERVIEW FORM STATE ----------------
  const [positions, setPositions] = useState<PositionFormItem[]>(() => {
    try {
      const saved = localStorage.getItem("sibs_final_interview_forms");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error("Error reading saved final interview forms", e);
    }
    return INITIAL_POSITION_FORMS;
  });

  // Save changes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem("sibs_final_interview_forms", JSON.stringify(positions));
    } catch (e) {
      console.error("Error persisting final interview forms", e);
    }
  }, [positions]);

  const [selectedPosId, setSelectedPosId] = useState("POS-001");
  const [posSearch, setPosSearch] = useState("");
  const [formSections, setFormSections] = useState<FormSectionItem[]>(INITIAL_FORM_SECTIONS);
  const [formViewMode, setFormViewMode] = useState<"table" | "edit">("table");
  const [formStatusFilter, setFormStatusFilter] = useState("All");

  // Create / Add Position Form Modal State
  const [isCreatePosModalOpen, setIsCreatePosModalOpen] = useState(false);
  const [newPositionData, setNewPositionData] = useState({
    title: "",
    code: "",
    department: "Call Center Operations",
    site: "SiBS Tagum",
    formName: "",
    passingScore: 80,
    skills: "Voice Customer Care, Communication, CRM",
    description: "",
    templatePreset: "standard" as "standard" | "technical" | "leadership" | "clone" | "blank",
    cloneFromId: "POS-001",
    status: "Active" as "Active" | "Draft"
  });

  const handleOpenCreatePositionModal = () => {
    const existingNums = positions
      .map(p => {
        const match = p.code.match(/POS-(\d+)/);
        return match ? parseInt(match[1], 10) : 0;
      })
      .filter(n => !isNaN(n));
    const nextNum = existingNums.length > 0 ? Math.max(...existingNums) + 1 : positions.length + 1;
    const autoCode = `POS-${String(nextNum).padStart(3, "0")}`;

    setNewPositionData({
      title: "",
      code: autoCode,
      department: "Call Center Operations",
      site: "SiBS Tagum",
      formName: "",
      passingScore: 80,
      skills: "Communication, Customer Focus, Problem Solving",
      description: "",
      templatePreset: "standard",
      cloneFromId: positions[0]?.id || "POS-001",
      status: "Active"
    });
    setIsCreatePosModalOpen(true);
  };

  const handleCreatePositionForm = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newPositionData.title.trim()) {
      showToast("Please enter a position title.");
      return;
    }

    const posId = newPositionData.code.trim() || `POS-${Date.now().toString().slice(-4)}`;
    const finalFormName = newPositionData.formName.trim() || `${newPositionData.title.trim()} - Final Interview Form`;
    const finalDescription = newPositionData.description.trim() || `Final interview assessment form for ${newPositionData.title.trim()} evaluating core competencies, problem solving, and cultural alignment.`;

    const newPos: PositionFormItem = {
      id: posId,
      code: newPositionData.code.trim() || posId,
      title: newPositionData.title.trim(),
      department: newPositionData.department,
      site: newPositionData.site,
      status: newPositionData.status,
      skills: newPositionData.skills || "Core Skills, Communication",
      formName: finalFormName,
      passingScore: Number(newPositionData.passingScore) || 80,
      description: finalDescription,
      questionsCount: 4
    };

    let initialSections: FormSectionItem[] = [];
    if (newPositionData.templatePreset === "standard") {
      initialSections = INITIAL_FORM_SECTIONS;
    } else if (newPositionData.templatePreset === "technical") {
      initialSections = [
        {
          id: `sec-${Date.now()}-1`,
          title: "1. TECHNICAL KNOWLEDGE & SYSTEM PROFICIENCY",
          weight: 35,
          isCollapsed: false,
          questions: [
            {
              id: `q-${Date.now()}-1`,
              title: "Demonstrates deep subject matter expertise, diagnostic workflows, and system architecture grasp.",
              inputType: "Rating",
              ratingScale: "1 to 5",
              weight: 20
            },
            {
              id: `q-${Date.now()}-2`,
              title: "Navigates multi-system interfaces and tool configurations within target SLA benchmark.",
              inputType: "Rating",
              ratingScale: "1 to 5",
              weight: 15
            }
          ]
        },
        {
          id: `sec-${Date.now()}-2`,
          title: "2. TROUBLESHOOTING & ROOT CAUSE ANALYSIS",
          weight: 35,
          isCollapsed: false,
          questions: [
            {
              id: `q-${Date.now()}-3`,
              title: "Step-by-step issue isolation and structured diagnostic problem-solving execution.",
              inputType: "Rating",
              ratingScale: "1 to 5",
              weight: 20
            },
            {
              id: `q-${Date.now()}-4`,
              title: "Quality of technical case notes documentation and escalation prevention accuracy.",
              inputType: "Rating",
              ratingScale: "1 to 5",
              weight: 15
            }
          ]
        },
        {
          id: `sec-${Date.now()}-3`,
          title: "3. COMPLIANCE & SIBS CULTURE FIT",
          weight: 30,
          isCollapsed: false,
          questions: [
            {
              id: `q-${Date.now()}-5`,
              title: "Information security protocol adherence, data confidentiality, and culture alignment.",
              inputType: "Pass/Fail",
              ratingScale: "Satisfactory/Unsatisfactory",
              weight: 30
            }
          ]
        }
      ];
    } else if (newPositionData.templatePreset === "leadership") {
      initialSections = [
        {
          id: `sec-${Date.now()}-1`,
          title: "1. PEOPLE LEADERSHIP & TEAM COACHING",
          weight: 30,
          isCollapsed: false,
          questions: [
            {
              id: `q-${Date.now()}-1`,
              title: "Coaching methodology: Ability to identify root causes in KPI deficits and conduct constructive 1-on-1s.",
              inputType: "Rating",
              ratingScale: "1 to 5",
              weight: 15
            },
            {
              id: `q-${Date.now()}-2`,
              title: "Team motivation and attrition management strategy under high ramp volume.",
              inputType: "Rating",
              ratingScale: "1 to 5",
              weight: 15
            }
          ]
        },
        {
          id: `sec-${Date.now()}-2`,
          title: "2. OPERATIONAL SLA & METRIC EXECUTION",
          weight: 35,
          isCollapsed: false,
          questions: [
            {
              id: `q-${Date.now()}-3`,
              title: "Proven experience driving CSAT, FCR, AHT, and Shrinkage reduction across shifts.",
              inputType: "Rating",
              ratingScale: "1 to 5",
              weight: 20
            },
            {
              id: `q-${Date.now()}-4`,
              title: "Escalation handling and client communication composure during Sev-1 outages.",
              inputType: "Rating",
              ratingScale: "1 to 5",
              weight: 15
            }
          ]
        },
        {
          id: `sec-${Date.now()}-3`,
          title: "3. STRATEGIC FIT & SIBS CORE VALUES",
          weight: 35,
          isCollapsed: false,
          questions: [
            {
              id: `q-${Date.now()}-5`,
              title: "Exemplifies SiBS values: Integrity, accountability, transparency, and people-first culture.",
              inputType: "Rating",
              ratingScale: "1 to 5",
              weight: 35
            }
          ]
        }
      ];
    } else if (newPositionData.templatePreset === "clone") {
      initialSections = formSections;
    } else {
      initialSections = [
        {
          id: `sec-${Date.now()}-1`,
          title: "1. GENERAL EVALUATION CRITERIA",
          weight: 100,
          isCollapsed: false,
          questions: [
            {
              id: `q-${Date.now()}-1`,
              title: "Core competency assessment for candidate evaluation.",
              inputType: "Rating",
              ratingScale: "1 to 5",
              weight: 100
            }
          ]
        }
      ];
    }

    setPositions(prev => [newPos, ...prev]);
    setSelectedPosId(posId);
    setFormSections(initialSections);
    setFormViewMode("edit");
    setBuilderStep(1);
    setIsCreatePosModalOpen(false);
    showToast(`Created new position interview form for "${newPos.title}" (${newPos.code})!`);
  };

  // Newbie-Friendly Form Builder Wizard State
  const [builderStep, setBuilderStep] = useState<1 | 2 | 3 | "all">(1);
  const [showNewbieGuide, setShowNewbieGuide] = useState(true);

  // Live Candidate Evaluation Form Preview Modal State
  const [isLivePreviewModalOpen, setIsLivePreviewModalOpen] = useState(false);
  const [previewCandidateName, setPreviewCandidateName] = useState("Juan Dela Cruz");
  const [previewInterviewerName, setPreviewInterviewerName] = useState("Maria Santos (HR Lead)");
  const [previewScores, setPreviewScores] = useState<Record<string, any>>({
    "q-1": 4,
    "q-2": 5,
    "q-3": 4,
  });
  const [previewNotes, setPreviewNotes] = useState<Record<string, string>>({});
  const [showCandidateContextPanel, setShowCandidateContextPanel] = useState(true);
  const [inlinePreviewQuestions, setInlinePreviewQuestions] = useState<Record<string, boolean>>({});

  const handleAddPresetSection = (presetType: "communication" | "problem_solving" | "technical" | "culture") => {
    let title = "";
    let sampleQuestions: FormQuestionItem[] = [];

    if (presetType === "communication") {
      title = `${formSections.length + 1}. COMMUNICATION & LANGUAGE PROFICIENCY`;
      sampleQuestions = [
        {
          id: `q-${Date.now()}-1`,
          title: "Articulates thoughts clearly with accurate grammar, vocabulary, and active listening skills.",
          inputType: "Rating",
          ratingScale: "1 to 5",
          weight: 25
        },
        {
          id: `q-${Date.now()}-2`,
          title: "Demonstrates calm tone control, empathy, and rapport-building under simulated escalation.",
          inputType: "Rating",
          ratingScale: "1 to 5",
          weight: 25
        }
      ];
    } else if (presetType === "problem_solving") {
      title = `${formSections.length + 1}. PROBLEM SOLVING & SCENARIO AGILITY`;
      sampleQuestions = [
        {
          id: `q-${Date.now()}-1`,
          title: "Presents logical, step-by-step troubleshooting steps when given complex case studies.",
          inputType: "Rating",
          ratingScale: "1 to 5",
          weight: 25
        },
        {
          id: `q-${Date.now()}-2`,
          title: "Demonstrates sound decision-making and autonomy without constant escalation.",
          inputType: "Rating",
          ratingScale: "1 to 5",
          weight: 25
        }
      ];
    } else if (presetType === "technical") {
      title = `${formSections.length + 1}. TECHNICAL & ACCOUNT ALIGNMENT`;
      sampleQuestions = [
        {
          id: `q-${Date.now()}-1`,
          title: "Understands foundational software tools, navigation shortcuts, and workflow prerequisites.",
          inputType: "Rating",
          ratingScale: "1 to 5",
          weight: 25
        },
        {
          id: `q-${Date.now()}-2`,
          title: "Passes mandatory compliance, confidentiality, and data privacy criteria.",
          inputType: "Pass/Fail",
          ratingScale: "1 to 5",
          weight: 25
        }
      ];
    } else {
      title = `${formSections.length + 1}. CULTURE FIT & RELIABILITY`;
      sampleQuestions = [
        {
          id: `q-${Date.now()}-1`,
          title: "Aligns with company core values, shift flexibility, and attendance commitment.",
          inputType: "Rating",
          ratingScale: "1 to 5",
          weight: 25
        }
      ];
    }

    const newSection: FormSectionItem = {
      id: `sec-${Date.now()}`,
      title,
      weight: 25,
      isCollapsed: false,
      questions: sampleQuestions
    };

    setFormSections(prev => [...prev, newSection]);
    showToast(`Added preset section: "${title}"`);
  };

  const liveScoredQuestionsCount = useMemo(() => {
    return Object.keys(previewScores).filter(k => previewScores[k] !== undefined && previewScores[k] !== "").length;
  }, [previewScores]);

  const liveCalculatedScore = useMemo(() => {
    const scores = Object.values(previewScores).filter(v => typeof v === "number") as number[];
    if (scores.length === 0) return 85;
    const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
    return Math.round((avg / 5) * 100);
  }, [previewScores]);

  const handleAppendQuickNote = (qId: string, chipText: string) => {
    setPreviewNotes(prev => {
      const existing = prev[qId] || "";
      const updated = existing ? `${existing} | ${chipText}` : chipText;
      return { ...prev, [qId]: updated };
    });
  };

  const selectedPosition = useMemo(() => {
    return positions.find(p => p.id === selectedPosId) || positions[0];
  }, [positions, selectedPosId]);

  const totalSectionWeight = useMemo(() => {
    return formSections.reduce((acc, sec) => acc + (Number(sec.weight) || 0), 0);
  }, [formSections]);

  const handleMoveSection = (index: number, direction: "up" | "down") => {
    const newSections = [...formSections];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newSections.length) return;
    const temp = newSections[index];
    newSections[index] = newSections[targetIndex];
    newSections[targetIndex] = temp;
    setFormSections(newSections);
  };

  const handleMoveQuestion = (sectionId: string, qIndex: number, direction: "up" | "down") => {
    setFormSections(prev =>
      prev.map(s => {
        if (s.id === sectionId) {
          const questions = [...s.questions];
          const targetIndex = direction === "up" ? qIndex - 1 : qIndex + 1;
          if (targetIndex < 0 || targetIndex >= questions.length) return s;
          const temp = questions[qIndex];
          questions[qIndex] = questions[targetIndex];
          questions[targetIndex] = temp;
          return { ...s, questions };
        }
        return s;
      })
    );
  };

  const handleDuplicateQuestion = (sectionId: string, qId: string) => {
    setFormSections(prev =>
      prev.map(s => {
        if (s.id === sectionId) {
          const targetQ = s.questions.find(q => q.id === qId);
          if (!targetQ) return s;
          const duplicatedQ: FormQuestionItem = {
            ...targetQ,
            id: `q-${Date.now()}`,
            title: `${targetQ.title} (Copy)`
          };
          return { ...s, questions: [...s.questions, duplicatedQ] };
        }
        return s;
      })
    );
    showToast("Question field duplicated.");
  };

  const handleExpandAllSections = (expand: boolean) => {
    setFormSections(prev => prev.map(s => ({ ...s, isCollapsed: !expand })));
  };

  const toggleInlinePreview = (qId: string) => {
    setInlinePreviewQuestions(prev => ({ ...prev, [qId]: !prev[qId] }));
  };

  const filteredFormPositions = useMemo(() => {
    return positions.filter(p => {
      const q = posSearch.toLowerCase();
      const matchesSearch =
        p.title.toLowerCase().includes(q) ||
        p.code.toLowerCase().includes(q) ||
        p.department.toLowerCase().includes(q) ||
        p.site.toLowerCase().includes(q) ||
        p.formName.toLowerCase().includes(q);
      const matchesStatus = formStatusFilter === "All" || p.status === formStatusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [positions, posSearch, formStatusFilter]);

  const totalQuestionsCount = useMemo(() => {
    return formSections.reduce((acc, sec) => acc + sec.questions.length, 0);
  }, [formSections]);

  const handleOpenPositionForm = (posId: string) => {
    setSelectedPosId(posId);
    setFormViewMode("edit");
  };

  const handleUpdatePositionFormDetails = (key: keyof PositionFormItem, val: any) => {
    setPositions(prev =>
      prev.map(p => (p.id === selectedPosId ? { ...p, [key]: val } : p))
    );
    showToast(`Form configuration for ${selectedPosition.code} updated.`);
  };

  // Section Operations
  const handleAddSection = () => {
    const newSecNumber = formSections.length + 1;
    const newSection: FormSectionItem = {
      id: `sec-${Date.now()}`,
      title: `${newSecNumber}. NEW EVALUATION CRITERIA SECTION`,
      weight: 20,
      isCollapsed: false,
      questions: [
        {
          id: `q-${Date.now()}-1`,
          title: "Discuss an experience or scenario relevant to this evaluation section...",
          inputType: "Rating",
          ratingScale: "1 to 5",
          weight: 20
        }
      ]
    };
    setFormSections(prev => [...prev, newSection]);
    showToast("Added new evaluation section to form.");
  };

  const handleDeleteSection = (sectionId: string) => {
    if (formSections.length <= 1) {
      showToast("Form must contain at least one evaluation section.");
      return;
    }
    setFormSections(prev => prev.filter(s => s.id !== sectionId));
    showToast("Evaluation section removed.");
  };

  const handleUpdateSection = (sectionId: string, field: keyof FormSectionItem, value: any) => {
    setFormSections(prev =>
      prev.map(s => (s.id === sectionId ? { ...s, [field]: value } : s))
    );
  };

  const handleToggleSectionCollapse = (sectionId: string) => {
    setFormSections(prev =>
      prev.map(s => (s.id === sectionId ? { ...s, isCollapsed: !s.isCollapsed } : s))
    );
  };

  // Question Operations inside Section
  const handleAddQuestionToSection = (sectionId: string) => {
    const newQ: FormQuestionItem = {
      id: `q-${Date.now()}`,
      title: "Enter assessment prompt or evaluation field criteria...",
      inputType: "Rating",
      ratingScale: "1 to 5",
      weight: 10
    };
    setFormSections(prev =>
      prev.map(s => {
        if (s.id === sectionId) {
          return { ...s, questions: [...s.questions, newQ] };
        }
        return s;
      })
    );
    showToast("Added question field to section.");
  };

  const handleUpdateQuestionInSection = (
    sectionId: string,
    questionId: string,
    field: keyof FormQuestionItem,
    value: any
  ) => {
    setFormSections(prev =>
      prev.map(s => {
        if (s.id === sectionId) {
          return {
            ...s,
            questions: s.questions.map(q => (q.id === questionId ? { ...q, [field]: value } : q))
          };
        }
        return s;
      })
    );
  };

  const handleDeleteQuestionFromSection = (sectionId: string, questionId: string) => {
    setFormSections(prev =>
      prev.map(s => {
        if (s.id === sectionId) {
          if (s.questions.length <= 1) {
            showToast("Each section must have at least one question field.");
            return s;
          }
          return {
            ...s,
            questions: s.questions.filter(q => q.id !== questionId)
          };
        }
        return s;
      })
    );
    showToast("Question field removed.");
  };

  // ---------------- TAB 3: PIPELINE STAGES STATE ----------------
  const [pipelineStages, setPipelineStages] = useState<PipelineStage[]>(INITIAL_PIPELINE_STAGES);

  const handleUpdateStageSla = (id: string, days: number) => {
    setPipelineStages(prev =>
      prev.map(stg => (stg.id === id ? { ...stg, slaDays: days } : stg))
    );
    showToast("Stage SLA days updated.");
  };

  const handleToggleAutoReject = (id: string) => {
    setPipelineStages(prev =>
      prev.map(stg => (stg.id === id ? { ...stg, autoReject: !stg.autoReject } : stg))
    );
    showToast("Stage auto-rejection rule updated.");
  };

  // ---------------- TAB 4: ASSESSMENT BENCHMARKS ----------------
  const [benchmarks, setBenchmarks] = useState({
    typingWpm: 40,
    typingAccuracy: 95,
    versantScore: 58,
    techAptitude: 80
  });

  // ---------------- TAB 5: EMAIL TEMPLATES STATE ----------------
  const [templates, setTemplates] = useState<EmailTemplateItem[]>(INITIAL_EMAIL_TEMPLATES);
  const [selectedTmplId, setSelectedTmplId] = useState("TMPL-001");
  const [emailViewMode, setEmailViewMode] = useState<'split' | 'editor' | 'preview'>('split');
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [previewModalTmplId, setPreviewModalTmplId] = useState<string>("TMPL-001");
  const [modalCopiedNotice, setModalCopiedNotice] = useState(false);
  const bodyTextAreaRef = React.useRef<HTMLTextAreaElement>(null);
  const subjectInputRef = React.useRef<HTMLInputElement>(null);
  const [activeTemplateField, setActiveTemplateField] = useState<'body' | 'subject'>('body');
  const [isDraggingOverBody, setIsDraggingOverBody] = useState(false);
  const [isDraggingOverSubject, setIsDraggingOverSubject] = useState(false);

  const DYNAMIC_VARIABLES = [
    "{candidate_name}",
    "{role_title}",
    "{account_name}",
    "{site_location}",
    "{interview_date}",
    "{interview_type}",
    "{interviewer_name}",
    "{deadline_date}",
    "{basic_daily_rate}",
    "{de_minimis_rate}",
    "{total_daily_rate}",
    "{start_date}",
    "{nho_date}",
    "{approver_name}",
    "{response_status}",
    "{assessment_link}"
  ];

  const SAMPLE_REPLACEMENT_DATA: Record<string, string> = {
    "{candidate_name}": "MIGHTY YENA LABUS",
    "{role_title}": "SOFTWARE MANAGEMENT - FULL STACK DEVELOPER",
    "{account_name}": "CD - Connect",
    "{site_location}": "SiBS Contact Center Campus",
    "{interview_date}": "Monday, August 24, 2026 at 1:00 PM",
    "{interview_type}": "Face-to-face",
    "{interviewer_name}": "ALENA MENDOZA BATACAN",
    "{deadline_date}": "Friday, August 14, 2026 at 3:54 PM",
    "{basic_daily_rate}": "PHP 900.00",
    "{de_minimis_rate}": "PHP 300.00",
    "{total_daily_rate}": "PHP 1,200.00",
    "{start_date}": "August 17, 2026",
    "{nho_date}": "Friday, August 14, 2026",
    "{approver_name}": "RAUL JR. AMORA NADELA",
    "{response_status}": "Accepted",
    "{assessment_link}": "https://assessments.thesiblingssolutions.com/v2/test?id=VERSANT-8821"
  };

  const selectedTemplate = useMemo(() => {
    return templates.find(t => t.id === selectedTmplId) || templates[0];
  }, [templates, selectedTmplId]);

  const handleUpdateTemplateField = (field: 'body' | 'subject', val: string) => {
    setTemplates(prev =>
      prev.map(t =>
        t.id === selectedTmplId ? { ...t, [field]: val } : t
      )
    );
  };

  const handleInsertVariable = (variableTag: string, targetField: 'body' | 'subject' = activeTemplateField) => {
    if (targetField === 'body') {
      const el = bodyTextAreaRef.current;
      const currentVal = selectedTemplate.body;
      if (el) {
        const start = el.selectionStart ?? currentVal.length;
        const end = el.selectionEnd ?? currentVal.length;
        const newVal = currentVal.substring(0, start) + variableTag + currentVal.substring(end);
        handleUpdateTemplateField('body', newVal);
        setTimeout(() => {
          el.focus();
          el.setSelectionRange(start + variableTag.length, start + variableTag.length);
        }, 10);
      } else {
        handleUpdateTemplateField('body', currentVal + " " + variableTag);
      }
    } else {
      const el = subjectInputRef.current;
      const currentVal = selectedTemplate.subject;
      if (el) {
        const start = el.selectionStart ?? currentVal.length;
        const end = el.selectionEnd ?? currentVal.length;
        const newVal = currentVal.substring(0, start) + variableTag + currentVal.substring(end);
        handleUpdateTemplateField('subject', newVal);
        setTimeout(() => {
          el.focus();
          el.setSelectionRange(start + variableTag.length, start + variableTag.length);
        }, 10);
      } else {
        handleUpdateTemplateField('subject', currentVal + " " + variableTag);
      }
    }
    showToast(`Inserted ${variableTag} into ${targetField === 'body' ? 'email body' : 'subject line'}`);
  };

  const handleDropVariable = (e: React.DragEvent, targetField: 'body' | 'subject') => {
    e.preventDefault();
    if (targetField === 'body') setIsDraggingOverBody(false);
    if (targetField === 'subject') setIsDraggingOverSubject(false);

    const variableTag = e.dataTransfer.getData("text/plain");
    if (!variableTag) return;

    if (targetField === 'body') {
      const el = bodyTextAreaRef.current;
      const currentVal = selectedTemplate.body;
      if (el) {
        const start = el.selectionStart ?? currentVal.length;
        const end = el.selectionEnd ?? currentVal.length;
        const newVal = currentVal.substring(0, start) + variableTag + currentVal.substring(end);
        handleUpdateTemplateField('body', newVal);
        setTimeout(() => {
          el.focus();
          el.setSelectionRange(start + variableTag.length, start + variableTag.length);
        }, 10);
      } else {
        handleUpdateTemplateField('body', currentVal + " " + variableTag);
      }
    } else {
      const el = subjectInputRef.current;
      const currentVal = selectedTemplate.subject;
      if (el) {
        const start = el.selectionStart ?? currentVal.length;
        const end = el.selectionEnd ?? currentVal.length;
        const newVal = currentVal.substring(0, start) + variableTag + currentVal.substring(end);
        handleUpdateTemplateField('subject', newVal);
        setTimeout(() => {
          el.focus();
          el.setSelectionRange(start + variableTag.length, start + variableTag.length);
        }, 10);
      } else {
        handleUpdateTemplateField('subject', currentVal + " " + variableTag);
      }
    }
    showToast(`Dropped ${variableTag} into ${targetField === 'body' ? 'email body' : 'subject line'}`);
  };

  const handleSaveTemplate = (updatedBody: string, updatedSubject: string) => {
    setTemplates(prev =>
      prev.map(t =>
        t.id === selectedTmplId
          ? { ...t, body: updatedBody, subject: updatedSubject, lastUpdated: "2026-08-12" }
          : t
      )
    );
    showToast(`Email template "${selectedTemplate.title}" saved.`);
  };

  const renderLiveEmailContent = (tmpl: EmailTemplateItem) => {
    let sub = tmpl.subject;
    let body = tmpl.body;

    Object.entries(SAMPLE_REPLACEMENT_DATA).forEach(([k, v]) => {
      sub = sub.replaceAll(k, v);
      body = body.replaceAll(k, v);
    });

    const lines = body.split("\n");
    const blocks: React.ReactNode[] = [];
    let kvGroup: { label: string; val: string }[] = [];

    const flushKvGroup = () => {
      if (kvGroup.length > 0) {
        blocks.push(
          <div key={`kv-${blocks.length}`} className="bg-[#F8FAFC] border border-[#E2E8F0] p-4 rounded-xl my-2.5 font-sans space-y-1.5 shadow-2xs">
            {kvGroup.map((pair, idx) => (
              <div key={idx} className="flex flex-col sm:flex-row sm:items-baseline text-xs gap-1">
                <span className="font-bold text-[#042C51] min-w-[130px] shrink-0">{pair.label}:</span>
                <span className="font-semibold text-slate-800">{pair.val}</span>
              </div>
            ))}
          </div>
        );
        kvGroup = [];
      }
    };

    let inCallout = false;
    let calloutLines: string[] = [];

    const flushCallout = () => {
      if (calloutLines.length > 0) {
        const title = calloutLines[0];
        const rest = calloutLines.slice(1);
        blocks.push(
          <div key={`callout-${blocks.length}`} className="bg-[#F0F5FA] border border-[#D0E2F5] p-4 rounded-xl my-2.5 space-y-1.5">
            <p className="text-xs font-black text-[#042C51]">{title}</p>
            {rest.map((r, i) => (
              <p key={i} className="text-xs text-slate-600 font-normal leading-relaxed">{r}</p>
            ))}
          </div>
        );
        calloutLines = [];
        inCallout = false;
      }
    };

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      if (!line) {
        flushKvGroup();
        flushCallout();
        continue;
      }

      if (
        line.startsWith("Respond to your interview schedule") ||
        line.startsWith("NEW HIRE ORIENTATION SCHEDULE")
      ) {
        flushKvGroup();
        inCallout = true;
        calloutLines.push(line);
        continue;
      }

      if (inCallout) {
        if (line.startsWith("[") && line.endsWith("]")) {
          flushCallout();
        } else {
          calloutLines.push(line);
          continue;
        }
      }

      if (line.includes("[Accept Offer]") && line.includes("[Negotiate Offer]")) {
        flushKvGroup();
        flushCallout();
        blocks.push(
          <div key={`dual-btn-${i}`} className="flex flex-wrap items-center gap-3 my-3.5">
            <button type="button" className="bg-[#15803D] hover:bg-[#166534] text-white font-bold py-2.5 px-5 rounded-xl text-xs shadow-xs transition-all cursor-pointer">
              Accept Offer
            </button>
            <button type="button" className="bg-[#D97706] hover:bg-[#B45309] text-white font-bold py-2.5 px-5 rounded-xl text-xs shadow-xs transition-all cursor-pointer">
              Negotiate Offer
            </button>
          </div>
        );
        continue;
      }

      if (line.startsWith("[") && line.endsWith("]")) {
        flushKvGroup();
        flushCallout();
        const btnLabel = line.slice(1, -1);
        blocks.push(
          <div key={`single-btn-${i}`} className="my-3.5">
            <button type="button" className="bg-[#042C51] hover:bg-[#083D6C] text-white font-bold py-2.5 px-6 rounded-xl text-xs shadow-xs transition-all cursor-pointer inline-flex items-center gap-2">
              <span>{btnLabel}</span>
            </button>
          </div>
        );
        continue;
      }

      const colonIdx = line.indexOf(":");
      const isKv = colonIdx > 0 && colonIdx < 30 && !line.startsWith("http") && !line.startsWith("https") && !line.includes("@") && !line.startsWith("Date and Time");

      if (isKv) {
        const label = line.substring(0, colonIdx).trim();
        const val = line.substring(colonIdx + 1).trim();
        kvGroup.push({ label, val });
        continue;
      } else {
        flushKvGroup();
      }

      if (line.startsWith("Hi ") || line.startsWith("Dear ") || line.startsWith("Congratulations,")) {
        blocks.push(
          <p key={`lead-${i}`} className="text-sm font-black text-[#042C51] my-1.5">
            {line}
          </p>
        );
      } else {
        blocks.push(
          <p key={`p-${i}`} className="text-xs text-slate-700 font-normal leading-relaxed my-1">
            {line}
          </p>
        );
      }
    }

    flushKvGroup();
    flushCallout();

    const isInternal = tmpl.code === "INTV-RESP";

    return (
      <div className="space-y-3">
        {/* EMAIL CLIENT MOCKUP HEADER */}
        <div className="bg-slate-100 p-3 rounded-xl border border-slate-200 text-xs font-sans space-y-1">
          <div className="flex items-center justify-between text-[11px] text-slate-500">
            <span className="font-semibold">From: <strong className="text-slate-800">SiBS HRIS</strong> &lt;poochiimoy02@gmail.com&gt;</span>
            <span className="bg-amber-100 text-amber-800 text-[10px] font-extrabold px-2 py-0.5 rounded border border-amber-300">External</span>
          </div>
          <div className="text-xs font-bold text-[#042C51] flex items-center gap-2 pt-0.5">
            <Mail className="w-3.5 h-3.5 text-[#FF5C28]" />
            <span>Subject: {sub}</span>
          </div>
        </div>

        {/* EMAIL CANVAS */}
        <div className="bg-slate-100 p-3 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="max-w-xl mx-auto bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            {isInternal ? (
              <div className="bg-[#042C51] p-4 text-white">
                <h3 className="text-sm font-black tracking-wide flex items-center gap-2">
                  <Mail className="w-4 h-4 text-[#FF5C28]" /> Candidate Interview Response
                </h3>
              </div>
            ) : (
              <div className="py-6 px-4 text-center bg-white border-b border-slate-100">
                <h1 className="text-3xl font-black tracking-tight text-[#042C51]">SiBS</h1>
                <p className="text-[11px] font-bold tracking-wider text-[#042C51] uppercase mt-0.5">Practice. Purpose. Philosophy.</p>
              </div>
            )}

            <div className="p-5 space-y-2.5 font-sans">
              {blocks}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // ---------------- TAB 6: HOLIDAY CALENDAR STATE ----------------
  const [holidays, setHolidays] = useState<HolidayEntry[]>(INITIAL_HOLIDAYS);
  const [newHolDate, setNewHolDate] = useState("");
  const [newHolName, setNewHolName] = useState("");
  const [newHolType, setNewHolType] = useState("Special Non-Working Holiday");

  const handleAddHoliday = () => {
    if (!newHolDate || !newHolName.trim()) {
      showToast("Please provide both date and holiday name.");
      return;
    }
    const newEntry: HolidayEntry = {
      id: `HOL-${Date.now()}`,
      date: newHolDate,
      name: newHolName,
      type: newHolType,
      status: "Active"
    };
    setHolidays(prev => [...prev, newEntry]);
    setNewHolDate("");
    setNewHolName("");
    showToast(`Holiday "${newHolName}" added to interview calendar.`);
  };

  const handleDeleteHoliday = (id: string) => {
    setHolidays(prev => prev.filter(h => h.id !== id));
    showToast("Holiday removed from active calendar.");
  };

  // ---------------- TAB 7: APPROVAL RULES STATE ----------------
  const [approvalModule, setApprovalModule] = useState<"jd" | "needs" | "positions" | "offers">("jd");
  const [approvalRules, setApprovalRules] = useState(INITIAL_APPROVAL_RULES);
  const [searchEmployeeText, setSearchEmployeeText] = useState("");

  const handleAddApprovalUser = () => {
    if (!searchEmployeeText.trim()) return;
    const newUser: ApprovalUser = {
      id: `AP-${Date.now()}`,
      sibsId: String(Math.floor(1000 + Math.random() * 9000)),
      name: searchEmployeeText.toUpperCase(),
      role: "Authorized Approver",
      permissionText: "Can approve, reject, or tag requests for revision."
    };
    setApprovalRules(prev => ({
      ...prev,
      [approvalModule]: [...prev[approvalModule], newUser]
    }));
    setSearchEmployeeText("");
    showToast("Approval user added successfully.");
  };

  const handleRemoveApprovalUser = (userId: string) => {
    setApprovalRules(prev => ({
      ...prev,
      [approvalModule]: prev[approvalModule].filter(u => u.id !== userId)
    }));
    showToast("Approval user removed.");
  };

  return (
    <div className="space-y-6 pb-12 select-none text-[#101828]">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#042C51] text-white px-5 py-3 rounded-xl shadow-2xl border border-[#FF5C28] flex items-center gap-3 animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-[#FF5C28]" />
          <span className="text-xs font-bold">{toastMessage}</span>
        </div>
      )}      {/* TOP HEADER BANNER */}
      <section className="bg-[#042C51] text-white p-6 sm:p-8 rounded-2xl shadow-lg border border-[#0A3A67] relative overflow-hidden">
        {/* Background Cog Watermark */}
        <div className="absolute -right-10 -bottom-10 opacity-10 pointer-events-none">
          <Cog className="w-80 h-80 text-white" />
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="bg-[#FF5C28] text-white text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full shadow-2xs">
                RECRUITMENT SETUP & GOVERNANCE
              </span>
              <span className="text-slate-300 text-xs font-semibold">• SiBS Solutions Portal</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-3">
              <Settings className="w-7 h-7 text-[#FF5C28]" />
              <span>Recruitment Settings</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-200 max-w-2xl leading-relaxed">
              Configure recruitment forms, final interview scoring rubrics, pipeline SLAs, assessment thresholds, automated email templates, working holiday exclusions, and approval consensus matrices.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => showToast("Recruitment configuration synchronized with database.")}
              className="bg-white/10 hover:bg-white/20 text-white border border-white/20 text-xs font-bold px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 cursor-pointer backdrop-blur-md active:scale-95"
            >
              <RefreshCw className="w-4 h-4 text-[#FF5C28]" />
              <span>Sync Configurations</span>
            </button>
          </div>
        </div>

        {/* SUMMARY METRIC CARDS GRID - HARMONIOUS COMPLEMENTARY PALETTE */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 mt-6 pt-5 border-t border-slate-700/60 relative z-10">
          {/* Card 1: Account Headcounts (Sky / Cyan Blue) */}
          <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-sky-400/30 hover:border-sky-400/60 hover:bg-white/15 transition-all flex flex-col justify-between group shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-black uppercase tracking-wider text-sky-300">Account Headcounts</span>
              <div className="w-8 h-8 rounded-full bg-sky-500/20 border border-sky-400/40 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                <Building2 className="w-4 h-4 text-sky-300" />
              </div>
            </div>
            <div>
              <p className="text-2xl font-black text-white">{headcounts.length} <span className="text-sm font-bold text-sky-200/90">Accounts</span></p>
              <p className="text-[10px] font-bold uppercase tracking-wider text-sky-200/80 mt-1">
                {headcounts.reduce((sum, h) => sum + h.requiredHC, 0).toLocaleString()} Required Headcount
              </p>
            </div>
          </div>

          {/* Card 2: Position Rubrics (Brand Warm Coral / Orange) */}
          <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-[#FF5C28]/35 hover:border-[#FF5C28]/70 hover:bg-white/15 transition-all flex flex-col justify-between group shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-black uppercase tracking-wider text-[#FF8A65]">Position Rubrics</span>
              <div className="w-8 h-8 rounded-full bg-[#FF5C28]/20 border border-[#FF5C28]/40 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                <FileText className="w-4 h-4 text-[#FF8A65]" />
              </div>
            </div>
            <div>
              <p className="text-2xl font-black text-white">{positions.length} <span className="text-sm font-bold text-[#FFCCBC]">Positions</span></p>
              <p className="text-[10px] font-bold uppercase tracking-wider text-[#FF8A65]/90 mt-1">
                Scoring Rubrics Configured
              </p>
            </div>
          </div>

          {/* Card 3: Pipeline & SLAs (Cobalt / Royal Blue) */}
          <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-blue-400/30 hover:border-blue-400/60 hover:bg-white/15 transition-all flex flex-col justify-between group shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-black uppercase tracking-wider text-blue-300">Pipeline & SLAs</span>
              <div className="w-8 h-8 rounded-full bg-blue-500/20 border border-blue-400/40 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                <Sliders className="w-4 h-4 text-blue-300" />
              </div>
            </div>
            <div>
              <p className="text-2xl font-black text-white">{pipelineStages.length} <span className="text-sm font-bold text-blue-200/90">Stages</span></p>
              <p className="text-[10px] font-bold uppercase tracking-wider text-blue-200/80 mt-1">
                Auto-Rejection & SLAs Active
              </p>
            </div>
          </div>

          {/* Card 4: Email Templates (Soft Lavender / Violet) */}
          <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-purple-400/30 hover:border-purple-400/60 hover:bg-white/15 transition-all flex flex-col justify-between group shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-black uppercase tracking-wider text-purple-300">Email Templates</span>
              <div className="w-8 h-8 rounded-full bg-purple-500/20 border border-purple-400/40 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                <Mail className="w-4 h-4 text-purple-300" />
              </div>
            </div>
            <div>
              <p className="text-2xl font-black text-white">{templates.length} <span className="text-sm font-bold text-purple-200/90">Templates</span></p>
              <p className="text-[10px] font-bold uppercase tracking-wider text-purple-200/80 mt-1">
                Automated Candidate Comms
              </p>
            </div>
          </div>

          {/* Card 5: Governance & Rules (Mint / Emerald) */}
          <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-emerald-400/30 hover:border-emerald-400/60 hover:bg-white/15 transition-all flex flex-col justify-between group shadow-sm sm:col-span-2 lg:col-span-1">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-black uppercase tracking-wider text-emerald-300">Governance & Rules</span>
              <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                <ShieldCheck className="w-4 h-4 text-emerald-300" />
              </div>
            </div>
            <div>
              <p className="text-2xl font-black text-white">{holidays.length} <span className="text-sm font-bold text-emerald-200/90">Holidays</span></p>
              <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-200/80 mt-1">
                4 Approval Modules Active
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* NAVIGATION TABS BAR */}
      <div className="bg-white p-2 rounded-2xl border border-slate-200/90 shadow-xs flex items-center gap-1.5 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        <button
          onClick={() => setActiveTab("headcounts")}
          className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeTab === "headcounts"
              ? "bg-[#EBF3FA] text-[#042C51] border border-blue-200/80 shadow-2xs"
              : "text-slate-600 hover:text-[#042C51] hover:bg-slate-50"
          }`}
        >
          <Building2 className={`w-4 h-4 ${activeTab === "headcounts" ? "text-[#FF5C28]" : "text-slate-400"}`} />
          <span>Headcount Allocation & WFM Capacity</span>
        </button>

        <button
          onClick={() => setActiveTab("interview_form")}
          className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeTab === "interview_form"
              ? "bg-[#EBF3FA] text-[#042C51] border border-blue-200/80 shadow-2xs"
              : "text-slate-600 hover:text-[#042C51] hover:bg-slate-50"
          }`}
        >
          <FileCheck2 className={`w-4 h-4 ${activeTab === "interview_form" ? "text-[#FF5C28]" : "text-slate-400"}`} />
          <span>Final Interview Evaluation Rubrics</span>
        </button>

        <button
          onClick={() => setActiveTab("application_questions")}
          className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeTab === "application_questions"
              ? "bg-[#EBF3FA] text-[#042C51] border border-blue-200/80 shadow-2xs"
              : "text-slate-600 hover:text-[#042C51] hover:bg-slate-50"
          }`}
        >
          <FileText className={`w-4 h-4 ${activeTab === "application_questions" ? "text-[#FF5C28]" : "text-slate-400"}`} />
          <span>Application Screening Questionnaires</span>
        </button>

        <button
          onClick={() => setActiveTab("pipeline")}
          className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeTab === "pipeline"
              ? "bg-[#EBF3FA] text-[#042C51] border border-blue-200/80 shadow-2xs"
              : "text-slate-600 hover:text-[#042C51] hover:bg-slate-50"
          }`}
        >
          <Sliders className={`w-4 h-4 ${activeTab === "pipeline" ? "text-[#FF5C28]" : "text-slate-400"}`} />
          <span>Recruitment Pipeline & SLA Workflows</span>
        </button>

        <button
          onClick={() => setActiveTab("assessments")}
          className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeTab === "assessments"
              ? "bg-[#EBF3FA] text-[#042C51] border border-blue-200/80 shadow-2xs"
              : "text-slate-600 hover:text-[#042C51] hover:bg-slate-50"
          }`}
        >
          <ClipboardList className={`w-4 h-4 ${activeTab === "assessments" ? "text-[#FF5C28]" : "text-slate-400"}`} />
          <span>Assessment Benchmarks & Cut-off Standards</span>
        </button>

        <button
          onClick={() => setActiveTab("emails")}
          className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeTab === "emails"
              ? "bg-[#EBF3FA] text-[#042C51] border border-blue-200/80 shadow-2xs"
              : "text-slate-600 hover:text-[#042C51] hover:bg-slate-50"
          }`}
        >
          <Mail className={`w-4 h-4 ${activeTab === "emails" ? "text-[#FF5C28]" : "text-slate-400"}`} />
          <span>Automated Notification & Dispatch Templates</span>
        </button>

        <button
          onClick={() => setActiveTab("holidays")}
          className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeTab === "holidays"
              ? "bg-[#EBF3FA] text-[#042C51] border border-blue-200/80 shadow-2xs"
              : "text-slate-600 hover:text-[#042C51] hover:bg-slate-50"
          }`}
        >
          <Calendar className={`w-4 h-4 ${activeTab === "holidays" ? "text-[#FF5C28]" : "text-slate-400"}`} />
          <span>Statutory & Site Holiday Calendars</span>
        </button>

        <button
          onClick={() => setActiveTab("approvals")}
          className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeTab === "approvals"
              ? "bg-[#EBF3FA] text-[#042C51] border border-blue-200/80 shadow-2xs"
              : "text-slate-600 hover:text-[#042C51] hover:bg-slate-50"
          }`}
        >
          <ShieldCheck className={`w-4 h-4 ${activeTab === "approvals" ? "text-[#FF5C28]" : "text-slate-400"}`} />
          <span>Multi-Tier Approval Matrix & Governance</span>
        </button>
      </div>

      {/* TAB CONTENT AREAS */}

      {/* ================= TAB 1: UPDATE HEADCOUNTS ================= */}
      {activeTab === "headcounts" && (
        <div className="bg-white p-6 rounded-2xl border border-[#E6ECF2] shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <span className="text-[10px] bg-blue-50 text-[#042C51] font-extrabold px-2.5 py-1 rounded-md border border-blue-200 uppercase tracking-wider inline-block mb-1">
                ACCOUNT HEADCOUNT
              </span>
              <h2 className="text-xl font-black text-[#042C51]">Update Headcounts</h2>
              <p className="text-xs text-slate-500 font-medium">
                Review and update account-level required headcount for WFM capacity alignment.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="bg-[#042C51]/5 text-[#042C51] text-xs font-bold px-3 py-1.5 rounded-xl border border-slate-200">
                {filteredHeadcounts.length} Accounts Listed
              </span>
            </div>
          </div>

          {/* FILTERS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {/* Search */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Search account, cluster, status..."
                value={hcSearch}
                onChange={e => setHcSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-[#042C51] focus:outline-none focus:bg-white focus:border-[#042C51]"
              />
            </div>

            {/* Weekly Version */}
            <div>
              <select className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-[#042C51] focus:outline-none">
                <option>2026 Week 32 — Aug 3 - Aug 9, 2026</option>
                <option>2026 Week 33 — Aug 10 - Aug 16, 2026</option>
                <option>2026 Week 34 — Aug 17 - Aug 23, 2026</option>
              </select>
            </div>

            {/* Cluster */}
            <div>
              <select
                value={hcClusterFilter}
                onChange={e => setHcClusterFilter(e.target.value)}
                className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-[#042C51] focus:outline-none"
              >
                <option value="All Clusters">All Clusters</option>
                <option value="Telecom & Tech">Telecom & Tech</option>
                <option value="Financial Services">Financial Services</option>
                <option value="Healthcare & Compliance">Healthcare & Compliance</option>
                <option value="Corporate & Executive">Corporate & Executive</option>
              </select>
            </div>

            {/* Status */}
            <div>
              <select
                value={hcStatusFilter}
                onChange={e => setHcStatusFilter(e.target.value)}
                className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-[#042C51] focus:outline-none"
              >
                <option value="All Status">All Status</option>
                <option value="Kronos Sync">Kronos Sync</option>
                <option value="Manual Override">Manual Override</option>
                <option value="Approved Ramp">Approved Ramp</option>
              </select>
            </div>

            {/* Clear */}
            <button
              onClick={() => {
                setHcSearch("");
                setHcClusterFilter("All Clusters");
                setHcStatusFilter("All Status");
              }}
              className="py-2 px-3 bg-slate-100 hover:bg-slate-200 text-[#042C51] text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer border border-slate-200"
            >
              <X className="w-3.5 h-3.5" /> Clear Filters
            </button>
          </div>

          {/* TABLE */}
          <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#F8FAFC] border-b border-slate-200 text-[11px] font-black uppercase text-[#042C51] tracking-wider">
                    <th className="p-3.5">Account</th>
                    <th className="p-3.5">Required / Actual HC</th>
                    <th className="p-3.5">Buffer</th>
                    <th className="p-3.5">Averages</th>
                    <th className="p-3.5 text-center">Ops Performance</th>
                    <th className="p-3.5">HC Needs / Leads</th>
                    <th className="p-3.5 text-center">Hiring Rate</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5">Status Note</th>
                    <th className="p-3.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 font-medium text-[#101828]">
                  {filteredHeadcounts.map(item => (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition-all">
                      {/* Account */}
                      <td className="p-3.5">
                        <p className="font-bold text-[#042C51]">{item.account}</p>
                        <p className="text-[10px] text-slate-500 font-semibold">{item.subCategory} • {item.cluster}</p>
                      </td>

                      {/* Required / Actual */}
                      <td className="p-3.5">
                        <div className="flex items-center gap-2">
                          <div>
                            <span className="text-[10px] font-bold text-slate-400 block uppercase">REQUIRED</span>
                            <input
                              type="number"
                              value={item.requiredHC}
                              onChange={e => handleUpdateRequiredHC(item.id, Number(e.target.value))}
                              className="w-16 px-2 py-1 bg-slate-50 border border-slate-300 rounded-lg text-xs font-extrabold text-[#042C51] text-center focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#042C51]"
                            />
                          </div>
                          <div>
                            <span className="text-[10px] font-bold text-slate-400 block uppercase">ACTUAL</span>
                            <span className="font-extrabold text-[#042C51] text-xs px-2 py-1 bg-slate-100 rounded-lg block text-center min-w-[3rem]">
                              {item.actualHC}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Buffer */}
                      <td className="p-3.5">
                        <p className="font-bold text-slate-800">Req. Buffer: {item.reqBuffer}</p>
                        <p className={`text-[10px] font-bold ${item.actualHC - item.requiredHC >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
                          Actual Buffer: {item.actualHC - item.requiredHC} ({(((item.actualHC - item.requiredHC) / item.requiredHC) * 100).toFixed(1)}%)
                        </p>
                      </td>

                      {/* Averages */}
                      <td className="p-3.5">
                        <p className="text-[11px] text-slate-700 font-medium">Absenteeism: <strong className="font-bold text-[#042C51]">{item.absenteeism}</strong></p>
                        <p className="text-[11px] text-slate-700 font-medium">Attrition: <strong className="font-bold text-[#042C51]">{item.attrition}</strong></p>
                      </td>

                      {/* Ops Performance */}
                      <td className="p-3.5 text-center">
                        <span className={`px-2.5 py-1 rounded-full text-[11px] font-black ${
                          item.opsPerformance >= 90 ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                        }`}>
                          {item.opsPerformance}%
                        </span>
                      </td>

                      {/* HC Needs / Leads */}
                      <td className="p-3.5">
                        <p className={`font-black ${item.needsHC > 0 ? "text-purple-700" : "text-slate-600"}`}>
                          Needs: {item.needsHC}
                        </p>
                        <p className="text-[10px] text-slate-500 font-semibold">Leads: {item.leadsHC}</p>
                      </td>

                      {/* Hiring Rate */}
                      <td className="p-3.5 text-center font-bold text-[#042C51]">
                        {item.hiringRate.toFixed(2)}%
                      </td>

                      {/* Status */}
                      <td className="p-3.5">
                        <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border ${
                          item.status === "Kronos Sync"
                            ? "bg-slate-100 text-slate-700 border-slate-300"
                            : item.status === "Approved Ramp"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : "bg-amber-50 text-amber-700 border-amber-200"
                        }`}>
                          {item.status}
                        </span>
                      </td>

                      {/* Status Note */}
                      <td className="p-3.5 text-[11px] text-slate-600 max-w-xs">
                        {item.statusNote}
                      </td>

                      {/* Action */}
                      <td className="p-3.5 text-right">
                        <button
                          onClick={() => showToast(`Saved changes for ${item.account}.`)}
                          className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-300 px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ml-auto cursor-pointer"
                        >
                          <Save className="w-3.5 h-3.5" /> Save
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

      {/* ================= TAB 2: FINAL INTERVIEW FORM ================= */}
      {activeTab === "interview_form" && (
        <div className="bg-white p-6 rounded-2xl border border-[#E6ECF2] shadow-xs space-y-6">
          {/* HEADER SECTION WITH BREADCRUMBS & TOP CONTROLS */}
          <div className="space-y-4">
            {/* Screen Stage Breadcrumbs (Image 2) */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                {formViewMode === "edit" && (
                  <>
                    <button
                      onClick={() => setFormViewMode("table")}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 text-[#042C51] text-xs font-bold transition-all cursor-pointer border border-slate-200 shadow-2xs group mr-1"
                    >
                      <ArrowLeft className="w-3.5 h-3.5 text-[#FF5C28] group-hover:-translate-x-0.5 transition-transform" />
                      <span>Back to Forms</span>
                    </button>
                    <span className="text-[11px] text-slate-300">|</span>
                  </>
                )}
                <span className="text-[11px] font-bold text-slate-400">Settings</span>
                <span className="text-[11px] text-slate-300">/</span>
                <span 
                  onClick={() => setFormViewMode("table")}
                  className={`text-[11px] font-bold ${formViewMode === "edit" ? "text-slate-500 hover:text-[#042C51] cursor-pointer" : "text-slate-700 font-extrabold"}`}
                >
                  Position-based Final Interview Forms
                </span>
                {formViewMode === "edit" && (
                  <>
                    <span className="text-[11px] text-slate-300">/</span>
                    <span className="text-[11px] font-black text-[#042C51] bg-blue-50 px-2.5 py-0.5 rounded-lg border border-blue-100 shadow-2xs">
                      {selectedPosition.title}
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* TABLE VIEW HEADER */}
            {formViewMode === "table" && (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                <div>
                  <h2 className="text-xl font-black text-[#042C51]">Position-based Final Interview Forms</h2>
                  <p className="text-xs text-slate-500 font-medium">
                    Manage position interview forms, scoring rubrics, passing thresholds, and custom question fields.
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={handleOpenCreatePositionModal}
                    className="bg-[#FF5C28] hover:bg-[#e04f20] text-white text-xs font-black px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                    title="Create a new position-based final interview form"
                  >
                    <Plus className="w-4 h-4" /> Add / Create Position Form
                  </button>

                  <span className="bg-blue-50 text-blue-800 text-xs font-bold px-3 py-1.5 rounded-xl border border-blue-200">
                    {positions.length} configured forms
                  </span>

                  <button
                    onClick={() => showToast("Question rubrics reloaded from server.")}
                    className="p-2 text-slate-600 hover:text-[#042C51] bg-slate-100 hover:bg-slate-200 rounded-xl cursor-pointer transition-colors"
                    title="Refresh"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* EDITOR VIEW HEADER */}
            {formViewMode === "edit" && (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
                {/* Left: Badges, Big Title & Subtitle */}
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200 text-[10px] font-black uppercase text-slate-700 tracking-wider">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#FF5C28] animate-pulse" />
                      FINAL INTERVIEW FORM EDITOR
                    </span>
                    <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-orange-50/80 border border-orange-200 text-[11px] font-black text-[#FF5C28]">
                      {selectedPosition.code}
                    </span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-black text-[#042C51] tracking-tight uppercase">
                    {selectedPosition.title}
                  </h2>
                  <p className="text-xs text-slate-500 font-medium">
                    Configure this position's final interview form, scoring threshold, sections, and criteria fields.
                  </p>
                </div>

                {/* Right: Clean, Flat Action Button Group */}
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => showToast("Form reloaded from template.")}
                    className="p-2.5 bg-white hover:bg-slate-50 text-slate-600 hover:text-[#042C51] border border-slate-200 rounded-xl cursor-pointer transition-colors shadow-2xs"
                    title="Reload Form"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => setIsLivePreviewModalOpen(true)}
                    className="bg-white hover:bg-slate-50 text-[#042C51] border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-2xs hover:border-slate-300"
                  >
                    <Eye className="w-4 h-4 text-[#FF5C28]" />
                    <span>Test Live Evaluation</span>
                  </button>

                  <button
                    onClick={() => showToast(`Saved all form sections for ${selectedPosition.title}`)}
                    className="bg-[#042C51] hover:bg-[#073A6B] text-white rounded-xl px-5 py-2.5 text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-2xs"
                  >
                    <Save className="w-4 h-4 text-[#FF5C28]" />
                    <span>Save Form</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* VIEW 1: TABLE BASED VIEW */}
          {formViewMode === "table" && (
            <div className="space-y-4">
              {/* Table Search & Status Filter Controls */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80">
                <div className="relative flex-1 max-w-md">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    placeholder="Search forms by role title, position code, department..."
                    value={posSearch}
                    onChange={e => setPosSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-[#042C51] focus:outline-none focus:border-[#042C51] focus:ring-1 focus:ring-[#042C51]"
                  />
                </div>

                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                  <span className="text-[11px] font-bold text-slate-500 mr-1">Status:</span>
                  {["All", "Active", "Inactive", "Draft"].map(st => (
                    <button
                      key={st}
                      onClick={() => setFormStatusFilter(st)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        formStatusFilter === st
                          ? "bg-[#042C51] text-white shadow-xs"
                          : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                  <button
                    onClick={handleOpenCreatePositionModal}
                    className="ml-2 bg-[#042C51] hover:bg-[#063a6b] text-white px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shrink-0 shadow-2xs"
                  >
                    <Plus className="w-3.5 h-3.5 text-[#FF5C28]" /> New Form
                  </button>
                </div>
              </div>

              {/* Position Forms Table */}
              <div className="overflow-x-auto rounded-2xl border border-slate-200/90 shadow-xs bg-white">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#042C51] text-white text-[11px] uppercase font-black tracking-wider border-b border-[#063a6b]">
                      <th className="p-3.5 pl-4">Position Title & Code</th>
                      <th className="p-3.5">Department & Site</th>
                      <th className="p-3.5">Form Name</th>
                      <th className="p-3.5">Passing Score</th>
                      <th className="p-3.5">Criteria</th>
                      <th className="p-3.5">Status</th>
                      <th className="p-3.5 text-right pr-4">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    {filteredFormPositions.map((p) => (
                      <tr
                        key={p.id}
                        onClick={() => handleOpenPositionForm(p.id)}
                        className="hover:bg-blue-50/50 transition-colors cursor-pointer group"
                      >
                        <td className="p-3.5 pl-4 font-bold text-[#042C51]">
                          <div className="flex items-center gap-2.5">
                            <span className="w-2 h-2 rounded-full bg-[#FF5C28] shrink-0" />
                            <div>
                              <p className="font-extrabold text-[#042C51] group-hover:text-blue-700 transition-colors">
                                {p.title}
                              </p>
                              <p className="text-[10px] text-slate-400 font-bold">{p.code}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-3.5">
                          <p className="font-bold text-slate-800">{p.department}</p>
                          <span className="text-[10px] text-slate-500 font-semibold">{p.site}</span>
                        </td>
                        <td className="p-3.5 text-slate-700 font-medium max-w-[240px] truncate">
                          {p.formName}
                        </td>
                        <td className="p-3.5">
                          <span className="bg-blue-50 text-blue-800 border border-blue-200 font-extrabold text-[11px] px-2.5 py-1 rounded-lg inline-block">
                            {p.passingScore}%
                          </span>
                        </td>
                        <td className="p-3.5">
                          <span className="bg-slate-100 text-slate-700 font-bold text-[11px] px-2.5 py-1 rounded-lg inline-block">
                            {p.id === selectedPosId ? totalQuestionsCount : (p.questionsCount || 7)} Fields
                          </span>
                        </td>
                        <td className="p-3.5">
                          <span className={`text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wide inline-block ${
                            p.status === "Active" ? "bg-emerald-100 text-emerald-800 border border-emerald-200" :
                            p.status === "Draft" ? "bg-amber-100 text-amber-800 border border-amber-200" :
                            "bg-slate-100 text-slate-600 border border-slate-200"
                          }`}>
                            {p.status}
                          </span>
                        </td>
                        <td className="p-3.5 text-right pr-4" onClick={e => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleOpenPositionForm(p.id)}
                              className="bg-[#042C51] hover:bg-[#073A6B] text-white text-xs font-bold px-3 py-1.5 rounded-xl transition-all shadow-2xs flex items-center gap-1 cursor-pointer"
                            >
                              <Edit3 className="w-3.5 h-3.5 text-[#FF5C28]" /> Edit Form
                            </button>
                            <button
                              onClick={() => {
                                setSelectedPosId(p.id);
                                showToast(`Previewing live form for ${p.title}`);
                              }}
                              className="p-1.5 text-slate-500 hover:text-[#042C51] hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                              title="View Form Preview"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {filteredFormPositions.length === 0 && (
                      <tr>
                        <td colSpan={7} className="p-8 text-center text-slate-400 font-medium">
                          No final interview forms match your search query.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* VIEW 2: EDITABLE FORM VIEW (NEWBIE-FRIENDLY WIZARD MODE) */}
          {formViewMode === "edit" && (
            <div className="space-y-6">
              {/* POSITION FORM SUMMARY CARD (Matches Image 1) */}
              <div className="bg-slate-50/70 border border-slate-200/90 rounded-2xl p-5 space-y-3 shadow-2xs">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-[11px] font-black uppercase text-slate-600 tracking-wider">
                      Position Form Summary
                    </h4>
                    <p className="text-xs text-slate-400 font-medium">
                      Review the selected position before editing its interview form.
                    </p>
                  </div>
                  <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full border uppercase tracking-wider ${
                    selectedPosition.status === "Active"
                      ? "bg-emerald-50 text-emerald-600 border-emerald-200"
                      : "bg-amber-50 text-amber-700 border-amber-200"
                  }`}>
                    {selectedPosition.status || "ACTIVE"}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
                  {/* Tile 1: Position Title */}
                  <div className="bg-white border border-slate-200/80 rounded-xl p-3.5 shadow-2xs flex flex-col justify-between">
                    <span className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">
                      Position Title
                    </span>
                    <div className="mt-1">
                      <p className="text-xs font-black text-[#042C51] line-clamp-1">
                        {selectedPosition.title}
                      </p>
                      <span className="text-[11px] font-bold text-[#FF5C28]">
                        {selectedPosition.code}
                      </span>
                    </div>
                  </div>

                  {/* Tile 2: Department / Site */}
                  <div className="bg-white border border-slate-200/80 rounded-xl p-3.5 shadow-2xs flex flex-col justify-between">
                    <span className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">
                      Department / Site
                    </span>
                    <div className="mt-1">
                      <p className="text-xs font-bold text-[#042C51]">
                        {selectedPosition.department}
                      </p>
                      <span className="text-[11px] font-medium text-slate-500">
                        {selectedPosition.site}
                      </span>
                    </div>
                  </div>

                  {/* Tile 3: Passing Score */}
                  <div className="bg-white border border-slate-200/80 rounded-xl p-3.5 shadow-2xs flex flex-col justify-between">
                    <span className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">
                      Passing Score
                    </span>
                    <div className="mt-1">
                      <p className="text-xl font-black text-[#FF5C28]">
                        {selectedPosition.passingScore}%
                      </p>
                    </div>
                  </div>

                  {/* Tile 4: Criteria Fields */}
                  <div className="bg-white border border-slate-200/80 rounded-xl p-3.5 shadow-2xs flex flex-col justify-between">
                    <span className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">
                      Criteria Fields
                    </span>
                    <div className="mt-1">
                      <p className="text-xl font-black text-[#042C51]">
                        {totalQuestionsCount}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* UNIFIED SINGLE-PAGE FORM BUILDER */}
              <div className="space-y-6">
                {/* SECTION 1: BASIC DETAILS CARD */}
                <div className="bg-white p-5 rounded-2xl border-2 border-slate-200/90 shadow-2xs space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div>
                      <h3 className="text-sm font-black text-[#042C51]">Form Basic Information & Passing Threshold</h3>
                      <p className="text-xs text-slate-500 font-medium">Configure primary form details and candidate passing score</p>
                    </div>
                    <span className="text-xs text-slate-400 font-medium bg-slate-100 px-2.5 py-1 rounded-lg">Position Code: {selectedPosition.code}</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                    <div className="sm:col-span-2">
                      <label className="text-xs font-extrabold text-[#042C51] block mb-1">
                        Form Name <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={selectedPosition.formName}
                        onChange={e => handleUpdatePositionFormDetails("formName", e.target.value)}
                        placeholder="e.g. CSR Final Interview Evaluation Form"
                        className="w-full px-3.5 py-2.5 bg-slate-50 focus:bg-white border border-slate-200 rounded-xl text-xs font-bold text-[#042C51] focus:outline-none focus:border-[#042C51]"
                      />
                      <p className="text-[11px] text-slate-500 mt-1">Name displayed to interviewers during live evaluation.</p>
                    </div>

                    <div>
                      <label className="text-xs font-extrabold text-[#042C51] block mb-1">Form Status</label>
                      <select
                        value={selectedPosition.status}
                        onChange={e => handleUpdatePositionFormDetails("status", e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-slate-50 focus:bg-white border border-slate-200 rounded-xl text-xs font-bold text-[#042C51] focus:outline-none focus:border-[#042C51]"
                      >
                        <option value="Active">Active (Ready for Hiring)</option>
                        <option value="Draft">Draft (In Setup)</option>
                        <option value="Inactive">Inactive (Disabled)</option>
                      </select>
                      <p className="text-[11px] text-slate-500 mt-1">Only "Active" forms appear to interviewers.</p>
                    </div>

                    <div>
                      <label className="text-xs font-extrabold text-[#042C51] block mb-1">
                        Passing Score (%) <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="number"
                        min={50}
                        max={100}
                        value={selectedPosition.passingScore}
                        onChange={e => handleUpdatePositionFormDetails("passingScore", Number(e.target.value))}
                        className="w-full px-3.5 py-2.5 bg-slate-50 focus:bg-white border border-slate-200 rounded-xl text-xs font-extrabold text-[#042C51] focus:outline-none focus:border-[#042C51]"
                      />
                      <p className="text-[11px] text-slate-500 mt-1">Minimum score candidate needs to pass.</p>
                    </div>

                    <div className="sm:col-span-4">
                      <label className="text-xs font-extrabold text-[#042C51] block mb-1">Description / Evaluation Directive</label>
                      <input
                        type="text"
                        value={selectedPosition.description}
                        onChange={e => handleUpdatePositionFormDetails("description", e.target.value)}
                        placeholder="e.g. Focus on candidate's empathy, phone voice clarity, and escalation scenario responses."
                        className="w-full px-3.5 py-2.5 bg-slate-50 focus:bg-white border border-slate-200 rounded-xl text-xs font-medium text-[#042C51] focus:outline-none focus:border-[#042C51]"
                      />
                      <p className="text-[11px] text-slate-500 mt-1">Instructions visible at the top of the interview form.</p>
                    </div>
                  </div>
                </div>

                {/* SECTION 2: EVALUATION SECTIONS & RUBRIC CRITERIA */}
                <div className="space-y-4">
                  <div className="bg-white p-4 rounded-2xl border-2 border-slate-200/90 shadow-2xs space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                      <div>
                        <h3 className="text-sm font-black text-[#042C51]">Evaluation Sections & Rubric Criteria</h3>
                        <p className="text-xs text-slate-500 font-medium">
                          {formSections.length} Competency Sections • {totalQuestionsCount} Evaluation Criteria Fields
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          onClick={() => handleExpandAllSections(true)}
                          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all cursor-pointer"
                        >
                          Expand All
                        </button>
                        <button
                          onClick={() => handleExpandAllSections(false)}
                          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all cursor-pointer"
                        >
                          Collapse All
                        </button>
                        <button
                          onClick={handleAddSection}
                          className="bg-[#FF5C28] hover:bg-[#e04f20] text-white text-xs font-bold px-3.5 py-1.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                        >
                          <Plus className="w-3.5 h-3.5" /> Add Blank Section
                        </button>
                        <button
                          onClick={() => setIsLivePreviewModalOpen(true)}
                          className="bg-[#042C51] hover:bg-[#073A6B] text-white text-xs font-bold px-3.5 py-1.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
                        >
                          <Eye className="w-3.5 h-3.5 text-[#FF5C28]" /> Test Live Form
                        </button>
                      </div>
                    </div>

                    {/* 1-CLICK PRESET BUTTONS FOR COMPETENCIES */}
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-extrabold text-[#042C51] flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-[#FF5C28]" />
                          Need help structuring your form? Click a Pre-Configured Competency Module Preset:
                        </span>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        <button
                          onClick={() => handleAddPresetSection("communication")}
                          className="p-2.5 bg-white hover:bg-blue-50/80 border border-slate-200 hover:border-blue-300 rounded-xl text-left transition-all cursor-pointer group shadow-2xs"
                        >
                          <p className="text-xs font-bold text-[#042C51] group-hover:text-blue-700 flex items-center gap-1">
                            <Plus className="w-3.5 h-3.5 text-[#FF5C28]" /> Add Communication Competency
                          </p>
                          <p className="text-[10px] text-slate-400 font-medium mt-0.5">Grammar, tone & active listening</p>
                        </button>

                        <button
                          onClick={() => handleAddPresetSection("problem_solving")}
                          className="p-2.5 bg-white hover:bg-blue-50/80 border border-slate-200 hover:border-blue-300 rounded-xl text-left transition-all cursor-pointer group shadow-2xs"
                        >
                          <p className="text-xs font-bold text-[#042C51] group-hover:text-blue-700 flex items-center gap-1">
                            <Plus className="w-3.5 h-3.5 text-[#FF5C28]" /> Add Problem Solving Competency
                          </p>
                          <p className="text-[10px] text-slate-400 font-medium mt-0.5">Scenario handling & reasoning</p>
                        </button>

                        <button
                          onClick={() => handleAddPresetSection("technical")}
                          className="p-2.5 bg-white hover:bg-blue-50/80 border border-slate-200 hover:border-blue-300 rounded-xl text-left transition-all cursor-pointer group shadow-2xs"
                        >
                          <p className="text-xs font-bold text-[#042C51] group-hover:text-blue-700 flex items-center gap-1">
                            <Plus className="w-3.5 h-3.5 text-[#FF5C28]" /> Add Technical Proficiency Competency
                          </p>
                          <p className="text-[10px] text-slate-400 font-medium mt-0.5">CRM knowledge & Pass/Fail rules</p>
                        </button>

                        <button
                          onClick={() => handleAddPresetSection("culture")}
                          className="p-2.5 bg-white hover:bg-blue-50/80 border border-slate-200 hover:border-blue-300 rounded-xl text-left transition-all cursor-pointer group shadow-2xs"
                        >
                          <p className="text-xs font-bold text-[#042C51] group-hover:text-blue-700 flex items-center gap-1">
                            <Plus className="w-3.5 h-3.5 text-[#FF5C28]" /> Add Cultural Fit & Attendance Competency
                          </p>
                          <p className="text-[10px] text-slate-400 font-medium mt-0.5">Shift flexibility & values fit</p>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* LIST OF SECTIONS & CRITERIA FIELDS */}
                  <div className="space-y-5">
                    {formSections.map((sec, secIdx) => (
                      <div
                        key={sec.id}
                        className="bg-white rounded-2xl border-2 border-slate-200/90 shadow-2xs overflow-hidden transition-all hover:border-slate-300"
                      >
                        {/* SECTION HEADER */}
                        <div className="bg-[#042C51] text-white p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="flex items-center gap-3 flex-1">
                            <span className="w-7 h-7 rounded-lg bg-[#FF5C28] text-white text-xs font-black flex items-center justify-center shrink-0 shadow-xs">
                              S{secIdx + 1}
                            </span>
                            <input
                              type="text"
                              value={sec.title}
                              onChange={e => handleUpdateSection(sec.id, "title", e.target.value)}
                              className="bg-white/10 hover:bg-white/15 focus:bg-white focus:text-[#042C51] text-white font-extrabold text-xs sm:text-sm px-3 py-1.5 rounded-xl w-full max-w-lg border border-white/20 focus:outline-none transition-all"
                              placeholder="Enter Section Title (e.g. INDEPENDENCE & INITIATIVE)"
                            />
                          </div>

                          <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0">
                            {/* Section Reordering Controls */}
                            <div className="flex items-center bg-white/10 rounded-xl border border-white/15 p-0.5">
                              <button
                                onClick={() => handleMoveSection(secIdx, "up")}
                                disabled={secIdx === 0}
                                className="p-1 text-white disabled:opacity-30 hover:bg-white/20 rounded-lg transition-colors cursor-pointer"
                                title="Move section up"
                              >
                                <ChevronUp className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleMoveSection(secIdx, "down")}
                                disabled={secIdx === formSections.length - 1}
                                className="p-1 text-white disabled:opacity-30 hover:bg-white/20 rounded-lg transition-colors cursor-pointer"
                                title="Move section down"
                              >
                                <ChevronDown className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            {/* Add Question Button */}
                            <button
                              onClick={() => handleAddQuestionToSection(sec.id)}
                              className="bg-[#FF5C28] hover:bg-[#e04f20] text-white text-xs font-bold px-3 py-1.5 rounded-xl transition-all flex items-center gap-1 cursor-pointer shadow-2xs"
                              title="Add question to section"
                            >
                              <Plus className="w-3.5 h-3.5" /> Create Evaluation Criterion
                            </button>

                            {/* Collapse Toggle */}
                            <button
                              onClick={() => handleToggleSectionCollapse(sec.id)}
                              className="p-1.5 bg-white/10 hover:bg-white/20 rounded-xl transition-colors text-white cursor-pointer"
                              title={sec.isCollapsed ? "Expand section" : "Collapse section"}
                            >
                              {sec.isCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
                            </button>

                            {/* Delete Section */}
                            <button
                              onClick={() => handleDeleteSection(sec.id)}
                              className="p-1.5 bg-rose-500/20 hover:bg-rose-600/40 text-rose-200 rounded-xl transition-colors cursor-pointer"
                              title="Delete section"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        {/* SECTION BODY: CLEAN FIELD EDITOR CARDS */}
                        {!sec.isCollapsed && (
                          <div className="p-4 sm:p-5 bg-slate-50/70 space-y-3.5">
                            {sec.questions.length === 0 ? (
                              <div className="bg-white p-6 rounded-xl border border-dashed border-slate-300 text-center space-y-2">
                                <p className="text-xs font-bold text-slate-500">No criteria fields in this section yet.</p>
                                <button
                                  onClick={() => handleAddQuestionToSection(sec.id)}
                                  className="bg-[#042C51] text-white text-xs font-bold px-3.5 py-1.5 rounded-xl inline-flex items-center gap-1 cursor-pointer"
                                >
                                  <Plus className="w-3.5 h-3.5 text-[#FF5C28]" /> Create Initial Evaluation Criterion
                                </button>
                              </div>
                            ) : (
                              <div className="space-y-3.5">
                                {sec.questions.map((q, qIdx) => (
                                  <div
                                    key={q.id}
                                    className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs space-y-3 hover:border-slate-300 transition-all"
                                  >
                                    {/* FIELD HEADER & CONTROLS */}
                                    <div className="flex flex-wrap items-center justify-between gap-2.5 pb-2 border-b border-slate-100">
                                      <div className="flex items-center gap-2">
                                        <span className="w-5 h-5 rounded-full bg-[#042C51] text-white text-[10px] font-black flex items-center justify-center shrink-0">
                                          {qIdx + 1}
                                        </span>
                                        <span className="text-xs font-black text-[#042C51]">Evaluation Criterion #{qIdx + 1}</span>

                                        {/* Question Reordering */}
                                        <div className="flex items-center bg-slate-100 rounded-lg p-0.5 border border-slate-200">
                                          <button
                                            onClick={() => handleMoveQuestion(sec.id, qIdx, "up")}
                                            disabled={qIdx === 0}
                                            className="p-0.5 text-slate-600 disabled:opacity-30 hover:bg-white rounded transition-colors cursor-pointer"
                                            title="Move up"
                                          >
                                            <ChevronUp className="w-3.5 h-3.5" />
                                          </button>
                                          <button
                                            onClick={() => handleMoveQuestion(sec.id, qIdx, "down")}
                                            disabled={qIdx === sec.questions.length - 1}
                                            className="p-0.5 text-slate-600 disabled:opacity-30 hover:bg-white rounded transition-colors cursor-pointer"
                                            title="Move down"
                                          >
                                            <ChevronDown className="w-3.5 h-3.5" />
                                          </button>
                                        </div>
                                      </div>

                                      <div className="flex flex-wrap items-center gap-2">
                                        {/* INPUT TYPE SELECTOR */}
                                        <div className="flex items-center gap-1">
                                          <span className="text-[10px] font-bold text-slate-400">Type:</span>
                                          <select
                                            value={q.inputType}
                                            onChange={e => handleUpdateQuestionInSection(sec.id, q.id, "inputType", e.target.value)}
                                            className="px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-[#042C51] focus:outline-none"
                                          >
                                            <option value="Rating">Rating Scale (1-5)</option>
                                            <option value="Text">Text Feedback</option>
                                            <option value="Single Choice">Single Choice</option>
                                            <option value="Multiple Choice">Multiple Choice</option>
                                            <option value="Pass/Fail">Pass / Fail Check</option>
                                          </select>
                                        </div>

                                        {/* RATING SCALE SELECTOR */}
                                        {q.inputType === "Rating" && (
                                          <div className="flex items-center gap-1">
                                            <span className="text-[10px] font-bold text-slate-400">Scale:</span>
                                            <select
                                              value={q.ratingScale}
                                              onChange={e => handleUpdateQuestionInSection(sec.id, q.id, "ratingScale", e.target.value)}
                                              className="px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-[#042C51] focus:outline-none"
                                            >
                                              <option value="1 to 5">1 to 5 Scale</option>
                                              <option value="1 to 10">1 to 10 Scale</option>
                                              <option value="1 to 4">1 to 4 Scale</option>
                                              <option value="Satisfactory/Unsatisfactory">Satisfactory / Unsatisfactory</option>
                                            </select>
                                          </div>
                                        )}

                                        {/* DUPLICATE FIELD */}
                                        <button
                                          onClick={() => handleDuplicateQuestion(sec.id, q.id)}
                                          className="p-1 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                                          title="Duplicate criteria field"
                                        >
                                          <ClipboardList className="w-3.5 h-3.5" />
                                        </button>

                                        {/* INLINE PREVIEW TOGGLE */}
                                        <button
                                          onClick={() => toggleInlinePreview(q.id)}
                                          className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-colors cursor-pointer flex items-center gap-1 ${
                                            inlinePreviewQuestions[q.id]
                                              ? "bg-orange-100 text-[#FF5C28]"
                                              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                                          }`}
                                          title="Toggle component preview"
                                        >
                                          <Sparkles className="w-3 h-3 text-[#FF5C28]" />
                                          <span>{inlinePreviewQuestions[q.id] ? "Hide Preview" : "Quick Preview"}</span>
                                        </button>

                                        {/* DELETE QUESTION BUTTON */}
                                        <button
                                          onClick={() => handleDeleteQuestionFromSection(sec.id, q.id)}
                                          className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                                          title="Remove question"
                                        >
                                          <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                      </div>
                                    </div>

                                    {/* QUESTION PROMPT / TITLE INPUT */}
                                    <div>
                                      <input
                                        type="text"
                                        value={q.title}
                                        onChange={e => handleUpdateQuestionInSection(sec.id, q.id, "title", e.target.value)}
                                        placeholder="Enter evaluation prompt or criteria question..."
                                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-[#042C51] focus:outline-none focus:bg-white focus:border-[#042C51]"
                                      />
                                    </div>

                                    {/* OPTIONAL INLINE COMPONENT PREVIEW (EXPANDABLE) */}
                                    {inlinePreviewQuestions[q.id] && (
                                      <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2 text-xs">
                                        <div className="flex items-center justify-between">
                                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
                                            Evaluator Input Component ({q.inputType})
                                          </span>
                                        </div>

                                        {q.inputType === "Rating" && (
                                          <div className="flex flex-wrap gap-1.5 pt-1">
                                            {[1, 2, 3, 4, 5].map(val => (
                                              <button
                                                key={val}
                                                type="button"
                                                className="px-3 py-1.5 bg-white border border-slate-200 hover:border-[#FF5C28] hover:bg-orange-50/50 rounded-lg text-xs font-black text-[#042C51]"
                                              >
                                                {val}
                                              </button>
                                            ))}
                                          </div>
                                        )}

                                        {q.inputType === "Text" && (
                                          <textarea
                                            readOnly
                                            rows={2}
                                            placeholder="Interviewer notes will be entered here..."
                                            className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-400 italic cursor-not-allowed"
                                          />
                                        )}

                                        {q.inputType === "Pass/Fail" && (
                                          <div className="flex gap-2">
                                            <button type="button" className="px-4 py-1.5 bg-emerald-100 text-emerald-800 font-bold rounded-lg text-xs">
                                              ✓ Pass
                                            </button>
                                            <button type="button" className="px-4 py-1.5 bg-rose-100 text-rose-800 font-bold rounded-lg text-xs">
                                              ✕ Fail
                                            </button>
                                          </div>
                                        )}

                                        {(q.inputType === "Single Choice" || q.inputType === "Multiple Choice") && (
                                          <div className="space-y-1">
                                            {["Option A - Meets Standard", "Option B - Above Standard"].map((opt, i) => (
                                              <div key={i} className="flex items-center gap-2 text-xs text-slate-600 font-semibold">
                                                <input type="radio" disabled />
                                                <span>{opt}</span>
                                              </div>
                                            ))}
                                          </div>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}

                            {/* BUTTON TO ADD QUESTION TO THIS SECTION */}
                            <button
                              onClick={() => handleAddQuestionToSection(sec.id)}
                              className="w-full py-2.5 bg-white hover:bg-slate-100 text-[#042C51] border border-dashed border-slate-300 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                            >
                              <Plus className="w-4 h-4 text-[#FF5C28]" /> Create New Criterion in "{sec.title}"
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* ADD NEW SECTION DASHED BUTTON */}
                  <button
                    onClick={handleAddSection}
                    className="w-full py-4 bg-slate-50 hover:bg-blue-50/50 text-[#042C51] border-2 border-dashed border-slate-300 hover:border-[#042C51] rounded-2xl text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer shadow-2xs group"
                  >
                    <Plus className="w-4 h-4 text-[#FF5C28] group-hover:scale-125 transition-transform" />
                    <span>+ Create New Evaluation Section</span>
                  </button>
                </div>

                {/* FORM FOOTER ACTIONS */}
                <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                <button
                  onClick={() => setFormViewMode("table")}
                  className="px-4 py-2.5 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-4 h-4 text-slate-500" /> Done & Back to Table
                </button>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsLivePreviewModalOpen(true)}
                    className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-[#042C51] text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <Eye className="w-4 h-4 text-[#FF5C28]" /> Preview Live Form
                  </button>
                  <button
                    onClick={() => showToast(`Saved all form sections for ${selectedPosition.title}`)}
                    className="px-6 py-2.5 bg-[#042C51] hover:bg-[#073A6B] text-white text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-2 shadow-xs"
                  >
                    <Save className="w-4 h-4 text-[#FF5C28]" /> Commit Evaluation Form Configuration
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    )}

      {/* ================= TAB 2B: APPLICATION QUESTIONS FORM (Public Talent Pool) ================= */}
      {activeTab === "application_questions" && (
        <ApplicationQuestionsFormSettings
          onSwitchModule={onSwitchModule}
          showToast={showToast}
        />
      )}

      {/* ================= TAB 3: PIPELINE SETTINGS ================= */}
      {activeTab === "pipeline" && (
        <div className="bg-white p-6 rounded-2xl border border-[#E6ECF2] shadow-xs space-y-6">
          <div className="pb-4 border-b border-slate-100">
            <h2 className="text-xl font-black text-[#042C51]">Recruitment Pipeline Settings</h2>
            <p className="text-xs text-slate-500 font-medium">
              Configure candidate recruitment stage gates, SLA turnaround deadlines, passing score thresholds, and automatic rejection automation rules.
            </p>
          </div>

          <div className="space-y-3">
            {pipelineStages.map(stg => (
              <div key={stg.id} className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-xl bg-[#042C51] text-white font-black text-xs flex items-center justify-center">
                      {stg.order}
                    </span>
                    <div>
                      <h3 className="text-sm font-black text-[#042C51]">{stg.name}</h3>
                      <p className="text-xs text-slate-500">{stg.description}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-center">
                    <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-lg border border-slate-200">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span className="text-xs font-bold text-slate-700">SLA:</span>
                      <input
                        type="number"
                        value={stg.slaDays}
                        onChange={e => handleUpdateStageSla(stg.id, Number(e.target.value))}
                        className="w-12 bg-slate-100 font-black text-xs text-center rounded focus:outline-none"
                      />
                      <span className="text-xs font-semibold text-slate-500">Days</span>
                    </div>

                    <button
                      onClick={() => handleToggleAutoReject(stg.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                        stg.autoReject
                          ? "bg-rose-50 text-rose-700 border-rose-300"
                          : "bg-slate-200 text-slate-600 border-slate-300"
                      }`}
                    >
                      Auto-Reject: {stg.autoReject ? "ON" : "OFF"}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ================= TAB 4: ASSESSMENT SETTINGS ================= */}
      {activeTab === "assessments" && (
        <div className="bg-white p-6 rounded-2xl border border-[#E6ECF2] shadow-xs space-y-6">
          <div className="pb-4 border-b border-slate-100">
            <h2 className="text-xl font-black text-[#042C51]">Candidate Assessment Benchmarks</h2>
            <p className="text-xs text-slate-500 font-medium">
              Establish minimum qualification benchmarks for skill test screening and language proficiency.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Benchmark 1 */}
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-[#042C51]">Minimum Typing Speed (WPM)</span>
                <span className="text-base font-black text-[#FF5C28]">{benchmarks.typingWpm} WPM</span>
              </div>
              <input
                type="range"
                min="25"
                max="70"
                value={benchmarks.typingWpm}
                onChange={e => setBenchmarks({ ...benchmarks, typingWpm: Number(e.target.value) })}
                className="w-full accent-[#042C51] cursor-pointer"
              />
              <p className="text-[11px] text-slate-500">
                Candidates scoring below {benchmarks.typingWpm} Words Per Minute will be auto-flagged for non-voice role review.
              </p>
            </div>

            {/* Benchmark 2 */}
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-[#042C51]">Typing Accuracy Threshold (%)</span>
                <span className="text-base font-black text-[#FF5C28]">{benchmarks.typingAccuracy}%</span>
              </div>
              <input
                type="range"
                min="80"
                max="100"
                value={benchmarks.typingAccuracy}
                onChange={e => setBenchmarks({ ...benchmarks, typingAccuracy: Number(e.target.value) })}
                className="w-full accent-[#042C51] cursor-pointer"
              />
              <p className="text-[11px] text-slate-500">
                Minimum typing keystroke accuracy required during the 5-minute online evaluation.
              </p>
            </div>

            {/* Benchmark 3 */}
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-[#042C51]">Versant Audio Language Score</span>
                <span className="text-base font-black text-[#FF5C28]">{benchmarks.versantScore} / 80</span>
              </div>
              <input
                type="range"
                min="40"
                max="75"
                value={benchmarks.versantScore}
                onChange={e => setBenchmarks({ ...benchmarks, versantScore: Number(e.target.value) })}
                className="w-full accent-[#042C51] cursor-pointer"
              />
              <p className="text-[11px] text-slate-500">
                Automated voice pronunciation, sentence mastery, and vocabulary proficiency cut-off.
              </p>
            </div>

            {/* Benchmark 4 */}
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-[#042C51]">Technical Aptitude Cut-Off (%)</span>
                <span className="text-base font-black text-[#FF5C28]">{benchmarks.techAptitude}%</span>
              </div>
              <input
                type="range"
                min="60"
                max="95"
                value={benchmarks.techAptitude}
                onChange={e => setBenchmarks({ ...benchmarks, techAptitude: Number(e.target.value) })}
                className="w-full accent-[#042C51] cursor-pointer"
              />
              <p className="text-[11px] text-slate-500">
                Account-specific diagnostic exam threshold for technical support and financial queues.
              </p>
            </div>
          </div>

          <div className="flex justify-end pt-3">
            <button
              onClick={() => showToast("Assessment benchmark thresholds updated.")}
              className="bg-[#042C51] hover:bg-[#0A3A67] text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2"
            >
              <Save className="w-4 h-4 text-[#FF5C28]" /> Save Benchmark Rules
            </button>
          </div>
        </div>
      )}

      {/* ================= TAB 5: EMAIL TEMPLATES ================= */}
      {activeTab === "emails" && (
        <div className="bg-white p-6 rounded-2xl border border-[#E6ECF2] shadow-xs space-y-6">
          <div className="pb-4 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-black text-[#042C51]">Automated Candidate Email Templates</h2>
              <p className="text-xs text-slate-500 font-medium">
                Manage pre-formatted candidate communication templates with dynamic variable tags.
              </p>
            </div>

            {/* VIEW MODE SWITCHER & LOGS BUTTON */}
            <div className="flex flex-wrap items-center gap-2">
              {onSwitchModule && (
                <button
                  type="button"
                  onClick={() => onSwitchModule("Email Logs")}
                  className="px-3.5 py-1.5 bg-blue-50 hover:bg-blue-100/70 border border-blue-200 text-[#042C51] rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
                  title="Open live email delivery logs"
                >
                  <Mail className="w-3.5 h-3.5 text-[#FF5C28]" />
                  <span>View Delivery Logs</span>
                </button>
              )}

              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 self-start md:self-auto">
                <button
                  type="button"
                  onClick={() => setEmailViewMode('split')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    emailViewMode === 'split'
                      ? "bg-[#042C51] text-white shadow-xs"
                      : "text-slate-600 hover:text-[#042C51]"
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>Side-by-Side</span>
                </button>
                <button
                  type="button"
                  onClick={() => setEmailViewMode('editor')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    emailViewMode === 'editor'
                      ? "bg-[#042C51] text-white shadow-xs"
                      : "text-slate-600 hover:text-[#042C51]"
                  }`}
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Editor Only</span>
                </button>
                <button
                  type="button"
                  onClick={() => setEmailViewMode('preview')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    emailViewMode === 'preview'
                      ? "bg-[#042C51] text-white shadow-xs"
                      : "text-slate-600 hover:text-[#042C51]"
                  }`}
                >
                  <Eye className="w-3.5 h-3.5 text-[#FF5C28]" />
                  <span>Live Email Preview</span>
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* TEMPLATE LIST */}
            <div className={`${emailViewMode === 'split' ? 'lg:col-span-3' : 'lg:col-span-4'} space-y-2`}>
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block mb-1">
                SELECT EMAIL TEMPLATE ({templates.length})
              </span>
              {templates.map(tmpl => (
                <div
                  key={tmpl.id}
                  onClick={() => setSelectedTmplId(tmpl.id)}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                    selectedTmplId === tmpl.id
                      ? "bg-blue-50/80 border-[#042C51] shadow-xs ring-1 ring-[#042C51]/20"
                      : "bg-white border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="font-bold text-xs text-[#042C51] line-clamp-1">{tmpl.title}</span>
                    <span className="text-[10px] text-slate-400 font-extrabold shrink-0">{tmpl.code}</span>
                  </div>
                  <div className="flex items-center justify-between gap-2 mt-2 pt-1 border-t border-slate-100">
                    <span className="text-[10px] text-slate-500 font-semibold">{tmpl.category}</span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedTmplId(tmpl.id);
                        setPreviewModalTmplId(tmpl.id);
                        setIsPreviewModalOpen(true);
                      }}
                      className="text-[10px] font-bold text-[#FF5C28] hover:text-white bg-orange-50 hover:bg-[#FF5C28] border border-orange-200 px-2 py-1 rounded-lg flex items-center gap-1 transition-all cursor-pointer shadow-2xs shrink-0"
                      title="Click to view full final email design"
                    >
                      <Eye className="w-3 h-3" />
                      <span>View Final Design</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* TEMPLATE EDITOR (Shown in 'split' and 'editor' modes) */}
            {(emailViewMode === 'split' || emailViewMode === 'editor') && (
              <div className={`${
                emailViewMode === 'split' ? 'lg:col-span-5' : 'lg:col-span-8'
              } bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-4`}>
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <span className="text-[10px] font-extrabold text-[#FF5C28] uppercase tracking-wider block">TEMPLATE EDITOR</span>
                    <h3 className="text-base font-black text-[#042C51]">{selectedTemplate.title}</h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold text-slate-400 bg-white px-2.5 py-1 rounded-lg border border-slate-200 font-mono">
                      {selectedTemplate.code}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setPreviewModalTmplId(selectedTemplate.id);
                        setIsPreviewModalOpen(true);
                      }}
                      className="bg-white hover:bg-orange-50 text-[#042C51] hover:text-[#FF5C28] border border-slate-200 hover:border-orange-200 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs"
                    >
                      <Eye className="w-3.5 h-3.5 text-[#FF5C28]" />
                      <span>View Final Design</span>
                    </button>
                  </div>
                </div>

                {/* Subject Line Input */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-[#042C51] block">Subject Line</label>
                    <span className="text-[10px] text-slate-400 font-semibold">Supports dynamic variables</span>
                  </div>
                  <input
                    ref={subjectInputRef}
                    type="text"
                    value={selectedTemplate.subject}
                    onFocus={() => setActiveTemplateField('subject')}
                    onChange={e => handleUpdateTemplateField('subject', e.target.value)}
                    onDragOver={(e) => {
                      e.preventDefault();
                      e.dataTransfer.dropEffect = "copy";
                      setIsDraggingOverSubject(true);
                    }}
                    onDragLeave={() => setIsDraggingOverSubject(false)}
                    onDrop={(e) => handleDropVariable(e, 'subject')}
                    placeholder="Subject line..."
                    className={`w-full px-3 py-2 bg-white border rounded-xl text-xs font-semibold text-[#042C51] focus:outline-none transition-all ${
                      isDraggingOverSubject
                        ? "border-2 border-dashed border-[#FF5C28] bg-orange-50/40 ring-2 ring-orange-200"
                        : "border-slate-200 focus:border-[#042C51]"
                    }`}
                  />
                </div>

                {/* Email Body Textarea */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-[#042C51] block">Email Body Content</label>
                    <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-emerald-600 shrink-0" /> Drag variables below into editor
                    </span>
                  </div>
                  <textarea
                    ref={bodyTextAreaRef}
                    rows={emailViewMode === 'split' ? 12 : 10}
                    value={selectedTemplate.body}
                    onFocus={() => setActiveTemplateField('body')}
                    onChange={e => handleUpdateTemplateField('body', e.target.value)}
                    onDragOver={(e) => {
                      e.preventDefault();
                      e.dataTransfer.dropEffect = "copy";
                      setIsDraggingOverBody(true);
                    }}
                    onDragLeave={() => setIsDraggingOverBody(false)}
                    onDrop={(e) => handleDropVariable(e, 'body')}
                    placeholder="Type email body or drag dynamic variables here..."
                    className={`w-full px-3.5 py-3 bg-white border rounded-xl text-xs font-mono text-slate-800 focus:outline-none leading-relaxed transition-all ${
                      isDraggingOverBody
                        ? "border-2 border-dashed border-[#042C51] bg-blue-50/50 ring-2 ring-blue-200"
                        : "border-slate-200 focus:border-[#042C51]"
                    }`}
                  />
                </div>

                {/* DRAGGABLE & CLICKABLE DYNAMIC VARIABLES CONTAINER */}
                <div className="p-4 bg-blue-50/70 border border-blue-200 rounded-2xl space-y-2.5">
                  <div className="flex items-center justify-between flex-wrap gap-1">
                    <span className="text-[11px] font-black text-[#042C51] uppercase tracking-wider flex items-center gap-1.5">
                      <GripVertical className="w-4 h-4 text-[#FF5C28]" />
                      DYNAMIC VARIABLES ({DYNAMIC_VARIABLES.length})
                    </span>
                    <span className="text-[10px] text-slate-500 font-medium">
                      Drag variable into text area or click to insert at cursor
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 pt-1 max-h-36 overflow-y-auto pr-1">
                    {DYNAMIC_VARIABLES.map(varTag => (
                      <button
                        key={varTag}
                        type="button"
                        draggable
                        onDragStart={(e) => {
                          e.dataTransfer.setData("text/plain", varTag);
                          e.dataTransfer.effectAllowed = "copy";
                        }}
                        onClick={() => handleInsertVariable(varTag)}
                        title={`Drag into editor or click to insert ${varTag}`}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-white hover:bg-blue-100/80 text-[#042C51] border border-blue-200 hover:border-blue-400 rounded-xl text-xs font-mono font-bold cursor-grab active:cursor-grabbing hover:scale-105 shadow-2xs transition-all select-none group"
                      >
                        <GripVertical className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#FF5C28] shrink-0" />
                        <span>{varTag}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setPreviewModalTmplId(selectedTemplate.id);
                      setIsPreviewModalOpen(true);
                    }}
                    className="bg-white hover:bg-orange-50 text-[#042C51] hover:text-[#FF5C28] border border-slate-300 hover:border-orange-300 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 shadow-2xs"
                  >
                    <Eye className="w-4 h-4 text-[#FF5C28]" /> View Final Design
                  </button>

                  <button
                    onClick={() => handleSaveTemplate(selectedTemplate.body, selectedTemplate.subject)}
                    className="bg-[#042C51] hover:bg-[#0A3A67] text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 shadow-xs"
                  >
                    <Save className="w-4 h-4 text-[#FF5C28]" /> Save Email Template
                  </button>
                </div>
              </div>
            )}

            {/* LIVE EMAIL VISUAL PREVIEW (Shown in 'split' and 'preview' modes) */}
            {(emailViewMode === 'split' || emailViewMode === 'preview') && (
              <div className={`${
                emailViewMode === 'split' ? 'lg:col-span-4' : 'lg:col-span-8'
              } bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-3`}>
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-xs font-black text-[#042C51] uppercase tracking-wider">LIVE EMAIL PREVIEW</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setPreviewModalTmplId(selectedTemplate.id);
                      setIsPreviewModalOpen(true);
                    }}
                    className="text-[10px] font-bold text-[#FF5C28] hover:text-[#e04b1c] bg-white px-2.5 py-1 rounded-lg border border-slate-200 hover:border-orange-200 flex items-center gap-1 shadow-2xs cursor-pointer transition-all"
                  >
                    <Eye className="w-3 h-3 text-[#FF5C28]" />
                    <span>View Modal Window</span>
                  </button>
                </div>

                {renderLiveEmailContent(selectedTemplate)}
              </div>
            )}
          </div>

          {/* FULL MODAL EMAIL PREVIEW DIALOG */}
          {isPreviewModalOpen && (
            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
              <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
                {/* MODAL HEADER */}
                <div className="p-4 bg-[#042C51] text-white flex items-center justify-between border-b border-slate-800">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 bg-orange-500/20 rounded-xl border border-orange-400/30">
                      <Mail className="w-5 h-5 text-[#FF5C28]" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-black tracking-wide text-white">Final Email Design Preview</h3>
                        <span className="text-[10px] font-bold text-amber-300 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-500/30 font-mono">
                          {templates.find(t => t.id === previewModalTmplId)?.code || "TMPL"}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-300 font-medium">
                        {templates.find(t => t.id === previewModalTmplId)?.title}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* TEMPLATE SWITCHER DROPDOWN INSIDE MODAL */}
                    <select
                      value={previewModalTmplId}
                      onChange={(e) => setPreviewModalTmplId(e.target.value)}
                      className="bg-slate-800 text-xs font-bold text-white border border-slate-700 rounded-xl px-3 py-1.5 focus:outline-none cursor-pointer"
                    >
                      {templates.map(t => (
                        <option key={t.id} value={t.id}>{t.title} ({t.code})</option>
                      ))}
                    </select>

                    <button
                      type="button"
                      onClick={() => setIsPreviewModalOpen(false)}
                      className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all cursor-pointer"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* MODAL BODY */}
                <div className="p-5 overflow-y-auto bg-slate-50 space-y-4">
                  <div className="flex items-center justify-between bg-blue-50/80 border border-blue-200 p-3 rounded-xl text-xs font-bold text-[#042C51]">
                    <span className="flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-[#FF5C28]" />
                      Showing rendered view with live candidate metadata applied
                    </span>
                    <span className="text-[11px] text-slate-500 font-normal">
                      Category: {templates.find(t => t.id === previewModalTmplId)?.category}
                    </span>
                  </div>

                  {renderLiveEmailContent(templates.find(t => t.id === previewModalTmplId) || selectedTemplate)}
                </div>

                {/* MODAL FOOTER */}
                <div className="p-4 bg-white border-t border-slate-200 flex items-center justify-between flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const tmpl = templates.find(t => t.id === previewModalTmplId) || selectedTemplate;
                      setSelectedTmplId(tmpl.id);
                      setIsPreviewModalOpen(false);
                    }}
                    className="text-xs font-bold text-[#042C51] hover:text-[#0A3A67] flex items-center gap-1.5 cursor-pointer bg-slate-100 hover:bg-slate-200 px-3.5 py-2 rounded-xl transition-all"
                  >
                    <Edit3 className="w-4 h-4 text-[#FF5C28]" />
                    <span>Edit This Template</span>
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        const tmpl = templates.find(t => t.id === previewModalTmplId) || selectedTemplate;
                        let bodyText = tmpl.body;
                        Object.entries(SAMPLE_REPLACEMENT_DATA).forEach(([k, v]) => {
                          bodyText = bodyText.replaceAll(k, v);
                        });
                        navigator.clipboard.writeText(bodyText);
                        setModalCopiedNotice(true);
                        setTimeout(() => setModalCopiedNotice(false), 2000);
                      }}
                      className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      {modalCopiedNotice ? (
                        <>
                          <Check className="w-4 h-4 text-emerald-600" />
                          <span className="text-emerald-700">Copied to Clipboard!</span>
                        </>
                      ) : (
                        <>
                          <ClipboardCheck className="w-4 h-4 text-slate-500" />
                          <span>Copy Email Text</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => setIsPreviewModalOpen(false)}
                      className="bg-[#042C51] hover:bg-[#0A3A67] text-white px-5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer"
                    >
                      Close Preview
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ================= TAB 6: HOLIDAY CALENDAR ================= */}
      {activeTab === "holidays" && (
        <div className="bg-white p-6 rounded-2xl border border-[#E6ECF2] shadow-xs space-y-6">
          <div className="pb-4 border-b border-slate-100">
            <span className="text-[10px] bg-blue-50 text-[#042C51] font-extrabold px-2.5 py-1 rounded-md border border-blue-200 uppercase tracking-wider inline-block mb-1">
              PHILIPPINE WORKING-DAY CALENDAR
            </span>
            <h2 className="text-xl font-black text-[#042C51]">Interview Follow-up Holidays</h2>
            <p className="text-xs text-slate-500 font-medium">
              Active dates are excluded when calculating candidate interview response deadlines and the automatic Day 3, 6, 9, and 12 follow-up workflow.
            </p>
          </div>

          {/* ADD HOLIDAY FORM */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
            <span className="text-xs font-bold text-[#042C51] block">Configure New Non-Working Date</span>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div>
                <label className="text-[10px] font-extrabold text-slate-500 uppercase block mb-1">Holiday Date</label>
                <input
                  type="date"
                  value={newHolDate}
                  onChange={e => setNewHolDate(e.target.value)}
                  className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-[#042C51] focus:outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-[10px] font-extrabold text-slate-500 uppercase block mb-1">Holiday Name</label>
                <input
                  type="text"
                  placeholder="Example: Ninoy Aquino Day"
                  value={newHolName}
                  onChange={e => setNewHolName(e.target.value)}
                  className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-[#042C51] focus:outline-none"
                />
              </div>

              <div className="flex items-end">
                <button
                  onClick={handleAddHoliday}
                  className="w-full py-2 bg-[#042C51] hover:bg-[#0A3A67] text-white text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Plus className="w-4 h-4 text-[#FF5C28]" /> Register Non-Working Date
                </button>
              </div>
            </div>
          </div>

          {/* LIST OF HOLIDAYS */}
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-[#F8FAFC] border-b border-slate-200 text-[11px] font-black uppercase text-[#042C51]">
                  <th className="p-3">Date</th>
                  <th className="p-3">Holiday Name</th>
                  <th className="p-3">Classification</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {holidays.map(hol => (
                  <tr key={hol.id} className="hover:bg-slate-50">
                    <td className="p-3 font-bold text-[#042C51]">{hol.date}</td>
                    <td className="p-3 font-extrabold text-[#042C51]">{hol.name}</td>
                    <td className="p-3 text-slate-600">{hol.type}</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800">
                        {hol.status}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => handleDeleteHoliday(hol.id)}
                        className="text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ================= TAB 7: APPROVAL RULES ================= */}
      {activeTab === "approvals" && (
        <div className="bg-white p-6 rounded-2xl border border-[#E6ECF2] shadow-xs space-y-6">
          <div className="pb-4 border-b border-slate-100">
            <span className="text-[10px] bg-blue-50 text-[#042C51] font-extrabold px-2.5 py-1 rounded-md border border-blue-200 uppercase tracking-wider inline-block mb-1">
              APPROVAL CONFIGURATION
            </span>
            <h2 className="text-xl font-black text-[#042C51]">Recruitment Approval Rules</h2>
            <p className="text-xs text-slate-500 font-medium">
              Configure approval users for Job Descriptions, Hiring Needs, Available Positions, and Offers from one settings panel.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* MODULE SELECTOR */}
            <div className="lg:col-span-4 space-y-2">
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block mb-2">APPROVAL MODULES</span>

              {[
                { key: "jd", title: "Job Description Approval", icon: FileText, count: approvalRules.jd.length },
                { key: "needs", title: "Hiring Needs Intake", icon: Sliders, count: approvalRules.needs.length },
                { key: "positions", title: "Available Positions", icon: CheckCircle2, count: approvalRules.positions.length },
                { key: "offers", title: "Job Offers & Comp", icon: ShieldCheck, count: approvalRules.offers.length }
              ].map(mod => {
                const IconComponent = mod.icon;
                return (
                  <div
                    key={mod.key}
                    onClick={() => setApprovalModule(mod.key as any)}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                      approvalModule === mod.key
                        ? "bg-[#042C51] text-white border-[#042C51] shadow-xs"
                        : "bg-white border-slate-200 hover:border-slate-300 text-[#042C51]"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <IconComponent className={`w-4 h-4 ${approvalModule === mod.key ? "text-[#FF5C28]" : "text-slate-400"}`} />
                      <div>
                        <p className="text-xs font-black">{mod.title}</p>
                        <p className={`text-[10px] ${approvalModule === mod.key ? "text-slate-300" : "text-slate-500"}`}>
                          {mod.count} approval users
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </div>
                );
              })}
            </div>

            {/* MODULE RULES DETAILS */}
            <div className="lg:col-span-8 bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-extrabold text-[#FF5C28] uppercase tracking-wider block">ACTIVE MODULE RULES</span>
                  <h3 className="text-base font-black text-[#042C51]">
                    {approvalModule === "jd" && "Job Description Approval"}
                    {approvalModule === "needs" && "Hiring Needs Authorization"}
                    {approvalModule === "positions" && "Available Position Activation"}
                    {approvalModule === "offers" && "Job Offer & Compensation Consensus"}
                  </h3>
                </div>
                <span className="bg-white px-3 py-1 rounded-full text-xs font-bold text-[#042C51] border border-slate-200">
                  {approvalRules[approvalModule].length} Active Approvers
                </span>
              </div>

              {/* ADD USER INPUT */}
              <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-2">
                <span className="text-xs font-bold text-[#042C51] block">Authorize New Approval User</span>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Search SiBS ID or employee name..."
                    value={searchEmployeeText}
                    onChange={e => setSearchEmployeeText(e.target.value)}
                    className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-[#042C51] focus:outline-none"
                  />
                  <button
                    onClick={handleAddApprovalUser}
                    className="px-4 py-2 bg-[#042C51] hover:bg-[#0A3A67] text-white text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1"
                  >
                    <UserPlus className="w-4 h-4 text-[#FF5C28]" /> Authorize Approver
                  </button>
                </div>
              </div>

              {/* USER LIST */}
              <div className="space-y-2">
                {approvalRules[approvalModule].map(user => (
                  <div key={user.id} className="bg-white p-3.5 rounded-xl border border-slate-200 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#042C51] text-white text-xs font-black flex items-center justify-center">
                        {user.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-xs font-black text-[#042C51]">
                          {user.sibsId} – {user.name}
                        </p>
                        <p className="text-[10px] text-slate-500 font-semibold">{user.permissionText}</p>
                      </div>
                    </div>

                    <button
                      onClick={() => handleRemoveApprovalUser(user.id)}
                      className="text-slate-400 hover:text-rose-600 transition-colors p-1 cursor-pointer"
                      title="Remove Approver"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* LIVE CANDIDATE EVALUATION FORM PREVIEW MODAL */}
      {isLivePreviewModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-6xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
            {/* MODAL HEADER */}
            <div className="bg-[#042C51] text-white p-4 sm:p-5 flex items-center justify-between shrink-0 gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#FF5C28] text-white flex items-center justify-center shrink-0 shadow-xs">
                  <ClipboardCheck className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black bg-white/20 text-white px-2 py-0.5 rounded uppercase tracking-wider">
                      LIVE INTERVIEW EVALUATION
                    </span>
                    <span className="text-xs text-slate-300 font-bold">{selectedPosition.code}</span>
                  </div>
                  <h3 className="text-base font-black text-white">{selectedPosition.formName}</h3>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {/* Live Completion Badge */}
                <div className="hidden md:flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-xl border border-white/15">
                  <span className="text-[11px] text-slate-300 font-bold">Progress:</span>
                  <span className="text-xs font-black text-white">{liveScoredQuestionsCount} / {totalQuestionsCount} Criteria</span>
                  <div className="w-16 h-2 bg-white/20 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#FF5C28] transition-all duration-300"
                      style={{ width: `${totalQuestionsCount ? (liveScoredQuestionsCount / totalQuestionsCount) * 100 : 0}%` }}
                    />
                  </div>
                </div>

                {/* Candidate Sidebar Toggle */}
                <button
                  onClick={() => setShowCandidateContextPanel(!showCandidateContextPanel)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border ${
                    showCandidateContextPanel
                      ? "bg-[#FF5C28] text-white border-[#FF5C28]"
                      : "bg-white/10 text-white border-white/20 hover:bg-white/20"
                  }`}
                  title="Toggle Candidate Background Dossier"
                >
                  <UserCheck className="w-4 h-4" />
                  <span className="hidden sm:inline">{showCandidateContextPanel ? "Hide Candidate Dossier" : "Show Candidate Dossier"}</span>
                </button>

                <button
                  onClick={() => setIsLivePreviewModalOpen(false)}
                  className="p-2 text-slate-300 hover:text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
                  title="Close Preview"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* MODAL BODY WITH SPLIT VIEW */}
            <div className="flex-1 overflow-hidden flex flex-col md:flex-row bg-slate-50/60">
              {/* CANDIDATE DOSSIER SIDEBAR */}
              {showCandidateContextPanel && (
                <div className="w-full md:w-80 bg-white border-b md:border-b-0 md:border-r border-slate-200 p-4 space-y-4 overflow-y-auto shrink-0 shadow-xs">
                  <div className="bg-[#042C51]/5 p-3 rounded-xl border border-[#042C51]/10 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#042C51] text-white font-black text-sm flex items-center justify-center shrink-0">
                      {previewCandidateName.split(" ").map(n => n[0]).join("") || "JD"}
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-[#042C51]">{previewCandidateName}</h4>
                      <p className="text-[11px] text-slate-500 font-semibold">{selectedPosition.title}</p>
                      <span className="text-[10px] font-bold text-slate-400">{selectedPosition.site} Site</span>
                    </div>
                  </div>

                  {/* PREVIOUS PIPELINE SUMMARY */}
                  <div className="space-y-2">
                    <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">Initial HR Screen Notes</span>
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80 text-[11px] text-slate-600 font-medium space-y-1">
                      <p className="font-semibold text-[#042C51]">✓ Passed Initial Communication & Typing Assessment</p>
                      <p className="text-slate-500">Typing Speed: 52 WPM (98% Accuracy)</p>
                      <p className="text-slate-500">Notice Period: Immediately Available</p>
                      <p className="text-slate-500">Expected Salary: ₱28,000 / month</p>
                    </div>
                  </div>

                  {/* KEY COMPETENCIES TO PROBE */}
                  <div className="space-y-2">
                    <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">Target Competencies to Focus</span>
                    <div className="space-y-1.5">
                      <div className="bg-blue-50 text-blue-900 p-2 rounded-lg border border-blue-100 text-[11px] font-bold flex items-center justify-between">
                        <span>Communication Clarity</span>
                        <span className="text-[10px] bg-blue-200/60 text-blue-900 px-1.5 py-0.5 rounded">High Priority</span>
                      </div>
                      <div className="bg-emerald-50 text-emerald-900 p-2 rounded-lg border border-emerald-100 text-[11px] font-bold flex items-center justify-between">
                        <span>Scenario Problem Solving</span>
                        <span className="text-[10px] bg-emerald-200/60 text-emerald-900 px-1.5 py-0.5 rounded">Core Metric</span>
                      </div>
                      <div className="bg-purple-50 text-purple-900 p-2 rounded-lg border border-purple-100 text-[11px] font-bold flex items-center justify-between">
                        <span>Customer Empathy & Retention</span>
                        <span className="text-[10px] bg-purple-200/60 text-purple-900 px-1.5 py-0.5 rounded">Soft Skill</span>
                      </div>
                    </div>
                  </div>

                  {/* EVALUATION BENCHMARK */}
                  <div className="p-3 bg-amber-50 rounded-xl border border-amber-200/80 text-amber-900 space-y-1">
                    <div className="flex items-center gap-1.5">
                      <Award className="w-4 h-4 text-amber-600 shrink-0" />
                      <span className="text-xs font-black">Passing Standard</span>
                    </div>
                    <p className="text-[11px] text-amber-800 font-semibold">
                      Candidate must achieve at least <strong className="font-black text-[#042C51]">{selectedPosition.passingScore}%</strong> overall score to be endorsed for hire.
                    </p>
                  </div>
                </div>
              )}

              {/* MAIN EVALUATION FORM AREA */}
              <div className="flex-1 p-4 sm:p-5 overflow-y-auto space-y-5">
                {/* INTERVIEWER & CANDIDATE META BAR */}
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="text-[10px] font-extrabold text-slate-400 uppercase block mb-1">Candidate Name</label>
                    <input
                      type="text"
                      value={previewCandidateName}
                      onChange={e => setPreviewCandidateName(e.target.value)}
                      className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-[#042C51] focus:outline-none focus:border-[#042C51]"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-extrabold text-slate-400 uppercase block mb-1">Interviewer Name</label>
                    <input
                      type="text"
                      value={previewInterviewerName}
                      onChange={e => setPreviewInterviewerName(e.target.value)}
                      className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-[#042C51] focus:outline-none focus:border-[#042C51]"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-extrabold text-slate-400 uppercase block mb-1">Target Position & Site</label>
                    <div className="px-3 py-1.5 bg-slate-100 rounded-lg text-xs font-bold text-[#042C51] truncate">
                      {selectedPosition.title} ({selectedPosition.site})
                    </div>
                  </div>
                </div>

                {/* EVALUATION FORM SECTIONS */}
                <div className="space-y-5">
                  {formSections.map((sec, secIdx) => (
                    <div key={sec.id} className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
                      {/* SECTION TITLE BAR */}
                      <div className="bg-slate-100 p-3.5 border-b border-slate-200 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-md bg-[#042C51] text-white text-xs font-black flex items-center justify-center">
                            S{secIdx + 1}
                          </span>
                          <h4 className="text-xs font-black text-[#042C51] uppercase tracking-wide">{sec.title}</h4>
                        </div>
                        <span className="text-[11px] font-bold text-slate-500 bg-white px-2.5 py-1 rounded-lg border border-slate-200">
                          {sec.questions.length} Criteria Fields
                        </span>
                      </div>

                      {/* SECTION QUESTIONS */}
                      <div className="p-4 space-y-5">
                        {sec.questions.map((q, qIdx) => {
                          const currentScore = previewScores[q.id] !== undefined ? previewScores[q.id] : 4;

                          return (
                            <div key={q.id} className="bg-slate-50/80 p-4 rounded-xl border border-slate-200/90 space-y-3">
                              <div className="flex items-start justify-between gap-3">
                                <div className="flex items-start gap-2.5">
                                  <span className="w-6 h-6 rounded-full bg-[#FF5C28] text-white text-xs font-black flex items-center justify-center shrink-0 mt-0.5">
                                    {qIdx + 1}
                                  </span>
                                  <div>
                                    <p className="text-xs font-black text-[#042C51] leading-relaxed">{q.title}</p>
                                    <p className="text-[11px] text-slate-500 font-medium mt-0.5">Evaluate candidate performance against position rubric standards.</p>
                                  </div>
                                </div>
                                <span className="text-[10px] font-bold text-slate-600 shrink-0 bg-white px-2.5 py-1 rounded-lg border border-slate-200 shadow-2xs">
                                  {q.inputType}
                                </span>
                              </div>

                              {/* RATING SCALE INTERACTION WITH MICRO-RUBRIC */}
                              {q.inputType === "Rating" && (
                                <div className="pt-1 space-y-2">
                                  <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
                                    {[
                                      { val: 1, label: "Unsatisfactory", desc: "Lacks core skill" },
                                      { val: 2, label: "Below Standard", desc: "Needs guidance" },
                                      { val: 3, label: "Meets Standard", desc: "Job-ready" },
                                      { val: 4, label: "Exceeds Standard", desc: "Strong performer" },
                                      { val: 5, label: "Role Model", desc: "Subject Matter Expert" },
                                    ].map(item => (
                                      <button
                                        key={item.val}
                                        onClick={() => setPreviewScores(prev => ({ ...prev, [q.id]: item.val }))}
                                        className={`p-2.5 rounded-xl transition-all cursor-pointer border text-left flex flex-col justify-between ${
                                          currentScore === item.val
                                            ? "bg-[#042C51] text-white border-[#042C51] shadow-xs"
                                            : "bg-white text-slate-700 border-slate-200 hover:border-[#FF5C28] hover:bg-slate-50"
                                        }`}
                                      >
                                        <div className="flex items-center justify-between w-full mb-1">
                                          <span className="text-sm font-black">{item.val}</span>
                                          {currentScore === item.val && (
                                            <CheckCircle2 className="w-3.5 h-3.5 text-[#FF5C28]" />
                                          )}
                                        </div>
                                        <div>
                                          <span className={`text-[11px] font-bold block leading-tight ${currentScore === item.val ? "text-white" : "text-[#042C51]"}`}>
                                            {item.label}
                                          </span>
                                          <span className={`text-[9px] font-medium block mt-0.5 ${currentScore === item.val ? "text-slate-300" : "text-slate-400"}`}>
                                            {item.desc}
                                          </span>
                                        </div>
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* PASS/FAIL INTERACTION */}
                              {q.inputType === "Pass/Fail" && (
                                <div className="flex gap-2 pt-1">
                                  <button
                                    onClick={() => setPreviewScores(prev => ({ ...prev, [q.id]: "Pass" }))}
                                    className={`px-5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border flex items-center gap-1.5 ${
                                      previewScores[q.id] === "Pass" || !previewScores[q.id]
                                        ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                                        : "bg-white text-emerald-800 border-emerald-200 hover:bg-emerald-50"
                                    }`}
                                  >
                                    <CheckCircle2 className="w-4 h-4" /> PASS CRITERIA
                                  </button>
                                  <button
                                    onClick={() => setPreviewScores(prev => ({ ...prev, [q.id]: "Fail" }))}
                                    className={`px-5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border flex items-center gap-1.5 ${
                                      previewScores[q.id] === "Fail"
                                        ? "bg-rose-600 text-white border-rose-600 shadow-xs"
                                        : "bg-white text-rose-800 border-rose-200 hover:bg-rose-50"
                                    }`}
                                  >
                                    <X className="w-4 h-4" /> FAIL CRITERIA
                                  </button>
                                </div>
                              )}

                              {/* QUICK OBSERVATION TAG CHIPS & TEXT NOTES INPUT */}
                              <div className="space-y-2 pt-1">
                                <div className="flex items-center justify-between">
                                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
                                    Interviewer Observations & Notes
                                  </span>
                                  <span className="text-[10px] text-slate-400 font-semibold">Click chip to auto-insert note</span>
                                </div>

                                {/* Observation Chips */}
                                <div className="flex flex-wrap gap-1.5">
                                  {[
                                    "+ Clear Articulation",
                                    "+ Strong Problem Solving",
                                    "+ Customer Empathy",
                                    "+ Calm Under Pressure",
                                    "- Hesitant on Scenarios",
                                    "- Needs Grammar Coaching",
                                  ].map((chip, cIdx) => (
                                    <button
                                      key={cIdx}
                                      onClick={() => handleAppendQuickNote(q.id, chip)}
                                      className="px-2.5 py-1 bg-white hover:bg-[#042C51] hover:text-white text-slate-600 text-[10px] font-bold rounded-lg border border-slate-200 transition-all cursor-pointer"
                                    >
                                      {chip}
                                    </button>
                                  ))}
                                </div>

                                <textarea
                                  rows={2}
                                  value={previewNotes[q.id] || ""}
                                  onChange={e => setPreviewNotes(prev => ({ ...prev, [q.id]: e.target.value }))}
                                  placeholder="Type specific observations, behavioral examples, or candidate statements..."
                                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-[#042C51] focus:outline-none focus:border-[#042C51]"
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* MODAL FOOTER WITH LIVE CALCULATED SCORE & RESULT */}
            <div className="bg-white p-4 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
              <div className="flex items-center gap-3">
                <div className="bg-slate-100 px-4 py-2 rounded-xl border border-slate-200">
                  <span className="text-[10px] text-slate-500 font-bold block uppercase">Calculated Candidate Score</span>
                  <span className="text-base font-black text-[#042C51]">{liveCalculatedScore}.0% Overall Score</span>
                </div>

                <div className={`px-4 py-2 rounded-xl border flex items-center gap-2 ${
                  liveCalculatedScore >= selectedPosition.passingScore
                    ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                    : "bg-rose-50 text-rose-800 border-rose-200"
                }`}>
                  {liveCalculatedScore >= selectedPosition.passingScore ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
                  )}
                  <div>
                    <span className="text-[10px] font-bold block uppercase">
                      {liveCalculatedScore >= selectedPosition.passingScore ? "Evaluation Result" : "Below Threshold"}
                    </span>
                    <span className="text-xs font-black">
                      {liveCalculatedScore >= selectedPosition.passingScore ? "PASSED FOR ENDORSEMENT" : "REASSESSMENT REQUIRED"}{" "}
                      (Min: {selectedPosition.passingScore}%)
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsLivePreviewModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all cursor-pointer"
                >
                  Close Preview
                </button>
                <button
                  onClick={() => {
                    showToast(`Simulated candidate evaluation for ${previewCandidateName} recorded! Score: ${liveCalculatedScore}%`);
                    setIsLivePreviewModalOpen(false);
                  }}
                  className="px-5 py-2 bg-[#042C51] hover:bg-[#073A6B] text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-xs flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4 text-[#FF5C28]" /> Submit Candidate Evaluation
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CREATE NEW POSITION INTERVIEW FORM MODAL */}
      {isCreatePosModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-200">
            {/* MODAL HEADER */}
            <div className="bg-[#042C51] text-white p-5 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#FF5C28] text-white flex items-center justify-center shrink-0 shadow-xs">
                  <Plus className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white">Create New Position Form</h3>
                  <p className="text-xs text-slate-300 font-medium">Configure new final interview evaluation form and scoring rubric</p>
                </div>
              </div>
              <button
                onClick={() => setIsCreatePosModalOpen(false)}
                className="p-2 text-slate-300 hover:text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* MODAL FORM */}
            <form onSubmit={handleCreatePositionForm} className="p-5 space-y-4 overflow-y-auto flex-1 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Position Title */}
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="font-extrabold text-[#042C51] uppercase text-[11px] block">
                    Position Title <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Technical Support Representative, Quality Analyst..."
                    value={newPositionData.title}
                    onChange={(e) => {
                      const title = e.target.value;
                      setNewPositionData(prev => ({
                        ...prev,
                        title,
                        formName: prev.formName === "" || prev.formName.includes(" - Final Interview") ? (title ? `${title} - Final Interview Form` : "") : prev.formName
                      }));
                    }}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-[#042C51] focus:bg-white focus:border-[#042C51] focus:outline-none transition-colors"
                  />
                </div>

                {/* Position Code */}
                <div className="space-y-1.5">
                  <label className="font-extrabold text-[#042C51] uppercase text-[11px] block">
                    Position Code <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. POS-005"
                    value={newPositionData.code}
                    onChange={(e) => setNewPositionData(prev => ({ ...prev, code: e.target.value }))}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold text-[#042C51] focus:bg-white focus:border-[#042C51] focus:outline-none transition-colors"
                  />
                </div>

                {/* Department */}
                <div className="space-y-1.5">
                  <label className="font-extrabold text-[#042C51] uppercase text-[11px] block">
                    Department
                  </label>
                  <select
                    value={newPositionData.department}
                    onChange={(e) => setNewPositionData(prev => ({ ...prev, department: e.target.value }))}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-[#042C51] focus:bg-white focus:border-[#042C51] focus:outline-none transition-colors cursor-pointer"
                  >
                    <option value="Call Center Operations">Call Center Operations</option>
                    <option value="Technical Support">Technical Support</option>
                    <option value="Quality Assurance">Quality Assurance</option>
                    <option value="Workforce Management">Workforce Management</option>
                    <option value="Training & Development">Training & Development</option>
                    <option value="Human Resources">Human Resources</option>
                    <option value="IT & Infrastructure">IT & Infrastructure</option>
                    <option value="Executive Management">Executive Management</option>
                  </select>
                </div>

                {/* Site */}
                <div className="space-y-1.5">
                  <label className="font-extrabold text-[#042C51] uppercase text-[11px] block">
                    Primary Site Location
                  </label>
                  <select
                    value={newPositionData.site}
                    onChange={(e) => setNewPositionData(prev => ({ ...prev, site: e.target.value }))}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-[#042C51] focus:bg-white focus:border-[#042C51] focus:outline-none transition-colors cursor-pointer"
                  >
                    <option value="SiBS Tagum">SiBS Tagum</option>
                    <option value="SiBS Davao">SiBS Davao</option>
                    <option value="SiBS Mabini">SiBS Mabini</option>
                    <option value="Remote / WFH">Remote / WFH</option>
                    <option value="All Sites">All Sites (Enterprise-wide)</option>
                  </select>
                </div>

                {/* Minimum Passing Score */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="font-extrabold text-[#042C51] uppercase text-[11px] block">
                      Passing Benchmark
                    </label>
                    <span className="font-black text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 text-[11px]">
                      {newPositionData.passingScore}%
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min="50"
                      max="100"
                      step="5"
                      value={newPositionData.passingScore}
                      onChange={(e) => setNewPositionData(prev => ({ ...prev, passingScore: parseInt(e.target.value, 10) }))}
                      className="flex-1 accent-[#FF5C28] cursor-pointer"
                    />
                    <input
                      type="number"
                      min="50"
                      max="100"
                      value={newPositionData.passingScore}
                      onChange={(e) => setNewPositionData(prev => ({ ...prev, passingScore: parseInt(e.target.value, 10) || 80 }))}
                      className="w-16 px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-center font-black text-[#042C51]"
                    />
                  </div>
                </div>

                {/* Form Name */}
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="font-extrabold text-[#042C51] uppercase text-[11px] block">
                    Form Display Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Tier 2 Tech Support - Final Assessment Form"
                    value={newPositionData.formName}
                    onChange={(e) => setNewPositionData(prev => ({ ...prev, formName: e.target.value }))}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-[#042C51] focus:bg-white focus:border-[#042C51] focus:outline-none transition-colors"
                  />
                </div>

                {/* Target Competency Tags */}
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="font-extrabold text-[#042C51] uppercase text-[11px] block">
                    Target Competencies & Skills (Comma-separated)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Voice Care, Problem Solving, Troubleshooting, Culture Fit"
                    value={newPositionData.skills}
                    onChange={(e) => setNewPositionData(prev => ({ ...prev, skills: e.target.value }))}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-[#042C51] focus:bg-white focus:border-[#042C51] focus:outline-none transition-colors"
                  />
                </div>

                {/* Starting Template Preset */}
                <div className="space-y-2 sm:col-span-2">
                  <label className="font-extrabold text-[#042C51] uppercase text-[11px] block">
                    Initial Rubric Preset Template
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {[
                      {
                        key: "standard",
                        title: "Standard Operations Form",
                        desc: "3 Sections: Communication, Problem Solving, Culture Alignment",
                        badge: "Recommended"
                      },
                      {
                        key: "technical",
                        title: "Technical Support Rubric",
                        desc: "3 Sections: Tech Knowledge, Troubleshooting, Security Compliance",
                        badge: "Tech / IT"
                      },
                      {
                        key: "leadership",
                        title: "Leadership & Coaching Rubric",
                        desc: "3 Sections: Team Coaching, Operational SLA, Strategic Values",
                        badge: "TL / QA / Ops"
                      },
                      {
                        key: "clone",
                        title: "Clone From Existing Form",
                        desc: "Duplicate current rubrics and customize questions",
                        badge: "Copy Form"
                      },
                      {
                        key: "blank",
                        title: "Blank Canvas",
                        desc: "Single starter section ready for custom questions from scratch",
                        badge: "Blank"
                      }
                    ].map((tpl) => (
                      <button
                        type="button"
                        key={tpl.key}
                        onClick={() => setNewPositionData(prev => ({ ...prev, templatePreset: tpl.key as any }))}
                        className={`p-3 rounded-xl text-left border transition-all cursor-pointer flex flex-col justify-between ${
                          newPositionData.templatePreset === tpl.key
                            ? "bg-[#042C51] text-white border-[#042C51] shadow-xs"
                            : "bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className={`font-black text-xs ${newPositionData.templatePreset === tpl.key ? "text-white" : "text-[#042C51]"}`}>
                            {tpl.title}
                          </span>
                          <span className={`text-[9px] font-black px-1.5 py-0.5 rounded ${
                            newPositionData.templatePreset === tpl.key
                              ? "bg-[#FF5C28] text-white"
                              : "bg-slate-200 text-slate-700"
                          }`}>
                            {tpl.badge}
                          </span>
                        </div>
                        <p className={`text-[10px] leading-tight ${newPositionData.templatePreset === tpl.key ? "text-slate-200" : "text-slate-500"}`}>
                          {tpl.desc}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Status Toggle */}
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="font-extrabold text-[#042C51] uppercase text-[11px] block">
                    Form Status
                  </label>
                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="posStatus"
                        value="Active"
                        checked={newPositionData.status === "Active"}
                        onChange={() => setNewPositionData(prev => ({ ...prev, status: "Active" }))}
                        className="accent-[#042C51]"
                      />
                      <span className="font-bold text-[#042C51]">Active (Available for interviewers immediately)</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="posStatus"
                        value="Draft"
                        checked={newPositionData.status === "Draft"}
                        onChange={() => setNewPositionData(prev => ({ ...prev, status: "Draft" }))}
                        className="accent-[#042C51]"
                      />
                      <span className="font-bold text-slate-600">Draft (Under preparation)</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* FOOTER ACTIONS */}
              <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsCreatePosModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#FF5C28] hover:bg-[#e04f20] text-white font-black rounded-xl transition-all cursor-pointer shadow-xs flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" /> Create Form & Open Builder
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
