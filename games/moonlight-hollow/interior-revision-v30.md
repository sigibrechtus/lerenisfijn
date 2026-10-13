# Curved indoor environments — 13 October 2026

Replaces the v27 flat murals and top-view pictures with an open-front quarter-ellipsoid shell: 180° azimuth, 90° elevation, horizontal radius 28 and height 18 scene units. The shell has one shared zenith vertex rather than degenerate pole triangles. Camera fitting ignores environmental decoration and continues to frame playable objects.

The old image contained a perspective floor and was not a spherical panorama. It is retained for provenance but no longer used on room walls. The built-in image-generation skill produced two reference-led assets:

- `assets/interior-dome-v30.webp`: native 1774 × 887, 736,724 bytes. Prompt: preserve the enchanted library's amber/plum architecture; produce a 180° × 90° wall/ceiling panorama segment, exclude all visible floor and freestanding gameplay props. This is stylized AI artwork, not a calibrated photographic panorama.
- `assets/interior-floor-v30.webp`: native 1254 × 1254, 686,122 bytes. Prompt: orthographic top-down worn flagstone albedo coordinated with the reference, no perspective, directional lighting, furniture or symbols. Mirrored texture wrapping prevents unmatched source edges producing discontinuities.

The floor is a separate horizontal surface extending through the open front. Top-view optics receives only this floor: no dome, walls, ceiling, framed images or decorative props. Its optical components remain fully visible and pickable.

Each perspective interior has four real, code-generated ribbed pumpkin meshes with stems and two geometric lantern pedestals. Their bases rest on the floor and they remain outside the interaction corridor. The existing indoor mini-game pumpkins at z=23 and outdoor moon are omitted because they fall beyond the room or conflict with the backdrop. Potion tables/bottles and mansion cabinets remain physical meshes. No Hunyuan test model is imported into gameplay.

## Checks

- Quarter-dome positions lie on the intended ellipsoid; UVs and normals are finite; no zero-area dome triangles.
- All room decoration is non-pickable, uses its owning layer/parent and releases shared textures/materials when the last room is disposed.
- Floor-only top-view branch checked with actual Babylon meshes.
- 2,172 projection and 13,476 picking checks across six layouts pass; 612 mini-game signs, all six completion flows and arena disposal pass.
- Native Mesa llvmpipe EGL rasterization of exported Babylon geometry, UVs, textures and actual scene camera matrices shows wall/ceiling and floor in the five perspective scenes. Depth-tested optics mask shows 691,303 floor pixels, zero dome pixels and zero decorative prop pixels at 1440 × 900.

Native renders use simplified shaders, not Babylon's browser lighting/bloom. The available cloud browser was rechecked and still reports that WebGL cannot open the game. Full browser/device rendering and frame-rate verification remain outstanding. No Game Development Studio tooling was used.
