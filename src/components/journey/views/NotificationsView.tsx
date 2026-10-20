import React, { useState } from "react";
import { useJourney } from "../JourneyContext";
import { 
  Bell, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  User, 
  ShieldAlert, 
  Calendar, 
  Trash2, 
  Eye,
  Filter,
  Layers
} from "lucide-react";

interface NotificationsViewProps {
  onSwitchModule?: (moduleKey: string) => void;
}

export default function NotificationsView({ onSwitchModule }: NotificationsViewProps) {
  const { notifications, clearNotifications, journeys, coachingActions, setSelectedJourney } = useJourney();
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<string>("All");

  const roles = ["All", ...Array.from(new Set(notifications.map(n => n.role).filter(Boolean)))];

  const filteredNotifs = notifications.filter(n => {
    return selectedRoleFilter === "All" || n.role === selectedRoleFilter;
  });

  const openCoachingCount = coachingActions.filter(a => a.status === "Open").length;

  return (
    <div className="space-y-6">
      {/* Hero Banner (aligned to SiBS HRIS Deep Navy theme) */}
      <div className="bg-gradient-to-r from-[#042C51] via-[#0B365F] to-[#13406D] text-white p-6 rounded-2xl shadow-xs border border-[#13406D] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-black uppercase tracking-widest text-[#FF5C28]">
            SYSTEM NOTIFICATIONS & ESCALATION QUEUE
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-white mt-1 mb-2 tracking-tight">
            Journey Notifications
          </h2>
          <p className="text-xs text-[#E6EAF0] max-w-2xl leading-relaxed">
            Triggered by milestone dates, missing evidence, overdue support actions, pending approvals, and final disposition events.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={selectedRoleFilter}
            onChange={e => setSelectedRoleFilter(e.target.value)}
            className="text-xs font-semibold text-[#042C51] bg-white border border-[#BECBDA] rounded-xl px-3 py-2 outline-none cursor-pointer"
          >
            {roles.map((r, i) => (
              <option key={i} value={r as string}>Audience: {r}</option>
            ))}
          </select>

          {notifications.length > 0 && (
            <button
              onClick={clearNotifications}
              className="px-3.5 py-2 rounded-xl border border-red-200 bg-white/10 hover:bg-white/20 text-white font-semibold text-xs flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear History</span>
            </button>
          )}

          {onSwitchModule && (
            <button
              type="button"
              onClick={() => onSwitchModule("New Hire Orientation (NHO)")}
              className="px-3.5 py-2 rounded-xl border border-white/30 bg-white/10 hover:bg-white/20 text-white font-semibold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors shrink-0"
            >
              <Layers className="w-4 h-4 text-[#FF5C28]" />
              <span>Back to NHO</span>
            </button>
          )}
        </div>
      </div>

      {/* 3 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-[#E6ECF2] shadow-xs p-4 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Live Alerts</span>
            <strong className="text-2xl font-black text-[#042C51] mt-1 block">{filteredNotifs.length}</strong>
            <span className="text-[10px] text-slate-400">Generated from sample data</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-[#E6ECF2] shadow-xs p-4 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Logged Events</span>
            <strong className="text-2xl font-black text-[#042C51] mt-1 block">{notifications.length}</strong>
            <span className="text-[10px] text-slate-400">Recorded workflow history</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <Bell className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-[#E6ECF2] shadow-xs p-4 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Open Coaching Actions</span>
            <strong className="text-2xl font-black text-[#FF5C28] mt-1 block">{openCoachingCount}</strong>
            <span className="text-[10px] text-slate-400">Pending team leader follow-ups</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-orange-50 text-[#FF5C28] flex items-center justify-center font-bold">
            <Clock className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Notifications Log List */}
      <div className="bg-white rounded-2xl border border-[#E6ECF2] shadow-xs p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h2 className="text-sm font-extrabold text-[#042C51]">Automated Trigger Log</h2>
          <span className="text-xs text-slate-500 font-semibold">{filteredNotifs.length} items</span>
        </div>

        {filteredNotifs.length === 0 ? (
          <div className="py-12 text-center text-slate-400 space-y-2">
            <Bell className="w-8 h-8 text-slate-300 mx-auto" />
            <p className="text-xs font-semibold">No notifications match audience filter "{selectedRoleFilter}".</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredNotifs.map(n => {
              const matchedEmp = journeys.find(j => j.sibsEmployeeId === n.emp || j.id === n.emp);

              return (
                <div key={n.id} className="p-4 rounded-xl border border-[#E6ECF2] bg-white hover:border-[#BECBDA] transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.2 rounded text-[9.5px] font-bold sibs-tone-blue-bg sibs-tone-blue-text border sibs-tone-blue-border">
                        {n.role}
                      </span>
                      <span className="text-[10px] text-slate-400">{n.date}</span>
                    </div>

                    <p className="text-xs text-[#042C51] font-medium">{n.text}</p>
                    <span className="text-[10px] text-slate-400 block">Trainee: {matchedEmp?.fullName || n.emp}</span>
                  </div>

                  {matchedEmp && (
                    <button
                      onClick={() => setSelectedJourney(matchedEmp)}
                      className="px-3.5 py-1.5 rounded-xl border border-[#BECBDA] bg-white hover:bg-[#F7F9FC] text-[#042C51] text-xs font-semibold shrink-0 shadow-xs transition-colors"
                    >
                      Inspect Journey →
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
