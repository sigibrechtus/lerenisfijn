# Moonlight Hollow
A cosy Halloween learning adventure for Leren is fijn. Static, dependency-free browser game with Dutch and French text. Five connected areas restore village lanterns through grouping/decomposition, fractions, word construction, clock reading/elapsed time, repeating patterns and mirror routing.

## Controls and progression
Mouse/touch dragging has tap-select/tap-place equivalents. All puzzle actions have keyboard-operable buttons. The analog clock has optional dragging and hour/minute buttons. No timers, penalties, advertisements or random rewards. First-attempt accuracy and hints affect per-area progression. Five independent solutions in a block of six offer the next of three levels.

Each nickname has separate local progress and an unfinished-puzzle snapshot. This release has **no account synchronization**; the UI states that explicitly. Local storage failures show a warning. Offline assets are cached after a successful first visit. Cache readiness and real mobile offline behavior require device verification.

Music is an original procedurally synthesized celesta-like pentatonic loop; effects are generated with Web Audio. Separate music/effects sliders include zero. Audio starts with a user gesture and suspends in background tabs. Speech uses available device voices; unavailable speech exposes the word as a hint.

## Files
- engine.js: generation, answer validation, ray tracing and progression.
- app.js: scenes, direct manipulation, localization, profiles and audio.
- style.css: responsive fullscreen environment and accessible controls.
- sw.js: route-scoped offline cache.
- assets/village.webp: original generated environment; source artwork 1672 × 941.
- assets/card.webp: original Halloween concept thumbnail.

Environment editing prompt, built-in image-generation tool: “Preserve the moonlit Halloween village, castle, stream, pumpkins, paths, flowers and warm windows. Remove baked title, home/settings badges, inventory and stepping-stone plaques. Remove the foreground girl, ghost and firefly trail. Replace removed elements with matching scenery. Cosy panoramic storybook environment; no text or controls.” WebP compression retains source dimensions; this is not a native 4K render.

## Validation
Run node --test tests/moonlight-hollow.test.cjs and node --check games/moonlight-hollow/app.js from repository root. Generated-task testing covers every area, level and language, including clock equivalence, valid fractions, duplicate letter IDs, maximum pattern runs and solvable mirror paths.

This is a playable first release, not the full production scope in the design document. Multiple unique environment paintings, walkable character navigation, decorative inventory customization and optional parent-account synchronization remain future extensions. Educational effectiveness and unassisted usability must be established with children; automated checks do not demonstrate learning improvement.


Live browser checks passed for all five introductory puzzles, world unlocks through the five-lantern festival, pattern dragging, French localization, separate profile progress and persistence after reload. Real iOS/Android touch interaction and offline-disconnection behavior remain device validation items.
