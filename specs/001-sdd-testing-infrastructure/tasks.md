# Tasks: SDD & Testing Infrastructure

**Input**: Design documents from `/specs/001-sdd-testing-infrastructure/`
**Prerequisites**: plan.md (required), spec.md (required)

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[US1/US2/US3]**: Which user story this task belongs to

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [x] T001 Install Vitest dev dependencies (`vitest`, `@vitest/ui`)
- [x] T002 Create `vitest.config.ts` — reuse Vite config, set `src/` path alias, exclude jsdom (pure function tests only)
- [x] T003 Add `test`, `test:watch`, `test:ui` scripts to `package.json`

---

## Phase 2: SDD Templates & Contribution Guide (US1)

**Purpose**: Documentation infrastructure for contributors to follow the SDD workflow

**Goal**: New contributors can follow the Specify → Plan → Tasks → Implement workflow

**Independent Test**: A contributor can read CONTRIBUTING.md, copy a template, and create a new feature spec

- [x] T004 [P] [US1] Create `.specify/templates/spec-template.md` — spec-kit specification template (User Stories, Acceptance Scenarios, Requirements, Success Criteria)
- [x] T005 [P] [US1] Create `.specify/templates/plan-template.md` — implementation plan template (Technical Context, Constitution Check, Project Structure)
- [x] T006 [P] [US1] Create `.specify/templates/tasks-template.md` — task list template (Phase structure, parallel markers, user story labels)
- [x] T007 [US1] Create `CONTRIBUTING.md` — SDD workflow guide, template usage, PR process, test execution

**Checkpoint**: Contributors can follow CONTRIBUTING.md to create a new feature spec

---

## Phase 3: Core Utility Tests (US2)

**Purpose**: Unit tests for core utility functions

**Goal**: `bun run test` passes with 15+ tests

**Independent Test**: Run `bun run test` — all tests pass, regressions detected on utility changes

### color-math.ts tests

- [x] T008 [P] [US2] Create `src/utils/__tests__/color-math.test.ts`:
  - `getRGBPrime`: correct RGB prime for each of 6 hue ranges (0-60, 60-120, ..., 300-360)
  - `getColorByte`: hex string (#FF0000, #00FF00, #0000FF, #000000, #FFFFFF) → [r,g,b]
  - `getBrightenedColor` / `getDarkenedColor`: brightness adjustment, default & custom multiplier
  - `getHSV` / `getHSVFrom256`: RGB↔HSV conversion, grayscale edge case (delta=0)
  - `calcRadialHue` / `calcRadialMagnitude`: 4-quadrant angle calculation, center point handling
  - Round-trip: RGB → HSV → RGB identity (within tolerance)

### advanced-keys.ts tests

- [x] T009 [P] [US2] Create `src/utils/__tests__/advanced-keys.test.ts`:
  - `advancedStringToKeycode`: parse MT, LT, LM, MO, TO, DF, TG, OSL, OSM, TT, CUSTOM, MACRO
  - `advancedKeycodeToString`: bytecode → string reverse conversion
  - Modifier combinations: `MOD_LCTL|MOD_LSFT`, left/right modifier distinction
  - Round-trip: string → bytecode → string identity
  - Error cases: malformed syntax, non-existent keycodes

### key.ts tests

- [x] T010 [P] [US2] Create `src/utils/__tests__/key.test.ts`:
  - Predicates: `isAlpha` (A-Z, a-z, digits, empty), `isArrowKey` (4 arrows, unicode variants), `isNumpadNumber`, `isNumpadSymbol`, `isMultiLegend`, `isNumericOrShiftedSymbol`, `isNumericSymbol`
  - Byte functions: `getCustomKeycodeIndex`, `getMacroKeycodeIndex` — boundary value tests
  - Range checks: `isCustomKeycodeByte`, `isMacroKeycodeByte` — in/out of range values
  - `getShortNameForKeycode`: size-dependent abbreviations (100, 150, 200)

### key-to-byte tests

- [x] T011 [P] [US2] Create `src/utils/__tests__/dictionary-store.test.ts`:
  - `getBasicKeyDict(13)` → returns v12 dictionary
  - `getBasicKeyDict(12)` → returns v12 dictionary
  - `getBasicKeyDict(11)` → returns v11 dictionary (different `_QK_MOD_TAP` value)
  - `getBasicKeyDict(10)` → returns v10 dictionary
  - `getBasicKeyDict(9)` → returns default dictionary
  - Verify correct `_QK_` ranges per version

**Checkpoint**: `bun run test` → 15+ tests pass

---

## Phase 4: CI Integration (US3)

**Purpose**: Automated test execution on PRs

**Goal**: Add test step to `pr-build.yml`

- [x] T012 [US3] Modify `.github/workflows/pr-build.yml` — add `bun run test` step before `bun run build`

**Checkpoint**: CI runs tests and reports results on PR creation

---

## Phase 5: Polish

**Purpose**: Documentation updates and cleanup

- [x] T013 [P] Update `CLAUDE.md` — add `bun run test`, `bun run test:watch` commands, describe test conventions
- [ ] T014 [P] Update `README.md` — add Testing section (if applicable)
- [x] T015 Formatting check — run `bun run format` to ensure all new files comply with Prettier rules

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies — can start immediately
- **Phase 2 (SDD Templates)**: Independent of Phase 1 — can proceed in parallel
- **Phase 3 (Test Writing)**: Requires Phase 1 (Vitest config) — independent of Phase 2
- **Phase 4 (CI)**: Requires Phase 1 + Phase 3
- **Phase 5 (Polish)**: After all phases complete

### Parallel Opportunities

```
Phase 1 (Setup)  ─────────────────┐
                                  ├──→ Phase 3 (Tests) ──→ Phase 4 (CI) ──→ Phase 5
Phase 2 (SDD Templates) ─────────┘
```

- T004, T005, T006 can be written in parallel (independent files)
- T008, T009, T010, T011 can be written in parallel (independent files)
- Phase 2 can proceed entirely in parallel with Phase 1 and 3
