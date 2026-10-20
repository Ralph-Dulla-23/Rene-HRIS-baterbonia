import React, { useState } from "react";
import { useNHO } from "../NHOContext";
import { NHOApplicant, NHODocumentItem } from "../nhoTypes";
import { 
  ShieldCheck, 
  CheckCircle, 
  AlertTriangle, 
  Clock, 
  RotateCcw, 
  FileText, 
  ChevronRight, 
  Search, 
  Filter,
  Check,
  User,
  Eye,
  Calendar,
  MapPin,
  GraduationCap,
  BookOpenCheck,
  Sparkles,
  ArrowRight,
  ExternalLink
} from "lucide-react";
import { useJourney } from "../../journey/JourneyContext";
import EmployeeJourneyDrillDown from "../../journey/drilldown/EmployeeJourneyDrillDown";
import { EmployeeJourney } from "../../journey/journeyTypes";
import TwoWeekTrainingScheduleView from "../TwoWeekTrainingScheduleView";

interface NHOHRDashboardProps {
  subTab?: string;
  onSubTabChange?: (tab: string) => void;
  onSwitchModule?: (module: string, journeyId?: string) => void;
}

export default function NHOHRDashboard({ subTab = "handoffs", onSubTabChange }: NHOHRDashboardProps) {
  const { 
    applicants, 
    activeApplicant, 
    setSelectedApplicantId, 
    hrAcceptHandoff, 
    hrReturnHandoff, 
    verifyDocument, 
    returnDocumentForCorrection, 
    showToast 
  } = useNHO();

  const [activeTab, setActiveTab] = useState(subTab);
  const [selectedHandoffId, setSelectedHandoffId] = useState<string>(activeApplicant.id);
  const [returnRemarks, setReturnRemarks] = useState("");
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [ownershipFilter, setOwnershipFilter] = useState<"HR-Owned" | "All" | "TA-Owned">("HR-Owned");

  // 30/60/90 Employee Journey Integration
  const { journeys, getJourneyByNhoApplicantId, createOrLinkJourneyFromNHO } = useJourney();
  const [drawerJourney, setDrawerJourney] = useState<EmployeeJourney | null>(null);
  const [isJourneyDrawerOpen, setIsJourneyDrawerOpen] = useState(false);

  const handleOpenJourney = (app: NHOApplicant) => {
    let j = getJourneyByNhoApplicantId(app.id);
    if (!j && app.officialKronosId) {
      j = journeys.find(item => item.kronosId === app.officialKronosId);
    }
    if (!j) {
      const res = createOrLinkJourneyFromNHO(app, "Dulla, Ralph Vincent (HR Operations Lead)");
      j = res.journey;
    }
    if (j) {
      setDrawerJourney(j);
      setIsJourneyDrawerOpen(true);
    }
  };

  // Sync tab with props
  const currentTab = onSubTabChange ? subTab : activeTab;

  const handoffQueue = applicants.filter(a => a.handoffStatus !== "Not Ready" && a.handoffStatus !== "Pending WFM Assignment");
  const selectedHandoff = applicants.find(a => a.id === selectedHandoffId) || handoffQueue[0] || activeApplicant;

  // Pending requirements properly categorized by ownership
  // Before HR handoff acceptance, TA owns pending non-major requirements.
  // After HR accepts the handoff (handoffStatus === "Accepted"), HR is the primary owner.
  const allPendingDocs = applicants.flatMap(app => 
    app.documents
      .filter(d => !d.isMajor && !d.isEssentialAgreement && d.status !== "Verified")
      .map(doc => ({ 
        app, 
        doc,
        isHrOwned: app.handoffStatus === "Accepted",
        ownerLabel: app.handoffStatus === "Accepted" ? "HR Operations" : "Talent Acquisition (Pre-Handoff)"
      }))
  );

  const pendingRequirementsList = allPendingDocs.filter(item => {
    if (ownershipFilter === "HR-Owned") return item.isHrOwned;
    if (ownershipFilter === "TA-Owned") return !item.isHrOwned;
    return true;
  });

  const handleOpenHandoff = (app: NHOApplicant) => {
    setSelectedHandoffId(app.id);
    setSelectedApplicantId(app.id);
  };

  const handleAccept = (appId: string) => {
    hrAcceptHandoff(appId);
  };

  const handleReturn = () => {
    if (!returnRemarks.trim()) {
      showToast("Please provide mandatory return remarks.", "error");
      return;
    }
    hrReturnHandoff(selectedHandoff.id, returnRemarks);
    setShowReturnModal(false);
    setReturnRemarks("");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-bold text-[#042C51] tracking-tight">
          HR Operations: NHO Handoff & Post-Orientation Oversight
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Review completed orientation packages, accept operational responsibility, and monitor 14-day pending pre-employment requirements.
        </p>
      </div>

      {/* Main Tabs */}
      <div className="bg-white rounded-xl border border-[#E6ECF2] shadow-xs overflow-hidden">
        <div className="flex items-center gap-2 border-b border-[#E6ECF2] px-4 overflow-x-auto text-xs">
          <button
            onClick={() => {
              if (onSubTabChange) onSubTabChange("handoffs");
              setActiveTab("handoffs");
            }}
            className={`py-3 px-3 font-bold border-b-2 transition-colors cursor-pointer ${
              currentTab === "handoffs" || currentTab === "review"
                ? "border-[#FF5C28] text-[#042C51]"
                : "border-transparent text-slate-500 hover:text-[#042C51]"
            }`}
          >
            NHO Handoff Reviews ({handoffQueue.length})
          </button>
          <button
            onClick={() => {
              if (onSubTabChange) onSubTabChange("pending-reqs");
              setActiveTab("pending-reqs");
            }}
            className={`py-3 px-3 font-bold border-b-2 transition-colors cursor-pointer ${
              currentTab === "pending-reqs"
                ? "border-[#FF5C28] text-[#042C51]"
                : "border-transparent text-slate-500 hover:text-[#042C51]"
            }`}
          >
            14-Day Pending Requirements ({pendingRequirementsList.length})
          </button>
        </div>

        <div className="p-6">
          {/* Subtab 1: Handoff Reviews */}
          {(currentTab === "handoffs" || currentTab === "review") && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left: Queue list */}
                <div className="lg:col-span-1 border border-[#E6ECF2] rounded-xl overflow-hidden divide-y divide-[#E6ECF2] text-xs">
                  <div className="p-3 bg-[#F7F9FC] font-bold text-[#042C51] uppercase tracking-wider text-[11px]">
                    Handoff Packages ({handoffQueue.length})
                  </div>
                  {handoffQueue.length === 0 ? (
                    <div className="p-6 text-center text-slate-400 italic">
                      No handoffs submitted to HR yet.
                    </div>
                  ) : (
                    handoffQueue.map(app => (
                      <button
                        key={app.id}
                        onClick={() => handleOpenHandoff(app)}
                        className={`w-full text-left p-4 hover:bg-slate-50 transition-colors cursor-pointer flex flex-col gap-1 ${
                          app.id === selectedHandoff.id ? "bg-orange-50/70 border-l-4 border-[#FF5C28]" : ""
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-[#042C51]">{app.fullName}</span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            app.handoffStatus === "Accepted"
                              ? "bg-green-100 text-green-800"
                              : app.handoffStatus === "Returned for Correction"
                                ? "bg-red-100 text-red-800"
                                : "bg-purple-100 text-purple-800"
                          }`}>
                            {app.handoffStatus}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono mt-0.5">
                          <span>Kronos: {app.officialKronosId || "Pending"}</span>
                          {app.handoffStatus === "Accepted" && (
                            <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-[#FF5C28]/10 text-[#FF5C28] flex items-center gap-1">
                              <Sparkles className="w-2.5 h-2.5" /> Journey
                            </span>
                          )}
                        </div>
                      </button>
                    ))
                  )}
                </div>

                {/* Right: Detailed Structured Handoff Summary */}
                <div className="lg:col-span-2 space-y-5 text-xs">
                  <div className="bg-[#F7F9FC] border border-[#E6ECF2] rounded-2xl p-6 space-y-5">
                    {/* Header */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-200">
                      <div>
                        <span className="text-[10px] font-bold text-[#FF5C28] uppercase tracking-wider block">
                          Official HR Handoff Summary
                        </span>
                        <h2 className="text-base font-bold text-[#042C51] mt-0.5">
                          {selectedHandoff.fullName} ({selectedHandoff.applicantNumber})
                        </h2>
                      </div>

                      <div className="flex items-center gap-2">
                        {selectedHandoff.handoffStatus === "Accepted" && (
                          <button
                            onClick={() => handleOpenJourney(selectedHandoff)}
                            className="px-3 py-1.5 rounded-xl bg-[#FF5C28] hover:bg-[#e04f20] text-white font-bold text-xs shadow-xs cursor-pointer flex items-center gap-1.5 transition-colors"
                          >
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>Open Employee Journey</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        )}
                        <span className={`px-3 py-1 rounded-xl font-bold text-xs ${
                          selectedHandoff.handoffStatus === "Accepted"
                            ? "bg-green-100 text-green-800"
                            : selectedHandoff.handoffStatus === "Returned for Correction"
                              ? "bg-red-100 text-red-800"
                              : "bg-purple-100 text-purple-800"
                        }`}>
                          {selectedHandoff.handoffStatus}
                        </span>
                      </div>
                    </div>

                    {/* 30/60/90 Journey Banner Card if Accepted */}
                    {selectedHandoff.handoffStatus === "Accepted" && (
                      <div className="p-3.5 bg-gradient-to-r from-orange-50/90 via-amber-50/50 to-green-50/60 border border-[#FF5C28]/30 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-[#FF5C28]/10 border border-[#FF5C28]/20 flex items-center justify-center shrink-0">
                            <Sparkles className="w-5 h-5 text-[#FF5C28]" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-[#042C51] text-xs">30 / 60 / 90 Employee Journey Active</span>
                              <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-[#042C51] text-white font-mono">
                                {selectedHandoff.linkedEmployeeJourneyId || "JRN-2026-ACTIVE"}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-500 mt-0.5">
                              Enrolled in nesting and 90-day regularization roadmap. Assigned Trainer: {selectedHandoff.assignedTrainerName || "Assigned"} | Seat: {selectedHandoff.wfmSeatNumber || "Pending"}.
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleOpenJourney(selectedHandoff)}
                          className="px-3.5 py-2 rounded-xl bg-[#042C51] hover:bg-[#0B365F] text-white font-bold text-xs shadow-xs cursor-pointer flex items-center gap-1.5 shrink-0 transition-colors"
                        >
                          <ExternalLink className="w-3.5 h-3.5 text-[#FF5C28]" />
                          <span>View Journey</span>
                        </button>
                      </div>
                    )}

                    {/* Summary Matrix */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div className="p-3 bg-white rounded-xl border border-slate-200">
                        <span className="text-[10px] text-slate-400 block font-bold">Official Kronos ID</span>
                        <span className="font-mono font-bold text-purple-900 text-xs block mt-1">
                          {selectedHandoff.officialKronosId || "Not assigned"}
                        </span>
                      </div>
                      <div className="p-3 bg-white rounded-xl border border-slate-200">
                        <span className="text-[10px] text-slate-400 block font-bold">QDS Attendance Schedule</span>
                        <span className="font-bold text-[#FF5C28] text-xs block mt-1">
                          {selectedHandoff.qdsAssignedScheduleDate || selectedHandoff.scheduledNhoDate || "Unassigned"}
                        </span>
                      </div>
                      <div className="p-3 bg-white rounded-xl border border-slate-200">
                        <span className="text-[10px] text-slate-400 block font-bold">Physical NHO Date</span>
                        <span className="font-bold text-slate-800 text-xs block mt-1">
                          {selectedHandoff.clearedDate || selectedHandoff.scheduledNhoDate}
                        </span>
                      </div>
                      <div className="p-3 bg-white rounded-xl border border-slate-200">
                        <span className="text-[10px] text-slate-400 block font-bold">14-Day Non-Major Deadline</span>
                        <span className="font-bold text-[#042C51] text-xs block mt-1">
                          {selectedHandoff.nonMajorDeadlineDate}
                        </span>
                      </div>
                      <div className="p-3 bg-white rounded-xl border border-slate-200">
                        <span className="text-[10px] text-slate-400 block font-bold">4 Major Requirements</span>
                        <span className="font-bold text-green-700 text-xs block mt-1">
                          4/4 Uploaded & Verified
                        </span>
                      </div>
                      <div className="p-3 bg-white rounded-xl border border-slate-200">
                        <span className="text-[10px] text-slate-400 block font-bold">Orientation Acknowledgment</span>
                        <span className="font-bold text-green-700 text-xs block mt-1">
                          Completed & Signed
                        </span>
                      </div>
                      <div className="p-3 bg-white rounded-xl border border-slate-200">
                        <span className="text-[10px] text-slate-400 block font-bold">3 Essential Agreements</span>
                        <span className="font-bold text-green-700 text-xs block mt-1">
                          3/3 Verified by TA
                        </span>
                      </div>
                    </div>

                    {/* Pending Non-Majors Breakdown */}
                    <div className="p-4 bg-white rounded-xl border border-slate-200 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-700 text-xs">
                          Pending Non-Major Requirements Transferring to HR Ownership:
                        </span>
                        <span className="text-[10px] text-slate-400">
                          Due: {selectedHandoff.nonMajorDeadlineDate}
                        </span>
                      </div>

                      <div className="space-y-1.5 pt-1">
                        {selectedHandoff.documents.filter(d => !d.isMajor && !d.isEssentialAgreement).map(d => (
                          <div key={d.id} className="flex items-center justify-between text-[11px] p-2 bg-slate-50 rounded-lg">
                            <span className="text-slate-800 font-medium">{d.name}</span>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              d.status === "Verified" ? "bg-green-100 text-green-800" : "bg-amber-100 text-amber-800"
                            }`}>
                              {d.status}
                            </span>
                          </div>
                        ))}
                      </div>

                      <p className="text-[10px] text-slate-400 pt-1">
                        * Note: Pending non-major documents do not block HR acceptance. Upon acceptance, HR takes primary ownership of follow-ups.
                      </p>
                    </div>

                    {/* Post-IT Parallel Department Milestone Overview */}
                    <div className="space-y-4 pt-2">
                      <div className="flex items-center justify-between pb-1">
                        <h3 className="font-bold text-[#042C51] text-xs uppercase tracking-wider">
                          Post-IT Parallel Departmental Milestones (Trainer • QDS • WFM)
                        </h3>
                        <span className="text-[10px] text-slate-400">All 3 required for HR acceptance</span>
                      </div>

                      {/* 1. Trainer Assignment */}
                      <div className="p-4 bg-white rounded-xl border border-slate-200 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <GraduationCap className="w-4 h-4 text-[#042C51]" />
                            <span className="font-bold text-[#042C51] text-xs uppercase tracking-wider">
                              1. Trainer Assignment & Acceptance
                            </span>
                          </div>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            selectedHandoff.trainerStatus === "Accepted"
                              ? "bg-green-100 text-green-800"
                              : selectedHandoff.trainerStatus === "Unable to Accept"
                                ? "bg-red-100 text-red-800"
                                : "bg-amber-100 text-amber-800"
                          }`}>
                            {selectedHandoff.trainerStatus || "Pending Acceptance"}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-[11px] pt-1">
                          <div className="p-2.5 bg-slate-50 rounded-lg">
                            <span className="text-[10px] text-slate-400 block font-semibold uppercase">Assigned Trainer</span>
                            <span className="font-bold text-[#042C51] block mt-0.5">
                              {selectedHandoff.assignedTrainerName || "Unassigned"}
                            </span>
                          </div>
                          <div className="p-2.5 bg-slate-50 rounded-lg">
                            <span className="text-[10px] text-slate-400 block font-semibold uppercase">Accepted By</span>
                            <span className="text-slate-800 block mt-0.5">
                              {selectedHandoff.trainerAcceptedBy || "Pending Acceptance"}
                            </span>
                          </div>
                          <div className="p-2.5 bg-slate-50 rounded-lg">
                            <span className="text-[10px] text-slate-400 block font-semibold uppercase">Accepted Date</span>
                            <span className="text-slate-800 block mt-0.5">
                              {selectedHandoff.trainerAcceptedAt || "—"}
                            </span>
                          </div>
                        </div>

                        {selectedHandoff.trainerStatus === "Unable to Accept" && selectedHandoff.trainerUnableReason && (
                          <div className="p-2.5 bg-red-50 border border-red-200 rounded-lg text-[11px] text-red-800">
                            <strong>Trainer Declination Note:</strong> {selectedHandoff.trainerUnableReason} (Pending Reassignment)
                          </div>
                        )}
                      </div>

                      {/* 2. QDS Training Materials */}
                      <div className="p-4 bg-white rounded-xl border border-slate-200 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <BookOpenCheck className="w-4 h-4 text-[#FF5C28]" />
                            <span className="font-bold text-[#042C51] text-xs uppercase tracking-wider">
                              2. QDS Training Materials Assignment
                            </span>
                          </div>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            selectedHandoff.qdsStatus === "Completed"
                              ? "bg-green-100 text-green-800"
                              : selectedHandoff.qdsStatus === "In Progress"
                                ? "bg-blue-100 text-blue-800"
                                : "bg-amber-100 text-amber-800"
                          }`}>
                            {selectedHandoff.qdsStatus || "Pending"}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-[11px] pt-1">
                          <div className="p-2.5 bg-slate-50 rounded-lg">
                            <span className="text-[10px] text-slate-400 block font-semibold uppercase">Curriculum Count</span>
                            <span className="font-bold text-[#042C51] block mt-0.5">
                              {selectedHandoff.qdsMaterials?.length || 0} Materials Assigned
                            </span>
                          </div>
                          <div className="p-2.5 bg-slate-50 rounded-lg">
                            <span className="text-[10px] text-slate-400 block font-semibold uppercase">Finalized By</span>
                            <span className="text-slate-800 block mt-0.5">
                              {selectedHandoff.qdsCompletedBy || "Not Recorded"}
                            </span>
                          </div>
                          <div className="p-2.5 bg-slate-50 rounded-lg">
                            <span className="text-[10px] text-slate-400 block font-semibold uppercase">Completed Date</span>
                            <span className="text-slate-800 block mt-0.5">
                              {selectedHandoff.qdsCompletedAt || (selectedHandoff.qdsStatus === "Completed" ? "Completed" : "Pending Confirmation")}
                            </span>
                          </div>
                        </div>

                        {selectedHandoff.qdsMaterials && selectedHandoff.qdsMaterials.length > 0 && (
                          <div className="space-y-1.5 pt-1">
                            <span className="text-[10px] text-slate-400 font-semibold block uppercase">Assigned Items:</span>
                            {selectedHandoff.qdsMaterials.map(m => (
                              <div key={m.id} className="p-2 bg-slate-50 rounded-lg flex items-center justify-between text-[11px]">
                                <span className="font-medium text-slate-800">{m.title}</span>
                                <span className="text-[10px] text-slate-500 font-mono">{m.type}</span>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Synchronized QDS Attendance Schedule & 2-Week PST/FST Matrix */}
                        <div className="p-4 bg-[#F7F9FC] border border-[#BECBDA] rounded-xl space-y-3.5">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider flex items-center gap-1.5">
                              <Calendar className="w-3.5 h-3.5 text-[#FF5C28]" />
                              <span>QDS Attendance Schedule (Real-Time Synchronized)</span>
                            </span>
                            {selectedHandoff.qdsAssignedScheduleDate ? (
                              <span className="px-2 py-0.5 rounded text-[9.5px] font-bold bg-green-100 text-green-800 border border-green-200 flex items-center gap-1">
                                <CheckCircle className="w-3 h-3 text-green-600" />
                                <span>Synchronized with QDS</span>
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded text-[9.5px] font-bold bg-amber-100 text-amber-800">
                                Awaiting QDS Schedule Assignment
                              </span>
                            )}
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-[11px] pt-0.5">
                            <div className="p-2 bg-white rounded-lg border border-slate-200">
                              <span className="text-[9.5px] text-slate-400 block font-semibold uppercase">Schedule Date</span>
                              <span className="font-bold text-[#042C51] block mt-0.5">
                                {selectedHandoff.qdsAssignedScheduleDate || selectedHandoff.scheduledNhoDate || "Unassigned"}
                              </span>
                            </div>
                            <div className="p-2 bg-white rounded-lg border border-slate-200">
                              <span className="text-[9.5px] text-slate-400 block font-semibold uppercase">Shift Hours</span>
                              <span className="font-bold text-slate-800 block mt-0.5">
                                {selectedHandoff.qdsShiftHours || "08:00 AM – 05:00 PM (Default)"}
                              </span>
                            </div>
                            <div className="p-2 bg-white rounded-lg border border-slate-200">
                              <span className="text-[9.5px] text-slate-400 block font-semibold uppercase">Training Facility / Room</span>
                              <span className="font-bold text-slate-800 block mt-0.5">
                                {selectedHandoff.qdsTrainingLocation || "Fintech Training Room 4A"}
                              </span>
                            </div>
                          </div>

                          {selectedHandoff.qdsScheduleAssignedBy && (
                            <div className="text-[10px] text-slate-400 flex items-center justify-between pt-0.5">
                              <span>Assigned by: <strong>{selectedHandoff.qdsScheduleAssignedBy}</strong></span>
                              <span>Timestamp: {selectedHandoff.qdsScheduleAssignedAt || "—"}</span>
                            </div>
                          )}

                          {/* 2-Week Based PST & FST Clickable Schedule */}
                          <div className="pt-2 border-t border-slate-200">
                            <TwoWeekTrainingScheduleView
                              startDate={selectedHandoff.qdsAssignedScheduleDate || selectedHandoff.scheduledNhoDate || "2026-10-12"}
                              assignedTrainerId={selectedHandoff.assignedTrainerId}
                              assignedTrainerName={selectedHandoff.assignedTrainerName}
                              existingMaterials={selectedHandoff.qdsMaterials || []}
                              shiftHours={selectedHandoff.qdsShiftHours || "08:00 AM – 05:00 PM (Default)"}
                              trainingLocation={selectedHandoff.qdsTrainingLocation || "Fintech Training Room 4A"}
                              traineeName={selectedHandoff.fullName}
                            />
                          </div>
                        </div>
                      </div>


                      {/* 3. WFM Production Assignment Section */}
                      <div className="p-4 bg-white rounded-xl border border-slate-200 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-[#FF5C28]" />
                            <span className="font-bold text-[#042C51] text-xs uppercase tracking-wider">
                              3. WFM Production Seat Assignment
                            </span>
                          </div>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            selectedHandoff.wfmStatus === "Assigned"
                              ? "bg-green-100 text-green-800"
                              : "bg-amber-100 text-amber-800"
                          }`}>
                            {selectedHandoff.wfmStatus || "Not Ready"}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-[11px] pt-1">
                          <div className="p-2.5 bg-slate-50 rounded-lg">
                            <span className="text-[10px] text-slate-400 block font-semibold uppercase">Assigned Wing</span>
                            <span className="font-bold text-[#042C51] block mt-0.5">
                              {selectedHandoff.wfmProductionWing || "Pending WFM"}
                            </span>
                          </div>
                          <div className="p-2.5 bg-slate-50 rounded-lg">
                            <span className="text-[10px] text-slate-400 block font-semibold uppercase">Seat / Workstation #</span>
                            <span className="font-mono font-bold text-purple-900 block mt-0.5">
                              {selectedHandoff.wfmSeatNumber || "Pending WFM"}
                            </span>
                          </div>
                          <div className="p-2.5 bg-slate-50 rounded-lg">
                            <span className="text-[10px] text-slate-400 block font-semibold uppercase">Assigned By</span>
                            <span className="text-slate-800 block mt-0.5 truncate" title={selectedHandoff.wfmAssignedBy || "—"}>
                              {selectedHandoff.wfmAssignedBy || "—"}
                            </span>
                          </div>
                          <div className="p-2.5 bg-slate-50 rounded-lg">
                            <span className="text-[10px] text-slate-400 block font-semibold uppercase">Assigned Date</span>
                            <span className="text-slate-800 block mt-0.5">
                              {selectedHandoff.wfmAssignedAt || "—"}
                            </span>
                          </div>
                        </div>

                        {selectedHandoff.wfmRemarks && (
                          <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-[11px] text-slate-700">
                            <strong>WFM Remarks:</strong> {selectedHandoff.wfmRemarks}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Return notes if any */}
                    {selectedHandoff.handoffStatus === "Returned for Correction" && selectedHandoff.handoffCorrectionRemarks && (
                      <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-950 text-xs">
                        <strong>Correction Note Dispatched to TA:</strong> {selectedHandoff.handoffCorrectionRemarks}
                      </div>
                    )}

                    {/* Pre-acceptance Status Verification Alert */}
                    {selectedHandoff.handoffStatus !== "Accepted" && (
                      (!selectedHandoff.officialKronosId || 
                       selectedHandoff.itRequestStatus !== "Completed" || 
                       selectedHandoff.trainerStatus !== "Accepted" ||
                       selectedHandoff.qdsStatus !== "Completed" ||
                       selectedHandoff.wfmStatus !== "Assigned") && (
                        <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-950 text-xs flex items-start gap-2">
                          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                          <div>
                            <strong>Pending Post-IT Department Prerequisites:</strong> All three parallel post-IT assignments must be completed before accepting this handoff:
                            <ul className="list-disc list-inside mt-1 space-y-0.5 text-[11px]">
                              <li className={selectedHandoff.itRequestStatus === "Completed" && !!selectedHandoff.officialKronosId ? "text-green-800 font-semibold" : "text-amber-900"}>
                                IT Provisioning: {selectedHandoff.itRequestStatus === "Completed" && selectedHandoff.officialKronosId ? `Completed (${selectedHandoff.officialKronosId})` : "Pending completion"}
                              </li>
                              <li className={selectedHandoff.trainerStatus === "Accepted" ? "text-green-800 font-semibold" : "text-amber-900"}>
                                Trainer Acceptance: {selectedHandoff.trainerStatus === "Accepted" ? `Accepted by ${selectedHandoff.trainerAcceptedBy || "Trainer"}` : "Pending trainer acceptance"}
                              </li>
                              <li className={selectedHandoff.qdsStatus === "Completed" ? "text-green-800 font-semibold" : "text-amber-900"}>
                                QDS Training Materials: {selectedHandoff.qdsStatus === "Completed" ? `Finalized (${selectedHandoff.qdsMaterials?.length || 0} materials)` : "Pending QDS confirmation"}
                              </li>
                              <li className={selectedHandoff.wfmStatus === "Assigned" ? "text-green-800 font-semibold" : "text-amber-900"}>
                                WFM Seat Assignment: {selectedHandoff.wfmStatus === "Assigned" ? `Assigned (${selectedHandoff.wfmProductionWing} - ${selectedHandoff.wfmSeatNumber})` : "Pending WFM workstation"}
                              </li>
                            </ul>
                          </div>
                        </div>
                      )
                    )}

                    {/* Action buttons */}
                    <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-200">
                      {selectedHandoff.handoffStatus !== "Accepted" && (
                        <>
                          <button
                            onClick={() => setShowReturnModal(true)}
                            className="px-4 py-2 rounded-xl text-xs font-semibold text-red-600 hover:bg-red-50 border border-red-200 cursor-pointer"
                          >
                            Return for Correction
                          </button>

                          <button
                            onClick={() => handleAccept(selectedHandoff.id)}
                            disabled={
                              !selectedHandoff.officialKronosId || 
                              selectedHandoff.itRequestStatus !== "Completed" || 
                              selectedHandoff.trainerStatus !== "Accepted" ||
                              selectedHandoff.qdsStatus !== "Completed" ||
                              (selectedHandoff.qdsMaterials?.length || 0) === 0 ||
                              selectedHandoff.wfmStatus !== "Assigned" ||
                              !selectedHandoff.wfmProductionWing ||
                              !selectedHandoff.wfmSeatNumber
                            }
                            className="px-5 py-2 rounded-xl bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-xs shadow-xs cursor-pointer flex items-center gap-1.5"
                          >
                            <Check className="w-4 h-4" />
                            <span>Accept Handoff & Transfer Ownership</span>
                          </button>
                        </>
                      )}

                      {selectedHandoff.handoffStatus === "Accepted" && (
                        <div className="flex flex-wrap items-center gap-2.5">
                          <div className="flex items-center gap-2 text-green-800 bg-green-50 px-4 py-2 rounded-xl border border-green-200 font-bold text-xs">
                            <CheckCircle className="w-4 h-4 text-green-600" />
                            <span>Accepted by {selectedHandoff.hrAcceptedBy} on {selectedHandoff.hrAcceptedAt}</span>
                          </div>

                          <button
                            onClick={() => handleOpenJourney(selectedHandoff)}
                            className="px-4 py-2 rounded-xl bg-[#FF5C28] hover:bg-[#e04f20] text-white font-bold text-xs shadow-xs cursor-pointer flex items-center gap-1.5 transition-colors"
                          >
                            <Sparkles className="w-4 h-4" />
                            <span>Open Employee Journey</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Subtab 2: 14-Day Pending Requirements Monitor */}
          {currentTab === "pending-reqs" && (
            <div className="space-y-4 text-xs">
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl text-blue-950">
                <strong>HR Ownership of Non-Major Requirements (Phase 7 & Phase 10):</strong> Before handoff acceptance, TA owns pending non-major requirements. Upon formal HR handoff acceptance, HR assumes primary operational ownership of tracking outstanding documents. The standard deadline of 14 calendar days from physical NHO clearance is preserved.
              </div>

              {/* Ownership Filter Tabs */}
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-1.5 bg-[#F7F9FC] p-1 rounded-xl border border-[#E6ECF2]">
                  <button
                    onClick={() => setOwnershipFilter("HR-Owned")}
                    className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-colors cursor-pointer ${
                      ownershipFilter === "HR-Owned"
                        ? "bg-[#042C51] text-white shadow-xs"
                        : "text-slate-600 hover:text-[#042C51]"
                    }`}
                  >
                    HR-Owned (Handoff Accepted) ({allPendingDocs.filter(d => d.isHrOwned).length})
                  </button>
                  <button
                    onClick={() => setOwnershipFilter("TA-Owned")}
                    className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-colors cursor-pointer ${
                      ownershipFilter === "TA-Owned"
                        ? "bg-[#042C51] text-white shadow-xs"
                        : "text-slate-600 hover:text-[#042C51]"
                    }`}
                  >
                    TA-Owned (Pre-Handoff) ({allPendingDocs.filter(d => !d.isHrOwned).length})
                  </button>
                  <button
                    onClick={() => setOwnershipFilter("All")}
                    className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-colors cursor-pointer ${
                      ownershipFilter === "All"
                        ? "bg-[#042C51] text-white shadow-xs"
                        : "text-slate-600 hover:text-[#042C51]"
                    }`}
                  >
                    All Pending ({allPendingDocs.length})
                  </button>
                </div>
                <span className="text-[11px] text-slate-500 font-medium">
                  Showing: <strong>{ownershipFilter}</strong> requirements
                </span>
              </div>

              <div className="bg-white rounded-2xl border border-[#E6ECF2] shadow-xs overflow-hidden divide-y divide-[#E6ECF2]">
                {pendingRequirementsList.length === 0 ? (
                  <div className="p-8 text-center text-slate-400 italic">
                    No pending requirements found matching filter: {ownershipFilter}.
                  </div>
                ) : (
                  pendingRequirementsList.map(({ app, doc, isHrOwned, ownerLabel }) => (
                    <div key={`${app.id}-${doc.id}`} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-[#042C51]">{app.fullName}</span>
                          <span className="font-mono text-slate-400 text-[10px]">({app.applicantNumber})</span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            isHrOwned ? "bg-purple-100 text-purple-800" : "bg-slate-100 text-slate-700"
                          }`}>
                            Owner: {ownerLabel}
                          </span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            doc.deadlineStatus === "Overdue"
                              ? "bg-red-100 text-red-800"
                              : doc.deadlineStatus === "Submitted Late"
                                ? "bg-amber-100 text-amber-800"
                                : "bg-blue-100 text-blue-800"
                          }`}>
                            {doc.deadlineStatus}
                          </span>
                        </div>

                        <div className="text-slate-700 font-semibold text-xs">
                          {doc.name} • Status: <span className="text-slate-500 font-normal">{doc.status}</span>
                        </div>

                        <div className="text-[11px] text-slate-400 flex items-center gap-3">
                          <span>Physical NHO Cleared: {app.clearedDate || "—"}</span>
                          <span>•</span>
                          <span>Original 14-Day Deadline: <strong className="text-slate-700">{doc.dueDate}</strong></span>
                          {doc.fileName && (
                            <>
                              <span>•</span>
                              <span>File: {doc.fileName}</span>
                            </>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {doc.status === "For Verification" && (
                          <button
                            onClick={() => verifyDocument(app.id, doc.id)}
                            className="px-3.5 py-1.5 rounded-xl bg-green-600 hover:bg-green-700 text-white font-bold text-xs shadow-xs cursor-pointer flex items-center gap-1"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Verify Document</span>
                          </button>
                        )}

                        <button
                          onClick={() => {
                            setSelectedHandoffId(app.id);
                            setSelectedApplicantId(app.id);
                            setActiveTab("handoffs");
                          }}
                          className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs cursor-pointer"
                        >
                          View Handoff
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Return Modal */}
      {showReturnModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 text-xs space-y-4">
            <h3 className="text-sm font-bold text-red-600">Return Handoff to Talent Acquisition</h3>
            <p className="text-slate-600 leading-relaxed">
              Please state the exact discrepancy or missing verification reason. The handoff record will be returned to TA for rectification without deleting the existing Kronos account.
            </p>
            <textarea
              rows={3}
              value={returnRemarks}
              onChange={e => setReturnRemarks(e.target.value)}
              placeholder="e.g. Discrepancy in middle name spelling on Government ID vs Kronos profile; please reconcile with TA records..."
              className="w-full p-2.5 border border-slate-300 rounded-xl focus:outline-none"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowReturnModal(false)}
                className="px-3.5 py-2 rounded-xl text-slate-600 hover:bg-slate-100 border border-slate-200 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleReturn}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold cursor-pointer"
              >
                Confirm Return to TA
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Employee Journey 7-Tab Drill-Down */}
      {drawerJourney && (
        <EmployeeJourneyDrillDown
          journey={drawerJourney}
          isOpen={isJourneyDrawerOpen}
          onClose={() => setIsJourneyDrawerOpen(false)}
        />
      )}
    </div>
  );
}
