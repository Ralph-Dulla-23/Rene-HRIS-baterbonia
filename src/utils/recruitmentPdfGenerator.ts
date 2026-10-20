import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { FlowStep } from "../components/RecruitmentFlowchart";

type RGBColor = [number, number, number];

export function generateRecruitmentPipelinePdf(steps: FlowStep[]) {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const navy: RGBColor = [4, 44, 81]; // #042C51
  const orange: RGBColor = [255, 92, 40]; // #FF5C28
  const darkSlate: RGBColor = [30, 41, 59];
  const mutedSlate: RGBColor = [100, 116, 139];

  const setFill = (c: RGBColor) => doc.setFillColor(c[0], c[1], c[2]);
  const setText = (c: RGBColor) => doc.setTextColor(c[0], c[1], c[2]);

  // Header Banner
  setFill(navy);
  doc.rect(0, 0, 210, 28, "F");

  // Accent Orange Line
  setFill(orange);
  doc.rect(0, 28, 210, 2, "F");

  // Header Text
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text("SiBS HRIS ENTERPRISE WORKSPACE", 14, 12);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(255, 164, 136);
  doc.text("END-TO-END RECRUITMENT PIPELINE REPORT (STEPS 1 - 16)", 14, 18);
  doc.setTextColor(200, 220, 240);
  doc.text(`Generated: ${new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })} • Standard Operating Procedures v1.0`, 14, 23);

  // Executive Summary Card
  setText(navy);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("1. Executive Summary & Architecture Overview", 14, 38);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  setText(darkSlate);
  const summaryText = 
    "This official report details the comprehensive 16-step candidate journey and workforce intake lifecycle for SiBS campuses (Davao, Tagum, and Mabini). The workflow spans 4 strategic phases: Plan & Approve, Prepare, Attract & Evaluate, and Hire & Onboard. Each step is governed by strict Service Level Agreements (SLAs), documented role responsibilities, input requisites, and auditable outputs.";
  doc.text(doc.splitTextToSize(summaryText, 182), 14, 44);

  // Phase Breakdown Highlights
  const phases: Array<{ title: string; steps: string; sla: string; color: RGBColor }> = [
    { title: "Phase 1: Plan & Approve", steps: "Steps 1–2", sla: "1–2 Days", color: [29, 104, 189] },
    { title: "Phase 2: Prepare", steps: "Steps 3–5", sla: "1–2 Days", color: [14, 135, 115] },
    { title: "Phase 3: Attract & Evaluate", steps: "Steps 6–11", sla: "5–8 Days", color: [107, 33, 168] },
    { title: "Phase 4: Hire & Onboard", steps: "Steps 12–16", sla: "3–7 Days", color: [194, 65, 12] },
  ];

  let boxX = 14;
  phases.forEach((phase) => {
    doc.setFillColor(245, 247, 250);
    doc.roundedRect(boxX, 56, 42, 18, 2, 2, "F");
    setFill(phase.color);
    doc.rect(boxX, 56, 42, 2.5, "F");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    setText(phase.color);
    doc.text(phase.steps, boxX + 3, 62);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(7);
    setText(navy);
    doc.text(phase.title.split(":")[1] || phase.title, boxX + 3, 66);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(6.5);
    setText(mutedSlate);
    doc.text(`SLA: ${phase.sla}`, boxX + 3, 70);

    boxX += 46;
  });

  // Master Table: Summary of Steps 1-16
  setText(navy);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("2. Master Pipeline Matrix (Steps 1 to 16)", 14, 82);

  const tableRows = steps.map((s) => [
    `#${s.id}`,
    s.title.replace(/^\d+\.\s*/, ""),
    `Phase ${s.phaseId}`,
    s.roleOwner,
    s.slaDays,
    s.outputs[0] || "Audit entry"
  ]);

  autoTable(doc, {
    startY: 86,
    head: [["Step", "Process Name", "Phase", "Role Owner", "SLA", "Key Output"]],
    body: tableRows,
    theme: "grid",
    headStyles: {
      fillColor: [4, 44, 81],
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 7.5,
      cellPadding: 2,
    },
    bodyStyles: {
      fontSize: 7,
      cellPadding: 1.8,
      textColor: [30, 41, 59],
    },
    columnStyles: {
      0: { cellWidth: 12, fontStyle: "bold" },
      1: { cellWidth: 46, fontStyle: "bold" },
      2: { cellWidth: 18 },
      3: { cellWidth: 42 },
      4: { cellWidth: 26 },
      5: { cellWidth: 38 },
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    margin: { left: 14, right: 14 },
  });

  // Multi-page Detailed Steps Factsheet
  doc.addPage();

  // Page 2 Header
  setFill(navy);
  doc.rect(0, 0, 210, 18, "F");
  setFill(orange);
  doc.rect(0, 18, 210, 1.5, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("3. Detailed Operational Factsheet — Steps 1 to 16 Specifications", 14, 12);

  let currentY = 25;

  const phaseColors: Record<number, RGBColor> = {
    1: [29, 104, 189],
    2: [14, 135, 115],
    3: [107, 33, 168],
    4: [194, 65, 12],
  };

  steps.forEach((step) => {
    // Check page overflow
    if (currentY > 245) {
      doc.addPage();
      setFill(navy);
      doc.rect(0, 0, 210, 18, "F");
      setFill(orange);
      doc.rect(0, 18, 210, 1.5, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.text("3. Detailed Operational Factsheet (Continued)", 14, 12);
      currentY = 25;
    }

    // Step Header Card
    const cardHeight = 28 + Math.max(step.bullets.length * 3.2, 12);
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(14, currentY, 182, cardHeight, 1.5, 1.5, "F");
    
    // Left colored accent border
    const stepColor = phaseColors[step.phaseId] || navy;
    setFill(stepColor);
    doc.rect(14, currentY, 3, cardHeight, "F");

    // Step Title & Phase Tag
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9.5);
    setText(navy);
    doc.text(step.title, 20, currentY + 5.5);

    doc.setFontSize(7.5);
    setText(mutedSlate);
    doc.text(`Phase ${step.phaseId} • ${step.subtitle}`, 20, currentY + 9.5);

    // Metadata Row: Owner & SLA
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7);
    setText(orange);
    doc.text(`Owner:`, 20, currentY + 14);
    doc.setFont("helvetica", "normal");
    setText(darkSlate);
    doc.text(step.roleOwner, 32, currentY + 14);

    doc.setFont("helvetica", "bold");
    setText(orange);
    doc.text(`SLA:`, 115, currentY + 14);
    doc.setFont("helvetica", "normal");
    setText(darkSlate);
    doc.text(step.slaDays, 124, currentY + 14);

    // Description
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    setText(darkSlate);
    const descLines = doc.splitTextToSize(step.description, 172);
    doc.text(descLines, 20, currentY + 19);

    // Bullets / Checklist
    let bulletY = currentY + 23 + (descLines.length > 1 ? (descLines.length - 1) * 3 : 0);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(6.5);
    setText(navy);
    doc.text("CORE PROTOCOLS & FIELDS:", 20, bulletY);
    bulletY += 3.5;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(6.5);
    doc.setTextColor(51, 65, 85);
    step.bullets.slice(0, 4).forEach((bullet) => {
      doc.text(`• ${bullet}`, 22, bulletY);
      bulletY += 3;
    });

    // Inputs & Outputs summary
    doc.setFont("helvetica", "bold");
    doc.text("Inputs:", 100, bulletY - 9);
    doc.setFont("helvetica", "normal");
    doc.text(step.inputs.slice(0, 2).join(", "), 112, bulletY - 9);

    doc.setFont("helvetica", "bold");
    doc.text("Outputs:", 100, bulletY - 5.5);
    doc.setFont("helvetica", "normal");
    doc.text(step.outputs.slice(0, 2).join(", "), 114, bulletY - 5.5);

    currentY += cardHeight + 4;
  });

  // Footer on all pages
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(148, 163, 184);
    doc.text(`SiBS HRIS Enterprise v2.5 • Confidential Internal Report`, 14, 290);
    doc.text(`Page ${i} of ${totalPages}`, 185, 290);
  }

  // Save PDF
  doc.save("SiBS_Recruitment_Pipeline_Report_Steps_1_to_16.pdf");
}
