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
    const weapon = Game.Core.Weapons.find((weapon) => weapon.bulletType === weaponID)
    if (!weapon) return { status: RESPONSE_STATUS.FAILURE }

    const isDowngrade = weapon.level > 1
    Game.Core.RemoveWeapon(weaponID) //remove the weapon, we'll always need to do this

    setTimeout(() => {
      if (weapon.level === 2) {
        // if the weapon level was 2 then just adding it back in will make it a level 1
        Game.Core.AddWeapon(weaponID)
      } else if (weapon.level >= 3) {
        // add back the weapon
        Game.Core.AddWeapon(weaponID)
        for (let i = 1; i <= weapon.level - 2; i++) {
          // upgrade it the right amount of times so that it is 1 less than it used to be.
          Game.Core.LevelWeaponUp(weaponID)
        }
      }
    }, 10)

    return { status: RESPONSE_STATUS.SUCCESS, meta: isDowngrade ? { overlayPrefix: 'Downgrade' } : undefined }
  }
}
