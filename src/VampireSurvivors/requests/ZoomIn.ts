import { ChangeCameraZoomEffectRequest } from './abstract/ChangeCameraZoomEffectRequest'
import { EFFECT_CODES } from './EffectCodes'

export class ZoomIn extends ChangeCameraZoomEffectRequest {
  static override code = EFFECT_CODES.ZOOM_IN
  override code = ZoomIn.code
  
  override zoom = 2
}
