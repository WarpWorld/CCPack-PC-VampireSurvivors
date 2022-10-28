import type { CrowdControlEffectRequestBody } from '../CrowdControlWebSocketClient'

export abstract class CrowdControlBaseEffectRequest {
  static readonly code: string = '#UNSET#'
  static readonly conflicts: string[] = []

  constructor(readonly request: CrowdControlEffectRequestBody) {}
  abstract readonly code: string
  overlayPrefix: string = ''
}
