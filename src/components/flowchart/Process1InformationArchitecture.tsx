import React, { useState } from "react";
import { 
  Network, 
  ExternalLink, 
  Search, 
  Layers, 
  Users, 
  ShieldCheck, 
  ArrowDown, 
  ArrowRight,
  ChevronRight, 
  Sparkles, 
  CheckCircle2,
  Code2,
  Copy,
  Check,
  Building2,
  BarChart2,
  Clock,
  UserCheck,
  Settings,
  HelpCircle,
  X,
  FileText,
  Sliders,
  ZoomIn,
  ZoomOut,
  Maximize2
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { IA_BRANCHES, MERMAID_DIAGRAMS } from "./flowchartData";
import { HorizontalFlowArrow, VerticalFlowArrow } from "./FlowArrow";
import { IABranch } from "./flowchartTypes";

interface Process1IAProps {
  onSwitchModule?: (moduleKey: string) => void;
}

interface SelectedNodeDetails {
  id: string;
  name: string;
  code: string;
  level: "L0" | "L1" | "L2" | "L3";
  parentBranch?: string;
  audience: string;
  description: string;
  moduleKey?: string;
  badge?: string;
  permissions?: {
    superAdmin: boolean;
    hrDirector: boolean;
    taRecruiter: boolean;
    opsManager: boolean;
    employee: boolean;
  };
  connectedEntities?: string[];
  systemRules?: string[];
}

export default function Process1InformationArchitecture({ onSwitchModule }: Process1IAProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBranchFilter, setSelectedBranchFilter] = useState<string>("all");
  const [showMermaidCode, setShowMermaidCode] = useState(false);
  const [copied, setCopied] = useState(false);
  const [viewMode, setViewMode] = useState<"tree" | "matrix">("tree");
  const [selectedNode, setSelectedNode] = useState<SelectedNodeDetails | null>(null);
  const [zoomLevel, setZoomLevel] = useState<number>(100);

  const handleCopyMermaid = () => {
    navigator.clipboard.writeText(MERMAID_DIAGRAMS["process-1-ia"].code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Filter branches and sub-modules
  const filteredBranches = IA_BRANCHES.map(branch => {
    if (selectedBranchFilter !== "all" && branch.id !== selectedBranchFilter) {
      return null;
    }
    if (!searchTerm.trim()) return branch;
    const term = searchTerm.toLowerCase();
    const matchesBranch = branch.name.toLowerCase().includes(term) || branch.roleAudience.toLowerCase().includes(term);
    const matchedSubs = branch.subModules.filter(s => 
      s.name.toLowerCase().includes(term) || s.description.toLowerCase().includes(term) || s.moduleKey.toLowerCase().includes(term) || s.id.toLowerCase().includes(term)
    );
    if (matchesBranch || matchedSubs.length > 0) {
      return {
        ...branch,
        subModules: matchesBranch ? branch.subModules : matchedSubs
      };
    }
    return null;
  }).filter(Boolean) as IABranch[];

  const totalFilteredSubModules = filteredBranches.reduce((acc, b) => acc + b.subModules.length, 0);

  // Default node inspection details builder
  const handleSelectSubModule = (branch: IABranch, sub: IABranch["subModules"][0]) => {
    setSelectedNode({
      id: sub.id,
      name: sub.name,
      code: sub.id,
      level: "L3",
      parentBranch: `${branch.code} - ${branch.name}`,
      audience: branch.roleAudience,
      description: sub.description,
      moduleKey: sub.moduleKey,
      badge: sub.badge,
      permissions: {
        superAdmin: true,
        hrDirector: branch.id === "M2" || branch.id === "M5" || branch.id === "M6",
        taRecruiter: branch.id === "M3" || (branch.id === "M5" && sub.id === "D3"),
        opsManager: branch.id === "M4" || (branch.id === "M5" && sub.id === "D4"),
        employee: branch.id === "M1"
      },
      connectedEntities: [
        branch.id === "M1" ? "Biometric Logs & Shifts" : null,
        branch.id === "M2" ? "Employee Master Roster" : null,
        branch.id === "M3" ? "Applicant Pipeline & Scorecards" : null,
        branch.id === "M4" ? "Headcount Forecast & Ramp Schedules" : null,
        branch.id === "M5" ? "Operational Analytics Datawarehouse" : null,
        branch.id === "M6" ? "Organization Master Registry" : null,
      ].filter(Boolean) as string[],
      systemRules: [
        "Strict Role-Based Access Control (RBAC) enforced at topbar entry.",
        "Real-time state synchronization with global SiBS database.",
        "Audit logging enabled for all creation, edits, and state transitions."
      ]
    });
  };

  return (
    <div className="space-y-6">
      {/* ==================== 1. MASTER HEADER & ARCHITECTURAL CONTROLS ==================== */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2.5 py-0.5 rounded-full bg-[#1D68BD] text-white text-[10px] font-black uppercase tracking-wider">
              PROCESS 1 OF 5
            </span>
            <h2 className="text-base sm:text-lg font-black text-[#042C51] tracking-tight">
              High-Level Information Architecture (IA) Flowchart
            </h2>
            <span className="px-2 py-0.5 rounded-full bg-blue-50 text-[#1D68BD] text-[10px] font-black border border-blue-200">
              6 Pillars • 26 Modules
            </span>
          </div>
          <p className="text-xs text-slate-600 font-medium mt-1">
            Complete structural blueprint mapping the global topbar navigation, 6 functional pillars, and 26 interconnected sub-modules across all corporate roles.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* View Mode Toggle: Visual Tree vs RBAC Matrix */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-bold">
            <button
              onClick={() => setViewMode("tree")}
              className={`px-3 py-1 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                viewMode === "tree" ? "bg-[#042C51] text-white shadow-2xs" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Network className="w-3.5 h-3.5" />
              <span>Visual Tree</span>
            </button>
            <button
              onClick={() => setViewMode("matrix")}
              className={`px-3 py-1 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                viewMode === "matrix" ? "bg-[#1D68BD] text-white shadow-2xs" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>RBAC Matrix</span>
            </button>
          </div>

          {/* Search Box */}
          <div className="relative min-w-[180px] sm:min-w-[220px]">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search module, ID, or audience..."
              className="w-full pl-8 pr-7 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1D68BD] text-slate-800 placeholder:text-slate-400"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Zoom Controls (Tree Mode) */}
          {viewMode === "tree" && (
            <div className="hidden sm:flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-xl p-1 text-xs">
              <button
                onClick={() => setZoomLevel(prev => Math.max(80, prev - 10))}
                className="p-1 text-slate-600 hover:text-[#042C51] rounded hover:bg-slate-200 transition-colors"
                title="Zoom Out"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="text-[10px] font-mono font-bold px-1 text-slate-600">{zoomLevel}%</span>
              <button
                onClick={() => setZoomLevel(prev => Math.min(130, prev + 10))}
                className="p-1 text-slate-600 hover:text-[#042C51] rounded hover:bg-slate-200 transition-colors"
                title="Zoom In"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setZoomLevel(100)}
                className="px-1.5 py-0.5 text-[9px] font-bold text-slate-500 hover:text-[#042C51] rounded hover:bg-slate-200"
              >
                Reset
              </button>
            </div>
          )}

          {/* Toggle Mermaid Code */}
          <button
            onClick={() => setShowMermaidCode(prev => !prev)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
              showMermaidCode
                ? "bg-[#042C51] text-white border-[#042C51]"
                : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>{showMermaidCode ? "Hide Mermaid" : "Mermaid Code"}</span>
          </button>
        </div>
      </div>

      {/* ==================== MERMAID DEFINITION (EXPANDABLE) ==================== */}
      {showMermaidCode && (
        <div className="bg-slate-900 text-slate-100 rounded-2xl p-5 border border-slate-800 shadow-md">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
            <div className="flex items-center gap-2 text-xs font-black text-amber-400">
              <Code2 className="w-4 h-4" />
              <span>Mermaid Definition (Process 1: Information Architecture)</span>
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
            {MERMAID_DIAGRAMS["process-1-ia"].code}
          </pre>
        </div>
      )}

      {/* ==================== BRANCH FILTER PILLS ==================== */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs font-bold scrollbar-none">
        <button
          onClick={() => setSelectedBranchFilter("all")}
          className={`px-3 py-1.5 rounded-xl border transition-all shrink-0 cursor-pointer ${
            selectedBranchFilter === "all"
              ? "bg-[#042C51] text-white border-[#042C51] shadow-2xs"
              : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
          }`}
        >
          All 6 Pillars (26 Modules)
        </button>
        {IA_BRANCHES.map(b => (
          <button
            key={b.id}
            onClick={() => setSelectedBranchFilter(b.id)}
            className={`px-3 py-1.5 rounded-xl border transition-all shrink-0 flex items-center gap-1.5 cursor-pointer ${
              selectedBranchFilter === b.id
                ? "text-white shadow-2xs font-black"
                : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
            }`}
            style={{
              backgroundColor: selectedBranchFilter === b.id ? b.color : undefined,
              borderColor: selectedBranchFilter === b.id ? b.color : undefined
            }}
          >
            <span className="text-[10px] font-mono px-1 rounded bg-white/20">{b.code}</span>
            <span>{b.name}</span>
            <span className="text-[9.5px] opacity-80">({b.subModules.length})</span>
          </button>
        ))}
      </div>

      {/* ==================== VIEW MODE 1: VISUAL ARCHITECTURAL TREE ==================== */}
      {viewMode === "tree" && (
        <div 
          className="flex-1 flex flex-col lg:flex-row gap-6 items-start"
          style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: "top left" }}
        >
          <div className="flex-1 w-full space-y-6">
            {/* --- LEVEL 0 & LEVEL 1: ROOT STEM & GLOBAL NAVIGATION CONDUIT --- */}
            <div className="bg-gradient-to-b from-slate-900 via-[#042C51] to-[#042C51] text-white border-2 border-blue-400/30 rounded-3xl p-6 shadow-xl relative overflow-hidden">
              <div className="absolute -right-12 -top-12 w-48 h-48 rounded-full bg-blue-500/10 blur-2xl pointer-events-none"></div>
              
              <div className="flex flex-col items-center text-center max-w-2xl mx-auto space-y-4">
                {/* L0: Root System Architecture */}
                <div 
                  onClick={() => setSelectedNode({
                    id: "ROOT",
                    name: "SiBS Solutions HRIS Ecosystem",
                    code: "ROOT",
                    level: "L0",
                    audience: "Enterprise Organization (2,450+ Active Personnel)",
                    description: "Root parent container orchestrating human resources, talent acquisition, attendance biometrics, workforce capacity planning, and organizational governance.",
                    connectedEntities: ["Enterprise PostgreSQL / Cloud Database", "Biometric Terminal Fleet", "Email Dispatch Services"],
                    systemRules: [
                      "Centralized authentication & single sign-on (SSO).",
                      "Multi-tenant tenant isolation across 3 operational campuses.",
                      "Zero-trust RBAC gating at all application router entry points."
                    ]
                  })}
                  className="cursor-pointer group px-6 py-3 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/20 transition-all shadow-inner backdrop-blur-sm"
                >
                  <div className="flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#FF5C28]">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>LEVEL 0 • ROOT SYSTEM ARCHITECTURE</span>
                  </div>
                  <h1 className="text-lg sm:text-xl font-black text-white tracking-tight mt-1 group-hover:text-blue-200 transition-colors">
                    SiBS Solutions HRIS Ecosystem
                  </h1>
                  <p className="text-[11px] text-blue-100/80 mt-0.5">
                    Enterprise Workforce Management & Talent Lifecycle Infrastructure
                  </p>
                </div>

                {/* Vertical Flow Arrow: L0 -> L1 */}
                <VerticalFlowArrow
                  color="orange"
                  label="Initializes Topbar Shell"
                  length="md"
                  animated={true}
                />

                {/* L1: Global Topbar & Role Navigation */}
                <div 
                  onClick={() => setSelectedNode({
                    id: "NAV",
                    name: "Global Topbar & Role Navigation",
                    code: "NAV",
                    level: "L1",
                    audience: "Super Admin, HR Director, Recruiter/TA, Operations Manager, Employee",
                    description: "Global application topbar providing real-time clock stamps, system notifications, breadcrumb routing, campus location selector, and role-based permissions routing.",
                    connectedEntities: ["Session State Store", "Role-Based Access Control Policy Engine"],
                    systemRules: [
                      "Dynamic menu filtering based on verified JWT role claims.",
                      "Persistent campus site selector (Tagum HQ, Davao Ops, Mabini Dev).",
                      "Instant notification drawer for approvals, clocking alerts, and offer acceptances."
                    ]
                  })}
                  className="cursor-pointer group w-full max-w-xl bg-white/95 text-slate-900 rounded-2xl p-4 shadow-lg border-2 border-[#1D68BD] hover:border-[#FF5C28] transition-all"
                >
                  <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2 mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-xl bg-blue-100 text-[#1D68BD] flex items-center justify-center font-black">
                        <Network className="w-4 h-4" />
                      </div>
                      <div className="text-left">
                        <span className="text-[9.5px] font-black uppercase tracking-wider text-blue-600 block">
                          LEVEL 1 • ROUTING & ACCESS
                        </span>
                        <h3 className="text-xs sm:text-sm font-black text-[#042C51]">
                          Global Topbar & Role Navigation
                        </h3>
                      </div>
                    </div>
                    <span className="text-[10px] font-black text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                      Click to Inspect
                    </span>
                  </div>

                  {/* 5 Core RBAC Gateways Pills */}
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5 text-[10px] font-extrabold text-center pt-1">
                    <span className="p-1.5 rounded-lg bg-slate-100 text-slate-800 border border-slate-200">
                      🛡️ Super Admin
                    </span>
                    <span className="p-1.5 rounded-lg bg-blue-50 text-[#1D68BD] border border-blue-200">
                      👥 HR Director
                    </span>
                    <span className="p-1.5 rounded-lg bg-purple-50 text-[#6B21A8] border border-purple-200">
                      🎯 TA Recruiter
                    </span>
                    <span className="p-1.5 rounded-lg bg-orange-50 text-[#FF5C28] border border-orange-200">
                      📊 Ops Manager
                    </span>
                    <span className="p-1.5 rounded-lg bg-teal-50 text-[#0E8773] border border-teal-200 col-span-2 sm:col-span-1">
                      👤 Employee
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* --- SVG INTERCONNECTING BUS / BRANCH RAIL --- */}
            <div className="relative py-2 flex flex-col items-center">
              {/* Downward Flow Arrow from Topbar to Bus */}
              <VerticalFlowArrow
                color="blue"
                label="Role-Based Routing Bus"
                length="md"
                animated={true}
              />
              
              {/* Main horizontal bus rail */}
              <div className="w-full max-w-6xl h-1 bg-gradient-to-r from-teal-500 via-blue-500 via-purple-500 via-orange-500 to-slate-600 rounded-full relative shadow-sm">
                {/* Visual Branch Taps */}
                <div className="absolute left-[8%] -top-1 w-3 h-3 rounded-full bg-teal-500 ring-4 ring-teal-100"></div>
                <div className="absolute left-[25%] -top-1 w-3 h-3 rounded-full bg-blue-500 ring-4 ring-blue-100"></div>
                <div className="absolute left-[41%] -top-1 w-3 h-3 rounded-full bg-purple-500 ring-4 ring-purple-100"></div>
                <div className="absolute left-[58%] -top-1 w-3 h-3 rounded-full bg-orange-500 ring-4 ring-orange-100"></div>
                <div className="absolute left-[75%] -top-1 w-3 h-3 rounded-full bg-[#042C51] ring-4 ring-blue-100"></div>
                <div className="absolute left-[92%] -top-1 w-3 h-3 rounded-full bg-slate-600 ring-4 ring-slate-200"></div>
              </div>

              {/* Branch indicators label */}
              <div className="text-[10px] font-black uppercase tracking-wider text-slate-400 mt-2 flex items-center gap-1.5">
                <ArrowDown className="w-3 h-3 text-slate-400" />
                <span>Distributing into 6 Dedicated Functional Pillars</span>
              </div>
            </div>

            {/* --- LEVEL 2 & 3: 6 FUNCTIONAL PILLARS WITH CRISP NODE CARDS --- */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {filteredBranches.map(branch => {
                const isSelected = selectedNode?.parentBranch?.includes(branch.name) || selectedNode?.id === branch.id;

                return (
                  <div
                    key={branch.id}
                    className={`bg-white border-2 rounded-2xl transition-all shadow-sm flex flex-col justify-between overflow-hidden relative group ${
                      isSelected ? "border-[#FF5C28] ring-2 ring-orange-200 shadow-md" : branch.borderColor
                    }`}
                  >
                    {/* Top Branch Header (Level 2 Node) */}
                    <div 
                      onClick={() => setSelectedNode({
                        id: branch.id,
                        name: branch.name,
                        code: branch.code,
                        level: "L2",
                        parentBranch: "SiBS Solutions HRIS Ecosystem",
                        audience: branch.roleAudience,
                        description: branch.description,
                        connectedEntities: branch.subModules.map(s => s.name),
                        systemRules: [
                          `Enforces specific role privileges for ${branch.roleAudience}.`,
                          `Coordinates with all ${branch.subModules.length} sub-modules within the cluster.`
                        ]
                      })}
                      className="p-4 border-b border-slate-100 cursor-pointer transition-all"
                      style={{ backgroundColor: `${branch.color}0D` }}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span 
                            className="px-2.5 py-1 rounded-xl text-xs font-black text-white shadow-2xs"
                            style={{ backgroundColor: branch.color }}
                          >
                            {branch.code}
                          </span>
                          <div>
                            <span className="text-[9.5px] font-black uppercase tracking-wider text-slate-500 block">
                              PILLAR L2
                            </span>
                            <h3 className="text-sm font-black text-[#042C51] leading-tight group-hover:text-[#1D68BD] transition-colors">
                              {branch.name}
                            </h3>
                          </div>
                        </div>

                        <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-white border border-slate-200 text-slate-700 shadow-2xs shrink-0">
                          {branch.subModules.length} Modules
                        </span>
                      </div>

                      <div className="mt-2 text-[10.5px] text-slate-500 font-semibold flex items-center gap-1">
                        <Users className="w-3 h-3 text-slate-400 shrink-0" />
                        <span className="truncate">Audience: {branch.roleAudience}</span>
                      </div>

                      <p className="text-[11px] text-slate-600 mt-1.5 line-clamp-2 leading-relaxed">
                        {branch.description}
                      </p>
                    </div>

                    {/* Sub-modules list (Level 3 Nodes) */}
                    <div className="p-3.5 space-y-2 flex-1 bg-slate-50/40">
                      <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-wider text-slate-400 px-1">
                        <span>Connected Sub-Modules</span>
                        <span>Direct Action</span>
                      </div>

                      <div className="space-y-2">
                        {branch.subModules.map(sub => {
                          const isSubSelected = selectedNode?.id === sub.id;

                          return (
                            <div
                              key={sub.id}
                              onClick={() => handleSelectSubModule(branch, sub)}
                              className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-start justify-between gap-2 group/card ${
                                isSubSelected
                                  ? "bg-white border-[#FF5C28] shadow-sm ring-1 ring-[#FF5C28]"
                                  : "bg-white hover:bg-slate-50/90 border-slate-200/90 hover:border-slate-300"
                              }`}
                            >
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <span 
                                    className="text-[9.5px] font-mono font-black px-1.5 py-0.2 rounded border"
                                    style={{
                                      backgroundColor: `${branch.color}15`,
                                      borderColor: `${branch.color}40`,
                                      color: branch.color
                                    }}
                                  >
                                    {sub.id}
                                  </span>
                                  <span className="text-xs font-black text-[#042C51] truncate">
                                    {sub.name}
                                  </span>
                                  {sub.badge && (
                                    <span className="text-[8.5px] font-bold px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 border border-slate-200">
                                      {sub.badge}
                                    </span>
                                  )}
                                </div>
                                <p className="text-[10px] text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                                  {sub.description}
                                </p>
                              </div>

                              {/* Action Buttons: Inspect & Launch Wireframe */}
                              <div className="flex flex-col gap-1 items-end shrink-0 pt-0.5">
                                {onSwitchModule && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      onSwitchModule(sub.moduleKey);
                                    }}
                                    className="px-2 py-1 bg-white hover:bg-[#1D68BD] text-slate-700 hover:text-white border border-slate-200 hover:border-[#1D68BD] rounded-lg text-[9.5px] font-black flex items-center gap-1 transition-all shadow-2xs cursor-pointer"
                                    title={`Open ${sub.name}`}
                                  >
                                    <span>Launch</span>
                                    <ExternalLink className="w-2.5 h-2.5" />
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Bottom Status / Connectivity Footer */}
                    <div className="px-4 py-2 bg-slate-100/70 border-t border-slate-200/70 text-[10px] font-bold text-slate-500 flex items-center justify-between">
                      <span className="flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>Live State Synchronized</span>
                      </span>
                      <button
                        onClick={() => setSelectedBranchFilter(branch.id)}
                        className="text-[10px] font-black text-[#1D68BD] hover:underline cursor-pointer"
                      >
                        Focus Pillar →
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ==================== NODE INSPECTION DRAWER (SIDEBAR) ==================== */}
          <AnimatePresence>
            {selectedNode && (
              <>
                {/* Mobile backdrop */}
                <div 
                  onClick={() => setSelectedNode(null)}
                  className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-40 lg:hidden transition-opacity cursor-pointer"
                  aria-label="Close node inspector"
                />
                <motion.div
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 50 }}
                  className="fixed inset-y-0 right-0 z-50 w-full max-w-sm sm:max-w-md bg-white border-l border-slate-200 shadow-2xl p-5 overflow-y-auto space-y-4 lg:relative lg:inset-auto lg:z-auto lg:w-84 xl:w-96 lg:border-2 lg:border-slate-300 lg:rounded-3xl lg:shadow-xl lg:sticky lg:top-6 shrink-0"
                >
                {/* Header */}
                <div className="flex items-start justify-between pb-3 border-b border-slate-100">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-[9.5px] font-black bg-[#042C51] text-white uppercase">
                        {selectedNode.level} NODE
                      </span>
                      <span className="text-[11px] font-mono font-black text-slate-500">
                        {selectedNode.code}
                      </span>
                    </div>
                    <h3 className="text-sm font-black text-[#042C51] mt-1">
                      {selectedNode.name}
                    </h3>
                  </div>

                  <button
                    onClick={() => setSelectedNode(null)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Parent Pillar Context */}
                {selectedNode.parentBranch && (
                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-xs">
                    <span className="text-[9.5px] font-bold text-slate-400 uppercase block">PARENT ARCHITECTURE PILLAR</span>
                    <span className="font-black text-[#042C51]">{selectedNode.parentBranch}</span>
                  </div>
                )}

                {/* Description */}
                <div>
                  <span className="text-[10px] font-black uppercase text-slate-400 block mb-1">
                    Functional Purpose
                  </span>
                  <p className="text-xs text-slate-600 leading-relaxed bg-blue-50/40 p-3 rounded-xl border border-blue-100">
                    {selectedNode.description}
                  </p>
                </div>

                {/* Role Audience & RBAC */}
                <div>
                  <span className="text-[10px] font-black uppercase text-slate-400 block mb-1">
                    Authorized Audiences
                  </span>
                  <p className="text-xs font-black text-[#042C51]">
                    {selectedNode.audience}
                  </p>
                  {selectedNode.permissions && (
                    <div className="grid grid-cols-2 gap-1.5 mt-2 text-[10px]">
                      <div className={`p-1.5 rounded-lg border flex items-center justify-between ${selectedNode.permissions.superAdmin ? "bg-emerald-50 text-emerald-800 border-emerald-200" : "bg-slate-50 text-slate-400 border-slate-200"}`}>
                        <span>Super Admin</span>
                        <span>{selectedNode.permissions.superAdmin ? "✓ Full" : "✗"}</span>
                      </div>
                      <div className={`p-1.5 rounded-lg border flex items-center justify-between ${selectedNode.permissions.hrDirector ? "bg-emerald-50 text-emerald-800 border-emerald-200" : "bg-slate-50 text-slate-400 border-slate-200"}`}>
                        <span>HR Director</span>
                        <span>{selectedNode.permissions.hrDirector ? "✓ Read/Write" : "✗"}</span>
                      </div>
                      <div className={`p-1.5 rounded-lg border flex items-center justify-between ${selectedNode.permissions.taRecruiter ? "bg-emerald-50 text-emerald-800 border-emerald-200" : "bg-slate-50 text-slate-400 border-slate-200"}`}>
                        <span>TA Recruiter</span>
                        <span>{selectedNode.permissions.taRecruiter ? "✓ Access" : "✗"}</span>
                      </div>
                      <div className={`p-1.5 rounded-lg border flex items-center justify-between ${selectedNode.permissions.opsManager ? "bg-emerald-50 text-emerald-800 border-emerald-200" : "bg-slate-50 text-slate-400 border-slate-200"}`}>
                        <span>Ops Manager</span>
                        <span>{selectedNode.permissions.opsManager ? "✓ Access" : "✗"}</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Connected Data Entities */}
                {selectedNode.connectedEntities && selectedNode.connectedEntities.length > 0 && (
                  <div>
                    <span className="text-[10px] font-black uppercase text-slate-400 block mb-1">
                      Connected Data Entities
                    </span>
                    <ul className="space-y-1 text-xs text-slate-600">
                      {selectedNode.connectedEntities.map((ent, eIdx) => (
                        <li key={eIdx} className="flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#1D68BD]"></span>
                          <span>{ent}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* System Rules */}
                {selectedNode.systemRules && (
                  <div>
                    <span className="text-[10px] font-black uppercase text-slate-400 block mb-1">
                      System Architectural Rules
                    </span>
                    <ul className="space-y-1 text-[11px] text-slate-500">
                      {selectedNode.systemRules.map((rule, rIdx) => (
                        <li key={rIdx} className="flex items-start gap-1.5">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0 mt-0.5" />
                          <span>{rule}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Wireframe Launch Button */}
                {selectedNode.moduleKey && onSwitchModule && (
                  <button
                    onClick={() => onSwitchModule(selectedNode.moduleKey!)}
                    className="w-full py-2.5 px-4 bg-[#FF5C28] hover:bg-[#e04b1c] text-white text-xs font-bold rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer mt-3"
                  >
                    <span>Launch Active Screen ({selectedNode.name})</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                )}
              </motion.div>
            </>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* ==================== VIEW MODE 2: ROLE-BASED ACCESS CONTROL (RBAC) MATRIX ==================== */}
      {viewMode === "matrix" && (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-200 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-black text-[#042C51]">
                Role-Based Permission Matrix (RBAC) Across All 26 Sub-Modules
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Detailed access governance matrix across Super Admin, HR, TA, Operations Managers, and Frontline Employees.
              </p>
            </div>
            <span className="text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1 rounded-xl">
              Showing {totalFilteredSubModules} Modules
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs min-w-[760px]">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-black text-slate-600 uppercase tracking-wider">
                  <th className="py-3 px-4">Pillar & Sub-Module</th>
                  <th className="py-3 px-3 text-center">Code</th>
                  <th className="py-3 px-3 text-center">Super Admin</th>
                  <th className="py-3 px-3 text-center">HR Director</th>
                  <th className="py-3 px-3 text-center">TA Recruiter</th>
                  <th className="py-3 px-3 text-center">Ops Manager</th>
                  <th className="py-3 px-3 text-center">Employee</th>
                  <th className="py-3 px-4 text-right">Wireframe Link</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                {filteredBranches.flatMap(branch => 
                  branch.subModules.map(sub => (
                    <tr key={sub.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span 
                            className="w-2 h-2 rounded-full shrink-0" 
                            style={{ backgroundColor: branch.color }}
                          ></span>
                          <div>
                            <span className="font-black text-[#042C51] block">{sub.name}</span>
                            <span className="text-[10px] text-slate-400">{branch.name}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-3 text-center font-mono font-bold text-slate-500">
                        {sub.id}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span className="px-2 py-0.5 rounded text-[10px] font-black bg-emerald-100 text-emerald-800">
                          Full Control
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center">
                        {branch.id === "M2" || branch.id === "M5" || branch.id === "M6" ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-black bg-emerald-100 text-emerald-800">Read / Write</span>
                        ) : branch.id === "M3" ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800">Review</span>
                        ) : (
                          <span className="text-slate-300 font-bold">—</span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-center">
                        {branch.id === "M3" ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-black bg-purple-100 text-purple-800">Pipeline Admin</span>
                        ) : sub.id === "D3" ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800">View</span>
                        ) : (
                          <span className="text-slate-300 font-bold">—</span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-center">
                        {branch.id === "M4" || sub.id === "REC2" ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-black bg-orange-100 text-orange-800">Intake / Plan</span>
                        ) : sub.id === "D4" || sub.id === "HR2" ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800">Review</span>
                        ) : (
                          <span className="text-slate-300 font-bold">—</span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-center">
                        {branch.id === "M1" ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-black bg-teal-100 text-teal-800">Self-Service</span>
                        ) : (
                          <span className="text-slate-300 font-bold">—</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        {onSwitchModule && (
                          <button
                            onClick={() => onSwitchModule(sub.moduleKey)}
                            className="px-2.5 py-1 bg-slate-100 hover:bg-[#1D68BD] text-slate-700 hover:text-white rounded-lg font-black text-[10px] transition-all inline-flex items-center gap-1 cursor-pointer shadow-2xs"
                          >
                            <span>Open</span>
                            <ExternalLink className="w-3 h-3" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
