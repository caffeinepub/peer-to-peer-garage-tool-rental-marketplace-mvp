# Specification

## Summary
**Goal:** Unify “View Profile” and “Edit Profile” into a single /profile page flow, removing the modal-based edit experience from the profile dropdown.

**Planned changes:**
- Update the ProfileMenu dropdown to remove separate “View Profile” vs “Edit Profile” actions and replace them with a single English-labeled item (e.g., “My Profile” / “Profile”) that navigates to `/profile`.
- Remove any profile editing dialog/modal behavior triggered from ProfileMenu so no `Dialog` is rendered from the dropdown after this change.
- Enhance `/profile` to support initializing in either view mode or in-page edit mode based on a URL indicator (e.g., `?edit=1`), while keeping the existing default behavior (view mode when no indicator is present).
- Ensure saving or cancelling edits on `/profile` returns the user to view mode on the same page and reflects updated profile data.

**User-visible outcome:** The profile dropdown takes users to a single Profile page where they can view their profile and switch into in-page editing (including opening directly in edit mode via a URL indicator), without any separate edit modal flow.
