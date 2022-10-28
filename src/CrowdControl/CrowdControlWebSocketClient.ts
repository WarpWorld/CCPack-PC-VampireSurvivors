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

export const EFFECT_REQUEST_TYPE = {
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
  code: string
  parameters?: any[]
  targets?: Target[]
  message?: string
  viewer?: string
  cost?: number
  duration?: number
}

export type CrowdControlEffectRequestResponse = {
  id: number
  status: typeof RESPONSE_STATUS[keyof typeof RESPONSE_STATUS]
  timeRemaining?: number
  message?: string
}

export const CrowdControlWebsocketEventTypes = {
  OPEN: 'open',
  CLOSE: 'close',
  MESSAGE: 'message',
  ERROR: 'error',
  MESSAGE_ERROR: 'message-error',
  START_EFFECT_REQUEST: 'start-effect-request',
  STOP_EFFECT_REQUEST: 'stop-effect-request',
} as const

export class SocketOpenEvent extends Event {
  constructor() {
    super(CrowdControlWebsocketEventTypes.OPEN)
  }
}
export class SocketMessageEvent extends Event {
  constructor(readonly data: any) {
    super(CrowdControlWebsocketEventTypes.MESSAGE)
  }
}
export class StartEffectRequestEvent extends Event {
  constructor(readonly requestBody: CrowdControlEffectRequestBody) {
    super(CrowdControlWebsocketEventTypes.START_EFFECT_REQUEST)
  }
}

export class StopEffectRequestEvent extends Event {
  constructor(readonly requestBody: CrowdControlEffectRequestBody) {
    super(CrowdControlWebsocketEventTypes.STOP_EFFECT_REQUEST)
  }
}
export class SocketMessageErrorEvent extends Event {
  constructor(readonly error: Error) {
    super(CrowdControlWebsocketEventTypes.ERROR)
  }
}
export class SocketErrorEvent extends Event {
  constructor(readonly event: Event) {
    super(CrowdControlWebsocketEventTypes.ERROR)
  }
}

export class SocketCloseEvent extends Event {
  constructor(readonly code: number, readonly reason: string, readonly wasClean: boolean) {
    super(CrowdControlWebsocketEventTypes.CLOSE)
  }
}

interface CrowdControlWebsocketClientEventMap {
  [CrowdControlWebsocketEventTypes.OPEN]: SocketOpenEvent
  [CrowdControlWebsocketEventTypes.CLOSE]: SocketCloseEvent
  [CrowdControlWebsocketEventTypes.MESSAGE]: SocketMessageEvent
  [CrowdControlWebsocketEventTypes.ERROR]: SocketErrorEvent
  [CrowdControlWebsocketEventTypes.MESSAGE_ERROR]: SocketMessageErrorEvent
  [CrowdControlWebsocketEventTypes.START_EFFECT_REQUEST]: StartEffectRequestEvent
  [CrowdControlWebsocketEventTypes.STOP_EFFECT_REQUEST]: StopEffectRequestEvent
}

export interface CrowdControlWebSocketClient extends EventTarget {
  addEventListener<K extends keyof CrowdControlWebsocketClientEventMap>(
    type: K,
    listener: (ev: CrowdControlWebsocketClientEventMap[K]) => void,
    options?: boolean | AddEventListenerOptions
  ): void
  addEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions
  ): void
  removeEventListener<K extends keyof CrowdControlWebsocketClientEventMap>(
    type: K,
    listener: (ev: CrowdControlWebsocketClientEventMap[K]) => void,
    options?: boolean | EventListenerOptions
  ): void
  removeEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | EventListenerOptions
  ): void
}

export class CrowdControlWebSocketClient extends EventTarget {
  protected reconnectTimeoutID?: ReturnType<typeof setTimeout>
  protected socket?: WebSocket
  private _onSocketOpen?: (ev: Event) => void
  private _onSocketMessage?: (ev: MessageEvent) => void
  private _onSocketClose?: (ev: CloseEvent) => void
  private _onSocketError?: (ev: Event) => void

  constructor(readonly url: string = DEFAULT_SOCKET_URL) {
    super()
  }

  get connected() {
    return this.socket?.CONNECTING || this.socket?.OPEN
  }

  public sendEffectRequestResponse(
    _requestBody: CrowdControlEffectRequestBody,
    response: CrowdControlEffectRequestResponse
  ) {
    if (!this.socket) return

    this.socket.send(JSON.stringify(response))
  }

  public sendPauseRequest(id: number) {
    if (!this.socket || !this.connected) return

    log('Sending pause for request with id', id)
    this.socket.send(JSON.stringify({ id, STATUS: RESPONSE_STATUS.PAUSED }))
  }

  public sendResumeRequest(id: number, timeRemaining: number) {
    if (!this.socket || !this.connected) return

    log('Sending resume for request with id', id, timeRemaining)
    this.socket.send(
      JSON.stringify({ id, STATUS: RESPONSE_STATUS.RESUMED, timeRemaining: timeRemaining > 0 ? timeRemaining : 0 })
    )
  }
  public sendFinishRequest(id: number) {
    if (!this.socket || !this.connected) return

    log('Sending finished for request with id', id)
    this.socket.send(JSON.stringify({ id, STATUS: RESPONSE_STATUS.FINISHED }))
  }

  protected attemptReconnect() {
    if (this.reconnectTimeoutID) return

    const me = this
    this.reconnectTimeoutID = setTimeout(() => {
      log('Socket attempting to reconnect')
      me.reconnectTimeoutID = undefined
      me.close()
      me.connect()
    }, 5000)
  }

  protected onSocketOpen(_event: Event) {
    log('Socket Connection established')
    this.dispatchEvent(new SocketOpenEvent())
  }

  protected onSocketMessage(event: MessageEvent) {
    log('Socket Message received', event.data)
    this.dispatchEvent(new SocketMessageEvent(event.data))
    if (!this.socket) return

    try {
      const requestBody = JSON.parse(event.data) as CrowdControlEffectRequestBody
      const { type } = requestBody

      if (type === EFFECT_REQUEST_TYPE.START) {
        this.dispatchEvent(new StartEffectRequestEvent(requestBody))
      } else if (type === EFFECT_REQUEST_TYPE.STOP) {
        this.dispatchEvent(new StopEffectRequestEvent(requestBody))
      }
    } catch (error) {
      log('Error parsing socket message', error)
      if (error instanceof Error) this.dispatchEvent(new SocketMessageErrorEvent(error))
    }
  }

  protected onSocketClose(event: CloseEvent) {
    const { wasClean, code, reason } = event
    log(`Connection closed ${wasClean ? 'cleanly' : 'not cleanly'} , code=${code} reason=${reason}`)

    this.dispatchEvent(new SocketCloseEvent(code, reason, wasClean))
    this.attemptReconnect()
  }

  protected onSocketError(error: Event) {
    log('Socket Error', error)
    this.dispatchEvent(new SocketErrorEvent(error))
    this.attemptReconnect()
  }

  public connect() {
    // Already have a socket connect?
    if (this.socket?.CONNECTING || this.socket?.OPEN) return

    // Was the socket initialized already? If so we should not create listeners again
    const initialized = !!this.socket

    log(`Connect was ${initialized ? 'already' : 'not'} initialized and is attempting a connection.`)
    this.socket = new WebSocket(this.url)

    if (!initialized) {
      const me = this
      this._onSocketOpen = this.onSocketOpen.bind(me)
      this._onSocketMessage = this.onSocketMessage.bind(me)
      this._onSocketClose = this.onSocketClose.bind(me)
      this._onSocketError = this.onSocketError.bind(me)

      this.socket.addEventListener('open', this._onSocketOpen)
      this.socket.addEventListener('message', this._onSocketMessage)
      this.socket.addEventListener('close', this._onSocketClose)
      this.socket.addEventListener('error', this._onSocketError)
    }
  }

  protected close() {
    if (this.socket?.CONNECTING || this.socket?.OPEN) {
      this.socket.close()
    }

    if (this.socket && this._onSocketOpen && this._onSocketMessage && this._onSocketClose && this._onSocketError) {
      this.socket.removeEventListener('open', this._onSocketOpen)
      this.socket.removeEventListener('message', this._onSocketMessage)
      this.socket.removeEventListener('close', this._onSocketClose)
      this.socket.removeEventListener('error', this._onSocketError)
    }

    this.socket = undefined
  }
}
