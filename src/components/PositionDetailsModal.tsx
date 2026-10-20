import React, { useState, useEffect } from "react";
import {
  Briefcase,
  X,
  Edit3,
  CheckCircle,
  XCircle,
  FileText,
  Building2,
  Sliders,
  Check,
  MapPin,
  Sparkles,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  AlignLeft,
  AlignCenter,
  AlignRight,
  List,
  ListOrdered,
  Link,
  ChevronDown,
  Save,
  RotateCcw,
  AlertTriangle
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export interface AvailablePositionRecord {
  id: string; // e.g. POS-001
  title: string;
  department: string;
  account: string;
  accountGhlName?: string;
  jdId?: string; // Database ID e.g. "JD-2026-001" or "JD-012"
  jdCode?: string; // Code e.g. "JD-012" or "JD-DEV-01"
  jdRoleTitle?: string; // e.g. "FOUNDATIONAL SKILLS TRAINER"
  documentTitle?: string; // e.g. "FST_Trainer_Blueprint_v1.2.pdf"
  isLinkedToJd: boolean;
  location: string;
  status: "Active" | "Inactive";
  approvalStatus: "Approved" | "For Approval" | "Rejected" | "Archived";
  skills: string[];
  description?: string;
  lastUpdated: string;
  updatedBy: string;
}

interface PositionDetailsModalProps {
  isOpen: boolean;
  position: AvailablePositionRecord | null;
  onClose: () => void;
  onApprove?: (pos: AvailablePositionRecord) => void;
  onReject?: (pos: AvailablePositionRecord) => void;
  onSave?: (updated: AvailablePositionRecord) => void;
  availableJDs?: Array<{
    id: string;
    code: string;
    roleTitle: string;
    documentTitle: string;
    department: string;
    account: string;
  }>;
}

export const SAMPLE_APPROVED_JDS = [
  {
    id: "JD-012",
    code: "JD-012",
    roleTitle: "FOUNDATIONAL SKILLS TRAINER",
    documentTitle: "JD_Foundational_Skills_Trainer_v2.0.pdf",
    department: "Training Management",
    account: "Foundation Skills Training"
  },
  {
    id: "JD-2026-001",
    code: "JD-CSR-TEL-04",
    roleTitle: "CUSTOMER SUPPORT SPECIALIST",
    documentTitle: "JD_Customer_Support_Specialist_v2.1.pdf",
    department: "Technical Support",
    account: "Verizon Tech"
  },
  {
    id: "JD-2026-002",
    code: "JD-MGR-TL-02",
    roleTitle: "TECHNICAL SUPPORT TEAM LEAD",
    documentTitle: "JD_Technical_Support_Lead_v1.0.pdf",
    department: "Operations",
    account: "Comcast Support"
  },
  {
    id: "JD-2026-003",
    code: "JD-DEV-01",
    roleTitle: "SOFTWARE MANAGEMENT – FULL STACK DEVELOPER",
    documentTitle: "JD_Software_Management_FullStack_v1.0.pdf",
    department: "IT (Information and Communications Technology)",
    account: "Software Management"
  },
  {
    id: "JD-2026-004",
    code: "JD-HC-CLM-03",
    roleTitle: "HEALTHCARE BILLING REPRESENTATIVE",
    documentTitle: "JD_Healthcare_Billing_Agent_v1.4.pdf",
    department: "Healthcare & Insurance",
    account: "UnitedHealth VIP"
  }
];

export default function PositionDetailsModal({
  isOpen,
  position,
  onClose,
  onApprove,
  onReject,
  onSave,
  availableJDs = SAMPLE_APPROVED_JDS
}: PositionDetailsModalProps) {
  const [isEditMode, setIsEditMode] = useState(false);

  // Form State
  const [selectedJdId, setSelectedJdId] = useState<string>("");
  const [jdIdField, setJdIdField] = useState<string>("");
  const [jdCodeField, setJdCodeField] = useState<string>("");
  const [positionTitleField, setPositionTitleField] = useState<string>("");
  const [documentTitleField, setDocumentTitleField] = useState<string>("");
  const [departmentField, setDepartmentField] = useState<string>("");
  const [accountField, setAccountField] = useState<string>("");
  const [accountGhlNameField, setAccountGhlNameField] = useState<string>("");
  const [locationField, setLocationField] = useState<string>("Davao Site");
  const [statusField, setStatusField] = useState<"Active" | "Inactive">("Active");
  const [approvalStatusField, setApprovalStatusField] = useState<"Approved" | "For Approval" | "Rejected" | "Archived">("Approved");
  const [descriptionField, setDescriptionField] = useState<string>("");
  const [skillsField, setSkillsField] = useState<string>("");

  useEffect(() => {
    if (position) {
      setIsEditMode(false);
      setSelectedJdId(position.jdId || "");
      setJdIdField(position.jdId || "");
      setJdCodeField(position.jdCode || "");
      setPositionTitleField(position.title || "");
      setDocumentTitleField(position.documentTitle || "");
      setDepartmentField(position.department || "IT (Information and Communications Technology)");
      setAccountField(position.account || "Software Management");
      setAccountGhlNameField(position.accountGhlName || "");
      setLocationField(position.location || "Davao Site");
      setStatusField(position.status || "Active");
      setApprovalStatusField(position.approvalStatus || "Approved");
      setDescriptionField(
        position.description ||
          "Responsible for end-to-end operational deliverables, system alignment, and adhering to organizational SLA standards."
      );
      setSkillsField(position.skills?.join(", ") || "");
    }
  }, [position, isOpen]);

  // When selecting a JD from dropdown
  const handleJdSelect = (jdIdVal: string) => {
    setSelectedJdId(jdIdVal);
    if (!jdIdVal) {
      setJdIdField("");
      setJdCodeField("");
      setDocumentTitleField("");
      return;
    }

    const matchedJD = availableJDs.find((j) => j.id === jdIdVal);
    if (matchedJD) {
      setJdIdField(matchedJD.id);
      setJdCodeField(matchedJD.code);
      setDocumentTitleField(matchedJD.documentTitle);
      if (!positionTitleField || positionTitleField.trim() === "") {
        setPositionTitleField(matchedJD.roleTitle);
      }
      setDepartmentField(matchedJD.department);
      setAccountField(matchedJD.account);
    }
  };

  if (!isOpen || !position) return null;

  const handleSave = () => {
    if (!onSave) return;
    const isLinked = !!(jdIdField && jdIdField.trim() !== "");
    const updated: AvailablePositionRecord = {
      ...position,
      title: positionTitleField,
      department: departmentField,
      account: accountField,
      accountGhlName: accountGhlNameField,
      jdId: jdIdField || undefined,
      jdCode: jdCodeField || undefined,
      jdRoleTitle: isLinked ? availableJDs.find(j => j.id === jdIdField)?.roleTitle || positionTitleField : undefined,
      documentTitle: documentTitleField || undefined,
      isLinkedToJd: isLinked,
      location: locationField,
      status: statusField,
      approvalStatus: approvalStatusField,
      description: descriptionField,
      skills: skillsField.split(",").map(s => s.trim()).filter(Boolean),
      lastUpdated: "August 19, 2026",
      updatedBy: "6496"
    };

    onSave(updated);
    setIsEditMode(false);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#042C51]/80 backdrop-blur-sm overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 12 }}
          transition={{ duration: 0.2 }}
          className="bg-[#F8FAFC] rounded-2xl max-w-5xl w-full shadow-2xl border border-slate-200 my-8 overflow-hidden text-[#101828]"
        >
          {/* ==================== MODAL HEADER ==================== */}
          <div className="bg-[#042C51] text-white p-5 sm:p-6 flex items-center justify-between gap-4 border-b border-[#063866]">
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="w-12 h-12 rounded-2xl bg-[#03203C] border border-blue-900/60 text-[#FF5C28] flex items-center justify-center shrink-0 shadow-inner">
                <Briefcase className="w-6 h-6" />
              </div>
              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-3 py-1 rounded-full bg-[#FF5C28] text-white text-[10px] font-black uppercase tracking-wider">
                    POSITION DICTIONARY
                  </span>
                  <span className="px-3 py-1 rounded-full bg-[#02182D] text-white border border-blue-900/80 text-[10px] font-black uppercase tracking-wider">
                    {isEditMode ? "EDIT MODE" : "VIEW MODE"}
                  </span>
                  {position.approvalStatus === "For Approval" && (
                    <span className="px-3 py-1 rounded-full bg-[#382B00] text-[#FFC700] border border-[#8C6D00]/50 text-[10px] font-bold">
                      Pending HR Approval
                    </span>
                  )}
                </div>
                <h2 className="text-lg sm:text-xl font-black text-white tracking-tight truncate">
                  Available Position Details
                </h2>
                <p className="text-xs text-blue-200/80 font-normal truncate hidden sm:block">
                  Review the linked Job Description, organizational mapping, and applicant visibility settings.
                </p>
              </div>
            </div>

            {/* Top-Right Actions */}
            <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
              {!isEditMode && position.approvalStatus === "For Approval" ? (
                <>
                  {onApprove && (
                    <button
                      type="button"
                      onClick={() => onApprove(position)}
                      className="px-4 py-2 rounded-full bg-[#00B074] hover:bg-[#009E67] text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all cursor-pointer whitespace-nowrap"
                    >
                      <CheckCircle className="w-4 h-4 text-white" />
                      <span>Approve</span>
                    </button>
                  )}
                  {onReject && (
                    <button
                      type="button"
                      onClick={() => onReject(position)}
                      className="px-4 py-2 rounded-full bg-[#FF004E] hover:bg-[#E00045] text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all cursor-pointer whitespace-nowrap"
                    >
                      <XCircle className="w-4 h-4 text-white" />
                      <span>Reject</span>
                    </button>
                  )}
                </>
              ) : !isEditMode ? (
                <button
                  type="button"
                  onClick={() => setIsEditMode(true)}
                  className="px-4 py-2 rounded-full bg-[#FF5C28] hover:bg-[#E04817] text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all cursor-pointer whitespace-nowrap"
                >
                  <Edit3 className="w-4 h-4" />
                  <span>Edit Position</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSave}
                  className="px-5 py-2 rounded-full bg-[#00B074] hover:bg-[#009E67] text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all cursor-pointer whitespace-nowrap"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Changes</span>
                </button>
              )}

              <button
                type="button"
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all cursor-pointer ml-0.5 shrink-0"
                title="Close modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* ==================== MODAL BODY ==================== */}
          <div className="p-5 sm:p-6 space-y-5 max-h-[74vh] overflow-y-auto">
            {/* ==================== SECTION 1: APPROVED JD LINK ==================== */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs space-y-4">
              <div className="flex items-start gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-orange-50 text-[#FF5C28] flex items-center justify-center shrink-0 mt-0.5">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-black text-[#042C51] uppercase tracking-wide">
                    APPROVED JD LINK
                  </h3>
                  <p className="text-xs text-slate-500">
                    Select an approved Job Description and retain its canonical document identifiers.
                  </p>
                </div>
              </div>

              {/* Select Job Description */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                  SELECT JOB DESCRIPTION <span className="text-red-500">*</span>
                </label>
                {isEditMode ? (
                  <div className="relative">
                    <select
                      value={selectedJdId}
                      onChange={(e) => handleJdSelect(e.target.value)}
                      className="w-full px-4 py-2.5 bg-[#EEF2F6] border border-slate-200/80 rounded-xl text-xs font-medium text-slate-700 focus:bg-white focus:border-[#042C51] outline-none transition-all appearance-none cursor-pointer"
                    >
                      <option value="">-- None / Unlinked from Job Description --</option>
                      {availableJDs.map((jd) => (
                        <option key={jd.id} value={jd.id}>
                          {jd.roleTitle} ({jd.code} • {jd.department})
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="w-4 h-4 text-slate-500 absolute right-3.5 top-3 pointer-events-none" />
                  </div>
                ) : (
                  <div className="w-full px-4 py-2.5 bg-[#EEF2F6] border border-slate-200/80 rounded-xl text-xs font-medium text-slate-600 flex items-center justify-between">
                    <span>
                      {position.jdRoleTitle || (position.jdId ? availableJDs.find(j => j.id === position.jdId)?.roleTitle : "SOFTWARE MANAGEMENT – FULL STACK DEVELOPER") || "SOFTWARE MANAGEMENT – FULL STACK DEVELOPER"}
                    </span>
                    <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                  </div>
                )}
              </div>

              {/* 3-Column: JD ID, JD Code, Position Title */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    JD ID
                  </label>
                  <input
                    type="text"
                    disabled={!isEditMode}
                    value={jdIdField}
                    onChange={(e) => setJdIdField(e.target.value)}
                    placeholder="Approved JD database ID"
                    className="w-full px-4 py-2.5 bg-[#EEF2F6] border border-slate-200/80 rounded-xl text-xs font-medium text-slate-600 disabled:opacity-90 focus:bg-white focus:border-[#042C51] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    JD Code
                  </label>
                  <input
                    type="text"
                    disabled={!isEditMode}
                    value={jdCodeField}
                    onChange={(e) => setJdCodeField(e.target.value)}
                    placeholder="Approved JD code"
                    className="w-full px-4 py-2.5 bg-[#EEF2F6] border border-slate-200/80 rounded-xl text-xs font-medium text-slate-600 disabled:opacity-90 focus:bg-white focus:border-[#042C51] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Position Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    disabled={!isEditMode}
                    value={positionTitleField}
                    onChange={(e) => setPositionTitleField(e.target.value)}
                    placeholder="Position Title"
                    className="w-full px-4 py-2.5 bg-[#EEF2F6] border border-slate-200/80 rounded-xl text-xs font-medium text-slate-800 disabled:opacity-90 focus:bg-white focus:border-[#042C51] outline-none"
                  />
                </div>
              </div>

              {/* Document Title */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Document Title
                </label>
                <input
                  type="text"
                  disabled={!isEditMode}
                  value={documentTitleField}
                  onChange={(e) => setDocumentTitleField(e.target.value)}
                  placeholder="Approved JD document title"
                  className="w-full px-4 py-2.5 bg-[#EEF2F6] border border-slate-200/80 rounded-xl text-xs font-medium text-slate-600 disabled:opacity-90 focus:bg-white focus:border-[#042C51] outline-none"
                />
              </div>
            </div>

            {/* ==================== SECTION 2: ORGANIZATIONAL MAPPING ==================== */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs space-y-4">
              <div className="flex items-start gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-orange-50 text-[#FF5C28] flex items-center justify-center shrink-0 mt-0.5">
                  <Building2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-black text-[#042C51] uppercase tracking-wide">
                    ORGANIZATIONAL MAPPING
                  </h3>
                  <p className="text-xs text-slate-500">
                    Map the position to a database department, account, and applicant-facing site.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* Department */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    DEPARTMENT <span className="text-red-500">*</span>
                  </label>
                  {isEditMode ? (
                    <div className="relative">
                      <select
                        value={departmentField}
                        onChange={(e) => setDepartmentField(e.target.value)}
                        className="w-full px-4 py-2.5 bg-[#EEF2F6] border border-slate-200/80 rounded-xl text-xs font-medium text-slate-700 focus:bg-white focus:border-[#042C51] outline-none appearance-none cursor-pointer"
                      >
                        <option value="IT (Information and Communications Technology)">IT (Information and Communications Technology)</option>
                        <option value="Training Management">Training Management</option>
                        <option value="Technical Support">Technical Support</option>
                        <option value="Operations">Operations</option>
                        <option value="Healthcare & Insurance">Healthcare & Insurance</option>
                        <option value="Financial Services Group">Financial Services Group</option>
                        <option value="Retail & E-Commerce">Retail & E-Commerce</option>
                      </select>
                      <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-3 pointer-events-none" />
                    </div>
                  ) : (
                    <div className="w-full px-4 py-2.5 bg-[#EEF2F6] border border-slate-200/80 rounded-xl text-xs font-medium text-slate-600 flex items-center justify-between">
                      <span>{departmentField || "IT (Information and Communications Technology)"}</span>
                      <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                    </div>
                  )}
                </div>

                {/* Account */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    ACCOUNT <span className="text-red-500">*</span>
                  </label>
                  {isEditMode ? (
                    <input
                      type="text"
                      value={accountField}
                      onChange={(e) => setAccountField(e.target.value)}
                      placeholder="e.g. Software Management"
                      className="w-full px-4 py-2.5 bg-[#EEF2F6] border border-slate-200/80 rounded-xl text-xs font-medium text-slate-700 focus:bg-white focus:border-[#042C51] outline-none"
                    />
                  ) : (
                    <div className="w-full px-4 py-2.5 bg-[#EEF2F6] border border-slate-200/80 rounded-xl text-xs font-medium text-slate-600 flex items-center justify-between">
                      <span>{accountField || "Software Management"}</span>
                      <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* Account GHL Name */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Account GHL Name
                  </label>
                  <input
                    type="text"
                    disabled={!isEditMode}
                    value={accountGhlNameField}
                    onChange={(e) => setAccountGhlNameField(e.target.value)}
                    placeholder="Account GHL name"
                    className="w-full px-4 py-2.5 bg-[#EEF2F6] border border-slate-200/80 rounded-xl text-xs font-medium text-slate-600 disabled:opacity-90 focus:bg-white focus:border-[#042C51] outline-none"
                  />
                </div>

                {/* Location / Site */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    LOCATION / SITE <span className="text-red-500">*</span>
                  </label>
                  {isEditMode ? (
                    <div className="relative">
                      <select
                        value={locationField}
                        onChange={(e) => setLocationField(e.target.value)}
                        className="w-full px-4 py-2.5 bg-[#EEF2F6] border border-slate-200/80 rounded-xl text-xs font-medium text-slate-700 focus:bg-white focus:border-[#042C51] outline-none appearance-none cursor-pointer"
                      >
                        <option value="Davao Site">Davao Site</option>
                        <option value="Tagum Site">Tagum Site</option>
                        <option value="Municipality of Mabini">Municipality of Mabini</option>
                      </select>
                      <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-3 pointer-events-none" />
                    </div>
                  ) : (
                    <div className="w-full px-4 py-2.5 bg-[#EEF2F6] border border-slate-200/80 rounded-xl text-xs font-medium text-slate-600 flex items-center justify-between">
                      <span>{locationField || "Davao Site"}</span>
                      <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* ==================== SECTION 3: POSITION INFORMATION ==================== */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs space-y-4">
              <div className="flex items-start gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-orange-50 text-[#FF5C28] flex items-center justify-center shrink-0 mt-0.5">
                  <Sliders className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-black text-[#042C51] uppercase tracking-wide">
                    POSITION INFORMATION
                  </h3>
                  <p className="text-xs text-slate-500">
                    Maintain the role description, searchable skills, status, and internal remarks.
                  </p>
                </div>
              </div>

              {/* Description & Rich Text Toolbar */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Description
                </label>

                {/* Toolbar preview */}
                <div className="border border-slate-200 rounded-xl overflow-hidden bg-slate-50">
                  <div className="flex items-center gap-1 p-2 bg-slate-100/80 border-b border-slate-200 text-slate-600 flex-wrap">
                    <button type="button" className="p-1 rounded hover:bg-slate-200 text-slate-600 cursor-pointer">
                      <Bold className="w-3.5 h-3.5" />
                    </button>
                    <button type="button" className="p-1 rounded hover:bg-slate-200 text-slate-600 cursor-pointer">
                      <Italic className="w-3.5 h-3.5" />
                    </button>
                    <button type="button" className="p-1 rounded hover:bg-slate-200 text-slate-600 cursor-pointer">
                      <Underline className="w-3.5 h-3.5" />
                    </button>
                    <button type="button" className="p-1 rounded hover:bg-slate-200 text-slate-600 cursor-pointer">
                      <Strikethrough className="w-3.5 h-3.5" />
                    </button>
                    <div className="h-4 w-px bg-slate-300 mx-1" />
                    <button type="button" className="p-1 rounded hover:bg-slate-200 text-slate-600 cursor-pointer">
                      <AlignLeft className="w-3.5 h-3.5" />
                    </button>
                    <button type="button" className="p-1 rounded hover:bg-slate-200 text-slate-600 cursor-pointer">
                      <AlignCenter className="w-3.5 h-3.5" />
                    </button>
                    <button type="button" className="p-1 rounded hover:bg-slate-200 text-slate-600 cursor-pointer">
                      <AlignRight className="w-3.5 h-3.5" />
                    </button>
                    <div className="h-4 w-px bg-slate-300 mx-1" />
                    <button type="button" className="p-1 rounded hover:bg-slate-200 text-slate-600 cursor-pointer">
                      <List className="w-3.5 h-3.5" />
                    </button>
                    <button type="button" className="p-1 rounded hover:bg-slate-200 text-slate-600 cursor-pointer">
                      <ListOrdered className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <textarea
                    rows={4}
                    disabled={!isEditMode}
                    value={descriptionField}
                    onChange={(e) => setDescriptionField(e.target.value)}
                    placeholder="Enter thorough position overview, core competencies, and duties..."
                    className="w-full p-3 bg-white text-xs font-normal text-slate-700 disabled:opacity-80 focus:outline-none resize-none leading-relaxed"
                  />
                </div>
              </div>

              {/* Skills Tags */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Required Competencies & Searchable Skills (Comma-separated)
                </label>
                <input
                  type="text"
                  disabled={!isEditMode}
                  value={skillsField}
                  onChange={(e) => setSkillsField(e.target.value)}
                  placeholder="e.g. React, TypeScript, Node.js, SQL, REST APIs"
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 disabled:opacity-80 focus:bg-white focus:border-[#042C51] outline-none"
                />
              </div>

              {/* Status & Approval Status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Operational Status
                  </label>
                  {isEditMode ? (
                    <select
                      value={statusField}
                      onChange={(e) => setStatusField(e.target.value as any)}
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:bg-white focus:border-[#042C51] outline-none"
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  ) : (
                    <div className="px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700">
                      {statusField}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Approval State
                  </label>
                  {isEditMode ? (
                    <select
                      value={approvalStatusField}
                      onChange={(e) => setApprovalStatusField(e.target.value as any)}
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:bg-white focus:border-[#042C51] outline-none"
                    >
                      <option value="Approved">Approved</option>
                      <option value="For Approval">For Approval</option>
                      <option value="Rejected">Rejected</option>
                      <option value="Archived">Archived</option>
                    </select>
                  ) : (
                    <div className="px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700">
                      {approvalStatusField}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* ==================== MODAL FOOTER ==================== */}
          <div className="p-4 sm:p-5 bg-white border-t border-slate-200 flex items-center justify-between gap-3 shrink-0">
            <span className="text-xs text-slate-500">
              Position ID: <strong className="text-[#042C51]">{position.id}</strong> • Last Updated: <strong className="text-[#042C51]">{position.lastUpdated}</strong>
            </span>

            <div className="flex items-center gap-2">
              {isEditMode ? (
                <>
                  <button
                    type="button"
                    onClick={() => setIsEditMode(false)}
                    className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-xl text-xs font-bold transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSave}
                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 shadow-sm"
                  >
                    <Save className="w-4 h-4" />
                    <span>Save Changes</span>
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2 bg-slate-100 hover:bg-[#042C51] hover:text-white text-[#042C51] border border-slate-200 rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  Close
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
