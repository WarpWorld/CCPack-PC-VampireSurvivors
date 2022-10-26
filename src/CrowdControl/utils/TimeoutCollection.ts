import { log } from './log'

type Timeout = {
  callback: () => void
  clear: () => void
  complete: boolean
  start: number
  end: number
  onTick?: () => void
  onPause?: (remaining: number) => void
  onResume?: (remaining: number) => void
}

export const createTimeoutCollection = (interval = 500) => {
  let pausedAt: number | undefined
  let timeouts: Timeout[] = []

  const addTimeout = (
    callback: () => void,
    delay: number,
    {
      onTick,
      onPause,
      onResume,
    }: {
      onTick?: () => void
      onPause?: (remaining: number) => void
      onResume?: (remaining: number) => void
    } = {}
  ) => {
    const now = Date.now()
    let _complete = false
    const timeout: Timeout = {
      callback,
      get complete() {
        return _complete
      },
      clear() {
        _complete = true
      },
      start: now,
      end: now + delay,
      onPause,
      onResume,
      onTick,
    }
    timeouts.push(timeout)
    return timeout
  }

  const pause = () => {
    if (pausedAt) return
    const now = Date.now()

    timeouts.forEach((timeout) => {
      if (timeout.complete) return
      timeout.onPause?.(timeout.end - now)
    })
    pausedAt = now
  }

  const resume = () => {
    if (!pausedAt) return

    const now = Date.now()
    const delta = now - pausedAt
    pausedAt = undefined

    timeouts.forEach((timeout) => {
      if (timeout.complete) return
      timeout.end += delta
      timeout.onResume?.(timeout.end - now)
    })
  }

  const tick = () => {
    if (pausedAt) return

    const now = Date.now()
    timeouts.forEach((timeout) => {
      if (timeout.complete) return
      timeout.onTick?.()
      if (now >= timeout.end) {
        timeout.clear()
        timeout.callback()
      }
    })

    timeouts = timeouts.filter((timeout) => !timeout.complete)
  }

  const clearAll = (executeCallbacks: boolean = true) => {
    if (executeCallbacks) {
      timeouts.forEach((timeout) => {
        if (timeout.complete) return
        timeout.clear()
        try {
          timeout.callback()
        } catch (e) {}
      })
    }

    timeouts.length = 0
  }

  const destroy = (executeCallbacks: boolean = true) => {
    clearAll(executeCallbacks)
    pausedAt = undefined
    clearInterval(intervalID)
  }

  const intervalID = setInterval(tick, interval)
  return {
    addTimeout,
    clearAll,
    destroy,
    pause,
    resume,
    getIsPaused() {
      return !!pausedAt
    },
  }
}
