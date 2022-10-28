import { CrowdControlTimedEffectRequest, RESPONSE_STATUS } from '../../../CrowdControl'
import type { ICrowdControlTimedEffectRequest } from '../../../CrowdControl/requests/CrowdControlTimedEffectRequest'
import { getGame, getIsGamePaused, getIsPlayerDead } from '../../VampireSurvivorsState'

export abstract class ChangePlayerScaleEffectRequest
  extends CrowdControlTimedEffectRequest
  implements ICrowdControlTimedEffectRequest
{
  static IS_ACTIVE = false
  ratio = 1

  override start() {
    const Game = getGame()
    const isGamePaused = getIsGamePaused()
    const isPlayerDead = getIsPlayerDead()
    const { duration } = this.request

    if (!Game || isPlayerDead || !duration) return { status: RESPONSE_STATUS.FAILURE }
    if (isGamePaused || ChangePlayerScaleEffectRequest.IS_ACTIVE) return { status: RESPONSE_STATUS.RETRY }

    const clearEffect = () => {
      if (Game.Core.Player.$originalScale) {
        Game.Core.Player.scale = Game.Core.Player.$originalScale
        delete Game.Core.Player.$originalScale
      }
      ChangePlayerScaleEffectRequest.IS_ACTIVE = false
    }

    const applyEffect = () => {
      if (Game.Core.Player.$originalScale) return { status: RESPONSE_STATUS.RETRY }

      Game.Core.Player.$originalScale = Game.Core.Player.scale
      Game.Core.Player.scale = Game.Core.Player.scale * this.ratio
      ChangePlayerScaleEffectRequest.IS_ACTIVE = true
    }

    this.stop = () => clearEffect()

    applyEffect()
    return { status: RESPONSE_STATUS.SUCCESS, timeRemaining: duration }
  }
}
