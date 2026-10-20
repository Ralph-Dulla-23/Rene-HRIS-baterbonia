import React, { useState, useRef } from "react";
import html2canvas from "html2canvas";
import {
  FileText,
  Download,
  Printer,
  ChevronRight,
  CheckCircle,
  AlertTriangle,
  ArrowRight,
  GitFork,
  ExternalLink,
  ShieldCheck,
  Clock,
  UserCheck,
  Sparkles,
  Layers,
  Search,
  Filter,
  Check,
  X,
  Monitor,
  Layout,
  Maximize2,
  Minimize2
} from "lucide-react";
import {
  generateWorkflowProcessPdf,
  generateFullPrototypePdf,
  WORKFLOW_PAGES,
  ProcessPageSpec
} from "../utils/workflowProcessPdfGenerator";
import { printPageToPdf } from "../utils/pdfExport";

// Import actual live prototype components
import HiringNeedsIntake from "./HiringNeedsIntake";
import ApplicantLeads from "./ApplicantLeads";
import CandidatePipeline from "./CandidatePipeline";
import Offers from "./Offers";
import Onboarding from "./Onboarding";
import JobDescriptionPage from "./JobDescriptionPage";

interface WorkflowProcessScreenViewerProps {
  onSwitchModule?: (moduleKey: string) => void;
  onClose?: () => void;
}

export default function WorkflowProcessScreenViewer({
  onSwitchModule,
  onClose
}: WorkflowProcessScreenViewerProps) {
  const [activePageIndex, setActivePageIndex] = useState<number>(0);
  const [highlightedCallout, setHighlightedCallout] = useState<number | null>(null);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<"prototype" | "dual">("prototype");
  const [activeSubTab, setActiveSubTab] = useState<"intake" | "jd">("intake");

  const currentPage: ProcessPageSpec = WORKFLOW_PAGES[activePageIndex];
  const screenRef = useRef<HTMLDivElement>(null);

  // Captures all 5 offscreen DOM prototype screens and generates a full-page screen PDF
  const handleDownloadFullPrototypePdf = async () => {
    setIsGeneratingPdf(true);
    const screenSnapshots: Record<number, string> = {};

    try {
      // Capture high-definition DOM snapshot of each of the 5 live prototype screens
      for (let pageIdx = 0; pageIdx < 5; pageIdx++) {
        const el = document.getElementById(`pdf-offscreen-screen-${pageIdx}`);
        if (el) {
          const canvas = await html2canvas(el, {
            scale: 2.0,
            useCORS: true,
            logging: false,
            backgroundColor: "#FFFFFF",
            windowWidth: 1440
          });
          screenSnapshots[pageIdx] = canvas.toDataURL("image/png");
        }
      }
    } catch (err) {
      console.warn("DOM snapshot capture warning:", err);
    } finally {
      try {
        generateFullPrototypePdf(screenSnapshots);
      } catch (err) {
        console.error("Error generating full prototype PDF:", err);
      }
      setTimeout(() => {
        setIsGeneratingPdf(false);
      }, 600);
    }
  };

  // Dual-Pane Specbook PDF Export
  const handleDownloadDualPanePdf = async () => {
    setIsGeneratingPdf(true);
    const screenSnapshots: Record<number, string> = {};

    try {
      for (let pageIdx = 0; pageIdx < 5; pageIdx++) {
        const el = document.getElementById(`pdf-offscreen-screen-${pageIdx}`);
        if (el) {
          const canvas = await html2canvas(el, {
            scale: 1.5,
            useCORS: true,
            logging: false,
            backgroundColor: "#FFFFFF",
            windowWidth: 1280
          });
          screenSnapshots[pageIdx] = canvas.toDataURL("image/png");
        }
      }
    } catch (err) {
      console.warn("DOM snapshot capture warning:", err);
    } finally {
      try {
        generateWorkflowProcessPdf(screenSnapshots);
      } catch (err) {
        console.error("Error generating dual pane workflow PDF:", err);
      }
      setTimeout(() => {
        setIsGeneratingPdf(false);
      }, 600);
    }
  };

  const handlePrint = () => {
    printPageToPdf("SiBS_HRIS_Process_To_Screen_Specbook");
  };

  // Helper renderer for the exact live prototype UI component per process step
  const renderLivePrototypeComponent = () => {
    const userEmail = "alena.batacan@thesiblingssolutions.com";

    switch (activePageIndex) {
      case 0:
        return (
          <div className="space-y-4">
            {/* Sub-toggle for Step 1: Requisition Intake vs Job Description Factor Matrix */}
            <div className="bg-[#042C51] text-white px-4 py-2.5 rounded-xl flex items-center justify-between border border-[#13406D]">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#FF5C28]" />
                <span className="text-xs font-bold">Step 1 Screen Selection:</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveSubTab("intake")}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    activeSubTab === "intake"
                      ? "bg-[#FF5C28] text-white shadow-xs"
                      : "bg-white/10 text-white/80 hover:bg-white/20"
                  }`}
                >
                  Personnel Requisition Intake (PRF)
                </button>
                <button
                  onClick={() => setActiveSubTab("jd")}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    activeSubTab === "jd"
                      ? "bg-[#FF5C28] text-white shadow-xs"
                      : "bg-white/10 text-white/80 hover:bg-white/20"
                  }`}
                >
                  Job Description Factor Matrix & Scoring
                </button>
              </div>
            </div>

            {activeSubTab === "intake" ? (
              <HiringNeedsIntake userEmail={userEmail} onSwitchModule={onSwitchModule} />
            ) : (
              <JobDescriptionPage onSwitchModule={onSwitchModule} />
            )}
          </div>
        );

      case 1:
        return <ApplicantLeads userEmail={userEmail} onSwitchModule={onSwitchModule} />;

      case 2:
        return <CandidatePipeline userEmail={userEmail} onSwitchModule={onSwitchModule} />;

      case 3:
        return <Offers userEmail={userEmail} onSwitchModule={onSwitchModule} />;

      case 4:
        return <Onboarding userEmail={userEmail} onSwitchModule={onSwitchModule} />;

      default:
        return <HiringNeedsIntake userEmail={userEmail} onSwitchModule={onSwitchModule} />;
    }
  };

  return (
    <div className="w-full flex-1 flex flex-col min-h-0 bg-[#E6EAF0] pb-16">
      {/* ==================== STICKY TOP HEADER & CONTROL BAR ==================== */}
      <div className="bg-white border-b border-[#E6ECF2] shadow-xs sticky top-16 z-20 px-6 py-4">
        <div className="max-w-[1920px] mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#042C51] text-white flex items-center justify-center shadow-md shadow-slate-900/10 shrink-0">
              <GitFork className="w-5 h-5 text-[#FF5C28]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-black text-[#042C51] tracking-tight">
                  Process-to-Screen Prototype Viewer & Specbook
                </h1>
                <span className="px-2 py-0.5 rounded-md bg-[#FFF2ED] text-[#FF5C28] text-[10.5px] font-extrabold tracking-wide uppercase border border-[#FFD8CA]">
                  Live Prototype Mode
                </span>
              </div>
              <p className="text-xs text-[#667085]">
                Direct live prototype screen view mapped to 5 core HRIS recruitment lifecycle flowchart phases.
              </p>
            </div>
          </div>

          {/* View Mode Switcher + Export Actions */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Mode Switcher Pill */}
            <div className="bg-[#E6EAF0] p-1 rounded-xl flex items-center gap-1 border border-[#BECBDA]">
              <button
                onClick={() => setViewMode("prototype")}
                className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all cursor-pointer flex items-center gap-1.5 ${
                  viewMode === "prototype"
                    ? "bg-[#042C51] text-white shadow-xs"
                    : "text-[#215789] hover:bg-white/50"
                }`}
              >
                <Monitor className="w-3.5 h-3.5 text-[#FF5C28]" />
                <span>Full Prototype Screen</span>
              </button>
              <button
                onClick={() => setViewMode("dual")}
                className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all cursor-pointer flex items-center gap-1.5 ${
                  viewMode === "dual"
                    ? "bg-[#042C51] text-white shadow-xs"
                    : "text-[#215789] hover:bg-white/50"
                }`}
              >
                <Layout className="w-3.5 h-3.5 text-[#FF5C28]" />
                <span>Dual-Pane Flow Spec</span>
              </button>
            </div>

            {/* Print & Download Buttons */}
            <button
              onClick={handlePrint}
              className="px-3.5 py-2 rounded-xl bg-white border border-[#BECBDA] text-[#042C51] hover:bg-[#F7F9FC] font-semibold text-xs transition-colors flex items-center gap-2 cursor-pointer shadow-xs"
              title="Print page layout using browser dialog"
            >
              <Printer className="w-4 h-4 text-[#215789]" />
              <span>Print View</span>
            </button>

            {/* Dual Download Buttons */}
            <button
              onClick={handleDownloadDualPanePdf}
              disabled={isGeneratingPdf}
              className="px-3.5 py-2 rounded-xl bg-white border border-[#BECBDA] text-[#042C51] hover:bg-[#F7F9FC] font-extrabold text-xs transition-colors flex items-center gap-2 cursor-pointer shadow-xs disabled:opacity-50"
              title="Download 5-page A4 Landscape Flowchart + Specbook PDF"
            >
              <GitFork className="w-4 h-4 text-[#215789]" />
              <span>Flowchart Spec PDF</span>
            </button>

            <button
              onClick={handleDownloadFullPrototypePdf}
              disabled={isGeneratingPdf}
              className="px-4 py-2 rounded-xl bg-[#FF5C28] hover:bg-[#e04f20] text-white font-extrabold text-xs transition-all flex items-center gap-2 cursor-pointer shadow-md shadow-orange-900/10 disabled:opacity-50"
              title="Download official 5-page Full-Bleed High-Definition Prototype Screen PDF"
            >
              {isGeneratingPdf ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Capturing Prototype...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 text-white" />
                  <span>Download Full Prototype PDF</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* 5-Phase Screen Step Navigation Tabs */}
        <div className="max-w-[1920px] mx-auto mt-4 pt-3 border-t border-[#E6ECF2] flex items-center justify-between overflow-x-auto gap-2 scrollbar-none">
          <div className="flex items-center gap-2 shrink-0">
            {WORKFLOW_PAGES.map((pg, idx) => (
              <button
                key={pg.pageNumber}
                onClick={() => {
                  setActivePageIndex(idx);
                  setHighlightedCallout(null);
                }}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                  activePageIndex === idx
                    ? "bg-[#042C51] text-white shadow-xs"
                    : "bg-[#F7F9FC] text-[#667085] hover:text-[#042C51] hover:bg-[#E6EAF0] border border-[#E6ECF2]"
                }`}
              >
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${
                  activePageIndex === idx ? "bg-[#FF5C28] text-white" : "bg-[#BECBDA] text-[#042C51]"
                }`}>
                  {pg.pageNumber}
                </span>
                <span className="whitespace-nowrap">{pg.title.split(":")[1] || pg.title}</span>
              </button>
            ))}
          </div>

          <div className="hidden lg:flex items-center gap-2 text-[11px] text-[#667085] font-semibold shrink-0">
            <span className="px-2 py-0.5 rounded bg-[#EBF5FB] text-[#21618C] border border-[#AED6F1]">
              Phase {activePageIndex + 1} of 5
            </span>
            <span className="px-2 py-0.5 rounded bg-[#E8F8F0] text-[#1E8449] border border-[#A9DFBF]">
              {currentPage.slaTarget}
            </span>
          </div>
        </div>
      </div>

      {/* ==================== MAIN VIEWPORT CONTAINER ==================== */}
      <div className="max-w-[1920px] mx-auto px-6 pt-6 w-full flex-1">

        {/* ----------------- MODE 1: FULL PROTOTYPE SCREEN VIEW ----------------- */}
        {viewMode === "prototype" ? (
          <div className="space-y-6">
            {/* Process Banner & Validations Strip */}
            <div className="bg-white rounded-2xl border border-[#E6ECF2] shadow-xs p-5 space-y-3">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-[#E6ECF2] pb-3">
                <div className="flex items-center gap-3">
                  <span className="px-2.5 py-1 rounded bg-[#042C51] text-[#FF5C28] text-xs font-black uppercase tracking-wider">
                    {currentPage.phaseTag}
                  </span>
                  <div>
                    <h2 className="text-base font-black text-[#042C51]">{currentPage.title}</h2>
                    <p className="text-xs text-[#667085] font-medium">{currentPage.subtitle}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-lg bg-[#E8F8F0] text-[#1E8449] text-xs font-bold border border-[#A9DFBF]">
                    SLA: {currentPage.slaTarget}
                  </span>
                  {onSwitchModule && (
                    <button
                      onClick={() => setViewMode("dual")}
                      className="px-3 py-1.5 rounded-xl bg-[#F7F9FC] border border-[#BECBDA] text-[#042C51] hover:bg-[#E6EAF0] text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      <Layout className="w-3.5 h-3.5 text-[#215789]" />
                      <span>View Flowchart Spec</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Key Validation Rules Row */}
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="font-bold text-[#042C51] uppercase text-[10.5px] tracking-wide">
                  Enforced Process Validations:
                </span>
                {currentPage.screenCallouts.flatMap(c => c.validations).slice(0, 5).map((val, idx) => (
                  <span key={idx} className="px-2.5 py-1 rounded-md bg-[#EBF5FB] text-[#21618C] font-semibold border border-[#AED6F1] text-[11px] flex items-center gap-1">
                    <CheckCircle className="w-3 h-3 text-[#21618C]" />
                    <span>{val}</span>
                  </span>
                ))}
              </div>
            </div>

            {/* Browser Window Chrome Wrapper around Live Component */}
            <div
              ref={screenRef}
              id={`live-screen-container-${activePageIndex}`}
              className="bg-white rounded-2xl border border-[#CBD5E1] shadow-md overflow-hidden"
            >
              {/* Browser Address Bar Header */}
              <div className="bg-[#042C51] px-4 py-2.5 flex items-center justify-between border-b border-[#0B365F]">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <div className="w-3 h-3 rounded-full bg-yellow-400" />
                  <div className="w-3 h-3 rounded-full bg-green-400" />
                </div>
                <div className="flex-1 max-w-xl mx-4 bg-[#0B365F] rounded-lg px-4 py-1 text-xs font-extrabold text-[#8FAEC9] border border-[#13406D] truncate text-center shadow-inner">
                  {activePageIndex === 0 && "https://hris.sibs.com/workforce-planning/ramps-capacity-matrix"}
                  {activePageIndex === 1 && "https://hris.sibs.com/sourcing/applicant-leads-hub?channel=all"}
                  {activePageIndex === 2 && "https://hris.sibs.com/pipeline/candidate-evaluation-assessment"}
                  {activePageIndex === 3 && "https://hris.sibs.com/offers/compensation-builder-approval"}
                  {activePageIndex === 4 && "https://hris.sibs.com/onboarding/pre-employment-compliance-matrix"}
                </div>
                <div className="flex items-center gap-2 text-xs font-bold text-white bg-[#13406D] px-2.5 py-1 rounded-md border border-[#1A4C7B]">
                  <span className="w-2 h-2 rounded-full bg-[#2ECC71] animate-pulse" />
                  <span>SiBS HRIS Prototype Screen</span>
                </div>
              </div>

              {/* RENDER ACTUAL LIVE PROTOTYPE COMPONENT */}
              <div className="p-6 bg-[#F7F9FC]">
                {renderLivePrototypeComponent()}
              </div>
            </div>
          </div>
        ) : (

          /* ----------------- MODE 2: DUAL-PANE FLOWCHART & SCREEN SPECBOOK ----------------- */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* LEFT PANE (45%): PROCESS LOGIC & FLOWCHART */}
            <div className="lg:col-span-5 bg-white rounded-2xl border border-[#E6ECF2] shadow-xs p-5 space-y-5">
              {/* Left Header */}
              <div className="p-3.5 rounded-xl bg-[#042C51] text-white space-y-1 relative overflow-hidden">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded text-[9.5px] font-black uppercase tracking-wider text-[#FFA488] bg-white/10 border border-white/20">
                    {currentPage.phaseTag}
                  </span>
                  <span className="text-[10px] font-bold text-[#E2E8F0]">
                    {currentPage.imageReference}
                  </span>
                </div>
                <h2 className="text-sm font-black text-white">{currentPage.title}</h2>
                <p className="text-[11px] text-[#8FAEC9]">{currentPage.subtitle}</p>
              </div>

              {/* Process Nodes Flowchart Vertical Pipeline */}
              <div className="space-y-3 relative before:absolute before:left-5 before:top-4 before:bottom-4 before:w-0.5 before:bg-[#CBD5E1]">
                {currentPage.processNodes.map((node, nIdx) => (
                  <div
                    key={nIdx}
                    className={`relative pl-10 transition-all rounded-xl p-3 border ${
                      node.type === "decision"
                        ? "bg-[#FEF5E7] border-[#FAD7A0]"
                        : node.type === "end"
                          ? "bg-[#E8F8F0] border-[#A9DFBF]"
                          : "bg-[#F7F9FC] border-[#E6ECF2]"
                    }`}
                  >
                    {/* Step Circle Badge */}
                    <div className={`absolute left-2.5 top-3.5 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black text-white shadow-xs ${
                      node.type === "decision"
                        ? "bg-[#FF5C28]"
                        : node.type === "end"
                          ? "bg-[#2ECC71]"
                          : "bg-[#042C51]"
                    }`}>
                      {nIdx + 1}
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="text-xs font-black text-[#042C51]">{node.label}</h3>
                        <span className="px-2 py-0.5 rounded text-[9.5px] font-bold bg-[#E6EAF0] text-[#215789]">
                          {node.owner}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#475569]">{node.description}</p>

                      {node.branches && (
                        <div className="pt-1 flex items-center gap-3 text-[10.5px] font-bold">
                          <div className="flex items-center gap-1 text-[#1E8449]">
                            <CheckCircle className="w-3.5 h-3.5" />
                            <span>[YES Branch]: {node.branches.yes}</span>
                          </div>
                          <div className="flex items-center gap-1 text-[#B03A2E]">
                            <AlertTriangle className="w-3.5 h-3.5" />
                            <span>[NO Branch]: {node.branches.no}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* RIGHT PANE (55%): LIVE SCREEN COMPONENT + COMPONENT CALLOUT CARDS */}
            <div className="lg:col-span-7 space-y-6">
              {/* Live Prototype Screen Frame inside Dual Pane */}
              <div
                ref={screenRef}
                id={`live-screen-container-${activePageIndex}`}
                className="bg-white rounded-2xl border border-[#CBD5E1] shadow-xs overflow-hidden p-4 space-y-3"
              >
                <div className="p-3 rounded-xl bg-[#042C51] text-white flex items-center justify-between">
                  <div>
                    <span className="text-[9.5px] font-black uppercase tracking-wider text-[#FFA488]">
                      Frontend Prototype UI Screen
                    </span>
                    <h2 className="text-xs font-black text-white">Corresponding SiBS HRIS Live Component</h2>
                  </div>
                  <button
                    onClick={() => setViewMode("prototype")}
                    className="px-2.5 py-1 rounded bg-[#FF5C28] text-white text-[10.5px] font-black uppercase flex items-center gap-1 hover:bg-[#e04f20] cursor-pointer"
                  >
                    <Maximize2 className="w-3 h-3" />
                    <span>Expand Full Screen</span>
                  </button>
                </div>

                <div className="bg-[#F7F9FC] p-4 rounded-xl border border-[#E2E8F0] overflow-x-auto max-h-[600px] overflow-y-auto">
                  {renderLivePrototypeComponent()}
                </div>
              </div>

              {/* Screen Callout Cards */}
              <div className="bg-white rounded-2xl border border-[#E6ECF2] shadow-xs p-5 space-y-4">
                <h3 className="text-xs font-black text-[#042C51] uppercase tracking-wider border-b border-[#E6ECF2] pb-2">
                  5 Pinned Screen Component Callouts &amp; Enforcement Rules
                </h3>

                {currentPage.screenCallouts.map((callout) => {
                  const isHighlighted = highlightedCallout === callout.number;
                  return (
                    <div
                      key={callout.number}
                      onMouseEnter={() => setHighlightedCallout(callout.number)}
                      onMouseLeave={() => setHighlightedCallout(null)}
                      className={`rounded-2xl border p-4 transition-all relative overflow-hidden space-y-3 ${
                        isHighlighted
                          ? "bg-[#FFF2ED] border-[#FF5C28] shadow-md ring-1 ring-[#FF5C28]"
                          : "bg-white border-[#E6ECF2] hover:border-[#BECBDA] shadow-xs"
                      }`}
                    >
                      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#042C51] to-[#FF5C28]" />

                      <div className="flex items-start justify-between gap-3 pt-1">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-[#042C51] text-white flex items-center justify-center font-black text-xs shadow-xs shrink-0">
                            {callout.number}
                          </div>
                          <div>
                            <h3 className="text-sm font-black text-[#042C51] leading-tight">
                              {callout.title}
                            </h3>
                            <p className="text-[10.5px] font-semibold text-[#667085]">
                              Screen: <span className="text-[#215789]">{callout.screenName}</span>
                            </p>
                          </div>
                        </div>

                        {onSwitchModule && (
                          <button
                            onClick={() => onSwitchModule(callout.moduleKey)}
                            className="px-3 py-1.5 rounded-lg bg-[#042C51] hover:bg-[#FF5C28] text-white text-[10.5px] font-bold flex items-center gap-1 transition-colors cursor-pointer shrink-0 shadow-xs"
                          >
                            <span>Launch Screen</span>
                            <ExternalLink className="w-3 h-3" />
                          </button>
                        )}
                      </div>

                      <p className="text-xs text-[#334155] leading-relaxed">
                        {callout.description}
                      </p>

                      <div className="pt-2 border-t border-[#F1F5F9] flex flex-wrap items-center gap-2">
                        <span className="text-[9.5px] font-bold uppercase tracking-wider text-[#94A9C1]">
                          Validation Rules:
                        </span>
                        {callout.validations.map((val, vIdx) => (
                          <span
                            key={vIdx}
                            className="px-2 py-0.5 rounded bg-[#EBF5FB] text-[#21618C] text-[10.5px] font-semibold border border-[#AED6F1]"
                          >
                            • {val}
                          </span>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Offscreen Hidden Containers for capturing all 5 pages for PDF export */}
      <div className="fixed -left-[9999px] top-0 pointer-events-none opacity-100 overflow-hidden w-[1280px] -z-50">
        <div id="pdf-offscreen-screen-0" className="p-6 bg-[#F7F9FC]">
          <HiringNeedsIntake userEmail="alena.batacan@thesiblingssolutions.com" />
        </div>
        <div id="pdf-offscreen-screen-1" className="p-6 bg-[#F7F9FC]">
          <ApplicantLeads userEmail="alena.batacan@thesiblingssolutions.com" />
        </div>
        <div id="pdf-offscreen-screen-2" className="p-6 bg-[#F7F9FC]">
          <CandidatePipeline userEmail="alena.batacan@thesiblingssolutions.com" />
        </div>
        <div id="pdf-offscreen-screen-3" className="p-6 bg-[#F7F9FC]">
          <Offers userEmail="alena.batacan@thesiblingssolutions.com" />
        </div>
        <div id="pdf-offscreen-screen-4" className="p-6 bg-[#F7F9FC]">
          <Onboarding userEmail="alena.batacan@thesiblingssolutions.com" />
        </div>
      </div>
    </div>
  );
}
