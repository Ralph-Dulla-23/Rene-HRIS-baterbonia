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

  const summaryCards = [
    { label: "Scheduled", value: metrics.totalScheduled, subtitle: "Active orientation cohort", icon: Users, tone: "blue" },
    { label: "Pending Attendance", value: metrics.pendingAttendance, subtitle: "Awaiting attendance tagging", icon: Clock, tone: "amber" },
    { label: "Pending Majors", value: metrics.pendingMajorVerification, subtitle: "Physical document clearance", icon: FileCheck, tone: "orange" },
    { label: "Pending Orientation / Agreements", value: metrics.pendingOrientationOrAgreements, subtitle: "Applicant portal requirements", icon: AlertCircle, tone: "amber" },
    { label: "Ready for IT", value: metrics.readyForIT, subtitle: "Eligibility criteria completed", icon: CheckCircle, tone: "green" },
    { label: "Awaiting IT", value: metrics.awaitingIT, subtitle: "Kronos ID provisioning", icon: Server, tone: "blue" },
    { label: "Awaiting HR", value: metrics.pendingHRAcceptance, subtitle: "Final handoff review", icon: ShieldCheck, tone: "purple" }
  ] as const;

  const tones = {
    blue: { label: "text-slate-700", background: "bg-blue-50 border-blue-100", icon: "text-blue-600" },
    amber: { label: "text-amber-700", background: "bg-amber-50 border-amber-100", icon: "text-amber-600" },
    orange: { label: "text-[#FF5C28]", background: "bg-orange-50 border-orange-100", icon: "text-[#FF5C28]" },
    green: { label: "text-emerald-700", background: "bg-emerald-50 border-emerald-100", icon: "text-emerald-600" },
    purple: { label: "text-violet-700", background: "bg-violet-50 border-violet-100", icon: "text-violet-600" }
  } as const;

  return (
    <div className="min-w-0 space-y-5">
      {/* Standard HRIS metric cards: identical card proportions and icon treatment to Employee Directory. */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {summaryCards.map(card => {
          const Icon = card.icon;
          const tone = tones[card.tone];
          return (
            <div key={card.label} className="flex min-h-[126px] items-center justify-between gap-3 rounded-xl border border-[#E6ECF2] bg-white p-5 shadow-xs transition-shadow hover:shadow-sm">
              <div className="min-w-0">
                <div className={`text-[11px] font-extrabold uppercase tracking-wider ${tone.label}`}>{card.label}</div>
                <div className="mt-1.5 text-3xl font-black tracking-tight text-[#042C51]">{card.value}</div>
                <div className="mt-1 text-xs font-medium text-slate-500">{card.subtitle}</div>
              </div>
              <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full border ${tone.background} ${tone.icon}`}>
                <Icon className="h-5 w-5" />
              </div>
            </div>
          );
        })}
      </div>

      {/* HRIS Employee Records-style container: section title, labeled filters, inset tab and table. */}
      <section className="min-w-0 space-y-4 rounded-xl border border-[#E6ECF2] bg-white p-4 shadow-xs sm:p-5">
        <div>
          <h2 className="text-base font-bold tracking-tight text-[#042C51]">NHO Applicant Records</h2>
          <p className="mt-0.5 text-xs font-medium text-slate-500">Review orientation schedules, attendance, document verification and handoff progress.</p>
        </div>
        <div className="grid grid-cols-1 items-end gap-3 md:grid-cols-12">
          <label className="space-y-1 md:col-span-8">
            <span className="block text-xs font-semibold text-slate-700">Search</span>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="search"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search by candidate name, applicant ID, position, or account..."
                className="w-full rounded-xl border border-[#E6ECF2] bg-white py-2.5 pl-9 pr-3 text-xs text-[#042C51] placeholder:text-slate-400 focus:border-[#FF5C28] focus:outline-none focus:ring-1 focus:ring-[#FF5C28]"
              />
            </div>
          </label>
          <label className="space-y-1 md:col-span-4">
            <span className="block text-xs font-semibold text-slate-700">Status</span>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="w-full rounded-xl border border-[#E6ECF2] bg-white px-3 py-2.5 text-xs font-semibold text-[#042C51] focus:border-[#FF5C28] focus:outline-none focus:ring-1 focus:ring-[#FF5C28]"
            >
              <option value="all">All Statuses ({applicants.length})</option>
              <option value="ready_it">Ready for IT Endorsement ({metrics.readyForIT})</option>
              <option value="pending_attendance">Pending Attendance ({metrics.pendingAttendance})</option>
              <option value="pending_majors">Pending Majors ({metrics.pendingMajorVerification})</option>
              <option value="no_show">No Show</option>
              <option value="awaiting_hr">Awaiting HR Acceptance ({metrics.pendingHRAcceptance})</option>
            </select>
          </label>
        </div>

        <div className="min-w-0 overflow-hidden rounded-xl border border-[#E6ECF2] bg-white">
          <div className="flex items-center justify-between gap-2 border-b border-[#E6ECF2] px-4 pt-2">
            <div className="flex items-center gap-2 border-b-2 border-[#FF5C28] px-1 pb-3 pt-1 text-xs font-extrabold text-[#FF5C28]">
              <Users className="h-3.5 w-3.5" />
              APPLICANTS
              <span className="rounded-full bg-[#042C51] px-2 py-0.5 text-[10px] font-black text-white">{filteredApplicants.length}</span>
            </div>
            <span className="pb-2 text-[11px] font-medium text-slate-500">{filteredApplicants.length} of {applicants.length} records</span>
          </div>

        {/* Dense Responsive Data Table */}
        <div className="min-w-0 overflow-x-auto">
          <table className="w-full min-w-[1340px] border-collapse text-left text-xs">
            <thead>
              <tr className="border-b border-[#E6ECF2] bg-slate-50/70 text-[11px] font-black uppercase tracking-wider text-slate-500">
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
                    className="group cursor-pointer transition-colors hover:bg-slate-50/70"
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
                            className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-[11px] font-semibold text-[#042C51] transition-colors hover:bg-blue-100"
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
                            className="rounded-lg bg-red-600 px-3 py-2 text-[11px] font-bold text-white transition-colors hover:bg-red-700"
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
                            className="rounded-lg bg-emerald-600 px-3 py-2 text-[11px] font-bold text-white transition-colors hover:bg-emerald-700"
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
                            className="flex items-center gap-1 rounded-lg border border-[#E6ECF2] bg-slate-50 px-3 py-2 text-[11px] font-semibold text-[#042C51] transition-colors hover:border-[#FF5C28]"
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
              {filteredApplicants.length === 0 && (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-xs font-medium text-slate-500">
                    No applicants match the selected filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          </div>
        </div>
      </section>

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
