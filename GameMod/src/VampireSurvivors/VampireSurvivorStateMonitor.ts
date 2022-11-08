import { log } from '../CrowdControl'
import { getIsGamePaused, getIsPostGameSceneActive, getIsUIMainMenuSceneActive } from './VampireSurvivorsState'

export const VampireSurvivorStateMonitorEventTypes = {
  GAME_PAUSED: 'GAME_PAUSED',
  GAME_RESUMED: 'GAME_RESUMED',
  GAME_ENDED: 'GAME_ENDED',
} as const
export class VampireSurvivorStateMonitor extends EventTarget {
  private intervalID?: ReturnType<typeof setInterval>
  private _paused: boolean = false
  private _gameEnded: boolean = false

  public start() {
    if (this.intervalID) return

    const me = this
    this.intervalID = setInterval(() => me.onTick(), 10)
  }

  public stop() {
    clearInterval(this.intervalID)
    this.intervalID = undefined
  }

  public reset() {
    this._gameEnded = false
    this.stop()
    this.start()
  }

  protected onTick = () => {
    const isGamePaused = getIsGamePaused()
    const isUIMainMenuSceneActive = getIsUIMainMenuSceneActive()
    const isPostGameSceneActive = getIsPostGameSceneActive()

    if (isGamePaused && !this._paused) {
      log('StateMonitor: Game Paused')
      this._paused = true
      this.dispatchEvent(new Event(VampireSurvivorStateMonitorEventTypes.GAME_PAUSED))
    } else if (!isGamePaused && this._paused) {
      log('StateMonitor: Game Resumed')
      this._paused = false
      this.dispatchEvent(new Event(VampireSurvivorStateMonitorEventTypes.GAME_RESUMED))
    }

    if (!this._gameEnded && (isUIMainMenuSceneActive || isPostGameSceneActive)) {
      log('StateMonitor: Game Ended')
      this._gameEnded = true
      this.dispatchEvent(new Event(VampireSurvivorStateMonitorEventTypes.GAME_ENDED))
      this.stop()
    }
  }
}
