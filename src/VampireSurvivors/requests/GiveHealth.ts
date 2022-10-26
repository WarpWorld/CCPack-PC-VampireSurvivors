import { CrowdControlInstantEffectRequest, RESPONSE_STATUS } from '../../CrowdControl'
import { getGame, getIsGamePaused, getIsPlayerDead } from '../VampireSurvivorsGameState'
import { EFFECT_CODES } from './EffectCodes'

const AMOUNT = 50
export class GiveHealth extends CrowdControlInstantEffectRequest {
  static override code = EFFECT_CODES.GIVE_HEALTH
  override code = GiveHealth.code

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

    Game.Core.Player.RecoverHp(AMOUNT, true)

    return { status: RESPONSE_STATUS.SUCCESS }
  }
}
