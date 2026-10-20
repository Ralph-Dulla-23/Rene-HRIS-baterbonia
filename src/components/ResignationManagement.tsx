import React, { useState, useMemo } from "react";
import CentralizedFilters from "./CentralizedFilters";
import {
  Users,
  User,
  UserX,
  Calendar,
  Briefcase,
  Clock,
  ArrowRight,
  Search,
  SlidersHorizontal,
  X,
  ChevronRight,
  Info,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Plus,
  RefreshCw,
  FileText,
  Check,
  Trash2,
  Paperclip,
  ShieldAlert,
  CheckSquare,
  Sparkles,
  Layers,
  HelpCircle
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface ResignationManagementProps {
  userEmail?: string;
  onSwitchModule?: (module: string) => void;
}

interface ApprovalStage {
  stageName: "Team Leader" | "Operations Manager" | "Senior Ops Manager" | "HR Partner";
  approver: string;
  status: "Pending" | "Approved" | "Declined" | "Cancelled";
  updatedAt?: string;
}

interface ResignationItem {
  id: string;
  sibsId: string;
  employeeName: string;
  department: string;
  account: string;
  filedBy: { name: string; role: string };
  type: "Formal" | "Immediate";
  resignationDate: string;
  lastWorkingDate: string;
  status: "For Approval" | "Notice Period" | "Completed" | "Declined";
  reason: string;
  details: string;
  attachments: string[];
  approvalStages: ApprovalStage[];
  currentStep: number; // 1 to 5
}

export default function ResignationManagement({ userEmail, onSwitchModule }: ResignationManagementProps) {
  // --- STATE ---
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");
  const [selectedResignation, setSelectedResignation] = useState<ResignationItem | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Simulation role selection to let user experience TL, OM, HR views
  const [userRoleContext, setUserRoleContext] = useState<"HR Admin" | "Operations Manager" | "Team Leader">("HR Admin");

  // Initial list of resignations
  const [resignations, setResignations] = useState<ResignationItem[]>([
    {
      id: "RES-2026-001",
      sibsId: "SIBS-8429",
      employeeName: "Alvin De Leon",
      department: "Telecom & Tech Support",
      account: "Verizon Tech",
      filedBy: { name: "Renz Torres", role: "Team Leader" },
      type: "Formal",
      resignationDate: "2026-07-05",
      lastWorkingDate: "2026-08-04",
      status: "Notice Period",
      reason: "Career Growth / Better Compensation",
      details: "Offered a higher base package in an international IT company.",
      attachments: ["resignation_letter_alvin.pdf", "job_offer_redacted.jpg"],
      currentStep: 4,
      approvalStages: [
        { stageName: "Team Leader", approver: "Renz Torres", status: "Approved", updatedAt: "2026-07-05" },
        { stageName: "Operations Manager", approver: "Shiela Delos Reyes", status: "Approved", updatedAt: "2026-07-06" },
        { stageName: "Senior Ops Manager", approver: "Aileen Go", status: "Approved", updatedAt: "2026-07-07" },
        { stageName: "HR Partner", approver: "Alena Batacan", status: "Pending" }
      ]
    },
    {
      id: "RES-2026-002",
      sibsId: "SIBS-3910",
      employeeName: "Samantha Cruz",
      department: "Healthcare & Insurance",
      account: "UnitedHealth VIP",
      filedBy: { name: "Renz Torres", role: "Team Leader" },
      type: "Immediate",
      resignationDate: "2026-07-18",
      lastWorkingDate: "2026-07-20",
      status: "For Approval",
      reason: "Medical / Health Concerns",
      details: "Persistent back issues requiring immediate medical Rest & Recreation (R&R) or therapy.",
      attachments: ["medical_certificate_samantha.pdf"],
      currentStep: 3,
      approvalStages: [
        { stageName: "Team Leader", approver: "Renz Torres", status: "Approved", updatedAt: "2026-07-18" },
        { stageName: "Operations Manager", approver: "Shiela Delos Reyes", status: "Pending" },
        { stageName: "Senior Ops Manager", approver: "Aileen Go", status: "Pending" },
        { stageName: "HR Partner", approver: "Alena Batacan", status: "Pending" }
      ]
    },
    {
      id: "RES-2026-003",
      sibsId: "SIBS-1205",
      employeeName: "Marcus Aurelio",
      department: "Financial Services Group",
      account: "Chase Credit",
      filedBy: { name: "Mark Sarmiento", role: "Team Leader" },
      type: "Formal",
      resignationDate: "2026-06-15",
      lastWorkingDate: "2026-07-15",
      status: "Completed",
      reason: "Relocation to Visayas Region",
      details: "Family relocating to Iloilo City permanently by late July.",
      attachments: ["resignation_june_marcus.pdf", "flight_booking_proof.pdf"],
      currentStep: 5,
      approvalStages: [
        { stageName: "Team Leader", approver: "Mark Sarmiento", status: "Approved", updatedAt: "2026-06-15" },
        { stageName: "Operations Manager", approver: "Mark Sarmiento", status: "Approved", updatedAt: "2026-06-16" },
        { stageName: "Senior Ops Manager", approver: "Aileen Go", status: "Approved", updatedAt: "2026-06-18" },
        { stageName: "HR Partner", approver: "Alena Batacan", status: "Approved", updatedAt: "2026-07-15" }
      ]
    },
    {
      id: "RES-2026-004",
      sibsId: "SIBS-7741",
      employeeName: "Diana Ross",
      department: "Telecom & Tech Support",
      account: "Comcast Technical",
      filedBy: { name: "Renz Torres", role: "Team Leader" },
      type: "Formal",
      resignationDate: "2026-07-12",
      lastWorkingDate: "2026-08-11",
      status: "Declined",
      reason: "Retention counter-offer accepted",
      details: "Employee agreed to transfer to T-Mobile Care account with adjusted compensation packages.",
      attachments: [],
      currentStep: 2,
      approvalStages: [
        { stageName: "Team Leader", approver: "Renz Torres", status: "Declined", updatedAt: "2026-07-13" },
        { stageName: "Operations Manager", approver: "Shiela Delos Reyes", status: "Cancelled" },
        { stageName: "Senior Ops Manager", approver: "Aileen Go", status: "Cancelled" },
        { stageName: "HR Partner", approver: "Alena Batacan", status: "Cancelled" }
      ]
    },
    {
      id: "RES-2026-005",
      sibsId: "SIBS-5520",
      employeeName: "Jefferson Pierce",
      department: "Retail & E-Commerce",
      account: "Amazon Care",
      filedBy: { name: "Alena Batacan", role: "HR Partner" },
      type: "Immediate",
      resignationDate: "2026-07-19",
      lastWorkingDate: "2026-07-19",
      status: "For Approval",
      reason: "Family Emergency / personal matters",
      details: "Urgent need to return to province to care for sick parents.",
      attachments: ["immediate_res_letter.docx"],
      currentStep: 3,
      approvalStages: [
        { stageName: "Team Leader", approver: "System Generated", status: "Approved", updatedAt: "2026-07-19" },
        { stageName: "Operations Manager", approver: "Shiela Delos Reyes", status: "Approved", updatedAt: "2026-07-19" },
        { stageName: "Senior Ops Manager", approver: "Aileen Go", status: "Pending" },
        { stageName: "HR Partner", approver: "Alena Batacan", status: "Pending" }
      ]
    },
    {
      id: "RES-2026-006",
      sibsId: "SIBS-3345",
      employeeName: "Leah Salonga",
      department: "Telecom & Tech Support",
      account: "Verizon Tech",
      filedBy: { name: "Shiela Delos Reyes", role: "Operations Manager" },
      type: "Formal",
      resignationDate: "2026-07-01",
      lastWorkingDate: "2026-07-31",
      status: "Notice Period",
      reason: "Returning to school / studies",
      details: "Accepted into master's program at UP Diliman.",
      attachments: ["univerity_acceptance.pdf"],
      currentStep: 4,
      approvalStages: [
        { stageName: "Team Leader", approver: "Renz Torres", status: "Approved", updatedAt: "2026-07-01" },
        { stageName: "Operations Manager", approver: "Shiela Delos Reyes", status: "Approved", updatedAt: "2026-07-02" },
        { stageName: "Senior Ops Manager", approver: "Aileen Go", status: "Approved", updatedAt: "2026-07-03" },
        { stageName: "HR Partner", approver: "Alena Batacan", status: "Pending" }
      ]
    }
  ]);

  // --- FORM STATE ---
  const [newSibsId, setNewSibsId] = useState("");
  const [newEmployeeName, setNewEmployeeName] = useState("");
  const [newDepartment, setNewDepartment] = useState("Telecom & Tech Support");
  const [newAccount, setNewAccount] = useState("Verizon Tech");
  const [newType, setNewType] = useState<"Formal" | "Immediate">("Formal");
  const [newResignationDate, setNewResignationDate] = useState("2026-07-20");
  const [newLastWorkingDate, setNewLastWorkingDate] = useState("2026-08-19");
  const [newReason, setNewReason] = useState("Better Compensation");
  const [newDetails, setNewDetails] = useState("");
  const [newAttachment, setNewAttachment] = useState<string>("");
  const [addedAttachments, setAddedAttachments] = useState<string[]>([]);

  // Calculate summary metrics
  const summaryMetrics = useMemo(() => {
    const total = resignations.length;
    const forApproval = resignations.filter(r => r.status === "For Approval").length;
    const noticePeriod = resignations.filter(r => r.status === "Notice Period").length;
    const completed = resignations.filter(r => r.status === "Completed").length;
    const declined = resignations.filter(r => r.status === "Declined").length;

    return { total, forApproval, noticePeriod, completed, declined };
  }, [resignations]);

  // Handle Search & Filter
  const filteredResignations = useMemo(() => {
    return resignations.filter(res => {
      const q = searchTerm.toLowerCase();
      const matchesSearch =
        res.employeeName.toLowerCase().includes(q) ||
        res.sibsId.toLowerCase().includes(q) ||
        res.department.toLowerCase().includes(q) ||
        res.reason.toLowerCase().includes(q) ||
        res.id.toLowerCase().includes(q);

      const matchesStatus = statusFilter === "All" || res.status === statusFilter;
      const matchesType = typeFilter === "All" || res.type === typeFilter;

      // Access filter: TL should only view those they filed or inside Telecom department
      if (userRoleContext === "Team Leader") {
        return matchesSearch && matchesStatus && matchesType && res.filedBy.name === "Renz Torres";
      }
      if (userRoleContext === "Operations Manager") {
        return matchesSearch && matchesStatus && matchesType && res.department === "Telecom & Tech Support";
      }

      return matchesSearch && matchesStatus && matchesType;
    });
  }, [resignations, searchTerm, statusFilter, typeFilter, userRoleContext]);

  // Toast trigger
  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Add Resignation
  const handleAddResignation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSibsId || !newEmployeeName) {
      triggerToast("Please provide SIBS ID and Employee Name.");
      return;
    }

    const newId = `RES-2026-0${resignations.length + 1}`;
    const filedByName = userRoleContext === "HR Admin" ? "Alena Batacan" : userRoleContext === "Operations Manager" ? "Shiela Delos Reyes" : "Renz Torres";
    const filedByRole = userRoleContext;

    const newItem: ResignationItem = {
      id: newId,
      sibsId: newSibsId.startsWith("SIBS-") ? newSibsId : `SIBS-${newSibsId}`,
      employeeName: newEmployeeName,
      department: newDepartment,
      account: newAccount,
      filedBy: { name: filedByName, role: filedByRole },
      type: newType,
      resignationDate: newResignationDate,
      lastWorkingDate: newLastWorkingDate,
      status: "For Approval",
      reason: newReason,
      details: newDetails,
      attachments: addedAttachments.length > 0 ? addedAttachments : ["res_letter_initial.pdf"],
      currentStep: 2, // Filed step
      approvalStages: [
        { stageName: "Team Leader", approver: userRoleContext === "Team Leader" ? filedByName : "System Approved", status: "Approved", updatedAt: "2026-07-20" },
        { stageName: "Operations Manager", approver: "Pending OMS", status: "Pending" },
        { stageName: "Senior Ops Manager", approver: "Pending SOM", status: "Pending" },
        { stageName: "HR Partner", approver: "Pending HR", status: "Pending" }
      ]
    };

    setResignations([newItem, ...resignations]);
    setIsAddModalOpen(false);
    triggerToast(`Successfully filed resignation request for ${newEmployeeName}!`);
    
    // Clear Form
    setNewSibsId("");
    setNewEmployeeName("");
    setNewDetails("");
    setNewAttachment("");
    setAddedAttachments([]);
  };

  // Handle Action approvals inside Details modal
  const handleApprove = (stageToApprove: string) => {
    if (!selectedResignation) return;

    const updated = resignations.map(res => {
      if (res.id === selectedResignation.id) {
        const nextStages = res.approvalStages.map(stage => {
          if (stage.stageName === stageToApprove) {
            return { ...stage, status: "Approved" as const, approver: "Alena Batacan", updatedAt: "2026-07-20" };
          }
          return stage;
        });

        // Determine next state
        const allApprovedExceptHR = nextStages.slice(0, 3).every(s => s.status === "Approved");
        const hrApproved = nextStages[3].status === "Approved";
        
        let nextStatus = res.status;
        let step = res.currentStep;

        if (hrApproved) {
          nextStatus = "Completed" as const;
          step = 5;
        } else if (allApprovedExceptHR) {
          nextStatus = "Notice Period" as const;
          step = 4;
        } else {
          step = 3; // In Approval routing
        }

        return {
          ...res,
          approvalStages: nextStages,
          status: nextStatus,
          currentStep: step
        };
      }
      return res;
    });

    setResignations(updated);
    const targetItem = updated.find(r => r.id === selectedResignation.id);
    if (targetItem) {
      setSelectedResignation(targetItem);
    }
    triggerToast(`Approved stage "${stageToApprove}" successfully.`);
  };

  const handleDecline = () => {
    if (!selectedResignation) return;

    const updated = resignations.map(res => {
      if (res.id === selectedResignation.id) {
        const nextStages = res.approvalStages.map(stage => {
          if (stage.status === "Pending") {
            return { ...stage, status: "Declined" as const, approver: "Alena Batacan", updatedAt: "2026-07-20" };
          }
          return stage;
        });

        return {
          ...res,
          approvalStages: nextStages,
          status: "Declined" as const,
          currentStep: 2
        };
      }
      return res;
    });

    setResignations(updated);
    const targetItem = updated.find(r => r.id === selectedResignation.id);
    if (targetItem) {
      setSelectedResignation(targetItem);
    }
    triggerToast("Resignation request declined/rejected.");
  };

  const handleAddAttachment = () => {
    if (!newAttachment) return;
    setAddedAttachments([...addedAttachments, newAttachment]);
    setNewAttachment("");
  };

  const handleRemoveAttachment = (idx: number) => {
    setAddedAttachments(addedAttachments.filter((_, i) => i !== idx));
  };

  return (
    <div className="flex-1 flex flex-col space-y-6 select-none relative" id="resignation-root">
      
      {/* Toast alert system */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-20 right-6 bg-[#042C51] border-l-4 border-[#FF5C28] text-white px-5 py-3 rounded-r-xl shadow-2xl z-50 flex items-center gap-3 text-xs font-semibold"
          >
            <CheckCircle className="w-4.5 h-4.5 text-[#FF5C28]" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ==================== 1. HEADER & ACTIONS ==================== */}
      <section className="bg-white p-5 rounded-2xl border border-[#E6ECF2] shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] bg-[#FFF0EB] text-[#FF5C28] px-2.5 py-0.5 rounded font-black border border-[#FFE0D5] uppercase tracking-wider flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#FF5C28] inline-block animate-pulse"></span>
              Resignations Hub
            </span>

            {/* Simulated User Context Selector */}
            <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200">
              <span className="text-[9px] font-bold text-slate-500 px-1.5">View Context:</span>
              {(["HR Admin", "Operations Manager", "Team Leader"] as const).map((role) => (
                <button
                  key={role}
                  onClick={() => {
                    setUserRoleContext(role);
                    triggerToast(`Switched view context to ${role}`);
                  }}
                  className={`text-[9px] px-2 py-0.5 rounded font-black transition-all cursor-pointer ${
                    userRoleContext === role
                      ? "bg-white text-[#042C51] shadow-sm"
                      : "text-slate-500 hover:text-[#042C51]"
                  }`}
                >
                  {role.split(" ")[0]}
                </button>
              ))}
            </div>
          </div>
          <h1 className="text-xl font-black text-[#042C51] tracking-tight">Resignation Management</h1>
          <p className="text-xs text-[#667085] leading-normal">
            {userRoleContext === "HR Admin" && "System-wide resignation records, SLA notice cycles, and central HR sign-off clearance workflows."}
            {userRoleContext === "Operations Manager" && "Viewing resignations filtered for your department (Telecom & Tech Support). Approve/route to HR."}
            {userRoleContext === "Team Leader" && "Viewing resignation entries filed directly by you as Team Leader."}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              triggerToast("Resignation records synced and updated.");
            }}
            className="p-2 text-slate-600 hover:text-[#042C51] bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors cursor-pointer"
            title="Refresh list"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#042C51] hover:bg-[#FF5C28] text-white text-xs font-black rounded-lg transition-all cursor-pointer shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>File Resignation</span>
          </button>
        </div>
      </section>

      {/* ==================== 2. RESIGNATION SUMMARY (METRICS CARDS) ==================== */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        
        {/* Total Resignations */}
        <div className="bg-white p-4 rounded-xl border border-[#E6ECF2] shadow-sm">
          <span className="text-[9px] font-black text-[#042C51] uppercase tracking-wider block">Total Filed</span>
          <span className="text-xl font-extrabold text-[#042C51] tracking-tight block mt-1">{summaryMetrics.total}</span>
          <span className="text-[10px] text-slate-500 block mt-0.5">Global cumulative list</span>
        </div>

        {/* For Approval */}
        <div className="bg-white p-4 rounded-xl border border-[#E6ECF2] shadow-sm">
          <span className="text-[9px] font-black text-amber-600 uppercase tracking-wider block">For Approval</span>
          <span className="text-xl font-extrabold text-amber-600 tracking-tight block mt-1">{summaryMetrics.forApproval}</span>
          <span className="text-[10px] text-slate-500 block mt-0.5">Awaiting active sign-off</span>
        </div>

        {/* Notice Period */}
        <div className="bg-white p-4 rounded-xl border border-[#E6ECF2] shadow-sm">
          <span className="text-[9px] font-black text-indigo-600 uppercase tracking-wider block">Notice Period</span>
          <span className="text-xl font-extrabold text-indigo-600 tracking-tight block mt-1">{summaryMetrics.noticePeriod}</span>
          <span className="text-[10px] text-slate-500 block mt-0.5">Active handovers serving</span>
        </div>

        {/* Completed */}
        <div className="bg-white p-4 rounded-xl border border-[#E6ECF2] shadow-sm">
          <span className="text-[9px] font-black text-emerald-600 uppercase tracking-wider block">Completed Clearance</span>
          <span className="text-xl font-extrabold text-emerald-600 tracking-tight block mt-1">{summaryMetrics.completed}</span>
          <span className="text-[10px] text-slate-500 block mt-0.5">Cleared and offboarded</span>
        </div>

        {/* Declined */}
        <div className="bg-white p-4 rounded-xl border border-[#E6ECF2] shadow-sm col-span-2 md:col-span-1">
          <span className="text-[9px] font-black text-rose-600 uppercase tracking-wider block">Declined / Retained</span>
          <span className="text-xl font-extrabold text-rose-600 tracking-tight block mt-1">{summaryMetrics.declined}</span>
          <span className="text-[10px] text-slate-500 block mt-0.5">Counter-offer/Withdrawn</span>
        </div>

      </div>

      {/* ==================== 3. FILTERING & SEARCH ==================== */}
      <CentralizedFilters
        title="Search & Filter Resignations"
        resetLabel="Clear Filters"
        onReset={() => {
          setSearchTerm("");
          setStatusFilter("All");
          setTypeFilter("All");
        }}
        search={{
          label: "Search Term",
          placeholder: "Search by Employee, SIBS ID, Department, Status, Reason...",
          value: searchTerm,
          onChange: setSearchTerm,
        }}
        selects={[
          {
            label: "Status",
            value: statusFilter,
            onChange: setStatusFilter,
            options: [
              { label: "All Statuses", value: "All" },
              { label: "For Approval", value: "For Approval" },
              { label: "Notice Period", value: "Notice Period" },
              { label: "Completed", value: "Completed" },
              { label: "Declined / Retained", value: "Declined" },
            ],
          },
          {
            label: "Type",
            value: typeFilter,
            onChange: setTypeFilter,
            options: [
              { label: "All Types", value: "All" },
              { label: "Formal (Standard 30d)", value: "Formal" },
              { label: "Immediate", value: "Immediate" },
            ],
          },
        ]}
      />

      {/* ==================== 4. PROCESS FLOW & ANALYTICS ==================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Process Flow Panel */}
        <div className="lg:col-span-7 bg-white p-5 rounded-2xl border border-[#E6ECF2] shadow-sm space-y-4">
          <div>
            <h3 className="text-sm font-black text-[#042C51]">Standard Resignation Process Pipeline</h3>
            <p className="text-[10px] text-[#667085]">Sequential milestones for a formal or immediate SIBS offboarding</p>
          </div>

          <div className="relative pt-4 pb-2">
            {/* Horizontal Line connecting steps */}
            <div className="absolute top-[37px] left-8 right-8 h-1 bg-slate-100 -z-0"></div>

            <div className="grid grid-cols-5 gap-2 relative z-10 text-center">
              {[
                { step: 1, label: "Email Received", desc: "Written letter submitted" },
                { step: 2, label: "Filed by TL/OM", desc: "Logged in system" },
                { step: 3, label: "For Approval", desc: "Approval routing" },
                { step: 4, label: "Notice Period", desc: "Standard 30-day run" },
                { step: 5, label: "Completed", desc: "Clearance cleared" }
              ].map((node) => {
                const isCurrent = selectedResignation ? selectedResignation.currentStep === node.step : false;
                const isPassed = selectedResignation ? selectedResignation.currentStep > node.step : false;

                return (
                  <div key={node.step} className="space-y-2">
                    <div className="flex justify-center">
                      <div
                        className={`w-9 h-9 rounded-full flex items-center justify-center border-2 text-xs font-black transition-all ${
                          isCurrent
                            ? "bg-[#FF5C28] border-[#FF5C28] text-white shadow-md shadow-[#FF5C28]/20 scale-110"
                            : isPassed
                            ? "bg-[#042C51] border-[#042C51] text-white"
                            : "bg-white border-slate-200 text-slate-400"
                        }`}
                      >
                        {isPassed ? <Check className="w-4 h-4" /> : node.step}
                      </div>
                    </div>
                    <div>
                      <span className="text-[10px] font-black text-[#042C51] block leading-snug">{node.label}</span>
                      <span className="text-[8px] text-slate-400 block leading-tight">{node.desc}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="p-3 bg-[#F8FAFC] rounded-xl border border-slate-200/60 flex items-start gap-2.5">
            <Info className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
            <p className="text-[10px] text-slate-600 leading-normal">
              {selectedResignation ? (
                <>
                  Currently highlighting milestones for <span className="font-extrabold text-[#042C51]">{selectedResignation.employeeName}</span>. Notice period operates on Philippine SLA compliance targets.
                </>
              ) : (
                "Select any resignation record from the directory table below to display its precise real-time progress path in the tracker above."
              )}
            </p>
          </div>
        </div>

        {/* Trend and Approval Routing Panel */}
        <div className="lg:col-span-5 bg-white p-5 rounded-2xl border border-[#E6ECF2] shadow-sm space-y-4">
          <div>
            <h3 className="text-sm font-black text-[#042C51]">Resignation Attrition Trend</h3>
            <p className="text-[10px] text-[#667085]">Monthly counts of registered resignations</p>
          </div>

          {/* Simple Visual Mini Bar Chart */}
          <div className="h-28 flex items-end justify-between gap-2 pt-2 px-1">
            {[
              { month: "Jan", count: 12, height: "h-3/12 bg-slate-200" },
              { month: "Feb", count: 15, height: "h-4/12 bg-slate-200" },
              { month: "Mar", count: 28, height: "h-8/12 bg-slate-200" },
              { month: "Apr", count: 18, height: "h-5/12 bg-slate-200" },
              { month: "May", count: 8, height: "h-2/12 bg-slate-200" },
              { month: "Jun", count: 32, height: "h-9/12 bg-[#042C51]" },
              { month: "Jul", count: 41, height: "h-full bg-[#FF5C28]" }
            ].map((bar, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center gap-1 group relative">
                <span className="absolute -top-6 text-[10px] font-bold text-[#042C51] opacity-0 group-hover:opacity-100 transition-opacity bg-slate-50 px-1 rounded shadow-xs">
                  {bar.count}
                </span>
                <div className={`w-full rounded-t ${bar.height} transition-all duration-300 hover:opacity-85`} />
                <span className="text-[9px] font-black text-slate-500 uppercase tracking-tight mt-1">{bar.month}</span>
              </div>
            ))}
          </div>

          <div className="p-2 bg-amber-50/50 border border-amber-200/50 rounded-lg text-[9px] text-amber-800 font-black tracking-wide uppercase text-center">
            ⚠️ SYSTEM SLA NOTICE: APPROVED RESIGNATION CANNOT BE CANCELLED ONCE NOTICE PERIOD PROGRESS IS &gt; 50%
          </div>
        </div>

      </div>

      {/* ==================== 5. ALL RESIGNATIONS (DATA TABLE & LIST) ==================== */}
      <div className="bg-white p-5 rounded-2xl border border-[#E6ECF2] shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
          <div>
            <h3 className="text-sm font-black text-[#042C51]">Employee Resignation Registry</h3>
            <p className="text-[10px] text-[#667085]">Directory records matching active parameters and constraints</p>
          </div>
          
          <span className="text-[10px] bg-[#E9F0FC] text-[#042C51] px-2 py-0.5 rounded font-black border border-blue-100">
            Showing {filteredResignations.length} of {resignations.length} records
          </span>
        </div>

        {/* Data Table */}
        <div className="border border-slate-200 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold">
                  <th className="p-3">Employee / ID</th>
                  <th className="p-3">Department</th>
                  <th className="p-3">Filed By</th>
                  <th className="p-3">Type</th>
                  <th className="p-3 text-center">Resignation Date</th>
                  <th className="p-3 text-center">Last Working Day</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Reason</th>
                  <th className="p-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredResignations.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="p-12 text-center text-slate-400 font-bold">
                      No resignation records match the active criteria.
                    </td>
                  </tr>
                ) : (
                  filteredResignations.map((res) => {
                    const isSelected = selectedResignation?.id === res.id;
                    return (
                      <tr
                        key={res.id}
                        onClick={() => setSelectedResignation(res)}
                        className={`cursor-pointer transition-colors ${
                          isSelected ? "bg-[#FFF0EB]" : "hover:bg-slate-50"
                        }`}
                      >
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-slate-200 flex items-center justify-center text-[#042C51] font-black text-[10px] uppercase border border-white">
                              {res.employeeName.charAt(0)}
                            </div>
                            <div>
                              <span className="font-extrabold text-[#042C51] block">{res.employeeName}</span>
                              <span className="text-[10px] text-slate-500 font-mono font-medium">{res.sibsId}</span>
                            </div>
                          </div>
                        </td>
                        <td className="p-3">
                          <span className="font-extrabold text-[#042C51] block">{res.department}</span>
                          <span className="text-[10px] text-slate-500">{res.account}</span>
                        </td>
                        <td className="p-3">
                          <span className="text-[#042C51] font-bold block">{res.filedBy.name}</span>
                          <span className="text-[10px] text-slate-400">{res.filedBy.role}</span>
                        </td>
                        <td className="p-3">
                          <span
                            className={`px-1.5 py-0.5 rounded text-[9px] font-black uppercase ${
                              res.type === "Immediate"
                                ? "bg-rose-50 text-rose-700 border border-rose-100"
                                : "bg-blue-50 text-blue-700 border border-blue-100"
                            }`}
                          >
                            {res.type}
                          </span>
                        </td>
                        <td className="p-3 text-center text-slate-500 font-medium">{res.resignationDate}</td>
                        <td className="p-3 text-center font-bold text-slate-700">{res.lastWorkingDate}</td>
                        <td className="p-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${
                              res.status === "Notice Period"
                                ? "bg-indigo-50 text-indigo-700 border border-indigo-200"
                                : res.status === "For Approval"
                                ? "bg-amber-50 text-amber-700 border border-amber-200"
                                : res.status === "Completed"
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                : "bg-rose-50 text-rose-700 border border-rose-200"
                            }`}
                          >
                            {res.status}
                          </span>
                        </td>
                        <td className="p-3 max-w-[150px] truncate text-slate-600 font-medium" title={res.reason}>
                          {res.reason}
                        </td>
                        <td className="p-3 text-center">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedResignation(res);
                            }}
                            className="px-2.5 py-1 bg-slate-100 hover:bg-[#FFE0D5] hover:text-[#FF5C28] text-[#042C51] rounded text-[10px] font-extrabold border border-slate-200 transition-colors"
                          >
                            View Details
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ==================== 6. MODALS & WORKFLOWS ==================== */}

      {/* ADD RESIGNATION MODAL */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 bg-[#042C51]/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden text-slate-900"
            >
              <div className="p-4 bg-[#042C51] text-white flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <UserX className="w-5 h-5 text-[#FF5C28]" />
                  <div>
                    <h2 className="text-sm font-black">File New Resignation</h2>
                    <p className="text-[10px] text-slate-300 font-medium">Log offboarding parameters manually</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsAddModalOpen(false)}
                  className="p-1 rounded-lg bg-white/10 hover:bg-white/25 text-white"
                >
                  <X className="w-4.5 h-4.5" />
                </button>
              </div>

              <form onSubmit={handleAddResignation} className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  {/* SIBS ID */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">SIBS ID</label>
                    <input
                      type="text"
                      placeholder="e.g. SIBS-8429"
                      required
                      value={newSibsId}
                      onChange={(e) => setNewSibsId(e.target.value)}
                      className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none focus:bg-white"
                    />
                  </div>

                  {/* Employee Name */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Employee Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Alvin De Leon"
                      required
                      value={newEmployeeName}
                      onChange={(e) => setNewEmployeeName(e.target.value)}
                      className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none focus:bg-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Department */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Department</label>
                    <select
                      value={newDepartment}
                      onChange={(e) => setNewDepartment(e.target.value)}
                      className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none focus:bg-white"
                    >
                      <option value="Telecom & Tech Support">Telecom & Tech Support</option>
                      <option value="Healthcare & Insurance">Healthcare & Insurance</option>
                      <option value="Financial Services Group">Financial Services Group</option>
                      <option value="Retail & E-Commerce">Retail & E-Commerce</option>
                    </select>
                  </div>

                  {/* Account */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Account Client</label>
                    <select
                      value={newAccount}
                      onChange={(e) => setNewAccount(e.target.value)}
                      className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none focus:bg-white"
                    >
                      <option value="Verizon Tech">Verizon Tech</option>
                      <option value="T-Mobile Care">T-Mobile Care</option>
                      <option value="AT&T Support">AT&T Support</option>
                      <option value="UnitedHealth VIP">UnitedHealth VIP</option>
                      <option value="Chase Credit">Chase Credit</option>
                      <option value="Amazon Care">Amazon Care</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Resignation Type */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Resignation Type</label>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setNewType("Formal");
                          setNewLastWorkingDate("2026-08-19");
                        }}
                        className={`flex-1 py-1.5 rounded-lg text-xs font-extrabold border transition-all ${
                          newType === "Formal"
                            ? "bg-[#042C51] text-white border-[#042C51]"
                            : "bg-slate-50 text-slate-600 border-slate-200"
                        }`}
                      >
                        Formal (30d notice)
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setNewType("Immediate");
                          setNewLastWorkingDate("2026-07-20");
                        }}
                        className={`flex-1 py-1.5 rounded-lg text-xs font-extrabold border transition-all ${
                          newType === "Immediate"
                            ? "bg-rose-50 text-rose-700 border-rose-300"
                            : "bg-slate-50 text-slate-600 border-slate-200"
                        }`}
                      >
                        Immediate
                      </button>
                    </div>
                  </div>

                  {/* Reason dropdown */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Primary Reason</label>
                    <select
                      value={newReason}
                      onChange={(e) => setNewReason(e.target.value)}
                      className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none focus:bg-white"
                    >
                      <option value="Better Compensation">Better Compensation</option>
                      <option value="Career Growth">Career Growth</option>
                      <option value="Medical / Health Concerns">Medical / Health Concerns</option>
                      <option value="Relocation / Family reasons">Relocation / Family reasons</option>
                      <option value="Returning to school">Returning to school</option>
                      <option value="Shift schedule conflicts">Shift schedule conflicts</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Resignation Date */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Resignation Date</label>
                    <input
                      type="date"
                      value={newResignationDate}
                      onChange={(e) => setNewResignationDate(e.target.value)}
                      className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none focus:bg-white"
                    />
                  </div>

                  {/* Last Working Date */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Last Working Date</label>
                    <input
                      type="date"
                      value={newLastWorkingDate}
                      onChange={(e) => setNewLastWorkingDate(e.target.value)}
                      className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none focus:bg-white"
                    />
                  </div>
                </div>

                {/* Details / Narrative */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Narrative / Additional Details</label>
                  <textarea
                    rows={2}
                    placeholder="Write a brief explanation or notes..."
                    value={newDetails}
                    onChange={(e) => setNewDetails(e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none focus:bg-white resize-none"
                  />
                </div>

                {/* Attachments Section */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Letter / Medical Certificate Attachments</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="e.g. med_cert_2026.pdf"
                      value={newAttachment}
                      onChange={(e) => setNewAttachment(e.target.value)}
                      className="flex-1 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none focus:bg-white"
                    />
                    <button
                      type="button"
                      onClick={handleAddAttachment}
                      className="px-3 bg-[#F1F5F9] hover:bg-[#FFE0D5] text-[#042C51] hover:text-[#FF5C28] text-xs font-bold rounded-lg border border-slate-200 transition-colors"
                    >
                      Add
                    </button>
                  </div>

                  {addedAttachments.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {addedAttachments.map((att, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-100 border border-slate-200 rounded text-[9px] font-black text-slate-600"
                        >
                          <Paperclip className="w-2.5 h-2.5 shrink-0" />
                          <span>{att}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveAttachment(index)}
                            className="hover:text-rose-500 font-bold px-0.5"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-[#042C51] hover:bg-[#FF5C28] text-white text-xs font-black rounded-lg transition-all"
                  >
                    Submit Resignation
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* VIEW DETAILS MODAL */}
      <AnimatePresence>
        {selectedResignation && (
          <div className="fixed inset-0 bg-[#042C51]/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden text-slate-900"
            >
              <div className="p-4 bg-[#042C51] text-white flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 bg-[#FF5C28] rounded-lg">
                    <UserX className="w-4.5 h-4.5 text-white" />
                  </span>
                  <div>
                    <h2 className="text-sm font-black">Resignation Case Details</h2>
                    <p className="text-[10px] text-slate-300 font-medium">Offboarding workflow dossier</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedResignation(null)}
                  className="p-1 rounded-lg bg-white/10 hover:bg-white/25 text-white cursor-pointer"
                >
                  <X className="w-4.5 h-4.5" />
                </button>
              </div>

              <div className="p-6 space-y-5">
                
                {/* Employee Info Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-slate-50 p-4 rounded-xl border border-slate-200 gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#042C51] text-white font-black flex items-center justify-center text-sm uppercase">
                      {selectedResignation.employeeName.charAt(0)}
                    </div>
                    <div>
                      <h3 className="text-base font-black text-[#042C51]">{selectedResignation.employeeName}</h3>
                      <div className="flex items-center gap-2 text-xs text-slate-500 font-medium mt-0.5">
                        <span>{selectedResignation.sibsId}</span>
                        <span>•</span>
                        <span>{selectedResignation.department}</span>
                        <span>•</span>
                        <span>{selectedResignation.account}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right flex flex-col items-start sm:items-end">
                    <span className="text-[9px] uppercase font-bold text-slate-400">Current Status</span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-black uppercase mt-1 ${
                        selectedResignation.status === "Notice Period"
                          ? "bg-indigo-50 text-indigo-700 border border-indigo-200"
                          : selectedResignation.status === "For Approval"
                          ? "bg-amber-50 text-amber-700 border border-amber-200"
                          : selectedResignation.status === "Completed"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : "bg-rose-50 text-rose-700 border border-rose-200"
                      }`}
                    >
                      {selectedResignation.status}
                    </span>
                  </div>
                </div>

                {/* Resignation Core Details Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-3.5 bg-slate-50/50 rounded-xl border border-slate-100">
                  <div>
                    <span className="text-[9px] text-slate-400 uppercase font-black tracking-wider block">Case ID</span>
                    <span className="text-xs font-extrabold text-[#042C51] mt-0.5 block">{selectedResignation.id}</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-400 uppercase font-black tracking-wider block">Filed Date</span>
                    <span className="text-xs font-bold text-slate-700 mt-0.5 block">{selectedResignation.resignationDate}</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-400 uppercase font-black tracking-wider block">Last Working Day</span>
                    <span className="text-xs font-black text-rose-600 mt-0.5 block">{selectedResignation.lastWorkingDate}</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-400 uppercase font-black tracking-wider block">Notice Cycle</span>
                    <span className="text-xs font-extrabold text-indigo-600 mt-0.5 block">
                      {selectedResignation.type === "Immediate" ? "Immediate Waiver" : "30-Day SLA Period"}
                    </span>
                  </div>
                </div>

                {/* Reason & Narrative Statement */}
                <div className="space-y-1.5">
                  <h4 className="text-xs font-bold text-[#042C51] uppercase tracking-wider">Statement / Reason details</h4>
                  <div className="p-3.5 bg-blue-50/40 border border-blue-200/50 rounded-xl space-y-1.5">
                    <span className="text-[10px] font-black text-[#042C51] bg-[#FFF0EB] text-[#FF5C28] px-1.5 py-0.5 rounded border border-[#FFE0D5]">
                      Reason: {selectedResignation.reason}
                    </span>
                    <p className="text-xs text-slate-700 font-medium leading-relaxed italic">
                      "{selectedResignation.details || "No narrative details added with submission."}"
                    </p>
                  </div>
                </div>

                {/* Approval Routing Table */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <h4 className="text-xs font-bold text-[#042C51] uppercase tracking-wider">Clearance & Approval Routing Stages</h4>
                    <span className="text-[9px] text-slate-500 font-bold uppercase">SOP Alignment routing: TL ➔ OM ➔ SOM ➔ HR</span>
                  </div>

                  <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200 text-slate-400 font-bold">
                          <th className="p-2.5">Approval Stage</th>
                          <th className="p-2.5">Designated Approver</th>
                          <th className="p-2.5 text-center">Status</th>
                          <th className="p-2.5">Processed Time</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {selectedResignation.approvalStages.map((stage, idx) => (
                          <tr key={idx} className="hover:bg-slate-50/50 font-medium">
                            <td className="p-2.5 font-bold text-[#042C51]">{stage.stageName}</td>
                            <td className="p-2.5 text-slate-600">{stage.approver}</td>
                            <td className="p-2.5 text-center">
                              <span
                                className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${
                                  stage.status === "Approved"
                                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                    : stage.status === "Pending"
                                    ? "bg-amber-50 text-amber-700 border border-amber-200"
                                    : stage.status === "Declined"
                                    ? "bg-rose-50 text-rose-700 border border-rose-200"
                                    : "bg-slate-100 text-slate-400 border border-slate-200"
                                }`}
                              >
                                {stage.status}
                              </span>
                            </td>
                            <td className="p-2.5 text-slate-400 font-mono text-[10px]">
                              {stage.updatedAt || "Pending decision"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Attachments list */}
                {selectedResignation.attachments.length > 0 && (
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Attached files ({selectedResignation.attachments.length})</span>
                    <div className="flex flex-wrap gap-2">
                      {selectedResignation.attachments.map((file, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 hover:bg-slate-200 rounded-lg border border-slate-200 text-xs font-bold text-[#042C51] transition-all cursor-pointer"
                        >
                          <FileText className="w-3.5 h-3.5 text-slate-500" />
                          <span>{file}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              </div>

              {/* Action Buttons with active role evaluation */}
              <div className="p-4 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row justify-between gap-3">
                
                {/* Meta details */}
                <div className="flex items-center gap-1 text-[10px] text-slate-500">
                  <span className="font-bold">Filed By:</span>
                  <span>{selectedResignation.filedBy.name} ({selectedResignation.filedBy.role})</span>
                </div>

                <div className="flex items-center gap-2 self-end">
                  {selectedResignation.status === "For Approval" && (
                    <>
                      <button
                        onClick={handleDecline}
                        className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-black rounded-lg border border-rose-200 transition-colors cursor-pointer"
                      >
                        Decline Case
                      </button>

                      {/* Render approvals matching role selection context to demonstrate interactive UX */}
                      {userRoleContext === "Team Leader" && selectedResignation.approvalStages[0].status === "Pending" && (
                        <button
                          onClick={() => handleApprove("Team Leader")}
                          className="px-4 py-1.5 bg-[#042C51] hover:bg-[#FF5C28] text-white text-xs font-black rounded-lg transition-all cursor-pointer"
                        >
                          Approve TL Stage
                        </button>
                      )}

                      {userRoleContext === "Operations Manager" && selectedResignation.approvalStages[1].status === "Pending" && (
                        <button
                          onClick={() => handleApprove("Operations Manager")}
                          className="px-4 py-1.5 bg-[#042C51] hover:bg-[#FF5C28] text-white text-xs font-black rounded-lg transition-all cursor-pointer"
                        >
                          Approve OM Stage
                        </button>
                      )}

                      {userRoleContext === "HR Admin" && (
                        <div className="flex gap-2">
                          {selectedResignation.approvalStages[2].status === "Pending" && (
                            <button
                              onClick={() => handleApprove("Senior Ops Manager")}
                              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
                            >
                              Approve SOM Stage
                            </button>
                          )}
                          {selectedResignation.approvalStages[3].status === "Pending" && (
                            <button
                              onClick={() => handleApprove("HR Partner")}
                              className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black rounded-lg transition-colors cursor-pointer"
                            >
                              Sign-off & Approve HR
                            </button>
                          )}
                        </div>
                      )}
                    </>
                  )}

                  <button
                    onClick={() => setSelectedResignation(null)}
                    className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold rounded-lg transition-colors cursor-pointer"
                  >
                    Close dossier
                  </button>
                </div>

              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
