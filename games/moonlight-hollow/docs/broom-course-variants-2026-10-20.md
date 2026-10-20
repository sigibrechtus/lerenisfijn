# Broom Flight Halloween Course — implementation contract (20 October 2026)

This update enhances the existing *Bezemvlucht / Vol du balai* Babylon.js attraction without changing Pumpkin Race or the other learning games.

## Playable course levels

| Learning difficulty | Track form | Height profile | Answer gates |
| --- | --- | --- | --- |
| 1 | Moonrise: gentle beginner bends | Gentle rolling changes | Broad 3.7–5.1 m rings at a common depth |
| 2 | Ghost slalom: more noticeable S-bends | Moderate rolling hills | Variable sizes, heights and depth offsets of up to 0.75 m |
| 3 | Witch's eight-inspired slalom: alternating S-turns | Noticeable but gradual rises and falls | Smaller-but-safe gates, vertical offsets and up to 1.25 m depth staggering |

The course remains **forward-progressing** with 6 contiguous 24 m sections. A complete vertical 360-degree loop or self-crossing 3D figure-eight is **not implemented**: those require pitch/roll flight controls, a different collision model and camera acceptance before being safe for children. The higher difficulty instead uses figure-eight-*inspired* S-bends.

## Authoritative geometry and gameplay

- `broom-course.js` is the pure deterministic course contract: `center(z, level)`, `gate(stage, lane, level)`, `travel(stage, level)`.
- `mini-game-world.js` places raised curved road strips, supported rail edges, and themed ring meshes at the same positions consumed by collision, guided movement and snapshots.
- Physical collision checks each gate's own depth and the broom's horizontal/vertical distance inside a radius reduced by a safety margin. An incorrect gate resets the same task to its checkpoint at zero speed.
- Correct gates hand forward momentum to the next section; the scene is rebuilt without losing the authoritative world-space vehicle position.
- Gate decorative tessellation varies by stage (round, octagonal and star-like) while preserving readable answer labels and child-sized apertures.
- The single background floor remains scenery; the visually traversed runway is made from supported, overlapping curved strips with gently changing elevation. Decorative panels must not act as end walls.
- Player input follows the curve's centreline, with manual sideways and altitude correction to reach the chosen answer.
- The HUD remains peripheral and does not blur the 3D scene.

## Automated verification and acceptance boundary

`tests/moonlight-mini-game-world.test.cjs` covers geometry continuity and finite slopes; gate sizes, staggered depth and reachable heights across all three levels; guided correct passes at levels two and three; physical right/wrong/missed passes at level one; first-person visibility, fog removal, screen projection, resource cleanup and other mini-game regressions.

CI with Babylon.js NullEngine is **not** a substitute for visual acceptance on desktop WebGL or iPhone Safari/Chrome. In-device validation must cover collision appearance, camera sightlines around bends, correct readout of the next answer, held input during transitions and frame rate. No paid asset or external 3D generation was performed.
