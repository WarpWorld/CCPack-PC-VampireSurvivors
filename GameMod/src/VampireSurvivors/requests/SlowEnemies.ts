import { ChangeVisibleEnemiesSpeedEffectRequest } from './abstract/ChangeVisibleEnemiesSpeedEffectRequest'
import { EFFECT_CODES } from './EffectCodes'

export class SlowEnemies extends ChangeVisibleEnemiesSpeedEffectRequest {
  static override code = EFFECT_CODES.SLOW_ENEMIES
  override code = SlowEnemies.code

  override ratio = .25
}
