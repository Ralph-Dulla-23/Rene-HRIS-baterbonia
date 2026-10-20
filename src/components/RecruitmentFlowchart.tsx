import React, { useState, useMemo } from "react";
import { 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  FileText, 
  CheckSquare, 
  Briefcase, 
  Users, 
  UserCheck, 
  Star, 
  FileCheck, 
  FolderOpen, 
  UserPlus, 
  BarChart2, 
  Building2, 
  Sparkles, 
  Play, 
  Pause, 
  RotateCcw, 
  ZoomIn, 
  ZoomOut, 
  Maximize2, 
  Minimize2, 
  Search, 
  ExternalLink, 
  Download, 
  Layers, 
  Settings, 
  Info, 
  X, 
  ChevronRight, 
  PartyPopper, 
  Database, 
  Network, 
  ArrowRight,
  ArrowLeft,
  ArrowDown,
  CornerDownRight,
  CornerDownLeft,
  ShieldCheck,
  Calendar,
  Clock,
  Inbox,
  Compass,
  Cpu,
  RefreshCw,
  Printer,
  ChevronDown,
  Code2,
  Copy,
  Sliders,
  Check
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { FlowchartProcessId } from "./flowchart/flowchartTypes";
import { MERMAID_DIAGRAMS } from "./flowchart/flowchartData";
import Process1InformationArchitecture from "./flowchart/Process1InformationArchitecture";
import Process3WorkforcePlanning from "./flowchart/Process3WorkforcePlanning";
import Process4CoreHRLifecycle from "./flowchart/Process4CoreHRLifecycle";
import Process5OrgGovernance from "./flowchart/Process5OrgGovernance";
import SystemModulesMatrix from "./flowchart/SystemModulesMatrix";
import RecruitmentPdfReportModal from "./flowchart/RecruitmentPdfReportModal";

interface RecruitmentFlowchartProps {
  onSwitchModule?: (moduleKey: string) => void;
  onClose?: () => void;
}

export interface FlowStep {
  id: number;
  phaseId: 1 | 2 | 3 | 4;
  title: string;
  subtitle: string;
  category: "plan" | "prepare" | "attract" | "hire";
  headerColor: string; // e.g. 'bg-[#1D68BD]'
  lightBg: string;
  borderColor: string;
  icon: React.ComponentType<{ className?: string }>;
  bullets: string[];
  actionBtnText?: string;
  secondaryPill?: {
    text: string;
    type: "red" | "green" | "blue" | "orange";
  };
  hasApprovalStatus?: boolean;
  approvalStatus?: "pending" | "for_review" | "approved" | "rejected";
  hasDecision?: boolean;
  decisionText?: string;
  linkedModule?: string;
  roleOwner: string;
  slaDays: string;
  description: string;
  inputs: string[];
  outputs: string[];
}

export const FLOW_STEPS: FlowStep[] = [
  // ==================== PHASE 1: PLAN & APPROVE ====================
  {
    id: 1,
    phaseId: 1,
    title: "1. Hiring Need / Manpower Request",
    subtitle: "Create Hiring Need",
    category: "plan",
    headerColor: "bg-[#1D68BD] text-white",
    lightBg: "bg-blue-50/60",
    borderColor: "border-blue-200",
    icon: FileText,
    bullets: [
      "Account",
      "Position",
      "Required Headcount",
      "Request Type (Hiring / Downsize)",
      "Reason",
      "Week / Target Date",
      "Attach File"
    ],
    actionBtnText: "Submit Hiring Need",
    linkedModule: "Hiring Needs Intake",
    roleOwner: "Operations Manager (OM) / Account Lead",
    slaDays: "1 - 2 Business Days",
    description: "The initiating step where operational accounts forecast and declare workforce deficits or replacement staffing requirements.",
    inputs: ["Account Profile", "Capacity Gap Analysis", "Target Deployment Date", "Budget Allocation Code"],
    outputs: ["Manpower Intake Ticket (MNP-REQ)", "Headcount Ramp Forecast", "Draft Intake Record"]
  },
  {
    id: 2,
    phaseId: 1,
    title: "2. Hiring Need Approval",
    subtitle: "Approval Process (OM/SOM/HR as applicable)",
    category: "plan",
    headerColor: "bg-[#1D68BD] text-white",
    lightBg: "bg-blue-50/60",
    borderColor: "border-blue-200",
    icon: ShieldCheck,
    bullets: [
      "OM / SOM Review",
      "Headcount Capacity Check",
      "Budget & Compensation Fit",
      "Site Delivery Readiness"
    ],
    hasApprovalStatus: true,
    approvalStatus: "approved",
    linkedModule: "Hiring Needs Intake",
    roleOwner: "Senior Operations Manager (SOM) & HR Director",
    slaDays: "24 - 48 Hours SLA",
    description: "Multilevel executive review gate validating client contracts, financial viability, and seat availability prior to recruiting activation.",
    inputs: ["Submitted MNP Request", "Site Capacity Registry", "WFM Roster"],
    outputs: ["Executive Sign-Off", "Approved Hiring Request", "Notification to TA"]
  },

  // ==================== PHASE 2: PREPARE ====================
  {
    id: 3,
    phaseId: 2,
    title: "3. Job Description (JD)",
    subtitle: "Create New JD or Select Existing",
    category: "prepare",
    headerColor: "bg-[#0E8773] text-white",
    lightBg: "bg-teal-50/60",
    borderColor: "border-teal-200",
    icon: FileText,
    bullets: [
      "Position",
      "Site (Davao / Tagum / Mabini / Both)",
      "JD Content (Rich Text Editor)",
      "Attach File (optional)"
    ],
    actionBtnText: "Save JD",
    linkedModule: "Job Description",
    roleOwner: "Talent Acquisition Lead & Compensation Specialist",
    slaDays: "1 Business Day",
    description: "Standardization of role requirements, compensable factor benchmarks, skills matrices, and site assignments across SiBS campuses.",
    inputs: ["Role Scope", "Language Requirements", "Shift Schedules", "Salary Band"],
    outputs: ["Verified Job Description", "Scoring Rubric", "Compensable Factor Matrix"]
  },
  {
    id: 4,
    phaseId: 2,
    title: "4. JD Approval",
    subtitle: "Approval Process (OM/SOM/HR as applicable)",
    category: "prepare",
    headerColor: "bg-[#0E8773] text-white",
    lightBg: "bg-teal-50/60",
    borderColor: "border-teal-200",
    icon: CheckSquare,
    bullets: [
      "OM Operations Review",
      "SOM Account Validation",
      "HR Legal & Policy Check",
      "Final Compensation Band"
    ],
    hasApprovalStatus: true,
    approvalStatus: "approved",
    linkedModule: "Job Description",
    roleOwner: "HR Director / Compliance Officer",
    slaDays: "24 Hours SLA",
    description: "Formal sign-off of job specifications ensuring legal compliance, internal equity, and alignment with client campaign requirements.",
    inputs: ["Draft JD Document", "Site Facility Standards", "Role Compensation Guidelines"],
    outputs: ["Official Approved JD Stamp", "JD Approval Audit Entry"]
  },
  {
    id: 5,
    phaseId: 2,
    title: "5. Available Position",
    subtitle: "Open Position",
    category: "prepare",
    headerColor: "bg-[#096657] text-white",
    lightBg: "bg-emerald-50/60",
    borderColor: "border-emerald-200",
    icon: Briefcase,
    bullets: [
      "Position",
      "Account",
      "Site",
      "Required Headcount",
      "Approved JD",
      "Target Date"
    ],
    actionBtnText: "Create Open Position",
    linkedModule: "Available Positions",
    roleOwner: "Talent Acquisition Recruitment Sourcing Lead",
    slaDays: "Immediate upon JD Approval",
    description: "Publication of active requisition into SiBS candidate pipeline and job boards, broadcasting requirements to internal and external channels.",
    inputs: ["Approved JD", "Approved Manpower Request", "Headcount Quota"],
    outputs: ["Public Job Posting", "Candidate Sourcing Requisition", "Headcount Allocation Target"]
  },

  // ==================== PHASE 3: ATTRACT & EVALUATE ====================
  {
    id: 6,
    phaseId: 3,
    title: "6. Candidate Application",
    subtitle: "Candidates Apply",
    category: "attract",
    headerColor: "bg-[#6B21A8] text-white",
    lightBg: "bg-purple-50/60",
    borderColor: "border-purple-200",
    icon: Users,
    bullets: [
      "Online / Referral / Walk-in",
      "Upload Resume",
      "Fill out Application Form",
      "Select Position"
    ],
    actionBtnText: "Submit Application",
    linkedModule: "Public Application Form",
    roleOwner: "Job Seeker / Candidate",
    slaDays: "Self-Paced / Immediate Ingestion",
    description: "Multi-channel candidate capture encompassing public web application portals, employee referral networks, walk-in kiosks, and job boards.",
    inputs: ["Candidate Resume (PDF/Word)", "Contact Details", "Shift Availability", "Preferred Site"],
    outputs: ["Applicant Lead Record", "Automated Acknowledgment Email", "Talent Pool Entry"]
  },
  {
    id: 7,
    phaseId: 3,
    title: "7. Initial Screening",
    subtitle: "Review Application",
    category: "attract",
    headerColor: "bg-[#581C87] text-white",
    lightBg: "bg-purple-50/60",
    borderColor: "border-purple-200",
    icon: UserCheck,
    bullets: [
      "Profile Review",
      "Initial Screening",
      "Endorse to Assessment",
      "Shortlist / Reject"
    ],
    secondaryPill: {
      text: "Rejected (Notify Candidate)",
      type: "red"
    },
    linkedModule: "Applicant Leads",
    roleOwner: "TA Junior Recruiter / Screener",
    slaDays: "1 - 2 Business Days",
    description: "Initial evaluation of applicant qualifications, educational background, communication basics, and minimum passing criteria.",
    inputs: ["Submitted Application", "Resume", "Basic Eligibility Questions"],
    outputs: ["Screening Scorecard", "Assessment Invitation", "Rejection Notification (if unsuited)"]
  },
  {
    id: 8,
    phaseId: 3,
    title: "8. Assessment",
    subtitle: "Assessment Process",
    category: "attract",
    headerColor: "bg-[#4A154B] text-white",
    lightBg: "bg-purple-50/60",
    borderColor: "border-purple-200",
    icon: FileCheck,
    bullets: [
      "Schedule Assessment",
      "Encode Results",
      "Typing & Versant / Language Test",
      "Pass / Fail"
    ],
    secondaryPill: {
      text: "Failed (Notify Candidate)",
      type: "red"
    },
    linkedModule: "Talent Pool",
    roleOwner: "Assessment Specialist / Recruitment Proctor",
    slaDays: "1 Day (On-Site or Remote Proctoring)",
    description: "Objective evaluation testing typing speed/accuracy (e.g. 35+ WPM), English language proficiency, computer literacy, and customer service aptitude.",
    inputs: ["Assessment Battery", "Audio Headsets", "Test Console Access"],
    outputs: ["Assessment Score Record", "Benchmark Pass Verification", "Automated Results Email"]
  },
  {
    id: 9,
    phaseId: 3,
    title: "9. Interviews",
    subtitle: "Interview Stages (As per Recruitment Settings)",
    category: "attract",
    headerColor: "bg-[#3B0764] text-white",
    lightBg: "bg-purple-50/60",
    borderColor: "border-purple-200",
    icon: Users,
    bullets: [
      "Initial Interview (HR / TA)",
      "Operations Interview (OM/TL)",
      "Technical / Account Assessment",
      "Pass / Fail Feedback"
    ],
    secondaryPill: {
      text: "Failed (Notify Candidate)",
      type: "red"
    },
    linkedModule: "Talent Pool",
    roleOwner: "Recruitment Specialist & Operations Team Lead",
    slaDays: "2 - 3 Business Days",
    description: "Structured behavioral, situational, and competence evaluations mapped to the specific account and campaign demands.",
    inputs: ["Interview Rating Guide", "Candidate Profile", "Scoring Rubric"],
    outputs: ["Interview Notes & Ratings", "Endorsement to Final Interview"]
  },
  {
    id: 10,
    phaseId: 3,
    title: "10. Final Interview",
    subtitle: "Final Interview Form",
    category: "attract",
    headerColor: "bg-[#2E1065] text-white",
    lightBg: "bg-purple-50/60",
    borderColor: "border-purple-200",
    icon: Star,
    bullets: [
      "Configured Questions",
      "Interview Evaluation",
      "Rating / Remarks",
      "Pass / Fail Final Decision"
    ],
    secondaryPill: {
      text: "Failed (Notify Candidate)",
      type: "red"
    },
    linkedModule: "Talent Pool",
    roleOwner: "Operations Manager (OM) / Account Director",
    slaDays: "24 Hours SLA",
    description: "The conclusive operational interview conducted by account leadership confirming cultural fit, commitment, shift adherence, and final hiring blessing.",
    inputs: ["Candidate Complete Dossier", "Assessment History", "Operational Checklist"],
    outputs: ["Final Pass Decision", "Recommended Salary Grade", "Offer Generation Endorsement"]
  },
  {
    id: 11,
    phaseId: 3,
    title: "11. Job Offer",
    subtitle: "Generate / Upload Offer",
    category: "attract",
    headerColor: "bg-[#5B21B6] text-white",
    lightBg: "bg-purple-50/60",
    borderColor: "border-purple-200",
    icon: CheckSquare,
    bullets: [
      "Prepare Offer Package",
      "Generate / Upload PDF Letter",
      "Send to Candidate via Email",
      "Track Response & Acceptance"
    ],
    hasDecision: true,
    decisionText: "Offer Accepted?",
    linkedModule: "Offers",
    roleOwner: "HR Compensation & Offer Coordinator",
    slaDays: "1 - 2 Business Days",
    description: "Formal job offer formulation including base compensation, allowances, shift differential, health coverage (HMO), and target start date.",
    inputs: ["Salary Band Approval", "Account Start Date", "Candidate Contact Details"],
    outputs: ["Signed Employment Offer Letter", "Candidate Offer Acceptance Notice"]
  },

  // ==================== PHASE 4: HIRE & ONBOARD ====================
  {
    id: 12,
    phaseId: 4,
    title: "12. Requirements / Documents",
    subtitle: "Collect Requirements",
    category: "hire",
    headerColor: "bg-[#C2410C] text-white",
    lightBg: "bg-orange-50/60",
    borderColor: "border-orange-200",
    icon: FolderOpen,
    bullets: [
      "Government IDs (SSS, PhilHealth, Pag-IBIG, TIN)",
      "NBI / Police Clearance",
      "Medical & Drug Test Clearances",
      "Signed Offer & Confidentiality Agreement",
      "Transcript / Certificate of Employment"
    ],
    secondaryPill: {
      text: "Incomplete (For Follow-up)",
      type: "orange"
    },
    linkedModule: "Onboarding",
    roleOwner: "HR Onboarding Specialist",
    slaDays: "3 - 5 Business Days prior to Day 1",
    description: "Verification and digital archiving of pre-employment requirements ensuring statutory labor law compliance and client accreditation.",
    inputs: ["Candidate Submissions", "Medical Clinic Endorsement", "Government Numbers"],
    outputs: ["Verified Document Dossier", "Pre-Employment Audit Clearance"]
  },
  {
    id: 13,
    phaseId: 4,
    title: "13. Ready for Hire",
    subtitle: "Checklist",
    category: "hire",
    headerColor: "bg-[#EA580C] text-white",
    lightBg: "bg-orange-50/60",
    borderColor: "border-orange-200",
    icon: CheckCircle2,
    bullets: [
      "Offer Accepted & Signed",
      "All Documents Completed",
      "Medical Fit-to-Work Clearance",
      "All Recruitment Steps Done"
    ],
    actionBtnText: "Mark as Ready for Hire",
    hasDecision: true,
    decisionText: "All complete?",
    linkedModule: "Onboarding",
    roleOwner: "HR Operations Lead",
    slaDays: "48 Hours before Class Orientation",
    description: "Final quality assurance gate certifying that all contractual, medical, and administrative prerequisites are 100% satisfied.",
    inputs: ["Signed Offer", "Complete Documents", "Manager Approval"],
    outputs: ["Ready-for-Hire Certificate", "Class Roster Confirmation"]
  },
  {
    id: 14,
    phaseId: 4,
    title: "14. Convert to Employee",
    subtitle: "Create Employee Record",
    category: "hire",
    headerColor: "bg-[#FF5C28] text-white",
    lightBg: "bg-orange-50/60",
    borderColor: "border-orange-300",
    icon: UserPlus,
    bullets: [
      "Auto-populate from candidate data",
      "Assign SiBS ID (e.g. SIBS-2026-XXXX)",
      "Position / Account / Site",
      "Start Date & Team Assignment",
      "Manager / Team Mapping",
      "Activate HRIS Access (if applicable)"
    ],
    actionBtnText: "Create Employee",
    linkedModule: "Employee Directory",
    roleOwner: "HR Master Data Administrator",
    slaDays: "24 Hours prior to Day 1",
    description: "Automated conversion promoting the hired candidate record into the active SiBS Employee Directory with assigned credentials.",
    inputs: ["Validated Candidate Profile", "SiBS ID Number Sequence", "Department Code"],
    outputs: ["Official Employee Directory Record", "Badge Print Authorization", "Welcome Package"]
  },
  {
    id: 15,
    phaseId: 4,
    title: "15. Hiring Requirement Updated",
    subtitle: "Update Headcount",
    category: "hire",
    headerColor: "bg-[#1D68BD] text-white",
    lightBg: "bg-blue-50/60",
    borderColor: "border-blue-200",
    icon: BarChart2,
    bullets: [
      "Increase hired count in Plan Ledger",
      "Show remaining headcount deficit",
      "Recalculate buffer % & variance",
      "Auto-complete when requirement is filled"
    ],
    actionBtnText: "Mark Requirement as Completed",
    hasDecision: true,
    decisionText: "Required HC Reached?",
    linkedModule: "Workforce Hiring",
    roleOwner: "Workforce Management (WFM) Planner",
    slaDays: "Real-time sync",
    description: "Headcount ledger reconciliation incrementing filled seats and updating real-time account coverage dashboards.",
    inputs: ["Hired Employee ID", "Active Workforce Plan ID", "Class Roster Count"],
    outputs: ["Updated Account Ramp Ledger", "Capacity Fulfillment Metric", "Milestone Notification to OM"]
  },
  {
    id: 16,
    phaseId: 4,
    title: "16. Onboarding (HRIS)",
    subtitle: "Employee Onboarding",
    category: "hire",
    headerColor: "bg-[#042C51] text-white",
    lightBg: "bg-blue-50/60",
    borderColor: "border-blue-200",
    icon: Building2,
    bullets: [
      "Include in HRIS master database",
      "System Access Setup & Workstation",
      "Orientation / Training Class Kickoff",
      "Monitor 30/60/90 days retention"
    ],
    secondaryPill: {
      text: "Employee Active",
      type: "blue"
    },
    linkedModule: "Onboarding",
    roleOwner: "Learning & Development (L&D) & IT Operations",
    slaDays: "Day 1 to Day 90",
    description: "The holistic employee integration journey spanning Day-1 orientation, IT asset handover, Kronos/attendance enrollment, and milestone reviews.",
    inputs: ["Active Employee Profile", "IT Equipment Inventory", "Training Curriculum"],
    outputs: ["Active Workstation & Email", "Day 1 Orientation Completed", "30/60/90 Retention Scorecard"]
  }
];

export default function RecruitmentFlowchart({ onSwitchModule, onClose }: RecruitmentFlowchartProps) {
  const [activeProcessTab, setActiveProcessTab] = useState<FlowchartProcessId>("process-2-recruitment");
  const [showRecruitmentMermaid, setShowRecruitmentMermaid] = useState(false);
  const [copiedMermaid, setCopiedMermaid] = useState(false);
  const [selectedStepId, setSelectedStepId] = useState<number>(1);
  const [phaseFilter, setPhaseFilter] = useState<"all" | 1 | 2 | 3 | 4>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationSpeed, setSimulationSpeed] = useState<number>(1800);
  const [isInspectorOpen, setIsInspectorOpen] = useState(true);
  const [showRejectionLoops, setShowRejectionLoops] = useState(true);
  const [isAnimatedFlow, setIsAnimatedFlow] = useState(true);
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);

  // Dynamic step states for user interactivity simulation
  const [stepStates, setStepStates] = useState<Record<number, {
    status?: "pending" | "for_review" | "approved" | "rejected" | "passed" | "failed" | "accepted" | "declined" | "complete" | "incomplete";
    notes?: string;
  }>>({
    2: { status: "approved" },
    4: { status: "approved" },
    8: { status: "passed" },
    9: { status: "passed" },
    10: { status: "passed" },
    11: { status: "accepted" },
    13: { status: "complete" },
    15: { status: "complete" }
  });

  const selectedStep = useMemo(() => {
    return FLOW_STEPS.find(s => s.id === selectedStepId) || FLOW_STEPS[0];
  }, [selectedStepId]);

  // Simulation timer walkthrough
  React.useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isSimulating) {
      timer = setTimeout(() => {
        setSelectedStepId(prev => {
          if (prev >= 16) {
            setIsSimulating(false);
            return 16;
          }
          return prev + 1;
        });
      }, simulationSpeed);
    }
    return () => clearTimeout(timer);
  }, [isSimulating, selectedStepId, simulationSpeed]);

  const handleStartSimulation = () => {
    setSelectedStepId(1);
    setIsSimulating(true);
  };

  const handlePauseSimulation = () => {
    setIsSimulating(false);
  };

  const handleResetSimulation = () => {
    setIsSimulating(false);
    setSelectedStepId(1);
  };

  const handleToggleFullscreen = () => {
    setIsFullscreen(prev => !prev);
  };

  // Zoom controls
  const handleZoomIn = () => setZoomLevel(prev => Math.min(140, prev + 10));
  const handleZoomOut = () => setZoomLevel(prev => Math.max(70, prev - 10));
  const handleResetZoom = () => setZoomLevel(100);

  // Candidate simulation story info depending on current active step
  const simulationStory = useMemo(() => {
    switch (selectedStepId) {
      case 1:
        return {
          candidate: "Maria Santos",
          role: "Customer Support Specialist",
          site: "SiBS Tagum HQ",
          action: "OM submitted new hiring request for 25 headcount to support upcoming Retail Campaign.",
          status: "Draft Intake Submitted"
        };
      case 2:
        return {
          candidate: "Maria Santos",
          role: "Customer Support Specialist",
          site: "SiBS Tagum HQ",
          action: "SOM and HR validated seat allocation and approved MNP-2026-084.",
          status: "Hiring Need Approved"
        };
      case 3:
        return {
          candidate: "Maria Santos",
          role: "Customer Support Specialist",
          site: "SiBS Tagum HQ",
          action: "JD drafted with English B2 benchmark, voice support, rotating shifts at Tagum Campus.",
          status: "JD Configured"
        };
      case 4:
        return {
          candidate: "Maria Santos",
          role: "Customer Support Specialist",
          site: "SiBS Tagum HQ",
          action: "HR Director reviewed compensable factor matrix and signed off on compensation band.",
          status: "JD Approved"
        };
      case 5:
        return {
          candidate: "Maria Santos",
          role: "Customer Support Specialist",
          site: "SiBS Tagum HQ",
          action: "Requisition opened on public careers board and internal employee referral network.",
          status: "Position Posted Live"
        };
      case 6:
        return {
          candidate: "Maria Santos",
          role: "Customer Support Specialist",
          site: "SiBS Tagum HQ",
          action: "Maria submitted application online via the SiBS Public Application Form with her resume.",
          status: "Application Ingested"
        };
      case 7:
        return {
          candidate: "Maria Santos",
          role: "Customer Support Specialist",
          site: "SiBS Tagum HQ",
          action: "Recruiter reviewed resume, verified 1 yr BPO experience, and endorsed for testing.",
          status: "Screening Passed"
        };
      case 8:
        return {
          candidate: "Maria Santos",
          role: "Customer Support Specialist",
          site: "SiBS Tagum HQ",
          action: "Maria completed typing test (48 WPM / 98% acc) and Versant English score (64 / B2+).",
          status: "Assessment Passed"
        };
      case 9:
        return {
          candidate: "Maria Santos",
          role: "Customer Support Specialist",
          site: "SiBS Tagum HQ",
          action: "Operations Team Lead interviewed Maria on customer resolution scenarios. Score: 4.8 / 5.0.",
          status: "Ops Interview Passed"
        };
      case 10:
        return {
          candidate: "Maria Santos",
          role: "Customer Support Specialist",
          site: "SiBS Tagum HQ",
          action: "Operations Manager conducted final culture interview. Final blessing provided for hiring.",
          status: "Final Interview Passed"
        };
      case 11:
        return {
          candidate: "Maria Santos",
          role: "Customer Support Specialist",
          site: "SiBS Tagum HQ",
          action: "Job offer letter sent via email with ₱24,500 package + HMO. Maria digitally accepted!",
          status: "Offer Accepted"
        };
      case 12:
        return {
          candidate: "Maria Santos",
          role: "Customer Support Specialist",
          site: "SiBS Tagum HQ",
          action: "Maria uploaded SSS, PhilHealth, Pag-IBIG, TIN, and medical fit-to-work clearance.",
          status: "Documents Submitted"
        };
      case 13:
        return {
          candidate: "Maria Santos",
          role: "Customer Support Specialist",
          site: "SiBS Tagum HQ",
          action: "HR Onboarding confirmed all credentials, background check clear, signed NDA archived.",
          status: "Ready for Hire"
        };
      case 14:
        return {
          candidate: "Maria Santos",
          role: "Customer Support Specialist",
          site: "SiBS Tagum HQ",
          action: "Candidate converted into active employee record. Assigned SiBS Employee ID: SIBS-2026-0842.",
          status: "Employee Created"
        };
      case 15:
        return {
          candidate: "Maria Santos",
          role: "Customer Support Specialist",
          site: "SiBS Tagum HQ",
          action: "Workforce ramp ledger updated: 25 / 25 seats filled. Hiring target reached for Week 32!",
          status: "Headcount Fulfilled"
        };
      case 16:
        return {
          candidate: "Maria Santos",
          role: "Customer Support Specialist",
          site: "SiBS Tagum HQ",
          action: "Maria welcomed at SiBS Tagum HQ Day-1 Orientation class. Workstation and badge issued!",
          status: "Active Employee • Day 1"
        };
      default:
        return {
          candidate: "Maria Santos",
          role: "Customer Support Specialist",
          site: "SiBS Tagum HQ",
          action: "Process complete.",
          status: "Completed"
        };
    }
  }, [selectedStepId]);

  return (
    <div className={`flex flex-col w-full min-h-[calc(100vh-5rem)] bg-[#F4F7FB] text-slate-800 select-none ${
      isFullscreen ? "fixed inset-0 z-50 overflow-auto bg-[#F4F7FB]" : ""
    }`}>
      {/* ==================== 1. MASTER WORKFLOW HEADER BANNER ==================== */}
      <div className="bg-white border-b border-slate-200 shadow-2xs px-3.5 sm:px-6 py-3 sm:py-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 sm:gap-4">
          {/* Logo & Main Title matching Image 1 */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
            <div className="flex items-center gap-3 pr-4 sm:border-r border-slate-200">
              <div className="w-10 sm:w-11 h-10 sm:h-11 rounded-xl bg-[#042C51] flex flex-col items-center justify-center text-white shadow-md shrink-0">
                <span className="text-xs sm:text-sm font-black tracking-tight leading-none text-[#FF5C28]">SiBS</span>
                <span className="text-[8px] sm:text-[9px] font-extrabold tracking-widest text-white leading-none mt-0.5">HRIS</span>
              </div>
              <div>
                <div className="text-[9px] sm:text-[9.5px] font-black uppercase tracking-widest text-[#FF5C28]">
                  PEOPLE • PROCESS • PROGRESS
                </div>
                <div className="text-[11px] sm:text-xs font-semibold text-slate-400">
                  Enterprise Architecture
                </div>
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-base sm:text-xl lg:text-2xl font-black text-[#042C51] tracking-tight leading-tight">
                  {activeProcessTab === "process-1-ia" && "1. High-Level Information Architecture Flowchart"}
                  {activeProcessTab === "process-2-recruitment" && "2. End-to-End Recruitment & Talent Acquisition Pipeline"}
                  {activeProcessTab === "process-3-workforce" && "3. Workforce Planning & Capacity Ramp Flowchart"}
                  {activeProcessTab === "process-4-core-hr" && "4. Core HR, Attendance & Lifecycle Flowchart"}
                  {activeProcessTab === "process-5-governance" && "5. Organizational & Administrative Governance Flowchart"}
                  {activeProcessTab === "process-summary-matrix" && "Summary of System Modules & Wireframe Matrix"}
                </h1>
                <span className="px-2 py-0.5 rounded-full bg-orange-100 text-[#FF5C28] text-[9.5px] sm:text-[10px] font-black uppercase tracking-wider">
                  Interactive Architecture
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-500 font-medium mt-0.5 line-clamp-2 sm:line-clamp-none">
                {activeProcessTab === "process-1-ia" && "Complete structural hierarchy mapping all 6 main functional branches and 26 interconnected sub-modules across the SiBS HRIS Ecosystem."}
                {activeProcessTab === "process-2-recruitment" && "From hiring request to employee onboarding — Complete candidate journey across Demand, Sourcing, Talent Pool & Onboarding."}
                {activeProcessTab === "process-3-workforce" && "Account hiring requests, buffer variance computations, and dual-mode Overview vs. Plan Drawer execution."}
                {activeProcessTab === "process-4-core-hr" && "Daily biometric time tracking, supervisor discrepancy review, leave approvals, and resignation clearances."}
                {activeProcessTab === "process-5-governance" && "Master administrative infrastructure across 7 divisions, 3 multi-campus facilities, and scoring rules."}
                {activeProcessTab === "process-summary-matrix" && "Comprehensive operational cross-reference connecting Functional Areas to Primary Wireframe Screens."}
              </p>
            </div>
          </div>

          {/* Right Slogan & Quick Control Actions */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <div className="hidden xl:block text-right pr-4 border-r border-slate-200">
              <span className="text-sm font-bold text-[#042C51] italic">Right People,</span>{" "}
              <span className="text-sm font-bold text-[#FF5C28] italic">Brighter Tomorrow</span>
              <p className="text-[10px] text-slate-400 font-medium">Standard Operating Procedures v1.0</p>
            </div>

            {/* Interactive Simulation Controls */}
            <div className="flex items-center gap-1 sm:gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200 shadow-2xs">
              {!isSimulating ? (
                <button
                  onClick={handleStartSimulation}
                  className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 bg-[#FF5C28] hover:bg-[#e04b1c] text-white text-[11px] sm:text-xs font-bold rounded-lg transition-all shadow-2xs cursor-pointer"
                  title="Run Step-by-Step Simulated Walkthrough"
                >
                  <Play className="w-3 sm:w-3.5 h-3 sm:h-3.5 fill-white" />
                  <span>Run Sim</span>
                </button>
              ) : (
                <button
                  onClick={handlePauseSimulation}
                  className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white text-[11px] sm:text-xs font-bold rounded-lg transition-all shadow-2xs cursor-pointer"
                  title="Pause Simulation"
                >
                  <Pause className="w-3 sm:w-3.5 h-3 sm:h-3.5" />
                  <span>Pause</span>
                </button>
              )}

              <button
                onClick={handleResetSimulation}
                className="p-1 sm:p-1.5 text-slate-600 hover:text-[#042C51] hover:bg-white rounded-lg transition-all cursor-pointer"
                title="Reset to Step 1"
              >
                <RotateCcw className="w-3 sm:w-3.5 h-3 sm:h-3.5" />
              </button>

              {/* Speed selector */}
              <select
                value={simulationSpeed}
                onChange={e => setSimulationSpeed(Number(e.target.value))}
                className="text-[10px] font-bold bg-white text-slate-700 px-1.5 sm:px-2 py-1 rounded-md border border-slate-200 focus:outline-none cursor-pointer"
                title="Simulation Speed"
              >
                <option value={2400}>0.75x</option>
                <option value={1800}>1.0x</option>
                <option value={1000}>1.5x</option>
              </select>
            </div>

            {/* Flow Arrow & Loopback Display Toggles */}
            <div className="hidden md:flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200">
              <button
                onClick={() => setIsAnimatedFlow(prev => !prev)}
                className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-extrabold transition-all cursor-pointer ${
                  isAnimatedFlow
                    ? "bg-[#042C51] text-white shadow-2xs"
                    : "bg-white text-slate-600 hover:text-slate-900 border border-slate-200"
                }`}
                title="Toggle Animated Pulse along Flow Arrows"
              >
                <Sparkles className="w-3 h-3 text-[#FF5C28]" />
                <span>Flow Pulses</span>
              </button>
              <button
                onClick={() => setShowRejectionLoops(prev => !prev)}
                className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-extrabold transition-all cursor-pointer ${
                  showRejectionLoops
                    ? "bg-red-500 text-white shadow-2xs"
                    : "bg-white text-slate-600 hover:text-slate-900 border border-slate-200"
                }`}
                title="Toggle Rejection and Loopback Arrows"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Loopbacks</span>
              </button>
            </div>

            {/* Zoom Controls */}
            <div className="flex items-center gap-0.5 sm:gap-1 bg-slate-100 p-0.5 sm:p-1 rounded-xl border border-slate-200">
              <button
                onClick={handleZoomOut}
                className="p-1 sm:p-1.5 text-slate-600 hover:text-[#042C51] hover:bg-white rounded-lg transition-all cursor-pointer"
                title="Zoom Out"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={handleResetZoom}
                className="px-1.5 sm:px-2 py-1 text-[10px] sm:text-[11px] font-bold text-slate-700 hover:bg-white rounded-md transition-all cursor-pointer"
                title="Reset Zoom"
              >
                {zoomLevel}%
              </button>
              <button
                onClick={handleZoomIn}
                className="p-1 sm:p-1.5 text-slate-600 hover:text-[#042C51] hover:bg-white rounded-lg transition-all cursor-pointer"
                title="Zoom In"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Export Full PDF Report for Steps 1-16 */}
            <button
              id="export-pdf-steps-1-16-btn"
              onClick={() => setIsPdfModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#FF5C28] hover:bg-[#e04b1c] text-white text-[11px] sm:text-xs font-bold rounded-xl transition-all shadow-xs cursor-pointer"
              title="Export Steps 1–16 to PDF / Executive Report"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Export PDF (Steps 1–16)</span>
            </button>

            {/* Fullscreen & Close Button */}
            <button
              onClick={handleToggleFullscreen}
              className="p-1.5 sm:p-2 text-slate-600 hover:text-[#042C51] hover:bg-slate-100 border border-slate-200 rounded-xl transition-all cursor-pointer"
              title={isFullscreen ? "Exit Fullscreen" : "Fullscreen View"}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>

            {onClose && (
              <button
                onClick={onClose}
                className="p-1.5 sm:p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-all cursor-pointer"
                title="Close Flowchart"
              >
                <X className="w-4 sm:w-5 h-4 sm:h-5" />
              </button>
            )}
          </div>
        </div>

        {/* ==================== 1.5 MASTER SYSTEM PROCESS NAVIGATOR ==================== */}
        <div className="mt-3.5 pt-3 border-t border-slate-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 mb-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">SELECT PROCESS FLOW:</span>
              <span className="text-xs font-black text-[#042C51]">5 Core Operational Workflows + Wireframe Matrix</span>
            </div>

            {activeProcessTab === "process-2-recruitment" && (
              <button
                onClick={() => setShowRecruitmentMermaid(prev => !prev)}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                  showRecruitmentMermaid ? "bg-[#042C51] text-white border-[#042C51]" : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                }`}
              >
                <Code2 className="w-3.5 h-3.5" />
                <span>{showRecruitmentMermaid ? "Hide Mermaid" : "View Mermaid Code"}</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs font-black scrollbar-none">
            <button
              onClick={() => setActiveProcessTab("process-1-ia")}
              className={`px-3 py-2 rounded-xl border flex items-center gap-1.5 transition-all shrink-0 cursor-pointer ${
                activeProcessTab === "process-1-ia"
                  ? "bg-[#1D68BD] text-white border-[#1D68BD] shadow-xs"
                  : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
              }`}
            >
              <Network className="w-3.5 h-3.5" />
              <span>1. Information Architecture (IA)</span>
            </button>

            <button
              onClick={() => setActiveProcessTab("process-2-recruitment")}
              className={`px-3 py-2 rounded-xl border flex items-center gap-1.5 transition-all shrink-0 cursor-pointer ${
                activeProcessTab === "process-2-recruitment"
                  ? "bg-[#6B21A8] text-white border-[#6B21A8] shadow-xs"
                  : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>2. Recruitment & TA Pipeline</span>
            </button>

            <button
              onClick={() => setActiveProcessTab("process-3-workforce")}
              className={`px-3 py-2 rounded-xl border flex items-center gap-1.5 transition-all shrink-0 cursor-pointer ${
                activeProcessTab === "process-3-workforce"
                  ? "bg-[#FF5C28] text-white border-[#FF5C28] shadow-xs"
                  : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
              }`}
            >
              <BarChart2 className="w-3.5 h-3.5" />
              <span>3. Workforce Planning & Ramp</span>
            </button>

            <button
              onClick={() => setActiveProcessTab("process-4-core-hr")}
              className={`px-3 py-2 rounded-xl border flex items-center gap-1.5 transition-all shrink-0 cursor-pointer ${
                activeProcessTab === "process-4-core-hr"
                  ? "bg-[#0E8773] text-white border-[#0E8773] shadow-xs"
                  : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>4. Core HR, Attendance & Lifecycle</span>
            </button>

            <button
              onClick={() => setActiveProcessTab("process-5-governance")}
              className={`px-3 py-2 rounded-xl border flex items-center gap-1.5 transition-all shrink-0 cursor-pointer ${
                activeProcessTab === "process-5-governance"
                  ? "bg-[#042C51] text-white border-[#042C51] shadow-xs"
                  : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>5. Org & Admin Governance</span>
            </button>

            <button
              onClick={() => setActiveProcessTab("process-summary-matrix")}
              className={`px-3 py-2 rounded-xl border flex items-center gap-1.5 transition-all shrink-0 cursor-pointer ${
                activeProcessTab === "process-summary-matrix"
                  ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                  : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>System Modules Matrix</span>
            </button>
          </div>
        </div>

        {/* ==================== 2. TOOLBAR: PHASE TABS & LIVE SIMULATION STORY TICKER (FOR RECRUITMENT PIPELINE) ==================== */}
        {activeProcessTab === "process-2-recruitment" && (
          <>
            <div className="mt-3.5 pt-3 border-t border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-3">
              {/* Phase Filter Tabs */}
              <div className="flex items-center gap-1.5 overflow-x-auto text-xs font-bold">
                <button
                  onClick={() => setPhaseFilter("all")}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                    phaseFilter === "all"
                      ? "bg-[#042C51] text-white shadow-2xs"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  All Steps (1–16)
                </button>
                <button
                  onClick={() => setPhaseFilter(1)}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                    phaseFilter === 1
                      ? "bg-[#1D68BD] text-white shadow-2xs"
                      : "bg-blue-50 text-[#1D68BD] hover:bg-blue-100"
                  }`}
                >
                  1. Plan & Approve (Steps 1–2)
                </button>
                <button
                  onClick={() => setPhaseFilter(2)}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                    phaseFilter === 2
                      ? "bg-[#0E8773] text-white shadow-2xs"
                      : "bg-teal-50 text-[#0E8773] hover:bg-teal-100"
                  }`}
                >
                  2. Prepare (Steps 3–5)
                </button>
                <button
                  onClick={() => setPhaseFilter(3)}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                    phaseFilter === 3
                      ? "bg-[#6B21A8] text-white shadow-2xs"
                      : "bg-purple-50 text-[#6B21A8] hover:bg-purple-100"
                  }`}
                >
                  3. Attract & Evaluate (Steps 6–11)
                </button>
                <button
                  onClick={() => setPhaseFilter(4)}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                    phaseFilter === 4
                      ? "bg-[#FF5C28] text-white shadow-2xs"
                      : "bg-orange-50 text-[#FF5C28] hover:bg-orange-100"
                  }`}
                >
                  4. Hire & Onboard (Steps 12–16)
                </button>
              </div>

              <div className="flex items-center gap-2 w-full md:w-auto">
                {/* Search Steps Input */}
                <div className="relative w-full md:w-64">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search step, role, or action..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-[#FF5C28] transition-colors"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>

                {/* Quick PDF Report Trigger */}
                <button
                  id="search-export-pdf-btn"
                  onClick={() => setIsPdfModalOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-[#042C51] hover:bg-[#073663] text-white text-xs font-bold rounded-lg transition-all shadow-2xs cursor-pointer whitespace-nowrap"
                  title="Export Complete 16-Step Recruitment Pipeline as PDF"
                >
                  <Printer className="w-3.5 h-3.5 text-[#FF5C28]" />
                  <span>Report PDF (1-16)</span>
                </button>
              </div>
            </div>

            {/* Live Simulation Banner / Story Capsule */}
            <div className="mt-2.5 bg-gradient-to-r from-[#042C51] via-[#09477e] to-[#042C51] rounded-xl p-2.5 text-white flex flex-col md:flex-row md:items-center justify-between gap-2 shadow-sm border border-blue-400/20">
              <div className="flex items-center gap-2.5">
                <div className="w-6 h-6 rounded-full bg-[#FF5C28] text-white flex items-center justify-center text-xs font-black shrink-0 animate-pulse">
                  {selectedStepId}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase tracking-wider text-[#FF5C28]">
                      SIMULATED CANDIDATE JOURNEY:
                    </span>
                    <span className="text-xs font-extrabold text-white">
                      {simulationStory.candidate}
                    </span>
                    <span className="text-[10px] text-blue-200 bg-white/10 px-2 py-0.2 rounded font-medium">
                      {simulationStory.role} • {simulationStory.site}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-200 mt-0.5">
                    {simulationStory.action}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span className="text-[10px] font-black px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 uppercase tracking-wider">
                  {simulationStory.status}
                </span>
                <button
                  onClick={() => setIsInspectorOpen(prev => !prev)}
                  className="text-[10px] font-bold text-white bg-white/15 hover:bg-white/25 px-2.5 py-1 rounded-md transition-colors cursor-pointer"
                >
                  {isInspectorOpen ? "Hide Inspector" : "Show Inspector"}
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* ==================== 3. MAIN FLOWCHART VIEWPORT / SUB-PROCESS VIEWS ==================== */}
      {activeProcessTab === "process-1-ia" && (
        <div className="flex-1 overflow-auto p-4 sm:p-6 bg-slate-50">
          <div className="max-w-7xl mx-auto">
            <Process1InformationArchitecture onSwitchModule={onSwitchModule} />
          </div>
        </div>
      )}

      {activeProcessTab === "process-3-workforce" && (
        <div className="flex-1 overflow-auto p-4 sm:p-6 bg-slate-50">
          <div className="max-w-7xl mx-auto">
            <Process3WorkforcePlanning onSwitchModule={onSwitchModule} />
          </div>
        </div>
      )}

      {activeProcessTab === "process-4-core-hr" && (
        <div className="flex-1 overflow-auto p-4 sm:p-6 bg-slate-50">
          <div className="max-w-7xl mx-auto">
            <Process4CoreHRLifecycle onSwitchModule={onSwitchModule} />
          </div>
        </div>
      )}

      {activeProcessTab === "process-5-governance" && (
        <div className="flex-1 overflow-auto p-4 sm:p-6 bg-slate-50">
          <div className="max-w-7xl mx-auto">
            <Process5OrgGovernance onSwitchModule={onSwitchModule} />
          </div>
        </div>
      )}

      {activeProcessTab === "process-summary-matrix" && (
        <div className="flex-1 overflow-auto p-4 sm:p-6 bg-slate-50">
          <div className="max-w-7xl mx-auto">
            <SystemModulesMatrix onSwitchModule={onSwitchModule} />
          </div>
        </div>
      )}

      {activeProcessTab === "process-2-recruitment" && (
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
        {/* Scrollable Canvas Container */}
        <div className="flex-1 overflow-auto p-3 sm:p-6" style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: "top left" }}>
          {/* Mobile horizontal navigation helper banner */}
          <div className="lg:hidden mb-3 p-2.5 bg-blue-50 border border-blue-200 rounded-xl flex items-center justify-between text-xs font-bold text-[#1D68BD]">
            <span className="flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5 shrink-0 text-[#FF5C28]" />
              <span>Pan horizontally to inspect full candidate journey</span>
            </span>
            <button
              onClick={() => setIsInspectorOpen(true)}
              className="px-2 py-1 bg-[#042C51] text-white rounded-lg text-[10.5px] font-black shrink-0 ml-2 shadow-2xs cursor-pointer"
            >
              Step {selectedStep.id} Info
            </button>
          </div>

          <div className="min-w-[1240px] space-y-6 pb-20">
            
            {/* Expandable Mermaid Source Panel */}
            {showRecruitmentMermaid && (
              <div className="bg-slate-900 text-slate-100 rounded-2xl p-5 border border-slate-800 shadow-md">
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2 text-xs font-black text-amber-400">
                    <Code2 className="w-4 h-4" />
                    <span>Mermaid Definition (Process 2: End-to-End Recruitment Pipeline)</span>
                  </div>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(MERMAID_DIAGRAMS["process-2-recruitment"].code);
                      setCopiedMermaid(true);
                      setTimeout(() => setCopiedMermaid(false), 2000);
                    }}
                    className="flex items-center gap-1 px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-lg border border-slate-700 transition-all cursor-pointer"
                  >
                    {copiedMermaid ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedMermaid ? "Copied!" : "Copy Code"}</span>
                  </button>
                </div>
                <pre className="text-[11px] font-mono text-emerald-400 overflow-x-auto whitespace-pre leading-relaxed p-2 bg-slate-950/80 rounded-xl border border-slate-800">
                  {MERMAID_DIAGRAMS["process-2-recruitment"].code}
                </pre>
              </div>
            )}
            
            {/* ==================== 4 PROCESS CHEVRONS (MATCHING IMAGE 1) ==================== */}
            <div className="grid grid-cols-4 gap-2 text-center select-none font-black text-xs">
              {/* Chevron 1: Plan & Approve */}
              <div className="relative bg-[#EBF3FC] text-[#1D68BD] border border-blue-200 rounded-xl p-2.5 flex flex-col items-center justify-center shadow-2xs">
                <div className="text-[11px] tracking-wide uppercase font-black">
                  1. PLAN & APPROVE
                </div>
                <div className="text-[10px] text-slate-600 font-normal">
                  Get the requirement approved
                </div>
              </div>

              {/* Chevron 2: Prepare */}
              <div className="relative bg-[#EAF8F5] text-[#0E8773] border border-teal-200 rounded-xl p-2.5 flex flex-col items-center justify-center shadow-2xs">
                <div className="text-[11px] tracking-wide uppercase font-black">
                  2. PREPARE
                </div>
                <div className="text-[10px] text-slate-600 font-normal">
                  Set up the job and open the position
                </div>
              </div>

              {/* Chevron 3: Attract & Evaluate */}
              <div className="relative bg-[#F3EBFD] text-[#6B21A8] border border-purple-200 rounded-xl p-2.5 flex flex-col items-center justify-center shadow-2xs">
                <div className="text-[11px] tracking-wide uppercase font-black">
                  3. ATTRACT & EVALUATE
                </div>
                <div className="text-[10px] text-slate-600 font-normal">
                  Find and assess the right candidates
                </div>
              </div>

              {/* Chevron 4: Hire & Onboard */}
              <div className="relative bg-[#EDF4FA] text-[#0F518C] border border-blue-200 rounded-xl p-2.5 flex flex-col items-center justify-center shadow-2xs">
                <div className="text-[11px] tracking-wide uppercase font-black">
                  4. HIRE & ONBOARD
                </div>
                <div className="text-[10px] text-slate-600 font-normal">
                  Convert to employee and close the loop
                </div>
              </div>
            </div>

            {/* ==================== ROW 1: STEPS 1 TO 5 ==================== */}
            {(phaseFilter === "all" || phaseFilter === 1 || phaseFilter === 2) && (
              <div className="relative bg-white/80 border border-slate-200/90 rounded-2xl p-5 shadow-sm backdrop-blur-sm">
                {/* Row Header Label */}
                <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-md bg-[#1D68BD] text-white text-[10px] font-black uppercase tracking-wider">
                      PHASE 1 & 2 PIPELINE
                    </span>
                    <span className="text-xs font-black text-[#042C51]">
                      Requisition Approval & Job Preparation Flow
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500">
                    <span className="flex items-center gap-1 text-emerald-700">
                      <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Primary Flow (Steps 1–5)
                    </span>
                    {showRejectionLoops && (
                      <span className="flex items-center gap-1 text-red-600">
                        <span className="w-2 h-2 rounded-full bg-red-500"></span> Rejection Loopbacks
                      </span>
                    )}
                  </div>
                </div>

                {/* Primary Horizontal Flow Pipeline */}
                <div className="flex items-start gap-1 sm:gap-2 overflow-x-auto pb-2">
                  {/* START Green Pill Indicator */}
                  <div className="pt-3 flex flex-col items-center shrink-0">
                    <div className="px-3 py-1.5 bg-emerald-600 text-white rounded-full font-black text-[11px] uppercase tracking-widest shadow-md flex items-center gap-1.5 ring-2 ring-emerald-300">
                      <span className="w-2 h-2 rounded-full bg-white animate-ping"></span>
                      START
                    </div>
                    <span className="text-[8px] font-black uppercase text-emerald-700 mt-1 tracking-wider">
                      Hiring Need
                    </span>
                  </div>

                  {/* START to Step 1 Arrow */}
                  {renderFlowArrow(0, 1, "Start", "emerald", "Initiate")}

                  {/* STEP 1: Hiring Need */}
                  <div className="flex-1 min-w-[180px] max-w-[215px]">
                    {renderStepCard(FLOW_STEPS[0])}
                  </div>

                  {/* Step 1 to Step 2 Arrow */}
                  {renderFlowArrow(1, 2, "Submit", "blue", "OM Review")}

                  {/* STEP 2: Hiring Need Approval */}
                  <div className="flex-1 min-w-[180px] max-w-[215px]">
                    {renderStepCard(FLOW_STEPS[1])}
                  </div>

                  {/* Step 2 to Step 3 Arrow (Phase Transition) */}
                  {renderFlowArrow(2, 3, "Approved", "teal", "Draft JD")}

                  {/* STEP 3: Job Description (JD) */}
                  <div className="flex-1 min-w-[180px] max-w-[215px]">
                    {renderStepCard(FLOW_STEPS[2])}
                  </div>

                  {/* Step 3 to Step 4 Arrow */}
                  {renderFlowArrow(3, 4, "Submit JD", "teal", "HR Signoff")}

                  {/* STEP 4: JD Approval */}
                  <div className="flex-1 min-w-[180px] max-w-[215px]">
                    {renderStepCard(FLOW_STEPS[3])}
                  </div>

                  {/* Step 4 to Step 5 Arrow */}
                  {renderFlowArrow(4, 5, "Approved", "teal", "Publish")}

                  {/* STEP 5: Available Position + Side Posted Node */}
                  <div className="flex-1 min-w-[180px] max-w-[215px] space-y-2.5">
                    {renderStepCard(FLOW_STEPS[4])}

                    {/* Side Node: Posted Position Database Cylinder */}
                    <div className="bg-purple-50 border-2 border-dashed border-purple-300 rounded-xl p-2.5 text-[11px] text-purple-900 shadow-2xs flex flex-col gap-1">
                      <div className="flex items-center gap-1.5 font-black text-purple-800">
                        <Database className="w-3.5 h-3.5 text-purple-600" />
                        <span>Posted Position</span>
                      </div>
                      <ul className="text-[9.5px] text-purple-700/90 space-y-0.5 list-disc list-inside">
                        <li>Candidate pipeline live</li>
                        <li>Accepts applications</li>
                        <li>Headcount vs hires ledger</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Rejection Loopbacks for Row 1 */}
                {showRejectionLoops && (
                  <div className="mt-3 pt-2.5 border-t border-dashed border-slate-200 grid grid-cols-1 md:grid-cols-2 gap-2 text-[10px]">
                    {/* Step 2 -> Step 1 Rejection Loop */}
                    <div className="bg-red-50/70 border border-red-200/90 rounded-xl p-2 flex items-center justify-between gap-2 text-red-800">
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center text-red-600 font-black text-xs shrink-0">
                          ↵
                        </div>
                        <div>
                          <span className="font-black uppercase tracking-wider text-red-900">Step 2 ➔ Step 1 Rejection Loop:</span>{" "}
                          <span className="text-slate-600 font-medium">If OM/SOM/HR rejects request, status updates to Rejected and loops back to Step 1 to revise headcount justification.</span>
                        </div>
                      </div>
                      <span className="text-[9px] font-black px-2 py-0.5 rounded bg-red-100 border border-red-200 text-red-700 shrink-0">
                        Revise & Resubmit
                      </span>
                    </div>

                    {/* Step 4 -> Step 3 Rejection Loop */}
                    <div className="bg-red-50/70 border border-red-200/90 rounded-xl p-2 flex items-center justify-between gap-2 text-red-800">
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center text-red-600 font-black text-xs shrink-0">
                          ↵
                        </div>
                        <div>
                          <span className="font-black uppercase tracking-wider text-red-900">Step 4 ➔ Step 3 JD Loop:</span>{" "}
                          <span className="text-slate-600 font-medium">If HR Director rejects JD specifications, returns to Step 3 to calibrate English benchmark or salary band.</span>
                        </div>
                      </div>
                      <span className="text-[9px] font-black px-2 py-0.5 rounded bg-red-100 border border-red-200 text-red-700 shrink-0">
                        Adjust Qualifications
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ==================== INTER-ROW PROCESS CONDUIT: ROW 1 TO ROW 2 ==================== */}
            {(phaseFilter === "all" || phaseFilter === 1 || phaseFilter === 2) && (
              <div className="relative py-2.5 px-6 flex items-center justify-between bg-gradient-to-r from-teal-500/10 via-purple-500/15 to-purple-500/10 border-y-2 border-dashed border-purple-300 rounded-2xl shadow-2xs">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#0E8773] to-[#6B21A8] text-white flex items-center justify-center shadow-md font-black text-xs">
                    1➔2
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-[#042C51] uppercase tracking-wider">
                        PROCESS HANDOFF: PHASE 2 (PREPARE) ➔ PHASE 3 (ATTRACT & EVALUATE)
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 font-extrabold text-[9px]">
                        Requisition Live
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 font-medium">
                      Published Requisition in Step 5 automatically connects to Step 6, ingesting candidate resumes into the assessment funnel.
                    </p>
                  </div>
                </div>

                {/* Directional Flow Ribbon */}
                <div className="flex items-center gap-2 text-purple-700 font-black text-xs bg-white/90 px-3.5 py-1.5 rounded-xl border border-purple-200 shadow-2xs">
                  <span>Step 5 (Available Position)</span>
                  <div className="flex items-center text-purple-600 font-black tracking-tighter">
                    <ChevronRight className="w-4 h-4 -mr-2 animate-pulse" />
                    <ChevronRight className="w-4 h-4 -mr-2 animate-pulse" />
                    <ChevronRight className="w-4 h-4" />
                  </div>
                  <span className="text-[#FF5C28]">Step 6 (Candidate Application)</span>
                </div>
              </div>
            )}

            {/* ==================== ROW 2: STEPS 6 TO 11 (CANDIDATE ASSESSMENT) ==================== */}
            {(phaseFilter === "all" || phaseFilter === 3) && (
              <div className="relative bg-white/80 border border-slate-200/90 rounded-2xl p-5 shadow-sm backdrop-blur-sm">
                {/* Row Header Label */}
                <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-md bg-[#6B21A8] text-white text-[10px] font-black uppercase tracking-wider">
                      PHASE 3 PIPELINE
                    </span>
                    <span className="text-xs font-black text-[#042C51]">
                      Candidate Sourcing, Multi-Stage Evaluation & Job Offer
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500">
                    <span className="flex items-center gap-1 text-purple-700">
                      <span className="w-2 h-2 rounded-full bg-purple-500"></span> Candidate Progression (Steps 6–11)
                    </span>
                    {showRejectionLoops && (
                      <span className="flex items-center gap-1 text-red-600">
                        <span className="w-2 h-2 rounded-full bg-red-500"></span> Disqualification Regret Flows
                      </span>
                    )}
                  </div>
                </div>

                {/* Primary Horizontal Flow Pipeline */}
                <div className="flex items-start gap-1 sm:gap-2 overflow-x-auto pb-2">
                  {/* STEP 6: Candidate Application */}
                  <div className="flex-1 min-w-[170px] max-w-[205px]">
                    {renderStepCard(FLOW_STEPS[5])}
                  </div>

                  {/* Step 6 to Step 7 Arrow */}
                  {renderFlowArrow(6, 7, "Apply", "purple", "Ingested")}

                  {/* STEP 7: Initial Screening */}
                  <div className="flex-1 min-w-[170px] max-w-[205px]">
                    {renderStepCard(FLOW_STEPS[6])}
                  </div>

                  {/* Step 7 to Step 8 Arrow */}
                  {renderFlowArrow(7, 8, "Passed", "purple", "Endorse")}

                  {/* STEP 8: Assessment */}
                  <div className="flex-1 min-w-[170px] max-w-[205px]">
                    {renderStepCard(FLOW_STEPS[7])}
                  </div>

                  {/* Step 8 to Step 9 Arrow */}
                  {renderFlowArrow(8, 9, "Passed", "purple", "B2 Score")}

                  {/* STEP 9: Interviews */}
                  <div className="flex-1 min-w-[170px] max-w-[205px]">
                    {renderStepCard(FLOW_STEPS[8])}
                  </div>

                  {/* Step 9 to Step 10 Arrow */}
                  {renderFlowArrow(9, 10, "Endorse", "purple", "TL Passed")}

                  {/* STEP 10: Final Interview */}
                  <div className="flex-1 min-w-[170px] max-w-[205px]">
                    {renderStepCard(FLOW_STEPS[9])}
                  </div>

                  {/* Step 10 to Step 11 Arrow */}
                  {renderFlowArrow(10, 11, "Selected", "purple", "Generate Offer")}

                  {/* STEP 11: Job Offer + Decision Diamond */}
                  <div className="flex-1 min-w-[185px] max-w-[215px] space-y-2.5">
                    {renderStepCard(FLOW_STEPS[10])}

                    {/* Decision Diamond for Offer Accepted */}
                    <div className="relative bg-white border-2 border-purple-400 rounded-xl p-2.5 text-center shadow-2xs">
                      <div className="text-[10px] font-black uppercase text-purple-900 flex items-center justify-center gap-1">
                        <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                        <span>Offer Accepted?</span>
                      </div>
                      <div className="mt-1.5 flex items-center justify-around text-[10px] font-extrabold gap-1">
                        <button
                          onClick={() => handleUpdateStepState(11, "declined")}
                          className={`px-2 py-0.5 rounded border transition-colors cursor-pointer ${
                            stepStates[11]?.status === "declined"
                              ? "bg-red-600 text-white border-red-600 shadow-2xs"
                              : "bg-red-50 text-red-600 border-red-200 hover:bg-red-100"
                          }`}
                        >
                          No (Declined)
                        </button>
                        <button
                          onClick={() => handleUpdateStepState(11, "accepted")}
                          className={`px-2 py-0.5 rounded border transition-colors cursor-pointer ${
                            stepStates[11]?.status === "accepted"
                              ? "bg-emerald-600 text-white border-emerald-600 shadow-2xs"
                              : "bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100"
                          }`}
                        >
                          Yes (Accepted)
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Candidate Disqualification & Dropoff Paths for Row 2 */}
                {showRejectionLoops && (
                  <div className="mt-3 pt-2.5 border-t border-dashed border-slate-200 bg-red-50/60 border border-red-200 rounded-xl p-2.5 flex flex-col md:flex-row md:items-center justify-between gap-2 text-[10.5px] text-red-900">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-full bg-red-600 text-white flex items-center justify-center font-black text-xs shrink-0">
                        ✕
                      </div>
                      <div>
                        <span className="font-black uppercase tracking-wider text-red-900">Disqualification Exit Flows (Steps 7–10):</span>{" "}
                        <span className="text-slate-700 font-medium">Any candidate who fails Screening, Typing/English Assessment, Ops Interview, or Final Interview drops out and receives an automated regret email via SMTP. Profile is archived in Talent Pool.</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0 font-bold text-red-700 text-[9.5px]">
                      <span className="bg-white px-2 py-0.5 rounded border border-red-200">
                        Failed ➔ Regret Email (SMTP) ➔ Archived in Pool
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ==================== INTER-ROW PROCESS CONDUIT: ROW 2 TO ROW 3 ==================== */}
            {(phaseFilter === "all" || phaseFilter === 2 || phaseFilter === 3) && (
              <div className="relative py-2.5 px-6 flex items-center justify-between bg-gradient-to-r from-purple-500/10 via-emerald-500/15 to-blue-500/10 border-y-2 border-dashed border-emerald-300 rounded-2xl shadow-2xs">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#6B21A8] to-emerald-600 text-white flex items-center justify-center shadow-md font-black text-xs">
                    2➔3
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-[#042C51] uppercase tracking-wider">
                        PROCESS HANDOFF: PHASE 3 (ATTRACT & EVALUATE) ➔ PHASE 4 (HIRE & ONBOARD)
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-extrabold text-[9px]">
                        Offer Accepted (YES)
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 font-medium">
                      Signed Job Offer from Step 11 initiates pre-employment requirements and background verification in Step 12.
                    </p>
                  </div>
                </div>

                {/* Directional Flow Ribbon */}
                <div className="flex items-center gap-2 text-emerald-800 font-black text-xs bg-white/90 px-3.5 py-1.5 rounded-xl border border-emerald-200 shadow-2xs">
                  <span>Step 11 (Job Offer Signed)</span>
                  <div className="flex items-center text-emerald-600 font-black tracking-tighter">
                    <ChevronRight className="w-4 h-4 -mr-2 animate-pulse" />
                    <ChevronRight className="w-4 h-4 -mr-2 animate-pulse" />
                    <ChevronRight className="w-4 h-4" />
                  </div>
                  <span className="text-[#1D68BD]">Step 12 (Pre-Employment Requirements)</span>
                </div>
              </div>
            )}

            {/* ==================== ROW 3: STEPS 12 TO 16 + END (HIRE & ONBOARD) ==================== */}
            {(phaseFilter === "all" || phaseFilter === 4) && (
              <div className="relative bg-white/80 border border-slate-200/90 rounded-2xl p-5 shadow-sm backdrop-blur-sm">
                {/* Row Header Label */}
                <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-md bg-[#FF5C28] text-white text-[10px] font-black uppercase tracking-wider">
                      PHASE 4 PIPELINE
                    </span>
                    <span className="text-xs font-black text-[#042C51]">
                      Compliance Verification, Employee Conversion & HRIS Onboarding
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500">
                    <span className="flex items-center gap-1 text-orange-700">
                      <span className="w-2 h-2 rounded-full bg-[#FF5C28]"></span> Conversion to Employee (Steps 12–16)
                    </span>
                    <span className="flex items-center gap-1 text-emerald-700">
                      <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Successful Hire Completion
                    </span>
                  </div>
                </div>

                {/* Primary Horizontal Flow Pipeline */}
                <div className="flex items-start gap-1 sm:gap-2 overflow-x-auto pb-2">
                  {/* STEP 12: Requirements / Documents */}
                  <div className="flex-1 min-w-[170px] max-w-[205px]">
                    {renderStepCard(FLOW_STEPS[11])}
                  </div>

                  {/* Step 12 to Step 13 Arrow */}
                  {renderFlowArrow(12, 13, "Docs In", "orange", "HR Verify")}

                  {/* STEP 13: Ready for Hire */}
                  <div className="flex-1 min-w-[170px] max-w-[205px]">
                    {renderStepCard(FLOW_STEPS[12])}
                  </div>

                  {/* Step 13 to Step 14 Arrow */}
                  {renderFlowArrow(13, 14, "Verified", "orange", "Generate ID")}

                  {/* STEP 14: Convert to Employee */}
                  <div className="flex-1 min-w-[170px] max-w-[205px]">
                    {renderStepCard(FLOW_STEPS[13])}
                  </div>

                  {/* Step 14 to Step 15 Arrow */}
                  {renderFlowArrow(14, 15, "Converted", "orange", "Update Ledger")}

                  {/* STEP 15: Hiring Requirement Updated */}
                  <div className="flex-1 min-w-[170px] max-w-[205px]">
                    {renderStepCard(FLOW_STEPS[14])}
                  </div>

                  {/* Step 15 to Step 16 Arrow */}
                  {renderFlowArrow(15, 16, "Filled", "blue", "Class Roster")}

                  {/* STEP 16: Onboarding (HRIS) */}
                  <div className="flex-1 min-w-[170px] max-w-[205px]">
                    {renderStepCard(FLOW_STEPS[15])}
                  </div>

                  {/* Step 16 to END Arrow */}
                  {renderFlowArrow(16, 17, "Day 1 Active", "emerald", "Hired")}

                  {/* END NODE: Successful Hire matching Image 1 */}
                  <div className="flex-1 min-w-[150px] max-w-[185px] self-stretch bg-gradient-to-br from-emerald-50 via-teal-50 to-emerald-100 border-2 border-emerald-400 rounded-2xl p-4 flex flex-col justify-between items-center text-center shadow-md">
                    <div className="px-3 py-0.5 rounded-full bg-emerald-600 text-white font-black text-[10px] uppercase tracking-wider flex items-center gap-1 shadow-2xs">
                      <span className="w-1.5 h-1.5 rounded-full bg-white"></span>
                      END
                    </div>

                    <div className="py-2 flex flex-col items-center">
                      <div className="w-11 h-11 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-lg mb-1.5 animate-bounce">
                        <PartyPopper className="w-5 h-5" />
                      </div>
                      <h3 className="text-xs font-black text-emerald-900 leading-tight">
                        Successful Hire
                      </h3>
                      <p className="text-[9.5px] text-emerald-800/90 font-medium mt-1 leading-snug">
                        From applicant to certified team member.
                      </p>
                    </div>

                    <div className="w-full pt-1.5 border-t border-emerald-300 text-[9px] font-black text-emerald-800">
                      Right People. Brighter Tomorrow.
                    </div>
                  </div>
                </div>

                {/* Headcount Deficit Feedback Loop for Row 3 */}
                {showRejectionLoops && (
                  <div className="mt-3 pt-2.5 border-t border-dashed border-slate-200 bg-blue-50/60 border border-blue-200 rounded-xl p-2.5 flex flex-col md:flex-row md:items-center justify-between gap-2 text-[10.5px] text-blue-900">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-full bg-[#1D68BD] text-white flex items-center justify-center font-black text-xs shrink-0">
                        ↺
                      </div>
                      <div>
                        <span className="font-black uppercase tracking-wider text-[#042C51]">Headcount Deficit Feedback Loop (Step 15 ➔ Step 6):</span>{" "}
                        <span className="text-slate-700 font-medium">If the required headcount is not yet filled (e.g. 18 / 25 seats), requisition stays open and feeds back into Step 6 Candidate Pipeline until 100% capacity is reached.</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0 font-bold text-[#1D68BD] text-[9.5px]">
                      <span className="bg-white px-2 py-0.5 rounded border border-blue-200">
                        Deficit Remaining ➔ Sourcing Remains Active
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ==================== FOOTER: SUPPORTING MODULES, INTEGRATIONS, AND LEGEND ==================== */}
            <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 text-xs">
              {/* Supporting Modules */}
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-slate-100 text-slate-700">
                  <Database className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
                    Supporting Modules
                  </div>
                  <div className="text-[11px] font-bold text-[#042C51] flex flex-wrap gap-1 mt-0.5">
                    <span>Approvals</span> • 
                    <span>Notifications</span> • 
                    <span>Email Logs</span> • 
                    <span>Audit Trail</span> • 
                    <span>Recruitment Settings</span> • 
                    <span>Employee Management</span>
                  </div>
                </div>
              </div>

              {/* Integrations */}
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-blue-50 text-blue-700">
                  <Network className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
                    Integrations
                  </div>
                  <div className="text-[11px] font-bold text-slate-700 mt-0.5">
                    Email (SMTP) • File Server (SMB) • Kronos Attendance • SiBS HRIS DB
                  </div>
                </div>
              </div>

              {/* Legend matching Image 1 */}
              <div className="flex items-center gap-3 bg-slate-50 px-3 py-2 rounded-xl border border-slate-200">
                <span className="text-[10px] font-black uppercase text-slate-400">Legend:</span>
                <div className="flex items-center gap-1 text-[10.5px] font-bold text-emerald-700">
                  <span className="w-3 h-0.5 bg-emerald-500"></span>
                  <span>Process Flow</span>
                </div>
                <div className="flex items-center gap-1 text-[10.5px] font-bold text-red-600">
                  <span className="w-3 h-0.5 border-t-2 border-dashed border-red-500"></span>
                  <span>Rejected / Back</span>
                </div>
                <div className="flex items-center gap-1 text-[10.5px] font-bold text-blue-600">
                  <span className="w-3 h-0.5 border-t-2 border-dashed border-blue-500"></span>
                  <span>Optional Flow</span>
                </div>
              </div>

              {/* Stamp */}
              <div className="text-right text-[10px] text-slate-400 font-medium">
                SiBS HRIS | Recruitment Module Version 1.0 | <span className="text-emerald-600 font-bold">Approved</span>
              </div>
            </div>

          </div>
        </div>

        {/* ==================== 4. INTERACTIVE STEP INSPECTOR SIDEBAR ==================== */}
        <AnimatePresence>
          {isInspectorOpen && (
            <>
              {/* Mobile overlay backdrop */}
              <div 
                onClick={() => setIsInspectorOpen(false)}
                className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-40 lg:hidden transition-opacity cursor-pointer"
                aria-label="Close inspector backdrop"
              />
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 50 }}
                className="fixed inset-y-0 right-0 z-50 w-full max-w-sm sm:max-w-md bg-white border-l border-slate-200 shadow-2xl flex flex-col h-full lg:relative lg:inset-auto lg:z-20 lg:w-96 lg:shadow-xl shrink-0"
              >
              {/* Drawer Header */}
              <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
                <div className="flex items-center gap-2">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-black text-xs ${selectedStep.headerColor}`}>
                    {selectedStep.id}
                  </div>
                  <div>
                    <h3 className="text-xs font-black text-[#042C51] leading-tight">
                      Step {selectedStep.id} Inspector
                    </h3>
                    <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">
                      {selectedStep.category} Phase
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setIsInspectorOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-700 rounded-md hover:bg-slate-200 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Drawer Body */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
                {/* Step Full Title */}
                <div>
                  <h4 className="text-sm font-black text-[#042C51]">
                    {selectedStep.title}
                  </h4>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    {selectedStep.description}
                  </p>
                </div>

                {/* Direct Action: Jump to Live SiBS Module */}
                {selectedStep.linkedModule && onSwitchModule && (
                  <div className="bg-orange-50 border border-orange-200 rounded-xl p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase text-[#FF5C28] tracking-wider">
                        CONNECTED WORKING MODULE
                      </span>
                      <Sparkles className="w-3.5 h-3.5 text-[#FF5C28]" />
                    </div>
                    <p className="text-[11px] text-slate-700 font-medium">
                      This stage directly powers the <span className="font-bold text-[#042C51]">{selectedStep.linkedModule}</span> screen in the SiBS platform.
                    </p>
                    <button
                      onClick={() => onSwitchModule(selectedStep.linkedModule!)}
                      className="w-full py-2 px-3 bg-[#FF5C28] hover:bg-[#e04b1c] text-white font-bold rounded-lg transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Open {selectedStep.linkedModule}</span>
                    </button>

                    <button
                      id="inspector-export-pdf-btn"
                      onClick={() => setIsPdfModalOpen(true)}
                      className="w-full py-1.5 px-3 bg-white hover:bg-slate-100 text-[#042C51] border border-orange-300 font-bold rounded-lg transition-all text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Printer className="w-3.5 h-3.5 text-[#FF5C28]" />
                      <span>Export Full 16-Step Report (PDF)</span>
                    </button>
                  </div>
                )}

                {/* Governance Details: Owner & SLA */}
                <div className="grid grid-cols-2 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <div>
                    <span className="text-[9px] font-black uppercase text-slate-400">Role Owner</span>
                    <p className="text-[11px] font-bold text-slate-800 mt-0.5">{selectedStep.roleOwner}</p>
                  </div>
                  <div>
                    <span className="text-[9px] font-black uppercase text-slate-400">Expected SLA</span>
                    <p className="text-[11px] font-bold text-emerald-700 mt-0.5">{selectedStep.slaDays}</p>
                  </div>
                </div>

                {/* Interactive Status Simulation Toggle */}
                {selectedStep.hasApprovalStatus && (
                  <div className="space-y-1.5 bg-blue-50/50 p-3 rounded-xl border border-blue-200">
                    <span className="text-[10px] font-black uppercase text-blue-900 tracking-wider">
                      Simulate Approval Decision
                    </span>
                    <div className="grid grid-cols-2 gap-1.5 pt-1">
                      <button
                        onClick={() => handleUpdateStepState(selectedStep.id, "approved")}
                        className={`py-1.5 px-2 rounded-lg font-bold text-[10.5px] transition-all cursor-pointer flex items-center justify-center gap-1 ${
                          stepStates[selectedStep.id]?.status === "approved"
                            ? "bg-emerald-600 text-white shadow-2xs"
                            : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50"
                        }`}
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Approve</span>
                      </button>
                      <button
                        onClick={() => handleUpdateStepState(selectedStep.id, "rejected")}
                        className={`py-1.5 px-2 rounded-lg font-bold text-[10.5px] transition-all cursor-pointer flex items-center justify-center gap-1 ${
                          stepStates[selectedStep.id]?.status === "rejected"
                            ? "bg-red-600 text-white shadow-2xs"
                            : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50"
                        }`}
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Reject</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Key Inputs Required */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
                    Stage Inputs & Prerequisites
                  </span>
                  <div className="space-y-1">
                    {selectedStep.inputs.map((inp, idx) => (
                      <div key={idx} className="flex items-center gap-2 p-1.5 rounded-lg bg-slate-50 border border-slate-200/80 text-[11px] text-slate-700">
                        <CheckSquare className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                        <span>{inp}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Key Outputs Generated */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
                    Stage Deliverables & Artifacts
                  </span>
                  <div className="space-y-1">
                    {selectedStep.outputs.map((out, idx) => (
                      <div key={idx} className="flex items-center gap-2 p-1.5 rounded-lg bg-emerald-50/50 border border-emerald-200 text-[11px] text-emerald-800">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>{out}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Step Navigation Bar */}
                <div className="pt-2 flex items-center justify-between border-t border-slate-200">
                  <button
                    disabled={selectedStep.id <= 1}
                    onClick={() => setSelectedStepId(prev => Math.max(1, prev - 1))}
                    className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 font-bold hover:bg-slate-100 disabled:opacity-40 cursor-pointer"
                  >
                    ← Previous Step
                  </button>
                  <span className="text-[11px] font-black text-slate-400">
                    {selectedStep.id} of 16
                  </span>
                  <button
                    disabled={selectedStep.id >= 16}
                    onClick={() => setSelectedStepId(prev => Math.min(16, prev + 1))}
                    className="px-3 py-1.5 rounded-lg bg-[#042C51] text-white font-bold hover:bg-[#063560] disabled:opacity-40 cursor-pointer"
                  >
                    Next Step →
                  </button>
                </div>
              </div>
            </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Mobile floating trigger to open Inspector */}
        {!isInspectorOpen && (
          <button
            onClick={() => setIsInspectorOpen(true)}
            className="lg:hidden fixed bottom-5 right-5 z-30 flex items-center gap-2 px-3.5 py-2.5 bg-[#042C51] text-white rounded-full shadow-2xl border border-blue-400 text-xs font-bold hover:bg-[#09477e] transition-all active:scale-95 cursor-pointer"
          >
            <Sliders className="w-3.5 h-3.5 text-[#FF5C28]" />
            <span>Step {selectedStep.id} Details</span>
          </button>
        )}
      </div>
      )}

      {/* Comprehensive PDF Report Modal for Steps 1 to 16 */}
      <RecruitmentPdfReportModal
        isOpen={isPdfModalOpen}
        onClose={() => setIsPdfModalOpen(false)}
        steps={FLOW_STEPS}
      />
    </div>
  );

  // Helper function to update simulated step state
  function handleUpdateStepState(stepId: number, status: any) {
    setStepStates(prev => ({
      ...prev,
      [stepId]: { ...prev[stepId], status }
    }));
  }

  // Render an Emphasized Flow Arrow Connector between two pipeline steps
  function renderFlowArrow(
    sourceId: number,
    targetId: number,
    label: string,
    color: "blue" | "teal" | "purple" | "orange" | "emerald" = "blue",
    sublabel?: string
  ) {
    const isPassed = selectedStepId > sourceId;
    const isCurrent = selectedStepId === sourceId;
    const isActive = isPassed || isCurrent;

    const colorMap = {
      blue: {
        border: isActive ? "border-[#1D68BD]" : "border-slate-300",
        badge: isActive ? "bg-[#1D68BD] text-white border-blue-600" : "bg-white text-slate-600 border-slate-300 font-bold",
        stroke: isActive ? "#1D68BD" : "#64748B",
        glow: isActive ? "drop-shadow-[0_0_6px_rgba(29,104,189,0.5)]" : "",
        particle: "#60A5FA"
      },
      teal: {
        border: isActive ? "border-[#0E8773]" : "border-slate-300",
        badge: isActive ? "bg-[#0E8773] text-white border-teal-700" : "bg-white text-slate-600 border-slate-300 font-bold",
        stroke: isActive ? "#0E8773" : "#64748B",
        glow: isActive ? "drop-shadow-[0_0_6px_rgba(14,135,115,0.5)]" : "",
        particle: "#2DD4BF"
      },
      purple: {
        border: isActive ? "border-[#6B21A8]" : "border-slate-300",
        badge: isActive ? "bg-[#6B21A8] text-white border-purple-800" : "bg-white text-slate-600 border-slate-300 font-bold",
        stroke: isActive ? "#6B21A8" : "#64748B",
        glow: isActive ? "drop-shadow-[0_0_6px_rgba(107,33,168,0.5)]" : "",
        particle: "#C084FC"
      },
      orange: {
        border: isActive ? "border-[#FF5C28]" : "border-slate-300",
        badge: isActive ? "bg-[#FF5C28] text-white border-orange-600" : "bg-white text-slate-600 border-slate-300 font-bold",
        stroke: isActive ? "#FF5C28" : "#64748B",
        glow: isActive ? "drop-shadow-[0_0_6px_rgba(255,92,40,0.5)]" : "",
        particle: "#FDBA74"
      },
      emerald: {
        border: isActive ? "border-emerald-600" : "border-slate-300",
        badge: isActive ? "bg-emerald-600 text-white border-emerald-700" : "bg-white text-slate-600 border-slate-300 font-bold",
        stroke: isActive ? "#059669" : "#64748B",
        glow: isActive ? "drop-shadow-[0_0_6px_rgba(5,150,105,0.5)]" : "",
        particle: "#6EE7B7"
      }
    };

    const c = colorMap[color];
    const markerId = `flow-arrow-head-${sourceId}-${targetId}`;

    // Dynamically calculate width so the label badge and sublabel never overlap adjacent step cards
    const labelLength = Math.max(label ? label.length : 0, sublabel ? sublabel.length * 0.85 : 0);
    const requiredWidth = labelLength > 0 ? Math.ceil(labelLength * 7.5) + 32 : 44;
    const effectiveWidth = Math.max(48, requiredWidth);

    return (
      <div
        key={`arrow-${sourceId}-${targetId}`}
        onClick={() => {
          setSelectedStepId(targetId);
          setIsInspectorOpen(true);
        }}
        style={{ width: `${effectiveWidth}px`, minWidth: `${effectiveWidth}px` }}
        className="flex flex-col items-center justify-center shrink-0 relative select-none py-1 group cursor-pointer px-1"
        title={`Flow: Step ${sourceId} ➔ Step ${targetId} (${label})`}
      >
        {/* Step Transition Label Badge */}
        <div
          className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider whitespace-nowrap shadow-2xs border transition-all duration-300 z-10 ${
            c.badge
          } ${isCurrent ? "scale-110 ring-2 ring-orange-400" : "group-hover:scale-105"}`}
        >
          {label}
        </div>

        {/* SVG Arrow Line with Arrowhead and Moving Pulse */}
        <div className="w-full h-5 flex items-center justify-center relative my-0.5">
          <svg
            viewBox={`0 0 ${effectiveWidth} 16`}
            style={{ width: `${effectiveWidth}px` }}
            className={`h-4 overflow-visible transition-all duration-300 ${c.glow}`}
          >
            <defs>
              <marker
                id={markerId}
                markerWidth="6"
                markerHeight="6"
                refX="5"
                refY="3"
                orient="auto"
              >
                <polygon points="0 0, 6 3, 0 6" fill={c.stroke} />
              </marker>
            </defs>

            {/* Main Connector Line */}
            <line
              x1="4"
              y1="8"
              x2={effectiveWidth - 8}
              y2="8"
              stroke={c.stroke}
              strokeWidth={isActive ? "3" : "2.5"}
              strokeLinecap="round"
              markerEnd={`url(#${markerId})`}
            />

            {/* Animated Flow Pulse */}
            {isAnimatedFlow && (
              <circle r="2.5" cy="8" fill={isActive ? c.particle : "#94A3B8"}>
                <animate
                  attributeName="cx"
                  from="6"
                  to={effectiveWidth - 11}
                  dur="1.2s"
                  repeatCount="indefinite"
                />
              </circle>
            )}
          </svg>
        </div>

        {/* Optional Micro Sub-label */}
        {sublabel && (
          <span 
            style={{ maxWidth: `${effectiveWidth - 4}px` }}
            className="text-[7px] font-bold text-slate-400 truncate leading-none text-center block mt-0.5"
          >
            {sublabel}
          </span>
        )}
      </div>
    );
  }

  // Render a Single Step Card matching the visual fidelity of Image 1
  function renderStepCard(step: FlowStep) {
    const isSelected = selectedStepId === step.id;
    const isHighlighted = searchQuery.trim() !== "" && (
      step.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      step.subtitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      step.bullets.some(b => b.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    const IconComponent = step.icon;

    return (
      <div
        key={step.id}
        onClick={() => {
          setSelectedStepId(step.id);
          setIsInspectorOpen(true);
        }}
        className={`group relative rounded-2xl border transition-all duration-200 flex flex-col justify-between overflow-hidden cursor-pointer ${
          isSelected
            ? "ring-3 ring-[#FF5C28] shadow-xl scale-[1.02] z-10 border-[#FF5C28]"
            : isHighlighted
              ? "ring-2 ring-blue-500 shadow-md border-blue-400 bg-white"
              : "bg-white border-slate-200 hover:border-slate-300 hover:shadow-md"
        }`}
      >
        {/* Card Header matching Image 1 */}
        <div className={`px-3 py-2.5 flex items-center justify-between gap-1.5 ${step.headerColor}`}>
          <div className="flex items-center gap-1.5 min-w-0">
            <div className="w-5 h-5 rounded-md bg-white/20 flex items-center justify-center shrink-0">
              <IconComponent className="w-3.5 h-3.5 text-white" />
            </div>
            <h3 className="text-[11px] font-black tracking-tight truncate">
              {step.title}
            </h3>
          </div>
          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-black/20 shrink-0">
            #{step.id}
          </span>
        </div>

        {/* Card Body */}
        <div className="p-3 flex-1 flex flex-col justify-between space-y-2.5">
          <div>
            <div className="text-[10px] font-black text-slate-700 uppercase tracking-wider mb-1.5 border-b border-slate-100 pb-1">
              {step.subtitle}
            </div>

            {/* Bullet List matching Image 1 */}
            <ul className="space-y-1 text-[10px] text-slate-600 font-medium">
              {step.bullets.map((bullet, bIdx) => (
                <li key={bIdx} className="flex items-start gap-1 leading-tight">
                  <span className="text-slate-400">•</span>
                  <span>{bullet}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Conditional Sub-elements matching Image 1 */}
          <div className="space-y-2 pt-1 border-t border-slate-100">
            {/* Approval Status indicators for Steps 2 & 4 */}
            {step.hasApprovalStatus && (
              <div className="bg-slate-50 p-1.5 rounded-lg border border-slate-100 space-y-1 text-[9.5px]">
                <div className="flex items-center justify-between font-bold">
                  <span className="flex items-center gap-1 text-amber-600">
                    <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                    Pending
                  </span>
                  <span className="flex items-center gap-1 text-blue-600">
                    <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                    For Review
                  </span>
                </div>
                <div className="flex items-center justify-between font-bold">
                  <span className="flex items-center gap-1 text-emerald-600">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    Approved
                  </span>
                  <span className="flex items-center gap-1 text-red-600">
                    <span className="w-2 h-2 rounded-full bg-red-500"></span>
                    Rejected
                  </span>
                </div>
              </div>
            )}

            {/* Rejection / Failure Pills (Steps 7, 8, 9, 10, 12) */}
            {step.secondaryPill && (
              <div className={`w-full text-center py-1 px-2 rounded-md font-extrabold text-[9px] ${
                step.secondaryPill.type === "red"
                  ? "bg-red-50 text-red-600 border border-red-200"
                  : step.secondaryPill.type === "orange"
                    ? "bg-orange-50 text-orange-600 border border-orange-200"
                    : "bg-blue-50 text-blue-600 border border-blue-200"
              }`}>
                {step.secondaryPill.text}
              </div>
            )}

            {/* Action Button inside Step matching Image 1 */}
            {step.actionBtnText && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedStepId(step.id);
                  setIsInspectorOpen(true);
                }}
                className={`w-full py-1.5 px-2 rounded-lg text-[10px] font-black transition-all shadow-2xs cursor-pointer ${
                  step.category === "plan"
                    ? "bg-blue-600 hover:bg-blue-700 text-white"
                    : step.category === "prepare"
                      ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                      : step.category === "attract"
                        ? "bg-purple-600 hover:bg-purple-700 text-white"
                        : "bg-[#FF5C28] hover:bg-[#e04b1c] text-white"
                }`}
              >
                {step.actionBtnText}
              </button>
            )}
          </div>
        </div>

        {/* Selected Indicator Bottom Stripe */}
        {isSelected && (
          <div className="h-1 w-full bg-[#FF5C28]"></div>
        )}
      </div>
    );
  }
}
