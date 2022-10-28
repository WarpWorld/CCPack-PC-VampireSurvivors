import { CrowdControlInstantEffectRequest, RESPONSE_STATUS } from '../../CrowdControl'
import type { ICrowdControlInstantEffectRequest } from '../../CrowdControl/requests/CrowdControlInstantEffectRequest'
import { getGame, getIsGamePaused, getIsPlayerDead } from '../VampireSurvivorsState'
import { EFFECT_CODES } from './EffectCodes'

export class GoldFever extends CrowdControlInstantEffectRequest implements ICrowdControlInstantEffectRequest {
  static override code = EFFECT_CODES.GOLD_FEVER
  override code = GoldFever.code

  trigger() {
    const Game = getGame()
    const isGamePaused = getIsGamePaused()
    const isPlayerDead = getIsPlayerDead()

    if (!Game || isPlayerDead) return { status: RESPONSE_STATUS.FAILURE }
    if (isGamePaused || Game.Core.GoldFever.isActive) return { status: RESPONSE_STATUS.RETRY }

    const { defaultCap } = Game.Core.GoldFever
    Game.Core.GoldFever.Start(defaultCap)

    return { status: RESPONSE_STATUS.SUCCESS }
  }
}
