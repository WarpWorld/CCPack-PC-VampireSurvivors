import { Timeout } from './CrowdControlTimeout'
import {
  type CrowdControlEffectRequestBody,
  type CrowdControlEffectRequestResponse,
  CrowdControlWebSocketClient,
  CrowdControlWebsocketEventTypes,
  EFFECT_REQUEST_TYPE,
  RESPONSE_STATUS,
  StartEffectRequestEvent,
  StopEffectRequestEvent,
} from './CrowdControlWebSocketClient'
import type { CrowdControlEffectClass, CrowdControlEffectRequest, CrowdControlTimedEffectRequest } from './requests'
import { isCrowdControlInstantEffectRequest } from './requests/CrowdControlInstantEffectRequest'
import { isCrowdControlTimedEffectRequest } from './requests/CrowdControlTimedEffectRequest'
import { CrowdControlTimeoutCollection, log } from './utils'

export const CrowdControlManagerEventTypes = {
  START_EFFECT_REQUEST_STARTED: 'start-effect-request-started',
} as const

export class StartEffectRequestStartedEvent extends Event {
  constructor(
    readonly requestBody: CrowdControlEffectRequestBody,
    readonly response: CrowdControlEffectRequestResponse,
    readonly effectRequest: CrowdControlEffectRequest
  ) {
    super(CrowdControlManagerEventTypes.START_EFFECT_REQUEST_STARTED)
  }
}

interface CrowdControlManagerEventMap {
  [CrowdControlManagerEventTypes.START_EFFECT_REQUEST_STARTED]: StartEffectRequestStartedEvent
}

export interface CrowdControlManager extends EventTarget {
  addEventListener<K extends keyof CrowdControlManagerEventMap>(
    type: K,
    listener: (ev: CrowdControlManagerEventMap[K]) => void,
    options?: boolean | AddEventListenerOptions
  ): void
  addEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions
  ): void
  removeEventListener<K extends keyof CrowdControlManagerEventMap>(
    type: K,
    listener: (ev: CrowdControlManagerEventMap[K]) => void,
    options?: boolean | EventListenerOptions
  ): void
  removeEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | EventListenerOptions
  ): void
}
export class CrowdControlManager extends EventTarget {
  protected effectRequestClasses: CrowdControlEffectClass[] = []
  protected timeoutCollection: CrowdControlTimeoutCollection
  protected activeTimedEffectInfoCollection: {
    timeout: Timeout
    effectRequest: CrowdControlTimedEffectRequest
    response: CrowdControlEffectRequestResponse
  }[] = []

  constructor(
    EffectRequestClassMap: Record<string, CrowdControlEffectClass>,
    readonly CrowdControlWebsocketClient: CrowdControlWebSocketClient
  ) {
    super()

    const me = this

    CrowdControlWebsocketClient.addEventListener(
      CrowdControlWebsocketEventTypes.START_EFFECT_REQUEST,
      this.handleEffectRequest
    )

    CrowdControlWebsocketClient.addEventListener(
      CrowdControlWebsocketEventTypes.STOP_EFFECT_REQUEST,
      this.handleEffectRequest
    )

    this.effectRequestClasses = Object.values(EffectRequestClassMap)
    this.timeoutCollection = new CrowdControlTimeoutCollection({
      onTick() {
        // Allow each effect to have a tick
        me.activeTimedEffectInfoCollection.forEach(({ effectRequest, timeout }) => {
          if (!timeout.complete) effectRequest.onTick()
        })

        // cleanup all complete effects here
        me.activeTimedEffectInfoCollection = me.activeTimedEffectInfoCollection.filter(
          ({ timeout }) => !timeout.complete
        )

        if (me.activeTimedEffectInfoCollection.length)
          log('Remaining Effects', me.activeTimedEffectInfoCollection.length)
      },
    })
  }

  public pause() {
    const { activeTimedEffectInfoCollection, CrowdControlWebsocketClient } = this

    this.timeoutCollection.pause()
    activeTimedEffectInfoCollection.forEach(({ effectRequest, timeout }) => {
      if (!timeout.complete) effectRequest.onPause()
      CrowdControlWebsocketClient.sendPauseRequest(effectRequest.request.id)
    })
  }

  public resume() {
    const { activeTimedEffectInfoCollection, CrowdControlWebsocketClient } = this

    this.timeoutCollection.resume()
    activeTimedEffectInfoCollection.forEach(({ effectRequest, timeout }) => {
      if (!timeout.complete) effectRequest.onResume()
      CrowdControlWebsocketClient.sendResumeRequest(effectRequest.request.id, timeout.remaining)
    })
  }

  public reset() {
    log('Resetting Crowd Control Manager')
    const { CrowdControlWebsocketClient } = this

    this.activeTimedEffectInfoCollection.forEach(({ effectRequest }) =>
      CrowdControlWebsocketClient.sendFinishRequest(effectRequest.request.id)
    )
    this.timeoutCollection.reset()
    this.activeTimedEffectInfoCollection = []
  }

  protected handleEffectRequest = (event: StartEffectRequestEvent | StopEffectRequestEvent) => {
    const { requestBody } = event
    const { type } = requestBody
    const { effectRequest, ...response } = this.doEffectRequest(requestBody)

    if (effectRequest && type === EFFECT_REQUEST_TYPE.START && response.status === RESPONSE_STATUS.SUCCESS) {
      if (requestBody.duration && isCrowdControlTimedEffectRequest(effectRequest)) {
        const timeout = new Timeout(() => effectRequest.stop(), requestBody.duration)
        this.timeoutCollection.addTimeout(timeout)

        this.activeTimedEffectInfoCollection.push({ timeout, response, effectRequest })
      }

      this.dispatchEvent(new StartEffectRequestStartedEvent(requestBody, response, effectRequest))
    }

    this.CrowdControlWebsocketClient.sendEffectRequestResponse(requestBody, response)
  }

  protected doEffectRequest = (
    requestBody: CrowdControlEffectRequestBody
  ): CrowdControlEffectRequestResponse & { effectRequest?: CrowdControlEffectRequest } => {
    const { id, code: requestCode, type } = requestBody
    if (!requestCode)
      return { id, status: RESPONSE_STATUS.FAILURE, message: `Missing or Unknown code: "${requestCode}"` }

    const EffectRequestClass = this.effectRequestClasses.find((e) => {
      const { code: effectCode } = e
      let regExp = new RegExp(`^${effectCode}$`, 'i')
      if (effectCode.includes('*'))
        regExp = new RegExp(`^${effectCode.replace('*', '[a-zA-Z0-9_]+').replace('?', '[a-zA-Z0-9_]')}$`, 'i')

      return !!regExp.exec(requestCode)
    })

    if (EffectRequestClass) {
      const { conflicts } = EffectRequestClass

      if (conflicts?.length) {
        const conflictCode = conflicts.find((conflict) =>
          this.activeTimedEffectInfoCollection.find(({ effectRequest }) => conflict === effectRequest.code)
        )
        if (conflictCode)
          return { id, status: RESPONSE_STATUS.RETRY, message: `Conflict for: "${requestCode}" with "${conflictCode}` }
      }

      if (type === EFFECT_REQUEST_TYPE.START) {
        const effectRequest = new EffectRequestClass(requestBody)
        if (isCrowdControlTimedEffectRequest(effectRequest)) {
          return { id, ...effectRequest.start(), effectRequest }
        } else if (isCrowdControlInstantEffectRequest(effectRequest)) {
          return { id, ...effectRequest.trigger(), effectRequest }
        }

        return { id, status: RESPONSE_STATUS.FAILURE, message: `Unknown EffectRequestClass for: "${requestCode}"` }
      } else if (type === EFFECT_REQUEST_TYPE.STOP) {
        const effectInfo = this.activeTimedEffectInfoCollection.find(
          ({ effectRequest }) => effectRequest.code === requestCode
        )

        const { effectRequest } = effectInfo || {}
        if (effectRequest && isCrowdControlTimedEffectRequest(effectRequest)) {
          log('Stop Message from server is stopping effect', effectRequest.code)
          effectRequest.stop()
          return { id, status: RESPONSE_STATUS.SUCCESS }
        }

        return { id, status: RESPONSE_STATUS.FAILURE, message: `No active effect found for: "${requestCode}"` }
      }
    } else {
      log(`No Effect found for code: "${requestCode}"`)
      return {
        id,
        status: RESPONSE_STATUS.FAILURE,
        message: `No Effect found for: "${requestCode}"`,
      }
    }

    return { id, status: RESPONSE_STATUS.FAILURE, message: `Unknown Error for: "${requestCode}"` }
  }
}
