# Mobile PBR memory allocation correction — 20 October 2026

## Root cause

The **Moonlight PBR memory budget exhausted** error is an application-owned `RangeError`, not a reported WebGL out-of-memory event. The old PBR bank greedily reserved up to 16 MiB for each 1024-pixel RGBA albedo/normal/ORM triplet (mipmaps included). Eight triplets therefore used the entire **128 MiB** iOS material-bank estimate. Each distinct surface type **and UV repeat factor** produced a separate triplet, so later materials could not be admitted, even though downsizing some existing triplets would have sufficed.

## Fix

The PBR bank plans its complete set of surface/UV variants whenever a new pair arrives or the user changes quality. The planner downsizes lower-priority textures first and retains 1K maps for priority surfaces where the budget permits. Old textures are replaced and disposed one pair at a time, with a reserved allowance for temporary old/new residency. Existing Babylon PBR material bindings follow each replacement. The estimate excludes WebGL driver overhead, the framebuffer, and geometry, so this is **not a guarantee of full-device memory usage**.

On iOS HD and Sharp continue using the **balanced texture tier** (up to 1024 pixels) while Sharp retains the native-density framebuffer. 4K texture maps remain selected-desktop-only; the user-selected viewport resolution is not reduced by this fix.

## Test coverage

- A mock Babylon bank receives 15 distinct UV-surface variants in balanced iPhone budget and cycles through HD, low and balanced, asserting bound textures stay valid, old textures are released and estimated peak remains within 128 MiB.
- The actual world is constructed in Babylon NullEngine with an iPhone user-agent and HD initial setting, then cycled through HD, Sharp, low, and HD.
- Existing full Moonlight graphics, startup, and production coverage checks remain required.
- The actual iPhone WebGL browser still needs visual and frame-time validation. A NullEngine test cannot verify physical GPU allocation or Safari thermals.
