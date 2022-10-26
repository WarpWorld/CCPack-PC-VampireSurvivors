# Local Dev Instructions

1. run `npm i` then `npm dev` in this repo. Then copy `index.html` to `[VampireSurvivorsInstall]\resources\app\.webpack\renderer\`
2. run `npm run convert` to generate a new `dist/VampireSurvivors.cs`. Load this file up in the crowd control SDK; ensure that your SDK is running (as it will need to start the websocket server) prior to starting vampire survivors. 
3. Start Vampire Survivors. 

# Production Build Instructions

1. Install dependencies with `npm i`
3. Run `npm run build` to build production assets in the dist folder.

# Patching new Version of VS

1. Manually inspect bundle code to find patch points
2. Add patch information to the `patches/[version].json` file
3. Edit `index.ts` and uncomment `VampireSurvivorsCrowdControl.writeGameDataToJSON()`
4. Run Local dev
5. In your `[VampireSurvivorsInstall]\resources\app\.webpack\renderer\` you will have generate Game data
6. Move those JSON files to the `data` folder
7. Edit `scripts/convert.js` and update the `const version = 'x.y.zzz'` as needed
8. Run `npm run convert` to generate a `json` and `cs` file.