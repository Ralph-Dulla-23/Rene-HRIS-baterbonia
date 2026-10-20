import { useDemoAuth } from "../../auth/DemoAuthContext";
import React, { useState } from "react";
import { NHOProvider, useNHO } from "./NHOContext";
import NHORoleHeader from "./NHORoleHeader";
import NHODemoWalkthrough from "./NHODemoWalkthrough";
import NHOTADashboard from "./ta/NHOTADashboard";
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

  // Active subtab getter and setter based on role
  const getCurrentSubTab = () => {
    if (role === "TA") return taSubTab;
    if (role === "Applicant") return applicantSubTab;
    if (role === "IT") return itSubTab;
    if (role === "Trainer") return trainerSubTab;
    if (role === "QDS") return qdsSubTab;
    if (role === "WFM") return wfmSubTab;
    return hrSubTab;
  };

  const handleSubTabChange = (newSubTab: string) => {
    if (role === "TA") setTaSubTab(newSubTab);
    else if (role === "Applicant") setApplicantSubTab(newSubTab);
    else if (role === "IT") setItSubTab(newSubTab);
    else if (role === "Trainer") setTrainerSubTab(newSubTab);
    else if (role === "QDS") setQdsSubTab(newSubTab);
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

  return (
    <div className="flex flex-col min-h-screen bg-[#DDE4EC] text-[#101828]">
      {/* Role Switcher & Sub-Nav Header */}
      <NHORoleHeader
        onOpenWalkthrough={() => {if(isAdminPreview) setIsWalkthroughOpen(true);}}
        subTab={getCurrentSubTab()}
        onSubTabChange={handleSubTabChange}
      />

      {/* Main Container Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
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
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-base font-bold text-[#042C51]">NHO Attendance Management</h2>
                    <p className="text-xs text-slate-500">Record Show / No Show attendance and trigger automatic temporary employee portal access.</p>
                  </div>
                  <button
                    onClick={() => handleOpenAttendanceModal(activeApplicant)}
                    className="px-4 py-2 rounded-xl bg-[#FF5C28] hover:bg-[#e04f20] text-white font-bold text-xs shadow-xs cursor-pointer"
                  >
                    Open Attendance Modal for {activeApplicant.firstName}
                  </button>
                </div>
                <NHOTADashboard
                  onOpenAttendanceModal={handleOpenAttendanceModal}
                  onOpenDetails={handleOpenApplicantDetails}
                  onOpenVerification={app => {
                    const doc = app.documents[0];
                    if (doc) handleOpenVerification(doc);
                  }}
                  onOpenEndorsement={handleOpenEndorsement}
                />
              </div>
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

        {/* QDS Role Views */}
        {role === "QDS" && (
          <NHOQDSDashboard
            subTab={qdsSubTab}
            onSubTabChange={setQdsSubTab}
            onSwitchModule={onSwitchModule}
          />
        )}

        {/* Trainer Role Views */}
        {role === "Trainer" && (
          <NHOTrainerDashboard
            subTab={trainerSubTab}
            onSubTabChange={setTrainerSubTab}
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
