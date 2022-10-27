import { CrowdControlTimedEffectRequest, RESPONSE_STATUS } from '../../../CrowdControl'
import { getGame, getIsGamePaused, getIsPlayerDead } from '../../VampireSurvivorsGameState'
import { addTimeout } from '../../VampireSurvivorsEffectCollection'

export abstract class ChangeCameraZoomEffectRequest extends CrowdControlTimedEffectRequest {
  static IS_ACTIVE = false
  zoom = 1

  override start() {
    const Game = getGame()
    const isGamePaused = getIsGamePaused()
    const isPlayerDead = getIsPlayerDead()
    const { duration } = this.request

    if (!Game || isPlayerDead || !duration) return { status: RESPONSE_STATUS.FAILURE }
    if (isGamePaused || ChangeCameraZoomEffectRequest.IS_ACTIVE) return { status: RESPONSE_STATUS.RETRY }

    const clearEffect = () => {
      Game.Core.SceneManager.MainScene.cameras?.main.zoomTo(1)
      ChangeCameraZoomEffectRequest.IS_ACTIVE = false
    }

    const applyEffect = () => {
      Game.Core.SceneManager.MainScene.cameras?.main.zoomTo(this.zoom)
      ChangeCameraZoomEffectRequest.IS_ACTIVE = true
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
