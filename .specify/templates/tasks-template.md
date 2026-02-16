# Tasks: [FEATURE NAME]

**Input**: Design documents from `/specs/[###-feature-name]/`
**Prerequisites**: plan.md (required), spec.md (required)

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[US1/US2/...]**: Which user story this task belongs to
- Story labels are not needed for Setup/Foundational/Polish phase tasks

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [ ] T001 [description + file path]
- [ ] T002 [P] [description + file path]

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story

**CRITICAL**: No user story work can begin until this phase is complete

- [ ] T003 [description + file path]

**Checkpoint**: Foundation ready — user story implementation can begin

---

## Phase 3: User Story 1 - [Title] (Priority: P1) MVP

**Goal**: [What this story delivers]

**Independent Test**: [How to verify independently]

- [ ] T004 [P] [US1] [description + file path]
- [ ] T005 [US1] [description + file path] (depends on T004)

**Checkpoint**: User Story 1 independently functional

---

## Phase 4: User Story 2 - [Title] (Priority: P2)

**Goal**: [What this story delivers]

- [ ] T006 [P] [US2] [description + file path]

**Checkpoint**: User Story 1 + 2 both independently functional

---

<!-- Add more user story phases as needed -->

## Phase N: Polish & Cross-Cutting Concerns

**Purpose**: Improvements affecting multiple user stories

- [ ] TXXX [P] Documentation updates
- [ ] TXXX Code formatting check (`bun run format`)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies
- **Foundational (Phase 2)**: Requires Setup — BLOCKS all user stories
- **User Stories (Phase 3+)**: Can proceed in parallel after Foundational
- **Polish (Final)**: After all user stories complete

### Parallel Opportunities

```
[Phase dependency diagram]
```

- Tasks marked [P] operate on different files and can run in parallel
- Independent user stories can be worked on by different developers in parallel
