import { CrowdControlInstantEffectRequest, RESPONSE_STATUS } from '../../CrowdControl'
import { getGame, getIsGamePaused, getIsPlayerDead } from '../VampireSurvivorsGameState'
import { EFFECT_CODES } from './EffectCodes'

export class TakeWeapon extends CrowdControlInstantEffectRequest {
  static override code = EFFECT_CODES.TAKE_WEAPON
  override code = TakeWeapon.code

  override trigger() {
    const Game = getGame()
    const isGamePaused = getIsGamePaused()
    const isPlayerDead = getIsPlayerDead()
    const { code } = this.request

    if (!Game || !code || isPlayerDead) return { status: RESPONSE_STATUS.FAILURE }
    if (isGamePaused) return { status: RESPONSE_STATUS.RETRY }

    const PREFIX = TakeWeapon.code.replace('*', '')
    const weaponID = code.replace(PREFIX, '').toUpperCase()
    const hasWeapon = Game.Core.Weapons.find((weapon) => weapon.bulletType === weaponID)
    if (!hasWeapon) return { status: RESPONSE_STATUS.FAILURE }

    Game.Core.RemoveWeapon(weaponID)

    return { status: RESPONSE_STATUS.SUCCESS }
  }
}
