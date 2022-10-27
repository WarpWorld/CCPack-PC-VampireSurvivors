import { CrowdControlInstantEffectRequest, RESPONSE_STATUS } from '../../CrowdControl'
import { getGame, getIsGamePaused, getIsPlayerDead } from '../VampireSurvivorsGameState'
import { EFFECT_CODES } from './EffectCodes'

export class GiveWeapon extends CrowdControlInstantEffectRequest {
  static override code = EFFECT_CODES.GIVE_WEAPON
  override code = GiveWeapon.code

  override trigger() {
    const Game = getGame()
    const isGamePaused = getIsGamePaused()
    const isPlayerDead = getIsPlayerDead()
    const { code } = this.request

    if (!Game || !code || isPlayerDead) return { status: RESPONSE_STATUS.FAILURE }
    if (isGamePaused) return { status: RESPONSE_STATUS.RETRY }

    const PREFIX = GiveWeapon.code.replace('*', '')
    const weaponID = code.replace(PREFIX, '').toUpperCase()
    const hasWeapon = Game.Core.Weapons.find((weapon) => weapon.bulletType === weaponID)
    //if (hasWeapon) return { status: RESPONSE_STATUS.FAILURE }

    if (hasWeapon) {
      const originalLevel = hasWeapon.level
      Game.Core.LevelWeaponUp(weaponID)

      if (hasWeapon.level > originalLevel) {
        return { status: RESPONSE_STATUS.SUCCESS }
      } else {
        return { status: RESPONSE_STATUS.FAILURE }
      }
    } else {
      Game.Core.AddWeapon(weaponID)
      return { status: RESPONSE_STATUS.SUCCESS }
    }
  }
}
