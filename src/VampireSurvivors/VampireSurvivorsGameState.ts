import type {
  VampireSurvivorsEnemy,
  VampireSurvivorsEnemyGroup,
  VampireSurvivorsEnemyGroupClass,
  VampireSurvivorsGame,
  VampireSurvivorsViewerEnemyGroup,
} from '.'

import { clearAll } from './VampireSurvivorsEffectCollection'

let Game: VampireSurvivorsGame | undefined
let EnemyGroupClass: VampireSurvivorsEnemyGroupClass | undefined
let viewerEnemyGroups: VampireSurvivorsViewerEnemyGroup[] = []

export const getGame = () => Game
export const getEnemyGroupClass = () => EnemyGroupClass
export const getViewerEnemyGroups = () => viewerEnemyGroups

export const doesPlayerExists = () => !!Game?.Core.Player
export const getIsPlayerDead = () => !!Game?.Core.Player.isDead
export const getIsPlayerActive = () => !!Game?.Core.Player.active
export const getIsGamePaused = () =>
  !Game?.Core.SceneManager.MainScene.sys.isActive() || !!Game?.Core.SceneManager.MainScene.sys.isPaused()

export const getIsMainSceneActive = () => !!Game?.Core.SceneManager.MainScene.sys.isActive()
export const getIsGameOverSceneActive = () => !!Game?.Core.SceneManager.GameOverScene.sys.isActive()
export const getIsPostGameSceneActive = () => !!Game?.Core.SceneManager.PostGameScene.sys.isActive()
export const getIsUIMainMenuSceneActive = () => !!Game?.Core.SceneManager.UI_mainMenu.sys.isActive()

export const addViewerEnemyGroup = (group: VampireSurvivorsEnemyGroup, viewer: string, boss?: boolean) =>
  viewerEnemyGroups.push({ ...group, $viewer: viewer, $boss: boss })

export const removeViewerEnemyGroup = (group: VampireSurvivorsViewerEnemyGroup) =>
  viewerEnemyGroups.splice(viewerEnemyGroups.indexOf(group), 1)

export const pruneViewerEnemyGroups = () => (viewerEnemyGroups = viewerEnemyGroups.filter((g) => g.active && g.enabled))

// Helper function to target all enemies currently on the screen
export const getAllVisibleEnemies = () => {
  const enemies: VampireSurvivorsEnemy[] = []
  Game?.Core.Stage.pools.forEach((p) =>
    p.children?.entries?.forEach((c) => {
      if (c.isDead) return
      enemies.push(c)
    })
  )

  viewerEnemyGroups.forEach((g) => {
    if (!g.$boss) return
    g.children?.entries?.forEach((c) => {
      if (c.isDead) return
      enemies.push(c)
    })
  })

  return enemies
}

const reset = () => {
  viewerEnemyGroups = []
  clearAll()
}

export const init = (game: VampireSurvivorsGame, enemyGroupClass: VampireSurvivorsEnemyGroupClass) => {
  Game = game
  EnemyGroupClass = enemyGroupClass
  reset()
}
