import type { CrowdControlBaseEffectRequest } from '../CrowdControl/requests/CrowdControlBaseEffectRequest'
import { createTimeoutCollection } from '../CrowdControl/utils'
const { addTimeout: _addTimeout, clearAll, destroy, getIsPaused, pause, resume } = createTimeoutCollection()

const activeEffects: CrowdControlBaseEffectRequest[] = []

const addTimeout = (id: CrowdControlBaseEffectRequest, ...params: Parameters<typeof _addTimeout>) => {
  activeEffects.push(id)
  const [_cb, ...rest] = params
  const cb = () => {
    _cb()
    activeEffects.splice(activeEffects.indexOf(id), 1)
  }

  return _addTimeout(cb, ...rest)
}

export const getActiveEffects = () => Array.from(activeEffects)

export { addTimeout, clearAll, destroy, getIsPaused, pause, resume }
