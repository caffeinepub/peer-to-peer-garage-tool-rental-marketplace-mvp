# Specification

## Summary
**Goal:** Fix the deep zoom error on the community map and allow users to zoom in to street level (zoom 19) without errors.

**Planned changes:**
- Remove the zoom ceiling in `CustomMapView` and `useMapTiles` that causes errors at high zoom levels
- Update `useMapTiles` to return valid tile URLs and pixel-conversion values for all zoom levels up to 19, with defensive guards against null/undefined values
- Update `useMapTransform` and/or `useMapZoom` to set the maximum allowed zoom level to 19, clamping zoom state so it never exceeds this value
- Disable or visually deactivate the zoom-in button when zoom level 19 is reached

**User-visible outcome:** Users can zoom in to street level on the community map (up to zoom level 19) using the mouse wheel, pinch gesture, or zoom-in button without encountering any errors or blank states.
