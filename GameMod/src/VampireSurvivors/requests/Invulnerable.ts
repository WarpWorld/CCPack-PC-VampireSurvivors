import { CrowdControlTimedEffectRequest, RESPONSE_STATUS } from '../../CrowdControl'
import { getGame, getIsGamePaused, getIsPlayerDead } from '../VampireSurvivorsState'
import { EFFECT_CODES } from './EffectCodes'
import type { ICrowdControlTimedEffectRequest } from '../../CrowdControl/requests/CrowdControlTimedEffectRequest'

export class Invulnerable extends CrowdControlTimedEffectRequest implements ICrowdControlTimedEffectRequest {
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

    this.stop = () => clearEffect()

    applyEffect()
    return { status: RESPONSE_STATUS.SUCCESS, timeRemaining: duration }
  }
}
