import type { Timeout } from './CrowdControlTimeout'
import { log } from './utils/log'

export class CrowdControlTimeoutCollection extends EventTarget {
  intervalID: ReturnType<typeof setInterval>
  pausedAt: number | undefined
  timeouts: Timeout[] = []
  onPause: (() => void) | undefined
  onResume: (() => void) | undefined
  onTick: (() => void) | undefined

  constructor({
    interval,
    onPause,
    onResume,
    onTick,
  }: {
    interval?: number
    onPause?: () => void
    onResume?: () => void
    onTick?: () => void
  } = {}) {
    super()

    const me = this

    interval = interval || 500
    this.intervalID = setInterval(() => me._onTick(), interval)
    this.onPause = onPause
    this.onResume = onResume
    this.onTick = onTick
  }

  public isPaused() {
    return this.pausedAt !== undefined
  }

  public addTimeout(timeout: Timeout) {
    this.timeouts.push(timeout)
  }

  public pause() {
    if (this.pausedAt) return
    log('Pausing Timeout Collection')
    const now = Date.now()
    this.pausedAt = now

    this.timeouts.forEach((timeout) => timeout.pause())

    // Its important to call this after the timeouts are paused, because
    // the onPause callback may check if the timeouts are paused.
    this.onPause?.()
  }

  public resume() {
    if (!this.pausedAt) return
    log('Resuming Timeout Collection')

    this.pausedAt = undefined
    this.timeouts.forEach((timeout) => timeout.resume())

    // Its important to call this after the timeouts are resumed, because
    // the onResume callback may check the remaining time of the timeouts.
    this.onResume?.()
  }

  public reset() {
    log('Resetting Timeout Collection')
    this.timeouts.forEach((timeout) => {
      log('Calling Callback for Timeout', timeout.callback)
      timeout.callback()
      timeout.end()
    })

    this.timeouts.length = 0
    this.pausedAt = undefined
  }

  public destroy() {
    log('DESTROY WAS CALLED FOR TIMEOUT COLLECTION')

    this.reset()
    clearInterval(this.intervalID)
    this.pausedAt = undefined
    this.onPause = undefined
    this.onResume = undefined
    this.onTick = undefined
  }

  protected _onTick() {
    if (this.pausedAt) return

    this.timeouts = this.timeouts.filter((timeout) => !timeout.complete)

    const now = Date.now()
    this.timeouts.forEach((timeout) => timeout.onTick(now))

    if (this.timeouts.length !== 0) log('Timeouts remaining: ', this.timeouts.length)
    this.onTick?.()
  }
}
