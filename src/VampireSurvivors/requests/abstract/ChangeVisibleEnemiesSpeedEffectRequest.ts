import { CrowdControlTimedEffectRequest, RESPONSE_STATUS } from '../../../CrowdControl'
import { getAllVisibleEnemies, getGame, getIsGamePaused, getIsPlayerDead } from '../../VampireSurvivorsGameState'
import { addTimeout } from '../../VampireSurvivorsEffectCollection'
import type { VampireSurvivorsEnemy } from '../..'

export abstract class ChangeVisibleEnemiesSpeedEffectRequest extends CrowdControlTimedEffectRequest {
  static IS_ACTIVE = false
  ratio = 1

  override start() {
    const Game = getGame()
    const isGamePaused = getIsGamePaused()
    const isPlayerDead = getIsPlayerDead()
    const { duration } = this.request

    if (!Game || isPlayerDead || !duration) return { status: RESPONSE_STATUS.FAILURE }
    if (isGamePaused || ChangeVisibleEnemiesSpeedEffectRequest.IS_ACTIVE) return { status: RESPONSE_STATUS.RETRY }

    // No enemies on screen 🤷
    const enemies = getAllVisibleEnemies()
    if (!enemies.length) return { status: RESPONSE_STATUS.RETRY }

    const clearEffect = () => {
      const enemies = getAllVisibleEnemies()
      enemies.forEach((enemy) => {
        enemy.speed = enemy.$originalSpeed || 1
        delete enemy.$originalSpeed
      })

      ChangeVisibleEnemiesSpeedEffectRequest.IS_ACTIVE = false
    }

    const applyEffectToEnemy = (enemy: VampireSurvivorsEnemy) => {
      if (enemy.$originalSpeed) return
      const Die = enemy.Die
      enemy.Die = () => {
        Die.call(enemy)
        delete enemy.$originalSpeed
      }

      enemy.$originalSpeed = enemy.speed
      enemy.speed *= this.ratio
    }

    const applyEffect = () => {
      enemies.forEach(applyEffectToEnemy)
      ChangeVisibleEnemiesSpeedEffectRequest.IS_ACTIVE = true
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
