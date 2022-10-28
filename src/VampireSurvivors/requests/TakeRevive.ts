import { CrowdControlInstantEffectRequest, RESPONSE_STATUS } from '../../CrowdControl'
import type { ICrowdControlInstantEffectRequest } from '../../CrowdControl/requests/CrowdControlInstantEffectRequest'
import { getGame, getIsGameOverSceneActive, getIsMainSceneActive } from '../VampireSurvivorsState'
import { EFFECT_CODES } from './EffectCodes'

export class TakeRevive extends CrowdControlInstantEffectRequest implements ICrowdControlInstantEffectRequest {
  static override code = EFFECT_CODES.TAKE_REVIVE
  override code = TakeRevive.code

  override trigger() {
    const Game = getGame()
    const isMainSceneActive = getIsMainSceneActive()
    const isGameOverSceneActive = getIsGameOverSceneActive()

    if (!Game || (!isMainSceneActive && !isGameOverSceneActive) || !Game.Core.Player.revivals)
      return { status: RESPONSE_STATUS.FAILURE }

    Game.Core.Player.revivals -= 1
    // If the Player is sitting on the game over screen and revival gets dropped to 0
    // lets redraw the game over scene
    if (isGameOverSceneActive && !Game.Core.Player.revivals) {
      Game.Core.SceneManager.GameOverScene.children.removeAll()
      Game.Core.SceneManager.GameOverScene.canSeeReviveButton = false
      Game.Core.SceneManager.GameOverScene.create()
    }

    return { status: RESPONSE_STATUS.SUCCESS }
  }
}
