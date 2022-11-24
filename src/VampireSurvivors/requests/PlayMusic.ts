import { CrowdControlInstantEffectRequest, RESPONSE_STATUS } from '../../CrowdControl'
import type { ICrowdControlInstantEffectRequest } from '../../CrowdControl/requests/CrowdControlInstantEffectRequest'

import { getGame, getIsGamePaused, getIsPlayerDead } from '../VampireSurvivorsState'
import { EFFECT_CODES } from './EffectCodes'

export class PlayMusic extends CrowdControlInstantEffectRequest implements ICrowdControlInstantEffectRequest {
  static override code = EFFECT_CODES.PLAY_MUSIC
  override code = PlayMusic.code

  trigger() {
    const Game = getGame()
    const isGamePaused = getIsGamePaused()
    const isPlayerDead = getIsPlayerDead()
    const { code } = this.request

    if (!Game || !code || isPlayerDead) return { status: RESPONSE_STATUS.FAILURE }
    if (isGamePaused) return { status: RESPONSE_STATUS.RETRY }

    const PREFIX = PlayMusic.code.replace('*', '')
    const songID = code.replace(PREFIX, '')
    const key = Object.keys(Game.Sound.musicLibrary).find((k) => k.toLowerCase() === songID.toLowerCase())

    if (!key) return { status: RESPONSE_STATUS.FAILURE, message: `Unknown SongID "${songID}"` }

    if (key) {
      const volume = Game.Sound.currentBGMObj?.currentVolume || 0.5
      Game.Sound.StopMusic(Game.Core.CurrentBGM)

      if (key !== 'NONE') {
        Game.Core.CurrentBGM = key
        Game.Sound.PlayMusic(key, { volume, loop: true })
      }
    }
    return { status: RESPONSE_STATUS.SUCCESS }
  }
}
