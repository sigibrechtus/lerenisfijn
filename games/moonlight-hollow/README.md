# Moonlight Hollow — The Lantern Chronicles (3D)

A browser-native third-person educational Halloween adventure in Leren is fijn. Original procedural 3D artwork; Babylon.js 9.30.0 is vendored with its Apache 2.0 license. No external runtime graphics CDN, advertising or child account required.

## Play

Move using WASD/arrows, click/tap the ground or the touch joystick. Right-drag to orbit the camera. Approach a region lantern and choose Discover / Ontdek / Découvrir, or press E. The star map provides navigation to each region. The Moon Express provides a gentle train ride. All essential object actions also support tap and keyboard selection.

Thirty persistent discoveries form five six-quest chapters. Nine puzzle families cover quantities and decomposition, sequences, fractions, words, riddles, deduction, clock time, routes, repeating patterns and mirror mechanisms. Language activities have independent Dutch/French vocabulary. Riddles and deduction complement the original learning engine. Three difficulty levels plus independent adaptation per region. Supported success restores the world and advances the story; it does not count as independent mastery. Completed quests remain available for practice with deterministic variations.

## Architecture

- `engine.js`: existing arithmetic, language, time and reflection validation.
- `campaign.js`: original chapter structure, deterministic task generation, skill adaptation and completion state.
- `world.js`: 3D artwork, animated player/ghost, camera, movement, picking, dragging, world puzzle objects, reduced motion and quality scaling.
- `camera.js`: tight third-person tracking, safe activity viewport and perspective fit of all exercise objects.
- `adventure.js`: Dutch/French interface, quest dialogue, profiles, avatar choices, narration and storage.
- `audio.js`: original recorded soundtrack/effects, browser audio startup, regional mixing and playback diagnostics.
- `sw.js`: same-origin offline caching after a successful initial load/cache installation.

The prior v1 save remains intact. Its valid practice events are imported into the v3 profile and legacy draft retained for recovery; the new story begins at quest one because the previous app did not track campaign quests. Distinct v3 child profiles retain appearance, position, events and unfinished tasks. No account synchronization. Save failures are reported in the star map. The prior 2D game remains available at `legacy.html` as a clearly labelled compatibility option when WebGL is unavailable; it retains its prior save key.

## Audio and rendering

Audio begins after interaction, with separate music/effects controls. Eight original locally rendered musical arrangements vary by area; effects use stereo panning. No third-party recordings or licensed character assets. Speech uses available device voices; availability varies.

High quality uses device-aware rendering with anti-aliasing, shadows, glow and soft fog. Economy quality lowers resolution and disables glow. Automatic quality falls back when sustained frame rate is low. Full HD is a target on suitable displays/devices, not a performance guarantee. Artwork is stylised procedural geometry rather than externally modelled film-quality assets. No combat, timers, loss of earned progress or daily streaks.

## Validation

`node --test tests/*.test.cjs` and `node --check games/moonlight-hollow/{campaign,world,adventure}.js`.
Campaign tests cover 18,000 generated tasks across 30 quests, both languages and all difficulty levels, alternative routes, repeated-letter identity, hint-aware proficiency, deterministic saves and completion uniqueness. Browser checks and real iOS/Android testing are separate from pure correctness checks. Learning improvement and unaided use need repeated child usability testing.

The cloud browser reports WebGL unavailable. Live 3D rendering/performance remains unverified there. Scene/puzzle construction is checked separately using Babylon NullEngine and actual canvas text textures; this is not visual proof.

Release checks: 28 repository tests pass; 18,000 generated campaign tasks checked. Babylon NullEngine constructed the world and all 180 quest/language/difficulty combinations successfully (1,006 base scene meshes). NullEngine exercises scene logic and geometry, not GPU rendering. AI Music Maker returned insufficient credits; original synthesized music remains active. Animation Maker and Image to Video supplied motion guidance; no video-render API was exposed. The custom outdoor environment uses original procedural meshes, with no paid Meshy submission.

## Complete audio release

Eight original 16-bar instrumental music loops: menu, village, woods, garden, library, tower, castle and festival. Six ambient beds and thirty distinct Foley/magical effects. All files are rendered locally with deterministic original synthesis; `tools/render-moonlight-audio.py` reproduces them. The audio manifest records duration, tempo and provenance. No external music-generation account or samples are required.

`audio.js` provides gesture-unlocked Web Audio playback, crossfaded regional music/ambience, separate buses and volume controls, master mute, narration ducking, stereo effects, rate-limited footsteps, bounded voices, background suspension and cached offline playback. Settings include previews for all tracks/effects. The compatibility game also uses the new soundtrack and effect bank.

33 repository tests pass. All fourteen MP3 tracks decode and have finite bounded samples; all thirty WAV cues are validated for format, silence/clipping and quiet endings. Device speaker output and 3D spatial triggers require real-device validation.

## Browser audio startup (v6)

The visible Sound button and the Enable sound action in Settings explicitly unmute the game and restore either zero-volume channel to an audible default. Nonzero saved volumes are preserved. New profiles start at music 45% / effects 65%. All child progress remains unchanged.

On browsers exposing `navigator.audioSession`, the audio engine requests `playback` before creating its AudioContext. Safari also receives a synchronous silent source start and `resume()` during the user gesture, with touchend/click recovery as well as pointer/keyboard activation. Unsupported audio-session APIs do not block playback. Regional loop loads are deduplicated; leaving a region cancels stale transitions. Hiding the page cancels pending effects and stops active one-shots.

Settings previews measure the output signal after the master compressor. A detected signal confirms browser audio processing; it cannot confirm device volume, speaker routing, or what a child actually hears. Blocked contexts, mute/zero-volume settings, silent output and file-loading errors have distinct messages. Nine additional playback regression tests cover gesture ordering, suspended contexts, delayed loads, region changes, destination routing, background cancellation and preview diagnostics. Browser/real-device checks remain separate from these tests.

## Follow and exercise framing (v7)

The exploration camera keeps its orbit offset while moving its target with the player, rather than recalculating the orbit around a moving target. Follow smoothing catches 95% of a positional change in approximately 125 ms; orbit-input inertia is reduced and the default chase distance is 14 world units.

Entering an activity makes a 550 ms eased move into a framing view calculated from every exercise mesh, including its labels, choices, draggable sources and destination objects. The platform fits the activity rather than imposing one fixed board size. Perspective fitting includes object depth and a 12% margin. The active viewport excludes the header and the exercise panel; object selection controls now sit inside that panel. ResizeObserver refits the view after hints, layout changes and screen rotation. The framing envelope can expand for new objects, but does not shrink or bounce after each answer.

Unrelated village geometry and the avatar are excluded from the close-up layer to avoid obstructing the activity. All world state is retained. Leaving restores the full-screen world, collision checks and the player's orbit with a 450 ms transition. Reduced-motion mode applies the new view immediately.

`node --test tests/*.test.cjs` checks the pure calculations and existing learning/audio logic. `NODE_PATH="$CODEX_PRIMARY_RUNTIME_NODE_MODULES" node tests/moonlight-camera-scenes.cjs` additionally checks real Babylon NullEngine geometry and projections for all 30 quests, both languages, three levels, initial and solved states across six desktop/phone/tablet layouts, plus animated entry and resizing. These checks verify that mesh corners lie inside the intended frame; they do not constitute GPU or real-device visual validation.

## Touch controls and graphics (v8)

Exploration uses a larger safe-area-aware joystick with a 12% dead zone and proportional walking speed. Keep the left thumb on the joystick while dragging anywhere in the exposed world with another finger to orbit. Spread two fingers on the world to zoom in; pinch together to zoom out. Short stationary taps retain tap-to-walk. Camera drags and pinches never issue walking destinations. Pointer ownership, capture loss, cancellation, screen rotation, backgrounding and dialogs reset movement. Dutch and French help text describes these gestures. Exercises retain their dedicated object dragging and automatic complete framing; returning restores the exploration orbit.

The renderer uses original wood-grain, masonry, plaster and roof textures, a twilight gradient sky, smoother major silhouettes, ACES tone mapping, restrained contrast and FXAA. High quality uses 2048-pixel shadow maps; balanced uses 1024 and Economy uses 512. Small decorative objects retain simpler geometry. Automatic quality starts balanced regardless of touch input and may reduce or recover quality after sustained measured frame times. Pixel budgets cap framebuffer work at 4.2, 2.4 and 1.1 million pixels respectively. High-density phones can render above CSS resolution instead of being automatically downscaled to their minimum tier.

Verification includes the controls/graphics regression tests, the existing campaign/audio tests, and Babylon NullEngine world-level input tests:

```sh
node --test tests/*.test.cjs
NODE_PATH="$CODEX_PRIMARY_RUNTIME_NODE_MODULES" node tests/moonlight-touch-scenes.cjs
NODE_PATH="$CODEX_PRIMARY_RUNTIME_NODE_MODULES" node tests/moonlight-camera-scenes.cjs
NODE_PATH="$CODEX_PRIMARY_RUNTIME_NODE_MODULES" node tests/moonlight-world-smoke.cjs
```

NullEngine confirms movement, camera gestures, zoom limits, quality settings, scene construction and exercise projections; it does not render GPU pixels. The available cloud browser reports WebGL unavailable. GPU appearance, real touch behavior and performance on iOS/Android remain unverified on physical devices.

### Secondary review (v9)

Automatic quality now includes repeated active-frame stalls above 250 ms in its performance measurements. An isolated resume gap above one second is ignored; recurring very long frames within six active seconds still lower quality. Regression checks cover steady slow frames, repeated stalls, recovery, and the isolated-gap guard. The graphics dependency and offline cache are versioned for this fix.

## Moon Express passenger ride (v11)

Two terminal platforms serve Dorpsstation / Gare du village and Maantoren / Tour de la Lune. Approach the parked train's platform and use the boarding button or R. Boarding takes 1.2 seconds in first person; the 12-second ride smoothly accelerates and brakes, then holds at zero speed for one second before disembarking. The train remains parked at its arrival station, supports a return journey, and stores its last completed station per child profile. Mid-ride reloads restart from the last completed station.

The open carriage has a floor, seats, window framing, roof, rolling wheels, and boarding steps. The track corridor is clear of generated trees. The explorer, Lumi, and onboard camera use train-relative transforms: passenger movement cannot independently drift, walk off the carriage, or separate from the train. Motion uses a deterministic kinematic rail constraint with smooth velocity and distance-driven wheel rotation, rather than a rigid-body simulation. Swipe or right-drag to look around onboard. Dialogs and backgrounding pause travel; returning restores the exploration camera and controls. Map travel and profile changes detach passengers safely. Reduced-motion mode retains transport without camera shake or passenger bobbing.

Rail motion tests cover acceleration, braking, both directions, frame-rate independence and saved station restoration. NullEngine integration checks boarding, passenger attachment, pause, onboard look, stopped arrival, return travel, teleport interruption and profile reset. GPU rendering and physical-device behaviour require separate verification.
