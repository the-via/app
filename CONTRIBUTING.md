# Contributing to VIA

Thank you for contributing to VIA. This document describes how to contribute using the Spec-Driven Development (SDD) workflow.

## When to Use SDD

**SDD is required for:**
- New feature additions
- Major changes to existing features
- Refactoring that affects architecture

**SDD is not needed for:**
- Bug fixes (simple code changes)
- Typo fixes, documentation improvements
- Dependency updates

## SDD Workflow

```
Constitution (project principles)
    ↓
Specify (feature specification) → Review → Approve
    ↓
Plan (implementation plan) → Review → Approve
    ↓
Tasks (task breakdown)
    ↓
Implement (code)
```

### Step 1: Review the Constitution

Read [`.specify/memory/constitution.md`](.specify/memory/constitution.md) to understand VIA's core principles. All contributions must align with these principles.

### Step 2: Write a Feature Specification

```bash
# Create a new feature directory
mkdir -p specs/[###-feature-name]

# Copy the template
cp .specify/templates/spec-template.md specs/[###-feature-name]/spec.md
```

Fill in `spec.md`:
- **User Stories**: Describe the feature from the user's perspective (Given/When/Then)
- **Requirements**: Functional requirements (WHAT, not HOW)
- **Success Criteria**: Measurable outcomes

After writing, **open an Issue or Discussion to request a spec review**. The spec should be approved before writing code.

### Step 3: Write an Implementation Plan

```bash
cp .specify/templates/plan-template.md specs/[###-feature-name]/plan.md
```

Fill in `plan.md`:
- **Technical Context**: Technologies and dependencies needed
- **Constitution Check**: Verify compliance with each principle
- **Design Decisions**: Document technical choices and rationale
- **Project Structure**: Files to add or modify

### Step 4: Write a Task List

```bash
cp .specify/templates/tasks-template.md specs/[###-feature-name]/tasks.md
```

Fill in `tasks.md`:
- Organize tasks by phase
- Mark parallelizable tasks with `[P]`
- Map tasks to user stories with `[US1]` labels
- Include specific file paths in each task

### Step 5: Implement

Follow the tasks in phase order, checking off completed items with `[x]`.

## Development Setup

```bash
# Install dependencies
bun install

# Build keyboard definitions
bun run build:kbs

# Start development server
bun run dev

# Run tests (coming soon — see specs/001-sdd-testing-infrastructure/)
# bun run test

# Format code
bun run format

# Check formatting
bun run lint
```

## Testing Guidelines

- Test files go in `src/utils/__tests__/[module].test.ts`
- Only test pure functions (no browser/hardware dependencies)
- Use Vitest (`describe`, `it`, `expect`)
- New utility functions should include tests

## Code Style

- TypeScript strict mode
- Prettier: single quotes, trailing commas, no bracket spacing
- New user-facing strings must use i18next translation keys (`src/locales/`)
- Redux state must use Redux Toolkit slices
- Typed hooks: `useAppDispatch`, `useAppSelector`

## PR Process

1. Create a feature branch: `git checkout -b [###-feature-name]`
2. Commit SDD documents (spec, plan, tasks) alongside implementation code
3. Link related Issues in the PR description
4. Ensure CI passes (build + tests)
5. Request maintainer review
