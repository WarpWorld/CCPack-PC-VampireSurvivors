import { ChangeCameraZoomEffectRequest } from './abstract/ChangeCameraZoomEffectRequest'
import { EFFECT_CODES } from './EffectCodes'

export class ZoomOut extends ChangeCameraZoomEffectRequest {
  static override code = EFFECT_CODES.ZOOM_OUT
  override code = ZoomOut.code

  override zoom = 0.65
}
