# Specification

## Summary
**Goal:** Redesign the homepage to feel like an immersive, graphics-heavy journey “traveling through a tool shed,” while keeping existing primary CTAs and auth-dependent behavior unchanged.

**Planned changes:**
- Redesign `frontend/src/pages/LandingPage.tsx` into a sequence of themed sections that reads like moving through a tool shed/workshop, using substantially more visuals than the current layout.
- Apply a cohesive “tool shed travel” visual theme (e.g., warm lighting, wood/metal textures, signage/labels) across the homepage without changing global header/footer behavior.
- Add lightweight, scroll-friendly motion (CSS/Tailwind-friendly) to enhance the “travel” feeling, while respecting `prefers-reduced-motion`.
- Add and reference new static image assets under `frontend/public/assets/generated` so the homepage loads all visuals reliably.

**User-visible outcome:** Visitors see a new immersive, visual homepage with a tool-shed journey vibe; Browse Tools and Get Started/List a Tool actions behave exactly as before (including auth-dependent behavior), with responsive layout and subtle motion effects.
