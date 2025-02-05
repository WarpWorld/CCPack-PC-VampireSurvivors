import { CrowdControlInstantEffectRequest, RESPONSE_STATUS } from '../../CrowdControl'
import type { ICrowdControlInstantEffectRequest } from '../../CrowdControl/requests/CrowdControlInstantEffectRequest'
import { getGame, getIsGamePaused, getIsPlayerDead } from '../VampireSurvivorsState'
import { EFFECT_CODES } from './EffectCodes'

export class FillHealth extends CrowdControlInstantEffectRequest implements ICrowdControlInstantEffectRequest {
  static override code = EFFECT_CODES.FILL_HEALTH
  override code = FillHealth.code

  override trigger() {
    const Game = getGame()
    const isGamePaused = getIsGamePaused()
    const isPlayerDead = getIsPlayerDead()

    if (!Game || isPlayerDead) return { status: RESPONSE_STATUS.FAILURE }

    const {
      Core: {
        Player: { hp, maxHp },
      },
    } = Game
    if (isGamePaused || hp === maxHp) return { status: RESPONSE_STATUS.RETRY }

    Game.Core.Player.RecoverHp(Game.Core.Player.maxHp, true)
    return { status: RESPONSE_STATUS.SUCCESS }
  }
}
