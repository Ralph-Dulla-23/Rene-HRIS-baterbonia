import React, { useEffect, useState } from "react";
import { Bell, Search, ChevronDown, CalendarDays, Clock3, Menu, LogOut } from "lucide-react";

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

const manilaClock = () => {
  const now = new Date();
  return {
    date: new Intl.DateTimeFormat("en-US", {timeZone: "Asia/Manila", weekday:"long",month:"long",day:"numeric",year:"numeric"}).format(now),
    time: new Intl.DateTimeFormat("en-US", {timeZone:"Asia/Manila",hour:"numeric",minute:"2-digit",second:"2-digit",hour12:true}).format(now)
  };
};

export default function Header({userEmail,userName,userRole,onSignOut,onOpenCalendar,onToggleSidebar}: HeaderProps) {
  const [clock, setClock] = useState(manilaClock);
  useEffect(() => {
    const timer = setInterval(() => setClock(manilaClock()),1000);
    return () => clearInterval(timer);
  }, []);
  const initials = (userName || "Demo User").split(/\s+/).filter(Boolean).slice(0,2).map(part=>part[0]).join("").toUpperCase();
  return (
    <header className="sibs-hris-topbar fixed top-0 right-0 left-0 lg:left-56 z-30 h-[68px] bg-[#F8FAFC] border-b border-[#DDE5EE] flex items-center justify-between gap-3 px-3 sm:px-5 select-none">
      <div className="flex items-center gap-2 min-w-0 flex-1 max-w-[620px]">
        <button type="button" onClick={onToggleSidebar} className="lg:hidden p-2 rounded-lg text-[#042C51] hover:bg-slate-100" aria-label="Toggle navigation menu"><Menu className="w-5 h-5"/></button>
        <div className="relative w-full min-w-0">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#94A9C1]" aria-hidden="true"/>
          <input aria-label="Search HRIS" type="search" placeholder="Search employees, JD, positions, accounts, or modules (Ctrl+K)" className="w-full bg-transparent text-[11px] sm:text-xs font-medium text-[#344054] placeholder:text-[#94A9C1] rounded-lg pl-9 pr-3 py-2 border border-transparent focus:border-[#D7DEE8] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF5C28]/10 transition-colors"/>
        </div>
      </div>
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        <div className="hidden xl:flex items-center gap-2 rounded-xl border border-[#D7DEE8] bg-white px-3 py-2 text-[#042C51]">
          <Clock3 className="w-4 h-4 text-[#FF5C28] shrink-0"/>
          <div className="leading-tight">
            <div className="text-[9px] text-[#667085]">{clock.date}</div>
            <div className="text-[11px] font-extrabold tabular-nums">{clock.time} <span className="text-[#667085] font-medium">PHT</span></div>
          </div>
        </div>
        {onOpenCalendar && <button type="button" onClick={onOpenCalendar} className="hidden md:flex items-center gap-2 rounded-xl border border-[#FFD8CA] bg-[#FFF8F5] px-3 py-2 text-[11px] font-bold text-[#042C51] hover:bg-[#FFEDD2] transition-colors" title="Open SiBS Calendar"><CalendarDays className="w-4 h-4 text-[#FF5C28]"/><span>SiBS Calendar</span><span className="text-[#94A9C1]">›</span></button>}
        <div className="relative p-2 text-[#667085]" title="Demo notifications"><Bell className="w-[18px] h-[18px]"/><span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full border border-white bg-[#FF5C28]"/></div>
        <div className="hidden sm:flex items-center gap-2.5 border-l border-[#DDE5EE] pl-3 min-w-0">
          <div className="w-9 h-9 rounded-full bg-[#042C51] text-white flex items-center justify-center text-[11px] font-black shrink-0">{initials}</div>
          <div className="hidden lg:block leading-tight min-w-0 max-w-[210px]">
            <div className="truncate text-[11px] font-extrabold text-[#042C51]">{userName || "Demo User"}</div>
            <div className="truncate text-[10px] font-medium text-[#FF5C28]">{userEmail || userRole || "Demo Account"}</div>
          </div>
          <ChevronDown className="hidden lg:block w-3 h-3 text-[#667085]"/>
        </div>
        {onSignOut && <button type="button" onClick={onSignOut} title="Sign out of demo account" className="inline-flex items-center gap-1.5 rounded-lg border border-[#D7DEE8] bg-white px-2.5 py-2 text-[11px] font-bold text-[#042C51] hover:bg-[#FFF8F5] hover:border-[#FF5C28] transition-colors"><LogOut className="w-4 h-4"/><span className="hidden md:inline">Sign Out</span></button>}
      </div>
    </header>
  );
}
