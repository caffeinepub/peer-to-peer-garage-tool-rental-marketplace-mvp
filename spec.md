# Specification

## Summary
**Goal:** Fix zoom functionality in the CustomMapView component so the map remains stable and interactive at all zoom levels.

**Planned changes:**
- Fix tile fetching logic to correctly load and position tiles at any zoom level
- Correct Web Mercator projection math to prevent calculation errors during zoom
- Fix marker positioning to remain accurate after zoom in/out operations
- Ensure viewport bounds recalculation stays correct across all zoom interactions
- Prevent blank map, error states, or visual glitches when zooming

**User-visible outcome:** Users can zoom in, zoom out, and reset the map multiple times without the map crashing, going blank, or displaying incorrectly. Markers remain correctly placed and tiles load properly at all zoom levels.
