import type {
  VampireSurvivorsEnemy,
  VampireSurvivorsEnemyGroup,
  VampireSurvivorsEnemyGroupClass,
  VampireSurvivorsGame,
  VampireSurvivorsViewerEnemyGroup,
} from '.'

let Game: VampireSurvivorsGame | undefined
let EnemyGroupClass: VampireSurvivorsEnemyGroupClass | undefined
let viewerEnemyGroups: VampireSurvivorsViewerEnemyGroup[] = []

/* -------------------------------------------------------------------------- */
/*                                State Getters                               */
/* -------------------------------------------------------------------------- */
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
  const enemies = new Set<VampireSurvivorsEnemy>()

  const pools = [
    ...(Game?.Core.Stage.pools || []),
    ...(Game?.Core.Stage.bossPools || []),
    ...viewerEnemyGroups.filter((g) => !!g.$boss),
  ]

  pools.forEach((p) =>
    p.children?.entries?.forEach((c) => {
      if (c.isDead) return
      enemies.add(c)
    })
  )

  return Array.from(enemies)
}

export const reset = (game: VampireSurvivorsGame, enemyGroupClass: VampireSurvivorsEnemyGroupClass) => {
  Game = game
  EnemyGroupClass = enemyGroupClass
  viewerEnemyGroups = []
}
