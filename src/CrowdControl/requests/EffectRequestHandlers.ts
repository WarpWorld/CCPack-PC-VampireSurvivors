import type { CrowdControlEffectClass, CrowdControlEffectRequest } from '.'
import {
  CrowdControlEffectRequestBody,
  CrowdControlEffectRequestHandler,
  RESPONSE_STATUS,
} from '../CrowdControlWebsocketClient'
import { log } from '../utils/log'
import type { CrowdControlBaseEffectRequest } from './CrowdControlBaseEffectRequest'
import { isCrowdControlInstantEffectRequestClass } from './CrowdControlInstantEffectRequest'
import {
  isCrowdControlTimedEffectRequest,
  isCrowdControlTimedEffectRequestClass,
} from './CrowdControlTimedEffectRequest'

export const getEffectRequestHandlers = (
  requests: Record<string, CrowdControlEffectClass>,
  activeEffectRequestsGetter?: () => CrowdControlBaseEffectRequest[]
) => {
  const onHandlerEffect = (type: 'start' | 'stop', requestBody: CrowdControlEffectRequestBody) => {
    const { code: requestCode } = requestBody
    if (!requestCode) return { status: RESPONSE_STATUS.FAILURE, message: `Missing or Unknown code: "${requestCode}"` }

    const EffectRequestClass = Object.values(requests).find((e) => {
      const { code: effectCode } = e
      let regExp = new RegExp(`^${effectCode}$`, 'i')
      if (effectCode.includes('*'))
        regExp = new RegExp(`^${effectCode.replace('*', '[a-zA-Z0-9_]+').replace('?', '[a-zA-Z0-9_]')}$`, 'i')

      return !!regExp.exec(requestCode)
    })

    const defaultResponse = { status: RESPONSE_STATUS.FAILURE, message: `Unknown Error for: "${requestCode}"` }
    let response: ReturnType<CrowdControlEffectRequestHandler> | {} = {}
    if (EffectRequestClass) {
      const { conflicts } = EffectRequestClass
      const activeEffectsRequests = activeEffectRequestsGetter?.()

      if (activeEffectsRequests && conflicts?.length) {
        const conflictCode = conflicts.find((conflict) =>
          activeEffectsRequests.find((effect) => conflict === effect.code)
        )
        if (conflictCode)
          return { status: RESPONSE_STATUS.RETRY, message: `Conflict for: "${requestCode}" with "${conflictCode}` }
      }

      if (type === 'start') {
        if (isCrowdControlTimedEffectRequestClass(EffectRequestClass)) {
          const effect = new EffectRequestClass(requestBody)
          response = effect.start()
        } else if (isCrowdControlInstantEffectRequestClass(EffectRequestClass)) {
          const effect = new EffectRequestClass(requestBody)
          response = effect.trigger()
        }
      } else if (type === 'stop') {
        const effect = activeEffectsRequests?.find((effect) => effect.code === requestCode)
        if (effect && isCrowdControlTimedEffectRequest(effect)) {
          effect.stop()
          response = { status: RESPONSE_STATUS.SUCCESS }
        }
      }
    } else {
      log(`No Effect found for code: "${requestCode}"`)
      response = {
        status: RESPONSE_STATUS.FAILURE,
        message: `No Effect found for: "${requestCode}"`,
      }
    }
    return { ...defaultResponse, ...response }
  }

  return {
    onEffectStart: (request: CrowdControlEffectRequestBody) => onHandlerEffect('start', request),
    onEffectStop: (request: CrowdControlEffectRequestBody) => onHandlerEffect('stop', request),
  }
}
