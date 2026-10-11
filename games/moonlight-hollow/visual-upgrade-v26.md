# Refined implementation brief

Improve Moonlight Hollow in its existing Babylon.js static deployment. Generate detailed Halloween environment artwork online, add physically modelled decorative trim around indoor play areas, and keep imagery separate from playable objects. Record actual asset resolution and provenance. Use optimized geometry and texture sizes appropriate for desktop and mobile.

Correct over-tight exercise and mini-game cameras by fitting the complete interactive layout within the HUD-safe viewport with additional breathing room. Preserve the orthographic top view for the optics board and first-person driving views. Ensure targets remain legible and pickable on portrait, landscape and desktop layouts.

Specifically improve Pompoenpad: increase spacing between baskets; place each current/target counter above its light dots; reserve a separate side lane for the remaining-light source and its label; retain clear add/remove targets, Dutch/French labels and stable framing throughout an exercise. Verify projected label/dot separation and actual Babylon picking.

## Implemented assets and limits

- `assets/enchanted-interior.webp`: AI-generated using the built-in online image tool; native 2172 × 724 pixels, WebP quality 94. Original PNG preserved in the generating conversation. No real-location photograph claim.
- Prompt: panoramic enchanted autumn castle library and alchemist workshop, photograph-like 3D render, carved walnut shelves, arched moonlit windows, amber lanterns, ornate copper apparatus, friendly Halloween decor, empty central floor, orange/plum/teal palette, detailed materials, no people/text/watermark.
- Room views and framed pictures surround library, tower and castle exercises, plus mansion and potion mini-games. Carved columns use actual fluted geometry, 48-sided cylinders and 64-segment decorative rings. Decoration is excluded from board framing and picking; room front remains open.
- More permissive framing uses 30% rather than 12% margins where the existing bounded camera can fit them. Extremely short viewports retain the safe 12% fallback.
- Game Development Studio skill was read; its `game-dev` executable is absent. Provider-based AI 3D mesh generation and its receipt workflow could not run. The new physical trim is code-generated geometry, not AI-generated mesh data.
- Geometry/projection tests provide no browser GPU visual or measured frame-rate evidence.
