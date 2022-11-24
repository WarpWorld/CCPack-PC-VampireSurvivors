import { CrowdControlBaseEffectRequest } from './CrowdControlBaseEffectRequest'

import type { CrowdControlEffectRequestResponse } from '../CrowdControlWebSocketClient'
export interface ICrowdControlTimedEffectRequest {
  start(): Omit<CrowdControlEffectRequestResponse, 'id'>
  stop(): void
}

export abstract class CrowdControlTimedEffectRequest extends CrowdControlBaseEffectRequest {
  abstract start(): Omit<CrowdControlEffectRequestResponse, 'id'>
  stop(): void {}
  onPause(): void {}
  onResume(): void {}
  onTick(): void {}
}

export const isCrowdControlTimedEffectRequest = (
  effectRequest: CrowdControlBaseEffectRequest
): effectRequest is CrowdControlTimedEffectRequest => effectRequest instanceof CrowdControlTimedEffectRequest
