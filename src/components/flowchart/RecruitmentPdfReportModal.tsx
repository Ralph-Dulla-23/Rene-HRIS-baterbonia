import React, { useState } from "react";
import { 
  X, 
  Download, 
  Printer, 
  FileText, 
  CheckCircle2, 
  Copy, 
  Check, 
  ShieldCheck, 
  Users, 
  Briefcase, 
  Clock, 
  Layers, 
  ExternalLink,
  ChevronRight,
  Info
} from "lucide-react";
import { motion } from "motion/react";
import { FlowStep } from "../RecruitmentFlowchart";
import { generateRecruitmentPipelinePdf } from "../../utils/recruitmentPdfGenerator";

interface RecruitmentPdfReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  steps: FlowStep[];
}

export default function RecruitmentPdfReportModal({
  isOpen,
  onClose,
  steps
}: RecruitmentPdfReportModalProps) {
  const [copied, setCopied] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  if (!isOpen) return null;

  const handleDownloadPdf = () => {
    try {
      setIsGeneratingPdf(true);
      generateRecruitmentPipelinePdf(steps);
    } catch (err) {
      console.error("Failed to generate PDF:", err);
    } finally {
      setTimeout(() => setIsGeneratingPdf(false), 800);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleCopyMarkdown = () => {
    const mdContent = `# SiBS HRIS Enterprise — End-to-End Recruitment Pipeline Report (Steps 1 to 16)
Date: ${new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
Standard Operating Procedures v1.0 • Campuses: Davao HQ, Tagum Campus, Mabini

## Executive Summary
Comprehensive documentation of the 16-step candidate journey and workforce intake lifecycle, governing operational transitions across 4 key phases:

### Phase 1: Plan & Approve (Steps 1–2)
- Step 1: Hiring Need / Manpower Request (Owner: OM/Account Lead | SLA: 1-2 Days)
- Step 2: Hiring Need Approval (Owner: SOM & HR Director | SLA: 24-48 Hours)

### Phase 2: Prepare (Steps 3–5)
- Step 3: Job Description (JD) (Owner: TA Lead & Comp Specialist | SLA: 1 Day)
- Step 4: JD Approval (Owner: HR Director/Compliance | SLA: 24 Hours)
- Step 5: Available Position (Owner: TA Sourcing Lead | SLA: Immediate upon Approval)

### Phase 3: Attract & Evaluate (Steps 6–11)
- Step 6: Candidate Application (Owner: Candidate / Portal | SLA: Real-time)
- Step 7: Initial Screening (Owner: TA Screener | SLA: 1-2 Days)
- Step 8: Assessment (Typing & Versant) (Owner: Assessment Specialist | SLA: 1 Day)
- Step 9: Interviews (HR & Operations) (Owner: Recruiter & Ops TL | SLA: 2-3 Days)
- Step 10: Final Interview (Owner: Operations Manager | SLA: 24 Hours)
- Step 11: Job Offer (Owner: HR Offer Coordinator | SLA: 1-2 Days)

### Phase 4: Hire & Onboard (Steps 12–16)
- Step 12: Requirements / Documents (Owner: Onboarding Specialist | SLA: 3-5 Days)
- Step 13: Ready for Hire Checklist (Owner: HR Operations Lead | SLA: 48 Hours)
- Step 14: Convert to Employee (Owner: HR Master Data Admin | SLA: 24 Hours)
- Step 15: Hiring Requirement Updated (Owner: WFM Planner | SLA: Real-time)
- Step 16: Onboarding (HRIS Master Integration) (Owner: L&D & IT Ops | SLA: Day 1-90)
`;
    navigator.clipboard.writeText(mdContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const phaseGroupings = [
    {
      id: 1,
      title: "1. PLAN & APPROVE",
      desc: "Get the requirement approved",
      color: "border-blue-300 bg-blue-50/70 text-blue-900",
      badge: "bg-blue-600 text-white",
      stepRange: "Steps 1–2",
      steps: steps.filter(s => s.phaseId === 1)
    },
    {
      id: 2,
      title: "2. PREPARE",
      desc: "Set up the job and open the position",
      color: "border-emerald-300 bg-emerald-50/70 text-emerald-900",
      badge: "bg-emerald-600 text-white",
      stepRange: "Steps 3–5",
      steps: steps.filter(s => s.phaseId === 2)
    },
    {
      id: 3,
      title: "3. ATTRACT & EVALUATE",
      desc: "Find and assess the right candidates",
      color: "border-purple-300 bg-purple-50/70 text-purple-900",
      badge: "bg-purple-600 text-white",
      stepRange: "Steps 6–11",
      steps: steps.filter(s => s.phaseId === 3)
    },
    {
      id: 4,
      title: "4. HIRE & ONBOARD",
      desc: "Convert to employee and close the loop",
      color: "border-orange-300 bg-orange-50/70 text-orange-900",
      badge: "bg-orange-600 text-white",
      stepRange: "Steps 12–16",
      steps: steps.filter(s => s.phaseId === 4)
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/70 backdrop-blur-xs overflow-y-auto">
      {/* Print styles injected for clean printing */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #printable-pdf-report, #printable-pdf-report * {
            visibility: visible;
          }
          #printable-pdf-report {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            margin: 0;
            padding: 20px;
            background: white !important;
            color: black !important;
            box-shadow: none !important;
            border: none !important;
          }
          .no-print {
            display: none !important;
          }
          .page-break-before {
            page-break-before: always;
          }
        }
      `}</style>

      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 15 }}
        className="w-full max-w-5xl bg-white text-slate-800 rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]"
      >
        {/* Modal Top Action Bar */}
        <div className="bg-[#042C51] p-4 sm:p-5 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0 border-b border-[#083a69]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#FF5C28] flex items-center justify-center text-white shadow-md shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-white leading-tight">
                  Recruitment Pipeline Report (Steps 1–16)
                </h2>
                <span className="hidden sm:inline-block px-2 py-0.5 rounded-full bg-[#FF5C28] text-white text-[9.5px] font-black uppercase tracking-wider">
                  Official SOP
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Full 16-step operational factsheet & executive compliance export
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Direct PDF Download */}
            <button
              onClick={handleDownloadPdf}
              disabled={isGeneratingPdf}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-[#FF5C28] hover:bg-[#e04b1c] disabled:opacity-50 text-white text-xs font-bold rounded-xl transition-all shadow-md cursor-pointer"
              title="Download compiled PDF document file"
            >
              <Download className="w-4 h-4" />
              <span>{isGeneratingPdf ? "Generating PDF..." : "Download PDF File"}</span>
            </button>

            {/* Print / Save as PDF */}
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-xl transition-all cursor-pointer"
              title="Open browser print preview (Save as PDF)"
            >
              <Printer className="w-4 h-4" />
              <span className="hidden sm:inline">Print / Save PDF</span>
            </button>

            {/* Copy Markdown */}
            <button
              onClick={handleCopyMarkdown}
              className="p-2 text-slate-300 hover:text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
              title="Copy Summary Markdown"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>

            {/* Close */}
            <button
              onClick={onClose}
              className="p-2 text-slate-300 hover:text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
              title="Close dialog"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Document Preview */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-8 bg-slate-50/70">
          <div id="printable-pdf-report" className="bg-white p-6 sm:p-10 rounded-2xl shadow-sm border border-slate-200 space-y-8 max-w-4xl mx-auto">
            
            {/* Document Letterhead */}
            <div className="border-b-2 border-[#042C51] pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-xl bg-[#042C51] flex flex-col items-center justify-center text-white shadow-md shrink-0">
                  <span className="text-base font-black text-[#FF5C28] leading-none">SiBS</span>
                  <span className="text-[10px] font-bold tracking-widest leading-none mt-0.5">HRIS</span>
                </div>
                <div>
                  <h1 className="text-xl font-black text-[#042C51] tracking-tight">
                    END-TO-END RECRUITMENT PIPELINE REPORT
                  </h1>
                  <p className="text-xs text-slate-500 font-semibold tracking-wider uppercase">
                    Steps 1–16 Standard Operating Procedures (SOP) • Master Specification
                  </p>
                </div>
              </div>

              <div className="text-left sm:text-right text-xs text-slate-500 space-y-0.5">
                <div className="font-bold text-[#042C51]">Version: 2.5 Enterprise (2026)</div>
                <div>Date: {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</div>
                <div className="text-[11px] text-slate-400">Campuses: Davao HQ, Tagum, Mabini</div>
              </div>
            </div>

            {/* Executive Summary Section */}
            <div className="space-y-3">
              <h2 className="text-sm font-black text-[#042C51] uppercase tracking-wider flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#FF5C28]" />
                1. Executive Summary & Strategic Objectives
              </h2>
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs text-slate-700 leading-relaxed space-y-2">
                <p>
                  This official document articulates the complete 16-step operational lifecycle governing candidate acquisition, rigorous multistage evaluation, and employee onboarding within the <strong>SiBS HRIS</strong> platform.
                </p>
                <p>
                  The workflow connects operational headcount forecasting, recruitment sourcing channels, multi-tier competency testing, and Day-1 master database conversion. Every step has assigned ownership, defined turnaround SLAs, auditable entry criteria, and automated audit logging.
                </p>
              </div>
            </div>

            {/* 4 Macro Phases Overview */}
            <div className="space-y-3">
              <h2 className="text-sm font-black text-[#042C51] uppercase tracking-wider flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#FF5C28]" />
                2. The 4 Operational Macro Phases
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {phaseGroupings.map((group) => (
                  <div key={group.id} className={`p-3.5 rounded-xl border ${group.color} flex flex-col justify-between`}>
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider ${group.badge}`}>
                          {group.stepRange}
                        </span>
                        <span className="text-[10px] font-bold opacity-75">Phase {group.id}</span>
                      </div>
                      <h3 className="font-bold text-xs leading-snug">{group.title}</h3>
                      <p className="text-[11px] opacity-80 mt-1">{group.desc}</p>
                    </div>
                    <div className="mt-3 pt-2 border-t border-current/20 text-[10px] font-semibold opacity-90">
                      {group.steps.length} Defined Milestones
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Master Summary Matrix Table */}
            <div className="space-y-3">
              <h2 className="text-sm font-black text-[#042C51] uppercase tracking-wider flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#FF5C28]" />
                3. Master Pipeline Matrix (Steps 1 to 16)
              </h2>
              <div className="overflow-x-auto rounded-xl border border-slate-200">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-[#042C51] text-white font-bold">
                      <th className="p-2.5 border-b border-slate-200 w-12 text-center">#</th>
                      <th className="p-2.5 border-b border-slate-200">Stage / Milestone</th>
                      <th className="p-2.5 border-b border-slate-200">Phase</th>
                      <th className="p-2.5 border-b border-slate-200">Role Owner</th>
                      <th className="p-2.5 border-b border-slate-200">SLA Target</th>
                      <th className="p-2.5 border-b border-slate-200">Primary Output</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 font-medium text-slate-700">
                    {steps.map((step, idx) => (
                      <tr key={step.id} className={idx % 2 === 0 ? "bg-white" : "bg-slate-50/60"}>
                        <td className="p-2 text-center font-bold text-[#042C51]">#{step.id}</td>
                        <td className="p-2 font-bold text-slate-900">
                          {step.title.replace(/^\d+\.\s*/, "")}
                          <span className="block text-[10.5px] font-normal text-slate-500">{step.subtitle}</span>
                        </td>
                        <td className="p-2 text-[11px] font-semibold">Phase {step.phaseId}</td>
                        <td className="p-2 text-[11px] text-slate-600">{step.roleOwner}</td>
                        <td className="p-2 text-[11px] font-bold text-[#FF5C28]">{step.slaDays}</td>
                        <td className="p-2 text-[11px] text-slate-600">{step.outputs[0]}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Detailed Factsheet for Every Step (1-16) */}
            <div className="space-y-4 page-break-before">
              <h2 className="text-sm font-black text-[#042C51] uppercase tracking-wider flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#FF5C28]" />
                4. Comprehensive Step Specifications (Steps 1 to 16)
              </h2>

              <div className="space-y-4">
                {steps.map((step) => {
                  const Icon = step.icon;
                  return (
                    <div 
                      key={step.id}
                      className="p-4 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-colors shadow-2xs space-y-3"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-lg bg-[#042C51] text-white flex items-center justify-center font-black text-xs shrink-0">
                            #{step.id}
                          </div>
                          <div>
                            <h3 className="text-xs sm:text-sm font-bold text-[#042C51]">
                              {step.title}
                            </h3>
                            <span className="text-[10px] text-slate-500 font-medium">
                              Phase {step.phaseId} • {step.subtitle}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 text-[10.5px]">
                          <span className="px-2 py-0.5 rounded-md bg-orange-100 text-[#FF5C28] font-bold">
                            SLA: {step.slaDays}
                          </span>
                          <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-semibold">
                            {step.roleOwner}
                          </span>
                        </div>
                      </div>

                      <p className="text-xs text-slate-600 leading-relaxed">
                        {step.description}
                      </p>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1 text-[11px]">
                        <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                          <span className="font-bold text-slate-700 block mb-1">Checklist & Fields</span>
                          <ul className="space-y-1 text-slate-600">
                            {step.bullets.map((b, bIdx) => (
                              <li key={bIdx} className="flex items-start gap-1">
                                <span className="text-[#FF5C28] font-bold">•</span>
                                <span>{b}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                          <span className="font-bold text-slate-700 block mb-1">Required Inputs</span>
                          <ul className="space-y-1 text-slate-600">
                            {step.inputs.map((inp, iIdx) => (
                              <li key={iIdx} className="flex items-start gap-1">
                                <span className="text-blue-500 font-bold">•</span>
                                <span>{inp}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                          <span className="font-bold text-slate-700 block mb-1">Delivered Outputs</span>
                          <ul className="space-y-1 text-slate-600">
                            {step.outputs.map((out, oIdx) => (
                              <li key={oIdx} className="flex items-start gap-1">
                                <span className="text-emerald-600 font-bold">✓</span>
                                <span>{out}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Document Control & Sign-off Box */}
            <div className="pt-6 border-t-2 border-slate-200 space-y-4">
              <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Document Sign-Off & Approvals
              </h2>
              <div className="grid grid-cols-3 gap-4 text-xs">
                <div className="p-3 border border-slate-200 rounded-xl bg-slate-50">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Prepared By</span>
                  <div className="font-bold text-slate-800 mt-1">Talent Acquisition Lead</div>
                  <div className="text-[10px] text-slate-500">SiBS Enterprise Operations</div>
                </div>

                <div className="p-3 border border-slate-200 rounded-xl bg-slate-50">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Reviewed By</span>
                  <div className="font-bold text-slate-800 mt-1">Senior Operations Manager</div>
                  <div className="text-[10px] text-slate-500">Workforce & Site Readiness</div>
                </div>

                <div className="p-3 border border-slate-200 rounded-xl bg-slate-50">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Approved By</span>
                  <div className="font-bold text-slate-800 mt-1">VP / HR Director</div>
                  <div className="text-[10px] text-slate-500">Corporate Governance</div>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Modal Footer Note */}
        <div className="p-4 bg-white border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 shrink-0">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-[#FF5C28]" />
            <span>Ready for corporate review, audit printing, or executive PDF distribution.</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadPdf}
              className="px-3.5 py-1.5 bg-[#FF5C28] hover:bg-[#e04b1c] text-white font-bold rounded-lg transition-colors cursor-pointer"
            >
              Export PDF Now
            </button>
            <button
              onClick={onClose}
              className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg transition-colors cursor-pointer"
            >
              Done
            </button>
          </div>
        </div>

      </motion.div>
    </div>
  );
}
