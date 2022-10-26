import { CrowdControlInstantEffectRequest, RESPONSE_STATUS } from '../../CrowdControl'
import { getGame, getIsGameOverSceneActive, getIsMainSceneActive } from '../VampireSurvivorsGameState'
import { EFFECT_CODES } from './EffectCodes'

export class GiveRevive extends CrowdControlInstantEffectRequest {
  static override code = EFFECT_CODES.GIVE_REVIVE
  override code = GiveRevive.code

  override trigger() {
    const Game = getGame()
    const isMainSceneActive = getIsMainSceneActive()
    const isGameOverSceneActive = getIsGameOverSceneActive()

    // If they are not in the main scene or the game over scene or they have revivals already
    if (!Game || (!isMainSceneActive && !isGameOverSceneActive) || !!Game.Core.Player.revivals)
      return { status: RESPONSE_STATUS.FAILURE }

    // Give them a revive
    Game.Core.Player.revivals = 1

    // If the Player is sitting on the game over screen and a revival comes in lets honor it.
    // They must have not had revivals prior to this effect (because we just gave them their only one)
    if (isGameOverSceneActive) {
      Game.Core.SceneManager.GameOverScene.children.removeAll()
      Game.Core.SceneManager.GameOverScene.canSeeReviveButton = true
      Game.Core.SceneManager.GameOverScene.create()
    }

    return { status: RESPONSE_STATUS.SUCCESS }
  }
}
