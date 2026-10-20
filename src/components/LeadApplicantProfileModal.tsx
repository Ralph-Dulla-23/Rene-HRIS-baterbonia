import React, { useState, useMemo } from "react";
import {
  X,
  User,
  Phone,
  Mail,
  MapPin,
  Briefcase,
  Building,
  Calendar,
  Clock,
  Edit2,
  Check,
  Send,
  ArrowRight,
  Sparkles,
  MessageSquare,
  History,
  FileText,
  Copy,
  ExternalLink,
  Plus,
  Tag,
  AlertCircle,
  CheckCircle2,
  PhoneCall,
  Share2,
  ChevronRight,
  ShieldCheck,
  BadgeCheck,
  UserCheck
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { ApplicantLead, LeadHistoryItem } from "../data/recruitmentStore";

interface LeadApplicantProfileModalProps {
  isOpen: boolean;
  lead: ApplicantLead | null;
  currentUser: string;
  onClose: () => void;
  onUpdateLead: (updatedLead: ApplicantLead) => void;
  onMoveToTalentPool: (lead: ApplicantLead) => void;
  onSendApplicationLink: (lead: ApplicantLead) => void;
  initialEditMode?: boolean;
}

export default function LeadApplicantProfileModal({
  isOpen,
  lead,
  currentUser,
  onClose,
  onUpdateLead,
  onMoveToTalentPool,
  onSendApplicationLink,
  initialEditMode = false
}: LeadApplicantProfileModalProps) {
  if (!isOpen || !lead) return null;

  // Tabs: "overview" | "history"
  const [activeTab, setActiveTab] = useState<"overview" | "history">("overview");

  // Edit Mode state
  const [isEditing, setIsEditing] = useState<boolean>(initialEditMode);

  // Form State for editing
  const [formData, setFormData] = useState({
    firstName: lead.firstName || lead.fullName.split(" ")[0] || "",
    middleName: lead.middleName || "",
    lastName: lead.lastName || lead.fullName.split(" ").slice(1).join(" ") || "",
    suffix: lead.suffix || "",
    cpNum: lead.cpNum,
    email: lead.email,
    department: lead.department,
    specificAccount: lead.specificAccount || "CD - Collect",
    source: lead.source,
    preferredSite: lead.preferredSite,
    status: lead.status,
    notes: lead.notes,
    referralCode: lead.referralCode || ""
  });

  // Sync state whenever lead or initialEditMode changes
  React.useEffect(() => {
    if (lead) {
      const names = lead.fullName.split(" ");
      setFormData({
        firstName: lead.firstName || names[0] || "",
        middleName: lead.middleName || "",
        lastName: lead.lastName || names.slice(1).join(" ") || "",
        suffix: lead.suffix || "",
        cpNum: lead.cpNum,
        email: lead.email,
        department: lead.department,
        specificAccount: lead.specificAccount || "CD - Collect",
        source: lead.source,
        preferredSite: lead.preferredSite,
        status: lead.status,
        notes: lead.notes,
        referralCode: lead.referralCode || ""
      });
      setIsEditing(initialEditMode);
      setActiveTab("overview");
    }
  }, [lead?.id, initialEditMode, isOpen]);

  // New History Note Composer state
  const [newNoteText, setNewNoteText] = useState("");
  const [newNoteType, setNewNoteType] = useState<LeadHistoryItem["type"]>("note");
  const [isAddingNote, setIsAddingNote] = useState(false);

  // Quick Copy Feedback state
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const copyToClipboard = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  // Switch to edit mode with current lead values
  const handleStartEditing = () => {
    const names = lead.fullName.split(" ");
    setFormData({
      firstName: lead.firstName || names[0] || "",
      middleName: lead.middleName || "",
      lastName: lead.lastName || names.slice(1).join(" ") || "",
      suffix: lead.suffix || "",
      cpNum: lead.cpNum,
      email: lead.email,
      department: lead.department,
      specificAccount: lead.specificAccount || "CD - Collect",
      source: lead.source,
      preferredSite: lead.preferredSite,
      status: lead.status,
      notes: lead.notes,
      referralCode: lead.referralCode || ""
    });
    setIsEditing(true);
    setActiveTab("overview");
  };

  // Cancel Editing
  const handleCancelEditing = () => {
    setIsEditing(false);
  };

  // Save Edits & Generate History Log of Changes
  const handleSaveEdits = (e: React.FormEvent) => {
    e.preventDefault();

    const constructedFullName = `${formData.firstName} ${formData.middleName ? formData.middleName + " " : ""}${formData.lastName}${formData.suffix ? " " + formData.suffix : ""}`.trim();

    // Compute diff for history
    const changes: string[] = [];
    if (constructedFullName !== lead.fullName) changes.push(`Name changed to "${constructedFullName}"`);
    if (formData.cpNum !== lead.cpNum) changes.push(`Phone updated to "${formData.cpNum}"`);
    if (formData.email !== lead.email) changes.push(`Email updated to "${formData.email || 'None'}"`);
    if (formData.department !== lead.department) changes.push(`Department changed to "${formData.department}"`);
    if (formData.specificAccount !== lead.specificAccount) changes.push(`Account Fit set to "${formData.specificAccount}"`);
    if (formData.preferredSite !== lead.preferredSite) changes.push(`Preferred Site changed to "${formData.preferredSite}"`);
    if (formData.source !== lead.source) changes.push(`Sourcing Channel changed to "${formData.source}"`);
    if (formData.status !== lead.status) changes.push(`Status changed from "${lead.status}" to "${formData.status}"`);
    if (formData.notes !== lead.notes) changes.push(`Intake notes updated`);

    const currentDate = new Date().toISOString().split("T")[0];
    const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    let updatedHistory = [...(lead.history || [])];

    if (changes.length > 0) {
      const editHistoryItem: LeadHistoryItem = {
        id: `hist-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        date: currentDate,
        time: currentTime,
        action: `Profile updated by ${currentUser}: ${changes.join("; ")}.`,
        user: currentUser,
        type: "edit"
      };
      updatedHistory = [editHistoryItem, ...updatedHistory];
    }

    const updatedLead: ApplicantLead = {
      ...lead,
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
      history: updatedHistory
    };

    onUpdateLead(updatedLead);
    setIsEditing(false);
  };

  // Quick Status Change directly from dropdown
  const handleQuickStatusChange = (newStatus: ApplicantLead["status"]) => {
    if (newStatus === lead.status) return;

    const currentDate = new Date().toISOString().split("T")[0];
    const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const statusHistoryItem: LeadHistoryItem = {
      id: `hist-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      date: currentDate,
      time: currentTime,
      action: `Lead status updated from "${lead.status}" to "${newStatus}" by ${currentUser}.`,
      user: currentUser,
      type: "status"
    };

    const updatedLead: ApplicantLead = {
      ...lead,
      status: newStatus,
      lastContactDate: currentDate,
      history: [statusHistoryItem, ...(lead.history || [])]
    };

    onUpdateLead(updatedLead);
  };

  // Add a Custom Activity Note / Interaction to History
  const handleAddCustomNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteText.trim()) return;

    const currentDate = new Date().toISOString().split("T")[0];
    const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    let actionPrefix = "Note logged";
    if (newNoteType === "call") actionPrefix = "Outbound Call Interaction";
    else if (newNoteType === "sms") actionPrefix = "SMS Inquiry / Follow-up";
    else if (newNoteType === "contact") actionPrefix = "Direct Recruiter Consultation";

    const customHistoryItem: LeadHistoryItem = {
      id: `hist-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      date: currentDate,
      time: currentTime,
      action: `${actionPrefix}: "${newNoteText.trim()}"`,
      user: currentUser,
      type: newNoteType
    };

    const updatedLead: ApplicantLead = {
      ...lead,
      lastContactDate: currentDate,
      history: [customHistoryItem, ...(lead.history || [])]
    };

    onUpdateLead(updatedLead);
    setNewNoteText("");
    setIsAddingNote(false);
  };

  // Get Status Badge Component
  const renderStatusBadge = (status: ApplicantLead["status"]) => {
    switch (status) {
      case "New Lead":
        return (
          <span className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-700 border border-blue-200 px-3 py-1 rounded-full text-xs font-black">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
            New Lead
          </span>
        );
      case "Contacted":
        return (
          <span className="inline-flex items-center gap-1.5 bg-amber-50 text-amber-700 border border-amber-200 px-3 py-1 rounded-full text-xs font-black">
            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
            Contacted
          </span>
        );
      case "Application Link Sent":
        return (
          <span className="inline-flex items-center gap-1.5 bg-purple-50 text-purple-700 border border-purple-200 px-3 py-1 rounded-full text-xs font-black">
            <span className="w-2 h-2 rounded-full bg-purple-500"></span>
            Application Link Sent
          </span>
        );
      case "Converted to Applicant":
        return (
          <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1 rounded-full text-xs font-black">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            Converted to Talent Pool
          </span>
        );
      case "On Hold":
        return (
          <span className="inline-flex items-center gap-1.5 bg-slate-100 text-slate-700 border border-slate-200 px-3 py-1 rounded-full text-xs font-black">
            <span className="w-2 h-2 rounded-full bg-slate-400"></span>
            On Hold
          </span>
        );
      case "Not Interested":
        return (
          <span className="inline-flex items-center gap-1.5 bg-rose-50 text-rose-700 border border-rose-200 px-3 py-1 rounded-full text-xs font-black">
            <span className="w-2 h-2 rounded-full bg-rose-500"></span>
            Not Interested
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 bg-slate-100 text-slate-700 border border-slate-200 px-3 py-1 rounded-full text-xs font-black">
            {status}
          </span>
        );
    }
  };

  // Get History Type Icon
  const getHistoryIcon = (type?: LeadHistoryItem["type"]) => {
    switch (type) {
      case "create":
        return <UserCheck className="w-4 h-4 text-emerald-600" />;
      case "status":
        return <Tag className="w-4 h-4 text-amber-600" />;
      case "call":
        return <PhoneCall className="w-4 h-4 text-blue-600" />;
      case "sms":
        return <Send className="w-4 h-4 text-purple-600" />;
      case "edit":
        return <Edit2 className="w-4 h-4 text-orange-600" />;
      case "transfer":
        return <ArrowRight className="w-4 h-4 text-emerald-600" />;
      default:
        return <MessageSquare className="w-4 h-4 text-slate-600" />;
    }
  };

  const getHistoryBadgeBg = (type?: LeadHistoryItem["type"]) => {
    switch (type) {
      case "create":
        return "bg-emerald-100 border-emerald-200";
      case "status":
        return "bg-amber-100 border-amber-200";
      case "call":
        return "bg-blue-100 border-blue-200";
      case "sms":
        return "bg-purple-100 border-purple-200";
      case "edit":
        return "bg-orange-100 border-orange-200";
      case "transfer":
        return "bg-emerald-100 border-emerald-200";
      default:
        return "bg-slate-100 border-slate-200";
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 select-none overflow-y-auto" id="lead-profile-modal-overlay">
      <motion.div
        initial={{ opacity: 0, scale: 0.97, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.97, y: 10 }}
        transition={{ duration: 0.2 }}
        className="bg-white max-w-4xl w-full rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]"
        id="lead-applicant-profile-modal-container"
      >
        {/* ==================== 1. MODAL HEADER ==================== */}
        <div className="bg-[#042C51] text-white p-5 sm:p-6 shrink-0 relative overflow-hidden border-b border-blue-900">
          {/* Subtle Ambient Background Accent */}
          <div className="absolute right-0 top-0 w-80 h-full bg-gradient-to-l from-white/5 to-transparent pointer-events-none"></div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
            {/* Candidate Identity */}
            <div className="flex items-start sm:items-center gap-3.5">
              <div className="w-13 h-13 rounded-2xl bg-gradient-to-br from-[#FF5C28] to-[#d94a1d] text-white flex items-center justify-center text-lg font-black shadow-md border-2 border-white/20 shrink-0">
                {lead.fullName
                  .split(" ")
                  .map(n => n[0])
                  .slice(0, 2)
                  .join("")
                  .toUpperCase()}
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <span className="px-2 py-0.5 rounded-md bg-white/10 text-orange-300 font-mono text-[11px] font-black border border-white/10">
                    {lead.id}
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-white/10 text-slate-200 text-[11px] font-bold">
                    {lead.source}
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 text-[11px] font-bold border border-emerald-500/30">
                    {lead.preferredSite}
                  </span>
                </div>

                <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
                  <span>{lead.fullName}</span>
                </h2>

                <p className="text-xs text-blue-200/90 font-medium flex items-center gap-1.5 mt-0.5">
                  <Building className="w-3.5 h-3.5 text-orange-400" />
                  <span className="font-bold text-white">{lead.specificAccount || "CD - Collect"}</span>
                  <span className="text-blue-300">•</span>
                  <span>{lead.department}</span>
                </p>
              </div>
            </div>

            {/* Quick Action Toolbar */}
            <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
              {/* Close Button */}
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/10 rounded-xl transition-colors text-slate-300 hover:text-white cursor-pointer ml-1"
                title="Close Profile"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Action Row */}
          <div className="mt-4 pt-3 border-t border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs">
            {/* Status Quick Dropdown */}
            <div className="flex items-center gap-2">
              <span className="text-blue-200 font-bold text-[11px]">Current Status:</span>
              <select
                value={lead.status}
                onChange={e => handleQuickStatusChange(e.target.value as any)}
                disabled={isEditing}
                className="bg-white/15 hover:bg-white/20 border border-white/20 rounded-lg px-2.5 py-1 text-white font-bold text-xs focus:outline-none focus:bg-[#042C51] cursor-pointer transition-all disabled:opacity-50"
              >
                <option value="New Lead" className="text-slate-900 bg-white">New Lead</option>
                <option value="Contacted" className="text-slate-900 bg-white">Contacted</option>
                <option value="Application Link Sent" className="text-slate-900 bg-white">Application Link Sent</option>
                <option value="Converted to Applicant" className="text-slate-900 bg-white">Converted to Applicant</option>
                <option value="On Hold" className="text-slate-900 bg-white">On Hold</option>
                <option value="Not Interested" className="text-slate-900 bg-white">Not Interested</option>
              </select>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Edit Mode Toggle Button */}
              {!isEditing ? (
                <button
                  type="button"
                  onClick={handleStartEditing}
                  className="px-3 py-1.5 bg-white hover:bg-slate-100 text-[#042C51] rounded-lg font-black text-xs transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                  id="btn-edit-lead-profile"
                >
                  <Edit2 className="w-3.5 h-3.5 text-[#FF5C28]" />
                  <span>Edit Profile</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleCancelEditing}
                  className="px-3 py-1.5 bg-white/20 hover:bg-white/30 text-white rounded-lg font-bold text-xs transition-all cursor-pointer"
                >
                  Cancel Edit
                </button>
              )}

              {/* Send Application Link */}
              <button
                type="button"
                onClick={() => onSendApplicationLink(lead)}
                className="px-3 py-1.5 bg-purple-500/30 hover:bg-purple-500/40 text-purple-200 border border-purple-400/40 rounded-lg font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer"
                title="Send SMS/Email Application Form Link"
              >
                <Send className="w-3.5 h-3.5 text-purple-300" />
                <span>Send Form Link</span>
              </button>

              {/* Move to Talent Pool */}
              <button
                type="button"
                onClick={() => {
                  onMoveToTalentPool(lead);
                  onClose();
                }}
                className="px-3 py-1.5 bg-[#FF5C28] hover:bg-[#e04b1c] text-white rounded-lg font-black text-xs transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <ArrowRight className="w-3.5 h-3.5" />
                <span>To Talent Pool</span>
              </button>
            </div>
          </div>
        </div>

        {/* ==================== 2. NAVIGATION TABS ==================== */}
        <div className="flex items-center justify-between border-b border-slate-200 px-5 sm:px-6 bg-[#F8FAFC]">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab("overview")}
              className={`py-3 px-3 text-xs font-black tracking-wide flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
                activeTab === "overview"
                  ? "border-[#FF5C28] text-[#FF5C28]"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>LEAD OVERVIEW & DETAILS</span>
              {isEditing && (
                <span className="px-1.5 py-0.2 rounded-md bg-orange-100 text-[#FF5C28] text-[10px] font-black">
                  EDITING
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab("history")}
              className={`py-3 px-3 text-xs font-black tracking-wide flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
                activeTab === "history"
                  ? "border-[#FF5C28] text-[#FF5C28]"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              <History className="w-4 h-4" />
              <span>ACTIVITY & AUDIT HISTORY</span>
              <span className="px-1.5 py-0.2 rounded-full bg-slate-200 text-slate-700 text-[10px] font-black">
                {lead.history?.length || 0}
              </span>
            </button>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-[11px] text-slate-400 font-mono">
            <span>Inputted by: <strong className="text-slate-700">{lead.inputtedBy}</strong></span>
            <span>•</span>
            <span>Logged: {lead.dateLogged}</span>
          </div>
        </div>

        {/* ==================== 3. MODAL CONTENT BODY ==================== */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 bg-slate-50/50">
          {/* TAB 1: LEAD OVERVIEW & PROFILE (READ-ONLY or EDIT ON CLICK) */}
          {activeTab === "overview" && (
            <div className="space-y-5">
              {/* If Editing Mode Active */}
              {isEditing ? (
                <form onSubmit={handleSaveEdits} className="space-y-4">
                  {/* Edit Banner Alert */}
                  <div className="p-3.5 bg-orange-50 border border-orange-200 rounded-xl flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 text-xs font-bold text-orange-900">
                      <Edit2 className="w-4 h-4 text-[#FF5C28]" />
                      <span>Editing mode active: Make modifications below and click Save Changes to record to history.</span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={handleCancelEditing}
                        className="px-3 py-1 bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-lg border border-slate-200 cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-3.5 py-1 bg-[#FF5C28] hover:bg-[#e04b1c] text-white text-xs font-black rounded-lg shadow-2xs flex items-center gap-1 cursor-pointer"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Save Changes</span>
                      </button>
                    </div>
                  </div>

                  {/* Name Fields Grid */}
                  <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3">
                    <h3 className="text-xs font-black uppercase text-[#042C51] tracking-wider flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-[#FF5C28]" />
                      <span>Applicant Name Identification</span>
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5 text-xs">
                      <div>
                        <label className="text-[10.5px] font-black text-slate-600 block mb-1">First Name *</label>
                        <input
                          type="text"
                          required
                          value={formData.firstName}
                          onChange={e => setFormData({ ...formData, firstName: e.target.value })}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-bold text-slate-800 focus:outline-none focus:border-[#042C51] focus:bg-white"
                        />
                      </div>
                      <div>
                        <label className="text-[10.5px] font-black text-slate-600 block mb-1">Middle Name</label>
                        <input
                          type="text"
                          value={formData.middleName}
                          onChange={e => setFormData({ ...formData, middleName: e.target.value })}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-bold text-slate-800 focus:outline-none focus:border-[#042C51] focus:bg-white"
                        />
                      </div>
                      <div>
                        <label className="text-[10.5px] font-black text-slate-600 block mb-1">Last Name *</label>
                        <input
                          type="text"
                          required
                          value={formData.lastName}
                          onChange={e => setFormData({ ...formData, lastName: e.target.value })}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-bold text-slate-800 focus:outline-none focus:border-[#042C51] focus:bg-white"
                        />
                      </div>
                      <div>
                        <label className="text-[10.5px] font-black text-slate-600 block mb-1">Suffix</label>
                        <input
                          type="text"
                          placeholder="Jr, III, etc."
                          value={formData.suffix}
                          onChange={e => setFormData({ ...formData, suffix: e.target.value })}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-bold text-slate-800 focus:outline-none focus:border-[#042C51] focus:bg-white"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Contact Info Grid */}
                  <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3">
                    <h3 className="text-xs font-black uppercase text-[#042C51] tracking-wider flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-[#FF5C28]" />
                      <span>Contact Details</span>
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div>
                        <label className="text-[10.5px] font-black text-slate-600 block mb-1">Cellphone Number *</label>
                        <input
                          type="text"
                          required
                          value={formData.cpNum}
                          onChange={e => setFormData({ ...formData, cpNum: e.target.value })}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-bold text-slate-800 focus:outline-none focus:border-[#042C51] focus:bg-white"
                        />
                      </div>
                      <div>
                        <label className="text-[10.5px] font-black text-slate-600 block mb-1">Email Address</label>
                        <input
                          type="email"
                          value={formData.email}
                          onChange={e => setFormData({ ...formData, email: e.target.value })}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-bold text-slate-800 focus:outline-none focus:border-[#042C51] focus:bg-white"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Placement & Channel Grid */}
                  <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3">
                    <h3 className="text-xs font-black uppercase text-[#042C51] tracking-wider flex items-center gap-1.5">
                      <Briefcase className="w-3.5 h-3.5 text-[#FF5C28]" />
                      <span>Job Placement & Sourcing Attributes</span>
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div>
                        <label className="text-[10.5px] font-black text-slate-600 block mb-1">Department</label>
                        <select
                          value={formData.department}
                          onChange={e => setFormData({ ...formData, department: e.target.value })}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-bold text-slate-800 focus:outline-none focus:border-[#042C51] focus:bg-white"
                        >
                          <option value="Call Center Operations">Call Center Operations</option>
                          <option value="Human Resource">Human Resource</option>
                          <option value="Facility Management">Facility Management</option>
                          <option value="IT (Information and Communications Technology)">IT (ICT)</option>
                          <option value="Executive / Operations">Executive / Operations</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-[10.5px] font-black text-slate-600 block mb-1">Target Account / Client</label>
                        <select
                          value={formData.specificAccount}
                          onChange={e => setFormData({ ...formData, specificAccount: e.target.value })}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-bold text-slate-800 focus:outline-none focus:border-[#042C51] focus:bg-white"
                        >
                          <option value="CD - Collect">CD - Collect</option>
                          <option value="CD - Teledentistry">CD - Teledentistry</option>
                          <option value="AHG Inbound/Outbound">AHG Inbound/Outbound</option>
                          <option value="Bayshore Dental Studio">Bayshore Dental Studio</option>
                          <option value="AHG Auditor">AHG Auditor</option>
                          <option value="General Pool / Non-Voice">General Pool / Non-Voice</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-[10.5px] font-black text-slate-600 block mb-1">Sourcing Channel</label>
                        <select
                          value={formData.source}
                          onChange={e => setFormData({ ...formData, source: e.target.value as any })}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-bold text-slate-800 focus:outline-none focus:border-[#042C51] focus:bg-white"
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
                      </div>

                      <div>
                        <label className="text-[10.5px] font-black text-slate-600 block mb-1">Preferred SiBS Site</label>
                        <select
                          value={formData.preferredSite}
                          onChange={e => setFormData({ ...formData, preferredSite: e.target.value as any })}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-bold text-slate-800 focus:outline-none focus:border-[#042C51] focus:bg-white"
                        >
                          <option value="Tagum City">Tagum City Site (Main Hub)</option>
                          <option value="Davao City">Davao City Site</option>
                          <option value="Municipality of Mabini">Municipality of Mabini</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Notes & Remarks */}
                  <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-2">
                    <label className="text-xs font-black uppercase text-[#042C51] tracking-wider block">
                      Intake Notes & Background Remarks
                    </label>
                    <textarea
                      rows={3}
                      value={formData.notes}
                      onChange={e => setFormData({ ...formData, notes: e.target.value })}
                      placeholder="Enter specific applicant remarks, interview notes, or special requirements..."
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg font-medium text-xs text-slate-800 focus:outline-none focus:border-[#042C51] focus:bg-white"
                    ></textarea>
                  </div>

                  {/* Save Changes Footer */}
                  <div className="flex items-center justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={handleCancelEditing}
                      className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 bg-[#FF5C28] hover:bg-[#e04b1c] text-white font-black rounded-xl text-xs shadow-xs flex items-center gap-1.5"
                    >
                      <Check className="w-4 h-4" />
                      <span>Save & Log Changes</span>
                    </button>
                  </div>
                </form>
              ) : (
                /* READ-ONLY PROFILE PRESENTATION */
                <div className="space-y-4">
                  {/* Card 1: Key Contact Information & Quick Actions */}
                  <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs">
                    <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2.5">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-[#FF5C28]" />
                        <h3 className="text-xs font-black uppercase text-[#042C51] tracking-wider">
                          Personal & Contact Details
                        </h3>
                      </div>
                      <button
                        onClick={handleStartEditing}
                        className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
                      >
                        <Edit2 className="w-3 h-3" />
                        <span>Edit Details</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
                      {/* Full Name */}
                      <div className="bg-slate-50/80 p-3 rounded-xl border border-slate-200/60">
                        <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">
                          Full Name
                        </span>
                        <span className="text-sm font-black text-slate-900 mt-0.5 block">
                          {lead.fullName}
                        </span>
                      </div>

                      {/* Phone Number */}
                      <div className="bg-slate-50/80 p-3 rounded-xl border border-slate-200/60 flex items-center justify-between">
                        <div>
                          <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">
                            Phone Number
                          </span>
                          <span className="text-xs font-black text-slate-900 mt-0.5 block">
                            {lead.cpNum}
                          </span>
                        </div>
                        <button
                          onClick={() => copyToClipboard(lead.cpNum, "phone")}
                          className="p-1.5 hover:bg-slate-200 text-slate-500 rounded-lg transition-colors cursor-pointer"
                          title="Copy Phone"
                        >
                          {copiedField === "phone" ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>

                      {/* Email Address */}
                      <div className="bg-slate-50/80 p-3 rounded-xl border border-slate-200/60 flex items-center justify-between">
                        <div className="truncate pr-1">
                          <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">
                            Email Address
                          </span>
                          <span className="text-xs font-black text-slate-900 mt-0.5 block truncate">
                            {lead.email || "No email on record"}
                          </span>
                        </div>
                        {lead.email && (
                          <button
                            onClick={() => copyToClipboard(lead.email, "email")}
                            className="p-1.5 hover:bg-slate-200 text-slate-500 rounded-lg transition-colors cursor-pointer shrink-0"
                            title="Copy Email"
                          >
                            {copiedField === "email" ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Card 2: Job Placement & Sourcing Channel */}
                  <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs">
                    <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2.5">
                      <div className="flex items-center gap-2">
                        <Briefcase className="w-4 h-4 text-[#FF5C28]" />
                        <h3 className="text-xs font-black uppercase text-[#042C51] tracking-wider">
                          Job Placement & Sourcing Profile
                        </h3>
                      </div>
                      <span className="text-[10px] font-mono text-slate-400">
                        Lead ID: {lead.id}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60">
                        <span className="text-[10px] font-black uppercase text-slate-400 block">Department</span>
                        <span className="font-black text-slate-800 mt-0.5 block">{lead.department}</span>
                      </div>

                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60">
                        <span className="text-[10px] font-black uppercase text-slate-400 block">Account Fit / Client</span>
                        <span className="font-black text-[#FF5C28] mt-0.5 block">{lead.specificAccount || "CD - Collect"}</span>
                      </div>

                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60">
                        <span className="text-[10px] font-black uppercase text-slate-400 block">Lead Source</span>
                        <span className="font-black text-blue-700 mt-0.5 block">{lead.source}</span>
                      </div>

                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60">
                        <span className="text-[10px] font-black uppercase text-slate-400 block">Preferred Site</span>
                        <span className="font-black text-emerald-700 mt-0.5 block">{lead.preferredSite}</span>
                      </div>
                    </div>
                  </div>

                  {/* Card 3: Notes & Intake Remarks */}
                  <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                      <div className="flex items-center gap-2">
                        <MessageSquare className="w-4 h-4 text-[#FF5C28]" />
                        <h3 className="text-xs font-black uppercase text-[#042C51] tracking-wider">
                          Intake Notes & Screening Summary
                        </h3>
                      </div>
                    </div>

                    <div className="p-3.5 bg-amber-50/50 border border-amber-200/60 rounded-xl text-xs text-slate-700 font-medium leading-relaxed">
                      {lead.notes || "No initial intake notes recorded for this applicant lead."}
                    </div>
                  </div>

                  {/* Card 4: Intake Sourcing & Recruiter Audit */}
                  <div className="p-4 bg-slate-100/70 rounded-xl border border-slate-200 text-xs flex flex-wrap items-center justify-between gap-3 text-slate-600">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      <span>
                        Logged into HRIS by Recruiter Account: <strong className="text-slate-900 uppercase">{lead.inputtedBy}</strong>
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-[11px] font-mono text-slate-500">
                      <span>Date Logged: <strong>{lead.dateLogged}</strong></span>
                      {lead.lastContactDate && (
                        <>
                          <span>•</span>
                          <span>Last Activity: <strong>{lead.lastContactDate}</strong></span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: ACTIVITY & AUDIT HISTORY LOGS */}
          {activeTab === "history" && (
            <div className="space-y-5">
              {/* Add Note / Activity Log Composer */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-black text-[#042C51] uppercase tracking-wider">
                    <MessageSquare className="w-3.5 h-3.5 text-[#FF5C28]" />
                    <span>Record Activity Log / Candidate Interaction</span>
                  </div>
                  {!isAddingNote && (
                    <button
                      onClick={() => setIsAddingNote(true)}
                      className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-[#042C51] rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Add Log Entry</span>
                    </button>
                  )}
                </div>

                {isAddingNote && (
                  <form onSubmit={handleAddCustomNote} className="space-y-3 pt-1">
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                      <button
                        type="button"
                        onClick={() => setNewNoteType("note")}
                        className={`p-2 rounded-lg border text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                          newNoteType === "note"
                            ? "bg-slate-800 text-white border-slate-800"
                            : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                        }`}
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>General Note</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setNewNoteType("call")}
                        className={`p-2 rounded-lg border text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                          newNoteType === "call"
                            ? "bg-blue-600 text-white border-blue-600"
                            : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                        }`}
                      >
                        <PhoneCall className="w-3.5 h-3.5" />
                        <span>Phone Call</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setNewNoteType("sms")}
                        className={`p-2 rounded-lg border text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                          newNoteType === "sms"
                            ? "bg-purple-600 text-white border-purple-600"
                            : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                        }`}
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>SMS / Message</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setNewNoteType("contact")}
                        className={`p-2 rounded-lg border text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                          newNoteType === "contact"
                            ? "bg-emerald-600 text-white border-emerald-600"
                            : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                        }`}
                      >
                        <UserCheck className="w-3.5 h-3.5" />
                        <span>Screening</span>
                      </button>
                    </div>

                    <textarea
                      rows={2}
                      required
                      placeholder="Write interaction details, screening outcome, or recruiter observations..."
                      value={newNoteText}
                      onChange={e => setNewNoteText(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-medium text-xs text-slate-800 focus:outline-none focus:border-[#042C51] focus:bg-white"
                    ></textarea>

                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setIsAddingNote(false);
                          setNewNoteText("");
                        }}
                        className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-1 bg-[#042C51] hover:bg-[#FF5C28] text-white text-xs font-black rounded-lg shadow-2xs"
                      >
                        Save to History
                      </button>
                    </div>
                  </form>
                )}
              </div>

              {/* History Timeline */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs">
                <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-2.5">
                  <h3 className="text-xs font-black uppercase text-[#042C51] tracking-wider flex items-center gap-2">
                    <History className="w-4 h-4 text-[#FF5C28]" />
                    <span>Complete Chronological Audit Trail</span>
                  </h3>
                  <span className="text-[10.5px] font-bold text-slate-400">
                    {lead.history?.length || 0} recorded events
                  </span>
                </div>

                {!lead.history || lead.history.length === 0 ? (
                  <div className="py-8 text-center text-slate-400 text-xs font-medium">
                    No history events logged yet for this applicant lead.
                  </div>
                ) : (
                  <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                    {lead.history.map((hist, idx) => (
                      <div key={hist.id || idx} className="relative group">
                        {/* Event Bullet Icon */}
                        <div
                          className={`absolute -left-6 top-0.5 w-6 h-6 rounded-full border flex items-center justify-center shadow-2xs ${getHistoryBadgeBg(
                            hist.type
                          )}`}
                        >
                          {getHistoryIcon(hist.type)}
                        </div>

                        {/* Content Box */}
                        <div className="bg-slate-50/90 group-hover:bg-blue-50/50 transition-colors p-3 rounded-xl border border-slate-200/80 text-xs space-y-1">
                          <div className="flex flex-wrap items-center justify-between gap-1 text-[11px]">
                            <div className="flex items-center gap-1.5 font-bold text-slate-800">
                              <span className="font-mono text-slate-500">{hist.date}</span>
                              {hist.time && (
                                <span className="font-mono text-slate-400 text-[10px]">
                                  {hist.time}
                                </span>
                              )}
                            </div>

                            <span className="font-black text-[#042C51] text-[10.5px] uppercase bg-white px-2 py-0.5 rounded border border-slate-200/80">
                              {hist.user}
                            </span>
                          </div>

                          <p className="text-slate-700 font-medium leading-relaxed pt-0.5">
                            {hist.action}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* ==================== 4. MODAL FOOTER ==================== */}
        <div className="p-4 bg-[#F8FAFC] border-t border-slate-200 flex items-center justify-between text-xs shrink-0">
          <div className="text-[11px] text-slate-500 font-medium hidden sm:block">
            Lead Status: <strong className="text-slate-800">{lead.status}</strong>
          </div>

          <div className="flex items-center gap-2 ml-auto">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-all cursor-pointer"
            >
              Close
            </button>
            <button
              onClick={() => {
                onMoveToTalentPool(lead);
                onClose();
              }}
              className="px-4 py-2 bg-[#FF5C28] hover:bg-[#e04b1c] text-white font-black rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <ArrowRight className="w-3.5 h-3.5" />
              <span>Convert to Talent Pool</span>
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
