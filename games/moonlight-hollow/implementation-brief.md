# Moonlight Hollow: first-person activity update

Implement all 30 campaign exercises and all six optional mini-games as first-person activities at a low, fixed eye height. Fit the objects by adjusting their layout, camera distance and field of view. Never lift the camera to obtain an overhead exercise view. Keep numbers, words, controls and gates readable in the viewport left above the activity HUD, including portrait and landscape touch screens. Provide equivalent keyboard and touch controls, neutralize held movement at checkpoints and pause, and restore the exploration camera after leaving.

Place world scenery in relation to the actual terrain, with grouped building transforms and visible foundations wherever a level structure crosses a slope. Rest loose props against the terrain and connect signs and raised displays to physical supports. Keep intentional airborne moon and magic effects separate from ordinary ground contact.

Give every activity three distinct progressive hints in Dutch and French: notice a relevant feature, explain a strategy, then guide one partial step. Do not reveal a whole word, riddle answer, complete route or all mirror settings. Track the current hint stage per task, preserve existing assisted learning records and saved exercise drafts, and reset the hint stage when a new task starts.

Extend all optional adventures to six tasks before awarding completion. Racing and flying must progress along a course with six spatial checkpoint rows rather than repeatedly return to the first gate. Show the current stage and total clearly, keep the racing riddle visible, and prevent a single successful task from awarding a finished adventure. Preserve the existing minimum fivefold content-variety increase and recent-task repeat avoidance.

Before each improvement task, use Capability Orchestrator to select the smallest suitable route:

| Task | Selected capabilities | Execution |
| --- | --- | --- |
| Low first-person camera, layout and controls | Game Development Studio, Visual Debugging | Existing Babylon code and native scene tests |
| Terrain contact and supports | Game Development Studio, Visual Debugging | Terrain sampling and native geometry tests |
| Three-stage hints | Precision Prompt Pro | Refined hint contract and pure generator tests |
| Six-stage adventures and gate courses | Game Development Studio, Visual Debugging | Existing gameplay, scene and DOM tests |

The Studio CLI is unavailable in this environment. Do not install it, substitute remote rendering, or report GPU frame-rate measurements. Validate real Babylon scene geometry with NullEngine, canvas font metrics, gameplay transitions, save compatibility and input lifecycle tests; explicitly retain the limit that these checks are not rendered browser or GPU performance evidence.
