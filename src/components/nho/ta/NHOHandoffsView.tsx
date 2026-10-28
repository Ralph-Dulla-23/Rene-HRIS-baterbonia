import React from "react";
import { useNHO } from "../NHOContext";
import { NHOApplicant } from "../nhoTypes";
import { 
  ShieldCheck, 
  RotateCcw, 
  CheckCircle, 
  AlertTriangle, 
  Clock, 
  FileText, 
  ExternalLink,
  ChevronRight,
  ArrowRight
} from "lucide-react";

interface NHOHandoffsViewProps {
  onOpenApplicantDetails: (app: NHOApplicant) => void;
}

export default function NHOHandoffsView({ onOpenApplicantDetails }: NHOHandoffsViewProps) {
  const { applicants, setSelectedApplicantId, taResubmitHandoff } = useNHO();
  const [resubmittingId, setResubmittingId] = React.useState<string | null>(null);
  const [resolutionRemarks, setResolutionRemarks] = React.useState<string>("");

  const handoffApplicants = applicants.filter(a => a.itRequestStatus === "Completed" || a.handoffStatus !== "Not Ready");
  const pendingCount = handoffApplicants.filter(a => a.handoffStatus === "Pending HR Acceptance" || a.handoffStatus === "Resubmitted").length;
  const acceptedCount = handoffApplicants.filter(a => a.handoffStatus === "Accepted").length;
  const correctionCount = handoffApplicants.filter(a => a.handoffStatus === "Returned for Correction").length;

  const handleConfirmResubmit = (appId: string) => {
    if (!resolutionRemarks.trim()) {
      return;
    }
    taResubmitHandoff(appId, resolutionRemarks.trim());
    setResubmittingId(null);
    setResolutionRemarks("");
  };

  return (
    <div className="min-w-0 space-y-5">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
        {[
          { label: "In Handoff Pipeline", value: handoffApplicants.length, note: "IT-completed or handed off", icon: FileText, tone: "text-blue-600", background: "bg-blue-50 border-blue-100" },
          { label: "Awaiting HR", value: pendingCount, note: "Pending review / resubmitted", icon: Clock, tone: "text-amber-600", background: "bg-amber-50 border-amber-100" },
          { label: "Accepted", value: acceptedCount, note: "HR handoff completed", icon: CheckCircle, tone: "text-emerald-600", background: "bg-emerald-50 border-emerald-100" },
          { label: "Needs Correction", value: correctionCount, note: "Returned for follow-up", icon: AlertTriangle, tone: "text-red-600", background: "bg-red-50 border-red-100" }
        ].map(card => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className="flex min-h-[86px] sm:min-h-[92px] flex-col justify-between rounded-xl border border-[#E6ECF2] bg-white p-3 shadow-xs transition-all hover:shadow-sm"
            >
              <div className="flex items-center justify-between gap-1.5">
                <span className={`text-[10px] font-black uppercase tracking-wider ${card.tone} truncate`}>
                  {card.label}
                </span>
                <div className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border ${card.background} ${card.tone}`}>
                  <Icon className="h-3.5 w-3.5" />
                </div>
              </div>
              <div className="mt-1">
                <div className="text-xl sm:text-2xl font-black tabular-nums tracking-tight text-[#042C51]">
                  {card.value}
                </div>
                <div className="mt-0.5 text-[10.5px] font-medium text-slate-500 truncate" title={card.note}>
                  {card.note}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <section className="min-w-0 rounded-xl border border-[#E6ECF2] bg-white p-4 shadow-sm sm:p-5">
        <div className="mb-4">
          <h2 className="text-base font-bold tracking-tight text-[#042C51]">Handoff Records</h2>
          <p className="mt-0.5 text-xs font-medium text-slate-500">Track prepared HR handoffs, Trainer and QDS confirmation, WFM seating and outstanding corrections.</p>
        </div>
        <div className="overflow-hidden rounded-xl border border-[#E6ECF2] bg-white">
          <div className="flex items-center justify-between gap-2 border-b border-[#E6ECF2] px-4 pt-2">
            <span className="flex items-center gap-2 border-b-2 border-[#FF5C28] px-1 pb-3 pt-1 text-xs font-extrabold text-[#FF5C28]">
              <ShieldCheck className="h-3.5 w-3.5" /> HANDOFFS
              <span className="rounded-full bg-[#042C51] px-2 py-0.5 text-[10px] font-black text-white">{handoffApplicants.length}</span>
            </span>
            <span className="pb-2 text-[11px] font-medium text-slate-500">{handoffApplicants.length} records</span>
          </div>

        <div className="divide-y divide-[#E6ECF2] text-xs">
          {handoffApplicants.length === 0 ? (
            <div className="p-8 text-center text-slate-400 italic">
              No applicants currently in the HR Handoff stage. Once IT provisions Kronos IDs, handoffs appear here.
            </div>
          ) : (
            handoffApplicants.map(app => (
              <div key={app.id} className="p-4 hover:bg-slate-50/80 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-[#042C51] text-sm">{app.fullName}</span>
                    <span className="font-mono text-[10px] text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                      {app.applicantNumber}
                    </span>
                    <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                      app.handoffStatus === "Accepted"
                        ? "bg-green-100 text-green-800"
                        : app.handoffStatus === "Returned for Correction"
                          ? "bg-red-100 text-red-800"
                          : "bg-purple-100 text-purple-800"
                    }`}>
                      {app.handoffStatus}
                    </span>
                  </div>

                  <div className="text-[11px] text-slate-500 flex flex-wrap items-center gap-2.5">
                    <span>Kronos: <strong className="text-slate-700 font-mono">{app.officialKronosId || "—"}</strong></span>
                    <span>•</span>
                    <span>Trainer: <strong className={app.trainerStatus === "Accepted" ? "text-green-700" : "text-slate-700"}>{app.trainerStatus || "Pending"}</strong></span>
                    <span>•</span>
                    <span>QDS: <strong className={app.qdsStatus === "Completed" ? "text-green-700" : "text-slate-700"}>{app.qdsStatus || "Pending"}</strong></span>
                    <span>•</span>
                    <span>WFM: <strong className={app.wfmStatus === "Assigned" ? "text-green-700" : "text-slate-700"}>{app.wfmSeatNumber ? `${app.wfmProductionWing || ""} (${app.wfmSeatNumber})` : (app.wfmStatus || "Pending")}</strong></span>
                    <span>•</span>
                    <span>Deadline: {app.nonMajorDeadlineDate}</span>
                  </div>

                  {/* If Returned for Correction, highlight HR remarks */}
                  {app.handoffStatus === "Returned for Correction" && app.handoffCorrectionRemarks && (
                    <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-xl text-red-950 text-xs">
                      <strong className="block font-bold text-red-800 mb-0.5">HR Return Note:</strong>
                      <span>{app.handoffCorrectionRemarks}</span>
                    </div>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2 shrink-0">
                  {app.handoffStatus === "Returned for Correction" && (
                    resubmittingId === app.id ? (
                      <div className="flex flex-col gap-1.5 p-2 bg-slate-50 border border-slate-200 rounded-xl">
                        <input
                          type="text"
                          value={resolutionRemarks}
                          onChange={e => setResolutionRemarks(e.target.value)}
                          placeholder="Documented resolution note for HR..."
                          className="px-2.5 py-1 text-xs border border-slate-300 rounded-lg focus:outline-none w-56"
                        />
                        <div className="flex items-center gap-1.5 justify-end">
                          <button
                            type="button"
                            onClick={() => { setResubmittingId(null); setResolutionRemarks(""); }}
                            className="px-2 py-0.5 text-[11px] text-slate-500 hover:text-slate-700"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            disabled={!resolutionRemarks.trim()}
                            onClick={() => handleConfirmResubmit(app.id)}
                            className="px-2.5 py-1 rounded-lg bg-[#FF5C28] hover:bg-[#e04f20] disabled:opacity-50 text-white font-bold text-[11px]"
                          >
                            Confirm Resubmit
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => { setResubmittingId(app.id); setResolutionRemarks(""); }}
                        className="px-3.5 py-1.5 rounded-xl bg-[#FF5C28] hover:bg-[#e04f20] text-white font-bold text-xs shadow-xs cursor-pointer flex items-center gap-1.5"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Resubmit Handoff to HR</span>
                      </button>
                    )
                  )}

                  <button
                    onClick={() => {
                      setSelectedApplicantId(app.id);
                      onOpenApplicantDetails(app);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer"
                  >
                    View Details
                  </button>
                </div>
              </div>
            ))
          )}
          </div>
        </div>
      </section>
    </div>
  );
}
