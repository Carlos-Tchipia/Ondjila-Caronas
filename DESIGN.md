---
name: Ondjila
colors:
  surface: '#f5fbef'
  surface-dim: '#d6dcd0'
  surface-bright: '#f5fbef'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f0f6ea'
  surface-container: '#eaf0e4'
  surface-container-high: '#e4eade'
  surface-container-highest: '#dee4d9'
  on-surface: '#171d16'
  on-surface-variant: '#3f4a3c'
  inverse-surface: '#2c322a'
  inverse-on-surface: '#edf3e7'
  outline: '#6f7a6b'
  outline-variant: '#becab9'
  surface-tint: '#006e1c'
  primary: '#006e1c'
  on-primary: '#ffffff'
  primary-container: '#4caf50'
  on-primary-container: '#003c0b'
  inverse-primary: '#78dc77'
  secondary: '#466270'
  on-secondary: '#ffffff'
  secondary-container: '#c6e4f4'
  on-secondary-container: '#4a6774'
  tertiary: '#a63360'
  on-tertiary: '#ffffff'
  tertiary-container: '#f26f9d'
  on-tertiary-container: '#690034'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#94f990'
  primary-fixed-dim: '#78dc77'
  on-primary-fixed: '#002204'
  on-primary-fixed-variant: '#005313'
  secondary-fixed: '#c9e7f7'
  secondary-fixed-dim: '#adcbda'
  on-secondary-fixed: '#001f2a'
  on-secondary-fixed-variant: '#2e4b57'
  tertiary-fixed: '#ffd9e2'
  tertiary-fixed-dim: '#ffb1c7'
  on-tertiary-fixed: '#3e001c'
  on-tertiary-fixed-variant: '#861948'
  background: '#f5fbef'
  on-background: '#171d16'
  surface-variant: '#dee4d9'
  pooling: '#1565C0'
  surface-main: '#F5F5F5'
  surface-card: '#FFFFFF'
  text-primary: '#212121'
  text-secondary: '#455A64'
  glass-bg: rgba(255, 255, 255, 0.15)
  danger: '#F44336'
typography:
  display-hero:
    fontFamily: Geist
    fontSize: 68px
    fontWeight: '700'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Geist
    fontSize: 32px
    fontWeight: '700'
    lineHeight: '1.2'
  headline-md:
    fontFamily: Geist
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.3'
  headline-sm:
    fontFamily: Geist
    fontSize: 20px
    fontWeight: '600'
    lineHeight: '1.4'
  body-lg:
    fontFamily: DM Sans
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: DM Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.5'
  body-sm:
    fontFamily: DM Sans
    fontSize: 14px
    fontWeight: '400'
    lineHeight: '1.5'
  label-caps:
    fontFamily: Geist
    fontSize: 12px
    fontWeight: '500'
    lineHeight: '1.0'
    letterSpacing: 0.1em
  status-pill:
    fontFamily: DM Sans
    fontSize: 12px
    fontWeight: '500'
    lineHeight: '1.0'
  headline-lg-mobile:
    fontFamily: Geist
    fontSize: 48px
    fontWeight: '700'
    lineHeight: '1.1'
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  container-max: 1440px
  gutter: 1.5rem
  margin-mobile: 1rem
  sidebar-width: 380px
  stack-sm: 0.75rem
  stack-md: 1.5rem
  stack-lg: 3rem
---

## Brand & Style

The design system for this product is rooted in a "Futuristic Urban" aesthetic that balances premium sophistication with a welcoming, "charming" personality. It is designed to evoke a sense of rhythmic movement through Luanda—smooth, reliable, and tailored to the individual.

The visual style is a fusion of **Corporate Modern** and **Glassmorphism**. It utilizes clean, high-end layouts characterized by precision and technical excellence, while incorporating frosted translucency to maintain spatial awareness within the urban map context. The atmosphere is intentional and tech-forward, avoiding common tropes of sustainability in favor of a sleek, high-performance mobility experience.

**Key Brand Attributes:**
- **Futuristic:** Emphasized through technical typography and glass-based UI layers.
- **Premium:** Reflected in high-contrast layouts and generous whitespace.
- **Urban Rhythm:** Visualized through smooth motion and clear, functional color signaling.
- **Charming:** Conveyed through refined roundedness and subtle, high-quality micro-interactions.

## Colors

The color palette uses functional distinction to guide the user. **Primary Green** is the anchor for standard operations, success states, and core CTAs. **Pooling Blue** is reserved exclusively for shared ride features, creating a clear visual mental model for the user without needing textual cues.

**Neutral Blue-Grays** provide the professional, technical framework for the UI, ensuring the interface feels grounded. A strict **Light Mode** constraint ensures maximum clarity and a "fresh" urban feel during Luanda's daylight and neon-lit nights. Orange is strictly prohibited to maintain a high-end, calm visual environment.

## Typography

This design system employs a dual-font strategy to balance impact with utility. **Geist** is used for high-impact display moments, headlines, and technical labels, providing a precise, futuristic edge. **DM Sans** handles the bulk of the interface, offering high legibility and a friendly, approachable tone for body copy and interactive elements.

Hierarchy is established through weight and scale. Large hero displays use tight tracking for a cinematic feel, while small labels use increased letter spacing to ensure readability at a glance during transit.

## Layout & Spacing

The layout philosophy uses a **Fixed Grid** for web content and a **Contextual Layering** model for app views. On desktop, content is centered within a 1440px container, while map-heavy views utilize a fixed-width sidebar (380px) for navigation and ride details.

**Mobile Strategy:**
- Uses a bottom-sheet model where the UI "floats" over the map.
- Margins are tightened to 16px to maximize map visibility.
- Touch targets are strictly 48px or larger.

**Rhythm:**
A base 4px/8px grid governs all spacing. Vertical rhythm is maintained through standard "stacks" (sm/md/lg) to ensure the premium, airy feel of the interface is consistent across different screen lengths.

## Elevation & Depth

Visual hierarchy is primarily conveyed through **Glassmorphism** and **Ambient Shadows**. This creates a "layered map" experience where the interface feels like a sophisticated overlay rather than a static screen.

- **Surface Tiers:** The base layer is always the map. Interactive elements sit on "Glass" panels (backdrop blur: 20px) or solid white cards.
- **Shadow Profile:** Shadows are extra-diffused and low-opacity (8-12%). Active states for green elements may use a subtle tinted "Neon Glow" to emphasize importance.
- **Depth Transitions:** When a card is focused, it uses a subtle 3D scale and perspective shift to feel "tactile" and responsive.

## Shapes

The shape language is consistently **Rounded**, striking a balance between modern precision and "charming" approachability.

- **Base Radius:** 0.5rem (8px) for standard UI components like inputs and small cards.
- **Large Components:** 1rem (16px) for main action containers and bottom sheets.
- **Interactive Pills:** Full-rounded corners for status indicators, chips, and special ride capacity tags.
- **Map Elements:** Map pins and markers use a mix of sharp technical pointers and soft circular containers to denote origin and destination.

## Components

### Buttons
- **Primary:** Solid `#4CAF50` with white text. Features a subtle left-to-right "shimmer" effect on hover to signal premium quality.
- **Pooling:** Solid `#1565C0` used only for sharing-related actions.
- **Secondary:** Transparent with a 1px border of `#607D8B`.

### Input Fields
- **Standard:** 56px height, soft gray background, becomes `#4CAF50` with a 2px border on focus.
- **OTP/Technical:** Monospaced Geist numbers, individual cells (56x64px) with high-contrast active states.

### Cards
- **Ride Options:** Horizontal layout with high-quality car photography. Individual rides use a Green left-accent border; Pooling rides use a Blue left-accent border.
- **Glass Panels:** Used for floating map controls. Features 20px blur and 1px semi-transparent borders.

### Status Indicators
- **Capacity Badges:** Small pills (e.g., "2P", "3P") in Pooling Blue with Geist Medium weight.
- **Success Checks:** Circular green icons with a soft pulse animation.

### Vehicles
- All vehicle assets must feature silver, white, or dark-gray premium cars. No distinguishability between fuel types is required; the focus is on the "Premium Urban" aesthetic of the vehicle itself.
