import React, { useState } from "react";
import { useNHO } from "../NHOContext";
import { NHODocumentItem } from "../nhoTypes";
import NHOSignatureModal from "./NHOSignatureModal";
import NHOOrientationViewer from "./NHOOrientationViewer";
import { 
  UserCheck, 
  Calendar, 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  FileText, 
  PenTool, 
  Upload, 
  Lock, 
  Key, 
  Sparkles, 
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Check,
  RotateCcw,
  FileCheck2,
  AlertCircle
} from "lucide-react";

interface NHOApplicantPortalProps {
  subTab?: string;
  onSubTabChange?: (tab: string) => void;
}

export default function NHOApplicantPortal({ subTab = "overview", onSubTabChange }: NHOApplicantPortalProps) {
  const { 
    activeApplicant, 
    submitOtherDocument, 
    simulatePasswordRetrieval, 
    simulateLinkExpiration,
    recoverRetrievalLink,
    applicantChangePassword, 
    simulateFirstRegularLogin,
    showToast 
  } = useNHO();

  const [activeSubTab, setActiveSubTab] = useState(subTab);

  // Signature modal state
  const [signingDoc, setSigningDoc] = useState<NHODocumentItem | null>(null);

  // Password change state
  const [newPasswordInput, setNewPasswordInput] = useState("");
  const [showPasswordChangeModal, setShowPasswordChangeModal] = useState(false);

  // Sync internal subtab with props
  const currentTab = onSubTabChange ? subTab : activeSubTab;
  const setTab = onSubTabChange ? onSubTabChange : setActiveSubTab;

  // File upload simulation handler
  const handleUploadFile = (doc: NHODocumentItem, e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const sizeStr = `${(file.size / 1024).toFixed(1)} KB`;
      submitOtherDocument(activeApplicant.id, doc.id, file.name, sizeStr);
    }
  };

  const handlePasswordChangeSubmit = () => {
    if (newPasswordInput.length < 8) {
      showToast("Password must be at least 8 characters.", "error");
      return;
    }
    applicantChangePassword(activeApplicant.id, newPasswordInput);
    setShowPasswordChangeModal(false);
    setNewPasswordInput("");
  };

  const majorDocs = activeApplicant.documents.filter(d => d.isMajor);
  const agreements = activeApplicant.documents.filter(d => d.isEssentialAgreement);
  const nonMajorDocs = activeApplicant.documents.filter(d => !d.isMajor && !d.isEssentialAgreement);

  const verifiedMajorsCount = majorDocs.filter(d => d.status === "Verified").length;
  const verifiedAgreementsCount = agreements.filter(d => d.status === "Verified").length;

  return (
    <div className="space-y-6">
      {/* Overview Tab */}
      {currentTab === "overview" && (
        <div className="space-y-6">
          {/* Welcome Card */}
          <div className="bg-gradient-to-r from-[#042C51] to-[#0B365F] text-white rounded-2xl p-6 sm:p-8 shadow-xs relative overflow-hidden">
            <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-white/5 transform skew-x-12 pointer-events-none" />
            <div className="max-w-2xl space-y-2 relative z-10">
              <span className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-[#FF5C28] text-white">
                Applicant Orientation Portal
              </span>
              <h1 className="text-xl sm:text-2xl font-black tracking-tight">
                Welcome, {activeApplicant.firstName}!
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
                Congratulations on your appointment as <strong>{activeApplicant.position}</strong> at SiBS. Complete your post-NHO onboarding tasks below: upload your 4 major requirements, complete interactive orientation, and execute your agreements.
              </p>
            </div>
          </div>

          {/* Quick Status Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 text-xs">
            {/* NHO Attendance */}
            <div className="p-4 bg-white rounded-xl border border-[#E6ECF2] shadow-xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                NHO Attendance
              </span>
              <div className={`text-base font-bold mt-1 ${
                activeApplicant.attendance === "Show" ? "text-green-600" : "text-amber-600"
              }`}>
                {activeApplicant.attendance}
              </div>
              <span className="text-[11px] text-slate-500">
                {activeApplicant.scheduledNhoDate}
              </span>
            </div>

            {/* 4 Major Requirements */}
            <div className="p-4 bg-white rounded-xl border border-[#E6ECF2] shadow-xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                4 Major Requirements
              </span>
              <div className={`text-base font-bold mt-1 ${
                verifiedMajorsCount === 4 ? "text-green-600" : "text-[#042C51]"
              }`}>
                {verifiedMajorsCount} of 4 Verified
              </div>
              <span className="text-[11px] text-slate-500">
                Self-Service Portal Uploads
              </span>
            </div>

            {/* Orientation */}
            <div className="p-4 bg-white rounded-xl border border-[#E6ECF2] shadow-xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                SiBS Orientation
              </span>
              <div className={`text-base font-bold mt-1 ${
                activeApplicant.orientationStatus === "Completed" ? "text-green-600" : "text-blue-600"
              }`}>
                {activeApplicant.orientationStatus}
              </div>
              <span className="text-[11px] text-slate-500">
                {activeApplicant.orientationAcknowledged ? "7 Slides & Quiz Done" : "Slides in progress"}
              </span>
            </div>

            {/* Essential Agreements */}
            <div className="p-4 bg-white rounded-xl border border-[#E6ECF2] shadow-xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                3 Essential Agreements
              </span>
              <div className={`text-base font-bold mt-1 ${
                verifiedAgreementsCount === 3 ? "text-green-600" : "text-[#042C51]"
              }`}>
                {verifiedAgreementsCount} of 3 Verified
              </div>
              <span className="text-[11px] text-slate-500">
                Required before IT Endorsement
              </span>
            </div>

            {/* Non-Major Deadline */}
            <div className="p-4 bg-white rounded-xl border border-[#E6ECF2] shadow-xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Non-Major 14-Day Due Date
              </span>
              <div className="text-base font-bold text-[#042C51] mt-1">
                {activeApplicant.nonMajorDeadlineDate || "Not Started"}
              </div>
              <span className="text-[11px] text-slate-500">
                14 days from NHO session
              </span>
            </div>
          </div>

          {/* Action Grid: Major Requirements, Orientation & Agreements */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* 1. Major Requirements shortcut */}
            <div className="p-6 bg-white rounded-2xl border border-[#E6ECF2] shadow-xs flex flex-col justify-between space-y-4">
              <div>
                <span className="text-[10px] font-bold text-[#FF5C28] uppercase tracking-wider block">
                  Mandatory Major Requirements
                </span>
                <h3 className="text-base font-bold text-[#042C51] mt-1">
                  Upload 4 Major Documents
                </h3>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Upload your Medical Records (Fit to Work), NBI Clearance, PSA Birth Certificate, and Valid Government ID for TA verification.
                </p>
              </div>

              <button
                onClick={() => setTab("majors")}
                className="w-full py-2.5 rounded-xl bg-[#FF5C28] hover:bg-[#e04f20] text-white font-bold text-xs shadow-xs cursor-pointer flex items-center justify-center gap-2"
              >
                <span>{verifiedMajorsCount === 4 ? "Review Uploaded Majors" : "Upload Major Requirements"}</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* 2. Orientation shortcut */}
            <div className="p-6 bg-white rounded-2xl border border-[#E6ECF2] shadow-xs flex flex-col justify-between space-y-4">
              <div>
                <span className="text-[10px] font-bold text-[#042C51] uppercase tracking-wider block">
                  Interactive Learning
                </span>
                <h3 className="text-base font-bold text-[#042C51] mt-1">
                  SiBS Orientation Modules
                </h3>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Review the 7 onboarding modules covering company policies, clean screen rules, and HR contacts, followed by the 5-question knowledge check.
                </p>
              </div>

              <button
                onClick={() => setTab("orientation")}
                className="w-full py-2.5 rounded-xl bg-[#042C51] hover:bg-[#0B365F] text-white font-bold text-xs shadow-xs cursor-pointer flex items-center justify-center gap-2"
              >
                <span>{activeApplicant.orientationStatus === "Completed" ? "Review Orientation Modules" : "Continue Orientation"}</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* 3. Essential Agreements shortcut */}
            <div className="p-6 bg-white rounded-2xl border border-[#E6ECF2] shadow-xs flex flex-col justify-between space-y-4">
              <div>
                <span className="text-[10px] font-bold text-[#042C51] uppercase tracking-wider block">
                  Employment Covenants
                </span>
                <h3 className="text-base font-bold text-[#042C51] mt-1">
                  3 Essential Agreements
                </h3>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Sign Company Policy Acceptance, Training Bond, and NDA using the electronic drawn signature canvas or upload signed copies.
                </p>
              </div>

              <button
                onClick={() => setTab("agreements")}
                className="w-full py-2.5 rounded-xl bg-[#042C51] hover:bg-[#0B365F] text-white font-bold text-xs shadow-xs cursor-pointer flex items-center justify-center gap-2"
              >
                <span>Review & Sign Agreements</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Major Requirements Tab (Section 4 of user requirements) */}
      {currentTab === "majors" && (
        <div className="space-y-4 text-xs">
          <div className="p-5 bg-white rounded-2xl border border-[#E6ECF2] shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <span className="text-[10px] font-bold text-[#FF5C28] uppercase tracking-wider block">
                Post-NHO Portal Requirements
              </span>
              <h2 className="text-base font-bold text-[#042C51]">Four (4) Mandatory Major Pre-Employment Requirements</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Upload each major requirement individually. TA reviews submissions in the Document Verification queue before endorsing you to IT for Kronos ID creation.
              </p>
            </div>
            <div className="shrink-0 flex items-center gap-2">
              <span className={`px-3 py-1.5 rounded-xl font-bold text-xs ${
                verifiedMajorsCount === 4
                  ? "bg-green-100 text-green-800"
                  : "bg-amber-100 text-amber-800"
              }`}>
                {verifiedMajorsCount} of 4 Cleared
              </span>
            </div>
          </div>

          <div className="space-y-3">
            {[
              { code: "MAJOR-MED-01", name: "1. Medical Records / Fit to Work Certificate", desc: "Medical clearance issued by accredited diagnostic clinic indicating fitness for duty." },
              { code: "MAJOR-NBI-02", name: "2. NBI Clearance (Original / Valid)", desc: "Valid official National Bureau of Investigation clearance certificate with QR code." },
              { code: "MAJOR-PSA-03", name: "3. PSA Birth Certificate", desc: "Philippine Statistics Authority (PSA) issued Certificate of Live Birth." },
              { code: "MAJOR-ID-04", name: "4. Valid Government ID", desc: "Government photo ID: Passport, UMID, PhilID / National ID, or Driver's License." }
            ].map(item => {
              const doc: NHODocumentItem = activeApplicant.documents.find(d => d.templateCode === item.code) || {
                id: `doc-${item.code}`,
                name: item.name,
                category: "Major" as const,
                isMajor: true,
                isEssentialAgreement: false,
                status: "Not Submitted" as const,
                deadlineStatus: "On Time" as const,
                dueDate: activeApplicant.scheduledNhoDate,
                templateCode: item.code,
                documentOwner: "TA" as const
              };

              const isVer = doc.status === "Verified";
              const isPending = doc.status === "For Verification";
              const isNeedsCorr = doc.status === "Needs Correction";
              const isNotSubmitted = doc.status === "Not Submitted";

              return (
                <div key={item.code} className="p-5 bg-white border border-[#E6ECF2] rounded-2xl shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1.5 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-bold text-[#042C51] text-sm">{item.name}</span>
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

                    <p className="text-slate-500 text-xs">
                      {item.desc}
                    </p>

                    {doc.fileName && (
                      <div className="text-[11px] text-slate-600 flex flex-wrap items-center gap-2 pt-0.5">
                        <span className="font-mono bg-slate-100 px-2 py-0.5 rounded text-slate-700">
                          {doc.fileName} {doc.fileSize ? `(${doc.fileSize})` : ""}
                        </span>
                        {doc.submittedDate && (
                          <span className="text-slate-400">
                            • Submitted: {doc.submittedDate}
                          </span>
                        )}
                      </div>
                    )}

                    {isNeedsCorr && doc.correctionRemarks && (
                      <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-xl text-red-950 text-xs flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                        <div>
                          <strong className="font-bold">TA Correction Remarks:</strong> {doc.correctionRemarks}
                          <span className="block text-[11px] text-red-800 mt-0.5">
                            Please replace or re-upload the corrected document below.
                          </span>
                        </div>
                      </div>
                    )}

                    {isVer && doc.verifiedBy && (
                      <span className="text-[11px] text-green-700 block font-medium">
                        Verified by {doc.verifiedBy} on {doc.verifiedDate || activeApplicant.clearedDate || "NHO session"}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {!isVer && (
                      <label className="px-4 py-2 rounded-xl bg-[#FF5C28] hover:bg-[#e04f20] text-white font-bold text-xs shadow-xs cursor-pointer flex items-center gap-1.5 transition-colors">
                        <Upload className="w-3.5 h-3.5" />
                        <span>{isNeedsCorr ? "Resubmit / Replace File" : isPending ? "Replace Uploaded File" : "Upload File"}</span>
                        <input
                          type="file"
                          onChange={e => handleUploadFile(doc, e)}
                          className="hidden"
                        />
                      </label>
                    )}

                    {isVer && (
                      <div className="flex items-center gap-1.5 text-green-700 font-bold bg-green-50 px-3.5 py-1.5 rounded-xl border border-green-200 text-xs">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span>Verified</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Orientation Tab */}
      {currentTab === "orientation" && (
        <NHOOrientationViewer />
      )}

      {/* Essential Agreements Tab */}
      {currentTab === "agreements" && (
        <div className="space-y-4 text-xs">
          <div className="p-4 bg-white rounded-xl border border-[#E6ECF2] shadow-xs">
            <h2 className="text-base font-bold text-[#042C51]">Essential Employment Agreements</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              These three essential documents must be executed and verified before your IT endorsement for Kronos ID creation.
            </p>
          </div>

          <div className="space-y-3">
            {agreements.map(doc => {
              const isVer = doc.status === "Verified";
              const isPending = doc.status === "For Verification";
              const isNeedsCorr = doc.status === "Needs Correction";

              return (
                <div key={doc.id} className="p-5 bg-white border border-[#E6ECF2] rounded-2xl shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-[#042C51] text-sm">{doc.name}</span>
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

                    <p className="text-slate-500 text-xs">
                      {doc.description || "SiBS Official Employment Covenant"}
                    </p>

                    {doc.submittedDate && (
                      <span className="text-[11px] text-slate-400 block">
                        Submitted: {doc.submittedDate} via {doc.submissionMethod} ({doc.fileName})
                      </span>
                    )}

                    {isNeedsCorr && doc.correctionRemarks && (
                      <div className="mt-2 p-2.5 bg-red-50 border border-red-200 rounded-lg text-red-950 text-xs">
                        <strong>Correction Required:</strong> {doc.correctionRemarks}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {!isVer && (
                      <button
                        onClick={() => setSigningDoc(doc)}
                        className="px-4 py-2 rounded-xl bg-[#FF5C28] hover:bg-[#e04f20] text-white font-bold text-xs shadow-xs cursor-pointer flex items-center gap-1.5"
                      >
                        <PenTool className="w-3.5 h-3.5" />
                        <span>{isNeedsCorr ? "Re-Sign / Correct" : doc.status === "Not Submitted" ? "Sign Agreement" : "Update Signature"}</span>
                      </button>
                    )}

                    {isVer && (
                      <div className="flex items-center gap-1.5 text-green-700 font-bold bg-green-50 px-3 py-1.5 rounded-xl border border-green-200">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span>Verified by TA</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Non-Major Requirements Tab */}
      {currentTab === "requirements" && (
        <div className="space-y-4 text-xs">
          <div className="p-4 bg-white rounded-xl border border-[#E6ECF2] shadow-xs flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-[#042C51]">Other Pre-Employment Requirements & NHO Templates</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Standard 14-calendar-day window applies from your physical NHO session date. Pending non-majors do not block IT endorsement.
              </p>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-slate-400 font-bold block uppercase">Deadline</span>
              <span className="font-bold text-[#042C51] text-xs">{activeApplicant.nonMajorDeadlineDate || "Not Started"}</span>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-[#E6ECF2] shadow-xs divide-y divide-[#E6ECF2]">
            {nonMajorDocs.map(doc => {
              const isVer = doc.status === "Verified";
              const isPending = doc.status === "For Verification";

              return (
                <div key={doc.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-800 text-xs">{doc.name}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        isVer
                          ? "bg-green-100 text-green-800"
                          : doc.deadlineStatus === "Overdue"
                            ? "bg-red-100 text-red-800"
                            : "bg-slate-100 text-slate-600"
                      }`}>
                        {doc.status} ({doc.deadlineStatus})
                      </span>
                    </div>
                    <p className="text-slate-500 text-[11px]">{doc.description}</p>
                    {doc.fileName && (
                      <span className="text-[10px] text-slate-400 block font-mono">
                        Uploaded: {doc.fileName}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {!isVer && (
                      <label className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer flex items-center gap-1.5 transition-colors">
                        <Upload className="w-3.5 h-3.5 text-slate-500" />
                        <span>Upload File</span>
                        <input
                          type="file"
                          onChange={e => handleUploadFile(doc, e)}
                          className="hidden"
                        />
                      </label>
                    )}

                    {isVer && (
                      <span className="text-green-700 font-bold text-xs flex items-center gap-1">
                        <Check className="w-4 h-4 text-green-600" />
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

      {/* Personal Information Tab */}
      {currentTab === "profile" && (
        <div className="bg-white rounded-2xl border border-[#E6ECF2] p-6 shadow-xs space-y-4 text-xs">
          <h2 className="text-base font-bold text-[#042C51]">Candidate Personal Information</h2>
          <p className="text-slate-500 text-xs">
            Official HRIS employee profile prefilled from recruitment intake records.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pt-2">
            <div className="p-3 bg-[#F7F9FC] rounded-xl border border-[#E6ECF2]">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Legal Name</span>
              <span className="font-bold text-slate-800 text-xs block mt-1">{activeApplicant.fullName}</span>
            </div>

            <div className="p-3 bg-[#F7F9FC] rounded-xl border border-[#E6ECF2]">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Applicant ID</span>
              <span className="font-bold text-slate-800 text-xs block mt-1 font-mono">{activeApplicant.applicantNumber}</span>
            </div>

            <div className="p-3 bg-[#F7F9FC] rounded-xl border border-[#E6ECF2]">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Official Position</span>
              <span className="font-bold text-slate-800 text-xs block mt-1">{activeApplicant.position}</span>
            </div>

            <div className="p-3 bg-[#F7F9FC] rounded-xl border border-[#E6ECF2]">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Department & Account</span>
              <span className="font-bold text-slate-800 text-xs block mt-1">{activeApplicant.department} — {activeApplicant.account}</span>
            </div>

            <div className="p-3 bg-[#F7F9FC] rounded-xl border border-[#E6ECF2]">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Work Location</span>
              <span className="font-bold text-slate-800 text-xs block mt-1">{activeApplicant.reportingLocation}</span>
            </div>

            <div className="p-3 bg-[#F7F9FC] rounded-xl border border-[#E6ECF2]">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Kronos ID</span>
              <span className="font-bold text-slate-800 text-xs block mt-1 font-mono">{activeApplicant.officialKronosId || "Awaiting IT Provisioning"}</span>
            </div>
          </div>
        </div>
      )}

      {/* Simulated Auth & Temporary Access Tab */}
      {currentTab === "login-sim" && (
        <div className="bg-white rounded-2xl border border-[#E6ECF2] p-6 shadow-xs space-y-5 text-xs">
          <div className="pb-3 border-b border-[#E6ECF2]">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#FF5C28] block">
              Authentication Simulation
            </span>
            <h2 className="text-base font-bold text-[#042C51]">
              Simulated Temporary Account & Authentication Lifecycle
            </h2>
            <p className="text-slate-500 text-xs mt-0.5">
              Demonstrates the system-generated temporary password, 24-hour one-time retrieval link dispatched upon Show attendance, mandatory first-login password change, and final transition to normal HRIS login.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl border border-[#E6ECF2] bg-[#F7F9FC] space-y-2">
              <span className="font-bold text-[#042C51] text-xs block">1. One-Time Retrieval Link</span>
              <p className="text-slate-500 text-[11px]">
                24-hour expiration token issued after TA marks Show attendance.
              </p>
              <div className="space-y-1.5 pt-1">
                <button
                  onClick={() => simulatePasswordRetrieval(activeApplicant.id)}
                  disabled={activeApplicant.tempAccessStatus !== "Active"}
                  className="w-full py-2 rounded-lg bg-[#042C51] hover:bg-[#0B365F] disabled:opacity-40 text-white font-bold text-xs cursor-pointer disabled:cursor-not-allowed"
                >
                  Retrieve Password via Link
                </button>
                <div className="flex gap-1.5">
                  <button
                    onClick={() => simulateLinkExpiration(activeApplicant.id)}
                    className="flex-1 py-1 rounded bg-slate-200 hover:bg-slate-300 text-slate-700 text-[10px] font-semibold cursor-pointer"
                    title="Simulate 24-hr link expiry to test expiration restriction"
                  >
                    Test Expire
                  </button>
                  <button
                    onClick={() => recoverRetrievalLink(activeApplicant.id)}
                    className="flex-1 py-1 rounded bg-blue-100 hover:bg-blue-200 text-blue-800 text-[10px] font-semibold cursor-pointer"
                    title="Request replacement link: invalidates old and issues new"
                  >
                    Recover Link
                  </button>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl border border-[#E6ECF2] bg-[#F7F9FC] space-y-2">
              <span className="font-bold text-[#042C51] text-xs block">2. First-Login Password Change</span>
              <p className="text-slate-500 text-[11px]">
                Temporary password must be replaced with a secure personal password.
              </p>
              <button
                onClick={() => setShowPasswordChangeModal(true)}
                disabled={activeApplicant.tempAccessStatus !== "Active"}
                className="w-full py-2 rounded-lg bg-[#FF5C28] hover:bg-[#e04f20] disabled:opacity-40 text-white font-bold text-xs cursor-pointer disabled:cursor-not-allowed"
              >
                Change Initial Password
              </button>
            </div>

            <div className="p-4 rounded-xl border border-[#E6ECF2] bg-[#F7F9FC] space-y-2">
              <span className="font-bold text-[#042C51] text-xs block">3. Corporate SSO Transition</span>
              <p className="text-slate-500 text-[11px]">
                First login via Kronos deactivates temporary NHO access for this employee.
              </p>
              <button
                onClick={() => simulateFirstRegularLogin(activeApplicant.id)}
                disabled={!activeApplicant.officialKronosId}
                className="w-full py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white font-bold text-xs cursor-pointer disabled:cursor-not-allowed"
              >
                Simulate Regular HRIS Login
              </button>
            </div>

            <div className="p-4 rounded-xl border border-[#E6ECF2] bg-[#F7F9FC] space-y-1.5 text-[11px]">
              <span className="font-bold text-[#042C51] text-xs block">Simulation Parameters</span>
              <div className="text-slate-600">Registered Email: <span className="font-semibold text-slate-800">{activeApplicant.email}</span></div>
              <div className="text-slate-600">Token: <span className="font-mono font-bold text-slate-800">{activeApplicant.passwordRetrievalToken || "None"}</span></div>
              <div className="text-slate-600">Expires: <span className="font-medium text-slate-800">{activeApplicant.retrievalLinkExpiresAt || "—"}</span></div>
              <div className="text-slate-600">Link Used: <strong className={activeApplicant.retrievalLinkUsed ? "text-amber-700" : "text-green-700"}>{activeApplicant.retrievalLinkUsed ? "Yes (Consumed)" : "No (Available)"}</strong></div>
              <div className="text-slate-600">Link Expired: <strong className={activeApplicant.retrievalLinkExpired ? "text-red-700" : "text-green-700"}>{activeApplicant.retrievalLinkExpired ? "Yes" : "No"}</strong></div>
              <div className="text-slate-600">Recoveries: <strong>{activeApplicant.retrievalRecoveryCount || 0}</strong></div>
            </div>
          </div>

          {/* Account status state display */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-slate-700 space-y-1">
            <span className="font-bold block text-xs">Current Temporary Access State:</span>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-[11px]">
              <div>Status: <strong>{activeApplicant.tempAccessStatus}</strong></div>
              <div>Password Changed: <strong>{activeApplicant.hasChangedPassword ? "Yes" : "No (Mandatory)"}</strong></div>
              <div>First Regular Login: <strong>{activeApplicant.firstRegularHrisLoginAt || "None"}</strong></div>
              <div>Kronos ID: <strong>{activeApplicant.officialKronosId || "Pending IT Provisioning"}</strong></div>
            </div>
          </div>
        </div>
      )}

      {/* Signing Modal */}
      {signingDoc && (
        <NHOSignatureModal
          isOpen={!!signingDoc}
          onClose={() => setSigningDoc(null)}
          document={signingDoc}
          applicantId={activeApplicant.id}
        />
      )}

      {/* Password Change Modal */}
      {showPasswordChangeModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 text-xs space-y-4">
            <h3 className="text-sm font-bold text-[#042C51]">Set Your Permanent Password</h3>
            <p className="text-slate-600">
              For security, you must replace your temporary system-generated password upon first accessing the SiBS NHO Portal.
            </p>
            <input
              type="password"
              value={newPasswordInput}
              onChange={e => setNewPasswordInput(e.target.value)}
              placeholder="Enter new secure password (min 8 chars)..."
              className="w-full p-2.5 border border-slate-300 rounded-xl text-xs focus:outline-none"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowPasswordChangeModal(false)}
                className="px-3 py-1.5 rounded-xl text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                onClick={handlePasswordChangeSubmit}
                className="px-4 py-1.5 rounded-xl bg-[#FF5C28] hover:bg-[#e04f20] text-white font-bold"
              >
                Save New Password
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
