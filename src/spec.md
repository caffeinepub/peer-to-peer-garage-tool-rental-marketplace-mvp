# Specification

## Summary
**Goal:** Build a peer-to-peer garage tool rental marketplace with Internet Identity authentication, user profiles, tool listings, browsing/search, and a rental request/booking workflow.

**Planned changes:**
- Add Internet Identity sign-in/out and a minimal user profile flow (display name + optional contact note) with create/read/update for the signed-in principal.
- Implement backend data models and access control (single Motoko actor) for user profiles, tool listings, and rental requests/bookings with validated status transitions (Requested, Approved, Declined, Cancelled, Completed).
- Add stable persistence across backend upgrades for profiles, listings, and requests/bookings.
- Build tool listing CRUD for authenticated owners, including listing fields and photo references (frontend-managed photos; backend stores only references/URLs/asset paths).
- Implement marketplace browsing UI with listings grid, listing detail view, keyword search, filters (category, price range, available-only), and sorting (newest, price low-to-high, price high-to-low).
- Add rental request/booking workflow: renters request a date range; owners approve/decline; approved bookings block overlapping approved date ranges for the tool.
- Create dashboards: “My Tools”, “Requests” (incoming for owners), and “My Rentals” (for renters), each linking to listing and request/booking details.
- Apply a coherent garage/tool marketplace visual theme (avoiding blue/purple primary) by composing existing UI components, and include generated static brand imagery (logo + hero) referenced from `frontend/public/assets/generated`.

**User-visible outcome:** Users can sign in with Internet Identity, set a profile, create and manage tool listings with photos, browse and filter listings, request rentals for date ranges, approve/decline requests as an owner, and track activity through dedicated dashboards with persistent data across upgrades.
