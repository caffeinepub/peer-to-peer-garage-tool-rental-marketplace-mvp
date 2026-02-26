# Specification

## Summary
**Goal:** Replace the broken Google Maps implementation with a fully custom OpenStreetMap-based interactive map, requiring no API key.

**Planned changes:**
- Remove all Google Maps API script tags, API key references, and related error handlers from the frontend
- Build a `CustomMapView` component that renders OpenStreetMap tiles on a canvas/div grid with smooth pan (click-and-drag) and zoom (scroll wheel, pinch, +/- buttons) interactions
- Add zoom control buttons (bottom-right) and an OpenStreetMap attribution label styled like Google Maps UI
- Replace `GoogleMapView` in `CommunityMapPanel.tsx` with `CustomMapView`, rendering community member markers as teardrop-shaped avatar pins at their lat/lng coordinates
- Clicking a marker opens the existing member profile info card
- Style all map UI controls (zoom buttons, info cards) to match Google Maps visual design: white rounded buttons with drop shadows, red teardrop pins, clean white info cards
- Update `frontend/README.md` to remove Google Maps API key setup instructions and document the new custom map implementation

**User-visible outcome:** The Community Map page loads and works without any Google Maps API key — users can pan and zoom an OpenStreetMap-based map and click on member avatar pins to view profile cards, all with a familiar Google Maps-like look and feel.
