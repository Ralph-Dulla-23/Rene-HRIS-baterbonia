import React, { useState, useMemo, useEffect } from "react";
import {
  AlertTriangle,
  Trash2,
  X,
  ShieldAlert,
  Briefcase,
  MapPin,
  Users,
  Archive,
  CheckCircle2,
  AlertCircle,
  FileText,
  Building2,
  Lock,
  ArrowRight
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { JobDescriptionRecord } from "./JobDescriptionPage";

export interface LinkedPosition {
  id: string;
  title: string;
  department: string;
  account: string;
  location: string;
  headcount: number;
  status: "Active Hiring" | "Intake Open" | "Pending Intake" | "In Review";
  hiringType: "Ramp-Up" | "Replacement" | "Expansion" | "New Role";
}

interface DeleteJobDescriptionModalProps {
  isOpen: boolean;
  jd: JobDescriptionRecord | null;
  onClose: () => void;
  onConfirmDelete: (jd: JobDescriptionRecord) => void;
  onArchiveInstead?: (jd: JobDescriptionRecord) => void;
}

// Sample positions mapped across departments and accounts
const KNOWN_POSITION_DATABASE: Record<string, LinkedPosition[]> = {
  "JD-2026-001": [
    {
      id: "POS-VRZ-001",
      title: "Customer Support Specialist (Tier 1 Voice)",
      department: "Technical Support",
      account: "Verizon Tech",
      location: "Tagum Site",
      headcount: 25,
      status: "Active Hiring",
      hiringType: "Ramp-Up"
    },
    {
      id: "REQ-2026-089",
      title: "Customer Support Specialist (Chat/Email)",
      department: "Technical Support",
      account: "Verizon Tech",
      location: "Davao Site",
      headcount: 15,
      status: "Intake Open",
      hiringType: "Expansion"
    }
  ],
  "JD-2026-002": [
    {
      id: "POS-CMC-004",
      title: "Technical Support Team Lead",
      department: "Operations",
      account: "Comcast Support",
      location: "Davao Site",
      headcount: 2,
      status: "Active Hiring",
      hiringType: "Replacement"
    },
    {
      id: "REQ-2026-094",
      title: "Tier-2 Escalations Shift Supervisor",
      department: "Operations",
      account: "Comcast Support",
      location: "Tagum Site",
      headcount: 1,
      status: "In Review",
      hiringType: "Replacement"
    }
  ],
  "JD-2026-003": [
    {
      id: "REQ-2026-102",
      title: "DevOps & Cloud Infrastructure Engineer",
      department: "Executive Tech",
      account: "Internal HR Ops",
      location: "Tagum Site",
      headcount: 1,
      status: "Active Hiring",
      hiringType: "New Role"
    }
  ],
  "JD-2026-004": [
    {
      id: "POS-AET-011",
      title: "Healthcare Billing Representative (Claims)",
      department: "Healthcare Ops",
      account: "Aetna Health",
      location: "Tagum Site",
      headcount: 18,
      status: "Active Hiring",
      hiringType: "Expansion"
    },
    {
      id: "REQ-2026-071",
      title: "Healthcare Verification Specialist",
      department: "Healthcare Ops",
      account: "Aetna Health",
      location: "Mabini Site",
      headcount: 8,
      status: "Intake Open",
      hiringType: "Ramp-Up"
    }
  ]
};

export default function DeleteJobDescriptionModal({
  isOpen,
  jd,
  onClose,
  onConfirmDelete,
  onArchiveInstead
}: DeleteJobDescriptionModalProps) {
  const [typedConfirmation, setTypedConfirmation] = useState("");
  const [confirmPermanent, setConfirmPermanent] = useState(false);
  const [confirmDependencies, setConfirmDependencies] = useState(false);

  // Reset state when modal opens/closes or JD changes
  useEffect(() => {
    if (isOpen) {
      setTypedConfirmation("");
      setConfirmPermanent(false);
      setConfirmDependencies(false);
    }
  }, [isOpen, jd]);

  // Compute linked available positions for this JD
  const linkedPositions = useMemo<LinkedPosition[]>(() => {
    if (!jd) return [];

    // Check if known positions exist for this ID
    if (KNOWN_POSITION_DATABASE[jd.id]) {
      return KNOWN_POSITION_DATABASE[jd.id];
    }

    // Dynamic fallback generation based on linkedHiringNeed & role
    const fallbackList: LinkedPosition[] = [];
    if (jd.linkedHiringNeed && jd.linkedHiringNeed !== "None / Unlinked") {
      fallbackList.push({
        id: jd.linkedHiringNeed.split(" ")[0] || `POS-${jd.id.replace("JD-", "")}`,
        title: jd.roleTitle,
        department: jd.department,
        account: jd.account,
        location: "Tagum / Davao Site",
        headcount: jd.linkedHiringNeed.includes("Agent") || jd.linkedHiringNeed.includes("Agents")
          ? parseInt(jd.linkedHiringNeed.match(/\d+/)?.[0] || "10", 10)
          : 5,
        status: "Active Hiring",
        hiringType: "Ramp-Up"
      });
    } else {
      fallbackList.push({
        id: `POS-${jd.id.replace("JD-", "")}-01`,
        title: jd.roleTitle,
        department: jd.department,
        account: jd.account,
        location: "Tagum Site",
        headcount: 6,
        status: "Active Hiring",
        hiringType: "Expansion"
      });
    }

    return fallbackList;
  }, [jd]);

  if (!isOpen || !jd) return null;

  // Strict validation rules:
  // User must type either "DELETE" or the exact JD code (case-insensitive)
  const isTextConfirmed =
    typedConfirmation.trim().toUpperCase() === "DELETE" ||
    typedConfirmation.trim().toUpperCase() === jd.id.toUpperCase();

  const isFormValid = isTextConfirmed && confirmPermanent && confirmDependencies;

  const totalLinkedHeadcount = linkedPositions.reduce((acc, pos) => acc + pos.headcount, 0);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#042C51]/85 backdrop-blur-sm overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 12 }}
          transition={{ duration: 0.2 }}
          className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-red-200 my-8 overflow-hidden text-[#101828]"
        >
          {/* ==================== MODAL HEADER (STRICT WARNING) ==================== */}
          <div className="bg-gradient-to-r from-red-600 via-red-600 to-rose-700 text-white p-5 sm:p-6 flex items-start justify-between border-b border-red-700">
            <div className="flex items-start gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-white/20 border border-white/30 text-white flex items-center justify-center shrink-0 shadow-xs">
                <ShieldAlert className="w-6 h-6 text-white animate-pulse" />
              </div>
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-red-950/40 border border-red-400/40 text-[10px] font-black uppercase tracking-wider text-red-100">
                  <AlertTriangle className="w-3 h-3 text-amber-300" />
                  <span>Strict Deletion Safeguard</span>
                </div>
                <h2 className="text-lg sm:text-xl font-black text-white tracking-tight leading-tight">
                  Permanent Job Description Deletion
                </h2>
                <p className="text-xs text-red-100 font-medium">
                  Review linked available positions and verify safety confirmation before proceeding.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-red-100 hover:text-white transition-all cursor-pointer shrink-0"
              title="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* ==================== MODAL BODY ==================== */}
          <div className="p-5 sm:p-6 space-y-5 max-h-[72vh] overflow-y-auto">
            {/* 1. TARGET JOB DESCRIPTION SPEC CARD */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Target Job Description Record
                  </span>
                  <h3 className="text-sm sm:text-base font-black text-[#042C51] flex items-center gap-2">
                    <span>{jd.roleTitle}</span>
                    <span className="text-xs font-mono font-bold text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
                      {jd.id}
                    </span>
                    <span className="text-[11px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                      {jd.versionNo}
                    </span>
                  </h3>
                </div>
                <span className="text-xs font-bold text-slate-600 bg-white px-2.5 py-1 rounded-lg border border-slate-200">
                  {jd.department}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600 pt-2 border-t border-slate-200/80">
                <div>
                  <strong className="text-slate-700">Account:</strong> {jd.account}
                </div>
                <div>
                  <strong className="text-slate-700">Linked Req:</strong> {jd.linkedHiringNeed}
                </div>
              </div>
            </div>

            {/* 2. LINKED AVAILABLE POSITIONS SECTION */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-[#FF5C28]" />
                  <h4 className="text-xs sm:text-sm font-black text-[#042C51] uppercase tracking-wide">
                    Linked Available Positions & Requisitions
                  </h4>
                </div>
                <span className="text-[11px] font-black text-red-700 bg-red-50 border border-red-200 px-2.5 py-0.5 rounded-full">
                  {linkedPositions.length} Position{linkedPositions.length === 1 ? "" : "s"} ({totalLinkedHeadcount} Total Open Slots)
                </span>
              </div>

              {linkedPositions.length > 0 ? (
                <div className="space-y-2.5">
                  <div className="p-3 bg-red-50/80 border border-red-200 rounded-xl text-xs text-red-900 leading-relaxed flex items-start gap-2.5">
                    <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                    <div>
                      <strong>Active Hiring Dependency Alert:</strong> Deleting this Job Description will unlink the official competency matrix and operating guidelines for the following active positions. Active candidates in screening or interview stages will lose reference to this specification.
                    </div>
                  </div>

                  <div className="divide-y divide-slate-100 rounded-xl border border-slate-200 overflow-hidden bg-white shadow-2xs">
                    {linkedPositions.map((pos) => (
                      <div key={pos.id} className="p-3.5 hover:bg-slate-50/80 transition-colors space-y-1.5">
                        <div className="flex items-start justify-between gap-2">
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-mono text-xs font-bold text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded">
                                {pos.id}
                              </span>
                              <span className="font-black text-xs text-[#042C51]">
                                {pos.title}
                              </span>
                              <span className="text-[10px] font-bold text-purple-700 bg-purple-50 border border-purple-200 px-2 py-0.5 rounded-full">
                                {pos.hiringType}
                              </span>
                            </div>
                            <div className="text-[11px] text-slate-500 flex items-center gap-3">
                              <span className="flex items-center gap-1">
                                <Building2 className="w-3 h-3 text-slate-400" />
                                {pos.department} • {pos.account}
                              </span>
                              <span className="flex items-center gap-1">
                                <MapPin className="w-3 h-3 text-slate-400" />
                                {pos.location}
                              </span>
                            </div>
                          </div>

                          <div className="text-right shrink-0">
                            <span className="inline-flex items-center gap-1 text-[11px] font-black text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg">
                              <Users className="w-3 h-3 text-emerald-600" />
                              {pos.headcount} Open Slots
                            </span>
                            <span className="block text-[9px] text-slate-400 font-semibold mt-0.5">
                              {pos.status}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-center text-xs text-slate-500">
                  No active hiring positions are currently linked directly to this Job Description ID.
                </div>
              )}
            </div>

            {/* 3. SAFE ALTERNATIVE PROMOTION (ARCHIVE INSTEAD) */}
            {onArchiveInstead && !jd.isArchived && (
              <div className="p-3.5 bg-amber-50/70 border border-amber-200 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5 text-xs font-black text-amber-900">
                    <Archive className="w-4 h-4 text-amber-600" />
                    <span>Safe Alternative: Archive this Job Description</span>
                  </div>
                  <p className="text-[11px] text-amber-800 leading-snug">
                    Archiving hides the JD from active intake dropdowns while safely preserving revision audit logs and position connections.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onArchiveInstead(jd);
                  }}
                  className="px-3.5 py-1.5 bg-white hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-xl text-xs font-black transition-all cursor-pointer shadow-2xs shrink-0 flex items-center gap-1.5"
                >
                  <Archive className="w-3.5 h-3.5 text-amber-600" />
                  <span>Archive Instead</span>
                </button>
              </div>
            )}

            {/* 4. STRICT CONFIRMATION CHECKBOXES */}
            <div className="p-4 bg-red-50/50 rounded-xl border border-red-200/80 space-y-3">
              <div className="text-xs font-black text-red-950 uppercase tracking-wide flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-red-600" />
                <span>Mandatory Safety Acknowledgements</span>
              </div>

              <div className="space-y-2">
                <label className="flex items-start gap-2.5 text-xs text-slate-700 font-medium cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={confirmPermanent}
                    onChange={(e) => setConfirmPermanent(e.target.checked)}
                    className="mt-0.5 w-4 h-4 rounded text-red-600 focus:ring-red-500 border-slate-300 cursor-pointer"
                  />
                  <span>
                    I understand that this action is <strong>permanent and irreversible</strong>. All revision history logs and operating guidelines will be wiped.
                  </span>
                </label>

                <label className="flex items-start gap-2.5 text-xs text-slate-700 font-medium cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={confirmDependencies}
                    onChange={(e) => setConfirmDependencies(e.target.checked)}
                    className="mt-0.5 w-4 h-4 rounded text-red-600 focus:ring-red-500 border-slate-300 cursor-pointer"
                  />
                  <span>
                    I acknowledge that <strong>{linkedPositions.length} linked position(s)</strong> and <strong>{totalLinkedHeadcount} headcount requisitions</strong> will be detached.
                  </span>
                </label>
              </div>
            </div>

            {/* 5. STRICT VERIFICATION TEXT INPUT */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700">
                To confirm deletion, type <strong className="text-red-600 font-mono">DELETE</strong> or <strong className="text-red-600 font-mono">{jd.id}</strong> below:
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={typedConfirmation}
                  onChange={(e) => setTypedConfirmation(e.target.value)}
                  placeholder={`Type 'DELETE' or '${jd.id}' to confirm`}
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-medium focus:outline-none transition-all ${
                    isTextConfirmed
                      ? "border-emerald-500 bg-emerald-50/30 text-emerald-950 ring-2 ring-emerald-500/20"
                      : "border-slate-300 bg-white text-slate-900 focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
                  }`}
                />
                {isTextConfirmed && (
                  <div className="absolute right-3 top-2.5 text-emerald-600 flex items-center gap-1 text-[11px] font-bold">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Verified</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ==================== MODAL FOOTER ==================== */}
          <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
            <div className="text-[11px] text-slate-500 flex items-center gap-1.5 self-start sm:self-center">
              <ShieldAlert className="w-3.5 h-3.5 text-slate-400" />
              <span>Strict Mode Enabled</span>
            </div>

            <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={!isFormValid}
                onClick={() => {
                  if (isFormValid) {
                    onConfirmDelete(jd);
                  }
                }}
                className={`px-5 py-2 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 shadow-sm ${
                  isFormValid
                    ? "bg-red-600 hover:bg-red-700 text-white cursor-pointer hover:shadow-md active:scale-98"
                    : "bg-slate-200 text-slate-400 cursor-not-allowed border border-slate-300"
                }`}
              >
                <Trash2 className="w-4 h-4" />
                <span>Permanently Delete Job Description</span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
