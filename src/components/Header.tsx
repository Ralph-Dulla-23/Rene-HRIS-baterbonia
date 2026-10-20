import React, { useState, useEffect } from "react";
import { 
  Bell, 
  Search, 
  Globe, 
  Database, 
  ChevronDown, 
  User, 
  CheckCircle2,
  Calendar,
  Layers,
  Sparkles,
  Menu, LogOut
} from "lucide-react";

interface HeaderProps {
  userEmail: string;
  userName?: string;
  userRole?: string;
  onSignOut?: () => void;
  onOpenCalendar?: () => void;
  onToggleSidebar?: () => void;
  onOpenDesignSystem?: () => void;
  onOpenProcessSpecbook?: () => void;
  onOpenFigmaExporter?: () => void;
}

export default function Header({ userEmail, userName, userRole, onSignOut, onOpenCalendar, onToggleSidebar, onOpenDesignSystem, onOpenProcessSpecbook, onOpenFigmaExporter }: HeaderProps) {
  const [timeStr, setTimeStr] = useState("Sep 21, 2026, 05:28:12 PM GMT+8");
  
  useEffect(() => {
    // Keep a simulated clock updating
    const interval = setInterval(() => {
      const now = new Date();
      const formatted = now.toLocaleDateString("en-US", {
        month: "short",
        day: "2-digit",
        year: "numeric"
      }) + ", " + now.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true
      }) + " GMT+8";
      setTimeStr(formatted);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="h-16 bg-white border-b-2 border-[#FF5C28] flex items-center justify-between px-3 sm:px-6 fixed top-0 right-0 left-0 lg:left-64 z-10 select-none shadow-xs transition-all duration-300">
      {/* Top Accent Gradient Bar: Deep Navy to Vivid Orange */}
      <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#042C51] via-[#c24b30] to-[#FF5C28]" />

      {/* Left Area: Mobile Menu Button + Search Bar */}
      <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1 max-w-xl">
        {/* Mobile Hamburger Toggle */}
        <button
          onClick={onToggleSidebar}
          className="p-2 -ml-1 text-slate-600 hover:text-[#042C51] hover:bg-slate-100 rounded-lg lg:hidden cursor-pointer shrink-0"
          aria-label="Toggle navigation menu"
          title="Open Navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="relative w-full max-w-md">
          <span className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
            <Search className="w-4 h-4 text-slate-400" />
          </span>
          <input
            type="text"
            placeholder="Search employees, JD, positions, accounts, or modules (Ctrl+K)"
            className="w-full pl-9 pr-4 py-1.5 bg-transparent border border-transparent rounded-lg text-xs font-medium text-[#101828] placeholder-slate-400 focus:outline-none focus:bg-slate-50 focus:border-slate-300 transition-all duration-150 truncate"
          />
        </div>
      </div>

      {/* Utilities & User Actions */}
      <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
        {/* Live Date & Time Display */}
        <div 
          onClick={onOpenCalendar}
          title="Click to view HR & Talent Acquisition calendar"
          className="hidden md:flex items-center gap-2 text-xs text-slate-600 font-medium cursor-pointer hover:text-[#042C51] transition-colors"
        >
          <Calendar className="w-4 h-4 text-slate-400" />
          <span className="text-[11.5px] text-slate-600 tracking-tight font-medium">
            {timeStr}
          </span>
        </div>

        {/* Notification Bell */}
        <button 
          className="p-1.5 sm:p-2 text-slate-600 hover:text-[#042C51] hover:bg-slate-100 rounded-xl transition-all relative cursor-pointer"
          title="System Notifications"
        >
          <Bell className="w-4.5 h-4.5" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-[#FF5C28] rounded-full ring-2 ring-white"></span>
        </button>

        {/* User Account Menu */}
        <div className="flex items-center gap-2.5 pl-2 border-l border-slate-200 cursor-pointer group">
          <div className="w-8 h-8 rounded-full bg-[#042C51] border border-slate-200 overflow-hidden flex items-center justify-center text-white font-bold text-xs shadow-xs shrink-0">
            <span className="text-white font-black text-xs">{(userName || 'DEMO').split(/\s+/).slice(0,2).map(x=>x[0]).join('').toUpperCase()}</span>
          </div>
          <div className="hidden md:block text-left leading-tight">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-[#042C51] tracking-tight">
                {userName || 'Demo User'}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-500 group-hover:text-slate-800 transition-colors" />
            </div>
            <span className="text-[10.5px] font-medium text-[#FF5C28] lowercase tracking-normal block">
              {userEmail || userRole || 'Demo Account'}
            </span>
          </div>
        </div>
        {onSignOut && <button type="button" onClick={onSignOut} title="Sign out of demo account" className="flex items-center gap-1 rounded-lg border border-[#E6ECF2] px-2.5 py-2 text-xs font-bold text-[#042C51] hover:bg-orange-50 hover:border-[#FF5C28] transition-colors"><LogOut className="w-4 h-4"/><span className="hidden sm:inline">Sign Out</span></button>}
      </div>
    </header>
  );
}
