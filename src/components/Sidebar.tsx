import type { DemoRole } from "../auth/demoAuthTypes";
import { canAccessMenuItem } from "../auth/roleAccess";
import React, { useState, useEffect } from "react";
import { 
  Users, 
  Clock, 
  FileText, 
  Calendar, 
  CalendarDays,
  Settings, 
  Building2, 
  Briefcase, 
  LayoutDashboard, 
  MapPin, 
  DollarSign, 
  BarChart2, 
  BarChart3, 
  PieChart, 
  UserPlus, 
  Gift, 
  ClipboardCheck, 
  ClipboardList, 
  BookOpen, 
  Activity, 
  FileClock, 
  FileCog, 
  UserCog, 
  ChevronUp, 
  ChevronDown, 
  ChevronLeft, 
  X, 
  Info, 
  Sparkles, 
  LayoutGrid,
  ArrowRight,
  GitFork,
  Award,
  ShieldAlert,
  User,
  Bell
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface SidebarProps {
  currentModule: string;
  role: DemoRole;
  onModuleChange?: (moduleKey: string) => void;
  activeTab?: string;
  onTabChange?: (tab: string) => void;
  isOpen?: boolean;
  onClose?: () => void;
}

interface MenuItem {
  name: string;
  displayName?: string;
  icon: React.ComponentType<{ className?: string }>;
  isEnabled: boolean;
  moduleKey?: string;
  tabKey?: string;
  badge?: string;
}

interface WorkspaceGroup {
  id: string;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  items: MenuItem[];
}

export default function Sidebar({ currentModule, role, onModuleChange, activeTab, onTabChange, isOpen, onClose }: SidebarProps) {
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isSettingsPopupOpen, setIsSettingsPopupOpen] = useState<boolean>(false);
  
  // All workspace groups are expanded by default to match the reference images
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});

  const toggleGroup = (groupId: string) => {
    setCollapsedGroups(prev => ({
      ...prev,
      [groupId]: !prev[groupId]
    }));
  };

  // Auto-dismiss toast
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => {
        setToastMessage(null);
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  // Section 1: CORE HR (Top direct items with all 5 dashboards)
  const coreHrItems: MenuItem[] = [
    { name: "Super Admin Dashboard", icon: LayoutGrid, isEnabled: true, moduleKey: "Super Admin Dashboard" },
    { name: "HR Admin Dashboard", icon: LayoutGrid, isEnabled: true, moduleKey: "HR Admin Dashboard" },
    { name: "TA Dashboard", icon: LayoutGrid, isEnabled: true, moduleKey: "TA Dashboard" },
    { name: "OM Dashboard", icon: LayoutGrid, isEnabled: true, moduleKey: "OM Dashboard" },
    { name: "Employee Dashboard", icon: LayoutGrid, isEnabled: true, moduleKey: "Employee Dashboard" },
    { name: "Employee Directory", icon: Users, isEnabled: true, moduleKey: "Employee Directory" },
    { name: "Time & Attendance", icon: Clock, isEnabled: true, moduleKey: "Time & Attendance" },
    { name: "Leaves", icon: Calendar, isEnabled: true, moduleKey: "Leaves & Time Off" },
    { name: "Resignation Management", icon: FileText, isEnabled: true, moduleKey: "Resignation Management" },
  ];

  // Section 2: WORKSPACES (Accordion sub-groups)
  const workspaceGroups: WorkspaceGroup[] = [
    {
      id: "workforce-planning",
      title: "Workforce Planning",
      icon: CalendarDays,
      items: [
        { 
          name: "Workforce & ...", 
          displayName: "Workforce & ...", 
          icon: CalendarDays, 
          isEnabled: true, 
          moduleKey: "Workforce Hiring", 
          tabKey: "overview", 
          badge: "RAMPS" 
        },
        { 
          name: "Workforce & Hiring Plan", 
          icon: CalendarDays, 
          isEnabled: true, 
          moduleKey: "Workforce Hiring", 
          tabKey: "plan" 
        },
        { name: "Job Description", icon: ClipboardList, isEnabled: true, moduleKey: "Job Description" },
        { name: "Hiring Needs Intake", icon: FileText, isEnabled: true, moduleKey: "Hiring Needs Intake" },
        { name: "Available Positions", icon: Briefcase, isEnabled: true, moduleKey: "Available Positions" },
      ]
    },
    {
      id: "recruitment-pipeline",
      title: "Recruitment Pipeline",
      icon: Users,
      items: [
        { name: "Applicant Leads", icon: UserPlus, isEnabled: true, moduleKey: "Applicant Leads" },
        { name: "Talent Pool", icon: Users, isEnabled: true, moduleKey: "Talent Pool" },
        { name: "Candidate Pipeline", icon: LayoutGrid, isEnabled: true, moduleKey: "Candidate Pipeline" },
        { name: "Offers", icon: Gift, isEnabled: true, moduleKey: "Offers" },
        { name: "New Hire Orientation (NHO)", icon: Sparkles, isEnabled: true, moduleKey: "New Hire Orientation", badge: "V1" },
        { name: "Onboarding", icon: ClipboardCheck, isEnabled: true, moduleKey: "Onboarding" },
        { name: "Candidate Experience", icon: BookOpen, isEnabled: true, moduleKey: "Candidate Experience" },
      ]
    },
    {
      id: "employee-journey-workspace",
      title: "Employee Journey & Mentorship",
      icon: Award,
      items: [
        { name: "30 / 60 / 90 Benchmark", icon: Award, isEnabled: true, moduleKey: "Employee Journey", tabKey: "benchmark", badge: "ROSTER" },
        { name: "Trainee Dashboard", icon: User, isEnabled: true, moduleKey: "Employee Journey", tabKey: "trainee-dashboard" },
        { name: "Trainer Monitoring", icon: Users, isEnabled: true, moduleKey: "Employee Journey", tabKey: "trainer-monitoring" },
        { name: "QDS Dashboard", icon: ShieldAlert, isEnabled: true, moduleKey: "Employee Journey", tabKey: "qds-dashboard" },
        { name: "Journey Notifications", icon: Bell, isEnabled: true, moduleKey: "Employee Journey", tabKey: "notifications" },
        { name: "Journey Configuration", icon: Settings, isEnabled: true, moduleKey: "Employee Journey", tabKey: "configuration" },
      ]
    },
    {
      id: "recruitment-operations",
      title: "Recruitment Operations",
      icon: Activity,
      items: [
        { name: "Process & Screen Specbook", icon: FileText, isEnabled: true, moduleKey: "Process Specbook" },
        { name: "Recruitment Flowchart", icon: GitFork, isEnabled: true, moduleKey: "Recruitment Flowchart" },
        { name: "Sourcing Analytics", icon: BarChart2, isEnabled: true, moduleKey: "Sourcing Analytics" },
        { name: "Action Items", icon: Activity, isEnabled: true, moduleKey: "Action Items" },
        { name: "Weekly Reports", icon: FileClock, isEnabled: true, moduleKey: "Weekly Reports" },
      ]
    },
    {
      id: "insights-finance",
      title: "Insights & Finance",
      icon: BarChart3,
      items: [
        { name: "Reports", icon: BarChart2, isEnabled: false },
        { name: "Analytics", icon: PieChart, isEnabled: false },
        { name: "Costs", icon: DollarSign, isEnabled: false },
        { name: "Payroll", icon: DollarSign, isEnabled: false },
      ]
    },
    {
      id: "administration",
      title: "Administration",
      icon: Building2,
      items: [
        { name: "Departments", icon: Building2, isEnabled: true, moduleKey: "Departments" },
        { name: "Office Locations", icon: MapPin, isEnabled: true, moduleKey: "Office Locations" },
        { name: "Email Logs", icon: FileClock, isEnabled: true, moduleKey: "Email Logs" },
        { name: "UI Specbook (PDF)", icon: FileText, isEnabled: true, moduleKey: "Frontend Design PDF View" },
      ]
    },
    {
      id: "settings",
      title: "Settings",
      icon: Settings,
      items: [
        { name: "Recruitment Settings", icon: FileCog, isEnabled: true, moduleKey: "Recruitment Settings" },
        { name: "Account Settings", icon: UserCog, isEnabled: false },
      ]
    }
  ];

  const visibleCoreItems = coreHrItems.filter(item=>item.moduleKey && canAccessMenuItem(role,item.moduleKey,item.tabKey));
  const visibleGroups = workspaceGroups
    .map(group => ({...group, items: group.items.filter(item=>item.moduleKey && canAccessMenuItem(role,item.moduleKey,item.tabKey))}))
    .filter(group => group.items.length > 0);

  const handleItemClick = (item: MenuItem) => {
    if (!item.moduleKey || !canAccessMenuItem(role,item.moduleKey,item.tabKey)) return;
    if (!item.isEnabled) {
      setToastMessage(`"${item.name}" is simulated in this high-fidelity demonstration sandbox.`);
      return;
    }

    if (item.moduleKey && onModuleChange) {
      onModuleChange(item.moduleKey);
      if (item.tabKey && onTabChange) {
        onTabChange(item.tabKey);
      }
      if (onClose) {
        onClose();
      }
    }
  };

  const isItemActive = (item: MenuItem) => {
    if (item.moduleKey === "Workforce Hiring") {
      return currentModule === "Workforce Hiring" && activeTab === item.tabKey;
    }

    if (item.moduleKey === "Employee Journey") {
      if (item.tabKey) {
        return (currentModule === "Employee Journey" || currentModule === "30/60/90 Employee Journey") && activeTab === item.tabKey;
      }
      return currentModule === "Employee Journey" || currentModule === "30/60/90 Employee Journey";
    }

    if (item.moduleKey === "HR Admin Dashboard") {
      return currentModule === "HR Admin Dashboard" || currentModule === "HR Dashboard";
    }

    if (item.name === "Dashboard") {
      return (
        currentModule === "HR Dashboard" ||
        currentModule === "HR Admin Dashboard" ||
        currentModule === "TA Dashboard" ||
        currentModule === "OM Dashboard" ||
        currentModule === "Super Admin Dashboard" ||
        currentModule === "Employee Dashboard"
      );
    }

    if (item.name === "Leaves") {
      return currentModule === "Leaves & Time Off" || currentModule === "Leaves";
    }

    if (item.name === "Time & Attendance") {
      return currentModule === "Time & Attendance";
    }

    if (!item.moduleKey) return false;
    return currentModule === item.moduleKey;
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-40 lg:hidden transition-opacity"
          aria-label="Close sidebar backdrop"
        />
      )}

      <aside 
        className={`w-64 bg-[#042C51] text-white flex flex-col h-screen fixed top-0 left-0 z-50 lg:z-20 border-r border-[#083a69] select-none shadow-xl transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`} 
        id="sidebar-navigation"
      >
        {/* Brand Header */}
        <div className="p-4 sm:p-5 border-b border-[#083a69] flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Orange rounded square with S and small glowing accent dot */}
            <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-[#FF6B3D] to-[#FF5C28] flex items-center justify-center shadow-lg shadow-[#ff5c28]/25 shrink-0">
              <span className="text-xl font-black text-white tracking-tighter">S</span>
              <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-[#FFA488] border-2 border-[#042C51] shadow-xs" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="text-base font-extrabold tracking-tight">
                  <span className="text-[#FF8A65]">SiBS</span>{" "}
                  <span className="text-white">HRIS</span>
                </h1>
              </div>
              <p className="text-[8.5px] font-bold tracking-widest uppercase text-[#8FAEC9]">
                HUMAN RESOURCE SYSTEM
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              className="hidden lg:flex p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              title="Collapse Sidebar"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {/* Mobile Close Button */}
            {onClose && (
              <button 
                onClick={onClose}
                className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 lg:hidden cursor-pointer"
                aria-label="Close navigation"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Main Nav Items */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6 scrollbar-thin scrollbar-thumb-slate-700">
          
          {/* ==================== 1. CORE HR SECTION ==================== */}
          <div className="space-y-1">
            <h3 className="px-3 text-[10px] font-black text-[#6B90B5] uppercase tracking-widest leading-none mb-2">
              CORE HR
            </h3>
            <ul className="space-y-0.5">
              {visibleCoreItems.map((item, idx) => {
                const isActive = isItemActive(item);
                const isEnabled = item.isEnabled;
                return (
                  <li key={idx}>
                    <button
                      type="button"
                      onClick={() => handleItemClick(item)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-150 text-left ${
                        isActive
                          ? "bg-[#FF5C28] text-white font-bold rounded-xl shadow-xs cursor-pointer"
                          : isEnabled
                            ? "text-slate-200 hover:bg-[#063560] hover:text-white cursor-pointer"
                            : "text-slate-400/70 hover:text-slate-300/90 cursor-pointer"
                      }`}
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <item.icon className={`w-4 h-4 shrink-0 transition-colors ${
                          isActive 
                            ? "text-white"
                            : isEnabled 
                              ? "text-slate-400" 
                              : "text-slate-500/60"
                        }`} />
                        <span className={`truncate ${!isEnabled ? "opacity-80" : ""}`}>
                          {item.displayName || item.name}
                        </span>
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* ==================== 2. WORKSPACES SECTION ==================== */}
          <div className="space-y-3">
            <h3 className="px-3 text-[10px] font-black text-[#6B90B5] uppercase tracking-widest leading-none">
              WORKSPACES
            </h3>

            <div className="space-y-2">
              {visibleGroups.map((group) => {
                const hasActiveChild = group.items.some(item => isItemActive(item));
                const isCollapsed = hasActiveChild ? false : Boolean(collapsedGroups[group.id]);
                return (
                  <div key={group.id} className="space-y-1">
                    {/* Collapsible Workspace Group Header */}
                    <button
                      type="button"
                      onClick={() => toggleGroup(group.id)}
                      className="w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs font-bold text-slate-100 hover:text-white hover:bg-[#063560]/60 transition-colors text-left group cursor-pointer select-none"
                    >
                      <div className="flex items-center gap-2.5">
                        <group.icon className="w-4 h-4 text-slate-300 group-hover:text-white transition-colors" />
                        <span className="tracking-tight">{group.title}</span>
                      </div>
                      {isCollapsed ? (
                        <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-200 transition-transform" />
                      ) : (
                        <ChevronUp className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-200 transition-transform" />
                      )}
                    </button>

                    {/* Sub-items with subtle vertical guide line */}
                    {!isCollapsed && (
                      <ul className="ml-5 pl-3 border-l border-[#0e4478] space-y-0.5 py-0.5">
                        {group.items.map((item, iIdx) => {
                          const isActive = isItemActive(item);
                          const isEnabled = item.isEnabled;
                          return (
                            <li key={iIdx}>
                              <button
                                type="button"
                                onClick={() => handleItemClick(item)}
                                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-150 text-left ${
                                  isActive
                                    ? "bg-[#063b6d] text-white font-bold border border-blue-400/25 shadow-sm cursor-pointer"
                                    : isEnabled
                                      ? "text-slate-300 hover:bg-[#063560] hover:text-white cursor-pointer"
                                      : "text-slate-400/70 hover:text-slate-300/90 cursor-pointer"
                                }`}
                              >
                                <div className="flex items-center gap-2.5 truncate">
                                  <item.icon className={`w-4 h-4 shrink-0 transition-colors ${
                                    isActive 
                                      ? "text-[#FF5C28]" 
                                      : isEnabled 
                                        ? "text-slate-400" 
                                        : "text-slate-500/60"
                                  }`} />
                                  <span className={`truncate ${!isEnabled ? "opacity-80" : ""}`}>
                                    {item.displayName || item.name}
                                  </span>
                                </div>
                                {item.badge && (
                                  <span className={`px-1.5 py-0.5 text-[8.5px] font-black rounded uppercase tracking-wider shrink-0 ${
                                    item.badge === "RAMPS"
                                      ? "bg-[#063560] text-blue-200 border border-blue-400/30"
                                      : isActive 
                                        ? "bg-white text-[#FF5C28]" 
                                        : "bg-[#063560] text-slate-300"
                                  }`}>
                                    {item.badge}
                                  </span>
                                )}
                              </button>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Workspace Context & Footer */}
        <div className="p-4 border-t border-[#083a69] bg-[#032341] space-y-3.5 relative">
          {/* Toast Notification Container */}
          <AnimatePresence>
            {toastMessage && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 15 }}
                className="absolute bottom-full left-4 right-4 bg-[#0a467e] border border-blue-400/30 text-white p-2.5 rounded-xl shadow-2xl flex items-start gap-2 text-[10px] leading-relaxed z-30 mb-2"
              >
                <Info className="w-3.5 h-3.5 text-[#FF5C28] shrink-0 mt-0.5" />
                <div className="flex-1">
                  <span className="font-bold text-[#FF5C28]">Simulation Mode</span>
                  <p className="text-slate-200 mt-0.5">{toastMessage}</p>
                </div>
                <button 
                  onClick={() => setToastMessage(null)}
                  className="text-slate-400 hover:text-white shrink-0 cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></div>
              <span className="text-[11px]">System Online</span>
            </div>
            <button 
              id="sidebar-settings-btn"
              type="button"
              onClick={() => setIsSettingsPopupOpen(true)}
              className="text-slate-400 hover:text-white transition-colors duration-150 p-1.5 rounded-lg hover:bg-[#063560] cursor-pointer"
              title="System & Workflow Settings"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>

          {/* Settings Popup Modal with Flowchart Button */}
          <AnimatePresence>
            {isSettingsPopupOpen && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 10 }}
                  className="w-full max-w-md bg-white text-slate-800 rounded-2xl shadow-2xl border border-slate-200 overflow-hidden"
                >
                  {/* Modal Header */}
                  <div className="bg-[#042C51] p-4 text-white flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-[#FF5C28] flex items-center justify-center text-white">
                        <Settings className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-white leading-tight">
                          Settings & Architecture
                        </h3>
                        <p className="text-[10px] text-slate-300">
                          SiBS HRIS v2.5 Enterprise Workspace
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setIsSettingsPopupOpen(false)}
                      className="text-slate-400 hover:text-white p-1 rounded-md hover:bg-white/10 transition-colors cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Modal Body */}
                  <div className="p-5 space-y-4">
                    {/* Primary Highlighted Card: Architecture & Operational Flowcharts */}
                    <div className="bg-gradient-to-br from-orange-50 via-amber-50/50 to-blue-50 border-2 border-[#FF5C28] rounded-xl p-4 shadow-sm relative overflow-hidden">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-[#FF5C28] text-white flex items-center justify-center shadow-md">
                            <GitFork className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <h4 className="text-xs font-black text-[#042C51]">
                                Enterprise System Flowcharts
                              </h4>
                              <span className="px-1.5 py-0.5 rounded-full bg-[#FF5C28] text-white text-[9px] font-black uppercase tracking-wider">
                                5 WORKFLOWS
                              </span>
                            </div>
                            <p className="text-[10.5px] text-slate-600 font-medium mt-0.5">
                              Interactive Operational & Architectural Blueprints
                            </p>
                          </div>
                        </div>
                      </div>

                      <p className="text-[11px] text-slate-600 mt-2.5 leading-relaxed">
                        Explore the complete <strong>Information Architecture</strong>, <strong>Recruitment Pipeline</strong> (Steps 1–16), <strong>Workforce Planning Ramp</strong>, <strong>Core HR Lifecycle</strong>, and <strong>Organizational Governance</strong> with live simulators, Mermaid diagrams, and wireframe links.
                      </p>

                      {/* Prominent Flowchart Button */}
                      <button
                        id="open-flowchart-btn"
                        type="button"
                        onClick={() => {
                          setIsSettingsPopupOpen(false);
                          if (onModuleChange) {
                            onModuleChange("Recruitment Flowchart");
                          }
                        }}
                        className="mt-3.5 w-full py-2.5 px-4 bg-[#FF5C28] hover:bg-[#e04b1c] text-white text-xs font-bold rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer group"
                      >
                        <span>Open Architecture & Process Flowcharts</span>
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                      </button>
                    </div>

                    {/* Secondary Quick Settings Links */}
                    <div className="space-y-2">
                      <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
                        Module Configurations
                      </span>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <button
                          type="button"
                          onClick={() => {
                            setIsSettingsPopupOpen(false);
                            if (onModuleChange) onModuleChange("Recruitment Settings");
                          }}
                          className="p-2.5 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-left transition-colors cursor-pointer flex flex-col"
                        >
                          <span className="font-bold text-[#042C51] text-[11px]">Recruitment Settings</span>
                          <span className="text-[10px] text-slate-400">SLAs, Scoring & Emails</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setIsSettingsPopupOpen(false);
                            if (onModuleChange) onModuleChange("Office Locations");
                          }}
                          className="p-2.5 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-left transition-colors cursor-pointer flex flex-col"
                        >
                          <span className="font-bold text-[#042C51] text-[11px]">Campuses / Sites</span>
                          <span className="text-[10px] text-slate-400">Davao, Tagum, Mabini</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setIsSettingsPopupOpen(false);
                            if (onModuleChange) onModuleChange("Departments");
                          }}
                          className="p-2.5 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-left transition-colors cursor-pointer flex flex-col"
                        >
                          <span className="font-bold text-[#042C51] text-[11px]">Departments</span>
                          <span className="text-[10px] text-slate-400">7 Corporate Units</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setIsSettingsPopupOpen(false);
                            if (onModuleChange) onModuleChange("Email Logs");
                          }}
                          className="p-2.5 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-left transition-colors cursor-pointer flex flex-col"
                        >
                          <span className="font-bold text-[#042C51] text-[11px]">Email Logs</span>
                          <span className="text-[10px] text-slate-400">Outbound Audit</span>
                        </button>
                      </div>
                    </div>

                    {/* System Diagnostic Footer */}
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400 font-medium">
                      <div className="flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                        <span>Live Sync • Port 3000</span>
                      </div>
                      <span>Version 2.5 (2026)</span>
                    </div>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>
        </div>
      </aside>
    </>
  );
}