# Camera-aware visual upgrade — implementation tracker
Date: 2026-10-18. Status: **audit started; asset production and live rendering QA not complete**.

## Verified current architecture
- `assets/production-registry.json` already catalogues 323 distinct literal source mesh identifiers grouped into 18 production families; this is not a count of independently verified 3D objects.
- `pbr-materials.js` generates coherent procedural albedo, tangent-space normal and ORM maps for eight material types, with runtime texture budgeting, quality tiers and opt-in 4K.
- `graphics.js` offers low, balanced, high and sharp framebuffer profiles; sharp pixel density is separate from material quality.
- `camera.js` already contains low-eye perspective framing and orthographic top-down framing.
- `mini-game-world.js` supports third-person and first-person camera states for racing.
- `mini-games.js` defines six gameplay activities: mansion, potions, broom, garden, railway, rally.
- `docs/asset-production-pipeline.md` explicitly records incomplete production modelling and outstanding live WebGL/mobile QA.

## Camera/detail acceptance matrix

| Context | Actual or required viewpoint | Material / mesh priority | Required visual validation |
| --- | --- | --- | --- |
| Village, paths and landscape | follow / exploration camera | tiled stone, earth, vegetation, architecture; instancing and distant LOD | near and far views, entrance visibility, fog/contrast |
| Train and stations | third-person exterior; first-person boarding/ride | hero locomotive at platform, wagon interior, station signs, track ties | one engine pulling wagon, no square duplicate, ride clearance |
| Mansion puzzle | low-eye perspective exercise | key silhouettes, door, worn brass and wood | selectable keys readable, all picks visible |
| Potions | low-eye perspective exercise | translucent bottle/glass, liquid, table, labels | quantities readable, highlights not covering targets |
| Garden | low-eye perspective exercise | earth, seed bags, plants, beds | order markers readable, no occlusion |
| Railway puzzle | low-eye perspective exercise | boards, timetables, model station details | departure values readable and selectable |
| Broom flight | behind-rider and first-person where supported | broom, gates, distant landscape | gates visible, head/cockpit not obscuring answers |
| Pumpkin rally | third-person chase and first-person cockpit | kart interior, wheels, track, gate signs | gate visibility, steering controls off sightline, viewpoint retained |
| Other optical / board exercises | orthographic top view when appropriate | floor and interactive meshes, not invisible walls | puzzle fully framed across mobile aspect ratios |
| Other immersive exercises | low-eye perspective / curved interiors | separate floor/wall/ceiling UVs and props | no spherical projection stretching or floor/wall discontinuity |

## Execution gate for each asset family
1. Locate actual producing source functions and current source meshes/GLBs; record interactions, bounds and camera distances.
2. Produce a production brief and map set, with correct UV alignment, sRGB albedo, linear normal/ORM; approve seams and mipmapping.
3. Generate or construct real GLB geometry, mobile LOD and collision/picking proxies. Concept images or videos alone do not pass.
4. Integrate into real Babylon scene paths, preserving procedural fallback and disposal.
5. Verify screenshots in each applicable gameplay camera and each aspect ratio; ensure no interactive targets are obscured.
6. Run repository tests and measure FPS, texture memory and draw calls on desktop and iPhone Safari. Mark live QA pending unless actually measured.

## Initial high-impact engineering backlog
1. **PBR memory safety:** Inspect `pbr-materials.js` incremental pair allocation and `setQuality` transient upload peaks. Confirm fallback when a new surface family cannot be admitted; do not claim success from unit tests alone.
2. **First-person Pumpkin Rally:** Inspect `mini-game-world.js` cockpit mesh placements against answer-gate screen-space bounds, on desktop and mobile. Preserve `raceView` between rounds.
3. **Exercise framing:** Validate all actual mini-game bounds with `MoonCamera.lowEyeFrame` and `topFrame`; include safe-area HUD margins on tall phone viewports.
4. **Material roll-out:** Start with close-up surfaces used across many scenes (stone, wood, pumpkin, metal), then doors, clocks, interiors and race assets. Only generate 4K source maps where camera coverage warrants it.
5. **Animation:** Use image-to-video only for movement reference; convert to Babylon animation groups, rigs or procedural effects and test actual runtime behaviour.

## Known limitations
This tracker is based on source inspection. No new production GLB or texture was generated in this audit, and no desktop/iPhone live rendering or end-to-end benchmark was executed. Existing production registry stages must not be advanced based on this document.
