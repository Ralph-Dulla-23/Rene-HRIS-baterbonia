import React, { useState } from "react";
import { 
  Building2, 
  MapPin, 
  FileSpreadsheet, 
  Mail, 
  ExternalLink, 
  Code2, 
  Copy, 
  Check, 
  ShieldCheck, 
  Lock, 
  Users, 
  Layers, 
  CheckCircle2, 
  ArrowDown, 
  ArrowRight, 
  Sparkles,
  Sliders,
  Award,
  Clock,
  Send,
  ZoomIn,
  ZoomOut,
  X
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { MERMAID_DIAGRAMS } from "./flowchartData";
import { HorizontalFlowArrow, VerticalFlowArrow } from "./FlowArrow";

interface Process5Props {
  onSwitchModule?: (moduleKey: string) => void;
}

interface GovernanceNodeDetails {
  id: string;
  code: string;
  title: string;
  domain: "departments" | "locations" | "scoring" | "emails" | "root";
  role: string;
  description: string;
  inputs: string[];
  outputs: string[];
  moduleKey?: string;
  rules: string[];
  metrics?: Record<string, string>;
}

export default function Process5OrgGovernance({ onSwitchModule }: Process5Props) {
  const [showMermaidCode, setShowMermaidCode] = useState(false);
  const [copied, setCopied] = useState(false);
  const [selectedPillar, setSelectedPillar] = useState<"all" | "departments" | "locations" | "scoring">("all");
  const [zoomLevel, setZoomLevel] = useState(100);
  const [selectedNode, setSelectedNode] = useState<GovernanceNodeDetails | null>(null);

  const handleCopyMermaid = () => {
    navigator.clipboard.writeText(MERMAID_DIAGRAMS["process-5-governance"].code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const NODE_CATALOG: Record<string, GovernanceNodeDetails> = {
    "SUPER": {
      id: "SUPER",
      code: "AUTH-0",
      title: "Super Admin & Executive Board",
      domain: "root",
      role: "Super Administrator / C-Level Executive (Zero-Trust Gated)",
      description: "Root administrative authority defining system-wide master tables, organization divisions, physical campus allocation, assessment formulas, and cryptographic audit logs.",
      inputs: ["Corporate Bylaws", "Board Resolutions", "Campus Lease Agreements"],
      outputs: ["Enterprise Metadata", "System Policies", "Global Configuration"],
      rules: ["Multi-factor biometric/hardware token authorization required for all changes."]
    },
    "G1": {
      id: "G1",
      code: "GOV-1",
      title: "Departments & Cost Center Registry",
      domain: "departments",
      role: "HR Director / Financial Controller",
      description: "Defines the 7 structural departments: Operations (1,840), Talent Acquisition (28), Workforce Management (35), Quality & Training (62), Information Technology (45), Human Resources (22), and Finance (18).",
      inputs: ["Approved Organization Chart", "Department Operational Budgets"],
      outputs: ["Active Cost Centers", "Department Hierarchy Tree"],
      moduleKey: "Departments",
      rules: ["Every active employee must be mapped to exactly one primary cost center."],
      metrics: {
        "Active Divisions": "7 Departments",
        "Total Headcount": "2,450 Personnel",
        "Total Annual Budget": "$3.85M USD"
      }
    },
    "G2": {
      id: "G2",
      code: "GOV-2",
      title: "Physical Campus & Facility Allocations",
      domain: "locations",
      role: "Facilities & Infrastructure Director",
      description: "Controls the 3 physical operations delivery centers: Tagum Corporate HQ (1,200 desks), Davao Operations Center (850 desks), and Mabini Tech & Dev Hub (400 desks).",
      inputs: ["Campus Floorplans", "Network Geofence Subnets", "Physical Badge Readers"],
      outputs: ["Campus Desk Inventory", "Geofenced Biometric Perimeters"],
      moduleKey: "Office Locations",
      rules: ["Biometric punch invalid outside registered campus geofence perimeter."],
      metrics: {
        "Tagum HQ": "1,200 Seats (94% Occupied)",
        "Davao Ops": "850 Seats (88% Occupied)",
        "Mabini Tech": "400 Seats (96% Occupied)"
      }
    },
    "G3": {
      id: "G3",
      code: "GOV-3",
      title: "Assessment Scoring & Weighted Competencies",
      domain: "scoring",
      role: "TA Operations & Quality Principal",
      description: "Mathematical score engine powering candidate assessments with weighted grading: English Proficiency (40%), Technical Typing & Simulation (30%), Behavioral & Culture Fit (30%). Passing grade: 75%.",
      inputs: ["Curriculum Standards", "Client Campaign Passing Rubrics"],
      outputs: ["Calculated Composite Score", "Automated Pass/Fail Route"],
      rules: ["Scores >= 75% advance automatically to Step 6 (Initial Interview)."],
      metrics: {
        "Language Weight": "40% (Versant / Berlitz)",
        "Technical Weight": "30% (Speed & Accuracy)",
        "Behavioral Weight": "30% (Situational Judgement)"
      }
    },
    "G4": {
      id: "G4",
      code: "GOV-4",
      title: "Communication Audit Trail & Delivery Ledger",
      domain: "emails",
      role: "Compliance & Security Officer",
      description: "Full immutable audit ledger tracking all automated candidate transaction emails, interview invites, formal job offers, pre-employment packages, and separation notices.",
      inputs: ["Transactional Email Dispatch Stream", "SMTP Delivery Receipts"],
      outputs: ["Delivery Status", "Bounce Log", "Open Tracking"],
      moduleKey: "Email Logs",
      rules: ["All candidate communications retained for 5 years per statutory audit."],
      metrics: {
        "Emails Dispatched": "14,820 Sent",
        "Delivery Success": "99.4%",
        "Bounce Rate": "0.6%"
      }
    }
  };

  const DEPARTMENTS = [
    { name: "Operations", head: "Carlos Mendoza", count: 1840, budget: "$2.1M" },
    { name: "Talent Acquisition", head: "Maria Santos", count: 28, budget: "$320K" },
    { name: "Workforce Management", head: "David Chen", count: 35, budget: "$280K" },
    { name: "Quality & Training", head: "Elena Rostova", count: 62, budget: "$450K" },
    { name: "Information Technology", head: "Kenji Sato", count: 45, budget: "$520K" },
    { name: "Human Resources", head: "Patricia Ramos", count: 22, budget: "$190K" },
    { name: "Finance & Accounting", head: "Arthur King", count: 18, budget: "$170K" }
  ];

  const LOCATIONS = [
    { name: "Tagum Corporate HQ", capacity: "1,200 Desks", occupancy: "94%", shifts: "3 Shifts (24/7)", badge: "Headquarters" },
    { name: "Davao Operations Center", capacity: "850 Desks", occupancy: "88%", shifts: "2 Shifts", badge: "Operations" },
    { name: "Mabini Tech & Dev Hub", capacity: "400 Desks", occupancy: "96%", shifts: "Standard Day", badge: "Tech & R&D" }
  ];

  return (
    <div className="space-y-6">
      {/* ==================== 1. HEADER & CONTROLS ==================== */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2.5 py-0.5 rounded-full bg-slate-800 text-white text-[10px] font-black uppercase tracking-wider">
              PROCESS 5 OF 5
            </span>
            <h2 className="text-base sm:text-lg font-black text-[#042C51] tracking-tight">
              Organizational & Administrative Governance Flowchart
            </h2>
            <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-black border border-slate-200">
              Enterprise Governance
            </span>
          </div>
          <p className="text-xs text-slate-600 font-medium mt-1">
            Governing infrastructure mapping the 7 organizational divisions, 3 multi-campus physical facilities, assessment scoring weights, and communication audit logs.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Pillar Filter Selector */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-bold">
            <button
              onClick={() => setSelectedPillar("all")}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                selectedPillar === "all" ? "bg-[#042C51] text-white shadow-2xs" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              All Pillars
            </button>
            <button
              onClick={() => setSelectedPillar("departments")}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                selectedPillar === "departments" ? "bg-[#1D68BD] text-white shadow-2xs" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Divisions (7)
            </button>
            <button
              onClick={() => setSelectedPillar("locations")}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                selectedPillar === "locations" ? "bg-[#0E8773] text-white shadow-2xs" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Campuses (3)
            </button>
            <button
              onClick={() => setSelectedPillar("scoring")}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                selectedPillar === "scoring" ? "bg-[#FF5C28] text-white shadow-2xs" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Scoring & SLAs
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
              <span>Mermaid Definition (Process 5: Organizational Governance)</span>
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
            {MERMAID_DIAGRAMS["process-5-governance"].code}
          </pre>
        </div>
      )}

      {/* ==================== MAIN FLOWCHART CANVAS ==================== */}
      <div 
        className="flex-1 flex flex-col lg:flex-row gap-6 items-start"
        style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: "top left" }}
      >
        <div className="flex-1 w-full space-y-6">
          {/* ROOT AUTHORITY NODE */}
          <div className="flex flex-col items-center">
            <div 
              onClick={() => setSelectedNode(NODE_CATALOG["SUPER"])}
              className="cursor-pointer group px-8 py-4 bg-gradient-to-r from-slate-900 via-[#042C51] to-slate-900 text-white rounded-3xl shadow-xl border-2 border-slate-700 text-center max-w-lg hover:scale-102 transition-transform"
            >
              <div className="flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#FF5C28]">
                <ShieldCheck className="w-4 h-4" />
                <span>ROOT GOVERNANCE AUTHORITY</span>
              </div>
              <h3 className="text-base font-black text-white mt-1 group-hover:text-blue-200 transition-colors">
                Super Admin / HR Governance & Executive Board
              </h3>
              <p className="text-[11px] text-slate-300 mt-0.5">
                Full administrative authority over system metadata, departments, campuses, SLA parameters & audit trail.
              </p>
            </div>

            {/* Emphasized Vertical Arrow from Root to Conduit */}
            <VerticalFlowArrow
              color="blue"
              label="Enforces Governance Policy"
              length="md"
            />

            {/* Hub Decision Gateway */}
            <div className="bg-white border-2 border-[#042C51] px-5 py-2 rounded-2xl shadow-sm text-xs font-black text-[#042C51] flex items-center gap-2">
              <Lock className="w-3.5 h-3.5 text-[#1D68BD]" />
              <span>Administrative Module Routing Conduit</span>
            </div>

            {/* Emphasized Vertical Arrow from Conduit to 4 Branches */}
            <VerticalFlowArrow
              color="blue"
              label="Dispatches Administrative Schemas"
              length="md"
            />

            {/* Spreading bus line with branch taps */}
            <div className="w-full max-w-5xl h-1 bg-gradient-to-r from-blue-500 via-teal-500 via-orange-500 to-purple-500 rounded-full relative shadow-xs">
              <div className="absolute left-[12%] -top-1 w-3 h-3 rounded-full bg-blue-600 ring-4 ring-blue-100"></div>
              <div className="absolute left-[38%] -top-1 w-3 h-3 rounded-full bg-teal-600 ring-4 ring-teal-100"></div>
              <div className="absolute left-[64%] -top-1 w-3 h-3 rounded-full bg-orange-600 ring-4 ring-orange-100"></div>
              <div className="absolute left-[88%] -top-1 w-3 h-3 rounded-full bg-purple-600 ring-4 ring-purple-100"></div>
            </div>
            <div className="text-[9.5px] font-black uppercase tracking-wider text-slate-500 mt-1">
              Branches into 4 Administrative Governance Domains
            </div>
          </div>

          {/* ==================== 4 GOVERNANCE CARDS & SUB-NODES ==================== */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 1. DEPARTMENTS DIVISION MATRIX (BLUE) */}
            {(selectedPillar === "all" || selectedPillar === "departments") && (
              <div className="bg-white border-2 border-blue-200 rounded-3xl p-5 shadow-sm space-y-4">
                <div 
                  onClick={() => setSelectedNode(NODE_CATALOG["G1"])}
                  className="cursor-pointer flex items-center justify-between pb-3 border-b border-blue-100"
                >
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-md bg-[#1D68BD] text-white text-[10px] font-black uppercase">
                      G1 NODE
                    </span>
                    <div>
                      <h4 className="text-sm font-black text-[#042C51]">Departments Management</h4>
                      <span className="text-[10px] text-slate-500 font-bold">7 Organizational Business Units</span>
                    </div>
                  </div>
                  {onSwitchModule && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSwitchModule("Departments");
                      }}
                      className="px-2.5 py-1 rounded-xl bg-blue-50 hover:bg-[#1D68BD] text-[#1D68BD] hover:text-white border border-blue-200 text-[10px] font-black transition-all flex items-center gap-1 cursor-pointer"
                    >
                      <span>Open Screen</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  )}
                </div>

                <div className="space-y-2">
                  {DEPARTMENTS.map((dept, dIdx) => (
                    <div 
                      key={dIdx}
                      className="p-2.5 rounded-xl border border-slate-200/80 bg-slate-50/70 hover:bg-white flex items-center justify-between gap-2 transition-colors text-xs"
                    >
                      <div>
                        <span className="font-black text-[#042C51] block">{dept.name}</span>
                        <span className="text-[10px] text-slate-500">Lead: {dept.head}</span>
                      </div>
                      <div className="text-right">
                        <span className="font-mono font-black text-[#1D68BD] block">{dept.count} Staff</span>
                        <span className="text-[9.5px] font-bold text-slate-400">Budget: {dept.budget}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 2. OFFICE LOCATIONS REGISTRY (TEAL) */}
            {(selectedPillar === "all" || selectedPillar === "locations") && (
              <div className="bg-white border-2 border-teal-200 rounded-3xl p-5 shadow-sm space-y-4">
                <div 
                  onClick={() => setSelectedNode(NODE_CATALOG["G2"])}
                  className="cursor-pointer flex items-center justify-between pb-3 border-b border-teal-100"
                >
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-md bg-[#0E8773] text-white text-[10px] font-black uppercase">
                      G2 NODE
                    </span>
                    <div>
                      <h4 className="text-sm font-black text-[#042C51]">Office Locations Registry</h4>
                      <span className="text-[10px] text-slate-500 font-bold">3 Physical Facilities • 2,450 Desks</span>
                    </div>
                  </div>
                  {onSwitchModule && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSwitchModule("Office Locations");
                      }}
                      className="px-2.5 py-1 rounded-xl bg-teal-50 hover:bg-[#0E8773] text-[#0E8773] hover:text-white border border-teal-200 text-[10px] font-black transition-all flex items-center gap-1 cursor-pointer"
                    >
                      <span>Open Screen</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  )}
                </div>

                <div className="space-y-3">
                  {LOCATIONS.map((loc, lIdx) => (
                    <div 
                      key={lIdx}
                      className="p-3.5 rounded-2xl border border-teal-200/80 bg-teal-50/40 space-y-2 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-[#0E8773]" />
                          <span className="font-black text-[#042C51]">{loc.name}</span>
                        </div>
                        <span className="text-[9px] font-black px-2 py-0.5 rounded bg-teal-200 text-teal-900 uppercase">
                          {loc.badge}
                        </span>
                      </div>

                      <div className="grid grid-cols-3 gap-2 text-center text-[10.5px]">
                        <div className="bg-white p-1.5 rounded-lg border border-teal-100">
                          <span className="text-[9px] text-slate-400 block uppercase">Desks</span>
                          <span className="font-mono font-black text-slate-800">{loc.capacity}</span>
                        </div>
                        <div className="bg-white p-1.5 rounded-lg border border-teal-100">
                          <span className="text-[9px] text-slate-400 block uppercase">Occupancy</span>
                          <span className="font-mono font-black text-emerald-600">{loc.occupancy}</span>
                        </div>
                        <div className="bg-white p-1.5 rounded-lg border border-teal-100">
                          <span className="text-[9px] text-slate-400 block uppercase">Shifts</span>
                          <span className="font-black text-slate-700">{loc.shifts}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 3. ASSESSMENT SCORING & WEIGHTS (ORANGE) */}
            {(selectedPillar === "all" || selectedPillar === "scoring") && (
              <div className="bg-white border-2 border-orange-200 rounded-3xl p-5 shadow-sm space-y-4">
                <div 
                  onClick={() => setSelectedNode(NODE_CATALOG["G3"])}
                  className="cursor-pointer flex items-center justify-between pb-3 border-b border-orange-100"
                >
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-md bg-[#FF5C28] text-white text-[10px] font-black uppercase">
                      G3 NODE
                    </span>
                    <div>
                      <h4 className="text-sm font-black text-[#042C51]">Assessment Scoring Engine</h4>
                      <span className="text-[10px] text-slate-500 font-bold">Candidate Evaluation Weights & Passing Floor</span>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-xl bg-orange-50 text-[#FF5C28] border border-orange-200 text-[10px] font-black">
                    Passing: 75%
                  </span>
                </div>

                {/* Internal Pipeline with Emphasized Flow Arrows */}
                <div className="p-3 bg-orange-50/50 rounded-2xl border border-orange-200/80">
                  <span className="text-[10px] font-black uppercase text-orange-900 block mb-2">
                    Automated Candidate Assessment Flow
                  </span>
                  <div className="flex items-center gap-1 overflow-x-auto pb-1">
                    <div className="bg-white p-2.5 rounded-xl border border-orange-200 shrink-0 text-center min-w-[100px]">
                      <span className="text-[9px] font-bold text-slate-400 block">STAGE 1</span>
                      <span className="text-[10.5px] font-black text-[#042C51]">Test Complete</span>
                    </div>

                    <HorizontalFlowArrow
                      label="Apply Weights"
                      color="orange"
                      length="sm"
                    />

                    <div className="bg-white p-2.5 rounded-xl border border-orange-200 shrink-0 text-center min-w-[110px]">
                      <span className="text-[9px] font-bold text-slate-400 block">STAGE 2</span>
                      <span className="text-[10.5px] font-black text-[#042C51]">40% / 30% / 30%</span>
                    </div>

                    <HorizontalFlowArrow
                      label="Check ≥ 75%"
                      color="emerald"
                      length="sm"
                    />

                    <div className="bg-emerald-50 p-2.5 rounded-xl border border-emerald-300 shrink-0 text-center min-w-[110px]">
                      <span className="text-[9px] font-bold text-emerald-600 block">STAGE 3</span>
                      <span className="text-[10.5px] font-black text-emerald-900">Step 6 Interview</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="bg-orange-50/70 p-3 rounded-2xl border border-orange-200">
                    <span className="text-[9.5px] font-bold text-slate-500 uppercase block">English / Language</span>
                    <span className="font-mono font-black text-base text-[#FF5C28] block mt-0.5">40%</span>
                    <span className="text-[9px] text-slate-400">Versant / Berlitz</span>
                  </div>
                  <div className="bg-orange-50/70 p-3 rounded-2xl border border-orange-200">
                    <span className="text-[9.5px] font-bold text-slate-500 uppercase block">Technical Typing</span>
                    <span className="font-mono font-black text-base text-[#FF5C28] block mt-0.5">30%</span>
                    <span className="text-[9px] text-slate-400">WPM & Accuracy</span>
                  </div>
                  <div className="bg-orange-50/70 p-3 rounded-2xl border border-orange-200">
                    <span className="text-[9.5px] font-bold text-slate-500 uppercase block">Behavioral / Fit</span>
                    <span className="font-mono font-black text-base text-[#FF5C28] block mt-0.5">30%</span>
                    <span className="text-[9px] text-slate-400">Situational Judgement</span>
                  </div>
                </div>
              </div>
            )}

            {/* 4. COMMUNICATION & AUDIT LOGS (PURPLE) */}
            {(selectedPillar === "all" || selectedPillar === "departments") && (
              <div className="bg-white border-2 border-purple-200 rounded-3xl p-5 shadow-sm space-y-4">
                <div 
                  onClick={() => setSelectedNode(NODE_CATALOG["G4"])}
                  className="cursor-pointer flex items-center justify-between pb-3 border-b border-purple-100"
                >
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-md bg-purple-600 text-white text-[10px] font-black uppercase">
                      G4 NODE
                    </span>
                    <div>
                      <h4 className="text-sm font-black text-[#042C51]">Communication Audit Trail</h4>
                      <span className="text-[10px] text-slate-500 font-bold">Candidate Notification & Transactional SMTP Logs</span>
                    </div>
                  </div>
                  {onSwitchModule && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSwitchModule("Email Logs");
                      }}
                      className="px-2.5 py-1 rounded-xl bg-purple-50 hover:bg-purple-600 text-purple-700 hover:text-white border border-purple-200 text-[10px] font-black transition-all flex items-center gap-1 cursor-pointer"
                    >
                      <span>Open Logs</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  )}
                </div>

                {/* Internal Pipeline with Emphasized Flow Arrows */}
                <div className="p-3 bg-purple-50/50 rounded-2xl border border-purple-200/80">
                  <span className="text-[10px] font-black uppercase text-purple-900 block mb-2">
                    Transactional Event Dispatch Pipeline
                  </span>
                  <div className="flex items-center gap-1 overflow-x-auto pb-1">
                    <div className="bg-white p-2.5 rounded-xl border border-purple-200 shrink-0 text-center min-w-[95px]">
                      <span className="text-[9px] font-bold text-slate-400 block">TRIGGER</span>
                      <span className="text-[10.5px] font-black text-[#042C51]">Offer / Reject</span>
                    </div>

                    <HorizontalFlowArrow
                      label="Dispatch"
                      color="purple"
                      length="sm"
                    />

                    <div className="bg-white p-2.5 rounded-xl border border-purple-200 shrink-0 text-center min-w-[105px]">
                      <span className="text-[9px] font-bold text-slate-400 block">GATEWAY</span>
                      <span className="text-[10.5px] font-black text-[#042C51]">SMTP Service</span>
                    </div>

                    <HorizontalFlowArrow
                      label="Log Hash"
                      color="emerald"
                      length="sm"
                    />

                    <div className="bg-emerald-50 p-2.5 rounded-xl border border-emerald-300 shrink-0 text-center min-w-[105px]">
                      <span className="text-[9px] font-bold text-emerald-600 block">AUDIT</span>
                      <span className="text-[10.5px] font-black text-emerald-900">Audit Ledger</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-purple-50/50 border border-purple-100 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-purple-600" />
                      <span className="font-bold text-slate-700">Interview Invitations Sent</span>
                    </div>
                    <span className="font-mono font-black text-purple-700">8,420 Dispatched</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-purple-50/50 border border-purple-100 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileSpreadsheet className="w-3.5 h-3.5 text-purple-600" />
                      <span className="font-bold text-slate-700">Formal Job Offers Issued</span>
                    </div>
                    <span className="font-mono font-black text-purple-700">1,240 Issued</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-purple-50/50 border border-purple-100 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-purple-600" />
                      <span className="font-bold text-slate-700">Pre-Employment Follow-ups</span>
                    </div>
                    <span className="font-mono font-black text-purple-700">3,160 Reminders</span>
                  </div>
                </div>
              </div>
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
              <div className="flex items-start justify-between pb-3 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[9.5px] font-black bg-[#042C51] text-white uppercase">
                      {selectedNode.code}
                    </span>
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider">
                      {selectedNode.domain} domain
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
                <span className="text-[9.5px] font-bold text-slate-400 uppercase block">ADMINISTRATIVE OWNER</span>
                <span className="font-black text-[#042C51] flex items-center gap-1.5 mt-0.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#FF5C28]" />
                  <span>{selectedNode.role}</span>
                </span>
              </div>

              {/* Description */}
              <div>
                <span className="text-[10px] font-black uppercase text-slate-400 block mb-1">
                  Governance Purpose
                </span>
                <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-200">
                  {selectedNode.description}
                </p>
              </div>

              {/* Metrics if present */}
              {selectedNode.metrics && (
                <div className="bg-blue-50/50 p-3 rounded-xl border border-blue-200/80 space-y-1.5">
                  <span className="text-[10px] font-black uppercase text-[#1D68BD] block">
                    Domain Metrics & Capacity
                  </span>
                  {Object.entries(selectedNode.metrics).map(([k, v], idx) => (
                    <div key={idx} className="flex items-center justify-between text-xs">
                      <span className="text-slate-600 font-medium">{k}:</span>
                      <span className="font-mono font-black text-[#042C51]">{v}</span>
                    </div>
                  ))}
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

              {/* Rules & SLA */}
              <div>
                <span className="text-[10px] font-black uppercase text-slate-400 block mb-1">
                  Compliance & Governance Rules
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
                  className="w-full py-2.5 px-4 bg-[#042C51] hover:bg-[#09477e] text-white text-xs font-bold rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer mt-3"
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
