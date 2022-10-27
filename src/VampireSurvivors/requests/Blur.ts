import { CrowdControlEffectRequestHandler, CrowdControlTimedEffectRequest, RESPONSE_STATUS } from '../../CrowdControl'
import { getIsGamePaused, getIsPlayerDead } from '../VampireSurvivorsGameState'
import { addTimeout } from '../VampireSurvivorsEffectCollection'
import { EFFECT_CODES } from './EffectCodes'

const BLUR_FILTER = 'blur(20px)'
export class Blur extends CrowdControlTimedEffectRequest {
  static override code = EFFECT_CODES.BLUR

  override code = Blur.code

  override start(): ReturnType<CrowdControlEffectRequestHandler> {
    const isGamePaused = getIsGamePaused()
    const isPlayerDead = getIsPlayerDead()
    const { duration } = this.request

    if (isPlayerDead || !duration) return { status: RESPONSE_STATUS.FAILURE }
    if (isGamePaused) return { status: RESPONSE_STATUS.RETRY }

    const gameEl = document.getElementById('phaser-game')
    if (!gameEl) return { status: RESPONSE_STATUS.FAILURE }

    const hasBlur = gameEl.style.filter === BLUR_FILTER
    if (hasBlur) return { status: RESPONSE_STATUS.RETRY }

    const clearFilter = () => (gameEl.style.filter = '')
    const applyFilter = () => (gameEl.style.filter = BLUR_FILTER)

    const stop = (this.stop = () => {
      this.timeout?.clear()
      clearFilter()
    })

    applyFilter()
    this.timeout = addTimeout(this, () => stop(), duration, {
      onPause: () => clearFilter(),
      onResume: () => applyFilter(),
    })

    return { status: RESPONSE_STATUS.SUCCESS, timeRemaining: duration }
  }
}
