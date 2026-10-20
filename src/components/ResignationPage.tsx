import React, { useState } from "react";
import {
  FileText,
  Plus,
  Calendar,
  Clock,
  UserX,
  AlertCircle,
  CheckCircle2,
  HelpCircle,
  Paperclip,
  Edit2,
  RotateCcw,
  CalendarPlus,
  ShieldAlert,
  ChevronRight,
  Info,
  Download
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import ResignationModal from "./ResignationModal";
import { ResignationRecord } from "../types";

interface ResignationPageProps {
  userEmail?: string;
  resignations: ResignationRecord[];
  onAddResignation: (record: Partial<ResignationRecord>) => void;
  onUpdateResignation: (id: string, updatedRecord: Partial<ResignationRecord>) => void;
}

export default function ResignationPage({
  userEmail = "alena.batacan@thesiblingssolutions.com",
  resignations,
  onAddResignation,
  onUpdateResignation
}: ResignationPageProps) {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [modalMode, setModalMode] = useState<"create" | "edit" | "extend" | "retract">("create");
  const [selectedRecord, setSelectedRecord] = useState<ResignationRecord | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Filter employee's own resignation list (matching Alena Batacan or current user email)
  const myResignations = resignations.filter(
    r => r.employeeName === "Alena Batacan" || userEmail.includes(r.employeeName.toLowerCase().split(" ")[0])
  );

  // Default current active resignation (or latest)
  const activeResignation = myResignations[0] || null;

  // Calculate days remaining until last working date
  const getRemainingDays = (lastDateStr: string) => {
    if (!lastDateStr) return 0;
    const today = new Date();
    const target = new Date(lastDateStr);
    const diffTime = target.getTime() - today.getTime();
    return Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleOpenSubmit = () => {
    setSelectedRecord(null);
    setModalMode("create");
    setIsModalOpen(true);
  };

  const handleOpenEdit = (rec: ResignationRecord) => {
    setSelectedRecord(rec);
    setModalMode("edit");
    setIsModalOpen(true);
  };

  const handleOpenExtend = (rec: ResignationRecord) => {
    setSelectedRecord(rec);
    setModalMode("extend");
    setIsModalOpen(true);
  };

  const handleOpenRetract = (rec: ResignationRecord) => {
    setSelectedRecord(rec);
    setModalMode("retract");
    setIsModalOpen(true);
  };

  const handleModalSubmit = (payload: Partial<ResignationRecord>) => {
    if (modalMode === "create") {
      onAddResignation(payload);
      showToast("Resignation application successfully submitted!");
    } else if (selectedRecord) {
      onUpdateResignation(selectedRecord.id, payload);
      showToast(`Resignation request ${selectedRecord.id} updated!`);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 right-6 z-50 bg-[#042C51] text-white px-4 py-3 rounded-xl shadow-2xl border border-teal-400 flex items-center gap-3 text-xs font-bold"
          >
            <CheckCircle2 className="w-5 h-5 text-teal-400 shrink-0" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* HEADER SECTION */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] bg-[#E9F0FC] text-[#042C51] px-2.5 py-0.5 rounded font-black border border-blue-100 uppercase tracking-wider flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#FF5C28] inline-block"></span>
              Employee Self Service
            </span>
          </div>
          <h1 className="text-xl font-black text-[#042C51] tracking-tight">
            My Resignation & Notice Tracker
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Submit formal notice, track separation status, manage last working dates, and view clearance workflows.
          </p>
        </div>

        {/* Top-Right Header Button */}
        <button
          onClick={handleOpenSubmit}
          className="px-5 py-2.5 rounded-xl bg-[#FF5C28] hover:bg-[#e04b1a] text-white text-xs font-bold shadow-lg shadow-orange-500/20 flex items-center gap-2 transition-all self-start md:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Submit Resignation</span>
        </button>
      </div>

      {/* KPI METRIC CARDS SUMMARY */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wide">
            <span>Separation Status</span>
            <UserX className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-lg font-black text-[#042C51] flex items-center gap-2">
            {activeResignation ? (
              <span
                className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                  activeResignation.status === "Pending Approval"
                    ? "bg-amber-100 text-amber-800 border border-amber-200"
                    : activeResignation.status === "Notice Period"
                    ? "bg-teal-100 text-teal-800 border border-teal-200"
                    : activeResignation.status === "Completed"
                    ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                    : "bg-red-100 text-red-800 border border-red-200"
                }`}
              >
                {activeResignation.status}
              </span>
            ) : (
              <span className="text-slate-400 text-sm">No Active Request</span>
            )}
          </div>
          <p className="text-[11px] text-slate-400">
            {activeResignation ? `Filed on ${activeResignation.submissionDate}` : "Standard notice requires 30 days."}
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wide">
            <span>Effective Last Working Date</span>
            <Calendar className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-xl font-black text-[#042C51] font-mono">
            {activeResignation ? activeResignation.lastWorkingDate : "—"}
          </div>
          <p className="text-[11px] text-teal-700 font-semibold">
            {activeResignation ? `${activeResignation.type} Notice` : "Aligned with Asia/Manila Timezone"}
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wide">
            <span>Notice Days Remaining</span>
            <Clock className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-black text-amber-600 font-mono">
            {activeResignation ? getRemainingDays(activeResignation.lastWorkingDate) : 0}{" "}
            <span className="text-xs font-normal text-slate-500">Days</span>
          </div>
          <p className="text-[11px] text-slate-400">Countdown to exit & handover</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wide">
            <span>Notice Type</span>
            <ShieldAlert className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-lg font-black text-[#042C51]">
            {activeResignation ? (
              <span
                className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                  activeResignation.type === "Formal"
                    ? "bg-blue-100 text-blue-800 border border-blue-200"
                    : "bg-amber-100 text-amber-800 border border-amber-200"
                }`}
              >
                {activeResignation.type} Notice
              </span>
            ) : (
              "N/A"
            )}
          </div>
          <p className="text-[11px] text-slate-400">
            {activeResignation?.type === "Formal" ? "30 Days Standard" : "Under 30 Days"}
          </p>
        </div>
      </div>

      {/* MY RESIGNATIONS LIST TABLE */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#042C51]" />
            <h2 className="text-sm font-bold text-[#042C51]">My Resignation List</h2>
            <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-mono">
              {myResignations.length} Record(s)
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Click row actions to Edit details, Extend date, or Retract request.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-500 uppercase font-extrabold text-[10px] tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3.5 px-4">Request ID</th>
                <th className="py-3.5 px-4">Type</th>
                <th className="py-3.5 px-4">Resignation Date</th>
                <th className="py-3.5 px-4">Last Working Date</th>
                <th className="py-3.5 px-4">Reason</th>
                <th className="py-3.5 px-4">Attachments</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {myResignations.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400 text-xs">
                    No resignation requests filed yet. Click "Submit Resignation" to file.
                  </td>
                </tr>
              ) : (
                myResignations.map((rec) => (
                  <tr key={rec.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-4 px-4 font-mono font-bold text-[#042C51]">
                      {rec.id}
                    </td>
                    <td className="py-4 px-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                          rec.type === "Formal"
                            ? "bg-teal-50 text-teal-800 border border-teal-200"
                            : "bg-amber-50 text-amber-800 border border-amber-200"
                        }`}
                      >
                        {rec.type}
                      </span>
                    </td>
                    <td className="py-4 px-4 font-mono text-slate-600">{rec.resignationDate}</td>
                    <td className="py-4 px-4 font-mono font-bold text-[#042C51]">
                      {rec.lastWorkingDate}
                    </td>
                    <td className="py-4 px-4 max-w-[200px]">
                      <span className="font-semibold text-slate-800 truncate block">{rec.reason}</span>
                      {rec.remarks && <span className="text-[10px] text-slate-400 block truncate">{rec.remarks}</span>}
                    </td>
                    <td className="py-4 px-4">
                      {rec.attachments && rec.attachments.length > 0 ? (
                        <div className="flex items-center gap-1 text-blue-600 font-semibold text-[11px]">
                          <Paperclip className="w-3.5 h-3.5 shrink-0" />
                          <span>{rec.attachments.length} file(s)</span>
                        </div>
                      ) : (
                        <span className="text-slate-400 text-[11px]">None</span>
                      )}
                    </td>
                    <td className="py-4 px-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[11px] font-bold inline-block ${
                          rec.status === "Pending Approval"
                            ? "bg-amber-100 text-amber-800"
                            : rec.status === "Notice Period"
                            ? "bg-teal-100 text-teal-800"
                            : rec.status === "Completed"
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {rec.status}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenEdit(rec)}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[11px] font-bold flex items-center gap-1 transition-colors"
                          title="Edit Resignation Details"
                        >
                          <Edit2 className="w-3 h-3" />
                          <span>Edit</span>
                        </button>
                        <button
                          onClick={() => handleOpenExtend(rec)}
                          className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-800 rounded-lg text-[11px] font-bold flex items-center gap-1 transition-colors"
                          title="Extend Last Working Date"
                        >
                          <CalendarPlus className="w-3 h-3" />
                          <span>Extend</span>
                        </button>
                        <button
                          onClick={() => handleOpenRetract(rec)}
                          className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-lg text-[11px] font-bold flex items-center gap-1 transition-colors"
                          title="Request Retraction"
                        >
                          <RotateCcw className="w-3 h-3" />
                          <span>Retract</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL COMPONENT */}
      <ResignationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleModalSubmit}
        initialData={selectedRecord}
        mode={modalMode}
      />
    </div>
  );
}
