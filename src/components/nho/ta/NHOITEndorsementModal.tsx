import React, { useEffect, useRef } from "react";
import { X } from "lucide-react";
import { NHOApplicant } from "../nhoTypes";
import NHOITEndorsementView from "./NHOITEndorsementView";

interface NHOITEndorsementModalProps {
  applicant: NHOApplicant;
  onClose: () => void;
  onOpenDetails: (applicant: NHOApplicant) => void;
  onOpenAttendance: (applicant: NHOApplicant) => void;
}

export default function NHOITEndorsementModal({ applicant, onClose, onOpenDetails, onOpenAttendance }: NHOITEndorsementModalProps) {
  const closeRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    return () => { document.body.style.overflow = previousOverflow; };
  }, []);

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/65 p-3 backdrop-blur-[2px] sm:p-6" onMouseDown={event => { if (event.target === event.currentTarget) onClose(); }}>
      <section role="dialog" aria-modal="true" aria-label={`IT endorsement: ${applicant.fullName}`} className="flex h-[min(92dvh,920px)] w-full max-w-[1190px] flex-col overflow-hidden rounded-2xl border border-[#CED8E3] bg-white shadow-2xl">
        <div className="h-[3px] shrink-0 bg-[#FF5C28]" />
        <header className="flex shrink-0 items-center justify-between gap-3 bg-[#042C51] px-4 py-4 text-white sm:px-6">
          <div className="min-w-0">
            <h2 className="text-lg font-extrabold text-white">IT Endorsement Review</h2>
            <p className="mt-1 truncate text-xs text-blue-100">{applicant.fullName} · {applicant.applicantNumber} · Nine-point readiness verification</p>
          </div>
          <button ref={closeRef} type="button" onClick={onClose} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-white hover:bg-white/15" aria-label="Close IT endorsement"><X className="h-5 w-5" /></button>
        </header>
        <div className="min-h-0 flex-1 overflow-y-auto bg-[#F7F9FC] p-4 sm:p-6">
          <NHOITEndorsementView
            onSelectApplicant={() => {}}
            onOpenDetails={onOpenDetails}
            onOpenAttendance={onOpenAttendance}
          />
        </div>
        <footer className="flex shrink-0 items-center justify-end border-t border-[#E6ECF2] bg-white px-4 py-3 sm:px-6">
          <button type="button" onClick={onClose} className="rounded-lg bg-[#042C51] px-4 py-2 text-xs font-bold text-white hover:bg-[#0B365F]">Close Review</button>
        </footer>
      </section>
    </div>
  );
}
