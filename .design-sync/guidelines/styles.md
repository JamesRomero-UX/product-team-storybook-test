# Styles (layout, spacing, radius, elevation, motion)

The implementation foundations — every value is a token. **The themed-cloudscape components already
implement these**, so compose components (`SpaceBetween`, `Container`, `Grid`, `ColumnLayout`, `Box`)
rather than hand-applying values; use this as reference for custom layout glue and for matching the
live app.

## Spacing — 4px grid
16px (standard padding) and 24px (container padding/gutters) do most of the work. Steps: 2 · 4 · 8 ·
12 · 16 (standard) · 20 · 24 (container) · 32 (section) · 48 (page section). Prefer container
padding + `gap` over ad-hoc margins.

## Layout regions
| Region | Size | Background |
|---|---|---|
| Sidebar | 300px wide, full height | `#14143A` |
| Top nav | ~54px (52 + 1.5 border) | `#14143A` |
| Page header | min-height 72px, padding 16/24 | `#FFFFFF` |
| Content canvas | scrollable, inset 20/24/24 | `#F6F6FB` |
| Container (card/table) | 1px `#E4E4E8` border, 10px radius | `#FFFFFF` |
| Max content width | ~1160px, centred, 24px gutters | — |

## Radius
`sm` 4 (badge/tag/chip) · input 6 · `lg` 8 (button, modal-sm) · `xl` 12 (card, accordion) ·
`2xl` 16 (modal, large panel) · container 10 (stat-card & table) · pill (live-app buttons).

## Elevation
Card `shadow-sm` · dropdown/menu `shadow-md` · modal `shadow-lg` · overlay `shadow-xl`. Subtle,
soft, low-opacity black.

## Borders
Default **1.5px** (inputs, controls, containers) · 1px hairline dividers (`#EDEDF2`) · 2px teal focus
ring (`#9EEDE7`, 2px offset).

## Motion
Short and purposeful, `ease-out`. 150ms micro (hover) · 200ms standard (menu, accordion) · 300ms
larger (modal). Always respect `prefers-reduced-motion`.
