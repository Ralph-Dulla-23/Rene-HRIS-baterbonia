/** Runnable with `npx tsx scripts/test-demo-auth.ts` (browser storage stub for Node). */
import { canAccessMenuItem, canAccessModule, canAccessJourneyTab, defaultPageForRole, nhoRoleForDemoRole } from '../src/auth/roleAccess';
import { DEMO_ACCOUNTS, getDemoAccounts, validateDemoSignIn } from '../src/auth/demoAccounts';

const store = new Map<string, string>();
(globalThis as any).localStorage = {
  getItem: (k: string) => store.get(k) || null,
  setItem: (k: string, v: string) => store.set(k, v),
  removeItem: (k: string) => store.delete(k)
};

let count = 0;
function check(value: boolean, message: string) {
  if (!value) throw new Error(message);
  count++;
  console.log('PASS', message);
}

check(DEMO_ACCOUNTS.length >= 10, 'Seed roles include all key demo teams');
check(validateDemoSignIn('DEMO-TA', 'Demo123!').ok, 'Static TA credentials accepted');
check(!validateDemoSignIn('DEMO-TA', 'wrong').ok, 'Wrong password rejected');
check(!validateDemoSignIn('UNKNOWN', 'Demo123!').ok, 'Unknown SIBS ID rejected');
check(canAccessModule('Employee', 'Employee Dashboard'), 'Employee dashboard allowed');
check(!canAccessModule('Employee', 'TA Dashboard'), 'Employee cannot open TA page');
check(!canAccessModule('IT', 'HR Admin Dashboard'), 'IT cannot open HR dashboard');
check(canAccessModule('IT', 'New Hire Orientation (NHO)'), 'IT NHO route recognized');
check(canAccessJourneyTab('Employee', 'trainee-dashboard'), 'Employee personal Journey allowed');
check(!canAccessJourneyTab('Employee', 'qds-dashboard'), 'Employee QDS view denied');
check(!canAccessMenuItem('TA', 'Employee Journey', 'benchmark'), 'TA benchmark hidden');
check(defaultPageForRole['Trainer'].tab === 'trainer-monitoring', 'Trainer lands in Trainer Monitoring');
check(defaultPageForRole['QDS'].tab === 'qds-dashboard', 'QDS lands in QDS Dashboard');
check(nhoRoleForDemoRole.WFM === 'WFM', 'WFM maps to correct NHO role');
check(getDemoAccounts().length === DEMO_ACCOUNTS.length, 'Only seeded demo accounts can sign in');

// Ensure previously created local accounts in browser localStorage cannot sign in
store.set('sibs_hris_demo_registered_accounts_v1', JSON.stringify([{ sibsId: 'DEMO-OLD', name: 'Old Signup', role: 'Employee', password: 'oldpass' }]));
check(!validateDemoSignIn('DEMO-OLD', 'oldpass').ok, 'Previous locally registered accounts cannot sign in');
check(validateDemoSignIn('demo-emp', 'Demo123!').ok, 'Static IDs are case-insensitive');

console.log(`PASSED ${count}/${count} demo-auth checks`);
