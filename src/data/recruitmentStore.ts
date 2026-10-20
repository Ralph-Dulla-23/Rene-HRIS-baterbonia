import { Candidate } from "../components/TalentPool";

export interface LeadHistoryItem {
  id: string;
  date: string;
  time?: string;
  action: string;
  user: string;
  type?: "create" | "status" | "contact" | "edit" | "note" | "transfer" | "sms" | "call";
}

export interface ApplicantLead {
  id: string; // e.g. LEAD-2026-0002
  fullName: string;
  firstName?: string;
  lastName?: string;
  middleName?: string;
  suffix?: string;
  cpNum: string; // Cellphone Number
  email: string;
  department: string;
  specificAccount: string; // Account / Client
  source: "Walk-in" | "Job Fair" | "Facebook / Social Media" | "Phone Call Inquiry" | "Employee Referral" | "SMS Inquiry" | "LinkedIn" | "Other";
  preferredSite: "Tagum City" | "Davao City" | "Municipality of Mabini";
  status: "New Lead" | "Contacted" | "Application Link Sent" | "Converted to Applicant" | "Not Interested" | "On Hold";
  inputtedBy: string; // Account of who inputted the lead
  dateLogged: string;
  lastContactDate?: string;
  notes: string;
  referralCode?: string;
  history?: LeadHistoryItem[];
}

export interface ArchivedTalentPoolLead {
  leadId: string;
  talentPoolId: string;
  fullName: string;
  cpNum: string;
  email: string;
  department: string;
  specificAccount: string;
  preferredSite: string;
  source: string;
  dateLogged: string;
  dateTransferred: string;
  transferredBy: string;
  status: "Archived in Talent Pool" | "Converted to Applicant";
  notes: string;
}

// Initial Mock Active Leads
export const INITIAL_ACTIVE_LEADS: ApplicantLead[] = [
  {
    id: "LEAD-2026-0002",
    fullName: "Roman Cabanes Lausa",
    firstName: "Roman",
    lastName: "Lausa",
    middleName: "Cabanes",
    cpNum: "098550486662",
    email: "crisanitan1@gmail.com",
    department: "Call Center Operations",
    specificAccount: "CD - Collect",
    source: "Walk-in",
    preferredSite: "Tagum City",
    status: "New Lead",
    inputtedBy: "CRISTER CANITAN",
    dateLogged: "2026-08-13",
    lastContactDate: "2026-08-13",
    notes: "Inquired at Tagum walk-in kiosk. Interested in financial collections and customer engagement.",
    history: [
      {
        id: "hist-001",
        date: "2026-08-13",
        time: "10:30 AM",
        action: "Inbound applicant lead logged via Walk-in at Tagum City Recruitment Center by Crister Canitan. Account Fit: CD - Collect.",
        user: "CRISTER CANITAN",
        type: "create"
      },
      {
        id: "hist-002",
        date: "2026-08-13",
        time: "11:15 AM",
        action: "Brief intake consultation conducted. Candidate verified willingness to work on-site for Tagum night shift collections wave.",
        user: "CRISTER CANITAN",
        type: "note"
      }
    ]
  },
  {
    id: "LEAD-2026-0003",
    fullName: "Clarisse Joy Santos",
    firstName: "Clarisse Joy",
    lastName: "Santos",
    cpNum: "0917-555-0192",
    email: "clarisse.santos@gmail.com",
    department: "Call Center Operations",
    specificAccount: "CD - Teledentistry",
    source: "Facebook / Social Media",
    preferredSite: "Tagum City",
    status: "Contacted",
    inputtedBy: "CRISTER CANITAN",
    dateLogged: "2026-08-12",
    lastContactDate: "2026-08-13",
    notes: "Responded to Facebook Ad inquiry. Scheduled for online phone screening.",
    history: [
      {
        id: "hist-003",
        date: "2026-08-12",
        time: "02:14 PM",
        action: "Lead captured from Facebook / Social Media recruitment ad campaign.",
        user: "CRISTER CANITAN",
        type: "create"
      },
      {
        id: "hist-004",
        date: "2026-08-13",
        time: "09:40 AM",
        action: "Outbound phone call screening completed. Spoke with candidate; confirmed interest in CD - Teledentistry account.",
        user: "CRISTER CANITAN",
        type: "call"
      },
      {
        id: "hist-005",
        date: "2026-08-13",
        time: "09:45 AM",
        action: 'Status changed from "New Lead" to "Contacted".',
        user: "CRISTER CANITAN",
        type: "status"
      }
    ]
  },
  {
    id: "LEAD-2026-0004",
    fullName: "Mark Anthony Reyes",
    firstName: "Mark Anthony",
    lastName: "Reyes",
    cpNum: "0928-334-1188",
    email: "mark.reyes@yahoo.com",
    department: "Call Center Operations",
    specificAccount: "AHG Inbound/Outbound",
    source: "Job Fair",
    preferredSite: "Davao City",
    status: "Application Link Sent",
    inputtedBy: "ALENA BATACAN",
    dateLogged: "2026-08-11",
    lastContactDate: "2026-08-12",
    notes: "Job fair booth inquiry. Google Form application link dispatched via email & SMS.",
    history: [
      {
        id: "hist-006",
        date: "2026-08-11",
        time: "03:20 PM",
        action: "Lead logged at SM City Davao Job Fair Booth by Alena Batacan.",
        user: "ALENA BATACAN",
        type: "create"
      },
      {
        id: "hist-007",
        date: "2026-08-12",
        time: "10:05 AM",
        action: "Application form link sent via SMS and Email to mark.reyes@yahoo.com / 0928-334-1188.",
        user: "ALENA BATACAN",
        type: "sms"
      },
      {
        id: "hist-008",
        date: "2026-08-12",
        time: "10:05 AM",
        action: 'Status changed to "Application Link Sent".',
        user: "ALENA BATACAN",
        type: "status"
      }
    ]
  }
];

// Initial Archived Leads
export const INITIAL_ARCHIVED_LEADS: ArchivedTalentPoolLead[] = [
  {
    leadId: "LEAD-2026-0001",
    talentPoolId: "PUB-20260814062943-401RQV",
    fullName: "Robin One Piece",
    cpNum: "098550486661",
    email: "crislead1@gmail.com",
    department: "Call Center Operations",
    specificAccount: "CD - Collect",
    preferredSite: "Tagum City",
    source: "Walk-in",
    dateLogged: "2026-08-13",
    dateTransferred: "2026-08-14",
    transferredBy: "CRISTER CANITAN",
    status: "Archived in Talent Pool",
    notes: "Walk-in applicant at Tagum Recruitment Center. Completed intake checklist and initial interview. Transferred to Talent Pool Master Archive."
  },
  {
    leadId: "LEAD-2026-0005",
    talentPoolId: "SIBS-TP-9041",
    fullName: "Gabriel Jose Concepcion",
    cpNum: "0915-777-3322",
    email: "gab.concepcion@outlook.com",
    department: "Human Resource",
    specificAccount: "AHG Auditor",
    preferredSite: "Municipality of Mabini",
    source: "Employee Referral",
    dateLogged: "2026-08-08",
    dateTransferred: "2026-08-09",
    transferredBy: "CRISTER CANITAN",
    status: "Archived in Talent Pool",
    notes: "Referred by John Concepcion. Excellent English fluency and audit background. Transferred to Talent Pool."
  },
  {
    leadId: "LEAD-2026-0006",
    talentPoolId: "SIBS-TP-9042",
    fullName: "Mighty Yena Labus",
    cpNum: "0917-890-4321",
    email: "mighty.labus@gmail.com",
    department: "IT (Information and Communications Technology)",
    specificAccount: "Bayshore Dental Studio",
    preferredSite: "Tagum City",
    source: "Facebook / Social Media",
    dateLogged: "2026-08-09",
    dateTransferred: "2026-08-10",
    transferredBy: "CRISTER CANITAN",
    status: "Archived in Talent Pool",
    notes: "Completed online Versant & tech skills test. Endorsed and moved to Talent Pool."
  }
];

// Helper to generate a complete Candidate object from an ApplicantLead
export function createCandidateFromLead(
  lead: ApplicantLead,
  transferredBy: string,
  talentPoolId?: string
): Candidate {
  const generatedId = talentPoolId || `PUB-${new Date().toISOString().replace(/[-:T]/g, "").slice(0, 14)}-${Math.floor(100 + Math.random() * 900)}RQV`;
  const currentDate = new Date().toISOString().split("T")[0];

  return {
    id: generatedId,
    name: lead.fullName,
    email: lead.email || "applicant.lead@thesiblingssolutions.com",
    phone: lead.cpNum,
    appliedPosition: lead.specificAccount ? `${lead.specificAccount} Specialist` : "Customer Care Specialist",
    department: lead.department || "Call Center Operations",
    accountFit: lead.specificAccount || "CD - Collect",
    sourcingChannel: `Applicant Lead (${lead.source || "Walk-in"})`,
    recruiter: transferredBy || lead.inputtedBy || "Crister Canitan",
    applicationDate: lead.dateLogged || currentDate,
    status: "Silver Pool",
    isPublicEntry: true,
    lastActivityDate: currentDate,
    notes: `Candidate originated from Applicant Leads Roster (Lead ID: ${lead.id}). Initial Intake Notes: ${lead.notes || "Transferred to Talent Pool."}`,

    address: `${lead.preferredSite || "Tagum City"}, Davao Region, Philippines`,
    civilStatus: "Single",
    citizenship: "Filipino",

    skills: [
      "Customer Engagement",
      "Inbound Communication",
      "Account Processing",
      lead.department === "Call Center Operations" ? "Voice Support" : "Operations"
    ],
    languages: ["English (Conversational B2)", "Filipino (Native)", "Cebuano"],

    assessmentStatus: "Screened from Inbound Lead",
    testScore: "85/100 (Initial Intake Evaluated)",
    overallResult: "Passed",
    assessmentRemarks: `Transferred from Applicant Lead intake by ${transferredBy}. Pre-screened for ${lead.specificAccount || "Operations"}.`,

    vaccinationStatus: "Fully Vaccinated",
    willingOnSite: true,
    graveyardShiftReadiness: true,
    employmentInterest: `Full-Time On-Site (${lead.preferredSite || "Tagum City"})`,

    workExperience: [
      {
        company: "Previous Client Experience",
        position: "Customer Service Associate",
        industry: "BPO / Call Center",
        tenure: "1 year 6 months",
        monthlySalary: "₱22,000",
        reasonForLeaving: "Applied for opportunity at SiBS"
      }
    ],

    education: [
      {
        level: "College",
        schoolName: lead.preferredSite === "Davao City" ? "University of Southeastern Philippines" : "University of Mindanao",
        degreeCourse: "BS Business Administration / Associate",
        gradYear: "2023",
        address: lead.preferredSite || "Tagum City"
      }
    ],

    // Lead History embedded in Candidate History
    history: [
      {
        date: lead.dateLogged || currentDate,
        action: `Inbound Applicant Lead logged (Lead ID: ${lead.id}, Channel: ${lead.source}, Site: ${lead.preferredSite}, Account: ${lead.specificAccount})`,
        user: lead.inputtedBy || "Crister Canitan"
      },
      {
        date: lead.lastContactDate || lead.dateLogged || currentDate,
        action: `Applicant lead status updated to "${lead.status}". Application link sent & contact recorded.`,
        user: lead.inputtedBy || "Crister Canitan"
      },
      {
        date: currentDate,
        action: `Lead converted and transferred to Talent Pool Master Archive (Talent Pool ID: ${generatedId}). Status assigned: Silver Pool.`,
        user: transferredBy || "Crister Canitan"
      }
    ]
  };
}

// ==================== LOCALSTORAGE PERSISTENCE KEYS & HELPERS ====================

export const STORAGE_KEYS = {
  PIPELINE_CANDIDATES: "sibs_recruitment_pipeline_candidates_v2",
  APPLICANT_LEADS: "sibs_applicant_leads_v2",
  ARCHIVED_LEADS: "sibs_archived_leads_v2",
  TALENT_POOL: "sibs_talent_pool_candidates_v2",
  HIRING_NEEDS: "sibs_hiring_needs_requests_v2",
  AVAILABLE_POSITIONS: "sibs_available_positions_v2",
  JOB_DESCRIPTIONS: "sibs_job_descriptions_v2",
  EMAIL_LOGS: "sibs_email_logs_v2",
  ONBOARDING_RECORDS: "sibs_onboarding_records_v2"
};

export function loadFromLocalStorage<T>(key: string, fallback: T): T {
  try {
    if (typeof window === "undefined") return fallback;
    const item = window.localStorage.getItem(key);
    if (!item) return fallback;
    return JSON.parse(item) as T;
  } catch (error) {
    console.warn(`Error reading localStorage key "${key}":`, error);
    return fallback;
  }
}

export function saveToLocalStorage<T>(key: string, data: T): void {
  try {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.warn(`Error writing to localStorage key "${key}":`, error);
  }
}

// Broadcast helper so components can sync in real-time
export function broadcastDataChange(channel: string): void {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("sibs_store_update", { detail: { channel } }));
  }
}

