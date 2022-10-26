import type { CrowdControlEffectClass } from '.'
import type { CrowdControlEffectRequestHandler } from '../CrowdControlWebsocketClient'
import { CrowdControlBaseEffectRequest } from './CrowdControlBaseEffectRequest'

export abstract class CrowdControlInstantEffectRequest extends CrowdControlBaseEffectRequest {
  abstract trigger(): ReturnType<CrowdControlEffectRequestHandler>
}

export const isCrowdControlInstantEffectRequestClass = (
  cls: CrowdControlEffectClass
): cls is {
  new (...args: ConstructorParameters<typeof CrowdControlInstantEffectRequest>): CrowdControlInstantEffectRequest
  code: string
  conflicts: string[]
} => {
  return cls.prototype instanceof CrowdControlInstantEffectRequest
}
