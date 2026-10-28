import React, { useState } from "react";
import { useNHO } from "../NHOContext";
import { NHOApplicant } from "../nhoTypes";
import { 
  Server, 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  Edit3, 
  UserCheck, 
  Search, 
  Filter,
  Check,
  ShieldCheck,
  Lock
} from "lucide-react";

interface NHOITDashboardProps {
  subTab?: string;
  onSubTabChange?: (tab: string) => void;
}

export default function NHOITDashboard({ subTab = "queue", onSubTabChange }: NHOITDashboardProps) {
  const { 
    applicants, 
    activeApplicant, 
    setSelectedApplicantId, 
    itStartProcessing, 
    itUpdatePermittedFields, 
    itCompleteProvisioning,
    showToast 
  } = useNHO();

  const [selectedAppId, setSelectedAppId] = useState<string>(activeApplicant.id);
  const [kronosInput, setKronosInput] = useState("");
  const [isEditingFields, setIsEditingFields] = useState(false);
  const [editedFields, setEditedFields] = useState({
    proposedUsername: "",
    displayName: "",
    dept: "",
    remarks: ""
  });
  const [fieldEditReason, setFieldEditReason] = useState("");

  const itQueue = applicants.filter(a => a.itEndorsed);
  const selectedApp = applicants.find(a => a.id === selectedAppId) || itQueue[0] || activeApplicant;

  const handleSelectApp = (app: NHOApplicant) => {
    setSelectedAppId(app.id);
    setSelectedApplicantId(app.id);
    setKronosInput(app.officialKronosId || `KRN-9${app.applicantNumber.slice(-4)}`);
    setEditedFields({
      proposedUsername: app.proposedKronosUsername,
      displayName: app.kronosDisplayName,
      dept: app.assignedDepartment,
      remarks: app.itProvisioningRemarks || ""
    });
    setIsEditingFields(false);
  };

  const handleStartProcessing = () => {
    itStartProcessing(selectedApp.id);
  };

  const handleSavePermittedUpdates = () => {
    if (!fieldEditReason.trim()) {
      showToast("Please provide a reason for editing account provisioning fields.", "error");
      return;
    }
    itUpdatePermittedFields(selectedApp.id, editedFields, fieldEditReason);
    setIsEditingFields(false);
    setFieldEditReason("");
  };

  const handleComplete = () => {
    const res = itCompleteProvisioning(selectedApp.id, kronosInput);
    if (res.success) {
      setIsEditingFields(false);
    }
  };

  return (
    <div className="space-y-6">


      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Requests Queue List */}
        <div className="lg:col-span-1 bg-white rounded-2xl border border-[#E6ECF2] shadow-xs overflow-hidden flex flex-col">
          <div className="p-4 border-b border-[#E6ECF2] flex items-center justify-between">
            <span className="text-xs font-bold text-[#042C51] uppercase tracking-wider">
              Endorsed Requests ({itQueue.length})
            </span>
            <span className="text-[10px] text-slate-400">Queue from TA</span>
          </div>

          <div className="divide-y divide-[#E6ECF2] overflow-y-auto max-h-[600px] text-xs">
            {itQueue.length === 0 ? (
              <div className="p-8 text-center text-slate-400 italic">
                No active ID Creation Requests in the IT Queue. Endorse candidates from TA first.
              </div>
            ) : (
              itQueue.map(app => {
                const isSelected = app.id === selectedApp.id;
                return (
                  <button
                    key={app.id}
                    onClick={() => handleSelectApp(app)}
                    className={`w-full text-left p-4 hover:bg-slate-50 transition-colors cursor-pointer flex flex-col gap-1.5 ${
                      isSelected ? "bg-orange-50/70 border-l-4 border-[#FF5C28]" : ""
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[#042C51] text-xs">{app.fullName}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        app.itRequestStatus === "Completed"
                          ? "bg-green-100 text-green-800"
                          : app.itRequestStatus === "In Progress"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-amber-100 text-amber-800"
                      }`}>
                        {app.itRequestStatus}
                      </span>
                    </div>

                    <div className="text-[11px] text-slate-500">
                      {app.position} • {app.department}
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
                      <span>Endorsed: {app.itEndorsedAt?.split(" ")[0]}</span>
                      {app.officialKronosId && (
                        <span className="font-mono font-bold text-slate-700">ID: {app.officialKronosId}</span>
                      )}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: ID Creation Request Details & Provisioning Form */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-[#E6ECF2] shadow-xs p-6 space-y-6 text-xs">
            {/* Header info */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[#E6ECF2]">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold text-[#042C51]">
                    {selectedApp.fullName}
                  </h2>
                  <span className="text-xs font-mono text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                    {selectedApp.applicantNumber}
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    selectedApp.itRequestStatus === "Completed"
                      ? "bg-green-100 text-green-800"
                      : selectedApp.itRequestStatus === "In Progress"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-amber-100 text-amber-800"
                  }`}>
                    {selectedApp.itRequestStatus}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  {selectedApp.position} • {selectedApp.department} ({selectedApp.account})
                </p>
              </div>

              <div className="flex items-center gap-2">
                {selectedApp.itRequestStatus === "Pending" && (
                  <button
                    onClick={handleStartProcessing}
                    className="px-3.5 py-1.5 rounded-xl bg-[#042C51] hover:bg-[#0B365F] text-white font-bold text-xs cursor-pointer shadow-xs"
                  >
                    Start Processing
                  </button>
                )}
              </div>
            </div>

            {/* Non-Editable Authoritative HRIS Identity Banner */}
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
              <div className="flex items-center gap-1.5 text-slate-600 font-bold text-[11px]">
                <Lock className="w-3.5 h-3.5 text-slate-400" />
                <span>Authoritative HRIS Identity Records (Read-Only for IT):</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px] text-slate-600 pt-1">
                <div>Legal Name: <strong>{selectedApp.fullName}</strong></div>
                <div>Account: <strong>{selectedApp.account}</strong></div>
                <div>Venue: <strong>{selectedApp.reportingLocation.split(",")[0]}</strong></div>
              </div>
            </div>

            {/* Permitted Editable Provisioning Fields */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-bold text-[#042C51] text-xs uppercase tracking-wider">
                  Permitted Account Provisioning Fields:
                </span>
                {!isEditingFields && selectedApp.itRequestStatus !== "Completed" && (
                  <button
                    onClick={() => {
                      setEditedFields({
                        proposedUsername: selectedApp.proposedKronosUsername,
                        displayName: selectedApp.kronosDisplayName,
                        dept: selectedApp.assignedDepartment,
                        remarks: selectedApp.itProvisioningRemarks || ""
                      });
                      setIsEditingFields(true);
                    }}
                    className="text-xs font-bold text-[#FF5C28] hover:text-[#e04f20] flex items-center gap-1 cursor-pointer"
                  >
                    <Edit3 className="w-3 h-3" />
                    <span>Edit Permitted Fields</span>
                  </button>
                )}
              </div>

              {isEditingFields ? (
                <div className="p-4 bg-[#F7F9FC] border border-[#E6ECF2] rounded-xl space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-bold text-slate-600 block mb-1">Proposed Kronos Username</label>
                      <input
                        type="text"
                        value={editedFields.proposedUsername}
                        onChange={e => setEditedFields(prev => ({ ...prev, proposedUsername: e.target.value }))}
                        className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-slate-600 block mb-1">Kronos Display Name</label>
                      <input
                        type="text"
                        value={editedFields.displayName}
                        onChange={e => setEditedFields(prev => ({ ...prev, displayName: e.target.value }))}
                        className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">Provisioning Remarks</label>
                    <input
                      type="text"
                      value={editedFields.remarks}
                      onChange={e => setEditedFields(prev => ({ ...prev, remarks: e.target.value }))}
                      className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">Mandatory Reason for Editing</label>
                    <input
                      type="text"
                      value={fieldEditReason}
                      onChange={e => setFieldEditReason(e.target.value)}
                      placeholder="e.g. Standard username collision resolution, standardized display convention..."
                      className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      onClick={() => setIsEditingFields(false)}
                      className="px-3 py-1.5 rounded-lg text-slate-600 hover:bg-slate-200"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSavePermittedUpdates}
                      className="px-4 py-1.5 rounded-lg bg-[#042C51] text-white font-bold"
                    >
                      Save Provisioning Updates
                    </button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3 bg-[#F7F9FC] rounded-xl border border-[#E6ECF2]">
                    <span className="text-[10px] text-slate-400 block font-bold">Proposed Username</span>
                    <span className="font-mono font-bold text-slate-800 text-xs block mt-1">{selectedApp.proposedKronosUsername}</span>
                  </div>
                  <div className="p-3 bg-[#F7F9FC] rounded-xl border border-[#E6ECF2]">
                    <span className="text-[10px] text-slate-400 block font-bold">Kronos Display Name</span>
                    <span className="font-bold text-slate-800 text-xs block mt-1">{selectedApp.kronosDisplayName}</span>
                  </div>
                  <div className="p-3 bg-[#F7F9FC] rounded-xl border border-[#E6ECF2]">
                    <span className="text-[10px] text-slate-400 block font-bold">Assigned Department</span>
                    <span className="font-bold text-slate-800 text-xs block mt-1">{selectedApp.assignedDepartment}</span>
                  </div>
                  <div className="p-3 bg-[#F7F9FC] rounded-xl border border-[#E6ECF2]">
                    <span className="text-[10px] text-slate-400 block font-bold">Provisioning Remarks</span>
                    <span className="text-slate-700 text-xs block mt-1">{selectedApp.itProvisioningRemarks || "Standard profile"}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Manual Kronos Account Creation Recording Form */}
            <div className="p-5 bg-purple-50/70 border border-purple-200 rounded-2xl space-y-3">
              <div>
                <span className="text-xs font-bold text-purple-950 uppercase tracking-wider block">
                  Manual Kronos ID Recording (Phase 9)
                </span>
                <p className="text-[11px] text-purple-900 mt-0.5">
                  The Kronos account is manually generated by IT in the external Kronos console. Record the official unique Kronos ID here. The system validates uniqueness against all existing employees.
                </p>
              </div>

              {/* Terminal status warning */}
              {(selectedApp.outcome === "Withdrawn" || selectedApp.outcome === "Drop-Off") && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-950 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                  <span><strong>Case Closed / {selectedApp.outcome}:</strong> Candidate has been withdrawn or dropped off. Outstanding IT provisioning is flagged for cancellation and cannot be marked completed.</span>
                </div>
              )}

              <div className="flex flex-col sm:flex-row sm:items-center gap-3 pt-2">
                <div className="flex-1">
                  <label className="text-[11px] font-bold text-purple-950 block mb-1">
                    Official Kronos ID:
                  </label>
                  <input
                    type="text"
                    value={kronosInput}
                    onChange={e => setKronosInput(e.target.value)}
                    placeholder="e.g. KRN-90841..."
                    disabled={selectedApp.itRequestStatus === "Completed" || selectedApp.outcome === "Withdrawn" || selectedApp.outcome === "Drop-Off"}
                    className="w-full p-2.5 bg-white border border-purple-300 rounded-xl text-xs font-mono font-bold text-purple-950 focus:outline-none disabled:opacity-50"
                  />
                </div>

                {selectedApp.itRequestStatus !== "Completed" ? (
                  <button
                    onClick={handleComplete}
                    disabled={selectedApp.outcome === "Withdrawn" || selectedApp.outcome === "Drop-Off"}
                    className="px-5 py-2.5 rounded-xl bg-purple-700 hover:bg-purple-800 disabled:opacity-40 text-white font-bold text-xs shadow-xs cursor-pointer disabled:cursor-not-allowed flex items-center justify-center gap-2 self-end sm:self-auto mt-2 sm:mt-5"
                  >
                    <Check className="w-4 h-4" />
                    <span>Mark Completed & Submit Handoff</span>
                  </button>
                ) : (
                  <div className="flex items-center gap-1.5 text-xs font-bold text-purple-800 bg-purple-100 px-3 py-2 rounded-xl mt-5">
                    <CheckCircle className="w-4 h-4 text-purple-700" />
                    <span>Provisioning Complete ({selectedApp.officialKronosId})</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
