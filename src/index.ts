import { log } from './CrowdControl'

import {
  bootstrap,
  intro,
  VampireSurvivorsGame,
  VampireSurvivorsGameInitEventDetails,
  VampireSurvivorsPhaserInitEventDetails,
} from './VampireSurvivors'
import { version } from './VampireSurvivors/bootstrap'
import { init } from './VampireSurvivors'

const isGameInitEvent = (event: Event): event is CustomEvent<VampireSurvivorsGameInitEventDetails> => {
  return 'detail' in event && 'EnemyGroupClass' in (event as CustomEvent).detail
}

const isPhaserInitEvent = (event: Event): event is CustomEvent<VampireSurvivorsPhaserInitEventDetails> => {
  return 'detail' in event && 'Info' in (event as CustomEvent).detail
}

const onGameInit = ({ data, EnemyGroupClass: EnemiesGroupClass }: VampireSurvivorsGameInitEventDetails) => {
  const { GM: Game } = data
  init(Game, EnemiesGroupClass)
  // VampireSurvivorsCrowdControl.writeGameDataToJSON()
}

const onPhaserInit = (Game: VampireSurvivorsGame) => intro(Game)

const launch = async () => {
  // Add the script tag to load the actual game
  const { success, message } = await bootstrap()
  log(`VS v${version}. Bootstrap Loaded, waiting for init`)

  if (success) {
    // Wait for patched event to init
    window.addEventListener('phaser-init', (e: Event) => {
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
      if (!isGameInitEvent(e)) return
      onGameInit(e.detail)
      log(`VS v${version}. Initialized.`)
    })
  } else {
    log(`VS v${version}. Bootstrap Failed: ${message}`)
  }
}
launch()
