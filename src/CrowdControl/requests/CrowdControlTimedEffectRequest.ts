import type { CrowdControlEffectClass } from '.'
import type { addTimeout } from '../../VampireSurvivors/VampireSurvivorsEffectCollection'
import type { CrowdControlEffectRequestHandler } from '../CrowdControlWebsocketClient'
import { CrowdControlBaseEffectRequest } from './CrowdControlBaseEffectRequest'

export abstract class CrowdControlTimedEffectRequest extends CrowdControlBaseEffectRequest {
  abstract start(): ReturnType<CrowdControlEffectRequestHandler>
  timeout?: ReturnType<typeof addTimeout>
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
