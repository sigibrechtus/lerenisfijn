# Moonlight Hollow — The Lantern Chronicles (3D)

A browser-native educational Halloween adventure with first- and third-person exploration in Leren is fijn. Original procedural 3D artwork; Babylon.js 9.30.0 is vendored with its Apache 2.0 license. No external runtime graphics CDN, advertising or child account required.

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

## Mirror reflection and advanced optics (v12)

The drawn mirror tangent now agrees with the ray tracer. Thin, opaque, silver mirror faces reflect on the incident side using the surface-normal reflection law; direction arrows distinguish incoming and outgoing light. Ordinary mirrors do not transmit a second beam.

New level-3 mirror exercises provide four mounting points, three mirrors and one beam-splitting prism, with two target lanterns. The prism is specifically a simplified cube beam splitter with a diagonal semi-transparent interface: half the incoming intensity continues straight and half reflects by 90 degrees. This is not a rainbow-dispersion or refraction lesson. Children select a part from the Dutch/French stock controls or tray, tap a mounting point to place it, tap with the same type to rotate, and use the return tool to remove it. Replacement returns the previous part; exhausted stock cannot create extra reflectors. Reset restores the full stock. Both targets must receive light for success.

Existing numeric mirror answers and saved exercises remain supported. New answers store type and orientation explicitly. Tests check the reflection law from all four directions, actual rendered surface normals, opaque mirrors, both branches, inventory limits, replacement/removal, JSON restoration, reset, all generated campaign solutions and exercise framing. GPU appearance remains a separate verification requirement.


## Living Halloween atmosphere (v13)

Exploration starts at twilight and advances through a ten-minute sun/moon cycle. The sky gradient and steady world lighting change gently, stars fade in at night, and a Dutch/French badge names the time of day and weather. A separate three-minute cycle alternates clear conditions, gradual fog, and distant storms. Sparse lightning is a distant bolt with a small light pulse; an original soft rumble follows 1.4 seconds later and respects the effects volume and mute. `python tools/render-moonlight-thunder.py` regenerates this cue independently; the full soundtrack renderer also calls it.

Walking releases fading dust only when the explorer actually moves. The moving train leaves a short mist trail. Falling autumn leaves and an occasional friendly ghost wisp provide gentle Halloween events. All effects reuse a bounded geometry pool (35 additional meshes); Eco mode reduces active leaves. No effects take pointer input. The atmosphere clock pauses during exercises, dialogs and backgrounding. Exercises use their original steady light without fog. Reduced motion freezes the atmosphere clock and suppresses dust, mist, leaves, wisps and lightning; transport still works.

Tests cover periodic smooth cycles, fog bounds, sparse storm-only lightning, delayed thunder, pause/reduced-motion behavior, unfrozen celestial transforms, pooled movement effects, steady puzzle illumination and existing controls/rail/optics behavior. 2,172 exercise projection checks and all 180 scene-construction cases pass with NullEngine. GPU appearance and physical phone performance remain unverified.


## Exercise controls and expanded railway world (v14)

Implemented in four ordered steps: complete exercise controls, summon the empty train, expand terrain and settlements, then replace the straight railway with a six-station curved loop.

The castle route has labelled Right, Up, Undo and Clear controls in Dutch/French. Up now points toward screen top. Grid limits and the exact step budget prevent impossible steps; Undo and Clear let children retry. Shared pure actions provide DOM controls across all ten exercise types; full riddle names and numbered word-removal labels also appear in the 3D object navigator. Solved answers cannot be changed. Controls trigger a camera refit when the panel changes size.

Exercise locations move to 2.4 times their original distance from the centre, inside a 280-by-280 terrain mesh. Gentle hills and valleys surround level exercise pads and walking paths. Mountains form distant silhouettes. Terrain and character elevation use the same height function; the rail corridor stays level. Old saved positions scale once, tracked by a world version, while quests and completion events remain untouched. Old train station IDs 0 (centre) and 1 (Maantoren) remain valid; all six station IDs can now be saved. Regional music follows the new locations.

The closed railway serves the central village, Maantoren, Spooklichtkasteel, Fluisterbibliotheek, Pompoenpad and Tovertuin. Each has a platform, canopy, boarding steps, name sign, a connecting path and a call bell. Approach a station to call the train or choose a destination. C calls the train; R boards for the selected destination. Calls move the empty train along the shortest track route, without transporting the waiting explorer or changing their camera. Busy/duplicate calls and boarding an absent train are blocked. Arrival stops at the platform, then allows boarding. Calls and rides pause for dialogs/backgrounding/exercises.

Two continuous rails follow sampled cubic curves with instanced sleepers. Travel is parameterized by arc distance, with eased acceleration/braking and bounded speed. The train turns with the route, the wheels roll by traveled arc distance, and passengers/camera inherit its transform. This is a deterministic kinematic rail model, not a rigid-body simulation. First-person boarding/look controls and safe disembarking are preserved. A destination trip can pass intervening stations; it stops at the explicitly selected station.

Validation covers the actual DOM control controller with element doubles, all 180 exercise combinations in NullEngine, 2,172 projection checks, all 30 station pairs in the route model, calls and adjacent passenger rides at every station in the real scene, reverse travel, saved stations, pause, wheel distance, terrain elevation and track clearance against static collision geometry. A cottage was relocated to clear the library curve. GPU appearance, actual touch hardware and physical-device performance remain unverified; no Blender/GPU/video-rendering tool was available in this session.

## Four-direction castle routes (v15)

The castle exercise now has Up, Down, Right, Left, Undo and Clear in both the touch-friendly DOM panel and the 3D board. Movement may backtrack and continue past the requested step count while exploring; only grid boundaries disable a direction. The checker validates every intermediate position and still requires the star and the exact requested number of steps. Undo removes the last move, and Clear returns to the starting dot. Existing N/E saved routes remain compatible. Dutch/French instructions explain free exploration and the exact-step solution.


## Runtime/plugin audit — 10 October 2026

Inspected production commit c062a7f and retained static GitHub Pages hosting.

| Need | Existing implementation | Decision |
| --- | --- | --- |
| Smooth camera animation | camera.js easing and world.js interpolation | Retain; Tween.js would duplicate this behavior. |
| Train lifecycle | railway.js explicit idle/boarding/travel/arrival phases with guarded calls | Retain; XState adds no needed behavior to this bounded system. |
| Weather and movement effects | atmosphere.js, Babylon fog, bounded reusable dust/mist/leaf meshes | Retain; migrate to Babylon ParticleSystem only for a specific higher-density effect. |
| Rendering | Babylon DefaultRenderingPipeline, ACES, FXAA, glow, shadows, adaptive pixel budgets | Retain and profile before adding expensive post effects. |
| Sound | Local Web Audio buses, gesture unlock, lifecycle cancellation | Extend with PannerNode world emitters, distance attenuation and listener orientation. |
| Physics | Terrain sampling, obstacle checks, deterministic railway motion | Retain for current gameplay; a physics engine requires a concrete rigid-body mechanic. |

Spatial audio now follows the explorer position with the active view orientation, or the first-person camera aboard the train. Train sources follow the carriage during calls and rides; footsteps follow the explorer; thunder has a distant world position. Babylon left-handed Z is inverted consistently for Web Audio's right-handed coordinates. Music, ambience and UI feedback remain nonspatial. HRTF/inverse-distance panners support modern AudioParams and legacy setters; browsers without createPanner retain stereo playback. Existing volume buses, voice limits, mute, offline audio and pause cancellation are preserved.

Delivery: audit → bounded audio implementation → audio and scene regression checks → cache-version update → GitHub Pages deployment. Runtime changes do not introduce external services, npm dependencies or secrets.

The Game Development Studio CLI was unavailable in this session. Plugin directory discovery returned no applicable Babylon/Blender rendering integration; Render's hosting integration does not provide 3D rendering. No specialist GPU, physical-device or listening verification is claimed.

Primary references:
- https://doc.babylonjs.com/features/featuresDeepDive/animation/advanced_animations
- https://doc.babylonjs.com/features/featuresDeepDive/particles/
- https://developer.mozilla.org/en-US/docs/Web/API/PannerNode
- https://stately.ai/docs/quick-start
- https://github.com/tweenjs/tween.js

### Seasonal experience — release 17 (10 October 2026)

- `hud.js` owns seasonal presentation tokens and bilingual exercise guides independently of the learning rules and renderer. Halloween is the default; the Christmas interface palette can be selected in Settings. This setting changes the interface styling; the adventure, models and existing soundtrack remain the Halloween campaign.
- Every exercise presents its mission, specific instructions, labelled buttons, selected tools and live progress. The actual panel bounds continue to determine the unobstructed 3D camera viewport. Station destination, calling and boarding controls now share one panel.
- Retained all eight original music arrangements and six location ambience beds. Regional hysteresis prevents repeated crossfades at district boundaries, and the HUD identifies the playing track. Added deterministic local rain and wind sound beds, controlled by effects volume and master mute, with pause/resume and source cleanup.
- Added natural rain transitions and explicit clear/fog/rain/storm presets, camera-local precipitation, soft ground haze, gusting grass/leaves and wet material highlights. Particle capacity is bounded at 700; quality tiers select emission rates of 90/220/380 per second. Exercises clear rain and haze and retain steady light. Reduced motion disables animated precipitation, swaying and lightning.
- Added derived tangent-space normal maps for timber, masonry, plaster, roofs, cobblestones and rocks. Detailed cottage roofs, shutters, timber framing and steps; castle buttresses, battlements and an arched doorway; ivy, boulders, grass clusters and lantern garlands. Canopy clusters and grass use shared instanced geometry; optional scenery is reduced in Eco mode.
- Runtime remains the vendored Babylon.js 9.30.0, matching the upstream latest release inspected on 10 October. No new graphics CDN, build pipeline or paid asset provider was introduced. Blender and the Game Development Studio CLI were not available in this environment; the added meshes and surface maps are original procedural assets.

Validation: 74 unit/controller tests; 180 constructed and solved exercise scenes across two languages and three levels; touch movement, camera gestures, railway calls/rides, inventory and scene integration; weather cleanup, normal-map presence, reduced motion and quality emission budgets. Camera fitting checks cover desktop and portrait/landscape phone aspect ratios. These scene checks use Babylon NullEngine, not GPU rendering or device frame-rate measurements. The cloud Chrome browser also fails the existing production game's WebGL capability check, so 3D appearance and device performance require a WebGL-capable browser.

Framework references: https://github.com/BabylonJS/Babylon.js/releases/tag/9.30.0 ; https://doc.babylonjs.com/features/featuresDeepDive/particles/particle_system/ ; https://doc.babylonjs.com/features/featuresDeepDive/materials/using/materials_introduction/ ; https://doc.babylonjs.com/features/featuresDeepDive/mesh/copies/instances ; https://developer.mozilla.org/en-US/docs/Web/Media/Guides/Autoplay .

## Six attractions and exploration views (v19)

Six optional destinations extend the existing campaign: haunted mansion, potion workshop, broom flight tower, ghost garden, midnight railway depot and pumpkin rally. Each has an original 3D landmark, a clear entrance, a walking path and a Dutch/French sign. Use the attraction section of the star map to travel there, or walk up and choose Enter / press E. Entry is optional.

Each activity has three repeatable rounds, Dutch/French instructions and three difficulty levels. Mansion keys combine colors/shapes and deduction; potions use ingredient quantities; the garden orders seeds; the depot orders time schedules. Broom flight and pumpkin driving use physical movement to pass answer gates, with keyboard and held touch buttons plus selectable guidance toward a gate. Broom flight supports ascent/descent; the rally has acceleration, steering, braking and reverse. These are compact educational activities, not full racing or rigid-body simulations. Completed sessions and best levels save separately for each profile without changing campaign events. Incomplete mini-game sessions restart on re-entry.

Choose first/third person with V, the header button or Settings. First person has eye-height, camera-relative walking and right-drag/touch look; third person keeps the visible avatar and orbit controls. Preference is saved. Campaign exercises keep their fitted camera; train boarding keeps its existing view. Leaving any mini-game restores exploration and resets input. Backgrounding and dialogs pause movement.

`destinations.js` owns shared procedural scenery; `mini-games.js` owns deterministic rules; `mini-game-world.js` owns disposable Babylon activity scenes; `attraction-ui.js` owns entry, controls and profile integration. Terrain pads and approach routes are reserved from trees. No third-party model downloads or paid generation were used. The offline cache includes the new modules.

Validation includes deterministic activity generation, real Babylon NullEngine scene/gameplay/cleanup checks, 612 sign projection checks across portrait/landscape/desktop layouts, actual controller integration with DOM/runtime doubles, and first-person/exercise/train restoration tests. These verify logic, geometry and lifecycle; GPU appearance and physical-device frame rates remain unverified.

## Live operation animations and cockpit rally (v20)

Every enabled mini-game action has live Babylon choreography and an existing local sound cue. Water bottles tilt and pour droplets; powder falls into the cauldron; mixing circles the spoon and liquid. Mansion keys approach the lock and a correct key opens the door. Garden seed packets travel to their beds; train stops pulse and a correctly planned train departs. Answer gates respond to vehicle crossings. Undo, removal, reset, hints and pace changes have distinct visual feedback. Operations pause with dialogs/backgrounding, apply their result once after the animation, and ignore repeated actions while busy. Reduced motion uses short stationary feedback. A fixed 12/24-mesh particle pool is reused and disposed with the activity. No video downloads or external asset services are used.

The pumpkin rally now uses a cockpit camera that follows the car position and yaw. The player sees a dashboard, bonnet, steering wheel and windshield pillars; road marks and pumpkins provide movement cues. Wheels roll, steering responds, and a quiet original synthesized engine loop changes pitch with speed. The engine uses the existing effects bus and stops on mute, pause, completion or leaving. The racing HUD keeps the arithmetic riddle and round visible above the road, shows speed/gear/gate distance, places held steering/gas/brake controls at the bottom, and puts guided-driving assistance inside an optional panel. First/third-person exploration preference is restored after leaving.

Validation includes real NullEngine transformations for each operation, once-only deferred ingredient changes, frozen animation timing during pause, cockpit position/yaw and wheel/steering motion, wrong-gate recovery, reduced-motion behavior, bounded resources, speed-driven audio-loop reuse and shutdown, plus existing deterministic gameplay and projection checks. Browser GPU pixels, physical touch hardware and speaker output remain separate validation requirements.


## v21 — First-person controls, readable signs and exercise variety

Rally and broom cameras follow their vehicles. Rally keeps car steering, throttle, braking and reverse; flight uses lateral movement, forward/backward and E/Q altitude. Held touch controls sit on both sides of the screen, with flight altitude in the telemetry display. Releasing flight controls stops movement. Pause, exit and advancing to a new question neutralize input. Guided travel is labelled and kept inside optional help; tapping a ring or gate does not answer it. Driving/flying through the opening validates the answer. The mission and held-control rectangles define the unobstructed viewport, and the field of view adapts to its aspect ratio.

Gate number signs use larger glyphs on 512×256 textures and stand above the openings. Key colors and symbols now match the expanded clue sets; the nine-key cabinet has separated rows. Garden signs emphasize the seed count and station signs emphasize departure time. Table activities use fixed interaction views facing the work area, with larger equivalent HTML actions for touch/keyboard and a highlighted verification button. Campaign signs and clock numerals are larger too. First/third-person exploration preferences continue to be restored on leaving an activity.

All ten campaign families and six mini-game families have at least five times the distinct v20 content at each of the three difficulty levels, in both languages. The audit scans the same 20,000 seeds per family/level/language before and after the change. These are sampled distinct counts, not theoretical maxima. Semantic fingerprints exclude answer-button order, gate placement order and initial mirror rotations. The immutable v20 comparison identifies the published source commit; the v21 fixture and generator audit are in `tests/fixtures` and `tests/moonlight-variety-counts.cjs`.

| Family | v20 levels 1 / 2 / 3 | v21 levels 1 / 2 / 3 (Dutch sample) |
| --- | --- | --- |
| Groups | 3 / 16 / 6 | 25 / 567 / 750 |
| Riddles | 3 / 3 / 3 | 15 / 15 / 15 |
| Fractions | 2 / 3 / 12 | 15 / 24 / 84 |
| Time | 8 / 120 / 120 | 72 / 2,159 / 2,160 |
| Patterns | 12 / 12 / 12 | 178 / 178 / 178 |
| Sequences | 8 / 12 / 16 | 144 / 600 / 720 |
| Words | 3 / 3 / 3 | 15 / 15 / 15 |
| Deduction | 3 / 3 / 3 | 1,800 / 1,800 / 1,800 |
| Mirrors | 1 / 1 / 4 | 48 / 48 / 288 |
| Routes | 1 / 1 / 1 | 16 / 24 / 32 |
| Mansion | 9 / 9 / 9 | 3,589 / 3,589 / 3,588 |
| Potions | 9 / 16 / 25 | 81 / 144 / 225 |
| Broom | 20 / 96 / 81 | 410 / 1,620 / 720 |
| Garden | 4 / 4 / 4 | 72 / 1,024 / 7,756 |
| Railway | 4 / 4 / 4 | 432 / 2,917 / 14,041 |
| Rally | 20 / 96 / 81 | 410 / 1,620 / 720 |

Recent semantic task history is stored separately per profile, location, level and language, capped at twelve entries per bucket. It includes unfinished mini-game visits. New campaign visits use a saved nonce and bounded deterministic candidate search; resuming a saved draft keeps its question and answer. No new daily requirement, timer or loss of earned progress was added. The 2D compatibility page loads the expanded content and retains its existing save key.

Validation uses 122 repository tests, 18,000 campaign solvability cases, all six three-round mini-game flows, 774 arena sign framing checks, first-person glyph projection on 320/360/390-pixel portrait phones, phone landscape and desktop, plus layouts with the actual HUD space reserved. Gate glyphs exceed 20 projected screen pixels at the starting line. Additional integration checks cover 2,172 campaign camera projections, 180 constructed scenes, touch/keyboard input, train and exploration camera restoration, pause, animations and resource disposal. These are Babylon NullEngine and native-canvas checks. Game Development Studio CLI is unavailable; GPU rendering, physical-device typography and frame rates still need a WebGL-capable device check.

## v24 — Every activity in first person, terrain supports and six-stage adventures

All 30 campaign exercises now use an input-free UniversalCamera fixed 2.08 world units above the activity support. Upright letter, number, route, clock and optics displays replace overhead boards. Framing adjusts horizontal distance and field of view while preserving eye height. Object dragging, actual clock-face picking, keyboard actions and touch controls remain available. Right-drag or a touch look gesture changes gaze without walking or zooming the activity. Leaving restores the saved exploration preference and train behavior.

All four stationary mini-games use a fixed 1.85-unit eye above their arena origin, with compact upright displays. Racing and flying retain their attached first-person cameras. Key plaques show large, font-independent color/symbol shapes, potion bottles use water/star symbols, and full descriptions remain in the HTML action buttons. The open cauldron is below the player's eye so pouring and mixing can be viewed from the workstation. Numeric textures use tighter vertical framing. Tested gate glyphs measure at least 20.8 projected screen pixels and stationary glyphs at least 16.9 in the default tested phone/desktop frames; narrower resized frames are checked for complete projection and clipping.

Each optional adventure now requires six tasks. Rally and broom travel through a 144-unit course with six spatial checkpoint rows, advance to the next checkpoint without returning to the first gate, neutralize held input for the next riddle, and retain all completed markers at the finish. A single solved exercise cannot award a completed session. Progress, local profiles, language separation and the minimum fivefold content variety are preserved.

`hints.js` gives every campaign and mini-game family three distinct Dutch/French hints: a relevant observation, a strategy, and one partial guided step. Buttons display the current hint stage. Whole words, riddle answers, complete routes and complete mirror configurations are no longer directly revealed. Campaign hints retain assisted status in saved drafts and proficiency records.

`grounding.js` samples terrain across each footprint. Cottages and district structures move as groups with continuous foundations; roofs, windows, plants and attached ivy move together. Narrow trees, mushrooms, pumpkins, boulders and grass rest against the terrain. Site signs, festival garlands, station bells, bridge decks and optional destination displays have physical mounts or supports. Court foundations are checked on both the real landscape and synthetic slopes.

Capability Orchestrator selected Game Development Studio and Visual Debugging guidance for camera, terrain and checkpoint work, and Precision Prompt Pro for the progressive-hint contract. The copy-ready implementation brief is in `implementation-brief.md`. The Studio CLI is unavailable, so execution and verification use the existing Babylon source, Node controller tests, native canvas metrics and NullEngine scene geometry.

Validation includes 2,172 campaign projections, 13,476 actual interaction ray picks across six viewport layouts, 180 constructed/solved scenes, real clock-coordinate conversion, exploration/train restoration, all six-stage completion flows, 612 mini-game sign framing checks, 504 gate glyph measurements and 1,008 stationary-sign measurements. Terrain tests inspect grouped foundations and foot contact. GPU pixels, physical-device typography, audio output and frame rates remain unmeasured.
