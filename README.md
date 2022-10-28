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

#Enable debugging
```html
    <script>
      window.VS_DEBUG = true
    </script>
```

# Phaser init searching
```js
   try {
            const { ipcRenderer: _0x43f9e3 } = _0xe9ecc4(0x11a6a)
            _0x23a300[_0x131eec(0x10e2)] = _0x43f9e3
          } catch (_0x53c171) {
            _0x23a300[_0x131eec(0x10e2)] = null
          }
          dispatchEvent(new CustomEvent('phaser-init',{detail:{Info:_0x23a300}}))
```

# Game Init Searching
```js
  ? ((this['fancyBG'] = new _0x473d24['default'](_0x431f14[_0x3cce91(0xe97)]['Core']['scene'])),
              this[_0x3cce91(0x73c)]['Create']())
            : this['stageType'] === _0x4b8dd2[_0x3cce91(0xe97)]['GREENACRES']
            ? ((this['fancyBG'] = new _0x5b4a52['default'](_0x431f14['default']['Core']['scene'])),
              this['fancyBG']['Create']())
            : this[_0x3cce91(0xdd9)] === _0x4b8dd2[_0x3cce91(0xe97)][_0x3cce91(0x165)] &&
              ((this[_0x3cce91(0x73c)] = new _0x4b5467['default'](
                _0x431f14[_0x3cce91(0xe97)][_0x3cce91(0x2f2)][_0x3cce91(0x78a)] //RIGHT HERE
              )),
              this['fancyBG']['Create']())),
        this['SpawnBoss']()

          //CC-PATCH:BEGIN
          dispatchEvent(
          new CustomEvent('game-init', {
            detail: {
              data: _0x431f14,
              EnemyGroupClass: _0x2ed6df.default,
            },
          })
        )
        //CC-PATCH:END
    }
    ['SpawnYellowItems']() {
      const _0x32f339 = _0x119d12
      if (
        -0x1 ===
        _0x431f14[_0x32f339(0xe97)]['Core'][_0x32f339(0x136b)][_0x32f339(0xb06)]['indexOf'](
          _0x14d2e8['default'][_0x32f339(0xe2e)]
        )
      )
        return
```

Just above these is the enemies group value

```js
  for (let _0x4e9e8f = 0x0; _0x4e9e8f < this[_0x3cce91(0x99f)]; _0x4e9e8f++)
                this[_0x3cce91(0xc22)] === _0x4441d9[_0x3cce91(0xe97)][_0x3cce91(0x139b)] &&
                this[_0x3cce91(0x10ea)] &&
                this['EnemySpanwersLocations']['length'] > 0x0
                  ? this[_0x3cce91(0x2ef)]()
                  : this[_0x3cce91(0xc22)] === _0x4441d9[_0x3cce91(0xe97)][_0x3cce91(0x94b)] &&
                    this['hasTileset'] &&
                    this[_0x3cce91(0x312)]['length'] > 0x0
                  ? this['SpawnInRandomLocationV']()
                  : this[_0x3cce91(0xc22)] === _0x4441d9['default'][_0x3cce91(0xbf2)]
                  ? this[_0x3cce91(0x969)]()
                  : this[_0x3cce91(0xeec)]()
              ;(this[_0x3cce91(0x328)] = new _0x2ed6df['default']( // RIGHT HERE
                this[_0x3cce91(0x78a)],
                _0x4f328c[_0x3cce91(0xe97)][_0x3cce91(0x5c0)]
              )),
```