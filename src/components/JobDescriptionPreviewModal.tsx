import React, { useState } from "react";
import {
  X,
  Printer,
  ArrowLeft,
  Edit3,
  CheckCircle2,
  AlertCircle,
  FileText,
  History,
  Clock,
  User,
  Tag,
  Sparkles,
  Archive,
  ArchiveRestore,
  RotateCcw,
  AlertTriangle,
  Trash2,
  Scale,
  Brain,
  HeartHandshake,
  Wind
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { JobDescriptionRecord } from "./JobDescriptionPage";

interface JobDescriptionPreviewModalProps {
  isOpen: boolean;
  jd: JobDescriptionRecord | null;
  onClose: () => void;
  onFlagForRevision?: (jd: JobDescriptionRecord) => void;
  onArchive?: (jd: JobDescriptionRecord) => void;
  onRestore?: (jd: JobDescriptionRecord) => void;
  onDelete?: (jd: JobDescriptionRecord) => void;
}

export default function JobDescriptionPreviewModal({
  isOpen,
  jd,
  onClose,
  onFlagForRevision,
  onArchive,
  onRestore,
  onDelete
}: JobDescriptionPreviewModalProps) {
  const [activeTab, setActiveTab] = useState<"details" | "revision">("details");

  if (!isOpen || !jd) return null;

  const handlePrint = () => {
    window.print();
  };

  // Status badge color formatting matching the design
  const renderStatusPill = () => {
    if (jd.isArchived) {
      return (
        <span className="px-3.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-300 inline-flex items-center gap-1.5 shadow-2xs">
          <Archive className="w-3 h-3 text-slate-500" />
          Archived
        </span>
      );
    }

    switch (jd.status) {
      case "Approved":
        return (
          <span className="px-3.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-300 inline-flex items-center shadow-2xs">
            Approved
          </span>
        );
      case "Existing":
        return (
          <span className="px-3.5 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-300 inline-flex items-center shadow-2xs">
            Existing
          </span>
        );
      case "For Revision":
        return (
          <span className="px-3.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-300 inline-flex items-center shadow-2xs">
            For Revision
          </span>
        );
      case "For Approval":
        return (
          <span className="px-3.5 py-1 rounded-full text-xs font-bold bg-purple-50 text-purple-700 border border-purple-300 inline-flex items-center shadow-2xs">
            For Approval
          </span>
        );
      case "New Job Description":
        return (
          <span className="px-3.5 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-300 inline-flex items-center shadow-2xs">
            New Job Description
          </span>
        );
      case "Rejected":
        return (
          <span className="px-3.5 py-1 rounded-full text-xs font-bold bg-red-50 text-red-700 border border-red-300 inline-flex items-center shadow-2xs">
            Rejected
          </span>
        );
      default:
        return (
          <span className="px-3.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-300 inline-flex items-center shadow-2xs">
            {jd.status}
          </span>
        );
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex flex-col bg-[#F0F4F8] text-[#101828] overflow-hidden">
        {/* ==================== TOP NAVIGATION HEADER (MATCHING USER DESIGN) ==================== */}
        <div className="bg-white border-b border-slate-200 px-6 pt-5 pb-0 shrink-0 shadow-xs">
          {/* Top Row: Info & Action Buttons */}
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 pb-4">
            {/* Left Info */}
            <div className="space-y-1">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                JOB DESCRIPTION OVERVIEW
              </span>
              <h1 className="text-lg sm:text-xl font-black text-[#042C51] tracking-tight">
                {jd.id} • {jd.roleTitle.toUpperCase()}
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 font-medium">
                {jd.department} • {jd.account}
              </p>
            </div>

            {/* Right Action Buttons in Header */}
            <div className="flex items-center flex-wrap gap-2.5 self-start md:self-center">
              {/* Status Badge */}
              {renderStatusPill()}

              {/* Flag for Revision Button (if not archived) */}
              {!jd.isArchived && onFlagForRevision && (
                <button
                  type="button"
                  onClick={() => onFlagForRevision(jd)}
                  className="px-3.5 py-1.5 rounded-xl border border-amber-200 hover:border-amber-300 bg-amber-50/70 hover:bg-amber-100 text-amber-800 font-bold text-xs flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5 text-amber-600" />
                  <span>Revise</span>
                </button>
              )}

              {/* If archived, show restore in header matching archive theme */}
              {jd.isArchived && onRestore && (
                <button
                  type="button"
                  onClick={() => onRestore(jd)}
                  className="px-3.5 py-1.5 rounded-xl border border-slate-200 hover:border-emerald-300 bg-white hover:bg-emerald-50/60 text-[#042C51] font-bold text-xs flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer"
                >
                  <ArchiveRestore className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="font-bold text-[#042C51]">Restore</span>
                </button>
              )}

              {/* Close Button */}
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-all cursor-pointer ml-1"
                title="Close Overview"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Navigation Tabs (Underline active indicator like screenshot) */}
          <div className="flex items-center gap-6 border-t border-slate-100 pt-2">
            <button
              type="button"
              onClick={() => setActiveTab("details")}
              className={`pb-2.5 text-xs sm:text-sm font-bold transition-all relative cursor-pointer ${
                activeTab === "details"
                  ? "text-blue-600 border-b-2 border-blue-600 font-black"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              Details
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("revision")}
              className={`pb-2.5 text-xs sm:text-sm font-bold transition-all relative cursor-pointer ${
                activeTab === "revision"
                  ? "text-blue-600 border-b-2 border-blue-600 font-black"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              Revision History
            </button>
          </div>
        </div>

        {/* ARCHIVED NOTICE BANNER (IF APPLICABLE) */}
        {jd.isArchived && (
          <div className="bg-slate-900 text-white px-6 py-2.5 flex items-center justify-between gap-4 shrink-0 text-xs border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Archive className="w-4 h-4 text-amber-400 shrink-0" />
              <span>
                <strong>Archived Document:</strong> This Job Description was moved to archive on{" "}
                <span className="text-amber-300 font-bold">{jd.archivedAt || "N/A"}</span>
                {jd.archiveReason ? ` • Reason: "${jd.archiveReason}"` : ""}.
              </span>
            </div>
            {onRestore && (
              <button
                type="button"
                onClick={() => onRestore(jd)}
                className="px-3 py-1 bg-amber-500 hover:bg-amber-400 text-slate-900 font-black rounded-lg text-xs transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs shrink-0"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Restore JD</span>
              </button>
            )}
          </div>
        )}

        {/* ==================== MAIN CONTENT AREA ==================== */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 flex justify-center items-start relative">
          {/* FLOATING PRINT BUTTON WIDGET ON RIGHT EDGE (MATCHING SCREENSHOT) */}
          <button
            type="button"
            onClick={handlePrint}
            className="fixed right-6 top-32 z-30 bg-white border border-slate-200 shadow-md hover:shadow-lg hover:bg-slate-50 text-[#042C51] p-3 sm:p-3.5 rounded-2xl flex flex-col items-center justify-center gap-1 transition-all cursor-pointer group"
            title="Print Job Description"
          >
            <Printer className="w-5 h-5 text-[#042C51] group-hover:scale-110 transition-transform" />
            <span className="text-[10px] sm:text-[11px] font-bold">Print</span>
          </button>

          {activeTab === "details" ? (
            /* ==================== DOCUMENT PAPER SHEET ==================== */
            <div className="bg-white border-2 border-slate-300 shadow-xl max-w-4xl w-full p-6 sm:p-10 relative my-2 min-h-[800px] text-black font-sans">
              {/* OFFICIAL SIBS HEADER GRID TABLE */}
              <div className="border-2 border-black text-black font-sans mb-8">
                <div className="grid grid-cols-12 divide-x-2 divide-black">
                  {/* LEFT BOX: LOGO & ISSUANCE */}
                  <div className="col-span-12 sm:col-span-3 p-4 flex flex-col justify-between items-center sm:items-start text-center sm:text-left min-h-[140px] bg-white">
                    <div>
                      <div className="text-3xl font-black tracking-tight text-[#042C51]">SiBS</div>
                      <div className="text-[9px] font-semibold text-slate-600 tracking-tight mt-0.5">
                        Practice. Purpose. Philosophy.
                      </div>
                    </div>
                    <div className="text-[11px] font-bold text-black mt-4">
                      Manual Issuance #1
                    </div>
                  </div>

                  {/* MIDDLE COLUMN */}
                  <div className="col-span-12 sm:col-span-6 flex flex-col divide-y-2 divide-black">
                    {/* MANUAL TITLE */}
                    <div className="p-2.5 px-3">
                      <div className="text-[9px] font-bold text-black uppercase tracking-wider">
                        MANUAL TITLE:
                      </div>
                      <div className="text-sm font-black text-black uppercase tracking-tight mt-0.5">
                        MASTER OPERATING MANUAL
                      </div>
                    </div>

                    {/* DOCUMENT TITLE */}
                    <div className="p-2.5 px-3 flex-1 flex flex-col justify-center">
                      <div className="text-[9px] font-bold text-black uppercase tracking-wider">
                        DOCUMENT TITLE:
                      </div>
                      <div className="text-base font-black text-black uppercase tracking-tight mt-0.5">
                        {jd.roleTitle}
                      </div>
                    </div>

                    {/* BOTTOM 4 SUB-COLUMNS */}
                    <div className="grid grid-cols-4 divide-x-2 divide-black text-[9px] font-bold text-black">
                      <div className="p-2 space-y-0.5">
                        <div className="text-slate-600">PREPARED FOR:</div>
                        <div className="font-extrabold uppercase text-[10px] truncate">{jd.account || jd.department}</div>
                      </div>
                      <div className="p-2 space-y-0.5">
                        <div className="text-slate-600">PREPARED BY:</div>
                        <div className="font-extrabold uppercase text-[10px] leading-tight">2435 - BATACAN, ALENA MENDOZA</div>
                      </div>
                      <div className="p-2 space-y-0.5">
                        <div className="text-slate-600">REVIEWED BY:</div>
                        <div className="font-extrabold uppercase text-[10px] leading-tight">2435 - BATACAN, ALENA MENDOZA</div>
                      </div>
                      <div className="p-2 space-y-0.5">
                        <div className="text-slate-600">APPROVED BY:</div>
                        <div className="font-extrabold uppercase text-[10px]">2435</div>
                      </div>
                    </div>
                  </div>

                  {/* RIGHT COLUMN (META FIELDS) */}
                  <div className="col-span-12 sm:col-span-3 flex flex-col divide-y-2 divide-black text-[9px] font-bold text-black">
                    <div className="p-2 flex items-center justify-between">
                      <span className="text-slate-600 uppercase">DOCUMENT CODE</span>
                      <span className="font-extrabold text-xs">{jd.id}</span>
                    </div>
                    <div className="p-2 flex items-center justify-between">
                      <span className="text-slate-600 uppercase">REVISION NUMBER</span>
                      <span className="font-extrabold text-xs">{jd.versionNo || "001"}</span>
                    </div>
                    <div className="p-2 flex items-center justify-between">
                      <span className="text-slate-600 uppercase">EFFECTIVITY DATE</span>
                      <span className="font-extrabold text-[10px] uppercase">{jd.dateRequested || "JULY 3, 2026"}</span>
                    </div>
                    <div className="p-2 flex items-center justify-between">
                      <span className="text-slate-600 uppercase">DATE OF LAST REVIEW</span>
                      <span className="font-extrabold text-[10px] uppercase">{jd.dateRequested || "JULY 3, 2026"}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* DOCUMENT BODY SECTIONS */}
              <div className="space-y-6 text-sm text-slate-800 leading-relaxed font-sans">
                {/* 1. POSITION OVERVIEW */}
                <section>
                  <h3 className="text-sm font-black text-black uppercase tracking-wider mb-2">
                    1. POSITION OVERVIEW
                  </h3>
                  <p className="text-xs text-slate-700 leading-relaxed text-justify">
                    The {jd.roleTitle} is responsible for serving as a core contributor within the {jd.department} department ({jd.account}). This position focuses on executing key operational workflows, maintaining SLA compliance, ensuring high quality deliverables, and adhering to organizational benchmarks established in the Master Operating Manual.
                  </p>
                </section>

                {/* 2. DUTIES & RESPONSIBILITIES */}
                <section>
                  <h3 className="text-sm font-black text-black uppercase tracking-wider mb-2">
                    2. DUTIES & RESPONSIBILITIES
                  </h3>
                  <div className="text-xs text-slate-700 leading-relaxed space-y-1.5">
                    {jd.responsibilities && jd.responsibilities.length > 0 ? (
                      <ul className="list-disc pl-5 space-y-1.5">
                        {jd.responsibilities.map((resp, i) => (
                          <li key={i}>{resp}</li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-justify">
                        Execute primary role responsibilities, handle customer inquiries, diagnose technical incidents, document ticket interactions in the CRM software, and meet defined key performance indicators including AHT and FCR benchmarks.
                      </p>
                    )}
                  </div>
                </section>

                {/* 3. QUALIFICATIONS & CHARACTERISTICS */}
                <section>
                  <h3 className="text-sm font-black text-black uppercase tracking-wider mb-2">
                    3. QUALIFICATIONS & CHARACTERISTICS
                  </h3>
                  <ul className="list-disc pl-5 text-xs text-slate-700 space-y-1.5">
                    {jd.educationRequirements && jd.educationRequirements.length > 0 ? (
                      <li>
                        <strong>Educational Attainment (IQ Factor 1):</strong> {jd.educationRequirements.join(" • ")}
                      </li>
                    ) : (
                      <li><strong>Educational Attainment (IQ Factor 1):</strong> Bachelor&apos;s Degree or completed at least 2 years in college / vocational equivalent.</li>
                    )}
                    {jd.experienceRequirements && jd.experienceRequirements.length > 0 ? (
                      <li>
                        <strong>Work Experience (IQ Factor 2):</strong> {jd.experienceRequirements.join(" • ")}
                      </li>
                    ) : (
                      <li><strong>Work Experience (IQ Factor 2):</strong> Minimum 1-2 years of proven operational experience in {jd.department} or related industry.</li>
                    )}
                    {jd.certificationsAndAffiliations && jd.certificationsAndAffiliations.length > 0 && (
                      <li>
                        <strong>Certifications and Affiliations:</strong> {jd.certificationsAndAffiliations.join(" • ")}
                      </li>
                    )}
                    {jd.location && (
                      <li>
                        <strong>Operating Location & Work Setup:</strong> {jd.location}
                      </li>
                    )}
                    <li><strong>Supervisory Responsibility:</strong> {jd.supervisoryLevel || "Individual Contributor"}.</li>
                    <li><strong>Target Personality Profile:</strong> {jd.targetPersonality || "Adaptable, detail-oriented, resilient"}.</li>
                  </ul>
                </section>

                {/* 4. DESIRED COMPETENCIES */}
                <section>
                  <h3 className="text-sm font-black text-black uppercase tracking-wider mb-2">
                    4. DESIRED COMPETENCIES
                  </h3>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {jd.competencies && jd.competencies.length > 0 ? (
                      jd.competencies.map((comp, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1 bg-slate-100 border border-slate-300 text-black font-bold text-xs rounded-md flex items-center gap-1.5"
                        >
                          <Tag className="w-3 h-3 text-[#FF5C28]" />
                          {comp}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-slate-500 italic">No competencies specified.</span>
                    )}
                  </div>
                </section>

                {/* 5. COMPENSABLE FACTORS & EVALUATION CRITERIA */}
                <section className="pt-2">
                  <div className="flex items-center justify-between mb-2.5">
                    <h3 className="text-sm font-black text-black uppercase tracking-wider flex items-center gap-1.5">
                      <Scale className="w-4 h-4 text-[#FF5C28]" />
                      5. COMPENSABLE FACTORS & EVALUATION CRITERIA
                    </h3>
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-tight">
                      Job Evaluation Matrix
                    </span>
                  </div>

                  <div className="border-2 border-[#1E4E8C] rounded-lg overflow-hidden text-black font-sans">
                    {/* Dark Blue Main Header */}
                    <div className="bg-[#1E4E8C] text-white p-2.5 px-3 flex items-center justify-between font-bold text-xs">
                      <span className="tracking-wider">COMPENSABLE FACTORS</span>
                      <span className="text-[10px] text-blue-100 font-normal">Standard Factor Grading</span>
                    </div>

                    {/* Section 1: IQ Requirement */}
                    <div className="bg-[#789CC7] text-white font-bold text-[10px] sm:text-xs uppercase tracking-wide px-3 py-1.5 border-b border-[#5E83AF] flex items-center gap-1.5">
                      <Brain className="w-3.5 h-3.5 text-blue-100" />
                      <span>FACTORS REFERRING TO IQ REQUIREMENT FOR THE JOB</span>
                    </div>
                    <table className="w-full text-left text-xs border-collapse">
                      <tbody className="divide-y divide-slate-200 bg-white">
                        {(jd.compensableFactors && jd.compensableFactors.filter(f => f.category === "IQ").length > 0
                          ? jd.compensableFactors.filter(f => f.category === "IQ")
                          : [
                              { id: 1, factorName: "Education", criteria: "Bachelor's degree or equivalent technical domain certification.", weightOrPoints: 10 },
                              { id: 2, factorName: "Work Experience", criteria: "Relevant industry experience and role background.", weightOrPoints: 15 },
                              { id: 3, factorName: "Desired Competencies", criteria: "Core domain technical and operational competencies.", weightOrPoints: 15 },
                              { id: 4, factorName: "Work Complexity / Budget Authority", criteria: "Handles moderate to high complexity task streams and deliverables.", weightOrPoints: 10 },
                              { id: 5, factorName: "Independent Judgment / Decision Making / Problem Solving", criteria: "Autonomous resolution of technical and operational roadblocks.", weightOrPoints: 15 }
                            ]
                        ).map((factor: any) => (
                          <tr key={factor.id} className="hover:bg-slate-50">
                            <td className="p-2.5 px-3 w-10 text-center font-bold text-[#042C51] border-r border-slate-200 bg-slate-50/50">
                              {factor.id}
                            </td>
                            <td className="p-2.5 px-3 font-bold text-black w-1/3 sm:w-2/5 border-r border-slate-200">
                              {factor.factorName}
                            </td>
                            <td className="p-2.5 px-3 text-slate-700 text-xs leading-relaxed">
                              {factor.criteria || factor.criteriaSummary || "Standard qualification requirement."}
                            </td>
                            <td className="p-2.5 px-3 w-16 text-right font-black text-[#042C51] bg-slate-50/40">
                              {factor.weightOrPoints ?? 0} pts
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>

                    {/* Section 2: EQ Requirement */}
                    <div className="bg-[#789CC7] text-white font-bold text-[10px] sm:text-xs uppercase tracking-wide px-3 py-1.5 border-t border-b border-[#5E83AF] flex items-center gap-1.5">
                      <HeartHandshake className="w-3.5 h-3.5 text-blue-100" />
                      <span>FACTORS REFERRING TO EQ REQUIREMENT FOR THE JOB</span>
                    </div>
                    <table className="w-full text-left text-xs border-collapse">
                      <tbody className="divide-y divide-slate-200 bg-white">
                        {(jd.compensableFactors && jd.compensableFactors.filter(f => f.category === "EQ").length > 0
                          ? jd.compensableFactors.filter(f => f.category === "EQ")
                          : [
                              { id: 6, factorName: "Leadership / Supervisory Responsibilities", criteria: "Team guidance, mentorship, or supervisory coaching capability.", weightOrPoints: 10 },
                              { id: 7, factorName: "Personal / Organizational Contacts", criteria: "Cross-departmental collaboration with internal and external peers.", weightOrPoints: 10 },
                              { id: 8, factorName: "Customer Service Relationships", criteria: "Empathetic, clear, and proactive relationship building.", weightOrPoints: 10 }
                            ]
                        ).map((factor: any) => (
                          <tr key={factor.id} className="hover:bg-slate-50">
                            <td className="p-2.5 px-3 w-10 text-center font-bold text-[#042C51] border-r border-slate-200 bg-slate-50/50">
                              {factor.id}
                            </td>
                            <td className="p-2.5 px-3 font-bold text-black w-1/3 sm:w-2/5 border-r border-slate-200">
                              {factor.factorName}
                            </td>
                            <td className="p-2.5 px-3 text-slate-700 text-xs leading-relaxed">
                              {factor.criteria || factor.criteriaSummary || "Standard qualification requirement."}
                            </td>
                            <td className="p-2.5 px-3 w-16 text-right font-black text-[#042C51] bg-slate-50/40">
                              {factor.weightOrPoints ?? 0} pts
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>

                    {/* Section 3: Job Conditions */}
                    <div className="bg-[#789CC7] text-white font-bold text-[10px] sm:text-xs uppercase tracking-wide px-3 py-1.5 border-t border-b border-[#5E83AF] flex items-center gap-1.5">
                      <Wind className="w-3.5 h-3.5 text-blue-100" />
                      <span>JOB CONDITIONS</span>
                    </div>
                    <table className="w-full text-left text-xs border-collapse">
                      <tbody className="divide-y divide-slate-200 bg-white">
                        {(jd.compensableFactors && jd.compensableFactors.filter(f => f.category === "CONDITIONS").length > 0
                          ? jd.compensableFactors.filter(f => f.category === "CONDITIONS")
                          : [
                              { id: 9, factorName: "Working / Enviromental Conditions", criteria: "Operational site / hybrid office environment with standard shift schedules.", weightOrPoints: 5 }
                            ]
                        ).map((factor: any) => (
                          <tr key={factor.id} className="hover:bg-slate-50">
                            <td className="p-2.5 px-3 w-10 text-center font-bold text-[#042C51] border-r border-slate-200 bg-slate-50/50">
                              {factor.id}
                            </td>
                            <td className="p-2.5 px-3 font-bold text-black w-1/3 sm:w-2/5 border-r border-slate-200">
                              {factor.factorName}
                            </td>
                            <td className="p-2.5 px-3 text-slate-700 text-xs leading-relaxed">
                              {factor.criteria || factor.criteriaSummary || "Standard qualification requirement."}
                            </td>
                            <td className="p-2.5 px-3 w-16 text-right font-black text-[#042C51] bg-slate-50/40">
                              {factor.weightOrPoints ?? 0} pts
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>

                    {/* TOTAL Row */}
                    <div className="bg-[#1E4E8C] text-white p-2.5 px-4 flex items-center justify-between font-black text-xs">
                      <span>TOTAL</span>
                      <span className="text-[#FFC700] text-sm">
                        {jd.compensableFactors
                          ? jd.compensableFactors.reduce((a: number, b: any) => a + (Number(b.weightOrPoints) || 0), 0)
                          : 90}{" "}
                        Points
                      </span>
                    </div>
                  </div>
                </section>
              </div>
            </div>
          ) : (
            /* ==================== REVISION HISTORY TAB ==================== */
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm max-w-4xl w-full p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-sm font-black text-[#042C51] uppercase tracking-wider flex items-center gap-2">
                  <History className="w-4 h-4 text-[#FF5C28]" />
                  Revision History & Audit Log
                </h3>
                <span className="text-xs font-bold text-slate-400">
                  Total Entries: {jd.revisionHistory?.length || 0}
                </span>
              </div>

              <div className="space-y-3">
                {jd.revisionHistory && jd.revisionHistory.length > 0 ? (
                  jd.revisionHistory.map((rev) => (
                    <div
                      key={rev.id}
                      className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2 hover:bg-slate-100/60 transition-colors"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-[#042C51] flex items-center gap-2">
                          <User className="w-3.5 h-3.5 text-[#FF5C28]" />
                          {rev.author} ({rev.version})
                        </span>
                        <span className="text-slate-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {rev.date}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed pl-5 border-l-2 border-[#042C51]/20">
                        {rev.remarks}
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center text-slate-400 text-xs italic">
                    No revision logs recorded for this job description document.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* ==================== BOTTOM FOOTER ==================== */}
        <div className="bg-white border-t border-slate-200 px-6 py-3 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0 shadow-xs">
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-500">
              Document Code: <strong className="text-[#042C51]">{jd.id}</strong> • Version: <strong className="text-[#042C51]">{jd.versionNo}</strong>
            </span>
          </div>

          <div className="flex items-center flex-wrap gap-2.5">
            {/* Archive / Restore Action & Archived Data Display */}
            {jd.isArchived ? (
              <div className="flex items-center flex-wrap gap-2">
                {/* Archived Data Tag */}
                <div className="px-3 py-1.5 rounded-xl bg-amber-50/80 border border-amber-200 text-amber-900 text-xs font-medium flex items-center gap-1.5 shadow-2xs">
                  <Archive className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span>
                    <strong className="font-bold text-amber-950">Archived Date:</strong> {jd.archivedAt || "2026-06-12"}
                    {jd.archiveReason ? ` • ${jd.archiveReason}` : ""}
                  </span>
                </div>

                {/* Restore Button matching the theme of Archive button */}
                {onRestore && (
                  <button
                    type="button"
                    onClick={() => onRestore(jd)}
                    className="px-3.5 py-2 rounded-xl border border-slate-200 hover:border-emerald-300 bg-white hover:bg-emerald-50/50 text-[#042C51] font-bold text-xs flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer"
                  >
                    <ArchiveRestore className="w-4 h-4 text-emerald-600" />
                    <span className="font-bold text-[#042C51]">Restore</span>
                  </button>
                )}
              </div>
            ) : (
              onArchive && (
                <button
                  type="button"
                  onClick={() => onArchive(jd)}
                  className="px-3.5 py-2 rounded-xl border border-slate-200 hover:border-amber-300 bg-white hover:bg-amber-50/60 text-[#042C51] font-bold text-xs flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer"
                >
                  <Archive className="w-3.5 h-3.5 text-amber-500" />
                  <span className="font-bold text-[#042C51]">Archive</span>
                </button>
              )
            )}

            {/* Delete Action */}
            {onDelete && (
              <button
                type="button"
                onClick={() => onDelete(jd)}
                className="px-3.5 py-2 rounded-xl border border-red-200 hover:border-red-300 bg-white hover:bg-red-50 text-red-600 font-bold text-xs flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5 text-red-500" />
                <span>Delete</span>
              </button>
            )}

            <div className="h-5 w-px bg-slate-200 hidden sm:block mx-1" />

            {/* Back to Job Descriptions Button */}
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-[#042C51] hover:text-white border border-slate-200 text-[#042C51] rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Job Descriptions</span>
            </button>
          </div>
        </div>
      </div>
    </AnimatePresence>
  );
}
