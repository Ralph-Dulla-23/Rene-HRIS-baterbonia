import type { DemoAccount, DemoUser, SignInResult } from './demoAuthTypes';

export const DEMO_PASSWORD = 'Demo123!';
export const DEMO_ACCOUNTS: DemoAccount[] = [
  { sibsId:'DEMO-EMP', name:'Alyssa Rivera', email:'alyssa.rivera@demo.sibs.local', role:'Employee', journeyEmployeeId:'SIBS-2901', password:DEMO_PASSWORD },
  { sibsId:'DEMO-TA', name:'TA Demonstrator', email:'ta@demo.sibs.local', role:'TA', password:DEMO_PASSWORD },
  { sibsId:'DEMO-IT', name:'IT Demonstrator', email:'it@demo.sibs.local', role:'IT', password:DEMO_PASSWORD },
  { sibsId:'DEMO-QDS', name:'QDS Demonstrator', email:'qds@demo.sibs.local', role:'QDS', password:DEMO_PASSWORD },
  { sibsId:'DEMO-TRN', name:'Maria Cruz', email:'trainer@demo.sibs.local', role:'Trainer', trainerName:'Maria Cruz', password:DEMO_PASSWORD },
  { sibsId:'DEMO-WFM', name:'WFM Demonstrator', email:'wfm@demo.sibs.local', role:'WFM', password:DEMO_PASSWORD },
  { sibsId:'DEMO-HR', name:'HR Demonstrator', email:'hr@demo.sibs.local', role:'HR', password:DEMO_PASSWORD },
  { sibsId:'DEMO-HRADMIN', name:'HR Admin Demonstrator', email:'hradmin@demo.sibs.local', role:'HR Admin', password:DEMO_PASSWORD },
  { sibsId:'DEMO-TL', name:'Team Leader Demonstrator', email:'tl@demo.sibs.local', role:'Team Leader', password:DEMO_PASSWORD },
  { sibsId:'DEMO-MGR', name:'Manager Demonstrator', email:'manager@demo.sibs.local', role:'Manager', password:DEMO_PASSWORD },
  { sibsId:'DEMO-SOM', name:'SOM Demonstrator', email:'som@demo.sibs.local', role:'SOM', password:DEMO_PASSWORD },
  { sibsId:'DEMO-ADMIN', name:'Super Admin Demonstrator', email:'admin@demo.sibs.local', role:'Super Admin', password:DEMO_PASSWORD },
];

/** Static identities only. Local accounts from previous prototype builds are not accepted. */
export const normalizeDemoId = (s: string) => s.trim().toUpperCase();
const withoutPassword = ({ password: _password, ...user }: DemoAccount): DemoUser => user;

export function getDemoAccounts(): DemoAccount[] {
  return DEMO_ACCOUNTS;
}

export function lookupDemoUser(id: string): DemoUser | null {
  const match = DEMO_ACCOUNTS.find(a => normalizeDemoId(a.sibsId) === normalizeDemoId(id));
  return match ? withoutPassword(match) : null;
}

export function validateDemoSignIn(id: string, password: string): SignInResult {
  const match = DEMO_ACCOUNTS.find(a => normalizeDemoId(a.sibsId) === normalizeDemoId(id));
  return match && match.password === password
    ? { ok: true, user: withoutPassword(match) }
    : { ok: false, error: 'Invalid demo SIBS ID or password.' };
}
