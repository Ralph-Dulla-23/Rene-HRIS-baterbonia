import React, { useState, useMemo, useEffect } from "react";
import {
  UserCheck,
  Search,
  Filter,
  RefreshCw,
  Plus,
  Eye,
  CheckCircle,
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

// ==========================================
// STORAGE KEYS FOR CROSS-MODULE SYNC
// ==========================================
export const ONBOARDING_STORAGE_KEY = "onboarding_records_data";
export const OFFERS_STORAGE_KEY = "offers_management_data";
export const PIPELINE_CANDIDATES_STORAGE_KEY = "pipeline_candidates_data";
export const EMPLOYEE_DIRECTORY_STORAGE_KEY = "employee_directory_records";
export const TALENT_POOL_STORAGE_KEY = "talent_pool_records";
export const PIPELINE_SYNC_EVENTS_KEY = "pipeline_sync_events";

interface OnboardingProps {
  userEmail?: string;
  onSwitchModule?: (module: string) => void;
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
  showStatus: "Pending" | "Show" | "No Show" | "Withdrawn";
  finalOutcome: "Pending Start" | "True Hire" | "No Show" | "Pre-start Withdrawal";
  owner: string; // Recruiter/Owner
  feedbackRating?: number; // 1 to 5 stars
  withdrawalReason?: string;
  withdrawalNotes?: string;
  convertedEmployeeId?: string; // SIB-2026-XXX ID when converted
  auditTrail: { date: string; action: string; user: string }[];
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

function getShowStatusClass(status = "Pending") {
  if (status === "Show") {
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }

  if (status === "No Show") {
    return "border-red-200 bg-red-50 text-red-700";
  }

  if (status === "Withdrawn") {
    return "border-orange-200 bg-orange-50 text-orange-700";
  }

  return "border-amber-200 bg-amber-50 text-amber-700";
}

function getOutcomeClass(outcome = "Pending Start") {
  if (outcome === "True Hire") {
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }

  if (outcome === "No Show") {
    return "border-red-200 bg-red-50 text-red-700";
  }

  if (outcome === "Pre-start Withdrawal") {
    return "border-orange-200 bg-orange-50 text-orange-700";
  }

  return "border-amber-200 bg-amber-50 text-amber-700";
}

export default function Onboarding({ userEmail = "alena.batacan@thesiblingssolutions.com", onSwitchModule }: OnboardingProps) {
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

  // Search & Filtering State
  const [searchTerm, setSearchTerm] = useState("");
  const [showStatusFilter, setShowStatusFilter] = useState("All");
  const [outcomeFilter, setOutcomeFilter] = useState("All");
  const [locationFilter, setLocationFilter] = useState("All");
  const [ownerFilter, setOwnerFilter] = useState("All");

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

  // Filtered Onboarding Records
  const filteredRecords = useMemo(() => {
    return records.filter(r => {
      const matchSearch =
        r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.account.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (r.siteLocation && r.siteLocation.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchShowStatus = showStatusFilter === "All" ? true : r.showStatus === showStatusFilter;
      const matchOutcome = outcomeFilter === "All" ? true : r.finalOutcome === outcomeFilter;
      const matchLocation = locationFilter === "All" ? true : r.siteLocation === locationFilter;
      const matchOwner = ownerFilter === "All" ? true : r.owner === ownerFilter;

      return matchSearch && matchShowStatus && matchOutcome && matchLocation && matchOwner;
    });
  }, [records, searchTerm, showStatusFilter, outcomeFilter, locationFilter, ownerFilter]);

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
    setOutcomeShowStatus(record.showStatus);
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
    if (outcomeShowStatus === "Show") {
      finalOutcomeState = "True Hire";
    } else if (outcomeShowStatus === "No Show") {
      finalOutcomeState = "No Show";
    } else if (outcomeShowStatus === "Withdrawn") {
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

          return {
            ...r,
            showStatus: outcomeShowStatus,
            finalOutcome: finalOutcomeState,
            actualStartDate: outcomeShowStatus === "Show" ? outcomeActualDate : undefined,
            feedbackRating: outcomeFeedbackRating,
            withdrawalReason: (outcomeShowStatus === "No Show" || outcomeShowStatus === "Withdrawn") ? outcomeWithdrawalReason : undefined,
            withdrawalNotes: (outcomeShowStatus === "No Show" || outcomeShowStatus === "Withdrawn") ? outcomeWithdrawalNotes : undefined,
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
                Recruitment View
              </span>
              <span className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[9px] font-extrabold text-emerald-700">
                True Hire Conversion
              </span>
            </div>

            <h1 className="text-xl font-black tracking-tight text-[#042C51] sm:text-2xl 2xl:text-[28px]">
              Onboarding
            </h1>
            <p className="mt-1 max-w-4xl text-xs font-medium leading-5 text-[#667085] 2xl:text-[13px]">
              Track accepted offers through expected start, actual start, Show / No Show,
              pre-start withdrawal, and final True Hire conversion.
            </p>
          </div>

          <div className="flex w-full flex-wrap items-center gap-2 xl:w-auto xl:justify-end">
            <button
              type="button"
              onClick={handleResetDatabase}
              className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[#D7E0EA] bg-white text-[#475467] transition hover:border-[#FF5C28]/40 hover:bg-[#FFF8F5] hover:text-[#FF5C28]"
              title="Restore default onboarding data"
              aria-label="Restore default onboarding data"
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
      </section>

      {/* Summary Metrics */}
      <section
        aria-label="Onboarding Summary"
        className="grid grid-cols-2 gap-2.5 md:grid-cols-3 xl:grid-cols-6 2xl:gap-3"
      >
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

      {/* Outcome Overview + Governance */}
      <section className="grid grid-cols-1 gap-4 lg:grid-cols-12">
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

      {/* Records */}
      <section className="relative z-[10] overflow-visible rounded-2xl border border-[#DCE5EF] bg-white shadow-[0_8px_22px_rgba(4,44,81,0.04)]">
        <header className="border-b border-[#E6ECF2] bg-white p-4 sm:p-5 2xl:p-6">
          <div className="flex flex-col gap-1">
            <h2 className="text-sm font-bold tracking-tight text-[#042C51] 2xl:text-base">
              Onboarding Records
            </h2>
            <p className="text-xs font-semibold leading-relaxed text-[#667085]">
              Search, filter, review, and resolve candidate start outcomes.
            </p>
          </div>

          <div className="relative z-[90] mt-3.5 grid grid-cols-1 gap-2.5 sm:grid-cols-2 xl:grid-cols-[minmax(320px,1fr)_155px_190px_165px_175px_auto] 2xl:mt-4">
            <div className="relative min-w-0">
              <Search
                size={15}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#98A2B3]"
              />
              <input
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search candidate, onboarding ID, email, role, account, or site..."
                className="h-10 w-full rounded-xl border border-[#D7DEE8] bg-white pl-9 pr-9 text-xs font-semibold text-[#042C51] outline-none transition placeholder:text-[#98A2B3] hover:border-[#FF5C28]/40 focus:border-[#FF5C28] focus:ring-4 focus:ring-[#FF5C28]/10"
              />
              {searchTerm ? (
                <button
                  type="button"
                  onClick={() => setSearchTerm("")}
                  className="absolute right-2.5 top-1/2 inline-flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-md text-[#98A2B3] transition hover:bg-[#FFF7F3] hover:text-[#FF5C28]"
                  aria-label="Clear onboarding search"
                >
                  <X size={13} />
                </button>
              ) : null}
            </div>

            <select
              value={showStatusFilter}
              onChange={(event) => setShowStatusFilter(event.target.value)}
              className="h-10 w-full rounded-xl border border-[#D7DEE8] bg-[#F8FAFC] px-3 text-xs font-semibold text-[#042C51] outline-none transition hover:border-[#FF5C28]/40 hover:bg-white focus:border-[#FF5C28] focus:bg-white focus:ring-4 focus:ring-[#FF5C28]/10"
            >
              <option value="All">All Status</option>
              <option value="Pending">Pending</option>
              <option value="Show">Show</option>
              <option value="No Show">No Show</option>
              <option value="Withdrawn">Withdrawn</option>
            </select>

            <select
              value={outcomeFilter}
              onChange={(event) => setOutcomeFilter(event.target.value)}
              className="h-10 w-full rounded-xl border border-[#D7DEE8] bg-[#F8FAFC] px-3 text-xs font-semibold text-[#042C51] outline-none transition hover:border-[#FF5C28]/40 hover:bg-white focus:border-[#FF5C28] focus:bg-white focus:ring-4 focus:ring-[#FF5C28]/10"
            >
              <option value="All">All Outcomes</option>
              <option value="Pending Start">Pending Start</option>
              <option value="True Hire">True Hire</option>
              <option value="No Show">No Show</option>
              <option value="Pre-start Withdrawal">Pre-start Withdrawal</option>
            </select>

            <select
              value={locationFilter}
              onChange={(event) => setLocationFilter(event.target.value)}
              className="h-10 w-full rounded-xl border border-[#D7DEE8] bg-[#F8FAFC] px-3 text-xs font-semibold text-[#042C51] outline-none transition hover:border-[#FF5C28]/40 hover:bg-white focus:border-[#FF5C28] focus:bg-white focus:ring-4 focus:ring-[#FF5C28]/10"
            >
              {locationsList.map((location, idx) => (
                <option key={`loc-${location}-${idx}`} value={location}>
                  {location === "All" ? "All Sites" : location}
                </option>
              ))}
            </select>

            <select
              value={ownerFilter}
              onChange={(event) => setOwnerFilter(event.target.value)}
              className="h-10 w-full rounded-xl border border-[#D7DEE8] bg-[#F8FAFC] px-3 text-xs font-semibold text-[#042C51] outline-none transition hover:border-[#FF5C28]/40 hover:bg-white focus:border-[#FF5C28] focus:bg-white focus:ring-4 focus:ring-[#FF5C28]/10"
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
                setShowStatusFilter("All");
                setOutcomeFilter("All");
                setLocationFilter("All");
                setOwnerFilter("All");
              }}
              disabled={
                !searchTerm &&
                showStatusFilter === "All" &&
                outcomeFilter === "All" &&
                locationFilter === "All" &&
                ownerFilter === "All"
              }
              className="inline-flex h-10 w-full items-center justify-center gap-1.5 rounded-xl border border-[#D7DEE8] bg-white px-3 text-xs font-extrabold text-[#667085] transition hover:border-[#FF5C28]/40 hover:bg-[#FFF8F5] hover:text-[#FF5C28] disabled:cursor-not-allowed disabled:opacity-45 xl:w-auto"
            >
              <Filter size={14} />
              Clear
            </button>
          </div>
        </header>

        <div className="relative z-[1] p-4 sm:p-5 2xl:p-6">
          {/* Desktop */}
          <div className="hidden overflow-hidden rounded-xl border border-[#E6ECF2] bg-white md:block">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1180px] border-collapse bg-white">
                <thead className="bg-[#F8FAFC]">
                  <tr className="border-b border-[#E6ECF2] text-[10px] font-extrabold uppercase text-[#667085]">
                    {[
                      ["ONBOARDING ID", "text-left"],
                      ["CANDIDATE", "text-left"],
                      ["ASSIGNMENT", "text-left"],
                      ["OFFER ACCEPTED", "text-left"],
                      ["EXPECTED START", "text-left"],
                      ["ACTUAL START", "text-left"],
                      ["SHOW STATUS", "text-center"],
                      ["FINAL OUTCOME", "text-center"],
                      ["TA OWNER", "text-left"],
                      ["ACTION", "text-right"],
                    ].map(([header, align]) => (
                      <th key={header} className={`whitespace-nowrap px-4 py-3.5 ${align}`}>
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody className="divide-y divide-[#F1F5F9]">
                  {filteredRecords.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="px-5 py-12 text-center text-xs font-bold text-[#667085]">
                        No onboarding records match the current search and filters.
                      </td>
                    </tr>
                  ) : (
                    filteredRecords.map((record) => (
                      <tr
                        key={record.id}
                        className="group transition-colors hover:bg-[#F8FAFC]"
                      >
                        <td className="whitespace-nowrap px-4 py-2.5 align-middle text-xs font-extrabold text-[#042C51]">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedRecord(record);
                              setIsDetailsModalOpen(true);
                            }}
                            className="font-extrabold tabular-nums text-[#042C51] transition hover:text-[#FF5C28]"
                          >
                            {record.id}
                          </button>
                        </td>

                        <td className="whitespace-nowrap px-4 py-2.5 align-middle text-xs">
                          <div className="flex min-w-0 items-center gap-2.5">
                            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#042C51] text-[10px] font-extrabold text-white shadow-sm">
                              {getInitials(record.name)}
                            </span>
                            <div className="min-w-0">
                              <p className="m-0 max-w-[210px] truncate font-extrabold text-[#042C51]">
                                {record.name}
                              </p>
                              <p className="mt-0.5 max-w-[210px] truncate text-[10px] font-semibold text-[#667085]">
                                {record.email || "No email saved"}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="whitespace-nowrap px-4 py-2.5 align-middle text-xs">
                          <p className="max-w-[210px] truncate font-extrabold text-[#344054]">
                            {record.role}
                          </p>
                          <span className="mt-0.5 inline-flex max-w-[210px] truncate rounded bg-[#F2F4F7] px-1.5 py-0.5 text-[10px] font-bold text-[#475467]">
                            {record.account || "No account"}
                          </span>
                          <p className="mt-0.5 flex max-w-[210px] items-center gap-1 truncate text-[9.5px] font-semibold text-[#667085]">
                            <MapPin size={10} className="shrink-0 text-[#FF5C28]" />
                            {record.siteLocation || "No site"}
                          </p>
                        </td>

                        <td className="whitespace-nowrap px-4 py-2.5 align-middle text-xs font-semibold text-[#344054]">
                          <div className="flex items-center gap-1.5">
                            <Calendar size={13} className="shrink-0 text-[#98A2B3]" />
                            <span className="tabular-nums">{formatDisplayDate(record.offerAcceptedDate)}</span>
                          </div>
                        </td>

                        <td className="whitespace-nowrap px-4 py-2.5 align-middle text-xs font-extrabold tabular-nums text-[#042C51]">
                          {formatDisplayDate(record.expectedStartDate)}
                          <p className="mt-0.5 text-[9.5px] font-bold text-indigo-600">
                            {record.daysToStart || 0} day/s to start
                          </p>
                        </td>

                        <td className="whitespace-nowrap px-4 py-2.5 align-middle text-xs font-semibold tabular-nums text-[#475467]">
                          {formatDisplayDate(record.actualStartDate)}
                        </td>

                        <td className="whitespace-nowrap px-4 py-2.5 text-center align-middle text-xs">
                          <span className={`inline-flex rounded-full border px-2.5 py-1 text-[9px] font-extrabold ${getShowStatusClass(record.showStatus)}`}>
                            {record.showStatus}
                          </span>
                        </td>

                        <td className="whitespace-nowrap px-4 py-2.5 text-center align-middle text-xs">
                          <span className={`inline-flex whitespace-nowrap rounded-full border px-2.5 py-1 text-[9px] font-extrabold ${getOutcomeClass(record.finalOutcome)}`}>
                            {record.finalOutcome}
                          </span>
                          {record.convertedEmployeeId ? (
                            <p className="mt-1 font-mono text-[9px] font-bold text-emerald-700">
                              #{record.convertedEmployeeId}
                            </p>
                          ) : null}
                        </td>

                        <td className="whitespace-nowrap px-4 py-2.5 align-middle text-xs font-semibold text-[#475467]">
                          <span className="block max-w-[150px] truncate">{record.owner || "—"}</span>
                        </td>

                        <td className="whitespace-nowrap px-4 py-2.5 text-right align-middle text-xs">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleOpenOutcomeModal(record)}
                              className={`inline-flex h-8 items-center justify-center rounded-lg px-2.5 text-[10px] font-extrabold transition active:scale-[0.98] ${
                                record.showStatus === "Pending"
                                  ? "bg-[#FF5C28] text-white hover:bg-[#E94F1F]"
                                  : "border border-[#D7DEE8] bg-white text-[#475467] hover:border-[#FF5C28]/40 hover:bg-[#FFF8F5] hover:text-[#FF5C28]"
                              }`}
                            >
                              {record.showStatus === "Pending" ? "Set Outcome" : "Modify Outcome"}
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                setSelectedRecord(record);
                                setIsDetailsModalOpen(true);
                              }}
                              className="inline-flex h-8 items-center justify-center gap-1.5 rounded-lg border border-[#D7DEE8] bg-white px-2.5 text-[10px] font-extrabold text-[#042C51] transition hover:border-[#FF5C28]/40 hover:bg-[#FFF7F3] hover:text-[#FF5C28]"
                            >
                              <Eye size={13} />
                              View
                            </button>

                            {record.finalOutcome === "True Hire" && onSwitchModule ? (
                              <button
                                type="button"
                                onClick={() => onSwitchModule("Employee Directory")}
                                className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-700 transition hover:bg-emerald-100"
                                title="Open Employee Directory"
                              >
                                <ExternalLink size={13} />
                              </button>
                            ) : null}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile */}
          <div className="space-y-3 md:hidden">
            {filteredRecords.length === 0 ? (
              <div className="rounded-xl border border-dashed border-[#D7DEE8] bg-[#F8FAFC] p-8 text-center">
                <UserCheck className="mx-auto h-7 w-7 text-[#98A2B3]" />
                <p className="mt-2 text-xs font-extrabold text-[#475467]">
                  No onboarding records found
                </p>
                <p className="mt-1 text-[10px] font-semibold text-[#98A2B3]">
                  Adjust the current search or filters.
                </p>
              </div>
            ) : (
              filteredRecords.map((record) => (
                <button
                  type="button"
                  key={record.id}
                  onClick={() => {
                    setSelectedRecord(record);
                    setIsDetailsModalOpen(true);
                  }}
                  className="w-full rounded-xl border border-[#E6ECF2] bg-white p-4 text-left shadow-sm transition hover:border-[#FF5C28]/30 hover:shadow-md"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-start gap-3">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#042C51] text-xs font-extrabold text-white">
                        {getInitials(record.name)}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-extrabold text-[#042C51]">
                          {record.name}
                        </p>
                        <p className="mt-0.5 font-mono text-[10px] font-extrabold uppercase tracking-wide text-[#FF5C28]">
                          {record.id}
                        </p>
                        <p className="mt-1 truncate text-[10px] font-semibold text-[#667085]">
                          {record.email}
                        </p>
                      </div>
                    </div>

                    <div className="flex shrink-0 flex-col items-end gap-1">
                      <span className={`rounded-full border px-2 py-0.5 text-[9px] font-extrabold ${getShowStatusClass(record.showStatus)}`}>
                        {record.showStatus}
                      </span>
                      <span className={`rounded-full border px-2 py-0.5 text-[9px] font-extrabold ${getOutcomeClass(record.finalOutcome)}`}>
                        {record.finalOutcome}
                      </span>
                    </div>
                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-2 rounded-xl border border-[#EEF2F6] bg-[#F8FAFC] p-3">
                    <div className="min-w-0">
                      <p className="text-[9px] font-extrabold uppercase tracking-wide text-[#98A2B3]">
                        Role Assignment
                      </p>
                      <p className="mt-0.5 truncate text-xs font-bold text-[#042C51]">{record.role}</p>
                      <p className="truncate text-[10px] font-semibold text-[#667085]">{record.account}</p>
                    </div>
                    <div className="min-w-0 border-l border-[#E6ECF2] pl-3">
                      <p className="text-[9px] font-extrabold uppercase tracking-wide text-[#98A2B3]">
                        Expected Start
                      </p>
                      <p className="mt-0.5 text-xs font-bold text-[#042C51]">
                        {formatDisplayDate(record.expectedStartDate)}
                      </p>
                      <p className="text-[10px] font-semibold text-[#667085]">
                        Owner: {record.owner}
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-between border-t border-[#EEF2F6] pt-3">
                    <span className="text-[10px] font-semibold text-[#667085]">
                      {record.siteLocation || "No site"}
                    </span>
                    <span className="flex items-center gap-1 text-[11px] font-bold text-[#FF5C28]">
                      <Eye size={12} />
                      View Record
                      <ChevronRight size={12} />
                    </span>
                  </div>
                </button>
              ))
            )}
          </div>

          <div className="mt-3 flex items-center justify-between gap-3 border-t border-[#EEF2F6] pt-3 text-[10px] font-semibold text-[#667085]">
            <span>
              Showing <strong className="text-[#042C51]">{filteredRecords.length}</strong> of{" "}
              <strong className="text-[#042C51]">{records.length}</strong> onboarding records
            </span>
            <span className="hidden sm:inline">Accepted Offer → Onboarding → Final Start Outcome</span>
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

      {/* Details Modal */}
      <AnimatePresence>
        {isDetailsModalOpen && selectedRecord && (
          <div
            className="fixed inset-0 z-[10000] flex h-dvh items-center justify-center bg-[#042C51]/60 px-2 py-2 font-jakarta backdrop-blur-sm sm:px-4 sm:py-4"
            onMouseDown={() => setIsDetailsModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.97, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.97, opacity: 0 }}
              className="flex max-h-[92dvh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
              onMouseDown={(event) => event.stopPropagation()}
            >
              <header className="flex shrink-0 items-start justify-between gap-4 bg-[#042C51] px-5 py-4 text-white sm:px-6">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    {/* Single Unified Status Badge */}
                    {selectedRecord.finalOutcome === "True Hire" ? (
                      <span className="rounded-full border border-emerald-400 bg-emerald-500/20 px-3 py-1 text-[10.5px] font-black text-emerald-300 flex items-center gap-1.5 shadow-2xs">
                        <CheckCircle size={13} className="text-emerald-400" />
                        True Hire • Day 1 Completed
                      </span>
                    ) : selectedRecord.finalOutcome === "No Show" ? (
                      <span className="rounded-full border border-rose-400 bg-rose-500/20 px-3 py-1 text-[10.5px] font-black text-rose-300 flex items-center gap-1.5 shadow-2xs">
                        <AlertTriangle size={13} className="text-rose-400" />
                        No Show • Candidate Did Not Report
                      </span>
                    ) : selectedRecord.finalOutcome === "Pre-start Withdrawal" ? (
                      <span className="rounded-full border border-orange-400 bg-orange-500/20 px-3 py-1 text-[10.5px] font-black text-orange-300 flex items-center gap-1.5 shadow-2xs">
                        <AlertTriangle size={13} className="text-orange-400" />
                        Pre-start Withdrawn • Dropped Before Day 1
                      </span>
                    ) : (
                      <span className="rounded-full border border-blue-400 bg-blue-500/20 px-3 py-1 text-[10.5px] font-black text-blue-200 flex items-center gap-1.5 shadow-2xs">
                        <Clock size={13} className="text-blue-300" />
                        Pre-Boarding • Starts in {selectedRecord.daysToStart || 0} Day/s
                      </span>
                    )}
                  </div>

                  <h2 className="mt-2 truncate text-sm font-extrabold text-white sm:text-base">
                    {selectedRecord.name}
                  </h2>
                  <p className="mt-0.5 truncate text-[10px] font-semibold text-white/75">
                    {selectedRecord.email || "No email saved"} • Onboarding ID: {selectedRecord.id}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setIsDetailsModalOpen(false)}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-white/15 bg-white/10 text-white/80 transition hover:border-[#FF5C28]/60 hover:bg-[#FF5C28] hover:text-white"
                  aria-label="Close onboarding details"
                >
                  <X size={17} />
                </button>
              </header>

              <div className="min-h-0 flex-1 overflow-y-auto bg-[#F7F9FC] p-4 sm:p-5">
                <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_340px]">
                  <div className="min-w-0 space-y-4">
                    {/* Candidate Assignment Card */}
                    <section className="rounded-2xl border border-[#E6ECF2] bg-white p-4 shadow-sm sm:p-5">
                      <div className="flex flex-col gap-4 md:flex-row md:items-stretch md:justify-between">
                        <div className="min-w-0 flex-1 space-y-2">
                          <p className="text-[9px] font-extrabold uppercase tracking-wide text-[#98A2B3]">
                            Position & Account Assignment
                          </p>
                          <h3 className="text-sm font-extrabold text-[#042C51]">
                            {selectedRecord.role || "Not assigned"}
                          </h3>
                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-600">
                            <span>Account: <strong className="text-[#042C51]">{selectedRecord.account || "No account"}</strong></span>
                            <span>•</span>
                            <span>Location: <strong className="text-[#042C51]">{selectedRecord.siteLocation || "No location"}</strong></span>
                          </div>

                          <div className="pt-2 flex flex-wrap gap-2">
                            <span className="rounded-xl border border-[#E6ECF2] bg-[#F8FAFC] px-3 py-1 text-[10px] font-bold text-[#475467]">
                              Offer Accepted: <strong className="text-[#042C51]">{formatDisplayDate(selectedRecord.offerAcceptedDate)}</strong>
                            </span>
                            <span className="rounded-xl border border-[#E6ECF2] bg-[#F8FAFC] px-3 py-1 text-[10px] font-bold text-[#475467]">
                              Owner: <strong className="text-[#042C51]">{selectedRecord.owner || "—"}</strong>
                            </span>
                          </div>
                        </div>

                        <div className="relative min-w-[220px] overflow-hidden rounded-2xl bg-[#042C51] p-4 text-white shadow-sm shrink-0">
                          <div className="pointer-events-none absolute -right-4 -top-4 h-20 w-20 rounded-full bg-[#FF5C28]/15 blur-2xl" />
                          <div className="relative z-10 flex items-center gap-3">
                            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#FF5C28]/30 bg-[#FF5C28]/15 text-[#FF5C28]">
                              <Calendar size={18} />
                            </span>
                            <div>
                              <p className="text-[9px] font-extrabold uppercase tracking-wide text-slate-300">
                                Expected Start Date
                              </p>
                              <p className="mt-0.5 text-sm font-extrabold text-white">
                                {formatDisplayDate(selectedRecord.expectedStartDate)}
                              </p>
                              <p className="mt-1 text-[9px] font-bold text-[#FFB9A2]">
                                {selectedRecord.daysToStart || 0} day/s to start
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </section>

                    {/* Streamlined 3-Step Lifecycle */}
                    <section className="rounded-2xl border border-[#E6ECF2] bg-white p-4 shadow-sm sm:p-5">
                      <div className="mb-4 flex items-center gap-2 border-b border-[#EEF2F6] pb-3">
                        <Clock size={15} className="text-[#FF5C28]" />
                        <div>
                          <h3 className="text-xs font-extrabold text-[#042C51]">
                            3-Step Onboarding Lifecycle
                          </h3>
                          <p className="mt-0.5 text-[10px] font-semibold text-[#667085]">
                            Clear trajectory from offer acceptance to verified Day 1 start.
                          </p>
                        </div>
                      </div>

                      {[
                        ["1", "Offer Acceptance", `Candidate confirmed offer on ${formatDisplayDate(selectedRecord.offerAcceptedDate)}`, "border-blue-200 bg-blue-50 text-[#042C51]"],
                        ["2", "Pre-Boarding & Orientation", `IT provisioning, Kronos ID generation, and WFM workstation allocation prior to ${formatDisplayDate(selectedRecord.expectedStartDate)}`, "border-amber-200 bg-amber-50 text-amber-700"],
                        [
                          "3",
                          "First Day Outcome & Journey Transition",
                          selectedRecord.finalOutcome === "True Hire"
                            ? `✓ True Hire confirmed (Actual Start: ${formatDisplayDate(selectedRecord.actualStartDate)}). Active in 30-60-90 Employee Journey.`
                            : selectedRecord.finalOutcome === "No Show"
                              ? `✕ No Show recorded. Candidate did not report on scheduled start date.`
                              : selectedRecord.finalOutcome === "Pre-start Withdrawal"
                                ? `✕ Pre-start withdrawal recorded. Candidate withdrew before Day 1.`
                                : `Pending arrival on scheduled Day 1 (${formatDisplayDate(selectedRecord.expectedStartDate)}).`,
                          selectedRecord.finalOutcome === "True Hire"
                            ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                            : selectedRecord.finalOutcome === "No Show"
                              ? "border-red-200 bg-red-50 text-red-700"
                              : selectedRecord.finalOutcome === "Pre-start Withdrawal"
                                ? "border-orange-200 bg-orange-50 text-orange-700"
                                : "border-slate-200 bg-slate-50 text-slate-700",
                        ],
                      ].map(([number, title, value, tone], index, all) => (
                        <div key={String(number)} className="relative flex gap-3.5">
                          <div className="relative flex shrink-0 flex-col items-center">
                            <span className={`relative z-10 flex h-8 w-8 items-center justify-center rounded-full border text-[10px] font-extrabold ${tone}`}>
                              {number}
                            </span>
                            {index < all.length - 1 ? (
                              <span className="mt-1 h-full min-h-8 w-px bg-[#D7DEE8]" />
                            ) : null}
                          </div>
                          <div className={`min-w-0 flex-1 ${index < all.length - 1 ? "pb-4" : ""}`}>
                            <div className="rounded-xl border border-[#E6ECF2] bg-[#F8FAFC] px-3.5 py-3">
                              <p className="text-xs font-extrabold text-[#101828]">{title}</p>
                              <p className="mt-1 text-[10px] font-semibold text-[#667085]">{value}</p>
                            </div>
                          </div>
                        </div>
                      ))}

                      {(selectedRecord.showStatus === "No Show" || selectedRecord.showStatus === "Withdrawn" || selectedRecord.finalOutcome === "No Show" || selectedRecord.finalOutcome === "Pre-start Withdrawal") && (
                        <div className="mt-4 rounded-xl border border-rose-100 bg-rose-50 p-3 text-[10px] font-semibold leading-5 text-rose-800 space-y-1">
                          <div className="flex items-center gap-1.5 font-extrabold">
                            <AlertTriangle size={13} className="text-rose-600" />
                            <span>Logged Reason for Drop-off:</span>
                          </div>
                          <p>{selectedRecord.withdrawalReason || "No specific withdrawal explanation provided by candidate."}</p>
                        </div>
                      )}
                    </section>

                    {/* Auditable History */}
                    <section className="rounded-2xl border border-[#E6ECF2] bg-white p-4 shadow-sm sm:p-5">
                      <h3 className="text-xs font-extrabold text-[#042C51]">
                        Auditable Transition History
                      </h3>
                      <div className="mt-4 ml-2.5 space-y-3.5 border-l-2 border-[#E6ECF2] pl-4">
                        {selectedRecord.auditTrail.map((log, index) => (
                          <div key={`${log.date}-${index}`} className="relative text-xs text-[#475467]">
                            <span className="absolute -left-[21px] top-1 h-2.5 w-2.5 rounded-full border-2 border-white bg-[#042C51]" />
                            <p className="font-bold text-[#042C51]">{log.action}</p>
                            <div className="mt-0.5 flex items-center gap-2 text-[10px] font-semibold text-[#98A2B3]">
                              <span>{formatDisplayDate(log.date)}</span>
                              <span>•</span>
                              <span>Actor: {log.user}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </section>
                  </div>

                  {/* Right Sidebar: Dedicated Action & Governance Panel (No Duplicated Role/Account/Location fields!) */}
                  <aside className="space-y-4 xl:sticky xl:top-0 xl:self-start">
                    {/* Outcome Action / Resolution Panel */}
                    {!["True Hire", "No Show", "Pre-start Withdrawal"].includes(selectedRecord.finalOutcome) ? (
                      <section className="rounded-2xl border-2 border-[#FF5C28]/30 bg-white p-5 shadow-sm space-y-3">
                        <div className="flex items-center gap-2">
                          <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-[#FF5C28] text-white">
                            <Settings size={13} />
                          </span>
                          <h3 className="text-xs font-black text-[#042C51] uppercase tracking-wide">
                            Day 1 Outcome Action
                          </h3>
                        </div>
                        <p className="text-[11px] text-slate-600">
                          Confirm whether the candidate reported on their scheduled start date.
                        </p>

                        <div className="space-y-2 pt-1">
                          <button
                            type="button"
                            onClick={() => {
                              setIsDetailsModalOpen(false);
                              handleOpenOutcomeModal(selectedRecord);
                            }}
                            className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-[#FF5C28] hover:bg-[#E94F1F] px-4 text-xs font-black text-white shadow-xs transition-colors cursor-pointer"
                          >
                            <CheckCircle size={15} />
                            Resolve Start Outcome (Show / No Show)
                          </button>
                        </div>
                      </section>
                    ) : (
                      <section className={`rounded-2xl border p-5 space-y-3 ${
                        selectedRecord.finalOutcome === "True Hire"
                          ? "border-emerald-200 bg-emerald-50/70"
                          : "border-slate-200 bg-slate-50"
                      }`}>
                        <div className="flex items-start gap-2.5">
                          <CheckCircle size={18} className={`mt-0.5 shrink-0 ${
                            selectedRecord.finalOutcome === "True Hire" ? "text-emerald-600" : "text-slate-500"
                          }`} />
                          <div>
                            <h3 className={`text-xs font-black ${
                              selectedRecord.finalOutcome === "True Hire" ? "text-emerald-900" : "text-slate-800"
                            }`}>
                              {selectedRecord.finalOutcome === "True Hire" ? "True Hire Finalized" : "Outcome Resolved"}
                            </h3>
                            <p className="mt-1 text-[11px] leading-relaxed font-medium text-slate-600">
                              {selectedRecord.finalOutcome === "True Hire"
                                ? "Candidate completed Day 1 onboarding and transitioned into active operations & 30-60-90 Journey."
                                : `Candidate was marked as ${selectedRecord.finalOutcome}. No further pre-boarding actions required.`}
                            </p>
                          </div>
                        </div>

                        {selectedRecord.finalOutcome === "True Hire" && onSwitchModule && (
                          <button
                            type="button"
                            onClick={() => {
                              setIsDetailsModalOpen(false);
                              onSwitchModule("Employee Directory");
                            }}
                            className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-[#042C51] hover:bg-[#0B365F] px-4 text-xs font-black text-white shadow-xs transition-colors cursor-pointer"
                          >
                            <ExternalLink size={14} />
                            Open Employee Journey (30-60-90) →
                          </button>
                        )}
                      </section>
                    )}

                    {/* Candidate Remarks & Internal Notes */}
                    <section className="rounded-2xl border border-[#E6ECF2] bg-white p-4 shadow-sm space-y-2">
                      <h4 className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                        Internal Recruiter Remarks
                      </h4>
                      <p className="text-xs font-medium text-slate-700 italic bg-[#F7F9FC] p-3 rounded-xl border border-slate-100">
                        "{selectedRecord.withdrawalNotes || selectedRecord.withdrawalReason || "Pre-boarding candidate in good standing with confirmed start date."}"
                      </p>
                    </section>

                    {/* Governance Guide */}
                    <section className="rounded-2xl border border-[#042C51]/15 bg-[#042C51]/5 p-4 text-[#042C51] space-y-1">
                      <div className="flex items-center gap-2">
                        <Info size={14} className="text-[#FF5C28]" />
                        <h4 className="text-xs font-black uppercase tracking-wider">
                          Onboarding Policy
                        </h4>
                      </div>
                      <p className="text-[10.5px] leading-relaxed font-medium text-slate-600">
                        Only verified Shows count as True Hires. True Hires immediately transition into L&D nesting and 30-day checkpoint milestones.
                      </p>
                    </section>
                  </aside>
                </div>
              </div>

              <footer className="shrink-0 border-t border-[#E6ECF2] bg-white px-5 py-3.5 sm:px-6">
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => setIsDetailsModalOpen(false)}
                    className="inline-flex h-10 items-center justify-center rounded-lg border border-[#D6E0EA] bg-white px-4 text-xs font-extrabold text-[#667085] transition hover:bg-[#F8FAFC] hover:text-[#042C51]"
                  >
                    Close Details
                  </button>
                </div>
              </footer>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

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
                    Outcome Resolution
                  </span>
                  <h2 className="mt-2 text-sm font-extrabold text-white sm:text-base">
                    Resolve Onboarding Outcome
                  </h2>
                  <p className="mt-0.5 text-[10px] font-semibold text-white/75">
                    Resolve the candidate’s Day 1 status and synchronize the final outcome.
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
                        Day 1 Attendance Status
                      </span>
                      <select
                        value={outcomeShowStatus}
                        onChange={(event) => setOutcomeShowStatus(event.target.value as any)}
                        className="h-10 w-full rounded-xl border border-[#D7DEE8] bg-[#F8FAFC] px-3 text-xs font-semibold text-[#042C51] outline-none transition hover:border-[#FF5C28]/45 focus:border-[#FF5C28] focus:bg-white focus:ring-4 focus:ring-[#FF5C28]/10"
                      >
                        <option value="Pending">Pending Start</option>
                        <option value="Show">Show — True Hire</option>
                        <option value="No Show">No Show</option>
                        <option value="Withdrawn">Pre-start Withdrawal</option>
                      </select>
                    </label>

                    {outcomeShowStatus === "Show" ? (
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
