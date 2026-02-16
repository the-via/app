# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

VIA is an open-source web application for configuring QMK-powered mechanical keyboards via WebHID. Live at https://usevia.app.

**Stack**: React 18 + TypeScript 5.6 + Vite 4 + Redux Toolkit + styled-components + Three.js (3D keyboard rendering)

## Common Commands

```bash
# Development server (http://localhost:5173)
bun run dev

# Production build (builds keyboard definitions first, then compiles TS + Vite bundle)
bun run build

# Build keyboard definitions only (from via-keyboards dependency)
bun run build:kbs

# Format code with Prettier
bun run format

# Check formatting
bun run lint

# Preview production build locally
bun run preview

# Force update via-keyboards dependency from GitHub
bun run refresh-kbs

# Find unused code
bun run find-deadcode
```

No test framework is configured. There are no unit tests.

## Architecture

### State Management (src/store/)
Redux Toolkit with slice-per-feature pattern. Each feature (keymap, lighting, macros, devices, definitions, settings, design, menus, firmware, errors) has its own slice. Async device operations live in `devicesThunks.ts`. Use typed hooks from `store/hooks.ts`: `useAppDispatch` and `useAppSelector`.

### Hardware Communication
- **WebHID API** (`src/utils/usb-hid.ts`): Direct USB communication with keyboards
- **VIA Protocol** (`src/utils/keyboard-api.ts`): Enum-based command protocol (`APICommand`) for reading/writing keymaps, lighting, macros to devices
- **Device Storage** (`src/utils/device-store.ts`): IndexedDB via `idb-keyval` for persisting device settings

### Keyboard Definition System
- Definitions come from the `via-keyboards` npm dependency (GitHub repo)
- `scripts/build-definitions.js` generates definition files into `public/definitions/`
- A definition hash is injected into `index.html` at build time for cache-busting
- Supports VIA protocol V2 and V3 definition formats
- `@the-via/reader` parses definitions, `@the-via/pelpi` handles peripheral communication

### Rendering
Two rendering modes selectable via Redux `renderMode` setting:
- **3D** (default): Three.js + React Three Fiber (`src/components/three-fiber/`)
- **2D**: Canvas-based rendering (`src/components/two-string/`)

### Component Organization
- `src/components/panes/` — Page-level views: configure, debug, design, test, settings, errors
- `src/components/inputs/` — Reusable UI controls (buttons, sliders, color pickers, dialogs)
- `src/components/menus/` — Top-level navigation and language selector
- `src/components/three-fiber/` — 3D keyboard visualization components

### Routing
Wouter-based client-side routing. Routes defined in `src/constants/routes.json` and `src/Routes.tsx`. SPA fallback routes configured in `staticwebapp.config.json`.

### Internationalization
i18next with browser language detection. Translation files in `src/locales/` (en, de, es, ja, ko, zh). Fallback to English.

## Code Style

- Prettier: single quotes, trailing commas, no bracket spacing (see `.prettierrc`)
- TypeScript strict mode enabled
- Path alias: imports can use `src/` prefix (e.g., `import from "src/store/hooks"`)
- CSS-in-JS via styled-components

## Deployment

Cloudflare Pages via GitHub Actions. Build command: `bun install --frozen-lockfile && bun run refresh-kbs && bun run build`. Output directory: `dist/`.
