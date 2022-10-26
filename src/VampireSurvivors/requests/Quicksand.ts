import { ChangePlayerSpeedEffectRequest } from './abstract/ChangePlayerSpeedEffectRequest'
import { EFFECT_CODES } from './EffectCodes'

export class Quicksand extends ChangePlayerSpeedEffectRequest {
  static override code = EFFECT_CODES.QUICKSAND
  override code = Quicksand.code
  
  override speed = 0.65
}
