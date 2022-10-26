import { ChangePlayerScaleEffectRequest } from './abstract/ChangePlayerScaleEffectRequest'
import { EFFECT_CODES } from './EffectCodes'

export class GiantPlayer extends ChangePlayerScaleEffectRequest {
  static override code = EFFECT_CODES.GIANT_PLAYER
  override code = GiantPlayer.code
  override ratio = 3
}
