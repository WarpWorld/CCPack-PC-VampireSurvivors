import { ChangeVisibleEnemiesScaleEffectRequest } from './abstract/ChangeVisibleEnemiesScaleEffectRequest'
import { EFFECT_CODES } from './EffectCodes'

export class GiantEnemies extends ChangeVisibleEnemiesScaleEffectRequest {
  static override code = EFFECT_CODES.GIANT_ENEMIES
  override code = GiantEnemies.code
  override ratio = 2
}
