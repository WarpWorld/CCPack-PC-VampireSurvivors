const _log = console.log

let enabled = true
export const log = (...args: any[]) => {
  if (!enabled) return
  _log(`[CrowdControl]`, ...args)
}

export const setLogEnabled = (value: boolean) => (enabled = value)
