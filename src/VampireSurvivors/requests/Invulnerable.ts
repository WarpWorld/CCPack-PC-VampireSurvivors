import { CrowdControlTimedEffectRequest, RESPONSE_STATUS } from '../../CrowdControl'
import { getGame, getIsGamePaused, getIsPlayerDead } from '../VampireSurvivorsGameState'
import { addTimeout } from '../VampireSurvivorsEffectCollection'
import { EFFECT_CODES } from './EffectCodes'

export class Invulnerable extends CrowdControlTimedEffectRequest {
  static override code = EFFECT_CODES.INVULNERABLE
  override code = Invulnerable.code

  start() {
    const Game = getGame()
    const isGamePaused = getIsGamePaused()
    const isPlayerDead = getIsPlayerDead()
    const { duration } = this.request

    if (!Game || !duration || isPlayerDead) return { status: RESPONSE_STATUS.FAILURE }
    if (isGamePaused || Game.Core.Player.IsInvul) return { status: RESPONSE_STATUS.RETRY }

    const clearEffect = () => {
      Game.Core.Player.IsInvul = false
      Game.Core.Player.invulTime = 0
    }

    const applyEffect = () => {
      clearEffect()
      requestAnimationFrame(() => {
        Game.Core.Player.SetInvulForMilliSeconds(duration)
      })
    }

    const stop = (this.stop = () => {
      clearEffect()
      this.timeout?.clear()
    })

    applyEffect()
    this.timeout = addTimeout(this, () => stop(), duration)
    return { status: RESPONSE_STATUS.SUCCESS, timeRemaining: duration }
  }
}
