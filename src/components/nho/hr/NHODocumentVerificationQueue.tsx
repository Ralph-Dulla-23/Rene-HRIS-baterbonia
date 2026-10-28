import React, { useState, useMemo } from "react";
import { useNHO } from "../NHOContext";
import { NHOApplicant, NHODocumentItem } from "../nhoTypes";
import NHODocumentVerificationModal from "../ta/NHODocumentVerificationModal";
import { 
  FileCheck, 
  Search, 
  Filter, 
  CheckCircle, 
  AlertTriangle, 
  FileText, 
  Eye, 
  Clock, 
  User, 
  ShieldCheck,
  ChevronRight,
  ExternalLink
} from "lucide-react";

interface VerificationQueueItem {
  applicant: NHOApplicant;
  document: NHODocumentItem;
}

export default function NHODocumentVerificationQueue() {
  const { applicants, setSelectedApplicantId, verifyDocument, returnDocumentForCorrection, showToast } = useNHO();

  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("For Verification");
  const [selectedApplicantFilter, setSelectedApplicantFilter] = useState<string>("all");

  // Modal review state
  const [activeModalItem, setActiveModalItem] = useState<VerificationQueueItem | null>(null);

  // Quick inline correction state
  const [inlineReturnItem, setInlineReturnItem] = useState<VerificationQueueItem | null>(null);
  const [inlineRemarks, setInlineRemarks] = useState("");

  // Flatten all documents across all applicants into a single consolidated queue
  const allItems: VerificationQueueItem[] = useMemo(() => {
    const list: VerificationQueueItem[] = [];
    applicants.forEach(app => {
      app.documents.forEach(doc => {
        // Include any document that has a status other than "Not Submitted" or has been uploaded
        if (doc.status !== "Not Submitted" || doc.fileName || doc.submittedDate) {
          list.push({ applicant: app, document: doc });
        }
      });
    });
    return list;
  }, [applicants]);

  // Metrics
  const metrics = useMemo(() => {
    const pendingVerification = allItems.filter(i => i.document.status === "For Verification").length;
    const verified = allItems.filter(i => i.document.status === "Verified").length;
    const needsCorrection = allItems.filter(i => i.document.status === "Needs Correction").length;
    const majorsCount = allItems.filter(i => i.document.isMajor && i.document.status === "For Verification").length;

    return {
      pendingVerification,
      verified,
      needsCorrection,
      majorsCount
    };
  }, [allItems]);

  // Filtered items
  const filteredItems = useMemo(() => {
    return allItems.filter(({ applicant, document }) => {
      // Search
      const matchesSearch = 
        applicant.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        applicant.applicantNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        document.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (document.fileName || "").toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchesSearch) return false;

      // Category filter
      if (categoryFilter === "major" && !document.isMajor) return false;
      if (categoryFilter === "agreement" && !document.isEssentialAgreement) return false;
      if (categoryFilter === "other" && (document.isMajor || document.isEssentialAgreement)) return false;

      // Status filter
      if (statusFilter !== "all" && document.status !== statusFilter) return false;

      // Applicant filter
      if (selectedApplicantFilter !== "all" && applicant.id !== selectedApplicantFilter) return false;

      return true;
    });
  }, [allItems, searchQuery, categoryFilter, statusFilter, selectedApplicantFilter]);

  const handleQuickVerify = (appId: string, docId: string, docName: string) => {
    verifyDocument(appId, docId);
  };

  const handleConfirmInlineReturn = () => {
    if (!inlineReturnItem) return;
    if (!inlineRemarks.trim()) {
      showToast("Please enter mandatory correction remarks.", "error");
      return;
    }
    returnDocumentForCorrection(inlineReturnItem.applicant.id, inlineReturnItem.document.id, inlineRemarks);
    setInlineReturnItem(null);
    setInlineRemarks("");
  };

  return (
    <div className="space-y-6">
      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="bg-white rounded-xl p-4 border border-[#E6ECF2] shadow-xs">
          <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider block">
            For Verification
          </span>
          <div className="text-xl font-black text-amber-600 mt-1">{metrics.pendingVerification}</div>
          <span className="text-[10px] text-slate-500">Requires TA action</span>
        </div>

        <div className="bg-white rounded-xl p-4 border border-[#E6ECF2] shadow-xs">
          <span className="text-[10px] font-bold text-[#FF5C28] uppercase tracking-wider block">
            Pending Majors
          </span>
          <div className="text-xl font-black text-[#FF5C28] mt-1">{metrics.majorsCount}</div>
          <span className="text-[10px] text-slate-500">Major requirements</span>
        </div>

        <div className="bg-white rounded-xl p-4 border border-[#E6ECF2] shadow-xs">
          <span className="text-[10px] font-bold text-green-700 uppercase tracking-wider block">
            Verified Records
          </span>
          <div className="text-xl font-black text-green-600 mt-1">{metrics.verified}</div>
          <span className="text-[10px] text-slate-500">Approved by TA / HR</span>
        </div>

        <div className="bg-white rounded-xl p-4 border border-[#E6ECF2] shadow-xs">
          <span className="text-[10px] font-bold text-red-700 uppercase tracking-wider block">
            Needs Correction
          </span>
          <div className="text-xl font-black text-red-600 mt-1">{metrics.needsCorrection}</div>
          <span className="text-[10px] text-slate-500">Returned to applicant</span>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white rounded-xl border border-[#E6ECF2] p-4 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2.5 flex-1 min-w-[300px]">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search applicant, requirement, or file name..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-[#E6ECF2] text-xs focus:outline-none focus:border-[#042C51]"
            />
          </div>

          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
            className="p-1.5 bg-[#F7F9FC] border border-[#E6ECF2] rounded-xl text-xs font-semibold text-slate-700 focus:outline-none cursor-pointer"
          >
            <option value="all">All Categories</option>
            <option value="major">Major Requirements (4)</option>
            <option value="agreement">Essential Agreements (3)</option>
            <option value="other">Other Non-Majors</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="p-1.5 bg-[#F7F9FC] border border-[#E6ECF2] rounded-xl text-xs font-semibold text-slate-700 focus:outline-none cursor-pointer"
          >
            <option value="all">All Statuses</option>
            <option value="For Verification">For Verification Only</option>
            <option value="Verified">Verified</option>
            <option value="Needs Correction">Needs Correction</option>
          </select>

          {/* Applicant Filter */}
          <select
            value={selectedApplicantFilter}
            onChange={e => setSelectedApplicantFilter(e.target.value)}
            className="p-1.5 bg-[#F7F9FC] border border-[#E6ECF2] rounded-xl text-xs font-semibold text-slate-700 focus:outline-none cursor-pointer"
          >
            <option value="all">All Applicants</option>
            {applicants.map(a => (
              <option key={a.id} value={a.id}>{a.fullName}</option>
            ))}
          </select>
        </div>

        <span className="text-[11px] text-slate-400">
          Showing <strong>{filteredItems.length}</strong> items in queue
        </span>
      </div>

      {/* Verification Queue Table */}
      <div className="bg-white rounded-xl border border-[#E6ECF2] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#042C51] text-white border-b border-[#0B365F] text-[11px] font-semibold tracking-wider uppercase">
                <th className="py-3 px-4">Applicant</th>
                <th className="py-3 px-3">Requirement Name</th>
                <th className="py-3 px-3">Category</th>
                <th className="py-3 px-3">Submission Details</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-4 text-right">Verification Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E6ECF2]">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-slate-400 italic">
                    No documents found matching the selected filter criteria.
                  </td>
                </tr>
              ) : (
                filteredItems.map(({ applicant, document }) => {
                  const isVer = document.status === "Verified";
                  const isPending = document.status === "For Verification";
                  const isNeedsCorr = document.status === "Needs Correction";

                  return (
                    <tr key={`${applicant.id}-${document.id}`} className="hover:bg-[#F7F9FC]/80 transition-colors">
                      {/* Applicant */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-[#042C51]">{applicant.fullName}</div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          {applicant.applicantNumber} • {applicant.position}
                        </div>
                      </td>

                      {/* Requirement Name */}
                      <td className="py-3.5 px-3">
                        <div className="font-semibold text-slate-800">{document.name}</div>
                        <div className="text-[10px] text-slate-400">
                          {document.templateCode || "Standard Requirement"}
                        </div>
                        {isNeedsCorr && document.correctionRemarks && (
                          <div className="mt-1 text-[11px] text-red-700 bg-red-50 p-1.5 rounded border border-red-200">
                            <strong>Correction:</strong> {document.correctionRemarks}
                          </div>
                        )}
                      </td>

                      {/* Category */}
                      <td className="py-3.5 px-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold inline-block ${
                          document.isMajor
                            ? "bg-[#FF5C28]/15 text-[#e04f20]"
                            : document.isEssentialAgreement
                              ? "bg-purple-100 text-purple-800"
                              : "bg-slate-100 text-slate-600"
                        }`}>
                          {document.isMajor ? "Major (Mandatory)" : document.isEssentialAgreement ? "Agreement" : "Non-Major"}
                        </span>
                      </td>

                      {/* Submission Details */}
                      <td className="py-3.5 px-3">
                        <div className="text-slate-700 font-mono text-[11px]">
                          {document.fileName || (document.signatureDataUrl ? "Electronic Signature Captured" : "Physical Copy / Upload")}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {document.submittedDate ? `Submitted: ${document.submittedDate}` : "Session Recorded"}
                          {document.fileSize ? ` (${document.fileSize})` : ""}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-3">
                        <span className={`px-2.5 py-0.5 rounded font-bold text-[10px] inline-flex items-center gap-1 ${
                          isVer
                            ? "bg-green-100 text-green-800"
                            : isPending
                              ? "bg-blue-100 text-blue-800"
                              : isNeedsCorr
                                ? "bg-red-100 text-red-800"
                                : "bg-slate-100 text-slate-600"
                        }`}>
                          {isVer && <CheckCircle className="w-3 h-3 text-green-600" />}
                          {isPending && <Clock className="w-3 h-3 text-blue-600" />}
                          {isNeedsCorr && <AlertTriangle className="w-3 h-3 text-red-600" />}
                          <span>{document.status}</span>
                        </span>
                        {isVer && document.verifiedBy && (
                          <span className="text-[9.5px] text-slate-400 block mt-0.5">
                            by {document.verifiedBy.split(" ")[0]}
                          </span>
                        )}
                      </td>

                      {/* Verification Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Preview modal button */}
                          <button
                            onClick={() => setActiveModalItem({ applicant, document })}
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer"
                            title="Inspect File Preview & Audit"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          {!isVer && (
                            <>
                              <button
                                onClick={() => setInlineReturnItem({ applicant, document })}
                                className="px-2.5 py-1 rounded-lg bg-red-50 hover:bg-red-100 text-red-700 font-bold text-[11px] border border-red-200 transition-colors cursor-pointer"
                              >
                                Needs Correction
                              </button>
                              <button
                                onClick={() => handleQuickVerify(applicant.id, document.id, document.name)}
                                className="px-3 py-1 rounded-lg bg-green-600 hover:bg-green-700 text-white font-bold text-[11px] shadow-xs transition-colors cursor-pointer flex items-center gap-1"
                              >
                                <CheckCircle className="w-3.5 h-3.5" />
                                <span>Verify</span>
                              </button>
                            </>
                          )}

                          {isVer && (
                            <button
                              onClick={() => setInlineReturnItem({ applicant, document })}
                              className="px-2 py-1 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-500 font-semibold text-[10px] border border-slate-200 transition-colors cursor-pointer"
                              title="Authorized TA Correction: Return previously verified item"
                            >
                              Correction
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Audit Inspection */}
      {activeModalItem && (
        <NHODocumentVerificationModal
          isOpen={!!activeModalItem}
          onClose={() => setActiveModalItem(null)}
          document={activeModalItem.document}
          applicantId={activeModalItem.applicant.id}
          applicantName={activeModalItem.applicant.fullName}
        />
      )}

      {/* Inline Needs Correction Dialog */}
      {inlineReturnItem && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 text-xs space-y-4">
            <div>
              <h3 className="text-sm font-bold text-[#042C51]">Return Document for Correction</h3>
              <p className="text-slate-500 text-xs mt-0.5">
                Candidate: <strong>{inlineReturnItem.applicant.fullName}</strong> • Requirement: <strong>{inlineReturnItem.document.name}</strong>
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 block">
                Mandatory Correction Remarks:
              </label>
              <textarea
                rows={3}
                value={inlineRemarks}
                onChange={e => setInlineRemarks(e.target.value)}
                placeholder="Detail specifically what must be corrected (e.g. Blurry scan, illegible dry seal, expired certificate, missing page 2)..."
                className="w-full p-2.5 border border-slate-300 rounded-xl text-xs focus:outline-none focus:border-[#042C51]"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => {
                  setInlineReturnItem(null);
                  setInlineRemarks("");
                }}
                className="px-3.5 py-1.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmInlineReturn}
                className="px-4 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold shadow-xs cursor-pointer"
              >
                Confirm Return for Correction
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
