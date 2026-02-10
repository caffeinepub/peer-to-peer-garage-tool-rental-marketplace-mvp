# Specification

## Summary
**Goal:** Polish and standardize UI/UX across all existing pages while refactoring the frontend to remove duplicated code and dead/placeholder files.

**Planned changes:**
- Standardize page structure across all routes (consistent header pattern, typography scale, spacing, section layout, and top/bottom padding).
- Unify loading, empty, and error states across data-driven pages using a consistent shared UI pattern.
- Normalize common UI primitives usage (cards, badges, buttons, alerts) for consistent appearance in light and dark mode.
- Refactor duplicated frontend logic into shared utilities/components (e.g., rental status label/color mapping and shared rental date formatting).
- Remove dead/duplicate code and clean up unused imports/exports; resolve the placeholder `frontend/src/hooks/useMapZoom.ts` by removing it or implementing a single consolidated map zoom/pan hook.

**User-visible outcome:** All existing pages feel more cohesive and seamless, with consistent navigation/actions and states (loading/empty/error), and the app behaves the same but looks and reads more uniformly across routes.
