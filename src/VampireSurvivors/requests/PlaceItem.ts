import { CrowdControlInstantEffectRequest, randomFromRange, randomSign, RESPONSE_STATUS } from '../../CrowdControl'
import { getGame, getIsGamePaused, getIsPlayerDead } from '../VampireSurvivorsGameState'
import { TEXT_COLORS } from '../VampireSurvivorsTextColors'
import { EFFECT_CODES } from './EffectCodes'

export class PlaceItem extends CrowdControlInstantEffectRequest {
  static override code = EFFECT_CODES.PLACE_ITEM
  override code = PlaceItem.code

  override trigger() {
    const Game = getGame()
    const isGamePaused = getIsGamePaused()
    const isPlayerDead = getIsPlayerDead()
    const { code, viewer } = this.request

    if (!Game || !code || isPlayerDead) return { status: RESPONSE_STATUS.FAILURE }
    if (isGamePaused) return { status: RESPONSE_STATUS.RETRY }

    const PREFIX = PlaceItem.code.replace('*', '')
    const itemID = code.replace(PREFIX, '').toUpperCase()

    const xRange = Game.Core.scene.renderer.width / 2
    const yRange = Game.Core.scene.renderer.height / 2
    const xOffset = randomFromRange(100, xRange - 25) * randomSign()
    const yOffset = randomFromRange(100, yRange - 25) * randomSign()
    const x = Game.Core.Player.x + xOffset
    const y = Game.Core.Player.y + yOffset
    const item = Game.Core.MakePickup(x, y, itemID)
    item.setOrigin(0.5, 0.5)

    if (viewer) {
      const text = Game.Core.Stage.scene.add.text(x, y - item.displayHeight - 5, viewer, {
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
      text.setDepth(item.depth + 10000)
      text.setOrigin(0.5, 0.5)

      setTimeout(() => {
        Game.Core.Stage?.scene?.add?.tween({
          targets: text,
          scale: 0,
          duration: 250,
          onComplete: () => text.removeFromDisplayList(),
        })
      }, 5000)
    }

    return { status: RESPONSE_STATUS.SUCCESS }
  }
}
