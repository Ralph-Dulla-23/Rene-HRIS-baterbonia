import React, { useEffect, useRef, useState } from "react";
import { NHOProvider, useNHO } from "./nho/NHOContext";
import NHOApplicantPortal from "./nho/applicant/NHOApplicantPortal";
import { ArrowLeft, CalendarDays, Check, ChevronDown, ChevronRight, ClipboardList, FileText, GraduationCap, Lock, LockKeyhole, Menu, PenLine, RotateCcw, Settings2, UserRound, X } from "lucide-react";

interface PublicApplicantPortalPageProps {
  onBackToLogin?: () => void;
  onBackToWorkspace?: () => void;
}

type PortalSection = "overview" | "majors" | "orientation" | "agreements" | "requirements" | "profile" | "login-sim";

const CORE_SECTIONS: Array<{
  id: PortalSection;
  title: string;
  subtitle: string;
  Icon: typeof FileText;
}> = [
  { id: "orientation", title: "Orientation & quiz", subtitle: "View slides and complete knowledge check", Icon: GraduationCap },
  { id: "majors", title: "Major requirements", subtitle: "Upload and verify your documents", Icon: FileText },
  { id: "agreements", title: "Essential agreements", subtitle: "Sign the required documents", Icon: PenLine },
  { id: "requirements", title: "Additional requirements", subtitle: "Submit your remaining documents", Icon: ClipboardList },
];

const formatDate = (date?: string) => {
  if (!date) return "Not scheduled";
  const parsed = new Date(`${date}T12:00:00`);
  return Number.isNaN(parsed.getTime())
    ? date
    : parsed.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
};

function PublicApplicantPortalInner({ onBackToLogin, onBackToWorkspace }: PublicApplicantPortalPageProps) {
  const {
    activeApplicant,
    applicants,
    selectedApplicantId,
    setSelectedApplicantId,
    simulatedCurrentDate,
    setSimulatedCurrentDate,
    resetDemoData,
    showToast,
  } = useNHO();

  // Orientation comes first at first glance
  const [activeSection, setActiveSection] = useState<PortalSection>(() =>
    activeApplicant?.orientationStatus === "Completed" ? "overview" : "orientation"
  );
  const [mobileChecklistOpen, setMobileChecklistOpen] = useState(false);
  const [previewToolsOpen, setPreviewToolsOpen] = useState(false);
  const previewToolsRef = useRef<HTMLDivElement>(null);

  // The normal applicant portal has no scenario switcher, test clock or auth simulator.
  // Staff preview and explicitly requested ?nhoDemo=1 sessions can still use them.
  const hasDemoTools = Boolean(onBackToWorkspace) ||
    (typeof window !== "undefined" && new URLSearchParams(window.location.search).get("nhoDemo") === "1");

  const majorDocs = activeApplicant.documents.filter(doc => doc.isMajor);
  const agreementDocs = activeApplicant.documents.filter(doc => doc.isEssentialAgreement);
  const nonMajorDocs = activeApplicant.documents.filter(doc => !doc.isMajor && !doc.isEssentialAgreement);
  const majorVerified = majorDocs.filter(doc => doc.status === "Verified").length;
  const agreementVerified = agreementDocs.filter(doc => doc.status === "Verified").length;
  const nonMajorVerified = nonMajorDocs.filter(doc => doc.status === "Verified").length;
  const majorComplete = majorDocs.length > 0 && majorVerified === majorDocs.length;
  const orientationComplete = activeApplicant.orientationStatus === "Completed";
  const agreementComplete = agreementDocs.length > 0 && agreementVerified === agreementDocs.length;
  const nonMajorComplete = nonMajorDocs.length === 0 || nonMajorVerified === nonMajorDocs.length;
  const completedSections = [orientationComplete, majorComplete, agreementComplete, nonMajorComplete].filter(Boolean).length;
  const requiresSubmission = (docs: typeof majorDocs) => docs.some(doc => ["Not Submitted", "Needs Correction", "Draft"].includes(doc.status));
  const actionableSectionId: PortalSection | undefined =
    !orientationComplete ? "orientation" :
    requiresSubmission(majorDocs) ? "majors" :
    requiresSubmission(agreementDocs) ? "agreements" :
    requiresSubmission(nonMajorDocs) ? "requirements" : undefined;
  const progressPercentage = Math.round((completedSections / CORE_SECTIONS.length) * 100);
  const pendingNonMajor = nonMajorDocs.length - nonMajorVerified;
  const overdueNonMajor = requiresSubmission(nonMajorDocs) && Boolean(activeApplicant.nonMajorDeadlineDate) &&
    simulatedCurrentDate > (activeApplicant.nonMajorDeadlineDate || "");

  const sectionDetails: Record<PortalSection, { status: string; complete: boolean; urgent?: boolean }> = {
    overview: { status: "Overview", complete: false },
    orientation: { 
      status: orientationComplete 
        ? `Completed (${activeApplicant.orientationQuizScore ?? 6}/${activeApplicant.orientationQuizTotal ?? 6})`
        : activeApplicant.orientationStatus,
      complete: orientationComplete
    },
    majors: { status: `${majorVerified}/${majorDocs.length} verified`, complete: majorComplete },
    agreements: { status: `${agreementVerified}/${agreementDocs.length} verified`, complete: agreementComplete },
    requirements: {
      status: nonMajorComplete ? "All verified" : overdueNonMajor ? `${pendingNonMajor} overdue` : `${pendingNonMajor} to resolve`,
      complete: nonMajorComplete,
      urgent: overdueNonMajor,
    },
    profile: { status: "Reference", complete: false },
    "login-sim": { status: "Testing only", complete: false },
  };

  const nextSection = CORE_SECTIONS.find(section => section.id === actionableSectionId) ||
    CORE_SECTIONS.find(section => !sectionDetails[section.id].complete);
  const waitingForVerification = completedSections < CORE_SECTIONS.length && !actionableSectionId;
  const nextActionTitle = waitingForVerification ? "Submitted items are awaiting TA verification" : nextSection?.id === "orientation"
    ? "Complete your orientation and knowledge check quiz"
    : nextSection?.id === "majors"
      ? "Submit your mandatory major requirements"
      : nextSection?.id === "agreements"
        ? "Review and sign your essential agreements"
        : nextSection?.id === "requirements"
          ? "Submit your remaining additional requirements"
          : "Your NHO checklist is complete";

  const selectSection = (section: PortalSection) => {
    setActiveSection(section);
    setMobileChecklistOpen(false);
    setPreviewToolsOpen(false);
  };

  useEffect(() => {
    if (!previewToolsOpen) return;
    const onPointerDown = (event: MouseEvent) => {
      if (previewToolsRef.current && !previewToolsRef.current.contains(event.target as Node)) {
        setPreviewToolsOpen(false);
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setPreviewToolsOpen(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [previewToolsOpen]);

  const checklist = (
    <div className="space-y-1.5" aria-label="NHO checklist">
      {CORE_SECTIONS.map((section, index) => {
        const { status, complete, urgent } = sectionDetails[section.id];
        const isLocked = !orientationComplete && section.id !== "orientation";
        const selected = activeSection === section.id;
        const Icon = section.Icon;
        return (
          <button
            type="button"
            key={section.id}
            onClick={() => {
              if (isLocked) {
                showToast("Please complete the orientation and quiz checkpoints before proceeding to requirements.", "error");
                return;
              }
              selectSection(section.id);
            }}
            aria-current={selected ? "step" : undefined}
            className={`group w-full rounded-xl px-3 py-3.5 text-left transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FF5C28] ${
              selected ? "bg-[#EAF1F8] text-[#042C51]" : isLocked ? "text-slate-400 hover:bg-slate-50 opacity-80" : "text-[#34465D] hover:bg-[#F5F7FB]"
            }`}
          >
            <div className="flex items-start gap-3">
              <span className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${
                complete ? "bg-[#E8F6EE] text-[#17814D]" : selected ? "bg-[#042C51] text-white" : isLocked ? "bg-slate-100 text-slate-400" : "bg-[#F1F4F8] text-[#738398]"
              }`}>
                {complete ? <Check size={15} strokeWidth={2.6} /> : isLocked ? <Lock size={13} /> : <Icon size={15} />}
              </span>
              <span className="min-w-0 flex-1 space-y-1">
                <div className="flex items-center gap-1.5">
                  <span className="block text-[13px] font-bold leading-tight">{index + 1}. {section.title}</span>
                  {isLocked && (
                    <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-amber-100 text-amber-800">
                      Locked
                    </span>
                  )}
                </div>
                <span className="block text-[11px] leading-snug text-[#738398]">{section.subtitle}</span>
                <span className={`block text-[11px] font-semibold ${
                  complete ? "text-[#17814D]" : isLocked ? "text-amber-700" : urgent ? "text-[#C43B35]" : "text-[#5C6F84]"
                }`}>{isLocked ? "Step 1 (Orientation) required first" : status}</span>
              </span>
              <ChevronRight size={15} className={`mt-1 shrink-0 ${selected ? "text-[#042C51]" : "text-[#C0C9D4]"}`} />
            </div>
          </button>
        );
      })}
    </div>
  );

  return (
    <div className="flex min-h-screen flex-col bg-[#F7F9FC] font-jakarta text-[#042C51]">
      <header className="sticky top-0 z-40 border-b border-[#E6ECF2] bg-white shadow-xs">
        <div className="h-[3px] bg-gradient-to-r from-[#042C51] via-[#0B365F] to-[#FF5C28]" />
        <div className="mx-auto flex max-w-[1640px] flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-[#FF6B3D] to-[#FF5C28] flex items-center justify-center shadow-lg shadow-[#ff5c28]/25 shrink-0">
              <span className="text-xl font-black text-white tracking-tighter">S</span>
              <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-[#FFA488] border-2 border-[#042C51] shadow-xs" />
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-base font-extrabold tracking-tight">
                  <span className="text-[#FF5C28]">SiBS</span>{" "}
                  <span className="text-[#042C51]">HRIS</span>
                </span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#FFF0E9] border border-orange-200/60 text-[#FF5C28] text-[9.5px] font-black uppercase tracking-wider">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#FF5C28]" />
                  Employee Onboarding
                </span>
              </div>
              <p className="text-[10px] font-bold tracking-wider uppercase text-[#667085]">New Hire Orientation · Candidate Portal</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={() => selectSection("profile")}
              className="max-w-[320px] rounded-xl bg-[#F7F9FC] border border-[#E6ECF2] px-3.5 py-2 text-left transition hover:bg-[#EAF1F8]"
              title="View your personal information"
            >
              <span className="block truncate text-xs font-bold text-[#042C51]">{activeApplicant.fullName}</span>
              <span className="block truncate text-[10px] text-[#667085] font-medium">{activeApplicant.position}</span>
            </button>
            {hasDemoTools && (
              <div ref={previewToolsRef} className="relative">
                <button
                  type="button"
                  onClick={() => setPreviewToolsOpen(open => !open)}
                  aria-expanded={previewToolsOpen}
                  aria-controls="nho-preview-tools"
                  className="inline-flex h-10 items-center gap-2 rounded-xl border border-[#BECBDA] bg-white px-3 text-xs font-bold text-[#042C51] hover:bg-[#F7F9FC] shadow-xs"
                >
                  <Settings2 size={15} /> Preview tools <ChevronDown size={13} />
                </button>
                {previewToolsOpen && (
                  <div id="nho-preview-tools" className="absolute right-0 z-50 mt-2 w-[330px] max-w-[calc(100vw-32px)] rounded-xl border border-[#DCE5EF] bg-white p-4 shadow-xl">
                    <p className="mb-3 text-xs font-bold">Prototype controls</p>
                    <label className="mb-3 block space-y-1.5 text-[11px] font-semibold text-[#5F7288]">
                      Candidate scenario
                      <select
                        value={selectedApplicantId}
                        onChange={event => { setSelectedApplicantId(event.target.value); selectSection("overview"); }}
                        className="block w-full rounded-lg border border-[#DCE5EF] bg-[#F7F9FC] p-2.5 text-xs text-[#042C51]"
                      >
                        {applicants.map(candidate => (
                          <option key={candidate.id} value={candidate.id}>{candidate.fullName} — {candidate.attendance}</option>
                        ))}
                      </select>
                    </label>
                    <label className="mb-3 block space-y-1.5 text-[11px] font-semibold text-[#5F7288]">
                      Simulated date
                      <input type="date" value={simulatedCurrentDate} onChange={event => setSimulatedCurrentDate(event.target.value)}
                        className="block w-full rounded-lg border border-[#DCE5EF] bg-[#F7F9FC] p-2.5 text-xs text-[#042C51]" />
                    </label>
                    <div className="flex gap-2">
                      <button type="button" onClick={() => selectSection("login-sim")}
                        className="flex-1 rounded-lg bg-[#042C51] px-2 py-2 text-[11px] font-bold text-white">Access simulation</button>
                      <button type="button" onClick={() => { resetDemoData(); selectSection("overview"); }}
                        className="inline-flex items-center gap-1 rounded-lg border border-[#DCE5EF] px-2 py-2 text-[11px] font-bold"><RotateCcw size={12} /> Reset</button>
                    </div>
                  </div>
                )}
              </div>
            )}
            {(onBackToWorkspace || onBackToLogin) && (
              <button
                type="button"
                onClick={onBackToWorkspace || onBackToLogin}
                className="inline-flex h-10 items-center gap-2 rounded-xl bg-[#042C51] hover:bg-[#083a69] text-white px-4 text-xs font-bold shadow-xs transition-colors cursor-pointer"
              >
                <ArrowLeft size={14} /> <span className="hidden sm:inline">{onBackToWorkspace ? "Staff Workspace" : "Exit to Sign In"}</span><span className="sm:hidden">Exit</span>
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-[1640px] flex-1 px-4 pb-12 pt-6 sm:px-6 lg:px-8">
        <div className="mb-5 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-100 bg-[#E9F0FC] px-2.5 py-1 text-[9px] font-black uppercase tracking-wide text-[#042C51]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#FF5C28]" />
                My Onboarding Workspace
              </span>
            </div>
            <h1 className="text-2xl font-black text-[#042C51] tracking-tight sm:text-[28px]">Welcome, {activeApplicant.firstName}!</h1>
            <p className="mt-1 max-w-2xl text-[13px] leading-relaxed text-[#667085] font-medium">Follow your onboarding checklist, complete outstanding tasks, and revisit submitted requirements whenever you need.</p>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-[11px] text-[#667085] bg-white border border-[#E6ECF2] rounded-xl px-3.5 py-2 shadow-xs">
            <span className="inline-flex items-center gap-1.5"><CalendarDays size={15} className="text-[#FF5C28]" /> NHO: <strong className="text-[#042C51]">{formatDate(activeApplicant.scheduledNhoDate)}</strong></span>
            {activeApplicant.nonMajorDeadlineDate && (
              <span className={`inline-flex items-center gap-1.5 ${overdueNonMajor ? "font-semibold text-[#E74C3C]" : ""}`}>
                <CalendarDays size={15} className={overdueNonMajor ? "text-[#E74C3C]" : "text-[#042C51]"} /> Additional docs: <strong className={overdueNonMajor ? "text-[#E74C3C]" : "text-[#042C51]"}>{formatDate(activeApplicant.nonMajorDeadlineDate)}</strong>
                {overdueNonMajor ? "(overdue)" : ""}
              </span>
            )}
          </div>
        </div>

        <div className="mb-5 rounded-2xl border border-[#E6ECF2] bg-white p-5 shadow-xs relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#042C51] via-[#0B365F] to-[#FF5C28]" />
          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            <div className="min-w-0">
              <p className="text-sm font-black text-[#042C51]">Your NHO Progress</p>
              <p className="mt-0.5 text-xs text-[#667085] font-medium">{completedSections} of 4 task groups complete · {nextSection ? nextActionTitle : "All tasks verified"}</p>
            </div>
            <span className="text-2xl font-black tabular-nums text-[#042C51]">{progressPercentage}%</span>
          </div>
          <div className="mt-3.5 h-2.5 overflow-hidden rounded-full bg-[#E9EEF5]" role="progressbar" aria-valuenow={progressPercentage} aria-valuemin={0} aria-valuemax={100} aria-label="NHO progress">
            <div className="h-full rounded-full bg-gradient-to-r from-[#042C51] via-[#FF6B3D] to-[#FF5C28] transition-all duration-300" style={{ width: `${progressPercentage}%` }} />
          </div>
        </div>

        {/* When viewing orientation presentation, show whole-screen with no sidebar distraction */}
        {activeSection === "orientation" ? (
          <div className="w-full space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#E3EAF1] bg-white px-5 py-3.5 shadow-xs">
              <button
                type="button"
                onClick={() => selectSection("overview")}
                className="inline-flex items-center gap-2 rounded-xl border border-[#BECBDA] bg-white px-3.5 py-2 text-xs font-bold text-[#042C51] hover:bg-[#F7F9FC] shadow-xs cursor-pointer transition-colors"
              >
                <ArrowLeft size={14} /> Back to NHO Checklist
              </button>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-[#042C51] text-[10px] font-black uppercase tracking-wider">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#FF5C28]" />
                  Whole-Screen Presentation Mode (Distraction-Free)
                </span>
                <span className={`rounded-lg px-3 py-1 text-[11px] font-bold ${
                  sectionDetails.orientation.complete ? "bg-[#E8F6EE] text-[#157347]" : "bg-[#EEF3F8] text-[#526A83]"
                }`}>
                  {sectionDetails.orientation.status}
                </span>
              </div>
            </div>

            <section className="min-w-0" aria-label="Interactive SiBS Orientation">
              <NHOApplicantPortal subTab="orientation" onSubTabChange={section => selectSection(section as PortalSection)} />
            </section>
          </div>
        ) : (
          <div className="grid items-start gap-5 lg:grid-cols-[292px_minmax(0,1fr)]">
            <div className="lg:hidden">
              <button type="button" onClick={() => setMobileChecklistOpen(open => !open)} aria-expanded={mobileChecklistOpen}
                className="flex w-full items-center justify-between rounded-xl border border-[#E3EAF1] bg-white px-4 py-3 text-sm font-bold">
                <span className="flex items-center gap-2"><Menu size={18} /> NHO checklist</span>
                {mobileChecklistOpen ? <X size={17} /> : <ChevronDown size={17} />}
              </button>
            </div>
            <aside className={`${mobileChecklistOpen ? "block" : "hidden"} rounded-2xl border border-[#E3EAF1] bg-white p-3 shadow-[0_3px_14px_rgba(4,44,81,0.025)] lg:sticky lg:top-24 lg:block`}>
              <button type="button" onClick={() => selectSection("overview")}
                className={`mb-3 flex w-full items-center gap-2 rounded-xl px-3 py-3 text-left text-[13px] font-bold transition ${activeSection === "overview" ? "bg-[#042C51] text-white" : "text-[#042C51] hover:bg-[#F5F7FB]"}`}>
                <ClipboardList size={16} /> My overview <ChevronRight size={14} className="ml-auto" />
              </button>
              <p className="px-3 pb-2 text-[10px] font-extrabold uppercase tracking-[0.11em] text-[#8A98A8]">Your tasks</p>
              {checklist}
              <div className="mt-3 border-t border-[#E8EEF4] pt-3">
                <button type="button" onClick={() => selectSection("profile")}
                  className={`flex w-full items-center gap-2 rounded-xl px-3 py-3 text-[12px] font-bold transition ${activeSection === "profile" ? "bg-[#EAF1F8]" : "hover:bg-[#F5F7FB]"}`}>
                  <UserRound size={16} /> Personal information <ChevronRight size={14} className="ml-auto" />
                </button>
                {hasDemoTools && activeSection === "login-sim" && (
                  <p className="mt-2 flex items-center gap-2 px-3 text-[11px] text-[#8A98A8]"><LockKeyhole size={14} /> Previewing temporary access simulation</p>
                )}
              </div>
            </aside>

            <section className="min-w-0 space-y-4" aria-label="Selected NHO task">
              {activeSection !== "overview" && activeSection !== "profile" && activeSection !== "login-sim" && (
                <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#E3EAF1] bg-white px-5 py-4">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wide text-[#7A8B9C]">NHO task</p>
                    <h2 className="mt-1 text-[15px] font-extrabold">{CORE_SECTIONS.find(section => section.id === activeSection)?.title}</h2>
                  </div>
                  <span className={`rounded-lg px-3 py-1.5 text-[11px] font-bold ${
                    sectionDetails[activeSection].complete ? "bg-[#E8F6EE] text-[#157347]" :
                      sectionDetails[activeSection].urgent ? "bg-[#FCECEB] text-[#B83D36]" : "bg-[#EEF3F8] text-[#526A83]"
                  }`}>{sectionDetails[activeSection].status}</span>
                </div>
              )}
              {activeSection === "login-sim" && !hasDemoTools ? (
                <div className="rounded-2xl bg-white p-6 text-sm text-[#65778C]">This screen is available only in prototype preview mode.</div>
              ) : (
                <NHOApplicantPortal subTab={activeSection} onSubTabChange={section => selectSection(section as PortalSection)} />
              )}
            </section>
          </div>
        )}
      </main>

      <footer className="mt-auto border-t border-[#E3EAF1] bg-white px-6 py-4 text-[11px] text-[#8493A4]">
        <div className="mx-auto flex max-w-[1640px] flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <span>© 2026 SiBS Human Resource Information System · Employee Onboarding Portal</span>
          <span>Need assistance? Contact your Talent Acquisition representative.</span>
        </div>
      </footer>
    </div>
  );
}

export default function PublicApplicantPortalPage(props: PublicApplicantPortalPageProps) {
  // Some existing HRIS routes have an NHOProvider; the public entry point does not.
  try {
    const context = useNHO();
    if (context?.applicants) return <PublicApplicantPortalInner {...props} />;
  } catch {
    // The standalone public route needs its own provider.
  }
  return <NHOProvider><PublicApplicantPortalInner {...props} /></NHOProvider>;
}
