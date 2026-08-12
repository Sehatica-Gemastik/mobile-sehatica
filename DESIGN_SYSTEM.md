# Sehatica Design System

Clean SaaS healthcare UI — mint gradient canvas, white elevated surfaces, minimal shadow.

## Principles

- **Canvas vs surface**: Screen background is always the soft gradient; content lives on white cards.
- **Minimal depth**: Use `Shadows.sm` only. Avoid heavy elevation and colored glows.
- **Generous radius**: Cards `24px`, inputs/buttons pill (`9999`).
- **Breathing room**: Section gaps `24–32px`, card padding `16px`.

## Color

| Token | Value | Usage |
|-------|-------|--------|
| `primary` | `#00A7B1` | CTAs, links, active states, icons |
| `primaryLight` | `#E0F7FA` | Selected chips, icon backgrounds |
| `text` | `#1A2332` | Headings |
| `textSecondary` | `#64748B` | Body, subtitles |
| `textMuted` | `#94A3B8` | Hints, timestamps |
| `backgroundCard` | `#FFFFFF` | Cards, modals, tab bar |
| `backgroundElement` | `#F4F7F8` | Inputs, chips (inactive) |

### Gradient (screen canvas)

```
#DDF5F3 → #EEF9F8 → #FFF0EB
```

Diagonal: top-left → bottom-right (`ScreenBackground` / `AppScreen`).

## Typography — Inter

| Token | Weight | Use |
|-------|--------|-----|
| `Fonts.regular` | 400 | Body |
| `Fonts.medium` | 500 | Labels, tab labels |
| `Fonts.semibold` | 600 | Card titles, buttons |
| `Fonts.bold` | 700 | Screen titles, section headers |

Sizes: `xs 12`, `sm 14`, `md 16`, `lg 18`, `xl 22`, `xxl 28`.

## Components

- **AppScreen** — full-screen gradient wrapper for every route.
- **SurfaceCard** — white card + `Shadows.sm` + `BorderRadius.xl`.
- **Button** — pill, primary solid teal; secondary uses `primaryLight` fill.
- **TextField** — pill white input with light border.
- **Chip** — pill tag; active = `primaryLight` + teal text.
- **ScreenHeader** — transparent over gradient; bold `xl` title.

## Shadows

Only `Shadows.sm` (iOS opacity ~0.05) and `Shadows.md` for modals/overlays.

## Status cards (dashboard stacks)

- **Done / action**: teal gradient `#00A7B1 → #008A93`
- **Pending**: amber gradient `#F59E0B → #D97706`
- **Completed schedule**: slate `#94A3B8 → #64748B`

## Do / Don't

| Do | Don't |
|----|-------|
| White cards on gradient | Solid white full-screen backgrounds |
| Transparent screen containers | `backgroundColor: '#fff'` on root views |
| Inter everywhere | Mixing other display fonts |
| Teal accents sparingly | Heavy borders and dark shadows |

Implementation source of truth: `src/constants/theme.ts`.
