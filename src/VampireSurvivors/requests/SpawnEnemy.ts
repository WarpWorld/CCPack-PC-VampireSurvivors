import { CrowdControlInstantEffectRequest, RESPONSE_STATUS } from '../../CrowdControl'

import {
  addViewerEnemyGroup,
  getEnemyGroupClass,
  getGame,
  getIsGamePaused,
  getIsPlayerDead,
} from '../VampireSurvivorsGameState'
import { addTimeout } from '../VampireSurvivorsEffectCollection'
import { EFFECT_CODES } from './EffectCodes'

export class SpawnEnemy extends CrowdControlInstantEffectRequest {
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
    addTimeout(this, () => (group.enabled = false), 10000)

    return { status: RESPONSE_STATUS.SUCCESS }
  }
}
