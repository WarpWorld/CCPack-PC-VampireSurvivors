import { CrowdControlTimedEffectRequest, RESPONSE_STATUS } from '../../CrowdControl'
import type { ICrowdControlTimedEffectRequest } from '../../CrowdControl/requests/CrowdControlTimedEffectRequest'
import { getIsGamePaused, getIsPlayerDead } from '../VampireSurvivorsState'
import { EFFECT_CODES } from './EffectCodes'

const BLUR_FILTER = 'blur(20px)'
export class Blur extends CrowdControlTimedEffectRequest implements ICrowdControlTimedEffectRequest {
  static override code = EFFECT_CODES.BLUR

  override code = Blur.code

  override start() {
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

    this.stop = () => clearFilter()
    this.onPause = () => clearFilter()
    this.onResume = () => applyFilter()

    applyFilter()

    return { status: RESPONSE_STATUS.SUCCESS, timeRemaining: duration }
  }
}
