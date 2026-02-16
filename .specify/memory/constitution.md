# VIA Constitution

## Core Principles

### I. WebHID-First
All keyboard communication flows through the WebHID API. No native drivers, no Electron wrappers. The browser is the platform. Device detection, protocol negotiation, and data transfer must work entirely within the browser sandbox.

### II. VIA Protocol Compliance
Every device interaction adheres to the VIA protocol specification (V2/V3). Commands use the enum-based `APICommand` system. Protocol versioning must be respected — never assume a device supports a newer protocol version without negotiation.

### III. Offline-Capable Configuration
Keyboard configuration must work without an internet connection after initial load. Device settings persist in IndexedDB via `idb-keyval`. Keyboard definitions are bundled at build time, not fetched at runtime.

### IV. Definition-Driven UI
The UI is entirely driven by keyboard definition files from `via-keyboards`. Layout rendering, key count, lighting options, and custom menus are all derived from definitions — never hardcoded for specific keyboards. Support any QMK keyboard that provides a valid VIA definition.

### V. Rendering Agnostic
Keyboard visualization supports multiple rendering backends (Three.js 3D, Canvas 2D). The rendering mode is a user preference, not a feature gate. All keyboard configuration features must work identically regardless of rendering mode.

## Technical Constraints

- **No Server-Side Logic**: VIA is a pure client-side SPA. All state lives in the browser (Redux store + IndexedDB).
- **Bundle Size Awareness**: Keyboard definitions are numerous. Use definition hashing for cache-busting and lazy loading where possible.
- **Cross-Browser WebHID**: WebHID availability varies across browsers. Degrade gracefully with clear messaging when unsupported.
- **Internationalization**: All user-facing strings must go through i18next. English is the fallback. New features must include translation keys.

## Quality Standards

- TypeScript strict mode — no `any` escape hatches without justification.
- Prettier formatting enforced (single quotes, trailing commas, no bracket spacing).
- Redux Toolkit slices for all state — no raw `useReducer` or Context for global state.
- Typed Redux hooks (`useAppDispatch`, `useAppSelector`) — never raw `useDispatch`/`useSelector`.

## Governance

This constitution governs all VIA contributions. Feature proposals and PRs must align with these principles. Amendments require discussion in a GitHub Issue or Discussion with maintainer approval.

**Version**: 1.0.0 | **Ratified**: 2026-02-16 | **Last Amended**: 2026-02-16
