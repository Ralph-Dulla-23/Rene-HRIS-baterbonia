import React, { useState } from "react";
import { EmployeeJourney } from "../journeyTypes";
import { 
  X, 
  Award, 
  CheckCircle2, 
  Calendar, 
  User, 
  FileCheck, 
  ShieldCheck, 
  Clock, 
  Check, 
  Printer, 
  Sparkles, 
  BookOpen, 
  Target,
  ExternalLink,
  AlertCircle
} from "lucide-react";

interface TrainingProcessDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  processType: "FST" | "PST";
  journey: EmployeeJourney;
  scoreVal: number | null;
  evaluatorName: string;
  items: Array<{
    id: number;
    title: string;
    skill: string;
    max: number;
    passing: number;
    score: number;
    grader: string;
    date: string;
  }>;
}

export default function TrainingProcessDetailModal({
  isOpen,
  onClose,
  processType,
  journey,
  scoreVal,
  evaluatorName,
  items
}: TrainingProcessDetailModalProps) {
  const [activeTab, setActiveTab] = useState<"syllabus" | "rubric" | "endorsement">("syllabus");

  if (!isOpen) return null;

  const isFST = processType === "FST";
  const phaseTitle = isFST 
    ? "FST — Fundamental Skill Training" 
    : "PST — Product Skills Training";
  const phaseTimeline = isFST ? "Phase 1 • Days 1–14" : "Phase 2 • Days 15–28";
  const brandColor = isFST ? "#042C51" : "#FF5C28";
  const displayScore = scoreVal !== null ? `${scoreVal}%` : "Not Scored";
  const isPassed = scoreVal !== null && scoreVal >= 80;

  // Comprehensive curriculum modules for full audit breakdown
  const fullCurriculum = isFST ? [
    {
      id: 8103,
      module: "Module 1: Communication & Active Listening",
      title: "Communication Role Play & Scenario Execution",
      category: "Customer Communication",
      weight: "30%",
      score: items.find(i => i.id === 8103)?.score ?? 85,
      maxScore: 100,
      passingScore: 80,
      evaluator: evaluatorName || "Maria Cruz",
      completionDate: "Day 6 • Verified",
      status: "Passed",
      notes: "Demonstrates high empathy, warm conversational tone, and proactive clarifying questions. Excellent pacing under timed scenarios."
    },
    {
      id: 8104,
      module: "Module 2: Compliance & Information Security",
      title: "Data Privacy & Compliance Assessment",
      category: "Information Security",
      weight: "25%",
      score: items.find(i => i.id === 8104)?.score ?? 41,
      maxScore: 50,
      passingScore: 40,
      evaluator: evaluatorName || "Maria Cruz",
      completionDate: "Day 9 • Verified",
      status: "Passed",
      notes: "Achieved 41/50 (82%). Fully compliant with Republic Act 10173 (DPA), customer credential masking, and zero data leakage standards."
    },
    {
      id: 8107,
      module: "Module 3: Systems & Keyboard Dexterity",
      title: "Dual-Screen Navigation & Typing Proficiency Drill",
      category: "Technical Tooling",
      weight: "20%",
      score: 88,
      maxScore: 100,
      passingScore: 75,
      evaluator: evaluatorName || "Maria Cruz",
      completionDate: "Day 12 • Verified",
      status: "Passed",
      notes: "44 WPM with 98.2% typing accuracy. Fluent multi-tab navigation between internal knowledgebase and ticketing scratchpad."
    },
    {
      id: 8108,
      module: "Module 4: Professional Conduct & Attendance",
      title: "Workplace Standards & Punctuality Assessment",
      category: "HR Operations",
      weight: "25%",
      score: 95,
      maxScore: 100,
      passingScore: 85,
      evaluator: evaluatorName || "Maria Cruz",
      completionDate: "Day 14 • Verified",
      status: "Passed",
      notes: "100% attendance adherence during Phase 1. Zero tardiness or unplanned absences logged in Kronos."
    }
  ] : [
    {
      id: 8101,
      module: "Module 1: Account Knowledge & Regulations",
      title: "US Visa Process Knowledge Quiz",
      category: "Domain Expertise",
      weight: "30%",
      score: items.find(i => i.id === 8101)?.score ?? 86,
      maxScore: 100,
      passingScore: 80,
      evaluator: evaluatorName || "Maria Cruz",
      completionDate: "Day 19 • Verified",
      status: "Passed",
      notes: "Exemplary grasp of DS-160 application lifecycles, interview appointment scheduling rules, and consular document tiers."
    },
    {
      id: 8102,
      module: "Module 2: CRM & Workflow Systems",
      title: "System Navigation & Appointment Booking Practical",
      category: "Technical Systems",
      weight: "30%",
      score: items.find(i => i.id === 8102)?.score ?? 89,
      maxScore: 100,
      passingScore: 80,
      evaluator: evaluatorName || "Maria Cruz",
      completionDate: "Day 23 • Verified",
      status: "Passed",
      notes: "Completed test case booking in 210 seconds (target: < 300s). Accurate applicant record lookups and disposition tagging."
    },
    {
      id: 8105,
      module: "Module 3: Live Case Simulations",
      title: "Mock Call Handling & Exception Escalation",
      category: "Voice Simulation",
      weight: "25%",
      score: 84,
      maxScore: 100,
      passingScore: 80,
      evaluator: journey.tl || "Anton Reyes",
      completionDate: "Day 26 • Verified",
      status: "Passed",
      notes: "Successfully handled expedited visa request scenarios and emergency appointment routing while maintaining calm composure."
    },
    {
      id: 8109,
      module: "Module 4: Quality & Compliance Audit",
      title: "Independent Quality Assurance Pre-Nesting Audit",
      category: "Quality Assurance",
      weight: "15%",
      score: 88,
      maxScore: 100,
      passingScore: 80,
      evaluator: journey.qa || "Elena Santos",
      completionDate: "Day 28 • Verified",
      status: "Passed",
      notes: "Zero fatal errors detected. 100% adherence to mandatory greeting, identity verification, and recording disclosures."
    }
  ];

  // Competency rubric dimensions
  const competencies = isFST ? [
    { name: "Verbal Communication & Call Control", level: 85, benchmark: 80, description: "Professional vocabulary, active listening, clear pacing without filler words." },
    { name: "Empathy & Positive Framing", level: 88, benchmark: 80, description: "Validating customer concerns and presenting reassuring solutions." },
    { name: "Compliance & Security (PII Protection)", level: 92, benchmark: 85, description: "Strict zero-tolerance adherence to data masking and account privacy." },
    { name: "Systems Aptitude & Multitasking", level: 86, benchmark: 75, description: "Rapid information retrieval across CRM and policy guidelines." },
    { name: "Attendance & Schedule Adherence", level: 98, benchmark: 95, description: "Punctuality, shift logging, and proactive break management." }
  ] : [
    { name: "Account Product Mastery (US Visa)", level: 86, benchmark: 80, description: "Knowledge of visa categories, consular fee procedures, and forms." },
    { name: "CRM Tool & Schedule Engine Proficiency", level: 89, benchmark: 80, description: "Error-free entry into official appointment database and ticket management." },
    { name: "De-escalation & Urgent Exception Handling", level: 84, benchmark: 80, description: "Managing distressed applicants seeking expedited emergency slots." },
    { name: "Documentation & Disposition Accuracy", level: 90, benchmark: 80, description: "Precise case tagging, timestamping, and comprehensive shift notes." },
    { name: "Independent QA Standard Compliance", level: 88, benchmark: 85, description: "Zero fatal compliance breaches and consistent script compliance." }
  ];

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-60 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div 
        className="bg-white rounded-2xl w-full max-w-4xl shadow-2xl border border-[#E6ECF2] my-auto flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        onClick={e => e.stopPropagation()}
      >
        {/* Modal Top Accent Header */}
        <div className="p-5 sm:p-6 bg-[#042C51] text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0 border-b-2 border-[#FF5C28]">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-inner font-black text-white ${
              isFST ? "bg-[#0B365F] border border-blue-400/30" : "bg-[#FF5C28] border border-orange-300/30"
            }`}>
              {isFST ? <BookOpen className="w-6 h-6 text-white" /> : <Award className="w-6 h-6 text-white" />}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`px-2.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider text-white ${
                  isFST ? "bg-[#0B365F] border border-blue-300/30" : "bg-[#FF5C28]"
                }`}>
                  {phaseTimeline}
                </span>
                <h3 className="text-lg sm:text-xl font-extrabold text-white truncate">
                  {phaseTitle} — Full Process View
                </h3>
              </div>
              <p className="text-xs text-slate-300 mt-1 flex items-center gap-2 flex-wrap font-medium">
                <span className="text-white font-bold">{journey.fullName}</span>
                <span>•</span>
                <span className="font-mono text-amber-300">{journey.sibsEmployeeId || journey.id}</span>
                <span>•</span>
                <span>{journey.account} ({journey.siteLocation})</span>
                <span>•</span>
                <span>Role: {journey.roleTitle || "Customer Support Advocate"}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center">
            <button
              type="button"
              onClick={handlePrint}
              className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              title="Print / Save Process Summary"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              title="Close Full View"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* KPI Strip */}
        <div className="bg-[#F7F9FC] border-b border-[#E6ECF2] p-4 sm:px-6 grid grid-cols-2 sm:grid-cols-4 gap-3 shrink-0">
          <div className="p-3 bg-white rounded-xl border border-[#E6ECF2] shadow-2xs">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Phase Score</span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <strong className="text-xl font-black" style={{ color: brandColor }}>
                {displayScore}
              </strong>
              <span className="text-[10px] text-slate-400 font-semibold">/ 80% Min</span>
            </div>
          </div>

          <div className="p-3 bg-white rounded-xl border border-[#E6ECF2] shadow-2xs">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Process Status</span>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <strong className="text-xs font-black text-emerald-700">
                {isPassed ? "Completed & Passed" : "Completed"}
              </strong>
            </div>
          </div>

          <div className="p-3 bg-white rounded-xl border border-[#E6ECF2] shadow-2xs">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Lead Evaluator</span>
            <strong className="text-xs font-black text-[#042C51] mt-1 block truncate">
              {evaluatorName || (isFST ? "Maria Cruz" : "Anton Reyes")}
            </strong>
          </div>

          <div className="p-3 bg-white rounded-xl border border-[#E6ECF2] shadow-2xs">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Next Gate</span>
            <strong className="text-xs font-black text-[#042C51] mt-1 block truncate">
              {isFST ? "Phase 2 (PST) Transition" : "Day 30 Operations Handoff"}
            </strong>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="px-6 pt-3 border-b border-[#E6ECF2] bg-white flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab("syllabus")}
            className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === "syllabus"
                ? "border-[#FF5C28] text-[#042C51]"
                : "border-transparent text-slate-500 hover:text-[#042C51]"
            }`}
          >
            <BookOpen size={14} className={activeTab === "syllabus" ? "text-[#FF5C28]" : ""} />
            <span>Curriculum Modules &amp; Practicals ({fullCurriculum.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("rubric")}
            className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === "rubric"
                ? "border-[#FF5C28] text-[#042C51]"
                : "border-transparent text-slate-500 hover:text-[#042C51]"
            }`}
          >
            <Target size={14} className={activeTab === "rubric" ? "text-[#FF5C28]" : ""} />
            <span>Competency Rubric &amp; Benchmarks</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("endorsement")}
            className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === "endorsement"
                ? "border-[#FF5C28] text-[#042C51]"
                : "border-transparent text-slate-500 hover:text-[#042C51]"
            }`}
          >
            <ShieldCheck size={14} className={activeTab === "endorsement" ? "text-[#FF5C28]" : ""} />
            <span>Audit &amp; Trainer Endorsement</span>
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">

          {/* TAB 1: CURRICULUM SYLLABUS & PRACTICALS */}
          {activeTab === "syllabus" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-extrabold text-[#042C51]">
                    {isFST ? "Fundamental Skills Modules & Practical Assessments" : "Product Skills Curriculum & Workflow Practicals"}
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Individual module grades, weighted contributions, evaluator remarks, and completion records.
                  </p>
                </div>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                  All 4 Modules Completed
                </span>
              </div>

              <div className="overflow-x-auto rounded-xl border border-[#E6ECF2] shadow-2xs">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#042C51] text-white uppercase text-[10px] tracking-wider">
                    <tr>
                      <th className="py-2.5 px-3 font-bold">Module &amp; Practical Assessment</th>
                      <th className="py-2.5 px-3 font-bold">Category</th>
                      <th className="py-2.5 px-3 font-bold text-center">Weight</th>
                      <th className="py-2.5 px-3 font-bold text-center">Score / Max</th>
                      <th className="py-2.5 px-3 font-bold text-center">Target</th>
                      <th className="py-2.5 px-3 font-bold">Evaluator</th>
                      <th className="py-2.5 px-3 font-bold">Result</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E6ECF2] bg-white">
                    {fullCurriculum.map((m) => (
                      <tr key={m.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-3">
                          <strong className="text-[#042C51] block text-[12px]">{m.title}</strong>
                          <span className="text-[10px] text-slate-400 block">{m.module}</span>
                          <p className="text-[10.5px] text-slate-600 mt-1 italic font-normal">
                            "{m.notes}"
                          </p>
                        </td>
                        <td className="py-3 px-3">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                            {m.category}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-center font-semibold text-slate-600">
                          {m.weight}
                        </td>
                        <td className="py-3 px-3 text-center">
                          <strong className="text-sm font-black text-[#042C51]">
                            {m.score}
                          </strong>
                          <span className="text-[10px] text-slate-400 block">/ {m.maxScore}</span>
                        </td>
                        <td className="py-3 px-3 text-center font-bold text-slate-500">
                          ≥ {m.passingScore}
                        </td>
                        <td className="py-3 px-3">
                          <span className="font-bold text-[#042C51] block">{m.evaluator}</span>
                          <span className="text-[10px] text-slate-400">{m.completionDate}</span>
                        </td>
                        <td className="py-3 px-3">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800">
                            <Check size={11} className="text-emerald-700" />
                            {m.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Phase Score Summary Box */}
              <div className="p-4 rounded-xl bg-[#FAFCFF] border border-[#E6ECF2] flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-black">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-[#042C51]">
                      Weighted Phase Composite: <span className="font-black text-sm" style={{ color: brandColor }}>{displayScore}</span>
                    </h5>
                    <p className="text-[11px] text-slate-500">
                      Calculated from all {fullCurriculum.length} core training assessments. Minimum benchmark requirement: 80.0%.
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="px-3 py-1 rounded-lg text-xs font-black bg-emerald-50 text-emerald-800 border border-emerald-200 inline-flex items-center gap-1">
                    <CheckCircle2 size={13} className="text-emerald-600" />
                    Phase Benchmark Satisfied
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: COMPETENCY RUBRIC */}
          {activeTab === "rubric" && (
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-extrabold text-[#042C51]">
                  Competency Dimensions &amp; Behavior Matrix
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Detailed evaluation of core behavioural and technical proficiencies demonstrated during {phaseTimeline}.
                </p>
              </div>

              <div className="space-y-3">
                {competencies.map((comp, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-white border border-[#E6ECF2] shadow-2xs">
                    <div className="flex items-baseline justify-between mb-1.5">
                      <div>
                        <strong className="text-xs font-black text-[#042C51]">{comp.name}</strong>
                        <p className="text-[11px] text-slate-500 mt-0.5">{comp.description}</p>
                      </div>
                      <div className="text-right shrink-0 ml-3">
                        <strong className="text-sm font-black" style={{ color: brandColor }}>{comp.level}%</strong>
                        <span className="text-[10px] text-slate-400 block font-medium">Target: ≥ {comp.benchmark}%</span>
                      </div>
                    </div>

                    {/* Bar */}
                    <div className="w-full h-2 bg-[#E6EAF0] rounded-full overflow-hidden mt-2">
                      <div 
                        className="h-full rounded-full transition-all duration-500"
                        style={{ 
                          width: `${comp.level}%`,
                          backgroundColor: brandColor
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: AUDIT & ENDORSEMENT */}
          {activeTab === "endorsement" && (
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-extrabold text-[#042C51]">
                  Trainer Audit Sign-off &amp; Formal Recommendation
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Official verification signed by the training leadership certifying floor and curriculum compliance.
                </p>
              </div>

              {/* Endorsement Statement Card */}
              <div className="p-5 rounded-xl border border-slate-200 bg-[#FAFCFF] space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#042C51] text-white flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-5 h-5 text-[#FF5C28]" />
                  </div>
                  <div>
                    <h5 className="text-xs font-black text-[#042C51] uppercase tracking-wider">
                      Official Evaluator Sign-off
                    </h5>
                    <p className="text-xs text-slate-700 mt-1.5 leading-relaxed font-medium">
                      {isFST ? (
                        <>
                          "Trainee <strong>{journey.fullName}</strong> ({journey.sibsEmployeeId || journey.id}) has successfully met all Fundamental Skill Training requirements across Days 1 through 14. Verbal communication and empathy scoring exceeded expectations at 85%, and information security assessment was passed with zero compliance alerts. Full clearance is granted for Phase 2: Product Skills Training (PST)."
                        </>
                      ) : (
                        <>
                          "Trainee <strong>{journey.fullName}</strong> ({journey.sibsEmployeeId || journey.id}) has demonstrated mastery of the <strong>{journey.account}</strong> program workflow requirements during Days 15 through 28. Navigation practical test results (89%) and independent quality audit (88%) confirm immediate readiness for floor transition. Endorsed for formal Day 30 handoff to Team Leader {journey.tl || 'Anton Reyes'}."
                        </>
                      )}
                    </p>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Certified By</span>
                    <strong className="text-[#042C51] font-bold">{evaluatorName || (isFST ? "Maria Cruz" : "Anton Reyes")}</strong>
                    <span className="text-[10px] text-slate-500 block">{isFST ? "Senior Foundation Trainer" : "Operational Team Leader"}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Verification Date</span>
                    <strong className="text-[#042C51] font-bold">{isFST ? "2026-09-28" : "2026-10-14"}</strong>
                    <span className="text-[10px] text-slate-500 block">Digital Signature Logged</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Audit Status</span>
                    <span className="inline-flex items-center gap-1 font-black text-emerald-700">
                      <CheckCircle2 size={12} className="text-emerald-600" />
                      Compliant &amp; Approved
                    </span>
                  </div>
                </div>
              </div>

              {/* Prerequisite Checklist */}
              <div className="p-4 rounded-xl border border-[#E6ECF2] bg-white space-y-2">
                <span className="text-[10.5px] font-bold text-slate-500 uppercase tracking-wider block">
                  Phase Gate Checklist
                </span>
                <div className="space-y-1.5 text-xs">
                  <div className="flex items-center gap-2 text-slate-700">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Completed 100% of required classroom modules and interactive practicals</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-700">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Composite phase score of {displayScore} satisfies or exceeds minimum passing standard (80.0%)</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-700">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>No unresolved data privacy or zero-tolerance compliance infractions recorded</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-700">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Attendance records verified in Kronos without unexcused absences</span>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-[#F7F9FC] border-t border-[#E6ECF2] flex items-center justify-between shrink-0">
          <p className="text-[11px] text-slate-500">
            {phaseTimeline} records are permanent audit artifacts under SiBS HRIS Talent Governance.
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="px-3.5 py-1.5 rounded-xl border border-[#BECBDA] bg-white hover:bg-slate-50 text-[#042C51] text-xs font-bold transition-colors cursor-pointer shadow-2xs flex items-center gap-1.5"
            >
              <Printer size={13} className="text-[#FF5C28]" />
              <span>Print Audit</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 rounded-xl bg-[#042C51] hover:bg-[#0B365F] text-white text-xs font-bold transition-colors cursor-pointer shadow-xs"
            >
              Close Full View
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
