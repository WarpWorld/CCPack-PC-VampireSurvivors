import { CrowdControlTimedEffectRequest, RESPONSE_STATUS } from '../../../CrowdControl'
import { getAllVisibleEnemies, getGame, getIsGamePaused, getIsPlayerDead } from '../../VampireSurvivorsState'
import type { VampireSurvivorsEnemy } from '../..'
import type { ICrowdControlTimedEffectRequest } from '../../../CrowdControl/requests/CrowdControlTimedEffectRequest'

export abstract class ChangeVisibleEnemiesSpeedEffectRequest
  extends CrowdControlTimedEffectRequest
  implements ICrowdControlTimedEffectRequest
{
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
    const effectedEnemies = new Set<typeof enemies[number]>()

    const resetEnemy = (enemy: VampireSurvivorsEnemy) => {
      if (enemy.$originalSpeed) {
        enemy.speed = enemy.$originalSpeed
        delete enemy.$originalSpeed
      }

      if (!enemy.$originalScale) {
        enemy.Die = enemy.__proto__.Die
        enemy.OnRecycle = enemy.__proto__.OnRecycle
      }
    }

    const clearEffect = () => {
      const enemies = Array.from(effectedEnemies)
      enemies.forEach(resetEnemy)

      ChangeVisibleEnemiesSpeedEffectRequest.IS_ACTIVE = false
    }

    const applyEffectToEnemy = (enemy: VampireSurvivorsEnemy) => {
      if (enemy.$originalSpeed) return

      const { Die, OnRecycle } = enemy
      enemy.Die = () => {
        Die.call(enemy)
        resetEnemy(enemy)
      }

      enemy.OnRecycle = () => {
        OnRecycle.call(enemy)
        delete enemy.$originalSpeed
      }

      enemy.$originalSpeed = enemy.speed
      enemy.speed *= this.ratio
      effectedEnemies.add(enemy)
    }

    const applyEffect = () => {
      enemies.forEach(applyEffectToEnemy)
      ChangeVisibleEnemiesSpeedEffectRequest.IS_ACTIVE = true
    }

    const updateEffect = () => {
      const enemies = getAllVisibleEnemies()
      enemies.forEach(applyEffectToEnemy)
    }

    this.stop = () => clearEffect()
    this.onTick = () => updateEffect()

    applyEffect()
    return { status: RESPONSE_STATUS.SUCCESS, timeRemaining: duration }
  }
}
