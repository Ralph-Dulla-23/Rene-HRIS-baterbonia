import type { DemoRole } from './demoAuthTypes';

/** Central mock navigation policy; browser demonstration only. */
export const defaultPageForRole: Record<DemoRole, { module: string; tab?: string }> = {
  Employee: {module:'Employee Dashboard'},
  TA:{module:'TA Dashboard'},
  IT:{module:'New Hire Orientation'},
  QDS:{module:'Employee Journey',tab:'qds-dashboard'},
  Trainer:{module:'Employee Journey',tab:'trainer-monitoring'},
  WFM:{module:'Workforce Hiring',tab:'overview'},
  HR:{module:'HR Admin Dashboard'},
  'HR Admin':{module:'HR Admin Dashboard'},
  'Team Leader':{module:'OM Dashboard'},
  Manager:{module:'OM Dashboard'},
  SOM:{module:'OM Dashboard'},
  'Super Admin':{module:'Super Admin Dashboard'},
};

const journeyTabs: Record<DemoRole,string[]> = {
  Employee:['trainee-dashboard'], TA:[], IT:[],
  QDS:['qds-dashboard','trainer-monitoring','esep-coaching','notifications'],
  Trainer:['trainer-monitoring','trainee-dashboard','esep-coaching','notifications'],
  WFM:[],
  HR:['benchmark','esep-coaching','trainee-dashboard','notifications','configuration'],
  'HR Admin':['benchmark','esep-coaching','trainer-monitoring','qds-dashboard','trainee-dashboard','notifications','configuration'],
  'Team Leader':['benchmark','esep-coaching','notifications'],
  Manager:['benchmark','esep-coaching','notifications'],
  SOM:['benchmark','esep-coaching','notifications'],
  'Super Admin':['benchmark','esep-coaching','trainer-monitoring','qds-dashboard','trainee-dashboard','notifications','configuration'],
};

const modules: Record<DemoRole,string[]> = {
  Employee:['Employee Dashboard','Time & Attendance','Leaves & Time Off','Resignation Management','Employee Journey'],
  TA:['TA Dashboard','Employee Directory','Workforce Hiring','Hiring Needs Intake','Available Positions','Job Description','Applicant Leads','Talent Pool','Candidate Pipeline','Offers','New Hire Orientation','Onboarding','ESEP Coaching','Candidate Experience','Recruitment Flowchart','Sourcing Analytics','Action Items','Weekly Reports','Public Application Form','Public Survey'],
  IT:['New Hire Orientation'],
  QDS:['Employee Journey','New Hire Orientation','ESEP Coaching'],
  Trainer:['Employee Journey','New Hire Orientation','ESEP Coaching'],
  WFM:['Workforce Hiring','Employee Directory','Time & Attendance','New Hire Orientation','Action Items','ESEP Coaching'],
  HR:['HR Admin Dashboard','Employee Directory','Time & Attendance','Leaves & Time Off','Resignation Management','New Hire Orientation','Employee Journey','Onboarding','ESEP Coaching','Hiring Needs Intake','Available Positions','Candidate Experience'],
  'HR Admin':['HR Admin Dashboard','Employee Directory','Time & Attendance','Leaves & Time Off','Resignation Management','New Hire Orientation','Employee Journey','Onboarding','ESEP Coaching','Hiring Needs Intake','Available Positions','Job Description','Departments','Office Locations','Email Logs'],
  'Team Leader':['OM Dashboard','Employee Directory','Time & Attendance','Leaves & Time Off','Employee Journey','ESEP Coaching'],
  Manager:['OM Dashboard','Employee Directory','Time & Attendance','Leaves & Time Off','Employee Journey','ESEP Coaching'],
  SOM:['OM Dashboard','Employee Directory','Time & Attendance','Leaves & Time Off','Employee Journey','ESEP Coaching'],
  'Super Admin':['Super Admin Dashboard','HR Admin Dashboard','HR Dashboard','TA Dashboard','OM Dashboard','Employee Dashboard','Trainee Dashboard','Employee Directory','Time & Attendance','Leaves & Time Off','Resignation Management','Workforce Hiring','Hiring Needs Intake','Available Positions','Job Description','Applicant Leads','Talent Pool','Candidate Pipeline','Offers','New Hire Orientation','Onboarding','ESEP Coaching','Candidate Experience','Employee Journey','Recruitment Flowchart','Sourcing Analytics','Action Items','Weekly Reports','Departments','Office Locations','Email Logs','Recruitment Settings','Frontend Design PDF View','Process Specbook','Public Application Form','Public Survey'],
};

export function normalizeModule(module: string): string {
  if (module === '30 / 60 / 90 Reviews' || module === '30/60/90 Reviews') return 'Onboarding';
  if (module === '30/60/90 Employee Journey' || module === 'Trainee Dashboard') return 'Employee Journey';
  if (module === 'New Hire Orientation (NHO)') return 'New Hire Orientation';
  if (module === 'Separate QDS Application' || module === 'QDS') return 'QDS Application';
  if (module === 'HR Dashboard') return 'HR Admin Dashboard';
  if (module === 'Leaves') return 'Leaves & Time Off';
  if (module === 'Candidate Survey') return 'Public Survey';
  if (module === 'Process-to-Screen PDF') return 'Process Specbook';
  if (module === 'Design System' || module === 'UI Specbook') return 'Frontend Design PDF View';
  return module;
}
export function canAccessModule(role: DemoRole, module: string): boolean {
  if (role === 'Super Admin') return true;
  return modules[role].includes(normalizeModule(module));
}
export function canAccessJourneyTab(role: DemoRole, tab: string): boolean {
  return journeyTabs[role].includes(tab);
}
export function defaultJourneyTab(role: DemoRole): string {
  return journeyTabs[role][0] || 'benchmark';
}
export function canAccessMenuItem(role: DemoRole,module: string,tab?: string): boolean {
  return canAccessModule(role,module) && (normalizeModule(module)!=='Employee Journey' || !tab || canAccessJourneyTab(role,tab));
}
export const nhoRoleForDemoRole: Record<DemoRole,'TA'|'Applicant'|'IT'|'QDS'|'Trainer'|'WFM'|'HR'> = {
  Employee:'Applicant', TA:'TA', IT:'IT', QDS:'QDS', Trainer:'Trainer', WFM:'WFM',
  HR:'HR','HR Admin':'HR','Team Leader':'HR',Manager:'HR',SOM:'HR','Super Admin':'TA'
};
