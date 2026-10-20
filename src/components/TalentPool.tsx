import React, { useState, useMemo, useRef, useEffect } from "react";
import AddCandidateModal from "./AddCandidateModal";
import CandidateProfileModal from "./CandidateProfileModal";
import PublicTalentPoolApplicationPage from "./PublicTalentPoolApplicationPage";
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
  Download,
  Upload,
  Plus,
  ExternalLink,
  ChevronDown,
  Info,
  CheckCircle,
  X,
  User,
  Mail,
  Phone,
  Briefcase,
  MapPin,
  Tag,
  Clock,
  ArrowRight,
  Database,
  SlidersHorizontal,
  ChevronLeft,
  ChevronsRight,
  AlertTriangle,
  Award,
  Settings,
  HelpCircle,
  FileText,
  GraduationCap,
  Volume2,
  Play,
  Pause,
  RotateCcw,
  UserCheck,
  ShieldAlert,
  Building,
  Calendar,
  Layers,
  Sparkles,
  Check,
  FileCheck,
  Trash2,
  Send,
  Radio,
  FileSpreadsheet
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

// ==================== TYPES & INTERFACES ====================

export interface WorkExperience {
  company: string;
  position: string;
  industry: string;
  tenure: string;
  monthlySalary: string;
  reasonForLeaving: string;
}

export interface EducationRecord {
  level: "Elementary" | "High School" | "Senior High" | "College" | "Vocational" | "Master's" | "Doctorate";
  schoolName: string;
  degreeCourse: string;
  gradYear: string;
  address: string;
}

export interface LicenseRecord {
  title: string;
  licenseNo: string;
  rating: string;
  validity: string;
}

export interface TrainingRecord {
  title: string;
  date: string;
  sponsor: string;
}

export interface CharacterReference {
  name: string;
  company: string;
  title: string;
  contactNumber: string;
  email: string;
}

export interface PreEmploymentRequirements {
  torDiploma: "Submitted" | "Pending" | "Verified";
  nbiClearance: "Submitted" | "Pending" | "Verified";
  medicalCheck: "Submitted" | "Pending" | "Verified";
  bir2316: "Submitted" | "Pending" | "Verified";
  sssNo: "Submitted" | "Pending" | "Verified";
  philHealthNo: "Submitted" | "Pending" | "Verified";
  pagIbigNo: "Submitted" | "Pending" | "Verified";
}

export interface DropOffInfo {
  dropOffStage: string;
  dropOffReason: string;
  date: string;
  notes: string;
}

export interface Candidate {
  id: string; // e.g. SIBS-CAN-9021
  name: string;
  email: string;
  phone: string;
  appliedPosition: string;
  department: string;
  accountFit: string;
  sourcingChannel: string;
  recruiter: string;
  applicationDate: string;
  status: "New Applicant" | "Silver Pool" | "Recyclable" | "Do Not Reprocess" | "Hired / Active" | "Initial Screening" | "Active" | "Drop-off";
  isPublicEntry: boolean;
  lastActivityDate: string;
  notes: string;

  // Personal Details
  address?: string;
  dob?: string;
  age?: number;
  gender?: string;
  civilStatus?: string;
  citizenship?: string;

  // Work Experience
  workExperience?: WorkExperience[];

  // Educational Background
  education?: EducationRecord[];

  // Eligibility & Licenses
  licenses?: LicenseRecord[];

  // Trainings & Seminars
  trainings?: TrainingRecord[];

  // Skills & Recognitions
  skills: string[];
  languages?: string[];
  awards?: string[];
  affiliations?: string[];

  // Assessment Results
  assessmentStatus?: string;
  testScore?: string;
  overallResult?: "Passed" | "Conditional" | "Failed";
  assessmentRemarks?: string;

  // Readiness & Compliance
  vaccinationStatus?: string;
  willingOnSite?: boolean;
  graveyardShiftReadiness?: boolean;
  employmentInterest?: string;

  // Character References
  characterReferences?: CharacterReference[];

  // Audio & Files
  hasVoiceRecording?: boolean;
  audioFileName?: string;
  resumeFileName?: string;

  // NHO / Pre-employment Requirements
  requirements?: PreEmploymentRequirements;

  // Drop-off Info
  dropOffDetails?: DropOffInfo;

  // Audit Logs
  history: Array<{ date: string; action: string; user: string }>;
}

// ==================== INITIAL SEED DATA ====================

const INITIAL_CANDIDATES: Candidate[] = [
  {
    id: "PUB-20260814062943-401RQV",
    name: "Robin One Piece",
    email: "crislead1@gmail.com",
    phone: "098550486661",
    appliedPosition: "Collections Specialist (CD - Collect)",
    department: "Call Center Operations",
    accountFit: "CD - Collect",
    sourcingChannel: "Applicant Lead (Walk-in)",
    recruiter: "Crister Canitan",
    applicationDate: "2026-08-13",
    status: "Silver Pool",
    isPublicEntry: true,
    lastActivityDate: "2026-08-14",
    notes: "Candidate converted and transferred from Inbound Applicant Leads Roster (Lead ID: LEAD-2026-0001). Initial Walk-in at Tagum City Center. Ready for financial collections wave.",

    address: "Tagum City, Davao del Norte, Philippines",
    dob: "1997-08-14",
    age: 29,
    gender: "Female",
    civilStatus: "Single",
    citizenship: "Filipino",

    workExperience: [
      {
        company: "Global Collections Inc.",
        position: "Inbound Collections Specialist",
        industry: "BPO / Call Center",
        tenure: "2 years 1 month",
        monthlySalary: "₱26,000",
        reasonForLeaving: "Sought career growth and competitive benefits at SiBS"
      }
    ],

    education: [
      {
        level: "College",
        schoolName: "University of Mindanao - Tagum",
        degreeCourse: "BS Business Administration",
        gradYear: "2021",
        address: "Mabini St, Tagum City"
      }
    ],

    skills: ["Financial Negotiation", "Debt Collection Standards", "Customer Engagement", "Voice Account Support"],
    languages: ["English (Conversational B2)", "Filipino (Native)", "Cebuano"],

    assessmentStatus: "Screened from Inbound Lead",
    testScore: "88/100 (Collections & Versant Passed)",
    overallResult: "Passed",
    assessmentRemarks: "Excellent customer demeanor and strong objection handling skills during intake.",

    vaccinationStatus: "Fully Vaccinated",
    willingOnSite: true,
    graveyardShiftReadiness: true,
    employmentInterest: "Full-Time On-Site Tagum",

    history: [
      {
        date: "2026-08-13",
        action: "Inbound Applicant Lead logged (Lead ID: LEAD-2026-0001) via Walk-in at Tagum City site by Crister Canitan. Account Fit: CD - Collect.",
        user: "Crister Canitan"
      },
      {
        date: "2026-08-13",
        action: "Application Form link sent to crislead1@gmail.com / 098550486661.",
        user: "Crister Canitan"
      },
      {
        date: "2026-08-14",
        action: "Lead converted and transferred to Talent Pool Master Archive (Talent Pool ID: PUB-20260814062943-401RQV). Status set to Silver Pool.",
        user: "Crister Canitan"
      },
      {
        date: "2026-08-14",
        action: "Profile synchronized with Sourcing Analytics and HR Pipeline.",
        user: "Crister Canitan"
      }
    ]
  },
  {
    id: "SIBS-CAN-9021",
    name: "Althea Rose Vergara",
    email: "althea.vergara@gmail.com",
    phone: "+63 917 123 4567",
    appliedPosition: "Healthcare Support Specialist",
    department: "Healthcare & Life Sciences",
    accountFit: "UnitedHealth Group",
    sourcingChannel: "Facebook Ads / Social",
    recruiter: "Alena Batacan",
    applicationDate: "2026-07-10",
    status: "Silver Pool",
    isPublicEntry: true,
    lastActivityDate: "2026-07-18",
    notes: "Passed final client interview for UHG Account. Slot filled due to capacity limit. Highly recommended for future healthcare waves.",
    
    address: "124 Matina Enclaves, Davao City, Davao del Sur",
    dob: "1998-05-14",
    age: 28,
    gender: "Female",
    civilStatus: "Single",
    citizenship: "Filipino",

    workExperience: [
      {
        company: "Teleperformance PH",
        position: "Customer Care Specialist",
        industry: "BPO / Call Center",
        tenure: "2 years 4 months",
        monthlySalary: "₱24,000",
        reasonForLeaving: "Career advancement in healthcare niche"
      },
      {
        company: "Davao Doctors Hospital",
        position: "Medical Records Assistant",
        industry: "Healthcare",
        tenure: "1 year 2 months",
        monthlySalary: "₱18,000",
        reasonForLeaving: "Transitioned to BPO industry"
      }
    ],

    education: [
      {
        level: "College",
        schoolName: "Ateneo de Davao University",
        degreeCourse: "BS Nursing",
        gradYear: "2020",
        address: "E. Jacinto St, Davao City"
      },
      {
        level: "Senior High",
        schoolName: "Davao City National High School",
        degreeCourse: "STEM Strand",
        gradYear: "2016",
        address: "F. Torres St, Davao City"
      }
    ],

    licenses: [
      {
        title: "Registered Nurse (PNLE)",
        licenseNo: "RN-0884920",
        rating: "84.60%",
        validity: "2028-05-14"
      }
    ],

    trainings: [
      {
        title: "HIPAA & US Healthcare Compliance Training",
        date: "2025-11-10",
        sponsor: "BPO Industry Association PH"
      }
    ],

    skills: ["Medical Terminology", "HIPAA Compliance", "SVAR 62/80", "Empathy & Active Listening", "EHR System Navigation"],
    languages: ["English (Native C1)", "Filipino", "Cebuano"],
    awards: ["Top Quality CSR - Q1 2025 (Teleperformance)"],
    affiliations: ["Philippine Nurses Association (PNA)"],

    assessmentStatus: "Completed",
    testScore: "88/100 (SVAR Level 6)",
    overallResult: "Passed",
    assessmentRemarks: "Flawless American accent modulation and strong medical vocabulary retention.",

    vaccinationStatus: "Fully Vaccinated + 2 Boosters",
    willingOnSite: true,
    graveyardShiftReadiness: true,
    employmentInterest: "Full-Time On-Site BPO",

    characterReferences: [
      {
        name: "Dr. Roberto Santos",
        company: "Davao Doctors Hospital",
        title: "Head of Medical Records",
        contactNumber: "+63 917 888 9900",
        email: "r.santos@ddh.com.ph"
      },
      {
        name: "Clarissa Ocampo",
        company: "Teleperformance",
        title: "Team Leader - Operations",
        contactNumber: "+63 920 444 5566",
        email: "clarissa.o@teleperformance.com"
      }
    ],

    hasVoiceRecording: true,
    audioFileName: "Althea_Vergara_VoiceIntro_SVAR.mp3",
    resumeFileName: "Althea_Rose_Vergara_CV_2026.pdf",

    requirements: {
      torDiploma: "Verified",
      nbiClearance: "Verified",
      medicalCheck: "Verified",
      bir2316: "Submitted",
      sssNo: "Verified",
      philHealthNo: "Verified",
      pagIbigNo: "Verified"
    },

    history: [
      { date: "2026-07-10", action: "Public web form application submitted", user: "Public Candidate Portal" },
      { date: "2026-07-15", action: "Passed Ops & Client Interview Assessment", user: "Clara G." },
      { date: "2026-07-18", action: "Moved to Silver Pool due to ramp capacity limit", user: "Alena Batacan" }
    ]
  },
  {
    id: "SIBS-CAN-9022",
    name: "John Benedict Reyes",
    email: "jb.reyes@yahoo.com",
    phone: "+63 918 234 5678",
    appliedPosition: "Technical Support Associate",
    department: "Information Technology & Telecom",
    accountFit: "Comcast Cable",
    sourcingChannel: "JobStreet / Online Job Portal",
    recruiter: "Mark Ramos",
    applicationDate: "2026-07-05",
    status: "Recyclable",
    isPublicEntry: false,
    lastActivityDate: "2026-07-19",
    notes: "Communications score 7.5/10. Technical score is solid (Linux & Router Debug). Needs 2 weeks accent modulation training. Re-evaluate for next wave.",

    address: "Block 12 Lot 5, Buhangin, Davao City",
    dob: "1999-11-20",
    age: 26,
    gender: "Male",
    civilStatus: "Single",
    citizenship: "Filipino",

    workExperience: [
      {
        company: "Concentrix PH",
        position: "Tier 1 Tech Support Representative",
        industry: "Telecom BPO",
        tenure: "1 year 8 months",
        monthlySalary: "₱22,000",
        reasonForLeaving: "Sought higher salary package"
      }
    ],

    education: [
      {
        level: "College",
        schoolName: "University of Southeastern Philippines",
        degreeCourse: "BS Information Technology",
        gradYear: "2022",
        address: "Inigo St, Obrero, Davao City"
      }
    ],

    skills: ["Linux Console", "TCP/IP Networking", "Router Configuration", "Hardware Troubleshooting"],
    languages: ["English (Conversational B2)", "Filipino", "Cebuano"],

    assessmentStatus: "Completed",
    testScore: "76/100 (Tech Assessment Passed)",
    overallResult: "Conditional",
    assessmentRemarks: "Strong technical skills; recommended for 5-day accent enhancement boot camp.",

    vaccinationStatus: "Fully Vaccinated",
    willingOnSite: true,
    graveyardShiftReadiness: true,
    employmentInterest: "Full-Time On-Site BPO",

    characterReferences: [
      {
        name: "Engr. Manuel Tan",
        company: "Concentrix PH",
        title: "Technical Support Manager",
        contactNumber: "+63 918 111 2233",
        email: "mtan@concentrix.com"
      }
    ],

    hasVoiceRecording: true,
    audioFileName: "JB_Reyes_TechSample.mp3",
    resumeFileName: "John_Benedict_Reyes_Resume.pdf",

    requirements: {
      torDiploma: "Verified",
      nbiClearance: "Submitted",
      medicalCheck: "Pending",
      bir2316: "Pending",
      sssNo: "Verified",
      philHealthNo: "Verified",
      pagIbigNo: "Verified"
    },

    history: [
      { date: "2026-07-05", action: "Manual candidate profile registered", user: "Alena Batacan" },
      { date: "2026-07-19", action: "Assessed and marked as Recyclable for next Tech wave", user: "Mark Ramos" }
    ]
  },
  {
    id: "SIBS-CAN-9023",
    name: "Maricar Salvatierra",
    email: "maricar.salva@outlook.com",
    phone: "+63 920 345 6789",
    appliedPosition: "Financial Account Expert",
    department: "Finance & Accounting BPO",
    accountFit: "Capital One Finance",
    sourcingChannel: "Employee Referral (Referrer: Juan D.)",
    recruiter: "Alena Batacan",
    applicationDate: "2026-07-12",
    status: "Hired / Active",
    isPublicEntry: true,
    lastActivityDate: "2026-07-20",
    notes: "Onboarded for Capital One wave starting August 1. High aptitude scores in General Ledger and Fraud Check.",

    address: "77 Pioneer Ave, Tagum City, Davao del Norte",
    dob: "1996-03-08",
    age: 30,
    gender: "Female",
    civilStatus: "Married",
    citizenship: "Filipino",

    workExperience: [
      {
        company: "JPMorgan Chase & Co.",
        position: "Financial Care Specialist",
        industry: "Financial Services BPO",
        tenure: "3 years 11 months",
        monthlySalary: "₱32,000",
        reasonForLeaving: "Relocated closer to family in Tagum"
      }
    ],

    education: [
      {
        level: "College",
        schoolName: "UM Tagum College",
        degreeCourse: "BS Accountancy",
        gradYear: "2018",
        address: "Mabini St, Tagum City"
      }
    ],

    skills: ["General Ledger", "Credit Fraud Check", "Excel Pivot Tables", "US Financial Regulations"],
    languages: ["English (Fluent C1)", "Filipino"],

    assessmentStatus: "Completed",
    testScore: "94/100 (Financial Aptitude Top 5%)",
    overallResult: "Passed",
    assessmentRemarks: "Exemplary financial analysis skills and customer resolution experience.",

    vaccinationStatus: "Fully Vaccinated + Booster",
    willingOnSite: true,
    graveyardShiftReadiness: true,
    employmentInterest: "Full-Time On-Site",

    hasVoiceRecording: true,
    audioFileName: "Maricar_Salvatierra_AudioIntro.wav",
    resumeFileName: "Maricar_Salvatierra_CV.pdf",

    requirements: {
      torDiploma: "Verified",
      nbiClearance: "Verified",
      medicalCheck: "Verified",
      bir2316: "Verified",
      sssNo: "Verified",
      philHealthNo: "Verified",
      pagIbigNo: "Verified"
    },

    history: [
      { date: "2026-07-12", action: "Public form application received via Referral", user: "System Portal" },
      { date: "2026-07-16", action: "Passed Final Interview & Mock Fraud Calls", user: "Sourcing Bot" },
      { date: "2026-07-20", action: "Status updated to Hired / Active", user: "Alena Batacan" }
    ]
  },
  {
    id: "SIBS-CAN-9024",
    name: "Dexter James Alcala",
    email: "dexter.alcala@gmail.com",
    phone: "+63 908 456 7890",
    appliedPosition: "Customer Service Representative",
    department: "Customer Operations",
    accountFit: "T-Mobile USA",
    sourcingChannel: "CSV Bulk Import Lead",
    recruiter: "Recruiter Admin",
    applicationDate: "2026-07-11",
    status: "Do Not Reprocess",
    isPublicEntry: false,
    lastActivityDate: "2026-07-14",
    notes: "Candidate failed background checks (undisclosed prior termination for serious breach of company policy). Marked Do Not Reprocess.",

    address: "Toril, Davao City",
    dob: "1997-08-22",
    age: 28,
    gender: "Male",
    civilStatus: "Single",
    citizenship: "Filipino",

    skills: ["Customer Service", "Retail Sales"],
    assessmentStatus: "Failed",
    testScore: "45/100",
    overallResult: "Failed",
    assessmentRemarks: "Red flags during Background Investigation (BGC).",

    hasVoiceRecording: false,
    resumeFileName: "Dexter_Alcala_Draft.pdf",

    history: [
      { date: "2026-07-11", action: "Profile uploaded via CSV bulk leads", user: "Recruiter Admin" },
      { date: "2026-07-14", action: "Background investigation returned red flag. Marked Do Not Reprocess.", user: "Security Officer" }
    ]
  },
  {
    id: "SIBS-CAN-9025",
    name: "Janelle Beatrice Santos",
    email: "janelle.santos@gmail.com",
    phone: "+63 927 567 8901",
    appliedPosition: "Healthcare Support Specialist",
    department: "Healthcare & Life Sciences",
    accountFit: "Humana Healthcare",
    sourcingChannel: "Public Application Form",
    recruiter: "Alena Batacan",
    applicationDate: "2026-07-09",
    status: "New Applicant",
    isPublicEntry: true,
    lastActivityDate: "2026-07-17",
    notes: "Fresh applicant submission via website landing form. High SVAR audio sample quality.",

    address: "Lanang, Davao City",
    dob: "2001-01-30",
    age: 25,
    gender: "Female",
    civilStatus: "Single",
    citizenship: "Filipino",

    education: [
      {
        level: "College",
        schoolName: "San Pedro College",
        degreeCourse: "BS Medical Technology",
        gradYear: "2023",
        address: "Guzman St, Davao City"
      }
    ],

    skills: ["Medical Terminology", "SVAR 60", "Customer Care"],
    languages: ["English (Fluent)", "Filipino"],

    assessmentStatus: "Pending",
    testScore: "Pending Initial Screener",

    hasVoiceRecording: true,
    audioFileName: "Janelle_Santos_Voice.mp3",
    resumeFileName: "Janelle_Santos_MedTech_CV.pdf",

    history: [
      { date: "2026-07-09", action: "Public form application submitted", user: "Public Portal" }
    ]
  },
  {
    id: "SIBS-CAN-9028",
    name: "Gabriel Mendoza",
    email: "gab.mendoza@gmail.com",
    phone: "+63 917 999 8877",
    appliedPosition: "Technical Support Associate",
    department: "Information Technology & Telecom",
    accountFit: "Apple iOS Account",
    sourcingChannel: "LinkedIn Direct Outreach",
    recruiter: "Mark Ramos",
    applicationDate: "2026-07-01",
    status: "Drop-off",
    isPublicEntry: false,
    lastActivityDate: "2026-07-16",
    notes: "Withdrew during Client Final Interview stage after receiving competing offer from local tech firm.",

    address: "Catalunan Grande, Davao City",
    dob: "1995-12-05",
    age: 30,
    gender: "Male",
    civilStatus: "Married",
    citizenship: "Filipino",

    skills: ["iOS Debugging", "Hardware Diagnostics", "Mac OS Support"],

    dropOffDetails: {
      dropOffStage: "Client Final Interview",
      dropOffReason: "Accepted Competing Offer Elsewhere",
      date: "2026-07-16",
      notes: "Candidate verbally informed recruiter that competing offer provided work-from-home arrangement."
    },

    history: [
      { date: "2026-07-01", action: "Sourced via LinkedIn and registered profile", user: "Mark Ramos" },
      { date: "2026-07-12", action: "Passed Technical Screening & SVAR", user: "Mark Ramos" },
      { date: "2026-07-16", action: "Marked as Drop-off: Withdrew at Client Interview stage", user: "Mark Ramos" }
    ]
  },
  {
    id: "SIBS-CAN-9029",
    name: "Kristine Mae Soriano",
    email: "kristine.soriano@yahoo.com",
    phone: "+63 922 444 3322",
    appliedPosition: "Healthcare Support Specialist",
    department: "Healthcare & Life Sciences",
    accountFit: "Humana Healthcare",
    sourcingChannel: "Walk-in Applicant",
    recruiter: "Clara G.",
    applicationDate: "2026-07-08",
    status: "Drop-off",
    isPublicEntry: false,
    lastActivityDate: "2026-07-15",
    notes: "Failed SVAR pronunciation check at Initial Screening stage. Invited to re-apply after accent training.",

    address: "Panabo City, Davao del Norte",
    dob: "2000-04-18",
    age: 26,
    gender: "Female",
    civilStatus: "Single",
    citizenship: "Filipino",

    skills: ["Medical Transcription", "Customer Service"],

    dropOffDetails: {
      dropOffStage: "Initial Screening (SVAR Check)",
      dropOffReason: "Failed SVAR / Language Assessment Threshold",
      date: "2026-07-15",
      notes: "SVAR score recorded as 48/80 (below 55 benchmark requirement)."
    },

    history: [
      { date: "2026-07-08", action: "Walk-in profile created at Davao Recruitment Center", user: "Clara G." },
      { date: "2026-07-15", action: "Marked as Drop-off: Failed SVAR threshold requirement", user: "Clara G." }
    ]
  }
];

export default function TalentPool({
  userEmail,
  onSwitchModule
}: {
  userEmail?: string;
  onSwitchModule?: (module: string) => void;
}) {
  // --- STATE with LocalStorage ---
  const [candidates, setCandidates] = useState<Candidate[]>(() =>
    loadFromLocalStorage(STORAGE_KEYS.TALENT_POOL, INITIAL_CANDIDATES)
  );

  // Sync to localStorage
  useEffect(() => {
    saveToLocalStorage(STORAGE_KEYS.TALENT_POOL, candidates);
    broadcastDataChange("talent_pool");
  }, [candidates]);

  // Listen for storage updates
  useEffect(() => {
    const handleStoreUpdate = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail?.channel === "talent_pool" || customEvent.detail?.channel === "all") {
        setCandidates(prev => {
          const fresh = loadFromLocalStorage(STORAGE_KEYS.TALENT_POOL, INITIAL_CANDIDATES);
          return JSON.stringify(prev) === JSON.stringify(fresh) ? prev : fresh;
        });
      }
    };
    window.addEventListener("sibs_store_update", handleStoreUpdate);
    return () => window.removeEventListener("sibs_store_update", handleStoreUpdate);
  }, []);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [positionFilter, setPositionFilter] = useState<string>("All");
  const [departmentFilter, setDepartmentFilter] = useState<string>("All");
  const [sourceFilter, setSourceFilter] = useState<string>("All");
  const [dateFromFilter, setDateFromFilter] = useState<string>("");
  const [dateToFilter, setDateToFilter] = useState<string>("");

  // Modals & Drawers
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [isMoveModalOpen, setIsMoveModalOpen] = useState(false);
  const [isPublicFormModalOpen, setIsPublicFormModalOpen] = useState(false);

  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [activeProfileTab, setActiveProfileTab] = useState<
    "personal" | "experience" | "skills" | "assessment" | "media" | "nho" | "history"
  >("personal");

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 7;

  // File Upload Reference
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Voice Intro Simulation Player State
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  // Status Change State
  const [newStatus, setNewStatus] = useState<Candidate["status"]>("Silver Pool");
  const [statusChangeRemarks, setStatusChangeRemarks] = useState("");

  // Move to Pipeline State
  const [targetAccount, setTargetAccount] = useState("");
  const [targetPositionRequirement, setTargetPositionRequirement] = useState("Healthcare Support Specialist (PRF-2026-041)");
  const [matchedEvaluationTemplate, setMatchedEvaluationTemplate] = useState("Healthcare Voice & Terminology Assessment Standard");
  const [moveNotes, setMoveNotes] = useState("");

  // Toast Helper
  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3800);
  };

  // --- DERIVED METRICS ---
  const metrics = useMemo(() => {
    const total = candidates.length;
    const silver = candidates.filter((c) => c.status === "Silver Pool").length;
    const recyclable = candidates.filter((c) => c.status === "Recyclable").length;
    const block = candidates.filter((c) => c.status === "Do Not Reprocess").length;
    const active = candidates.filter((c) => c.status === "Hired / Active").length;
    const publicCount = candidates.filter((c) => c.isPublicEntry).length;
    const dropOffCount = candidates.filter((c) => c.status === "Drop-off").length;

    return { total, silver, recyclable, block, active, publicCount, dropOffCount };
  }, [candidates]);

  // Distinct Filter Options
  const distinctPositions = useMemo(() => {
    const set = new Set<string>();
    candidates.forEach((c) => set.add(c.appliedPosition));
    return Array.from(set);
  }, [candidates]);

  const distinctDepartments = useMemo(() => {
    const set = new Set<string>();
    candidates.forEach((c) => {
      if (c.department) set.add(c.department);
    });
    return Array.from(set);
  }, [candidates]);

  const distinctSources = useMemo(() => {
    const set = new Set<string>();
    candidates.forEach((c) => {
      if (c.sourcingChannel) set.add(c.sourcingChannel);
    });
    return Array.from(set);
  }, [candidates]);

  // --- FILTERING LOGIC ---
  const activeCandidates = useMemo(() => {
    return candidates.filter((c) => c.status !== "Drop-off");
  }, [candidates]);

  const dropOffCandidates = useMemo(() => {
    return candidates.filter((c) => c.status === "Drop-off");
  }, [candidates]);

  const filteredCandidates = useMemo(() => {
    return candidates.filter((c) => {
      const q = searchTerm.toLowerCase();
      const matchesSearch =
        c.name.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.phone.toLowerCase().includes(q) ||
        c.appliedPosition.toLowerCase().includes(q) ||
        c.id.toLowerCase().includes(q) ||
        (c.department && c.department.toLowerCase().includes(q));

      const matchesStatus = statusFilter === "All" || c.status === statusFilter;
      const matchesPosition = positionFilter === "All" || c.appliedPosition === positionFilter;
      const matchesDepartment = departmentFilter === "All" || c.department === departmentFilter;
      const matchesSource = sourceFilter === "All" || c.sourcingChannel === sourceFilter;

      let matchesDate = true;
      if (dateFromFilter) {
        matchesDate = matchesDate && c.applicationDate >= dateFromFilter;
      }
      if (dateToFilter) {
        matchesDate = matchesDate && c.applicationDate <= dateToFilter;
      }

      return (
        matchesSearch &&
        matchesStatus &&
        matchesPosition &&
        matchesDepartment &&
        matchesSource &&
        matchesDate
      );
    });
  }, [
    candidates,
    searchTerm,
    statusFilter,
    positionFilter,
    departmentFilter,
    sourceFilter,
    dateFromFilter,
    dateToFilter
  ]);

  // Pagination bounds
  const paginatedCandidates = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredCandidates.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredCandidates, currentPage]);

  const totalPages = Math.ceil(filteredCandidates.length / itemsPerPage) || 1;

  // Clear filters
  const handleClearFilters = () => {
    setSearchTerm("");
    setStatusFilter("All");
    setPositionFilter("All");
    setDepartmentFilter("All");
    setSourceFilter("All");
    setDateFromFilter("");
    setDateToFilter("");
    setCurrentPage(1);
    triggerToast("Talent pool filters successfully cleared.");
  };

  // --- HANDLERS ---

  // 1. Download CSV template
  const handleDownloadTemplate = () => {
    const headers =
      "Candidate ID,Full Name,Email Address,Mobile Phone,Applied Position,Department,Sourcing Channel,Status,Key Skills,Notes\n";
    const sample1 =
      "SIBS-CAN-9101,Maria Clara Santos,maria.clara@gmail.com,+639171112233,Healthcare Support Specialist,Healthcare & Life Sciences,JobStreet,Silver Pool,\"Medical Billing, HIPAA, SVAR 60\",Passed interview waiting for wave slot\n";
    const sample2 =
      "SIBS-CAN-9102,Alexander Hamilton,alex.h@outlook.com,+639203334455,Financial Account Expert,Finance & Accounting,Facebook Ads,Recyclable,\"General Ledger, Fraud Check\",Needs 1 week accent training\n";

    const blob = new Blob([headers + sample1 + sample2], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "siblings_talent_pool_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    triggerToast("Talent pool CSV upload template downloaded successfully.");
  };

  // 2. CSV Upload Leads Action
  const handleCSVUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const text = evt.target?.result as string;
        const lines = text.split("\n");
        if (lines.length <= 1) {
          triggerToast("CSV file is empty or missing headers.");
          return;
        }

        const parsed: Candidate[] = [];
        let count = 0;

        for (let i = 1; i < lines.length; i++) {
          const line = lines[i].trim();
          if (!line) continue;

          const columns = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
          if (columns.length < 3) continue;

          const rawName = columns[1]?.replace(/"/g, "").trim() || columns[0]?.replace(/"/g, "").trim();
          const rawEmail = columns[2]?.replace(/"/g, "").trim() || `${rawName.toLowerCase().replace(" ", ".")}@imported.ph`;
          const rawPhone = columns[3]?.replace(/"/g, "").trim() || "+63 917 000 0000";
          const rawPos = columns[4]?.replace(/"/g, "").trim() || "Customer Service Representative";
          const rawDept = columns[5]?.replace(/"/g, "").trim() || "Customer Operations";
          const rawSource = columns[6]?.replace(/"/g, "").trim() || "CSV Bulk Leads Upload";
          const rawSkills = columns[8]?.replace(/"/g, "").trim() || "Customer Care";

          if (!rawName) continue;

          const skillsArray = rawSkills ? rawSkills.split(";").map((s) => s.trim()) : ["BPO Fundamentals"];

          const nextId = `SIBS-CAN-9${Math.floor(1000 + Math.random() * 9000)}`;
          const newCand: Candidate = {
            id: nextId,
            name: rawName,
            email: rawEmail,
            phone: rawPhone,
            appliedPosition: rawPos,
            department: rawDept,
            accountFit: "Pending Wave Alignment",
            sourcingChannel: rawSource,
            recruiter: userEmail || "Alena Batacan",
            applicationDate: new Date().toISOString().split("T")[0],
            status: "Silver Pool",
            isPublicEntry: false,
            lastActivityDate: new Date().toISOString().split("T")[0],
            notes: "Imported via bulk CSV candidate lead parsing engine.",
            skills: skillsArray,
            history: [
              {
                date: new Date().toISOString().split("T")[0],
                action: "Imported via CSV bulk leads template",
                user: userEmail || "Alena Batacan"
              }
            ]
          };

          parsed.push(newCand);
          count++;
        }

        if (parsed.length > 0) {
          setCandidates((prev) => [...parsed, ...prev]);
          triggerToast(`Successfully parsed and imported ${count} candidate profiles!`);
        } else {
          triggerToast("Could not find valid candidate records in the uploaded CSV file.");
        }
      } catch (err) {
        triggerToast("Failed to parse CSV file. Ensure the structure conforms to the template.");
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // 3. Restore Candidate from Drop-off
  const handleRestoreCandidate = (cand: Candidate) => {
    const updated = candidates.map((c) => {
      if (c.id === cand.id) {
        return {
          ...c,
          status: "Silver Pool" as const,
          lastActivityDate: new Date().toISOString().split("T")[0],
          history: [
            ...c.history,
            {
              date: new Date().toISOString().split("T")[0],
              action: `Restored from Drop-off section to Silver Pool for active reconsiderations.`,
              user: userEmail || "Alena Batacan"
            }
          ]
        };
      }
      return c;
    });

    setCandidates(updated);
    triggerToast(`Restored ${cand.name} (${cand.id}) to active Silver Pool!`);
  };

  // 4. Update Status Submit
  const handleStatusSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCandidate) return;

    const oldStatus = selectedCandidate.status;
    const updated = candidates.map((c) => {
      if (c.id === selectedCandidate.id) {
        const isDropOff = newStatus === "Drop-off";
        return {
          ...c,
          status: newStatus,
          lastActivityDate: new Date().toISOString().split("T")[0],
          dropOffDetails: isDropOff
            ? {
                dropOffStage: "Recruiter Manual Status Update",
                dropOffReason: statusChangeRemarks || "Marked as Drop-off during pool re-classification.",
                date: new Date().toISOString().split("T")[0],
                notes: statusChangeRemarks || "Status changed to Drop-off."
              }
            : c.dropOffDetails,
          history: [
            ...c.history,
            {
              date: new Date().toISOString().split("T")[0],
              action: `Status re-aligned: ${oldStatus} ➔ ${newStatus}. Remarks: ${
                statusChangeRemarks || "No remark provided"
              }`,
              user: userEmail || "Alena Batacan"
            }
          ]
        };
      }
      return c;
    });

    setCandidates(updated);

    const currentLive = updated.find((c) => c.id === selectedCandidate.id);
    if (currentLive) {
      setSelectedCandidate(currentLive);
    }

    setIsStatusModalOpen(false);
    setStatusChangeRemarks("");
    triggerToast(`Re-aligned ${selectedCandidate.name} pool status to ${newStatus}.`);
  };

  // 5. Move Candidate to Recruitment Pipeline Submit
  const handleMoveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCandidate) return;
    if (!targetAccount) {
      triggerToast("Please input or select a target corporate client account.");
      return;
    }

    const updated = candidates.map((c) => {
      if (c.id === selectedCandidate.id) {
        return {
          ...c,
          status: "Silver Pool" as const,
          accountFit: targetAccount,
          lastActivityDate: new Date().toISOString().split("T")[0],
          history: [
            ...c.history,
            {
              date: new Date().toISOString().split("T")[0],
              action: `Endorsed & moved from Talent Pool to Active Pipeline for ${targetAccount} (${targetPositionRequirement}). Evaluation form matched: ${matchedEvaluationTemplate}. Notes: ${
                moveNotes || "Initiated wave endorsement."
              }`,
              user: userEmail || "Alena Batacan"
            }
          ]
        };
      }
      return c;
    });

    setCandidates(updated);

    // Also push to Candidate Pipeline store in LocalStorage
    try {
      const storedPipeline = loadFromLocalStorage<any[]>(STORAGE_KEYS.PIPELINE_CANDIDATES, []);
      const exists = storedPipeline.some((p) => p.candidateId === selectedCandidate.id || p.id === selectedCandidate.id);
      if (!exists) {
        const newPipelineCandidate = {
          id: selectedCandidate.id,
          candidateId: selectedCandidate.id,
          candidateApplicationId: `APP-${Math.floor(1000 + Math.random() * 9000)}`,
          name: selectedCandidate.name,
          email: selectedCandidate.email,
          contactNumber: selectedCandidate.phone,
          source: selectedCandidate.sourcingChannel || "Talent Pool Endorsement",
          department: selectedCandidate.department || "Operations",
          account: targetAccount || selectedCandidate.accountFit || "General Operations",
          roleTitle: selectedCandidate.appliedPosition,
          currentStage: "Initial Screening",
          prfStatus: "Matched",
          assessmentStatus: "Not Taken",
          education: selectedCandidate.education?.[0]?.degreeCourse || "College Graduate",
          experienceYears: selectedCandidate.workExperience?.length ? `${selectedCandidate.workExperience.length} Previous Roles` : "Entry Level",
          expectedSalary: 25000,
          currentLocation: selectedCandidate.address || "Tagum City",
          timeline: [
            {
              id: `t-${Date.now()}`,
              stage: "Initial Screening",
              date: new Date().toISOString().replace("T", " ").substring(0, 16),
              updatedBy: userEmail || "Alena Batacan",
              reason: `Endorsed from Talent Pool to ${targetAccount}. Form: ${matchedEvaluationTemplate}`
            }
          ],
          createdAt: new Date().toISOString().split("T")[0]
        };
        saveToLocalStorage(STORAGE_KEYS.PIPELINE_CANDIDATES, [newPipelineCandidate, ...storedPipeline]);
        broadcastDataChange("pipeline");
      }
    } catch (err) {
      console.error("Failed to seed pipeline candidate from Talent Pool:", err);
    }

    const currentLive = updated.find((c) => c.id === selectedCandidate.id);
    if (currentLive) {
      setSelectedCandidate(currentLive);
    }

    setIsMoveModalOpen(false);
    setTargetAccount("");
    setMoveNotes("");
    triggerToast(
      `Pushed ${selectedCandidate.name} to active pipeline wave for ${targetAccount}!`
    );
  };

  return (
    <div className="flex-1 flex flex-col space-y-4 sm:space-y-5 2xl:space-y-6 select-none relative pb-8 font-jakarta" id="talent-pool-root">
      {/* Toast Alert Banner */}
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

      {/* ==================== 1. TOP ACTION BAR & HEADER ==================== */}
      <section className="relative overflow-hidden rounded-2xl border border-[#DCE5EF] bg-white px-5 py-5 shadow-[0_8px_22px_rgba(4,44,81,0.05)] sm:px-6 2xl:px-7 2xl:py-6">
        <div className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-[#042C51] via-[#1A5A8A] to-[#FF5C28]" />

        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="min-w-0">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-100 bg-[#E9F0FC] px-2.5 py-1 text-[9px] font-black uppercase tracking-wide text-[#042C51]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#FF5C28]" />
                Recruitment View
              </span>
            </div>

            <h1 className="text-xl font-black tracking-tight text-[#042C51] sm:text-2xl 2xl:text-[28px]">
              Talent Pool / Candidate Database
            </h1>
            <p className="mt-1 max-w-4xl text-xs font-medium leading-5 text-[#667085] 2xl:text-[13px]">
              Store reusable candidate master profiles, import leads from CSV, and move qualified candidates to the pipeline.
            </p>
          </div>

          <div className="flex w-full flex-wrap items-center gap-2 xl:w-auto xl:justify-end">
            <button
              type="button"
              onClick={() => triggerToast("Database candidate pool synced and validated.")}
              className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[#D7E0EA] bg-white text-[#475467] transition hover:border-[#FF5C28]/40 hover:bg-[#FFF8F5] hover:text-[#FF5C28]"
              title="Refresh Pool Database"
              aria-label="Refresh Pool Database"
            >
              <RefreshCw className="h-4 w-4" />
            </button>

            <button
              type="button"
              onClick={() => setIsPublicFormModalOpen(true)}
              className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border border-[#D7E0EA] bg-white px-3.5 text-xs font-extrabold text-[#042C51] transition hover:border-[#FF5C28]/40 hover:bg-[#FFF8F5] hover:text-[#FF5C28]"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              Public Form
            </button>

            <button
              type="button"
              onClick={handleDownloadTemplate}
              className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border border-[#D7E0EA] bg-white px-3.5 text-xs font-extrabold text-[#042C51] transition hover:border-[#FF5C28]/40 hover:bg-[#FFF8F5] hover:text-[#FF5C28]"
            >
              <Download className="h-3.5 w-3.5" />
              CSV Template
            </button>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleCSVUpload}
              accept=".csv"
              className="hidden"
            />

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border border-[#D7E0EA] bg-white px-3.5 text-xs font-extrabold text-[#042C51] transition hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700"
            >
              <Upload className="h-3.5 w-3.5" />
              Upload CSV
            </button>

            <button
              type="button"
              onClick={() => setIsAddModalOpen(true)}
              className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg bg-[#FF5C28] px-4 text-xs font-extrabold text-white shadow-sm transition hover:bg-[#E95324]"
            >
              <Plus className="h-4 w-4" />
              Add Candidate
            </button>
          </div>
        </div>
      </section>

      {/* ==================== 2. SUMMARY STATISTICS BAR (TalentPoolStats) ==================== */}
      <section className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        {[
          {
            title: "Total Candidates",
            value: metrics.total,
            description: "Database profiles",
            Icon: Users,
            labelClass: "text-[#042C51]",
            iconClass: "bg-[#EAF0F7] text-[#042C51]",
          },
          {
            title: "Silver Pool",
            value: metrics.silver,
            description: "Passed, no opening",
            Icon: UserCheck,
            labelClass: "text-indigo-700",
            iconClass: "bg-indigo-50 text-indigo-700",
          },
          {
            title: "Recyclable",
            value: metrics.recyclable,
            description: "Can be reconsidered",
            Icon: RotateCcw,
            labelClass: "text-amber-700",
            iconClass: "bg-amber-50 text-amber-700",
          },
          {
            title: "Do Not Reprocess",
            value: metrics.block,
            description: "Not fit",
            Icon: AlertTriangle,
            labelClass: "text-red-700",
            iconClass: "bg-red-50 text-red-700",
          },
          {
            title: "Hired / Active",
            value: metrics.active,
            description: "Converted",
            Icon: Briefcase,
            labelClass: "text-emerald-700",
            iconClass: "bg-emerald-50 text-emerald-700",
          },
          {
            title: "Public Entries",
            value: metrics.publicCount,
            description: "From outside form",
            Icon: ExternalLink,
            labelClass: "text-indigo-700",
            iconClass: "bg-indigo-50 text-indigo-700",
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

      {/* ==================== 3 & 4. CANDIDATE DIRECTORY / FILTERS / TABLE ==================== */}
      <section className="overflow-hidden rounded-2xl border border-[#DCE5EF] bg-white shadow-[0_8px_22px_rgba(4,44,81,0.04)]">
        <div className="border-b border-[#E6ECF2] p-4 sm:p-5 2xl:p-6">
          <h2 className="text-sm font-extrabold text-[#042C51] 2xl:text-base">
            Candidate Directory
          </h2>
          <p className="mt-1 text-xs font-semibold text-[#667085]">
            Search and narrow the reusable candidate database.
          </p>

          <div className="mt-4 grid grid-cols-1 gap-3 lg:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-7">
            <div className="min-w-0 xl:col-span-2 2xl:col-span-2">
              <label className="mb-1.5 block text-[10px] font-extrabold text-[#101828]">Search</label>
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#98A2B3]" />
                <input
                  value={searchTerm}
                  onChange={(event) => {
                    setSearchTerm(event.target.value);
                    setCurrentPage(1);
                  }}
                  placeholder="Search candidate, email, phone, position, location..."
                  className="h-10 w-full rounded-lg border border-[#DDE5EE] bg-[#F8FAFC] pl-9 pr-3 text-xs font-semibold text-[#042C51] outline-none transition placeholder:text-[#8DA2BD] hover:border-[#C9D6E4] focus:border-[#FF5C28] focus:bg-white focus:ring-2 focus:ring-[#FF5C28]/10"
                />
              </div>
            </div>

            <div className="min-w-0">
              <label className="mb-1.5 block text-[10px] font-extrabold text-[#101828]">Applied Position</label>
              <select
                value={positionFilter}
                onChange={(event) => {
                  setPositionFilter(event.target.value);
                  setCurrentPage(1);
                }}
                className="h-10 w-full rounded-lg border border-[#DDE5EE] bg-[#F8FAFC] px-3 text-xs font-extrabold text-[#042C51] outline-none transition hover:border-[#C9D6E4] focus:border-[#FF5C28] focus:bg-white focus:ring-2 focus:ring-[#FF5C28]/10"
              >
                <option value="All">All Positions</option>
                {distinctPositions.map((position) => (
                  <option key={position} value={position}>{position}</option>
                ))}
              </select>
            </div>

            <div className="min-w-0">
              <label className="mb-1.5 block text-[10px] font-extrabold text-[#101828]">Status</label>
              <select
                value={statusFilter}
                onChange={(event) => {
                  setStatusFilter(event.target.value);
                  setCurrentPage(1);
                }}
                className="h-10 w-full rounded-lg border border-[#DDE5EE] bg-[#F8FAFC] px-3 text-xs font-extrabold text-[#042C51] outline-none transition hover:border-[#C9D6E4] focus:border-[#FF5C28] focus:bg-white focus:ring-2 focus:ring-[#FF5C28]/10"
              >
                <option value="All">All Status</option>
                <option value="New Applicant">New Applicant</option>
                <option value="Silver Pool">Silver Pool</option>
                <option value="Recyclable">Recyclable</option>
                <option value="Do Not Reprocess">Do Not Reprocess</option>
                <option value="Hired / Active">Hired / Active</option>
                <option value="Initial Screening">Initial Screening</option>
                <option value="Drop-off">Drop-off</option>
              </select>
            </div>

            <div className="min-w-0">
              <label className="mb-1.5 block text-[10px] font-extrabold text-[#101828]">Department</label>
              <select
                value={departmentFilter}
                onChange={(event) => {
                  setDepartmentFilter(event.target.value);
                  setCurrentPage(1);
                }}
                className="h-10 w-full rounded-lg border border-[#DDE5EE] bg-[#F8FAFC] px-3 text-xs font-extrabold text-[#042C51] outline-none transition hover:border-[#C9D6E4] focus:border-[#FF5C28] focus:bg-white focus:ring-2 focus:ring-[#FF5C28]/10"
              >
                <option value="All">All Departments</option>
                {distinctDepartments.map((department) => (
                  <option key={department} value={department}>{department}</option>
                ))}
              </select>
            </div>

            <div className="min-w-0">
              <label className="mb-1.5 block text-[10px] font-extrabold text-[#101828]">Source</label>
              <select
                value={sourceFilter}
                onChange={(event) => {
                  setSourceFilter(event.target.value);
                  setCurrentPage(1);
                }}
                className="h-10 w-full rounded-lg border border-[#DDE5EE] bg-[#F8FAFC] px-3 text-xs font-extrabold text-[#042C51] outline-none transition hover:border-[#C9D6E4] focus:border-[#FF5C28] focus:bg-white focus:ring-2 focus:ring-[#FF5C28]/10"
              >
                <option value="All">All Sources</option>
                {distinctSources.map((source) => (
                  <option key={source} value={source}>{source}</option>
                ))}
              </select>
            </div>

            <div className="flex items-end">
              <button
                type="button"
                onClick={handleClearFilters}
                className="inline-flex h-10 w-full items-center justify-center gap-1.5 rounded-lg border border-[#DDE5EE] bg-white px-4 text-xs font-extrabold text-[#667085] transition hover:border-[#FF5C28]/40 hover:bg-[#FFF8F5] hover:text-[#FF5C28]"
              >
                <Filter className="h-3.5 w-3.5" />
                Clear
              </button>
            </div>
          </div>

          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1.5 block text-[10px] font-extrabold text-[#101828]">Applied Date From</span>
              <input
                type="date"
                value={dateFromFilter}
                onChange={(event) => setDateFromFilter(event.target.value)}
                className="h-10 w-full rounded-lg border border-[#DDE5EE] bg-[#F8FAFC] px-3 text-xs font-semibold text-[#042C51] outline-none focus:border-[#FF5C28] focus:bg-white focus:ring-2 focus:ring-[#FF5C28]/10"
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-[10px] font-extrabold text-[#101828]">Applied Date To</span>
              <input
                type="date"
                value={dateToFilter}
                onChange={(event) => setDateToFilter(event.target.value)}
                className="h-10 w-full rounded-lg border border-[#DDE5EE] bg-[#F8FAFC] px-3 text-xs font-semibold text-[#042C51] outline-none focus:border-[#FF5C28] focus:bg-white focus:ring-2 focus:ring-[#FF5C28]/10"
              />
            </label>
          </div>
        </div>

        <div className="p-4 sm:p-5 2xl:p-6">
          <div className="overflow-hidden rounded-xl border border-[#E6ECF2] bg-white">
            <div className="flex overflow-x-auto border-b border-[#E6ECF2] bg-[#F8FAFC] px-4 pt-3">
              {[
                { value: "All", label: "All", count: metrics.total },
                { value: "New Applicant", label: "New Applicant", count: candidates.filter((c) => c.status === "New Applicant").length },
                { value: "Silver Pool", label: "Silver Pool", count: metrics.silver },
                { value: "Recyclable", label: "Recyclable", count: metrics.recyclable },
                { value: "Do Not Reprocess", label: "Do Not Reprocess", count: metrics.block },
                { value: "Hired / Active", label: "Hired / Active", count: metrics.active },
                { value: "Drop-off", label: "Drop Off", count: metrics.dropOffCount },
              ].map((tab) => (
                <button
                  key={tab.value}
                  type="button"
                  onClick={() => {
                    setStatusFilter(tab.value);
                    setCurrentPage(1);
                  }}
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
              <table className="w-full min-w-[1180px] table-fixed border-collapse text-left">
                <thead className="sticky top-0 z-10 bg-[#F8FAFC]">
                  <tr className="border-b border-[#E6ECF2]">
                    <th className="w-[18%] px-4 py-3.5 text-[10px] font-extrabold uppercase tracking-normal text-[#667085]">Candidate</th>
                    <th className="w-[19%] px-4 py-3.5 text-[10px] font-extrabold uppercase tracking-normal text-[#667085]">Contact</th>
                    <th className="w-[23%] px-4 py-3.5 text-[10px] font-extrabold uppercase tracking-normal text-[#667085]">Applied Position</th>
                    <th className="w-[18%] px-4 py-3.5 text-[10px] font-extrabold uppercase tracking-normal text-[#667085]">Source / Recruiter</th>
                    <th className="w-[10%] px-4 py-3.5 text-center text-[10px] font-extrabold uppercase tracking-normal text-[#667085]">Status</th>
                    <th className="w-[7%] px-4 py-3.5 text-center text-[10px] font-extrabold uppercase tracking-normal text-[#667085]">Activity</th>
                    <th className="w-[5%] px-4 py-3.5 text-right text-[10px] font-extrabold uppercase tracking-normal text-[#667085]">Actions</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-[#E6ECF2] bg-white">
                  {paginatedCandidates.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-5 py-14 text-center">
                        <Users className="mx-auto h-7 w-7 text-[#98A2B3]" />
                        <p className="mt-2 text-sm font-extrabold text-[#042C51]">No candidate profiles found</p>
                        <p className="mt-1 text-xs font-semibold text-[#667085]">Try changing or clearing the current search filters.</p>
                      </td>
                    </tr>
                  ) : (
                    paginatedCandidates.map((cand) => (
                      <tr
                        key={cand.id}
                        onClick={() => {
                          setSelectedCandidate(cand);
                          setActiveProfileTab("personal");
                          setIsProfileModalOpen(true);
                        }}
                        className={`group cursor-pointer transition-colors hover:bg-[#F8FAFC] ${
                          selectedCandidate?.id === cand.id ? "bg-[#FFF9F6]" : ""
                        }`}
                      >
                        <td className="px-4 py-2.5 align-middle">
                          <div className="min-w-0">
                            <div className="flex min-w-0 items-center gap-2">
                              <p className="truncate text-xs font-extrabold text-[#042C51]">{cand.name}</p>
                              <span
                                className={`shrink-0 rounded border px-1.5 py-0.5 text-[8.5px] font-extrabold uppercase ${
                                  cand.isPublicEntry
                                    ? "border-purple-200 bg-purple-50 text-purple-700"
                                    : "border-green-200 bg-green-50 text-green-700"
                                }`}
                              >
                                {cand.isPublicEntry ? "Public" : "Lead"}
                              </span>
                            </div>
                            <p className="mt-0.5 truncate font-mono text-[10px] font-semibold tabular-nums text-[#667085]">
                              Talent Pool ID: {cand.id}
                            </p>
                          </div>
                        </td>

                        <td className="px-4 py-2.5 align-middle">
                          <p className="truncate text-xs font-semibold text-[#344054]">{cand.email}</p>
                          <p className="mt-0.5 truncate text-[10px] font-semibold text-[#667085]">{cand.phone}</p>
                        </td>

                        <td className="px-4 py-2.5 align-middle">
                          <p className="truncate text-xs font-bold text-[#042C51]">{cand.appliedPosition}</p>
                          <p className="mt-0.5 truncate text-[10px] font-medium text-[#667085]">
                            {cand.department || "—"} • Final Account: {cand.accountFit || "—"}
                          </p>
                        </td>

                        <td className="px-4 py-2.5 align-middle">
                          <p className="truncate text-xs font-semibold text-[#344054]">{cand.sourcingChannel}</p>
                          <p className="mt-0.5 truncate text-[10px] font-medium text-[#667085]">Recruiter: {cand.recruiter}</p>
                        </td>

                        <td className="px-4 py-2.5 text-center align-middle">
                          <span
                            className={`mx-auto inline-flex max-w-[190px] items-center justify-center rounded-lg border px-2.5 py-1 text-[10px] font-extrabold leading-tight ${
                              cand.status === "Silver Pool"
                                ? "border-indigo-200 bg-indigo-50 text-indigo-700"
                                : cand.status === "Recyclable"
                                  ? "border-amber-200 bg-amber-50 text-amber-700"
                                  : cand.status === "Do Not Reprocess"
                                    ? "border-red-200 bg-red-50 text-red-700"
                                    : cand.status === "Hired / Active"
                                      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                                      : cand.status === "Drop-off"
                                        ? "border-slate-200 bg-slate-100 text-slate-700"
                                        : "border-blue-200 bg-blue-50 text-blue-700"
                            }`}
                          >
                            {cand.status}
                          </span>
                        </td>

                        <td className="px-4 py-2.5 text-center align-middle">
                          <p className="whitespace-nowrap text-xs font-semibold tabular-nums text-[#475467]">
                            {cand.lastActivityDate || cand.applicationDate}
                          </p>
                        </td>

                        <td className="px-4 py-2.5 text-right align-middle" onClick={(event) => event.stopPropagation()}>
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedCandidate(cand);
                                setActiveProfileTab("personal");
                                setIsProfileModalOpen(true);
                              }}
                              className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-[#D7DEE8] bg-white text-[#042C51] transition hover:border-[#FF5C28]/40 hover:bg-[#FFF8F5] hover:text-[#FF5C28]"
                              title="View Candidate"
                            >
                              <User className="h-3.5 w-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedCandidate(cand);
                                setTargetAccount(
                                  cand.accountFit && cand.accountFit !== "Pending Wave Alignment"
                                    ? cand.accountFit
                                    : "UnitedHealth Group"
                                );
                                setIsMoveModalOpen(true);
                              }}
                              className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-700 transition hover:bg-emerald-100"
                              title="Move to Pipeline"
                            >
                              <Send className="h-3.5 w-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedCandidate(cand);
                                setNewStatus(cand.status);
                                setIsStatusModalOpen(true);
                              }}
                              className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-[#D7DEE8] bg-white text-[#667085] transition hover:border-[#FF5C28]/40 hover:bg-[#FFF8F5] hover:text-[#FF5C28]"
                              title="Update Candidate Status"
                            >
                              <RefreshCw className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex flex-col gap-3 border-t border-[#E6ECF2] bg-white px-4 py-3 text-xs text-[#667085] sm:flex-row sm:items-center sm:justify-between">
              <span className="font-semibold">
                Showing {paginatedCandidates.length} of {filteredCandidates.length} candidate profiles
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                  className="inline-flex h-8 items-center justify-center gap-1 rounded-lg border border-[#D7DEE8] bg-white px-3 font-extrabold text-[#475467] transition hover:bg-[#F8FAFC] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                  Previous
                </button>
                <span className="inline-flex h-8 min-w-8 items-center justify-center rounded-lg bg-[#042C51] px-2.5 font-extrabold text-white">
                  {currentPage}
                </span>
                <button
                  type="button"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                  className="inline-flex h-8 items-center justify-center gap-1 rounded-lg border border-[#D7DEE8] bg-white px-3 font-extrabold text-[#475467] transition hover:bg-[#F8FAFC] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Next
                  <ChevronsRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== 5. DROP-OFF CANDIDATES SECTION ==================== */}
      <section className="overflow-hidden rounded-2xl border border-[#E6ECF2] bg-white shadow-[0_8px_22px_rgba(4,44,81,0.04)]">
        <div className="flex items-center justify-between gap-4 border-b border-[#E6ECF2] px-4 py-4 sm:px-5">
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-red-100 bg-red-50 text-red-700">
              <AlertTriangle className="h-4 w-4" />
            </span>
            <div className="min-w-0">
              <h2 className="text-sm font-extrabold text-[#042C51]">Drop-off List</h2>
              <p className="mt-0.5 text-xs font-semibold text-[#667085]">
                Review candidates removed from the Talent Pool or Candidate Pipeline.
              </p>
            </div>
          </div>
          <span className="inline-flex h-8 min-w-8 items-center justify-center rounded-full border border-red-100 bg-red-50 px-3 text-xs font-extrabold text-red-700">
            {dropOffCandidates.length}
          </span>
        </div>

        <div className="p-4 sm:p-5">
          {dropOffCandidates.length === 0 ? (
            <div className="rounded-xl border border-dashed border-[#D9E2EC] bg-[#F8FAFC] px-5 py-10 text-center">
              <AlertTriangle className="mx-auto h-6 w-6 text-[#98A2B3]" />
              <p className="mt-2 text-xs font-extrabold text-[#042C51]">No drop-off candidates</p>
              <p className="mt-1 text-xs font-semibold text-[#667085]">
                Candidates moved to Drop-off will appear here.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-[#E6ECF2] bg-white">
              <table className="w-full min-w-[1120px] table-fixed border-separate border-spacing-0 text-left">
                <thead className="bg-[#F8FAFC]">
                  <tr className="border-b border-[#E6ECF2]">
                    <th className="w-[20%] px-4 py-3.5 text-[10px] font-extrabold uppercase text-[#667085]">Candidate</th>
                    <th className="w-[22%] px-4 py-3.5 text-[10px] font-extrabold uppercase text-[#667085]">Applied Position</th>
                    <th className="w-[20%] px-4 py-3.5 text-[10px] font-extrabold uppercase text-[#667085]">Location / Final Account</th>
                    <th className="w-[12%] px-4 py-3.5 text-center text-[10px] font-extrabold uppercase text-[#667085]">Status</th>
                    <th className="w-[18%] px-4 py-3.5 text-[10px] font-extrabold uppercase text-[#667085]">Drop-off Reason</th>
                    <th className="w-[8%] px-4 py-3.5 text-right text-[10px] font-extrabold uppercase text-[#667085]">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E6ECF2]">
                  {dropOffCandidates.map((cand) => (
                    <tr
                      key={cand.id}
                      onClick={() => {
                        setSelectedCandidate(cand);
                        setActiveProfileTab("personal");
                        setIsProfileModalOpen(true);
                      }}
                      className="cursor-pointer transition hover:bg-[#FFF9F6]"
                    >
                      <td className="px-4 py-3 align-middle">
                        <p className="truncate text-xs font-extrabold text-[#042C51]">{cand.name}</p>
                        <p className="mt-0.5 truncate text-[11px] font-semibold text-[#667085]">{cand.id}</p>
                      </td>
                      <td className="px-4 py-3 align-middle">
                        <p className="truncate text-xs font-bold text-[#344054]">{cand.appliedPosition}</p>
                        <p className="mt-0.5 truncate text-[11px] font-semibold text-[#667085]">{cand.department || "—"}</p>
                      </td>
                      <td className="px-4 py-3 align-middle">
                        <p className="truncate text-xs font-semibold text-[#344054]">{cand.address || "—"}</p>
                        <p className="mt-0.5 truncate text-[11px] font-semibold text-[#667085]">
                          Final Account: {cand.accountFit || "—"}
                        </p>
                      </td>
                      <td className="px-4 py-3 text-center align-middle">
                        <span className="inline-flex rounded-lg border border-red-100 bg-red-50 px-2.5 py-1 text-[10px] font-extrabold text-red-700">
                          {cand.dropOffDetails?.dropOffStage || "Drop Off"}
                        </span>
                      </td>
                      <td className="px-4 py-3 align-middle">
                        <p className="line-clamp-2 text-xs font-semibold leading-5 text-[#344054]">
                          {cand.dropOffDetails?.dropOffReason || cand.notes}
                        </p>
                        <p className="mt-0.5 text-[11px] font-semibold text-[#667085]">
                          {cand.dropOffDetails?.date || cand.lastActivityDate}
                        </p>
                      </td>
                      <td className="px-4 py-3 text-right align-middle" onClick={(event) => event.stopPropagation()}>
                        <button
                          type="button"
                          onClick={() => handleRestoreCandidate(cand)}
                          className="inline-flex h-8 items-center justify-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-3 text-[10px] font-extrabold text-emerald-700 transition hover:bg-emerald-100"
                        >
                          <RotateCcw className="h-3.5 w-3.5" />
                          Restore
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>

      {/* ==================== 6. MODALS ==================== */}

      {/* MODAL 1: CANDIDATE PROFILE VIEW MODAL (CandidateProfileModal) */}
      <CandidateProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        candidate={selectedCandidate}
        onUpdateCandidate={(updated) => {
          setCandidates((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
          setSelectedCandidate(updated);
        }}
        onMoveToPipeline={(cand) => {
          setSelectedCandidate(cand);
          setTargetAccount(cand.accountFit && cand.accountFit !== "Pending Wave Alignment" ? cand.accountFit : "UnitedHealth Group");
          setIsMoveModalOpen(true);
        }}
        onChangeStatus={(cand) => {
          setSelectedCandidate(cand);
          setNewStatus(cand.status);
          setIsStatusModalOpen(true);
        }}
      />

      {/* MODAL 2: ADD CANDIDATE MODAL (AddCandidateModal) */}
      <AddCandidateModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSaveCandidate={(newCandidate) => {
          setCandidates((prev) => [newCandidate, ...prev]);
          triggerToast(`Candidate ${newCandidate.name} added to Talent Pool!`);
        }}
        userEmail={userEmail}
      />

      {/* MODAL 3: MOVE TO PIPELINE MODAL (MoveToPipelineModal) */}
      <AnimatePresence>
        {isMoveModalOpen && selectedCandidate && (
          <div className="fixed inset-0 z-[10003] flex h-dvh items-center justify-center bg-[#042C51]/60 p-3 backdrop-blur-sm sm:p-4 font-jakarta">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative flex w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-[#D6DEE8] bg-white shadow-2xl"
            >
              <div className="shrink-0 bg-[#042C51] px-4 py-3 text-white sm:px-6">
                <div className="flex items-center gap-2">
                  <Send className="w-5 h-5 text-[#FF5C28]" />
                  <div>
                    <h2 className="text-sm font-black">Move Candidate to Active Pipeline</h2>
                    <p className="text-[10px] text-slate-300">Endorse {selectedCandidate.name} to active PRF position requirement</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsMoveModalOpen(false)}
                  className="p-1 rounded-lg bg-white/10 hover:bg-white/25 text-white cursor-pointer"
                >
                  <X className="w-4.5 h-4.5" />
                </button>
              </div>

              <form onSubmit={handleMoveSubmit} className="space-y-4 bg-[#F7F9FC] p-4 text-xs sm:p-5">
                {/* Position Selection */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Target Active PRF Requirement Position *</label>
                  <select
                    value={targetPositionRequirement}
                    onChange={(e) => {
                      setTargetPositionRequirement(e.target.value);
                      if (e.target.value.includes("Healthcare")) {
                        setMatchedEvaluationTemplate("Healthcare Voice & Terminology Assessment Standard");
                      } else if (e.target.value.includes("Tech")) {
                        setMatchedEvaluationTemplate("Technical Debugging & Network Troubleshooting Form");
                      } else {
                        setMatchedEvaluationTemplate("Customer Care Communication & Empathy Standard");
                      }
                    }}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-800"
                  >
                    <option value="Healthcare Support Specialist (PRF-2026-041)">Healthcare Support Specialist (PRF-2026-041)</option>
                    <option value="Technical Support Associate (PRF-2026-042)">Technical Support Associate (PRF-2026-042)</option>
                    <option value="Financial Account Expert (PRF-2026-043)">Financial Account Expert (PRF-2026-043)</option>
                  </select>
                </div>

                {/* Interview Form Matching */}
                <div className="p-3 bg-blue-50/80 rounded-xl border border-blue-200 text-xs space-y-1">
                  <span className="text-[9.5px] font-extrabold text-blue-900 uppercase block">
                    ✓ Matched Interview Evaluation Form
                  </span>
                  <p className="font-bold text-[#042C51]">{matchedEvaluationTemplate}</p>
                  <p className="text-[10px] text-slate-600">
                    Automatically pairs candidate with this assessment rubric when transferred into pipeline.
                  </p>
                </div>

                {/* Target Corporate Client Account */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Target Corporate Client Account *</label>
                  <input
                    type="text"
                    required
                    value={targetAccount}
                    onChange={(e) => setTargetAccount(e.target.value)}
                    placeholder="e.g. UnitedHealth Group"
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold font-mono text-slate-800"
                  />
                </div>

                {/* Endorsement Notes */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Endorsement Remarks for Hiring Team</label>
                  <textarea
                    rows={2}
                    value={moveNotes}
                    onChange={(e) => setMoveNotes(e.target.value)}
                    placeholder="Provide endorsement notes regarding candidate competencies..."
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 resize-none"
                  />
                </div>

                <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsMoveModalOpen(false)}
                    className="px-3 py-1.5 bg-slate-100 text-slate-700 font-bold rounded-lg cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-lg cursor-pointer"
                  >
                    Initiate Endorsement
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 4: UPDATE STATUS MODAL (UpdateStatusModal) */}
      <AnimatePresence>
        {isStatusModalOpen && selectedCandidate && (
          <div className="fixed inset-0 z-[10003] flex h-dvh items-center justify-center bg-[#042C51]/60 p-3 backdrop-blur-sm sm:p-4 font-jakarta">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative flex w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-[#D6DEE8] bg-white shadow-2xl"
            >
              <div className="shrink-0 bg-[#042C51] px-4 py-3 text-white sm:px-6">
                <div className="flex items-center gap-2">
                  <Tag className="w-5 h-5 text-[#FF5C28]" />
                  <div>
                    <h2 className="text-sm font-black">Update Candidate Status</h2>
                    <p className="text-[10px] text-slate-300">Modifying classification status for {selectedCandidate.name}</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsStatusModalOpen(false)}
                  className="p-1 rounded-lg bg-white/10 hover:bg-white/25 text-white cursor-pointer"
                >
                  <X className="w-4.5 h-4.5" />
                </button>
              </div>

              <form onSubmit={handleStatusSubmit} className="space-y-4 bg-[#F7F9FC] p-4 text-xs sm:p-5">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Current Status</label>
                  <p className="font-extrabold text-[#042C51] bg-slate-100 p-2 rounded-lg border border-slate-200">
                    {selectedCandidate.status}
                  </p>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">New Target Status Category *</label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value as Candidate["status"])}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-800"
                  >
                    <option value="New Applicant">New Applicant</option>
                    <option value="Silver Pool">Silver Pool (Passed, waiting slots)</option>
                    <option value="Recyclable">Recyclable (Re-evaluate later)</option>
                    <option value="Do Not Reprocess">Do Not Reprocess (Unfit / Failed BGC)</option>
                    <option value="Hired / Active">Hired / Active (Placed)</option>
                    <option value="Initial Screening">Initial Screening</option>
                    <option value="Drop-off">Drop-off (Withdrawn / Failed)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Update Notes / Audit Remarks</label>
                  <textarea
                    rows={2}
                    value={statusChangeRemarks}
                    onChange={(e) => setStatusChangeRemarks(e.target.value)}
                    placeholder="Enter status update remarks..."
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 resize-none"
                  />
                </div>

                <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsStatusModalOpen(false)}
                    className="px-3 py-1.5 bg-slate-100 text-slate-700 font-bold rounded-lg cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-[#042C51] hover:bg-[#FF5C28] text-white font-black rounded-lg cursor-pointer"
                  >
                    Confirm Status Change
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 5: PUBLIC APPLICATION WEB FORM MODAL */}
      <AnimatePresence>
        {isPublicFormModalOpen && (
          <div className="fixed inset-0 bg-[#042C51]/90 backdrop-blur-md z-50 overflow-y-auto">
            <div className="relative min-h-screen bg-[#F4F7FB]">
              <PublicTalentPoolApplicationPage
                onAddCandidate={(newCand) => {
                  setCandidates((prev) => [newCand, ...prev]);
                  triggerToast(`Public application received from ${newCand.name}!`);
                }}
                onNavigateToTalentPool={() => setIsPublicFormModalOpen(false)}
              />
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
