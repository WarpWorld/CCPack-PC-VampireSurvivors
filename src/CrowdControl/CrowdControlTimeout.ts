import { log } from './utils'

export class Timeout {
  protected _end: number
  protected _remaining: number
  protected _complete = false
  private pausedAt?: number

  constructor(readonly callback: () => void, readonly delay: number) {
    this._end = Date.now() + delay
    this._remaining = delay
  }

  get complete() {
    return this._complete
  }

  get remaining() {
    return this._remaining
  }

  public end() {
    log('Ending Timeout')
    this._complete = true
  }

  public pause() {
    if (this.pausedAt) return

    const now = Date.now()
    this.pausedAt = now
    this._remaining = Math.max(0, this._end - now)
    log(`Paused Timeout with ${this._remaining}ms remaining`)
  }

  public resume() {
    if (!this.pausedAt) return

    const now = Date.now()
    const delta = Math.max(0, now - this.pausedAt)
    this.pausedAt = undefined
    this._end += delta
    this._remaining = Math.max(0, this._end - now)

    log(`Resumed Timeout with ${this._remaining}ms remaining`)
  }

  public onTick(now: number) {
    if (this.pausedAt || this._complete) return

    if (now >= this._end) {
      this.callback()
      this.end()
    }
  }
}
