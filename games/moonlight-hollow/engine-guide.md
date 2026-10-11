# Godot or Babylon for Moonlight Hollow?

**Recommendation: keep Babylon for this browser/website product.** This is a project decision, not a universal speed ranking. Existing scenes, JavaScript learning rules, DOM controls, saves, offline caching and tests can be improved directly. Godot would require a separate port and migration validation; changing engines would not itself repair framing, fog, labels or task length.

| Consideration | Babylon | Godot |
| --- | --- | --- |
| Current project | Already integrated with the website | Requires a port and migration checks |
| Browser renderer | WebGL and WebGPU supported; choose before scene creation | Current stable export: WebAssembly + WebGL 2.0 Compatibility; no web Forward+/Mobile or WebGPU |
| Scripting | JavaScript/TypeScript fits this application | GDScript fits web export; Godot 4 C# currently cannot export to web |
| Workflow | Code-first web development and Blender asset pipeline | Integrated scene/game editor supports editor-led development |
| Native desktop/mobile becomes primary | Reassess native delivery needs | Strong candidate for a separate native game with platform export workflow |
| Models | glTF 2.0/GLB, animation, PBR and compressed codecs | glTF 2.0/GLB recommended; .blend import calls installed Blender to export glTF |
| Speed decision | Measure actual target scenes/devices | Measure equivalent exported scenes on the same devices |

Godot's single-threaded web export avoids multithreaded cross-origin isolation requirements. Its default web Sample audio mode has effect/positional limitations; Stream playback offers more features with latency tradeoffs. Babylon WebGPU offers modern capabilities, but detect availability before creating the scene and retain a tested WebGL fallback. This update retains the current WebGL engine.

## Asset pipeline

Keep `.blend` editable sources and export production models as glTF 2.0 `.glb` with animation clips, correct scale/pivots, UVs, normals and simple collision proxies. Browsers load exported assets. Use polygons for silhouettes/close shapes and normal maps for fine relief; texture resolution does not increase polygons.

Prepare base-color, normal and roughness/metalness maps, with occlusion where useful. Prefer 1K common surfaces, 2K prominent nearby assets and 4K only where screen coverage and memory justify it. A 2048 RGBA map uses about 16 MiB before mipmaps; albedo + normal with mipmaps approach 42.7 MiB. Share repeated maps, use instancing, cull distance and measure download size, load time, texture memory, draw calls and frame-time percentiles on phones/desktop.

For imported assets, consider Meshopt/Draco and KTX2/Basis compression. Babylon supports these glTF extensions and recommends hosting decoder resources yourself. Compression and WebGPU require validation; neither is a guaranteed frame-rate improvement.

## AI Banana

The [suggested generator](https://aibanana.net/tools/ai-texture-generator) advertises seamless 4K PNG output and describes albedo/diffuse images with separate derivation of other PBR maps. Its landing page ties full commercial rights to a paid plan. The [general terms](https://aibanana.net/en/terms) state user content ownership while licensing usage/storage/display to the service. Confirm the intended plan rights, seam quality and map consistency before using generated assets in a shipped game.

This update uses original deterministic offline textures. No AI Banana account, paid generation, license acceptance or showcase copying was performed.

## Primary sources checked

- [Godot stable web export](https://docs.godotengine.org/en/stable/tutorials/export/exporting_for_web.html)
- [Godot 3D formats and Blender import](https://docs.godotengine.org/en/stable/tutorials/assets_pipeline/importing_3d_scenes/available_formats.html)
- [Babylon WebGPU support](https://doc.babylonjs.com/setup/support/webGPU)
- [Babylon glTF and compression](https://doc.babylonjs.com/features/featuresDeepDive/importers/glTF)
- [Babylon specifications](https://www.babylonjs.com/specifications/)
- [AI Banana texture generator](https://aibanana.net/tools/ai-texture-generator) and [terms](https://aibanana.net/en/terms)

Checked 11 October 2026. Provider/engine facts can change; the recommendation and asset budgets are engineering judgments.
