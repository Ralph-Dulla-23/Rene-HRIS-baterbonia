import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  MapPin,
  GraduationCap,
  FileText,
  FileCode,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  BookOpen,
  Eye,
  X,
  LayoutGrid,
  List,
  Info
} from 'lucide-react';
import { NHODailyTrainingSchedule, NHOQDSMaterial } from './nhoTypes';
import { generate2WeekTrainingSchedule } from './scheduleUtils';

interface Props {
  schedule?: NHODailyTrainingSchedule[];
  startDate?: string;
  assignedTrainerId?: string;
  assignedTrainerName?: string;
  existingMaterials?: NHOQDSMaterial[];
  shiftHours?: string;
  trainingLocation?: string;
  traineeName?: string;
  readonly?: boolean;
}

export default function TwoWeekTrainingScheduleView({
  schedule: initialSchedule,
  startDate = '2026-10-12',
  assignedTrainerId,
  assignedTrainerName,
  existingMaterials = [],
  shiftHours = '08:00 AM – 05:00 PM (Default)',
  trainingLocation = 'Fintech Training Room 4A',
  traineeName
}: Props) {
  // Generate or use existing 2-week schedule
  const scheduleData = React.useMemo(() => {
    if (initialSchedule && initialSchedule.length === 10) {
      return initialSchedule;
    }
    return generate2WeekTrainingSchedule(
      startDate,
      assignedTrainerId,
      assignedTrainerName,
      existingMaterials,
      shiftHours,
      trainingLocation
    );
  }, [initialSchedule, startDate, assignedTrainerId, assignedTrainerName, existingMaterials, shiftHours, trainingLocation]);

  // Tab filter: 'all' | 'fst' (Week 1) | 'pst' (Week 2)
  const [activeTab, setActiveTab] = useState<'all' | 'fst' | 'pst'>('all');

  // View mode: 'cards' (responsive 2-col cards) | 'table' (compact data-dense table)
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  
  // Selected day for modal inspection (clicking a day opens its materials & trainer)
  const [selectedDayNumber, setSelectedDayNumber] = useState<number | null>(null);

  // Material preview modal
  const [previewingMaterial, setPreviewingMaterial] = useState<NHOQDSMaterial | null>(null);

  const selectedDay = React.useMemo(() => {
    if (selectedDayNumber === null) return null;
    return scheduleData.find(d => d.dayNumber === selectedDayNumber) || null;
  }, [scheduleData, selectedDayNumber]);

  const fstDays = React.useMemo(() => scheduleData.filter(d => d.phase === 'FST'), [scheduleData]);
  const pstDays = React.useMemo(() => scheduleData.filter(d => d.phase === 'PST'), [scheduleData]);

  const displayedDays = React.useMemo(() => {
    if (activeTab === 'fst') return fstDays;
    if (activeTab === 'pst') return pstDays;
    return scheduleData;
  }, [scheduleData, activeTab, fstDays, pstDays]);

  const totalMaterials = scheduleData.reduce((acc, d) => acc + d.materials.length, 0);

  const getMaterialIcon = (type: string) => {
    switch (type) {
      case 'PDF Document':
        return <FileText className="w-4 h-4 text-rose-500 shrink-0" />;
      case 'PowerPoint Presentation':
        return <FileCode className="w-4 h-4 text-amber-500 shrink-0" />;
      case 'Word Document':
        return <FileText className="w-4 h-4 text-blue-500 shrink-0" />;
      case 'Approved Training Resource Link':
        return <ExternalLink className="w-4 h-4 text-emerald-500 shrink-0" />;
      default:
        return <FileText className="w-4 h-4 text-slate-500 shrink-0" />;
    }
  };

  const handleNextDay = () => {
    if (selectedDayNumber === null) return;
    const next = selectedDayNumber >= 10 ? 1 : selectedDayNumber + 1;
    setSelectedDayNumber(next);
  };

  const handlePrevDay = () => {
    if (selectedDayNumber === null) return;
    const prev = selectedDayNumber <= 1 ? 10 : selectedDayNumber - 1;
    setSelectedDayNumber(prev);
  };

  // Format date nicely e.g. "Friday, Oct 09, 2026"
  const formatFullDate = (dateStr: string, dayOfWeek: string) => {
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const mIdx = parseInt(parts[1], 10) - 1;
      const monthName = months[mIdx] || parts[1];
      return `${dayOfWeek}, ${monthName} ${parts[2]}, ${parts[0]}`;
    }
    return `${dayOfWeek}, ${dateStr}`;
  };

  return (
    <div className="space-y-3 font-jakarta">
      {/* Sleek Integrated Header & Responsive Controls */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3 p-3 bg-gradient-to-r from-[#042C51]/10 via-[#042C51]/5 to-orange-50/50 rounded-xl border border-[#BECBDA]">
        <div className="space-y-0.5 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider bg-[#042C51] text-white">
              2-Week Curriculum Schedule
            </span>
            <span className="text-xs font-bold text-[#042C51]">
              PST &amp; FST Training Matrix (10 Working Days)
            </span>
            <span className="hidden sm:inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
              {totalMaterials} Assigned Materials
            </span>
          </div>
          <p className="text-[11px] text-slate-600">
            Click any day to inspect the <strong>assigned materials</strong> and <strong>designated trainer</strong>.
          </p>
        </div>

        {/* Action Controls: Tabs & View Toggle */}
        <div className="flex flex-wrap items-center gap-2 self-stretch lg:self-auto shrink-0">
          {/* Phase Filter Tabs */}
          <div className="flex items-center gap-1 p-0.5 bg-white rounded-lg border border-slate-200 shadow-2xs">
            <button
              type="button"
              onClick={() => setActiveTab('all')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all ${
                activeTab === 'all'
                  ? 'bg-[#042C51] text-white shadow-xs'
                  : 'text-slate-600 hover:text-[#042C51] hover:bg-slate-50'
              }`}
            >
              All 10 Days
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('fst')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all flex items-center gap-1 ${
                activeTab === 'fst'
                  ? 'bg-blue-700 text-white shadow-xs'
                  : 'text-blue-700 hover:bg-blue-50'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
              Week 1: FST (5d)
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('pst')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all flex items-center gap-1 ${
                activeTab === 'pst'
                  ? 'bg-[#FF5C28] text-white shadow-xs'
                  : 'text-orange-700 hover:bg-orange-50'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-orange-300" />
              Week 2: PST (5d)
            </button>
          </div>

          {/* View Mode Switcher (Cards vs Table) */}
          <div className="flex items-center gap-0.5 p-0.5 bg-white rounded-lg border border-slate-200 shadow-2xs">
            <button
              type="button"
              onClick={() => setViewMode('cards')}
              className={`p-1.5 rounded-md transition-colors ${
                viewMode === 'cards'
                  ? 'bg-[#042C51] text-white shadow-xs'
                  : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'
              }`}
              title="Cards View"
              aria-label="Cards View"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-md transition-colors ${
                viewMode === 'table'
                  ? 'bg-[#042C51] text-white shadow-xs'
                  : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'
              }`}
              title="Compact Table View"
              aria-label="Compact Table View"
            >
              <List className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Compact Secondary Metadata Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 bg-white rounded-lg border border-slate-200 text-[11px]">
        <div className="flex flex-wrap items-center gap-4 text-slate-600">
          <span className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-[#FF5C28]" />
            <span>Shift: <strong className="text-slate-800 font-semibold">{shiftHours}</strong></span>
          </span>
          <span className="flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-slate-400" />
            <span>Room: <strong className="text-slate-800 font-semibold">{trainingLocation}</strong></span>
          </span>
          <span className="flex items-center gap-1.5">
            <GraduationCap className="w-3.5 h-3.5 text-[#042C51]" />
            <span>Trainer: <strong className="text-slate-800 font-semibold">{assignedTrainerName || 'Maria Elena Garcia (Senior Trainer)'}</strong></span>
          </span>
        </div>

        <div className="text-[10px] text-slate-400">
          Showing <strong>{displayedDays.length}</strong> of 10 days
        </div>
      </div>

      {/* Fixed-Height Scrollable Schedule Container */}
      <div className="relative rounded-xl border border-slate-200 bg-[#F7F9FC] p-3 shadow-2xs">
        <div className="max-h-[380px] sm:max-h-[420px] overflow-y-auto space-y-4 pr-1.5 focus:outline-none">
          {viewMode === 'cards' ? (
            /* Cards View: Responsive 2-column grid with ample width and zero truncation */
            <div className="space-y-4">
              {/* If viewing All or FST: render Week 1 FST section */}
              {(activeTab === 'all' || activeTab === 'fst') && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between px-1">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                      <h4 className="text-xs font-extrabold text-[#042C51] uppercase tracking-wider">
                        Week 1: Foundation Skills Training (FST)
                      </h4>
                      <span className="px-1.5 py-0.2 rounded text-[9.5px] font-bold bg-blue-100 text-blue-800 border border-blue-200">
                        Days 1–5
                      </span>
                    </div>
                    <span className="text-[10.5px] text-slate-500 font-medium">
                      Culture, Communication, Compliance &amp; Systems
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                    {fstDays.map(day => renderDayCard(day))}
                  </div>
                </div>
              )}

              {/* If viewing All or PST: render Week 2 PST section */}
              {(activeTab === 'all' || activeTab === 'pst') && (
                <div className="space-y-2 pt-1">
                  <div className="flex items-center justify-between px-1">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#FF5C28]" />
                      <h4 className="text-xs font-extrabold text-[#042C51] uppercase tracking-wider">
                        Week 2: Product Specific Training (PST)
                      </h4>
                      <span className="px-1.5 py-0.2 rounded text-[9.5px] font-bold bg-orange-100 text-[#FF5C28] border border-orange-200">
                        Days 6–10
                      </span>
                    </div>
                    <span className="text-[10.5px] text-slate-500 font-medium">
                      Fintech Product Matrix, Disputes, Sandbox &amp; Certification
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                    {pstDays.map(day => renderDayCard(day))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Table View: Compact data-dense table with zero truncation */
            <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-2xs">
              <table className="w-full text-left text-[11px] border-collapse">
                <thead>
                  <tr className="bg-[#042C51] text-white text-[10px] uppercase font-bold tracking-wider">
                    <th className="py-2.5 px-3">Day &amp; Phase</th>
                    <th className="py-2.5 px-3">Date</th>
                    <th className="py-2.5 px-3">Curriculum Module Title</th>
                    <th className="py-2.5 px-3">Designated Trainer</th>
                    <th className="py-2.5 px-3 text-center">Materials</th>
                    <th className="py-2.5 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {displayedDays.map(day => {
                    const isFST = day.phase === 'FST';
                    const isSelected = selectedDayNumber === day.dayNumber;

                    return (
                      <tr
                        key={day.dayNumber}
                        onClick={() => setSelectedDayNumber(day.dayNumber)}
                        className={`transition-colors cursor-pointer hover:bg-orange-50/40 ${
                          isSelected ? 'bg-orange-50/80 font-medium' : 'bg-white'
                        }`}
                      >
                        <td className="py-2.5 px-3 font-bold whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[#042C51]">Day {day.dayNumber}</span>
                            <span
                              className={`px-1.5 py-0.2 rounded text-[9px] font-extrabold uppercase ${
                                isFST
                                  ? 'bg-blue-100 text-blue-800 border border-blue-200'
                                  : 'bg-orange-100 text-[#FF5C28] border border-orange-200'
                              }`}
                            >
                              {day.phase}
                            </span>
                          </div>
                        </td>

                        <td className="py-2.5 px-3 whitespace-nowrap text-slate-600 font-medium">
                          {formatFullDate(day.date, day.dayOfWeek)}
                        </td>

                        <td className="py-2.5 px-3">
                          <div className="font-bold text-[#042C51] leading-tight">
                            {day.title}
                          </div>
                          <div className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">
                            {day.topics.slice(0, 2).join(' • ')}
                          </div>
                        </td>

                        <td className="py-2.5 px-3 whitespace-nowrap text-slate-700">
                          <div className="flex items-center gap-1.5">
                            <GraduationCap className="w-3.5 h-3.5 text-[#FF5C28] shrink-0" />
                            <span className="font-semibold text-[#042C51]">
                              {day.trainerName.split('(')[0].trim()}
                            </span>
                          </div>
                        </td>

                        <td className="py-2.5 px-3 text-center whitespace-nowrap">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-bold text-[10px] border border-slate-200">
                            <FileText className="w-3 h-3 text-[#042C51]" />
                            <span>{day.materials.length} Items</span>
                          </span>
                        </td>

                        <td className="py-2.5 px-3 text-right whitespace-nowrap">
                          <button
                            type="button"
                            onClick={e => {
                              e.stopPropagation();
                              setSelectedDayNumber(day.dayNumber);
                            }}
                            className="px-2.5 py-1 rounded-lg bg-[#FF5C28] hover:bg-[#e04f20] text-white font-bold text-[10px] transition-colors cursor-pointer shadow-2xs"
                          >
                            Inspect Day →
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Footer Info */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1 text-[11px] text-slate-500 px-1">
        <span className="flex items-center gap-1.5">
          <Info className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span>Click any day card or row to open full daily materials, slide decks, and trainer profiles.</span>
        </span>
        <span className="font-semibold text-slate-600">
          Scrollable matrix container · Fixed height
        </span>
      </div>

      {/* Interactive Day Inspection Modal */}
      {selectedDay && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto"
        >
          <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden font-jakarta my-6 animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-start justify-between p-5 bg-[#042C51] text-white">
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider ${
                      selectedDay.phase === 'FST'
                        ? 'bg-blue-500 text-white'
                        : 'bg-[#FF5C28] text-white'
                    }`}
                  >
                    Week {selectedDay.weekNumber} · {selectedDay.phase}
                  </span>
                  <span className="text-xs font-bold text-slate-300">
                    Day {selectedDay.dayNumber} of 10
                  </span>
                  <span className="text-xs text-slate-300">
                    • {formatFullDate(selectedDay.date, selectedDay.dayOfWeek)}
                  </span>
                </div>
                <h3 className="text-base font-extrabold text-white">
                  {selectedDay.title}
                </h3>
              </div>

              <button
                type="button"
                onClick={() => setSelectedDayNumber(null)}
                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                title="Close modal"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-4 max-h-[72vh] overflow-y-auto">
              {/* Section 1: Designated Session Trainer */}
              <div className="p-4 bg-gradient-to-r from-orange-50/70 via-white to-slate-50 rounded-xl border border-orange-200/80 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10.5px] font-extrabold uppercase tracking-wider text-[#042C51] flex items-center gap-1.5">
                    <GraduationCap className="w-4 h-4 text-[#FF5C28]" />
                    <span>Designated Session Trainer</span>
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-100 text-green-800 border border-green-200 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-green-600" />
                    <span>Confirmed Responsibility</span>
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-1">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-full bg-[#042C51] text-white flex items-center justify-center font-bold text-sm shadow-xs border-2 border-orange-200 shrink-0">
                      {selectedDay.trainerName
                        .split(' ')
                        .slice(0, 2)
                        .map(n => n[0])
                        .join('')}
                    </div>
                    <div>
                      <h4 className="text-sm font-extrabold text-[#042C51]">
                        {selectedDay.trainerName}
                      </h4>
                      <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                        <span className="font-mono font-bold text-[#FF5C28]">
                          {selectedDay.trainerId}
                        </span>
                        <span>•</span>
                        <span>{selectedDay.trainerRole || 'Senior Operations Trainer'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right text-[11px] space-y-0.5 self-end sm:self-auto bg-white/80 px-3 py-1.5 rounded-lg border border-slate-200">
                    <div className="text-slate-500 font-medium flex items-center gap-1">
                      <Clock className="w-3 h-3 text-[#FF5C28]" />
                      <span>{selectedDay.shiftHours}</span>
                    </div>
                    <div className="text-slate-700 font-bold flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      <span>{selectedDay.room}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 2: Materials Assigned That Day */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10.5px] font-extrabold uppercase tracking-wider text-[#042C51] flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4 text-[#FF5C28]" />
                    <span>Materials Assigned for Day {selectedDay.dayNumber} ({selectedDay.materials.length})</span>
                  </span>
                  <span className="text-[11px] text-slate-400 font-medium">
                    Curriculum items for this specific session
                  </span>
                </div>

                <div className="space-y-2">
                  {selectedDay.materials.map(material => (
                    <div
                      key={material.id}
                      className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs hover:border-slate-300 transition-colors flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                    >
                      <div className="flex items-start gap-3 min-w-0">
                        <div className="p-2 rounded-lg bg-slate-50 border border-slate-200 shrink-0 mt-0.5">
                          {getMaterialIcon(material.type)}
                        </div>
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <h5 className="text-xs font-bold text-[#042C51]">
                              {material.title}
                            </h5>
                            <span className="px-1.5 py-0.2 rounded text-[9.5px] font-mono font-semibold bg-slate-100 text-slate-700 shrink-0">
                              {material.type}
                            </span>
                          </div>
                          {material.description && (
                            <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                              {material.description}
                            </p>
                          )}
                          <div className="flex flex-wrap items-center gap-3 text-[10px] text-slate-400 mt-1">
                            <span>Ref: <strong className="text-slate-600 font-mono">{material.fileOrLinkRef}</strong></span>
                            {material.fileSize && <span>• Size: {material.fileSize}</span>}
                            <span>• Source: {material.source || 'Catalog'}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-auto">
                        <button
                          type="button"
                          onClick={() => setPreviewingMaterial(material)}
                          className="px-2.5 py-1.5 rounded-lg bg-[#042C51] hover:bg-[#0B365F] text-white text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer shadow-2xs"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Preview</span>
                        </button>
                      </div>
                    </div>
                  ))}

                  {selectedDay.materials.length === 0 && (
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-center text-xs text-slate-500">
                      No materials assigned for this day yet.
                    </div>
                  )}
                </div>
              </div>

              {/* Section 3: Daily Topics & Competencies */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-600 block">
                  Session Learning Objectives &amp; Focus Topics:
                </span>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-slate-700">
                  {selectedDay.topics.map((topic, tIdx) => (
                    <li key={tIdx} className="flex items-start gap-2 bg-white p-2 rounded-lg border border-slate-200/80">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#FF5C28] mt-1.5 shrink-0" />
                      <span>{topic}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Modal Footer with Previous / Next Day Steppers */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              <button
                type="button"
                onClick={handlePrevDay}
                className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-xs font-bold text-slate-700 flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Previous Day</span>
              </button>

              <span className="text-xs font-bold text-[#042C51]">
                Day {selectedDay.dayNumber} of 10 ({selectedDay.phase})
              </span>

              <button
                type="button"
                onClick={handleNextDay}
                className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-xs font-bold text-slate-700 flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                <span>Next Day</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Material Quick Preview Modal */}
      {previewingMaterial && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-60 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4"
        >
          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 space-y-4 font-jakarta animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-orange-50 text-[#FF5C28]">
                  {getMaterialIcon(previewingMaterial.type)}
                </div>
                <div>
                  <h4 className="text-sm font-extrabold text-[#042C51]">
                    {previewingMaterial.title}
                  </h4>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {previewingMaterial.fileOrLinkRef}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setPreviewingMaterial(null)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-500 cursor-pointer"
                aria-label="Close preview"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs text-slate-700">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200 text-[11px]">
                <span className="text-slate-500 font-semibold">Document Format:</span>
                <span className="font-bold text-[#042C51]">{previewingMaterial.type}</span>
              </div>
              <div className="flex items-center justify-between pb-2 border-b border-slate-200 text-[11px]">
                <span className="text-slate-500 font-semibold">Allocated Size:</span>
                <span className="font-bold text-slate-700">{previewingMaterial.fileSize || 'Standard'}</span>
              </div>
              <div className="flex items-center justify-between pb-2 border-b border-slate-200 text-[11px]">
                <span className="text-slate-500 font-semibold">Assigned By:</span>
                <span className="font-bold text-slate-700">{previewingMaterial.assignedBy}</span>
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed pt-1">
                {previewingMaterial.description || 'Full curriculum document prepared for trainee self-paced study and classroom coaching.'}
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setPreviewingMaterial(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                Close Preview
              </button>
              <button
                type="button"
                onClick={() => {
                  alert(`Accessing material: ${previewingMaterial.fileOrLinkRef}`);
                  setPreviewingMaterial(null);
                }}
                className="px-4 py-2 rounded-xl bg-[#FF5C28] hover:bg-[#e04f20] text-white text-xs font-bold shadow-xs cursor-pointer transition-colors"
              >
                Open Full Document
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // Helper render function for Day Cards (wide, comfortable, zero truncation)
  function renderDayCard(day: NHODailyTrainingSchedule) {
    const isFST = day.phase === 'FST';
    const isSelected = selectedDayNumber === day.dayNumber;

    return (
      <div
        key={day.dayNumber}
        onClick={() => setSelectedDayNumber(day.dayNumber)}
        className={`group relative flex flex-col justify-between p-3.5 rounded-xl border text-left transition-all duration-200 cursor-pointer shadow-2xs hover:shadow-md hover:-translate-y-0.5 ${
          isSelected
            ? 'border-[#FF5C28] ring-2 ring-[#FF5C28]/25 bg-white'
            : isFST
            ? 'border-blue-200/90 bg-white hover:border-blue-400'
            : 'border-orange-200/90 bg-white hover:border-orange-400'
        }`}
      >
        {/* Card Header: Day Badge, Phase Badge & Formatted Date */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5">
              <span className="font-black text-xs text-[#042C51]">
                Day {day.dayNumber}
              </span>
              <span
                className={`px-1.5 py-0.2 rounded text-[9px] font-extrabold uppercase tracking-wider ${
                  isFST
                    ? 'bg-blue-100 text-blue-800 border border-blue-200'
                    : 'bg-orange-100 text-[#FF5C28] border border-orange-200'
                }`}
              >
                {day.phase}
              </span>
            </div>

            {/* Complete, fully readable date — zero clipping */}
            <div className="text-[10px] text-slate-500 font-bold flex items-center gap-1 shrink-0">
              <Calendar className="w-3 h-3 text-slate-400 shrink-0" />
              <span>{formatFullDate(day.date, day.dayOfWeek)}</span>
            </div>
          </div>

          {/* Module Title: Clear, never clipped */}
          <h5 className="text-xs font-bold text-[#042C51] leading-snug group-hover:text-[#FF5C28] transition-colors">
            {day.title}
          </h5>

          {/* Topic Pills Preview */}
          <div className="flex flex-wrap items-center gap-1 pt-0.5">
            {day.topics.slice(0, 2).map((t, tIdx) => (
              <span
                key={tIdx}
                className="px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 text-[9.5px] truncate max-w-[200px]"
              >
                {t}
              </span>
            ))}
            {day.topics.length > 2 && (
              <span className="text-[9px] text-slate-400 font-bold">
                +{day.topics.length - 2} more
              </span>
            )}
          </div>
        </div>

        {/* Card Footer: Designated Trainer & Materials Info */}
        <div className="mt-3 pt-2.5 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-[10.5px]">
          {/* Designated Trainer info */}
          <div className="flex items-center gap-1.5 text-slate-700 min-w-0">
            <div className="w-5 h-5 rounded-full bg-[#042C51] text-white flex items-center justify-center text-[9px] font-bold shrink-0">
              {day.trainerName.split(' ')[0][0]}
            </div>
            <span className="font-semibold text-slate-800 truncate" title={day.trainerName}>
              {day.trainerName.split('(')[0].trim()}
            </span>
          </div>

          {/* Materials Badge & Action */}
          <div className="flex items-center gap-2 shrink-0">
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-slate-50 text-slate-700 font-bold text-[10px] border border-slate-200">
              <FileText className="w-3 h-3 text-[#FF5C28]" />
              <span>{day.materials.length} Materials</span>
            </span>

            <span className="text-[10px] font-bold text-[#FF5C28] group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
              <span>View</span>
              <span>→</span>
            </span>
          </div>
        </div>

        {/* Selected checkmark indicator */}
        {isSelected && (
          <div className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-[#FF5C28] text-white flex items-center justify-center text-[9px] shadow-xs">
            ✓
          </div>
        )}
      </div>
    );
  }
}
