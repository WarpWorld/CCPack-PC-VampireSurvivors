import { CrowdControlInstantEffectRequest, RESPONSE_STATUS } from '../../CrowdControl'
import { getGame, getIsGamePaused, getIsPlayerDead } from '../VampireSurvivorsGameState'
import { EFFECT_CODES } from './EffectCodes'

const AMOUNT = 10
export class Punch extends CrowdControlInstantEffectRequest {
  static override code = EFFECT_CODES.PUNCH
  static override conflicts = [EFFECT_CODES.INVULNERABLE]
  override code = Punch.code

  override trigger() {
    const Game = getGame()
    const isGamePaused = getIsGamePaused()
    const isPlayerDead = getIsPlayerDead()

    if (!Game || isPlayerDead) return { status: RESPONSE_STATUS.FAILURE }
    if (isGamePaused) return { status: RESPONSE_STATUS.RETRY }

    Game.Core.Player.GetDamaged(AMOUNT)

    return { status: RESPONSE_STATUS.SUCCESS }
  }
}
