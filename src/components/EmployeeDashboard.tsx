import React, { useState, useEffect } from "react";
import { 
  Clock, 
  Calendar, 
  User, 
  Briefcase, 
  MapPin, 
  Building2, 
  FileText, 
  UserX, 
  CheckCircle2, 
  AlertCircle, 
  ChevronRight, 
  Plus, 
  ArrowUpRight, 
  TrendingUp, 
  Award, 
  ShieldAlert, 
  Sparkles, 
  Bell, 
  ExternalLink, 
  Lock, 
  Compass, 
  Info,
  BookOpen,
  Check,
  X,
  Play,
  Square,
  Coffee,
  Download,
  Eye,
  Search,
  MessageSquare,
  Headphones,
  PhoneCall,
  Activity,
  ThumbsUp,
  Flame,
  FileCheck,
  ShieldCheck,
  Zap,
  ArrowRight
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface EmployeeDashboardProps {
  userEmail?: string;
  onSwitchModule?: (module: string) => void;
}

interface PunchLog {
  id: string;
  timestamp: string;
  type: "Clock In" | "Clock Out" | "Lunch Break Start" | "Lunch Break End" | "Short Break 1" | "Short Break 2";
  location: string;
  status: "On Time" | "Grace Period" | "Late" | "Early Out" | "Approved";
  device: string;
}

interface Announcement {
  id: string;
  title: string;
  category: "Policy Update" | "Company News" | "JIT Notice" | "Family & Culture";
  date: string;
  author: string;
  summary: string;
  isImportant?: boolean;
}

interface Holiday {
  id: string;
  date: string;
  day: string;
  name: string;
  type: "Regular Holiday" | "Special Non-Working Day" | "Special Working Day" | "Company Holiday";
  isUpcoming?: boolean;
}

export default function EmployeeDashboard({ 
  userEmail = "alena.batacan@thesiblingssolutions.com",
  onSwitchModule 
}: EmployeeDashboardProps) {

  // Live Digital Clock state
  const [time, setTime] = useState<Date>(new Date());
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Attendance Punch State
  const [clockedIn, setClockedIn] = useState<boolean>(true);
  const [activeBreakType, setActiveBreakType] = useState<"none" | "lunch" | "short1" | "short2">("none");
  const [clockInTime, setClockInTime] = useState<string>("08:52:14 AM");
  const [clockOutTime, setClockOutTime] = useState<string | null>(null);

  // Toast feedback state
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Punch Activity Log Data
  const [punchLogs, setPunchLogs] = useState<PunchLog[]>([
    {
      id: "PUNCH-104",
      timestamp: "Today, 08:52:14 AM",
      type: "Clock In",
      location: "Mandaluyong HQ (Bay A - Station 42)",
      status: "On Time",
      device: "SiBS Workspace OS &bull; Chrome 127"
    },
    {
      id: "PUNCH-103",
      timestamp: "Yesterday, 06:04:18 PM",
      type: "Clock Out",
      location: "Mandaluyong HQ (Bay A - Station 42)",
      status: "On Time",
      device: "SiBS Workspace OS &bull; Chrome 127"
    },
    {
      id: "PUNCH-102",
      timestamp: "Yesterday, 01:00:05 PM",
      type: "Lunch Break End",
      location: "Mandaluyong HQ (Bay A - Station 42)",
      status: "On Time",
      device: "SiBS Workspace OS &bull; Chrome 127"
    },
    {
      id: "PUNCH-101",
      timestamp: "Yesterday, 12:00:30 PM",
      type: "Lunch Break Start",
      location: "Mandaluyong HQ (Bay A - Station 42)",
      status: "On Time",
      device: "SiBS Workspace OS &bull; Chrome 127"
    }
  ]);

  // Handle Clock In / Clock Out Action
  const handleToggleClock = () => {
    const formattedTime = time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    if (!clockedIn) {
      // Clock In
      setClockedIn(true);
      setActiveBreakType("none");
      setClockInTime(formattedTime);
      setClockOutTime(null);
      const newLog: PunchLog = {
        id: `PUNCH-${Date.now().toString().slice(-4)}`,
        timestamp: `Today, ${formattedTime}`,
        type: "Clock In",
        location: "Mandaluyong HQ (Bay A - Station 42)",
        status: "On Time",
        device: "SiBS Workspace Portal"
      };
      setPunchLogs([newLog, ...punchLogs]);
      triggerToast(`Clocked IN successfully at ${formattedTime}! Have a productive shift.`);
    } else {
      // Clock Out
      setClockedIn(false);
      setActiveBreakType("none");
      setClockOutTime(formattedTime);
      const newLog: PunchLog = {
        id: `PUNCH-${Date.now().toString().slice(-4)}`,
        timestamp: `Today, ${formattedTime}`,
        type: "Clock Out",
        location: "Mandaluyong HQ (Bay A - Station 42)",
        status: "On Time",
        device: "SiBS Workspace Portal"
      };
      setPunchLogs([newLog, ...punchLogs]);
      triggerToast(`Clocked OUT successfully at ${formattedTime}. Great job today!`);
    }
  };

  const handleToggleBreak = (breakType: "lunch" | "short1" | "short2") => {
    if (!clockedIn) {
      triggerToast("Please Clock In first before starting a break.");
      return;
    }
    const formattedTime = time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    
    if (activeBreakType === breakType) {
      // Ending the break
      setActiveBreakType("none");
      const label = breakType === "lunch" ? "Lunch Break End" : breakType === "short1" ? "Short Break 1" : "Short Break 2";
      const newLog: PunchLog = {
        id: `PUNCH-${Date.now().toString().slice(-4)}`,
        timestamp: `Today, ${formattedTime}`,
        type: label as any,
        location: "Mandaluyong HQ (Bay A - Station 42)",
        status: "On Time",
        device: "SiBS Workspace Portal"
      };
      setPunchLogs([newLog, ...punchLogs]);
      triggerToast(`Returned from ${breakType === "lunch" ? "Lunch" : "Bio Break"} at ${formattedTime}. Welcome back!`);
    } else {
      // Starting the break
      setActiveBreakType(breakType);
      const label = breakType === "lunch" ? "Lunch Break Start" : breakType === "short1" ? "Short Break 1" : "Short Break 2";
      const newLog: PunchLog = {
        id: `PUNCH-${Date.now().toString().slice(-4)}`,
        timestamp: `Today, ${formattedTime}`,
        type: label as any,
        location: "Mandaluyong HQ (Bay A - Station 42)",
        status: "On Time",
        device: "SiBS Workspace Portal"
      };
      setPunchLogs([newLog, ...punchLogs]);
      triggerToast(`Started ${breakType === "lunch" ? "Lunch (1 hour)" : "15-min Bio Break"} at ${formattedTime}.`);
    }
  };

  // Modals state
  const [isDocsModalOpen, setIsDocsModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isShiftSwapModalOpen, setIsShiftSwapModalOpen] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null);

  // Sample Documents List
  const userDocuments = [
    { name: "Employment Agreement - Alena Batacan.pdf", size: "2.4 MB", date: "Jan 15, 2024", type: "Contract" },
    { name: "2025 BIR Form 2316 Certificate of Compensation.pdf", size: "1.1 MB", date: "Feb 10, 2026", type: "Tax Document" },
    { name: "SiBS Confidentiality & Non-Disclosure Agreement (NDA).pdf", size: "850 KB", date: "Jan 15, 2024", type: "Legal Policy" },
    { name: "Certificate of Employment (COE) with Compensation.pdf", size: "620 KB", date: "Jun 18, 2026", type: "HR Certification" },
    { name: "Q2 2026 Operational KPI & Quality Appraisal.pdf", size: "1.8 MB", date: "Jul 05, 2026", type: "Performance File" },
  ];

  // Company Announcements
  const announcements: Announcement[] = [
    {
      id: "ANN-001",
      title: "Updated Hybrid & Flexible Work Setup Policy Guidelines for Q3 2026",
      category: "Policy Update",
      date: "Aug 02, 2026",
      author: "People & Culture Operations",
      summary: "Revised attendance adherence windows, core collaboration hours (10:00 AM - 04:00 PM), and streamlined remote approval requests across all omnichannel clusters.",
      isImportant: true
    },
    {
      id: "ANN-002",
      title: "SiBS Q3 All-Hands Townhall: Celebrating Family Values & Client Growth",
      category: "Family & Culture",
      date: "Aug 15, 2026",
      author: "Executive Leadership Office",
      summary: "Join us this Friday at 3:00 PM PHT for our quarterly townhall session. Key agenda includes client expansion in Australia & North America, employee tenure recognitions, and executive Q&A.",
      isImportant: false
    },
    {
      id: "ANN-003",
      title: "Annual HMO Dependent Re-Enrollment Window (Deadline: Aug 25)",
      category: "JIT Notice",
      date: "Jul 28, 2026",
      author: "Total Rewards & Benefits",
      summary: "Eligible employees may now add or modify accredited HMO dependents via the HR Portal. Please upload valid government IDs and PSA birth/marriage certificates.",
      isImportant: false
    }
  ];

  // Upcoming Holidays (Current Month: August 2026)
  const holidays: Holiday[] = [
    {
      id: "HOL-01",
      date: "Aug 21, 2026",
      day: "Friday",
      name: "Ninoy Aquino Day",
      type: "Special Non-Working Day",
      isUpcoming: true
    },
    {
      id: "HOL-02",
      date: "Aug 31, 2026",
      day: "Monday",
      name: "National Heroes Day",
      type: "Regular Holiday",
      isUpcoming: true
    },
    {
      id: "HOL-03",
      date: "Sep 08, 2026",
      day: "Tuesday",
      name: "Feast of the Nativity of Mary",
      type: "Special Working Day",
      isUpcoming: false
    }
  ];

  // Weekly Schedule Timeline Data
  const weeklySchedule = [
    { day: "Mon", date: "Aug 17", shift: "09:00 AM – 06:00 PM", channel: "Inbound Voice", status: "Present", hours: "9.0 hrs" },
    { day: "Tue", date: "Aug 18", shift: "09:00 AM – 06:00 PM", channel: "Live Chat / Email", status: "Present", hours: "9.0 hrs" },
    { day: "Wed", date: "Aug 19", shift: "09:00 AM – 06:00 PM", channel: "Omnichannel Tier-2", status: "Today (Active)", hours: "In Progress" },
    { day: "Thu", date: "Aug 20", shift: "09:00 AM – 06:00 PM", channel: "Healthcare Support", status: "Scheduled", hours: "9.0 hrs" },
    { day: "Fri", date: "Aug 21", shift: "Holiday Roster (Opt)", channel: "Ninoy Aquino Day", status: "Holiday Roster", hours: "9.0 hrs" },
    { day: "Sat", date: "Aug 22", shift: "Rest Day", channel: "Off-duty", status: "Off", hours: "0.0 hrs" },
    { day: "Sun", date: "Aug 23", shift: "Rest Day", channel: "Off-duty", status: "Off", hours: "0.0 hrs" },
  ];

  return (
    <div id="employee-dashboard-root" className="space-y-6 select-none max-w-full pb-16">
      
      {/* Toast Notification Container */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-20 right-8 bg-[#042C51] text-white px-5 py-3.5 rounded-2xl shadow-2xl border border-blue-400/40 z-50 flex items-center gap-3 text-xs font-bold"
          >
            <div className="w-6 h-6 rounded-full bg-[#FF5C28] flex items-center justify-center text-white shrink-0">
              <Check className="w-3.5 h-3.5 stroke-[3]" />
            </div>
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ==================== FLAGSHIP SIBS HEADER / HERO BANNER ==================== */}
      <section 
        id="employee-welcome-banner"
        className="bg-gradient-to-r from-[#042C51] via-[#063968] to-[#042C51] rounded-2xl text-white shadow-xl border border-[#084075] relative overflow-hidden flex flex-col"
      >
        {/* Top Accent Gradient Bar: Deep Navy to Vivid Orange */}
        <div className="h-[3.5px] w-full bg-gradient-to-r from-[#042C51] via-[#c24b30] to-[#FF5C28]" />

        <div className="p-6 md:p-7 relative z-10">
        {/* Subtle decorative geometric rings */}
        <div className="absolute -right-12 -bottom-12 w-56 h-56 rounded-full bg-white/5 pointer-events-none" />
        <div className="absolute right-36 -top-16 w-40 h-40 rounded-full bg-[#FF5C28]/10 pointer-events-none" />
        <div className="absolute left-1/2 top-0 w-72 h-32 bg-blue-400/5 blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          
          {/* Employee Avatar & Identity Details */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-5">
            <div className="relative self-start sm:self-center">
              <img
                src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=160&auto=format&fit=crop&q=80"
                alt="Alena Batacan"
                className="w-18 h-18 rounded-2xl object-cover border-2 border-[#FF5C28] shadow-lg"
              />
              <span 
                title="Status: Online & Ready"
                className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 border-2 border-[#042C51] rounded-full flex items-center justify-center shadow-xs"
              >
                <span className="w-1.5 h-1.5 bg-white rounded-full animate-ping"></span>
              </span>
            </div>

            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-[#FF5C28] text-white text-[10px] font-black uppercase tracking-wider shadow-xs">
                  SiBS Portal
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-white/15 text-blue-100 text-[10px] font-bold tracking-wide border border-white/10">
                  Healthcare &amp; Telecom Cluster
                </span>
                <button
                  onClick={() => onSwitchModule && onSwitchModule("Birthday Easter Egg")}
                  title="Click to view Birthday Easter Egg Showcase"
                  className="px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 hover:bg-amber-400/30 text-[10px] font-black uppercase tracking-wider border border-amber-400/40 inline-flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
                >
                  <Sparkles className="w-3 h-3 text-amber-300 animate-bounce" />
                  <span>Birthday Celebration</span>
                </button>
                {onSwitchModule && (
                  <button
                    onClick={() => onSwitchModule("Trainee Dashboard")}
                    title="Click to view Trainee Dashboard & Daily Learning"
                    className="px-2.5 py-0.5 rounded-full bg-emerald-400/20 text-emerald-300 hover:bg-emerald-400/30 text-[10px] font-black uppercase tracking-wider border border-emerald-400/40 inline-flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
                  >
                    <BookOpen className="w-3 h-3 text-emerald-300" />
                    <span>Trainee Journey</span>
                  </button>
                )}
              </div>

              <div className="flex items-baseline gap-3 flex-wrap">
                <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  Welcome Back, Alena!
                </h1>
                <span className="text-xs font-mono text-blue-200/80 bg-black/20 px-2 py-0.5 rounded-md">
                  ID: SIBS-8429
                </span>
              </div>

              <p className="text-xs text-blue-100/90 flex flex-wrap items-center gap-x-2 gap-y-1">
                <span className="font-semibold text-white">Senior Operations Specialist</span>
                <span className="text-blue-300/60">•</span>
                <span>Tier-2 Omnichannel Support</span>
                <span className="text-blue-300/60">•</span>
                <span className="inline-flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-[#FF5C28]" />
                  Mandaluyong HQ (Floor 12 &bull; Bay A)
                </span>
              </p>
            </div>
          </div>

          {/* Real-time Philippine Standard Time Clock & Shift Status */}
          <div className="bg-black/25 backdrop-blur-md px-6 py-4 rounded-2xl border border-white/15 flex flex-col sm:items-end justify-center shrink-0 space-y-1 shadow-inner">
            <div className="flex items-center gap-2 text-xs text-blue-200 font-medium">
              <Clock className="w-4 h-4 text-[#FF5C28]" />
              <span className="font-bold tracking-wide uppercase text-[10px] text-blue-200">Philippine Standard Time (PST / PHT)</span>
            </div>
            <div className="text-2xl sm:text-3xl font-black font-mono tracking-tight text-white">
              {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </div>
            <div className="text-[11px] font-semibold text-blue-200/90 flex items-center gap-2">
              <span>{time.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' })}</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              <span className="text-emerald-300 text-[10px] font-bold">Shift In-Progress</span>
            </div>
          </div>
        </div>

        {/* Company Value Banner Tagline */}
        <div className="mt-5 pt-3 border-t border-white/10 flex flex-wrap items-center justify-between text-[11px] text-blue-200/80 gap-2">
          <div className="flex items-center gap-2">
            <span className="text-[#FF5C28] font-bold font-mono">SiBS Mantra:</span>
            <span className="italic font-medium">"Where global expertise aligns with family-driven values — We exist to serve YOU."</span>
          </div>
          <div className="flex items-center gap-4 text-[10px] font-mono text-blue-300/70">
            <span>Client: Tier-1 North America Telecommunications</span>
            <span>Channel: Inbound Voice &bull; Chat &bull; Email</span>
          </div>
        </div>
        </div>
      </section>

      {/* ==================== MAIN 3-COLUMN / GRID LAYOUT ==================== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ==================== LEFT COLUMN (ATTENDANCE & WORK SCHEDULE & KPIS) ==================== */}
        <div className="lg:col-span-2 space-y-6">

          {/* 1. ATTENDANCE & LIVE TIMECARD CARD */}
          <section id="attendance-timecard-card" className="bg-white p-6 rounded-2xl border border-[#E6ECF2] shadow-sm space-y-6">
            
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#E6ECF2]">
              <div>
                <h2 className="text-sm font-black text-[#042C51] uppercase tracking-wider flex items-center gap-2">
                  <Clock className="w-4.5 h-4.5 text-[#FF5C28]" />
                  Attendance &amp; Live Timecard
                </h2>
                <p className="text-xs text-[#667085] mt-0.5">
                  Real-time shift adherence, lunch &amp; bio break controls, and certified timecard logs.
                </p>
              </div>
              
              <div className="flex items-center gap-2">
                <span className={`px-3.5 py-1.5 rounded-full text-xs font-black flex items-center gap-2 shadow-2xs ${
                  clockedIn 
                    ? activeBreakType !== "none"
                      ? "bg-amber-50 text-amber-900 border border-amber-300"
                      : "bg-emerald-50 text-emerald-900 border border-emerald-300"
                    : "bg-slate-100 text-slate-700 border border-slate-300"
                }`}>
                  <span className={`w-2.5 h-2.5 rounded-full ${
                    clockedIn 
                      ? activeBreakType !== "none" ? "bg-amber-500 animate-pulse" : "bg-emerald-500 animate-pulse"
                      : "bg-slate-400"
                  }`} />
                  {clockedIn 
                    ? activeBreakType === "lunch" 
                      ? "On Lunch Break (1h)" 
                      : activeBreakType === "short1"
                        ? "On 15-min Bio Break 1"
                        : activeBreakType === "short2"
                          ? "On 15-min Bio Break 2"
                          : "Clocked In & Active"
                    : "Clocked Out"}
                </span>
              </div>
            </div>

            {/* Attendance Punch Status & Shift Progress Widget */}
            <div className="bg-gradient-to-br from-[#F8FAFC] to-[#F1F5F9] p-5 rounded-2xl border border-[#E6ECF2] space-y-4">
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                
                {/* Punch Status Breakdown */}
                <div className="space-y-2">
                  <span className="text-[10px] font-black text-[#042C51] uppercase tracking-wider">Today's Punch Snapshot</span>
                  <div className="space-y-1.5 text-xs bg-white p-3 rounded-xl border border-slate-200/80 shadow-2xs">
                    <div className="flex justify-between items-center text-slate-600">
                      <span className="text-slate-500">First Clock In:</span>
                      <strong className="font-mono text-[#042C51] font-extrabold">{clockInTime}</strong>
                    </div>
                    <div className="flex justify-between items-center text-slate-600">
                      <span className="text-slate-500">Scheduled Out:</span>
                      <strong className="font-mono text-slate-700">06:00:00 PM</strong>
                    </div>
                    <div className="flex justify-between items-center text-slate-600 pt-1.5 border-t border-slate-100">
                      <span className="text-slate-500">Shift Elapsed:</span>
                      <strong className="font-mono text-emerald-600 font-black">{clockedIn ? "6h 48m / 9h" : "8h 00m"}</strong>
                    </div>
                  </div>
                </div>

                {/* Break Controls */}
                <div className="space-y-2">
                  <span className="text-[10px] font-black text-[#042C51] uppercase tracking-wider">Break Allocations</span>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => handleToggleBreak("lunch")}
                      className={`p-2.5 rounded-xl font-bold text-xs transition-all flex flex-col items-center justify-center gap-1 cursor-pointer border ${
                        activeBreakType === "lunch"
                          ? "bg-amber-600 text-white border-amber-700 shadow-sm"
                          : "bg-white hover:bg-slate-50 text-slate-700 border-slate-200 shadow-2xs"
                      }`}
                    >
                      <Coffee className="w-4 h-4 text-amber-500" />
                      <span className="text-[11px]">{activeBreakType === "lunch" ? "End Lunch" : "Lunch (1 hr)"}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleToggleBreak("short1")}
                      className={`p-2.5 rounded-xl font-bold text-xs transition-all flex flex-col items-center justify-center gap-1 cursor-pointer border ${
                        activeBreakType === "short1"
                          ? "bg-amber-600 text-white border-amber-700 shadow-sm"
                          : "bg-white hover:bg-slate-50 text-slate-700 border-slate-200 shadow-2xs"
                      }`}
                    >
                      <Zap className="w-4 h-4 text-blue-500" />
                      <span className="text-[11px]">{activeBreakType === "short1" ? "End Bio Break" : "Bio Break (15m)"}</span>
                    </button>
                  </div>
                </div>

                {/* Primary Clock In / Clock Out Action */}
                <div className="space-y-2 flex flex-col justify-end">
                  <span className="text-[10px] font-black text-[#042C51] uppercase tracking-wider">Primary Time Action</span>
                  <button
                    type="button"
                    onClick={handleToggleClock}
                    className={`w-full py-3.5 px-4 rounded-xl font-black text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md active:scale-98 ${
                      clockedIn
                        ? "bg-rose-600 hover:bg-rose-700 text-white border border-rose-600 shadow-rose-200"
                        : "bg-[#FF5C28] hover:bg-[#E04B1D] text-white border border-[#FF5C28] shadow-[#FF5C28]/25"
                    }`}
                  >
                    {clockedIn ? (
                      <>
                        <Square className="w-4 h-4 fill-current" />
                        <span>Clock Out (End Shift)</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4 fill-current" />
                        <span>Clock In (Start Shift)</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Real-time Shift Progress Bar */}
              <div className="space-y-1.5 pt-2 border-t border-slate-200/80">
                <div className="flex justify-between items-center text-[11px] font-bold text-slate-600">
                  <span>Daily Shift Progress (09:00 AM – 06:00 PM)</span>
                  <span className="font-mono text-[#042C51]">75.5% Completed (6.8 / 9.0 hrs)</span>
                </div>
                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                  <div className="bg-gradient-to-r from-[#042C51] via-[#FF5C28] to-emerald-500 h-full w-[75.5%] rounded-full transition-all duration-500"></div>
                </div>
              </div>
            </div>

            {/* Today's Punch Activity Log Table */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-[#042C51] uppercase tracking-wide flex items-center gap-2">
                  <Activity className="w-4 h-4 text-[#FF5C28]" />
                  Today's Verified Punch Activity Log
                </h3>
                <span className="text-[10px] text-slate-400 font-mono">Biometric &amp; WFM Synchronized</span>
              </div>

              <div className="overflow-x-auto border border-[#E6ECF2] rounded-xl shadow-2xs">
                <table className="w-full text-left border-collapse text-xs whitespace-nowrap">
                  <thead>
                    <tr className="border-b border-[#CBD5E1] bg-[#F8FAFC] text-[10px] uppercase text-[#042C51] font-black tracking-wider">
                      <th className="px-4 py-3">Activity Type</th>
                      <th className="px-4 py-3">Timestamp</th>
                      <th className="px-4 py-3">Station / Workstation</th>
                      <th className="px-4 py-3">Adherence Status</th>
                      <th className="px-4 py-3 text-right">Verification Client</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E6ECF2] bg-white text-slate-700">
                    {punchLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-4 py-2.5 font-bold text-[#042C51] flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${
                            log.type === "Clock In" ? "bg-emerald-500" : log.type === "Clock Out" ? "bg-rose-500" : "bg-amber-500"
                          }`}></span>
                          {log.type}
                        </td>
                        <td className="px-4 py-2.5 font-mono text-slate-600 text-[11px]">{log.timestamp}</td>
                        <td className="px-4 py-2.5 text-slate-600">{log.location}</td>
                        <td className="px-4 py-2.5">
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-50 text-emerald-700 border border-emerald-200">
                            {log.status}
                          </span>
                        </td>
                        <td className="px-4 py-2.5 text-right font-mono text-[10px] text-slate-400">{log.device}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          {/* 2. SIBS BPO SERVICE QUALITY & OPERATIONAL KPIS */}
          <section id="operational-kpi-card" className="bg-white p-6 rounded-2xl border border-[#E6ECF2] shadow-sm space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E6ECF2]">
              <div>
                <h2 className="text-sm font-black text-[#042C51] uppercase tracking-wider flex items-center gap-2">
                  <Award className="w-4.5 h-4.5 text-[#FF5C28]" />
                  Operational Performance &amp; Service Scorecard
                </h2>
                <p className="text-xs text-[#667085] mt-0.5">
                  August 2026 Monthly Quality, CSAT, and Schedule Adherence Metrics.
                </p>
              </div>
              <span className="px-3 py-1 bg-emerald-50 text-emerald-800 text-[10px] font-black rounded-full border border-emerald-200 uppercase tracking-wide">
                Tier-1 Top Performer
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
              
              {/* CSAT */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <ThumbsUp className="w-3 h-3 text-blue-500" />
                  CSAT Rating
                </span>
                <div className="text-xl font-black font-mono text-[#042C51]">98.4%</div>
                <div className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                  <span>&uarr; +2.4%</span>
                  <span className="text-slate-400 font-normal">(Target: 95%)</span>
                </div>
              </div>

              {/* FCR */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-500" />
                  First Contact Res.
                </span>
                <div className="text-xl font-black font-mono text-[#042C51]">89.2%</div>
                <div className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                  <span>&uarr; +4.2%</span>
                  <span className="text-slate-400 font-normal">(Target: 85%)</span>
                </div>
              </div>

              {/* Schedule Adherence */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <Clock className="w-3 h-3 text-[#FF5C28]" />
                  Adherence
                </span>
                <div className="text-xl font-black font-mono text-[#042C51]">99.1%</div>
                <div className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                  <span>Optimal</span>
                  <span className="text-slate-400 font-normal">(Target: 98%)</span>
                </div>
              </div>

              {/* AHT */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <Headphones className="w-3 h-3 text-purple-500" />
                  Avg Handle Time
                </span>
                <div className="text-xl font-black font-mono text-[#042C51]">342s</div>
                <div className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                  <span>-18s Faster</span>
                  <span className="text-slate-400 font-normal">(Cap: 360s)</span>
                </div>
              </div>
            </div>

            {/* QA Coach Feedback note */}
            <div className="p-3.5 bg-[#E9F0FC]/60 border border-blue-200 rounded-xl flex items-start gap-3 text-xs text-[#042C51]">
              <div className="w-7 h-7 rounded-lg bg-[#042C51] text-white flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                <Sparkles className="w-3.5 h-3.5 text-[#FF5C28]" />
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <strong className="font-bold text-[#042C51]">Quality Coach Highlight &bull; Sarah Jenkins (WFM Principal Lead)</strong>
                  <span className="text-[10px] text-slate-400 font-mono">Aug 14, 2026</span>
                </div>
                <p className="text-slate-600 text-[11px]">
                  "Exceptional call resolution and empathetic de-escalation on complex telecom inquiries this week. Customer satisfaction score remains in the top 5% of the cluster."
                </p>
              </div>
            </div>
          </section>

          {/* 3. WORK SCHEDULE CARD */}
          <section id="work-schedule-card" className="bg-white p-6 rounded-2xl border border-[#E6ECF2] shadow-sm space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E6ECF2]">
              <div>
                <h2 className="text-sm font-black text-[#042C51] uppercase tracking-wider flex items-center gap-2">
                  <Calendar className="w-4.5 h-4.5 text-[#FF5C28]" />
                  Work Schedule &amp; Weekly Roster
                </h2>
                <p className="text-xs text-[#667085] mt-0.5">
                  Assigned omnichannel queues, workstation bay, and 7-day schedule grid.
                </p>
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsShiftSwapModalOpen(true)}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-bold text-[#042C51] flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
                >
                  <Plus className="w-3.5 h-3.5 text-[#FF5C28]" />
                  <span>Request Shift Swap</span>
                </button>
              </div>
            </div>

            {/* Today's Shift & Setup Banner */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              
              <div className="p-4 bg-gradient-to-br from-[#042C51] to-[#0A3D6E] text-white rounded-xl shadow-xs space-y-1">
                <span className="text-[10px] font-bold text-blue-200 uppercase tracking-wider">Today's Assigned Shift</span>
                <div className="text-lg font-black font-mono text-[#FF5C28]">09:00 AM – 06:00 PM</div>
                <p className="text-[11px] text-blue-100">Standard Day Shift &bull; 9.0 Hours Total</p>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Work Location &amp; Station</span>
                <div className="text-sm font-extrabold text-[#042C51] flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-slate-600" />
                  Mandaluyong HQ (On-Site)
                </div>
                <p className="text-[11px] text-slate-500">Floor 12 &bull; Healthcare Bay A &bull; Station 42</p>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Immediate Supervisor</span>
                <div className="text-sm font-extrabold text-[#042C51] flex items-center gap-1.5">
                  <User className="w-4 h-4 text-slate-600" />
                  Sarah Jenkins
                </div>
                <p className="text-[11px] text-slate-500">WFM Principal Lead &bull; Telecom</p>
              </div>
            </div>

            {/* Weekly Schedule Timeline Grid */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-[#042C51] uppercase tracking-wide">7-Day Work Roster Timeline</span>
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
                {weeklySchedule.map((item, idx) => {
                  const isToday = item.status.includes("Today");
                  const isOff = item.status === "Off";
                  const isHoliday = item.status.includes("Holiday");
                  return (
                    <div
                      key={idx}
                      className={`p-3 rounded-xl border text-center transition-all ${
                        isToday 
                          ? "bg-[#042C51] text-white border-[#042C51] shadow-md ring-2 ring-[#FF5C28]"
                          : isOff 
                            ? "bg-slate-50 text-slate-400 border-slate-200"
                            : isHoliday
                              ? "bg-amber-50 text-amber-900 border-amber-200"
                              : "bg-white text-slate-700 border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      <span className={`text-[10px] font-black uppercase ${isToday ? "text-[#FF5C28]" : isHoliday ? "text-amber-700" : "text-slate-400"}`}>
                        {item.day} &bull; {item.date}
                      </span>
                      <div className={`text-xs font-mono font-bold mt-1 ${isToday ? "text-white" : isOff ? "text-slate-400" : "text-[#042C51]"}`}>
                        {item.shift}
                      </div>
                      <div className="text-[9px] truncate text-slate-400 mt-0.5">
                        {item.channel}
                      </div>
                      <div className="mt-2">
                        <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded ${
                          isToday 
                            ? "bg-[#FF5C28] text-white" 
                            : item.status === "Present" 
                              ? "bg-emerald-100 text-emerald-800" 
                              : isHoliday
                                ? "bg-amber-200 text-amber-900"
                                : isOff 
                                  ? "bg-slate-200 text-slate-600" 
                                  : "bg-blue-50 text-blue-700"
                        }`}>
                          {item.status}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>

        </div>

        {/* ==================== RIGHT COLUMN (PROFILE, LEAVES, ANNOUNCEMENTS & HOLIDAYS) ==================== */}
        <div className="space-y-6">

          {/* 4. MY PROFILE & WORK SUMMARY + QUICK ACTION SHORTCUTS */}
          <section id="my-profile-summary-card" className="bg-white p-6 rounded-2xl border border-[#E6ECF2] shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E6ECF2]">
              <h2 className="text-sm font-black text-[#042C51] uppercase tracking-wider flex items-center gap-2">
                <User className="w-4.5 h-4.5 text-[#FF5C28]" />
                My Profile &amp; Summary
              </h2>
              <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                Active &bull; Regular
              </span>
            </div>

            {/* Employee Details List */}
            <div className="space-y-2.5 text-xs text-slate-700">
              <div className="flex justify-between items-center py-1 border-b border-slate-100">
                <span className="text-slate-500">Position Title:</span>
                <strong className="text-[#042C51] font-extrabold text-right">Senior Operations Specialist</strong>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-100">
                <span className="text-slate-500">Business Unit:</span>
                <strong className="text-[#042C51] font-semibold">Telecom &amp; Tech Support</strong>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-100">
                <span className="text-slate-500">Employee ID:</span>
                <strong className="font-mono text-[#042C51]">SIBS-8429</strong>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-100">
                <span className="text-slate-500">Employment Date:</span>
                <strong className="text-[#042C51] font-semibold">January 15, 2024 (2.6 yrs)</strong>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-slate-500">Immediate Manager:</span>
                <strong className="text-[#042C51] font-semibold">Sarah Jenkins</strong>
              </div>
            </div>

            {/* Quick Links Shortcuts */}
            <div className="pt-3 border-t border-[#E6ECF2] space-y-2">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Quick Action Shortcuts</span>
              <div className="grid grid-cols-3 gap-2">
                
                <button
                  type="button"
                  onClick={() => setIsProfileModalOpen(true)}
                  className="p-3 bg-slate-50 hover:bg-[#E9F0FC] hover:text-[#042C51] border border-slate-200 rounded-xl transition-all text-center flex flex-col items-center gap-1.5 cursor-pointer text-slate-700 shadow-2xs"
                >
                  <User className="w-4 h-4 text-[#FF5C28]" />
                  <span className="text-[10px] font-bold">My Profile</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsDocsModalOpen(true)}
                  className="p-3 bg-slate-50 hover:bg-[#E9F0FC] hover:text-[#042C51] border border-slate-200 rounded-xl transition-all text-center flex flex-col items-center gap-1.5 cursor-pointer text-slate-700 shadow-2xs"
                >
                  <FileText className="w-4 h-4 text-blue-600" />
                  <span className="text-[10px] font-bold">HR Vault</span>
                </button>

                <button
                  type="button"
                  onClick={() => onSwitchModule && onSwitchModule("My Resignation")}
                  className="p-3 bg-slate-50 hover:bg-rose-50 hover:border-rose-200 border border-slate-200 rounded-xl transition-all text-center flex flex-col items-center gap-1.5 cursor-pointer text-slate-700 shadow-2xs"
                >
                  <UserX className="w-4 h-4 text-rose-500" />
                  <span className="text-[10px] font-bold">Resignation</span>
                </button>
              </div>
            </div>
          </section>

          {/* 5. LEAVES & TIME OFF SUMMARY */}
          <section id="leaves-summary-card" className="bg-white p-6 rounded-2xl border border-[#E6ECF2] shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E6ECF2]">
              <div>
                <h2 className="text-sm font-black text-[#042C51] uppercase tracking-wider flex items-center gap-2">
                  <Calendar className="w-4.5 h-4.5 text-[#FF5C28]" />
                  Leaves &amp; Time Off
                </h2>
                <p className="text-xs text-[#667085] mt-0.5">Accrued balances and filed leave requests.</p>
              </div>
              <button
                type="button"
                onClick={() => onSwitchModule && onSwitchModule("Leaves & Time Off")}
                className="text-xs text-[#FF5C28] font-black hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>Full Module</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Leave Balances Widgets */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3.5 bg-blue-50/70 border border-blue-200 rounded-xl space-y-1.5">
                <div className="flex justify-between items-center text-[10px] font-black text-blue-900 uppercase">
                  <span>Vacation Leave</span>
                  <span className="font-mono bg-blue-200 px-1.5 py-0.2 rounded text-[9px]">VL</span>
                </div>
                <div className="text-lg font-black font-mono text-[#042C51]">
                  10.5 <span className="text-xs font-normal text-slate-500">/ 15 Days</span>
                </div>
                <div className="w-full bg-blue-200 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-[#042C51] h-full w-[70%] rounded-full"></div>
                </div>
              </div>

              <div className="p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-1.5">
                <div className="flex justify-between items-center text-[10px] font-black text-emerald-900 uppercase">
                  <span>Sick Leave</span>
                  <span className="font-mono bg-emerald-200 px-1.5 py-0.2 rounded text-[9px]">SL</span>
                </div>
                <div className="text-lg font-black font-mono text-[#042C51]">
                  8.0 <span className="text-xs font-normal text-slate-500">/ 12 Days</span>
                </div>
                <div className="w-full bg-emerald-200 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-emerald-600 h-full w-[66%] rounded-full"></div>
                </div>
              </div>
            </div>

            {/* Filed Leaves Status List */}
            <div className="space-y-2">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Recent Filed Leave Requests</span>
              <div className="space-y-2">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                  <div>
                    <strong className="text-[#042C51] font-bold">Vacation Leave (VL)</strong>
                    <p className="text-[10px] text-slate-500">Aug 15 – Aug 16, 2026 (2.0 Days)</p>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                    Approved
                  </span>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                  <div>
                    <strong className="text-[#042C51] font-bold">Sick Leave (SL)</strong>
                    <p className="text-[10px] text-slate-500">Jul 22, 2026 (1.0 Day)</p>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                    Approved
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* 6. COMPANY ANNOUNCEMENTS & HOLIDAY CALENDAR */}
          <section id="announcements-holidays-card" className="bg-white p-6 rounded-2xl border border-[#E6ECF2] shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E6ECF2]">
              <h2 className="text-sm font-black text-[#042C51] uppercase tracking-wider flex items-center gap-2">
                <Bell className="w-4.5 h-4.5 text-[#FF5C28]" />
                Bulletins &amp; Philippine Holidays
              </h2>
              <span className="text-[10px] font-bold text-slate-400 font-mono">August 2026</span>
            </div>

            {/* Announcements List */}
            <div className="space-y-2.5">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Latest HR Bulletins &amp; Notices</span>
              
              <div className="space-y-2">
                {announcements.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => setSelectedAnnouncement(item)}
                    className="p-3.5 bg-slate-50 hover:bg-[#E9F0FC]/60 border border-slate-200 hover:border-blue-300 rounded-xl transition-all cursor-pointer space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider ${
                        item.category === "Policy Update" 
                          ? "bg-purple-100 text-purple-800"
                          : item.category === "JIT Notice"
                            ? "bg-rose-100 text-rose-800"
                            : item.category === "Family & Culture"
                              ? "bg-amber-100 text-amber-800"
                              : "bg-blue-100 text-blue-800"
                      }`}>
                        {item.category}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">{item.date}</span>
                    </div>
                    <h3 className="text-xs font-bold text-[#042C51] leading-snug line-clamp-1">{item.title}</h3>
                    <p className="text-[11px] text-slate-500 line-clamp-2">{item.summary}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Upcoming Holidays Calendar */}
            <div className="pt-3 border-t border-[#E6ECF2] space-y-2.5">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Upcoming Philippine Holidays</span>
              
              <div className="space-y-2">
                {holidays.map((h) => (
                  <div key={h.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#042C51] text-white flex flex-col items-center justify-center text-center shrink-0 shadow-2xs">
                        <span className="text-[8px] font-black uppercase text-[#FF5C28]">{h.day.slice(0, 3)}</span>
                        <span className="text-xs font-black font-mono leading-none">{h.date.split(" ")[1]}</span>
                      </div>
                      <div>
                        <strong className="text-[#042C51] font-bold block">{h.name}</strong>
                        <span className="text-[10px] text-slate-500">{h.type}</span>
                      </div>
                    </div>
                    {h.isUpcoming && (
                      <span className="px-2.5 py-1 rounded-full text-[9px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                        Upcoming
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>

          </section>

        </div>
      </div>

      {/* ==================== MODALS ==================== */}

      {/* 1. Documents Vault Modal */}
      <AnimatePresence>
        {isDocsModalOpen && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden"
            >
              <div className="px-6 py-4 bg-[#042C51] text-white flex justify-between items-center">
                <div className="flex items-center gap-2.5">
                  <FileText className="w-5 h-5 text-[#FF5C28]" />
                  <h3 className="text-sm font-black uppercase tracking-wider">My HR Documents Vault</h3>
                </div>
                <button 
                  onClick={() => setIsDocsModalOpen(false)}
                  className="text-slate-300 hover:text-white cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <p className="text-xs text-slate-600">
                  Secured employee documents filed under your SIBS ID profile. Click to view or download.
                </p>

                <div className="space-y-2">
                  {userDocuments.map((doc, idx) => (
                    <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-3 min-w-0">
                        <FileText className="w-5 h-5 text-blue-600 shrink-0" />
                        <div className="min-w-0">
                          <strong className="text-[#042C51] font-bold truncate block">{doc.name}</strong>
                          <span className="text-[10px] text-slate-400">{doc.type} &bull; {doc.size} &bull; {doc.date}</span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => triggerToast(`Downloaded ${doc.name}`)}
                        className="p-2 text-slate-600 hover:text-[#042C51] hover:bg-slate-200 rounded-lg transition-colors cursor-pointer shrink-0"
                        title="Download Document"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="button"
                    onClick={() => setIsDocsModalOpen(false)}
                    className="px-5 py-2.5 bg-[#042C51] text-white font-black text-xs rounded-xl cursor-pointer"
                  >
                    Done
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 2. My Profile Details Modal */}
      <AnimatePresence>
        {isProfileModalOpen && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-xl overflow-hidden"
            >
              <div className="px-6 py-4 bg-[#042C51] text-white flex justify-between items-center">
                <div className="flex items-center gap-2.5">
                  <User className="w-5 h-5 text-[#FF5C28]" />
                  <h3 className="text-sm font-black uppercase tracking-wider">Employee Profile — Alena Batacan</h3>
                </div>
                <button 
                  onClick={() => setIsProfileModalOpen(false)}
                  className="text-slate-300 hover:text-white cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-5">
                <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <img
                    src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80"
                    alt="Alena Batacan"
                    className="w-16 h-16 rounded-2xl object-cover border-2 border-[#042C51]"
                  />
                  <div>
                    <h4 className="text-base font-black text-[#042C51]">Alena Batacan</h4>
                    <p className="text-xs font-semibold text-slate-600">Senior Operations Specialist</p>
                    <span className="text-[10px] font-mono font-bold text-slate-400">SIBS ID: SIBS-8429</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <span className="text-[10px] text-slate-400 font-bold block uppercase">Official Email</span>
                    <strong className="text-[#042C51] truncate block">{userEmail}</strong>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <span className="text-[10px] text-slate-400 font-bold block uppercase">Date Hired</span>
                    <strong className="text-[#042C51]">January 15, 2024</strong>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <span className="text-[10px] text-slate-400 font-bold block uppercase">Employment Status</span>
                    <strong className="text-emerald-700">Regular Full-Time</strong>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <span className="text-[10px] text-slate-400 font-bold block uppercase">Cost Center / Cluster</span>
                    <strong className="text-[#042C51]">Telecom &amp; Tech Support</strong>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-200 flex justify-end">
                  <button
                    type="button"
                    onClick={() => setIsProfileModalOpen(false)}
                    className="px-5 py-2.5 bg-[#042C51] text-white font-black text-xs rounded-xl cursor-pointer"
                  >
                    Close Profile
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 3. Shift Swap Request Modal */}
      <AnimatePresence>
        {isShiftSwapModalOpen && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden"
            >
              <div className="px-6 py-4 bg-[#042C51] text-white flex justify-between items-center">
                <div className="flex items-center gap-2.5">
                  <Calendar className="w-5 h-5 text-[#FF5C28]" />
                  <h3 className="text-sm font-black uppercase tracking-wider">Request Shift Swap</h3>
                </div>
                <button 
                  onClick={() => setIsShiftSwapModalOpen(false)}
                  className="text-slate-300 hover:text-white cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-4 text-xs">
                <div>
                  <label className="font-bold text-[#042C51] block mb-1">Target Shift to Swap</label>
                  <select className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-700">
                    <option>Friday, Aug 21, 2026 (09:00 AM – 06:00 PM)</option>
                    <option>Thursday, Aug 20, 2026 (09:00 AM – 06:00 PM)</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-[#042C51] block mb-1">Swap Partner / Colleague (Same Skill Queue)</label>
                  <input
                    type="text"
                    placeholder="e.g. John Santos (SIBS-8102)"
                    defaultValue="Mark David (SIBS-7921)"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-700"
                  />
                </div>

                <div>
                  <label className="font-bold text-[#042C51] block mb-1">Reason for Swap</label>
                  <textarea
                    rows={3}
                    placeholder="Briefly state reason for shift adjustment..."
                    defaultValue="Family errand on Friday morning. Mutual swap agreed with Mark."
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-700"
                  />
                </div>

                <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsShiftSwapModalOpen(false)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsShiftSwapModalOpen(false);
                      triggerToast("Shift swap request filed with supervisor Sarah Jenkins.");
                    }}
                    className="px-5 py-2 bg-[#FF5C28] hover:bg-[#E04B1D] text-white font-black rounded-xl cursor-pointer"
                  >
                    Submit for Approval
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 4. Announcement View Modal */}
      <AnimatePresence>
        {selectedAnnouncement && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden"
            >
              <div className="px-6 py-4 bg-[#042C51] text-white flex justify-between items-center">
                <div className="flex items-center gap-2.5">
                  <Bell className="w-5 h-5 text-[#FF5C28]" />
                  <h3 className="text-sm font-black uppercase tracking-wider">{selectedAnnouncement.category}</h3>
                </div>
                <button 
                  onClick={() => setSelectedAnnouncement(null)}
                  className="text-slate-300 hover:text-white cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-1 font-mono">
                    <span>Issued: {selectedAnnouncement.date}</span>
                    <span>By: {selectedAnnouncement.author}</span>
                  </div>
                  <h2 className="text-base font-black text-[#042C51] leading-snug">{selectedAnnouncement.title}</h2>
                </div>

                <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-200">
                  {selectedAnnouncement.summary}
                </p>

                <div className="pt-2 flex justify-end">
                  <button
                    type="button"
                    onClick={() => setSelectedAnnouncement(null)}
                    className="px-5 py-2.5 bg-[#042C51] text-white font-black text-xs rounded-xl cursor-pointer"
                  >
                    Acknowledge Notice
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
