# Specification

## Summary
**Goal:** Update the Community Map page to use an interactive, Google Earth-like 3D globe with member location pins, while keeping the existing page layout and member selection behavior.

**Planned changes:**
- Replace the current 2D world map rendering in `frontend/src/components/community/CommunityMapPanel.tsx` with an interactive 3D Earth-like globe that supports rotate (drag) and zoom (wheel/trackpad).
- Render a selectable pin/marker on the globe for each `CommunityMapProfile` returned by `getCommunityMapProfiles()` that has valid `coordinates` (latitude/longitude), and visually distinguish the selected member’s pin.
- Load globe surface texture(s) from new static assets placed in `frontend/public/assets/generated` (no external map providers or backend texture fetching).
- Add a fallback message inside the map card area when 3D rendering cannot initialize (e.g., WebGL unavailable), keeping the rest of the page usable.

**User-visible outcome:** On `/community-map`, users can rotate/zoom a 3D Earth globe and click pins to select members (or select via directory cards) to view the existing selected-member details overlay; if 3D is unsupported, a clear message is shown and the directory/stats remain usable.
