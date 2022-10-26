import { CrowdControlInstantEffectRequest, RESPONSE_STATUS } from '../../CrowdControl'
import { getGame, getIsGamePaused, getIsPlayerDead } from '../VampireSurvivorsGameState'
import { EFFECT_CODES } from './EffectCodes'

const FLASH_DURATION = 5000
let lastFlash = 0
export class DeathFlash extends CrowdControlInstantEffectRequest {
  static override code = EFFECT_CODES.DEATH_FLASH
  override code = DeathFlash.code

  override trigger() {
    const Game = getGame()
    const isGamePaused = getIsGamePaused()
    const isPlayerDead = getIsPlayerDead()

    if (!Game || isPlayerDead) return { status: RESPONSE_STATUS.FAILURE }
    if (!Game.Core.SceneManager.MainScene.cameras?.main) return { status: RESPONSE_STATUS.FAILURE }
    if (isGamePaused) return { status: RESPONSE_STATUS.RETRY }

    const now = Date.now()
    if (now - lastFlash < FLASH_DURATION) return { status: RESPONSE_STATUS.RETRY }

    Game.Core.SceneManager.MainScene.cameras.main.flashEffect.start(FLASH_DURATION, 255, 0, 0)
    lastFlash = now

    return { status: RESPONSE_STATUS.SUCCESS }
  }
}
