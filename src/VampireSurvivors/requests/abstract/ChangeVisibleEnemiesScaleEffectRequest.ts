import { CrowdControlTimedEffectRequest, log, RESPONSE_STATUS } from '../../../CrowdControl'
import { getAllVisibleEnemies, getGame, getIsGamePaused, getIsPlayerDead } from '../../VampireSurvivorsGameState'
import { addTimeout } from '../../VampireSurvivorsEffectCollection'
import type { VampireSurvivorsEnemy } from '../..'

export abstract class ChangeVisibleEnemiesScaleEffectRequest extends CrowdControlTimedEffectRequest {
  static IS_ACTIVE = false
  ratio = 1

  override start() {
    const Game = getGame()
    const isGamePaused = getIsGamePaused()
    const isPlayerDead = getIsPlayerDead()
    const { duration } = this.request

    if (!Game || isPlayerDead || !duration) return { status: RESPONSE_STATUS.FAILURE }
    if (isGamePaused || ChangeVisibleEnemiesScaleEffectRequest.IS_ACTIVE) return { status: RESPONSE_STATUS.RETRY }

    // No enemies on screen 🤷
    const enemies = getAllVisibleEnemies()
    if (!enemies.length) return { status: RESPONSE_STATUS.RETRY }

    const clearEffect = () => {
      const enemies = getAllVisibleEnemies()
      enemies.forEach((enemy) => {
        enemy.scale = enemy.$originalScale || 1
        delete enemy.$originalScale
      })

      ChangeVisibleEnemiesScaleEffectRequest.IS_ACTIVE = false
    }

    const applyEffectToEnemy = (enemy: VampireSurvivorsEnemy) => {
      if (enemy.$originalScale) return
      const Die = enemy.Die
      enemy.Die = () => {
        Die.call(enemy)
        delete enemy.$originalScale
      }

      enemy.$originalScale = enemy.scale
      enemy.scale *= this.ratio
    }

    const applyEffect = () => {
      enemies.forEach(applyEffectToEnemy)
      ChangeVisibleEnemiesScaleEffectRequest.IS_ACTIVE = true
    }

    const updateEffect = () => {
      const enemies = getAllVisibleEnemies()
      enemies.forEach(applyEffectToEnemy)
    }

    const stop = (this.stop = () => {
      clearEffect()
      this.timeout?.clear()
    })

    applyEffect()
    this.timeout = addTimeout(this, () => stop(), duration, {
      onTick: () => updateEffect(),
    })

    return { status: RESPONSE_STATUS.SUCCESS, timeRemaining: duration }
  }
}
