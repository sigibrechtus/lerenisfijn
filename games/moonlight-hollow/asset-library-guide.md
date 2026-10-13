# Moonlight Hollow — 3D model collection and renderer integration

## Implementation status (13 October 2026)

The model manifest `assets/model-library.json` contains individually identified **35** externally supplied glTF 2.0 binary files, downloaded into `assets/models/kenney/<kit>/<name>.glb` by a GitHub Actions workflow after merging to main.

- Creator: Kenney, https://kenney.nl — **CC0 1.0 Universal**, source conversion at https://github.com/Hidencod/tge-assets.
- Source pinned to an exact 40-character commit in the manifest. The automated fetch checks each Git blob SHA-1, GLB header, version, declared byte length and size before committing the binary. Unknown or incorrectly licensed assets are rejected rather than silently copied.
- Source models are **efficient real 3D assets**, not automatically 4K/photorealistic. 4K refers to texture dimensions, and the best resolution varies with screen size, viewing distance and GPU budget.
- Blender can improve, optimize and export glTF models (GLB), but it does not automatically supply model licences. Astria creates 2D image/video references rather than verified animated 3D GLB objects.

## Current runtime wiring

`asset-library.js` is injected into `index.html` after the locally vendored, version-matched Babylon glTF loader, before `world.js`.

The runtime promises cache one import per model **per Babylon scene**, then clone the visual hierarchy. Loaded descendants have collisions and picking disabled, leaving the original collision volumes, train movement, exercise selections, question generation, scoring, checkpoint logic, character and camera controls intact.

The visual-upgrade hooks currently cover:

| Scene | Source geometry / target | Imported replacement |
|---|---|---|
| Main village | Pumpkin group | Carved pumpkin GLB |
| Main village | Rock and boulder instances | Rocks GLB |
| Exploration districts | Distributed path-safe decorative props | Gravestones, lanterns, coffins, crypts, mushrooms, fences, trees, benches, plants |
| Pumpkin Race | Gravestones and pumpkins at track edges | Graveyard-kit GLBs |
| Pumpkin Race | Ghost spectators, zombies | Character GLBs |
| Puzzle interiors | Noninteractive interior pumpkin decorations | Carved pumpkin GLB |

Gameplay-critical signs, control buttons, illuminated puzzle objects, train entry points, train cars, hero rig, fences serving as boundaries, racing gates, track mesh, and first-person cockpit remain procedural until model geometry/rigging and camera-safe bounds are specifically validated. These are **not yet 4K-upgraded**.

## Performance / reliability rules

- On HTTP import, plugin or decoder failure, preserve existing procedural objects and gameplay.
- Do not give decorative models collision and interaction ownership.
- Low quality: procedural fallback; balanced: limited model substitution; high: larger model population.
- Cache model imports and clone for instances. Load on demand and discard with the Babylon scene.
- Keep meaningful LOD tiers, compressed 1K/2K/4K PBR textures where appropriate, and texture memory caps.
- No full 4K texture set on distant or repeated objects. Avoid heavy models on mobile.
- WebGL frame rate, GPU memory, screen occlusion and actual visuals must be tested on supported devices after binary assets are present. Passing a static code audit does **not** prove rendering quality.

## Remaining 3D production work

1. **Inspect live assets:** ensure local GLBs exist after GitHub Action; run browser load tests; confirm mesh axes, topology, shading, native GLB material and shadow integration.
2. **Materials:** per-object albedo, tangent normal, roughness, metallic, ambient occlusion; prefer glTF material standard with texture mipmaps. Where hero assets need real 4K resolution, convert to KTX2 and provide smaller texture sets for low/balanced.
3. **Characters:** replace animated hero, creatures, broom rider and train with properly rigged/skeleton animated assets, preserving hitboxes, camera, focus targets and accessibility.
4. **Buildings:** construct coherent villages, castle, clock tower, train car and indoor ceilings/floors from modular GLBs. Preserve doorway clearance and half-dome UV projection.
5. **Minigames:** validate every race gate and question plaque for legibility and visibility, terrain elevation clearance, every checkpoint, finish and run-out hazard. Keep independent gameplay colliders.
6. **Cross-platform QA:** desktop WebGL2 and iPhone Safari, FPS, memory, scene disposal, offline-cache behaviour, accessibility and regression checks.
7. **Custom generation:** only if stock/CC0 models fail the artistic requirement, create concepts/reference materials using Astria, then model in Blender or a dedicated 3D provider, export and validate a licensed GLB, record metadata in manifest, test and vendor.

## Reputable external sources for the next asset pass

- Kenney Graveyard Kit: https://kenney.nl/assets/graveyard-kit — stylized CC0 objects matching the family-friendly Halloween tone.
- Kenney Nature Kit: https://kenney.nl/assets/nature-kit — terrain scenery.
- Kenney Castle Kit: https://kenney.nl/assets/castle-kit — structures and architecture.
- Poly Haven: https://polyhaven.com/models — many CC0 PBR models and 4K+ textures; individual assets must be assessed for runtime suitability.
- Quaternius: https://quaternius.com — free/open game-oriented 3D packs; verify per-pack licence.
- Blender: https://www.blender.org — open-source 3D editor for topology, rigging and GLB export.

**Verification boundaries:** The source index and code integration are committed to the feature branch. The verified GLB files are written by a separate CI job after this change merges. A CI result proves byte integrity only; live WebGL rendering requires an additional test.
