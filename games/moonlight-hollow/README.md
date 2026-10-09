# Moonlight Hollow — The Lantern Chronicles (3D)

A browser-native third-person educational Halloween adventure in Leren is fijn. Original procedural 3D artwork; Babylon.js 9.30.0 is vendored with its Apache 2.0 license. No external runtime graphics CDN, advertising or child account required.

## Play

Move using WASD/arrows, click/tap the ground or the touch joystick. Right-drag to orbit the camera. Approach a region lantern and choose Discover / Ontdek / Découvrir, or press E. The star map provides navigation to each region. The Moon Express provides a gentle train ride. All essential object actions also support tap and keyboard selection.

Thirty persistent discoveries form five six-quest chapters. Nine puzzle families cover quantities and decomposition, sequences, fractions, words, riddles, deduction, clock time, routes, repeating patterns and mirror mechanisms. Language activities have independent Dutch/French vocabulary. Riddles and deduction complement the original learning engine. Three difficulty levels plus independent adaptation per region. Supported success restores the world and advances the story; it does not count as independent mastery. Completed quests remain available for practice with deterministic variations.

## Architecture

- `engine.js`: existing arithmetic, language, time and reflection validation.
- `campaign.js`: original chapter structure, deterministic task generation, skill adaptation and completion state.
- `world.js`: 3D artwork, animated player/ghost, camera, movement, picking, dragging, world puzzle objects, reduced motion and quality scaling.
- `adventure.js`: Dutch/French interface, quest dialogue, profiles, avatar choices, narration, original synthesized music/effects and storage.
- `sw.js`: same-origin offline caching after a successful initial load/cache installation.

The prior v1 save remains intact. Its valid practice events are imported into the v3 profile and legacy draft retained for recovery; the new story begins at quest one because the previous app did not track campaign quests. Distinct v3 child profiles retain appearance, position, events and unfinished tasks. No account synchronization. Save failures are reported in the star map. The prior 2D game remains available at `legacy.html` as a clearly labelled compatibility option when WebGL is unavailable; it retains its prior save key.

## Audio and rendering

Audio begins after interaction, with separate music/effects controls. Three original oscillator-based musical arrangements vary by area; effects use stereo panning. No downloaded music or licensed character assets. Speech uses available device voices; availability varies.

High quality uses device-aware rendering with anti-aliasing, shadows, glow and soft fog. Economy quality lowers resolution and disables glow. Automatic quality falls back when sustained frame rate is low. Full HD is a target on suitable displays/devices, not a performance guarantee. Artwork is stylised procedural geometry rather than externally modelled film-quality assets. No combat, timers, loss of earned progress or daily streaks.

## Validation

`node --test tests/*.test.cjs` and `node --check games/moonlight-hollow/{campaign,world,adventure}.js`.
Campaign tests cover 18,000 generated tasks across 30 quests, both languages and all difficulty levels, alternative routes, repeated-letter identity, hint-aware proficiency, deterministic saves and completion uniqueness. Browser checks and real iOS/Android testing are separate from pure correctness checks. Learning improvement and unaided use need repeated child usability testing.

The cloud browser reports WebGL unavailable. Live 3D rendering/performance remains unverified there. Scene/puzzle construction is checked separately using Babylon NullEngine and actual canvas text textures; this is not visual proof.

Release checks: 28 repository tests pass; 18,000 generated campaign tasks checked. Babylon NullEngine constructed the world and all 180 quest/language/difficulty combinations successfully (1,006 base scene meshes). NullEngine exercises scene logic and geometry, not GPU rendering. AI Music Maker returned insufficient credits; original synthesized music remains active. Animation Maker and Image to Video supplied motion guidance; no video-render API was exposed. The custom outdoor environment uses original procedural meshes, with no paid Meshy submission.
