import { log } from './CrowdControl'

import {
  bootstrap,
  initGame,
  type VampireSurvivorsGame,
  type VampireSurvivorsGameInitEventDetails,
  type VampireSurvivorsPhaserInitEventDetails,
  writeGameDataToJSON,
} from './VampireSurvivors'
import { version } from './VampireSurvivors/bootstrap'
import { initIntro } from './VampireSurvivors/VampireSurvivorsIntro'

const isGameInitEvent = (event: Event): event is CustomEvent<VampireSurvivorsGameInitEventDetails> => {
  return 'detail' in event && 'EnemyGroupClass' in (event as CustomEvent).detail
}

const isPhaserInitEvent = (event: Event): event is CustomEvent<VampireSurvivorsPhaserInitEventDetails> => {
  return 'detail' in event && 'Info' in (event as CustomEvent).detail
}

const onGameInit = ({ data, EnemyGroupClass: EnemiesGroupClass }: VampireSurvivorsGameInitEventDetails) => {
  const { GM: Game } = data
  initGame(Game, EnemiesGroupClass)
  // writeGameDataToJSON()
}

const onPhaserInit = (Game: VampireSurvivorsGame) => initIntro(Game)

const launch = async () => {
  log(`VS v${version}. Bootstrap Loaded, waiting for init`)

  // Wait for patched event to init
  window.addEventListener('phaser-init', (e: Event) => {
    log('phaser-init event received')
    if (!isPhaserInitEvent(e)) return
    const { Info } = e.detail
    const check = () => {
      if (Info.GM.Core) {
        onPhaserInit(Info.GM as VampireSurvivorsGame)
      } else {
        setTimeout(check, 100)
      }
    }
    check()
  })

  window.addEventListener('game-init', (e: Event) => {
    log('game-init event received')
    if (!isGameInitEvent(e)) return
    onGameInit(e.detail)
    log(`VS v${version}. Initialized.`)
  })

  // Add the script tag to load the actual game
  const { success, message } = await bootstrap()
  if (!success) {
    log(`VS v${version}. Bootstrap Failed: ${message}`)
  }
}
launch()
