# Indian Bike Driving Prototype

A first playable Three.js bike-driving prototype with a procedural city, traffic, camera modes, collision response, desktop controls, mobile touch controls, HUD, minimap, and loading overlay.

## Run

Install Node.js, then run:

```bash
npm install
npm run dev
```

Open the local Vite URL shown in the terminal.

On this machine, a portable Node.js runtime is also available at `../.tools/node-v24.16.0-win-x64`. From PowerShell you can run:

```powershell
$env:Path = "C:\Users\USER\Downloads\Python journey\.tools\node-v24.16.0-win-x64;" + $env:Path
..\.tools\node-v24.16.0-win-x64\npm.cmd run dev
```

## Verify

```bash
npm run build
npm run smoke
```

## FPS Stability

The 60 FPS cap and adaptive render quality are handled in `src/core/performance.js`.

- Target FPS: `60`
- Minimum comfort FPS before quality drops: `55`
- Pixel ratio lowers automatically when frames get heavy
- HUD FPS is smoothed so it does not jump wildly frame to frame

## Controls

- `W` / `ArrowUp`: accelerate
- `S` / `ArrowDown`: brake / reverse
- `A` / `ArrowLeft`: steer left
- `D` / `ArrowRight`: steer right
- `Space`: brake
- `Shift`: nitro
- `C`: switch camera

On mobile, use the joystick plus Brake and Nitro buttons.

## Next Build Targets

- Replace procedural bike, traffic, and buildings with optimized `.glb` assets.
- Add proper Cannon raycast vehicle physics.
- Add missions, sound, garage upgrades, and save data.
- Convert repeated traffic/building meshes to more aggressive instancing and LOD.
