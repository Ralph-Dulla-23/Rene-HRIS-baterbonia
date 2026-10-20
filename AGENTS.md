# SiBS HRIS — Design System & Engineering Guidelines

## Overview
SiBS HRIS is an internal Human Resources Information System. The visual identity is professional, compact, and data-dense — built for HR administrators, recruiters, and employees on desktop and laptop viewports.

The design language uses a navy + orange brand palette on a pale gray-blue background with white rounded cards, subtle borders and shadows, and Plus Jakarta Sans as the sole typeface.

All UI must feel polished and enterprise-grade. Avoid casual or consumer-style aesthetics.

---

## 1. Brand Colors & Palette

### Primary (`#042C51` — Deep Navy)
- Used for headings, sidebar text, table header text, modal headers, and all dark text.
- Dominant brand colour and default `color` on `:root`.

### Accent (`#FF5C28` — Vivid Orange)
- Reserved for primary action buttons ("New Personnel Requisition", "Submit for Approval"), active pagination, focus rings, hover accents, and the top-accent gradient bar on cards.
- **NEVER** use as body text — contrast against white surfaces is insufficient for AA body text.

### Surface (`#F7F9FC` / `#FAFCFF`)
- Page and header backgrounds.
- Application shell background: `#E6EAF0` (tertiary-10).
- Avoid pure `#FFFFFF` as a full-page background; white is strictly reserved for cards, tables, and modals.

### Tertiary Scale (`#042C51` → `#E6EAF0`)
10-step navy-to-light-gray ramp:
- `tertiary-1`: `#042C51` (Deep Navy)
- `tertiary-2`: `#0B365F`
- `tertiary-3`: `#13406D`
- `tertiary-4`: `#1A4C7B`
- `tertiary-5` (`#215789`): Muted sidebar text, secondary labels, subtext
- `tertiary-6`: `#3E6F9B`
- `tertiary-7`: `#658EAF`
- `tertiary-8` (`#94A9C1`): Input borders, subtle control outlines
- `tertiary-9` (`#BECBDA`): Card separators, table row borders, sidebar section dividers
- `tertiary-10` (`#E6EAF0`): Application shell background, container background

### Muted Text (`#667085`)
- Table column headers, KPI descriptions, section subtitles.
- Always pair with white or light surface backgrounds.

### Status & Tone Colors
- **Success:** `#2ECC71` (`sibs-tone-green-*`)
- **Warning:** `#E67E22` (`sibs-tone-amber-*`)
- **Danger:** `#E74C3C` (`sibs-tone-red-*`)
- **Info:** `#4B9DFE` (`sibs-tone-blue-*`)

---

## 2. Typography

Plus Jakarta Sans is the only typeface. Load via `font-jakarta` or global font family. All text inherits this font globally.

### Centralized Responsive Typography System (`index.css`)
Consistent font scaling across full 1920×1080 (`2xl`) displays and compact 1366×768 (`xl`/`lg`) monitors:

- **`.sibs-text-micro`**: `9.5px` on compact displays (`< 1536px`), `10px` on `2xl` (1920p). Used for kickers, category titles, date tags, and badge text.
- **`.sibs-text-xs`**: `11.5px` on compact displays (`< 1536px`), `12px` on `2xl` (1920p). Used for sidebar navigation links, search inputs, user profile names, and small table cells.
- **`.sibs-text-sm`**: `12.5px` on compact displays (`< 1536px`), `13px` on `2xl` (1920p). Used for secondary data, button text, and compact form fields.
- **`.sibs-text-base`**: `13.5px` on compact displays (`< 1536px`), `14px` on `2xl` (1920p). Standard body, table content, and card descriptions.
- **`.sibs-text-md`**: `15px` on compact displays (`< 1536px`), `16px` on `2xl` (1920p). Section headers, card titles.
- **`.sibs-text-lg`**: `17px` on compact displays (`< 1536px`), `18px` on `2xl` (1920p). Sub-module titles, modal titles.
- **`.sibs-text-xl`**: `20px` on compact displays (`< 1536px`), `22px` on `2xl` (1920p). Page titles, primary KPI numbers.

---

## 3. Component & Layout Rules
1. **Cards & Containers**: White rounded cards (`bg-white rounded-xl border border-[#E6ECF2] shadow-xs`).
2. **Top Accent Gradient**: Key cards can feature a subtle 2-3px top accent bar (`from-[#042C51] to-[#FF5C28]` or solid `#FF5C28`).
3. **Buttons**:
   - Primary: `bg-[#FF5C28] hover:bg-[#e04f20] text-white font-semibold rounded-xl shadow-xs transition-colors`.
   - Secondary: `bg-white border border-[#BECBDA] text-[#042C51] hover:bg-[#F7F9FC] font-semibold rounded-xl`.
4. **Data Density**: Compact row heights, clear tabular alignment, high information density without visual clutter.
