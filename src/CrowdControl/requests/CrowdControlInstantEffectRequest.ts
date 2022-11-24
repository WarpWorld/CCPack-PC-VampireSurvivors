import type { CrowdControlEffectRequestResponse } from '../CrowdControlWebSocketClient'
import { CrowdControlBaseEffectRequest } from './CrowdControlBaseEffectRequest'

export interface ICrowdControlInstantEffectRequest {
  trigger(): Omit<CrowdControlEffectRequestResponse, 'id'>
}
export abstract class CrowdControlInstantEffectRequest extends CrowdControlBaseEffectRequest {
  abstract trigger(): Omit<CrowdControlEffectRequestResponse, 'id'>
}

export const isCrowdControlInstantEffectRequest = (
  effectRequest: CrowdControlBaseEffectRequest
): effectRequest is CrowdControlInstantEffectRequest => effectRequest instanceof CrowdControlInstantEffectRequest
