import { CrowdControlInstantEffectRequest, RESPONSE_STATUS } from '../../CrowdControl'
import type { ICrowdControlInstantEffectRequest } from '../../CrowdControl/requests/CrowdControlInstantEffectRequest'
import { getGame, getIsGamePaused, getIsPlayerDead } from '../VampireSurvivorsState'
import { EFFECT_CODES } from './EffectCodes'

const AMOUNT = 10
export class Punch extends CrowdControlInstantEffectRequest implements ICrowdControlInstantEffectRequest {
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
    Game.Core.Player.x -= 10
    Game.Core.Player.y -= 10

    return { status: RESPONSE_STATUS.SUCCESS }
  }
}
