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

    Game.Core.RemoveWeapon(weaponID) //remove the weapon, we'll always need to do this

    setTimeout(function() { 
      if ( hasWeapon.level === 2 ) {
        Game.Core.AddWeapon(weaponID) //if the weapon level was 2 then just adding it back in will make it a level 1
      } else if ( hasWeapon.level >= 3 ) {
        Game.Core.AddWeapon(weaponID) //add back the weapon
        for (let i = 1; i <= hasWeapon.level-2; i++) {
          Game.Core.LevelWeaponUp(weaponID) //upgrade it the right amount of times so that it is 1 less than it used to be.
        }
      }
    },10) //timeout is set because if we do the remove and add right away it doesnt seem to work. could maybe move this to an await?

    return { status: RESPONSE_STATUS.SUCCESS }
  }
}
