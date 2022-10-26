import { CrowdControlInstantEffectRequest, RESPONSE_STATUS } from '../../CrowdControl'
import { getGame, getIsGamePaused, getIsPlayerDead } from '../VampireSurvivorsGameState'
import { EFFECT_CODES } from './EffectCodes'

const SHAKE_DURATION = 5000
let lastShake = 0
export class Shake extends CrowdControlInstantEffectRequest {
  static override code = EFFECT_CODES.SHAKE
  override code = Shake.code

  override trigger() {
    const Game = getGame()
    const isGamePaused = getIsGamePaused()
    const isPlayerDead = getIsPlayerDead()

    if (!Game || isPlayerDead) return { status: RESPONSE_STATUS.FAILURE }
    if (!Game?.Core.SceneManager.MainScene.cameras?.main) return { status: RESPONSE_STATUS.FAILURE }
    if (isGamePaused) return { status: RESPONSE_STATUS.RETRY }

    const now = Date.now()
    if (now - lastShake < SHAKE_DURATION) return { status: RESPONSE_STATUS.RETRY }

    Game.Core.SceneManager.MainScene.cameras.main.shakeEffect.start(SHAKE_DURATION)
    lastShake = now

    return { status: RESPONSE_STATUS.SUCCESS }
  }
}
