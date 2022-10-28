import { CrowdControlTimedEffectRequest, RESPONSE_STATUS } from '../../../CrowdControl'
import { getGame, getIsGamePaused, getIsPlayerDead } from '../../VampireSurvivorsState'
import type { ICrowdControlTimedEffectRequest } from '../../../CrowdControl/requests/CrowdControlTimedEffectRequest'

export abstract class ChangeCameraZoomEffectRequest
  extends CrowdControlTimedEffectRequest
  implements ICrowdControlTimedEffectRequest
{
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

    this.stop = () => clearEffect()

    applyEffect()
    return { status: RESPONSE_STATUS.SUCCESS, timeRemaining: duration }
  }
}
