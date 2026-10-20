import React, { useState, useEffect } from "react";
import {
  X,
  Calendar,
  FileText,
  Upload,
  AlertTriangle,
  CheckCircle2,
  Info,
  Clock,
  Trash2,
  HelpCircle,
  ShieldAlert,
  ArrowRight
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import {
  ResignationRecord,
  ResignationType,
  ResignationReason,
  ResignationAttachment
} from "../types";

interface ResignationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (record: Partial<ResignationRecord>) => void;
  initialData?: ResignationRecord | null;
  mode?: "create" | "edit" | "extend" | "retract";
  employeeProfile?: {
    sibsId: string;
    employeeName: string;
    position: string;
    department: string;
    account: string;
    cluster: string;
  };
}

const PREDEFINED_REASONS: ResignationReason[] = [
  "Career Change / Advancement",
  "Health",
  "Greener Pasture",
  "Relocation",
  "Studies / School",
  "Family",
  "Grievance",
  "Personal - Transportation",
  "Other"
];

// Helper to get Asia/Manila date string YYYY-MM-DD
function getManilaDateString(dateObj: Date = new Date()): string {
  const manilaStr = dateObj.toLocaleDateString("en-CA", {
    timeZone: "Asia/Manila"
  });
  return manilaStr;
}

// Helper to add days to a YYYY-MM-DD string
function addDaysToDate(dateStr: string, days: number): string {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  d.setDate(d.getDate() + days);
  return d.toISOString().split("T")[0];
}

export default function ResignationModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  mode = "create",
  employeeProfile = {
    sibsId: "SIBS-8429",
    employeeName: "Alena Batacan",
    position: "Senior Operations Specialist",
    department: "Telecom & Tech Support",
    account: "Verizon Tech",
    cluster: "Telecom & Tech"
  }
}: ResignationModalProps) {
  // --- FORM STATES ---
  const [resignationType, setResignationType] = useState<ResignationType>("Formal");
  const [resignationDate, setResignationDate] = useState<string>(getManilaDateString());
  const [lastWorkingDate, setLastWorkingDate] = useState<string>(addDaysToDate(getManilaDateString(), 30));
  const [reason, setReason] = useState<ResignationReason | string>("Career Change / Advancement");
  const [otherReasonDetails, setOtherReasonDetails] = useState<string>("");
  const [remarks, setRemarks] = useState<string>("");
  const [attachments, setAttachments] = useState<ResignationAttachment[]>([]);
  
  // Extension & Retraction specific state
  const [extensionDate, setExtensionDate] = useState<string>("");
  const [extensionReason, setExtensionReason] = useState<string>("");
  const [retractionReason, setRetractionReason] = useState<string>("");

  // Immediate Policy Modal state
  const [showImmediatePolicyModal, setShowImmediatePolicyModal] = useState<boolean>(false);
  const [hasAcceptedImmediatePolicy, setHasAcceptedImmediatePolicy] = useState<boolean>(false);

  // Validation errors
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Populate data when modal opens or initialData/mode changes
  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setResignationType(initialData.type || "Formal");
        setResignationDate(initialData.resignationDate || getManilaDateString());
        setLastWorkingDate(initialData.lastWorkingDate || addDaysToDate(getManilaDateString(), 30));
        
        // Handle reason
        if (PREDEFINED_REASONS.includes(initialData.reason as ResignationReason)) {
          setReason(initialData.reason);
          setOtherReasonDetails("");
        } else {
          setReason("Other");
          setOtherReasonDetails(initialData.reason || initialData.otherReasonDetails || "");
        }
        
        setRemarks(initialData.remarks || "");
        setAttachments(initialData.attachments || []);
        setExtensionDate(initialData.lastWorkingDate ? addDaysToDate(initialData.lastWorkingDate, 15) : "");
        setExtensionReason("");
        setRetractionReason("");
        setHasAcceptedImmediatePolicy(initialData.type === "Immediate");
      } else {
        const todayStr = getManilaDateString();
        setResignationType("Formal");
        setResignationDate(todayStr);
        setLastWorkingDate(addDaysToDate(todayStr, 30));
        setReason("Career Change / Advancement");
        setOtherReasonDetails("");
        setRemarks("");
        setAttachments([
          {
            name: `Formal_Resignation_Letter_${employeeProfile.employeeName.replace(/\s+/g, "_")}.pdf`,
            size: "240 KB",
            type: "application/pdf"
          }
        ]);
        setExtensionDate("");
        setExtensionReason("");
        setRetractionReason("");
        setHasAcceptedImmediatePolicy(false);
      }
      setErrors({});
      setShowImmediatePolicyModal(false);
    }
  }, [isOpen, initialData, mode]);

  // Handle Type Change (Formal vs Immediate)
  const handleTypeChange = (newType: ResignationType) => {
    setResignationType(newType);
    if (newType === "Formal") {
      // Auto compute 30 days notice
      const computed = addDaysToDate(resignationDate, 30);
      setLastWorkingDate(computed);
      setHasAcceptedImmediatePolicy(false);
    } else if (newType === "Immediate") {
      if (!hasAcceptedImmediatePolicy) {
        setShowImmediatePolicyModal(true);
      }
      // Set default immediate date to 3 days from resignation date
      setLastWorkingDate(addDaysToDate(resignationDate, 3));
    }
  };

  // Handle Resignation Date change
  const handleResignationDateChange = (val: string) => {
    setResignationDate(val);
    if (resignationType === "Formal") {
      setLastWorkingDate(addDaysToDate(val, 30));
    }
  };

  // File Upload Handling
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const fileList = Array.from(e.target.files);
      const newAtts: ResignationAttachment[] = fileList.map((f: File) => ({
        name: f.name,
        size: `${(f.size / 1024).toFixed(0)} KB`,
        type: f.type
      }));
      setAttachments(prev => [...prev, ...newAtts]);
    }
  };

  const handleRemoveAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  // Validation
  const validate = (): boolean => {
    const errs: { [key: string]: string } = {};

    if (mode === "retract") {
      if (!retractionReason.trim()) {
        errs.retractionReason = "A mandatory explanation is required to request retraction.";
      }
      setErrors(errs);
      return Object.keys(errs).length === 0;
    }

    if (mode === "extend") {
      if (!extensionDate) {
        errs.extensionDate = "Please select a new extended last working date.";
      } else if (extensionDate <= lastWorkingDate) {
        errs.extensionDate = "Extension date must be later than the current last working date.";
      }
      if (!extensionReason.trim()) {
        errs.extensionReason = "Please provide a reason for extending your last working date.";
      }
      setErrors(errs);
      return Object.keys(errs).length === 0;
    }

    // Create or Edit mode
    if (reason === "Other" && !otherReasonDetails.trim()) {
      errs.otherReasonDetails = "Please specify details for 'Other' reason.";
    }

    if (!resignationDate) {
      errs.resignationDate = "Resignation date is required.";
    }

    if (!lastWorkingDate) {
      errs.lastWorkingDate = "Last working date is required.";
    } else if (lastWorkingDate < resignationDate) {
      errs.lastWorkingDate = "Last working date cannot be earlier than resignation date.";
    }

    if (resignationType === "Immediate" && !hasAcceptedImmediatePolicy) {
      errs.immediatePolicy = "You must accept the Immediate Resignation Policy to proceed.";
      setShowImmediatePolicyModal(true);
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    if (mode === "retract") {
      onSubmit({
        status: "Pending Approval",
        retractionReason: retractionReason,
        remarks: `[RETRACTION REQUESTED]: ${retractionReason}`
      });
      onClose();
      return;
    }

    if (mode === "extend") {
      onSubmit({
        lastWorkingDate: extensionDate,
        extensionReason: extensionReason,
        remarks: `${remarks}\n[EXTENSION REQUESTED to ${extensionDate}]: ${extensionReason}`
      });
      onClose();
      return;
    }

    const finalReason = reason === "Other" ? otherReasonDetails : reason;

    const payload: Partial<ResignationRecord> = {
      type: resignationType,
      resignationDate,
      lastWorkingDate,
      reason: finalReason,
      otherReasonDetails: reason === "Other" ? otherReasonDetails : "",
      remarks,
      attachments,
      status: "Pending Approval",
      sibsId: employeeProfile.sibsId,
      employeeName: employeeProfile.employeeName,
      position: employeeProfile.position,
      department: employeeProfile.department,
      account: employeeProfile.account,
      cluster: employeeProfile.cluster
    };

    onSubmit(payload);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-8"
      >
        {/* Modal Header */}
        <div className="bg-[#042C51] text-white p-5 flex items-center justify-between border-b border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#FF5C28] flex items-center justify-center text-white font-bold shadow-md">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold tracking-tight">
                {mode === "create" && "Employee Resignation Application"}
                {mode === "edit" && "Edit Resignation Details"}
                {mode === "extend" && "Extend Last Working Date"}
                {mode === "retract" && "Request Resignation Retraction"}
              </h2>
              <p className="text-xs text-slate-300">
                Asia/Manila Timezone Aligned • SiBS Official HR Workflow
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Employee Banner Summary */}
        <div className="bg-[#F8FAFC] px-6 py-3 border-b border-slate-200 flex flex-wrap items-center justify-between gap-4 text-xs font-semibold text-slate-700">
          <div className="flex items-center gap-2">
            <span className="bg-slate-200 text-slate-800 px-2 py-0.5 rounded font-mono text-[11px]">
              {employeeProfile.sibsId}
            </span>
            <span className="font-bold text-[#042C51] text-sm">
              {employeeProfile.employeeName}
            </span>
            <span className="text-slate-400">|</span>
            <span className="text-slate-600">{employeeProfile.position}</span>
          </div>
          <div className="text-slate-500 text-[11px] font-mono">
            {employeeProfile.department} • {employeeProfile.account}
          </div>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 text-slate-800 max-h-[75vh] overflow-y-auto">
          
          {/* RETRACTION MODE SPECIFIC VIEW */}
          {mode === "retract" && (
            <div className="space-y-4">
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3 text-xs text-amber-900">
                <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-sm mb-1">Resignation Retraction Request</h4>
                  <p className="leading-relaxed">
                    Submitting a retraction request will pause the active separation process pending formal review by your Team Leader and HR Admin. You must provide a valid reason below.
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
                  Mandatory Retraction Explanation <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={retractionReason}
                  onChange={e => setRetractionReason(e.target.value)}
                  rows={4}
                  placeholder="Explain why you wish to retract your resignation (e.g., resolved concerns, accepted retention package, personal circumstances change)..."
                  className="w-full p-3 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-[#042C51] focus:outline-none"
                />
                {errors.retractionReason && (
                  <p className="text-[11px] text-red-600 mt-1 font-semibold">{errors.retractionReason}</p>
                )}
              </div>
            </div>
          )}

          {/* EXTENSION MODE SPECIFIC VIEW */}
          {mode === "extend" && (
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl flex items-start gap-3 text-xs text-blue-900">
                <Clock className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-sm mb-1">Extend Last Working Date</h4>
                  <p className="leading-relaxed">
                    Current Last Working Date: <strong className="font-mono text-blue-800">{lastWorkingDate}</strong>. Select an extended date to allow additional time for knowledge transfer or project completion.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
                    Current Last Working Date
                  </label>
                  <input
                    type="date"
                    disabled
                    value={lastWorkingDate}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-100 font-mono text-xs text-slate-500 cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
                    New Extended Last Working Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={extensionDate}
                    onChange={e => setExtensionDate(e.target.value)}
                    min={addDaysToDate(lastWorkingDate, 1)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 font-mono text-xs focus:ring-2 focus:ring-[#042C51] focus:outline-none"
                  />
                  {errors.extensionDate && (
                    <p className="text-[11px] text-red-600 mt-1 font-semibold">{errors.extensionDate}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
                  Reason for Extension <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={extensionReason}
                  onChange={e => setExtensionReason(e.target.value)}
                  rows={3}
                  placeholder="State reason for extension (e.g. extending handover to assist team, completing pending client deliverables)..."
                  className="w-full p-3 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-[#042C51] focus:outline-none"
                />
                {errors.extensionReason && (
                  <p className="text-[11px] text-red-600 mt-1 font-semibold">{errors.extensionReason}</p>
                )}
              </div>
            </div>
          )}

          {/* CREATE / EDIT FORM FIELDS */}
          {(mode === "create" || mode === "edit") && (
            <>
              {/* 1. Resignation Type Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
                  Resignation Type <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => handleTypeChange("Formal")}
                    className={`p-3 rounded-xl border text-left transition-all flex items-start gap-3 ${
                      resignationType === "Formal"
                        ? "bg-teal-50/80 border-teal-600 text-teal-900 ring-2 ring-teal-600/20"
                        : "bg-white border-slate-200 hover:border-slate-300 text-slate-700"
                    }`}
                  >
                    <div className={`p-2 rounded-lg ${resignationType === "Formal" ? "bg-teal-600 text-white" : "bg-slate-100 text-slate-500"}`}>
                      <Calendar className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold text-xs">Formal Notice</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        Standard 30-Day Notice Period (Auto-computed)
                      </div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleTypeChange("Immediate")}
                    className={`p-3 rounded-xl border text-left transition-all flex items-start gap-3 ${
                      resignationType === "Immediate"
                        ? "bg-amber-50/80 border-amber-500 text-amber-900 ring-2 ring-amber-500/20"
                        : "bg-white border-slate-200 hover:border-slate-300 text-slate-700"
                    }`}
                  >
                    <div className={`p-2 rounded-lg ${resignationType === "Immediate" ? "bg-amber-500 text-white" : "bg-slate-100 text-slate-500"}`}>
                      <AlertTriangle className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold text-xs flex items-center gap-1">
                        Immediate Notice
                        <span className="text-[9px] bg-amber-200 text-amber-800 px-1.5 py-0.2 rounded font-mono font-bold">
                          &lt; 30 Days
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        Requires Policy Acknowledgment & HR Approval
                      </div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Immediate Policy Notice Banner if Immediate Selected */}
              {resignationType === "Immediate" && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-between gap-3 text-xs text-amber-900">
                  <div className="flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>
                      Immediate Resignation Policy Status:{" "}
                      <strong>{hasAcceptedImmediatePolicy ? "Accepted & Verified" : "Pending Acknowledgment"}</strong>
                    </span>
                  </div>
                  {!hasAcceptedImmediatePolicy && (
                    <button
                      type="button"
                      onClick={() => setShowImmediatePolicyModal(true)}
                      className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg text-[11px] transition-colors"
                    >
                      Review & Accept
                    </button>
                  )}
                </div>
              )}

              {/* 2. Date Pickers */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
                    Resignation Date <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      value={resignationDate}
                      onChange={e => handleResignationDateChange(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-mono focus:ring-2 focus:ring-[#042C51] focus:outline-none"
                    />
                  </div>
                  {errors.resignationDate && (
                    <p className="text-[11px] text-red-600 mt-1 font-semibold">{errors.resignationDate}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
                    Requested Last Working Date <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      value={lastWorkingDate}
                      onChange={e => setLastWorkingDate(e.target.value)}
                      disabled={resignationType === "Formal"}
                      className={`w-full p-2.5 rounded-xl border font-mono text-xs focus:ring-2 focus:ring-[#042C51] focus:outline-none ${
                        resignationType === "Formal"
                          ? "bg-slate-100 border-slate-200 text-slate-600 cursor-not-allowed"
                          : "border-slate-300 bg-white"
                      }`}
                    />
                  </div>
                  {resignationType === "Formal" && (
                    <p className="text-[10px] text-teal-700 font-semibold mt-1">
                      ✓ Automatically computed exactly +30 days from resignation date.
                    </p>
                  )}
                  {errors.lastWorkingDate && (
                    <p className="text-[11px] text-red-600 mt-1 font-semibold">{errors.lastWorkingDate}</p>
                  )}
                </div>
              </div>

              {/* 3. Reason Dropdown */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
                  Reason for Resignation <span className="text-red-500">*</span>
                </label>
                <select
                  value={reason}
                  onChange={e => setReason(e.target.value as ResignationReason)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-[#042C51] focus:outline-none bg-white"
                >
                  {PREDEFINED_REASONS.map(r => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>

              {/* Specify Other Reason Input */}
              {reason === "Other" && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="space-y-1"
                >
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
                    Specify Other Reason <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={otherReasonDetails}
                    onChange={e => setOtherReasonDetails(e.target.value)}
                    placeholder="Provide specific details regarding your reason..."
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-[#042C51] focus:outline-none"
                  />
                  {errors.otherReasonDetails && (
                    <p className="text-[11px] text-red-600 mt-1 font-semibold">{errors.otherReasonDetails}</p>
                  )}
                </motion.div>
              )}

              {/* 4. Remarks / Handover Notes */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
                  Remarks / Additional Notes <span className="text-slate-400 font-normal">(Optional)</span>
                </label>
                <textarea
                  value={remarks}
                  onChange={e => setRemarks(e.target.value)}
                  rows={3}
                  placeholder="Provide additional context, handover notes, or personal comments for HR..."
                  className="w-full p-3 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-[#042C51] focus:outline-none"
                />
              </div>

              {/* 5. File Attachment Dropzone */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
                  Upload Resignation Letter / Supporting Files
                </label>
                <div className="border-2 border-dashed border-slate-300 hover:border-[#042C51] rounded-2xl p-4 text-center bg-slate-50/50 transition-colors relative cursor-pointer group">
                  <input
                    type="file"
                    multiple
                    accept=".pdf,.docx,.doc,.jpg,.jpeg,.png"
                    onChange={handleFileUpload}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  />
                  <div className="flex flex-col items-center justify-center gap-1.5">
                    <div className="w-10 h-10 rounded-full bg-slate-100 group-hover:bg-[#E9F0FC] text-slate-500 group-hover:text-[#042C51] flex items-center justify-center transition-colors">
                      <Upload className="w-5 h-5" />
                    </div>
                    <p className="text-xs font-bold text-slate-700">
                      Drag & drop formal resignation letter or <span className="text-blue-600 underline">browse computer</span>
                    </p>
                    <p className="text-[10px] text-slate-400 font-mono">
                      Accepted formats: .pdf, .docx, .doc, .jpg, .png (Max 10MB)
                    </p>
                  </div>
                </div>

                {/* Uploaded Files List */}
                {attachments.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {attachments.map((att, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-2.5 bg-slate-100 border border-slate-200 rounded-xl text-xs"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <FileText className="w-4 h-4 text-blue-600 shrink-0" />
                          <span className="font-semibold text-slate-800 truncate">{att.name}</span>
                          {att.size && (
                            <span className="text-[10px] text-slate-500 font-mono bg-white px-1.5 py-0.5 rounded border">
                              {att.size}
                            </span>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveAttachment(idx)}
                          className="p-1 text-slate-400 hover:text-red-600 hover:bg-white rounded transition-colors"
                          title="Remove attachment"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}

          {/* Modal Actions Footer */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-[#FF5C28] hover:bg-[#e04b1a] text-white text-xs font-bold shadow-lg shadow-orange-500/20 flex items-center gap-2 transition-all"
            >
              <span>
                {mode === "create" && "Submit Resignation Application"}
                {mode === "edit" && "Save Changes"}
                {mode === "extend" && "Confirm Extension Request"}
                {mode === "retract" && "Confirm Retraction Request"}
              </span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      </motion.div>

      {/* IMMEDIATE RESIGNATION POLICY ACKNOWLEDGMENT MODAL POPUP */}
      <AnimatePresence>
        {showImmediatePolicyModal && (
          <div className="fixed inset-0 z-60 bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white max-w-md w-full rounded-2xl p-6 shadow-2xl border border-amber-300 space-y-4"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center font-bold shrink-0">
                  <ShieldAlert className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900">
                    Immediate Resignation Policy
                  </h3>
                  <p className="text-[11px] text-amber-700 font-semibold">
                    Notice Period is Less than 30 Days
                  </p>
                </div>
              </div>

              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 space-y-2 leading-relaxed">
                <p>
                  In accordance with company labor standards, a standard notice of <strong>30 calendar days</strong> is required for orderly transition.
                </p>
                <p>
                  By submitting an <strong>Immediate Resignation</strong> (under 30 days):
                </p>
                <ul className="list-disc pl-4 space-y-1 text-[11px]">
                  <li>Your request requires explicit Operations Manager & HR Admin approval.</li>
                  <li>Unserved notice days may affect clearance processing timeline or final pay computation.</li>
                  <li>You agree to submit required medical or personal supporting documents if requested.</li>
                </ul>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowImmediatePolicyModal(false);
                    setResignationType("Formal");
                    setLastWorkingDate(addDaysToDate(resignationDate, 30));
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-bold border border-slate-300 text-slate-600 hover:bg-slate-100"
                >
                  Switch to Formal 30-Day Notice
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setHasAcceptedImmediatePolicy(true);
                    setShowImmediatePolicyModal(false);
                  }}
                  className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-md"
                >
                  I Understand & Accept Policy
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
