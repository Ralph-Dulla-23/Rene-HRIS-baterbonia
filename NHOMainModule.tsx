import { useDemoAuth } from "../../auth/DemoAuthContext";
import React, { useMemo, useState } from "react";
import { NHOProvider, useNHO } from "./NHOContext";
import NHORoleHeader from "./NHORoleHeader";
import NHODemoWalkthrough from "./NHODemoWalkthrough";
import NHOTADashboard from "./ta/NHOTADashboard";
import NHOAttendanceView from "./ta/NHOAttendanceView";
import NHOAttendanceModal from "./ta/NHOAttendanceModal";
import NHOApplicantDetails from "./ta/NHOApplicantDetails";
import NHODocumentVerificationModal from "./ta/NHODocumentVerificationModal";
import NHODocumentVerificationQueue from "./ta/NHODocumentVerificationQueue";
import NHOITEndorsementView from "./ta/NHOITEndorsementView";
import NHOHandoffsView from "./ta/NHOHandoffsView";
import NHOApplicantPortal from "./applicant/NHOApplicantPortal";
import NHOITDashboard from "./it/NHOITDashboard";
import NHOTrainerDashboard from "./trainer/NHOTrainerDashboard";
import NHOQDSDashboard from "./qds/NHOQDSDashboard";
import NHOWFMDashboard from "./wfm/NHOWFMDashboard";
import NHOHRDashboard from "./hr/NHOHRDashboard";
import { NHOApplicant, NHODocumentItem } from "./nhoTypes";


function NHOInnerModule({ onSwitchModule }: { onSwitchModule?: (module: string, journeyId?: string) => void }) {
  const { role, setRole, applicants, activeApplicant, setSelectedApplicantId } = useNHO();
  const {user} = useDemoAuth();
  const isAdminPreview = user?.role === 'Super Admin';

  // Role SubTab states
  const [taSubTab, setTaSubTab] = useState("dashboard");
  const [applicantSubTab, setApplicantSubTab] = useState("overview");
  const [itSubTab, setItSubTab] = useState("queue");
  const [trainerSubTab, setTrainerSubTab] = useState("queue");
  const [qdsSubTab, setQdsSubTab] = useState("queue");
  const [wfmSubTab, setWfmSubTab] = useState("queue");
  const [hrSubTab, setHrSubTab] = useState("handoffs");

  // Modal states
  const [isWalkthroughOpen, setIsWalkthroughOpen] = useState(false);
  const [isAttendanceModalOpen, setIsAttendanceModalOpen] = useState(false);
  const [targetAttendanceApplicantId, setTargetAttendanceApplicantId] = useState<string>(activeApplicant.id);

  const targetAttendanceApplicant = applicants.find(a => a.id === targetAttendanceApplicantId) || activeApplicant;

  const [isDocModalOpen, setIsDocModalOpen] = useState(false);
  const [selectedDocForVerification, setSelectedDocForVerification] = useState<NHODocumentItem | null>(null);

  // Automatically redirect away from hidden QDS and Trainer roles
  React.useEffect(() => {
    if (role === "QDS" || role === "Trainer") {
      setRole("HR");
    }
  }, [role, setRole]);

  // Active subtab getter and setter based on role
  const getCurrentSubTab = () => {
    if (role === "TA") return taSubTab;
    if (role === "Applicant") return applicantSubTab;
    if (role === "IT") return itSubTab;
    if (role === "WFM") return wfmSubTab;
    return hrSubTab;
  };

  const handleSubTabChange = (newSubTab: string) => {
    if (role === "TA") setTaSubTab(newSubTab);
    else if (role === "Applicant") setApplicantSubTab(newSubTab);
    else if (role === "IT") setItSubTab(newSubTab);
    else if (role === "WFM") setWfmSubTab(newSubTab);
    else setHrSubTab(newSubTab);
  };

  const handleOpenAttendanceModal = (app: NHOApplicant) => {
    setTargetAttendanceApplicantId(app.id);
    setSelectedApplicantId(app.id);
    setIsAttendanceModalOpen(true);
  };

  const handleOpenApplicantDetails = (app: NHOApplicant, defaultTab?: string) => {
    setSelectedApplicantId(app.id);
    setTaSubTab("applicant-details");
  };

  const handleOpenVerification = (doc: any) => {
    setSelectedDocForVerification(doc);
    setIsDocModalOpen(true);
  };

  const handleOpenEndorsement = (app: NHOApplicant) => {
    setSelectedApplicantId(app.id);
    setTaSubTab("it-endorsements");
  };

  const handleWalkthroughNavigation = (targetRole: string, targetSubTab: string) => {
    if (!isAdminPreview && targetRole !== role) return;
    setRole(targetRole as any);
    if (targetRole === "TA") setTaSubTab(targetSubTab);
    else if (targetRole === "Applicant") setApplicantSubTab(targetSubTab);
    else if (targetRole === "IT") setItSubTab(targetSubTab);
    else if (targetRole === "Trainer") setTrainerSubTab(targetSubTab);
    else if (targetRole === "QDS") setQdsSubTab(targetSubTab);
    else if (targetRole === "WFM") setWfmSubTab(targetSubTab);
    else if (targetRole === "HR") setHrSubTab(targetSubTab);
  };

  const currentSectionHeader = useMemo(() => {
    if (role === "TA") {
      const sections: Record<string, { badge: string; title: string; description: string }> = {
        dashboard: { badge: "Recruitment Operations", title: "New Hire Orientation", description: "Manage scheduled orientations, attendance, document clearance, IT endorsement, and handoffs." },
        attendance: { badge: "Recruitment Operations", title: "NHO Attendance", description: "Record show / no-show attendance and manage attendance corrections and rescheduling." },
        "applicant-details": { badge: "Recruitment Operations", title: "Applicant NHO Details", description: "Review the selected applicant's NHO progress, documents, agreements, and activity history." },
        "doc-verification": { badge: "Recruitment Operations", title: "Document Verification", description: "Validate uploaded majors, agreements, and supporting onboarding requirements." },
        "it-endorsements": { badge: "Recruitment Operations", title: "IT Endorsements", description: "Review IT endorsement readiness and submit qualified applicants for account provisioning." },
        handoffs: { badge: "Recruitment Operations", title: "NHO Handoffs", description: "Track completed IT requests and manage handoff packages for downstream teams." }
      };
      return sections[taSubTab] || sections.dashboard;
    }
    if (role === "Applicant") {
      const sections: Record<string, { badge: string; title: string; description: string }> = {
        overview: { badge: "Applicant Portal", title: "My NHO Overview", description: "View your orientation status, onboarding progress, and pending tasks." },
        majors: { badge: "Applicant Portal", title: "Major Requirements", description: "Upload and track the four major pre-employment requirements for verification." },
        orientation: { badge: "Applicant Portal", title: "SiBS Orientation", description: "Review the orientation materials, complete the knowledge check, and acknowledge completion." },
        agreements: { badge: "Applicant Portal", title: "Essential Agreements", description: "Complete the required agreements through signature or signed document upload." },
        requirements: { badge: "Applicant Portal", title: "Non-Major Requirements", description: "Upload supporting onboarding requirements and monitor verification progress." },
        profile: { badge: "Applicant Portal", title: "Personal Information", description: "Review the personal information carried from HRIS before onboarding finalization." },
        "login-sim": { badge: "Applicant Portal", title: "Temporary Access Demo", description: "Simulate temporary access retrieval, activation, and transition to regular login." }
      };
      return sections[applicantSubTab] || sections.overview;
    }
    if (role === "IT") {
      const sections: Record<string, { badge: string; title: string; description: string }> = {
        queue: { badge: "IT Operations", title: "ID Creation Requests", description: "Review endorsed requests awaiting account provisioning and Kronos assignment." },
        details: { badge: "IT Operations", title: "Request Details & Editing", description: "Inspect IT request details and edit allowed account provisioning fields with audit history." },
        provisioning: { badge: "IT Operations", title: "Manual Kronos Provisioning", description: "Complete account setup, record official Kronos IDs, and close the request." }
      };
      return sections[itSubTab] || sections.queue;
    }
    if (role === "WFM") {
      const sections: Record<string, { badge: string; title: string; description: string }> = {
        queue: { badge: "Workforce Planning", title: "Production Seating Queue", description: "Review post-IT applicants pending seating and workstation assignment." },
        assignment: { badge: "Workforce Planning", title: "Seat Assignment Form", description: "Assign production wing and workstation details before final HR acceptance." }
      };
      return sections[wfmSubTab] || sections.queue;
    }
    const sections: Record<string, { badge: string; title: string; description: string }> = {
      handoffs: { badge: "HR Operations", title: "NHO Handoffs", description: "Review completed NHO packages and confirm downstream onboarding readiness." },
      review: { badge: "HR Operations", title: "Handoff Review & Acceptance", description: "Inspect handoff milestones and accept or return the package with documented reasons." },
      "pending-reqs": { badge: "HR Operations", title: "Pending Requirements (14-Day)", description: "Monitor post-NHO pending requirements, overdue items, and late submissions." }
    };
    return sections[hrSubTab] || sections.handoffs;
  }, [role, taSubTab, applicantSubTab, itSubTab, wfmSubTab, hrSubTab]);

  return (
    <div className="nho-workspace flex min-h-full min-w-0 flex-col bg-sibs-canvas font-jakarta text-sibs-navy">
      {/* Role Switcher & Sub-Nav Header */}
      <NHORoleHeader
        onOpenWalkthrough={() => { if (isAdminPreview) setIsWalkthroughOpen(true); }}
        subTab={getCurrentSubTab()}
        onSubTabChange={handleSubTabChange}
        sectionHeader={currentSectionHeader}
      />

      {/* Main Container Content */}
      <main className="w-full min-w-0 flex-1 space-y-5 px-4 pb-8 pt-4 sm:px-6">
        {/* TA Role Views */}
        {role === "TA" && (
          <>
            {taSubTab === "dashboard" && (
              <NHOTADashboard
                onOpenAttendanceModal={handleOpenAttendanceModal}
                onOpenDetails={handleOpenApplicantDetails}
                onOpenVerification={app => {
                  const doc = app.documents[0];
                  if (doc) handleOpenVerification(doc);
                }}
                onOpenEndorsement={handleOpenEndorsement}
              />
            )}

            {taSubTab === "attendance" && (
              <NHOAttendanceView
                onOpenAttendanceModal={handleOpenAttendanceModal}
                onOpenDetails={handleOpenApplicantDetails}
              />
            )}

            {taSubTab === "applicant-details" && (
              <NHOApplicantDetails
                applicant={activeApplicant}
                onBack={() => setTaSubTab("dashboard")}
                onOpenAttendance={() => handleOpenAttendanceModal(activeApplicant)}
                onOpenEndorsement={() => setTaSubTab("it-endorsements")}
                onOpenDocVerification={handleOpenVerification}
              />
            )}

            {taSubTab === "doc-verification" && (
              <NHODocumentVerificationQueue />
            )}

            {taSubTab === "it-endorsements" && (
              <NHOITEndorsementView
                onSelectApplicant={app => setSelectedApplicantId(app.id)}
                onBack={() => setTaSubTab("dashboard")}
                onOpenDetails={handleOpenApplicantDetails}
                onOpenAttendance={handleOpenAttendanceModal}
              />
            )}

            {taSubTab === "handoffs" && (
              <NHOHandoffsView
                onOpenApplicantDetails={handleOpenApplicantDetails}
              />
            )}
          </>
        )}

        {/* Applicant Role Views */}
        {role === "Applicant" && (
          <NHOApplicantPortal
            subTab={applicantSubTab}
            onSubTabChange={setApplicantSubTab}
          />
        )}

        {/* IT Role Views */}
        {role === "IT" && (
          <NHOITDashboard
            subTab={itSubTab}
            onSubTabChange={setItSubTab}
          />
        )}

        {/* QDS and Trainer role views hidden in NHO */}
        {(role === "QDS" || role === "Trainer") && (
          <NHOHRDashboard
            subTab={hrSubTab}
            onSubTabChange={setHrSubTab}
            onSwitchModule={onSwitchModule}
          />
        )}


        {/* WFM Role Views */}
        {role === "WFM" && (
          <NHOWFMDashboard
            subTab={wfmSubTab}
            onSubTabChange={setWfmSubTab}
          />
        )}

        {/* HR Role Views */}
        {role === "HR" && (
          <NHOHRDashboard
            subTab={hrSubTab}
            onSubTabChange={setHrSubTab}
            onSwitchModule={onSwitchModule}
          />
        )}
      </main>

      {/* Attendance Modal */}
      {isAttendanceModalOpen && (
        <NHOAttendanceModal
          isOpen={isAttendanceModalOpen}
          onClose={() => setIsAttendanceModalOpen(false)}
          applicant={targetAttendanceApplicant}
        />
      )}

      {/* Document Verification Modal */}
      {isDocModalOpen && selectedDocForVerification && (
        <NHODocumentVerificationModal
          isOpen={isDocModalOpen}
          onClose={() => {
            setIsDocModalOpen(false);
            setSelectedDocForVerification(null);
          }}
          document={selectedDocForVerification}
          applicantId={activeApplicant.id}
          applicantName={activeApplicant.fullName}
        />
      )}

      {/* Interactive Walkthrough Modal */}
      <NHODemoWalkthrough
        isOpen={isAdminPreview && isWalkthroughOpen}
        onClose={() => setIsWalkthroughOpen(false)}
        onNavigateToTab={handleWalkthroughNavigation}
      />
    </div>
  );
}

function NHOMainModuleWrapper({ onSwitchModule }: { onSwitchModule?: (module: string, journeyId?: string) => void }) {
  try {
    const context = useNHO();
    if (context && context.applicants) {
      return <NHOInnerModule onSwitchModule={onSwitchModule} />;
    }
  } catch (e) {
    // Fall through
  }
  return (
    <NHOProvider>
      <NHOInnerModule onSwitchModule={onSwitchModule} />
    </NHOProvider>
  );
}

export default function NHOMainModule({ onSwitchModule }: { onSwitchModule?: (module: string, journeyId?: string) => void }) {
  return <NHOMainModuleWrapper onSwitchModule={onSwitchModule} />;
}
