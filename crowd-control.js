import { onKeyStroke } from 'https://unpkg.com/@vueuse/core?module'
import { createApp, reactive, watch } from 'https://unpkg.com/vue/dist/vue.esm-browser.prod.js'

const { readFileSync, existsSync } = require('fs')
const { resolve } = require('path')

const { version } = JSON.parse(readFileSync(resolve(__dirname, '..', '..', 'package.json')))

const original = `main.bundle.js`
const patched = `main.crowd-control.${version.replace(/\./g, '_')}.bundle.js`
let src = patched
if (!existsSync(resolve(__dirname, patched))) {
  // Maybe download patched file from S3?
  // then if that patch files does not exist there just use the original game
  alert("no patch found");
  src = original
}
const scriptEl = document.createElement('script')
scriptEl.src = src
scriptEl.setAttribute('defer', true)

document.head.appendChild(scriptEl)

const ENEMIES = []
const WEAPONS = []

const textColors = [
  '#bc0340',
  '#fede5f',
  '#ec6754',
  '#11855b',
  '#090a22',
  '#1b1c33',
  '#1f2037',
  '#2b2c44',
  '#3d3f5a',
  '#f7f7f7',
  '#cccddb',
]

function createVueApp(cmp) {
  const el = document.createElement('div')
  el.id = 'crowd-control'

  document.body.appendChild(el)
  createApp(cmp).mount(el)
}

async function cacheGameData(version, GM) {
  const {
    Core: {
      PlayerOptions: { exportGameData },
    },
  } = GM

  if (WEAPONS.length) return

  const loadFromFile = async (file) => {
    const results = await fetch(file)
    return await results.json()
  }

  version = version.replace(' - EA', '').trim()
  if (!existsSync(resolve(__dirname, `${version} - EA_WEAPON_DATA.json`))) {
    exportGameData()
  }

  const weaponData = JSON.parse(readFileSync(resolve(__dirname, `${version} - EA_WEAPON_DATA.json`)))
  const enemyData = JSON.parse(readFileSync(resolve(__dirname, `${version} - EA_ENEMY_DATA.json`)))

  Object.keys(weaponData).forEach((key) => WEAPONS.push(key))
  Object.keys(enemyData).forEach((key) => ENEMIES.push(key))
}

async function init({ data, EnemiesGroup }) {
  const {
    CHEATS,
    DEBUG_INFO,
    DEBUG_SHOWCASE,
    VSBUILDVER,
    VSVERSION,
    DEBUGTHEENDER,
    MASTER_SCALE,
    DEFAULT_WIDTH,
    DEFAULT_HEIGHT,
    DEBUG_COINS,
    GAMEPLAY_PIXEL_WIDTH,
    GAMEPLAY_PIXEL_HEIGHT,
    MAX_WIDTH_MULTIPLIER,
    IS_PORTRAIT,
    IS_WIDTH_MAXED,
    IPCRENDERER,
    initialWidth,
    initialHeight,
    SAFEAREA,
    GET_RATIO,
    GM,
  } = data
  // Just keep this for quick debugging
  window.Game = GM
  window.Group = EnemiesGroup

  await cacheGameData(VSVERSION, GM)

  let viewers = [
    { name: 'Jaku' },
    { name: 'Chud' },
    { name: 'Kat' },
    { name: 'Moni' },
    { name: 'KBM' },
    { name: 'D4' },
    { name: 'Saturn' },
    { name: 'reze' },
    { name: 'Dr. Poop' },
    { name: 'Navetz' },
    { name: 'xWater' },
    { name: 'Gergle' },
    { name: 'rbailey' },
    { name: 'hacksaw' },
    { name: 'Jasteria' },
    { name: 'GpB' },
    { name: 'MoneyMike' },
  ]
  window.viewers = viewers

  console.log('Vampire Survivor CC Initialized')

  //New Websocket Code Here
  let lastMessage = {
    id: -1,
    code: "none",
    data: {}
  }
  try {
    let socket = new WebSocket("ws://localhost:43384");
    socket.onopen = function(e) {
      alert("[open] Connection to Crowd Control established");
    };
    
    socket.onmessage = function(event) {
      alert(`[message] Data received from server: ${event.data}`);
      const request = JSON.parse(event.data);
      const requestType = parseInt(request.type);
      if(requestType === 1) {
        try {
          lastMessage = {
            id: request.id,
            code: request.code,
            data: request.parameters
          }
          const response = {
            id: request.id,
            status: 0, //Success
            timeRemaining: 0,
            type: 0 //Effect request
          }
          socket.send(JSON.stringify(response));
        } catch (error) {
          //TODO handle exceptional cases
          alert("failed to trigger effect! Error to follow.");
          alert(error);
        }
      } else {
        alert("unrecognized request type! We aren't doing anything!")
      }
    };
    
    socket.onclose = function(event) {
      if (event.wasClean) {
        alert(`[close] Connection closed cleanly, code=${event.code} reason=${event.reason}`);
      } else {
        // e.g. server process killed or network down
        // event.code is usually 1006 in this case
        alert('[close] Connection died');
      }
    };
    
    socket.onerror = function(error) {
      alert(`[error] ${error.message} ${error}`);
      alert('We can no longer connect to Crowd Control. Please restart VS to try again!');
      //TODO provide better fallback than hard reset
    };
  } catch (error) {
    alert(error);
  }

  function syncViewers() {
    if (!Game.Core.Stage?.pools) return
    if (Game.Core.SceneManager.MainScene.sys.isPaused()) return

    const sortedViewers = viewers.sort((a, b) => (a.count > b.count ? 1 : -1))
    for (const viewer of sortedViewers) {
      const { name, enemy, text } = viewer
      if (enemy) {
        if (enemy.isDead) {
          text.destroy()
          enemy._viewer = null
          viewer.text = viewer.enemy = null
          if (viewer.count) {
            viewer.count++
          } else {
            viewer.count = 1
          }
        } else {
          text.x = enemy.x - enemy.width
          text.y = enemy.y - enemy.height - 20
        }
      } else {
        let unclaimedEnemy
        for (const pool of Game.Core.Stage.pools) {
          unclaimedEnemy = pool.children?.entries?.find((e) => !e.isDead && !e._viewer)
          if (unclaimedEnemy) {
            unclaimedEnemy._viewer = name
            viewer.enemy = unclaimedEnemy
            viewer.text = Game.Core.Stage.scene.add.text(
              unclaimedEnemy.x - unclaimedEnemy.width,
              unclaimedEnemy.y - unclaimedEnemy.height - 50,
              name,
              {
                fontSize: '12px',

                backgroundColor: 'rgba(255,255,255,.25)',
                color: textColors[Math.floor(Math.random() * textColors.length)],
                padding: {
                  x: 2,
                  y: 2,
                },
                shadow: {
                  color: '#000',
                  offsetX: -1,
                  offsetY: 1,
                  fill: true,
                },
              }
            )
            viewer.text.setDepth(unclaimedEnemy.depth + 100)
            break
          }
        }
      }
    }
  }

  function clearNames() {
    viewers.forEach((viewer) => {
      if (viewer.enemy) {
        viewer.enemy._viewer = null
        viewer?.text?.destroy?.()
        viewer.text = viewer.enemy = null
      }
    })
  }

  // This hook will monitor the player info on an interval
  let _playerState
  function usePlayerState() {
    if (!_playerState) {
      _playerState = reactive({
        exists: false,
        isDead: false,
        active: false,
      })

      setInterval(() => {
        _playerState.exists = !!Game?.Core?.Player
        _playerState.isDead = !!Game?.Core?.Player?.isDead
        _playerState.active = !!Game?.Core?.Player?.active
        _playerState.paused = !!Game?.Core?.SceneManager?.MainScene?.sys?.isPaused?.()
      }, 1000)
    }

    return _playerState
  }

  // Custom state for polling last message from CC
  let _ccState
  function useCCState() {
    if(!_ccState) {
      _ccState = reactive({
        id: -1,
        code: "none",
        data: {}
      });

      setInterval(() => {
        _ccState.id = lastMessage?.id
        _ccState.code = lastMessage?.code
        _ccState.data = lastMessage?.data
      }, 1000)

      return _ccState
    }
  }

  const sheet = new CSSStyleSheet()
  sheet.replaceSync(/*css*/ `
    *,::after,::before{box-sizing:border-box}html{-moz-tab-size:4;tab-size:4}html{line-height:1.15;-webkit-text-size-adjust:100%}body{margin:0}body{font-family:system-ui,-apple-system,'Segoe UI',Roboto,Helvetica,Arial,sans-serif,'Apple Color Emoji','Segoe UI Emoji'}hr{height:0;color:inherit}abbr[title]{text-decoration:underline dotted}b,strong{font-weight:bolder}code,kbd,pre,samp{font-family:ui-monospace,SFMono-Regular,Consolas,'Liberation Mono',Menlo,monospace;font-size:1em}small{font-size:80%}sub,sup{font-size:75%;line-height:0;position:relative;vertical-align:baseline}sub{bottom:-.25em}sup{top:-.5em}table{text-indent:0;border-color:inherit}button,input,optgroup,select,textarea{font-family:inherit;font-size:100%;line-height:1.15;margin:0}button,select{text-transform:none}[type=button],[type=reset],[type=submit],button{-webkit-appearance:button}::-moz-focus-inner{border-style:none;padding:0}:-moz-focusring{outline:1px dotted ButtonText}:-moz-ui-invalid{box-shadow:none}legend{padding:0}progress{vertical-align:baseline}::-webkit-inner-spin-button,::-webkit-outer-spin-button{height:auto}[type=search]{-webkit-appearance:textfield;outline-offset:-2px}::-webkit-search-decoration{-webkit-appearance:none}::-webkit-file-upload-button{-webkit-appearance:button;font:inherit}summary{display:list-item}
    p {margin:0;}

    .slide-enter-active, .slide-leave-active {
      transform: translateY(-200px);
      transition: transform 1s;
    }
    .slide-enter-to, .fade-leave-to {
      transform: translateY(0px);
    }

    #crowd-control {
      --primary-color: #ec6754;
      --primary-red: #bc0340;
      --primary-yellow: #fede5f;
      --primary-orange: #ec6754;
      --primary-green: #11855b;
      --dark-1: #090a22;
      --dark-2: #1b1c33;
      --dark-3: #1f2037;
      --dark-4: #2b2c44;
      --dark-5: #3d3f5a;
      --white-1: #f7f7f7;
      --white-2: #cccddb;

        color: var(--white-1);
        top: 0px;
        right: 0px;
        bottom: 0px;
        left: 0px;
        position: absolute;
        pointer-events: none;
      }
      
    #weapons-container, #enemies-container {
      pointer-events: auto;
      display: grid;
      place-content: center;
      grid-template-columns: repeat(5, 1fr);
      gap: 1rem;
      position: absolute;
      inset: 0;
      background-color: rgba(0,0,0,.5);
    }
    
    #enemies-container {
      font-size: .75rem;
      grid-template-columns: repeat(7, 1fr);
    }

    #menu-container {
        padding: 0.5rem;
        align-items: flex-start;
        justify-content: space-between;
        flex-direction: row;
        width: 100%;
        display: flex;
        pointer-events: auto;
        background: var(--dark-4)
    }

    #buttons-container {
      display: grid;
      grid-template-columns: repeat(5, 1fr);
      gap: .5rem;
    }

    #buttons-container.disabled button {
      opacity: .25;
      pointer-events: none;
    }

    button {
      padding: .5rem;
      border-radius: .5rem;
      border: none;
      outline: none;
      color: var(--white-1);
      background-color: var(--primary-red);
      cursor: pointer;
    }
    
    button:active {
      background-color: var(--primary-orange)
    }
    
    button.active {
      background-color: var(--primary-green)
    }

  `)

  document.adoptedStyleSheets = [sheet]

  createVueApp({
    setup() {
      const uiState = reactive({
        visible: false,
        showSpawnEnemy: false,
        showAddWeapon: false,
        showRemoveWeapon: false,
        showSpawnBoss: false,
      })

      const effectState = reactive({
        invulnerable: false,
        showNames: false,
      })

      const playerState = usePlayerState()
      const ccState = useCCState()

      onKeyStroke('`', () => (uiState.visible = !uiState.visible))

      let syncIntervalID
      watch(
        () => effectState.showNames,
        (s) => {
          clearInterval(syncIntervalID)

          if (s) {
            // 🤷
            syncIntervalID = setInterval(syncViewers, 50)
          } else {
            clearNames()
          }
        },
        { immediate: true }
      )

      
      watch(
        () => playerState.isDead,
        (isDead) => {
          if (isDead) effectState.showNames = false
        } 
      )

      //Moved effect triger to expose behavior to websocket
      function triggerEffect(id, data) {
        let group
        switch (id) {
          case 'toggle_invulnerable':
            effectState.invulnerable = !effectState.invulnerable
            if (effectState.invulnerable) {
              Game.Core.Player.SetInvulForMilliSeconds(data?.duration || 10000000000)
            } else {
              Game.Core.Player.invulTime = 0
            }
            break
          case 'super_speed':
            effectState.superSpeed = true
            Game.Core.Player.moveSpeed = 25
            break
          case 'normal_speed':
            effectState.superSpeed = false
            Game.Core.Player.moveSpeed = 1
            break
          case 'empty_pools':
            Game.Core.Stage.pools = []
            break
          case 'spawn_enemy':
            group = new EnemiesGroup(Game.Core.Stage.scene, data.enemyType)
            Game.Core.Stage.pools.push(group)
            uiState.showSpawnEnemy = false
            break
          case 'spawn_boss':
            group = new EnemiesGroup(Game.Core.Stage.scene, data.enemyType)
            Game.Core.Stage.bossPools.unshift(group)
            Game.Core.Stage.SpawnBoss()
            Game.Core.Stage.bossPools.pop()
            uiState.showSpawnBoss = false
            break
          case 'freeze_enemies':
            setAllEnemies({ speed: 0 })
            break
          case 'fast_enemies':
            setAllEnemies({ speed: 1000 })
            break
          case 'walking_enemies':
            setAllEnemies({ speed: 100 })
            break
          case 'slow_enemies':
            setAllEnemies({ speed: 100 })
            break
          case 'set_enemies_speed':
            setAllEnemies({ speed: data.speed })
            break
          case 'giant_enemies':
            setAllEnemies({ scale: 5 })
            break
          case 'normal_enemies':
            setAllEnemies({ scale: 1 })
            break
          case 'tiny_enemies':
            setAllEnemies({ scale: .5 })
            break;
          case 'set_enemies_scale':
            setAllEnemies({ scale: data.scale })
            break
          case 'add_whip':
            Game.Core['AddWeapon']("WHIP")
            break
          case 'remove_whip':
            Game.Core['RemoveWeapon']("WHIP")
            break
          case 'spawn_bat1':
            group = new EnemiesGroup(Game.Core.Stage.scene, 'BAT1')
            Game.Core.Stage.pools.push(group)
            break;
          case 'spawn_bat2':
            group = new EnemiesGroup(Game.Core.Stage.scene, 'BAT2')
            Game.Core.Stage.pools.push(group)
            break;
          case 'spawn_bat3':
            group = new EnemiesGroup(Game.Core.Stage.scene, 'BAT3')
            Game.Core.Stage.pools.push(group)
            break;
          case 'spawn_milk':
            group = new EnemiesGroup(Game.Core.Stage.scene, 'MILK')
            Game.Core.Stage.pools.push(group)
            break;
          case 'spawn_boss_trickster_normal':
            group = new EnemiesGroup(Game.Core.Stage.scene, 'BOSS_TRICKSTER_NORMAL')
            Game.Core.Stage.bossPools.unshift(group)
            Game.Core.Stage.SpawnBoss()
            Game.Core.Stage.bossPools.pop()
            break;
          case 'give_weapon':
          case 'give_evo_weapon':
          case 'give_accessory':
            if (data[0] === 'ALL') {
              WEAPONS.forEach((w) => Game.Core['AddWeapon'](w))
            } else {
              Game.Core['AddWeapon'](data[0].toUpperCase())
            }
            uiState.showAddWeapon = false
            uiState.showRemoveWeapon = false
            break
          case 'remove_weapon':
          case 'remove_evo_weapon':
          case 'remove_accessory':
            if (data[0] === 'ALL') {
              WEAPONS.forEach((w) => Game.Core['RemoveWeapon'](w))
            } else {
              Game.Core['RemoveWeapon'](data[0].toUpperCase())
            }
            uiState.showAddWeapon = false
            uiState.showRemoveWeapon = false
            break
          case 'toggle_names': 
            effectState.showNames = !effectState.showNames
            break
          default:
            alert("Unrecognized effect " + id + "(" + data + ") sent! Is your client up to date?");
        }
      }
      //  this watcher triggers behavior
      watch(
        () => ccState.id,
        (id) => {
          triggerEffect(ccState.code, ccState.data)
        }
      )

      function setAllEnemies(obj) {
        Game.Core.Stage.pools.forEach((p) => p.children.entries.forEach((c) => Object.assign(c, obj)))
      }

      return {
        uiState,
        playerState,
        ccState,
        effectState,
        WEAPONS,
        ENEMIES,
        onEffect(id, data) {
          triggerEffect(id, data);
        },
      }
    },
    template: /*html*/ `
      <Transition name="slide">
        <div id="menu-container" v-if="uiState.visible">
        <div id="buttons-container" :class="{ disabled: !playerState.active}">
          <button :class="{ active: effectState.invulnerable }" @click="onEffect('toggle_invulnerable')"> Toggle Invulnerable</button>
          <button @click="onEffect('normal_speed')"> Normal Speed</button>
          <button :class="{ active: effectState.superSpeed }" @click="onEffect('super_speed')"> Super Speed</button>
          <button @click="onEffect('empty_pools')"> Empty Pools</button>
          <button @click="onEffect('freeze_enemies')"> Freeze Enemies </button>
          <button @click="onEffect('set_enemies_speed', { speed: 1000 })"> Fast Enemies </button>
          <button @click="onEffect('set_enemies_speed', { speed: 100 })"> Walking Enemies </button>
          <button @click="onEffect('set_enemies_speed', { speed: 10 })"> Slow Enemies </button>
          <button @click="onEffect('set_enemies_scale', { scale: 5 })"> Giant Enemies </button>
          <button @click="onEffect('set_enemies_scale', { scale: 1 })"> Normal Enemies </button>
          <button @click="onEffect('set_enemies_scale', { scale: .5 })"> Tiny Enemies </button>
          <button @click="uiState.showSpawnEnemy = true"> Spawn Enemy </button>
          <button @click="uiState.showSpawnBoss = true"> Spawn Boss </button>
          <button @click="uiState.showAddWeapon = true"> Add Weapon </button>
          <button @click="uiState.showRemoveWeapon = true"> Remove Weapon </button>
          <button :class="{ active: effectState.showNames }" @click="effectState.showNames = !effectState.showNames"> Toggle Names </button>
        </div>
        <div>
          <p>Player is {{!playerState.active ? 'not active' : playerState.isDead ? 'Dead' : 'Alive'}}</p>
          <p v-if="playerState.paused">Game is Paused</p>
        </div>
      </Transition>
      <div id="weapons-container" v-if="uiState.showAddWeapon || uiState.showRemoveWeapon" @click="uiState.showAddWeapon = uiState.showRemoveWeapon = false" >
        <button @click="onEffect(uiState.showAddWeapon ? 'give_weapon' : 'remove_weapon', {weapon: 'ALL'})">ALL</button>
        <button v-for="weapon in WEAPONS" @click.prevent="onEffect(uiState.showAddWeapon ? 'give_weapon' : 'remove_weapon', {weapon: weapon})">{{ weapon }}</button>
      </div>
      <div id="enemies-container" v-if="uiState.showSpawnEnemy" @click="uiState.showSpawnEnemy">
        <button v-for="enemy in ENEMIES" @click.prevent="onEffect('spawn_enemy', {enemyType: enemy})">{{ enemy }}</button>
      </div>
      <div id="enemies-container" v-if="uiState.showSpawnBoss" @click="uiState.showSpawnBoss">
        <button v-for="enemy in ENEMIES" @click.prevent="onEffect('spawn_boss', {enemyType: enemy})">{{ enemy }}</button>
      </div>
    `,
  })
}

window.addEventListener('game-init', (e) => init(e.detail))