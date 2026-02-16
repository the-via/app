# Implementation Plan: SDD & Testing Infrastructure

**Branch**: `001-sdd-testing-infrastructure` | **Date**: 2026-02-16 | **Spec**: [spec.md](./spec.md)

## Summary

Introduce a Spec-Driven Development workflow and Vitest-based testing infrastructure to VIA. SDD templates structure the contribution process, and unit tests for core utilities (color-math, advanced-keys, key-to-byte, key predicates) provide a regression prevention foundation.

## Technical Context

**Language/Version**: TypeScript 5.6, React 18.3
**Primary Dependencies**: Vite 4.1, Redux Toolkit, styled-components
**Testing**: Vitest (Vite-native, Jest-compatible API)
**Target Platform**: Browser (SPA), CI (GitHub Actions)
**Project Type**: Web SPA (client-side only)
**Constraints**: Tests must target pure functions only — no WebHID/DOM dependencies. CI overhead must stay under 1 minute.

## Constitution Check

| Principle | Status | Notes |
|-----------|--------|-------|
| WebHID-First | N/A | Tests are hardware-independent |
| VIA Protocol Compliance | PASS | Protocol parsing correctness validated through tests |
| Offline-Capable | N/A | Infrastructure change, no runtime impact |
| Definition-Driven UI | N/A | No changes to the definition system |
| Rendering Agnostic | N/A | No rendering changes |
| TypeScript Strict | PASS | Test code also follows strict mode |
| Prettier | PASS | All new files follow existing formatting rules |

## Project Structure

### Documentation (this feature)

```text
specs/001-sdd-testing-infrastructure/
├── spec.md       # Feature specification
├── plan.md       # This file
└── tasks.md      # Task list
```

### Source Code (repository root)

```text
.specify/
├── memory/
│   └── constitution.md          # Project principles
└── templates/
    ├── spec-template.md         # Feature specification template
    ├── plan-template.md         # Implementation plan template
    └── tasks-template.md        # Task list template

src/utils/
├── __tests__/
│   ├── color-math.test.ts       # Color conversion tests
│   ├── advanced-keys.test.ts    # Advanced keycode parsing tests
│   ├── key.test.ts              # Key classification predicate tests
│   └── dictionary-store.test.ts # Keycode dictionary version tests

vitest.config.ts                 # Vitest configuration
CONTRIBUTING.md                  # Contribution guide (includes SDD workflow)
```

**Structure Decision**: Test files are co-located in `src/utils/__tests__/` using `*.test.ts` naming convention. Vitest reuses the Vite config, so no separate bundler configuration is needed.

## Unit Test Target Analysis

### 1. color-math.ts (13 pure functions)
- `getRGBPrime`, `getColorByte`, `getBrightenedColor`, `getDarkenedColor`
- `getHSV`, `get256HSV`, `getHSVFrom256`, `getRGB`, `hsToRgb`, `getHex`
- `toDegrees`, `calcRadialHue`, `calcRadialMagnitude`
- Browser-dependent (excluded): `updateCSSVariables`, `getRandomColor`

### 2. advanced-keys.ts (3 public pure functions)
- `advancedStringToKeycode` — Parses MT, LT, LM, TO, MO, DF, TG, OSL, OSM, TT, CUSTOM, MACRO
- `advancedKeycodeToString` — Reverse: bytecode to string
- `anyKeycodeToString` — Unified conversion

### 3. key.ts (10+ pure functions)
- Predicates: `isAlpha`, `isNumpadNumber`, `isArrowKey`, `isNumpadSymbol`, `isMultiLegend`, `isNumericOrShiftedSymbol`, `isNumericSymbol`
- Byte operations: `getCustomKeycodeIndex`, `getMacroKeycodeIndex`, `isCustomKeycodeByte`, `isMacroKeycodeByte`
- Dictionary transform: `getByteToKey`

### 4. key-to-byte/dictionary-store.ts (1 pure function)
- `getBasicKeyDict(version)` — Returns version-specific keycode dictionary

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| N/A | | |
