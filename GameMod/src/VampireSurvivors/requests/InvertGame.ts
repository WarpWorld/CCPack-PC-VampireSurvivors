import { CrowdControlTimedEffectRequest, RESPONSE_STATUS } from '../../CrowdControl'
import { getIsGamePaused, getIsPlayerDead } from '../VampireSurvivorsState'
import { EFFECT_CODES } from './EffectCodes'
import type { ICrowdControlTimedEffectRequest } from '../../CrowdControl/requests/CrowdControlTimedEffectRequest'

const INVERT_TRANSFORM = 'scaleX(-1)'
export class InvertGame extends CrowdControlTimedEffectRequest implements ICrowdControlTimedEffectRequest {
  static override code = EFFECT_CODES.INVERT_GAME
  override code = InvertGame.code

  override start() {
    const isGamePaused = getIsGamePaused()
    const isPlayerDead = getIsPlayerDead()
    const { duration } = this.request

    if (!duration || isPlayerDead) return { status: RESPONSE_STATUS.FAILURE }
    if (isGamePaused) return { status: RESPONSE_STATUS.RETRY }

    const gameEl = document.getElementById('phaser-game')
    const canvasEl = gameEl?.querySelector('canvas')
    if (!canvasEl) return { status: RESPONSE_STATUS.FAILURE }

    const isInverted = canvasEl.style.transform.includes(INVERT_TRANSFORM)
    if (isInverted) return { status: RESPONSE_STATUS.RETRY }

    const clearFilter = () => {
      const transforms = canvasEl.style.transform.split(' ')
      canvasEl.style.transform = transforms.filter((t) => !t.includes(INVERT_TRANSFORM)).join(' ')
    }
    const applyFilter = () => {
      const transforms = canvasEl.style.transform.split(' ')
      transforms.push(INVERT_TRANSFORM)
      canvasEl.style.transform = transforms.join(' ')
    }

    this.stop = () => clearFilter()
    this.onPause = () => clearFilter()
    this.onResume = () => applyFilter()

    applyFilter()
    return { status: RESPONSE_STATUS.SUCCESS, timeRemaining: duration }
  }
}
