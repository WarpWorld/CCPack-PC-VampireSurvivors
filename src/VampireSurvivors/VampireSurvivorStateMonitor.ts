import {
  getIsGameOverSceneActive,
  getIsGamePaused,
  getIsUIMainMenuSceneActive,
  getIsMainSceneActive,
  getIsPostGameSceneActive,
} from './VampireSurvivorsGameState'
import { destroy, getIsPaused, pause, resume } from './VampireSurvivorsEffectCollection'
import { viewerNameMonitor } from './VampireSurvivorViewerNameMonitor'

let active = false

let intervalID: ReturnType<typeof setInterval>
const stop = () => {
  active = false
  clearInterval(intervalID)
}

const monitorState = () => {
  const isGamePaused = getIsGamePaused()
  const areTimedEffectsPaused = getIsPaused()
  const isUIMainMenuSceneActive = getIsUIMainMenuSceneActive()
  const isPostGameSceneActive = getIsPostGameSceneActive()

  if (isGamePaused && !areTimedEffectsPaused) {
    pause()
  } else if (!isGamePaused && areTimedEffectsPaused) {
    resume()
  }

  if (active && (isUIMainMenuSceneActive || isPostGameSceneActive)) {
    destroy()
    stop()
    viewerNameMonitor.stop()
  }
}

export const stateMonitor = {
  start() {
    stop()
    active = true
    intervalID = setInterval(monitorState, 100)
  },
  stop,
}
