import { CrowdControlTimedEffectRequest, log, RESPONSE_STATUS } from '../../../CrowdControl'
import { getAllVisibleEnemies, getGame, getIsGamePaused, getIsPlayerDead } from '../../VampireSurvivorsState'
import type { VampireSurvivorsEnemy } from '../..'
import type { ICrowdControlTimedEffectRequest } from '../../../CrowdControl/requests/CrowdControlTimedEffectRequest'

export abstract class ChangeVisibleEnemiesScaleEffectRequest
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
    if (isGamePaused || ChangeVisibleEnemiesScaleEffectRequest.IS_ACTIVE) return { status: RESPONSE_STATUS.RETRY }

    // No enemies on screen 🤷
    const enemies = getAllVisibleEnemies()
    if (!enemies.length) return { status: RESPONSE_STATUS.RETRY }

    const effectedEnemies = new Set<typeof enemies[number]>()

    const resetEnemy = (enemy: VampireSurvivorsEnemy) => {
      if (enemy.$originalScale) {
        enemy.scale = enemy.$originalScale
        delete enemy.$originalScale
      }

      if (!enemy.$originalSpeed) {
        enemy.Die = enemy.__proto__.Die
        enemy.OnRecycle = enemy.__proto__.OnRecycle
      }
    }

    const clearEffect = () => {
      const enemies = Array.from(effectedEnemies)
      enemies.forEach(resetEnemy)

      ChangeVisibleEnemiesScaleEffectRequest.IS_ACTIVE = false
    }

    const applyEffectToEnemy = (enemy: VampireSurvivorsEnemy) => {
      if (enemy.$originalScale) return

      const { Die, OnRecycle } = enemy
      enemy.Die = () => {
        Die.call(enemy)
        resetEnemy(enemy)
      }

      enemy.OnRecycle = () => {
        OnRecycle.call(enemy)
        delete enemy.$originalScale
      }

      enemy.$originalScale = enemy.scale
      enemy.scale *= this.ratio
      effectedEnemies.add(enemy)
    }

    const applyEffect = () => {
      enemies.forEach(applyEffectToEnemy)
      ChangeVisibleEnemiesScaleEffectRequest.IS_ACTIVE = true
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
