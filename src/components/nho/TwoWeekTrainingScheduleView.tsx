import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  MapPin,
  User,
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
  Layers,
  Sparkles,
  Download,
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
  
  // Selected day for modal inspection (clicking a day opens its materials & trainer)
  const [selectedDayNumber, setSelectedDayNumber] = useState<number | null>(null);

  // Material preview modal
  const [previewingMaterial, setPreviewingMaterial] = useState<NHOQDSMaterial | null>(null);

  const selectedDay = React.useMemo(() => {
    if (selectedDayNumber === null) return null;
    return scheduleData.find(d => d.dayNumber === selectedDayNumber) || null;
  }, [scheduleData, selectedDayNumber]);

  const displayedDays = React.useMemo(() => {
    if (activeTab === 'fst') {
      return scheduleData.filter(d => d.phase === 'FST');
    }
    if (activeTab === 'pst') {
      return scheduleData.filter(d => d.phase === 'PST');
    }
    return scheduleData;
  }, [scheduleData, activeTab]);

  const fstDaysCount = scheduleData.filter(d => d.phase === 'FST').length;
  const pstDaysCount = scheduleData.filter(d => d.phase === 'PST').length;
  const totalMaterials = scheduleData.reduce((acc, d) => acc + d.materials.length, 0);

  const getMaterialIcon = (type: string) => {
    switch (type) {
      case 'PDF Document':
        return <FileText className="w-4 h-4 text-rose-500" />;
      case 'PowerPoint Presentation':
        return <FileCode className="w-4 h-4 text-amber-500" />;
      case 'Word Document':
        return <FileText className="w-4 h-4 text-blue-500" />;
      case 'Approved Training Resource Link':
        return <ExternalLink className="w-4 h-4 text-emerald-500" />;
      default:
        return <FileText className="w-4 h-4 text-slate-500" />;
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

  return (
    <div className="space-y-4">
      {/* Top Banner & Phase Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3.5 bg-gradient-to-r from-[#042C51]/5 via-[#042C51]/10 to-orange-50/40 rounded-xl border border-[#BECBDA]/70">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider bg-[#042C51] text-white">
              2-Week Curriculum Schedule
            </span>
            <span className="text-[11px] font-bold text-[#042C51]">
              PST &amp; FST Training Matrix (10 Working Days)
            </span>
          </div>
          <p className="text-[11px] text-slate-600">
            Click any day to view the <strong>assigned materials</strong> and <strong>designated trainer</strong>.
          </p>
        </div>

        {/* Phase Filter Tabs */}
        <div className="flex items-center gap-1 p-1 bg-white rounded-lg border border-slate-200 shadow-2xs self-stretch sm:self-auto">
          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1 rounded-md text-[11px] font-bold transition-all ${
              activeTab === 'all'
                ? 'bg-[#042C51] text-white shadow-xs'
                : 'text-slate-600 hover:text-[#042C51] hover:bg-slate-50'
            }`}
          >
            All 10 Days (2 Weeks)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('fst')}
            className={`px-3 py-1 rounded-md text-[11px] font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'fst'
                ? 'bg-blue-700 text-white shadow-xs'
                : 'text-blue-700 hover:bg-blue-50'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
            Week 1: FST ({fstDaysCount}d)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('pst')}
            className={`px-3 py-1 rounded-md text-[11px] font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'pst'
                ? 'bg-[#FF5C28] text-white shadow-xs'
                : 'text-orange-700 hover:bg-orange-50'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-orange-300" />
            Week 2: PST ({pstDaysCount}d)
          </button>
        </div>
      </div>

      {/* Quick Summary Pill Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
        <div className="p-2.5 bg-white rounded-lg border border-slate-200 flex items-center gap-2">
          <div className="p-1.5 rounded-md bg-blue-50 text-blue-700">
            <BookOpen className="w-3.5 h-3.5" />
          </div>
          <div>
            <span className="text-[9.5px] text-slate-400 font-semibold block uppercase">Week 1 Phase</span>
            <span className="font-bold text-[#042C51] block">FST (Foundation Skills)</span>
          </div>
        </div>

        <div className="p-2.5 bg-white rounded-lg border border-slate-200 flex items-center gap-2">
          <div className="p-1.5 rounded-md bg-orange-50 text-[#FF5C28]">
            <GraduationCap className="w-3.5 h-3.5" />
          </div>
          <div>
            <span className="text-[9.5px] text-slate-400 font-semibold block uppercase">Week 2 Phase</span>
            <span className="font-bold text-[#042C51] block">PST (Product Specific)</span>
          </div>
        </div>

        <div className="p-2.5 bg-white rounded-lg border border-slate-200 flex items-center gap-2">
          <div className="p-1.5 rounded-md bg-purple-50 text-purple-700">
            <Clock className="w-3.5 h-3.5" />
          </div>
          <div>
            <span className="text-[9.5px] text-slate-400 font-semibold block uppercase">Daily Shift</span>
            <span className="font-bold text-slate-800 block truncate">{shiftHours}</span>
          </div>
        </div>

        <div className="p-2.5 bg-white rounded-lg border border-slate-200 flex items-center gap-2">
          <div className="p-1.5 rounded-md bg-emerald-50 text-emerald-700">
            <MapPin className="w-3.5 h-3.5" />
          </div>
          <div>
            <span className="text-[9.5px] text-slate-400 font-semibold block uppercase">Training Venue</span>
            <span className="font-bold text-slate-800 block truncate">{trainingLocation}</span>
          </div>
        </div>
      </div>

      {/* Clickable 2-Week Schedule Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {displayedDays.map(day => {
          const isFST = day.phase === 'FST';
          const isSelected = selectedDayNumber === day.dayNumber;

          return (
            <button
              key={day.dayNumber}
              type="button"
              onClick={() => setSelectedDayNumber(day.dayNumber)}
              className={`group relative flex flex-col justify-between p-3.5 rounded-xl border text-left transition-all duration-200 cursor-pointer shadow-2xs hover:shadow-md hover:-translate-y-0.5 ${
                isSelected
                  ? 'border-[#FF5C28] ring-2 ring-[#FF5C28]/25 bg-white'
                  : isFST
                  ? 'border-blue-200/80 bg-blue-50/20 hover:bg-blue-50/50 hover:border-blue-300'
                  : 'border-orange-200/80 bg-orange-50/20 hover:bg-orange-50/50 hover:border-orange-300'
              }`}
              title={`Click to view Day ${day.dayNumber} materials and trainer`}
            >
              {/* Day Badge & Phase Header */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-xs text-[#042C51]">
                    Day {day.dayNumber}
                  </span>
                  <span
                    className={`px-1.5 py-0.5 rounded text-[9px] font-extrabold uppercase tracking-wider ${
                      isFST
                        ? 'bg-blue-100 text-blue-800 border border-blue-200'
                        : 'bg-orange-100 text-[#FF5C28] border border-orange-200'
                    }`}
                  >
                    {day.phase}
                  </span>
                </div>

                {/* Date & Weekday */}
                <div className="text-[10px] text-slate-500 font-semibold flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-slate-400 shrink-0" />
                  <span className="truncate">{day.dayOfWeek}, {day.date}</span>
                </div>

                {/* Day Module Title */}
                <h4 className="text-[11px] font-bold text-[#042C51] line-clamp-2 leading-snug pt-0.5 group-hover:text-[#FF5C28] transition-colors">
                  {day.title}
                </h4>
              </div>

              {/* Bottom Info: Trainer & Materials Count */}
              <div className="mt-3 pt-2.5 border-t border-slate-200/80 space-y-1.5">
                {/* Trainer Preview */}
                <div className="flex items-center gap-1.5 text-[10px] text-slate-700 font-medium">
                  <GraduationCap className="w-3.5 h-3.5 text-[#FF5C28] shrink-0" />
                  <span className="truncate" title={day.trainerName}>
                    {day.trainerName.split('(')[0].trim()}
                  </span>
                </div>

                {/* Materials Count Pill */}
                <div className="flex items-center justify-between text-[10px]">
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-white border border-slate-200 text-slate-600 font-bold">
                    <FileText className="w-3 h-3 text-[#042C51]" />
                    <span>{day.materials.length} {day.materials.length === 1 ? 'Material' : 'Materials'}</span>
                  </span>

                  <span className="text-[9.5px] font-bold text-[#FF5C28] group-hover:translate-x-0.5 transition-transform flex items-center">
                    View →
                  </span>
                </div>
              </div>

              {/* Active selection dot */}
              {isSelected && (
                <div className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-[#FF5C28] text-white flex items-center justify-center text-[9px] shadow-xs">
                  ✓
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Helper text */}
      <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
        <span className="flex items-center gap-1.5">
          <Info className="w-3.5 h-3.5 text-slate-400" />
          <span>Total curriculum package: <strong>{totalMaterials} materials</strong> across 10 structured training days.</span>
        </span>
        <span className="font-semibold text-slate-600">
          Showing {displayedDays.length} of 10 days
        </span>
      </div>

      {/* Interactive Day Inspection Modal (inside is the materials assigned that day and can see the trainer) */}
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
                <div className="flex items-center gap-2">
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
                    • {selectedDay.dayOfWeek}, {selectedDay.date}
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
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-5 max-h-[75vh] overflow-y-auto">
              {/* Section 1: Assigned Trainer (Can see the trainer!) */}
              <div className="p-4 bg-gradient-to-r from-orange-50/70 via-white to-slate-50 rounded-xl border border-orange-200/80 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10.5px] font-extrabold uppercase tracking-wider text-[#042C51] flex items-center gap-1.5">
                    <GraduationCap className="w-4 h-4 text-[#FF5C28]" />
                    <span>Designated Session Trainer</span>
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-100 text-green-800 border border-green-200 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-green-600" />
                    <span>Active Responsibility</span>
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-1">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-full bg-[#042C51] text-white flex items-center justify-center font-bold text-sm shadow-xs border-2 border-orange-200">
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
                          <div className="flex items-center gap-2">
                            <h5 className="text-xs font-bold text-[#042C51] truncate">
                              {material.title}
                            </h5>
                            <span className="px-1.5 py-0.2 rounded text-[9.5px] font-mono font-semibold bg-slate-100 text-slate-700 shrink-0">
                              {material.type}
                            </span>
                          </div>
                          {material.description && (
                            <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-2">
                              {material.description}
                            </p>
                          )}
                          <div className="flex items-center gap-3 text-[10px] text-slate-400 mt-1">
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
                          className="px-2.5 py-1.5 rounded-lg bg-[#042C51] hover:bg-[#0B365F] text-white text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
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
}
