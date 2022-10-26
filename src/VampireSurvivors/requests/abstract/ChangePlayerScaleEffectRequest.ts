import { CrowdControlTimedEffectRequest, RESPONSE_STATUS } from '../../../CrowdControl'
import { getGame, getIsGamePaused, getIsPlayerDead } from '../../VampireSurvivorsGameState'
import { addTimeout } from '../../VampireSurvivorsEffectCollection'

export abstract class ChangePlayerScaleEffectRequest extends CrowdControlTimedEffectRequest {
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
      Game.Core.Player.scale = Game.Core.Player.scale / this.ratio
      ChangePlayerScaleEffectRequest.IS_ACTIVE = false
    }

    const applyEffect = () => {
      Game.Core.Player.scale = Game.Core.Player.scale * this.ratio
      ChangePlayerScaleEffectRequest.IS_ACTIVE = true
    }

    let timeout: ReturnType<typeof addTimeout> | undefined
    const stop = (this.stop = () => {
      clearEffect()
      timeout?.clear()
    })

    applyEffect()
    timeout = addTimeout(this, () => stop(), duration)
    return { status: RESPONSE_STATUS.SUCCESS, timeRemaining: duration }
  }
}
