import type { createCrowdControlWebsocketClient } from '../CrowdControl'
import type { CrowdControlBaseEffectRequest } from '../CrowdControl/requests/CrowdControlBaseEffectRequest'
import { isCrowdControlTimedEffectRequest } from '../CrowdControl/requests/CrowdControlTimedEffectRequest'
import { createTimeoutCollection } from '../CrowdControl/utils'
const {
  addTimeout: _addTimeout,
  clearAll,
  destroy,
  getIsPaused,
  pause: _pause,
  resume: _resume,
} = createTimeoutCollection()

const activeEffectRequests: CrowdControlBaseEffectRequest[] = []

const addTimeout = (effectRequest: CrowdControlBaseEffectRequest, ...params: Parameters<typeof _addTimeout>) => {
  activeEffectRequests.push(effectRequest)
  const [_cb, ...rest] = params
  const cb = () => {
    _cb()
    activeEffectRequests.splice(activeEffectRequests.indexOf(effectRequest), 1)
  }

  return _addTimeout(cb, ...rest)
}

export const getActiveEffects = () => Array.from(activeEffectRequests)

let _sendPauseRequestHandler: ReturnType<typeof createCrowdControlWebsocketClient>['sendPauseRequest'] | undefined
let _sendResumeRequestHandler: ReturnType<typeof createCrowdControlWebsocketClient>['sendResumeRequest'] | undefined
export const setSocketRequestHandlers = ({
  sendPauseRequestHandler,
  sendResumeRequestHandler,
}: {
  sendPauseRequestHandler: typeof _sendPauseRequestHandler
  sendResumeRequestHandler: typeof _sendResumeRequestHandler
}) => {
  _sendPauseRequestHandler = sendPauseRequestHandler
  _sendResumeRequestHandler = sendResumeRequestHandler
}

const pause = () => {
  _pause()

  if (!_sendPauseRequestHandler) return
  activeEffectRequests.forEach((effectRequest) => {
    _sendPauseRequestHandler?.(effectRequest.request.id)
  })
}

const resume = () => {
  _resume()

  if (!_sendResumeRequestHandler) return
  activeEffectRequests.forEach((effectRequest) => {
    if (isCrowdControlTimedEffectRequest(effectRequest)) {
      const {
        timeout,
        request: { id },
      } = effectRequest

      if (!timeout) return
      const { remaining } = timeout
      _sendResumeRequestHandler?.(id, remaining)
    }
  })
}

export { addTimeout, clearAll, destroy, getIsPaused, pause, resume }
