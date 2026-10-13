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
