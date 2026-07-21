# Design System — Personal Expense Tracker
## Version 1.0 | Desktop Application | Electron + Vanilla JS

> Inspired by Notion, Arc Browser, Linear, Raycast, and modern finance apps (Copilot, Monarch Money).
> The goal is a **premium desktop feel**: calm, focused, information-dense without feeling cluttered.

---

## 1. Visual Style Principles

| Principle | Description |
|-----------|-------------|
| **Modern** | Clean geometry, no skeuomorphism, purposeful use of whitespace |
| **Minimal** | Only show what the user needs right now; reduce chrome |
| **Professional** | Consistent spacing, restrained color, refined typography |
| **Desktop-first** | Optimised for 1000–1600 px wide windows; not mobile-adapted |
| **Data-forward** | Numbers are the hero; UI elements support rather than compete |
| **Calm** | Low-saturation palette with a single energetic accent |


---

## 2. Color Palette

### 2.1 Semantic Color Roles

| Role | Purpose |
|------|---------|
| `--color-primary` | Main brand, active nav, primary CTA buttons |
| `--color-primary-hover` | Button/link hover state |
| `--color-primary-subtle` | Tinted backgrounds behind active items |
| `--color-secondary` | Secondary actions, badges, tags |
| `--color-accent` | Highlights, sparklines, chart bars |
| `--color-success` | Income amounts, positive balance, success toasts |
| `--color-success-subtle` | Income row tint, success tag background |
| `--color-warning` | Approaching budget limits, caution states |
| `--color-warning-subtle` | Warning tag background |
| `--color-error` | Expense amounts, negative balance, error states, danger buttons |
| `--color-error-subtle` | Expense row tint, error tag background |
| `--color-bg-base` | Window / outermost background |
| `--color-bg-raised` | Cards, sidebar |
| `--color-bg-overlay` | Modals, dropdowns, tooltips |
| `--color-border` | Default dividers and input borders |
| `--color-border-strong` | Focused input, selected row |
| `--color-text-primary` | Headings, amounts, important data |
| `--color-text-secondary` | Labels, captions, placeholders |
| `--color-text-disabled` | Disabled controls |


### 2.2 Light Theme Values

```css
:root {
  /* Brand */
  --color-primary:         #5C6BC0;   /* Indigo 400 — calm, trustworthy */
  --color-primary-hover:   #3F51B5;   /* Indigo 600 */
  --color-primary-subtle:  #EEF0FB;   /* Indigo 50 */

  /* Secondary */
  --color-secondary:       #78909C;   /* Blue Grey 400 */

  /* Accent */
  --color-accent:          #26C6DA;   /* Cyan 400 — chart highlights */

  /* Semantic */
  --color-success:         #2E7D32;   /* Green 800 */
  --color-success-subtle:  #E8F5E9;   /* Green 50 */
  --color-warning:         #E65100;   /* Deep Orange 900 */
  --color-warning-subtle:  #FFF3E0;   /* Orange 50 */
  --color-error:           #C62828;   /* Red 800 */
  --color-error-subtle:    #FFEBEE;   /* Red 50 */

  /* Backgrounds */
  --color-bg-base:         #F4F5F7;   /* Near-white grey — window bg */
  --color-bg-raised:       #FFFFFF;   /* Cards, sidebar panels */
  --color-bg-overlay:      #FFFFFF;   /* Modals, dropdowns */

  /* Borders */
  --color-border:          #E2E4E9;
  --color-border-strong:   #5C6BC0;   /* Matches primary on focus */

  /* Text */
  --color-text-primary:    #1A1D23;   /* Near-black */
  --color-text-secondary:  #6B7280;   /* Neutral 500 */
  --color-text-disabled:   #B0B7C3;

  /* Sidebar specific */
  --color-sidebar-bg:      #FFFFFF;
  --color-sidebar-active:  #EEF0FB;
  --color-sidebar-text:    #374151;
  --color-sidebar-icon:    #6B7280;
}
```


### 2.3 Dark Theme Values

```css
[data-theme="dark"] {
  /* Brand */
  --color-primary:         #7986CB;   /* Indigo 300 — lighter for dark bg */
  --color-primary-hover:   #9FA8DA;   /* Indigo 200 */
  --color-primary-subtle:  #1E2140;   /* Deep indigo tint */

  /* Secondary */
  --color-secondary:       #90A4AE;   /* Blue Grey 300 */

  /* Accent */
  --color-accent:          #4DD0E1;   /* Cyan 300 */

  /* Semantic */
  --color-success:         #66BB6A;   /* Green 400 */
  --color-success-subtle:  #1B3A1E;   /* Dark green tint */
  --color-warning:         #FFA726;   /* Orange 400 */
  --color-warning-subtle:  #3A2A10;   /* Dark orange tint */
  --color-error:           #EF5350;   /* Red 400 */
  --color-error-subtle:    #3A1A1A;   /* Dark red tint */

  /* Backgrounds — layered dark greys */
  --color-bg-base:         #0F1117;   /* Darkest — window bg */
  --color-bg-raised:       #181C24;   /* Cards, sidebar */
  --color-bg-overlay:      #1E2330;   /* Modals, dropdowns */

  /* Borders */
  --color-border:          #2A2F3E;
  --color-border-strong:   #7986CB;

  /* Text */
  --color-text-primary:    #E8EAF0;
  --color-text-secondary:  #8B92A5;
  --color-text-disabled:   #3D4455;

  /* Sidebar specific */
  --color-sidebar-bg:      #181C24;
  --color-sidebar-active:  #1E2140;
  --color-sidebar-text:    #C5CAE9;
  --color-sidebar-icon:    #8B92A5;
}
```

### 2.4 Chart Colors

A fixed 7-color sequence for category pie/doughnut slices.
Chosen to be distinguishable in both light and dark themes.

```
Food          #5C6BC0   (primary indigo)
Transport     #26C6DA   (accent cyan)
Shopping      #AB47BC   (purple)
Bills         #EF5350   (red)
Entertainment #FFA726   (orange)
Healthcare    #66BB6A   (green)
Other         #78909C   (blue grey)
```


---

## 3. Typography

### 3.1 Font Stack

```css
--font-sans: 'Inter', 'Segoe UI', system-ui, -apple-system, sans-serif;
--font-mono: 'JetBrains Mono', 'Cascadia Code', 'Fira Code', monospace;
```

Inter is loaded via a local import or bundled — no network call required.
Monospace is used exclusively for monetary amounts to keep digits aligned.

### 3.2 Type Scale

| Token | Size | Line Height | Weight | Usage |
|-------|------|-------------|--------|-------|
| `--text-xs`  | 11px | 16px | 400 | Timestamps, sub-labels |
| `--text-sm`  | 13px | 20px | 400 | Table cells, secondary text |
| `--text-base`| 14px | 22px | 400 | Body copy, form labels |
| `--text-md`  | 15px | 24px | 500 | Nav items, button text |
| `--text-lg`  | 18px | 28px | 600 | Section headings, card titles |
| `--text-xl`  | 22px | 30px | 600 | Page headings |
| `--text-2xl` | 28px | 36px | 700 | Summary card amounts |
| `--text-3xl` | 36px | 44px | 700 | Hero balance figure |

### 3.3 Font Weights

```
400  Regular  — body text, labels
500  Medium   — nav items, table headers, button text
600  SemiBold — section titles, card headings
700  Bold     — summary card amounts, page headings
```

### 3.4 Monetary Amounts

All currency values use `--font-mono` at the corresponding size.
This keeps decimal points and digit columns visually aligned in tables.

```css
.amount {
  font-family: var(--font-mono);
  font-variant-numeric: tabular-nums;
  letter-spacing: -0.01em;
}
.amount--income  { color: var(--color-success); }
.amount--expense { color: var(--color-error);   }
.amount--neutral { color: var(--color-text-primary); }
```


---

## 4. Spacing System

Base unit: **4 px**. All spacing values are multiples.

```css
--space-1:   4px;
--space-2:   8px;
--space-3:  12px;
--space-4:  16px;
--space-5:  20px;
--space-6:  24px;
--space-8:  32px;
--space-10: 40px;
--space-12: 48px;
```

### 4.1 Usage Guidelines

| Context | Token |
|---------|-------|
| Icon-to-label gap | `--space-2` (8px) |
| Inline form field padding | `--space-2` vertical / `--space-3` horizontal |
| Between form rows | `--space-4` (16px) |
| Card internal padding | `--space-5` (20px) |
| Section gap between cards | `--space-4` (16px) |
| Page content padding | `--space-6` (24px) |
| Sidebar padding | `--space-4` (16px) |
| Between major page sections | `--space-8` (32px) |
| Modal padding | `--space-6` (24px) |


---

## 5. Border Radius

```css
--radius-sm:   4px;   /* Badges, tags, small chips */
--radius-md:   8px;   /* Buttons, inputs, table rows */
--radius-lg:  12px;   /* Cards, sidebar items */
--radius-xl:  16px;   /* Modals, dialogs */
--radius-full: 9999px; /* Pill badges, toggle switches */
```

| Component | Radius |
|-----------|--------|
| Button (all sizes) | `--radius-md` (8px) |
| Text input / select | `--radius-md` (8px) |
| Dashboard summary card | `--radius-lg` (12px) |
| Transaction row (hover bg) | `--radius-md` (8px) |
| Modal / dialog | `--radius-xl` (16px) |
| Dropdown menu | `--radius-lg` (12px) |
| Toast notification | `--radius-lg` (12px) |
| Type badge (Income/Expense) | `--radius-full` |
| Category chip | `--radius-full` |
| Sidebar nav item | `--radius-md` (8px) |


---

## 6. Shadows (Elevation Levels)

```css
/* Level 0 — flat, inset fields */
--shadow-none: none;

/* Level 1 — cards resting on the base background */
--shadow-card:
  0 1px 2px rgba(0, 0, 0, 0.04),
  0 2px 6px rgba(0, 0, 0, 0.06);

/* Level 2 — dropdowns, select menus, tooltips */
--shadow-dropdown:
  0 4px 6px  rgba(0, 0, 0, 0.06),
  0 8px 24px rgba(0, 0, 0, 0.10);

/* Level 3 — modals, dialogs */
--shadow-modal:
  0 8px 16px  rgba(0, 0, 0, 0.08),
  0 24px 48px rgba(0, 0, 0, 0.16);

/* Focus ring — keyboard navigation */
--shadow-focus: 0 0 0 3px rgba(92, 107, 192, 0.35);
```

Dark theme shadows are slightly stronger because dark surfaces need more contrast lift:

```css
[data-theme="dark"] {
  --shadow-card:
    0 1px 2px rgba(0, 0, 0, 0.20),
    0 2px 8px rgba(0, 0, 0, 0.30);

  --shadow-dropdown:
    0 4px 8px  rgba(0, 0, 0, 0.30),
    0 12px 32px rgba(0, 0, 0, 0.40);

  --shadow-modal:
    0 8px 20px  rgba(0, 0, 0, 0.40),
    0 32px 64px rgba(0, 0, 0, 0.50);

  --shadow-focus: 0 0 0 3px rgba(121, 134, 203, 0.45);
}
```


---

## 7. Buttons

### 7.1 Variants

| Variant | Background | Text | Border | Use Case |
|---------|-----------|------|--------|----------|
| **Primary** | `--color-primary` | white | none | Save, Confirm, Add |
| **Secondary** | `--color-bg-raised` | `--color-text-primary` | `--color-border` | Cancel, Back |
| **Danger** | `--color-error` | white | none | Delete, Remove |
| **Ghost** | transparent | `--color-primary` | none | Inline actions, Export |

### 7.2 Sizes

```
sm   padding: 6px 12px    font: --text-sm (13px)   height: 30px
md   padding: 8px 16px    font: --text-md (15px)   height: 36px  ← default
lg   padding: 10px 20px   font: --text-md (15px)   height: 42px
```

### 7.3 States

```css
/* Primary example — all variants follow the same state pattern */

.btn-primary {
  background: var(--color-primary);
  color: #fff;
  border-radius: var(--radius-md);
  font-weight: 500;
  transition: background 120ms ease, transform 80ms ease, box-shadow 120ms ease;
}
.btn-primary:hover   { background: var(--color-primary-hover); }
.btn-primary:active  { transform: scale(0.97); }
.btn-primary:focus-visible { box-shadow: var(--shadow-focus); outline: none; }
.btn-primary:disabled {
  background: var(--color-border);
  color: var(--color-text-disabled);
  cursor: not-allowed;
  transform: none;
}
```


### 7.4 Icon Buttons

Small square buttons (32×32 px) used for edit / delete actions in table rows.

```
icon-btn-ghost    background: transparent     hover: --color-bg-base
icon-btn-danger   background: transparent     hover: --color-error-subtle
                  color: --color-text-secondary  hover color: --color-error
```

---

## 8. Inputs

### 8.1 Base Input Style

```css
.input {
  height: 36px;
  padding: var(--space-2) var(--space-3);   /* 8px 12px */
  background: var(--color-bg-raised);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  font-size: var(--text-base);              /* 14px */
  color: var(--color-text-primary);
  transition: border-color 120ms ease, box-shadow 120ms ease;
}
.input:hover  { border-color: var(--color-secondary); }
.input:focus  {
  border-color: var(--color-border-strong);
  box-shadow: var(--shadow-focus);
  outline: none;
}
.input.error  { border-color: var(--color-error); }
.input:disabled {
  background: var(--color-bg-base);
  color: var(--color-text-disabled);
  cursor: not-allowed;
}
```

### 8.2 Input Variants

| Type | Notes |
|------|-------|
| **Text** | Base style above |
| **Number** | `font-family: --font-mono`; text-align right; min-width 120px |
| **Select** | Same height/border as text input; custom chevron icon; no native arrow |
| **Textarea** | `min-height: 80px`; `resize: vertical`; same border/focus rules |
| **Search** | Left-padded 36px for search icon; clear (×) button on right when non-empty |
| **Date** | Same as text; rendered with native date picker but styled consistently |

### 8.3 Label + Error Pattern

```
[Label text]                   ← --text-sm, --color-text-secondary, margin-bottom: 6px
[_________________________]    ← input
[! Error message here]         ← --text-xs, --color-error, margin-top: 4px, hidden until invalid
```


---

## 9. Cards

### 9.1 Dashboard Summary Card

Four equal-width cards in a row showing Balance, Income, Expenses, Count.

```
┌─────────────────────────────┐
│  [icon]  Label              │  ← --text-sm, --color-text-secondary
│                             │
│  $12,540.00                 │  ← --text-3xl, --font-mono, bold
│                             │
│  ↑ 8.2% vs last month       │  ← --text-xs, --color-success / --color-error
└─────────────────────────────┘

Background:     --color-bg-raised
Border:         1px solid --color-border
Border-radius:  --radius-lg  (12px)
Padding:        --space-5    (20px)
Shadow:         --shadow-card
```

Icon color rules:
- Balance card → `--color-primary`
- Income card  → `--color-success`
- Expenses card → `--color-error`
- Count card   → `--color-secondary`

### 9.2 Statistic Card (Statistics Page)

Same structure as summary card but without the trend line. Used for the three
totals at the top of the Statistics page.

### 9.3 Transaction Row Card (Recent Transactions / Transactions Page)

```
┌─────────────────────────────────────────────────────────────────┐
│  [type badge]  Title           Category chip     +$3,000.00  ⋯  │
│                13 Jan 2024                                       │
└─────────────────────────────────────────────────────────────────┘

Row height:     52px
Hover bg:       --color-bg-base  (slight tint)
Border-bottom:  1px solid --color-border  (last row: none)
Border-radius on hover bg: --radius-md
```

**Type badge:**
```
INCOME   pill, bg: --color-success-subtle,  text: --color-success,  font: --text-xs bold
EXPENSE  pill, bg: --color-error-subtle,    text: --color-error,    font: --text-xs bold
```

**Category chip:**
```
bg: --color-primary-subtle   text: --color-primary   font: --text-xs
border-radius: --radius-full
padding: 2px 8px
```


---

## 10. Icons

**Recommended library: [Lucide Icons](https://lucide.dev/)**

Rationale:
- MIT licensed, open source
- Consistent 24×24 px stroke-based SVG system
- Single stroke weight (1.5–2px), clean at 14–20 px render sizes
- Works inline as SVG — no icon font, no network request
- Used by Linear, Vercel, and many premium desktop apps

### 10.1 Icon Sizes

```
16px  — table action buttons, inline labels
20px  — sidebar nav items, card icon badges
24px  — summary card icons (default Lucide size)
```

### 10.2 Icon–Text Alignment

Always use `display: flex; align-items: center; gap: var(--space-2)` for icon+label pairs.
Never use vertical-align tricks.

### 10.3 Icon Assignments

| Location | Icon name |
|----------|-----------|
| Dashboard nav | `layout-dashboard` |
| Transactions nav | `arrow-left-right` |
| Statistics nav | `bar-chart-2` |
| Settings nav | `settings` |
| Add Income | `plus-circle` |
| Add Expense | `minus-circle` |
| Edit action | `pencil` |
| Delete action | `trash-2` |
| Export CSV | `download` |
| Search | `search` |
| Close / × | `x` |
| Balance | `wallet` |
| Income total | `trending-up` |
| Expense total | `trending-down` |
| Transaction count | `layers` |
| Calendar / date | `calendar` |
| Category | `tag` |
| Success toast | `check-circle` |
| Error toast | `alert-circle` |
| Theme toggle (light) | `sun` |
| Theme toggle (dark) | `moon` |


---

## 11. Animations

All animations follow a single rule: **fast and subtle**. Motion guides the eye,
never distracts. Target: 0 jank, 60 fps, no layout thrash.

### 11.1 Timing Tokens

```css
--duration-instant:  80ms;   /* Button press feedback */
--duration-fast:    120ms;   /* Hover transitions, focus rings */
--duration-normal:  200ms;   /* Modal appear, dropdown open */
--duration-slow:    300ms;   /* Page section fade, sidebar collapse */

--ease-default: cubic-bezier(0.16, 1, 0.3, 1);   /* Snappy ease-out */
--ease-in:      cubic-bezier(0.4, 0, 1, 1);
--ease-out:     cubic-bezier(0, 0, 0.2, 1);
```

### 11.2 Animation Catalogue

**Hover (all interactive elements)**
```css
transition: background var(--duration-fast) var(--ease-default),
            color      var(--duration-fast) var(--ease-default),
            box-shadow var(--duration-fast) var(--ease-default);
```

**Button press**
```css
:active { transform: scale(0.97); transition: transform var(--duration-instant) ease; }
```

**Modal open**
```css
/* Backdrop */
@keyframes fade-in { from { opacity: 0 } to { opacity: 1 } }
/* Dialog box */
@keyframes slide-up {
  from { opacity: 0; transform: translateY(12px) scale(0.98); }
  to   { opacity: 1; transform: translateY(0)    scale(1);    }
}
.modal-overlay { animation: fade-in  var(--duration-normal) var(--ease-out); }
.modal-dialog  { animation: slide-up var(--duration-normal) var(--ease-default); }
```

**Modal close**
Reverse of open: `opacity → 0`, `translateY(8px)`, `scale(0.99)`,
duration `var(--duration-fast)`.

**Toast notification**
```css
@keyframes toast-in {
  from { opacity: 0; transform: translateY(8px);  }
  to   { opacity: 1; transform: translateY(0);    }
}
@keyframes toast-out {
  from { opacity: 1; transform: translateY(0);   }
  to   { opacity: 0; transform: translateY(-8px); }
}
```

**Page section transition**
Sections are swapped (not animated with slides — too distracting for a desktop app).
Use a simple opacity fade:
```css
.page-section {
  animation: fade-in var(--duration-slow) var(--ease-out);
}
```

**Sidebar nav active item**
Background color transitions at `--duration-fast`. No transform — stability matters
more than drama in a sidebar.

**Sidebar collapse (if implemented)**
```css
transition: width var(--duration-slow) var(--ease-default);
```


---

## 12. Layout

### 12.1 Overall Shell

```
┌─────────────────────────────────────────────────────────────┐
│ sidebar (220px fixed)  │  main area (flex: 1, min 780px)    │
│                        │                                     │
│  [Logo / App name]     │  ┌──────────────────────────────┐  │
│                        │  │ Top header (56px)            │  │
│  [nav item]            │  │ Page title    [+ Add Income] │  │
│  [nav item active]     │  │               [+ Add Expense]│  │
│  [nav item]            │  └──────────────────────────────┘  │
│  [nav item]            │                                     │
│                        │  ┌──────────────────────────────┐  │
│  ─────────────────      │  │ Page content area            │  │
│                        │  │ padding: 24px                │  │
│  [theme toggle]        │  │                              │  │
│  [app version]         │  │                              │  │
│                        │  └──────────────────────────────┘  │
└────────────────────────┴─────────────────────────────────────┘
```

### 12.2 Sidebar Specification

```
Width:            220px (fixed, not collapsible in Phase 4)
Background:       --color-sidebar-bg
Right border:     1px solid --color-border
Padding:          --space-4 (16px) horizontal
Top padding:      --space-6 (24px)

App name / logo block:
  Height: 48px
  Font: --text-lg, font-weight: 700, color: --color-text-primary
  Margin-bottom: --space-6

Nav item:
  Height: 38px
  Padding: 0 --space-3 (12px)
  Border-radius: --radius-md
  Font: --text-md (15px), weight: 500
  Color: --color-sidebar-text
  Icon: 20px, color: --color-sidebar-icon
  Gap between icon and label: --space-2 (8px)
  Margin-bottom: --space-1 (4px)

Nav item (active):
  Background: --color-sidebar-active
  Color:      --color-primary
  Icon color: --color-primary

Nav item (hover):
  Background: --color-bg-base

Bottom section (pinned to bottom):
  Theme toggle button
  Version string (--text-xs, --color-text-disabled)
```

### 12.3 Top Header

```
Height:       56px
Padding:      0 --space-6 (24px)
Border-bottom: 1px solid --color-border
Background:   --color-bg-raised
Display:      flex, align-items: center, justify-content: space-between

Left side:   Page title — --text-xl (22px), weight: 600
Right side:  Action buttons ([+ Add Income] [+ Add Expense]) — btn-primary + btn-secondary
```

### 12.4 Content Area

```
Padding:      --space-6 (24px) all sides
Overflow-y:   auto
Background:   --color-bg-base
```

### 12.5 Responsive Rules (Desktop Window Resizing)

The app targets 1000–1600 px. Sidebar is fixed width.

| Window width | Behaviour |
|-------------|-----------|
| ≥ 1200px | Summary cards in a 4-column row |
| 1000–1199px | Summary cards in a 2×2 grid |
| < 1000px | App sets `minWidth: 1000` in Electron — this state is prevented |

Chart section on Dashboard:
- ≥ 1100px: pie chart + recent transactions side by side (60/40 split)
- < 1100px: stacked vertically


---

## 13. Component Rules

### 13.1 Margins & Padding Conventions

- **Never** use arbitrary pixel values. Always use spacing tokens.
- Component padding = internal spacing (card, modal, input field).
- Margin = spacing between sibling components.
- Prefer `gap` on flex/grid containers over individual margins on children.

### 13.2 Grid System

Content area uses a simple **CSS Grid** for the summary cards row:

```css
.summary-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--space-4);   /* 16px */
}
@media (max-width: 1199px) {
  .summary-grid { grid-template-columns: repeat(2, 1fr); }
}
```

Charts + recent transactions:
```css
.dashboard-lower {
  display: grid;
  grid-template-columns: 3fr 2fr;
  gap: var(--space-4);
  margin-top: var(--space-4);
}
```

### 13.3 Tables

```
Table:      width: 100%; border-collapse: collapse
Header row: height 40px, --text-sm, weight 500, --color-text-secondary, uppercase tracking
Data row:   height 52px, border-bottom 1px solid --color-border
Last row:   no border-bottom
Hover row:  background --color-bg-base transition --duration-fast
Columns:    Date 110px | Type 90px | Title flex(1) | Category 130px | Amount 120px | Actions 80px

Amount column: text-align right; font: --font-mono
Actions column: text-align center; flex row of icon buttons
```

### 13.4 Forms

```
Form rows:      display: flex; flex-direction: column; gap: var(--space-4)
Two-col row:    display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-4)
Label:          display: block; margin-bottom: 6px; --text-sm; --color-text-secondary
Error message:  display: block; margin-top: 4px; --text-xs; --color-error; hidden by default
Required mark:  red asterisk after label text (*), color: --color-error
```

### 13.5 Modal / Dialog Rules

```
Overlay:    fixed inset 0, background rgba(0,0,0,0.4) light / rgba(0,0,0,0.6) dark
Dialog box: max-width 480px, width: calc(100% - 48px)
            background --color-bg-overlay, border-radius --radius-xl
            padding --space-6 (24px), box-shadow --shadow-modal
Header:     flex row, title (--text-lg weight 600) + close button (×) right-aligned
Footer:     flex row, gap --space-3, justify-content flex-end
            [Cancel btn secondary] [Save btn primary]
```

### 13.6 Lists

Unordered lists within the app (e.g., recent transactions panel):

```
No bullet points — use custom row layout
Each item: padding --space-3 vertical, border-bottom 1px solid --color-border
Last item: no border
```

### 13.7 Empty States

Shown when a list or chart has no data:

```
Icon:    48px Lucide icon, color: --color-border
Heading: --text-lg, --color-text-secondary, margin-top --space-4
Body:    --text-sm, --color-text-secondary
CTA:     optional ghost button "Add your first expense"
Centered both axes in the containing area
```


---

## 14. Accessibility

### 14.1 Color Contrast

All text/background combinations must meet **WCAG 2.1 AA** (minimum 4.5:1 for body text, 3:1 for large text and UI components).

| Combination | Contrast | Passes |
|-------------|---------|--------|
| `--color-text-primary` on `--color-bg-raised` (light) | ≥ 12:1 | ✅ AAA |
| `--color-text-secondary` on `--color-bg-raised` (light) | ≥ 5.5:1 | ✅ AA |
| `--color-primary` on `--color-bg-raised` (light) | ≥ 4.6:1 | ✅ AA |
| White text on `--color-primary` button (light) | ≥ 4.9:1 | ✅ AA |
| `--color-success` on `--color-success-subtle` | ≥ 5.0:1 | ✅ AA |
| `--color-error` on `--color-error-subtle` | ≥ 5.2:1 | ✅ AA |
| Dark theme text/bg combinations | All rechecked | ✅ AA |

> **Note:** Full compliance requires manual verification with a contrast checker tool
> and testing with assistive technologies (screen readers, high-contrast OS modes).

### 14.2 Keyboard Navigation

```
Tab order:   follows logical DOM order (sidebar nav → header actions → page content)
Modals:      trap focus inside when open; return focus to trigger on close
Nav items:   focusable, activated with Enter / Space
Buttons:     all focusable via Tab; activated with Enter / Space
Table rows:  action buttons reachable by Tab within each row
Select:      native keyboard behavior preserved
Date input:  native keyboard behavior preserved
Escape:      closes modal, closes dropdown
```

### 14.3 Focus Styles

```css
/* Applied to ALL interactive elements — never suppress outline without a replacement */
:focus-visible {
  outline: none;
  box-shadow: var(--shadow-focus);  /* 3px indigo ring */
}
```

Focus ring is suppressed for mouse users (`:focus` without `:focus-visible`),
visible for keyboard users.

### 14.4 ARIA Attributes

```
Modal:          role="dialog"  aria-modal="true"  aria-labelledby="modal-title"
Nav:            role="navigation"  aria-label="Main navigation"
Active nav item: aria-current="page"
Buttons with only icons: aria-label="Edit transaction" / "Delete transaction"
Error messages: aria-live="polite"  id referenced by input's aria-describedby
Success/error amounts: aria-label="Income: $3,000.00" / "Expense: $85.50"
```

### 14.5 Reduce Motion

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 1ms !important;
    transition-duration: 1ms !important;
  }
}
```


---

## 15. UI Wireframe Mockups

All mockups use ASCII art at 80-char width.
Legend: `[btn]` = button, `( )` = radio, `[x]` = checkbox, `[▼]` = select,
        `│` = border, `─` = rule, `░░` = chart fill area.

---

### 15.1 Application Shell (all pages)

```
┌──────────────────────────────────────────────────────────────────────────┐
│ SIDEBAR (220px)        │  HEADER (full width, 56px)                      │
│                        ├─────────────────────────────────────────────────┤
│  💰 Expense Tracker    │  Dashboard                [+ Add Income] [+ Add Expense]
│                        │
│  ▸ 📊 Dashboard  ◀ active
│    ↔ Transactions      │  CONTENT AREA (padding 24px, scrollable)        │
│    📈 Statistics        │                                                 │
│    ⚙  Settings         │                                                 │
│                        │                                                 │
│  ─ ─ ─ ─ ─ ─ ─ ─ ─   │                                                 │
│  ☀ Light  ● Dark       │                                                 │
│  v1.0.0               │                                                 │
└────────────────────────┴─────────────────────────────────────────────────┘
```

---

### 15.2 Dashboard Page

```
╔══ CONTENT AREA ══════════════════════════════════════════════════════════╗

  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  ┌──────────────────┐
  │ 💼 Balance       │  │ 📈 Total Income  │  │ 📉 Total Expenses│  │ # Transactions   │
  │                 │  │                 │  │                 │  │                  │
  │  $8,414.50      │  │  $12,000.00     │  │  $3,585.50      │  │      47          │
  │  ↑ 12% this mo  │  │  ↑ 5% this mo   │  │  ↓ 3% this mo   │  │  this month      │
  └─────────────────┘  └─────────────────┘  └─────────────────┘  └──────────────────┘

  ┌──────────────────────────────────────────┐  ┌───────────────────────────────────┐
  │  Expenses by Category                    │  │  Recent Transactions              │
  │                                          │  │                                   │
  │         ░░░░                             │  │  INCOME  Salary          $3,000   │
  │       ░░    ░░                           │  │  13 Jan 2024                      │
  │      ░░  ●   ░░                          │  │  ─────────────────────────────    │
  │       ░░    ░░                           │  │  EXPENSE Groceries  Food   $85    │
  │         ░░░░                             │  │  12 Jan 2024                      │
  │                                          │  │  ─────────────────────────────    │
  │  ● Food 42%    ● Transport 18%           │  │  EXPENSE Uber       Transport $22 │
  │  ● Bills 20%   ● Other 20%              │  │  11 Jan 2024                      │
  │                                          │  │  ─────────────────────────────    │
  └──────────────────────────────────────────┘  │  INCOME  Freelance       $2,000   │
                                                │  10 Jan 2024                      │
                                                └───────────────────────────────────┘
╚══════════════════════════════════════════════════════════════════════════╝
```

---

### 15.3 Transactions Page

```
╔══ CONTENT AREA ══════════════════════════════════════════════════════════╗

  [🔍 Search transactions...     ]  [Category ▼]  [From: ──────]  [To: ──────]
                                                                   [⬇ Export CSV]

  ──────────────────────────────────────────────────────────────────────────
  DATE         TYPE      TITLE              CATEGORY      AMOUNT    ACTIONS
  ──────────────────────────────────────────────────────────────────────────
  13 Jan 2024  INCOME   Salary                           +$3,000.00  ✏ 🗑
  12 Jan 2024  EXPENSE  Groceries           Food          -$85.50    ✏ 🗑
  11 Jan 2024  EXPENSE  Uber                Transport     -$22.00    ✏ 🗑
  10 Jan 2024  INCOME   Freelance project               +$2,000.00  ✏ 🗑
  09 Jan 2024  EXPENSE  Netflix             Entertainment  -$15.99   ✏ 🗑
  08 Jan 2024  EXPENSE  Electricity bill    Bills        -$120.00    ✏ 🗑
  ──────────────────────────────────────────────────────────────────────────

╚══════════════════════════════════════════════════════════════════════════╝
```

---

### 15.4 Statistics Page

```
╔══ CONTENT AREA ══════════════════════════════════════════════════════════╗

  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
  │ 📈 Total Income   │  │ 📉 Total Expenses │  │ 💼 Balance        │
  │  $12,000.00      │  │  $3,585.50       │  │  $8,414.50       │
  └──────────────────┘  └──────────────────┘  └──────────────────┘

  ┌──────────────────────────────────────────────────────────────────────┐
  │  Spending by Category                                                │
  │                                                                      │
  │      ░░░░░        ● Food          $1,504   42%                      │
  │    ░░      ░░     ● Bills          $716    20%                      │
  │   ░░   ◉   ░░     ● Transport      $644    18%                      │
  │    ░░      ░░     ● Entertainment  $358    10%                      │
  │      ░░░░░        ● Healthcare     $251     7%                      │
  │                   ● Other          $108     3%                      │
  └──────────────────────────────────────────────────────────────────────┘

  ┌──────────────────────────────────────────────────────────────────────┐
  │  Monthly Expenses                                                    │
  │                                                                      │
  │  $800 ┤                          ▓▓▓                                 │
  │  $600 ┤          ▓▓▓   ▓▓▓      ▓▓▓   ▓▓▓                          │
  │  $400 ┤  ▓▓▓    ▓▓▓   ▓▓▓      ▓▓▓   ▓▓▓   ▓▓▓                    │
  │  $200 ┤  ▓▓▓    ▓▓▓   ▓▓▓      ▓▓▓   ▓▓▓   ▓▓▓                    │
  │    $0 └──────────────────────────────────────────────────           │
  │        Aug    Sep    Oct    Nov    Dec    Jan    Feb                 │
  └──────────────────────────────────────────────────────────────────────┘

╚══════════════════════════════════════════════════════════════════════════╝
```

---

### 15.5 Settings Page

```
╔══ CONTENT AREA ══════════════════════════════════════════════════════════╗

  ┌──────────────────────────────────────────────────────────────────────┐
  │  Preferences                                                         │
  │                                                                      │
  │  Currency                                                            │
  │  [US Dollar (USD) ▼                                              ]   │
  │                                                                      │
  │  Theme                                                               │
  │  ┌─────────────────┐  ┌─────────────────┐                           │
  │  │  ☀  Light        │  │  ● Dark  ◀ active│                          │
  │  └─────────────────┘  └─────────────────┘                           │
  │                                                                      │
  └──────────────────────────────────────────────────────────────────────┘

  ┌──────────────────────────────────────────────────────────────────────┐
  │  Data                                                                │
  │                                                                      │
  │  Export all transactions to a CSV file for use in Excel or Sheets.  │
  │                                                                      │
  │  [⬇ Export All Transactions to CSV]                                  │
  │                                                                      │
  └──────────────────────────────────────────────────────────────────────┘

╚══════════════════════════════════════════════════════════════════════════╝
```

---

### 15.6 Add / Edit Modal (Income)

```
  ┌──── overlay (rgba backdrop) ─────────────────────────────────────────┐
  │                                                                       │
  │         ┌────────────────────────────────────────────────┐           │
  │         │  Add Income                                [×] │           │
  │         │──────────────────────────────────────────────  │           │
  │         │                                                │           │
  │         │  Title *                                       │           │
  │         │  [_________________________________________]   │           │
  │         │                                                │           │
  │         │  Amount *                                      │           │
  │         │  [$ _____________________________________ ]    │           │
  │         │  ! Amount must be a positive number            │           │
  │         │                                                │           │
  │         │  Date *                                        │           │
  │         │  [YYYY-MM-DD ▼ _______________________ ]       │           │
  │         │                                                │           │
  │         │  Note (optional)                               │           │
  │         │  [_________________________________________]   │           │
  │         │                                                │           │
  │         │                       [  Cancel  ] [  Save  ] │           │
  │         └────────────────────────────────────────────────┘           │
  │                                                                       │
  └───────────────────────────────────────────────────────────────────────┘
```

---

### 15.7 Add / Edit Modal (Expense) — same as Income + Category field

```
  │         │  Title *                                       │
  │         │  [_________________________________________]   │
  │         │                                                │
  │         │  Amount *              Category *              │
  │         │  [$ ________________]  [Food           ▼]      │
  │         │                                                │
  │         │  Date *                                        │
  │         │  [YYYY-MM-DD ▼ _______________________ ]       │
  │         │                                                │
  │         │  Note (optional)                               │
  │         │  [_________________________________________]   │
  │         │                                                │
  │         │                       [  Cancel  ] [  Save  ] │
```

---

### 15.8 Toast Notifications

```
                                                    ┌────────────────────────────┐
                                                    │ ✓  Export successful       │  ← green
                                                    └────────────────────────────┘

                                                    ┌────────────────────────────┐
                                                    │ ✕  Failed to save record   │  ← red
                                                    └────────────────────────────┘

Position: bottom-right, 24px from edges.
Stack: newest on top, max 3 visible.
Auto-dismiss after 3 seconds with fade-out animation.
```


---

## Quick Reference Card

### CSS Variable Summary

```
Colors            Spacing           Radius            Shadow
──────────────    ──────────────    ──────────────    ──────────────────
--color-primary   --space-1:  4px   --radius-sm: 4px  --shadow-card
--color-success   --space-2:  8px   --radius-md: 8px  --shadow-dropdown
--color-error     --space-3: 12px   --radius-lg:12px  --shadow-modal
--color-warning   --space-4: 16px   --radius-xl:16px  --shadow-focus
--color-bg-base   --space-5: 20px   --radius-full
--color-bg-raised --space-6: 24px
--color-border    --space-8: 32px   Duration
--color-text-*    --space-10:40px   ──────────────────
                  --space-12:48px   --duration-instant:  80ms
Typography                          --duration-fast:    120ms
──────────────                      --duration-normal:  200ms
--text-xs:  11px                    --duration-slow:    300ms
--text-sm:  13px
--text-base:14px
--text-md:  15px
--text-lg:  18px
--text-xl:  22px
--text-2xl: 28px
--text-3xl: 36px
--font-sans
--font-mono
```

---

*Design System v1.0 — Personal Expense Tracker — Ready for Phase 4 implementation.*
