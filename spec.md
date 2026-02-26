# Specification

## Summary
**Goal:** Fix the runtime error that occurs when zooming to street level on the community map.

**Planned changes:**
- Audit and correct tile URL computation in `CustomMapView` and `useMapTiles` to ensure valid URLs are generated at all zoom levels up to 19.
- Fix zoom level capping logic so the maximum zoom level (19) is properly enforced without triggering errors.
- Correct Web Mercator math in `useMapTransform` to handle maximum zoom without invalid calculations.
- Ensure zoom controls (in/out/reset) work correctly across all zoom levels including zoom 19.

**User-visible outcome:** Users can zoom all the way to street level (zoom 19) on the community map without errors, broken tiles, or console warnings. Pan and zoom interactions remain smooth at all zoom levels.
