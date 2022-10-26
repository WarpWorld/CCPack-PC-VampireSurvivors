import { ChangeVisibleEnemiesSpeedEffectRequest } from './abstract/ChangeVisibleEnemiesSpeedEffectRequest'
import { EFFECT_CODES } from './EffectCodes'

export class FreezeEnemies extends ChangeVisibleEnemiesSpeedEffectRequest {
  static override code = EFFECT_CODES.FREEZE_ENEMIES
  override code = FreezeEnemies.code
  override ratio = 0.00001
}
