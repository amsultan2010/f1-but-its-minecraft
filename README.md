# F1 but it's Minecraft

A browser racing game: real F1 cars on real circuits, rebuilt as Minecraft-style voxel biomes. Built with three.js.

## Play

**[Play the game](https://f1butitsminecraft.grok.me)**

The built files are still in `docs/` if you want to run a copy locally (`npx serve docs`). Models load with `fetch`, so opening the file directly will not work.

## Tracks

| Circuit | Biome |
|---|---|
| Monaco | Shore |
| Austin | Badlands |
| Silverstone | Plains |
| Montreal | Tundra |
| Suzuka | Cherry (with the figure-8 bridge) |
| Las Vegas | Nether |
| Spa | Taiga |
| Lusail | Desert |
| Monza | Forest |
| Miami | Ocean (driven on the sea floor) |
| Interlagos | Jungle |
| Mexico City | Peaks |
| Red Bull Ring | Meadow |

Layouts come from real circuit outlines ([bacinger/f1-circuits](https://github.com/bacinger/f1-circuits)).

## Eras and cars

2026, 2010 and 2006 grids, each with its own physics, engine sound and car models.

## Controls

- `W` / `S`: throttle / brake (hold `S` at a standstill to reverse)
- `A` / `D`: steer
- `C`: change camera
- `R`: reset onto the track
- Hold the right mouse button and move the mouse: look around (chase cameras)
- `Esc`: menu
- Gamepad and touch controls are supported too.

## Project layout

- `src/`: game source (`js/`), the HTML template, block texture atlas and track thumbnails
- `docs/`: the built, playable game (car models ship as base64 `.glb.txt`)
- `tools/`: model processing (`procraw.mjs`, `comps.mjs`), track generation (`mktrack.py`, `circuits/`) and thumbnail rendering (`mkthumbs.mjs`)

## Build

```
npm install
./build.sh
```

This bundles `src/` into `docs/`.

## Credits

Block textures from Luanti (Minetest Game). Built by Abdullah Sultan.
