import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { DetailRecord, SummaryMetrics } from "../types";

type RGBColor = [number, number, number];

interface WorkforcePdfProps {
  metrics: SummaryMetrics;
  detailRecords: DetailRecord[];
  activeCluster: string;
  activeAccount: string;
  dateRange: string;
}

export function generateWorkforceHiringPdf({
  metrics,
  detailRecords,
  activeCluster,
  activeAccount,
  dateRange,
}: WorkforcePdfProps) {
  // A4 Landscape: 297mm x 210mm
  const doc = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: "a4",
  });

  const navy: RGBColor = [4, 44, 81]; // #042C51
  const orange: RGBColor = [255, 92, 40]; // #FF5C28
  const lightGray: RGBColor = [244, 247, 250]; // #F4F7FA
  const borderGray: RGBColor = [230, 236, 242]; // #E6ECF2
  const textMuted: RGBColor = [102, 112, 133]; // #667085
  const green: RGBColor = [46, 204, 113];
  const red: RGBColor = [231, 76, 60];

  const setFill = (c: RGBColor) => doc.setFillColor(c[0], c[1], c[2]);
  const setText = (c: RGBColor) => doc.setTextColor(c[0], c[1], c[2]);

  // 1. Executive Top Header Banner
  setFill(navy);
  doc.rect(0, 0, 297, 22, "F");

  // 2. Vivid Orange Accent Stripe
  setFill(orange);
  doc.rect(0, 22, 297, 1.8, "F");

  // Header Title
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text("SiBS HRIS ENTERPRISE WORKFORCE INTELLIGENCE", 14, 10);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(255, 180, 150);
  doc.text("WORKFORCE CAPACITY & HIRING DASHBOARD REPORT", 14, 15);

  doc.setTextColor(200, 220, 245);
  doc.setFontSize(7.5);
  const nowStr = new Date().toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
  doc.text(`Version Period: ${dateRange}  •  Scope: ${activeCluster} / ${activeAccount}  •  Exported: ${nowStr}`, 14, 19.5);

  // 3. KPI Summary Bar (8 Mini Metric Boxes)
  const kpis = [
    { label: "PLANNED HC", val: metrics.requiredHeadcount.toLocaleString(), color: navy },
    { label: "ACTUAL HC", val: metrics.actualHeadcount.toLocaleString(), color: navy },
    { label: "BUFFER CUSHION", val: `${metrics.bufferPercentage > 0 ? "+" : ""}${metrics.bufferPercentage}%`, color: metrics.bufferPercentage >= 0 ? green : red },
    { label: "ABSENTEEISM", val: `${metrics.absenteeismCount} (${metrics.absenteeismPercentage}%)`, color: navy },
    { label: "ATTRITION", val: `${metrics.attritionCount} (${metrics.attritionPercentage}%)`, color: red },
    { label: "NET ACTUAL HC", val: metrics.netActualHC.toLocaleString(), color: navy },
    { label: "HIRING NEEDED", val: metrics.hiringNeeded.toLocaleString(), color: red },
    { label: "TOTAL HIRED", val: `${metrics.hiredCount} agents`, color: orange },
  ];

  let startX = 14;
  const boxW = 32.5;
  const boxH = 13;
  kpis.forEach((kpi) => {
    setFill(lightGray);
    doc.roundedRect(startX, 26, boxW, boxH, 1.5, 1.5, "F");
    doc.setDrawColor(borderGray[0], borderGray[1], borderGray[2]);
    doc.setLineWidth(0.3);
    doc.roundedRect(startX, 26, boxW, boxH, 1.5, 1.5, "S");

    // Top Label
    doc.setFont("helvetica", "bold");
    doc.setFontSize(6);
    setText(textMuted);
    doc.text(kpi.label, startX + 2.5, 30);

    // Value
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    setText(kpi.color);
    doc.text(kpi.val, startX + 2.5, 36);

    startX += boxW + 2.5;
  });

  // 4. Funnel Snapshot Sub-Header
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  setText(navy);
  doc.text("OPERATIONAL ACCOUNT LEDGER & PIPELINE PERFORMANCE", 14, 43);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  setText(textMuted);
  doc.text(`Showing ${detailRecords.length} accounts sorted by capacity & headcount`, 180, 43);

  // 5. Data Rows for AutoTable
  const tableData = detailRecords.map((r, idx) => [
    idx + 1,
    r.cluster,
    r.account,
    r.requiredHC,
    r.actualHC,
    `${r.bufferPercentage > 0 ? "+" : ""}${r.bufferPercentage}%`,
    r.netActualHC,
    r.hiringNeeded,
    r.absenteeismCount,
    `${r.absenteeismPercentage}%`,
    r.attritionCount,
    `${r.attritionPercentage}%`,
    r.acceptedJO,
    r.nho,
    r.fst,
    r.pst,
    r.goLive,
    r.hiredCount,
    `${r.hiringRate}%`,
    r.riskLevel,
  ]);

  // Two-tier header style
  autoTable(doc, {
    startY: 46,
    margin: { left: 14, right: 14, bottom: 12 },
    head: [
      [
        { content: "#", rowSpan: 2, styles: { halign: "center", valign: "middle" } },
        { content: "CLUSTER", rowSpan: 2, styles: { valign: "middle" } },
        { content: "ACCOUNT", rowSpan: 2, styles: { valign: "middle" } },
        { content: "WORKFORCE CAPACITY", colSpan: 5, styles: { halign: "center", fillColor: [4, 44, 81], textColor: [255, 255, 255] } },
        { content: "SHRINKAGE & ATTRITION", colSpan: 4, styles: { halign: "center", fillColor: [3, 27, 51], textColor: [255, 255, 255] } },
        { content: "HIRING FUNNEL MILESTONES", colSpan: 5, styles: { halign: "center", fillColor: [4, 44, 81], textColor: [255, 255, 255] } },
        { content: "RESULTS", colSpan: 3, styles: { halign: "center", fillColor: [3, 27, 51], textColor: [255, 255, 255] } },
      ],
      [
        "Planned",
        "Actual",
        "Buffer %",
        "Net Act",
        "Needed",
        "Abs",
        "Abs %",
        "Att",
        "Att %",
        "Acc JO",
        "NHO",
        "FST",
        "PST",
        "Go Live",
        "Hired",
        "Yield %",
        "Risk",
      ],
    ],
    body: tableData,
    styles: {
      font: "helvetica",
      fontSize: 6.5,
      cellPadding: 1.2,
      textColor: [4, 44, 81],
      lineColor: [230, 236, 242],
      lineWidth: 0.15,
    },
    headStyles: {
      fillColor: [244, 247, 250],
      textColor: [4, 44, 81],
      fontStyle: "bold",
      fontSize: 6.5,
      halign: "right",
      lineColor: [200, 210, 225],
      lineWidth: 0.2,
    },
    alternateRowStyles: {
      fillColor: [250, 252, 255],
    },
    columnStyles: {
      0: { halign: "center", cellWidth: 7 },
      1: { halign: "left", fontStyle: "bold", cellWidth: 20 },
      2: { halign: "left", fontStyle: "bold", cellWidth: 32 },
      3: { halign: "right" },
      4: { halign: "right" },
      5: { halign: "right", fontStyle: "bold" },
      6: { halign: "right" },
      7: { halign: "right", fontStyle: "bold" },
      8: { halign: "right" },
      9: { halign: "right" },
      10: { halign: "right" },
      11: { halign: "right" },
      12: { halign: "right" },
      13: { halign: "right" },
      14: { halign: "right" },
      15: { halign: "right" },
      16: { halign: "right", fontStyle: "bold" },
      17: { halign: "right", fontStyle: "bold" },
      18: { halign: "right" },
      19: { halign: "center", fontStyle: "bold" },
    },
    didParseCell: (data) => {
      // Color-code Buffer % in column 5
      if (data.section === "body" && data.column.index === 5) {
        const text = String(data.cell.raw);
        if (text.startsWith("-")) {
          data.cell.styles.textColor = [231, 76, 60]; // Red
        } else {
          data.cell.styles.textColor = [46, 204, 113]; // Green
        }
      }
      // Color-code Hiring Needed in column 7
      if (data.section === "body" && data.column.index === 7) {
        const num = Number(data.cell.raw);
        if (num > 0) {
          data.cell.styles.textColor = [231, 76, 60];
        }
      }
      // Color-code Risk
      if (data.section === "body" && data.column.index === 19) {
        const risk = String(data.cell.raw);
        if (risk === "Critical") data.cell.styles.textColor = [231, 76, 60];
        else if (risk === "At Risk") data.cell.styles.textColor = [230, 126, 34];
        else if (risk === "Healthy") data.cell.styles.textColor = [46, 204, 113];
        else data.cell.styles.textColor = [75, 157, 254];
      }
    },
    didDrawPage: (data) => {
      // Page Number Footer
      const totalPages = doc.getNumberOfPages();
      const currentPage = data.pageNumber;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(6.5);
      setText(textMuted);
      doc.text(
        `SiBS HRIS Enterprise Confidential • Page ${currentPage} of ${totalPages}`,
        14,
        206
      );
      doc.text(
        "Standard Operating Procedures • Workforce Planning & Capacity Directorate",
        220,
        206
      );
    },
  });

  // Save the document
  const filename = `SiBS_Workforce_Hiring_${dateRange.replace(/[^a-zA-Z0-9]/g, "_").slice(0, 30)}.pdf`;
  doc.save(filename);
}
