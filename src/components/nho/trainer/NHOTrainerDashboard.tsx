import React, { useState } from "react";
import { useNHO } from "../NHOContext";
import { NHOApplicant, NHOQDSMaterial, NHOTrainerMaterialRequest } from "../nhoTypes";
import { 
  GraduationCap, 
  Search, 
  CheckCircle, 
  AlertTriangle, 
  Clock, 
  User, 
  UserCheck, 
  ArrowRight,
  Info,
  Calendar,
  Building,
  RotateCcw,
  Sparkles,
  ShieldAlert,
  ExternalLink,
  BookOpen,
  FileText,
  Plus,
  Send,
  Eye,
  Check,
  PackageCheck,
  HelpCircle,
  Link as LinkIcon,
  X,
  FileCode,
  Download
} from "lucide-react";
import { useJourney } from "../../journey/JourneyContext";
import EmployeeJourneyDrawer from "../../journey/EmployeeJourneyDrawer";
import { EmployeeJourney } from "../../journey/journeyTypes";
import TwoWeekTrainingScheduleView from "../TwoWeekTrainingScheduleView";

interface NHOTrainerDashboardProps {
  subTab?: string;
  onSubTabChange?: (tab: string) => void;
  onSwitchModule?: (module: string, journeyId?: string) => void;
}

export const TRAINER_ROSTER = [
  { id: "TRN-001", name: "Maria Elena Garcia (Senior Trainer)" },
  { id: "TRN-002", name: "Carlos Mendoza (L&D Specialist)" },
  { id: "TRN-003", name: "Patricia Cruz (Lead Communications Coach)" },
  { id: "TRN-004", name: "Danielle Lopez (Operations Trainer)" }
];

export default function NHOTrainerDashboard({ subTab = "queue", onSubTabChange }: NHOTrainerDashboardProps) {
  const {
    applicants,
    activeApplicant,
    setSelectedApplicantId,
    trainerAcceptTrainee,
    trainerDeclineTrainee,
    trainerReassign,
    trainerRequestMaterial,
    simulatedCurrentDate,
    showToast
  } = useNHO();

  const [activeTrainerFilter, setActiveTrainerFilter] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [selectedTraineeId, setSelectedTraineeId] = useState<string>(activeApplicant?.id || "");
  
  // Modal states
  const [showDeclineModal, setShowDeclineModal] = useState(false);
  const [declineReason, setDeclineReason] = useState("");
  const [reviewedMaterials, setReviewedMaterials] = useState(false);
  const [reviewedMaterialIds, setReviewedMaterialIds] = useState<string[]>([]);
  const [previewMaterial, setPreviewMaterial] = useState<NHOQDSMaterial | null>(null);

  // Request Material Modal states
  const [showRequestMaterialModal, setShowRequestMaterialModal] = useState(false);
  const [requestTitle, setRequestTitle] = useState("");
  const [requestCategory, setRequestCategory] = useState("Operations Playbook");
  const [requestPriority, setRequestPriority] = useState<"Standard" | "Urgent">("Standard");
  const [requestReason, setRequestReason] = useState("");

  // 30/60/90 Journey Integration
  const { journeys, getJourneyByNhoApplicantId, createOrLinkJourneyFromNHO } = useJourney();
  const [drawerJourney, setDrawerJourney] = useState<EmployeeJourney | null>(null);
  const [isJourneyDrawerOpen, setIsJourneyDrawerOpen] = useState(false);

  const handleOpenJourney = (app: NHOApplicant) => {
    let j = getJourneyByNhoApplicantId(app.id);
    if (!j && app.officialKronosId) {
      j = journeys.find(item => item.kronosId === app.officialKronosId);
    }
    if (j) {
      setDrawerJourney(j);
      setIsJourneyDrawerOpen(true);
    } else {
      showToast("Employee Journey record will be available once HR Operations formally accepts the onboarding handoff.", "info");
    }
  };

  // Active trainer logged into prototype view
  const [currentTrainerId, setCurrentTrainerId] = useState<string>(TRAINER_ROSTER[0].id);
  const currentTrainer = TRAINER_ROSTER.find(t => t.id === currentTrainerId) || TRAINER_ROSTER[0];
  const currentTrainerName = currentTrainer.name;

  // Post-IT applicants eligible for Trainer queue
  const postITApplicants = applicants.filter(a => a.itRequestStatus === "Completed" && !!a.officialKronosId);

  // Filtered applicants
  const filteredApplicants = postITApplicants.filter(a => {
    const matchesSearch = 
      a.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.applicantNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (a.officialKronosId || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (a.assignedTrainerName || "").toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = 
      statusFilter === "All" ||
      (statusFilter === "Pending" && (a.trainerStatus === "Pending Acceptance" || a.trainerStatus === "Pending Assignment")) ||
      (statusFilter === "Accepted" && a.trainerStatus === "Accepted") ||
      (statusFilter === "Unable to Accept" && a.trainerStatus === "Unable to Accept");

    const matchesTrainer = 
      activeTrainerFilter === "All" ||
      (a.assignedTrainerName && a.assignedTrainerName.includes(activeTrainerFilter));

    return matchesSearch && matchesStatus && matchesTrainer;
  });

  const selectedTrainee = applicants.find(a => a.id === selectedTraineeId) || filteredApplicants[0] || postITApplicants[0];

  const handleOpenTrainee = (app: NHOApplicant) => {
    setSelectedTraineeId(app.id);
    setSelectedApplicantId(app.id);
    const existingIds = (app.qdsMaterials || []).map(m => m.id);
    if (app.trainerStatus === "Accepted") {
      setReviewedMaterialIds(existingIds);
      setReviewedMaterials(true);
    } else {
      setReviewedMaterialIds([]);
      setReviewedMaterials(false);
    }
    if (onSubTabChange) onSubTabChange("acceptance");
  };

  const handleToggleMaterialReview = (materialId: string) => {
    setReviewedMaterialIds(prev => {
      const isAlready = prev.includes(materialId);
      const next = isAlready ? prev.filter(id => id !== materialId) : [...prev, materialId];
      const allMaterials = selectedTrainee?.qdsMaterials || [];
      if (allMaterials.length > 0 && next.length >= allMaterials.length) {
        setReviewedMaterials(true);
      }
      return next;
    });
  };

  const handleMarkAllMaterialsReviewed = () => {
    if (!selectedTrainee?.qdsMaterials || selectedTrainee.qdsMaterials.length === 0) return;
    const allIds = selectedTrainee.qdsMaterials.map(m => m.id);
    setReviewedMaterialIds(allIds);
    setReviewedMaterials(true);
    showToast(`All ${allIds.length} curriculum materials marked as reviewed!`, "success");
  };

  const handleSendMaterialRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTrainee) return;
    if (!requestTitle.trim()) {
      showToast("Please provide a material title or training topic.", "error");
      return;
    }
    if (!requestReason.trim()) {
      showToast("Justification reason is required when requesting curriculum materials from QDS.", "error");
      return;
    }

    const res = trainerRequestMaterial(
      selectedTrainee.id,
      {
        materialTitle: requestTitle.trim(),
        category: requestCategory,
        reason: requestReason.trim(),
        priority: requestPriority
      },
      currentTrainerId
    );

    if (res.success) {
      setShowRequestMaterialModal(false);
      setRequestTitle("");
      setRequestReason("");
      setRequestPriority("Standard");
    }
  };

  const handleAccept = (traineeId: string) => {
    if (!reviewedMaterials) {
      showToast("Material review required: Trainer must explicitly confirm review of training materials before accepting responsibility.", "error");
      return;
    }
    trainerAcceptTrainee(traineeId, currentTrainerId, true);
  };

  const handleConfirmDecline = () => {
    if (!selectedTrainee || !declineReason.trim()) return;
    trainerDeclineTrainee(selectedTrainee.id, declineReason, currentTrainerId);
    setShowDeclineModal(false);
    setDeclineReason("");
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl border border-[#E6ECF2] shadow-xs p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#042C51] via-[#4B9DFE] to-[#FF5C28]" />
        
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#042C51]/5 border border-[#042C51]/10 flex items-center justify-center shrink-0">
            <GraduationCap className="w-6 h-6 text-[#042C51]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-[#042C51]">Trainer Module — Trainee Acceptance</h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#042C51]/10 text-[#042C51]">
                L&D Post-IT Endorsement Queue
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Confirm responsibility for incoming onboarding trainees after IT Kronos account provisioning. Operates in parallel with QDS & WFM.
            </p>
          </div>
        </div>

        {/* Active Trainer Selector (Prototype Mode) */}
        <div className="flex items-center gap-2 bg-[#F7F9FC] border border-[#E6ECF2] p-2 rounded-xl text-xs">
          <User className="w-4 h-4 text-[#FF5C28] shrink-0" />
          <div className="flex flex-col">
            <span className="text-[10px] text-slate-400 font-semibold uppercase">Simulated Trainer:</span>
            <select
              value={currentTrainerId}
              onChange={e => setCurrentTrainerId(e.target.value)}
              className="bg-transparent font-bold text-[#042C51] focus:outline-none cursor-pointer text-xs"
            >
              {TRAINER_ROSTER.map(t => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Info Callout */}
      <div className="p-3.5 bg-blue-50/70 border border-blue-200/80 rounded-xl text-xs text-[#0B365F] flex items-start gap-3">
        <Info className="w-4 h-4 text-[#4B9DFE] shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <strong className="font-bold text-[#042C51]">Post-IT Parallel Workflow Notice:</strong>{" "}
          Trainer acceptance confirms you have accepted responsibility for the trainee cohort. This operates asynchronously alongside QDS materials assignment and WFM seat assignment. HR cannot accept the final handoff until all three departments have completed their tasks.
        </div>
      </div>

      {/* Tabs */}
      {subTab === "queue" ? (
        /* Queue View */
        <div className="space-y-4">
          {/* Filters & Search */}
          <div className="bg-white rounded-2xl border border-[#E6ECF2] shadow-xs p-4 flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
              {/* Search */}
              <div className="relative min-w-[240px]">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search trainee name, Kronos ID, account..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-[#BECBDA] focus:border-[#FF5C28] focus:ring-1 focus:ring-[#FF5C28] outline-none text-xs"
                />
              </div>

              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="px-3 py-2 rounded-xl border border-[#BECBDA] bg-white text-[#042C51] font-medium outline-none text-xs"
              >
                <option value="All">All Statuses</option>
                <option value="Pending">Pending Acceptance</option>
                <option value="Accepted">Accepted</option>
                <option value="Unable to Accept">Unable to Accept</option>
              </select>

              {/* Trainer Filter */}
              <select
                value={activeTrainerFilter}
                onChange={e => setActiveTrainerFilter(e.target.value)}
                className="px-3 py-2 rounded-xl border border-[#BECBDA] bg-white text-[#042C51] font-medium outline-none text-xs"
              >
                <option value="All">All Trainers (Overview)</option>
                {TRAINER_ROSTER.map(t => (
                  <option key={t.id} value={t.name.split(" ")[0]}>{t.name}</option>
                ))}
              </select>
            </div>

            <div className="text-slate-500 font-medium shrink-0 self-end md:self-center">
              Showing <strong className="text-[#042C51] font-bold">{filteredApplicants.length}</strong> of {postITApplicants.length} post-IT trainees
            </div>
          </div>

          {/* Trainees Table */}
          <div className="bg-white rounded-2xl border border-[#E6ECF2] shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F7F9FC] border-b border-[#E6ECF2] text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-3 px-4">Trainee Full Name</th>
                    <th className="py-3 px-3">Applicant / Emp ID</th>
                    <th className="py-3 px-3">Dept / Account</th>
                    <th className="py-3 px-3">Position</th>
                    <th className="py-3 px-3">Official Kronos ID</th>
                    <th className="py-3 px-3">Assigned Trainer</th>
                    <th className="py-3 px-3">Assignment Date</th>
                    <th className="py-3 px-3">Acceptance Status</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-normal text-slate-700">
                  {filteredApplicants.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-8 text-center text-slate-400 italic">
                        No trainees match the current filters.
                      </td>
                    </tr>
                  ) : (
                    filteredApplicants.map(app => {
                      const isAccepted = app.trainerStatus === "Accepted";
                      const isUnable = app.trainerStatus === "Unable to Accept";
                      const isPending = !isAccepted && !isUnable;

                      return (
                        <tr key={app.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3 px-4">
                            <div className="font-bold text-[#042C51]">{app.fullName}</div>
                            <div className="text-[11px] text-slate-400">{app.email}</div>
                          </td>
                          <td className="py-3 px-3 font-mono font-medium text-slate-600">
                            {app.applicantNumber}
                          </td>
                          <td className="py-3 px-3">
                            <span className="font-semibold text-slate-800">{app.department}</span>
                            <span className="block text-[10px] text-slate-400">{app.account}</span>
                          </td>
                          <td className="py-3 px-3 text-slate-600">
                            {app.position}
                          </td>
                          <td className="py-3 px-3 font-mono font-bold text-purple-900">
                            {app.officialKronosId || "—"}
                          </td>
                          <td className="py-3 px-3">
                            <div className="font-semibold text-slate-800">
                              {app.assignedTrainerName || "Unassigned"}
                            </div>
                            {app.trainerAcceptedBy && isAccepted && (
                              <div className="text-[10px] text-green-700">
                                Accepted by {app.trainerAcceptedBy.split(" ")[0]}
                              </div>
                            )}
                          </td>
                          <td className="py-3 px-3 text-slate-500 text-[11px]">
                            {app.trainerAssignedAt || app.itCompletedAt || "—"}
                          </td>
                          <td className="py-3 px-3">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold inline-flex items-center gap-1 ${
                              isAccepted 
                                ? "bg-green-100 text-green-800" 
                                : isUnable
                                  ? "bg-red-100 text-red-800"
                                  : "bg-amber-100 text-amber-800"
                            }`}>
                              {isAccepted && <CheckCircle className="w-3 h-3 text-green-600" />}
                              {isUnable && <AlertTriangle className="w-3 h-3 text-red-600" />}
                              {isPending && <Clock className="w-3 h-3 text-amber-600" />}
                              {app.trainerStatus || "Pending Acceptance"}
                            </span>
                            {isUnable && app.trainerUnableReason && (
                              <div className="text-[10px] text-red-600 mt-0.5 max-w-[140px] truncate" title={app.trainerUnableReason}>
                                Reason: {app.trainerUnableReason}
                              </div>
                            )}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <button
                              onClick={() => handleOpenTrainee(app)}
                              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer inline-flex items-center gap-1 ${
                                isAccepted 
                                  ? "bg-slate-100 text-slate-700 hover:bg-slate-200" 
                                  : "bg-[#FF5C28] text-white hover:bg-[#e04f20] shadow-xs"
                              }`}
                            >
                              <span>{isAccepted ? "View Details" : "Review & Accept"}</span>
                              <ArrowRight className="w-3 h-3" />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        /* Trainee Acceptance Form / Detail View */
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <button
              onClick={() => onSubTabChange && onSubTabChange("queue")}
              className="px-3.5 py-1.5 rounded-xl border border-[#BECBDA] text-[#042C51] font-semibold text-xs hover:bg-[#F7F9FC] transition-colors cursor-pointer flex items-center gap-1.5"
            >
              ← Back to Trainee Queue
            </button>

            <div className="text-xs text-slate-500">
              Candidate: <strong className="text-[#042C51]">{selectedTrainee?.fullName}</strong> ({selectedTrainee?.applicantNumber})
            </div>
          </div>

          {selectedTrainee ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column: Read-Only Employee & IT Information */}
              <div className="lg:col-span-1 space-y-4">
                <div className="bg-white rounded-2xl border border-[#E6ECF2] shadow-xs p-5 space-y-4 text-xs">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <h3 className="font-bold text-[#042C51] uppercase text-[11px] tracking-wider">
                      Trainee Overview
                    </h3>
                    <span className="font-mono text-[10px] bg-slate-100 px-2 py-0.5 rounded text-slate-600">
                      {selectedTrainee.applicantNumber}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-[#042C51] to-[#1A4C7B] text-white font-bold text-base flex items-center justify-center shrink-0 shadow-xs">
                      {selectedTrainee.firstName.charAt(0)}{selectedTrainee.lastName.charAt(0)}
                    </div>
                    <div>
                      <h2 className="text-sm font-bold text-[#042C51]">{selectedTrainee.fullName}</h2>
                      <p className="text-slate-500 text-[11px]">{selectedTrainee.position}</p>
                      <p className="text-slate-400 text-[10px]">{selectedTrainee.reportingLocation}</p>
                    </div>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-slate-100">
                    <div className="flex justify-between py-1">
                      <span className="text-slate-400">Department:</span>
                      <span className="font-semibold text-slate-800">{selectedTrainee.department}</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-slate-400">Account:</span>
                      <span className="font-semibold text-slate-800">{selectedTrainee.account}</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-slate-400">Official Kronos ID:</span>
                      <span className="font-mono font-bold text-purple-900 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                        {selectedTrainee.officialKronosId || "Not assigned"}
                      </span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-slate-400">IT Provisioned:</span>
                      <span className="font-semibold text-green-700">
                        ✓ {selectedTrainee.itCompletedAt || "Completed"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Sequential Department Monitoring Card */}
                <div className="bg-[#F7F9FC] rounded-2xl border border-[#E6ECF2] p-5 space-y-3 text-xs">
                  <h4 className="font-bold text-[#042C51] uppercase text-[10px] tracking-wider">
                    Workflow Sequence Status
                  </h4>
                  <div className="space-y-2 text-[11px]">
                    <div className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-200">
                      <span className="font-semibold text-slate-700">1. QDS Materials & Trainer</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        selectedTrainee.qdsStatus === "Completed"
                          ? "bg-green-100 text-green-800"
                          : selectedTrainee.qdsStatus === "In Progress"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-slate-100 text-slate-700"
                      }`}>
                        {selectedTrainee.qdsStatus === "Completed" ? "✓ Dispatched" : selectedTrainee.qdsStatus || "Pending"} ({selectedTrainee.qdsMaterials?.length || 0} mats)
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-200">
                      <span className="font-semibold text-slate-700">2. Trainer Acceptance</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        selectedTrainee.trainerStatus === "Accepted"
                          ? "bg-green-100 text-green-800"
                          : selectedTrainee.trainerStatus === "Unable to Accept"
                            ? "bg-red-100 text-red-800"
                            : "bg-amber-100 text-amber-800"
                      }`}>
                        {selectedTrainee.trainerStatus || "Pending Acceptance"}
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-200">
                      <span className="font-semibold text-slate-700">3. WFM Seat Assignment</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        selectedTrainee.wfmStatus === "Assigned"
                          ? "bg-green-100 text-green-800"
                          : "bg-amber-100 text-amber-800"
                      }`}>
                        {selectedTrainee.wfmStatus === "Assigned" 
                          ? `${selectedTrainee.wfmProductionWing} - ${selectedTrainee.wfmSeatNumber}`
                          : "Pending WFM"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Trainer Acceptance Actions */}
              <div className="lg:col-span-2 space-y-5">
                <div className="bg-white rounded-2xl border border-[#E6ECF2] shadow-xs p-6 space-y-6">
                  <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                    <div>
                      <span className="text-[10px] font-bold text-[#FF5C28] uppercase tracking-wider block">
                        Trainee Responsibility Confirmation
                      </span>
                      <h2 className="text-base font-bold text-[#042C51] mt-0.5">
                        Acceptance Record & Roster Assignment
                      </h2>
                    </div>

                    <span className={`px-3 py-1 rounded-xl text-xs font-bold ${
                      selectedTrainee.trainerStatus === "Accepted"
                        ? "bg-green-100 text-green-800"
                        : selectedTrainee.trainerStatus === "Unable to Accept"
                          ? "bg-red-100 text-red-800"
                          : "bg-amber-100 text-amber-800"
                    }`}>
                      {selectedTrainee.trainerStatus || "Pending Acceptance"}
                    </span>
                  </div>

                  {/* Assigned Trainer Details */}
                  <div className="bg-[#F7F9FC] border border-[#E6ECF2] rounded-xl p-4 space-y-3 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-700">Assigned Primary Trainer:</span>
                      <span className="text-[11px] text-slate-500 font-medium">Assigned by QDS</span>
                    </div>

                    <div className="p-3 bg-white rounded-lg border border-slate-200 flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <UserCheck className="w-4 h-4 text-[#042C51]" />
                        <span className="font-bold text-[#042C51]">
                          {selectedTrainee.assignedTrainerName || currentTrainerName}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-400">
                        Assigned on: {selectedTrainee.trainerAssignedAt || selectedTrainee.itCompletedAt || simulatedCurrentDate}
                      </span>
                    </div>

                    {/* Notice if QDS has not dispatched materials yet */}
                    {selectedTrainee.trainerStatus !== "Accepted" && (selectedTrainee.qdsStatus !== "Completed" || (selectedTrainee.qdsMaterials?.length || 0) === 0) && (
                      <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-900 text-xs flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                        <div>
                          <strong>Awaiting QDS Curriculum Package:</strong> Quality Development Specialist (QDS) must assign training materials and dispatch to the trainer before you can review and accept responsibility.
                        </div>
                      </div>
                    )}

                    {/* Notice if logged-in trainer does not match assigned trainer */}
                    {selectedTrainee.assignedTrainerId && selectedTrainee.assignedTrainerId !== currentTrainerId && selectedTrainee.handoffStatus !== "Accepted" && (
                      <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-900 text-xs flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                        <div>
                          <strong>Trainer Assignment Identity Notice:</strong> You are currently viewing as <strong>{currentTrainerName}</strong> ({currentTrainerId}). This trainee is assigned to <strong>{selectedTrainee.assignedTrainerName}</strong> ({selectedTrainee.assignedTrainerId}). Only the assigned trainer may accept or decline responsibility.
                        </div>
                      </div>
                    )}

                    {selectedTrainee.trainerStatus === "Accepted" && (
                      <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-green-900 text-xs space-y-1">
                        <div className="flex items-center gap-2 font-bold">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          <span>Trainee Accepted & Cohort Responsibility Confirmed</span>
                        </div>
                        <div className="text-[11px] text-green-800">
                          Accepted by <strong>{selectedTrainee.trainerAcceptedBy}</strong> on {selectedTrainee.trainerAcceptedAt}. Next step: WFM Production Seat Assignment.
                        </div>
                      </div>
                    )}

                    {selectedTrainee.trainerStatus === "Unable to Accept" && (
                      <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-900 text-xs space-y-1">
                        <div className="flex items-center gap-2 font-bold">
                          <AlertTriangle className="w-4 h-4 text-red-600" />
                          <span>Trainer Recorded Unable to Accept Trainee</span>
                        </div>
                        <div className="text-[11px] text-red-800">
                          Reason: "{selectedTrainee.trainerUnableReason}". Trainee is pending reassignment by QDS.
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Training Materials Review & Request Section */}
                  <div className="bg-white border border-[#E6ECF2] rounded-2xl p-5 space-y-4 shadow-xs">
                    <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
                      <div>
                        <div className="flex items-center gap-2">
                          <BookOpen className="w-4 h-4 text-[#FF5C28]" />
                          <h3 className="font-bold text-[#042C51] text-xs uppercase tracking-wider">
                            Training Materials Package Review ({selectedTrainee.qdsMaterials?.length || 0})
                          </h3>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          Review training curriculum assigned by QDS before accepting cohort responsibility.
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        {/* Request Materials from QDS button */}
                        <button
                          type="button"
                          onClick={() => setShowRequestMaterialModal(true)}
                          className="px-3 py-1.5 rounded-xl border border-[#042C51] text-[#042C51] hover:bg-[#F7F9FC] font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5 text-[#FF5C28]" />
                          <span>Request Materials from QDS</span>
                        </button>

                        {/* Mark All Reviewed button */}
                        {selectedTrainee.qdsMaterials && selectedTrainee.qdsMaterials.length > 0 && selectedTrainee.trainerStatus !== "Accepted" && (
                          <button
                            type="button"
                            onClick={handleMarkAllMaterialsReviewed}
                            className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                          >
                            <CheckCircle className="w-3.5 h-3.5 text-green-600" />
                            <span>Mark All as Reviewed</span>
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Materials List */}
                    {!selectedTrainee.qdsMaterials || selectedTrainee.qdsMaterials.length === 0 ? (
                      <div className="p-6 border-2 border-dashed border-slate-200 rounded-xl text-center space-y-2">
                        <AlertTriangle className="w-6 h-6 text-amber-500 mx-auto" />
                        <h4 className="font-bold text-[#042C51] text-xs">No Training Materials Assigned Yet</h4>
                        <p className="text-[11px] text-slate-400 max-w-md mx-auto">
                          QDS has not yet assigned a training curriculum package for this trainee. You can click <strong>Request Materials from QDS</strong> above to submit a material request.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-2.5">
                        {selectedTrainee.qdsMaterials.map((mat) => {
                          const isReviewed = reviewedMaterialIds.includes(mat.id) || selectedTrainee.trainerStatus === "Accepted";
                          return (
                            <div
                              key={mat.id}
                              className={`p-3.5 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs ${
                                isReviewed
                                  ? "bg-green-50/40 border-green-200"
                                  : "bg-[#F7F9FC] border-slate-200"
                              }`}
                            >
                              <div className="flex items-start gap-3">
                                <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center shrink-0 mt-0.5">
                                  {mat.type === "Approved Training Resource Link" ? (
                                    <LinkIcon className="w-4 h-4 text-[#4B9DFE]" />
                                  ) : (
                                    <FileText className="w-4 h-4 text-[#FF5C28]" />
                                  )}
                                </div>

                                <div className="space-y-0.5">
                                  <div className="flex flex-wrap items-center gap-1.5">
                                    <span className="font-bold text-[#042C51] text-xs">{mat.title}</span>
                                    <span className="px-1.5 py-0.5 rounded text-[9.5px] font-semibold bg-white border border-slate-200 text-slate-600">
                                      {mat.type}
                                    </span>
                                    <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                                      mat.source === "Catalog"
                                        ? "bg-purple-100 text-purple-800"
                                        : "bg-blue-100 text-blue-800"
                                    }`}>
                                      {mat.source || "Catalog"}
                                    </span>
                                  </div>

                                  {mat.description && (
                                    <p className="text-[11px] text-slate-500 leading-tight">
                                      {mat.description}
                                    </p>
                                  )}

                                  <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono pt-0.5">
                                    <span>{mat.fileOrLinkRef}</span>
                                    <span>•</span>
                                    <span>Assigned by {mat.assignedBy}</span>
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                                {/* Preview Material Button */}
                                <button
                                  type="button"
                                  onClick={() => setPreviewMaterial(mat)}
                                  className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-[11px] flex items-center gap-1 cursor-pointer transition-colors"
                                >
                                  <Eye className="w-3.5 h-3.5 text-slate-500" />
                                  <span>Review / Preview</span>
                                </button>

                                {/* Per-item reviewed indicator / button */}
                                {selectedTrainee.trainerStatus !== "Accepted" && selectedTrainee.handoffStatus !== "Accepted" ? (
                                  <button
                                    type="button"
                                    onClick={() => handleToggleMaterialReview(mat.id)}
                                    className={`px-2.5 py-1.5 rounded-lg font-bold text-[11px] flex items-center gap-1 cursor-pointer transition-colors ${
                                      isReviewed
                                        ? "bg-green-100 text-green-800 border border-green-300"
                                        : "bg-white border border-slate-300 text-slate-600 hover:bg-slate-100"
                                    }`}
                                  >
                                    <Check className="w-3.5 h-3.5" />
                                    <span>{isReviewed ? "Reviewed" : "Mark Reviewed"}</span>
                                  </button>
                                ) : (
                                  <span className="px-2 py-1 rounded-lg bg-green-100 text-green-800 border border-green-200 text-[10.5px] font-bold flex items-center gap-1">
                                    <CheckCircle className="w-3.5 h-3.5 text-green-600" />
                                    <span>Reviewed</span>
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Materials Requested by Trainer from QDS Section */}
                    {selectedTrainee.trainerMaterialRequests && selectedTrainee.trainerMaterialRequests.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-slate-100 space-y-2.5">
                        <div className="flex items-center justify-between">
                          <h4 className="font-bold text-[#042C51] text-[11px] uppercase tracking-wider flex items-center gap-1.5">
                            <Send className="w-3.5 h-3.5 text-[#4B9DFE]" />
                            <span>Material Requests Sent to QDS ({selectedTrainee.trainerMaterialRequests.length})</span>
                          </h4>
                          <span className="text-[10px] text-slate-400">Live QDS synchronization</span>
                        </div>

                        <div className="space-y-2">
                          {selectedTrainee.trainerMaterialRequests.map((req) => (
                            <div
                              key={req.id}
                              className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                            >
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <span className="font-bold text-[#042C51]">{req.materialTitle}</span>
                                  <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                                    req.priority === "Urgent"
                                      ? "bg-red-100 text-red-800 border border-red-200"
                                      : "bg-blue-100 text-blue-800 border border-blue-200"
                                  }`}>
                                    {req.priority}
                                  </span>
                                  <span className="px-1.5 py-0.5 rounded text-[9px] bg-slate-200 text-slate-700">
                                    {req.category || "General"}
                                  </span>
                                </div>
                                <p className="text-[11px] text-slate-600 italic">
                                  "{req.reason}"
                                </p>
                                <div className="text-[10px] text-slate-400">
                                  Requested by {req.requestedByTrainerName} on {req.requestedAt}
                                </div>
                              </div>

                              <div>
                                {req.status === "Fulfilled" ? (
                                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-green-100 text-green-800 border border-green-200 inline-flex items-center gap-1">
                                    <CheckCircle className="w-3 h-3 text-green-600" />
                                    <span>Fulfilled by QDS ({req.fulfilledBy || "QDS"})</span>
                                  </span>
                                ) : (
                                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200 inline-flex items-center gap-1">
                                    <Clock className="w-3 h-3 text-amber-600" />
                                    <span>Pending QDS Fulfillment</span>
                                  </span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* 2-Week Based PST & FST Daily Schedule */}
                    <div className="mt-4 pt-4 border-t border-slate-100">
                      <div className="mb-2">
                        <h4 className="font-bold text-[#042C51] text-xs uppercase tracking-wider flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-[#FF5C28]" />
                          <span>2-Week PST &amp; FST Training Schedule Matrix</span>
                        </h4>
                        <p className="text-[11px] text-slate-500">
                          Click any day to inspect the curriculum materials assigned for that day and review designated trainer sessions.
                        </p>
                      </div>
                      <TwoWeekTrainingScheduleView
                        startDate={selectedTrainee.qdsAssignedScheduleDate || selectedTrainee.scheduledNhoDate || "2026-10-12"}
                        assignedTrainerId={selectedTrainee.assignedTrainerId}
                        assignedTrainerName={selectedTrainee.assignedTrainerName}
                        existingMaterials={selectedTrainee.qdsMaterials || []}
                        shiftHours={selectedTrainee.qdsShiftHours || "08:00 AM – 05:00 PM (Default)"}
                        trainingLocation={selectedTrainee.qdsTrainingLocation || "Fintech Training Room 4A"}
                        traineeName={selectedTrainee.fullName}
                      />
                    </div>
                  </div>



                  {/* Material Review Explicit Acknowledgment Checkbox */}
                  {selectedTrainee.trainerStatus !== "Accepted" && selectedTrainee.handoffStatus !== "Accepted" && (
                    <label className="flex items-start gap-3 p-3.5 rounded-xl bg-orange-50/60 border border-orange-200 cursor-pointer text-xs text-slate-800 hover:bg-orange-50 transition-colors">
                      <input
                        type="checkbox"
                        checked={reviewedMaterials}
                        onChange={e => setReviewedMaterials(e.target.checked)}
                        disabled={selectedTrainee.qdsStatus !== "Completed" || (selectedTrainee.qdsMaterials?.length || 0) === 0}
                        className="mt-0.5 w-4 h-4 rounded text-[#FF5C28] focus:ring-[#FF5C28]"
                      />
                      <span className="leading-relaxed">
                        <strong className="text-[#042C51]">Material Review Acknowledgment (Required):</strong> I explicitly acknowledge and confirm that I have reviewed the {selectedTrainee.qdsMaterials?.length || 0} curriculum items and training materials assigned by QDS for this trainee cohort before accepting responsibility.
                      </span>
                    </label>
                  )}

                  {/* Informational Guidance */}
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600 space-y-2">
                    <h4 className="font-bold text-slate-800">Operational Scope Note</h4>
                    <p className="leading-relaxed">
                      Accepting this trainee signals to HR Operations that Learning & Development is aware and prepared for the candidate's Day 1 training intake. This is strictly a handoff prerequisite and does not track daily attendance, assessment scores, or graduation metrics.
                    </p>
                  </div>

                  {/* Action Buttons */}
                  <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-end gap-3 text-xs">
                    {selectedTrainee.handoffStatus === "Accepted" || selectedTrainee.outcome === "Completed Handoff" ? (
                      <div className="flex flex-wrap items-center gap-3">
                        <div className="flex items-center gap-2 text-green-800 bg-green-50 px-4 py-2 rounded-xl border border-green-200 font-bold text-xs">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          <span>Handoff Formally Accepted by HR Operations — Milestone Locked</span>
                        </div>
                        <button
                          onClick={() => handleOpenJourney(selectedTrainee)}
                          className="px-4 py-2 rounded-xl bg-[#042C51] hover:bg-[#0B365F] text-white font-bold text-xs shadow-xs cursor-pointer flex items-center gap-1.5 transition-colors"
                        >
                          <Sparkles className="w-4 h-4 text-[#FF5C28]" />
                          <span>Open Nesting Journey (30/60/90)</span>
                        </button>
                      </div>
                    ) : selectedTrainee.trainerStatus !== "Accepted" ? (
                      <>
                        <button
                          onClick={() => setShowDeclineModal(true)}
                          className="px-4 py-2 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 font-semibold cursor-pointer transition-colors"
                        >
                          Unable to Accept Trainee
                        </button>

                        <button
                          onClick={() => handleAccept(selectedTrainee.id)}
                          disabled={!reviewedMaterials || selectedTrainee.qdsStatus !== "Completed" || (selectedTrainee.qdsMaterials?.length || 0) === 0}
                          className="px-6 py-2.5 rounded-xl bg-[#FF5C28] hover:bg-[#e04f20] disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold shadow-xs cursor-pointer transition-all flex items-center gap-2"
                        >
                          <CheckCircle className="w-4 h-4" />
                          <span>
                            {selectedTrainee.qdsStatus !== "Completed" || (selectedTrainee.qdsMaterials?.length || 0) === 0
                              ? "Awaiting QDS Materials Dispatch"
                              : "Accept Trainee Responsibility"}
                          </span>
                        </button>
                      </>
                    ) : (
                      <div className="flex items-center gap-3">
                        <span className="text-green-700 font-bold flex items-center gap-1.5 bg-green-50 px-3 py-1.5 rounded-xl border border-green-200">
                          <CheckCircle className="w-4 h-4" />
                          <span>Responsibility Accepted • Ready for Step 3: WFM Seating</span>
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center text-slate-400 bg-white rounded-2xl border border-slate-200">
              No applicant selected. Please return to queue.
            </div>
          )}
        </div>
      )}

      {/* Decline / Unable to Accept Modal */}
      {showDeclineModal && (
        <div className="fixed inset-0 z-50 bg-[#042C51]/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full border border-slate-200 shadow-xl p-6 space-y-4 text-xs">
            <div className="flex items-center gap-2 text-red-600 font-bold text-sm">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <span>Record Unable to Accept Trainee</span>
            </div>

            <p className="text-slate-600">
              Please specify why you are unable to accept responsibility for <strong>{selectedTrainee?.fullName}</strong>. The applicant will remain in the queue for reassignment to another authorized trainer.
            </p>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 block">
                Reason / Justification <span className="text-red-500">*</span>
              </label>
              <textarea
                value={declineReason}
                onChange={e => setDeclineReason(e.target.value)}
                rows={3}
                placeholder="e.g. Current training cohort at maximum capacity (25/25); schedule conflict with upcoming Advanced Batch; medical leave."
                className="w-full p-2.5 rounded-xl border border-slate-300 focus:border-[#FF5C28] focus:ring-1 focus:ring-[#FF5C28] outline-none text-xs"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => {
                  setShowDeclineModal(false);
                  setDeclineReason("");
                }}
                className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-medium cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDecline}
                disabled={!declineReason.trim()}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-bold cursor-pointer"
              >
                Confirm & Flag for Reassignment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Request Curriculum Material Modal */}
      {showRequestMaterialModal && selectedTrainee && (
        <div className="fixed inset-0 z-50 bg-[#042C51]/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-xl overflow-hidden text-xs">
            <div className="p-4 bg-[#042C51] text-white flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-sm">
                <Send className="w-4 h-4 text-[#FF5C28]" />
                <span>Request Curriculum Material from QDS</span>
              </div>
              <button
                onClick={() => setShowRequestMaterialModal(false)}
                className="text-slate-300 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSendMaterialRequest} className="p-5 space-y-4">
              <div className="p-3 bg-[#F7F9FC] border border-[#E6ECF2] rounded-xl space-y-1">
                <div className="text-[10px] uppercase font-bold text-slate-400">Target Trainee</div>
                <div className="font-bold text-[#042C51]">{selectedTrainee.fullName} ({selectedTrainee.applicantNumber})</div>
                <div className="text-[11px] text-slate-500">
                  {selectedTrainee.position} • {selectedTrainee.department} ({selectedTrainee.account})
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 block">
                  Material Title / Topic <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={requestTitle}
                  onChange={e => setRequestTitle(e.target.value)}
                  placeholder="e.g. Advanced Disputed Transaction Escalation Workflow 2026"
                  className="w-full px-3 py-2 rounded-xl border border-[#BECBDA] text-xs font-semibold text-[#042C51] focus:border-[#FF5C28] outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block">Category / Format</label>
                  <select
                    value={requestCategory}
                    onChange={e => setRequestCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#BECBDA] text-xs font-semibold text-[#042C51] bg-white focus:border-[#FF5C28] outline-none"
                  >
                    <option value="Operations Playbook">Operations Playbook (PDF)</option>
                    <option value="Customer Service Scripts">Customer Service Scripts (DOCX)</option>
                    <option value="Compliance & Regulatory Deck">Compliance & Regulatory Deck (PPTX)</option>
                    <option value="System Simulation Portal">System Simulation Portal (Link)</option>
                    <option value="Specialized Curriculum">Specialized Account Curriculum</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block">Urgency / Priority</label>
                  <div className="grid grid-cols-2 gap-2 pt-0.5">
                    {(["Standard", "Urgent"] as const).map(p => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setRequestPriority(p)}
                        className={`py-1.5 px-2 rounded-xl border text-center font-bold text-[11px] cursor-pointer transition-all ${
                          requestPriority === p
                            ? p === "Urgent"
                              ? "bg-red-500 text-white border-red-500 shadow-xs"
                              : "bg-[#042C51] text-white border-[#042C51] shadow-xs"
                            : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 block">
                  Justification / Specific Training Need <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={requestReason}
                  onChange={e => setRequestReason(e.target.value)}
                  rows={3}
                  placeholder="e.g. Account intake requires updated Tier 2 escalation script reflecting 2026 dispute procedures for fintech accounts before floor readiness."
                  className="w-full p-2.5 rounded-xl border border-[#BECBDA] text-xs focus:border-[#FF5C28] outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowRequestMaterialModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!requestTitle.trim() || !requestReason.trim()}
                  className="px-5 py-2 rounded-xl bg-[#FF5C28] hover:bg-[#e04f20] disabled:opacity-50 text-white font-bold cursor-pointer flex items-center gap-1.5 shadow-xs transition-colors"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Submit Request to QDS</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Preview Material Modal */}
      {previewMaterial && (
        <div className="fixed inset-0 z-50 bg-[#042C51]/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden text-xs flex flex-col max-h-[85vh]">
            {/* Modal Header */}
            <div className="p-4 bg-[#042C51] text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center">
                  {previewMaterial.type === "Approved Training Resource Link" ? (
                    <LinkIcon className="w-4 h-4 text-[#4B9DFE]" />
                  ) : (
                    <FileText className="w-4 h-4 text-[#FF5C28]" />
                  )}
                </div>
                <div>
                  <h3 className="font-bold text-sm leading-tight">{previewMaterial.title}</h3>
                  <div className="text-[10px] text-slate-300">
                    {previewMaterial.type} • Source: {previewMaterial.source || "Catalog"} • {previewMaterial.fileSize || "Standard File"}
                  </div>
                </div>
              </div>

              <button
                onClick={() => setPreviewMaterial(null)}
                className="text-slate-300 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body / Document Preview Simulator */}
            <div className="p-5 overflow-y-auto space-y-4 flex-1">
              <div className="p-3 bg-[#F7F9FC] border border-[#E6ECF2] rounded-xl flex items-center justify-between text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Resource Reference</span>
                  <span className="font-mono font-bold text-[#042C51] text-[11px]">{previewMaterial.fileOrLinkRef}</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Assigned Details</span>
                  <span className="text-slate-600 text-[11px]">{previewMaterial.assignedBy} • {previewMaterial.assignedAt}</span>
                </div>
              </div>

              {previewMaterial.description && (
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Curriculum Objectives</span>
                  <p className="text-slate-700 leading-relaxed text-xs">{previewMaterial.description}</p>
                </div>
              )}

              {/* Document Content Simulation Canvas */}
              <div className="border border-slate-200 rounded-xl bg-slate-900/5 p-6 min-h-[220px] flex flex-col items-center justify-center text-center space-y-3">
                {previewMaterial.type === "Approved Training Resource Link" ? (
                  <>
                    <div className="w-12 h-12 rounded-2xl bg-blue-100 border border-blue-300 flex items-center justify-center text-blue-700">
                      <ExternalLink className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-[#042C51] text-sm">Interactive Sandbox Environment</h4>
                      <p className="text-slate-500 text-[11px] max-w-sm mt-0.5 font-mono">
                        {previewMaterial.fileOrLinkRef}
                      </p>
                    </div>
                    <a
                      href={previewMaterial.fileOrLinkRef}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 rounded-xl bg-[#042C51] hover:bg-[#13406D] text-white font-bold text-xs inline-flex items-center gap-1.5 shadow-xs"
                    >
                      <span>Launch Interactive Simulation</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </>
                ) : (
                  <>
                    <div className="w-12 h-12 rounded-2xl bg-orange-100 border border-orange-300 flex items-center justify-center text-[#FF5C28]">
                      <FileText className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-[#042C51] text-sm">{previewMaterial.title}</h4>
                      <p className="text-slate-500 text-[11px] max-w-sm mt-0.5">
                        Document verified and signed by QDS Curriculum Operations. Compliant with SiBS Enterprise L&D Framework 2026.
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 rounded bg-slate-200 text-slate-700 font-mono text-[10px]">
                        24 Pages • Clean Checksum Verified
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
              <span className="text-[11px] text-slate-500">
                {reviewedMaterialIds.includes(previewMaterial.id) ? (
                  <span className="text-green-700 font-bold flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>You have marked this curriculum item as reviewed.</span>
                  </span>
                ) : (
                  <span>Marking as reviewed counts toward your trainee intake acknowledgment.</span>
                )}
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPreviewMaterial(null)}
                  className="px-4 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs cursor-pointer"
                >
                  Close Viewer
                </button>

                {!reviewedMaterialIds.includes(previewMaterial.id) && selectedTrainee.trainerStatus !== "Accepted" && (
                  <button
                    type="button"
                    onClick={() => {
                      handleToggleMaterialReview(previewMaterial.id);
                      setPreviewMaterial(null);
                      showToast(`Marked "${previewMaterial.title}" as reviewed!`, "success");
                    }}
                    className="px-4 py-2 rounded-xl bg-green-600 hover:bg-green-700 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
                  >
                    <Check className="w-4 h-4" />
                    <span>Acknowledge as Reviewed</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Employee Journey Drawer */}
      {drawerJourney && (
        <EmployeeJourneyDrawer
          journey={drawerJourney}
          isOpen={isJourneyDrawerOpen}
          onClose={() => setIsJourneyDrawerOpen(false)}
        />
      )}
    </div>
  );
}
