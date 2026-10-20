import React, { useState, useMemo } from "react";
import { 
  X, 
  Info, 
  Layers, 
  AlertTriangle, 
  CheckCircle2, 
  Trash2, 
  Edit3, 
  Plus, 
  Calendar, 
  User, 
  Clock, 
  Flame, 
  Filter, 
  History, 
  Sparkles,
  Check,
  CheckCircle,
  HelpCircle,
  TrendingUp
} from "lucide-react";
import { 
  WorkforcePlan, 
  ActionItem, 
  ActionItemStatus, 
  PlanStatus 
} from "../types";

interface ViewPlanDrawerProps {
  plan: WorkforcePlan | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdatePlan: (updatedPlan: WorkforcePlan) => void;
}

export default function ViewPlanDrawer({
  plan,
  isOpen,
  onClose,
  onUpdatePlan
}: ViewPlanDrawerProps) {
  if (!isOpen || !plan) return null;

  // Local state for Sourcing actions
  const [actionQuery, setActionQuery] = useState("");
  const [actionStatusFilter, setActionStatusFilter] = useState<string>("All");
  const [actionOverdueFilter, setActionOverdueFilter] = useState<string>("All");
  const [actionSortOrder, setActionSortOrder] = useState<"asc" | "desc">("asc");

  // Add Action Item form inline toggles
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [taskDesc, setTaskDesc] = useState("");
  const [taskAssignee, setTaskAssignee] = useState("");
  const [taskDate, setTaskDate] = useState("2026-07-25");
  const [taskPriority, setTaskPriority] = useState<"Low" | "Medium" | "High">("High");

  // Edit Action Item state
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editDesc, setEditDesc] = useState("");
  const [editAssignee, setEditAssignee] = useState("");
  const [editDate, setEditDate] = useState("");
  const [editStatus, setEditStatus] = useState<ActionItemStatus>(ActionItemStatus.InProgress);
  const [editPriority, setEditPriority] = useState<"Low" | "Medium" | "High">("High");

  // Toast confirmation feedback
  const [actionToast, setActionToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setActionToast(msg);
    setTimeout(() => setActionToast(null), 2500);
  };

  // Check if target date is overdue (earlier than "2026-07-19" system date)
  const isOverdue = (dateStr: string) => {
    return new Date(dateStr) < new Date("2026-07-19");
  };

  // Filters & Sorters on Action Items
  const filteredActionItems = useMemo(() => {
    let items = [...plan.actionItems];

    // Status filter
    if (actionStatusFilter !== "All") {
      items = items.filter(item => item.status === actionStatusFilter);
    }

    // Overdue filter
    if (actionOverdueFilter === "Overdue") {
      items = items.filter(item => isOverdue(item.targetDate) && item.status !== ActionItemStatus.Completed);
    } else if (actionOverdueFilter === "Pending") {
      items = items.filter(item => !isOverdue(item.targetDate) || item.status === ActionItemStatus.Completed);
    }

    // Search query
    if (actionQuery.trim() !== "") {
      const q = actionQuery.toLowerCase();
      items = items.filter(item => 
        item.taskDescription.toLowerCase().includes(q) ||
        item.assignee.toLowerCase().includes(q)
      );
    }

    // Sort by Target Date
    items.sort((a, b) => {
      const dateA = new Date(a.targetDate).getTime();
      const dateB = new Date(b.targetDate).getTime();
      return actionSortOrder === "asc" ? dateA - dateB : dateB - dateA;
    });

    return items;
  }, [plan.actionItems, actionStatusFilter, actionOverdueFilter, actionQuery, actionSortOrder]);

  // Aggregate stats for action items
  const taskStats = useMemo(() => {
    const total = plan.actionItems.length;
    const completed = plan.actionItems.filter(i => i.status === ActionItemStatus.Completed).length;
    const inProgress = plan.actionItems.filter(i => i.status === ActionItemStatus.InProgress).length;
    const overdue = plan.actionItems.filter(i => isOverdue(i.targetDate) && i.status !== ActionItemStatus.Completed).length;
    return { total, completed, inProgress, overdue };
  }, [plan.actionItems]);

  // CRUD Operation: Add Action Item
  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskDesc.trim() || !taskAssignee.trim()) {
      alert("Please fill out Description and Assignee.");
      return;
    }

    const newTask: ActionItem = {
      id: `act-${Date.now()}`,
      workforcePlanId: plan.id,
      taskDescription: taskDesc,
      assignee: taskAssignee,
      targetDate: taskDate,
      status: ActionItemStatus.NotStarted,
      priority: taskPriority,
      createdAt: "2026-07-19",
      updatedAt: "2026-07-19"
    };

    const updatedPlan: WorkforcePlan = {
      ...plan,
      actionItems: [newTask, ...plan.actionItems],
      activityHistory: [
        {
          id: `hist-${Date.now()}`,
          date: "2026-07-19 22:40",
          user: "dulla13ralph@gmail.com",
          action: "Added Operational Task",
          details: `Created task: "${taskDesc}" assigned to ${taskAssignee}.`
        },
        ...plan.activityHistory
      ]
    };

    onUpdatePlan(updatedPlan);
    setIsAddingTask(false);
    setTaskDesc("");
    setTaskAssignee("");
    showToast("Task assigned and appended to operations blueprint!");
  };

  // CRUD Operation: Edit Trigger
  const startEdit = (item: ActionItem) => {
    setEditingTaskId(item.id);
    setEditDesc(item.taskDescription);
    setEditAssignee(item.assignee);
    setEditDate(item.targetDate);
    setEditStatus(item.status);
    setEditPriority(item.priority);
  };

  // CRUD Operation: Save Edit
  const handleSaveEdit = (itemId: string) => {
    const updatedItems = plan.actionItems.map(item => {
      if (item.id === itemId) {
        return {
          ...item,
          taskDescription: editDesc,
          assignee: editAssignee,
          targetDate: editDate,
          status: editStatus,
          priority: editPriority,
          updatedAt: "2026-07-19"
        };
      }
      return item;
    });

    const updatedPlan: WorkforcePlan = {
      ...plan,
      actionItems: updatedItems,
      activityHistory: [
        {
          id: `hist-${Date.now()}`,
          date: "2026-07-19 22:40",
          user: "dulla13ralph@gmail.com",
          action: "Modified Operational Task",
          details: `Updated task parameters for: "${editDesc}".`
        },
        ...plan.activityHistory
      ]
    };

    onUpdatePlan(updatedPlan);
    setEditingTaskId(null);
    showToast("Operational parameters re-saved successfully.");
  };

  // CRUD Operation: Delete Task with Confirmation
  const handleDeleteTask = (itemId: string, desc: string) => {
    if (!confirm(`Are you sure you want to delete the task: "${desc}"?`)) return;

    const updatedItems = plan.actionItems.filter(item => item.id !== itemId);
    const updatedPlan: WorkforcePlan = {
      ...plan,
      actionItems: updatedItems,
      activityHistory: [
        {
          id: `hist-${Date.now()}`,
          date: "2026-07-19 22:40",
          user: "dulla13ralph@gmail.com",
          action: "Deleted Task",
          details: `Removed task: "${desc}".`
        },
        ...plan.activityHistory
      ]
    };

    onUpdatePlan(updatedPlan);
    showToast("Task permanently decommissioned from plan.");
  };

  // Fast trigger: Quick Status Toggle
  const handleQuickStatusChange = (itemId: string, newStatus: ActionItemStatus) => {
    const updatedItems = plan.actionItems.map(item => {
      if (item.id === itemId) {
        return { ...item, status: newStatus, updatedAt: "2026-07-19" };
      }
      return item;
    });

    const updatedPlan: WorkforcePlan = {
      ...plan,
      actionItems: updatedItems,
      activityHistory: [
        {
          id: `hist-${Date.now()}`,
          date: "2026-07-19 22:40",
          user: "dulla13ralph@gmail.com",
          action: "Status Updated",
          details: `Shifted task status to ${newStatus}.`
        },
        ...plan.activityHistory
      ]
    };

    onUpdatePlan(updatedPlan);
    showToast(`Task status adjusted to ${newStatus}.`);
  };

  return (
    <div className="fixed inset-0 z-40 flex justify-end select-none">
      {/* Backdrop overlay */}
      <div 
        onClick={onClose}
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity duration-300"
      ></div>

      {/* Drawer Body (Wide sliding side panel on Desktop, Full screen on Mobile) */}
      <div className="bg-[#DDE4EC] w-full max-w-4xl h-full flex flex-col relative z-50 shadow-2xl overflow-hidden border-l border-[#E6ECF2] animate-in slide-in-from-right duration-250">
        
        {/* Toast Notification */}
        {actionToast && (
          <div className="absolute top-18 right-6 z-50 bg-[#042C51] text-white px-3.5 py-2.5 rounded-lg border border-blue-300 flex items-center gap-2 shadow-xl animate-bounce text-xs font-semibold">
            <Check className="w-4 h-4 text-[#2ECC71]" />
            <span>{actionToast}</span>
          </div>
        )}

        {/* Drawer Header */}
        <div className="bg-[#042C51] text-white p-5 flex items-center justify-between shrink-0">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-widest bg-[#FF5C28] px-2 py-0.5 rounded text-white">
              Sourcing Workspace
            </span>
            <h2 className="text-base font-extrabold mt-1 text-white">
              Hiring Blueprint: {plan.account} — {plan.planPeriod}
            </h2>
            <p className="text-[11px] text-slate-300 mt-0.5 font-medium">
              Owned and monitored by <strong>{plan.owner}</strong>
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 bg-slate-800 hover:bg-[#FF5C28] hover:text-white rounded-lg transition-colors focus:outline-none"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Drawer Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6 scrollbar-thin">
          
          {/* ==================== 1. FORMULA METRICS WIDGET ==================== */}
          <section className="bg-white p-4 rounded-xl border border-[#E6ECF2] shadow-sm space-y-3">
            <h3 className="text-xs font-black text-[#042C51] tracking-wider uppercase border-b pb-1.5 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-[#FF5C28]" />
              Calculated Pipeline Projections
            </h3>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {/* Formula Metric 1 */}
              <div className="p-2.5 bg-slate-50 rounded-xl relative group">
                <div className="flex items-center gap-1 text-[10px] text-slate-500 font-bold mb-1">
                  <span>Required HC</span>
                  <Info className="w-3 h-3 text-slate-400 cursor-help" />
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover:block bg-slate-900 text-white text-[9px] rounded p-1.5 w-36 z-10 font-normal">
                    Current approved requirement baseline.
                  </div>
                </div>
                <div className="text-lg font-extrabold text-[#042C51]">{plan.requiredHeadcount}</div>
                <div className="text-[9px] text-slate-400">Target seat roster</div>
              </div>

              {/* Formula Metric 2 */}
              <div className="p-2.5 bg-slate-50 rounded-xl relative group">
                <div className="flex items-center gap-1 text-[10px] text-slate-500 font-bold mb-1">
                  <span>Actual HC</span>
                  <Info className="w-3 h-3 text-slate-400 cursor-help" />
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover:block bg-slate-900 text-white text-[9px] rounded p-1.5 w-36 z-10 font-normal">
                    Current active headcount.
                  </div>
                </div>
                <div className="text-lg font-extrabold text-slate-700">{plan.actualHeadcount}</div>
                <div className="text-[9px] text-slate-400">Rostered on floor</div>
              </div>

              {/* Formula Metric 3 */}
              <div className="p-2.5 bg-rose-50 border border-rose-100 rounded-xl relative group">
                <div className="flex items-center gap-1 text-[10px] text-rose-700 font-bold mb-1">
                  <span>Hiring Needed</span>
                  <Info className="w-3 h-3 text-rose-400 cursor-help" />
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover:block bg-slate-900 text-white text-[9px] rounded p-2 w-48 z-10 font-normal leading-normal">
                    <strong>Formula:</strong> Coverage + PRF − Hired. Represents actual unmet staffing demands.
                  </div>
                </div>
                <div className="text-lg font-black text-[#E74C3C]">{plan.hiringNeeded}</div>
                <div className="text-[9px] text-rose-600 font-semibold">Immediate vacancy</div>
              </div>

              {/* Formula Metric 4 */}
              <div className="p-2.5 bg-slate-50 rounded-xl relative group">
                <div className="flex items-center gap-1 text-[10px] text-slate-500 font-bold mb-1">
                  <span>Hiring Yield</span>
                  <Info className="w-3 h-3 text-slate-400 cursor-help" />
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover:block bg-slate-900 text-white text-[9px] rounded p-2 w-44 z-10 font-normal leading-normal">
                    <strong>Formula:</strong> FST ÷ Interview. Sourcing efficiency yield.
                  </div>
                </div>
                <div className="text-lg font-extrabold text-slate-700">{plan.hiringRate}%</div>
                <div className="text-[9px] text-slate-400">Yield benchmark</div>
              </div>

              {/* Formula Metric 5 */}
              <div className="p-2.5 bg-amber-50 border border-amber-100 rounded-xl col-span-2 md:col-span-1 relative group">
                <div className="flex items-center gap-1 text-[10px] text-amber-700 font-bold mb-1">
                  <span>Leads Needed</span>
                  <Info className="w-3 h-3 text-amber-500 cursor-help" />
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover:block bg-slate-900 text-white text-[9px] rounded p-2 w-48 z-10 font-normal leading-normal">
                    <strong>Formula:</strong> Interview count ÷ Hiring Rate. Total raw applicants required to complete targets.
                  </div>
                </div>
                <div className="text-lg font-black text-[#E67E22]">{plan.leadsNeeded}</div>
                <div className="text-[9px] text-amber-600 font-semibold">Applicants target</div>
              </div>
            </div>
          </section>

          {/* ==================== 2. KPI SNAPSHOT & COMPLIANCE ==================== */}
          <section className="bg-white p-4 rounded-xl border border-[#E6ECF2] shadow-sm space-y-3.5">
            <h3 className="text-xs font-black text-[#042C51] tracking-wider uppercase border-b pb-1.5">
              Account KPI Compliance Snapshot
            </h3>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
              <div className="p-2 bg-slate-50 rounded-lg">
                <span className="block text-[10px] text-slate-400 uppercase font-semibold">Absenteeism Target</span>
                <span className="block font-black text-slate-800 text-sm mt-0.5">
                  {plan.kpiSnapshot.absenteeismPercentage}% ({plan.kpiSnapshot.absenteeismCount} agents)
                </span>
                <span className="text-[9px] text-rose-500 font-bold">▲ Exceeds 5.0% threshold</span>
              </div>

              <div className="p-2 bg-slate-50 rounded-lg">
                <span className="block text-[10px] text-slate-400 uppercase font-semibold">Roster Attrition Rate</span>
                <span className="block font-black text-slate-800 text-sm mt-0.5">
                  {plan.kpiSnapshot.attritionPercentage}% ({plan.kpiSnapshot.attritionCount} exits)
                </span>
                <span className="text-[9px] text-amber-500 font-bold">● High voluntary risk</span>
              </div>

              <div className="p-2 bg-slate-50 rounded-lg">
                <span className="block text-[10px] text-slate-400 uppercase font-semibold">Vacancy Buffer</span>
                <span className={`block font-black text-sm mt-0.5 ${
                  plan.kpiSnapshot.bufferPercentage < 0 ? "text-[#E74C3C]" : "text-[#2ECC71]"
                }`}>
                  {plan.kpiSnapshot.bufferPercentage}%
                </span>
                <span className="text-[9px] text-slate-400">Current safety cushion</span>
              </div>

              <div className="p-2 bg-slate-50 rounded-lg">
                <span className="block text-[10px] text-slate-400 uppercase font-semibold">Approved by</span>
                <span className="block font-black text-slate-700 text-[11px] truncate mt-0.5">
                  {plan.approvedBy || "Operations Committee"}
                </span>
                <span className="text-[9px] text-emerald-500 font-semibold">✓ Authorized slot</span>
              </div>
            </div>
          </section>

          {/* ==================== 3. PIPELINE STAGE FUNNEL ==================== */}
          <section className="bg-white p-4 rounded-xl border border-[#E6ECF2] shadow-sm space-y-3.5">
            <h3 className="text-xs font-black text-[#042C51] tracking-wider uppercase border-b pb-1.5 flex items-center justify-between">
              <span>Account-Specific Sequential Funnel</span>
              <span className="text-[9px] bg-[#E9F0FC] text-[#042C51] px-2 py-0.5 rounded font-mono font-bold">
                Total pipeline: {plan.pipeline.acceptedJO} offers
              </span>
            </h3>

            {/* Horizontal Funnel stages */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-2 pt-1">
              {[
                { name: "Accepted JO", count: plan.pipeline.acceptedJO, label: "Stage 1" },
                { name: "NHO", count: plan.pipeline.nho, label: "Stage 2" },
                { name: "FST", count: plan.pipeline.fst, label: "Stage 3" },
                { name: "PST", count: plan.pipeline.pst, label: "Stage 4" },
                { name: "Go Live", count: plan.pipeline.goLive, label: "Stage 5" }
              ].map((stg, i, arr) => {
                const loss = i > 0 ? arr[i-1].count - stg.count : 0;
                return (
                  <div key={i} className="bg-slate-50 p-2 rounded-lg border relative text-center">
                    <span className="block text-[8px] text-slate-400 uppercase font-extrabold">{stg.label}</span>
                    <strong className="block text-[#042C51] text-sm font-black mt-0.5">{stg.name}</strong>
                    <span className="block text-base font-extrabold text-[#FF5C28] mt-1">{stg.count}</span>
                    {loss > 0 && (
                      <span className="absolute -top-2.5 -left-1.5 bg-rose-50 text-rose-600 text-[9px] px-1 rounded border border-rose-100 font-bold">
                        -{loss}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Specific Tracked Transitions */}
            <div className="bg-slate-50 p-3 rounded-lg border space-y-2">
              <h4 className="text-[10px] font-bold text-slate-500 uppercase">Transitions Loss Audit</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-[11px]">
                <div className="flex justify-between border-b pb-1">
                  <span className="text-slate-500">Accepted JO → NHO Leakage:</span>
                  <strong className="text-rose-600 font-mono font-bold">{plan.pipeline.dropOffs.joToNho} lost</strong>
                </div>
                <div className="flex justify-between border-b pb-1">
                  <span className="text-slate-500">NHO → FST Sourcing Drop:</span>
                  <strong className="text-rose-600 font-mono font-bold">{plan.pipeline.dropOffs.nhoToFst} lost</strong>
                </div>
                <div className="flex justify-between border-b pb-1">
                  <span className="text-slate-500">FST → PST Training Leak:</span>
                  <strong className="text-rose-600 font-mono font-bold">{plan.pipeline.dropOffs.fstToPst} lost</strong>
                </div>
                <div className="flex justify-between border-b pb-1">
                  <span className="text-slate-500">NHO → PST Alternate Loss:</span>
                  <strong className="text-rose-600 font-mono font-bold">{plan.pipeline.dropOffs.nhoToPst} lost</strong>
                </div>
                <div className="flex justify-between border-b pb-1 col-span-1 md:col-span-2">
                  <span className="text-slate-500">PST → Go Live deployment drop:</span>
                  <strong className="text-[#E74C3C] font-mono font-bold">{plan.pipeline.dropOffs.pstToGoLive} lost</strong>
                </div>
              </div>
            </div>
          </section>

          {/* ==================== 4. ACTION ITEMS SECTION ==================== */}
          <section className="bg-white p-4 rounded-xl border border-[#E6ECF2] shadow-sm space-y-4">
            
            {/* Header with Stats Summary */}
            <div className="flex flex-col md:flex-row md:items-center justify-between border-b pb-3 gap-3">
              <div>
                <h3 className="text-xs font-black text-[#042C51] tracking-wider uppercase flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-[#FF5C28]" />
                  Operational Action Items & Tasks
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">Assigned projects to mitigate applicant drop-offs.</p>
              </div>

              {/* Progress Summary cards */}
              <div className="flex items-center gap-2 text-[10px] font-bold">
                <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full border">
                  Total: {taskStats.total}
                </span>
                <span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-200">
                  Completed: {taskStats.completed}
                </span>
                <span className="bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full border border-amber-200">
                  Pacing: {taskStats.inProgress}
                </span>
                <span className="bg-rose-50 text-rose-700 px-2 py-0.5 rounded-full border border-rose-200">
                  Overdue: {taskStats.overdue}
                </span>
              </div>
            </div>

            {/* Quick Sourcing Action filters */}
            <div className="flex flex-wrap items-center gap-2 justify-between">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Filter tasks..."
                  value={actionQuery}
                  onChange={e => setActionQuery(e.target.value)}
                  className="bg-slate-50 border px-2.5 py-1 rounded text-[11px] focus:outline-none focus:bg-white focus:border-[#042C51] w-40"
                />

                <select
                  value={actionStatusFilter}
                  onChange={e => setActionStatusFilter(e.target.value)}
                  className="bg-slate-50 border px-1.5 py-1 rounded text-[11px] font-semibold cursor-pointer text-slate-600 focus:outline-none"
                >
                  <option value="All">All Statuses</option>
                  {Object.values(ActionItemStatus).map(st => (
                    <option key={st} value={st}>{st}</option>
                  ))}
                </select>

                <select
                  value={actionOverdueFilter}
                  onChange={e => setActionOverdueFilter(e.target.value)}
                  className="bg-slate-50 border px-1.5 py-1 rounded text-[11px] font-semibold cursor-pointer text-slate-600 focus:outline-none"
                >
                  <option value="All">Pacing timeline</option>
                  <option value="Overdue">Overdue</option>
                  <option value="Pending">On schedule</option>
                </select>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setActionSortOrder(prev => prev === "asc" ? "desc" : "asc")}
                  className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded text-[11px] font-bold"
                >
                  Sort target: {actionSortOrder === "asc" ? "Oldest ➔ Newest" : "Newest ➔ Oldest"}
                </button>

                <button
                  onClick={() => setIsAddingTask(!isAddingTask)}
                  className="px-3 py-1 bg-[#042C51] hover:bg-slate-800 text-white rounded text-[11px] font-bold flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Assign Task</span>
                </button>
              </div>
            </div>

            {/* Inline Sourcing assignment creation form */}
            {isAddingTask && (
              <form onSubmit={handleAddTask} className="p-3 bg-slate-50 rounded-xl border border-[#E6ECF2] space-y-3 text-[11px] animate-in slide-in-from-top-4 duration-150">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="col-span-1 md:col-span-2">
                    <label className="block text-slate-500 font-bold mb-1">Task Description</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Expand radio ads to increase JO conversions..."
                      value={taskDesc}
                      onChange={e => setTaskDesc(e.target.value)}
                      className="w-full bg-white border rounded p-2 focus:outline-none focus:border-[#042C51] font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-500 font-bold mb-1">Assignee employee</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. John Doe (Sourcing Specialist)"
                      value={taskAssignee}
                      onChange={e => setTaskAssignee(e.target.value)}
                      className="w-full bg-white border rounded p-2 focus:outline-none focus:border-[#042C51] font-medium"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-slate-500 font-bold mb-1">Target Date</label>
                      <input
                        type="date"
                        required
                        value={taskDate}
                        onChange={e => setTaskDate(e.target.value)}
                        className="w-full bg-white border rounded p-1.5 focus:outline-none focus:border-[#042C51] font-medium"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-500 font-bold mb-1">Priority</label>
                      <select
                        value={taskPriority}
                        onChange={e => setTaskPriority(e.target.value as any)}
                        className="w-full bg-white border rounded p-1.5 focus:outline-none cursor-pointer font-bold"
                      >
                        <option value="Low">Low</option>
                        <option value="Medium">Medium</option>
                        <option value="High">High</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t">
                  <button
                    type="button"
                    onClick={() => setIsAddingTask(false)}
                    className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-600 font-bold rounded"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-3 py-1.5 bg-[#FF5C28] hover:bg-[#e04f20] text-white font-bold rounded"
                  >
                    Deploy Task
                  </button>
                </div>
              </form>
            )}

            {/* List of Tasks */}
            <div className="space-y-2">
              {filteredActionItems.length === 0 ? (
                <div className="text-center py-8 text-slate-400 font-semibold bg-slate-50 rounded-xl border border-dashed">
                  No operational actions match filters.
                </div>
              ) : (
                filteredActionItems.map(item => {
                  const isComp = item.status === ActionItemStatus.Completed;
                  const isBlocked = item.status === ActionItemStatus.Blocked;
                  const isOver = isOverdue(item.targetDate) && !isComp;
                  const isEditing = editingTaskId === item.id;

                  return (
                    <div 
                      key={item.id} 
                      className={`p-3 rounded-xl border transition-all ${
                        isComp 
                          ? "bg-slate-50/70 border-slate-200 opacity-60" 
                          : isBlocked
                            ? "bg-rose-50/40 border-rose-100"
                            : isOver
                              ? "bg-rose-50 border-rose-200"
                              : "bg-white border-slate-200 hover:shadow-sm"
                      }`}
                    >
                      {isEditing ? (
                        /* Editing form */
                        <div className="space-y-3 text-[11px]">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div className="col-span-1 md:col-span-2">
                              <label className="block text-slate-400 font-bold mb-0.5">Task Description</label>
                              <input 
                                type="text"
                                className="w-full bg-slate-50 border p-1.5 rounded font-medium"
                                value={editDesc}
                                onChange={e => setEditDesc(e.target.value)}
                              />
                            </div>
                            <div>
                              <label className="block text-slate-400 font-bold mb-0.5">Assignee</label>
                              <input 
                                type="text"
                                className="w-full bg-slate-50 border p-1.5 rounded font-medium"
                                value={editAssignee}
                                onChange={e => setEditAssignee(e.target.value)}
                              />
                            </div>
                            <div className="grid grid-cols-3 gap-1.5">
                              <div className="col-span-2">
                                <label className="block text-slate-400 font-bold mb-0.5">Target Date</label>
                                <input 
                                  type="date"
                                  className="w-full bg-slate-50 border p-1 rounded font-medium"
                                  value={editDate}
                                  onChange={e => setEditDate(e.target.value)}
                                />
                              </div>
                              <div>
                                <label className="block text-slate-400 font-bold mb-0.5">Priority</label>
                                <select 
                                  className="w-full bg-slate-50 border p-1 rounded font-bold cursor-pointer"
                                  value={editPriority}
                                  onChange={e => setEditPriority(e.target.value as any)}
                                >
                                  <option value="Low">Low</option>
                                  <option value="Medium">Medium</option>
                                  <option value="High">High</option>
                                </select>
                              </div>
                            </div>

                            <div className="col-span-1 md:col-span-2">
                              <label className="block text-slate-400 font-bold mb-0.5">Global Status</label>
                              <select 
                                className="w-full bg-slate-50 border p-1.5 rounded font-bold cursor-pointer"
                                value={editStatus}
                                onChange={e => setEditStatus(e.target.value as any)}
                              >
                                {Object.values(ActionItemStatus).map(st => (
                                  <option key={st} value={st}>{st}</option>
                                ))}
                              </select>
                            </div>
                          </div>

                          <div className="flex items-center justify-end gap-1.5 pt-2 border-t">
                            <button
                              type="button"
                              onClick={() => setEditingTaskId(null)}
                              className="px-2.5 py-1 bg-slate-200 hover:bg-slate-300 text-slate-600 font-bold rounded"
                            >
                              Cancel
                            </button>
                            <button
                              type="button"
                              onClick={() => handleSaveEdit(item.id)}
                              className="px-2.5 py-1 bg-[#FF5C28] hover:bg-[#e04f20] text-white font-bold rounded"
                            >
                              Save parameters
                            </button>
                          </div>
                        </div>
                      ) : (
                        /* Standard task card view */
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                          <div className="space-y-1.5 max-w-xl">
                            <div className="flex flex-wrap items-center gap-1.5">
                              {/* Status badge trigger */}
                              <select
                                value={item.status}
                                onChange={e => handleQuickStatusChange(item.id, e.target.value as any)}
                                className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded border cursor-pointer focus:outline-none ${
                                  isComp 
                                    ? "bg-emerald-50 text-[#2ECC71] border-emerald-200" 
                                    : isBlocked
                                      ? "bg-rose-50 text-[#E74C3C] border-rose-200"
                                      : "bg-amber-50 text-[#E67E22] border-amber-200"
                                }`}
                              >
                                {Object.values(ActionItemStatus).map(st => (
                                  <option key={st} value={st}>{st}</option>
                                ))}
                              </select>

                              {/* Priority badge */}
                              <span className={`text-[9px] font-black px-1.5 py-0.2 rounded ${
                                item.priority === "High" 
                                  ? "bg-rose-100 text-[#E74C3C]" 
                                  : item.priority === "Medium"
                                    ? "bg-amber-100 text-amber-700"
                                    : "bg-slate-100 text-slate-600"
                              }`}>
                                {item.priority} priority
                              </span>

                              {/* Overdue Alert */}
                              {isOver && (
                                <span className="text-[9px] font-bold bg-rose-200 text-rose-700 px-1.5 py-0.2 rounded uppercase animate-pulse">
                                  OVERDUE
                                </span>
                              )}
                            </div>

                            <p className={`font-bold ${isComp ? "line-through text-slate-400" : "text-[#101828]"}`}>
                              {item.taskDescription}
                            </p>

                            <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500 font-medium">
                              <span className="flex items-center gap-1">
                                <User className="w-3.5 h-3.5 text-slate-400" />
                                <span>Assignee: <strong>{item.assignee}</strong></span>
                              </span>
                              <span className={`flex items-center gap-1 ${isOver ? "text-[#E74C3C] font-bold" : ""}`}>
                                <Calendar className="w-3.5 h-3.5" />
                                <span>Target: <strong>{item.targetDate}</strong></span>
                              </span>
                            </div>
                          </div>

                          {/* Quick CRUD operations */}
                          <div className="flex items-center gap-1 shrink-0 self-end sm:self-auto">
                            <button
                              onClick={() => startEdit(item)}
                              title="Edit parameter details"
                              className="p-1.5 text-slate-400 hover:text-[#042C51] hover:bg-slate-100 rounded-lg transition-colors"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteTask(item.id, item.taskDescription)}
                              title="Decommission action"
                              className="p-1.5 text-slate-400 hover:text-[#E74C3C] hover:bg-rose-50 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </section>

          {/* ==================== 5. ACTIVITY LOGS HISTORY ==================== */}
          <section className="bg-white p-4 rounded-xl border border-[#E6ECF2] shadow-sm space-y-3">
            <h3 className="text-xs font-black text-[#042C51] tracking-wider uppercase border-b pb-1.5 flex items-center gap-1">
              <History className="w-3.5 h-3.5 text-slate-500" />
              Change Logs & Operations Audit Trail
            </h3>

            <div className="space-y-2.5 max-h-40 overflow-y-auto pr-1">
              {plan.activityHistory.map(hist => (
                <div key={hist.id} className="text-[11px] border-b pb-2 flex justify-between items-start gap-4">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1.5">
                      <strong className="text-[#042C51] font-bold">{hist.action}</strong>
                      <span className="text-slate-400">by</span>
                      <span className="text-slate-500 font-semibold">{hist.user}</span>
                    </div>
                    <p className="text-[#667085]">{hist.details}</p>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400 shrink-0">{hist.date}</span>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Drawer Footer actions */}
        <div className="bg-white p-4 border-t border-[#E6ECF2] shrink-0 flex justify-between items-center select-none text-xs">
          <span className="text-[#667085] font-medium">
            System Synchronization date: <strong>2026-07-19</strong>
          </span>

          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#042C51] hover:bg-slate-800 text-white font-extrabold rounded-lg shadow-md"
          >
            Acknowledge & Close
          </button>
        </div>
      </div>
    </div>
  );
}
