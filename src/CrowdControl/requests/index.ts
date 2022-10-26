import type { CrowdControlBaseEffectRequest } from './CrowdControlBaseEffectRequest'
import type { CrowdControlInstantEffectRequest } from './CrowdControlInstantEffectRequest'
import type { CrowdControlTimedEffectRequest } from './CrowdControlTimedEffectRequest'

export { CrowdControlInstantEffectRequest } from './CrowdControlInstantEffectRequest'
export { CrowdControlTimedEffectRequest } from './CrowdControlTimedEffectRequest'
export * from './EffectRequestHandlers'
export { getEffectRequestHandlers } from './EffectRequestHandlers'

export type CrowdControlEffectClass = {
  new (...args: ConstructorParameters<typeof CrowdControlBaseEffectRequest>): CrowdControlEffectRequest
  code: string
  conflicts: string[]
}
export type CrowdControlEffectRequest = CrowdControlTimedEffectRequest | CrowdControlInstantEffectRequest
