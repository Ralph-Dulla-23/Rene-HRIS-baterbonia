import React, { useState } from 'react';
import { Check, ChevronLeft, ChevronRight, Copy, Eye, EyeOff, KeyRound, LogIn, Search, ShieldCheck, UserCheck, X } from 'lucide-react';
import { DEMO_ACCOUNTS, DEMO_PASSWORD } from '../auth/demoAccounts';
import { useDemoAuth } from '../auth/DemoAuthContext';

interface Props {
  onNavigateToPublicApp?: () => void;
  onNavigateToSurvey?: () => void;
}

/** Sign-in-only prototype with collapsible right-side demo credentials drawer. */
export default function SibsLoginLandingPage({ onNavigateToPublicApp, onNavigateToSurvey }: Props) {
  const { signIn } = useDemoAuth();
  const [id, setId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isPanelOpen, setIsPanelOpen] = useState(true);
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedNotice, setCopiedNotice] = useState(false);

  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const result = signIn(id, password);
    if (result.ok === false) {
      setError(result.error);
    } else {
      setError('');
    }
  };

  const pickDemoAccount = (sibsId: string, roleName: string) => {
    setId(sibsId);
    setPassword(DEMO_PASSWORD);
    setSelectedRole(roleName);
    setError('');
  };

  const copyPassword = () => {
    navigator.clipboard?.writeText(DEMO_PASSWORD);
    setCopiedNotice(true);
    setTimeout(() => setCopiedNotice(false), 2000);
  };

  const filteredAccounts = DEMO_ACCOUNTS.filter(a =>
    a.role !== 'QDS' && a.role !== 'Trainer' && (
      a.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.sibsId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );


  const field = 'w-full rounded-lg border border-slate-200 bg-[#E9F0FC] px-3.5 py-3 text-sm text-[#042C51] placeholder:text-slate-400 outline-none transition focus:border-[#FF5C28] focus:ring-2 focus:ring-[#FF5C28]/20';

  return (
    <main className="relative flex min-h-screen w-full items-center justify-center overflow-x-hidden bg-[#071e40] px-4 py-8 font-jakarta">
      {/* Background ambient lighting */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse at 18% 28%,#153c70a6,transparent 48%),radial-gradient(ellipse at 91% 75%,#ba542f66,transparent 40%)'
        }}
      />

      {/* Persistent floating trigger button on the right edge when panel is closed */}
      {!isPanelOpen && (
        <button
          type="button"
          onClick={() => setIsPanelOpen(true)}
          className="fixed right-0 top-1/2 -translate-y-1/2 z-40 flex items-center gap-2.5 rounded-l-2xl border-l-2 border-y border-white/20 bg-[#042C51]/95 px-3.5 py-4 text-white shadow-2xl backdrop-blur-md transition-all hover:bg-[#0B365F] hover:border-[#FF5C28] group"
          title="Reveal demo credentials panel"
          aria-label="Reveal demo credentials panel"
        >
          <div className="flex flex-col items-center gap-1.5">
            <KeyRound size={18} className="text-[#FF5C28] transition-transform group-hover:scale-110" />
            <span className="text-[11px] font-bold tracking-wider [writing-mode:vertical-rl] rotate-180">
              Demo Credentials
            </span>
            <ChevronLeft size={16} className="text-slate-300 transition-transform group-hover:-translate-x-0.5" />
          </div>
        </button>
      )}

      {/* Main Centered Sign In Card */}
      <div className={`relative w-full max-w-[420px] rounded-2xl border border-white/20 bg-white/10 px-7 py-8 text-white shadow-2xl backdrop-blur-xl transition-all duration-300 sm:px-8 ${isPanelOpen ? 'lg:-translate-x-28 xl:-translate-x-36' : ''}`}>
        <header className="mb-6 text-center">
          <div className="pr-5 text-[68px] font-light leading-none tracking-[-0.09em] text-white sm:text-[76px]">SiBS</div>
          <p className="mt-1 text-xs font-extrabold tracking-tight text-[#FF7548]">Human Resource Information System</p>
          <span className="mt-3 inline-flex rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[10px] font-semibold text-slate-200">
            Prototype · Demo accounts only
          </span>
        </header>

        <h1 className="mb-4 text-center text-lg font-extrabold">Sign In</h1>

        <form onSubmit={submit} className="space-y-4">
          <label className="block text-xs font-bold text-slate-200">
            SIBS ID
            <input
              className={`${field} mt-1.5 font-medium`}
              placeholder="e.g. DEMO-TA"
              value={id}
              onChange={e => {
                setId(e.target.value);
                setError('');
                setSelectedRole(null);
              }}
              autoComplete="username"
              required
              maxLength={24}
            />
          </label>

          <label className="block text-xs font-bold text-slate-200">
            Password
            <div className="relative mt-1.5">
              <input
                className={`${field} pr-12`}
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => {
                  setPassword(e.target.value);
                  setError('');
                }}
                placeholder="Enter demo password"
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-[#042C51]"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </div>
          </label>

          {/* Active selection helper tag */}
          {selectedRole && (
            <div className="flex items-center justify-between rounded-lg border border-emerald-500/30 bg-emerald-950/40 px-3 py-1.5 text-[11px] text-emerald-200">
              <span className="flex items-center gap-1.5">
                <Check size={13} className="text-emerald-400" /> Auto-filled for <strong className="text-white">{selectedRole}</strong>
              </span>
              <span className="font-mono text-[10px] text-emerald-300">{id}</span>
            </div>
          )}

          {error && (
            <div role="alert" className="rounded-lg border border-red-300/35 bg-red-900/40 px-3 py-2 text-xs text-red-100">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#FF5C28] px-4 py-3 text-sm font-extrabold text-white shadow-sm transition-colors hover:bg-[#e64c1a] focus:outline-none focus:ring-2 focus:ring-[#FF5C28]/40"
          >
            <LogIn size={16} /> Login
          </button>
        </form>

        {/* Quick reveal button on card for convenience */}
        <div className="mt-5 pt-3 border-t border-white/10 flex flex-col items-center">
          <button
            type="button"
            onClick={() => setIsPanelOpen(v => !v)}
            className="flex items-center gap-1.5 text-[11px] font-semibold text-orange-300 hover:text-white transition-colors"
          >
            <KeyRound size={13} />
            <span>{isPanelOpen ? 'Hide Demo Credentials Panel' : 'Reveal Demo Credentials on Right'}</span>
            {isPanelOpen ? <ChevronRight size={13} /> : <ChevronLeft size={13} />}
          </button>
        </div>

        {/* Footer Links & Prototype Notice */}
        <footer className="mt-4 border-t border-white/10 pt-3 text-center">
          {(onNavigateToPublicApp || onNavigateToSurvey) && (
            <div className="flex justify-center gap-4 text-[11px] text-slate-300">
              {onNavigateToPublicApp && (
                <button type="button" className="underline hover:text-white transition-colors" onClick={onNavigateToPublicApp}>
                  Public application
                </button>
              )}
              {onNavigateToSurvey && (
                <button type="button" className="underline hover:text-white transition-colors" onClick={onNavigateToSurvey}>
                  Candidate survey
                </button>
              )}
            </div>
          )}
          <p className="mt-2 text-[10px] leading-relaxed text-slate-400">
            For demonstration only. No real HRIS authentication or company credentials are used.
          </p>
        </footer>
      </div>

      {/* Right-Side Demo Credentials Panel / Drawer */}
      <aside
        aria-label="Demo credentials drawer"
        className={`fixed top-0 right-0 z-50 flex h-full w-[330px] sm:w-[370px] flex-col border-l border-white/15 bg-[#042C51]/95 text-white shadow-2xl backdrop-blur-2xl transition-transform duration-300 ease-in-out ${
          isPanelOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between border-b border-white/15 px-5 py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#FF5C28]/20 text-[#FF5C28]">
              <ShieldCheck size={18} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">Demo Credentials</h2>
              <p className="text-[10px] text-slate-300">Click any role to auto-fill fields</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsPanelOpen(false)}
            className="flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 text-xs font-semibold text-slate-200 transition-colors hover:bg-white/15 hover:text-white"
            title="Close demo credentials panel"
            aria-label="Close demo credentials panel"
          >
            <X size={15} />
            <span>Close</span>
          </button>
        </div>

        {/* Shared Password Callout */}
        <div className="mx-4 mt-3 rounded-lg border border-white/10 bg-[#071e40] p-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-slate-300">Password for all accounts:</span>
            <div className="flex items-center gap-1.5">
              <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-xs font-bold text-orange-300">
                {DEMO_PASSWORD}
              </code>
              <button
                type="button"
                onClick={copyPassword}
                className="rounded p-1 text-slate-400 hover:text-white transition-colors"
                title="Copy password"
              >
                {copiedNotice ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
              </button>
            </div>
          </div>
          {copiedNotice && (
            <p className="mt-1 text-right text-[10px] text-emerald-300">Password copied to clipboard!</p>
          )}
        </div>

        {/* Quick Filter */}
        <div className="px-4 mt-3">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search role or SIBS ID..."
              className="w-full rounded-lg border border-white/10 bg-white/5 py-1.5 pl-8 pr-3 text-xs text-white placeholder:text-slate-400 outline-none focus:border-[#FF5C28] focus:ring-1 focus:ring-[#FF5C28]"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                <X size={12} />
              </button>
            )}
          </div>
        </div>

        {/* Roles List */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
          {filteredAccounts.map(account => {
            const isSelected = id.toUpperCase() === account.sibsId.toUpperCase();
            return (
              <button
                key={account.sibsId}
                type="button"
                onClick={() => pickDemoAccount(account.sibsId, account.role)}
                className={`group flex w-full items-center justify-between rounded-xl border p-2.5 text-left transition-all ${
                  isSelected
                    ? 'border-[#FF5C28] bg-[#FF5C28]/15 shadow-sm'
                    : 'border-white/10 bg-white/5 hover:border-white/25 hover:bg-white/10'
                }`}
                title={`Click to fill ${account.role} credentials`}
              >
                <div className="min-w-0 flex-1 pr-2">
                  <div className="flex items-center gap-1.5">
                    <span className="truncate text-xs font-bold text-white group-hover:text-orange-200">
                      {account.role}
                    </span>
                    {isSelected && (
                      <span className="inline-flex items-center gap-0.5 rounded-full bg-emerald-500/20 px-1.5 py-0.2 text-[9px] font-semibold text-emerald-300">
                        <Check size={10} /> In fields
                      </span>
                    )}
                  </div>
                  <p className="truncate text-[10px] text-slate-300 mt-0.5">{account.name}</p>
                </div>

                <div className="flex flex-col items-end shrink-0">
                  <span className="rounded bg-black/30 px-2 py-0.5 font-mono text-[11px] font-bold text-orange-300">
                    {account.sibsId}
                  </span>
                  <span className="mt-1 text-[9px] text-slate-400 group-hover:text-orange-300 transition-colors">
                    Click to fill →
                  </span>
                </div>
              </button>
            );
          })}

          {filteredAccounts.length === 0 && (
            <div className="py-6 text-center text-xs text-slate-400">
              No matching demo roles found
            </div>
          )}
        </div>

        {/* Drawer Footer */}
        <div className="border-t border-white/15 px-5 py-3 text-center">
          <p className="text-[10px] text-slate-300">
            Pressing any role automatically inputs its <strong>SIBS ID</strong> &amp; <strong>Password</strong>.
          </p>
        </div>
      </aside>
    </main>
  );
}
