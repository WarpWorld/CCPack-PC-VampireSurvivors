import { CrowdControlInstantEffectRequest, RESPONSE_STATUS } from '../../CrowdControl'
import type { ICrowdControlInstantEffectRequest } from '../../CrowdControl/requests/CrowdControlInstantEffectRequest'
import { getGame, getIsGamePaused, getIsPlayerDead } from '../VampireSurvivorsState'
import { EFFECT_CODES } from './EffectCodes'

export class GiveWeapon extends CrowdControlInstantEffectRequest implements ICrowdControlInstantEffectRequest {
  static override code = EFFECT_CODES.GIVE_WEAPON
  override code = GiveWeapon.code

  override trigger(): ReturnType<CrowdControlInstantEffectRequest['trigger']> {
    const Game = getGame()
    const isGamePaused = getIsGamePaused()
    const isPlayerDead = getIsPlayerDead()
    const { code } = this.request

    if (!Game || !code || isPlayerDead) return { status: RESPONSE_STATUS.FAILURE }
    if (isGamePaused) return { status: RESPONSE_STATUS.RETRY }

    const PREFIX = GiveWeapon.code.replace('*', '')
    const weaponID = code.replace(PREFIX, '').toUpperCase()
    const weapon = Game.Core.Weapons.find((weapon) => weapon.bulletType === weaponID)

    if (weapon) {
      const originalLevel = weapon.level
      Game.Core.LevelWeaponUp(weaponID)

      if (weapon.level > originalLevel) {
        this.overlayPrefix = 'Upgrade'
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
