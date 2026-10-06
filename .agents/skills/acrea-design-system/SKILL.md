---
name: acrea-design-system
description: >-
  Permanent authority on design tokens, visual primitives, typography, color palettes,
  and component standards for the Acrea Farmers Production Tracking Platform. Enforces
  deep forest green surfaces (#164230), warm parchment canvas (#F9F6F0), crisp white cards,
  restrained hairline borders (#ECE7DC), organic agricultural accents, and clean modern typography.
---

# Acrea Design System — Agricultural Precision & Calm Workspaces

This skill is the permanent authority on the Acrea visual language and design tokens. It guarantees end-to-end visual coherence across all modules (Farmer, Farms & Plots, Crop Production, Livestock, Activities, Production Records, Analytics, Settings).

---

## 1. Core Philosophy: Calm, Practical Agricultural Workspace

Acrea is designed around **the way farms actually work**:
- **Calm & Grounded**: High readability in varied lighting conditions (including outdoor sunlight on tablets/laptops) using warm parchment canvas rather than harsh clinical stark white or dark sci-fi themes.
- **Agricultural Harmony**: Rich deep evergreen forests (`#164230`), earthy moss greens (`#3E7B52`), warm parchment canvas (`#F9F6F0`), and harvest golds (`#D97706`).
- **Tactile Structure**: Crisp white cards (`#FFFFFF`) with warm hairline borders (`#ECE7DC`) and generous 16px–24px padding.
- **Anti-Slop Guarantee**: Zero generic flashy gradients, zero gimmicky neon buttons, zero decorative AI sparkles or robotic badges. Every pixel serves agricultural clarity and productivity.

---

## 2. Design Tokens Specification

### Colors Palette

#### Primary Surfaces & Shell
| Token | Hex Value | Semantic Role |
| :--- | :--- | :--- |
| `--color-sidebar-bg` | `#164230` | Deep forest green sidebar shell |
| `--color-sidebar-hover` | `rgba(255, 255, 255, 0.08)` | Sidebar nav item hover state |
| `--color-sidebar-active-bg` | `#FFFFFF` | Active sidebar navigation item pill |
| `--color-sidebar-active-text` | `#164230` | Text color for active sidebar pill |
| `--color-sidebar-text` | `rgba(255, 255, 255, 0.72)` | Inactive sidebar navigation item text |
| `--color-sidebar-badge-bg` | `rgba(255, 255, 255, 0.12)` | Subtle container in sidebar (e.g., season widget) |
| `--color-canvas-bg` | `#F9F6F0` | Warm parchment main page background |
| `--color-surface-card` | `#FFFFFF` | Crisp white cards, modals, popovers, dropdowns |
| `--color-surface-subtle` | `#F4EFE6` | Secondary input background, tab background, table headers |

#### Brand & Action Greens
| Token | Hex Value | Semantic Role |
| :--- | :--- | :--- |
| `--color-brand-primary` | `#3E7B52` | Primary buttons, active checkmarks, progress bars |
| `--color-brand-hover` | `#336844` | Hover state for primary buttons |
| `--color-brand-active` | `#285336` | Active/pressed state for primary buttons |
| `--color-brand-tint` | `#EAF4ED` | Soft green badge background, active card fill |
| `--color-brand-border` | `#C8E2D0` | Subtle active borders, selected card outline |

#### Agricultural Accents & Functional Colors
| Token | Hex Value | Semantic Role |
| :--- | :--- | :--- |
| `--color-accent-amber` | `#D97706` | Animal production indicator, warnings, upcoming dues |
| `--color-accent-amber-bg`| `#FEF3C7` | Soft yellow/amber badge and icon background |
| `--color-accent-teal` | `#0D9488` | Metric highlights, secondary agricultural indicators |
| `--color-accent-teal-bg` | `#E6F6F4` | Soft teal badge and icon background |
| `--color-accent-success` | `#2E7D32` | Completed stages, on-track indicators |
| `--color-accent-success-bg`| `#E8F5E9` | Completed badge background |

#### Inks (Typography)
| Token | Hex Value | Semantic Role |
| :--- | :--- | :--- |
| `--color-text-primary` | `#19201C` | High-contrast headings, card titles, key metric numbers |
| `--color-text-secondary` | `#4B5752` | Body copy, descriptions, input field text |
| `--color-text-muted` | `#788680` | Subtitles, timestamps, breadcrumbs, unit labels |
| `--color-text-faint` | `#A4B0AA` | Input placeholders, inactive indicators |
| `--color-border-subtle` | `#ECE7DC` | Warm hairline card borders, dividers, table lines |
| `--color-border-input` | `#DFD8CA` | Form input borders and search boundaries |

---

## 3. Typography Hierarchy

Use modern, clean sans-serif typography (`Inter`, `Plus Jakarta Sans`, or `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`).

| Level | Size | Weight | Line Height | Tracking | Usage |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Hero Title** | `2.25rem` (36px) | 700 Bold | 1.2 | `-0.025em` | Auth banner headline ("From data to a thriving farm.") |
| **Page Title** | `1.75rem` (28px) | 700 Bold | 1.25 | `-0.02em` | Main view header ("Dashboard", "Farms & Plots") |
| **Section Title** | `1.25rem` (20px) | 600 SemiBold| 1.35 | `-0.01em` | Section headers ("Plots", "Good morning, Joyce") |
| **Metric Value** | `1.75rem` (28px) | 700 Bold | 1.1 | `-0.02em` | Metric numbers ("12.8 t", "4", "8.7 ha") |
| **Card Header** | `1.0rem` (16px) | 600 SemiBold| 1.4 | `-0.005em` | Plot names ("Plot A — Maize"), card titles |
| **Body / Inputs** | `0.9375rem` (15px)| 400 Regular | 1.5 | `normal` | Form inputs, descriptions, table body |
| **Label / Subtext**| `0.8125rem` (13px)| 500 Medium | 1.45 | `+0.005em` | Meta details, stage tags, table headers |
| **Caption / Badge**| `0.75rem` (12px) | 600 SemiBold| 1.3 | `+0.02em` | Status chips ("Vegetative growth", "Active") |

---

## 4. Layout Architecture & Surface Rules

### A. Split-Screen Auth (Login & Registration)
- **Left Column (50% desktop)**: Full-bleed serene agricultural landscape photo with dark evergreen gradient overlay (`linear-gradient(180deg, rgba(19,62,43,0.75) 0%, rgba(19,62,43,0.92) 100%)`).
  - Acrea logo at top-left.
  - Headline and tagline centered vertically.
  - White pill tags + farmer testimonial/avatar pill (`JM`, `KO`, `AN` "Built around the way farms actually work") pinned at the bottom.
- **Right Column (50% desktop)**: Warm parchment canvas `#FBF9F4`.
  - Top bar with security badge ("Secure farmer access") and language switcher.
  - Focused form centered with `max-width: 440px`.
  - Bottom legal terms footer.

### B. Application Shell (Authenticated App)
- **Sidebar**: Fixed width `240px` (or collapsible on mobile/tablet). Deep forest background `#164230`.
  - Logo at top (`Acrea` mark + brand text).
  - Navigation links:
    1. Dashboard
    2. Farms & Plots
    3. Crop Production
    4. Livestock
    5. Activities
    6. Production
    7. Reports
    8. Settings
  - Active item indicator: Clean white pill (`#FFFFFF`) with dark green text (`#164230`) and a subtle right green indicator bar (`width: 3px`).
  - Bottom Season Widget: Semi-transparent container with badge `CURRENT SEASON`, title `2026 Main Season`, status `4 cycles in progress`.
  - Bottom Support link with icon: `Help & support`.
- **Top Navigation Bar**:
  - Sticky top header on warm parchment canvas.
  - Left: Page title and contextual metadata (e.g., date and farm name: `Tuesday, 2 October · Green Acres Farm`).
  - Right:
    - Global Search Bar (`Search Acrea ⌘ K` / `Ctrl+K`) with icon.
    - Notification bell button with dot indicator.
    - User Profile Pill with initials avatar badge (`JM`), name (`Joyce M.`), farm name (`Green Acres Farm`), and chevron down.
- **Main Workspace Canvas**:
  - Max container width or fluid with `padding: 24px 32px`.
  - Background: Warm parchment `#F9F6F0`.

---

## 5. Component Primitives Standards

### 1. Stat / Metric Cards
- White background (`#FFFFFF`), `1px solid #ECE7DC`, border-radius `16px`.
- Top row: Metric label on left (`Active crop cycles`), rounded icon badge on right with soft background tint (`#EAF4ED` or `#FEF3C7`).
- Middle: Large stat value (`4`, `12.8 t`).
- Bottom: Contextual trend or sub-detail (`3 on schedule · 1 due soon`, `+8.4% this season`).

### 2. Plot Cards & Crop Cards
- White background, `1px solid #ECE7DC`, border-radius `16px`, padding `20px`.
- Top: Circular icon badge (crop type), Stage badge (e.g., `Vegetative growth` in soft green pill), kebab menu `...`.
- Title: Plot code + Crop (`Plot A — Maize`).
- Area: Cultivated acreage (`2.5 ha cultivated area`).
- Progress: "Cycle progress" label + percentage (`62%`), followed by a thin, smooth progress bar (`height: 6px`, background `#ECE7DC`, fill `#3E7B52`, rounded `999px`).
- Footer: Left: `Updated today`, Right: `View details →` hover action link.

### 3. Status Badges & Pills
- `Vegetative growth` / `Active`: bg `#EAF4ED`, text `#2A6740`, border `1px solid #CDE2D4`.
- `Flowering` / `Maturing`: bg `#F2EFE9`, text `#3D4944`, border `1px solid #DFD9CE`.
- `Planting` / `Due soon`: bg `#FEF3C7`, text `#92400E`, border `1px solid #FDE68A`.
- `Completed`: bg `#F1F5F9`, text `#475569`, border `1px solid #E2E8F0`.

### 4. Interactive Buttons
- **Primary Action**: Solid background `#3E7B52`, text `#FFFFFF`, rounded `10px`, hover `#336844`, active `#285336`, transition `150ms ease-out`.
- **Secondary / Filter**: Background `#FFFFFF`, border `1px solid #DFD8CA`, text `#2D3934`, hover `bg #F6F2EA`.
- **Add Action**: `+ Record production`, `+ Add Farm`, `+ Add Plot`, `+ New Production Cycle` in solid primary green.

### 5. Input Fields
- Background `#FFFFFF`, border `1px solid #DFD8CA`, border-radius `10px`, padding `10px 14px`.
- Left-aligned icon adornment in muted ink (`#788680`).
- Focus state: border `1.5px solid #3E7B52`, subtle box-shadow `0 0 0 3px rgba(62, 123, 82, 0.15)`.

---

## 6. Execution Rules
1. **Never use generic blue or purple primary buttons**: Acrea is built with organic moss green `#3E7B52` and forest green `#164230`.
2. **Never use pure stark white (#FFFFFF) for the page background**: The entire application uses warm parchment canvas `#F9F6F0`. White is reserved for elevated cards, inputs, and active navigation pills.
3. **Always preserve the Acrea split-screen auth design**: Auth views (Login & Register) must feature the heroic green agricultural photo banner on the left and calm form canvas on the right.
4. **All production cycles and plots must have cycle progress indicators**: Use percentage + thin green bar.
