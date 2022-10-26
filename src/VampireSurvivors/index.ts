import type internal from 'stream'

export { bootstrap } from './bootstrap'
export * from './VampireSurvivorsCrowdControl'

/* -------------------------------------------------------------------------- */
/*                           Vampire Survivors Types                          */
/* -------------------------------------------------------------------------- */

export type VampireSurvivorsPhaserTweenConfig = {
  targets: VampireSurvivorsPhaserEntity | VampireSurvivorsPhaserEntity[]
  ease?: string
  scale?: number
  duration: number
  delay?: number
  onComplete?: () => void
}

export type VampireSurvivorsScene = {
  add: {
    text: (x: number, y: number, text: string, props: any) => VampireSurvivorsPhaserEntity
    tween: (config: VampireSurvivorsPhaserTweenConfig) => void
  }
  create: () => void
  Show: () => void
  renderer: {
    width: number
    height: number
  }
  sys: {
    isPaused: () => boolean
    isActive: () => boolean
  }
  children: {
    removeAll: () => void
  }
  tweens: {
    add: (config: VampireSurvivorsPhaserTweenConfig) => void
  }
  cameras?: {
    main: {
      zoomTo: (zoom: number) => void
      flashEffect: {
        start: (duration: number, red: number, green: number, blue: number) => void
      }
      shakeEffect: {
        start: (duration: number) => void
      }
    }
  }
}

type VampireSurvivorsPhaserEntity = {
  x: number
  y: number
  scale: number
  displayWidth: number
  displayHeight: number
  depth: number
  removeFromDisplayList: () => void
  setDepth: (depth: number) => void
  destroy: () => void
  setOrigin: (originX: number, originY: number) => void
  setX: (x: number) => void
  setY: (y: number) => void
  setScale: (scale: number) => void
  setRotation: (rotation: number) => void
}

export type VampireSurvivorsEnemy = VampireSurvivorsPhaserEntity & {
  $originalScale?: number
  $originalSpeed?: number
  speed: number
  isDead: boolean
  enemyType: string
  Die: () => void
}

export type VampireSurvivorsViewerEnemy = VampireSurvivorsEnemy & {
  $viewer?: VampireSurvivorsPhaserEntity
}

export type VampireSurvivorsEnemyGroupClass = {
  new (scene: VampireSurvivorsScene, id: string): VampireSurvivorsEnemyGroup
}

type VampireSurvivorsEnemyGroupBase = {
  active: boolean
  enabled: boolean
}

export type VampireSurvivorsEnemyGroup = VampireSurvivorsEnemyGroupBase & {
  children?: {
    entries?: VampireSurvivorsEnemy[]
  }
}

export type VampireSurvivorsViewerEnemyGroup = VampireSurvivorsEnemyGroupBase & {
  $boss?: boolean
  $viewer: string
  children?: {
    entries?: VampireSurvivorsViewerEnemy[]
  }
}

export type VampireSurvivorsGame = {
  Core: {
    AddWeapon: (weapon: string) => void
    CurrentBGM: string
    GetWeaponLevel: (level: number) => void
    RemoveWeapon: (weapon: string) => void
    LevelWeaponUp: (weapon: string) => void
    MakePickup: (x: number, y: number, item: string) => VampireSurvivorsPhaserEntity
    Weapons: {
      bulletType: string,
      level: number,
      amount: number
    }[]
    GoldFever: {
      defaultCap: number
      isActive: boolean
      Start: (duration: number) => void
    }
    Player: VampireSurvivorsPhaserEntity & {
      invulTime: number
      revivals: number
      IsInvul: boolean
      GetDamaged: (amount: number) => void
      RecoverHp: (amount: number, showText: boolean) => void
      SetInvulForMilliSeconds: (time: number) => void
      Die: () => void
      moveSpeed: number
      isDead: boolean
      active: boolean
      hp: number
      maxHp: number
    }
    PlayerOptions: {
      exportGameData: () => void
    }
    scene: VampireSurvivorsScene
    SceneManager: {
      GameOverScene: VampireSurvivorsScene & {
        canSeeReviveButton: boolean
        QuitButton: VampireSurvivorsPhaserEntity
        ReviveButton: VampireSurvivorsPhaserEntity
      }
      UI_mainMenu: VampireSurvivorsScene
      PostGameScene: VampireSurvivorsScene
      MainScene: VampireSurvivorsScene
    }
    Stage: {
      SpawnBoss: () => void
      pools: VampireSurvivorsEnemyGroup[]
      bossPools: VampireSurvivorsEnemyGroup[]
      scene: VampireSurvivorsScene
    }
  }
  Lang: {
    FONTFAMILY: string
  }
  Sound: {
    currentBGMObj?: {
      currentVolume: number
    }
    musicLibrary: string[]
    StopMusic: (key: string) => void
    PlayMusic: (key: string, { volume, loop }: { volume: number; loop: boolean }) => void
  }
}

export type VampireSurvivorsPhaserInitEventDetails = {
  Info: {
    VSVERSION: string
    GM: Partial<VampireSurvivorsGame>
  }
}

export type VampireSurvivorsGameInitEventDetails = {
  data: {
    VSVERSION: string
    GM: VampireSurvivorsGame
  }
  EnemyGroupClass: VampireSurvivorsEnemyGroupClass
}
