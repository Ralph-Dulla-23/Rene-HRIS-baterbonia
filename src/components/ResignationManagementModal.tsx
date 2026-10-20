import React, { useState, useEffect } from "react";
import {
  X,
  User,
  Building2,
  Calendar,
  Clock,
  FileText,
  Download,
  Eye,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Edit2,
  Paperclip,
  ShieldAlert,
  ArrowRight,
  MessageSquare
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { ResignationRecord, ResignationStatus } from "../types";

interface ResignationManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  record: ResignationRecord | null;
  onApprove: (recordId: string, updatedLastWorkingDate?: string, hrNotes?: string) => void;
  onDecline: (recordId: string, rejectionReason: string) => void;
  onUpdateDate: (recordId: string, newLastWorkingDate: string, hrNotes?: string) => void;
}

export default function ResignationManagementModal({
  isOpen,
  onClose,
  record,
  onApprove,
  onDecline,
  onUpdateDate
}: ResignationManagementModalProps) {
  // Action mode inside modal
  const [activeWorkflow, setActiveWorkflow] = useState<"view" | "approve" | "decline" | "editDate">("view");

  // Form states
  const [customLastWorkingDate, setCustomLastWorkingDate] = useState<string>("");
  const [rejectionReason, setRejectionReason] = useState<string>("");
  const [hrNotes, setHrNotes] = useState<string>("");
  const [previewAttachment, setPreviewAttachment] = useState<{ name: string; url?: string } | null>(null);

  useEffect(() => {
    if (isOpen && record) {
      setActiveWorkflow("view");
      setCustomLastWorkingDate(record.lastWorkingDate);
      setRejectionReason(record.rejectionReason || "");
      setHrNotes(record.hrNotes || "");
      setPreviewAttachment(null);
    }
  }, [isOpen, record]);

  if (!isOpen || !record) return null;

  const handleConfirmApprove = () => {
    onApprove(record.id, customLastWorkingDate, hrNotes);
    onClose();
  };

  const handleConfirmDecline = () => {
    if (!rejectionReason.trim()) return;
    onDecline(record.id, rejectionReason);
    onClose();
  };

  const handleConfirmUpdateDate = () => {
    if (!customLastWorkingDate) return;
    onUpdateDate(record.id, customLastWorkingDate, hrNotes);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-8"
      >
        {/* Modal Top Header */}
        <div className="bg-[#042C51] text-white p-5 flex items-center justify-between border-b border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold shadow-md">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] bg-blue-900/80 text-blue-200 px-2 py-0.5 rounded font-mono font-bold">
                  {record.id}
                </span>
                <span className="text-xs text-slate-300">Resignation Management Workflow</span>
              </div>
              <h2 className="text-lg font-bold tracking-tight">Review Employee Separation Request</h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 1. EMPLOYEE PROFILE HEADER */}
        <div className="bg-[#F8FAFC] p-6 border-b border-slate-200">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[#042C51] text-white flex items-center justify-center font-black text-lg shadow-sm">
                {record.employeeName.charAt(0)}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-black text-[#042C51]">{record.employeeName}</h3>
                  <span className="bg-slate-200 text-slate-800 px-2 py-0.5 rounded font-mono text-[11px] font-bold">
                    {record.sibsId}
                  </span>
                </div>
                <p className="text-xs font-bold text-slate-600 mt-0.5">{record.position}</p>
                <div className="flex flex-wrap items-center gap-2 mt-2 text-xs text-slate-500 font-medium">
                  <span className="flex items-center gap-1">
                    <Building2 className="w-3.5 h-3.5 text-slate-400" />
                    {record.department}
                  </span>
                  <span>•</span>
                  <span>Account: <strong>{record.account}</strong></span>
                  <span>•</span>
                  <span>Cluster: <strong>{record.cluster}</strong></span>
                </div>
              </div>
            </div>

            {/* Current Status Badge */}
            <div className="flex flex-col md:items-end gap-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                Current Status
              </span>
              <span
                className={`px-3 py-1 rounded-full text-xs font-black shadow-sm ${
                  record.status === "Pending Approval"
                    ? "bg-amber-100 text-amber-900 border border-amber-200"
                    : record.status === "Notice Period" || record.status === "Approved"
                    ? "bg-teal-100 text-teal-900 border border-teal-200"
                    : record.status === "Completed"
                    ? "bg-emerald-100 text-emerald-900 border border-emerald-200"
                    : "bg-red-100 text-red-900 border border-red-200"
                }`}
              >
                {record.status}
              </span>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6 max-h-[65vh] overflow-y-auto text-slate-800">
          
          {/* 2. RESIGNATION DETAILS SUMMARY */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block mb-1">
                Resignation Type
              </span>
              <span
                className={`px-2.5 py-0.5 rounded font-bold inline-block text-[11px] ${
                  record.type === "Formal"
                    ? "bg-teal-100 text-teal-900 border border-teal-200"
                    : "bg-amber-100 text-amber-900 border border-amber-200"
                }`}
              >
                {record.type} Notice ({record.type === "Formal" ? "30 Days" : "Immediate"})
              </span>
            </div>

            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block mb-1">
                Submission Date
              </span>
              <span className="font-mono font-bold text-slate-800">{record.submissionDate}</span>
            </div>

            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block mb-1">
                Requested Last Working Date
              </span>
              <span className="font-mono font-black text-blue-900 text-sm">
                {record.lastWorkingDate}
              </span>
            </div>
          </div>

          {/* Reason & Remarks */}
          <div className="space-y-3">
            <div>
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">
                Reason for Separation
              </h4>
              <p className="text-sm font-bold text-slate-800 bg-white p-3 rounded-xl border border-slate-200">
                {record.reason}
                {record.otherReasonDetails && (
                  <span className="block text-xs font-normal text-slate-600 mt-1">
                    Details: {record.otherReasonDetails}
                  </span>
                )}
              </p>
            </div>

            {record.remarks && (
              <div>
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">
                  Employee Remarks / Handover Notes
                </h4>
                <p className="text-xs text-slate-700 bg-white p-3 rounded-xl border border-slate-200 leading-relaxed">
                  {record.remarks}
                </p>
              </div>
            )}
          </div>

          {/* 3. ATTACHMENT PREVIEW & DOWNLOAD */}
          <div>
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2 flex items-center gap-1.5">
              <Paperclip className="w-4 h-4 text-slate-400" />
              <span>Resignation Attachment(s)</span>
            </h4>

            {record.attachments && record.attachments.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {record.attachments.map((att, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between gap-3 shadow-xs hover:border-slate-300 transition-all"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-800 truncate">{att.name}</p>
                        <p className="text-[10px] text-slate-400 font-mono">{att.size || "Doc File"}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => setPreviewAttachment(att)}
                        className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[10px] font-bold flex items-center gap-1"
                        title="Preview attachment"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Preview</span>
                      </button>
                      <a
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          alert(`Simulated Download: Downloading ${att.name}`);
                        }}
                        className="p-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-[10px] font-bold flex items-center gap-1"
                        title="Download attachment"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-400 italic">
                No physical file attached to this resignation.
              </div>
            )}
          </div>

          {/* Attachment Preview Modal Box */}
          {previewAttachment && (
            <div className="p-4 bg-slate-900 text-white rounded-2xl space-y-2 relative border border-slate-700">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-xs font-bold text-teal-400 flex items-center gap-1.5">
                  <FileText className="w-4 h-4" /> Previewing: {previewAttachment.name}
                </span>
                <button
                  type="button"
                  onClick={() => setPreviewAttachment(null)}
                  className="text-slate-400 hover:text-white text-xs font-bold"
                >
                  Close Preview
                </button>
              </div>
              <div className="p-6 bg-slate-950 rounded-xl font-mono text-xs text-slate-300 leading-relaxed border border-slate-800">
                <p className="font-bold text-white mb-2">OFFICIAL RESIGNATION LETTER</p>
                <p className="text-slate-400 mb-2">To: Human Resources & Operations Management</p>
                <p>
                  Please accept this document as formal notification that I am resigning from my position as {record.position} at SiBS Solutions ({record.account}). My requested last working date is {record.lastWorkingDate}.
                </p>
                <p className="mt-2 text-teal-400 italic">
                  [Verified Attachment Content Rendering]
                </p>
              </div>
            </div>
          )}

          {/* HR / MANAGER ACTION WORKFLOW SECTIONS */}
          
          {/* DECLINE WORKFLOW FORM */}
          {activeWorkflow === "decline" && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-2xl space-y-3">
              <div className="flex items-center gap-2 text-red-900 font-bold text-xs">
                <XCircle className="w-4 h-4 text-red-600" />
                <span>Decline Resignation Request</span>
              </div>
              <div>
                <label className="block text-xs font-bold text-red-900 uppercase tracking-wide mb-1">
                  Explicit Rejection Reason <span className="text-red-600">*</span>
                </label>
                <textarea
                  value={rejectionReason}
                  onChange={e => setRejectionReason(e.target.value)}
                  rows={3}
                  placeholder="State the explicit reasons for declining this resignation (e.g. counter-offer accepted, notice period non-compliant)..."
                  className="w-full p-2.5 bg-white border border-red-300 rounded-xl text-xs focus:ring-2 focus:ring-red-500 focus:outline-none"
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setActiveWorkflow("view")}
                  className="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-700 text-xs font-bold bg-white"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDecline}
                  disabled={!rejectionReason.trim()}
                  className="px-4 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white text-xs font-bold shadow"
                >
                  Confirm Recline / Reject
                </button>
              </div>
            </div>
          )}

          {/* APPROVE / UPDATE DATE WORKFLOW FORM */}
          {(activeWorkflow === "approve" || activeWorkflow === "editDate") && (
            <div className="p-4 bg-teal-50 border border-teal-200 rounded-2xl space-y-3">
              <div className="flex items-center gap-2 text-teal-900 font-bold text-xs">
                <CheckCircle2 className="w-4 h-4 text-teal-600" />
                <span>
                  {activeWorkflow === "approve" ? "Approve Resignation & Set Effective Date" : "Adjust / Extend Last Working Date"}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-teal-900 uppercase tracking-wide mb-1">
                    Confirmed Last Working Date
                  </label>
                  <input
                    type="date"
                    value={customLastWorkingDate}
                    onChange={e => setCustomLastWorkingDate(e.target.value)}
                    className="w-full p-2 bg-white border border-teal-300 rounded-xl font-mono text-xs text-slate-900 font-bold focus:ring-2 focus:ring-teal-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-teal-900 uppercase tracking-wide mb-1">
                    HR / Manager Notes <span className="text-slate-400 font-normal">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    value={hrNotes}
                    onChange={e => setHrNotes(e.target.value)}
                    placeholder="Clearance instructions, exit interview schedule..."
                    className="w-full p-2 bg-white border border-teal-300 rounded-xl text-xs focus:ring-2 focus:ring-teal-600 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setActiveWorkflow("view")}
                  className="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-700 text-xs font-bold bg-white"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={activeWorkflow === "approve" ? handleConfirmApprove : handleConfirmUpdateDate}
                  className="px-5 py-1.5 rounded-lg bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold shadow flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{activeWorkflow === "approve" ? "Confirm Approval" : "Save Updated Date"}</span>
                </button>
              </div>
            </div>
          )}

        </div>

        {/* Modal Bottom Actions Bar */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-100"
          >
            Close
          </button>

          {activeWorkflow === "view" && (
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setActiveWorkflow("editDate")}
                className="px-3.5 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 text-xs font-bold flex items-center gap-1.5 transition-colors"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>Update / Extend Date</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveWorkflow("decline")}
                className="px-3.5 py-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-800 border border-red-200 text-xs font-bold flex items-center gap-1.5 transition-colors"
              >
                <XCircle className="w-3.5 h-3.5" />
                <span>Decline Request</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveWorkflow("approve")}
                className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-md shadow-teal-600/20 flex items-center gap-1.5 transition-all"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Approve Resignation</span>
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
