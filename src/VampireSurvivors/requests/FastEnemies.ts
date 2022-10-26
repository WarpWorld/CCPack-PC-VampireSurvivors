import { ChangeVisibleEnemiesSpeedEffectRequest } from './abstract/ChangeVisibleEnemiesSpeedEffectRequest'
import { EFFECT_CODES } from './EffectCodes'

export class FastEnemies extends ChangeVisibleEnemiesSpeedEffectRequest {
  static override code = EFFECT_CODES.FAST_ENEMIES
  override ratio = 10
  override code = FastEnemies.code
}
