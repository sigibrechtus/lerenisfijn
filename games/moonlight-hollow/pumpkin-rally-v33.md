# Pumpkin rally v33

The rally now uses a continuous bounded road and a pumpkin kart with a chase camera. Every ghost checkpoint spans the road and presents three different numeric answers. Steering through the correct answer opens that lane; wrong answers return the kart exactly 10 metres before the same gate row, with the question and all three answers unchanged. The three gate openings stay visible and unobstructed; correct answers preserve speed and allow continuous passage. Answer buttons cannot submit or automatically drive the kart. The last answer does not finish the race: the kart must cross the finish line.

Controls: arrows/WASD or simultaneous touch buttons for steering, throttle, brake/reverse. HUD: current question, speed, gear, checkpoint, circuit name/number, length, distance to the next gate. No timer or loss condition. Reset returns behind the current unsolved checkpoint without clearing attempt/hint statistics.

## Circuits and progression

Ten authored parametric layouts alternate five closed loops and five point-to-point courses. Later layouts have larger geometry, more demanding turns, and four to eight checkpoints. Every circuit has continuous fence rails, pumpkins, gravestones, and sixteen animated roadside ghosts. Track visibility, lights, materials and chase camera are independent of the exploration weather/camera.

Each explorer's `attractions.rally.rally` stores circuit index, streak, last accuracy and best accuracy. Two consecutive completed races with at least 80% first-attempt correct answers and no hints unlock the next circuit. Finishing alone does not raise difficulty. Automatic arithmetic level rises at circuits 4 and 7 (three levels); an explicit chosen difficulty overrides arithmetic level. The circuit index caps at 9. Progress uses the game's existing local profile storage, without adding cloud synchronization.

## Art and model sources

The kart, fence, ghosts and checkpoint structures are original procedural Babylon meshes. No downloaded third-party mesh is represented as imported.

Reviewed sources:
- Kenney Graveyard Kit: https://kenney.nl/assets/graveyard-kit — official page lists 90 3D files and CC0.
- Quaternius Ultimate Monsters: https://quaternius.com/packs/ultimatemonsters.html — official page lists 50 animated models, glTF/FBX/OBJ/Blend, CC0.
- BlenderKit pumpkin cart listing and Sketchfab search were investigated; no asset was imported without verifying its individual license/package.

The road albedo `assets/rally-road-v33.webp` was created with the built-in image generator. Prompt: "Create a seamless square tiling diffuse/albedo texture for the road of a child-friendly Halloween pumpkin kart racing game. Top-down orthographic close view of fine dark plum and warm charcoal asphalt/gravel with sparse tiny copper autumn leaf fragments embedded flat into the surface. Subtle natural roughness, restrained contrast, high detail, uniform neutral lighting, no shadows, no perspective, no road markings, no text, no objects, no border. Must tile seamlessly and keep answer gates visually prominent in the game."

Editable HUD specification: https://www.figma.com/design/LswioLZvHp2ZlqEYr7DdPE

## Verification and limits

- `node tests/pumpkin-race.test.cjs`: all ten layouts in both languages; distinct answer choices, closed wrong gates/dividers, finish requirement, reverse, loop seam prevention, boundaries, mastery. All ten circuits completed with steering/throttle only.
- `node tests/pumpkin-race-world.test.cjs`: Babylon NullEngine scenes for first/last circuits at 390×844, 844×390, 1440×900; all active sign corners in frame near checkpoints, successful full physical drives, pause/reverse, single completion, restoring scene fog/camera and disposing every owned resource.
- Existing attraction controller, non-rally arena, mini-game generation, spatial scene and audio regressions.
- Service worker v34 includes the race module and generated texture.

Game Development Studio CLI and OpenAI Platform tools were unavailable. Chromium installation failed because the network download returned invalid ZIP content; no successful real-browser/WebGL screenshot or device performance test is claimed. NullEngine checks prove scene construction and geometry/projection, not GPU output, visual quality or iPhone performance. The Figma screens describe the HUD and do not depict a rendered race.

## Sharp independent race scene (v35)

The full-viewport vehicle HUD explicitly disables the inherited `.glass` 14-pixel backdrop blur, which otherwise fuzzed the complete game canvas. The race vignette is hidden. The race owns a separate Babylon Scene, with no inherited exploration fog, glow layers or postprocessing. It uses direct image processing (exposure/contrast 1), native-density rendering up to 2× within a 4.2-million-pixel budget, anisotropic road filtering, and non-glowing surface materials. The main loop renders the active race scene and resumes the exploration scene on exit, restoring its rendering resolution. Hundreds of instanced Halloween props include autumn trees, jack-o-lantern clusters, lantern poles, haunted huts, grave crosses and bats.

Runtime gate tests assert speed retention and forward-position continuity at every successful checkpoint, plus separate-scene ownership, no inherited glow, active instanced scenery, overhead sign framing and resource cleanup.

## Adaptive pace, terrain and cockpit (v36)

Speed unlocks depend on accurate, unassisted driving answers and decision-zone pace. Timing starts within 35 metres of the next checkpoint and excludes pause time. It is a proxy for response speed while approaching the gates, not a measurement of the child's exact mental solving time. Three consecutive first-attempt, unassisted answers within six seconds unlock one speed tier during a race. Successful completion preserves that tier only with at least 80% accuracy, no hints and qualifying pace; two qualifying races can also earn a tier. Tiers 0–6 raise the optional maximum from 8 to 17 m/s (approximately 29–61 km/h). Controls allow a slower pace; the faster control cannot exceed the unlocked ceiling. No deadline, forced acceleration or failure timer is imposed.

All ten layouts have continuous, distinct elevation profiles. The road, wide terrain shoulders, fence rails/posts, gate anchors, decorations, kart height/pitch and chase camera use the same course height model. Heights range from gentle 1.5-metre introductory hills to roughly 8-metre rises; gradients stay below 15%. Closed circuits join at matching heights. Correct answers retain the kart's speed and position, including on slopes; wrong answers still reset ten metres before the row at zero speed.

The cockpit button (or V) switches between chase and first-person views without changing the vehicle. Dragging the canvas in cockpit view turns head yaw/pitch independently of steering; looking forward centres the view. Touch steering/throttle buttons can be held while a separate finger looks around. The driver head/hat are hidden only in cockpit view. Pointer listeners are removed on exit.

Largest/smallest questions use distinct operands and put both numbers on the three gates. The extra distractor is below both operands for largest questions and above both for smallest questions, so it cannot accidentally become the correct comparison answer.

### Custom outdoor-space contract (Build 3D Game Rooms)

The hero is the original pumpkin kart, approximately 2.3 m wide. The primary circulation is a 24-metre-wide road with continuous visible fences; the collision centreline permits ±10.8 m of lateral travel. Three 6.6-metre gate bays are physically open. Foliage, buildings and other props remain outside the fence corridor and attach to the course-derived supporting terrain. Uphill/downhill position and orientation come from the same metre-based geometry as the road. The camera contract includes an unobstructed chase view and a cockpit with bounded independent head look. Native-density rendering is capped at 4.2 million pixels; repeated scenery uses instances. Paid-generation budget: zero. This iteration uses existing procedural assets, with no Meshy submission or Blender export.

Runtime evidence comprises course traversal, height/grade/attachment checks, overhead gate projection tests, the real pointer listener path, view-switch speed/position preservation, full-scene ownership and cleanup. NullEngine evidence does not establish real-device GPU appearance or performance; no paid-generation, Blender-render or human-runtime approval is claimed.
