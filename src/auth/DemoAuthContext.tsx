import React, { createContext, useContext, useMemo, useState } from 'react';
import { lookupDemoUser, validateDemoSignIn } from './demoAccounts';
import type { DemoUser, SignInResult } from './demoAuthTypes';

const SESSION_KEY = 'sibs_hris_prototype_demo_session_v1';

interface DemoAuthValue {
  user: DemoUser | null;
  signIn: (id: string, password: string) => SignInResult;
  signOut: () => void;
}

const Context = createContext<DemoAuthValue | null>(null);

function restoreSession(): DemoUser | null {
  try {
    const id = JSON.parse(localStorage.getItem(SESSION_KEY) || 'null')?.sibsId;
    return typeof id === 'string' ? lookupDemoUser(id) : null;
  } catch {
    return null;
  }
}

export function DemoAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<DemoUser | null>(restoreSession);

  const persist = (next: DemoUser | null) => {
    setUser(next);
    try {
      if (next) localStorage.setItem(SESSION_KEY, JSON.stringify({ sibsId: next.sibsId }));
      else localStorage.removeItem(SESSION_KEY);
    } catch {
      /* session may be in-memory if browser storage is blocked */
    }
  };

  const value = useMemo<DemoAuthValue>(() => ({
    user,
    signIn: (id, password) => {
      const result = validateDemoSignIn(id, password);
      if (result.ok) persist(result.user);
      return result;
    },
    signOut: () => persist(null)
  }), [user]);

  return <Context.Provider value={value}>{children}</Context.Provider>;
}

export function useDemoAuth(): DemoAuthValue {
  const context = useContext(Context);
  if (!context) throw new Error('useDemoAuth must be called inside DemoAuthProvider');
  return context;
}
