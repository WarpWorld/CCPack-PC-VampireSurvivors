import { TEXT_COLORS } from './VampireSurvivorsTextColors'
import { getGame, getIsGamePaused, getViewerEnemyGroups, pruneViewerEnemyGroups } from './VampireSurvivorsGameState'

const monitorViewerNames = () => {
  const Game = getGame()
  const viewerEnemyGroups = getViewerEnemyGroups()
  const isGamePaused = getIsGamePaused()

  if (!Game || isGamePaused || !viewerEnemyGroups.length) return

  const emptyViewerGroups: typeof viewerEnemyGroups = []
  for (const group of viewerEnemyGroups) {
    const { $viewer } = group

    group.children?.entries?.forEach?.((enemy) => {
      if (enemy.$viewer) {
        if (enemy.isDead) {
          enemy.$viewer.destroy()
          delete enemy.$viewer
        } else {
          enemy.$viewer.x = enemy.x
          enemy.$viewer.y = enemy.y - enemy.displayHeight - 10
        }
      } else if (!enemy.isDead) {
        enemy.$viewer = Game.Core.Stage.scene.add.text(enemy.x, enemy.y - enemy.displayHeight - 10, $viewer, {
          fontSize: '12px',
          backgroundColor: 'rgba(255,255,255,.65)',
          color: TEXT_COLORS[Math.floor(Math.random() * TEXT_COLORS.length)],
          padding: {
            x: 2,
            y: 2,
          },
          shadow: {
            color: '#000',
            offsetX: -1,
            offsetY: 1,
            fill: true,
          },
        })

        enemy.$viewer.setOrigin(0.5, 0.5)
        enemy.$viewer.setDepth(enemy.depth + 10000)
      }
    })

    // Normal Enemy spawns will create a pool and disable the pool after some time so only a few waves
    // are sent per purchase. However boss spawns are a single boss, so we do not need to toggle
    // enabled at all, just need to confirm there are no enemies left in the group
    if ((!group.enabled || group.$boss) && !group.children?.entries?.length) emptyViewerGroups.push(group)
  }

  // Lets clean up our pools a bit if they are empty
  for (const group of emptyViewerGroups) {
    const index = viewerEnemyGroups.indexOf(group)
    if (index > -1) viewerEnemyGroups.splice(index, 1)

    const pools = group.$boss ? Game?.Core.Stage.bossPools : Game?.Core.Stage.pools
    if (pools) {
      const index = pools.indexOf(group)
      if (index > -1) pools.splice(index, 1)
    }
  }

  pruneViewerEnemyGroups()
}

let intervalID: ReturnType<typeof setInterval>
const stop = () => clearInterval(intervalID)
export const viewerNameMonitor = {
  start() {
    stop()
    intervalID = setInterval(monitorViewerNames, 10)
  },
  stop,
}
