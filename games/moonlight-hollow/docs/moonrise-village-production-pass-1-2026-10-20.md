# Moonrise — Haunted Village: First playable 3D production pass
**Date:** 20 October 2026  
**Surface:** Moonlight Hollow > Broom Flight / Bezemvlucht > Level 1  
**Status:** Source integrated, CI-validated; iPhone and desktop WebGL artistic acceptance open.

## What is genuinely integrated

- Level-one-only `moonrise-village.js` scene dressing, loaded by `mini-game-world.js`.
- Twelve small architectural houses with pitched roofs, timber posts, lit windows, doors, chimney stacks and terrain-reaching stone foundations. These are **procedurally authored geometry**, not imported hero-quality buildings.
- Sixteen twisted trees, fourteen street lantern assemblies, eighteen pumpkin decorations, long low fences, two sets of bridge plinths, and two moonlit streams under the uninterrupted road.
- Warm, shadow-free point lights (two at low quality, four at higher quality), emissive window materials, and the existing Babylon PBR material infrastructure. Scene fog/blur remain disabled.
- Eleven optional placements of **already shipped, CC0 Kenney glTF assets** (carved pumpkins, crooked pines, lanterns, rocks, towers, gravestones, ghost); low-quality profile avoids the extra GLB loads. Import requests are async and rebuild/disposal guarded.
- All new procedural meshes are tracked in `assets/production-registry.json`.
- The central 3D flight corridor is reserved for readable education gates; background village housing is outside the usable flying lanes.
- Existing course, gate collision, checkpoint recovery, and controls are intentionally unchanged.

## Scope and acceptance boundaries

This is **pass 1**, replacing empty primitive scenery with a coherent first-level village, not a complete AAA scene. The houses are still procedural, existing Kenney GLBs are stylized low-poly rather than new 20k-poly bespoke buildings, and no new 4K-baked textures or lightmaps were produced. A future approved asset-production pass can replace cottage/tower meshes and author custom atlases without changing the course contract.

Unit and Babylon NullEngine tests cover integration, mesh family counts, model catalog availability, iPhone-friendly bounded mesh count, full corridor clearance, level gating, camera switching and cleanup. GitHub Pages checks publishing; CI cannot confirm that async GLBs loaded successfully on actual iPhone hardware or that final materials, lighting and framerate meet visual targets.

## Next production gates

1. Obtain at least one real iPhone Safari and desktop WebGL screenshot for the Moonrise level from first-person and third-person perspectives; inspect gate readability and clutter.
2. Check `scene.metadata.moonrise`, live GLB instance count and GPU/frame timings in both balanced and high quality.
3. Based on that evidence, author replacement modular 3D cottages and a detailed bridge, and add professionally baked PBR maps.
4. Add appropriate LOD/instancing if measured draw-call counts need reduction.
5. Only then reuse the same environment-production workflow for Ghost Slalom and Witch's Slalom.
