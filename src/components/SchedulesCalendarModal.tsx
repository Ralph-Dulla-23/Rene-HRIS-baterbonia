import React, { useState, useMemo } from "react";
import { 
  X, 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Clock, 
  Search, 
  Filter, 
  Edit3, 
  Trash2, 
  MapPin, 
  User, 
  Users, 
  CheckCircle2, 
  AlertCircle, 
  RotateCcw, 
  List, 
  Grid, 
  Sparkles, 
  CalendarDays,
  Tag,
  ArrowRight,
  LogOut,
  ShieldCheck,
  Video,
  BellRing,
  RefreshCw,
  Lock,
  AlignLeft,
  Target,
  ListTodo,
  HelpCircle,
  Briefcase,
  Bell
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { ScheduleItem, ScheduleCategory, ScheduleStatus } from "../types";

interface SchedulesCalendarModalProps {
  isOpen: boolean;
  onClose: () => void;
  schedules: ScheduleItem[];
  onSaveSchedule: (schedule: ScheduleItem) => void;
  onDeleteSchedule: (id: string) => void;
  userEmail?: string;
}

const CATEGORIES: ScheduleCategory[] = [
  "Talent Acquisition",
  "Human Resources",
  "Training & Onboarding",
  "Operations & WFM"
];

const STATUSES: ScheduleStatus[] = [
  "Scheduled",
  "In Progress",
  "Completed",
  "Rescheduled",
  "Cancelled"
];

// Official Google G Logo SVG Component
const GoogleGIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24">
    <path
      fill="#4285F4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="#FBBC05"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
    />
    <path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
    />
  </svg>
);

export default function SchedulesCalendarModal({
  isOpen,
  onClose,
  schedules,
  onSaveSchedule,
  onDeleteSchedule,
  userEmail = "alena.batacan@thesiblingssolutions.com"
}: SchedulesCalendarModalProps) {
  // Active Google Workspace Account State
  const [activeUserEmail, setActiveUserEmail] = useState<string>(userEmail);

  // Google Connection State (Default to true so user sees calendar grid as shown in target layout)
  const [isGoogleConnected, setIsGoogleConnected] = useState<boolean>(true);
  const [isConnecting, setIsConnecting] = useState<boolean>(false);

  // Navigation & View mode
  const [currentDate, setCurrentDate] = useState<Date>(new Date(2026, 6, 29)); // Default July 29, 2026
  const [viewMode, setViewMode] = useState<"grid" | "week" | "agenda">("grid");
  
  // Filters
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [selectedStatus, setSelectedStatus] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");

  // Edit / Add Modal Form state
  const [editingSchedule, setEditingSchedule] = useState<ScheduleItem | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  // Form Type: Event, Task, Out of office
  const [eventType, setEventType] = useState<"event" | "task" | "ooo">("event");
  const [taskDeadline, setTaskDeadline] = useState<string>("");
  const [taskFolder, setTaskFolder] = useState<string>("My Tasks");
  const [oooDeclineMeetings, setOooDeclineMeetings] = useState<boolean>(true);
  const [oooDeclineScope, setOooDeclineScope] = useState<"new" | "all">("all");
  const [oooDeclineMessage, setOooDeclineMessage] = useState<string>("Declined because I am out of office");
  const [oooVisibility, setOooVisibility] = useState<"Public" | "Private">("Public");

  // Google Calendar Event Detail states
  const [eventColor, setEventColor] = useState<string>("#039BE5");
  const [eventAvailability, setEventAvailability] = useState<"Free" | "Busy">("Free");
  const [eventVisibility, setEventVisibility] = useState<"Default visibility" | "Public" | "Private">("Default visibility");
  const [eventNotifications, setEventNotifications] = useState<string[]>([]);
  
  // Toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Google Login Simulation
  const handleGoogleConnect = () => {
    setIsConnecting(true);
    setTimeout(() => {
      setIsConnecting(false);
      setIsGoogleConnected(true);
      showToast(`Connected to Google Workspace (${userEmail}). Calendar loaded.`);
    }, 1100);
  };

  const handleGoogleDisconnect = () => {
    setIsGoogleConnected(false);
    showToast("Disconnected from Google account. Calendar view locked.");
  };

  // Month navigation helpers
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleToday = () => {
    setCurrentDate(new Date(2026, 6, 29)); // Default anchor date
  };

  const monthYearLabel = currentDate.toLocaleDateString("en-US", { month: "long", year: "numeric" });

  // Filtered schedules
  const filteredSchedules = useMemo(() => {
    return schedules.filter(item => {
      if (selectedCategory !== "All" && item.category !== selectedCategory) return false;
      if (selectedStatus !== "All" && item.status !== selectedStatus) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = item.title.toLowerCase().includes(q);
        const matchesPart = item.participantOrAccount.toLowerCase().includes(q);
        const matchesOrg = item.organizer.toLowerCase().includes(q);
        const matchesLoc = item.location.toLowerCase().includes(q);
        if (!matchesTitle && !matchesPart && !matchesOrg && !matchesLoc) return false;
      }
      return true;
    });
  }, [schedules, selectedCategory, selectedStatus, searchQuery]);

  // Calendar Grid Calculations (Days of Month)
  const calendarGridDays = useMemo(() => {
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    const startDayOfWeek = firstDayOfMonth.getDay(); // 0 = Sun
    const totalDaysInMonth = lastDayOfMonth.getDate();

    const days: Array<{ dateStr: string; dayNum: number; isCurrentMonth: boolean; isToday: boolean }> = [];

    // Previous month padding days
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      const prevDate = new Date(year, month - 1, prevMonthLastDay - i);
      const mm = String(prevDate.getMonth() + 1).padStart(2, "0");
      const dd = String(prevDate.getDate()).padStart(2, "0");
      const dateStr = `${prevDate.getFullYear()}-${mm}-${dd}`;
      days.push({ dateStr, dayNum: prevDate.getDate(), isCurrentMonth: false, isToday: false });
    }

    // Current month days
    for (let d = 1; d <= totalDaysInMonth; d++) {
      const mm = String(month + 1).padStart(2, "0");
      const dd = String(d).padStart(2, "0");
      const dateStr = `${year}-${mm}-${dd}`;
      const isToday = dateStr === "2026-07-29";
      days.push({ dateStr, dayNum: d, isCurrentMonth: true, isToday });
    }

    // Next month padding days to complete 35 or 42 grid cells
    const targetLength = days.length <= 35 ? 35 : 42;
    const fillNeeded = targetLength - days.length;

    for (let i = 1; i <= fillNeeded; i++) {
      const nextDate = new Date(year, month + 1, i);
      const mm = String(nextDate.getMonth() + 1).padStart(2, "0");
      const dd = String(i).padStart(2, "0");
      const dateStr = `${nextDate.getFullYear()}-${mm}-${dd}`;
      days.push({ dateStr, dayNum: i, isCurrentMonth: false, isToday: false });
    }

    return days;
  }, [year, month]);

  // Open Form to Add New Event
  const handleAddNewForDate = (dateStr?: string) => {
    const defaultDate = dateStr || "2026-07-29";
    setEditingSchedule({
      id: `sched-${Date.now()}`,
      title: "",
      category: "Talent Acquisition",
      date: defaultDate,
      startTime: "09:00",
      endTime: "10:00",
      location: "Main Recruitment Hub & MS Teams",
      organizer: userEmail.includes("batacan") ? "Alena Batacan (Operations Director)" : "Sarah Jenkins (TA Specialist)",
      participantOrAccount: "Telecom & Tech Cluster",
      status: "Scheduled",
      priority: "Medium",
      notes: ""
    });
    setIsFormOpen(true);
  };

  // Open Form to Edit Existing
  const handleEditClick = (sched: ScheduleItem) => {
    setEditingSchedule({ ...sched });
    setIsFormOpen(true);
  };

  // Save Event
  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSchedule || !editingSchedule.title.trim()) return;

    const updated: ScheduleItem = {
      ...editingSchedule,
      updatedAt: new Date().toISOString().split("T")[0]
    };

    onSaveSchedule(updated);
    setIsFormOpen(false);
    showToast(`Schedule "${updated.title}" successfully saved!`);
  };

  // Quick Reschedule Action
  const handleQuickReschedule = (sched: ScheduleItem, daysToAdd: number) => {
    const [y, m, d] = sched.date.split("-").map(Number);
    const dateObj = new Date(y, m - 1, d + daysToAdd);
    const newY = dateObj.getFullYear();
    const newM = String(dateObj.getMonth() + 1).padStart(2, "0");
    const newD = String(dateObj.getDate()).padStart(2, "0");
    const newDateStr = `${newY}-${newM}-${newD}`;

    const updated: ScheduleItem = {
      ...sched,
      date: newDateStr,
      status: "Rescheduled",
      updatedAt: new Date().toISOString().split("T")[0]
    };

    onSaveSchedule(updated);
    showToast(`Rescheduled "${sched.title}" to ${newDateStr}!`);
  };

  // Helper color tags matching SiBS palette
  const getCategoryBadgeStyle = (category: ScheduleCategory) => {
    switch (category) {
      case "Talent Acquisition":
        return "bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100/80";
      case "Human Resources":
        return "bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100/80";
      case "Training & Onboarding":
        return "bg-amber-50 text-amber-900 border-amber-200 hover:bg-amber-100/80";
      case "Operations & WFM":
        return "bg-[#E9F0FC] text-[#042C51] border-blue-200 hover:bg-blue-100/80";
      default:
        return "bg-[#F1F5F9] text-[#101828] border-[#E6ECF2]";
    }
  };

  const getStatusBadgeStyle = (status: ScheduleStatus) => {
    switch (status) {
      case "Scheduled":
        return "bg-[#E9F0FC] text-[#042C51] border-[#4B9DFE]/40 font-semibold";
      case "In Progress":
        return "bg-emerald-50 text-emerald-700 border-emerald-300 font-extrabold animate-pulse";
      case "Completed":
        return "bg-[#F1F5F9] text-[#667085] border-[#E6ECF2] line-through font-medium";
      case "Rescheduled":
        return "bg-amber-50 text-[#FF5C28] border-amber-200 font-extrabold";
      case "Cancelled":
        return "bg-rose-50 text-rose-700 border-rose-200 line-through font-medium";
      default:
        return "bg-[#F1F5F9] text-[#667085]";
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-[#042C51]/80 backdrop-blur-xs overflow-y-auto">
        {/* Modal Container */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.97, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.97, y: 12 }}
          transition={{ duration: 0.18 }}
          className="bg-white w-full max-w-5xl rounded-2xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden my-auto"
        >
          {/* Header in Enterprise SiBS Navy */}
          <div className="px-6 py-3 bg-[#042C51] text-white flex items-center justify-between border-b border-slate-800 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-white/10 text-white flex items-center justify-center border border-white/10 shadow-xs shrink-0">
                <CalendarIcon className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10.5px] font-semibold text-slate-300 tracking-wide">
                    HRIS Operational Workspace
                  </span>
                  <span className="text-slate-500">•</span>
                  <span className="flex items-center gap-1.5 text-[10.5px] font-medium text-emerald-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Synchronized
                  </span>
                </div>
                <h2 className="text-base sm:text-lg font-bold text-white tracking-tight mt-0.5">
                  HR & Talent Acquisition Calendar
                </h2>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {isGoogleConnected && (
                <>
                  {/* Sync Button */}
                  <button
                    onClick={() => showToast("Google Calendar synced in real-time.")}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/15 text-white text-xs font-semibold rounded-lg border border-white/15 shadow-2xs transition-all active:scale-95 cursor-pointer"
                    title="Sync Calendar"
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-slate-200" />
                    <span>Sync</span>
                  </button>

                  {/* Disconnect Button (Refined Enterprise Red Ghost Style) */}
                  <button
                    onClick={handleGoogleDisconnect}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-500/15 hover:bg-rose-500/25 text-rose-200 hover:text-rose-100 text-xs font-semibold rounded-lg border border-rose-400/30 transition-all active:scale-95 cursor-pointer"
                    title="Disconnect Google Account"
                  >
                    <LogOut className="w-3.5 h-3.5 text-rose-300" />
                    <span>Disconnect</span>
                  </button>

                  {/* New Schedule Button */}
                  <button
                    onClick={() => handleAddNewForDate()}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#FF5C28] hover:bg-[#E04B1C] active:scale-95 text-white text-xs font-semibold rounded-lg shadow-sm transition-all cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span className="hidden sm:inline">New Schedule</span>
                  </button>
                </>
              )}

              <button
                onClick={onClose}
                className="p-1.5 text-slate-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer ml-1"
                title="Close Calendar"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Toast Message Popup */}
          <AnimatePresence>
            {toastMessage && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-[#042C51] text-white text-xs font-bold px-5 py-2.5 flex items-center justify-between border-b border-blue-400/30 shrink-0"
              >
                <span className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#2ECC71]" />
                  {toastMessage}
                </span>
                <button onClick={() => setToastMessage(null)} className="text-slate-300 hover:text-white cursor-pointer">
                  <X className="w-3.5 h-3.5" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* IF NOT CONNECTED: ELEGANT SLEEK GOOGLE LOGIN DESIGN */}
          {!isGoogleConnected ? (
            <div className="flex-1 overflow-y-auto p-6 sm:p-12 flex flex-col items-center justify-center bg-slate-50/70">
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className="max-w-lg w-full bg-white rounded-2xl border border-[#E6ECF2] p-8 shadow-lg text-center space-y-6"
              >
                {/* Header Badge & Icon */}
                <div className="flex flex-col items-center space-y-3">
                  <div className="w-16 h-16 rounded-2xl bg-[#E9F0FC] border border-blue-100 flex items-center justify-center text-[#042C51] shadow-xs">
                    <CalendarIcon className="w-8 h-8 text-[#042C51]" />
                  </div>
                  
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-900 text-[11px] font-bold tracking-wide">
                    <Lock className="w-3.5 h-3.5 text-amber-700" />
                    Google Calendar Access Required
                  </span>
                </div>

                {/* Title & Copy */}
                <div className="space-y-2">
                  <h3 className="text-xl font-black text-[#042C51] tracking-tight">
                    Connect Google Workspace
                  </h3>
                  <p className="text-xs text-[#667085] leading-relaxed max-w-sm mx-auto font-medium">
                    To view and synchronize live HR & Talent Acquisition schedules, please authenticate with your organization's Google account.
                  </p>
                </div>

                {/* Action Button */}
                <div className="pt-2 space-y-3">
                  <button
                    onClick={handleGoogleConnect}
                    disabled={isConnecting}
                    className="w-full py-3 px-5 bg-white hover:bg-slate-50 text-[#042C51] font-bold text-xs sm:text-sm rounded-xl border border-slate-300 shadow-sm hover:shadow transition-all flex items-center justify-center gap-3 cursor-pointer group active:scale-[0.99] disabled:opacity-70"
                  >
                    {isConnecting ? (
                      <>
                        <RefreshCw className="w-4 h-4 text-[#042C51] animate-spin" />
                        <span>Authenticating Account...</span>
                      </>
                    ) : (
                      <>
                        <GoogleGIcon />
                        <span className="font-bold text-[#101828] group-hover:text-[#FF5C28] transition-colors">
                          Sign in with Google
                        </span>
                      </>
                    )}
                  </button>
                </div>

                {/* Feature Pills */}
                <div className="pt-4 border-t border-[#E6ECF2] flex flex-wrap items-center justify-center gap-2 text-[10.5px] font-semibold text-[#667085]">
                  <span className="flex items-center gap-1 px-2.5 py-1 bg-[#F1F5F9] rounded-lg border border-[#E6ECF2]">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    OAuth 2.0 Secure
                  </span>
                  <span className="flex items-center gap-1 px-2.5 py-1 bg-[#F1F5F9] rounded-lg border border-[#E6ECF2]">
                    <Video className="w-3.5 h-3.5 text-blue-600" />
                    Meet & Teams Links
                  </span>
                  <span className="flex items-center gap-1 px-2.5 py-1 bg-[#F1F5F9] rounded-lg border border-[#E6ECF2]">
                    <BellRing className="w-3.5 h-3.5 text-[#FF5C28]" />
                    Real-Time Sync
                  </span>
                </div>
              </motion.div>
            </div>
          ) : (
            <>
              {/* IF GOOGLE IS CONNECTED: TOOLBAR & CALENDAR DISPLAY */}
              <div className="px-5 py-3 bg-white border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs shrink-0">
                {/* Month & Navigation */}
                <div className="flex items-center gap-3">
                  <div className="flex items-center bg-slate-100 border border-slate-200 rounded-lg overflow-hidden shadow-2xs">
                    <button 
                      onClick={handlePrevMonth} 
                      className="p-1.5 hover:bg-white text-slate-700 transition-colors cursor-pointer border-r border-slate-200"
                      title="Previous Month"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={handleToday}
                      className="px-3 py-1 font-semibold text-slate-800 hover:bg-white transition-colors cursor-pointer text-[11px]"
                    >
                      Today
                    </button>
                    <button 
                      onClick={handleNextMonth} 
                      className="p-1.5 hover:bg-white text-slate-700 transition-colors cursor-pointer border-l border-slate-200"
                      title="Next Month"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>

                  <span className="font-bold text-sm text-[#042C51] tracking-tight">
                    {monthYearLabel}
                  </span>
                </div>

                {/* Middle: Search & Filter controls */}
                <div className="flex flex-wrap items-center gap-2">
                  {/* Category Filter */}
                  <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 focus-within:bg-white focus-within:border-slate-400">
                    <Tag className="w-3.5 h-3.5 text-slate-400" />
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="bg-transparent font-medium text-slate-800 focus:outline-none cursor-pointer text-xs"
                    >
                      <option value="All">All Categories</option>
                      {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>

                  {/* Status Filter */}
                  <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 focus-within:bg-white focus-within:border-slate-400">
                    <Filter className="w-3.5 h-3.5 text-slate-400" />
                    <select
                      value={selectedStatus}
                      onChange={(e) => setSelectedStatus(e.target.value)}
                      className="bg-transparent font-medium text-slate-800 focus:outline-none cursor-pointer text-xs"
                    >
                      <option value="All">All Statuses</option>
                      {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>

                  {/* Search Box */}
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                    <input
                      type="text"
                      placeholder="Filter schedules..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:outline-none focus:bg-white focus:border-[#042C51] w-36 sm:w-44 transition-all"
                    />
                  </div>
                </div>

                {/* View Mode Switcher */}
                <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200">
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`flex items-center gap-1 px-3 py-1 rounded-md text-[11px] font-semibold transition-all cursor-pointer ${
                      viewMode === "grid" ? "bg-[#042C51] text-white shadow-2xs" : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    <Grid className="w-3.5 h-3.5" />
                    <span>Month</span>
                  </button>
                  <button
                    onClick={() => setViewMode("week")}
                    className={`flex items-center gap-1 px-3 py-1 rounded-md text-[11px] font-semibold transition-all cursor-pointer ${
                      viewMode === "week" ? "bg-[#042C51] text-white shadow-2xs" : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    <CalendarIcon className="w-3.5 h-3.5" />
                    <span>Week</span>
                  </button>
                  <button
                    onClick={() => setViewMode("agenda")}
                    className={`flex items-center gap-1 px-3 py-1 rounded-md text-[11px] font-semibold transition-all cursor-pointer ${
                      viewMode === "agenda" ? "bg-[#042C51] text-white shadow-2xs" : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    <List className="w-3.5 h-3.5" />
                    <span>Agenda</span>
                  </button>
                </div>
              </div>

              {/* Main Calendar Body */}
              <div className="flex-1 overflow-y-auto p-4 min-h-[420px] scrollbar-thin">
                {/* VIEW MODE 1: MONTH GRID VIEW */}
                {viewMode === "grid" && (
                  <div className="bg-white border border-[#E6ECF2] rounded-2xl shadow-xs overflow-hidden">
                    {/* Day of Week Header */}
                    <div className="grid grid-cols-7 bg-[#042C51] text-white text-center font-extrabold text-[10px] tracking-wider py-2.5">
                      <div>SUN</div>
                      <div>MON</div>
                      <div>TUE</div>
                      <div>WED</div>
                      <div>THU</div>
                      <div>FRI</div>
                      <div>SAT</div>
                    </div>

                    {/* Grid Cells */}
                    <div className="grid grid-cols-7 auto-rows-fr gap-px bg-[#E6ECF2]">
                      {calendarGridDays.map((cell, idx) => {
                        const dayEvents = filteredSchedules.filter(s => s.date === cell.dateStr);
                        const isHighlighted = cell.isToday || cell.dateStr === "2026-07-31";

                        return (
                          <div
                            key={`${cell.dateStr}-${idx}`}
                            className={`min-h-[105px] p-2 flex flex-col justify-between transition-colors ${
                              cell.isCurrentMonth ? "bg-white" : "bg-[#F1F5F9]/50 text-[#667085]"
                            } ${isHighlighted ? "border-2 border-[#FF5C28] bg-white relative z-10 shadow-xs" : ""}`}
                          >
                            {/* Day Cell Header */}
                            <div className="flex items-center justify-between">
                              <span 
                                className={`text-[11px] font-black w-6 h-6 flex items-center justify-center rounded-full ${
                                  isHighlighted 
                                    ? "bg-[#FF5C28] text-white shadow-xs" 
                                    : cell.isCurrentMonth ? "text-[#101828]" : "text-[#667085]"
                                }`}
                              >
                                {cell.dayNum}
                              </span>

                              <button
                                onClick={() => handleAddNewForDate(cell.dateStr)}
                                className="opacity-0 hover:opacity-100 text-slate-400 hover:text-[#FF5C28] p-0.5 rounded transition-all cursor-pointer"
                                title={`Add Schedule on ${cell.dateStr}`}
                              >
                                <Plus className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            {/* List of Events in Date Cell */}
                            <div className="mt-1 flex-1 flex flex-col gap-1 overflow-hidden">
                              {dayEvents.slice(0, 3).map(event => (
                                <div
                                  key={event.id}
                                  onClick={() => handleEditClick(event)}
                                  className="p-1.5 rounded-lg border border-[#CDE0FC] bg-[#E9F0FC] hover:bg-[#D8E7FD] text-[#042C51] text-[10px] leading-tight font-extrabold cursor-pointer transition-all shadow-2xs truncate"
                                  title={`${event.title} (${event.startTime} - ${event.endTime}) - Click to Edit / Reschedule`}
                                >
                                  <div className="truncate">
                                    {event.startTime} - {event.title}
                                  </div>
                                </div>
                              ))}

                              {dayEvents.length > 3 && (
                                <button
                                  onClick={() => {
                                    setViewMode("agenda");
                                    setSearchQuery(cell.dateStr);
                                  }}
                                  className="text-[9px] font-extrabold text-[#FF5C28] hover:underline text-left pt-0.5 cursor-pointer"
                                >
                                  +{dayEvents.length - 3} more schedule(s)
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* VIEW MODE 2: WEEK VIEW */}
                {viewMode === "week" && (
                  <div className="bg-white border border-[#E6ECF2] rounded-2xl p-4 shadow-xs space-y-4">
                    <div className="flex items-center justify-between border-b border-[#E6ECF2] pb-3">
                      <h3 className="font-extrabold text-[#042C51] text-xs flex items-center gap-2">
                        <CalendarDays className="w-4 h-4 text-[#FF5C28]" />
                        <span>7-Day Operational HR & TA Weekly Schedule View</span>
                      </h3>
                      <span className="text-[11px] font-semibold text-[#667085]">
                        Active Week Window
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
                      {[0, 1, 2, 3, 4, 5, 6].map(offset => {
                        const d = new Date(year, month, currentDate.getDate() - currentDate.getDay() + offset);
                        const mm = String(d.getMonth() + 1).padStart(2, "0");
                        const dd = String(d.getDate()).padStart(2, "0");
                        const dateStr = `${d.getFullYear()}-${mm}-${dd}`;
                        const dayEvents = filteredSchedules.filter(s => s.date === dateStr);
                        const isToday = dateStr === "2026-07-29";

                        return (
                          <div key={dateStr} className={`border rounded-xl p-2.5 flex flex-col gap-2 min-h-[240px] ${isToday ? "border-[#FF5C28] bg-orange-50/10 ring-1 ring-[#FF5C28]" : "border-[#E6ECF2] bg-[#F1F5F9]/30"}`}>
                            <div className="flex items-center justify-between border-b border-[#E6ECF2] pb-1.5">
                              <span className={`font-black text-xs ${isToday ? "text-[#FF5C28]" : "text-[#042C51]"}`}>
                                {d.toLocaleDateString("en-US", { weekday: "short", day: "numeric" })}
                              </span>
                              <button 
                                onClick={() => handleAddNewForDate(dateStr)}
                                className="p-1 hover:bg-[#E9F0FC] rounded text-[#042C51] transition-colors cursor-pointer"
                                title="Add schedule"
                              >
                                <Plus className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            <div className="flex-1 space-y-1.5 overflow-y-auto max-h-[260px] scrollbar-thin">
                              {dayEvents.length === 0 ? (
                                <div className="text-[10px] text-[#667085] italic text-center py-6">No events scheduled</div>
                              ) : (
                                dayEvents.map(event => (
                                  <div
                                    key={event.id}
                                    onClick={() => handleEditClick(event)}
                                    className={`p-2 rounded-xl border text-[10px] space-y-1 cursor-pointer transition-all shadow-2xs hover:shadow-md ${getCategoryBadgeStyle(event.category)}`}
                                  >
                                    <div className="font-extrabold text-[10.5px] leading-tight text-[#101828]">
                                      {event.title}
                                    </div>
                                    <div className="flex items-center gap-1 text-[9.5px] font-semibold text-[#667085]">
                                      <Clock className="w-3 h-3 text-[#FF5C28]" />
                                      <span>{event.startTime} - {event.endTime}</span>
                                    </div>
                                    <div className="text-[9px] text-[#667085] truncate">
                                      {event.participantOrAccount}
                                    </div>
                                    <div className="flex items-center justify-between pt-1 border-t border-[#E6ECF2]">
                                      <span className={`px-1.5 py-0.2 rounded border text-[8.5px] ${getStatusBadgeStyle(event.status)}`}>
                                        {event.status}
                                      </span>
                                      <span className="text-[8.5px] text-[#FF5C28] font-bold">Edit</span>
                                    </div>
                                  </div>
                                ))
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* VIEW MODE 3: AGENDA LIST VIEW */}
                {viewMode === "agenda" && (
                  <div className="bg-white border border-[#E6ECF2] rounded-2xl p-4 shadow-xs space-y-3">
                    <div className="flex items-center justify-between border-b border-[#E6ECF2] pb-3">
                      <div className="flex items-center gap-2">
                        <List className="w-4 h-4 text-[#042C51]" />
                        <h3 className="font-extrabold text-[#042C51] text-xs">Agenda Schedule Directory ({filteredSchedules.length} Items)</h3>
                      </div>
                      <span className="text-[11px] font-semibold text-[#667085]">Chronological View</span>
                    </div>

                    {filteredSchedules.length === 0 ? (
                      <div className="py-12 text-center text-[#667085] text-xs space-y-2">
                        <CalendarIcon className="w-8 h-8 mx-auto text-slate-300" />
                        <p className="font-bold text-[#101828]">No schedules match your selected filters or search query.</p>
                        <button 
                          onClick={() => { setSelectedCategory("All"); setSelectedStatus("All"); setSearchQuery(""); }}
                          className="px-3 py-1 bg-[#F1F5F9] hover:bg-[#E6ECF2] text-[#042C51] rounded-lg text-xs font-bold transition-all cursor-pointer"
                        >
                          Clear Filters
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-2.5">
                        {filteredSchedules.map((item) => (
                          <div 
                            key={item.id}
                            className="p-3.5 border border-[#E6ECF2] hover:border-[#042C51]/30 rounded-xl bg-white shadow-2xs hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-3"
                          >
                            <div className="flex items-start gap-3.5">
                              {/* Date Badge */}
                              <div className="w-14 h-14 rounded-xl bg-[#042C51] text-white flex flex-col items-center justify-center shrink-0 shadow-xs border border-[#042C51]">
                                <span className="text-[9px] font-extrabold uppercase tracking-wider text-slate-300">
                                  {new Date(item.date + "T00:00:00").toLocaleDateString("en-US", { month: "short" })}
                                </span>
                                <span className="text-lg font-black leading-none text-white">
                                  {item.date.split("-")[2]}
                                </span>
                              </div>

                              {/* Item Details */}
                              <div className="space-y-1">
                                <div className="flex flex-wrap items-center gap-2">
                                  <span className={`px-2 py-0.5 rounded-md border text-[10px] font-extrabold ${getCategoryBadgeStyle(item.category)}`}>
                                    {item.category}
                                  </span>
                                  <span className={`px-2 py-0.5 rounded-md border text-[10px] font-bold ${getStatusBadgeStyle(item.status)}`}>
                                    {item.status}
                                  </span>
                                  <span className="text-xs font-bold text-[#042C51] flex items-center gap-1">
                                    <Clock className="w-3.5 h-3.5 text-[#FF5C28]" />
                                    {item.startTime} - {item.endTime}
                                  </span>
                                </div>

                                <h4 className="font-black text-sm text-[#101828]">
                                  {item.title}
                                </h4>

                                <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-[#667085] font-medium">
                                  <span className="flex items-center gap-1">
                                    <Users className="w-3.5 h-3.5 text-[#042C51]" />
                                    <strong className="text-[#101828]">Account:</strong> {item.participantOrAccount}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <User className="w-3.5 h-3.5 text-[#042C51]" />
                                    <strong className="text-[#101828]">Host:</strong> {item.organizer}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <MapPin className="w-3.5 h-3.5 text-[#FF5C28]" />
                                    {item.location}
                                  </span>
                                </div>

                                {item.notes && (
                                  <p className="text-[11px] text-[#667085] italic bg-[#F1F5F9] p-2 rounded-lg border border-[#E6ECF2] mt-1.5">
                                    "{item.notes}"
                                  </p>
                                )}
                              </div>
                            </div>

                            {/* Quick Actions */}
                            <div className="flex flex-wrap items-center gap-2 border-t md:border-t-0 pt-2 md:pt-0 shrink-0">
                              <button
                                onClick={() => handleQuickReschedule(item, 1)}
                                className="px-2.5 py-1.5 bg-[#F1F5F9] hover:bg-[#E6ECF2] text-[#042C51] rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                                title="Move schedule forward by 1 day"
                              >
                                <RotateCcw className="w-3.5 h-3.5 text-[#FF5C28]" />
                                <span>+1 Day</span>
                              </button>

                              <button
                                onClick={() => handleQuickReschedule(item, 7)}
                                className="px-2.5 py-1.5 bg-[#F1F5F9] hover:bg-[#E6ECF2] text-[#042C51] rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                                title="Move schedule forward by 1 week"
                              >
                                <ArrowRight className="w-3.5 h-3.5 text-[#FF5C28]" />
                                <span>+1 Wk</span>
                              </button>

                              <button
                                onClick={() => handleEditClick(item)}
                                className="px-3 py-1.5 bg-[#042C51] hover:bg-[#063a6a] text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1 shadow-xs cursor-pointer"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                                <span>Edit / Resched</span>
                              </button>

                              <button
                                onClick={() => {
                                  if (window.confirm(`Are you sure you want to remove schedule "${item.title}"?`)) {
                                    onDeleteSchedule(item.id);
                                    showToast("Schedule deleted.");
                                  }
                                }}
                                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all cursor-pointer"
                                title="Delete Schedule"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </>
          )}

          {/* Footer Summary Bar */}
          <div className="px-6 py-3 bg-white border-t border-[#E6ECF2] flex flex-col sm:flex-row items-center justify-between text-xs text-[#667085] gap-2 shrink-0">
            <div className="flex items-center gap-3">
              <span className="font-extrabold text-[#101828]">
                {isGoogleConnected ? (
                  <>Google Calendar Events: <strong>{schedules.length}</strong></>
                ) : (
                  <>Google Account Status: <strong className="text-amber-600">Not Connected</strong></>
                )}
              </span>
              {isGoogleConnected && (
                <>
                  <span className="text-slate-300">|</span>
                  <span className="text-[#667085]">
                    TA Drives: <strong className="text-[#042C51]">{schedules.filter(s => s.category === "Talent Acquisition").length}</strong>
                  </span>
                  <span className="text-slate-300">|</span>
                  <span className="text-[#667085]">
                    HR Syncs: <strong className="text-[#042C51]">{schedules.filter(s => s.category === "Human Resources").length}</strong>
                  </span>
                </>
              )}
            </div>

            <div className="text-[11px] text-[#667085] font-medium flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-slate-500" />
              <span>Click any schedule block to edit or reschedule timelines.</span>
            </div>
          </div>
        </motion.div>

        {/* SUBMODAL FORM FOR EDITING / CREATING SCHEDULE (OFFICIAL GOOGLE CALENDAR EVENT CREATION POPUP) */}
        <AnimatePresence>
          {isFormOpen && editingSchedule && (
            <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 15 }}
                className="bg-white text-[#101828] w-full max-w-[520px] rounded-3xl shadow-2xl overflow-hidden flex flex-col font-sans"
              >
                {/* Top Drag Handle & Close */}
                <div className="px-6 pt-5 pb-2 flex items-center justify-between text-[#667085]">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-1 bg-[#FF5C28] rounded-full" />
                    <span className="text-[10px] font-extrabold text-[#042C51] uppercase tracking-wider">
                      Google Calendar Event
                    </span>
                  </div>
                  <button 
                    type="button" 
                    onClick={() => setIsFormOpen(false)} 
                    className="p-1.5 hover:bg-[#F1F5F9] rounded-full text-[#667085] hover:text-[#042C51] transition-colors cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleSaveForm} className="px-6 pb-6 pt-2 space-y-4 text-xs">
                  {/* Title & Underline Input */}
                  <div className="space-y-1">
                    <input
                      type="text"
                      required
                      value={editingSchedule.title}
                      onChange={(e) => setEditingSchedule({ ...editingSchedule, title: e.target.value })}
                      placeholder={
                        eventType === "task" 
                          ? "Add title" 
                          : eventType === "ooo" 
                          ? "Out of office" 
                          : "Add title and time"
                      }
                      className="w-full bg-transparent text-xl font-bold text-[#042C51] placeholder-[#98A2B3] focus:outline-none border-b-2 border-[#E6ECF2] focus:border-[#FF5C28] pb-2 transition-colors"
                    />
                  </div>

                  {/* Event / Task / Out of Office Tabs */}
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setEventType("event")}
                      className={`px-4 py-1.5 font-bold rounded-lg text-xs transition-all cursor-pointer ${
                        eventType === "event"
                          ? "bg-[#042C51] text-white shadow-xs border border-[#042C51]"
                          : "text-[#667085] hover:bg-[#F1F5F9] font-semibold border border-transparent"
                      }`}
                    >
                      Event
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setEventType("task");
                        if (!editingSchedule.title || editingSchedule.title === "Out of office") {
                          setEditingSchedule({ ...editingSchedule, title: "" });
                        }
                      }}
                      className={`px-4 py-1.5 font-bold rounded-lg text-xs transition-all cursor-pointer ${
                        eventType === "task"
                          ? "bg-[#042C51] text-white shadow-xs border border-[#042C51]"
                          : "text-[#667085] hover:bg-[#F1F5F9] font-semibold border border-transparent"
                      }`}
                    >
                      Task
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setEventType("ooo");
                        if (!editingSchedule.title || editingSchedule.title === "Add title" || editingSchedule.title === "") {
                          setEditingSchedule({ ...editingSchedule, title: "Out of office" });
                        }
                      }}
                      className={`px-4 py-1.5 font-bold rounded-lg text-xs transition-all cursor-pointer ${
                        eventType === "ooo"
                          ? "bg-[#042C51] text-white shadow-xs border border-[#042C51]"
                          : "text-[#667085] hover:bg-[#F1F5F9] font-semibold border border-transparent"
                      }`}
                    >
                      Out of office
                    </button>
                  </div>

                  {/* FORM BODY DEPENDING ON SELECTED TAB */}
                  {eventType === "event" && (
                    <div className="space-y-3.5 pt-2">
                      {/* Time & Date Row */}
                      <div className="flex items-start gap-3.5">
                        <Clock className="w-5 h-5 text-[#FF5C28] mt-1 shrink-0" />
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center justify-between gap-2 flex-wrap">
                            <div className="flex items-center gap-2 text-sm text-[#101828] font-bold">
                              <input
                                type="date"
                                required
                                value={editingSchedule.date}
                                onChange={(e) => setEditingSchedule({ ...editingSchedule, date: e.target.value })}
                                className="bg-[#F1F5F9] border border-[#E6ECF2] text-[#042C51] focus:outline-none focus:border-[#042C51] rounded-lg px-2.5 py-1 cursor-pointer font-bold text-xs"
                              />
                            </div>

                            {/* Time Inputs / Add Time Pill */}
                            <div className="flex items-center gap-1.5 bg-[#F1F5F9] px-3 py-1 rounded-full border border-[#E6ECF2]">
                              <input
                                type="text"
                                value={editingSchedule.startTime}
                                onChange={(e) => setEditingSchedule({ ...editingSchedule, startTime: e.target.value })}
                                className="w-16 bg-transparent text-[#042C51] text-xs font-extrabold text-center focus:outline-none"
                                placeholder="09:00 AM"
                              />
                              <span className="text-[#98A2B3]">–</span>
                              <input
                                type="text"
                                value={editingSchedule.endTime}
                                onChange={(e) => setEditingSchedule({ ...editingSchedule, endTime: e.target.value })}
                                className="w-16 bg-transparent text-[#042C51] text-xs font-extrabold text-center focus:outline-none"
                                placeholder="10:00 AM"
                              />
                            </div>
                          </div>

                          <div className="flex items-center justify-between text-[11px] text-[#667085]">
                            <span className="font-medium">Does not repeat</span>
                            <div className="flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => {
                                  const [y, m, d] = editingSchedule.date.split("-").map(Number);
                                  const dt = new Date(y, m - 1, d + 1);
                                  const mm = String(dt.getMonth() + 1).padStart(2, "0");
                                  const dd = String(dt.getDate()).padStart(2, "0");
                                  setEditingSchedule({ ...editingSchedule, date: `${dt.getFullYear()}-${mm}-${dd}`, status: "Rescheduled" });
                                }}
                                className="px-2 py-0.5 bg-[#E9F0FC] hover:bg-[#D8E7FD] text-[#042C51] rounded border border-[#CDE0FC] text-[10px] font-bold cursor-pointer transition-colors"
                              >
                                +1 Day
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  const [y, m, d] = editingSchedule.date.split("-").map(Number);
                                  const dt = new Date(y, m - 1, d + 7);
                                  const mm = String(dt.getMonth() + 1).padStart(2, "0");
                                  const dd = String(dt.getDate()).padStart(2, "0");
                                  setEditingSchedule({ ...editingSchedule, date: `${dt.getFullYear()}-${mm}-${dd}`, status: "Rescheduled" });
                                }}
                                className="px-2 py-0.5 bg-[#E9F0FC] hover:bg-[#D8E7FD] text-[#042C51] rounded border border-[#CDE0FC] text-[10px] font-bold cursor-pointer transition-colors"
                              >
                                +1 Week
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Add Google Meet Video Conferencing Row */}
                      <div className="flex items-center gap-3.5">
                        <Video className="w-5 h-5 text-amber-500 shrink-0" />
                        <button
                          type="button"
                          onClick={() => {
                            setEditingSchedule({ ...editingSchedule, location: "Google Meet: https://meet.google.com/sibs-hr-sync" });
                            showToast("Google Meet video link attached!");
                          }}
                          className="text-xs text-[#042C51] hover:text-[#FF5C28] font-bold transition-colors cursor-pointer flex items-center gap-1.5"
                        >
                          {editingSchedule.location.includes("meet.google.com") ? (
                            <span className="text-[#042C51] font-bold underline">Google Meet link attached</span>
                          ) : (
                            <span>Add Google Meet video conferencing</span>
                          )}
                        </button>
                      </div>

                      {/* Add Location Row */}
                      <div className="flex items-center gap-3.5">
                        <MapPin className="w-5 h-5 text-[#042C51] shrink-0" />
                        <input
                          type="text"
                          value={editingSchedule.location}
                          onChange={(e) => setEditingSchedule({ ...editingSchedule, location: e.target.value })}
                          placeholder="Add location"
                          className="w-full bg-transparent text-[#101828] placeholder-[#98A2B3] focus:outline-none text-xs border-b border-[#E6ECF2] focus:border-[#042C51] py-1 font-medium"
                        />
                      </div>

                      {/* Add Description Row */}
                      <div className="flex items-start gap-3.5">
                        <AlignLeft className="w-5 h-5 text-[#042C51] mt-1 shrink-0" />
                        <textarea
                          rows={2}
                          value={editingSchedule.notes || ""}
                          onChange={(e) => setEditingSchedule({ ...editingSchedule, notes: e.target.value })}
                          placeholder="Add description or a Google Drive attachment"
                          className="w-full bg-transparent text-[#101828] placeholder-[#98A2B3] focus:outline-none text-xs border-b border-[#E6ECF2] focus:border-[#042C51] resize-none font-medium"
                        />
                      </div>

                      {/* Calendar Owner Indicator Row & Color Picker */}
                      <div className="flex items-start gap-3.5 pt-1">
                        <CalendarIcon className="w-5 h-5 text-[#042C51] mt-1 shrink-0" />
                        <div className="flex-1 min-w-0 space-y-2">
                          {/* Owner & Color Row */}
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-bold text-[#101828]">HR & TA Workspace</span>
                            <div className="flex items-center bg-[#F1F5F9] border border-[#E6ECF2] rounded-xl px-2.5 py-1">
                              <span className="w-3.5 h-3.5 rounded-full mr-1.5 shrink-0" style={{ backgroundColor: eventColor }} />
                              <select
                                value={eventColor}
                                onChange={(e) => setEventColor(e.target.value)}
                                className="bg-transparent text-xs font-bold text-[#042C51] focus:outline-none cursor-pointer"
                              >
                                <option value="#039BE5">Peacock Blue</option>
                                <option value="#7986CB">Lavender</option>
                                <option value="#33B679">Sage Green</option>
                                <option value="#8E24AA">Grape Purple</option>
                                <option value="#E67C73">Flamingo Pink</option>
                                <option value="#F6BF26">Banana Yellow</option>
                                <option value="#F4511E">Tangerine Orange</option>
                                <option value="#0B8043">Basil Green</option>
                              </select>
                            </div>
                          </div>

                          {/* Category & Status Quick Selectors */}
                          <div className="flex items-center gap-2 flex-wrap">
                            <select
                              value={editingSchedule.category}
                              onChange={(e) => setEditingSchedule({ ...editingSchedule, category: e.target.value as ScheduleCategory })}
                              className="bg-[#F1F5F9] text-[#042C51] font-bold text-xs px-2.5 py-1.5 rounded-xl border border-[#E6ECF2] focus:outline-none focus:border-[#042C51] cursor-pointer"
                            >
                              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                            <select
                              value={editingSchedule.status}
                              onChange={(e) => setEditingSchedule({ ...editingSchedule, status: e.target.value as ScheduleStatus })}
                              className="bg-[#F1F5F9] text-[#042C51] font-bold text-xs px-2.5 py-1.5 rounded-xl border border-[#E6ECF2] focus:outline-none focus:border-[#042C51] cursor-pointer"
                            >
                              {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                          </div>
                        </div>
                      </div>

                      {/* Availability Row (Briefcase Icon) */}
                      <div className="flex items-center gap-3.5">
                        <Briefcase className="w-5 h-5 text-[#042C51] shrink-0" />
                        <select
                          value={eventAvailability}
                          onChange={(e) => setEventAvailability(e.target.value as "Free" | "Busy")}
                          className="bg-[#F1F5F9] text-[#042C51] font-bold text-xs px-3 py-1.5 rounded-xl border border-[#E6ECF2] focus:outline-none focus:bg-white focus:border-[#042C51] cursor-pointer"
                        >
                          <option value="Free">Free</option>
                          <option value="Busy">Busy</option>
                        </select>
                      </div>

                      {/* Visibility Row (Lock Icon) */}
                      <div className="flex items-center gap-3.5">
                        <Lock className="w-5 h-5 text-[#042C51] shrink-0" />
                        <div className="flex items-center gap-2">
                          <select
                            value={eventVisibility}
                            onChange={(e) => setEventVisibility(e.target.value as any)}
                            className="bg-[#F1F5F9] text-[#042C51] font-bold text-xs px-3 py-1.5 rounded-xl border border-[#E6ECF2] focus:outline-none focus:bg-white focus:border-[#042C51] cursor-pointer"
                          >
                            <option value="Default visibility">Default visibility</option>
                            <option value="Public">Public</option>
                            <option value="Private">Private</option>
                          </select>
                          <HelpCircle className="w-4 h-4 text-[#667085]" />
                        </div>
                      </div>

                      {/* Notification Row (Bell Icon) */}
                      <div className="flex items-center gap-3.5">
                        <Bell className="w-5 h-5 text-[#042C51] shrink-0" />
                        <div className="flex items-center gap-2 flex-wrap">
                          {eventNotifications.map((notif, idx) => (
                            <span key={idx} className="bg-[#E9F0FC] text-[#042C51] text-xs font-bold px-2.5 py-1 rounded-lg border border-[#CDE0FC] flex items-center gap-1.5">
                              {notif}
                              <button
                                type="button"
                                onClick={() => setEventNotifications(eventNotifications.filter((_, i) => i !== idx))}
                                className="hover:text-rose-600 font-bold ml-1 cursor-pointer"
                              >
                                ×
                              </button>
                            </span>
                          ))}
                          <button
                            type="button"
                            onClick={() => {
                              const newTime = eventNotifications.length === 0 ? "10 minutes before" : `${(eventNotifications.length + 1) * 10} minutes before`;
                              setEventNotifications([...eventNotifications, newTime]);
                              showToast(`Notification set for ${newTime}`);
                            }}
                            className="text-xs text-[#042C51] hover:text-[#FF5C28] font-bold transition-colors cursor-pointer"
                          >
                            Add notification
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* TASK TAB FORM (Matches Screenshot 1) */}
                  {eventType === "task" && (
                    <div className="space-y-3.5 pt-2">
                      {/* Time & Date Row */}
                      <div className="flex items-start gap-3.5">
                        <Clock className="w-5 h-5 text-[#FF5C28] mt-1 shrink-0" />
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center justify-between gap-2 flex-wrap">
                            <input
                              type="date"
                              required
                              value={editingSchedule.date}
                              onChange={(e) => setEditingSchedule({ ...editingSchedule, date: e.target.value })}
                              className="bg-[#F1F5F9] border border-[#E6ECF2] text-[#042C51] focus:outline-none focus:border-[#042C51] rounded-lg px-2.5 py-1 cursor-pointer font-bold text-xs"
                            />

                            <button
                              type="button"
                              onClick={() => showToast("Task execution time set.")}
                              className="px-3.5 py-1 bg-[#F1F5F9] hover:bg-[#E6ECF2] text-[#042C51] font-bold rounded-full border border-[#E6ECF2] text-xs transition-colors cursor-pointer"
                            >
                              Add time
                            </button>
                          </div>

                          <div className="text-[11px] text-[#667085] font-medium">
                            Does not repeat
                          </div>
                        </div>
                      </div>

                      {/* Add Deadline Row */}
                      <div className="flex items-center gap-3.5">
                        <Target className="w-5 h-5 text-[#FF5C28] shrink-0" />
                        <input
                          type="text"
                          value={taskDeadline}
                          onChange={(e) => setTaskDeadline(e.target.value)}
                          placeholder="Add deadline"
                          className="w-full bg-transparent text-[#101828] placeholder-[#98A2B3] focus:outline-none text-xs border-b border-[#E6ECF2] focus:border-[#042C51] py-1 font-medium"
                        />
                      </div>

                      {/* Add Description Row */}
                      <div className="flex items-start gap-3.5">
                        <AlignLeft className="w-5 h-5 text-[#042C51] mt-1 shrink-0" />
                        <textarea
                          rows={2}
                          value={editingSchedule.notes || ""}
                          onChange={(e) => setEditingSchedule({ ...editingSchedule, notes: e.target.value })}
                          placeholder="Add description or a Google Drive attachment"
                          className="w-full bg-transparent text-[#101828] placeholder-[#98A2B3] focus:outline-none text-xs border-b border-[#E6ECF2] focus:border-[#042C51] resize-none font-medium"
                        />
                      </div>

                      {/* List Selector Row (e.g. My Tasks) */}
                      <div className="flex items-center gap-3.5">
                        <ListTodo className="w-5 h-5 text-[#042C51] shrink-0" />
                        <select
                          value={taskFolder}
                          onChange={(e) => setTaskFolder(e.target.value)}
                          className="bg-[#F1F5F9] text-[#042C51] font-bold text-xs px-3 py-1.5 rounded-xl border border-[#E6ECF2] focus:outline-none focus:bg-white focus:border-[#042C51] cursor-pointer"
                        >
                          <option value="My Tasks">My Tasks</option>
                          <option value="HR Action Items">HR Action Items</option>
                          <option value="TA Hiring Deadlines">TA Hiring Deadlines</option>
                          <option value="WFM Operations Reviews">WFM Operations Reviews</option>
                        </select>
                      </div>
                    </div>
                  )}

                  {/* OUT OF OFFICE TAB FORM (Matches Screenshot 2) */}
                  {eventType === "ooo" && (
                    <div className="space-y-3.5 pt-2">
                      {/* Date Range Row */}
                      <div className="flex items-start gap-3.5">
                        <Clock className="w-5 h-5 text-[#FF5C28] mt-1 shrink-0" />
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <input
                              type="date"
                              required
                              value={editingSchedule.date}
                              onChange={(e) => setEditingSchedule({ ...editingSchedule, date: e.target.value })}
                              className="bg-[#F1F5F9] border border-[#E6ECF2] text-[#042C51] focus:outline-none focus:border-[#042C51] rounded-lg px-2.5 py-1 cursor-pointer font-bold text-xs"
                            />
                            <span className="text-[#98A2B3] font-bold">–</span>
                            <input
                              type="date"
                              required
                              value={editingSchedule.date}
                              onChange={(e) => setEditingSchedule({ ...editingSchedule, date: e.target.value })}
                              className="bg-[#F1F5F9] border border-[#E6ECF2] text-[#042C51] focus:outline-none focus:border-[#042C51] rounded-lg px-2.5 py-1 cursor-pointer font-bold text-xs"
                            />
                          </div>

                          <div className="text-[11px] text-[#667085] font-medium">
                            Does not repeat
                          </div>
                        </div>
                      </div>

                      {/* Automatically decline meetings Checkbox */}
                      <div className="flex items-start gap-3.5 pt-1">
                        <input
                          type="checkbox"
                          id="declineMeetings"
                          checked={oooDeclineMeetings}
                          onChange={(e) => setOooDeclineMeetings(e.target.checked)}
                          className="w-4 h-4 mt-0.5 accent-[#042C51] rounded cursor-pointer"
                        />
                        <div className="flex-1 space-y-2.5">
                          <label htmlFor="declineMeetings" className="text-xs font-bold text-[#101828] cursor-pointer">
                            Automatically decline meetings
                          </label>

                          {oooDeclineMeetings && (
                            <div className="space-y-2 pl-0.5">
                              <label className="flex items-center gap-2 text-xs text-[#344054] font-medium cursor-pointer">
                                <input
                                  type="radio"
                                  name="declineScope"
                                  checked={oooDeclineScope === "new"}
                                  onChange={() => setOooDeclineScope("new")}
                                  className="w-3.5 h-3.5 accent-[#042C51] cursor-pointer"
                                />
                                <span>Only new meeting invitations</span>
                              </label>

                              <label className="flex items-center gap-2 text-xs text-[#344054] font-medium cursor-pointer">
                                <input
                                  type="radio"
                                  name="declineScope"
                                  checked={oooDeclineScope === "all"}
                                  onChange={() => setOooDeclineScope("all")}
                                  className="w-3.5 h-3.5 accent-[#042C51] cursor-pointer"
                                />
                                <span>New and existing meetings</span>
                              </label>

                              {/* Message Input Field */}
                              <div className="pt-1.5">
                                <label className="block text-[10px] font-bold text-[#667085] uppercase tracking-wider mb-1">
                                  Message
                                </label>
                                <input
                                  type="text"
                                  value={oooDeclineMessage}
                                  onChange={(e) => setOooDeclineMessage(e.target.value)}
                                  className="w-full bg-[#F1F5F9] text-[#101828] font-medium text-xs px-3 py-2 rounded-xl border border-[#E6ECF2] focus:outline-none focus:bg-white focus:border-[#042C51]"
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Lock Visibility Dropdown Row */}
                      <div className="space-y-1 pt-1">
                        <div className="flex items-center gap-3.5">
                          <Lock className="w-5 h-5 text-[#042C51] shrink-0" />
                          <div className="flex items-center gap-2">
                            <select
                              value={oooVisibility}
                              onChange={(e) => setOooVisibility(e.target.value as "Public" | "Private")}
                              className="bg-[#F1F5F9] text-[#042C51] font-bold text-xs px-3 py-1.5 rounded-xl border border-[#E6ECF2] focus:outline-none focus:bg-white focus:border-[#042C51] cursor-pointer"
                            >
                              <option value="Public">Public</option>
                              <option value="Private">Private</option>
                            </select>
                            <HelpCircle className="w-4 h-4 text-[#667085]" />
                          </div>
                        </div>
                        <p className="text-[11px] text-[#667085] pl-8 font-medium">
                          Availability might be shown in other Google apps
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Bottom Action Bar */}
                  <div className="pt-4 flex items-center justify-between border-t border-[#E6ECF2] mt-4">
                    {schedules.some(s => s.id === editingSchedule.id) ? (
                      <button
                        type="button"
                        onClick={() => {
                          if (window.confirm("Are you sure you want to delete this schedule?")) {
                            onDeleteSchedule(editingSchedule.id);
                            setIsFormOpen(false);
                            showToast("Schedule removed.");
                          }
                        }}
                        className="text-rose-600 hover:text-rose-700 text-xs font-bold cursor-pointer flex items-center gap-1"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span>Delete</span>
                      </button>
                    ) : (
                      <div />
                    )}

                    <div className="flex items-center gap-3 ml-auto">
                      <button
                        type="button"
                        onClick={() => setIsFormOpen(false)}
                        className="text-[#042C51] hover:text-[#063E72] text-xs font-bold cursor-pointer px-3 py-1.5"
                      >
                        More options
                      </button>
                      <button
                        type="submit"
                        className="px-6 py-2 bg-[#FF5C28] hover:bg-[#E04B1C] active:scale-95 text-white font-extrabold rounded-full text-xs shadow-md transition-all cursor-pointer"
                      >
                        Save
                      </button>
                    </div>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </AnimatePresence>
  );
}
