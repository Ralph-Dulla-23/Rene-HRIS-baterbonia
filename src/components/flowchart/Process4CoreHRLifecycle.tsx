import React, { useState } from "react";
import { 
  Clock, 
  Calendar, 
  UserMinus, 
  ExternalLink, 
  Code2, 
  Copy, 
  Check, 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  FileCheck,
  ShieldCheck,
  Building2,
  DollarSign,
  Laptop,
  Users,
  ArrowRight,
  ArrowDown,
  Sparkles,
  ZoomIn,
  ZoomOut,
  X,
  Play,
  RotateCcw
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { MERMAID_DIAGRAMS } from "./flowchartData";
import { HorizontalFlowArrow, VerticalFlowArrow } from "./FlowArrow";

interface Process4Props {
  onSwitchModule?: (moduleKey: string) => void;
}

interface CoreHRNodeDetails {
  id: string;
  code: string;
  title: string;
  track: "attendance" | "leave" | "resignation" | "root";
  role: string;
  description: string;
  inputs: string[];
  outputs: string[];
  moduleKey?: string;
  rules: string[];
  color: string;
}

export default function Process4CoreHRLifecycle({ onSwitchModule }: Process4Props) {
  const [showMermaidCode, setShowMermaidCode] = useState(false);
  const [copied, setCopied] = useState(false);
  const [selectedTrack, setSelectedTrack] = useState<"all" | "attendance" | "leave" | "resignation">("all");
  const [zoomLevel, setZoomLevel] = useState(100);
  const [selectedNode, setSelectedNode] = useState<CoreHRNodeDetails | null>(null);

  const handleCopyMermaid = () => {
    navigator.clipboard.writeText(MERMAID_DIAGRAMS["process-4-core-hr"].code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const NODE_CATALOG: Record<string, CoreHRNodeDetails> = {
    "EMP": {
      id: "EMP",
      code: "ACTOR",
      title: "Employee / Frontline Staff Member",
      track: "root",
      role: "Frontline Agent, Specialist, or Supervisor (2,450 Personnel)",
      description: "Origin point for all day-to-day lifecycle interactions: daily biometric time logging, PTO leave filings, and voluntary resignation requests.",
      inputs: ["SiBS ID Credentials", "Active Shift Assignment", "Biometric Data"],
      outputs: ["Clock Punches", "Leave Filings", "Resignation Notice"],
      rules: ["Must be in Active status in the Employee Master Directory."],
      color: "#042C51"
    },
    // --- TRACK 1: ATTENDANCE ---
    "CLOCK": {
      id: "CLOCK",
      code: "ATT-1",
      title: "Daily Biometric Punch & Shift Clocking",
      track: "attendance",
      role: "Employee & Biometric Reader",
      description: "Staff clock in/out via optical fingerprint scanners, facial biometric terminals, or mobile geofenced web punch.",
      inputs: ["Biometric Scan", "Shift Schedule Line", "Campus Geofence (Tagum/Davao/Mabini)"],
      outputs: ["Raw Time-Log Record", "Punch Timestamp"],
      moduleKey: "Time & Attendance",
      rules: ["Grace period: 5 minutes from scheduled shift start."],
      color: "#1D68BD"
    },
    "CHK1": {
      id: "CHK1",
      code: "ATT-DECISION",
      title: "Shift Discrepancy & Overtime Check",
      track: "attendance",
      role: "System Attendance Engine",
      description: "Automated validation evaluating clock timestamps against rostered shift schedules to detect tardiness, undertime, missing punches, or overtime.",
      inputs: ["Raw Punch Timestamp", "Scheduled Shift Window"],
      outputs: ["Discrepancy Flag (Yes/No)", "Overtime Request Ticket"],
      moduleKey: "Time & Attendance",
      rules: ["Tardiness > 15 mins triggers automated anomaly tag."],
      color: "#1D68BD"
    },
    "ADJ": {
      id: "ADJ",
      code: "ATT-2A",
      title: "Supervisor Anomaly Review & Adjustment Queue",
      track: "attendance",
      role: "Immediate Supervisor / Team Lead",
      description: "Supervisor reviews flagged anomalies, requires employee dispute remarks, authorizes overtime, and applies official attendance adjustments.",
      inputs: ["Flagged Timesheet Item", "Employee Dispute Justification"],
      outputs: ["Approved Time Adjustment", "Authorized OT Hours"],
      moduleKey: "Time & Attendance",
      rules: ["Must be resolved within 48 hours before payroll cutoff."],
      color: "#F59E0B"
    },
    "LOGGED": {
      id: "LOGGED",
      code: "ATT-2B",
      title: "Timesheet Approved & Locked for Payroll",
      track: "attendance",
      role: "Payroll Officer / HR",
      description: "Clean or adjusted timesheets are signed off, locked against further edits, and exported directly into the payroll calculation batch.",
      inputs: ["Supervisor Endorsed Timesheet"],
      outputs: ["Locked Payroll Batch Record", "Net Payable Hours"],
      moduleKey: "Time & Attendance",
      rules: ["No modifications permitted after payroll cutoff lock."],
      color: "#10B981"
    },
    // --- TRACK 2: LEAVE ---
    "LEAVE": {
      id: "LEAVE",
      code: "LEV-1",
      title: "Submit Leave Application",
      track: "leave",
      role: "Employee / Frontline Staff",
      description: "Employee submits digital leave request via the self-service portal, selecting leave category, inclusive dates, and attached medical certificates if applicable.",
      inputs: ["Leave Type (VL, SL, EL, ML, PL)", "Target Dates", "Supporting Medical/Proof Document"],
      outputs: ["Pending Leave Application ID"],
      moduleKey: "Leaves & Time Off",
      rules: ["Vacation Leave must be filed at least 5 business days in advance."],
      color: "#0E8773"
    },
    "LBAL": {
      id: "LBAL",
      code: "LEV-2",
      title: "Check Accrual Balance & Blackout Dates",
      track: "leave",
      role: "Leave Engine",
      description: "System verifies remaining paid leave credits against statutory allocations, checks for client campaign blackout windows, and verifies minimum shift staffing floor.",
      inputs: ["Employee Leave Ledger Balance", "Campaign Blackout Calendar"],
      outputs: ["Balance Verification Status (Pass/Fail)"],
      moduleKey: "Leaves & Time Off",
      rules: ["Emergency leaves bypass advance notice with post-shift filing."],
      color: "#0E8773"
    },
    "LAPPR": {
      id: "LAPPR",
      code: "LEV-DECISION",
      title: "Team Lead & HR Approval Gateway",
      track: "leave",
      role: "Team Lead & HR Officer",
      description: "Operational supervisor verifies team shift line coverage before approving. HR executes secondary sign-off for statutory leaves.",
      inputs: ["Pending Leave Ticket", "Team Staffing Schedule"],
      outputs: ["Approved or Disapproved Status"],
      moduleKey: "Leaves & Time Off",
      rules: ["Multi-tier approval required for leaves exceeding 3 consecutive days."],
      color: "#0E8773"
    },
    "LOK": {
      id: "LOK",
      code: "LEV-3A",
      title: "Deduct Balance & Synchronize Schedule",
      track: "leave",
      role: "System Leave Dispatcher",
      description: "Deducts allocated days from employee balance, updates master schedule to show Paid Time Off (PTO), and notifies shift team lead.",
      inputs: ["Approved Leave Ticket"],
      outputs: ["Updated Leave Ledger Balance", "Roster Calendar Marker"],
      moduleKey: "Leaves & Time Off",
      rules: ["Automatic balance credit deduction logged to audit table."],
      color: "#10B981"
    },
    "LREJ": {
      id: "LREJ",
      code: "LEV-3B",
      title: "Leave Disapproved with Written Remarks",
      track: "leave",
      role: "Team Lead / HR",
      description: "Notification sent back to employee explaining reason for disapproval (e.g., campaign blackout dates, insufficient balance, staffing threshold).",
      inputs: ["Disapproval Reason"],
      outputs: ["Rejection Notice Email", "Unchanged Leave Balance"],
      moduleKey: "Leaves & Time Off",
      rules: ["Employee may re-file for alternate non-blackout dates."],
      color: "#EF4444"
    },
    // --- TRACK 3: RESIGNATION ---
    "SEP": {
      id: "SEP",
      code: "RES-1",
      title: "Submit Resignation Notice",
      track: "resignation",
      role: "Employee / Staff Member",
      description: "Employee submits formal letter of resignation via self-service portal, stating intended last day and reason for separation.",
      inputs: ["Formal Resignation Letter", "Intended Effective Date"],
      outputs: ["Resignation Notice Case File"],
      moduleKey: "Resignation Management",
      rules: ["Philippine Labor Code requires 30-day rendering notice."],
      color: "#6B21A8"
    },
    "S1": {
      id: "S1",
      code: "RES-2",
      title: "Record Notice & Calculate 30-Day Window",
      track: "resignation",
      role: "HR Separation Officer",
      description: "HR records official notice date, computes mandatory 30-day rendering period, calculates final day on floor, and initiates offboarding clearance checklist.",
      inputs: ["Submitted Notice", "Company Separation Policy"],
      outputs: ["Target Last Day Milestone", "Clearance Checklist Package"],
      moduleKey: "Resignation Management",
      rules: ["Immediate resignation requires waiving of notice by Operations Director."],
      color: "#6B21A8"
    },
    "S2": {
      id: "S2",
      code: "RES-3",
      title: "Exit Interview Scheduling & Survey",
      track: "resignation",
      role: "HR Employee Relations Specialist",
      description: "Structured exit survey administered to gather feedback on culture, compensation, leadership, and workplace experience.",
      inputs: ["Exit Survey Questionnaire"],
      outputs: ["Exit Analytics Response", "Tenure & Attrition Insights"],
      moduleKey: "Resignation Management",
      rules: ["Survey results feed into executive retention analytics."],
      color: "#6B21A8"
    },
    "S3": {
      id: "S3",
      code: "RES-4",
      title: "4-Department Multi-Clearance Signoff Matrix",
      track: "resignation",
      role: "Operations, IT, Finance, HR Leads",
      description: "Strict 4-department clearance protocol: Operations (knowledge handover), IT (equipment surrender & account revocation), Finance (company loans & tax clearance), and HR (final exit signoff).",
      inputs: ["IT Asset Handover", "Loan Settlement Form", "Client Project Transition"],
      outputs: ["4 Departmental Digital Signoffs"],
      moduleKey: "Resignation Management",
      rules: ["All 4 signoffs required before payroll release."],
      color: "#6B21A8"
    },
    "S4": {
      id: "S4",
      code: "RES-5",
      title: "Final Pay Computation & Deactivation",
      track: "resignation",
      role: "Payroll Officer & Super Admin",
      description: "Automated final pay package computation including pro-rated 13th month pay, unused leave encashment, tax refunds, BIR 2316 issuance, and profile status set to Resigned.",
      inputs: ["4 Department Signoffs", "Leave Encashment Ledger"],
      outputs: ["Final Pay Check / Direct Deposit", "Certificate of Employment (COE)"],
      moduleKey: "Resignation Management",
      rules: ["Final pay released within 30 days of last working day."],
      color: "#10B981"
    }
  };

  return (
    <div className="space-y-6">
      {/* ==================== 1. HEADER & CONTROLS ==================== */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2.5 py-0.5 rounded-full bg-[#1D68BD] text-white text-[10px] font-black uppercase tracking-wider">
              PROCESS 4 OF 5
            </span>
            <h2 className="text-base sm:text-lg font-black text-[#042C51] tracking-tight">
              Core HR, Attendance & Lifecycle Flowchart
            </h2>
            <span className="px-2 py-0.5 rounded-full bg-blue-50 text-[#1D68BD] text-[10px] font-black border border-blue-200">
              3 Parallel Operational Tracks
            </span>
          </div>
          <p className="text-xs text-slate-600 font-medium mt-1">
            Day-to-day employee lifecycle operational tracks: Daily Biometric Clocking & Discrepancies, Leave Balances & Multi-tier Approvals, and Resignation 4-Department Clearance.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Operational Track Filter */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-bold">
            <button
              onClick={() => setSelectedTrack("all")}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                selectedTrack === "all" ? "bg-[#042C51] text-white shadow-2xs" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              All Tracks
            </button>
            <button
              onClick={() => setSelectedTrack("attendance")}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                selectedTrack === "attendance" ? "bg-[#1D68BD] text-white shadow-2xs" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Daily Attendance
            </button>
            <button
              onClick={() => setSelectedTrack("leave")}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                selectedTrack === "leave" ? "bg-emerald-600 text-white shadow-2xs" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Leaves & PTO
            </button>
            <button
              onClick={() => setSelectedTrack("resignation")}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                selectedTrack === "resignation" ? "bg-purple-600 text-white shadow-2xs" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Resignation Clearance
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
              <span>Mermaid Definition (Process 4: Core HR, Attendance & Lifecycle)</span>
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
            {MERMAID_DIAGRAMS["process-4-core-hr"].code}
          </pre>
        </div>
      )}

      {/* ==================== 3 OPERATIONAL PROCESS CHEVRONS ==================== */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 text-center font-black text-xs">
        <div className="bg-[#EBF3FC] text-[#1D68BD] border border-blue-200 rounded-2xl p-3 shadow-2xs">
          <div className="text-[11px] uppercase tracking-wider font-black">1. TIME & ATTENDANCE TRACK</div>
          <div className="text-[10px] text-slate-600 font-medium mt-0.5">Biometric logs, anomalies, supervisor review</div>
        </div>
        <div className="bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-2xl p-3 shadow-2xs">
          <div className="text-[11px] uppercase tracking-wider font-black">2. LEAVES & TIME OFF TRACK</div>
          <div className="text-[10px] text-slate-600 font-medium mt-0.5">Application filing, balance check, approvals</div>
        </div>
        <div className="bg-purple-50 text-purple-900 border border-purple-200 rounded-2xl p-3 shadow-2xs">
          <div className="text-[11px] uppercase tracking-wider font-black">3. RESIGNATION CLEARANCE TRACK</div>
          <div className="text-[10px] text-slate-600 font-medium mt-0.5">30-day notice, 4-dept clearance, final pay</div>
        </div>
      </div>

      {/* ==================== MAIN FLOWCHART CANVAS ==================== */}
      <div 
        className="flex-1 flex flex-col lg:flex-row gap-6 items-start"
        style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: "top left" }}
      >
        <div className="flex-1 w-full space-y-6">
          {/* ROOT ACTOR NODE: COMMON ORIGIN */}
          <div className="flex flex-col items-center">
            <div 
              onClick={() => setSelectedNode(NODE_CATALOG["EMP"])}
              className="cursor-pointer group px-8 py-3.5 bg-gradient-to-r from-[#042C51] via-[#09477e] to-[#042C51] text-white rounded-2xl shadow-lg border-2 border-blue-400 text-center max-w-md hover:scale-102 transition-transform"
            >
              <div className="flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest text-blue-200">
                <Users className="w-3.5 h-3.5 text-[#FF5C28]" />
                <span>ROOT ACTOR INITIATOR</span>
              </div>
              <h3 className="text-sm font-black text-white mt-1">
                Employee / Frontline Staff Member
              </h3>
              <p className="text-[10.5px] text-blue-100/80 mt-0.5">
                2,450 active staff members across Tagum HQ, Davao Ops, and Mabini Dev
              </p>
            </div>

            {/* Vertical Flow Arrow Down from Actor */}
            <VerticalFlowArrow
              color="blue"
              label="Initiates Workflows"
              length="md"
            />

            {/* Triple Pathway Header */}
            <div className="w-full max-w-4xl grid grid-cols-3 gap-2 text-center text-[10px] font-black uppercase tracking-wider">
              <div className="text-[#1D68BD] bg-blue-50 py-1 rounded-lg border border-blue-200">Track 1: Attendance</div>
              <div className="text-emerald-700 bg-emerald-50 py-1 rounded-lg border border-emerald-200">Track 2: Leaves & PTO</div>
              <div className="text-purple-700 bg-purple-50 py-1 rounded-lg border border-purple-200">Track 3: Resignation</div>
            </div>
          </div>

          {/* ==================== TRACK 1: DAILY TIME & ATTENDANCE ==================== */}
          {(selectedTrack === "all" || selectedTrack === "attendance") && (
            <div className="bg-white border-2 border-blue-200 rounded-3xl p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-blue-100">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-md bg-[#1D68BD] text-white text-[10px] font-black uppercase">
                    TRACK 1 PIPELINE
                  </span>
                  <h4 className="text-sm font-black text-[#042C51]">
                    Daily Time, Biometrics & Supervisor Anomaly Resolution
                  </h4>
                </div>
                {onSwitchModule && (
                  <button
                    onClick={() => onSwitchModule("Time & Attendance")}
                    className="px-2.5 py-1 rounded-xl bg-blue-50 hover:bg-[#1D68BD] text-[#1D68BD] hover:text-white border border-blue-200 text-[10px] font-black transition-all flex items-center gap-1 cursor-pointer"
                  >
                    <span>Open Real-Time Board</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                )}
              </div>

              {/* Horizontal Flow with Prominent Flow Arrows */}
              <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto pb-3 pt-1">
                {/* CLOCK */}
                <div 
                  onClick={() => setSelectedNode(NODE_CATALOG["CLOCK"])}
                  className="cursor-pointer shrink-0 w-[180px] bg-blue-50/60 hover:bg-blue-50 border-2 border-blue-200 p-4 rounded-2xl transition-all shadow-2xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-black text-[#1D68BD] uppercase">ATT-1</span>
                    <Clock className="w-3.5 h-3.5 text-[#1D68BD]" />
                  </div>
                  <h5 className="text-xs font-black text-[#042C51] mt-1">Biometric Clocking</h5>
                  <p className="text-[10px] text-slate-500 mt-0.5">Punch In, Breaks, Lunch & Out via biometric terminal.</p>
                </div>

                {/* FLOW ARROW: CLOCK -> DECISION */}
                <HorizontalFlowArrow
                  label="Evaluate Shift"
                  sublabel="Check Roster"
                  color="blue"
                  length="md"
                />

                {/* CHK1 DECISION DIAMOND */}
                <div 
                  onClick={() => setSelectedNode(NODE_CATALOG["CHK1"])}
                  className="cursor-pointer shrink-0 w-[200px] bg-slate-900 text-white p-4 rounded-2xl shadow-md border-2 border-blue-400 text-center"
                >
                  <span className="text-[9px] font-black uppercase tracking-wider text-blue-300 block">
                    DECISION GATEWAY
                  </span>
                  <h5 className="text-xs font-black mt-1">Shift Discrepancy or Overtime?</h5>
                  <div className="flex justify-center gap-1.5 mt-2 text-[9px] font-black">
                    <span className="bg-amber-500/30 text-amber-300 px-2 py-0.5 rounded border border-amber-400/40">Yes: Discrepancy</span>
                    <span className="bg-emerald-500/30 text-emerald-300 px-2 py-0.5 rounded border border-emerald-400/40">No: Clean</span>
                  </div>
                </div>

                {/* FLOW ARROW: DECISION -> ADJ (YES: DISCREPANCY) */}
                <HorizontalFlowArrow
                  label="Yes: Anomaly"
                  sublabel="Flag Discrepancy"
                  color="amber"
                  length="md"
                />

                {/* ADJ (SUPERVISOR ANOMALY REVIEW) */}
                <div 
                  onClick={() => setSelectedNode(NODE_CATALOG["ADJ"])}
                  className="cursor-pointer shrink-0 w-[190px] bg-amber-50 hover:bg-amber-100/70 border-2 border-amber-300 p-4 rounded-2xl transition-all shadow-2xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-black text-amber-800 uppercase">ATT-2A</span>
                    <span className="text-[9px] font-black bg-amber-200 text-amber-900 px-1.5 py-0.2 rounded">Supervisor</span>
                  </div>
                  <h5 className="text-xs font-black text-[#042C51] mt-1">Discrepancy Review Queue</h5>
                  <p className="text-[10px] text-slate-600 mt-0.5">Validates tardiness dispute, authorizes OT hours.</p>
                </div>

                {/* FLOW ARROW: ADJ -> LOGGED */}
                <HorizontalFlowArrow
                  label="Approved"
                  sublabel="Export Batch"
                  color="emerald"
                  length="md"
                />

                {/* LOGGED (APPROVED/CLEAN BRANCH) */}
                <div 
                  onClick={() => setSelectedNode(NODE_CATALOG["LOGGED"])}
                  className="cursor-pointer shrink-0 w-[180px] bg-emerald-50 hover:bg-emerald-100/70 border-2 border-emerald-300 p-4 rounded-2xl transition-all shadow-2xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-black text-emerald-800 uppercase">ATT-2B</span>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  </div>
                  <h5 className="text-xs font-black text-[#042C51] mt-1">Payroll Locked</h5>
                  <p className="text-[10px] text-slate-600 mt-0.5">Timesheet locked, calculated and exported to payroll.</p>
                </div>
              </div>
            </div>
          )}

          {/* ==================== TRACK 2: LEAVES & TIME OFF ==================== */}
          {(selectedTrack === "all" || selectedTrack === "leave") && (
            <div className="bg-white border-2 border-emerald-200 rounded-3xl p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-emerald-100">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-md bg-emerald-600 text-white text-[10px] font-black uppercase">
                    TRACK 2 PIPELINE
                  </span>
                  <h4 className="text-sm font-black text-[#042C51]">
                    Leaves, Accrual Balance Checks & Multi-Tier Approvals
                  </h4>
                </div>
                {onSwitchModule && (
                  <button
                    onClick={() => onSwitchModule("Leaves & Time Off")}
                    className="px-2.5 py-1 rounded-xl bg-emerald-50 hover:bg-emerald-600 text-emerald-700 hover:text-white border border-emerald-200 text-[10px] font-black transition-all flex items-center gap-1 cursor-pointer"
                  >
                    <span>Open Leave Queue</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                )}
              </div>

              {/* Horizontal Flow with Prominent Flow Arrows */}
              <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto pb-3 pt-1">
                {/* LEAVE */}
                <div 
                  onClick={() => setSelectedNode(NODE_CATALOG["LEAVE"])}
                  className="cursor-pointer shrink-0 w-[180px] bg-emerald-50/60 hover:bg-emerald-50 border-2 border-emerald-200 p-4 rounded-2xl transition-all shadow-2xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-black text-emerald-700 uppercase">LEV-1</span>
                    <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                  </div>
                  <h5 className="text-xs font-black text-[#042C51] mt-1">Submit Leave</h5>
                  <p className="text-[10px] text-slate-500 mt-0.5">Vacation, Sick, Emergency or Parental filing.</p>
                </div>

                {/* FLOW ARROW: LEAVE -> LBAL */}
                <HorizontalFlowArrow
                  label="Verify Accrual"
                  sublabel="Blackout Check"
                  color="teal"
                  length="md"
                />

                {/* LBAL */}
                <div 
                  onClick={() => setSelectedNode(NODE_CATALOG["LBAL"])}
                  className="cursor-pointer shrink-0 w-[180px] bg-slate-50 hover:bg-slate-100/80 border-2 border-slate-200 p-4 rounded-2xl transition-all shadow-2xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-black text-slate-500 uppercase">LEV-2</span>
                    <ShieldCheck className="w-3.5 h-3.5 text-slate-500" />
                  </div>
                  <h5 className="text-xs font-black text-[#042C51] mt-1">Check Balance</h5>
                  <p className="text-[10px] text-slate-500 mt-0.5">Verifies remaining PTO credits and shift line capacity.</p>
                </div>

                {/* FLOW ARROW: LBAL -> LAPPR */}
                <HorizontalFlowArrow
                  label="Forward to Lead"
                  sublabel="Shift Coverage"
                  color="teal"
                  length="md"
                />

                {/* LAPPR DECISION GATEWAY */}
                <div 
                  onClick={() => setSelectedNode(NODE_CATALOG["LAPPR"])}
                  className="cursor-pointer shrink-0 w-[200px] bg-slate-900 text-white p-4 rounded-2xl shadow-md border-2 border-emerald-400 text-center"
                >
                  <span className="text-[9px] font-black uppercase tracking-wider text-emerald-300 block">
                    APPROVAL GATEWAY
                  </span>
                  <h5 className="text-xs font-black mt-1">Team Lead & HR Signoff</h5>
                  <div className="flex justify-center gap-1.5 mt-2 text-[9px] font-black">
                    <span className="bg-emerald-500/30 text-emerald-300 px-2 py-0.5 rounded border border-emerald-400/40">Approved</span>
                    <span className="bg-red-500/30 text-red-300 px-2 py-0.5 rounded border border-red-400/40">Disapproved</span>
                  </div>
                </div>

                {/* FLOW ARROW: LAPPR -> LOK (APPROVED) */}
                <HorizontalFlowArrow
                  label="Approved: Deduct"
                  sublabel="Sync Schedule"
                  color="emerald"
                  length="md"
                />

                {/* LOK (APPROVED) */}
                <div 
                  onClick={() => setSelectedNode(NODE_CATALOG["LOK"])}
                  className="cursor-pointer shrink-0 w-[180px] bg-emerald-50 hover:bg-emerald-100/70 border-2 border-emerald-300 p-4 rounded-2xl transition-all shadow-2xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-black text-emerald-800 uppercase">LEV-3A</span>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  </div>
                  <h5 className="text-xs font-black text-[#042C51] mt-1">Deduct & Sync</h5>
                  <p className="text-[10px] text-slate-600 mt-0.5">Credits debited and shift marked PTO on active roster.</p>
                </div>
              </div>
            </div>
          )}

          {/* ==================== TRACK 3: RESIGNATION MANAGEMENT ==================== */}
          {(selectedTrack === "all" || selectedTrack === "resignation") && (
            <div className="bg-white border-2 border-purple-200 rounded-3xl p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-purple-100">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-md bg-purple-600 text-white text-[10px] font-black uppercase">
                    TRACK 3 PIPELINE
                  </span>
                  <h4 className="text-sm font-black text-[#042C51]">
                    Resignation Notice, 4-Department Clearance & Final Pay
                  </h4>
                </div>
                {onSwitchModule && (
                  <button
                    onClick={() => onSwitchModule("Resignation Management")}
                    className="px-2.5 py-1 rounded-xl bg-purple-50 hover:bg-purple-600 text-purple-700 hover:text-white border border-purple-200 text-[10px] font-black transition-all flex items-center gap-1 cursor-pointer"
                  >
                    <span>Open Resignation Board</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                )}
              </div>

              {/* Horizontal Flow with Prominent Flow Arrows */}
              <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto pb-3 pt-1">
                {/* SEP */}
                <div 
                  onClick={() => setSelectedNode(NODE_CATALOG["SEP"])}
                  className="cursor-pointer shrink-0 w-[170px] bg-purple-50/60 hover:bg-purple-50 border-2 border-purple-200 p-3.5 rounded-2xl transition-all shadow-2xs"
                >
                  <span className="text-[9px] font-black text-purple-700 uppercase">RES-1</span>
                  <h5 className="text-xs font-black text-[#042C51] mt-1">Submit Resignation</h5>
                  <p className="text-[10px] text-slate-500 mt-0.5">Formal letter with last day on floor.</p>
                </div>

                {/* FLOW ARROW 1 */}
                <HorizontalFlowArrow
                  label="Log Notice"
                  sublabel="Calculate Days"
                  color="purple"
                  length="sm"
                />

                {/* S1 */}
                <div 
                  onClick={() => setSelectedNode(NODE_CATALOG["S1"])}
                  className="cursor-pointer shrink-0 w-[170px] bg-white hover:bg-slate-50 border-2 border-purple-200 p-3.5 rounded-2xl transition-all shadow-2xs"
                >
                  <span className="text-[9px] font-black text-purple-700 uppercase">RES-2</span>
                  <h5 className="text-xs font-black text-[#042C51] mt-1">30-Day Render Window</h5>
                  <p className="text-[10px] text-slate-500 mt-0.5">Calculates mandatory rendering window.</p>
                </div>

                {/* FLOW ARROW 2 */}
                <HorizontalFlowArrow
                  label="Schedule Survey"
                  sublabel="Exit Feedback"
                  color="purple"
                  length="sm"
                />

                {/* S2 */}
                <div 
                  onClick={() => setSelectedNode(NODE_CATALOG["S2"])}
                  className="cursor-pointer shrink-0 w-[170px] bg-white hover:bg-slate-50 border-2 border-purple-200 p-3.5 rounded-2xl transition-all shadow-2xs"
                >
                  <span className="text-[9px] font-black text-purple-700 uppercase">RES-3</span>
                  <h5 className="text-xs font-black text-[#042C51] mt-1">Exit Interview Survey</h5>
                  <p className="text-[10px] text-slate-500 mt-0.5">Captures feedback and retention insights.</p>
                </div>

                {/* FLOW ARROW 3 */}
                <HorizontalFlowArrow
                  label="Trigger Clearance"
                  sublabel="4 Signoffs"
                  color="purple"
                  length="sm"
                />

                {/* S3 */}
                <div 
                  onClick={() => setSelectedNode(NODE_CATALOG["S3"])}
                  className="cursor-pointer shrink-0 w-[180px] bg-purple-100/70 hover:bg-purple-100 border-2 border-purple-300 p-3.5 rounded-2xl transition-all shadow-2xs"
                >
                  <span className="text-[9px] font-black text-purple-900 uppercase">RES-4</span>
                  <h5 className="text-xs font-black text-[#042C51] mt-1">4-Dept Clearance</h5>
                  <p className="text-[10px] text-slate-600 mt-0.5">Ops, IT hardware, Finance loans, HR COE.</p>
                </div>

                {/* FLOW ARROW 4 */}
                <HorizontalFlowArrow
                  label="All Cleared"
                  sublabel="Release Pay"
                  color="emerald"
                  length="sm"
                />

                {/* S4 */}
                <div 
                  onClick={() => setSelectedNode(NODE_CATALOG["S4"])}
                  className="cursor-pointer shrink-0 w-[170px] bg-emerald-50 hover:bg-emerald-100/70 border-2 border-emerald-300 p-3.5 rounded-2xl transition-all shadow-2xs"
                >
                  <span className="text-[9px] font-black text-emerald-800 uppercase">RES-5</span>
                  <h5 className="text-xs font-black text-[#042C51] mt-1">Final Pay & Release</h5>
                  <p className="text-[10px] text-slate-600 mt-0.5">13th month, unused leave encashment.</p>
                </div>
              </div>
            </div>
          )}
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
              <div className="flex items-start justify-between pb-3 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2">
                    <span 
                      className="px-2 py-0.5 rounded text-[9.5px] font-black text-white uppercase"
                      style={{ backgroundColor: selectedNode.color }}
                    >
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
                <span className="text-[9.5px] font-bold text-slate-400 uppercase block">RESPONSIBLE ACTOR</span>
                <span className="font-black text-[#042C51] flex items-center gap-1.5 mt-0.5">
                  <Users className="w-3.5 h-3.5 text-[#1D68BD]" />
                  <span>{selectedNode.role}</span>
                </span>
              </div>

              {/* Description */}
              <div>
                <span className="text-[10px] font-black uppercase text-slate-400 block mb-1">
                  Operational Step Purpose
                </span>
                <p className="text-xs text-slate-600 leading-relaxed bg-blue-50/30 p-3 rounded-xl border border-blue-100">
                  {selectedNode.description}
                </p>
              </div>

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

              {/* Rules & SLA */}
              <div>
                <span className="text-[10px] font-black uppercase text-slate-400 block mb-1">
                  System Validation & Policies
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

              {/* Wireframe Button */}
              {selectedNode.moduleKey && onSwitchModule && (
                <button
                  onClick={() => onSwitchModule(selectedNode.moduleKey!)}
                  className="w-full py-2.5 px-4 bg-[#1D68BD] hover:bg-[#15549a] text-white text-xs font-bold rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer mt-3"
                >
                  <span>Launch Module ({selectedNode.moduleKey})</span>
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
