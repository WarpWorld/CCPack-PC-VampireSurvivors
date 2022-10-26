import { CrowdControlInstantEffectRequest, RESPONSE_STATUS } from '../../CrowdControl'

import {
  addViewerEnemyGroup,
  getEnemyGroupClass,
  getGame,
  getIsGamePaused,
  getIsPlayerDead,
} from '../VampireSurvivorsGameState'
import { EFFECT_CODES } from './EffectCodes'

export class SpawnBoss extends CrowdControlInstantEffectRequest {
  static override code = EFFECT_CODES.SPAWN_BOSS
  override code = SpawnBoss.code

  trigger() {
    const Game = getGame()
    const EnemyGroupClass = getEnemyGroupClass()
    const isGamePaused = getIsGamePaused()
    const isPlayerDead = getIsPlayerDead()
    const { code, viewer } = this.request

    if (!Game || !EnemyGroupClass || !code || isPlayerDead) return { status: RESPONSE_STATUS.FAILURE }
    if (isGamePaused) return { status: RESPONSE_STATUS.RETRY }

    const PREFIX = SpawnBoss.code.replace('*', '')
    const enemyID = code.replace(PREFIX, '')

    const group = new EnemyGroupClass(Game.Core.Stage.scene, enemyID.toUpperCase())
    Game.Core.Stage.bossPools.unshift(group)
    Game.Core.Stage.SpawnBoss()
    Game.Core.Stage.bossPools.pop()
    if (viewer) addViewerEnemyGroup(group, viewer, true)

    return { status: RESPONSE_STATUS.SUCCESS }
  }
}
