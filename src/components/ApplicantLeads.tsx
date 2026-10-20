import React, { useState, useMemo } from "react";
import * as XLSX from "xlsx";
import {
  UserPlus,
  Search,
  Filter,
  Plus,
  Download,
  Upload,
  RefreshCw,
  Phone,
  Mail,
  MapPin,
  Briefcase,
  Calendar,
  CheckCircle,
  X,
  Edit2,
  Trash2,
  Send,
  ExternalLink,
  ChevronDown,
  Info,
  Clock,
  Sparkles,
  UserCheck,
  Building,
  FileSpreadsheet,
  BarChart2,
  MessageSquare,
  ArrowRight,
  MoreVertical,
  Check,
  Key,
  Eye,
  Database,
  Archive,
  RotateCcw,
  User,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import CandidateProfileModal from "./CandidateProfileModal";
import LeadApplicantProfileModal from "./LeadApplicantProfileModal";
import { Candidate } from "./TalentPool";
import {
  ApplicantLead,
  ArchivedTalentPoolLead,
  LeadHistoryItem,
  INITIAL_ACTIVE_LEADS,
  INITIAL_ARCHIVED_LEADS,
  createCandidateFromLead,
  loadFromLocalStorage,
  saveToLocalStorage,
  STORAGE_KEYS,
  broadcastDataChange
} from "../data/recruitmentStore";

interface ApplicantLeadsProps {
  userEmail?: string;
  onSwitchModule?: (module: string) => void;
}


const APPLICANT_LEAD_METRIC_TONES = {
  navy: {
    label: "text-[#042C51]",
    icon: "bg-[#EAF0F7] text-[#042C51]",
  },
  indigo: {
    label: "text-[#4F46E5]",
    icon: "bg-[#EEF2FF] text-[#4F46E5]",
  },
  purple: {
    label: "text-[#7C3AED]",
    icon: "bg-[#F3E8FF] text-[#7C3AED]",
  },
  green: {
    label: "text-[#047857]",
    icon: "bg-[#ECFDF3] text-[#047857]",
  },
  orange: {
    label: "text-[#E6531B]",
    icon: "bg-[#FFF2EC] text-[#E6531B]",
  },
};

function ApplicantLeadMetricCard({
  title,
  value,
  icon: Icon,
  description,
  tone = "navy",
  delay = 0,
}: {
  title: string;
  value: React.ReactNode;
  icon: React.ElementType;
  description: string;
  tone?: keyof typeof APPLICANT_LEAD_METRIC_TONES;
  delay?: number;
}) {
  const toneClasses =
    APPLICANT_LEAD_METRIC_TONES[tone] || APPLICANT_LEAD_METRIC_TONES.navy;

  return (
    <article
      className="flex h-[104px] min-h-[96px] flex-col justify-between overflow-hidden rounded-2xl border border-[#DCE6F1] bg-white p-3 font-jakarta shadow-[0_8px_22px_rgba(4,44,81,0.04)] transition-shadow hover:shadow-[0_10px_28px_rgba(4,44,81,0.07)] 2xl:h-[116px] 2xl:min-h-[112px] 2xl:p-3.5"
      style={{ animationDelay: `${delay}ms`, animationFillMode: "both" }}
    >
      <div className="flex h-full items-start justify-between gap-2.5 2xl:gap-3">
        <div className="flex h-full min-w-0 flex-1 flex-col justify-between">
          <div>
            <p
              className={`m-0 truncate text-[10px] font-extrabold uppercase tracking-normal ${toneClasses.label}`}
            >
              {title}
            </p>

            <p
              className={`mt-1.5 text-2xl font-bold leading-none tabular-nums tracking-tight 2xl:mt-2 2xl:text-3xl ${toneClasses.label}`}
            >
              {value}
            </p>
          </div>

          <p className="mt-1 line-clamp-1 truncate text-[10px] font-semibold leading-tight text-[#667085]">
            {description}
          </p>
        </div>

        <span
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full 2xl:h-9 2xl:w-9 ${toneClasses.icon}`}
        >
          <Icon className="h-4 w-4 2xl:h-[18px] 2xl:w-[18px]" strokeWidth={2} />
        </span>
      </div>
    </article>
  );
}

export default function ApplicantLeads({ userEmail, onSwitchModule }: ApplicantLeadsProps) {
  // Derive name of current user account
  const currentAccountName = useMemo(() => {
    if (!userEmail) return "CRISTER CANITAN";
    if (userEmail.includes("@")) {
      const handle = userEmail.split("@")[0];
      const parts = handle.split(".").map(p => p.toUpperCase());
      return parts.join(" ");
    }
    return userEmail.toUpperCase();
  }, [userEmail]);

  // --- STATE ---
  const [activeTab, setActiveTab] = useState<"active" | "archive" | "sources">("active");

  // Leads Lists backed by LocalStorage
  const [leads, setLeads] = useState<ApplicantLead[]>(() =>
    loadFromLocalStorage(STORAGE_KEYS.APPLICANT_LEADS, INITIAL_ACTIVE_LEADS)
  );
  const [archivedLeads, setArchivedLeads] = useState<ArchivedTalentPoolLead[]>(() =>
    loadFromLocalStorage(STORAGE_KEYS.ARCHIVED_LEADS, INITIAL_ARCHIVED_LEADS)
  );

  // Sync leads changes to localStorage
  React.useEffect(() => {
    saveToLocalStorage(STORAGE_KEYS.APPLICANT_LEADS, leads);
    broadcastDataChange("leads");
  }, [leads]);

  // Sync archivedLeads changes to localStorage
  React.useEffect(() => {
    saveToLocalStorage(STORAGE_KEYS.ARCHIVED_LEADS, archivedLeads);
    broadcastDataChange("archived_leads");
  }, [archivedLeads]);

  // Listen for storage updates
  React.useEffect(() => {
    const handleStoreUpdate = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail?.channel === "leads" || customEvent.detail?.channel === "all") {
        setLeads(prev => {
          const fresh = loadFromLocalStorage(STORAGE_KEYS.APPLICANT_LEADS, INITIAL_ACTIVE_LEADS);
          return JSON.stringify(prev) === JSON.stringify(fresh) ? prev : fresh;
        });
      }
      if (customEvent.detail?.channel === "archived_leads" || customEvent.detail?.channel === "all") {
        setArchivedLeads(prev => {
          const fresh = loadFromLocalStorage(STORAGE_KEYS.ARCHIVED_LEADS, INITIAL_ARCHIVED_LEADS);
          return JSON.stringify(prev) === JSON.stringify(fresh) ? prev : fresh;
        });
      }
    };
    window.addEventListener("sibs_store_update", handleStoreUpdate);
    return () => window.removeEventListener("sibs_store_update", handleStoreUpdate);
  }, []);

  // Lead Profile Panel Modal State
  const [selectedLeadForProfile, setSelectedLeadForProfile] = useState<ApplicantLead | null>(null);
  const [isLeadProfileModalOpen, setIsLeadProfileModalOpen] = useState(false);
  const [isLeadProfileInitialEdit, setIsLeadProfileInitialEdit] = useState(false);

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("All Statuses");
  const [departmentFilter, setDepartmentFilter] = useState<string>("All Departments");
  const [siteFilter, setSiteFilter] = useState<string>("All Sites");

  // Modals & Drawers
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<ApplicantLead | null>(null);

  // Candidate Profile Modal (For opening talent pool profile from archive)
  const [selectedCandidateForProfile, setSelectedCandidateForProfile] = useState<Candidate | null>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  // Form Data State
  const [formData, setFormData] = useState({
    firstName: "",
    middleName: "",
    lastName: "",
    suffix: "",
    cpNum: "",
    email: "",
    department: "Call Center Operations",
    specificAccount: "CD - Collect",
    source: "Walk-in" as ApplicantLead["source"],
    preferredSite: "Tagum City" as ApplicantLead["preferredSite"],
    status: "New Lead" as ApplicantLead["status"],
    notes: "",
    referralCode: ""
  });

  // Bulk Import State
  const [bulkFile, setBulkFile] = useState<File | null>(null);
  const [parsedLeads, setParsedLeads] = useState<ApplicantLead[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [bulkError, setBulkError] = useState<string | null>(null);

  // Toast Notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Reset Filters
  const handleClearFilters = () => {
    setSearchTerm("");
    setStatusFilter("All Statuses");
    setDepartmentFilter("All Departments");
    setSiteFilter("All Sites");
  };

  // Open Lead Profile Modal
  const handleOpenLeadProfile = (lead: ApplicantLead, initialEdit: boolean = false) => {
    setSelectedLeadForProfile(lead);
    setIsLeadProfileInitialEdit(initialEdit);
    setIsLeadProfileModalOpen(true);
  };

  // Handle Updates to a Lead from Profile Modal
  const handleUpdateLead = (updatedLead: ApplicantLead) => {
    setLeads(prev => prev.map(l => (l.id === updatedLead.id ? updatedLead : l)));
    setSelectedLeadForProfile(updatedLead);
    showToast(`Updated profile & history for ${updatedLead.fullName}`);
  };

  // Open Log New Lead Modal
  const handleOpenAddModal = () => {
    setEditingLead(null);
    setFormData({
      firstName: "",
      middleName: "",
      lastName: "",
      suffix: "",
      cpNum: "",
      email: "",
      department: "Call Center Operations",
      specificAccount: "CD - Collect",
      source: "Walk-in",
      preferredSite: "Tagum City",
      status: "New Lead",
      notes: "",
      referralCode: ""
    });
    setIsAddModalOpen(true);
  };

  // Open Edit Lead Modal
  const handleOpenEditModal = (lead: ApplicantLead) => {
    handleOpenLeadProfile(lead, true);
  };

  // Save or Update Lead
  const handleSaveLead = (e: React.FormEvent) => {
    e.preventDefault();

    const constructedFullName = `${formData.firstName} ${formData.middleName ? formData.middleName + " " : ""}${formData.lastName}${formData.suffix ? " " + formData.suffix : ""}`.trim();
    const currentDate = new Date().toISOString().split("T")[0];
    const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    if (editingLead) {
      const editHistItem: LeadHistoryItem = {
        id: `hist-${Date.now()}`,
        date: currentDate,
        time: currentTime,
        action: `Lead profile edited and updated by ${currentAccountName}.`,
        user: currentAccountName,
        type: "edit"
      };

      setLeads(prev =>
        prev.map(l =>
          l.id === editingLead.id
            ? {
                ...l,
                fullName: constructedFullName,
                firstName: formData.firstName,
                middleName: formData.middleName,
                lastName: formData.lastName,
                suffix: formData.suffix,
                cpNum: formData.cpNum,
                email: formData.email,
                department: formData.department,
                specificAccount: formData.specificAccount,
                source: formData.source,
                preferredSite: formData.preferredSite,
                status: formData.status,
                notes: formData.notes,
                referralCode: formData.referralCode,
                lastContactDate: currentDate,
                history: [editHistItem, ...(l.history || [])]
              }
            : l
        )
      );
      showToast(`Updated applicant lead for ${constructedFullName}`);
    } else {
      const nextNum = Math.floor(1000 + Math.random() * 9000);
      const initialHistItem: LeadHistoryItem = {
        id: `hist-${Date.now()}`,
        date: currentDate,
        time: currentTime,
        action: `Inbound applicant lead logged via ${formData.source} at ${formData.preferredSite} by ${currentAccountName}. Target Fit: ${formData.specificAccount}.`,
        user: currentAccountName,
        type: "create"
      };

      const newLead: ApplicantLead = {
        id: `LEAD-2026-${nextNum}`,
        fullName: constructedFullName,
        firstName: formData.firstName,
        middleName: formData.middleName,
        lastName: formData.lastName,
        suffix: formData.suffix,
        cpNum: formData.cpNum,
        email: formData.email,
        department: formData.department,
        specificAccount: formData.specificAccount,
        source: formData.source,
        preferredSite: formData.preferredSite,
        status: formData.status,
        inputtedBy: currentAccountName,
        dateLogged: currentDate,
        lastContactDate: currentDate,
        notes: formData.notes,
        referralCode: formData.referralCode,
        history: [initialHistItem]
      };

      setLeads(prev => [newLead, ...prev]);
      showToast(`Logged new applicant lead: ${constructedFullName}`);
    }

    setIsAddModalOpen(false);
  };

  // Move Lead to Talent Pool Archive and create Candidate Profile
  const handleMoveToTalentPool = (lead: ApplicantLead) => {
    const generatedTpId = `PUB-${new Date().toISOString().replace(/[-:T]/g, "").slice(0, 14)}-${Math.floor(100 + Math.random() * 900)}RQV`;
    const currentDate = new Date().toISOString().split("T")[0];
    const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const transferHistItem: LeadHistoryItem = {
      id: `hist-${Date.now()}`,
      date: currentDate,
      time: currentTime,
      action: `Lead converted and transferred to Talent Pool Master Archive (Talent Pool ID: ${generatedTpId}) by ${currentAccountName}.`,
      user: currentAccountName,
      type: "transfer"
    };

    const newArchivedRecord: ArchivedTalentPoolLead = {
      leadId: lead.id,
      talentPoolId: generatedTpId,
      fullName: lead.fullName,
      cpNum: lead.cpNum,
      email: lead.email || "N/A",
      department: lead.department,
      specificAccount: lead.specificAccount || "CD - Collect",
      preferredSite: lead.preferredSite,
      source: lead.source,
      dateLogged: lead.dateLogged || currentDate,
      dateTransferred: currentDate,
      transferredBy: currentAccountName,
      status: "Archived in Talent Pool",
      notes: lead.notes || "Transferred from Applicant Lead intake roster to Talent Pool."
    };

    // Add to Archive list
    setArchivedLeads(prev => [newArchivedRecord, ...prev]);

    // Remove from Active Leads list
    setLeads(prev => prev.filter(l => l.id !== lead.id));

    if (selectedLeadForProfile?.id === lead.id) {
      setIsLeadProfileModalOpen(false);
    }

    showToast(`✨ Converted and transferred ${lead.fullName} to Talent Pool Archive (${generatedTpId})!`);
  };

  // Restore from Archive back to Active Leads
  const handleRestoreFromArchive = (archivedRecord: ArchivedTalentPoolLead) => {
    const currentDate = new Date().toISOString().split("T")[0];
    const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const restoreHistItem: LeadHistoryItem = {
      id: `hist-${Date.now()}`,
      date: currentDate,
      time: currentTime,
      action: `Restored from Talent Pool Archive back to Active Leads by ${currentAccountName}.`,
      user: currentAccountName,
      type: "status"
    };

    const restoredLead: ApplicantLead = {
      id: archivedRecord.leadId,
      fullName: archivedRecord.fullName,
      cpNum: archivedRecord.cpNum,
      email: archivedRecord.email === "N/A" ? "" : archivedRecord.email,
      department: archivedRecord.department,
      specificAccount: archivedRecord.specificAccount,
      source: archivedRecord.source as ApplicantLead["source"],
      preferredSite: archivedRecord.preferredSite as ApplicantLead["preferredSite"],
      status: "Contacted",
      inputtedBy: archivedRecord.transferredBy,
      dateLogged: archivedRecord.dateLogged,
      lastContactDate: currentDate,
      notes: `Restored from Talent Pool Archive on ${currentDate}. Original Notes: ${archivedRecord.notes}`,
      history: [restoreHistItem]
    };

    setLeads(prev => [restoredLead, ...prev]);
    setArchivedLeads(prev => prev.filter(a => a.leadId !== archivedRecord.leadId));

    showToast(`↩️ Restored ${archivedRecord.fullName} back to Active Leads roster!`);
  };

  // Delete Lead
  const handleDeleteLead = (id: string, name: string) => {
    if (confirm(`Are you sure you want to remove lead for ${name}?`)) {
      setLeads(prev => prev.filter(l => l.id !== id));
      if (selectedLeadForProfile?.id === id) {
        setIsLeadProfileModalOpen(false);
      }
      showToast(`Removed lead entry for ${name}.`);
    }
  };

  // Delete Archived Lead
  const handleDeleteArchivedLead = (leadId: string, name: string) => {
    if (confirm(`Remove archived record for ${name}?`)) {
      setArchivedLeads(prev => prev.filter(l => l.leadId !== leadId));
      showToast(`Removed archived record for ${name}.`);
    }
  };

  // Send Application Form Link via Email / SMS
  const handleSendLinkEmail = (lead: ApplicantLead) => {
    const currentDate = new Date().toISOString().split("T")[0];
    const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const linkHistItem: LeadHistoryItem = {
      id: `hist-${Date.now()}`,
      date: currentDate,
      time: currentTime,
      action: `Application form link dispatched via SMS & Email to ${lead.email || lead.cpNum} by ${currentAccountName}.`,
      user: currentAccountName,
      type: "sms"
    };

    const updatedLead: ApplicantLead = {
      ...lead,
      status: "Application Link Sent",
      lastContactDate: currentDate,
      history: [linkHistItem, ...(lead.history || [])]
    };

    setLeads(prev => prev.map(l => (l.id === lead.id ? updatedLead : l)));
    if (selectedLeadForProfile?.id === lead.id) {
      setSelectedLeadForProfile(updatedLead);
    }
    showToast(`📧 Application form link sent to ${lead.fullName} (${lead.email || lead.cpNum})!`);
  };

  // OPEN TALENT POOL PROFILE FOR ARCHIVED LEAD
  // Constructs full Candidate object and opens CandidateProfileModal
  const handleOpenTalentPoolProfile = (archivedRecord: ArchivedTalentPoolLead) => {
    // Check if matching lead or candidate object exists
    const mockLead: ApplicantLead = {
      id: archivedRecord.leadId,
      fullName: archivedRecord.fullName,
      cpNum: archivedRecord.cpNum,
      email: archivedRecord.email === "N/A" ? "applicant.lead@thesiblingssolutions.com" : archivedRecord.email,
      department: archivedRecord.department,
      specificAccount: archivedRecord.specificAccount,
      source: (archivedRecord.source || "Walk-in") as ApplicantLead["source"],
      preferredSite: (archivedRecord.preferredSite || "Tagum City") as ApplicantLead["preferredSite"],
      status: "Converted to Applicant",
      inputtedBy: archivedRecord.transferredBy,
      dateLogged: archivedRecord.dateLogged,
      notes: archivedRecord.notes
    };

    const candidateProfile: Candidate = createCandidateFromLead(
      mockLead,
      archivedRecord.transferredBy,
      archivedRecord.talentPoolId
    );

    // Set and open modal
    setSelectedCandidateForProfile(candidateProfile);
    setIsProfileModalOpen(true);
  };

  // Filtered Active Leads
  const filteredActiveLeads = useMemo(() => {
    return leads.filter(l => {
      const matchesSearch =
        l.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        l.cpNum.includes(searchTerm) ||
        l.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        l.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (l.specificAccount && l.specificAccount.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (l.inputtedBy && l.inputtedBy.toLowerCase().includes(searchTerm.toLowerCase())) ||
        l.id.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = statusFilter === "All Statuses" || l.status === statusFilter;
      const matchesDept = departmentFilter === "All Departments" || l.department === departmentFilter;
      const matchesSite = siteFilter === "All Sites" || l.preferredSite === siteFilter;

      return matchesSearch && matchesStatus && matchesDept && matchesSite;
    });
  }, [leads, searchTerm, statusFilter, departmentFilter, siteFilter]);

  // Filtered Archived Leads
  const filteredArchivedLeads = useMemo(() => {
    return archivedLeads.filter(rec => {
      const matchesSearch =
        rec.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rec.leadId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rec.talentPoolId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rec.cpNum.includes(searchTerm) ||
        rec.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rec.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rec.specificAccount.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rec.transferredBy.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesDept = departmentFilter === "All Departments" || rec.department === departmentFilter;
      const matchesSite = siteFilter === "All Sites" || rec.preferredSite === siteFilter;

      return matchesSearch && matchesDept && matchesSite;
    });
  }, [archivedLeads, searchTerm, departmentFilter, siteFilter]);

  // Metrics Calculations
  const totalInquiries = leads.length + archivedLeads.length;
  const newUncontacted = leads.filter(l => l.status === "New Lead").length;
  const appSent = leads.filter(l => l.status === "Application Link Sent").length;
  const convertedApplicants = archivedLeads.length;
  const conversionRate = totalInquiries > 0 ? ((convertedApplicants / totalInquiries) * 100).toFixed(1) : "0.0";

  // Handle Bulk Excel Upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setBulkFile(file);
    setBulkError(null);
    setIsProcessing(true);

    const reader = new FileReader();
    reader.onload = evt => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: "binary" });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json<any>(ws);

        if (!data || data.length === 0) {
          setBulkError("The uploaded Excel file appears to be empty or unreadable.");
          setIsProcessing(false);
          return;
        }

        const newScannedLeads: ApplicantLead[] = data.map((row, idx) => {
          const rawName =
            row["Full Name"] ||
            row["FullName"] ||
            row["Name"] ||
            `${row["First Name"] || ""} ${row["Last Name"] || ""}`.trim() ||
            `Lead Candidate ${idx + 1}`;
          const rawCp = String(row["Cellphone Number"] || row["CP Number"] || row["Mobile"] || row["Phone"] || "0917-000-0000");
          const rawEmail = String(row["Email Address"] || row["Email"] || "");
          const rawDept = String(row["Department"] || row["Dept"] || "Call Center Operations");
          const rawAccount = String(row["Specific Account"] || row["Account"] || "CD - Collect");
          const rawSource = String(row["Source"] || row["Source Channel"] || "Walk-in");
          const rawSite = String(row["Preferred Site"] || row["Site"] || "Tagum City");

          const currentDate = new Date().toISOString().split("T")[0];
          const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          const bulkHistItem: LeadHistoryItem = {
            id: `hist-${Date.now()}-${idx}`,
            date: currentDate,
            time: currentTime,
            action: `Bulk imported into Applicant Leads from spreadsheet file ${file.name} by ${currentAccountName}.`,
            user: currentAccountName,
            type: "create"
          };

          return {
            id: `LEAD-2026-X${Math.floor(1000 + Math.random() * 9000)}`,
            fullName: rawName,
            firstName: rawName.split(" ")[0] || "",
            lastName: rawName.split(" ").slice(-1)[0] || "",
            cpNum: rawCp,
            email: rawEmail,
            department: rawDept,
            specificAccount: rawAccount,
            source: (["Walk-in", "Job Fair", "Facebook / Social Media", "Phone Call Inquiry", "Employee Referral", "SMS Inquiry", "LinkedIn"].includes(rawSource)
              ? rawSource
              : "Walk-in") as ApplicantLead["source"],
            preferredSite: (["Tagum City", "Davao City", "Municipality of Mabini"].includes(rawSite) ? rawSite : "Tagum City") as ApplicantLead["preferredSite"],
            status: "New Lead",
            inputtedBy: currentAccountName,
            dateLogged: currentDate,
            lastContactDate: currentDate,
            notes: row["Notes"] || row["Remarks"] || `Imported via Bulk Excel file ${file.name}`,
            history: [bulkHistItem]
          };
        });

        setParsedLeads(newScannedLeads);
        setIsProcessing(false);
      } catch (err: any) {
        console.error("Excel parse error:", err);
        setBulkError("Failed to parse Excel file. Please make sure it is a valid .xlsx or .csv spreadsheet.");
        setIsProcessing(false);
      }
    };

    reader.readAsBinaryString(file);
  };

  const handleConfirmBulkImport = () => {
    if (parsedLeads.length === 0) return;
    setLeads(prev => [...parsedLeads, ...prev]);
    showToast(`Successfully imported ${parsedLeads.length} new applicant leads from Excel!`);
    setIsBulkModalOpen(false);
    setBulkFile(null);
    setParsedLeads([]);
  };

  // Status Badge Helper
  const getStatusBadge = (status: ApplicantLead["status"]) => {
    switch (status) {
      case "New Lead":
        return (
          <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 border border-blue-200/80 px-2.5 py-0.5 rounded-full text-[11px] font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
            New Lead
          </span>
        );
      case "Contacted":
        return (
          <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 border border-amber-200/80 px-2.5 py-0.5 rounded-full text-[11px] font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
            Contacted
          </span>
        );
      case "Application Link Sent":
        return (
          <span className="inline-flex items-center gap-1 bg-purple-50 text-purple-700 border border-purple-200/80 px-2.5 py-0.5 rounded-full text-[11px] font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span>
            Application Link Sent
          </span>
        );
      case "Converted to Applicant":
        return (
          <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200/80 px-2.5 py-0.5 rounded-full text-[11px] font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            Moved to Talent Pool Archive
          </span>
        );
      case "On Hold":
        return (
          <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-700 border border-slate-200 px-2.5 py-0.5 rounded-full text-[11px] font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
            On Hold
          </span>
        );
      case "Not Interested":
        return (
          <span className="inline-flex items-center gap-1 bg-rose-50 text-rose-700 border border-rose-200 px-2.5 py-0.5 rounded-full text-[11px] font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
            Not Interested
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-700 border border-slate-200 px-2.5 py-0.5 rounded-full text-[11px] font-bold">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="relative flex w-full flex-1 select-none flex-col space-y-4 pb-12 sm:space-y-5 2xl:space-y-6" id="applicant-leads-root">
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-5 right-5 z-50 bg-[#042C51] text-white px-4 py-3 rounded-xl shadow-xl border border-blue-400/30 text-xs font-bold flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4 text-[#FF5C28]" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ==================== 1. TOP HEADER BANNER ==================== */}
      <section className="relative overflow-hidden rounded-2xl border border-[#DCE6F1] bg-white font-jakarta shadow-[0_8px_24px_rgba(4,44,81,0.05)]">
        <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-[#042C51] via-[#FF5C28] to-[#FF8B61]" />

        <div className="flex flex-col gap-4 px-5 py-4 sm:px-6 sm:py-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-100 bg-[#E9F0FC] px-2.5 py-1 text-[9px] font-black uppercase tracking-wide text-[#042C51]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#FF5C28]" />
                Recruitment View
              </span>
            </div>

            <h1 className="text-[22px] font-extrabold leading-tight tracking-tight text-[#042C51] sm:text-2xl">
              Applicant Leads &amp; Inquiries
            </h1>

            <p className="mt-1 max-w-4xl text-xs font-semibold leading-5 text-[#667085]">
              Capture walk-ins, calls, social inquiries, referrals, and job fair leads before converting them into full Talent Pool applicants.
            </p>
          </div>

          <div className="flex w-full flex-wrap items-center gap-2 lg:w-auto lg:justify-end">
            <button
              type="button"
              onClick={() => showToast("Applicant leads database refreshed.")}
              className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-[#D7DEE8] bg-white text-[#475467] shadow-sm transition hover:border-[#FF5C28]/40 hover:bg-[#FFF8F5] hover:text-[#FF5C28] active:scale-[0.98]"
              title="Refresh Applicant Leads"
              aria-label="Refresh Applicant Leads"
            >
              <RefreshCw size={15} />
            </button>

            <button
              type="button"
              onClick={() => showToast("CSV template is ready for download.")}
              className="inline-flex h-10 flex-1 items-center justify-center gap-1.5 whitespace-nowrap rounded-lg border border-[#D7DEE8] bg-white px-3.5 text-xs font-extrabold text-[#344054] shadow-sm transition hover:border-[#FF5C28]/40 hover:bg-[#FFF8F5] hover:text-[#FF5C28] active:scale-[0.98] sm:flex-none"
            >
              <Download size={14} />
              CSV Template
            </button>

            <button
              type="button"
              onClick={() => setIsBulkModalOpen(true)}
              className="inline-flex h-10 flex-1 items-center justify-center gap-1.5 whitespace-nowrap rounded-lg border border-[#D7DEE8] bg-white px-3.5 text-xs font-extrabold text-[#344054] shadow-sm transition hover:border-[#FF5C28]/40 hover:bg-[#FFF8F5] hover:text-[#FF5C28] active:scale-[0.98] sm:flex-none"
            >
              <Upload size={14} />
              Upload Leads
            </button>

            <button
              type="button"
              onClick={handleOpenAddModal}
              className="inline-flex h-10 w-full items-center justify-center gap-1.5 whitespace-nowrap rounded-lg bg-[#FF5C28] px-4 text-xs font-extrabold text-white shadow-sm transition hover:bg-[#E95324] active:scale-[0.98] sm:w-auto"
            >
              <Plus size={15} />
              Log New Lead
            </button>
          </div>
        </div>
      </section>

      {/* ==================== 2. 5 METRICS KPI CARDS ==================== */}
      <section aria-label="Applicant lead summary">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5">
          <ApplicantLeadMetricCard
            title="Total Leads"
            value={totalInquiries}
            icon={Briefcase}
            description="Active Roster"
            tone="navy"
            delay={0}
          />

          <ApplicantLeadMetricCard
            title="New Leads"
            value={newUncontacted}
            icon={UserPlus}
            description="Pending Call"
            tone="indigo"
            delay={45}
          />

          <ApplicantLeadMetricCard
            title="Link Sent"
            value={appSent}
            icon={Send}
            description="SMS / Email"
            tone="purple"
            delay={90}
          />

          <ApplicantLeadMetricCard
            title="Converted"
            value={convertedApplicants}
            icon={UserCheck}
            description="Talent Pool"
            tone="green"
            delay={135}
          />

          <ApplicantLeadMetricCard
            title="Conversion Rate"
            value={`${conversionRate}%`}
            icon={BarChart2}
            description="Lead Yield"
            tone="orange"
            delay={180}
          />
        </div>
      </section>

      {/* ==================== 3. APPLICANT LEADS DIRECTORY ==================== */}
      <section className="sibs-page-card-in overflow-hidden rounded-2xl border border-sibs-border bg-white shadow-xs font-jakarta">
        <div className="border-b border-sibs-border p-4 sm:p-5 2xl:p-6">
          <div className="flex flex-col gap-0.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h2 className="sibs-card-title">
                  {activeTab === "active"
                    ? "Applicant Lead Directory"
                    : activeTab === "archive"
                      ? "Moved to Talent Pool Archive"
                      : "Channel Sources"}
                </h2>

                <p className="sibs-card-subtitle">
                  {activeTab === "active"
                    ? "Search and filter pre-applicant inquiries by status, department, account, site, and recruiter account."
                    : activeTab === "archive"
                      ? "Historical repository of applicant leads converted and transferred to the Talent Pool module."
                      : "Review lead-generation source mix and account intake volume."}
                </p>
              </div>

              <span className="inline-flex w-fit items-center rounded-full border border-blue-100 bg-blue-50 px-2.5 py-0.5 text-[10px] font-extrabold text-[#042C51]">
                {activeTab === "active"
                  ? `${filteredActiveLeads.length} of ${leads.length} leads`
                  : activeTab === "archive"
                    ? `${filteredArchivedLeads.length} of ${archivedLeads.length} archived`
                    : `${totalInquiries} total leads`}
              </span>
            </div>
          </div>

          <div className="relative z-[90] mt-3.5 overflow-visible 2xl:mt-4">
            <div className="grid grid-cols-1 gap-3 xl:grid-cols-[minmax(0,2fr)_minmax(160px,.72fr)_minmax(180px,.82fr)_minmax(160px,.72fr)_auto] xl:items-end">
              <div className="min-w-0">
                <label className="mb-1.5 block text-[10px] font-extrabold text-[#101828]">
                  Search
                </label>
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#98A2B3]" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                    placeholder="Search candidate, email, phone, account, position..."
                    className="h-10 w-full rounded-lg border border-[#DDE5EE] bg-[#F8FAFC] pl-9 pr-3 text-xs font-semibold text-[#042C51] outline-none transition placeholder:text-[#8DA2BD] hover:border-[#C9D6E4] focus:border-[#FF5C28] focus:bg-white focus:ring-2 focus:ring-[#FF5C28]/10"
                  />
                </div>
              </div>

              <div className="min-w-0">
                <label className="mb-1.5 block text-[10px] font-extrabold text-[#101828]">
                  Status
                </label>
                <select
                  value={statusFilter}
                  onChange={(event) => setStatusFilter(event.target.value)}
                  disabled={activeTab !== "active"}
                  className="h-10 w-full rounded-lg border border-[#DDE5EE] bg-[#F8FAFC] px-3 text-xs font-extrabold text-[#042C51] outline-none transition hover:border-[#C9D6E4] focus:border-[#FF5C28] focus:bg-white focus:ring-2 focus:ring-[#FF5C28]/10 disabled:cursor-not-allowed disabled:bg-[#F2F4F7] disabled:text-[#98A2B3]"
                >
                  <option value="All Statuses">All Statuses</option>
                  <option value="New Lead">New Lead</option>
                  <option value="Contacted">Contacted</option>
                  <option value="Application Link Sent">Application Link Sent</option>
                  <option value="Converted to Applicant">Converted to Applicant</option>
                  <option value="Not Interested">Not Interested</option>
                  <option value="On Hold">On Hold</option>
                </select>
              </div>

              <div className="min-w-0">
                <label className="mb-1.5 block text-[10px] font-extrabold text-[#101828]">
                  Department
                </label>
                <select
                  value={departmentFilter}
                  onChange={(event) => setDepartmentFilter(event.target.value)}
                  className="h-10 w-full rounded-lg border border-[#DDE5EE] bg-[#F8FAFC] px-3 text-xs font-extrabold text-[#042C51] outline-none transition hover:border-[#C9D6E4] focus:border-[#FF5C28] focus:bg-white focus:ring-2 focus:ring-[#FF5C28]/10"
                >
                  <option value="All Departments">All Departments</option>
                  <option value="Call Center Operations">Call Center Operations</option>
                  <option value="Human Resource">Human Resource</option>
                  <option value="Facility Management">Facility Management</option>
                  <option value="IT (Information and Communications Technology)">IT (ICT)</option>
                  <option value="Executive / Operations">Executive / Operations</option>
                </select>
              </div>

              <div className="min-w-0">
                <label className="mb-1.5 block text-[10px] font-extrabold text-[#101828]">
                  Site
                </label>
                <select
                  value={siteFilter}
                  onChange={(event) => setSiteFilter(event.target.value)}
                  className="h-10 w-full rounded-lg border border-[#DDE5EE] bg-[#F8FAFC] px-3 text-xs font-extrabold text-[#042C51] outline-none transition hover:border-[#C9D6E4] focus:border-[#FF5C28] focus:bg-white focus:ring-2 focus:ring-[#FF5C28]/10"
                >
                  <option value="All Sites">All Sites</option>
                  <option value="Tagum City">Tagum City</option>
                  <option value="Davao City">Davao City</option>
                  <option value="Municipality of Mabini">Municipality of Mabini</option>
                </select>
              </div>

              <button
                type="button"
                onClick={handleClearFilters}
                disabled={
                  !searchTerm.trim() &&
                  statusFilter === "All Statuses" &&
                  departmentFilter === "All Departments" &&
                  siteFilter === "All Sites"
                }
                className="inline-flex h-10 w-full items-center justify-center gap-1.5 rounded-lg border border-sibs-border bg-white px-4 text-xs font-extrabold text-sibs-muted transition hover:border-sibs-orange/40 hover:bg-sibs-cream-light hover:text-sibs-orange disabled:cursor-not-allowed disabled:opacity-50 xl:w-auto"
              >
                <Filter size={14} />
                Clear
              </button>
            </div>
          </div>
        </div>

        <div className="min-h-0 flex-1 p-4 sm:p-5 2xl:p-6">
          <div className="overflow-hidden rounded-xl border border-sibs-border bg-white shadow-xs">
            <div className="flex overflow-x-auto border-b border-sibs-border bg-[#F8FAFC] px-4 pt-3">
              {[
                { key: "active", label: "Active Leads", count: leads.length },
                { key: "archive", label: "Moved to Talent Pool Archive", count: archivedLeads.length },
                { key: "sources", label: "Channel Sources", count: null },
              ].map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveTab(tab.key as "active" | "archive" | "sources")}
                  className={`relative whitespace-nowrap px-4 py-3 text-[10px] font-extrabold uppercase tracking-normal transition-colors ${
                    activeTab === tab.key
                      ? "bg-white text-[#042C51]"
                      : "text-[#667085] hover:text-[#042C51]"
                  }`}
                >
                  <span className="inline-flex items-center gap-2">
                    {tab.label}
                    {tab.count !== null ? (
                      <span
                        className={`rounded-full px-2 py-0.5 text-[9px] font-extrabold ${
                          activeTab === tab.key
                            ? "bg-[#042C51] text-white"
                            : "bg-[#E9EEF4] text-[#667085]"
                        }`}
                      >
                        {tab.count}
                      </span>
                    ) : null}
                  </span>

                  {activeTab === tab.key ? (
                    <span className="absolute inset-x-0 bottom-0 h-0.5 bg-[#FF5C28]" />
                  ) : null}
                </button>
              ))}
            </div>

            {activeTab === "active" ? (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[1120px] border-collapse text-left text-xs">
                    <thead className="bg-[#F8FAFC]">
                      <tr className="border-b border-[#E6ECF2]">
                        <th className="w-[20%] px-3 py-2.5 text-[10px] font-extrabold uppercase tracking-[0.04em] text-[#7B8DB3] 2xl:px-4 2xl:py-3">
                          Lead ID &amp; Name
                        </th>
                        <th className="w-[18%] px-3 py-2.5 text-[10px] font-extrabold uppercase tracking-[0.04em] text-[#7B8DB3] 2xl:px-4 2xl:py-3">
                          CP Number / Email
                        </th>
                        <th className="w-[22%] px-3 py-2.5 text-[10px] font-extrabold uppercase tracking-[0.04em] text-[#7B8DB3] 2xl:px-4 2xl:py-3">
                          Department &amp; Account / Client
                        </th>
                        <th className="w-[12%] px-3 py-2.5 text-[10px] font-extrabold uppercase tracking-[0.04em] text-[#7B8DB3] 2xl:px-4 2xl:py-3">
                          Site
                        </th>
                        <th className="w-[13%] px-3 py-2.5 text-[10px] font-extrabold uppercase tracking-[0.04em] text-[#7B8DB3] 2xl:px-4 2xl:py-3">
                          Status
                        </th>
                        <th className="w-[11%] px-3 py-2.5 text-[10px] font-extrabold uppercase tracking-[0.04em] text-[#7B8DB3] 2xl:px-4 2xl:py-3">
                          Inputted By
                        </th>
                        <th className="w-[4%] px-3 py-2.5 text-right text-[10px] font-extrabold uppercase tracking-[0.04em] text-[#7B8DB3] 2xl:px-4 2xl:py-3">
                          Actions
                        </th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-[#E6ECF2] bg-white">
                      {filteredActiveLeads.length > 0 ? (
                        filteredActiveLeads.map((lead, index) => (
                          <tr
                            key={lead.id}
                            onClick={() => handleOpenLeadProfile(lead, false)}
                            style={{
                              animationDelay: `${index * 30}ms`,
                              animationFillMode: "both",
                            }}
                            className="sibs-page-card-in group cursor-pointer bg-white transition-colors duration-150 hover:bg-[#F8FAFC]"
                          >
                            <td className="px-3 py-2 align-middle 2xl:px-4 2xl:py-2.5">
                              <p className="truncate text-xs font-extrabold leading-5 text-[#042C51] transition-colors group-hover:text-[#FF5C28]">
                                {lead.fullName}
                              </p>
                              <p className="mt-0.5 truncate font-mono text-[9.5px] font-bold uppercase tracking-wide text-[#98A2B3] 2xl:text-[10px]">
                                Lead ID: {lead.id}
                              </p>
                            </td>

                            <td className="px-3 py-2 align-middle 2xl:px-4 2xl:py-2.5">
                              <div className="flex items-center gap-1.5">
                                <Phone size={12} className="shrink-0 text-emerald-600" />
                                <span className="truncate text-xs font-bold text-[#475467]">
                                  {lead.cpNum}
                                </span>
                              </div>
                              <div className="mt-0.5 flex items-center gap-1.5">
                                <Mail size={12} className="shrink-0 text-[#98A2B3]" />
                                <span className="max-w-[200px] truncate text-[10px] font-medium text-[#667085] 2xl:text-[11px]">
                                  {lead.email || "—"}
                                </span>
                              </div>
                            </td>

                            <td className="px-3 py-2 align-middle 2xl:px-4 2xl:py-2.5">
                              <p className="truncate text-xs font-bold text-[#042C51]">
                                {lead.department}
                              </p>
                              <p className="mt-0.5 truncate text-[10px] font-medium text-[#667085] 2xl:text-[11px]">
                                {lead.specificAccount || "—"}
                              </p>
                            </td>

                            <td className="px-3 py-2 align-middle 2xl:px-4 2xl:py-2.5">
                              <div className="flex items-center gap-1.5 text-xs font-semibold text-[#475467]">
                                <MapPin size={12} className="shrink-0 text-[#98A2B3]" />
                                <span>{lead.preferredSite}</span>
                              </div>
                            </td>

                            <td className="px-3 py-2 align-middle 2xl:px-4 2xl:py-2.5">
                              {getStatusBadge(lead.status)}
                            </td>

                            <td className="px-3 py-2 align-middle 2xl:px-4 2xl:py-2.5">
                              <div className="flex min-w-0 items-start gap-1.5">
                                <User size={12} className="mt-0.5 shrink-0 text-[#FF5C28]" />
                                <div className="min-w-0">
                                  <p className="truncate text-xs font-bold text-[#042C51]">
                                    {lead.inputtedBy}
                                  </p>
                                  <p className="mt-0.5 truncate text-[9.5px] font-medium text-[#98A2B3] 2xl:text-[10px]">
                                    Logged: {lead.dateLogged}
                                  </p>
                                </div>
                              </div>
                            </td>

                            <td
                              className="px-3 py-2 align-middle 2xl:px-4 2xl:py-2.5"
                              onClick={(event) => event.stopPropagation()}
                            >
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => handleSendLinkEmail(lead)}
                                  title="Send Application Form Link"
                                  className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-purple-200 bg-purple-50 text-purple-600 transition hover:bg-purple-100"
                                >
                                  <Mail size={12} />
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handleOpenLeadProfile(lead, true)}
                                  title="Edit Lead"
                                  className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-[#DDE5EE] bg-white text-[#667085] transition hover:border-[#FF5C28]/40 hover:text-[#FF5C28]"
                                >
                                  <Edit2 size={12} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={7} className="px-5 py-14 text-center">
                            <UserPlus className="mx-auto h-8 w-8 text-[#CBD5E1]" />
                            <p className="mt-2 text-sm font-extrabold text-[#042C51]">
                              No active applicant leads found
                            </p>
                            <p className="mt-1 text-xs font-semibold text-[#98A2B3]">
                              Try changing or resetting your search and filter criteria.
                            </p>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                <div className="flex flex-col gap-3 border-t border-[#E6ECF2] bg-white px-4 py-3 text-xs font-semibold text-[#667085] sm:flex-row sm:items-center sm:justify-between">
                  <span>
                    Showing <strong className="text-[#042C51]">{filteredActiveLeads.length}</strong> loaded applicant leads out of{" "}
                    <strong className="text-[#042C51]">{leads.length}</strong>
                  </span>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      disabled={currentPage === 1}
                      className="inline-flex h-8 items-center justify-center rounded-lg border border-[#DDE5EE] bg-white px-3 font-bold text-[#667085] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <ChevronLeft size={13} />
                      Previous
                    </button>
                    <span className="inline-flex h-8 min-w-8 items-center justify-center rounded-lg bg-[#FF5C28] px-2 font-extrabold text-white">
                      1
                    </span>
                    <button
                      type="button"
                      disabled
                      className="inline-flex h-8 items-center justify-center rounded-lg border border-[#DDE5EE] bg-white px-3 font-bold text-[#667085] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Next
                      <ChevronRight size={13} />
                    </button>
                  </div>
                </div>
              </>
            ) : null}

            {activeTab === "archive" ? (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[1120px] border-collapse text-left text-xs">
                    <thead className="bg-[#F8FAFC]">
                      <tr className="border-b border-[#E6ECF2]">
                        <th className="w-[20%] px-3 py-2.5 text-[10px] font-extrabold uppercase tracking-[0.04em] text-[#7B8DB3] 2xl:px-4 2xl:py-3">
                          Lead ID &amp; Name
                        </th>
                        <th className="w-[18%] px-3 py-2.5 text-[10px] font-extrabold uppercase tracking-[0.04em] text-[#7B8DB3] 2xl:px-4 2xl:py-3">
                          CP Number / Email
                        </th>
                        <th className="w-[22%] px-3 py-2.5 text-[10px] font-extrabold uppercase tracking-[0.04em] text-[#7B8DB3] 2xl:px-4 2xl:py-3">
                          Department &amp; Account / Client
                        </th>
                        <th className="w-[12%] px-3 py-2.5 text-[10px] font-extrabold uppercase tracking-[0.04em] text-[#7B8DB3] 2xl:px-4 2xl:py-3">
                          Site
                        </th>
                        <th className="w-[13%] px-3 py-2.5 text-[10px] font-extrabold uppercase tracking-[0.04em] text-[#7B8DB3] 2xl:px-4 2xl:py-3">
                          Status
                        </th>
                        <th className="w-[11%] px-3 py-2.5 text-[10px] font-extrabold uppercase tracking-[0.04em] text-[#7B8DB3] 2xl:px-4 2xl:py-3">
                          Inputted By
                        </th>
                        <th className="w-[4%] px-3 py-2.5 text-right text-[10px] font-extrabold uppercase tracking-[0.04em] text-[#7B8DB3] 2xl:px-4 2xl:py-3">
                          Actions
                        </th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-[#E6ECF2] bg-white">
                      {filteredArchivedLeads.length > 0 ? (
                        filteredArchivedLeads.map((rec, index) => (
                          <tr
                            key={rec.leadId}
                            onClick={() => handleOpenTalentPoolProfile(rec)}
                            style={{
                              animationDelay: `${index * 30}ms`,
                              animationFillMode: "both",
                            }}
                            className="sibs-page-card-in group cursor-pointer bg-white transition-colors duration-150 hover:bg-[#F8FAFC]"
                          >
                            <td className="px-3 py-2 align-middle 2xl:px-4 2xl:py-2.5">
                              <p className="truncate text-xs font-extrabold leading-5 text-[#042C51] transition-colors group-hover:text-[#FF5C28]">
                                {rec.fullName}
                              </p>
                              <p className="mt-0.5 truncate font-mono text-[9.5px] font-bold uppercase tracking-wide text-[#98A2B3] 2xl:text-[10px]">
                                Lead ID: {rec.leadId}
                              </p>
                              <p className="mt-0.5 truncate font-mono text-[9.5px] font-extrabold uppercase tracking-wide text-emerald-700 2xl:text-[10px]">
                                TP ID: {rec.talentPoolId}
                              </p>
                            </td>

                            <td className="px-3 py-2 align-middle 2xl:px-4 2xl:py-2.5">
                              <div className="flex items-center gap-1.5">
                                <Phone size={12} className="shrink-0 text-emerald-600" />
                                <span className="truncate text-xs font-bold text-[#475467]">
                                  {rec.cpNum}
                                </span>
                              </div>
                              <div className="mt-0.5 flex items-center gap-1.5">
                                <Mail size={12} className="shrink-0 text-[#98A2B3]" />
                                <span className="max-w-[200px] truncate text-[10px] font-medium text-[#667085] 2xl:text-[11px]">
                                  {rec.email}
                                </span>
                              </div>
                            </td>

                            <td className="px-3 py-2 align-middle 2xl:px-4 2xl:py-2.5">
                              <p className="truncate text-xs font-bold text-[#042C51]">
                                {rec.department}
                              </p>
                              <p className="mt-0.5 truncate text-[10px] font-medium text-[#667085] 2xl:text-[11px]">
                                {rec.specificAccount}
                              </p>
                            </td>

                            <td className="px-3 py-2 align-middle 2xl:px-4 2xl:py-2.5">
                              <div className="flex items-center gap-1.5 text-xs font-semibold text-[#475467]">
                                <MapPin size={12} className="shrink-0 text-[#98A2B3]" />
                                <span>{rec.preferredSite}</span>
                              </div>
                            </td>

                            <td className="px-3 py-2 align-middle 2xl:px-4 2xl:py-2.5">
                              <span className="inline-flex items-center gap-1 whitespace-nowrap rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wide text-emerald-700 2xl:text-[10px]">
                                <Archive size={11} />
                                Leads Converted
                              </span>
                            </td>

                            <td className="px-3 py-2 align-middle 2xl:px-4 2xl:py-2.5">
                              <div className="flex min-w-0 items-start gap-1.5">
                                <User size={12} className="mt-0.5 shrink-0 text-[#FF5C28]" />
                                <div className="min-w-0">
                                  <p className="truncate text-xs font-bold text-[#042C51]">
                                    {rec.transferredBy}
                                  </p>
                                  <p className="mt-0.5 truncate text-[9.5px] font-medium text-[#98A2B3] 2xl:text-[10px]">
                                    Transferred: {rec.dateTransferred}
                                  </p>
                                </div>
                              </div>
                            </td>

                            <td
                              className="px-3 py-2 align-middle 2xl:px-4 2xl:py-2.5"
                              onClick={(event) => event.stopPropagation()}
                            >
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => handleOpenTalentPoolProfile(rec)}
                                  title="Open Talent Pool Profile"
                                  className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-blue-200 bg-blue-50 text-blue-600 transition hover:bg-blue-100"
                                >
                                  <Eye size={12} />
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handleRestoreFromArchive(rec)}
                                  title="Restore Lead"
                                  className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-[#DDE5EE] bg-white text-[#667085] transition hover:border-[#FF5C28]/40 hover:text-[#FF5C28]"
                                >
                                  <RotateCcw size={12} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={7} className="px-5 py-14 text-center">
                            <Archive className="mx-auto h-8 w-8 text-[#CBD5E1]" />
                            <p className="mt-2 text-sm font-extrabold text-[#042C51]">
                              No archived applicant leads
                            </p>
                            <p className="mt-1 text-xs font-semibold text-[#98A2B3]">
                              Converted Talent Pool leads will appear here.
                            </p>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                <div className="flex flex-col gap-3 border-t border-[#E6ECF2] bg-white px-4 py-3 text-xs font-semibold text-[#667085] sm:flex-row sm:items-center sm:justify-between">
                  <span>
                    Showing <strong className="text-[#042C51]">{filteredArchivedLeads.length}</strong> converted applicant leads out of{" "}
                    <strong className="text-[#042C51]">{archivedLeads.length}</strong>
                  </span>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      disabled
                      className="inline-flex h-8 items-center justify-center rounded-lg border border-[#DDE5EE] bg-white px-3 font-bold text-[#667085] opacity-50"
                    >
                      <ChevronLeft size={13} />
                      Previous
                    </button>
                    <span className="inline-flex h-8 min-w-8 items-center justify-center rounded-lg bg-[#FF5C28] px-2 font-extrabold text-white">
                      1
                    </span>
                    <button
                      type="button"
                      disabled
                      className="inline-flex h-8 items-center justify-center rounded-lg border border-[#DDE5EE] bg-white px-3 font-bold text-[#667085] opacity-50"
                    >
                      Next
                      <ChevronRight size={13} />
                    </button>
                  </div>
                </div>
              </>
            ) : null}

            {activeTab === "sources" ? (
              <div className="grid gap-3.5 p-3.5 sm:p-4 lg:grid-cols-2 2xl:gap-4 2xl:p-5">
                <section className="rounded-2xl border border-[#E6ECF2] bg-white p-3.5 shadow-xs sm:p-4 2xl:p-5">
                  <h3 className="text-xs font-extrabold uppercase tracking-wide text-[#042C51]">
                    Lead Generation Channel Breakdown
                  </h3>
                  <p className="mt-0.5 text-xs font-semibold text-[#667085]">
                    Distribution of pre-applicant inquiries across recruitment channels.
                  </p>

                  <div className="mt-4 space-y-3">
                    {[
                      { name: "Unassigned", count: 0, pct: 0, color: "#64748B" },
                      { name: "Walk-in", count: 2, pct: 50, color: "#2563EB" },
                      { name: "Facebook / Social Media", count: 1, pct: 25, color: "#A855F7" },
                      { name: "Job Fair", count: 1, pct: 25, color: "#FF5C28" },
                      { name: "Employee Referral", count: 0, pct: 0, color: "#10B981" },
                      { name: "Phone Call Inquiry", count: 0, pct: 0, color: "#F59E0B" },
                    ].map((item) => (
                      <div key={item.name}>
                        <div className="mb-1.5 flex items-center justify-between gap-3 text-xs font-extrabold text-[#042C51]">
                          <span className="truncate">{item.name}</span>
                          <span className="shrink-0">
                            {item.count} leads ({item.pct}%)
                          </span>
                        </div>
                        <div className="h-2 overflow-hidden rounded-full bg-[#EEF2F6]">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${item.pct}%`,
                              backgroundColor: item.color,
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                <section className="rounded-2xl border border-[#E6ECF2] bg-white p-3.5 shadow-xs sm:p-4 2xl:p-5">
                  <h3 className="text-xs font-extrabold uppercase tracking-wide text-[#042C51]">
                    Account Lead Intake Volume
                  </h3>
                  <p className="mt-0.5 text-xs font-semibold text-[#667085]">
                    Target account client demand from inbound leads.
                  </p>

                  <div className="mt-4 space-y-2.5">
                    {[
                      { account: "CD - Collect", leads: 2 },
                      { account: "CD - Teledentistry", leads: 1 },
                      { account: "AHG Inbound/Outbound", leads: 1 },
                      { account: "Bayshore Dental Studio", leads: 0 },
                    ].map((item) => (
                      <div
                        key={item.account}
                        className="flex items-center justify-between gap-3 rounded-xl border border-[#E6ECF2] bg-[#F8FAFC] px-3.5 py-2.5"
                      >
                        <div className="min-w-0">
                          <p className="truncate text-xs font-extrabold text-[#042C51]">
                            {item.account}
                          </p>
                          <p className="text-[10px] font-semibold text-[#91A2B8]">
                            Target Account Client
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-extrabold text-[#042C51]">
                            {item.leads}
                          </p>
                          <p className="text-[10px] font-semibold text-[#91A2B8]">
                            Total Inquiries
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              </div>
            ) : null}
          </div>
        </div>
      </section>

      {/* ==================== CANDIDATE PROFILE MODAL (From Archive) ==================== */}
      <CandidateProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        candidate={selectedCandidateForProfile}
        onMoveToPipeline={c => {
          setIsProfileModalOpen(false);
          onSwitchModule?.("Talent Pool");
        }}
      />

      {/* ==================== LEAD APPLICANT PROFILE MODAL & AUDIT HISTORY ==================== */}
      <LeadApplicantProfileModal
        isOpen={isLeadProfileModalOpen}
        lead={selectedLeadForProfile}
        currentUser={currentAccountName}
        onClose={() => setIsLeadProfileModalOpen(false)}
        onUpdateLead={handleUpdateLead}
        onMoveToTalentPool={handleMoveToTalentPool}
        onSendApplicationLink={handleSendLinkEmail}
        initialEditMode={isLeadProfileInitialEdit}
      />

      {/* ==================== LOG / EDIT LEAD MODAL ==================== */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="sibs-modal-backdrop-in sibs-modal-blur fixed inset-0 z-[1000] flex items-center justify-center p-3 font-jakarta sm:p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="sibs-modal-pop-in relative flex max-h-[86vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-[#D6DEE8] bg-white shadow-2xl"
            >
              <header className="shrink-0 bg-[#042C51] px-4 py-3 text-white sm:px-5 2xl:py-3.5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex min-w-0 items-start gap-2.5 sm:gap-3">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/20 bg-white/10 text-[#FF5C28] 2xl:h-9 2xl:w-9">
                      <UserPlus className="h-4 w-4" />
                    </span>

                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="sibs-modal-title truncate text-white">
                          {editingLead ? "Edit Applicant Lead" : "Log New Applicant Lead"}
                        </h2>

                        <span className="inline-flex rounded-full bg-[#FF5C28] px-2 py-0.5 text-[8.5px] font-extrabold uppercase tracking-wide text-white">
                          Lead Intake
                        </span>
                      </div>

                      <p className="sibs-modal-subtitle mt-0.5 truncate text-white/75 sm:text-clip">
                        Capture preliminary inquiries before moving to Talent Pool.
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="sibs-modal-close-btn"
                    aria-label="Close applicant lead modal"
                  >
                    <X size={16} />
                  </button>
                </div>
              </header>

              <form
                onSubmit={handleSaveLead}
                className="flex min-h-0 flex-1 flex-col overflow-hidden"
              >
                <div className="sibs-scrollbar min-h-0 flex-1 space-y-4 overflow-y-auto overscroll-contain bg-[#F7F9FC] p-3 sm:p-4 2xl:p-5">
                  <div className="flex flex-col gap-2 rounded-xl border border-blue-200 bg-[#E9F0FC] p-3 text-xs sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-2 font-extrabold text-[#042C51]">
                      <UserCheck size={16} className="text-[#FF5C28]" />
                      <span>Logging Account:</span>
                      <span className="rounded border border-blue-200 bg-white px-2 py-0.5 font-bold text-blue-900">
                        {currentAccountName}
                      </span>
                    </div>
                    <span className="text-[10px] font-semibold text-[#667085]">
                      Auto-captured from active login
                    </span>
                  </div>

                  <section className="rounded-2xl border border-[#DCE6F1] bg-white p-3.5 shadow-[0_8px_24px_rgba(4,44,81,0.04)] sm:p-4 2xl:p-5">
                    <div className="mb-3 flex items-start gap-2.5 border-b border-[#EEF2F6] pb-2.5">
                      <User className="mt-0.5 h-4 w-4 shrink-0 text-[#FF5C28]" />
                      <div>
                        <h3 className="text-sm font-extrabold text-[#042C51]">
                          Candidate Information
                        </h3>
                        <p className="mt-0.5 text-xs font-semibold text-[#667085]">
                          Legal identification and direct contact channels.
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      {[
                        ["First Name", "firstName", true, "Enter First Name"],
                        ["Last Name", "lastName", true, "Enter Last Name"],
                        ["Middle Name", "middleName", false, "Enter Middle Name"],
                        ["Suffix", "suffix", false, "e.g. Jr., Sr., III"],
                      ].map(([label, key, required, placeholder]) => (
                        <label key={key as string} className="block">
                          <span className="mb-1.5 block text-[9px] font-extrabold uppercase tracking-wide text-[#98A2B3]">
                            {label} {required ? <span className="text-[#FF5C28]">*</span> : null}
                          </span>
                          <input
                            required={Boolean(required)}
                            value={(formData as any)[key as string]}
                            onChange={(event) =>
                              setFormData({
                                ...formData,
                                [key as string]: event.target.value,
                              })
                            }
                            placeholder={placeholder as string}
                            className="h-10 w-full rounded-xl border border-[#D7DEE8] bg-[#F8FAFC] px-3 text-xs font-semibold uppercase text-[#042C51] outline-none transition placeholder:normal-case placeholder:text-[#98A2B3] hover:border-[#FF5C28]/40 hover:bg-white focus:border-[#FF5C28] focus:bg-white focus:ring-4 focus:ring-[#FF5C28]/10"
                          />
                        </label>
                      ))}

                      <label className="block">
                        <span className="mb-1.5 block text-[9px] font-extrabold uppercase tracking-wide text-[#98A2B3]">
                          Cellphone / CP Number <span className="text-[#FF5C28]">*</span>
                        </span>
                        <input
                          required
                          value={formData.cpNum}
                          onChange={(event) =>
                            setFormData({
                              ...formData,
                              cpNum: event.target.value.replace(/\D/g, "").slice(0, 11),
                            })
                          }
                          maxLength={11}
                          inputMode="numeric"
                          placeholder="e.g. 09123456789"
                          className="h-10 w-full rounded-xl border border-[#D7DEE8] bg-[#F8FAFC] px-3 text-xs font-semibold text-[#042C51] outline-none transition placeholder:text-[#98A2B3] hover:border-[#FF5C28]/40 hover:bg-white focus:border-[#FF5C28] focus:bg-white focus:ring-4 focus:ring-[#FF5C28]/10"
                        />
                      </label>

                      <label className="block">
                        <span className="mb-1.5 block text-[9px] font-extrabold uppercase tracking-wide text-[#98A2B3]">
                          Email Address
                        </span>
                        <input
                          type="email"
                          value={formData.email}
                          onChange={(event) =>
                            setFormData({ ...formData, email: event.target.value })
                          }
                          placeholder="Enter Email Address"
                          className="h-10 w-full rounded-xl border border-[#D7DEE8] bg-[#F8FAFC] px-3 text-xs font-semibold text-[#042C51] outline-none transition placeholder:text-[#98A2B3] hover:border-[#FF5C28]/40 hover:bg-white focus:border-[#FF5C28] focus:bg-white focus:ring-4 focus:ring-[#FF5C28]/10"
                        />
                      </label>
                    </div>
                  </section>

                  <section className="rounded-2xl border border-[#DCE6F1] bg-white p-3.5 shadow-[0_8px_24px_rgba(4,44,81,0.04)] sm:p-4 2xl:p-5">
                    <div className="mb-3 flex items-start gap-2.5 border-b border-[#EEF2F6] pb-2.5">
                      <Building className="mt-0.5 h-4 w-4 shrink-0 text-[#FF5C28]" />
                      <div>
                        <h3 className="text-sm font-extrabold text-[#042C51]">
                          Lead Placement
                        </h3>
                        <p className="mt-0.5 text-xs font-semibold text-[#667085]">
                          Capture department, account, sourcing channel, site, and current lead status.
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <label className="block">
                        <span className="mb-1.5 block text-[9px] font-extrabold uppercase tracking-wide text-[#98A2B3]">
                          Department Position Category
                        </span>
                        <select
                          value={formData.department}
                          onChange={(event) =>
                            setFormData({ ...formData, department: event.target.value })
                          }
                          className="h-10 w-full rounded-xl border border-[#D7DEE8] bg-[#F8FAFC] px-3 text-xs font-semibold text-[#042C51] outline-none transition hover:border-[#FF5C28]/40 hover:bg-white focus:border-[#FF5C28] focus:bg-white focus:ring-4 focus:ring-[#FF5C28]/10"
                        >
                          <option value="Call Center Operations">Call Center Operations</option>
                          <option value="Human Resource">Human Resource</option>
                          <option value="Facility Management">Facility Management</option>
                          <option value="IT (Information and Communications Technology)">IT (ICT)</option>
                          <option value="Executive / Operations">Executive / Operations</option>
                        </select>
                      </label>

                      <label className="block">
                        <span className="mb-1.5 block text-[9px] font-extrabold uppercase tracking-wide text-[#98A2B3]">
                          Specific Target Account / Client
                        </span>
                        <select
                          value={formData.specificAccount}
                          onChange={(event) =>
                            setFormData({ ...formData, specificAccount: event.target.value })
                          }
                          className="h-10 w-full rounded-xl border border-[#D7DEE8] bg-[#F8FAFC] px-3 text-xs font-semibold text-[#042C51] outline-none transition hover:border-[#FF5C28]/40 hover:bg-white focus:border-[#FF5C28] focus:bg-white focus:ring-4 focus:ring-[#FF5C28]/10"
                        >
                          <option value="CD - Collect">CD - Collect</option>
                          <option value="CD - Teledentistry">CD - Teledentistry</option>
                          <option value="AHG Inbound/Outbound">AHG Inbound/Outbound</option>
                          <option value="Bayshore Dental Studio">Bayshore Dental Studio</option>
                          <option value="AHG Auditor">AHG Auditor</option>
                          <option value="General Pool / Non-Voice">General Pool / Non-Voice</option>
                        </select>
                      </label>

                      <label className="block">
                        <span className="mb-1.5 block text-[9px] font-extrabold uppercase tracking-wide text-[#98A2B3]">
                          Lead Sourcing Channel
                        </span>
                        <select
                          value={formData.source}
                          onChange={(event) =>
                            setFormData({
                              ...formData,
                              source: event.target.value as ApplicantLead["source"],
                            })
                          }
                          className="h-10 w-full rounded-xl border border-[#D7DEE8] bg-[#F8FAFC] px-3 text-xs font-semibold text-[#042C51] outline-none transition hover:border-[#FF5C28]/40 hover:bg-white focus:border-[#FF5C28] focus:bg-white focus:ring-4 focus:ring-[#FF5C28]/10"
                        >
                          <option value="Walk-in">Walk-in Inquiry</option>
                          <option value="Job Fair">Job Fair Booth</option>
                          <option value="Facebook / Social Media">Facebook / Social Media</option>
                          <option value="Phone Call Inquiry">Phone Call Inquiry</option>
                          <option value="Employee Referral">Employee Referral</option>
                          <option value="SMS Inquiry">SMS Inquiry</option>
                          <option value="LinkedIn">LinkedIn Outreach</option>
                          <option value="Other">Other</option>
                        </select>
                      </label>

                      <label className="block">
                        <span className="mb-1.5 block text-[9px] font-extrabold uppercase tracking-wide text-[#98A2B3]">
                          Preferred SiBS Site Location
                        </span>
                        <select
                          value={formData.preferredSite}
                          onChange={(event) =>
                            setFormData({
                              ...formData,
                              preferredSite: event.target.value as ApplicantLead["preferredSite"],
                            })
                          }
                          className="h-10 w-full rounded-xl border border-[#D7DEE8] bg-[#F8FAFC] px-3 text-xs font-semibold text-[#042C51] outline-none transition hover:border-[#FF5C28]/40 hover:bg-white focus:border-[#FF5C28] focus:bg-white focus:ring-4 focus:ring-[#FF5C28]/10"
                        >
                          <option value="Tagum City">Tagum City Site (Main Hub)</option>
                          <option value="Davao City">Davao City Site</option>
                          <option value="Municipality of Mabini">Municipality of Mabini</option>
                        </select>
                      </label>

                      <label className="block sm:col-span-2">
                        <span className="mb-1.5 block text-[9px] font-extrabold uppercase tracking-wide text-[#98A2B3]">
                          Initial Lead Status
                        </span>
                        <select
                          value={formData.status}
                          onChange={(event) =>
                            setFormData({
                              ...formData,
                              status: event.target.value as ApplicantLead["status"],
                            })
                          }
                          className="h-10 w-full rounded-xl border border-[#D7DEE8] bg-[#F8FAFC] px-3 text-xs font-semibold text-[#042C51] outline-none transition hover:border-[#FF5C28]/40 hover:bg-white focus:border-[#FF5C28] focus:bg-white focus:ring-4 focus:ring-[#FF5C28]/10"
                        >
                          <option value="New Lead">New Lead (Awaiting Contact)</option>
                          <option value="Contacted">Contacted (Spoke with applicant)</option>
                          <option value="Application Link Sent">Application Link Sent (SMS/Email Form)</option>
                          <option value="On Hold">On Hold</option>
                          <option value="Not Interested">Not Interested</option>
                        </select>
                      </label>
                    </div>
                  </section>

                  <section className="rounded-2xl border border-[#DCE6F1] bg-white p-3.5 shadow-[0_8px_24px_rgba(4,44,81,0.04)] sm:p-4 2xl:p-5">
                    <div className="mb-3 flex items-start gap-2.5 border-b border-[#EEF2F6] pb-2.5">
                      <MessageSquare className="mt-0.5 h-4 w-4 shrink-0 text-[#FF5C28]" />
                      <div>
                        <h3 className="text-sm font-extrabold text-[#042C51]">
                          Inquiry Notes &amp; Remarks
                        </h3>
                        <p className="mt-0.5 text-xs font-semibold text-[#667085]">
                          Record walk-in notes, caller background, shift preference, or recruiter notes.
                        </p>
                      </div>
                    </div>

                    <textarea
                      rows={3}
                      value={formData.notes}
                      onChange={(event) =>
                        setFormData({ ...formData, notes: event.target.value })
                      }
                      placeholder="Record preliminary background, shift availability, or interview notes..."
                      className="min-h-24 w-full resize-none rounded-xl border border-[#D7DEE8] bg-[#F8FAFC] px-3 py-2 text-xs font-semibold text-[#042C51] outline-none transition placeholder:text-[#98A2B3] hover:border-[#FF5C28]/40 hover:bg-white focus:border-[#FF5C28] focus:bg-white focus:ring-4 focus:ring-[#FF5C28]/10"
                    />
                  </section>
                </div>

                <footer className="shrink-0 border-t border-[#E6ECF2] bg-white px-4 py-3 sm:px-5">
                  <div className="flex items-center justify-end gap-2.5">
                    <button
                      type="button"
                      onClick={() => setIsAddModalOpen(false)}
                      className="sibs-modal-btn-secondary"
                    >
                      Cancel
                    </button>

                    <button type="submit" className="sibs-modal-btn-primary gap-1.5">
                      <Check size={13} />
                      {editingLead ? "Update Lead" : "Save Applicant Lead"}
                    </button>
                  </div>
                </footer>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ==================== BULK EXCEL IMPORT MODAL ==================== */}
      <AnimatePresence>
        {isBulkModalOpen && (
          <div className="sibs-modal-backdrop-in sibs-modal-blur fixed inset-0 z-[1000] flex items-center justify-center p-4 font-jakarta">
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="sibs-modal-pop-in flex w-full max-w-xl flex-col overflow-hidden rounded-2xl border border-[#D6DEE8] bg-white shadow-2xl"
            >
              <header className="bg-[#042C51] px-4 py-3 text-white sm:px-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-start gap-2.5">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/15 bg-white/10 text-[#FF5C28]">
                      <Upload className="h-4 w-4" />
                    </span>

                    <div className="min-w-0">
                      <span className="text-[9px] font-extrabold uppercase tracking-wide text-white/60">
                        Applicant Leads
                      </span>
                      <h3 className="sibs-modal-title mt-0.5 truncate text-white">
                        Upload Leads
                      </h3>
                      <p className="sibs-modal-subtitle mt-0.5 text-white/75">
                        Upload .xlsx or .csv files with candidate lead rosters.
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsBulkModalOpen(false)}
                    className="sibs-modal-close-btn"
                    aria-label="Close upload modal"
                  >
                    <X size={16} />
                  </button>
                </div>
              </header>

              <div className="space-y-4 p-4 sm:p-5">
                <div className="rounded-2xl border-2 border-dashed border-[#D7DEE8] bg-[#F8FAFC] p-6 text-center transition hover:border-[#FF5C28]/50">
                  <FileSpreadsheet className="mx-auto h-9 w-9 text-[#0B4E8A]" />
                  <p className="mt-2 text-sm font-extrabold text-[#042C51]">
                    Select Excel / CSV Leads File
                  </p>
                  <p className="mt-1 text-xs font-semibold text-[#667085]">
                    Supports standard column headers such as Full Name, Phone, Email, Account, and Site.
                  </p>

                  <input
                    type="file"
                    accept=".xlsx,.xls,.csv"
                    onChange={handleFileUpload}
                    className="mt-4 text-xs font-semibold text-[#667085] file:mr-3 file:rounded-lg file:border-0 file:bg-[#042C51] file:px-4 file:py-2 file:text-xs file:font-extrabold file:text-white hover:file:bg-[#FF5C28]"
                  />
                </div>

                {bulkError ? (
                  <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-xs font-bold text-red-600">
                    {bulkError}
                  </div>
                ) : null}

                {isProcessing ? (
                  <div className="rounded-xl border border-blue-100 bg-blue-50 px-3 py-2.5 text-xs font-bold text-[#0B4E8A]">
                    Processing uploaded lead file...
                  </div>
                ) : null}

                {parsedLeads.length > 0 ? (
                  <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                    <div className="flex items-center gap-2 text-xs font-extrabold text-emerald-800">
                      <CheckCircle className="h-4 w-4 text-emerald-600" />
                      Ready to import {parsedLeads.length} leads
                    </div>

                    <div className="mt-2 max-h-32 overflow-y-auto divide-y divide-emerald-100 text-[11px] font-semibold text-emerald-900">
                      {parsedLeads.slice(0, 5).map((lead, index) => (
                        <div key={index} className="flex justify-between gap-3 py-1">
                          <span className="truncate">{lead.fullName}</span>
                          <span className="shrink-0 font-mono text-emerald-700">
                            {lead.cpNum}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>

              <footer className="flex justify-end gap-2.5 border-t border-[#E6ECF2] bg-[#F8FAFC] px-4 py-3 sm:px-5">
                <button
                  type="button"
                  onClick={() => setIsBulkModalOpen(false)}
                  className="sibs-modal-btn-secondary"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  disabled={parsedLeads.length === 0}
                  onClick={handleConfirmBulkImport}
                  className="sibs-modal-btn-primary"
                >
                  Confirm Import ({parsedLeads.length})
                </button>
              </footer>
            </motion.div>
          </div>
        )}
      </AnimatePresence>


    </div>
  );
}
