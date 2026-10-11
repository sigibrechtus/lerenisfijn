# Indoor artwork and online AI mesh verification — v27

Checked 2026-10-11. No Game Development Studio tools used in this verification.

## Indoor fixes

- Corrected the AI panorama texture's vertical orientation (`invertY=true`) and enabled trilinear mipmaps.
- Preserved the 3:1 artwork aspect ratio in the main mural and framed pictures. Side walls crop the image instead of compressing the entire panorama.
- The optics exercise uses a top-down camera, so vertical murals were outside its view. Added two horizontal framed artwork panels above the board surface and included their bounds in camera fitting.
- Updated script/cache versions to v27.

## Verification and limits

Actual Babylon.js 9.30.0 mesh geometry, world matrices, UVs, textures and camera matrices were exported with NullEngine. An independent native EGL renderer (Mesa llvmpipe LLVM 20.1.2) rasterized them with a simplified diffuse shader. Visual inspection found upright visible artwork and framed pictures in all six scenes. A depth-tested mask counted visible artwork/trim pixels:

| Scene | Visible scenery pixels at 1440 × 900 |
| --- | ---: |
| Library | 234,300 |
| Tower | 319,110 |
| Castle pattern | 262,779 |
| Castle optics | 17,556 |
| Mansion | 212,259 |
| Potions | 384,431 |

This establishes geometry placement, UV orientation and visibility in the tested layouts. It does **not** establish exact Babylon lighting, bloom, device performance or full browser rendering. The available browser reported WebGL unsupported and could not start the game. An actual WebGL-capable browser check remains outstanding.

Existing integration checks pass: 2,172 projection checks and 13,476 actual Babylon picks over six screen layouts; 612 mini-game signs inside safe frames; all six mini-game completion flows, vehicle controls and resource disposal.

## Online AI mesh test

Meshy documentation was checked at https://docs.meshy.ai/en/api/quick-start. Its API requires authentication; no Meshy key is configured here. No Meshy generation claim is made.

A new model was generated online through Tencent's public Hunyuan3D-2mv Turbo Space: https://huggingface.co/spaces/tencent/Hunyuan3D-2mv. An original AI-generated pumpkin lantern image was supplied as its front image. Job `6e635b9b2b49415fadbeca2ae795d74a` completed with shape model `tencent/Hunyuan3D-2mv/hunyuan3d-dit-v2-mv-turbo`; 5 steps, guidance 5, seed 1234, octree resolution 256, background removal enabled. The Space's texture generation was unavailable.

| Check | Provider GLB | Cleaned/simplified test copy |
| --- | ---: | ---: |
| Bytes | 14,168,156 | 480,540 |
| Vertices | 250,030 | 9,978 |
| Triangles | 930,544 | 19,994 |
| Near-zero-area faces (<1e-12) | 430,454 | 0 |
| Authored textures | 0 | 0 |
| Vertex normals | Missing | Generated and exported |
| Watertight | No | No |
| Finite positions / valid indices | Pass | Pass |
| Winding consistency | Pass | Pass |

Removing degenerate/duplicate faces leaves a watertight 500,108-triangle original before simplification. Quadric decimation and removal of degenerate faces then produce the test copy; limited hole filling repairs one triangle but does not make this copy watertight.

Both GLBs successfully imported using the standard Babylon.js 9.30.0 GLTF loader in NullEngine. Three front-facing rays hit each imported mesh; index/position checks and scene disposal passed. Generated normals are finite in the optimized copy. These are loader/picking checks, not GPU rendering checks.

Independent EGL renders at three angles show a recognizable pumpkin lantern and handle, with distorted surface details and considerable loss of the reference's fine ornamentation. The orange color in the test render is a flat test material, **not** an AI-generated texture. The test model has not been added to gameplay: it needs better detail reconstruction, authored textures and remaining topology work. No device FPS claim is made.
