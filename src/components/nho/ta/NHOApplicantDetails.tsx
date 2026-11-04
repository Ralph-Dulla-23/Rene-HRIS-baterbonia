import React, { useEffect, useRef, useState } from "react";
import { useNHO } from "../NHOContext";
import { NHOApplicant, NHODocumentItem } from "../nhoTypes";
import { 
  CheckCircle, 
  AlertTriangle, 
  Clock, 
  Calendar, 
  FileText, 
  Layers, 
  User, 
  ShieldCheck, 
  Server, 
  ExternalLink,
  ChevronLeft,
  RotateCcw,
  Sparkles,
  UserX,
  Phone,
  Eye,
  FileCheck,
  Mail,
  Key,
  X
} from "lucide-react";
import NHOSendCredentialsModal from "./NHOSendCredentialsModal";

interface NHOApplicantDetailsProps {
  applicant: NHOApplicant;
  onClose: () => void;
  onOpenAttendance: () => void;
  onOpenEndorsement: () => void;
  onOpenDocVerification: (doc: any) => void;
  initialTab?: string;
}

export default function NHOApplicantDetails({
  applicant,
  onClose,
  onOpenAttendance,
  onOpenEndorsement,
  onOpenDocVerification,
  initialTab = "overview"
}: NHOApplicantDetailsProps) {
  const { withdrawApplicant, checkITEndorsementEligibility, showToast } = useNHO();
  const [activeTab, setActiveTab] = useState(initialTab);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawReason, setWithdrawReason] = useState("");
  const [isSendCredentialsOpen, setIsSendCredentialsOpen] = useState(false);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();
    return () => { document.body.style.overflow = previousOverflow; };
  }, []);

  const initials = applicant.fullName.trim().split(/\s+/).slice(0, 2).map(part => part[0]).join("").toUpperCase();

  const { isEligible, checks } = checkITEndorsementEligibility(applicant);

  const handleWithdraw = () => {
    if (!withdrawReason.trim()) {
      showToast("Please provide a reason for withdrawal.", "error");
      return;
    }
    withdrawApplicant(applicant.id, withdrawReason);
    setShowWithdrawModal(false);
  };

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/65 p-3 backdrop-blur-[2px] sm:p-6"
      onMouseDown={event => { if (event.target === event.currentTarget) onClose(); }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-label={`NHO applicant profile: ${applicant.fullName}`}
        className="flex h-[min(92dvh,920px)] w-full max-w-[1190px] flex-col overflow-hidden rounded-2xl border border-[#CED8E3] bg-white shadow-2xl"
      >
        <div className="h-[3px] shrink-0 bg-[#FF5C28]" />
        <header className="flex shrink-0 flex-wrap items-center justify-between gap-3 bg-[#042C51] px-4 py-4 text-white sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/20 bg-white/10 text-sm font-extrabold text-white">
              {initials}
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-base font-extrabold tracking-tight text-white sm:text-lg">{applicant.fullName}</h2>
                <span className="rounded-md border border-white/15 bg-white/10 px-2 py-0.5 font-mono text-[10px] font-semibold text-slate-100">
                  {applicant.applicantNumber}
                </span>
                <span className={`rounded-md px-2 py-0.5 text-[10px] font-bold ${applicant.outcome === "Withdrawn" ? "bg-red-100 text-red-800" : applicant.outcome === "Completed Handoff" ? "bg-emerald-100 text-emerald-800" : "bg-blue-100 text-blue-800"}`}>
                  {applicant.outcome}
                </span>
              </div>
              <p className="mt-1 text-[11px] text-blue-100/90">
                {applicant.position} <span className="mx-1 text-blue-200">•</span> {applicant.department} ({applicant.account})
                <span className="mx-1 text-blue-200">•</span> NHO: {applicant.scheduledNhoDate}
              </p>
            </div>
          </div>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-white/80 transition-colors hover:bg-white/15 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            aria-label="Close NHO applicant profile"
            title="Close profile"
          >
            <X className="h-5 w-5" />
          </button>
        </header>

        {/* Keep existing NHO workflow actions inside the applicant profile. */}
        {applicant.outcome === "In Progress" && (
          <div className="flex shrink-0 flex-wrap items-center gap-2 border-b border-[#E6ECF2] bg-[#F7F9FC] px-4 py-2.5 sm:px-6">
            <button type="button" onClick={() => setIsSendCredentialsOpen(true)} className="inline-flex items-center gap-1.5 rounded-lg bg-[#FF5C28] px-3 py-2 text-[11px] font-bold text-white hover:bg-[#e04f20]">
              <Mail className="h-3.5 w-3.5" /> Send Access Link &amp; Credentials
            </button>
            <button type="button" onClick={onOpenAttendance} className="rounded-lg border border-[#BECBDA] bg-white px-3 py-2 text-[11px] font-semibold text-[#042C51] hover:bg-slate-100">
              Update Attendance / Majors
            </button>
            {isEligible && !applicant.itEndorsed && (
              <button type="button" onClick={onOpenEndorsement} className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-2 text-[11px] font-bold text-white hover:bg-emerald-700">
                <Sparkles className="h-3.5 w-3.5" /> Endorse to IT
              </button>
            )}
            <button type="button" onClick={() => setShowWithdrawModal(true)} className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-white px-3 py-2 text-[11px] font-semibold text-red-700 hover:bg-red-50">
              <UserX className="h-3.5 w-3.5" /> Withdraw Candidate
            </button>
          </div>
        )}

      {/* Tabs */}
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-white">
        <nav aria-label="Applicant profile details" className="flex shrink-0 items-center gap-1 overflow-x-auto border-b border-[#E6ECF2] px-3 text-xs sm:px-5">
          {[
            { id: "overview", label: "Overview" },
            { id: "majors", label: `Major Requirements (${applicant.documents.filter(d => d.isMajor && d.status === "Verified").length}/4)` },
            { id: "orientation", label: `Orientation (${applicant.orientationStatus})` },
            { id: "agreements", label: `Essential Agreements (${applicant.documents.filter(d => d.isEssentialAgreement && d.status === "Verified").length}/3)` },
            { id: "documents", label: "Other Documents & 14-Day Deadline" },
            { id: "history", label: `Activity History (${applicant.auditLogs.length})` }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-3 px-3 font-bold border-b-2 transition-colors cursor-pointer shrink-0 ${
                activeTab === tab.id
                  ? "border-[#FF5C28] text-[#042C51]"
                  : "border-transparent text-slate-500 hover:text-[#042C51]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-6">
          {/* TAB 1: OVERVIEW */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              {/* Status summary banner */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="p-4 rounded-xl bg-[#F7F9FC] border border-[#E6ECF2]">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    NHO Attendance
                  </span>
                  <div className="text-base font-bold text-[#042C51] mt-1">
                    {applicant.attendance}
                  </div>
                  <span className="text-[11px] text-slate-500">
                    Scheduled: {applicant.scheduledNhoDate}
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-[#F7F9FC] border border-[#E6ECF2]">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Physical Clearance
                  </span>
                  <div className={`text-base font-bold mt-1 ${
                    applicant.physicalClearance === "Cleared" ? "text-green-600" : "text-amber-600"
                  }`}>
                    {applicant.physicalClearance}
                  </div>
                  <span className="text-[11px] text-slate-500">
                    {applicant.clearedDate ? `Cleared on ${applicant.clearedDate}` : "4 Majors Incomplete"}
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-[#F7F9FC] border border-[#E6ECF2]">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Temporary Portal Access
                  </span>
                  <div className={`text-base font-bold mt-1 ${
                    applicant.tempAccessStatus === "Active" ? "text-blue-600" : "text-slate-500"
                  }`}>
                    {applicant.tempAccessStatus}
                  </div>
                  <span className="text-[11px] text-slate-500 block">
                    {applicant.hasChangedPassword ? "Password Activated" : "Awaiting First Login"}
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-[#F7F9FC] border border-[#E6ECF2]">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    14-Day Non-Major Deadline
                  </span>
                  <div className="text-base font-bold text-[#042C51] mt-1">
                    {applicant.nonMajorDeadlineDate || "Not Started"}
                  </div>
                  <span className="text-[11px] text-slate-500">
                    {applicant.nonMajorDeadlineDate ? "Calculated from clearance" : "Awaiting physical clearance"}
                  </span>
                </div>
              </div>

              {/* Endorsement Checklist Snapshot */}
              <div className="border border-[#E6ECF2] rounded-xl p-4 bg-white space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-[#042C51]" />
                    <h3 className="text-xs font-bold text-[#042C51] uppercase tracking-wider">
                      IT Endorsement Mandatory 9-Point Readiness Checklist
                    </h3>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                    isEligible ? "bg-green-100 text-green-800" : "bg-amber-100 text-amber-800"
                  }`}>
                    {isEligible ? "All 9 Passed — Ready to Endorse" : "Pending Mandatory Criteria"}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                  {checks.map((chk, i) => (
                    <div key={i} className={`p-2 rounded-lg border flex items-center justify-between ${
                      chk.passed ? "bg-green-50/50 border-green-200 text-green-950" : "bg-slate-50 border-slate-200 text-slate-600"
                    }`}>
                      <span className="text-[11px] font-semibold">{chk.label}</span>
                      {chk.passed ? (
                        <CheckCircle className="w-3.5 h-3.5 text-green-600 shrink-0" />
                      ) : (
                        <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Personal & Appointment Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="p-4 rounded-xl border border-[#E6ECF2] space-y-2">
                  <h4 className="font-bold text-[#042C51] uppercase tracking-wider text-[11px]">
                    Candidate Record Information
                  </h4>
                  <div className="space-y-1.5 text-slate-700">
                    <div><strong>Registered Email:</strong> {applicant.email}</div>
                    <div><strong>Mobile Number:</strong> {applicant.phone}</div>
                    <div><strong>Reporting Location:</strong> {applicant.reportingLocation}</div>
                    <div><strong>Cluster & Account:</strong> {applicant.cluster} — {applicant.account}</div>
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-[#E6ECF2] space-y-2">
                  <h4 className="font-bold text-[#042C51] uppercase tracking-wider text-[11px]">
                    NHO Administrative Milestones
                  </h4>
                  <div className="space-y-1.5 text-slate-700">
                    <div><strong>Invitation Sent:</strong> {applicant.invitationSentDate} (7+ days notice validated)</div>
                    <div><strong>Kronos ID:</strong> {applicant.officialKronosId || "Not provisioned yet"}</div>
                    <div><strong>WFM Seat:</strong> {applicant.wfmStatus === "Assigned" ? `${applicant.wfmProductionWing} — Seat ${applicant.wfmSeatNumber}` : (applicant.wfmStatus || "Pending")}</div>
                    <div><strong>Handoff Status:</strong> {applicant.handoffStatus}</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: MAJOR REQUIREMENTS */}
          {activeTab === "majors" && (
            <div className="space-y-4">
              <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-950 flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <strong>Post-NHO Major Requirements Workflow:</strong> After applicant attends NHO (marked Show), they upload their 4 major requirements via their personal portal. TA audits and verifies each submission below or via the consolidated Document Verification queue.
                </div>
              </div>

              <div className="space-y-3">
                {[
                  { code: "MAJOR-MED-01", name: "1. Medical Records / Fit to Work Certificate", desc: "Diagnostic medical clearance issued by accredited clinic." },
                  { code: "MAJOR-NBI-02", name: "2. NBI Clearance (Original / Valid)", desc: "Official National Bureau of Investigation clearance certificate." },
                  { code: "MAJOR-PSA-03", name: "3. PSA Birth Certificate", desc: "Philippine Statistics Authority (PSA) issued Birth Certificate." },
                  { code: "MAJOR-ID-04", name: "4. Valid Government ID", desc: "Passport, UMID, PhilID / National ID, or Driver's License." }
                ].map(item => {
                  const doc: NHODocumentItem = applicant.documents.find(d => d.templateCode === item.code) || {
                    id: `doc-${item.code}`,
                    name: item.name,
                    category: "Major" as const,
                    isMajor: true,
                    isEssentialAgreement: false,
                    status: "Not Submitted" as const,
                    deadlineStatus: "On Time" as const,
                    dueDate: applicant.scheduledNhoDate,
                    templateCode: item.code,
                    documentOwner: "TA" as const
                  };
                  const isVer = doc?.status === "Verified";
                  const isPending = doc?.status === "For Verification";
                  const isNeedsCorr = doc?.status === "Needs Correction";

                  return (
                    <div key={item.code} className="p-4 rounded-xl border border-[#E6ECF2] bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-[#042C51] text-xs">{item.name}</span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            isVer
                              ? "bg-green-100 text-green-800"
                              : isPending
                                ? "bg-blue-100 text-blue-800"
                                : isNeedsCorr
                                  ? "bg-red-100 text-red-800"
                                  : "bg-slate-100 text-slate-600"
                          }`}>
                            {doc.status}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500">{item.desc}</p>
                        {doc.fileName && (
                          <div className="text-[11px] text-slate-600 font-mono">
                            File: {doc.fileName} {doc.fileSize ? `(${doc.fileSize})` : ""} • Submitted: {doc.submittedDate || "Session"}
                          </div>
                        )}
                        {doc.verifiedBy && (
                          <span className="text-[10px] text-green-700 font-medium block">
                            Verified on {doc.verifiedDate} by {doc.verifiedBy}
                          </span>
                        )}
                        {doc.correctionRemarks && (
                          <span className="text-[10px] text-red-600 font-medium block">
                            Correction Note: {doc.correctionRemarks}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {doc.fileName && (
                          <button
                            onClick={() => onOpenDocVerification(doc)}
                            className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs cursor-pointer flex items-center gap-1"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Preview</span>
                          </button>
                        )}
                        {!isVer && doc.status !== "Not Submitted" && (
                          <button
                            onClick={() => onOpenDocVerification(doc)}
                            className="px-3 py-1.5 rounded-lg bg-green-600 hover:bg-green-700 text-white font-bold text-xs shadow-xs cursor-pointer flex items-center gap-1"
                          >
                            <CheckCircle className="w-3.5 h-3.5" />
                            <span>Verify / Return</span>
                          </button>
                        )}
                        {isVer && (
                          <span className="text-green-700 font-bold text-xs flex items-center gap-1 bg-green-50 px-2.5 py-1 rounded-lg border border-green-200">
                            <CheckCircle className="w-3.5 h-3.5 text-green-600" />
                            <span>Verified</span>
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: ORIENTATION */}
          {activeTab === "orientation" && (
            <div className="space-y-4 text-xs">
              <div className="p-4 rounded-xl border border-[#E6ECF2] bg-[#F7F9FC] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#042C51] text-xs uppercase tracking-wider">
                    Orientation Status: <strong className={applicant.orientationStatus === "Completed" ? "text-green-600" : "text-amber-600"}>{applicant.orientationStatus}</strong>
                  </span>
                  {applicant.orientationCompletedAt && (
                    <span className="text-slate-500 text-[11px]">
                      Completed: {applicant.orientationCompletedAt}
                    </span>
                  )}
                </div>

                <div>
                  <span className="text-slate-600 font-semibold block mb-1">
                    Slides Reviewed ({applicant.orientationSlidesViewed.length}/7):
                  </span>
                  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                    <div 
                      className="bg-[#FF5C28] h-full transition-all duration-300"
                      style={{ width: `${(applicant.orientationSlidesViewed.length / 7) * 100}%` }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 pt-2">
                  <div className="bg-white p-3 rounded-lg border border-[#E6ECF2]">
                    <span className="text-slate-400 text-[10px] block">Quiz Questions</span>
                    <span className="font-bold text-slate-800 text-xs">
                      {Object.keys(applicant.orientationQuizAnswers || {}).length}/5 Answered
                    </span>
                  </div>
                  <div className="bg-white p-3 rounded-lg border border-[#E6ECF2]">
                    <span className="text-slate-400 text-[10px] block">Quiz Score</span>
                    <span className={`font-bold text-xs ${
                      applicant.orientationQuizPassed ? "text-emerald-700" : applicant.orientationStatus === "Completed" ? "text-emerald-700" : "text-amber-700"
                    }`}>
                      {applicant.orientationQuizScore !== undefined
                        ? `${applicant.orientationQuizScore}/${applicant.orientationQuizTotal ?? 5} (${applicant.orientationQuizPercentage ?? 100}%)`
                        : applicant.orientationStatus === "Completed" ? "5/5 (100%)" : "In Progress"}
                    </span>
                  </div>
                  <div className="bg-white p-3 rounded-lg border border-[#E6ECF2]">
                    <span className="text-slate-400 text-[10px] block">Policy Acknowledgment</span>
                    <span className={`font-bold text-xs ${applicant.orientationAcknowledged ? "text-green-600" : "text-slate-400"}`}>
                      {applicant.orientationAcknowledged ? "Signed & Confirmed" : "Pending Signature"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: ESSENTIAL AGREEMENTS */}
          {activeTab === "agreements" && (
            <div className="space-y-3 text-xs">
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-blue-950">
                <strong>Three Mandatory Essential Agreements:</strong> Required before IT Endorsement. The candidate signs each separately (drawn electronic signature or manual upload).
              </div>

              {[
                { code: "AGR-POL-01", name: "1. Acceptance to Company Policy" },
                { code: "AGR-BOND-02", name: "2. Memo 01.2022 and Training Bond (NHO)" },
                { code: "AGR-NDA-03", name: "3. New NDA (Non-Disclosure Agreement)" }
              ].map(ag => {
                const doc = applicant.documents.find(d => d.templateCode === ag.code);
                const isVer = doc?.status === "Verified";

                return (
                  <div key={ag.code} className="p-4 rounded-xl border border-[#E6ECF2] bg-white flex items-center justify-between gap-3">
                    <div>
                      <span className="font-bold text-[#042C51] text-xs block">{ag.name}</span>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        {doc?.submissionMethod ? `Submitted via ${doc.submissionMethod}` : "Not submitted yet"}
                        {doc?.fileName ? ` • ${doc.fileName}` : ""}
                      </div>
                      {doc?.correctionRemarks && (
                        <span className="text-[10px] text-red-600 font-medium block mt-1">
                          Correction Remarks: {doc.correctionRemarks}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                        isVer
                          ? "bg-green-100 text-green-800"
                          : doc?.status === "For Verification"
                            ? "bg-blue-100 text-blue-800"
                            : doc?.status === "Needs Correction"
                              ? "bg-red-100 text-red-800"
                              : "bg-slate-100 text-slate-600"
                      }`}>
                        {doc?.status || "Not Submitted"}
                      </span>

                      {doc && (
                        <button
                          onClick={() => onOpenDocVerification(doc)}
                          className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[11px] cursor-pointer flex items-center gap-1"
                        >
                          <Eye className="w-3 h-3" />
                          <span>Review</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* TAB 5: OTHER DOCUMENTS & 14-DAY DEADLINE */}
          {activeTab === "documents" && (
            <div className="space-y-4 text-xs">
              <div className="p-4 rounded-xl border border-[#E6ECF2] bg-[#F7F9FC] flex flex-wrap items-center justify-between gap-3">
                <div>
                  <span className="font-bold text-[#042C51] text-xs uppercase tracking-wider block">
                    Standard 14-Calendar-Day Non-Major Deadline
                  </span>
                  <p className="text-[11px] text-slate-500">
                    Calculated strictly 14 days from successfully completed physical NHO clearance.
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-[#042C51]">
                    {applicant.nonMajorDeadlineDate || "Not Established"}
                  </div>
                  <span className="text-[10px] text-slate-400">
                    {applicant.clearedDate ? `Cleared: ${applicant.clearedDate}` : "Awaiting Clearance"}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                {applicant.documents.filter(d => !d.isMajor && !d.isEssentialAgreement).map(d => (
                  <div key={d.id} className="p-3 bg-white border border-[#E6ECF2] rounded-xl flex items-center justify-between gap-3">
                    <div>
                      <span className="font-bold text-[#042C51] text-xs block">{d.name}</span>
                      <span className="text-[11px] text-slate-500">{d.category} • Due: {d.dueDate}</span>
                      {d.fileName && (
                        <span className="text-[10px] text-slate-400 block">File: {d.fileName}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        d.status === "Verified"
                          ? "bg-green-100 text-green-800"
                          : d.deadlineStatus === "Overdue"
                            ? "bg-red-100 text-red-800"
                            : "bg-slate-100 text-slate-600"
                      }`}>
                        {d.status} ({d.deadlineStatus})
                      </span>

                      <button
                        onClick={() => onOpenDocVerification(d)}
                        className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 cursor-pointer"
                        title="Review Document"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 6: ACTIVITY HISTORY */}
          {activeTab === "history" && (
            <div className="space-y-3 text-xs">
              <span className="font-bold text-[#042C51] text-xs uppercase tracking-wider block">
                Audited NHO Workflow Timeline ({applicant.auditLogs.length} events)
              </span>

              <div className="space-y-2">
                {applicant.auditLogs.map(log => (
                  <div key={log.id} className="p-3 bg-white border border-[#E6ECF2] rounded-xl space-y-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-bold text-[#042C51]">{log.action}</span>
                      <span className="text-slate-400 font-mono text-[10px]">{log.timestamp}</span>
                    </div>
                    <p className="text-slate-600 leading-normal">{log.details}</p>
                    <div className="text-[10px] text-slate-400 pt-1">
                      Actor: <strong className="text-slate-600">{log.actor}</strong> ({log.role})
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      <footer className="flex shrink-0 items-center justify-between gap-2 border-t border-[#E6ECF2] bg-[#F7F9FC] px-4 py-3 sm:px-6">
        <span className="truncate text-[11px] font-medium text-slate-500">{applicant.applicantNumber} · {applicant.cluster}</span>
        <button type="button" onClick={onClose} className="rounded-lg bg-[#042C51] px-4 py-2 text-xs font-bold text-white hover:bg-[#0B365F]">Close Profile</button>
      </footer>
      </section>

      {/* Withdraw Modal */}
      {showWithdrawModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 text-xs">
            <h3 className="text-sm font-bold text-red-600 mb-2">Confirm Candidate Withdrawal</h3>
            <p className="text-slate-600 leading-relaxed mb-3">
              Closing this case as Withdrawn will immediately deactivate temporary NHO portal access and suspend pending IT endorsement activities. History will be preserved.
            </p>
            <textarea
              rows={3}
              value={withdrawReason}
              onChange={e => setWithdrawReason(e.target.value)}
              placeholder="Mandatory withdrawal reason (e.g. Candidate accepted another job offer, relocation)..."
              className="w-full p-2.5 border border-slate-300 rounded-xl mb-4 focus:outline-none"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowWithdrawModal(false)}
                className="px-3 py-1.5 rounded-xl text-slate-600 hover:bg-slate-100 border border-slate-200 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleWithdraw}
                className="px-4 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold cursor-pointer"
              >
                Confirm Withdrawal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Send Credentials Modal */}
      {isSendCredentialsOpen && (
        <NHOSendCredentialsModal
          applicant={applicant}
          isOpen={isSendCredentialsOpen}
          onClose={() => setIsSendCredentialsOpen(false)}
        />
      )}
    </div>
  );
}
