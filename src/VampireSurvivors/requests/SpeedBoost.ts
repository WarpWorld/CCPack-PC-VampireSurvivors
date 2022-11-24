import { ChangePlayerSpeedEffectRequest } from './abstract/ChangePlayerSpeedEffectRequest'
import { EFFECT_CODES } from './EffectCodes'

export class SpeedBoost extends ChangePlayerSpeedEffectRequest {
  static override code = EFFECT_CODES.SPEED_BOOST
  override code = SpeedBoost.code

  override speed = 10
}
