---
name: acrea-ui-ux-design
description: >-
  Permanent authority on screen architectures, layout compositions, interaction flows,
  and tactile agricultural UI patterns for Acrea. Dictates exact screen-by-screen structures
  for Login, Farmer Registration, Farmer Dashboard, Farms & Plots, Crop Production Cycles,
  Livestock, Activities, Production Records, and Reports.
---

# Acrea UI/UX Design Specification & Screen Architecture

This skill defines the exact interaction patterns and layout hierarchy for every screen in the Acrea Farmers Production Tracking Platform.

---

## 1. Screen Archetypes

Acrea uses two primary layout archetypes:
1. **Split-Screen Authentication Shell**:
   - 50/50 split on desktop.
   - Left side: Full-height atmospheric farm photo with deep evergreen tint overlay, logo, hero message, social proof avatars.
   - Right side: Warm parchment surface (`#FBF9F4`), calm centered forms, clear micro-interactions.
2. **Authenticated App Shell**:
   - Left persistent sidebar: `#164230` evergreen column with white active pill navigation.
   - Top contextual header: Page title, date/farm subtitle, global search (`⌘K`), notifications, profile chip.
   - Main content canvas: `#F9F6F0` warm parchment with 24px grid gaps, responsive cards, and clean typography.

---

## 2. Screen Specifications

### Screen 1: Login (`/login`)
- **Left Hero Area**:
  - Logo: Acrea logo with curved green & gold field mark.
  - Heading: "From data to a thriving farm." (700 bold, ~36px, white).
  - Subtext: "Acrea brings crop cycles, animal groups, daily activities and production records into one calm, practical workspace."
  - Feature tags: Pill buttons with agricultural icons.
  - Social Proof (Bottom): Avatar stack (`JM`, `KO`, `AN`) with text "Built around the way farms actually work."
- **Right Auth Canvas**:
  - Top helper bar: "Secure farmer access" (left) and Language switcher with globe icon ("English") (right).
  - Main Heading: "Welcome back" (700 bold, ~28px).
  - Subtitle: "Sign in to continue tracking your farm's work and production."
  - Form Fields:
    - Email or phone number: Prefix user icon (`joyce@example.com`).
    - Password: Prefix lock icon (`••••••••`).
    - Forgot password? link (right-aligned, muted green hover).
  - Primary Button: "Sign in" (Solid moss green `#3E7B52`, rounded-xl, 100% width).
  - Divider: Subtle hairline with "New to Acrea?" label.
  - Secondary Action: "Create farmer account" (Outline/ghost button, rounded-xl, green text).
  - Legal text: "By continuing, you agree to Acrea's Terms of Use and Privacy Policy."

### Screen 2: Farmer Registration (`/register`)
- **Left Hero Area**: Identical to Login for brand stability.
- **Right Auth Canvas**:
  - Top header: Eyebrow "CREATE YOUR ACREA ACCOUNT" (uppercase, 11px, bold, muted ink), Headline "Tell us about your farm" (~28px), Right link: "Already registered? Sign in".
  - Form Grid (2 columns on tablet/desktop):
    - Full name ("Joyce Muthoni")
    - Email or phone number ("you@example.com")
    - Location: Full-width input with pin icon ("County, district or nearest town").
    - Farm type: 3-option card selector:
      - `[Crop]` (sprout icon)
      - `[Livestock]` (animal icon)
      - `[Mixed]` (grid icon + checkmark badge, active green ring and soft green fill).
    - Password & Confirm password: Side-by-side inputs with helper hints ("At least 8 characters", "Passwords match").
  - Checkbox: "I agree to the Terms of Use and understand how Acrea stores production records."
  - Primary Button: "Create account" (Solid moss green `#3E7B52`).
  - Info Callout: Soft green card with sprout icon: "You can add farms, plots and animal groups after creating your account."

### Screen 3: Farmer Dashboard (`/` or `/dashboard`)
- **Top Header**:
  - Left: Title "Dashboard", Subtitle "Tuesday, 2 October · Green Acres Farm".
  - Right: Search input (`Search Acrea ⌘ K`), Notification bell (with red/amber badge), User chip (`JM Joyce M. Green Acres Farm ▾`).
- **Greeting Banner**:
  - Left: "Good morning, Joyce" (bold ~24px), "Here's an overview of your farm today."
  - Right: Solid green action button: `+ Record production`.
- **4 Key Stat Cards (Row Grid)**:
  1. `Active crop cycles`: Value `4`, Subtext `3 on schedule · 1 due soon`, Icon: Sprout in `#EAF4ED`.
  2. `Animal groups`: Value `4`, Subtext `1,442 current population`, Icon: Livestock in `#FEF3C7`.
  3. `Total production`: Value `12.8 t`, Subtext `+8.4% this season`, Icon: Harvest box in `#E6F6F4`.
  4. `Upcoming activities`: Value `7`, Subtext `Next: Irrigation at 14:00`, Icon: Calendar in `#E8F5E9`.
- **Middle Section (2 Columns: 65% / 35%)**:
  - **Left Card: Production Overview**:
    - Header: "Production Overview", Legend dots (`● Crops` green, `● Animals` amber), Dropdown selector (`Last 12 months`).
    - Chart: Clean minimalist monthly output bar / lollipop chart across 12 months.
  - **Right Card: Upcoming Activities**:
    - Header: "Upcoming Activities", Link "View calendar".
    - List of activity items:
      - Time badge (`14:00`, `Tomorrow`, `04 Oct`)
      - Activity title (`Irrigate tomatoes`, `Weigh broilers`, `Apply fertilizer`)
      - Location (`Plot B`, `Batch C`, `Plot A`)
- **Bottom Section (3 Columns: 35% / 32.5% / 32.5%)**:
  - **Recent Activities Card**:
    - Header: "Recent Activities", Link "View all".
    - List items with circular icon badges, activity names, plots, timestamps, and chevron arrows.
  - **Crop Production Quick Card**:
    - Sprout badge, Title "Crop Production", Badge "Crop production".
    - Description: "Manage plots, production cycles, activities and harvests."
    - Metric summary: "4 active cycles · 6.3 t harvested"
    - Link: `Open module →`
  - **Animal Production Quick Card**:
    - Livestock badge, Title "Animal Production", Badge "Animal production".
    - Description: "Track animal groups, feeding, production and population changes."
    - Metric summary: "4 groups · 6,840 units this month"
    - Link: `Open module →`

### Screen 4: Farms & Plots (`/farms-and-plots`)
- **Top Header**: "Farms & Plots", "Organize land, plots and active production cycles", Search + Notification + Profile.
- **Hero Farm Summary Banner**:
  - White elevated card with green farm icon badge.
  - Title: "Green Acres Farm", Subtext: "Nakuru County, Kenya · Main farm".
  - Right Button: `+ Add Farm` (Solid green).
  - Stat summary bar inside card:
    - Total area: `8.7 ha`
    - Plot count: `4 plots`
    - Active cycles: `4 cycles`
    - Next harvest: `Tomatoes · 18 Oct`
- **Plots Section Header**:
  - Title: "Plots"
  - Filter bar: Search input (`Search plots or crops`), Filter button (`All stages ▾`), `+ Add Plot` (Solid green button).
- **Plots Grid (2x2)**:
  - **Plot A — Maize**: Sprout icon, Badge `Vegetative growth`, `2.5 ha cultivated area`, Cycle progress `62%` with progress bar, `Updated today`, `View details →`.
  - **Plot B — Tomatoes**: Plant/tomato icon, Badge `Flowering`, `1.0 ha cultivated area`, Cycle progress `74%` with progress bar, `Updated today`, `View details →`.
  - **Plot C — Beans**: Bean icon, Badge `Planting`, `0.8 ha cultivated area`, Cycle progress `29%` with progress bar, `Updated today`, `View details →`.
  - **Plot D — Cassava**: Leaf icon, Badge `Maturing`, `2.0 ha cultivated area`, Cycle progress `84%` with progress bar, `Updated today`, `View details →`.

### Screen 5: Crop Production Cycles (`/crop-production`)
- **Top Header**: "Crop Production Cycles", "Plan and follow every crop from planting to harvest", Search + Notification + Profile.
- **Control Bar**:
  - Left tabs: `All`, `Active` (active underlined tab), `Completed`.
  - Right Button: `+ New Production Cycle` (Solid green).
- **Summary Metrics (3 Columns)**:
  - Active cycles: `4`
  - Cultivated area: `6.3 ha`
  - Expected production: `18.6 t`
- **Cycle Cards Grid (2 Columns)**:
  - **Maize · Plot A**:
    - Active badge, `2.5 ha cultivated`.
    - Planting date: `12 Jul 2026`, Expected harvest: `28 Nov 2026`.
    - Stage: `Vegetative growth`, Progress `62%`.
    - Footer: `On track`, `View details →`.
  - **Tomatoes · Plot B**:
    - Active badge, `1.0 ha cultivated`.
    - Planting date: `03 Aug 2026`, Expected harvest: `18 Oct 2026`.
    - Stage: `Flowering`, Progress `74%`.
    - Footer: `On track`, `View details →`.
  - **Beans · Plot C**:
    - Active badge, `0.8 ha cultivated`.
    - Planting date: `20 Sep 2026`, Expected harvest: `14 Dec 2026`.
    - Stage: `Planting`, Progress `29%`.
    - Footer: `On track`, `View details →`.
  - **Cassava · Plot D**:
    - Completed badge, `2.0 ha cultivated`.
    - Planting date: `15 Feb 2026`, Expected harvest: `30 Nov 2026`.
    - Stage: `Maturing`, Progress `84%`.
    - Footer: `Final yield 7.9 t`, `View details →`.

---

## 3. Interaction & Animation Rules

1. **Subtle Elevation & Hover**:
   - Card hover: `transform: translateY(-2px)`, shadow `0 6px 20px rgba(22, 66, 48, 0.06)`, border-color `#DFD8CA`.
   - Transitions: `all 180ms cubic-bezier(0.16, 1, 0.3, 1)`.
2. **Progress Bars**:
   - Background track: `#ECE7DC`, border-radius `999px`.
   - Indicator bar: Smooth transition `width 400ms ease-out`, background color `#3E7B52`.
3. **Sidebar Interaction**:
   - Nav items smoothly switch active state with background `#FFFFFF` and text `#164230`.
   - Subtle vertical active pill bar on right (`width: 3.5px`, `height: 18px`, `background: #164230`, rounded `2px`).
