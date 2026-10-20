/**
 * SiBS HRIS - Figma Design System & Vector Canvas Generator
 * Produces ready-to-import Figma Design Tokens (JSON), Vector Canvas Artboards (SVG),
 * and HTML Design Specs covering all 10 core front-end UI screens.
 */

// 1. Standard W3C / Tokens Studio for Figma Tokens Definition
export const SIBS_FIGMA_TOKENS = {
  $schema: "https://tokens.studio/schema/1.0.0",
  global: {
    color: {
      primary: {
        navy: { value: "#042C51", type: "color", description: "Deep Navy - Dominant brand color for headers, text, and modals" }
      },
      accent: {
        orange: { value: "#FF5C28", type: "color", description: "Vivid Orange - Accent for primary buttons, focus rings, and active tabs" }
      },
      surface: {
        pageBg: { value: "#E6EAF0", type: "color", description: "Application shell canvas background" },
        cardBg: { value: "#FFFFFF", type: "color", description: "Card and modal background" },
        mutedBg: { value: "#F7F9FC", type: "color", description: "Secondary container background" }
      },
      tertiary: {
        1: { value: "#042C51", type: "color" },
        2: { value: "#0B365F", type: "color" },
        3: { value: "#13406D", type: "color" },
        4: { value: "#1A4C7B", type: "color" },
        5: { value: "#215789", type: "color" },
        6: { value: "#3E6F9B", type: "color" },
        7: { value: "#658EAF", type: "color" },
        8: { value: "#94A9C1", type: "color" },
        9: { value: "#BECBDA", type: "color" },
        10: { value: "#E6EAF0", type: "color" }
      },
      status: {
        success: { value: "#2ECC71", type: "color" },
        warning: { value: "#E67E22", type: "color" },
        danger: { value: "#E74C3C", type: "color" },
        info: { value: "#4B9DFE", type: "color" }
      }
    },
    fontFamilies: {
      primary: { value: "Plus Jakarta Sans, sans-serif", type: "fontFamilies" }
    },
    lineHeights: {
      tight: { value: "1.2", type: "lineHeights" },
      normal: { value: "1.5", type: "lineHeights" },
      relaxed: { value: "1.7", type: "lineHeights" }
    },
    fontSizes: {
      micro: { value: "10px", type: "fontSizes" },
      xs: { value: "12px", type: "fontSizes" },
      sm: { value: "13px", type: "fontSizes" },
      base: { value: "14px", type: "fontSizes" },
      md: { value: "16px", type: "fontSizes" },
      lg: { value: "18px", type: "fontSizes" },
      xl: { value: "22px", type: "fontSizes" }
    },
    borderRadius: {
      sm: { value: "6px", type: "borderRadius" },
      md: { value: "8px", type: "borderRadius" },
      lg: { value: "12px", type: "borderRadius" },
      xl: { value: "16px", type: "borderRadius" },
      pill: { value: "9999px", type: "borderRadius" }
    },
    boxShadow: {
      card: {
        value: {
          x: "0",
          y: "1px",
          blur: "2px",
          spread: "0",
          color: "rgba(16, 24, 40, 0.05)",
          type: "dropShadow"
        },
        type: "boxShadow"
      }
    }
  },
  components: {
    buttonPrimary: {
      background: { value: "{color.accent.orange}", type: "color" },
      textColor: { value: "#FFFFFF", type: "color" },
      borderRadius: { value: "{borderRadius.lg}", type: "borderRadius" },
      padding: { value: "10px 20px", type: "spacing" },
      fontWeight: { value: "700", type: "fontWeights" }
    },
    buttonSecondary: {
      background: { value: "#FFFFFF", type: "color" },
      borderColor: { value: "{color.tertiary.9}", type: "color" },
      textColor: { value: "{color.primary.navy}", type: "color" },
      borderRadius: { value: "{borderRadius.lg}", type: "borderRadius" },
      padding: { value: "10px 20px", type: "spacing" }
    },
    tableHeader: {
      background: { value: "#F8FAFC", type: "color" },
      textColor: { value: "#64748B", type: "color" },
      fontSize: { value: "{fontSizes.micro}", type: "fontSizes" },
      fontWeight: { value: "700", type: "fontWeights" }
    }
  }
};

/**
 * Generates an SVG string containing 10 scalable 1920x1080 Desktop Figma Frames
 * representing the front-end layout for each key module in SiBS HRIS.
 */
export function generateFigmaCanvasSvg(): string {
  const frameWidth = 1920;
  const frameHeight = 1080;
  const gap = 200;

  const screens = [
    { title: "01_Workforce_Planning_RAMPS", subtitle: "RAMPS Headcount & Capacity Planning Matrix", color: "#042C51" },
    { title: "02_Requisition_Intake_PRF", subtitle: "Personnel Requisition Form (PRF) Intake & Approval Drawer", color: "#0B365F" },
    { title: "03_Job_Description_Factor_Matrix", subtitle: "5-Factor Position Scoring & Salary Grade Alignment", color: "#13406D" },
    { title: "04_Applicant_Leads_Hub", subtitle: "Multi-Channel Sourcing Leads & Candidate Portal", color: "#1A4C7B" },
    { title: "05_Candidate_Evaluation_Pipeline", subtitle: "Assessment Grid, Typing WPM & Versant English Fit", color: "#042C51" },
    { title: "06_Compensation_Offer_Matrix", subtitle: "Itemized Salary Band Builder & Sign-Off Matrix", color: "#0B365F" },
    { title: "07_Pre_Employment_Compliance", subtitle: "Philippine Statutory Document Checklist (SSS, PhilHealth, Pag-IBIG, BIR, NBI)", color: "#13406D" },
    { title: "08_Employee_Directory_Roster", subtitle: "201 Personnel Master Roster & Department Directory", color: "#1A4C7B" },
    { title: "09_Time_Attendance_Roster", subtitle: "Biometric Clocking, Overtime & Shift Rostering", color: "#042C51" },
    { title: "10_Process_To_Screen_Specbook", subtitle: "Dual-Pane Flowchart Logic & Frontend Screen Mapping", color: "#FF5C28" }
  ];

  const totalWidth = (frameWidth + gap) * 5;
  const totalHeight = (frameHeight + gap) * 2;

  let framesSvg = "";

  screens.forEach((s, idx) => {
    const col = idx % 5;
    const row = Math.floor(idx / 5);
    const x = col * (frameWidth + gap);
    const y = row * (frameHeight + gap);

    framesSvg += `
    <!-- FIGMA FRAME: ${s.title} -->
    <g id="FigmaFrame_${idx + 1}_${s.title}" transform="translate(${x}, ${y})">
      <!-- Frame Canvas Outer -->
      <rect x="0" y="0" width="${frameWidth}" height="${frameHeight}" rx="16" fill="#E6EAF0" stroke="#CBD5E1" stroke-width="4" />

      <!-- Top Header Navigation Bar Component -->
      <rect x="0" y="0" width="${frameWidth}" height="80" fill="#042C51" />
      <rect x="0" y="80" width="${frameWidth}" height="6" fill="#FF5C28" />

      <!-- Brand Logo & Title -->
      <text x="40" y="48" font-family="Plus Jakarta Sans, sans-serif" font-weight="900" font-size="24" fill="#FFFFFF">SiBS HRIS</text>
      <rect x="180" y="28" width="2" height="32" fill="#3E6F9B" />
      <text x="200" y="48" font-family="Plus Jakarta Sans, sans-serif" font-weight="800" font-size="20" fill="#FFA488">${s.title}</text>
      <text x="600" y="48" font-family="Plus Jakarta Sans, sans-serif" font-weight="600" font-size="16" fill="#8FAEC9">${s.subtitle}</text>

      <!-- User Profile Tag -->
      <rect x="1650" y="20" width="230" height="42" rx="21" fill="#0B365F" stroke="#13406D" stroke-width="2" />
      <circle cx="1675" cy="41" r="14" fill="#FF5C28" />
      <text x="1675" y="46" font-family="Plus Jakarta Sans, sans-serif" font-weight="800" font-size="12" fill="#FFFFFF" text-anchor="middle">AB</text>
      <text x="1700" y="45" font-family="Plus Jakarta Sans, sans-serif" font-weight="700" font-size="13" fill="#FFFFFF">Alena Batacan</text>

      <!-- Sidebar Frame Component -->
      <rect x="0" y="86" width="280" height="994" fill="#042C51" />
      <line x1="280" y1="86" x2="280" y2="1080" stroke="#0B365F" stroke-width="2" />

      <!-- Sidebar Nav Items -->
      ${["Dashboard", "Workforce Hiring", "Applicant Leads", "Candidate Pipeline", "Compensation Offers", "Onboarding Gate", "Employee Directory", "Time & Attendance"].map((item, i) => `
        <rect x="20" y="${120 + i * 50}" width="240" height="40" rx="10" fill="${i === idx % 8 ? '#FF5C28' : 'transparent'}" />
        <text x="40" y="${145 + i * 50}" font-family="Plus Jakarta Sans, sans-serif" font-weight="700" font-size="14" fill="#FFFFFF">${item}</text>
      `).join('')}

      <!-- Main Content Area Container -->
      <rect x="320" y="116" width="1560" height="924" rx="20" fill="#FFFFFF" stroke="#E6ECF2" stroke-width="2" />

      <!-- Content Header Banner -->
      <rect x="350" y="146" width="1500" height="100" rx="16" fill="#F7F9FC" stroke="#E6ECF2" stroke-width="2" />
      <text x="380" y="190" font-family="Plus Jakarta Sans, sans-serif" font-weight="900" font-size="24" fill="#042C51">${s.title.replace(/_/g, " ")}</text>
      <text x="380" y="218" font-family="Plus Jakarta Sans, sans-serif" font-weight="600" font-size="15" fill="#667085">${s.subtitle}</text>
      <rect x="1650" y="170" width="170" height="48" rx="12" fill="#FF5C28" />
      <text x="1735" y="200" font-family="Plus Jakarta Sans, sans-serif" font-weight="800" font-size="14" fill="#FFFFFF" text-anchor="middle">+ Primary Action</text>

      <!-- KPI Stat Cards Grid (4 Cards) -->
      ${[1, 2, 3, 4].map((kpi, kIdx) => `
        <g transform="translate(${350 + kIdx * 385}, 270)">
          <rect x="0" y="0" width="360" height="100" rx="16" fill="#FFFFFF" stroke="#E6ECF2" stroke-width="2" />
          <rect x="0" y="0" width="360" height="4" rx="2" fill="${kIdx === 0 ? '#042C51' : kIdx === 1 ? '#2ECC71' : kIdx === 2 ? '#E67E22' : '#FF5C28'}" />
          <text x="24" y="36" font-family="Plus Jakarta Sans, sans-serif" font-weight="800" font-size="12" fill="#667085" letter-spacing="1">STAT METRIC 0${kpi}</text>
          <text x="24" y="72" font-family="Plus Jakarta Sans, sans-serif" font-weight="900" font-size="28" fill="#042C51">${kIdx === 0 ? '1,240' : kIdx === 1 ? '98.4%' : kIdx === 2 ? '14 Days' : 'P38,500'}</text>
        </g>
      `).join('')}

      <!-- Main Table / Roster Grid Area -->
      <rect x="350" y="400" width="1500" height="600" rx="16" fill="#FFFFFF" stroke="#E6ECF2" stroke-width="2" />
      <rect x="350" y="400" width="1500" height="50" rx="16" fill="#F8FAFC" />
      <text x="380" y="432" font-family="Plus Jakarta Sans, sans-serif" font-weight="800" font-size="13" fill="#64748B">RECORD ID & NAME</text>
      <text x="750" y="432" font-family="Plus Jakarta Sans, sans-serif" font-weight="800" font-size="13" fill="#64748B">DEPARTMENT & ROLE</text>
      <text x="1150" y="432" font-family="Plus Jakarta Sans, sans-serif" font-weight="800" font-size="13" fill="#64748B">STATUS & APPROVAL</text>
      <text x="1550" y="432" font-family="Plus Jakarta Sans, sans-serif" font-weight="800" font-size="13" fill="#64748B">DATE & SLA</text>

      <!-- Table Rows (8 Mock Vector Rows) -->
      ${[0, 1, 2, 3, 4, 5, 6, 7].map((rowIdx) => `
        <line x1="350" y1="${450 + rowIdx * 65}" x2="1850" y2="${450 + rowIdx * 65}" stroke="#F1F5F9" stroke-width="2" />
        <text x="380" y="${490 + rowIdx * 65}" font-family="Plus Jakarta Sans, sans-serif" font-weight="800" font-size="15" fill="#042C51">SIB-2026-00${rowIdx + 1} — Personnel Record</text>
        <text x="750" y="${490 + rowIdx * 65}" font-family="Plus Jakarta Sans, sans-serif" font-weight="600" font-size="14" fill="#334155">${rowIdx % 2 === 0 ? 'Healthcare Operations' : 'Technical Support'}</text>
        <rect x="1150" y="${470 + rowIdx * 65}" width="120" height="28" rx="14" fill="${rowIdx % 3 === 0 ? '#E8F8F0' : '#FEF5E7'}" />
        <text x="1210" y="${489 + rowIdx * 65}" font-family="Plus Jakarta Sans, sans-serif" font-weight="800" font-size="11" fill="${rowIdx % 3 === 0 ? '#1E8449' : '#E67E22'}" text-anchor="middle">${rowIdx % 3 === 0 ? 'APPROVED' : 'IN REVIEW'}</text>
        <text x="1550" y="${490 + rowIdx * 65}" font-family="Plus Jakarta Sans, sans-serif" font-weight="600" font-size="14" fill="#64748B">2026-09-21</text>
      `).join('')}

      <!-- Frame Badge Footer -->
      <rect x="0" y="${frameHeight - 40}" width="${frameWidth}" height="40" fill="#042C51" />
      <text x="40" y="${frameHeight - 16}" font-family="Plus Jakarta Sans, sans-serif" font-weight="700" font-size="14" fill="#8FAEC9">SiBS HRIS Vector Figma Frame ${idx + 1} of 10 • Ready to Drag & Drop into Figma</text>
    </g>
    `;
  });

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${totalWidth}" height="${totalHeight}" viewBox="0 0 ${totalWidth} ${totalHeight}" fill="none" xmlns="http://www.w3.org/2000/svg">
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800;900&amp;display=swap');
    text { font-family: 'Plus Jakarta Sans', sans-serif; }
  </style>

  <!-- BACKGROUND FIGMA CANVAS -->
  <rect width="${totalWidth}" height="${totalHeight}" fill="#1E1E1E" />

  ${framesSvg}
</svg>`;
}

/**
 * Generates a standalone HTML Design Spec bundle that can be opened in the browser
 * or imported using the free "HTML to Figma" / "HTML to Design" Figma plugin.
 */
export function generateFigmaHtmlSpec(): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>SiBS HRIS — Figma Design Spec & UI Components Bundle</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
  <style>
    :root {
      --sibs-navy: #042C51;
      --sibs-orange: #FF5C28;
      --sibs-bg: #E6EAF0;
      --sibs-card: #FFFFFF;
      --sibs-text: #042C51;
      --sibs-muted: #667085;
      --sibs-border: #E6ECF2;
      font-family: 'Plus Jakarta Sans', sans-serif;
    }
    body {
      margin: 0;
      padding: 40px;
      background-color: var(--sibs-bg);
      color: var(--sibs-navy);
    }
    .spec-container {
      max-width: 1400px;
      margin: 0 auto;
      background: white;
      border-radius: 20px;
      padding: 40px;
      box-shadow: 0 4px 20px rgba(4, 44, 81, 0.08);
    }
    .header {
      border-bottom: 2px solid var(--sibs-border);
      padding-bottom: 24px;
      margin-bottom: 32px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .brand-title {
      font-size: 28px;
      font-weight: 900;
      color: var(--sibs-navy);
      margin: 0;
    }
    .badge {
      background: #FFF2ED;
      color: var(--sibs-orange);
      padding: 6px 14px;
      border-radius: 8px;
      font-weight: 800;
      font-size: 12px;
      border: 1px solid #FFD8CA;
    }
    .palette-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
      gap: 16px;
      margin-bottom: 40px;
    }
    .color-swatch {
      border-radius: 12px;
      padding: 16px;
      color: white;
      font-weight: 800;
      font-size: 13px;
      border: 1px solid rgba(0,0,0,0.05);
    }
    .color-hex {
      font-size: 11px;
      opacity: 0.8;
      font-weight: 600;
      margin-top: 4px;
    }
    .ui-card {
      background: white;
      border: 1px solid var(--sibs-border);
      border-radius: 16px;
      padding: 24px;
      margin-bottom: 24px;
    }
    .btn-primary {
      background: var(--sibs-orange);
      color: white;
      padding: 12px 24px;
      border-radius: 12px;
      font-weight: 700;
      border: none;
      cursor: pointer;
      display: inline-block;
    }
    .btn-secondary {
      background: white;
      color: var(--sibs-navy);
      border: 1px solid #BECBDA;
      padding: 12px 24px;
      border-radius: 12px;
      font-weight: 700;
      cursor: pointer;
      display: inline-block;
    }
  </style>
</head>
<body>
  <div class="spec-container">
    <div class="header">
      <div>
        <h1 class="brand-title">SiBS HRIS — Figma Design System Spec</h1>
        <p style="color: var(--sibs-muted); margin-top: 6px;">Ready to import into Figma via HTML-to-Design / HTML to Figma plugin</p>
      </div>
      <span class="badge">10 CORE UI SCREENS • DESIGN TOKENS</span>
    </div>

    <h2>1. Brand Color Palette Tokens</h2>
    <div class="palette-grid">
      <div class="color-swatch" style="background: #042C51;">Primary Navy<div class="color-hex">#042C51</div></div>
      <div class="color-swatch" style="background: #FF5C28;">Vivid Orange<div class="color-hex">#FF5C28</div></div>
      <div class="color-swatch" style="background: #0B365F;">Tertiary 2<div class="color-hex">#0B365F</div></div>
      <div class="color-swatch" style="background: #215789;">Tertiary 5<div class="color-hex">#215789</div></div>
      <div class="color-swatch" style="background: #94A9C1; color: #042C51;">Tertiary 8<div class="color-hex">#94A9C1</div></div>
      <div class="color-swatch" style="background: #E6EAF0; color: #042C51;">Shell Background<div class="color-hex">#E6EAF0</div></div>
      <div class="color-swatch" style="background: #2ECC71;">Success Green<div class="color-hex">#2ECC71</div></div>
      <div class="color-swatch" style="background: #E67E22;">Warning Amber<div class="color-hex">#E67E22</div></div>
    </div>

    <h2>2. Interactive Component Library</h2>
    <div class="ui-card">
      <h3 style="margin-top:0;">Buttons & Actions</h3>
      <div style="display: flex; gap: 16px;">
        <button class="btn-primary">+ Submit Requisition</button>
        <button class="btn-secondary">Export Roster PDF</button>
      </div>
    </div>
  </div>
</body>
</html>`;
}

/**
 * Downloads a string file directly in the browser
 */
export function downloadFile(filename: string, content: string, contentType: string) {
  const blob = new Blob([content], { type: contentType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
