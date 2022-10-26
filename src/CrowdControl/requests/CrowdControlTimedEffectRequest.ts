import type { CrowdControlEffectClass, CrowdControlEffectRequest } from '.'
import type { CrowdControlEffectRequestHandler } from '../CrowdControlWebsocketClient'
import { CrowdControlBaseEffectRequest } from './CrowdControlBaseEffectRequest'

export abstract class CrowdControlTimedEffectRequest extends CrowdControlBaseEffectRequest {
  abstract start(): ReturnType<CrowdControlEffectRequestHandler>
  stop(): void {}
  onGameStateUpdate(): void {}
}

export const isCrowdControlTimedEffectRequestClass = (
  cls: CrowdControlEffectClass
): cls is {
  new (...args: ConstructorParameters<typeof CrowdControlTimedEffectRequest>): CrowdControlTimedEffectRequest
  code: string
  conflicts: string[]
} => {
  return cls.prototype instanceof CrowdControlTimedEffectRequest
}

export const isCrowdControlTimedEffectRequest = (
  effectRequest: CrowdControlBaseEffectRequest
): effectRequest is CrowdControlTimedEffectRequest => effectRequest instanceof CrowdControlTimedEffectRequest
