import React, { useState } from "react";
import { 
  BarChart2, 
  Layers, 
  ExternalLink, 
  Code2, 
  Copy, 
  Check, 
  ArrowRight, 
  ArrowDown, 
  RefreshCw, 
  CheckCircle2, 
  Sliders, 
  Users, 
  Database,
  Sparkles,
  ChevronRight,
  Calculator,
  Calendar,
  Clock,
  AlertTriangle,
  ZoomIn,
  ZoomOut,
  X,
  Play,
  FileSpreadsheet
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { MERMAID_DIAGRAMS } from "./flowchartData";
import { HorizontalFlowArrow, VerticalFlowArrow, DecisionBranchConnector } from "./FlowArrow";

interface Process3Props {
  onSwitchModule?: (moduleKey: string) => void;
}

interface StepNodeInfo {
  id: string;
  code: string;
  title: string;
  role: string;
  track: "common" | "overview" | "plan";
  description: string;
  inputs: string[];
  outputs: string[];
  formula?: string;
  moduleKey?: string;
  rules: string[];
}

export default function Process3WorkforcePlanning({ onSwitchModule }: Process3Props) {
  const [activePath, setActivePath] = useState<"both" | "overview" | "plan">("both");
  const [showMermaidCode, setShowMermaidCode] = useState(false);
  const [copied, setCopied] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(100);
  const [selectedNode, setSelectedNode] = useState<StepNodeInfo | null>(null);

  // Interactive Ramp Simulator State
  const [simReq, setSimReq] = useState(400);
  const [simAct, setSimAct] = useState(365);
  const [simWeeks, setSimWeeks] = useState(4);
  const [simAttritionRate, setSimAttritionRate] = useState(8); // 8% expected training falloff

  const simGap = Math.max(0, simReq - simAct);
  const simBufferPct = (((simAct - simReq) / simReq) * 100).toFixed(1);
  const grossHiringNeeded = Math.ceil(simGap / (1 - simAttritionRate / 100));

  const handleCopyMermaid = () => {
    navigator.clipboard.writeText(MERMAID_DIAGRAMS["process-3-workforce"].code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Node details directory for inspector
  const STEP_DETAILS: Record<string, StepNodeInfo> = {
    "START": {
      id: "START",
      code: "START",
      title: "Account Hiring Request Identified",
      role: "Operations Manager / Account Director",
      track: "common",
      description: "Business requirement identified when an active account signs seat expansions, new shifts, or experiences attrition requiring capacity replenishment.",
      inputs: ["Client SLA Contract", "Forecasted Call Volume", "Current Floor Seat Count"],
      outputs: ["Intake Trigger Ticket", "Target Hiring Date"],
      rules: ["Must have signed statement of work (SOW) or client forecast approval."]
    },
    "STEP1": {
      id: "STEP1",
      code: "STEP 1",
      title: "Cluster & Account Selection",
      role: "Workforce Planning Principal",
      track: "common",
      description: "Assigns the demand to the correct Operations Cluster (Telecom, Healthcare, Financial, or Tech) and specific client account.",
      inputs: ["Enterprise Cluster Hierarchy", "Campus Allocation (Tagum, Davao, Mabini)"],
      outputs: ["Target Account Profile", "Base Staffing Ratio"],
      rules: ["Account must belong to an active business cluster with approved campus desks."]
    },
    "STEP2": {
      id: "STEP2",
      code: "STEP 2",
      title: "Evaluate Required Headcount vs Actual Capacity",
      role: "Capacity Analyst",
      track: "common",
      description: "Compares client contracted seat requirements against the active biometric floor attendance roster.",
      inputs: ["Active Employee Master Roster", "Approved SOW Headcount"],
      outputs: ["Raw Headcount Variance", "Occupancy Ratio"],
      formula: "Raw Variance = Actual Headcount - Required Headcount",
      rules: ["Biometric roster pulled fresh within 15-minute sync interval."]
    },
    "CALC": {
      id: "CALC",
      code: "ENGINE",
      title: "Compute Gap, Buffer % & Ramp Variance",
      role: "Automated WFM Engine",
      track: "common",
      description: "Mathematical computation of hiring deficit seats, buffer cushion percentage, and gross hiring requirements accounting for attrition curves.",
      inputs: ["Required HC", "Actual HC", "Historical Attrition Curve %"],
      outputs: ["Deficit Seat Count", "Buffer % Status", "Gross Hiring Target"],
      formula: "Buffer % = ((Actual - Required) / Required) * 100",
      rules: ["Deficits greater than 5% trigger priority red flag alerts across executive cockpits."]
    },
    "V1": {
      id: "V1",
      code: "DECISION",
      title: "Viewing Mode Routing Decision",
      role: "User Gating / Router",
      track: "common",
      description: "Routes user workflow between high-level macro cluster monitoring (Overview Screen) and granular class cohort scheduling (Plan Screen Drawer).",
      inputs: ["User Intent", "Role Permissions"],
      outputs: ["Path A: Overview Dashboard Route", "Path B: Plan Ledger Route"],
      rules: ["Ops Managers default to Overview; WFM Capacity Planners default to Plan Drawer."]
    },
    "OV1": {
      id: "OV1",
      code: "OV1",
      title: "Workforce Coverage KPIs",
      role: "Operations Director & Executive",
      track: "overview",
      description: "Top-level KPI summary displaying Macro Coverage %, Required HC (2,450), Actual HC (2,310), and Active Deficits.",
      inputs: ["Aggregated Account Roster Data"],
      outputs: ["Global Coverage Metric", "Deficit Seat Counter"],
      moduleKey: "Workforce Hiring",
      rules: ["Updates in real-time as onboarding classes graduate."]
    },
    "OV2": {
      id: "OV2",
      code: "OV2",
      title: "Cluster Progress Cards",
      role: "Cluster Operations Manager",
      track: "overview",
      description: "Visual progress cards breaking down performance across Telecom (94%), Healthcare (88%), Financial (96%), and Tech (98%).",
      inputs: ["Cluster Aggregations"],
      outputs: ["Cluster Health Badges", "At-Risk Account Flags"],
      moduleKey: "Workforce Hiring",
      rules: ["Highlights clusters falling below 90% SLA staffing threshold."]
    },
    "OV3": {
      id: "OV3",
      code: "OV3",
      title: "Account Hiring Ramps Ledger",
      role: "Operations Manager",
      track: "overview",
      description: "Tabular overview of every client account with progress bars, buffer status, and quick drilldowns.",
      inputs: ["All Account Capacity Ledgers"],
      outputs: ["Sorted Account Table", "Drilldown Trigger"],
      moduleKey: "Workforce Hiring",
      rules: ["Allows one-click launch into full Plan Schedule Drawer."]
    },
    "OV4": {
      id: "OV4",
      code: "OV4",
      title: "Expand Detailed Headcount Breakdown",
      role: "WFM Lead",
      track: "overview",
      description: "Row expansion revealing shifts, campus site distributions, and historical hiring velocity.",
      inputs: ["Account Row Click"],
      outputs: ["Granular Shift Line Data", "Ramp Deficit Breakdown"],
      moduleKey: "Workforce Hiring",
      rules: ["Cross-references active candidate counts currently in TA screening."]
    },
    "PL1": {
      id: "PL1",
      code: "PL1",
      title: "Plan Ledger Table",
      role: "Workforce Planner",
      track: "plan",
      description: "Dedicated scenario planning grid with required dates, target hiring rates, and committed class start dates.",
      inputs: ["Master Planning Data"],
      outputs: ["Editable Scenario Rows"],
      moduleKey: "Workforce Hiring",
      rules: ["Maintains revision history and draft scenario states."]
    },
    "PL2": {
      id: "PL2",
      code: "PL2",
      title: "Open Plan Drawer",
      role: "Capacity Planner",
      track: "plan",
      description: "High-density slide-over drawer enabling deep configuration of wave dates, class sizes, and training cohorts.",
      inputs: ["Account Row Click"],
      outputs: ["Interactive Plan Drawer State"],
      moduleKey: "Workforce Hiring",
      rules: ["Locks other planners from concurrent conflicting edits."]
    },
    "PL3": {
      id: "PL3",
      code: "PL3",
      title: "Training Cohorts & Ramp Milestones",
      role: "WFM & Training Lead",
      track: "plan",
      description: "Milestone timeline tracking cohort progression through New Hire Orientation (NHO), Foundation Skills Training (FST), Product Specific Training (PST), and Go-Live.",
      inputs: ["Class Start Date", "Curriculum Duration (Weeks)"],
      outputs: ["Cohort Graduation Date", "Floor Production Date"],
      moduleKey: "Workforce Hiring",
      rules: ["Calculates expected fallout curve at each training gate."]
    },
    "PL4": {
      id: "PL4",
      code: "PL4",
      title: "Assign Recruitment Action Items",
      role: "TA Recruiter & WFM Lead",
      track: "plan",
      description: "Generates actionable recruitment tasks, assigns recruiter owners, sets hard deadlines, and logs mitigation strategies for at-risk ramps.",
      inputs: ["Gross Hires Needed", "Deadline Date"],
      outputs: ["Action Item Task Tickets", "Assigned Recruiter SLA"],
      moduleKey: "Action Items",
      rules: ["Automatically registers tasks in the Action Items & Task Execution module."]
    },
    "PL5": {
      id: "PL5",
      code: "PL5",
      title: "Save & Synchronize Headcount Records",
      role: "WFM Principal / Admin",
      track: "plan",
      description: "Commits scenario to enterprise database, updates global capacity numbers, and automatically generates Hiring Needs Intake tickets for Talent Acquisition.",
      inputs: ["Approved Cohort Schedule", "Action Items"],
      outputs: ["Committed Headcount Record", "TA Requisition Ticket"],
      moduleKey: "Workforce Hiring",
      rules: ["Broadcasts notification to TA Recruiter and OM Dashboards."]
    }
  };

  return (
    <div className="space-y-6">
      {/* ==================== 1. HEADER & CONTROLS ==================== */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2.5 py-0.5 rounded-full bg-[#FF5C28] text-white text-[10px] font-black uppercase tracking-wider">
              PROCESS 3 OF 5
            </span>
            <h2 className="text-base sm:text-lg font-black text-[#042C51] tracking-tight">
              Workforce Planning & Capacity Ramp Flowchart
            </h2>
            <span className="px-2 py-0.5 rounded-full bg-orange-50 text-[#FF5C28] text-[10px] font-black border border-orange-200">
              Dual-Path Execution
            </span>
          </div>
          <p className="text-xs text-slate-600 font-medium mt-1">
            Operational workflows mapping hiring demand intake, required vs. actual capacity math, and dual-mode execution (Overview KPI Board vs. Plan Drawer Cohort Modeling).
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Path Mode Selector */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-bold">
            <button
              onClick={() => setActivePath("both")}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                activePath === "both" ? "bg-[#042C51] text-white shadow-2xs" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              All Paths (Dual)
            </button>
            <button
              onClick={() => setActivePath("overview")}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                activePath === "overview" ? "bg-[#1D68BD] text-white shadow-2xs" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Overview Path (A)
            </button>
            <button
              onClick={() => setActivePath("plan")}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                activePath === "plan" ? "bg-[#FF5C28] text-white shadow-2xs" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Plan Screen Path (B)
            </button>
          </div>

          {/* Zoom Controls */}
          <div className="hidden sm:flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-xl p-1 text-xs">
            <button
              onClick={() => setZoomLevel(prev => Math.max(80, prev - 10))}
              className="p-1 text-slate-600 hover:text-[#042C51] rounded hover:bg-slate-200"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="text-[10px] font-mono font-bold px-1 text-slate-600">{zoomLevel}%</span>
            <button
              onClick={() => setZoomLevel(prev => Math.min(130, prev + 10))}
              className="p-1 text-slate-600 hover:text-[#042C51] rounded hover:bg-slate-200"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            onClick={() => setShowMermaidCode(prev => !prev)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
              showMermaidCode ? "bg-[#042C51] text-white border-[#042C51]" : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>Mermaid</span>
          </button>
        </div>
      </div>

      {/* ==================== EXPANDABLE MERMAID SOURCE ==================== */}
      {showMermaidCode && (
        <div className="bg-slate-900 text-slate-100 rounded-2xl p-5 border border-slate-800 shadow-md">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
            <div className="flex items-center gap-2 text-xs font-black text-amber-400">
              <Code2 className="w-4 h-4" />
              <span>Mermaid Definition (Process 3: Workforce Planning & Ramp)</span>
            </div>
            <button
              onClick={handleCopyMermaid}
              className="flex items-center gap-1 px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-lg border border-slate-700 transition-all cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? "Copied!" : "Copy Code"}</span>
            </button>
          </div>
          <pre className="text-[11px] font-mono text-emerald-400 overflow-x-auto whitespace-pre leading-relaxed p-2 bg-slate-950/80 rounded-xl border border-slate-800">
            {MERMAID_DIAGRAMS["process-3-workforce"].code}
          </pre>
        </div>
      )}

      {/* ==================== 4 WORKFORCE PROCESS CHEVRONS ==================== */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 text-center font-black text-xs">
        <div className="bg-[#EBF3FC] text-[#1D68BD] border border-blue-200 rounded-2xl p-3 shadow-2xs">
          <div className="text-[11px] uppercase tracking-wider font-black">1. INTAKE & FORECAST</div>
          <div className="text-[10px] text-slate-600 font-medium mt-0.5">Account demand & cluster selection</div>
        </div>
        <div className="bg-amber-50 text-amber-800 border border-amber-200 rounded-2xl p-3 shadow-2xs">
          <div className="text-[11px] uppercase tracking-wider font-black">2. CAPACITY FORMULA</div>
          <div className="text-[10px] text-slate-600 font-medium mt-0.5">Required vs. actual deficit math</div>
        </div>
        <div className="bg-[#EDF4FA] text-[#042C51] border border-slate-300 rounded-2xl p-3 shadow-2xs">
          <div className="text-[11px] uppercase tracking-wider font-black">3. DUAL ROUTING</div>
          <div className="text-[10px] text-slate-600 font-medium mt-0.5">Overview KPI vs Plan Drawer</div>
        </div>
        <div className="bg-orange-50 text-[#FF5C28] border border-orange-200 rounded-2xl p-3 shadow-2xs">
          <div className="text-[11px] uppercase tracking-wider font-black">4. RAMP & COMMITMENT</div>
          <div className="text-[10px] text-slate-600 font-medium mt-0.5">Cohort milestones & TA task sync</div>
        </div>
      </div>

      {/* ==================== MAIN FLOWCHART CANVAS & INSPECTOR ==================== */}
      <div 
        className="flex-1 flex flex-col lg:flex-row gap-6 items-start"
        style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: "top left" }}
      >
        <div className="flex-1 w-full space-y-6">
          {/* ==================== STAGE 1: INTAKE & MATHEMATICAL FORMULA ENGINE ==================== */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-md bg-[#042C51] text-white text-[10px] font-black uppercase tracking-wider">
                  PHASE 1 PIPELINE
                </span>
                <h3 className="text-sm font-black text-[#042C51]">
                  Demand Intake, Cluster Identification & Capacity Math Flow
                </h3>
              </div>
              <span className="text-xs text-slate-500 font-bold">Sequential Workflow (Steps 1–3)</span>
            </div>

            {/* Horizontal Flow Pipeline with Prominent Flow Arrows */}
            <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto pb-3 pt-1">
              {/* START NODE */}
              <div 
                onClick={() => setSelectedNode(STEP_DETAILS["START"])}
                className="cursor-pointer shrink-0 w-[170px] bg-gradient-to-r from-emerald-600 to-teal-600 text-white p-4 rounded-2xl shadow-md border-2 border-emerald-400 hover:scale-102 transition-transform text-center"
              >
                <div className="flex items-center justify-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-emerald-200">
                  <span className="w-2 h-2 rounded-full bg-white animate-ping"></span>
                  <span>SYSTEM TRIGGER</span>
                </div>
                <h4 className="text-xs font-black mt-1">START: Hiring Request</h4>
                <p className="text-[10px] text-emerald-100 mt-0.5">SOW expansion identified</p>
              </div>

              {/* FLOW ARROW 1: START -> STEP 1 */}
              <HorizontalFlowArrow
                label="Assign Cluster"
                sublabel="Select Account"
                color="emerald"
                length="md"
              />

              {/* STEP 1: Cluster & Account Selection */}
              <div 
                onClick={() => setSelectedNode(STEP_DETAILS["STEP1"])}
                className="cursor-pointer shrink-0 w-[180px] bg-slate-50 hover:bg-slate-100/90 border-2 border-slate-200 hover:border-[#1D68BD] p-4 rounded-2xl transition-all shadow-2xs"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[9.5px] font-black text-slate-400 uppercase">STEP 1</span>
                  <span className="text-[9px] font-black bg-white px-1.5 py-0.5 rounded border text-slate-600">Telecom / Fin</span>
                </div>
                <h4 className="text-xs font-black text-[#042C51] mt-1">Cluster Selection</h4>
                <p className="text-[10.5px] text-slate-500 mt-0.5">Maps cluster, account & campus facility.</p>
              </div>

              {/* FLOW ARROW 2: STEP 1 -> STEP 2 */}
              <HorizontalFlowArrow
                label="Sync Roster"
                sublabel="Compare Seats"
                color="blue"
                length="md"
              />

              {/* STEP 2: Evaluate Required Headcount vs Actual */}
              <div 
                onClick={() => setSelectedNode(STEP_DETAILS["STEP2"])}
                className="cursor-pointer shrink-0 w-[190px] bg-blue-50/60 hover:bg-blue-50 border-2 border-blue-200 hover:border-[#1D68BD] p-4 rounded-2xl transition-all shadow-2xs"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[9.5px] font-black text-blue-600 uppercase">STEP 2</span>
                  <span className="text-[9px] font-black bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded">Roster Sync</span>
                </div>
                <h4 className="text-xs font-black text-[#042C51] mt-1">Required vs Capacity</h4>
                <p className="text-[10.5px] text-slate-500 mt-0.5">Evaluates required seats against active roster.</p>
              </div>

              {/* FLOW ARROW 3: STEP 2 -> STEP 3 */}
              <HorizontalFlowArrow
                label="Run Math"
                sublabel="Buffer Cushion"
                color="amber"
                length="md"
              />

              {/* STEP 3: Automated Capacity Formula Engine */}
              <div 
                onClick={() => setSelectedNode(STEP_DETAILS["CALC"])}
                className="cursor-pointer shrink-0 w-[200px] bg-amber-50 hover:bg-amber-100/70 border-2 border-amber-300 hover:border-amber-400 p-4 rounded-2xl transition-all shadow-2xs"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[9.5px] font-black text-amber-800 uppercase flex items-center gap-1">
                    <Sliders className="w-3 h-3 text-amber-600" />
                    <span>FORMULA</span>
                  </span>
                  <span className="text-[9px] font-black bg-amber-200 text-amber-900 px-1.5 py-0.5 rounded">Math Logic</span>
                </div>
                <h4 className="text-xs font-black text-[#042C51] mt-1">Gap & Buffer % Engine</h4>
                <p className="text-[10.5px] text-slate-600 mt-0.5">Calculates deficit seats and buffer cushion %.</p>
              </div>
            </div>

            {/* Interactive Live Capacity Formula Preview Box */}
            <div className="bg-gradient-to-br from-amber-50/80 via-white to-orange-50/50 border-2 border-amber-200 rounded-2xl p-4 shadow-inner">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-amber-200">
                <div className="flex items-center gap-2">
                  <Calculator className="w-4 h-4 text-amber-700" />
                  <span className="text-xs font-black text-[#042C51]">
                    Interactive Capacity & Buffer Simulation Lab
                  </span>
                  <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-amber-200 text-amber-900">
                    Live Calculator
                  </span>
                </div>
                <span className="text-[11px] text-slate-500 font-medium">
                  Formula: <code className="font-mono font-bold text-amber-900">Buffer % = ((Actual - Required) / Required) × 100</code>
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3">
                <div className="bg-white p-2.5 rounded-xl border border-amber-200 shadow-2xs">
                  <span className="text-[10px] font-bold text-slate-500 uppercase block">Required Headcount</span>
                  <input 
                    type="number" 
                    value={simReq} 
                    onChange={e => setSimReq(Number(e.target.value))}
                    className="w-full font-mono font-black text-sm text-[#042C51] border-b-2 border-blue-400 focus:outline-none mt-1"
                  />
                  <span className="text-[9px] text-slate-400 mt-0.5 block">Client contracted seats</span>
                </div>

                <div className="bg-white p-2.5 rounded-xl border border-amber-200 shadow-2xs">
                  <span className="text-[10px] font-bold text-slate-500 uppercase block">Actual Floor HC</span>
                  <input 
                    type="number" 
                    value={simAct} 
                    onChange={e => setSimAct(Number(e.target.value))}
                    className="w-full font-mono font-black text-sm text-[#042C51] border-b-2 border-teal-400 focus:outline-none mt-1"
                  />
                  <span className="text-[9px] text-slate-400 mt-0.5 block">Active biometric roster</span>
                </div>

                <div className="bg-white p-2.5 rounded-xl border border-amber-200 shadow-2xs">
                  <span className="text-[10px] font-bold text-slate-500 uppercase block">Hiring Deficit</span>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="font-mono font-black text-base text-red-600">
                      {simGap}
                    </span>
                    <span className="text-xs font-bold text-red-600">Seats</span>
                  </div>
                  <span className="text-[9px] text-red-500 font-medium">
                    {simGap > 0 ? "Immediate requisition needed" : "Staffing quota satisfied"}
                  </span>
                </div>

                <div className="bg-white p-2.5 rounded-xl border border-amber-200 shadow-2xs">
                  <span className="text-[10px] font-bold text-slate-500 uppercase block">Buffer Variance %</span>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className={`font-mono font-black text-base ${Number(simBufferPct) < 0 ? "text-red-600" : "text-emerald-600"}`}>
                      {simBufferPct}%
                    </span>
                  </div>
                  <span className={`text-[9px] font-bold ${Number(simBufferPct) < 0 ? "text-red-600" : "text-emerald-600"}`}>
                    {Number(simBufferPct) < 0 ? "Staffing Deficit Warning" : "Positive Cushion Buffer"}
                  </span>
                </div>
              </div>
            </div>

            {/* ROUTING DECISION GATEWAY WITH DUAL BRANCH ARROWS */}
            <div className="pt-2 flex flex-col items-center">
              <VerticalFlowArrow
                color="blue"
                label="Feed Formula"
                length="md"
                animated={true}
              />
              <div 
                onClick={() => setSelectedNode(STEP_DETAILS["V1"])}
                className="cursor-pointer group px-7 py-3.5 bg-[#042C51] hover:bg-[#09477e] text-white rounded-2xl shadow-lg border-2 border-blue-400 text-center flex items-center gap-3 transition-all"
              >
                <div className="w-7 h-7 rounded-lg bg-blue-500/30 text-blue-200 flex items-center justify-center font-black text-sm">
                  ◆
                </div>
                <div>
                  <span className="text-[9px] font-black uppercase tracking-wider text-blue-300 block">
                    DECISION GATEWAY (V1)
                  </span>
                  <span className="text-xs font-black">
                    Viewing Mode Routing Decision
                  </span>
                </div>
                <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-md font-bold">
                  Overview vs Plan
                </span>
              </div>

              {/* Visual Branch Splitter Component */}
              <DecisionBranchConnector
                leftLabel="Branch A: Overview Route"
                leftSublabel="Executive & Macro KPIs"
                leftColor="blue"
                rightLabel="Branch B: Plan Drawer Route"
                rightSublabel="Cohort Wave Modeling"
                rightColor="orange"
                animated={true}
              />
            </div>
          </div>

          {/* ==================== STAGE 2: DUAL BRANCH PARALLEL EXECUTION ==================== */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* PATH A: OVERVIEW SCREEN TRACK (BLUE THEME) */}
            {(activePath === "both" || activePath === "overview") && (
              <div className="bg-gradient-to-b from-blue-50/40 via-white to-blue-50/20 border-2 border-blue-200 rounded-3xl p-5 space-y-4 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-blue-200">
                    <div>
                      <span className="px-2.5 py-0.5 rounded-md bg-[#1D68BD] text-white text-[10px] font-black uppercase">
                        PATH A • OVERVIEW SCREEN
                      </span>
                      <h4 className="text-sm font-black text-[#042C51] mt-1">
                        Macro Workforce Coverage & Cluster Boards
                      </h4>
                    </div>
                    {onSwitchModule && (
                      <button
                        onClick={() => onSwitchModule("Workforce Hiring")}
                        className="px-2.5 py-1 rounded-xl bg-white hover:bg-[#1D68BD] text-[#1D68BD] hover:text-white border border-blue-200 text-[10px] font-black transition-all flex items-center gap-1 shadow-2xs cursor-pointer"
                      >
                        <span>Open Screen</span>
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    )}
                  </div>

                  <div className="flex flex-col items-center space-y-1 mt-4">
                    {/* OV1 */}
                    <div 
                      onClick={() => setSelectedNode(STEP_DETAILS["OV1"])}
                      className="w-full cursor-pointer bg-white hover:bg-blue-50/40 border border-blue-200 rounded-2xl p-3.5 transition-all shadow-2xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[9.5px] font-black text-[#1D68BD] bg-blue-50 px-2 py-0.5 rounded">OV1 NODE</span>
                        <span className="text-[9.5px] font-bold text-slate-400">Coverage KPIs</span>
                      </div>
                      <h5 className="text-xs font-black text-[#042C51] mt-1">Workforce Coverage KPIs</h5>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Displays macro coverage percentage, total headcount (2,450 required vs 2,310 actual), and open deficits.
                      </p>
                    </div>

                    {/* Prominent Vertical Arrow: OV1 -> OV2 */}
                    <VerticalFlowArrow
                      label="Aggregate By Cluster"
                      color="blue"
                      length="md"
                    />

                    {/* OV2 */}
                    <div 
                      onClick={() => setSelectedNode(STEP_DETAILS["OV2"])}
                      className="w-full cursor-pointer bg-white hover:bg-blue-50/40 border border-blue-200 rounded-2xl p-3.5 transition-all shadow-2xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[9.5px] font-black text-[#1D68BD] bg-blue-50 px-2 py-0.5 rounded">OV2 NODE</span>
                        <span className="text-[9.5px] font-bold text-slate-400">Cluster Breakdown</span>
                      </div>
                      <h5 className="text-xs font-black text-[#042C51] mt-1">Cluster Progress Cards</h5>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Aggregates performance by Telecom, Healthcare, Financial, and Tech clusters with SLA badges.
                      </p>
                    </div>

                    {/* Prominent Vertical Arrow: OV2 -> OV3 */}
                    <VerticalFlowArrow
                      label="Filter Open Deficits"
                      color="blue"
                      length="md"
                    />

                    {/* OV3 */}
                    <div 
                      onClick={() => setSelectedNode(STEP_DETAILS["OV3"])}
                      className="w-full cursor-pointer bg-white hover:bg-blue-50/40 border border-blue-200 rounded-2xl p-3.5 transition-all shadow-2xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[9.5px] font-black text-[#1D68BD] bg-blue-50 px-2 py-0.5 rounded">OV3 NODE</span>
                        <span className="text-[9.5px] font-bold text-slate-400">Account Grid</span>
                      </div>
                      <h5 className="text-xs font-black text-[#042C51] mt-1">Account Hiring Ramps Ledger</h5>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Account table displaying required vs. actual headcount, net deficit, and target ramp dates.
                      </p>
                    </div>

                    {/* Prominent Vertical Arrow: OV3 -> OV4 */}
                    <VerticalFlowArrow
                      label="Expand Row Details"
                      color="blue"
                      length="md"
                    />

                    {/* OV4 */}
                    <div 
                      onClick={() => setSelectedNode(STEP_DETAILS["OV4"])}
                      className="w-full cursor-pointer bg-white hover:bg-blue-50/40 border border-blue-200 rounded-2xl p-3.5 transition-all shadow-2xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[9.5px] font-black text-[#1D68BD] bg-blue-50 px-2 py-0.5 rounded">OV4 NODE</span>
                        <span className="text-[9.5px] font-bold text-slate-400">Granular Drilldown</span>
                      </div>
                      <h5 className="text-xs font-black text-[#042C51] mt-1">Headcount Breakdown & Deficit Filter</h5>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Expands selected account rows to reveal shift lines, campus sites, and pipeline deficits.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-blue-100/50 rounded-2xl text-[10.5px] text-blue-900 font-bold flex items-center gap-2 mt-4">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-700 shrink-0" />
                  <span>Feeds synchronized analytics into Executive Cockpits</span>
                </div>
              </div>
            )}

            {/* PATH B: PLAN SCREEN TRACK (ORANGE THEME) */}
            {(activePath === "both" || activePath === "plan") && (
              <div className="bg-gradient-to-b from-orange-50/40 via-white to-orange-50/20 border-2 border-orange-200 rounded-3xl p-5 space-y-4 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-orange-200">
                    <div>
                      <span className="px-2.5 py-0.5 rounded-md bg-[#FF5C28] text-white text-[10px] font-black uppercase">
                        PATH B • PLAN SCREEN & DRAWER
                      </span>
                      <h4 className="text-sm font-black text-[#042C51] mt-1">
                        Scenario Planning, Cohorts & Action Items
                      </h4>
                    </div>
                    {onSwitchModule && (
                      <button
                        onClick={() => onSwitchModule("Workforce Hiring")}
                        className="px-2.5 py-1 rounded-xl bg-white hover:bg-[#FF5C28] text-[#FF5C28] hover:text-white border border-orange-200 text-[10px] font-black transition-all flex items-center gap-1 shadow-2xs cursor-pointer"
                      >
                        <span>Open Drawer</span>
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    )}
                  </div>

                  <div className="flex flex-col items-center space-y-1 mt-4">
                    {/* PL1 */}
                    <div 
                      onClick={() => setSelectedNode(STEP_DETAILS["PL1"])}
                      className="w-full cursor-pointer bg-white hover:bg-orange-50/40 border border-orange-200 rounded-2xl p-3.5 transition-all shadow-2xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[9.5px] font-black text-[#FF5C28] bg-orange-50 px-2 py-0.5 rounded">PL1 NODE</span>
                        <span className="text-[9.5px] font-bold text-slate-400">Plan Ledger</span>
                      </div>
                      <h5 className="text-xs font-black text-[#042C51] mt-1">Plan Ledger Table</h5>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Interactive scenario planning grid with required headcount deadlines and class targets.
                      </p>
                    </div>

                    {/* Prominent Vertical Arrow: PL1 -> PL2 */}
                    <VerticalFlowArrow
                      label="Slide Out Drawer"
                      color="orange"
                      length="md"
                    />

                    {/* PL2 */}
                    <div 
                      onClick={() => setSelectedNode(STEP_DETAILS["PL2"])}
                      className="w-full cursor-pointer bg-white hover:bg-orange-50/40 border border-orange-200 rounded-2xl p-3.5 transition-all shadow-2xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[9.5px] font-black text-[#FF5C28] bg-orange-50 px-2 py-0.5 rounded">PL2 NODE</span>
                        <span className="text-[9.5px] font-bold text-slate-400">Drawer Slide-Over</span>
                      </div>
                      <h5 className="text-xs font-black text-[#042C51] mt-1">Open Plan Drawer</h5>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        High-density slide-over drawer enabling configuration of wave start dates and cohort batches.
                      </p>
                    </div>

                    {/* Prominent Vertical Arrow: PL2 -> PL3 */}
                    <VerticalFlowArrow
                      label="Define Cohort Milestones"
                      color="orange"
                      length="md"
                    />

                    {/* PL3 */}
                    <div 
                      onClick={() => setSelectedNode(STEP_DETAILS["PL3"])}
                      className="w-full cursor-pointer bg-white hover:bg-orange-50/40 border border-orange-200 rounded-2xl p-3.5 transition-all shadow-2xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[9.5px] font-black text-[#FF5C28] bg-orange-50 px-2 py-0.5 rounded">PL3 NODE</span>
                        <span className="text-[9.5px] font-bold text-slate-400">Training Cohorts</span>
                      </div>
                      <h5 className="text-xs font-black text-[#042C51] mt-1">Training Cohorts & Ramp Milestones</h5>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Cohort milestones tracking NHO, FST, PST, and Go-Live with automated attrition allowances.
                      </p>
                    </div>

                    {/* Prominent Vertical Arrow: PL3 -> PL4 */}
                    <VerticalFlowArrow
                      label="Assign TA Action Items"
                      color="orange"
                      length="md"
                    />

                    {/* PL4 */}
                    <div 
                      onClick={() => setSelectedNode(STEP_DETAILS["PL4"])}
                      className="w-full cursor-pointer bg-white hover:bg-orange-50/40 border border-orange-200 rounded-2xl p-3.5 transition-all shadow-2xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[9.5px] font-black text-[#FF5C28] bg-orange-50 px-2 py-0.5 rounded">PL4 NODE</span>
                        <span className="text-[9.5px] font-bold text-slate-400">Action Items</span>
                      </div>
                      <h5 className="text-xs font-black text-[#042C51] mt-1">Assign Recruitment Action Items</h5>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Generates actionable recruitment tasks, assigned recruiters, SLA deadlines, and mitigations.
                      </p>
                    </div>

                    {/* Prominent Vertical Arrow: PL4 -> PL5 */}
                    <VerticalFlowArrow
                      label="Commit Schedule"
                      color="emerald"
                      length="md"
                    />

                    {/* PL5 */}
                    <div 
                      onClick={() => setSelectedNode(STEP_DETAILS["PL5"])}
                      className="w-full cursor-pointer bg-white hover:bg-orange-50/40 border border-orange-200 rounded-2xl p-3.5 transition-all shadow-2xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[9.5px] font-black text-[#FF5C28] bg-orange-50 px-2 py-0.5 rounded">PL5 NODE</span>
                        <span className="text-[9.5px] font-bold text-emerald-600">Commit & Sync</span>
                      </div>
                      <h5 className="text-xs font-black text-[#042C51] mt-1">Save & Synchronize Headcount Records</h5>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Commits approved scenario to database and triggers automatic Hiring Needs Intake in TA Pipeline!
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-orange-100/50 rounded-2xl text-[10.5px] text-orange-900 font-bold flex items-center gap-2 mt-4">
                  <Database className="w-3.5 h-3.5 text-orange-700 shrink-0" />
                  <span>Direct feedback loop into Talent Acquisition Module</span>
                </div>
              </div>
            )}
          </div>

          {/* ==================== STAGE 3: CENTRAL DATABASE & TA INTAKE RECONCILIATION ==================== */}
          <div className="bg-slate-900 text-white rounded-3xl p-6 shadow-md border-2 border-slate-700 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-400/40 text-amber-400 flex items-center justify-center font-black">
                <Database className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 block">
                  SYSTEM SYNCHRONIZATION POINT
                </span>
                <h4 className="text-sm font-black text-white">
                  Global Detail Records & Pipeline Trigger
                </h4>
                <p className="text-xs text-slate-300 mt-0.5">
                  When a plan is saved (PL5), the committed headcount deficit automatically generates an intake ticket in <strong>Process 2: Step 1 (Hiring Need Intake)</strong>!
                </p>
              </div>
            </div>

            {onSwitchModule && (
              <button
                onClick={() => onSwitchModule("Hiring Needs Intake")}
                className="shrink-0 px-4 py-2 bg-[#FF5C28] hover:bg-[#e04b1c] text-white rounded-xl text-xs font-black transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
              >
                <span>View Generated Requisition</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* ==================== NODE INSPECTION DRAWER (SIDEBAR) ==================== */}
        <AnimatePresence>
          {selectedNode && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="w-full lg:w-84 xl:w-96 bg-white border-2 border-slate-300 rounded-3xl p-5 shadow-xl sticky top-6 space-y-4 shrink-0"
            >
              {/* Header */}
              <div className="flex items-start justify-between pb-3 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[9.5px] font-black bg-[#FF5C28] text-white uppercase">
                      {selectedNode.code}
                    </span>
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider">
                      {selectedNode.track} track
                    </span>
                  </div>
                  <h3 className="text-sm font-black text-[#042C51] mt-1">
                    {selectedNode.title}
                  </h3>
                </div>

                <button
                  onClick={() => setSelectedNode(null)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Responsible Role */}
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-xs">
                <span className="text-[9.5px] font-bold text-slate-400 uppercase block">PRIMARY ACTOR & OWNER</span>
                <span className="font-black text-[#042C51] flex items-center gap-1.5 mt-0.5">
                  <Users className="w-3.5 h-3.5 text-[#1D68BD]" />
                  <span>{selectedNode.role}</span>
                </span>
              </div>

              {/* Description */}
              <div>
                <span className="text-[10px] font-black uppercase text-slate-400 block mb-1">
                  Operational Purpose
                </span>
                <p className="text-xs text-slate-600 leading-relaxed bg-orange-50/30 p-3 rounded-xl border border-orange-100">
                  {selectedNode.description}
                </p>
              </div>

              {/* Formula if present */}
              {selectedNode.formula && (
                <div className="bg-amber-50 p-3 rounded-xl border border-amber-200">
                  <span className="text-[10px] font-black uppercase text-amber-800 block mb-1">
                    Underlying Formula
                  </span>
                  <code className="text-xs font-mono font-bold text-amber-900 block">
                    {selectedNode.formula}
                  </code>
                </div>
              )}

              {/* Inputs & Outputs */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                  <span className="text-[9.5px] font-black uppercase text-slate-400 block mb-1">Data Inputs</span>
                  <ul className="space-y-1 text-[11px] text-slate-600">
                    {selectedNode.inputs.map((inp, idx) => (
                      <li key={idx} className="flex items-center gap-1">
                        <span className="w-1 h-1 rounded-full bg-blue-500"></span>
                        <span className="truncate">{inp}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                  <span className="text-[9.5px] font-black uppercase text-slate-400 block mb-1">Data Outputs</span>
                  <ul className="space-y-1 text-[11px] text-slate-600">
                    {selectedNode.outputs.map((out, idx) => (
                      <li key={idx} className="flex items-center gap-1">
                        <span className="w-1 h-1 rounded-full bg-emerald-500"></span>
                        <span className="truncate">{out}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Business Rules */}
              <div>
                <span className="text-[10px] font-black uppercase text-slate-400 block mb-1">
                  Validation & SLA Constraints
                </span>
                <ul className="space-y-1 text-[11px] text-slate-500">
                  {selectedNode.rules.map((rule, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{rule}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Wireframe Action Button */}
              {selectedNode.moduleKey && onSwitchModule && (
                <button
                  onClick={() => onSwitchModule(selectedNode.moduleKey!)}
                  className="w-full py-2.5 px-4 bg-[#FF5C28] hover:bg-[#e04b1c] text-white text-xs font-bold rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer mt-3"
                >
                  <span>Launch Wireframe View</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
