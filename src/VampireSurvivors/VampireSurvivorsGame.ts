import type { VampireSurvivorsEnemyGroupClass, VampireSurvivorsGame } from '.'
import EffectsMap from '../../VampireSurvivorsEffects.json'
import { CrowdControlWebSocketClient, CrowdControlWebsocketEventTypes, log } from '../CrowdControl'
import { CrowdControlManager, CrowdControlManagerEventTypes } from '../CrowdControl/CrowdControlManager'
import * as EffectRequestClassMap from './requests'
import { VampireSurvivorsOverlayManager } from './VampireSurvivorsOverlayManager'
import { getGame, reset as resetState } from './VampireSurvivorsState'
import { VampireSurvivorStateMonitor, VampireSurvivorStateMonitorEventTypes } from './VampireSurvivorStateMonitor'
import { VampireSurvivorsViewerNameMonitor } from './VampireSurvivorViewerNameMonitor'

// Add these so TS is happy when we jam properties into the window object
// we use this to hack away at the game in the console
declare global {
  interface Window {
    Game?: VampireSurvivorsGame
    EnemyGroupClass?: VampireSurvivorsEnemyGroupClass
  }
}

const READY_MESSAGE = 'Crowd Control is ready'
const webSocketClient = new CrowdControlWebSocketClient()
const manager = new CrowdControlManager(EffectRequestClassMap, webSocketClient)
const overlayManager = new VampireSurvivorsOverlayManager()
const stateMonitor = new VampireSurvivorStateMonitor()
const viewerNameMonitor = new VampireSurvivorsViewerNameMonitor()

// Add a message to the screen to confirm the websocket is connected
webSocketClient.addEventListener(CrowdControlWebsocketEventTypes.OPEN, () => overlayManager.addMessage(READY_MESSAGE))

// Listen for pause/resume state changes and relay them to the Crowd Control Manager
stateMonitor.addEventListener(VampireSurvivorStateMonitorEventTypes.GAME_PAUSED, () => manager.pause())
stateMonitor.addEventListener(VampireSurvivorStateMonitorEventTypes.GAME_RESUMED, () => manager.resume())
stateMonitor.addEventListener(VampireSurvivorStateMonitorEventTypes.GAME_ENDED, () => manager.reset())

// Listen for anytime an effect is successfully started and show it on the overlay
manager.addEventListener(CrowdControlManagerEventTypes.START_EFFECT_REQUEST_STARTED, (e) => {
  const { requestBody, effectRequest } = e
  const { viewer, code } = requestBody
  if (!viewer || !code) return

  const effectInfo = (EffectsMap as Record<string, Record<string, string>>)[code]
  if (!effectInfo) return

  const { name, overlayPrefix } = effectInfo
  if (!name) return

  const prefix = effectRequest.overlayPrefix || overlayPrefix
  overlayManager.addMessage(`${requestBody.viewer} sent ${prefix ? `${prefix} ` : ''}${name}`)
})

// Called every time the game inits (on first start and after each death)
export const initGame = (game: VampireSurvivorsGame, enemyGroupClass: VampireSurvivorsEnemyGroupClass) => {
  log('initGame')
  // We also keep these at windows level so we can work
  // on new effects in the console.
  window.Game = game
  window.EnemyGroupClass = enemyGroupClass

  manager.reset()
  overlayManager.reset()
  stateMonitor.reset()
  viewerNameMonitor.reset()
  resetState(game, enemyGroupClass)

  if (!webSocketClient.connected) {
    webSocketClient.connect()
  } else {
    overlayManager.addMessage(READY_MESSAGE)
  }
}

// Save JSON files with all the current versions enemies, games, etc
export async function writeGameDataToJSON() {
  const Game = getGame()
  if (!Game) return

  const {
    Core: {
      PlayerOptions: { exportGameData },
    },
  } = Game

  exportGameData()
}
