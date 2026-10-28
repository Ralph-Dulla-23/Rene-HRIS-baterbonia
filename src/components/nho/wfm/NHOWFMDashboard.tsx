import React, { useState } from "react";
import { useNHO } from "../NHOContext";
import { NHOApplicant, NHOProductionWing } from "../nhoTypes";
import { 
  Building2, 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  Search, 
  Filter, 
  Check, 
  MapPin, 
  ShieldCheck, 
  User, 
  Sparkles,
  ArrowRight,
  Info,
  Calendar,
  Layers
} from "lucide-react";

interface NHOWFMDashboardProps {
  subTab?: string;
  onSubTabChange?: (tab: string) => void;
}

export default function NHOWFMDashboard({ subTab = "queue", onSubTabChange }: NHOWFMDashboardProps) {
  const { 
    applicants, 
    activeApplicant, 
    setSelectedApplicantId, 
    wfmConfirmSeatAssignment,
    showToast 
  } = useNHO();

  const [selectedAppId, setSelectedAppId] = useState<string>(activeApplicant.id);
  const [selectedWing, setSelectedWing] = useState<NHOProductionWing>("Left Wing");
  const [seatNumberInput, setSeatNumberInput] = useState<string>("");
  const [remarksInput, setRemarksInput] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<"All" | "Pending" | "Assigned">("All");

  // Queue: applicants who have completed IT provisioning (or have reached WFM stage)
  const wfmQueue = applicants.filter(a => a.itRequestStatus === "Completed" && !!a.officialKronosId);
  const selectedApp = applicants.find(a => a.id === selectedAppId) || wfmQueue[0] || activeApplicant;

  const handleSelectApp = (app: NHOApplicant) => {
    setSelectedAppId(app.id);
    setSelectedApplicantId(app.id);
    setSelectedWing(app.wfmProductionWing || "Left Wing");
    setSeatNumberInput(app.wfmSeatNumber || "");
    setRemarksInput(app.wfmRemarks || "");
  };

  const handleConfirmAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedApp) return;

    const res = wfmConfirmSeatAssignment(
      selectedApp.id,
      selectedWing,
      seatNumberInput,
      remarksInput
    );

    if (res.success) {
      // Clear or keep populated
    }
  };

  // Filtered queue items
  const filteredQueue = wfmQueue.filter(app => {
    // Status filter
    if (statusFilter === "Pending" && app.wfmStatus === "Assigned") return false;
    if (statusFilter === "Assigned" && app.wfmStatus !== "Assigned") return false;

    // Search query
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      app.fullName.toLowerCase().includes(q) ||
      app.applicantNumber.toLowerCase().includes(q) ||
      (app.officialKronosId && app.officialKronosId.toLowerCase().includes(q)) ||
      app.department.toLowerCase().includes(q) ||
      app.account.toLowerCase().includes(q) ||
      (app.wfmSeatNumber && app.wfmSeatNumber.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6">
      {/* Keep WFM demo action without a redundant page heading. */}
      <div className="flex flex-wrap items-center justify-end gap-4">
        {/* Quick Demo Pre-fill shortcut for Juan Carlos */}
        {selectedApp && selectedApp.id === "nho-app-01" && (
          <button
            type="button"
            onClick={() => {
              setSelectedWing("Left Wing");
              setSeatNumberInput("LW-012");
              setRemarksInput("Standard Fintech shift workstation near Team Lead bay.");
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-orange-50 hover:bg-orange-100 text-[#FF5C28] border border-[#FF5C28]/30 font-bold text-xs transition-colors cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Walkthrough Preset (Left Wing / LW-012)</span>
          </button>
        )}
      </div>

      {/* Sequential Workflow Indicator Banner */}
      <div className="p-3 bg-[#F7F9FC] border border-[#E6ECF2] rounded-xl flex items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-bold text-[#042C51]">Workflow Progression:</span>
          <span className="flex items-center gap-1.5 font-semibold text-slate-600">
            <span className="px-2 py-0.5 rounded bg-slate-200 text-slate-700 text-[10px]">1. QDS (Materials & Trainer)</span>
            <span>→</span>
            <span className="px-2 py-0.5 rounded bg-slate-200 text-slate-700 text-[10px]">2. Trainer (Acceptance)</span>
            <span>→</span>
            <span className="px-2 py-0.5 rounded bg-[#FF5C28] text-white text-[10px] font-bold">3. WFM (Seat Assignment)</span>
          </span>
        </div>
        <div className="text-[11px] text-slate-500 hidden md:block">
          Complete QDS → Trainer → WFM sequence before HR handoff acceptance.
        </div>
      </div>

      {/* Main Grid: Queue on Left, Form on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Queue Table */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-[#E6ECF2] shadow-xs overflow-hidden flex flex-col">
          {/* Table Header & Controls */}
          <div className="p-4 border-b border-[#E6ECF2] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#042C51] uppercase tracking-wider">
                Production Seating Queue ({wfmQueue.length})
              </span>
              <span className="text-[11px] text-slate-500">
                Forwarded from IT ID Creation
              </span>
            </div>

            {/* Search & Filter */}
            <div className="flex flex-wrap items-center gap-2.5">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search candidate, SIBS ID, Kronos ID, or seat..."
                  className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:border-[#FF5C28]"
                />
              </div>

              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs">
                {(["All", "Pending", "Assigned"] as const).map(tab => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setStatusFilter(tab)}
                    className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-colors cursor-pointer ${
                      statusFilter === tab
                        ? "bg-white text-[#042C51] shadow-xs"
                        : "text-slate-500 hover:text-slate-900"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Table Content */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#F7F9FC] border-b border-[#E6ECF2] text-[#667085] uppercase tracking-wider text-[10px]">
                  <th className="py-2.5 px-3 font-semibold">Employee Name</th>
                  <th className="py-2.5 px-3 font-semibold">SIBS ID</th>
                  <th className="py-2.5 px-3 font-semibold">Department / Account</th>
                  <th className="py-2.5 px-3 font-semibold">Kronos ID</th>
                  <th className="py-2.5 px-3 font-semibold">Trainer Status</th>
                  <th className="py-2.5 px-3 font-semibold">Wing</th>
                  <th className="py-2.5 px-3 font-semibold">Workstation</th>
                  <th className="py-2.5 px-3 font-semibold">WFM Status</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E6ECF2]">
                {filteredQueue.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-slate-400 italic">
                      No candidates currently matching filter in WFM Seating Queue. Complete IT Kronos provisioning first.
                    </td>
                  </tr>
                ) : (
                  filteredQueue.map(app => {
                    const isSelected = app.id === selectedApp?.id;
                    const isAssigned = app.wfmStatus === "Assigned";

                    return (
                      <tr 
                        key={app.id}
                        className={`hover:bg-slate-50 transition-colors ${
                          isSelected ? "bg-orange-50/50" : ""
                        }`}
                      >
                        <td className="py-3 px-3">
                          <button
                            type="button"
                            onClick={() => handleSelectApp(app)}
                            className="font-bold text-[#042C51] hover:text-[#FF5C28] text-left cursor-pointer"
                          >
                            {app.fullName}
                          </button>
                        </td>
                        <td className="py-3 px-3 font-mono text-[11px] text-slate-600">
                          {app.applicantNumber}
                        </td>
                        <td className="py-3 px-3 text-slate-600">
                          <span className="block font-medium">{app.department}</span>
                          <span className="text-[10px] text-slate-400">{app.account}</span>
                        </td>
                        <td className="py-3 px-3">
                          <span className="font-mono font-bold text-purple-900 bg-purple-50 px-2 py-0.5 rounded border border-purple-200 text-[11px]">
                            {app.officialKronosId || "—"}
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          {app.trainerStatus === "Accepted" ? (
                            <span className="text-[10px] font-bold text-green-700 bg-green-50 px-2 py-0.5 rounded border border-green-200 inline-flex items-center gap-1">
                              <Check className="w-3 h-3 text-green-600" />
                              <span>Accepted</span>
                            </span>
                          ) : app.trainerStatus === "Unable to Accept" ? (
                            <span className="text-[10px] font-bold text-red-700 bg-red-50 px-2 py-0.5 rounded border border-red-200 inline-flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3 text-red-600" />
                              <span>Declined</span>
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 inline-flex items-center gap-1">
                              <Clock className="w-3 h-3 text-amber-600" />
                              <span>Awaiting Trainer</span>
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-3 text-slate-700 font-medium">
                          {app.wfmProductionWing || "—"}
                        </td>
                        <td className="py-3 px-3 font-mono font-bold text-slate-900">
                          {app.wfmSeatNumber || "—"}
                        </td>
                        <td className="py-3 px-3">
                          <span className={`px-2 py-0.5 rounded font-bold text-[10px] inline-flex items-center gap-1 ${
                            isAssigned
                              ? "bg-green-100 text-green-800"
                              : "bg-amber-100 text-amber-800"
                          }`}>
                            {isAssigned ? (
                              <>
                                <Check className="w-3 h-3" />
                                <span>Assigned</span>
                              </>
                            ) : (
                              <>
                                <Clock className="w-3 h-3" />
                                <span>Pending WFM</span>
                              </>
                            )}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right">
                          <button
                            type="button"
                            onClick={() => handleSelectApp(app)}
                            className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-colors cursor-pointer ${
                              isSelected
                                ? "bg-[#042C51] text-white"
                                : isAssigned
                                  ? "bg-slate-100 hover:bg-slate-200 text-slate-700"
                                  : "bg-[#FF5C28] hover:bg-[#e04f20] text-white shadow-xs"
                            }`}
                          >
                            {isAssigned ? "View / Edit" : "Assign Seat"}
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

        {/* Right Column: WFM Seat Assignment Form & Details */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-[#E6ECF2] shadow-xs overflow-hidden flex flex-col">
          <div className="p-4 bg-[#F7F9FC] border-b border-[#E6ECF2] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#FF5C28]" />
              <span className="font-bold text-[#042C51] text-xs uppercase tracking-wider">
                Production Floor Seat Assignment Form
              </span>
            </div>
            {selectedApp && (
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                selectedApp.wfmStatus === "Assigned"
                  ? "bg-green-100 text-green-800"
                  : "bg-amber-100 text-amber-800"
              }`}>
                {selectedApp.wfmStatus}
              </span>
            )}
          </div>

          {!selectedApp ? (
            <div className="p-8 text-center text-slate-400 italic text-xs">
              Select an endorsed candidate from the queue to assign a production workstation.
            </div>
          ) : (
            <form onSubmit={handleConfirmAssignment} className="p-6 space-y-5 text-xs flex-1 flex flex-col justify-between">
              <div className="space-y-5">
                {/* Read-Only Employee Identity */}
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Candidate / Employee</span>
                      <h3 className="text-sm font-bold text-[#042C51]">{selectedApp.fullName}</h3>
                    </div>
                    <span className="font-mono text-[11px] text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
                      {selectedApp.applicantNumber}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px] pt-1 border-t border-slate-200/80">
                    <div>
                      <span className="text-slate-400 block text-[10px]">Department:</span>
                      <span className="font-semibold text-slate-800">{selectedApp.department}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Account:</span>
                      <span className="font-semibold text-slate-800">{selectedApp.account}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Site Location:</span>
                      <span className="font-semibold text-slate-800">{selectedApp.reportingLocation}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Official Kronos ID:</span>
                      <span className="font-mono font-bold text-purple-900">{selectedApp.officialKronosId || "Pending IT"}</span>
                    </div>
                  </div>
                </div>

                {/* Validation Note */}
                {!selectedApp.officialKronosId && (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-950 text-xs flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <span>
                      IT account provisioning must be completed with an official Kronos ID before production workstation assignment.
                    </span>
                  </div>
                )}

                {/* Step 2 Prerequisites & Trainer Status Indicator */}
                {selectedApp.trainerStatus === "Accepted" ? (
                  <div className="p-3 bg-green-50 border border-green-200 rounded-xl text-green-900 text-xs flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600 shrink-0" />
                      <div>
                        <span className="font-bold">Step 2 Complete: Trainer Accepted</span>
                        <div className="text-[10.5px] text-green-800">
                          {selectedApp.trainerAcceptedBy || selectedApp.assignedTrainerName} accepted responsibility. Workstation allocation is active.
                        </div>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-green-200/80 text-green-800 font-bold text-[10px]">
                      Ready for Seating
                    </span>
                  </div>
                ) : (
                  <div className="p-3 bg-blue-50/80 border border-blue-200 rounded-xl text-blue-900 text-xs flex items-start gap-2">
                    <Info className="w-4 h-4 text-[#4B9DFE] shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold">Workflow Sequence (QDS → Trainer → WFM):</span>
                      <p className="text-[11px] text-blue-800 mt-0.5 leading-relaxed">
                        Trainer acceptance is currently pending ({selectedApp.assignedTrainerName || "Trainer Unassigned"}). You may pre-assign the workstation now; once Trainer accepts, the full post-IT handoff package will be ready for HR acceptance.
                      </p>
                    </div>
                  </div>
                )}

                {/* Field 1: Production Floor Wing */}
                <div className="space-y-1.5">
                  <label className="block font-bold text-[#042C51]">
                    Field 1 — Production Floor Wing <span className="text-red-500">*</span>
                  </label>
                  <p className="text-[11px] text-slate-500">
                    Select the designated production floor wing for this account.
                  </p>
                  <div className="grid grid-cols-2 gap-3 pt-1">
                    {(["Left Wing", "Right Wing"] as const).map(wing => (
                      <label
                        key={wing}
                        className={`flex items-center gap-2.5 p-3 rounded-xl border transition-all ${
                          selectedApp.handoffStatus === "Accepted" || selectedApp.outcome === "Completed Handoff"
                            ? "cursor-not-allowed opacity-70 bg-slate-50 border-slate-200"
                            : "cursor-pointer " + (selectedWing === wing
                                ? "bg-orange-50/70 border-[#FF5C28] text-[#042C51] font-bold shadow-xs"
                                : "bg-white border-slate-200 hover:bg-slate-50 text-slate-700")
                        }`}
                      >
                        <input
                          type="radio"
                          name="productionWing"
                          value={wing}
                          disabled={selectedApp.handoffStatus === "Accepted" || selectedApp.outcome === "Completed Handoff"}
                          checked={selectedWing === wing}
                          onChange={() => setSelectedWing(wing)}
                          className="accent-[#FF5C28]"
                        />
                        <span>{wing}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Field 2: Workstation Number */}
                <div className="space-y-1.5">
                  <label className="block font-bold text-[#042C51]">
                    Field 2 — Specific Seat / Workstation Number <span className="text-red-500">*</span>
                  </label>
                  <p className="text-[11px] text-slate-500">
                    Accepts standard seat identifiers such as 12, 105, LW-012, or RW-021. Whitespace is automatically trimmed.
                  </p>
                  <input
                    type="text"
                    required
                    disabled={selectedApp.handoffStatus === "Accepted" || selectedApp.outcome === "Completed Handoff"}
                    value={seatNumberInput}
                    onChange={e => setSeatNumberInput(e.target.value)}
                    placeholder="e.g. LW-012, RW-021, 105, 12"
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 font-mono focus:outline-none focus:border-[#FF5C28] focus:ring-1 focus:ring-[#FF5C28] disabled:bg-slate-100 disabled:text-slate-500"
                  />
                </div>

                {/* Correction Reason or Optional Remarks */}
                <div className="space-y-1.5">
                  <label className="block font-bold text-[#042C51]">
                    {selectedApp.wfmStatus === "Assigned" ? (
                      <>
                        Correction Reason / Reassignment Justification <span className="text-red-500">*</span>
                      </>
                    ) : (
                      <>
                        WFM Assignment Remarks <span className="text-slate-400 font-normal">(Optional)</span>
                      </>
                    )}
                  </label>
                  <textarea
                    rows={2}
                    value={remarksInput}
                    disabled={selectedApp.handoffStatus === "Accepted" || selectedApp.outcome === "Completed Handoff"}
                    onChange={e => setRemarksInput(e.target.value)}
                    placeholder={
                      selectedApp.wfmStatus === "Assigned"
                        ? "e.g. Ergonomic accommodation request, team seating reorganization, or equipment upgrade..."
                        : "e.g. Proximity to shift supervisor, dual-monitor pod, specialized headset station..."
                    }
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:border-[#FF5C28] focus:ring-1 focus:ring-[#FF5C28] disabled:bg-slate-100 disabled:text-slate-500"
                  />
                  {selectedApp.wfmStatus === "Assigned" && (
                    <p className="text-[10px] text-amber-700 font-medium">
                      Modifying an already assigned seat requires an audit justification reason before confirmation.
                    </p>
                  )}
                </div>

                {/* Existing Assignment Metadata if already assigned */}
                {selectedApp.wfmStatus === "Assigned" && selectedApp.wfmAssignedAt && (
                  <div className="p-3 bg-green-50 border border-green-200 rounded-xl text-green-950 text-[11px] space-y-1">
                    <div className="flex items-center gap-1.5 font-bold text-green-900">
                      <CheckCircle className="w-3.5 h-3.5 text-green-600" />
                      <span>Currently Assigned Workstation</span>
                    </div>
                    <div><strong>Assigned Wing:</strong> {selectedApp.wfmProductionWing}</div>
                    <div><strong>Workstation:</strong> <span className="font-mono font-bold">{selectedApp.wfmSeatNumber}</span></div>
                    <div><strong>Assigned By:</strong> {selectedApp.wfmAssignedBy}</div>
                    <div><strong>Timestamp:</strong> {selectedApp.wfmAssignedAt}</div>
                    {selectedApp.wfmRemarks && <div><strong>Remarks:</strong> {selectedApp.wfmRemarks}</div>}
                  </div>
                )}

                {/* Locked banner if accepted */}
                {(selectedApp.handoffStatus === "Accepted" || selectedApp.outcome === "Completed Handoff") && (
                  <div className="p-3 bg-green-50 border border-green-200 rounded-xl text-green-900 text-xs flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 shrink-0" />
                    <span>Handoff Formally Accepted by HR Operations — Production Seat is Locked & Immutably Preserved.</span>
                  </div>
                )}
              </div>

              {/* Submit Action */}
              <div className="pt-4 border-t border-slate-200 flex items-center justify-between gap-3">
                <span className="text-[10px] text-slate-400">
                  {selectedApp.handoffStatus === "Accepted" || selectedApp.outcome === "Completed Handoff"
                    ? "Production workstation assignment is finalized."
                    : "Submitting forwards handoff directly to HR Operations."}
                </span>

                {selectedApp.handoffStatus !== "Accepted" && selectedApp.outcome !== "Completed Handoff" && (
                  <button
                    type="submit"
                    disabled={!selectedApp.officialKronosId || !seatNumberInput.trim() || (selectedApp.wfmStatus === "Assigned" && !remarksInput.trim())}
                    className="px-5 py-2.5 rounded-xl bg-[#FF5C28] hover:bg-[#e04f20] disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-xs shadow-xs transition-colors cursor-pointer flex items-center gap-2"
                  >
                    <Check className="w-4 h-4" />
                    <span>{selectedApp.wfmStatus === "Assigned" ? "Save Workstation Reassignment" : "Confirm Assignment & Forward to HR"}</span>
                  </button>
                )}
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
