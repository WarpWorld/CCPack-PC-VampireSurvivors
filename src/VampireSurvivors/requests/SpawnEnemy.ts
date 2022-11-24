import { CrowdControlInstantEffectRequest, RESPONSE_STATUS } from '../../CrowdControl'

import type { ICrowdControlInstantEffectRequest } from '../../CrowdControl/requests/CrowdControlInstantEffectRequest'
import {
  addViewerEnemyGroup,
  getEnemyGroupClass,
  getGame,
  getIsGamePaused,
  getIsPlayerDead,
} from '../VampireSurvivorsState'
import { EFFECT_CODES } from './EffectCodes'

export class SpawnEnemy extends CrowdControlInstantEffectRequest implements ICrowdControlInstantEffectRequest {
  static override code = EFFECT_CODES.SPAWN_ENEMY
  override code = SpawnEnemy.code

  trigger() {
    const Game = getGame()
    const EnemyGroupClass = getEnemyGroupClass()
    const isGamePaused = getIsGamePaused()
    const isPlayerDead = getIsPlayerDead()
    const { code, viewer } = this.request

    if (!Game || !EnemyGroupClass || !code || isPlayerDead) return { status: RESPONSE_STATUS.FAILURE }
    if (isGamePaused) return { status: RESPONSE_STATUS.RETRY }

    const PREFIX = SpawnEnemy.code.replace('*', '')
    const enemyID = code.replace(PREFIX, '')

    const group = new EnemyGroupClass(Game.Core.Stage.scene, enemyID.toUpperCase())
    Game.Core.Stage.pools.push(group)
    if (viewer) addViewerEnemyGroup(group, viewer)

    // Leave Enemies in Spawn pool for 10 seconds
    // If the game is paused when we go to remove them
    // we will give the enemies another 5 seconds incase the player is in a
    // paused state for the length of the effect
    // We will only do this five times before we just remove them
    let stopCount = 0
    const stop = () => {
      const isGamePaused = getIsGamePaused()

      stopCount++
      if (isGamePaused && stopCount <= 5) {
        setTimeout(stop, 5000)
      } else {
        group.enabled = false
      }
    }
    setTimeout(stop, 10000)

    return { status: RESPONSE_STATUS.SUCCESS }
  }
}
