# Moonlight Hollow — complete 3D asset production pipeline

**Status, 13 October 2026:** A 299-component code inventory, 18 asset families, one source-built locomotive, per-family status tracking, and CI verification have been implemented. The other families are **not yet modelled**. The GLB importer and PBR materials require final live WebGL checks.

## Asset contracts and folder locations

Each unique **standalone** object is tracked independently of its low-level mesh components. Individual window mullions, rivets or fog particles do not each require 20,000 triangles; the 20,000-triangle requirement applies to each detailed *source asset/prefab*. At runtime, 20K triangles must not be compulsory for every visible instance—LOD meshes and instancing are essential, especially for iPhone browsers.

- Asset production registry: `assets/production-registry.json` (source paths, mesh names, family, stage, requirements).
- Source-model builds: `tools/generate_<asset>.py`, or reproducible Blender scripts; binary results live under `assets/models/custom/<asset-id>/`.
- Concept/reconstruction reference images: `assets/models/custom/<asset-id>/reference-views/view-000.png`, 045, 090, 135, 180, 225, 270, 315.
- Hero: `assets/models/custom/<asset-id>/<asset-id>-hero.glb`; mobile/LOD: separate lower-resolution GLB.
- Albedo, normal and ORM: `assets/models/custom/<asset-id>/textures-4k/` (linear normals/ORM, sRGB albedo).
- Production verification report: `assets/models/custom/<asset-id>/model-report.json`.
- Real-time replacement hook: `asset-library.js` production model table and `world.js`, `mini-game-world.js`, `interiors.js` as appropriate. Preserve picking and physics proxies.

## Eight-view image workflow — per model, not per illustration

1. Write one precise asset brief: semantic role, scale in metres, placement, axes, animations, interactive hitboxes, materials and variant states.
2. Generate **one canonical design** with front/side/back shape specification; approve it before generating new views.
3. Generate eight views of the **same canonical object** at yaw angles 0°,45°,90°,135°,180°,225°,270°,315°. All use orthographic or controlled perspective, **identical focal length, camera elevation, model scale, surface features, lighting, no props, consistent diffuse setup and neutral background**. Never use unrelated images as though they are calibrated multiview photographs.
4. Verify identity consistency before 3D conversion: same wheel count, windows, doors, ornament positions, colour/material IDs and proportions in every view. Independently generated AI frames cannot be assumed geometrically identical.
5. Reconstruction candidates: a dedicated multi-view image-to-mesh model with an inference endpoint; an SDF-based model (the user-provided DeepSDF reference), or Blender manual/procedural asset construction. Validate a real model artefact before acceptance. The referenced DeepSDF DINOv2→latent→SDF→marching-cubes architecture returns geometry, **not guaranteed correct PBR texturing, rigging, source-model fidelity, 20,000 meaningful faces or production-ready UVs**.
6. Use Blender for hole repair, silhouette inspection, normals, watertight/non-manifold analysis as relevant, UV unwrapping, topology optimization, texture baking, GLB export, and animation rigs. The **source high-detail mesh must contain at least 20,000 actual triangular faces** for modelled families; measure triangles rather than assuming image resolution causes polygon density.
7. Generate true per-material 4K baseColor/albedo (sRGB), normal (linear), occlusion (linear), roughness (linear), metallic (linear). In glTF standard ORM packing use R=occlusion, G=roughness, B=metallic. Physically plausible materials require correctly assigned UV coordinates and channel interpretation; do not paint these maps from an unaligned composite sheet.
8. Generate LOD0 source, LOD1 desktop and LOD2 mobile variants; apply KTX2 compression where possible, generate mipmaps and validate GPU memory draw-call counts.
9. In Babylon.js: asynchronously load the GLB, reuse where possible, preserve interaction metadata, collider proxies and AI pathing, and position/scale against the world. Verify shadows/reflections/lighting, material exposure, camera occlusion, train/broom gameplay, and scene disposal. Always retain procedural fallback.
10. Run smoke/regression tests and render eight **actual model** views as inspection outputs, then advance production stages only on real evidence. Tag assets as fully integrated only after WebGL/mobile QA.

## Moon Express — first production specimen

- Detailed model generator: `tools/generate_moon_express.py`
- Deterministic orthographic diagnostics: `tools/render_moon_express_views.py`
- GitHub build/validation workflow: `.github/workflows/moonlight-train-production.yml`
- 20K-triangle assertion, GLB header verification, mesh count check, 4096×4096 texture check, eight diagnostic outputs.
- Two actual LOD meshes; loader switches by initial graphics quality. 4K maps loaded only in high quality when GPU texture capabilities allow.
- Existing train physics/rail timeline/boarding/first-person camera remain authoritative. The artwork is hidden during first-person rides to avoid blocking the current camera; this is an **interim compromise**, not complete cockpit reconstruction.
- The locomotive currently has non-rigged moving wheel geometry: the procedural wheel logic still drives the original wheel proxies, but the imported artwork requires future animation synchronization.
- The geometry is an **original procedural train** visually inspired by reference images. It has not undergone external image-to-3D reconstruction and is not claimed to match every stylized illustration detail.
- Live WebGL QA, camera ergonomics and real-device GPU performance **remain open**.

## Coverage gates and progress tracking

The initial static audit covers five 3D-producing JS files and **299 unique source mesh identifiers** in 18 families. The extraction is by literal identifiers; dynamically constructed names, imported GLBs and future assets require manual review too.

`node tools/check_production_registry.cjs` checks that every discovered literal component is in the registry, and that no records are stale. GitHub Actions reruns that check when relevant scene files change.

An asset may be marked `complete` only if its eight canonical references, geometry triangle-count proof, 4K PBR files, GLB & UV validation, LOD exports, Babylon runtime integration, camera/collider/interaction tests and live WebGL mobile and desktop QA have all passed. **Automated catalogue coverage is not the same as completed production.**

## Production order, by gameplay impact

1. Moon Express locomotive, wagons, station and tracks
2. Main playable character, ghost companion and creature species (animated rigs)
3. Castle, clock tower, cottages, greenhouse, other destination structures
4. Pumpkin Race car, gates, finish line, dynamic finish hazards and track dressing
5. Indoor mini-game furniture, interactive puzzle objects and readable signage
6. Trees, foliage, stones, water features, fences, lanterns and remaining world props
7. Particle effects, HUD assets, tiny noninteractive details and final scene composition

Apply the full asset contract **to each distinct prefab** under each family. Reuse prefabs with instances, variations and LOD; do not multiply the number of underlying meshes for every visible copy.

## Review of suggested Hugging Face method

The referenced project: https://huggingface.co/spaces/bobthebuilderinternational/image-to-3d-deepsdf
and related dataset: https://huggingface.co/datasets/bobthebuilderinternational/hypernet-image-to-3d-data

Its public documentation describes DINOv2 features, diffusion prediction of a 64-dimensional latent shape, DeepSDF decoding and marching cubes. It is a possible experimental first-pass geometry generator; it does not on its own fulfil high-detail textured locomotive reconstruction, complex articulations or production-grade PBR. If used, record exact model/checkpoint licence, quality and output geometry metrics in the asset registry.

No external GPU image-to-3D inference was executed in this change; high-quality production models must not be marked generated merely because a website exists.
