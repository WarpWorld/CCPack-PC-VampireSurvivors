import type { VampireSurvivorsEnemyGroupClass, VampireSurvivorsGame } from '.'
import EffectsMap from '../../VampireSurvivorsEffects.json'
import { createCrowdControlWebsocketClient, getEffectRequestHandlers } from '../CrowdControl'
import * as Effects from './requests'
import { getActiveEffects, setSocketRequestHandlers } from './VampireSurvivorsEffectCollection'
import { getGame, init as initGameState } from './VampireSurvivorsGameState'
import { addToOverlay, initOverlay } from './VampireSurvivorsOverlay'
import { stateMonitor } from './VampireSurvivorStateMonitor'
import { viewerNameMonitor } from './VampireSurvivorViewerNameMonitor'

// Add these so TS is happy when we jam properties into the window object
// we use this to hack away at the game in the console
declare global {
  interface Window {
    Game?: VampireSurvivorsGame
    EnemyGroupClass?: VampireSurvivorsEnemyGroupClass
  }
}

const { onEffectStart, onEffectStop } = getEffectRequestHandlers(Effects, getActiveEffects)
const SocketClient = createCrowdControlWebsocketClient(onEffectStart, onEffectStop, {
  onSocketOpen: () => addToOverlay('Crowd Control Ready'),
  onSocketClose: () => addToOverlay('Crowd Control Disconnected'),
  onEffectRequestSuccess: (request) => {
    const { viewer, code } = request
    if (!viewer || !code) return

    const effectName = EffectsMap[code as keyof typeof EffectsMap]
    if (!effectName) return
    addToOverlay(`${request.viewer} sent ${effectName}`)
  },
})

setSocketRequestHandlers({
  sendPauseRequestHandler: SocketClient.sendPauseRequest,
  sendResumeRequestHandler: SocketClient.sendResumeRequest,
})

// Called every time the game inits (on first start and after each death)
export const init = (game: VampireSurvivorsGame, enemyGroupClass: VampireSurvivorsEnemyGroupClass) => {
  // We also keep these at windows level so we can work
  // on new effects in the console.
  window.Game = game
  window.EnemyGroupClass = enemyGroupClass
  initGameState(game, enemyGroupClass)

  initOverlay()

  stateMonitor.start()
  viewerNameMonitor.start()

  if (!SocketClient.connected) {
    SocketClient.connect()
  } else {
    addToOverlay('Crowd Control Ready')
  }
}

export const intro = (game: VampireSurvivorsGame) => {
  const MainMenuScene = game.Core.SceneManager.UI_mainMenu
  const _show = MainMenuScene.Show

  MainMenuScene.Show = () => {
    window.Game = game
    const text = MainMenuScene.add.text(10, 10, 'With\rCrowd Control', {
      fontFamily: game.Lang.FONTFAMILY,
      fontSize: '36px',
      color: '#ffffff',
      bold: true,
      align: 'center',
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
    })

    text.setOrigin(0.5, 0.5)
    text.setX(MainMenuScene.renderer.width / 2)
    text.setY(MainMenuScene.renderer.height / 2)
    text.setRotation(25)
    text.setScale(0)

    game.Core.SceneManager.UI_mainMenu.tweens.add({
      targets: text,
      scale: 1,
      ease: 'Bounce',
      duration: 500,
      delay: 500,
    })

    _show.call(MainMenuScene)
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
