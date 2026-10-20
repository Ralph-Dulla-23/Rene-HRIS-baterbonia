/** Browser-only demo identities. NOT production authentication or authorization. */
export type DemoRole =
  | 'Employee' | 'TA' | 'IT' | 'QDS' | 'Trainer' | 'WFM'
  | 'HR' | 'HR Admin' | 'Team Leader' | 'Manager' | 'SOM' | 'Super Admin';

export interface DemoUser {
  sibsId: string;
  name: string;
  email: string;
  role: DemoRole;
  /** Only used to match an existing demonstration Journey employee record. */
  journeyEmployeeId?: string;
  /** An optional roster identity for prototype trainer filtering. */
  trainerName?: string;
}

export interface DemoAccount extends DemoUser {
  password: string; // browser-only mock password; never use this storage design in production
}
export type SignInResult = { ok: true; user: DemoUser } | { ok: false; error: string };
