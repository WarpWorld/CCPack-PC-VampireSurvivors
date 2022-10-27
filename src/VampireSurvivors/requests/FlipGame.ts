import { CrowdControlTimedEffectRequest, RESPONSE_STATUS } from '../../CrowdControl'
import { getIsGamePaused, getIsPlayerDead } from '../VampireSurvivorsGameState'
import { addTimeout } from '../VampireSurvivorsEffectCollection'
import { EFFECT_CODES } from './EffectCodes'

const FLIP_TRANSFORM = 'scaleY(-1)'
export class FlipGame extends CrowdControlTimedEffectRequest {
  static override code = EFFECT_CODES.FLIP_GAME
  override code = FlipGame.code

  override start() {
    const isGamePaused = getIsGamePaused()
    const isPlayerDead = getIsPlayerDead()
    const { duration } = this.request

    if (isPlayerDead || !duration) return { status: RESPONSE_STATUS.FAILURE }
    if (isGamePaused) return { status: RESPONSE_STATUS.RETRY }

    const gameEl = document.getElementById('phaser-game')
    const canvasEl = gameEl?.querySelector('canvas')
    if (!canvasEl) return { status: RESPONSE_STATUS.FAILURE }

    const isFlipped = canvasEl.style.transform.includes(FLIP_TRANSFORM)
    if (isFlipped) return { status: RESPONSE_STATUS.RETRY }

    const clearFilter = () => {
      const transforms = canvasEl.style.transform.split(' ')
      canvasEl.style.transform = transforms.filter((t) => !t.includes(FLIP_TRANSFORM)).join(' ')
    }

    const applyFilter = () => {
      const transforms = canvasEl.style.transform.split(' ')
      transforms.push(FLIP_TRANSFORM)
      canvasEl.style.transform = transforms.join(' ')
    }

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
