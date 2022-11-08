import { CrowdControlTimedEffectRequest, RESPONSE_STATUS } from '../../../CrowdControl'
import type { ICrowdControlTimedEffectRequest } from '../../../CrowdControl/requests/CrowdControlTimedEffectRequest'
import { getGame, getIsGamePaused, getIsPlayerDead } from '../../VampireSurvivorsState'

export abstract class ChangePlayerSpeedEffectRequest
  extends CrowdControlTimedEffectRequest
  implements ICrowdControlTimedEffectRequest
{
  static IS_ACTIVE = false
  speed = 0

  override start() {
    const Game = getGame()
    const isGamePaused = getIsGamePaused()
    const isPlayerDead = getIsPlayerDead()
    const { duration } = this.request

    if (!Game || isPlayerDead || !duration) return { status: RESPONSE_STATUS.FAILURE }
    if (isGamePaused || ChangePlayerSpeedEffectRequest.IS_ACTIVE) return { status: RESPONSE_STATUS.RETRY }

    const clearEffect = () => {
      if (Game.Core.Player.$originalSpeed) {
        Game.Core.Player.moveSpeed = Game.Core.Player.$originalSpeed
        delete Game.Core.Player.$originalSpeed
      }
      ChangePlayerSpeedEffectRequest.IS_ACTIVE = false
    }

    const applyEffect = () => {
      Game.Core.Player.$originalSpeed = Game.Core.Player.moveSpeed
      Game.Core.Player.moveSpeed = this.speed
      ChangePlayerSpeedEffectRequest.IS_ACTIVE = true
    }

    this.stop = () => clearEffect()

    applyEffect()
    return { status: RESPONSE_STATUS.SUCCESS, timeRemaining: duration }
  }
}
