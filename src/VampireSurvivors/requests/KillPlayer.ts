import { CrowdControlInstantEffectRequest, RESPONSE_STATUS } from '../../CrowdControl'
import { getGame, getIsGamePaused, getIsPlayerDead } from '../VampireSurvivorsGameState'
import { EFFECT_CODES } from './EffectCodes'

export class KillPlayer extends CrowdControlInstantEffectRequest {
  static override code = EFFECT_CODES.KILL_PLAYER
  static override conflicts = [EFFECT_CODES.INVULNERABLE]

  override code = KillPlayer.code

  override trigger() {
    const Game = getGame()
    const isGamePaused = getIsGamePaused()
    const isPlayerDead = getIsPlayerDead()

    if (!Game || isPlayerDead) return { status: RESPONSE_STATUS.FAILURE }
    if (isGamePaused) return { status: RESPONSE_STATUS.RETRY }

    Game.Core.Player.Die()

    return { status: RESPONSE_STATUS.SUCCESS }
  }
}
