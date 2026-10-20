import React, { useState, useMemo } from "react";
import SibsLoginLandingPage from "./components/SibsLoginLandingPage";
import EmployeeSelfServiceView from "./components/EmployeeSelfServiceView";
import { DemoAuthProvider, useDemoAuth } from "./auth/DemoAuthContext";
import { canAccessModule, canAccessJourneyTab, defaultJourneyTab, defaultPageForRole, nhoRoleForDemoRole } from "./auth/roleAccess";
import { 
  Calendar, 
  ChevronDown, 
  RefreshCw, 
  FileSpreadsheet, 
  Sparkles, 
  Smartphone, 
  Monitor, 
  Tablet, 
  Layers, 
  Sliders,
  Filter,
  CheckCircle,
  Clock,
  Layers3,
  HelpCircle,
  FileText,
  Printer,
  BookOpenCheck
} from "lucide-react";
import { generateWorkforceHiringPdf } from "./utils/workforcePdfGenerator";
import { printPageToPdf } from "./utils/pdfExport";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import OverviewSection from "./components/OverviewSection";
import PlanSection from "./components/PlanSection";
import ViewPlanDrawer from "./components/ViewPlanDrawer";
import EmployeeDirectory from "./components/EmployeeDirectory";
import TimeAndAttendance from "./components/TimeAndAttendance";
import LeavesManagement from "./components/LeavesManagement";
import HRDashboard from "./components/HRDashboard";
import TADashboard from "./components/TADashboard";
import OMDashboard from "./components/OMDashboard";
import EmployeeDashboard from "./components/EmployeeDashboard";
import ResignationManagement from "./components/ResignationManagement";
import HiringNeedsIntake from "./components/HiringNeedsIntake";
import AvailablePositions from "./components/AvailablePositions";
import SourcingAnalytics from "./components/SourcingAnalytics";
import ApplicantLeads from "./components/ApplicantLeads";
import TalentPool from "./components/TalentPool";
import CandidatePipeline from "./components/CandidatePipeline";
import PublicTalentPoolApplicationPage from "./components/PublicTalentPoolApplicationPage";
import Offers from "./components/Offers";
import Onboarding from "./components/Onboarding";
import ActionItems from "./components/ActionItems";
import SuperAdminDashboard from "./components/SuperAdminDashboard";
import JobDescriptionPage from "./components/JobDescriptionPage";
import WeeklyReports from "./components/WeeklyReports";
import SchedulesCalendarModal from "./components/SchedulesCalendarModal";
import Departments from "./components/Departments";
import OfficeLocations from "./components/OfficeLocations";
import RecruitmentSettings from "./components/RecruitmentSettings";
import EmailLogs from "./components/EmailLogs";
import RecruitmentFlowchart from "./components/RecruitmentFlowchart";
import CandidateExperiencePage from "./components/CandidateExperiencePage";
import PublicCandidateExperienceSurveyPage from "./components/PublicCandidateExperienceSurveyPage";
import FrontendDesignPdfView from "./components/FrontendDesignPdfView";
import WorkflowProcessScreenViewer from "./components/WorkflowProcessScreenViewer";
import FigmaExportModal from "./components/FigmaExportModal";
import NHOMainModule from "./components/nho/NHOMainModule";
import NHOQDSDashboard from "./components/nho/qds/NHOQDSDashboard";
import { NHOProvider } from "./components/nho/NHOContext";
import EmployeeJourneyModule from "./components/journey/EmployeeJourneyModule";
import { JourneyProvider } from "./components/journey/JourneyContext";

import { 
  INITIAL_SUMMARY_METRICS, 
  INITIAL_PIPELINE_STAGES, 
  INITIAL_DROP_OFFS, 
  WEEKLY_TRENDS, 
  MONTHLY_TRENDS, 
  INITIAL_DETAIL_RECORDS, 
  INITIAL_PLANS,
  INITIAL_SCHEDULES,
  CLUSTERS,
  ACCOUNTS_BY_CLUSTER
} from "./data";
import { 
  WorkforcePlan, 
  PlanStatus, 
  ActionItemStatus, 
  DetailRecord, 
  ActionItem,
  ScheduleItem
} from "./types";

function AuthenticatedWorkspace() {
  const {user, signOut} = useDemoAuth();
  if (!user) throw new Error('AuthenticatedWorkspace requires a demo session');
  const initialPage = defaultPageForRole[user.role];
  const [requestedModule, setRequestedModule] = useState<string>(initialPage.module);
  // Central page guard applies to header buttons, child navigation, NHO handoffs and URL module parameters.
  const currentModule = canAccessModule(user.role, requestedModule) ? requestedModule : initialPage.module;
  const setCurrentModule = (module:string) => {
    if (canAccessModule(user.role,module)) setRequestedModule(module);
  };
  // Shared States (making the whole application interactive and mutable!)
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>(initialPage.tab || "overview");
  const changeTab = (tab:string) => {
    if (tab === 'benchmark' || tab === 'trainee-dashboard' || tab === 'trainer-monitoring' || tab === 'qds-dashboard' || tab === 'notifications' || tab === 'configuration') {
      if (!canAccessJourneyTab(user.role,tab)) return;
    }
    setActiveTab(tab);
  };
  const [clusterFilter, setClusterFilter] = useState("All Clusters");
  const [accountFilter, setAccountFilter] = useState("All Accounts");
  const [dateRange, setDateRange] = useState("2026 – Week 38 | Sep 14 – Sep 20, 2026");
  const [lastUpdated, setLastUpdated] = useState("Just now");
  
  // Roster detail list, Sourcing plans & Schedules
  const [detailRecords, setDetailRecords] = useState<DetailRecord[]>(INITIAL_DETAIL_RECORDS);
  const [plans, setPlans] = useState<WorkforcePlan[]>(INITIAL_PLANS);
  const [schedules, setSchedules] = useState<ScheduleItem[]>(INITIAL_SCHEDULES);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [isFigmaModalOpen, setIsFigmaModalOpen] = useState(false);
  
  // View Plan Drawer state
  const [selectedPlan, setSelectedPlan] = useState<WorkforcePlan | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [focusedJourneyId, setFocusedJourneyId] = useState<string | undefined>(undefined);

  // Check URL params for direct links (e.g. public survey token)
  React.useEffect(() => {
    try {
      if (typeof window !== "undefined") {
        const params = new URLSearchParams(window.location.search);
        if (params.get("surveyToken") || params.get("candidateSurvey")) {
          setCurrentModule("Public Survey");
        } else if (params.get("module")) {
          const mod = params.get("module");
          if (mod) setCurrentModule(mod);
        }
      }
    } catch (e) {
      console.error("Error reading URL search parameters", e);
    }
  }, []);

  // Handle schedule mutations
  const handleSaveSchedule = (updatedSchedule: ScheduleItem) => {
    setSchedules(prev => {
      const exists = prev.some(s => s.id === updatedSchedule.id);
      if (exists) {
        return prev.map(s => s.id === updatedSchedule.id ? updatedSchedule : s);
      }
      return [updatedSchedule, ...prev];
    });
  };

  const handleDeleteSchedule = (id: string) => {
    setSchedules(prev => prev.filter(s => s.id !== id));
  };

  // Device view simulation (Allows desktop users to preview exact tablet and mobile responsive layouts)
  const [deviceView, setDeviceView] = useState<"desktop" | "tablet" | "mobile">("desktop");

  // Filter list of accounts depending on cluster
  const currentAccountsList = useMemo(() => {
    if (clusterFilter === "All Clusters") {
      return ["All Accounts", ...Object.values(ACCOUNTS_BY_CLUSTER).flat()];
    }
    return ["All Accounts", ...(ACCOUNTS_BY_CLUSTER[clusterFilter] || [])];
  }, [clusterFilter]);

  // Handle plan mutations (e.g. updating an action item inside a plan)
  const handleUpdatePlan = (updatedPlan: WorkforcePlan) => {
    setPlans(prev => prev.map(p => p.id === updatedPlan.id ? updatedPlan : p));
    setSelectedPlan(updatedPlan);

    // Sync metrics in detail ledger if applicable
    setDetailRecords(prev => prev.map(rec => {
      if (rec.account === updatedPlan.account) {
        return {
          ...rec,
          hiredCount: updatedPlan.hiredCount,
          hiringNeeded: updatedPlan.hiringNeeded,
          requiredHC: updatedPlan.requiredHeadcount,
          actualHC: updatedPlan.actualHeadcount,
          bufferPercentage: updatedPlan.kpiSnapshot.bufferPercentage
        };
      }
      return rec;
    }));
  };

  // Handle creating a plan from standard forms
  const handleCreatePlan = (newPlanData: Omit<WorkforcePlan, "id" | "actionItems" | "activityHistory" | "createdAt" | "updatedAt">) => {
    const newId = `plan-${Date.now()}`;
    const completePlan: WorkforcePlan = {
      ...newPlanData,
      id: newId,
      actionItems: [],
      activityHistory: [
        {
          id: `hist-${Date.now()}`,
          date: "2026-07-19 22:40",
          user: "dulla13ralph@gmail.com",
          action: "Draft created",
          details: `Hiring parameters set up for ${newPlanData.account}.`
        }
      ],
      createdAt: "2026-07-19",
      updatedAt: "2026-07-19"
    };

    setPlans(prev => [completePlan, ...prev]);
  };

  const handleRefresh = () => {
    setLastUpdated(new Date().toLocaleTimeString());
  };

  // Helper: Open a plan from account name (used when clicking accounts in the overview table)
  const handleOpenPlanByAccount = (accountName: string) => {
    // Find if a plan already exists
    let existingPlan = plans.find(p => p.account === accountName);
    if (!existingPlan) {
      // If none, create a default template plan reactively
      const correspondingRecord = detailRecords.find(r => r.account === accountName);
      const req = correspondingRecord ? correspondingRecord.requiredHC : 400;
      const act = correspondingRecord ? correspondingRecord.actualHC : 380;
      const hired = correspondingRecord ? correspondingRecord.hiredCount : 20;
      const rate = correspondingRecord ? correspondingRecord.hiringRate : 60;
      
      const newPlan: WorkforcePlan = {
        id: `plan-gen-${Date.now()}`,
        cluster: correspondingRecord ? correspondingRecord.cluster : "Telecom & Tech",
        account: accountName,
        planPeriod: "Q3 2026 Ramp",
        requiredHeadcount: req,
        actualHeadcount: act,
        hiredCount: hired,
        hiringNeeded: Math.max(0, req - act),
        hiringRate: rate,
        leadsNeeded: Math.round(Math.max(0, req - act) / (rate / 100)),
        interviewCount: 150,
        fstCount: 90,
        status: PlanStatus.Draft,
        owner: "Sarah Jenkins (WFM Principal)",
        createdAt: "2026-07-19",
        updatedAt: "2026-07-19",
        kpiSnapshot: {
          bufferPercentage: correspondingRecord ? correspondingRecord.bufferPercentage : -5.0,
          absenteeismCount: correspondingRecord ? correspondingRecord.absenteeismCount : 30,
          absenteeismPercentage: correspondingRecord ? correspondingRecord.absenteeismPercentage : 8.0,
          attritionCount: correspondingRecord ? correspondingRecord.attritionCount : 20,
          attritionPercentage: correspondingRecord ? correspondingRecord.attritionPercentage : 4.0,
          acceptedJO: correspondingRecord ? correspondingRecord.acceptedJO : 30,
          nho: correspondingRecord ? correspondingRecord.nho : 28,
          fst: correspondingRecord ? correspondingRecord.fst : 25,
          pst: correspondingRecord ? correspondingRecord.pst : 22,
          goLive: correspondingRecord ? correspondingRecord.goLive : 20,
          hiredCount: hired,
          hiringRate: rate
        },
        pipeline: {
          acceptedJO: 45,
          nho: 40,
          fst: 35,
          pst: 30,
          goLive: 28,
          dropOffs: {
            joToNho: 5,
            nhoToFst: 5,
            fstToPst: 5,
            nhoToPst: 10,
            pstToGoLive: 2
          }
        },
        actionItems: [
          {
            id: `act-gen-${Date.now()}`,
            workforcePlanId: "",
            taskDescription: `Review initial training drops for ${accountName} cohort.`,
            assignee: "Sarah Jenkins (WFM Principal)",
            targetDate: "2026-07-28",
            status: ActionItemStatus.NotStarted,
            priority: "Medium",
            createdAt: "2026-07-19",
            updatedAt: "2026-07-19"
          }
        ],
        activityHistory: []
      };

      existingPlan = newPlan;
      setPlans(prev => [newPlan, ...prev]);
    }

    setSelectedPlan(existingPlan);
    setIsDrawerOpen(true);
  };

  // Compute metrics in real-time according to current cluster and account filters
  const currentSummaryMetrics = useMemo(() => {
    let recs = detailRecords;
    if (clusterFilter !== "All Clusters") {
      recs = recs.filter(r => r.cluster === clusterFilter);
    }
    if (accountFilter !== "All Accounts") {
      recs = recs.filter(r => r.account === accountFilter);
    }
    if (clusterFilter === "All Clusters" && accountFilter === "All Accounts") {
      return INITIAL_SUMMARY_METRICS;
    }
    if (recs.length === 0) return INITIAL_SUMMARY_METRICS;

    const req = recs.reduce((acc, r) => acc + r.requiredHC, 0);
    const act = recs.reduce((acc, r) => acc + r.actualHC, 0);
    const abs = recs.reduce((acc, r) => acc + r.absenteeismCount, 0);
    const att = recs.reduce((acc, r) => acc + r.attritionCount, 0);
    const hired = recs.reduce((acc, r) => acc + r.hiredCount, 0);
    const acceptedJO = recs.reduce((acc, r) => acc + r.acceptedJO, 0);

    const net = act - att;
    const gap = Math.max(0, req - net);
    const buf = req > 0 ? parseFloat((((net - req) / req) * 100).toFixed(2)) : 0;
    const absPct = act > 0 ? parseFloat(((abs / act) * 100).toFixed(2)) : 0;
    const attPct = act > 0 ? parseFloat(((att / act) * 100).toFixed(2)) : 0;
    const hiringRate = acceptedJO > 0 ? parseFloat(((hired / acceptedJO) * 100).toFixed(1)) : 0;

    return {
      requiredHeadcount: req,
      actualHeadcount: act,
      bufferPercentage: buf,
      absenteeismCount: abs,
      absenteeismPercentage: absPct,
      attritionCount: att,
      attritionPercentage: attPct,
      netActualHC: net,
      hiringNeeded: gap,
      hiringRate: hiringRate,
      hiredCount: hired,
      leadsToInterview: Math.round(gap * 2.2)
    };
  }, [clusterFilter, accountFilter, detailRecords]);

  return (
    <NHOProvider initialRole={nhoRoleForDemoRole[user.role]}>
    <JourneyProvider>
      <div className="min-h-screen bg-[#DDE4EC] flex text-[#101828] max-w-full overflow-x-hidden">
        
        {/* Dynamic Responsive Sidebar */}
        <Sidebar 
          currentModule={currentModule} 
          onModuleChange={setCurrentModule} 
          activeTab={activeTab}
          onTabChange={changeTab}
          role={user.role}
          isOpen={isMobileSidebarOpen}
          onClose={() => setIsMobileSidebarOpen(false)}
        />

        {/* Main Panel Content (Fluid on mobile/tablet, shifted on lg+ for fixed Sidebar) */}
        <div className="flex-1 pl-0 lg:pl-64 flex flex-col min-h-screen pb-10 min-w-0 max-w-full overflow-x-hidden">
          
          {/* Top header with mobile hamburger toggle */}
          <Header 
            userEmail={user.email}
            userName={user.name}
            userRole={user.role}
            onSignOut={signOut} 
            onOpenCalendar={() => {if (['HR','HR Admin','TA','Super Admin','WFM'].includes(user.role)) setIsCalendarOpen(true);}}
            onToggleSidebar={() => setIsMobileSidebarOpen(prev => !prev)}
            onOpenDesignSystem={() => setCurrentModule("Frontend Design PDF View")}
            onOpenProcessSpecbook={() => setCurrentModule("Process Specbook")}
            onOpenFigmaExporter={() => setIsFigmaModalOpen(true)}
          />

          {currentModule === "New Hire Orientation" || currentModule === "New Hire Orientation (NHO)" ? (
            <div className="mt-16 flex-1 flex flex-col w-full min-w-0">
              <NHOMainModule 
                onSwitchModule={(mod, journeyId) => {
                  if (!canAccessModule(user.role,mod)) return;
                  setCurrentModule(mod);
                  if (journeyId) setFocusedJourneyId(journeyId);
                }}
              />
            </div>
          ) : currentModule === "QDS Application" || currentModule === "QDS" || currentModule === "Separate QDS Application" ? (
            <div className="mt-16 flex-1 flex flex-col w-full min-w-0">
              <div className="bg-[#042C51] text-white py-3.5 px-6 shadow-xs flex items-center justify-between border-b border-[#E6ECF2]">
                <div className="flex items-center gap-2.5">
                  <BookOpenCheck className="w-5 h-5 text-[#FF5C28]" />
                  <div>
                    <h2 className="text-sm font-bold tracking-tight text-white flex items-center gap-2">
                      <span>Standalone QDS Application</span>
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-[#FF5C28] text-white">
                        External System
                      </span>
                    </h2>
                    <p className="text-[11px] text-slate-300 font-medium">
                      Quality &amp; Development System • Training Attendance Scheduling &amp; Materials Assignment
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setCurrentModule("New Hire Orientation")}
                  className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <span>Return to HR Operations</span>
                </button>
              </div>
              <div className="p-4 sm:p-6 lg:p-8 flex-1">
                <NHOQDSDashboard onSwitchModule={setCurrentModule} />
              </div>
            </div>
          ) : currentModule === "Employee Journey" || currentModule === "30/60/90 Employee Journey" || currentModule === "Trainee Dashboard" ? (
            <div className="mt-20 px-6 flex-1 flex flex-col w-full">
              <EmployeeJourneyModule 
                onSwitchModule={setCurrentModule}
                initialFocusedJourneyId={focusedJourneyId}
                demoUser={user}
                defaultView={
                  currentModule === "Trainee Dashboard" && canAccessJourneyTab(user.role,"trainee-dashboard") ? "trainee-dashboard" :
                  (activeTab === "trainee-dashboard" || 
                  activeTab === "benchmark" || 
                  activeTab === "trainer-monitoring" || 
                  activeTab === "qds-dashboard" || 
                  activeTab === "notifications" || 
                  activeTab === "configuration" 
                    ? (canAccessJourneyTab(user.role, activeTab) ? activeTab as any : defaultJourneyTab(user.role))
                    : defaultJourneyTab(user.role))
                }
              />
            </div>
        ) : currentModule === "Employee Directory" ? (
          <div className={`mt-20 px-6 flex-1 flex flex-col ${
            deviceView === "mobile" 
              ? "max-w-[420px] mx-auto w-full border-12 border-slate-900 rounded-[40px] shadow-2xl overflow-hidden bg-[#DDE4EC] min-h-[750px] p-4 relative"
              : deviceView === "tablet"
                ? "max-w-[820px] mx-auto w-full border-12 border-slate-900 rounded-[30px] shadow-2xl overflow-hidden bg-[#DDE4EC] min-h-[900px] p-5 relative"
                : "w-full"
          }`}>
            {deviceView === "mobile" && (
              <div className="absolute top-2 left-1/2 -translate-x-1/2 w-32 h-4 bg-slate-900 rounded-full z-30 flex items-center justify-center text-[8px] text-slate-500 font-bold">
                SiBS Mobile HRIS
              </div>
            )}
            <EmployeeDirectory 
              onBackToDashboard={() => {
                setCurrentModule("Workforce Hiring");
                setDeviceView("desktop");
              }}
              simulatedDevice={deviceView}
              onChangeDeviceView={setDeviceView}
            />
          </div>
        ) : currentModule === "Time & Attendance" ? (
          <div className="mt-20 px-6 flex-1 flex flex-col w-full">
            {user.role === 'Employee' ? <EmployeeSelfServiceView kind="attendance" /> : <TimeAndAttendance />}
          </div>
        ) : currentModule === "Leaves & Time Off" ? (
          <div className="mt-20 px-6 flex-1 flex flex-col w-full">
            {user.role === 'Employee' ? <EmployeeSelfServiceView kind="leave" /> : <LeavesManagement />}
          </div>
        ) : currentModule === "HR Dashboard" || currentModule === "HR Admin Dashboard" ? (
          <div className="mt-20 px-6 flex-1 flex flex-col w-full">
            <HRDashboard userEmail={user.email} onSwitchModule={setCurrentModule} />
          </div>
        ) : currentModule === "TA Dashboard" ? (
          <div className="mt-20 px-6 flex-1 flex flex-col w-full">
            <TADashboard userEmail={user.email} onSwitchModule={setCurrentModule} />
          </div>
        ) : currentModule === "OM Dashboard" ? (
          <div className="mt-20 px-6 flex-1 flex flex-col w-full">
            <OMDashboard userEmail={user.email} onSwitchModule={setCurrentModule} />
          </div>
        ) : currentModule === "Employee Dashboard" ? (
          <div className="mt-20 px-6 flex-1 flex flex-col w-full">
            <EmployeeDashboard userEmail={user.email} onSwitchModule={setCurrentModule} />
          </div>
        ) : currentModule === "Resignation Management" ? (
          <div className="mt-20 px-6 flex-1 flex flex-col w-full">
            {user.role === 'Employee' ? <EmployeeSelfServiceView kind="resignation" /> : <ResignationManagement userEmail={user.email} onSwitchModule={setCurrentModule} />}
          </div>
        ) : currentModule === "Hiring Needs Intake" ? (
          <div className="mt-20 px-6 flex-1 flex flex-col w-full">
            <HiringNeedsIntake userEmail={user.email} onSwitchModule={setCurrentModule} />
          </div>
        ) : currentModule === "Available Positions" ? (
          <div className="mt-20 px-6 flex-1 flex flex-col w-full">
            <AvailablePositions userEmail={user.email} onSwitchModule={setCurrentModule} />
          </div>
        ) : currentModule === "Sourcing Analytics" ? (
          <div className="mt-20 px-6 flex-1 flex flex-col w-full">
            <SourcingAnalytics userEmail={user.email} onSwitchModule={setCurrentModule} />
          </div>
        ) : currentModule === "Applicant Leads" ? (
          <div className="mt-20 px-6 flex-1 flex flex-col w-full">
            <ApplicantLeads userEmail={user.email} onSwitchModule={setCurrentModule} />
          </div>
        ) : currentModule === "Talent Pool" ? (
          <div className="mt-20 px-6 flex-1 flex flex-col w-full">
            <TalentPool userEmail={user.email} onSwitchModule={setCurrentModule} />
          </div>
        ) : currentModule === "Candidate Pipeline" ? (
          <div className="mt-20 px-6 flex-1 flex flex-col w-full">
            <CandidatePipeline userEmail={user.email} onSwitchModule={setCurrentModule} />
          </div>
        ) : currentModule === "Public Application Form" ? (
          <div className="mt-20 px-6 flex-1 flex flex-col w-full">
            <PublicTalentPoolApplicationPage onNavigateToTalentPool={() => setCurrentModule("Talent Pool")} />
          </div>
        ) : currentModule === "Offers" ? (
          <div className="mt-20 px-6 flex-1 flex flex-col w-full">
            <Offers userEmail={user.email} onSwitchModule={setCurrentModule} />
          </div>
        ) : currentModule === "Onboarding" ? (
          <div className="mt-20 px-6 flex-1 flex flex-col w-full">
            <Onboarding userEmail={user.email} onSwitchModule={setCurrentModule} />
          </div>
        ) : currentModule === "Action Items" ? (
          <div className="mt-20 px-6 flex-1 flex flex-col w-full">
            <ActionItems userEmail={user.email} onSwitchModule={setCurrentModule} />
          </div>
        ) : currentModule === "Job Description" ? (
          <div className="mt-20 px-6 flex-1 flex flex-col w-full">
            <JobDescriptionPage onSwitchModule={setCurrentModule} />
          </div>
        ) : currentModule === "Super Admin Dashboard" ? (
          <div className="mt-20 px-6 flex-1 flex flex-col w-full">
            <SuperAdminDashboard userEmail={user.email} onSwitchModule={setCurrentModule} />
          </div>
        ) : currentModule === "Weekly Reports" ? (
          <div className="mt-20 px-6 flex-1 flex flex-col w-full">
            <WeeklyReports userEmail={user.email} onSwitchModule={setCurrentModule} />
          </div>
        ) : currentModule === "Departments" ? (
          <div className="mt-20 px-6 flex-1 flex flex-col w-full">
            <Departments onSwitchModule={setCurrentModule} />
          </div>
        ) : currentModule === "Office Locations" ? (
          <div className="mt-20 px-6 flex-1 flex flex-col w-full">
            <OfficeLocations onSwitchModule={setCurrentModule} />
          </div>
        ) : currentModule === "Recruitment Settings" ? (
          <div className="mt-20 px-6 flex-1 flex flex-col w-full">
            <RecruitmentSettings userEmail={user.email} onSwitchModule={setCurrentModule} />
          </div>
        ) : currentModule === "Email Logs" ? (
          <div className="mt-20 px-6 flex-1 flex flex-col w-full">
            <EmailLogs userEmail={user.email} onSwitchModule={setCurrentModule} />
          </div>
        ) : currentModule === "Candidate Experience" ? (
          <div className="mt-20 px-6 flex-1 flex flex-col w-full">
            <CandidateExperiencePage 
              userEmail={user.email} 
              onSwitchModule={setCurrentModule} 
            />
          </div>
        ) : currentModule === "Public Survey" || currentModule === "Candidate Survey" ? (
          <div className="mt-20 px-6 flex-1 flex flex-col w-full">
            <PublicCandidateExperienceSurveyPage 
              onNavigateToCandidateExperience={() => setCurrentModule("Candidate Experience")} 
            />
          </div>
        ) : currentModule === "Recruitment Flowchart" ? (
          <div className="mt-16 flex-1 flex flex-col w-full">
            <RecruitmentFlowchart 
              onSwitchModule={setCurrentModule} 
              onClose={() => setCurrentModule("Workforce Hiring")}
            />
          </div>
        ) : currentModule === "Process Specbook" || currentModule === "Process-to-Screen PDF" ? (
          <div className="mt-16 flex-1 flex flex-col w-full">
            <WorkflowProcessScreenViewer 
              onSwitchModule={setCurrentModule} 
              onClose={() => setCurrentModule("Workforce Hiring")}
            />
          </div>
        ) : currentModule === "Frontend Design PDF View" || currentModule === "Design System" || currentModule === "UI Specbook" ? (
          <div className="mt-16 flex-1 flex flex-col w-full">
            <FrontendDesignPdfView 
              onSwitchModule={setCurrentModule} 
              onClose={() => setCurrentModule("Workforce Hiring")}
            />
          </div>
        ) : (
          <div className="mt-20 px-6 flex-1 flex flex-col w-full max-w-[1920px] mx-auto min-h-0">
            {/* ==================== 1:1 WORKFORCE & HIRING OVERVIEW HEADER ==================== */}
            <section className="bg-white rounded-2xl border border-[#E6ECF2] shadow-xs relative overflow-hidden p-6 mb-6 select-none">
              {/* Top Accent Gradient Bar (Deep Navy to Vivid Orange) */}
              <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#042C51] via-[#0B365F] to-[#FF5C28]" />

              <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 pt-1">
                {/* Left: Tag, Title, and Description */}
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-100 bg-[#E9F0FC] px-2.5 py-1 text-[9px] font-black uppercase tracking-wide text-[#042C51]">
                      <span className="h-1.5 w-1.5 rounded-full bg-[#FF5C28]" />
                      Recruitment View
                    </span>
                  </div>
                  <h1 className="text-2xl sm:text-[26px] font-black text-[#042C51] tracking-tight leading-tight">
                    Workforce &amp; Hiring Overview
                  </h1>
                  <p className="text-xs sm:text-[13px] text-[#667085] leading-normal font-medium max-w-2xl">
                    Review workforce capacity, hiring gaps, pipeline conversion, attrition, and six-week operating trends for the selected scope.
                  </p>
                </div>

                {/* Right: 3 Filters with Labels Above (Weekly Version, Cluster, Account) */}
                <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 self-start xl:self-center">
                  {/* Weekly Version Dropdown */}
                  <div className="flex flex-col gap-1">
                    <span className="text-[11px] font-bold text-[#042C51]">Weekly Version</span>
                    <div className="relative">
                      <select
                        value={dateRange}
                        onChange={e => setDateRange(e.target.value)}
                        className="appearance-none bg-white border border-[#E6ECF2] hover:border-[#94A9C1] rounded-xl pl-3.5 pr-9 py-2 text-xs font-semibold text-[#042C51] focus:outline-none focus:ring-2 focus:ring-[#FF5C28]/20 focus:border-[#FF5C28] cursor-pointer shadow-2xs"
                      >
                        <option value="2026 – Week 38 | Sep 14 – Sep 20, 2026">2026 – Week 38 | Sep 14 – Sep 20, 2026</option>
                        <option value="2026 – Week 37 | Sep 07 – Sep 13, 2026">2026 – Week 37 | Sep 07 – Sep 13, 2026</option>
                        <option value="2026 – Week 36 | Aug 31 – Sep 06, 2026">2026 – Week 36 | Aug 31 – Sep 06, 2026</option>
                        <option value="2026 – Week 35 | Aug 24 – Aug 30, 2026">2026 – Week 35 | Aug 24 – Aug 30, 2026</option>
                        <option value="2026 – Week 34 | Aug 17 – Aug 23, 2026">2026 – Week 34 | Aug 17 – Aug 23, 2026</option>
                        <option value="2026 – Week 33 | Aug 10 – Aug 16, 2026">2026 – Week 33 | Aug 10 – Aug 16, 2026</option>
                        <option value="Q3 2026 Ramp (Jul–Sep)">Q3 2026 Ramp (Jul–Sep)</option>
                        <option value="Full Fiscal Year 2026">Full Fiscal Year 2026</option>
                      </select>
                      <ChevronDown className="w-4 h-4 text-[#667085] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>

                  {/* Cluster Dropdown */}
                  <div className="flex flex-col gap-1">
                    <span className="text-[11px] font-bold text-[#042C51]">Cluster</span>
                    <div className="relative">
                      <select
                        value={clusterFilter}
                        onChange={e => { setClusterFilter(e.target.value); setAccountFilter("All Accounts"); }}
                        className="appearance-none bg-white border border-[#E6ECF2] hover:border-[#94A9C1] rounded-xl pl-3.5 pr-9 py-2 text-xs font-semibold text-[#042C51] focus:outline-none focus:ring-2 focus:ring-[#FF5C28]/20 focus:border-[#FF5C28] cursor-pointer shadow-2xs min-w-[140px]"
                      >
                        {CLUSTERS.map(c => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                      <ChevronDown className="w-4 h-4 text-[#667085] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>

                  {/* Account Dropdown */}
                  <div className="flex flex-col gap-1">
                    <span className="text-[11px] font-bold text-[#042C51]">Account</span>
                    <div className="relative">
                      <select
                        value={accountFilter}
                        onChange={e => setAccountFilter(e.target.value)}
                        className="appearance-none bg-white border border-[#E6ECF2] hover:border-[#94A9C1] rounded-xl pl-3.5 pr-9 py-2 text-xs font-semibold text-[#042C51] focus:outline-none focus:ring-2 focus:ring-[#FF5C28]/20 focus:border-[#FF5C28] cursor-pointer shadow-2xs min-w-[150px]"
                      >
                        {currentAccountsList.map(acc => (
                          <option key={acc} value={acc}>{acc}</option>
                        ))}
                      </select>
                      <ChevronDown className="w-4 h-4 text-[#667085] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* ==================== ACTIVE VIEWPORT ROUTER ==================== */}
            <main className="flex-1 min-h-0">
            {activeTab === "overview" ? (
              <OverviewSection 
                metrics={currentSummaryMetrics}
                pipelineStages={INITIAL_PIPELINE_STAGES}
                dropOffs={INITIAL_DROP_OFFS}
                weeklyTrends={WEEKLY_TRENDS}
                monthlyTrends={MONTHLY_TRENDS}
                detailRecords={detailRecords}
                activeCluster={clusterFilter}
                activeAccount={accountFilter}
                dateRange={dateRange}
                onRecordClick={handleOpenPlanByAccount}
                onRefresh={handleRefresh}
              />
            ) : (
              <PlanSection 
                plans={plans}
                activeCluster={clusterFilter}
                activeAccount={accountFilter}
                onViewPlan={(p) => { setSelectedPlan(p); setIsDrawerOpen(true); }}
                onCreatePlan={handleCreatePlan}
                onAddActionItem={(id) => {
                  const targetPlan = plans.find(p => p.id === id);
                  if (targetPlan) {
                    setSelectedPlan(targetPlan);
                    setIsDrawerOpen(true);
                    setTimeout(() => {
                      // auto open assign inline form
                      const taskBtn = document.querySelector('button[title="Assign Task"]');
                      if (taskBtn) (taskBtn as HTMLButtonElement).click();
                    }, 200);
                  }
                }}
              />
            )}
          </main>
        </div>
      )}

        {/* View Plan Modal / Drawer overlay */}
        <ViewPlanDrawer 
          plan={selectedPlan}
          isOpen={isDrawerOpen}
          onClose={() => setIsDrawerOpen(false)}
          onUpdatePlan={handleUpdatePlan}
        />

        {/* HR & TA Schedules Calendar Modal */}
        <SchedulesCalendarModal
          isOpen={isCalendarOpen}
          onClose={() => setIsCalendarOpen(false)}
          schedules={schedules}
          onSaveSchedule={handleSaveSchedule}
          onDeleteSchedule={handleDeleteSchedule}
          userEmail={user.email}
        />

        {/* Figma Design System & Vector Canvas Bundle Modal */}
        <FigmaExportModal
          isOpen={isFigmaModalOpen}
          onClose={() => setIsFigmaModalOpen(false)}
        />
      </div>
    </div>
    </JourneyProvider>
    </NHOProvider>
  );
}


/** The public applicant/survey pages remain accessible without logging into the HRIS prototype. */
export default function App() {
  return <DemoAuthProvider><AppEntry /></DemoAuthProvider>;
}
function AppEntry() {
  const {user}=useDemoAuth();
  const params = typeof window==='undefined' ? new URLSearchParams() : new URLSearchParams(window.location.search);
  const isSurvey=Boolean(params.get('surveyToken')||params.get('candidateSurvey'));
  const isPublicApplication=params.get('module')==='Public Application Form';
  if (!user && isSurvey) return <PublicCandidateExperienceSurveyPage onNavigateToCandidateExperience={()=>{window.location.href=window.location.pathname;}} />;
  if (!user && isPublicApplication) return <PublicTalentPoolApplicationPage onNavigateToTalentPool={()=>{window.location.href=window.location.pathname;}} />;
  if (!user) return <SibsLoginLandingPage onNavigateToPublicApp={()=>{window.location.href='?module=Public%20Application%20Form';}} onNavigateToSurvey={()=>{window.location.href='?candidateSurvey=demo';}} />;
  return <AuthenticatedWorkspace key={user.sibsId} />;
}
