import { ChangeVisibleEnemiesScaleEffectRequest } from './abstract/ChangeVisibleEnemiesScaleEffectRequest'
import { EFFECT_CODES } from './EffectCodes'

export class TinyEnemies extends ChangeVisibleEnemiesScaleEffectRequest {
  static override code = EFFECT_CODES.TINY_ENEMIES
  override code = TinyEnemies.code

  override ratio = .25
}
