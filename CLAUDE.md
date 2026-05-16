# Will AI Take My Job? — Design System

## Aesthetic
Retro pixel / Windows 98 OS. Everything looks like a classic desktop application — grey chrome, navy title bars, inset/raised 3D borders, monospace typewriter text.

## Fonts
- **Headings (h1/h2/h3):** `'Press Start 2P'` — loaded from Google Fonts in `index.html`. True pixel font.
- **Everything else:** `'Courier New', Courier, monospace`
- NO rounded fonts. NO system-ui/sans-serif anywhere.

## CSS Custom Properties (`src/index.css`)
| Variable        | Hex       | Usage                                    |
|-----------------|-----------|------------------------------------------|
| `--bg`          | `#C0C0C0` | Page background (classic Windows grey)   |
| `--window-bg`   | `#FFFFFF` | Inner window/card content background     |
| `--dark`        | `#000000` | All body text                            |
| `--title-bar`   | `#000080` | Window title bar background (navy)       |
| `--title-text`  | `#FFFFFF` | Title bar text                           |
| `--btn-face`    | `#C0C0C0` | Button / chrome background               |
| `--pink-accent` | `#FF69B4` | At-risk badge background                 |
| `--safe-green`  | `#008000` | Safe badge text colour                   |
| `--mid-grey`    | `#808080` | Dark side of 3D borders                  |
| `--light-grey`  | `#DFDFDF` | Button hover background                  |

## Borders — the Win98 3D trick
No box-shadows. No border-radius (set `border-radius: 0 !important` globally).

```css
/* Raised (windows, buttons, safe badges) */
border: 2px solid;
border-color: #FFFFFF #808080 #808080 #FFFFFF;

/* Inset (inputs, pressed buttons, at-risk badges, inset panels) */
border: 2px solid;
border-color: #808080 #FFFFFF #FFFFFF #808080;
```

## Component Classes
| Class              | Description                                          |
|--------------------|------------------------------------------------------|
| `.win-window`      | Outer raised window shell                            |
| `.win-title-bar`   | Navy bar with icon + title + fake ─ □ ✕ controls   |
| `.win-title-text`  | Flex-1 span inside title bar                        |
| `.win-controls`    | Container for the three ctrl buttons                 |
| `.win-ctrl-btn`    | Tiny raised button (16×14px)                         |
| `.win-body`        | White content area (padding 10px)                    |
| `.win-statusbar`   | Grey bottom bar with inset panel                     |
| `.win-inset`       | Inset bordered white panel — for stats, results      |
| `.win-btn`         | Standard grey raised button; `:active` → inset       |
| `.win-input`       | Inset-bordered input, Courier New, no radius         |
| `.win-tab`         | Toolbar/tab toggle; `.active` → inset + white bg     |
| `.badge-risk`      | `--pink-accent` bg, inset border, "⚠ AT RISK"       |
| `.badge-safe`      | `--btn-face` bg, raised border, "✓ SAFE" in green   |
| `.cursor`          | Blinking block cursor (CSS animation, step-end)      |
| `.line-clamp-2`    | 2-line webkit box clamp                              |
| `.job-grid`        | 1-col → 2-col at 560px, 8px gap                     |

## Reusable Component
`src/WinWindow.jsx` — props: `title`, `icon` (emoji), `children`, `statusBar`, `style`, `bodyStyle`.
Used by App.jsx for every major section and by JobCard.jsx for each card.

## Window Sections (App.jsx)
| Window title              | Content                                            |
|---------------------------|----------------------------------------------------|
| `WILL_AI_TAKE_MY_JOB.EXE` | Hero — Press Start 2P h1, CLI subtitle + cursor   |
| `SYSTEM_PROPERTIES.EXE`   | Stats — 3-column inset grid (total/at-risk/clusters)|
| `SEARCH_AND_FILTER.EXE`   | Address-bar input + toolbar tab filters            |
| `⚠ OCCUPATION_SCANNER.EXE`| Check My Job — C:\> prompt, fuse.js top-3 results |
| `📁 C:\CAREERS\`          | Job grid — paginated 12 at a time, status bar      |

## JobCard format
- Window title: occupation name → `GRAPHIC_DESIGNERS.TXT` (uppercase, underscores, 18 char max)
- File path: first word of career cluster → `C:\AGRICULTURE\`
- Body: path (navy bold) → occupation (bold) → 2-line description → badge

## Stack
- React 18 + Vite 5
- Tailwind CSS v3 — layout/spacing only; all colour/border via CSS custom properties
- fuse.js v7 — fuzzy search (threshold 0.3, occupation weight ×3, cluster/pathway ×1)
- Data: `public/jobs.json` — `career_cluster`, `career_pathway`, `code`, `occupation`, `description`, `at_risk`
