import React from "react";
import { Info } from "lucide-react";

export default function OnboardingProcessNote() {
  return (
    <section className="bg-blue-50/90 border border-blue-200 p-4.5 rounded-2xl flex items-start gap-3">
      <div className="p-2 bg-[#042C51] text-white rounded-xl shrink-0 mt-0.5">
        <Info className="w-4.5 h-4.5 text-[#FF5C28]" />
      </div>
      <div className="space-y-1">
        <h4 className="text-xs font-black text-[#042C51] uppercase tracking-wider">
          Onboarding Process & Governance Rule
        </h4>
        <p className="text-xs text-[#042C51] leading-relaxed font-medium">
          Accepted Offer creates onboarding. Start Date, Show / No Show, and Pre-start Withdrawal must be captured. Only Show becomes True Hire and should move the candidate to Hired.
        </p>
      </div>
    </section>
  );
}
