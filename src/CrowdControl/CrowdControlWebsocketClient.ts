import { log } from './utils'

const DEFAULT_SOCKET_URL = 'ws://localhost:43384'

export const RESPONSE_STATUS = {
  /// <The effect executed successfully.</summary>
  SUCCESS: 0x00,
  /// <The effect failed to trigger, but is still available for use. Viewer(s) will be refunded. You probably don't want this.</summary>
  FAILURE: 0x01,
  /// <Same as <see cref="Failure"/> but the effect is no longer available for use for the remainder of the game. You probably don't want this.</summary>
  UNAVAILABLE: 0x02,
  /// <The effect cannot be triggered right now, try again in a few seconds. This is the "normal" failure response.</summary>
  RETRY: 0x03,
  /// <INTERNAL USE ONLY. The effect has been queued for execution after the current one ends.</summary>
  // QUEUE: 0x04,
  /// <INTERNAL USE ONLY. The effect triggered successfully and is now active until it ends.</summary>
  // RUNNING: 0x05,
  /// <The timed effect has been paused and is now waiting.</summary>
  PAUSED: 0x06,
  /// <The timed effect has been resumed and is counting down again.</summary>
  RESUMED: 0x07,
  /// <The timed effect has finished.</summary>
  FINISHED: 0x08,
  /// <The processor isn't ready to start or has shut down.</summary>
  NOTREADY: 0xff,
} as const

const EFFECT_REQUEST_TYPE = {
  TEST: 0x00,
  START: 0x01,
  STOP: 0x02,
  // LOGIN: 0xf0,
  // KEEPALIVE: 0xff,
} as const

type Target = {
  id: string
  name: string
  avatar: string
}

export type CrowdControlEffectRequestBody = {
  id: number
  type: typeof EFFECT_REQUEST_TYPE[keyof typeof EFFECT_REQUEST_TYPE]
  code?: string
  parameters?: any[]
  targets?: Target[]
  message?: string
  viewer?: string
  cost?: number
  duration?: number
}

type OptionalParameters = {
  url?: string
  onEffectRequest?: (requestBody: CrowdControlEffectRequestBody) => void
  onEffectRequestSuccess?: (requestBody: CrowdControlEffectRequestBody) => void
  onSocketOpen?: (event: Event) => void
  onSocketClose?: (event: Event) => void
  onSocketMessage?: (event: Event) => void
  onSocketMessageError?: (error: Error) => void
  onSocketError?: (event: Event) => void
}

export type CrowdControlEffectResponse = {
  id: number
  status: typeof RESPONSE_STATUS[keyof typeof RESPONSE_STATUS]
  timeRemaining?: number
  message?: string
}

export type CrowdControlEffectRequestHandler = (
  request: CrowdControlEffectRequestBody
) => Omit<CrowdControlEffectResponse, 'id'>

export const createCrowdControlWebsocketClient = (
  onEffectStart: CrowdControlEffectRequestHandler,
  onEffectStop: CrowdControlEffectRequestHandler,
  {
    url,
    onEffectRequest,
    onEffectRequestSuccess,
    onSocketOpen,
    onSocketClose,
    onSocketMessage,
    onSocketMessageError,
    onSocketError,
  }: OptionalParameters = {}
) => {
  // Default to the default socket URL
  const wsUrl = url || DEFAULT_SOCKET_URL
  let reconnectTimeoutID: ReturnType<typeof setTimeout> | undefined

  const attemptReconnect = () => {
    if (reconnectTimeoutID) return

    reconnectTimeoutID = setTimeout(() => {
      log('Socket attempting to reconnect')
      reconnectTimeoutID = undefined
      close()
      connect()
    }, 5000)
  }

  const _onSocketOpen = (event: Event) => {
    log('Socket Connection established')
    if (onSocketOpen) onSocketOpen(event)
  }

  const _onSocketMessage = (event: MessageEvent) => {
    log('Socket Message received', event.data)
    if (onSocketMessage) onSocketMessage(event)

    if (!socket) return

    try {
      const request = JSON.parse(event.data) as CrowdControlEffectRequestBody
      const { id, type } = request
      const defaultResponse: CrowdControlEffectResponse = {
        id,
        status: RESPONSE_STATUS.FAILURE,
      }

      let response: CrowdControlEffectResponse | undefined
      try {
        let effectResponse: Omit<CrowdControlEffectResponse, 'id'> | undefined

        if (type === EFFECT_REQUEST_TYPE.START) {
          effectResponse = onEffectStart(request)
        } else if (type === EFFECT_REQUEST_TYPE.STOP) {
          effectResponse = onEffectStop(request)
        }

        response = !effectResponse ? { ...defaultResponse } : { ...defaultResponse, ...effectResponse }
      } catch (error) {
        log('Error while executing effect', error)
        response = {
          ...defaultResponse,
          status: RESPONSE_STATUS.FAILURE,
          message: error instanceof Error ? error.message : 'Unknown Error while executing effect',
        }
      }

      if (type === EFFECT_REQUEST_TYPE.START) {
        onEffectRequest?.(request)
        if (response.status === RESPONSE_STATUS.SUCCESS) onEffectRequestSuccess?.(request)
      }
      socket.send(JSON.stringify(response))
    } catch (error) {
      log('Error parsing socket message', error)
      if (onSocketMessageError && error instanceof Error) onSocketMessageError(error)
    }
  }

  const _onSocketClose = (event: CloseEvent) => {
    if (onSocketClose) onSocketClose(event)
    {
      if (event.wasClean) {
        log(`Connection closed cleanly, code=${event.code} reason=${event.reason}`)
      } else {
        log('Connection died')
      }
    }

    attemptReconnect()
  }

  const _onSocketError = (error: Event) => {
    if (onSocketError) onSocketError(error)
    log('Socket Error', error)
    attemptReconnect()
  }

  let socket: WebSocket | undefined
  const connect = () => {
    // Already have a socket connect?
    if (socket?.CONNECTING || socket?.OPEN) return
    // Was the socket initialized already? If so we should not create listeners again
    const initialized = !!socket

    socket = new WebSocket(wsUrl)

    if (!initialized) {
      socket.addEventListener('open', _onSocketOpen)
      socket.addEventListener('message', _onSocketMessage)
      socket.addEventListener('close', _onSocketClose)
      socket.addEventListener('error', _onSocketError)
    }

    return socket
  }

  const close = () => {
    if (socket?.CONNECTING || socket?.OPEN) {
      socket.close()
    }

    if (socket) {
      socket.removeEventListener('open', _onSocketOpen)
      socket.removeEventListener('message', _onSocketMessage)
      socket.removeEventListener('close', _onSocketClose)
      socket.removeEventListener('error', _onSocketError)
    }

    socket = undefined
  }

  return {
    connect,
    close,
    get connected() {
      return socket?.CONNECTING || socket?.OPEN
    },
    get socket() {
      return socket
    },
  }
}
