import { ChangePlayerScaleEffectRequest } from './abstract/ChangePlayerScaleEffectRequest'
import { EFFECT_CODES } from './EffectCodes'

export class TinyPlayer extends ChangePlayerScaleEffectRequest {
  static override code = EFFECT_CODES.TINY_PLAYER
  override code = TinyPlayer.code

  override ratio = 0.25
}
