import React, { useState, useMemo } from "react";
import {
  Briefcase,
  Users,
  AlertCircle,
  Clock,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  Search,
  Filter,
  X,
  ChevronRight,
  User,
  ShieldAlert,
  Info,
  CheckCircle,
  HelpCircle,
  BarChart3,
  Check,
  Building,
  Target,
  ArrowUpRight
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface OMDashboardProps {
  userEmail?: string;
  onSwitchModule?: (module: string) => void;
}

interface RoleHiringItem {
  id: string;
  role: string;
  account: string;
  department: string;
  req: number;
  filled: number;
  open: number;
  dueDate: string;
  status: "On Track" | "At Risk" | "Delayed";
  taOwner: string;
  aging: number;
  dropOffs: number;
  actionItem: string;
  movement: {
    sourced: number;
    screened: number;
    interviewed: number;
    offered: number;
    accepted: number;
    hired: number;
  };
}

export default function OMDashboard({ userEmail, onSwitchModule }: OMDashboardProps) {
  // --- STATE ---
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState<RoleHiringItem | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Department restricted to Telecom & Tech for OM
  const targetDepartment = "Telecom & Tech Support";

  // Mock roles under OM's department (Telecom & Tech)
  const [rolesData, setRolesData] = useState<RoleHiringItem[]>([
    {
      id: "ROLE-001",
      role: "Senior Tech Lead",
      account: "Verizon Tech",
      department: "Telecom & Tech Support",
      req: 10,
      filled: 8,
      open: 2,
      dueDate: "2026-08-15",
      status: "On Track",
      taOwner: "Shiela Delos Reyes",
      aging: 12,
      dropOffs: 3,
      actionItem: "Final technical evaluation with local engineering panel.",
      movement: { sourced: 45, screened: 30, interviewed: 18, offered: 11, accepted: 9, hired: 8 }
    },
    {
      id: "ROLE-002",
      role: "Support Engineer",
      account: "T-Mobile Care",
      department: "Telecom & Tech Support",
      req: 45,
      filled: 30,
      open: 15,
      dueDate: "2026-07-30",
      status: "At Risk",
      taOwner: "Renz Torres",
      aging: 25,
      dropOffs: 12,
      actionItem: "Accelerate sourcing stage to counter higher-than-expected FST drop-offs.",
      movement: { sourced: 180, screened: 120, interviewed: 75, offered: 48, accepted: 38, hired: 30 }
    },
    {
      id: "ROLE-003",
      role: "Network Administrator",
      account: "AT&T Support",
      department: "Telecom & Tech Support",
      req: 5,
      filled: 2,
      open: 3,
      dueDate: "2026-08-01",
      status: "Delayed",
      taOwner: "Shiela Delos Reyes",
      aging: 35,
      dropOffs: 8,
      actionItem: "Re-negotiating market-rate compensation packages for specialized CCNA certs.",
      movement: { sourced: 22, screened: 14, interviewed: 8, offered: 4, accepted: 3, hired: 2 }
    },
    {
      id: "ROLE-004",
      role: "Customer Support Representative",
      account: "Comcast Technical",
      department: "Telecom & Tech Support",
      req: 120,
      filled: 110,
      open: 10,
      dueDate: "2026-07-25",
      status: "On Track",
      taOwner: "Mark Sarmiento",
      aging: 5,
      dropOffs: 18,
      actionItem: "Awaiting final biometric sync and contract sign-off for PST cluster.",
      movement: { sourced: 420, screened: 310, interviewed: 220, offered: 140, accepted: 125, hired: 110 }
    },
    {
      id: "ROLE-005",
      role: "Systems Engineer",
      account: "Verizon Tech",
      department: "Telecom & Tech Support",
      req: 15,
      filled: 6,
      open: 9,
      dueDate: "2026-08-20",
      status: "At Risk",
      taOwner: "Alena Batacan",
      aging: 18,
      dropOffs: 4,
      actionItem: "Review candidate screening criteria to align with architectural requirements.",
      movement: { sourced: 62, screened: 38, interviewed: 21, offered: 11, accepted: 8, hired: 6 }
    }
  ]);

  // Recruiter Load state (filtered or specific to OM cluster assignments)
  const recruiters = [
    {
      name: "Shiela Mae Delos Reyes",
      activeRoles: 4,
      hiredCount: 52,
      loadStatus: "High" as const,
      output: { sourced: 187, interviewed: 90, hired: 52 }
    },
    {
      name: "Renz Christopher Torres",
      activeRoles: 3,
      hiredCount: 30,
      loadStatus: "Medium" as const,
      output: { sourced: 180, interviewed: 75, hired: 30 }
    },
    {
      name: "Mark Gregory Sarmiento",
      activeRoles: 2,
      hiredCount: 110,
      loadStatus: "Normal" as const,
      output: { sourced: 420, interviewed: 220, hired: 110 }
    }
  ];

  // Calculated Metrics
  const summaryMetrics = useMemo(() => {
    const totalOpen = rolesData.reduce((sum, r) => sum + r.open, 0);
    const totalReq = rolesData.reduce((sum, r) => sum + r.req, 0);
    const totalFilled = rolesData.reduce((sum, r) => sum + r.filled, 0);
    const atRisk = rolesData.filter(r => r.status === "At Risk").length;
    const delayed = rolesData.filter(r => r.status === "Delayed").length;
    const dropOffs = rolesData.reduce((sum, r) => sum + r.dropOffs, 0);
    
    // Average aging of open roles
    const avgAging = Math.round(rolesData.reduce((sum, r) => sum + r.aging, 0) / rolesData.length);

    // Sum movement funnel
    const sourced = rolesData.reduce((sum, r) => sum + r.movement.sourced, 0);
    const screened = rolesData.reduce((sum, r) => sum + r.movement.screened, 0);
    const interviewed = rolesData.reduce((sum, r) => sum + r.movement.interviewed, 0);
    const offered = rolesData.reduce((sum, r) => sum + r.movement.offered, 0);
    const accepted = rolesData.reduce((sum, r) => sum + r.movement.accepted, 0);
    const hired = rolesData.reduce((sum, r) => sum + r.movement.hired, 0);

    return {
      totalOpen,
      totalReq,
      totalFilled,
      atRisk,
      delayed,
      dropOffs,
      avgAging,
      funnel: { sourced, screened, interviewed, offered, accepted, hired }
    };
  }, [rolesData]);

  // Search filtering
  const filteredRoles = useMemo(() => {
    return rolesData.filter(role => {
      const q = searchTerm.toLowerCase();
      return (
        role.role.toLowerCase().includes(q) ||
        role.account.toLowerCase().includes(q) ||
        role.taOwner.toLowerCase().includes(q)
      );
    });
  }, [rolesData, searchTerm]);

  // Show dynamic toast
  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  return (
    <div className="flex-1 flex flex-col space-y-6 select-none relative" id="om-dashboard-root">
      
      {/* Toast Alert */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-20 right-6 bg-[#042C51] border-l-4 border-[#FF5C28] text-white px-5 py-3 rounded-r-xl shadow-2xl z-50 flex items-center gap-3 text-xs"
          >
            <CheckCircle className="w-4.5 h-4.5 text-[#FF5C28]" />
            <span className="font-bold">{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ==================== 1. HEADER & WELCOME AREA ==================== */}
      <section className="bg-white rounded-2xl border border-[#E6ECF2] shadow-sm overflow-hidden flex flex-col">
        {/* Top Accent Gradient Bar: Deep Navy to Vivid Orange */}
        <div className="h-[3.5px] w-full bg-gradient-to-r from-[#042C51] via-[#c24b30] to-[#FF5C28]" />

        <div className="p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#EBF2FA] border border-[#D5E3F5] text-[#042C51] text-[10.5px] font-bold tracking-wide uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-[#FF5C28]" />
              OPERATIONS MANAGER VIEW
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-[#042C51] tracking-tight">Operations Dashboard</h1>
            <p className="text-xs text-[#667085] leading-normal">
              Hiring overview filtered by your department: <span className="font-bold text-[#042C51]">{targetDepartment}</span>.
            </p>
          </div>

          <button
            onClick={() => onSwitchModule?.("Workforce Hiring")}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-[#FF5C28] hover:bg-[#e04f20] text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            <span>Return to Hiring Plan</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </section>

      {/* ==================== 2. DASHBOARD SUMMARY (METRICS CARDS) ==================== */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3.5">
        
        {/* Total Open Roles */}
        <div className="bg-white p-3.5 rounded-xl border border-[#E6ECF2] shadow-sm flex flex-col justify-between relative overflow-hidden h-[115px] transition-all hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Total Open Roles</span>
            <div className="w-7 h-7 bg-slate-50 rounded-full flex items-center justify-center text-[#042C51]">
              <Briefcase className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-1.5">
            <div className="text-xl font-extrabold text-[#042C51] tracking-tight">{summaryMetrics.totalOpen}</div>
            <div className="text-[9px] text-slate-400 font-bold mt-1 uppercase tracking-wide">Need instant staffing</div>
          </div>
        </div>

        {/* Req vs Filled */}
        <div className="bg-white p-3.5 rounded-xl border border-[#E6ECF2] shadow-sm flex flex-col justify-between relative overflow-hidden h-[115px] transition-all hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Req vs Filled</span>
            <div className="w-7 h-7 bg-slate-50 rounded-full flex items-center justify-center text-[#042C51]">
              <Target className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-1.5">
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-extrabold text-[#042C51] tracking-tight">{summaryMetrics.totalFilled}</span>
              <span className="text-xs font-semibold text-slate-400">/</span>
              <span className="text-sm font-bold text-slate-500">{summaryMetrics.totalReq}</span>
            </div>
            <div className="text-[9px] text-emerald-600 font-extrabold mt-1 uppercase tracking-wide">
              {Math.round((summaryMetrics.totalFilled / summaryMetrics.totalReq) * 100)}% Filled
            </div>
          </div>
        </div>

        {/* At-Risk Roles */}
        <div className="bg-white p-3.5 rounded-xl border border-amber-100 bg-amber-50/10 shadow-sm flex flex-col justify-between relative overflow-hidden h-[115px] transition-all hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase text-amber-800 tracking-wider">At-Risk Roles</span>
            <div className="w-7 h-7 bg-amber-50 rounded-full flex items-center justify-center text-amber-600">
              <AlertCircle className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-1.5">
            <div className="text-xl font-extrabold text-amber-600 tracking-tight">{summaryMetrics.atRisk}</div>
            <div className="text-[9px] text-amber-600/80 font-bold mt-1 uppercase tracking-wide">Require intervention</div>
          </div>
        </div>

        {/* Delayed Roles */}
        <div className="bg-white p-3.5 rounded-xl border border-rose-100 bg-rose-50/10 shadow-sm flex flex-col justify-between relative overflow-hidden h-[115px] transition-all hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase text-rose-800 tracking-wider">Delayed Roles</span>
            <div className="w-7 h-7 bg-rose-50 rounded-full flex items-center justify-center text-rose-600">
              <Clock className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-1.5">
            <div className="text-xl font-extrabold text-rose-600 tracking-tight">{summaryMetrics.delayed}</div>
            <div className="text-[9px] text-rose-600/80 font-bold mt-1 uppercase tracking-wide">Due dates missed</div>
          </div>
        </div>

        {/* Weekly Movement */}
        <div className="bg-white p-3.5 rounded-xl border border-indigo-100 bg-indigo-50/10 shadow-sm flex flex-col justify-between relative overflow-hidden h-[115px] transition-all hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase text-indigo-800 tracking-wider">Weekly Movement</span>
            <div className="w-7 h-7 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600">
              <TrendingUp className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-1.5">
            <div className="text-xl font-extrabold text-indigo-600 tracking-tight">+{summaryMetrics.funnel.hired}</div>
            <div className="text-[9px] text-indigo-600/80 font-bold mt-1 uppercase tracking-wide">Hired this cycle</div>
          </div>
        </div>

        {/* Drop-offs */}
        <div className="bg-white p-3.5 rounded-xl border border-orange-100 bg-orange-50/10 shadow-sm flex flex-col justify-between relative overflow-hidden h-[115px] transition-all hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase text-[#FF5C28] tracking-wider">Drop-Offs</span>
            <div className="w-7 h-7 bg-orange-50 rounded-full flex items-center justify-center text-[#FF5C28]">
              <TrendingDown className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-1.5">
            <div className="text-xl font-extrabold text-[#FF5C28] tracking-tight">{summaryMetrics.dropOffs}</div>
            <div className="text-[9px] text-[#FF5C28]/80 font-bold mt-1 uppercase tracking-wide">Candidate attrition</div>
          </div>
        </div>

        {/* Aging Roles */}
        <div className="bg-white p-3.5 rounded-xl border border-slate-100 bg-slate-50/10 shadow-sm flex flex-col justify-between relative overflow-hidden h-[115px] transition-all hover:shadow-md col-span-2 md:col-span-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase text-slate-700 tracking-wider">Avg. Aging Roles</span>
            <div className="w-7 h-7 bg-slate-100 rounded-full flex items-center justify-center text-slate-700">
              <Clock className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-1.5">
            <div className="text-xl font-extrabold text-slate-700 tracking-tight">{summaryMetrics.avgAging}d</div>
            <div className="text-[9px] text-slate-500 font-bold mt-1 uppercase tracking-wide">SLA target: 30d</div>
          </div>
        </div>

      </div>

      {/* ==================== 3. MAIN DASHBOARD PANELS ==================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Requirement vs Filled Progress Panel */}
        <div className="lg:col-span-6 bg-white p-5 rounded-2xl border border-[#E6ECF2] shadow-sm space-y-4">
          <div>
            <h3 className="text-sm font-black text-[#042C51]">Approved Requirement vs Filled Progress</h3>
            <p className="text-[10px] text-[#667085]">Current filled positions compared to total approved requirements</p>
          </div>

          <div className="space-y-4 pt-2">
            {rolesData.map(role => {
              const pct = Math.round((role.filled / role.req) * 100);
              return (
                <div key={role.id} className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="font-extrabold text-[#042C51]">{role.role} <span className="text-[10px] font-normal text-slate-500">({role.account})</span></span>
                    <span className="font-black text-[#FF5C28]">{role.filled} / {role.req} <span className="text-[10px] font-bold text-slate-400">({pct}%)</span></span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden relative">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${
                        role.status === "Delayed" ? "bg-rose-500" :
                        role.status === "At Risk" ? "bg-amber-400" :
                        "bg-[#FF5C28]"
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Weekly Movement Funnel Panel */}
        <div className="lg:col-span-6 bg-white p-5 rounded-2xl border border-[#E6ECF2] shadow-sm space-y-4">
          <div>
            <h3 className="text-sm font-black text-[#042C51]">Weekly Movement Pipeline</h3>
            <p className="text-[10px] text-[#667085]">Candidates progression from sourcing through hire</p>
          </div>

          {/* Funnel chart representation */}
          <div className="grid grid-cols-6 gap-2 text-center pt-2">
            {[
              { label: "Sourced", count: summaryMetrics.funnel.sourced, color: "bg-blue-50 border-blue-200 text-blue-700" },
              { label: "Screened", count: summaryMetrics.funnel.screened, color: "bg-cyan-50 border-cyan-200 text-cyan-700" },
              { label: "Interviewed", count: summaryMetrics.funnel.interviewed, color: "bg-amber-50 border-amber-200 text-amber-700" },
              { label: "Offered", count: summaryMetrics.funnel.offered, color: "bg-orange-50 border-orange-200 text-orange-700" },
              { label: "Accepted", count: summaryMetrics.funnel.accepted, color: "bg-indigo-50 border-indigo-200 text-indigo-700" },
              { label: "Hired", count: summaryMetrics.funnel.hired, color: "bg-emerald-50 border-emerald-200 text-emerald-700" }
            ].map((stage, idx) => (
              <div key={idx} className={`p-2.5 rounded-xl border ${stage.color} flex flex-col justify-between`}>
                <span className="text-[9px] font-black uppercase tracking-wider block leading-tight">{stage.label}</span>
                <span className="text-base font-black tracking-tight block mt-1.5">{stage.count}</span>
              </div>
            ))}
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60 flex items-start gap-2.5">
            <Info className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
            <p className="text-[10px] text-slate-600 leading-normal">
              Conversion rate from Sourced ➔ Hired is <span className="font-extrabold text-[#042C51]">{((summaryMetrics.funnel.hired / summaryMetrics.funnel.sourced) * 100).toFixed(1)}%</span>. Highest pipeline falloff occurs at the Product Specific Training assessment block.
            </p>
          </div>
        </div>

      </div>

      {/* ==================== 4. ROLE HIRING STATUS & 5. RECRUITER LOAD SIDE-BY-SIDE ==================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Data Table Panel */}
        <div className="lg:col-span-8 bg-white p-5 rounded-2xl border border-[#E6ECF2] shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
            <div>
              <h3 className="text-sm font-black text-[#042C51]">Role Hiring Status</h3>
              <p className="text-[10px] text-[#667085]">Detailed recruitment telemetry per requisition</p>
            </div>
            
            {/* Notice label */}
            <span className="text-[10px] bg-amber-50 text-amber-800 px-2.5 py-1 rounded font-black border border-amber-200 uppercase tracking-wider inline-block">
              Viewing only: {targetDepartment}
            </span>
          </div>

          {/* Search bar */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by role, account, or owner name..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none focus:bg-white"
            />
          </div>

          {/* Table */}
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold">
                  <th className="p-3">Role / Account</th>
                  <th className="p-3 text-center">Req.</th>
                  <th className="p-3 text-center">Filled</th>
                  <th className="p-3 text-center">Open</th>
                  <th className="p-3">Due Date</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">TA Owner</th>
                  <th className="p-3 text-center">Aging</th>
                  <th className="p-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredRoles.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="p-6 text-center text-slate-400 font-bold">
                      No roles match this search query.
                    </td>
                  </tr>
                ) : (
                  filteredRoles.map(role => (
                    <tr key={role.id} className="hover:bg-slate-50/50">
                      <td className="p-3">
                        <span className="font-extrabold text-[#042C51] block">{role.role}</span>
                        <span className="text-[10px] text-slate-500">{role.account}</span>
                      </td>
                      <td className="p-3 text-center font-bold text-slate-600">{role.req}</td>
                      <td className="p-3 text-center font-bold text-emerald-600">{role.filled}</td>
                      <td className="p-3 text-center font-bold text-[#FF5C28]">{role.open}</td>
                      <td className="p-3 text-slate-500 font-medium">{role.dueDate}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${
                          role.status === "On Track" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" :
                          role.status === "At Risk" ? "bg-amber-50 text-amber-700 border border-amber-200" :
                          "bg-rose-50 text-rose-700 border border-rose-200"
                        }`}>
                          {role.status}
                        </span>
                      </td>
                      <td className="p-3 text-slate-600 font-medium">{role.taOwner}</td>
                      <td className="p-3 text-center font-mono font-bold text-slate-500">{role.aging}d</td>
                      <td className="p-3 text-center">
                        <button
                          onClick={() => setSelectedRole(role)}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-[#FFE0D5] hover:text-[#FF5C28] text-[#042C51] rounded text-[10px] font-extrabold border border-slate-200 hover:border-[#FF5C28]/40 transition-colors cursor-pointer"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recruiter Load Panel */}
        <div className="lg:col-span-4 bg-white p-5 rounded-2xl border border-[#E6ECF2] shadow-sm space-y-4">
          <div>
            <h3 className="text-sm font-black text-[#042C51]">Recruiter Load</h3>
            <p className="text-[10px] text-[#667085]">Active roles handled vs output parameters</p>
          </div>

          <div className="space-y-3">
            {recruiters.map((rec, idx) => (
              <div key={idx} className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl space-y-2">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-xs font-extrabold text-[#042C51] block leading-tight">{rec.name}</span>
                    <span className="text-[10px] text-slate-500 mt-0.5 block">{rec.activeRoles} active roles handled</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${
                    rec.loadStatus === "High" ? "bg-rose-50 text-rose-700 border border-rose-200" :
                    rec.loadStatus === "Medium" ? "bg-amber-50 text-amber-700 border border-amber-200" :
                    "bg-emerald-50 text-emerald-700 border border-emerald-200"
                  }`}>
                    {rec.loadStatus} Load
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-1 pt-1 text-center border-t border-slate-200/50">
                  <div>
                    <span className="text-[8px] uppercase font-bold text-slate-400 block">Sourced</span>
                    <span className="text-[11px] font-black text-[#042C51]">{rec.output.sourced}</span>
                  </div>
                  <div>
                    <span className="text-[8px] uppercase font-bold text-slate-400 block">Interviewed</span>
                    <span className="text-[11px] font-black text-[#042C51]">{rec.output.interviewed}</span>
                  </div>
                  <div>
                    <span className="text-[8px] uppercase font-bold text-slate-400 block">Hired</span>
                    <span className="text-[11px] font-black text-emerald-600 font-extrabold">{rec.output.hired}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* ==================== 7. DASHBOARD RULE NOTE ==================== */}
      <footer className="p-4 bg-slate-100/80 rounded-xl border border-slate-200 text-center">
        <p className="text-[10px] text-slate-500 font-black tracking-wide uppercase">
          ⚠️ Operations Manager Dashboard Rule: Restricted to own department ({targetDepartment}) in compliance with SiBS organizational partitions.
        </p>
      </footer>

      {/* ==================== 6. ROLE DETAILS MODAL ==================== */}
      <AnimatePresence>
        {selectedRole && (
          <div className="fixed inset-0 bg-[#042C51]/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden"
            >
              <div className="p-4 bg-[#042C51] text-white flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="p-1 bg-[#FF5C28] rounded">
                    <Target className="w-4 h-4 text-white" />
                  </span>
                  <div>
                    <h2 className="text-sm font-black">Role KPI Details</h2>
                    <p className="text-[10px] text-slate-300">Recruitment dashboard analytics</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedRole(null)}
                  className="p-1 rounded-lg bg-white/10 hover:bg-white/25 text-white cursor-pointer"
                >
                  <X className="w-4.5 h-4.5" />
                </button>
              </div>

              <div className="p-6 space-y-6 text-[#101828]">
                {/* Header row */}
                <div className="flex justify-between items-center bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <div>
                    <h3 className="text-base font-black text-[#042C51]">{selectedRole.role}</h3>
                    <p className="text-xs text-slate-500">{selectedRole.account} ➔ {selectedRole.department}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] uppercase font-black text-slate-400 block">Progress</span>
                    <span className="text-lg font-black text-[#FF5C28]">
                      {Math.round((selectedRole.filled / selectedRole.req) * 100)}%
                    </span>
                  </div>
                </div>

                {/* Pipeline breakdown */}
                <div className="space-y-2.5">
                  <h4 className="text-xs font-bold text-[#042C51]">Weekly Movement Breakdown</h4>
                  <div className="grid grid-cols-6 gap-2 text-center">
                    {[
                      { l: "Sourced", c: selectedRole.movement.sourced },
                      { l: "Screened", c: selectedRole.movement.screened },
                      { l: "Interv.", c: selectedRole.movement.interviewed },
                      { l: "Offered", c: selectedRole.movement.offered },
                      { l: "Accept.", c: selectedRole.movement.accepted },
                      { l: "Hired", c: selectedRole.movement.hired }
                    ].map((step, i) => (
                      <div key={i} className="p-2 bg-slate-50 border border-slate-100 rounded-lg">
                        <span className="text-[8px] font-bold text-slate-400 block uppercase leading-none">{step.l}</span>
                        <span className="text-sm font-extrabold text-[#042C51] block mt-1">{step.c}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action items & Risk interpretation */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-3 bg-blue-50/50 border border-blue-200/50 rounded-xl space-y-1">
                    <span className="text-[9px] uppercase font-bold text-blue-600 block">Current Action Item</span>
                    <p className="text-xs text-blue-950 font-medium leading-relaxed">{selectedRole.actionItem}</p>
                  </div>

                  <div className="p-3 bg-amber-50/50 border border-amber-200/50 rounded-xl space-y-1">
                    <span className="text-[9px] uppercase font-bold text-amber-700 block">Risk Interpretation Note</span>
                    <p className="text-[11px] text-amber-950 leading-relaxed">
                      Role displays higher candidate volatility during tech validation stages. Sourcing buffer must be expanded by <span className="font-bold">2.5x</span> to achieve scheduled training targets.
                    </p>
                  </div>
                </div>

                {/* Role metrics snapshot */}
                <div className="border border-slate-200 rounded-xl p-3 bg-slate-50/50">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-2">Role Snapshot KPI Matrix</span>
                  <div className="grid grid-cols-4 gap-3 text-center text-xs">
                    <div>
                      <span className="text-[9px] text-slate-400 block">Requisition</span>
                      <span className="text-sm font-black text-[#042C51]">{selectedRole.req}</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-400 block">Filled</span>
                      <span className="text-sm font-black text-emerald-600">{selectedRole.filled}</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-400 block">Pending</span>
                      <span className="text-sm font-black text-[#FF5C28]">{selectedRole.open}</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-400 block">Drop-offs</span>
                      <span className="text-sm font-black text-rose-500">{selectedRole.dropOffs}</span>
                    </div>
                  </div>
                </div>

              </div>

              <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-2">
                <button
                  onClick={() => {
                    triggerToast(`Copied dashboard parameters link for ${selectedRole.role}.`);
                  }}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition-colors cursor-pointer"
                >
                  Share Link
                </button>
                <button
                  onClick={() => setSelectedRole(null)}
                  className="px-3 py-1.5 bg-[#042C51] hover:bg-[#FF5C28] text-white text-xs font-bold rounded-lg transition-all cursor-pointer"
                >
                  Close Details
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
