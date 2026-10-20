import React, { useState, useMemo } from "react";
import { useNHO } from "../NHOContext";
import { NHOApplicant } from "../nhoTypes";
import { 
  Users, 
  Calendar, 
  CheckCircle, 
  AlertCircle, 
  Clock, 
  Search, 
  Filter, 
  ChevronRight, 
  Sparkles, 
  FileCheck, 
  Server, 
  ShieldCheck, 
  ExternalLink,
  Phone,
  RotateCcw,
  UserX,
  Mail,
  Key
} from "lucide-react";
import NHOSendCredentialsModal from "./NHOSendCredentialsModal";

interface NHOTADashboardProps {
  onOpenAttendanceModal: (applicant: NHOApplicant) => void;
  onOpenDetails: (applicant: NHOApplicant, defaultTab?: string) => void;
  onOpenVerification: (applicant: NHOApplicant) => void;
  onOpenEndorsement: (applicant: NHOApplicant) => void;
}

export default function NHOTADashboard({
  onOpenAttendanceModal,
  onOpenDetails,
  onOpenVerification,
  onOpenEndorsement
}: NHOTADashboardProps) {
  const { applicants, setSelectedApplicantId, checkITEndorsementEligibility } = useNHO();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sendCredentialsApplicant, setSendCredentialsApplicant] = useState<NHOApplicant | null>(null);

  // KPI Calculations
  const metrics = useMemo(() => {
    const totalScheduled = applicants.length;
    const pendingAttendance = applicants.filter(a => a.attendance === "Pending").length;
    const pendingMajorVerification = applicants.filter(a => 
      a.attendance === "Show" && 
      a.documents.filter(d => d.isMajor && d.status === "Verified").length < 4
    ).length;
    const pendingOrientationOrAgreements = applicants.filter(a => 
      a.attendance === "Show" && 
      (a.orientationStatus !== "Completed" || a.documents.filter(d => d.isEssentialAgreement && d.status === "Verified").length < 3)
    ).length;
    const readyForIT = applicants.filter(a => !a.itEndorsed && checkITEndorsementEligibility(a).isEligible).length;
    const awaitingIT = applicants.filter(a => a.itEndorsed && a.itRequestStatus !== "Completed").length;
    const pendingHRAcceptance = applicants.filter(a => a.handoffStatus === "Pending HR Acceptance" || a.handoffStatus === "Resubmitted").length;

    return {
      totalScheduled,
      pendingAttendance,
      pendingMajorVerification,
      pendingOrientationOrAgreements,
      readyForIT,
      awaitingIT,
      pendingHRAcceptance
    };
  }, [applicants, checkITEndorsementEligibility]);

  // Filtered applicants
  const filteredApplicants = useMemo(() => {
    return applicants.filter(app => {
      const matchesSearch = 
        app.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.applicantNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.position.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.account.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchesSearch) return false;

      if (statusFilter === "ready_it") {
        return !app.itEndorsed && checkITEndorsementEligibility(app).isEligible;
      }
      if (statusFilter === "pending_attendance") {
        return app.attendance === "Pending";
      }
      if (statusFilter === "pending_majors") {
        return app.attendance === "Show" && app.documents.filter(d => d.isMajor && d.status === "Verified").length < 4;
      }
      if (statusFilter === "no_show") {
        return app.attendance === "No Show";
      }
      if (statusFilter === "awaiting_hr") {
        return app.handoffStatus === "Pending HR Acceptance" || app.handoffStatus === "Resubmitted";
      }
      return true;
    });
  }, [applicants, searchQuery, statusFilter, checkITEndorsementEligibility]);

  return (
    <div className="space-y-6">
      {/* Page Title & Scope Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-lg font-bold text-[#042C51] tracking-tight">
            TA New Hire Orientation (NHO) Management
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Monitor scheduled orientations, attendance, major requirements, agreements, and IT handoffs.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-semibold text-slate-500 bg-white border border-[#E6ECF2] px-3 py-1.5 rounded-xl shadow-xs">
            Simulated Session Date: <strong className="text-[#042C51]">Oct 09, 2026</strong>
          </span>
        </div>
      </div>

      {/* KPI Cards Row (7 distinct metrics without decorative fluff) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
        <div className="bg-white rounded-xl p-3 border border-[#E6ECF2] shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Scheduled
          </span>
          <div className="text-lg font-black text-[#042C51] mt-1">{metrics.totalScheduled}</div>
          <span className="text-[10px] text-slate-500">Active cohort</span>
        </div>

        <div className="bg-white rounded-xl p-3 border border-[#E6ECF2] shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Pending Attendance
          </span>
          <div className="text-lg font-black text-amber-600 mt-1">{metrics.pendingAttendance}</div>
          <span className="text-[10px] text-slate-500">Awaiting arrival</span>
        </div>

        <div className="bg-white rounded-xl p-3 border border-[#E6ECF2] shadow-xs">
          <span className="text-[10px] font-bold text-[#FF5C28] uppercase tracking-wider block">
            Pending Majors
          </span>
          <div className="text-lg font-black text-[#FF5C28] mt-1">{metrics.pendingMajorVerification}</div>
          <span className="text-[10px] text-slate-500">Self-upload/audit</span>
        </div>

        <div className="bg-white rounded-xl p-3 border border-[#E6ECF2] shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Pending Contracts
          </span>
          <div className="text-lg font-black text-slate-700 mt-1">{metrics.pendingOrientationOrAgreements}</div>
          <span className="text-[10px] text-slate-500">Portal in progress</span>
        </div>

        <div className="bg-white rounded-xl p-3 border-2 border-emerald-500/40 shadow-xs bg-emerald-50/20">
          <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider block">
            Ready for IT
          </span>
          <div className="text-lg font-black text-emerald-700 mt-1">{metrics.readyForIT}</div>
          <span className="text-[10px] text-emerald-600 font-medium">9/9 criteria met</span>
        </div>

        <div className="bg-white rounded-xl p-3 border border-[#E6ECF2] shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Awaiting IT
          </span>
          <div className="text-lg font-black text-blue-600 mt-1">{metrics.awaitingIT}</div>
          <span className="text-[10px] text-slate-500">In provisioning</span>
        </div>

        <div className="bg-white rounded-xl p-3 border border-[#E6ECF2] shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Awaiting HR
          </span>
          <div className="text-lg font-black text-purple-600 mt-1">{metrics.pendingHRAcceptance}</div>
          <span className="text-[10px] text-slate-500">Handoff review</span>
        </div>
      </div>

      {/* Applicant Table & Controls */}
      <div className="bg-white rounded-xl border border-[#E6ECF2] shadow-xs overflow-hidden">
        {/* Table Filter Toolbar */}
        <div className="p-4 border-b border-[#E6ECF2] flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3 flex-1 min-w-[280px]">
            <div className="relative flex-1 max-w-sm">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search candidate name, ID, position, account..."
                className="w-full pl-9 pr-3 py-1.5 bg-[#F7F9FC] border border-[#E6ECF2] rounded-xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#042C51]"
              />
            </div>

            <div className="flex items-center gap-1.5 text-xs">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="bg-[#F7F9FC] border border-[#E6ECF2] rounded-xl px-2.5 py-1.5 text-xs font-semibold text-slate-700 focus:outline-none"
              >
                <option value="all">All Statuses ({applicants.length})</option>
                <option value="ready_it">Ready for IT Endorsement ({metrics.readyForIT})</option>
                <option value="pending_attendance">Pending Attendance ({metrics.pendingAttendance})</option>
                <option value="pending_majors">Pending Majors ({metrics.pendingMajorVerification})</option>
                <option value="no_show">No Show</option>
                <option value="awaiting_hr">Awaiting HR Acceptance ({metrics.pendingHRAcceptance})</option>
              </select>
            </div>
          </div>

          <div className="text-xs text-slate-500">
            Showing <strong className="text-[#042C51]">{filteredApplicants.length}</strong> applicants
          </div>
        </div>

        {/* Dense Responsive Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#F7F9FC] border-b border-[#E6ECF2] text-slate-500 font-bold text-[11px] uppercase tracking-wider">
                <th className="py-3 px-4">Applicant</th>
                <th className="py-3 px-3">Position & Account</th>
                <th className="py-3 px-3">NHO Date</th>
                <th className="py-3 px-3">Attendance</th>
                <th className="py-3 px-3">4 Majors</th>
                <th className="py-3 px-3">Orientation</th>
                <th className="py-3 px-3">3 Agreements</th>
                <th className="py-3 px-3">IT Endorsement</th>
                <th className="py-3 px-3">Handoff</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E6ECF2] text-slate-700">
              {filteredApplicants.map(app => {
                const verifiedMajorsCount = app.documents.filter(d => d.isMajor && d.status === "Verified").length;
                const verifiedAgreementsCount = app.documents.filter(d => d.isEssentialAgreement && d.status === "Verified").length;
                const { isEligible } = checkITEndorsementEligibility(app);

                return (
                  <tr 
                    key={app.id} 
                    className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                    onClick={() => {
                      setSelectedApplicantId(app.id);
                      onOpenDetails(app);
                    }}
                  >
                    {/* Applicant Identity */}
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-[#042C51] group-hover:text-[#FF5C28] transition-colors">
                        {app.fullName}
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono">
                        {app.applicantNumber} • {app.cluster}
                      </div>
                    </td>

                    {/* Position */}
                    <td className="py-3.5 px-3">
                      <div className="font-medium text-slate-800">{app.position}</div>
                      <div className="text-[11px] text-slate-500">{app.account}</div>
                    </td>

                    {/* NHO Date */}
                    <td className="py-3.5 px-3">
                      <div className="font-semibold text-slate-800">{app.scheduledNhoDate}</div>
                      <div className="text-[10px] text-slate-400">
                        Notice: {app.invitationSentDate}
                      </div>
                    </td>

                    {/* TA can tag or correct attendance directly from every applicant row. */}
                    <td className="py-3.5 px-3" onClick={e => e.stopPropagation()}>
                      <div className="flex flex-col items-start gap-1.5 min-w-[108px]">
                        <span className={`px-2 py-0.5 rounded font-bold text-[10px] inline-block ${
                          app.attendance === "Show"
                            ? "bg-green-100 text-green-800"
                            : app.attendance === "No Show"
                              ? "bg-red-100 text-red-800"
                              : "bg-amber-100 text-amber-800"
                        }`}>
                          {app.attendance}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedApplicantId(app.id);
                            onOpenAttendanceModal(app);
                          }}
                          className={`rounded-lg border px-2.5 py-1 font-bold text-[10px] transition-colors cursor-pointer ${
                            app.attendance === "Pending"
                              ? "border-[#FF5C28] bg-[#FF5C28] text-white hover:bg-[#e04f20]"
                              : "border-[#BECBDA] bg-white text-[#042C51] hover:bg-[#F7F9FC]"
                          }`}
                          aria-label={`${app.attendance === "Pending" ? "Tag" : "Edit"} NHO attendance for ${app.fullName}`}
                          title={app.attendance === "Pending" ? "Record Show or No Show" : "Update attendance (correction reason required)"}
                        >
                          {app.attendance === "Pending" ? "Tag Attendance" : "Edit Attendance"}
                        </button>
                      </div>
                    </td>

                    {/* 4 Majors */}
                    <td className="py-3.5 px-3">
                      <div className="flex items-center gap-1.5">
                        <span className={`w-2 h-2 rounded-full ${
                          verifiedMajorsCount === 4 ? "bg-green-500" : "bg-amber-500"
                        }`} />
                        <span className="font-bold text-slate-700">
                          {verifiedMajorsCount}/4
                        </span>
                        <span className="text-[10px] text-slate-400">
                          ({app.physicalClearance})
                        </span>
                      </div>
                    </td>

                    {/* Orientation */}
                    <td className="py-3.5 px-3">
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                        app.orientationStatus === "Completed"
                          ? "bg-green-500/10 text-green-700"
                          : app.orientationStatus === "In Progress"
                            ? "bg-blue-500/10 text-blue-700"
                            : "bg-slate-100 text-slate-600"
                      }`}>
                        {app.orientationStatus}
                      </span>
                    </td>

                    {/* 3 Essential Agreements */}
                    <td className="py-3.5 px-3">
                      <div className="flex items-center gap-1.5">
                        <span className={`w-2 h-2 rounded-full ${
                          verifiedAgreementsCount === 3 ? "bg-green-500" : "bg-amber-500"
                        }`} />
                        <span className="font-bold text-slate-700">
                          {verifiedAgreementsCount}/3
                        </span>
                      </div>
                    </td>

                    {/* IT Endorsement */}
                    <td className="py-3.5 px-3">
                      {app.itEndorsed ? (
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          app.itRequestStatus === "Completed"
                            ? "bg-purple-100 text-purple-800"
                            : "bg-blue-100 text-blue-800"
                        }`}>
                          {app.itRequestStatus === "Completed" ? `Kronos ID: ${app.officialKronosId}` : "Endorsed (IT Queue)"}
                        </span>
                      ) : isEligible ? (
                        <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                          Ready to Endorse
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-400 font-medium">
                          Incomplete
                        </span>
                      )}
                    </td>

                    {/* Handoff */}
                    <td className="py-3.5 px-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        app.handoffStatus === "Accepted"
                          ? "bg-green-100 text-green-800"
                          : app.handoffStatus === "Returned for Correction"
                            ? "bg-red-100 text-red-800"
                            : app.handoffStatus === "Pending HR Acceptance" || app.handoffStatus === "Resubmitted"
                              ? "bg-purple-100 text-purple-800"
                              : "text-slate-400"
                      }`}>
                        {app.handoffStatus === "Not Ready" ? "—" : app.handoffStatus}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right" onClick={e => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1.5">
                        {app.attendance === "Show" && !isEligible && (
                          <button
                            onClick={() => {
                              setSelectedApplicantId(app.id);
                              onOpenDetails(app, "majors");
                            }}
                            className="px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-[#042C51] font-semibold text-[11px] border border-blue-200 transition-colors cursor-pointer"
                          >
                            Review Docs ({verifiedMajorsCount}/4)
                          </button>
                        )}

                        {app.attendance === "No Show" && (
                          <button
                            onClick={() => {
                              setSelectedApplicantId(app.id);
                              onOpenAttendanceModal(app);
                            }}
                            className="px-2.5 py-1 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold text-[11px] transition-colors cursor-pointer"
                          >
                            Follow-Up / Reschedule
                          </button>
                        )}

                        {!app.itEndorsed && isEligible && (
                          <button
                            onClick={() => {
                              setSelectedApplicantId(app.id);
                              onOpenEndorsement(app);
                            }}
                            className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] transition-colors cursor-pointer"
                          >
                            Endorse to IT
                          </button>
                        )}

                        {app.attendance === "Show" && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedApplicantId(app.id);
                              setSendCredentialsApplicant(app);
                            }}
                            className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-[#042C51] hover:text-white text-[#042C51] font-semibold text-[11px] border border-[#E6ECF2] transition-colors cursor-pointer flex items-center gap-1"
                            title="Re-send Temporary Access Link & Credentials (Show only)"
                          >
                            <Mail className="w-3.5 h-3.5 text-[#FF5C28]" />
                            <span>Send Access Link</span>
                          </button>
                        )}

                        <button
                          onClick={() => {
                            setSelectedApplicantId(app.id);
                            onOpenDetails(app);
                          }}
                          className="p-1 text-slate-400 hover:text-[#042C51] transition-colors"
                          title="View Full NHO Details"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {sendCredentialsApplicant && (
        <NHOSendCredentialsModal
          applicant={sendCredentialsApplicant}
          isOpen={!!sendCredentialsApplicant}
          onClose={() => setSendCredentialsApplicant(null)}
        />
      )}
    </div>
  );
}
