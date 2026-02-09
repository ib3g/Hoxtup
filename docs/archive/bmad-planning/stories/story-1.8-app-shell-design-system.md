# Story 1.8: App Shell, Design System & Responsive Layout

## Epic: 1 - Foundation & Secure Access

As a **user**,
I want a responsive, accessible interface that adapts to my role and device,
So that I can navigate the platform efficiently whether on mobile in the field or desktop at the office.

## Requirements Covered

- NFR17: WCAG 2.1 Level AA accessibility
- NFR18: High-contrast interface for field use
- NFR19: Minimum 48x48px touch targets
- NFR20: rem typography, clear hierarchy
- UX: AppShell, BottomNavBar, DashboardHeader components
- UX: Palette C "Fusion Méditerranée" design tokens
- UX: Outfit + Inter typography, mobile-first responsive

## Acceptance Criteria

**Given** the design system is configured
**When** I inspect Tailwind CSS configuration
**Then** all Palette C tokens are defined as CSS custom properties (--brand-primary, --color-cta, etc.)
**And** teal `#2c4f5c` is the primary text/read color
**And** terra cotta `#a06050` is the CTA/action color

**Given** the typography system
**When** fonts are loaded
**Then** Outfit (headings, 500-600 weight) and Inter (body, 400-500 weight) are self-hosted as woff2
**And** total font payload is ~65kb with `font-display: swap`
**And** all typography uses rem units respecting browser font size up to 200%

**Given** the AppShell component
**When** an Owner/Admin is logged in on mobile
**Then** they see DashboardHeader (greeting + contextual message) + content area + BottomNavBar (4 tabs: Home, Calendar, Team, More)

**Given** the AppShell component
**When** a Staff user is logged in on mobile
**Then** they see a simplified header (name + task count) + content area + BottomNavBar (3 tabs: Tasks, Planning, Incident)

**Given** the BottomNavBar
**When** I tap a tab
**Then** the active tab shows terra cotta `#a06050` icon + label
**And** inactive tabs show gray `#94a3b8` icon + label
**And** the tab bar height is 56px with minimum 48x48px touch targets

**Given** a mobile viewport (< 768px)
**When** I view any page
**Then** the layout is single column with BottomNavBar and sheets for actions

**Given** a tablet viewport (768-1024px)
**When** I view any page
**Then** the layout uses 2 columns with collapsible sidebar + content area

**Given** a desktop viewport (> 1024px)
**When** I view any page
**Then** the layout uses a permanent sidebar, no bottom nav
**And** split panel layout is available

**Given** the accessibility features
**When** I navigate with keyboard
**Then** all interactive elements are focusable via Tab
**And** focus ring is `2px solid #264653, offset 2px`
**And** a skip-to-content link is the first focusable element
**And** Escape closes all overlays

**Given** the user has `prefers-reduced-motion` enabled
**When** animations would normally play
**Then** all animations are disabled (0ms transitions)

**Given** the spacing and layout system
**When** I inspect component spacing
**Then** a 4px base grid is used consistently
**And** card border-radius is 8px
**And** minimal shadows (level-1 only)

**Given** the button hierarchy
**When** buttons are rendered
**Then** Primary buttons use solid terra cotta `#a06050`
**And** Secondary buttons use teal `#2c4f5c` outline (1px border)
**And** Ghost buttons use text-only teal
**And** Destructive buttons use solid red `#C45B4A`
**And** only ONE primary button exists per screen

## Technical Notes

- Tailwind v4 with CSS custom properties for all Palette C tokens
- shadcn/ui components installed and themed with Palette C
- Radix UI primitives for accessibility (focus management, ARIA)
- Layout: CSS Grid for pages, Flexbox for components
- Responsive: mobile-first, `sm:`, `md:`, `lg:` Tailwind prefixes
- Landmark regions: `<header>`, `<main>`, `<nav>` with proper ARIA
- Skeleton loading component (never spinners)
- axe-core integration for automated accessibility testing
- Storybook setup for component documentation
