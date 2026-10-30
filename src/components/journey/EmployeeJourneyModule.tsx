import { useDemoAuth } from "../../auth/DemoAuthContext";
import { canAccessJourneyTab, defaultJourneyTab } from "../../auth/roleAccess";
import type { DemoUser } from "../../auth/demoAuthTypes";
import React, { useState, useEffect } from "react";
import { useJourney } from "./JourneyContext";
import { EmployeeJourney } from "./journeyTypes";
import TraineeDashboardView from "./views/TraineeDashboardView";
import TrainerMonitoringView from "./views/TrainerMonitoringView";
import QDSDashboardView from "./views/QDSDashboardView";
import BenchmarkView from "./views/BenchmarkView";
import NotificationsView from "./views/NotificationsView";
import ConfigurationView from "./views/ConfigurationView";
import EmployeeJourneyDrillDown from "./drilldown/EmployeeJourneyDrillDown";
import Review306090Modal from "./views/Review306090Modal";
import ESEPCoachingTabView from "./views/ESEPCoachingTabView";
import { 
  Sparkles, 
  Users, 
  Award, 
  ShieldAlert, 
  ShieldCheck,
  Bell, 
  Settings, 
  User, 
  Layers, 
  RotateCcw,
  ArrowRight,
  BookOpen
} from "lucide-react";

export type JourneyWorkspaceView = 
  | "trainee-dashboard" 
  | "benchmark" 
  | "esep-coaching"
  | "trainer-monitoring" 
  | "qds-dashboard" 
  | "notifications" 
  | "configuration";

interface EmployeeJourneyModuleProps {
  onSwitchModule?: (module: string) => void;
  initialFocusedJourneyId?: string;
  defaultView?: JourneyWorkspaceView;
  demoUser?: DemoUser;
}

export default function EmployeeJourneyModule({ 
  onSwitchModule, 
  initialFocusedJourneyId,
  defaultView = "benchmark",
  demoUser
}: EmployeeJourneyModuleProps) {
  const { journeys, selectedJourney, setSelectedJourney, resetJourneysToDefault } = useJourney();
  const {user} = useDemoAuth();
  const currentRole = (demoUser || user)?.role || 'Employee';
  const permittedView = canAccessJourneyTab(currentRole,defaultView) ? defaultView : defaultJourneyTab(currentRole) as JourneyWorkspaceView;
  const isPersonalView = currentRole === 'Employee';
  const personalJourney = isPersonalView ? journeys.find(j => j.sibsEmployeeId === user?.journeyEmployeeId || j.id === user?.journeyEmployeeId || (user?.email && j.email?.toLowerCase() === user.email.toLowerCase())) : null;

  const [activeView, setActiveView] = useState<JourneyWorkspaceView>(permittedView);
  const [linkingJourney, setLinkingJourney] = useState<EmployeeJourney | null>(null);

  // Keep activeView in sync when defaultView prop changes (e.g. via sidebar navigation)
  useEffect(() => {
    setActiveView(permittedView);
  }, [permittedView]);

  // Employee demo accounts are always scoped to their own linked Journey.
  useEffect(()=>{
    if (isPersonalView && selectedJourney && selectedJourney.id !== personalJourney?.id) setSelectedJourney(null);
  },[isPersonalView,selectedJourney,personalJourney?.id,setSelectedJourney]);

  // Auto-focus journey if initial ID is provided
  useEffect(() => {
    if (initialFocusedJourneyId) {
      const match = journeys.find(
        j => j.id === initialFocusedJourneyId || 
             j.nhoApplicantId === initialFocusedJourneyId || 
             j.kronosId === initialFocusedJourneyId ||
             j.sibsEmployeeId === initialFocusedJourneyId
      );
      if (match && (!isPersonalView || match.id === personalJourney?.id)) {
        setSelectedJourney(match);
      }
    }
  }, [initialFocusedJourneyId, journeys, setSelectedJourney]);

  return (
    <div className="space-y-6">
      
      {/* View Content Renderer */}
      {isPersonalView && !personalJourney ? <div className="rounded-2xl bg-white p-7 border border-[#E6ECF2]"><h2 className="font-bold text-[#042C51]">No Employee Journey linked yet</h2><p className="text-sm text-slate-500 mt-2">This demo account is not linked to an employee Journey. An HR demo account can set up the sample record before it appears here.</p></div> : null}
      {(!isPersonalView || personalJourney) && activeView === "trainee-dashboard" && <TraineeDashboardView onSwitchModule={onSwitchModule} />}
      {canAccessJourneyTab(currentRole, 'benchmark') && activeView === "benchmark" && <BenchmarkView onOpenLinkModal={j => setLinkingJourney(j)} onSwitchModule={onSwitchModule} />}
      {canAccessJourneyTab(currentRole, 'esep-coaching') && activeView === "esep-coaching" && (
        <ESEPCoachingTabView 
          currentJourney={personalJourney || selectedJourney || journeys[0]} 
          onSelectEmployee={(j) => setSelectedJourney(j)}
          onSwitchModule={onSwitchModule}
        />
      )}
      {canAccessJourneyTab(currentRole, 'trainer-monitoring') && activeView === "trainer-monitoring" && <TrainerMonitoringView onSwitchModule={onSwitchModule} />}
      {canAccessJourneyTab(currentRole, 'qds-dashboard') && activeView === "qds-dashboard" && <QDSDashboardView onSwitchModule={onSwitchModule} />}
      {canAccessJourneyTab(currentRole,'notifications') && activeView === "notifications" && <NotificationsView onSwitchModule={onSwitchModule} />}
      {canAccessJourneyTab(currentRole,'configuration') && activeView === "configuration" && <ConfigurationView onSwitchModule={onSwitchModule} />}


      {/* In 30 / 60 / 90 Reviews View: Show details about 30 60 90 only without other details */}
      {selectedJourney && activeView === "benchmark" && (
        <Review306090Modal
          journey={selectedJourney}
          isOpen={!!selectedJourney}
          onClose={() => setSelectedJourney(null)}
        />
      )}

      {/* In other views (excluding esep-coaching where inline selection is used): Employee Journey DrillDown */}
      {selectedJourney && activeView !== "benchmark" && activeView !== "esep-coaching" && (
        <EmployeeJourneyDrillDown
          journey={selectedJourney}
          isOpen={!!selectedJourney}
          onClose={() => setSelectedJourney(null)}
        />
      )}

      {/* Authorized Linkage Modal trigger from benchmark table if needed */}
      {linkingJourney && (
        <EmployeeJourneyDrillDown
          journey={linkingJourney}
          isOpen={!!linkingJourney}
          onClose={() => setLinkingJourney(null)}
          initialTab="timeline"
        />
      )}
    </div>
  );
}
